// ==UserScript==
// @name         VNPT Word Automation (DEV)
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  DEV ONLY - Load script từ localhost để chỉnh sửa realtime. Chạy: npm run dev:all
// @author       You
// @match        *://hopdong.vnpt.vn/*
// @match        *://mail.google.com/*
// @match        *://outlook.live.com/*
// @match        *://outlook.office.com/*
// @match        *://outlook.office365.com/*
// @require      https://cdn.jsdelivr.net/npm/docxtemplater@3.37.11/build/docxtemplater.js
// @require      https://cdn.jsdelivr.net/npm/pizzip@3.1.4/dist/pizzip.js
// @require      https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// @grant        GM_notification
// @grant        GM_setClipboard
// @connect      localhost
// @connect      raw.githubusercontent.com
// @connect      firebaseio.com
// @connect      googleapis.com
// @connect      firebasestorage.googleapis.com
// @connect      *
// ==/UserScript==

(function() {
    'use strict';
    let lastScriptContent = '';
    const pollInterval = 2000; // Giảm xuống 2s để reload nhanh hơn

    function loadScript() {
        const url = `http://localhost:8788/myscript.user.js?t=${Date.now()}`;

        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            onload: function(response) {
                if (response.status === 200) {
                    if (response.responseText === lastScriptContent) {
                        return; // No change
                    }

                    console.log('%c[VNPT-DEV] Detecting script change, reloading...', 'color: #1a73e8; font-weight: bold;');
                    
                    // 1. Cleanup old version
                    if (typeof window.__vnptCleanup === 'function') {
                        try {
                            window.__vnptCleanup();
                        } catch (e) {
                            console.error('[VNPT-DEV] Cleanup failed:', e);
                        }
                    }

                    // 2. Update content and inject
                    lastScriptContent = response.responseText;
                    
                    try {
                        // Cần xóa flag inited của TM cũ nếu có (trong trường hợp script cũ không có cleanup)
                        window.__vnptInited = false;
                        
                        eval(response.responseText);
                        console.log('%c[VNPT-DEV] Hot Reload Successful!', 'color: #1e8e3e; font-weight: bold;');
                    } catch (e) {
                        console.error('[VNPT-DEV] Eval failed:', e);
                    }
                } else {
                    console.error('[VNPT-DEV] Failed to load script from localhost.');
                }
            },
            onerror: function(err) {
                console.error('[VNPT-DEV] Error fetching script:', err);
            }
        });
    }

    // Start polling
    console.log('%c[VNPT-DEV] Hot Reload enabled (polling every 2s)', 'color: #f2a500; font-weight: bold;');
    setInterval(loadScript, pollInterval);
    loadScript(); // Initial load
})();
