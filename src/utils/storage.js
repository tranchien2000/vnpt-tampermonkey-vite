/**
 * @file storage.js
 * @desc Tiện ích quản lý dữ liệu lưu trữ (Hỗ trợ localStorage và Tampermonkey GM_storage).
 *       Đã tối ưu: JSON tự động, xử lý lỗi, Debounce ghi đĩa và Cache nội bộ.
 */

const cache = new Map();
const debounceTimers = new Map();

export const Storage = {
    /**
     * Kiểm tra xem môi trường có hỗ trợ GM_setValue/getValue hoặc Chrome Storage không
     */
    isGM: typeof GM_setValue !== 'undefined' && typeof GM_getValue !== 'undefined',
    isExt: typeof chrome !== 'undefined' && !!chrome.storage && !!chrome.storage.local,

    /**
     * Lấy dữ liệu từ storage (có cache)
     * @param {string} key 
     * @param {*} defaultValue 
     * @returns {*}
     */
    async get(key, defaultValue = null) {
        if (cache.has(key)) return cache.get(key);

        try {
            let data;
            if (this.isExt) {
                // Extension: Dùng chrome.storage.local (Bất đồng bộ)
                const result = await chrome.storage.local.get(key);
                data = result[key];
            } else if (this.isGM) {
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
     * Đồng bộ: Lấy dữ liệu từ Cache (Dùng cho UI cần phản hồi ngay)
     * Lưu ý: Cần đảm bảo init đã chạy xong để cache có dữ liệu
     */
    getSync(key, defaultValue = null) {
        return cache.has(key) ? cache.get(key) : defaultValue;
    },

    /**
     * Lưu dữ liệu vào storage ngay lập tức
     * @param {string} key 
     * @param {*} value 
     */
    async set(key, value) {
        cache.set(key, value);
        try {
            const stringified = JSON.stringify(value);
            if (this.isExt) {
                await chrome.storage.local.set({ [key]: stringified });
            } else if (this.isGM) {
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
     */
    async remove(key) {
        cache.delete(key);
        try {
            if (this.isExt) {
                await chrome.storage.local.remove(key);
            } else if (this.isGM) {
                GM_deleteValue(key);
            } else {
                localStorage.removeItem(key);
            }
        } catch (e) {
            console.error(`[Storage] Không thể xóa key "${key}":`, e);
        }
    },

    /**
     * Khởi tạo: Nạp trước các key quan trọng vào Cache (Vì Ext Storage là Async)
     */
    async init(keys = []) {
        for (const key of keys) {
            await this.get(key);
        }
    },

    /**
     * Xóa toàn bộ cache (ép buộc đọc lại từ đĩa)
     */
    clearCache() {
        cache.clear();
    }
};
