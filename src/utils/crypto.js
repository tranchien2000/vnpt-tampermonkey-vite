/**
 * @file crypto.js
 * @desc Cung cấp các hàm mã hóa/giải mã đơn giản để bảo vệ API Keys khi lưu trên Cloud.
 *       Sử dụng kết hợp ID máy (nếu có thể) hoặc một salt cố định.
 */

// Một key đơn giản để obfuscate dữ liệu (có thể cải tiến bằng cách lấy fingerprint trình duyệt)
const APP_SALT = "VNPT_PRO_SECRET_2026";

/**
 * Mã hóa chuỗi sang Base64 đã được biến đổi
 */
export function encrypt(text) {
    if (!text) return "";
    try {
        const xor = (str) => {
            return str.split('').map((char, i) => 
                String.fromCharCode(char.charCodeAt(0) ^ APP_SALT.charCodeAt(i % APP_SALT.length))
            ).join('');
        };
        return btoa(xor(text));
    } catch (e) {
        console.error("Encryption error:", e);
        return text;
    }
}

/**
 * Giải mã chuỗi
 */
export function decrypt(encoded) {
    if (!encoded) return "";
    try {
        const xor = (str) => {
            return str.split('').map((char, i) => 
                String.fromCharCode(char.charCodeAt(0) ^ APP_SALT.charCodeAt(i % APP_SALT.length))
            ).join('');
        };
        return xor(atob(encoded));
    } catch (e) {
        console.error("Decryption error:", e);
        return encoded;
    }
}
