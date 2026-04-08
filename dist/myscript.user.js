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
(function(){"use strict";const $={info:(...t)=>console.log("[Tampermonkey Script] INFO:",...t),error:(...t)=>console.error("[Tampermonkey Script] ERROR:",...t),warn:(...t)=>console.warn("[Tampermonkey Script] WARN:",...t)};function te(){const t="vnpt-styles";if(document.getElementById(t))return;const n=document.createElement("style");n.id=t,n.textContent=`
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
            display: none; flex-direction: column; min-width: 280px;
            padding: 6px 0; animation: menuFadeIn 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
            transform-origin: top right;
        }
        @keyframes menuFadeIn { 
            from { opacity: 0; transform: translateY(-15px) scale(0.9); } 
            to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        .vnpt-util-menu.show { display: flex; }
        
        .util-item {
            background: none; border: none; padding: 6px 16px; width: 100%;
            text-align: left; font-size: 13px; cursor: pointer;
            color: #3c4043; font-weight: 600; transition: all 0.2s;
            display: flex; align-items: center; gap: 8px;
            border-left: 4px solid transparent;
        }
        .util-item:hover { 
            background: rgba(26, 115, 232, 0.05); color: var(--vnpt-primary); 
            border-left-color: var(--vnpt-primary);
            padding-left: 28px;
        }
        
        .util-item.danger { color: var(--vnpt-danger); }
        .util-item.danger:hover { 
            background: #fff5f5; color: var(--vnpt-danger); 
            border-left-color: var(--vnpt-danger);
        }
        
        .util-separator { height: 1px; background: rgba(0,0,0,0.05); margin: 4px 0; }
        .util-submenu-title { 
            padding: 6px 16px 4px 16px; font-size: 10.5px; font-weight: 800; 
            color: #1a73e8; text-transform: uppercase; letter-spacing: 1px; 
            background: rgba(26, 115, 232, 0.04); margin-bottom: 2px;
        }

        /* Mapping Rows in Utility Menu */
        .cw-row-map {
            display: flex; align-items: center; justify-content: space-between;
            padding: 2px 16px; gap: 4px;
        }
        .cw-row-map span { font-size: 11px; font-weight: 700; color: #5f6368; flex: 0 0 75px; }
        .cw-map-input {
            flex: 1; padding: 5px 10px; border: 1px solid #dadce0; border-radius: 8px;
            font-size: 11px; background: #fff; transition: all 0.2s;
        }
        .cw-map-input:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 2px var(--vnpt-primary-light); outline: none; }

        /* System Data Actions */
        .util-action-row { display: flex; padding: 4px 12px; gap: 4px; }
        .util-item-small {
            flex: 1; border: 1px solid #e0e0e0; background: #fff; color: #3c4043;
            padding: 8px 0; border-radius: 10px; font-size: 11px; font-weight: 700;
            cursor: pointer; transition: all 0.2s; text-align: center;
        }
        .util-item-small:hover { background: var(--vnpt-primary-light); color: var(--vnpt-primary); border-color: var(--vnpt-primary); }
        
        .size-options { display: flex; padding: 4px 12px; gap: 4px; }
        .size-options button {
            flex: 1; padding: 8px 0; border: 1px solid #e0e0e0; border-radius: 10px;
            background: #fff; font-size: 12px; font-weight: 700; cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            color: #5f6368;
        }
        .size-options button:hover { 
            background: var(--vnpt-primary); border-color: var(--vnpt-primary); color: #fff; 
            transform: translateY(-2px); box-shadow: 0 4px 8px rgba(26, 115, 232, 0.2);
        }
        .size-options button:active { transform: translateY(0); }

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

    `,document.head.appendChild(n)}const ee={widget:null,panel:null,header:null,bannerArea:null,toggleBtn:null,fieldsContainer:null,panelBody:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1,templateBuffer:null,templateName:null,hasDragged:!1},nt=new Map,c=new Proxy(ee,{get(t,n){return n==="on"?(a,e)=>{nt.has(a)||nt.set(a,[]),nt.get(a).push(e)}:t[n]},set(t,n,a){const e=t[n];return t[n]=a,e!==a&&nt.has(n)&&nt.get(n).forEach(o=>o(a,e)),!0}}),C={"tenDaiDienn, tenNguoiNhanCTS ":"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT","emailDaiDien, emailNhanCTS":"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Mã số thuế | GPKD",goiDV:"Gói Dịch Vụ","ngayKy, ngayKy1":"Ngày ký","thangKy, thangKy1":"Tháng Ký","namKy, namKy1":"Năm ký","ngayTiepNhan, ngayThangNamKy":"Ngày tiếp nhận / Ngày tháng năm ký","soHopDong, inputContractGroupName, contractNumber, contractName":"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký","lienheHopDongA, lienheTuVanA, lienheHoaDonA, sucoCap1A, sucoCap2A, sucoCap3A, sucoCap4A":"Liên hệ A"},ut=["soHopDong","tenDaiDienn","cmnd","sdt","diaChi","tenToChuc","ngayCapCustomer","emailDaiDien","soDkdn","goiDV","soHopDong"],at="vnpt_docx_fields",P="vnpt_docx_default_fields",ft="vnpt_docx_position",gt="vnpt_docx_size",ht="vnpt_docx_opened",H="vnpt_autofill_data_default",j="vnpt_autofill_data_custom",F="vnpt_autofill_data_sync",At="vnpt_widget_pos",J="vnd_tax_rate",mt="vnd_before_history",bt="vnd_after_history",ot="vnpt_widget_collapsed",K="vnd_calc_map",Q="vnpt_widget_datatab",it="vnpt_templates",Tt="vnpt_txt_template",Mt="vnpt_gemini_api_key",ne=Object.freeze(Object.defineProperty({__proto__:null,DEFAULT_LABELS:C,LOCAL_KEY_DEFAULT_FIELDS:P,LOCAL_KEY_FIELDS:at,LOCAL_KEY_OPENED:ht,LOCAL_KEY_POS:ft,LOCAL_KEY_SIZE:gt,REQUIRED_KEYS:ut,SK_CALC_MAP:K,SK_COLLAPSE:ot,SK_DATATAB:Q,SK_DATA_CUS:j,SK_DATA_DEF:H,SK_DATA_SYNC:F,SK_GEMINI_KEY:Mt,SK_HIST_A:bt,SK_HIST_B:mt,SK_POS_CALC:At,SK_TAX:J,SK_TEMPLATES:it,SK_TXT_TEMPLATE:Tt},Symbol.toStringTag,{value:"Module"}));let R=null;function T(t,n="#198754",a=2500){R||(R=document.createElement("div"),R.id="vnpt-toast-container",Object.assign(R.style,{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column-reverse",alignItems:"center",gap:"8px",zIndex:"1000000",pointerEvents:"none"}),document.body.appendChild(R));const e=document.createElement("div");e.innerText=t,Object.assign(e.style,{background:n,color:"#fff",padding:"8px 18px",borderRadius:"24px",opacity:"0",transform:"translateY(10px)",transition:"opacity 0.3s, transform 0.3s",fontSize:"13px",fontWeight:"500",fontFamily:"'Segoe UI', Roboto, sans-serif",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",whiteSpace:"nowrap",pointerEvents:"auto"}),R.appendChild(e),requestAnimationFrame(()=>{e.style.opacity="1",e.style.transform="translateY(0)"}),setTimeout(()=>{e.style.opacity="0",e.style.transform="translateY(-10px)",setTimeout(()=>{e.remove(),R&&R.childNodes.length},300)},a)}const ae="vnpt_templates_db",V="buffers";let vt=null;function Ct(){return vt?Promise.resolve(vt):new Promise((t,n)=>{const a=indexedDB.open(ae,1);a.onupgradeneeded=e=>{const o=e.target.result;o.objectStoreNames.contains(V)||o.createObjectStore(V)},a.onsuccess=e=>{vt=e.target.result,t(vt)},a.onerror=()=>n(a.error)})}async function oe(t,n){const a=await Ct();return new Promise((e,o)=>{const f=a.transaction(V,"readwrite").objectStore(V).put(n,t);f.onsuccess=()=>e(),f.onerror=()=>o(f.error)})}async function ie(t){const n=await Ct();return new Promise((a,e)=>{const r=n.transaction(V,"readonly").objectStore(V).get(t);r.onsuccess=()=>a(r.result),r.onerror=()=>e(r.error)})}async function re(t){const n=await Ct();return new Promise((a,e)=>{const r=n.transaction(V,"readwrite").objectStore(V).delete(t);r.onsuccess=()=>a(),r.onerror=()=>e(r.error)})}const G=new Map,xt=new Map,b={isGM:typeof GM_setValue<"u"&&typeof GM_getValue<"u",get(t,n=null){if(G.has(t))return G.get(t);try{let a;if(this.isGM?a=GM_getValue(t,null):a=localStorage.getItem(t),a==null)return n;const e=typeof a=="string"?JSON.parse(a):a;return G.set(t,e),e}catch(a){return console.warn(`[Storage] Không thể đọc key "${t}":`,a),n}},set(t,n){G.set(t,n);try{return this.isGM?GM_setValue(t,n):localStorage.setItem(t,JSON.stringify(n)),!0}catch(a){return console.error(`[Storage] Không thể ghi key "${t}":`,a),!1}},setDebounced(t,n,a=500){G.set(t,n),xt.has(t)&&clearTimeout(xt.get(t));const e=setTimeout(()=>{this.set(t,n),xt.delete(t)},a);xt.set(t,e)},remove(t){G.delete(t);try{this.isGM?GM_deleteValue(t):localStorage.removeItem(t)}catch(n){console.error(`[Storage] Không thể xóa key "${t}":`,n)}},clearCache(){G.clear()}};function rt(){try{const t=b.get(it)||[],n=t.filter(a=>a.type!=="local");return n.length!==t.length&&lt(n),n}catch{return[]}}function lt(t){b.set(it,t)}function le(t){const n=t.match(/drive\.google\.com\/file\/d\/([^/]+)/);return n?`https://drive.google.com/uc?export=download&id=${n[1]}`:t}function se(t){return new Promise((n,a)=>{GM_xmlhttpRequest({method:"GET",url:le(t),responseType:"arraybuffer",onload:e=>{if(e.status>=200&&e.status<300){if(e.response&&e.response.byteLength>4){const o=new Uint8Array(e.response.slice(0,4));if(o[0]===80&&o[1]===75&&o[2]===3&&o[3]===4){n(e.response);return}else{a(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}n(e.response)}else a(new Error(`HTTP ${e.status}: Không lấy được file`))},onerror:()=>a(new Error("Không thể tải URL.")),ontimeout:()=>a(new Error("Timeout khi tải URL."))})})}async function ce(t,n,a){const e=t.name.replace(/\.docx$/i,""),o=prompt("Đặt tên biến nhớ cho file này:",e);if(!(!o||!o.trim()))try{const i=await t.arrayBuffer();await oe(o.trim(),i);const f=rt().filter(s=>s.name!==o.trim()&&s.fileName!==t.name);f.unshift({name:o.trim(),type:"local_idb",fileName:t.name,lastUsed:Date.now()}),lt(f),U(n,a),a&&a(i,o.trim())}catch(i){T(`❌ Lỗi lưu file: ${i.message}`,"#dc3545")}}function U(t,n,a=null){let e=t.querySelector(".vnpt-template-manager-inner"),o,i;if(e)o=e.querySelector(".vnpt-local-list-container"),i=e.querySelector(".vnpt-btn-wrap");else{t.innerHTML="",e=document.createElement("div"),e.className="vnpt-template-manager-inner";const s=document.createElement("div");s.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const d=document.createElement("span");d.className="vnpt-title-main",d.style.cssText="font-size:11px;font-weight:700;color:#444;",i=document.createElement("div"),i.className="vnpt-btn-wrap",i.style.cssText="display:flex;gap:4px;",s.appendChild(d),s.appendChild(i),e.appendChild(s),o=document.createElement("div"),o.className="vnpt-local-list-container",o.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",e.appendChild(o),t.appendChild(e)}const r=rt(),f=e.querySelector(".vnpt-title-main");f.innerHTML="Templates"+(a?` <span style="color:#2e7d32;">(Đang dùng: ${a})</span>`:""),r.length===0?o.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':o.innerHTML="",r.forEach((s,d)=>{const l=document.createElement("div");l.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",l.title=s.fileName||s.url||s.name,l.tabIndex=0,l.onfocus=()=>l.style.boxShadow="0 0 0 2px #28a745",l.onblur=()=>l.style.boxShadow="none";const h=s.type==="local"||s.type==="local_base64"||s.type==="local_idb"?"OFF":"ON",g=h==="OFF"?"#6c757d":"#28a745",u=document.createElement("span");u.textContent=h,u.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${g};color:#fff;`;const p=document.createElement("span");p.textContent=s.name,p.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",l.onclick=()=>{l.focus(),de(s,n,a,t)},l.appendChild(u),l.appendChild(p);const m=document.createElement("button");m.innerHTML="✎",m.title="Đổi tên template",m.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",m.onclick=x=>{x.stopPropagation();const w=prompt("Đổi tên template:",s.name);if(w&&w.trim()&&w.trim()!==s.name){const N=rt();N[d].name=w.trim(),lt(N),U(t,n,a)}},l.appendChild(m);const v=document.createElement("button");v.innerHTML="✕",v.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",v.onclick=async x=>{if(x.stopPropagation(),confirm(`Xoá biểu mẫu "${s.name}"?`)){const w=rt();w.splice(d,1),lt(w),s.type==="local_idb"&&await re(s.name).catch(()=>null),U(t,n,a===s.name?null:a)}},l.appendChild(v),o.appendChild(l)})}function de(t,n,a,e){const o=rt(),i=o.find(r=>r.name===t.name&&(r.url===t.url||r.type===t.type));if(i&&(i.lastUsed=Date.now(),lt(o)),t.type==="local_idb"){ie(t.name).then(r=>{if(!r)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");n&&n(r,t.name),U(e,n,t.name)}).catch(r=>{T(`❌ Lỗi nạp File IDB: ${r.message}`,"#dc3545")});return}if(t.type==="local_base64"&&t.data){try{const r=window.atob(t.data.split(",")[1]),f=r.length,s=new Uint8Array(f);for(let d=0;d<f;d++)s[d]=r.charCodeAt(d);n&&n(s.buffer,t.name),U(e,n,t.name)}catch(r){T(`❌ Lỗi nạp Base64: ${r.message}`,"#dc3545")}return}se(t.url).then(r=>{n&&n(r,t.name),U(e,n,t.name)}).catch(r=>{T(`❌ ${r.message}`,"#dc3545")})}function pe(t,n){if(t.length===0)return n.length;if(n.length===0)return t.length;const a=[];for(let e=0;e<=n.length;e++)a[e]=[e];for(let e=0;e<=t.length;e++)a[0][e]=e;for(let e=1;e<=n.length;e++)for(let o=1;o<=t.length;o++)n.charAt(e-1)===t.charAt(o-1)?a[e][o]=a[e-1][o-1]:a[e][o]=Math.min(a[e-1][o-1]+1,a[e][o-1]+1,a[e-1][o]+1);return a[n.length][t.length]}function ue(t,n){let a=t,e=n;t.length<n.length&&(a=n,e=t);const o=a.length;return o===0?1:(o-pe(a,e))/parseFloat(o)}function fe(t,n,a=.7){let e=null,o=-1;const i=t.toLowerCase().trim();for(const r of n){const f=r.toLowerCase().trim(),s=ue(i,f);s>o&&s>=a&&(o=s,e=r)}return e}function ge(t){return t?t.toLowerCase().split(" ").map(n=>n.charAt(0).toUpperCase()+n.slice(1)).join(" "):""}function he(t){if(!t)return"";let n=t.replace(/\D/g,"");return n.startsWith("84")&&(n="0"+n.slice(2)),n}function me(t){if(!t)return"";const n=t.split(/[-/]/);if(n.length===3){let a,e,o;return n[0].length===4?[o,e,a]=n:[a,e,o]=n,`${a.padStart(2,"0")}/${e.padStart(2,"0")}/${o}`}return t}const st=new Map;function be(){st.clear()}function ve(t){t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}))}function ct(t,n){var o;const a=t.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,e=(o=Object.getOwnPropertyDescriptor(a,"value"))==null?void 0:o.set;e?e.call(t,n):t.value=n,ve(t)}function Z(t,n=null){if(!t)return null;const a=st.get(t);if(a&&document.contains(a))return a;const e=document.getElementById(t);if(e&&(e.tagName==="INPUT"||e.tagName==="TEXTAREA"||e.tagName==="SELECT"))return st.set(t,e),e;const o=`input[id="${t}"], textarea[id="${t}"], select[id="${t}"], input[name="${t}"], textarea[name="${t}"], input[formcontrolname="${t}"], textarea[formcontrolname="${t}"], input[placeholder="${t}"], textarea[placeholder="${t}"]`,i=document.querySelector(o);if(i)return st.set(t,i),i;const r=n||t,f=Array.from(document.querySelectorAll("label, .label, .label-text, span.title"));let s=f.find(d=>d.innerText.trim()===r);if(!s&&r.length>2){const d=f.map(h=>h.innerText.trim()).filter(h=>h.length>0),l=fe(r,d,.8);l&&(s=f.find(h=>h.innerText.trim()===l))}if(s){let d=null;if(s.htmlFor&&(d=document.getElementById(s.htmlFor)),!d){let l=s.parentElement,h=0;for(;l&&h<3;){const g=l.querySelector("input, textarea, select");if(g){d=g;break}l=l.parentElement,h++}}if(d)return st.set(t,d),d}return null}function St(t){return Z(null,t)}function X(t,n,a=null){const e=Z(t,a);e&&ct(e,n)}function xe(t=new Date){return String(t.getDate()).padStart(2,"0")}function ye(t=new Date){return String(t.getMonth()+1).padStart(2,"0")}function we(t=new Date){return String(t.getFullYear())}function _t(){const t=new Date;return{ngay:xe(t),thang:ye(t),nam:we(t)}}const{ngay:Ht,thang:Ot,nam:zt}=_t(),I={"ngayKy, ngayKy1":{label:"Ngày ký",value:Ht},"thangKy, thangKy1":{label:"Tháng ký",value:Ot},"namKy, namKy1":{label:"Năm ký",value:zt},"ngayTiepNhan, ngayThangNamKy":{label:"Ngày ký (full)",value:`${Ht}/${Ot}/${zt}`},tenDoanhNghiepB:{label:"Tên doanh nghiệp B",value:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM"},diaChiB:{label:"Địa chỉ B",value:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội"},maSoThueB:{label:"Mã số thuế B",value:"0100686223"},stkB:{label:"Số tài khoản B",value:"1600114156"},diaChiStkB:{label:"Ngân hàng/Địa chỉ STK B",value:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)"},"tenB, nguoiDaiDienB":{label:"Người đại diện B",value:"Phạm Khánh Chung"},"chucVuB, chucVuDaiDienB":{label:"Chức vụ B",value:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp"},"giayUyQuyenSoB, soGiayUyQuyenB":{label:"Giấy ủy quyền số B",value:"2628/GUQ-VNPT-HNI-VP"},"giayUyQuyenNgayB, ngayGiayUyQuyenB":{label:"Giấy ủy quyền ngày B",value:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},GiayUyQuyenB:{label:"Giấy ủy quyền B (full)",value:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},tenDoanhNghiepB1:{label:"Tên doanh nghiệp B (phụ)",value:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},donViTiepNhan:{label:"Đơn vị tiếp nhận",value:"TTKD KHDN"},"tenTiepNhan, tenNguoiNhan":{label:"Người tiếp nhận",value:"Bùi Anh"},dienThoaiB:{label:"Điện thoại B",value:"02436686868"},diaChiTaiKhoanB:{label:"Địa chỉ tài khoản B",value:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 "},noiKy:{label:"Nơi ký",value:"Hà Nội"},emailB:{label:"Email B",value:""},"lienheHopDongB, lienheTuVanB, lienheHoaDonB, sucoCap1B, sucoCap2B, sucoCap3B, sucoCap4B":{label:"Liên hệ B (AM)",value:"AM Bùi Anh"}},Pt={soHopDong:"soHopDong, inputContractGroupName, contractNumber, contractName"},Ft={after:["vnpt-map-after","cuocDV","tongCong","tongCongHD","congCA","giaTriHopDong","tongGIaTriHopDong"],before:["vnpt-map-before","donGiaCA","thanhTienCA","tongThanhTien","tongCuocTruocThue"],tax:["vnpt-map-tax","tongThueGTGT","tongThue","thueCA","thueVAT"],text:["vnpt-map-text","soTienThanhToanBangChu","tongCongBangChu","tongCongHDbangChu","ghiChuGiaTriHopDong","tongGiaTriHopDongBangChu"]},ke=.08;function Kt(t,n){let a;return function(...o){const i=()=>{clearTimeout(a),t(...o)};clearTimeout(a),a=setTimeout(i,n)}}function Rt(){const t=b.get(H)??{...I},n=b.get(j)??{},a={...t,...n};Object.keys(a).forEach(e=>{const o=a[e],i=o&&typeof o=="object"&&o.hasOwnProperty("value")?o.value:o;e.split(",").map(f=>f.trim()).filter(f=>f).forEach(f=>{let s=Z(f)||St(f);s&&ct(s,i)})}),T("✅ Auto fill complete")}function Ee(){let t=b.get(F)??{};const n={...Pt,...t},a=Object.keys(n);if(a.length===0){T("⚠️ No sync mapping","#ffc107");return}a.forEach(e=>{let o=Z(e)||St(e);o&&o.value!==void 0&&o.value!==""&&n[e].split(",").map(r=>r.trim()).filter(r=>r).forEach(r=>X(r,o.value))}),T("✅ Sync form complete","#d39e00")}let Nt=!1;const Te=(t,n)=>{var s;if(Nt)return;let a=b.get(F)??{};const e={...Pt,...a};if(Object.keys(e).length===0)return;let o=t.id,i=t.name,r=null;if(o){const d=document.querySelector(`label[for="${o}"]`);d&&(r=d.textContent.trim())}if(!r){const d=t.closest("label");d&&(r=(s=Array.from(d.childNodes).find(l=>l.nodeType===3))==null?void 0:s.textContent.trim())}let f=e[o]||e[i]||e[r];if(f){Nt=!0;try{f.split(",").map(l=>l.trim()).filter(l=>l).forEach(l=>{if(l!==o&&l!==i&&l!==r){const h=Z(l)||St(l);h&&document.activeElement!==h&&ct(h,n)}})}finally{Nt=!1}}},Ce=Kt((t,n)=>{Te(t,n)},250);function Se(){document.addEventListener("input",t=>{const n=t.target;!n||!["INPUT","TEXTAREA"].includes(n.tagName)||n.closest("#vnpt-docx-widget")||n.closest("#vnpt-inline-calc")||Ce(n,n.value)})}function L(t,n,a=null,e=""){const o=c.fieldsContainer.querySelector(".text-hint");o&&o.remove();const i=c.fieldsContainer.querySelectorAll(".f-key");let r=!1;const f=t.split(",")[0].trim();for(let s of i)if(s.value.split(",")[0].trim()===f){const l=s.closest(".vnpt-field-row"),h=l.querySelector(".f-val"),g=l.querySelector(".f-label");n!==""&&h.value!==n&&document.activeElement!==h&&(h.value=n),a!==null&&a!==""&&g.value!==a&&document.activeElement!==g&&(g.value=a),e!==""&&s.value!==t+", "+e&&document.activeElement!==s&&(s.value=t+", "+e),r=!0;break}if(!r){(a===null||a==="")&&(a=C[t]||"");const s=document.createElement("div");s.className="vnpt-field-row row-item",s.setAttribute("draggable","false");let d=t;e&&(d+=", "+e);const l=f;s.innerHTML=`
            <input type="checkbox" id="chk-${l}" name="chk-${l}" class="row-chk" title="Chọn" style="margin: 0 2px 0 2px;" />
            <input type="text" id="lbl-${l}" name="lbl-${l}" class="f-label" value="${a}" />
            <input type="text" id="key-${l}" name="key-${l}" class="f-key" value="${d}" title="Biến DOCX và IDs đồng bộ" />
            <span class="row-drag-handle" title="Kéo">=</span>
            <input type="text" id="val-${l}" name="val-${l}" class="f-val" value="${n}" />
        `;const h=s.querySelector(".f-val"),g=s.querySelector(".f-key");t==="tenToChuc"&&(h.style.textAlign="right");const u=()=>{ut.includes(f)&&(h.value.trim()?h.classList.remove("field-required-empty"):h.classList.add("field-required-empty"))},p=()=>{const v=h.value;g.value.split(",").map(w=>w.trim()).filter(w=>w).forEach(w=>X(w,v))};g.addEventListener("input",function(){B();const v=this.value.split(",")[0].trim();h.style.textAlign=v==="tenToChuc"?"right":"",p()}),s.querySelector(".f-label").addEventListener("input",B),h.addEventListener("input",function(){B(),p(),u()}),u();const m=s.querySelector(".row-drag-handle");m.addEventListener("mouseenter",()=>s.setAttribute("draggable","true")),m.addEventListener("mouseleave",()=>{s.classList.contains("dragging")||s.setAttribute("draggable","false")}),s.addEventListener("dragstart",function(v){c.draggedRowForVNPT=this,v.dataTransfer.effectAllowed="move",v.dataTransfer.setData("text/plain",t),this.classList.add("dragging")}),s.addEventListener("dragover",v=>(v.preventDefault(),!1)),s.addEventListener("dragenter",function(){this.classList.add("over")}),s.addEventListener("dragleave",function(){this.classList.remove("over")}),s.addEventListener("drop",function(v){if(v.stopPropagation(),c.draggedRowForVNPT&&c.draggedRowForVNPT!==this){const x=Array.from(c.fieldsContainer.querySelectorAll(".vnpt-field-row")),w=x.indexOf(c.draggedRowForVNPT),N=x.indexOf(this);w<N?this.parentNode.insertBefore(c.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(c.draggedRowForVNPT,this),B()}return!1}),s.addEventListener("dragend",function(){this.setAttribute("draggable","false"),c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(v=>{v.classList.remove("over","dragging")}),c.draggedRowForVNPT=null}),c.fieldsContainer.appendChild(s),c.fieldsContainer.scrollTop=c.fieldsContainer.scrollHeight}}function B(){const t=c.isDefaultMode?P:at,n={};c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(e=>{const i=e.querySelector(".f-key").value.trim().split(",").map(l=>l.trim()).filter(l=>l),r=i[0],f=i.slice(1).join(", "),s=e.querySelector(".f-label").value.trim(),d=e.querySelector(".f-val").value;r&&(n[r]={label:s,value:d,sync:f})}),b.setDebounced(t,n,1e3)}function Vt(){try{c.fieldsContainer.innerHTML="";const n=b.get(at)||{};Object.keys(C).forEach(a=>{const e=C[a],o=n[a];o&&typeof o=="object"?L(a,o.value,o.label||e,o.sync||""):o?L(a,o,e,""):L(a,"",e,"")}),Object.keys(n).forEach(a=>{if(!(a in C)){const e=n[a];typeof e=="object"?L(a,e.value,e.label,e.sync||""):L(a,e,"","")}}),Object.keys(C).length===0&&Object.keys(n).length===0&&(c.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(n){console.error("Error loading config:",n),Object.keys(C).forEach(a=>L(a,"",C[a]))}const t=b.get(ft);t&&c.widget&&(c.widget.style.bottom="auto",t.right?(c.widget.style.right=t.right,c.widget.style.left="auto"):t.left&&(c.widget.style.left=t.left,c.widget.style.right="auto"),t.top&&(c.widget.style.top=t.top))}function Ne(){document.getElementById("vnpt-btn-toggle-id").onclick=()=>c.fieldsContainer.classList.toggle("show-ids"),document.getElementById("vnpt-btn-default").onclick=()=>{c.isDefaultMode=!c.isDefaultMode},c.on("isDefaultMode",t=>qt(t)),document.getElementById("vnpt-btn-reset-default").onclick=()=>{confirm("Khôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?")&&(b.remove(P),b.remove(K),b.remove(J),c.isDefaultMode&&(qt(!0),T("🔄 Đã khôi phục dữ liệu gốc","#1a73e8")))},document.getElementById("vnpt-btn-batch-del").onclick=()=>{const t=c.fieldsContainer.querySelectorAll(".vnpt-field-row");let n=0;t.forEach(a=>{var e;(e=a.querySelector(".row-chk"))!=null&&e.checked&&(a.remove(),n++)}),n===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(t.forEach(a=>a.remove()),T("🗑️ Đã xóa toàn bộ","#ff5252"),B()):(T(`🗑️ Đã xóa ${n} trường`,"#ff5252"),B())},document.getElementById("vnpt-btn-add").onclick=()=>{const t=c.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;L("bien_moi_"+t,"","",""),B()},document.getElementById("vnpt-btn-fill-back").onclick=()=>{Rt();let t=0;c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(n=>{const a=n.querySelector(".f-key").value.trim(),e=n.querySelector(".f-val").value;a.split(",").map(o=>o.trim()).filter(Boolean).forEach(o=>{(document.getElementById(o)||document.getElementsByName(o)[0])&&(X(o,e),t++)})}),t>0?T(`✅ Đã điền ngược ${t} trường`,"#198754"):T("⚠️ Không khớp trường nào","#ffc107")}}function qt(t){const n=document.getElementById("vnpt-btn-default"),a=document.getElementById("vnpt-btn-reset-default");if(c.fieldsContainer.innerHTML="",c.bannerArea.innerHTML="",t){n.classList.add("active"),n.innerHTML="✅ Chế độ: Dữ liệu mặc định",a&&(a.style.display="flex"),c.fieldsContainer.classList.add("vnpt-mode-default"),T("📌 Chế độ Dữ liệu mặc định (Có thể sửa)","#ea4335");const e=document.createElement("div");e.className="vnpt-default-banner",e.innerHTML='<span style="color: red;"> LƯU Ý: ĐÂY LÀ DỮ LIỆU MẶC ĐỊNH</span>',c.bannerArea.appendChild(e);const o=b.get(P);o===null?Object.keys(I).forEach(i=>{const r=I[i],f=r&&typeof r=="object"?r.value:r,s=r&&typeof r=="object"?r.label:C[i]||"";L(i,f,s)}):Object.keys(o).forEach(i=>{const r=o[i];L(i,r.value,r.label,r.sync||"")})}else n.classList.remove("active"),n.innerHTML="🛠 Dữ liệu mặc định VNPT",a&&(a.style.display="none"),c.fieldsContainer.classList.remove("vnpt-mode-default"),T("📋 Đã quay lại Dữ liệu cá nhân"),Vt()}function $t(t){if(!t)return t;const n={};return Object.keys(t).forEach(a=>{const e=t[a];a.split(",").map(i=>i.trim()).filter(i=>i).forEach(i=>{n[i]=e})}),n}function jt(){const t={version:"1.0",timestamp:new Date().toISOString(),backup:{fields:b.get(at),defaultFields:b.get(P),dataDefault:$t(b.get(H)),dataCustom:$t(b.get(j)),dataSync:b.get(F),taxRate:b.get(J),calcMap:b.get(K),templates:b.get(it)}},n=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),a=URL.createObjectURL(n),e=document.createElement("a");e.href=a,e.download=`vnpt_full_backup_${new Date().toLocaleDateString().replace(/\//g,"-")}.json`,e.click(),URL.revokeObjectURL(a),T("✅ Đã xuất file sao lưu hệ thống.")}async function Gt(t){return new Promise(n=>{const a=new FileReader;a.onload=e=>{try{const o=JSON.parse(e.target.result);if(!o.backup)throw new Error("File không đúng định dạng backup.");const i=o.backup;i.fields&&b.set(at,i.fields),i.defaultFields&&b.set(P,i.defaultFields),i.dataDefault&&b.set(H,i.dataDefault),i.dataCustom&&b.set(j,i.dataCustom),i.dataSync&&b.set(F,i.dataSync),i.taxRate&&b.set(J,i.taxRate),i.calcMap&&b.set(K,i.calcMap),i.templates&&b.set(it,i.templates),T("✅ Đã nhập dữ liệu thành công! Vui lòng tải lại trang hoặc widget.","#1e8e3e"),n(!0)}catch{T("❌ Lỗi: File sao lưu không hợp lệ.","#ff5252"),n(!1)}},a.readAsText(t)})}function Le(){const t=document.getElementById("vnpt-docx-widget")||document.createElement("div");t.id="vnpt-docx-widget";const n=b.get(ht)===!0;t.innerHTML=`
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
                            <div class="util-submenu-title">Cấu hình hệ thống</div>
                            <button class="util-item" id="vnpt-btn-default">🛠 Dữ liệu mặc định VNPT</button>
                            <button class="util-item danger" id="vnpt-btn-reset-default" >🔄 Khôi phục dữ liệu gốc</button>
                            
                            
                            <div class="util-separator"></div>
                            <div class="util-submenu-title">Cấu hình AI OCR (Gemini)</div>
                            <div class="cw-row-map">
                                <span>API Key</span>
                                <input id="vnpt-gemini-key" type="password" placeholder="AIzaSy..." title="Lấy mã Key từ Google AI Studio" class="cw-map-input">
                            </div>

                            <div class="util-separator"></div>
                            <div class="util-submenu-title">Liên kết ô (Mapping Calc)</div>
                            <div class="cw-row-map"><span>Trước thuế</span><input id="vnpt-map-before" name="vnpt-map-before" data-clink="before" class="cw-map-input"></div>
                            <div class="cw-row-map"><span>Tiền thuế</span><input id="vnpt-map-tax" name="vnpt-map-tax" data-clink="tax" class="cw-map-input"></div>
                            <div class="cw-row-map"><span>Sau thuế</span><input id="vnpt-map-after" name="vnpt-map-after" data-clink="after" class="cw-map-input"></div>
                            <div class="cw-row-map"><span>Bằng chữ</span><input id="vnpt-map-text" name="vnpt-map-text" data-clink="text" class="cw-map-input"></div>
                            
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
    `,document.body.appendChild(t),c.widget=t,c.panel=document.getElementById("vnpt-export-panel"),c.toggleBtn=document.getElementById("vnpt-toggle-btn"),c.header=document.getElementById("vnpt-panel-header"),c.bannerArea=document.getElementById("vnpt-banner-area"),c.fieldsContainer=document.getElementById("vnpt-fields-list");try{const u=b.get(gt);u&&u.width&&u.height&&(c.panel.style.width=u.width+"px",c.panel.style.height=u.height+"px")}catch(u){console.error("Lỗi load size panel:",u)}new ResizeObserver(u=>{if(c.panel.style.display!=="none")for(let p of u){const{width:m,height:v}=p.contentRect;m>0&&v>0&&b.setDebounced(gt,{width:Math.round(m+20),height:Math.round(v+20)},1e3)}}).observe(c.panel),c.panelBody=document.getElementById("vnpt-panel-body"),U(document.getElementById("vnpt-template-manager"),(u,p)=>{c.templateBuffer=u,c.templateName=p}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const u=this.files&&this.files[0];if(!u)return;const p=document.getElementById("vnpt-template-manager");ce(u,p,(m,v)=>{c.templateBuffer=m,c.templateName=v}),this.value=""}),c.toggleBtn.addEventListener("click",u=>{c.hasDragged||(c.panel.style.display==="none"?(c.panel.style.display="flex",c.toggleBtn.className="btn-opened",c.toggleBtn.innerHTML="✖",b.set(ht,!0)):(c.panel.style.display="none",c.toggleBtn.className="btn-closed",c.toggleBtn.innerHTML="📄",b.set(ht,!1)))});const e=document.getElementById("vnpt-btn-more"),o=document.getElementById("vnpt-util-menu"),i={S:{width:"380px",height:"420px"},M:{width:"460px",height:"600px"},L:{width:"620px",height:"800px"},Full:{width:"98vw",height:"92vh"}},r=b.get(K)||{};o.querySelectorAll("input[data-clink]").forEach(u=>{const p=u.dataset.clink,m=r[p]||Ft[p]||[];u.value=m.join(", "),u.oninput=()=>{const v=b.get(K)||{};v[p]=u.value.split(",").map(x=>x.trim()).filter(x=>x),b.set(K,v)}});const f=document.getElementById("vnpt-gemini-key");f&&Promise.resolve().then(()=>ne).then(({SK_GEMINI_KEY:u})=>{f.value=b.get(u)||"",f.oninput=()=>{b.set(u,f.value.trim())}}),document.getElementById("vnpt-btn-export-json").onclick=()=>jt();const s=document.getElementById("vnpt-txt-toggle"),d=document.getElementById("vnpt-txt-body");s&&d&&s.addEventListener("click",u=>{u.stopPropagation();const p=d.style.display==="none";d.style.display=p?"":"none",s.textContent=p?"▲":"▶"});const l=document.getElementById("vnpt-btn-import-json"),h=document.getElementById("vnpt-file-import-json");l.onclick=()=>h.click(),h.onchange=async u=>{u.target.files.length>0&&await Gt(u.target.files[0])&&setTimeout(()=>location.reload(),1500)},e.addEventListener("click",u=>{u.stopPropagation();const p=o.classList.toggle("show");e.classList.toggle("active",p)}),o.addEventListener("click",u=>{u.stopPropagation()}),document.addEventListener("click",u=>{o.classList.contains("show")&&(o.classList.remove("show"),e.classList.remove("active"))}),o.querySelectorAll(".size-options button").forEach(u=>{u.addEventListener("click",p=>{const m=p.target.getAttribute("data-size"),v=i[m];v&&(c.panel.style.width=v.width,c.panel.style.height=v.height),o.classList.remove("show"),e.classList.remove("active")})}),c.panel.querySelectorAll(".vnpt-resizer").forEach(u=>{u.addEventListener("mousedown",p=>{p.preventDefault(),p.stopPropagation();const m=p.clientX,v=p.clientY,x=c.panel.offsetWidth,w=c.panel.offsetHeight,N=c.widget.getBoundingClientRect(),W=N.top;window.innerWidth-N.right,c.panel.classList.add("vnpt-resizing"),document.body.classList.add("vnpt-resizing-global");const et=window.getComputedStyle(u).cursor;document.body.style.cursor=et;const D=S=>{const A=S.clientX-m,k=S.clientY-v;if(u.classList.contains("br"))c.panel.style.width=Math.max(360,x+A)+"px",c.panel.style.height=Math.max(250,w+k)+"px";else if(u.classList.contains("bl")){const E=x-A;E>360&&(c.panel.style.width=E+"px"),c.panel.style.height=Math.max(250,w+k)+"px"}else if(u.classList.contains("tr")){c.panel.style.width=Math.max(360,x+A)+"px";const E=w-k;E>250&&(c.panel.style.height=E+"px",c.widget.style.top=W+k+"px")}else if(u.classList.contains("tl")){const E=x-A,Y=w-k;E>360&&(c.panel.style.width=E+"px"),Y>250&&(c.panel.style.height=Y+"px",c.widget.style.top=W+k+"px")}},y=()=>{window.removeEventListener("mousemove",D),window.removeEventListener("mouseup",y),c.panel.classList.remove("vnpt-resizing"),document.body.classList.remove("vnpt-resizing-global"),document.body.style.cursor="";const S=c.widget.id==="vnpt-docx-widget";b.setDebounced(ft,{right:S?c.widget.style.right:void 0,top:c.widget.style.top,x:S?void 0:parseFloat(c.widget.style.left),y:parseFloat(c.widget.style.top)},500),b.setDebounced(gt,{width:c.panel.offsetWidth,height:c.panel.offsetHeight},500)};window.addEventListener("mousemove",D),window.addEventListener("mouseup",y)})})}function Ut(t,n,a,e=null,o=null){let i=!1,r=0,f=0,s=0,d=0,l=!1;const h=5;function g(p){l!==p&&(l=p,o&&o(p))}function u(p){if(p.button!==0||["INPUT","BUTTON","SELECT","TEXTAREA"].includes(p.target.tagName)||p.target.isContentEditable)return;i=!0,c.hasDragged=!1,s=p.clientX,d=p.clientY;const v=t.getBoundingClientRect();r=p.clientX-v.left,f=p.clientY-v.top,document.body.style.userSelect="none",n&&n.forEach(x=>x.style.cursor="grabbing"),e&&e(),p.preventDefault()}return n.forEach(p=>{p.addEventListener("mousedown",u)}),document.addEventListener("mousemove",function(p){if(!i)return;if(!c.hasDragged)if(Math.sqrt(Math.pow(p.clientX-s,2)+Math.pow(p.clientY-d,2))>h)c.hasDragged=!0;else return;let m=p.clientX-r,v=p.clientY-f;const x=window.innerWidth,w=window.innerHeight,N=document.getElementById("vnpt-toggle-btn"),W=N?N.offsetWidth:40,et=N?N.offsetHeight:40,D=t.id==="vnpt-docx-widget";let y=t.offsetWidth||0;if(D){let k=W+6-y,E=x-y+6;m<k&&(m=k),m>E&&(m=E)}else y=y||200,m<0&&(m=0),m+y>x&&(m=Math.max(0,x-y));let S=l;if(D?S=!1:l?p.clientY<w-40&&(S=!1):p.clientY>w-10&&(S=!0),v<0&&(v=0),S)g(!0),t.style.top=w-t.offsetHeight+"px",D?(t.style.right=x-m-y+"px",t.style.left="auto"):(t.style.left=m+"px",t.style.right="auto"),t.style.bottom="auto";else{g(!1);let A=t.offsetHeight||40,k;if(D)k=10+et;else{const E=t.querySelector(".cw-title-bar");k=E?E.offsetHeight:A}v+k>w&&(v=Math.max(0,w-k)),t.style.top=v+"px",D?(t.style.right=x-m-y+"px",t.style.left="auto"):(t.style.left=m+"px",t.style.right="auto"),t.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(i){if(i=!1,document.body.style.userSelect="",n&&n.forEach(p=>p.style.cursor="grab"),a){const p=t.id==="vnpt-docx-widget";b.set(a,{left:p?void 0:t.style.left,right:p?t.style.right:void 0,top:t.style.top,x:p?void 0:parseFloat(t.style.left),y:parseFloat(t.style.top),docked:l})}setTimeout(()=>{c.hasDragged=!1},100)}}),{isDocked:()=>l,setDocked:g}}function De(){c.widget&&c.header&&(Ut(c.widget,[c.header],ft),window.addEventListener("resize",()=>{const t=window.innerWidth,n=window.innerHeight,a=document.getElementById("vnpt-toggle-btn"),e=a?a.offsetWidth:40,o=a?a.offsetHeight:40;let i=c.widget.getBoundingClientRect(),r=i.left,f=i.top,s=c.widget.offsetWidth||0,l=e+6-s,h=t-s+6;r<l&&(r=l),r>h&&(r=h),f+10+o>n&&(f=Math.max(0,n-(10+o))),c.widget.style.right=t-r-s+"px",c.widget.style.top=f+"px"}))}function Xt(t){const n=t.toLowerCase(),{ngay:a,thang:e,nam:o}=_t(),i=`${a}/${e}/${o}`;return{"ngayky, ngayky1":a,ngayky:a,"thangky, thangky1":e,thangky:e,"namky, namky1":o,namky:o,"ngaytiepnhan, ngaythangnamky":i,ngaytiepnhan:i,ngaythangnamky:i,soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[n]||""}function Be(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){if(c.isDefaultMode){Object.keys(I).forEach(n=>{L(n,I[n],C[n]||"")}),B(),T("Đã nạp lại dữ liệu mặc định từ hệ thống.");return}let t=0;Object.keys(C).forEach(n=>{var r;const a=C[n],e=n.split(",")[0].trim(),o=Z(e,a);let i="";o&&(i=o.tagName.toLowerCase()==="select"?((r=o.options[o.selectedIndex])==null?void 0:r.text)||"":o.value,t++),i||(i=Xt(n)),i&&typeof i=="string"&&(["tenDaiDienn","tenToChuc","noiCap","noiKy"].includes(e)?i=ge(i):["sdt"].includes(e)?i=he(i):["ngaySinhCustomer","ngayCapCustomer","ngayCapSoDkdnCustomer","ngayKy","ngayTiepNhan"].includes(e)&&(i=me(i))),L(n,i,null)}),B(),t>0?(this.style.background="#1e8e3e",this.style.color="#fff",this.innerText="Đã quét xong",setTimeout(()=>{this.style.background="",this.style.color="",this.innerText="Quét dữ liệu"},1e3)):T("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(t){if(!(t.target.closest("#vnpt-docx-widget")||t.target.closest("#vnpt-inline-calc"))&&t.target&&t.target.id){const n=Object.keys(C).find(a=>a.split(",").map(e=>e.trim()).includes(t.target.id));n!==void 0&&(L(n,t.target.value,null),B())}}),document.addEventListener("change",function(t){var n;if(!(t.target.closest("#vnpt-docx-widget")||t.target.closest("#vnpt-inline-calc"))&&t.target&&t.target.id){const a=Object.keys(C).find(e=>e.split(",").map(o=>o.trim()).includes(t.target.id));if(a!==void 0){let e=t.target.tagName.toLowerCase()==="select"?((n=t.target.options[t.target.selectedIndex])==null?void 0:n.text)||"":t.target.value;L(a,e,null),B()}}})}const Ie={local:{download(t,n="arraybuffer"){return new Promise((a,e)=>{const o=new FileReader;switch(o.onload=i=>{let r=i.target.result;n==="base64"&&typeof r=="string"&&(r=r.split(",")[1]||r),a(r)},o.onerror=i=>e(i),n.toLowerCase()){case"arraybuffer":o.readAsArrayBuffer(t);break;case"base64":case"dataurl":o.readAsDataURL(t);break;case"text":o.readAsText(t);break;default:e(new Error(`Unsupported read type: ${n}`))}})},async upload(t){return this.download(t,"base64")}}},Ae={getAdapter(t){const n=Ie[t];if(!n)throw new Error(`Storage adapter not found: ${t}`);return n},async upload(t,n,a={}){return await this.getAdapter(t).upload(n,a)},async download(t,n,a={}){return await this.getAdapter(t).download(n,a.type||"arraybuffer")}};function Wt(t,n,a){try{let e;try{e=new window.PizZip(t)}catch(s){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(s);return}const o=new window.docxtemplater(e,{paragraphLoop:!0,linebreaks:!0});o.render(n);const i=o.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),r=URL.createObjectURL(i),f=document.createElement("a");f.href=r,f.download=a,document.body.appendChild(f),f.click(),setTimeout(()=>{document.body.removeChild(f),URL.revokeObjectURL(r)},100)}catch(e){let o=e.message;e.properties&&e.properties.errors instanceof Array?o=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+e.properties.errors.map(r=>"- "+(r.properties.explanation||r.message)).join(`
`):o="Lỗi phần mềm Word sinh ra: "+o,alert(o),console.error("DocX Error:",e)}}function Me(t,n){const a=t.replace(/@(\w+)/g,(e,o)=>n[o]!==void 0?n[o]:e);navigator.clipboard.writeText(a).then(()=>{alert("✅ Đã sao chép nội dung vào Clipboard!")}).catch(e=>{console.error("Lỗi khi copy:",e),alert("❌ Lỗi khi sao chép vào Clipboard. Vui lòng thử lại!")})}function _e(){const t=document.getElementById("vnpt-export-filename");t&&t.addEventListener("input",()=>{t.dataset.userEdited="1",t.value.trim()||(t.dataset.userEdited="0")});function n(){if(!t||t.dataset.userEdited==="1")return;let o="";if(c.fieldsContainer&&c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(l=>{const g=l.querySelector(".f-key").value.trim().split(",")[0].trim(),u=l.querySelector(".f-val").value.trim();g==="tenToChuc"&&(o=u)}),!o){const d=document.getElementById("tenToChuc");d&&(o=d.tagName.toLowerCase()==="textarea"||d.tagName.toLowerCase()==="input"?d.value.trim():d.innerText.trim())}function i(d){if(!d)return"";let l=d;return l=l.replace(/Tổng công ty/gi,""),l=l.replace(/Công ty/gi,""),l=l.replace(/\bCty\b/gi,""),l=l.replace(/Trách nhiệm hữu hạn/gi,""),l=l.replace(/\bTNHH\b/gi,""),l=l.replace(/Cổ phần/gi,""),l=l.replace(/\bCP\b/gi,""),l=l.replace(/Một thành viên/gi,""),l=l.replace(/\bMTV\b/gi,""),l=l.replace(/Chi nhánh/gi,""),l=l.replace(/Việt Nam/gi,"VN"),l=l.replace(/Viet Nam/gi,"VN"),l=l.replace(/\s+/g," ").trim(),l=l.replace(/^[-,\s]+|[-,\s]+$/g,""),l.length>50&&(l=l.substring(0,47)+"..."),l.replace(/[<>:"/\\|?*]/g,"")}let r=i(o),f=c.templateName?c.templateName.replace(/\.docx$/i,""):"",s=[];f&&s.push(f),r&&s.push(r),s.length>0?t.value=s.join(" - ")+".docx":t.value||(t.value="Export_Auto.docx")}setInterval(n,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const o={};if(c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(d=>{const h=d.querySelector(".f-key").value.trim().split(",")[0].trim(),g=d.querySelector(".f-val").value;h&&(o[h]=g)}),Object.keys(o).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}const r=[];if(ut.forEach(d=>{if(!o[d]||!o[d].trim()){const l=C[d]||d;r.push(l)}}),r.length>0){const d=`Cảnh báo: Bạn còn các trường sau chưa điền dữ liệu:

- ${r.join(`
- `)}

Bạn có chắc chắn muốn tiếp tục xuất file không?`;if(!confirm(d))return}let f=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(f.toLowerCase().endsWith(".docx")||(f+=".docx"),c.templateBuffer){Wt(c.templateBuffer,o,f);return}const s=document.getElementById("vnpt-template-file");if(s.files&&s.files.length>0){Ae.download("local",s.files[0],{type:"arraybuffer"}).then(d=>Wt(d,o,f)).catch(d=>alert(`Lỗi đọc file: ${d.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')});const a=document.getElementById("vnpt-btn-export-txt"),e=document.getElementById("vnpt-txt-template");if(e){const o=b.get(Tt);o&&(e.value=o),e.addEventListener("input",()=>{b.setDebounced(Tt,e.value,800)})}a&&a.addEventListener("click",()=>{const o=e?e.value:"";if(!o.trim()){alert(`Bạn chưa nhập nội dung Text Template!

Sử dụng @key làm placeholder, ví dụ: Tôi là @tenDaiDienn`);return}const i={};if(c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(f=>{const d=f.querySelector(".f-key").value.trim().split(",")[0].trim(),l=f.querySelector(".f-val").value;d&&(i[d]=l)}),Object.keys(i).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}Me(o,i)})}const He=["chucVu","noiCap","noiCapSoDkdn","ngayky","ngayky1","thangky","namky","thangky1","namky1","noiKy"],Oe=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function ze(){function t(){He.forEach(e=>{const o=document.getElementById(e);o&&!o.dataset.filled&&(o.dataset.filled="1",ct(o,Xt(e)))}),Oe.forEach(e=>{const o=document.getElementById(e.src),i=document.getElementById(e.target);o&&i&&!o.dataset.bound&&(o.dataset.bound="1",o.addEventListener("input",()=>ct(i,o.value)))})}let n;new MutationObserver(()=>{clearTimeout(n),n=setTimeout(t,200)}).observe(document.body,{childList:!0,subtree:!0}),t()}const Pe=()=>{let t="";for(const[n,a]of Object.entries(C)){const e=n.split(",")[0].trim();ut.includes(e)&&(t+=`"${e}": "${a}",
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
`};function Fe(t,n){return new Promise((a,e)=>{if(!n)return e("Vui lòng nhập API Key Gemini trong Cài đặt.");const o=`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${n}`,i={system_instruction:{parts:{text:Pe()}},contents:[{parts:[{text:"Đọc file hợp đồng này và trích xuất thành JSON."},{inline_data:{mime_type:"application/pdf",data:t}}]}],generationConfig:{responseMimeType:"application/json"}};typeof GM_xmlhttpRequest<"u"?GM_xmlhttpRequest({method:"POST",url:o,headers:{"Content-Type":"application/json"},data:JSON.stringify(i),timeout:3e4,onload:r=>{var f,s,d,l,h;if(r.status>=200&&r.status<300)try{const g=JSON.parse(r.responseText),u=(h=(l=(d=(s=(f=g==null?void 0:g.candidates)==null?void 0:f[0])==null?void 0:s.content)==null?void 0:d.parts)==null?void 0:l[0])==null?void 0:h.text;if(u){let p=u.replace(/```json/g,"").replace(/```/g,"").trim();a(JSON.parse(p))}else e("AI không trả về kết quả hợp lệ.")}catch(g){console.error("Lỗi parse JSON từ Gemini",g,r.responseText),e("Lỗi Parse kết quả từ Gemini.")}else e(`API Gemini lỗi (${r.status}): ${r.responseText}`)},ontimeout:()=>e("Quá hạn thời gian gọi API (30s)"),onerror:r=>e("Lỗi kết nối đến Google Gemini API.")}):fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)}).then(r=>r.json()).then(r=>{var d,l,h,g,u;if(r.error)return e(r.error.message);let s=((u=(g=(h=(l=(d=r==null?void 0:r.candidates)==null?void 0:d[0])==null?void 0:l.content)==null?void 0:h.parts)==null?void 0:g[0])==null?void 0:u.text).replace(/```json/g,"").replace(/```/g,"").trim();a(JSON.parse(s))}).catch(r=>e(r.message))})}function Ke(t){return new Promise((n,a)=>{const e=new FileReader;e.onload=()=>{const o=e.result.split(",")[1];n(o)},e.onerror=o=>a(o),e.readAsDataURL(t)})}function Re(){let t=document.getElementById("vnpt-pdf-loader");t||(t=document.createElement("div"),t.id="vnpt-pdf-loader",t.className="vnpt-pdf-overlay",t.innerHTML=`
            <div class="vnpt-pdf-loading-box">
                <div class="loader-spinner"></div>
                <div style="margin-top: 15px; font-weight: 800; font-size: 13px; color: #1a73e8;">Đang nhờ AI đọc Hợp đồng...</div>
                <div style="margin-top: 4px; font-size: 11px; color: #5f6368;">Tùy thuộc độ lớn file, thường mất 5 - 10s...</div>
            </div>
        `,document.body.appendChild(t)),t.style.display="flex"}function Yt(){const t=document.getElementById("vnpt-pdf-loader");t&&(t.style.display="none")}function Ve(t,n){let a=document.getElementById("vnpt-pdf-dialog");a&&a.remove(),a=document.createElement("div"),a.id="vnpt-pdf-dialog",a.className="vnpt-pdf-overlay";const e=t.map((s,d)=>`
        <tr class="pdf-row-auto">
            <td style="text-align: center;">
                <input type="checkbox" class="pdf-row-chk" data-index="${d}" checked />
            </td>
            <td><strong>${s.key}</strong></td>
            <td><div style="max-height: 40px; overflow-y: auto; color: #1a73e8; font-weight: 600;">${s.value}</div></td>
        </tr>
    `).join("");a.innerHTML=`
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
    `,document.body.appendChild(a);const o=a.querySelector("#pdf-btn-cancel"),i=a.querySelector("#pdf-btn-confirm"),r=a.querySelector("#pdf-check-all"),f=a.querySelectorAll(".pdf-row-chk");r.addEventListener("change",s=>{f.forEach(d=>d.checked=s.target.checked)}),o.onclick=()=>{a.remove()},i.onclick=()=>{const s=[];f.forEach(d=>{if(d.checked){const l=parseInt(d.getAttribute("data-index"));s.push(t[l])}}),a.remove(),n(s)}}function qe(){const t=document.getElementById("vnpt-btn-scan-pdf"),n=document.getElementById("vnpt-pdf-input");!t||!n||(t.addEventListener("click",a=>{a.preventDefault(),n.click()}),n.addEventListener("change",async a=>{const e=a.target.files[0];e&&(a.target.value="",await $e(e))}))}async function $e(t){const n=b.get(Mt);if(!n){confirm(`Chưa cài đặt Gemini API Key!

AI Scanner (PDF) yêu cầu cần có mã Google AI Studio cấp phát Miễn phí.

Nhấn 'OK' để xem hướng dẫn tự tạo mã Key nhé!`)&&window.open("https://github.com/tranchien2000/vnpt-tampermonkey-vite/blob/main/docs/GEMINI_API_GUIDE.md","_blank");return}try{Re();const a=await Ke(t),e=await Fe(a,n);Yt();const o=Object.keys(e).map(i=>({key:i,value:e[i],label:e[i]===""?"(Trống)":e[i]})).filter(i=>i.value!=="");if(o.length===0){alert("Rất tiếc! AI không tìm thấy trường thông tin nào thỏa mãn (Bên A).");return}Ve(o,i=>{i.forEach(r=>{L(r.key,r.value,`AI: ${r.key}`)}),B(),console.log(`✅ [OCR Pdf] Đã điền thành công ${i.length} trường.`)})}catch(a){Yt(),console.error("Lỗi PDF Scan Pipeline:",a),alert(`Lỗi xử lý quét File:
`+a)}}function tt(t,n=null){return b.get(t,n)}function yt(t,n){b.set(t,n)}function Jt(t,n){if(!n||n.replace(/\D/g,"").length<6)return;let a=tt(t,[]);a=a.filter(e=>e!==n),a.unshift(n),yt(t,a.slice(0,10))}function wt(t,n){const a=document.getElementById(n);a&&(a.innerHTML=tt(t,[]).map(e=>`<option value="${e}">`).join(""))}function Lt(t){return t.toLocaleString("en-US")}function Dt(t){return Number(String(t).replace(/[^\d]/g,""))||0}function je(t){return t.charAt(0).toUpperCase()+t.slice(1)}const dt=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function Ge(t){let n=Math.floor(t/100),a=Math.floor(t%100/10),e=t%10,o="";return n>0&&(o+=dt[n]+" trăm ",a===0&&e>0&&(o+="lẻ ")),a>1?(o+=dt[a]+" mươi ",e===1?o+="mốt":e===5?o+="lăm":e>0&&(o+=dt[e])):a===1?(o+="mười ",e===5?o+="lăm":e>0&&(o+=dt[e])):e>0&&(n>0&&(o+="lẻ "),o+=dt[e]),o.trim()}function Ue(t){if(t===0)return"không";const n=["","nghìn","triệu","tỷ"];let a="",e=0;for(;t>0;){const o=t%1e3;o>0&&(a=Ge(o)+" "+n[e]+" "+a),t=Math.floor(t/1e3),e++}return a.trim()}function Qt(t,n,a){let e=0,o=0,i=0;t==="before"?(e=Dt(n),o=Math.round(e*a),i=e+o):t==="tax"?(o=Dt(n),e=Math.round(o/a),i=e+o):t==="after"&&(i=Dt(n),e=Math.round(i/(1+a)),o=i-e);const r=je(Ue(i))+" đồng";return{beforeNum:e,taxNum:o,afterNum:i,beforeStr:Lt(e),taxStr:Lt(o),afterStr:Lt(i),textStr:r}}function Xe(t,n){n.before&&n.before.forEach(a=>X(a,t.beforeStr)),n.tax&&n.tax.forEach(a=>X(a,t.taxStr)),n.after&&n.after.forEach(a=>X(a,t.afterStr)),n.text&&n.text.forEach(a=>X(a,t.textStr))}function kt(t,n=null){try{const a=localStorage.getItem(t);return a!==null?JSON.parse(a):n}catch{return n}}function O(t,n){localStorage.setItem(t,JSON.stringify(n))}function We(t,n,a,e){let o=kt(Q)??"custom",i=kt(H)??{...I},r=kt(j)??{},f=kt(F)??{};const s=document.createElement("div");s.className="cw-tab-header";const d={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};d.custom.innerText="📋 Custom",d.custom.className="cw-tab cw-tab-custom",d.default.innerText="📌 Default",d.default.className="cw-tab cw-tab-default",d.sync.innerText="🔗 Sync",d.sync.className="cw-tab cw-tab-sync";function l(){Object.values(d).forEach(y=>y.classList.remove("active")),d[o].classList.add("active")}l();const h=document.createElement("div");h.style.display=e.data?"none":"block";const g=n("📋 Cấu hình Data","data",y=>{h.style.display=y?"none":"block",a(t)}),u=document.createElement("div");u.className="cw-data-body";function p(){u.innerHTML="";let y=o==="sync"?f:o==="custom"?r:i,S=o==="sync"?F:o==="custom"?j:H;const A=Object.keys(y);A.length===0&&o!=="default"&&(u.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),A.forEach(k=>{const E=document.createElement("div");E.className="cw-data-row";let Y=o!=="default";const q=y[k],Et=q&&typeof q=="object"&&q.hasOwnProperty("value"),Zt=Et?q.value:q,It=Et&&q.label||k,M=document.createElement("input");M.type="text",M.value=It,M.id=`df-key-${k}`,M.name=`df-key-${k}`,M.className="cw-data-key"+(Y?" mutable":""),M.title=k,M.readOnly=!Y,Y&&(M.onchange=()=>{const _=M.value.trim();if(!_||_===k){M.value=It;return}Et?y[_]={...q,label:_}:y[_]=Zt,delete y[k],O(S,y),p()});const z=document.createElement("input");if(z.type="text",z.value=Zt??"",z.id=`df-val-${k}`,z.name=`df-val-${k}`,z.className="cw-data-val",z.oninput=()=>{Et?y[k]={...q,value:z.value}:y[k]=z.value,O(S,y)},E.appendChild(M),E.appendChild(z),Y){const _=document.createElement("button");_.innerHTML="✕",_.className="cw-del-btn",_.onclick=()=>{confirm(`Delete "${It}"?`)&&(delete y[k],O(S,y),p())},E.appendChild(_)}else E.appendChild(document.createElement("div")).className="cw-pad";u.appendChild(E)})}d.custom.onclick=()=>{o="custom",O(Q,"custom"),l(),p()},d.default.onclick=()=>{o="default",O(Q,"default"),l(),p()},d.sync.onclick=()=>{o="sync",O(Q,"sync"),l(),p()};const m=document.createElement("button");m.innerText="📤",m.className="cw-icon-btn",m.title="Sao lưu toàn bộ dữ liệu ra JSON",m.onclick=()=>jt();const v=document.createElement("button");v.innerText="📥",v.className="cw-icon-btn",v.title="Khôi phục dữ liệu từ JSON";const x=document.createElement("input");x.type="file",x.accept=".json",x.style.display="none",x.onchange=async y=>{y.target.files.length>0&&await Gt(y.target.files[0])&&setTimeout(()=>location.reload(),1500)},v.onclick=()=>x.click(),h.appendChild(s),s.appendChild(d.custom),s.appendChild(d.default),s.appendChild(d.sync),h.appendChild(u),t.appendChild(g),t.appendChild(h);const w=t.querySelector("#vnpt-cw-fill"),N=t.querySelector("#vnpt-cw-sync"),W=t.querySelector("#vnpt-cw-add"),et=t.querySelector("#vnpt-cw-reset");w&&(w.onclick=Rt),N&&(N.onclick=Ee),W&&(W.onclick=()=>{o==="default"&&(o="custom",O(Q,"custom"),l());let y=o==="sync"?f:r,S="new_field_"+Date.now();y[S]="",O(o==="sync"?F:j,y),p(),u.scrollTop=u.scrollHeight}),et&&(et.onclick=()=>{confirm("Reset Default Data?")&&(i={...I},O(H,i),p())}),p();const D=g.querySelector(".cw-right-wrap")||document.createElement("div");D.className="cw-right-wrap",D.prepend(m),D.prepend(v),D.appendChild(x),g.appendChild(D)}function Ye(t,n,a){let e=Number(localStorage.getItem(J))||ke,o=tt(ot)??{calc:!1,data:!0};function i(g,u){const p=document.createElement("button");return p.innerText=g,p.className="cw-action-btn "+u,p}function r(g,u,p){const m=document.createElement("div");m.className="wg-sec-header";const v=document.createElement("span");v.innerText=g;const x=document.createElement("button");return x.className="wg-toggle-btn",x.innerText=o[u]?"▾":"▴",m.appendChild(v),m.appendChild(x),x.onclick=()=>{o[u]=!o[u],x.innerText=o[u]?"▾":"▴",yt(ot,o),p(o[u])},m}function f(g){const u=window.innerWidth,p=window.innerHeight,m=g.getBoundingClientRect();g.style.left=Math.min(Math.max(parseFloat(g.style.left),0),u-m.width)+"px",g.style.top=Math.min(Math.max(parseFloat(g.style.top),0),p-36)+"px"}const s=document.createElement("div");if(!n){s.className="cw-title-bar",s.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const g=document.createElement("div");g.className="cw-btn-group";const u={fill:i("Fill","cw-btn-fill"),sync:i("Sync","cw-btn-sync"),add:i("Add","cw-btn-add"),reset:i("↺","cw-btn-reset")};u.reset.title="Reset Default fields",Object.values(u).forEach(p=>g.appendChild(p)),s.appendChild(g),t.appendChild(s)}const d=document.createElement("div");d.className="cw-body-inline",d.innerHTML=`
    <div class="cw-inline-row">
        <input id="wg-before" name="wg-before" class="cw-input-inline" placeholder="Trước thuế" list="wg-before-list" title="Trước thuế">
        <datalist id="wg-before-list"></datalist>
        <div class="cw-tax-group-inline"><input id="wg-taxRate" name="wg-taxRate" class="cw-tax-input-inline" title="Thuế (%)"><span class="cw-tax-symbol">%</span></div>
        <input id="wg-tax" name="wg-tax" class="cw-input-inline" placeholder="Tiền thuế" title="Tiền thuế">
        <input id="wg-after" name="wg-after" class="cw-input-inline" placeholder="Sau thuế" list="wg-after-list" title="Sau thuế">
        <datalist id="wg-after-list"></datalist>
        <input id="wg-text" name="wg-text" class="cw-input-inline cw-input-readonly-inline" placeholder="Bằng chữ" readonly title="Bằng chữ">
    </div>`,n?n.appendChild(d):t.appendChild(d),n||We(t,r,f,o);const l={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text")};l.taxRate.value=e*100,wt(mt,"wg-before-list"),wt(bt,"wg-after-list");function h(g,u){const p=Qt(g,u,e);l.before.value=p.beforeStr,l.tax.value=p.taxStr,l.after.value=p.afterStr,l.text.value=p.textStr;const m=tt(K)||{...Ft};Xe(p,m)}if(l.taxRate.oninput=()=>{e=Number(l.taxRate.value)/100||0,yt(J,e),h("before",l.before.value)},l.before.oninput=()=>{const g=Qt("before",l.before.value,e);l.tax.value=g.taxStr,l.after.value=g.afterStr,l.text.value=g.textStr},l.before.onchange=()=>{h("before",l.before.value),Jt(mt,l.before.value),wt(mt,"wg-before-list")},l.tax.oninput=()=>h("tax",l.tax.value),l.after.oninput=()=>h("after",l.after.value),l.after.onchange=()=>{h("after",l.after.value),Jt(bt,l.after.value),wt(bt,"wg-after-list")},[l.before,l.tax,l.after,l.text].forEach(g=>{["click","focus"].forEach(u=>g.addEventListener(u,()=>{if(!g.value)return;navigator.clipboard.writeText(g.value);const p=g.style.backgroundColor;g.style.backgroundColor="#d1e7dd",setTimeout(()=>g.style.backgroundColor=p,300)}))}),!n){const g=Array.from(t.children).filter(m=>m!==s),u=Ut(t,[s],a,null,m=>{g.forEach(v=>v.style.display=m?"none":""),s.style.borderRadius=m?"8px":"0",m&&(t.style.top=window.innerHeight-(s.offsetHeight||34)+"px")}),p=tt(a);return p&&p.docked&&u.setDocked(!0),window.addEventListener("resize",()=>{u.isDocked()?t.style.top=window.innerHeight-s.offsetHeight+"px":f(t)}),u}return null}function Je(){const t=document.getElementById("vnpt-inline-calc"),n=document.getElementById("vnpt-btn-calc-toggle");let a=c.calcWidget||document.createElement("div");if(!t&&!c.calcWidget?(a.id="vnpt-calc-widget",document.body.appendChild(a),c.calcWidget=a):t&&(a=c.widget),t&&n){let e=tt(ot)??{calc:!1,data:!0};const o=i=>{t.style.display=i?"none":"block",n.classList.toggle("active",!i)};o(e.calc),n.onclick=()=>{e.calc=!e.calc,yt(ot,e),o(e.calc)}}return Ye(a,t,At)}function Qe(){window.addEventListener("keydown",t=>{var n,a,e,o;if(t.altKey&&!t.ctrlKey&&!t.shiftKey){const i=t.key.toLowerCase();let r=!0;switch(i){case"s":(n=document.getElementById("vnpt-btn-scan"))==null||n.click();break;case"e":(a=document.getElementById("vnpt-btn-export"))==null||a.click();break;case"w":(e=document.getElementById("vnpt-toggle-btn"))==null||e.click();break;case"f":(o=document.getElementById("vnpt-btn-fill-back"))==null||o.click();break;default:r=!1;break}r&&t.preventDefault()}})}function Ze(){let t=!1;try{t=!1}catch{t=!1}t&&$.info("[Migration] Dev mode active - Syncing configurations...");let n=b.get(H);if(n){let e=!1;Object.keys(I).forEach(o=>{const i=I[o];if(!(o in n))n[o]=i,e=!0;else if(t){const r=n[o],f=i&&typeof i=="object",s=r&&typeof r=="object";let d=!1;!f&&!s?d=r!==i:f&&s?d=r.value!==i.value||r.label!==i.label:d=!0,d&&(n[o]=i,e=!0)}}),e&&b.set(H,n)}let a=b.get(P);if(a){let e=!1;Object.keys(I).forEach(o=>{const i=I[o],r=i&&typeof i=="object"?i.value:i,f=i&&typeof i=="object"?i.label:C[o]||"";if(!(o in a))a[o]={label:f,value:r,sync:""},e=!0;else if(t){const s=a[o];(s.value!==r||s.label!==f)&&(a[o]={label:f,value:r,sync:s.sync||""},e=!0)}}),e&&b.setDebounced(P,a,0)}}let pt=null;function Bt(){if(!window.__vnptInited){window.__vnptInited=!0,$.info("Initializing VNPT Userscript..."),Ze();try{te(),Le(),Je(),De(),Ne(),Vt(),Be(),_e(),ze(),qe(),Se(),Qe();const t=Kt(()=>{be(),$.debug("DOM Cache cleared due to mutations")},500);pt=new MutationObserver(n=>{n.some(a=>a.addedNodes.length>0||a.removedNodes.length>0)&&t()}),pt.observe(document.body,{childList:!0,subtree:!0}),$.info("Userscript initialized successfully.")}catch(t){$.error("Error during userscript initialization:",t)}}}function tn(){$.info("Cleaning up VNPT Userscript for reload..."),pt&&(pt.disconnect(),pt=null);const t=document.getElementById("vnpt-docx-widget");t&&t.remove();const n=document.getElementById("vnpt-calc-widget");n&&n.remove();const a=document.getElementById("vnpt-styles");a&&a.remove(),window.__vnptInited=!1,$.info("Cleanup completed.")}window.__vnptCleanup=tn,window.__vnptInit=Bt,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Bt):Bt()})();
