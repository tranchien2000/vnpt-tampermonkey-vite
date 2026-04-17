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
     * Lấy dữ liệu từ Cache (Đồng bộ)
     * Ưu tiên dùng hàm này trong UI và Logic xử lý nhanh
     */
    get(key, defaultValue = null) {
        if (cache.has(key)) return cache.get(key);

        try {
            // Fallback sang localStorage nếu chưa có trong cache (Chỉ dùng cho môi trường không phải Ext)
            if (!this.isExt) {
                const data = this.isGM ? GM_getValue(key, null) : localStorage.getItem(key);
                if (data !== null && data !== undefined) {
                    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                    cache.set(key, parsed);
                    return parsed;
                }
            }
            return defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },

    /**
     * Lấy dữ liệu bất đồng bộ (Đảm bảo đọc từ đĩa)
     */
    async getAsync(key, defaultValue = null) {
        try {
            let data;
            if (this.isExt) {
                const result = await chrome.storage.local.get(key);
                data = result[key];
            } else if (this.isGM) {
                data = GM_getValue(key, null);
            } else {
                data = localStorage.getItem(key);
            }

            if (data === null || data === undefined) return defaultValue;
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            cache.set(key, parsed);
            return parsed;
        } catch (e) {
            return defaultValue;
        }
    },

    /**
     * Lưu dữ liệu (Hỗ trợ cả Sync và Async ngầm)
     */
    set(key, value) {
        cache.set(key, value);
        const stringified = JSON.stringify(value);
        try {
            if (this.isExt) {
                chrome.storage.local.set({ [key]: stringified });
            } else if (this.isGM) {
                GM_setValue(key, stringified);
            } else {
                localStorage.setItem(key, stringified);
            }
            return true;
        } catch (e) {
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
     * Khởi tạo: Nạp trước toàn bộ dữ liệu từ Chrome Storage vào Cache (Vì Ext Storage là Async)
     */
    async init() {
        if (this.isExt) {
            try {
                const allData = await chrome.storage.local.get(null);
                Object.keys(allData).forEach(key => {
                    try {
                        const val = allData[key];
                        cache.set(key, typeof val === 'string' ? JSON.parse(val) : val);
                    } catch (e) {
                        cache.set(key, allData[key]);
                    }
                });
                console.log(`[Storage] Pre-loaded ${cache.size} keys from Extension Storage.`);
            } catch (e) {
                console.error("[Storage] Failed to initialize Cache:", e);
            }
        }
    },

    /**
     * Xóa toàn bộ cache (ép buộc đọc lại từ đĩa)
     */
    clearCache() {
        cache.clear();
    }
};
