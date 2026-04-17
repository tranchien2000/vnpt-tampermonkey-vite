import __vite__cjsImport0_jsqr from "/vendor/.vite-deps-jsqr.js__v--2dbe45b8.js"; const jsQR = __vite__cjsImport0_jsqr.__esModule ? __vite__cjsImport0_jsqr.default : __vite__cjsImport0_jsqr;

/**
 * Đọc ảnh từ File và dùng Canvas API để lấy ImageData, sau đó đẩy cho jsQR.
 * @param {File} file - File ảnh
 * @returns {Promise<string|null>} - Chuỗi decode được từ QR, hoặc null nếu không có/không tìm thấy
 */
export async function extractQRCodeFromImage(file) {
    if (!file || !file.type.startsWith('image/')) return null;

    try {
        const bmp = await createImageBitmap(file);
        const canvas = document.createElement("canvas");
        canvas.width = bmp.width;
        canvas.height = bmp.height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(bmp, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // jsQR(data, width, height)
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert", // Có thể thử "attemptBoth" nếu cần quét các mã bị đảo màu âm bản
        });
        
        if (code && code.data) {
            return code.data;
        }
        return null;
    } catch (e) {
        console.error("[VNPT] Lỗi đọc QR Code nội bộ:", e);
        return null;
    }
}

/**
 * Bóc tách chuỗi đọc được từ CCCD Việt Nam.
 * Cấu trúc: 12_so_CCCD|9_so_CMND_cu|HO_TEN_CHU_IN_HOA|DDMMYYYY|Gioi_Tinh|Dia_Chi_Day_Du_Phan_Cach_Bang_Dau_Phay|DDMMYYYY_Ngay_Cap
 * 
 * @param {string} qrText Chuỗi văn bản phân cách bởi dấu `|`
 * @returns {Object|null}
 */
export function parseCCCD_QR(qrText) {
    if (!qrText || typeof qrText !== 'string') return null;
    const parts = qrText.split('|');
    
    // Một chuỗi QR CCCD thực tế của VN thường có ít nhất 6 hoặc 7 phần tử
    if (parts.length < 6) return null; 
    
    return {
        cccd: parts[0] || "",
        cmnd_old: parts[1] || "",
        name: parts[2] || "",
        dob: parts[3] || "",          // ddmmyyyy
        gender: parts[4] || "",       // Nam / Nữ
        address: parts[5] || "",      // Địa chỉ thường trú
        issue_date: parts[6] || ""    // ddmmyyyy
    };
}
