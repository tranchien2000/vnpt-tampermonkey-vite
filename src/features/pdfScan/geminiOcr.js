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

    return `Bạn là chuyên gia trích xuất dữ liệu hợp đồng VNPT.
Nhiệm vụ: Đọc tài liệu (văn bản/ảnh/PDF) và trích xuất thông tin BÊN A (KHÁCH HÀNG). Bỏ qua Bên B.

CHỈ TRẢ VỀ JSON THUẦN TÚY, không bao gồm giải thích hay định dạng markdown.
Cấu trúc JSON yêu cầu:
{
  "fields": {
${fieldsHint}    "ngayKy": "dd/MM/yyyy"
  },
  "rawFullText": "Toàn bộ nội dung văn bản"
}

Lưu ý:
- "soDkdn" dùng cho cả MST và Số GPKD.
- Định dạng ngày: dd/MM/yyyy.
- Với tài liệu nhiều trang: Tổng hợp dữ liệu từ tất cả các trang. Nếu thông tin xuất hiện nhiều lần, lấy bản mới nhất/chính xác nhất.
- Nếu không tìm thấy trường thông tin, trả về "".`;
};
import { callGemini } from '../../api/gemini.js';

/**
 * @param {string} base64Data Chuỗi base64 của file
 * @param {string} apiKey Khóa API Google Gemini
 * @param {string} modelName Tên mô hình (ví dụ: gemini-2.0-flash)
 * @param {string} mimeType Định dạng file (application/pdf, image/png, etc.)
 * @returns {Promise<Object>} JSON đã parse
 */
export function extractWithGemini(base64Data, apiKey, modelName = 'gemini-2.0-flash', mimeType = 'application/pdf', multipleFiles = null) {
    const options = {
        apiKey,
        model: modelName,
        systemInstruction: getSystemPrompt(),
        userText: "Đọc tài liệu hợp đồng này và trích xuất thành JSON. Nếu có nhiều trang, hãy kết nối thông tin với nhau để lấy ra thông tin đầy đủ nhất."
    };

    if (multipleFiles && Array.isArray(multipleFiles)) {
        options.filesData = multipleFiles;
    } else if (base64Data) {
        options.fileData = { mimeType, base64: base64Data };
    }

    return callGemini(options);
}

/**
 * Helper biến File thành thẻ Base64
 * @returns {Promise<{base64: string, mimeType: string}>}
 */
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const mimeType = file.type || 'application/octet-stream';

        reader.onload = () => {
            const b64 = reader.result.split(',')[1];
            resolve({
                base64: b64,
                mimeType
            });
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}
