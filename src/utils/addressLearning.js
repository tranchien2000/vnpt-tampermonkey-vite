/**
 * @file addressLearning.js
 * @desc Tiện ích quản lý việc "học" bóc tách địa chỉ từ dữ liệu thực tế.
 */
import { Storage } from './storage.js';
import { SK_ADDRESS_LEARNING } from '../core/constants.js';

/**
 * Chuẩn hóa địa chỉ để tăng tỷ lệ khớp (loại bỏ khoảng trắng thừa, lowercase, xóa dấu kết thúc)
 * @param {string} address 
 * @returns {string}
 */
function normalizeForMatch(address) {
    if (!address) return '';
    return address.toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[.,\s]+$/, ''); // Xóa dấu phẩy, chấm, khoảng trắng ở cuối
}

export const AddressLearning = {
    /**
     * Lưu kết quả học được từ người dùng
     * @param {string} fullAddress - Địa chỉ gốc ban đầu
     * @param {string} correctedStreet - Kết quả bóc tách phần đường mà người dùng đã sửa
     */
    saveLearning(fullAddress, correctedStreet) {
        if (!fullAddress || !correctedStreet) return;

        const normalizedFull = normalizeForMatch(fullAddress);
        const normalizedStreet = correctedStreet.trim();

        const data = Storage.get(SK_ADDRESS_LEARNING, {});
        
        // Nếu đã khớp từ trước và giống hệt giá trị đang định lưu thì bỏ qua
        if (data[normalizedFull] === normalizedStreet) return;

        data[normalizedFull] = normalizedStreet;
        Storage.setDebounced(SK_ADDRESS_LEARNING, data, 1000);
        console.debug(`[AddressLearning] Learned: "${normalizedFull}" -> "${normalizedStreet}"`);
    },

    /**
     * Lấy giá trị đã học được cho địa chỉ cụ thể
     * @param {string} fullAddress 
     * @returns {string|null}
     */
    getLearnedStreet(fullAddress) {
        if (!fullAddress) return null;

        const normalized = normalizeForMatch(fullAddress);
        const data = Storage.get(SK_ADDRESS_LEARNING, {});
        
        return data[normalized] || null;
    },

    /**
     * Xóa dữ liệu học của một địa chỉ cụ thể (nếu cần)
     * @param {string} fullAddress 
     */
    forgetLearning(fullAddress) {
        if (!fullAddress) return;
        const normalized = normalizeForMatch(fullAddress);
        const data = Storage.get(SK_ADDRESS_LEARNING, {});
        if (data[normalized]) {
            delete data[normalized];
            Storage.set(SK_ADDRESS_LEARNING, data);
        }
    }
};
