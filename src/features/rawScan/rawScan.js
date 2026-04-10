/**
 * @file rawScan.js
 * @desc Xử lý việc phân loại văn bản thô bằng AI Gemini.
 */
import { callGemini } from '../../api/gemini.js';
import { REQUIRED_KEYS, DEFAULT_LABELS } from '../../core/constants.js';

/**
 * Lời nhắc hệ thống chuyên dụng cho văn bản thô (Raw Text)
 */
const getRawTextSystemPrompt = () => {
    let fieldsHint = '';
    for (const [key, label] of Object.entries(DEFAULT_LABELS)) {
        const pKey = key.split(',')[0].trim();
        if (REQUIRED_KEYS.includes(pKey)) {
            fieldsHint += `"${pKey}": "${label}",\n`;
        }
    }

    return `Bạn là một chuyên gia trích xuất dữ liệu từ văn bản thô (có thể là mẫu tin nhắn, email, ghi chú...). 
Nhiệm vụ của bạn là tìm thông tin của KHÁCH HÀNG (BÊN THUÊ/BÊN A) từ đoạn văn bản được cung cấp.

Hãy trả về DUY NHẤT một chuỗi JSON thuần tuý.
Cấu trúc JSON bắt buộc phải trả về:
{
${fieldsHint}  "ngayKy": "Ngày tháng năm ký (nếu có)"
}

Lưu ý:
- Nếu thông tin không có, trả về chuỗi rỗng "".
- Chuẩn hóa ngày tháng về dd/MM/yyyy.
- Chuẩn hóa Số điện thoại (xóa khoảng cách, dấu chấm).
- Mọi MST/Số GCPKD đều cho vào key "soDkdn".
- Bỏ qua các dữ liệu rác không liên quan.`;
};

/**
 * Thực hiện trích xuất thông tin từ đoạn text thô.
 */
export async function extractFieldsFromText(rawText, apiKey, modelName = 'gemini-2.0-flash') {
    if (!rawText || !rawText.trim()) throw new Error("Vui lòng nhập nội dung văn bản cần phân loại.");

    return callGemini({
        apiKey,
        model: modelName,
        systemInstruction: getRawTextSystemPrompt(),
        userText: `Hãy phân loại thông tin từ đoạn văn bản sau đây: \n\n${rawText}`
    });
}
