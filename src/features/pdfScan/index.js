/**
 * @file index.js
 * @desc Entry point điều phối phân tích AI và Queue UI.
 *       Móc nối File -> API -> UI Confirm -> Thêm vào bảng.
 */
import { AppState } from '../../core/state.js';
import { Storage } from '../../utils/storage.js';
import { SK_GEMINI_KEY, SK_GEMINI_MODEL, REQUIRED_KEYS, DEFAULT_LABELS } from '../../core/constants.js';
import { fileToBase64, extractWithGemini } from './geminiOcr.js';
import { showPdfConfirmDialog, showPdfLoading, hidePdfLoading } from './pdfScanUI.js';
import { addOrUpdateFieldRow, saveFieldsToLocal } from '../fieldsManager.js';
import { showToast } from '../../ui/toast.js';
import { createInternalBackup, generateBackupName } from '../../utils/backupHelper.js';
import { extractFieldsFromText, extractFieldsLocally } from '../rawScan/rawScan.js';

let fileQueue = [];

function renderQueue(queueList, placeholder) {
    queueList.innerHTML = '';
    if (fileQueue.length === 0) {
        placeholder.style.display = 'flex';
        return;
    }
    placeholder.style.display = 'none';
    
    fileQueue.forEach((item, index) => {
        const el = document.createElement('div');
        el.className = 'ai-queue-item';
        
        if (item.mimeType && item.mimeType.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = `data:${item.mimeType};base64,${item.base64}`;
            el.appendChild(img);
        } else {
            const span = document.createElement('span');
            span.className = 'file-icon';
            span.textContent = '📄';
            el.appendChild(span);
        }

        const rmBtn = document.createElement('button');
        rmBtn.className = 'btn-remove-item';
        rmBtn.innerHTML = '✖';
        rmBtn.onclick = (e) => {
            e.stopPropagation();
            fileQueue.splice(index, 1);
            renderQueue(queueList, placeholder);
        };
        el.appendChild(rmBtn);
        queueList.appendChild(el);
    });
}

function clearQueue(queueList, placeholder, rawInput) {
    fileQueue = [];
    rawInput.value = '';
    renderQueue(queueList, placeholder);
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

    if (btnShowPdf) {
        btnShowPdf.addEventListener('click', (e) => {
            e.preventDefault();
            if (AppState.lastPdfResults && AppState.lastPdfResults.length > 0) {
                showPdfConfirmDialog(AppState.lastPdfResults, AppState.lastPdfRawText || "", (selectedResults) => {
                    selectedResults.forEach(res => {
                        addOrUpdateFieldRow(res.key, res.value, res.label);
                    });
                    saveFieldsToLocal();
                    showToast(`✅ Đã cập nhật ${selectedResults.length} trường.`);
                });
            } else {
                showToast("Chưa có kết quả scan AI nào trong phiên này.", "#ffc107");
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
            for(let file of e.dataTransfer.files) {
                const b64 = await fileToBase64(file);
                fileQueue.push({ file, ...b64 });
            }
            renderQueue(queueList, placeholder);
        }
    });

    inputPdf.addEventListener('change', async (e) => {
        if (!e.target.files) return;
        for(let file of e.target.files) {
            const b64 = await fileToBase64(file);
            fileQueue.push({ file, ...b64 });
        }
        e.target.value = '';
        renderQueue(queueList, placeholder);
    });

    window.addEventListener('paste', async (e) => {
        if (aiSection.style.display === 'none') return;
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let item of items) {
            if (item.type.indexOf('image') !== -1 || item.type.indexOf('pdf') !== -1) {
                const file = item.getAsFile();
                if (file) {
                    const b64 = await fileToBase64(file);
                    fileQueue.push({ file, ...b64 });
                    renderQueue(queueList, placeholder);
                    showToast("📋 Đã thêm vào hàng đợi.");
                }
            }
        }
    });

    const handleExtractionResults = (resultFields, rawText, titleTemplate) => {
        // Build mảng kết quả luôn chứa đầy đủ các trường bắt buộc (REQUIRED_KEYS)
        const resultsArray = REQUIRED_KEYS.map(key => {
            return {
                key: key,
                value: resultFields[key] || "", 
                label: DEFAULT_LABELS[key] || key,
                checked: !!resultFields[key] // Tự check nếu AI có dữ liệu, rỗng thì bỏ check
            };
        });

        // Có thể gộp thêm các trường không nằm trong REQUIRED_KEYS nhưng AI lại parse ra (nếu có)
        Object.keys(resultFields).forEach(key => {
            if (!REQUIRED_KEYS.includes(key) && resultFields[key]) {
                resultsArray.push({
                    key: key,
                    value: resultFields[key],
                    label: DEFAULT_LABELS[key] || key,
                    checked: true
                });
            }
        });

        if (resultsArray.every(item => !item.value)) {
            showToast("⚠️ AI hoặc Regex không trích xuất được thông tin nào!", "#ffc107");
            // Vẫn show dialog để user tự điền nếu muốn
        }

        AppState.lastPdfResults = resultsArray;
        AppState.lastPdfRawText = rawText || "";

        showPdfConfirmDialog(resultsArray, rawText || "", (selectedResults) => {
            selectedResults.forEach(res => {
                addOrUpdateFieldRow(res.key, res.value, res.label);
            });
            saveFieldsToLocal();
            showToast(`✅ Đã quét xong ${selectedResults.length} trường.`);
            
            AppState.lastPdfResults = AppState.lastPdfResults.map(orig => {
                const updated = selectedResults.find(s => s.key === orig.key);
                if (updated) {
                    return { ...orig, value: updated.value, checked: true };
                }
                return { ...orig, checked: false };
            });
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
                rawInput.value = rawText;
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
            btnProcessAI.textContent = "✨ BẮT ĐẦU QUÉT AI";
        }
    });

}
