/**
 * @file index.js
 * @desc Entry point điều phối phân loại văn bản thô.
 */
import { AppState } from '../../core/state.js';
import { Storage } from '../../utils/storage.js';
import { SK_GEMINI_KEY, SK_GEMINI_MODEL } from '../../core/constants.js';
import { extractFieldsFromText } from './rawScan.js';
import { showPdfConfirmDialog, showPdfLoading, hidePdfLoading } from '../pdfScan/pdfScanUI.js';
import { addOrUpdateFieldRow, saveFieldsToLocal } from '../fieldsManager.js';
import { showToast } from '../../ui/toast.js';

export function initRawScan() {
    const btnRaw = document.getElementById('vnpt-btn-scan-raw');
    const rawSection = document.getElementById('vnpt-raw-scan-section');
    const btnProcess = document.getElementById('vnpt-btn-raw-process');
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

    // Xử lý khi nhấn nút Phân loại
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
            showPdfLoading(); // Dùng chung loader của PDF cho đồng bộ
            const resultFields = await extractFieldsFromText(text, apiKey, model);
            hidePdfLoading();

            const resultsArray = Object.keys(resultFields).map(key => ({
                key: key,
                value: resultFields[key],
                label: `AI: ${key}`
            })).filter(item => item.value !== "" && item.value !== null);

            if (resultsArray.length === 0) {
                alert("AI không tìm thấy thông tin hợp lệ nào để phân loại.");
                return;
            }

            // Hiện dialog xác nhận (Dùng chung UI của PDF nhưng đổi text header sau khi inject)
            showPdfConfirmDialog(resultsArray, (selected) => {
                selected.forEach(res => {
                    addOrUpdateFieldRow(res.key, res.value, res.label);
                });
                saveFieldsToLocal();
                showToast(`✅ Đã nạp ${selected.length} trường từ văn bản thô.`);
                
                // Sau khi xong thì ẩn khung nhập đi cho gọn
                rawSection.style.display = 'none';
                btnRaw.classList.remove('active');
                rawInput.value = '';
            });

            // Hack nhỏ để đổi tiêu đề dialog cho đúng ngữ cảnh RAW
            const dlgHeader = document.querySelector('#vnpt-pdf-dialog h3');
            if (dlgHeader) dlgHeader.textContent = '✨ PHÂN LOẠI DỮ LIỆU THÔ (AI)';

        } catch (err) {
            hidePdfLoading();
            console.error("Raw Scan Error:", err);
            alert("Lỗi phân loại dữ liệu: " + err);
        }
    });
}
