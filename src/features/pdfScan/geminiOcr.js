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
            fieldsHint += `    "${pKey}": "${label}",\n`;
        }
    }

    return `Bạn là chuyên gia trích xuất dữ liệu từ Hợp đồng/Phụ lục VNPT.
Nhiệm vụ: Đọc kỹ tài liệu và trích xuất thông tin của BÊN A (KHÁCH HÀNG). 
TUYỆT ĐỐI KHÔNG lấy thông tin của Bên B (VNPT).

CHỈ TRẢ VỀ JSON THUẦN TÚY.
Cấu trúc JSON yêu cầu:
{
  "fields": {
${fieldsHint}    "ngayKy": "dd/MM/yyyy"
  },
  "rawFullText": "Toàn bộ nội dung văn bản đã được OCR"
}

QUY TẮC TRÍCH XUẤT:
1. "soDkdn": Lấy Mã số thuế (10 hoặc 13 số) hoặc số GPKD.
2. "noiCapSoDkdn": Luôn trả về định dạng "SKDT {Tỉnh}" (VD: "SKDT TP.HCM"). Nếu là cá nhân có CCCD, lấy nơi cấp theo CCCD.
3. Định dạng ngày: Luôn là dd/MM/yyyy. Nếu chỉ có tháng/năm, hãy để trống ngày.
4. Ưu tiên lấy thông tin ở các trang có chữ ký/dấu mộc nếu có mâu thuẫn.
5. Nếu không tìm thấy trường thông tin, trả về "".
6. "tenToChuc": Nếu là cá nhân, điền Họ và tên của người đó. Nếu là hộ kinh doanh, lấy tên hộ kinh doanh.
7. "diaChi": Ưu tiên lấy địa chỉ thường trú hoặc địa chỉ trụ sở chính. 
8. "goiDV": Trích xuất gói cước dịch vụ (VD: Fiber150, HomeNet2, ...).
9. "soHopDong": Tìm số hợp đồng thường nằm ở góc trên bên phải hoặc tiêu đề.

VÍ DỤ TRÍCH XUẤT:
Văn bản: "...Bên A: Công ty TNHH Giải Pháp AI. MST: 0312345678. Đại diện: Ông Trần Văn B. CMND: 123456789 cấp ngày 01/01/2010 tại CA TP.HCM..."
Kết quả: {
  "fields": {
    "tenToChuc": "Công ty TNHH Giải Pháp AI",
    "soDkdn": "0312345678",
    "tenDaiDienn": "Trần Văn B",
    "cmnd": "123456789",
    "ngayCapCustomer": "01/01/2010"
  },
  "rawFullText": "..."
}`;
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
 * Nén và resize ảnh để tối ưu Token và tốc độ API.
 */
async function compressImage(file) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(img.src);
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            const MAX_SIZE = 1200;
            if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                }
            } else {
                if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Chất lượng 0.7 là đủ cho AI đọc
            const base64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
            resolve(base64);
        };
        img.onerror = () => resolve(null);
    });
}

/**
 * Helper biến File thành thẻ Base64
 * Tối ưu: Không nén ở đây nữa để tránh lag khi nạp tệp
 */
export async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const mimeType = file.type || 'application/octet-stream';
        reader.onload = () => {
            const b64 = reader.result.split(',')[1];
            resolve({ base64: b64, mimeType });
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Export thêm hàm nén để dùng khi bấm nút Quét AI
export { compressImage };
