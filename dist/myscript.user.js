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
(function(){"use strict";const H={info:(...t)=>console.log("[Tampermonkey Script] INFO:",...t),error:(...t)=>console.error("[Tampermonkey Script] ERROR:",...t),warn:(...t)=>console.warn("[Tampermonkey Script] WARN:",...t)};function ve(){const t="vnpt-styles";if(document.getElementById(t))return;const n=document.createElement("style");n.id=t,n.textContent=`
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

    `,document.head.appendChild(n)}const ye={widget:null,panel:null,header:null,bannerArea:null,toggleBtn:null,fieldsContainer:null,panelBody:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1,templateBuffer:null,templateName:null,hasDragged:!1},rt=new Map,d=new Proxy(ye,{get(t,n){return n==="on"?(i,e)=>{rt.has(i)||rt.set(i,[]),rt.get(i).push(e)}:t[n]},set(t,n,i){const e=t[n];return t[n]=i,e!==i&&rt.has(n)&&rt.get(n).forEach(a=>a(i,e)),!0}}),T={"tenDaiDienn, tenNguoiNhanCTS ":"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT","emailDaiDien, emailNhanCTS":"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Mã số thuế | GPKD",goiDV:"Gói Dịch Vụ","ngayKy, ngayKy1":"Ngày ký","thangKy, thangKy1":"Tháng Ký","namKy, namKy1":"Năm ký","ngayTiepNhan, ngayThangNamKy":"Ngày tiếp nhận / Ngày tháng năm ký","soHopDong, inputContractGroupName":"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký","lienheHopDongA, lienheTuVanA, lienheHoaDonA, sucoCap1A, sucoCap2A, sucoCap3A, sucoCap4A":"Liên hệ A"},lt=["soHopDong","tenDaiDienn","cmnd","sdt","diaChi","tenToChuc","ngayCapCustomer","emailDaiDien","soDkdn","goiDV","soHopDong"],F="vnpt_docx_fields",O="vnpt_docx_default_fields",vt="vnpt_docx_position",yt="vnpt_docx_size",xt="vnpt_docx_opened",st="vnpt_docx_auto_backup",z="vnpt_autofill_data_default",W="vnpt_autofill_data_custom",j="vnpt_autofill_data_sync",Ut="vnpt_widget_pos",J="vnd_tax_rate",wt="vnd_before_history",kt="vnd_after_history",ct="vnpt_widget_collapsed",R="vnd_calc_map",nt="vnpt_widget_datatab",dt="vnpt_templates",Bt="vnpt_txt_template",Ct="vnpt_gemini_api_key",At="vnpt_gemini_model",pt="vnpt_hotkeys",xe=Object.freeze(Object.defineProperty({__proto__:null,DEFAULT_LABELS:T,LOCAL_KEY_AUTO_BACKUP:st,LOCAL_KEY_DEFAULT_FIELDS:O,LOCAL_KEY_FIELDS:F,LOCAL_KEY_OPENED:xt,LOCAL_KEY_POS:vt,LOCAL_KEY_SIZE:yt,REQUIRED_KEYS:lt,SK_CALC_MAP:R,SK_COLLAPSE:ct,SK_DATATAB:nt,SK_DATA_CUS:W,SK_DATA_DEF:z,SK_DATA_SYNC:j,SK_GEMINI_KEY:Ct,SK_GEMINI_MODEL:At,SK_HIST_A:kt,SK_HIST_B:wt,SK_HOTKEYS:pt,SK_POS_CALC:Ut,SK_TAX:J,SK_TEMPLATES:dt,SK_TXT_TEMPLATE:Bt},Symbol.toStringTag,{value:"Module"}));let Y=null;function w(t,n="#198754",i=2500){Y||(Y=document.createElement("div"),Y.id="vnpt-toast-container",Object.assign(Y.style,{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column-reverse",alignItems:"center",gap:"8px",zIndex:"1000000",pointerEvents:"none"}),document.body.appendChild(Y));const e=document.createElement("div");e.innerText=t,Object.assign(e.style,{background:n,color:"#fff",padding:"8px 18px",borderRadius:"24px",opacity:"0",transform:"translateY(10px)",transition:"opacity 0.3s, transform 0.3s",fontSize:"13px",fontWeight:"500",fontFamily:"'Segoe UI', Roboto, sans-serif",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",whiteSpace:"nowrap",pointerEvents:"auto"}),Y.appendChild(e),requestAnimationFrame(()=>{e.style.opacity="1",e.style.transform="translateY(0)"}),setTimeout(()=>{e.style.opacity="0",e.style.transform="translateY(-10px)",setTimeout(()=>{e.remove(),Y&&Y.childNodes.length},300)},i)}const we="vnpt_templates_db",X="buffers";let Et=null;function Mt(){return Et?Promise.resolve(Et):new Promise((t,n)=>{const i=indexedDB.open(we,1);i.onupgradeneeded=e=>{const a=e.target.result;a.objectStoreNames.contains(X)||a.createObjectStore(X)},i.onsuccess=e=>{Et=e.target.result,t(Et)},i.onerror=()=>n(i.error)})}async function ke(t,n){const i=await Mt();return new Promise((e,a)=>{const c=i.transaction(X,"readwrite").objectStore(X).put(n,t);c.onsuccess=()=>e(),c.onerror=()=>a(c.error)})}async function Ce(t){const n=await Mt();return new Promise((i,e)=>{const r=n.transaction(X,"readonly").objectStore(X).get(t);r.onsuccess=()=>i(r.result),r.onerror=()=>e(r.error)})}async function Ee(t){const n=await Mt();return new Promise((i,e)=>{const r=n.transaction(X,"readwrite").objectStore(X).delete(t);r.onsuccess=()=>i(),r.onerror=()=>e(r.error)})}const Q=new Map,Tt=new Map,h={isGM:typeof GM_setValue<"u"&&typeof GM_getValue<"u",get(t,n=null){if(Q.has(t))return Q.get(t);try{let i;if(this.isGM?i=GM_getValue(t,null):i=localStorage.getItem(t),i==null)return n;const e=typeof i=="string"?JSON.parse(i):i;return Q.set(t,e),e}catch(i){return console.warn(`[Storage] Không thể đọc key "${t}":`,i),n}},set(t,n){Q.set(t,n);try{return this.isGM?GM_setValue(t,n):localStorage.setItem(t,JSON.stringify(n)),!0}catch(i){return console.error(`[Storage] Không thể ghi key "${t}":`,i),!1}},setDebounced(t,n,i=500){Q.set(t,n),Tt.has(t)&&clearTimeout(Tt.get(t));const e=setTimeout(()=>{this.set(t,n),Tt.delete(t)},i);Tt.set(t,e)},remove(t){Q.delete(t);try{this.isGM?GM_deleteValue(t):localStorage.removeItem(t)}catch(n){console.error(`[Storage] Không thể xóa key "${t}":`,n)}},clearCache(){Q.clear()}};function ut(){try{const t=h.get(dt)||[],n=t.filter(i=>i.type!=="local");return n.length!==t.length&&ft(n),n}catch{return[]}}function ft(t){h.set(dt,t)}function Te(t){const n=t.match(/drive\.google\.com\/file\/d\/([^/]+)/);return n?`https://drive.google.com/uc?export=download&id=${n[1]}`:t}function Se(t){return new Promise((n,i)=>{GM_xmlhttpRequest({method:"GET",url:Te(t),responseType:"arraybuffer",onload:e=>{if(e.status>=200&&e.status<300){if(e.response&&e.response.byteLength>4){const a=new Uint8Array(e.response.slice(0,4));if(a[0]===80&&a[1]===75&&a[2]===3&&a[3]===4){n(e.response);return}else{i(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}n(e.response)}else i(new Error(`HTTP ${e.status}: Không lấy được file`))},onerror:()=>i(new Error("Không thể tải URL.")),ontimeout:()=>i(new Error("Timeout khi tải URL."))})})}async function Le(t,n,i){const e=t.name.replace(/\.docx$/i,""),a=prompt("Đặt tên biến nhớ cho file này:",e);if(!(!a||!a.trim()))try{const o=await t.arrayBuffer();await ke(a.trim(),o);const c=ut().filter(s=>s.name!==a.trim()&&s.fileName!==t.name);c.unshift({name:a.trim(),type:"local_idb",fileName:t.name,lastUsed:Date.now()}),ft(c),Z(n,i),i&&i(o,a.trim())}catch(o){w(`❌ Lỗi lưu file: ${o.message}`,"#dc3545")}}function Z(t,n,i=null){let e=t.querySelector(".vnpt-template-manager-inner"),a,o;if(e)a=e.querySelector(".vnpt-local-list-container"),o=e.querySelector(".vnpt-btn-wrap");else{t.innerHTML="",e=document.createElement("div"),e.className="vnpt-template-manager-inner";const s=document.createElement("div");s.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const p=document.createElement("span");p.className="vnpt-title-main",p.style.cssText="font-size:11px;font-weight:700;color:#444;",o=document.createElement("div"),o.className="vnpt-btn-wrap",o.style.cssText="display:flex;gap:4px;",s.appendChild(p),s.appendChild(o),e.appendChild(s),a=document.createElement("div"),a.className="vnpt-local-list-container",a.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",e.appendChild(a),t.appendChild(e)}const r=ut(),c=e.querySelector(".vnpt-title-main");c.innerHTML="Templates"+(i?` <span style="color:#2e7d32;">(Đang dùng: ${i})</span>`:""),r.length===0?a.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':a.innerHTML="",r.forEach((s,p)=>{const l=document.createElement("div");l.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",l.title=s.fileName||s.url||s.name,l.tabIndex=0,l.onfocus=()=>l.style.boxShadow="0 0 0 2px #28a745",l.onblur=()=>l.style.boxShadow="none";const m=s.type==="local"||s.type==="local_base64"||s.type==="local_idb"?"OFF":"ON",x=m==="OFF"?"#6c757d":"#28a745",b=document.createElement("span");b.textContent=m,b.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${x};color:#fff;`;const g=document.createElement("span");g.textContent=s.name,g.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",l.onclick=()=>{l.focus(),Ne(s,n,i,t)},l.appendChild(b),l.appendChild(g);const u=document.createElement("button");u.innerHTML="✎",u.title="Đổi tên template",u.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",u.onclick=y=>{y.stopPropagation();const v=prompt("Đổi tên template:",s.name);if(v&&v.trim()&&v.trim()!==s.name){const C=ut();C[p].name=v.trim(),ft(C),Z(t,n,i)}},l.appendChild(u);const f=document.createElement("button");f.innerHTML="✕",f.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",f.onclick=async y=>{if(y.stopPropagation(),confirm(`Xoá biểu mẫu "${s.name}"?`)){const v=ut();v.splice(p,1),ft(v),s.type==="local_idb"&&await Ee(s.name).catch(()=>null),Z(t,n,i===s.name?null:i)}},l.appendChild(f),a.appendChild(l)})}function Ne(t,n,i,e){const a=ut(),o=a.find(r=>r.name===t.name&&(r.url===t.url||r.type===t.type));if(o&&(o.lastUsed=Date.now(),ft(a)),t.type==="local_idb"){Ce(t.name).then(r=>{if(!r)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");n&&n(r,t.name),Z(e,n,t.name)}).catch(r=>{w(`❌ Lỗi nạp File IDB: ${r.message}`,"#dc3545")});return}if(t.type==="local_base64"&&t.data){try{const r=window.atob(t.data.split(",")[1]),c=r.length,s=new Uint8Array(c);for(let p=0;p<c;p++)s[p]=r.charCodeAt(p);n&&n(s.buffer,t.name),Z(e,n,t.name)}catch(r){w(`❌ Lỗi nạp Base64: ${r.message}`,"#dc3545")}return}Se(t.url).then(r=>{n&&n(r,t.name),Z(e,n,t.name)}).catch(r=>{w(`❌ ${r.message}`,"#dc3545")})}function De(t,n){if(t.length===0)return n.length;if(n.length===0)return t.length;const i=[];for(let e=0;e<=n.length;e++)i[e]=[e];for(let e=0;e<=t.length;e++)i[0][e]=e;for(let e=1;e<=n.length;e++)for(let a=1;a<=t.length;a++)n.charAt(e-1)===t.charAt(a-1)?i[e][a]=i[e-1][a-1]:i[e][a]=Math.min(i[e-1][a-1]+1,i[e][a-1]+1,i[e-1][a]+1);return i[n.length][t.length]}function Ie(t,n){let i=t,e=n;t.length<n.length&&(i=n,e=t);const a=i.length;return a===0?1:(a-De(i,e))/parseFloat(a)}function Be(t,n,i=.7){let e=null,a=-1;const o=t.toLowerCase().trim();for(const r of n){const c=r.toLowerCase().trim(),s=Ie(o,c);s>a&&s>=i&&(a=s,e=r)}return e}function Ae(t){if(!t)return"";let n=t.replace(/\D/g,"");return n.startsWith("84")&&(n="0"+n.slice(2)),n}function Me(t){if(!t)return"";const n=t.split(/[-/]/);if(n.length===3){let i,e,a;return n[0].length===4?[a,e,i]=n:[i,e,a]=n,`${i.padStart(2,"0")}/${e.padStart(2,"0")}/${a}`}return t}let N={byId:new Map,byName:new Map,byPlaceholder:new Map,byLabel:new Map,allInputs:[]};function Vt(){DOMCache.clear(),N.byId.clear(),N.byName.clear(),N.byPlaceholder.clear(),N.byLabel.clear(),N.allInputs=[]}function jt(){return LabelCache=Array.from(document.querySelectorAll("label, .label, .label-text, span.title, .form-label")),lastLabelUpdate=Date.now(),LabelCache}function He(){const t=performance.now();Vt();const n=Array.from(document.querySelectorAll("input, textarea, select"));N.allInputs=n,n.forEach(a=>{a.id&&N.byId.set(a.id,a),a.name&&N.byName.set(a.name,a);const o=a.getAttribute("placeholder");o&&N.byPlaceholder.set(o.trim(),a);const r=a.getAttribute("formcontrolname");r&&N.byName.set(r,a)});const i=jt();i.forEach(a=>{const o=a.innerText.trim();if(!o)return;let r=null;if(a.htmlFor&&(r=document.getElementById(a.htmlFor)),!r){let c=a.parentElement,s=0;for(;c&&s<2&&(r=c.querySelector("input, textarea, select"),!r);)c=c.parentElement,s++}r&&N.byLabel.set(o,r)});const e=performance.now();console.debug(`[DOM] Build map in ${(e-t).toFixed(2)}ms for ${n.length} inputs and ${i.length} labels.`)}function Oe(t){t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}))}function gt(t,n){var a;const i=t.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,e=(a=Object.getOwnPropertyDescriptor(i,"value"))==null?void 0:a.set;e?e.call(t,n):t.value=n,Oe(t)}function at(t,n=null){if(!t&&!n)return null;if(t){let e=N.byId.get(t)||N.byName.get(t)||N.byPlaceholder.get(t);if(e&&document.contains(e))return e}if(n){let e=N.byLabel.get(n);if(e&&document.contains(e))return e}if(t){const e=document.getElementById(t);if(e&&["INPUT","TEXTAREA","SELECT"].includes(e.tagName))return e;const a=`input[id="${t}"], textarea[id="${t}"], select[id="${t}"], input[name="${t}"], textarea[name="${t}"], [placeholder="${t}"]`,o=document.querySelector(a);if(o)return o}const i=n||t;if(i&&i.length>2){const e=Array.from(N.byLabel.keys());e.length===0&&LabelCache.length>0&&e.push(...LabelCache.map(o=>o.innerText.trim()).filter(o=>o.length>0));const a=Be(i,e,.82);if(a)return N.byLabel.get(a)||null}return null}function Ht(t){return at(null,t)}function tt(t,n,i=null){const e=at(t,i);e&&gt(e,n)}function _e(t=new Date){return String(t.getDate()).padStart(2,"0")}function Pe(t=new Date){return String(t.getMonth()+1).padStart(2,"0")}function Ke(t=new Date){return String(t.getFullYear())}function Yt(){const t=new Date;return{ngay:_e(t),thang:Pe(t),nam:Ke(t)}}const{ngay:Xt,thang:Wt,nam:Jt}=Yt(),_={"ngayKy, ngayKy1":{label:"Ngày ký",value:Xt},"thangKy, thangKy1":{label:"Tháng ký",value:Wt},"namKy, namKy1":{label:"Năm ký",value:Jt},"ngayTiepNhan, ngayThangNamKy":{label:"Ngày ký (full)",value:`${Xt}/${Wt}/${Jt}`},tenDoanhNghiepB:{label:"Tên doanh nghiệp B",value:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM"},diaChiB:{label:"Địa chỉ B",value:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội"},maSoThueB:{label:"Mã số thuế B",value:"0100686223"},stkB:{label:"Số tài khoản B",value:"1600114156"},diaChiStkB:{label:"Ngân hàng/Địa chỉ STK B",value:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)"},"tenB, nguoiDaiDienB, tenDaiDienB":{label:"Người đại diện B",value:"Phạm Khánh Chung"},"chucVuB, chucVuDaiDienB":{label:"Chức vụ B",value:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp"},"giayUyQuyenSoB, soGiayUyQuyenB":{label:"Giấy ủy quyền số B",value:"2628/GUQ-VNPT-HNI-VP"},"giayUyQuyenNgayB, ngayGiayUyQuyenB":{label:"Giấy ủy quyền ngày B",value:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},GiayUyQuyenB:{label:"Giấy ủy quyền B (full)",value:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},tenDoanhNghiepB1:{label:"Tên doanh nghiệp B (phụ)",value:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},donViTiepNhan:{label:"Đơn vị tiếp nhận",value:"TTKD KHDN"},"tenTiepNhan, tenNguoiNhan":{label:"Người tiếp nhận",value:"Bùi Anh"},dienThoaiB:{label:"Điện thoại B",value:"02436686868"},diaChiTaiKhoanB:{label:"Địa chỉ tài khoản B",value:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 "},noiKy:{label:"Nơi ký",value:"Hà Nội"},emailB:{label:"Email B",value:""},"lienheHopDongB, lienheTuVanB, lienheHoaDonB, sucoCap1B, sucoCap2B, sucoCap3B, sucoCap4B":{label:"Liên hệ B (AM)",value:"AM Bùi Anh"}},Qt={soHopDong:"soHopDong, inputContractGroupName"},Ot={after:["cuocDV","tongCong","tongCongHD","congCA","giaTriHopDong","tongGIaTriHopDong"],before:["donGiaCA","thanhTienCA","tongThanhTien","tongCuocTruocThue"],tax:["tongThueGTGT","tongThue","thueCA","thueVAT"],text:["soTienThanhToanBangChu","tongCongBangChu","tongCongHDbangChu","ghiChuGiaTriHopDong","tongGiaTriHopDongBangChu"]},$e=.08,_t={SCAN:{key:"s",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Quét dữ liệu"},FILL:{key:"f",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Điền Web"},SCAN_PDF:{key:"p",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Scan PDF (AI)"},TOGGLE:{key:"w",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Đóng/Mở Widget"},CLEAN:{key:"d",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Clean Data"}};function Zt(t,n){let i;return function(...a){const o=()=>{clearTimeout(i),t(...a)};clearTimeout(i),i=setTimeout(o,n)}}function te(){const t=h.get(z)??{..._},n=h.get(W)??{},i={...t,...n};Object.keys(i).forEach(e=>{const a=i[e],o=a&&typeof a=="object"&&a.hasOwnProperty("value")?a.value:a;e.split(",").map(c=>c.trim()).filter(c=>c).forEach(c=>{let s=at(c)||Ht(c);s&&gt(s,o)})}),w("✅ Auto fill complete")}function Fe(){let t=h.get(j)??{};const n={...Qt,...t},i=Object.keys(n);if(i.length===0){w("⚠️ No sync mapping","#ffc107");return}i.forEach(e=>{let a=at(e)||Ht(e);a&&a.value!==void 0&&a.value!==""&&n[e].split(",").map(r=>r.trim()).filter(r=>r).forEach(r=>tt(r,a.value))}),w("✅ Sync form complete","#d39e00")}let Pt=!1;const ee=new Map,ze=(t,n)=>{var s;if(Pt)return;let i=h.get(j)??{};const e={...Qt,...i};if(Object.keys(e).length===0)return;let a=t.id,o=t.name,r=null;if(a){const p=document.querySelector(`label[for="${a}"]`);p&&(r=p.textContent.trim())}if(!r){const p=t.closest("label");p&&(r=(s=Array.from(p.childNodes).find(l=>l.nodeType===3))==null?void 0:s.textContent.trim())}let c=e[a]||e[o]||e[r];if(c){Pt=!0;try{c.split(",").map(l=>l.trim()).filter(l=>l).forEach(l=>{if(l!==a&&l!==o&&l!==r){let m=ee.get(l);(!m||!document.contains(m))&&(m=at(l)||Ht(l),m&&ee.set(l,m)),m&&document.activeElement!==m&&gt(m,n)}})}finally{Pt=!1}}},Re=Zt((t,n)=>{ze(t,n)},250);function Ge(){document.addEventListener("input",t=>{const n=t.target;!n||!["INPUT","TEXTAREA"].includes(n.tagName)||n.closest("#vnpt-docx-widget")||n.closest("#vnpt-inline-calc")||Re(n,n.value)})}const qe={async lookupMST(t){if(!t||t.length<10)return null;const n=`https://api.vietqr.io/v2/business/${t}`;try{const e=await(await fetch(n)).json();if(e.code==="00"&&e.data){const{name:a,address:o,representative:r,status:c}=e.data;return{name:a||"",address:o||"",representative:r||"",status:c||""}}return null}catch(i){return console.error("[MST Service] Error fetching MST:",i),null}}};function ne(t){if(!t)return t;const n={};return Object.keys(t).forEach(i=>{const e=t[i];i.split(",").map(o=>o.trim()).filter(o=>o).forEach(o=>{n[o]=e})}),n}function ae(){const t={version:"1.0",timestamp:new Date().toISOString(),backup:{fields:h.get(F),defaultFields:h.get(O),dataDefault:ne(h.get(z)),dataCustom:ne(h.get(W)),dataSync:h.get(j),taxRate:h.get(J),calcMap:h.get(R),templates:h.get(dt)}},n=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),i=URL.createObjectURL(n),e=document.createElement("a");e.href=i,e.download=`vnpt_full_backup_${new Date().toLocaleDateString().replace(/\//g,"-")}.json`,e.click(),URL.revokeObjectURL(i),w("✅ Đã xuất file sao lưu hệ thống.")}async function ie(t){return new Promise(n=>{const i=new FileReader;i.onload=e=>{try{const a=JSON.parse(e.target.result);if(!a.backup)throw new Error("File không đúng định dạng backup.");const o=a.backup;o.fields&&h.set(F,o.fields),o.defaultFields&&h.set(O,o.defaultFields),o.dataDefault&&h.set(z,o.dataDefault),o.dataCustom&&h.set(W,o.dataCustom),o.dataSync&&h.set(j,o.dataSync),o.taxRate&&h.set(J,o.taxRate),o.calcMap&&h.set(R,o.calcMap),o.templates&&h.set(dt,o.templates),w("✅ Đã nhập dữ liệu thành công! Vui lòng tải lại trang hoặc widget.","#1e8e3e"),n(!0)}catch{w("❌ Lỗi: File sao lưu không hợp lệ.","#ff5252"),n(!1)}},i.readAsText(t)})}function oe(t=""){let n=h.get(st);Array.isArray(n)||(n=[]);const i={id:Date.now().toString(),name:t||`Bản sao lưu ${new Date().toLocaleString()}`,timestamp:new Date().toISOString(),data:{fields:h.get(F),defaultFields:h.get(O)}};n.unshift(i);const e=n.slice(0,10);h.set(st,e),console.log(`✅ Field backup created: ${i.name}`)}function re(){const t=h.get(st);return t&&!Array.isArray(t)?(h.remove(st),[]):Array.isArray(t)?t:[]}function Ue(t){const i=re().find(a=>a.id===t);if(!i||!i.data)return w("⚠️ Không tìm thấy bản sao lưu hợp lệ!","#ffc107"),!1;const e=i.data;return e.fields&&h.set(F,e.fields),e.defaultFields&&h.set(O,e.defaultFields),w(`✅ Đã khôi phục các trường: ${i.name}`,"#1e8e3e"),!0}function S(t,n,i=null,e=""){const a=d.fieldsContainer.querySelector(".text-hint");a&&a.remove();const o=d.fieldsContainer.querySelectorAll(".f-key");let r=!1;const c=t.split(",")[0].trim();for(let s of o)if(s.value.split(",")[0].trim()===c){const l=s.closest(".vnpt-field-row"),m=l.querySelector(".f-val"),x=l.querySelector(".f-label");n!==""&&m.value!==n&&document.activeElement!==m&&(m.value=n),i!==null&&i!==""&&x.value!==i&&document.activeElement!==x&&(x.value=i),e!==""&&s.value!==t+", "+e&&document.activeElement!==s&&(s.value=t+", "+e),r=!0;break}if(!r){(i===null||i==="")&&(i=T[t]||"");const s=document.createElement("div");s.className="vnpt-field-row row-item",s.setAttribute("draggable","false");let p=t;e&&(p+=", "+e);const l=c;s.innerHTML=`
            <input type="checkbox" id="chk-${l}" name="chk-${l}" class="row-chk" title="Chọn" style="margin: 0 2px 0 2px;" />
            <input type="text" id="lbl-${l}" name="lbl-${l}" class="f-label" value="${i}" />
            <input type="text" id="key-${l}" name="key-${l}" class="f-key" value="${p}" title="Biến DOCX và IDs đồng bộ" />
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
        `;const m=s.querySelector(".f-val"),x=s.querySelector(".f-key");t==="tenToChuc"&&(m.style.textAlign="right");const b=()=>{lt.includes(c)&&(m.value.trim()?m.classList.remove("field-required-empty"):m.classList.add("field-required-empty"))},g=()=>{const f=m.value;x.value.split(",").map(v=>v.trim()).filter(v=>v).forEach(v=>tt(v,f))};if(x.addEventListener("input",function(){A();const f=this.value.split(",")[0].trim();m.style.textAlign=f==="tenToChuc"?"right":""}),x.addEventListener("change",function(){g()}),s.querySelector(".f-label").addEventListener("input",A),m.addEventListener("input",function(){A(),b()}),m.addEventListener("change",function(){g()}),l==="soDkdn"){const f=s.querySelector(".btn-mst-lookup");f.onclick=async()=>{const y=m.value.trim();if(!y){w("⚠️ Vui lòng nhập mã số thuế","#ffc107");return}f.classList.add("loading");try{const v=await qe.lookupMST(y);v?(m.value=y,S("tenToChuc",v.name),S("diaChi",v.address),v.representative&&S("tenDaiDienn",v.representative),A(),setTimeout(()=>se(),300),w(`✅ Đã tìm thấy: ${v.name}`,"#1a73e8")):w("❌ Không tìm thấy thông tin MST này","#ea4335")}catch{w("❌ Lỗi khi tra cứu MST","#ea4335")}finally{f.classList.remove("loading")}}}b();const u=s.querySelector(".row-drag-handle");u.addEventListener("mouseenter",()=>s.setAttribute("draggable","true")),u.addEventListener("mouseleave",()=>{s.classList.contains("dragging")||s.setAttribute("draggable","false")}),s.addEventListener("dragstart",function(f){d.draggedRowForVNPT=this,f.dataTransfer.effectAllowed="move",f.dataTransfer.setData("text/plain",t),this.classList.add("dragging")}),s.addEventListener("dragover",f=>(f.preventDefault(),!1)),s.addEventListener("dragenter",function(){this.classList.add("over")}),s.addEventListener("dragleave",function(){this.classList.remove("over")}),s.addEventListener("drop",function(f){if(f.stopPropagation(),d.draggedRowForVNPT&&d.draggedRowForVNPT!==this){const y=Array.from(d.fieldsContainer.querySelectorAll(".vnpt-field-row")),v=y.indexOf(d.draggedRowForVNPT),C=y.indexOf(this);v<C?this.parentNode.insertBefore(d.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(d.draggedRowForVNPT,this),A()}return!1}),s.addEventListener("dragend",function(){this.setAttribute("draggable","false"),d.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(f=>{f.classList.remove("over","dragging")}),d.draggedRowForVNPT=null}),d.fieldsContainer.appendChild(s),d.fieldsContainer.scrollTop=d.fieldsContainer.scrollHeight}}function A(){const t=d.isDefaultMode?O:F,n={};d.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(e=>{const o=e.querySelector(".f-key").value.trim().split(",").map(l=>l.trim()).filter(l=>l),r=o[0],c=o.slice(1).join(", "),s=e.querySelector(".f-label").value.trim(),p=e.querySelector(".f-val").value;r&&(n[r]={label:s,value:p,sync:c})}),h.setDebounced(t,n,1e3)}function le(){var e,a;const t=h.get(F)||{},n=((e=t.tenDaiDienn)==null?void 0:e.value)||"",i=((a=t.soHopDong)==null?void 0:a.value)||"";return!n&&!i?`Bản sao lưu ${new Date().toLocaleString()}`:`${n} - ${i}`}function St(){try{d.fieldsContainer.innerHTML="";const n=h.get(F)||{};Object.keys(T).forEach(i=>{const e=T[i],a=n[i];a&&typeof a=="object"?S(i,a.value,a.label||e,a.sync||""):a?S(i,a,e,""):S(i,"",e,"")}),Object.keys(n).forEach(i=>{if(!(i in T)){const e=n[i];typeof e=="object"?S(i,e.value,e.label,e.sync||""):S(i,e,"","")}}),Object.keys(T).length===0&&Object.keys(n).length===0&&(d.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(n){console.error("Error loading config:",n),Object.keys(T).forEach(i=>S(i,"",T[i]))}const t=h.get(vt);t&&d.widget&&(d.widget.style.bottom="auto",t.right?(d.widget.style.right=t.right,d.widget.style.left="auto"):t.left&&(d.widget.style.left=t.left,d.widget.style.right="auto"),t.top&&(d.widget.style.top=t.top))}function Ve(){document.getElementById("vnpt-btn-toggle-id").onclick=()=>d.fieldsContainer.classList.toggle("show-ids");const t=document.getElementById("vnpt-btn-clean-data");t&&(t.onclick=()=>{confirm("Dữ liệu hiện tại sẽ được Xóa. Bạn có muốn SAO LƯU nhanh trước khi làm sạch không?")&&(oe(le()),h.remove(F),h.remove(R),h.remove(J),document.querySelectorAll("input[data-clink]").forEach(i=>{const e=i.dataset.clink;i.value=(Ot[e]||[]).join(", ")}),d.isDefaultMode?(h.remove(O),Kt(!0)):St(),w("🧹 Đã làm sạch toàn bộ dữ liệu & cấu hình","#1a73e8"))}),setTimeout(()=>{const i=document.getElementById("vnpt-btn-restore-last"),e=document.getElementById("vnpt-backup-history");i&&e?(H.info("🔄 Restore button found and bound."),i.onclick=a=>{a.preventDefault(),a.stopPropagation(),e.classList.contains("show")?e.classList.remove("show"):(e.classList.add("show"),n(e),H.debug("✨ Backup history displayed."))},document.addEventListener("click",a=>{e.classList.contains("show")&&!e.contains(a.target)&&!i.contains(a.target)&&e.classList.remove("show")})):H.error("❌ Fix UI: Could not find Restore button or History list container.")},500);function n(i){const e=re();if(H.debug("📋 Rendering backups count:",e.length),i.innerHTML="",e.length===0){i.innerHTML='<div class="backup-history-empty">Chưa có bản sao lưu nào. Hãy thử Clean Data để tạo bản mới!</div>';return}e.forEach(a=>{const o=document.createElement("div");o.className="backup-history-item";const r=new Date(a.id*1).toLocaleString();o.innerHTML=`
                <div class="backup-history-name" title="${a.name}">${a.name}</div>
                <div class="backup-history-time">${r}</div>
            `,o.onclick=c=>{var s;c.stopPropagation(),confirm(`Bạn có chắc muốn khôi phục dữ liệu từ bản: 
${a.name}?`)&&Ue(a.id)&&(i.classList.remove("show"),d.isDefaultMode?(s=document.getElementById("vnpt-btn-default"))==null||s.click():St())},i.appendChild(o)})}document.getElementById("vnpt-btn-default").onclick=()=>{d.isDefaultMode=!d.isDefaultMode},d.on("isDefaultMode",i=>Kt(i)),document.getElementById("vnpt-btn-reset-default").onclick=()=>{confirm("Khôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?")&&(h.remove(O),h.remove(R),h.remove(J),d.isDefaultMode&&(Kt(!0),w("🔄 Đã khôi phục dữ liệu gốc","#1a73e8")))},document.getElementById("vnpt-btn-batch-del").onclick=()=>{const i=d.fieldsContainer.querySelectorAll(".vnpt-field-row");let e=0;i.forEach(a=>{var o;(o=a.querySelector(".row-chk"))!=null&&o.checked&&(a.remove(),e++)}),e===0?confirm("Xóa TOÀN BỘ dữ liệu các trường? Hệ thống sẽ tự động SAO LƯU bản hiện tại.")&&(oe(le()),i.forEach(a=>a.remove()),w("🗑️ Đã xóa toàn bộ","#ff5252"),A()):(w(`🗑️ Đã xóa ${e} trường`,"#ff5252"),A())},document.getElementById("vnpt-btn-add").onclick=()=>{const i=d.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;S("bien_moi_"+i,"","",""),A()},document.getElementById("vnpt-btn-fill-back").onclick=()=>{se()}}function se(){te();let t=0;d.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(n=>{const i=n.querySelector(".f-key").value.trim(),e=n.querySelector(".f-val").value;i.split(",").map(a=>a.trim()).filter(Boolean).forEach(a=>{(document.getElementById(a)||document.getElementsByName(a)[0])&&(tt(a,e),t++)})}),t>0?w(`✅ Đã đồng bộ ${t} trường lên web`,"#198754"):w("⚠️ Không có trường nào để đồng bộ","#ffc107")}function Kt(t){const n=document.getElementById("vnpt-btn-default"),i=document.getElementById("vnpt-btn-reset-default");if(d.fieldsContainer.innerHTML="",d.bannerArea.innerHTML="",t){n.classList.add("active"),n.innerHTML="✅ Chế độ: Dữ liệu mặc định",i&&(i.style.display="flex"),document.getElementById("vnpt-fields-container").classList.add("vnpt-mode-default"),w("📌 Chế độ Dữ liệu mặc định (Có thể sửa)","#ea4335");const e=document.createElement("div");e.className="vnpt-default-banner",e.innerHTML='<span style="color: red;"> LƯU Ý: ĐÂY LÀ DỮ LIỆU MẶC ĐỊNH</span>',d.bannerArea.appendChild(e);const a=h.get(O);a===null?Object.keys(_).forEach(o=>{const r=_[o],c=r&&typeof r=="object"?r.value:r,s=r&&typeof r=="object"?r.label:T[o]||"";S(o,c,s)}):Object.keys(a).forEach(o=>{const r=a[o];S(o,r.value,r.label,r.sync||"")})}else n.classList.remove("active"),n.innerHTML="🛠 Dữ liệu mặc định VNPT",i&&(i.style.display="none"),document.getElementById("vnpt-fields-container").classList.remove("vnpt-mode-default"),w("📋 Đã quay lại Dữ liệu cá nhân"),St()}let $t=!1,it=null,ht=null;function je(){window.addEventListener("keydown",t=>{if($t&&ht){Je(t);return}const n=h.get(pt,_t);for(const[i,e]of Object.entries(n))if(Ye(t,e)){t.preventDefault(),Xe(i);return}})}function Ye(t,n){if(!n||!n.key)return!1;const i=t.key.toLowerCase()===n.key.toLowerCase(),e=!!t.altKey==!!n.altKey,a=!!t.ctrlKey==!!n.ctrlKey,o=!!t.shiftKey==!!n.shiftKey;return i&&e&&a&&o}function Xe(t){var n,i,e,a,o,r,c;switch(t){case"SCAN":(n=document.getElementById("vnpt-btn-scan"))==null||n.click();break;case"FILL":(i=document.getElementById("vnpt-btn-fill-back"))==null||i.click();break;case"SCAN_PDF":(e=document.getElementById("vnpt-btn-scan-pdf"))==null||e.click();break;case"EXPORT_DOCX":(a=document.getElementById("vnpt-btn-export"))==null||a.click();break;case"COPY_TXT":(o=document.getElementById("vnpt-btn-export-txt"))==null||o.click();break;case"TOGGLE":(r=document.getElementById("vnpt-toggle-btn"))==null||r.click();break;case"CLEAN":(c=document.getElementById("vnpt-btn-clean-data"))==null||c.click();break}}function We(t,n){$t=!0,it=t,ht=n,w("Vui lòng nhấn tổ hợp phím mong muốn...","info")}function Je(t){var a;if(["Alt","Control","Shift","Meta"].includes(t.key))return;t.preventDefault(),t.stopPropagation();const n={key:t.key.toLowerCase(),altKey:t.altKey,ctrlKey:t.ctrlKey,shiftKey:t.shiftKey},i=h.get(pt,_t);i[it]={...i[it],...n},h.set(pt,i);const e=((a=i[it])==null?void 0:a.label)||it;w(`Đã lưu phím tắt cho ${e}: ${Ft(n)}`,"success"),ht&&ht(n),$t=!1,it=null,ht=null}function Ft(t){if(!t||!t.key)return"Chưa gán";const n=[];t.ctrlKey&&n.push("Ctrl"),t.altKey&&n.push("Alt"),t.shiftKey&&n.push("Shift");let i=t.key.toUpperCase();return i===" "&&(i="Space"),n.push(i),n.join(" + ")}async function ce({apiKey:t,model:n,systemInstruction:i,userText:e,fileData:a}){return new Promise((o,r)=>{if(!t)return r("Vui lòng nhập API Key Gemini trong Cài đặt.");const c=`https://generativelanguage.googleapis.com/v1beta/models/${n}:generateContent?key=${t}`,s={system_instruction:{parts:[{text:i}]},contents:[{parts:[{text:e}]}],generation_config:{response_mime_type:"application/json"}};a&&a.base64&&s.contents[0].parts.push({inline_data:{mime_type:a.mimeType,data:a.base64}});const p=l=>{if(l)try{let m=l.replace(/```json/g,"").replace(/```/g,"").trim();o(JSON.parse(m))}catch(m){console.error("Lỗi parse JSON từ Gemini",m,l),r("AI trả về kết quả không đúng cấu hình JSON.")}else r("AI không trả về kết quả hợp lệ.")};typeof GM_xmlhttpRequest<"u"?GM_xmlhttpRequest({method:"POST",url:c,headers:{"Content-Type":"application/json"},data:JSON.stringify(s),timeout:3e4,onload:l=>{var m,x,b,g,u;if(l.status>=200&&l.status<300)try{const f=JSON.parse(l.responseText),y=(u=(g=(b=(x=(m=f==null?void 0:f.candidates)==null?void 0:m[0])==null?void 0:x.content)==null?void 0:b.parts)==null?void 0:g[0])==null?void 0:u.text;p(y)}catch{r("Lỗi Parse kết quả từ Gemini API.")}else r(`API Gemini lỗi (${l.status}): ${l.responseText}`)},ontimeout:()=>r("Quá hạn thời gian gọi API (30s)"),onerror:l=>r("Lỗi kết nối đến Google Gemini API.")}):fetch(c,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)}).then(l=>l.json()).then(l=>{var x,b,g,u,f;if(l.error)return r(l.error.message);const m=(f=(u=(g=(b=(x=l==null?void 0:l.candidates)==null?void 0:x[0])==null?void 0:b.content)==null?void 0:g.parts)==null?void 0:u[0])==null?void 0:f.text;p(m)}).catch(l=>r(l.message))})}async function Qe(t,n){if(!t)throw new Error("Vui lòng nhập API Key.");const i={contents:[{parts:[{text:"Ping"}]}],generation_config:{max_output_tokens:5,response_mime_type:"text/plain"}},e=`https://generativelanguage.googleapis.com/v1beta/models/${n}:generateContent?key=${t}`;return new Promise((a,o)=>{const r=c=>{var s;try{return((s=JSON.parse(c).error)==null?void 0:s.message)||c}catch{return c}};typeof GM_xmlhttpRequest<"u"?GM_xmlhttpRequest({method:"POST",url:e,headers:{"Content-Type":"application/json"},data:JSON.stringify(i),timeout:1e4,onload:c=>{if(c.status>=200&&c.status<300)a(!0);else{const s=r(c.responseText);o(`API Error ${c.status}: ${s}`)}},onerror:c=>o("Lỗi kết nối mạng hoặc CORS."),ontimeout:()=>o("Hết thời gian chờ (10s).")}):fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)}).then(async c=>{if(c.ok)return a(!0);const s=await c.text();o(`API Error ${c.status}: ${r(s)}`)}).catch(c=>o(c.message))})}function Ze(){const t=document.getElementById("vnpt-docx-widget")||document.createElement("div");t.id="vnpt-docx-widget";const n=h.get(xt)===!0;t.innerHTML=`
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
                                    <button class="util-item" id="vnpt-btn-default">🛠 Dữ liệu mặc định VNPT</button>
                                    <button class="util-item danger" id="vnpt-btn-reset-default" style="display: none;">🔄 Khôi phục dữ liệu gốc</button>
                                    <button class="util-item" id="vnpt-btn-clean-data">🧹 Clean Data (Về mặc định)</button>


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
    `,document.body.appendChild(t),d.widget=t,d.panel=document.getElementById("vnpt-export-panel"),d.toggleBtn=document.getElementById("vnpt-toggle-btn"),d.header=document.getElementById("vnpt-panel-header"),d.bannerArea=document.getElementById("vnpt-banner-area"),d.fieldsContainer=document.getElementById("vnpt-fields-list");try{const u=h.get(yt);u&&u.width&&u.height&&(d.panel.style.width=u.width+"px",d.panel.style.height=u.height+"px")}catch(u){console.error("Lỗi load size panel:",u)}new ResizeObserver(u=>{if(d.panel.style.display!=="none")for(let f of u){const{width:y,height:v}=f.contentRect;y>0&&v>0&&h.setDebounced(yt,{width:Math.round(y+20),height:Math.round(v+20)},1e3)}}).observe(d.panel),d.panelBody=document.getElementById("vnpt-panel-body"),Z(document.getElementById("vnpt-template-manager"),(u,f)=>{d.templateBuffer=u,d.templateName=f}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const u=this.files&&this.files[0];if(!u)return;const f=document.getElementById("vnpt-template-manager");Le(u,f,(y,v)=>{d.templateBuffer=y,d.templateName=v}),this.value=""}),d.toggleBtn.addEventListener("click",u=>{d.hasDragged||(d.panel.style.display==="none"?(d.panel.style.display="flex",d.toggleBtn.className="btn-opened",d.toggleBtn.innerHTML="✖",h.set(xt,!0)):(d.panel.style.display="none",d.toggleBtn.className="btn-closed",d.toggleBtn.innerHTML="📄",h.set(xt,!1)))});const e=document.getElementById("vnpt-btn-more"),a=document.getElementById("vnpt-util-menu"),o={S:{width:"380px",height:"420px"},M:{width:"460px",height:"600px"},L:{width:"620px",height:"800px"},Full:{width:"98vw",height:"92vh"}},r=h.get(R)||{};a.querySelectorAll("input[data-clink]").forEach(u=>{const f=u.dataset.clink,y=r[f]||Ot[f]||[];u.value=y.join(", "),u.onchange=()=>{const v=h.get(R)||{};v[f]=u.value.split(",").map(C=>C.trim()).filter(C=>C),h.set(R,v)}});const c=document.getElementById("vnpt-gemini-key"),s=document.getElementById("vnpt-gemini-model");c&&s&&Promise.resolve().then(()=>xe).then(({SK_GEMINI_KEY:u,SK_GEMINI_MODEL:f})=>{c.value=h.get(u)||"",s.value=h.get(f)||"gemini-2.0-flash",c.onchange=()=>{h.set(u,c.value.trim())},s.onchange=()=>{h.set(f,s.value)};const y=document.getElementById("vnpt-btn-test-gemini");y&&(y.onclick=async()=>{const v=c.value.trim(),C=s.value;if(!v){w("⚠️ Vui lòng nhập API Key trước khi thử","#ffc107");return}y.disabled=!0,y.textContent="⏳ Đang thử...";try{await Qe(v,C),w("✅ Kết nối tới Gemini thành công!","#1e8e3e")}catch(L){w("❌ Kết nối thất bại: "+L,"#ea4335")}finally{y.disabled=!1,y.textContent="⚡ Kiểm tra kết nối"}})}),document.getElementById("vnpt-btn-export-json").onclick=()=>ae();const p=document.getElementById("vnpt-txt-toggle"),l=document.getElementById("vnpt-txt-body");p&&l&&p.addEventListener("click",u=>{u.stopPropagation();const f=l.style.display==="none";l.style.display=f?"":"none",p.textContent=f?"▲":"▶"});const m=document.getElementById("vnpt-btn-import-json"),x=document.getElementById("vnpt-file-import-json");m.onclick=()=>x.click(),x.onchange=async u=>{u.target.files.length>0&&await ie(u.target.files[0])&&setTimeout(()=>location.reload(),1500)},e.addEventListener("click",u=>{u.stopPropagation();const f=a.classList.toggle("show");e.classList.toggle("active",f)}),a.addEventListener("click",u=>{u.stopPropagation()}),document.addEventListener("click",u=>{a.classList.contains("show")&&(a.classList.remove("show"),e.classList.remove("active"))}),a.querySelectorAll(".size-options button").forEach(u=>{u.addEventListener("click",f=>{const y=f.target.getAttribute("data-size"),v=o[y];v&&(d.panel.style.width=v.width,d.panel.style.height=v.height),a.classList.remove("show"),e.classList.remove("active")})});function b(){const u=document.getElementById("vnpt-hotkey-list");if(!u)return;const f=h.get(pt,_t);u.innerHTML="",Object.entries(f).forEach(([y,v])=>{const C=document.createElement("div");C.className="vnpt-hotkey-row",C.innerHTML=`
                <span class="vnpt-hotkey-label">${v.label||y}</span>
                <button class="vnpt-hotkey-btn" data-action="${y}">${Ft(v)}</button>
            `;const L=C.querySelector(".vnpt-hotkey-btn");L.onclick=q=>{q.stopPropagation(),!L.classList.contains("recording")&&(L.classList.add("recording"),L.textContent="Bấm phím...",We(y,B=>{L.classList.remove("recording"),L.textContent=Ft(B)}))},u.appendChild(C)})}b(),d.panel.querySelectorAll(".vnpt-resizer").forEach(u=>{u.addEventListener("mousedown",f=>{f.preventDefault(),f.stopPropagation();const y=f.clientX,v=f.clientY,C=d.panel.offsetWidth,L=d.panel.offsetHeight,q=d.widget.getBoundingClientRect(),B=q.top;window.innerWidth-q.right,d.panel.classList.add("vnpt-resizing"),document.body.classList.add("vnpt-resizing-global");const k=window.getComputedStyle(u).cursor;document.body.style.cursor=k;const M=E=>{const D=E.clientX-y,P=E.clientY-v;if(u.classList.contains("br"))d.panel.style.width=Math.max(360,C+D)+"px",d.panel.style.height=Math.max(250,L+P)+"px";else if(u.classList.contains("bl")){const I=C-D;I>360&&(d.panel.style.width=I+"px"),d.panel.style.height=Math.max(250,L+P)+"px"}else if(u.classList.contains("tr")){d.panel.style.width=Math.max(360,C+D)+"px";const I=L-P;I>250&&(d.panel.style.height=I+"px",d.widget.style.top=B+P+"px")}else if(u.classList.contains("tl")){const I=C-D,et=L-P;I>360&&(d.panel.style.width=I+"px"),et>250&&(d.panel.style.height=et+"px",d.widget.style.top=B+P+"px")}},U=()=>{window.removeEventListener("mousemove",M),window.removeEventListener("mouseup",U),d.panel.classList.remove("vnpt-resizing"),document.body.classList.remove("vnpt-resizing-global"),document.body.style.cursor="";const E=d.widget.id==="vnpt-docx-widget";h.setDebounced(vt,{right:E?d.widget.style.right:void 0,top:d.widget.style.top,x:E?void 0:parseFloat(d.widget.style.left),y:parseFloat(d.widget.style.top)},500),h.setDebounced(yt,{width:d.panel.offsetWidth,height:d.panel.offsetHeight},500)};window.addEventListener("mousemove",M),window.addEventListener("mouseup",U)})})}function de(t,n,i,e=null,a=null){let o=!1,r=0,c=0,s=0,p=0,l=!1;const m=5;function x(g){l!==g&&(l=g,a&&a(g))}function b(g){if(g.button!==0||["INPUT","BUTTON","SELECT","TEXTAREA"].includes(g.target.tagName)||g.target.isContentEditable)return;o=!0,d.hasDragged=!1,s=g.clientX,p=g.clientY;const f=t.getBoundingClientRect();r=g.clientX-f.left,c=g.clientY-f.top,document.body.style.userSelect="none",n&&n.forEach(y=>y.style.cursor="grabbing"),e&&e(),g.preventDefault()}return n.forEach(g=>{g.addEventListener("mousedown",b)}),document.addEventListener("mousemove",function(g){if(!o)return;if(!d.hasDragged)if(Math.sqrt(Math.pow(g.clientX-s,2)+Math.pow(g.clientY-p,2))>m)d.hasDragged=!0;else return;let u=g.clientX-r,f=g.clientY-c;const y=window.innerWidth,v=window.innerHeight,C=document.getElementById("vnpt-toggle-btn"),L=C?C.offsetWidth:40,q=C?C.offsetHeight:40,B=t.id==="vnpt-docx-widget";let k=t.offsetWidth||0;if(B){let E=L+6-k,D=y-k+6;u<E&&(u=E),u>D&&(u=D)}else k=k||200,u<0&&(u=0),u+k>y&&(u=Math.max(0,y-k));let M=l;if(B?M=!1:l?g.clientY<v-40&&(M=!1):g.clientY>v-10&&(M=!0),f<0&&(f=0),M)x(!0),t.style.top=v-t.offsetHeight+"px",B?(t.style.right=y-u-k+"px",t.style.left="auto"):(t.style.left=u+"px",t.style.right="auto"),t.style.bottom="auto";else{x(!1);let U=t.offsetHeight||40,E;if(B)E=10+q;else{const D=t.querySelector(".cw-title-bar");E=D?D.offsetHeight:U}f+E>v&&(f=Math.max(0,v-E)),t.style.top=f+"px",B?(t.style.right=y-u-k+"px",t.style.left="auto"):(t.style.left=u+"px",t.style.right="auto"),t.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(o){if(o=!1,document.body.style.userSelect="",n&&n.forEach(g=>g.style.cursor="grab"),i){const g=t.id==="vnpt-docx-widget";h.set(i,{left:g?void 0:t.style.left,right:g?t.style.right:void 0,top:t.style.top,x:g?void 0:parseFloat(t.style.left),y:parseFloat(t.style.top),docked:l})}setTimeout(()=>{d.hasDragged=!1},100)}}),{isDocked:()=>l,setDocked:x}}function tn(){d.widget&&d.header&&(de(d.widget,[d.header],vt),window.addEventListener("resize",()=>{const t=window.innerWidth,n=window.innerHeight,i=document.getElementById("vnpt-toggle-btn"),e=i?i.offsetWidth:40,a=i?i.offsetHeight:40;let o=d.widget.getBoundingClientRect(),r=o.left,c=o.top,s=d.widget.offsetWidth||0,l=e+6-s,m=t-s+6;r<l&&(r=l),r>m&&(r=m),c+10+a>n&&(c=Math.max(0,n-(10+a))),d.widget.style.right=t-r-s+"px",d.widget.style.top=c+"px"}))}function pe(t){const n=t.toLowerCase(),{ngay:i,thang:e,nam:a}=Yt(),o=`${i}/${e}/${a}`;return{"ngayky, ngayky1":i,ngayky:i,"thangky, thangky1":e,thangky:e,"namky, namky1":a,namky:a,"ngaytiepnhan, ngaythangnamky":o,ngaytiepnhan:o,ngaythangnamky:o,soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[n]||""}function en(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){if(d.isDefaultMode){Object.keys(_).forEach(n=>{S(n,_[n],T[n]||"")}),A(),w("Đã nạp lại dữ liệu mặc định từ hệ thống.");return}let t=0;He(),Object.keys(T).forEach(n=>{var r;const i=T[n],e=n.split(",")[0].trim(),a=at(e,i);let o="";a&&(o=a.tagName.toLowerCase()==="select"?((r=a.options[a.selectedIndex])==null?void 0:r.text)||"":a.value,t++),o||(o=pe(n)),o&&typeof o=="string"&&(["sdt"].includes(e)?o=Ae(o):["ngaySinhCustomer","ngayCapCustomer","ngayCapSoDkdnCustomer","ngayKy","ngayTiepNhan"].includes(e)&&(o=Me(o))),S(n,o,null)}),A(),t>0?(this.style.background="#1e8e3e",this.style.color="#fff",this.innerText="Đã quét xong",setTimeout(()=>{this.style.background="",this.style.color="",this.innerText="Quét dữ liệu"},1e3)):w("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(t){if(!(t.target.closest("#vnpt-docx-widget")||t.target.closest("#vnpt-inline-calc"))&&t.target&&t.target.id){const n=Object.keys(T).find(i=>i.split(",").map(e=>e.trim()).includes(t.target.id));n!==void 0&&(S(n,t.target.value,null),A())}}),document.addEventListener("change",function(t){var n;if(!(t.target.closest("#vnpt-docx-widget")||t.target.closest("#vnpt-inline-calc"))&&t.target&&t.target.id){const i=Object.keys(T).find(e=>e.split(",").map(a=>a.trim()).includes(t.target.id));if(i!==void 0){let e=t.target.tagName.toLowerCase()==="select"?((n=t.target.options[t.target.selectedIndex])==null?void 0:n.text)||"":t.target.value;S(i,e,null),A()}}})}const nn={local:{download(t,n="arraybuffer"){return new Promise((i,e)=>{const a=new FileReader;switch(a.onload=o=>{let r=o.target.result;n==="base64"&&typeof r=="string"&&(r=r.split(",")[1]||r),i(r)},a.onerror=o=>e(o),n.toLowerCase()){case"arraybuffer":a.readAsArrayBuffer(t);break;case"base64":case"dataurl":a.readAsDataURL(t);break;case"text":a.readAsText(t);break;default:e(new Error(`Unsupported read type: ${n}`))}})},async upload(t){return this.download(t,"base64")}}},an={getAdapter(t){const n=nn[t];if(!n)throw new Error(`Storage adapter not found: ${t}`);return n},async upload(t,n,i={}){return await this.getAdapter(t).upload(n,i)},async download(t,n,i={}){return await this.getAdapter(t).download(n,i.type||"arraybuffer")}};function ue(t,n,i){try{let e;try{e=new window.PizZip(t)}catch(s){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(s);return}const a=new window.docxtemplater(e,{paragraphLoop:!0,linebreaks:!0});a.render(n);const o=a.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",compression:"DEFLATE",compressionOptions:{level:9}}),r=URL.createObjectURL(o),c=document.createElement("a");c.href=r,c.download=i,document.body.appendChild(c),c.click(),setTimeout(()=>{document.body.removeChild(c),URL.revokeObjectURL(r)},100)}catch(e){let a=e.message;e.properties&&e.properties.errors instanceof Array?a=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+e.properties.errors.map(r=>"- "+(r.properties.explanation||r.message)).join(`
`):a="Lỗi phần mềm Word sinh ra: "+a,alert(a),console.error("DocX Error:",e)}}function on(t,n){const i=t.replace(/@(\w+)/g,(e,a)=>n[a]!==void 0?n[a]:e);navigator.clipboard.writeText(i).then(()=>{alert("✅ Đã sao chép nội dung vào Clipboard!")}).catch(e=>{console.error("Lỗi khi copy:",e),alert("❌ Lỗi khi sao chép vào Clipboard. Vui lòng thử lại!")})}function rn(){const t=document.getElementById("vnpt-export-filename");t&&t.addEventListener("input",()=>{t.dataset.userEdited="1",t.value.trim()||(t.dataset.userEdited="0")});function n(){if(!t||t.dataset.userEdited==="1")return;let a="";if(d.fieldsContainer&&d.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(l=>{const x=l.querySelector(".f-key").value.trim().split(",")[0].trim(),b=l.querySelector(".f-val").value.trim();x==="tenToChuc"&&(a=b)}),!a){const p=document.getElementById("tenToChuc");p&&(a=p.tagName.toLowerCase()==="textarea"||p.tagName.toLowerCase()==="input"?p.value.trim():p.innerText.trim())}function o(p){if(!p)return"";let l=p;return l=l.replace(/Tổng công ty/gi,""),l=l.replace(/Công ty/gi,""),l=l.replace(/\bCty\b/gi,""),l=l.replace(/Trách nhiệm hữu hạn/gi,""),l=l.replace(/\bTNHH\b/gi,""),l=l.replace(/Cổ phần/gi,""),l=l.replace(/\bCP\b/gi,""),l=l.replace(/Một thành viên/gi,""),l=l.replace(/\bMTV\b/gi,""),l=l.replace(/Chi nhánh/gi,""),l=l.replace(/Việt Nam/gi,"VN"),l=l.replace(/Viet Nam/gi,"VN"),l=l.replace(/\s+/g," ").trim(),l=l.replace(/^[-,\s]+|[-,\s]+$/g,""),l.length>50&&(l=l.substring(0,47)+"..."),l.replace(/[<>:"/\\|?*]/g,"")}let r=o(a),c=d.templateName?d.templateName.replace(/\.docx$/i,""):"",s=[];c&&s.push(c),r&&s.push(r),s.length>0?t.value=s.join(" - ")+".docx":t.value||(t.value="Export_Auto.docx")}setInterval(n,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const a={};if(d.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(p=>{const m=p.querySelector(".f-key").value.trim().split(",")[0].trim(),x=p.querySelector(".f-val").value;m&&(a[m]=x)}),Object.keys(a).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}const r=[];if(lt.forEach(p=>{if(!a[p]||!a[p].trim()){const l=T[p]||p;r.push(l)}}),r.length>0){const p=`Cảnh báo: Bạn còn các trường sau chưa điền dữ liệu:

- ${r.join(`
- `)}

Bạn có chắc chắn muốn tiếp tục xuất file không?`;if(!confirm(p))return}let c=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(c.toLowerCase().endsWith(".docx")||(c+=".docx"),d.templateBuffer){ue(d.templateBuffer,a,c);return}const s=document.getElementById("vnpt-template-file");if(s.files&&s.files.length>0){an.download("local",s.files[0],{type:"arraybuffer"}).then(p=>ue(p,a,c)).catch(p=>alert(`Lỗi đọc file: ${p.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')});const i=document.getElementById("vnpt-btn-export-txt"),e=document.getElementById("vnpt-txt-template");if(e){const a=h.get(Bt);a&&(e.value=a),e.addEventListener("input",()=>{h.setDebounced(Bt,e.value,800)})}i&&i.addEventListener("click",()=>{const a=e?e.value:"";if(!a.trim()){alert(`Bạn chưa nhập nội dung Text Template!

Sử dụng @key làm placeholder, ví dụ: Tôi là @tenDaiDienn`);return}const o={};if(d.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(c=>{const p=c.querySelector(".f-key").value.trim().split(",")[0].trim(),l=c.querySelector(".f-val").value;p&&(o[p]=l)}),Object.keys(o).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}on(a,o)})}const ln=["chucVu","noiCap","noiCapSoDkdn","ngayky","ngayky1","thangky","namky","thangky1","namky1","noiKy"],sn=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function cn(){function t(){ln.forEach(e=>{const a=document.getElementById(e);a&&!a.dataset.filled&&(a.dataset.filled="1",gt(a,pe(e)))}),sn.forEach(e=>{const a=document.getElementById(e.src),o=document.getElementById(e.target);a&&o&&!a.dataset.bound&&(a.dataset.bound="1",a.addEventListener("change",()=>gt(o,a.value)))})}let n;new MutationObserver(e=>{e.some(o=>o.addedNodes.length>0?Array.from(o.addedNodes).some(c=>c.nodeType!==1?!1:["INPUT","TEXTAREA","SELECT"].includes(c.tagName)?!0:c.querySelector&&c.querySelector("input, textarea, select")):!1)&&(clearTimeout(n),n=setTimeout(t,200))}).observe(document.body,{childList:!0,subtree:!0}),t()}const dn=()=>{let t="";for(const[n,i]of Object.entries(T)){const e=n.split(",")[0].trim();lt.includes(e)&&(t+=`"${e}": "${i}",
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
`};function pn(t,n,i="gemini-2.0-flash"){return ce({apiKey:n,model:i,systemInstruction:dn(),userText:"Đọc file hợp đồng này và trích xuất thành JSON.",fileData:{mimeType:"application/pdf",base64:t}})}function un(t){return new Promise((n,i)=>{const e=new FileReader;e.onload=()=>{const a=e.result.split(",")[1];n(a)},e.onerror=a=>i(a),e.readAsDataURL(t)})}function fe(){let t=document.getElementById("vnpt-pdf-loader");t||(t=document.createElement("div"),t.id="vnpt-pdf-loader",t.className="vnpt-pdf-overlay",t.innerHTML=`
            <div class="vnpt-pdf-loading-box">
                <div class="loader-spinner"></div>
                <div style="margin-top: 15px; font-weight: 800; font-size: 13px; color: #1a73e8;">Đang nhờ AI đọc Hợp đồng...</div>
                <div style="margin-top: 4px; font-size: 11px; color: #5f6368;">Tùy thuộc độ lớn file, thường mất 5 - 10s...</div>
            </div>
        `,document.body.appendChild(t)),t.style.display="flex"}function Lt(){const t=document.getElementById("vnpt-pdf-loader");t&&(t.style.display="none")}function ge(t,n){let i=document.getElementById("vnpt-pdf-dialog");i&&i.remove(),i=document.createElement("div"),i.id="vnpt-pdf-dialog",i.className="vnpt-pdf-overlay";const e=t.map((s,p)=>`
        <tr class="pdf-row-auto">
            <td style="text-align: center;">
                <input type="checkbox" class="pdf-row-chk" data-index="${p}" checked />
            </td>
            <td><strong>${s.key}</strong></td>
            <td><div style="max-height: 40px; overflow-y: auto; color: #1a73e8; font-weight: 600;">${s.value}</div></td>
        </tr>
    `).join("");i.innerHTML=`
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
    `,document.body.appendChild(i);const a=i.querySelector("#pdf-btn-cancel"),o=i.querySelector("#pdf-btn-confirm"),r=i.querySelector("#pdf-check-all"),c=i.querySelectorAll(".pdf-row-chk");r.addEventListener("change",s=>{c.forEach(p=>p.checked=s.target.checked)}),a.onclick=()=>{i.remove()},o.onclick=()=>{const s=[];c.forEach(p=>{if(p.checked){const l=parseInt(p.getAttribute("data-index"));s.push(t[l])}}),i.remove(),n(s)}}function fn(){const t=document.getElementById("vnpt-btn-scan-pdf"),n=document.getElementById("vnpt-pdf-input");!t||!n||(t.addEventListener("click",i=>{if(i.preventDefault(),!h.get(Ct)){navigator.clipboard.writeText("https://github.com/tranchien2000/vnpt-tampermonkey-vite/blob/main/docs/GEMINI_API_GUIDE.md").then(()=>{w("Đã copy link hướng dẫn cài đặt API Key vào bộ nhớ tạm","#f44336")}).catch(o=>{console.error("Không thể copy link:",o),alert("Công cụ chưa được cài đặt API Key!")});return}n.click()}),n.addEventListener("change",async i=>{const e=i.target.files[0];e&&(i.target.value="",await gn(e))}))}async function gn(t){const n=h.get(Ct),i=h.get(At)||"gemini-2.5-flash";if(!n){confirm(`Chưa cài đặt Gemini API Key!

AI Scanner (PDF) yêu cầu cần có mã Google AI Studio cấp phát Miễn phí.

Nhấn 'OK' để xem hướng dẫn tự tạo mã Key nhé!`)&&window.open("https://github.com/tranchien2000/vnpt-tampermonkey-vite/blob/main/docs/GEMINI_API_GUIDE.md","_blank");return}try{fe();const e=await un(t),a=await pn(e,n,i);Lt();const o=Object.keys(a).map(r=>({key:r,value:a[r],label:a[r]===""?"(Trống)":a[r]})).filter(r=>r.value!=="");if(o.length===0){alert("Rất tiếc! AI không tìm thấy trường thông tin nào thỏa mãn (Bên A).");return}ge(o,r=>{r.forEach(c=>{S(c.key,c.value,`AI: ${c.key}`)}),A(),console.log(`✅ [OCR Pdf] Đã điền thành công ${r.length} trường.`)})}catch(e){Lt(),console.error("Lỗi PDF Scan Pipeline:",e);let a=e;typeof e=="string"&&(e.includes("Quota exceeded")||e.includes("limit: 0"))&&(a=`⚠️ Hết hạn mức hoặc Mô hình không khả dụng (Quota Exceeded)!

Mô hình bạn chọn có thể chưa hỗ trợ tại vùng của bạn hoặc bạn đã dùng hết lượt gọi miễn phí.

QUYẾT : Hãy mở menu ⚙️ (Thiết lập), đổi sang 'Gemini 1.5 Flash' hoặc 'Gemini 2.0 Flash' để tiếp tục.`),alert(`Lỗi xử lý quét File:
`+a)}}function hn(t){if(!t)return{};const n={},i=t.match(/(?:Tên công ty viết bằng tiếng Việt|Tên tổ chức):?\s*([\s\S]+?)(?=\n|Tên công ty|$)/i);i&&(n.tenToChuc=i[1].trim());const e=t.match(/(?:Mã số doanh nghiệp|Mã số thuế):?\s*(\d{10,13})/i);e&&(n.soDkdn=e[1].trim());let a=t.match(/(?:Họ và tên|Tên đại diện|Người đại diện theo pháp luật):?\s*([\s\S]+?)(?=\n|Chức vụ|Chức danh|Giới tính|Sinh ngày|$)/i);if(a){let g=a[1].trim();g=g.replace(/^(?:Họ và tên|Tên đại diện|Người đại diện theo pháp luật):?\s*/i,""),n.tenDaiDienn=g.toUpperCase()}const o=t.match(/(?:Chức danh|Chức vụ):?\s*([\s\S]+?)(?=\n|Sinh ngày|$)/i);o&&(n.chucVu=o[1].trim());const r=t.match(/(?:Đăng ký|Đảng kỷ) lần đầu:?\s*ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i);r&&(n.ngayCapSoDkdnCustomer=`${r[1].padStart(2,"0")}/${r[2].padStart(2,"0")}/${r[3]}`);const c=t.match(/(?:Điện thoại|SĐT):?\s*([\d\s.-]{9,15})/i);c&&(n.sdt=c[1].replace(/[\s.-]/g,"").trim());const s=t.match(/(?:Thư điện tử|Email):?\s*([^\s\n]+)/i);s&&(n.emailDaiDien=s[1].replace(/\(a\)/g,"@").trim());const p=t.match(/(?:Địa chỉ trụ sở chính|Địa chỉ liên lạc|Nơi thường trú|Nơi ở hiện nay):?\s*([\s\S]+?)(?=\n|Điện thoại|Thư điện tử|Mã số thuế|$)/i);p&&(n.diaChi=p[1].trim().replace(/\s+/g," "));const l=t.match(/(?:Số định danh cá nhân|Số CMND|Số CCCD|Số Hộ chiếu):?\s*(\d{9,12})/i);l&&(n.cmnd=l[1].trim());const m=t.match(/(?:Nơi cấp):?\s*([\s\S]+?)(?=\n|$)/i);m&&(n.noiCap=m[1].trim());const x=t.match(/(?:Ngày cấp):?\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/i);x&&(n.ngayCapCustomer=`${x[1].padStart(2,"0")}/${x[2].padStart(2,"0")}/${x[3]}`);const b=t.match(/(?:Ngày, tháng, năm sinh|Sinh ngày):?\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/i);if(b)n.ngaySinhCustomer=`${b[1].padStart(2,"0")}/${b[2].padStart(2,"0")}/${b[3]}`;else{const g=t.match(/(?:Ngày, tháng, năm sinh|Sinh ngày):?\s*ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i);g&&(n.ngaySinhCustomer=`${g[1].padStart(2,"0")}/${g[2].padStart(2,"0")}/${g[3]}`)}return n}const mn=()=>{let t="";for(const[n,i]of Object.entries(T)){const e=n.split(",")[0].trim();lt.includes(e)&&(t+=`"${e}": "${i}",
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
- Bỏ qua các dữ liệu rác không liên quan.`};async function bn(t,n,i="gemini-2.0-flash"){if(!t||!t.trim())throw new Error("Vui lòng nhập nội dung văn bản cần phân loại.");return ce({apiKey:n,model:i,systemInstruction:mn(),userText:`Hãy phân loại thông tin từ đoạn văn bản sau đây: 

${t}`})}function vn(t){if(!t||!t.trim())throw new Error("Vui lòng nhập nội dung văn bản cần phân loại.");return hn(t)}function yn(){const t=document.getElementById("vnpt-btn-scan-raw"),n=document.getElementById("vnpt-raw-scan-section"),i=document.getElementById("vnpt-btn-raw-process"),e=document.getElementById("vnpt-btn-raw-process-local"),a=document.getElementById("vnpt-raw-scan-input");if(!t||!n||!i||!a)return;t.addEventListener("click",r=>{r.preventDefault();const c=n.style.display==="none";n.style.display=c?"flex":"none",t.classList.toggle("active",c),c&&a.focus()});const o=(r,c,s)=>{const p=Object.keys(r).map(m=>({key:m,value:r[m],label:`${c}: ${m}`})).filter(m=>m.value!==""&&m.value!==null);if(p.length===0){alert(c==="AI"?"AI không tìm thấy thông tin hợp lệ nào.":"Không tìm thấy thông tin phù hợp theo mẫu trích xuất Local.");return}ge(p,m=>{m.forEach(x=>{S(x.key,x.value,x.label)}),A(),w(`✅ Đã nạp ${m.length} trường từ văn bản thô.`),n.style.display="none",t.classList.remove("active"),a.value=""});const l=document.querySelector("#vnpt-pdf-dialog h3");l&&(l.textContent=s)};e&&e.addEventListener("click",()=>{const r=a.value.trim();if(!r){w("⚠️ Vui lòng nhập nội dung văn bản!","#ffc107");return}try{const c=vn(r);o(c,"Local","PHÂN LOẠI DỮ LIỆU THÔ (LOCAL)")}catch(c){w("❌ Lỗi: "+c.message,"#f44336")}}),i.addEventListener("click",async()=>{const r=a.value.trim();if(!r){w("⚠️ Vui lòng nhập nội dung văn bản!","#ffc107");return}const c=h.get(Ct),s=h.get(At)||"gemini-2.0-flash";if(!c){w("⚠️ Chưa cài đặt API Key Gemini!","#f44336");return}try{fe();const p=await bn(r,c,s);Lt(),o(p,"AI","PHÂN LOẠI DỮ LIỆU THÔ (AI)")}catch(p){Lt(),console.error("Raw Scan AI Error:",p),alert("Lỗi AI: "+p)}})}function ot(t,n=null){return h.get(t,n)}function Nt(t,n){h.set(t,n)}function he(t,n){if(!n||n.replace(/\D/g,"").length<6)return;let i=ot(t,[]);i=i.filter(e=>e!==n),i.unshift(n),Nt(t,i.slice(0,10))}function Dt(t,n){const i=document.getElementById(n);i&&(i.innerHTML=ot(t,[]).map(e=>`<option value="${e}">`).join(""))}function zt(t){return t.toLocaleString("en-US")}function Rt(t){return Number(String(t).replace(/[^\d]/g,""))||0}function xn(t){return t.charAt(0).toUpperCase()+t.slice(1)}const mt=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function wn(t){let n=Math.floor(t/100),i=Math.floor(t%100/10),e=t%10,a="";return n>0&&(a+=mt[n]+" trăm ",i===0&&e>0&&(a+="lẻ ")),i>1?(a+=mt[i]+" mươi ",e===1?a+="mốt":e===5?a+="lăm":e>0&&(a+=mt[e])):i===1?(a+="mười ",e===5?a+="lăm":e>0&&(a+=mt[e])):e>0&&(n>0&&(a+="lẻ "),a+=mt[e]),a.trim()}function kn(t){if(t===0)return"không";const n=["","nghìn","triệu","tỷ"];let i="",e=0;for(;t>0;){const a=t%1e3;a>0&&(i=wn(a)+" "+n[e]+" "+i),t=Math.floor(t/1e3),e++}return i.trim()}function me(t,n,i){let e=0,a=0,o=0;t==="before"?(e=Rt(n),a=Math.round(e*i),o=e+a):t==="tax"?(a=Rt(n),e=Math.round(a/i),o=e+a):t==="after"&&(o=Rt(n),e=Math.round(o/(1+i)),a=o-e);const r=xn(kn(o))+" đồng";return{beforeNum:e,taxNum:a,afterNum:o,beforeStr:zt(e),taxStr:zt(a),afterStr:zt(o),textStr:r}}function Cn(t,n){n.before&&n.before.forEach(i=>tt(i,t.beforeStr)),n.tax&&n.tax.forEach(i=>tt(i,t.taxStr)),n.after&&n.after.forEach(i=>tt(i,t.afterStr)),n.text&&n.text.forEach(i=>tt(i,t.textStr))}function It(t,n=null){try{const i=localStorage.getItem(t);return i!==null?JSON.parse(i):n}catch{return n}}function G(t,n){localStorage.setItem(t,JSON.stringify(n))}function En(t,n,i,e){let a=It(nt)??"custom",o=It(z)??{..._},r=It(W)??{},c=It(j)??{};const s=document.createElement("div");s.className="cw-tab-header";const p={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};p.custom.innerText="📋 Custom",p.custom.className="cw-tab cw-tab-custom",p.default.innerText="📌 Default",p.default.className="cw-tab cw-tab-default",p.sync.innerText="🔗 Sync",p.sync.className="cw-tab cw-tab-sync";function l(){Object.values(p).forEach(k=>k.classList.remove("active")),p[a].classList.add("active")}l();const m=document.createElement("div");m.style.display=e.data?"none":"block";const x=n("📋 Cấu hình Data","data",k=>{m.style.display=k?"none":"block",i(t)}),b=document.createElement("div");b.className="cw-data-body";function g(){b.innerHTML="";let k=a==="sync"?c:a==="custom"?r:o,M=a==="sync"?j:a==="custom"?W:z;const U=Object.keys(k);U.length===0&&a!=="default"&&(b.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),U.forEach(E=>{const D=document.createElement("div");D.className="cw-data-row";let P=a!=="default";const I=k[E],et=I&&typeof I=="object"&&I.hasOwnProperty("value"),be=et?I.value:I,qt=et&&I.label||E,K=document.createElement("input");K.type="text",K.value=qt,K.id=`df-key-${E}`,K.name=`df-key-${E}`,K.className="cw-data-key"+(P?" mutable":""),K.title=E,K.readOnly=!P,P&&(K.onchange=()=>{const $=K.value.trim();if(!$||$===E){K.value=qt;return}et?k[$]={...I,label:$}:k[$]=be,delete k[E],G(M,k),g()});const V=document.createElement("input");if(V.type="text",V.value=be??"",V.id=`df-val-${E}`,V.name=`df-val-${E}`,V.className="cw-data-val",V.oninput=()=>{et?k[E]={...I,value:V.value}:k[E]=V.value,G(M,k)},D.appendChild(K),D.appendChild(V),P){const $=document.createElement("button");$.innerHTML="✕",$.className="cw-del-btn",$.onclick=()=>{confirm(`Delete "${qt}"?`)&&(delete k[E],G(M,k),g())},D.appendChild($)}else D.appendChild(document.createElement("div")).className="cw-pad";b.appendChild(D)})}p.custom.onclick=()=>{a="custom",G(nt,"custom"),l(),g()},p.default.onclick=()=>{a="default",G(nt,"default"),l(),g()},p.sync.onclick=()=>{a="sync",G(nt,"sync"),l(),g()};const u=document.createElement("button");u.innerText="📤",u.className="cw-icon-btn",u.title="Sao lưu toàn bộ dữ liệu ra JSON",u.onclick=()=>ae();const f=document.createElement("button");f.innerText="📥",f.className="cw-icon-btn",f.title="Khôi phục dữ liệu từ JSON";const y=document.createElement("input");y.type="file",y.accept=".json",y.style.display="none",y.onchange=async k=>{k.target.files.length>0&&await ie(k.target.files[0])&&setTimeout(()=>location.reload(),1500)},f.onclick=()=>y.click(),m.appendChild(s),s.appendChild(p.custom),s.appendChild(p.default),s.appendChild(p.sync),m.appendChild(b),t.appendChild(x),t.appendChild(m);const v=t.querySelector("#vnpt-cw-fill"),C=t.querySelector("#vnpt-cw-sync"),L=t.querySelector("#vnpt-cw-add"),q=t.querySelector("#vnpt-cw-reset");v&&(v.onclick=te),C&&(C.onclick=Fe),L&&(L.onclick=()=>{a==="default"&&(a="custom",G(nt,"custom"),l());let k=a==="sync"?c:r,M="new_field_"+Date.now();k[M]="",G(a==="sync"?j:W,k),g(),b.scrollTop=b.scrollHeight}),q&&(q.onclick=()=>{confirm("Reset Default Data?")&&(o={..._},G(z,o),g())}),g();const B=x.querySelector(".cw-right-wrap")||document.createElement("div");B.className="cw-right-wrap",B.prepend(u),B.prepend(f),B.appendChild(y),x.appendChild(B)}function Tn(t,n,i){let e=Number(localStorage.getItem(J))||$e,a=ot(ct)??{calc:!1,data:!0};function o(b,g){const u=document.createElement("button");return u.innerText=b,u.className="cw-action-btn "+g,u}function r(b,g,u){const f=document.createElement("div");f.className="wg-sec-header";const y=document.createElement("span");y.innerText=b;const v=document.createElement("button");return v.className="wg-toggle-btn",v.innerText=a[g]?"▾":"▴",f.appendChild(y),f.appendChild(v),v.onclick=()=>{a[g]=!a[g],v.innerText=a[g]?"▾":"▴",Nt(ct,a),u(a[g])},f}function c(b){const g=window.innerWidth,u=window.innerHeight,f=b.getBoundingClientRect();b.style.left=Math.min(Math.max(parseFloat(b.style.left),0),g-f.width)+"px",b.style.top=Math.min(Math.max(parseFloat(b.style.top),0),u-36)+"px"}const s=document.createElement("div");if(!n){s.className="cw-title-bar",s.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const b=document.createElement("div");b.className="cw-btn-group";const g={fill:o("Fill","cw-btn-fill"),sync:o("Sync","cw-btn-sync"),add:o("Add","cw-btn-add"),reset:o("↺","cw-btn-reset")};g.reset.title="Reset Default fields",Object.values(g).forEach(u=>b.appendChild(u)),s.appendChild(b),t.appendChild(s)}const p=document.createElement("div");p.className="cw-body-inline",p.innerHTML=`
    <div class="cw-inline-row">
        <input id="wg-before" name="wg-before" class="cw-input-inline" placeholder="Trước thuế" list="wg-before-list" title="Trước thuế">
        <datalist id="wg-before-list"></datalist>
        <div class="cw-tax-group-inline"><input id="wg-taxRate" name="wg-taxRate" class="cw-tax-input-inline" title="Thuế (%)"><span class="cw-tax-symbol">%</span></div>
        <input id="wg-tax" name="wg-tax" class="cw-input-inline" placeholder="Tiền thuế" title="Tiền thuế">
        <input id="wg-after" name="wg-after" class="cw-input-inline" placeholder="Sau thuế" list="wg-after-list" title="Sau thuế">
        <datalist id="wg-after-list"></datalist>
        <input id="wg-text" name="wg-text" class="cw-input-inline cw-input-readonly-inline" placeholder="Bằng chữ" readonly title="Bằng chữ">
    </div>`,n?n.appendChild(p):t.appendChild(p),n||En(t,r,c,a);const l={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text")};l.taxRate.value=e*100,Dt(wt,"wg-before-list"),Dt(kt,"wg-after-list");function m(b,g){const u=me(b,g,e);return l.before.value=u.beforeStr,l.tax.value=u.taxStr,l.after.value=u.afterStr,l.text.value=u.textStr,u}function x(b,g){const u=me(b,g,e),f=ot(R)||{...Ot};Cn(u,f)}if(l.taxRate.oninput=()=>{e=Number(l.taxRate.value)/100||0,Nt(J,e),m("before",l.before.value)},l.taxRate.onchange=()=>{x("before",l.before.value)},l.before.oninput=()=>{m("before",l.before.value)},l.before.onchange=()=>{x("before",l.before.value),he(wt,l.before.value),Dt(wt,"wg-before-list")},l.tax.oninput=()=>{m("tax",l.tax.value)},l.tax.onchange=()=>{x("tax",l.tax.value)},l.after.oninput=()=>{m("after",l.after.value)},l.after.onchange=()=>{x("after",l.after.value),he(kt,l.after.value),Dt(kt,"wg-after-list")},[l.before,l.tax,l.after,l.text].forEach(b=>{["click","focus"].forEach(g=>b.addEventListener(g,()=>{if(!b.value)return;navigator.clipboard.writeText(b.value);const u=b.style.backgroundColor;b.style.backgroundColor="#d1e7dd",setTimeout(()=>b.style.backgroundColor=u,300)}))}),!n){const b=Array.from(t.children).filter(f=>f!==s),g=de(t,[s],i,null,f=>{b.forEach(y=>y.style.display=f?"none":""),s.style.borderRadius=f?"8px":"0",f&&(t.style.top=window.innerHeight-(s.offsetHeight||34)+"px")}),u=ot(i);return u&&u.docked&&g.setDocked(!0),window.addEventListener("resize",()=>{g.isDocked()?t.style.top=window.innerHeight-s.offsetHeight+"px":c(t)}),g}return null}function Sn(){const t=document.getElementById("vnpt-inline-calc"),n=document.getElementById("vnpt-btn-calc-toggle");let i=d.calcWidget||document.createElement("div");if(!t&&!d.calcWidget?(i.id="vnpt-calc-widget",document.body.appendChild(i),d.calcWidget=i):t&&(i=d.widget),t&&n){let e=ot(ct)??{calc:!1,data:!0};const a=o=>{t.style.display=o?"none":"block",n.classList.toggle("active",!o)};a(e.calc),n.onclick=()=>{e.calc=!e.calc,Nt(ct,e),a(e.calc)}}return Tn(i,t,Ut)}function Ln(){let t=!1;try{t=!1}catch{t=!1}t&&H.info("[Migration] Dev mode active - Syncing configurations...");let n=h.get(z);if(n){let e=!1;Object.keys(_).forEach(a=>{const o=_[a];if(!(a in n))n[a]=o,e=!0;else if(t){const r=n[a],c=o&&typeof o=="object",s=r&&typeof r=="object";let p=!1;!c&&!s?p=r!==o:c&&s?p=r.value!==o.value||r.label!==o.label:p=!0,p&&(n[a]=o,e=!0)}}),e&&h.set(z,n)}let i=h.get(O);if(i){let e=!1;Object.keys(_).forEach(a=>{const o=_[a],r=o&&typeof o=="object"?o.value:o,c=o&&typeof o=="object"?o.label:T[a]||"";if(!(a in i))i[a]={label:c,value:r,sync:""},e=!0;else if(t){const s=i[a];(s.value!==r||s.label!==c)&&(i[a]={label:c,value:r,sync:s.sync||""},e=!0)}}),e&&h.setDebounced(O,i,0)}}let bt=null;function Gt(){if(!window.__vnptInited){window.__vnptInited=!0,H.info("Initializing VNPT Userscript..."),Ln();try{ve(),Ze(),Sn(),tn(),Ve(),St(),en(),rn(),cn(),fn(),yn(),Ge(),je();const t=Zt(()=>{Vt(),jt(),H.debug("DOM Cache & Labels refreshed due to mutations")},1500);bt=new MutationObserver(n=>{n.some(e=>e.addedNodes.length>0||e.removedNodes.length>0?[...e.addedNodes,...e.removedNodes].some(o=>o.nodeType===1&&!["SCRIPT","STYLE","LINK"].includes(o.tagName)):!1)&&t()}),bt.observe(document.body,{childList:!0,subtree:!0}),H.info("Userscript initialized successfully.")}catch(t){H.error("Error during userscript initialization:",t)}}}function Nn(){H.info("Cleaning up VNPT Userscript for reload..."),bt&&(bt.disconnect(),bt=null);const t=document.getElementById("vnpt-docx-widget");t&&t.remove();const n=document.getElementById("vnpt-calc-widget");n&&n.remove();const i=document.getElementById("vnpt-styles");i&&i.remove(),window.__vnptInited=!1,H.info("Cleanup completed.")}window.__vnptCleanup=Nn,window.__vnptInit=Gt,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Gt):Gt()})();
