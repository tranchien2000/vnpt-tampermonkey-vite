/**
 * @file scannerFallbacks.js
 * @desc Cấu hình các giá trị mặc định cho scanner khi không tìm thấy dữ liệu trên web.
 *       Tách riêng logic gán giá trị mặc định (như ngày hiện tại, số lượng mặc định) 
 *       ra khỏi logic quét DOM.
 */

/**
 * Lấy giá trị mặc định dựa trên ID của trường (field ID).
 * @param {string} id_can_tim - ID của trường cần lấy fallback.
 * @returns {string} Giá trị mặc định hoặc chuỗi rỗng.
 */
export function getScannerFallback(id_can_tim) {
    const lKey = id_can_tim.toLowerCase();
    const d = new Date();

    const fallbacks = {
        'ngayky': String(d.getDate()).padStart(2, '0'),
        'thangky': String(d.getMonth() + 1).padStart(2, '0'),
        'thangky1': String(d.getMonth() + 1).padStart(2, '0'),
        'namky': String(d.getFullYear()),
        'namky1': String(d.getFullYear()),
        'soluonggoi': '1',
        'noiky': 'Hà Nội',
        'noicap': 'Cục trưởng Cục Cảnh sát QLHC về TTXH',
        'noicapsodkdn': '',
        'chucvu': 'Giám Đốc'
    };

    return fallbacks[lKey] || '';
}
