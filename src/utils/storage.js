/**
 * @file storage.js
 * @desc Tiện ích quản lý dữ liệu lưu trữ (localStorage).
 *       Hỗ trợ JSON tự động và xử lý lỗi tập trung.
 */

export const Storage = {
    /**
     * Lấy dữ liệu từ storage
     * @param {string} key 
     * @param {*} defaultValue 
     * @returns {*}
     */
    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            if (data === null) return defaultValue;
            return JSON.parse(data);
        } catch (e) {
            console.warn(`[Storage] Không thể đọc key "${key}":`, e);
            return defaultValue;
        }
    },

    /**
     * Lưu dữ liệu vào storage
     * @param {string} key 
     * @param {*} value 
     * @returns {boolean} Thành công hay thất bại
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`[Storage] Không thể ghi key "${key}":`, e);
            return false;
        }
    },

    /**
     * Xóa key khỏi storage
     * @param {string} key 
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error(`[Storage] Không thể xóa key "${key}":`, e);
        }
    }
};
