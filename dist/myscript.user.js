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
(function(){"use strict";const P={info:(...t)=>console.log("[Tampermonkey Script] INFO:",...t),error:(...t)=>console.error("[Tampermonkey Script] ERROR:",...t),warn:(...t)=>console.warn("[Tampermonkey Script] WARN:",...t)};function Le(){const t="vnpt-styles";if(document.getElementById(t))return;const n=document.createElement("style");n.id=t,n.textContent=`
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

        .vnpt-btn-confirm {
            padding: 8px 16px; background: var(--vnpt-primary); border: none; border-radius: 8px;
            color: #fff; font-weight: 700; cursor: pointer; transition: 0.2s;
        }
        .vnpt-btn-confirm:hover { background: var(--vnpt-primary-hover); box-shadow: 0 4px 12px rgba(26, 115, 232, 0.3); }

        .vnpt-raw-scan-section {
            padding: 8px; background: rgba(255, 255, 255, 0.4);
            border-bottom: 1px solid var(--vnpt-border);
            display: flex; flex-direction: row; gap: 8px;
            animation: slideDown 0.3s ease;
        }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

        #vnpt-raw-scan-input {
            flex: 1; min-width: 0; height: 100px; padding: 10px; border-radius: 12px;
            border: 1px solid #1f5bd2ff; background: rgba(255, 255, 255, 0.8);
            font-size: 11px; font-family: inherit; resize: vertical; line-height: 1.5;
            transition: all 0.2s;
        }
        #vnpt-raw-scan-input:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 3px var(--vnpt-primary-light); outline: none; }
        
        .raw-scan-actions { display: flex; flex-direction: column; justify-content: center; gap: 6px; flex-shrink: 0; }
        .raw-scan-actions .vnpt-btn-confirm { padding: 6px 12px; font-size: 11px; height: auto; width: 100%; white-space: normal; text-align: center; }
        .btn-local-process { background: var(--vnpt-success) !important; box-shadow: 0 4px 12px rgba(30, 142, 62, 0.2) !important; }
        .btn-local-process:hover { opacity: 0.9; transform: translateY(-1px); }

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

    `,document.head.appendChild(n)}const Ne={widget:null,panel:null,header:null,bannerArea:null,toggleBtn:null,fieldsContainer:null,panelBody:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1,templateBuffer:null,templateName:null,hasDragged:!1,isInspecting:!1},dt=new Map,p=new Proxy(Ne,{get(t,n){return n==="on"?(o,e)=>{dt.has(o)||dt.set(o,[]),dt.get(o).push(e)}:t[n]},set(t,n,o){const e=t[n];return t[n]=o,e!==o&&dt.has(n)&&dt.get(n).forEach(i=>i(o,e)),!0}}),T={"tenDaiDienn, tenNguoiNhanCTS ":"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH","diaChi, duong, tinhId, tinhIdNew, quanHuyenId, xaPhuongId, phuongXaId":"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT","emailDaiDien, emailNhanCTS":"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Mã số thuế | GPKD",noiCapSoDkdn:"Nơi cấp ĐKDN/QĐTL/GPTL",goiDV:"Gói Dịch Vụ","ngayKy, ngayKy1":"Ngày ký","thangKy, thangKy1":"Tháng Ký","namKy, namKy1":"Năm ký","ngayTiepNhan, ngayThangNamKy":"Ngày tiếp nhận / Ngày tháng năm ký","soHopDong, inputContractGroupName":"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký","lienheHopDongA, lienheTuVanA, lienheHoaDonA, sucoCap1A, sucoCap2A, sucoCap3A, sucoCap4A":"Liên hệ A"},pt=["soHopDong","tenDaiDienn","cmnd","sdt","diaChi","tenToChuc","ngayCapCustomer","emailDaiDien","soDkdn","goiDV","soHopDong"],K="vnpt_docx_fields",O="vnpt_docx_default_fields",kt="vnpt_docx_position",Ct="vnpt_docx_size",Et="vnpt_docx_opened",ut="vnpt_docx_auto_backup",V="vnpt_autofill_data_default",tt="vnpt_autofill_data_custom",X="vnpt_autofill_data_sync",Qt="vnpt_widget_pos",at="vnd_tax_rate",Tt="vnd_before_history",St="vnd_after_history",ft="vnpt_widget_collapsed",Y="vnd_calc_map",rt="vnpt_widget_datatab",gt="vnpt_templates",Pt="vnpt_txt_template",Lt="vnpt_gemini_api_key",Kt="vnpt_gemini_model",ht="vnpt_hotkeys",Ie=Object.freeze(Object.defineProperty({__proto__:null,DEFAULT_LABELS:T,LOCAL_KEY_AUTO_BACKUP:ut,LOCAL_KEY_DEFAULT_FIELDS:O,LOCAL_KEY_FIELDS:K,LOCAL_KEY_OPENED:Et,LOCAL_KEY_POS:kt,LOCAL_KEY_SIZE:Ct,REQUIRED_KEYS:pt,SK_CALC_MAP:Y,SK_COLLAPSE:ft,SK_DATATAB:rt,SK_DATA_CUS:tt,SK_DATA_DEF:V,SK_DATA_SYNC:X,SK_GEMINI_KEY:Lt,SK_GEMINI_MODEL:Kt,SK_HIST_A:St,SK_HIST_B:Tt,SK_HOTKEYS:ht,SK_POS_CALC:Qt,SK_TAX:at,SK_TEMPLATES:gt,SK_TXT_TEMPLATE:Pt},Symbol.toStringTag,{value:"Module"}));let J=null;function w(t,n="#198754",o=2500){J||(J=document.createElement("div"),J.id="vnpt-toast-container",Object.assign(J.style,{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column-reverse",alignItems:"center",gap:"8px",zIndex:"1000000",pointerEvents:"none"}),document.body.appendChild(J));const e=document.createElement("div");e.innerText=t,Object.assign(e.style,{background:n,color:"#fff",padding:"8px 18px",borderRadius:"24px",opacity:"0",transform:"translateY(10px)",transition:"opacity 0.3s, transform 0.3s",fontSize:"13px",fontWeight:"500",fontFamily:"'Segoe UI', Roboto, sans-serif",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",whiteSpace:"nowrap",pointerEvents:"auto"}),J.appendChild(e),requestAnimationFrame(()=>{e.style.opacity="1",e.style.transform="translateY(0)"}),setTimeout(()=>{e.style.opacity="0",e.style.transform="translateY(-10px)",setTimeout(()=>{e.remove(),J&&J.childNodes.length},300)},o)}const De="vnpt_templates_db",Q="buffers";let Nt=null;function $t(){return Nt?Promise.resolve(Nt):new Promise((t,n)=>{const o=indexedDB.open(De,1);o.onupgradeneeded=e=>{const i=e.target.result;i.objectStoreNames.contains(Q)||i.createObjectStore(Q)},o.onsuccess=e=>{Nt=e.target.result,t(Nt)},o.onerror=()=>n(o.error)})}async function Ae(t,n){const o=await $t();return new Promise((e,i)=>{const r=o.transaction(Q,"readwrite").objectStore(Q).put(n,t);r.onsuccess=()=>e(),r.onerror=()=>i(r.error)})}async function Be(t){const n=await $t();return new Promise((o,e)=>{const s=n.transaction(Q,"readonly").objectStore(Q).get(t);s.onsuccess=()=>o(s.result),s.onerror=()=>e(s.error)})}async function Me(t){const n=await $t();return new Promise((o,e)=>{const s=n.transaction(Q,"readwrite").objectStore(Q).delete(t);s.onsuccess=()=>o(),s.onerror=()=>e(s.error)})}const et=new Map,It=new Map,h={isGM:typeof GM_setValue<"u"&&typeof GM_getValue<"u",get(t,n=null){if(et.has(t))return et.get(t);try{let o;if(this.isGM?o=GM_getValue(t,null):o=localStorage.getItem(t),o==null)return n;const e=typeof o=="string"?JSON.parse(o):o;return et.set(t,e),e}catch(o){return console.warn(`[Storage] Không thể đọc key "${t}":`,o),n}},set(t,n){et.set(t,n);try{return this.isGM?GM_setValue(t,n):localStorage.setItem(t,JSON.stringify(n)),!0}catch(o){return console.error(`[Storage] Không thể ghi key "${t}":`,o),!1}},setDebounced(t,n,o=500){et.set(t,n),It.has(t)&&clearTimeout(It.get(t));const e=setTimeout(()=>{this.set(t,n),It.delete(t)},o);It.set(t,e)},remove(t){et.delete(t);try{this.isGM?GM_deleteValue(t):localStorage.removeItem(t)}catch(n){console.error(`[Storage] Không thể xóa key "${t}":`,n)}},clearCache(){et.clear()}};function mt(){try{const t=h.get(gt)||[],n=t.filter(o=>o.type!=="local");return n.length!==t.length&&bt(n),n}catch{return[]}}function bt(t){h.set(gt,t)}function _e(t){const n=t.match(/drive\.google\.com\/file\/d\/([^/]+)/);return n?`https://drive.google.com/uc?export=download&id=${n[1]}`:t}function He(t){return new Promise((n,o)=>{GM_xmlhttpRequest({method:"GET",url:_e(t),responseType:"arraybuffer",onload:e=>{if(e.status>=200&&e.status<300){if(e.response&&e.response.byteLength>4){const i=new Uint8Array(e.response.slice(0,4));if(i[0]===80&&i[1]===75&&i[2]===3&&i[3]===4){n(e.response);return}else{o(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}n(e.response)}else o(new Error(`HTTP ${e.status}: Không lấy được file`))},onerror:()=>o(new Error("Không thể tải URL.")),ontimeout:()=>o(new Error("Timeout khi tải URL."))})})}async function Oe(t,n,o){const e=t.name.replace(/\.docx$/i,""),i=prompt("Đặt tên biến nhớ cho file này:",e);if(!(!i||!i.trim()))try{const a=await t.arrayBuffer();await Ae(i.trim(),a);const r=mt().filter(c=>c.name!==i.trim()&&c.fileName!==t.name);r.unshift({name:i.trim(),type:"local_idb",fileName:t.name,lastUsed:Date.now()}),bt(r),nt(n,o),o&&o(a,i.trim())}catch(a){w(`❌ Lỗi lưu file: ${a.message}`,"#dc3545")}}function nt(t,n,o=null){let e=t.querySelector(".vnpt-template-manager-inner"),i,a;if(e)i=e.querySelector(".vnpt-local-list-container"),a=e.querySelector(".vnpt-btn-wrap");else{t.innerHTML="",e=document.createElement("div"),e.className="vnpt-template-manager-inner";const c=document.createElement("div");c.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const d=document.createElement("span");d.className="vnpt-title-main",d.style.cssText="font-size:11px;font-weight:700;color:#444;",a=document.createElement("div"),a.className="vnpt-btn-wrap",a.style.cssText="display:flex;gap:4px;",c.appendChild(d),c.appendChild(a),e.appendChild(c),i=document.createElement("div"),i.className="vnpt-local-list-container",i.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",e.appendChild(i),t.appendChild(e)}const s=mt(),r=e.querySelector(".vnpt-title-main");r.innerHTML="Templates"+(o?` <span style="color:#2e7d32;">(Đang dùng: ${o})</span>`:""),s.length===0?i.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':i.innerHTML="",s.forEach((c,d)=>{const l=document.createElement("div");l.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",l.title=c.fileName||c.url||c.name,l.tabIndex=0,l.onfocus=()=>l.style.boxShadow="0 0 0 2px #28a745",l.onblur=()=>l.style.boxShadow="none";const g=c.type==="local"||c.type==="local_base64"||c.type==="local_idb"?"OFF":"ON",x=g==="OFF"?"#6c757d":"#28a745",y=document.createElement("span");y.textContent=g,y.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${x};color:#fff;`;const f=document.createElement("span");f.textContent=c.name,f.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",l.onclick=()=>{l.focus(),Pe(c,n,o,t)},l.appendChild(y),l.appendChild(f);const m=document.createElement("button");m.innerHTML="✎",m.title="Đổi tên template",m.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",m.onclick=b=>{b.stopPropagation();const v=prompt("Đổi tên template:",c.name);if(v&&v.trim()&&v.trim()!==c.name){const C=mt();C[d].name=v.trim(),bt(C),nt(t,n,o)}},l.appendChild(m);const u=document.createElement("button");u.innerHTML="✕",u.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",u.onclick=async b=>{if(b.stopPropagation(),confirm(`Xoá biểu mẫu "${c.name}"?`)){const v=mt();v.splice(d,1),bt(v),c.type==="local_idb"&&await Me(c.name).catch(()=>null),nt(t,n,o===c.name?null:o)}},l.appendChild(u),i.appendChild(l)})}function Pe(t,n,o,e){const i=mt(),a=i.find(s=>s.name===t.name&&(s.url===t.url||s.type===t.type));if(a&&(a.lastUsed=Date.now(),bt(i)),t.type==="local_idb"){Be(t.name).then(s=>{if(!s)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");n&&n(s,t.name),nt(e,n,t.name)}).catch(s=>{w(`❌ Lỗi nạp File IDB: ${s.message}`,"#dc3545")});return}if(t.type==="local_base64"&&t.data){try{const s=window.atob(t.data.split(",")[1]),r=s.length,c=new Uint8Array(r);for(let d=0;d<r;d++)c[d]=s.charCodeAt(d);n&&n(c.buffer,t.name),nt(e,n,t.name)}catch(s){w(`❌ Lỗi nạp Base64: ${s.message}`,"#dc3545")}return}He(t.url).then(s=>{n&&n(s,t.name),nt(e,n,t.name)}).catch(s=>{w(`❌ ${s.message}`,"#dc3545")})}function Ke(t,n){if(t.length===0)return n.length;if(n.length===0)return t.length;const o=[];for(let e=0;e<=n.length;e++)o[e]=[e];for(let e=0;e<=t.length;e++)o[0][e]=e;for(let e=1;e<=n.length;e++)for(let i=1;i<=t.length;i++)n.charAt(e-1)===t.charAt(i-1)?o[e][i]=o[e-1][i-1]:o[e][i]=Math.min(o[e-1][i-1]+1,o[e][i-1]+1,o[e-1][i]+1);return o[n.length][t.length]}function $e(t,n){let o=t,e=n;t.length<n.length&&(o=n,e=t);const i=o.length;return i===0?1:(i-Ke(o,e))/parseFloat(i)}function Fe(t,n,o=.7){let e=null,i=-1;const a=t.toLowerCase().trim();for(const s of n){const r=s.toLowerCase().trim(),c=$e(a,r);c>i&&c>=o&&(i=c,e=s)}return e}function ze(t){if(!t)return"";let n=t.replace(/\D/g,"");return n.startsWith("84")&&(n="0"+n.slice(2)),n}function Re(t){if(!t)return"";const n=t.split(/[-/]/);if(n.length===3){let o,e,i;return n[0].length===4?[i,e,o]=n:[o,e,i]=n,`${o.padStart(2,"0")}/${e.padStart(2,"0")}/${i}`}return t}let D={byId:new Map,byName:new Map,byPlaceholder:new Map,byLabel:new Map,allInputs:[]},Dt=[];function Zt(){D.byId.clear(),D.byName.clear(),D.byPlaceholder.clear(),D.byLabel.clear(),D.allInputs=[]}function te(){return Dt=Array.from(document.querySelectorAll("label, .label, .label-text, span.title, .form-label")),Dt}function ee(){const t=performance.now();Zt();const n=Array.from(document.querySelectorAll("input, textarea, select, ng-select2"));D.allInputs=n,n.forEach(i=>{i.id&&D.byId.set(i.id,i),i.name&&D.byName.set(i.name,i);const a=i.getAttribute("placeholder");a&&D.byPlaceholder.set(a.trim(),i);const s=i.getAttribute("formcontrolname");s&&D.byName.set(s,i)});const o=te();o.forEach(i=>{const a=i.innerText.trim();if(!a)return;let s=null;if(i.htmlFor&&(s=document.getElementById(i.htmlFor)),!s){let r=i.parentElement,c=0;for(;r&&c<2&&(s=r.querySelector("input, textarea, select"),!s);)r=r.parentElement,c++}s&&D.byLabel.set(a,s)});const e=performance.now();console.debug(`[DOM] Build map in ${(e-t).toFixed(2)}ms for ${n.length} inputs and ${o.length} labels.`)}function qe(t){t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}))}function st(t,n){var i;const o=t.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,e=(i=Object.getOwnPropertyDescriptor(o,"value"))==null?void 0:i.set;e?e.call(t,n):t.value=n,qe(t)}function Z(t,n=null){if(!t&&!n)return null;if(t){let e=D.byId.get(t)||D.byName.get(t)||D.byPlaceholder.get(t);if(e&&document.contains(e))return e}if(n){let e=D.byLabel.get(n);if(e&&document.contains(e))return e}if(t){const e=document.getElementById(t);if(e&&["INPUT","TEXTAREA","SELECT"].includes(e.tagName))return e;const i=`input[id="${t}"], textarea[id="${t}"], select[id="${t}"], input[name="${t}"], textarea[name="${t}"], [placeholder="${t}"]`,a=document.querySelector(i);if(a)return a}const o=n||t;if(o&&o.length>2){const e=Array.from(D.byLabel.keys());e.length===0&&Dt.length>0&&e.push(...Dt.map(a=>a.innerText.trim()).filter(a=>a.length>0));const i=Fe(o,e,.82);if(i)return D.byLabel.get(i)||null}return null}function Ft(t){return Z(null,t)}function it(t,n,o=null){const e=Z(t,o);e&&st(e,n)}function Ve(t=new Date){return String(t.getDate()).padStart(2,"0")}function Ge(t=new Date){return String(t.getMonth()+1).padStart(2,"0")}function Ue(t=new Date){return String(t.getFullYear())}function ne(){const t=new Date;return{ngay:Ve(t),thang:Ge(t),nam:Ue(t)}}const{ngay:ie,thang:oe,nam:ae}=ne(),F={"ngayKy, ngayKy1":{label:"Ngày ký",value:ie},"thangKy, thangKy1":{label:"Tháng ký",value:oe},"namKy, namKy1":{label:"Năm ký",value:ae},"ngayTiepNhan, ngayThangNamKy":{label:"Ngày ký (full)",value:`${ie}/${oe}/${ae}`},tenDoanhNghiepB:{label:"Tên doanh nghiệp B",value:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM"},diaChiB:{label:"Địa chỉ B",value:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội"},maSoThueB:{label:"Mã số thuế B",value:"0100686223"},stkB:{label:"Số tài khoản B",value:"1600114156"},diaChiStkB:{label:"Ngân hàng/Địa chỉ STK B",value:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)"},"tenB, nguoiDaiDienB, tenDaiDienB":{label:"Người đại diện B",value:"Phạm Khánh Chung"},"chucVuB, chucVuDaiDienB":{label:"Chức vụ B",value:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp"},"giayUyQuyenSoB, soGiayUyQuyenB":{label:"Giấy ủy quyền số B",value:"2628/GUQ-VNPT-HNI-VP"},"giayUyQuyenNgayB, ngayGiayUyQuyenB":{label:"Giấy ủy quyền ngày B",value:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},GiayUyQuyenB:{label:"Giấy ủy quyền B (full)",value:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},tenDoanhNghiepB1:{label:"Tên doanh nghiệp B (phụ)",value:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},donViTiepNhan:{label:"Đơn vị tiếp nhận",value:"TTKD KHDN"},"tenTiepNhan, tenNguoiNhan":{label:"Người tiếp nhận",value:"Bùi Anh"},dienThoaiB:{label:"Điện thoại B",value:"02436686868"},diaChiTaiKhoanB:{label:"Địa chỉ tài khoản B",value:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 "},noiKy:{label:"Nơi ký",value:"Hà Nội"},emailB:{label:"Email B",value:""},"lienheHopDongB, lienheTuVanB, lienheHoaDonB, sucoCap1B, sucoCap2B, sucoCap3B, sucoCap4B":{label:"Liên hệ B (AM)",value:"AM Bùi Anh"}},re={soHopDong:"soHopDong, inputContractGroupName"},zt={after:["cuocDV","tongCong","tongCongHD","congCA","giaTriHopDong","tongGIaTriHopDong"],before:["donGiaCA","thanhTienCA","tongThanhTien","tongCuocTruocThue"],tax:["tongThueGTGT","tongThue","thueCA","thueVAT"],text:["soTienThanhToanBangChu","tongCongBangChu","tongCongHDbangChu","ghiChuGiaTriHopDong","tongGiaTriHopDongBangChu"]},je=.08,Rt={SCAN:{key:"s",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Quét dữ liệu"},FILL:{key:"f",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Điền Web"},SCAN_PDF:{key:"p",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Scan PDF (AI)"},TOGGLE:{key:"w",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Đóng/Mở Widget"},CLEAN:{key:"d",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Dọn dẹp & Reset"}};function se(t,n){let o;return function(...i){const a=()=>{clearTimeout(o),t(...i)};clearTimeout(o),o=setTimeout(a,n)}}function le(){const t=h.get(V)??{...F},n=h.get(tt)??{},o={...t,...n};Object.keys(o).forEach(e=>{const i=o[e],a=i&&typeof i=="object"&&i.hasOwnProperty("value")?i.value:i;e.split(",").map(r=>r.trim()).filter(r=>r).forEach(r=>{let c=Z(r)||Ft(r);c&&st(c,a)})}),w("✅ Auto fill complete")}function We(){let t=h.get(X)??{};const n={...re,...t},o=Object.keys(n);if(o.length===0){w("⚠️ No sync mapping","#ffc107");return}o.forEach(e=>{let i=Z(e)||Ft(e);i&&i.value!==void 0&&i.value!==""&&n[e].split(",").map(s=>s.trim()).filter(s=>s).forEach(s=>it(s,i.value))}),w("✅ Sync form complete","#d39e00")}let qt=!1;const ce=new Map,Xe=(t,n)=>{var c;if(qt)return;let o=h.get(X)??{};const e={...re,...o};if(Object.keys(e).length===0)return;let i=t.id,a=t.name,s=null;if(i){const d=document.querySelector(`label[for="${i}"]`);d&&(s=d.textContent.trim())}if(!s){const d=t.closest("label");d&&(s=(c=Array.from(d.childNodes).find(l=>l.nodeType===3))==null?void 0:c.textContent.trim())}let r=e[i]||e[a]||e[s];if(r){qt=!0;try{r.split(",").map(l=>l.trim()).filter(l=>l).forEach(l=>{if(l!==i&&l!==a&&l!==s){let g=ce.get(l);(!g||!document.contains(g))&&(g=Z(l)||Ft(l),g&&ce.set(l,g)),g&&document.activeElement!==g&&st(g,n)}})}finally{qt=!1}}},Ye=se((t,n)=>{Xe(t,n)},250);function Je(){document.addEventListener("input",t=>{const n=t.target;!n||!["INPUT","TEXTAREA"].includes(n.tagName)||n.closest("#vnpt-docx-widget")||n.closest("#vnpt-inline-calc")||Ye(n,n.value)})}const Qe={async lookupMST(t){if(!t||t.length<10)return null;const n=`https://api.vietqr.io/v2/business/${t}`;try{const e=await(await fetch(n)).json();if(e.code==="00"&&e.data){const{name:i,address:a,representative:s,status:r}=e.data;return{name:i||"",address:a||"",representative:s||"",status:r||""}}return null}catch(o){return console.error("[MST Service] Error fetching MST:",o),null}}};function de(t){if(!t)return t;const n={};return Object.keys(t).forEach(o=>{const e=t[o];o.split(",").map(a=>a.trim()).filter(a=>a).forEach(a=>{n[a]=e})}),n}function Vt(t=""){const n={version:"1.0",timestamp:new Date().toISOString(),backup:{fields:h.get(K),defaultFields:h.get(O),dataDefault:de(h.get(V)),dataCustom:de(h.get(tt)),dataSync:h.get(X),taxRate:h.get(at),calcMap:h.get(Y),templates:h.get(gt)}},o=new Blob([JSON.stringify(n,null,2)],{type:"application/json"}),e=URL.createObjectURL(o),i=document.createElement("a");i.href=e;let a=t;a?a.toLowerCase().endsWith(".json")||(a+=".json"):a=`vnpt_full_backup_${new Date().toLocaleDateString().replace(/\//g,"-")}.json`,i.download=a,i.click(),URL.revokeObjectURL(e),w(`✅ Đã xuất file: ${a}`)}async function pe(t){return new Promise(n=>{const o=new FileReader;o.onload=e=>{try{const i=JSON.parse(e.target.result);if(!i.backup)throw new Error("File không đúng định dạng backup.");const a=i.backup;a.fields&&h.set(K,a.fields),a.defaultFields&&h.set(O,a.defaultFields),a.dataDefault&&h.set(V,a.dataDefault),a.dataCustom&&h.set(tt,a.dataCustom),a.dataSync&&h.set(X,a.dataSync),a.taxRate&&h.set(at,a.taxRate),a.calcMap&&h.set(Y,a.calcMap),a.templates&&h.set(gt,a.templates),w("✅ Đã nhập dữ liệu thành công! Vui lòng tải lại trang hoặc widget.","#1e8e3e"),n(!0)}catch{w("❌ Lỗi: File sao lưu không hợp lệ.","#ff5252"),n(!1)}},o.readAsText(t)})}function ot(t=""){let n=h.get(ut);Array.isArray(n)||(n=[]);const o={id:Date.now().toString(),name:t||`Bản sao lưu ${new Date().toLocaleString()}`,timestamp:new Date().toISOString(),data:{fields:h.get(K),defaultFields:h.get(O)}};n.unshift(o);const e=n.slice(0,15);h.set(ut,e),console.log(`✅ Field backup created: ${o.name}`)}function At(){var e,i;const t=h.get(K)||{},n=((e=t.tenDaiDienn)==null?void 0:e.value)||"",o=((i=t.soHopDong)==null?void 0:i.value)||"";return!n&&!o?`Quét dữ liệu - ${new Date().toLocaleTimeString()}`:`${n} - ${o}`}function ue(){const t=h.get(ut);return t&&!Array.isArray(t)?(h.remove(ut),[]):Array.isArray(t)?t:[]}function Ze(t){const o=ue().find(i=>i.id===t);if(!o||!o.data)return w("⚠️ Không tìm thấy bản sao lưu hợp lệ!","#ffc107"),!1;const e=o.data;return e.fields&&h.set(K,e.fields),e.defaultFields&&h.set(O,e.defaultFields),w(`✅ Đã khôi phục các trường: ${o.name}`,"#1e8e3e"),!0}function L(t,n,o=null,e=""){const i=p.fieldsContainer.querySelector(".text-hint");i&&i.remove();const a=p.fieldsContainer.querySelectorAll(".f-key");let s=!1;const r=t.split(",")[0].trim();for(let c of a)if(c.value.split(",")[0].trim()===r){const l=c.closest(".vnpt-field-row"),g=l.querySelector(".f-val"),x=l.querySelector(".f-label");n!==""&&g.value!==n&&document.activeElement!==g&&(g.value=n),o!==null&&o!==""&&x.value!==o&&document.activeElement!==x&&(x.value=o),e!==""&&c.value!==t+", "+e&&document.activeElement!==c&&(c.value=t+", "+e),s=!0;break}if(!s){(o===null||o==="")&&(o=T[t]||"");const c=document.createElement("div");c.className="vnpt-field-row row-item",c.setAttribute("draggable","false");let d=t;e&&(d+=", "+e);const l=r;c.innerHTML=`
            <input type="checkbox" id="chk-${l}" name="chk-${l}" class="row-chk" title="Chọn" style="margin: 0 2px 0 2px;" />
            <input type="text" id="lbl-${l}" name="lbl-${l}" class="f-label" value="${o}" />
            <input type="text" id="key-${l}" name="key-${l}" class="f-key" value="${d}" title="Biến DOCX và IDs đồng bộ" />
            <span class="row-drag-handle" title="Kéo">=</span>
            ${l==="soDkdn"?`
                <div class="mst-lookup-wrapper">
                    <input type="text" id="val-${l}" name="val-${l}" class="f-val" value="${n}" placeholder="Mã số thuế..." />
                    <button class="btn-mst-lookup" title="Tra cứu Mã số thuế">
                        <span class="icon">🔍</span>
                        <div class="spinner"></div>
                    </button>
                </div>
            `:`
                <input type="text" id="val-${l}" name="val-${l}" class="f-val" value="${n}" />
            `}
        `;const g=c.querySelector(".f-val"),x=c.querySelector(".f-key");t==="tenToChuc"&&(g.style.textAlign="right");const y=()=>{pt.includes(r)&&(g.value.trim()?g.classList.remove("field-required-empty"):g.classList.add("field-required-empty"))},f=()=>{const u=g.value;x.value.split(",").map(v=>v.trim()).filter(v=>v).forEach(v=>it(v,u))};if(x.addEventListener("input",function(){B();const u=this.value.split(",")[0].trim();g.style.textAlign=u==="tenToChuc"?"right":""}),x.addEventListener("change",function(){f()}),c.querySelector(".f-label").addEventListener("input",B),g.addEventListener("input",function(){B(),y()}),g.addEventListener("change",function(){f()}),l==="soDkdn"){const u=c.querySelector(".btn-mst-lookup");u.onclick=async()=>{const b=g.value.trim();if(!b){w("⚠️ Vui lòng nhập mã số thuế","#ffc107");return}u.classList.add("loading");try{const v=await Qe.lookupMST(b);v?(g.value=b,L("tenToChuc",v.name),L("diaChi",v.address),v.representative&&L("tenDaiDienn",v.representative),B(),setTimeout(()=>fe(),300),w(`✅ Đã tìm thấy: ${v.name}`,"#1a73e8")):w("❌ Không tìm thấy thông tin MST này","#ea4335")}catch{w("❌ Lỗi khi tra cứu MST","#ea4335")}finally{u.classList.remove("loading")}}}y();const m=c.querySelector(".row-drag-handle");m.addEventListener("mouseenter",()=>c.setAttribute("draggable","true")),m.addEventListener("mouseleave",()=>{c.classList.contains("dragging")||c.setAttribute("draggable","false")}),c.addEventListener("dragstart",function(u){p.draggedRowForVNPT=this,u.dataTransfer.effectAllowed="move",u.dataTransfer.setData("text/plain",t),this.classList.add("dragging")}),c.addEventListener("dragover",u=>(u.preventDefault(),!1)),c.addEventListener("dragenter",function(){this.classList.add("over")}),c.addEventListener("dragleave",function(){this.classList.remove("over")}),c.addEventListener("drop",function(u){if(u.stopPropagation(),p.draggedRowForVNPT&&p.draggedRowForVNPT!==this){const b=Array.from(p.fieldsContainer.querySelectorAll(".vnpt-field-row")),v=b.indexOf(p.draggedRowForVNPT),C=b.indexOf(this);v<C?this.parentNode.insertBefore(p.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(p.draggedRowForVNPT,this),B()}return!1}),c.addEventListener("dragend",function(){this.setAttribute("draggable","false"),p.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(u=>{u.classList.remove("over","dragging")}),p.draggedRowForVNPT=null}),p.fieldsContainer.appendChild(c),p.fieldsContainer.scrollTop=p.fieldsContainer.scrollHeight}}function B(){const t=p.isDefaultMode?O:K,n={};p.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(e=>{const a=e.querySelector(".f-key").value.trim().split(",").map(l=>l.trim()).filter(l=>l),s=a[0],r=a.slice(1).join(", "),c=e.querySelector(".f-label").value.trim(),d=e.querySelector(".f-val").value;s&&(n[s]={label:c,value:d,sync:r})}),h.setDebounced(t,n,1e3)}function Gt(){var e,i;const t=h.get(p.isDefaultMode?O:K)||{},n=((e=t.tenDaiDienn)==null?void 0:e.value)||"",o=((i=t.soHopDong)==null?void 0:i.value)||"";return!n&&!o?`Bản sao lưu ${new Date().toLocaleString()}`:`${n} - ${o}`}function tn(){var i,a;const t=h.get(p.isDefaultMode?O:K)||{},n=((i=t.soHopDong)==null?void 0:i.value)||"",o=((a=t.tenToChuc)==null?void 0:a.value)||"";if(!n&&!o)return`Backup_VNPT_${new Date().toLocaleDateString().replace(/\//g,"-")}`;const e=[];return n&&e.push(n),o&&e.push(o),e.join(" - ").replace(/[\\/:"*?<>|]/g,"_")}function Bt(){try{p.fieldsContainer.innerHTML="";const n=h.get(K)||{};Object.keys(T).forEach(o=>{const e=T[o],i=n[o];i&&typeof i=="object"?L(o,i.value,i.label||e,i.sync||""):i?L(o,i,e,""):L(o,"",e,"")}),Object.keys(n).forEach(o=>{if(!(o in T)){const e=n[o];typeof e=="object"?L(o,e.value,e.label,e.sync||""):L(o,e,"","")}}),Object.keys(T).length===0&&Object.keys(n).length===0&&(p.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(n){console.error("Error loading config:",n),Object.keys(T).forEach(o=>L(o,"",T[o]))}const t=h.get(kt);t&&p.widget&&(p.widget.style.bottom="auto",t.right?(p.widget.style.right=t.right,p.widget.style.left="auto"):t.left&&(p.widget.style.left=t.left,p.widget.style.right="auto"),t.top&&(p.widget.style.top=t.top))}function en(){document.getElementById("vnpt-btn-toggle-id").onclick=()=>p.fieldsContainer.classList.toggle("show-ids");const t=document.getElementById("vnpt-btn-clean-data");t&&(t.onclick=()=>{const i=p.isDefaultMode;confirm(i?`BẠN ĐANG Ở CHẾ ĐỘ MẶC ĐỊNH.
Khôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?`:"Dữ liệu hiện tại sẽ được Xóa. Bạn có muốn SAO LƯU nhanh trước khi làm sạch không?")&&(i?(h.remove(O),w("🔄 Đã reset dữ liệu hệ thống VNPT","#1a73e8")):(ot(Gt()),h.remove(K),w("🧹 Đã làm sạch dữ liệu cá nhân","#1a73e8")),h.remove(Y),h.remove(at),document.querySelectorAll("input[data-clink]").forEach(s=>{const r=s.dataset.clink;s.value=(zt[r]||[]).join(", ")}),i?ge(!0):Bt())});const n=document.getElementById("vnpt-btn-restore-last"),o=document.getElementById("vnpt-backup-history");n&&o?(P.info("🔄 Restore button found and bound successfully."),n.onclick=i=>{i.preventDefault(),i.stopPropagation(),o.classList.toggle("show")&&(e(o),P.debug("✨ Backup history displayed."))},document.addEventListener("click",i=>{o.classList.contains("show")&&!o.contains(i.target)&&!n.contains(i.target)&&o.classList.remove("show")})):P.error("❌ Fix UI: Could not find Restore button (#vnpt-btn-restore-last) or History container (#vnpt-backup-history).");function e(i){const a=ue();if(P.debug("📋 Rendering backups count:",a.length),i.innerHTML="",a.length===0){i.innerHTML='<div class="backup-history-empty">Chưa có bản sao lưu nào. Hãy thử Clean Data để tạo bản mới!</div>';return}a.forEach(s=>{const r=document.createElement("div");r.className="backup-history-item";const c=new Date(s.id*1).toLocaleString();r.innerHTML=`
                <div class="backup-history-name" title="${s.name}">${s.name}</div>
                <div class="backup-history-time">${c}</div>
            `,r.onclick=d=>{var l;d.stopPropagation(),confirm(`Bạn có chắc muốn khôi phục dữ liệu từ bản: 
${s.name}?`)&&Ze(s.id)&&(i.classList.remove("show"),p.isDefaultMode?(l=document.getElementById("vnpt-btn-default"))==null||l.click():Bt())},i.appendChild(r)})}document.getElementById("vnpt-btn-default").onclick=()=>{p.isDefaultMode=!p.isDefaultMode},p.on("isDefaultMode",i=>ge(i)),document.getElementById("vnpt-btn-batch-del").onclick=i=>{const a=p.fieldsContainer.querySelectorAll(".vnpt-field-row"),s=i.shiftKey;let r=0;if(a.forEach(c=>{var d;if((d=c.querySelector(".row-chk"))!=null&&d.checked){if(s)c.remove();else{const l=c.querySelector(".f-val");l&&(l.value="")}r++}}),r===0){const c=tn();s?confirm(`Xóa TOÀN BỘ hàng dữ liệu?

(Hệ thống sẽ tự động lưu một bản nội bộ để có thể khôi phục).`)&&(ot(Gt()),a.forEach(d=>d.remove()),w("🗑️ Đã xóa toàn bộ hàng","#ff5252"),B()):confirm(`Dọn dẹp TOÀN BỘ giá trị và Xuất JSON dự phòng?

File: "${c}.json"

(Hệ thống vẫn tự động lưu một bản nội bộ).`)&&(Vt(c),ot(Gt()),a.forEach(d=>{const l=d.querySelector(".f-val");l&&(l.value="")}),w("🧹 Đã lưu JSON & Dọn dẹp giá trị","#1a73e8"),B())}else w(`${s?"🗑️":"🧹"} Đã ${s?"Xóa":"Dọn giá trị"} ${r} trường`,s?"#ff5252":"#1a73e8"),B()},document.getElementById("vnpt-btn-add").onclick=()=>{const i=p.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;L("bien_moi_"+i,"","",""),B()},document.getElementById("vnpt-btn-fill-back").onclick=()=>{fe()}}function fe(){le();let t=0;p.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(n=>{const o=n.querySelector(".f-key").value.trim(),e=n.querySelector(".f-val").value;o.split(",").map(i=>i.trim()).filter(Boolean).forEach(i=>{(document.getElementById(i)||document.getElementsByName(i)[0])&&(it(i,e),t++)})}),t>0?w(`✅ Đã đồng bộ ${t} trường lên web`,"#198754"):w("⚠️ Không có trường nào để đồng bộ","#ffc107")}function ge(t){const n=document.getElementById("vnpt-btn-default");if(p.fieldsContainer.innerHTML="",p.bannerArea.innerHTML="",t){n.classList.add("active"),n.innerHTML="✅ Chế độ: Dữ liệu mặc định",document.getElementById("vnpt-fields-container").classList.add("vnpt-mode-default"),w("📌 Chế độ Dữ liệu mặc định (Có thể sửa)","#ea4335");const o=document.createElement("div");o.className="vnpt-default-banner",o.innerHTML='<span style="color: red;"> LƯU Ý: ĐÂY LÀ DỮ LIỆU MẶC ĐỊNH</span>',p.bannerArea.appendChild(o);const e=h.get(O);e===null?Object.keys(F).forEach(i=>{const a=F[i],s=a&&typeof a=="object"?a.value:a,r=a&&typeof a=="object"?a.label:T[i]||"";L(i,s,r)}):Object.keys(e).forEach(i=>{const a=e[i];L(i,a.value,a.label,a.sync||"")})}else n.classList.remove("active"),n.innerHTML="🛠 Dữ liệu mặc định VNPT",document.getElementById("vnpt-fields-container").classList.remove("vnpt-mode-default"),w("📋 Đã quay lại Dữ liệu cá nhân"),Bt()}let Ut=!1,lt=null,vt=null;function nn(){window.addEventListener("keydown",t=>{if(Ut&&vt){sn(t);return}const n=h.get(ht,Rt);for(const[o,e]of Object.entries(n))if(on(t,e)){t.preventDefault(),an(o);return}})}function on(t,n){if(!n||!n.key)return!1;const o=t.key.toLowerCase()===n.key.toLowerCase(),e=!!t.altKey==!!n.altKey,i=!!t.ctrlKey==!!n.ctrlKey,a=!!t.shiftKey==!!n.shiftKey;return o&&e&&i&&a}function an(t){var n,o,e,i,a,s,r;switch(t){case"SCAN":(n=document.getElementById("vnpt-btn-scan"))==null||n.click();break;case"FILL":(o=document.getElementById("vnpt-btn-fill-back"))==null||o.click();break;case"SCAN_PDF":(e=document.getElementById("vnpt-btn-scan-pdf"))==null||e.click();break;case"EXPORT_DOCX":(i=document.getElementById("vnpt-btn-export"))==null||i.click();break;case"COPY_TXT":(a=document.getElementById("vnpt-btn-export-txt"))==null||a.click();break;case"TOGGLE":(s=document.getElementById("vnpt-toggle-btn"))==null||s.click();break;case"CLEAN":(r=document.getElementById("vnpt-btn-clean-data"))==null||r.click();break}}function rn(t,n){Ut=!0,lt=t,vt=n,w("Vui lòng nhấn tổ hợp phím mong muốn...","info")}function sn(t){var i;if(["Alt","Control","Shift","Meta"].includes(t.key))return;t.preventDefault(),t.stopPropagation();const n={key:t.key.toLowerCase(),altKey:t.altKey,ctrlKey:t.ctrlKey,shiftKey:t.shiftKey},o=h.get(ht,Rt);o[lt]={...o[lt],...n},h.set(ht,o);const e=((i=o[lt])==null?void 0:i.label)||lt;w(`Đã lưu phím tắt cho ${e}: ${jt(n)}`,"success"),vt&&vt(n),Ut=!1,lt=null,vt=null}function jt(t){if(!t||!t.key)return"Chưa gán";const n=[];t.ctrlKey&&n.push("Ctrl"),t.altKey&&n.push("Alt"),t.shiftKey&&n.push("Shift");let o=t.key.toUpperCase();return o===" "&&(o="Space"),n.push(o),n.join(" + ")}async function he({apiKey:t,model:n,systemInstruction:o,userText:e,fileData:i}){return new Promise((a,s)=>{if(!t)return s("Vui lòng nhập API Key Gemini trong Cài đặt.");const r=`https://generativelanguage.googleapis.com/v1beta/models/${n}:generateContent?key=${t}`,c={system_instruction:{parts:[{text:o}]},contents:[{parts:[{text:e}]}],generation_config:{response_mime_type:"application/json"}};i&&i.base64&&c.contents[0].parts.push({inline_data:{mime_type:i.mimeType,data:i.base64}});const d=l=>{if(l)try{let g=l.replace(/```json/g,"").replace(/```/g,"").trim();a(JSON.parse(g))}catch(g){console.error("Lỗi parse JSON từ Gemini",g,l),s("AI trả về kết quả không đúng cấu hình JSON.")}else s("AI không trả về kết quả hợp lệ.")};typeof GM_xmlhttpRequest<"u"?GM_xmlhttpRequest({method:"POST",url:r,headers:{"Content-Type":"application/json"},data:JSON.stringify(c),timeout:3e4,onload:l=>{var g,x,y,f,m;if(l.status>=200&&l.status<300)try{const u=JSON.parse(l.responseText),b=(m=(f=(y=(x=(g=u==null?void 0:u.candidates)==null?void 0:g[0])==null?void 0:x.content)==null?void 0:y.parts)==null?void 0:f[0])==null?void 0:m.text;d(b)}catch{s("Lỗi Parse kết quả từ Gemini API.")}else s(`API Gemini lỗi (${l.status}): ${l.responseText}`)},ontimeout:()=>s("Quá hạn thời gian gọi API (30s)"),onerror:l=>s("Lỗi kết nối đến Google Gemini API.")}):fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(c)}).then(l=>l.json()).then(l=>{var x,y,f,m,u;if(l.error)return s(l.error.message);const g=(u=(m=(f=(y=(x=l==null?void 0:l.candidates)==null?void 0:x[0])==null?void 0:y.content)==null?void 0:f.parts)==null?void 0:m[0])==null?void 0:u.text;d(g)}).catch(l=>s(l.message))})}async function ln(t,n){if(!t)throw new Error("Vui lòng nhập API Key.");const o={contents:[{parts:[{text:"Ping"}]}],generation_config:{max_output_tokens:5,response_mime_type:"text/plain"}},e=`https://generativelanguage.googleapis.com/v1beta/models/${n}:generateContent?key=${t}`;return new Promise((i,a)=>{const s=r=>{var c;try{return((c=JSON.parse(r).error)==null?void 0:c.message)||r}catch{return r}};typeof GM_xmlhttpRequest<"u"?GM_xmlhttpRequest({method:"POST",url:e,headers:{"Content-Type":"application/json"},data:JSON.stringify(o),timeout:1e4,onload:r=>{if(r.status>=200&&r.status<300)i(!0);else{const c=s(r.responseText);a(`API Error ${r.status}: ${c}`)}},onerror:r=>a("Lỗi kết nối mạng hoặc CORS."),ontimeout:()=>a("Hết thời gian chờ (10s).")}):fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)}).then(async r=>{if(r.ok)return i(!0);const c=await r.text();a(`API Error ${r.status}: ${s(c)}`)}).catch(r=>a(r.message))})}let R=null;function cn(){p.isInspecting=!p.isInspecting,p.isInspecting?(dn(),w("🔍 Chế độ Soi: Đang bật. Hãy di chuột và Click vào ô nhập liệu.","#1a73e8")):(pn(),w("🔍 Chế độ Soi: Đã tắt."))}function dn(){document.addEventListener("mouseover",me,!0),document.addEventListener("click",be,!0),document.body.classList.add("vnpt-inspecting-mode")}function pn(){document.removeEventListener("mouseover",me,!0),document.removeEventListener("click",be,!0),document.body.classList.remove("vnpt-inspecting-mode"),R&&(R.classList.remove("vnpt-inspect-highlight"),R=null)}function me(t){if(!p.isInspecting)return;const n=t.target.closest("input, select, textarea, ng-select2, label");if(!n){R&&(R.classList.remove("vnpt-inspect-highlight"),R=null);return}R&&R!==n&&R.classList.remove("vnpt-inspect-highlight"),n.classList.add("vnpt-inspect-highlight"),R=n}function be(t){if(!p.isInspecting||t.target.closest("#vnpt-docx-widget")||t.target.closest("#vnpt-inline-calc"))return;t.preventDefault(),t.stopPropagation();const n=t.target.closest("input, select, textarea, ng-select2, label");if(!n)return;const o=un(n),e=n.getAttribute("title")||n.value||"";o.key?(L(o.key,e,o.label||""),B(),w(`✅ Đã bắt được: ${o.label||o.key}${e?" ("+e+")":""}`,"#1e8e3e")):w("⚠️ Không tìm thấy ID hoặc tên cố định cho trường này.","#ffc107")}function un(t){let n="",o="";if(n=t.getAttribute("formcontrolname")||"",n||(n=t.id||t.getAttribute("name")||""),o=fn(t),t.tagName.toLowerCase()==="label"){const e=t.getAttribute("for"),i=e?document.getElementById(e):t.querySelector("input, select, textarea");i&&(n=i.getAttribute("formcontrolname")||i.id||i.getAttribute("name")||""),o||(o=t.innerText.trim())}return{key:n,label:o.replace(/[:*]/g,"").trim()}}function fn(t){if(t.id){const e=document.querySelector(`label[for="${t.id}"]`);if(e)return e.innerText.trim()}const n=t.closest("label");if(n)return n.innerText.trim();const o=t.previousElementSibling;return o&&(o.tagName==="LABEL"||o.classList.contains("label"))?o.innerText.trim():t.getAttribute("placeholder")||""}function gn(){const t=document.getElementById("vnpt-docx-widget")||document.createElement("div");t.id="vnpt-docx-widget";const n=h.get(Et)===!0;t.innerHTML=`
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
                                    <button class="util-item" id="vnpt-btn-default">🛠 Dữ liệu mặc định VNPT</button>
                                    <button class="util-item danger" id="vnpt-btn-clean-data" title="Xóa dữ liệu hoặc Reset cài đặt hệ thống">🧹 Dọn dẹp & Reset hệ thống</button>


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
                        <button id="vnpt-btn-raw-process-local" class="vnpt-btn-confirm btn-local-process" title="Phân loại nhanh không dùng AI (Regex)">⚡ Phân loại (Local)</button>
                        <button id="vnpt-btn-raw-process" class="vnpt-btn-confirm">✨ Phân loại (AI)</button>
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
    `,document.body.appendChild(t),p.widget=t,p.panel=document.getElementById("vnpt-export-panel"),p.toggleBtn=document.getElementById("vnpt-toggle-btn"),p.header=document.getElementById("vnpt-panel-header"),p.bannerArea=document.getElementById("vnpt-banner-area"),p.fieldsContainer=document.getElementById("vnpt-fields-list");try{const u=h.get(Ct);u&&u.width&&u.height&&(p.panel.style.width=u.width+"px",p.panel.style.height=u.height+"px")}catch(u){console.error("Lỗi load size panel:",u)}new ResizeObserver(u=>{if(p.panel.style.display!=="none")for(let b of u){const{width:v,height:C}=b.contentRect;v>0&&C>0&&h.setDebounced(Ct,{width:Math.round(v+20),height:Math.round(C+20)},1e3)}}).observe(p.panel),p.panelBody=document.getElementById("vnpt-panel-body"),nt(document.getElementById("vnpt-template-manager"),(u,b)=>{p.templateBuffer=u,p.templateName=b}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const u=this.files&&this.files[0];if(!u)return;const b=document.getElementById("vnpt-template-manager");Oe(u,b,(v,C)=>{p.templateBuffer=v,p.templateName=C}),this.value=""}),p.toggleBtn.addEventListener("click",u=>{p.hasDragged||(p.panel.style.display==="none"?(p.panel.style.display="flex",p.toggleBtn.className="btn-opened",p.toggleBtn.innerHTML="✖",h.set(Et,!0)):(p.panel.style.display="none",p.toggleBtn.className="btn-closed",p.toggleBtn.innerHTML="📄",h.set(Et,!1)))});const e=document.getElementById("vnpt-btn-more"),i=document.getElementById("vnpt-util-menu"),a={S:{width:"380px",height:"420px"},M:{width:"460px",height:"600px"},L:{width:"620px",height:"800px"},Full:{width:"98vw",height:"92vh"}},s=h.get(Y)||{};i.querySelectorAll("input[data-clink]").forEach(u=>{const b=u.dataset.clink,v=s[b]||zt[b]||[];u.value=v.join(", "),u.onchange=()=>{const C=h.get(Y)||{};C[b]=u.value.split(",").map(S=>S.trim()).filter(S=>S),h.set(Y,C)}});const r=document.getElementById("vnpt-gemini-key"),c=document.getElementById("vnpt-gemini-model");r&&c&&Promise.resolve().then(()=>Ie).then(({SK_GEMINI_KEY:u,SK_GEMINI_MODEL:b})=>{r.value=h.get(u)||"",c.value=h.get(b)||"gemini-2.0-flash",r.onchange=()=>{h.set(u,r.value.trim())},c.onchange=()=>{h.set(b,c.value)};const v=document.getElementById("vnpt-btn-test-gemini");v&&(v.onclick=async()=>{const C=r.value.trim(),S=c.value;if(!C){w("⚠️ Vui lòng nhập API Key trước khi thử","#ffc107");return}v.disabled=!0,v.textContent="⏳ Đang thử...";try{await ln(C,S),w("✅ Kết nối tới Gemini thành công!","#1e8e3e")}catch(N){w("❌ Kết nối thất bại: "+N,"#ea4335")}finally{v.disabled=!1,v.textContent="⚡ Kiểm tra kết nối"}})}),document.getElementById("vnpt-btn-export-json").onclick=()=>Vt();const d=document.getElementById("vnpt-txt-toggle"),l=document.getElementById("vnpt-txt-body");d&&l&&d.addEventListener("click",u=>{u.stopPropagation();const b=l.style.display==="none";l.style.display=b?"":"none",d.textContent=b?"▲":"▶"});const g=document.getElementById("vnpt-btn-import-json"),x=document.getElementById("vnpt-file-import-json");g.onclick=()=>x.click(),x.onchange=async u=>{u.target.files.length>0&&await pe(u.target.files[0])&&setTimeout(()=>location.reload(),1500)},e.addEventListener("click",u=>{u.stopPropagation();const b=i.classList.toggle("show");e.classList.toggle("active",b)}),i.addEventListener("click",u=>{u.stopPropagation()}),document.addEventListener("click",u=>{i.classList.contains("show")&&(i.classList.remove("show"),e.classList.remove("active"))}),i.querySelectorAll(".size-options button").forEach(u=>{u.addEventListener("click",b=>{const v=b.target.getAttribute("data-size"),C=a[v];C&&(p.panel.style.width=C.width,p.panel.style.height=C.height),i.classList.remove("show"),e.classList.remove("active")})});function y(){const u=document.getElementById("vnpt-hotkey-list");if(!u)return;const b=h.get(ht,Rt);u.innerHTML="",Object.entries(b).forEach(([v,C])=>{const S=document.createElement("div");S.className="vnpt-hotkey-row",S.innerHTML=`
                <span class="vnpt-hotkey-label">${C.label||v}</span>
                <button class="vnpt-hotkey-btn" data-action="${v}">${jt(C)}</button>
            `;const N=S.querySelector(".vnpt-hotkey-btn");N.onclick=A=>{A.stopPropagation(),!N.classList.contains("recording")&&(N.classList.add("recording"),N.textContent="Bấm phím...",rn(v,k=>{N.classList.remove("recording"),N.textContent=jt(k)}))},u.appendChild(S)})}y(),p.panel.querySelectorAll(".vnpt-resizer").forEach(u=>{u.addEventListener("mousedown",b=>{b.preventDefault(),b.stopPropagation();const v=b.clientX,C=b.clientY,S=p.panel.offsetWidth,N=p.panel.offsetHeight,A=p.widget.getBoundingClientRect(),k=A.top;window.innerWidth-A.right,p.panel.classList.add("vnpt-resizing"),document.body.classList.add("vnpt-resizing-global");const _=window.getComputedStyle(u).cursor;document.body.style.cursor=_;const U=I=>{const j=I.clientX-v,M=I.clientY-C;if(u.classList.contains("br"))p.panel.style.width=Math.max(360,S+j)+"px",p.panel.style.height=Math.max(250,N+M)+"px";else if(u.classList.contains("bl")){const H=S-j;H>360&&(p.panel.style.width=H+"px"),p.panel.style.height=Math.max(250,N+M)+"px"}else if(u.classList.contains("tr")){p.panel.style.width=Math.max(360,S+j)+"px";const H=N-M;H>250&&(p.panel.style.height=H+"px",p.widget.style.top=k+M+"px")}else if(u.classList.contains("tl")){const H=S-j,wt=N-M;H>360&&(p.panel.style.width=H+"px"),wt>250&&(p.panel.style.height=wt+"px",p.widget.style.top=k+M+"px")}},E=()=>{window.removeEventListener("mousemove",U),window.removeEventListener("mouseup",E),p.panel.classList.remove("vnpt-resizing"),document.body.classList.remove("vnpt-resizing-global"),document.body.style.cursor="";const I=p.widget.id==="vnpt-docx-widget";h.setDebounced(kt,{right:I?p.widget.style.right:void 0,top:p.widget.style.top,x:I?void 0:parseFloat(p.widget.style.left),y:parseFloat(p.widget.style.top)},500),h.setDebounced(Ct,{width:p.panel.offsetWidth,height:p.panel.offsetHeight},500)};window.addEventListener("mousemove",U),window.addEventListener("mouseup",E)})});const m=document.getElementById("vnpt-btn-inspect");m&&(m.onclick=()=>cn(),p.on("isInspecting",u=>{m.classList.toggle("active",u)}))}function ve(t,n,o,e=null,i=null){let a=!1,s=0,r=0,c=0,d=0,l=!1;const g=5;function x(f){l!==f&&(l=f,i&&i(f))}function y(f){if(f.button!==0||["INPUT","BUTTON","SELECT","TEXTAREA"].includes(f.target.tagName)||f.target.isContentEditable)return;a=!0,p.hasDragged=!1,c=f.clientX,d=f.clientY;const u=t.getBoundingClientRect();s=f.clientX-u.left,r=f.clientY-u.top,document.body.style.userSelect="none",n&&n.forEach(b=>b.style.cursor="grabbing"),e&&e(),f.preventDefault()}return n.forEach(f=>{f.addEventListener("mousedown",y)}),document.addEventListener("mousemove",function(f){if(!a)return;if(!p.hasDragged)if(Math.sqrt(Math.pow(f.clientX-c,2)+Math.pow(f.clientY-d,2))>g)p.hasDragged=!0;else return;let m=f.clientX-s,u=f.clientY-r;const b=window.innerWidth,v=window.innerHeight,C=document.getElementById("vnpt-toggle-btn"),S=C?C.offsetWidth:40,N=C?C.offsetHeight:40,A=t.id==="vnpt-docx-widget";let k=t.offsetWidth||0;if(A){let E=S+6-k,I=b-k+6;m<E&&(m=E),m>I&&(m=I)}else k=k||200,m<0&&(m=0),m+k>b&&(m=Math.max(0,b-k));let _=l;if(A?_=!1:l?f.clientY<v-40&&(_=!1):f.clientY>v-10&&(_=!0),u<0&&(u=0),_)x(!0),t.style.top=v-t.offsetHeight+"px",A?(t.style.right=b-m-k+"px",t.style.left="auto"):(t.style.left=m+"px",t.style.right="auto"),t.style.bottom="auto";else{x(!1);let U=t.offsetHeight||40,E;if(A)E=10+N;else{const I=t.querySelector(".cw-title-bar");E=I?I.offsetHeight:U}u+E>v&&(u=Math.max(0,v-E)),t.style.top=u+"px",A?(t.style.right=b-m-k+"px",t.style.left="auto"):(t.style.left=m+"px",t.style.right="auto"),t.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(a){if(a=!1,document.body.style.userSelect="",n&&n.forEach(f=>f.style.cursor="grab"),o){const f=t.id==="vnpt-docx-widget";h.set(o,{left:f?void 0:t.style.left,right:f?t.style.right:void 0,top:t.style.top,x:f?void 0:parseFloat(t.style.left),y:parseFloat(t.style.top),docked:l})}setTimeout(()=>{p.hasDragged=!1},100)}}),{isDocked:()=>l,setDocked:x}}function hn(){p.widget&&p.header&&(ve(p.widget,[p.header],kt),window.addEventListener("resize",()=>{const t=window.innerWidth,n=window.innerHeight,o=document.getElementById("vnpt-toggle-btn"),e=o?o.offsetWidth:40,i=o?o.offsetHeight:40;let a=p.widget.getBoundingClientRect(),s=a.left,r=a.top,c=p.widget.offsetWidth||0,l=e+6-c,g=t-c+6;s<l&&(s=l),s>g&&(s=g),r+10+i>n&&(r=Math.max(0,n-(10+i))),p.widget.style.right=t-s-c+"px",p.widget.style.top=r+"px"}))}function ye(t){const n=t.toLowerCase(),{ngay:o,thang:e,nam:i}=ne(),a=`${o}/${e}/${i}`;return{"ngayky, ngayky1":o,ngayky:o,"thangky, thangky1":e,thangky:e,"namky, namky1":i,namky:i,"ngaytiepnhan, ngaythangnamky":a,ngaytiepnhan:a,ngaythangnamky:a,soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[n]||""}function xe(){ee();const t=Object.keys(T).find(a=>a.includes("diaChi"));if(!t)return"";const n=T[t],o=t.split(",").map(a=>a.trim());let e={detail:"",ward:"",district:"",province:""};o.forEach(a=>{const s=Z(a,n);if(s){let r="";if(s.tagName.toLowerCase()==="ng-select2"){const c=s.querySelector(".select2-selection__rendered");r=c?c.getAttribute("title")||c.textContent.trim():""}else r=s.value||s.getAttribute("title")||"";r=(r||"").trim(),r&&r!=="--- Chọn ---"&&(a==="diaChi"||a==="duong"?e.detail=r:a.includes("tinh")?e.province=r:a.includes("huyen")||a.includes("quan")?e.district=r:(a.includes("xa")||a.includes("phuong"))&&(e.ward=r))}}),document.querySelectorAll("ng-select2").forEach(a=>{const s=a.querySelector(".select2-selection__rendered");if(!s)return;const r=(s.getAttribute("title")||s.textContent||"").trim();!r||r==="--- Chọn ---"||((r.startsWith("Xã")||r.startsWith("Phường")||r.startsWith("Thị trấn"))&&!e.ward?e.ward=r:(r.startsWith("Quận")||r.startsWith("Huyện")||r.startsWith("Thị xã"))&&!e.district?e.district=r:(r.startsWith("Tỉnh")||r.startsWith("Thành phố"))&&!e.province&&(e.province=r))});let i=[];if(e.detail&&i.push(e.detail),e.ward&&i.push(e.ward),e.district&&i.push(e.district),e.province){let a=e.province;!a.startsWith("Tỉnh")&&!a.startsWith("Thành phố")&&(a="Tỉnh "+a),i.push(a)}return i.length>0&&i.push("Việt Nam"),i.filter(a=>!!a).join(", ")}function we(){const t=["tinhId","tinhIdNew"];for(const o of t){const e=Z(o);if(e){let i="";if(e.tagName.toLowerCase()==="ng-select2"){const a=e.querySelector(".select2-selection__rendered");i=a?a.getAttribute("title")||a.textContent.trim():""}else i=e.value||e.getAttribute("title")||"";if(i&&i!=="--- Chọn ---")return i.trim()}}const n=document.querySelectorAll("ng-select2");for(const o of n){const e=o.querySelector(".select2-selection__rendered"),i=((e==null?void 0:e.getAttribute("title"))||(e==null?void 0:e.textContent)||"").trim();if(i&&(i.startsWith("Tỉnh")||i.startsWith("Thành phố")))return i}return""}function mn(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){if(ot("Trước khi quét mới: "+At()),p.isDefaultMode){Object.keys(F).forEach(o=>{L(o,F[o],T[o]||"")}),B(),w("Đã nạp lại dữ liệu mặc định từ hệ thống.");return}let n=0;ee(),Object.keys(T).forEach(o=>{const e=T[o],i=o.split(",").map(c=>c.trim()),a=i.includes("diaChi"),s=i.includes("noiCapSoDkdn");let r="";if(a)r=xe(),r&&n++;else if(s){const c=we();c&&(r="SKDT "+c,n++)}else i.forEach(c=>{var l;if(r)return;const d=Z(c,e);if(d){if(d.tagName.toLowerCase()==="select")r=((l=d.options[d.selectedIndex])==null?void 0:l.text)||"";else if(d.tagName.toLowerCase()==="ng-select2"){const g=d.querySelector(".select2-selection__rendered");r=g?g.getAttribute("title")||g.textContent.trim():""}else r=d.value||d.getAttribute("title")||"";r&&n++}});if(r=r||ye(o),r&&typeof r=="string"){const c=i[0];["sdt"].includes(c)?r=ze(r):["ngaySinhCustomer","ngayCapCustomer","ngayCapSoDkdnCustomer","ngayKy","ngayTiepNhan"].includes(c)&&(r=Re(r))}L(o,r,null)}),B(),n>0?(this.style.background="#1e8e3e",this.style.color="#fff",this.innerText="Đã quét xong",setTimeout(()=>{this.style.background="",this.style.color="",this.innerText="Quét dữ liệu"},1e3)):w("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")});function t(n){var s;if(n.target.closest("#vnpt-docx-widget")||n.target.closest("#vnpt-inline-calc")||n.type==="keydown"&&n.key!=="Enter")return;const o=n.target.closest("input, textarea, select, ng-select2");if(!o)return;const e=o.id,i=o.getAttribute("formcontrolname"),a=Object.keys(T).find(r=>{const c=r.split(",").map(d=>d.trim());return e&&c.includes(e)||i&&c.includes(i)});if(a!==void 0){let r;if(a.includes("diaChi")){r=xe();const c=we();if(c){const d="SKDT "+c,l=Object.keys(T).find(g=>g.includes("noiCapSoDkdn"));l&&L(l,d,null)}}else{const c=o.tagName.toLowerCase();if(c==="select")r=((s=o.options[o.selectedIndex])==null?void 0:s.text)||"";else if(c==="ng-select2"){const d=o.querySelector(".select2-selection__rendered");r=d?d.getAttribute("title")||d.textContent.trim():""}else r=o.value}r!==void 0&&(L(a,r,null),B(),console.debug(`[Sync] Updated ${a} with value: "${r}"`))}}document.addEventListener("input",t),document.addEventListener("change",t),document.addEventListener("keydown",t)}const bn={local:{download(t,n="arraybuffer"){return new Promise((o,e)=>{const i=new FileReader;switch(i.onload=a=>{let s=a.target.result;n==="base64"&&typeof s=="string"&&(s=s.split(",")[1]||s),o(s)},i.onerror=a=>e(a),n.toLowerCase()){case"arraybuffer":i.readAsArrayBuffer(t);break;case"base64":case"dataurl":i.readAsDataURL(t);break;case"text":i.readAsText(t);break;default:e(new Error(`Unsupported read type: ${n}`))}})},async upload(t){return this.download(t,"base64")}}},vn={getAdapter(t){const n=bn[t];if(!n)throw new Error(`Storage adapter not found: ${t}`);return n},async upload(t,n,o={}){return await this.getAdapter(t).upload(n,o)},async download(t,n,o={}){return await this.getAdapter(t).download(n,o.type||"arraybuffer")}};function ke(t,n,o){try{let e;try{e=new window.PizZip(t)}catch(c){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(c);return}const i=new window.docxtemplater(e,{paragraphLoop:!0,linebreaks:!0});i.render(n);const a=i.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",compression:"DEFLATE",compressionOptions:{level:9}}),s=URL.createObjectURL(a),r=document.createElement("a");r.href=s,r.download=o,document.body.appendChild(r),r.click(),setTimeout(()=>{document.body.removeChild(r),URL.revokeObjectURL(s)},100)}catch(e){let i=e.message;e.properties&&e.properties.errors instanceof Array?i=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+e.properties.errors.map(s=>"- "+(s.properties.explanation||s.message)).join(`
`):i="Lỗi phần mềm Word sinh ra: "+i,alert(i),console.error("DocX Error:",e)}}function yn(t,n){const o=t.replace(/@(\w+)/g,(e,i)=>n[i]!==void 0?n[i]:e);navigator.clipboard.writeText(o).then(()=>{alert("✅ Đã sao chép nội dung vào Clipboard!")}).catch(e=>{console.error("Lỗi khi copy:",e),alert("❌ Lỗi khi sao chép vào Clipboard. Vui lòng thử lại!")})}function xn(){const t=document.getElementById("vnpt-export-filename");t&&t.addEventListener("input",()=>{t.dataset.userEdited="1",t.value.trim()||(t.dataset.userEdited="0")});function n(){if(!t||t.dataset.userEdited==="1")return;let i="";if(p.fieldsContainer&&p.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(l=>{const x=l.querySelector(".f-key").value.trim().split(",")[0].trim(),y=l.querySelector(".f-val").value.trim();x==="tenToChuc"&&(i=y)}),!i){const d=document.getElementById("tenToChuc");d&&(i=d.tagName.toLowerCase()==="textarea"||d.tagName.toLowerCase()==="input"?d.value.trim():d.innerText.trim())}function a(d){if(!d)return"";let l=d;return l=l.replace(/Tổng công ty/gi,""),l=l.replace(/Công ty/gi,""),l=l.replace(/\bCty\b/gi,""),l=l.replace(/Trách nhiệm hữu hạn/gi,""),l=l.replace(/\bTNHH\b/gi,""),l=l.replace(/Cổ phần/gi,""),l=l.replace(/\bCP\b/gi,""),l=l.replace(/Một thành viên/gi,""),l=l.replace(/\bMTV\b/gi,""),l=l.replace(/Chi nhánh/gi,""),l=l.replace(/Việt Nam/gi,"VN"),l=l.replace(/Viet Nam/gi,"VN"),l=l.replace(/\s+/g," ").trim(),l=l.replace(/^[-,\s]+|[-,\s]+$/g,""),l.length>50&&(l=l.substring(0,47)+"..."),l.replace(/[<>:"/\\|?*]/g,"")}let s=a(i),r=p.templateName?p.templateName.replace(/\.docx$/i,""):"",c=[];r&&c.push(r),s&&c.push(s),c.length>0?t.value=c.join(" - ")+".docx":t.value||(t.value="Export_Auto.docx")}setInterval(n,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const i={};if(p.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(d=>{const g=d.querySelector(".f-key").value.trim().split(",")[0].trim(),x=d.querySelector(".f-val").value;g&&(i[g]=x)}),Object.keys(i).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}const s=[];if(pt.forEach(d=>{if(!i[d]||!i[d].trim()){const l=T[d]||d;s.push(l)}}),s.length>0){const d=`Cảnh báo: Bạn còn các trường sau chưa điền dữ liệu:

- ${s.join(`
- `)}

Bạn có chắc chắn muốn tiếp tục xuất file không?`;if(!confirm(d))return}let r=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(r.toLowerCase().endsWith(".docx")||(r+=".docx"),p.templateBuffer){ke(p.templateBuffer,i,r);return}const c=document.getElementById("vnpt-template-file");if(c.files&&c.files.length>0){vn.download("local",c.files[0],{type:"arraybuffer"}).then(d=>ke(d,i,r)).catch(d=>alert(`Lỗi đọc file: ${d.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')});const o=document.getElementById("vnpt-btn-export-txt"),e=document.getElementById("vnpt-txt-template");if(e){const i=h.get(Pt);i&&(e.value=i),e.addEventListener("input",()=>{h.setDebounced(Pt,e.value,800)})}o&&o.addEventListener("click",()=>{const i=e?e.value:"";if(!i.trim()){alert(`Bạn chưa nhập nội dung Text Template!

Sử dụng @key làm placeholder, ví dụ: Tôi là @tenDaiDienn`);return}const a={};if(p.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(r=>{const d=r.querySelector(".f-key").value.trim().split(",")[0].trim(),l=r.querySelector(".f-val").value;d&&(a[d]=l)}),Object.keys(a).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}yn(i,a)})}const wn=["chucVu","noiCap","noiCapSoDkdn","ngayky","ngayky1","thangky","namky","thangky1","namky1","noiKy"],kn=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function Cn(){function t(){wn.forEach(i=>{const a=document.getElementById(i);a&&!a.dataset.filled&&(a.dataset.filled="1",st(a,ye(i)))}),kn.forEach(i=>{const a=document.getElementById(i.src),s=document.getElementById(i.target);a&&s&&!a.dataset.bound&&(a.dataset.bound="1",a.addEventListener("change",()=>st(s,a.value)))}),["tinhId","tinhIdNew"].forEach(i=>{const a=document.getElementById(i),s=document.getElementById("noiCapSoDkdn");if(a&&s&&!a.dataset.skdtBound){a.dataset.skdtBound="1";const r=()=>{let c="";if(a.tagName.toLowerCase()==="ng-select2"||a.classList.contains("select2-hidden-accessible")){const d=a.parentElement.querySelector(".select2-selection__rendered");c=d?d.getAttribute("title")||d.textContent.trim():a.value}else c=a.value;c&&c!=="--- Chọn ---"&&st(s,"SKDT "+c)};a.addEventListener("change",r),$(a).on("select2:select",r)}})}let n;new MutationObserver(e=>{e.some(a=>a.addedNodes.length>0?Array.from(a.addedNodes).some(r=>r.nodeType!==1?!1:["INPUT","TEXTAREA","SELECT"].includes(r.tagName)?!0:r.querySelector&&r.querySelector("input, textarea, select")):!1)&&(clearTimeout(n),n=setTimeout(t,200))}).observe(document.body,{childList:!0,subtree:!0}),t()}const En=()=>{let t="";for(const[n,o]of Object.entries(T)){const e=n.split(",")[0].trim();pt.includes(e)&&(t+=`"${e}": "${o}",
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
`};function Tn(t,n,o="gemini-2.0-flash"){return he({apiKey:n,model:o,systemInstruction:En(),userText:"Đọc file hợp đồng này và trích xuất thành JSON.",fileData:{mimeType:"application/pdf",base64:t}})}function Sn(t){return new Promise((n,o)=>{const e=new FileReader;e.onload=()=>{const i=e.result.split(",")[1];n(i)},e.onerror=i=>o(i),e.readAsDataURL(t)})}function Ce(){let t=document.getElementById("vnpt-pdf-loader");t||(t=document.createElement("div"),t.id="vnpt-pdf-loader",t.className="vnpt-pdf-overlay",t.innerHTML=`
            <div class="vnpt-pdf-loading-box">
                <div class="loader-spinner"></div>
                <div style="margin-top: 15px; font-weight: 800; font-size: 13px; color: #1a73e8;">Đang nhờ AI đọc Hợp đồng...</div>
                <div style="margin-top: 4px; font-size: 11px; color: #5f6368;">Tùy thuộc độ lớn file, thường mất 5 - 10s...</div>
            </div>
        `,document.body.appendChild(t)),t.style.display="flex"}function Mt(){const t=document.getElementById("vnpt-pdf-loader");t&&(t.style.display="none")}function Ee(t,n){let o=document.getElementById("vnpt-pdf-dialog");o&&o.remove(),o=document.createElement("div"),o.id="vnpt-pdf-dialog",o.className="vnpt-pdf-overlay";const e=t.map((c,d)=>`
        <tr class="pdf-row-auto">
            <td style="text-align: center;">
                <input type="checkbox" class="pdf-row-chk" data-index="${d}" checked />
            </td>
            <td><strong>${c.key}</strong></td>
            <td><div style="max-height: 40px; overflow-y: auto; color: #1a73e8; font-weight: 600;">${c.value}</div></td>
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
    `,document.body.appendChild(o);const i=o.querySelector("#pdf-btn-cancel"),a=o.querySelector("#pdf-btn-confirm"),s=o.querySelector("#pdf-check-all"),r=o.querySelectorAll(".pdf-row-chk");s.addEventListener("change",c=>{r.forEach(d=>d.checked=c.target.checked)}),i.onclick=()=>{o.remove()},a.onclick=()=>{const c=[];r.forEach(d=>{if(d.checked){const l=parseInt(d.getAttribute("data-index"));c.push(t[l])}}),o.remove(),n(c)}}function Ln(){const t=document.getElementById("vnpt-btn-scan-pdf"),n=document.getElementById("vnpt-pdf-input");!t||!n||(t.addEventListener("click",o=>{if(o.preventDefault(),!h.get(Lt)){navigator.clipboard.writeText("https://github.com/tranchien2000/vnpt-tampermonkey-vite/blob/main/docs/GEMINI_API_GUIDE.md").then(()=>{w("Đã copy link hướng dẫn cài đặt API Key vào bộ nhớ tạm","#f44336")}).catch(a=>{console.error("Không thể copy link:",a),alert("Công cụ chưa được cài đặt API Key!")});return}n.click()}),n.addEventListener("change",async o=>{const e=o.target.files[0];e&&(o.target.value="",await Nn(e))}))}async function Nn(t){const n=h.get(Lt),o=h.get(Kt)||"gemini-2.5-flash";if(!n){confirm(`Chưa cài đặt Gemini API Key!

AI Scanner (PDF) yêu cầu cần có mã Google AI Studio cấp phát Miễn phí.

Nhấn 'OK' để xem hướng dẫn tự tạo mã Key nhé!`)&&window.open("https://github.com/tranchien2000/vnpt-tampermonkey-vite/blob/main/docs/GEMINI_API_GUIDE.md","_blank");return}try{Ce();const e=await Sn(t);ot("Trước khi PDF Scan: "+At());const i=await Tn(e,n,o);Mt();const a=Object.keys(i).map(s=>({key:s,value:i[s],label:i[s]===""?"(Trống)":i[s]})).filter(s=>s.value!=="");if(a.length===0){alert("Rất tiếc! AI không tìm thấy trường thông tin nào thỏa mãn (Bên A).");return}Ee(a,s=>{s.forEach(r=>{L(r.key,r.value,`AI: ${r.key}`)}),B(),console.log(`✅ [OCR Pdf] Đã điền thành công ${s.length} trường.`)})}catch(e){Mt(),console.error("Lỗi PDF Scan Pipeline:",e);let i=e;typeof e=="string"&&(e.includes("Quota exceeded")||e.includes("limit: 0"))&&(i=`⚠️ Hết hạn mức hoặc Mô hình không khả dụng (Quota Exceeded)!

Mô hình bạn chọn có thể chưa hỗ trợ tại vùng của bạn hoặc bạn đã dùng hết lượt gọi miễn phí.

QUYẾT : Hãy mở menu ⚙️ (Thiết lập), đổi sang 'Gemini 1.5 Flash' hoặc 'Gemini 2.0 Flash' để tiếp tục.`),alert(`Lỗi xử lý quét File:
`+i)}}function In(t){if(!t)return{};const n={},o=t.match(/(?:Tên công ty viết bằng tiếng Việt|Tên tổ chức):?\s*([\s\S]+?)(?=\n|Tên công ty|$)/i);o&&(n.tenToChuc=o[1].trim());const e=t.match(/(?:Mã số doanh nghiệp|Mã số thuế):?\s*(\d{10,13})/i);e&&(n.soDkdn=e[1].trim());let i=t.match(/(?:Họ và tên|Tên đại diện|Người đại diện theo pháp luật):?\s*([\s\S]+?)(?=\n|Chức vụ|Chức danh|Giới tính|Sinh ngày|$)/i);if(i){let f=i[1].trim();f=f.replace(/^(?:Họ và tên|Tên đại diện|Người đại diện theo pháp luật):?\s*/i,""),n.tenDaiDienn=f.toUpperCase()}const a=t.match(/(?:Chức danh|Chức vụ):?\s*([\s\S]+?)(?=\n|Sinh ngày|$)/i);a&&(n.chucVu=a[1].trim());const s=t.match(/(?:Đăng ký|Đảng kỷ) lần đầu:?\s*ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i);s&&(n.ngayCapSoDkdnCustomer=`${s[1].padStart(2,"0")}/${s[2].padStart(2,"0")}/${s[3]}`);const r=t.match(/(?:Điện thoại|SĐT):?\s*([\d\s.-]{9,15})/i);r&&(n.sdt=r[1].replace(/[\s.-]/g,"").trim());const c=t.match(/(?:Thư điện tử|Email):?\s*([^\s\n]+)/i);c&&(n.emailDaiDien=c[1].replace(/\(a\)/g,"@").trim());const d=t.match(/(?:Địa chỉ trụ sở chính|Địa chỉ liên lạc|Nơi thường trú|Nơi ở hiện nay):?\s*([\s\S]+?)(?=\n|Điện thoại|Thư điện tử|Mã số thuế|$)/i);d&&(n.diaChi=d[1].trim().replace(/\s+/g," "));const l=t.match(/(?:Số định danh cá nhân|Số CMND|Số CCCD|Số Hộ chiếu):?\s*(\d{9,12})/i);l&&(n.cmnd=l[1].trim());const g=t.match(/(?:Nơi cấp):?\s*([\s\S]+?)(?=\n|$)/i);g&&(n.noiCap=g[1].trim());const x=t.match(/(?:Ngày cấp):?\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/i);x&&(n.ngayCapCustomer=`${x[1].padStart(2,"0")}/${x[2].padStart(2,"0")}/${x[3]}`);const y=t.match(/(?:Ngày, tháng, năm sinh|Sinh ngày):?\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/i);if(y)n.ngaySinhCustomer=`${y[1].padStart(2,"0")}/${y[2].padStart(2,"0")}/${y[3]}`;else{const f=t.match(/(?:Ngày, tháng, năm sinh|Sinh ngày):?\s*ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i);f&&(n.ngaySinhCustomer=`${f[1].padStart(2,"0")}/${f[2].padStart(2,"0")}/${f[3]}`)}return n}const Dn=()=>{let t="";for(const[n,o]of Object.entries(T)){const e=n.split(",")[0].trim();pt.includes(e)&&(t+=`"${e}": "${o}",
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
- Bỏ qua các dữ liệu rác không liên quan.`};async function An(t,n,o="gemini-2.0-flash"){if(!t||!t.trim())throw new Error("Vui lòng nhập nội dung văn bản cần phân loại.");return he({apiKey:n,model:o,systemInstruction:Dn(),userText:`Hãy phân loại thông tin từ đoạn văn bản sau đây: 

${t}`})}function Bn(t){if(!t||!t.trim())throw new Error("Vui lòng nhập nội dung văn bản cần phân loại.");return In(t)}function Mn(){const t=document.getElementById("vnpt-btn-scan-raw"),n=document.getElementById("vnpt-raw-scan-section"),o=document.getElementById("vnpt-btn-raw-process"),e=document.getElementById("vnpt-btn-raw-process-local"),i=document.getElementById("vnpt-raw-scan-input");if(!t||!n||!o||!i)return;t.addEventListener("click",s=>{s.preventDefault();const r=n.style.display==="none";n.style.display=r?"flex":"none",t.classList.toggle("active",r),r&&i.focus()});const a=(s,r,c)=>{const d=Object.keys(s).map(g=>({key:g,value:s[g],label:`${r}: ${g}`})).filter(g=>g.value!==""&&g.value!==null);if(d.length===0){alert(r==="AI"?"AI không tìm thấy thông tin hợp lệ nào.":"Không tìm thấy thông tin phù hợp theo mẫu trích xuất Local.");return}Ee(d,g=>{g.forEach(x=>{L(x.key,x.value,x.label)}),B(),w(`✅ Đã nạp ${g.length} trường từ văn bản thô.`),n.style.display="none",t.classList.remove("active"),i.value=""});const l=document.querySelector("#vnpt-pdf-dialog h3");l&&(l.textContent=c)};e&&e.addEventListener("click",()=>{const s=i.value.trim();if(!s){w("⚠️ Vui lòng nhập nội dung văn bản!","#ffc107");return}try{ot("Trước khi phân loại Local: "+At());const r=Bn(s);a(r,"Local","PHÂN LOẠI DỮ LIỆU THÔ (LOCAL)")}catch(r){w("❌ Lỗi: "+r.message,"#f44336")}}),o.addEventListener("click",async()=>{const s=i.value.trim();if(!s){w("⚠️ Vui lòng nhập nội dung văn bản!","#ffc107");return}const r=h.get(Lt),c=h.get(Kt)||"gemini-2.0-flash";if(!r){w("⚠️ Chưa cài đặt API Key Gemini!","#f44336");return}try{Ce(),ot("Trước khi phân loại AI: "+At());const d=await An(s,r,c);Mt(),a(d,"AI","PHÂN LOẠI DỮ LIỆU THÔ (AI)")}catch(d){Mt(),console.error("Raw Scan AI Error:",d),alert("Lỗi AI: "+d)}})}function ct(t,n=null){return h.get(t,n)}function _t(t,n){h.set(t,n)}function Te(t,n){if(!n||n.replace(/\D/g,"").length<6)return;let o=ct(t,[]);o=o.filter(e=>e!==n),o.unshift(n),_t(t,o.slice(0,10))}function Ht(t,n){const o=document.getElementById(n);o&&(o.innerHTML=ct(t,[]).map(e=>`<option value="${e}">`).join(""))}function Wt(t){return t.toLocaleString("en-US")}function Xt(t){return Number(String(t).replace(/[^\d]/g,""))||0}function _n(t){return t.charAt(0).toUpperCase()+t.slice(1)}const yt=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function Hn(t){let n=Math.floor(t/100),o=Math.floor(t%100/10),e=t%10,i="";return n>0&&(i+=yt[n]+" trăm ",o===0&&e>0&&(i+="lẻ ")),o>1?(i+=yt[o]+" mươi ",e===1?i+="mốt":e===5?i+="lăm":e>0&&(i+=yt[e])):o===1?(i+="mười ",e===5?i+="lăm":e>0&&(i+=yt[e])):e>0&&(n>0&&(i+="lẻ "),i+=yt[e]),i.trim()}function On(t){if(t===0)return"không";const n=["","nghìn","triệu","tỷ"];let o="",e=0;for(;t>0;){const i=t%1e3;i>0&&(o=Hn(i)+" "+n[e]+" "+o),t=Math.floor(t/1e3),e++}return o.trim()}function Se(t,n,o){let e=0,i=0,a=0;t==="before"?(e=Xt(n),i=Math.round(e*o),a=e+i):t==="tax"?(i=Xt(n),e=Math.round(i/o),a=e+i):t==="after"&&(a=Xt(n),e=Math.round(a/(1+o)),i=a-e);const s=_n(On(a))+" đồng";return{beforeNum:e,taxNum:i,afterNum:a,beforeStr:Wt(e),taxStr:Wt(i),afterStr:Wt(a),textStr:s}}function Pn(t,n){n.before&&n.before.forEach(o=>it(o,t.beforeStr)),n.tax&&n.tax.forEach(o=>it(o,t.taxStr)),n.after&&n.after.forEach(o=>it(o,t.afterStr)),n.text&&n.text.forEach(o=>it(o,t.textStr))}function Ot(t,n=null){try{const o=localStorage.getItem(t);return o!==null?JSON.parse(o):n}catch{return n}}function G(t,n){localStorage.setItem(t,JSON.stringify(n))}function Kn(t,n,o,e){let i=Ot(rt)??"custom",a=Ot(V)??{...F},s=Ot(tt)??{},r=Ot(X)??{};const c=document.createElement("div");c.className="cw-tab-header";const d={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};d.custom.innerText="📋 Custom",d.custom.className="cw-tab cw-tab-custom",d.default.innerText="📌 Default",d.default.className="cw-tab cw-tab-default",d.sync.innerText="🔗 Sync",d.sync.className="cw-tab cw-tab-sync";function l(){Object.values(d).forEach(k=>k.classList.remove("active")),d[i].classList.add("active")}l();const g=document.createElement("div");g.style.display=e.data?"none":"block";const x=n("📋 Cấu hình Data","data",k=>{g.style.display=k?"none":"block",o(t)}),y=document.createElement("div");y.className="cw-data-body";function f(){y.innerHTML="";let k=i==="sync"?r:i==="custom"?s:a,_=i==="sync"?X:i==="custom"?tt:V;const U=Object.keys(k);U.length===0&&i!=="default"&&(y.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),U.forEach(E=>{const I=document.createElement("div");I.className="cw-data-row";let j=i!=="default";const M=k[E],H=M&&typeof M=="object"&&M.hasOwnProperty("value"),wt=H?M.value:M,Jt=H&&M.label||E,z=document.createElement("input");z.type="text",z.value=Jt,z.id=`df-key-${E}`,z.name=`df-key-${E}`,z.className="cw-data-key"+(j?" mutable":""),z.title=E,z.readOnly=!j,j&&(z.onchange=()=>{const q=z.value.trim();if(!q||q===E){z.value=Jt;return}H?k[q]={...M,label:q}:k[q]=wt,delete k[E],G(_,k),f()});const W=document.createElement("input");if(W.type="text",W.value=wt??"",W.id=`df-val-${E}`,W.name=`df-val-${E}`,W.className="cw-data-val",W.oninput=()=>{H?k[E]={...M,value:W.value}:k[E]=W.value,G(_,k)},I.appendChild(z),I.appendChild(W),j){const q=document.createElement("button");q.innerHTML="✕",q.className="cw-del-btn",q.onclick=()=>{confirm(`Delete "${Jt}"?`)&&(delete k[E],G(_,k),f())},I.appendChild(q)}else I.appendChild(document.createElement("div")).className="cw-pad";y.appendChild(I)})}d.custom.onclick=()=>{i="custom",G(rt,"custom"),l(),f()},d.default.onclick=()=>{i="default",G(rt,"default"),l(),f()},d.sync.onclick=()=>{i="sync",G(rt,"sync"),l(),f()};const m=document.createElement("button");m.innerText="📤",m.className="cw-icon-btn",m.title="Sao lưu toàn bộ dữ liệu ra JSON",m.onclick=()=>Vt();const u=document.createElement("button");u.innerText="📥",u.className="cw-icon-btn",u.title="Khôi phục dữ liệu từ JSON";const b=document.createElement("input");b.type="file",b.accept=".json",b.style.display="none",b.onchange=async k=>{k.target.files.length>0&&await pe(k.target.files[0])&&setTimeout(()=>location.reload(),1500)},u.onclick=()=>b.click(),g.appendChild(c),c.appendChild(d.custom),c.appendChild(d.default),c.appendChild(d.sync),g.appendChild(y),t.appendChild(x),t.appendChild(g);const v=t.querySelector("#vnpt-cw-fill"),C=t.querySelector("#vnpt-cw-sync"),S=t.querySelector("#vnpt-cw-add"),N=t.querySelector("#vnpt-cw-reset");v&&(v.onclick=le),C&&(C.onclick=We),S&&(S.onclick=()=>{i==="default"&&(i="custom",G(rt,"custom"),l());let k=i==="sync"?r:s,_="new_field_"+Date.now();k[_]="",G(i==="sync"?X:tt,k),f(),y.scrollTop=y.scrollHeight}),N&&(N.onclick=()=>{confirm("Reset Default Data?")&&(a={...F},G(V,a),f())}),f();const A=x.querySelector(".cw-right-wrap")||document.createElement("div");A.className="cw-right-wrap",A.prepend(m),A.prepend(u),A.appendChild(b),x.appendChild(A)}function $n(t,n,o){let e=Number(localStorage.getItem(at))||je,i=ct(ft)??{calc:!1,data:!0};function a(y,f){const m=document.createElement("button");return m.innerText=y,m.className="cw-action-btn "+f,m}function s(y,f,m){const u=document.createElement("div");u.className="wg-sec-header";const b=document.createElement("span");b.innerText=y;const v=document.createElement("button");return v.className="wg-toggle-btn",v.innerText=i[f]?"▾":"▴",u.appendChild(b),u.appendChild(v),v.onclick=()=>{i[f]=!i[f],v.innerText=i[f]?"▾":"▴",_t(ft,i),m(i[f])},u}function r(y){const f=window.innerWidth,m=window.innerHeight,u=y.getBoundingClientRect();y.style.left=Math.min(Math.max(parseFloat(y.style.left),0),f-u.width)+"px",y.style.top=Math.min(Math.max(parseFloat(y.style.top),0),m-36)+"px"}const c=document.createElement("div");if(!n){c.className="cw-title-bar",c.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const y=document.createElement("div");y.className="cw-btn-group";const f={fill:a("Fill","cw-btn-fill"),sync:a("Sync","cw-btn-sync"),add:a("Add","cw-btn-add"),reset:a("↺","cw-btn-reset")};f.reset.title="Reset Default fields",Object.values(f).forEach(m=>y.appendChild(m)),c.appendChild(y),t.appendChild(c)}const d=document.createElement("div");d.className="cw-body-inline",d.innerHTML=`
    <div class="cw-inline-row">
        <input id="wg-before" name="wg-before" class="cw-input-inline" placeholder="Trước thuế" list="wg-before-list" title="Trước thuế">
        <datalist id="wg-before-list"></datalist>
        <div class="cw-tax-group-inline"><input id="wg-taxRate" name="wg-taxRate" class="cw-tax-input-inline" title="Thuế (%)"><span class="cw-tax-symbol">%</span></div>
        <input id="wg-tax" name="wg-tax" class="cw-input-inline" placeholder="Tiền thuế" title="Tiền thuế">
        <input id="wg-after" name="wg-after" class="cw-input-inline" placeholder="Sau thuế" list="wg-after-list" title="Sau thuế">
        <datalist id="wg-after-list"></datalist>
        <input id="wg-text" name="wg-text" class="cw-input-inline cw-input-readonly-inline" placeholder="Bằng chữ" readonly title="Bằng chữ">
    </div>`,n?n.appendChild(d):t.appendChild(d),n||Kn(t,s,r,i);const l={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text")};l.taxRate.value=e*100,Ht(Tt,"wg-before-list"),Ht(St,"wg-after-list");function g(y,f){const m=Se(y,f,e);return l.before.value=m.beforeStr,l.tax.value=m.taxStr,l.after.value=m.afterStr,l.text.value=m.textStr,m}function x(y,f){const m=Se(y,f,e),u=ct(Y)||{...zt};Pn(m,u)}if(l.taxRate.oninput=()=>{e=Number(l.taxRate.value)/100||0,_t(at,e),g("before",l.before.value)},l.taxRate.onchange=()=>{x("before",l.before.value)},l.before.oninput=()=>{g("before",l.before.value)},l.before.onchange=()=>{x("before",l.before.value),Te(Tt,l.before.value),Ht(Tt,"wg-before-list")},l.tax.oninput=()=>{g("tax",l.tax.value)},l.tax.onchange=()=>{x("tax",l.tax.value)},l.after.oninput=()=>{g("after",l.after.value)},l.after.onchange=()=>{x("after",l.after.value),Te(St,l.after.value),Ht(St,"wg-after-list")},[l.before,l.tax,l.after,l.text].forEach(y=>{["click","focus"].forEach(f=>y.addEventListener(f,()=>{if(!y.value)return;navigator.clipboard.writeText(y.value);const m=y.style.backgroundColor;y.style.backgroundColor="#d1e7dd",setTimeout(()=>y.style.backgroundColor=m,300)}))}),!n){const y=Array.from(t.children).filter(u=>u!==c),f=ve(t,[c],o,null,u=>{y.forEach(b=>b.style.display=u?"none":""),c.style.borderRadius=u?"8px":"0",u&&(t.style.top=window.innerHeight-(c.offsetHeight||34)+"px")}),m=ct(o);return m&&m.docked&&f.setDocked(!0),window.addEventListener("resize",()=>{f.isDocked()?t.style.top=window.innerHeight-c.offsetHeight+"px":r(t)}),f}return null}function Fn(){const t=document.getElementById("vnpt-inline-calc"),n=document.getElementById("vnpt-btn-calc-toggle");let o=p.calcWidget||document.createElement("div");if(!t&&!p.calcWidget?(o.id="vnpt-calc-widget",document.body.appendChild(o),p.calcWidget=o):t&&(o=p.widget),t&&n){let e=ct(ft)??{calc:!1,data:!0};const i=a=>{t.style.display=a?"none":"block",n.classList.toggle("active",!a)};i(e.calc),n.onclick=()=>{e.calc=!e.calc,_t(ft,e),i(e.calc)}}return $n(o,t,Qt)}function zn(){let t=!1;try{t=!1}catch{t=!1}t&&P.info("[Migration] Dev mode active - Syncing configurations...");let n=h.get(V);if(n){let e=!1;Object.keys(F).forEach(i=>{const a=F[i];if(!(i in n))n[i]=a,e=!0;else if(t){const s=n[i],r=a&&typeof a=="object",c=s&&typeof s=="object";let d=!1;!r&&!c?d=s!==a:r&&c?d=s.value!==a.value||s.label!==a.label:d=!0,d&&(n[i]=a,e=!0)}}),e&&h.set(V,n)}let o=h.get(O);if(o){let e=!1;Object.keys(F).forEach(i=>{const a=F[i],s=a&&typeof a=="object"?a.value:a,r=a&&typeof a=="object"?a.label:T[i]||"";if(!(i in o))o[i]={label:r,value:s,sync:""},e=!0;else if(t){const c=o[i];(c.value!==s||c.label!==r)&&(o[i]={label:r,value:s,sync:c.sync||""},e=!0)}}),e&&h.setDebounced(O,o,0)}}let xt=null;function Yt(){if(!window.__vnptInited){window.__vnptInited=!0,P.info("Initializing VNPT Userscript..."),zn();try{Le(),gn(),Fn(),hn(),en(),Bt(),mn(),xn(),Cn(),Ln(),Mn(),Je(),nn();const t=se(()=>{Zt(),te(),P.debug("DOM Cache & Labels refreshed due to mutations")},1500);xt=new MutationObserver(n=>{n.some(e=>e.addedNodes.length>0||e.removedNodes.length>0?[...e.addedNodes,...e.removedNodes].some(a=>a.nodeType===1&&!["SCRIPT","STYLE","LINK"].includes(a.tagName)):!1)&&t()}),xt.observe(document.body,{childList:!0,subtree:!0}),P.info("Userscript initialized successfully.")}catch(t){P.error("Error during userscript initialization:",t)}}}function Rn(){P.info("Cleaning up VNPT Userscript for reload..."),xt&&(xt.disconnect(),xt=null);const t=document.getElementById("vnpt-docx-widget");t&&t.remove();const n=document.getElementById("vnpt-calc-widget");n&&n.remove();const o=document.getElementById("vnpt-styles");o&&o.remove(),window.__vnptInited=!1,P.info("Cleanup completed.")}window.__vnptCleanup=Rn,window.__vnptInit=Yt,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Yt):Yt()})();
