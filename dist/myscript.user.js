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
(function(){"use strict";const U={info:(...t)=>console.log("[Tampermonkey Script] INFO:",...t),error:(...t)=>console.error("[Tampermonkey Script] ERROR:",...t),warn:(...t)=>console.warn("[Tampermonkey Script] WARN:",...t)};function pe(){const t="vnpt-styles";if(document.getElementById(t))return;const e=document.createElement("style");e.id=t,e.textContent=`
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

        .btn-fill-back { background: #f3e5f5; color: #7b1fa2; border: 1px solid rgba(123, 31, 162, 0.1); } 
        .btn-fill-back:hover { background: #7b1fa2; color: #fff; border-color: transparent; }
        
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

    `,document.head.appendChild(e)}const ue={widget:null,panel:null,header:null,bannerArea:null,toggleBtn:null,fieldsContainer:null,panelBody:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1,templateBuffer:null,templateName:null,hasDragged:!1},it=new Map,c=new Proxy(ue,{get(t,e){return e==="on"?(o,n)=>{it.has(o)||it.set(o,[]),it.get(o).push(n)}:t[e]},set(t,e,o){const n=t[e];return t[e]=o,n!==o&&it.has(e)&&it.get(e).forEach(a=>a(o,n)),!0}}),T={"tenDaiDienn, tenNguoiNhanCTS ":"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT","emailDaiDien, emailNhanCTS":"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Mã số thuế | GPKD",goiDV:"Gói Dịch Vụ","ngayKy, ngayKy1":"Ngày ký","thangKy, thangKy1":"Tháng Ký","namKy, namKy1":"Năm ký","ngayTiepNhan, ngayThangNamKy":"Ngày tiếp nhận / Ngày tháng năm ký","soHopDong, inputContractGroupName":"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký","lienheHopDongA, lienheTuVanA, lienheHoaDonA, sucoCap1A, sucoCap2A, sucoCap3A, sucoCap4A":"Liên hệ A"},mt=["soHopDong","tenDaiDienn","cmnd","sdt","diaChi","tenToChuc","ngayCapCustomer","emailDaiDien","soDkdn","goiDV","soHopDong"],tt="vnpt_docx_fields",K="vnpt_docx_default_fields",bt="vnpt_docx_position",vt="vnpt_docx_size",yt="vnpt_docx_opened",P="vnpt_autofill_data_default",X="vnpt_autofill_data_custom",q="vnpt_autofill_data_sync",Gt="vnpt_widget_pos",Y="vnd_tax_rate",xt="vnd_before_history",wt="vnd_after_history",rt="vnpt_widget_collapsed",z="vnd_calc_map",et="vnpt_widget_datatab",lt="vnpt_templates",Lt="vnpt_txt_template",$t="vnpt_gemini_api_key",qt="vnpt_gemini_model",st="vnpt_hotkeys",fe=Object.freeze(Object.defineProperty({__proto__:null,DEFAULT_LABELS:T,LOCAL_KEY_DEFAULT_FIELDS:K,LOCAL_KEY_FIELDS:tt,LOCAL_KEY_OPENED:yt,LOCAL_KEY_POS:bt,LOCAL_KEY_SIZE:vt,REQUIRED_KEYS:mt,SK_CALC_MAP:z,SK_COLLAPSE:rt,SK_DATATAB:et,SK_DATA_CUS:X,SK_DATA_DEF:P,SK_DATA_SYNC:q,SK_GEMINI_KEY:$t,SK_GEMINI_MODEL:qt,SK_HIST_A:wt,SK_HIST_B:xt,SK_HOTKEYS:st,SK_POS_CALC:Gt,SK_TAX:Y,SK_TEMPLATES:lt,SK_TXT_TEMPLATE:Lt},Symbol.toStringTag,{value:"Module"}));let V=null;function C(t,e="#198754",o=2500){V||(V=document.createElement("div"),V.id="vnpt-toast-container",Object.assign(V.style,{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column-reverse",alignItems:"center",gap:"8px",zIndex:"1000000",pointerEvents:"none"}),document.body.appendChild(V));const n=document.createElement("div");n.innerText=t,Object.assign(n.style,{background:e,color:"#fff",padding:"8px 18px",borderRadius:"24px",opacity:"0",transform:"translateY(10px)",transition:"opacity 0.3s, transform 0.3s",fontSize:"13px",fontWeight:"500",fontFamily:"'Segoe UI', Roboto, sans-serif",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",whiteSpace:"nowrap",pointerEvents:"auto"}),V.appendChild(n),requestAnimationFrame(()=>{n.style.opacity="1",n.style.transform="translateY(0)"}),setTimeout(()=>{n.style.opacity="0",n.style.transform="translateY(-10px)",setTimeout(()=>{n.remove(),V&&V.childNodes.length},300)},o)}const ge="vnpt_templates_db",j="buffers";let kt=null;function Nt(){return kt?Promise.resolve(kt):new Promise((t,e)=>{const o=indexedDB.open(ge,1);o.onupgradeneeded=n=>{const a=n.target.result;a.objectStoreNames.contains(j)||a.createObjectStore(j)},o.onsuccess=n=>{kt=n.target.result,t(kt)},o.onerror=()=>e(o.error)})}async function he(t,e){const o=await Nt();return new Promise((n,a)=>{const u=o.transaction(j,"readwrite").objectStore(j).put(e,t);u.onsuccess=()=>n(),u.onerror=()=>a(u.error)})}async function me(t){const e=await Nt();return new Promise((o,n)=>{const s=e.transaction(j,"readonly").objectStore(j).get(t);s.onsuccess=()=>o(s.result),s.onerror=()=>n(s.error)})}async function be(t){const e=await Nt();return new Promise((o,n)=>{const s=e.transaction(j,"readwrite").objectStore(j).delete(t);s.onsuccess=()=>o(),s.onerror=()=>n(s.error)})}const W=new Map,Et=new Map,h={isGM:typeof GM_setValue<"u"&&typeof GM_getValue<"u",get(t,e=null){if(W.has(t))return W.get(t);try{let o;if(this.isGM?o=GM_getValue(t,null):o=localStorage.getItem(t),o==null)return e;const n=typeof o=="string"?JSON.parse(o):o;return W.set(t,n),n}catch(o){return console.warn(`[Storage] Không thể đọc key "${t}":`,o),e}},set(t,e){W.set(t,e);try{return this.isGM?GM_setValue(t,e):localStorage.setItem(t,JSON.stringify(e)),!0}catch(o){return console.error(`[Storage] Không thể ghi key "${t}":`,o),!1}},setDebounced(t,e,o=500){W.set(t,e),Et.has(t)&&clearTimeout(Et.get(t));const n=setTimeout(()=>{this.set(t,e),Et.delete(t)},o);Et.set(t,n)},remove(t){W.delete(t);try{this.isGM?GM_deleteValue(t):localStorage.removeItem(t)}catch(e){console.error(`[Storage] Không thể xóa key "${t}":`,e)}},clearCache(){W.clear()}};function ct(){try{const t=h.get(lt)||[],e=t.filter(o=>o.type!=="local");return e.length!==t.length&&dt(e),e}catch{return[]}}function dt(t){h.set(lt,t)}function ve(t){const e=t.match(/drive\.google\.com\/file\/d\/([^/]+)/);return e?`https://drive.google.com/uc?export=download&id=${e[1]}`:t}function ye(t){return new Promise((e,o)=>{GM_xmlhttpRequest({method:"GET",url:ve(t),responseType:"arraybuffer",onload:n=>{if(n.status>=200&&n.status<300){if(n.response&&n.response.byteLength>4){const a=new Uint8Array(n.response.slice(0,4));if(a[0]===80&&a[1]===75&&a[2]===3&&a[3]===4){e(n.response);return}else{o(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}e(n.response)}else o(new Error(`HTTP ${n.status}: Không lấy được file`))},onerror:()=>o(new Error("Không thể tải URL.")),ontimeout:()=>o(new Error("Timeout khi tải URL."))})})}async function xe(t,e,o){const n=t.name.replace(/\.docx$/i,""),a=prompt("Đặt tên biến nhớ cho file này:",n);if(!(!a||!a.trim()))try{const i=await t.arrayBuffer();await he(a.trim(),i);const u=ct().filter(l=>l.name!==a.trim()&&l.fileName!==t.name);u.unshift({name:a.trim(),type:"local_idb",fileName:t.name,lastUsed:Date.now()}),dt(u),Q(e,o),o&&o(i,a.trim())}catch(i){C(`❌ Lỗi lưu file: ${i.message}`,"#dc3545")}}function Q(t,e,o=null){let n=t.querySelector(".vnpt-template-manager-inner"),a,i;if(n)a=n.querySelector(".vnpt-local-list-container"),i=n.querySelector(".vnpt-btn-wrap");else{t.innerHTML="",n=document.createElement("div"),n.className="vnpt-template-manager-inner";const l=document.createElement("div");l.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const d=document.createElement("span");d.className="vnpt-title-main",d.style.cssText="font-size:11px;font-weight:700;color:#444;",i=document.createElement("div"),i.className="vnpt-btn-wrap",i.style.cssText="display:flex;gap:4px;",l.appendChild(d),l.appendChild(i),n.appendChild(l),a=document.createElement("div"),a.className="vnpt-local-list-container",a.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",n.appendChild(a),t.appendChild(n)}const s=ct(),u=n.querySelector(".vnpt-title-main");u.innerHTML="Templates"+(o?` <span style="color:#2e7d32;">(Đang dùng: ${o})</span>`:""),s.length===0?a.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':a.innerHTML="",s.forEach((l,d)=>{const r=document.createElement("div");r.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",r.title=l.fileName||l.url||l.name,r.tabIndex=0,r.onfocus=()=>r.style.boxShadow="0 0 0 2px #28a745",r.onblur=()=>r.style.boxShadow="none";const m=l.type==="local"||l.type==="local_base64"||l.type==="local_idb"?"OFF":"ON",x=m==="OFF"?"#6c757d":"#28a745",b=document.createElement("span");b.textContent=m,b.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${x};color:#fff;`;const g=document.createElement("span");g.textContent=l.name,g.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",r.onclick=()=>{r.focus(),we(l,e,o,t)},r.appendChild(b),r.appendChild(g);const p=document.createElement("button");p.innerHTML="✎",p.title="Đổi tên template",p.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",p.onclick=y=>{y.stopPropagation();const v=prompt("Đổi tên template:",l.name);if(v&&v.trim()&&v.trim()!==l.name){const E=ct();E[d].name=v.trim(),dt(E),Q(t,e,o)}},r.appendChild(p);const f=document.createElement("button");f.innerHTML="✕",f.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",f.onclick=async y=>{if(y.stopPropagation(),confirm(`Xoá biểu mẫu "${l.name}"?`)){const v=ct();v.splice(d,1),dt(v),l.type==="local_idb"&&await be(l.name).catch(()=>null),Q(t,e,o===l.name?null:o)}},r.appendChild(f),a.appendChild(r)})}function we(t,e,o,n){const a=ct(),i=a.find(s=>s.name===t.name&&(s.url===t.url||s.type===t.type));if(i&&(i.lastUsed=Date.now(),dt(a)),t.type==="local_idb"){me(t.name).then(s=>{if(!s)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");e&&e(s,t.name),Q(n,e,t.name)}).catch(s=>{C(`❌ Lỗi nạp File IDB: ${s.message}`,"#dc3545")});return}if(t.type==="local_base64"&&t.data){try{const s=window.atob(t.data.split(",")[1]),u=s.length,l=new Uint8Array(u);for(let d=0;d<u;d++)l[d]=s.charCodeAt(d);e&&e(l.buffer,t.name),Q(n,e,t.name)}catch(s){C(`❌ Lỗi nạp Base64: ${s.message}`,"#dc3545")}return}ye(t.url).then(s=>{e&&e(s,t.name),Q(n,e,t.name)}).catch(s=>{C(`❌ ${s.message}`,"#dc3545")})}function ke(t,e){if(t.length===0)return e.length;if(e.length===0)return t.length;const o=[];for(let n=0;n<=e.length;n++)o[n]=[n];for(let n=0;n<=t.length;n++)o[0][n]=n;for(let n=1;n<=e.length;n++)for(let a=1;a<=t.length;a++)e.charAt(n-1)===t.charAt(a-1)?o[n][a]=o[n-1][a-1]:o[n][a]=Math.min(o[n-1][a-1]+1,o[n][a-1]+1,o[n-1][a]+1);return o[e.length][t.length]}function Ee(t,e){let o=t,n=e;t.length<e.length&&(o=e,n=t);const a=o.length;return a===0?1:(a-ke(o,n))/parseFloat(a)}function Ce(t,e,o=.7){let n=null,a=-1;const i=t.toLowerCase().trim();for(const s of e){const u=s.toLowerCase().trim(),l=Ee(i,u);l>a&&l>=o&&(a=l,n=s)}return n}function Te(t){if(!t)return"";let e=t.replace(/\D/g,"");return e.startsWith("84")&&(e="0"+e.slice(2)),e}function Se(t){if(!t)return"";const e=t.split(/[-/]/);if(e.length===3){let o,n,a;return e[0].length===4?[a,n,o]=e:[o,n,a]=e,`${o.padStart(2,"0")}/${n.padStart(2,"0")}/${a}`}return t}const pt=new Map;let Dt=[],Vt=0;const Le=3e3;function Ne(){pt.clear()}function jt(){Dt=Array.from(document.querySelectorAll("label, .label, .label-text, span.title, .form-label")),Vt=Date.now()}function De(t){t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}))}function ut(t,e){var a;const o=t.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,n=(a=Object.getOwnPropertyDescriptor(o,"value"))==null?void 0:a.set;n?n.call(t,e):t.value=e,De(t)}function nt(t,e=null){if(!t)return null;const o=pt.get(t);if(o&&document.contains(o))return o;const n=document.getElementById(t);if(n&&(n.tagName==="INPUT"||n.tagName==="TEXTAREA"||n.tagName==="SELECT"))return pt.set(t,n),n;const a=`input[id="${t}"], textarea[id="${t}"], select[id="${t}"], input[name="${t}"], textarea[name="${t}"], input[formcontrolname="${t}"], textarea[formcontrolname="${t}"], input[placeholder="${t}"], textarea[placeholder="${t}"]`,i=document.querySelector(a);if(i)return pt.set(t,i),i;const s=e||t;(Dt.length===0||Date.now()-Vt>Le)&&jt();const u=Dt;let l=u.find(d=>d.innerText.trim()===s);if(!l&&s.length>2){const d=u.map(m=>m.innerText.trim()).filter(m=>m.length>0),r=Ce(s,d,.8);r&&(l=u.find(m=>m.innerText.trim()===r))}if(l){let d=null;if(l.htmlFor&&(d=document.getElementById(l.htmlFor)),!d){let r=l.parentElement,m=0;for(;r&&m<3;){const x=r.querySelector("input, textarea, select");if(x){d=x;break}r=r.parentElement,m++}}if(d)return pt.set(t,d),d}return null}function Bt(t){return nt(null,t)}function J(t,e,o=null){const n=nt(t,o);n&&ut(n,e)}function Be(t=new Date){return String(t.getDate()).padStart(2,"0")}function Ie(t=new Date){return String(t.getMonth()+1).padStart(2,"0")}function Ae(t=new Date){return String(t.getFullYear())}function Ut(){const t=new Date;return{ngay:Be(t),thang:Ie(t),nam:Ae(t)}}const{ngay:Xt,thang:Yt,nam:Wt}=Ut(),M={"ngayKy, ngayKy1":{label:"Ngày ký",value:Xt},"thangKy, thangKy1":{label:"Tháng ký",value:Yt},"namKy, namKy1":{label:"Năm ký",value:Wt},"ngayTiepNhan, ngayThangNamKy":{label:"Ngày ký (full)",value:`${Xt}/${Yt}/${Wt}`},tenDoanhNghiepB:{label:"Tên doanh nghiệp B",value:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM"},diaChiB:{label:"Địa chỉ B",value:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội"},maSoThueB:{label:"Mã số thuế B",value:"0100686223"},stkB:{label:"Số tài khoản B",value:"1600114156"},diaChiStkB:{label:"Ngân hàng/Địa chỉ STK B",value:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)"},"tenB, nguoiDaiDienB":{label:"Người đại diện B",value:"Phạm Khánh Chung"},"chucVuB, chucVuDaiDienB":{label:"Chức vụ B",value:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp"},"giayUyQuyenSoB, soGiayUyQuyenB":{label:"Giấy ủy quyền số B",value:"2628/GUQ-VNPT-HNI-VP"},"giayUyQuyenNgayB, ngayGiayUyQuyenB":{label:"Giấy ủy quyền ngày B",value:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},GiayUyQuyenB:{label:"Giấy ủy quyền B (full)",value:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},tenDoanhNghiepB1:{label:"Tên doanh nghiệp B (phụ)",value:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},donViTiepNhan:{label:"Đơn vị tiếp nhận",value:"TTKD KHDN"},"tenTiepNhan, tenNguoiNhan":{label:"Người tiếp nhận",value:"Bùi Anh"},dienThoaiB:{label:"Điện thoại B",value:"02436686868"},diaChiTaiKhoanB:{label:"Địa chỉ tài khoản B",value:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 "},noiKy:{label:"Nơi ký",value:"Hà Nội"},emailB:{label:"Email B",value:""},"lienheHopDongB, lienheTuVanB, lienheHoaDonB, sucoCap1B, sucoCap2B, sucoCap3B, sucoCap4B":{label:"Liên hệ B (AM)",value:"AM Bùi Anh"}},Qt={soHopDong:"soHopDong, inputContractGroupName"},It={after:["cuocDV","tongCong","tongCongHD","congCA","giaTriHopDong","tongGIaTriHopDong"],before:["donGiaCA","thanhTienCA","tongThanhTien","tongCuocTruocThue"],tax:["tongThueGTGT","tongThue","thueCA","thueVAT"],text:["soTienThanhToanBangChu","tongCongBangChu","tongCongHDbangChu","ghiChuGiaTriHopDong","tongGiaTriHopDongBangChu"]},Me=.08,At={SCAN:{key:"s",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Quét dữ liệu"},FILL:{key:"f",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Điền Web"},SCAN_PDF:{key:"p",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Scan PDF (AI)"},EXPORT_DOCX:{key:"e",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Xuất DOCX"},COPY_TXT:{key:"c",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Copy Text (Template)"},TOGGLE:{key:"w",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Đóng/Mở Widget"},CLEAN:{key:"d",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Clean Data"}};function Jt(t,e){let o;return function(...a){const i=()=>{clearTimeout(o),t(...a)};clearTimeout(o),o=setTimeout(i,e)}}function Zt(){const t=h.get(P)??{...M},e=h.get(X)??{},o={...t,...e};Object.keys(o).forEach(n=>{const a=o[n],i=a&&typeof a=="object"&&a.hasOwnProperty("value")?a.value:a;n.split(",").map(u=>u.trim()).filter(u=>u).forEach(u=>{let l=nt(u)||Bt(u);l&&ut(l,i)})}),C("✅ Auto fill complete")}function _e(){let t=h.get(q)??{};const e={...Qt,...t},o=Object.keys(e);if(o.length===0){C("⚠️ No sync mapping","#ffc107");return}o.forEach(n=>{let a=nt(n)||Bt(n);a&&a.value!==void 0&&a.value!==""&&e[n].split(",").map(s=>s.trim()).filter(s=>s).forEach(s=>J(s,a.value))}),C("✅ Sync form complete","#d39e00")}let Mt=!1;const te=new Map,Oe=(t,e)=>{var l;if(Mt)return;let o=h.get(q)??{};const n={...Qt,...o};if(Object.keys(n).length===0)return;let a=t.id,i=t.name,s=null;if(a){const d=document.querySelector(`label[for="${a}"]`);d&&(s=d.textContent.trim())}if(!s){const d=t.closest("label");d&&(s=(l=Array.from(d.childNodes).find(r=>r.nodeType===3))==null?void 0:l.textContent.trim())}let u=n[a]||n[i]||n[s];if(u){Mt=!0;try{u.split(",").map(r=>r.trim()).filter(r=>r).forEach(r=>{if(r!==a&&r!==i&&r!==s){let m=te.get(r);(!m||!document.contains(m))&&(m=nt(r)||Bt(r),m&&te.set(r,m)),m&&document.activeElement!==m&&ut(m,e)}})}finally{Mt=!1}}},He=Jt((t,e)=>{Oe(t,e)},250);function Ke(){document.addEventListener("input",t=>{const e=t.target;!e||!["INPUT","TEXTAREA"].includes(e.tagName)||e.closest("#vnpt-docx-widget")||e.closest("#vnpt-inline-calc")||He(e,e.value)})}function B(t,e,o=null,n=""){const a=c.fieldsContainer.querySelector(".text-hint");a&&a.remove();const i=c.fieldsContainer.querySelectorAll(".f-key");let s=!1;const u=t.split(",")[0].trim();for(let l of i)if(l.value.split(",")[0].trim()===u){const r=l.closest(".vnpt-field-row"),m=r.querySelector(".f-val"),x=r.querySelector(".f-label");e!==""&&m.value!==e&&document.activeElement!==m&&(m.value=e),o!==null&&o!==""&&x.value!==o&&document.activeElement!==x&&(x.value=o),n!==""&&l.value!==t+", "+n&&document.activeElement!==l&&(l.value=t+", "+n),s=!0;break}if(!s){(o===null||o==="")&&(o=T[t]||"");const l=document.createElement("div");l.className="vnpt-field-row row-item",l.setAttribute("draggable","false");let d=t;n&&(d+=", "+n);const r=u;l.innerHTML=`
            <input type="checkbox" id="chk-${r}" name="chk-${r}" class="row-chk" title="Chọn" style="margin: 0 2px 0 2px;" />
            <input type="text" id="lbl-${r}" name="lbl-${r}" class="f-label" value="${o}" />
            <input type="text" id="key-${r}" name="key-${r}" class="f-key" value="${d}" title="Biến DOCX và IDs đồng bộ" />
            <span class="row-drag-handle" title="Kéo">=</span>
            <input type="text" id="val-${r}" name="val-${r}" class="f-val" value="${e}" />
        `;const m=l.querySelector(".f-val"),x=l.querySelector(".f-key");t==="tenToChuc"&&(m.style.textAlign="right");const b=()=>{mt.includes(u)&&(m.value.trim()?m.classList.remove("field-required-empty"):m.classList.add("field-required-empty"))},g=()=>{const f=m.value;x.value.split(",").map(v=>v.trim()).filter(v=>v).forEach(v=>J(v,f))};x.addEventListener("input",function(){A();const f=this.value.split(",")[0].trim();m.style.textAlign=f==="tenToChuc"?"right":""}),x.addEventListener("change",function(){g()}),l.querySelector(".f-label").addEventListener("input",A),m.addEventListener("input",function(){A(),b()}),m.addEventListener("change",function(){g()}),b();const p=l.querySelector(".row-drag-handle");p.addEventListener("mouseenter",()=>l.setAttribute("draggable","true")),p.addEventListener("mouseleave",()=>{l.classList.contains("dragging")||l.setAttribute("draggable","false")}),l.addEventListener("dragstart",function(f){c.draggedRowForVNPT=this,f.dataTransfer.effectAllowed="move",f.dataTransfer.setData("text/plain",t),this.classList.add("dragging")}),l.addEventListener("dragover",f=>(f.preventDefault(),!1)),l.addEventListener("dragenter",function(){this.classList.add("over")}),l.addEventListener("dragleave",function(){this.classList.remove("over")}),l.addEventListener("drop",function(f){if(f.stopPropagation(),c.draggedRowForVNPT&&c.draggedRowForVNPT!==this){const y=Array.from(c.fieldsContainer.querySelectorAll(".vnpt-field-row")),v=y.indexOf(c.draggedRowForVNPT),E=y.indexOf(this);v<E?this.parentNode.insertBefore(c.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(c.draggedRowForVNPT,this),A()}return!1}),l.addEventListener("dragend",function(){this.setAttribute("draggable","false"),c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(f=>{f.classList.remove("over","dragging")}),c.draggedRowForVNPT=null}),c.fieldsContainer.appendChild(l),c.fieldsContainer.scrollTop=c.fieldsContainer.scrollHeight}}function A(){const t=c.isDefaultMode?K:tt,e={};c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(n=>{const i=n.querySelector(".f-key").value.trim().split(",").map(r=>r.trim()).filter(r=>r),s=i[0],u=i.slice(1).join(", "),l=n.querySelector(".f-label").value.trim(),d=n.querySelector(".f-val").value;s&&(e[s]={label:l,value:d,sync:u})}),h.setDebounced(t,e,1e3)}function _t(){try{c.fieldsContainer.innerHTML="";const e=h.get(tt)||{};Object.keys(T).forEach(o=>{const n=T[o],a=e[o];a&&typeof a=="object"?B(o,a.value,a.label||n,a.sync||""):a?B(o,a,n,""):B(o,"",n,"")}),Object.keys(e).forEach(o=>{if(!(o in T)){const n=e[o];typeof n=="object"?B(o,n.value,n.label,n.sync||""):B(o,n,"","")}}),Object.keys(T).length===0&&Object.keys(e).length===0&&(c.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(e){console.error("Error loading config:",e),Object.keys(T).forEach(o=>B(o,"",T[o]))}const t=h.get(bt);t&&c.widget&&(c.widget.style.bottom="auto",t.right?(c.widget.style.right=t.right,c.widget.style.left="auto"):t.left&&(c.widget.style.left=t.left,c.widget.style.right="auto"),t.top&&(c.widget.style.top=t.top))}function Pe(){document.getElementById("vnpt-btn-toggle-id").onclick=()=>c.fieldsContainer.classList.toggle("show-ids");const t=document.getElementById("vnpt-btn-clean-data");t&&(t.onclick=()=>{confirm("Làm sạch dữ liệu hiện tại và tải lại toàn bộ cấu trúc mặc định?")&&(h.remove(tt),h.remove(z),h.remove(Y),document.querySelectorAll("input[data-clink]").forEach(e=>{const o=e.dataset.clink;e.value=(It[o]||[]).join(", ")}),c.isDefaultMode?(h.remove(K),Ot(!0)):_t(),C("🧹 Đã làm sạch toàn bộ dữ liệu & cấu hình","#1a73e8"))}),document.getElementById("vnpt-btn-default").onclick=()=>{c.isDefaultMode=!c.isDefaultMode},c.on("isDefaultMode",e=>Ot(e)),document.getElementById("vnpt-btn-reset-default").onclick=()=>{confirm("Khôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?")&&(h.remove(K),h.remove(z),h.remove(Y),c.isDefaultMode&&(Ot(!0),C("🔄 Đã khôi phục dữ liệu gốc","#1a73e8")))},document.getElementById("vnpt-btn-batch-del").onclick=()=>{const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row");let o=0;e.forEach(n=>{var a;(a=n.querySelector(".row-chk"))!=null&&a.checked&&(n.remove(),o++)}),o===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(e.forEach(n=>n.remove()),C("🗑️ Đã xóa toàn bộ","#ff5252"),A()):(C(`🗑️ Đã xóa ${o} trường`,"#ff5252"),A())},document.getElementById("vnpt-btn-add").onclick=()=>{const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;B("bien_moi_"+e,"","",""),A()},document.getElementById("vnpt-btn-fill-back").onclick=()=>{Zt();let e=0;c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(o=>{const n=o.querySelector(".f-key").value.trim(),a=o.querySelector(".f-val").value;n.split(",").map(i=>i.trim()).filter(Boolean).forEach(i=>{(document.getElementById(i)||document.getElementsByName(i)[0])&&(J(i,a),e++)})}),e>0?C(`✅ Đã điền ngược ${e} trường`,"#198754"):C("⚠️ Không khớp trường nào","#ffc107")}}function Ot(t){const e=document.getElementById("vnpt-btn-default"),o=document.getElementById("vnpt-btn-reset-default");if(c.fieldsContainer.innerHTML="",c.bannerArea.innerHTML="",t){e.classList.add("active"),e.innerHTML="✅ Chế độ: Dữ liệu mặc định",o&&(o.style.display="flex"),document.getElementById("vnpt-fields-container").classList.add("vnpt-mode-default"),C("📌 Chế độ Dữ liệu mặc định (Có thể sửa)","#ea4335");const n=document.createElement("div");n.className="vnpt-default-banner",n.innerHTML='<span style="color: red;"> LƯU Ý: ĐÂY LÀ DỮ LIỆU MẶC ĐỊNH</span>',c.bannerArea.appendChild(n);const a=h.get(K);a===null?Object.keys(M).forEach(i=>{const s=M[i],u=s&&typeof s=="object"?s.value:s,l=s&&typeof s=="object"?s.label:T[i]||"";B(i,u,l)}):Object.keys(a).forEach(i=>{const s=a[i];B(i,s.value,s.label,s.sync||"")})}else e.classList.remove("active"),e.innerHTML="🛠 Dữ liệu mặc định VNPT",o&&(o.style.display="none"),document.getElementById("vnpt-fields-container").classList.remove("vnpt-mode-default"),C("📋 Đã quay lại Dữ liệu cá nhân"),_t()}function ee(t){if(!t)return t;const e={};return Object.keys(t).forEach(o=>{const n=t[o];o.split(",").map(i=>i.trim()).filter(i=>i).forEach(i=>{e[i]=n})}),e}function ne(){const t={version:"1.0",timestamp:new Date().toISOString(),backup:{fields:h.get(tt),defaultFields:h.get(K),dataDefault:ee(h.get(P)),dataCustom:ee(h.get(X)),dataSync:h.get(q),taxRate:h.get(Y),calcMap:h.get(z),templates:h.get(lt)}},e=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),o=URL.createObjectURL(e),n=document.createElement("a");n.href=o,n.download=`vnpt_full_backup_${new Date().toLocaleDateString().replace(/\//g,"-")}.json`,n.click(),URL.revokeObjectURL(o),C("✅ Đã xuất file sao lưu hệ thống.")}async function oe(t){return new Promise(e=>{const o=new FileReader;o.onload=n=>{try{const a=JSON.parse(n.target.result);if(!a.backup)throw new Error("File không đúng định dạng backup.");const i=a.backup;i.fields&&h.set(tt,i.fields),i.defaultFields&&h.set(K,i.defaultFields),i.dataDefault&&h.set(P,i.dataDefault),i.dataCustom&&h.set(X,i.dataCustom),i.dataSync&&h.set(q,i.dataSync),i.taxRate&&h.set(Y,i.taxRate),i.calcMap&&h.set(z,i.calcMap),i.templates&&h.set(lt,i.templates),C("✅ Đã nhập dữ liệu thành công! Vui lòng tải lại trang hoặc widget.","#1e8e3e"),e(!0)}catch{C("❌ Lỗi: File sao lưu không hợp lệ.","#ff5252"),e(!1)}},o.readAsText(t)})}let Ht=!1,ot=null,ft=null;function ze(){window.addEventListener("keydown",t=>{if(Ht&&ft){$e(t);return}const e=h.get(st,At);for(const[o,n]of Object.entries(e))if(Fe(t,n)){t.preventDefault(),Re(o);return}})}function Fe(t,e){if(!e||!e.key)return!1;const o=t.key.toLowerCase()===e.key.toLowerCase(),n=!!t.altKey==!!e.altKey,a=!!t.ctrlKey==!!e.ctrlKey,i=!!t.shiftKey==!!e.shiftKey;return o&&n&&a&&i}function Re(t){var e,o,n,a,i,s,u;switch(t){case"SCAN":(e=document.getElementById("vnpt-btn-scan"))==null||e.click();break;case"FILL":(o=document.getElementById("vnpt-btn-fill-back"))==null||o.click();break;case"SCAN_PDF":(n=document.getElementById("vnpt-btn-scan-pdf"))==null||n.click();break;case"EXPORT_DOCX":(a=document.getElementById("vnpt-btn-export"))==null||a.click();break;case"COPY_TXT":(i=document.getElementById("vnpt-btn-export-txt"))==null||i.click();break;case"TOGGLE":(s=document.getElementById("vnpt-toggle-btn"))==null||s.click();break;case"CLEAN":(u=document.getElementById("vnpt-btn-clean-data"))==null||u.click();break}}function Ge(t,e){Ht=!0,ot=t,ft=e,C("Vui lòng nhấn tổ hợp phím mong muốn...","info")}function $e(t){var a;if(["Alt","Control","Shift","Meta"].includes(t.key))return;t.preventDefault(),t.stopPropagation();const e={key:t.key.toLowerCase(),altKey:t.altKey,ctrlKey:t.ctrlKey,shiftKey:t.shiftKey},o=h.get(st,At);o[ot]={...o[ot],...e},h.set(st,o);const n=((a=o[ot])==null?void 0:a.label)||ot;C(`Đã lưu phím tắt cho ${n}: ${Kt(e)}`,"success"),ft&&ft(e),Ht=!1,ot=null,ft=null}function Kt(t){if(!t||!t.key)return"Chưa gán";const e=[];t.ctrlKey&&e.push("Ctrl"),t.altKey&&e.push("Alt"),t.shiftKey&&e.push("Shift");let o=t.key.toUpperCase();return o===" "&&(o="Space"),e.push(o),e.join(" + ")}function qe(){const t=document.getElementById("vnpt-docx-widget")||document.createElement("div");t.id="vnpt-docx-widget";const e=h.get(yt)===!0;t.innerHTML=`
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
                    <button class="vnpt-btn-action btn-scan-pdf" id="vnpt-btn-scan-pdf" title="Scan file PDF bằng AI để tự động điền">📄 PDF</button>
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-scan" title="Lấy data theo biểu mẫu web">Quét dữ liệu</button>
                    <button class="vnpt-btn-action btn-fill-back" id="vnpt-btn-fill-back" title="Điền dữ liệu ngược lên web">Điền web</button>
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-toggle-id" title="Ẩn hiện key">Hiện/Ẩn Mã ID</button>
                    <input type="file" id="vnpt-pdf-input" accept=".pdf" style="display:none;" />
                </div>
                <div class="header-right">
                    <button class="vnpt-btn-icon btn-add" id="vnpt-btn-add" title="Chèn thêm trường trống">✚</button>
                    <button class="vnpt-btn-icon btn-clean" id="vnpt-btn-batch-del" title="Xóa chọn / Xóa tất cả">🗑</button>
                    
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
                                    <optgroup label="Thế hệ 2.0 (Khuyên dùng)">
                                        <option value="gemini-2.0-flash-001">Gemini 2.0 Flash (Cân bằng)</option>
                                        <option value="gemini-2.0-flash-lite-preview-02-05">Gemini 2.0 Flash-Lite (Siêu nhanh)</option>
                                        <option value="gemini-2.0-pro-exp-02-05">Gemini 2.0 Pro Experimental (Cao cấp nhất)</option>
                                    </optgroup>
                                    <optgroup label="Thế hệ 1.5 (Ổn định)">
                                        <option value="gemini-1.5-flash-latest">Gemini 1.5 Flash (Tốc độ)</option>
                                        <option value="gemini-1.5-pro-latest">Gemini 1.5 Pro (Thông minh)</option>
                                        <option value="gemini-1.5-flash-8b-latest">Gemini 1.5 Flash-8B (Tối ưu số lượng)</option>
                                    </optgroup>
                                </select>
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
    `,document.body.appendChild(t),c.widget=t,c.panel=document.getElementById("vnpt-export-panel"),c.toggleBtn=document.getElementById("vnpt-toggle-btn"),c.header=document.getElementById("vnpt-panel-header"),c.bannerArea=document.getElementById("vnpt-banner-area"),c.fieldsContainer=document.getElementById("vnpt-fields-list");try{const p=h.get(vt);p&&p.width&&p.height&&(c.panel.style.width=p.width+"px",c.panel.style.height=p.height+"px")}catch(p){console.error("Lỗi load size panel:",p)}new ResizeObserver(p=>{if(c.panel.style.display!=="none")for(let f of p){const{width:y,height:v}=f.contentRect;y>0&&v>0&&h.setDebounced(vt,{width:Math.round(y+20),height:Math.round(v+20)},1e3)}}).observe(c.panel),c.panelBody=document.getElementById("vnpt-panel-body"),Q(document.getElementById("vnpt-template-manager"),(p,f)=>{c.templateBuffer=p,c.templateName=f}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const p=this.files&&this.files[0];if(!p)return;const f=document.getElementById("vnpt-template-manager");xe(p,f,(y,v)=>{c.templateBuffer=y,c.templateName=v}),this.value=""}),c.toggleBtn.addEventListener("click",p=>{c.hasDragged||(c.panel.style.display==="none"?(c.panel.style.display="flex",c.toggleBtn.className="btn-opened",c.toggleBtn.innerHTML="✖",h.set(yt,!0)):(c.panel.style.display="none",c.toggleBtn.className="btn-closed",c.toggleBtn.innerHTML="📄",h.set(yt,!1)))});const n=document.getElementById("vnpt-btn-more"),a=document.getElementById("vnpt-util-menu"),i={S:{width:"380px",height:"420px"},M:{width:"460px",height:"600px"},L:{width:"620px",height:"800px"},Full:{width:"98vw",height:"92vh"}},s=h.get(z)||{};a.querySelectorAll("input[data-clink]").forEach(p=>{const f=p.dataset.clink,y=s[f]||It[f]||[];p.value=y.join(", "),p.onchange=()=>{const v=h.get(z)||{};v[f]=p.value.split(",").map(E=>E.trim()).filter(E=>E),h.set(z,v)}});const u=document.getElementById("vnpt-gemini-key"),l=document.getElementById("vnpt-gemini-model");u&&l&&Promise.resolve().then(()=>fe).then(({SK_GEMINI_KEY:p,SK_GEMINI_MODEL:f})=>{u.value=h.get(p)||"",l.value=h.get(f)||"gemini-2.0-flash",u.onchange=()=>{h.set(p,u.value.trim())},l.onchange=()=>{h.set(f,l.value)}}),document.getElementById("vnpt-btn-export-json").onclick=()=>ne();const d=document.getElementById("vnpt-txt-toggle"),r=document.getElementById("vnpt-txt-body");d&&r&&d.addEventListener("click",p=>{p.stopPropagation();const f=r.style.display==="none";r.style.display=f?"":"none",d.textContent=f?"▲":"▶"});const m=document.getElementById("vnpt-btn-import-json"),x=document.getElementById("vnpt-file-import-json");m.onclick=()=>x.click(),x.onchange=async p=>{p.target.files.length>0&&await oe(p.target.files[0])&&setTimeout(()=>location.reload(),1500)},n.addEventListener("click",p=>{p.stopPropagation();const f=a.classList.toggle("show");n.classList.toggle("active",f)}),a.addEventListener("click",p=>{p.stopPropagation()}),document.addEventListener("click",p=>{a.classList.contains("show")&&(a.classList.remove("show"),n.classList.remove("active"))}),a.querySelectorAll(".size-options button").forEach(p=>{p.addEventListener("click",f=>{const y=f.target.getAttribute("data-size"),v=i[y];v&&(c.panel.style.width=v.width,c.panel.style.height=v.height),a.classList.remove("show"),n.classList.remove("active")})});function b(){const p=document.getElementById("vnpt-hotkey-list");if(!p)return;const f=h.get(st,At);p.innerHTML="",Object.entries(f).forEach(([y,v])=>{const E=document.createElement("div");E.className="vnpt-hotkey-row",E.innerHTML=`
                <span class="vnpt-hotkey-label">${v.label||y}</span>
                <button class="vnpt-hotkey-btn" data-action="${y}">${Kt(v)}</button>
            `;const N=E.querySelector(".vnpt-hotkey-btn");N.onclick=R=>{R.stopPropagation(),!N.classList.contains("recording")&&(N.classList.add("recording"),N.textContent="Bấm phím...",Ge(y,D=>{N.classList.remove("recording"),N.textContent=Kt(D)}))},p.appendChild(E)})}b(),c.panel.querySelectorAll(".vnpt-resizer").forEach(p=>{p.addEventListener("mousedown",f=>{f.preventDefault(),f.stopPropagation();const y=f.clientX,v=f.clientY,E=c.panel.offsetWidth,N=c.panel.offsetHeight,R=c.widget.getBoundingClientRect(),D=R.top;window.innerWidth-R.right,c.panel.classList.add("vnpt-resizing"),document.body.classList.add("vnpt-resizing-global");const w=window.getComputedStyle(p).cursor;document.body.style.cursor=w;const I=k=>{const S=k.clientX-y,_=k.clientY-v;if(p.classList.contains("br"))c.panel.style.width=Math.max(360,E+S)+"px",c.panel.style.height=Math.max(250,N+_)+"px";else if(p.classList.contains("bl")){const L=E-S;L>360&&(c.panel.style.width=L+"px"),c.panel.style.height=Math.max(250,N+_)+"px"}else if(p.classList.contains("tr")){c.panel.style.width=Math.max(360,E+S)+"px";const L=N-_;L>250&&(c.panel.style.height=L+"px",c.widget.style.top=D+_+"px")}else if(p.classList.contains("tl")){const L=E-S,Z=N-_;L>360&&(c.panel.style.width=L+"px"),Z>250&&(c.panel.style.height=Z+"px",c.widget.style.top=D+_+"px")}},G=()=>{window.removeEventListener("mousemove",I),window.removeEventListener("mouseup",G),c.panel.classList.remove("vnpt-resizing"),document.body.classList.remove("vnpt-resizing-global"),document.body.style.cursor="";const k=c.widget.id==="vnpt-docx-widget";h.setDebounced(bt,{right:k?c.widget.style.right:void 0,top:c.widget.style.top,x:k?void 0:parseFloat(c.widget.style.left),y:parseFloat(c.widget.style.top)},500),h.setDebounced(vt,{width:c.panel.offsetWidth,height:c.panel.offsetHeight},500)};window.addEventListener("mousemove",I),window.addEventListener("mouseup",G)})})}function ae(t,e,o,n=null,a=null){let i=!1,s=0,u=0,l=0,d=0,r=!1;const m=5;function x(g){r!==g&&(r=g,a&&a(g))}function b(g){if(g.button!==0||["INPUT","BUTTON","SELECT","TEXTAREA"].includes(g.target.tagName)||g.target.isContentEditable)return;i=!0,c.hasDragged=!1,l=g.clientX,d=g.clientY;const f=t.getBoundingClientRect();s=g.clientX-f.left,u=g.clientY-f.top,document.body.style.userSelect="none",e&&e.forEach(y=>y.style.cursor="grabbing"),n&&n(),g.preventDefault()}return e.forEach(g=>{g.addEventListener("mousedown",b)}),document.addEventListener("mousemove",function(g){if(!i)return;if(!c.hasDragged)if(Math.sqrt(Math.pow(g.clientX-l,2)+Math.pow(g.clientY-d,2))>m)c.hasDragged=!0;else return;let p=g.clientX-s,f=g.clientY-u;const y=window.innerWidth,v=window.innerHeight,E=document.getElementById("vnpt-toggle-btn"),N=E?E.offsetWidth:40,R=E?E.offsetHeight:40,D=t.id==="vnpt-docx-widget";let w=t.offsetWidth||0;if(D){let k=N+6-w,S=y-w+6;p<k&&(p=k),p>S&&(p=S)}else w=w||200,p<0&&(p=0),p+w>y&&(p=Math.max(0,y-w));let I=r;if(D?I=!1:r?g.clientY<v-40&&(I=!1):g.clientY>v-10&&(I=!0),f<0&&(f=0),I)x(!0),t.style.top=v-t.offsetHeight+"px",D?(t.style.right=y-p-w+"px",t.style.left="auto"):(t.style.left=p+"px",t.style.right="auto"),t.style.bottom="auto";else{x(!1);let G=t.offsetHeight||40,k;if(D)k=10+R;else{const S=t.querySelector(".cw-title-bar");k=S?S.offsetHeight:G}f+k>v&&(f=Math.max(0,v-k)),t.style.top=f+"px",D?(t.style.right=y-p-w+"px",t.style.left="auto"):(t.style.left=p+"px",t.style.right="auto"),t.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(i){if(i=!1,document.body.style.userSelect="",e&&e.forEach(g=>g.style.cursor="grab"),o){const g=t.id==="vnpt-docx-widget";h.set(o,{left:g?void 0:t.style.left,right:g?t.style.right:void 0,top:t.style.top,x:g?void 0:parseFloat(t.style.left),y:parseFloat(t.style.top),docked:r})}setTimeout(()=>{c.hasDragged=!1},100)}}),{isDocked:()=>r,setDocked:x}}function Ve(){c.widget&&c.header&&(ae(c.widget,[c.header],bt),window.addEventListener("resize",()=>{const t=window.innerWidth,e=window.innerHeight,o=document.getElementById("vnpt-toggle-btn"),n=o?o.offsetWidth:40,a=o?o.offsetHeight:40;let i=c.widget.getBoundingClientRect(),s=i.left,u=i.top,l=c.widget.offsetWidth||0,r=n+6-l,m=t-l+6;s<r&&(s=r),s>m&&(s=m),u+10+a>e&&(u=Math.max(0,e-(10+a))),c.widget.style.right=t-s-l+"px",c.widget.style.top=u+"px"}))}function ie(t){const e=t.toLowerCase(),{ngay:o,thang:n,nam:a}=Ut(),i=`${o}/${n}/${a}`;return{"ngayky, ngayky1":o,ngayky:o,"thangky, thangky1":n,thangky:n,"namky, namky1":a,namky:a,"ngaytiepnhan, ngaythangnamky":i,ngaytiepnhan:i,ngaythangnamky:i,soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[e]||""}function je(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){if(c.isDefaultMode){Object.keys(M).forEach(e=>{B(e,M[e],T[e]||"")}),A(),C("Đã nạp lại dữ liệu mặc định từ hệ thống.");return}let t=0;Object.keys(T).forEach(e=>{var s;const o=T[e],n=e.split(",")[0].trim(),a=nt(n,o);let i="";a&&(i=a.tagName.toLowerCase()==="select"?((s=a.options[a.selectedIndex])==null?void 0:s.text)||"":a.value,t++),i||(i=ie(e)),i&&typeof i=="string"&&(["sdt"].includes(n)?i=Te(i):["ngaySinhCustomer","ngayCapCustomer","ngayCapSoDkdnCustomer","ngayKy","ngayTiepNhan"].includes(n)&&(i=Se(i))),B(e,i,null)}),A(),t>0?(this.style.background="#1e8e3e",this.style.color="#fff",this.innerText="Đã quét xong",setTimeout(()=>{this.style.background="",this.style.color="",this.innerText="Quét dữ liệu"},1e3)):C("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(t){if(!(t.target.closest("#vnpt-docx-widget")||t.target.closest("#vnpt-inline-calc"))&&t.target&&t.target.id){const e=Object.keys(T).find(o=>o.split(",").map(n=>n.trim()).includes(t.target.id));e!==void 0&&(B(e,t.target.value,null),A())}}),document.addEventListener("change",function(t){var e;if(!(t.target.closest("#vnpt-docx-widget")||t.target.closest("#vnpt-inline-calc"))&&t.target&&t.target.id){const o=Object.keys(T).find(n=>n.split(",").map(a=>a.trim()).includes(t.target.id));if(o!==void 0){let n=t.target.tagName.toLowerCase()==="select"?((e=t.target.options[t.target.selectedIndex])==null?void 0:e.text)||"":t.target.value;B(o,n,null),A()}}})}const Ue={local:{download(t,e="arraybuffer"){return new Promise((o,n)=>{const a=new FileReader;switch(a.onload=i=>{let s=i.target.result;e==="base64"&&typeof s=="string"&&(s=s.split(",")[1]||s),o(s)},a.onerror=i=>n(i),e.toLowerCase()){case"arraybuffer":a.readAsArrayBuffer(t);break;case"base64":case"dataurl":a.readAsDataURL(t);break;case"text":a.readAsText(t);break;default:n(new Error(`Unsupported read type: ${e}`))}})},async upload(t){return this.download(t,"base64")}}},Xe={getAdapter(t){const e=Ue[t];if(!e)throw new Error(`Storage adapter not found: ${t}`);return e},async upload(t,e,o={}){return await this.getAdapter(t).upload(e,o)},async download(t,e,o={}){return await this.getAdapter(t).download(e,o.type||"arraybuffer")}};function re(t,e,o){try{let n;try{n=new window.PizZip(t)}catch(l){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(l);return}const a=new window.docxtemplater(n,{paragraphLoop:!0,linebreaks:!0});a.render(e);const i=a.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",compression:"DEFLATE",compressionOptions:{level:9}}),s=URL.createObjectURL(i),u=document.createElement("a");u.href=s,u.download=o,document.body.appendChild(u),u.click(),setTimeout(()=>{document.body.removeChild(u),URL.revokeObjectURL(s)},100)}catch(n){let a=n.message;n.properties&&n.properties.errors instanceof Array?a=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+n.properties.errors.map(s=>"- "+(s.properties.explanation||s.message)).join(`
`):a="Lỗi phần mềm Word sinh ra: "+a,alert(a),console.error("DocX Error:",n)}}function Ye(t,e){const o=t.replace(/@(\w+)/g,(n,a)=>e[a]!==void 0?e[a]:n);navigator.clipboard.writeText(o).then(()=>{alert("✅ Đã sao chép nội dung vào Clipboard!")}).catch(n=>{console.error("Lỗi khi copy:",n),alert("❌ Lỗi khi sao chép vào Clipboard. Vui lòng thử lại!")})}function We(){const t=document.getElementById("vnpt-export-filename");t&&t.addEventListener("input",()=>{t.dataset.userEdited="1",t.value.trim()||(t.dataset.userEdited="0")});function e(){if(!t||t.dataset.userEdited==="1")return;let a="";if(c.fieldsContainer&&c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(r=>{const x=r.querySelector(".f-key").value.trim().split(",")[0].trim(),b=r.querySelector(".f-val").value.trim();x==="tenToChuc"&&(a=b)}),!a){const d=document.getElementById("tenToChuc");d&&(a=d.tagName.toLowerCase()==="textarea"||d.tagName.toLowerCase()==="input"?d.value.trim():d.innerText.trim())}function i(d){if(!d)return"";let r=d;return r=r.replace(/Tổng công ty/gi,""),r=r.replace(/Công ty/gi,""),r=r.replace(/\bCty\b/gi,""),r=r.replace(/Trách nhiệm hữu hạn/gi,""),r=r.replace(/\bTNHH\b/gi,""),r=r.replace(/Cổ phần/gi,""),r=r.replace(/\bCP\b/gi,""),r=r.replace(/Một thành viên/gi,""),r=r.replace(/\bMTV\b/gi,""),r=r.replace(/Chi nhánh/gi,""),r=r.replace(/Việt Nam/gi,"VN"),r=r.replace(/Viet Nam/gi,"VN"),r=r.replace(/\s+/g," ").trim(),r=r.replace(/^[-,\s]+|[-,\s]+$/g,""),r.length>50&&(r=r.substring(0,47)+"..."),r.replace(/[<>:"/\\|?*]/g,"")}let s=i(a),u=c.templateName?c.templateName.replace(/\.docx$/i,""):"",l=[];u&&l.push(u),s&&l.push(s),l.length>0?t.value=l.join(" - ")+".docx":t.value||(t.value="Export_Auto.docx")}setInterval(e,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const a={};if(c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(d=>{const m=d.querySelector(".f-key").value.trim().split(",")[0].trim(),x=d.querySelector(".f-val").value;m&&(a[m]=x)}),Object.keys(a).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}const s=[];if(mt.forEach(d=>{if(!a[d]||!a[d].trim()){const r=T[d]||d;s.push(r)}}),s.length>0){const d=`Cảnh báo: Bạn còn các trường sau chưa điền dữ liệu:

- ${s.join(`
- `)}

Bạn có chắc chắn muốn tiếp tục xuất file không?`;if(!confirm(d))return}let u=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(u.toLowerCase().endsWith(".docx")||(u+=".docx"),c.templateBuffer){re(c.templateBuffer,a,u);return}const l=document.getElementById("vnpt-template-file");if(l.files&&l.files.length>0){Xe.download("local",l.files[0],{type:"arraybuffer"}).then(d=>re(d,a,u)).catch(d=>alert(`Lỗi đọc file: ${d.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')});const o=document.getElementById("vnpt-btn-export-txt"),n=document.getElementById("vnpt-txt-template");if(n){const a=h.get(Lt);a&&(n.value=a),n.addEventListener("input",()=>{h.setDebounced(Lt,n.value,800)})}o&&o.addEventListener("click",()=>{const a=n?n.value:"";if(!a.trim()){alert(`Bạn chưa nhập nội dung Text Template!

Sử dụng @key làm placeholder, ví dụ: Tôi là @tenDaiDienn`);return}const i={};if(c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(u=>{const d=u.querySelector(".f-key").value.trim().split(",")[0].trim(),r=u.querySelector(".f-val").value;d&&(i[d]=r)}),Object.keys(i).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}Ye(a,i)})}const Qe=["chucVu","noiCap","noiCapSoDkdn","ngayky","ngayky1","thangky","namky","thangky1","namky1","noiKy"],Je=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function Ze(){function t(){Qe.forEach(n=>{const a=document.getElementById(n);a&&!a.dataset.filled&&(a.dataset.filled="1",ut(a,ie(n)))}),Je.forEach(n=>{const a=document.getElementById(n.src),i=document.getElementById(n.target);a&&i&&!a.dataset.bound&&(a.dataset.bound="1",a.addEventListener("change",()=>ut(i,a.value)))})}let e;new MutationObserver(n=>{n.some(i=>i.addedNodes.length>0?Array.from(i.addedNodes).some(u=>u.nodeType!==1?!1:["INPUT","TEXTAREA","SELECT"].includes(u.tagName)?!0:u.querySelector&&u.querySelector("input, textarea, select")):!1)&&(clearTimeout(e),e=setTimeout(t,200))}).observe(document.body,{childList:!0,subtree:!0}),t()}const tn=()=>{let t="";for(const[e,o]of Object.entries(T)){const n=e.split(",")[0].trim();mt.includes(n)&&(t+=`"${n}": "${o}",
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
`};function en(t,e,o="gemini-2.0-flash"){return new Promise((n,a)=>{if(!e)return a("Vui lòng nhập API Key Gemini trong Cài đặt.");const i=e.trim(),s=`https://generativelanguage.googleapis.com/v1/models/${o}:generateContent?key=${i}`,u={system_instruction:{parts:{text:tn()}},contents:[{parts:[{text:"Đọc file hợp đồng này và trích xuất thành JSON."},{inline_data:{mime_type:"application/pdf",data:t}}]}],generationConfig:{responseMimeType:"application/json"}};typeof GM_xmlhttpRequest<"u"?GM_xmlhttpRequest({method:"POST",url:s,headers:{"Content-Type":"application/json"},data:JSON.stringify(u),timeout:3e4,onload:l=>{var d,r,m,x,b;if(l.status>=200&&l.status<300)try{const g=JSON.parse(l.responseText),p=(b=(x=(m=(r=(d=g==null?void 0:g.candidates)==null?void 0:d[0])==null?void 0:r.content)==null?void 0:m.parts)==null?void 0:x[0])==null?void 0:b.text;if(p){let f=p.replace(/```json/g,"").replace(/```/g,"").trim();n(JSON.parse(f))}else a("AI không trả về kết quả hợp lệ.")}catch(g){console.error("Lỗi parse JSON từ Gemini",g,l.responseText),a("Lỗi Parse kết quả từ Gemini.")}else a(`API Gemini lỗi (${l.status}): ${l.responseText}`)},ontimeout:()=>a("Quá hạn thời gian gọi API (30s)"),onerror:l=>a("Lỗi kết nối đến Google Gemini API.")}):fetch(s,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(u)}).then(l=>l.json()).then(l=>{var m,x,b,g,p;if(l.error)return a(l.error.message);let r=((p=(g=(b=(x=(m=l==null?void 0:l.candidates)==null?void 0:m[0])==null?void 0:x.content)==null?void 0:b.parts)==null?void 0:g[0])==null?void 0:p.text).replace(/```json/g,"").replace(/```/g,"").trim();n(JSON.parse(r))}).catch(l=>a(l.message))})}function nn(t){return new Promise((e,o)=>{const n=new FileReader;n.onload=()=>{const a=n.result.split(",")[1];e(a)},n.onerror=a=>o(a),n.readAsDataURL(t)})}function on(){let t=document.getElementById("vnpt-pdf-loader");t||(t=document.createElement("div"),t.id="vnpt-pdf-loader",t.className="vnpt-pdf-overlay",t.innerHTML=`
            <div class="vnpt-pdf-loading-box">
                <div class="loader-spinner"></div>
                <div style="margin-top: 15px; font-weight: 800; font-size: 13px; color: #1a73e8;">Đang nhờ AI đọc Hợp đồng...</div>
                <div style="margin-top: 4px; font-size: 11px; color: #5f6368;">Tùy thuộc độ lớn file, thường mất 5 - 10s...</div>
            </div>
        `,document.body.appendChild(t)),t.style.display="flex"}function le(){const t=document.getElementById("vnpt-pdf-loader");t&&(t.style.display="none")}function an(t,e){let o=document.getElementById("vnpt-pdf-dialog");o&&o.remove(),o=document.createElement("div"),o.id="vnpt-pdf-dialog",o.className="vnpt-pdf-overlay";const n=t.map((l,d)=>`
        <tr class="pdf-row-auto">
            <td style="text-align: center;">
                <input type="checkbox" class="pdf-row-chk" data-index="${d}" checked />
            </td>
            <td><strong>${l.key}</strong></td>
            <td><div style="max-height: 40px; overflow-y: auto; color: #1a73e8; font-weight: 600;">${l.value}</div></td>
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
    `,document.body.appendChild(o);const a=o.querySelector("#pdf-btn-cancel"),i=o.querySelector("#pdf-btn-confirm"),s=o.querySelector("#pdf-check-all"),u=o.querySelectorAll(".pdf-row-chk");s.addEventListener("change",l=>{u.forEach(d=>d.checked=l.target.checked)}),a.onclick=()=>{o.remove()},i.onclick=()=>{const l=[];u.forEach(d=>{if(d.checked){const r=parseInt(d.getAttribute("data-index"));l.push(t[r])}}),o.remove(),e(l)}}function rn(){const t=document.getElementById("vnpt-btn-scan-pdf"),e=document.getElementById("vnpt-pdf-input");!t||!e||(t.addEventListener("click",o=>{o.preventDefault(),e.click()}),e.addEventListener("change",async o=>{const n=o.target.files[0];n&&(o.target.value="",await ln(n))}))}async function ln(t){const e=h.get($t),o=h.get(qt)||"gemini-2.0-flash";if(!e){confirm(`Chưa cài đặt Gemini API Key!

AI Scanner (PDF) yêu cầu cần có mã Google AI Studio cấp phát Miễn phí.

Nhấn 'OK' để xem hướng dẫn tự tạo mã Key nhé!`)&&window.open("https://github.com/tranchien2000/vnpt-tampermonkey-vite/blob/main/docs/GEMINI_API_GUIDE.md","_blank");return}try{on();const n=await nn(t),a=await en(n,e,o);le();const i=Object.keys(a).map(s=>({key:s,value:a[s],label:a[s]===""?"(Trống)":a[s]})).filter(s=>s.value!=="");if(i.length===0){alert("Rất tiếc! AI không tìm thấy trường thông tin nào thỏa mãn (Bên A).");return}an(i,s=>{s.forEach(u=>{B(u.key,u.value,`AI: ${u.key}`)}),A(),console.log(`✅ [OCR Pdf] Đã điền thành công ${s.length} trường.`)})}catch(n){le(),console.error("Lỗi PDF Scan Pipeline:",n);let a=n;typeof n=="string"&&(n.includes("Quota exceeded")||n.includes("limit: 0"))&&(a=`⚠️ Hết hạn mức hoặc Mô hình không khả dụng (Quota Exceeded)!

Mô hình bạn chọn có thể chưa hỗ trợ tại vùng của bạn hoặc bạn đã dùng hết lượt gọi miễn phí.

QUYẾT : Hãy mở menu ⚙️ (Thiết lập), đổi sang 'Gemini 1.5 Flash' hoặc 'Gemini 2.0 Flash' để tiếp tục.`),alert(`Lỗi xử lý quét File:
`+a)}}function at(t,e=null){return h.get(t,e)}function Ct(t,e){h.set(t,e)}function se(t,e){if(!e||e.replace(/\D/g,"").length<6)return;let o=at(t,[]);o=o.filter(n=>n!==e),o.unshift(e),Ct(t,o.slice(0,10))}function Tt(t,e){const o=document.getElementById(e);o&&(o.innerHTML=at(t,[]).map(n=>`<option value="${n}">`).join(""))}function Pt(t){return t.toLocaleString("en-US")}function zt(t){return Number(String(t).replace(/[^\d]/g,""))||0}function sn(t){return t.charAt(0).toUpperCase()+t.slice(1)}const gt=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function cn(t){let e=Math.floor(t/100),o=Math.floor(t%100/10),n=t%10,a="";return e>0&&(a+=gt[e]+" trăm ",o===0&&n>0&&(a+="lẻ ")),o>1?(a+=gt[o]+" mươi ",n===1?a+="mốt":n===5?a+="lăm":n>0&&(a+=gt[n])):o===1?(a+="mười ",n===5?a+="lăm":n>0&&(a+=gt[n])):n>0&&(e>0&&(a+="lẻ "),a+=gt[n]),a.trim()}function dn(t){if(t===0)return"không";const e=["","nghìn","triệu","tỷ"];let o="",n=0;for(;t>0;){const a=t%1e3;a>0&&(o=cn(a)+" "+e[n]+" "+o),t=Math.floor(t/1e3),n++}return o.trim()}function ce(t,e,o){let n=0,a=0,i=0;t==="before"?(n=zt(e),a=Math.round(n*o),i=n+a):t==="tax"?(a=zt(e),n=Math.round(a/o),i=n+a):t==="after"&&(i=zt(e),n=Math.round(i/(1+o)),a=i-n);const s=sn(dn(i))+" đồng";return{beforeNum:n,taxNum:a,afterNum:i,beforeStr:Pt(n),taxStr:Pt(a),afterStr:Pt(i),textStr:s}}function pn(t,e){e.before&&e.before.forEach(o=>J(o,t.beforeStr)),e.tax&&e.tax.forEach(o=>J(o,t.taxStr)),e.after&&e.after.forEach(o=>J(o,t.afterStr)),e.text&&e.text.forEach(o=>J(o,t.textStr))}function St(t,e=null){try{const o=localStorage.getItem(t);return o!==null?JSON.parse(o):e}catch{return e}}function F(t,e){localStorage.setItem(t,JSON.stringify(e))}function un(t,e,o,n){let a=St(et)??"custom",i=St(P)??{...M},s=St(X)??{},u=St(q)??{};const l=document.createElement("div");l.className="cw-tab-header";const d={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};d.custom.innerText="📋 Custom",d.custom.className="cw-tab cw-tab-custom",d.default.innerText="📌 Default",d.default.className="cw-tab cw-tab-default",d.sync.innerText="🔗 Sync",d.sync.className="cw-tab cw-tab-sync";function r(){Object.values(d).forEach(w=>w.classList.remove("active")),d[a].classList.add("active")}r();const m=document.createElement("div");m.style.display=n.data?"none":"block";const x=e("📋 Cấu hình Data","data",w=>{m.style.display=w?"none":"block",o(t)}),b=document.createElement("div");b.className="cw-data-body";function g(){b.innerHTML="";let w=a==="sync"?u:a==="custom"?s:i,I=a==="sync"?q:a==="custom"?X:P;const G=Object.keys(w);G.length===0&&a!=="default"&&(b.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),G.forEach(k=>{const S=document.createElement("div");S.className="cw-data-row";let _=a!=="default";const L=w[k],Z=L&&typeof L=="object"&&L.hasOwnProperty("value"),de=Z?L.value:L,Rt=Z&&L.label||k,O=document.createElement("input");O.type="text",O.value=Rt,O.id=`df-key-${k}`,O.name=`df-key-${k}`,O.className="cw-data-key"+(_?" mutable":""),O.title=k,O.readOnly=!_,_&&(O.onchange=()=>{const H=O.value.trim();if(!H||H===k){O.value=Rt;return}Z?w[H]={...L,label:H}:w[H]=de,delete w[k],F(I,w),g()});const $=document.createElement("input");if($.type="text",$.value=de??"",$.id=`df-val-${k}`,$.name=`df-val-${k}`,$.className="cw-data-val",$.oninput=()=>{Z?w[k]={...L,value:$.value}:w[k]=$.value,F(I,w)},S.appendChild(O),S.appendChild($),_){const H=document.createElement("button");H.innerHTML="✕",H.className="cw-del-btn",H.onclick=()=>{confirm(`Delete "${Rt}"?`)&&(delete w[k],F(I,w),g())},S.appendChild(H)}else S.appendChild(document.createElement("div")).className="cw-pad";b.appendChild(S)})}d.custom.onclick=()=>{a="custom",F(et,"custom"),r(),g()},d.default.onclick=()=>{a="default",F(et,"default"),r(),g()},d.sync.onclick=()=>{a="sync",F(et,"sync"),r(),g()};const p=document.createElement("button");p.innerText="📤",p.className="cw-icon-btn",p.title="Sao lưu toàn bộ dữ liệu ra JSON",p.onclick=()=>ne();const f=document.createElement("button");f.innerText="📥",f.className="cw-icon-btn",f.title="Khôi phục dữ liệu từ JSON";const y=document.createElement("input");y.type="file",y.accept=".json",y.style.display="none",y.onchange=async w=>{w.target.files.length>0&&await oe(w.target.files[0])&&setTimeout(()=>location.reload(),1500)},f.onclick=()=>y.click(),m.appendChild(l),l.appendChild(d.custom),l.appendChild(d.default),l.appendChild(d.sync),m.appendChild(b),t.appendChild(x),t.appendChild(m);const v=t.querySelector("#vnpt-cw-fill"),E=t.querySelector("#vnpt-cw-sync"),N=t.querySelector("#vnpt-cw-add"),R=t.querySelector("#vnpt-cw-reset");v&&(v.onclick=Zt),E&&(E.onclick=_e),N&&(N.onclick=()=>{a==="default"&&(a="custom",F(et,"custom"),r());let w=a==="sync"?u:s,I="new_field_"+Date.now();w[I]="",F(a==="sync"?q:X,w),g(),b.scrollTop=b.scrollHeight}),R&&(R.onclick=()=>{confirm("Reset Default Data?")&&(i={...M},F(P,i),g())}),g();const D=x.querySelector(".cw-right-wrap")||document.createElement("div");D.className="cw-right-wrap",D.prepend(p),D.prepend(f),D.appendChild(y),x.appendChild(D)}function fn(t,e,o){let n=Number(localStorage.getItem(Y))||Me,a=at(rt)??{calc:!1,data:!0};function i(b,g){const p=document.createElement("button");return p.innerText=b,p.className="cw-action-btn "+g,p}function s(b,g,p){const f=document.createElement("div");f.className="wg-sec-header";const y=document.createElement("span");y.innerText=b;const v=document.createElement("button");return v.className="wg-toggle-btn",v.innerText=a[g]?"▾":"▴",f.appendChild(y),f.appendChild(v),v.onclick=()=>{a[g]=!a[g],v.innerText=a[g]?"▾":"▴",Ct(rt,a),p(a[g])},f}function u(b){const g=window.innerWidth,p=window.innerHeight,f=b.getBoundingClientRect();b.style.left=Math.min(Math.max(parseFloat(b.style.left),0),g-f.width)+"px",b.style.top=Math.min(Math.max(parseFloat(b.style.top),0),p-36)+"px"}const l=document.createElement("div");if(!e){l.className="cw-title-bar",l.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const b=document.createElement("div");b.className="cw-btn-group";const g={fill:i("Fill","cw-btn-fill"),sync:i("Sync","cw-btn-sync"),add:i("Add","cw-btn-add"),reset:i("↺","cw-btn-reset")};g.reset.title="Reset Default fields",Object.values(g).forEach(p=>b.appendChild(p)),l.appendChild(b),t.appendChild(l)}const d=document.createElement("div");d.className="cw-body-inline",d.innerHTML=`
    <div class="cw-inline-row">
        <input id="wg-before" name="wg-before" class="cw-input-inline" placeholder="Trước thuế" list="wg-before-list" title="Trước thuế">
        <datalist id="wg-before-list"></datalist>
        <div class="cw-tax-group-inline"><input id="wg-taxRate" name="wg-taxRate" class="cw-tax-input-inline" title="Thuế (%)"><span class="cw-tax-symbol">%</span></div>
        <input id="wg-tax" name="wg-tax" class="cw-input-inline" placeholder="Tiền thuế" title="Tiền thuế">
        <input id="wg-after" name="wg-after" class="cw-input-inline" placeholder="Sau thuế" list="wg-after-list" title="Sau thuế">
        <datalist id="wg-after-list"></datalist>
        <input id="wg-text" name="wg-text" class="cw-input-inline cw-input-readonly-inline" placeholder="Bằng chữ" readonly title="Bằng chữ">
    </div>`,e?e.appendChild(d):t.appendChild(d),e||un(t,s,u,a);const r={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text")};r.taxRate.value=n*100,Tt(xt,"wg-before-list"),Tt(wt,"wg-after-list");function m(b,g){const p=ce(b,g,n);return r.before.value=p.beforeStr,r.tax.value=p.taxStr,r.after.value=p.afterStr,r.text.value=p.textStr,p}function x(b,g){const p=ce(b,g,n),f=at(z)||{...It};pn(p,f)}if(r.taxRate.oninput=()=>{n=Number(r.taxRate.value)/100||0,Ct(Y,n),m("before",r.before.value)},r.taxRate.onchange=()=>{x("before",r.before.value)},r.before.oninput=()=>{m("before",r.before.value)},r.before.onchange=()=>{x("before",r.before.value),se(xt,r.before.value),Tt(xt,"wg-before-list")},r.tax.oninput=()=>{m("tax",r.tax.value)},r.tax.onchange=()=>{x("tax",r.tax.value)},r.after.oninput=()=>{m("after",r.after.value)},r.after.onchange=()=>{x("after",r.after.value),se(wt,r.after.value),Tt(wt,"wg-after-list")},[r.before,r.tax,r.after,r.text].forEach(b=>{["click","focus"].forEach(g=>b.addEventListener(g,()=>{if(!b.value)return;navigator.clipboard.writeText(b.value);const p=b.style.backgroundColor;b.style.backgroundColor="#d1e7dd",setTimeout(()=>b.style.backgroundColor=p,300)}))}),!e){const b=Array.from(t.children).filter(f=>f!==l),g=ae(t,[l],o,null,f=>{b.forEach(y=>y.style.display=f?"none":""),l.style.borderRadius=f?"8px":"0",f&&(t.style.top=window.innerHeight-(l.offsetHeight||34)+"px")}),p=at(o);return p&&p.docked&&g.setDocked(!0),window.addEventListener("resize",()=>{g.isDocked()?t.style.top=window.innerHeight-l.offsetHeight+"px":u(t)}),g}return null}function gn(){const t=document.getElementById("vnpt-inline-calc"),e=document.getElementById("vnpt-btn-calc-toggle");let o=c.calcWidget||document.createElement("div");if(!t&&!c.calcWidget?(o.id="vnpt-calc-widget",document.body.appendChild(o),c.calcWidget=o):t&&(o=c.widget),t&&e){let n=at(rt)??{calc:!1,data:!0};const a=i=>{t.style.display=i?"none":"block",e.classList.toggle("active",!i)};a(n.calc),e.onclick=()=>{n.calc=!n.calc,Ct(rt,n),a(n.calc)}}return fn(o,t,Gt)}function hn(){let t=!1;try{t=!1}catch{t=!1}t&&U.info("[Migration] Dev mode active - Syncing configurations...");let e=h.get(P);if(e){let n=!1;Object.keys(M).forEach(a=>{const i=M[a];if(!(a in e))e[a]=i,n=!0;else if(t){const s=e[a],u=i&&typeof i=="object",l=s&&typeof s=="object";let d=!1;!u&&!l?d=s!==i:u&&l?d=s.value!==i.value||s.label!==i.label:d=!0,d&&(e[a]=i,n=!0)}}),n&&h.set(P,e)}let o=h.get(K);if(o){let n=!1;Object.keys(M).forEach(a=>{const i=M[a],s=i&&typeof i=="object"?i.value:i,u=i&&typeof i=="object"?i.label:T[a]||"";if(!(a in o))o[a]={label:u,value:s,sync:""},n=!0;else if(t){const l=o[a];(l.value!==s||l.label!==u)&&(o[a]={label:u,value:s,sync:l.sync||""},n=!0)}}),n&&h.setDebounced(K,o,0)}}let ht=null;function Ft(){if(!window.__vnptInited){window.__vnptInited=!0,U.info("Initializing VNPT Userscript..."),hn();try{pe(),qe(),gn(),Ve(),Pe(),_t(),je(),We(),Ze(),rn(),Ke(),ze();const t=Jt(()=>{Ne(),jt(),U.debug("DOM Cache & Labels refreshed due to mutations")},1500);ht=new MutationObserver(e=>{e.some(n=>n.addedNodes.length>0||n.removedNodes.length>0?[...n.addedNodes,...n.removedNodes].some(i=>i.nodeType===1&&!["SCRIPT","STYLE","LINK"].includes(i.tagName)):!1)&&t()}),ht.observe(document.body,{childList:!0,subtree:!0}),U.info("Userscript initialized successfully.")}catch(t){U.error("Error during userscript initialization:",t)}}}function mn(){U.info("Cleaning up VNPT Userscript for reload..."),ht&&(ht.disconnect(),ht=null);const t=document.getElementById("vnpt-docx-widget");t&&t.remove();const e=document.getElementById("vnpt-calc-widget");e&&e.remove();const o=document.getElementById("vnpt-styles");o&&o.remove(),window.__vnptInited=!1,U.info("Cleanup completed.")}window.__vnptCleanup=mn,window.__vnptInit=Ft,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Ft):Ft()})();
