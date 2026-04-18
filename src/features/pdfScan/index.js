/**
 * @file index.js
 * @desc Entry point điều phối phân tích AI và Queue UI.
 *       Móc nối File -> API -> UI Confirm -> Thêm vào bảng.
 */
import { AppState } from '../../core/state.js';
import { Storage } from '../../utils/storage.js';
import { SK_GEMINI_KEY, SK_GEMINI_MODEL, SK_RAW_SCAN, REQUIRED_KEYS, DEFAULT_LABELS } from '../../core/constants.js';
import { fileToBase64, extractWithGemini } from './geminiOcr.js';
import { showPdfConfirmDialog, showPdfLoading, hidePdfLoading } from './pdfScanUI.js';
import { addOrUpdateFieldRow, saveFieldsToLocal, syncAllFields } from '../fieldsManager.js';
import { showToast } from '../../ui/toast.js';
import { createInternalBackup, generateBackupName } from '../../utils/backupHelper.js';
import { extractFieldsFromText, extractFieldsLocally } from '../rawScan/rawScan.js';
import { MAIL_BRIDGE_KEY } from '../mailScan/mailScanner.js';
import { BridgeStore } from '../../utils/bridgeStore.js';
import { scrapeScreenText } from '../screenScan/screenScanner.js';
import { downloadAsBase64 } from '../../utils/fileHelper.js';
import { extractQRCodeFromImage, parseCCCD_QR } from '../../utils/qrHelper.js';
import { parseAddressComponents } from '../../utils/stringHelper.js';

let fileQueue = [];

function renderQueue(queueList, placeholder) {
    // Tối ưu: Dùng DocumentFragment để tránh reflow liên tục
    const fragment = document.createDocumentFragment();
    
    if (fileQueue.length === 0) {
        queueList.innerHTML = '';
        placeholder.style.display = 'flex';
        return;
    }
    placeholder.style.display = 'none';
    
    fileQueue.forEach((item, index) => {
        const el = document.createElement('div');
        el.className = 'ai-queue-item';
        
        if (item.mimeType && item.mimeType.startsWith('image/')) {
            const img = document.createElement('img');
            // Tối ưu: Ưu tiên dùng previewUrl (Blob) thay vì chuỗi Base64 khổng lồ
            img.src = item.previewUrl || `data:${item.mimeType};base64,${item.base64}`;
            img.loading = "lazy"; // Tiết kiệm tài nguyên
            el.appendChild(img);
        } else {
            const span = document.createElement('span');
            span.className = 'file-icon';
            span.textContent = item.mimeType === 'application/pdf' ? '📕' : '📄';
            el.appendChild(span);
        }

        const rmBtn = document.createElement('button');
        rmBtn.className = 'btn-remove-item';
        rmBtn.innerHTML = '✖';
        rmBtn.onclick = (e) => {
            e.stopPropagation();
            if (item.previewUrl) URL.revokeObjectURL(item.previewUrl); // Giải phóng bộ nhớ
            fileQueue.splice(index, 1);
            renderQueue(queueList, placeholder);
        };
        el.appendChild(rmBtn);
        fragment.appendChild(el);
    });

    queueList.innerHTML = '';
    queueList.appendChild(fragment);
}

function clearQueue(queueList, placeholder, rawInput) {
    fileQueue = [];
    rawInput.value = '';
    renderQueue(queueList, placeholder);
}

function applyQRDataToFields(parsed, sourceName) {
    showToast(`🎉 Tìm thấy QR CCCD: Đang tự động điền...`, "#1e8e3e");
    
    if (parsed.cccd) {
        addOrUpdateFieldRow('cccd', parsed.cccd);
        addOrUpdateFieldRow('cmnd', parsed.cccd);
        addOrUpdateFieldRow('cccdCustomer', parsed.cccd);
        addOrUpdateFieldRow('cmndCustomer', parsed.cccd);
    }
    if (parsed.name) {
        addOrUpdateFieldRow('tenCustomer', parsed.name);
        addOrUpdateFieldRow('nguoiDaiDien', parsed.name);
    }
    if (parsed.dob) {
        addOrUpdateFieldRow('ngaySinhCustomer', parsed.dob); 
    }
    if (parsed.gender) {
        addOrUpdateFieldRow('gioiTinhCustomer', parsed.gender);
    }
    if (parsed.address) {
        addOrUpdateFieldRow('diachiCustomer', parsed.address);
        addOrUpdateFieldRow('thuongTruCustomer', parsed.address);
        
        const addrParts = parseAddressComponents(parsed.address);
        if (addrParts.province) addOrUpdateFieldRow('tinhIdNew', addrParts.province);
        if (addrParts.district || addrParts.ward) addOrUpdateFieldRow('xaIdNew', addrParts.ward || addrParts.district);
        if (addrParts.street) addOrUpdateFieldRow('duong', addrParts.street);
    }
    if (parsed.issue_date) {
        addOrUpdateFieldRow('ngayCapCustomer', parsed.issue_date);
        addOrUpdateFieldRow('ngayCapSoDkdnCustomer', parsed.issue_date);
        addOrUpdateFieldRow('ngayCap', parsed.issue_date);
        addOrUpdateFieldRow('noiCapCustomer', 'Cục cảnh sát QLHC về TTXH');
        addOrUpdateFieldRow('noiCap', 'Cục cảnh sát quản lý hành chính về trật tự xã hội');
    }
    saveFieldsToLocal();
}

export function initPdfScan() {
    const btnAiMode = document.getElementById('vnpt-btn-ai-mode');
    const aiSection = document.getElementById('vnpt-ai-scanner-section');
    const btnProcessAI = document.getElementById('vnpt-btn-ai-process');
    const btnProcessLocal = document.getElementById('vnpt-btn-raw-process-local');
    const rawInput = document.getElementById('vnpt-raw-scan-input');
    const queueContainer = document.getElementById('vnpt-ai-queue-container');
    const queueList = document.getElementById('vnpt-ai-queue-list');
    const placeholder = document.getElementById('vnpt-ai-queue-placeholder');
    const btnShowPdf = document.getElementById('vnpt-btn-show-pdf');
    const btnClearQueue = document.getElementById('vnpt-btn-clear-queue');
    const inputPdf = document.getElementById('vnpt-pdf-input');

    if (!btnAiMode || !aiSection) return;

    btnAiMode.addEventListener('click', (e) => {
        e.preventDefault();
        const isHidden = aiSection.style.display === 'none';
        aiSection.style.display = isHidden ? 'flex' : 'none';
        btnAiMode.classList.toggle('active', isHidden);
    });

    // --- KHÔI PHỤC RAW TEXT TỪ STORAGE ---
    const savedRaw = Storage.get(SK_RAW_SCAN);
    if (savedRaw && rawInput) {
        rawInput.value = savedRaw;
    }

    // --- LƯU RAW TEXT KHI THAY ĐỔI ---
    if (rawInput) {
        rawInput.addEventListener('input', () => {
            Storage.setDebounced(SK_RAW_SCAN, rawInput.value, 1000);
        });
    }

    if (btnShowPdf) {
        btnShowPdf.addEventListener('click', (e) => {
            e.preventDefault();
            if (AppState.lastPdfResults && AppState.lastPdfResults.length > 0) {
                showPdfConfirmDialog(AppState.lastPdfResults, AppState.lastPdfRawText || "", (selectedResults) => {
                    const keysToSync = selectedResults.map(res => res.key);
                    selectedResults.forEach(res => {
                        addOrUpdateFieldRow(res.key, res.value, res.label);
                    });
                    saveFieldsToLocal();

                    // Tự động điền dữ liệu xuống form trang web sau khi lưu
                    if (keysToSync.length > 0) {
                        setTimeout(() => syncAllFields(keysToSync), 300);
                    }

                    showToast(`✅ Đã cập nhật ${selectedResults.length} trường.`);
                }, (newText) => {
                    try {
                        const refreshedFields = extractFieldsLocally(newText);
                        handleExtractionResults(refreshedFields, newText, 'KẾT QUẢ QUÉT (CẬP NHẬT)');
                    } catch (err) {
                        showToast("❌ Lỗi: " + err.message, "#ef4444");
                    }
                });
            } else if (rawInput && rawInput.value.trim()) {
                // Nếu chưa có cache kết quả nhưng có text ở ô input -> Chạy local scan để mở Dialog
                const text = rawInput.value.trim();
                try {
                    const resultFields = extractFieldsLocally(text);
                    handleExtractionResults(resultFields, text, 'PHÂN LOẠI DỮ LIỆU THÔ (LOCAL)');
                } catch (err) {
                    showToast("❌ Lỗi: " + err.message, "#f44336");
                }
            } else {
                showToast("Chưa có nội dung để hiển thị. Vui lòng nhập text hoặc chọn file.", "#ffc107");
            }
        });
    }

    if (btnClearQueue) {
        btnClearQueue.addEventListener('click', (e) => {
            e.preventDefault();
            clearQueue(queueList, placeholder, rawInput);
        });
    }

    queueContainer.addEventListener('click', () => {
        inputPdf.click();
    });

    // --- QUÉT MAIL (qua GM_setValue Bridge từ tab Gmail/Outlook) ---
    const btnScanMail = document.getElementById('vnpt-btn-scan-mail');
    const btnScanScreen = document.getElementById('vnpt-btn-scan-screen');

    if (btnScanMail) {
        btnScanMail.addEventListener('click', async () => {
            // Đọc dữ liệu mail từ GM storage (do tab Gmail/Outlook đã gửi qua)
            let rawMailJson;
            try {
                rawMailJson = await BridgeStore.get(MAIL_BRIDGE_KEY);
            } catch (err) {
                showToast('❌ Lỗi đọc dữ liệu mail. Kiểm tra lại quyền lưu trữ.', '#ef4444');
                return;
            }

            if (!rawMailJson) {
                showToast('⚠️ Chưa có mail nào được gửi!\n👉 Mở Gmail/Outlook → chọn email → nhấn nút "📋 Gửi sang VNPT".', '#f59e0b');
                return;
            }

            let data;
            try {
                data = typeof rawMailJson === 'string' ? JSON.parse(rawMailJson) : rawMailJson;
            } catch {
                showToast('❌ Dữ liệu mail bị lỗi định dạng.', '#ef4444');
                return;
            }

            // Kiểm tra dữ liệu còn mới (trong vòng 30 phút)
            const AGE_LIMIT_MS = 30 * 60 * 1000;
            if (data._timestamp && (Date.now() - data._timestamp) > AGE_LIMIT_MS) {
                showToast('⚠️ Dữ liệu mail đã quá cũ (>30 phút). Hãy gửi lại từ tab Gmail/Outlook.', '#f59e0b');
                return;
            }

            // 1. Đổ text vào ô Raw Scan
            const newContent = `TIÊU ĐỀ: ${data.subject || ''}\nNGƯỜI GỬI: ${data.sender || ''}\n\nNỘI DUNG EMAIL:\n${data.body || ''}`;
            if (rawInput.value.trim()) {
                rawInput.value += `\n\n--- MAIL MỚI ---\n${newContent}`;
            } else {
                rawInput.value = newContent;
            }
            Storage.set(SK_RAW_SCAN, rawInput.value); // Lưu ngay lập tức khi nhận từ Mail
            showToast(`📧 Đã nhận mail từ ${data._source || 'tab mail'}.`);

            // 2. Tải tệp đính kèm (nếu có)
            if (data.attachmentUrls && data.attachmentUrls.length > 0) {
                showToast(`📂 Đang tải ${data.attachmentUrls.length} tệp đính kèm...`, '#1a73e8');
                for (const att of data.attachmentUrls) {
                    try {
                        const b64Data = await downloadAsBase64(att.url, att.name);
                        fileQueue.push({ file: { name: att.name }, ...b64Data });
                    } catch (err) {
                        console.error('[VNPT] Lỗi tải tệp:', att.name, err);
                    }
                }
                renderQueue(queueList, placeholder);
                showToast('✅ Đã nạp xong tệp đính kèm!');
            }

            // 3. Tự động kích hoạt AI
            btnProcessAI.click();
        });
    }

    if (btnScanScreen) {
        btnScanScreen.addEventListener('click', () => {
            const content = scrapeScreenText();
            if (content) {
                if (rawInput.value.trim()) {
                    rawInput.value += `\n\n--- NỘI DUNG MÀN HÌNH MỚI ---\n${content}`;
                } else {
                    rawInput.value = content;
                }
                Storage.set(SK_RAW_SCAN, rawInput.value); // Lưu ngay lập tức khi quét màn hình
                showToast("🖥️ Đã quét toàn bộ màn hình.");
                // Tự động kích hoạt hiệu ứng quét
                btnProcessAI.click();
            } else {
                showToast("⚠️ Không thể quét nội dung màn hình", "#ffc107");
            }
        });
    }

    queueContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        queueContainer.classList.add('drag-over');
    });
    queueContainer.addEventListener('dragleave', (e) => {
        e.preventDefault();
        queueContainer.classList.remove('drag-over');
    });
    queueContainer.addEventListener('drop', async (e) => {
        e.preventDefault();
        queueContainer.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            showToast("⏳ Đang xử lý tệp...", "#1a73e8");
            for(let file of e.dataTransfer.files) {
                const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
                
                // Xử lý song song QR và Base64
                const qrPromise = extractQRCodeFromImage(file);
                const b64Promise = fileToBase64(file);
                
                const [qrText, b64] = await Promise.all([qrPromise, b64Promise]);

                if (qrText) {
                    const parsed = parseCCCD_QR(qrText);
                    if (parsed) {
                        applyQRDataToFields(parsed, file.name);
                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                        continue;
                    }
                }
                fileQueue.push({ file, ...b64, previewUrl });
            }
            renderQueue(queueList, placeholder);
        }
    });

    inputPdf.addEventListener('change', async (e) => {
        if (!e.target.files) return;
        showToast("⏳ Đang nạp tệp...", "#1a73e8");
        for(let file of e.target.files) {
            const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
            const qrText = await extractQRCodeFromImage(file);
            if (qrText) {
                const parsed = parseCCCD_QR(qrText);
                if (parsed) {
                    applyQRDataToFields(parsed, file.name);
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    continue;
                }
            }
            const b64 = await fileToBase64(file);
            fileQueue.push({ file, ...b64, previewUrl });
        }
        e.target.value = '';
        renderQueue(queueList, placeholder);
    });

    window.addEventListener('paste', async (e) => {
        if (aiSection.style.display === 'none') return;

        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        let hasFile = false;
        let filesToProcess = [];

        for (let item of items) {
            if (item.type.indexOf('image') !== -1 || item.type.indexOf('pdf') !== -1) {
                hasFile = true;
                const file = item.getAsFile();
                if (file) filesToProcess.push(file);
            }
        }

        if (filesToProcess.length > 0) {
            showToast(`📋 Đang nạp ${filesToProcess.length} ảnh...`, "#1a73e8");
            for (const file of filesToProcess) {
                const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
                const b64 = await fileToBase64(file);
                fileQueue.push({ file, ...b64, previewUrl });
            }
            renderQueue(queueList, placeholder);
        }

        const target = e.target;
        if (hasFile && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
            e.preventDefault();
        }
    });

    const handleExtractionResults = (resultFields, rawText, titleTemplate) => {
        const usedKeys = new Set();
        const resultsArray = [];

        // 1. Duyệt qua tất cả các nhãn mặc định (DEFAULT_LABELS) để đảm bảo hiển thị đầy đủ
        const EXCLUDED_LABELS = ['ngày ký', 'tháng ký', 'năm ký', 'số lượng gói', 'nơi ký', 'liên hệ a'];
        const EXCLUDED_KEYS = ['ngayKy', 'ngayKy1', 'thangKy', 'thangKy1', 'namKy', 'namKy1', 'soLuongGoi', 'noiKy'];

        Object.entries(DEFAULT_LABELS).forEach(([fullKey, label]) => {
            const aliases = fullKey.split(',').map(k => k.trim());
            
            // Bỏ qua các nhãn trong danh sách loại trừ HOẶC nếu tất cả bí danh đều trong list loại trừ
            const labelLower = (label || '').toLowerCase();
            const shouldExclude = EXCLUDED_LABELS.includes(labelLower) || 
                                aliases.every(alias => EXCLUDED_KEYS.includes(alias));

            if (shouldExclude) {
                // Vẫn đánh dấu vào usedKeys để bước 2 không hiển thị chúng như là "trường mới tìm thấy"
                aliases.forEach(alias => usedKeys.add(alias));
                return;
            }

            // Tìm giá trị từ resultFields bằng cách thử tất cả các bí danh
            let value = "";
            for (const alias of aliases) {
                if (resultFields[alias]) {
                    value = resultFields[alias];
                    usedKeys.add(alias);
                    break; 
                }
            }

            resultsArray.push({
                key: fullKey, 
                value: value,
                label: label,
                checked: !!value
            });
        });

        // 2. Bổ sung các trường mà AI tìm thấy nhưng không nằm trong DEFAULT_LABELS (nếu có)
        Object.keys(resultFields).forEach(key => {
            if (!usedKeys.has(key) && !EXCLUDED_KEYS.includes(key) && resultFields[key]) {
                resultsArray.push({
                    key: key,
                    value: resultFields[key],
                    label: key, 
                    checked: true
                });
            }
        });


        if (resultsArray.every(item => !item.value)) {
            showToast("⚠️ AI hoặc Regex không trích xuất được thông tin nào!", "#ffc107");
        }

        AppState.lastPdfResults = resultsArray;
        AppState.lastPdfRawText = rawText || "";

        showPdfConfirmDialog(resultsArray, rawText || "", (selectedResults) => {
            const keysToSync = selectedResults.map(res => res.key);
            selectedResults.forEach(res => {
                addOrUpdateFieldRow(res.key, res.value, res.label);
            });
            saveFieldsToLocal();

            // Tự động điền dữ liệu xuống form trang web sau khi lưu
            if (keysToSync.length > 0) {
                setTimeout(() => syncAllFields(keysToSync), 300);
            }

            showToast(`✅ Đã quét xong ${selectedResults.length} trường.`);
            
            AppState.lastPdfResults = AppState.lastPdfResults.map(orig => {
                const updated = selectedResults.find(s => s.key === orig.key);
                if (updated) {
                    return { ...orig, value: updated.value, checked: true };
                }
                return { ...orig, checked: false };
            });
        }, (newText) => {
            // onReparse: Sử dụng Regex Local để cập nhật lại từ text mới (nhanh chóng)
            try {
                const refreshedFields = extractFieldsLocally(newText);
                handleExtractionResults(refreshedFields, newText, titleTemplate);
                showToast("🔄 Đã cập nhật lại các trường từ text mới.");
            } catch (err) {
                showToast("❌ Lỗi Cập nhật: " + err.message, "#ef4444");
            }
        });
        
        const dlgHeader = document.querySelector('#vnpt-pdf-dialog h3');
        if (dlgHeader) dlgHeader.textContent = titleTemplate;
    };


    btnProcessLocal.addEventListener('click', () => {
        const text = rawInput.value.trim();
        if (!text) {
            showToast("⚠️ Vui lòng nhập nội dung văn bản!", "#ffc107");
            return;
        }
        try {
            createInternalBackup("Trước khi phân loại Local: " + generateBackupName());
            const resultFields = extractFieldsLocally(text);
            handleExtractionResults(resultFields, text, 'PHÂN LOẠI DỮ LIỆU THÔ (LOCAL)');
        } catch (err) {
            showToast("❌ Lỗi: " + err.message, "#f44336");
        }
    });

    btnProcessAI.addEventListener('click', async () => {
        const apiKey = Storage.get(SK_GEMINI_KEY);
        const apiModel = Storage.get(SK_GEMINI_MODEL) || 'gemini-2.5-flash';

        if (!apiKey) {
            const wantGuide = confirm("Chưa cài đặt Gemini API Key!\n\nAI Scanner yêu cầu mã Google AI Studio.\n\nNhấn 'OK' để xem hướng dẫn nhé!");
            if (wantGuide) {
                window.open('https://github.com/tranchien2000/vnpt-tampermonkey-vite/blob/main/docs/GEMINI_API_GUIDES.md', '_blank');
            }
            return;
        }

        if (fileQueue.length === 0 && !rawInput.value.trim()) {
            showToast("⚠️ Hàng đợi trống. Vui lòng chọn file hoặc dán nội dung", "#ffc107");
            return;
        }

        rawInput.classList.add('ai-scanning-glow');
        btnProcessAI.disabled = true;
        btnProcessAI.textContent = "⏳ ĐANG QUÉT...";
        
        try {
            createInternalBackup("Trước khi AI Scan: " + generateBackupName());
            let resultFieldsObj = {};
            let rawText = "";

            if (fileQueue.length > 0) {
                // Multimodal request
                const ocrResult = await extractWithGemini(null, apiKey, apiModel, null, fileQueue);
                resultFieldsObj = ocrResult.fields || {};
                rawText = ocrResult.rawTextSnippet || ocrResult.rawFullText || "";
                
                // Hiển thị nội dung vừa quét được vào Input (user kiểm tra chéo)
                if (rawInput.value.trim()) {
                    rawInput.value += `\n\n--- KẾT QUẢ ĐỌC FILE ---\n${rawText}`;
                } else {
                    rawInput.value = rawText;
                }
                Storage.set(SK_RAW_SCAN, rawInput.value); // Lưu nội dung AI vừa đọc được
            } else {
                // Thuần text request
                const text = rawInput.value.trim();
                resultFieldsObj = await extractFieldsFromText(text, apiKey, apiModel);
                rawText = text;
            }

            handleExtractionResults(resultFieldsObj, rawText, 'PHÂN LOẠI DỮ LIỆU THÔ (AI)');

            // Xoá hàng đợi sau khi quét xong vì đã render raw text ra textbox
            if (fileQueue.length > 0) {
                fileQueue = [];
                renderQueue(queueList, placeholder);
            }

        } catch (e) {
            console.error("Lỗi AI Scan Pipeline:", e);
            alert("Lỗi xử lý quét AI:\n" + e);
        } finally {
            rawInput.classList.remove('ai-scanning-glow');
            btnProcessAI.disabled = false;
            btnProcessAI.textContent = "BẮT ĐẦU QUÉT AI";
        }
    });

}
