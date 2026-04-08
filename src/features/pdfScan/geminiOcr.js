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

/**
 * @param {string} base64PDF Chuỗi base64 của file
 * @param {string} apiKey Khóa API Google Gemini
 * @returns {Promise<Object>} JSON đã parse
 */
export function extractWithGemini(base64PDF, apiKey) {
    return new Promise((resolve, reject) => {
        if (!apiKey) return reject("Vui lòng nhập API Key Gemini trong Cài đặt.");

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const requestData = {
            system_instruction: {
                parts: { text: getSystemPrompt() }
            },
            contents: [
                {
                    parts: [
                        { text: "Đọc file hợp đồng này và trích xuất thành JSON." },
                        { inline_data: { mime_type: 'application/pdf', data: base64PDF } }
                    ]
                }
            ],
            generationConfig: {
                // Ép buộc LLM trả về JSON 
                responseMimeType: "application/json",
            }
        };

        // Do đang chạy trong userscript, gọi thông qua GM_xmlhttpRequest để bypass CORS
        if (typeof GM_xmlhttpRequest !== 'undefined') {
            GM_xmlhttpRequest({
                method: "POST",
                url: apiUrl,
                headers: { "Content-Type": "application/json" },
                data: JSON.stringify(requestData),
                timeout: 30000,
                onload: (response) => {
                    if (response.status >= 200 && response.status < 300) {
                        try {
                            const resObj = JSON.parse(response.responseText);
                            const textResponse = resObj?.candidates?.[0]?.content?.parts?.[0]?.text;
                            if (textResponse) {
                                // Xóa block `json nếu AI vô tình trả về
                                let cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                                resolve(JSON.parse(cleanJson));
                            } else {
                                reject("AI không trả về kết quả hợp lệ.");
                            }
                        } catch (e) {
                            console.error("Lỗi parse JSON từ Gemini", e, response.responseText);
                            reject("Lỗi Parse kết quả từ Gemini.");
                        }
                    } else {
                        reject(`API Gemini lỗi (${response.status}): ${response.responseText}`);
                    }
                },
                ontimeout: () => reject("Quá hạn thời gian gọi API (30s)"),
                onerror: (e) => reject("Lỗi kết nối đến Google Gemini API.")
            });
        } else {
            // Nền tảng môi trường dev bình thường 
            fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            })
            .then(r => r.json())
            .then(resObj => {
                if(resObj.error) return reject(resObj.error.message);
                const textResponse = resObj?.candidates?.[0]?.content?.parts?.[0]?.text;
                let cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                resolve(JSON.parse(cleanJson));
            })
            .catch(e => reject(e.message));
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
