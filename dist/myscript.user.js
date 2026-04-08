// ==UserScript==
// @name         VNPT Word Automation (Vite)
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Tool tự động lấy dữ liệu trên portal VNPT, bọc qua Vite
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
(function(){"use strict";const $={info:(...t)=>console.log("[Tampermonkey Script] INFO:",...t),error:(...t)=>console.error("[Tampermonkey Script] ERROR:",...t),warn:(...t)=>console.warn("[Tampermonkey Script] WARN:",...t)};function ie(){const t="vnpt-styles";if(document.getElementById(t))return;const n=document.createElement("style");n.id=t,n.textContent=`
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

    `,document.head.appendChild(n)}const re={widget:null,panel:null,header:null,bannerArea:null,toggleBtn:null,fieldsContainer:null,panelBody:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1,templateBuffer:null,templateName:null,hasDragged:!1},nt=new Map,d=new Proxy(re,{get(t,n){return n==="on"?(a,e)=>{nt.has(a)||nt.set(a,[]),nt.get(a).push(e)}:t[n]},set(t,n,a){const e=t[n];return t[n]=a,e!==a&&nt.has(n)&&nt.get(n).forEach(o=>o(a,e)),!0}}),C={"tenDaiDienn, tenNguoiNhanCTS ":"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT","emailDaiDien, emailNhanCTS":"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Mã số thuế | GPKD",goiDV:"Gói Dịch Vụ","ngayKy, ngayKy1":"Ngày ký","thangKy, thangKy1":"Tháng Ký","namKy, namKy1":"Năm ký","ngayTiepNhan, ngayThangNamKy":"Ngày tiếp nhận / Ngày tháng năm ký","soHopDong, inputContractGroupName, contractNumber, contractName":"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký","lienheHopDongA, lienheTuVanA, lienheHoaDonA, sucoCap1A, sucoCap2A, sucoCap3A, sucoCap4A":"Liên hệ A"},ut=["soHopDong","tenDaiDienn","cmnd","sdt","diaChi","tenToChuc","ngayCapCustomer","emailDaiDien","soDkdn","goiDV","soHopDong"],ot="vnpt_docx_fields",K="vnpt_docx_default_fields",ft="vnpt_docx_position",gt="vnpt_docx_size",ht="vnpt_docx_opened",P="vnpt_autofill_data_default",j="vnpt_autofill_data_custom",R="vnpt_autofill_data_sync",Mt="vnpt_widget_pos",Q="vnd_tax_rate",mt="vnd_before_history",bt="vnd_after_history",at="vnpt_widget_collapsed",q="vnd_calc_map",Z="vnpt_widget_datatab",it="vnpt_templates",Et="vnpt_txt_template",_t="vnpt_gemini_api_key",Ht="vnpt_gemini_model",le=Object.freeze(Object.defineProperty({__proto__:null,DEFAULT_LABELS:C,LOCAL_KEY_DEFAULT_FIELDS:K,LOCAL_KEY_FIELDS:ot,LOCAL_KEY_OPENED:ht,LOCAL_KEY_POS:ft,LOCAL_KEY_SIZE:gt,REQUIRED_KEYS:ut,SK_CALC_MAP:q,SK_COLLAPSE:at,SK_DATATAB:Z,SK_DATA_CUS:j,SK_DATA_DEF:P,SK_DATA_SYNC:R,SK_GEMINI_KEY:_t,SK_GEMINI_MODEL:Ht,SK_HIST_A:bt,SK_HIST_B:mt,SK_POS_CALC:Mt,SK_TAX:Q,SK_TEMPLATES:it,SK_TXT_TEMPLATE:Et},Symbol.toStringTag,{value:"Module"}));let V=null;function T(t,n="#198754",a=2500){V||(V=document.createElement("div"),V.id="vnpt-toast-container",Object.assign(V.style,{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column-reverse",alignItems:"center",gap:"8px",zIndex:"1000000",pointerEvents:"none"}),document.body.appendChild(V));const e=document.createElement("div");e.innerText=t,Object.assign(e.style,{background:n,color:"#fff",padding:"8px 18px",borderRadius:"24px",opacity:"0",transform:"translateY(10px)",transition:"opacity 0.3s, transform 0.3s",fontSize:"13px",fontWeight:"500",fontFamily:"'Segoe UI', Roboto, sans-serif",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",whiteSpace:"nowrap",pointerEvents:"auto"}),V.appendChild(e),requestAnimationFrame(()=>{e.style.opacity="1",e.style.transform="translateY(0)"}),setTimeout(()=>{e.style.opacity="0",e.style.transform="translateY(-10px)",setTimeout(()=>{e.remove(),V&&V.childNodes.length},300)},a)}const se="vnpt_templates_db",G="buffers";let vt=null;function Ct(){return vt?Promise.resolve(vt):new Promise((t,n)=>{const a=indexedDB.open(se,1);a.onupgradeneeded=e=>{const o=e.target.result;o.objectStoreNames.contains(G)||o.createObjectStore(G)},a.onsuccess=e=>{vt=e.target.result,t(vt)},a.onerror=()=>n(a.error)})}async function ce(t,n){const a=await Ct();return new Promise((e,o)=>{const u=a.transaction(G,"readwrite").objectStore(G).put(n,t);u.onsuccess=()=>e(),u.onerror=()=>o(u.error)})}async function de(t){const n=await Ct();return new Promise((a,e)=>{const s=n.transaction(G,"readonly").objectStore(G).get(t);s.onsuccess=()=>a(s.result),s.onerror=()=>e(s.error)})}async function pe(t){const n=await Ct();return new Promise((a,e)=>{const s=n.transaction(G,"readwrite").objectStore(G).delete(t);s.onsuccess=()=>a(),s.onerror=()=>e(s.error)})}const U=new Map,xt=new Map,m={isGM:typeof GM_setValue<"u"&&typeof GM_getValue<"u",get(t,n=null){if(U.has(t))return U.get(t);try{let a;if(this.isGM?a=GM_getValue(t,null):a=localStorage.getItem(t),a==null)return n;const e=typeof a=="string"?JSON.parse(a):a;return U.set(t,e),e}catch(a){return console.warn(`[Storage] Không thể đọc key "${t}":`,a),n}},set(t,n){U.set(t,n);try{return this.isGM?GM_setValue(t,n):localStorage.setItem(t,JSON.stringify(n)),!0}catch(a){return console.error(`[Storage] Không thể ghi key "${t}":`,a),!1}},setDebounced(t,n,a=500){U.set(t,n),xt.has(t)&&clearTimeout(xt.get(t));const e=setTimeout(()=>{this.set(t,n),xt.delete(t)},a);xt.set(t,e)},remove(t){U.delete(t);try{this.isGM?GM_deleteValue(t):localStorage.removeItem(t)}catch(n){console.error(`[Storage] Không thể xóa key "${t}":`,n)}},clearCache(){U.clear()}};function rt(){try{const t=m.get(it)||[],n=t.filter(a=>a.type!=="local");return n.length!==t.length&&lt(n),n}catch{return[]}}function lt(t){m.set(it,t)}function ue(t){const n=t.match(/drive\.google\.com\/file\/d\/([^/]+)/);return n?`https://drive.google.com/uc?export=download&id=${n[1]}`:t}function fe(t){return new Promise((n,a)=>{GM_xmlhttpRequest({method:"GET",url:ue(t),responseType:"arraybuffer",onload:e=>{if(e.status>=200&&e.status<300){if(e.response&&e.response.byteLength>4){const o=new Uint8Array(e.response.slice(0,4));if(o[0]===80&&o[1]===75&&o[2]===3&&o[3]===4){n(e.response);return}else{a(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}n(e.response)}else a(new Error(`HTTP ${e.status}: Không lấy được file`))},onerror:()=>a(new Error("Không thể tải URL.")),ontimeout:()=>a(new Error("Timeout khi tải URL."))})})}async function ge(t,n,a){const e=t.name.replace(/\.docx$/i,""),o=prompt("Đặt tên biến nhớ cho file này:",e);if(!(!o||!o.trim()))try{const i=await t.arrayBuffer();await ce(o.trim(),i);const u=rt().filter(l=>l.name!==o.trim()&&l.fileName!==t.name);u.unshift({name:o.trim(),type:"local_idb",fileName:t.name,lastUsed:Date.now()}),lt(u),X(n,a),a&&a(i,o.trim())}catch(i){T(`❌ Lỗi lưu file: ${i.message}`,"#dc3545")}}function X(t,n,a=null){let e=t.querySelector(".vnpt-template-manager-inner"),o,i;if(e)o=e.querySelector(".vnpt-local-list-container"),i=e.querySelector(".vnpt-btn-wrap");else{t.innerHTML="",e=document.createElement("div"),e.className="vnpt-template-manager-inner";const l=document.createElement("div");l.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const p=document.createElement("span");p.className="vnpt-title-main",p.style.cssText="font-size:11px;font-weight:700;color:#444;",i=document.createElement("div"),i.className="vnpt-btn-wrap",i.style.cssText="display:flex;gap:4px;",l.appendChild(p),l.appendChild(i),e.appendChild(l),o=document.createElement("div"),o.className="vnpt-local-list-container",o.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",e.appendChild(o),t.appendChild(e)}const s=rt(),u=e.querySelector(".vnpt-title-main");u.innerHTML="Templates"+(a?` <span style="color:#2e7d32;">(Đang dùng: ${a})</span>`:""),s.length===0?o.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':o.innerHTML="",s.forEach((l,p)=>{const r=document.createElement("div");r.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",r.title=l.fileName||l.url||l.name,r.tabIndex=0,r.onfocus=()=>r.style.boxShadow="0 0 0 2px #28a745",r.onblur=()=>r.style.boxShadow="none";const g=l.type==="local"||l.type==="local_base64"||l.type==="local_idb"?"OFF":"ON",h=g==="OFF"?"#6c757d":"#28a745",v=document.createElement("span");v.textContent=g,v.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${h};color:#fff;`;const c=document.createElement("span");c.textContent=l.name,c.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",r.onclick=()=>{r.focus(),he(l,n,a,t)},r.appendChild(v),r.appendChild(c);const f=document.createElement("button");f.innerHTML="✎",f.title="Đổi tên template",f.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",f.onclick=x=>{x.stopPropagation();const y=prompt("Đổi tên template:",l.name);if(y&&y.trim()&&y.trim()!==l.name){const S=rt();S[p].name=y.trim(),lt(S),X(t,n,a)}},r.appendChild(f);const b=document.createElement("button");b.innerHTML="✕",b.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",b.onclick=async x=>{if(x.stopPropagation(),confirm(`Xoá biểu mẫu "${l.name}"?`)){const y=rt();y.splice(p,1),lt(y),l.type==="local_idb"&&await pe(l.name).catch(()=>null),X(t,n,a===l.name?null:a)}},r.appendChild(b),o.appendChild(r)})}function he(t,n,a,e){const o=rt(),i=o.find(s=>s.name===t.name&&(s.url===t.url||s.type===t.type));if(i&&(i.lastUsed=Date.now(),lt(o)),t.type==="local_idb"){de(t.name).then(s=>{if(!s)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");n&&n(s,t.name),X(e,n,t.name)}).catch(s=>{T(`❌ Lỗi nạp File IDB: ${s.message}`,"#dc3545")});return}if(t.type==="local_base64"&&t.data){try{const s=window.atob(t.data.split(",")[1]),u=s.length,l=new Uint8Array(u);for(let p=0;p<u;p++)l[p]=s.charCodeAt(p);n&&n(l.buffer,t.name),X(e,n,t.name)}catch(s){T(`❌ Lỗi nạp Base64: ${s.message}`,"#dc3545")}return}fe(t.url).then(s=>{n&&n(s,t.name),X(e,n,t.name)}).catch(s=>{T(`❌ ${s.message}`,"#dc3545")})}function me(t,n){if(t.length===0)return n.length;if(n.length===0)return t.length;const a=[];for(let e=0;e<=n.length;e++)a[e]=[e];for(let e=0;e<=t.length;e++)a[0][e]=e;for(let e=1;e<=n.length;e++)for(let o=1;o<=t.length;o++)n.charAt(e-1)===t.charAt(o-1)?a[e][o]=a[e-1][o-1]:a[e][o]=Math.min(a[e-1][o-1]+1,a[e][o-1]+1,a[e-1][o]+1);return a[n.length][t.length]}function be(t,n){let a=t,e=n;t.length<n.length&&(a=n,e=t);const o=a.length;return o===0?1:(o-me(a,e))/parseFloat(o)}function ve(t,n,a=.7){let e=null,o=-1;const i=t.toLowerCase().trim();for(const s of n){const u=s.toLowerCase().trim(),l=be(i,u);l>o&&l>=a&&(o=l,e=s)}return e}function xe(t){return t?t.toLowerCase().split(" ").map(n=>n.charAt(0).toUpperCase()+n.slice(1)).join(" "):""}function ye(t){if(!t)return"";let n=t.replace(/\D/g,"");return n.startsWith("84")&&(n="0"+n.slice(2)),n}function we(t){if(!t)return"";const n=t.split(/[-/]/);if(n.length===3){let a,e,o;return n[0].length===4?[o,e,a]=n:[a,e,o]=n,`${a.padStart(2,"0")}/${e.padStart(2,"0")}/${o}`}return t}const st=new Map;let St=[],Ot=0;const ke=3e3;function Te(){st.clear()}function Pt(){St=Array.from(document.querySelectorAll("label, .label, .label-text, span.title, .form-label")),Ot=Date.now()}function Ee(t){t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}))}function ct(t,n){var o;const a=t.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,e=(o=Object.getOwnPropertyDescriptor(a,"value"))==null?void 0:o.set;e?e.call(t,n):t.value=n,Ee(t)}function tt(t,n=null){if(!t)return null;const a=st.get(t);if(a&&document.contains(a))return a;const e=document.getElementById(t);if(e&&(e.tagName==="INPUT"||e.tagName==="TEXTAREA"||e.tagName==="SELECT"))return st.set(t,e),e;const o=`input[id="${t}"], textarea[id="${t}"], select[id="${t}"], input[name="${t}"], textarea[name="${t}"], input[formcontrolname="${t}"], textarea[formcontrolname="${t}"], input[placeholder="${t}"], textarea[placeholder="${t}"]`,i=document.querySelector(o);if(i)return st.set(t,i),i;const s=n||t;(St.length===0||Date.now()-Ot>ke)&&Pt();const u=St;let l=u.find(p=>p.innerText.trim()===s);if(!l&&s.length>2){const p=u.map(g=>g.innerText.trim()).filter(g=>g.length>0),r=ve(s,p,.8);r&&(l=u.find(g=>g.innerText.trim()===r))}if(l){let p=null;if(l.htmlFor&&(p=document.getElementById(l.htmlFor)),!p){let r=l.parentElement,g=0;for(;r&&g<3;){const h=r.querySelector("input, textarea, select");if(h){p=h;break}r=r.parentElement,g++}}if(p)return st.set(t,p),p}return null}function Nt(t){return tt(null,t)}function Y(t,n,a=null){const e=tt(t,a);e&&ct(e,n)}function Ce(t=new Date){return String(t.getDate()).padStart(2,"0")}function Se(t=new Date){return String(t.getMonth()+1).padStart(2,"0")}function Ne(t=new Date){return String(t.getFullYear())}function zt(){const t=new Date;return{ngay:Ce(t),thang:Se(t),nam:Ne(t)}}const{ngay:Ft,thang:Kt,nam:Rt}=zt(),M={"ngayKy, ngayKy1":{label:"Ngày ký",value:Ft},"thangKy, thangKy1":{label:"Tháng ký",value:Kt},"namKy, namKy1":{label:"Năm ký",value:Rt},"ngayTiepNhan, ngayThangNamKy":{label:"Ngày ký (full)",value:`${Ft}/${Kt}/${Rt}`},tenDoanhNghiepB:{label:"Tên doanh nghiệp B",value:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM"},diaChiB:{label:"Địa chỉ B",value:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội"},maSoThueB:{label:"Mã số thuế B",value:"0100686223"},stkB:{label:"Số tài khoản B",value:"1600114156"},diaChiStkB:{label:"Ngân hàng/Địa chỉ STK B",value:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)"},"tenB, nguoiDaiDienB":{label:"Người đại diện B",value:"Phạm Khánh Chung"},"chucVuB, chucVuDaiDienB":{label:"Chức vụ B",value:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp"},"giayUyQuyenSoB, soGiayUyQuyenB":{label:"Giấy ủy quyền số B",value:"2628/GUQ-VNPT-HNI-VP"},"giayUyQuyenNgayB, ngayGiayUyQuyenB":{label:"Giấy ủy quyền ngày B",value:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},GiayUyQuyenB:{label:"Giấy ủy quyền B (full)",value:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},tenDoanhNghiepB1:{label:"Tên doanh nghiệp B (phụ)",value:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},donViTiepNhan:{label:"Đơn vị tiếp nhận",value:"TTKD KHDN"},"tenTiepNhan, tenNguoiNhan":{label:"Người tiếp nhận",value:"Bùi Anh"},dienThoaiB:{label:"Điện thoại B",value:"02436686868"},diaChiTaiKhoanB:{label:"Địa chỉ tài khoản B",value:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 "},noiKy:{label:"Nơi ký",value:"Hà Nội"},emailB:{label:"Email B",value:""},"lienheHopDongB, lienheTuVanB, lienheHoaDonB, sucoCap1B, sucoCap2B, sucoCap3B, sucoCap4B":{label:"Liên hệ B (AM)",value:"AM Bùi Anh"}},qt={soHopDong:"soHopDong, inputContractGroupName, contractNumber, contractName"},Vt={after:["vnpt-map-after","cuocDV","tongCong","tongCongHD","congCA","giaTriHopDong","tongGIaTriHopDong"],before:["vnpt-map-before","donGiaCA","thanhTienCA","tongThanhTien","tongCuocTruocThue"],tax:["vnpt-map-tax","tongThueGTGT","tongThue","thueCA","thueVAT"],text:["vnpt-map-text","soTienThanhToanBangChu","tongCongBangChu","tongCongHDbangChu","ghiChuGiaTriHopDong","tongGiaTriHopDongBangChu"]},Le=.08;function Gt(t,n){let a;return function(...o){const i=()=>{clearTimeout(a),t(...o)};clearTimeout(a),a=setTimeout(i,n)}}function $t(){const t=m.get(P)??{...M},n=m.get(j)??{},a={...t,...n};Object.keys(a).forEach(e=>{const o=a[e],i=o&&typeof o=="object"&&o.hasOwnProperty("value")?o.value:o;e.split(",").map(u=>u.trim()).filter(u=>u).forEach(u=>{let l=tt(u)||Nt(u);l&&ct(l,i)})}),T("✅ Auto fill complete")}function De(){let t=m.get(R)??{};const n={...qt,...t},a=Object.keys(n);if(a.length===0){T("⚠️ No sync mapping","#ffc107");return}a.forEach(e=>{let o=tt(e)||Nt(e);o&&o.value!==void 0&&o.value!==""&&n[e].split(",").map(s=>s.trim()).filter(s=>s).forEach(s=>Y(s,o.value))}),T("✅ Sync form complete","#d39e00")}let Lt=!1;const jt=new Map,Be=(t,n)=>{var l;if(Lt)return;let a=m.get(R)??{};const e={...qt,...a};if(Object.keys(e).length===0)return;let o=t.id,i=t.name,s=null;if(o){const p=document.querySelector(`label[for="${o}"]`);p&&(s=p.textContent.trim())}if(!s){const p=t.closest("label");p&&(s=(l=Array.from(p.childNodes).find(r=>r.nodeType===3))==null?void 0:l.textContent.trim())}let u=e[o]||e[i]||e[s];if(u){Lt=!0;try{u.split(",").map(r=>r.trim()).filter(r=>r).forEach(r=>{if(r!==o&&r!==i&&r!==s){let g=jt.get(r);(!g||!document.contains(g))&&(g=tt(r)||Nt(r),g&&jt.set(r,g)),g&&document.activeElement!==g&&ct(g,n)}})}finally{Lt=!1}}},Ie=Gt((t,n)=>{Be(t,n)},250);function Ae(){document.addEventListener("input",t=>{const n=t.target;!n||!["INPUT","TEXTAREA"].includes(n.tagName)||n.closest("#vnpt-docx-widget")||n.closest("#vnpt-inline-calc")||Ie(n,n.value)})}function N(t,n,a=null,e=""){const o=d.fieldsContainer.querySelector(".text-hint");o&&o.remove();const i=d.fieldsContainer.querySelectorAll(".f-key");let s=!1;const u=t.split(",")[0].trim();for(let l of i)if(l.value.split(",")[0].trim()===u){const r=l.closest(".vnpt-field-row"),g=r.querySelector(".f-val"),h=r.querySelector(".f-label");n!==""&&g.value!==n&&document.activeElement!==g&&(g.value=n),a!==null&&a!==""&&h.value!==a&&document.activeElement!==h&&(h.value=a),e!==""&&l.value!==t+", "+e&&document.activeElement!==l&&(l.value=t+", "+e),s=!0;break}if(!s){(a===null||a==="")&&(a=C[t]||"");const l=document.createElement("div");l.className="vnpt-field-row row-item",l.setAttribute("draggable","false");let p=t;e&&(p+=", "+e);const r=u;l.innerHTML=`
            <input type="checkbox" id="chk-${r}" name="chk-${r}" class="row-chk" title="Chọn" style="margin: 0 2px 0 2px;" />
            <input type="text" id="lbl-${r}" name="lbl-${r}" class="f-label" value="${a}" />
            <input type="text" id="key-${r}" name="key-${r}" class="f-key" value="${p}" title="Biến DOCX và IDs đồng bộ" />
            <span class="row-drag-handle" title="Kéo">=</span>
            <input type="text" id="val-${r}" name="val-${r}" class="f-val" value="${n}" />
        `;const g=l.querySelector(".f-val"),h=l.querySelector(".f-key");t==="tenToChuc"&&(g.style.textAlign="right");const v=()=>{ut.includes(u)&&(g.value.trim()?g.classList.remove("field-required-empty"):g.classList.add("field-required-empty"))},c=()=>{const b=g.value;h.value.split(",").map(y=>y.trim()).filter(y=>y).forEach(y=>Y(y,b))};h.addEventListener("input",function(){I();const b=this.value.split(",")[0].trim();g.style.textAlign=b==="tenToChuc"?"right":"",c()}),l.querySelector(".f-label").addEventListener("input",I),g.addEventListener("input",function(){I(),c(),v()}),v();const f=l.querySelector(".row-drag-handle");f.addEventListener("mouseenter",()=>l.setAttribute("draggable","true")),f.addEventListener("mouseleave",()=>{l.classList.contains("dragging")||l.setAttribute("draggable","false")}),l.addEventListener("dragstart",function(b){d.draggedRowForVNPT=this,b.dataTransfer.effectAllowed="move",b.dataTransfer.setData("text/plain",t),this.classList.add("dragging")}),l.addEventListener("dragover",b=>(b.preventDefault(),!1)),l.addEventListener("dragenter",function(){this.classList.add("over")}),l.addEventListener("dragleave",function(){this.classList.remove("over")}),l.addEventListener("drop",function(b){if(b.stopPropagation(),d.draggedRowForVNPT&&d.draggedRowForVNPT!==this){const x=Array.from(d.fieldsContainer.querySelectorAll(".vnpt-field-row")),y=x.indexOf(d.draggedRowForVNPT),S=x.indexOf(this);y<S?this.parentNode.insertBefore(d.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(d.draggedRowForVNPT,this),I()}return!1}),l.addEventListener("dragend",function(){this.setAttribute("draggable","false"),d.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(b=>{b.classList.remove("over","dragging")}),d.draggedRowForVNPT=null}),d.fieldsContainer.appendChild(l),d.fieldsContainer.scrollTop=d.fieldsContainer.scrollHeight}}function I(){const t=d.isDefaultMode?K:ot,n={};d.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(e=>{const i=e.querySelector(".f-key").value.trim().split(",").map(r=>r.trim()).filter(r=>r),s=i[0],u=i.slice(1).join(", "),l=e.querySelector(".f-label").value.trim(),p=e.querySelector(".f-val").value;s&&(n[s]={label:l,value:p,sync:u})}),m.setDebounced(t,n,1e3)}function Ut(){try{d.fieldsContainer.innerHTML="";const n=m.get(ot)||{};Object.keys(C).forEach(a=>{const e=C[a],o=n[a];o&&typeof o=="object"?N(a,o.value,o.label||e,o.sync||""):o?N(a,o,e,""):N(a,"",e,"")}),Object.keys(n).forEach(a=>{if(!(a in C)){const e=n[a];typeof e=="object"?N(a,e.value,e.label,e.sync||""):N(a,e,"","")}}),Object.keys(C).length===0&&Object.keys(n).length===0&&(d.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(n){console.error("Error loading config:",n),Object.keys(C).forEach(a=>N(a,"",C[a]))}const t=m.get(ft);t&&d.widget&&(d.widget.style.bottom="auto",t.right?(d.widget.style.right=t.right,d.widget.style.left="auto"):t.left&&(d.widget.style.left=t.left,d.widget.style.right="auto"),t.top&&(d.widget.style.top=t.top))}function Me(){document.getElementById("vnpt-btn-toggle-id").onclick=()=>d.fieldsContainer.classList.toggle("show-ids"),document.getElementById("vnpt-btn-default").onclick=()=>{d.isDefaultMode=!d.isDefaultMode},d.on("isDefaultMode",t=>Xt(t)),document.getElementById("vnpt-btn-reset-default").onclick=()=>{confirm("Khôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?")&&(m.remove(K),m.remove(q),m.remove(Q),d.isDefaultMode&&(Xt(!0),T("🔄 Đã khôi phục dữ liệu gốc","#1a73e8")))},document.getElementById("vnpt-btn-batch-del").onclick=()=>{const t=d.fieldsContainer.querySelectorAll(".vnpt-field-row");let n=0;t.forEach(a=>{var e;(e=a.querySelector(".row-chk"))!=null&&e.checked&&(a.remove(),n++)}),n===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(t.forEach(a=>a.remove()),T("🗑️ Đã xóa toàn bộ","#ff5252"),I()):(T(`🗑️ Đã xóa ${n} trường`,"#ff5252"),I())},document.getElementById("vnpt-btn-add").onclick=()=>{const t=d.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;N("bien_moi_"+t,"","",""),I()},document.getElementById("vnpt-btn-fill-back").onclick=()=>{$t();let t=0;d.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(n=>{const a=n.querySelector(".f-key").value.trim(),e=n.querySelector(".f-val").value;a.split(",").map(o=>o.trim()).filter(Boolean).forEach(o=>{(document.getElementById(o)||document.getElementsByName(o)[0])&&(Y(o,e),t++)})}),t>0?T(`✅ Đã điền ngược ${t} trường`,"#198754"):T("⚠️ Không khớp trường nào","#ffc107")}}function Xt(t){const n=document.getElementById("vnpt-btn-default"),a=document.getElementById("vnpt-btn-reset-default");if(d.fieldsContainer.innerHTML="",d.bannerArea.innerHTML="",t){n.classList.add("active"),n.innerHTML="✅ Chế độ: Dữ liệu mặc định",a&&(a.style.display="flex"),d.fieldsContainer.classList.add("vnpt-mode-default"),T("📌 Chế độ Dữ liệu mặc định (Có thể sửa)","#ea4335");const e=document.createElement("div");e.className="vnpt-default-banner",e.innerHTML='<span style="color: red;"> LƯU Ý: ĐÂY LÀ DỮ LIỆU MẶC ĐỊNH</span>',d.bannerArea.appendChild(e);const o=m.get(K);o===null?Object.keys(M).forEach(i=>{const s=M[i],u=s&&typeof s=="object"?s.value:s,l=s&&typeof s=="object"?s.label:C[i]||"";N(i,u,l)}):Object.keys(o).forEach(i=>{const s=o[i];N(i,s.value,s.label,s.sync||"")})}else n.classList.remove("active"),n.innerHTML="🛠 Dữ liệu mặc định VNPT",a&&(a.style.display="none"),d.fieldsContainer.classList.remove("vnpt-mode-default"),T("📋 Đã quay lại Dữ liệu cá nhân"),Ut()}function Yt(t){if(!t)return t;const n={};return Object.keys(t).forEach(a=>{const e=t[a];a.split(",").map(i=>i.trim()).filter(i=>i).forEach(i=>{n[i]=e})}),n}function Wt(){const t={version:"1.0",timestamp:new Date().toISOString(),backup:{fields:m.get(ot),defaultFields:m.get(K),dataDefault:Yt(m.get(P)),dataCustom:Yt(m.get(j)),dataSync:m.get(R),taxRate:m.get(Q),calcMap:m.get(q),templates:m.get(it)}},n=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),a=URL.createObjectURL(n),e=document.createElement("a");e.href=a,e.download=`vnpt_full_backup_${new Date().toLocaleDateString().replace(/\//g,"-")}.json`,e.click(),URL.revokeObjectURL(a),T("✅ Đã xuất file sao lưu hệ thống.")}async function Jt(t){return new Promise(n=>{const a=new FileReader;a.onload=e=>{try{const o=JSON.parse(e.target.result);if(!o.backup)throw new Error("File không đúng định dạng backup.");const i=o.backup;i.fields&&m.set(ot,i.fields),i.defaultFields&&m.set(K,i.defaultFields),i.dataDefault&&m.set(P,i.dataDefault),i.dataCustom&&m.set(j,i.dataCustom),i.dataSync&&m.set(R,i.dataSync),i.taxRate&&m.set(Q,i.taxRate),i.calcMap&&m.set(q,i.calcMap),i.templates&&m.set(it,i.templates),T("✅ Đã nhập dữ liệu thành công! Vui lòng tải lại trang hoặc widget.","#1e8e3e"),n(!0)}catch{T("❌ Lỗi: File sao lưu không hợp lệ.","#ff5252"),n(!1)}},a.readAsText(t)})}function _e(){const t=document.getElementById("vnpt-docx-widget")||document.createElement("div");t.id="vnpt-docx-widget";const n=m.get(ht)===!0;t.innerHTML=`
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
    `,document.body.appendChild(t),d.widget=t,d.panel=document.getElementById("vnpt-export-panel"),d.toggleBtn=document.getElementById("vnpt-toggle-btn"),d.header=document.getElementById("vnpt-panel-header"),d.bannerArea=document.getElementById("vnpt-banner-area"),d.fieldsContainer=document.getElementById("vnpt-fields-list");try{const c=m.get(gt);c&&c.width&&c.height&&(d.panel.style.width=c.width+"px",d.panel.style.height=c.height+"px")}catch(c){console.error("Lỗi load size panel:",c)}new ResizeObserver(c=>{if(d.panel.style.display!=="none")for(let f of c){const{width:b,height:x}=f.contentRect;b>0&&x>0&&m.setDebounced(gt,{width:Math.round(b+20),height:Math.round(x+20)},1e3)}}).observe(d.panel),d.panelBody=document.getElementById("vnpt-panel-body"),X(document.getElementById("vnpt-template-manager"),(c,f)=>{d.templateBuffer=c,d.templateName=f}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const c=this.files&&this.files[0];if(!c)return;const f=document.getElementById("vnpt-template-manager");ge(c,f,(b,x)=>{d.templateBuffer=b,d.templateName=x}),this.value=""}),d.toggleBtn.addEventListener("click",c=>{d.hasDragged||(d.panel.style.display==="none"?(d.panel.style.display="flex",d.toggleBtn.className="btn-opened",d.toggleBtn.innerHTML="✖",m.set(ht,!0)):(d.panel.style.display="none",d.toggleBtn.className="btn-closed",d.toggleBtn.innerHTML="📄",m.set(ht,!1)))});const e=document.getElementById("vnpt-btn-more"),o=document.getElementById("vnpt-util-menu"),i={S:{width:"380px",height:"420px"},M:{width:"460px",height:"600px"},L:{width:"620px",height:"800px"},Full:{width:"98vw",height:"92vh"}},s=m.get(q)||{};o.querySelectorAll("input[data-clink]").forEach(c=>{const f=c.dataset.clink,b=s[f]||Vt[f]||[];c.value=b.join(", "),c.oninput=()=>{const x=m.get(q)||{};x[f]=c.value.split(",").map(y=>y.trim()).filter(y=>y),m.set(q,x)}});const u=document.getElementById("vnpt-gemini-key"),l=document.getElementById("vnpt-gemini-model");u&&l&&Promise.resolve().then(()=>le).then(({SK_GEMINI_KEY:c,SK_GEMINI_MODEL:f})=>{u.value=m.get(c)||"",l.value=m.get(f)||"gemini-2.0-flash",u.oninput=()=>{m.set(c,u.value.trim())},l.onchange=()=>{m.set(f,l.value)}}),document.getElementById("vnpt-btn-export-json").onclick=()=>Wt();const p=document.getElementById("vnpt-txt-toggle"),r=document.getElementById("vnpt-txt-body");p&&r&&p.addEventListener("click",c=>{c.stopPropagation();const f=r.style.display==="none";r.style.display=f?"":"none",p.textContent=f?"▲":"▶"});const g=document.getElementById("vnpt-btn-import-json"),h=document.getElementById("vnpt-file-import-json");g.onclick=()=>h.click(),h.onchange=async c=>{c.target.files.length>0&&await Jt(c.target.files[0])&&setTimeout(()=>location.reload(),1500)},e.addEventListener("click",c=>{c.stopPropagation();const f=o.classList.toggle("show");e.classList.toggle("active",f)}),o.addEventListener("click",c=>{c.stopPropagation()}),document.addEventListener("click",c=>{o.classList.contains("show")&&(o.classList.remove("show"),e.classList.remove("active"))}),o.querySelectorAll(".size-options button").forEach(c=>{c.addEventListener("click",f=>{const b=f.target.getAttribute("data-size"),x=i[b];x&&(d.panel.style.width=x.width,d.panel.style.height=x.height),o.classList.remove("show"),e.classList.remove("active")})}),d.panel.querySelectorAll(".vnpt-resizer").forEach(c=>{c.addEventListener("mousedown",f=>{f.preventDefault(),f.stopPropagation();const b=f.clientX,x=f.clientY,y=d.panel.offsetWidth,S=d.panel.offsetHeight,W=d.widget.getBoundingClientRect(),J=W.top;window.innerWidth-W.right,d.panel.classList.add("vnpt-resizing"),document.body.classList.add("vnpt-resizing-global");const D=window.getComputedStyle(c).cursor;document.body.style.cursor=D;const w=A=>{const k=A.clientX-b,E=A.clientY-x;if(c.classList.contains("br"))d.panel.style.width=Math.max(360,y+k)+"px",d.panel.style.height=Math.max(250,S+E)+"px";else if(c.classList.contains("bl")){const B=y-k;B>360&&(d.panel.style.width=B+"px"),d.panel.style.height=Math.max(250,S+E)+"px"}else if(c.classList.contains("tr")){d.panel.style.width=Math.max(360,y+k)+"px";const B=S-E;B>250&&(d.panel.style.height=B+"px",d.widget.style.top=J+E+"px")}else if(c.classList.contains("tl")){const B=y-k,_=S-E;B>360&&(d.panel.style.width=B+"px"),_>250&&(d.panel.style.height=_+"px",d.widget.style.top=J+E+"px")}},L=()=>{window.removeEventListener("mousemove",w),window.removeEventListener("mouseup",L),d.panel.classList.remove("vnpt-resizing"),document.body.classList.remove("vnpt-resizing-global"),document.body.style.cursor="";const A=d.widget.id==="vnpt-docx-widget";m.setDebounced(ft,{right:A?d.widget.style.right:void 0,top:d.widget.style.top,x:A?void 0:parseFloat(d.widget.style.left),y:parseFloat(d.widget.style.top)},500),m.setDebounced(gt,{width:d.panel.offsetWidth,height:d.panel.offsetHeight},500)};window.addEventListener("mousemove",w),window.addEventListener("mouseup",L)})})}function Qt(t,n,a,e=null,o=null){let i=!1,s=0,u=0,l=0,p=0,r=!1;const g=5;function h(c){r!==c&&(r=c,o&&o(c))}function v(c){if(c.button!==0||["INPUT","BUTTON","SELECT","TEXTAREA"].includes(c.target.tagName)||c.target.isContentEditable)return;i=!0,d.hasDragged=!1,l=c.clientX,p=c.clientY;const b=t.getBoundingClientRect();s=c.clientX-b.left,u=c.clientY-b.top,document.body.style.userSelect="none",n&&n.forEach(x=>x.style.cursor="grabbing"),e&&e(),c.preventDefault()}return n.forEach(c=>{c.addEventListener("mousedown",v)}),document.addEventListener("mousemove",function(c){if(!i)return;if(!d.hasDragged)if(Math.sqrt(Math.pow(c.clientX-l,2)+Math.pow(c.clientY-p,2))>g)d.hasDragged=!0;else return;let f=c.clientX-s,b=c.clientY-u;const x=window.innerWidth,y=window.innerHeight,S=document.getElementById("vnpt-toggle-btn"),W=S?S.offsetWidth:40,J=S?S.offsetHeight:40,D=t.id==="vnpt-docx-widget";let w=t.offsetWidth||0;if(D){let k=W+6-w,E=x-w+6;f<k&&(f=k),f>E&&(f=E)}else w=w||200,f<0&&(f=0),f+w>x&&(f=Math.max(0,x-w));let L=r;if(D?L=!1:r?c.clientY<y-40&&(L=!1):c.clientY>y-10&&(L=!0),b<0&&(b=0),L)h(!0),t.style.top=y-t.offsetHeight+"px",D?(t.style.right=x-f-w+"px",t.style.left="auto"):(t.style.left=f+"px",t.style.right="auto"),t.style.bottom="auto";else{h(!1);let A=t.offsetHeight||40,k;if(D)k=10+J;else{const E=t.querySelector(".cw-title-bar");k=E?E.offsetHeight:A}b+k>y&&(b=Math.max(0,y-k)),t.style.top=b+"px",D?(t.style.right=x-f-w+"px",t.style.left="auto"):(t.style.left=f+"px",t.style.right="auto"),t.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(i){if(i=!1,document.body.style.userSelect="",n&&n.forEach(c=>c.style.cursor="grab"),a){const c=t.id==="vnpt-docx-widget";m.set(a,{left:c?void 0:t.style.left,right:c?t.style.right:void 0,top:t.style.top,x:c?void 0:parseFloat(t.style.left),y:parseFloat(t.style.top),docked:r})}setTimeout(()=>{d.hasDragged=!1},100)}}),{isDocked:()=>r,setDocked:h}}function He(){d.widget&&d.header&&(Qt(d.widget,[d.header],ft),window.addEventListener("resize",()=>{const t=window.innerWidth,n=window.innerHeight,a=document.getElementById("vnpt-toggle-btn"),e=a?a.offsetWidth:40,o=a?a.offsetHeight:40;let i=d.widget.getBoundingClientRect(),s=i.left,u=i.top,l=d.widget.offsetWidth||0,r=e+6-l,g=t-l+6;s<r&&(s=r),s>g&&(s=g),u+10+o>n&&(u=Math.max(0,n-(10+o))),d.widget.style.right=t-s-l+"px",d.widget.style.top=u+"px"}))}function Zt(t){const n=t.toLowerCase(),{ngay:a,thang:e,nam:o}=zt(),i=`${a}/${e}/${o}`;return{"ngayky, ngayky1":a,ngayky:a,"thangky, thangky1":e,thangky:e,"namky, namky1":o,namky:o,"ngaytiepnhan, ngaythangnamky":i,ngaytiepnhan:i,ngaythangnamky:i,soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[n]||""}function Oe(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){if(d.isDefaultMode){Object.keys(M).forEach(n=>{N(n,M[n],C[n]||"")}),I(),T("Đã nạp lại dữ liệu mặc định từ hệ thống.");return}let t=0;Object.keys(C).forEach(n=>{var s;const a=C[n],e=n.split(",")[0].trim(),o=tt(e,a);let i="";o&&(i=o.tagName.toLowerCase()==="select"?((s=o.options[o.selectedIndex])==null?void 0:s.text)||"":o.value,t++),i||(i=Zt(n)),i&&typeof i=="string"&&(["tenDaiDienn","tenToChuc","noiCap","noiKy"].includes(e)?i=xe(i):["sdt"].includes(e)?i=ye(i):["ngaySinhCustomer","ngayCapCustomer","ngayCapSoDkdnCustomer","ngayKy","ngayTiepNhan"].includes(e)&&(i=we(i))),N(n,i,null)}),I(),t>0?(this.style.background="#1e8e3e",this.style.color="#fff",this.innerText="Đã quét xong",setTimeout(()=>{this.style.background="",this.style.color="",this.innerText="Quét dữ liệu"},1e3)):T("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(t){if(!(t.target.closest("#vnpt-docx-widget")||t.target.closest("#vnpt-inline-calc"))&&t.target&&t.target.id){const n=Object.keys(C).find(a=>a.split(",").map(e=>e.trim()).includes(t.target.id));n!==void 0&&(N(n,t.target.value,null),I())}}),document.addEventListener("change",function(t){var n;if(!(t.target.closest("#vnpt-docx-widget")||t.target.closest("#vnpt-inline-calc"))&&t.target&&t.target.id){const a=Object.keys(C).find(e=>e.split(",").map(o=>o.trim()).includes(t.target.id));if(a!==void 0){let e=t.target.tagName.toLowerCase()==="select"?((n=t.target.options[t.target.selectedIndex])==null?void 0:n.text)||"":t.target.value;N(a,e,null),I()}}})}const Pe={local:{download(t,n="arraybuffer"){return new Promise((a,e)=>{const o=new FileReader;switch(o.onload=i=>{let s=i.target.result;n==="base64"&&typeof s=="string"&&(s=s.split(",")[1]||s),a(s)},o.onerror=i=>e(i),n.toLowerCase()){case"arraybuffer":o.readAsArrayBuffer(t);break;case"base64":case"dataurl":o.readAsDataURL(t);break;case"text":o.readAsText(t);break;default:e(new Error(`Unsupported read type: ${n}`))}})},async upload(t){return this.download(t,"base64")}}},ze={getAdapter(t){const n=Pe[t];if(!n)throw new Error(`Storage adapter not found: ${t}`);return n},async upload(t,n,a={}){return await this.getAdapter(t).upload(n,a)},async download(t,n,a={}){return await this.getAdapter(t).download(n,a.type||"arraybuffer")}};function te(t,n,a){try{let e;try{e=new window.PizZip(t)}catch(l){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(l);return}const o=new window.docxtemplater(e,{paragraphLoop:!0,linebreaks:!0});o.render(n);const i=o.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),s=URL.createObjectURL(i),u=document.createElement("a");u.href=s,u.download=a,document.body.appendChild(u),u.click(),setTimeout(()=>{document.body.removeChild(u),URL.revokeObjectURL(s)},100)}catch(e){let o=e.message;e.properties&&e.properties.errors instanceof Array?o=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+e.properties.errors.map(s=>"- "+(s.properties.explanation||s.message)).join(`
`):o="Lỗi phần mềm Word sinh ra: "+o,alert(o),console.error("DocX Error:",e)}}function Fe(t,n){const a=t.replace(/@(\w+)/g,(e,o)=>n[o]!==void 0?n[o]:e);navigator.clipboard.writeText(a).then(()=>{alert("✅ Đã sao chép nội dung vào Clipboard!")}).catch(e=>{console.error("Lỗi khi copy:",e),alert("❌ Lỗi khi sao chép vào Clipboard. Vui lòng thử lại!")})}function Ke(){const t=document.getElementById("vnpt-export-filename");t&&t.addEventListener("input",()=>{t.dataset.userEdited="1",t.value.trim()||(t.dataset.userEdited="0")});function n(){if(!t||t.dataset.userEdited==="1")return;let o="";if(d.fieldsContainer&&d.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(r=>{const h=r.querySelector(".f-key").value.trim().split(",")[0].trim(),v=r.querySelector(".f-val").value.trim();h==="tenToChuc"&&(o=v)}),!o){const p=document.getElementById("tenToChuc");p&&(o=p.tagName.toLowerCase()==="textarea"||p.tagName.toLowerCase()==="input"?p.value.trim():p.innerText.trim())}function i(p){if(!p)return"";let r=p;return r=r.replace(/Tổng công ty/gi,""),r=r.replace(/Công ty/gi,""),r=r.replace(/\bCty\b/gi,""),r=r.replace(/Trách nhiệm hữu hạn/gi,""),r=r.replace(/\bTNHH\b/gi,""),r=r.replace(/Cổ phần/gi,""),r=r.replace(/\bCP\b/gi,""),r=r.replace(/Một thành viên/gi,""),r=r.replace(/\bMTV\b/gi,""),r=r.replace(/Chi nhánh/gi,""),r=r.replace(/Việt Nam/gi,"VN"),r=r.replace(/Viet Nam/gi,"VN"),r=r.replace(/\s+/g," ").trim(),r=r.replace(/^[-,\s]+|[-,\s]+$/g,""),r.length>50&&(r=r.substring(0,47)+"..."),r.replace(/[<>:"/\\|?*]/g,"")}let s=i(o),u=d.templateName?d.templateName.replace(/\.docx$/i,""):"",l=[];u&&l.push(u),s&&l.push(s),l.length>0?t.value=l.join(" - ")+".docx":t.value||(t.value="Export_Auto.docx")}setInterval(n,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const o={};if(d.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(p=>{const g=p.querySelector(".f-key").value.trim().split(",")[0].trim(),h=p.querySelector(".f-val").value;g&&(o[g]=h)}),Object.keys(o).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}const s=[];if(ut.forEach(p=>{if(!o[p]||!o[p].trim()){const r=C[p]||p;s.push(r)}}),s.length>0){const p=`Cảnh báo: Bạn còn các trường sau chưa điền dữ liệu:

- ${s.join(`
- `)}

Bạn có chắc chắn muốn tiếp tục xuất file không?`;if(!confirm(p))return}let u=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(u.toLowerCase().endsWith(".docx")||(u+=".docx"),d.templateBuffer){te(d.templateBuffer,o,u);return}const l=document.getElementById("vnpt-template-file");if(l.files&&l.files.length>0){ze.download("local",l.files[0],{type:"arraybuffer"}).then(p=>te(p,o,u)).catch(p=>alert(`Lỗi đọc file: ${p.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')});const a=document.getElementById("vnpt-btn-export-txt"),e=document.getElementById("vnpt-txt-template");if(e){const o=m.get(Et);o&&(e.value=o),e.addEventListener("input",()=>{m.setDebounced(Et,e.value,800)})}a&&a.addEventListener("click",()=>{const o=e?e.value:"";if(!o.trim()){alert(`Bạn chưa nhập nội dung Text Template!

Sử dụng @key làm placeholder, ví dụ: Tôi là @tenDaiDienn`);return}const i={};if(d.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(u=>{const p=u.querySelector(".f-key").value.trim().split(",")[0].trim(),r=u.querySelector(".f-val").value;p&&(i[p]=r)}),Object.keys(i).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}Fe(o,i)})}const Re=["chucVu","noiCap","noiCapSoDkdn","ngayky","ngayky1","thangky","namky","thangky1","namky1","noiKy"],qe=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function Ve(){function t(){Re.forEach(e=>{const o=document.getElementById(e);o&&!o.dataset.filled&&(o.dataset.filled="1",ct(o,Zt(e)))}),qe.forEach(e=>{const o=document.getElementById(e.src),i=document.getElementById(e.target);o&&i&&!o.dataset.bound&&(o.dataset.bound="1",o.addEventListener("input",()=>ct(i,o.value)))})}let n;new MutationObserver(e=>{e.some(i=>i.addedNodes.length>0?Array.from(i.addedNodes).some(u=>u.nodeType!==1?!1:["INPUT","TEXTAREA","SELECT"].includes(u.tagName)?!0:u.querySelector&&u.querySelector("input, textarea, select")):!1)&&(clearTimeout(n),n=setTimeout(t,200))}).observe(document.body,{childList:!0,subtree:!0}),t()}const Ge=()=>{let t="";for(const[n,a]of Object.entries(C)){const e=n.split(",")[0].trim();ut.includes(e)&&(t+=`"${e}": "${a}",
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
`};function $e(t,n,a="gemini-2.0-flash"){return new Promise((e,o)=>{if(!n)return o("Vui lòng nhập API Key Gemini trong Cài đặt.");const i=n.trim(),s=`https://generativelanguage.googleapis.com/v1/models/${a}:generateContent?key=${i}`,u={system_instruction:{parts:{text:Ge()}},contents:[{parts:[{text:"Đọc file hợp đồng này và trích xuất thành JSON."},{inline_data:{mime_type:"application/pdf",data:t}}]}],generationConfig:{responseMimeType:"application/json"}};typeof GM_xmlhttpRequest<"u"?GM_xmlhttpRequest({method:"POST",url:s,headers:{"Content-Type":"application/json"},data:JSON.stringify(u),timeout:3e4,onload:l=>{var p,r,g,h,v;if(l.status>=200&&l.status<300)try{const c=JSON.parse(l.responseText),f=(v=(h=(g=(r=(p=c==null?void 0:c.candidates)==null?void 0:p[0])==null?void 0:r.content)==null?void 0:g.parts)==null?void 0:h[0])==null?void 0:v.text;if(f){let b=f.replace(/```json/g,"").replace(/```/g,"").trim();e(JSON.parse(b))}else o("AI không trả về kết quả hợp lệ.")}catch(c){console.error("Lỗi parse JSON từ Gemini",c,l.responseText),o("Lỗi Parse kết quả từ Gemini.")}else o(`API Gemini lỗi (${l.status}): ${l.responseText}`)},ontimeout:()=>o("Quá hạn thời gian gọi API (30s)"),onerror:l=>o("Lỗi kết nối đến Google Gemini API.")}):fetch(s,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(u)}).then(l=>l.json()).then(l=>{var g,h,v,c,f;if(l.error)return o(l.error.message);let r=((f=(c=(v=(h=(g=l==null?void 0:l.candidates)==null?void 0:g[0])==null?void 0:h.content)==null?void 0:v.parts)==null?void 0:c[0])==null?void 0:f.text).replace(/```json/g,"").replace(/```/g,"").trim();e(JSON.parse(r))}).catch(l=>o(l.message))})}function je(t){return new Promise((n,a)=>{const e=new FileReader;e.onload=()=>{const o=e.result.split(",")[1];n(o)},e.onerror=o=>a(o),e.readAsDataURL(t)})}function Ue(){let t=document.getElementById("vnpt-pdf-loader");t||(t=document.createElement("div"),t.id="vnpt-pdf-loader",t.className="vnpt-pdf-overlay",t.innerHTML=`
            <div class="vnpt-pdf-loading-box">
                <div class="loader-spinner"></div>
                <div style="margin-top: 15px; font-weight: 800; font-size: 13px; color: #1a73e8;">Đang nhờ AI đọc Hợp đồng...</div>
                <div style="margin-top: 4px; font-size: 11px; color: #5f6368;">Tùy thuộc độ lớn file, thường mất 5 - 10s...</div>
            </div>
        `,document.body.appendChild(t)),t.style.display="flex"}function ee(){const t=document.getElementById("vnpt-pdf-loader");t&&(t.style.display="none")}function Xe(t,n){let a=document.getElementById("vnpt-pdf-dialog");a&&a.remove(),a=document.createElement("div"),a.id="vnpt-pdf-dialog",a.className="vnpt-pdf-overlay";const e=t.map((l,p)=>`
        <tr class="pdf-row-auto">
            <td style="text-align: center;">
                <input type="checkbox" class="pdf-row-chk" data-index="${p}" checked />
            </td>
            <td><strong>${l.key}</strong></td>
            <td><div style="max-height: 40px; overflow-y: auto; color: #1a73e8; font-weight: 600;">${l.value}</div></td>
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
    `,document.body.appendChild(a);const o=a.querySelector("#pdf-btn-cancel"),i=a.querySelector("#pdf-btn-confirm"),s=a.querySelector("#pdf-check-all"),u=a.querySelectorAll(".pdf-row-chk");s.addEventListener("change",l=>{u.forEach(p=>p.checked=l.target.checked)}),o.onclick=()=>{a.remove()},i.onclick=()=>{const l=[];u.forEach(p=>{if(p.checked){const r=parseInt(p.getAttribute("data-index"));l.push(t[r])}}),a.remove(),n(l)}}function Ye(){const t=document.getElementById("vnpt-btn-scan-pdf"),n=document.getElementById("vnpt-pdf-input");!t||!n||(t.addEventListener("click",a=>{a.preventDefault(),n.click()}),n.addEventListener("change",async a=>{const e=a.target.files[0];e&&(a.target.value="",await We(e))}))}async function We(t){const n=m.get(_t),a=m.get(Ht)||"gemini-2.0-flash";if(!n){confirm(`Chưa cài đặt Gemini API Key!

AI Scanner (PDF) yêu cầu cần có mã Google AI Studio cấp phát Miễn phí.

Nhấn 'OK' để xem hướng dẫn tự tạo mã Key nhé!`)&&window.open("https://github.com/tranchien2000/vnpt-tampermonkey-vite/blob/main/docs/GEMINI_API_GUIDE.md","_blank");return}try{Ue();const e=await je(t),o=await $e(e,n,a);ee();const i=Object.keys(o).map(s=>({key:s,value:o[s],label:o[s]===""?"(Trống)":o[s]})).filter(s=>s.value!=="");if(i.length===0){alert("Rất tiếc! AI không tìm thấy trường thông tin nào thỏa mãn (Bên A).");return}Xe(i,s=>{s.forEach(u=>{N(u.key,u.value,`AI: ${u.key}`)}),I(),console.log(`✅ [OCR Pdf] Đã điền thành công ${s.length} trường.`)})}catch(e){ee(),console.error("Lỗi PDF Scan Pipeline:",e);let o=e;typeof e=="string"&&(e.includes("Quota exceeded")||e.includes("limit: 0"))&&(o=`⚠️ Hết hạn mức hoặc Mô hình không khả dụng (Quota Exceeded)!

Mô hình bạn chọn có thể chưa hỗ trợ tại vùng của bạn hoặc bạn đã dùng hết lượt gọi miễn phí.

QUYẾT : Hãy mở menu ⚙️ (Thiết lập), đổi sang 'Gemini 1.5 Flash' hoặc 'Gemini 2.0 Flash' để tiếp tục.`),alert(`Lỗi xử lý quét File:
`+o)}}function et(t,n=null){return m.get(t,n)}function yt(t,n){m.set(t,n)}function ne(t,n){if(!n||n.replace(/\D/g,"").length<6)return;let a=et(t,[]);a=a.filter(e=>e!==n),a.unshift(n),yt(t,a.slice(0,10))}function wt(t,n){const a=document.getElementById(n);a&&(a.innerHTML=et(t,[]).map(e=>`<option value="${e}">`).join(""))}function Dt(t){return t.toLocaleString("en-US")}function Bt(t){return Number(String(t).replace(/[^\d]/g,""))||0}function Je(t){return t.charAt(0).toUpperCase()+t.slice(1)}const dt=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function Qe(t){let n=Math.floor(t/100),a=Math.floor(t%100/10),e=t%10,o="";return n>0&&(o+=dt[n]+" trăm ",a===0&&e>0&&(o+="lẻ ")),a>1?(o+=dt[a]+" mươi ",e===1?o+="mốt":e===5?o+="lăm":e>0&&(o+=dt[e])):a===1?(o+="mười ",e===5?o+="lăm":e>0&&(o+=dt[e])):e>0&&(n>0&&(o+="lẻ "),o+=dt[e]),o.trim()}function Ze(t){if(t===0)return"không";const n=["","nghìn","triệu","tỷ"];let a="",e=0;for(;t>0;){const o=t%1e3;o>0&&(a=Qe(o)+" "+n[e]+" "+a),t=Math.floor(t/1e3),e++}return a.trim()}function oe(t,n,a){let e=0,o=0,i=0;t==="before"?(e=Bt(n),o=Math.round(e*a),i=e+o):t==="tax"?(o=Bt(n),e=Math.round(o/a),i=e+o):t==="after"&&(i=Bt(n),e=Math.round(i/(1+a)),o=i-e);const s=Je(Ze(i))+" đồng";return{beforeNum:e,taxNum:o,afterNum:i,beforeStr:Dt(e),taxStr:Dt(o),afterStr:Dt(i),textStr:s}}function tn(t,n){n.before&&n.before.forEach(a=>Y(a,t.beforeStr)),n.tax&&n.tax.forEach(a=>Y(a,t.taxStr)),n.after&&n.after.forEach(a=>Y(a,t.afterStr)),n.text&&n.text.forEach(a=>Y(a,t.textStr))}function kt(t,n=null){try{const a=localStorage.getItem(t);return a!==null?JSON.parse(a):n}catch{return n}}function z(t,n){localStorage.setItem(t,JSON.stringify(n))}function en(t,n,a,e){let o=kt(Z)??"custom",i=kt(P)??{...M},s=kt(j)??{},u=kt(R)??{};const l=document.createElement("div");l.className="cw-tab-header";const p={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};p.custom.innerText="📋 Custom",p.custom.className="cw-tab cw-tab-custom",p.default.innerText="📌 Default",p.default.className="cw-tab cw-tab-default",p.sync.innerText="🔗 Sync",p.sync.className="cw-tab cw-tab-sync";function r(){Object.values(p).forEach(w=>w.classList.remove("active")),p[o].classList.add("active")}r();const g=document.createElement("div");g.style.display=e.data?"none":"block";const h=n("📋 Cấu hình Data","data",w=>{g.style.display=w?"none":"block",a(t)}),v=document.createElement("div");v.className="cw-data-body";function c(){v.innerHTML="";let w=o==="sync"?u:o==="custom"?s:i,L=o==="sync"?R:o==="custom"?j:P;const A=Object.keys(w);A.length===0&&o!=="default"&&(v.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),A.forEach(k=>{const E=document.createElement("div");E.className="cw-data-row";let B=o!=="default";const _=w[k],Tt=_&&typeof _=="object"&&_.hasOwnProperty("value"),ae=Tt?_.value:_,At=Tt&&_.label||k,H=document.createElement("input");H.type="text",H.value=At,H.id=`df-key-${k}`,H.name=`df-key-${k}`,H.className="cw-data-key"+(B?" mutable":""),H.title=k,H.readOnly=!B,B&&(H.onchange=()=>{const O=H.value.trim();if(!O||O===k){H.value=At;return}Tt?w[O]={..._,label:O}:w[O]=ae,delete w[k],z(L,w),c()});const F=document.createElement("input");if(F.type="text",F.value=ae??"",F.id=`df-val-${k}`,F.name=`df-val-${k}`,F.className="cw-data-val",F.oninput=()=>{Tt?w[k]={..._,value:F.value}:w[k]=F.value,z(L,w)},E.appendChild(H),E.appendChild(F),B){const O=document.createElement("button");O.innerHTML="✕",O.className="cw-del-btn",O.onclick=()=>{confirm(`Delete "${At}"?`)&&(delete w[k],z(L,w),c())},E.appendChild(O)}else E.appendChild(document.createElement("div")).className="cw-pad";v.appendChild(E)})}p.custom.onclick=()=>{o="custom",z(Z,"custom"),r(),c()},p.default.onclick=()=>{o="default",z(Z,"default"),r(),c()},p.sync.onclick=()=>{o="sync",z(Z,"sync"),r(),c()};const f=document.createElement("button");f.innerText="📤",f.className="cw-icon-btn",f.title="Sao lưu toàn bộ dữ liệu ra JSON",f.onclick=()=>Wt();const b=document.createElement("button");b.innerText="📥",b.className="cw-icon-btn",b.title="Khôi phục dữ liệu từ JSON";const x=document.createElement("input");x.type="file",x.accept=".json",x.style.display="none",x.onchange=async w=>{w.target.files.length>0&&await Jt(w.target.files[0])&&setTimeout(()=>location.reload(),1500)},b.onclick=()=>x.click(),g.appendChild(l),l.appendChild(p.custom),l.appendChild(p.default),l.appendChild(p.sync),g.appendChild(v),t.appendChild(h),t.appendChild(g);const y=t.querySelector("#vnpt-cw-fill"),S=t.querySelector("#vnpt-cw-sync"),W=t.querySelector("#vnpt-cw-add"),J=t.querySelector("#vnpt-cw-reset");y&&(y.onclick=$t),S&&(S.onclick=De),W&&(W.onclick=()=>{o==="default"&&(o="custom",z(Z,"custom"),r());let w=o==="sync"?u:s,L="new_field_"+Date.now();w[L]="",z(o==="sync"?R:j,w),c(),v.scrollTop=v.scrollHeight}),J&&(J.onclick=()=>{confirm("Reset Default Data?")&&(i={...M},z(P,i),c())}),c();const D=h.querySelector(".cw-right-wrap")||document.createElement("div");D.className="cw-right-wrap",D.prepend(f),D.prepend(b),D.appendChild(x),h.appendChild(D)}function nn(t,n,a){let e=Number(localStorage.getItem(Q))||Le,o=et(at)??{calc:!1,data:!0};function i(h,v){const c=document.createElement("button");return c.innerText=h,c.className="cw-action-btn "+v,c}function s(h,v,c){const f=document.createElement("div");f.className="wg-sec-header";const b=document.createElement("span");b.innerText=h;const x=document.createElement("button");return x.className="wg-toggle-btn",x.innerText=o[v]?"▾":"▴",f.appendChild(b),f.appendChild(x),x.onclick=()=>{o[v]=!o[v],x.innerText=o[v]?"▾":"▴",yt(at,o),c(o[v])},f}function u(h){const v=window.innerWidth,c=window.innerHeight,f=h.getBoundingClientRect();h.style.left=Math.min(Math.max(parseFloat(h.style.left),0),v-f.width)+"px",h.style.top=Math.min(Math.max(parseFloat(h.style.top),0),c-36)+"px"}const l=document.createElement("div");if(!n){l.className="cw-title-bar",l.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const h=document.createElement("div");h.className="cw-btn-group";const v={fill:i("Fill","cw-btn-fill"),sync:i("Sync","cw-btn-sync"),add:i("Add","cw-btn-add"),reset:i("↺","cw-btn-reset")};v.reset.title="Reset Default fields",Object.values(v).forEach(c=>h.appendChild(c)),l.appendChild(h),t.appendChild(l)}const p=document.createElement("div");p.className="cw-body-inline",p.innerHTML=`
    <div class="cw-inline-row">
        <input id="wg-before" name="wg-before" class="cw-input-inline" placeholder="Trước thuế" list="wg-before-list" title="Trước thuế">
        <datalist id="wg-before-list"></datalist>
        <div class="cw-tax-group-inline"><input id="wg-taxRate" name="wg-taxRate" class="cw-tax-input-inline" title="Thuế (%)"><span class="cw-tax-symbol">%</span></div>
        <input id="wg-tax" name="wg-tax" class="cw-input-inline" placeholder="Tiền thuế" title="Tiền thuế">
        <input id="wg-after" name="wg-after" class="cw-input-inline" placeholder="Sau thuế" list="wg-after-list" title="Sau thuế">
        <datalist id="wg-after-list"></datalist>
        <input id="wg-text" name="wg-text" class="cw-input-inline cw-input-readonly-inline" placeholder="Bằng chữ" readonly title="Bằng chữ">
    </div>`,n?n.appendChild(p):t.appendChild(p),n||en(t,s,u,o);const r={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text")};r.taxRate.value=e*100,wt(mt,"wg-before-list"),wt(bt,"wg-after-list");function g(h,v){const c=oe(h,v,e);r.before.value=c.beforeStr,r.tax.value=c.taxStr,r.after.value=c.afterStr,r.text.value=c.textStr;const f=et(q)||{...Vt};tn(c,f)}if(r.taxRate.oninput=()=>{e=Number(r.taxRate.value)/100||0,yt(Q,e),g("before",r.before.value)},r.before.oninput=()=>{const h=oe("before",r.before.value,e);r.tax.value=h.taxStr,r.after.value=h.afterStr,r.text.value=h.textStr},r.before.onchange=()=>{g("before",r.before.value),ne(mt,r.before.value),wt(mt,"wg-before-list")},r.tax.oninput=()=>g("tax",r.tax.value),r.after.oninput=()=>g("after",r.after.value),r.after.onchange=()=>{g("after",r.after.value),ne(bt,r.after.value),wt(bt,"wg-after-list")},[r.before,r.tax,r.after,r.text].forEach(h=>{["click","focus"].forEach(v=>h.addEventListener(v,()=>{if(!h.value)return;navigator.clipboard.writeText(h.value);const c=h.style.backgroundColor;h.style.backgroundColor="#d1e7dd",setTimeout(()=>h.style.backgroundColor=c,300)}))}),!n){const h=Array.from(t.children).filter(f=>f!==l),v=Qt(t,[l],a,null,f=>{h.forEach(b=>b.style.display=f?"none":""),l.style.borderRadius=f?"8px":"0",f&&(t.style.top=window.innerHeight-(l.offsetHeight||34)+"px")}),c=et(a);return c&&c.docked&&v.setDocked(!0),window.addEventListener("resize",()=>{v.isDocked()?t.style.top=window.innerHeight-l.offsetHeight+"px":u(t)}),v}return null}function on(){const t=document.getElementById("vnpt-inline-calc"),n=document.getElementById("vnpt-btn-calc-toggle");let a=d.calcWidget||document.createElement("div");if(!t&&!d.calcWidget?(a.id="vnpt-calc-widget",document.body.appendChild(a),d.calcWidget=a):t&&(a=d.widget),t&&n){let e=et(at)??{calc:!1,data:!0};const o=i=>{t.style.display=i?"none":"block",n.classList.toggle("active",!i)};o(e.calc),n.onclick=()=>{e.calc=!e.calc,yt(at,e),o(e.calc)}}return nn(a,t,Mt)}function an(){window.addEventListener("keydown",t=>{var n,a,e,o;if(t.altKey&&!t.ctrlKey&&!t.shiftKey){const i=t.key.toLowerCase();let s=!0;switch(i){case"s":(n=document.getElementById("vnpt-btn-scan"))==null||n.click();break;case"e":(a=document.getElementById("vnpt-btn-export"))==null||a.click();break;case"w":(e=document.getElementById("vnpt-toggle-btn"))==null||e.click();break;case"f":(o=document.getElementById("vnpt-btn-fill-back"))==null||o.click();break;default:s=!1;break}s&&t.preventDefault()}})}function rn(){let t=!1;try{t=!1}catch{t=!1}t&&$.info("[Migration] Dev mode active - Syncing configurations...");let n=m.get(P);if(n){let e=!1;Object.keys(M).forEach(o=>{const i=M[o];if(!(o in n))n[o]=i,e=!0;else if(t){const s=n[o],u=i&&typeof i=="object",l=s&&typeof s=="object";let p=!1;!u&&!l?p=s!==i:u&&l?p=s.value!==i.value||s.label!==i.label:p=!0,p&&(n[o]=i,e=!0)}}),e&&m.set(P,n)}let a=m.get(K);if(a){let e=!1;Object.keys(M).forEach(o=>{const i=M[o],s=i&&typeof i=="object"?i.value:i,u=i&&typeof i=="object"?i.label:C[o]||"";if(!(o in a))a[o]={label:u,value:s,sync:""},e=!0;else if(t){const l=a[o];(l.value!==s||l.label!==u)&&(a[o]={label:u,value:s,sync:l.sync||""},e=!0)}}),e&&m.setDebounced(K,a,0)}}let pt=null;function It(){if(!window.__vnptInited){window.__vnptInited=!0,$.info("Initializing VNPT Userscript..."),rn();try{ie(),_e(),on(),He(),Me(),Ut(),Oe(),Ke(),Ve(),Ye(),Ae(),an();const t=Gt(()=>{Te(),Pt(),$.debug("DOM Cache & Labels refreshed due to mutations")},1500);pt=new MutationObserver(n=>{n.some(e=>e.addedNodes.length>0||e.removedNodes.length>0?[...e.addedNodes,...e.removedNodes].some(i=>i.nodeType===1&&!["SCRIPT","STYLE","LINK"].includes(i.tagName)):!1)&&t()}),pt.observe(document.body,{childList:!0,subtree:!0}),$.info("Userscript initialized successfully.")}catch(t){$.error("Error during userscript initialization:",t)}}}function ln(){$.info("Cleaning up VNPT Userscript for reload..."),pt&&(pt.disconnect(),pt=null);const t=document.getElementById("vnpt-docx-widget");t&&t.remove();const n=document.getElementById("vnpt-calc-widget");n&&n.remove();const a=document.getElementById("vnpt-styles");a&&a.remove(),window.__vnptInited=!1,$.info("Cleanup completed.")}window.__vnptCleanup=ln,window.__vnptInit=It,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",It):It()})();
