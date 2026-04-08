/**
 * @file index.js
 * @desc Entry point điều phối phân tích PDF OCR bằng Gemini.
 *       Móc nối File -> API -> UI Confirm -> Thêm vào bảng.
 */
import { AppState } from '../../core/state.js';
import { Storage } from '../../utils/storage.js';
import { SK_GEMINI_KEY, SK_GEMINI_MODEL } from '../../core/constants.js';
import { fileToBase64, extractWithGemini } from './geminiOcr.js';
import { showPdfConfirmDialog, showPdfLoading, hidePdfLoading } from './pdfScanUI.js';
import { addOrUpdateFieldRow, saveFieldsToLocal } from '../fieldsManager.js';

export function initPdfScan() {
    const btnScan = document.getElementById('vnpt-btn-scan-pdf');
    const inputPdf = document.getElementById('vnpt-pdf-input');

    if (!btnScan || !inputPdf) return;

    btnScan.addEventListener('click', (e) => {
        e.preventDefault();
        inputPdf.click(); // Mở hộp thoại chọn file
    });

    inputPdf.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Reset giá trị input ngay để click lần sau cùng file vẫn chạy change event
        e.target.value = '';

        await handlePdfFile(file);
    });
}

/**
 * Xử lý file PDF: Check key -> Gọi Gemini -> Show dialog -> Đổ Data
 */
async function handlePdfFile(file) {
    const apiKey = Storage.get(SK_GEMINI_KEY);
    const apiModel = Storage.get(SK_GEMINI_MODEL) || 'gemini-2.0-flash';
    
    // Yêu cầu API Key nếu chưa có
    if (!apiKey) {
        const wantGuide = confirm("Chưa cài đặt Gemini API Key!\n\nAI Scanner (PDF) yêu cầu cần có mã Google AI Studio cấp phát Miễn phí.\n\nNhấn 'OK' để xem hướng dẫn tự tạo mã Key nhé!");
        if (wantGuide) {
            window.open('https://github.com/tranchien2000/vnpt-tampermonkey-vite/blob/main/docs/GEMINI_API_GUIDE.md', '_blank');
        }
        return;
    }

    try {
        // UI Màn hình chờ
        showPdfLoading();

        // Đọc nén thành base 64
        const base64Data = await fileToBase64(file);

        // Ném vào LLM phân tích OCR JSON 
        const resultFieldsObj = await extractWithGemini(base64Data, apiKey, apiModel);

        // Tắt wait UI
        hidePdfLoading();

        // Làm phẳng kết quả thành mảng cho tiện parse lên Bảng UI
        const resultsArray = Object.keys(resultFieldsObj).map(key => ({
            key: key,
            value: resultFieldsObj[key],
            label: resultFieldsObj[key] === "" ? "(Trống)" : resultFieldsObj[key], // Tạm cho có Label hiển thị cho user duyệt
        })).filter(item => item.value !== ""); // Chỉ đưa ra UI các field bắt trúng

        if (resultsArray.length === 0) {
            alert("Rất tiếc! AI không tìm thấy trường thông tin nào thỏa mãn (Bên A).");
            return;
        }

        // Hiện Dialog xác nhận
        showPdfConfirmDialog(resultsArray, (selectedResults) => {
            // Callback khi user bấm "Chấp nhận"
            selectedResults.forEach(res => {
                // Ta tạm gửi res.key xuống làm label luôn. Nếu webScan có label tốt hơn thì sau sẽ đè.
                addOrUpdateFieldRow(res.key, res.value, `AI: ${res.key}`);
            });
            saveFieldsToLocal();
            
            // Render Toast gọn nhẹ nếu có system notification
            console.log(`✅ [OCR Pdf] Đã điền thành công ${selectedResults.length} trường.`);
        });

    } catch (e) {
        hidePdfLoading();
        console.error("Lỗi PDF Scan Pipeline:", e);

        let errorMsg = e;
        if (typeof e === 'string' && (e.includes("Quota exceeded") || e.includes("limit: 0"))) {
            errorMsg = "⚠️ Hết hạn mức hoặc Mô hình không khả dụng (Quota Exceeded)!\n\n" +
                "Mô hình bạn chọn có thể chưa hỗ trợ tại vùng của bạn hoặc bạn đã dùng hết lượt gọi miễn phí.\n\n" +
                "QUYẾT : Hãy mở menu ⚙️ (Thiết lập), đổi sang 'Gemini 1.5 Flash' hoặc 'Gemini 2.0 Flash' để tiếp tục.";
        }

        alert("Lỗi xử lý quét File:\n" + errorMsg);
    }
}
