/**
 * @file storage.js
 * @desc Hệ thống lưu trữ đồng nhất cho Tampermonkey và Chrome Extension.
 * Hỗ trợ Cache để truy cập đồng bộ nhanh trong UI.
 */

const cache = new Map();

export const Storage = {
    isGM: typeof GM_setValue !== 'undefined',
    isExt: typeof chrome !== 'undefined' && !!chrome.storage && !!chrome.storage.local,

    /**
     * Lấy dữ liệu từ Cache (Đồng bộ)
     */
    get(key, defaultValue = null) {
        if (cache.has(key)) return cache.get(key);
        return defaultValue;
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
     * Lưu dữ liệu
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
     * Khởi tạo: Nạp trước toàn bộ dữ liệu vào Cache
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
                console.log(`[Storage] Pre-loaded ${cache.size} keys.`);
            } catch (e) {
                console.error("[Storage] Init failed:", e);
            }
        }
    },

    clearCache() {
        cache.clear();
    }
};
