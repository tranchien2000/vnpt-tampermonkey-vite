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
(function(){"use strict";const O={info:(...t)=>console.log("[Tampermonkey Script] INFO:",...t),error:(...t)=>console.error("[Tampermonkey Script] ERROR:",...t),warn:(...t)=>console.warn("[Tampermonkey Script] WARN:",...t)};function Ie(){const t="vnpt-styles";if(document.getElementById(t))return;const i=document.createElement("style");i.id=t,i.textContent=`
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

    `,document.head.appendChild(i)}const De={widget:null,panel:null,header:null,bannerArea:null,toggleBtn:null,fieldsContainer:null,panelBody:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1,templateBuffer:null,templateName:null,hasDragged:!1,isInspecting:!1},ut=new Map,p=new Proxy(De,{get(t,i){return i==="on"?(o,n)=>{ut.has(o)||ut.set(o,[]),ut.get(o).push(n)}:t[i]},set(t,i,o){const n=t[i];return t[i]=o,n!==o&&ut.has(i)&&ut.get(i).forEach(e=>e(o,n)),!0}}),L={"tenDaiDienn, tenNguoiNhanCTS ":"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH","diaChi, duong, tinhId, tinhIdNew, quanHuyenId, xaPhuongId, phuongXaId":"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT","emailDaiDien, emailNhanCTS":"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Mã số thuế | GPKD",noiCapSoDkdn:"Nơi cấp ĐKDN/QĐTL/GPTL",goiDV:"Gói Dịch Vụ","ngayKy, ngayKy1":"Ngày ký","thangKy, thangKy1":"Tháng Ký","namKy, namKy1":"Năm ký","ngayTiepNhan, ngayThangNamKy":"Ngày tiếp nhận / Ngày tháng năm ký","soHopDong, inputContractGroupName":"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký","lienheHopDongA, lienheTuVanA, lienheHoaDonA, sucoCap1A, sucoCap2A, sucoCap3A, sucoCap4A":"Liên hệ A"},ft=["soHopDong","tenDaiDienn","cmnd","sdt","diaChi","tenToChuc","ngayCapCustomer","emailDaiDien","soDkdn","goiDV","soHopDong"],K="vnpt_docx_fields",H="vnpt_docx_default_fields",Tt="vnpt_docx_position",Et="vnpt_docx_size",St="vnpt_docx_opened",gt="vnpt_docx_auto_backup",V="vnpt_autofill_data_default",nt="vnpt_autofill_data_custom",Y="vnpt_autofill_data_sync",ee="vnpt_widget_pos",st="vnd_tax_rate",Lt="vnd_before_history",Nt="vnd_after_history",ht="vnpt_widget_collapsed",J="vnd_calc_map",lt="vnpt_widget_datatab",mt="vnpt_templates",$t="vnpt_txt_template",It="vnpt_gemini_api_key",Ft="vnpt_gemini_model",bt="vnpt_hotkeys",Ae=Object.freeze(Object.defineProperty({__proto__:null,DEFAULT_LABELS:L,LOCAL_KEY_AUTO_BACKUP:gt,LOCAL_KEY_DEFAULT_FIELDS:H,LOCAL_KEY_FIELDS:K,LOCAL_KEY_OPENED:St,LOCAL_KEY_POS:Tt,LOCAL_KEY_SIZE:Et,REQUIRED_KEYS:ft,SK_CALC_MAP:J,SK_COLLAPSE:ht,SK_DATATAB:lt,SK_DATA_CUS:nt,SK_DATA_DEF:V,SK_DATA_SYNC:Y,SK_GEMINI_KEY:It,SK_GEMINI_MODEL:Ft,SK_HIST_A:Nt,SK_HIST_B:Lt,SK_HOTKEYS:bt,SK_POS_CALC:ee,SK_TAX:st,SK_TEMPLATES:mt,SK_TXT_TEMPLATE:$t},Symbol.toStringTag,{value:"Module"}));let Q=null;function w(t,i="#198754",o=2500){Q||(Q=document.createElement("div"),Q.id="vnpt-toast-container",Object.assign(Q.style,{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column-reverse",alignItems:"center",gap:"8px",zIndex:"1000000",pointerEvents:"none"}),document.body.appendChild(Q));const n=document.createElement("div");n.innerText=t,Object.assign(n.style,{background:i,color:"#fff",padding:"8px 18px",borderRadius:"24px",opacity:"0",transform:"translateY(10px)",transition:"opacity 0.3s, transform 0.3s",fontSize:"13px",fontWeight:"500",fontFamily:"'Segoe UI', Roboto, sans-serif",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",whiteSpace:"nowrap",pointerEvents:"auto"}),Q.appendChild(n),requestAnimationFrame(()=>{n.style.opacity="1",n.style.transform="translateY(0)"}),setTimeout(()=>{n.style.opacity="0",n.style.transform="translateY(-10px)",setTimeout(()=>{n.remove(),Q&&Q.childNodes.length},300)},o)}const Be="vnpt_templates_db",Z="buffers";let Dt=null;function zt(){return Dt?Promise.resolve(Dt):new Promise((t,i)=>{const o=indexedDB.open(Be,1);o.onupgradeneeded=n=>{const e=n.target.result;e.objectStoreNames.contains(Z)||e.createObjectStore(Z)},o.onsuccess=n=>{Dt=n.target.result,t(Dt)},o.onerror=()=>i(o.error)})}async function Me(t,i){const o=await zt();return new Promise((n,e)=>{const l=o.transaction(Z,"readwrite").objectStore(Z).put(i,t);l.onsuccess=()=>n(),l.onerror=()=>e(l.error)})}async function Pe(t){const i=await zt();return new Promise((o,n)=>{const r=i.transaction(Z,"readonly").objectStore(Z).get(t);r.onsuccess=()=>o(r.result),r.onerror=()=>n(r.error)})}async function _e(t){const i=await zt();return new Promise((o,n)=>{const r=i.transaction(Z,"readwrite").objectStore(Z).delete(t);r.onsuccess=()=>o(),r.onerror=()=>n(r.error)})}const it=new Map,At=new Map,h={isGM:typeof GM_setValue<"u"&&typeof GM_getValue<"u",get(t,i=null){if(it.has(t))return it.get(t);try{let o;if(this.isGM?o=GM_getValue(t,null):o=localStorage.getItem(t),o==null)return i;const n=typeof o=="string"?JSON.parse(o):o;return it.set(t,n),n}catch(o){return console.warn(`[Storage] Không thể đọc key "${t}":`,o),i}},set(t,i){it.set(t,i);try{return this.isGM?GM_setValue(t,i):localStorage.setItem(t,JSON.stringify(i)),!0}catch(o){return console.error(`[Storage] Không thể ghi key "${t}":`,o),!1}},setDebounced(t,i,o=500){it.set(t,i),At.has(t)&&clearTimeout(At.get(t));const n=setTimeout(()=>{this.set(t,i),At.delete(t)},o);At.set(t,n)},remove(t){it.delete(t);try{this.isGM?GM_deleteValue(t):localStorage.removeItem(t)}catch(i){console.error(`[Storage] Không thể xóa key "${t}":`,i)}},clearCache(){it.clear()}};function vt(){try{const t=h.get(mt)||[],i=t.filter(o=>o.type!=="local");return i.length!==t.length&&yt(i),i}catch{return[]}}function yt(t){h.set(mt,t)}function He(t){const i=t.match(/drive\.google\.com\/file\/d\/([^/]+)/);return i?`https://drive.google.com/uc?export=download&id=${i[1]}`:t}function Oe(t){return new Promise((i,o)=>{GM_xmlhttpRequest({method:"GET",url:He(t),responseType:"arraybuffer",onload:n=>{if(n.status>=200&&n.status<300){if(n.response&&n.response.byteLength>4){const e=new Uint8Array(n.response.slice(0,4));if(e[0]===80&&e[1]===75&&e[2]===3&&e[3]===4){i(n.response);return}else{o(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}i(n.response)}else o(new Error(`HTTP ${n.status}: Không lấy được file`))},onerror:()=>o(new Error("Không thể tải URL.")),ontimeout:()=>o(new Error("Timeout khi tải URL."))})})}async function Ke(t,i,o){const n=t.name.replace(/\.docx$/i,""),e=prompt("Đặt tên biến nhớ cho file này:",n);if(!(!e||!e.trim()))try{const a=await t.arrayBuffer();await Me(e.trim(),a);const l=vt().filter(c=>c.name!==e.trim()&&c.fileName!==t.name);l.unshift({name:e.trim(),type:"local_idb",fileName:t.name,lastUsed:Date.now()}),yt(l),ot(i,o),o&&o(a,e.trim())}catch(a){w(`❌ Lỗi lưu file: ${a.message}`,"#dc3545")}}function ot(t,i,o=null){let n=t.querySelector(".vnpt-template-manager-inner"),e,a;if(n)e=n.querySelector(".vnpt-local-list-container"),a=n.querySelector(".vnpt-btn-wrap");else{t.innerHTML="",n=document.createElement("div"),n.className="vnpt-template-manager-inner";const c=document.createElement("div");c.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const d=document.createElement("span");d.className="vnpt-title-main",d.style.cssText="font-size:11px;font-weight:700;color:#444;",a=document.createElement("div"),a.className="vnpt-btn-wrap",a.style.cssText="display:flex;gap:4px;",c.appendChild(d),c.appendChild(a),n.appendChild(c),e=document.createElement("div"),e.className="vnpt-local-list-container",e.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",n.appendChild(e),t.appendChild(n)}const r=vt(),l=n.querySelector(".vnpt-title-main");l.innerHTML="Templates"+(o?` <span style="color:#2e7d32;">(Đang dùng: ${o})</span>`:""),r.length===0?e.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':e.innerHTML="",r.forEach((c,d)=>{const s=document.createElement("div");s.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",s.title=c.fileName||c.url||c.name,s.tabIndex=0,s.onfocus=()=>s.style.boxShadow="0 0 0 2px #28a745",s.onblur=()=>s.style.boxShadow="none";const f=c.type==="local"||c.type==="local_base64"||c.type==="local_idb"?"OFF":"ON",x=f==="OFF"?"#6c757d":"#28a745",v=document.createElement("span");v.textContent=f,v.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${x};color:#fff;`;const g=document.createElement("span");g.textContent=c.name,g.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",s.onclick=()=>{s.focus(),$e(c,i,o,t)},s.appendChild(v),s.appendChild(g);const m=document.createElement("button");m.innerHTML="✎",m.title="Đổi tên template",m.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",m.onclick=b=>{b.stopPropagation();const y=prompt("Đổi tên template:",c.name);if(y&&y.trim()&&y.trim()!==c.name){const k=vt();k[d].name=y.trim(),yt(k),ot(t,i,o)}},s.appendChild(m);const u=document.createElement("button");u.innerHTML="✕",u.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",u.onclick=async b=>{if(b.stopPropagation(),confirm(`Xoá biểu mẫu "${c.name}"?`)){const y=vt();y.splice(d,1),yt(y),c.type==="local_idb"&&await _e(c.name).catch(()=>null),ot(t,i,o===c.name?null:o)}},s.appendChild(u),e.appendChild(s)})}function $e(t,i,o,n){const e=vt(),a=e.find(r=>r.name===t.name&&(r.url===t.url||r.type===t.type));if(a&&(a.lastUsed=Date.now(),yt(e)),t.type==="local_idb"){Pe(t.name).then(r=>{if(!r)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");i&&i(r,t.name),ot(n,i,t.name)}).catch(r=>{w(`❌ Lỗi nạp File IDB: ${r.message}`,"#dc3545")});return}if(t.type==="local_base64"&&t.data){try{const r=window.atob(t.data.split(",")[1]),l=r.length,c=new Uint8Array(l);for(let d=0;d<l;d++)c[d]=r.charCodeAt(d);i&&i(c.buffer,t.name),ot(n,i,t.name)}catch(r){w(`❌ Lỗi nạp Base64: ${r.message}`,"#dc3545")}return}Oe(t.url).then(r=>{i&&i(r,t.name),ot(n,i,t.name)}).catch(r=>{w(`❌ ${r.message}`,"#dc3545")})}function Fe(t,i){if(t.length===0)return i.length;if(i.length===0)return t.length;const o=[];for(let n=0;n<=i.length;n++)o[n]=[n];for(let n=0;n<=t.length;n++)o[0][n]=n;for(let n=1;n<=i.length;n++)for(let e=1;e<=t.length;e++)i.charAt(n-1)===t.charAt(e-1)?o[n][e]=o[n-1][e-1]:o[n][e]=Math.min(o[n-1][e-1]+1,o[n][e-1]+1,o[n-1][e]+1);return o[i.length][t.length]}function ze(t,i){let o=t,n=i;t.length<i.length&&(o=i,n=t);const e=o.length;return e===0?1:(e-Fe(o,n))/parseFloat(e)}function Re(t,i,o=.7){let n=null,e=-1;const a=t.toLowerCase().trim();for(const r of i){const l=r.toLowerCase().trim(),c=ze(a,l);c>e&&c>=o&&(e=c,n=r)}return n}function qe(t){if(!t)return"";let i=t.replace(/\D/g,"");return i.startsWith("84")&&(i="0"+i.slice(2)),i}function Ge(t){if(!t)return"";const i=t.split(/[-/]/);if(i.length===3){let o,n,e;return i[0].length===4?[e,n,o]=i:[o,n,e]=i,`${o.padStart(2,"0")}/${n.padStart(2,"0")}/${e}`}return t}let A={byId:new Map,byName:new Map,byPlaceholder:new Map,byLabel:new Map,allInputs:[]},Bt=[];function ne(){A.byId.clear(),A.byName.clear(),A.byPlaceholder.clear(),A.byLabel.clear(),A.allInputs=[]}function ie(){return Bt=Array.from(document.querySelectorAll("label, .label, .label-text, span.title, .form-label")),Bt}function oe(){const t=performance.now();ne();const i=Array.from(document.querySelectorAll("input, textarea, select, ng-select2"));A.allInputs=i,i.forEach(e=>{e.id&&A.byId.set(e.id,e),e.name&&A.byName.set(e.name,e);const a=e.getAttribute("placeholder");a&&A.byPlaceholder.set(a.trim(),e);const r=e.getAttribute("formcontrolname");r&&A.byName.set(r,e)});const o=ie();o.forEach(e=>{const a=e.innerText.trim();if(!a)return;let r=null;if(e.htmlFor&&(r=document.getElementById(e.htmlFor)),!r){let l=e.parentElement,c=0;for(;l&&c<2&&(r=l.querySelector("input, textarea, select"),!r);)l=l.parentElement,c++}r&&A.byLabel.set(a,r)});const n=performance.now();console.debug(`[DOM] Build map in ${(n-t).toFixed(2)}ms for ${i.length} inputs and ${o.length} labels.`)}function Ve(t){t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}))}function ct(t,i){var e;const o=t.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,n=(e=Object.getOwnPropertyDescriptor(o,"value"))==null?void 0:e.set;n?n.call(t,i):t.value=i,Ve(t)}function tt(t,i=null){if(!t&&!i)return null;if(t){let n=A.byId.get(t)||A.byName.get(t)||A.byPlaceholder.get(t);if(n&&document.contains(n))return n}if(i){let n=A.byLabel.get(i);if(n&&document.contains(n))return n}if(t){const n=document.getElementById(t);if(n&&["INPUT","TEXTAREA","SELECT"].includes(n.tagName))return n;const e=`input[id="${t}"], textarea[id="${t}"], select[id="${t}"], input[name="${t}"], textarea[name="${t}"], [placeholder="${t}"]`,a=document.querySelector(e);if(a)return a}const o=i||t;if(o&&o.length>2){const n=Array.from(A.byLabel.keys());n.length===0&&Bt.length>0&&n.push(...Bt.map(a=>a.innerText.trim()).filter(a=>a.length>0));const e=Re(o,n,.82);if(e)return A.byLabel.get(e)||null}return null}function Rt(t){return tt(null,t)}function at(t,i,o=null){const n=tt(t,o);n&&ct(n,i)}function Ue(t=new Date){return String(t.getDate()).padStart(2,"0")}function je(t=new Date){return String(t.getMonth()+1).padStart(2,"0")}function We(t=new Date){return String(t.getFullYear())}function ae(){const t=new Date;return{ngay:Ue(t),thang:je(t),nam:We(t)}}const{ngay:re,thang:se,nam:le}=ae(),F={"ngayKy, ngayKy1":{label:"Ngày ký",value:re},"thangKy, thangKy1":{label:"Tháng ký",value:se},"namKy, namKy1":{label:"Năm ký",value:le},"ngayTiepNhan, ngayThangNamKy":{label:"Ngày ký (full)",value:`${re}/${se}/${le}`},tenDoanhNghiepB:{label:"Tên doanh nghiệp B",value:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM"},diaChiB:{label:"Địa chỉ B",value:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội"},maSoThueB:{label:"Mã số thuế B",value:"0100686223"},stkB:{label:"Số tài khoản B",value:"1600114156"},diaChiStkB:{label:"Ngân hàng/Địa chỉ STK B",value:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)"},"tenB, nguoiDaiDienB, tenDaiDienB":{label:"Người đại diện B",value:"Phạm Khánh Chung"},"chucVuB, chucVuDaiDienB":{label:"Chức vụ B",value:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp"},"giayUyQuyenSoB, soGiayUyQuyenB":{label:"Giấy ủy quyền số B",value:"2628/GUQ-VNPT-HNI-VP"},"giayUyQuyenNgayB, ngayGiayUyQuyenB":{label:"Giấy ủy quyền ngày B",value:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},GiayUyQuyenB:{label:"Giấy ủy quyền B (full)",value:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},tenDoanhNghiepB1:{label:"Tên doanh nghiệp B (phụ)",value:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},donViTiepNhan:{label:"Đơn vị tiếp nhận",value:"TTKD KHDN"},"tenTiepNhan, tenNguoiNhan":{label:"Người tiếp nhận",value:"Bùi Anh"},dienThoaiB:{label:"Điện thoại B",value:"02436686868"},diaChiTaiKhoanB:{label:"Địa chỉ tài khoản B",value:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 "},noiKy:{label:"Nơi ký",value:"Hà Nội"},emailB:{label:"Email B",value:""},"lienheHopDongB, lienheTuVanB, lienheHoaDonB, sucoCap1B, sucoCap2B, sucoCap3B, sucoCap4B":{label:"Liên hệ B (AM)",value:"AM Bùi Anh"}},ce={soHopDong:"soHopDong, inputContractGroupName"},qt={after:["cuocDV","tongCong","tongCongHD","congCA","giaTriHopDong","tongGIaTriHopDong"],before:["donGiaCA","thanhTienCA","tongThanhTien","tongCuocTruocThue"],tax:["tongThueGTGT","tongThue","thueCA","thueVAT"],text:["soTienThanhToanBangChu","tongCongBangChu","tongCongHDbangChu","ghiChuGiaTriHopDong","tongGiaTriHopDongBangChu"]},Xe=.08,Gt={SCAN:{key:"s",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Quét dữ liệu"},FILL:{key:"f",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Điền Web"},SCAN_PDF:{key:"p",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Scan PDF (AI)"},TOGGLE:{key:"w",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Đóng/Mở Widget"},CLEAN:{key:"d",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Dọn dẹp & Reset"}};function de(t,i){let o;return function(...e){const a=()=>{clearTimeout(o),t(...e)};clearTimeout(o),o=setTimeout(a,i)}}function pe(){const t=h.get(V)??{...F},i=h.get(nt)??{},o={...t,...i};Object.keys(o).forEach(n=>{const e=o[n],a=e&&typeof e=="object"&&e.hasOwnProperty("value")?e.value:e;n.split(",").map(l=>l.trim()).filter(l=>l).forEach(l=>{let c=tt(l)||Rt(l);c&&ct(c,a)})}),w("✅ Auto fill complete")}function Ye(){let t=h.get(Y)??{};const i={...ce,...t},o=Object.keys(i);if(o.length===0){w("⚠️ No sync mapping","#ffc107");return}o.forEach(n=>{let e=tt(n)||Rt(n);e&&e.value!==void 0&&e.value!==""&&i[n].split(",").map(r=>r.trim()).filter(r=>r).forEach(r=>at(r,e.value))}),w("✅ Sync form complete","#d39e00")}let Vt=!1;const ue=new Map,Je=(t,i)=>{var c;if(Vt)return;let o=h.get(Y)??{};const n={...ce,...o};if(Object.keys(n).length===0)return;let e=t.id,a=t.name,r=null;if(e){const d=document.querySelector(`label[for="${e}"]`);d&&(r=d.textContent.trim())}if(!r){const d=t.closest("label");d&&(r=(c=Array.from(d.childNodes).find(s=>s.nodeType===3))==null?void 0:c.textContent.trim())}let l=n[e]||n[a]||n[r];if(l){Vt=!0;try{l.split(",").map(s=>s.trim()).filter(s=>s).forEach(s=>{if(s!==e&&s!==a&&s!==r){let f=ue.get(s);(!f||!document.contains(f))&&(f=tt(s)||Rt(s),f&&ue.set(s,f)),f&&document.activeElement!==f&&ct(f,i)}})}finally{Vt=!1}}},Qe=de((t,i)=>{Je(t,i)},250);function Ze(){document.addEventListener("input",t=>{const i=t.target;!i||!["INPUT","TEXTAREA"].includes(i.tagName)||i.closest("#vnpt-docx-widget")||i.closest("#vnpt-inline-calc")||Qe(i,i.value)})}const tn={async lookupMST(t){if(!t||t.length<10)return null;const i=`https://api.vietqr.io/v2/business/${t}`;try{const n=await(await fetch(i)).json();if(n.code==="00"&&n.data){const{name:e,address:a,representative:r,status:l}=n.data;return{name:e||"",address:a||"",representative:r||"",status:l||""}}return null}catch(o){return console.error("[MST Service] Error fetching MST:",o),null}}};function fe(t){if(!t)return t;const i={};return Object.keys(t).forEach(o=>{const n=t[o];o.split(",").map(a=>a.trim()).filter(a=>a).forEach(a=>{i[a]=n})}),i}function Ut(t=""){const i={version:"1.0",timestamp:new Date().toISOString(),backup:{fields:h.get(K),defaultFields:h.get(H),dataDefault:fe(h.get(V)),dataCustom:fe(h.get(nt)),dataSync:h.get(Y),taxRate:h.get(st),calcMap:h.get(J),templates:h.get(mt)}},o=new Blob([JSON.stringify(i,null,2)],{type:"application/json"}),n=URL.createObjectURL(o),e=document.createElement("a");e.href=n;let a=t;a?a.toLowerCase().endsWith(".json")||(a+=".json"):a=`vnpt_full_backup_${new Date().toLocaleDateString().replace(/\//g,"-")}.json`,e.download=a,e.click(),URL.revokeObjectURL(n),w(`✅ Đã xuất file: ${a}`)}async function ge(t){return new Promise(i=>{const o=new FileReader;o.onload=n=>{try{const e=JSON.parse(n.target.result);if(!e.backup)throw new Error("File không đúng định dạng backup.");const a=e.backup;a.fields&&h.set(K,a.fields),a.defaultFields&&h.set(H,a.defaultFields),a.dataDefault&&h.set(V,a.dataDefault),a.dataCustom&&h.set(nt,a.dataCustom),a.dataSync&&h.set(Y,a.dataSync),a.taxRate&&h.set(st,a.taxRate),a.calcMap&&h.set(J,a.calcMap),a.templates&&h.set(mt,a.templates),w("✅ Đã nhập dữ liệu thành công! Vui lòng tải lại trang hoặc widget.","#1e8e3e"),i(!0)}catch{w("❌ Lỗi: File sao lưu không hợp lệ.","#ff5252"),i(!1)}},o.readAsText(t)})}function rt(t=""){let i=h.get(gt);Array.isArray(i)||(i=[]);const o={id:Date.now().toString(),name:t||`Bản sao lưu ${new Date().toLocaleString()}`,timestamp:new Date().toISOString(),data:{fields:h.get(K),defaultFields:h.get(H)}};i.unshift(o);const n=i.slice(0,15);h.set(gt,n),console.log(`✅ Field backup created: ${o.name}`)}function Mt(){var n,e;const t=h.get(K)||{},i=((n=t.tenDaiDienn)==null?void 0:n.value)||"",o=((e=t.soHopDong)==null?void 0:e.value)||"";return!i&&!o?`Quét dữ liệu - ${new Date().toLocaleTimeString()}`:`${i} - ${o}`}function he(){const t=h.get(gt);return t&&!Array.isArray(t)?(h.remove(gt),[]):Array.isArray(t)?t:[]}function en(t){const o=he().find(e=>e.id===t);if(!o||!o.data)return w("⚠️ Không tìm thấy bản sao lưu hợp lệ!","#ffc107"),!1;const n=o.data;return n.fields&&h.set(K,n.fields),n.defaultFields&&h.set(H,n.defaultFields),w(`✅ Đã khôi phục các trường: ${o.name}`,"#1e8e3e"),!0}function I(t,i,o=null,n=""){const e=p.fieldsContainer.querySelector(".text-hint");e&&e.remove();const a=p.fieldsContainer.querySelectorAll(".f-key");let r=!1;const l=t.split(",")[0].trim();for(let c of a)if(c.value.split(",")[0].trim()===l){const s=c.closest(".vnpt-field-row"),f=s.querySelector(".f-val"),x=s.querySelector(".f-label");i!==""&&f.value!==i&&document.activeElement!==f&&(f.value=i),o!==null&&o!==""&&x.value!==o&&document.activeElement!==x&&(x.value=o),n!==""&&c.value!==t+", "+n&&document.activeElement!==c&&(c.value=t+", "+n),r=!0;break}if(!r){(o===null||o==="")&&(o=L[t]||"");const c=document.createElement("div");c.className="vnpt-field-row row-item",c.setAttribute("draggable","false");let d=t;n&&(d+=", "+n);const s=l;c.innerHTML=`
            <input type="checkbox" id="chk-${s}" name="chk-${s}" class="row-chk" title="Chọn" style="margin: 0 2px 0 2px;" />
            <input type="text" id="lbl-${s}" name="lbl-${s}" class="f-label" value="${o}" />
            <input type="text" id="key-${s}" name="key-${s}" class="f-key" value="${d}" title="Biến DOCX và IDs đồng bộ" />
            <span class="row-drag-handle" title="Kéo">=</span>
            ${s==="soDkdn"?`
                <div class="mst-lookup-wrapper">
                    <input type="text" id="val-${s}" name="val-${s}" class="f-val" value="${i}" placeholder="Mã số thuế..." />
                    <button class="btn-mst-lookup" title="Tra cứu Mã số thuế">
                        <span class="icon">🔍</span>
                        <div class="spinner"></div>
                    </button>
                </div>
            `:`
                <input type="text" id="val-${s}" name="val-${s}" class="f-val" value="${i}" />
            `}
        `;const f=c.querySelector(".f-val"),x=c.querySelector(".f-key");t==="tenToChuc"&&(f.style.textAlign="right");const v=()=>{ft.includes(l)&&(f.value.trim()?f.classList.remove("field-required-empty"):f.classList.add("field-required-empty"))},g=()=>{const u=f.value;x.value.split(",").map(y=>y.trim()).filter(y=>y).forEach(y=>at(y,u))};if(x.addEventListener("input",function(){B();const u=this.value.split(",")[0].trim();f.style.textAlign=u==="tenToChuc"?"right":""}),x.addEventListener("change",function(){g()}),c.querySelector(".f-label").addEventListener("input",B),f.addEventListener("input",function(){B(),v()}),f.addEventListener("change",function(){g()}),s==="soDkdn"){const u=c.querySelector(".btn-mst-lookup");u.onclick=async()=>{const b=f.value.trim();if(!b){w("⚠️ Vui lòng nhập mã số thuế","#ffc107");return}u.classList.add("loading");try{const y=await tn.lookupMST(b);y?(f.value=b,I("tenToChuc",y.name),I("diaChi",y.address),y.representative&&I("tenDaiDienn",y.representative),B(),setTimeout(()=>me(),300),w(`✅ Đã tìm thấy: ${y.name}`,"#1a73e8")):w("❌ Không tìm thấy thông tin MST này","#ea4335")}catch{w("❌ Lỗi khi tra cứu MST","#ea4335")}finally{u.classList.remove("loading")}}}v();const m=c.querySelector(".row-drag-handle");m.addEventListener("mouseenter",()=>c.setAttribute("draggable","true")),m.addEventListener("mouseleave",()=>{c.classList.contains("dragging")||c.setAttribute("draggable","false")}),c.addEventListener("dragstart",function(u){p.draggedRowForVNPT=this,u.dataTransfer.effectAllowed="move",u.dataTransfer.setData("text/plain",t),this.classList.add("dragging")}),c.addEventListener("dragover",u=>(u.preventDefault(),!1)),c.addEventListener("dragenter",function(){this.classList.add("over")}),c.addEventListener("dragleave",function(){this.classList.remove("over")}),c.addEventListener("drop",function(u){if(u.stopPropagation(),p.draggedRowForVNPT&&p.draggedRowForVNPT!==this){const b=Array.from(p.fieldsContainer.querySelectorAll(".vnpt-field-row")),y=b.indexOf(p.draggedRowForVNPT),k=b.indexOf(this);y<k?this.parentNode.insertBefore(p.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(p.draggedRowForVNPT,this),B()}return!1}),c.addEventListener("dragend",function(){this.setAttribute("draggable","false"),p.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(u=>{u.classList.remove("over","dragging")}),p.draggedRowForVNPT=null}),p.fieldsContainer.appendChild(c),p.fieldsContainer.scrollTop=p.fieldsContainer.scrollHeight}}function B(){const t=p.isDefaultMode?H:K,i={};p.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(n=>{const a=n.querySelector(".f-key").value.trim().split(",").map(s=>s.trim()).filter(s=>s),r=a[0],l=a.slice(1).join(", "),c=n.querySelector(".f-label").value.trim(),d=n.querySelector(".f-val").value;r&&(i[r]={label:c,value:d,sync:l})}),h.setDebounced(t,i,1e3)}function jt(){var n,e;const t=h.get(p.isDefaultMode?H:K)||{},i=((n=t.tenDaiDienn)==null?void 0:n.value)||"",o=((e=t.soHopDong)==null?void 0:e.value)||"";return!i&&!o?`Bản sao lưu ${new Date().toLocaleString()}`:`${i} - ${o}`}function nn(){var e,a;const t=h.get(p.isDefaultMode?H:K)||{},i=((e=t.soHopDong)==null?void 0:e.value)||"",o=((a=t.tenToChuc)==null?void 0:a.value)||"";if(!i&&!o)return`Backup_VNPT_${new Date().toLocaleDateString().replace(/\//g,"-")}`;const n=[];return i&&n.push(i),o&&n.push(o),n.join(" - ").replace(/[\\/:"*?<>|]/g,"_")}function Pt(){try{p.fieldsContainer.innerHTML="";const i=h.get(K)||{};Object.keys(L).forEach(o=>{const n=L[o],e=i[o];e&&typeof e=="object"?I(o,e.value,e.label||n,e.sync||""):e?I(o,e,n,""):I(o,"",n,"")}),Object.keys(i).forEach(o=>{if(!(o in L)){const n=i[o];typeof n=="object"?I(o,n.value,n.label,n.sync||""):I(o,n,"","")}}),Object.keys(L).length===0&&Object.keys(i).length===0&&(p.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(i){console.error("Error loading config:",i),Object.keys(L).forEach(o=>I(o,"",L[o]))}const t=h.get(Tt);t&&p.widget&&(p.widget.style.bottom="auto",t.right?(p.widget.style.right=t.right,p.widget.style.left="auto"):t.left&&(p.widget.style.left=t.left,p.widget.style.right="auto"),t.top&&(p.widget.style.top=t.top))}function on(){document.getElementById("vnpt-btn-toggle-id").onclick=()=>p.fieldsContainer.classList.toggle("show-ids");const t=document.getElementById("vnpt-btn-clean-data");t&&(t.onclick=()=>{const e=p.isDefaultMode;confirm(e?`BẠN ĐANG Ở CHẾ ĐỘ MẶC ĐỊNH.
Khôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?`:"Dữ liệu hiện tại sẽ được Xóa. Bạn có muốn SAO LƯU nhanh trước khi làm sạch không?")&&(e?(h.remove(H),w("🔄 Đã reset dữ liệu hệ thống VNPT","#1a73e8")):(rt(jt()),h.remove(K),w("🧹 Đã làm sạch dữ liệu cá nhân","#1a73e8")),h.remove(J),h.remove(st),document.querySelectorAll("input[data-clink]").forEach(r=>{const l=r.dataset.clink;r.value=(qt[l]||[]).join(", ")}),e?be(!0):Pt())});const i=document.getElementById("vnpt-btn-restore-last"),o=document.getElementById("vnpt-backup-history");i&&o?(O.info("🔄 Restore button found and bound successfully."),i.onclick=e=>{e.preventDefault(),e.stopPropagation(),o.classList.toggle("show")&&(n(o),O.debug("✨ Backup history displayed."))},document.addEventListener("click",e=>{o.classList.contains("show")&&!o.contains(e.target)&&!i.contains(e.target)&&o.classList.remove("show")})):O.error("❌ Fix UI: Could not find Restore button (#vnpt-btn-restore-last) or History container (#vnpt-backup-history).");function n(e){const a=he();if(O.debug("📋 Rendering backups count:",a.length),e.innerHTML="",a.length===0){e.innerHTML='<div class="backup-history-empty">Chưa có bản sao lưu nào. Hãy thử Clean Data để tạo bản mới!</div>';return}a.forEach(r=>{const l=document.createElement("div");l.className="backup-history-item";const c=new Date(r.id*1).toLocaleString();l.innerHTML=`
                <div class="backup-history-name" title="${r.name}">${r.name}</div>
                <div class="backup-history-time">${c}</div>
            `,l.onclick=d=>{var s;d.stopPropagation(),confirm(`Bạn có chắc muốn khôi phục dữ liệu từ bản: 
${r.name}?`)&&en(r.id)&&(e.classList.remove("show"),p.isDefaultMode?(s=document.getElementById("vnpt-btn-default"))==null||s.click():Pt())},e.appendChild(l)})}document.getElementById("vnpt-btn-default").onclick=()=>{p.isDefaultMode=!p.isDefaultMode},p.on("isDefaultMode",e=>be(e)),document.getElementById("vnpt-btn-batch-del").onclick=e=>{const a=p.fieldsContainer.querySelectorAll(".vnpt-field-row"),r=e.shiftKey;let l=0;if(a.forEach(c=>{var d;if((d=c.querySelector(".row-chk"))!=null&&d.checked){if(r)c.remove();else{const s=c.querySelector(".f-val");s&&(s.value="")}l++}}),l===0){const c=nn();r?confirm(`Xóa TOÀN BỘ hàng dữ liệu?

(Hệ thống sẽ tự động lưu một bản nội bộ để có thể khôi phục).`)&&(rt(jt()),a.forEach(d=>d.remove()),w("🗑️ Đã xóa toàn bộ hàng","#ff5252"),B()):confirm(`Dọn dẹp TOÀN BỘ giá trị và Xuất JSON dự phòng?

File: "${c}.json"

(Hệ thống vẫn tự động lưu một bản nội bộ).`)&&(Ut(c),rt(jt()),a.forEach(d=>{const s=d.querySelector(".f-val");s&&(s.value="")}),w("🧹 Đã lưu JSON & Dọn dẹp giá trị","#1a73e8"),B())}else w(`${r?"🗑️":"🧹"} Đã ${r?"Xóa":"Dọn giá trị"} ${l} trường`,r?"#ff5252":"#1a73e8"),B()},document.getElementById("vnpt-btn-add").onclick=()=>{const e=p.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;I("bien_moi_"+e,"","",""),B()},document.getElementById("vnpt-btn-fill-back").onclick=()=>{me()}}function me(){pe();let t=0;p.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(i=>{const o=i.querySelector(".f-key").value.trim(),n=i.querySelector(".f-val").value;o.split(",").map(e=>e.trim()).filter(Boolean).forEach(e=>{(document.getElementById(e)||document.getElementsByName(e)[0])&&(at(e,n),t++)})}),t>0?w(`✅ Đã đồng bộ ${t} trường lên web`,"#198754"):w("⚠️ Không có trường nào để đồng bộ","#ffc107")}function be(t){const i=document.getElementById("vnpt-btn-default");if(p.fieldsContainer.innerHTML="",p.bannerArea.innerHTML="",t){i.classList.add("active"),i.innerHTML="✅ Chế độ: Dữ liệu mặc định",document.getElementById("vnpt-fields-container").classList.add("vnpt-mode-default"),w("📌 Chế độ Dữ liệu mặc định (Có thể sửa)","#ea4335");const o=document.createElement("div");o.className="vnpt-default-banner",o.innerHTML='<span style="color: red;"> LƯU Ý: ĐÂY LÀ DỮ LIỆU MẶC ĐỊNH</span>',p.bannerArea.appendChild(o);const n=h.get(H);n===null?Object.keys(F).forEach(e=>{const a=F[e],r=a&&typeof a=="object"?a.value:a,l=a&&typeof a=="object"?a.label:L[e]||"";I(e,r,l)}):Object.keys(n).forEach(e=>{const a=n[e];I(e,a.value,a.label,a.sync||"")})}else i.classList.remove("active"),i.innerHTML="🛠 Dữ liệu mặc định VNPT",document.getElementById("vnpt-fields-container").classList.remove("vnpt-mode-default"),w("📋 Đã quay lại Dữ liệu cá nhân"),Pt()}let Wt=!1,dt=null,xt=null;function an(){window.addEventListener("keydown",t=>{if(Wt&&xt){cn(t);return}const i=h.get(bt,Gt);for(const[o,n]of Object.entries(i))if(rn(t,n)){t.preventDefault(),sn(o);return}})}function rn(t,i){if(!i||!i.key)return!1;const o=t.key.toLowerCase()===i.key.toLowerCase(),n=!!t.altKey==!!i.altKey,e=!!t.ctrlKey==!!i.ctrlKey,a=!!t.shiftKey==!!i.shiftKey;return o&&n&&e&&a}function sn(t){var i,o,n,e,a,r,l;switch(t){case"SCAN":(i=document.getElementById("vnpt-btn-scan"))==null||i.click();break;case"FILL":(o=document.getElementById("vnpt-btn-fill-back"))==null||o.click();break;case"SCAN_PDF":(n=document.getElementById("vnpt-btn-scan-pdf"))==null||n.click();break;case"EXPORT_DOCX":(e=document.getElementById("vnpt-btn-export"))==null||e.click();break;case"COPY_TXT":(a=document.getElementById("vnpt-btn-export-txt"))==null||a.click();break;case"TOGGLE":(r=document.getElementById("vnpt-toggle-btn"))==null||r.click();break;case"CLEAN":(l=document.getElementById("vnpt-btn-clean-data"))==null||l.click();break}}function ln(t,i){Wt=!0,dt=t,xt=i,w("Vui lòng nhấn tổ hợp phím mong muốn...","info")}function cn(t){var e;if(["Alt","Control","Shift","Meta"].includes(t.key))return;t.preventDefault(),t.stopPropagation();const i={key:t.key.toLowerCase(),altKey:t.altKey,ctrlKey:t.ctrlKey,shiftKey:t.shiftKey},o=h.get(bt,Gt);o[dt]={...o[dt],...i},h.set(bt,o);const n=((e=o[dt])==null?void 0:e.label)||dt;w(`Đã lưu phím tắt cho ${n}: ${Xt(i)}`,"success"),xt&&xt(i),Wt=!1,dt=null,xt=null}function Xt(t){if(!t||!t.key)return"Chưa gán";const i=[];t.ctrlKey&&i.push("Ctrl"),t.altKey&&i.push("Alt"),t.shiftKey&&i.push("Shift");let o=t.key.toUpperCase();return o===" "&&(o="Space"),i.push(o),i.join(" + ")}async function ve({apiKey:t,model:i,systemInstruction:o,userText:n,fileData:e}){return new Promise((a,r)=>{if(!t)return r("Vui lòng nhập API Key Gemini trong Cài đặt.");const l=`https://generativelanguage.googleapis.com/v1beta/models/${i}:generateContent?key=${t}`,c={system_instruction:{parts:[{text:o}]},contents:[{parts:[{text:n}]}],generation_config:{response_mime_type:"application/json"}};e&&e.base64&&c.contents[0].parts.push({inline_data:{mime_type:e.mimeType,data:e.base64}});const d=s=>{if(s)try{let f=s.replace(/```json/g,"").replace(/```/g,"").trim();a(JSON.parse(f))}catch(f){console.error("Lỗi parse JSON từ Gemini",f,s),r("AI trả về kết quả không đúng cấu hình JSON.")}else r("AI không trả về kết quả hợp lệ.")};typeof GM_xmlhttpRequest<"u"?GM_xmlhttpRequest({method:"POST",url:l,headers:{"Content-Type":"application/json"},data:JSON.stringify(c),timeout:3e4,onload:s=>{var f,x,v,g,m;if(s.status>=200&&s.status<300)try{const u=JSON.parse(s.responseText),b=(m=(g=(v=(x=(f=u==null?void 0:u.candidates)==null?void 0:f[0])==null?void 0:x.content)==null?void 0:v.parts)==null?void 0:g[0])==null?void 0:m.text;d(b)}catch{r("Lỗi Parse kết quả từ Gemini API.")}else r(`API Gemini lỗi (${s.status}): ${s.responseText}`)},ontimeout:()=>r("Quá hạn thời gian gọi API (30s)"),onerror:s=>r("Lỗi kết nối đến Google Gemini API.")}):fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(c)}).then(s=>s.json()).then(s=>{var x,v,g,m,u;if(s.error)return r(s.error.message);const f=(u=(m=(g=(v=(x=s==null?void 0:s.candidates)==null?void 0:x[0])==null?void 0:v.content)==null?void 0:g.parts)==null?void 0:m[0])==null?void 0:u.text;d(f)}).catch(s=>r(s.message))})}async function dn(t,i){if(!t)throw new Error("Vui lòng nhập API Key.");const o={contents:[{parts:[{text:"Ping"}]}],generation_config:{max_output_tokens:5,response_mime_type:"text/plain"}},n=`https://generativelanguage.googleapis.com/v1beta/models/${i}:generateContent?key=${t}`;return new Promise((e,a)=>{const r=l=>{var c;try{return((c=JSON.parse(l).error)==null?void 0:c.message)||l}catch{return l}};typeof GM_xmlhttpRequest<"u"?GM_xmlhttpRequest({method:"POST",url:n,headers:{"Content-Type":"application/json"},data:JSON.stringify(o),timeout:1e4,onload:l=>{if(l.status>=200&&l.status<300)e(!0);else{const c=r(l.responseText);a(`API Error ${l.status}: ${c}`)}},onerror:l=>a("Lỗi kết nối mạng hoặc CORS."),ontimeout:()=>a("Hết thời gian chờ (10s).")}):fetch(n,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)}).then(async l=>{if(l.ok)return e(!0);const c=await l.text();a(`API Error ${l.status}: ${r(c)}`)}).catch(l=>a(l.message))})}let R=null;function pn(){p.isInspecting=!p.isInspecting,p.isInspecting?(un(),w("🔍 Chế độ Soi: Đang bật. Hãy di chuột và Click vào ô nhập liệu.","#1a73e8")):(fn(),w("🔍 Chế độ Soi: Đã tắt."))}function un(){document.addEventListener("mouseover",ye,!0),document.addEventListener("click",xe,!0),document.body.classList.add("vnpt-inspecting-mode")}function fn(){document.removeEventListener("mouseover",ye,!0),document.removeEventListener("click",xe,!0),document.body.classList.remove("vnpt-inspecting-mode"),R&&(R.classList.remove("vnpt-inspect-highlight"),R=null)}function ye(t){if(!p.isInspecting)return;const i=t.target.closest("input, select, textarea, ng-select2, label");if(!i){R&&(R.classList.remove("vnpt-inspect-highlight"),R=null);return}R&&R!==i&&R.classList.remove("vnpt-inspect-highlight"),i.classList.add("vnpt-inspect-highlight"),R=i}function xe(t){if(!p.isInspecting||t.target.closest("#vnpt-docx-widget")||t.target.closest("#vnpt-inline-calc"))return;t.preventDefault(),t.stopPropagation();const i=t.target.closest("input, select, textarea, ng-select2, label");if(!i)return;const o=gn(i),n=i.getAttribute("title")||i.value||"";o.key?(I(o.key,n,o.label||""),B(),w(`✅ Đã bắt được: ${o.label||o.key}${n?" ("+n+")":""}`,"#1e8e3e")):w("⚠️ Không tìm thấy ID hoặc tên cố định cho trường này.","#ffc107")}function gn(t){let i="",o="";if(i=t.getAttribute("formcontrolname")||"",i||(i=t.id||t.getAttribute("name")||""),o=hn(t),t.tagName.toLowerCase()==="label"){const n=t.getAttribute("for"),e=n?document.getElementById(n):t.querySelector("input, select, textarea");e&&(i=e.getAttribute("formcontrolname")||e.id||e.getAttribute("name")||""),o||(o=t.innerText.trim())}return{key:i,label:o.replace(/[:*]/g,"").trim()}}function hn(t){if(t.id){const n=document.querySelector(`label[for="${t.id}"]`);if(n)return n.innerText.trim()}const i=t.closest("label");if(i)return i.innerText.trim();const o=t.previousElementSibling;return o&&(o.tagName==="LABEL"||o.classList.contains("label"))?o.innerText.trim():t.getAttribute("placeholder")||""}function mn(){const t=document.getElementById("vnpt-docx-widget")||document.createElement("div");t.id="vnpt-docx-widget";const i=h.get(St)===!0;t.innerHTML=`
        <button id="vnpt-toggle-btn" title="Mở/Đóng UI Hợp đồng" class="${i?"btn-opened":"btn-closed"}">${i?"✖":"📄"}</button>

        <div id="vnpt-export-panel" style="display: ${i?"flex":"none"};">
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
    `,document.body.appendChild(t),p.widget=t,p.panel=document.getElementById("vnpt-export-panel"),p.toggleBtn=document.getElementById("vnpt-toggle-btn"),p.header=document.getElementById("vnpt-panel-header"),p.bannerArea=document.getElementById("vnpt-banner-area"),p.fieldsContainer=document.getElementById("vnpt-fields-list");try{const u=h.get(Et);u&&u.width&&u.height&&(p.panel.style.width=u.width+"px",p.panel.style.height=u.height+"px")}catch(u){console.error("Lỗi load size panel:",u)}new ResizeObserver(u=>{if(p.panel.style.display!=="none")for(let b of u){const{width:y,height:k}=b.contentRect;y>0&&k>0&&h.setDebounced(Et,{width:Math.round(y+20),height:Math.round(k+20)},1e3)}}).observe(p.panel),p.panelBody=document.getElementById("vnpt-panel-body"),ot(document.getElementById("vnpt-template-manager"),(u,b)=>{p.templateBuffer=u,p.templateName=b}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const u=this.files&&this.files[0];if(!u)return;const b=document.getElementById("vnpt-template-manager");Ke(u,b,(y,k)=>{p.templateBuffer=y,p.templateName=k}),this.value=""}),p.toggleBtn.addEventListener("click",u=>{p.hasDragged||(p.panel.style.display==="none"?(p.panel.style.display="flex",p.toggleBtn.className="btn-opened",p.toggleBtn.innerHTML="✖",h.set(St,!0)):(p.panel.style.display="none",p.toggleBtn.className="btn-closed",p.toggleBtn.innerHTML="📄",h.set(St,!1)))});const n=document.getElementById("vnpt-btn-more"),e=document.getElementById("vnpt-util-menu"),a={S:{width:"380px",height:"420px"},M:{width:"460px",height:"600px"},L:{width:"620px",height:"800px"},Full:{width:"98vw",height:"92vh"}},r=h.get(J)||{};e.querySelectorAll("input[data-clink]").forEach(u=>{const b=u.dataset.clink,y=r[b]||qt[b]||[];u.value=y.join(", "),u.onchange=()=>{const k=h.get(J)||{};k[b]=u.value.split(",").map(T=>T.trim()).filter(T=>T),h.set(J,k)}});const l=document.getElementById("vnpt-gemini-key"),c=document.getElementById("vnpt-gemini-model");l&&c&&Promise.resolve().then(()=>Ae).then(({SK_GEMINI_KEY:u,SK_GEMINI_MODEL:b})=>{l.value=h.get(u)||"",c.value=h.get(b)||"gemini-2.0-flash",l.onchange=()=>{h.set(u,l.value.trim())},c.onchange=()=>{h.set(b,c.value)};const y=document.getElementById("vnpt-btn-test-gemini");y&&(y.onclick=async()=>{const k=l.value.trim(),T=c.value;if(!k){w("⚠️ Vui lòng nhập API Key trước khi thử","#ffc107");return}y.disabled=!0,y.textContent="⏳ Đang thử...";try{await dn(k,T),w("✅ Kết nối tới Gemini thành công!","#1e8e3e")}catch(S){w("❌ Kết nối thất bại: "+S,"#ea4335")}finally{y.disabled=!1,y.textContent="⚡ Kiểm tra kết nối"}})}),document.getElementById("vnpt-btn-export-json").onclick=()=>Ut();const d=document.getElementById("vnpt-txt-toggle"),s=document.getElementById("vnpt-txt-body");d&&s&&d.addEventListener("click",u=>{u.stopPropagation();const b=s.style.display==="none";s.style.display=b?"":"none",d.textContent=b?"▲":"▶"});const f=document.getElementById("vnpt-btn-import-json"),x=document.getElementById("vnpt-file-import-json");f.onclick=()=>x.click(),x.onchange=async u=>{u.target.files.length>0&&await ge(u.target.files[0])&&setTimeout(()=>location.reload(),1500)},n.addEventListener("click",u=>{u.stopPropagation();const b=e.classList.toggle("show");n.classList.toggle("active",b)}),e.addEventListener("click",u=>{u.stopPropagation()}),document.addEventListener("click",u=>{e.classList.contains("show")&&(e.classList.remove("show"),n.classList.remove("active"))}),e.querySelectorAll(".size-options button").forEach(u=>{u.addEventListener("click",b=>{const y=b.target.getAttribute("data-size"),k=a[y];k&&(p.panel.style.width=k.width,p.panel.style.height=k.height),e.classList.remove("show"),n.classList.remove("active")})});function v(){const u=document.getElementById("vnpt-hotkey-list");if(!u)return;const b=h.get(bt,Gt);u.innerHTML="",Object.entries(b).forEach(([y,k])=>{const T=document.createElement("div");T.className="vnpt-hotkey-row",T.innerHTML=`
                <span class="vnpt-hotkey-label">${k.label||y}</span>
                <button class="vnpt-hotkey-btn" data-action="${y}">${Xt(k)}</button>
            `;const S=T.querySelector(".vnpt-hotkey-btn");S.onclick=N=>{N.stopPropagation(),!S.classList.contains("recording")&&(S.classList.add("recording"),S.textContent="Bấm phím...",ln(y,C=>{S.classList.remove("recording"),S.textContent=Xt(C)}))},u.appendChild(T)})}v(),p.panel.querySelectorAll(".vnpt-resizer").forEach(u=>{u.addEventListener("mousedown",b=>{b.preventDefault(),b.stopPropagation();const y=b.clientX,k=b.clientY,T=p.panel.offsetWidth,S=p.panel.offsetHeight,N=p.widget.getBoundingClientRect(),C=N.top;window.innerWidth-N.right,p.panel.classList.add("vnpt-resizing"),document.body.classList.add("vnpt-resizing-global");const P=window.getComputedStyle(u).cursor;document.body.style.cursor=P;const j=D=>{const W=D.clientX-y,M=D.clientY-k;if(u.classList.contains("br"))p.panel.style.width=Math.max(360,T+W)+"px",p.panel.style.height=Math.max(250,S+M)+"px";else if(u.classList.contains("bl")){const _=T-W;_>360&&(p.panel.style.width=_+"px"),p.panel.style.height=Math.max(250,S+M)+"px"}else if(u.classList.contains("tr")){p.panel.style.width=Math.max(360,T+W)+"px";const _=S-M;_>250&&(p.panel.style.height=_+"px",p.widget.style.top=C+M+"px")}else if(u.classList.contains("tl")){const _=T-W,Ct=S-M;_>360&&(p.panel.style.width=_+"px"),Ct>250&&(p.panel.style.height=Ct+"px",p.widget.style.top=C+M+"px")}},E=()=>{window.removeEventListener("mousemove",j),window.removeEventListener("mouseup",E),p.panel.classList.remove("vnpt-resizing"),document.body.classList.remove("vnpt-resizing-global"),document.body.style.cursor="";const D=p.widget.id==="vnpt-docx-widget";h.setDebounced(Tt,{right:D?p.widget.style.right:void 0,top:p.widget.style.top,x:D?void 0:parseFloat(p.widget.style.left),y:parseFloat(p.widget.style.top)},500),h.setDebounced(Et,{width:p.panel.offsetWidth,height:p.panel.offsetHeight},500)};window.addEventListener("mousemove",j),window.addEventListener("mouseup",E)})});const m=document.getElementById("vnpt-btn-inspect");m&&(m.onclick=()=>pn(),p.on("isInspecting",u=>{m.classList.toggle("active",u)}))}function we(t,i,o,n=null,e=null){let a=!1,r=0,l=0,c=0,d=0,s=!1;const f=5;function x(g){s!==g&&(s=g,e&&e(g))}function v(g){if(g.button!==0||["INPUT","BUTTON","SELECT","TEXTAREA"].includes(g.target.tagName)||g.target.isContentEditable)return;a=!0,p.hasDragged=!1,c=g.clientX,d=g.clientY;const u=t.getBoundingClientRect();r=g.clientX-u.left,l=g.clientY-u.top,document.body.style.userSelect="none",i&&i.forEach(b=>b.style.cursor="grabbing"),n&&n(),g.preventDefault()}return i.forEach(g=>{g.addEventListener("mousedown",v)}),document.addEventListener("mousemove",function(g){if(!a)return;if(!p.hasDragged)if(Math.sqrt(Math.pow(g.clientX-c,2)+Math.pow(g.clientY-d,2))>f)p.hasDragged=!0;else return;let m=g.clientX-r,u=g.clientY-l;const b=window.innerWidth,y=window.innerHeight,k=document.getElementById("vnpt-toggle-btn"),T=k?k.offsetWidth:40,S=k?k.offsetHeight:40,N=t.id==="vnpt-docx-widget";let C=t.offsetWidth||0;if(N){let E=T+6-C,D=b-C+6;m<E&&(m=E),m>D&&(m=D)}else C=C||200,m<0&&(m=0),m+C>b&&(m=Math.max(0,b-C));let P=s;if(N?P=!1:s?g.clientY<y-40&&(P=!1):g.clientY>y-10&&(P=!0),u<0&&(u=0),P)x(!0),t.style.top=y-t.offsetHeight+"px",N?(t.style.right=b-m-C+"px",t.style.left="auto"):(t.style.left=m+"px",t.style.right="auto"),t.style.bottom="auto";else{x(!1);let j=t.offsetHeight||40,E;if(N)E=10+S;else{const D=t.querySelector(".cw-title-bar");E=D?D.offsetHeight:j}u+E>y&&(u=Math.max(0,y-E)),t.style.top=u+"px",N?(t.style.right=b-m-C+"px",t.style.left="auto"):(t.style.left=m+"px",t.style.right="auto"),t.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(a){if(a=!1,document.body.style.userSelect="",i&&i.forEach(g=>g.style.cursor="grab"),o){const g=t.id==="vnpt-docx-widget";h.set(o,{left:g?void 0:t.style.left,right:g?t.style.right:void 0,top:t.style.top,x:g?void 0:parseFloat(t.style.left),y:parseFloat(t.style.top),docked:s})}setTimeout(()=>{p.hasDragged=!1},100)}}),{isDocked:()=>s,setDocked:x}}function bn(){p.widget&&p.header&&(we(p.widget,[p.header],Tt),window.addEventListener("resize",()=>{const t=window.innerWidth,i=window.innerHeight,o=document.getElementById("vnpt-toggle-btn"),n=o?o.offsetWidth:40,e=o?o.offsetHeight:40;let a=p.widget.getBoundingClientRect(),r=a.left,l=a.top,c=p.widget.offsetWidth||0,s=n+6-c,f=t-c+6;r<s&&(r=s),r>f&&(r=f),l+10+e>i&&(l=Math.max(0,i-(10+e))),p.widget.style.right=t-r-c+"px",p.widget.style.top=l+"px"}))}function ke(t){const i=t.toLowerCase(),{ngay:o,thang:n,nam:e}=ae(),a=`${o}/${n}/${e}`;return{"ngayky, ngayky1":o,ngayky:o,"thangky, thangky1":n,thangky:n,"namky, namky1":e,namky:e,"ngaytiepnhan, ngaythangnamky":a,ngaytiepnhan:a,ngaythangnamky:a,soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[i]||""}function Ce(){oe();const t=Object.keys(L).find(a=>a.includes("diaChi"));if(!t)return"";const i=L[t],o=t.split(",").map(a=>a.trim());let n={detail:"",ward:"",district:"",province:""};o.forEach(a=>{const r=tt(a,i);if(r){let l="";if(r.tagName.toLowerCase()==="ng-select2"){const c=r.querySelector(".select2-selection__rendered");l=c?c.getAttribute("title")||c.textContent.trim():""}else l=r.value||r.getAttribute("title")||"";l=(l||"").trim(),l&&l!=="--- Chọn ---"&&(a==="diaChi"||a==="duong"?n.detail=l:a.includes("tinh")?n.province=l:a.includes("huyen")||a.includes("quan")?n.district=l:(a.includes("xa")||a.includes("phuong"))&&(n.ward=l))}}),document.querySelectorAll("ng-select2").forEach(a=>{const r=a.querySelector(".select2-selection__rendered");if(!r)return;const l=(r.getAttribute("title")||r.textContent||"").trim();!l||l==="--- Chọn ---"||((l.startsWith("Xã")||l.startsWith("Phường")||l.startsWith("Thị trấn"))&&!n.ward?n.ward=l:(l.startsWith("Quận")||l.startsWith("Huyện")||l.startsWith("Thị xã"))&&!n.district?n.district=l:(l.startsWith("Tỉnh")||l.startsWith("Thành phố"))&&!n.province&&(n.province=l))});let e=[];if(n.detail&&e.push(n.detail),n.ward&&e.push(n.ward),n.district&&e.push(n.district),n.province){let a=n.province;!a.startsWith("Tỉnh")&&!a.startsWith("Thành phố")&&(a="Tỉnh "+a),e.push(a)}return e.length>0&&e.push("Việt Nam"),e.filter(a=>!!a).join(", ")}function Yt(){let t="";const i=["tinhId","tinhIdNew"];for(const o of i){const n=tt(o);if(n){if(n.tagName.toLowerCase()==="ng-select2"){const e=n.querySelector(".select2-selection__rendered");t=e?e.getAttribute("title")||e.textContent.trim():""}else t=n.value||n.getAttribute("title")||"";if(t&&t!=="--- Chọn ---")break}}if(!t||t==="--- Chọn ---"){const o=document.querySelectorAll("ng-select2");for(const n of o){const e=n.querySelector(".select2-selection__rendered"),a=((e==null?void 0:e.getAttribute("title"))||(e==null?void 0:e.textContent)||"").trim();if(a&&(a.startsWith("Tỉnh")||a.startsWith("Thành phố"))){t=a;break}}}return t?t.trim().replace(/^(Tỉnh|Thành phố)\s+/i,""):""}function vn(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){if(rt("Trước khi quét mới: "+Mt()),p.isDefaultMode){Object.keys(F).forEach(e=>{I(e,F[e],L[e]||"")}),B(),w("Đã nạp lại dữ liệu mặc định từ hệ thống.");return}let n=0;oe(),Object.keys(L).forEach(e=>{const a=L[e],r=e.split(",").map(s=>s.trim()),l=r.includes("diaChi"),c=r.includes("noiCapSoDkdn");let d="";if(l)d=Ce(),d&&n++;else if(c){const s=Yt();s&&(d="SKDT "+s,n++)}else r.forEach(s=>{var x;if(d)return;const f=tt(s,a);if(f){if(f.tagName.toLowerCase()==="select")d=((x=f.options[f.selectedIndex])==null?void 0:x.text)||"";else if(f.tagName.toLowerCase()==="ng-select2"){const v=f.querySelector(".select2-selection__rendered");d=v?v.getAttribute("title")||v.textContent.trim():""}else d=f.value||f.getAttribute("title")||"";d&&n++}});if(d=d||ke(e),d&&typeof d=="string"){const s=r[0];["sdt"].includes(s)?d=qe(d):["ngaySinhCustomer","ngayCapCustomer","ngayCapSoDkdnCustomer","ngayKy","ngayTiepNhan"].includes(s)&&(d=Ge(d))}I(e,d,null)}),B(),n>0?(this.style.background="#1e8e3e",this.style.color="#fff",this.innerText="Đã quét xong",setTimeout(()=>{this.style.background="",this.style.color="",this.innerText="Quét dữ liệu"},1e3)):w("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")});function t(n){var c;if(n.target.closest("#vnpt-docx-widget")||n.target.closest("#vnpt-inline-calc")||n.type==="keydown"&&n.key!=="Enter")return;const e=n.target.closest("input, textarea, select, ng-select2");if(!e)return;const a=e.id,r=e.getAttribute("formcontrolname"),l=Object.keys(L).find(d=>{const s=d.split(",").map(f=>f.trim());return a&&s.includes(a)||r&&s.includes(r)});if(l!==void 0){let d;if(l.includes("diaChi")){d=Ce();const s=Yt();if(s){const f="SKDT "+s,x=Object.keys(L).find(v=>v.includes("noiCapSoDkdn"));x&&I(x,f,null)}}else{const s=e.tagName.toLowerCase();if(s==="select")d=((c=e.options[e.selectedIndex])==null?void 0:c.text)||"";else if(s==="ng-select2"){const f=e.querySelector(".select2-selection__rendered");d=f?f.getAttribute("title")||f.textContent.trim():""}else d=e.value}d!==void 0&&(I(l,d,null),B(),console.debug(`[Sync] Updated ${l} with value: "${d}"`))}}function i(){["tinhId","tinhIdNew"].forEach(e=>{const a=document.getElementById(e);if(a&&!a.dataset.widgetSyncBound){a.dataset.widgetSyncBound="1";const r=()=>{const l=Yt();if(l){const c="SKDT "+l,d=Object.keys(L).find(s=>s.includes("noiCapSoDkdn"));d&&(I(d,c,null),B())}};a.addEventListener("change",r),typeof $<"u"&&$(a).on("select2:select change",r)}})}document.addEventListener("input",t),document.addEventListener("change",t),document.addEventListener("keydown",t),i(),new MutationObserver(()=>i()).observe(document.body,{childList:!0,subtree:!0})}const yn={local:{download(t,i="arraybuffer"){return new Promise((o,n)=>{const e=new FileReader;switch(e.onload=a=>{let r=a.target.result;i==="base64"&&typeof r=="string"&&(r=r.split(",")[1]||r),o(r)},e.onerror=a=>n(a),i.toLowerCase()){case"arraybuffer":e.readAsArrayBuffer(t);break;case"base64":case"dataurl":e.readAsDataURL(t);break;case"text":e.readAsText(t);break;default:n(new Error(`Unsupported read type: ${i}`))}})},async upload(t){return this.download(t,"base64")}}},xn={getAdapter(t){const i=yn[t];if(!i)throw new Error(`Storage adapter not found: ${t}`);return i},async upload(t,i,o={}){return await this.getAdapter(t).upload(i,o)},async download(t,i,o={}){return await this.getAdapter(t).download(i,o.type||"arraybuffer")}};function Te(t,i,o){try{let n;try{n=new window.PizZip(t)}catch(c){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(c);return}const e=new window.docxtemplater(n,{paragraphLoop:!0,linebreaks:!0});e.render(i);const a=e.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",compression:"DEFLATE",compressionOptions:{level:9}}),r=URL.createObjectURL(a),l=document.createElement("a");l.href=r,l.download=o,document.body.appendChild(l),l.click(),setTimeout(()=>{document.body.removeChild(l),URL.revokeObjectURL(r)},100)}catch(n){let e=n.message;n.properties&&n.properties.errors instanceof Array?e=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+n.properties.errors.map(r=>"- "+(r.properties.explanation||r.message)).join(`
`):e="Lỗi phần mềm Word sinh ra: "+e,alert(e),console.error("DocX Error:",n)}}function wn(t,i){const o=t.replace(/@(\w+)/g,(n,e)=>i[e]!==void 0?i[e]:n);navigator.clipboard.writeText(o).then(()=>{alert("✅ Đã sao chép nội dung vào Clipboard!")}).catch(n=>{console.error("Lỗi khi copy:",n),alert("❌ Lỗi khi sao chép vào Clipboard. Vui lòng thử lại!")})}function kn(){const t=document.getElementById("vnpt-export-filename");t&&t.addEventListener("input",()=>{t.dataset.userEdited="1",t.value.trim()||(t.dataset.userEdited="0")});function i(){if(!t||t.dataset.userEdited==="1")return;let e="";if(p.fieldsContainer&&p.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(s=>{const x=s.querySelector(".f-key").value.trim().split(",")[0].trim(),v=s.querySelector(".f-val").value.trim();x==="tenToChuc"&&(e=v)}),!e){const d=document.getElementById("tenToChuc");d&&(e=d.tagName.toLowerCase()==="textarea"||d.tagName.toLowerCase()==="input"?d.value.trim():d.innerText.trim())}function a(d){if(!d)return"";let s=d;return s=s.replace(/Tổng công ty/gi,""),s=s.replace(/Công ty/gi,""),s=s.replace(/\bCty\b/gi,""),s=s.replace(/Trách nhiệm hữu hạn/gi,""),s=s.replace(/\bTNHH\b/gi,""),s=s.replace(/Cổ phần/gi,""),s=s.replace(/\bCP\b/gi,""),s=s.replace(/Một thành viên/gi,""),s=s.replace(/\bMTV\b/gi,""),s=s.replace(/Chi nhánh/gi,""),s=s.replace(/Việt Nam/gi,"VN"),s=s.replace(/Viet Nam/gi,"VN"),s=s.replace(/\s+/g," ").trim(),s=s.replace(/^[-,\s]+|[-,\s]+$/g,""),s.length>50&&(s=s.substring(0,47)+"..."),s.replace(/[<>:"/\\|?*]/g,"")}let r=a(e),l=p.templateName?p.templateName.replace(/\.docx$/i,""):"",c=[];l&&c.push(l),r&&c.push(r),c.length>0?t.value=c.join(" - ")+".docx":t.value||(t.value="Export_Auto.docx")}setInterval(i,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const e={};if(p.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(d=>{const f=d.querySelector(".f-key").value.trim().split(",")[0].trim(),x=d.querySelector(".f-val").value;f&&(e[f]=x)}),Object.keys(e).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}const r=[];if(ft.forEach(d=>{if(!e[d]||!e[d].trim()){const s=L[d]||d;r.push(s)}}),r.length>0){const d=`Cảnh báo: Bạn còn các trường sau chưa điền dữ liệu:

- ${r.join(`
- `)}

Bạn có chắc chắn muốn tiếp tục xuất file không?`;if(!confirm(d))return}let l=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(l.toLowerCase().endsWith(".docx")||(l+=".docx"),p.templateBuffer){Te(p.templateBuffer,e,l);return}const c=document.getElementById("vnpt-template-file");if(c.files&&c.files.length>0){xn.download("local",c.files[0],{type:"arraybuffer"}).then(d=>Te(d,e,l)).catch(d=>alert(`Lỗi đọc file: ${d.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')});const o=document.getElementById("vnpt-btn-export-txt"),n=document.getElementById("vnpt-txt-template");if(n){const e=h.get($t);e&&(n.value=e),n.addEventListener("input",()=>{h.setDebounced($t,n.value,800)})}o&&o.addEventListener("click",()=>{const e=n?n.value:"";if(!e.trim()){alert(`Bạn chưa nhập nội dung Text Template!

Sử dụng @key làm placeholder, ví dụ: Tôi là @tenDaiDienn`);return}const a={};if(p.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(l=>{const d=l.querySelector(".f-key").value.trim().split(",")[0].trim(),s=l.querySelector(".f-val").value;d&&(a[d]=s)}),Object.keys(a).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}wn(e,a)})}const Cn=["chucVu","noiCap","noiCapSoDkdn","ngayky","ngayky1","thangky","namky","thangky1","namky1","noiKy"],Tn=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function En(){function t(){Cn.forEach(e=>{const a=document.getElementById(e);a&&!a.dataset.filled&&(a.dataset.filled="1",ct(a,ke(e)))}),Tn.forEach(e=>{const a=document.getElementById(e.src),r=document.getElementById(e.target);a&&r&&!a.dataset.bound&&(a.dataset.bound="1",a.addEventListener("change",()=>ct(r,a.value)))}),["tinhId","tinhIdNew"].forEach(e=>{const a=document.getElementById(e),r=document.getElementById("noiCapSoDkdn");if(a&&r&&!a.dataset.skdtBound){a.dataset.skdtBound="1";const l=()=>{let c="";if(a.tagName.toLowerCase()==="ng-select2"||a.classList.contains("select2-hidden-accessible")){const d=a.parentElement.querySelector(".select2-selection__rendered");c=d?d.getAttribute("title")||d.textContent.trim():a.value}else c=a.value;if(c&&c!=="--- Chọn ---"){const d=c.trim().replace(/^(Tỉnh|Thành phố)\s+/i,"");ct(r,"SKDT "+d)}};a.addEventListener("change",l),$(a).on("select2:select",l)}})}let i;new MutationObserver(n=>{n.some(a=>a.addedNodes.length>0?Array.from(a.addedNodes).some(l=>l.nodeType!==1?!1:["INPUT","TEXTAREA","SELECT"].includes(l.tagName)?!0:l.querySelector&&l.querySelector("input, textarea, select")):!1)&&(clearTimeout(i),i=setTimeout(t,200))}).observe(document.body,{childList:!0,subtree:!0}),t()}const Sn=()=>{let t="";for(const[i,o]of Object.entries(L)){const n=i.split(",")[0].trim();ft.includes(n)&&(t+=`"${n}": "${o}",
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
`};function Ln(t,i,o="gemini-2.0-flash"){return ve({apiKey:i,model:o,systemInstruction:Sn(),userText:"Đọc file hợp đồng này và trích xuất thành JSON.",fileData:{mimeType:"application/pdf",base64:t}})}function Nn(t){return new Promise((i,o)=>{const n=new FileReader;n.onload=()=>{const e=n.result.split(",")[1];i(e)},n.onerror=e=>o(e),n.readAsDataURL(t)})}function Ee(){let t=document.getElementById("vnpt-pdf-loader");t||(t=document.createElement("div"),t.id="vnpt-pdf-loader",t.className="vnpt-pdf-overlay",t.innerHTML=`
            <div class="vnpt-pdf-loading-box">
                <div class="loader-spinner"></div>
                <div style="margin-top: 15px; font-weight: 800; font-size: 13px; color: #1a73e8;">Đang nhờ AI đọc Hợp đồng...</div>
                <div style="margin-top: 4px; font-size: 11px; color: #5f6368;">Tùy thuộc độ lớn file, thường mất 5 - 10s...</div>
            </div>
        `,document.body.appendChild(t)),t.style.display="flex"}function _t(){const t=document.getElementById("vnpt-pdf-loader");t&&(t.style.display="none")}function Se(t,i){let o=document.getElementById("vnpt-pdf-dialog");o&&o.remove(),o=document.createElement("div"),o.id="vnpt-pdf-dialog",o.className="vnpt-pdf-overlay";const n=t.map((c,d)=>`
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
                    <tbody>${n}</tbody>
                </table>
            </div>
            <div class="vnpt-pdf-actions">
                <div style="flex:1; font-size:11px; color:#5f6368; align-self:flex-end;">Gợi ý: Căn lề AI có thể lệch, hãy check lại cẩn thận.</div>
                <button class="pdf-btn-cancel" id="pdf-btn-cancel">✖ Hủy</button>
                <button class="pdf-btn-confirm" id="pdf-btn-confirm">✅ Đồng bộ bảng dữ liệu</button>
            </div>
        </div>
    `,document.body.appendChild(o);const e=o.querySelector("#pdf-btn-cancel"),a=o.querySelector("#pdf-btn-confirm"),r=o.querySelector("#pdf-check-all"),l=o.querySelectorAll(".pdf-row-chk");r.addEventListener("change",c=>{l.forEach(d=>d.checked=c.target.checked)}),e.onclick=()=>{o.remove()},a.onclick=()=>{const c=[];l.forEach(d=>{if(d.checked){const s=parseInt(d.getAttribute("data-index"));c.push(t[s])}}),o.remove(),i(c)}}function In(){const t=document.getElementById("vnpt-btn-scan-pdf"),i=document.getElementById("vnpt-pdf-input");!t||!i||(t.addEventListener("click",o=>{if(o.preventDefault(),!h.get(It)){navigator.clipboard.writeText("https://github.com/tranchien2000/vnpt-tampermonkey-vite/blob/main/docs/GEMINI_API_GUIDE.md").then(()=>{w("Đã copy link hướng dẫn cài đặt API Key vào bộ nhớ tạm","#f44336")}).catch(a=>{console.error("Không thể copy link:",a),alert("Công cụ chưa được cài đặt API Key!")});return}i.click()}),i.addEventListener("change",async o=>{const n=o.target.files[0];n&&(o.target.value="",await Dn(n))}))}async function Dn(t){const i=h.get(It),o=h.get(Ft)||"gemini-2.5-flash";if(!i){confirm(`Chưa cài đặt Gemini API Key!

AI Scanner (PDF) yêu cầu cần có mã Google AI Studio cấp phát Miễn phí.

Nhấn 'OK' để xem hướng dẫn tự tạo mã Key nhé!`)&&window.open("https://github.com/tranchien2000/vnpt-tampermonkey-vite/blob/main/docs/GEMINI_API_GUIDE.md","_blank");return}try{Ee();const n=await Nn(t);rt("Trước khi PDF Scan: "+Mt());const e=await Ln(n,i,o);_t();const a=Object.keys(e).map(r=>({key:r,value:e[r],label:e[r]===""?"(Trống)":e[r]})).filter(r=>r.value!=="");if(a.length===0){alert("Rất tiếc! AI không tìm thấy trường thông tin nào thỏa mãn (Bên A).");return}Se(a,r=>{r.forEach(l=>{I(l.key,l.value,`AI: ${l.key}`)}),B(),console.log(`✅ [OCR Pdf] Đã điền thành công ${r.length} trường.`)})}catch(n){_t(),console.error("Lỗi PDF Scan Pipeline:",n);let e=n;typeof n=="string"&&(n.includes("Quota exceeded")||n.includes("limit: 0"))&&(e=`⚠️ Hết hạn mức hoặc Mô hình không khả dụng (Quota Exceeded)!

Mô hình bạn chọn có thể chưa hỗ trợ tại vùng của bạn hoặc bạn đã dùng hết lượt gọi miễn phí.

QUYẾT : Hãy mở menu ⚙️ (Thiết lập), đổi sang 'Gemini 1.5 Flash' hoặc 'Gemini 2.0 Flash' để tiếp tục.`),alert(`Lỗi xử lý quét File:
`+e)}}const q={name:t=>t?t.trim().toUpperCase().replace(/\s+/g," "):"",mst:t=>t?t.replace(/[^\d]/g,"").trim():"",date:(t,i,o)=>`${String(t).padStart(2,"0")}/${String(i).padStart(2,"0")}/${o}`,text:t=>t?t.trim().replace(/\s+/g," "):""};function et(t,i){for(const o of i){const n=t.match(o);if(n&&n[1])return n[1].trim()}return null}function An(t){if(!t)return{};const i={},o=t.replace(/\r/g,""),e=et(o,[/(?:Tên công ty viết bằng tiếng Việt|Tên tổ chức):?\s*([\s\S]+?)(?=\n|Tên công ty|$)/i,/Tên công ty viết bằng tiếng nước ngoài:?\s*([\s\S]+?)(?=\n|Tên công ty|$)/i,/Tên công ty viết tắt:?\s*([\s\S]+?)(?=\n|Địa chỉ|$)/i]);e&&(i.tenToChuc=q.text(e));const r=et(o,[/(?:Mã số doanh nghiệp|Mã số thuế):?\s*([\d\s.]{10,16})/i,/MST:?\s*([\d\s.]{10,16})/i]);r&&(i.soDkdn=q.mst(r));let c=et(o,[/(?:Họ và tên|Người đại diện theo pháp luật|Tên đại diện|Full name):?\s*([\s\S]+?)(?=\n|Chức danh|Chức vụ|Giới tính|Sinh ngày|Date of birth|$)/i,/Người đại diện:?\s*([\s\S]+?)(?=\n|Chức vụ|$)/i]);c&&(c=c.replace(/^(?:Họ và tên|Người đại diện theo pháp luật|Tên đại diện|Full name|[\/\s]*Full name):?\s*/i,"").replace(/^\/\s*/,""),i.tenDaiDienn=q.name(c));const s=et(o,[/(?:Chức danh|Chức vụ):?\s*([\s\S]+?)(?=\n|Sinh ngày|Giới tính|Quốc tịch|$)/i]);s&&(i.chucVu=q.text(s));const f=o.match(/(?:Đăng ký|Đảng kỷ|Cấp ngày|Ngày cấp) (?:lần đầu|thay đổi):?\s*ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i);f&&(i.ngayCapSoDkdnCustomer=q.date(f[1],f[2],f[3]));const v=et(o,[/(?:Điện thoại|SĐT|Tel):?\s*([\d\s.-]{9,15})/i]);v&&(i.sdt=v.replace(/[\s.-]/g,"").trim());const m=et(o,[/(?:Thư điện tử|Email):?\s*([^\s\n]+)/i]);m&&(i.emailDaiDien=m.replace(/\(a\)/g,"@").trim());const b=et(o,[/(?:Số định danh cá nhân|Số CMND|Số CCCD|Số Hộ chiếu|Số \/ No\.):?\s*(\d[\d\s]{8,13})/i,/(?:CMND|CCCD) số:?\s*(\d[\d\s]{8,13})/i]);b&&(i.cmnd=q.mst(b));const k=et(o,[/Nơi cấp:?\s*([\s\S]+?)(?=\n|Ngày cấp|$)/i,/Cục trưởng Cục Cảnh sát ([\s\S]+?)(?=\n|$)/i]);k&&(i.noiCap=q.text(k));const T=o.match(/Ngày cấp:?\s*(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{4})/i);T&&(i.ngayCapCustomer=q.date(T[1],T[2],T[3]));const S=o.match(/(?:Ngày, tháng, năm sinh|Sinh ngày|Ngày sinh):?\s*ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i);if(S)i.ngaySinhCustomer=q.date(S[1],S[2],S[3]);else{const N=o.match(/(?:Ngày sinh|Sinh ngày):?\s*(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{4})/i);N&&(i.ngaySinhCustomer=q.date(N[1],N[2],N[3]))}return i}const Bn=()=>{let t="";for(const[i,o]of Object.entries(L)){const n=i.split(",")[0].trim();ft.includes(n)&&(t+=`"${n}": "${o}",
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
- Trường "noiCapSoDkdn": Trả về định dạng "SKDT {Tỉnh}" (ví dụ: "SKDT Hà Nội", "SKDT TP.HCM"). KHÔNG bao gồm chữ "Nơi cấp...".
- Tuyệt đối KHÔNG bao gồm tên nhãn (Label) vào giá trị trích xuất.
- Bỏ qua các dữ liệu rác không liên quan.`};async function Mn(t,i,o="gemini-2.0-flash"){if(!t||!t.trim())throw new Error("Vui lòng nhập nội dung văn bản cần phân loại.");return ve({apiKey:i,model:o,systemInstruction:Bn(),userText:`Hãy phân loại thông tin từ đoạn văn bản sau đây: 

${t}`})}function Pn(t){if(!t||!t.trim())throw new Error("Vui lòng nhập nội dung văn bản cần phân loại.");return An(t)}function _n(){const t=document.getElementById("vnpt-btn-scan-raw"),i=document.getElementById("vnpt-raw-scan-section"),o=document.getElementById("vnpt-btn-raw-process"),n=document.getElementById("vnpt-btn-raw-process-local"),e=document.getElementById("vnpt-raw-scan-input");if(!t||!i||!o||!e)return;t.addEventListener("click",r=>{r.preventDefault();const l=i.style.display==="none";i.style.display=l?"flex":"none",t.classList.toggle("active",l),l&&e.focus()});const a=(r,l,c)=>{const d=Object.keys(r).map(f=>({key:f,value:r[f],label:`${l}: ${f}`})).filter(f=>f.value!==""&&f.value!==null);if(d.length===0){alert(l==="AI"?"AI không tìm thấy thông tin hợp lệ nào.":"Không tìm thấy thông tin phù hợp theo mẫu trích xuất Local.");return}Se(d,f=>{f.forEach(x=>{I(x.key,x.value,x.label)}),B(),w(`✅ Đã nạp ${f.length} trường từ văn bản thô.`),i.style.display="none",t.classList.remove("active"),e.value=""});const s=document.querySelector("#vnpt-pdf-dialog h3");s&&(s.textContent=c)};n&&n.addEventListener("click",()=>{const r=e.value.trim();if(!r){w("⚠️ Vui lòng nhập nội dung văn bản!","#ffc107");return}try{rt("Trước khi phân loại Local: "+Mt());const l=Pn(r);a(l,"Local","PHÂN LOẠI DỮ LIỆU THÔ (LOCAL)")}catch(l){w("❌ Lỗi: "+l.message,"#f44336")}}),o.addEventListener("click",async()=>{const r=e.value.trim();if(!r){w("⚠️ Vui lòng nhập nội dung văn bản!","#ffc107");return}const l=h.get(It),c=h.get(Ft)||"gemini-2.0-flash";if(!l){w("⚠️ Chưa cài đặt API Key Gemini!","#f44336");return}try{Ee(),rt("Trước khi phân loại AI: "+Mt());const d=await Mn(r,l,c);_t(),a(d,"AI","PHÂN LOẠI DỮ LIỆU THÔ (AI)")}catch(d){_t(),console.error("Raw Scan AI Error:",d),alert("Lỗi AI: "+d)}})}function pt(t,i=null){return h.get(t,i)}function Ht(t,i){h.set(t,i)}function Le(t,i){if(!i||i.replace(/\D/g,"").length<6)return;let o=pt(t,[]);o=o.filter(n=>n!==i),o.unshift(i),Ht(t,o.slice(0,10))}function Ot(t,i){const o=document.getElementById(i);o&&(o.innerHTML=pt(t,[]).map(n=>`<option value="${n}">`).join(""))}function Jt(t){return t.toLocaleString("en-US")}function Qt(t){return Number(String(t).replace(/[^\d]/g,""))||0}function Hn(t){return t.charAt(0).toUpperCase()+t.slice(1)}const wt=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function On(t){let i=Math.floor(t/100),o=Math.floor(t%100/10),n=t%10,e="";return i>0&&(e+=wt[i]+" trăm ",o===0&&n>0&&(e+="lẻ ")),o>1?(e+=wt[o]+" mươi ",n===1?e+="mốt":n===5?e+="lăm":n>0&&(e+=wt[n])):o===1?(e+="mười ",n===5?e+="lăm":n>0&&(e+=wt[n])):n>0&&(i>0&&(e+="lẻ "),e+=wt[n]),e.trim()}function Kn(t){if(t===0)return"không";const i=["","nghìn","triệu","tỷ"];let o="",n=0;for(;t>0;){const e=t%1e3;e>0&&(o=On(e)+" "+i[n]+" "+o),t=Math.floor(t/1e3),n++}return o.trim()}function Ne(t,i,o){let n=0,e=0,a=0;t==="before"?(n=Qt(i),e=Math.round(n*o),a=n+e):t==="tax"?(e=Qt(i),n=Math.round(e/o),a=n+e):t==="after"&&(a=Qt(i),n=Math.round(a/(1+o)),e=a-n);const r=Hn(Kn(a))+" đồng";return{beforeNum:n,taxNum:e,afterNum:a,beforeStr:Jt(n),taxStr:Jt(e),afterStr:Jt(a),textStr:r}}function $n(t,i){i.before&&i.before.forEach(o=>at(o,t.beforeStr)),i.tax&&i.tax.forEach(o=>at(o,t.taxStr)),i.after&&i.after.forEach(o=>at(o,t.afterStr)),i.text&&i.text.forEach(o=>at(o,t.textStr))}function Kt(t,i=null){try{const o=localStorage.getItem(t);return o!==null?JSON.parse(o):i}catch{return i}}function U(t,i){localStorage.setItem(t,JSON.stringify(i))}function Fn(t,i,o,n){let e=Kt(lt)??"custom",a=Kt(V)??{...F},r=Kt(nt)??{},l=Kt(Y)??{};const c=document.createElement("div");c.className="cw-tab-header";const d={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};d.custom.innerText="📋 Custom",d.custom.className="cw-tab cw-tab-custom",d.default.innerText="📌 Default",d.default.className="cw-tab cw-tab-default",d.sync.innerText="🔗 Sync",d.sync.className="cw-tab cw-tab-sync";function s(){Object.values(d).forEach(C=>C.classList.remove("active")),d[e].classList.add("active")}s();const f=document.createElement("div");f.style.display=n.data?"none":"block";const x=i("📋 Cấu hình Data","data",C=>{f.style.display=C?"none":"block",o(t)}),v=document.createElement("div");v.className="cw-data-body";function g(){v.innerHTML="";let C=e==="sync"?l:e==="custom"?r:a,P=e==="sync"?Y:e==="custom"?nt:V;const j=Object.keys(C);j.length===0&&e!=="default"&&(v.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),j.forEach(E=>{const D=document.createElement("div");D.className="cw-data-row";let W=e!=="default";const M=C[E],_=M&&typeof M=="object"&&M.hasOwnProperty("value"),Ct=_?M.value:M,te=_&&M.label||E,z=document.createElement("input");z.type="text",z.value=te,z.id=`df-key-${E}`,z.name=`df-key-${E}`,z.className="cw-data-key"+(W?" mutable":""),z.title=E,z.readOnly=!W,W&&(z.onchange=()=>{const G=z.value.trim();if(!G||G===E){z.value=te;return}_?C[G]={...M,label:G}:C[G]=Ct,delete C[E],U(P,C),g()});const X=document.createElement("input");if(X.type="text",X.value=Ct??"",X.id=`df-val-${E}`,X.name=`df-val-${E}`,X.className="cw-data-val",X.oninput=()=>{_?C[E]={...M,value:X.value}:C[E]=X.value,U(P,C)},D.appendChild(z),D.appendChild(X),W){const G=document.createElement("button");G.innerHTML="✕",G.className="cw-del-btn",G.onclick=()=>{confirm(`Delete "${te}"?`)&&(delete C[E],U(P,C),g())},D.appendChild(G)}else D.appendChild(document.createElement("div")).className="cw-pad";v.appendChild(D)})}d.custom.onclick=()=>{e="custom",U(lt,"custom"),s(),g()},d.default.onclick=()=>{e="default",U(lt,"default"),s(),g()},d.sync.onclick=()=>{e="sync",U(lt,"sync"),s(),g()};const m=document.createElement("button");m.innerText="📤",m.className="cw-icon-btn",m.title="Sao lưu toàn bộ dữ liệu ra JSON",m.onclick=()=>Ut();const u=document.createElement("button");u.innerText="📥",u.className="cw-icon-btn",u.title="Khôi phục dữ liệu từ JSON";const b=document.createElement("input");b.type="file",b.accept=".json",b.style.display="none",b.onchange=async C=>{C.target.files.length>0&&await ge(C.target.files[0])&&setTimeout(()=>location.reload(),1500)},u.onclick=()=>b.click(),f.appendChild(c),c.appendChild(d.custom),c.appendChild(d.default),c.appendChild(d.sync),f.appendChild(v),t.appendChild(x),t.appendChild(f);const y=t.querySelector("#vnpt-cw-fill"),k=t.querySelector("#vnpt-cw-sync"),T=t.querySelector("#vnpt-cw-add"),S=t.querySelector("#vnpt-cw-reset");y&&(y.onclick=pe),k&&(k.onclick=Ye),T&&(T.onclick=()=>{e==="default"&&(e="custom",U(lt,"custom"),s());let C=e==="sync"?l:r,P="new_field_"+Date.now();C[P]="",U(e==="sync"?Y:nt,C),g(),v.scrollTop=v.scrollHeight}),S&&(S.onclick=()=>{confirm("Reset Default Data?")&&(a={...F},U(V,a),g())}),g();const N=x.querySelector(".cw-right-wrap")||document.createElement("div");N.className="cw-right-wrap",N.prepend(m),N.prepend(u),N.appendChild(b),x.appendChild(N)}function zn(t,i,o){let n=Number(localStorage.getItem(st))||Xe,e=pt(ht)??{calc:!1,data:!0};function a(v,g){const m=document.createElement("button");return m.innerText=v,m.className="cw-action-btn "+g,m}function r(v,g,m){const u=document.createElement("div");u.className="wg-sec-header";const b=document.createElement("span");b.innerText=v;const y=document.createElement("button");return y.className="wg-toggle-btn",y.innerText=e[g]?"▾":"▴",u.appendChild(b),u.appendChild(y),y.onclick=()=>{e[g]=!e[g],y.innerText=e[g]?"▾":"▴",Ht(ht,e),m(e[g])},u}function l(v){const g=window.innerWidth,m=window.innerHeight,u=v.getBoundingClientRect();v.style.left=Math.min(Math.max(parseFloat(v.style.left),0),g-u.width)+"px",v.style.top=Math.min(Math.max(parseFloat(v.style.top),0),m-36)+"px"}const c=document.createElement("div");if(!i){c.className="cw-title-bar",c.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const v=document.createElement("div");v.className="cw-btn-group";const g={fill:a("Fill","cw-btn-fill"),sync:a("Sync","cw-btn-sync"),add:a("Add","cw-btn-add"),reset:a("↺","cw-btn-reset")};g.reset.title="Reset Default fields",Object.values(g).forEach(m=>v.appendChild(m)),c.appendChild(v),t.appendChild(c)}const d=document.createElement("div");d.className="cw-body-inline",d.innerHTML=`
    <div class="cw-inline-row">
        <input id="wg-before" name="wg-before" class="cw-input-inline" placeholder="Trước thuế" list="wg-before-list" title="Trước thuế">
        <datalist id="wg-before-list"></datalist>
        <div class="cw-tax-group-inline"><input id="wg-taxRate" name="wg-taxRate" class="cw-tax-input-inline" title="Thuế (%)"><span class="cw-tax-symbol">%</span></div>
        <input id="wg-tax" name="wg-tax" class="cw-input-inline" placeholder="Tiền thuế" title="Tiền thuế">
        <input id="wg-after" name="wg-after" class="cw-input-inline" placeholder="Sau thuế" list="wg-after-list" title="Sau thuế">
        <datalist id="wg-after-list"></datalist>
        <input id="wg-text" name="wg-text" class="cw-input-inline cw-input-readonly-inline" placeholder="Bằng chữ" readonly title="Bằng chữ">
    </div>`,i?i.appendChild(d):t.appendChild(d),i||Fn(t,r,l,e);const s={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text")};s.taxRate.value=n*100,Ot(Lt,"wg-before-list"),Ot(Nt,"wg-after-list");function f(v,g){const m=Ne(v,g,n);return s.before.value=m.beforeStr,s.tax.value=m.taxStr,s.after.value=m.afterStr,s.text.value=m.textStr,m}function x(v,g){const m=Ne(v,g,n),u=pt(J)||{...qt};$n(m,u)}if(s.taxRate.oninput=()=>{n=Number(s.taxRate.value)/100||0,Ht(st,n),f("before",s.before.value)},s.taxRate.onchange=()=>{x("before",s.before.value)},s.before.oninput=()=>{f("before",s.before.value)},s.before.onchange=()=>{x("before",s.before.value),Le(Lt,s.before.value),Ot(Lt,"wg-before-list")},s.tax.oninput=()=>{f("tax",s.tax.value)},s.tax.onchange=()=>{x("tax",s.tax.value)},s.after.oninput=()=>{f("after",s.after.value)},s.after.onchange=()=>{x("after",s.after.value),Le(Nt,s.after.value),Ot(Nt,"wg-after-list")},[s.before,s.tax,s.after,s.text].forEach(v=>{["click","focus"].forEach(g=>v.addEventListener(g,()=>{if(!v.value)return;navigator.clipboard.writeText(v.value);const m=v.style.backgroundColor;v.style.backgroundColor="#d1e7dd",setTimeout(()=>v.style.backgroundColor=m,300)}))}),!i){const v=Array.from(t.children).filter(u=>u!==c),g=we(t,[c],o,null,u=>{v.forEach(b=>b.style.display=u?"none":""),c.style.borderRadius=u?"8px":"0",u&&(t.style.top=window.innerHeight-(c.offsetHeight||34)+"px")}),m=pt(o);return m&&m.docked&&g.setDocked(!0),window.addEventListener("resize",()=>{g.isDocked()?t.style.top=window.innerHeight-c.offsetHeight+"px":l(t)}),g}return null}function Rn(){const t=document.getElementById("vnpt-inline-calc"),i=document.getElementById("vnpt-btn-calc-toggle");let o=p.calcWidget||document.createElement("div");if(!t&&!p.calcWidget?(o.id="vnpt-calc-widget",document.body.appendChild(o),p.calcWidget=o):t&&(o=p.widget),t&&i){let n=pt(ht)??{calc:!1,data:!0};const e=a=>{t.style.display=a?"none":"block",i.classList.toggle("active",!a)};e(n.calc),i.onclick=()=>{n.calc=!n.calc,Ht(ht,n),e(n.calc)}}return zn(o,t,ee)}function qn(){let t=!1;try{t=!1}catch{t=!1}t&&O.info("[Migration] Dev mode active - Syncing configurations...");let i=h.get(V);if(i){let n=!1;Object.keys(F).forEach(e=>{const a=F[e];if(!(e in i))i[e]=a,n=!0;else if(t){const r=i[e],l=a&&typeof a=="object",c=r&&typeof r=="object";let d=!1;!l&&!c?d=r!==a:l&&c?d=r.value!==a.value||r.label!==a.label:d=!0,d&&(i[e]=a,n=!0)}}),n&&h.set(V,i)}let o=h.get(H);if(o){let n=!1;Object.keys(F).forEach(e=>{const a=F[e],r=a&&typeof a=="object"?a.value:a,l=a&&typeof a=="object"?a.label:L[e]||"";if(!(e in o))o[e]={label:l,value:r,sync:""},n=!0;else if(t){const c=o[e];(c.value!==r||c.label!==l)&&(o[e]={label:l,value:r,sync:c.sync||""},n=!0)}}),n&&h.setDebounced(H,o,0)}}let kt=null;function Zt(){if(!window.__vnptInited){window.__vnptInited=!0,O.info("Initializing VNPT Userscript..."),qn();try{Ie(),mn(),Rn(),bn(),on(),Pt(),vn(),kn(),En(),In(),_n(),Ze(),an();const t=de(()=>{ne(),ie(),O.debug("DOM Cache & Labels refreshed due to mutations")},1500);kt=new MutationObserver(i=>{i.some(n=>n.addedNodes.length>0||n.removedNodes.length>0?[...n.addedNodes,...n.removedNodes].some(a=>a.nodeType===1&&!["SCRIPT","STYLE","LINK"].includes(a.tagName)):!1)&&t()}),kt.observe(document.body,{childList:!0,subtree:!0}),O.info("Userscript initialized successfully.")}catch(t){O.error("Error during userscript initialization:",t)}}}function Gn(){O.info("Cleaning up VNPT Userscript for reload..."),kt&&(kt.disconnect(),kt=null);const t=document.getElementById("vnpt-docx-widget");t&&t.remove();const i=document.getElementById("vnpt-calc-widget");i&&i.remove();const o=document.getElementById("vnpt-styles");o&&o.remove(),window.__vnptInited=!1,O.info("Cleanup completed.")}window.__vnptCleanup=Gn,window.__vnptInit=Zt,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Zt):Zt()})();
