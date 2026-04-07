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
import { getVNPTDateStrings } from '../utils/dateHelper.js';

export function getScannerFallback(id_can_tim) {
    const lKey = id_can_tim.toLowerCase();
    const { ngay, thang, nam } = getVNPTDateStrings();

    const fallbacks = {
        'ngayky': ngay,
        'thangky': thang,
        'thangky1': thang,
        'namky': nam,
        'namky1': nam,
        'soluonggoi': '1',
        'noiky': 'Hà Nội',
        'noicap': 'Cục trưởng Cục Cảnh sát QLHC về TTXH',
        'noicapsodkdn': '',

        'chucvu': 'Giám Đốc'
    };

    return fallbacks[lKey] || '';
}
