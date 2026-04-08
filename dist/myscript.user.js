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
(function(){"use strict";const P={info:(...t)=>console.log("[Tampermonkey Script] INFO:",...t),error:(...t)=>console.error("[Tampermonkey Script] ERROR:",...t),warn:(...t)=>console.warn("[Tampermonkey Script] WARN:",...t)};function Qt(){const t="vnpt-styles";if(document.getElementById(t))return;const e=document.createElement("style");e.id=t,e.textContent=`
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

    `,document.head.appendChild(e)}const Jt={widget:null,panel:null,header:null,bannerArea:null,toggleBtn:null,fieldsContainer:null,panelBody:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1,templateBuffer:null,templateName:null,hasDragged:!1},Z=new Map,c=new Proxy(Jt,{get(t,e){return e==="on"?(o,n)=>{Z.has(o)||Z.set(o,[]),Z.get(o).push(n)}:t[e]},set(t,e,o){const n=t[e];return t[e]=o,n!==o&&Z.has(e)&&Z.get(e).forEach(a=>a(o,n)),!0}}),k={"tenDaiDienn, tenNguoiNhanCTS ":"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT","emailDaiDien, emailNhanCTS":"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Mã số thuế | GPKD",goiDV:"Gói Dịch Vụ","ngayKy, ngayKy1":"Ngày ký","thangKy, thangKy1":"Tháng Ký","namKy, namKy1":"Năm ký","ngayTiepNhan, ngayThangNamKy":"Ngày tiếp nhận / Ngày tháng năm ký","soHopDong, inputContractGroupName, contractNumber, contractName":"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký","lienheHopDongA, lienheTuVanA, lienheHoaDonA, sucoCap1A, sucoCap2A, sucoCap3A, sucoCap4A":"Liên hệ A"},Bt=["soHopDong","tenDaiDienn","cmnd","sdt","diaChi","tenToChuc","ngayCapCustomer","emailDaiDien","soDkdn","goiDV","soHopDong"],st="vnpt_docx_fields",V="vnpt_docx_default_fields",vt="vnpt_docx_position",xt="vnpt_docx_size",yt="vnpt_docx_opened",z="vnpt_autofill_data_default",W="vnpt_autofill_data_custom",j="vnpt_autofill_data_sync",Zt="vnpt_widget_pos",tt="vnd_tax_rate",wt="vnd_before_history",Et="vnd_after_history",ct="vnpt_widget_collapsed",q="vnd_calc_map",et="vnpt_widget_datatab",dt="vnpt_templates",It="vnpt_txt_template";let F=null;function T(t,e="#198754",o=2500){F||(F=document.createElement("div"),F.id="vnpt-toast-container",Object.assign(F.style,{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column-reverse",alignItems:"center",gap:"8px",zIndex:"1000000",pointerEvents:"none"}),document.body.appendChild(F));const n=document.createElement("div");n.innerText=t,Object.assign(n.style,{background:e,color:"#fff",padding:"8px 18px",borderRadius:"24px",opacity:"0",transform:"translateY(10px)",transition:"opacity 0.3s, transform 0.3s",fontSize:"13px",fontWeight:"500",fontFamily:"'Segoe UI', Roboto, sans-serif",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",whiteSpace:"nowrap",pointerEvents:"auto"}),F.appendChild(n),requestAnimationFrame(()=>{n.style.opacity="1",n.style.transform="translateY(0)"}),setTimeout(()=>{n.style.opacity="0",n.style.transform="translateY(-10px)",setTimeout(()=>{n.remove(),F&&F.childNodes.length},300)},o)}const te="vnpt_templates_db",K="buffers";let pt=null;function Tt(){return pt?Promise.resolve(pt):new Promise((t,e)=>{const o=indexedDB.open(te,1);o.onupgradeneeded=n=>{const a=n.target.result;a.objectStoreNames.contains(K)||a.createObjectStore(K)},o.onsuccess=n=>{pt=n.target.result,t(pt)},o.onerror=()=>e(o.error)})}async function ee(t,e){const o=await Tt();return new Promise((n,a)=>{const u=o.transaction(K,"readwrite").objectStore(K).put(e,t);u.onsuccess=()=>n(),u.onerror=()=>a(u.error)})}async function ne(t){const e=await Tt();return new Promise((o,n)=>{const l=e.transaction(K,"readonly").objectStore(K).get(t);l.onsuccess=()=>o(l.result),l.onerror=()=>n(l.error)})}async function ae(t){const e=await Tt();return new Promise((o,n)=>{const l=e.transaction(K,"readwrite").objectStore(K).delete(t);l.onsuccess=()=>o(),l.onerror=()=>n(l.error)})}const U=new Map,ut=new Map,b={isGM:typeof GM_setValue<"u"&&typeof GM_getValue<"u",get(t,e=null){if(U.has(t))return U.get(t);try{let o;if(this.isGM?o=GM_getValue(t,null):o=localStorage.getItem(t),o==null)return e;const n=typeof o=="string"?JSON.parse(o):o;return U.set(t,n),n}catch(o){return console.warn(`[Storage] Không thể đọc key "${t}":`,o),e}},set(t,e){U.set(t,e);try{return this.isGM?GM_setValue(t,e):localStorage.setItem(t,JSON.stringify(e)),!0}catch(o){return console.error(`[Storage] Không thể ghi key "${t}":`,o),!1}},setDebounced(t,e,o=500){U.set(t,e),ut.has(t)&&clearTimeout(ut.get(t));const n=setTimeout(()=>{this.set(t,e),ut.delete(t)},o);ut.set(t,n)},remove(t){U.delete(t);try{this.isGM?GM_deleteValue(t):localStorage.removeItem(t)}catch(e){console.error(`[Storage] Không thể xóa key "${t}":`,e)}},clearCache(){U.clear()}};function nt(){try{const t=b.get(dt)||[],e=t.filter(o=>o.type!=="local");return e.length!==t.length&&at(e),e}catch{return[]}}function at(t){b.set(dt,t)}function oe(t){const e=t.match(/drive\.google\.com\/file\/d\/([^/]+)/);return e?`https://drive.google.com/uc?export=download&id=${e[1]}`:t}function ie(t){return new Promise((e,o)=>{GM_xmlhttpRequest({method:"GET",url:oe(t),responseType:"arraybuffer",onload:n=>{if(n.status>=200&&n.status<300){if(n.response&&n.response.byteLength>4){const a=new Uint8Array(n.response.slice(0,4));if(a[0]===80&&a[1]===75&&a[2]===3&&a[3]===4){e(n.response);return}else{o(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}e(n.response)}else o(new Error(`HTTP ${n.status}: Không lấy được file`))},onerror:()=>o(new Error("Không thể tải URL.")),ontimeout:()=>o(new Error("Timeout khi tải URL."))})})}async function re(t,e,o){const n=t.name.replace(/\.docx$/i,""),a=prompt("Đặt tên biến nhớ cho file này:",n);if(!(!a||!a.trim()))try{const i=await t.arrayBuffer();await ee(a.trim(),i);const u=nt().filter(s=>s.name!==a.trim()&&s.fileName!==t.name);u.unshift({name:a.trim(),type:"local_idb",fileName:t.name,lastUsed:Date.now()}),at(u),$(e,o),o&&o(i,a.trim())}catch(i){T(`❌ Lỗi lưu file: ${i.message}`,"#dc3545")}}function $(t,e,o=null){let n=t.querySelector(".vnpt-template-manager-inner"),a,i;if(n)a=n.querySelector(".vnpt-local-list-container"),i=n.querySelector(".vnpt-btn-wrap");else{t.innerHTML="",n=document.createElement("div"),n.className="vnpt-template-manager-inner";const s=document.createElement("div");s.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const d=document.createElement("span");d.className="vnpt-title-main",d.style.cssText="font-size:11px;font-weight:700;color:#444;",i=document.createElement("div"),i.className="vnpt-btn-wrap",i.style.cssText="display:flex;gap:4px;",s.appendChild(d),s.appendChild(i),n.appendChild(s),a=document.createElement("div"),a.className="vnpt-local-list-container",a.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",n.appendChild(a),t.appendChild(n)}const l=nt(),u=n.querySelector(".vnpt-title-main");u.innerHTML="Templates"+(o?` <span style="color:#2e7d32;">(Đang dùng: ${o})</span>`:""),l.length===0?a.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':a.innerHTML="",l.forEach((s,d)=>{const r=document.createElement("div");r.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",r.title=s.fileName||s.url||s.name,r.tabIndex=0,r.onfocus=()=>r.style.boxShadow="0 0 0 2px #28a745",r.onblur=()=>r.style.boxShadow="none";const m=s.type==="local"||s.type==="local_base64"||s.type==="local_idb"?"OFF":"ON",p=m==="OFF"?"#6c757d":"#28a745",g=document.createElement("span");g.textContent=m,g.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${p};color:#fff;`;const f=document.createElement("span");f.textContent=s.name,f.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",r.onclick=()=>{r.focus(),le(s,e,o,t)},r.appendChild(g),r.appendChild(f);const h=document.createElement("button");h.innerHTML="✎",h.title="Đổi tên template",h.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",h.onclick=y=>{y.stopPropagation();const E=prompt("Đổi tên template:",s.name);if(E&&E.trim()&&E.trim()!==s.name){const S=nt();S[d].name=E.trim(),at(S),$(t,e,o)}},r.appendChild(h);const v=document.createElement("button");v.innerHTML="✕",v.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",v.onclick=async y=>{if(y.stopPropagation(),confirm(`Xoá biểu mẫu "${s.name}"?`)){const E=nt();E.splice(d,1),at(E),s.type==="local_idb"&&await ae(s.name).catch(()=>null),$(t,e,o===s.name?null:o)}},r.appendChild(v),a.appendChild(r)})}function le(t,e,o,n){const a=nt(),i=a.find(l=>l.name===t.name&&(l.url===t.url||l.type===t.type));if(i&&(i.lastUsed=Date.now(),at(a)),t.type==="local_idb"){ne(t.name).then(l=>{if(!l)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");e&&e(l,t.name),$(n,e,t.name)}).catch(l=>{T(`❌ Lỗi nạp File IDB: ${l.message}`,"#dc3545")});return}if(t.type==="local_base64"&&t.data){try{const l=window.atob(t.data.split(",")[1]),u=l.length,s=new Uint8Array(u);for(let d=0;d<u;d++)s[d]=l.charCodeAt(d);e&&e(s.buffer,t.name),$(n,e,t.name)}catch(l){T(`❌ Lỗi nạp Base64: ${l.message}`,"#dc3545")}return}ie(t.url).then(l=>{e&&e(l,t.name),$(n,e,t.name)}).catch(l=>{T(`❌ ${l.message}`,"#dc3545")})}function se(t,e){if(t.length===0)return e.length;if(e.length===0)return t.length;const o=[];for(let n=0;n<=e.length;n++)o[n]=[n];for(let n=0;n<=t.length;n++)o[0][n]=n;for(let n=1;n<=e.length;n++)for(let a=1;a<=t.length;a++)e.charAt(n-1)===t.charAt(a-1)?o[n][a]=o[n-1][a-1]:o[n][a]=Math.min(o[n-1][a-1]+1,o[n][a-1]+1,o[n-1][a]+1);return o[e.length][t.length]}function ce(t,e){let o=t,n=e;t.length<e.length&&(o=e,n=t);const a=o.length;return a===0?1:(a-se(o,n))/parseFloat(a)}function de(t,e,o=.7){let n=null,a=-1;const i=t.toLowerCase().trim();for(const l of e){const u=l.toLowerCase().trim(),s=ce(i,u);s>a&&s>=o&&(a=s,n=l)}return n}function pe(t){return t?t.toLowerCase().split(" ").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" "):""}function ue(t){if(!t)return"";let e=t.replace(/\D/g,"");return e.startsWith("84")&&(e="0"+e.slice(2)),e}function fe(t){if(!t)return"";const e=t.split(/[-/]/);if(e.length===3){let o,n,a;return e[0].length===4?[a,n,o]=e:[o,n,a]=e,`${o.padStart(2,"0")}/${n.padStart(2,"0")}/${a}`}return t}const ot=new Map;function ge(){ot.clear()}function he(t){t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}))}function it(t,e){var a;const o=t.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,n=(a=Object.getOwnPropertyDescriptor(o,"value"))==null?void 0:a.set;n?n.call(t,e):t.value=e,he(t)}function Y(t,e=null){if(!t)return null;const o=ot.get(t);if(o&&document.contains(o))return o;const n=document.getElementById(t);if(n&&(n.tagName==="INPUT"||n.tagName==="TEXTAREA"||n.tagName==="SELECT"))return ot.set(t,n),n;const a=`input[id="${t}"], textarea[id="${t}"], select[id="${t}"], input[name="${t}"], textarea[name="${t}"], input[formcontrolname="${t}"], textarea[formcontrolname="${t}"], input[placeholder="${t}"], textarea[placeholder="${t}"]`,i=document.querySelector(a);if(i)return ot.set(t,i),i;const l=e||t,u=Array.from(document.querySelectorAll("label, .label, .label-text, span.title"));let s=u.find(d=>d.innerText.trim()===l);if(!s&&l.length>2){const d=u.map(m=>m.innerText.trim()).filter(m=>m.length>0),r=de(l,d,.8);r&&(s=u.find(m=>m.innerText.trim()===r))}if(s){let d=null;if(s.htmlFor&&(d=document.getElementById(s.htmlFor)),!d){let r=s.parentElement,m=0;for(;r&&m<3;){const p=r.querySelector("input, textarea, select");if(p){d=p;break}r=r.parentElement,m++}}if(d)return ot.set(t,d),d}return null}function Ct(t){return Y(null,t)}function G(t,e,o=null){const n=Y(t,o);n&&it(n,e)}function me(t=new Date){return String(t.getDate()).padStart(2,"0")}function be(t=new Date){return String(t.getMonth()+1).padStart(2,"0")}function ve(t=new Date){return String(t.getFullYear())}function At(){const t=new Date;return{ngay:me(t),thang:be(t),nam:ve(t)}}const{ngay:Mt,thang:_t,nam:Ht}=At(),I={"ngayKy, ngayKy1":{label:"Ngày ký",value:Mt},"thangKy, thangKy1":{label:"Tháng ký",value:_t},"namKy, namKy1":{label:"Năm ký",value:Ht},"ngayTiepNhan, ngayThangNamKy":{label:"Ngày ký (full)",value:`${Mt}/${_t}/${Ht}`},tenDoanhNghiepB:{label:"Tên doanh nghiệp B",value:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM"},diaChiB:{label:"Địa chỉ B",value:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội"},maSoThueB:{label:"Mã số thuế B",value:"0100686223"},stkB:{label:"Số tài khoản B",value:"1600114156"},diaChiStkB:{label:"Ngân hàng/Địa chỉ STK B",value:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)"},"tenB, nguoiDaiDienB":{label:"Người đại diện B",value:"Phạm Khánh Chung"},"chucVuB, chucVuDaiDienB":{label:"Chức vụ B",value:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp"},"giayUyQuyenSoB, soGiayUyQuyenB":{label:"Giấy ủy quyền số B",value:"2628/GUQ-VNPT-HNI-VP"},"giayUyQuyenNgayB, ngayGiayUyQuyenB":{label:"Giấy ủy quyền ngày B",value:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},GiayUyQuyenB:{label:"Giấy ủy quyền B (full)",value:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},tenDoanhNghiepB1:{label:"Tên doanh nghiệp B (phụ)",value:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},donViTiepNhan:{label:"Đơn vị tiếp nhận",value:"TTKD KHDN"},"tenTiepNhan, tenNguoiNhan":{label:"Người tiếp nhận",value:"Bùi Anh"},dienThoaiB:{label:"Điện thoại B",value:"02436686868"},diaChiTaiKhoanB:{label:"Địa chỉ tài khoản B",value:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 "},noiKy:{label:"Nơi ký",value:"Hà Nội"},emailB:{label:"Email B",value:""},"lienheHopDongB, lienheTuVanB, lienheHoaDonB, sucoCap1B, sucoCap2B, sucoCap3B, sucoCap4B":{label:"Liên hệ B (AM)",value:"AM Bùi Anh"}},Ot={soHopDong:"soHopDong, inputContractGroupName, contractNumber, contractName"},zt={after:["vnpt-map-after","cuocDV","tongCong","tongCongHD","congCA","giaTriHopDong","tongGIaTriHopDong"],before:["vnpt-map-before","donGiaCA","thanhTienCA","tongThanhTien","tongCuocTruocThue"],tax:["vnpt-map-tax","tongThueGTGT","tongThue","thueCA","thueVAT"],text:["vnpt-map-text","soTienThanhToanBangChu","tongCongBangChu","tongCongHDbangChu","ghiChuGiaTriHopDong","tongGiaTriHopDongBangChu"]},xe=.08;function Ft(t,e){let o;return function(...a){const i=()=>{clearTimeout(o),t(...a)};clearTimeout(o),o=setTimeout(i,e)}}function Kt(){const t=b.get(z)??{...I},e=b.get(W)??{},o={...t,...e};Object.keys(o).forEach(n=>{const a=o[n],i=a&&typeof a=="object"&&a.hasOwnProperty("value")?a.value:a;n.split(",").map(u=>u.trim()).filter(u=>u).forEach(u=>{let s=Y(u)||Ct(u);s&&it(s,i)})}),T("✅ Auto fill complete")}function ye(){let t=b.get(j)??{};const e={...Ot,...t},o=Object.keys(e);if(o.length===0){T("⚠️ No sync mapping","#ffc107");return}o.forEach(n=>{let a=Y(n)||Ct(n);a&&a.value!==void 0&&a.value!==""&&e[n].split(",").map(l=>l.trim()).filter(l=>l).forEach(l=>G(l,a.value))}),T("✅ Sync form complete","#d39e00")}let kt=!1;const we=(t,e)=>{var s;if(kt)return;let o=b.get(j)??{};const n={...Ot,...o};if(Object.keys(n).length===0)return;let a=t.id,i=t.name,l=null;if(a){const d=document.querySelector(`label[for="${a}"]`);d&&(l=d.textContent.trim())}if(!l){const d=t.closest("label");d&&(l=(s=Array.from(d.childNodes).find(r=>r.nodeType===3))==null?void 0:s.textContent.trim())}let u=n[a]||n[i]||n[l];if(u){kt=!0;try{u.split(",").map(r=>r.trim()).filter(r=>r).forEach(r=>{if(r!==a&&r!==i&&r!==l){const m=Y(r)||Ct(r);m&&document.activeElement!==m&&it(m,e)}})}finally{kt=!1}}},Ee=Ft((t,e)=>{we(t,e)},250);function Te(){document.addEventListener("input",t=>{const e=t.target;!e||!["INPUT","TEXTAREA"].includes(e.tagName)||e.closest("#vnpt-docx-widget")||e.closest("#vnpt-inline-calc")||Ee(e,e.value)})}function D(t,e,o=null,n=""){const a=c.fieldsContainer.querySelector(".text-hint");a&&a.remove();const i=c.fieldsContainer.querySelectorAll(".f-key");let l=!1;const u=t.split(",")[0].trim();for(let s of i)if(s.value.split(",")[0].trim()===u){const r=s.closest(".vnpt-field-row"),m=r.querySelector(".f-val"),p=r.querySelector(".f-label");e!==""&&m.value!==e&&document.activeElement!==m&&(m.value=e),o!==null&&o!==""&&p.value!==o&&document.activeElement!==p&&(p.value=o),n!==""&&s.value!==t+", "+n&&document.activeElement!==s&&(s.value=t+", "+n),l=!0;break}if(!l){(o===null||o==="")&&(o=k[t]||"");const s=document.createElement("div");s.className="vnpt-field-row row-item",s.setAttribute("draggable","false");let d=t;n&&(d+=", "+n);const r=u;s.innerHTML=`
            <input type="checkbox" id="chk-${r}" name="chk-${r}" class="row-chk" title="Chọn" style="margin: 0 2px 0 2px;" />
            <input type="text" id="lbl-${r}" name="lbl-${r}" class="f-label" value="${o}" />
            <input type="text" id="key-${r}" name="key-${r}" class="f-key" value="${d}" title="Biến DOCX và IDs đồng bộ" />
            <span class="row-drag-handle" title="Kéo">=</span>
            <input type="text" id="val-${r}" name="val-${r}" class="f-val" value="${e}" />
        `;const m=s.querySelector(".f-val"),p=s.querySelector(".f-key");t==="tenToChuc"&&(m.style.textAlign="right");const g=()=>{Bt.includes(u)&&(m.value.trim()?m.classList.remove("field-required-empty"):m.classList.add("field-required-empty"))},f=()=>{const v=m.value;p.value.split(",").map(E=>E.trim()).filter(E=>E).forEach(E=>G(E,v))};p.addEventListener("input",function(){A();const v=this.value.split(",")[0].trim();m.style.textAlign=v==="tenToChuc"?"right":"",f()}),s.querySelector(".f-label").addEventListener("input",A),m.addEventListener("input",function(){A(),f(),g()}),g();const h=s.querySelector(".row-drag-handle");h.addEventListener("mouseenter",()=>s.setAttribute("draggable","true")),h.addEventListener("mouseleave",()=>{s.classList.contains("dragging")||s.setAttribute("draggable","false")}),s.addEventListener("dragstart",function(v){c.draggedRowForVNPT=this,v.dataTransfer.effectAllowed="move",v.dataTransfer.setData("text/plain",t),this.classList.add("dragging")}),s.addEventListener("dragover",v=>(v.preventDefault(),!1)),s.addEventListener("dragenter",function(){this.classList.add("over")}),s.addEventListener("dragleave",function(){this.classList.remove("over")}),s.addEventListener("drop",function(v){if(v.stopPropagation(),c.draggedRowForVNPT&&c.draggedRowForVNPT!==this){const y=Array.from(c.fieldsContainer.querySelectorAll(".vnpt-field-row")),E=y.indexOf(c.draggedRowForVNPT),S=y.indexOf(this);E<S?this.parentNode.insertBefore(c.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(c.draggedRowForVNPT,this),A()}return!1}),s.addEventListener("dragend",function(){this.setAttribute("draggable","false"),c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(v=>{v.classList.remove("over","dragging")}),c.draggedRowForVNPT=null}),c.fieldsContainer.appendChild(s),c.fieldsContainer.scrollTop=c.fieldsContainer.scrollHeight}}function A(){const t=c.isDefaultMode?V:st,e={};c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(n=>{const i=n.querySelector(".f-key").value.trim().split(",").map(r=>r.trim()).filter(r=>r),l=i[0],u=i.slice(1).join(", "),s=n.querySelector(".f-label").value.trim(),d=n.querySelector(".f-val").value;l&&(e[l]={label:s,value:d,sync:u})}),b.setDebounced(t,e,1e3)}function Rt(){try{c.fieldsContainer.innerHTML="";const e=b.get(st)||{};Object.keys(k).forEach(o=>{const n=k[o],a=e[o];a&&typeof a=="object"?D(o,a.value,a.label||n,a.sync||""):a?D(o,a,n,""):D(o,"",n,"")}),Object.keys(e).forEach(o=>{if(!(o in k)){const n=e[o];typeof n=="object"?D(o,n.value,n.label,n.sync||""):D(o,n,"","")}}),Object.keys(k).length===0&&Object.keys(e).length===0&&(c.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(e){console.error("Error loading config:",e),Object.keys(k).forEach(o=>D(o,"",k[o]))}const t=b.get(vt);t&&c.widget&&(c.widget.style.bottom="auto",t.right?(c.widget.style.right=t.right,c.widget.style.left="auto"):t.left&&(c.widget.style.left=t.left,c.widget.style.right="auto"),t.top&&(c.widget.style.top=t.top))}function Ce(){document.getElementById("vnpt-btn-toggle-id").onclick=()=>c.fieldsContainer.classList.toggle("show-ids"),document.getElementById("vnpt-btn-default").onclick=()=>{c.isDefaultMode=!c.isDefaultMode},c.on("isDefaultMode",t=>Pt(t)),document.getElementById("vnpt-btn-reset-default").onclick=()=>{confirm("Khôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?")&&(b.remove(V),b.remove(q),b.remove(tt),c.isDefaultMode&&(Pt(!0),T("🔄 Đã khôi phục dữ liệu gốc","#1a73e8")))},document.getElementById("vnpt-btn-batch-del").onclick=()=>{const t=c.fieldsContainer.querySelectorAll(".vnpt-field-row");let e=0;t.forEach(o=>{var n;(n=o.querySelector(".row-chk"))!=null&&n.checked&&(o.remove(),e++)}),e===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(t.forEach(o=>o.remove()),T("🗑️ Đã xóa toàn bộ","#ff5252"),A()):(T(`🗑️ Đã xóa ${e} trường`,"#ff5252"),A())},document.getElementById("vnpt-btn-add").onclick=()=>{const t=c.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;D("bien_moi_"+t,"","",""),A()},document.getElementById("vnpt-btn-fill-back").onclick=()=>{Kt();let t=0;c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(e=>{const o=e.querySelector(".f-key").value.trim(),n=e.querySelector(".f-val").value;o.split(",").map(a=>a.trim()).filter(Boolean).forEach(a=>{(document.getElementById(a)||document.getElementsByName(a)[0])&&(G(a,n),t++)})}),t>0?T(`✅ Đã điền ngược ${t} trường`,"#198754"):T("⚠️ Không khớp trường nào","#ffc107")}}function Pt(t){const e=document.getElementById("vnpt-btn-default"),o=document.getElementById("vnpt-btn-reset-default");if(c.fieldsContainer.innerHTML="",c.bannerArea.innerHTML="",t){e.classList.add("active"),e.innerHTML="✅ Chế độ: Dữ liệu mặc định",o&&(o.style.display="flex"),c.fieldsContainer.classList.add("vnpt-mode-default"),T("📌 Chế độ Dữ liệu mặc định (Có thể sửa)","#ea4335");const n=document.createElement("div");n.className="vnpt-default-banner",n.innerHTML='<span style="color: red;"> LƯU Ý: ĐÂY LÀ DỮ LIỆU MẶC ĐỊNH</span>',c.bannerArea.appendChild(n);const a=b.get(V);a===null?Object.keys(I).forEach(i=>{const l=I[i],u=l&&typeof l=="object"?l.value:l,s=l&&typeof l=="object"?l.label:k[i]||"";D(i,u,s)}):Object.keys(a).forEach(i=>{const l=a[i];D(i,l.value,l.label,l.sync||"")})}else e.classList.remove("active"),e.innerHTML="🛠 Dữ liệu mặc định VNPT",o&&(o.style.display="none"),c.fieldsContainer.classList.remove("vnpt-mode-default"),T("📋 Đã quay lại Dữ liệu cá nhân"),Rt()}function Vt(t){if(!t)return t;const e={};return Object.keys(t).forEach(o=>{const n=t[o];o.split(",").map(i=>i.trim()).filter(i=>i).forEach(i=>{e[i]=n})}),e}function jt(){const t={version:"1.0",timestamp:new Date().toISOString(),backup:{fields:b.get(st),defaultFields:b.get(V),dataDefault:Vt(b.get(z)),dataCustom:Vt(b.get(W)),dataSync:b.get(j),taxRate:b.get(tt),calcMap:b.get(q),templates:b.get(dt)}},e=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),o=URL.createObjectURL(e),n=document.createElement("a");n.href=o,n.download=`vnpt_full_backup_${new Date().toLocaleDateString().replace(/\//g,"-")}.json`,n.click(),URL.revokeObjectURL(o),T("✅ Đã xuất file sao lưu hệ thống.")}async function qt(t){return new Promise(e=>{const o=new FileReader;o.onload=n=>{try{const a=JSON.parse(n.target.result);if(!a.backup)throw new Error("File không đúng định dạng backup.");const i=a.backup;i.fields&&b.set(st,i.fields),i.defaultFields&&b.set(V,i.defaultFields),i.dataDefault&&b.set(z,i.dataDefault),i.dataCustom&&b.set(W,i.dataCustom),i.dataSync&&b.set(j,i.dataSync),i.taxRate&&b.set(tt,i.taxRate),i.calcMap&&b.set(q,i.calcMap),i.templates&&b.set(dt,i.templates),T("✅ Đã nhập dữ liệu thành công! Vui lòng tải lại trang hoặc widget.","#1e8e3e"),e(!0)}catch{T("❌ Lỗi: File sao lưu không hợp lệ.","#ff5252"),e(!1)}},o.readAsText(t)})}function ke(){const t=document.getElementById("vnpt-docx-widget")||document.createElement("div");t.id="vnpt-docx-widget";const e=b.get(yt)===!0;t.innerHTML=`
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
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-scan" title="Lấy data theo biểu mẫu web">Quét dữ liệu</button>
                    <button class="vnpt-btn-action btn-fill-back" id="vnpt-btn-fill-back" title="Điền dữ liệu ngược lên web">Điền web</button>
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-toggle-id" title="Ẩn hiện key">Hiện/Ẩn Mã ID</button>
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
    `,document.body.appendChild(t),c.widget=t,c.panel=document.getElementById("vnpt-export-panel"),c.toggleBtn=document.getElementById("vnpt-toggle-btn"),c.header=document.getElementById("vnpt-panel-header"),c.bannerArea=document.getElementById("vnpt-banner-area"),c.fieldsContainer=document.getElementById("vnpt-fields-list");try{const p=b.get(xt);p&&p.width&&p.height&&(c.panel.style.width=p.width+"px",c.panel.style.height=p.height+"px")}catch(p){console.error("Lỗi load size panel:",p)}new ResizeObserver(p=>{if(c.panel.style.display!=="none")for(let g of p){const{width:f,height:h}=g.contentRect;f>0&&h>0&&b.setDebounced(xt,{width:Math.round(f+20),height:Math.round(h+20)},1e3)}}).observe(c.panel),c.panelBody=document.getElementById("vnpt-panel-body"),$(document.getElementById("vnpt-template-manager"),(p,g)=>{c.templateBuffer=p,c.templateName=g}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const p=this.files&&this.files[0];if(!p)return;const g=document.getElementById("vnpt-template-manager");re(p,g,(f,h)=>{c.templateBuffer=f,c.templateName=h}),this.value=""}),c.toggleBtn.addEventListener("click",p=>{c.hasDragged||(c.panel.style.display==="none"?(c.panel.style.display="flex",c.toggleBtn.className="btn-opened",c.toggleBtn.innerHTML="✖",b.set(yt,!0)):(c.panel.style.display="none",c.toggleBtn.className="btn-closed",c.toggleBtn.innerHTML="📄",b.set(yt,!1)))});const n=document.getElementById("vnpt-btn-more"),a=document.getElementById("vnpt-util-menu"),i={S:{width:"380px",height:"420px"},M:{width:"460px",height:"600px"},L:{width:"620px",height:"800px"},Full:{width:"98vw",height:"92vh"}},l=b.get(q)||{};a.querySelectorAll("input[data-clink]").forEach(p=>{const g=p.dataset.clink,f=l[g]||zt[g]||[];p.value=f.join(", "),p.oninput=()=>{const h=b.get(q)||{};h[g]=p.value.split(",").map(v=>v.trim()).filter(v=>v),b.set(q,h)}}),document.getElementById("vnpt-btn-export-json").onclick=()=>jt();const u=document.getElementById("vnpt-txt-toggle"),s=document.getElementById("vnpt-txt-body");u&&s&&u.addEventListener("click",p=>{p.stopPropagation();const g=s.style.display==="none";s.style.display=g?"":"none",u.textContent=g?"▲":"▶"});const d=document.getElementById("vnpt-btn-import-json"),r=document.getElementById("vnpt-file-import-json");d.onclick=()=>r.click(),r.onchange=async p=>{p.target.files.length>0&&await qt(p.target.files[0])&&setTimeout(()=>location.reload(),1500)},n.addEventListener("click",p=>{p.stopPropagation();const g=a.classList.toggle("show");n.classList.toggle("active",g)}),a.addEventListener("click",p=>{p.stopPropagation()}),document.addEventListener("click",p=>{a.classList.contains("show")&&(a.classList.remove("show"),n.classList.remove("active"))}),a.querySelectorAll(".size-options button").forEach(p=>{p.addEventListener("click",g=>{const f=g.target.getAttribute("data-size"),h=i[f];h&&(c.panel.style.width=h.width,c.panel.style.height=h.height),a.classList.remove("show"),n.classList.remove("active")})}),c.panel.querySelectorAll(".vnpt-resizer").forEach(p=>{p.addEventListener("mousedown",g=>{g.preventDefault(),g.stopPropagation();const f=g.clientX,h=g.clientY,v=c.panel.offsetWidth,y=c.panel.offsetHeight,E=c.widget.getBoundingClientRect(),S=E.top;window.innerWidth-E.right,c.panel.classList.add("vnpt-resizing"),document.body.classList.add("vnpt-resizing-global");const J=window.getComputedStyle(p).cursor;document.body.style.cursor=J;const X=x=>{const C=x.clientX-f,B=x.clientY-h;if(p.classList.contains("br"))c.panel.style.width=Math.max(360,v+C)+"px",c.panel.style.height=Math.max(250,y+B)+"px";else if(p.classList.contains("bl")){const w=v-C;w>360&&(c.panel.style.width=w+"px"),c.panel.style.height=Math.max(250,y+B)+"px"}else if(p.classList.contains("tr")){c.panel.style.width=Math.max(360,v+C)+"px";const w=y-B;w>250&&(c.panel.style.height=w+"px",c.widget.style.top=S+B+"px")}else if(p.classList.contains("tl")){const w=v-C,N=y-B;w>360&&(c.panel.style.width=w+"px"),N>250&&(c.panel.style.height=N+"px",c.widget.style.top=S+B+"px")}},L=()=>{window.removeEventListener("mousemove",X),window.removeEventListener("mouseup",L),c.panel.classList.remove("vnpt-resizing"),document.body.classList.remove("vnpt-resizing-global"),document.body.style.cursor="";const x=c.widget.id==="vnpt-docx-widget";b.setDebounced(vt,{right:x?c.widget.style.right:void 0,top:c.widget.style.top,x:x?void 0:parseFloat(c.widget.style.left),y:parseFloat(c.widget.style.top)},500),b.setDebounced(xt,{width:c.panel.offsetWidth,height:c.panel.offsetHeight},500)};window.addEventListener("mousemove",X),window.addEventListener("mouseup",L)})})}function Ut(t,e,o,n=null,a=null){let i=!1,l=0,u=0,s=0,d=0,r=!1;const m=5;function p(f){r!==f&&(r=f,a&&a(f))}function g(f){if(f.button!==0||["INPUT","BUTTON","SELECT","TEXTAREA"].includes(f.target.tagName)||f.target.isContentEditable)return;i=!0,c.hasDragged=!1,s=f.clientX,d=f.clientY;const v=t.getBoundingClientRect();l=f.clientX-v.left,u=f.clientY-v.top,document.body.style.userSelect="none",e&&e.forEach(y=>y.style.cursor="grabbing"),n&&n(),f.preventDefault()}return e.forEach(f=>{f.addEventListener("mousedown",g)}),document.addEventListener("mousemove",function(f){if(!i)return;if(!c.hasDragged)if(Math.sqrt(Math.pow(f.clientX-s,2)+Math.pow(f.clientY-d,2))>m)c.hasDragged=!0;else return;let h=f.clientX-l,v=f.clientY-u;const y=window.innerWidth,E=window.innerHeight,S=document.getElementById("vnpt-toggle-btn"),J=S?S.offsetWidth:40,X=S?S.offsetHeight:40,L=t.id==="vnpt-docx-widget";let x=t.offsetWidth||0;if(L){let w=J+6-x,N=y-x+6;h<w&&(h=w),h>N&&(h=N)}else x=x||200,h<0&&(h=0),h+x>y&&(h=Math.max(0,y-x));let C=r;if(L?C=!1:r?f.clientY<E-40&&(C=!1):f.clientY>E-10&&(C=!0),v<0&&(v=0),C)p(!0),t.style.top=E-t.offsetHeight+"px",L?(t.style.right=y-h-x+"px",t.style.left="auto"):(t.style.left=h+"px",t.style.right="auto"),t.style.bottom="auto";else{p(!1);let B=t.offsetHeight||40,w;if(L)w=10+X;else{const N=t.querySelector(".cw-title-bar");w=N?N.offsetHeight:B}v+w>E&&(v=Math.max(0,E-w)),t.style.top=v+"px",L?(t.style.right=y-h-x+"px",t.style.left="auto"):(t.style.left=h+"px",t.style.right="auto"),t.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(i){if(i=!1,document.body.style.userSelect="",e&&e.forEach(f=>f.style.cursor="grab"),o){const f=t.id==="vnpt-docx-widget";b.set(o,{left:f?void 0:t.style.left,right:f?t.style.right:void 0,top:t.style.top,x:f?void 0:parseFloat(t.style.left),y:parseFloat(t.style.top),docked:r})}setTimeout(()=>{c.hasDragged=!1},100)}}),{isDocked:()=>r,setDocked:p}}function Se(){c.widget&&c.header&&(Ut(c.widget,[c.header],vt),window.addEventListener("resize",()=>{const t=window.innerWidth,e=window.innerHeight,o=document.getElementById("vnpt-toggle-btn"),n=o?o.offsetWidth:40,a=o?o.offsetHeight:40;let i=c.widget.getBoundingClientRect(),l=i.left,u=i.top,s=c.widget.offsetWidth||0,r=n+6-s,m=t-s+6;l<r&&(l=r),l>m&&(l=m),u+10+a>e&&(u=Math.max(0,e-(10+a))),c.widget.style.right=t-l-s+"px",c.widget.style.top=u+"px"}))}function $t(t){const e=t.toLowerCase(),{ngay:o,thang:n,nam:a}=At(),i=`${o}/${n}/${a}`;return{"ngayky, ngayky1":o,ngayky:o,"thangky, thangky1":n,thangky:n,"namky, namky1":a,namky:a,"ngaytiepnhan, ngaythangnamky":i,ngaytiepnhan:i,ngaythangnamky:i,soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[e]||""}function Ne(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){if(c.isDefaultMode){Object.keys(I).forEach(e=>{D(e,I[e],k[e]||"")}),A(),T("Đã nạp lại dữ liệu mặc định từ hệ thống.");return}let t=0;Object.keys(k).forEach(e=>{var l;const o=k[e],n=e.split(",")[0].trim(),a=Y(n,o);let i="";a&&(i=a.tagName.toLowerCase()==="select"?((l=a.options[a.selectedIndex])==null?void 0:l.text)||"":a.value,t++),i||(i=$t(e)),i&&typeof i=="string"&&(["tenDaiDienn","tenToChuc","noiCap","noiKy"].includes(n)?i=pe(i):["sdt"].includes(n)?i=ue(i):["ngaySinhCustomer","ngayCapCustomer","ngayCapSoDkdnCustomer","ngayKy","ngayTiepNhan"].includes(n)&&(i=fe(i))),D(e,i,null)}),A(),t>0?(this.style.background="#1e8e3e",this.style.color="#fff",this.innerText="Đã quét xong",setTimeout(()=>{this.style.background="",this.style.color="",this.innerText="Quét dữ liệu"},1e3)):T("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(t){if(!(t.target.closest("#vnpt-docx-widget")||t.target.closest("#vnpt-inline-calc"))&&t.target&&t.target.id){const e=Object.keys(k).find(o=>o.split(",").map(n=>n.trim()).includes(t.target.id));e!==void 0&&(D(e,t.target.value,null),A())}}),document.addEventListener("change",function(t){var e;if(!(t.target.closest("#vnpt-docx-widget")||t.target.closest("#vnpt-inline-calc"))&&t.target&&t.target.id){const o=Object.keys(k).find(n=>n.split(",").map(a=>a.trim()).includes(t.target.id));if(o!==void 0){let n=t.target.tagName.toLowerCase()==="select"?((e=t.target.options[t.target.selectedIndex])==null?void 0:e.text)||"":t.target.value;D(o,n,null),A()}}})}const Le={local:{download(t,e="arraybuffer"){return new Promise((o,n)=>{const a=new FileReader;switch(a.onload=i=>{let l=i.target.result;e==="base64"&&typeof l=="string"&&(l=l.split(",")[1]||l),o(l)},a.onerror=i=>n(i),e.toLowerCase()){case"arraybuffer":a.readAsArrayBuffer(t);break;case"base64":case"dataurl":a.readAsDataURL(t);break;case"text":a.readAsText(t);break;default:n(new Error(`Unsupported read type: ${e}`))}})},async upload(t){return this.download(t,"base64")}}},De={getAdapter(t){const e=Le[t];if(!e)throw new Error(`Storage adapter not found: ${t}`);return e},async upload(t,e,o={}){return await this.getAdapter(t).upload(e,o)},async download(t,e,o={}){return await this.getAdapter(t).download(e,o.type||"arraybuffer")}};function Gt(t,e,o){try{let n;try{n=new window.PizZip(t)}catch(s){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(s);return}const a=new window.docxtemplater(n,{paragraphLoop:!0,linebreaks:!0});a.render(e);const i=a.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),l=URL.createObjectURL(i),u=document.createElement("a");u.href=l,u.download=o,document.body.appendChild(u),u.click(),setTimeout(()=>{document.body.removeChild(u),URL.revokeObjectURL(l)},100)}catch(n){let a=n.message;n.properties&&n.properties.errors instanceof Array?a=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+n.properties.errors.map(l=>"- "+(l.properties.explanation||l.message)).join(`
`):a="Lỗi phần mềm Word sinh ra: "+a,alert(a),console.error("DocX Error:",n)}}function Be(t,e){const o=t.replace(/@(\w+)/g,(n,a)=>e[a]!==void 0?e[a]:n);navigator.clipboard.writeText(o).then(()=>{alert("✅ Đã sao chép nội dung vào Clipboard!")}).catch(n=>{console.error("Lỗi khi copy:",n),alert("❌ Lỗi khi sao chép vào Clipboard. Vui lòng thử lại!")})}function Ie(){const t=document.getElementById("vnpt-export-filename");t&&t.addEventListener("input",()=>{t.dataset.userEdited="1",t.value.trim()||(t.dataset.userEdited="0")});function e(){if(!t||t.dataset.userEdited==="1")return;let a="";if(c.fieldsContainer&&c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(r=>{const p=r.querySelector(".f-key").value.trim().split(",")[0].trim(),g=r.querySelector(".f-val").value.trim();p==="tenToChuc"&&(a=g)}),!a){const d=document.getElementById("tenToChuc");d&&(a=d.tagName.toLowerCase()==="textarea"||d.tagName.toLowerCase()==="input"?d.value.trim():d.innerText.trim())}function i(d){if(!d)return"";let r=d;return r=r.replace(/Tổng công ty/gi,""),r=r.replace(/Công ty/gi,""),r=r.replace(/\bCty\b/gi,""),r=r.replace(/Trách nhiệm hữu hạn/gi,""),r=r.replace(/\bTNHH\b/gi,""),r=r.replace(/Cổ phần/gi,""),r=r.replace(/\bCP\b/gi,""),r=r.replace(/Một thành viên/gi,""),r=r.replace(/\bMTV\b/gi,""),r=r.replace(/Chi nhánh/gi,""),r=r.replace(/Việt Nam/gi,"VN"),r=r.replace(/Viet Nam/gi,"VN"),r=r.replace(/\s+/g," ").trim(),r=r.replace(/^[-,\s]+|[-,\s]+$/g,""),r.length>50&&(r=r.substring(0,47)+"..."),r.replace(/[<>:"/\\|?*]/g,"")}let l=i(a),u=c.templateName?c.templateName.replace(/\.docx$/i,""):"",s=[];u&&s.push(u),l&&s.push(l),s.length>0?t.value=s.join(" - ")+".docx":t.value||(t.value="Export_Auto.docx")}setInterval(e,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const a={};if(c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(d=>{const m=d.querySelector(".f-key").value.trim().split(",")[0].trim(),p=d.querySelector(".f-val").value;m&&(a[m]=p)}),Object.keys(a).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}const l=[];if(Bt.forEach(d=>{if(!a[d]||!a[d].trim()){const r=k[d]||d;l.push(r)}}),l.length>0){const d=`Cảnh báo: Bạn còn các trường sau chưa điền dữ liệu:

- ${l.join(`
- `)}

Bạn có chắc chắn muốn tiếp tục xuất file không?`;if(!confirm(d))return}let u=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(u.toLowerCase().endsWith(".docx")||(u+=".docx"),c.templateBuffer){Gt(c.templateBuffer,a,u);return}const s=document.getElementById("vnpt-template-file");if(s.files&&s.files.length>0){De.download("local",s.files[0],{type:"arraybuffer"}).then(d=>Gt(d,a,u)).catch(d=>alert(`Lỗi đọc file: ${d.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')});const o=document.getElementById("vnpt-btn-export-txt"),n=document.getElementById("vnpt-txt-template");if(n){const a=b.get(It);a&&(n.value=a),n.addEventListener("input",()=>{b.setDebounced(It,n.value,800)})}o&&o.addEventListener("click",()=>{const a=n?n.value:"";if(!a.trim()){alert(`Bạn chưa nhập nội dung Text Template!

Sử dụng @key làm placeholder, ví dụ: Tôi là @tenDaiDienn`);return}const i={};if(c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(u=>{const d=u.querySelector(".f-key").value.trim().split(",")[0].trim(),r=u.querySelector(".f-val").value;d&&(i[d]=r)}),Object.keys(i).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}Be(a,i)})}const Ae=["chucVu","noiCap","noiCapSoDkdn","ngayky","ngayky1","thangky","namky","thangky1","namky1","noiKy"],Me=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function _e(){function t(){Ae.forEach(n=>{const a=document.getElementById(n);a&&!a.dataset.filled&&(a.dataset.filled="1",it(a,$t(n)))}),Me.forEach(n=>{const a=document.getElementById(n.src),i=document.getElementById(n.target);a&&i&&!a.dataset.bound&&(a.dataset.bound="1",a.addEventListener("input",()=>it(i,a.value)))})}let e;new MutationObserver(()=>{clearTimeout(e),e=setTimeout(t,200)}).observe(document.body,{childList:!0,subtree:!0}),t()}function Q(t,e=null){return b.get(t,e)}function ft(t,e){b.set(t,e)}function Xt(t,e){if(!e||e.replace(/\D/g,"").length<6)return;let o=Q(t,[]);o=o.filter(n=>n!==e),o.unshift(e),ft(t,o.slice(0,10))}function gt(t,e){const o=document.getElementById(e);o&&(o.innerHTML=Q(t,[]).map(n=>`<option value="${n}">`).join(""))}function St(t){return t.toLocaleString("en-US")}function Nt(t){return Number(String(t).replace(/[^\d]/g,""))||0}function He(t){return t.charAt(0).toUpperCase()+t.slice(1)}const rt=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function Oe(t){let e=Math.floor(t/100),o=Math.floor(t%100/10),n=t%10,a="";return e>0&&(a+=rt[e]+" trăm ",o===0&&n>0&&(a+="lẻ ")),o>1?(a+=rt[o]+" mươi ",n===1?a+="mốt":n===5?a+="lăm":n>0&&(a+=rt[n])):o===1?(a+="mười ",n===5?a+="lăm":n>0&&(a+=rt[n])):n>0&&(e>0&&(a+="lẻ "),a+=rt[n]),a.trim()}function ze(t){if(t===0)return"không";const e=["","nghìn","triệu","tỷ"];let o="",n=0;for(;t>0;){const a=t%1e3;a>0&&(o=Oe(a)+" "+e[n]+" "+o),t=Math.floor(t/1e3),n++}return o.trim()}function Wt(t,e,o){let n=0,a=0,i=0;t==="before"?(n=Nt(e),a=Math.round(n*o),i=n+a):t==="tax"?(a=Nt(e),n=Math.round(a/o),i=n+a):t==="after"&&(i=Nt(e),n=Math.round(i/(1+o)),a=i-n);const l=He(ze(i))+" đồng";return{beforeNum:n,taxNum:a,afterNum:i,beforeStr:St(n),taxStr:St(a),afterStr:St(i),textStr:l}}function Fe(t,e){e.before&&e.before.forEach(o=>G(o,t.beforeStr)),e.tax&&e.tax.forEach(o=>G(o,t.taxStr)),e.after&&e.after.forEach(o=>G(o,t.afterStr)),e.text&&e.text.forEach(o=>G(o,t.textStr))}function ht(t,e=null){try{const o=localStorage.getItem(t);return o!==null?JSON.parse(o):e}catch{return e}}function H(t,e){localStorage.setItem(t,JSON.stringify(e))}function Ke(t,e,o,n){let a=ht(et)??"custom",i=ht(z)??{...I},l=ht(W)??{},u=ht(j)??{};const s=document.createElement("div");s.className="cw-tab-header";const d={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};d.custom.innerText="📋 Custom",d.custom.className="cw-tab cw-tab-custom",d.default.innerText="📌 Default",d.default.className="cw-tab cw-tab-default",d.sync.innerText="🔗 Sync",d.sync.className="cw-tab cw-tab-sync";function r(){Object.values(d).forEach(x=>x.classList.remove("active")),d[a].classList.add("active")}r();const m=document.createElement("div");m.style.display=n.data?"none":"block";const p=e("📋 Cấu hình Data","data",x=>{m.style.display=x?"none":"block",o(t)}),g=document.createElement("div");g.className="cw-data-body";function f(){g.innerHTML="";let x=a==="sync"?u:a==="custom"?l:i,C=a==="sync"?j:a==="custom"?W:z;const B=Object.keys(x);B.length===0&&a!=="default"&&(g.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),B.forEach(w=>{const N=document.createElement("div");N.className="cw-data-row";let mt=a!=="default";const R=x[w],bt=R&&typeof R=="object"&&R.hasOwnProperty("value"),Yt=bt?R.value:R,Dt=bt&&R.label||w,M=document.createElement("input");M.type="text",M.value=Dt,M.id=`df-key-${w}`,M.name=`df-key-${w}`,M.className="cw-data-key"+(mt?" mutable":""),M.title=w,M.readOnly=!mt,mt&&(M.onchange=()=>{const _=M.value.trim();if(!_||_===w){M.value=Dt;return}bt?x[_]={...R,label:_}:x[_]=Yt,delete x[w],H(C,x),f()});const O=document.createElement("input");if(O.type="text",O.value=Yt??"",O.id=`df-val-${w}`,O.name=`df-val-${w}`,O.className="cw-data-val",O.oninput=()=>{bt?x[w]={...R,value:O.value}:x[w]=O.value,H(C,x)},N.appendChild(M),N.appendChild(O),mt){const _=document.createElement("button");_.innerHTML="✕",_.className="cw-del-btn",_.onclick=()=>{confirm(`Delete "${Dt}"?`)&&(delete x[w],H(C,x),f())},N.appendChild(_)}else N.appendChild(document.createElement("div")).className="cw-pad";g.appendChild(N)})}d.custom.onclick=()=>{a="custom",H(et,"custom"),r(),f()},d.default.onclick=()=>{a="default",H(et,"default"),r(),f()},d.sync.onclick=()=>{a="sync",H(et,"sync"),r(),f()};const h=document.createElement("button");h.innerText="📤",h.className="cw-icon-btn",h.title="Sao lưu toàn bộ dữ liệu ra JSON",h.onclick=()=>jt();const v=document.createElement("button");v.innerText="📥",v.className="cw-icon-btn",v.title="Khôi phục dữ liệu từ JSON";const y=document.createElement("input");y.type="file",y.accept=".json",y.style.display="none",y.onchange=async x=>{x.target.files.length>0&&await qt(x.target.files[0])&&setTimeout(()=>location.reload(),1500)},v.onclick=()=>y.click(),m.appendChild(s),s.appendChild(d.custom),s.appendChild(d.default),s.appendChild(d.sync),m.appendChild(g),t.appendChild(p),t.appendChild(m);const E=t.querySelector("#vnpt-cw-fill"),S=t.querySelector("#vnpt-cw-sync"),J=t.querySelector("#vnpt-cw-add"),X=t.querySelector("#vnpt-cw-reset");E&&(E.onclick=Kt),S&&(S.onclick=ye),J&&(J.onclick=()=>{a==="default"&&(a="custom",H(et,"custom"),r());let x=a==="sync"?u:l,C="new_field_"+Date.now();x[C]="",H(a==="sync"?j:W,x),f(),g.scrollTop=g.scrollHeight}),X&&(X.onclick=()=>{confirm("Reset Default Data?")&&(i={...I},H(z,i),f())}),f();const L=p.querySelector(".cw-right-wrap")||document.createElement("div");L.className="cw-right-wrap",L.prepend(h),L.prepend(v),L.appendChild(y),p.appendChild(L)}function Re(t,e,o){let n=Number(localStorage.getItem(tt))||xe,a=Q(ct)??{calc:!1,data:!0};function i(p,g){const f=document.createElement("button");return f.innerText=p,f.className="cw-action-btn "+g,f}function l(p,g,f){const h=document.createElement("div");h.className="wg-sec-header";const v=document.createElement("span");v.innerText=p;const y=document.createElement("button");return y.className="wg-toggle-btn",y.innerText=a[g]?"▾":"▴",h.appendChild(v),h.appendChild(y),y.onclick=()=>{a[g]=!a[g],y.innerText=a[g]?"▾":"▴",ft(ct,a),f(a[g])},h}function u(p){const g=window.innerWidth,f=window.innerHeight,h=p.getBoundingClientRect();p.style.left=Math.min(Math.max(parseFloat(p.style.left),0),g-h.width)+"px",p.style.top=Math.min(Math.max(parseFloat(p.style.top),0),f-36)+"px"}const s=document.createElement("div");if(!e){s.className="cw-title-bar",s.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const p=document.createElement("div");p.className="cw-btn-group";const g={fill:i("Fill","cw-btn-fill"),sync:i("Sync","cw-btn-sync"),add:i("Add","cw-btn-add"),reset:i("↺","cw-btn-reset")};g.reset.title="Reset Default fields",Object.values(g).forEach(f=>p.appendChild(f)),s.appendChild(p),t.appendChild(s)}const d=document.createElement("div");d.className="cw-body-inline",d.innerHTML=`
    <div class="cw-inline-row">
        <input id="wg-before" name="wg-before" class="cw-input-inline" placeholder="Trước thuế" list="wg-before-list" title="Trước thuế">
        <datalist id="wg-before-list"></datalist>
        <div class="cw-tax-group-inline"><input id="wg-taxRate" name="wg-taxRate" class="cw-tax-input-inline" title="Thuế (%)"><span class="cw-tax-symbol">%</span></div>
        <input id="wg-tax" name="wg-tax" class="cw-input-inline" placeholder="Tiền thuế" title="Tiền thuế">
        <input id="wg-after" name="wg-after" class="cw-input-inline" placeholder="Sau thuế" list="wg-after-list" title="Sau thuế">
        <datalist id="wg-after-list"></datalist>
        <input id="wg-text" name="wg-text" class="cw-input-inline cw-input-readonly-inline" placeholder="Bằng chữ" readonly title="Bằng chữ">
    </div>`,e?e.appendChild(d):t.appendChild(d),e||Ke(t,l,u,a);const r={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text")};r.taxRate.value=n*100,gt(wt,"wg-before-list"),gt(Et,"wg-after-list");function m(p,g){const f=Wt(p,g,n);r.before.value=f.beforeStr,r.tax.value=f.taxStr,r.after.value=f.afterStr,r.text.value=f.textStr;const h=Q(q)||{...zt};Fe(f,h)}if(r.taxRate.oninput=()=>{n=Number(r.taxRate.value)/100||0,ft(tt,n),m("before",r.before.value)},r.before.oninput=()=>{const p=Wt("before",r.before.value,n);r.tax.value=p.taxStr,r.after.value=p.afterStr,r.text.value=p.textStr},r.before.onchange=()=>{m("before",r.before.value),Xt(wt,r.before.value),gt(wt,"wg-before-list")},r.tax.oninput=()=>m("tax",r.tax.value),r.after.oninput=()=>m("after",r.after.value),r.after.onchange=()=>{m("after",r.after.value),Xt(Et,r.after.value),gt(Et,"wg-after-list")},[r.before,r.tax,r.after,r.text].forEach(p=>{["click","focus"].forEach(g=>p.addEventListener(g,()=>{if(!p.value)return;navigator.clipboard.writeText(p.value);const f=p.style.backgroundColor;p.style.backgroundColor="#d1e7dd",setTimeout(()=>p.style.backgroundColor=f,300)}))}),!e){const p=Array.from(t.children).filter(h=>h!==s),g=Ut(t,[s],o,null,h=>{p.forEach(v=>v.style.display=h?"none":""),s.style.borderRadius=h?"8px":"0",h&&(t.style.top=window.innerHeight-(s.offsetHeight||34)+"px")}),f=Q(o);return f&&f.docked&&g.setDocked(!0),window.addEventListener("resize",()=>{g.isDocked()?t.style.top=window.innerHeight-s.offsetHeight+"px":u(t)}),g}return null}function Pe(){const t=document.getElementById("vnpt-inline-calc"),e=document.getElementById("vnpt-btn-calc-toggle");let o=c.calcWidget||document.createElement("div");if(!t&&!c.calcWidget?(o.id="vnpt-calc-widget",document.body.appendChild(o),c.calcWidget=o):t&&(o=c.widget),t&&e){let n=Q(ct)??{calc:!1,data:!0};const a=i=>{t.style.display=i?"none":"block",e.classList.toggle("active",!i)};a(n.calc),e.onclick=()=>{n.calc=!n.calc,ft(ct,n),a(n.calc)}}return Re(o,t,Zt)}function Ve(){window.addEventListener("keydown",t=>{var e,o,n,a;if(t.altKey&&!t.ctrlKey&&!t.shiftKey){const i=t.key.toLowerCase();let l=!0;switch(i){case"s":(e=document.getElementById("vnpt-btn-scan"))==null||e.click();break;case"e":(o=document.getElementById("vnpt-btn-export"))==null||o.click();break;case"w":(n=document.getElementById("vnpt-toggle-btn"))==null||n.click();break;case"f":(a=document.getElementById("vnpt-btn-fill-back"))==null||a.click();break;default:l=!1;break}l&&t.preventDefault()}})}function je(){let t=!1;try{t=!1}catch{t=!1}t&&P.info("[Migration] Dev mode active - Syncing configurations...");let e=b.get(z);if(e){let n=!1;Object.keys(I).forEach(a=>{const i=I[a];if(!(a in e))e[a]=i,n=!0;else if(t){const l=e[a],u=i&&typeof i=="object",s=l&&typeof l=="object";let d=!1;!u&&!s?d=l!==i:u&&s?d=l.value!==i.value||l.label!==i.label:d=!0,d&&(e[a]=i,n=!0)}}),n&&b.set(z,e)}let o=b.get(V);if(o){let n=!1;Object.keys(I).forEach(a=>{const i=I[a],l=i&&typeof i=="object"?i.value:i,u=i&&typeof i=="object"?i.label:k[a]||"";if(!(a in o))o[a]={label:u,value:l,sync:""},n=!0;else if(t){const s=o[a];(s.value!==l||s.label!==u)&&(o[a]={label:u,value:l,sync:s.sync||""},n=!0)}}),n&&b.setDebounced(V,o,0)}}let lt=null;function Lt(){if(!window.__vnptInited){window.__vnptInited=!0,P.info("Initializing VNPT Userscript..."),je();try{Qt(),ke(),Pe(),Se(),Ce(),Rt(),Ne(),Ie(),_e(),Te(),Ve();const t=Ft(()=>{ge(),P.debug("DOM Cache cleared due to mutations")},500);lt=new MutationObserver(e=>{e.some(o=>o.addedNodes.length>0||o.removedNodes.length>0)&&t()}),lt.observe(document.body,{childList:!0,subtree:!0}),P.info("Userscript initialized successfully.")}catch(t){P.error("Error during userscript initialization:",t)}}}function qe(){P.info("Cleaning up VNPT Userscript for reload..."),lt&&(lt.disconnect(),lt=null);const t=document.getElementById("vnpt-docx-widget");t&&t.remove();const e=document.getElementById("vnpt-calc-widget");e&&e.remove();const o=document.getElementById("vnpt-styles");o&&o.remove(),window.__vnptInited=!1,P.info("Cleanup completed.")}window.__vnptCleanup=qe,window.__vnptInit=Lt,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Lt):Lt()})();
