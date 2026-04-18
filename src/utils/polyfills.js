/**
 * @file polyfills.js
 * @desc Giả lập các hàm GM_ của Tampermonkey trong môi trường Extension.
 * Giúp code dùng chung (src/) chạy được ở cả hai môi trường mà không bị lỗi undefined.
 */

// 1. Giả lập GM_addStyle
if (typeof GM_addStyle === 'undefined') {
    window.GM_addStyle = function(css) {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    };
}

// 2. Giả lập GM_setValue (Ưu tiên dùng chuẩn JSON)
if (typeof GM_setValue === 'undefined') {
    window.GM_setValue = function(key, value) {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    };
}

// 3. Giả lập GM_getValue
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

// 4. Giả lập GM_xmlhttpRequest (Dùng Fetch API)
if (typeof GM_xmlhttpRequest === 'undefined') {
    window.GM_xmlhttpRequest = function(details) {
        fetch(details.url, {
            method: details.method || 'GET',
            headers: details.headers,
            body: details.data
        })
        .then(res => {
            const response = {
                status: res.status,
                statusText: res.statusText,
                readyState: 4,
                responseHeaders: res.headers
            };
            return res.text().then(text => {
                response.responseText = text;
                if (details.onload) details.onload(response);
            });
        })
        .catch(err => {
            if (details.onerror) details.onerror(err);
        });
    };
}

// 5. Giả lập GM_info
if (typeof GM_info === 'undefined') {
    window.GM_info = {
        script: { version: '1.6.55' },
        isExtension: true
    };
}
