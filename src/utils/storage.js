/**
 * @file storage.js
 * @desc Hệ thống lưu trữ đồng nhất cho Tampermonkey và Chrome Extension.
 * Hỗ trợ Prefix để tránh xung đột giữa bản Extension và Userscript.
 * Đã tối ưu cho cả chrome.storage.local (Async) và localStorage (Sync).
 */

const IS_EXT = typeof chrome !== 'undefined' && !!chrome.runtime?.id && !!chrome.storage;
const PREFIX = IS_EXT ? 'v_ext_' : 'v_tm_';

const cache = new Map();
const debounceTimers = new Map();

export const Storage = {
    isExt: IS_EXT,
    isGM: typeof GM_setValue !== 'undefined' && typeof GM_getValue !== 'undefined',

    /**
     * Khởi tạo: Nạp trước toàn bộ dữ liệu vào Cache
     */
    async init() {
        if (this.isExt) {
            try {
                // Extension: Nạp từ chrome.storage.local
                const allData = await chrome.storage.local.get(null);
                Object.keys(allData).forEach(key => {
                    try {
                        const val = allData[key];
                        // Lưu vào cache với key gốc (không prefix vì Ext storage đã độc lập)
                        cache.set(key, typeof val === 'string' ? JSON.parse(val) : val);
                    } catch (e) {
                        cache.set(key, allData[key]);
                    }
                });
                console.log(`[Storage] Ext initialized. Cached ${cache.size} keys.`);
            } catch (e) {
                console.error("[Storage] Failed to init Extension Storage:", e);
            }
        } else {
            // Userscript: Nạp từ localStorage có Prefix
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(PREFIX)) {
                        try {
                            const realKey = key.replace(PREFIX, '');
                            const val = localStorage.getItem(key);
                            cache.set(realKey, JSON.parse(val));
                        } catch (e) {}
                    }
                }
                console.log(`[Storage] TM initialized with prefix: ${PREFIX}. Cached ${cache.size} keys.`);
            } catch (e) {
                console.error("[Storage] Failed to init LocalStorage:", e);
            }
        }
    },

    /**
     * Lấy dữ liệu (Ưu tiên từ Cache - Đồng bộ)
     */
    get(key, defaultValue = null) {
        if (cache.has(key)) return cache.get(key);
        
        // Fallback cho môi trường không phải Ext (hoặc chưa kịp nạp)
        if (!this.isExt) {
            try {
                const val = localStorage.getItem(PREFIX + key);
                if (val) {
                    const parsed = JSON.parse(val);
                    cache.set(key, parsed);
                    return parsed;
                }
            } catch (e) {}
        }
        return defaultValue;
    },

    /**
     * Lấy dữ liệu bất đồng bộ (Đảm bảo đọc từ đĩa)
     */
    async getAsync(key, defaultValue = null) {
        if (this.isExt) {
            try {
                const result = await chrome.storage.local.get(key);
                const data = result[key];
                if (data !== undefined) {
                    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                    cache.set(key, parsed);
                    return parsed;
                }
            } catch (e) {}
        }
        return this.get(key, defaultValue);
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
                GM_setValue(PREFIX + key, stringified);
            } else {
                localStorage.setItem(PREFIX + key, stringified);
            }
            return true;
        } catch (e) {
            console.error(`[Storage] Failed to set key: ${key}`, e);
            return false;
        }
    },

    /**
     * Lưu dữ liệu có delay
     */
    setDebounced(key, value, delay = 500) {
        cache.set(key, value);
        if (debounceTimers.has(key)) clearTimeout(debounceTimers.get(key));
        const timer = setTimeout(() => {
            this.set(key, value);
            debounceTimers.delete(key);
        }, delay);
        debounceTimers.set(key, timer);
    },

    /**
     * Xóa key
     */
    remove(key) {
        cache.delete(key);
        try {
            if (this.isExt) {
                chrome.storage.local.remove(key);
            } else {
                localStorage.removeItem(PREFIX + key);
                if (this.isGM) {
                    try { GM_deleteValue(PREFIX + key); } catch(e) {}
                }
            }
        } catch (e) {}
    },

    /**
     * Xóa sạch cache
     */
    clearCache() {
        cache.clear();
    }
};
