/**
 * @file rawScan.js
 * @desc Xử lý việc phân loại văn bản thô bằng AI Gemini.
 */
import { callGemini } from "/src/api/gemini.js.js";
import { REQUIRED_KEYS, DEFAULT_LABELS } from "/src/core/constants.js.js";
import { classifyTextLocally } from "/src/utils/localClassifier.js.js";

/**
 * Lời nhắc hệ thống chuyên dụng cho văn bản thô (Raw Text)
 */
const getRawTextSystemPrompt = () => {
    let fieldsHint = '';
    for (const [key, label] of Object.entries(DEFAULT_LABELS)) {
        const pKey = key.split(',')[0].trim();
        if (REQUIRED_KEYS.includes(pKey)) {
            fieldsHint += `    "${pKey}": "${label}",\n`;
        }
    }

    return `Bạn là một chuyên gia trích xuất dữ liệu từ văn bản thô (tin nhắn, email, ghi chú).
Nhiệm vụ: Tìm thông tin của KHÁCH HÀNG (BÊN A) từ văn bản được cung cấp. Bỏ qua thông tin của nhân viên VNPT hoặc Bên B.

CHỈ TRẢ VỀ JSON THUẦN TÚY.
Cấu trúc JSON yêu cầu:
{
${fieldsHint}    "ngayKy": "Ngày ký hợp đồng"
}

QUY TẮC TRÍCH XUẤT:
1. "soDkdn": Lấy Mã số thuế (10 hoặc 13 số) hoặc Số GPKD. Xóa dấu chấm/khoảng cách.
2. "sdt": Lấy số điện thoại di động/cố định. Định dạng chỉ gồm chữ số.
3. "ngay...": Tất cả các trường ngày tháng phải đưa về định dạng dd/MM/yyyy.
4. "diaChi": Gộp toàn bộ số nhà, đường, phường, quận, tỉnh thành một chuỗi duy nhất.
5. "noiCapSoDkdn": Trả về định dạng "SKDT {Tỉnh}" (ví dụ: "SKDT Hà Nội").
6. Nếu không tìm thấy thông tin cho một trường, trả về "".
7. Tuyệt đối không tự bịa ra thông tin không có trong văn bản.

VÍ DỤ:
Văn bản: "Khách hàng Nguyễn Văn A, MST 0101234567, địa chỉ số 1 Tràng Tiền, Hoàn Kiếm, HN. SĐT 0987654321 ký ngày 12 tháng 4 năm 2024"
Kết quả: {
  "tenDaiDienn": "Nguyễn Văn A",
  "soDkdn": "0101234567",
  "diaChi": "số 1 Tràng Tiền, Hoàn Kiếm, Hà Nội",
  "sdt": "0987654321",
  "ngayKy": "12/04/2024"
}`;
};

/**
 * Thực hiện trích xuất thông tin từ đoạn text thô (Dùng AI Gemini).
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

/**
 * Thực hiện trích xuất thông tin từ đoạn text thô (Dùng Regex Local).
 */
export function extractFieldsLocally(rawText) {
    if (!rawText || !rawText.trim()) throw new Error("Vui lòng nhập nội dung văn bản cần phân loại.");
    return classifyTextLocally(rawText);
}
