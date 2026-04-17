/**
 * @file polyfills.js
 * @desc Giả lập các hàm GM_ của Tampermonkey trong môi trường Extension.
 */

if (typeof GM_addStyle === 'undefined') {
    window.GM_addStyle = function(css) {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    };
}

if (typeof GM_setValue === 'undefined') {
    window.GM_setValue = function(key, value) {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    };
}

if (typeof GM_getValue === 'undefined') {
    window.GM_getValue = function(key, defaultValue) {
        const val = localStorage.getItem(key);
        if (val === null) return defaultValue;
        try {
            return JSON.parse(val);
        } catch (e) {
            return val;
        }
    };
}
