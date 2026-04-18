/**
<<<<<<< HEAD
 * @file polyfills.js
 * @desc Giả lập các hàm GM_ của Tampermonkey trong môi trường Extension.
 */

if (typeof GM_addStyle === 'undefined') {
    window.GM_addStyle = function(css) {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
=======
 * polyfills.js
 * Giả lập các hàm Tampermonkey (GM_*) khi chạy trong môi trường Chrome Extension.
 */

if (typeof GM_addStyle === 'undefined') {
    window.GM_addStyle = (css) => {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.append(style);
>>>>>>> origin/main
    };
}

if (typeof GM_setValue === 'undefined') {
<<<<<<< HEAD
    window.GM_setValue = function(key, value) {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
=======
    window.GM_setValue = (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
>>>>>>> origin/main
    };
}

if (typeof GM_getValue === 'undefined') {
<<<<<<< HEAD
    window.GM_getValue = function(key, defaultValue) {
        const val = localStorage.getItem(key);
        if (val === null) return defaultValue;
        try {
            return JSON.parse(val);
        } catch (e) {
            return val;
        }
=======
    window.GM_getValue = (key, defaultValue) => {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    };
}

// Giả lập các hàm khác nếu cần
if (typeof GM_xmlhttpRequest === 'undefined') {
    window.GM_xmlhttpRequest = (details) => {
        fetch(details.url, {
            method: details.method,
            headers: details.headers,
            body: details.data
        })
        .then(res => res.text())
        .then(text => details.onload({ responseText: text }))
        .catch(err => details.onerror(err));
>>>>>>> origin/main
    };
}
