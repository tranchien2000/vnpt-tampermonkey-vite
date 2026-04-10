import { AppState } from '../../core/state.js';
import { Storage } from '../../utils/storage.js';
import { SK_GEMINI_KEY, SK_GEMINI_MODEL } from '../../core/constants.js';
import { extractFieldsFromText, extractFieldsLocally } from './rawScan.js';
import { showPdfConfirmDialog, showPdfLoading, hidePdfLoading } from '../pdfScan/pdfScanUI.js';
import { addOrUpdateFieldRow, saveFieldsToLocal } from '../fieldsManager.js';
import { showToast } from '../../ui/toast.js';
import { createInternalBackup, generateBackupName } from '../../utils/backupHelper.js';

export function initRawScan() {
    const btnRaw = document.getElementById('vnpt-btn-scan-raw');
    const rawSection = document.getElementById('vnpt-raw-scan-section');
    const btnProcess = document.getElementById('vnpt-btn-raw-process');
    const btnProcessLocal = document.getElementById('vnpt-btn-raw-process-local');
    const rawInput = document.getElementById('vnpt-raw-scan-input');

    if (!btnRaw || !rawSection || !btnProcess || !rawInput) return;

    // Toggle hiển thị vùng nhập liệu
    btnRaw.addEventListener('click', (e) => {
        e.preventDefault();
        const isHidden = rawSection.style.display === 'none';
        rawSection.style.display = isHidden ? 'flex' : 'none';
        btnRaw.classList.toggle('active', isHidden);
        if (isHidden) rawInput.focus();
    });

    /**
     * Hàm chung xử lý kết quả trích xuất
     */
    const handleExtractionResults = (resultFields, sourcePrefix, title) => {
        const resultsArray = Object.keys(resultFields).map(key => ({
            key: key,
            value: resultFields[key],
            label: `${sourcePrefix}: ${key}`
        })).filter(item => item.value !== "" && item.value !== null);

        if (resultsArray.length === 0) {
            alert(sourcePrefix === 'AI' ? "AI không tìm thấy thông tin hợp lệ nào." : "Không tìm thấy thông tin phù hợp theo mẫu trích xuất Local.");
            return;
        }

        showPdfConfirmDialog(resultsArray, (selected) => {
            selected.forEach(res => {
                addOrUpdateFieldRow(res.key, res.value, res.label);
            });
            saveFieldsToLocal();
            showToast(`✅ Đã nạp ${selected.length} trường từ văn bản thô.`);

            rawSection.style.display = 'none';
            btnRaw.classList.remove('active');
            rawInput.value = '';
        });

        // Đổi tiêu đề dialog
        const dlgHeader = document.querySelector('#vnpt-pdf-dialog h3');
        if (dlgHeader) dlgHeader.textContent = title;
    };

    // Xử lý khi nhấn nút Phân loại (Local)
    if (btnProcessLocal) {
        btnProcessLocal.addEventListener('click', () => {
            const text = rawInput.value.trim();
            if (!text) {
                showToast("⚠️ Vui lòng nhập nội dung văn bản!", "#ffc107");
                return;
            }

            try {
                // Tự động sao lưu trước khi ghi đè
                createInternalBackup("Trước khi phân loại Local: " + generateBackupName());
                const resultFields = extractFieldsLocally(text);
                handleExtractionResults(resultFields, 'Local', 'PHÂN LOẠI DỮ LIỆU THÔ (LOCAL)');
            } catch (err) {
                showToast("❌ Lỗi: " + err.message, "#f44336");
            }
        });
    }

    // Xử lý khi nhấn nút Phân loại (AI)
    btnProcess.addEventListener('click', async () => {
        const text = rawInput.value.trim();
        if (!text) {
            showToast("⚠️ Vui lòng nhập nội dung văn bản!", "#ffc107");
            return;
        }

        const apiKey = Storage.get(SK_GEMINI_KEY);
        const model = Storage.get(SK_GEMINI_MODEL) || 'gemini-2.0-flash';

        if (!apiKey) {
            showToast("⚠️ Chưa cài đặt API Key Gemini!", "#f44336");
            return;
        }

        try {
            showPdfLoading(); 
            // Tự động sao lưu trước khi ghi đè
            createInternalBackup("Trước khi phân loại AI: " + generateBackupName());
            const resultFields = await extractFieldsFromText(text, apiKey, model);
            hidePdfLoading();

            handleExtractionResults(resultFields, 'AI', 'PHÂN LOẠI DỮ LIỆU THÔ (AI)');

        } catch (err) {
            hidePdfLoading();
            console.error("Raw Scan AI Error:", err);
            alert("Lỗi AI: " + err);
        }
    });
}
