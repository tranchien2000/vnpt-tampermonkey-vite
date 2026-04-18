/**
 * polyfills.js
 * Giả lập các hàm Tampermonkey (GM_*) khi chạy trong môi trường Chrome Extension.
 */

if (typeof GM_addStyle === 'undefined') {
    window.GM_addStyle = (css) => {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.append(style);
    };
}

if (typeof GM_setValue === 'undefined') {
    window.GM_setValue = (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    };
}

if (typeof GM_getValue === 'undefined') {
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
    };
}
