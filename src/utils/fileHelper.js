/**
 * @file fileHelper.js
 * @desc Các hàm tiện ích xử lý tệp tin: Chuyển đổi URL/Blob sang Base64 trong môi trường Tampermonkey.
 */

/**
 * Tải một file từ URL và chuyển sang Base64 dùng GM_xmlhttpRequest (để bypass CORS).
 * @param {string} url 
 * @param {string} fileName 
 * @returns {Promise<{base64: string, mimeType: string, name: string}>}
 */
export function downloadAsBase64(url, fileName) {
    return new Promise((resolve, reject) => {
        if (typeof GM_xmlhttpRequest === 'undefined') {
            reject(new Error("GM_xmlhttpRequest không khả dụng. Hãy cài đặt trên Tampermonkey."));
            return;
        }

        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            responseType: "arraybuffer",
            onload: function(response) {
                if (response.status === 200) {
                    const mimeType = response.responseHeaders.match(/content-type:\s*([^\s;]+)/i)?.[1] || 'application/octet-stream';
                    const base64 = arrayBufferToBase64(response.response);
                    resolve({
                        base64: base64,
                        mimeType: mimeType,
                        name: fileName
                    });
                } else {
                    reject(new Error("Lỗi tải tệp: " + response.status));
                }
            },
            onerror: function(err) {
                reject(err);
            }
        });
    });
}

/**
 * Helper: Chuyển ArrayBuffer sang Base64
 */
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
