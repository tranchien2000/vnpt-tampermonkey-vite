// ==UserScript==
// @name         VNPT Word Automation (DEV)
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  DEV ONLY - Load script từ localhost để chỉnh sửa realtime. Chạy: npm run dev:all
// @author       You
// @match        *://hopdong.vnpt.vn/*
// @require      https://cdn.jsdelivr.net/npm/docxtemplater@3.37.11/build/docxtemplater.js
// @require      https://cdn.jsdelivr.net/npm/pizzip@3.1.4/dist/pizzip.js
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      localhost
// @connect      drive.google.com
// @connect      raw.githubusercontent.com
// @connect      firebaseio.com
// @connect      googleapis.com
// @connect      firebasestorage.googleapis.com
// @connect      *
// ==/UserScript==

(function() {
    'use strict';
    // Bypass cached file from localhost by adding a timestamp
    const url = `http://localhost:8788/myscript.dev.js?t=${Date.now()}`;

    GM_xmlhttpRequest({
        method: "GET",
        url: url,
        onload: function(response) {
            if (response.status === 200) {
                console.log('%c[VNPT-DEV] Script loaded from localhost!', 'color: #1e8e3e; font-weight: bold;');
                eval(response.responseText);
            } else {
                console.error('[VNPT-DEV] Failed to load script from localhost. Make sure "npm run dev:all" is running.');
            }
        },
        onerror: function(err) {
            console.error('[VNPT-DEV] Error fetching script from localhost:', err);
        }
    });
})();
