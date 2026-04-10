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
(function(){"use strict";const M={info:(...t)=>console.log("[Tampermonkey Script] INFO:",...t),error:(...t)=>console.error("[Tampermonkey Script] ERROR:",...t),warn:(...t)=>console.warn("[Tampermonkey Script] WARN:",...t)};function ye(){const t="vnpt-styles";if(document.getElementById(t))return;const n=document.createElement("style");n.id=t,n.textContent=`
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

        .btn-restore { background: #e8f0fe; color: var(--vnpt-primary); border: 1px solid rgba(26, 115, 232, 0.1); }
        .vnpt-btn-restore:hover { background: var(--vnpt-primary); color: #fff; border-color: transparent; }
        
        /* ═══════════════════════════════════════════
           SECTION: BACKUP HISTORY DROPDOWN
           ═══════════════════════════════════════════ */
        .vnpt-backup-history {
            position: absolute;
            top: calc(100% + 10px);
            right: 0;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px); border: 1px solid var(--vnpt-border);
            border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            width: 320px; max-height: 400px; overflow-y: auto;
            display: none; flex-direction: column; z-index: 2147483647;
            padding: 8px; animation: menuFadeIn 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
            transform-origin: top right;
        }
        .vnpt-backup-history.show { display: flex; }
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

        .pdf-dlg-body { flex: 1; overflow-y: auto; margin-bottom: 16px; border: 1px solid #e0e0e0; border-radius: 8px;}

        .pdf-result-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .pdf-result-table th { background: #f8f9fa; padding: 8px 10px; text-align: left; font-weight: 800; color: #5f6368; position: sticky; top: 0;}
        .pdf-result-table td { padding: 6px 10px; border-bottom: 1px solid #f1f3f4; }
        .pdf-row-auto td { background: rgba(30,142,62,0.04); }

        .vnpt-pdf-actions { display: flex; gap: 8px; justify-content: flex-end; align-items: center; }
        
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
           SECTION 8: RAW SCAN UI
           ═══════════════════════════════════════════ */
        .btn-scan-raw { background: rgba(26, 115, 232, 0.08); color: var(--vnpt-primary); border: 1px solid rgba(26, 115, 232, 0.1); }
        .btn-scan-raw:hover { background: var(--vnpt-primary); color: #fff; border-color: transparent; }
        .btn-scan-raw.active { background: var(--vnpt-primary); color: #fff; box-shadow: 0 4px 10px rgba(26, 115, 232, 0.3); }

        .vnpt-raw-scan-section {
            padding: 8px; background: rgba(255, 255, 255, 0.4);
            border-bottom: 1px solid var(--vnpt-border);
            display: flex; flex-direction: column; gap: 8px;
            animation: slideDown 0.3s ease;
        }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

        #vnpt-raw-scan-input {
            width: 100%; height: 100px; padding: 10px; border-radius: 12px;
            border: 1px solid #1f5bd2ff; background: rgba(255, 255, 255, 0.8);
            font-size: 12px; font-family: inherit; resize: vertical; line-height: 1.5;
            transition: all 0.2s;
        }
        #vnpt-raw-scan-input:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 3px var(--vnpt-primary-light); outline: none; }
        
        .raw-scan-actions { display: flex; justify-content: flex-end; }
        .raw-scan-actions .vnpt-btn-confirm { padding: 6px 16px; font-size: 12px; }

    `,document.head.appendChild(n)}const xe={widget:null,panel:null,header:null,bannerArea:null,toggleBtn:null,fieldsContainer:null,panelBody:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1,templateBuffer:null,templateName:null,hasDragged:!1},it=new Map,d=new Proxy(xe,{get(t,n){return n==="on"?(o,e)=>{it.has(o)||it.set(o,[]),it.get(o).push(e)}:t[n]},set(t,n,o){const e=t[n];return t[n]=o,e!==o&&it.has(n)&&it.get(n).forEach(a=>a(o,e)),!0}}),T={"tenDaiDienn, tenNguoiNhanCTS ":"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT","emailDaiDien, emailNhanCTS":"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Mã số thuế | GPKD",goiDV:"Gói Dịch Vụ","ngayKy, ngayKy1":"Ngày ký","thangKy, thangKy1":"Tháng Ký","namKy, namKy1":"Năm ký","ngayTiepNhan, ngayThangNamKy":"Ngày tiếp nhận / Ngày tháng năm ký","soHopDong, inputContractGroupName":"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký","lienheHopDongA, lienheTuVanA, lienheHoaDonA, sucoCap1A, sucoCap2A, sucoCap3A, sucoCap4A":"Liên hệ A"},rt=["soHopDong","tenDaiDienn","cmnd","sdt","diaChi","tenToChuc","ngayCapCustomer","emailDaiDien","soDkdn","goiDV","soHopDong"],z="vnpt_docx_fields",_="vnpt_docx_default_fields",vt="vnpt_docx_position",yt="vnpt_docx_size",xt="vnpt_docx_opened",lt="vnpt_docx_auto_backup",F="vnpt_autofill_data_default",Y="vnpt_autofill_data_custom",V="vnpt_autofill_data_sync",Vt="vnpt_widget_pos",W="vnd_tax_rate",wt="vnd_before_history",kt="vnd_after_history",st="vnpt_widget_collapsed",R="vnd_calc_map",et="vnpt_widget_datatab",ct="vnpt_templates",Bt="vnpt_txt_template",Et="vnpt_gemini_api_key",At="vnpt_gemini_model",dt="vnpt_hotkeys",we=Object.freeze(Object.defineProperty({__proto__:null,DEFAULT_LABELS:T,LOCAL_KEY_AUTO_BACKUP:lt,LOCAL_KEY_DEFAULT_FIELDS:_,LOCAL_KEY_FIELDS:z,LOCAL_KEY_OPENED:xt,LOCAL_KEY_POS:vt,LOCAL_KEY_SIZE:yt,REQUIRED_KEYS:rt,SK_CALC_MAP:R,SK_COLLAPSE:st,SK_DATATAB:et,SK_DATA_CUS:Y,SK_DATA_DEF:F,SK_DATA_SYNC:V,SK_GEMINI_KEY:Et,SK_GEMINI_MODEL:At,SK_HIST_A:kt,SK_HIST_B:wt,SK_HOTKEYS:dt,SK_POS_CALC:Vt,SK_TAX:W,SK_TEMPLATES:ct,SK_TXT_TEMPLATE:Bt},Symbol.toStringTag,{value:"Module"}));let j=null;function w(t,n="#198754",o=2500){j||(j=document.createElement("div"),j.id="vnpt-toast-container",Object.assign(j.style,{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column-reverse",alignItems:"center",gap:"8px",zIndex:"1000000",pointerEvents:"none"}),document.body.appendChild(j));const e=document.createElement("div");e.innerText=t,Object.assign(e.style,{background:n,color:"#fff",padding:"8px 18px",borderRadius:"24px",opacity:"0",transform:"translateY(10px)",transition:"opacity 0.3s, transform 0.3s",fontSize:"13px",fontWeight:"500",fontFamily:"'Segoe UI', Roboto, sans-serif",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",whiteSpace:"nowrap",pointerEvents:"auto"}),j.appendChild(e),requestAnimationFrame(()=>{e.style.opacity="1",e.style.transform="translateY(0)"}),setTimeout(()=>{e.style.opacity="0",e.style.transform="translateY(-10px)",setTimeout(()=>{e.remove(),j&&j.childNodes.length},300)},o)}const ke="vnpt_templates_db",X="buffers";let Ct=null;function Mt(){return Ct?Promise.resolve(Ct):new Promise((t,n)=>{const o=indexedDB.open(ke,1);o.onupgradeneeded=e=>{const a=e.target.result;a.objectStoreNames.contains(X)||a.createObjectStore(X)},o.onsuccess=e=>{Ct=e.target.result,t(Ct)},o.onerror=()=>n(o.error)})}async function Ee(t,n){const o=await Mt();return new Promise((e,a)=>{const c=o.transaction(X,"readwrite").objectStore(X).put(n,t);c.onsuccess=()=>e(),c.onerror=()=>a(c.error)})}async function Ce(t){const n=await Mt();return new Promise((o,e)=>{const l=n.transaction(X,"readonly").objectStore(X).get(t);l.onsuccess=()=>o(l.result),l.onerror=()=>e(l.error)})}async function Te(t){const n=await Mt();return new Promise((o,e)=>{const l=n.transaction(X,"readwrite").objectStore(X).delete(t);l.onsuccess=()=>o(),l.onerror=()=>e(l.error)})}const J=new Map,Tt=new Map,g={isGM:typeof GM_setValue<"u"&&typeof GM_getValue<"u",get(t,n=null){if(J.has(t))return J.get(t);try{let o;if(this.isGM?o=GM_getValue(t,null):o=localStorage.getItem(t),o==null)return n;const e=typeof o=="string"?JSON.parse(o):o;return J.set(t,e),e}catch(o){return console.warn(`[Storage] Không thể đọc key "${t}":`,o),n}},set(t,n){J.set(t,n);try{return this.isGM?GM_setValue(t,n):localStorage.setItem(t,JSON.stringify(n)),!0}catch(o){return console.error(`[Storage] Không thể ghi key "${t}":`,o),!1}},setDebounced(t,n,o=500){J.set(t,n),Tt.has(t)&&clearTimeout(Tt.get(t));const e=setTimeout(()=>{this.set(t,n),Tt.delete(t)},o);Tt.set(t,e)},remove(t){J.delete(t);try{this.isGM?GM_deleteValue(t):localStorage.removeItem(t)}catch(n){console.error(`[Storage] Không thể xóa key "${t}":`,n)}},clearCache(){J.clear()}};function pt(){try{const t=g.get(ct)||[],n=t.filter(o=>o.type!=="local");return n.length!==t.length&&ut(n),n}catch{return[]}}function ut(t){g.set(ct,t)}function Se(t){const n=t.match(/drive\.google\.com\/file\/d\/([^/]+)/);return n?`https://drive.google.com/uc?export=download&id=${n[1]}`:t}function Le(t){return new Promise((n,o)=>{GM_xmlhttpRequest({method:"GET",url:Se(t),responseType:"arraybuffer",onload:e=>{if(e.status>=200&&e.status<300){if(e.response&&e.response.byteLength>4){const a=new Uint8Array(e.response.slice(0,4));if(a[0]===80&&a[1]===75&&a[2]===3&&a[3]===4){n(e.response);return}else{o(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}n(e.response)}else o(new Error(`HTTP ${e.status}: Không lấy được file`))},onerror:()=>o(new Error("Không thể tải URL.")),ontimeout:()=>o(new Error("Timeout khi tải URL."))})})}async function Ne(t,n,o){const e=t.name.replace(/\.docx$/i,""),a=prompt("Đặt tên biến nhớ cho file này:",e);if(!(!a||!a.trim()))try{const i=await t.arrayBuffer();await Ee(a.trim(),i);const c=pt().filter(s=>s.name!==a.trim()&&s.fileName!==t.name);c.unshift({name:a.trim(),type:"local_idb",fileName:t.name,lastUsed:Date.now()}),ut(c),Q(n,o),o&&o(i,a.trim())}catch(i){w(`❌ Lỗi lưu file: ${i.message}`,"#dc3545")}}function Q(t,n,o=null){let e=t.querySelector(".vnpt-template-manager-inner"),a,i;if(e)a=e.querySelector(".vnpt-local-list-container"),i=e.querySelector(".vnpt-btn-wrap");else{t.innerHTML="",e=document.createElement("div"),e.className="vnpt-template-manager-inner";const s=document.createElement("div");s.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const p=document.createElement("span");p.className="vnpt-title-main",p.style.cssText="font-size:11px;font-weight:700;color:#444;",i=document.createElement("div"),i.className="vnpt-btn-wrap",i.style.cssText="display:flex;gap:4px;",s.appendChild(p),s.appendChild(i),e.appendChild(s),a=document.createElement("div"),a.className="vnpt-local-list-container",a.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",e.appendChild(a),t.appendChild(e)}const l=pt(),c=e.querySelector(".vnpt-title-main");c.innerHTML="Templates"+(o?` <span style="color:#2e7d32;">(Đang dùng: ${o})</span>`:""),l.length===0?a.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':a.innerHTML="",l.forEach((s,p)=>{const r=document.createElement("div");r.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",r.title=s.fileName||s.url||s.name,r.tabIndex=0,r.onfocus=()=>r.style.boxShadow="0 0 0 2px #28a745",r.onblur=()=>r.style.boxShadow="none";const m=s.type==="local"||s.type==="local_base64"||s.type==="local_idb"?"OFF":"ON",x=m==="OFF"?"#6c757d":"#28a745",y=document.createElement("span");y.textContent=m,y.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${x};color:#fff;`;const h=document.createElement("span");h.textContent=s.name,h.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",r.onclick=()=>{r.focus(),De(s,n,o,t)},r.appendChild(y),r.appendChild(h);const u=document.createElement("button");u.innerHTML="✎",u.title="Đổi tên template",u.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",u.onclick=v=>{v.stopPropagation();const b=prompt("Đổi tên template:",s.name);if(b&&b.trim()&&b.trim()!==s.name){const E=pt();E[p].name=b.trim(),ut(E),Q(t,n,o)}},r.appendChild(u);const f=document.createElement("button");f.innerHTML="✕",f.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",f.onclick=async v=>{if(v.stopPropagation(),confirm(`Xoá biểu mẫu "${s.name}"?`)){const b=pt();b.splice(p,1),ut(b),s.type==="local_idb"&&await Te(s.name).catch(()=>null),Q(t,n,o===s.name?null:o)}},r.appendChild(f),a.appendChild(r)})}function De(t,n,o,e){const a=pt(),i=a.find(l=>l.name===t.name&&(l.url===t.url||l.type===t.type));if(i&&(i.lastUsed=Date.now(),ut(a)),t.type==="local_idb"){Ce(t.name).then(l=>{if(!l)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");n&&n(l,t.name),Q(e,n,t.name)}).catch(l=>{w(`❌ Lỗi nạp File IDB: ${l.message}`,"#dc3545")});return}if(t.type==="local_base64"&&t.data){try{const l=window.atob(t.data.split(",")[1]),c=l.length,s=new Uint8Array(c);for(let p=0;p<c;p++)s[p]=l.charCodeAt(p);n&&n(s.buffer,t.name),Q(e,n,t.name)}catch(l){w(`❌ Lỗi nạp Base64: ${l.message}`,"#dc3545")}return}Le(t.url).then(l=>{n&&n(l,t.name),Q(e,n,t.name)}).catch(l=>{w(`❌ ${l.message}`,"#dc3545")})}function Ie(t,n){if(t.length===0)return n.length;if(n.length===0)return t.length;const o=[];for(let e=0;e<=n.length;e++)o[e]=[e];for(let e=0;e<=t.length;e++)o[0][e]=e;for(let e=1;e<=n.length;e++)for(let a=1;a<=t.length;a++)n.charAt(e-1)===t.charAt(a-1)?o[e][a]=o[e-1][a-1]:o[e][a]=Math.min(o[e-1][a-1]+1,o[e][a-1]+1,o[e-1][a]+1);return o[n.length][t.length]}function Be(t,n){let o=t,e=n;t.length<n.length&&(o=n,e=t);const a=o.length;return a===0?1:(a-Ie(o,e))/parseFloat(a)}function Ae(t,n,o=.7){let e=null,a=-1;const i=t.toLowerCase().trim();for(const l of n){const c=l.toLowerCase().trim(),s=Be(i,c);s>a&&s>=o&&(a=s,e=l)}return e}function Me(t){if(!t)return"";let n=t.replace(/\D/g,"");return n.startsWith("84")&&(n="0"+n.slice(2)),n}function _e(t){if(!t)return"";const n=t.split(/[-/]/);if(n.length===3){let o,e,a;return n[0].length===4?[a,e,o]=n:[o,e,a]=n,`${o.padStart(2,"0")}/${e.padStart(2,"0")}/${a}`}return t}const ft=new Map;let _t=[],jt=0;const Oe=3e3;function He(){ft.clear()}function Xt(){_t=Array.from(document.querySelectorAll("label, .label, .label-text, span.title, .form-label")),jt=Date.now()}function Ke(t){t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}))}function gt(t,n){var a;const o=t.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,e=(a=Object.getOwnPropertyDescriptor(o,"value"))==null?void 0:a.set;e?e.call(t,n):t.value=n,Ke(t)}function nt(t,n=null){if(!t)return null;const o=ft.get(t);if(o&&document.contains(o))return o;const e=document.getElementById(t);if(e&&(e.tagName==="INPUT"||e.tagName==="TEXTAREA"||e.tagName==="SELECT"))return ft.set(t,e),e;const a=`input[id="${t}"], textarea[id="${t}"], select[id="${t}"], input[name="${t}"], textarea[name="${t}"], input[formcontrolname="${t}"], textarea[formcontrolname="${t}"], input[placeholder="${t}"], textarea[placeholder="${t}"]`,i=document.querySelector(a);if(i)return ft.set(t,i),i;const l=n||t;(_t.length===0||Date.now()-jt>Oe)&&Xt();const c=_t;let s=c.find(p=>p.innerText.trim()===l);if(!s&&l.length>2){const p=c.map(m=>m.innerText.trim()).filter(m=>m.length>0),r=Ae(l,p,.8);r&&(s=c.find(m=>m.innerText.trim()===r))}if(s){let p=null;if(s.htmlFor&&(p=document.getElementById(s.htmlFor)),!p){let r=s.parentElement,m=0;for(;r&&m<3;){const x=r.querySelector("input, textarea, select");if(x){p=x;break}r=r.parentElement,m++}}if(p)return ft.set(t,p),p}return null}function Ot(t){return nt(null,t)}function Z(t,n,o=null){const e=nt(t,o);e&&gt(e,n)}function Pe(t=new Date){return String(t.getDate()).padStart(2,"0")}function ze(t=new Date){return String(t.getMonth()+1).padStart(2,"0")}function Fe(t=new Date){return String(t.getFullYear())}function Yt(){const t=new Date;return{ngay:Pe(t),thang:ze(t),nam:Fe(t)}}const{ngay:Wt,thang:Jt,nam:Qt}=Yt(),O={"ngayKy, ngayKy1":{label:"Ngày ký",value:Wt},"thangKy, thangKy1":{label:"Tháng ký",value:Jt},"namKy, namKy1":{label:"Năm ký",value:Qt},"ngayTiepNhan, ngayThangNamKy":{label:"Ngày ký (full)",value:`${Wt}/${Jt}/${Qt}`},tenDoanhNghiepB:{label:"Tên doanh nghiệp B",value:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM"},diaChiB:{label:"Địa chỉ B",value:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội"},maSoThueB:{label:"Mã số thuế B",value:"0100686223"},stkB:{label:"Số tài khoản B",value:"1600114156"},diaChiStkB:{label:"Ngân hàng/Địa chỉ STK B",value:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)"},"tenB, nguoiDaiDienB, tenDaiDienB":{label:"Người đại diện B",value:"Phạm Khánh Chung"},"chucVuB, chucVuDaiDienB":{label:"Chức vụ B",value:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp"},"giayUyQuyenSoB, soGiayUyQuyenB":{label:"Giấy ủy quyền số B",value:"2628/GUQ-VNPT-HNI-VP"},"giayUyQuyenNgayB, ngayGiayUyQuyenB":{label:"Giấy ủy quyền ngày B",value:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},GiayUyQuyenB:{label:"Giấy ủy quyền B (full)",value:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},tenDoanhNghiepB1:{label:"Tên doanh nghiệp B (phụ)",value:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},donViTiepNhan:{label:"Đơn vị tiếp nhận",value:"TTKD KHDN"},"tenTiepNhan, tenNguoiNhan":{label:"Người tiếp nhận",value:"Bùi Anh"},dienThoaiB:{label:"Điện thoại B",value:"02436686868"},diaChiTaiKhoanB:{label:"Địa chỉ tài khoản B",value:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 "},noiKy:{label:"Nơi ký",value:"Hà Nội"},emailB:{label:"Email B",value:""},"lienheHopDongB, lienheTuVanB, lienheHoaDonB, sucoCap1B, sucoCap2B, sucoCap3B, sucoCap4B":{label:"Liên hệ B (AM)",value:"AM Bùi Anh"}},Zt={soHopDong:"soHopDong, inputContractGroupName"},Ht={after:["cuocDV","tongCong","tongCongHD","congCA","giaTriHopDong","tongGIaTriHopDong"],before:["donGiaCA","thanhTienCA","tongThanhTien","tongCuocTruocThue"],tax:["tongThueGTGT","tongThue","thueCA","thueVAT"],text:["soTienThanhToanBangChu","tongCongBangChu","tongCongHDbangChu","ghiChuGiaTriHopDong","tongGiaTriHopDongBangChu"]},Re=.08,Kt={SCAN:{key:"s",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Quét dữ liệu"},FILL:{key:"f",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Điền Web"},SCAN_PDF:{key:"p",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Scan PDF (AI)"},EXPORT_DOCX:{key:"e",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Xuất DOCX"},COPY_TXT:{key:"c",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Copy Text (Template)"},TOGGLE:{key:"w",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Đóng/Mở Widget"},CLEAN:{key:"d",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Clean Data"}};function te(t,n){let o;return function(...a){const i=()=>{clearTimeout(o),t(...a)};clearTimeout(o),o=setTimeout(i,n)}}function ee(){const t=g.get(F)??{...O},n=g.get(Y)??{},o={...t,...n};Object.keys(o).forEach(e=>{const a=o[e],i=a&&typeof a=="object"&&a.hasOwnProperty("value")?a.value:a;e.split(",").map(c=>c.trim()).filter(c=>c).forEach(c=>{let s=nt(c)||Ot(c);s&&gt(s,i)})}),w("✅ Auto fill complete")}function $e(){let t=g.get(V)??{};const n={...Zt,...t},o=Object.keys(n);if(o.length===0){w("⚠️ No sync mapping","#ffc107");return}o.forEach(e=>{let a=nt(e)||Ot(e);a&&a.value!==void 0&&a.value!==""&&n[e].split(",").map(l=>l.trim()).filter(l=>l).forEach(l=>Z(l,a.value))}),w("✅ Sync form complete","#d39e00")}let Pt=!1;const ne=new Map,Ge=(t,n)=>{var s;if(Pt)return;let o=g.get(V)??{};const e={...Zt,...o};if(Object.keys(e).length===0)return;let a=t.id,i=t.name,l=null;if(a){const p=document.querySelector(`label[for="${a}"]`);p&&(l=p.textContent.trim())}if(!l){const p=t.closest("label");p&&(l=(s=Array.from(p.childNodes).find(r=>r.nodeType===3))==null?void 0:s.textContent.trim())}let c=e[a]||e[i]||e[l];if(c){Pt=!0;try{c.split(",").map(r=>r.trim()).filter(r=>r).forEach(r=>{if(r!==a&&r!==i&&r!==l){let m=ne.get(r);(!m||!document.contains(m))&&(m=nt(r)||Ot(r),m&&ne.set(r,m)),m&&document.activeElement!==m&&gt(m,n)}})}finally{Pt=!1}}},qe=te((t,n)=>{Ge(t,n)},250);function Ue(){document.addEventListener("input",t=>{const n=t.target;!n||!["INPUT","TEXTAREA"].includes(n.tagName)||n.closest("#vnpt-docx-widget")||n.closest("#vnpt-inline-calc")||qe(n,n.value)})}const Ve={async lookupMST(t){if(!t||t.length<10)return null;const n=`https://api.vietqr.io/v2/business/${t}`;try{const e=await(await fetch(n)).json();if(e.code==="00"&&e.data){const{name:a,address:i,representative:l,status:c}=e.data;return{name:a||"",address:i||"",representative:l||"",status:c||""}}return null}catch(o){return console.error("[MST Service] Error fetching MST:",o),null}}};function oe(t){if(!t)return t;const n={};return Object.keys(t).forEach(o=>{const e=t[o];o.split(",").map(i=>i.trim()).filter(i=>i).forEach(i=>{n[i]=e})}),n}function ae(){const t={version:"1.0",timestamp:new Date().toISOString(),backup:{fields:g.get(z),defaultFields:g.get(_),dataDefault:oe(g.get(F)),dataCustom:oe(g.get(Y)),dataSync:g.get(V),taxRate:g.get(W),calcMap:g.get(R),templates:g.get(ct)}},n=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),o=URL.createObjectURL(n),e=document.createElement("a");e.href=o,e.download=`vnpt_full_backup_${new Date().toLocaleDateString().replace(/\//g,"-")}.json`,e.click(),URL.revokeObjectURL(o),w("✅ Đã xuất file sao lưu hệ thống.")}async function ie(t){return new Promise(n=>{const o=new FileReader;o.onload=e=>{try{const a=JSON.parse(e.target.result);if(!a.backup)throw new Error("File không đúng định dạng backup.");const i=a.backup;i.fields&&g.set(z,i.fields),i.defaultFields&&g.set(_,i.defaultFields),i.dataDefault&&g.set(F,i.dataDefault),i.dataCustom&&g.set(Y,i.dataCustom),i.dataSync&&g.set(V,i.dataSync),i.taxRate&&g.set(W,i.taxRate),i.calcMap&&g.set(R,i.calcMap),i.templates&&g.set(ct,i.templates),w("✅ Đã nhập dữ liệu thành công! Vui lòng tải lại trang hoặc widget.","#1e8e3e"),n(!0)}catch{w("❌ Lỗi: File sao lưu không hợp lệ.","#ff5252"),n(!1)}},o.readAsText(t)})}function re(t=""){let n=g.get(lt);Array.isArray(n)||(n=[]);const o={id:Date.now().toString(),name:t||`Bản sao lưu ${new Date().toLocaleString()}`,timestamp:new Date().toISOString(),data:{fields:g.get(z),defaultFields:g.get(_)}};n.unshift(o);const e=n.slice(0,10);g.set(lt,e),console.log(`✅ Field backup created: ${o.name}`)}function le(){const t=g.get(lt);return t&&!Array.isArray(t)?(g.remove(lt),[]):Array.isArray(t)?t:[]}function je(t){const o=le().find(a=>a.id===t);if(!o||!o.data)return w("⚠️ Không tìm thấy bản sao lưu hợp lệ!","#ffc107"),!1;const e=o.data;return e.fields&&g.set(z,e.fields),e.defaultFields&&g.set(_,e.defaultFields),w(`✅ Đã khôi phục các trường: ${o.name}`,"#1e8e3e"),!0}function S(t,n,o=null,e=""){const a=d.fieldsContainer.querySelector(".text-hint");a&&a.remove();const i=d.fieldsContainer.querySelectorAll(".f-key");let l=!1;const c=t.split(",")[0].trim();for(let s of i)if(s.value.split(",")[0].trim()===c){const r=s.closest(".vnpt-field-row"),m=r.querySelector(".f-val"),x=r.querySelector(".f-label");n!==""&&m.value!==n&&document.activeElement!==m&&(m.value=n),o!==null&&o!==""&&x.value!==o&&document.activeElement!==x&&(x.value=o),e!==""&&s.value!==t+", "+e&&document.activeElement!==s&&(s.value=t+", "+e),l=!0;break}if(!l){(o===null||o==="")&&(o=T[t]||"");const s=document.createElement("div");s.className="vnpt-field-row row-item",s.setAttribute("draggable","false");let p=t;e&&(p+=", "+e);const r=c;s.innerHTML=`
            <input type="checkbox" id="chk-${r}" name="chk-${r}" class="row-chk" title="Chọn" style="margin: 0 2px 0 2px;" />
            <input type="text" id="lbl-${r}" name="lbl-${r}" class="f-label" value="${o}" />
            <input type="text" id="key-${r}" name="key-${r}" class="f-key" value="${p}" title="Biến DOCX và IDs đồng bộ" />
            <span class="row-drag-handle" title="Kéo">=</span>
            ${r==="soDkdn"?`
                <div class="mst-lookup-wrapper">
                    <input type="text" id="val-${r}" name="val-${r}" class="f-val" value="${n}" placeholder="Mã số thuế..." />
                    <button class="btn-mst-lookup" title="Tra cứu Mã số thuế">
                        <span class="icon">🔍</span>
                        <div class="spinner"></div>
                    </button>
                </div>
            `:`
                <input type="text" id="val-${r}" name="val-${r}" class="f-val" value="${n}" />
            `}
        `;const m=s.querySelector(".f-val"),x=s.querySelector(".f-key");t==="tenToChuc"&&(m.style.textAlign="right");const y=()=>{rt.includes(c)&&(m.value.trim()?m.classList.remove("field-required-empty"):m.classList.add("field-required-empty"))},h=()=>{const f=m.value;x.value.split(",").map(b=>b.trim()).filter(b=>b).forEach(b=>Z(b,f))};if(x.addEventListener("input",function(){B();const f=this.value.split(",")[0].trim();m.style.textAlign=f==="tenToChuc"?"right":""}),x.addEventListener("change",function(){h()}),s.querySelector(".f-label").addEventListener("input",B),m.addEventListener("input",function(){B(),y()}),m.addEventListener("change",function(){h()}),r==="soDkdn"){const f=s.querySelector(".btn-mst-lookup");f.onclick=async()=>{const v=m.value.trim();if(!v){w("⚠️ Vui lòng nhập mã số thuế","#ffc107");return}f.classList.add("loading");try{const b=await Ve.lookupMST(v);b?(m.value=v,S("tenToChuc",b.name),S("diaChi",b.address),b.representative&&S("tenDaiDienn",b.representative),B(),setTimeout(()=>ce(),300),w(`✅ Đã tìm thấy: ${b.name}`,"#1a73e8")):w("❌ Không tìm thấy thông tin MST này","#ea4335")}catch{w("❌ Lỗi khi tra cứu MST","#ea4335")}finally{f.classList.remove("loading")}}}y();const u=s.querySelector(".row-drag-handle");u.addEventListener("mouseenter",()=>s.setAttribute("draggable","true")),u.addEventListener("mouseleave",()=>{s.classList.contains("dragging")||s.setAttribute("draggable","false")}),s.addEventListener("dragstart",function(f){d.draggedRowForVNPT=this,f.dataTransfer.effectAllowed="move",f.dataTransfer.setData("text/plain",t),this.classList.add("dragging")}),s.addEventListener("dragover",f=>(f.preventDefault(),!1)),s.addEventListener("dragenter",function(){this.classList.add("over")}),s.addEventListener("dragleave",function(){this.classList.remove("over")}),s.addEventListener("drop",function(f){if(f.stopPropagation(),d.draggedRowForVNPT&&d.draggedRowForVNPT!==this){const v=Array.from(d.fieldsContainer.querySelectorAll(".vnpt-field-row")),b=v.indexOf(d.draggedRowForVNPT),E=v.indexOf(this);b<E?this.parentNode.insertBefore(d.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(d.draggedRowForVNPT,this),B()}return!1}),s.addEventListener("dragend",function(){this.setAttribute("draggable","false"),d.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(f=>{f.classList.remove("over","dragging")}),d.draggedRowForVNPT=null}),d.fieldsContainer.appendChild(s),d.fieldsContainer.scrollTop=d.fieldsContainer.scrollHeight}}function B(){const t=d.isDefaultMode?_:z,n={};d.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(e=>{const i=e.querySelector(".f-key").value.trim().split(",").map(r=>r.trim()).filter(r=>r),l=i[0],c=i.slice(1).join(", "),s=e.querySelector(".f-label").value.trim(),p=e.querySelector(".f-val").value;l&&(n[l]={label:s,value:p,sync:c})}),g.setDebounced(t,n,1e3)}function se(){var e,a;const t=g.get(z)||{},n=((e=t.tenDaiDienn)==null?void 0:e.value)||"",o=((a=t.soHopDong)==null?void 0:a.value)||"";return!n&&!o?`Bản sao lưu ${new Date().toLocaleString()}`:`${n} - ${o}`}function St(){try{d.fieldsContainer.innerHTML="";const n=g.get(z)||{};Object.keys(T).forEach(o=>{const e=T[o],a=n[o];a&&typeof a=="object"?S(o,a.value,a.label||e,a.sync||""):a?S(o,a,e,""):S(o,"",e,"")}),Object.keys(n).forEach(o=>{if(!(o in T)){const e=n[o];typeof e=="object"?S(o,e.value,e.label,e.sync||""):S(o,e,"","")}}),Object.keys(T).length===0&&Object.keys(n).length===0&&(d.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(n){console.error("Error loading config:",n),Object.keys(T).forEach(o=>S(o,"",T[o]))}const t=g.get(vt);t&&d.widget&&(d.widget.style.bottom="auto",t.right?(d.widget.style.right=t.right,d.widget.style.left="auto"):t.left&&(d.widget.style.left=t.left,d.widget.style.right="auto"),t.top&&(d.widget.style.top=t.top))}function Xe(){document.getElementById("vnpt-btn-toggle-id").onclick=()=>d.fieldsContainer.classList.toggle("show-ids");const t=document.getElementById("vnpt-btn-clean-data");t&&(t.onclick=()=>{confirm("Dữ liệu hiện tại sẽ được Xóa. Bạn có muốn SAO LƯU nhanh trước khi làm sạch không?")&&(re(se()),g.remove(z),g.remove(R),g.remove(W),document.querySelectorAll("input[data-clink]").forEach(o=>{const e=o.dataset.clink;o.value=(Ht[e]||[]).join(", ")}),d.isDefaultMode?(g.remove(_),zt(!0)):St(),w("🧹 Đã làm sạch toàn bộ dữ liệu & cấu hình","#1a73e8"))}),setTimeout(()=>{const o=document.getElementById("vnpt-btn-restore-last"),e=document.getElementById("vnpt-backup-history");o&&e?(M.info("🔄 Restore button found and bound."),o.onclick=a=>{a.preventDefault(),a.stopPropagation(),e.classList.contains("show")?e.classList.remove("show"):(e.classList.add("show"),n(e),M.debug("✨ Backup history displayed."))},document.addEventListener("click",a=>{e.classList.contains("show")&&!e.contains(a.target)&&!o.contains(a.target)&&e.classList.remove("show")})):M.error("❌ Fix UI: Could not find Restore button or History list container.")},500);function n(o){const e=le();if(M.debug("📋 Rendering backups count:",e.length),o.innerHTML="",e.length===0){o.innerHTML='<div class="backup-history-empty">Chưa có bản sao lưu nào. Hãy thử Clean Data để tạo bản mới!</div>';return}e.forEach(a=>{const i=document.createElement("div");i.className="backup-history-item";const l=new Date(a.id*1).toLocaleString();i.innerHTML=`
                <div class="backup-history-name" title="${a.name}">${a.name}</div>
                <div class="backup-history-time">${l}</div>
            `,i.onclick=c=>{var s;c.stopPropagation(),confirm(`Bạn có chắc muốn khôi phục dữ liệu từ bản: 
${a.name}?`)&&je(a.id)&&(o.classList.remove("show"),d.isDefaultMode?(s=document.getElementById("vnpt-btn-default"))==null||s.click():St())},o.appendChild(i)})}document.getElementById("vnpt-btn-default").onclick=()=>{d.isDefaultMode=!d.isDefaultMode},d.on("isDefaultMode",o=>zt(o)),document.getElementById("vnpt-btn-reset-default").onclick=()=>{confirm("Khôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?")&&(g.remove(_),g.remove(R),g.remove(W),d.isDefaultMode&&(zt(!0),w("🔄 Đã khôi phục dữ liệu gốc","#1a73e8")))},document.getElementById("vnpt-btn-batch-del").onclick=()=>{const o=d.fieldsContainer.querySelectorAll(".vnpt-field-row");let e=0;o.forEach(a=>{var i;(i=a.querySelector(".row-chk"))!=null&&i.checked&&(a.remove(),e++)}),e===0?confirm("Xóa TOÀN BỘ dữ liệu các trường? Hệ thống sẽ tự động SAO LƯU bản hiện tại.")&&(re(se()),o.forEach(a=>a.remove()),w("🗑️ Đã xóa toàn bộ","#ff5252"),B()):(w(`🗑️ Đã xóa ${e} trường`,"#ff5252"),B())},document.getElementById("vnpt-btn-add").onclick=()=>{const o=d.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;S("bien_moi_"+o,"","",""),B()},document.getElementById("vnpt-btn-fill-back").onclick=()=>{ce()}}function ce(){ee();let t=0;d.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(n=>{const o=n.querySelector(".f-key").value.trim(),e=n.querySelector(".f-val").value;o.split(",").map(a=>a.trim()).filter(Boolean).forEach(a=>{(document.getElementById(a)||document.getElementsByName(a)[0])&&(Z(a,e),t++)})}),t>0?w(`✅ Đã đồng bộ ${t} trường lên web`,"#198754"):w("⚠️ Không có trường nào để đồng bộ","#ffc107")}function zt(t){const n=document.getElementById("vnpt-btn-default"),o=document.getElementById("vnpt-btn-reset-default");if(d.fieldsContainer.innerHTML="",d.bannerArea.innerHTML="",t){n.classList.add("active"),n.innerHTML="✅ Chế độ: Dữ liệu mặc định",o&&(o.style.display="flex"),document.getElementById("vnpt-fields-container").classList.add("vnpt-mode-default"),w("📌 Chế độ Dữ liệu mặc định (Có thể sửa)","#ea4335");const e=document.createElement("div");e.className="vnpt-default-banner",e.innerHTML='<span style="color: red;"> LƯU Ý: ĐÂY LÀ DỮ LIỆU MẶC ĐỊNH</span>',d.bannerArea.appendChild(e);const a=g.get(_);a===null?Object.keys(O).forEach(i=>{const l=O[i],c=l&&typeof l=="object"?l.value:l,s=l&&typeof l=="object"?l.label:T[i]||"";S(i,c,s)}):Object.keys(a).forEach(i=>{const l=a[i];S(i,l.value,l.label,l.sync||"")})}else n.classList.remove("active"),n.innerHTML="🛠 Dữ liệu mặc định VNPT",o&&(o.style.display="none"),document.getElementById("vnpt-fields-container").classList.remove("vnpt-mode-default"),w("📋 Đã quay lại Dữ liệu cá nhân"),St()}let Ft=!1,ot=null,ht=null;function Ye(){window.addEventListener("keydown",t=>{if(Ft&&ht){Ze(t);return}const n=g.get(dt,Kt);for(const[o,e]of Object.entries(n))if(We(t,e)){t.preventDefault(),Je(o);return}})}function We(t,n){if(!n||!n.key)return!1;const o=t.key.toLowerCase()===n.key.toLowerCase(),e=!!t.altKey==!!n.altKey,a=!!t.ctrlKey==!!n.ctrlKey,i=!!t.shiftKey==!!n.shiftKey;return o&&e&&a&&i}function Je(t){var n,o,e,a,i,l,c;switch(t){case"SCAN":(n=document.getElementById("vnpt-btn-scan"))==null||n.click();break;case"FILL":(o=document.getElementById("vnpt-btn-fill-back"))==null||o.click();break;case"SCAN_PDF":(e=document.getElementById("vnpt-btn-scan-pdf"))==null||e.click();break;case"EXPORT_DOCX":(a=document.getElementById("vnpt-btn-export"))==null||a.click();break;case"COPY_TXT":(i=document.getElementById("vnpt-btn-export-txt"))==null||i.click();break;case"TOGGLE":(l=document.getElementById("vnpt-toggle-btn"))==null||l.click();break;case"CLEAN":(c=document.getElementById("vnpt-btn-clean-data"))==null||c.click();break}}function Qe(t,n){Ft=!0,ot=t,ht=n,w("Vui lòng nhấn tổ hợp phím mong muốn...","info")}function Ze(t){var a;if(["Alt","Control","Shift","Meta"].includes(t.key))return;t.preventDefault(),t.stopPropagation();const n={key:t.key.toLowerCase(),altKey:t.altKey,ctrlKey:t.ctrlKey,shiftKey:t.shiftKey},o=g.get(dt,Kt);o[ot]={...o[ot],...n},g.set(dt,o);const e=((a=o[ot])==null?void 0:a.label)||ot;w(`Đã lưu phím tắt cho ${e}: ${Rt(n)}`,"success"),ht&&ht(n),Ft=!1,ot=null,ht=null}function Rt(t){if(!t||!t.key)return"Chưa gán";const n=[];t.ctrlKey&&n.push("Ctrl"),t.altKey&&n.push("Alt"),t.shiftKey&&n.push("Shift");let o=t.key.toUpperCase();return o===" "&&(o="Space"),n.push(o),n.join(" + ")}async function de({apiKey:t,model:n,systemInstruction:o,userText:e,fileData:a}){return new Promise((i,l)=>{if(!t)return l("Vui lòng nhập API Key Gemini trong Cài đặt.");const c=`https://generativelanguage.googleapis.com/v1beta/models/${n}:generateContent?key=${t}`,s={system_instruction:{parts:[{text:o}]},contents:[{parts:[{text:e}]}],generation_config:{response_mime_type:"application/json"}};a&&a.base64&&s.contents[0].parts.push({inline_data:{mime_type:a.mimeType,data:a.base64}});const p=r=>{if(r)try{let m=r.replace(/```json/g,"").replace(/```/g,"").trim();i(JSON.parse(m))}catch(m){console.error("Lỗi parse JSON từ Gemini",m,r),l("AI trả về kết quả không đúng cấu hình JSON.")}else l("AI không trả về kết quả hợp lệ.")};typeof GM_xmlhttpRequest<"u"?GM_xmlhttpRequest({method:"POST",url:c,headers:{"Content-Type":"application/json"},data:JSON.stringify(s),timeout:3e4,onload:r=>{var m,x,y,h,u;if(r.status>=200&&r.status<300)try{const f=JSON.parse(r.responseText),v=(u=(h=(y=(x=(m=f==null?void 0:f.candidates)==null?void 0:m[0])==null?void 0:x.content)==null?void 0:y.parts)==null?void 0:h[0])==null?void 0:u.text;p(v)}catch{l("Lỗi Parse kết quả từ Gemini API.")}else l(`API Gemini lỗi (${r.status}): ${r.responseText}`)},ontimeout:()=>l("Quá hạn thời gian gọi API (30s)"),onerror:r=>l("Lỗi kết nối đến Google Gemini API.")}):fetch(c,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)}).then(r=>r.json()).then(r=>{var x,y,h,u,f;if(r.error)return l(r.error.message);const m=(f=(u=(h=(y=(x=r==null?void 0:r.candidates)==null?void 0:x[0])==null?void 0:y.content)==null?void 0:h.parts)==null?void 0:u[0])==null?void 0:f.text;p(m)}).catch(r=>l(r.message))})}async function tn(t,n){if(!t)throw new Error("Vui lòng nhập API Key.");const o={contents:[{parts:[{text:"Ping"}]}],generation_config:{max_output_tokens:5,response_mime_type:"text/plain"}},e=`https://generativelanguage.googleapis.com/v1beta/models/${n}:generateContent?key=${t}`;return new Promise((a,i)=>{const l=c=>{var s;try{return((s=JSON.parse(c).error)==null?void 0:s.message)||c}catch{return c}};typeof GM_xmlhttpRequest<"u"?GM_xmlhttpRequest({method:"POST",url:e,headers:{"Content-Type":"application/json"},data:JSON.stringify(o),timeout:1e4,onload:c=>{if(c.status>=200&&c.status<300)a(!0);else{const s=l(c.responseText);i(`API Error ${c.status}: ${s}`)}},onerror:c=>i("Lỗi kết nối mạng hoặc CORS."),ontimeout:()=>i("Hết thời gian chờ (10s).")}):fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)}).then(async c=>{if(c.ok)return a(!0);const s=await c.text();i(`API Error ${c.status}: ${l(s)}`)}).catch(c=>i(c.message))})}function en(){const t=document.getElementById("vnpt-docx-widget")||document.createElement("div");t.id="vnpt-docx-widget";const n=g.get(xt)===!0;t.innerHTML=`
        <button id="vnpt-toggle-btn" title="Mở/Đóng UI Hợp đồng" class="${n?"btn-opened":"btn-closed"}">${n?"✖":"📄"}</button>

        <div id="vnpt-export-panel" style="display: ${n?"flex":"none"};">
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
                    <button class="vnpt-btn-action btn-scan-pdf" id="vnpt-btn-scan-pdf" title="Scan file PDF bằng AI để tự động điền">📄 PDF</button>
                    <button class="vnpt-btn-action btn-scan-raw" id="vnpt-btn-scan-raw" title="Dán text thô để AI tự phân loại">📄 RAW</button>
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-scan" title="Lấy data theo biểu mẫu web">Quét dữ liệu</button>
                    <button class="vnpt-btn-action btn-fill-back" id="vnpt-btn-fill-back" title="Điền dữ liệu ngược lên web">Điền web</button>
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-toggle-id" title="Ẩn hiện key">ID</button>
                    <input type="file" id="vnpt-pdf-input" accept=".pdf" style="display:none;" />
                </div>
                <div class="header-right">
                    <button class="vnpt-btn-icon btn-add" id="vnpt-btn-add" title="Chèn thêm trường trống">✚</button>
                    <button class="vnpt-btn-icon btn-clean" id="vnpt-btn-batch-del" title="Xóa chọn / Xóa tất cả">🗑</button>
                    <div class="vnpt-restore-dropdown" style="position: relative; display: flex;">
                        <button class="vnpt-btn-icon btn-restore" id="vnpt-btn-restore-last" title="Khôi phục bản gần nhất">⏪</button>
                        <div id="vnpt-backup-history" class="vnpt-backup-history"></div>
                    </div>
                    
                    <div class="vnpt-util-dropdown">
                        <button class="vnpt-btn-icon btn-more" id="vnpt-btn-more" title="Thêm công cụ">⚙️</button>
                        <div class="vnpt-util-menu" id="vnpt-util-menu">
                            <div class="util-config-grid">
                                <div class="util-column">
                                    <div class="util-submenu-title">Cấu hình hệ thống</div>
                                    <button class="util-item" id="vnpt-btn-clean-data">🧹 Clean Data (Về mặc định)</button>
                                    <button class="util-item" id="vnpt-btn-default">🛠 Dữ liệu mặc định VNPT</button>
                                    <button class="util-item danger" id="vnpt-btn-reset-default" style="display: none;">🔄 Khôi phục dữ liệu gốc</button>

                                    <div class="util-separator"></div>
                                    <div class="util-submenu-title">Dữ liệu hệ thống</div>
                                    <div class="util-action-row">
                                        <button class="util-item-small" id="vnpt-btn-import-json">📥 Nhập JSON</button>
                                        <button class="util-item-small" id="vnpt-btn-export-json">📤 Xuất JSON</button>
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
                            <div class="util-submenu-title">Cấu hình AI OCR (Gemini)</div>
                            <div class="cw-row-map">
                                <span>API Key</span>
                                <input id="vnpt-gemini-key" type="password" placeholder="AIzaSy..." title="Lấy mã Key từ Google AI Studio" class="cw-map-input">
                            </div>
                            <div class="cw-row-map">
                                <span>Mô hình</span>
                                <select id="vnpt-gemini-model" class="cw-map-input">
                                    <optgroup label="Khuyên dùng (Ổn định & Miễn phí)">
                                        <option value="gemini-2.5-pro">Gemini 1.5 Flash (Nhanh & Ổn định)</option>
                                        <option value="gemini-2.5-flash">Gemini 2.0 Flash (Mới nhất)</option>
                                    </optgroup>
                                    <optgroup label="Cao cấp & Thử nghiệm">
                                        <option value="gemini-3.1-pro-preview">Gemini 1.5 Pro (Thông minh nhất)</option>
                                        <option value="gemini-2.5-flash">Gemini 2.0 Flash-Lite</option>
                                        <option value="gemini-2.5-flash-lite">Gemini 2.0 Pro Exp</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div class="cw-row-map" style="margin-top: 4px; justify-content: flex-end;">
                                <button class="util-item-small" id="vnpt-btn-test-gemini" style="width: auto; padding: 4px 12px; background: var(--vnpt-primary-light); color: var(--vnpt-primary); border-color: var(--vnpt-primary);">⚡ Kiểm tra kết nối</button>
                            </div>

                            <div class="util-separator"></div>
                            <div class="util-submenu-title">Liên kết ô (Mapping Calc)</div>
                            <div class="cw-row-map"><span>Trước thuế</span><input id="vnpt-map-before" name="vnpt-map-before" data-clink="before" class="cw-map-input"></div>
                            <div class="cw-row-map"><span>Tiền thuế</span><input id="vnpt-map-tax" name="vnpt-map-tax" data-clink="tax" class="cw-map-input"></div>
                            <div class="cw-row-map"><span>Sau thuế</span><input id="vnpt-map-after" name="vnpt-map-after" data-clink="after" class="cw-map-input"></div>
                            <div class="cw-row-map"><span>Bằng chữ</span><input id="vnpt-map-text" name="vnpt-map-text" data-clink="text" class="cw-map-input"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Inline Calculator Container -->
            <div id="vnpt-inline-calc"></div>

            <div id="vnpt-panel-body">
                <!-- Raw Scan Area (Hidden by default) -->
                <div id="vnpt-raw-scan-section" class="vnpt-raw-scan-section" style="display: none;">
                    <textarea id="vnpt-raw-scan-input" placeholder="Dán nội dung văn bản thô vào đây... AI sẽ tự động phân loại thông tin vào bảng."></textarea>
                    <div class="raw-scan-actions">
                        <button id="vnpt-btn-raw-process" class="vnpt-btn-confirm">✨ Phân loại dữ liệu</button>
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
    `,document.body.appendChild(t),d.widget=t,d.panel=document.getElementById("vnpt-export-panel"),d.toggleBtn=document.getElementById("vnpt-toggle-btn"),d.header=document.getElementById("vnpt-panel-header"),d.bannerArea=document.getElementById("vnpt-banner-area"),d.fieldsContainer=document.getElementById("vnpt-fields-list");try{const u=g.get(yt);u&&u.width&&u.height&&(d.panel.style.width=u.width+"px",d.panel.style.height=u.height+"px")}catch(u){console.error("Lỗi load size panel:",u)}new ResizeObserver(u=>{if(d.panel.style.display!=="none")for(let f of u){const{width:v,height:b}=f.contentRect;v>0&&b>0&&g.setDebounced(yt,{width:Math.round(v+20),height:Math.round(b+20)},1e3)}}).observe(d.panel),d.panelBody=document.getElementById("vnpt-panel-body"),Q(document.getElementById("vnpt-template-manager"),(u,f)=>{d.templateBuffer=u,d.templateName=f}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const u=this.files&&this.files[0];if(!u)return;const f=document.getElementById("vnpt-template-manager");Ne(u,f,(v,b)=>{d.templateBuffer=v,d.templateName=b}),this.value=""}),d.toggleBtn.addEventListener("click",u=>{d.hasDragged||(d.panel.style.display==="none"?(d.panel.style.display="flex",d.toggleBtn.className="btn-opened",d.toggleBtn.innerHTML="✖",g.set(xt,!0)):(d.panel.style.display="none",d.toggleBtn.className="btn-closed",d.toggleBtn.innerHTML="📄",g.set(xt,!1)))});const e=document.getElementById("vnpt-btn-more"),a=document.getElementById("vnpt-util-menu"),i={S:{width:"380px",height:"420px"},M:{width:"460px",height:"600px"},L:{width:"620px",height:"800px"},Full:{width:"98vw",height:"92vh"}},l=g.get(R)||{};a.querySelectorAll("input[data-clink]").forEach(u=>{const f=u.dataset.clink,v=l[f]||Ht[f]||[];u.value=v.join(", "),u.onchange=()=>{const b=g.get(R)||{};b[f]=u.value.split(",").map(E=>E.trim()).filter(E=>E),g.set(R,b)}});const c=document.getElementById("vnpt-gemini-key"),s=document.getElementById("vnpt-gemini-model");c&&s&&Promise.resolve().then(()=>we).then(({SK_GEMINI_KEY:u,SK_GEMINI_MODEL:f})=>{c.value=g.get(u)||"",s.value=g.get(f)||"gemini-2.0-flash",c.onchange=()=>{g.set(u,c.value.trim())},s.onchange=()=>{g.set(f,s.value)};const v=document.getElementById("vnpt-btn-test-gemini");v&&(v.onclick=async()=>{const b=c.value.trim(),E=s.value;if(!b){w("⚠️ Vui lòng nhập API Key trước khi thử","#ffc107");return}v.disabled=!0,v.textContent="⏳ Đang thử...";try{await tn(b,E),w("✅ Kết nối tới Gemini thành công!","#1e8e3e")}catch(L){w("❌ Kết nối thất bại: "+L,"#ea4335")}finally{v.disabled=!1,v.textContent="⚡ Kiểm tra kết nối"}})}),document.getElementById("vnpt-btn-export-json").onclick=()=>ae();const p=document.getElementById("vnpt-txt-toggle"),r=document.getElementById("vnpt-txt-body");p&&r&&p.addEventListener("click",u=>{u.stopPropagation();const f=r.style.display==="none";r.style.display=f?"":"none",p.textContent=f?"▲":"▶"});const m=document.getElementById("vnpt-btn-import-json"),x=document.getElementById("vnpt-file-import-json");m.onclick=()=>x.click(),x.onchange=async u=>{u.target.files.length>0&&await ie(u.target.files[0])&&setTimeout(()=>location.reload(),1500)},e.addEventListener("click",u=>{u.stopPropagation();const f=a.classList.toggle("show");e.classList.toggle("active",f)}),a.addEventListener("click",u=>{u.stopPropagation()}),document.addEventListener("click",u=>{a.classList.contains("show")&&(a.classList.remove("show"),e.classList.remove("active"))}),a.querySelectorAll(".size-options button").forEach(u=>{u.addEventListener("click",f=>{const v=f.target.getAttribute("data-size"),b=i[v];b&&(d.panel.style.width=b.width,d.panel.style.height=b.height),a.classList.remove("show"),e.classList.remove("active")})});function y(){const u=document.getElementById("vnpt-hotkey-list");if(!u)return;const f=g.get(dt,Kt);u.innerHTML="",Object.entries(f).forEach(([v,b])=>{const E=document.createElement("div");E.className="vnpt-hotkey-row",E.innerHTML=`
                <span class="vnpt-hotkey-label">${b.label||v}</span>
                <button class="vnpt-hotkey-btn" data-action="${v}">${Rt(b)}</button>
            `;const L=E.querySelector(".vnpt-hotkey-btn");L.onclick=G=>{G.stopPropagation(),!L.classList.contains("recording")&&(L.classList.add("recording"),L.textContent="Bấm phím...",Qe(v,I=>{L.classList.remove("recording"),L.textContent=Rt(I)}))},u.appendChild(E)})}y(),d.panel.querySelectorAll(".vnpt-resizer").forEach(u=>{u.addEventListener("mousedown",f=>{f.preventDefault(),f.stopPropagation();const v=f.clientX,b=f.clientY,E=d.panel.offsetWidth,L=d.panel.offsetHeight,G=d.widget.getBoundingClientRect(),I=G.top;window.innerWidth-G.right,d.panel.classList.add("vnpt-resizing"),document.body.classList.add("vnpt-resizing-global");const k=window.getComputedStyle(u).cursor;document.body.style.cursor=k;const A=C=>{const N=C.clientX-v,H=C.clientY-b;if(u.classList.contains("br"))d.panel.style.width=Math.max(360,E+N)+"px",d.panel.style.height=Math.max(250,L+H)+"px";else if(u.classList.contains("bl")){const D=E-N;D>360&&(d.panel.style.width=D+"px"),d.panel.style.height=Math.max(250,L+H)+"px"}else if(u.classList.contains("tr")){d.panel.style.width=Math.max(360,E+N)+"px";const D=L-H;D>250&&(d.panel.style.height=D+"px",d.widget.style.top=I+H+"px")}else if(u.classList.contains("tl")){const D=E-N,tt=L-H;D>360&&(d.panel.style.width=D+"px"),tt>250&&(d.panel.style.height=tt+"px",d.widget.style.top=I+H+"px")}},q=()=>{window.removeEventListener("mousemove",A),window.removeEventListener("mouseup",q),d.panel.classList.remove("vnpt-resizing"),document.body.classList.remove("vnpt-resizing-global"),document.body.style.cursor="";const C=d.widget.id==="vnpt-docx-widget";g.setDebounced(vt,{right:C?d.widget.style.right:void 0,top:d.widget.style.top,x:C?void 0:parseFloat(d.widget.style.left),y:parseFloat(d.widget.style.top)},500),g.setDebounced(yt,{width:d.panel.offsetWidth,height:d.panel.offsetHeight},500)};window.addEventListener("mousemove",A),window.addEventListener("mouseup",q)})})}function pe(t,n,o,e=null,a=null){let i=!1,l=0,c=0,s=0,p=0,r=!1;const m=5;function x(h){r!==h&&(r=h,a&&a(h))}function y(h){if(h.button!==0||["INPUT","BUTTON","SELECT","TEXTAREA"].includes(h.target.tagName)||h.target.isContentEditable)return;i=!0,d.hasDragged=!1,s=h.clientX,p=h.clientY;const f=t.getBoundingClientRect();l=h.clientX-f.left,c=h.clientY-f.top,document.body.style.userSelect="none",n&&n.forEach(v=>v.style.cursor="grabbing"),e&&e(),h.preventDefault()}return n.forEach(h=>{h.addEventListener("mousedown",y)}),document.addEventListener("mousemove",function(h){if(!i)return;if(!d.hasDragged)if(Math.sqrt(Math.pow(h.clientX-s,2)+Math.pow(h.clientY-p,2))>m)d.hasDragged=!0;else return;let u=h.clientX-l,f=h.clientY-c;const v=window.innerWidth,b=window.innerHeight,E=document.getElementById("vnpt-toggle-btn"),L=E?E.offsetWidth:40,G=E?E.offsetHeight:40,I=t.id==="vnpt-docx-widget";let k=t.offsetWidth||0;if(I){let C=L+6-k,N=v-k+6;u<C&&(u=C),u>N&&(u=N)}else k=k||200,u<0&&(u=0),u+k>v&&(u=Math.max(0,v-k));let A=r;if(I?A=!1:r?h.clientY<b-40&&(A=!1):h.clientY>b-10&&(A=!0),f<0&&(f=0),A)x(!0),t.style.top=b-t.offsetHeight+"px",I?(t.style.right=v-u-k+"px",t.style.left="auto"):(t.style.left=u+"px",t.style.right="auto"),t.style.bottom="auto";else{x(!1);let q=t.offsetHeight||40,C;if(I)C=10+G;else{const N=t.querySelector(".cw-title-bar");C=N?N.offsetHeight:q}f+C>b&&(f=Math.max(0,b-C)),t.style.top=f+"px",I?(t.style.right=v-u-k+"px",t.style.left="auto"):(t.style.left=u+"px",t.style.right="auto"),t.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(i){if(i=!1,document.body.style.userSelect="",n&&n.forEach(h=>h.style.cursor="grab"),o){const h=t.id==="vnpt-docx-widget";g.set(o,{left:h?void 0:t.style.left,right:h?t.style.right:void 0,top:t.style.top,x:h?void 0:parseFloat(t.style.left),y:parseFloat(t.style.top),docked:r})}setTimeout(()=>{d.hasDragged=!1},100)}}),{isDocked:()=>r,setDocked:x}}function nn(){d.widget&&d.header&&(pe(d.widget,[d.header],vt),window.addEventListener("resize",()=>{const t=window.innerWidth,n=window.innerHeight,o=document.getElementById("vnpt-toggle-btn"),e=o?o.offsetWidth:40,a=o?o.offsetHeight:40;let i=d.widget.getBoundingClientRect(),l=i.left,c=i.top,s=d.widget.offsetWidth||0,r=e+6-s,m=t-s+6;l<r&&(l=r),l>m&&(l=m),c+10+a>n&&(c=Math.max(0,n-(10+a))),d.widget.style.right=t-l-s+"px",d.widget.style.top=c+"px"}))}function ue(t){const n=t.toLowerCase(),{ngay:o,thang:e,nam:a}=Yt(),i=`${o}/${e}/${a}`;return{"ngayky, ngayky1":o,ngayky:o,"thangky, thangky1":e,thangky:e,"namky, namky1":a,namky:a,"ngaytiepnhan, ngaythangnamky":i,ngaytiepnhan:i,ngaythangnamky:i,soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[n]||""}function on(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){if(d.isDefaultMode){Object.keys(O).forEach(n=>{S(n,O[n],T[n]||"")}),B(),w("Đã nạp lại dữ liệu mặc định từ hệ thống.");return}let t=0;Object.keys(T).forEach(n=>{var l;const o=T[n],e=n.split(",")[0].trim(),a=nt(e,o);let i="";a&&(i=a.tagName.toLowerCase()==="select"?((l=a.options[a.selectedIndex])==null?void 0:l.text)||"":a.value,t++),i||(i=ue(n)),i&&typeof i=="string"&&(["sdt"].includes(e)?i=Me(i):["ngaySinhCustomer","ngayCapCustomer","ngayCapSoDkdnCustomer","ngayKy","ngayTiepNhan"].includes(e)&&(i=_e(i))),S(n,i,null)}),B(),t>0?(this.style.background="#1e8e3e",this.style.color="#fff",this.innerText="Đã quét xong",setTimeout(()=>{this.style.background="",this.style.color="",this.innerText="Quét dữ liệu"},1e3)):w("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(t){if(!(t.target.closest("#vnpt-docx-widget")||t.target.closest("#vnpt-inline-calc"))&&t.target&&t.target.id){const n=Object.keys(T).find(o=>o.split(",").map(e=>e.trim()).includes(t.target.id));n!==void 0&&(S(n,t.target.value,null),B())}}),document.addEventListener("change",function(t){var n;if(!(t.target.closest("#vnpt-docx-widget")||t.target.closest("#vnpt-inline-calc"))&&t.target&&t.target.id){const o=Object.keys(T).find(e=>e.split(",").map(a=>a.trim()).includes(t.target.id));if(o!==void 0){let e=t.target.tagName.toLowerCase()==="select"?((n=t.target.options[t.target.selectedIndex])==null?void 0:n.text)||"":t.target.value;S(o,e,null),B()}}})}const an={local:{download(t,n="arraybuffer"){return new Promise((o,e)=>{const a=new FileReader;switch(a.onload=i=>{let l=i.target.result;n==="base64"&&typeof l=="string"&&(l=l.split(",")[1]||l),o(l)},a.onerror=i=>e(i),n.toLowerCase()){case"arraybuffer":a.readAsArrayBuffer(t);break;case"base64":case"dataurl":a.readAsDataURL(t);break;case"text":a.readAsText(t);break;default:e(new Error(`Unsupported read type: ${n}`))}})},async upload(t){return this.download(t,"base64")}}},rn={getAdapter(t){const n=an[t];if(!n)throw new Error(`Storage adapter not found: ${t}`);return n},async upload(t,n,o={}){return await this.getAdapter(t).upload(n,o)},async download(t,n,o={}){return await this.getAdapter(t).download(n,o.type||"arraybuffer")}};function fe(t,n,o){try{let e;try{e=new window.PizZip(t)}catch(s){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(s);return}const a=new window.docxtemplater(e,{paragraphLoop:!0,linebreaks:!0});a.render(n);const i=a.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",compression:"DEFLATE",compressionOptions:{level:9}}),l=URL.createObjectURL(i),c=document.createElement("a");c.href=l,c.download=o,document.body.appendChild(c),c.click(),setTimeout(()=>{document.body.removeChild(c),URL.revokeObjectURL(l)},100)}catch(e){let a=e.message;e.properties&&e.properties.errors instanceof Array?a=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+e.properties.errors.map(l=>"- "+(l.properties.explanation||l.message)).join(`
`):a="Lỗi phần mềm Word sinh ra: "+a,alert(a),console.error("DocX Error:",e)}}function ln(t,n){const o=t.replace(/@(\w+)/g,(e,a)=>n[a]!==void 0?n[a]:e);navigator.clipboard.writeText(o).then(()=>{alert("✅ Đã sao chép nội dung vào Clipboard!")}).catch(e=>{console.error("Lỗi khi copy:",e),alert("❌ Lỗi khi sao chép vào Clipboard. Vui lòng thử lại!")})}function sn(){const t=document.getElementById("vnpt-export-filename");t&&t.addEventListener("input",()=>{t.dataset.userEdited="1",t.value.trim()||(t.dataset.userEdited="0")});function n(){if(!t||t.dataset.userEdited==="1")return;let a="";if(d.fieldsContainer&&d.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(r=>{const x=r.querySelector(".f-key").value.trim().split(",")[0].trim(),y=r.querySelector(".f-val").value.trim();x==="tenToChuc"&&(a=y)}),!a){const p=document.getElementById("tenToChuc");p&&(a=p.tagName.toLowerCase()==="textarea"||p.tagName.toLowerCase()==="input"?p.value.trim():p.innerText.trim())}function i(p){if(!p)return"";let r=p;return r=r.replace(/Tổng công ty/gi,""),r=r.replace(/Công ty/gi,""),r=r.replace(/\bCty\b/gi,""),r=r.replace(/Trách nhiệm hữu hạn/gi,""),r=r.replace(/\bTNHH\b/gi,""),r=r.replace(/Cổ phần/gi,""),r=r.replace(/\bCP\b/gi,""),r=r.replace(/Một thành viên/gi,""),r=r.replace(/\bMTV\b/gi,""),r=r.replace(/Chi nhánh/gi,""),r=r.replace(/Việt Nam/gi,"VN"),r=r.replace(/Viet Nam/gi,"VN"),r=r.replace(/\s+/g," ").trim(),r=r.replace(/^[-,\s]+|[-,\s]+$/g,""),r.length>50&&(r=r.substring(0,47)+"..."),r.replace(/[<>:"/\\|?*]/g,"")}let l=i(a),c=d.templateName?d.templateName.replace(/\.docx$/i,""):"",s=[];c&&s.push(c),l&&s.push(l),s.length>0?t.value=s.join(" - ")+".docx":t.value||(t.value="Export_Auto.docx")}setInterval(n,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const a={};if(d.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(p=>{const m=p.querySelector(".f-key").value.trim().split(",")[0].trim(),x=p.querySelector(".f-val").value;m&&(a[m]=x)}),Object.keys(a).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}const l=[];if(rt.forEach(p=>{if(!a[p]||!a[p].trim()){const r=T[p]||p;l.push(r)}}),l.length>0){const p=`Cảnh báo: Bạn còn các trường sau chưa điền dữ liệu:

- ${l.join(`
- `)}

Bạn có chắc chắn muốn tiếp tục xuất file không?`;if(!confirm(p))return}let c=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(c.toLowerCase().endsWith(".docx")||(c+=".docx"),d.templateBuffer){fe(d.templateBuffer,a,c);return}const s=document.getElementById("vnpt-template-file");if(s.files&&s.files.length>0){rn.download("local",s.files[0],{type:"arraybuffer"}).then(p=>fe(p,a,c)).catch(p=>alert(`Lỗi đọc file: ${p.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')});const o=document.getElementById("vnpt-btn-export-txt"),e=document.getElementById("vnpt-txt-template");if(e){const a=g.get(Bt);a&&(e.value=a),e.addEventListener("input",()=>{g.setDebounced(Bt,e.value,800)})}o&&o.addEventListener("click",()=>{const a=e?e.value:"";if(!a.trim()){alert(`Bạn chưa nhập nội dung Text Template!

Sử dụng @key làm placeholder, ví dụ: Tôi là @tenDaiDienn`);return}const i={};if(d.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(c=>{const p=c.querySelector(".f-key").value.trim().split(",")[0].trim(),r=c.querySelector(".f-val").value;p&&(i[p]=r)}),Object.keys(i).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}ln(a,i)})}const cn=["chucVu","noiCap","noiCapSoDkdn","ngayky","ngayky1","thangky","namky","thangky1","namky1","noiKy"],dn=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function pn(){function t(){cn.forEach(e=>{const a=document.getElementById(e);a&&!a.dataset.filled&&(a.dataset.filled="1",gt(a,ue(e)))}),dn.forEach(e=>{const a=document.getElementById(e.src),i=document.getElementById(e.target);a&&i&&!a.dataset.bound&&(a.dataset.bound="1",a.addEventListener("change",()=>gt(i,a.value)))})}let n;new MutationObserver(e=>{e.some(i=>i.addedNodes.length>0?Array.from(i.addedNodes).some(c=>c.nodeType!==1?!1:["INPUT","TEXTAREA","SELECT"].includes(c.tagName)?!0:c.querySelector&&c.querySelector("input, textarea, select")):!1)&&(clearTimeout(n),n=setTimeout(t,200))}).observe(document.body,{childList:!0,subtree:!0}),t()}const un=()=>{let t="";for(const[n,o]of Object.entries(T)){const e=n.split(",")[0].trim();rt.includes(e)&&(t+=`"${e}": "${o}",
`)}return`Bạn là một trợ lý ảo chuyên nghiệp trong việc trích xuất dữ liệu từ hợp đồng VNPT.
Nhiệm vụ của bạn là đọc nội dung của HỢP ĐỒNG ĐIỆN TỬ / PHỤ LỤC / BIÊN BẢN (dưới dạng văn bản/ảnh PDF).
Tìm và trích xuất các thông tin thuộc về BÊN A (KHÁCH HÀNG / BÊN THUÊ). Bỏ qua dữ liệu của Bên B (VNPT).

Hãy trả về DUY NHẤT một chuỗi JSON thuần tuý (không được bọc trong blockquote markdown \`\`\`json).
Ví dụ Cấu trúc JSON bắt buộc phải trả về:
{
${t}  "ngayKy": "Ngày tháng năm ký hợp đồng (nếu có)"
}

Lưu ý quan trọng:
- Nếu trường nào đó không có/không tìm thấy, hãy xuất ra chuỗi rỗng "".
- Với trường cmnd: Lấy số Căn cước công dân hoặc CMND mới nhất.
- Với ngày tháng: Quy đổi về định dạng dd/MM/yyyy.
- Các trường MST (Mã số thuế / GPKD) điền vào key "soDkdn".
`};function fn(t,n,o="gemini-2.0-flash"){return de({apiKey:n,model:o,systemInstruction:un(),userText:"Đọc file hợp đồng này và trích xuất thành JSON.",fileData:{mimeType:"application/pdf",base64:t}})}function gn(t){return new Promise((n,o)=>{const e=new FileReader;e.onload=()=>{const a=e.result.split(",")[1];n(a)},e.onerror=a=>o(a),e.readAsDataURL(t)})}function ge(){let t=document.getElementById("vnpt-pdf-loader");t||(t=document.createElement("div"),t.id="vnpt-pdf-loader",t.className="vnpt-pdf-overlay",t.innerHTML=`
            <div class="vnpt-pdf-loading-box">
                <div class="loader-spinner"></div>
                <div style="margin-top: 15px; font-weight: 800; font-size: 13px; color: #1a73e8;">Đang nhờ AI đọc Hợp đồng...</div>
                <div style="margin-top: 4px; font-size: 11px; color: #5f6368;">Tùy thuộc độ lớn file, thường mất 5 - 10s...</div>
            </div>
        `,document.body.appendChild(t)),t.style.display="flex"}function Lt(){const t=document.getElementById("vnpt-pdf-loader");t&&(t.style.display="none")}function he(t,n){let o=document.getElementById("vnpt-pdf-dialog");o&&o.remove(),o=document.createElement("div"),o.id="vnpt-pdf-dialog",o.className="vnpt-pdf-overlay";const e=t.map((s,p)=>`
        <tr class="pdf-row-auto">
            <td style="text-align: center;">
                <input type="checkbox" class="pdf-row-chk" data-index="${p}" checked />
            </td>
            <td><strong>${s.key}</strong></td>
            <td><div style="max-height: 40px; overflow-y: auto; color: #1a73e8; font-weight: 600;">${s.value}</div></td>
        </tr>
    `).join("");o.innerHTML=`
        <div class="vnpt-pdf-dialog-box">
            <div class="pdf-dlg-header">
                <h3>🔍 KẾT QUẢ ĐỌC TỪ GEMINI AI</h3>
            </div>
            <div class="pdf-dlg-body">
                <table class="pdf-result-table">
                    <thead>
                        <tr>
                            <th width="40"><input type="checkbox" id="pdf-check-all" checked title="Chọn tất cả"></th>
                            <th width="120">ID Trường</th>
                            <th>Nội dung được AI chiết xuất</th>
                        </tr>
                    </thead>
                    <tbody>${e}</tbody>
                </table>
            </div>
            <div class="vnpt-pdf-actions">
                <div style="flex:1; font-size:11px; color:#5f6368; align-self:flex-end;">Gợi ý: Căn lề AI có thể lệch, hãy check lại cẩn thận.</div>
                <button class="pdf-btn-cancel" id="pdf-btn-cancel">✖ Hủy</button>
                <button class="pdf-btn-confirm" id="pdf-btn-confirm">✅ Đồng bộ bảng dữ liệu</button>
            </div>
        </div>
    `,document.body.appendChild(o);const a=o.querySelector("#pdf-btn-cancel"),i=o.querySelector("#pdf-btn-confirm"),l=o.querySelector("#pdf-check-all"),c=o.querySelectorAll(".pdf-row-chk");l.addEventListener("change",s=>{c.forEach(p=>p.checked=s.target.checked)}),a.onclick=()=>{o.remove()},i.onclick=()=>{const s=[];c.forEach(p=>{if(p.checked){const r=parseInt(p.getAttribute("data-index"));s.push(t[r])}}),o.remove(),n(s)}}function hn(){const t=document.getElementById("vnpt-btn-scan-pdf"),n=document.getElementById("vnpt-pdf-input");!t||!n||(t.addEventListener("click",o=>{if(o.preventDefault(),!g.get(Et)){navigator.clipboard.writeText("https://github.com/tranchien2000/vnpt-tampermonkey-vite/blob/main/docs/GEMINI_API_GUIDE.md").then(()=>{w("Đã copy link hướng dẫn cài đặt API Key vào bộ nhớ tạm","#f44336")}).catch(i=>{console.error("Không thể copy link:",i),alert("Công cụ chưa được cài đặt API Key!")});return}n.click()}),n.addEventListener("change",async o=>{const e=o.target.files[0];e&&(o.target.value="",await mn(e))}))}async function mn(t){const n=g.get(Et),o=g.get(At)||"gemini-2.5-flash";if(!n){confirm(`Chưa cài đặt Gemini API Key!

AI Scanner (PDF) yêu cầu cần có mã Google AI Studio cấp phát Miễn phí.

Nhấn 'OK' để xem hướng dẫn tự tạo mã Key nhé!`)&&window.open("https://github.com/tranchien2000/vnpt-tampermonkey-vite/blob/main/docs/GEMINI_API_GUIDE.md","_blank");return}try{ge();const e=await gn(t),a=await fn(e,n,o);Lt();const i=Object.keys(a).map(l=>({key:l,value:a[l],label:a[l]===""?"(Trống)":a[l]})).filter(l=>l.value!=="");if(i.length===0){alert("Rất tiếc! AI không tìm thấy trường thông tin nào thỏa mãn (Bên A).");return}he(i,l=>{l.forEach(c=>{S(c.key,c.value,`AI: ${c.key}`)}),B(),console.log(`✅ [OCR Pdf] Đã điền thành công ${l.length} trường.`)})}catch(e){Lt(),console.error("Lỗi PDF Scan Pipeline:",e);let a=e;typeof e=="string"&&(e.includes("Quota exceeded")||e.includes("limit: 0"))&&(a=`⚠️ Hết hạn mức hoặc Mô hình không khả dụng (Quota Exceeded)!

Mô hình bạn chọn có thể chưa hỗ trợ tại vùng của bạn hoặc bạn đã dùng hết lượt gọi miễn phí.

QUYẾT : Hãy mở menu ⚙️ (Thiết lập), đổi sang 'Gemini 1.5 Flash' hoặc 'Gemini 2.0 Flash' để tiếp tục.`),alert(`Lỗi xử lý quét File:
`+a)}}const bn=()=>{let t="";for(const[n,o]of Object.entries(T)){const e=n.split(",")[0].trim();rt.includes(e)&&(t+=`"${e}": "${o}",
`)}return`Bạn là một chuyên gia trích xuất dữ liệu từ văn bản thô (có thể là mẫu tin nhắn, email, ghi chú...). 
Nhiệm vụ của bạn là tìm thông tin của KHÁCH HÀNG (BÊN THUÊ/BÊN A) từ đoạn văn bản được cung cấp.

Hãy trả về DUY NHẤT một chuỗi JSON thuần tuý.
Cấu trúc JSON bắt buộc phải trả về:
{
${t}  "ngayKy": "Ngày tháng năm ký (nếu có)"
}

Lưu ý:
- Nếu thông tin không có, trả về chuỗi rỗng "".
- Chuẩn hóa ngày tháng về dd/MM/yyyy.
- Chuẩn hóa Số điện thoại (xóa khoảng cách, dấu chấm).
- Mọi MST/Số GCPKD đều cho vào key "soDkdn".
- Bỏ qua các dữ liệu rác không liên quan.`};async function vn(t,n,o="gemini-2.0-flash"){if(!t||!t.trim())throw new Error("Vui lòng nhập nội dung văn bản cần phân loại.");return de({apiKey:n,model:o,systemInstruction:bn(),userText:`Hãy phân loại thông tin từ đoạn văn bản sau đây: 

${t}`})}function yn(){const t=document.getElementById("vnpt-btn-scan-raw"),n=document.getElementById("vnpt-raw-scan-section"),o=document.getElementById("vnpt-btn-raw-process"),e=document.getElementById("vnpt-raw-scan-input");!t||!n||!o||!e||(t.addEventListener("click",a=>{a.preventDefault();const i=n.style.display==="none";n.style.display=i?"flex":"none",t.classList.toggle("active",i),i&&e.focus()}),o.addEventListener("click",async()=>{const a=e.value.trim();if(!a){w("⚠️ Vui lòng nhập nội dung văn bản!","#ffc107");return}const i=g.get(Et),l=g.get(At)||"gemini-2.0-flash";if(!i){w("⚠️ Chưa cài đặt API Key Gemini!","#f44336");return}try{ge();const c=await vn(a,i,l);Lt();const s=Object.keys(c).map(r=>({key:r,value:c[r],label:`AI: ${r}`})).filter(r=>r.value!==""&&r.value!==null);if(s.length===0){alert("AI không tìm thấy thông tin hợp lệ nào để phân loại.");return}he(s,r=>{r.forEach(m=>{S(m.key,m.value,m.label)}),B(),w(`✅ Đã nạp ${r.length} trường từ văn bản thô.`),n.style.display="none",t.classList.remove("active"),e.value=""});const p=document.querySelector("#vnpt-pdf-dialog h3");p&&(p.textContent="✨ PHÂN LOẠI DỮ LIỆU THÔ (AI)")}catch(c){Lt(),console.error("Raw Scan Error:",c),alert("Lỗi phân loại dữ liệu: "+c)}}))}function at(t,n=null){return g.get(t,n)}function Nt(t,n){g.set(t,n)}function me(t,n){if(!n||n.replace(/\D/g,"").length<6)return;let o=at(t,[]);o=o.filter(e=>e!==n),o.unshift(n),Nt(t,o.slice(0,10))}function Dt(t,n){const o=document.getElementById(n);o&&(o.innerHTML=at(t,[]).map(e=>`<option value="${e}">`).join(""))}function $t(t){return t.toLocaleString("en-US")}function Gt(t){return Number(String(t).replace(/[^\d]/g,""))||0}function xn(t){return t.charAt(0).toUpperCase()+t.slice(1)}const mt=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function wn(t){let n=Math.floor(t/100),o=Math.floor(t%100/10),e=t%10,a="";return n>0&&(a+=mt[n]+" trăm ",o===0&&e>0&&(a+="lẻ ")),o>1?(a+=mt[o]+" mươi ",e===1?a+="mốt":e===5?a+="lăm":e>0&&(a+=mt[e])):o===1?(a+="mười ",e===5?a+="lăm":e>0&&(a+=mt[e])):e>0&&(n>0&&(a+="lẻ "),a+=mt[e]),a.trim()}function kn(t){if(t===0)return"không";const n=["","nghìn","triệu","tỷ"];let o="",e=0;for(;t>0;){const a=t%1e3;a>0&&(o=wn(a)+" "+n[e]+" "+o),t=Math.floor(t/1e3),e++}return o.trim()}function be(t,n,o){let e=0,a=0,i=0;t==="before"?(e=Gt(n),a=Math.round(e*o),i=e+a):t==="tax"?(a=Gt(n),e=Math.round(a/o),i=e+a):t==="after"&&(i=Gt(n),e=Math.round(i/(1+o)),a=i-e);const l=xn(kn(i))+" đồng";return{beforeNum:e,taxNum:a,afterNum:i,beforeStr:$t(e),taxStr:$t(a),afterStr:$t(i),textStr:l}}function En(t,n){n.before&&n.before.forEach(o=>Z(o,t.beforeStr)),n.tax&&n.tax.forEach(o=>Z(o,t.taxStr)),n.after&&n.after.forEach(o=>Z(o,t.afterStr)),n.text&&n.text.forEach(o=>Z(o,t.textStr))}function It(t,n=null){try{const o=localStorage.getItem(t);return o!==null?JSON.parse(o):n}catch{return n}}function $(t,n){localStorage.setItem(t,JSON.stringify(n))}function Cn(t,n,o,e){let a=It(et)??"custom",i=It(F)??{...O},l=It(Y)??{},c=It(V)??{};const s=document.createElement("div");s.className="cw-tab-header";const p={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};p.custom.innerText="📋 Custom",p.custom.className="cw-tab cw-tab-custom",p.default.innerText="📌 Default",p.default.className="cw-tab cw-tab-default",p.sync.innerText="🔗 Sync",p.sync.className="cw-tab cw-tab-sync";function r(){Object.values(p).forEach(k=>k.classList.remove("active")),p[a].classList.add("active")}r();const m=document.createElement("div");m.style.display=e.data?"none":"block";const x=n("📋 Cấu hình Data","data",k=>{m.style.display=k?"none":"block",o(t)}),y=document.createElement("div");y.className="cw-data-body";function h(){y.innerHTML="";let k=a==="sync"?c:a==="custom"?l:i,A=a==="sync"?V:a==="custom"?Y:F;const q=Object.keys(k);q.length===0&&a!=="default"&&(y.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),q.forEach(C=>{const N=document.createElement("div");N.className="cw-data-row";let H=a!=="default";const D=k[C],tt=D&&typeof D=="object"&&D.hasOwnProperty("value"),ve=tt?D.value:D,Ut=tt&&D.label||C,K=document.createElement("input");K.type="text",K.value=Ut,K.id=`df-key-${C}`,K.name=`df-key-${C}`,K.className="cw-data-key"+(H?" mutable":""),K.title=C,K.readOnly=!H,H&&(K.onchange=()=>{const P=K.value.trim();if(!P||P===C){K.value=Ut;return}tt?k[P]={...D,label:P}:k[P]=ve,delete k[C],$(A,k),h()});const U=document.createElement("input");if(U.type="text",U.value=ve??"",U.id=`df-val-${C}`,U.name=`df-val-${C}`,U.className="cw-data-val",U.oninput=()=>{tt?k[C]={...D,value:U.value}:k[C]=U.value,$(A,k)},N.appendChild(K),N.appendChild(U),H){const P=document.createElement("button");P.innerHTML="✕",P.className="cw-del-btn",P.onclick=()=>{confirm(`Delete "${Ut}"?`)&&(delete k[C],$(A,k),h())},N.appendChild(P)}else N.appendChild(document.createElement("div")).className="cw-pad";y.appendChild(N)})}p.custom.onclick=()=>{a="custom",$(et,"custom"),r(),h()},p.default.onclick=()=>{a="default",$(et,"default"),r(),h()},p.sync.onclick=()=>{a="sync",$(et,"sync"),r(),h()};const u=document.createElement("button");u.innerText="📤",u.className="cw-icon-btn",u.title="Sao lưu toàn bộ dữ liệu ra JSON",u.onclick=()=>ae();const f=document.createElement("button");f.innerText="📥",f.className="cw-icon-btn",f.title="Khôi phục dữ liệu từ JSON";const v=document.createElement("input");v.type="file",v.accept=".json",v.style.display="none",v.onchange=async k=>{k.target.files.length>0&&await ie(k.target.files[0])&&setTimeout(()=>location.reload(),1500)},f.onclick=()=>v.click(),m.appendChild(s),s.appendChild(p.custom),s.appendChild(p.default),s.appendChild(p.sync),m.appendChild(y),t.appendChild(x),t.appendChild(m);const b=t.querySelector("#vnpt-cw-fill"),E=t.querySelector("#vnpt-cw-sync"),L=t.querySelector("#vnpt-cw-add"),G=t.querySelector("#vnpt-cw-reset");b&&(b.onclick=ee),E&&(E.onclick=$e),L&&(L.onclick=()=>{a==="default"&&(a="custom",$(et,"custom"),r());let k=a==="sync"?c:l,A="new_field_"+Date.now();k[A]="",$(a==="sync"?V:Y,k),h(),y.scrollTop=y.scrollHeight}),G&&(G.onclick=()=>{confirm("Reset Default Data?")&&(i={...O},$(F,i),h())}),h();const I=x.querySelector(".cw-right-wrap")||document.createElement("div");I.className="cw-right-wrap",I.prepend(u),I.prepend(f),I.appendChild(v),x.appendChild(I)}function Tn(t,n,o){let e=Number(localStorage.getItem(W))||Re,a=at(st)??{calc:!1,data:!0};function i(y,h){const u=document.createElement("button");return u.innerText=y,u.className="cw-action-btn "+h,u}function l(y,h,u){const f=document.createElement("div");f.className="wg-sec-header";const v=document.createElement("span");v.innerText=y;const b=document.createElement("button");return b.className="wg-toggle-btn",b.innerText=a[h]?"▾":"▴",f.appendChild(v),f.appendChild(b),b.onclick=()=>{a[h]=!a[h],b.innerText=a[h]?"▾":"▴",Nt(st,a),u(a[h])},f}function c(y){const h=window.innerWidth,u=window.innerHeight,f=y.getBoundingClientRect();y.style.left=Math.min(Math.max(parseFloat(y.style.left),0),h-f.width)+"px",y.style.top=Math.min(Math.max(parseFloat(y.style.top),0),u-36)+"px"}const s=document.createElement("div");if(!n){s.className="cw-title-bar",s.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const y=document.createElement("div");y.className="cw-btn-group";const h={fill:i("Fill","cw-btn-fill"),sync:i("Sync","cw-btn-sync"),add:i("Add","cw-btn-add"),reset:i("↺","cw-btn-reset")};h.reset.title="Reset Default fields",Object.values(h).forEach(u=>y.appendChild(u)),s.appendChild(y),t.appendChild(s)}const p=document.createElement("div");p.className="cw-body-inline",p.innerHTML=`
    <div class="cw-inline-row">
        <input id="wg-before" name="wg-before" class="cw-input-inline" placeholder="Trước thuế" list="wg-before-list" title="Trước thuế">
        <datalist id="wg-before-list"></datalist>
        <div class="cw-tax-group-inline"><input id="wg-taxRate" name="wg-taxRate" class="cw-tax-input-inline" title="Thuế (%)"><span class="cw-tax-symbol">%</span></div>
        <input id="wg-tax" name="wg-tax" class="cw-input-inline" placeholder="Tiền thuế" title="Tiền thuế">
        <input id="wg-after" name="wg-after" class="cw-input-inline" placeholder="Sau thuế" list="wg-after-list" title="Sau thuế">
        <datalist id="wg-after-list"></datalist>
        <input id="wg-text" name="wg-text" class="cw-input-inline cw-input-readonly-inline" placeholder="Bằng chữ" readonly title="Bằng chữ">
    </div>`,n?n.appendChild(p):t.appendChild(p),n||Cn(t,l,c,a);const r={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text")};r.taxRate.value=e*100,Dt(wt,"wg-before-list"),Dt(kt,"wg-after-list");function m(y,h){const u=be(y,h,e);return r.before.value=u.beforeStr,r.tax.value=u.taxStr,r.after.value=u.afterStr,r.text.value=u.textStr,u}function x(y,h){const u=be(y,h,e),f=at(R)||{...Ht};En(u,f)}if(r.taxRate.oninput=()=>{e=Number(r.taxRate.value)/100||0,Nt(W,e),m("before",r.before.value)},r.taxRate.onchange=()=>{x("before",r.before.value)},r.before.oninput=()=>{m("before",r.before.value)},r.before.onchange=()=>{x("before",r.before.value),me(wt,r.before.value),Dt(wt,"wg-before-list")},r.tax.oninput=()=>{m("tax",r.tax.value)},r.tax.onchange=()=>{x("tax",r.tax.value)},r.after.oninput=()=>{m("after",r.after.value)},r.after.onchange=()=>{x("after",r.after.value),me(kt,r.after.value),Dt(kt,"wg-after-list")},[r.before,r.tax,r.after,r.text].forEach(y=>{["click","focus"].forEach(h=>y.addEventListener(h,()=>{if(!y.value)return;navigator.clipboard.writeText(y.value);const u=y.style.backgroundColor;y.style.backgroundColor="#d1e7dd",setTimeout(()=>y.style.backgroundColor=u,300)}))}),!n){const y=Array.from(t.children).filter(f=>f!==s),h=pe(t,[s],o,null,f=>{y.forEach(v=>v.style.display=f?"none":""),s.style.borderRadius=f?"8px":"0",f&&(t.style.top=window.innerHeight-(s.offsetHeight||34)+"px")}),u=at(o);return u&&u.docked&&h.setDocked(!0),window.addEventListener("resize",()=>{h.isDocked()?t.style.top=window.innerHeight-s.offsetHeight+"px":c(t)}),h}return null}function Sn(){const t=document.getElementById("vnpt-inline-calc"),n=document.getElementById("vnpt-btn-calc-toggle");let o=d.calcWidget||document.createElement("div");if(!t&&!d.calcWidget?(o.id="vnpt-calc-widget",document.body.appendChild(o),d.calcWidget=o):t&&(o=d.widget),t&&n){let e=at(st)??{calc:!1,data:!0};const a=i=>{t.style.display=i?"none":"block",n.classList.toggle("active",!i)};a(e.calc),n.onclick=()=>{e.calc=!e.calc,Nt(st,e),a(e.calc)}}return Tn(o,t,Vt)}function Ln(){let t=!1;try{t=!1}catch{t=!1}t&&M.info("[Migration] Dev mode active - Syncing configurations...");let n=g.get(F);if(n){let e=!1;Object.keys(O).forEach(a=>{const i=O[a];if(!(a in n))n[a]=i,e=!0;else if(t){const l=n[a],c=i&&typeof i=="object",s=l&&typeof l=="object";let p=!1;!c&&!s?p=l!==i:c&&s?p=l.value!==i.value||l.label!==i.label:p=!0,p&&(n[a]=i,e=!0)}}),e&&g.set(F,n)}let o=g.get(_);if(o){let e=!1;Object.keys(O).forEach(a=>{const i=O[a],l=i&&typeof i=="object"?i.value:i,c=i&&typeof i=="object"?i.label:T[a]||"";if(!(a in o))o[a]={label:c,value:l,sync:""},e=!0;else if(t){const s=o[a];(s.value!==l||s.label!==c)&&(o[a]={label:c,value:l,sync:s.sync||""},e=!0)}}),e&&g.setDebounced(_,o,0)}}let bt=null;function qt(){if(!window.__vnptInited){window.__vnptInited=!0,M.info("Initializing VNPT Userscript..."),Ln();try{ye(),en(),Sn(),nn(),Xe(),St(),on(),sn(),pn(),hn(),yn(),Ue(),Ye();const t=te(()=>{He(),Xt(),M.debug("DOM Cache & Labels refreshed due to mutations")},1500);bt=new MutationObserver(n=>{n.some(e=>e.addedNodes.length>0||e.removedNodes.length>0?[...e.addedNodes,...e.removedNodes].some(i=>i.nodeType===1&&!["SCRIPT","STYLE","LINK"].includes(i.tagName)):!1)&&t()}),bt.observe(document.body,{childList:!0,subtree:!0}),M.info("Userscript initialized successfully.")}catch(t){M.error("Error during userscript initialization:",t)}}}function Nn(){M.info("Cleaning up VNPT Userscript for reload..."),bt&&(bt.disconnect(),bt=null);const t=document.getElementById("vnpt-docx-widget");t&&t.remove();const n=document.getElementById("vnpt-calc-widget");n&&n.remove();const o=document.getElementById("vnpt-styles");o&&o.remove(),window.__vnptInited=!1,M.info("Cleanup completed.")}window.__vnptCleanup=Nn,window.__vnptInit=qt,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",qt):qt()})();
