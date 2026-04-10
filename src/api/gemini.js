/**
 * @file gemini.js
 * @desc Utility để kết nối với Google Gemini API.
 *       Hỗ trợ cả text-only và multimodal (image/pdf).
 */

/**
 * Gọi API Gemini để xử lý nội dung.
 * @param {Object} options - Các tùy chọn gọi API
 * @param {string} options.apiKey - Gemini API Key
 * @param {string} options.model - Tên mô hình (ví dụ: gemini-2.0-flash)
 * @param {string} options.systemInstruction - Chỉ dẫn hệ thống (System Prompt)
 * @param {string} options.userText - Văn bản người dùng gửi
 * @param {Object} [options.fileData] - Dữ liệu file (nếu có multimodal)
 * @param {string} options.fileData.mimeType - Mime type của file
 * @param {string} options.fileData.base64 - Chuỗi base64 của file
 * @returns {Promise<Object>} JSON response từ AI
 */
export async function callGemini({ apiKey, model, systemInstruction, userText, fileData }) {
    return new Promise((resolve, reject) => {
        if (!apiKey) return reject("Vui lòng nhập API Key Gemini trong Cài đặt.");

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const requestData = {
            system_instruction: {
                parts: [{ text: systemInstruction }]
            },
            contents: [
                {
                    parts: [
                        { text: userText }
                    ]
                }
            ],
            generation_config: {
                response_mime_type: "application/json",
            }
        };

        // Nếu có file data (multimodal)
        if (fileData && fileData.base64) {
            requestData.contents[0].parts.push({
                inline_data: {
                    mime_type: fileData.mimeType,
                    data: fileData.base64
                }
            });
        }

        const handleResponse = (textResponse) => {
            if (textResponse) {
                try {
                    // Xóa block markdown code nếu AI vô tình trả về
                    let cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                    resolve(JSON.parse(cleanJson));
                } catch (e) {
                    console.error("Lỗi parse JSON từ Gemini", e, textResponse);
                    reject("AI trả về kết quả không đúng cấu hình JSON.");
                }
            } else {
                reject("AI không trả về kết quả hợp lệ.");
            }
        };

        // Ưu tiên GM_xmlhttpRequest để bypass CORS trong Userscript
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
                            handleResponse(textResponse);
                        } catch (e) {
                            reject("Lỗi Parse kết quả từ Gemini API.");
                        }
                    } else {
                        reject(`API Gemini lỗi (${response.status}): ${response.responseText}`);
                    }
                },
                ontimeout: () => reject("Quá hạn thời gian gọi API (30s)"),
                onerror: (e) => reject("Lỗi kết nối đến Google Gemini API.")
            });
        } else {
            // Môi trường dev (Vite dev server)
            fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            })
                .then(r => r.json())
                .then(resObj => {
                    if (resObj.error) return reject(resObj.error.message);
                    const textResponse = resObj?.candidates?.[0]?.content?.parts?.[0]?.text;
                    handleResponse(textResponse);
                })
                .catch(e => reject(e.message));
        }
    });
}

/**
 * Kiểm tra kết nối tới Gemini API.
 */
export async function testGeminiConnection(apiKey, model) {
    if (!apiKey) throw new Error("Vui lòng nhập API Key.");

    const requestData = {
        contents: [{ parts: [{ text: "Ping" }] }],
        generation_config: {
            max_output_tokens: 5,
            response_mime_type: "text/plain"
        }
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    return new Promise((resolve, reject) => {
        const parseError = (responseText) => {
            try {
                const errObj = JSON.parse(responseText);
                return errObj.error?.message || responseText;
            } catch (e) { return responseText; }
        };

        if (typeof GM_xmlhttpRequest !== 'undefined') {
            GM_xmlhttpRequest({
                method: "POST",
                url: apiUrl,
                headers: { "Content-Type": "application/json" },
                data: JSON.stringify(requestData),
                timeout: 10000,
                onload: (response) => {
                    if (response.status >= 200 && response.status < 300) {
                        resolve(true);
                    } else {
                        const msg = parseError(response.responseText);
                        reject(`API Error ${response.status}: ${msg}`);
                    }
                },
                onerror: (e) => reject("Lỗi kết nối mạng hoặc CORS."),
                ontimeout: () => reject("Hết thời gian chờ (10s).")
            });
        } else {
            fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            })
                .then(async r => {
                    if (r.ok) return resolve(true);
                    const txt = await r.text();
                    reject(`API Error ${r.status}: ${parseError(txt)}`);
                })
                .catch(e => reject(e.message));
        }
    });
}
