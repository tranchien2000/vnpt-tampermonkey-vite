/**
 * @file geminiOcr.js
 * @desc Gọi API Google Gemini trực tiếp từ client.
 *       Bao gồm lấy cấu trúc dữ liệu mong muốn với Prompt Engineering JSON Mode
 */
import { REQUIRED_KEYS, DEFAULT_LABELS } from '../../core/constants.js';

/**
 * Lời nhắc hệ thống yêu cầu AI trả về dữ liệu đúng chuẩn
 */
const getSystemPrompt = () => {
    // Xây dựng danh sách tên trường gợi ý
    let fieldsHint = '';
    for (const [key, label] of Object.entries(DEFAULT_LABELS)) {
        // Chỉ mượn keys chính
        const pKey = key.split(',')[0].trim();
        if (REQUIRED_KEYS.includes(pKey)) {
            fieldsHint += `"${pKey}": "${label}",\n`;
        }
    }

    return `Bạn là một trợ lý ảo chuyên nghiệp trong việc trích xuất dữ liệu từ hợp đồng VNPT.
Nhiệm vụ của bạn là đọc nội dung của HỢP ĐỒNG ĐIỆN TỬ / PHỤ LỤC / BIÊN BẢN (dưới dạng văn bản/ảnh PDF).
Tìm và trích xuất các thông tin thuộc về BÊN A (KHÁCH HÀNG / BÊN THUÊ). Bỏ qua dữ liệu của Bên B (VNPT).

Hãy trả về DUY NHẤT một chuỗi JSON thuần tuý (không được bọc trong blockquote markdown \`\`\`json).
Ví dụ Cấu trúc JSON bắt buộc phải trả về:
{
${fieldsHint}  "ngayKy": "Ngày tháng năm ký hợp đồng (nếu có)"
}

Lưu ý quan trọng:
- Nếu trường nào đó không có/không tìm thấy, hãy xuất ra chuỗi rỗng "".
- Với trường cmnd: Lấy số Căn cước công dân hoặc CMND mới nhất.
- Với ngày tháng: Quy đổi về định dạng dd/MM/yyyy.
- Các trường MST (Mã số thuế / GPKD) điền vào key "soDkdn".
`;
};
import { callGemini } from '../../api/gemini.js';

/**
 * @param {string} base64PDF Chuỗi base64 của file
 * @param {string} apiKey Khóa API Google Gemini
 * @param {string} modelName Tên mô hình (ví dụ: gemini-2.0-flash)
 * @returns {Promise<Object>} JSON đã parse
 */
export function extractWithGemini(base64PDF, apiKey, modelName = 'gemini-2.0-flash') {
    return callGemini({
        apiKey,
        model: modelName,
        systemInstruction: getSystemPrompt(),
        userText: "Đọc file hợp đồng này và trích xuất thành JSON.",
        fileData: {
            mimeType: 'application/pdf',
            base64: base64PDF
        }
    });
}

/**
 * Helper biến File thành thẻ Base64
 */
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Chuỗi data:application/pdf;base64,JVBERi0x...
            const b64 = reader.result.split(',')[1];
            resolve(b64);
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}
