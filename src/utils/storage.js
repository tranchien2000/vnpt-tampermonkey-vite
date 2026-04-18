/**
 * @file storage.js
 * @desc Hệ thống lưu trữ trực tiếp cho Tampermonkey Userscript.
 * Luôn đọc/ghi trực tiếp từ GM_getValue/GM_setValue để tránh lỗi đồng bộ khi F5.
 */

export const Storage = {
    /**
     * Lấy dữ liệu TRỰC TIẾP từ bộ nhớ thực tế (Không dùng Cache)
     */
    get(key, defaultValue = null) {
        try {
            let data;
            if (typeof GM_getValue !== 'undefined') {
                data = GM_getValue(key, null);
            } else {
                data = localStorage.getItem(key);
            }

            if (data === null || data === undefined) return defaultValue;
            
            // Tự động Parse nếu là dữ liệu có cấu trúc (JSON), ngược lại trả về chuỗi thuần (API Key)
            if (typeof data === 'string' && (data.startsWith('{') || data.startsWith('['))) {
                try {
                    return JSON.parse(data);
                } catch (e) {
                    return data;
                }
            }
            return data;
        } catch (e) {
            return defaultValue;
        }
    },

    /**
     * Lưu dữ liệu trực tiếp vào bộ nhớ vĩnh viễn
     */
    set(key, value) {
        try {
            const stringified = (typeof value === 'object') ? JSON.stringify(value) : value;
            if (typeof GM_setValue !== 'undefined') {
                GM_setValue(key, stringified);
            } else {
                localStorage.setItem(key, stringified);
            }
            return true;
        } catch (e) {
            console.error(`[Storage] Set error for ${key}:`, e);
            return false;
        }
    },

    /**
     * Lưu dữ liệu có độ trễ để bảo vệ ổ đĩa
     */
    _timers: new Map(),
    setDebounced(key, value, delay = 1000) {
        if (this._timers.has(key)) clearTimeout(this._timers.get(key));
        
        const timer = setTimeout(() => {
            this.set(key, value);
            this._timers.delete(key);
        }, delay);
        this._timers.set(key, timer);
    },

    /**
     * Xóa dữ liệu
     */
    remove(key) {
        if (typeof GM_deleteValue !== 'undefined') {
            GM_deleteValue(key);
        } else {
            localStorage.removeItem(key);
        }
    },

    /** 
     * Tương thích với các lệnh gọi cũ trong main.js 
     */
    async init() {
        return Promise.resolve();
    }
};
