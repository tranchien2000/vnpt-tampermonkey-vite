// ==UserScript==
// @name         VNPT Word Automation
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Tool tự động lấy dữ liệu trên portal VNPT
// @author       You
// @match        *://hopdong.vnpt.vn/*
// @require      https://cdn.jsdelivr.net/npm/docxtemplater@3.37.11/build/docxtemplater.js
// @require      https://cdn.jsdelivr.net/npm/pizzip@3.1.4/dist/pizzip.js
// @updateURL    https://raw.githubusercontent.com/tranchien2000/vnpt-tampermonkey-vite/main/dist/myscript.user.js
// @downloadURL  https://raw.githubusercontent.com/tranchien2000/vnpt-tampermonkey-vite/main/dist/myscript.user.js
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
(function(){"use strict";const It={info:(...n)=>console.log("[Tampermonkey Script] INFO:",...n),error:(...n)=>console.error("[Tampermonkey Script] ERROR:",...n),warn:(...n)=>console.warn("[Tampermonkey Script] WARN:",...n)};function lp(){const n="vnpt-styles";if(document.getElementById(n))return;const e=document.createElement("style");e.id=n,e.textContent=`
        :root {
            --vnpt-primary: #1a73e8;
            --vnpt-primary-hover: #1557b0;
            --vnpt-primary-light: rgba(26, 115, 232, 0.1);
            --vnpt-primary-grad: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
            --vnpt-danger: #ea4335;
            --vnpt-danger-hover: #d93025;
            --vnpt-success: #1e8e3e;
            --vnpt-bg-glass: rgba(255, 255, 255, 0.82);
            --vnpt-border: rgba(0, 0, 0, 0.08);
            --vnpt-border-bright: rgba(255, 255, 255, 0.4);
            --vnpt-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
            --vnpt-radius: 16px;
            --vnpt-font: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* ═══════════════════════════════════════════
           SECTION 1: WIDGET CONTAINER & TOGGLE BTN
           ═══════════════════════════════════════════ */
        #vnpt-docx-widget { position: fixed; top: 100px; right: 50px; z-index: 999999; font-family: var(--vnpt-font); }

        #vnpt-toggle-btn.btn-closed { 
            position: absolute; right: 10px; top: 10px;
            width: 32px; height: 32px; font-size: 14px; border-radius: 8px;
            background: var(--vnpt-primary); color: white; border: none; 
            cursor: pointer; display: flex; align-items: center; justify-content: center; 
            box-shadow: 0 4px 12px rgba(26, 115, 232, 0.4); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 10;
        }
        #vnpt-toggle-btn.btn-closed:hover { transform: scale(1.1) rotate(5deg); background: var(--vnpt-primary-hover); }

        #vnpt-toggle-btn.btn-opened {
            position: absolute; right: 10px; top: 2px;
            width: 32px; height: 32px; font-size: 14px; border-radius: 8px;
            background: var(--vnpt-danger); color: white; border: none;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 12px rgba(234, 67, 53, 0.4); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 10;
        }
        #vnpt-toggle-btn.btn-opened:hover { transform: scale(1.1) rotate(-5deg); background: var(--vnpt-danger-hover); }

        /* ═══════════════════════════════════════════
           SECTION 2: EXPORT PANEL LAYOUT & HEADER
           ═══════════════════════════════════════════ */
        #vnpt-export-panel { 
            position: relative; 
            width: 460px; min-width: 360px; 
            height: auto; min-height: 250px;
            max-height: 92vh; max-width: 98vw;
            display: flex; flex-direction: column; 
            background: var(--vnpt-bg-glass);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid var(--vnpt-border-bright);
            border-radius: var(--vnpt-radius); padding: 4px; 
            box-shadow: var(--vnpt-shadow);
            transition: width 0.2s ease, height 0.2s ease;
        }
        #vnpt-export-panel.vnpt-resizing { transition: none !important; user-select: none !important; }
        
        #vnpt-panel-body { display: flex; flex-direction: column; overflow: hidden; flex: 1; margin-top: 4px; border-radius: 12px; }

        #vnpt-panel-header { 
            margin: -4px -4px 0 -4px; padding: 4px 8px;
            border-bottom: 1px solid var(--vnpt-border); 
            cursor: move; user-select: none; 
            display: flex; align-items: center; justify-content: space-between; 
            background: rgba(255, 255, 255, 0.4);
            border-radius: var(--vnpt-radius) var(--vnpt-radius) 0 0;
            gap: 4px;
            position: relative;
        }
        #vnpt-panel-header::after {
            content: ""; position: absolute; bottom: -1px; left: 12px; right: 12px;
            height: 1px; background: linear-gradient(90deg, transparent, var(--vnpt-primary), transparent);
            opacity: 0.3;
        }
        #vnpt-panel-header:hover { background: rgba(255, 255, 255, 0.6); }
        
        .header-left { display: flex; align-items: center; min-width: 60px; flex-shrink: 0; }
        .header-center { display: flex; gap: 4px; flex: 1; justify-content: center; min-width: 0; overflow: hidden; }
        .header-right { 
            display: flex; gap: 4px; align-items: center; 
            margin-right: 34px; flex-shrink: 0;
        }

        #vnpt-panel-title { 
            font-size: 13px; font-weight: 800; letter-spacing: 0.5px;
            background: var(--vnpt-primary-grad);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-transform: uppercase;
        }

        /* ═══════════════════════════════════════════
           SECTION 3: FIELDS CONTAINER & FIELD ROWS
           ═══════════════════════════════════════════ */
        #vnpt-fields-container { 
            flex: 1; overflow: hidden; background: rgba(255, 255, 255, 0.3); 
            border: 1px solid var(--vnpt-border); border-radius: 12px; 
            margin-bottom: 4px; position: relative; display: flex; flex-direction: column; 
            box-shadow: inset 0 2px 10px rgba(0,0,0,0.02);
            transition: all 0.3s ease;
        }
        #vnpt-fields-container.vnpt-mode-default {
            border: 2px dashed var(--vnpt-danger);
            background: rgba(234, 67, 53, 0.05);
            box-shadow: inset 0 0 15px rgba(234, 67, 53, 0.1);
        }
        #vnpt-fields-list { flex: 1; overflow-y: auto; padding: 4px; }

        .vnpt-fields-header {
            display: flex; gap: 4px; padding: 2px 4px;
            background: rgba(255, 255, 255, 0.5); border-bottom: 1px solid var(--vnpt-border);
            font-size: 10px; font-weight: 800; color: #5f6368;
            align-items: center; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .vnpt-fields-header span { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .vnpt-fields-header .h-chk { flex: 0 0 24px; text-align: center; }
        .vnpt-fields-header .h-label { flex: 0.35; padding-left: 5px; }
        .vnpt-fields-header .h-key { flex: 0.45; display: none; padding-left: 5px; }
        .show-ids .vnpt-fields-header .h-key { display: block; }
        .vnpt-fields-header .h-drag { flex: 0 0 18px; }
        .vnpt-fields-header .h-val { flex: 1; padding-left: 50px; }

        .vnpt-field-row { 
            display: flex; gap: 4px; margin-bottom: 2px; align-items: center; 
            padding: 2px; border-radius: 10px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            background: rgba(255, 255, 255, 0.6); border: 1px solid transparent;
        }
        .vnpt-field-row:hover { 
            background: #fff; border-color: var(--vnpt-primary-light); 
            transform: translateX(4px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); 
        }
        
        .row-drag-handle { cursor: grab; padding: 0; font-size: 16px; color: #bdc1c6; user-select: none; flex: 0 0 18px; text-align: center; }
        .row-drag-handle:active { cursor: grabbing; }
        .vnpt-field-row.dragging { opacity: 0.4; }
        .vnpt-field-row.over { background-color: #e8f0fe; border: 1px dashed var(--vnpt-primary); }

        .vnpt-field-row input { 
            flex: 1; padding: 4px 8px; border: 1px solid #1f5bd2ff; border-radius: 6px; 
            font-size: 11.5px; transition: all 0.2s; background: #fff;
        }
        .vnpt-field-row input:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.1); outline: none; }
        
        .vnpt-field-row input.row-chk { flex: 0 0 24px; width: 16px; height: 16px; cursor: pointer; accent-color: var(--vnpt-primary); }
        .vnpt-field-row input.f-label { flex: 0.35; color: #1a73e8; font-weight: 700; background: rgba(26,115,232,0.03); }
        .vnpt-field-row input.f-key { display: none; flex: 0.45; font-weight: 700; color: #d63384; background: rgba(214,51,132,0.03); }
        .show-ids .vnpt-field-row input.f-key { display: block; }

        .vnpt-btn-hide { background: #f1f3f4; border: none; border-radius: 4px; font-size: 10px; cursor: pointer; padding: 4px 8px; color: #5f6368; font-weight: 600; }
        .vnpt-btn-hide:hover { background: #e8eaed; color: #3c4043; }
        
        .vnpt-btn-del { background: #fce8e6; color: var(--vnpt-danger); border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-weight: 700; font-size: 10px; }
        .vnpt-btn-del:hover { background: #f9d7d1; }

        /* MST Lookup Button */
        .mst-lookup-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            flex: 1;
        }
        .btn-mst-lookup {
            position: absolute;
            right: 4px;
            width: 22px;
            height: 22px;
            border-radius: 4px;
            border: none;
            background: var(--vnpt-primary-light);
            color: var(--vnpt-primary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            transition: all 0.2s;
            z-index: 5;
            padding: 0;
            line-height: 1;
        }
        .btn-mst-lookup:hover {
            background: var(--vnpt-primary);
            color: white;
            transform: scale(1.1);
        }
        .btn-mst-lookup.loading {
            pointer-events: none;
            opacity: 0.8;
        }
        .btn-mst-lookup .spinner {
            display: none;
            width: 12px;
            height: 12px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top: 2px solid currentColor;
            border-radius: 50%;
            animation: spin-small 0.8s linear infinite;
        }
        .btn-mst-lookup.loading .spinner { display: block; }
        .btn-mst-lookup.loading .icon { display: none; }

        /* Validation & Error States */
        @keyframes vnpt-shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-4px); }
            75% { transform: translateX(4px); }
        }
        .vnpt-shake { animation: vnpt-shake 0.3s ease-in-out; }
        
        .field-error { 
            border-color: #ea4335 !important; 
            background-color: #fff1f0 !important; 
            color: #ea4335 !important;
            box-shadow: 0 0 0 3px rgba(234, 67, 53, 0.1) !important;
        }
        .field-required-empty {
            border: 1px dashed var(--vnpt-danger) !important;
            background: rgba(234, 67, 53, 0.05) !important;
        }

        @keyframes spin-small { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        .vnpt-control-group { margin-bottom: 5px; }
        .vnpt-control-group label { display: block; font-weight: 700; font-size: 12px; color: #3c4043; margin-bottom: 2px; }
        .vnpt-control-group input[type="text"] { 
            width: 100%; box-sizing: border-box; padding: 8px 12px; 
            border: 1px solid #0055ffff; border-radius: 8px; font-size: 12px;
            background: #fff; transition: all 0.2s;
        }
        .vnpt-control-group input[type="text"]:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1); outline: none; }

        /* ═══════════════════════════════════════════
           SECTION 4: CONTROL BUTTONS
           ═══════════════════════════════════════════ */
        .vnpt-btn-action { 
            padding: 0 10px; height: 30px; 
            display: flex; align-items: center; justify-content: center; 
            font-weight: 700; font-size: 11px; cursor: pointer; 
            border-radius: 8px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
            white-space: nowrap; box-sizing: border-box; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            flex-shrink: 1; min-width: 0;
        }
        .vnpt-btn-action:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .vnpt-btn-action:active { transform: translateY(0) scale(0.96); }

        .vnpt-btn-icon {
            border: 1px solid #1f5bd2ff;
            background: rgba(0,0,0,0.03); width: 30px; height: 30px;
            display: flex; align-items: center; justify-content: center;
            font-size: 15px; cursor: pointer; border-radius: 8px;
            color: #5f6368; transition: all 0.2s;
        }
        .vnpt-btn-icon:hover { background: var(--vnpt-primary-light); color: var(--vnpt-primary); transform: scale(1.05); }
        .vnpt-btn-icon.active { background: var(--vnpt-primary); color: white; box-shadow: 0 4px 10px rgba(26, 115, 232, 0.3); }

        .btn-scan { background: #e6f4ea; color: var(--vnpt-success); border: 1px solid rgba(30, 142, 62, 0.1); } 
        .btn-scan:hover { background: var(--vnpt-success); color: #fff; border-color: transparent; }
        
        .btn-fill-back { background: #f3e5f5; color: #7b1fa2; border: 1px solid rgba(123, 31, 162, 0.1); } 
        .btn-fill-back:hover { background: #7b1fa2; color: #fff; border-color: transparent; }

        .btn-inspect { background: #fff8e1; color: #f57f17; border: 1px solid rgba(245, 127, 23, 0.1); }
        .btn-inspect:hover { background: #f57f17; color: #fff; border-color: transparent; }
        .btn-inspect.active { 
            background: #f57f17; color: #fff; 
            box-shadow: 0 4px 12px rgba(245, 127, 23, 0.4);
            animation: pulse-orange 1.5s infinite;
        }
        @keyframes pulse-orange {
            0% { box-shadow: 0 0 0 0 rgba(245, 127, 23, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(245, 127, 23, 0); }
            100% { box-shadow: 0 0 0 0 rgba(245, 127, 23, 0); }
        }

        .btn-restore { background: #e8f0fe; color: var(--vnpt-primary); border: 1px solid rgba(26, 115, 232, 0.1); }
        .vnpt-btn-restore:hover { background: var(--vnpt-primary); color: #fff; border-color: transparent; }
        
        /* ═══════════════════════════════════════════
           SECTION: BACKUP HISTORY DROPDOWN
           ═══════════════════════════════════════════ */
        .vnpt-backup-history {
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px); 
            border: 1px solid var(--vnpt-border);
            border-radius: 12px; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.25);
            width: 300px; 
            max-height: 380px; 
            overflow-y: auto;
            display: none; 
            flex-direction: column; 
            z-index: 1000000;
            padding: 6px; 
            animation: menuFadeIn 0.25s cubic-bezier(0.165, 0.84, 0.44, 1);
            transform-origin: top right;
        }
        .vnpt-backup-history.show { display: flex; }
        .backup-history-header {
            padding: 10px 12px;
            font-size: 11px;
            font-weight: 700;
            color: var(--vnpt-primary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid rgba(26, 115, 232, 0.1);
            background: rgba(26, 115, 232, 0.03);
            border-radius: 12px 12px 0 0;
            margin-bottom: 4px;
        }
        .backup-history-item {
            padding: 8px 10px; border-radius: 8px; cursor: pointer;
            transition: all 0.2s; border-bottom: 1px solid rgba(0,0,0,0.03);
            display: flex; flex-direction: column; gap: 2px;
        }
        .backup-history-item:hover { background: var(--vnpt-primary-light); color: var(--vnpt-primary); }
        .backup-history-name { font-size: 11.5px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .backup-history-time { font-size: 9px; opacity: 0.6; }
        .backup-history-empty { padding: 20px; text-align: center; font-size: 11px; color: #999; font-style: italic; }
        
        .btn-export { 
            background: var(--vnpt-primary-grad); 
            color: white; padding: 0 20px; font-weight: 800; 
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        } 
        .btn-export:hover { box-shadow: 0 6px 20px rgba(26, 115, 232, 0.4); }

        /* Utility Menu UI */
        .vnpt-util-dropdown { position: relative; }
        .vnpt-util-menu {
            position: absolute; top: calc(100% + 12px); right: 0;
            background: rgba(255, 255, 255, 0.95); 
            backdrop-filter: blur(15px);
            border: 1px solid var(--vnpt-border); border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15); z-index: 100000;
            display: none; flex-direction: column; min-width: 500px;
            padding: 4px 0; animation: menuFadeIn 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
            transform-origin: top right;
        }
        @keyframes menuFadeIn { 
            from { opacity: 0; transform: translateY(-15px) scale(0.9); } 
            to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        .vnpt-util-menu.show { display: flex; }
        
        .util-item {
            background: none; border: none; padding: 4px 12px; width: 100%;
            text-align: left; font-size: 12px; cursor: pointer;
            color: #3c4043; font-weight: 600; transition: all 0.2s;
            display: flex; align-items: center; gap: 6px;
            border-left: 3px solid transparent;
        }
        .util-item:hover { 
            background: rgba(26, 115, 232, 0.05); color: var(--vnpt-primary); 
            border-left-color: var(--vnpt-primary);
            padding-left: 18px;
        }
        
        .util-item.danger { color: var(--vnpt-danger); }
        .util-item.danger:hover { 
            background: #fff5f5; color: var(--vnpt-danger); 
            border-left-color: var(--vnpt-danger);
        }
        
        .util-separator { height: 1px; background: rgba(0,0,0,0.05); margin: 4px 0; }
        .util-submenu-title { 
            padding: 4px 12px 2px 12px; font-size: 9.5px; font-weight: 800; 
            color: #1a73e8; text-transform: uppercase; letter-spacing: 0.8px; 
            background: rgba(26, 115, 232, 0.04); margin-bottom: 1px;
        }

        /* 2-Column Grid for Top Config */
        .util-config-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            padding: 0;
        }
        .util-column { display: flex; flex-direction: column; }
        .util-column.vertical-separator { border-left: 1px solid var(--vnpt-border); }

        /* Mapping Rows in Utility Menu */
        .cw-row-map {
            display: flex; align-items: center; justify-content: space-between;
            padding: 1px 12px; gap: 4px;
        }
        .cw-row-map span { font-size: 11px; font-weight: 700; color: #5f6368; flex: 0 0 75px; }
        .cw-map-input {
            flex: 1; padding: 4px 8px; border: 1px solid #dadce0; border-radius: 6px;
            font-size: 10.5px; background: #fff; transition: all 0.2s;
        }
        .cw-map-input:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 2px var(--vnpt-primary-light); outline: none; }

        /* Profile Side B Selector */
        .profile-selector-wrapper {
            background: rgba(0,0,0,0.02); padding: 8px; border-radius: 12px;
            border: 1px solid var(--vnpt-border); margin: 4px 8px;
        }

        /* System Data Actions */
        .util-action-row { display: flex; padding: 3px 8px; gap: 4px; }
        .util-item-small {
            flex: 1; border: 1px solid #e0e0e0; background: #fff; color: #3c4043;
            padding: 5px 0; border-radius: 8px; font-size: 10.5px; font-weight: 700;
            cursor: pointer; transition: all 0.2s; text-align: center;
        }
        .util-item-small:hover { background: var(--vnpt-primary-light); color: var(--vnpt-primary); border-color: var(--vnpt-primary); }
        
        .size-options { display: flex; padding: 3px 8px; gap: 4px; }
        .size-options button {
            flex: 1; padding: 5px 0; border: 1px solid #e0e0e0; border-radius: 8px;
            background: #fff; font-size: 11px; font-weight: 700; cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            color: #5f6368;
        }
        .size-options button:hover { 
            background: var(--vnpt-primary); border-color: var(--vnpt-primary); color: #fff; 
            transform: translateY(-2px); box-shadow: 0 4px 8px rgba(26, 115, 232, 0.2);
        }
        .size-options button:active { transform: translateY(0); }

        /* Hotkey Config UI */
        .vnpt-hotkey-list { display: flex; flex-direction: column; padding: 3px 8px; gap: 3px; }
        .vnpt-hotkey-row {
            display: flex; align-items: center; justify-content: space-between;
            background: rgba(0,0,0,0.02); padding: 3px 8px; border-radius: 8px;
            transition: all 0.2s; border: 1px solid transparent;
        }
        .vnpt-hotkey-row:hover { 
            background: #fff; border-color: var(--vnpt-primary-light); 
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .vnpt-hotkey-label { font-size: 10.5px; font-weight: 700; color: #5f6368; }
        .vnpt-hotkey-btn {
            background: #fff; border: 1px solid #dadce0; border-radius: 6px;
            padding: 3px 8px; font-size: 10px; font-weight: 800; cursor: pointer;
            min-width: 80px; text-align: center; color: var(--vnpt-primary);
            transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .vnpt-hotkey-btn:hover { border-color: var(--vnpt-primary); background: var(--vnpt-primary-light); }
        .vnpt-hotkey-btn.recording {
            background: var(--vnpt-danger); color: #fff; border-color: var(--vnpt-danger);
            animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.6; }
            100% { opacity: 1; }
        }

        /* 4 Corner Resizers */
        .vnpt-resizer {
            position: absolute; width: 16px; height: 16px; z-index: 10000;
        }
        .vnpt-resizer.tl { top: -4px; left: -4px; cursor: nwse-resize; }
        .vnpt-resizer.tr { top: -4px; right: -4px; cursor: nesw-resize; }
        .vnpt-resizer.bl { bottom: -4px; left: -4px; cursor: nesw-resize; }
        .vnpt-resizer.br { bottom: -4px; right: -4px; cursor: nwse-resize; }
        .vnpt-resizer:hover { background: rgba(26, 115, 232, 0.4); border-radius: 50%; }
        .vnpt-resizer:active { background: var(--vnpt-primary); transform: scale(1.2); }

        body.vnpt-resizing-global * { user-select: none !important; cursor: inherit !important; }

        /* ═══════════════════════════════════════════
           SECTION 5: TEMPLATE MANAGER
           ═══════════════════════════════════════════ */
        #vnpt-template-section { border-top: 1px solid var(--vnpt-border); margin-top: 4px; padding-top: 4px; }
        
        .vnpt-tabs { display: flex; gap: 4px; margin: 4px 0 8px 0; border-bottom: 1px solid var(--vnpt-border); padding-bottom: 4px; }
        .vnpt-tab-btn { 
            background: none; border: none; padding: 4px 12px; font-size: 10px; font-weight: 800; 
            color: #5f6368; cursor: pointer; border-radius: 8px; transition: all 0.2s; 
            text-transform: uppercase; letter-spacing: 0.3px;
        }
        .vnpt-tab-btn:hover { background: var(--vnpt-primary-light); color: var(--vnpt-primary); }
        .vnpt-tab-btn.active { background: var(--vnpt-primary); color: white; box-shadow: 0 4px 10px rgba(26, 115, 232, 0.2); }
        
        /* Text Template Section */
        #vnpt-txt-section {
            border-top: 1px solid var(--vnpt-border);
            margin-top: 4px; padding-top: 4px;
        }
        .vnpt-txt-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 2px; margin-top: 2px;
        }
        .vnpt-txt-header span {
            font-size: 11px; font-weight: 800; color: #1a73e8;
            text-transform: uppercase; letter-spacing: 0.5px;
        }
        #vnpt-txt-toggle {
            background: none; border: none; cursor: pointer;
            font-size: 10px; color: #5f6368; padding: 2px 6px;
            border-radius: 4px; transition: all 0.2s;
        }
        #vnpt-txt-toggle:hover { background: var(--vnpt-primary-light); color: var(--vnpt-primary); }
        #vnpt-txt-template {
            width: 100%; box-sizing: border-box;
            padding: 8px 10px; border: 1px solid #0055ffff; border-radius: 8px;
            font-size: 11.5px; font-family: 'Courier New', Courier, monospace;
            resize: vertical; min-height: 72px; max-height: 200px;
            background: rgba(255,255,255,0.8); color: #3c4043;
            transition: all 0.2s; line-height: 1.6;
        }
        #vnpt-txt-template:focus {
            border-color: var(--vnpt-primary);
            box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
            outline: none;
        }
        #vnpt-txt-template::placeholder { color: #aaa; font-style: italic; }

        .bottom-export-row { 
            display: flex; gap: 4px; align-items: center; 
            border-top: 1px solid var(--vnpt-border); 
            margin: 4px -4px -4px -4px; padding: 4px;
            background: rgba(248, 249, 250, 0.5);
            border-radius: 0 0 var(--vnpt-radius) var(--vnpt-radius);
        }
        .bottom-export-row .vnpt-control-group { margin-bottom: 0; flex: 1; min-width: 0; }
        #vnpt-local-file-group { flex: 0 0 auto !important; }
        .bottom-export-row .vnpt-control-group input[type="text"] { height: 32px; padding: 6px 10px; }
        .bottom-export-row .btn-export { flex: 0 0 auto; height: 32px; margin: 0; border-radius: 8px; }

        /* Nút Upload File Local (icon-only) */
        .btn-upload-local {
            display: inline-flex; align-items: center; justify-content: center;
            width: 32px; height: 32px; border-radius: 8px;
            background: rgba(0,0,0,0.04); border: 1px solid #dadce0;
            font-size: 15px; cursor: pointer; transition: all 0.2s;
            color: #5f6368; box-sizing: border-box;
            flex-shrink: 0;
        }
        .btn-upload-local:hover { 
            background: var(--vnpt-primary-light); border-color: var(--vnpt-primary);
            color: var(--vnpt-primary); transform: scale(1.05);
        }
        .btn-upload-local:active { transform: scale(0.95); }

        /* Nút Xuất TXT */
        .btn-export-txt {
            background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
            color: white; padding: 0 14px; font-weight: 800;
            height: 32px; flex: 0 0 auto; border-radius: 8px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .btn-export-txt:hover { box-shadow: 0 6px 20px rgba(0, 137, 123, 0.4); }


        .text-hint { font-size: 11px; color: #70757a; font-style: italic; text-align: center; margin-bottom: 4px; }

        #vnpt-fields-list::-webkit-scrollbar { width: 6px; }
        #vnpt-fields-list::-webkit-scrollbar-track { background: transparent; }
        #vnpt-fields-list::-webkit-scrollbar-thumb { background: #dadce0; border-radius: 10px; }
        #vnpt-fields-list::-webkit-scrollbar-thumb:hover { background: #bdc1c6; }

        /* ═══════════════════════════════════════════
           SECTION 6: INLINE CALC (Premium Layout)
           ═══════════════════════════════════════════ */
        #vnpt-inline-calc { 
            background: rgba(255, 255, 255, 0.3); 
            padding: 2px 6px; 
            border-bottom: 1px solid var(--vnpt-border);
            display: block;
        }
        .cw-body-inline { display: flex; flex-direction: column; gap: 3px; }
        .cw-inline-row { display: flex; align-items: center; gap: 3px; width: 100%; box-sizing: border-box; }
        .cw-input-inline { 
            flex: 1; min-width: 60px; padding: 4px 10px; border: 1px solid #0055ffff; border-radius: 8px; 
            font-size: 11.5px; font-weight: 600; height: 28px; box-sizing: border-box;
            background: #fff; transition: all 0.2s;
        }
        .cw-input-inline:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 3px var(--vnpt-primary-light); outline: none; }
        .cw-input-readonly-inline { background-color: rgba(30, 142, 62, 0.05); color: var(--vnpt-success); cursor: default; flex: 1.5; border-color: rgba(30, 142, 62, 0.2); }
        
        .cw-tax-group-inline { position: relative; display: flex; align-items: center; flex: 0 0 auto; min-width: 45px; }
        .cw-tax-input-inline { width: 45px; padding: 4px 18px 4px 8px; border: 1px solid #dadce0; border-radius: 6px; font-size: 11px; text-align: right; height: 28px; }
        .cw-tax-symbol { position: absolute; right: 6px; color: #5f6368; font-size: 9px; font-weight: bold; pointer-events: none; }

        .cw-map-btn-inline {
            background: rgba(255, 255, 255, 0.82); border: 1px solid #1a73e8; border-radius: 8px;
            width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
            font-size: 13px; cursor: pointer; transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
            color: #1a73e8; flex-shrink: 0; padding: 0;
            box-shadow: 0 2px 4px rgba(26, 115, 232, 0.1);
        }
        .cw-map-btn-inline:hover { background: var(--vnpt-primary-grad); color: white; transform: scale(1.1) rotate(5deg); box-shadow: 0 4px 8px rgba(26, 115, 232, 0.3); }

        .btn-calc-toggle { background: rgba(26, 115, 232, 0.08); color: var(--vnpt-primary); }
        .btn-calc-toggle:hover { background: rgba(26, 115, 232, 0.15); }
        .btn-calc-toggle.active { background: var(--vnpt-primary); color: #fff; box-shadow: 0 4px 10px rgba(26, 115, 232, 0.3); }

        .btn-more.active { background: rgba(0,0,0,0.1); }

        /* ═══════════════════════════════════════════
           SECTION 7: PDF SCAN MODAL
           ═══════════════════════════════════════════ */
        .btn-scan-pdf { background: rgba(30, 142, 62, 0.08); color: var(--vnpt-success); border: 1px solid rgba(30, 142, 62, 0.1); } 
        .btn-scan-pdf:hover { background: var(--vnpt-success); color: #fff; border-color: transparent; }

        .vnpt-pdf-overlay { 
            position: fixed; inset: 0; background: rgba(0,0,0,0.4);
            backdrop-filter: blur(4px); z-index: 9999999; display: flex;
            align-items: center; justify-content: center; font-family: var(--vnpt-font);
        }
        
        .vnpt-pdf-loading-box {
            background: #fff; padding: 30px 40px; border-radius: 20px;
            text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
            animation: pdfFadeIn 0.3s ease;
        }

        .loader-spinner {
            border: 4px solid #f3f3f3; border-top: 4px solid var(--vnpt-primary);
            border-radius: 50%; width: 40px; height: 40px; margin: 0 auto;
            animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        .vnpt-pdf-dialog-box { 
            background: #fff; border-radius: 20px; padding: 20px;
            width: 560px; max-width: 92vw; max-height: 80vh; 
            display: flex; flex-direction: column;
            box-shadow: 0 24px 80px rgba(0,0,0,0.2); animation: pdfFadeIn 0.3s ease; 
        }
        @keyframes pdfFadeIn { 
            from { opacity:0; transform: scale(0.92) translateY(20px); }
            to { opacity:1; transform: scale(1) translateY(0); } 
        }

        .pdf-dlg-header h3 { margin: 0 0 16px 0; color: #3c4043; font-size: 15px; }
        
        .pdf-dlg-cols {
            display: flex; gap: 12px; flex: 1; overflow: hidden; margin-bottom: 16px;
        }
        
        .pdf-col-left {
            flex: 1; background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 12px;
            padding: 12px; overflow-y: auto; font-family: 'Courier New', monospace;
            font-size: 12px; line-height: 1.6; color: #3c4043; white-space: pre-wrap;
        }
        
        .pdf-col-right {
            flex: 1.2; display: flex; flex-direction: column; overflow: hidden;
            border: 1px solid #e0e0e0; border-radius: 12px;
        }

        .pdf-dlg-body { flex: 1; overflow-y: auto; }

        .pdf-result-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
        .pdf-result-table th { background: #f8f9fa; padding: 10px; text-align: left; font-weight: 800; color: #5f6368; position: sticky; top: 0; z-index: 2; border-bottom: 1px solid #e0e0e0; }
        .pdf-result-table td { padding: 8px; border-bottom: 1px solid #f1f3f4; vertical-align: middle; }
        .pdf-row-auto td { background: #fff; }
        .pdf-row-auto:hover td { background: #f8f9fa; }

        .pdf-val-input {
            width: 100%; padding: 6px 10px; border: 1px solid #dadce0; border-radius: 6px;
            font-size: 12px; font-weight: 600; color: #1a73e8; transition: all 0.2s;
            box-sizing: border-box;
        }
        .pdf-val-input:focus { border-color: var(--vnpt-primary); outline: none; box-shadow: 0 0 0 3px var(--vnpt-primary-light); }

        .vnpt-pdf-actions { display: flex; gap: 8px; justify-content: flex-end; align-items: center; border-top: 1px solid #f1f3f4; padding-top: 12px; }
        
        .pdf-btn-cancel {
            padding: 8px 16px; background: #f1f3f4; border: none; border-radius: 8px;
            color: #3c4043; font-weight: 700; cursor: pointer; transition: 0.2s;
        }
        .pdf-btn-cancel:hover { background: #e8eaed; }
        .pdf-btn-confirm {
            padding: 8px 16px; background: var(--vnpt-primary); border: none; border-radius: 8px;
            color: #fff; font-weight: 700; cursor: pointer; transition: 0.2s;
        }
        .pdf-btn-confirm:hover { background: var(--vnpt-primary-hover); box-shadow: 0 4px 12px rgba(26, 115, 232, 0.3); }

        /* ═══════════════════════════════════════════
           SECTION 8: AI SCANNER UI
           ═══════════════════════════════════════════ */
        #vnpt-btn-ai-mode.active { background: var(--vnpt-primary); color: #fff; box-shadow: 0 4px 10px rgba(26, 115, 232, 0.3); }

        .vnpt-btn-confirm {
            padding: 8px 16px; background: var(--vnpt-primary); border: none; border-radius: 8px;
            color: #fff; font-weight: 700; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center;
        }
        .vnpt-btn-confirm:hover { background: var(--vnpt-primary-hover); box-shadow: 0 4px 12px rgba(26, 115, 232, 0.3); }

        .vnpt-ai-scanner-section {
            padding: 8px; background: rgba(255, 255, 255, 0.5); border-bottom: 1px solid var(--vnpt-border);
            display: flex; flex-direction: column; gap: 6px; animation: slideDown 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

        .ai-scanner-header { display: flex; align-items: center; justify-content: space-between; }
        .ai-title { font-size: 11px; font-weight: 800; color: #1a73e8; text-transform: uppercase; letter-spacing: 0.5px; }
        .ai-scanner-actions { display: flex; gap: 4px; }
        
        /* Hàng ngang: queue trái + textarea phải */
        .ai-scan-row { display: flex; flex-direction: row; gap: 6px; align-items: stretch; }

        .ai-queue-container {
            flex: 0 0 110px;
            border: 2px dashed #dadce0; border-radius: 12px; min-height: 100px; background: rgba(255,255,255,0.7);
            display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
            padding: 4px; gap: 4px; transition: all 0.2s; cursor: pointer; position: relative; overflow: hidden;
        }
        .ai-queue-container:hover, .ai-queue-container.drag-over { border-color: var(--vnpt-primary); background: var(--vnpt-primary-light); }
        /* Placeholder gọn nhẹ, hiện khi chưa có file */
        .ai-queue-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; text-align: center; gap: 2px; }
        .ai-queue-placeholder span:first-child { font-size: 20px; pointer-events: none; }
        .ai-queue-placeholder span:last-child { font-size: 9px; color: #9aa0a6; font-weight: 600; pointer-events: none; white-space: nowrap; line-height: 1.3; }
        
        .ai-queue-list { display: flex; flex-wrap: wrap; gap: 4px; overflow-y: auto; width: 100%; }
        .ai-queue-list::-webkit-scrollbar { width: 3px; }
        .ai-queue-list::-webkit-scrollbar-thumb { background: #dadce0; border-radius: 4px; }
        
        .ai-queue-item {
            flex: 0 0 auto; width: 40px; height: 40px; border-radius: 6px; position: relative; border: 1px solid #e0e0e0;
            background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .ai-queue-item img { width: 100%; height: 100%; object-fit: cover; }
        .ai-queue-item .file-icon { font-size: 20px; }
        .ai-queue-item .btn-remove-item {
            position: absolute; top: 0; right: 0; background: rgba(234,67,53,0.9); color: #fff;
            width: 14px; height: 14px; font-size: 9px; display: flex; align-items: center; justify-content: center;
            border: none; cursor: pointer; border-bottom-left-radius: 4px; opacity: 0.8;
        }
        .ai-queue-item:hover .btn-remove-item { opacity: 1; }

        #vnpt-raw-scan-input {
            flex: 1; min-width: 0; min-height: 100px; padding: 8px; border-radius: 12px; box-sizing: border-box;
            border: 1px solid #1f5bd2ff; background: rgba(255, 255, 255, 0.8);
            font-size: 11px; font-family: inherit; resize: none; line-height: 1.5;
            transition: all 0.2s;
        }
        #vnpt-raw-scan-input:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 3px var(--vnpt-primary-light); outline: none; }
        #vnpt-raw-scan-input.ai-scanning-glow {
            border-color: #f57f17;
            animation: textPulse 1s infinite alternate;
            pointer-events: none; opacity: 0.8;
        }
        @keyframes textPulse {
            from { box-shadow: 0 0 0 2px rgba(245, 127, 23, 0.2); }
            to { box-shadow: 0 0 0 6px rgba(245, 127, 23, 0.5); border-color: #ffb300; }
        }
        
        .raw-scan-actions { display: flex; justify-content: space-between; gap: 6px; }
        .raw-scan-actions .vnpt-btn-confirm { padding: 6px 12px; font-size: 11px; height: auto; flex: 1; text-align: center; }
        .btn-local-process { background: var(--vnpt-success) !important; box-shadow: 0 4px 12px rgba(30, 142, 62, 0.2) !important; flex: 1; }
        .btn-local-process:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-ai-process { background: var(--vnpt-primary-grad) !important; box-shadow: 0 4px 12px rgba(26, 115, 232, 0.2) !important; font-weight: 800; flex: 1.3;}

        /* ═══════════════════════════════════════════
           SECTION 9: SELECTOR INSPECTOR
           ═══════════════════════════════════════════ */
        .vnpt-inspecting-mode { cursor: crosshair !important; }
        .vnpt-inspecting-mode * { cursor: crosshair !important; }
        
        .vnpt-inspect-highlight {
            outline: 3px dashed #f57f17 !important;
            outline-offset: 2px !important;
            position: relative;
            z-index: 9999998 !important;
            animation: borderPulse 1s infinite alternate;
        }

        @keyframes borderPulse {
            from { outline-color: #f57f17; outline-offset: 2px; }
            to { outline-color: #ffb300; outline-offset: 4px; }
        }

        /* ═══════════════════════════════════════════
           SECTION 10: FIELD LINKER
           ═══════════════════════════════════════════ */

        /* Nút 🔗 trên mỗi field row */
        .btn-field-link {
            flex: 0 0 22px;
            width: 22px;
            height: 22px;
            border-radius: 5px;
            border: 1px solid rgba(26, 115, 232, 0.25);
            background: rgba(26, 115, 232, 0.06);
            color: #1a73e8;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            line-height: 1;
            padding: 0;
            flex-shrink: 0;
            transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .btn-field-link:hover {
            background: var(--vnpt-primary);
            color: white;
            border-color: var(--vnpt-primary);
            transform: scale(1.15) rotate(-5deg);
            box-shadow: 0 3px 8px rgba(26, 115, 232, 0.35);
        }
        .btn-field-link.active {
            background: #f57f17;
            color: white;
            border-color: #e65100;
            box-shadow: 0 0 0 3px rgba(245, 127, 23, 0.3);
            animation: pulse-orange 1.2s infinite;
        }

        /* Con trỏ crosshair khi ở chế độ linking */
        .vnpt-linking-mode,
        .vnpt-linking-mode *:not(.vnpt-linking-banner):not(.vnpt-linking-banner *) {
            cursor: crosshair !important;
        }

        /* Hover highlight - xanh dương (element chuẩn bị được link) */
        .vnpt-link-highlight {
            outline: 2.5px solid #1a73e8 !important;
            outline-offset: 3px !important;
            position: relative;
            z-index: 9999990 !important;
            animation: linkPulse 0.9s infinite alternate;
        }
        @keyframes linkPulse {
            from { outline-color: #1a73e8; outline-offset: 2px; box-shadow: 0 0 0 0 rgba(26,115,232,0.2); }
            to   { outline-color: #4fc3f7; outline-offset: 5px; box-shadow: 0 0 12px 4px rgba(26,115,232,0.15); }
        }

        /* Existing highlight - xanh lá (element ĐÃ được link) */
        .vnpt-link-existing {
            outline: 2.5px solid #1e8e3e !important;
            outline-offset: 3px !important;
            position: relative;
            z-index: 9999989 !important;
            animation: existingPulse 1.2s infinite alternate;
        }
        @keyframes existingPulse {
            from { outline-color: #1e8e3e; outline-offset: 2px; box-shadow: 0 0 0 0 rgba(30,142,62,0.2); }
            to   { outline-color: #34a853; outline-offset: 5px; box-shadow: 0 0 10px 3px rgba(30,142,62,0.15); }
        }

        /* Unlink hover - đỏ/cam (hover trên element đã link =Click để BỎ link) */
        .vnpt-unlink-hover {
            outline: 2.5px solid #ea4335 !important;
            outline-offset: 3px !important;
            position: relative;
            z-index: 9999991 !important;
            animation: unlinkPulse 0.7s infinite alternate;
        }
        .vnpt-unlink-hover::after {
            content: '🔓';
            position: absolute;
            top: -18px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 12px;
            pointer-events: none;
            z-index: 9999992;
        }
        @keyframes unlinkPulse {
            from { outline-color: #ea4335; outline-offset: 2px; box-shadow: 0 0 0 0 rgba(234,67,53,0.2); }
            to   { outline-color: #ff7043; outline-offset: 5px; box-shadow: 0 0 10px 3px rgba(234,67,53,0.18); }
        }

        /* Banner hướng dẫn nổi ở đầu trang */
        .vnpt-linking-banner {
            position: fixed;
            top: 18px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
            color: white;
            padding: 8px 20px;
            border-radius: 30px;
            font-size: 12px;
            font-weight: 600;
            z-index: 99999999;
            box-shadow: 0 8px 28px rgba(26, 115, 232, 0.5);
            white-space: nowrap;
            letter-spacing: 0.3px;
            display: flex;
            align-items: center;
            gap: 6px;
            animation: bannerSlideDown 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .vnpt-linking-banner kbd {
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.4);
            border-radius: 4px;
            padding: 1px 6px;
            font-family: inherit;
            font-size: 11px;
        }
        /* Badge đếm số links đã chọn */
        .vnpt-link-count-badge {
            background: #34a853;
            color: white;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 8px;
            border-radius: 20px;
            letter-spacing: 0.3px;
            animation: badgePop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes badgePop {
            from { transform: scale(0.7); opacity: 0.5; }
            to   { transform: scale(1);   opacity: 1; }
        }
        /* Nút "✅ Xong" bên trong banner */
        .vnpt-link-done-btn {
            background: rgba(255,255,255,0.22);
            border: 1px solid rgba(255,255,255,0.5);
            color: white;
            border-radius: 20px;
            padding: 3px 12px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
        }
        .vnpt-link-done-btn:hover {
            background: rgba(255,255,255,0.35);
            transform: scale(1.05);
        }
        .vnpt-link-done-btn:active { transform: scale(0.96); }

        @keyframes bannerSlideDown {
            from { opacity: 0; transform: translateX(-50%) translateY(-16px) scale(0.9); }
            to   { opacity: 1; transform: translateX(-50%) translateY(0)      scale(1); }
        }

    `,document.head.appendChild(e)}const up={widget:null,panel:null,header:null,bannerArea:null,toggleBtn:null,fieldsContainer:null,panelBody:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1,templateBuffer:null,templateName:null,hasDragged:!1,isInspecting:!1},dr=new Map,P=new Proxy(up,{get(n,e){return e==="on"?(t,r)=>{dr.has(t)||dr.set(t,[]),dr.get(t).push(r)}:n[e]},set(n,e,t){const r=n[e];return n[e]=t,r!==t&&dr.has(e)&&dr.get(e).forEach(i=>i(t,r)),!0}}),ue={"tenDaiDienn, tenNguoiNhanCTS ":"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH","diaChi, duong, tinhId, tinhIdNew, quanHuyenId, xaPhuongId, phuongXaId":"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT","emailDaiDien, emailNhanCTS":"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Mã số thuế | GPKD",noiCapSoDkdn:"Nơi cấp ĐKDN/QĐTL/GPTL",goiDV:"Gói Dịch Vụ","ngayKy, ngayKy1":"Ngày ký","thangKy, thangKy1":"Tháng Ký","namKy, namKy1":"Năm ký","ngayTiepNhan, ngayThangNamKy":"Ngày tiếp nhận / Ngày tháng năm ký","soHopDong, inputContractGroupName":"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký","lienheHopDongA, lienheTuVanA, lienheHoaDonA, sucoCap1A, sucoCap2A, sucoCap3A, sucoCap4A":"Liên hệ A"},rn=["soHopDong","tenDaiDienn","cmnd","sdt","diaChi","tenToChuc","ngayCapCustomer","emailDaiDien","soDkdn","goiDV","soHopDong"],Ge="vnpt_docx_fields",Le="vnpt_docx_default_fields",Ei="vnpt_docx_position",wi="vnpt_docx_size",Ti="vnpt_docx_opened",fr="vnpt_docx_auto_backup",dt="vnpt_autofill_data_default",sn="vnpt_autofill_data_custom",xt="vnpt_autofill_data_sync",Tc="vnpt_widget_pos",Pn="vnd_tax_rate",Ii="vnd_before_history",xi="vnd_after_history",pr="vnpt_widget_collapsed",At="vnd_calc_map",Nn="vnpt_widget_datatab",gr="vnpt_templates",so="vnpt_txt_template",Ic="vnpt_gemini_api_key",xc="vnpt_gemini_model",mr="vnpt_hotkeys",on="vnpt_docx_profiles",Ai="vnpt_docx_active_profile_id",Si={MST:/^\d{10}(-\d{3})?$/,PHONE:/^(0|\+84)[3|5|7|8|9]\d{8}$/,EMAIL:/^[^\s@]+@[^\s@]+\.[^\s@]+$/},yr=Object.freeze(Object.defineProperty({__proto__:null,DEFAULT_LABELS:ue,LOCAL_KEY_ACTIVE_PROFILE_ID:Ai,LOCAL_KEY_AUTO_BACKUP:fr,LOCAL_KEY_DEFAULT_FIELDS:Le,LOCAL_KEY_FIELDS:Ge,LOCAL_KEY_OPENED:Ti,LOCAL_KEY_POS:Ei,LOCAL_KEY_PROFILES:on,LOCAL_KEY_SIZE:wi,REQUIRED_KEYS:rn,SK_CALC_MAP:At,SK_COLLAPSE:pr,SK_DATATAB:Nn,SK_DATA_CUS:sn,SK_DATA_DEF:dt,SK_DATA_SYNC:xt,SK_GEMINI_KEY:Ic,SK_GEMINI_MODEL:xc,SK_HIST_A:xi,SK_HIST_B:Ii,SK_HOTKEYS:mr,SK_POS_CALC:Tc,SK_TAX:Pn,SK_TEMPLATES:gr,SK_TXT_TEMPLATE:so,VALIDATION_REGEX:Si},Symbol.toStringTag,{value:"Module"}));let St=null;function U(n,e="#198754",t=2500){St||(St=document.createElement("div"),St.id="vnpt-toast-container",Object.assign(St.style,{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column-reverse",alignItems:"center",gap:"8px",zIndex:"1000000",pointerEvents:"none"}),document.body.appendChild(St));const r=document.createElement("div");r.innerText=n,Object.assign(r.style,{background:e,color:"#fff",padding:"8px 18px",borderRadius:"24px",opacity:"0",transform:"translateY(10px)",transition:"opacity 0.3s, transform 0.3s",fontSize:"13px",fontWeight:"500",fontFamily:"'Segoe UI', Roboto, sans-serif",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",whiteSpace:"nowrap",pointerEvents:"auto"}),St.appendChild(r),requestAnimationFrame(()=>{r.style.opacity="1",r.style.transform="translateY(0)"}),setTimeout(()=>{r.style.opacity="0",r.style.transform="translateY(-10px)",setTimeout(()=>{r.remove(),St&&St.childNodes.length},300)},t)}const hp="vnpt_templates_db",Ct="buffers";let Ci=null;function oo(){return Ci?Promise.resolve(Ci):new Promise((n,e)=>{const t=indexedDB.open(hp,1);t.onupgradeneeded=r=>{const i=r.target.result;i.objectStoreNames.contains(Ct)||i.createObjectStore(Ct)},t.onsuccess=r=>{Ci=r.target.result,n(Ci)},t.onerror=()=>e(t.error)})}async function dp(n,e){const t=await oo();return new Promise((r,i)=>{const c=t.transaction(Ct,"readwrite").objectStore(Ct).put(e,n);c.onsuccess=()=>r(),c.onerror=()=>i(c.error)})}async function fp(n){const e=await oo();return new Promise((t,r)=>{const a=e.transaction(Ct,"readonly").objectStore(Ct).get(n);a.onsuccess=()=>t(a.result),a.onerror=()=>r(a.error)})}async function pp(n){const e=await oo();return new Promise((t,r)=>{const a=e.transaction(Ct,"readwrite").objectStore(Ct).delete(n);a.onsuccess=()=>t(),a.onerror=()=>r(a.error)})}const an=new Map,ki=new Map,V={isGM:typeof GM_setValue<"u"&&typeof GM_getValue<"u",get(n,e=null){if(an.has(n))return an.get(n);try{let t;if(this.isGM?t=GM_getValue(n,null):t=localStorage.getItem(n),t==null)return e;const r=typeof t=="string"?JSON.parse(t):t;return an.set(n,r),r}catch(t){return console.warn(`[Storage] Không thể đọc key "${n}":`,t),e}},set(n,e){an.set(n,e);try{return this.isGM?GM_setValue(n,e):localStorage.setItem(n,JSON.stringify(e)),!0}catch(t){return console.error(`[Storage] Không thể ghi key "${n}":`,t),!1}},setDebounced(n,e,t=500){an.set(n,e),ki.has(n)&&clearTimeout(ki.get(n));const r=setTimeout(()=>{this.set(n,e),ki.delete(n)},t);ki.set(n,r)},remove(n){an.delete(n);try{this.isGM?GM_deleteValue(n):localStorage.removeItem(n)}catch(e){console.error(`[Storage] Không thể xóa key "${n}":`,e)}},clearCache(){an.clear()}},Ri=Object.freeze(Object.defineProperty({__proto__:null,Storage:V},Symbol.toStringTag,{value:"Module"})),gp=()=>{};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ac=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let i=n.charCodeAt(r);i<128?e[t++]=i:i<2048?(e[t++]=i>>6|192,e[t++]=i&63|128):(i&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=i>>18|240,e[t++]=i>>12&63|128,e[t++]=i>>6&63|128,e[t++]=i&63|128):(e[t++]=i>>12|224,e[t++]=i>>6&63|128,e[t++]=i&63|128)}return e},mp=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const i=n[t++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){const s=n[t++];e[r++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=n[t++],a=n[t++],c=n[t++],l=((i&7)<<18|(s&63)<<12|(a&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(l>>10)),e[r++]=String.fromCharCode(56320+(l&1023))}else{const s=n[t++],a=n[t++];e[r++]=String.fromCharCode((i&15)<<12|(s&63)<<6|a&63)}}return e.join("")},Sc={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<n.length;i+=3){const s=n[i],a=i+1<n.length,c=a?n[i+1]:0,l=i+2<n.length,h=l?n[i+2]:0,d=s>>2,p=(s&3)<<4|c>>4;let y=(c&15)<<2|h>>6,I=h&63;l||(I=64,a||(y=64)),r.push(t[d],t[p],t[y],t[I])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(Ac(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):mp(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<n.length;){const s=t[n.charAt(i++)],c=i<n.length?t[n.charAt(i)]:0;++i;const h=i<n.length?t[n.charAt(i)]:64;++i;const p=i<n.length?t[n.charAt(i)]:64;if(++i,s==null||c==null||h==null||p==null)throw new yp;const y=s<<2|c>>4;if(r.push(y),h!==64){const I=c<<4&240|h>>2;if(r.push(I),p!==64){const T=h<<6&192|p;r.push(T)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class yp extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const vp=function(n){const e=Ac(n);return Sc.encodeByteArray(e,!0)},Pi=function(n){return vp(n).replace(/\./g,"")},Cc=function(n){try{return Sc.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _p(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bp=()=>_p().__FIREBASE_DEFAULTS__,Ep=()=>{if(typeof process>"u"||typeof process.env>"u")return;const n=process.env.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},wp=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&Cc(n[1]);return e&&JSON.parse(e)},Ni=()=>{try{return gp()||bp()||Ep()||wp()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},kc=n=>{var e,t;return(t=(e=Ni())==null?void 0:e.emulatorHosts)==null?void 0:t[n]},Tp=n=>{const e=kc(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},Rc=()=>{var n;return(n=Ni())==null?void 0:n.config},Pc=n=>{var e;return(e=Ni())==null?void 0:e[`_${n}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ip{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xp(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",i=n.iat||0,s=n.sub||n.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a={iss:`https://securetoken.google.com/${r}`,aud:r,iat:i,exp:i+3600,auth_time:i,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}},...n};return[Pi(JSON.stringify(t)),Pi(JSON.stringify(a)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ie(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Ap(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Ie())}function Sp(){var e;const n=(e=Ni())==null?void 0:e.forceEnvironment;if(n==="node")return!0;if(n==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Cp(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function kp(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Rp(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Pp(){const n=Ie();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function Np(){return!Sp()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Dp(){try{return typeof indexedDB=="object"}catch{return!1}}function Lp(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},i.onupgradeneeded=()=>{t=!1},i.onerror=()=>{var s;e(((s=i.error)==null?void 0:s.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vp="FirebaseError";class ft extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=Vp,Object.setPrototypeOf(this,ft.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,vr.prototype.create)}}class vr{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},i=`${this.service}/${e}`,s=this.errors[e],a=s?Op(s,r):"Error",c=`${this.serviceName}: ${a} (${i}).`;return new ft(i,c,r)}}function Op(n,e){return n.replace(Mp,(t,r)=>{const i=e[r];return i!=null?String(i):`<${r}?>`})}const Mp=/\{\$([^}]+)}/g;function Fp(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function cn(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const i of t){if(!r.includes(i))return!1;const s=n[i],a=e[i];if(Nc(s)&&Nc(a)){if(!cn(s,a))return!1}else if(s!==a)return!1}for(const i of r)if(!t.includes(i))return!1;return!0}function Nc(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _r(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function br(n){const e={};return n.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[i,s]=r.split("=");e[decodeURIComponent(i)]=decodeURIComponent(s)}}),e}function Er(n){const e=n.indexOf("?");if(!e)return"";const t=n.indexOf("#",e);return n.substring(e,t>0?t:void 0)}function Up(n,e){const t=new Bp(n,e);return t.subscribe.bind(t)}class Bp{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let i;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");qp(e,["next","error","complete"])?i=e:i={next:e,error:t,complete:r},i.next===void 0&&(i.next=ao),i.error===void 0&&(i.error=ao),i.complete===void 0&&(i.complete=ao);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function qp(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function ao(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Re(n){return n&&n._delegate?n._delegate:n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wr(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Dc(n){return(await fetch(n,{credentials:"include"})).ok}class ln{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const un="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $p{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new Ip;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:t});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(e==null?void 0:e.optional)??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(i){if(r)return null;throw i}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(zp(e))try{this.getOrInitializeService({instanceIdentifier:un})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(t);try{const s=this.getOrInitializeService({instanceIdentifier:i});r.resolve(s)}catch{}}}}clearInstance(e=un){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=un){return this.instances.has(e)}getOptions(e=un){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[s,a]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(s);r===c&&a.resolve(i)}return i}onInit(e,t){const r=this.normalizeInstanceIdentifier(t),i=this.onInitCallbacks.get(r)??new Set;i.add(e),this.onInitCallbacks.set(r,i);const s=this.instances.get(r);return s&&e(s,r),()=>{i.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const i of r)try{i(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Hp(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=un){return this.component?this.component.multipleInstances?e:un:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Hp(n){return n===un?void 0:n}function zp(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jp{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new $p(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var X;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(X||(X={}));const Kp={debug:X.DEBUG,verbose:X.VERBOSE,info:X.INFO,warn:X.WARN,error:X.ERROR,silent:X.SILENT},Gp=X.INFO,Wp={[X.DEBUG]:"log",[X.VERBOSE]:"log",[X.INFO]:"info",[X.WARN]:"warn",[X.ERROR]:"error"},Qp=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),i=Wp[e];if(i)console[i](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class co{constructor(e){this.name=e,this._logLevel=Gp,this._logHandler=Qp,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in X))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Kp[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,X.DEBUG,...e),this._logHandler(this,X.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,X.VERBOSE,...e),this._logHandler(this,X.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,X.INFO,...e),this._logHandler(this,X.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,X.WARN,...e),this._logHandler(this,X.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,X.ERROR,...e),this._logHandler(this,X.ERROR,...e)}}const Yp=(n,e)=>e.some(t=>n instanceof t);let Lc,Vc;function Xp(){return Lc||(Lc=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Jp(){return Vc||(Vc=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Oc=new WeakMap,lo=new WeakMap,Mc=new WeakMap,uo=new WeakMap,ho=new WeakMap;function Zp(n){const e=new Promise((t,r)=>{const i=()=>{n.removeEventListener("success",s),n.removeEventListener("error",a)},s=()=>{t(kt(n.result)),i()},a=()=>{r(n.error),i()};n.addEventListener("success",s),n.addEventListener("error",a)});return e.then(t=>{t instanceof IDBCursor&&Oc.set(t,n)}).catch(()=>{}),ho.set(e,n),e}function eg(n){if(lo.has(n))return;const e=new Promise((t,r)=>{const i=()=>{n.removeEventListener("complete",s),n.removeEventListener("error",a),n.removeEventListener("abort",a)},s=()=>{t(),i()},a=()=>{r(n.error||new DOMException("AbortError","AbortError")),i()};n.addEventListener("complete",s),n.addEventListener("error",a),n.addEventListener("abort",a)});lo.set(n,e)}let fo={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return lo.get(n);if(e==="objectStoreNames")return n.objectStoreNames||Mc.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return kt(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function tg(n){fo=n(fo)}function ng(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const r=n.call(po(this),e,...t);return Mc.set(r,e.sort?e.sort():[e]),kt(r)}:Jp().includes(n)?function(...e){return n.apply(po(this),e),kt(Oc.get(this))}:function(...e){return kt(n.apply(po(this),e))}}function rg(n){return typeof n=="function"?ng(n):(n instanceof IDBTransaction&&eg(n),Yp(n,Xp())?new Proxy(n,fo):n)}function kt(n){if(n instanceof IDBRequest)return Zp(n);if(uo.has(n))return uo.get(n);const e=rg(n);return e!==n&&(uo.set(n,e),ho.set(e,n)),e}const po=n=>ho.get(n);function ig(n,e,{blocked:t,upgrade:r,blocking:i,terminated:s}={}){const a=indexedDB.open(n,e),c=kt(a);return r&&a.addEventListener("upgradeneeded",l=>{r(kt(a.result),l.oldVersion,l.newVersion,kt(a.transaction),l)}),t&&a.addEventListener("blocked",l=>t(l.oldVersion,l.newVersion,l)),c.then(l=>{s&&l.addEventListener("close",()=>s()),i&&l.addEventListener("versionchange",h=>i(h.oldVersion,h.newVersion,h))}).catch(()=>{}),c}const sg=["get","getKey","getAll","getAllKeys","count"],og=["put","add","delete","clear"],go=new Map;function Fc(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(go.get(e))return go.get(e);const t=e.replace(/FromIndex$/,""),r=e!==t,i=og.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(i||sg.includes(t)))return;const s=async function(a,...c){const l=this.transaction(a,i?"readwrite":"readonly");let h=l.store;return r&&(h=h.index(c.shift())),(await Promise.all([h[t](...c),i&&l.done]))[0]};return go.set(e,s),s}tg(n=>({...n,get:(e,t,r)=>Fc(e,t)||n.get(e,t,r),has:(e,t)=>!!Fc(e,t)||n.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ag{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(cg(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function cg(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const mo="@firebase/app",Uc="0.14.11";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pt=new co("@firebase/app"),lg="@firebase/app-compat",ug="@firebase/analytics-compat",hg="@firebase/analytics",dg="@firebase/app-check-compat",fg="@firebase/app-check",pg="@firebase/auth",gg="@firebase/auth-compat",mg="@firebase/database",yg="@firebase/data-connect",vg="@firebase/database-compat",_g="@firebase/functions",bg="@firebase/functions-compat",Eg="@firebase/installations",wg="@firebase/installations-compat",Tg="@firebase/messaging",Ig="@firebase/messaging-compat",xg="@firebase/performance",Ag="@firebase/performance-compat",Sg="@firebase/remote-config",Cg="@firebase/remote-config-compat",kg="@firebase/storage",Rg="@firebase/storage-compat",Pg="@firebase/firestore",Ng="@firebase/ai",Dg="@firebase/firestore-compat",Lg="firebase",Vg="12.12.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yo="[DEFAULT]",Og={[mo]:"fire-core",[lg]:"fire-core-compat",[hg]:"fire-analytics",[ug]:"fire-analytics-compat",[fg]:"fire-app-check",[dg]:"fire-app-check-compat",[pg]:"fire-auth",[gg]:"fire-auth-compat",[mg]:"fire-rtdb",[yg]:"fire-data-connect",[vg]:"fire-rtdb-compat",[_g]:"fire-fn",[bg]:"fire-fn-compat",[Eg]:"fire-iid",[wg]:"fire-iid-compat",[Tg]:"fire-fcm",[Ig]:"fire-fcm-compat",[xg]:"fire-perf",[Ag]:"fire-perf-compat",[Sg]:"fire-rc",[Cg]:"fire-rc-compat",[kg]:"fire-gcs",[Rg]:"fire-gcs-compat",[Pg]:"fire-fst",[Dg]:"fire-fst-compat",[Ng]:"fire-vertex","fire-js":"fire-js",[Lg]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Di=new Map,Mg=new Map,vo=new Map;function Bc(n,e){try{n.container.addComponent(e)}catch(t){pt.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Dn(n){const e=n.name;if(vo.has(e))return pt.debug(`There were multiple attempts to register component ${e}.`),!1;vo.set(e,n);for(const t of Di.values())Bc(t,n);for(const t of Mg.values())Bc(t,n);return!0}function _o(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function $e(n){return n==null?!1:n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fg={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Rt=new vr("app","Firebase",Fg);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ug{constructor(e,t,r){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new ln("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Rt.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ln=Vg;function qc(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r={name:yo,automaticDataCollectionEnabled:!0,...e},i=r.name;if(typeof i!="string"||!i)throw Rt.create("bad-app-name",{appName:String(i)});if(t||(t=Rc()),!t)throw Rt.create("no-options");const s=Di.get(i);if(s){if(cn(t,s.options)&&cn(r,s.config))return s;throw Rt.create("duplicate-app",{appName:i})}const a=new jp(i);for(const l of vo.values())a.addComponent(l);const c=new Ug(t,r,a);return Di.set(i,c),c}function $c(n=yo){const e=Di.get(n);if(!e&&n===yo&&Rc())return qc();if(!e)throw Rt.create("no-app",{appName:n});return e}function Pt(n,e,t){let r=Og[n]??n;t&&(r+=`-${t}`);const i=r.match(/\s|\//),s=e.match(/\s|\//);if(i||s){const a=[`Unable to register library "${r}" with version "${e}":`];i&&a.push(`library name "${r}" contains illegal characters (whitespace or "/")`),i&&s&&a.push("and"),s&&a.push(`version name "${e}" contains illegal characters (whitespace or "/")`),pt.warn(a.join(" "));return}Dn(new ln(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bg="firebase-heartbeat-database",qg=1,Tr="firebase-heartbeat-store";let bo=null;function Hc(){return bo||(bo=ig(Bg,qg,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Tr)}catch(t){console.warn(t)}}}}).catch(n=>{throw Rt.create("idb-open",{originalErrorMessage:n.message})})),bo}async function $g(n){try{const t=(await Hc()).transaction(Tr),r=await t.objectStore(Tr).get(jc(n));return await t.done,r}catch(e){if(e instanceof ft)pt.warn(e.message);else{const t=Rt.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});pt.warn(t.message)}}}async function zc(n,e){try{const r=(await Hc()).transaction(Tr,"readwrite");await r.objectStore(Tr).put(e,jc(n)),await r.done}catch(t){if(t instanceof ft)pt.warn(t.message);else{const r=Rt.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});pt.warn(r.message)}}}function jc(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hg=1024,zg=30;class jg{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new Gg(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=Kc();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(a=>a.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats.length>zg){const a=Wg(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(a,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){pt.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=Kc(),{heartbeatsToSend:r,unsentEntries:i}=Kg(this._heartbeatsCache.heartbeats),s=Pi(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(t){return pt.warn(t),""}}}function Kc(){return new Date().toISOString().substring(0,10)}function Kg(n,e=Hg){const t=[];let r=n.slice();for(const i of n){const s=t.find(a=>a.agent===i.agent);if(s){if(s.dates.push(i.date),Gc(t)>e){s.dates.pop();break}}else if(t.push({agent:i.agent,dates:[i.date]}),Gc(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class Gg{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Dp()?Lp().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await $g(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return zc(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return zc(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function Gc(n){return Pi(JSON.stringify({version:2,heartbeats:n})).length}function Wg(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let r=1;r<n.length;r++)n[r].date<t&&(t=n[r].date,e=r);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qg(n){Dn(new ln("platform-logger",e=>new ag(e),"PRIVATE")),Dn(new ln("heartbeat",e=>new jg(e),"PRIVATE")),Pt(mo,Uc,n),Pt(mo,Uc,"esm2020"),Pt("fire-js","")}Qg("");var Yg="firebase",Xg="12.12.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Pt(Yg,Xg,"app");function Wc(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const Jg=Wc,Qc=new vr("auth","Firebase",Wc());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Li=new co("@firebase/auth");function Zg(n,...e){Li.logLevel<=X.WARN&&Li.warn(`Auth (${Ln}): ${n}`,...e)}function Vi(n,...e){Li.logLevel<=X.ERROR&&Li.error(`Auth (${Ln}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function We(n,...e){throw Eo(n,...e)}function Ze(n,...e){return Eo(n,...e)}function Yc(n,e,t){const r={...Jg(),[e]:t};return new vr("auth","Firebase",r).create(e,{appName:n.name})}function gt(n){return Yc(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Eo(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return Qc.create(n,...e)}function K(n,e,...t){if(!n)throw Eo(e,...t)}function mt(n){const e="INTERNAL ASSERTION FAILED: "+n;throw Vi(e),new Error(e)}function yt(n,e){n||mt(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wo(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.href)||""}function em(){return Xc()==="http:"||Xc()==="https:"}function Xc(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tm(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(em()||kp()||"connection"in navigator)?navigator.onLine:!0}function nm(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ir{constructor(e,t){this.shortDelay=e,this.longDelay=t,yt(t>e,"Short delay should be less than long delay!"),this.isMobile=Ap()||Rp()}get(){return tm()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function To(n,e){yt(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jc{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;mt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;mt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;mt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rm={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const im=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],sm=new Ir(3e4,6e4);function Nt(n,e){return n.tenantId&&!e.tenantId?{...e,tenantId:n.tenantId}:e}async function Dt(n,e,t,r,i={}){return Zc(n,i,async()=>{let s={},a={};r&&(e==="GET"?a=r:s={body:JSON.stringify(r)});const c=_r({key:n.config.apiKey,...a}).slice(1),l=await n._getAdditionalHeaders();l["Content-Type"]="application/json",n.languageCode&&(l["X-Firebase-Locale"]=n.languageCode);const h={method:e,headers:l,...s};return Cp()||(h.referrerPolicy="no-referrer"),n.emulatorConfig&&wr(n.emulatorConfig.host)&&(h.credentials="include"),Jc.fetch()(await el(n,n.config.apiHost,t,c),h)})}async function Zc(n,e,t){n._canInitEmulator=!1;const r={...rm,...e};try{const i=new am(n),s=await Promise.race([t(),i.promise]);i.clearNetworkTimeout();const a=await s.json();if("needConfirmation"in a)throw Oi(n,"account-exists-with-different-credential",a);if(s.ok&&!("errorMessage"in a))return a;{const c=s.ok?a.errorMessage:a.error.message,[l,h]=c.split(" : ");if(l==="FEDERATED_USER_ID_ALREADY_LINKED")throw Oi(n,"credential-already-in-use",a);if(l==="EMAIL_EXISTS")throw Oi(n,"email-already-in-use",a);if(l==="USER_DISABLED")throw Oi(n,"user-disabled",a);const d=r[l]||l.toLowerCase().replace(/[_\s]+/g,"-");if(h)throw Yc(n,d,h);We(n,d)}}catch(i){if(i instanceof ft)throw i;We(n,"network-request-failed",{message:String(i)})}}async function xr(n,e,t,r,i={}){const s=await Dt(n,e,t,r,i);return"mfaPendingCredential"in s&&We(n,"multi-factor-auth-required",{_serverResponse:s}),s}async function el(n,e,t,r){const i=`${e}${t}?${r}`,s=n,a=s.config.emulator?To(n.config,i):`${n.config.apiScheme}://${i}`;return im.includes(t)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(a).toString():a}function om(n){switch(n){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class am{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(Ze(this.auth,"network-request-failed")),sm.get())})}}function Oi(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const i=Ze(n,e,r);return i.customData._tokenResponse=t,i}function tl(n){return n!==void 0&&n.enterprise!==void 0}class cm{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return om(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function lm(n,e){return Dt(n,"GET","/v2/recaptchaConfig",Nt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function um(n,e){return Dt(n,"POST","/v1/accounts:delete",e)}async function Mi(n,e){return Dt(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ar(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function hm(n,e=!1){const t=Re(n),r=await t.getIdToken(e),i=xo(r);K(i&&i.exp&&i.auth_time&&i.iat,t.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,a=s==null?void 0:s.sign_in_provider;return{claims:i,token:r,authTime:Ar(Io(i.auth_time)),issuedAtTime:Ar(Io(i.iat)),expirationTime:Ar(Io(i.exp)),signInProvider:a||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function Io(n){return Number(n)*1e3}function xo(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return Vi("JWT malformed, contained fewer than 3 sections"),null;try{const i=Cc(t);return i?JSON.parse(i):(Vi("Failed to decode base64 JWT payload"),null)}catch(i){return Vi("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function nl(n){const e=xo(n);return K(e,"internal-error"),K(typeof e.exp<"u","internal-error"),K(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Sr(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof ft&&dm(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function dm({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fm{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const r=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,r)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ao{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Ar(this.lastLoginAt),this.creationTime=Ar(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Fi(n){var p;const e=n.auth,t=await n.getIdToken(),r=await Sr(n,Mi(e,{idToken:t}));K(r==null?void 0:r.users.length,e,"internal-error");const i=r.users[0];n._notifyReloadListener(i);const s=(p=i.providerUserInfo)!=null&&p.length?rl(i.providerUserInfo):[],a=gm(n.providerData,s),c=n.isAnonymous,l=!(n.email&&i.passwordHash)&&!(a!=null&&a.length),h=c?l:!1,d={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:a,metadata:new Ao(i.createdAt,i.lastLoginAt),isAnonymous:h};Object.assign(n,d)}async function pm(n){const e=Re(n);await Fi(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function gm(n,e){return[...n.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function rl(n){return n.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function mm(n,e){const t=await Zc(n,{},async()=>{const r=_r({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=n.config,a=await el(n,i,"/v1/token",`key=${s}`),c=await n._getAdditionalHeaders();c["Content-Type"]="application/x-www-form-urlencoded";const l={method:"POST",headers:c,body:r};return n.emulatorConfig&&wr(n.emulatorConfig.host)&&(l.credentials="include"),Jc.fetch()(a,l)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function ym(n,e){return Dt(n,"POST","/v2/accounts:revokeToken",Nt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vn{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){K(e.idToken,"internal-error"),K(typeof e.idToken<"u","internal-error"),K(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):nl(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){K(e.length!==0,"internal-error");const t=nl(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(K(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:i,expiresIn:s}=await mm(e,t);this.updateTokensAndExpiration(r,i,Number(s))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:i,expirationTime:s}=t,a=new Vn;return r&&(K(typeof r=="string","internal-error",{appName:e}),a.refreshToken=r),i&&(K(typeof i=="string","internal-error",{appName:e}),a.accessToken=i),s&&(K(typeof s=="number","internal-error",{appName:e}),a.expirationTime=s),a}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Vn,this.toJSON())}_performRefresh(){return mt("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Lt(n,e){K(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class Qe{constructor({uid:e,auth:t,stsTokenManager:r,...i}){this.providerId="firebase",this.proactiveRefresh=new fm(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new Ao(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const t=await Sr(this,this.stsTokenManager.getToken(this.auth,e));return K(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return hm(this,e)}reload(){return pm(this)}_assign(e){this!==e&&(K(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new Qe({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){K(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await Fi(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if($e(this.auth.app))return Promise.reject(gt(this.auth));const e=await this.getIdToken();return await Sr(this,um(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const r=t.displayName??void 0,i=t.email??void 0,s=t.phoneNumber??void 0,a=t.photoURL??void 0,c=t.tenantId??void 0,l=t._redirectEventId??void 0,h=t.createdAt??void 0,d=t.lastLoginAt??void 0,{uid:p,emailVerified:y,isAnonymous:I,providerData:T,stsTokenManager:R}=t;K(p&&R,e,"internal-error");const x=Vn.fromJSON(this.name,R);K(typeof p=="string",e,"internal-error"),Lt(r,e.name),Lt(i,e.name),K(typeof y=="boolean",e,"internal-error"),K(typeof I=="boolean",e,"internal-error"),Lt(s,e.name),Lt(a,e.name),Lt(c,e.name),Lt(l,e.name),Lt(h,e.name),Lt(d,e.name);const k=new Qe({uid:p,auth:e,email:i,emailVerified:y,displayName:r,isAnonymous:I,photoURL:a,phoneNumber:s,tenantId:c,stsTokenManager:x,createdAt:h,lastLoginAt:d});return T&&Array.isArray(T)&&(k.providerData=T.map(O=>({...O}))),l&&(k._redirectEventId=l),k}static async _fromIdTokenResponse(e,t,r=!1){const i=new Vn;i.updateFromServerResponse(t);const s=new Qe({uid:t.localId,auth:e,stsTokenManager:i,isAnonymous:r});return await Fi(s),s}static async _fromGetAccountInfoResponse(e,t,r){const i=t.users[0];K(i.localId!==void 0,"internal-error");const s=i.providerUserInfo!==void 0?rl(i.providerUserInfo):[],a=!(i.email&&i.passwordHash)&&!(s!=null&&s.length),c=new Vn;c.updateFromIdToken(r);const l=new Qe({uid:i.localId,auth:e,stsTokenManager:c,isAnonymous:a}),h={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new Ao(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(s!=null&&s.length)};return Object.assign(l,h),l}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const il=new Map;function vt(n){yt(n instanceof Function,"Expected a class definition");let e=il.get(n);return e?(yt(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,il.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sl{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}sl.type="NONE";const ol=sl;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ui(n,e,t){return`firebase:${n}:${e}:${t}`}class On{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:i,name:s}=this.auth;this.fullUserKey=Ui(this.userKey,i.apiKey,s),this.fullPersistenceKey=Ui("persistence",i.apiKey,s),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await Mi(this.auth,{idToken:e}).catch(()=>{});return t?Qe._fromGetAccountInfoResponse(this.auth,t,e):null}return Qe._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new On(vt(ol),e,r);const i=(await Promise.all(t.map(async h=>{if(await h._isAvailable())return h}))).filter(h=>h);let s=i[0]||vt(ol);const a=Ui(r,e.config.apiKey,e.name);let c=null;for(const h of t)try{const d=await h._get(a);if(d){let p;if(typeof d=="string"){const y=await Mi(e,{idToken:d}).catch(()=>{});if(!y)break;p=await Qe._fromGetAccountInfoResponse(e,y,d)}else p=Qe._fromJSON(e,d);h!==s&&(c=p),s=h;break}}catch{}const l=i.filter(h=>h._shouldAllowMigration);return!s._shouldAllowMigration||!l.length?new On(s,e,r):(s=l[0],c&&await s._set(a,c.toJSON()),await Promise.all(t.map(async h=>{if(h!==s)try{await h._remove(a)}catch{}})),new On(s,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function al(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(hl(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(cl(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(fl(e))return"Blackberry";if(pl(e))return"Webos";if(ll(e))return"Safari";if((e.includes("chrome/")||ul(e))&&!e.includes("edge/"))return"Chrome";if(dl(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function cl(n=Ie()){return/firefox\//i.test(n)}function ll(n=Ie()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function ul(n=Ie()){return/crios\//i.test(n)}function hl(n=Ie()){return/iemobile/i.test(n)}function dl(n=Ie()){return/android/i.test(n)}function fl(n=Ie()){return/blackberry/i.test(n)}function pl(n=Ie()){return/webos/i.test(n)}function So(n=Ie()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function vm(n=Ie()){var e;return So(n)&&!!((e=window.navigator)!=null&&e.standalone)}function _m(){return Pp()&&document.documentMode===10}function gl(n=Ie()){return So(n)||dl(n)||pl(n)||fl(n)||/windows phone/i.test(n)||hl(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ml(n,e=[]){let t;switch(n){case"Browser":t=al(Ie());break;case"Worker":t=`${al(Ie())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${Ln}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bm{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=s=>new Promise((a,c)=>{try{const l=e(s);a(l)}catch(l){c(l)}});r.onAbort=t,this.queue.push(r);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const i of t)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Em(n,e={}){return Dt(n,"GET","/v2/passwordPolicy",Nt(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wm=6;class Tm{constructor(e){var r;const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??wm,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((r=e.allowedNonAlphanumericCharacters)==null?void 0:r.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),i&&(t.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let i=0;i<e.length;i++)r=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Im{constructor(e,t,r,i){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new yl(this),this.idTokenSubscription=new yl(this),this.beforeStateQueue=new bm(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Qc,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=vt(t)),this._initializationPromise=this.queue(async()=>{var r,i,s;if(!this._deleted&&(this.persistenceManager=await On.create(this,e),(r=this._resolvePersistenceManagerAvailable)==null||r.call(this),!this._deleted)){if((i=this._popupRedirectResolver)!=null&&i._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((s=this.currentUser)==null?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Mi(this,{idToken:e}),r=await Qe._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var s;if($e(this.app)){const a=this.app.settings.authIdToken;return a?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(a).then(c,c))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let r=t,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const a=(s=this.redirectUser)==null?void 0:s._redirectEventId,c=r==null?void 0:r._redirectEventId,l=await this.tryRedirectSignIn(e);(!a||a===c)&&(l!=null&&l.user)&&(r=l.user,i=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(r)}catch(a){r=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(a))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return K(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await Fi(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=nm()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if($e(this.app))return Promise.reject(gt(this));const t=e?Re(e):null;return t&&K(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&K(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return $e(this.app)?Promise.reject(gt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return $e(this.app)?Promise.reject(gt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(vt(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Em(this),t=new Tm(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new vr("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await ym(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&vt(e)||this._popupRedirectResolver;K(t,this,"argument-error"),this.redirectPersistenceManager=await On.create(this,[vt(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)==null?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)==null?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((t=this.currentUser)==null?void 0:t.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,i){if(this._deleted)return()=>{};const s=typeof t=="function"?t:t.next.bind(t);let a=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(K(c,this,"internal-error"),c.then(()=>{a||s(this.currentUser)}),typeof t=="function"){const l=e.addObserver(t,r,i);return()=>{a=!0,l()}}else{const l=e.addObserver(t);return()=>{a=!0,l()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return K(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=ml(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var i;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await((i=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:i.getHeartbeatsHeader());t&&(e["X-Firebase-Client"]=t);const r=await this._getAppCheckToken();return r&&(e["X-Firebase-AppCheck"]=r),e}async _getAppCheckToken(){var t;if($e(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((t=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:t.getToken());return e!=null&&e.error&&Zg(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function hn(n){return Re(n)}class yl{constructor(e){this.auth=e,this.observer=null,this.addObserver=Up(t=>this.observer=t)}get next(){return K(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Bi={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function xm(n){Bi=n}function vl(n){return Bi.loadJS(n)}function Am(){return Bi.recaptchaEnterpriseScript}function Sm(){return Bi.gapiScript}function Cm(n){return`__${n}${Math.floor(Math.random()*1e6)}`}class km{constructor(){this.enterprise=new Rm}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class Rm{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}const Pm="recaptcha-enterprise",_l="NO_RECAPTCHA";class Nm{constructor(e){this.type=Pm,this.auth=hn(e)}async verify(e="verify",t=!1){async function r(s){if(!t){if(s.tenantId==null&&s._agentRecaptchaConfig!=null)return s._agentRecaptchaConfig.siteKey;if(s.tenantId!=null&&s._tenantRecaptchaConfigs[s.tenantId]!==void 0)return s._tenantRecaptchaConfigs[s.tenantId].siteKey}return new Promise(async(a,c)=>{lm(s,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(l=>{if(l.recaptchaKey===void 0)c(new Error("recaptcha Enterprise site key undefined"));else{const h=new cm(l);return s.tenantId==null?s._agentRecaptchaConfig=h:s._tenantRecaptchaConfigs[s.tenantId]=h,a(h.siteKey)}}).catch(l=>{c(l)})})}function i(s,a,c){const l=window.grecaptcha;tl(l)?l.enterprise.ready(()=>{l.enterprise.execute(s,{action:e}).then(h=>{a(h)}).catch(()=>{a(_l)})}):c(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new km().execute("siteKey",{action:"verify"}):new Promise((s,a)=>{r(this.auth).then(c=>{if(!t&&tl(window.grecaptcha))i(c,s,a);else{if(typeof window>"u"){a(new Error("RecaptchaVerifier is only supported in browser"));return}let l=Am();l.length!==0&&(l+=c),vl(l).then(()=>{i(c,s,a)}).catch(h=>{a(h)})}}).catch(c=>{a(c)})})}}async function bl(n,e,t,r=!1,i=!1){const s=new Nm(n);let a;if(i)a=_l;else try{a=await s.verify(t)}catch{a=await s.verify(t,!0)}const c={...e};if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in c){const l=c.phoneEnrollmentInfo.phoneNumber,h=c.phoneEnrollmentInfo.recaptchaToken;Object.assign(c,{phoneEnrollmentInfo:{phoneNumber:l,recaptchaToken:h,captchaResponse:a,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in c){const l=c.phoneSignInInfo.recaptchaToken;Object.assign(c,{phoneSignInInfo:{recaptchaToken:l,captchaResponse:a,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return c}return r?Object.assign(c,{captchaResp:a}):Object.assign(c,{captchaResponse:a}),Object.assign(c,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(c,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),c}async function Co(n,e,t,r,i){var s;if((s=n._getRecaptchaConfig())!=null&&s.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const a=await bl(n,e,t,t==="getOobCode");return r(n,a)}else return r(n,e).catch(async a=>{if(a.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const c=await bl(n,e,t,t==="getOobCode");return r(n,c)}else return Promise.reject(a)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dm(n,e){const t=_o(n,"auth");if(t.isInitialized()){const i=t.getImmediate(),s=t.getOptions();if(cn(s,e??{}))return i;We(i,"already-initialized")}return t.initialize({options:e})}function Lm(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(vt);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function Vm(n,e,t){const r=hn(n);K(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const i=!1,s=El(e),{host:a,port:c}=Om(e),l=c===null?"":`:${c}`,h={url:`${s}//${a}${l}/`},d=Object.freeze({host:a,port:c,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:i})});if(!r._canInitEmulator){K(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),K(cn(h,r.config.emulator)&&cn(d,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=h,r.emulatorConfig=d,r.settings.appVerificationDisabledForTesting=!0,wr(a)?Dc(`${s}//${a}${l}`):Mm()}function El(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function Om(n){const e=El(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(r);if(i){const s=i[1];return{host:s,port:wl(r.substr(s.length+1))}}else{const[s,a]=r.split(":");return{host:s,port:wl(a)}}}function wl(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function Mm(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ko{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return mt("not implemented")}_getIdTokenResponse(e){return mt("not implemented")}_linkToIdToken(e,t){return mt("not implemented")}_getReauthenticationResolver(e){return mt("not implemented")}}async function Fm(n,e){return Dt(n,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Um(n,e){return xr(n,"POST","/v1/accounts:signInWithPassword",Nt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Bm(n,e){return xr(n,"POST","/v1/accounts:signInWithEmailLink",Nt(n,e))}async function qm(n,e){return xr(n,"POST","/v1/accounts:signInWithEmailLink",Nt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cr extends ko{constructor(e,t,r,i=null){super("password",r),this._email=e,this._password=t,this._tenantId=i}static _fromEmailAndPassword(e,t){return new Cr(e,t,"password")}static _fromEmailAndCode(e,t,r=null){return new Cr(e,t,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Co(e,t,"signInWithPassword",Um);case"emailLink":return Bm(e,{email:this._email,oobCode:this._password});default:We(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const r={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Co(e,r,"signUpPassword",Fm);case"emailLink":return qm(e,{idToken:t,email:this._email,oobCode:this._password});default:We(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Mn(n,e){return xr(n,"POST","/v1/accounts:signInWithIdp",Nt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $m="http://localhost";class dn extends ko{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new dn(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):We("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i,...s}=t;if(!r||!i)return null;const a=new dn(r,i);return a.idToken=s.idToken||void 0,a.accessToken=s.accessToken||void 0,a.secret=s.secret,a.nonce=s.nonce,a.pendingToken=s.pendingToken||null,a}_getIdTokenResponse(e){const t=this.buildRequest();return Mn(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,Mn(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Mn(e,t)}buildRequest(){const e={requestUri:$m,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=_r(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hm(n){switch(n){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function zm(n){const e=br(Er(n)).link,t=e?br(Er(e)).deep_link_id:null,r=br(Er(n)).deep_link_id;return(r?br(Er(r)).link:null)||r||t||e||n}class Ro{constructor(e){const t=br(Er(e)),r=t.apiKey??null,i=t.oobCode??null,s=Hm(t.mode??null);K(r&&i&&s,"argument-error"),this.apiKey=r,this.operation=s,this.code=i,this.continueUrl=t.continueUrl??null,this.languageCode=t.lang??null,this.tenantId=t.tenantId??null}static parseLink(e){const t=zm(e);try{return new Ro(t)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fn{constructor(){this.providerId=Fn.PROVIDER_ID}static credential(e,t){return Cr._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const r=Ro.parseLink(t);return K(r,"argument-error"),Cr._fromEmailAndCode(e,r.code,r.tenantId)}}Fn.PROVIDER_ID="password",Fn.EMAIL_PASSWORD_SIGN_IN_METHOD="password",Fn.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tl{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kr extends Tl{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vt extends kr{constructor(){super("facebook.com")}static credential(e){return dn._fromParams({providerId:Vt.PROVIDER_ID,signInMethod:Vt.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Vt.credentialFromTaggedObject(e)}static credentialFromError(e){return Vt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Vt.credential(e.oauthAccessToken)}catch{return null}}}Vt.FACEBOOK_SIGN_IN_METHOD="facebook.com",Vt.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ot extends kr{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return dn._fromParams({providerId:Ot.PROVIDER_ID,signInMethod:Ot.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return Ot.credentialFromTaggedObject(e)}static credentialFromError(e){return Ot.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return Ot.credential(t,r)}catch{return null}}}Ot.GOOGLE_SIGN_IN_METHOD="google.com",Ot.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mt extends kr{constructor(){super("github.com")}static credential(e){return dn._fromParams({providerId:Mt.PROVIDER_ID,signInMethod:Mt.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Mt.credentialFromTaggedObject(e)}static credentialFromError(e){return Mt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Mt.credential(e.oauthAccessToken)}catch{return null}}}Mt.GITHUB_SIGN_IN_METHOD="github.com",Mt.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ft extends kr{constructor(){super("twitter.com")}static credential(e,t){return dn._fromParams({providerId:Ft.PROVIDER_ID,signInMethod:Ft.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return Ft.credentialFromTaggedObject(e)}static credentialFromError(e){return Ft.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return Ft.credential(t,r)}catch{return null}}}Ft.TWITTER_SIGN_IN_METHOD="twitter.com",Ft.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function jm(n,e){return xr(n,"POST","/v1/accounts:signUp",Nt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fn{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,i=!1){const s=await Qe._fromIdTokenResponse(e,r,i),a=Il(r);return new fn({user:s,providerId:a,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const i=Il(r);return new fn({user:e,providerId:i,_tokenResponse:r,operationType:t})}}function Il(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qi extends ft{constructor(e,t,r,i){super(t.code,t.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,qi.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,i){return new qi(e,t,r,i)}}function xl(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?qi._fromErrorAndOperation(n,s,e,r):s})}async function Km(n,e,t=!1){const r=await Sr(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return fn._forOperation(n,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Gm(n,e,t=!1){const{auth:r}=n;if($e(r.app))return Promise.reject(gt(r));const i="reauthenticate";try{const s=await Sr(n,xl(r,i,e,n),t);K(s.idToken,r,"internal-error");const a=xo(s.idToken);K(a,r,"internal-error");const{sub:c}=a;return K(n.uid===c,r,"user-mismatch"),fn._forOperation(n,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&We(r,"user-mismatch"),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Al(n,e,t=!1){if($e(n.app))return Promise.reject(gt(n));const r="signIn",i=await xl(n,r,e),s=await fn._fromIdTokenResponse(n,r,i);return t||await n._updateCurrentUser(s.user),s}async function Wm(n,e){return Al(hn(n),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Sl(n){const e=hn(n);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function Qm(n,e,t){if($e(n.app))return Promise.reject(gt(n));const r=hn(n),a=await Co(r,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",jm).catch(l=>{throw l.code==="auth/password-does-not-meet-requirements"&&Sl(n),l}),c=await fn._fromIdTokenResponse(r,"signIn",a);return await r._updateCurrentUser(c.user),c}function Ym(n,e,t){return $e(n.app)?Promise.reject(gt(n)):Wm(Re(n),Fn.credential(e,t)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&Sl(n),r})}function Xm(n,e,t,r){return Re(n).onIdTokenChanged(e,t,r)}function Jm(n,e,t){return Re(n).beforeAuthStateChanged(e,t)}function Zm(n,e,t,r){return Re(n).onAuthStateChanged(e,t,r)}function ey(n){return Re(n).signOut()}const $i="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cl{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem($i,"1"),this.storage.removeItem($i),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ty=1e3,ny=10;class kl extends Cl{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=gl(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),i=this.localCache[t];r!==i&&e(t,i,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((a,c,l)=>{this.notifyListeners(a,l)});return}const r=e.key;t?this.detachListener():this.stopPolling();const i=()=>{const a=this.storage.getItem(r);!t&&this.localCache[r]===a||this.notifyListeners(r,a)},s=this.storage.getItem(r);_m()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,ny):i()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},ty)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}kl.type="LOCAL";const ry=kl;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rl extends Cl{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}Rl.type="SESSION";const Pl=Rl;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function iy(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hi{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(i=>i.isListeningto(e));if(t)return t;const r=new Hi(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:i,data:s}=t.data,a=this.handlersMap[i];if(!(a!=null&&a.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:i});const c=Array.from(a).map(async h=>h(t.origin,s)),l=await iy(c);t.ports[0].postMessage({status:"done",eventId:r,eventType:i,response:l})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Hi.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Po(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sy{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,a;return new Promise((c,l)=>{const h=Po("",20);i.port1.start();const d=setTimeout(()=>{l(new Error("unsupported_event"))},r);a={messageChannel:i,onMessage(p){const y=p;if(y.data.eventId===h)switch(y.data.status){case"ack":clearTimeout(d),s=setTimeout(()=>{l(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),c(y.data.response);break;default:clearTimeout(d),clearTimeout(s),l(new Error("invalid_response"));break}}},this.handlers.add(a),i.port1.addEventListener("message",a.onMessage),this.target.postMessage({eventType:e,eventId:h,data:t},[i.port2])}).finally(()=>{a&&this.removeMessageHandler(a)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function et(){return window}function oy(n){et().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nl(){return typeof et().WorkerGlobalScope<"u"&&typeof et().importScripts=="function"}async function ay(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function cy(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)==null?void 0:n.controller)||null}function ly(){return Nl()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dl="firebaseLocalStorageDb",uy=1,zi="firebaseLocalStorage",Ll="fbase_key";class Rr{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function ji(n,e){return n.transaction([zi],e?"readwrite":"readonly").objectStore(zi)}function hy(){const n=indexedDB.deleteDatabase(Dl);return new Rr(n).toPromise()}function No(){const n=indexedDB.open(Dl,uy);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(zi,{keyPath:Ll})}catch(i){t(i)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(zi)?e(r):(r.close(),await hy(),e(await No()))})})}async function Vl(n,e,t){const r=ji(n,!0).put({[Ll]:e,value:t});return new Rr(r).toPromise()}async function dy(n,e){const t=ji(n,!1).get(e),r=await new Rr(t).toPromise();return r===void 0?null:r.value}function Ol(n,e){const t=ji(n,!0).delete(e);return new Rr(t).toPromise()}const fy=800,py=3;class Ml{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await No(),this.db)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>py)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return Nl()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Hi._getInstance(ly()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var t,r;if(this.activeServiceWorker=await ay(),!this.activeServiceWorker)return;this.sender=new sy(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(t=e[0])!=null&&t.fulfilled&&(r=e[0])!=null&&r.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||cy()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await No();return await Vl(e,$i,"1"),await Ol(e,$i),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>Vl(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>dy(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Ol(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(i=>{const s=ji(i,!1).getAll();return new Rr(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:i,value:s}of e)r.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),t.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!r.has(i)&&(this.notifyListeners(i,null),t.push(i));return t}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),fy)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}Ml.type="LOCAL";const gy=Ml;new Ir(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function my(n,e){return e?vt(e):(K(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Do extends ko{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Mn(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Mn(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Mn(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function yy(n){return Al(n.auth,new Do(n),n.bypassAuthState)}function vy(n){const{auth:e,user:t}=n;return K(t,e,"internal-error"),Gm(t,new Do(n),n.bypassAuthState)}async function _y(n){const{auth:e,user:t}=n;return K(t,e,"internal-error"),Km(t,new Do(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fl{constructor(e,t,r,i,s=!1){this.auth=e,this.resolver=r,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:i,tenantId:s,error:a,type:c}=e;if(a){this.reject(a);return}const l={auth:this.auth,requestUri:t,sessionId:r,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(l))}catch(h){this.reject(h)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return yy;case"linkViaPopup":case"linkViaRedirect":return _y;case"reauthViaPopup":case"reauthViaRedirect":return vy;default:We(this.auth,"internal-error")}}resolve(e){yt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){yt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const by=new Ir(2e3,1e4);class Un extends Fl{constructor(e,t,r,i,s){super(e,t,i,s),this.provider=r,this.authWindow=null,this.pollId=null,Un.currentPopupAction&&Un.currentPopupAction.cancel(),Un.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return K(e,this.auth,"internal-error"),e}async onExecution(){yt(this.filter.length===1,"Popup operations only handle one event");const e=Po();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(Ze(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(Ze(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Un.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if((r=(t=this.authWindow)==null?void 0:t.window)!=null&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Ze(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,by.get())};e()}}Un.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ey="pendingRedirect",Ki=new Map;class wy extends Fl{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=Ki.get(this.auth._key());if(!e){try{const r=await Ty(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}Ki.set(this.auth._key(),e)}return this.bypassAuthState||Ki.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function Ty(n,e){const t=Ay(e),r=xy(n);if(!await r._isAvailable())return!1;const i=await r._get(t)==="true";return await r._remove(t),i}function Iy(n,e){Ki.set(n._key(),e)}function xy(n){return vt(n._redirectPersistence)}function Ay(n){return Ui(Ey,n.config.apiKey,n.name)}async function Sy(n,e,t=!1){if($e(n.app))return Promise.reject(gt(n));const r=hn(n),i=my(r,e),a=await new wy(r,i,t).execute();return a&&!t&&(delete a.user._redirectEventId,await r._persistUserIfCurrent(a.user),await r._setRedirectUser(null,e)),a}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cy=10*60*1e3;class ky{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!Ry(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!Bl(e)){const i=((r=e.error.code)==null?void 0:r.split("auth/")[1])||"internal-error";t.onError(Ze(this.auth,i))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=Cy&&this.cachedEventUids.clear(),this.cachedEventUids.has(Ul(e))}saveEventToCache(e){this.cachedEventUids.add(Ul(e)),this.lastProcessedEventTime=Date.now()}}function Ul(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function Bl({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function Ry(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Bl(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Py(n,e={}){return Dt(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ny=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Dy=/^https?/;async function Ly(n){if(n.config.emulator)return;const{authorizedDomains:e}=await Py(n);for(const t of e)try{if(Vy(t))return}catch{}We(n,"unauthorized-domain")}function Vy(n){const e=wo(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const a=new URL(n);return a.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&a.hostname===r}if(!Dy.test(t))return!1;if(Ny.test(n))return r===n;const i=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Oy=new Ir(3e4,6e4);function ql(){const n=et().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function My(n){return new Promise((e,t)=>{var i,s,a;function r(){ql(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{ql(),t(Ze(n,"network-request-failed"))},timeout:Oy.get()})}if((s=(i=et().gapi)==null?void 0:i.iframes)!=null&&s.Iframe)e(gapi.iframes.getContext());else if((a=et().gapi)!=null&&a.load)r();else{const c=Cm("iframefcb");return et()[c]=()=>{gapi.load?r():t(Ze(n,"network-request-failed"))},vl(`${Sm()}?onload=${c}`).catch(l=>t(l))}}).catch(e=>{throw Gi=null,e})}let Gi=null;function Fy(n){return Gi=Gi||My(n),Gi}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Uy=new Ir(5e3,15e3),By="__/auth/iframe",qy="emulator/auth/iframe",$y={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Hy=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function zy(n){const e=n.config;K(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?To(e,qy):`https://${n.config.authDomain}/${By}`,r={apiKey:e.apiKey,appName:n.name,v:Ln},i=Hy.get(n.config.apiHost);i&&(r.eid=i);const s=n._getFrameworks();return s.length&&(r.fw=s.join(",")),`${t}?${_r(r).slice(1)}`}async function jy(n){const e=await Fy(n),t=et().gapi;return K(t,n,"internal-error"),e.open({where:document.body,url:zy(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:$y,dontclear:!0},r=>new Promise(async(i,s)=>{await r.restyle({setHideOnLeave:!1});const a=Ze(n,"network-request-failed"),c=et().setTimeout(()=>{s(a)},Uy.get());function l(){et().clearTimeout(c),i(r)}r.ping(l).then(l,()=>{s(a)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ky={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},Gy=500,Wy=600,Qy="_blank",Yy="http://localhost";class $l{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function Xy(n,e,t,r=Gy,i=Wy){const s=Math.max((window.screen.availHeight-i)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString();let c="";const l={...Ky,width:r.toString(),height:i.toString(),top:s,left:a},h=Ie().toLowerCase();t&&(c=ul(h)?Qy:t),cl(h)&&(e=e||Yy,l.scrollbars="yes");const d=Object.entries(l).reduce((y,[I,T])=>`${y}${I}=${T},`,"");if(vm(h)&&c!=="_self")return Jy(e||"",c),new $l(null);const p=window.open(e||"",c,d);K(p,n,"popup-blocked");try{p.focus()}catch{}return new $l(p)}function Jy(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zy="__/auth/handler",ev="emulator/auth/handler",tv=encodeURIComponent("fac");async function Hl(n,e,t,r,i,s){K(n.config.authDomain,n,"auth-domain-config-required"),K(n.config.apiKey,n,"invalid-api-key");const a={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:Ln,eventId:i};if(e instanceof Tl){e.setDefaultLanguage(n.languageCode),a.providerId=e.providerId||"",Fp(e.getCustomParameters())||(a.customParameters=JSON.stringify(e.getCustomParameters()));for(const[d,p]of Object.entries({}))a[d]=p}if(e instanceof kr){const d=e.getScopes().filter(p=>p!=="");d.length>0&&(a.scopes=d.join(","))}n.tenantId&&(a.tid=n.tenantId);const c=a;for(const d of Object.keys(c))c[d]===void 0&&delete c[d];const l=await n._getAppCheckToken(),h=l?`#${tv}=${encodeURIComponent(l)}`:"";return`${nv(n)}?${_r(c).slice(1)}${h}`}function nv({config:n}){return n.emulator?To(n,ev):`https://${n.authDomain}/${Zy}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lo="webStorageSupport";class rv{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Pl,this._completeRedirectFn=Sy,this._overrideRedirectResult=Iy}async _openPopup(e,t,r,i){var a;yt((a=this.eventManagers[e._key()])==null?void 0:a.manager,"_initialize() not called before _openPopup()");const s=await Hl(e,t,r,wo(),i);return Xy(e,s,Po())}async _openRedirect(e,t,r,i){await this._originValidation(e);const s=await Hl(e,t,r,wo(),i);return oy(s),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:i,promise:s}=this.eventManagers[t];return i?Promise.resolve(i):(yt(s,"If manager is not set, promise should be"),s)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await jy(e),r=new ky(e);return t.register("authEvent",i=>(K(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:r.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Lo,{type:Lo},i=>{var a;const s=(a=i==null?void 0:i[0])==null?void 0:a[Lo];s!==void 0&&t(!!s),We(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=Ly(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return gl()||ll()||So()}}const iv=rv;var zl="@firebase/auth",jl="1.13.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sv{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){K(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ov(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function av(n){Dn(new ln("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:a,authDomain:c}=r.options;K(a&&!a.includes(":"),"invalid-api-key",{appName:r.name});const l={apiKey:a,authDomain:c,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:ml(n)},h=new Im(r,i,s,l);return Lm(h,t),h},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),Dn(new ln("auth-internal",e=>{const t=hn(e.getProvider("auth").getImmediate());return(r=>new sv(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),Pt(zl,jl,ov(n)),Pt(zl,jl,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cv=5*60,lv=Pc("authIdTokenMaxAge")||cv;let Kl=null;const uv=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>lv)return;const i=t==null?void 0:t.token;Kl!==i&&(Kl=i,await fetch(n,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function hv(n=$c()){const e=_o(n,"auth");if(e.isInitialized())return e.getImmediate();const t=Dm(n,{popupRedirectResolver:iv,persistence:[gy,ry,Pl]}),r=Pc("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const s=new URL(r,location.origin);if(location.origin===s.origin){const a=uv(s.toString());Jm(t,a,()=>a(t.currentUser)),Xm(t,c=>a(c))}}const i=kc("auth");return i&&Vm(t,`http://${i}`),t}function dv(){var n;return((n=document.getElementsByTagName("head"))==null?void 0:n[0])??document}xm({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=i=>{const s=Ze("internal-error");s.customData=i,t(s)},r.type="text/javascript",r.charset="UTF-8",dv().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="}),av("Browser");var Gl=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Ut,Wl;(function(){var n;/** @license

   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */function e(_,m){function b(){}b.prototype=m.prototype,_.F=m.prototype,_.prototype=new b,_.prototype.constructor=_,_.D=function(w,E,A){for(var v=Array(arguments.length-2),ne=2;ne<arguments.length;ne++)v[ne-2]=arguments[ne];return m.prototype[E].apply(w,v)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(r,t),r.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function i(_,m,b){b||(b=0);const w=Array(16);if(typeof m=="string")for(var E=0;E<16;++E)w[E]=m.charCodeAt(b++)|m.charCodeAt(b++)<<8|m.charCodeAt(b++)<<16|m.charCodeAt(b++)<<24;else for(E=0;E<16;++E)w[E]=m[b++]|m[b++]<<8|m[b++]<<16|m[b++]<<24;m=_.g[0],b=_.g[1],E=_.g[2];let A=_.g[3],v;v=m+(A^b&(E^A))+w[0]+3614090360&4294967295,m=b+(v<<7&4294967295|v>>>25),v=A+(E^m&(b^E))+w[1]+3905402710&4294967295,A=m+(v<<12&4294967295|v>>>20),v=E+(b^A&(m^b))+w[2]+606105819&4294967295,E=A+(v<<17&4294967295|v>>>15),v=b+(m^E&(A^m))+w[3]+3250441966&4294967295,b=E+(v<<22&4294967295|v>>>10),v=m+(A^b&(E^A))+w[4]+4118548399&4294967295,m=b+(v<<7&4294967295|v>>>25),v=A+(E^m&(b^E))+w[5]+1200080426&4294967295,A=m+(v<<12&4294967295|v>>>20),v=E+(b^A&(m^b))+w[6]+2821735955&4294967295,E=A+(v<<17&4294967295|v>>>15),v=b+(m^E&(A^m))+w[7]+4249261313&4294967295,b=E+(v<<22&4294967295|v>>>10),v=m+(A^b&(E^A))+w[8]+1770035416&4294967295,m=b+(v<<7&4294967295|v>>>25),v=A+(E^m&(b^E))+w[9]+2336552879&4294967295,A=m+(v<<12&4294967295|v>>>20),v=E+(b^A&(m^b))+w[10]+4294925233&4294967295,E=A+(v<<17&4294967295|v>>>15),v=b+(m^E&(A^m))+w[11]+2304563134&4294967295,b=E+(v<<22&4294967295|v>>>10),v=m+(A^b&(E^A))+w[12]+1804603682&4294967295,m=b+(v<<7&4294967295|v>>>25),v=A+(E^m&(b^E))+w[13]+4254626195&4294967295,A=m+(v<<12&4294967295|v>>>20),v=E+(b^A&(m^b))+w[14]+2792965006&4294967295,E=A+(v<<17&4294967295|v>>>15),v=b+(m^E&(A^m))+w[15]+1236535329&4294967295,b=E+(v<<22&4294967295|v>>>10),v=m+(E^A&(b^E))+w[1]+4129170786&4294967295,m=b+(v<<5&4294967295|v>>>27),v=A+(b^E&(m^b))+w[6]+3225465664&4294967295,A=m+(v<<9&4294967295|v>>>23),v=E+(m^b&(A^m))+w[11]+643717713&4294967295,E=A+(v<<14&4294967295|v>>>18),v=b+(A^m&(E^A))+w[0]+3921069994&4294967295,b=E+(v<<20&4294967295|v>>>12),v=m+(E^A&(b^E))+w[5]+3593408605&4294967295,m=b+(v<<5&4294967295|v>>>27),v=A+(b^E&(m^b))+w[10]+38016083&4294967295,A=m+(v<<9&4294967295|v>>>23),v=E+(m^b&(A^m))+w[15]+3634488961&4294967295,E=A+(v<<14&4294967295|v>>>18),v=b+(A^m&(E^A))+w[4]+3889429448&4294967295,b=E+(v<<20&4294967295|v>>>12),v=m+(E^A&(b^E))+w[9]+568446438&4294967295,m=b+(v<<5&4294967295|v>>>27),v=A+(b^E&(m^b))+w[14]+3275163606&4294967295,A=m+(v<<9&4294967295|v>>>23),v=E+(m^b&(A^m))+w[3]+4107603335&4294967295,E=A+(v<<14&4294967295|v>>>18),v=b+(A^m&(E^A))+w[8]+1163531501&4294967295,b=E+(v<<20&4294967295|v>>>12),v=m+(E^A&(b^E))+w[13]+2850285829&4294967295,m=b+(v<<5&4294967295|v>>>27),v=A+(b^E&(m^b))+w[2]+4243563512&4294967295,A=m+(v<<9&4294967295|v>>>23),v=E+(m^b&(A^m))+w[7]+1735328473&4294967295,E=A+(v<<14&4294967295|v>>>18),v=b+(A^m&(E^A))+w[12]+2368359562&4294967295,b=E+(v<<20&4294967295|v>>>12),v=m+(b^E^A)+w[5]+4294588738&4294967295,m=b+(v<<4&4294967295|v>>>28),v=A+(m^b^E)+w[8]+2272392833&4294967295,A=m+(v<<11&4294967295|v>>>21),v=E+(A^m^b)+w[11]+1839030562&4294967295,E=A+(v<<16&4294967295|v>>>16),v=b+(E^A^m)+w[14]+4259657740&4294967295,b=E+(v<<23&4294967295|v>>>9),v=m+(b^E^A)+w[1]+2763975236&4294967295,m=b+(v<<4&4294967295|v>>>28),v=A+(m^b^E)+w[4]+1272893353&4294967295,A=m+(v<<11&4294967295|v>>>21),v=E+(A^m^b)+w[7]+4139469664&4294967295,E=A+(v<<16&4294967295|v>>>16),v=b+(E^A^m)+w[10]+3200236656&4294967295,b=E+(v<<23&4294967295|v>>>9),v=m+(b^E^A)+w[13]+681279174&4294967295,m=b+(v<<4&4294967295|v>>>28),v=A+(m^b^E)+w[0]+3936430074&4294967295,A=m+(v<<11&4294967295|v>>>21),v=E+(A^m^b)+w[3]+3572445317&4294967295,E=A+(v<<16&4294967295|v>>>16),v=b+(E^A^m)+w[6]+76029189&4294967295,b=E+(v<<23&4294967295|v>>>9),v=m+(b^E^A)+w[9]+3654602809&4294967295,m=b+(v<<4&4294967295|v>>>28),v=A+(m^b^E)+w[12]+3873151461&4294967295,A=m+(v<<11&4294967295|v>>>21),v=E+(A^m^b)+w[15]+530742520&4294967295,E=A+(v<<16&4294967295|v>>>16),v=b+(E^A^m)+w[2]+3299628645&4294967295,b=E+(v<<23&4294967295|v>>>9),v=m+(E^(b|~A))+w[0]+4096336452&4294967295,m=b+(v<<6&4294967295|v>>>26),v=A+(b^(m|~E))+w[7]+1126891415&4294967295,A=m+(v<<10&4294967295|v>>>22),v=E+(m^(A|~b))+w[14]+2878612391&4294967295,E=A+(v<<15&4294967295|v>>>17),v=b+(A^(E|~m))+w[5]+4237533241&4294967295,b=E+(v<<21&4294967295|v>>>11),v=m+(E^(b|~A))+w[12]+1700485571&4294967295,m=b+(v<<6&4294967295|v>>>26),v=A+(b^(m|~E))+w[3]+2399980690&4294967295,A=m+(v<<10&4294967295|v>>>22),v=E+(m^(A|~b))+w[10]+4293915773&4294967295,E=A+(v<<15&4294967295|v>>>17),v=b+(A^(E|~m))+w[1]+2240044497&4294967295,b=E+(v<<21&4294967295|v>>>11),v=m+(E^(b|~A))+w[8]+1873313359&4294967295,m=b+(v<<6&4294967295|v>>>26),v=A+(b^(m|~E))+w[15]+4264355552&4294967295,A=m+(v<<10&4294967295|v>>>22),v=E+(m^(A|~b))+w[6]+2734768916&4294967295,E=A+(v<<15&4294967295|v>>>17),v=b+(A^(E|~m))+w[13]+1309151649&4294967295,b=E+(v<<21&4294967295|v>>>11),v=m+(E^(b|~A))+w[4]+4149444226&4294967295,m=b+(v<<6&4294967295|v>>>26),v=A+(b^(m|~E))+w[11]+3174756917&4294967295,A=m+(v<<10&4294967295|v>>>22),v=E+(m^(A|~b))+w[2]+718787259&4294967295,E=A+(v<<15&4294967295|v>>>17),v=b+(A^(E|~m))+w[9]+3951481745&4294967295,_.g[0]=_.g[0]+m&4294967295,_.g[1]=_.g[1]+(E+(v<<21&4294967295|v>>>11))&4294967295,_.g[2]=_.g[2]+E&4294967295,_.g[3]=_.g[3]+A&4294967295}r.prototype.v=function(_,m){m===void 0&&(m=_.length);const b=m-this.blockSize,w=this.C;let E=this.h,A=0;for(;A<m;){if(E==0)for(;A<=b;)i(this,_,A),A+=this.blockSize;if(typeof _=="string"){for(;A<m;)if(w[E++]=_.charCodeAt(A++),E==this.blockSize){i(this,w),E=0;break}}else for(;A<m;)if(w[E++]=_[A++],E==this.blockSize){i(this,w),E=0;break}}this.h=E,this.o+=m},r.prototype.A=function(){var _=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);_[0]=128;for(var m=1;m<_.length-8;++m)_[m]=0;m=this.o*8;for(var b=_.length-8;b<_.length;++b)_[b]=m&255,m/=256;for(this.v(_),_=Array(16),m=0,b=0;b<4;++b)for(let w=0;w<32;w+=8)_[m++]=this.g[b]>>>w&255;return _};function s(_,m){var b=c;return Object.prototype.hasOwnProperty.call(b,_)?b[_]:b[_]=m(_)}function a(_,m){this.h=m;const b=[];let w=!0;for(let E=_.length-1;E>=0;E--){const A=_[E]|0;w&&A==m||(b[E]=A,w=!1)}this.g=b}var c={};function l(_){return-128<=_&&_<128?s(_,function(m){return new a([m|0],m<0?-1:0)}):new a([_|0],_<0?-1:0)}function h(_){if(isNaN(_)||!isFinite(_))return p;if(_<0)return x(h(-_));const m=[];let b=1;for(let w=0;_>=b;w++)m[w]=_/b|0,b*=4294967296;return new a(m,0)}function d(_,m){if(_.length==0)throw Error("number format error: empty string");if(m=m||10,m<2||36<m)throw Error("radix out of range: "+m);if(_.charAt(0)=="-")return x(d(_.substring(1),m));if(_.indexOf("-")>=0)throw Error('number format error: interior "-" character');const b=h(Math.pow(m,8));let w=p;for(let A=0;A<_.length;A+=8){var E=Math.min(8,_.length-A);const v=parseInt(_.substring(A,A+E),m);E<8?(E=h(Math.pow(m,E)),w=w.j(E).add(h(v))):(w=w.j(b),w=w.add(h(v)))}return w}var p=l(0),y=l(1),I=l(16777216);n=a.prototype,n.m=function(){if(R(this))return-x(this).m();let _=0,m=1;for(let b=0;b<this.g.length;b++){const w=this.i(b);_+=(w>=0?w:4294967296+w)*m,m*=4294967296}return _},n.toString=function(_){if(_=_||10,_<2||36<_)throw Error("radix out of range: "+_);if(T(this))return"0";if(R(this))return"-"+x(this).toString(_);const m=h(Math.pow(_,6));var b=this;let w="";for(;;){const E=F(b,m).g;b=k(b,E.j(m));let A=((b.g.length>0?b.g[0]:b.h)>>>0).toString(_);if(b=E,T(b))return A+w;for(;A.length<6;)A="0"+A;w=A+w}},n.i=function(_){return _<0?0:_<this.g.length?this.g[_]:this.h};function T(_){if(_.h!=0)return!1;for(let m=0;m<_.g.length;m++)if(_.g[m]!=0)return!1;return!0}function R(_){return _.h==-1}n.l=function(_){return _=k(this,_),R(_)?-1:T(_)?0:1};function x(_){const m=_.g.length,b=[];for(let w=0;w<m;w++)b[w]=~_.g[w];return new a(b,~_.h).add(y)}n.abs=function(){return R(this)?x(this):this},n.add=function(_){const m=Math.max(this.g.length,_.g.length),b=[];let w=0;for(let E=0;E<=m;E++){let A=w+(this.i(E)&65535)+(_.i(E)&65535),v=(A>>>16)+(this.i(E)>>>16)+(_.i(E)>>>16);w=v>>>16,A&=65535,v&=65535,b[E]=v<<16|A}return new a(b,b[b.length-1]&-2147483648?-1:0)};function k(_,m){return _.add(x(m))}n.j=function(_){if(T(this)||T(_))return p;if(R(this))return R(_)?x(this).j(x(_)):x(x(this).j(_));if(R(_))return x(this.j(x(_)));if(this.l(I)<0&&_.l(I)<0)return h(this.m()*_.m());const m=this.g.length+_.g.length,b=[];for(var w=0;w<2*m;w++)b[w]=0;for(w=0;w<this.g.length;w++)for(let E=0;E<_.g.length;E++){const A=this.i(w)>>>16,v=this.i(w)&65535,ne=_.i(E)>>>16,Ue=_.i(E)&65535;b[2*w+2*E]+=v*Ue,O(b,2*w+2*E),b[2*w+2*E+1]+=A*Ue,O(b,2*w+2*E+1),b[2*w+2*E+1]+=v*ne,O(b,2*w+2*E+1),b[2*w+2*E+2]+=A*ne,O(b,2*w+2*E+2)}for(_=0;_<m;_++)b[_]=b[2*_+1]<<16|b[2*_];for(_=m;_<2*m;_++)b[_]=0;return new a(b,0)};function O(_,m){for(;(_[m]&65535)!=_[m];)_[m+1]+=_[m]>>>16,_[m]&=65535,m++}function D(_,m){this.g=_,this.h=m}function F(_,m){if(T(m))throw Error("division by zero");if(T(_))return new D(p,p);if(R(_))return m=F(x(_),m),new D(x(m.g),x(m.h));if(R(m))return m=F(_,x(m)),new D(x(m.g),m.h);if(_.g.length>30){if(R(_)||R(m))throw Error("slowDivide_ only works with positive integers.");for(var b=y,w=m;w.l(_)<=0;)b=H(b),w=H(w);var E=j(b,1),A=j(w,1);for(w=j(w,2),b=j(b,2);!T(w);){var v=A.add(w);v.l(_)<=0&&(E=E.add(b),A=v),w=j(w,1),b=j(b,1)}return m=k(_,E.j(m)),new D(E,m)}for(E=p;_.l(m)>=0;){for(b=Math.max(1,Math.floor(_.m()/m.m())),w=Math.ceil(Math.log(b)/Math.LN2),w=w<=48?1:Math.pow(2,w-48),A=h(b),v=A.j(m);R(v)||v.l(_)>0;)b-=w,A=h(b),v=A.j(m);T(A)&&(A=y),E=E.add(A),_=k(_,v)}return new D(E,_)}n.B=function(_){return F(this,_).h},n.and=function(_){const m=Math.max(this.g.length,_.g.length),b=[];for(let w=0;w<m;w++)b[w]=this.i(w)&_.i(w);return new a(b,this.h&_.h)},n.or=function(_){const m=Math.max(this.g.length,_.g.length),b=[];for(let w=0;w<m;w++)b[w]=this.i(w)|_.i(w);return new a(b,this.h|_.h)},n.xor=function(_){const m=Math.max(this.g.length,_.g.length),b=[];for(let w=0;w<m;w++)b[w]=this.i(w)^_.i(w);return new a(b,this.h^_.h)};function H(_){const m=_.g.length+1,b=[];for(let w=0;w<m;w++)b[w]=_.i(w)<<1|_.i(w-1)>>>31;return new a(b,_.h)}function j(_,m){const b=m>>5;m%=32;const w=_.g.length-b,E=[];for(let A=0;A<w;A++)E[A]=m>0?_.i(A+b)>>>m|_.i(A+b+1)<<32-m:_.i(A+b);return new a(E,_.h)}r.prototype.digest=r.prototype.A,r.prototype.reset=r.prototype.u,r.prototype.update=r.prototype.v,Wl=r,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.B,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=h,a.fromString=d,Ut=a}).apply(typeof Gl<"u"?Gl:typeof self<"u"?self:typeof window<"u"?window:{});var Wi=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Ql,Pr,Yl,Qi,Vo,Xl,Jl,Zl;(function(){var n,e=Object.defineProperty;function t(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof Wi=="object"&&Wi];for(var u=0;u<o.length;++u){var f=o[u];if(f&&f.Math==Math)return f}throw Error("Cannot find global object")}var r=t(this);function i(o,u){if(u)e:{var f=r;o=o.split(".");for(var g=0;g<o.length-1;g++){var S=o[g];if(!(S in f))break e;f=f[S]}o=o[o.length-1],g=f[o],u=u(g),u!=g&&u!=null&&e(f,o,{configurable:!0,writable:!0,value:u})}}i("Symbol.dispose",function(o){return o||Symbol("Symbol.dispose")}),i("Array.prototype.values",function(o){return o||function(){return this[Symbol.iterator]()}}),i("Object.entries",function(o){return o||function(u){var f=[],g;for(g in u)Object.prototype.hasOwnProperty.call(u,g)&&f.push([g,u[g]]);return f}});/** @license

   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */var s=s||{},a=this||self;function c(o){var u=typeof o;return u=="object"&&o!=null||u=="function"}function l(o,u,f){return o.call.apply(o.bind,arguments)}function h(o,u,f){return h=l,h.apply(null,arguments)}function d(o,u){var f=Array.prototype.slice.call(arguments,1);return function(){var g=f.slice();return g.push.apply(g,arguments),o.apply(this,g)}}function p(o,u){function f(){}f.prototype=u.prototype,o.Z=u.prototype,o.prototype=new f,o.prototype.constructor=o,o.Ob=function(g,S,C){for(var M=Array(arguments.length-2),Y=2;Y<arguments.length;Y++)M[Y-2]=arguments[Y];return u.prototype[S].apply(g,M)}}var y=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?o=>o&&AsyncContext.Snapshot.wrap(o):o=>o;function I(o){const u=o.length;if(u>0){const f=Array(u);for(let g=0;g<u;g++)f[g]=o[g];return f}return[]}function T(o,u){for(let g=1;g<arguments.length;g++){const S=arguments[g];var f=typeof S;if(f=f!="object"?f:S?Array.isArray(S)?"array":f:"null",f=="array"||f=="object"&&typeof S.length=="number"){f=o.length||0;const C=S.length||0;o.length=f+C;for(let M=0;M<C;M++)o[f+M]=S[M]}else o.push(S)}}class R{constructor(u,f){this.i=u,this.j=f,this.h=0,this.g=null}get(){let u;return this.h>0?(this.h--,u=this.g,this.g=u.next,u.next=null):u=this.i(),u}}function x(o){a.setTimeout(()=>{throw o},0)}function k(){var o=_;let u=null;return o.g&&(u=o.g,o.g=o.g.next,o.g||(o.h=null),u.next=null),u}class O{constructor(){this.h=this.g=null}add(u,f){const g=D.get();g.set(u,f),this.h?this.h.next=g:this.g=g,this.h=g}}var D=new R(()=>new F,o=>o.reset());class F{constructor(){this.next=this.g=this.h=null}set(u,f){this.h=u,this.g=f,this.next=null}reset(){this.next=this.g=this.h=null}}let H,j=!1,_=new O,m=()=>{const o=Promise.resolve(void 0);H=()=>{o.then(b)}};function b(){for(var o;o=k();){try{o.h.call(o.g)}catch(f){x(f)}var u=D;u.j(o),u.h<100&&(u.h++,o.next=u.g,u.g=o)}j=!1}function w(){this.u=this.u,this.C=this.C}w.prototype.u=!1,w.prototype.dispose=function(){this.u||(this.u=!0,this.N())},w.prototype[Symbol.dispose]=function(){this.dispose()},w.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function E(o,u){this.type=o,this.g=this.target=u,this.defaultPrevented=!1}E.prototype.h=function(){this.defaultPrevented=!0};var A=function(){if(!a.addEventListener||!Object.defineProperty)return!1;var o=!1,u=Object.defineProperty({},"passive",{get:function(){o=!0}});try{const f=()=>{};a.addEventListener("test",f,u),a.removeEventListener("test",f,u)}catch{}return o}();function v(o){return/^[\s\xa0]*$/.test(o)}function ne(o,u){E.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o&&this.init(o,u)}p(ne,E),ne.prototype.init=function(o,u){const f=this.type=o.type,g=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;this.target=o.target||o.srcElement,this.g=u,u=o.relatedTarget,u||(f=="mouseover"?u=o.fromElement:f=="mouseout"&&(u=o.toElement)),this.relatedTarget=u,g?(this.clientX=g.clientX!==void 0?g.clientX:g.pageX,this.clientY=g.clientY!==void 0?g.clientY:g.pageY,this.screenX=g.screenX||0,this.screenY=g.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=o.pointerType,this.state=o.state,this.i=o,o.defaultPrevented&&ne.Z.h.call(this)},ne.prototype.h=function(){ne.Z.h.call(this);const o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var Ue="closure_listenable_"+(Math.random()*1e6|0),ii=0;function Be(o,u,f,g,S){this.listener=o,this.proxy=null,this.src=u,this.type=f,this.capture=!!g,this.ha=S,this.key=++ii,this.da=this.fa=!1}function Fe(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function Pe(o,u,f){for(const g in o)u.call(f,o[g],g,o)}function Zw(o,u){for(const f in o)u.call(void 0,o[f],f,o)}function cf(o){const u={};for(const f in o)u[f]=o[f];return u}const lf="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function uf(o,u){let f,g;for(let S=1;S<arguments.length;S++){g=arguments[S];for(f in g)o[f]=g[f];for(let C=0;C<lf.length;C++)f=lf[C],Object.prototype.hasOwnProperty.call(g,f)&&(o[f]=g[f])}}function Ks(o){this.src=o,this.g={},this.h=0}Ks.prototype.add=function(o,u,f,g,S){const C=o.toString();o=this.g[C],o||(o=this.g[C]=[],this.h++);const M=ec(o,u,g,S);return M>-1?(u=o[M],f||(u.fa=!1)):(u=new Be(u,this.src,C,!!g,S),u.fa=f,o.push(u)),u};function Za(o,u){const f=u.type;if(f in o.g){var g=o.g[f],S=Array.prototype.indexOf.call(g,u,void 0),C;(C=S>=0)&&Array.prototype.splice.call(g,S,1),C&&(Fe(u),o.g[f].length==0&&(delete o.g[f],o.h--))}}function ec(o,u,f,g){for(let S=0;S<o.length;++S){const C=o[S];if(!C.da&&C.listener==u&&C.capture==!!f&&C.ha==g)return S}return-1}var tc="closure_lm_"+(Math.random()*1e6|0),nc={};function hf(o,u,f,g,S){if(Array.isArray(u)){for(let C=0;C<u.length;C++)hf(o,u[C],f,g,S);return null}return f=pf(f),o&&o[Ue]?o.J(u,f,c(g)?!!g.capture:!1,S):eT(o,u,f,!1,g,S)}function eT(o,u,f,g,S,C){if(!u)throw Error("Invalid event type");const M=c(S)?!!S.capture:!!S;let Y=ic(o);if(Y||(o[tc]=Y=new Ks(o)),f=Y.add(u,f,g,M,C),f.proxy)return f;if(g=tT(),f.proxy=g,g.src=o,g.listener=f,o.addEventListener)A||(S=M),S===void 0&&(S=!1),o.addEventListener(u.toString(),g,S);else if(o.attachEvent)o.attachEvent(ff(u.toString()),g);else if(o.addListener&&o.removeListener)o.addListener(g);else throw Error("addEventListener and attachEvent are unavailable.");return f}function tT(){function o(f){return u.call(o.src,o.listener,f)}const u=nT;return o}function df(o,u,f,g,S){if(Array.isArray(u))for(var C=0;C<u.length;C++)df(o,u[C],f,g,S);else g=c(g)?!!g.capture:!!g,f=pf(f),o&&o[Ue]?(o=o.i,C=String(u).toString(),C in o.g&&(u=o.g[C],f=ec(u,f,g,S),f>-1&&(Fe(u[f]),Array.prototype.splice.call(u,f,1),u.length==0&&(delete o.g[C],o.h--)))):o&&(o=ic(o))&&(u=o.g[u.toString()],o=-1,u&&(o=ec(u,f,g,S)),(f=o>-1?u[o]:null)&&rc(f))}function rc(o){if(typeof o!="number"&&o&&!o.da){var u=o.src;if(u&&u[Ue])Za(u.i,o);else{var f=o.type,g=o.proxy;u.removeEventListener?u.removeEventListener(f,g,o.capture):u.detachEvent?u.detachEvent(ff(f),g):u.addListener&&u.removeListener&&u.removeListener(g),(f=ic(u))?(Za(f,o),f.h==0&&(f.src=null,u[tc]=null)):Fe(o)}}}function ff(o){return o in nc?nc[o]:nc[o]="on"+o}function nT(o,u){if(o.da)o=!0;else{u=new ne(u,this);const f=o.listener,g=o.ha||o.src;o.fa&&rc(o),o=f.call(g,u)}return o}function ic(o){return o=o[tc],o instanceof Ks?o:null}var sc="__closure_events_fn_"+(Math.random()*1e9>>>0);function pf(o){return typeof o=="function"?o:(o[sc]||(o[sc]=function(u){return o.handleEvent(u)}),o[sc])}function ke(){w.call(this),this.i=new Ks(this),this.M=this,this.G=null}p(ke,w),ke.prototype[Ue]=!0,ke.prototype.removeEventListener=function(o,u,f,g){df(this,o,u,f,g)};function Ne(o,u){var f,g=o.G;if(g)for(f=[];g;g=g.G)f.push(g);if(o=o.M,g=u.type||u,typeof u=="string")u=new E(u,o);else if(u instanceof E)u.target=u.target||o;else{var S=u;u=new E(g,o),uf(u,S)}S=!0;let C,M;if(f)for(M=f.length-1;M>=0;M--)C=u.g=f[M],S=Gs(C,g,!0,u)&&S;if(C=u.g=o,S=Gs(C,g,!0,u)&&S,S=Gs(C,g,!1,u)&&S,f)for(M=0;M<f.length;M++)C=u.g=f[M],S=Gs(C,g,!1,u)&&S}ke.prototype.N=function(){if(ke.Z.N.call(this),this.i){var o=this.i;for(const u in o.g){const f=o.g[u];for(let g=0;g<f.length;g++)Fe(f[g]);delete o.g[u],o.h--}}this.G=null},ke.prototype.J=function(o,u,f,g){return this.i.add(String(o),u,!1,f,g)},ke.prototype.K=function(o,u,f,g){return this.i.add(String(o),u,!0,f,g)};function Gs(o,u,f,g){if(u=o.i.g[String(u)],!u)return!0;u=u.concat();let S=!0;for(let C=0;C<u.length;++C){const M=u[C];if(M&&!M.da&&M.capture==f){const Y=M.listener,ve=M.ha||M.src;M.fa&&Za(o.i,M),S=Y.call(ve,g)!==!1&&S}}return S&&!g.defaultPrevented}function rT(o,u){if(typeof o!="function")if(o&&typeof o.handleEvent=="function")o=h(o.handleEvent,o);else throw Error("Invalid listener argument");return Number(u)>2147483647?-1:a.setTimeout(o,u||0)}function gf(o){o.g=rT(()=>{o.g=null,o.i&&(o.i=!1,gf(o))},o.l);const u=o.h;o.h=null,o.m.apply(null,u)}class iT extends w{constructor(u,f){super(),this.m=u,this.l=f,this.h=null,this.i=!1,this.g=null}j(u){this.h=arguments,this.g?this.i=!0:gf(this)}N(){super.N(),this.g&&(a.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function si(o){w.call(this),this.h=o,this.g={}}p(si,w);var mf=[];function yf(o){Pe(o.g,function(u,f){this.g.hasOwnProperty(f)&&rc(u)},o),o.g={}}si.prototype.N=function(){si.Z.N.call(this),yf(this)},si.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var oc=a.JSON.stringify,sT=a.JSON.parse,oT=class{stringify(o){return a.JSON.stringify(o,void 0)}parse(o){return a.JSON.parse(o,void 0)}};function vf(){}function _f(){}var oi={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function ac(){E.call(this,"d")}p(ac,E);function cc(){E.call(this,"c")}p(cc,E);var An={},bf=null;function Ws(){return bf=bf||new ke}An.Ia="serverreachability";function Ef(o){E.call(this,An.Ia,o)}p(Ef,E);function ai(o){const u=Ws();Ne(u,new Ef(u))}An.STAT_EVENT="statevent";function wf(o,u){E.call(this,An.STAT_EVENT,o),this.stat=u}p(wf,E);function De(o){const u=Ws();Ne(u,new wf(u,o))}An.Ja="timingevent";function Tf(o,u){E.call(this,An.Ja,o),this.size=u}p(Tf,E);function ci(o,u){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return a.setTimeout(function(){o()},u)}function li(){this.g=!0}li.prototype.ua=function(){this.g=!1};function aT(o,u,f,g,S,C){o.info(function(){if(o.g)if(C){var M="",Y=C.split("&");for(let re=0;re<Y.length;re++){var ve=Y[re].split("=");if(ve.length>1){const be=ve[0];ve=ve[1];const ht=be.split("_");M=ht.length>=2&&ht[1]=="type"?M+(be+"="+ve+"&"):M+(be+"=redacted&")}}}else M=null;else M=C;return"XMLHTTP REQ ("+g+") [attempt "+S+"]: "+u+`
`+f+`
`+M})}function cT(o,u,f,g,S,C,M){o.info(function(){return"XMLHTTP RESP ("+g+") [ attempt "+S+"]: "+u+`
`+f+`
`+C+" "+M})}function lr(o,u,f,g){o.info(function(){return"XMLHTTP TEXT ("+u+"): "+uT(o,f)+(g?" "+g:"")})}function lT(o,u){o.info(function(){return"TIMEOUT: "+u})}li.prototype.info=function(){};function uT(o,u){if(!o.g)return u;if(!u)return null;try{const C=JSON.parse(u);if(C){for(o=0;o<C.length;o++)if(Array.isArray(C[o])){var f=C[o];if(!(f.length<2)){var g=f[1];if(Array.isArray(g)&&!(g.length<1)){var S=g[0];if(S!="noop"&&S!="stop"&&S!="close")for(let M=1;M<g.length;M++)g[M]=""}}}}return oc(C)}catch{return u}}var Qs={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},If={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},xf;function lc(){}p(lc,vf),lc.prototype.g=function(){return new XMLHttpRequest},xf=new lc;function ui(o){return encodeURIComponent(String(o))}function hT(o){var u=1;o=o.split(":");const f=[];for(;u>0&&o.length;)f.push(o.shift()),u--;return o.length&&f.push(o.join(":")),f}function Xt(o,u,f,g){this.j=o,this.i=u,this.l=f,this.S=g||1,this.V=new si(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new Af}function Af(){this.i=null,this.g="",this.h=!1}var Sf={},uc={};function hc(o,u,f){o.M=1,o.A=Xs(ut(u)),o.u=f,o.R=!0,Cf(o,null)}function Cf(o,u){o.F=Date.now(),Ys(o),o.B=ut(o.A);var f=o.B,g=o.S;Array.isArray(g)||(g=[String(g)]),qf(f.i,"t",g),o.C=0,f=o.j.L,o.h=new Af,o.g=sp(o.j,f?u:null,!o.u),o.P>0&&(o.O=new iT(h(o.Y,o,o.g),o.P)),u=o.V,f=o.g,g=o.ba;var S="readystatechange";Array.isArray(S)||(S&&(mf[0]=S.toString()),S=mf);for(let C=0;C<S.length;C++){const M=hf(f,S[C],g||u.handleEvent,!1,u.h||u);if(!M)break;u.g[M.key]=M}u=o.J?cf(o.J):{},o.u?(o.v||(o.v="POST"),u["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.B,o.v,o.u,u)):(o.v="GET",o.g.ea(o.B,o.v,null,u)),ai(),aT(o.i,o.v,o.B,o.l,o.S,o.u)}Xt.prototype.ba=function(o){o=o.target;const u=this.O;u&&en(o)==3?u.j():this.Y(o)},Xt.prototype.Y=function(o){try{if(o==this.g)e:{const Y=en(this.g),ve=this.g.ya(),re=this.g.ca();if(!(Y<3)&&(Y!=3||this.g&&(this.h.h||this.g.la()||Wf(this.g)))){this.K||Y!=4||ve==7||(ve==8||re<=0?ai(3):ai(2)),dc(this);var u=this.g.ca();this.X=u;var f=dT(this);if(this.o=u==200,cT(this.i,this.v,this.B,this.l,this.S,Y,u),this.o){if(this.U&&!this.L){t:{if(this.g){var g,S=this.g;if((g=S.g?S.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!v(g)){var C=g;break t}}C=null}if(o=C)lr(this.i,this.l,o,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,fc(this,o);else{this.o=!1,this.m=3,De(12),Sn(this),hi(this);break e}}if(this.R){o=!0;let be;for(;!this.K&&this.C<f.length;)if(be=fT(this,f),be==uc){Y==4&&(this.m=4,De(14),o=!1),lr(this.i,this.l,null,"[Incomplete Response]");break}else if(be==Sf){this.m=4,De(15),lr(this.i,this.l,f,"[Invalid Chunk]"),o=!1;break}else lr(this.i,this.l,be,null),fc(this,be);if(kf(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),Y!=4||f.length!=0||this.h.h||(this.m=1,De(16),o=!1),this.o=this.o&&o,!o)lr(this.i,this.l,f,"[Invalid Chunked Response]"),Sn(this),hi(this);else if(f.length>0&&!this.W){this.W=!0;var M=this.j;M.g==this&&M.aa&&!M.P&&(M.j.info("Great, no buffering proxy detected. Bytes received: "+f.length),Ec(M),M.P=!0,De(11))}}else lr(this.i,this.l,f,null),fc(this,f);Y==4&&Sn(this),this.o&&!this.K&&(Y==4?tp(this.j,this):(this.o=!1,Ys(this)))}else ST(this.g),u==400&&f.indexOf("Unknown SID")>0?(this.m=3,De(12)):(this.m=0,De(13)),Sn(this),hi(this)}}}catch{}finally{}};function dT(o){if(!kf(o))return o.g.la();const u=Wf(o.g);if(u==="")return"";let f="";const g=u.length,S=en(o.g)==4;if(!o.h.i){if(typeof TextDecoder>"u")return Sn(o),hi(o),"";o.h.i=new a.TextDecoder}for(let C=0;C<g;C++)o.h.h=!0,f+=o.h.i.decode(u[C],{stream:!(S&&C==g-1)});return u.length=0,o.h.g+=f,o.C=0,o.h.g}function kf(o){return o.g?o.v=="GET"&&o.M!=2&&o.j.Aa:!1}function fT(o,u){var f=o.C,g=u.indexOf(`
`,f);return g==-1?uc:(f=Number(u.substring(f,g)),isNaN(f)?Sf:(g+=1,g+f>u.length?uc:(u=u.slice(g,g+f),o.C=g+f,u)))}Xt.prototype.cancel=function(){this.K=!0,Sn(this)};function Ys(o){o.T=Date.now()+o.H,Rf(o,o.H)}function Rf(o,u){if(o.D!=null)throw Error("WatchDog timer not null");o.D=ci(h(o.aa,o),u)}function dc(o){o.D&&(a.clearTimeout(o.D),o.D=null)}Xt.prototype.aa=function(){this.D=null;const o=Date.now();o-this.T>=0?(lT(this.i,this.B),this.M!=2&&(ai(),De(17)),Sn(this),this.m=2,hi(this)):Rf(this,this.T-o)};function hi(o){o.j.I==0||o.K||tp(o.j,o)}function Sn(o){dc(o);var u=o.O;u&&typeof u.dispose=="function"&&u.dispose(),o.O=null,yf(o.V),o.g&&(u=o.g,o.g=null,u.abort(),u.dispose())}function fc(o,u){try{var f=o.j;if(f.I!=0&&(f.g==o||pc(f.h,o))){if(!o.L&&pc(f.h,o)&&f.I==3){try{var g=f.Ba.g.parse(u)}catch{g=null}if(Array.isArray(g)&&g.length==3){var S=g;if(S[0]==0){e:if(!f.v){if(f.g)if(f.g.F+3e3<o.F)no(f),eo(f);else break e;bc(f),De(18)}}else f.xa=S[1],0<f.xa-f.K&&S[2]<37500&&f.F&&f.A==0&&!f.C&&(f.C=ci(h(f.Va,f),6e3));Df(f.h)<=1&&f.ta&&(f.ta=void 0)}else kn(f,11)}else if((o.L||f.g==o)&&no(f),!v(u))for(S=f.Ba.g.parse(u),u=0;u<S.length;u++){let re=S[u];const be=re[0];if(!(be<=f.K))if(f.K=be,re=re[1],f.I==2)if(re[0]=="c"){f.M=re[1],f.ba=re[2];const ht=re[3];ht!=null&&(f.ka=ht,f.j.info("VER="+f.ka));const Rn=re[4];Rn!=null&&(f.za=Rn,f.j.info("SVER="+f.za));const tn=re[5];tn!=null&&typeof tn=="number"&&tn>0&&(g=1.5*tn,f.O=g,f.j.info("backChannelRequestTimeoutMs_="+g)),g=f;const nn=o.g;if(nn){const io=nn.g?nn.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(io){var C=g.h;C.g||io.indexOf("spdy")==-1&&io.indexOf("quic")==-1&&io.indexOf("h2")==-1||(C.j=C.l,C.g=new Set,C.h&&(gc(C,C.h),C.h=null))}if(g.G){const wc=nn.g?nn.g.getResponseHeader("X-HTTP-Session-Id"):null;wc&&(g.wa=wc,oe(g.J,g.G,wc))}}f.I=3,f.l&&f.l.ra(),f.aa&&(f.T=Date.now()-o.F,f.j.info("Handshake RTT: "+f.T+"ms")),g=f;var M=o;if(g.na=ip(g,g.L?g.ba:null,g.W),M.L){Lf(g.h,M);var Y=M,ve=g.O;ve&&(Y.H=ve),Y.D&&(dc(Y),Ys(Y)),g.g=M}else Zf(g);f.i.length>0&&to(f)}else re[0]!="stop"&&re[0]!="close"||kn(f,7);else f.I==3&&(re[0]=="stop"||re[0]=="close"?re[0]=="stop"?kn(f,7):_c(f):re[0]!="noop"&&f.l&&f.l.qa(re),f.A=0)}}ai(4)}catch{}}var pT=class{constructor(o,u){this.g=o,this.map=u}};function Pf(o){this.l=o||10,a.PerformanceNavigationTiming?(o=a.performance.getEntriesByType("navigation"),o=o.length>0&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(a.chrome&&a.chrome.loadTimes&&a.chrome.loadTimes()&&a.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function Nf(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function Df(o){return o.h?1:o.g?o.g.size:0}function pc(o,u){return o.h?o.h==u:o.g?o.g.has(u):!1}function gc(o,u){o.g?o.g.add(u):o.h=u}function Lf(o,u){o.h&&o.h==u?o.h=null:o.g&&o.g.has(u)&&o.g.delete(u)}Pf.prototype.cancel=function(){if(this.i=Vf(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const o of this.g.values())o.cancel();this.g.clear()}};function Vf(o){if(o.h!=null)return o.i.concat(o.h.G);if(o.g!=null&&o.g.size!==0){let u=o.i;for(const f of o.g.values())u=u.concat(f.G);return u}return I(o.i)}var Of=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function gT(o,u){if(o){o=o.split("&");for(let f=0;f<o.length;f++){const g=o[f].indexOf("=");let S,C=null;g>=0?(S=o[f].substring(0,g),C=o[f].substring(g+1)):S=o[f],u(S,C?decodeURIComponent(C.replace(/\+/g," ")):"")}}}function Jt(o){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let u;o instanceof Jt?(this.l=o.l,di(this,o.j),this.o=o.o,this.g=o.g,fi(this,o.u),this.h=o.h,mc(this,$f(o.i)),this.m=o.m):o&&(u=String(o).match(Of))?(this.l=!1,di(this,u[1]||"",!0),this.o=pi(u[2]||""),this.g=pi(u[3]||"",!0),fi(this,u[4]),this.h=pi(u[5]||"",!0),mc(this,u[6]||"",!0),this.m=pi(u[7]||"")):(this.l=!1,this.i=new mi(null,this.l))}Jt.prototype.toString=function(){const o=[];var u=this.j;u&&o.push(gi(u,Mf,!0),":");var f=this.g;return(f||u=="file")&&(o.push("//"),(u=this.o)&&o.push(gi(u,Mf,!0),"@"),o.push(ui(f).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),f=this.u,f!=null&&o.push(":",String(f))),(f=this.h)&&(this.g&&f.charAt(0)!="/"&&o.push("/"),o.push(gi(f,f.charAt(0)=="/"?vT:yT,!0))),(f=this.i.toString())&&o.push("?",f),(f=this.m)&&o.push("#",gi(f,bT)),o.join("")},Jt.prototype.resolve=function(o){const u=ut(this);let f=!!o.j;f?di(u,o.j):f=!!o.o,f?u.o=o.o:f=!!o.g,f?u.g=o.g:f=o.u!=null;var g=o.h;if(f)fi(u,o.u);else if(f=!!o.h){if(g.charAt(0)!="/")if(this.g&&!this.h)g="/"+g;else{var S=u.h.lastIndexOf("/");S!=-1&&(g=u.h.slice(0,S+1)+g)}if(S=g,S==".."||S==".")g="";else if(S.indexOf("./")!=-1||S.indexOf("/.")!=-1){g=S.lastIndexOf("/",0)==0,S=S.split("/");const C=[];for(let M=0;M<S.length;){const Y=S[M++];Y=="."?g&&M==S.length&&C.push(""):Y==".."?((C.length>1||C.length==1&&C[0]!="")&&C.pop(),g&&M==S.length&&C.push("")):(C.push(Y),g=!0)}g=C.join("/")}else g=S}return f?u.h=g:f=o.i.toString()!=="",f?mc(u,$f(o.i)):f=!!o.m,f&&(u.m=o.m),u};function ut(o){return new Jt(o)}function di(o,u,f){o.j=f?pi(u,!0):u,o.j&&(o.j=o.j.replace(/:$/,""))}function fi(o,u){if(u){if(u=Number(u),isNaN(u)||u<0)throw Error("Bad port number "+u);o.u=u}else o.u=null}function mc(o,u,f){u instanceof mi?(o.i=u,ET(o.i,o.l)):(f||(u=gi(u,_T)),o.i=new mi(u,o.l))}function oe(o,u,f){o.i.set(u,f)}function Xs(o){return oe(o,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),o}function pi(o,u){return o?u?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function gi(o,u,f){return typeof o=="string"?(o=encodeURI(o).replace(u,mT),f&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function mT(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var Mf=/[#\/\?@]/g,yT=/[#\?:]/g,vT=/[#\?]/g,_T=/[#\?@]/g,bT=/#/g;function mi(o,u){this.h=this.g=null,this.i=o||null,this.j=!!u}function Cn(o){o.g||(o.g=new Map,o.h=0,o.i&&gT(o.i,function(u,f){o.add(decodeURIComponent(u.replace(/\+/g," ")),f)}))}n=mi.prototype,n.add=function(o,u){Cn(this),this.i=null,o=ur(this,o);let f=this.g.get(o);return f||this.g.set(o,f=[]),f.push(u),this.h+=1,this};function Ff(o,u){Cn(o),u=ur(o,u),o.g.has(u)&&(o.i=null,o.h-=o.g.get(u).length,o.g.delete(u))}function Uf(o,u){return Cn(o),u=ur(o,u),o.g.has(u)}n.forEach=function(o,u){Cn(this),this.g.forEach(function(f,g){f.forEach(function(S){o.call(u,S,g,this)},this)},this)};function Bf(o,u){Cn(o);let f=[];if(typeof u=="string")Uf(o,u)&&(f=f.concat(o.g.get(ur(o,u))));else for(o=Array.from(o.g.values()),u=0;u<o.length;u++)f=f.concat(o[u]);return f}n.set=function(o,u){return Cn(this),this.i=null,o=ur(this,o),Uf(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[u]),this.h+=1,this},n.get=function(o,u){return o?(o=Bf(this,o),o.length>0?String(o[0]):u):u};function qf(o,u,f){Ff(o,u),f.length>0&&(o.i=null,o.g.set(ur(o,u),I(f)),o.h+=f.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const o=[],u=Array.from(this.g.keys());for(let g=0;g<u.length;g++){var f=u[g];const S=ui(f);f=Bf(this,f);for(let C=0;C<f.length;C++){let M=S;f[C]!==""&&(M+="="+ui(f[C])),o.push(M)}}return this.i=o.join("&")};function $f(o){const u=new mi;return u.i=o.i,o.g&&(u.g=new Map(o.g),u.h=o.h),u}function ur(o,u){return u=String(u),o.j&&(u=u.toLowerCase()),u}function ET(o,u){u&&!o.j&&(Cn(o),o.i=null,o.g.forEach(function(f,g){const S=g.toLowerCase();g!=S&&(Ff(this,g),qf(this,S,f))},o)),o.j=u}function wT(o,u){const f=new li;if(a.Image){const g=new Image;g.onload=d(Zt,f,"TestLoadImage: loaded",!0,u,g),g.onerror=d(Zt,f,"TestLoadImage: error",!1,u,g),g.onabort=d(Zt,f,"TestLoadImage: abort",!1,u,g),g.ontimeout=d(Zt,f,"TestLoadImage: timeout",!1,u,g),a.setTimeout(function(){g.ontimeout&&g.ontimeout()},1e4),g.src=o}else u(!1)}function TT(o,u){const f=new li,g=new AbortController,S=setTimeout(()=>{g.abort(),Zt(f,"TestPingServer: timeout",!1,u)},1e4);fetch(o,{signal:g.signal}).then(C=>{clearTimeout(S),C.ok?Zt(f,"TestPingServer: ok",!0,u):Zt(f,"TestPingServer: server error",!1,u)}).catch(()=>{clearTimeout(S),Zt(f,"TestPingServer: error",!1,u)})}function Zt(o,u,f,g,S){try{S&&(S.onload=null,S.onerror=null,S.onabort=null,S.ontimeout=null),g(f)}catch{}}function IT(){this.g=new oT}function yc(o){this.i=o.Sb||null,this.h=o.ab||!1}p(yc,vf),yc.prototype.g=function(){return new Js(this.i,this.h)};function Js(o,u){ke.call(this),this.H=o,this.o=u,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}p(Js,ke),n=Js.prototype,n.open=function(o,u){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=o,this.D=u,this.readyState=1,vi(this)},n.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const u={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};o&&(u.body=o),(this.H||a).fetch(new Request(this.D,u)).then(this.Pa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,yi(this)),this.readyState=0},n.Pa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,vi(this)),this.g&&(this.readyState=3,vi(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof a.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Hf(this)}else o.text().then(this.Oa.bind(this),this.ga.bind(this))};function Hf(o){o.j.read().then(o.Ma.bind(o)).catch(o.ga.bind(o))}n.Ma=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var u=o.value?o.value:new Uint8Array(0);(u=this.B.decode(u,{stream:!o.done}))&&(this.response=this.responseText+=u)}o.done?yi(this):vi(this),this.readyState==3&&Hf(this)}},n.Oa=function(o){this.g&&(this.response=this.responseText=o,yi(this))},n.Na=function(o){this.g&&(this.response=o,yi(this))},n.ga=function(){this.g&&yi(this)};function yi(o){o.readyState=4,o.l=null,o.j=null,o.B=null,vi(o)}n.setRequestHeader=function(o,u){this.A.append(o,u)},n.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const o=[],u=this.h.entries();for(var f=u.next();!f.done;)f=f.value,o.push(f[0]+": "+f[1]),f=u.next();return o.join(`\r
`)};function vi(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(Js.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function zf(o){let u="";return Pe(o,function(f,g){u+=g,u+=":",u+=f,u+=`\r
`}),u}function vc(o,u,f){e:{for(g in f){var g=!1;break e}g=!0}g||(f=zf(f),typeof o=="string"?f!=null&&ui(f):oe(o,u,f))}function ce(o){ke.call(this),this.headers=new Map,this.L=o||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}p(ce,ke);var xT=/^https?$/i,AT=["POST","PUT"];n=ce.prototype,n.Fa=function(o){this.H=o},n.ea=function(o,u,f,g){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);u=u?u.toUpperCase():"GET",this.D=o,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():xf.g(),this.g.onreadystatechange=y(h(this.Ca,this));try{this.B=!0,this.g.open(u,String(o),!0),this.B=!1}catch(C){jf(this,C);return}if(o=f||"",f=new Map(this.headers),g)if(Object.getPrototypeOf(g)===Object.prototype)for(var S in g)f.set(S,g[S]);else if(typeof g.keys=="function"&&typeof g.get=="function")for(const C of g.keys())f.set(C,g.get(C));else throw Error("Unknown input type for opt_headers: "+String(g));g=Array.from(f.keys()).find(C=>C.toLowerCase()=="content-type"),S=a.FormData&&o instanceof a.FormData,!(Array.prototype.indexOf.call(AT,u,void 0)>=0)||g||S||f.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[C,M]of f)this.g.setRequestHeader(C,M);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(o),this.v=!1}catch(C){jf(this,C)}};function jf(o,u){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=u,o.o=5,Kf(o),Zs(o)}function Kf(o){o.A||(o.A=!0,Ne(o,"complete"),Ne(o,"error"))}n.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=o||7,Ne(this,"complete"),Ne(this,"abort"),Zs(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Zs(this,!0)),ce.Z.N.call(this)},n.Ca=function(){this.u||(this.B||this.v||this.j?Gf(this):this.Xa())},n.Xa=function(){Gf(this)};function Gf(o){if(o.h&&typeof s<"u"){if(o.v&&en(o)==4)setTimeout(o.Ca.bind(o),0);else if(Ne(o,"readystatechange"),en(o)==4){o.h=!1;try{const C=o.ca();e:switch(C){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var u=!0;break e;default:u=!1}var f;if(!(f=u)){var g;if(g=C===0){let M=String(o.D).match(Of)[1]||null;!M&&a.self&&a.self.location&&(M=a.self.location.protocol.slice(0,-1)),g=!xT.test(M?M.toLowerCase():"")}f=g}if(f)Ne(o,"complete"),Ne(o,"success");else{o.o=6;try{var S=en(o)>2?o.g.statusText:""}catch{S=""}o.l=S+" ["+o.ca()+"]",Kf(o)}}finally{Zs(o)}}}}function Zs(o,u){if(o.g){o.m&&(clearTimeout(o.m),o.m=null);const f=o.g;o.g=null,u||Ne(o,"ready");try{f.onreadystatechange=null}catch{}}}n.isActive=function(){return!!this.g};function en(o){return o.g?o.g.readyState:0}n.ca=function(){try{return en(this)>2?this.g.status:-1}catch{return-1}},n.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.La=function(o){if(this.g){var u=this.g.responseText;return o&&u.indexOf(o)==0&&(u=u.substring(o.length)),sT(u)}};function Wf(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.F){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function ST(o){const u={};o=(o.g&&en(o)>=2&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let g=0;g<o.length;g++){if(v(o[g]))continue;var f=hT(o[g]);const S=f[0];if(f=f[1],typeof f!="string")continue;f=f.trim();const C=u[S]||[];u[S]=C,C.push(f)}Zw(u,function(g){return g.join(", ")})}n.ya=function(){return this.o},n.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function _i(o,u,f){return f&&f.internalChannelParams&&f.internalChannelParams[o]||u}function Qf(o){this.za=0,this.i=[],this.j=new li,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=_i("failFast",!1,o),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=_i("baseRetryDelayMs",5e3,o),this.Za=_i("retryDelaySeedMs",1e4,o),this.Ta=_i("forwardChannelMaxRetries",2,o),this.va=_i("forwardChannelRequestTimeoutMs",2e4,o),this.ma=o&&o.xmlHttpFactory||void 0,this.Ua=o&&o.Rb||void 0,this.Aa=o&&o.useFetchStreams||!1,this.O=void 0,this.L=o&&o.supportsCrossDomainXhr||!1,this.M="",this.h=new Pf(o&&o.concurrentRequestLimit),this.Ba=new IT,this.S=o&&o.fastHandshake||!1,this.R=o&&o.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=o&&o.Pb||!1,o&&o.ua&&this.j.ua(),o&&o.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&o&&o.detectBufferingProxy||!1,this.ia=void 0,o&&o.longPollingTimeout&&o.longPollingTimeout>0&&(this.ia=o.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}n=Qf.prototype,n.ka=8,n.I=1,n.connect=function(o,u,f,g){De(0),this.W=o,this.H=u||{},f&&g!==void 0&&(this.H.OSID=f,this.H.OAID=g),this.F=this.X,this.J=ip(this,null,this.W),to(this)};function _c(o){if(Yf(o),o.I==3){var u=o.V++,f=ut(o.J);if(oe(f,"SID",o.M),oe(f,"RID",u),oe(f,"TYPE","terminate"),bi(o,f),u=new Xt(o,o.j,u),u.M=2,u.A=Xs(ut(f)),f=!1,a.navigator&&a.navigator.sendBeacon)try{f=a.navigator.sendBeacon(u.A.toString(),"")}catch{}!f&&a.Image&&(new Image().src=u.A,f=!0),f||(u.g=sp(u.j,null),u.g.ea(u.A)),u.F=Date.now(),Ys(u)}rp(o)}function eo(o){o.g&&(Ec(o),o.g.cancel(),o.g=null)}function Yf(o){eo(o),o.v&&(a.clearTimeout(o.v),o.v=null),no(o),o.h.cancel(),o.m&&(typeof o.m=="number"&&a.clearTimeout(o.m),o.m=null)}function to(o){if(!Nf(o.h)&&!o.m){o.m=!0;var u=o.Ea;H||m(),j||(H(),j=!0),_.add(u,o),o.D=0}}function CT(o,u){return Df(o.h)>=o.h.j-(o.m?1:0)?!1:o.m?(o.i=u.G.concat(o.i),!0):o.I==1||o.I==2||o.D>=(o.Sa?0:o.Ta)?!1:(o.m=ci(h(o.Ea,o,u),np(o,o.D)),o.D++,!0)}n.Ea=function(o){if(this.m)if(this.m=null,this.I==1){if(!o){this.V=Math.floor(Math.random()*1e5),o=this.V++;const S=new Xt(this,this.j,o);let C=this.o;if(this.U&&(C?(C=cf(C),uf(C,this.U)):C=this.U),this.u!==null||this.R||(S.J=C,C=null),this.S)e:{for(var u=0,f=0;f<this.i.length;f++){t:{var g=this.i[f];if("__data__"in g.map&&(g=g.map.__data__,typeof g=="string")){g=g.length;break t}g=void 0}if(g===void 0)break;if(u+=g,u>4096){u=f;break e}if(u===4096||f===this.i.length-1){u=f+1;break e}}u=1e3}else u=1e3;u=Jf(this,S,u),f=ut(this.J),oe(f,"RID",o),oe(f,"CVER",22),this.G&&oe(f,"X-HTTP-Session-Id",this.G),bi(this,f),C&&(this.R?u="headers="+ui(zf(C))+"&"+u:this.u&&vc(f,this.u,C)),gc(this.h,S),this.Ra&&oe(f,"TYPE","init"),this.S?(oe(f,"$req",u),oe(f,"SID","null"),S.U=!0,hc(S,f,null)):hc(S,f,u),this.I=2}}else this.I==3&&(o?Xf(this,o):this.i.length==0||Nf(this.h)||Xf(this))};function Xf(o,u){var f;u?f=u.l:f=o.V++;const g=ut(o.J);oe(g,"SID",o.M),oe(g,"RID",f),oe(g,"AID",o.K),bi(o,g),o.u&&o.o&&vc(g,o.u,o.o),f=new Xt(o,o.j,f,o.D+1),o.u===null&&(f.J=o.o),u&&(o.i=u.G.concat(o.i)),u=Jf(o,f,1e3),f.H=Math.round(o.va*.5)+Math.round(o.va*.5*Math.random()),gc(o.h,f),hc(f,g,u)}function bi(o,u){o.H&&Pe(o.H,function(f,g){oe(u,g,f)}),o.l&&Pe({},function(f,g){oe(u,g,f)})}function Jf(o,u,f){f=Math.min(o.i.length,f);const g=o.l?h(o.l.Ka,o.l,o):null;e:{var S=o.i;let Y=-1;for(;;){const ve=["count="+f];Y==-1?f>0?(Y=S[0].g,ve.push("ofs="+Y)):Y=0:ve.push("ofs="+Y);let re=!0;for(let be=0;be<f;be++){var C=S[be].g;const ht=S[be].map;if(C-=Y,C<0)Y=Math.max(0,S[be].g-100),re=!1;else try{C="req"+C+"_"||"";try{var M=ht instanceof Map?ht:Object.entries(ht);for(const[Rn,tn]of M){let nn=tn;c(tn)&&(nn=oc(tn)),ve.push(C+Rn+"="+encodeURIComponent(nn))}}catch(Rn){throw ve.push(C+"type="+encodeURIComponent("_badmap")),Rn}}catch{g&&g(ht)}}if(re){M=ve.join("&");break e}}M=void 0}return o=o.i.splice(0,f),u.G=o,M}function Zf(o){if(!o.g&&!o.v){o.Y=1;var u=o.Da;H||m(),j||(H(),j=!0),_.add(u,o),o.A=0}}function bc(o){return o.g||o.v||o.A>=3?!1:(o.Y++,o.v=ci(h(o.Da,o),np(o,o.A)),o.A++,!0)}n.Da=function(){if(this.v=null,ep(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var o=4*this.T;this.j.info("BP detection timer enabled: "+o),this.B=ci(h(this.Wa,this),o)}},n.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,De(10),eo(this),ep(this))};function Ec(o){o.B!=null&&(a.clearTimeout(o.B),o.B=null)}function ep(o){o.g=new Xt(o,o.j,"rpc",o.Y),o.u===null&&(o.g.J=o.o),o.g.P=0;var u=ut(o.na);oe(u,"RID","rpc"),oe(u,"SID",o.M),oe(u,"AID",o.K),oe(u,"CI",o.F?"0":"1"),!o.F&&o.ia&&oe(u,"TO",o.ia),oe(u,"TYPE","xmlhttp"),bi(o,u),o.u&&o.o&&vc(u,o.u,o.o),o.O&&(o.g.H=o.O);var f=o.g;o=o.ba,f.M=1,f.A=Xs(ut(u)),f.u=null,f.R=!0,Cf(f,o)}n.Va=function(){this.C!=null&&(this.C=null,eo(this),bc(this),De(19))};function no(o){o.C!=null&&(a.clearTimeout(o.C),o.C=null)}function tp(o,u){var f=null;if(o.g==u){no(o),Ec(o),o.g=null;var g=2}else if(pc(o.h,u))f=u.G,Lf(o.h,u),g=1;else return;if(o.I!=0){if(u.o)if(g==1){f=u.u?u.u.length:0,u=Date.now()-u.F;var S=o.D;g=Ws(),Ne(g,new Tf(g,f)),to(o)}else Zf(o);else if(S=u.m,S==3||S==0&&u.X>0||!(g==1&&CT(o,u)||g==2&&bc(o)))switch(f&&f.length>0&&(u=o.h,u.i=u.i.concat(f)),S){case 1:kn(o,5);break;case 4:kn(o,10);break;case 3:kn(o,6);break;default:kn(o,2)}}}function np(o,u){let f=o.Qa+Math.floor(Math.random()*o.Za);return o.isActive()||(f*=2),f*u}function kn(o,u){if(o.j.info("Error code "+u),u==2){var f=h(o.bb,o),g=o.Ua;const S=!g;g=new Jt(g||"//www.google.com/images/cleardot.gif"),a.location&&a.location.protocol=="http"||di(g,"https"),Xs(g),S?wT(g.toString(),f):TT(g.toString(),f)}else De(2);o.I=0,o.l&&o.l.pa(u),rp(o),Yf(o)}n.bb=function(o){o?(this.j.info("Successfully pinged google.com"),De(2)):(this.j.info("Failed to ping google.com"),De(1))};function rp(o){if(o.I=0,o.ja=[],o.l){const u=Vf(o.h);(u.length!=0||o.i.length!=0)&&(T(o.ja,u),T(o.ja,o.i),o.h.i.length=0,I(o.i),o.i.length=0),o.l.oa()}}function ip(o,u,f){var g=f instanceof Jt?ut(f):new Jt(f);if(g.g!="")u&&(g.g=u+"."+g.g),fi(g,g.u);else{var S=a.location;g=S.protocol,u=u?u+"."+S.hostname:S.hostname,S=+S.port;const C=new Jt(null);g&&di(C,g),u&&(C.g=u),S&&fi(C,S),f&&(C.h=f),g=C}return f=o.G,u=o.wa,f&&u&&oe(g,f,u),oe(g,"VER",o.ka),bi(o,g),g}function sp(o,u,f){if(u&&!o.L)throw Error("Can't create secondary domain capable XhrIo object.");return u=o.Aa&&!o.ma?new ce(new yc({ab:f})):new ce(o.ma),u.Fa(o.L),u}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function op(){}n=op.prototype,n.ra=function(){},n.qa=function(){},n.pa=function(){},n.oa=function(){},n.isActive=function(){return!0},n.Ka=function(){};function ro(){}ro.prototype.g=function(o,u){return new qe(o,u)};function qe(o,u){ke.call(this),this.g=new Qf(u),this.l=o,this.h=u&&u.messageUrlParams||null,o=u&&u.messageHeaders||null,u&&u.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=u&&u.initMessageHeaders||null,u&&u.messageContentType&&(o?o["X-WebChannel-Content-Type"]=u.messageContentType:o={"X-WebChannel-Content-Type":u.messageContentType}),u&&u.sa&&(o?o["X-WebChannel-Client-Profile"]=u.sa:o={"X-WebChannel-Client-Profile":u.sa}),this.g.U=o,(o=u&&u.Qb)&&!v(o)&&(this.g.u=o),this.A=u&&u.supportsCrossDomainXhr||!1,this.v=u&&u.sendRawJson||!1,(u=u&&u.httpSessionIdParam)&&!v(u)&&(this.g.G=u,o=this.h,o!==null&&u in o&&(o=this.h,u in o&&delete o[u])),this.j=new hr(this)}p(qe,ke),qe.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},qe.prototype.close=function(){_c(this.g)},qe.prototype.o=function(o){var u=this.g;if(typeof o=="string"){var f={};f.__data__=o,o=f}else this.v&&(f={},f.__data__=oc(o),o=f);u.i.push(new pT(u.Ya++,o)),u.I==3&&to(u)},qe.prototype.N=function(){this.g.l=null,delete this.j,_c(this.g),delete this.g,qe.Z.N.call(this)};function ap(o){ac.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var u=o.__sm__;if(u){e:{for(const f in u){o=f;break e}o=void 0}(this.i=o)&&(o=this.i,u=u!==null&&o in u?u[o]:void 0),this.data=u}else this.data=o}p(ap,ac);function cp(){cc.call(this),this.status=1}p(cp,cc);function hr(o){this.g=o}p(hr,op),hr.prototype.ra=function(){Ne(this.g,"a")},hr.prototype.qa=function(o){Ne(this.g,new ap(o))},hr.prototype.pa=function(o){Ne(this.g,new cp)},hr.prototype.oa=function(){Ne(this.g,"b")},ro.prototype.createWebChannel=ro.prototype.g,qe.prototype.send=qe.prototype.o,qe.prototype.open=qe.prototype.m,qe.prototype.close=qe.prototype.close,Zl=function(){return new ro},Jl=function(){return Ws()},Xl=An,Vo={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},Qs.NO_ERROR=0,Qs.TIMEOUT=8,Qs.HTTP_ERROR=6,Qi=Qs,If.COMPLETE="complete",Yl=If,_f.EventType=oi,oi.OPEN="a",oi.CLOSE="b",oi.ERROR="c",oi.MESSAGE="d",ke.prototype.listen=ke.prototype.J,Pr=_f,ce.prototype.listenOnce=ce.prototype.K,ce.prototype.getLastError=ce.prototype.Ha,ce.prototype.getLastErrorCode=ce.prototype.ya,ce.prototype.getStatus=ce.prototype.ca,ce.prototype.getResponseJson=ce.prototype.La,ce.prototype.getResponseText=ce.prototype.la,ce.prototype.send=ce.prototype.ea,ce.prototype.setWithCredentials=ce.prototype.Fa,Ql=ce}).apply(typeof Wi<"u"?Wi:typeof self<"u"?self:typeof window<"u"?window:{});/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xe{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}xe.UNAUTHENTICATED=new xe(null),xe.GOOGLE_CREDENTIALS=new xe("google-credentials-uid"),xe.FIRST_PARTY=new xe("first-party-uid"),xe.MOCK_USER=new xe("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Bn="12.12.0";function fv(n){Bn=n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pn=new co("@firebase/firestore");function qn(){return pn.logLevel}function q(n,...e){if(pn.logLevel<=X.DEBUG){const t=e.map(Oo);pn.debug(`Firestore (${Bn}): ${n}`,...t)}}function _t(n,...e){if(pn.logLevel<=X.ERROR){const t=e.map(Oo);pn.error(`Firestore (${Bn}): ${n}`,...t)}}function gn(n,...e){if(pn.logLevel<=X.WARN){const t=e.map(Oo);pn.warn(`Firestore (${Bn}): ${n}`,...t)}}function Oo(n){if(typeof n=="string")return n;try{return function(t){return JSON.stringify(t)}(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function G(n,e,t){let r="Unexpected state";typeof e=="string"?r=e:t=e,eu(n,r,t)}function eu(n,e,t){let r=`FIRESTORE (${Bn}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{r+=" CONTEXT: "+JSON.stringify(t)}catch{r+=" CONTEXT: "+t}throw _t(r),new Error(r)}function te(n,e,t,r){let i="Unexpected state";typeof t=="string"?i=t:r=t,n||eu(e,i,r)}function Q(n,e){return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const N={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class B extends ft{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bt{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tu{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class pv{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(xe.UNAUTHENTICATED))}shutdown(){}}class gv{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class mv{constructor(e){this.t=e,this.currentUser=xe.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){te(this.o===void 0,42304);let r=this.i;const i=l=>this.i!==r?(r=this.i,t(l)):Promise.resolve();let s=new bt;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new bt,e.enqueueRetryable(()=>i(this.currentUser))};const a=()=>{const l=s;e.enqueueRetryable(async()=>{await l.promise,await i(this.currentUser)})},c=l=>{q("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=l,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit(l=>c(l)),setTimeout(()=>{if(!this.auth){const l=this.t.getImmediate({optional:!0});l?c(l):(q("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new bt)}},0),a()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(r=>this.i!==e?(q("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(te(typeof r.accessToken=="string",31837,{l:r}),new tu(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return te(e===null||typeof e=="string",2055,{h:e}),new xe(e)}}class yv{constructor(e,t,r){this.P=e,this.T=t,this.I=r,this.type="FirstParty",this.user=xe.FIRST_PARTY,this.R=new Map}A(){return this.I?this.I():null}get headers(){this.R.set("X-Goog-AuthUser",this.P);const e=this.A();return e&&this.R.set("Authorization",e),this.T&&this.R.set("X-Goog-Iam-Authorization-Token",this.T),this.R}}class vv{constructor(e,t,r){this.P=e,this.T=t,this.I=r}getToken(){return Promise.resolve(new yv(this.P,this.T,this.I))}start(e,t){e.enqueueRetryable(()=>t(xe.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class nu{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class _v{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,$e(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){te(this.o===void 0,3512);const r=s=>{s.error!=null&&q("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${s.error.message}`);const a=s.token!==this.m;return this.m=s.token,q("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?t(s.token):Promise.resolve()};this.o=s=>{e.enqueueRetryable(()=>r(s))};const i=s=>{q("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=s,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(s=>i(s)),setTimeout(()=>{if(!this.appCheck){const s=this.V.getImmediate({optional:!0});s?i(s):q("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new nu(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(te(typeof t.token=="string",44558,{tokenResult:t}),this.m=t.token,new nu(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bv(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mo{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const i=bv(40);for(let s=0;s<i.length;++s)r.length<20&&i[s]<t&&(r+=e.charAt(i[s]%62))}return r}}function J(n,e){return n<e?-1:n>e?1:0}function Fo(n,e){const t=Math.min(n.length,e.length);for(let r=0;r<t;r++){const i=n.charAt(r),s=e.charAt(r);if(i!==s)return Uo(i)===Uo(s)?J(i,s):Uo(i)?1:-1}return J(n.length,e.length)}const Ev=55296,wv=57343;function Uo(n){const e=n.charCodeAt(0);return e>=Ev&&e<=wv}function $n(n,e,t){return n.length===e.length&&n.every((r,i)=>t(r,e[i]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ru="__name__";class tt{constructor(e,t,r){t===void 0?t=0:t>e.length&&G(637,{offset:t,range:e.length}),r===void 0?r=e.length-t:r>e.length-t&&G(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return tt.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof tt?e.forEach(r=>{t.push(r)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let i=0;i<r;i++){const s=tt.compareSegments(e.get(i),t.get(i));if(s!==0)return s}return J(e.length,t.length)}static compareSegments(e,t){const r=tt.isNumericId(e),i=tt.isNumericId(t);return r&&!i?-1:!r&&i?1:r&&i?tt.extractNumericId(e).compare(tt.extractNumericId(t)):Fo(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return Ut.fromString(e.substring(4,e.length-2))}}class ie extends tt{construct(e,t,r){return new ie(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new B(N.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(i=>i.length>0))}return new ie(t)}static emptyPath(){return new ie([])}}const Tv=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Ee extends tt{construct(e,t,r){return new Ee(e,t,r)}static isValidIdentifier(e){return Tv.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Ee.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===ru}static keyField(){return new Ee([ru])}static fromServerFormat(e){const t=[];let r="",i=0;const s=()=>{if(r.length===0)throw new B(N.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let a=!1;for(;i<e.length;){const c=e[i];if(c==="\\"){if(i+1===e.length)throw new B(N.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const l=e[i+1];if(l!=="\\"&&l!=="."&&l!=="`")throw new B(N.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=l,i+=2}else c==="`"?(a=!a,i++):c!=="."||a?(r+=c,i++):(s(),i++)}if(s(),a)throw new B(N.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Ee(t)}static emptyPath(){return new Ee([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class z{constructor(e){this.path=e}static fromPath(e){return new z(ie.fromString(e))}static fromName(e){return new z(ie.fromString(e).popFirst(5))}static empty(){return new z(ie.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&ie.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return ie.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new z(new ie(e.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function iu(n,e,t){if(!t)throw new B(N.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function Iv(n,e,t,r){if(e===!0&&r===!0)throw new B(N.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function su(n){if(!z.isDocumentKey(n))throw new B(N.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function ou(n){if(z.isDocumentKey(n))throw new B(N.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function au(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function Yi(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":G(12329,{type:typeof n})}function mn(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new B(N.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=Yi(n);throw new B(N.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function he(n,e){const t={typeString:n};return e&&(t.value=e),t}function Nr(n,e){if(!au(n))throw new B(N.INVALID_ARGUMENT,"JSON must be an object");let t;for(const r in e)if(e[r]){const i=e[r].typeString,s="value"in e[r]?{value:e[r].value}:void 0;if(!(r in n)){t=`JSON missing required field: '${r}'`;break}const a=n[r];if(i&&typeof a!==i){t=`JSON field '${r}' must be a ${i}.`;break}if(s!==void 0&&a!==s.value){t=`Expected '${r}' field to equal '${s.value}'`;break}}if(t)throw new B(N.INVALID_ARGUMENT,t);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cu=-62135596800,lu=1e6;class se{static now(){return se.fromMillis(Date.now())}static fromDate(e){return se.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor((e-1e3*t)*lu);return new se(t,r)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new B(N.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new B(N.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<cu)throw new B(N.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new B(N.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/lu}_compareTo(e){return this.seconds===e.seconds?J(this.nanoseconds,e.nanoseconds):J(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:se._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(Nr(e,se._jsonSchema))return new se(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-cu;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}se._jsonSchemaVersion="firestore/timestamp/1.0",se._jsonSchema={type:he("string",se._jsonSchemaVersion),seconds:he("number"),nanoseconds:he("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class W{static fromTimestamp(e){return new W(e)}static min(){return new W(new se(0,0))}static max(){return new W(new se(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dr=-1;function xv(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,i=W.fromTimestamp(r===1e9?new se(t+1,0):new se(t,r));return new Bt(i,z.empty(),e)}function Av(n){return new Bt(n.readTime,n.key,Dr)}class Bt{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new Bt(W.min(),z.empty(),Dr)}static max(){return new Bt(W.max(),z.empty(),Dr)}}function Sv(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=z.comparator(n.documentKey,e.documentKey),t!==0?t:J(n.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cv="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class kv{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Hn(n){if(n.code!==N.FAILED_PRECONDITION||n.message!==Cv)throw n;q("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class L{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&G(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new L((r,i)=>{this.nextCallback=s=>{this.wrapSuccess(e,s).next(r,i)},this.catchCallback=s=>{this.wrapFailure(t,s).next(r,i)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof L?t:L.resolve(t)}catch(t){return L.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):L.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):L.reject(t)}static resolve(e){return new L((t,r)=>{t(e)})}static reject(e){return new L((t,r)=>{r(e)})}static waitFor(e){return new L((t,r)=>{let i=0,s=0,a=!1;e.forEach(c=>{++i,c.next(()=>{++s,a&&s===i&&t()},l=>r(l))}),a=!0,s===i&&t()})}static or(e){let t=L.resolve(!1);for(const r of e)t=t.next(i=>i?L.resolve(i):r());return t}static forEach(e,t){const r=[];return e.forEach((i,s)=>{r.push(t.call(this,i,s))}),this.waitFor(r)}static mapArray(e,t){return new L((r,i)=>{const s=e.length,a=new Array(s);let c=0;for(let l=0;l<s;l++){const h=l;t(e[h]).next(d=>{a[h]=d,++c,c===s&&r(a)},d=>i(d))}})}static doWhile(e,t){return new L((r,i)=>{const s=()=>{e()===!0?t().next(()=>{s()},i):r()};s()})}}function Rv(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function zn(n){return n.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xi{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.ae(r),this.ue=r=>t.writeSequenceNumber(r))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ue&&this.ue(e),e}}Xi.ce=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bo=-1;function Ji(n){return n==null}function Zi(n){return n===0&&1/n==-1/0}function Pv(n){return typeof n=="number"&&Number.isInteger(n)&&!Zi(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uu="";function Nv(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=hu(e)),e=Dv(n.get(t),e);return hu(e)}function Dv(n,e){let t=e;const r=n.length;for(let i=0;i<r;i++){const s=n.charAt(i);switch(s){case"\0":t+="";break;case uu:t+="";break;default:t+=s}}return t}function hu(n){return n+uu+""}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function du(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function yn(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function fu(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ae{constructor(e,t){this.comparator=e,this.root=t||we.EMPTY}insert(e,t){return new ae(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,we.BLACK,null,null))}remove(e){return new ae(this.comparator,this.root.remove(e,this.comparator).copy(null,null,we.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const i=this.comparator(e,r.key);if(i===0)return t+r.left.size;i<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){const e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new es(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new es(this.root,e,this.comparator,!1)}getReverseIterator(){return new es(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new es(this.root,e,this.comparator,!0)}}class es{constructor(e,t,r,i){this.isReverse=i,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=t?r(e.key,t):1,t&&i&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class we{constructor(e,t,r,i,s){this.key=e,this.value=t,this.color=r??we.RED,this.left=i??we.EMPTY,this.right=s??we.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,i,s){return new we(e??this.key,t??this.value,r??this.color,i??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let i=this;const s=r(e,i.key);return i=s<0?i.copy(null,null,null,i.left.insert(e,t,r),null):s===0?i.copy(null,t,null,null,null):i.copy(null,null,null,null,i.right.insert(e,t,r)),i.fixUp()}removeMin(){if(this.left.isEmpty())return we.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,i=this;if(t(e,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(e,t),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),t(e,i.key)===0){if(i.right.isEmpty())return we.EMPTY;r=i.right.min(),i=i.copy(r.key,r.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(e,t))}return i.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,we.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,we.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw G(43730,{key:this.key,value:this.value});if(this.right.isRed())throw G(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw G(27949);return e+(this.isRed()?0:1)}}we.EMPTY=null,we.RED=!0,we.BLACK=!1,we.EMPTY=new class{constructor(){this.size=0}get key(){throw G(57766)}get value(){throw G(16141)}get color(){throw G(16727)}get left(){throw G(29726)}get right(){throw G(36894)}copy(e,t,r,i,s){return this}insert(e,t,r){return new we(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class me{constructor(e){this.comparator=e,this.data=new ae(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const i=r.getNext();if(this.comparator(i.key,e[1])>=0)return;t(i.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new pu(this.data.getIterator())}getIteratorFrom(e){return new pu(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(r=>{t=t.add(r)}),t}isEqual(e){if(!(e instanceof me)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const i=t.getNext().key,s=r.getNext().key;if(this.comparator(i,s)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new me(this.comparator);return t.data=e,t}}class pu{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ye{constructor(e){this.fields=e,e.sort(Ee.comparator)}static empty(){return new Ye([])}unionWith(e){let t=new me(Ee.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new Ye(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return $n(this.fields,e.fields,(t,r)=>t.isEqual(r))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gu extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Te{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(i){try{return atob(i)}catch(s){throw typeof DOMException<"u"&&s instanceof DOMException?new gu("Invalid base64 string: "+s):s}}(e);return new Te(t)}static fromUint8Array(e){const t=function(i){let s="";for(let a=0;a<i.length;++a)s+=String.fromCharCode(i[a]);return s}(e);return new Te(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const r=new Uint8Array(t.length);for(let i=0;i<t.length;i++)r[i]=t.charCodeAt(i);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return J(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Te.EMPTY_BYTE_STRING=new Te("");const Lv=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function qt(n){if(te(!!n,39018),typeof n=="string"){let e=0;const t=Lv.exec(n);if(te(!!t,46558,{timestamp:n}),t[1]){let i=t[1];i=(i+"000000000").substr(0,9),e=Number(i)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:le(n.seconds),nanos:le(n.nanos)}}function le(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function $t(n){return typeof n=="string"?Te.fromBase64String(n):Te.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mu="server_timestamp",yu="__type__",vu="__previous_value__",_u="__local_write_time__";function qo(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[yu])==null?void 0:r.stringValue)===mu}function ts(n){const e=n.mapValue.fields[vu];return qo(e)?ts(e):e}function Lr(n){const e=qt(n.mapValue.fields[_u].timestampValue);return new se(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vv{constructor(e,t,r,i,s,a,c,l,h,d,p){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=i,this.ssl=s,this.forceLongPolling=a,this.autoDetectLongPolling=c,this.longPollingOptions=l,this.useFetchStreams=h,this.isUsingEmulator=d,this.apiKey=p}}const ns="(default)";class Vr{constructor(e,t){this.projectId=e,this.database=t||ns}static empty(){return new Vr("","")}get isDefaultDatabase(){return this.database===ns}isEqual(e){return e instanceof Vr&&e.projectId===this.projectId&&e.database===this.database}}function Ov(n,e){if(!Object.prototype.hasOwnProperty.apply(n.options,["projectId"]))throw new B(N.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Vr(n.options.projectId,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bu="__type__",Mv="__max__",rs={mapValue:{}},Eu="__vector__",is="value";function Ht(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?qo(n)?4:Uv(n)?9007199254740991:Fv(n)?10:11:G(28295,{value:n})}function nt(n,e){if(n===e)return!0;const t=Ht(n);if(t!==Ht(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return Lr(n).isEqual(Lr(e));case 3:return function(i,s){if(typeof i.timestampValue=="string"&&typeof s.timestampValue=="string"&&i.timestampValue.length===s.timestampValue.length)return i.timestampValue===s.timestampValue;const a=qt(i.timestampValue),c=qt(s.timestampValue);return a.seconds===c.seconds&&a.nanos===c.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(i,s){return $t(i.bytesValue).isEqual($t(s.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(i,s){return le(i.geoPointValue.latitude)===le(s.geoPointValue.latitude)&&le(i.geoPointValue.longitude)===le(s.geoPointValue.longitude)}(n,e);case 2:return function(i,s){if("integerValue"in i&&"integerValue"in s)return le(i.integerValue)===le(s.integerValue);if("doubleValue"in i&&"doubleValue"in s){const a=le(i.doubleValue),c=le(s.doubleValue);return a===c?Zi(a)===Zi(c):isNaN(a)&&isNaN(c)}return!1}(n,e);case 9:return $n(n.arrayValue.values||[],e.arrayValue.values||[],nt);case 10:case 11:return function(i,s){const a=i.mapValue.fields||{},c=s.mapValue.fields||{};if(du(a)!==du(c))return!1;for(const l in a)if(a.hasOwnProperty(l)&&(c[l]===void 0||!nt(a[l],c[l])))return!1;return!0}(n,e);default:return G(52216,{left:n})}}function Or(n,e){return(n.values||[]).find(t=>nt(t,e))!==void 0}function jn(n,e){if(n===e)return 0;const t=Ht(n),r=Ht(e);if(t!==r)return J(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return J(n.booleanValue,e.booleanValue);case 2:return function(s,a){const c=le(s.integerValue||s.doubleValue),l=le(a.integerValue||a.doubleValue);return c<l?-1:c>l?1:c===l?0:isNaN(c)?isNaN(l)?0:-1:1}(n,e);case 3:return wu(n.timestampValue,e.timestampValue);case 4:return wu(Lr(n),Lr(e));case 5:return Fo(n.stringValue,e.stringValue);case 6:return function(s,a){const c=$t(s),l=$t(a);return c.compareTo(l)}(n.bytesValue,e.bytesValue);case 7:return function(s,a){const c=s.split("/"),l=a.split("/");for(let h=0;h<c.length&&h<l.length;h++){const d=J(c[h],l[h]);if(d!==0)return d}return J(c.length,l.length)}(n.referenceValue,e.referenceValue);case 8:return function(s,a){const c=J(le(s.latitude),le(a.latitude));return c!==0?c:J(le(s.longitude),le(a.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return Tu(n.arrayValue,e.arrayValue);case 10:return function(s,a){var y,I,T,R;const c=s.fields||{},l=a.fields||{},h=(y=c[is])==null?void 0:y.arrayValue,d=(I=l[is])==null?void 0:I.arrayValue,p=J(((T=h==null?void 0:h.values)==null?void 0:T.length)||0,((R=d==null?void 0:d.values)==null?void 0:R.length)||0);return p!==0?p:Tu(h,d)}(n.mapValue,e.mapValue);case 11:return function(s,a){if(s===rs.mapValue&&a===rs.mapValue)return 0;if(s===rs.mapValue)return 1;if(a===rs.mapValue)return-1;const c=s.fields||{},l=Object.keys(c),h=a.fields||{},d=Object.keys(h);l.sort(),d.sort();for(let p=0;p<l.length&&p<d.length;++p){const y=Fo(l[p],d[p]);if(y!==0)return y;const I=jn(c[l[p]],h[d[p]]);if(I!==0)return I}return J(l.length,d.length)}(n.mapValue,e.mapValue);default:throw G(23264,{he:t})}}function wu(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return J(n,e);const t=qt(n),r=qt(e),i=J(t.seconds,r.seconds);return i!==0?i:J(t.nanos,r.nanos)}function Tu(n,e){const t=n.values||[],r=e.values||[];for(let i=0;i<t.length&&i<r.length;++i){const s=jn(t[i],r[i]);if(s)return s}return J(t.length,r.length)}function Kn(n){return $o(n)}function $o(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(t){const r=qt(t);return`time(${r.seconds},${r.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(t){return $t(t).toBase64()}(n.bytesValue):"referenceValue"in n?function(t){return z.fromName(t).toString()}(n.referenceValue):"geoPointValue"in n?function(t){return`geo(${t.latitude},${t.longitude})`}(n.geoPointValue):"arrayValue"in n?function(t){let r="[",i=!0;for(const s of t.values||[])i?i=!1:r+=",",r+=$o(s);return r+"]"}(n.arrayValue):"mapValue"in n?function(t){const r=Object.keys(t.fields||{}).sort();let i="{",s=!0;for(const a of r)s?s=!1:i+=",",i+=`${a}:${$o(t.fields[a])}`;return i+"}"}(n.mapValue):G(61005,{value:n})}function ss(n){switch(Ht(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=ts(n);return e?16+ss(e):16;case 5:return 2*n.stringValue.length;case 6:return $t(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return function(r){return(r.values||[]).reduce((i,s)=>i+ss(s),0)}(n.arrayValue);case 10:case 11:return function(r){let i=0;return yn(r.fields,(s,a)=>{i+=s.length+ss(a)}),i}(n.mapValue);default:throw G(13486,{value:n})}}function Iu(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function Ho(n){return!!n&&"integerValue"in n}function zo(n){return!!n&&"arrayValue"in n}function xu(n){return!!n&&"nullValue"in n}function Au(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function os(n){return!!n&&"mapValue"in n}function Fv(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[bu])==null?void 0:r.stringValue)===Eu}function Mr(n){if(n.geoPointValue)return{geoPointValue:{...n.geoPointValue}};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:{...n.timestampValue}};if(n.mapValue){const e={mapValue:{fields:{}}};return yn(n.mapValue.fields,(t,r)=>e.mapValue.fields[t]=Mr(r)),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Mr(n.arrayValue.values[t]);return e}return{...n}}function Uv(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===Mv}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class He{constructor(e){this.value=e}static empty(){return new He({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!os(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Mr(t)}setAll(e){let t=Ee.emptyPath(),r={},i=[];e.forEach((a,c)=>{if(!t.isImmediateParentOf(c)){const l=this.getFieldsMap(t);this.applyChanges(l,r,i),r={},i=[],t=c.popLast()}a?r[c.lastSegment()]=Mr(a):i.push(c.lastSegment())});const s=this.getFieldsMap(t);this.applyChanges(s,r,i)}delete(e){const t=this.field(e.popLast());os(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return nt(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let i=t.mapValue.fields[e.get(r)];os(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=i),t=i}return t.mapValue.fields}applyChanges(e,t,r){yn(t,(i,s)=>e[i]=s);for(const i of r)delete e[i]}clone(){return new He(Mr(this.value))}}function Su(n){const e=[];return yn(n.fields,(t,r)=>{const i=new Ee([t]);if(os(r)){const s=Su(r.mapValue).fields;if(s.length===0)e.push(i);else for(const a of s)e.push(i.child(a))}else e.push(i)}),new Ye(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ae{constructor(e,t,r,i,s,a,c){this.key=e,this.documentType=t,this.version=r,this.readTime=i,this.createTime=s,this.data=a,this.documentState=c}static newInvalidDocument(e){return new Ae(e,0,W.min(),W.min(),W.min(),He.empty(),0)}static newFoundDocument(e,t,r,i){return new Ae(e,1,t,W.min(),r,i,0)}static newNoDocument(e,t){return new Ae(e,2,t,W.min(),W.min(),He.empty(),0)}static newUnknownDocument(e,t){return new Ae(e,3,t,W.min(),W.min(),He.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(W.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=He.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=He.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=W.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Ae&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Ae(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class as{constructor(e,t){this.position=e,this.inclusive=t}}function Cu(n,e,t){let r=0;for(let i=0;i<n.position.length;i++){const s=e[i],a=n.position[i];if(s.field.isKeyField()?r=z.comparator(z.fromName(a.referenceValue),t.key):r=jn(a,t.data.field(s.field)),s.dir==="desc"&&(r*=-1),r!==0)break}return r}function ku(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!nt(n.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cs{constructor(e,t="asc"){this.field=e,this.dir=t}}function Bv(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ru{}class de extends Ru{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new $v(e,t,r):t==="array-contains"?new jv(e,r):t==="in"?new Kv(e,r):t==="not-in"?new Gv(e,r):t==="array-contains-any"?new Wv(e,r):new de(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new Hv(e,r):new zv(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(jn(t,this.value)):t!==null&&Ht(this.value)===Ht(t)&&this.matchesComparison(jn(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return G(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Xe extends Ru{constructor(e,t){super(),this.filters=e,this.op=t,this.Pe=null}static create(e,t){return new Xe(e,t)}matches(e){return Pu(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.Pe!==null||(this.Pe=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}}function Pu(n){return n.op==="and"}function Nu(n){return qv(n)&&Pu(n)}function qv(n){for(const e of n.filters)if(e instanceof Xe)return!1;return!0}function jo(n){if(n instanceof de)return n.field.canonicalString()+n.op.toString()+Kn(n.value);if(Nu(n))return n.filters.map(e=>jo(e)).join(",");{const e=n.filters.map(t=>jo(t)).join(",");return`${n.op}(${e})`}}function Du(n,e){return n instanceof de?function(r,i){return i instanceof de&&r.op===i.op&&r.field.isEqual(i.field)&&nt(r.value,i.value)}(n,e):n instanceof Xe?function(r,i){return i instanceof Xe&&r.op===i.op&&r.filters.length===i.filters.length?r.filters.reduce((s,a,c)=>s&&Du(a,i.filters[c]),!0):!1}(n,e):void G(19439)}function Lu(n){return n instanceof de?function(t){return`${t.field.canonicalString()} ${t.op} ${Kn(t.value)}`}(n):n instanceof Xe?function(t){return t.op.toString()+" {"+t.getFilters().map(Lu).join(" ,")+"}"}(n):"Filter"}class $v extends de{constructor(e,t,r){super(e,t,r),this.key=z.fromName(r.referenceValue)}matches(e){const t=z.comparator(e.key,this.key);return this.matchesComparison(t)}}class Hv extends de{constructor(e,t){super(e,"in",t),this.keys=Vu("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class zv extends de{constructor(e,t){super(e,"not-in",t),this.keys=Vu("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function Vu(n,e){var t;return(((t=e.arrayValue)==null?void 0:t.values)||[]).map(r=>z.fromName(r.referenceValue))}class jv extends de{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return zo(t)&&Or(t.arrayValue,this.value)}}class Kv extends de{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Or(this.value.arrayValue,t)}}class Gv extends de{constructor(e,t){super(e,"not-in",t)}matches(e){if(Or(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!Or(this.value.arrayValue,t)}}class Wv extends de{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!zo(t)||!t.arrayValue.values)&&t.arrayValue.values.some(r=>Or(this.value.arrayValue,r))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qv{constructor(e,t=null,r=[],i=[],s=null,a=null,c=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=i,this.limit=s,this.startAt=a,this.endAt=c,this.Te=null}}function Ou(n,e=null,t=[],r=[],i=null,s=null,a=null){return new Qv(n,e,t,r,i,s,a)}function Ko(n){const e=Q(n);if(e.Te===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(r=>jo(r)).join(","),t+="|ob:",t+=e.orderBy.map(r=>function(s){return s.field.canonicalString()+s.dir}(r)).join(","),Ji(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(r=>Kn(r)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(r=>Kn(r)).join(",")),e.Te=t}return e.Te}function Go(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!Bv(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!Du(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!ku(n.startAt,e.startAt)&&ku(n.endAt,e.endAt)}function Wo(n){return z.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fr{constructor(e,t=null,r=[],i=[],s=null,a="F",c=null,l=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=i,this.limit=s,this.limitType=a,this.startAt=c,this.endAt=l,this.Ee=null,this.Ie=null,this.Re=null,this.startAt,this.endAt}}function Yv(n,e,t,r,i,s,a,c){return new Fr(n,e,t,r,i,s,a,c)}function Qo(n){return new Fr(n)}function Mu(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function Xv(n){return z.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function Fu(n){return n.collectionGroup!==null}function Ur(n){const e=Q(n);if(e.Ee===null){e.Ee=[];const t=new Set;for(const s of e.explicitOrderBy)e.Ee.push(s),t.add(s.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let c=new me(Ee.comparator);return a.filters.forEach(l=>{l.getFlattenedFilters().forEach(h=>{h.isInequality()&&(c=c.add(h.field))})}),c})(e).forEach(s=>{t.has(s.canonicalString())||s.isKeyField()||e.Ee.push(new cs(s,r))}),t.has(Ee.keyField().canonicalString())||e.Ee.push(new cs(Ee.keyField(),r))}return e.Ee}function rt(n){const e=Q(n);return e.Ie||(e.Ie=Jv(e,Ur(n))),e.Ie}function Jv(n,e){if(n.limitType==="F")return Ou(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map(i=>{const s=i.dir==="desc"?"asc":"desc";return new cs(i.field,s)});const t=n.endAt?new as(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new as(n.startAt.position,n.startAt.inclusive):null;return Ou(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function Yo(n,e){const t=n.filters.concat([e]);return new Fr(n.path,n.collectionGroup,n.explicitOrderBy.slice(),t,n.limit,n.limitType,n.startAt,n.endAt)}function Xo(n,e,t){return new Fr(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function ls(n,e){return Go(rt(n),rt(e))&&n.limitType===e.limitType}function Uu(n){return`${Ko(rt(n))}|lt:${n.limitType}`}function Gn(n){return`Query(target=${function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map(i=>Lu(i)).join(", ")}]`),Ji(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map(i=>function(a){return`${a.field.canonicalString()} (${a.dir})`}(i)).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map(i=>Kn(i)).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map(i=>Kn(i)).join(",")),`Target(${r})`}(rt(n))}; limitType=${n.limitType})`}function us(n,e){return e.isFoundDocument()&&function(r,i){const s=i.key.path;return r.collectionGroup!==null?i.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(s):z.isDocumentKey(r.path)?r.path.isEqual(s):r.path.isImmediateParentOf(s)}(n,e)&&function(r,i){for(const s of Ur(r))if(!s.field.isKeyField()&&i.data.field(s.field)===null)return!1;return!0}(n,e)&&function(r,i){for(const s of r.filters)if(!s.matches(i))return!1;return!0}(n,e)&&function(r,i){return!(r.startAt&&!function(a,c,l){const h=Cu(a,c,l);return a.inclusive?h<=0:h<0}(r.startAt,Ur(r),i)||r.endAt&&!function(a,c,l){const h=Cu(a,c,l);return a.inclusive?h>=0:h>0}(r.endAt,Ur(r),i))}(n,e)}function Zv(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function Bu(n){return(e,t)=>{let r=!1;for(const i of Ur(n)){const s=e_(i,e,t);if(s!==0)return s;r=r||i.field.isKeyField()}return 0}}function e_(n,e,t){const r=n.field.isKeyField()?z.comparator(e.key,t.key):function(s,a,c){const l=a.data.field(s),h=c.data.field(s);return l!==null&&h!==null?jn(l,h):G(42886)}(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return G(19790,{direction:n.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vn{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[i,s]of r)if(this.equalsFn(i,e))return s}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),i=this.inner[r];if(i===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let s=0;s<i.length;s++)if(this.equalsFn(i[s][0],e))return void(i[s]=[e,t]);i.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let i=0;i<r.length;i++)if(this.equalsFn(r[i][0],e))return r.length===1?delete this.inner[t]:r.splice(i,1),this.innerSize--,!0;return!1}forEach(e){yn(this.inner,(t,r)=>{for(const[i,s]of r)e(i,s)})}isEmpty(){return fu(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const t_=new ae(z.comparator);function Et(){return t_}const qu=new ae(z.comparator);function Br(...n){let e=qu;for(const t of n)e=e.insert(t.key,t);return e}function $u(n){let e=qu;return n.forEach((t,r)=>e=e.insert(t,r.overlayedDocument)),e}function _n(){return qr()}function Hu(){return qr()}function qr(){return new vn(n=>n.toString(),(n,e)=>n.isEqual(e))}const n_=new ae(z.comparator),r_=new me(z.comparator);function Z(...n){let e=r_;for(const t of n)e=e.add(t);return e}const i_=new me(J);function s_(){return i_}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Jo(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Zi(e)?"-0":e}}function zu(n){return{integerValue:""+n}}function o_(n,e){return Pv(e)?zu(e):Jo(n,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hs{constructor(){this._=void 0}}function a_(n,e,t){return n instanceof $r?function(i,s){const a={fields:{[yu]:{stringValue:mu},[_u]:{timestampValue:{seconds:i.seconds,nanos:i.nanoseconds}}}};return s&&qo(s)&&(s=ts(s)),s&&(a.fields[vu]=s),{mapValue:a}}(t,e):n instanceof Hr?Ku(n,e):n instanceof zr?Gu(n,e):function(i,s){const a=ju(i,s),c=Wu(a)+Wu(i.Ae);return Ho(a)&&Ho(i.Ae)?zu(c):Jo(i.serializer,c)}(n,e)}function c_(n,e,t){return n instanceof Hr?Ku(n,e):n instanceof zr?Gu(n,e):t}function ju(n,e){return n instanceof ds?function(r){return Ho(r)||function(s){return!!s&&"doubleValue"in s}(r)}(e)?e:{integerValue:0}:null}class $r extends hs{}class Hr extends hs{constructor(e){super(),this.elements=e}}function Ku(n,e){const t=Qu(e);for(const r of n.elements)t.some(i=>nt(i,r))||t.push(r);return{arrayValue:{values:t}}}class zr extends hs{constructor(e){super(),this.elements=e}}function Gu(n,e){let t=Qu(e);for(const r of n.elements)t=t.filter(i=>!nt(i,r));return{arrayValue:{values:t}}}class ds extends hs{constructor(e,t){super(),this.serializer=e,this.Ae=t}}function Wu(n){return le(n.integerValue||n.doubleValue)}function Qu(n){return zo(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class l_{constructor(e,t){this.field=e,this.transform=t}}function u_(n,e){return n.field.isEqual(e.field)&&function(r,i){return r instanceof Hr&&i instanceof Hr||r instanceof zr&&i instanceof zr?$n(r.elements,i.elements,nt):r instanceof ds&&i instanceof ds?nt(r.Ae,i.Ae):r instanceof $r&&i instanceof $r}(n.transform,e.transform)}class h_{constructor(e,t){this.version=e,this.transformResults=t}}class wt{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new wt}static exists(e){return new wt(void 0,e)}static updateTime(e){return new wt(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function fs(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class ps{}function Yu(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new th(n.key,wt.none()):new Kr(n.key,n.data,wt.none());{const t=n.data,r=He.empty();let i=new me(Ee.comparator);for(let s of e.fields)if(!i.has(s)){let a=t.field(s);a===null&&s.length>1&&(s=s.popLast(),a=t.field(s)),a===null?r.delete(s):r.set(s,a),i=i.add(s)}return new bn(n.key,r,new Ye(i.toArray()),wt.none())}}function d_(n,e,t){n instanceof Kr?function(i,s,a){const c=i.value.clone(),l=Zu(i.fieldTransforms,s,a.transformResults);c.setAll(l),s.convertToFoundDocument(a.version,c).setHasCommittedMutations()}(n,e,t):n instanceof bn?function(i,s,a){if(!fs(i.precondition,s))return void s.convertToUnknownDocument(a.version);const c=Zu(i.fieldTransforms,s,a.transformResults),l=s.data;l.setAll(Ju(i)),l.setAll(c),s.convertToFoundDocument(a.version,l).setHasCommittedMutations()}(n,e,t):function(i,s,a){s.convertToNoDocument(a.version).setHasCommittedMutations()}(0,e,t)}function jr(n,e,t,r){return n instanceof Kr?function(s,a,c,l){if(!fs(s.precondition,a))return c;const h=s.value.clone(),d=eh(s.fieldTransforms,l,a);return h.setAll(d),a.convertToFoundDocument(a.version,h).setHasLocalMutations(),null}(n,e,t,r):n instanceof bn?function(s,a,c,l){if(!fs(s.precondition,a))return c;const h=eh(s.fieldTransforms,l,a),d=a.data;return d.setAll(Ju(s)),d.setAll(h),a.convertToFoundDocument(a.version,d).setHasLocalMutations(),c===null?null:c.unionWith(s.fieldMask.fields).unionWith(s.fieldTransforms.map(p=>p.field))}(n,e,t,r):function(s,a,c){return fs(s.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):c}(n,e,t)}function f_(n,e){let t=null;for(const r of n.fieldTransforms){const i=e.data.field(r.field),s=ju(r.transform,i||null);s!=null&&(t===null&&(t=He.empty()),t.set(r.field,s))}return t||null}function Xu(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!function(r,i){return r===void 0&&i===void 0||!(!r||!i)&&$n(r,i,(s,a)=>u_(s,a))}(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class Kr extends ps{constructor(e,t,r,i=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class bn extends ps{constructor(e,t,r,i,s=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=i,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function Ju(n){const e=new Map;return n.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}}),e}function Zu(n,e,t){const r=new Map;te(n.length===t.length,32656,{Ve:t.length,de:n.length});for(let i=0;i<t.length;i++){const s=n[i],a=s.transform,c=e.data.field(s.field);r.set(s.field,c_(a,c,t[i]))}return r}function eh(n,e,t){const r=new Map;for(const i of n){const s=i.transform,a=t.data.field(i.field);r.set(i.field,a_(s,a,e))}return r}class th extends ps{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class p_ extends ps{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class g_{constructor(e,t,r,i){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=i}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let i=0;i<this.mutations.length;i++){const s=this.mutations[i];s.key.isEqual(e.key)&&d_(s,e,r[i])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=jr(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=jr(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=Hu();return this.mutations.forEach(i=>{const s=e.get(i.key),a=s.overlayedDocument;let c=this.applyToLocalView(a,s.mutatedFields);c=t.has(i.key)?null:c;const l=Yu(a,c);l!==null&&r.set(i.key,l),a.isValidDocument()||a.convertToNoDocument(W.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),Z())}isEqual(e){return this.batchId===e.batchId&&$n(this.mutations,e.mutations,(t,r)=>Xu(t,r))&&$n(this.baseMutations,e.baseMutations,(t,r)=>Xu(t,r))}}class Zo{constructor(e,t,r,i){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=i}static from(e,t,r){te(e.mutations.length===r.length,58842,{me:e.mutations.length,fe:r.length});let i=function(){return n_}();const s=e.mutations;for(let a=0;a<s.length;a++)i=i.insert(s[a].key,r[a].version);return new Zo(e,t,r,i)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class m_{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class y_{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var fe,ee;function v_(n){switch(n){case N.OK:return G(64938);case N.CANCELLED:case N.UNKNOWN:case N.DEADLINE_EXCEEDED:case N.RESOURCE_EXHAUSTED:case N.INTERNAL:case N.UNAVAILABLE:case N.UNAUTHENTICATED:return!1;case N.INVALID_ARGUMENT:case N.NOT_FOUND:case N.ALREADY_EXISTS:case N.PERMISSION_DENIED:case N.FAILED_PRECONDITION:case N.ABORTED:case N.OUT_OF_RANGE:case N.UNIMPLEMENTED:case N.DATA_LOSS:return!0;default:return G(15467,{code:n})}}function nh(n){if(n===void 0)return _t("GRPC error has no .code"),N.UNKNOWN;switch(n){case fe.OK:return N.OK;case fe.CANCELLED:return N.CANCELLED;case fe.UNKNOWN:return N.UNKNOWN;case fe.DEADLINE_EXCEEDED:return N.DEADLINE_EXCEEDED;case fe.RESOURCE_EXHAUSTED:return N.RESOURCE_EXHAUSTED;case fe.INTERNAL:return N.INTERNAL;case fe.UNAVAILABLE:return N.UNAVAILABLE;case fe.UNAUTHENTICATED:return N.UNAUTHENTICATED;case fe.INVALID_ARGUMENT:return N.INVALID_ARGUMENT;case fe.NOT_FOUND:return N.NOT_FOUND;case fe.ALREADY_EXISTS:return N.ALREADY_EXISTS;case fe.PERMISSION_DENIED:return N.PERMISSION_DENIED;case fe.FAILED_PRECONDITION:return N.FAILED_PRECONDITION;case fe.ABORTED:return N.ABORTED;case fe.OUT_OF_RANGE:return N.OUT_OF_RANGE;case fe.UNIMPLEMENTED:return N.UNIMPLEMENTED;case fe.DATA_LOSS:return N.DATA_LOSS;default:return G(39323,{code:n})}}(ee=fe||(fe={}))[ee.OK=0]="OK",ee[ee.CANCELLED=1]="CANCELLED",ee[ee.UNKNOWN=2]="UNKNOWN",ee[ee.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",ee[ee.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",ee[ee.NOT_FOUND=5]="NOT_FOUND",ee[ee.ALREADY_EXISTS=6]="ALREADY_EXISTS",ee[ee.PERMISSION_DENIED=7]="PERMISSION_DENIED",ee[ee.UNAUTHENTICATED=16]="UNAUTHENTICATED",ee[ee.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",ee[ee.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",ee[ee.ABORTED=10]="ABORTED",ee[ee.OUT_OF_RANGE=11]="OUT_OF_RANGE",ee[ee.UNIMPLEMENTED=12]="UNIMPLEMENTED",ee[ee.INTERNAL=13]="INTERNAL",ee[ee.UNAVAILABLE=14]="UNAVAILABLE",ee[ee.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function __(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const b_=new Ut([4294967295,4294967295],0);function rh(n){const e=__().encode(n),t=new Wl;return t.update(e),new Uint8Array(t.digest())}function ih(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),i=e.getUint32(8,!0),s=e.getUint32(12,!0);return[new Ut([t,r],0),new Ut([i,s],0)]}class ea{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new Gr(`Invalid padding: ${t}`);if(r<0)throw new Gr(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Gr(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new Gr(`Invalid padding when bitmap length is 0: ${t}`);this.ge=8*e.length-t,this.pe=Ut.fromNumber(this.ge)}ye(e,t,r){let i=e.add(t.multiply(Ut.fromNumber(r)));return i.compare(b_)===1&&(i=new Ut([i.getBits(0),i.getBits(1)],0)),i.modulo(this.pe).toNumber()}we(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.ge===0)return!1;const t=rh(e),[r,i]=ih(t);for(let s=0;s<this.hashCount;s++){const a=this.ye(r,i,s);if(!this.we(a))return!1}return!0}static create(e,t,r){const i=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),a=new ea(s,i,t);return r.forEach(c=>a.insert(c)),a}insert(e){if(this.ge===0)return;const t=rh(e),[r,i]=ih(t);for(let s=0;s<this.hashCount;s++){const a=this.ye(r,i,s);this.Se(a)}}Se(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class Gr extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gs{constructor(e,t,r,i,s){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=i,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const i=new Map;return i.set(e,Wr.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new gs(W.min(),i,new ae(J),Et(),Z())}}class Wr{constructor(e,t,r,i,s){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=i,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new Wr(r,t,Z(),Z(),Z())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ms{constructor(e,t,r,i){this.be=e,this.removedTargetIds=t,this.key=r,this.De=i}}class sh{constructor(e,t){this.targetId=e,this.Ce=t}}class oh{constructor(e,t,r=Te.EMPTY_BYTE_STRING,i=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=i}}class ah{constructor(){this.ve=0,this.Fe=ch(),this.Me=Te.EMPTY_BYTE_STRING,this.xe=!1,this.Oe=!0}get current(){return this.xe}get resumeToken(){return this.Me}get Ne(){return this.ve!==0}get Be(){return this.Oe}Le(e){e.approximateByteSize()>0&&(this.Oe=!0,this.Me=e)}ke(){let e=Z(),t=Z(),r=Z();return this.Fe.forEach((i,s)=>{switch(s){case 0:e=e.add(i);break;case 2:t=t.add(i);break;case 1:r=r.add(i);break;default:G(38017,{changeType:s})}}),new Wr(this.Me,this.xe,e,t,r)}qe(){this.Oe=!1,this.Fe=ch()}Ke(e,t){this.Oe=!0,this.Fe=this.Fe.insert(e,t)}Ue(e){this.Oe=!0,this.Fe=this.Fe.remove(e)}$e(){this.ve+=1}We(){this.ve-=1,te(this.ve>=0,3241,{ve:this.ve})}Qe(){this.Oe=!0,this.xe=!0}}class E_{constructor(e){this.Ge=e,this.ze=new Map,this.je=Et(),this.Je=ys(),this.He=ys(),this.Ze=new ae(J)}Xe(e){for(const t of e.be)e.De&&e.De.isFoundDocument()?this.Ye(t,e.De):this.et(t,e.key,e.De);for(const t of e.removedTargetIds)this.et(t,e.key,e.De)}tt(e){this.forEachTarget(e,t=>{const r=this.nt(t);switch(e.state){case 0:this.rt(t)&&r.Le(e.resumeToken);break;case 1:r.We(),r.Ne||r.qe(),r.Le(e.resumeToken);break;case 2:r.We(),r.Ne||this.removeTarget(t);break;case 3:this.rt(t)&&(r.Qe(),r.Le(e.resumeToken));break;case 4:this.rt(t)&&(this.it(t),r.Le(e.resumeToken));break;default:G(56790,{state:e.state})}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.ze.forEach((r,i)=>{this.rt(i)&&t(i)})}st(e){const t=e.targetId,r=e.Ce.count,i=this.ot(t);if(i){const s=i.target;if(Wo(s))if(r===0){const a=new z(s.path);this.et(t,a,Ae.newNoDocument(a,W.min()))}else te(r===1,20013,{expectedCount:r});else{const a=this._t(t);if(a!==r){const c=this.ut(e),l=c?this.ct(c,e,a):1;if(l!==0){this.it(t);const h=l===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ze=this.Ze.insert(t,h)}}}}}ut(e){const t=e.Ce.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:i=0},hashCount:s=0}=t;let a,c;try{a=$t(r).toUint8Array()}catch(l){if(l instanceof gu)return gn("Decoding the base64 bloom filter in existence filter failed ("+l.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw l}try{c=new ea(a,i,s)}catch(l){return gn(l instanceof Gr?"BloomFilter error: ":"Applying bloom filter failed: ",l),null}return c.ge===0?null:c}ct(e,t,r){return t.Ce.count===r-this.Pt(e,t.targetId)?0:2}Pt(e,t){const r=this.Ge.getRemoteKeysForTarget(t);let i=0;return r.forEach(s=>{const a=this.Ge.ht(),c=`projects/${a.projectId}/databases/${a.database}/documents/${s.path.canonicalString()}`;e.mightContain(c)||(this.et(t,s,null),i++)}),i}Tt(e){const t=new Map;this.ze.forEach((s,a)=>{const c=this.ot(a);if(c){if(s.current&&Wo(c.target)){const l=new z(c.target.path);this.Et(l).has(a)||this.It(a,l)||this.et(a,l,Ae.newNoDocument(l,e))}s.Be&&(t.set(a,s.ke()),s.qe())}});let r=Z();this.He.forEach((s,a)=>{let c=!0;a.forEachWhile(l=>{const h=this.ot(l);return!h||h.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)}),c&&(r=r.add(s))}),this.je.forEach((s,a)=>a.setReadTime(e));const i=new gs(e,t,this.Ze,this.je,r);return this.je=Et(),this.Je=ys(),this.He=ys(),this.Ze=new ae(J),i}Ye(e,t){if(!this.rt(e))return;const r=this.It(e,t.key)?2:0;this.nt(e).Ke(t.key,r),this.je=this.je.insert(t.key,t),this.Je=this.Je.insert(t.key,this.Et(t.key).add(e)),this.He=this.He.insert(t.key,this.Rt(t.key).add(e))}et(e,t,r){if(!this.rt(e))return;const i=this.nt(e);this.It(e,t)?i.Ke(t,1):i.Ue(t),this.He=this.He.insert(t,this.Rt(t).delete(e)),this.He=this.He.insert(t,this.Rt(t).add(e)),r&&(this.je=this.je.insert(t,r))}removeTarget(e){this.ze.delete(e)}_t(e){const t=this.nt(e).ke();return this.Ge.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}$e(e){this.nt(e).$e()}nt(e){let t=this.ze.get(e);return t||(t=new ah,this.ze.set(e,t)),t}Rt(e){let t=this.He.get(e);return t||(t=new me(J),this.He=this.He.insert(e,t)),t}Et(e){let t=this.Je.get(e);return t||(t=new me(J),this.Je=this.Je.insert(e,t)),t}rt(e){const t=this.ot(e)!==null;return t||q("WatchChangeAggregator","Detected inactive target",e),t}ot(e){const t=this.ze.get(e);return t&&t.Ne?null:this.Ge.At(e)}it(e){this.ze.set(e,new ah),this.Ge.getRemoteKeysForTarget(e).forEach(t=>{this.et(e,t,null)})}It(e,t){return this.Ge.getRemoteKeysForTarget(e).has(t)}}function ys(){return new ae(z.comparator)}function ch(){return new ae(z.comparator)}const w_={asc:"ASCENDING",desc:"DESCENDING"},T_={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},I_={and:"AND",or:"OR"};class x_{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function ta(n,e){return n.useProto3Json||Ji(e)?e:{value:e}}function vs(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function lh(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function A_(n,e){return vs(n,e.toTimestamp())}function it(n){return te(!!n,49232),W.fromTimestamp(function(t){const r=qt(t);return new se(r.seconds,r.nanos)}(n))}function na(n,e){return ra(n,e).canonicalString()}function ra(n,e){const t=function(i){return new ie(["projects",i.projectId,"databases",i.database])}(n).child("documents");return e===void 0?t:t.child(e)}function uh(n){const e=ie.fromString(n);return te(mh(e),10190,{key:e.toString()}),e}function ia(n,e){return na(n.databaseId,e.path)}function sa(n,e){const t=uh(e);if(t.get(1)!==n.databaseId.projectId)throw new B(N.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new B(N.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new z(dh(t))}function hh(n,e){return na(n.databaseId,e)}function S_(n){const e=uh(n);return e.length===4?ie.emptyPath():dh(e)}function oa(n){return new ie(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function dh(n){return te(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function fh(n,e,t){return{name:ia(n,e),fields:t.value.mapValue.fields}}function C_(n,e){let t;if("targetChange"in e){e.targetChange;const r=function(h){return h==="NO_CHANGE"?0:h==="ADD"?1:h==="REMOVE"?2:h==="CURRENT"?3:h==="RESET"?4:G(39313,{state:h})}(e.targetChange.targetChangeType||"NO_CHANGE"),i=e.targetChange.targetIds||[],s=function(h,d){return h.useProto3Json?(te(d===void 0||typeof d=="string",58123),Te.fromBase64String(d||"")):(te(d===void 0||d instanceof Buffer||d instanceof Uint8Array,16193),Te.fromUint8Array(d||new Uint8Array))}(n,e.targetChange.resumeToken),a=e.targetChange.cause,c=a&&function(h){const d=h.code===void 0?N.UNKNOWN:nh(h.code);return new B(d,h.message||"")}(a);t=new oh(r,i,s,c||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const i=sa(n,r.document.name),s=it(r.document.updateTime),a=r.document.createTime?it(r.document.createTime):W.min(),c=new He({mapValue:{fields:r.document.fields}}),l=Ae.newFoundDocument(i,s,a,c),h=r.targetIds||[],d=r.removedTargetIds||[];t=new ms(h,d,l.key,l)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const i=sa(n,r.document),s=r.readTime?it(r.readTime):W.min(),a=Ae.newNoDocument(i,s),c=r.removedTargetIds||[];t=new ms([],c,a.key,a)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const i=sa(n,r.document),s=r.removedTargetIds||[];t=new ms([],s,i,null)}else{if(!("filter"in e))return G(11601,{Vt:e});{e.filter;const r=e.filter;r.targetId;const{count:i=0,unchangedNames:s}=r,a=new y_(i,s),c=r.targetId;t=new sh(c,a)}}return t}function k_(n,e){let t;if(e instanceof Kr)t={update:fh(n,e.key,e.value)};else if(e instanceof th)t={delete:ia(n,e.key)};else if(e instanceof bn)t={update:fh(n,e.key,e.data),updateMask:F_(e.fieldMask)};else{if(!(e instanceof p_))return G(16599,{dt:e.type});t={verify:ia(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(r=>function(s,a){const c=a.transform;if(c instanceof $r)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(c instanceof Hr)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:c.elements}};if(c instanceof zr)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:c.elements}};if(c instanceof ds)return{fieldPath:a.field.canonicalString(),increment:c.Ae};throw G(20930,{transform:a.transform})}(0,r))),e.precondition.isNone||(t.currentDocument=function(i,s){return s.updateTime!==void 0?{updateTime:A_(i,s.updateTime)}:s.exists!==void 0?{exists:s.exists}:G(27497)}(n,e.precondition)),t}function R_(n,e){return n&&n.length>0?(te(e!==void 0,14353),n.map(t=>function(i,s){let a=i.updateTime?it(i.updateTime):it(s);return a.isEqual(W.min())&&(a=it(s)),new h_(a,i.transformResults||[])}(t,e))):[]}function P_(n,e){return{documents:[hh(n,e.path)]}}function N_(n,e){const t={structuredQuery:{}},r=e.path;let i;e.collectionGroup!==null?(i=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(i=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=hh(n,i);const s=function(h){if(h.length!==0)return gh(Xe.create(h,"and"))}(e.filters);s&&(t.structuredQuery.where=s);const a=function(h){if(h.length!==0)return h.map(d=>function(y){return{field:Wn(y.field),direction:V_(y.dir)}}(d))}(e.orderBy);a&&(t.structuredQuery.orderBy=a);const c=ta(n,e.limit);return c!==null&&(t.structuredQuery.limit=c),e.startAt&&(t.structuredQuery.startAt=function(h){return{before:h.inclusive,values:h.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(h){return{before:!h.inclusive,values:h.position}}(e.endAt)),{ft:t,parent:i}}function D_(n){let e=S_(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let i=null;if(r>0){te(r===1,65062);const d=t.from[0];d.allDescendants?i=d.collectionId:e=e.child(d.collectionId)}let s=[];t.where&&(s=function(p){const y=ph(p);return y instanceof Xe&&Nu(y)?y.getFilters():[y]}(t.where));let a=[];t.orderBy&&(a=function(p){return p.map(y=>function(T){return new cs(Qn(T.field),function(x){switch(x){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(T.direction))}(y))}(t.orderBy));let c=null;t.limit&&(c=function(p){let y;return y=typeof p=="object"?p.value:p,Ji(y)?null:y}(t.limit));let l=null;t.startAt&&(l=function(p){const y=!!p.before,I=p.values||[];return new as(I,y)}(t.startAt));let h=null;return t.endAt&&(h=function(p){const y=!p.before,I=p.values||[];return new as(I,y)}(t.endAt)),Yv(e,i,a,s,c,"F",l,h)}function L_(n,e){const t=function(i){switch(i){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return G(28987,{purpose:i})}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function ph(n){return n.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=Qn(t.unaryFilter.field);return de.create(r,"==",{doubleValue:NaN});case"IS_NULL":const i=Qn(t.unaryFilter.field);return de.create(i,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const s=Qn(t.unaryFilter.field);return de.create(s,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=Qn(t.unaryFilter.field);return de.create(a,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return G(61313);default:return G(60726)}}(n):n.fieldFilter!==void 0?function(t){return de.create(Qn(t.fieldFilter.field),function(i){switch(i){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return G(58110);default:return G(50506)}}(t.fieldFilter.op),t.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(t){return Xe.create(t.compositeFilter.filters.map(r=>ph(r)),function(i){switch(i){case"AND":return"and";case"OR":return"or";default:return G(1026)}}(t.compositeFilter.op))}(n):G(30097,{filter:n})}function V_(n){return w_[n]}function O_(n){return T_[n]}function M_(n){return I_[n]}function Wn(n){return{fieldPath:n.canonicalString()}}function Qn(n){return Ee.fromServerFormat(n.fieldPath)}function gh(n){return n instanceof de?function(t){if(t.op==="=="){if(Au(t.value))return{unaryFilter:{field:Wn(t.field),op:"IS_NAN"}};if(xu(t.value))return{unaryFilter:{field:Wn(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(Au(t.value))return{unaryFilter:{field:Wn(t.field),op:"IS_NOT_NAN"}};if(xu(t.value))return{unaryFilter:{field:Wn(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Wn(t.field),op:O_(t.op),value:t.value}}}(n):n instanceof Xe?function(t){const r=t.getFilters().map(i=>gh(i));return r.length===1?r[0]:{compositeFilter:{op:M_(t.op),filters:r}}}(n):G(54877,{filter:n})}function F_(n){const e=[];return n.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function mh(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}function yh(n){return!!n&&typeof n._toProto=="function"&&n._protoValueType==="ProtoValue"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zt{constructor(e,t,r,i,s=W.min(),a=W.min(),c=Te.EMPTY_BYTE_STRING,l=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=i,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=c,this.expectedCount=l}withSequenceNumber(e){return new zt(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new zt(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new zt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new zt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class U_{constructor(e){this.yt=e}}function B_(n){const e=D_({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?Xo(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class q_{constructor(){this.bn=new $_}addToCollectionParentIndex(e,t){return this.bn.add(t),L.resolve()}getCollectionParents(e,t){return L.resolve(this.bn.getEntries(t))}addFieldIndex(e,t){return L.resolve()}deleteFieldIndex(e,t){return L.resolve()}deleteAllFieldIndexes(e){return L.resolve()}createTargetIndexes(e,t){return L.resolve()}getDocumentsMatchingTarget(e,t){return L.resolve(null)}getIndexType(e,t){return L.resolve(0)}getFieldIndexes(e,t){return L.resolve([])}getNextCollectionGroupToUpdate(e){return L.resolve(null)}getMinOffset(e,t){return L.resolve(Bt.min())}getMinOffsetFromCollectionGroup(e,t){return L.resolve(Bt.min())}updateCollectionGroup(e,t,r){return L.resolve()}updateIndexEntries(e,t){return L.resolve()}}class $_{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),i=this.index[t]||new me(ie.comparator),s=!i.has(r);return this.index[t]=i.add(r),s}has(e){const t=e.lastSegment(),r=e.popLast(),i=this.index[t];return i&&i.has(r)}getEntries(e){return(this.index[e]||new me(ie.comparator)).toArray()}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vh={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},_h=41943040;class Ve{static withCacheSize(e){return new Ve(e,Ve.DEFAULT_COLLECTION_PERCENTILE,Ve.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Ve.DEFAULT_COLLECTION_PERCENTILE=10,Ve.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Ve.DEFAULT=new Ve(_h,Ve.DEFAULT_COLLECTION_PERCENTILE,Ve.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Ve.DISABLED=new Ve(-1,0,0);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yn{constructor(e){this.sr=e}next(){return this.sr+=2,this.sr}static _r(){return new Yn(0)}static ar(){return new Yn(-1)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bh="LruGarbageCollector",H_=1048576;function Eh([n,e],[t,r]){const i=J(n,t);return i===0?J(e,r):i}class z_{constructor(e){this.Pr=e,this.buffer=new me(Eh),this.Tr=0}Er(){return++this.Tr}Ir(e){const t=[e,this.Er()];if(this.buffer.size<this.Pr)this.buffer=this.buffer.add(t);else{const r=this.buffer.last();Eh(t,r)<0&&(this.buffer=this.buffer.delete(r).add(t))}}get maxValue(){return this.buffer.last()[0]}}class j_{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.Rr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Ar(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return this.Rr!==null}Ar(e){q(bh,`Garbage collection scheduled in ${e}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){zn(t)?q(bh,"Ignoring IndexedDB error during garbage collection: ",t):await Hn(t)}await this.Ar(3e5)})}}class K_{constructor(e,t){this.Vr=e,this.params=t}calculateTargetCount(e,t){return this.Vr.dr(e).next(r=>Math.floor(t/100*r))}nthSequenceNumber(e,t){if(t===0)return L.resolve(Xi.ce);const r=new z_(t);return this.Vr.forEachTarget(e,i=>r.Ir(i.sequenceNumber)).next(()=>this.Vr.mr(e,i=>r.Ir(i))).next(()=>r.maxValue)}removeTargets(e,t,r){return this.Vr.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.Vr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(q("LruGarbageCollector","Garbage collection skipped; disabled"),L.resolve(vh)):this.getCacheSize(e).next(r=>r<this.params.cacheSizeCollectionThreshold?(q("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),vh):this.gr(e,t))}getCacheSize(e){return this.Vr.getCacheSize(e)}gr(e,t){let r,i,s,a,c,l,h;const d=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(p=>(p>this.params.maximumSequenceNumbersToCollect?(q("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${p}`),i=this.params.maximumSequenceNumbersToCollect):i=p,a=Date.now(),this.nthSequenceNumber(e,i))).next(p=>(r=p,c=Date.now(),this.removeTargets(e,r,t))).next(p=>(s=p,l=Date.now(),this.removeOrphanedDocuments(e,r))).next(p=>(h=Date.now(),qn()<=X.DEBUG&&q("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${a-d}ms
	Determined least recently used ${i} in `+(c-a)+`ms
	Removed ${s} targets in `+(l-c)+`ms
	Removed ${p} documents in `+(h-l)+`ms
Total Duration: ${h-d}ms`),L.resolve({didRun:!0,sequenceNumbersCollected:i,targetsRemoved:s,documentsRemoved:p})))}}function G_(n,e){return new K_(n,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class W_{constructor(){this.changes=new vn(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Ae.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?L.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Q_{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Y_{constructor(e,t,r,i){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=i}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(i=>(r=i,this.remoteDocumentCache.getEntry(e,t))).next(i=>(r!==null&&jr(r.mutation,i,Ye.empty(),se.now()),i))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.getLocalViewOfDocuments(e,r,Z()).next(()=>r))}getLocalViewOfDocuments(e,t,r=Z()){const i=_n();return this.populateOverlays(e,i,t).next(()=>this.computeViews(e,t,i,r).next(s=>{let a=Br();return s.forEach((c,l)=>{a=a.insert(c,l.overlayedDocument)}),a}))}getOverlayedDocuments(e,t){const r=_n();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,Z()))}populateOverlays(e,t,r){const i=[];return r.forEach(s=>{t.has(s)||i.push(s)}),this.documentOverlayCache.getOverlays(e,i).next(s=>{s.forEach((a,c)=>{t.set(a,c)})})}computeViews(e,t,r,i){let s=Et();const a=qr(),c=function(){return qr()}();return t.forEach((l,h)=>{const d=r.get(h.key);i.has(h.key)&&(d===void 0||d.mutation instanceof bn)?s=s.insert(h.key,h):d!==void 0?(a.set(h.key,d.mutation.getFieldMask()),jr(d.mutation,h,d.mutation.getFieldMask(),se.now())):a.set(h.key,Ye.empty())}),this.recalculateAndSaveOverlays(e,s).next(l=>(l.forEach((h,d)=>a.set(h,d)),t.forEach((h,d)=>c.set(h,new Q_(d,a.get(h)??null))),c))}recalculateAndSaveOverlays(e,t){const r=qr();let i=new ae((a,c)=>a-c),s=Z();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(a=>{for(const c of a)c.keys().forEach(l=>{const h=t.get(l);if(h===null)return;let d=r.get(l)||Ye.empty();d=c.applyToLocalView(h,d),r.set(l,d);const p=(i.get(c.batchId)||Z()).add(l);i=i.insert(c.batchId,p)})}).next(()=>{const a=[],c=i.getReverseIterator();for(;c.hasNext();){const l=c.getNext(),h=l.key,d=l.value,p=Hu();d.forEach(y=>{if(!s.has(y)){const I=Yu(t.get(y),r.get(y));I!==null&&p.set(y,I),s=s.add(y)}}),a.push(this.documentOverlayCache.saveOverlays(e,h,p))}return L.waitFor(a)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,t,r,i){return Xv(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):Fu(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,i):this.getDocumentsMatchingCollectionQuery(e,t,r,i)}getNextDocuments(e,t,r,i){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,i).next(s=>{const a=i-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,i-s.size):L.resolve(_n());let c=Dr,l=s;return a.next(h=>L.forEach(h,(d,p)=>(c<p.largestBatchId&&(c=p.largestBatchId),s.get(d)?L.resolve():this.remoteDocumentCache.getEntry(e,d).next(y=>{l=l.insert(d,y)}))).next(()=>this.populateOverlays(e,h,s)).next(()=>this.computeViews(e,l,h,Z())).next(d=>({batchId:c,changes:$u(d)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new z(t)).next(r=>{let i=Br();return r.isFoundDocument()&&(i=i.insert(r.key,r)),i})}getDocumentsMatchingCollectionGroupQuery(e,t,r,i){const s=t.collectionGroup;let a=Br();return this.indexManager.getCollectionParents(e,s).next(c=>L.forEach(c,l=>{const h=function(p,y){return new Fr(y,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)}(t,l.child(s));return this.getDocumentsMatchingCollectionQuery(e,h,r,i).next(d=>{d.forEach((p,y)=>{a=a.insert(p,y)})})}).next(()=>a))}getDocumentsMatchingCollectionQuery(e,t,r,i){let s;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(a=>(s=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,s,i))).next(a=>{s.forEach((l,h)=>{const d=h.getKey();a.get(d)===null&&(a=a.insert(d,Ae.newInvalidDocument(d)))});let c=Br();return a.forEach((l,h)=>{const d=s.get(l);d!==void 0&&jr(d.mutation,h,Ye.empty(),se.now()),us(t,h)&&(c=c.insert(l,h))}),c})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class X_{constructor(e){this.serializer=e,this.Nr=new Map,this.Br=new Map}getBundleMetadata(e,t){return L.resolve(this.Nr.get(t))}saveBundleMetadata(e,t){return this.Nr.set(t.id,function(i){return{id:i.id,version:i.version,createTime:it(i.createTime)}}(t)),L.resolve()}getNamedQuery(e,t){return L.resolve(this.Br.get(t))}saveNamedQuery(e,t){return this.Br.set(t.name,function(i){return{name:i.name,query:B_(i.bundledQuery),readTime:it(i.readTime)}}(t)),L.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class J_{constructor(){this.overlays=new ae(z.comparator),this.Lr=new Map}getOverlay(e,t){return L.resolve(this.overlays.get(t))}getOverlays(e,t){const r=_n();return L.forEach(t,i=>this.getOverlay(e,i).next(s=>{s!==null&&r.set(i,s)})).next(()=>r)}saveOverlays(e,t,r){return r.forEach((i,s)=>{this.St(e,t,s)}),L.resolve()}removeOverlaysForBatchId(e,t,r){const i=this.Lr.get(r);return i!==void 0&&(i.forEach(s=>this.overlays=this.overlays.remove(s)),this.Lr.delete(r)),L.resolve()}getOverlaysForCollection(e,t,r){const i=_n(),s=t.length+1,a=new z(t.child("")),c=this.overlays.getIteratorFrom(a);for(;c.hasNext();){const l=c.getNext().value,h=l.getKey();if(!t.isPrefixOf(h.path))break;h.path.length===s&&l.largestBatchId>r&&i.set(l.getKey(),l)}return L.resolve(i)}getOverlaysForCollectionGroup(e,t,r,i){let s=new ae((h,d)=>h-d);const a=this.overlays.getIterator();for(;a.hasNext();){const h=a.getNext().value;if(h.getKey().getCollectionGroup()===t&&h.largestBatchId>r){let d=s.get(h.largestBatchId);d===null&&(d=_n(),s=s.insert(h.largestBatchId,d)),d.set(h.getKey(),h)}}const c=_n(),l=s.getIterator();for(;l.hasNext()&&(l.getNext().value.forEach((h,d)=>c.set(h,d)),!(c.size()>=i)););return L.resolve(c)}St(e,t,r){const i=this.overlays.get(r.key);if(i!==null){const a=this.Lr.get(i.largestBatchId).delete(r.key);this.Lr.set(i.largestBatchId,a)}this.overlays=this.overlays.insert(r.key,new m_(t,r));let s=this.Lr.get(t);s===void 0&&(s=Z(),this.Lr.set(t,s)),this.Lr.set(t,s.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Z_{constructor(){this.sessionToken=Te.EMPTY_BYTE_STRING}getSessionToken(e){return L.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,L.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aa{constructor(){this.kr=new me(_e.qr),this.Kr=new me(_e.Ur)}isEmpty(){return this.kr.isEmpty()}addReference(e,t){const r=new _e(e,t);this.kr=this.kr.add(r),this.Kr=this.Kr.add(r)}$r(e,t){e.forEach(r=>this.addReference(r,t))}removeReference(e,t){this.Wr(new _e(e,t))}Qr(e,t){e.forEach(r=>this.removeReference(r,t))}Gr(e){const t=new z(new ie([])),r=new _e(t,e),i=new _e(t,e+1),s=[];return this.Kr.forEachInRange([r,i],a=>{this.Wr(a),s.push(a.key)}),s}zr(){this.kr.forEach(e=>this.Wr(e))}Wr(e){this.kr=this.kr.delete(e),this.Kr=this.Kr.delete(e)}jr(e){const t=new z(new ie([])),r=new _e(t,e),i=new _e(t,e+1);let s=Z();return this.Kr.forEachInRange([r,i],a=>{s=s.add(a.key)}),s}containsKey(e){const t=new _e(e,0),r=this.kr.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class _e{constructor(e,t){this.key=e,this.Jr=t}static qr(e,t){return z.comparator(e.key,t.key)||J(e.Jr,t.Jr)}static Ur(e,t){return J(e.Jr,t.Jr)||z.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eb{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Yn=1,this.Hr=new me(_e.qr)}checkEmpty(e){return L.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,i){const s=this.Yn;this.Yn++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new g_(s,t,r,i);this.mutationQueue.push(a);for(const c of i)this.Hr=this.Hr.add(new _e(c.key,s)),this.indexManager.addToCollectionParentIndex(e,c.key.path.popLast());return L.resolve(a)}lookupMutationBatch(e,t){return L.resolve(this.Zr(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,i=this.Xr(r),s=i<0?0:i;return L.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return L.resolve(this.mutationQueue.length===0?Bo:this.Yn-1)}getAllMutationBatches(e){return L.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new _e(t,0),i=new _e(t,Number.POSITIVE_INFINITY),s=[];return this.Hr.forEachInRange([r,i],a=>{const c=this.Zr(a.Jr);s.push(c)}),L.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new me(J);return t.forEach(i=>{const s=new _e(i,0),a=new _e(i,Number.POSITIVE_INFINITY);this.Hr.forEachInRange([s,a],c=>{r=r.add(c.Jr)})}),L.resolve(this.Yr(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,i=r.length+1;let s=r;z.isDocumentKey(s)||(s=s.child(""));const a=new _e(new z(s),0);let c=new me(J);return this.Hr.forEachWhile(l=>{const h=l.key.path;return!!r.isPrefixOf(h)&&(h.length===i&&(c=c.add(l.Jr)),!0)},a),L.resolve(this.Yr(c))}Yr(e){const t=[];return e.forEach(r=>{const i=this.Zr(r);i!==null&&t.push(i)}),t}removeMutationBatch(e,t){te(this.ei(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.Hr;return L.forEach(t.mutations,i=>{const s=new _e(i.key,t.batchId);return r=r.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,i.key)}).next(()=>{this.Hr=r})}nr(e){}containsKey(e,t){const r=new _e(t,0),i=this.Hr.firstAfterOrEqual(r);return L.resolve(t.isEqual(i&&i.key))}performConsistencyCheck(e){return this.mutationQueue.length,L.resolve()}ei(e,t){return this.Xr(e)}Xr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Zr(e){const t=this.Xr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tb{constructor(e){this.ti=e,this.docs=function(){return new ae(z.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,i=this.docs.get(r),s=i?i.size:0,a=this.ti(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:a}),this.size+=a-s,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return L.resolve(r?r.document.mutableCopy():Ae.newInvalidDocument(t))}getEntries(e,t){let r=Et();return t.forEach(i=>{const s=this.docs.get(i);r=r.insert(i,s?s.document.mutableCopy():Ae.newInvalidDocument(i))}),L.resolve(r)}getDocumentsMatchingQuery(e,t,r,i){let s=Et();const a=t.path,c=new z(a.child("__id-9223372036854775808__")),l=this.docs.getIteratorFrom(c);for(;l.hasNext();){const{key:h,value:{document:d}}=l.getNext();if(!a.isPrefixOf(h.path))break;h.path.length>a.length+1||Sv(Av(d),r)<=0||(i.has(d.key)||us(t,d))&&(s=s.insert(d.key,d.mutableCopy()))}return L.resolve(s)}getAllFromCollectionGroup(e,t,r,i){G(9500)}ni(e,t){return L.forEach(this.docs,r=>t(r))}newChangeBuffer(e){return new nb(this)}getSize(e){return L.resolve(this.size)}}class nb extends W_{constructor(e){super(),this.Mr=e}applyChanges(e){const t=[];return this.changes.forEach((r,i)=>{i.isValidDocument()?t.push(this.Mr.addEntry(e,i)):this.Mr.removeEntry(r)}),L.waitFor(t)}getFromCache(e,t){return this.Mr.getEntry(e,t)}getAllFromCache(e,t){return this.Mr.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rb{constructor(e){this.persistence=e,this.ri=new vn(t=>Ko(t),Go),this.lastRemoteSnapshotVersion=W.min(),this.highestTargetId=0,this.ii=0,this.si=new aa,this.targetCount=0,this.oi=Yn._r()}forEachTarget(e,t){return this.ri.forEach((r,i)=>t(i)),L.resolve()}getLastRemoteSnapshotVersion(e){return L.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return L.resolve(this.ii)}allocateTargetId(e){return this.highestTargetId=this.oi.next(),L.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.ii&&(this.ii=t),L.resolve()}lr(e){this.ri.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.oi=new Yn(t),this.highestTargetId=t),e.sequenceNumber>this.ii&&(this.ii=e.sequenceNumber)}addTargetData(e,t){return this.lr(t),this.targetCount+=1,L.resolve()}updateTargetData(e,t){return this.lr(t),L.resolve()}removeTargetData(e,t){return this.ri.delete(t.target),this.si.Gr(t.targetId),this.targetCount-=1,L.resolve()}removeTargets(e,t,r){let i=0;const s=[];return this.ri.forEach((a,c)=>{c.sequenceNumber<=t&&r.get(c.targetId)===null&&(this.ri.delete(a),s.push(this.removeMatchingKeysForTargetId(e,c.targetId)),i++)}),L.waitFor(s).next(()=>i)}getTargetCount(e){return L.resolve(this.targetCount)}getTargetData(e,t){const r=this.ri.get(t)||null;return L.resolve(r)}addMatchingKeys(e,t,r){return this.si.$r(t,r),L.resolve()}removeMatchingKeys(e,t,r){this.si.Qr(t,r);const i=this.persistence.referenceDelegate,s=[];return i&&t.forEach(a=>{s.push(i.markPotentiallyOrphaned(e,a))}),L.waitFor(s)}removeMatchingKeysForTargetId(e,t){return this.si.Gr(t),L.resolve()}getMatchingKeysForTargetId(e,t){const r=this.si.jr(t);return L.resolve(r)}containsKey(e,t){return L.resolve(this.si.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wh{constructor(e,t){this._i={},this.overlays={},this.ai=new Xi(0),this.ui=!1,this.ui=!0,this.ci=new Z_,this.referenceDelegate=e(this),this.li=new rb(this),this.indexManager=new q_,this.remoteDocumentCache=function(i){return new tb(i)}(r=>this.referenceDelegate.hi(r)),this.serializer=new U_(t),this.Pi=new X_(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ui=!1,Promise.resolve()}get started(){return this.ui}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new J_,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this._i[e.toKey()];return r||(r=new eb(t,this.referenceDelegate),this._i[e.toKey()]=r),r}getGlobalsCache(){return this.ci}getTargetCache(){return this.li}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Pi}runTransaction(e,t,r){q("MemoryPersistence","Starting transaction:",e);const i=new ib(this.ai.next());return this.referenceDelegate.Ti(),r(i).next(s=>this.referenceDelegate.Ei(i).next(()=>s)).toPromise().then(s=>(i.raiseOnCommittedEvent(),s))}Ii(e,t){return L.or(Object.values(this._i).map(r=>()=>r.containsKey(e,t)))}}class ib extends kv{constructor(e){super(),this.currentSequenceNumber=e}}class ca{constructor(e){this.persistence=e,this.Ri=new aa,this.Ai=null}static Vi(e){return new ca(e)}get di(){if(this.Ai)return this.Ai;throw G(60996)}addReference(e,t,r){return this.Ri.addReference(r,t),this.di.delete(r.toString()),L.resolve()}removeReference(e,t,r){return this.Ri.removeReference(r,t),this.di.add(r.toString()),L.resolve()}markPotentiallyOrphaned(e,t){return this.di.add(t.toString()),L.resolve()}removeTarget(e,t){this.Ri.Gr(t.targetId).forEach(i=>this.di.add(i.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(i=>{i.forEach(s=>this.di.add(s.toString()))}).next(()=>r.removeTargetData(e,t))}Ti(){this.Ai=new Set}Ei(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return L.forEach(this.di,r=>{const i=z.fromPath(r);return this.mi(e,i).next(s=>{s||t.removeEntry(i,W.min())})}).next(()=>(this.Ai=null,t.apply(e)))}updateLimboDocument(e,t){return this.mi(e,t).next(r=>{r?this.di.delete(t.toString()):this.di.add(t.toString())})}hi(e){return 0}mi(e,t){return L.or([()=>L.resolve(this.Ri.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Ii(e,t)])}}class _s{constructor(e,t){this.persistence=e,this.fi=new vn(r=>Nv(r.path),(r,i)=>r.isEqual(i)),this.garbageCollector=G_(this,t)}static Vi(e,t){return new _s(e,t)}Ti(){}Ei(e){return L.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}dr(e){const t=this.pr(e);return this.persistence.getTargetCache().getTargetCount(e).next(r=>t.next(i=>r+i))}pr(e){let t=0;return this.mr(e,r=>{t++}).next(()=>t)}mr(e,t){return L.forEach(this.fi,(r,i)=>this.wr(e,r,i).next(s=>s?L.resolve():t(i)))}removeTargets(e,t,r){return this.persistence.getTargetCache().removeTargets(e,t,r)}removeOrphanedDocuments(e,t){let r=0;const i=this.persistence.getRemoteDocumentCache(),s=i.newChangeBuffer();return i.ni(e,a=>this.wr(e,a,t).next(c=>{c||(r++,s.removeEntry(a,W.min()))})).next(()=>s.apply(e)).next(()=>r)}markPotentiallyOrphaned(e,t){return this.fi.set(t,e.currentSequenceNumber),L.resolve()}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,t,r){return this.fi.set(r,e.currentSequenceNumber),L.resolve()}removeReference(e,t,r){return this.fi.set(r,e.currentSequenceNumber),L.resolve()}updateLimboDocument(e,t){return this.fi.set(t,e.currentSequenceNumber),L.resolve()}hi(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=ss(e.data.value)),t}wr(e,t,r){return L.or([()=>this.persistence.Ii(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const i=this.fi.get(t);return L.resolve(i!==void 0&&i>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class la{constructor(e,t,r,i){this.targetId=e,this.fromCache=t,this.Ts=r,this.Es=i}static Is(e,t){let r=Z(),i=Z();for(const s of t.docChanges)switch(s.type){case 0:r=r.add(s.doc.key);break;case 1:i=i.add(s.doc.key)}return new la(e,t.fromCache,r,i)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sb{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ob{constructor(){this.Rs=!1,this.As=!1,this.Vs=100,this.ds=function(){return Np()?8:Rv(Ie())>0?6:4}()}initialize(e,t){this.fs=e,this.indexManager=t,this.Rs=!0}getDocumentsMatchingQuery(e,t,r,i){const s={result:null};return this.gs(e,t).next(a=>{s.result=a}).next(()=>{if(!s.result)return this.ps(e,t,i,r).next(a=>{s.result=a})}).next(()=>{if(s.result)return;const a=new sb;return this.ys(e,t,a).next(c=>{if(s.result=c,this.As)return this.ws(e,t,a,c.size)})}).next(()=>s.result)}ws(e,t,r,i){return r.documentReadCount<this.Vs?(qn()<=X.DEBUG&&q("QueryEngine","SDK will not create cache indexes for query:",Gn(t),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),L.resolve()):(qn()<=X.DEBUG&&q("QueryEngine","Query:",Gn(t),"scans",r.documentReadCount,"local documents and returns",i,"documents as results."),r.documentReadCount>this.ds*i?(qn()<=X.DEBUG&&q("QueryEngine","The SDK decides to create cache indexes for query:",Gn(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,rt(t))):L.resolve())}gs(e,t){if(Mu(t))return L.resolve(null);let r=rt(t);return this.indexManager.getIndexType(e,r).next(i=>i===0?null:(t.limit!==null&&i===1&&(t=Xo(t,null,"F"),r=rt(t)),this.indexManager.getDocumentsMatchingTarget(e,r).next(s=>{const a=Z(...s);return this.fs.getDocuments(e,a).next(c=>this.indexManager.getMinOffset(e,r).next(l=>{const h=this.Ss(t,c);return this.bs(t,h,a,l.readTime)?this.gs(e,Xo(t,null,"F")):this.Ds(e,h,t,l)}))})))}ps(e,t,r,i){return Mu(t)||i.isEqual(W.min())?L.resolve(null):this.fs.getDocuments(e,r).next(s=>{const a=this.Ss(t,s);return this.bs(t,a,r,i)?L.resolve(null):(qn()<=X.DEBUG&&q("QueryEngine","Re-using previous result from %s to execute query: %s",i.toString(),Gn(t)),this.Ds(e,a,t,xv(i,Dr)).next(c=>c))})}Ss(e,t){let r=new me(Bu(e));return t.forEach((i,s)=>{us(e,s)&&(r=r.add(s))}),r}bs(e,t,r,i){if(e.limit===null)return!1;if(r.size!==t.size)return!0;const s=e.limitType==="F"?t.last():t.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(i)>0)}ys(e,t,r){return qn()<=X.DEBUG&&q("QueryEngine","Using full collection scan to execute query:",Gn(t)),this.fs.getDocumentsMatchingQuery(e,t,Bt.min(),r)}Ds(e,t,r,i){return this.fs.getDocumentsMatchingQuery(e,r,i).next(s=>(t.forEach(a=>{s=s.insert(a.key,a)}),s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ua="LocalStore",ab=3e8;class cb{constructor(e,t,r,i){this.persistence=e,this.Cs=t,this.serializer=i,this.vs=new ae(J),this.Fs=new vn(s=>Ko(s),Go),this.Ms=new Map,this.xs=e.getRemoteDocumentCache(),this.li=e.getTargetCache(),this.Pi=e.getBundleCache(),this.Os(r)}Os(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new Y_(this.xs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.xs.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.vs))}}function lb(n,e,t,r){return new cb(n,e,t,r)}async function Th(n,e){const t=Q(n);return await t.persistence.runTransaction("Handle user change","readonly",r=>{let i;return t.mutationQueue.getAllMutationBatches(r).next(s=>(i=s,t.Os(e),t.mutationQueue.getAllMutationBatches(r))).next(s=>{const a=[],c=[];let l=Z();for(const h of i){a.push(h.batchId);for(const d of h.mutations)l=l.add(d.key)}for(const h of s){c.push(h.batchId);for(const d of h.mutations)l=l.add(d.key)}return t.localDocuments.getDocuments(r,l).next(h=>({Ns:h,removedBatchIds:a,addedBatchIds:c}))})})}function ub(n,e){const t=Q(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const i=e.batch.keys(),s=t.xs.newChangeBuffer({trackRemovals:!0});return function(c,l,h,d){const p=h.batch,y=p.keys();let I=L.resolve();return y.forEach(T=>{I=I.next(()=>d.getEntry(l,T)).next(R=>{const x=h.docVersions.get(T);te(x!==null,48541),R.version.compareTo(x)<0&&(p.applyToRemoteDocument(R,h),R.isValidDocument()&&(R.setReadTime(h.commitVersion),d.addEntry(R)))})}),I.next(()=>c.mutationQueue.removeMutationBatch(l,p))}(t,r,e,s).next(()=>s.apply(r)).next(()=>t.mutationQueue.performConsistencyCheck(r)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(r,i,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(c){let l=Z();for(let h=0;h<c.mutationResults.length;++h)c.mutationResults[h].transformResults.length>0&&(l=l.add(c.batch.mutations[h].key));return l}(e))).next(()=>t.localDocuments.getDocuments(r,i))})}function Ih(n){const e=Q(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.li.getLastRemoteSnapshotVersion(t))}function hb(n,e){const t=Q(n),r=e.snapshotVersion;let i=t.vs;return t.persistence.runTransaction("Apply remote event","readwrite-primary",s=>{const a=t.xs.newChangeBuffer({trackRemovals:!0});i=t.vs;const c=[];e.targetChanges.forEach((d,p)=>{const y=i.get(p);if(!y)return;c.push(t.li.removeMatchingKeys(s,d.removedDocuments,p).next(()=>t.li.addMatchingKeys(s,d.addedDocuments,p)));let I=y.withSequenceNumber(s.currentSequenceNumber);e.targetMismatches.get(p)!==null?I=I.withResumeToken(Te.EMPTY_BYTE_STRING,W.min()).withLastLimboFreeSnapshotVersion(W.min()):d.resumeToken.approximateByteSize()>0&&(I=I.withResumeToken(d.resumeToken,r)),i=i.insert(p,I),function(R,x,k){return R.resumeToken.approximateByteSize()===0||x.snapshotVersion.toMicroseconds()-R.snapshotVersion.toMicroseconds()>=ab?!0:k.addedDocuments.size+k.modifiedDocuments.size+k.removedDocuments.size>0}(y,I,d)&&c.push(t.li.updateTargetData(s,I))});let l=Et(),h=Z();if(e.documentUpdates.forEach(d=>{e.resolvedLimboDocuments.has(d)&&c.push(t.persistence.referenceDelegate.updateLimboDocument(s,d))}),c.push(db(s,a,e.documentUpdates).next(d=>{l=d.Bs,h=d.Ls})),!r.isEqual(W.min())){const d=t.li.getLastRemoteSnapshotVersion(s).next(p=>t.li.setTargetsMetadata(s,s.currentSequenceNumber,r));c.push(d)}return L.waitFor(c).next(()=>a.apply(s)).next(()=>t.localDocuments.getLocalViewOfDocuments(s,l,h)).next(()=>l)}).then(s=>(t.vs=i,s))}function db(n,e,t){let r=Z(),i=Z();return t.forEach(s=>r=r.add(s)),e.getEntries(n,r).next(s=>{let a=Et();return t.forEach((c,l)=>{const h=s.get(c);l.isFoundDocument()!==h.isFoundDocument()&&(i=i.add(c)),l.isNoDocument()&&l.version.isEqual(W.min())?(e.removeEntry(c,l.readTime),a=a.insert(c,l)):!h.isValidDocument()||l.version.compareTo(h.version)>0||l.version.compareTo(h.version)===0&&h.hasPendingWrites?(e.addEntry(l),a=a.insert(c,l)):q(ua,"Ignoring outdated watch update for ",c,". Current version:",h.version," Watch version:",l.version)}),{Bs:a,Ls:i}})}function fb(n,e){const t=Q(n);return t.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=Bo),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function pb(n,e){const t=Q(n);return t.persistence.runTransaction("Allocate target","readwrite",r=>{let i;return t.li.getTargetData(r,e).next(s=>s?(i=s,L.resolve(i)):t.li.allocateTargetId(r).next(a=>(i=new zt(e,a,"TargetPurposeListen",r.currentSequenceNumber),t.li.addTargetData(r,i).next(()=>i))))}).then(r=>{const i=t.vs.get(r.targetId);return(i===null||r.snapshotVersion.compareTo(i.snapshotVersion)>0)&&(t.vs=t.vs.insert(r.targetId,r),t.Fs.set(e,r.targetId)),r})}async function ha(n,e,t){const r=Q(n),i=r.vs.get(e),s=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",s,a=>r.persistence.referenceDelegate.removeTarget(a,i))}catch(a){if(!zn(a))throw a;q(ua,`Failed to update sequence numbers for target ${e}: ${a}`)}r.vs=r.vs.remove(e),r.Fs.delete(i.target)}function xh(n,e,t){const r=Q(n);let i=W.min(),s=Z();return r.persistence.runTransaction("Execute query","readwrite",a=>function(l,h,d){const p=Q(l),y=p.Fs.get(d);return y!==void 0?L.resolve(p.vs.get(y)):p.li.getTargetData(h,d)}(r,a,rt(e)).next(c=>{if(c)return i=c.lastLimboFreeSnapshotVersion,r.li.getMatchingKeysForTargetId(a,c.targetId).next(l=>{s=l})}).next(()=>r.Cs.getDocumentsMatchingQuery(a,e,t?i:W.min(),t?s:Z())).next(c=>(gb(r,Zv(e),c),{documents:c,ks:s})))}function gb(n,e,t){let r=n.Ms.get(e)||W.min();t.forEach((i,s)=>{s.readTime.compareTo(r)>0&&(r=s.readTime)}),n.Ms.set(e,r)}class Ah{constructor(){this.activeTargetIds=s_()}Qs(e){this.activeTargetIds=this.activeTargetIds.add(e)}Gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Ws(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class mb{constructor(){this.vo=new Ah,this.Fo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.vo.Qs(e),this.Fo[e]||"not-current"}updateQueryState(e,t,r){this.Fo[e]=t}removeLocalQueryTarget(e){this.vo.Gs(e)}isLocalQueryTarget(e){return this.vo.activeTargetIds.has(e)}clearQueryState(e){delete this.Fo[e]}getAllActiveQueryTargets(){return this.vo.activeTargetIds}isActiveQueryTarget(e){return this.vo.activeTargetIds.has(e)}start(){return this.vo=new Ah,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yb{Mo(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sh="ConnectivityMonitor";class Ch{constructor(){this.xo=()=>this.Oo(),this.No=()=>this.Bo(),this.Lo=[],this.ko()}Mo(e){this.Lo.push(e)}shutdown(){window.removeEventListener("online",this.xo),window.removeEventListener("offline",this.No)}ko(){window.addEventListener("online",this.xo),window.addEventListener("offline",this.No)}Oo(){q(Sh,"Network connectivity changed: AVAILABLE");for(const e of this.Lo)e(0)}Bo(){q(Sh,"Network connectivity changed: UNAVAILABLE");for(const e of this.Lo)e(1)}static v(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let bs=null;function da(){return bs===null?bs=function(){return 268435456+Math.round(2147483648*Math.random())}():bs++,"0x"+bs.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fa="RestConnection",vb={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class _b{get qo(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.Ko=t+"://"+e.host,this.Uo=`projects/${r}/databases/${i}`,this.$o=this.databaseId.database===ns?`project_id=${r}`:`project_id=${r}&database_id=${i}`}Wo(e,t,r,i,s){const a=da(),c=this.Qo(e,t.toUriEncodedString());q(fa,`Sending RPC '${e}' ${a}:`,c,r);const l={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.$o};this.Go(l,i,s);const{host:h}=new URL(c),d=wr(h);return this.zo(e,c,l,r,d).then(p=>(q(fa,`Received RPC '${e}' ${a}: `,p),p),p=>{throw gn(fa,`RPC '${e}' ${a} failed with error: `,p,"url: ",c,"request:",r),p})}jo(e,t,r,i,s,a){return this.Wo(e,t,r,i,s)}Go(e,t,r){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+Bn}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((i,s)=>e[s]=i),r&&r.headers.forEach((i,s)=>e[s]=i)}Qo(e,t){const r=vb[e];let i=`${this.Ko}/v1/${t}:${r}`;return this.databaseInfo.apiKey&&(i=`${i}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),i}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bb{constructor(e){this.Jo=e.Jo,this.Ho=e.Ho}Zo(e){this.Xo=e}Yo(e){this.e_=e}t_(e){this.n_=e}onMessage(e){this.r_=e}close(){this.Ho()}send(e){this.Jo(e)}i_(){this.Xo()}s_(){this.e_()}o_(e){this.n_(e)}__(e){this.r_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Se="WebChannelConnection",Qr=(n,e,t)=>{n.listen(e,r=>{try{t(r)}catch(i){setTimeout(()=>{throw i},0)}})};class Xn extends _b{constructor(e){super(e),this.a_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static u_(){if(!Xn.c_){const e=Jl();Qr(e,Xl.STAT_EVENT,t=>{t.stat===Vo.PROXY?q(Se,"STAT_EVENT: detected buffering proxy"):t.stat===Vo.NOPROXY&&q(Se,"STAT_EVENT: detected no buffering proxy")}),Xn.c_=!0}}zo(e,t,r,i,s){const a=da();return new Promise((c,l)=>{const h=new Ql;h.setWithCredentials(!0),h.listenOnce(Yl.COMPLETE,()=>{try{switch(h.getLastErrorCode()){case Qi.NO_ERROR:const p=h.getResponseJson();q(Se,`XHR for RPC '${e}' ${a} received:`,JSON.stringify(p)),c(p);break;case Qi.TIMEOUT:q(Se,`RPC '${e}' ${a} timed out`),l(new B(N.DEADLINE_EXCEEDED,"Request time out"));break;case Qi.HTTP_ERROR:const y=h.getStatus();if(q(Se,`RPC '${e}' ${a} failed with status:`,y,"response text:",h.getResponseText()),y>0){let I=h.getResponseJson();Array.isArray(I)&&(I=I[0]);const T=I==null?void 0:I.error;if(T&&T.status&&T.message){const R=function(k){const O=k.toLowerCase().replace(/_/g,"-");return Object.values(N).indexOf(O)>=0?O:N.UNKNOWN}(T.status);l(new B(R,T.message))}else l(new B(N.UNKNOWN,"Server responded with status "+h.getStatus()))}else l(new B(N.UNAVAILABLE,"Connection failed."));break;default:G(9055,{l_:e,streamId:a,h_:h.getLastErrorCode(),P_:h.getLastError()})}}finally{q(Se,`RPC '${e}' ${a} completed.`)}});const d=JSON.stringify(i);q(Se,`RPC '${e}' ${a} sending request:`,i),h.send(t,"POST",d,r,15)})}T_(e,t,r){const i=da(),s=[this.Ko,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=this.createWebChannelTransport(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},l=this.longPollingOptions.timeoutSeconds;l!==void 0&&(c.longPollingTimeout=Math.round(1e3*l)),this.useFetchStreams&&(c.useFetchStreams=!0),this.Go(c.initMessageHeaders,t,r),c.encodeInitMessageHeaders=!0;const h=s.join("");q(Se,`Creating RPC '${e}' stream ${i}: ${h}`,c);const d=a.createWebChannel(h,c);this.E_(d);let p=!1,y=!1;const I=new bb({Jo:T=>{y?q(Se,`Not sending because RPC '${e}' stream ${i} is closed:`,T):(p||(q(Se,`Opening RPC '${e}' stream ${i} transport.`),d.open(),p=!0),q(Se,`RPC '${e}' stream ${i} sending:`,T),d.send(T))},Ho:()=>d.close()});return Qr(d,Pr.EventType.OPEN,()=>{y||(q(Se,`RPC '${e}' stream ${i} transport opened.`),I.i_())}),Qr(d,Pr.EventType.CLOSE,()=>{y||(y=!0,q(Se,`RPC '${e}' stream ${i} transport closed`),I.o_(),this.I_(d))}),Qr(d,Pr.EventType.ERROR,T=>{y||(y=!0,gn(Se,`RPC '${e}' stream ${i} transport errored. Name:`,T.name,"Message:",T.message),I.o_(new B(N.UNAVAILABLE,"The operation could not be completed")))}),Qr(d,Pr.EventType.MESSAGE,T=>{var R;if(!y){const x=T.data[0];te(!!x,16349);const k=x,O=(k==null?void 0:k.error)||((R=k[0])==null?void 0:R.error);if(O){q(Se,`RPC '${e}' stream ${i} received error:`,O);const D=O.status;let F=function(_){const m=fe[_];if(m!==void 0)return nh(m)}(D),H=O.message;D==="NOT_FOUND"&&H.includes("database")&&H.includes("does not exist")&&H.includes(this.databaseId.database)&&gn(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),F===void 0&&(F=N.INTERNAL,H="Unknown error status: "+D+" with message "+O.message),y=!0,I.o_(new B(F,H)),d.close()}else q(Se,`RPC '${e}' stream ${i} received:`,x),I.__(x)}}),Xn.u_(),setTimeout(()=>{I.s_()},0),I}terminate(){this.a_.forEach(e=>e.close()),this.a_=[]}E_(e){this.a_.push(e)}I_(e){this.a_=this.a_.filter(t=>t===e)}Go(e,t,r){super.Go(e,t,r),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return Zl()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Eb(n){return new Xn(n)}function pa(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Es(n){return new x_(n,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Xn.c_=!1;class kh{constructor(e,t,r=1e3,i=1.5,s=6e4){this.Ci=e,this.timerId=t,this.R_=r,this.A_=i,this.V_=s,this.d_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.d_=0}g_(){this.d_=this.V_}p_(e){this.cancel();const t=Math.floor(this.d_+this.y_()),r=Math.max(0,Date.now()-this.f_),i=Math.max(0,t-r);i>0&&q("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.d_} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.m_=this.Ci.enqueueAfterDelay(this.timerId,i,()=>(this.f_=Date.now(),e())),this.d_*=this.A_,this.d_<this.R_&&(this.d_=this.R_),this.d_>this.V_&&(this.d_=this.V_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.d_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rh="PersistentStream";class Ph{constructor(e,t,r,i,s,a,c,l){this.Ci=e,this.S_=r,this.b_=i,this.connection=s,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=c,this.listener=l,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new kh(e,t)}x_(){return this.state===1||this.state===5||this.O_()}O_(){return this.state===2||this.state===3}start(){this.F_=0,this.state!==4?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&this.C_===null&&(this.C_=this.Ci.enqueueAfterDelay(this.S_,6e4,()=>this.k_()))}q_(e){this.K_(),this.stream.send(e)}async k_(){if(this.O_())return this.close(0)}K_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,t){this.K_(),this.U_(),this.M_.cancel(),this.D_++,e!==4?this.M_.reset():t&&t.code===N.RESOURCE_EXHAUSTED?(_t(t.toString()),_t("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):t&&t.code===N.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.W_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.t_(t)}W_(){}auth(){this.state=1;const e=this.Q_(this.D_),t=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,i])=>{this.D_===t&&this.G_(r,i)},r=>{e(()=>{const i=new B(N.UNKNOWN,"Fetching auth token failed: "+r.message);return this.z_(i)})})}G_(e,t){const r=this.Q_(this.D_);this.stream=this.j_(e,t),this.stream.Zo(()=>{r(()=>this.listener.Zo())}),this.stream.Yo(()=>{r(()=>(this.state=2,this.v_=this.Ci.enqueueAfterDelay(this.b_,1e4,()=>(this.O_()&&(this.state=3),Promise.resolve())),this.listener.Yo()))}),this.stream.t_(i=>{r(()=>this.z_(i))}),this.stream.onMessage(i=>{r(()=>++this.F_==1?this.J_(i):this.onNext(i))})}N_(){this.state=5,this.M_.p_(async()=>{this.state=0,this.start()})}z_(e){return q(Rh,`close with error: ${e}`),this.stream=null,this.close(4,e)}Q_(e){return t=>{this.Ci.enqueueAndForget(()=>this.D_===e?t():(q(Rh,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class wb extends Ph{constructor(e,t,r,i,s,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,i,a),this.serializer=s}j_(e,t){return this.connection.T_("Listen",e,t)}J_(e){return this.onNext(e)}onNext(e){this.M_.reset();const t=C_(this.serializer,e),r=function(s){if(!("targetChange"in s))return W.min();const a=s.targetChange;return a.targetIds&&a.targetIds.length?W.min():a.readTime?it(a.readTime):W.min()}(e);return this.listener.H_(t,r)}Z_(e){const t={};t.database=oa(this.serializer),t.addTarget=function(s,a){let c;const l=a.target;if(c=Wo(l)?{documents:P_(s,l)}:{query:N_(s,l).ft},c.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){c.resumeToken=lh(s,a.resumeToken);const h=ta(s,a.expectedCount);h!==null&&(c.expectedCount=h)}else if(a.snapshotVersion.compareTo(W.min())>0){c.readTime=vs(s,a.snapshotVersion.toTimestamp());const h=ta(s,a.expectedCount);h!==null&&(c.expectedCount=h)}return c}(this.serializer,e);const r=L_(this.serializer,e);r&&(t.labels=r),this.q_(t)}X_(e){const t={};t.database=oa(this.serializer),t.removeTarget=e,this.q_(t)}}class Tb extends Ph{constructor(e,t,r,i,s,a){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,i,a),this.serializer=s}get Y_(){return this.F_>0}start(){this.lastStreamToken=void 0,super.start()}W_(){this.Y_&&this.ea([])}j_(e,t){return this.connection.T_("Write",e,t)}J_(e){return te(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,te(!e.writeResults||e.writeResults.length===0,55816),this.listener.ta()}onNext(e){te(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.M_.reset();const t=R_(e.writeResults,e.commitTime),r=it(e.commitTime);return this.listener.na(r,t)}ra(){const e={};e.database=oa(this.serializer),this.q_(e)}ea(e){const t={streamToken:this.lastStreamToken,writes:e.map(r=>k_(this.serializer,r))};this.q_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ib{}class xb extends Ib{constructor(e,t,r,i){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=i,this.ia=!1}sa(){if(this.ia)throw new B(N.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(e,t,r,i){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,a])=>this.connection.Wo(e,ra(t,r),i,s,a)).catch(s=>{throw s.name==="FirebaseError"?(s.code===N.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new B(N.UNKNOWN,s.toString())})}jo(e,t,r,i,s){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([a,c])=>this.connection.jo(e,ra(t,r),i,a,c,s)).catch(a=>{throw a.name==="FirebaseError"?(a.code===N.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new B(N.UNKNOWN,a.toString())})}terminate(){this.ia=!0,this.connection.terminate()}}function Ab(n,e,t,r){return new xb(n,e,t,r)}class Sb{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){this.oa===0&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve())))}ha(e){this.state==="Online"?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ca("Offline")))}set(e){this.Pa(),this.oa=0,e==="Online"&&(this.aa=!1),this.ca(e)}ca(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}la(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.aa?(_t(t),this.aa=!1):q("OnlineStateTracker",t)}Pa(){this._a!==null&&(this._a.cancel(),this._a=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const En="RemoteStore";class Cb{constructor(e,t,r,i,s){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.Ta=[],this.Ea=new Map,this.Ia=new Set,this.Ra=[],this.Aa=s,this.Aa.Mo(a=>{r.enqueueAndForget(async()=>{wn(this)&&(q(En,"Restarting streams for network reachability change."),await async function(l){const h=Q(l);h.Ia.add(4),await Yr(h),h.Va.set("Unknown"),h.Ia.delete(4),await ws(h)}(this))})}),this.Va=new Sb(r,i)}}async function ws(n){if(wn(n))for(const e of n.Ra)await e(!0)}async function Yr(n){for(const e of n.Ra)await e(!1)}function Nh(n,e){const t=Q(n);t.Ea.has(e.targetId)||(t.Ea.set(e.targetId,e),va(t)?ya(t):Jn(t).O_()&&ma(t,e))}function ga(n,e){const t=Q(n),r=Jn(t);t.Ea.delete(e),r.O_()&&Dh(t,e),t.Ea.size===0&&(r.O_()?r.L_():wn(t)&&t.Va.set("Unknown"))}function ma(n,e){if(n.da.$e(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(W.min())>0){const t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}Jn(n).Z_(e)}function Dh(n,e){n.da.$e(e),Jn(n).X_(e)}function ya(n){n.da=new E_({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),At:e=>n.Ea.get(e)||null,ht:()=>n.datastore.serializer.databaseId}),Jn(n).start(),n.Va.ua()}function va(n){return wn(n)&&!Jn(n).x_()&&n.Ea.size>0}function wn(n){return Q(n).Ia.size===0}function Lh(n){n.da=void 0}async function kb(n){n.Va.set("Online")}async function Rb(n){n.Ea.forEach((e,t)=>{ma(n,e)})}async function Pb(n,e){Lh(n),va(n)?(n.Va.ha(e),ya(n)):n.Va.set("Unknown")}async function Nb(n,e,t){if(n.Va.set("Online"),e instanceof oh&&e.state===2&&e.cause)try{await async function(i,s){const a=s.cause;for(const c of s.targetIds)i.Ea.has(c)&&(await i.remoteSyncer.rejectListen(c,a),i.Ea.delete(c),i.da.removeTarget(c))}(n,e)}catch(r){q(En,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),await Ts(n,r)}else if(e instanceof ms?n.da.Xe(e):e instanceof sh?n.da.st(e):n.da.tt(e),!t.isEqual(W.min()))try{const r=await Ih(n.localStore);t.compareTo(r)>=0&&await function(s,a){const c=s.da.Tt(a);return c.targetChanges.forEach((l,h)=>{if(l.resumeToken.approximateByteSize()>0){const d=s.Ea.get(h);d&&s.Ea.set(h,d.withResumeToken(l.resumeToken,a))}}),c.targetMismatches.forEach((l,h)=>{const d=s.Ea.get(l);if(!d)return;s.Ea.set(l,d.withResumeToken(Te.EMPTY_BYTE_STRING,d.snapshotVersion)),Dh(s,l);const p=new zt(d.target,l,h,d.sequenceNumber);ma(s,p)}),s.remoteSyncer.applyRemoteEvent(c)}(n,t)}catch(r){q(En,"Failed to raise snapshot:",r),await Ts(n,r)}}async function Ts(n,e,t){if(!zn(e))throw e;n.Ia.add(1),await Yr(n),n.Va.set("Offline"),t||(t=()=>Ih(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{q(En,"Retrying IndexedDB access"),await t(),n.Ia.delete(1),await ws(n)})}function Vh(n,e){return e().catch(t=>Ts(n,t,e))}async function Is(n){const e=Q(n),t=jt(e);let r=e.Ta.length>0?e.Ta[e.Ta.length-1].batchId:Bo;for(;Db(e);)try{const i=await fb(e.localStore,r);if(i===null){e.Ta.length===0&&t.L_();break}r=i.batchId,Lb(e,i)}catch(i){await Ts(e,i)}Oh(e)&&Mh(e)}function Db(n){return wn(n)&&n.Ta.length<10}function Lb(n,e){n.Ta.push(e);const t=jt(n);t.O_()&&t.Y_&&t.ea(e.mutations)}function Oh(n){return wn(n)&&!jt(n).x_()&&n.Ta.length>0}function Mh(n){jt(n).start()}async function Vb(n){jt(n).ra()}async function Ob(n){const e=jt(n);for(const t of n.Ta)e.ea(t.mutations)}async function Mb(n,e,t){const r=n.Ta.shift(),i=Zo.from(r,e,t);await Vh(n,()=>n.remoteSyncer.applySuccessfulWrite(i)),await Is(n)}async function Fb(n,e){e&&jt(n).Y_&&await async function(r,i){if(function(a){return v_(a)&&a!==N.ABORTED}(i.code)){const s=r.Ta.shift();jt(r).B_(),await Vh(r,()=>r.remoteSyncer.rejectFailedWrite(s.batchId,i)),await Is(r)}}(n,e),Oh(n)&&Mh(n)}async function Fh(n,e){const t=Q(n);t.asyncQueue.verifyOperationInProgress(),q(En,"RemoteStore received new credentials");const r=wn(t);t.Ia.add(3),await Yr(t),r&&t.Va.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.Ia.delete(3),await ws(t)}async function Ub(n,e){const t=Q(n);e?(t.Ia.delete(2),await ws(t)):e||(t.Ia.add(2),await Yr(t),t.Va.set("Unknown"))}function Jn(n){return n.ma||(n.ma=function(t,r,i){const s=Q(t);return s.sa(),new wb(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(n.datastore,n.asyncQueue,{Zo:kb.bind(null,n),Yo:Rb.bind(null,n),t_:Pb.bind(null,n),H_:Nb.bind(null,n)}),n.Ra.push(async e=>{e?(n.ma.B_(),va(n)?ya(n):n.Va.set("Unknown")):(await n.ma.stop(),Lh(n))})),n.ma}function jt(n){return n.fa||(n.fa=function(t,r,i){const s=Q(t);return s.sa(),new Tb(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(n.datastore,n.asyncQueue,{Zo:()=>Promise.resolve(),Yo:Vb.bind(null,n),t_:Fb.bind(null,n),ta:Ob.bind(null,n),na:Mb.bind(null,n)}),n.Ra.push(async e=>{e?(n.fa.B_(),await Is(n)):(await n.fa.stop(),n.Ta.length>0&&(q(En,`Stopping write stream with ${n.Ta.length} pending writes`),n.Ta=[]))})),n.fa}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _a{constructor(e,t,r,i,s){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=i,this.removalCallback=s,this.deferred=new bt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(a=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,i,s){const a=Date.now()+r,c=new _a(e,t,a,i,s);return c.start(r),c}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new B(N.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function ba(n,e){if(_t("AsyncQueue",`${e}: ${n}`),zn(n))return new B(N.UNAVAILABLE,`${e}: ${n}`);throw n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zn{static emptySet(e){return new Zn(e.comparator)}constructor(e){this.comparator=e?(t,r)=>e(t,r)||z.comparator(t.key,r.key):(t,r)=>z.comparator(t.key,r.key),this.keyedMap=Br(),this.sortedSet=new ae(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof Zn)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const i=t.getNext().key,s=r.getNext().key;if(!i.isEqual(s))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new Zn;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uh{constructor(){this.ga=new ae(z.comparator)}track(e){const t=e.doc.key,r=this.ga.get(t);r?e.type!==0&&r.type===3?this.ga=this.ga.insert(t,e):e.type===3&&r.type!==1?this.ga=this.ga.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.ga=this.ga.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.ga=this.ga.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.ga=this.ga.remove(t):e.type===1&&r.type===2?this.ga=this.ga.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.ga=this.ga.insert(t,{type:2,doc:e.doc}):G(63341,{Vt:e,pa:r}):this.ga=this.ga.insert(t,e)}ya(){const e=[];return this.ga.inorderTraversal((t,r)=>{e.push(r)}),e}}class er{constructor(e,t,r,i,s,a,c,l,h){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=i,this.mutatedKeys=s,this.fromCache=a,this.syncStateChanged=c,this.excludesMetadataChanges=l,this.hasCachedResults=h}static fromInitialDocuments(e,t,r,i,s){const a=[];return t.forEach(c=>{a.push({type:0,doc:c})}),new er(e,t,Zn.emptySet(t),a,r,i,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&ls(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let i=0;i<t.length;i++)if(t[i].type!==r[i].type||!t[i].doc.isEqual(r[i].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bb{constructor(){this.wa=void 0,this.Sa=[]}ba(){return this.Sa.some(e=>e.Da())}}class qb{constructor(){this.queries=Bh(),this.onlineState="Unknown",this.Ca=new Set}terminate(){(function(t,r){const i=Q(t),s=i.queries;i.queries=Bh(),s.forEach((a,c)=>{for(const l of c.Sa)l.onError(r)})})(this,new B(N.ABORTED,"Firestore shutting down"))}}function Bh(){return new vn(n=>Uu(n),ls)}async function qh(n,e){const t=Q(n);let r=3;const i=e.query;let s=t.queries.get(i);s?!s.ba()&&e.Da()&&(r=2):(s=new Bb,r=e.Da()?0:1);try{switch(r){case 0:s.wa=await t.onListen(i,!0);break;case 1:s.wa=await t.onListen(i,!1);break;case 2:await t.onFirstRemoteStoreListen(i)}}catch(a){const c=ba(a,`Initialization of query '${Gn(e.query)}' failed`);return void e.onError(c)}t.queries.set(i,s),s.Sa.push(e),e.va(t.onlineState),s.wa&&e.Fa(s.wa)&&Ea(t)}async function $h(n,e){const t=Q(n),r=e.query;let i=3;const s=t.queries.get(r);if(s){const a=s.Sa.indexOf(e);a>=0&&(s.Sa.splice(a,1),s.Sa.length===0?i=e.Da()?0:1:!s.ba()&&e.Da()&&(i=2))}switch(i){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function $b(n,e){const t=Q(n);let r=!1;for(const i of e){const s=i.query,a=t.queries.get(s);if(a){for(const c of a.Sa)c.Fa(i)&&(r=!0);a.wa=i}}r&&Ea(t)}function Hb(n,e,t){const r=Q(n),i=r.queries.get(e);if(i)for(const s of i.Sa)s.onError(t);r.queries.delete(e)}function Ea(n){n.Ca.forEach(e=>{e.next()})}var wa,Hh;(Hh=wa||(wa={})).Ma="default",Hh.Cache="cache";class zh{constructor(e,t,r){this.query=e,this.xa=t,this.Oa=!1,this.Na=null,this.onlineState="Unknown",this.options=r||{}}Fa(e){if(!this.options.includeMetadataChanges){const r=[];for(const i of e.docChanges)i.type!==3&&r.push(i);e=new er(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Oa?this.Ba(e)&&(this.xa.next(e),t=!0):this.La(e,this.onlineState)&&(this.ka(e),t=!0),this.Na=e,t}onError(e){this.xa.error(e)}va(e){this.onlineState=e;let t=!1;return this.Na&&!this.Oa&&this.La(this.Na,e)&&(this.ka(this.Na),t=!0),t}La(e,t){if(!e.fromCache||!this.Da())return!0;const r=t!=="Offline";return(!this.options.qa||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Ba(e){if(e.docChanges.length>0)return!0;const t=this.Na&&this.Na.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}ka(e){e=er.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Oa=!0,this.xa.next(e)}Da(){return this.options.source!==wa.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jh{constructor(e){this.key=e}}class Kh{constructor(e){this.key=e}}class zb{constructor(e,t){this.query=e,this.Za=t,this.Xa=null,this.hasCachedResults=!1,this.current=!1,this.Ya=Z(),this.mutatedKeys=Z(),this.eu=Bu(e),this.tu=new Zn(this.eu)}get nu(){return this.Za}ru(e,t){const r=t?t.iu:new Uh,i=t?t.tu:this.tu;let s=t?t.mutatedKeys:this.mutatedKeys,a=i,c=!1;const l=this.query.limitType==="F"&&i.size===this.query.limit?i.last():null,h=this.query.limitType==="L"&&i.size===this.query.limit?i.first():null;if(e.inorderTraversal((d,p)=>{const y=i.get(d),I=us(this.query,p)?p:null,T=!!y&&this.mutatedKeys.has(y.key),R=!!I&&(I.hasLocalMutations||this.mutatedKeys.has(I.key)&&I.hasCommittedMutations);let x=!1;y&&I?y.data.isEqual(I.data)?T!==R&&(r.track({type:3,doc:I}),x=!0):this.su(y,I)||(r.track({type:2,doc:I}),x=!0,(l&&this.eu(I,l)>0||h&&this.eu(I,h)<0)&&(c=!0)):!y&&I?(r.track({type:0,doc:I}),x=!0):y&&!I&&(r.track({type:1,doc:y}),x=!0,(l||h)&&(c=!0)),x&&(I?(a=a.add(I),s=R?s.add(d):s.delete(d)):(a=a.delete(d),s=s.delete(d)))}),this.query.limit!==null)for(;a.size>this.query.limit;){const d=this.query.limitType==="F"?a.last():a.first();a=a.delete(d.key),s=s.delete(d.key),r.track({type:1,doc:d})}return{tu:a,iu:r,bs:c,mutatedKeys:s}}su(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,i){const s=this.tu;this.tu=e.tu,this.mutatedKeys=e.mutatedKeys;const a=e.iu.ya();a.sort((d,p)=>function(I,T){const R=x=>{switch(x){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return G(20277,{Vt:x})}};return R(I)-R(T)}(d.type,p.type)||this.eu(d.doc,p.doc)),this.ou(r),i=i??!1;const c=t&&!i?this._u():[],l=this.Ya.size===0&&this.current&&!i?1:0,h=l!==this.Xa;return this.Xa=l,a.length!==0||h?{snapshot:new er(this.query,e.tu,s,a,e.mutatedKeys,l===0,h,!1,!!r&&r.resumeToken.approximateByteSize()>0),au:c}:{au:c}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({tu:this.tu,iu:new Uh,mutatedKeys:this.mutatedKeys,bs:!1},!1)):{au:[]}}uu(e){return!this.Za.has(e)&&!!this.tu.has(e)&&!this.tu.get(e).hasLocalMutations}ou(e){e&&(e.addedDocuments.forEach(t=>this.Za=this.Za.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Za=this.Za.delete(t)),this.current=e.current)}_u(){if(!this.current)return[];const e=this.Ya;this.Ya=Z(),this.tu.forEach(r=>{this.uu(r.key)&&(this.Ya=this.Ya.add(r.key))});const t=[];return e.forEach(r=>{this.Ya.has(r)||t.push(new Kh(r))}),this.Ya.forEach(r=>{e.has(r)||t.push(new jh(r))}),t}cu(e){this.Za=e.ks,this.Ya=Z();const t=this.ru(e.documents);return this.applyChanges(t,!0)}lu(){return er.fromInitialDocuments(this.query,this.tu,this.mutatedKeys,this.Xa===0,this.hasCachedResults)}}const Ta="SyncEngine";class jb{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class Kb{constructor(e){this.key=e,this.hu=!1}}class Gb{constructor(e,t,r,i,s,a){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=i,this.currentUser=s,this.maxConcurrentLimboResolutions=a,this.Pu={},this.Tu=new vn(c=>Uu(c),ls),this.Eu=new Map,this.Iu=new Set,this.Ru=new ae(z.comparator),this.Au=new Map,this.Vu=new aa,this.du={},this.mu=new Map,this.fu=Yn.ar(),this.onlineState="Unknown",this.gu=void 0}get isPrimaryClient(){return this.gu===!0}}async function Wb(n,e,t=!0){const r=ed(n);let i;const s=r.Tu.get(e);return s?(r.sharedClientState.addLocalQueryTarget(s.targetId),i=s.view.lu()):i=await Gh(r,e,t,!0),i}async function Qb(n,e){const t=ed(n);await Gh(t,e,!0,!1)}async function Gh(n,e,t,r){const i=await pb(n.localStore,rt(e)),s=i.targetId,a=n.sharedClientState.addLocalQueryTarget(s,t);let c;return r&&(c=await Yb(n,e,s,a==="current",i.resumeToken)),n.isPrimaryClient&&t&&Nh(n.remoteStore,i),c}async function Yb(n,e,t,r,i){n.pu=(p,y,I)=>async function(R,x,k,O){let D=x.view.ru(k);D.bs&&(D=await xh(R.localStore,x.query,!1).then(({documents:_})=>x.view.ru(_,D)));const F=O&&O.targetChanges.get(x.targetId),H=O&&O.targetMismatches.get(x.targetId)!=null,j=x.view.applyChanges(D,R.isPrimaryClient,F,H);return Zh(R,x.targetId,j.au),j.snapshot}(n,p,y,I);const s=await xh(n.localStore,e,!0),a=new zb(e,s.ks),c=a.ru(s.documents),l=Wr.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",i),h=a.applyChanges(c,n.isPrimaryClient,l);Zh(n,t,h.au);const d=new jb(e,t,a);return n.Tu.set(e,d),n.Eu.has(t)?n.Eu.get(t).push(e):n.Eu.set(t,[e]),h.snapshot}async function Xb(n,e,t){const r=Q(n),i=r.Tu.get(e),s=r.Eu.get(i.targetId);if(s.length>1)return r.Eu.set(i.targetId,s.filter(a=>!ls(a,e))),void r.Tu.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(i.targetId),r.sharedClientState.isActiveQueryTarget(i.targetId)||await ha(r.localStore,i.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(i.targetId),t&&ga(r.remoteStore,i.targetId),Ia(r,i.targetId)}).catch(Hn)):(Ia(r,i.targetId),await ha(r.localStore,i.targetId,!0))}async function Jb(n,e){const t=Q(n),r=t.Tu.get(e),i=t.Eu.get(r.targetId);t.isPrimaryClient&&i.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),ga(t.remoteStore,r.targetId))}async function Zb(n,e,t){const r=oE(n);try{const i=await function(a,c){const l=Q(a),h=se.now(),d=c.reduce((I,T)=>I.add(T.key),Z());let p,y;return l.persistence.runTransaction("Locally write mutations","readwrite",I=>{let T=Et(),R=Z();return l.xs.getEntries(I,d).next(x=>{T=x,T.forEach((k,O)=>{O.isValidDocument()||(R=R.add(k))})}).next(()=>l.localDocuments.getOverlayedDocuments(I,T)).next(x=>{p=x;const k=[];for(const O of c){const D=f_(O,p.get(O.key).overlayedDocument);D!=null&&k.push(new bn(O.key,D,Su(D.value.mapValue),wt.exists(!0)))}return l.mutationQueue.addMutationBatch(I,h,k,c)}).next(x=>{y=x;const k=x.applyToLocalDocumentSet(p,R);return l.documentOverlayCache.saveOverlays(I,x.batchId,k)})}).then(()=>({batchId:y.batchId,changes:$u(p)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(i.batchId),function(a,c,l){let h=a.du[a.currentUser.toKey()];h||(h=new ae(J)),h=h.insert(c,l),a.du[a.currentUser.toKey()]=h}(r,i.batchId,t),await Xr(r,i.changes),await Is(r.remoteStore)}catch(i){const s=ba(i,"Failed to persist write");t.reject(s)}}async function Wh(n,e){const t=Q(n);try{const r=await hb(t.localStore,e);e.targetChanges.forEach((i,s)=>{const a=t.Au.get(s);a&&(te(i.addedDocuments.size+i.modifiedDocuments.size+i.removedDocuments.size<=1,22616),i.addedDocuments.size>0?a.hu=!0:i.modifiedDocuments.size>0?te(a.hu,14607):i.removedDocuments.size>0&&(te(a.hu,42227),a.hu=!1))}),await Xr(t,r,e)}catch(r){await Hn(r)}}function Qh(n,e,t){const r=Q(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const i=[];r.Tu.forEach((s,a)=>{const c=a.view.va(e);c.snapshot&&i.push(c.snapshot)}),function(a,c){const l=Q(a);l.onlineState=c;let h=!1;l.queries.forEach((d,p)=>{for(const y of p.Sa)y.va(c)&&(h=!0)}),h&&Ea(l)}(r.eventManager,e),i.length&&r.Pu.H_(i),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function eE(n,e,t){const r=Q(n);r.sharedClientState.updateQueryState(e,"rejected",t);const i=r.Au.get(e),s=i&&i.key;if(s){let a=new ae(z.comparator);a=a.insert(s,Ae.newNoDocument(s,W.min()));const c=Z().add(s),l=new gs(W.min(),new Map,new ae(J),a,c);await Wh(r,l),r.Ru=r.Ru.remove(s),r.Au.delete(e),xa(r)}else await ha(r.localStore,e,!1).then(()=>Ia(r,e,t)).catch(Hn)}async function tE(n,e){const t=Q(n),r=e.batch.batchId;try{const i=await ub(t.localStore,e);Xh(t,r,null),Yh(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await Xr(t,i)}catch(i){await Hn(i)}}async function nE(n,e,t){const r=Q(n);try{const i=await function(a,c){const l=Q(a);return l.persistence.runTransaction("Reject batch","readwrite-primary",h=>{let d;return l.mutationQueue.lookupMutationBatch(h,c).next(p=>(te(p!==null,37113),d=p.keys(),l.mutationQueue.removeMutationBatch(h,p))).next(()=>l.mutationQueue.performConsistencyCheck(h)).next(()=>l.documentOverlayCache.removeOverlaysForBatchId(h,d,c)).next(()=>l.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(h,d)).next(()=>l.localDocuments.getDocuments(h,d))})}(r.localStore,e);Xh(r,e,t),Yh(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await Xr(r,i)}catch(i){await Hn(i)}}function Yh(n,e){(n.mu.get(e)||[]).forEach(t=>{t.resolve()}),n.mu.delete(e)}function Xh(n,e,t){const r=Q(n);let i=r.du[r.currentUser.toKey()];if(i){const s=i.get(e);s&&(t?s.reject(t):s.resolve(),i=i.remove(e)),r.du[r.currentUser.toKey()]=i}}function Ia(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Eu.get(e))n.Tu.delete(r),t&&n.Pu.yu(r,t);n.Eu.delete(e),n.isPrimaryClient&&n.Vu.Gr(e).forEach(r=>{n.Vu.containsKey(r)||Jh(n,r)})}function Jh(n,e){n.Iu.delete(e.path.canonicalString());const t=n.Ru.get(e);t!==null&&(ga(n.remoteStore,t),n.Ru=n.Ru.remove(e),n.Au.delete(t),xa(n))}function Zh(n,e,t){for(const r of t)r instanceof jh?(n.Vu.addReference(r.key,e),rE(n,r)):r instanceof Kh?(q(Ta,"Document no longer in limbo: "+r.key),n.Vu.removeReference(r.key,e),n.Vu.containsKey(r.key)||Jh(n,r.key)):G(19791,{wu:r})}function rE(n,e){const t=e.key,r=t.path.canonicalString();n.Ru.get(t)||n.Iu.has(r)||(q(Ta,"New document in limbo: "+t),n.Iu.add(r),xa(n))}function xa(n){for(;n.Iu.size>0&&n.Ru.size<n.maxConcurrentLimboResolutions;){const e=n.Iu.values().next().value;n.Iu.delete(e);const t=new z(ie.fromString(e)),r=n.fu.next();n.Au.set(r,new Kb(t)),n.Ru=n.Ru.insert(t,r),Nh(n.remoteStore,new zt(rt(Qo(t.path)),r,"TargetPurposeLimboResolution",Xi.ce))}}async function Xr(n,e,t){const r=Q(n),i=[],s=[],a=[];r.Tu.isEmpty()||(r.Tu.forEach((c,l)=>{a.push(r.pu(l,e,t).then(h=>{var d;if((h||t)&&r.isPrimaryClient){const p=h?!h.fromCache:(d=t==null?void 0:t.targetChanges.get(l.targetId))==null?void 0:d.current;r.sharedClientState.updateQueryState(l.targetId,p?"current":"not-current")}if(h){i.push(h);const p=la.Is(l.targetId,h);s.push(p)}}))}),await Promise.all(a),r.Pu.H_(i),await async function(l,h){const d=Q(l);try{await d.persistence.runTransaction("notifyLocalViewChanges","readwrite",p=>L.forEach(h,y=>L.forEach(y.Ts,I=>d.persistence.referenceDelegate.addReference(p,y.targetId,I)).next(()=>L.forEach(y.Es,I=>d.persistence.referenceDelegate.removeReference(p,y.targetId,I)))))}catch(p){if(!zn(p))throw p;q(ua,"Failed to update sequence numbers: "+p)}for(const p of h){const y=p.targetId;if(!p.fromCache){const I=d.vs.get(y),T=I.snapshotVersion,R=I.withLastLimboFreeSnapshotVersion(T);d.vs=d.vs.insert(y,R)}}}(r.localStore,s))}async function iE(n,e){const t=Q(n);if(!t.currentUser.isEqual(e)){q(Ta,"User change. New user:",e.toKey());const r=await Th(t.localStore,e);t.currentUser=e,function(s,a){s.mu.forEach(c=>{c.forEach(l=>{l.reject(new B(N.CANCELLED,a))})}),s.mu.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await Xr(t,r.Ns)}}function sE(n,e){const t=Q(n),r=t.Au.get(e);if(r&&r.hu)return Z().add(r.key);{let i=Z();const s=t.Eu.get(e);if(!s)return i;for(const a of s){const c=t.Tu.get(a);i=i.unionWith(c.view.nu)}return i}}function ed(n){const e=Q(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=Wh.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=sE.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=eE.bind(null,e),e.Pu.H_=$b.bind(null,e.eventManager),e.Pu.yu=Hb.bind(null,e.eventManager),e}function oE(n){const e=Q(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=tE.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=nE.bind(null,e),e}class xs{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Es(e.databaseInfo.databaseId),this.sharedClientState=this.Du(e),this.persistence=this.Cu(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Fu(e,this.localStore),this.indexBackfillerScheduler=this.Mu(e,this.localStore)}Fu(e,t){return null}Mu(e,t){return null}vu(e){return lb(this.persistence,new ob,e.initialUser,this.serializer)}Cu(e){return new wh(ca.Vi,this.serializer)}Du(e){return new mb}async terminate(){var e,t;(e=this.gcScheduler)==null||e.stop(),(t=this.indexBackfillerScheduler)==null||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}xs.provider={build:()=>new xs};class aE extends xs{constructor(e){super(),this.cacheSizeBytes=e}Fu(e,t){te(this.persistence.referenceDelegate instanceof _s,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new j_(r,e.asyncQueue,t)}Cu(e){const t=this.cacheSizeBytes!==void 0?Ve.withCacheSize(this.cacheSizeBytes):Ve.DEFAULT;return new wh(r=>_s.Vi(r,t),this.serializer)}}class Aa{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Qh(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=iE.bind(null,this.syncEngine),await Ub(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new qb}()}createDatastore(e){const t=Es(e.databaseInfo.databaseId),r=Eb(e.databaseInfo);return Ab(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return function(r,i,s,a,c){return new Cb(r,i,s,a,c)}(this.localStore,this.datastore,e.asyncQueue,t=>Qh(this.syncEngine,t,0),function(){return Ch.v()?new Ch:new yb}())}createSyncEngine(e,t){return function(i,s,a,c,l,h,d){const p=new Gb(i,s,a,c,l,h);return d&&(p.gu=!0),p}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(i){const s=Q(i);q(En,"RemoteStore shutting down."),s.Ia.add(5),await Yr(s),s.Aa.shutdown(),s.Va.set("Unknown")}(this.remoteStore),(e=this.datastore)==null||e.terminate(),(t=this.eventManager)==null||t.terminate()}}Aa.provider={build:()=>new Aa};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class td{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ou(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ou(this.observer.error,e):_t("Uncaught Error in snapshot listener:",e.toString()))}Nu(){this.muted=!0}Ou(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Kt="FirestoreClient";class cE{constructor(e,t,r,i,s){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this._databaseInfo=i,this.user=xe.UNAUTHENTICATED,this.clientId=Mo.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(r,async a=>{q(Kt,"Received user=",a.uid),await this.authCredentialListener(a),this.user=a}),this.appCheckCredentials.start(r,a=>(q(Kt,"Received new app check token=",a),this.appCheckCredentialListener(a,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new bt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=ba(t,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function Sa(n,e){n.asyncQueue.verifyOperationInProgress(),q(Kt,"Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener(async i=>{r.isEqual(i)||(await Th(e.localStore,i),r=i)}),e.persistence.setDatabaseDeletedListener(()=>n.terminate()),n._offlineComponents=e}async function nd(n,e){n.asyncQueue.verifyOperationInProgress();const t=await lE(n);q(Kt,"Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener(r=>Fh(e.remoteStore,r)),n.setAppCheckTokenChangeListener((r,i)=>Fh(e.remoteStore,i)),n._onlineComponents=e}async function lE(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){q(Kt,"Using user provided OfflineComponentProvider");try{await Sa(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(i){return i.name==="FirebaseError"?i.code===N.FAILED_PRECONDITION||i.code===N.UNIMPLEMENTED:!(typeof DOMException<"u"&&i instanceof DOMException)||i.code===22||i.code===20||i.code===11}(t))throw t;gn("Error using user provided cache. Falling back to memory cache: "+t),await Sa(n,new xs)}}else q(Kt,"Using default OfflineComponentProvider"),await Sa(n,new aE(void 0));return n._offlineComponents}async function rd(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(q(Kt,"Using user provided OnlineComponentProvider"),await nd(n,n._uninitializedComponentsProvider._online)):(q(Kt,"Using default OnlineComponentProvider"),await nd(n,new Aa))),n._onlineComponents}function uE(n){return rd(n).then(e=>e.syncEngine)}async function id(n){const e=await rd(n),t=e.eventManager;return t.onListen=Wb.bind(null,e.syncEngine),t.onUnlisten=Xb.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=Qb.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=Jb.bind(null,e.syncEngine),t}function hE(n,e,t={}){const r=new bt;return n.asyncQueue.enqueueAndForget(async()=>function(s,a,c,l,h){const d=new td({next:y=>{d.Nu(),a.enqueueAndForget(()=>$h(s,p));const I=y.docs.has(c);!I&&y.fromCache?h.reject(new B(N.UNAVAILABLE,"Failed to get document because the client is offline.")):I&&y.fromCache&&l&&l.source==="server"?h.reject(new B(N.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):h.resolve(y)},error:y=>h.reject(y)}),p=new zh(Qo(c.path),d,{includeMetadataChanges:!0,qa:!0});return qh(s,p)}(await id(n),n.asyncQueue,e,t,r)),r.promise}function dE(n,e,t={}){const r=new bt;return n.asyncQueue.enqueueAndForget(async()=>function(s,a,c,l,h){const d=new td({next:y=>{d.Nu(),a.enqueueAndForget(()=>$h(s,p)),y.fromCache&&l.source==="server"?h.reject(new B(N.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):h.resolve(y)},error:y=>h.reject(y)}),p=new zh(c,d,{includeMetadataChanges:!0,qa:!0});return qh(s,p)}(await id(n),n.asyncQueue,e,t,r)),r.promise}function fE(n,e){const t=new bt;return n.asyncQueue.enqueueAndForget(async()=>Zb(await uE(n),e,t)),t.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sd(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pE="ComponentProvider",od=new Map;function gE(n,e,t,r,i){return new Vv(n,e,t,i.host,i.ssl,i.experimentalForceLongPolling,i.experimentalAutoDetectLongPolling,sd(i.experimentalLongPollingOptions),i.useFetchStreams,i.isUsingEmulator,r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ad="firestore.googleapis.com",cd=!0;class ld{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new B(N.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=ad,this.ssl=cd}else this.host=e.host,this.ssl=e.ssl??cd;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=_h;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<H_)throw new B(N.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Iv("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=sd(e.experimentalLongPollingOptions??{}),function(r){if(r.timeoutSeconds!==void 0){if(isNaN(r.timeoutSeconds))throw new B(N.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (must not be NaN)`);if(r.timeoutSeconds<5)throw new B(N.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (minimum allowed value is 5)`);if(r.timeoutSeconds>30)throw new B(N.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,i){return r.timeoutSeconds===i.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class As{constructor(e,t,r,i){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new ld({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new B(N.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new B(N.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new ld(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new pv;switch(r.type){case"firstParty":return new vv(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new B(N.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const r=od.get(t);r&&(q(pE,"Removing Datastore"),od.delete(t),r.terminate())}(this),Promise.resolve()}}function mE(n,e,t,r={}){var h;n=mn(n,As);const i=wr(e),s=n._getSettings(),a={...s,emulatorOptions:n._getEmulatorOptions()},c=`${e}:${t}`;i&&Dc(`https://${c}`),s.host!==ad&&s.host!==c&&gn("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const l={...s,host:c,ssl:i,emulatorOptions:r};if(!cn(l,a)&&(n._setSettings(l),r.mockUserToken)){let d,p;if(typeof r.mockUserToken=="string")d=r.mockUserToken,p=xe.MOCK_USER;else{d=xp(r.mockUserToken,(h=n._app)==null?void 0:h.options.projectId);const y=r.mockUserToken.sub||r.mockUserToken.user_id;if(!y)throw new B(N.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");p=new xe(y)}n._authCredentials=new gv(new tu(d,p))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tr{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new tr(this.firestore,e,this._query)}}class pe{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Gt(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new pe(this.firestore,e,this._key)}toJSON(){return{type:pe._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,r){if(Nr(t,pe._jsonSchema))return new pe(e,r||null,new z(ie.fromString(t.referencePath)))}}pe._jsonSchemaVersion="firestore/documentReference/1.0",pe._jsonSchema={type:he("string",pe._jsonSchemaVersion),referencePath:he("string")};class Gt extends tr{constructor(e,t,r){super(e,t,Qo(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new pe(this.firestore,null,new z(e))}withConverter(e){return new Gt(this.firestore,e,this._path)}}function ud(n,e,...t){if(n=Re(n),iu("collection","path",e),n instanceof As){const r=ie.fromString(e,...t);return ou(r),new Gt(n,null,r)}{if(!(n instanceof pe||n instanceof Gt))throw new B(N.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(ie.fromString(e,...t));return ou(r),new Gt(n.firestore,null,r)}}function Wt(n,e,...t){if(n=Re(n),arguments.length===1&&(e=Mo.newId()),iu("doc","path",e),n instanceof As){const r=ie.fromString(e,...t);return su(r),new pe(n,null,new z(r))}{if(!(n instanceof pe||n instanceof Gt))throw new B(N.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(ie.fromString(e,...t));return su(r),new pe(n.firestore,n instanceof Gt?n.converter:null,new z(r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hd="AsyncQueue";class dd{constructor(e=Promise.resolve()){this.Yu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new kh(this,"async_queue_retry"),this._c=()=>{const r=pa();r&&q(hd,"Visibility state changed to "+r.visibilityState),this.M_.w_()},this.ac=e;const t=pa();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.uc(),this.cc(e)}enterRestrictedMode(e){if(!this.ec){this.ec=!0,this.sc=e||!1;const t=pa();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this._c)}}enqueue(e){if(this.uc(),this.ec)return new Promise(()=>{});const t=new bt;return this.cc(()=>this.ec&&this.sc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Yu.push(e),this.lc()))}async lc(){if(this.Yu.length!==0){try{await this.Yu[0](),this.Yu.shift(),this.M_.reset()}catch(e){if(!zn(e))throw e;q(hd,"Operation failed with retryable error: "+e)}this.Yu.length>0&&this.M_.p_(()=>this.lc())}}cc(e){const t=this.ac.then(()=>(this.rc=!0,e().catch(r=>{throw this.nc=r,this.rc=!1,_t("INTERNAL UNHANDLED ERROR: ",fd(r)),r}).then(r=>(this.rc=!1,r))));return this.ac=t,t}enqueueAfterDelay(e,t,r){this.uc(),this.oc.indexOf(e)>-1&&(t=0);const i=_a.createAndSchedule(this,e,t,r,s=>this.hc(s));return this.tc.push(i),i}uc(){this.nc&&G(47125,{Pc:fd(this.nc)})}verifyOperationInProgress(){}async Tc(){let e;do e=this.ac,await e;while(e!==this.ac)}Ec(e){for(const t of this.tc)if(t.timerId===e)return!0;return!1}Ic(e){return this.Tc().then(()=>{this.tc.sort((t,r)=>t.targetTimeMs-r.targetTimeMs);for(const t of this.tc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.Tc()})}Rc(e){this.oc.push(e)}hc(e){const t=this.tc.indexOf(e);this.tc.splice(t,1)}}function fd(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}class Ss extends As{constructor(e,t,r,i){super(e,t,r,i),this.type="firestore",this._queue=new dd,this._persistenceKey=(i==null?void 0:i.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new dd(e),this._firestoreClient=void 0,await e}}}function yE(n,e){const t=typeof n=="object"?n:$c(),r=typeof n=="string"?n:ns,i=_o(t,"firestore").getImmediate({identifier:r});if(!i._initialized){const s=Tp("firestore");s&&mE(i,...s)}return i}function Ca(n){if(n._terminated)throw new B(N.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||vE(n),n._firestoreClient}function vE(n){var r,i,s,a;const e=n._freezeSettings(),t=gE(n._databaseId,((r=n._app)==null?void 0:r.options.appId)||"",n._persistenceKey,(i=n._app)==null?void 0:i.options.apiKey,e);n._componentsProvider||(s=e.localCache)!=null&&s._offlineComponentProvider&&((a=e.localCache)!=null&&a._onlineComponentProvider)&&(n._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),n._firestoreClient=new cE(n._authCredentials,n._appCheckCredentials,n._queue,t,n._componentsProvider&&function(l){const h=l==null?void 0:l._online.build();return{_offline:l==null?void 0:l._offline.build(h),_online:h}}(n._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ze{constructor(e){this._byteString=e}static fromBase64String(e){try{return new ze(Te.fromBase64String(e))}catch(t){throw new B(N.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new ze(Te.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:ze._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(Nr(e,ze._jsonSchema))return ze.fromBase64String(e.bytes)}}ze._jsonSchemaVersion="firestore/bytes/1.0",ze._jsonSchema={type:he("string",ze._jsonSchemaVersion),bytes:he("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pd{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new B(N.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Ee(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ka{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class st{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new B(N.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new B(N.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return J(this._lat,e._lat)||J(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:st._jsonSchemaVersion}}static fromJSON(e){if(Nr(e,st._jsonSchema))return new st(e.latitude,e.longitude)}}st._jsonSchemaVersion="firestore/geoPoint/1.0",st._jsonSchema={type:he("string",st._jsonSchemaVersion),latitude:he("number"),longitude:he("number")};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Je{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,i){if(r.length!==i.length)return!1;for(let s=0;s<r.length;++s)if(r[s]!==i[s])return!1;return!0}(this._values,e._values)}toJSON(){return{type:Je._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(Nr(e,Je._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(t=>typeof t=="number"))return new Je(e.vectorValues);throw new B(N.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}Je._jsonSchemaVersion="firestore/vectorValue/1.0",Je._jsonSchema={type:he("string",Je._jsonSchemaVersion),vectorValues:he("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _E=/^__.*__$/;class bE{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new bn(e,this.data,this.fieldMask,t,this.fieldTransforms):new Kr(e,this.data,t,this.fieldTransforms)}}function gd(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw G(40011,{dataSource:n})}}class Ra{constructor(e,t,r,i,s,a){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=i,s===void 0&&this.Ac(),this.fieldTransforms=s||[],this.fieldMask=a||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}i(e){return new Ra({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}dc(e){var i;const t=(i=this.path)==null?void 0:i.child(e),r=this.i({path:t,arrayElement:!1});return r.mc(e),r}fc(e){var i;const t=(i=this.path)==null?void 0:i.child(e),r=this.i({path:t,arrayElement:!1});return r.Ac(),r}gc(e){return this.i({path:void 0,arrayElement:!0})}yc(e){return ks(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}Ac(){if(this.path)for(let e=0;e<this.path.length;e++)this.mc(this.path.get(e))}mc(e){if(e.length===0)throw this.yc("Document fields must not be empty");if(gd(this.dataSource)&&_E.test(e))throw this.yc('Document fields cannot begin and end with "__"')}}class EE{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||Es(e)}I(e,t,r,i=!1){return new Ra({dataSource:e,methodName:t,targetDoc:r,path:Ee.emptyPath(),arrayElement:!1,hasConverter:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function md(n){const e=n._freezeSettings(),t=Es(n._databaseId);return new EE(n._databaseId,!!e.ignoreUndefinedProperties,t)}function wE(n,e,t,r,i,s={}){const a=n.I(s.merge||s.mergeFields?2:0,e,t,i);_d("Data must be an object, but it was:",a,r);const c=yd(r,a);let l,h;if(s.merge)l=new Ye(a.fieldMask),h=a.fieldTransforms;else if(s.mergeFields){const d=[];for(const p of s.mergeFields){const y=Cs(e,p,t);if(!a.contains(y))throw new B(N.INVALID_ARGUMENT,`Field '${y}' is specified in your field mask but missing from your input data.`);AE(d,y)||d.push(y)}l=new Ye(d),h=a.fieldTransforms.filter(p=>l.covers(p.field))}else l=null,h=a.fieldTransforms;return new bE(new He(c),l,h)}class Pa extends ka{_toFieldTransform(e){return new l_(e.path,new $r)}isEqual(e){return e instanceof Pa}}function TE(n,e,t,r=!1){return Na(t,n.I(r?4:3,e))}function Na(n,e){if(vd(n=Re(n)))return _d("Unsupported field value:",e,n),yd(n,e);if(n instanceof ka)return function(r,i){if(!gd(i.dataSource))throw i.yc(`${r._methodName}() can only be used with update() and set()`);if(!i.path)throw i.yc(`${r._methodName}() is not currently supported inside arrays`);const s=r._toFieldTransform(i);s&&i.fieldTransforms.push(s)}(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.yc("Nested arrays are not supported");return function(r,i){const s=[];let a=0;for(const c of r){let l=Na(c,i.gc(a));l==null&&(l={nullValue:"NULL_VALUE"}),s.push(l),a++}return{arrayValue:{values:s}}}(n,e)}return function(r,i){if((r=Re(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return o_(i.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const s=se.fromDate(r);return{timestampValue:vs(i.serializer,s)}}if(r instanceof se){const s=new se(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:vs(i.serializer,s)}}if(r instanceof st)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof ze)return{bytesValue:lh(i.serializer,r._byteString)};if(r instanceof pe){const s=i.databaseId,a=r.firestore._databaseId;if(!a.isEqual(s))throw i.yc(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${s.projectId}/${s.database}`);return{referenceValue:na(r.firestore._databaseId||i.databaseId,r._key.path)}}if(r instanceof Je)return function(a,c){const l=a instanceof Je?a.toArray():a;return{mapValue:{fields:{[bu]:{stringValue:Eu},[is]:{arrayValue:{values:l.map(d=>{if(typeof d!="number")throw c.yc("VectorValues must only contain numeric values.");return Jo(c.serializer,d)})}}}}}}(r,i);if(yh(r))return r._toProto(i.serializer);throw i.yc(`Unsupported field value: ${Yi(r)}`)}(n,e)}function yd(n,e){const t={};return fu(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):yn(n,(r,i)=>{const s=Na(i,e.dc(r));s!=null&&(t[r]=s)}),{mapValue:{fields:t}}}function vd(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof se||n instanceof st||n instanceof ze||n instanceof pe||n instanceof ka||n instanceof Je||yh(n))}function _d(n,e,t){if(!vd(t)||!au(t)){const r=Yi(t);throw r==="an object"?e.yc(n+" a custom object"):e.yc(n+" "+r)}}function Cs(n,e,t){if((e=Re(e))instanceof pd)return e._internalPath;if(typeof e=="string")return xE(n,e);throw ks("Field path arguments must be of type string or ",n,!1,void 0,t)}const IE=new RegExp("[~\\*/\\[\\]]");function xE(n,e,t){if(e.search(IE)>=0)throw ks(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new pd(...e.split("."))._internalPath}catch{throw ks(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function ks(n,e,t,r,i){const s=r&&!r.isEmpty(),a=i!==void 0;let c=`Function ${e}() called with invalid data`;t&&(c+=" (via `toFirestore()`)"),c+=". ";let l="";return(s||a)&&(l+=" (found",s&&(l+=` in field ${r}`),a&&(l+=` in document ${i}`),l+=")"),new B(N.INVALID_ARGUMENT,c+n+l)}function AE(n,e){return n.some(t=>t.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class SE{convertValue(e,t="none"){switch(Ht(e)){case 0:return null;case 1:return e.booleanValue;case 2:return le(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes($t(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw G(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return yn(e,(i,s)=>{r[i]=this.convertValue(s,t)}),r}convertVectorValue(e){var r,i,s;const t=(s=(i=(r=e.fields)==null?void 0:r[is].arrayValue)==null?void 0:i.values)==null?void 0:s.map(a=>le(a.doubleValue));return new Je(t)}convertGeoPoint(e){return new st(le(e.latitude),le(e.longitude))}convertArray(e,t){return(e.values||[]).map(r=>this.convertValue(r,t))}convertServerTimestamp(e,t){switch(t){case"previous":const r=ts(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(Lr(e));default:return null}}convertTimestamp(e){const t=qt(e);return new se(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=ie.fromString(e);te(mh(r),9688,{name:e});const i=new Vr(r.get(1),r.get(3)),s=new z(r.popFirst(5));return i.isEqual(t)||_t(`Document ${s} contains a document reference within a different database (${i.projectId}/${i.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),s}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bd extends SE{constructor(e){super(),this.firestore=e}convertBytes(e){return new ze(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new pe(this.firestore,null,t)}}function Rs(){return new Pa("serverTimestamp")}const Ed="@firebase/firestore",wd="4.14.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Td{constructor(e,t,r,i,s){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=i,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new pe(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new CE(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var e;return((e=this._document)==null?void 0:e.data.clone().value.mapValue.fields)??void 0}get(e){if(this._document){const t=this._document.data.field(Cs("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class CE extends Td{data(){return super.data()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kE(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new B(N.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class Da{}class RE extends Da{}function La(n,e,...t){let r=[];e instanceof Da&&r.push(e),r=r.concat(t),function(s){const a=s.filter(l=>l instanceof Va).length,c=s.filter(l=>l instanceof Ps).length;if(a>1||a>0&&c>0)throw new B(N.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const i of r)n=i._apply(n);return n}class Ps extends RE{constructor(e,t,r){super(),this._field=e,this._op=t,this._value=r,this.type="where"}static _create(e,t,r){return new Ps(e,t,r)}_apply(e){const t=this._parse(e);return Ad(e._query,t),new tr(e.firestore,e.converter,Yo(e._query,t))}_parse(e){const t=md(e.firestore);return function(s,a,c,l,h,d,p){let y;if(h.isKeyField()){if(d==="array-contains"||d==="array-contains-any")throw new B(N.INVALID_ARGUMENT,`Invalid Query. You can't perform '${d}' queries on documentId().`);if(d==="in"||d==="not-in"){xd(p,d);const T=[];for(const R of p)T.push(Id(l,s,R));y={arrayValue:{values:T}}}else y=Id(l,s,p)}else d!=="in"&&d!=="not-in"&&d!=="array-contains-any"||xd(p,d),y=TE(c,a,p,d==="in"||d==="not-in");return de.create(h,d,y)}(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function Ns(n,e,t){const r=e,i=Cs("where",n);return Ps._create(i,r,t)}class Va extends Da{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new Va(e,t)}_parse(e){const t=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return t.length===1?t[0]:Xe.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:(function(i,s){let a=i;const c=s.getFlattenedFilters();for(const l of c)Ad(a,l),a=Yo(a,l)}(e._query,t),new tr(e.firestore,e.converter,Yo(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}function Id(n,e,t){if(typeof(t=Re(t))=="string"){if(t==="")throw new B(N.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Fu(e)&&t.indexOf("/")!==-1)throw new B(N.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const r=e.path.child(ie.fromString(t));if(!z.isDocumentKey(r))throw new B(N.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return Iu(n,new z(r))}if(t instanceof pe)return Iu(n,t._key);throw new B(N.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Yi(t)}.`)}function xd(n,e){if(!Array.isArray(n)||n.length===0)throw new B(N.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function Ad(n,e){const t=function(i,s){for(const a of i)for(const c of a.getFlattenedFilters())if(s.indexOf(c.op)>=0)return c.op;return null}(n.filters,function(i){switch(i){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(t!==null)throw t===e.op?new B(N.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new B(N.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}function PE(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}class Jr{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Tn extends Td{constructor(e,t,r,i,s,a){super(e,t,r,i,a),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Ds(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(Cs("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new B(N.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=Tn._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}Tn._jsonSchemaVersion="firestore/documentSnapshot/1.0",Tn._jsonSchema={type:he("string",Tn._jsonSchemaVersion),bundleSource:he("string","DocumentSnapshot"),bundleName:he("string"),bundle:he("string")};class Ds extends Tn{data(e={}){return super.data(e)}}class nr{constructor(e,t,r,i){this._firestore=e,this._userDataWriter=t,this._snapshot=i,this.metadata=new Jr(i.hasPendingWrites,i.fromCache),this.query=r}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(r=>{e.call(t,new Ds(this._firestore,this._userDataWriter,r.key,r,new Jr(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new B(N.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(i,s){if(i._snapshot.oldDocs.isEmpty()){let a=0;return i._snapshot.docChanges.map(c=>{const l=new Ds(i._firestore,i._userDataWriter,c.doc.key,c.doc,new Jr(i._snapshot.mutatedKeys.has(c.doc.key),i._snapshot.fromCache),i.query.converter);return c.doc,{type:"added",doc:l,oldIndex:-1,newIndex:a++}})}{let a=i._snapshot.oldDocs;return i._snapshot.docChanges.filter(c=>s||c.type!==3).map(c=>{const l=new Ds(i._firestore,i._userDataWriter,c.doc.key,c.doc,new Jr(i._snapshot.mutatedKeys.has(c.doc.key),i._snapshot.fromCache),i.query.converter);let h=-1,d=-1;return c.type!==0&&(h=a.indexOf(c.doc.key),a=a.delete(c.doc.key)),c.type!==1&&(a=a.add(c.doc),d=a.indexOf(c.doc.key)),{type:NE(c.type),doc:l,oldIndex:h,newIndex:d}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new B(N.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=nr._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Mo.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],r=[],i=[];return this.docs.forEach(s=>{s._document!==null&&(t.push(s._document),r.push(this._userDataWriter.convertObjectMap(s._document.data.value.mapValue.fields,"previous")),i.push(s.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function NE(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return G(61501,{type:n})}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */nr._jsonSchemaVersion="firestore/querySnapshot/1.0",nr._jsonSchema={type:he("string",nr._jsonSchemaVersion),bundleSource:he("string","QuerySnapshot"),bundleName:he("string"),bundle:he("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ls(n){n=mn(n,pe);const e=mn(n.firestore,Ss),t=Ca(e);return hE(t,n._key).then(r=>LE(e,n,r))}function Oa(n){n=mn(n,tr);const e=mn(n.firestore,Ss),t=Ca(e),r=new bd(e);return kE(n._query),dE(t,n._query).then(i=>new nr(e,r,n,i))}function Vs(n,e,t){n=mn(n,pe);const r=mn(n.firestore,Ss),i=PE(n.converter,e,t),s=md(r);return DE(r,[wE(s,"setDoc",n._key,i,n.converter!==null,t).toMutation(n._key,wt.none())])}function DE(n,e){const t=Ca(n);return fE(t,e)}function LE(n,e,t){const r=t.docs.get(e._key),i=new bd(n);return new Tn(n,i,e._key,r,new Jr(t.hasPendingWrites,t.fromCache),e.converter)}(function(e,t=!0){fv(Ln),Dn(new ln("firestore",(r,{instanceIdentifier:i,options:s})=>{const a=r.getProvider("app").getImmediate(),c=new Ss(new mv(r.getProvider("auth-internal")),new _v(a,r.getProvider("app-check-internal")),Ov(a,i),a);return s={useFetchStreams:t,...s},c._setSettings(s),c},"PUBLIC").setMultipleInstances(!0)),Pt(Ed,wd,e),Pt(Ed,wd,"esm2020")})();const Sd=qc({apiKey:"AIzaSyCe6R5U0MsHw9aBNl25AZP3ZemFXDKEK9w",authDomain:"vnpt-cloud-sync.firebaseapp.com",projectId:"vnpt-cloud-sync",storageBucket:"vnpt-cloud-sync.firebasestorage.app",messagingSenderId:"1034099532877",appId:"1:1034099532877:web:3bcbe2ab0ea8fae524e804",measurementId:"G-650CYB84PL"}),je=hv(Sd),ot=yE(Sd),Os="VNPT_PRO_SECRET_2026";function VE(n){if(!n)return"";try{return btoa((t=>t.split("").map((r,i)=>String.fromCharCode(r.charCodeAt(0)^Os.charCodeAt(i%Os.length))).join(""))(n))}catch(e){return console.error("Encryption error:",e),n}}function OE(n){if(!n)return"";try{return(t=>t.split("").map((r,i)=>String.fromCharCode(r.charCodeAt(0)^Os.charCodeAt(i%Os.length))).join(""))(atob(n))}catch(e){return console.error("Decryption error:",e),n}}const Oe={async signUp(n,e){return await Qm(je,n,e)},async signIn(n,e){return await Ym(je,n,e)},async logout(){await ey(je)},onAuthChange(n){return Zm(je,n)},async pushProfile(n){const e=je.currentUser;if(!e)throw new Error("Chưa đăng nhập Firebase");const t=Wt(ot,`users/${e.uid}/profiles`,n.id);await Vs(t,{...n,updatedAt:Rs()},{merge:!0})},async pullProfiles(){const n=je.currentUser;if(!n)return[];const e=ud(ot,`users/${n.uid}/profiles`),t=La(e);return(await Oa(t)).docs.map(i=>i.data())},async backupKeys(n){const e=je.currentUser;if(!e)return;const t={};for(const[i,s]of Object.entries(n))t[i]=VE(s);const r=Wt(ot,`users/${e.uid}/secrets`,"api_keys");await Vs(r,{...t,updatedAt:Rs()},{merge:!0})},async restoreKeys(){const n=je.currentUser;if(!n)return null;const e=Wt(ot,`users/${n.uid}/secrets`,"api_keys"),t=await Ls(e);if(!t.exists())return null;const r=t.data(),i={};for(const[s,a]of Object.entries(r))s!=="updatedAt"&&(i[s]=OE(a));return i},async updateUserSettings(n){const e=je.currentUser;if(!e)return;const t=Wt(ot,`users/${e.uid}/settings`,"general");await Vs(t,{...n,updatedAt:Rs()},{merge:!0})},async getUserSettings(){const n=je.currentUser;if(!n)return null;const e=Wt(ot,`users/${n.uid}/settings`,"general"),t=await Ls(e);return t.exists()?t.data():null},async pushGlobalConfig(n){const e=je.currentUser;if(!e)return;const t=Wt(ot,`users/${e.uid}/settings`,"config");await Vs(t,{...n,updatedAt:Rs()},{merge:!0})},async pullGlobalConfig(){const n=je.currentUser;if(!n)return null;const e=Wt(ot,`users/${n.uid}/settings`,"config"),t=await Ls(e);return t.exists()?t.data():null},async getSharedTemplates(){try{const n=await this.getUserSettings(),e=(n==null?void 0:n.workspace)||"global",t=ud(ot,"shared_templates"),r=La(t,Ns("active","==",!0),Ns("workspace","==",e));let s=(await Oa(r)).docs.map(a=>({id:a.id,...a.data()}));if(e!=="global"){const a=La(t,Ns("active","==",!0),Ns("workspace","==","global")),l=(await Oa(a)).docs.map(h=>({id:h.id,...h.data()}));s=[...s,...l]}return s}catch(n){return console.error("FirebaseService.getSharedTemplates error:",n),[]}},async getRemoteConfigs(){try{const n=Wt(ot,"settings","remote_configs"),e=await Ls(n);return e.exists()?e.data():null}catch(n){return console.error("FirebaseService.getRemoteConfigs error:",n),null}}};function In(){try{const n=V.get(gr)||[],e=n.filter(t=>t.type!=="local");return e.length!==n.length&&rr(e),e}catch{return[]}}function rr(n){V.set(gr,n)}function ME(n){const e=n.match(/drive\.google\.com\/file\/d\/([^/]+)/);return e?`https://drive.google.com/uc?export=download&id=${e[1]}`:n}function Cd(n){return new Promise((e,t)=>{GM_xmlhttpRequest({method:"GET",url:ME(n),responseType:"arraybuffer",onload:r=>{if(r.status>=200&&r.status<300){if(r.response&&r.response.byteLength>4){const i=new Uint8Array(r.response.slice(0,4));if(i[0]===80&&i[1]===75&&i[2]===3&&i[3]===4){e(r.response);return}else{t(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}e(r.response)}else t(new Error(`HTTP ${r.status}: Không lấy được file`))},onerror:()=>t(new Error("Không thể tải URL.")),ontimeout:()=>t(new Error("Timeout khi tải URL."))})})}async function kd(n,e,t){const r=n.name.replace(/\.docx$/i,""),i=prompt("Đặt tên biến nhớ cho file này:",r);if(!(!i||!i.trim()))try{const s=await n.arrayBuffer();await dp(i.trim(),s);const c=In().filter(l=>l.name!==i.trim()&&l.fileName!==n.name);c.unshift({name:i.trim(),type:"local_idb",fileName:n.name,lastUsed:Date.now()}),rr(c),at(e,t),t&&t(s,i.trim())}catch(s){U(`❌ Lỗi lưu file: ${s.message}`,"#dc3545")}}function at(n,e,t=null){let r=n.querySelector(".vnpt-template-manager-inner"),i,s,a,c=n.dataset.activeTab||"local";if(r){i=r.querySelector(".vnpt-local-list-container"),s=r.querySelector(".vnpt-cloud-list-container"),a=r.querySelector(".vnpt-btn-wrap");const h=r.querySelectorAll(".vnpt-tab-btn");h[0].className=`vnpt-tab-btn ${c==="local"?"active":""}`,h[1].className=`vnpt-tab-btn ${c==="cloud"?"active":""}`}else{n.innerHTML="",r=document.createElement("div"),r.className="vnpt-template-manager-inner";const h=document.createElement("div");h.className="vnpt-tabs";const d=document.createElement("button");d.className=`vnpt-tab-btn ${c==="local"?"active":""}`,d.textContent="Cá nhân",d.onclick=()=>{n.dataset.activeTab="local",at(n,e,t)};const p=document.createElement("button");p.className=`vnpt-tab-btn ${c==="cloud"?"active":""}`,p.textContent="Thư viện mẫu",p.onclick=()=>{n.dataset.activeTab="cloud",at(n,e,t)},h.appendChild(d),h.appendChild(p),r.appendChild(h);const y=document.createElement("div");y.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const I=document.createElement("span");I.className="vnpt-title-main",I.style.cssText="font-size:11px;font-weight:700;color:#444;",a=document.createElement("div"),a.className="vnpt-btn-wrap",a.style.cssText="display:flex;gap:4px;",y.appendChild(I),y.appendChild(a),r.appendChild(y),i=document.createElement("div"),i.className="vnpt-local-list-container",i.style.cssText="display:flex;flex-wrap:wrap;gap:4px;",r.appendChild(i),s=document.createElement("div"),s.className="vnpt-cloud-list-container",s.style.cssText="display:none;flex-direction:column;gap:4px;",r.appendChild(s),n.appendChild(r)}const l=r.querySelector(".vnpt-title-main");c==="local"?(i.style.display="flex",s.style.display="none",FE(i,l,e,t,n)):(i.style.display="none",s.style.display="flex",UE(s,l,e,t,n))}function FE(n,e,t,r,i){const s=In();if(e.innerHTML="Templates"+(r?` <span style="color:#2e7d32;">(Đang dùng: ${r})</span>`:""),s.length===0){n.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:12px;text-align:center;width:100%;">Chưa có mẫu nào. Hãy chọn file .docx bên dưới để lưu vào đây.</div>';return}n.innerHTML="",s.forEach((a,c)=>{const l=Rd(a,c,t,r,i);n.appendChild(l)})}function Rd(n,e,t,r,i){const s=document.createElement("div");s.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 8px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;transition:all 0.2s;",n.name===r&&(s.style.borderColor="var(--vnpt-primary)",s.style.background="var(--vnpt-primary-light)"),s.title=n.fileName||n.url||n.name,s.tabIndex=0,s.onfocus=()=>s.style.boxShadow="0 0 0 2px var(--vnpt-primary)",s.onblur=()=>s.style.boxShadow="none";const a=n.type==="local"||n.type==="local_base64"||n.type==="local_idb"?"OFF":"ON",c=a==="OFF"?"#6c757d":"#28a745",l=document.createElement("span");l.textContent=a,l.style.cssText=`font-size:8px;padding:1px 5px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${c};color:#fff;`;const h=document.createElement("span");if(h.textContent=n.name,h.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",s.onclick=()=>{s.focus(),qE(n,t,r,i)},s.appendChild(l),s.appendChild(h),n.type!=="cloud_shared"){const d=document.createElement("button");d.innerHTML="✎",d.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",d.onclick=y=>{y.stopPropagation();const I=prompt("Đổi tên template:",n.name);if(I&&I.trim()&&I.trim()!==n.name){const T=In(),R=T.findIndex(x=>x.name===n.name);R>=0&&(T[R].name=I.trim(),rr(T),at(i,t,r))}},s.appendChild(d);const p=document.createElement("button");p.innerHTML="✕",p.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",p.onclick=async y=>{if(y.stopPropagation(),confirm(`Xoá biểu mẫu "${n.name}"?`)){const I=In(),T=I.findIndex(R=>R.name===n.name);if(T>=0){const R=I[T];I.splice(T,1),rr(I),R.type==="local_idb"&&await pp(R.name).catch(()=>null),at(i,t,r===R.name?null:r)}}},s.appendChild(p)}else{const d=document.createElement("button");d.innerHTML="📥",d.title="Lưu về danh sách cá nhân",d.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:var(--vnpt-primary);cursor:pointer;margin-left:auto;",d.onclick=p=>{p.stopPropagation(),BE(n)},s.appendChild(d)}return s}async function UE(n,e,t,r,i){e.textContent="Thư viện dùng chung",n.innerHTML='<div style="text-align:center;padding:10px;font-size:10px;color:#666;">⏳ Đang tải từ Cloud...</div>';try{const s=await Oe.getSharedTemplates();if(s.length===0){n.innerHTML='<div style="text-align:center;padding:10px;font-size:10px;color:#999;font-style:italic;">Thư viện trống hoặc chưa được cấu hình.</div>';return}n.innerHTML="",s.forEach(a=>{const c={...a,type:"cloud_shared"},l=Rd(c,0,t,r,i);if(l.style.width="100%",l.style.borderRadius="8px",a.department){const h=document.createElement("span");h.textContent=a.department,h.style.cssText="font-size:9px;background:#e3f2fd;color:#1976d2;padding:1px 4px;border-radius:4px;margin-left:4px;",l.insertBefore(h,l.querySelector("button"))}n.appendChild(l)})}catch(s){n.innerHTML=`<div style="text-align:center;padding:10px;font-size:10px;color:#ea4335;">❌ Lỗi: ${s.message}</div>`}}async function BE(n){const e=In();if(e.some(r=>r.url===n.url)){U("Mẫu này đã có trong danh sách cá nhân của bạn.");return}e.unshift({name:n.name,url:n.url,type:"url",fileName:n.fileName||n.name+".docx",lastUsed:Date.now()}),rr(e),U(`✅ Đã thêm "${n.name}" vào danh sách cá nhân.`)}function qE(n,e,t,r){const i=In(),s=i.find(a=>a.name===n.name&&(a.url===n.url||a.type===n.type));if(s&&(s.lastUsed=Date.now(),rr(i)),n.type==="local_idb"){fp(n.name).then(a=>{if(!a)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");e&&e(a,n.name),at(r,e,n.name)}).catch(a=>{U(`❌ Lỗi nạp File IDB: ${a.message}`,"#dc3545")});return}if(n.type==="local_base64"&&n.data){try{const a=window.atob(n.data.split(",")[1]),c=a.length,l=new Uint8Array(c);for(let h=0;h<c;h++)l[h]=a.charCodeAt(h);e&&e(l.buffer,n.name),at(r,e,n.name)}catch(a){U(`❌ Lỗi nạp Base64: ${a.message}`,"#dc3545")}return}Cd(n.url).then(a=>{e&&e(a,n.name),at(r,e,n.name)}).catch(a=>{U(`❌ ${a.message}`,"#dc3545")})}const $E=Object.freeze(Object.defineProperty({__proto__:null,fetchTemplateFromUrl:Cd,loadTemplates:In,renderTemplateManager:at,saveLocalTemplate:kd},Symbol.toStringTag,{value:"Module"}));function HE(n,e){if(n.length===0)return e.length;if(e.length===0)return n.length;const t=[];for(let r=0;r<=e.length;r++)t[r]=[r];for(let r=0;r<=n.length;r++)t[0][r]=r;for(let r=1;r<=e.length;r++)for(let i=1;i<=n.length;i++)e.charAt(r-1)===n.charAt(i-1)?t[r][i]=t[r-1][i-1]:t[r][i]=Math.min(t[r-1][i-1]+1,t[r][i-1]+1,t[r-1][i]+1);return t[e.length][n.length]}function zE(n,e){let t=n,r=e;n.length<e.length&&(t=e,r=n);const i=t.length;return i===0?1:(i-HE(t,r))/parseFloat(i)}function jE(n,e,t=.7){let r=null,i=-1;const s=n.toLowerCase().trim();for(const a of e){const c=a.toLowerCase().trim(),l=zE(s,c);l>i&&l>=t&&(i=l,r=a)}return r}function KE(n){if(!n)return"";let e=n.replace(/\D/g,"");return e.startsWith("84")&&(e="0"+e.slice(2)),e}function GE(n){if(!n)return"";const e=n.split(/[-/]/);if(e.length===3){let t,r,i;return e[0].length===4?[i,r,t]=e:[t,r,i]=e,`${t.padStart(2,"0")}/${r.padStart(2,"0")}/${i}`}return n}let ye={byId:new Map,byName:new Map,byPlaceholder:new Map,byLabel:new Map,allInputs:[]},Ms=[];function Pd(){ye.byId.clear(),ye.byName.clear(),ye.byPlaceholder.clear(),ye.byLabel.clear(),ye.allInputs=[]}function Nd(){return Ms=Array.from(document.querySelectorAll("label, .label, .label-text, span.title, .form-label")),Ms}function Fs(){const n=performance.now();Pd();const e=Array.from(document.querySelectorAll("input, textarea, select, ng-select2"));ye.allInputs=e,e.forEach(i=>{i.id&&ye.byId.set(i.id,i),i.name&&ye.byName.set(i.name,i);const s=i.getAttribute("placeholder");s&&ye.byPlaceholder.set(s.trim(),i);const a=i.getAttribute("formcontrolname");a&&ye.byName.set(a,i)});const t=Nd();t.forEach(i=>{const s=i.innerText.trim();if(!s)return;let a=null;if(i.htmlFor&&(a=document.getElementById(i.htmlFor)),!a){let c=i.parentElement,l=0;for(;c&&l<2&&(a=c.querySelector("input, textarea, select"),!a);)c=c.parentElement,l++}a&&ye.byLabel.set(s,a)});const r=performance.now();console.debug(`[DOM] Build map in ${(r-n).toFixed(2)}ms for ${e.length} inputs and ${t.length} labels.`)}function WE(n){n.dispatchEvent(new Event("input",{bubbles:!0})),n.dispatchEvent(new Event("change",{bubbles:!0}))}function ir(n,e){var i;const t=n.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,r=(i=Object.getOwnPropertyDescriptor(t,"value"))==null?void 0:i.set;r?r.call(n,e):n.value=e,WE(n)}function Qt(n,e=null){if(!n&&!e)return null;ye.allInputs.length===0&&Fs();const t=i=>i?["INPUT","TEXTAREA","SELECT"].includes(i.tagName)||i.getAttribute("contenteditable")==="true"?i:i.querySelector('input, textarea, select, [contenteditable="true"]'):null;if(n){let i=ye.byId.get(n)||ye.byName.get(n)||ye.byPlaceholder.get(n)||ye.byLabel.get(n);if(i&&document.contains(i))return t(i)}if(e){let i=ye.byLabel.get(e);if(i&&document.contains(i))return t(i)}if(n){const i=document.getElementById(n);if(i){const l=t(i);if(l)return l}const s=`input[id="${n}"], textarea[id="${n}"], select[id="${n}"], input[name="${n}"], textarea[name="${n}"], [placeholder="${n}"], [formcontrolname="${n}"]`,a=document.querySelector(s);if(a)return a;const c=document.querySelector(`[id="${n}"], [name="${n}"]`);if(c){const l=t(c);if(l)return l}}const r=e||n;if(r&&r.length>2){const i=Array.from(ye.byLabel.keys());i.length===0&&Ms.length>0&&i.push(...Ms.map(a=>a.innerText.trim()).filter(a=>a.length>0));const s=jE(r,i,.82);if(s)return t(ye.byLabel.get(s))}return null}function Ma(n){return Qt(null,n)}function xn(n,e,t=null){const r=Qt(n,t);return r?(ir(r,e),!0):!1}function QE(n=new Date){return String(n.getDate()).padStart(2,"0")}function YE(n=new Date){return String(n.getMonth()+1).padStart(2,"0")}function XE(n=new Date){return String(n.getFullYear())}function Dd(){const n=new Date;return{ngay:QE(n),thang:YE(n),nam:XE(n)}}const{ngay:Ld,thang:Vd,nam:Od}=Dd(),Me={"ngayKy, ngayKy1":{label:"Ngày ký",value:Ld},"thangKy, thangKy1":{label:"Tháng ký",value:Vd},"namKy, namKy1":{label:"Năm ký",value:Od},"ngayTiepNhan, ngayThangNamKy":{label:"Ngày ký (full)",value:`${Ld}/${Vd}/${Od}`},tenDoanhNghiepB:{label:"Tên doanh nghiệp B",value:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM"},diaChiB:{label:"Địa chỉ B",value:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội"},maSoThueB:{label:"Mã số thuế B",value:"0100686223"},stkB:{label:"Số tài khoản B",value:"1600114156"},diaChiStkB:{label:"Ngân hàng/Địa chỉ STK B",value:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)"},"tenB, nguoiDaiDienB, tenDaiDienB":{label:"Người đại diện B",value:"Phạm Khánh Chung"},"chucVuB, chucVuDaiDienB":{label:"Chức vụ B",value:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp"},"giayUyQuyenSoB, soGiayUyQuyenB":{label:"Giấy ủy quyền số B",value:"2628/GUQ-VNPT-HNI-VP"},"giayUyQuyenNgayB, ngayGiayUyQuyenB":{label:"Giấy ủy quyền ngày B",value:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},GiayUyQuyenB:{label:"Giấy ủy quyền B (full)",value:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},tenDoanhNghiepB1:{label:"Tên doanh nghiệp B (phụ)",value:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},donViTiepNhan:{label:"Đơn vị tiếp nhận",value:"TTKD KHDN"},"tenTiepNhan, tenNguoiNhan":{label:"Người tiếp nhận",value:"Bùi Anh"},dienThoaiB:{label:"Điện thoại B",value:"02436686868"},diaChiTaiKhoanB:{label:"Địa chỉ tài khoản B",value:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 "},noiKy:{label:"Nơi ký",value:"Hà Nội"},emailB:{label:"Email B",value:""},"lienheHopDongB, lienheTuVanB, lienheHoaDonB, sucoCap1B, sucoCap2B, sucoCap3B, sucoCap4B":{label:"Liên hệ B (AM)",value:"AM Bùi Anh"}},Fa={soHopDong:"soHopDong, inputContractGroupName"},Us={after:["cuocDV","tongCong","tongCongHD","congCA","giaTriHopDong","tongGIaTriHopDong"],before:["donGiaCA","thanhTienCA","tongThanhTien","tongCuocTruocThue"],tax:["tongThueGTGT","tongThue","thueCA","thueVAT"],text:["soTienThanhToanBangChu","tongCongBangChu","tongCongHDbangChu","ghiChuGiaTriHopDong","tongGiaTriHopDongBangChu"]},Md=.08,Bs={SCAN:{key:"s",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Quét dữ liệu"},FILL:{key:"f",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Điền Web"},SCAN_PDF:{key:"p",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Scan PDF (AI)"},TOGGLE:{key:"w",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Đóng/Mở Widget"},CLEAN:{key:"d",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Dọn dẹp & Reset"}},Fd=Object.freeze(Object.defineProperty({__proto__:null,DEFAULT_CALC_MAP:Us,DEFAULT_DATA:Me,DEFAULT_HOTKEYS:Bs,DEFAULT_SYNC_DATA:Fa,DEFAULT_TAX_RATE:Md},Symbol.toStringTag,{value:"Module"}));function Ud(n,e){let t;return function(...i){const s=()=>{clearTimeout(t),n(...i)};clearTimeout(t),t=setTimeout(s,e)}}function JE(){let n=V.get(dt),e=JSON.parse(JSON.stringify(Me));return n?(["ngayKy, ngayKy1","thangKy, thangKy1","namKy, namKy1","ngayTiepNhan, ngayThangNamKy"].forEach(r=>{n[r]&&e[r]&&(n[r].value=e[r].value)}),n):e}function Bd(){const n=JE(),e=V.get(sn)??{},t={...n,...e};Object.keys(t).forEach(r=>{const i=t[r],s=i&&typeof i=="object"&&i.hasOwnProperty("value")?i.value:i;r.split(",").map(c=>c.trim()).filter(c=>c).forEach(c=>{let l=Qt(c)||Ma(c);l&&ir(l,s)})}),U("✅ Auto fill complete")}function ZE(){let n=V.get(xt)??{};const e={...Fa,...n},t=Object.keys(e);if(t.length===0){U("⚠️ No sync mapping","#ffc107");return}t.forEach(r=>{let i=Qt(r)||Ma(r);i&&i.value!==void 0&&i.value!==""&&e[r].split(",").map(a=>a.trim()).filter(a=>a).forEach(a=>xn(a,i.value))}),U("✅ Sync form complete","#d39e00")}let Ua=!1;const qd=new Map,ew=(n,e)=>{var l;if(Ua)return;let t=V.get(xt)??{};const r={...Fa,...t};if(Object.keys(r).length===0)return;let i=n.id,s=n.name,a=null;if(i){const h=document.querySelector(`label[for="${i}"]`);h&&(a=h.textContent.trim())}if(!a){const h=n.closest("label");h&&(a=(l=Array.from(h.childNodes).find(d=>d.nodeType===3))==null?void 0:l.textContent.trim())}let c=r[i]||r[s]||r[a];if(c){Ua=!0;try{c.split(",").map(d=>d.trim()).filter(d=>d).forEach(d=>{if(d!==i&&d!==s&&d!==a){let p=qd.get(d);(!p||!document.contains(p))&&(p=Qt(d)||Ma(d),p&&qd.set(d,p)),p&&document.activeElement!==p&&ir(p,e)}})}finally{Ua=!1}}},tw=Ud((n,e)=>{ew(n,e)},250);function nw(){document.addEventListener("input",n=>{const e=n.target;!e||!["INPUT","TEXTAREA"].includes(e.tagName)||e.closest("#vnpt-docx-widget")||e.closest("#vnpt-inline-calc")||tw(e,e.value)})}const rw={async lookupMST(n){if(!n||n.length<10)return null;const e=`https://api.vietqr.io/v2/business/${n}`;try{const r=await(await fetch(e)).json();if(r.code==="00"&&r.data){const{name:i,address:s,representative:a,status:c}=r.data;return{name:i||"",address:s||"",representative:a||"",status:c||""}}return null}catch(t){return console.error("[MST Service] Error fetching MST:",t),null}}};function $d(n){if(!n)return n;const e={};return Object.keys(n).forEach(t=>{const r=n[t];t.split(",").map(s=>s.trim()).filter(s=>s).forEach(s=>{e[s]=r})}),e}function Ba(n=""){const e={version:"1.0",timestamp:new Date().toISOString(),backup:{fields:V.get(Ge),defaultFields:V.get(Le),dataDefault:$d(V.get(dt)),dataCustom:$d(V.get(sn)),dataSync:V.get(xt),taxRate:V.get(Pn),calcMap:V.get(At),templates:V.get(gr)}},t=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),r=URL.createObjectURL(t),i=document.createElement("a");i.href=r;let s=n;s?s.toLowerCase().endsWith(".json")||(s+=".json"):s=`vnpt_full_backup_${new Date().toLocaleDateString().replace(/\//g,"-")}.json`,i.download=s,i.click(),URL.revokeObjectURL(r),U(`✅ Đã xuất file: ${s}`)}async function Hd(n){return new Promise(e=>{const t=new FileReader;t.onload=r=>{try{const i=JSON.parse(r.target.result);if(!i.backup)throw new Error("File không đúng định dạng backup.");const s=i.backup;s.fields&&V.set(Ge,s.fields),s.defaultFields&&V.set(Le,s.defaultFields),s.dataDefault&&V.set(dt,s.dataDefault),s.dataCustom&&V.set(sn,s.dataCustom),s.dataSync&&V.set(xt,s.dataSync),s.taxRate&&V.set(Pn,s.taxRate),s.calcMap&&V.set(At,s.calcMap),s.templates&&V.set(gr,s.templates),U("✅ Đã nhập dữ liệu thành công! Vui lòng tải lại trang hoặc widget.","#1e8e3e"),e(!0)}catch{U("❌ Lỗi: File sao lưu không hợp lệ.","#ff5252"),e(!1)}},t.readAsText(n)})}function sr(n=""){let e=V.get(fr);Array.isArray(e)||(e=[]);const t={id:Date.now().toString(),name:n||`Bản sao lưu ${new Date().toLocaleString()}`,timestamp:new Date().toISOString(),data:{fields:V.get(Ge),defaultFields:V.get(Le)}};e.unshift(t);const r=e.slice(0,15);V.set(fr,r),console.log(`✅ Field backup created: ${t.name}`)}function qa(){var r,i;const n=V.get(Ge)||{},e=((r=n.tenDaiDienn)==null?void 0:r.value)||"",t=((i=n.soHopDong)==null?void 0:i.value)||"";return!e&&!t?`Quét dữ liệu - ${new Date().toLocaleTimeString()}`:`${e} - ${t}`}function $a(){const n=V.get(fr);return n&&!Array.isArray(n)?(V.remove(fr),[]):Array.isArray(n)?n:[]}function zd(n){const t=$a().find(i=>i.id===n);if(!t||!t.data)return U("⚠️ Không tìm thấy bản sao lưu hợp lệ!","#ffc107"),!1;const r=t.data;return r.fields&&V.set(Ge,r.fields),r.defaultFields&&V.set(Le,r.defaultFields),U(`✅ Đã khôi phục các trường: ${t.name}`,"#1e8e3e"),!0}let qs=null;function jd(n,e){qs&&qs();const t=P.widget,r=n.querySelector(".btn-field-link"),i=[];let s=null;const a=D=>D?document.getElementById(D)||document.querySelector(`[formcontrolname="${CSS.escape(D)}"]`)||document.querySelector(`[name="${CSS.escape(D)}"]`)||document.querySelector(`[placeholder="${CSS.escape(D)}"]`):null,c=()=>{e.value.split(",").map(F=>F.trim()).filter(F=>F).forEach(F=>{const H=a(F);H&&!t.contains(H)&&!i.includes(H)&&(H.classList.add("vnpt-link-existing"),i.push(H))})},l=()=>{i.forEach(D=>{D.classList.remove("vnpt-link-existing"),D.classList.remove("vnpt-unlink-hover")}),i.length=0},h=()=>{const D=e.value.split(",").map(F=>F.trim()).filter(F=>F);return Math.max(0,D.length-1)},d=document.createElement("div");d.className="vnpt-linking-banner",d.style.pointerEvents="auto";const p=()=>{const D=h(),F=D>0?`<span class="vnpt-link-count-badge">${D} link</span>`:"";d.innerHTML=`
            🔗 <b>Liên kết đa điểm</b> ${F}
            &nbsp;·&nbsp; <span style="font-size:10px;opacity:0.85;">🔵 Click = link &nbsp; 🔴 Click lại = bỏ link</span>
            &nbsp;·&nbsp; <button class="vnpt-link-done-btn">✅ Xong</button>
            &nbsp; <kbd>Esc</kbd>
        `,d.querySelector(".vnpt-link-done-btn").onclick=H=>{H.stopPropagation(),k(!0)}};r.classList.add("active"),document.body.classList.add("vnpt-linking-mode"),t.style.opacity="0.15",t.style.pointerEvents="none",t.style.transition="opacity 0.3s",p(),document.body.appendChild(d),c();const y=D=>{const F=D.id||D.getAttribute("formcontrolname")||D.name||D.getAttribute("placeholder");if(F)return F;if((D.tagName==="LABEL"||D.classList.contains("label")||D.classList.contains("form-label"))&&D.innerText.trim())return D.innerText.trim();let j=D.parentElement,_=0;for(;j&&_<3;){const b=j.querySelector("label, .label, .label-text, span.title, .form-label");if(b&&b.innerText.trim())return b.innerText.trim();if(j.id&&!j.id.startsWith("ng-"))return j.id;j=j.parentElement,_++}const m=D.className&&typeof D.className=="string"?D.className.trim().split(/\s+/)[0]:"";return D.tagName.toLowerCase()+(m?"."+m:"")},I=new Set(["INPUT","TEXTAREA","SELECT","SPAN","DIV","P","LABEL","BUTTON","TD","TH","SECTION"]),T=D=>{const F=D.target;t.contains(F)||d.contains(F)||I.has(F.tagName)&&(s&&s!==F&&(s.classList.remove("vnpt-link-highlight"),s.classList.remove("vnpt-unlink-hover")),F.classList.contains("vnpt-link-existing")?F.classList.add("vnpt-unlink-hover"):F.classList.add("vnpt-link-highlight"),s=F)},R=D=>{const F=D.target;if(t.contains(F)||d.contains(F))return;D.preventDefault(),D.stopPropagation();const H=y(F),j=e.value.split(",").map(_=>_.trim()).filter(_=>_);if(j.includes(H)){const _=j.filter(b=>b!==H);e.value=_.join(", "),F.classList.remove("vnpt-link-existing"),F.classList.remove("vnpt-unlink-hover"),F.classList.add("vnpt-link-highlight");const m=i.indexOf(F);m!==-1&&i.splice(m,1),e.dispatchEvent(new Event("input",{bubbles:!0})),p(),U(`🔓 Đã bỏ "${H}"`,"#ea4335")}else e.value=[...j,H].join(", "),F.classList.remove("vnpt-link-highlight"),F.classList.add("vnpt-link-existing"),i.includes(F)||i.push(F),s===F&&(s=null),e.dispatchEvent(new Event("input",{bubbles:!0})),p(),U(`+🔗 "${H}" — Click lại để bỏ | ✅ Xong`,"#198754")},x=D=>{D.key==="Escape"&&(U("❌ Đã kết thúc liên kết","#ffc107"),k(!0))},k=(D=!0)=>{s&&(s.classList.remove("vnpt-link-highlight"),s.classList.remove("vnpt-unlink-hover")),l(),r.classList.remove("active"),document.body.classList.remove("vnpt-linking-mode"),t.style.opacity="",t.style.pointerEvents="",d.parentNode&&d.parentNode.removeChild(d),D&&e.dispatchEvent(new Event("change",{bubbles:!0})),document.removeEventListener("mouseover",T,!0),document.removeEventListener("click",R,!0),document.removeEventListener("keydown",x,!0),qs=null};document.addEventListener("mouseover",T,!0),document.addEventListener("click",R,!0),document.addEventListener("keydown",x,!0),qs=k;const O=h();U(O>0?`🔗 Đang có ${O} link — Click thêm hoặc ✅ Xong`:"🔗 Click vào elements để liên kết. ✅ Xong hoặc Esc khi hoàn tất.","#f57f17")}function iw(n,e,t){let r=!0,i=null;return n==="soDkdn"?i=Si.MST:n==="sdt"?i=Si.PHONE:n==="emailDaiDien"&&(i=Si.EMAIL),i&&e.trim()!==""&&(r=i.test(e.trim())),r?t.classList.remove("field-error"):(t.classList.add("field-error"),t.classList.add("vnpt-shake"),setTimeout(()=>t.classList.remove("vnpt-shake"),400)),r}function ge(n,e,t=null,r=""){const i=P.fieldsContainer.querySelector(".text-hint");i&&i.remove();const s=P.fieldsContainer.querySelectorAll(".f-key");let a=!1;const c=n.split(",")[0].trim();for(let l of s)if(l.value.split(",")[0].trim()===c){const d=l.closest(".vnpt-field-row"),p=d.querySelector(".f-val"),y=d.querySelector(".f-label");e!==""&&p.value!==e&&document.activeElement!==p&&(p.value=e),t!==null&&t!==""&&y.value!==t&&document.activeElement!==y&&(y.value=t),r!==""&&l.value!==n+", "+r&&document.activeElement!==l&&(l.value=n+", "+r),a=!0;break}if(!a){(t===null||t==="")&&(t=ue[n]||"");const l=document.createElement("div");l.className="vnpt-field-row row-item",l.setAttribute("draggable","false");let h=n;r&&(h+=", "+r);const d=c;l.innerHTML=`
            <input type="checkbox" id="chk-${d}" name="chk-${d}" class="row-chk" title="Chọn" style="margin: 0 2px 0 2px;" />
            <input type="text" id="lbl-${d}" name="lbl-${d}" class="f-label" value="${t}" />
            <input type="text" id="key-${d}" name="key-${d}" class="f-key" value="${h}" title="Biến DOCX và IDs đồng bộ" />
            <span class="row-drag-handle" title="Kéo">=</span>
            <button class="btn-field-link" title="🔗 Click để liên kết với element trên trang (Esc để hủy)">🔗</button>
            ${d==="soDkdn"?`
                <div class="mst-lookup-wrapper">
                    <input type="text" id="val-${d}" name="val-${d}" class="f-val" value="${e}" placeholder="Mã số thuế..." />
                    <button class="btn-mst-lookup" title="Tra cứu Mã số thuế">
                        <span class="icon">🔍</span>
                        <div class="spinner"></div>
                    </button>
                </div>
            `:`
                <input type="text" id="val-${d}" name="val-${d}" class="f-val" value="${e}" />
            `}
        `;const p=l.querySelector(".f-val"),y=l.querySelector(".f-key");n==="tenToChuc"&&(p.style.textAlign="right");const I=()=>{rn.includes(c)&&(p.value.trim()?p.classList.remove("field-required-empty"):(p.classList.add("field-required-empty"),p.classList.add("vnpt-shake"),setTimeout(()=>p.classList.remove("vnpt-shake"),400)))},T=()=>{const k=p.value;y.value.split(",").map(D=>D.trim()).filter(D=>D).forEach(D=>xn(D,k))};if(y.addEventListener("input",function(){Ce();const k=this.value.split(",")[0].trim();p.style.textAlign=k==="tenToChuc"?"right":""}),y.addEventListener("change",function(){T()}),l.querySelector(".f-label").addEventListener("input",Ce),p.addEventListener("input",function(){Ce(),I()}),p.addEventListener("change",function(){iw(c,p.value,p),T()}),d==="soDkdn"){const k=l.querySelector(".btn-mst-lookup");k.onclick=async()=>{const O=p.value.trim();if(!O){U("⚠️ Vui lòng nhập mã số thuế","#ffc107");return}k.classList.add("loading");try{const D=await rw.lookupMST(O);D?(p.value=O,ge("tenToChuc",D.name),ge("diaChi",D.address),D.representative&&ge("tenDaiDienn",D.representative),Ce(),setTimeout(()=>Kd(),300),U(`✅ Đã tìm thấy: ${D.name}`,"#1a73e8")):U("❌ Không tìm thấy thông tin MST này","#ea4335")}catch{U("❌ Lỗi khi tra cứu MST","#ea4335")}finally{k.classList.remove("loading")}}}I();const R=l.querySelector(".btn-field-link");R&&R.addEventListener("click",k=>{k.stopPropagation(),jd(l,y)});const x=l.querySelector(".row-drag-handle");x.addEventListener("mouseenter",()=>l.setAttribute("draggable","true")),x.addEventListener("mouseleave",()=>{l.classList.contains("dragging")||l.setAttribute("draggable","false")}),l.addEventListener("dragstart",function(k){P.draggedRowForVNPT=this,k.dataTransfer.effectAllowed="move",k.dataTransfer.setData("text/plain",n),this.classList.add("dragging")}),l.addEventListener("dragover",k=>(k.preventDefault(),!1)),l.addEventListener("dragenter",function(){this.classList.add("over")}),l.addEventListener("dragleave",function(){this.classList.remove("over")}),l.addEventListener("drop",function(k){if(k.stopPropagation(),P.draggedRowForVNPT&&P.draggedRowForVNPT!==this){const O=Array.from(P.fieldsContainer.querySelectorAll(".vnpt-field-row")),D=O.indexOf(P.draggedRowForVNPT),F=O.indexOf(this);D<F?this.parentNode.insertBefore(P.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(P.draggedRowForVNPT,this),Ce()}return!1}),l.addEventListener("dragend",function(){this.setAttribute("draggable","false"),P.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(k=>{k.classList.remove("over","dragging")}),P.draggedRowForVNPT=null}),P.fieldsContainer.appendChild(l),P.fieldsContainer.scrollTop=P.fieldsContainer.scrollHeight}}function Ce(){const n=P.isDefaultMode?Le:Ge,e={};P.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(r=>{const s=r.querySelector(".f-key").value.trim().split(",").map(d=>d.trim()).filter(d=>d),a=s[0],c=s.slice(1).join(", "),l=r.querySelector(".f-label").value.trim(),h=r.querySelector(".f-val").value;a&&(e[a]={label:l,value:h,sync:c})}),V.setDebounced(n,e,1e3)}function Ha(){var r,i;const n=V.get(P.isDefaultMode?Le:Ge)||{},e=((r=n.tenDaiDienn)==null?void 0:r.value)||"",t=((i=n.soHopDong)==null?void 0:i.value)||"";return!e&&!t?`Bản sao lưu ${new Date().toLocaleString()}`:`${e} - ${t}`}function sw(){var i,s;const n=V.get(P.isDefaultMode?Le:Ge)||{},e=((i=n.soHopDong)==null?void 0:i.value)||"",t=((s=n.tenToChuc)==null?void 0:s.value)||"";if(!e&&!t)return`Backup_VNPT_${new Date().toLocaleDateString().replace(/\//g,"-")}`;const r=[];return e&&r.push(e),t&&r.push(t),r.join(" - ").replace(/[\\/:"*?<>|]/g,"_")}function Zr(){try{P.fieldsContainer.innerHTML="";const e=V.get(Ge)||{};Object.keys(ue).forEach(t=>{const r=ue[t],i=e[t];i&&typeof i=="object"?ge(t,i.value,i.label||r,i.sync||""):i?ge(t,i,r,""):ge(t,"",r,"")}),Object.keys(e).forEach(t=>{if(!(t in ue)){const r=e[t];typeof r=="object"?ge(t,r.value,r.label,r.sync||""):ge(t,r,"","")}}),Object.keys(ue).length===0&&Object.keys(e).length===0&&(P.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(e){console.error("Error loading config:",e),Object.keys(ue).forEach(t=>ge(t,"",ue[t]))}const n=V.get(Ei);n&&P.widget&&(P.widget.style.bottom="auto",n.right?(P.widget.style.right=n.right,P.widget.style.left="auto"):n.left&&(P.widget.style.left=n.left,P.widget.style.right="auto"),n.top&&(P.widget.style.top=n.top))}function ow(){document.getElementById("vnpt-btn-toggle-id").onclick=()=>P.fieldsContainer.classList.toggle("show-ids");const n=document.getElementById("vnpt-btn-clean-data");n&&(n.onclick=()=>{const i=P.isDefaultMode;confirm(i?`BẠN ĐANG Ở CHẾ ĐỘ MẶC ĐỊNH.
Khôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?`:"Dữ liệu hiện tại sẽ được Xóa. Bạn có muốn SAO LƯU nhanh trước khi làm sạch không?")&&(i?(V.remove(Le),U("🔄 Đã reset dữ liệu hệ thống VNPT","#1a73e8")):(sr(Ha()),V.remove(Ge),U("🧹 Đã làm sạch dữ liệu cá nhân","#1a73e8")),V.remove(At),V.remove(Pn),i?Gd(!0):Zr())});const e=document.getElementById("vnpt-btn-restore-last"),t=document.getElementById("vnpt-backup-history");e&&t?(e.title="Chuột trái: Khôi phục bản gần nhất | Chuột phải: Lưu lịch sử",e.onclick=i=>{i.preventDefault(),i.stopPropagation(),t.classList.remove("show");const s=$a();if(s&&s.length>0){const a=s[0];confirm(`Khôi phục ngay bản sao lưu gần nhất?

"${a.name}"`)&&zd(a.id)&&(P.isDefaultMode?P.isDefaultMode=!1:Zr())}else U("⚠️ Chưa có bản sao lưu nào để khôi phục","#ffc107")},e.oncontextmenu=i=>{i.preventDefault(),i.stopPropagation(),t.classList.toggle("show")&&r(t)},document.addEventListener("click",i=>{t.classList.contains("show")&&!t.contains(i.target)&&!e.contains(i.target)&&t.classList.remove("show")})):It.error("❌ Fix UI: Could not find Restore button (#vnpt-btn-restore-last) or History container (#vnpt-backup-history).");function r(i){const s=$a();if(i.innerHTML='<div class="backup-history-header">📋 Lịch sử sao lưu nội bộ</div>',s.length===0){i.innerHTML+='<div class="backup-history-empty">Chưa có bản sao lưu nào. Hãy thử Quét dữ liệu hoặc Clean Data để tạo bản mới!</div>';return}s.forEach(a=>{const c=document.createElement("div");c.className="backup-history-item";const l=new Date(a.id*1).toLocaleString();c.innerHTML=`
                <div class="backup-history-name" title="${a.name}">${a.name}</div>
                <div class="backup-history-time">${l}</div>
            `,c.onclick=h=>{var d;h.stopPropagation(),confirm(`Bạn có chắc muốn khôi phục dữ liệu từ bản: 
${a.name}?`)&&zd(a.id)&&(i.classList.remove("show"),P.isDefaultMode?(d=document.getElementById("vnpt-btn-default"))==null||d.click():Zr())},i.appendChild(c)})}document.getElementById("vnpt-btn-default").onclick=()=>{P.isDefaultMode=!P.isDefaultMode},P.on("isDefaultMode",i=>Gd(i)),document.getElementById("vnpt-btn-batch-del").onclick=i=>{const s=P.fieldsContainer.querySelectorAll(".vnpt-field-row"),a=i.shiftKey;let c=0;if(s.forEach(l=>{var h;if((h=l.querySelector(".row-chk"))!=null&&h.checked){if(a)l.remove();else{const d=l.querySelector(".f-val");d&&(d.value="")}c++}}),c===0){const l=sw();a?confirm(`Xóa TOÀN BỘ hàng dữ liệu?

(Hệ thống sẽ tự động lưu một bản nội bộ để có thể khôi phục).`)&&(sr(Ha()),s.forEach(h=>h.remove()),U("🗑️ Đã xóa toàn bộ hàng","#ff5252"),Ce()):confirm(`Dọn dẹp TOÀN BỘ giá trị và Xuất JSON dự phòng?

File: "${l}.json"

(Hệ thống vẫn tự động lưu một bản nội bộ).`)&&(Ba(l),sr(Ha()),s.forEach(h=>{const d=h.querySelector(".f-val");d&&(d.value="")}),U("🧹 Đã lưu JSON & Dọn dẹp giá trị","#1a73e8"),Ce())}else U(`${a?"🗑️":"🧹"} Đã ${a?"Xóa":"Dọn giá trị"} ${c} trường`,a?"#ff5252":"#1a73e8"),Ce()},document.getElementById("vnpt-btn-add").onclick=()=>{const i=P.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;ge("bien_moi_"+i,"","",""),Ce()},document.getElementById("vnpt-btn-fill-back").onclick=()=>{Kd()}}function Kd(){Bd();let n=0;P.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(e=>{const t=e.querySelector(".f-key").value.trim(),r=e.querySelector(".f-val").value;t.split(",").map(i=>i.trim()).filter(Boolean).forEach(i=>{xn(i,r)&&n++})}),n>0?U(`✅ Đã đồng bộ ${n} trường lên web`,"#198754"):U("⚠️ Không có trường nào để đồng bộ","#ffc107")}function Gd(n){const e=document.getElementById("vnpt-btn-default");if(P.fieldsContainer.innerHTML="",P.bannerArea.innerHTML="",n){e.classList.add("active"),e.innerHTML="✅ Chế độ: Dữ liệu mặc định",document.getElementById("vnpt-fields-container").classList.add("vnpt-mode-default"),U("📌 Chế độ Dữ liệu mặc định (Có thể sửa)","#ea4335");const t=document.createElement("div");t.className="vnpt-default-banner",t.innerHTML='<span style="color: red;"> LƯU Ý: ĐÂY LÀ DỮ LIỆU MẶC ĐỊNH</span>',P.bannerArea.appendChild(t);const r=V.get(Le);r===null?Object.keys(Me).forEach(i=>{const s=Me[i],a=s&&typeof s=="object"?s.value:s,c=s&&typeof s=="object"?s.label:ue[i]||"";ge(i,a,c)}):Object.keys(r).forEach(i=>{const s=r[i];ge(i,s.value,s.label,s.sync||"")}),aw()}else e.classList.remove("active"),e.innerHTML="🛠 Dữ liệu mặc định VNPT",document.getElementById("vnpt-fields-container").classList.remove("vnpt-mode-default"),U("📋 Đã quay lại Dữ liệu cá nhân"),Zr()}function aw(){const n=document.createElement("div");n.className="vnpt-calc-mapping-default-section",n.style.cssText="border: 1px dashed var(--vnpt-primary); border-radius: 8px; padding: 8px; margin: 8px 0; background: rgba(26, 115, 232, 0.05);",n.innerHTML=`
        <div class="vnpt-calc-mapping-header" style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; user-select: none; padding: 2px 0;">
            <div class="util-submenu-title" style="margin: 0; color: #1a73e8; font-weight: 800; font-size: 10px; text-transform: uppercase;">🛠️ LIÊN KẾT Ô (MAPPING CALC)</div>
            <span class="toggle-icon" style="font-size: 10px; color: #1a73e8; transition: transform 0.2s;">▶</span>
        </div>
        <div class="vnpt-calc-mapping-body" style="display: none; margin-top: 8px; border-top: 1px dashed rgba(26, 115, 232, 0.2); padding-top: 8px;">
            <div class="vnpt-field-row" style="background: none; border: none; padding: 0; margin-bottom: 4px; gap: 8px;">
                <span style="min-width: 70px; font-size: 11px; font-weight: bold;">Trước thuế</span>
                <input data-clink="before" class="cw-map-input" style="flex: 1; height: 26px; font-size: 11px;" placeholder="Ví dụ: tong_tien_truoc_thue">
                <button class="btn-field-link" title="🔗 Link trực quan" style="height: 26px; width: 26px; flex-shrink: 0;">🔗</button>
            </div>
            <div class="vnpt-field-row" style="background: none; border: none; padding: 0; margin-bottom: 4px; gap: 8px;">
                <span style="min-width: 70px; font-size: 11px; font-weight: bold;">Tiền thuế</span>
                <input data-clink="tax" class="cw-map-input" style="flex: 1; height: 26px; font-size: 11px;" placeholder="Ví dụ: thue_gtgt">
                <button class="btn-field-link" title="🔗 Link trực quan" style="height: 26px; width: 26px; flex-shrink: 0;">🔗</button>
            </div>
            <div class="vnpt-field-row" style="background: none; border: none; padding: 0; margin-bottom: 4px; gap: 8px;">
                <span style="min-width: 70px; font-size: 11px; font-weight: bold;">Sau thuế</span>
                <input data-clink="after" class="cw-map-input" style="flex: 1; height: 26px; font-size: 11px;" placeholder="Ví dụ: tong_cong">
                <button class="btn-field-link" title="🔗 Link trực quan" style="height: 26px; width: 26px; flex-shrink: 0;">🔗</button>
            </div>
            <div class="vnpt-field-row" style="background: none; border: none; padding: 0; gap: 8px;">
                <span style="min-width: 70px; font-size: 11px; font-weight: bold;">Bằng chữ</span>
                <input data-clink="text" class="cw-map-input" style="flex: 1; height: 26px; font-size: 11px;" placeholder="Ví dụ: doc_tien">
                <button class="btn-field-link" title="🔗 Link trực quan" style="height: 26px; width: 26px; flex-shrink: 0;">🔗</button>
            </div>
        </div>
    `;const e=n.querySelector(".vnpt-calc-mapping-header"),t=n.querySelector(".vnpt-calc-mapping-body"),r=n.querySelector(".toggle-icon");e.onclick=()=>{const s=t.style.display==="none";t.style.display=s?"block":"none",r.innerText=s?"▼":"▶"};const i=V.get(At)||{...Us};n.querySelectorAll(".vnpt-field-row").forEach(s=>{const a=s.querySelector("input[data-clink]"),c=s.querySelector(".btn-field-link"),l=a.dataset.clink;a.value=Array.isArray(i[l])?i[l].join(", "):i[l]||"",a.onchange=()=>{const h=V.get(At)||{...Us};h[l]=a.value.split(",").map(d=>d.trim()).filter(d=>d),V.set(At,h),U("✅ Đã cập nhật Mapping Calc hệ thống")},c.onclick=h=>{h.stopPropagation(),jd(s,a)}}),P.bannerArea.appendChild(n)}let za=!1,or=null,ei=null;function cw(){window.addEventListener("keydown",n=>{if(za&&ei){dw(n);return}const e=V.get(mr,Bs);for(const[t,r]of Object.entries(e))if(lw(n,r)){n.preventDefault(),uw(t);return}})}function lw(n,e){if(!e||!e.key)return!1;const t=n.key.toLowerCase()===e.key.toLowerCase(),r=!!n.altKey==!!e.altKey,i=!!n.ctrlKey==!!e.ctrlKey,s=!!n.shiftKey==!!e.shiftKey;return t&&r&&i&&s}function uw(n){var e,t,r,i,s,a,c;switch(n){case"SCAN":(e=document.getElementById("vnpt-btn-scan"))==null||e.click();break;case"FILL":(t=document.getElementById("vnpt-btn-fill-back"))==null||t.click();break;case"SCAN_PDF":(r=document.getElementById("vnpt-btn-scan-pdf"))==null||r.click();break;case"EXPORT_DOCX":(i=document.getElementById("vnpt-btn-export"))==null||i.click();break;case"COPY_TXT":(s=document.getElementById("vnpt-btn-export-txt"))==null||s.click();break;case"TOGGLE":(a=document.getElementById("vnpt-toggle-btn"))==null||a.click();break;case"CLEAN":(c=document.getElementById("vnpt-btn-clean-data"))==null||c.click();break}}function hw(n,e){za=!0,or=n,ei=e,U("Vui lòng nhấn tổ hợp phím mong muốn...","info")}function dw(n){var i;if(["Alt","Control","Shift","Meta"].includes(n.key))return;n.preventDefault(),n.stopPropagation();const e={key:n.key.toLowerCase(),altKey:n.altKey,ctrlKey:n.ctrlKey,shiftKey:n.shiftKey},t=V.get(mr,Bs);t[or]={...t[or],...e},V.set(mr,t);const r=((i=t[or])==null?void 0:i.label)||or;U(`Đã lưu phím tắt cho ${r}: ${ja(e)}`,"success"),ei&&ei(e),za=!1,or=null,ei=null}function ja(n){if(!n||!n.key)return"Chưa gán";const e=[];n.ctrlKey&&e.push("Ctrl"),n.altKey&&e.push("Alt"),n.shiftKey&&e.push("Shift");let t=n.key.toUpperCase();return t===" "&&(t="Space"),e.push(t),e.join(" + ")}async function Wd({apiKey:n,model:e,systemInstruction:t,userText:r,fileData:i,filesData:s}){return new Promise((a,c)=>{if(!n)return c("Vui lòng nhập API Key Gemini trong Cài đặt.");const l=`https://generativelanguage.googleapis.com/v1beta/models/${e}:generateContent?key=${n}`,h={system_instruction:{parts:[{text:t}]},contents:[{parts:[{text:r}]}],generation_config:{response_mime_type:"application/json"}};i&&i.base64&&h.contents[0].parts.push({inline_data:{mime_type:i.mimeType,data:i.base64}}),s&&Array.isArray(s)&&s.forEach(p=>{p.base64&&h.contents[0].parts.push({inline_data:{mime_type:p.mimeType,data:p.base64}})});const d=p=>{if(p)try{let y=p.replace(/```json/g,"").replace(/```/g,"").trim();a(JSON.parse(y))}catch(y){console.error("Lỗi parse JSON từ Gemini",y,p),c("AI trả về kết quả không đúng cấu hình JSON.")}else c("AI không trả về kết quả hợp lệ.")};typeof GM_xmlhttpRequest<"u"?GM_xmlhttpRequest({method:"POST",url:l,headers:{"Content-Type":"application/json"},data:JSON.stringify(h),timeout:3e4,onload:p=>{var y,I,T,R,x;if(p.status>=200&&p.status<300)try{const k=JSON.parse(p.responseText),O=(x=(R=(T=(I=(y=k==null?void 0:k.candidates)==null?void 0:y[0])==null?void 0:I.content)==null?void 0:T.parts)==null?void 0:R[0])==null?void 0:x.text;d(O)}catch{c("Lỗi Parse kết quả từ Gemini API.")}else c(`API Gemini lỗi (${p.status}): ${p.responseText}`)},ontimeout:()=>c("Quá hạn thời gian gọi API (30s)"),onerror:p=>c("Lỗi kết nối đến Google Gemini API.")}):fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(h)}).then(p=>p.json()).then(p=>{var I,T,R,x,k;if(p.error)return c(p.error.message);const y=(k=(x=(R=(T=(I=p==null?void 0:p.candidates)==null?void 0:I[0])==null?void 0:T.content)==null?void 0:R.parts)==null?void 0:x[0])==null?void 0:k.text;d(y)}).catch(p=>c(p.message))})}async function fw(n,e){if(!n)throw new Error("Vui lòng nhập API Key.");const t={contents:[{parts:[{text:"Ping"}]}],generation_config:{max_output_tokens:5,response_mime_type:"text/plain"}},r=`https://generativelanguage.googleapis.com/v1beta/models/${e}:generateContent?key=${n}`;return new Promise((i,s)=>{const a=c=>{var l;try{return((l=JSON.parse(c).error)==null?void 0:l.message)||c}catch{return c}};typeof GM_xmlhttpRequest<"u"?GM_xmlhttpRequest({method:"POST",url:r,headers:{"Content-Type":"application/json"},data:JSON.stringify(t),timeout:1e4,onload:c=>{if(c.status>=200&&c.status<300)i(!0);else{const l=a(c.responseText);s(`API Error ${c.status}: ${l}`)}},onerror:c=>s("Lỗi kết nối mạng hoặc CORS."),ontimeout:()=>s("Hết thời gian chờ (10s).")}):fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}).then(async c=>{if(c.ok)return i(!0);const l=await c.text();s(`API Error ${c.status}: ${a(l)}`)}).catch(c=>s(c.message))})}let ct=null;function pw(){P.isInspecting=!P.isInspecting,P.isInspecting?(gw(),U("🔍 Chế độ Soi: Đang bật. Hãy di chuột và Click vào ô nhập liệu.","#1a73e8")):(mw(),U("🔍 Chế độ Soi: Đã tắt."))}function gw(){document.addEventListener("mouseover",Qd,!0),document.addEventListener("click",Yd,!0),document.body.classList.add("vnpt-inspecting-mode")}function mw(){document.removeEventListener("mouseover",Qd,!0),document.removeEventListener("click",Yd,!0),document.body.classList.remove("vnpt-inspecting-mode"),ct&&(ct.classList.remove("vnpt-inspect-highlight"),ct=null)}function Qd(n){if(!P.isInspecting)return;const e=n.target.closest("input, select, textarea, ng-select2, label");if(!e){ct&&(ct.classList.remove("vnpt-inspect-highlight"),ct=null);return}ct&&ct!==e&&ct.classList.remove("vnpt-inspect-highlight"),e.classList.add("vnpt-inspect-highlight"),ct=e}function Yd(n){if(!P.isInspecting||n.target.closest("#vnpt-docx-widget")||n.target.closest("#vnpt-inline-calc"))return;n.preventDefault(),n.stopPropagation();const e=n.target.closest("input, select, textarea, ng-select2, label");if(!e)return;const t=yw(e),r=e.getAttribute("title")||e.value||"";t.key?(ge(t.key,r,t.label||""),Ce(),U(`✅ Đã bắt được: ${t.label||t.key}${r?" ("+r+")":""}`,"#1e8e3e")):U("⚠️ Không tìm thấy ID hoặc tên cố định cho trường này.","#ffc107")}function yw(n){let e="",t="";if(e=n.getAttribute("formcontrolname")||"",e||(e=n.id||n.getAttribute("name")||""),t=vw(n),n.tagName.toLowerCase()==="label"){const r=n.getAttribute("for"),i=r?document.getElementById(r):n.querySelector("input, select, textarea");i&&(e=i.getAttribute("formcontrolname")||i.id||i.getAttribute("name")||""),t||(t=n.innerText.trim())}return{key:e,label:t.replace(/[:*]/g,"").trim()}}function vw(n){if(n.id){const r=document.querySelector(`label[for="${n.id}"]`);if(r)return r.innerText.trim()}const e=n.closest("label");if(e)return e.innerText.trim();const t=n.previousElementSibling;return t&&(t.tagName==="LABEL"||t.classList.contains("label"))?t.innerText.trim():n.getAttribute("placeholder")||""}function _w(n){const e=document.createElement("div");e.className="vnpt-cloud-sync-section";const t=r=>{r?(e.innerHTML=`
        <div class="util-submenu-title">☁️ Tài khoản Cloud</div>
        <div class="cloud-user-info" style="padding: 4px 12px; font-size: 11px; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 700; color: var(--vnpt-success);">● ${r.email}</span>
          <button class="util-item-small danger" id="vnpt-btn-cloud-logout" style="width: auto; padding: 2px 8px;">Đăng xuất</button>
        </div>
        
        <div class="workspace-area" style="padding: 4px 8px; border-top: 1px solid var(--vnpt-border); margin-top: 4px;">
          <div style="font-size: 9px; font-weight: 800; color: #1a73e8; margin-bottom: 2px; text-transform: uppercase;">Workspace / Cơ quan</div>
          <div style="display: flex; gap: 4px;">
            <input type="text" id="vnpt-workspace-id" placeholder="Mã Workspace (VD: HaNoi_CA)" class="cw-map-input" style="height: 24px; font-size: 10px;">
            <button class="util-item-small" id="vnpt-btn-save-workspace" style="width: auto; padding: 0 8px; height: 24px;">Lưu</button>
          </div>
        </div>

        <div class="util-separator"></div>
        <div class="util-submenu-title">Đồng bộ cá nhân</div>
        <div class="util-action-row">
          <button class="util-item-small" id="vnpt-btn-cloud-push">📤 Đẩy dữ liệu</button>
          <button class="util-item-small" id="vnpt-btn-cloud-pull">📥 Kéo dữ liệu</button>
        </div>
        <div class="util-action-row" style="margin-top: 2px;">
          <button class="util-item-small" id="vnpt-btn-cloud-keys-push" style="background: var(--vnpt-primary-light); color: var(--vnpt-primary);">💾 Sao lưu Keys</button>
          <button class="util-item-small" id="vnpt-btn-cloud-keys-pull" style="background: var(--vnpt-primary-light); color: var(--vnpt-primary);">🔄 Khôi phục Keys</button>
        </div>
      `,Oe.getUserSettings().then(i=>{i&&i.workspace&&(document.getElementById("vnpt-workspace-id").value=i.workspace)}),document.getElementById("vnpt-btn-save-workspace").onclick=async()=>{const i=document.getElementById("vnpt-workspace-id").value.trim();try{await Oe.updateUserSettings({workspace:i||"global"}),U("✅ Đã cập nhật Workspace: "+(i||"global"));const s=document.getElementById("vnpt-template-manager");if(s&&s.dataset.activeTab==="cloud"){const{renderTemplateManager:a}=await Promise.resolve().then(()=>$E);a(s,P.onSelectTemplate,P.templateName)}}catch(s){U("❌ Lỗi: "+s.message,"#ea4335")}},document.getElementById("vnpt-btn-cloud-logout").onclick=async()=>{await Oe.logout(),U("👋 Đã đăng xuất!")},document.getElementById("vnpt-btn-cloud-push").onclick=async()=>{try{U("⏳ Đang đẩy dữ liệu...");const{getProfiles:i}=await Promise.resolve().then(()=>af),s=i();for(const y of s)await Oe.pushProfile(y);const{SK_CALC_MAP:a,SK_HOTKEYS:c,SK_TXT_TEMPLATE:l}=await Promise.resolve().then(()=>yr),{Storage:h}=await Promise.resolve().then(()=>Ri),{DEFAULT_CALC_MAP:d}=await Promise.resolve().then(()=>Fd),p={calcMap:h.get(a)??d,hotkeys:h.get(c),textTemplate:h.get(l)};await Oe.pushGlobalConfig(p),U("✅ Đã đồng bộ lên Cloud!")}catch(i){U("❌ Lỗi: "+i.message,"#ea4335")}},document.getElementById("vnpt-btn-cloud-pull").onclick=async()=>{try{U("⏳ Đang kéo dữ liệu...");const i=await Oe.pullProfiles(),s=await Oe.pullGlobalConfig();if(i.length===0&&!s){U("ℹ️ Không tìm thấy dữ liệu trên Cloud");return}if(confirm(`Tìm thấy ${i.length} bản ghi dữ liệu. Bạn có muốn ghi đè bộ cài đặt Local không?`)){const{importProfiles:a}=await Promise.resolve().then(()=>af);if(a(i),s){const{SK_CALC_MAP:c,SK_HOTKEYS:l,SK_TXT_TEMPLATE:h}=await Promise.resolve().then(()=>yr),{Storage:d}=await Promise.resolve().then(()=>Ri),{DEFAULT_CALC_MAP:p}=await Promise.resolve().then(()=>Fd);d.set(c,s.calcMap??p),s.hotkeys&&d.set(l,s.hotkeys),s.textTemplate&&d.set(h,s.textTemplate)}U("✅ Đã khôi phục toàn bộ cấu hình!"),setTimeout(()=>location.reload(),1e3)}}catch(i){U("❌ Lỗi: "+i.message,"#ea4335")}},document.getElementById("vnpt-btn-cloud-keys-push").onclick=async()=>{try{const{SK_GEMINI_KEY:i}=await Promise.resolve().then(()=>yr),{Storage:s}=await Promise.resolve().then(()=>Ri),a=s.get(i);if(!a){U("ℹ️ Không tìm thấy Gemini Key để sao lưu");return}U("⏳ Đang sao lưu Keys..."),await Oe.backupKeys({gemini_key:a}),U("✅ Đã sao lưu API Keys lên Cloud!")}catch(i){U("❌ Lỗ: "+i.message,"#ea4335")}},document.getElementById("vnpt-btn-cloud-keys-pull").onclick=async()=>{try{U("⏳ Đang khôi phục Keys...");const i=await Oe.restoreKeys();if(!i||!i.gemini_key){U("ℹ️ Không tìm thấy Keys trên Cloud");return}const{SK_GEMINI_KEY:s}=await Promise.resolve().then(()=>yr),{Storage:a}=await Promise.resolve().then(()=>Ri);a.set(s,i.gemini_key),U("✅ Đã khôi phục API Keys từ Cloud!"),setTimeout(()=>location.reload(),1e3)}catch(i){U("❌ Lỗi: "+i.message,"#ea4335")}}):(e.innerHTML=`
        <div class="util-submenu-title">☁️ Tài khoản Cloud</div>
        <div style="padding: 8px; text-align: center;">
          <p style="font-size: 10px; color: #666; margin-bottom: 8px;">Đăng nhập để đồng bộ Profile & API Key giữa các máy tính.</p>
          <button class="vnpt-btn-confirm" id="vnpt-btn-cloud-login-trigger" style="width: 100%; font-size: 12px;">Đăng nhập / Đăng ký</button>
        </div>
      `,document.getElementById("vnpt-btn-cloud-login-trigger").onclick=()=>{bw()})};Oe.onAuthChange(t),n.appendChild(e)}function bw(){const n=document.createElement("div");n.className="vnpt-pdf-overlay",n.innerHTML=`
    <div class="vnpt-pdf-dialog-box" style="width: 320px;">
      <div class="pdf-dlg-header">
        <h3 style="text-align: center;">🔥 Firebase Sync</h3>
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
        <input type="email" id="cloud-email" placeholder="Email" class="cw-map-input" style="height: 36px; font-size: 13px;">
        <input type="password" id="cloud-password" placeholder="Mật khẩu" class="cw-map-input" style="height: 36px; font-size: 13px;">
      </div>
      <div class="vnpt-pdf-actions" style="flex-direction: column; gap: 8px;">
        <button id="btn-do-login" class="vnpt-btn-confirm" style="width: 100%;">Đăng nhập</button>
        <button id="btn-do-signup" class="util-item-small" style="width: 100%; border: none; font-size: 11px;">Chưa có tài khoản? Đăng ký ngay</button>
        <button id="btn-close-cloud" class="pdf-btn-cancel" style="width: 100%;">Đóng</button>
      </div>
    </div>
  `,document.body.appendChild(n);const e=n.querySelector("#cloud-email"),t=n.querySelector("#cloud-password");n.querySelector("#btn-do-login").onclick=async()=>{try{await Oe.signIn(e.value,t.value),U("✅ Đăng nhập thành công!"),n.remove()}catch(r){console.error("[CloudSync] Login Error:",r);const i=r.code==="auth/operation-not-allowed"?"Lỗi: Bạn chưa bật Email/Password trong Firebase Console!":r.message;U("❌ "+i,"#ea4335")}},n.querySelector("#btn-do-signup").onclick=async()=>{try{if(!e.value||!t.value){U("⚠️ Vui lòng nhập đầy đủ Email và Mật khẩu","#ffc107");return}confirm("Đăng ký tài khoản mới với Email này?")&&(await Oe.signUp(e.value,t.value),U("✅ Đăng ký thành công!"),n.remove())}catch(r){console.error("[CloudSync] Signup Error:",r);const i=r.code==="auth/operation-not-allowed"?"Lỗi: Bạn chưa bật Email/Password trong Firebase Console!":r.message;U("❌ "+i,"#ea4335")}},n.querySelector("#btn-close-cloud").onclick=()=>n.remove()}function Ew(){const n=document.getElementById("vnpt-docx-widget")||document.createElement("div");n.id="vnpt-docx-widget";const e=V.get(Ti)===!0;n.innerHTML=`
        <button id="vnpt-toggle-btn" title="Mở/Đóng UI Hợp đồng" class="${e?"btn-opened":"btn-closed"}">${e?"✖":"📄"}</button>

        <div id="vnpt-export-panel" style="display: ${e?"flex":"none"};">
            <!-- 4 Corner Resizers -->
            <div class="vnpt-resizer tl"></div>
            <div class="vnpt-resizer tr"></div>
            <div class="vnpt-resizer bl"></div>
            <div class="vnpt-resizer br"></div>

            <div id="vnpt-panel-header" title="Kẹp chuột vào đây để di chuyển">
                <div class="header-left">
                    <span id="vnpt-panel-title">VNPT PRO</span>
                </div>
                <div class="header-center">
                    <button class="vnpt-btn-action" id="vnpt-btn-ai-mode" title="Mở bảng điều khiển AI Scanner">AI Scanner</button>
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-scan" title="Lấy data theo biểu mẫu web">Quét dữ liệu</button>
                    <button class="vnpt-btn-action btn-fill-back" id="vnpt-btn-fill-back" title="Điền dữ liệu ngược lên web">Điền web</button>
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-toggle-id" title="Ẩn hiện key">ID</button>
                    <input type="file" id="vnpt-pdf-input" accept=".pdf,image/*" style="display:none;" />
                </div>
                <div class="header-right">
                    <button class="vnpt-btn-icon btn-add" id="vnpt-btn-add" title="Chèn thêm trường trống">✚</button>
                    <button class="vnpt-btn-icon btn-clean" id="vnpt-btn-batch-del" title="Dọn giá trị & Lưu JSON (Shift+Click để Xóa hàng)">🗑</button>
                    <div class="vnpt-restore-dropdown" style="position: relative; display: flex;">
                        <button class="vnpt-btn-icon btn-restore" id="vnpt-btn-restore-last" title="Khôi phục bản gần nhất">⏪</button>
                        <div id="vnpt-backup-history" class="vnpt-backup-history"></div>
                    </div>
                    
                    <button class="vnpt-btn-icon btn-inspect" id="vnpt-btn-inspect" title="Bật chế độ 'Soi' để bắt selector trường web">🔍</button>

                    <div class="vnpt-util-dropdown">
                        <button class="vnpt-btn-icon btn-more" id="vnpt-btn-more" title="Thêm công cụ">⚙️</button>
                        <div class="vnpt-util-menu" id="vnpt-util-menu">
                            <div class="util-config-grid">
                                <div class="util-column">
                                    <div class="util-submenu-title">Cấu hình hệ thống</div>
                                    <button class="util-item" id="vnpt-btn-default">Dữ liệu mặc định VNPT</button>
                                    <button class="util-item danger" id="vnpt-btn-clean-data" title="Xóa dữ liệu hoặc Reset cài đặt hệ thống">Dọn dẹp & Reset hệ thống</button>

                                    <div class="util-separator"></div>
                                    <div class="util-submenu-title">Dữ liệu hệ thống</div>
                                    <div class="util-action-row">
                                        <button class="util-item-small" id="vnpt-btn-import-json">Nhập JSON</button>
                                        <button class="util-item-small" id="vnpt-btn-export-json">Xuất JSON</button>
                                        <input type="file" id="vnpt-file-import-json" name="vnpt-file-import-json" accept=".json" style="display: none;">
                                    </div>

                                    <div class="util-separator"></div>
                                    <div class="util-submenu-title">Kích thước bảng:</div>
                                    <div class="size-options">
                                        <button data-size="S">S</button>
                                        <button data-size="M">M</button>
                                        <button data-size="L">L</button>
                                        <button data-size="Full">Full</button>
                                    </div>
                                </div>
                                <div class="util-column vertical-separator">
                                    <div class="util-submenu-title">Cấu hình phím tắt</div>
                                    <div id="vnpt-hotkey-list" class="vnpt-hotkey-list">
                                        <!-- Replaced by renderHotkeys -->
                                    </div>
                                </div>
                            </div>
                                                        
                            <div class="util-separator"></div>
                            <div id="vnpt-cloud-sync-container"></div>

                            <div class="util-separator"></div>
                            <div class="util-submenu-title">Cấu hình AI OCR (Gemini)</div>
                            <div class="cw-row-map">
                                <span>API Key</span>
                                <input id="vnpt-gemini-key" type="password" placeholder="AIzaSy..." title="Lấy mã Key từ Google AI Studio" class="cw-map-input">
                            </div>
                            <div class="cw-row-map">
                                <span>Mô hình</span>
                                <select id="vnpt-gemini-model" class="cw-map-input">
                                    <optgroup label="Thế hệ 2.5 (Ổn định nhất)">
                                        <option value="gemini-2.5-flash" selected>Gemini 2.5 Flash (Cân bằng / Khuyên dùng)</option>
                                        <option value="gemini-2.5-pro">Gemini 2.5 Pro (Suy luận sâu / Thông minh)</option>
                                        <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash-Lite (Tốc độ cao / Tiết kiệm)</option>
                                    </optgroup>
                                    <optgroup label="Thế hệ 3.1 (Thử nghiệm)">
                                        <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview (Mới nhất)</option>
                                        <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash-Lite Preview</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div class="cw-row-map" style="margin-top: 4px; justify-content: flex-end;">
                                <button class="util-item-small" id="vnpt-btn-test-gemini" style="width: auto; padding: 4px 12px; background: var(--vnpt-primary-light); color: var(--vnpt-primary); border-color: var(--vnpt-primary);">⚡ Kiểm tra kết nối</button>
                            </div>


                        </div>
                    </div>
                </div>
            </div>

            <!-- Inline Calculator Container -->
            <div id="vnpt-inline-calc"></div>

            <div id="vnpt-panel-body">
                <!-- AI Scanner Section (Hidden by default) -->
                <div id="vnpt-ai-scanner-section" class="vnpt-ai-scanner-section" style="display: none;">
                    <div class="ai-scanner-header" style="margin-bottom: -2px;">
                        <span class="ai-title">🤖 Khu vực tải tệp & Nhập văn bản:</span>
                    </div>
                    
                    <div class="ai-scan-row">
                        <div class="ai-queue-container" id="vnpt-ai-queue-container" title="Bấm để chọn file hoặc dán (Ctrl+V) file/ảnh vào đây">
                            <div class="ai-queue-placeholder" id="vnpt-ai-queue-placeholder">
                                <span>📁</span>
                                <span>Kéo thả / Ctrl+V</span>
                            </div>
                            <div class="ai-queue-list" id="vnpt-ai-queue-list"></div>
                        </div>

                        <textarea id="vnpt-raw-scan-input" placeholder="Nội dung file sau khi quét sẽ xuất hiện ở đây để bạn kiểm tra, HOẶC bạn có thể dán trực tiếp Text vào đây để phân loại..."></textarea>
                    </div>
                    
                    <div class="raw-scan-actions">
                        <button class="vnpt-btn-icon" id="vnpt-btn-show-pdf" title="Xem lại Kết quả cũ">📝</button>
                        <button class="vnpt-btn-icon" id="vnpt-btn-clear-queue" title="Xóa hàng đợi & nội dung">🗑️</button>
                        <button id="vnpt-btn-raw-process-local" class="vnpt-btn-confirm btn-local-process" title="Phân loại nhanh văn bản bằng offline Regex">⚡ QR Text</button>
                        <button id="vnpt-btn-ai-process" class="vnpt-btn-confirm btn-ai-process">✨ QUÉT AI MỚI</button>
                    </div>
                </div>

                <div id="vnpt-banner-area"></div>
                <div id="vnpt-fields-container">
                    <div class="vnpt-fields-header">
                        <span class="h-chk"></span>
                        <span class="h-label">Tên Nhãn</span>
                        <span class="h-key">Biến / ID Web</span>
                        <span class="h-drag"></span>
                        <span class="h-val">Giá trị</span>
                    </div>
                    <div id="vnpt-fields-list">
                        <div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>
                    </div>
                </div>

                <!-- Text Template Section -->
                <div id="vnpt-txt-section">
                    <div id="vnpt-txt-body" style="display:none;">
                        <textarea
                            id="vnpt-txt-template"
                            name="vnpt-txt-template"
                            placeholder="Nhập nội dung, dùng @key làm placeholder&#10;Ví dụ: Tôi là @tenDaiDienn chào bạn"
                            rows="4"
                        ></textarea>
                    </div>
                    <div class="vnpt-txt-header">
                        <span>📝 Text Template</span>
                        <button id="vnpt-txt-toggle" title="Ẩn/Hiện">▶</button>
                    </div>
                </div>

                <!-- Template Manager -->
                <div id="vnpt-template-section">
                    <div id="vnpt-template-manager"></div>
                </div>



                <div class="bottom-export-row">
                    <div class="vnpt-control-group" id="vnpt-local-file-group">
                        <input type="file" id="vnpt-template-file" name="vnpt-template-file" accept=".docx" style="display:none;" />
                        <label for="vnpt-template-file" class="btn-upload-local" title="Chọn file DOCX từ máy tính">📁</label>
                    </div>
                    <div class="vnpt-control-group">
                        <input type="text" id="vnpt-export-filename" name="vnpt-export-filename" value="Export_Auto.docx" title="Tên file DOCX khi xuất" />
                    </div>
                    <button class="vnpt-btn-action btn-export-txt" id="vnpt-btn-export-txt" title="Sao chép nội dung dựa trên Text Template">📋 COPY</button>
                    <button class="vnpt-btn-action btn-export" id="vnpt-btn-export" title="Xuất ra file DOCX">🖨️ XUẤT</button>
                </div>
            </div>
        </div>
    `,document.body.appendChild(n),P.widget=n,P.panel=document.getElementById("vnpt-export-panel"),P.toggleBtn=document.getElementById("vnpt-toggle-btn"),P.header=document.getElementById("vnpt-panel-header"),P.bannerArea=document.getElementById("vnpt-banner-area"),P.fieldsContainer=document.getElementById("vnpt-fields-list");try{const x=V.get(wi);x&&x.width&&x.height&&(P.panel.style.width=x.width+"px",P.panel.style.height=x.height+"px")}catch(x){console.error("Lỗi load size panel:",x)}new ResizeObserver(x=>{if(P.panel.style.display!=="none")for(let k of x){const{width:O,height:D}=k.contentRect;O>0&&D>0&&V.setDebounced(wi,{width:Math.round(O+20),height:Math.round(D+20)},1e3)}}).observe(P.panel),P.panelBody=document.getElementById("vnpt-panel-body"),at(document.getElementById("vnpt-template-manager"),(x,k)=>{P.templateBuffer=x,P.templateName=k}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const x=this.files&&this.files[0];if(!x)return;const k=document.getElementById("vnpt-template-manager");kd(x,k,(O,D)=>{P.templateBuffer=O,P.templateName=D}),this.value=""}),P.toggleBtn.addEventListener("click",x=>{P.hasDragged||(P.panel.style.display==="none"?(P.panel.style.display="flex",P.toggleBtn.className="btn-opened",P.toggleBtn.innerHTML="✖",V.set(Ti,!0)):(P.panel.style.display="none",P.toggleBtn.className="btn-closed",P.toggleBtn.innerHTML="📄",V.set(Ti,!1)))});const r=document.getElementById("vnpt-btn-more"),i=document.getElementById("vnpt-util-menu"),s={S:{width:"380px",height:"420px"},M:{width:"460px",height:"600px"},L:{width:"620px",height:"800px"},Full:{width:"98vw",height:"92vh"}},a=document.getElementById("vnpt-gemini-key"),c=document.getElementById("vnpt-gemini-model");a&&c&&Promise.resolve().then(()=>yr).then(({SK_GEMINI_KEY:x,SK_GEMINI_MODEL:k})=>{a.value=V.get(x)||"";const O=V.get(k)||"gemini-2.5-flash";let D=Array.from(c.options).some(H=>H.value===O);c.value=D?O:"gemini-2.5-flash",a.onchange=()=>{V.set(x,a.value.trim())},c.onchange=()=>{V.set(k,c.value)};const F=document.getElementById("vnpt-btn-test-gemini");F&&(F.onclick=async()=>{const H=a.value.trim(),j=c.value;if(!H){U("⚠️ Vui lòng nhập API Key trước khi thử","#ffc107");return}F.disabled=!0,F.textContent="⏳ Đang thử...";try{await fw(H,j),U("✅ Kết nối tới Gemini thành công!","#1e8e3e")}catch(_){U("❌ Kết nối thất bại: "+_,"#ea4335")}finally{F.disabled=!1,F.textContent="⚡ Kiểm tra kết nối"}})}),document.getElementById("vnpt-btn-export-json").onclick=()=>Ba();const l=document.getElementById("vnpt-txt-toggle"),h=document.getElementById("vnpt-txt-body");l&&h&&l.addEventListener("click",x=>{x.stopPropagation();const k=h.style.display==="none";h.style.display=k?"":"none",l.textContent=k?"▲":"▶"});const d=document.getElementById("vnpt-btn-import-json"),p=document.getElementById("vnpt-file-import-json");d.onclick=()=>p.click(),p.onchange=async x=>{x.target.files.length>0&&await Hd(x.target.files[0])&&setTimeout(()=>location.reload(),1500)},r.addEventListener("click",x=>{x.stopPropagation();const k=i.classList.toggle("show");r.classList.toggle("active",k)}),i.addEventListener("click",x=>{x.stopPropagation()}),document.addEventListener("click",x=>{i.classList.contains("show")&&(i.classList.remove("show"),r.classList.remove("active"))}),i.querySelectorAll(".size-options button").forEach(x=>{x.addEventListener("click",k=>{const O=k.target.getAttribute("data-size"),D=s[O];D&&(P.panel.style.width=D.width,P.panel.style.height=D.height),i.classList.remove("show"),r.classList.remove("active")})});function y(){const x=document.getElementById("vnpt-hotkey-list");if(!x)return;const k=V.get(mr,Bs);x.innerHTML="",Object.entries(k).forEach(([O,D])=>{const F=document.createElement("div");F.className="vnpt-hotkey-row",F.innerHTML=`
                <span class="vnpt-hotkey-label">${D.label||O}</span>
                <button class="vnpt-hotkey-btn" data-action="${O}">${ja(D)}</button>
            `;const H=F.querySelector(".vnpt-hotkey-btn");H.onclick=j=>{j.stopPropagation(),!H.classList.contains("recording")&&(H.classList.add("recording"),H.textContent="Bấm phím...",hw(O,_=>{H.classList.remove("recording"),H.textContent=ja(_)}))},x.appendChild(F)})}y(),P.panel.querySelectorAll(".vnpt-resizer").forEach(x=>{x.addEventListener("mousedown",k=>{k.preventDefault(),k.stopPropagation();const O=k.clientX,D=k.clientY,F=P.panel.offsetWidth,H=P.panel.offsetHeight,j=P.widget.getBoundingClientRect(),_=j.top;window.innerWidth-j.right,P.panel.classList.add("vnpt-resizing"),document.body.classList.add("vnpt-resizing-global");const m=window.getComputedStyle(x).cursor;document.body.style.cursor=m;const b=E=>{const A=E.clientX-O,v=E.clientY-D;if(x.classList.contains("br"))P.panel.style.width=Math.max(360,F+A)+"px",P.panel.style.height=Math.max(250,H+v)+"px";else if(x.classList.contains("bl")){const ne=F-A;ne>360&&(P.panel.style.width=ne+"px"),P.panel.style.height=Math.max(250,H+v)+"px"}else if(x.classList.contains("tr")){P.panel.style.width=Math.max(360,F+A)+"px";const ne=H-v;ne>250&&(P.panel.style.height=ne+"px",P.widget.style.top=_+v+"px")}else if(x.classList.contains("tl")){const ne=F-A,Ue=H-v;ne>360&&(P.panel.style.width=ne+"px"),Ue>250&&(P.panel.style.height=Ue+"px",P.widget.style.top=_+v+"px")}},w=()=>{window.removeEventListener("mousemove",b),window.removeEventListener("mouseup",w),P.panel.classList.remove("vnpt-resizing"),document.body.classList.remove("vnpt-resizing-global"),document.body.style.cursor="";const E=P.widget.id==="vnpt-docx-widget";V.setDebounced(Ei,{right:E?P.widget.style.right:void 0,top:P.widget.style.top,x:E?void 0:parseFloat(P.widget.style.left),y:parseFloat(P.widget.style.top)},500),V.setDebounced(wi,{width:P.panel.offsetWidth,height:P.panel.offsetHeight},500)};window.addEventListener("mousemove",b),window.addEventListener("mouseup",w)})});const T=document.getElementById("vnpt-btn-inspect");T&&(T.onclick=()=>pw(),P.on("isInspecting",x=>{T.classList.toggle("active",x)}));const R=document.getElementById("vnpt-cloud-sync-container");R&&_w(R)}function Xd(n,e,t,r=null,i=null){let s=!1,a=0,c=0,l=0,h=0,d=!1;const p=5;function y(T){d!==T&&(d=T,i&&i(T))}function I(T){if(T.button!==0||["INPUT","BUTTON","SELECT","TEXTAREA"].includes(T.target.tagName)||T.target.isContentEditable)return;s=!0,P.hasDragged=!1,l=T.clientX,h=T.clientY;const x=n.getBoundingClientRect();a=T.clientX-x.left,c=T.clientY-x.top,document.body.style.userSelect="none",e&&e.forEach(k=>k.style.cursor="grabbing"),r&&r(),T.preventDefault()}return e.forEach(T=>{T.addEventListener("mousedown",I)}),document.addEventListener("mousemove",function(T){if(!s)return;if(!P.hasDragged)if(Math.sqrt(Math.pow(T.clientX-l,2)+Math.pow(T.clientY-h,2))>p)P.hasDragged=!0;else return;let R=T.clientX-a,x=T.clientY-c;const k=window.innerWidth,O=window.innerHeight,D=document.getElementById("vnpt-toggle-btn"),F=D?D.offsetWidth:40,H=D?D.offsetHeight:40,j=n.id==="vnpt-docx-widget";let _=n.offsetWidth||0;if(j){let w=F+6-_,E=k-_+6;R<w&&(R=w),R>E&&(R=E)}else _=_||200,R<0&&(R=0),R+_>k&&(R=Math.max(0,k-_));let m=d;if(j?m=!1:d?T.clientY<O-40&&(m=!1):T.clientY>O-10&&(m=!0),x<0&&(x=0),m)y(!0),n.style.top=O-n.offsetHeight+"px",j?(n.style.right=k-R-_+"px",n.style.left="auto"):(n.style.left=R+"px",n.style.right="auto"),n.style.bottom="auto";else{y(!1);let b=n.offsetHeight||40,w;if(j)w=10+H;else{const E=n.querySelector(".cw-title-bar");w=E?E.offsetHeight:b}x+w>O&&(x=Math.max(0,O-w)),n.style.top=x+"px",j?(n.style.right=k-R-_+"px",n.style.left="auto"):(n.style.left=R+"px",n.style.right="auto"),n.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(s){if(s=!1,document.body.style.userSelect="",e&&e.forEach(T=>T.style.cursor="grab"),t){const T=n.id==="vnpt-docx-widget";V.set(t,{left:T?void 0:n.style.left,right:T?n.style.right:void 0,top:n.style.top,x:T?void 0:parseFloat(n.style.left),y:parseFloat(n.style.top),docked:d})}setTimeout(()=>{P.hasDragged=!1},100)}}),{isDocked:()=>d,setDocked:y}}function ww(){P.widget&&P.header&&(Xd(P.widget,[P.header],Ei),window.addEventListener("resize",()=>{const n=window.innerWidth,e=window.innerHeight,t=document.getElementById("vnpt-toggle-btn"),r=t?t.offsetWidth:40,i=t?t.offsetHeight:40;let s=P.widget.getBoundingClientRect(),a=s.left,c=s.top,l=P.widget.offsetWidth||0,d=r+6-l,p=n-l+6;a<d&&(a=d),a>p&&(a=p),c+10+i>e&&(c=Math.max(0,e-(10+i))),P.widget.style.right=n-a-l+"px",P.widget.style.top=c+"px"}))}function Jd(n){const e=n.toLowerCase(),{ngay:t,thang:r,nam:i}=Dd(),s=`${t}/${r}/${i}`;return{"ngayky, ngayky1":t,ngayky:t,"thangky, thangky1":r,thangky:r,"namky, namky1":i,namky:i,"ngaytiepnhan, ngaythangnamky":s,ngaytiepnhan:s,ngaythangnamky:s,soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[e]||""}const Zd="vnpt_remote_labels",ef="vnpt_remote_last_fetch",Tw=36e5,ti={activeLabels:{...ue},async init(){const n=V.get(Zd);n&&(this.activeLabels={...ue,...n});const e=V.get(ef)||0;Date.now()-e>Tw&&await this.refresh()},async refresh(){try{const n=await Oe.getRemoteConfigs();n&&n.selectors&&(this.activeLabels={...ue,...n.selectors},V.set(Zd,n.selectors),V.set(ef,Date.now()),console.log("[RemoteConfig] Selectors updated from Cloud"))}catch(n){console.error("[RemoteConfig] Failed to fetch remote selectors:",n)}},getLabels(){return this.activeLabels}};function tf(){Fs();const n=ti.getLabels(),e=Object.keys(n).find(a=>a.includes("diaChi"));if(!e)return"";const t=n[e],r=e.split(",").map(a=>a.trim());let i={detail:"",ward:"",district:"",province:""};r.forEach(a=>{const c=Qt(a,t);if(c){let l="";if(c.tagName.toLowerCase()==="ng-select2"){const h=c.querySelector(".select2-selection__rendered");l=h?h.getAttribute("title")||h.textContent.trim():""}else l=c.value||c.getAttribute("title")||"";l=(l||"").trim(),l&&l!=="--- Chọn ---"&&!l.includes("Chọn")&&(a==="diaChi"||a==="duong"?i.detail=l:a.includes("tinh")?i.province=l:a.includes("huyen")||a.includes("quan")?i.district=l:(a.includes("xa")||a.includes("phuong"))&&(i.ward=l))}}),document.querySelectorAll("ng-select2").forEach(a=>{const c=a.querySelector(".select2-selection__rendered");if(!c)return;const l=(c.getAttribute("title")||c.textContent||"").trim();!l||l==="--- Chọn ---"||l.includes("Chọn")||((l.startsWith("Xã")||l.startsWith("Phường")||l.startsWith("Thị trấn"))&&!i.ward?i.ward=l:(l.startsWith("Quận")||l.startsWith("Huyện")||l.startsWith("Thị xã"))&&!i.district?i.district=l:(l.startsWith("Tỉnh")||l.startsWith("Thành phố"))&&!i.province&&(i.province=l))});let s=[];if(i.detail&&s.push(i.detail),i.ward&&s.push(i.ward),i.district&&s.push(i.district),i.province){let a=i.province;!a.startsWith("Tỉnh")&&!a.startsWith("Thành phố")&&(a="Tỉnh "+a),s.push(a)}return s.length>0&&s.push("Việt Nam"),s.filter(a=>!!a).join(", ")}function Ka(){let n="";const e=["tinhId","tinhIdNew"];for(const t of e){const r=Qt(t);if(r){if(r.tagName.toLowerCase()==="ng-select2"){const i=r.querySelector(".select2-selection__rendered");n=i?i.getAttribute("title")||i.textContent.trim():""}else n=r.value||r.getAttribute("title")||"";if(n&&n!=="--- Chọn ---"&&!n.includes("Chọn"))break}}if(!n||n==="--- Chọn ---"){const t=document.querySelectorAll("ng-select2");for(const r of t){const i=r.querySelector(".select2-selection__rendered"),s=((i==null?void 0:i.getAttribute("title"))||(i==null?void 0:i.textContent)||"").trim();if(s&&(s.startsWith("Tỉnh")||s.startsWith("Thành phố"))&&!s.includes("Chọn")){n=s;break}}}return n?n.trim().replace(/^(Tỉnh|Thành phố)\s+/i,""):""}function Iw(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){if(sr("Trước khi quét mới: "+qa()),P.isDefaultMode){Object.keys(Me).forEach(s=>{ge(s,Me[s],ue[s]||"")}),Ce(),U("Đã nạp lại dữ liệu mặc định từ hệ thống.");return}let r=0;Fs();const i=ti.getLabels();Object.keys(i).forEach(s=>{const a=i[s],c=s.split(",").map(p=>p.trim()),l=c.includes("diaChi"),h=c.includes("noiCapSoDkdn");let d="";if(l)d=tf(),d&&r++;else if(h){const p=Ka();p&&(d="SKDT "+p,r++)}else c.forEach(p=>{var I;if(d)return;const y=Qt(p,a);if(y){if(y.tagName.toLowerCase()==="select")d=((I=y.options[y.selectedIndex])==null?void 0:I.text)||"";else if(y.tagName.toLowerCase()==="ng-select2"){const T=y.querySelector(".select2-selection__rendered");d=T?T.getAttribute("title")||T.textContent.trim():""}else d=y.value||y.getAttribute("title")||"";d&&r++}});if(d=d||Jd(s),d&&typeof d=="string"){const p=c[0];["sdt"].includes(p)?d=KE(d):["ngaySinhCustomer","ngayCapCustomer","ngayCapSoDkdnCustomer","ngayKy","ngayTiepNhan"].includes(p)&&(d=GE(d))}ge(s,d,null)}),Ce(),r>0?(this.style.background="#1e8e3e",this.style.color="#fff",this.innerText="Đã quét xong",setTimeout(()=>{this.style.background="",this.style.color="",this.innerText="Quét dữ liệu"},1e3)):U("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")});function n(r){var h;if(r.target.closest("#vnpt-docx-widget")||r.target.closest("#vnpt-inline-calc")||r.type==="keydown"&&r.key!=="Enter")return;const i=r.target.closest("input, textarea, select, ng-select2");if(!i)return;const s=i.id,a=i.getAttribute("formcontrolname"),c=ti.getLabels(),l=Object.keys(c).find(d=>{const p=d.split(",").map(y=>y.trim());return s&&p.includes(s)||a&&p.includes(a)});if(l!==void 0){let d;if(l.includes("diaChi")){d=tf();const p=Ka();if(p){const y="SKDT "+p,I=Object.keys(ue).find(T=>T.includes("noiCapSoDkdn"));I&&ge(I,y,null)}}else{const p=i.tagName.toLowerCase();if(p==="select")d=((h=i.options[i.selectedIndex])==null?void 0:h.text)||"";else if(p==="ng-select2"){const y=i.querySelector(".select2-selection__rendered");d=y?y.getAttribute("title")||y.textContent.trim():""}else d=i.value}d!==void 0&&(ge(l,d,null),Ce(),console.debug(`[Sync] Updated ${l} with value: "${d}"`))}}function e(){["tinhId","tinhIdNew"].forEach(i=>{const s=document.getElementById(i);if(s&&!s.dataset.widgetSyncBound){s.dataset.widgetSyncBound="1";const a=()=>{const c=Ka();if(c){const l="SKDT "+c,h=ti.getLabels(),d=Object.keys(h).find(p=>p.includes("noiCapSoDkdn"));d&&(ge(d,l,null),Ce())}};s.addEventListener("change",a),typeof $<"u"&&$(s).on("select2:select change",a)}})}document.addEventListener("input",n),document.addEventListener("change",n),document.addEventListener("keydown",n),e(),new MutationObserver(()=>e()).observe(document.body,{childList:!0,subtree:!0})}const xw={local:{download(n,e="arraybuffer"){return new Promise((t,r)=>{const i=new FileReader;switch(i.onload=s=>{let a=s.target.result;e==="base64"&&typeof a=="string"&&(a=a.split(",")[1]||a),t(a)},i.onerror=s=>r(s),e.toLowerCase()){case"arraybuffer":i.readAsArrayBuffer(n);break;case"base64":case"dataurl":i.readAsDataURL(n);break;case"text":i.readAsText(n);break;default:r(new Error(`Unsupported read type: ${e}`))}})},async upload(n){return this.download(n,"base64")}}},Aw={getAdapter(n){const e=xw[n];if(!e)throw new Error(`Storage adapter not found: ${n}`);return e},async upload(n,e,t={}){return await this.getAdapter(n).upload(e,t)},async download(n,e,t={}){return await this.getAdapter(n).download(e,t.type||"arraybuffer")}};function nf(n,e,t){try{let r;try{r=new window.PizZip(n)}catch(l){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(l);return}const i=new window.docxtemplater(r,{paragraphLoop:!0,linebreaks:!0});i.render(e);const s=i.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",compression:"DEFLATE",compressionOptions:{level:9}}),a=URL.createObjectURL(s),c=document.createElement("a");c.href=a,c.download=t,document.body.appendChild(c),c.click(),setTimeout(()=>{document.body.removeChild(c),URL.revokeObjectURL(a)},100)}catch(r){let i=r.message;r.properties&&r.properties.errors instanceof Array?i=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+r.properties.errors.map(a=>"- "+(a.properties.explanation||a.message)).join(`
`):i="Lỗi phần mềm Word sinh ra: "+i,alert(i),console.error("DocX Error:",r)}}function Sw(n,e){const t=n.replace(/@(\w+)/g,(r,i)=>e[i]!==void 0?e[i]:r);navigator.clipboard.writeText(t).then(()=>{alert("✅ Đã sao chép nội dung vào Clipboard!")}).catch(r=>{console.error("Lỗi khi copy:",r),alert("❌ Lỗi khi sao chép vào Clipboard. Vui lòng thử lại!")})}function Cw(){const n=document.getElementById("vnpt-export-filename");n&&n.addEventListener("input",()=>{n.dataset.userEdited="1",n.value.trim()||(n.dataset.userEdited="0")});function e(){if(!n||n.dataset.userEdited==="1")return;let i="";if(P.fieldsContainer&&P.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(d=>{const y=d.querySelector(".f-key").value.trim().split(",")[0].trim(),I=d.querySelector(".f-val").value.trim();y==="tenToChuc"&&(i=I)}),!i){const h=document.getElementById("tenToChuc");h&&(i=h.tagName.toLowerCase()==="textarea"||h.tagName.toLowerCase()==="input"?h.value.trim():h.innerText.trim())}function s(h){if(!h)return"";let d=h;return d=d.replace(/Tổng công ty/gi,""),d=d.replace(/Công ty/gi,""),d=d.replace(/\bCty\b/gi,""),d=d.replace(/Trách nhiệm hữu hạn/gi,""),d=d.replace(/\bTNHH\b/gi,""),d=d.replace(/Cổ phần/gi,""),d=d.replace(/\bCP\b/gi,""),d=d.replace(/Một thành viên/gi,""),d=d.replace(/\bMTV\b/gi,""),d=d.replace(/Chi nhánh/gi,""),d=d.replace(/Việt Nam/gi,"VN"),d=d.replace(/Viet Nam/gi,"VN"),d=d.replace(/\s+/g," ").trim(),d=d.replace(/^[-,\s]+|[-,\s]+$/g,""),d.length>50&&(d=d.substring(0,47)+"..."),d.replace(/[<>:"/\\|?*]/g,"")}let a=s(i),c=P.templateName?P.templateName.replace(/\.docx$/i,""):"",l=[];c&&l.push(c),a&&l.push(a),l.length>0?n.value=l.join(" - ")+".docx":n.value||(n.value="Export_Auto.docx")}setInterval(e,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const i={};if(P.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(h=>{const p=h.querySelector(".f-key").value.trim().split(",")[0].trim(),y=h.querySelector(".f-val").value;p&&(i[p]=y)}),Object.keys(i).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}const a=[];if(rn.forEach(h=>{if(!i[h]||!i[h].trim()){const d=ue[h]||h;a.push(d)}}),a.length>0){const h=`Cảnh báo: Bạn còn các trường sau chưa điền dữ liệu:

- ${a.join(`
- `)}

Bạn có chắc chắn muốn tiếp tục xuất file không?`;if(!confirm(h))return}let c=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(c.toLowerCase().endsWith(".docx")||(c+=".docx"),P.templateBuffer){nf(P.templateBuffer,i,c);return}const l=document.getElementById("vnpt-template-file");if(l.files&&l.files.length>0){Aw.download("local",l.files[0],{type:"arraybuffer"}).then(h=>nf(h,i,c)).catch(h=>alert(`Lỗi đọc file: ${h.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')});const t=document.getElementById("vnpt-btn-export-txt"),r=document.getElementById("vnpt-txt-template");if(r){const i=V.get(so);i&&(r.value=i),r.addEventListener("input",()=>{V.setDebounced(so,r.value,800)})}t&&t.addEventListener("click",()=>{const i=r?r.value:"";if(!i.trim()){alert(`Bạn chưa nhập nội dung Text Template!

Sử dụng @key làm placeholder, ví dụ: Tôi là @tenDaiDienn`);return}const s={};if(P.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(c=>{const h=c.querySelector(".f-key").value.trim().split(",")[0].trim(),d=c.querySelector(".f-val").value;h&&(s[h]=d)}),Object.keys(s).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}Sw(i,s)})}const kw=["chucVu","noiCap","noiCapSoDkdn","ngayky","ngayky1","thangky","namky","thangky1","namky1","noiKy"],Rw=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function Pw(){function n(){kw.forEach(i=>{const s=document.getElementById(i);s&&!s.dataset.filled&&(s.dataset.filled="1",ir(s,Jd(i)))}),Rw.forEach(i=>{const s=document.getElementById(i.src),a=document.getElementById(i.target);s&&a&&!s.dataset.bound&&(s.dataset.bound="1",s.addEventListener("change",()=>ir(a,s.value)))}),["tinhId","tinhIdNew"].forEach(i=>{const s=document.getElementById(i),a=document.getElementById("noiCapSoDkdn");if(s&&a&&!s.dataset.skdtBound){s.dataset.skdtBound="1";const c=()=>{let l="";if(s.tagName.toLowerCase()==="ng-select2"||s.classList.contains("select2-hidden-accessible")){const h=s.parentElement.querySelector(".select2-selection__rendered");l=h?h.getAttribute("title")||h.textContent.trim():s.value}else l=s.value;if(l&&l!=="--- Chọn ---"&&!l.includes("Chọn")){const h=l.trim().replace(/^(Tỉnh|Thành phố)\s+/i,"");ir(a,"SKDT "+h)}};s.addEventListener("change",c),$(s).on("select2:select",c)}})}let e;new MutationObserver(r=>{r.some(s=>s.addedNodes.length>0?Array.from(s.addedNodes).some(c=>c.nodeType!==1?!1:["INPUT","TEXTAREA","SELECT"].includes(c.tagName)?!0:c.querySelector&&c.querySelector("input, textarea, select")):!1)&&(clearTimeout(e),e=setTimeout(n,200))}).observe(document.body,{childList:!0,subtree:!0}),n()}const Nw=()=>{let n="";for(const[e,t]of Object.entries(ue)){const r=e.split(",")[0].trim();rn.includes(r)&&(n+=`"${r}": "${t}",
`)}return`Bạn là chuyên gia trích xuất dữ liệu hợp đồng VNPT.
Nhiệm vụ: Đọc tài liệu (văn bản/ảnh/PDF) và trích xuất thông tin BÊN A (KHÁCH HÀNG). Bỏ qua Bên B.

CHỈ TRẢ VỀ JSON THUẦN TÚY, không bao gồm giải thích hay định dạng markdown.
Cấu trúc JSON yêu cầu:
{
  "fields": {
${n}    "ngayKy": "dd/MM/yyyy"
  },
  "rawFullText": "Toàn bộ nội dung văn bản"
}

Lưu ý:
- "soDkdn" dùng cho cả MST và Số GPKD.
- Định dạng ngày: dd/MM/yyyy.
- Với tài liệu nhiều trang: Tổng hợp dữ liệu từ tất cả các trang. Nếu thông tin xuất hiện nhiều lần, lấy bản mới nhất/chính xác nhất.
- Nếu không tìm thấy trường thông tin, trả về "".`};function Dw(n,e,t="gemini-2.0-flash",r="application/pdf",i=null){const s={apiKey:e,model:t,systemInstruction:Nw(),userText:"Đọc tài liệu hợp đồng này và trích xuất thành JSON. Nếu có nhiều trang, hãy kết nối thông tin với nhau để lấy ra thông tin đầy đủ nhất."};return i&&Array.isArray(i)&&(s.filesData=i),Wd(s)}function Ga(n){return new Promise((e,t)=>{const r=new FileReader,i=n.type||"application/octet-stream";r.onload=()=>{const s=r.result.split(",")[1];e({base64:s,mimeType:i})},r.onerror=s=>t(s),r.readAsDataURL(n)})}function rf(n,e,t){let r=document.getElementById("vnpt-pdf-dialog");r&&r.remove(),r=document.createElement("div"),r.id="vnpt-pdf-dialog",r.className="vnpt-pdf-overlay";const i=n.map((d,p)=>`
        <tr class="pdf-row-auto">
            <td style="text-align: center;">
                <input type="checkbox" class="pdf-row-chk" data-index="${p}" ${d.checked?"checked":""} />
            </td>
            <td><strong title="${d.key}">${d.label}</strong></td>
            <td>
                <input type="text" class="pdf-val-input" data-index="${p}" value="${d.value}" placeholder="..." />
            </td>
        </tr>
    `).join("");r.innerHTML=`
        <div class="vnpt-pdf-dialog-box" style="width: 900px; height: 80vh;">
            <div class="pdf-dlg-header">
                <h3>🔍 KIỂM TRA & XÁC NHẬN KẾT QUẢ AI</h3>
            </div>
            
            <div class="pdf-dlg-cols">
                <!-- Cột trái: Nội dung gốc -->
                <div class="pdf-col-left" title="Nội dung văn bản thô AI đọc được">
                    <div style="font-weight: 800; color: #5f6368; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px;">VĂN BẢN GỐC (RAW TEXT)</div>
                    ${e||"Không có dữ liệu văn bản thô."}
                </div>

                <!-- Cột phải: Các trường nhận diện được -->
                <div class="pdf-col-right">
                    <div class="pdf-dlg-body">
                        <table class="pdf-result-table">
                            <thead>
                                <tr>
                                    <th width="40"><input type="checkbox" id="pdf-check-all" checked title="Chọn tất cả"></th>
                                    <th width="120">Trường</th>
                                    <th>Giá trị AI trích xuất (Có thể sửa)</th>
                                </tr>
                            </thead>
                            <tbody>${i}</tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="vnpt-pdf-actions">
                <div style="flex:1; font-size:11px; color:#5f6368;">Mẹo: So sánh nội dung bên trái và sửa lại ô bên phải nếu AI nhận diện sai.</div>
                <button class="pdf-btn-cancel" id="pdf-btn-cancel">✖ Hủy bỏ</button>
                <button class="pdf-btn-confirm" id="pdf-btn-confirm">✅ Chấp nhận & Lưu</button>
            </div>
        </div>
    `,document.body.appendChild(r);const s=r.querySelector("#pdf-btn-cancel"),a=r.querySelector("#pdf-btn-confirm"),c=r.querySelector("#pdf-check-all"),l=r.querySelectorAll(".pdf-row-chk"),h=r.querySelectorAll(".pdf-val-input");c.addEventListener("change",d=>{l.forEach(p=>p.checked=d.target.checked)}),s.onclick=()=>{r.remove()},a.onclick=()=>{const d=[];l.forEach(p=>{if(p.checked){const y=parseInt(p.getAttribute("data-index")),I=h[y].value;d.push({...n[y],value:I})}}),r.remove(),t(d)}}const lt={name:n=>n?n.trim().toUpperCase().replace(/\s+/g," "):"",mst:n=>n?n.replace(/[^\d]/g,"").trim():"",date:(n,e,t)=>`${String(n).padStart(2,"0")}/${String(e).padStart(2,"0")}/${t}`,text:n=>n?n.trim().replace(/\s+/g," "):""};function Yt(n,e){for(const t of e){const r=n.match(t);if(r&&r[1])return r[1].trim()}return null}function Lw(n){if(!n)return{};const e={},t=n.replace(/\r/g,""),i=Yt(t,[/(?:Tên công ty viết bằng tiếng Việt|Tên tổ chức):?\s*([\s\S]+?)(?=\n|Tên công ty|$)/i,/Tên công ty viết bằng tiếng nước ngoài:?\s*([\s\S]+?)(?=\n|Tên công ty|$)/i,/Tên công ty viết tắt:?\s*([\s\S]+?)(?=\n|Địa chỉ|$)/i]);i&&(e.tenToChuc=lt.text(i));const a=Yt(t,[/(?:Mã số doanh nghiệp|Mã số thuế):?\s*([\d\s.]{10,16})/i,/MST:?\s*([\d\s.]{10,16})/i]);a&&(e.soDkdn=lt.mst(a));let l=Yt(t,[/(?:Họ và tên|Người đại diện theo pháp luật|Tên đại diện|Full name):?\s*([\s\S]+?)(?=\n|Chức danh|Chức vụ|Giới tính|Sinh ngày|Date of birth|$)/i,/Người đại diện:?\s*([\s\S]+?)(?=\n|Chức vụ|$)/i]);l&&(l=l.replace(/^(?:Họ và tên|Người đại diện theo pháp luật|Tên đại diện|Full name|[\/\s]*Full name):?\s*/i,"").replace(/^\/\s*/,""),e.tenDaiDienn=lt.name(l));const d=Yt(t,[/(?:Chức danh|Chức vụ):?\s*([\s\S]+?)(?=\n|Sinh ngày|Giới tính|Quốc tịch|$)/i]);d&&(e.chucVu=lt.text(d));const p=t.match(/(?:Đăng ký|Đảng kỷ|Cấp ngày|Ngày cấp) (?:lần đầu|thay đổi):?\s*ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i);p&&(e.ngayCapSoDkdnCustomer=lt.date(p[1],p[2],p[3]));const I=Yt(t,[/(?:Điện thoại|SĐT|Tel):?\s*([\d\s.-]{9,15})/i]);I&&(e.sdt=I.replace(/[\s.-]/g,"").trim());const R=Yt(t,[/(?:Thư điện tử|Email):?\s*([^\s\n]+)/i]);R&&(e.emailDaiDien=R.replace(/\(a\)/g,"@").trim());const k=Yt(t,[/(?:Số định danh cá nhân|Số CMND|Số CCCD|Số Hộ chiếu|Số \/ No\.):?\s*(\d[\d\s]{8,13})/i,/(?:CMND|CCCD) số:?\s*(\d[\d\s]{8,13})/i]);k&&(e.cmnd=lt.mst(k));const D=Yt(t,[/Nơi cấp:?\s*([\s\S]+?)(?=\n|Ngày cấp|$)/i,/Cục trưởng Cục Cảnh sát ([\s\S]+?)(?=\n|$)/i]);D&&(e.noiCap=lt.text(D));const F=t.match(/Ngày cấp:?\s*(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{4})/i);F&&(e.ngayCapCustomer=lt.date(F[1],F[2],F[3]));const H=t.match(/(?:Ngày, tháng, năm sinh|Sinh ngày|Ngày sinh):?\s*ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i);if(H)e.ngaySinhCustomer=lt.date(H[1],H[2],H[3]);else{const j=t.match(/(?:Ngày sinh|Sinh ngày):?\s*(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{4})/i);j&&(e.ngaySinhCustomer=lt.date(j[1],j[2],j[3]))}return e}const Vw=()=>{let n="";for(const[e,t]of Object.entries(ue)){const r=e.split(",")[0].trim();rn.includes(r)&&(n+=`"${r}": "${t}",
`)}return`Bạn là một chuyên gia trích xuất dữ liệu từ văn bản thô (có thể là mẫu tin nhắn, email, ghi chú...). 
Nhiệm vụ của bạn là tìm thông tin của KHÁCH HÀNG (BÊN THUÊ/BÊN A) từ đoạn văn bản được cung cấp.

Hãy trả về DUY NHẤT một chuỗi JSON thuần tuý.
Cấu trúc JSON bắt buộc phải trả về:
{
${n}  "ngayKy": "Ngày tháng năm ký (nếu có)"
}

Lưu ý:
- Nếu thông tin không có, trả về chuỗi rỗng "".
- Chuẩn hóa ngày tháng về dd/MM/yyyy.
- Chuẩn hóa Số điện thoại (xóa khoảng cách, dấu chấm).
- Mọi MST/Số GCPKD đều cho vào key "soDkdn".
- Trường "noiCapSoDkdn": Trả về định dạng "SKDT {Tỉnh}" (ví dụ: "SKDT Hà Nội", "SKDT TP.HCM"). KHÔNG bao gồm chữ "Nơi cấp...".
- Tuyệt đối KHÔNG bao gồm tên nhãn (Label) vào giá trị trích xuất.
- Bỏ qua các dữ liệu rác không liên quan.`};async function Ow(n,e,t="gemini-2.0-flash"){if(!n||!n.trim())throw new Error("Vui lòng nhập nội dung văn bản cần phân loại.");return Wd({apiKey:e,model:t,systemInstruction:Vw(),userText:`Hãy phân loại thông tin từ đoạn văn bản sau đây: 

${n}`})}function Mw(n){if(!n||!n.trim())throw new Error("Vui lòng nhập nội dung văn bản cần phân loại.");return Lw(n)}let Ke=[];function ar(n,e){if(n.innerHTML="",Ke.length===0){e.style.display="flex";return}e.style.display="none",Ke.forEach((t,r)=>{const i=document.createElement("div");if(i.className="ai-queue-item",t.mimeType&&t.mimeType.startsWith("image/")){const a=document.createElement("img");a.src=`data:${t.mimeType};base64,${t.base64}`,i.appendChild(a)}else{const a=document.createElement("span");a.className="file-icon",a.textContent="📄",i.appendChild(a)}const s=document.createElement("button");s.className="btn-remove-item",s.innerHTML="✖",s.onclick=a=>{a.stopPropagation(),Ke.splice(r,1),ar(n,e)},i.appendChild(s),n.appendChild(i)})}function Fw(n,e,t){Ke=[],t.value="",ar(n,e)}function Uw(){const n=document.getElementById("vnpt-btn-ai-mode"),e=document.getElementById("vnpt-ai-scanner-section"),t=document.getElementById("vnpt-btn-ai-process"),r=document.getElementById("vnpt-btn-raw-process-local"),i=document.getElementById("vnpt-raw-scan-input"),s=document.getElementById("vnpt-ai-queue-container"),a=document.getElementById("vnpt-ai-queue-list"),c=document.getElementById("vnpt-ai-queue-placeholder"),l=document.getElementById("vnpt-btn-show-pdf"),h=document.getElementById("vnpt-btn-clear-queue"),d=document.getElementById("vnpt-pdf-input");if(!n||!e)return;n.addEventListener("click",y=>{y.preventDefault();const I=e.style.display==="none";e.style.display=I?"flex":"none",n.classList.toggle("active",I)}),l&&l.addEventListener("click",y=>{y.preventDefault(),P.lastPdfResults&&P.lastPdfResults.length>0?rf(P.lastPdfResults,P.lastPdfRawText||"",I=>{I.forEach(T=>{ge(T.key,T.value,T.label)}),Ce(),U(`✅ Đã cập nhật ${I.length} trường.`)}):U("Chưa có kết quả scan AI nào trong phiên này.","#ffc107")}),h&&h.addEventListener("click",y=>{y.preventDefault(),Fw(a,c,i)}),s.addEventListener("click",()=>{d.click()}),s.addEventListener("dragover",y=>{y.preventDefault(),s.classList.add("drag-over")}),s.addEventListener("dragleave",y=>{y.preventDefault(),s.classList.remove("drag-over")}),s.addEventListener("drop",async y=>{if(y.preventDefault(),s.classList.remove("drag-over"),y.dataTransfer.files&&y.dataTransfer.files.length>0){for(let I of y.dataTransfer.files){const T=await Ga(I);Ke.push({file:I,...T})}ar(a,c)}}),d.addEventListener("change",async y=>{if(y.target.files){for(let I of y.target.files){const T=await Ga(I);Ke.push({file:I,...T})}y.target.value="",ar(a,c)}}),window.addEventListener("paste",async y=>{if(e.style.display==="none")return;const I=y.target;if(I.tagName==="INPUT"||I.tagName==="TEXTAREA")return;const T=(y.clipboardData||y.originalEvent.clipboardData).items;for(let R of T)if(R.type.indexOf("image")!==-1||R.type.indexOf("pdf")!==-1){const x=R.getAsFile();if(x){const k=await Ga(x);Ke.push({file:x,...k}),ar(a,c),U("📋 Đã thêm vào hàng đợi.")}}});const p=(y,I,T)=>{const R=rn.map(k=>({key:k,value:y[k]||"",label:ue[k]||k,checked:!!y[k]}));Object.keys(y).forEach(k=>{!rn.includes(k)&&y[k]&&R.push({key:k,value:y[k],label:ue[k]||k,checked:!0})}),R.every(k=>!k.value)&&U("⚠️ AI hoặc Regex không trích xuất được thông tin nào!","#ffc107"),P.lastPdfResults=R,P.lastPdfRawText=I||"",rf(R,I||"",k=>{k.forEach(O=>{ge(O.key,O.value,O.label)}),Ce(),U(`✅ Đã quét xong ${k.length} trường.`),P.lastPdfResults=P.lastPdfResults.map(O=>{const D=k.find(F=>F.key===O.key);return D?{...O,value:D.value,checked:!0}:{...O,checked:!1}})});const x=document.querySelector("#vnpt-pdf-dialog h3");x&&(x.textContent=T)};r.addEventListener("click",()=>{const y=i.value.trim();if(!y){U("⚠️ Vui lòng nhập nội dung văn bản!","#ffc107");return}try{sr("Trước khi phân loại Local: "+qa());const I=Mw(y);p(I,y,"PHÂN LOẠI DỮ LIỆU THÔ (LOCAL)")}catch(I){U("❌ Lỗi: "+I.message,"#f44336")}}),t.addEventListener("click",async()=>{const y=V.get(Ic),I=V.get(xc)||"gemini-2.5-flash";if(!y){confirm(`Chưa cài đặt Gemini API Key!

AI Scanner yêu cầu mã Google AI Studio.

Nhấn 'OK' để xem hướng dẫn nhé!`)&&window.open("https://github.com/tranchien2000/vnpt-tampermonkey-vite/blob/main/docs/GEMINI_API_GUIDES.md","_blank");return}if(Ke.length===0&&!i.value.trim()){U("⚠️ Hàng đợi trống. Vui lòng chọn file hoặc dán nội dung","#ffc107");return}i.classList.add("ai-scanning-glow"),t.disabled=!0,t.textContent="⏳ ĐANG QUÉT...";try{sr("Trước khi AI Scan: "+qa());let T={},R="";if(Ke.length>0){const x=await Dw(null,y,I,null,Ke);T=x.fields||{},R=x.rawTextSnippet||x.rawFullText||"",i.value=R}else{const x=i.value.trim();T=await Ow(x,y,I),R=x}p(T,R,"PHÂN LOẠI DỮ LIỆU THÔ (AI)"),Ke.length>0&&(Ke=[],ar(a,c))}catch(T){console.error("Lỗi AI Scan Pipeline:",T),alert(`Lỗi xử lý quét AI:
`+T)}finally{i.classList.remove("ai-scanning-glow"),t.disabled=!1,t.textContent="✨ BẮT ĐẦU QUÉT AI"}})}function PT(){}function cr(n,e=null){return V.get(n,e)}function $s(n,e){V.set(n,e)}function sf(n,e){if(!e||e.replace(/\D/g,"").length<6)return;let t=cr(n,[]);t=t.filter(r=>r!==e),t.unshift(e),$s(n,t.slice(0,10))}function Hs(n,e){const t=document.getElementById(e);t&&(t.innerHTML=cr(n,[]).map(r=>`<option value="${r}">`).join(""))}function Wa(n){return n.toLocaleString("en-US")}function Qa(n){return Number(String(n).replace(/[^\d]/g,""))||0}function Bw(n){return n.charAt(0).toUpperCase()+n.slice(1)}const ni=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function qw(n){let e=Math.floor(n/100),t=Math.floor(n%100/10),r=n%10,i="";return e>0&&(i+=ni[e]+" trăm ",t===0&&r>0&&(i+="lẻ ")),t>1?(i+=ni[t]+" mươi ",r===1?i+="mốt":r===5?i+="lăm":r>0&&(i+=ni[r])):t===1?(i+="mười ",r===5?i+="lăm":r>0&&(i+=ni[r])):r>0&&(e>0&&(i+="lẻ "),i+=ni[r]),i.trim()}function $w(n){if(n===0)return"không";const e=["","nghìn","triệu","tỷ"];let t="",r=0;for(;n>0;){const i=n%1e3;i>0&&(t=qw(i)+" "+e[r]+" "+t),n=Math.floor(n/1e3),r++}return t.trim()}function of(n,e,t){if(e===""||e===void 0||e===null)return{beforeNum:0,taxNum:0,afterNum:0,beforeStr:"",taxStr:"",afterStr:"",textStr:""};let r=0,i=0,s=0;n==="before"?(r=Qa(e),i=t>0?Math.round(r*t):0,s=r+i):n==="tax"?(i=Qa(e),r=t>0?Math.round(i/t):0,s=r+i):n==="after"&&(s=Qa(e),r=t>0?Math.round(s/(1+t)):s,i=s-r);const a=Bw($w(s))+" đồng";return{beforeNum:r,taxNum:i,afterNum:s,beforeStr:Wa(r),taxStr:Wa(i),afterStr:Wa(s),textStr:a}}function Hw(n,e){e.before&&e.before.forEach(t=>xn(t,n.beforeStr)),e.tax&&e.tax.forEach(t=>xn(t,n.taxStr)),e.after&&e.after.forEach(t=>xn(t,n.afterStr)),e.text&&e.text.forEach(t=>xn(t,n.textStr))}function zs(n,e=null){try{const t=localStorage.getItem(n);return t!==null?JSON.parse(t):e}catch{return e}}function Tt(n,e){localStorage.setItem(n,JSON.stringify(e))}function zw(n,e,t,r){let i=zs(Nn)??"custom",s=zs(dt)??{...Me},a=zs(sn)??{},c=zs(xt)??{};const l=document.createElement("div");l.className="cw-tab-header";const h={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};h.custom.innerText="📋 Custom",h.custom.className="cw-tab cw-tab-custom",h.default.innerText="📌 Default",h.default.className="cw-tab cw-tab-default",h.sync.innerText="🔗 Sync",h.sync.className="cw-tab cw-tab-sync";function d(){Object.values(h).forEach(_=>_.classList.remove("active")),h[i].classList.add("active")}d();const p=document.createElement("div");p.style.display=r.data?"none":"block";const y=e("📋 Cấu hình Data","data",_=>{p.style.display=_?"none":"block",t(n)}),I=document.createElement("div");I.className="cw-data-body";function T(){I.innerHTML="";let _=i==="sync"?c:i==="custom"?a:s,m=i==="sync"?xt:i==="custom"?sn:dt;const b=Object.keys(_);b.length===0&&i!=="default"&&(I.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),b.forEach(w=>{const E=document.createElement("div");E.className="cw-data-row";let A=i!=="default";const v=_[w],ne=v&&typeof v=="object"&&v.hasOwnProperty("value"),Ue=ne?v.value:v,ii=ne&&v.label||w,Be=document.createElement("input");Be.type="text",Be.value=ii,Be.id=`df-key-${w}`,Be.name=`df-key-${w}`,Be.className="cw-data-key"+(A?" mutable":""),Be.title=w,Be.readOnly=!A,A&&(Be.onchange=()=>{const Pe=Be.value.trim();if(!Pe||Pe===w){Be.value=ii;return}ne?_[Pe]={...v,label:Pe}:_[Pe]=Ue,delete _[w],Tt(m,_),T()});const Fe=document.createElement("input");if(Fe.type="text",Fe.value=Ue??"",Fe.id=`df-val-${w}`,Fe.name=`df-val-${w}`,Fe.className="cw-data-val",Fe.oninput=()=>{ne?_[w]={...v,value:Fe.value}:_[w]=Fe.value,Tt(m,_)},E.appendChild(Be),E.appendChild(Fe),A){const Pe=document.createElement("button");Pe.innerHTML="✕",Pe.className="cw-del-btn",Pe.onclick=()=>{confirm(`Delete "${ii}"?`)&&(delete _[w],Tt(m,_),T())},E.appendChild(Pe)}else E.appendChild(document.createElement("div")).className="cw-pad";I.appendChild(E)})}h.custom.onclick=()=>{i="custom",Tt(Nn,"custom"),d(),T()},h.default.onclick=()=>{i="default",Tt(Nn,"default"),d(),T()},h.sync.onclick=()=>{i="sync",Tt(Nn,"sync"),d(),T()};const R=document.createElement("button");R.innerText="📤",R.className="cw-icon-btn",R.title="Sao lưu toàn bộ dữ liệu ra JSON",R.onclick=()=>Ba();const x=document.createElement("button");x.innerText="📥",x.className="cw-icon-btn",x.title="Khôi phục dữ liệu từ JSON";const k=document.createElement("input");k.type="file",k.accept=".json",k.style.display="none",k.onchange=async _=>{_.target.files.length>0&&await Hd(_.target.files[0])&&setTimeout(()=>location.reload(),1500)},x.onclick=()=>k.click(),p.appendChild(l),l.appendChild(h.custom),l.appendChild(h.default),l.appendChild(h.sync),p.appendChild(I),n.appendChild(y),n.appendChild(p);const O=n.querySelector("#vnpt-cw-fill"),D=n.querySelector("#vnpt-cw-sync"),F=n.querySelector("#vnpt-cw-add"),H=n.querySelector("#vnpt-cw-reset");O&&(O.onclick=Bd),D&&(D.onclick=ZE),F&&(F.onclick=()=>{i==="default"&&(i="custom",Tt(Nn,"custom"),d());let _=i==="sync"?c:a,m="new_field_"+Date.now();_[m]="",Tt(i==="sync"?xt:sn,_),T(),I.scrollTop=I.scrollHeight}),H&&(H.onclick=()=>{confirm("Reset Default Data?")&&(s={...Me},Tt(dt,s),T())}),T();const j=y.querySelector(".cw-right-wrap")||document.createElement("div");j.className="cw-right-wrap",j.prepend(R),j.prepend(x),j.appendChild(k),y.appendChild(j)}function jw(n,e,t){let r=Number(localStorage.getItem(Pn))||Md,i=cr(pr)??{calc:!1,data:!0};function s(T,R){const x=document.createElement("button");return x.innerText=T,x.className="cw-action-btn "+R,x}function a(T,R,x){const k=document.createElement("div");k.className="wg-sec-header";const O=document.createElement("span");O.innerText=T;const D=document.createElement("button");return D.className="wg-toggle-btn",D.innerText=i[R]?"▾":"▴",k.appendChild(O),k.appendChild(D),D.onclick=()=>{i[R]=!i[R],D.innerText=i[R]?"▾":"▴",$s(pr,i),x(i[R])},k}function c(T){const R=window.innerWidth,x=window.innerHeight,k=T.getBoundingClientRect();T.style.left=Math.min(Math.max(parseFloat(T.style.left),0),R-k.width)+"px",T.style.top=Math.min(Math.max(parseFloat(T.style.top),0),x-36)+"px"}const l=document.createElement("div");if(!e){l.className="cw-title-bar",l.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const T=document.createElement("div");T.className="cw-btn-group";const R={fill:s("Fill","cw-btn-fill"),sync:s("Sync","cw-btn-sync"),add:s("Add","cw-btn-add"),reset:s("↺","cw-btn-reset")};R.sync.onclick=()=>{const x=p("before",d.before.value);y("before",x.beforeStr)},R.reset.title="Reset Default fields",Object.values(R).forEach(x=>T.appendChild(x)),l.appendChild(T),n.appendChild(l)}const h=document.createElement("div");h.className="cw-body-inline",h.innerHTML=`
    <div class="cw-inline-row">
        <input id="wg-before" name="wg-before" class="cw-input-inline" placeholder="Trước thuế" list="wg-before-list" title="Trước thuế">
        <datalist id="wg-before-list"></datalist>
        <div class="cw-tax-group-inline"><input id="wg-taxRate" name="wg-taxRate" class="cw-tax-input-inline" title="Thuế (%)"><span class="cw-tax-symbol">%</span></div>
        <input id="wg-tax" name="wg-tax" class="cw-input-inline" placeholder="Tiền thuế" title="Tiền thuế">
        <input id="wg-after" name="wg-after" class="cw-input-inline" placeholder="Sau thuế" list="wg-after-list" title="Sau thuế">
        <datalist id="wg-after-list"></datalist>
        <input id="wg-text" name="wg-text" class="cw-input-inline cw-input-readonly-inline" placeholder="Bằng chữ" readonly title="Bằng chữ">
        <button id="wg-sync-manual" class="cw-map-btn-inline" title="Đồng bộ kết quả lên trang web (🔄)">🔄</button>
    </div>`,e?e.appendChild(h):n.appendChild(h),e||zw(n,a,c,i);const d={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text")};d.taxRate.value=r*100,Hs(Ii,"wg-before-list"),Hs(xi,"wg-after-list");function p(T,R){const x=of(T,R,r);return d.before.value=x.beforeStr,d.tax.value=x.taxStr,d.after.value=x.afterStr,d.text.value=x.textStr,x}function y(T,R){Fs();const x=of(T,R,r),k=cr(At)||{...Us};Hw(x,k)}d.taxRate.oninput=()=>{r=Number(d.taxRate.value)/100||0,$s(Pn,r),p("before",d.before.value)},d.taxRate.onchange=()=>{y("before",d.before.value)},d.before.oninput=()=>{p("before",d.before.value)},d.before.onchange=()=>{y("before",d.before.value),sf(Ii,d.before.value),Hs(Ii,"wg-before-list")},d.tax.oninput=()=>{p("tax",d.tax.value)},d.tax.onchange=()=>{y("tax",d.tax.value)},d.after.oninput=()=>{p("after",d.after.value)},d.after.onchange=()=>{y("after",d.after.value),sf(xi,d.after.value),Hs(xi,"wg-after-list")};const I=document.getElementById("wg-sync-manual");if(I&&(I.onclick=()=>{const T=p("before",d.before.value);y("before",T.beforeStr),I.style.transform="scale(1.2) rotate(360deg)",I.style.transition="all 0.4s",setTimeout(()=>{I.style.transform=""},400)}),[d.before,d.tax,d.after,d.text].forEach(T=>{["click","focus"].forEach(R=>T.addEventListener(R,()=>{if(!T.value)return;navigator.clipboard.writeText(T.value);const x=T.style.backgroundColor;T.style.backgroundColor="#d1e7dd",setTimeout(()=>T.style.backgroundColor=x,300)}))}),!e){const T=Array.from(n.children).filter(k=>k!==l),R=Xd(n,[l],t,null,k=>{T.forEach(O=>O.style.display=k?"none":""),l.style.borderRadius=k?"8px":"0",k&&(n.style.top=window.innerHeight-(l.offsetHeight||34)+"px")}),x=cr(t);return x&&x.docked&&R.setDocked(!0),window.addEventListener("resize",()=>{R.isDocked()?n.style.top=window.innerHeight-l.offsetHeight+"px":c(n)}),R}return null}function Kw(){const n=document.getElementById("vnpt-inline-calc"),e=document.getElementById("vnpt-btn-calc-toggle");let t=P.calcWidget||document.createElement("div");if(!n&&!P.calcWidget?(t.id="vnpt-calc-widget",document.body.appendChild(t),P.calcWidget=t):n&&(t=P.widget),n&&e){let r=cr(pr)??{calc:!1,data:!0};const i=s=>{n.style.display=s?"none":"block",e.classList.toggle("active",!s)};i(r.calc),e.onclick=()=>{r.calc=!r.calc,$s(pr,r),i(r.calc)}}return jw(t,n,Tc)}function Gw(){let n=!1;try{n=!1}catch{n=!1}n&&It.info("[Migration] Dev mode active - Syncing configurations...");let e=V.get(dt);if(e){let r=!1;Object.keys(Me).forEach(i=>{const s=Me[i];if(!(i in e))e[i]=s,r=!0;else if(n){const a=e[i],c=s&&typeof s=="object",l=a&&typeof a=="object";let h=!1;!c&&!l?h=a!==s:c&&l?h=a.value!==s.value||a.label!==s.label:h=!0,h&&(e[i]=s,r=!0)}}),r&&V.set(dt,e)}let t=V.get(Le);if(t){let r=!1;Object.keys(Me).forEach(i=>{const s=Me[i],a=s&&typeof s=="object"?s.value:s,c=s&&typeof s=="object"?s.label:ue[i]||"";if(!(i in t))t[i]={label:c,value:a,sync:""},r=!0;else if(n){const l=t[i];(l.value!==a||l.label!==c)&&(t[i]={label:c,value:a,sync:l.sync||""},r=!0)}}),r&&V.setDebounced(Le,t,0)}}let ri=null;function Ya(){if(!window.__vnptInited){window.__vnptInited=!0,It.info("Initializing VNPT Userscript..."),Gw();try{ti.init(),lp(),Ew(),Kw(),ww(),ow(),Zr(),Iw(),Cw(),Pw(),Uw(),nw(),cw();const n=Ud(()=>{Pd(),Nd(),It.debug("DOM Cache & Labels refreshed due to mutations")},1500);ri=new MutationObserver(e=>{e.some(r=>r.addedNodes.length>0||r.removedNodes.length>0?[...r.addedNodes,...r.removedNodes].some(s=>s.nodeType===1&&!["SCRIPT","STYLE","LINK"].includes(s.tagName)):!1)&&n()}),ri.observe(document.body,{childList:!0,subtree:!0}),It.info("Userscript initialized successfully.")}catch(n){It.error("Error during userscript initialization:",n)}}}function Ww(){It.info("Cleaning up VNPT Userscript for reload..."),ri&&(ri.disconnect(),ri=null);const n=document.getElementById("vnpt-docx-widget");n&&n.remove();const e=document.getElementById("vnpt-calc-widget");e&&e.remove();const t=document.getElementById("vnpt-styles");t&&t.remove(),window.__vnptInited=!1,It.info("Cleanup completed.")}window.__vnptCleanup=Ww,window.__vnptInit=Ya,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Ya):Ya();function Qw(){const n=V.get(on);if(!n||n.length===0){const e={id:"hanoi_default",name:"VNPT Hà Nội (Mặc định)",data:Me};V.set(on,[e]),V.set(Ai,"hanoi_default")}}function js(){return V.get(on)||[]}function Xa(){return V.get(Ai)}function Ja(n){const t=js().find(r=>r.id===n);return t?(V.set(Ai,n),V.set(Le,t.data),!0):!1}function Yw(n){const e=js(),t=V.get(Le)||Me,r={id:"p_"+Date.now(),name:n,data:t};return e.push(r),V.set(on,e),r.id}function Xw(n){if(n==="hanoi_default")return!1;let e=js();return e=e.filter(t=>t.id!==n),V.set(on,e),Xa()===n&&Ja("hanoi_default"),!0}function Jw(n){if(!Array.isArray(n))return;V.set(on,n);const e=Xa();n.find(t=>t.id===e)||Ja("hanoi_default")}const af=Object.freeze(Object.defineProperty({__proto__:null,createProfileFromCurrent:Yw,deleteProfile:Xw,getActiveProfileId:Xa,getProfiles:js,importProfiles:Jw,initProfiles:Qw,switchProfile:Ja},Symbol.toStringTag,{value:"Module"}))})();
