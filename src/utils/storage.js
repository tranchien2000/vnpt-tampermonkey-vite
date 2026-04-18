/**
 * @file storage.js
 * @desc Hệ thống lưu trữ đồng nhất cho Tampermonkey và Chrome Extension.
 * Hỗ trợ Prefix để tránh xung đột giữa bản Extension và Userscript.
 */

const IS_EXT = typeof chrome !== 'undefined' && !!chrome.runtime?.id;
const PREFIX = IS_EXT ? 'v_ext_' : 'v_tm_';

const cache = new Map();

export const Storage = {
    isExt: IS_EXT,

    /**
     * Khởi tạo: Nạp dữ liệu từ localStorage/GM vào Cache
     */
    async init() {
        // Trong môi trường extension hoặc userscript, chúng ta dùng localStorage là đơn giản nhất cho đồng bộ
        // Nếu muốn dùng chrome.storage.local (Async), chúng ta phải nạp vào cache lúc khởi tạo
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(PREFIX)) {
                try {
                    const realKey = key.replace(PREFIX, '');
                    cache.set(realKey, JSON.parse(localStorage.getItem(key)));
                } catch (e) {}
            }
        }
        console.log(`[Storage] Initialized with prefix: ${PREFIX}`);
    },

    get(key, defaultValue = null) {
        if (cache.has(key)) return cache.get(key);
        
        // Fallback đọc trực tiếp nếu chưa có trong cache
        const prefixedKey = PREFIX + key;
        try {
            const val = localStorage.getItem(prefixedKey);
            if (val) {
                const parsed = JSON.parse(val);
                cache.set(key, parsed);
                return parsed;
            }
        } catch (e) {}
        return defaultValue;
    },

    set(key, value) {
        cache.set(key, value);
        const prefixedKey = PREFIX + key;
        try {
            localStorage.setItem(prefixedKey, JSON.stringify(value));
        } catch (e) {}
    },

    remove(key) {
        cache.delete(key);
        localStorage.removeItem(PREFIX + key);
    },

    // Giữ nguyên tính năng debounced để tránh ghi đĩa quá nhiều
    setDebounced(key, value, delay = 500) {
        if (this[`_timer_${key}`]) clearTimeout(this[`_timer_${key}`]);
        this[`_timer_${key}`] = setTimeout(() => {
            this.set(key, value);
        }, delay);
    }
};
