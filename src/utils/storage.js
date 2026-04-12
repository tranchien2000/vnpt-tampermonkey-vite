/**
 * @file storage.js
 * @desc Tiện ích quản lý dữ liệu lưu trữ (Hỗ trợ localStorage và Tampermonkey GM_storage).
 *       Đã tối ưu: JSON tự động, xử lý lỗi, Debounce ghi đĩa và Cache nội bộ.
 */

const cache = new Map();
const debounceTimers = new Map();

export const Storage = {
    /**
     * Kiểm tra xem môi trường có hỗ trợ GM_setValue/getValue không
     */
    isGM: typeof GM_setValue !== 'undefined' && typeof GM_getValue !== 'undefined',

    /**
     * Lấy dữ liệu từ storage (có cache)
     * @param {string} key 
     * @param {*} defaultValue 
     * @returns {*}
     */
    get(key, defaultValue = null) {
        if (cache.has(key)) return cache.get(key);

        try {
            let data;
            if (this.isGM) {
                data = GM_getValue(key, null);
            } else {
                data = localStorage.getItem(key);
            }

            if (data === null || data === undefined) return defaultValue;
            
            let parsed;
            if (typeof data === 'string') {
                try {
                    parsed = JSON.parse(data);
                } catch (e) {
                    // Nếu không phải JSON (VD: string thuần túy từ bản cũ), trả về chính nó
                    parsed = data;
                }
            } else {
                parsed = data;
            }

            cache.set(key, parsed);
            return parsed;
        } catch (e) {
            console.warn(`[Storage] Không thể đọc key "${key}":`, e);
            return defaultValue;
        }
    },

    /**
     * Lưu dữ liệu vào storage ngay lập tức
     * @param {string} key 
     * @param {*} value 
     */
    set(key, value) {
        cache.set(key, value);
        try {
            const stringified = JSON.stringify(value);
            if (this.isGM) {
                GM_setValue(key, stringified);
            } else {
                localStorage.setItem(key, stringified);
            }
            return true;
        } catch (e) {
            console.error(`[Storage] Không thể ghi key "${key}":`, e);
            return false;
        }
    },

    /**
     * Lưu dữ liệu có delay (Debounce) để tránh ghi đĩa liên tục
     * @param {string} key 
     * @param {*} value 
     * @param {number} delay 
     */
    setDebounced(key, value, delay = 500) {
        cache.set(key, value); // Cập nhật cache ngay lập tức để UI mượt

        if (debounceTimers.has(key)) {
            clearTimeout(debounceTimers.get(key));
        }

        const timer = setTimeout(() => {
            this.set(key, value);
            debounceTimers.delete(key);
        }, delay);

        debounceTimers.set(key, timer);
    },

    /**
     * Xóa key khỏi storage
     * @param {string} key 
     */
    remove(key) {
        cache.delete(key);
        try {
            if (this.isGM) {
                GM_deleteValue(key);
            } else {
                localStorage.removeItem(key);
            }
        } catch (e) {
            console.error(`[Storage] Không thể xóa key "${key}":`, e);
        }
    },

    /**
     * Xóa toàn bộ cache (ép buộc đọc lại từ đĩa)
     */
    clearCache() {
        cache.clear();
    }
};
