// ==UserScript==
// @name         VNPT Word Automation
// @namespace    http://tampermonkey.net/
// @version      1.6.15
// @description  Tool tự động lấy dữ liệu trên portal VNPT
// @author       You
// @match        *://hopdong.vnpt.vn/*
// @match        *://mail.google.com/*
// @match        *://outlook.live.com/*
// @match        *://outlook.office.com/*
// @match        *://outlook.office365.com/*
// @require      https://cdn.jsdelivr.net/npm/docxtemplater@3.37.11/build/docxtemplater.js
// @require      https://cdn.jsdelivr.net/npm/pizzip@3.1.4/dist/pizzip.js
// @updateURL    https://raw.githubusercontent.com/tranchien2000/vnpt-tampermonkey-vite/main/dist/myscript.user.js
// @downloadURL  https://raw.githubusercontent.com/tranchien2000/vnpt-tampermonkey-vite/main/dist/myscript.user.js
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// @connect      localhost
// @connect      drive.google.com
// @connect      raw.githubusercontent.com
// @connect      firebaseio.com
// @connect      googleapis.com
// @connect      firebasestorage.googleapis.com
// @connect      *
// ==/UserScript==
(function(){"use strict";const xt={info:(...n)=>console.log("[Tampermonkey Script] INFO:",...n),error:(...n)=>console.error("[Tampermonkey Script] ERROR:",...n),warn:(...n)=>console.warn("[Tampermonkey Script] WARN:",...n)};function Ap(){const n="vnpt-styles";if(document.getElementById(n))return;const e=document.createElement("style");e.id=n,e.textContent=`
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

        .sensitive-mask {
            -webkit-text-security: disc !important;
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

        .vnpt-version {
            font-size: 9px; font-weight: 700; color: #9aa0a6;
            margin-left: 4px; vertical-align: bottom; opacity: 0.8;
        }

        .vnpt-update-badge {
            font-size: 8px; font-weight: 900; background: var(--vnpt-danger);
            color: white; padding: 1px 4px; border-radius: 4px;
            margin-left: 4px; cursor: pointer; text-transform: uppercase;
            animation: bounce 2s infinite; display: inline-block;
        }

        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
            40% {transform: translateY(-3px);}
            60% {transform: translateY(-2px);}
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
        
        .btn-sync-dir, .btn-sync-dir-calc {
            cursor: pointer; padding: 0; user-select: none;
            flex: 0 0 20px; height: 20px; display: flex; align-items: center; justify-content: center;
            border: none; background: transparent; color: #bdc1c6;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            opacity: 0.8;
        }
        .btn-sync-dir:hover, .btn-sync-dir-calc:hover { 
            transform: scale(1.25); opacity: 1;
            background: rgba(0,0,0,0.03); border-radius: 4px;
        }
        .btn-sync-dir:active, .btn-sync-dir-calc:active { transform: scale(0.9); }
        
        .btn-sync-dir[data-dir="both"], .btn-sync-dir-calc[data-dir="both"] { color: var(--vnpt-primary); }
        .btn-sync-dir[data-dir="up"], .btn-sync-dir-calc[data-dir="up"] { color: #f57c00; }
        .btn-sync-dir[data-dir="down"], .btn-sync-dir-calc[data-dir="down"] { color: var(--vnpt-success); }
        
        .btn-sync-dir svg, .btn-sync-dir-calc svg { transition: transform 0.3s ease; }
        .btn-sync-dir:active svg, .btn-sync-dir-calc:active svg { transform: rotate(180deg); }

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

        .vnpt-control-group { margin-bottom: 5px; display: flex; align-items: center; gap: 8px; }
        .vnpt-control-group label { display: block; font-weight: 700; font-size: 12px; color: #3c4043; margin-bottom: 0; white-space: nowrap; }
        .vnpt-control-group input[type="text"] { 
            flex: 1; min-width: 0; box-sizing: border-box; padding: 8px 12px; 
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
            top: calc(100% + 8px);
            right: 0;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px); 
            border: 1px solid var(--vnpt-border);
            border-radius: 12px; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.25);
            width: 320px; 
            max-height: 420px; 
            overflow-y: auto;
            display: none; 
            flex-direction: column; 
            z-index: 1000000;
            padding: 8px; 
            animation: menuFadeIn 0.25s cubic-bezier(0.165, 0.84, 0.44, 1);
            transform-origin: top right;
        }
        .vnpt-backup-history.show { display: flex; }
        .backup-history-header {
            padding: 10px 14px;
            font-size: 11px;
            font-weight: 800;
            color: var(--vnpt-primary);
            text-transform: uppercase;
            letter-spacing: 0.8px;
            border-bottom: 1px solid rgba(26, 115, 232, 0.1);
            background: rgba(26, 115, 232, 0.04);
            border-radius: 12px 12px 0 0;
            margin: -8px -8px 6px -8px;
        }
        .backup-history-item {
            padding: 10px 12px; border-radius: 10px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
            border-bottom: 1px solid rgba(0,0,0,0.03);
            display: flex; align-items: center; justify-content: space-between; gap: 10px;
        }
        .backup-history-item:hover { background: var(--vnpt-primary-light); transform: scale(1.02); }
        .backup-info { flex: 1; min-width: 0; }
        .backup-history-name { font-size: 11.5px; font-weight: 700; color: #3c4043; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .backup-history-time { font-size: 9px; color: #9aa0a6; font-weight: 600; margin-top: 2px; }
        
        .backup-actions { display: flex; gap: 4px; flex-shrink: 0; }
        .backup-actions button {
            width: 28px; height: 28px; border-radius: 6px; border: 1px solid #dadce0;
            background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
            font-size: 12px; transition: all 0.2s;
        }
        .btn-restore-action:hover { background: var(--vnpt-success); color: #fff; border-color: var(--vnpt-success); }
        .btn-delete-action:hover { background: var(--vnpt-danger); color: #fff; border-color: var(--vnpt-danger); }
        
        .backup-history-empty { padding: 30px 20px; text-align: center; font-size: 11px; color: #9aa0a6; font-style: italic; line-height: 1.6; }

        /* Utility Menu UI */
        .vnpt-util-dropdown { position: relative; }
        .vnpt-util-menu {
            position: absolute; top: calc(100% + 12px); right: 0;
            background: rgba(255, 255, 255, 0.95); 
            backdrop-filter: blur(15px);
            border: 1px solid var(--vnpt-border); border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15); z-index: 100000;
            display: none; flex-direction: column; min-width: 400px;
            padding: 4px 0; animation: menuFadeIn 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
            transform-origin: top right;
        }
        @keyframes menuFadeIn { 
            from { opacity: 0; transform: translateY(-15px) scale(0.9); } 
            to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        .vnpt-util-menu.show { display: flex; }
        
        .util-item, .util-item-compact {
            background: none; border: none; padding: 4px 12px;
            text-align: left; font-size: 11.5px; cursor: pointer;
            color: #3c4043; font-weight: 600; transition: all 0.2s;
            display: flex; align-items: center; gap: 6px;
            border-left: 3px solid transparent;
        }
        .util-item:hover, .util-item-compact:hover { 
            background: rgba(26, 115, 232, 0.05); color: var(--vnpt-primary); 
            border-left-color: var(--vnpt-primary);
        }
        
        .util-item-compact {
            padding: 4px 6px; border-radius: 6px; font-size: 10.5px;
            background: #f8f9fa; border: 1px solid #e0e0e0; border-left: none;
            justify-content: center; flex: 1;
        }
        .util-item-compact.danger { color: var(--vnpt-danger); }
        .util-item-compact.danger:hover { background: #fff5f5; border-color: var(--vnpt-danger); }

        .util-action-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 4px 12px;
        }
        
        .util-separator { height: 1px; background: rgba(0,0,0,0.05); margin: 4px 0; }
        .util-submenu-title { 
            padding: 4px 12px 2px 12px; font-size: 9px; font-weight: 800; 
            color: #1a73e8; text-transform: uppercase; letter-spacing: 0.8px; 
            background: rgba(26, 115, 232, 0.04); margin-bottom: 1px;
        }

        /* 2-Column Grid for Top Config */
        .util-config-grid {
            display: grid; grid-template-columns: 1fr 1fr; padding: 0;
        }
        .util-column { display: flex; flex-direction: column; overflow: hidden; }
        .util-column.vertical-separator { border-left: 1px solid var(--vnpt-border); }

        .util-row-compact { display: flex; align-items: center; padding: 2px 12px; gap: 8px; }
        .util-label-mini { font-size: 10px; font-weight: 800; color: #5f6368; text-transform: uppercase; }
        
        .size-options-compact { display: flex; gap: 4px; flex: 1; }
        .size-options-compact button {
            flex: 1; padding: 3px 0; border: 1px solid #e0e0e0; border-radius: 6px;
            background: #fff; font-size: 10px; font-weight: 700; cursor: pointer;
            transition: all 0.2s; color: #5f6368;
        }
        .size-options-compact button:hover { 
            background: var(--vnpt-primary); border-color: var(--vnpt-primary); color: #fff; 
        }

        /* Mapping Rows in Utility Menu */
        .cw-row-map-compact {
            display: flex; align-items: center; padding: 2px 12px; gap: 6px;
        }
        .cw-row-map-compact span { font-size: 12px; flex: 0 0 20px; text-align: center; }
        .cw-map-input {
            flex: 1; padding: 4px 8px; border: 1px solid #dadce0; border-radius: 6px;
            font-size: 10.5px; background: #fff; transition: all 0.2s;
        }
        .cw-map-input:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 2px var(--vnpt-primary-light); outline: none; }
        
        .util-btn-test-mini {
            background: var(--vnpt-primary-light); color: var(--vnpt-primary);
            border: 1px solid var(--vnpt-primary); border-radius: 6px;
            width: 28px; height: 26px; cursor: pointer; transition: all 0.2s;
            display: flex; align-items: center; justify-content: center; font-size: 10px; flex-shrink: 0;
        }
        .util-btn-test-mini:hover { background: var(--vnpt-primary); color: #fff; }
        
        .vnpt-hotkey-list { 
            display: flex; flex-direction: column; padding: 3px 8px; gap: 3px;
            max-height: 120px; overflow-y: auto;
        }
        .vnpt-hotkey-list::-webkit-scrollbar { width: 3px; }
        .vnpt-hotkey-list::-webkit-scrollbar-thumb { background: #dadce0; border-radius: 4px; }
ba(26, 115, 232, 0.04); margin-bottom: 1px;
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
        
        /* Tên file (Control Group ở bottom-row) */
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

        /* Nút Xuất TXT trong AI Scanner */
        #vnpt-btn-export-txt {
            color: #00695c; border-color: rgba(0, 105, 92, 0.3);
        }
        #vnpt-btn-export-txt:hover {
            background: #00695c; color: white; border-color: transparent;
        }


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

        .pdf-btn-reparse {
            padding: 8px 16px; background: var(--vnpt-primary); border: none; border-radius: 8px;
            color: #fff; font-weight: 700; cursor: pointer; transition: 0.2s;
        }
        .pdf-btn-reparse:hover { background: var(--vnpt-primary-hover); box-shadow: 0 4px 12px rgba(105, 211, 24, 0.3); }
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

    `,document.head.appendChild(e)}const Sp={widget:null,panel:null,header:null,bannerArea:null,toggleBtn:null,fieldsContainer:null,panelBody:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1,templateBuffer:null,templateName:null,hasDragged:!1},mr=new Map,D=new Proxy(Sp,{get(n,e){return e==="on"?(t,r)=>{mr.has(t)||mr.set(t,[]),mr.get(t).push(r)}:n[e]},set(n,e,t){const r=n[e];return n[e]=t,r!==t&&mr.has(e)&&mr.get(e).forEach(i=>i(t,r)),!0}}),Cp={version:"1.6.17"},ve={"tenDaiDienn, tenNguoiNhanCTS, ten":"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ (Full)","cmnd, cccd":"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT","emailDaiDien, emailNhanCTS, email":"Email Nhận TK",soDkdn:"Mã số thuế | GPKD","tenToChuc, tencty":"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD","noiCapSoDkdn, coQuanCapId, noiCapIdNew":"Nơi cấp ĐKDN/QĐTL/GPTL",goiDV:"Gói Dịch Vụ","soHopDong, inputContractGroupName":"SỐ HỢP ĐỒNG","lienheHopDongA, lienheTuVanA, lienheHoaDonA, sucoCap1A, sucoCap2A, sucoCap3A, sucoCap4A":"Liên hệ A","ngayKy, ngayKy1":"Ngày ký","thangKy, thangKy1":"Tháng Ký","namKy, namKy1":"Năm ký","ngayTiepNhan, ngayThangNamKy":"Ngày tiếp nhận / Ngày tháng năm ký",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký",duong:"Số nhà, tên đường","xaIdNew, diaChiTruSoXaIdNew":"Quận/Huyện - Xã/Phường","tinhIdNew, tinhId, diaChiTruSoTinhIdNew":"Tỉnh/Thành phố"},yr=["soHopDong","tenDaiDienn","cmnd","sdt","diaChi","tenToChuc","ngayCapCustomer","emailDaiDien","soDkdn","goiDV","soHopDong"],We="vnpt_docx_fields",Ve="vnpt_docx_default_fields",Ci="vnpt_docx_position",ki="vnpt_docx_size",Ri="vnpt_docx_opened",Pn="vnpt_docx_auto_backup",dt="vnpt_autofill_data_default",rn="vnpt_autofill_data_custom",At="vnpt_autofill_data_sync",Lc="vnpt_widget_pos",Nn="vnd_tax_rate",Pi="vnd_before_history",Ni="vnd_after_history",vr="vnpt_widget_collapsed",St="vnd_calc_map",Dn="vnpt_widget_datatab",_r="vnpt_templates",Vc="vnpt_gemini_api_key",Oc="vnpt_gemini_model",br="vnpt_hotkeys",sn="vnpt_docx_profiles",Di="vnpt_docx_active_profile_id",Ln="vnpt_raw_scan_text",wr={MST:/^\d{10}(-\d{3})?$/,PHONE:/^(0|\+84)[3|5|7|8|9]\d{8}$/,EMAIL:/^[^\s@]+@[^\s@]+\.[^\s@]+$/,ID_CARD:/^(\d{9}|\d{12})$/},Ct=Cp.version,Vn=Object.freeze(Object.defineProperty({__proto__:null,APP_VERSION:Ct,DEFAULT_LABELS:ve,LOCAL_KEY_ACTIVE_PROFILE_ID:Di,LOCAL_KEY_AUTO_BACKUP:Pn,LOCAL_KEY_DEFAULT_FIELDS:Ve,LOCAL_KEY_FIELDS:We,LOCAL_KEY_OPENED:Ri,LOCAL_KEY_POS:Ci,LOCAL_KEY_PROFILES:sn,LOCAL_KEY_SIZE:ki,REQUIRED_KEYS:yr,SK_CALC_MAP:St,SK_COLLAPSE:vr,SK_DATATAB:Dn,SK_DATA_CUS:rn,SK_DATA_DEF:dt,SK_DATA_SYNC:At,SK_GEMINI_KEY:Vc,SK_GEMINI_MODEL:Oc,SK_HIST_A:Ni,SK_HIST_B:Pi,SK_HOTKEYS:br,SK_POS_CALC:Lc,SK_RAW_SCAN:Ln,SK_TAX:Nn,SK_TEMPLATES:_r,VALIDATION_REGEX:wr},Symbol.toStringTag,{value:"Module"}));let kt=null;function F(n,e="#198754",t=2500){kt||(kt=document.createElement("div"),kt.id="vnpt-toast-container",Object.assign(kt.style,{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column-reverse",alignItems:"center",gap:"8px",zIndex:"1000000",pointerEvents:"none"}),document.body.appendChild(kt));const r=document.createElement("div");r.innerText=n,Object.assign(r.style,{background:e,color:"#fff",padding:"8px 18px",borderRadius:"24px",opacity:"0",transform:"translateY(10px)",transition:"opacity 0.3s, transform 0.3s",fontSize:"13px",fontWeight:"500",fontFamily:"'Segoe UI', Roboto, sans-serif",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",whiteSpace:"nowrap",pointerEvents:"auto"}),kt.appendChild(r),requestAnimationFrame(()=>{r.style.opacity="1",r.style.transform="translateY(0)"}),setTimeout(()=>{r.style.opacity="0",r.style.transform="translateY(-10px)",setTimeout(()=>{r.remove(),kt&&kt.childNodes.length},300)},t)}const kp="vnpt_templates_db",Rt="buffers";let Li=null;function go(){return Li?Promise.resolve(Li):new Promise((n,e)=>{const t=indexedDB.open(kp,1);t.onupgradeneeded=r=>{const i=r.target.result;i.objectStoreNames.contains(Rt)||i.createObjectStore(Rt)},t.onsuccess=r=>{Li=r.target.result,n(Li)},t.onerror=()=>e(t.error)})}async function Rp(n,e){const t=await go();return new Promise((r,i)=>{const c=t.transaction(Rt,"readwrite").objectStore(Rt).put(e,n);c.onsuccess=()=>r(),c.onerror=()=>i(c.error)})}async function Pp(n){const e=await go();return new Promise((t,r)=>{const a=e.transaction(Rt,"readonly").objectStore(Rt).get(n);a.onsuccess=()=>t(a.result),a.onerror=()=>r(a.error)})}async function Np(n){const e=await go();return new Promise((t,r)=>{const a=e.transaction(Rt,"readwrite").objectStore(Rt).delete(n);a.onsuccess=()=>t(),a.onerror=()=>r(a.error)})}const on=new Map,Vi=new Map,M={isGM:typeof GM_setValue<"u"&&typeof GM_getValue<"u",get(n,e=null){if(on.has(n))return on.get(n);try{let t;if(this.isGM?t=GM_getValue(n,null):t=localStorage.getItem(n),t==null)return e;let r;if(typeof t=="string")try{r=JSON.parse(t)}catch{r=t}else r=t;return on.set(n,r),r}catch(t){return console.warn(`[Storage] Không thể đọc key "${n}":`,t),e}},set(n,e){on.set(n,e);try{const t=JSON.stringify(e);return this.isGM?GM_setValue(n,t):localStorage.setItem(n,t),!0}catch(t){return console.error(`[Storage] Không thể ghi key "${n}":`,t),!1}},setDebounced(n,e,t=500){on.set(n,e),Vi.has(n)&&clearTimeout(Vi.get(n));const r=setTimeout(()=>{this.set(n,e),Vi.delete(n)},t);Vi.set(n,r)},remove(n){on.delete(n);try{this.isGM?GM_deleteValue(n):localStorage.removeItem(n)}catch(e){console.error(`[Storage] Không thể xóa key "${n}":`,e)}},clearCache(){on.clear()}},Oi=Object.freeze(Object.defineProperty({__proto__:null,Storage:M},Symbol.toStringTag,{value:"Module"})),Dp=()=>{};/**
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
 */const Mc=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let i=n.charCodeAt(r);i<128?e[t++]=i:i<2048?(e[t++]=i>>6|192,e[t++]=i&63|128):(i&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=i>>18|240,e[t++]=i>>12&63|128,e[t++]=i>>6&63|128,e[t++]=i&63|128):(e[t++]=i>>12|224,e[t++]=i>>6&63|128,e[t++]=i&63|128)}return e},Lp=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const i=n[t++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){const s=n[t++];e[r++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=n[t++],a=n[t++],c=n[t++],l=((i&7)<<18|(s&63)<<12|(a&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(l>>10)),e[r++]=String.fromCharCode(56320+(l&1023))}else{const s=n[t++],a=n[t++];e[r++]=String.fromCharCode((i&15)<<12|(s&63)<<6|a&63)}}return e.join("")},Fc={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<n.length;i+=3){const s=n[i],a=i+1<n.length,c=a?n[i+1]:0,l=i+2<n.length,u=l?n[i+2]:0,f=s>>2,p=(s&3)<<4|c>>4;let y=(c&15)<<2|u>>6,A=u&63;l||(A=64,a||(y=64)),r.push(t[f],t[p],t[y],t[A])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(Mc(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):Lp(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<n.length;){const s=t[n.charAt(i++)],c=i<n.length?t[n.charAt(i)]:0;++i;const u=i<n.length?t[n.charAt(i)]:64;++i;const p=i<n.length?t[n.charAt(i)]:64;if(++i,s==null||c==null||u==null||p==null)throw new Vp;const y=s<<2|c>>4;if(r.push(y),u!==64){const A=c<<4&240|u>>2;if(r.push(A),p!==64){const E=u<<6&192|p;r.push(E)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class Vp extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Op=function(n){const e=Mc(n);return Fc.encodeByteArray(e,!0)},Mi=function(n){return Op(n).replace(/\./g,"")},Uc=function(n){try{return Fc.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function Mp(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const Fp=()=>Mp().__FIREBASE_DEFAULTS__,Up=()=>{if(typeof process>"u"||typeof process.env>"u")return;const n=process.env.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Bp=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&Uc(n[1]);return e&&JSON.parse(e)},Fi=()=>{try{return Dp()||Fp()||Up()||Bp()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Bc=n=>{var e,t;return(t=(e=Fi())==null?void 0:e.emulatorHosts)==null?void 0:t[n]},qp=n=>{const e=Bc(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},qc=()=>{var n;return(n=Fi())==null?void 0:n.config},$c=n=>{var e;return(e=Fi())==null?void 0:e[`_${n}`]};/**
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
 */class $p{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
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
 */function Hp(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",i=n.iat||0,s=n.sub||n.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a={iss:`https://securetoken.google.com/${r}`,aud:r,iat:i,exp:i+3600,auth_time:i,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}},...n};return[Mi(JSON.stringify(t)),Mi(JSON.stringify(a)),""].join(".")}/**
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
 */function Ie(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function jp(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Ie())}function Kp(){var e;const n=(e=Fi())==null?void 0:e.forceEnvironment;if(n==="node")return!0;if(n==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function zp(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Gp(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Wp(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Qp(){const n=Ie();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function Yp(){return!Kp()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Xp(){try{return typeof indexedDB=="object"}catch{return!1}}function Jp(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},i.onupgradeneeded=()=>{t=!1},i.onerror=()=>{var s;e(((s=i.error)==null?void 0:s.message)||"")}}catch(t){e(t)}})}/**
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
 */const Zp="FirebaseError";class ft extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=Zp,Object.setPrototypeOf(this,ft.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Er.prototype.create)}}class Er{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},i=`${this.service}/${e}`,s=this.errors[e],a=s?eg(s,r):"Error",c=`${this.serviceName}: ${a} (${i}).`;return new ft(i,c,r)}}function eg(n,e){return n.replace(tg,(t,r)=>{const i=e[r];return i!=null?String(i):`<${r}?>`})}const tg=/\{\$([^}]+)}/g;function ng(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function an(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const i of t){if(!r.includes(i))return!1;const s=n[i],a=e[i];if(Hc(s)&&Hc(a)){if(!an(s,a))return!1}else if(s!==a)return!1}for(const i of r)if(!t.includes(i))return!1;return!0}function Hc(n){return n!==null&&typeof n=="object"}/**
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
 */function Tr(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function Ir(n){const e={};return n.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[i,s]=r.split("=");e[decodeURIComponent(i)]=decodeURIComponent(s)}}),e}function xr(n){const e=n.indexOf("?");if(!e)return"";const t=n.indexOf("#",e);return n.substring(e,t>0?t:void 0)}function rg(n,e){const t=new ig(n,e);return t.subscribe.bind(t)}class ig{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let i;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");sg(e,["next","error","complete"])?i=e:i={next:e,error:t,complete:r},i.next===void 0&&(i.next=mo),i.error===void 0&&(i.error=mo),i.complete===void 0&&(i.complete=mo);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function sg(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function mo(){}/**
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
 */function Pe(n){return n&&n._delegate?n._delegate:n}/**
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
 */function Ar(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function jc(n){return(await fetch(n,{credentials:"include"})).ok}class cn{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const ln="[DEFAULT]";/**
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
 */class og{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new $p;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:t});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(e==null?void 0:e.optional)??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(i){if(r)return null;throw i}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(cg(e))try{this.getOrInitializeService({instanceIdentifier:ln})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(t);try{const s=this.getOrInitializeService({instanceIdentifier:i});r.resolve(s)}catch{}}}}clearInstance(e=ln){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=ln){return this.instances.has(e)}getOptions(e=ln){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[s,a]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(s);r===c&&a.resolve(i)}return i}onInit(e,t){const r=this.normalizeInstanceIdentifier(t),i=this.onInitCallbacks.get(r)??new Set;i.add(e),this.onInitCallbacks.set(r,i);const s=this.instances.get(r);return s&&e(s,r),()=>{i.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const i of r)try{i(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:ag(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=ln){return this.component?this.component.multipleInstances?e:ln:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function ag(n){return n===ln?void 0:n}function cg(n){return n.instantiationMode==="EAGER"}/**
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
 */class lg{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new og(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var X;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(X||(X={}));const ug={debug:X.DEBUG,verbose:X.VERBOSE,info:X.INFO,warn:X.WARN,error:X.ERROR,silent:X.SILENT},hg=X.INFO,dg={[X.DEBUG]:"log",[X.VERBOSE]:"log",[X.INFO]:"info",[X.WARN]:"warn",[X.ERROR]:"error"},fg=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),i=dg[e];if(i)console[i](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class yo{constructor(e){this.name=e,this._logLevel=hg,this._logHandler=fg,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in X))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?ug[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,X.DEBUG,...e),this._logHandler(this,X.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,X.VERBOSE,...e),this._logHandler(this,X.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,X.INFO,...e),this._logHandler(this,X.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,X.WARN,...e),this._logHandler(this,X.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,X.ERROR,...e),this._logHandler(this,X.ERROR,...e)}}const pg=(n,e)=>e.some(t=>n instanceof t);let Kc,zc;function gg(){return Kc||(Kc=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function mg(){return zc||(zc=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Gc=new WeakMap,vo=new WeakMap,Wc=new WeakMap,_o=new WeakMap,bo=new WeakMap;function yg(n){const e=new Promise((t,r)=>{const i=()=>{n.removeEventListener("success",s),n.removeEventListener("error",a)},s=()=>{t(Pt(n.result)),i()},a=()=>{r(n.error),i()};n.addEventListener("success",s),n.addEventListener("error",a)});return e.then(t=>{t instanceof IDBCursor&&Gc.set(t,n)}).catch(()=>{}),bo.set(e,n),e}function vg(n){if(vo.has(n))return;const e=new Promise((t,r)=>{const i=()=>{n.removeEventListener("complete",s),n.removeEventListener("error",a),n.removeEventListener("abort",a)},s=()=>{t(),i()},a=()=>{r(n.error||new DOMException("AbortError","AbortError")),i()};n.addEventListener("complete",s),n.addEventListener("error",a),n.addEventListener("abort",a)});vo.set(n,e)}let wo={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return vo.get(n);if(e==="objectStoreNames")return n.objectStoreNames||Wc.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return Pt(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function _g(n){wo=n(wo)}function bg(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const r=n.call(Eo(this),e,...t);return Wc.set(r,e.sort?e.sort():[e]),Pt(r)}:mg().includes(n)?function(...e){return n.apply(Eo(this),e),Pt(Gc.get(this))}:function(...e){return Pt(n.apply(Eo(this),e))}}function wg(n){return typeof n=="function"?bg(n):(n instanceof IDBTransaction&&vg(n),pg(n,gg())?new Proxy(n,wo):n)}function Pt(n){if(n instanceof IDBRequest)return yg(n);if(_o.has(n))return _o.get(n);const e=wg(n);return e!==n&&(_o.set(n,e),bo.set(e,n)),e}const Eo=n=>bo.get(n);function Eg(n,e,{blocked:t,upgrade:r,blocking:i,terminated:s}={}){const a=indexedDB.open(n,e),c=Pt(a);return r&&a.addEventListener("upgradeneeded",l=>{r(Pt(a.result),l.oldVersion,l.newVersion,Pt(a.transaction),l)}),t&&a.addEventListener("blocked",l=>t(l.oldVersion,l.newVersion,l)),c.then(l=>{s&&l.addEventListener("close",()=>s()),i&&l.addEventListener("versionchange",u=>i(u.oldVersion,u.newVersion,u))}).catch(()=>{}),c}const Tg=["get","getKey","getAll","getAllKeys","count"],Ig=["put","add","delete","clear"],To=new Map;function Qc(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(To.get(e))return To.get(e);const t=e.replace(/FromIndex$/,""),r=e!==t,i=Ig.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(i||Tg.includes(t)))return;const s=async function(a,...c){const l=this.transaction(a,i?"readwrite":"readonly");let u=l.store;return r&&(u=u.index(c.shift())),(await Promise.all([u[t](...c),i&&l.done]))[0]};return To.set(e,s),s}_g(n=>({...n,get:(e,t,r)=>Qc(e,t)||n.get(e,t,r),has:(e,t)=>!!Qc(e,t)||n.has(e,t)}));/**
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
 */class xg{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(Ag(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function Ag(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Io="@firebase/app",Yc="0.14.11";/**
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
 */const pt=new yo("@firebase/app"),Sg="@firebase/app-compat",Cg="@firebase/analytics-compat",kg="@firebase/analytics",Rg="@firebase/app-check-compat",Pg="@firebase/app-check",Ng="@firebase/auth",Dg="@firebase/auth-compat",Lg="@firebase/database",Vg="@firebase/data-connect",Og="@firebase/database-compat",Mg="@firebase/functions",Fg="@firebase/functions-compat",Ug="@firebase/installations",Bg="@firebase/installations-compat",qg="@firebase/messaging",$g="@firebase/messaging-compat",Hg="@firebase/performance",jg="@firebase/performance-compat",Kg="@firebase/remote-config",zg="@firebase/remote-config-compat",Gg="@firebase/storage",Wg="@firebase/storage-compat",Qg="@firebase/firestore",Yg="@firebase/ai",Xg="@firebase/firestore-compat",Jg="firebase",Zg="12.12.0";/**
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
 */const xo="[DEFAULT]",em={[Io]:"fire-core",[Sg]:"fire-core-compat",[kg]:"fire-analytics",[Cg]:"fire-analytics-compat",[Pg]:"fire-app-check",[Rg]:"fire-app-check-compat",[Ng]:"fire-auth",[Dg]:"fire-auth-compat",[Lg]:"fire-rtdb",[Vg]:"fire-data-connect",[Og]:"fire-rtdb-compat",[Mg]:"fire-fn",[Fg]:"fire-fn-compat",[Ug]:"fire-iid",[Bg]:"fire-iid-compat",[qg]:"fire-fcm",[$g]:"fire-fcm-compat",[Hg]:"fire-perf",[jg]:"fire-perf-compat",[Kg]:"fire-rc",[zg]:"fire-rc-compat",[Gg]:"fire-gcs",[Wg]:"fire-gcs-compat",[Qg]:"fire-fst",[Xg]:"fire-fst-compat",[Yg]:"fire-vertex","fire-js":"fire-js",[Jg]:"fire-js-all"};/**
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
 */const Ui=new Map,tm=new Map,Ao=new Map;function Xc(n,e){try{n.container.addComponent(e)}catch(t){pt.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function On(n){const e=n.name;if(Ao.has(e))return pt.debug(`There were multiple attempts to register component ${e}.`),!1;Ao.set(e,n);for(const t of Ui.values())Xc(t,n);for(const t of tm.values())Xc(t,n);return!0}function So(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function He(n){return n==null?!1:n.settings!==void 0}/**
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
 */const nm={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Nt=new Er("app","Firebase",nm);/**
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
 */class rm{constructor(e,t,r){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new cn("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Nt.create("app-deleted",{appName:this._name})}}/**
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
 */const Mn=Zg;function Jc(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r={name:xo,automaticDataCollectionEnabled:!0,...e},i=r.name;if(typeof i!="string"||!i)throw Nt.create("bad-app-name",{appName:String(i)});if(t||(t=qc()),!t)throw Nt.create("no-options");const s=Ui.get(i);if(s){if(an(t,s.options)&&an(r,s.config))return s;throw Nt.create("duplicate-app",{appName:i})}const a=new lg(i);for(const l of Ao.values())a.addComponent(l);const c=new rm(t,r,a);return Ui.set(i,c),c}function Zc(n=xo){const e=Ui.get(n);if(!e&&n===xo&&qc())return Jc();if(!e)throw Nt.create("no-app",{appName:n});return e}function Dt(n,e,t){let r=em[n]??n;t&&(r+=`-${t}`);const i=r.match(/\s|\//),s=e.match(/\s|\//);if(i||s){const a=[`Unable to register library "${r}" with version "${e}":`];i&&a.push(`library name "${r}" contains illegal characters (whitespace or "/")`),i&&s&&a.push("and"),s&&a.push(`version name "${e}" contains illegal characters (whitespace or "/")`),pt.warn(a.join(" "));return}On(new cn(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
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
 */const im="firebase-heartbeat-database",sm=1,Sr="firebase-heartbeat-store";let Co=null;function el(){return Co||(Co=Eg(im,sm,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Sr)}catch(t){console.warn(t)}}}}).catch(n=>{throw Nt.create("idb-open",{originalErrorMessage:n.message})})),Co}async function om(n){try{const t=(await el()).transaction(Sr),r=await t.objectStore(Sr).get(nl(n));return await t.done,r}catch(e){if(e instanceof ft)pt.warn(e.message);else{const t=Nt.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});pt.warn(t.message)}}}async function tl(n,e){try{const r=(await el()).transaction(Sr,"readwrite");await r.objectStore(Sr).put(e,nl(n)),await r.done}catch(t){if(t instanceof ft)pt.warn(t.message);else{const r=Nt.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});pt.warn(r.message)}}}function nl(n){return`${n.name}!${n.options.appId}`}/**
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
 */const am=1024,cm=30;class lm{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new hm(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=rl();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(a=>a.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats.length>cm){const a=dm(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(a,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){pt.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=rl(),{heartbeatsToSend:r,unsentEntries:i}=um(this._heartbeatsCache.heartbeats),s=Mi(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(t){return pt.warn(t),""}}}function rl(){return new Date().toISOString().substring(0,10)}function um(n,e=am){const t=[];let r=n.slice();for(const i of n){const s=t.find(a=>a.agent===i.agent);if(s){if(s.dates.push(i.date),il(t)>e){s.dates.pop();break}}else if(t.push({agent:i.agent,dates:[i.date]}),il(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class hm{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Xp()?Jp().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await om(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return tl(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return tl(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function il(n){return Mi(JSON.stringify({version:2,heartbeats:n})).length}function dm(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let r=1;r<n.length;r++)n[r].date<t&&(t=n[r].date,e=r);return e}/**
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
 */function fm(n){On(new cn("platform-logger",e=>new xg(e),"PRIVATE")),On(new cn("heartbeat",e=>new lm(e),"PRIVATE")),Dt(Io,Yc,n),Dt(Io,Yc,"esm2020"),Dt("fire-js","")}fm("");var pm="firebase",gm="12.12.0";/**
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
 */Dt(pm,gm,"app");function sl(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const mm=sl,ol=new Er("auth","Firebase",sl());/**
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
 */const Bi=new yo("@firebase/auth");function ym(n,...e){Bi.logLevel<=X.WARN&&Bi.warn(`Auth (${Mn}): ${n}`,...e)}function qi(n,...e){Bi.logLevel<=X.ERROR&&Bi.error(`Auth (${Mn}): ${n}`,...e)}/**
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
 */function Qe(n,...e){throw ko(n,...e)}function tt(n,...e){return ko(n,...e)}function al(n,e,t){const r={...mm(),[e]:t};return new Er("auth","Firebase",r).create(e,{appName:n.name})}function gt(n){return al(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function ko(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return ol.create(n,...e)}function z(n,e,...t){if(!n)throw ko(e,...t)}function mt(n){const e="INTERNAL ASSERTION FAILED: "+n;throw qi(e),new Error(e)}function yt(n,e){n||mt(e)}/**
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
 */function Ro(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.href)||""}function vm(){return cl()==="http:"||cl()==="https:"}function cl(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.protocol)||null}/**
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
 */function _m(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(vm()||Gp()||"connection"in navigator)?navigator.onLine:!0}function bm(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
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
 */class Cr{constructor(e,t){this.shortDelay=e,this.longDelay=t,yt(t>e,"Short delay should be less than long delay!"),this.isMobile=jp()||Wp()}get(){return _m()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function Po(n,e){yt(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
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
 */class ll{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;mt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;mt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;mt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const wm={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const Em=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],Tm=new Cr(3e4,6e4);function Lt(n,e){return n.tenantId&&!e.tenantId?{...e,tenantId:n.tenantId}:e}async function Vt(n,e,t,r,i={}){return ul(n,i,async()=>{let s={},a={};r&&(e==="GET"?a=r:s={body:JSON.stringify(r)});const c=Tr({key:n.config.apiKey,...a}).slice(1),l=await n._getAdditionalHeaders();l["Content-Type"]="application/json",n.languageCode&&(l["X-Firebase-Locale"]=n.languageCode);const u={method:e,headers:l,...s};return zp()||(u.referrerPolicy="no-referrer"),n.emulatorConfig&&Ar(n.emulatorConfig.host)&&(u.credentials="include"),ll.fetch()(await hl(n,n.config.apiHost,t,c),u)})}async function ul(n,e,t){n._canInitEmulator=!1;const r={...wm,...e};try{const i=new xm(n),s=await Promise.race([t(),i.promise]);i.clearNetworkTimeout();const a=await s.json();if("needConfirmation"in a)throw $i(n,"account-exists-with-different-credential",a);if(s.ok&&!("errorMessage"in a))return a;{const c=s.ok?a.errorMessage:a.error.message,[l,u]=c.split(" : ");if(l==="FEDERATED_USER_ID_ALREADY_LINKED")throw $i(n,"credential-already-in-use",a);if(l==="EMAIL_EXISTS")throw $i(n,"email-already-in-use",a);if(l==="USER_DISABLED")throw $i(n,"user-disabled",a);const f=r[l]||l.toLowerCase().replace(/[_\s]+/g,"-");if(u)throw al(n,f,u);Qe(n,f)}}catch(i){if(i instanceof ft)throw i;Qe(n,"network-request-failed",{message:String(i)})}}async function kr(n,e,t,r,i={}){const s=await Vt(n,e,t,r,i);return"mfaPendingCredential"in s&&Qe(n,"multi-factor-auth-required",{_serverResponse:s}),s}async function hl(n,e,t,r){const i=`${e}${t}?${r}`,s=n,a=s.config.emulator?Po(n.config,i):`${n.config.apiScheme}://${i}`;return Em.includes(t)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(a).toString():a}function Im(n){switch(n){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class xm{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(tt(this.auth,"network-request-failed")),Tm.get())})}}function $i(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const i=tt(n,e,r);return i.customData._tokenResponse=t,i}function dl(n){return n!==void 0&&n.enterprise!==void 0}class Am{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return Im(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function Sm(n,e){return Vt(n,"GET","/v2/recaptchaConfig",Lt(n,e))}/**
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
 */async function Cm(n,e){return Vt(n,"POST","/v1/accounts:delete",e)}async function Hi(n,e){return Vt(n,"POST","/v1/accounts:lookup",e)}/**
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
 */function Rr(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function km(n,e=!1){const t=Pe(n),r=await t.getIdToken(e),i=Do(r);z(i&&i.exp&&i.auth_time&&i.iat,t.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,a=s==null?void 0:s.sign_in_provider;return{claims:i,token:r,authTime:Rr(No(i.auth_time)),issuedAtTime:Rr(No(i.iat)),expirationTime:Rr(No(i.exp)),signInProvider:a||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function No(n){return Number(n)*1e3}function Do(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return qi("JWT malformed, contained fewer than 3 sections"),null;try{const i=Uc(t);return i?JSON.parse(i):(qi("Failed to decode base64 JWT payload"),null)}catch(i){return qi("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function fl(n){const e=Do(n);return z(e,"internal-error"),z(typeof e.exp<"u","internal-error"),z(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function Pr(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof ft&&Rm(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function Rm({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
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
 */class Pm{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const r=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,r)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class Lo{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Rr(this.lastLoginAt),this.creationTime=Rr(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function ji(n){var p;const e=n.auth,t=await n.getIdToken(),r=await Pr(n,Hi(e,{idToken:t}));z(r==null?void 0:r.users.length,e,"internal-error");const i=r.users[0];n._notifyReloadListener(i);const s=(p=i.providerUserInfo)!=null&&p.length?pl(i.providerUserInfo):[],a=Dm(n.providerData,s),c=n.isAnonymous,l=!(n.email&&i.passwordHash)&&!(a!=null&&a.length),u=c?l:!1,f={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:a,metadata:new Lo(i.createdAt,i.lastLoginAt),isAnonymous:u};Object.assign(n,f)}async function Nm(n){const e=Pe(n);await ji(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function Dm(n,e){return[...n.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function pl(n){return n.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
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
 */async function Lm(n,e){const t=await ul(n,{},async()=>{const r=Tr({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=n.config,a=await hl(n,i,"/v1/token",`key=${s}`),c=await n._getAdditionalHeaders();c["Content-Type"]="application/x-www-form-urlencoded";const l={method:"POST",headers:c,body:r};return n.emulatorConfig&&Ar(n.emulatorConfig.host)&&(l.credentials="include"),ll.fetch()(a,l)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function Vm(n,e){return Vt(n,"POST","/v2/accounts:revokeToken",Lt(n,e))}/**
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
 */class Fn{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){z(e.idToken,"internal-error"),z(typeof e.idToken<"u","internal-error"),z(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):fl(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){z(e.length!==0,"internal-error");const t=fl(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(z(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:i,expiresIn:s}=await Lm(e,t);this.updateTokensAndExpiration(r,i,Number(s))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:i,expirationTime:s}=t,a=new Fn;return r&&(z(typeof r=="string","internal-error",{appName:e}),a.refreshToken=r),i&&(z(typeof i=="string","internal-error",{appName:e}),a.accessToken=i),s&&(z(typeof s=="number","internal-error",{appName:e}),a.expirationTime=s),a}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Fn,this.toJSON())}_performRefresh(){return mt("not implemented")}}/**
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
 */function Ot(n,e){z(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class Ye{constructor({uid:e,auth:t,stsTokenManager:r,...i}){this.providerId="firebase",this.proactiveRefresh=new Pm(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new Lo(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const t=await Pr(this,this.stsTokenManager.getToken(this.auth,e));return z(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return km(this,e)}reload(){return Nm(this)}_assign(e){this!==e&&(z(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new Ye({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){z(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await ji(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(He(this.auth.app))return Promise.reject(gt(this.auth));const e=await this.getIdToken();return await Pr(this,Cm(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const r=t.displayName??void 0,i=t.email??void 0,s=t.phoneNumber??void 0,a=t.photoURL??void 0,c=t.tenantId??void 0,l=t._redirectEventId??void 0,u=t.createdAt??void 0,f=t.lastLoginAt??void 0,{uid:p,emailVerified:y,isAnonymous:A,providerData:E,stsTokenManager:w}=t;z(p&&w,e,"internal-error");const x=Fn.fromJSON(this.name,w);z(typeof p=="string",e,"internal-error"),Ot(r,e.name),Ot(i,e.name),z(typeof y=="boolean",e,"internal-error"),z(typeof A=="boolean",e,"internal-error"),Ot(s,e.name),Ot(a,e.name),Ot(c,e.name),Ot(l,e.name),Ot(u,e.name),Ot(f,e.name);const R=new Ye({uid:p,auth:e,email:i,emailVerified:y,displayName:r,isAnonymous:A,photoURL:a,phoneNumber:s,tenantId:c,stsTokenManager:x,createdAt:u,lastLoginAt:f});return E&&Array.isArray(E)&&(R.providerData=E.map(P=>({...P}))),l&&(R._redirectEventId=l),R}static async _fromIdTokenResponse(e,t,r=!1){const i=new Fn;i.updateFromServerResponse(t);const s=new Ye({uid:t.localId,auth:e,stsTokenManager:i,isAnonymous:r});return await ji(s),s}static async _fromGetAccountInfoResponse(e,t,r){const i=t.users[0];z(i.localId!==void 0,"internal-error");const s=i.providerUserInfo!==void 0?pl(i.providerUserInfo):[],a=!(i.email&&i.passwordHash)&&!(s!=null&&s.length),c=new Fn;c.updateFromIdToken(r);const l=new Ye({uid:i.localId,auth:e,stsTokenManager:c,isAnonymous:a}),u={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new Lo(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(s!=null&&s.length)};return Object.assign(l,u),l}}/**
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
 */const gl=new Map;function vt(n){yt(n instanceof Function,"Expected a class definition");let e=gl.get(n);return e?(yt(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,gl.set(n,e),e)}/**
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
 */class ml{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}ml.type="NONE";const yl=ml;/**
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
 */function Ki(n,e,t){return`firebase:${n}:${e}:${t}`}class Un{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:i,name:s}=this.auth;this.fullUserKey=Ki(this.userKey,i.apiKey,s),this.fullPersistenceKey=Ki("persistence",i.apiKey,s),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await Hi(this.auth,{idToken:e}).catch(()=>{});return t?Ye._fromGetAccountInfoResponse(this.auth,t,e):null}return Ye._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new Un(vt(yl),e,r);const i=(await Promise.all(t.map(async u=>{if(await u._isAvailable())return u}))).filter(u=>u);let s=i[0]||vt(yl);const a=Ki(r,e.config.apiKey,e.name);let c=null;for(const u of t)try{const f=await u._get(a);if(f){let p;if(typeof f=="string"){const y=await Hi(e,{idToken:f}).catch(()=>{});if(!y)break;p=await Ye._fromGetAccountInfoResponse(e,y,f)}else p=Ye._fromJSON(e,f);u!==s&&(c=p),s=u;break}}catch{}const l=i.filter(u=>u._shouldAllowMigration);return!s._shouldAllowMigration||!l.length?new Un(s,e,r):(s=l[0],c&&await s._set(a,c.toJSON()),await Promise.all(t.map(async u=>{if(u!==s)try{await u._remove(a)}catch{}})),new Un(s,e,r))}}/**
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
 */function vl(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(El(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(_l(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Il(e))return"Blackberry";if(xl(e))return"Webos";if(bl(e))return"Safari";if((e.includes("chrome/")||wl(e))&&!e.includes("edge/"))return"Chrome";if(Tl(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function _l(n=Ie()){return/firefox\//i.test(n)}function bl(n=Ie()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function wl(n=Ie()){return/crios\//i.test(n)}function El(n=Ie()){return/iemobile/i.test(n)}function Tl(n=Ie()){return/android/i.test(n)}function Il(n=Ie()){return/blackberry/i.test(n)}function xl(n=Ie()){return/webos/i.test(n)}function Vo(n=Ie()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function Om(n=Ie()){var e;return Vo(n)&&!!((e=window.navigator)!=null&&e.standalone)}function Mm(){return Qp()&&document.documentMode===10}function Al(n=Ie()){return Vo(n)||Tl(n)||xl(n)||Il(n)||/windows phone/i.test(n)||El(n)}/**
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
 */function Sl(n,e=[]){let t;switch(n){case"Browser":t=vl(Ie());break;case"Worker":t=`${vl(Ie())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${Mn}/${r}`}/**
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
 */class Fm{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=s=>new Promise((a,c)=>{try{const l=e(s);a(l)}catch(l){c(l)}});r.onAbort=t,this.queue.push(r);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const i of t)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
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
 */async function Um(n,e={}){return Vt(n,"GET","/v2/passwordPolicy",Lt(n,e))}/**
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
 */const Bm=6;class qm{constructor(e){var r;const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??Bm,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((r=e.allowedNonAlphanumericCharacters)==null?void 0:r.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),i&&(t.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let i=0;i<e.length;i++)r=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
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
 */class $m{constructor(e,t,r,i){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Cl(this),this.idTokenSubscription=new Cl(this),this.beforeStateQueue=new Fm(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=ol,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=vt(t)),this._initializationPromise=this.queue(async()=>{var r,i,s;if(!this._deleted&&(this.persistenceManager=await Un.create(this,e),(r=this._resolvePersistenceManagerAvailable)==null||r.call(this),!this._deleted)){if((i=this._popupRedirectResolver)!=null&&i._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((s=this.currentUser)==null?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Hi(this,{idToken:e}),r=await Ye._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var s;if(He(this.app)){const a=this.app.settings.authIdToken;return a?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(a).then(c,c))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let r=t,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const a=(s=this.redirectUser)==null?void 0:s._redirectEventId,c=r==null?void 0:r._redirectEventId,l=await this.tryRedirectSignIn(e);(!a||a===c)&&(l!=null&&l.user)&&(r=l.user,i=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(r)}catch(a){r=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(a))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return z(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await ji(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=bm()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(He(this.app))return Promise.reject(gt(this));const t=e?Pe(e):null;return t&&z(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&z(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return He(this.app)?Promise.reject(gt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return He(this.app)?Promise.reject(gt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(vt(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Um(this),t=new qm(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Er("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await Vm(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&vt(e)||this._popupRedirectResolver;z(t,this,"argument-error"),this.redirectPersistenceManager=await Un.create(this,[vt(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)==null?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)==null?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((t=this.currentUser)==null?void 0:t.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,i){if(this._deleted)return()=>{};const s=typeof t=="function"?t:t.next.bind(t);let a=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(z(c,this,"internal-error"),c.then(()=>{a||s(this.currentUser)}),typeof t=="function"){const l=e.addObserver(t,r,i);return()=>{a=!0,l()}}else{const l=e.addObserver(t);return()=>{a=!0,l()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return z(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Sl(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var i;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await((i=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:i.getHeartbeatsHeader());t&&(e["X-Firebase-Client"]=t);const r=await this._getAppCheckToken();return r&&(e["X-Firebase-AppCheck"]=r),e}async _getAppCheckToken(){var t;if(He(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((t=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:t.getToken());return e!=null&&e.error&&ym(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function un(n){return Pe(n)}class Cl{constructor(e){this.auth=e,this.observer=null,this.addObserver=rg(t=>this.observer=t)}get next(){return z(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let zi={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Hm(n){zi=n}function kl(n){return zi.loadJS(n)}function jm(){return zi.recaptchaEnterpriseScript}function Km(){return zi.gapiScript}function zm(n){return`__${n}${Math.floor(Math.random()*1e6)}`}class Gm{constructor(){this.enterprise=new Wm}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class Wm{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}const Qm="recaptcha-enterprise",Rl="NO_RECAPTCHA";class Ym{constructor(e){this.type=Qm,this.auth=un(e)}async verify(e="verify",t=!1){async function r(s){if(!t){if(s.tenantId==null&&s._agentRecaptchaConfig!=null)return s._agentRecaptchaConfig.siteKey;if(s.tenantId!=null&&s._tenantRecaptchaConfigs[s.tenantId]!==void 0)return s._tenantRecaptchaConfigs[s.tenantId].siteKey}return new Promise(async(a,c)=>{Sm(s,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(l=>{if(l.recaptchaKey===void 0)c(new Error("recaptcha Enterprise site key undefined"));else{const u=new Am(l);return s.tenantId==null?s._agentRecaptchaConfig=u:s._tenantRecaptchaConfigs[s.tenantId]=u,a(u.siteKey)}}).catch(l=>{c(l)})})}function i(s,a,c){const l=window.grecaptcha;dl(l)?l.enterprise.ready(()=>{l.enterprise.execute(s,{action:e}).then(u=>{a(u)}).catch(()=>{a(Rl)})}):c(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new Gm().execute("siteKey",{action:"verify"}):new Promise((s,a)=>{r(this.auth).then(c=>{if(!t&&dl(window.grecaptcha))i(c,s,a);else{if(typeof window>"u"){a(new Error("RecaptchaVerifier is only supported in browser"));return}let l=jm();l.length!==0&&(l+=c),kl(l).then(()=>{i(c,s,a)}).catch(u=>{a(u)})}}).catch(c=>{a(c)})})}}async function Pl(n,e,t,r=!1,i=!1){const s=new Ym(n);let a;if(i)a=Rl;else try{a=await s.verify(t)}catch{a=await s.verify(t,!0)}const c={...e};if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in c){const l=c.phoneEnrollmentInfo.phoneNumber,u=c.phoneEnrollmentInfo.recaptchaToken;Object.assign(c,{phoneEnrollmentInfo:{phoneNumber:l,recaptchaToken:u,captchaResponse:a,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in c){const l=c.phoneSignInInfo.recaptchaToken;Object.assign(c,{phoneSignInInfo:{recaptchaToken:l,captchaResponse:a,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return c}return r?Object.assign(c,{captchaResp:a}):Object.assign(c,{captchaResponse:a}),Object.assign(c,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(c,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),c}async function Oo(n,e,t,r,i){var s;if((s=n._getRecaptchaConfig())!=null&&s.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const a=await Pl(n,e,t,t==="getOobCode");return r(n,a)}else return r(n,e).catch(async a=>{if(a.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const c=await Pl(n,e,t,t==="getOobCode");return r(n,c)}else return Promise.reject(a)})}/**
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
 */function Xm(n,e){const t=So(n,"auth");if(t.isInitialized()){const i=t.getImmediate(),s=t.getOptions();if(an(s,e??{}))return i;Qe(i,"already-initialized")}return t.initialize({options:e})}function Jm(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(vt);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function Zm(n,e,t){const r=un(n);z(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const i=!1,s=Nl(e),{host:a,port:c}=ey(e),l=c===null?"":`:${c}`,u={url:`${s}//${a}${l}/`},f=Object.freeze({host:a,port:c,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:i})});if(!r._canInitEmulator){z(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),z(an(u,r.config.emulator)&&an(f,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=u,r.emulatorConfig=f,r.settings.appVerificationDisabledForTesting=!0,Ar(a)?jc(`${s}//${a}${l}`):ty()}function Nl(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function ey(n){const e=Nl(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(r);if(i){const s=i[1];return{host:s,port:Dl(r.substr(s.length+1))}}else{const[s,a]=r.split(":");return{host:s,port:Dl(a)}}}function Dl(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function ty(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
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
 */class Mo{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return mt("not implemented")}_getIdTokenResponse(e){return mt("not implemented")}_linkToIdToken(e,t){return mt("not implemented")}_getReauthenticationResolver(e){return mt("not implemented")}}async function ny(n,e){return Vt(n,"POST","/v1/accounts:signUp",e)}/**
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
 */async function ry(n,e){return kr(n,"POST","/v1/accounts:signInWithPassword",Lt(n,e))}/**
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
 */async function iy(n,e){return kr(n,"POST","/v1/accounts:signInWithEmailLink",Lt(n,e))}async function sy(n,e){return kr(n,"POST","/v1/accounts:signInWithEmailLink",Lt(n,e))}/**
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
 */class Nr extends Mo{constructor(e,t,r,i=null){super("password",r),this._email=e,this._password=t,this._tenantId=i}static _fromEmailAndPassword(e,t){return new Nr(e,t,"password")}static _fromEmailAndCode(e,t,r=null){return new Nr(e,t,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Oo(e,t,"signInWithPassword",ry);case"emailLink":return iy(e,{email:this._email,oobCode:this._password});default:Qe(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const r={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Oo(e,r,"signUpPassword",ny);case"emailLink":return sy(e,{idToken:t,email:this._email,oobCode:this._password});default:Qe(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
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
 */async function Bn(n,e){return kr(n,"POST","/v1/accounts:signInWithIdp",Lt(n,e))}/**
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
 */const oy="http://localhost";class hn extends Mo{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new hn(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):Qe("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i,...s}=t;if(!r||!i)return null;const a=new hn(r,i);return a.idToken=s.idToken||void 0,a.accessToken=s.accessToken||void 0,a.secret=s.secret,a.nonce=s.nonce,a.pendingToken=s.pendingToken||null,a}_getIdTokenResponse(e){const t=this.buildRequest();return Bn(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,Bn(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Bn(e,t)}buildRequest(){const e={requestUri:oy,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=Tr(t)}return e}}/**
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
 */function ay(n){switch(n){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function cy(n){const e=Ir(xr(n)).link,t=e?Ir(xr(e)).deep_link_id:null,r=Ir(xr(n)).deep_link_id;return(r?Ir(xr(r)).link:null)||r||t||e||n}class Fo{constructor(e){const t=Ir(xr(e)),r=t.apiKey??null,i=t.oobCode??null,s=ay(t.mode??null);z(r&&i&&s,"argument-error"),this.apiKey=r,this.operation=s,this.code=i,this.continueUrl=t.continueUrl??null,this.languageCode=t.lang??null,this.tenantId=t.tenantId??null}static parseLink(e){const t=cy(e);try{return new Fo(t)}catch{return null}}}/**
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
 */class qn{constructor(){this.providerId=qn.PROVIDER_ID}static credential(e,t){return Nr._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const r=Fo.parseLink(t);return z(r,"argument-error"),Nr._fromEmailAndCode(e,r.code,r.tenantId)}}qn.PROVIDER_ID="password",qn.EMAIL_PASSWORD_SIGN_IN_METHOD="password",qn.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
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
 */class Ll{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class Dr extends Ll{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
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
 */class Mt extends Dr{constructor(){super("facebook.com")}static credential(e){return hn._fromParams({providerId:Mt.PROVIDER_ID,signInMethod:Mt.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Mt.credentialFromTaggedObject(e)}static credentialFromError(e){return Mt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Mt.credential(e.oauthAccessToken)}catch{return null}}}Mt.FACEBOOK_SIGN_IN_METHOD="facebook.com",Mt.PROVIDER_ID="facebook.com";/**
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
 */class Ft extends Dr{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return hn._fromParams({providerId:Ft.PROVIDER_ID,signInMethod:Ft.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return Ft.credentialFromTaggedObject(e)}static credentialFromError(e){return Ft.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return Ft.credential(t,r)}catch{return null}}}Ft.GOOGLE_SIGN_IN_METHOD="google.com",Ft.PROVIDER_ID="google.com";/**
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
 */class Ut extends Dr{constructor(){super("github.com")}static credential(e){return hn._fromParams({providerId:Ut.PROVIDER_ID,signInMethod:Ut.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Ut.credentialFromTaggedObject(e)}static credentialFromError(e){return Ut.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Ut.credential(e.oauthAccessToken)}catch{return null}}}Ut.GITHUB_SIGN_IN_METHOD="github.com",Ut.PROVIDER_ID="github.com";/**
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
 */class Bt extends Dr{constructor(){super("twitter.com")}static credential(e,t){return hn._fromParams({providerId:Bt.PROVIDER_ID,signInMethod:Bt.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return Bt.credentialFromTaggedObject(e)}static credentialFromError(e){return Bt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return Bt.credential(t,r)}catch{return null}}}Bt.TWITTER_SIGN_IN_METHOD="twitter.com",Bt.PROVIDER_ID="twitter.com";/**
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
 */async function ly(n,e){return kr(n,"POST","/v1/accounts:signUp",Lt(n,e))}/**
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
 */class dn{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,i=!1){const s=await Ye._fromIdTokenResponse(e,r,i),a=Vl(r);return new dn({user:s,providerId:a,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const i=Vl(r);return new dn({user:e,providerId:i,_tokenResponse:r,operationType:t})}}function Vl(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
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
 */class Gi extends ft{constructor(e,t,r,i){super(t.code,t.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,Gi.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,i){return new Gi(e,t,r,i)}}function Ol(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?Gi._fromErrorAndOperation(n,s,e,r):s})}async function uy(n,e,t=!1){const r=await Pr(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return dn._forOperation(n,"link",r)}/**
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
 */async function hy(n,e,t=!1){const{auth:r}=n;if(He(r.app))return Promise.reject(gt(r));const i="reauthenticate";try{const s=await Pr(n,Ol(r,i,e,n),t);z(s.idToken,r,"internal-error");const a=Do(s.idToken);z(a,r,"internal-error");const{sub:c}=a;return z(n.uid===c,r,"user-mismatch"),dn._forOperation(n,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&Qe(r,"user-mismatch"),s}}/**
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
 */async function Ml(n,e,t=!1){if(He(n.app))return Promise.reject(gt(n));const r="signIn",i=await Ol(n,r,e),s=await dn._fromIdTokenResponse(n,r,i);return t||await n._updateCurrentUser(s.user),s}async function dy(n,e){return Ml(un(n),e)}/**
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
 */async function Fl(n){const e=un(n);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function fy(n,e,t){if(He(n.app))return Promise.reject(gt(n));const r=un(n),a=await Oo(r,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",ly).catch(l=>{throw l.code==="auth/password-does-not-meet-requirements"&&Fl(n),l}),c=await dn._fromIdTokenResponse(r,"signIn",a);return await r._updateCurrentUser(c.user),c}function py(n,e,t){return He(n.app)?Promise.reject(gt(n)):dy(Pe(n),qn.credential(e,t)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&Fl(n),r})}function gy(n,e,t,r){return Pe(n).onIdTokenChanged(e,t,r)}function my(n,e,t){return Pe(n).beforeAuthStateChanged(e,t)}function yy(n,e,t,r){return Pe(n).onAuthStateChanged(e,t,r)}function vy(n){return Pe(n).signOut()}const Wi="__sak";/**
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
 */class Ul{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Wi,"1"),this.storage.removeItem(Wi),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const _y=1e3,by=10;class Bl extends Ul{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Al(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),i=this.localCache[t];r!==i&&e(t,i,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((a,c,l)=>{this.notifyListeners(a,l)});return}const r=e.key;t?this.detachListener():this.stopPolling();const i=()=>{const a=this.storage.getItem(r);!t&&this.localCache[r]===a||this.notifyListeners(r,a)},s=this.storage.getItem(r);Mm()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,by):i()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},_y)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}Bl.type="LOCAL";const wy=Bl;/**
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
 */class ql extends Ul{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}ql.type="SESSION";const $l=ql;/**
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
 */function Ey(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
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
 */class Qi{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(i=>i.isListeningto(e));if(t)return t;const r=new Qi(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:i,data:s}=t.data,a=this.handlersMap[i];if(!(a!=null&&a.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:i});const c=Array.from(a).map(async u=>u(t.origin,s)),l=await Ey(c);t.ports[0].postMessage({status:"done",eventId:r,eventType:i,response:l})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Qi.receivers=[];/**
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
 */function Uo(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
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
 */class Ty{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,a;return new Promise((c,l)=>{const u=Uo("",20);i.port1.start();const f=setTimeout(()=>{l(new Error("unsupported_event"))},r);a={messageChannel:i,onMessage(p){const y=p;if(y.data.eventId===u)switch(y.data.status){case"ack":clearTimeout(f),s=setTimeout(()=>{l(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),c(y.data.response);break;default:clearTimeout(f),clearTimeout(s),l(new Error("invalid_response"));break}}},this.handlers.add(a),i.port1.addEventListener("message",a.onMessage),this.target.postMessage({eventType:e,eventId:u,data:t},[i.port2])}).finally(()=>{a&&this.removeMessageHandler(a)})}}/**
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
 */function nt(){return window}function Iy(n){nt().location.href=n}/**
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
 */function Hl(){return typeof nt().WorkerGlobalScope<"u"&&typeof nt().importScripts=="function"}async function xy(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function Ay(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)==null?void 0:n.controller)||null}function Sy(){return Hl()?self:null}/**
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
 */const jl="firebaseLocalStorageDb",Cy=1,Yi="firebaseLocalStorage",Kl="fbase_key";class Lr{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function Xi(n,e){return n.transaction([Yi],e?"readwrite":"readonly").objectStore(Yi)}function ky(){const n=indexedDB.deleteDatabase(jl);return new Lr(n).toPromise()}function Bo(){const n=indexedDB.open(jl,Cy);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(Yi,{keyPath:Kl})}catch(i){t(i)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(Yi)?e(r):(r.close(),await ky(),e(await Bo()))})})}async function zl(n,e,t){const r=Xi(n,!0).put({[Kl]:e,value:t});return new Lr(r).toPromise()}async function Ry(n,e){const t=Xi(n,!1).get(e),r=await new Lr(t).toPromise();return r===void 0?null:r.value}function Gl(n,e){const t=Xi(n,!0).delete(e);return new Lr(t).toPromise()}const Py=800,Ny=3;class Wl{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Bo(),this.db)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>Ny)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return Hl()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Qi._getInstance(Sy()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var t,r;if(this.activeServiceWorker=await xy(),!this.activeServiceWorker)return;this.sender=new Ty(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(t=e[0])!=null&&t.fulfilled&&(r=e[0])!=null&&r.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||Ay()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await Bo();return await zl(e,Wi,"1"),await Gl(e,Wi),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>zl(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>Ry(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Gl(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(i=>{const s=Xi(i,!1).getAll();return new Lr(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:i,value:s}of e)r.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),t.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!r.has(i)&&(this.notifyListeners(i,null),t.push(i));return t}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),Py)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}Wl.type="LOCAL";const Dy=Wl;new Cr(3e4,6e4);/**
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
 */function Ly(n,e){return e?vt(e):(z(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
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
 */class qo extends Mo{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Bn(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Bn(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Bn(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function Vy(n){return Ml(n.auth,new qo(n),n.bypassAuthState)}function Oy(n){const{auth:e,user:t}=n;return z(t,e,"internal-error"),hy(t,new qo(n),n.bypassAuthState)}async function My(n){const{auth:e,user:t}=n;return z(t,e,"internal-error"),uy(t,new qo(n),n.bypassAuthState)}/**
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
 */class Ql{constructor(e,t,r,i,s=!1){this.auth=e,this.resolver=r,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:i,tenantId:s,error:a,type:c}=e;if(a){this.reject(a);return}const l={auth:this.auth,requestUri:t,sessionId:r,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(l))}catch(u){this.reject(u)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return Vy;case"linkViaPopup":case"linkViaRedirect":return My;case"reauthViaPopup":case"reauthViaRedirect":return Oy;default:Qe(this.auth,"internal-error")}}resolve(e){yt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){yt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const Fy=new Cr(2e3,1e4);class $n extends Ql{constructor(e,t,r,i,s){super(e,t,i,s),this.provider=r,this.authWindow=null,this.pollId=null,$n.currentPopupAction&&$n.currentPopupAction.cancel(),$n.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return z(e,this.auth,"internal-error"),e}async onExecution(){yt(this.filter.length===1,"Popup operations only handle one event");const e=Uo();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(tt(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(tt(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,$n.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if((r=(t=this.authWindow)==null?void 0:t.window)!=null&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(tt(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,Fy.get())};e()}}$n.currentPopupAction=null;/**
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
 */const Uy="pendingRedirect",Ji=new Map;class By extends Ql{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=Ji.get(this.auth._key());if(!e){try{const r=await qy(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}Ji.set(this.auth._key(),e)}return this.bypassAuthState||Ji.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function qy(n,e){const t=jy(e),r=Hy(n);if(!await r._isAvailable())return!1;const i=await r._get(t)==="true";return await r._remove(t),i}function $y(n,e){Ji.set(n._key(),e)}function Hy(n){return vt(n._redirectPersistence)}function jy(n){return Ki(Uy,n.config.apiKey,n.name)}async function Ky(n,e,t=!1){if(He(n.app))return Promise.reject(gt(n));const r=un(n),i=Ly(r,e),a=await new By(r,i,t).execute();return a&&!t&&(delete a.user._redirectEventId,await r._persistUserIfCurrent(a.user),await r._setRedirectUser(null,e)),a}/**
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
 */const zy=10*60*1e3;class Gy{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!Wy(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!Xl(e)){const i=((r=e.error.code)==null?void 0:r.split("auth/")[1])||"internal-error";t.onError(tt(this.auth,i))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=zy&&this.cachedEventUids.clear(),this.cachedEventUids.has(Yl(e))}saveEventToCache(e){this.cachedEventUids.add(Yl(e)),this.lastProcessedEventTime=Date.now()}}function Yl(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function Xl({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function Wy(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Xl(n);default:return!1}}/**
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
 */async function Qy(n,e={}){return Vt(n,"GET","/v1/projects",e)}/**
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
 */const Yy=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Xy=/^https?/;async function Jy(n){if(n.config.emulator)return;const{authorizedDomains:e}=await Qy(n);for(const t of e)try{if(Zy(t))return}catch{}Qe(n,"unauthorized-domain")}function Zy(n){const e=Ro(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const a=new URL(n);return a.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&a.hostname===r}if(!Xy.test(t))return!1;if(Yy.test(n))return r===n;const i=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(r)}/**
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
 */const ev=new Cr(3e4,6e4);function Jl(){const n=nt().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function tv(n){return new Promise((e,t)=>{var i,s,a;function r(){Jl(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Jl(),t(tt(n,"network-request-failed"))},timeout:ev.get()})}if((s=(i=nt().gapi)==null?void 0:i.iframes)!=null&&s.Iframe)e(gapi.iframes.getContext());else if((a=nt().gapi)!=null&&a.load)r();else{const c=zm("iframefcb");return nt()[c]=()=>{gapi.load?r():t(tt(n,"network-request-failed"))},kl(`${Km()}?onload=${c}`).catch(l=>t(l))}}).catch(e=>{throw Zi=null,e})}let Zi=null;function nv(n){return Zi=Zi||tv(n),Zi}/**
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
 */const rv=new Cr(5e3,15e3),iv="__/auth/iframe",sv="emulator/auth/iframe",ov={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},av=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function cv(n){const e=n.config;z(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Po(e,sv):`https://${n.config.authDomain}/${iv}`,r={apiKey:e.apiKey,appName:n.name,v:Mn},i=av.get(n.config.apiHost);i&&(r.eid=i);const s=n._getFrameworks();return s.length&&(r.fw=s.join(",")),`${t}?${Tr(r).slice(1)}`}async function lv(n){const e=await nv(n),t=nt().gapi;return z(t,n,"internal-error"),e.open({where:document.body,url:cv(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:ov,dontclear:!0},r=>new Promise(async(i,s)=>{await r.restyle({setHideOnLeave:!1});const a=tt(n,"network-request-failed"),c=nt().setTimeout(()=>{s(a)},rv.get());function l(){nt().clearTimeout(c),i(r)}r.ping(l).then(l,()=>{s(a)})}))}/**
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
 */const uv={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},hv=500,dv=600,fv="_blank",pv="http://localhost";class Zl{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function gv(n,e,t,r=hv,i=dv){const s=Math.max((window.screen.availHeight-i)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString();let c="";const l={...uv,width:r.toString(),height:i.toString(),top:s,left:a},u=Ie().toLowerCase();t&&(c=wl(u)?fv:t),_l(u)&&(e=e||pv,l.scrollbars="yes");const f=Object.entries(l).reduce((y,[A,E])=>`${y}${A}=${E},`,"");if(Om(u)&&c!=="_self")return mv(e||"",c),new Zl(null);const p=window.open(e||"",c,f);z(p,n,"popup-blocked");try{p.focus()}catch{}return new Zl(p)}function mv(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
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
 */const yv="__/auth/handler",vv="emulator/auth/handler",_v=encodeURIComponent("fac");async function eu(n,e,t,r,i,s){z(n.config.authDomain,n,"auth-domain-config-required"),z(n.config.apiKey,n,"invalid-api-key");const a={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:Mn,eventId:i};if(e instanceof Ll){e.setDefaultLanguage(n.languageCode),a.providerId=e.providerId||"",ng(e.getCustomParameters())||(a.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,p]of Object.entries({}))a[f]=p}if(e instanceof Dr){const f=e.getScopes().filter(p=>p!=="");f.length>0&&(a.scopes=f.join(","))}n.tenantId&&(a.tid=n.tenantId);const c=a;for(const f of Object.keys(c))c[f]===void 0&&delete c[f];const l=await n._getAppCheckToken(),u=l?`#${_v}=${encodeURIComponent(l)}`:"";return`${bv(n)}?${Tr(c).slice(1)}${u}`}function bv({config:n}){return n.emulator?Po(n,vv):`https://${n.authDomain}/${yv}`}/**
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
 */const $o="webStorageSupport";class wv{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=$l,this._completeRedirectFn=Ky,this._overrideRedirectResult=$y}async _openPopup(e,t,r,i){var a;yt((a=this.eventManagers[e._key()])==null?void 0:a.manager,"_initialize() not called before _openPopup()");const s=await eu(e,t,r,Ro(),i);return gv(e,s,Uo())}async _openRedirect(e,t,r,i){await this._originValidation(e);const s=await eu(e,t,r,Ro(),i);return Iy(s),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:i,promise:s}=this.eventManagers[t];return i?Promise.resolve(i):(yt(s,"If manager is not set, promise should be"),s)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await lv(e),r=new Gy(e);return t.register("authEvent",i=>(z(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:r.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send($o,{type:$o},i=>{var a;const s=(a=i==null?void 0:i[0])==null?void 0:a[$o];s!==void 0&&t(!!s),Qe(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=Jy(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Al()||bl()||Vo()}}const Ev=wv;var tu="@firebase/auth",nu="1.13.0";/**
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
 */class Tv{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){z(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function Iv(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function xv(n){On(new cn("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:a,authDomain:c}=r.options;z(a&&!a.includes(":"),"invalid-api-key",{appName:r.name});const l={apiKey:a,authDomain:c,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Sl(n)},u=new $m(r,i,s,l);return Jm(u,t),u},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),On(new cn("auth-internal",e=>{const t=un(e.getProvider("auth").getImmediate());return(r=>new Tv(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),Dt(tu,nu,Iv(n)),Dt(tu,nu,"esm2020")}/**
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
 */const Av=5*60,Sv=$c("authIdTokenMaxAge")||Av;let ru=null;const Cv=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>Sv)return;const i=t==null?void 0:t.token;ru!==i&&(ru=i,await fetch(n,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function kv(n=Zc()){const e=So(n,"auth");if(e.isInitialized())return e.getImmediate();const t=Xm(n,{popupRedirectResolver:Ev,persistence:[Dy,wy,$l]}),r=$c("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const s=new URL(r,location.origin);if(location.origin===s.origin){const a=Cv(s.toString());my(t,a,()=>a(t.currentUser)),gy(t,c=>a(c))}}const i=Bc("auth");return i&&Zm(t,`http://${i}`),t}function Rv(){var n;return((n=document.getElementsByTagName("head"))==null?void 0:n[0])??document}Hm({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=i=>{const s=tt("internal-error");s.customData=i,t(s)},r.type="text/javascript",r.charset="UTF-8",Rv().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="}),xv("Browser");var iu=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var qt,su;(function(){var n;/** @license

   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */function e(_,m){function v(){}v.prototype=m.prototype,_.F=m.prototype,_.prototype=new v,_.prototype.constructor=_,_.D=function(T,I,S){for(var b=Array(arguments.length-2),se=2;se<arguments.length;se++)b[se-2]=arguments[se];return m.prototype[I].apply(T,b)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(r,t),r.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function i(_,m,v){v||(v=0);const T=Array(16);if(typeof m=="string")for(var I=0;I<16;++I)T[I]=m.charCodeAt(v++)|m.charCodeAt(v++)<<8|m.charCodeAt(v++)<<16|m.charCodeAt(v++)<<24;else for(I=0;I<16;++I)T[I]=m[v++]|m[v++]<<8|m[v++]<<16|m[v++]<<24;m=_.g[0],v=_.g[1],I=_.g[2];let S=_.g[3],b;b=m+(S^v&(I^S))+T[0]+3614090360&4294967295,m=v+(b<<7&4294967295|b>>>25),b=S+(I^m&(v^I))+T[1]+3905402710&4294967295,S=m+(b<<12&4294967295|b>>>20),b=I+(v^S&(m^v))+T[2]+606105819&4294967295,I=S+(b<<17&4294967295|b>>>15),b=v+(m^I&(S^m))+T[3]+3250441966&4294967295,v=I+(b<<22&4294967295|b>>>10),b=m+(S^v&(I^S))+T[4]+4118548399&4294967295,m=v+(b<<7&4294967295|b>>>25),b=S+(I^m&(v^I))+T[5]+1200080426&4294967295,S=m+(b<<12&4294967295|b>>>20),b=I+(v^S&(m^v))+T[6]+2821735955&4294967295,I=S+(b<<17&4294967295|b>>>15),b=v+(m^I&(S^m))+T[7]+4249261313&4294967295,v=I+(b<<22&4294967295|b>>>10),b=m+(S^v&(I^S))+T[8]+1770035416&4294967295,m=v+(b<<7&4294967295|b>>>25),b=S+(I^m&(v^I))+T[9]+2336552879&4294967295,S=m+(b<<12&4294967295|b>>>20),b=I+(v^S&(m^v))+T[10]+4294925233&4294967295,I=S+(b<<17&4294967295|b>>>15),b=v+(m^I&(S^m))+T[11]+2304563134&4294967295,v=I+(b<<22&4294967295|b>>>10),b=m+(S^v&(I^S))+T[12]+1804603682&4294967295,m=v+(b<<7&4294967295|b>>>25),b=S+(I^m&(v^I))+T[13]+4254626195&4294967295,S=m+(b<<12&4294967295|b>>>20),b=I+(v^S&(m^v))+T[14]+2792965006&4294967295,I=S+(b<<17&4294967295|b>>>15),b=v+(m^I&(S^m))+T[15]+1236535329&4294967295,v=I+(b<<22&4294967295|b>>>10),b=m+(I^S&(v^I))+T[1]+4129170786&4294967295,m=v+(b<<5&4294967295|b>>>27),b=S+(v^I&(m^v))+T[6]+3225465664&4294967295,S=m+(b<<9&4294967295|b>>>23),b=I+(m^v&(S^m))+T[11]+643717713&4294967295,I=S+(b<<14&4294967295|b>>>18),b=v+(S^m&(I^S))+T[0]+3921069994&4294967295,v=I+(b<<20&4294967295|b>>>12),b=m+(I^S&(v^I))+T[5]+3593408605&4294967295,m=v+(b<<5&4294967295|b>>>27),b=S+(v^I&(m^v))+T[10]+38016083&4294967295,S=m+(b<<9&4294967295|b>>>23),b=I+(m^v&(S^m))+T[15]+3634488961&4294967295,I=S+(b<<14&4294967295|b>>>18),b=v+(S^m&(I^S))+T[4]+3889429448&4294967295,v=I+(b<<20&4294967295|b>>>12),b=m+(I^S&(v^I))+T[9]+568446438&4294967295,m=v+(b<<5&4294967295|b>>>27),b=S+(v^I&(m^v))+T[14]+3275163606&4294967295,S=m+(b<<9&4294967295|b>>>23),b=I+(m^v&(S^m))+T[3]+4107603335&4294967295,I=S+(b<<14&4294967295|b>>>18),b=v+(S^m&(I^S))+T[8]+1163531501&4294967295,v=I+(b<<20&4294967295|b>>>12),b=m+(I^S&(v^I))+T[13]+2850285829&4294967295,m=v+(b<<5&4294967295|b>>>27),b=S+(v^I&(m^v))+T[2]+4243563512&4294967295,S=m+(b<<9&4294967295|b>>>23),b=I+(m^v&(S^m))+T[7]+1735328473&4294967295,I=S+(b<<14&4294967295|b>>>18),b=v+(S^m&(I^S))+T[12]+2368359562&4294967295,v=I+(b<<20&4294967295|b>>>12),b=m+(v^I^S)+T[5]+4294588738&4294967295,m=v+(b<<4&4294967295|b>>>28),b=S+(m^v^I)+T[8]+2272392833&4294967295,S=m+(b<<11&4294967295|b>>>21),b=I+(S^m^v)+T[11]+1839030562&4294967295,I=S+(b<<16&4294967295|b>>>16),b=v+(I^S^m)+T[14]+4259657740&4294967295,v=I+(b<<23&4294967295|b>>>9),b=m+(v^I^S)+T[1]+2763975236&4294967295,m=v+(b<<4&4294967295|b>>>28),b=S+(m^v^I)+T[4]+1272893353&4294967295,S=m+(b<<11&4294967295|b>>>21),b=I+(S^m^v)+T[7]+4139469664&4294967295,I=S+(b<<16&4294967295|b>>>16),b=v+(I^S^m)+T[10]+3200236656&4294967295,v=I+(b<<23&4294967295|b>>>9),b=m+(v^I^S)+T[13]+681279174&4294967295,m=v+(b<<4&4294967295|b>>>28),b=S+(m^v^I)+T[0]+3936430074&4294967295,S=m+(b<<11&4294967295|b>>>21),b=I+(S^m^v)+T[3]+3572445317&4294967295,I=S+(b<<16&4294967295|b>>>16),b=v+(I^S^m)+T[6]+76029189&4294967295,v=I+(b<<23&4294967295|b>>>9),b=m+(v^I^S)+T[9]+3654602809&4294967295,m=v+(b<<4&4294967295|b>>>28),b=S+(m^v^I)+T[12]+3873151461&4294967295,S=m+(b<<11&4294967295|b>>>21),b=I+(S^m^v)+T[15]+530742520&4294967295,I=S+(b<<16&4294967295|b>>>16),b=v+(I^S^m)+T[2]+3299628645&4294967295,v=I+(b<<23&4294967295|b>>>9),b=m+(I^(v|~S))+T[0]+4096336452&4294967295,m=v+(b<<6&4294967295|b>>>26),b=S+(v^(m|~I))+T[7]+1126891415&4294967295,S=m+(b<<10&4294967295|b>>>22),b=I+(m^(S|~v))+T[14]+2878612391&4294967295,I=S+(b<<15&4294967295|b>>>17),b=v+(S^(I|~m))+T[5]+4237533241&4294967295,v=I+(b<<21&4294967295|b>>>11),b=m+(I^(v|~S))+T[12]+1700485571&4294967295,m=v+(b<<6&4294967295|b>>>26),b=S+(v^(m|~I))+T[3]+2399980690&4294967295,S=m+(b<<10&4294967295|b>>>22),b=I+(m^(S|~v))+T[10]+4293915773&4294967295,I=S+(b<<15&4294967295|b>>>17),b=v+(S^(I|~m))+T[1]+2240044497&4294967295,v=I+(b<<21&4294967295|b>>>11),b=m+(I^(v|~S))+T[8]+1873313359&4294967295,m=v+(b<<6&4294967295|b>>>26),b=S+(v^(m|~I))+T[15]+4264355552&4294967295,S=m+(b<<10&4294967295|b>>>22),b=I+(m^(S|~v))+T[6]+2734768916&4294967295,I=S+(b<<15&4294967295|b>>>17),b=v+(S^(I|~m))+T[13]+1309151649&4294967295,v=I+(b<<21&4294967295|b>>>11),b=m+(I^(v|~S))+T[4]+4149444226&4294967295,m=v+(b<<6&4294967295|b>>>26),b=S+(v^(m|~I))+T[11]+3174756917&4294967295,S=m+(b<<10&4294967295|b>>>22),b=I+(m^(S|~v))+T[2]+718787259&4294967295,I=S+(b<<15&4294967295|b>>>17),b=v+(S^(I|~m))+T[9]+3951481745&4294967295,_.g[0]=_.g[0]+m&4294967295,_.g[1]=_.g[1]+(I+(b<<21&4294967295|b>>>11))&4294967295,_.g[2]=_.g[2]+I&4294967295,_.g[3]=_.g[3]+S&4294967295}r.prototype.v=function(_,m){m===void 0&&(m=_.length);const v=m-this.blockSize,T=this.C;let I=this.h,S=0;for(;S<m;){if(I==0)for(;S<=v;)i(this,_,S),S+=this.blockSize;if(typeof _=="string"){for(;S<m;)if(T[I++]=_.charCodeAt(S++),I==this.blockSize){i(this,T),I=0;break}}else for(;S<m;)if(T[I++]=_[S++],I==this.blockSize){i(this,T),I=0;break}}this.h=I,this.o+=m},r.prototype.A=function(){var _=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);_[0]=128;for(var m=1;m<_.length-8;++m)_[m]=0;m=this.o*8;for(var v=_.length-8;v<_.length;++v)_[v]=m&255,m/=256;for(this.v(_),_=Array(16),m=0,v=0;v<4;++v)for(let T=0;T<32;T+=8)_[m++]=this.g[v]>>>T&255;return _};function s(_,m){var v=c;return Object.prototype.hasOwnProperty.call(v,_)?v[_]:v[_]=m(_)}function a(_,m){this.h=m;const v=[];let T=!0;for(let I=_.length-1;I>=0;I--){const S=_[I]|0;T&&S==m||(v[I]=S,T=!1)}this.g=v}var c={};function l(_){return-128<=_&&_<128?s(_,function(m){return new a([m|0],m<0?-1:0)}):new a([_|0],_<0?-1:0)}function u(_){if(isNaN(_)||!isFinite(_))return p;if(_<0)return x(u(-_));const m=[];let v=1;for(let T=0;_>=v;T++)m[T]=_/v|0,v*=4294967296;return new a(m,0)}function f(_,m){if(_.length==0)throw Error("number format error: empty string");if(m=m||10,m<2||36<m)throw Error("radix out of range: "+m);if(_.charAt(0)=="-")return x(f(_.substring(1),m));if(_.indexOf("-")>=0)throw Error('number format error: interior "-" character');const v=u(Math.pow(m,8));let T=p;for(let S=0;S<_.length;S+=8){var I=Math.min(8,_.length-S);const b=parseInt(_.substring(S,S+I),m);I<8?(I=u(Math.pow(m,I)),T=T.j(I).add(u(b))):(T=T.j(v),T=T.add(u(b)))}return T}var p=l(0),y=l(1),A=l(16777216);n=a.prototype,n.m=function(){if(w(this))return-x(this).m();let _=0,m=1;for(let v=0;v<this.g.length;v++){const T=this.i(v);_+=(T>=0?T:4294967296+T)*m,m*=4294967296}return _},n.toString=function(_){if(_=_||10,_<2||36<_)throw Error("radix out of range: "+_);if(E(this))return"0";if(w(this))return"-"+x(this).toString(_);const m=u(Math.pow(_,6));var v=this;let T="";for(;;){const I=O(v,m).g;v=R(v,I.j(m));let S=((v.g.length>0?v.g[0]:v.h)>>>0).toString(_);if(v=I,E(v))return S+T;for(;S.length<6;)S="0"+S;T=S+T}},n.i=function(_){return _<0?0:_<this.g.length?this.g[_]:this.h};function E(_){if(_.h!=0)return!1;for(let m=0;m<_.g.length;m++)if(_.g[m]!=0)return!1;return!0}function w(_){return _.h==-1}n.l=function(_){return _=R(this,_),w(_)?-1:E(_)?0:1};function x(_){const m=_.g.length,v=[];for(let T=0;T<m;T++)v[T]=~_.g[T];return new a(v,~_.h).add(y)}n.abs=function(){return w(this)?x(this):this},n.add=function(_){const m=Math.max(this.g.length,_.g.length),v=[];let T=0;for(let I=0;I<=m;I++){let S=T+(this.i(I)&65535)+(_.i(I)&65535),b=(S>>>16)+(this.i(I)>>>16)+(_.i(I)>>>16);T=b>>>16,S&=65535,b&=65535,v[I]=b<<16|S}return new a(v,v[v.length-1]&-2147483648?-1:0)};function R(_,m){return _.add(x(m))}n.j=function(_){if(E(this)||E(_))return p;if(w(this))return w(_)?x(this).j(x(_)):x(x(this).j(_));if(w(_))return x(this.j(x(_)));if(this.l(A)<0&&_.l(A)<0)return u(this.m()*_.m());const m=this.g.length+_.g.length,v=[];for(var T=0;T<2*m;T++)v[T]=0;for(T=0;T<this.g.length;T++)for(let I=0;I<_.g.length;I++){const S=this.i(T)>>>16,b=this.i(T)&65535,se=_.i(I)>>>16,lt=_.i(I)&65535;v[2*T+2*I]+=b*lt,P(v,2*T+2*I),v[2*T+2*I+1]+=S*lt,P(v,2*T+2*I+1),v[2*T+2*I+1]+=b*se,P(v,2*T+2*I+1),v[2*T+2*I+2]+=S*se,P(v,2*T+2*I+2)}for(_=0;_<m;_++)v[_]=v[2*_+1]<<16|v[2*_];for(_=m;_<2*m;_++)v[_]=0;return new a(v,0)};function P(_,m){for(;(_[m]&65535)!=_[m];)_[m+1]+=_[m]>>>16,_[m]&=65535,m++}function N(_,m){this.g=_,this.h=m}function O(_,m){if(E(m))throw Error("division by zero");if(E(_))return new N(p,p);if(w(_))return m=O(x(_),m),new N(x(m.g),x(m.h));if(w(m))return m=O(_,x(m)),new N(x(m.g),m.h);if(_.g.length>30){if(w(_)||w(m))throw Error("slowDivide_ only works with positive integers.");for(var v=y,T=m;T.l(_)<=0;)v=B(v),T=B(T);var I=K(v,1),S=K(T,1);for(T=K(T,2),v=K(v,2);!E(T);){var b=S.add(T);b.l(_)<=0&&(I=I.add(v),S=b),T=K(T,1),v=K(v,1)}return m=R(_,I.j(m)),new N(I,m)}for(I=p;_.l(m)>=0;){for(v=Math.max(1,Math.floor(_.m()/m.m())),T=Math.ceil(Math.log(v)/Math.LN2),T=T<=48?1:Math.pow(2,T-48),S=u(v),b=S.j(m);w(b)||b.l(_)>0;)v-=T,S=u(v),b=S.j(m);E(S)&&(S=y),I=I.add(S),_=R(_,b)}return new N(I,_)}n.B=function(_){return O(this,_).h},n.and=function(_){const m=Math.max(this.g.length,_.g.length),v=[];for(let T=0;T<m;T++)v[T]=this.i(T)&_.i(T);return new a(v,this.h&_.h)},n.or=function(_){const m=Math.max(this.g.length,_.g.length),v=[];for(let T=0;T<m;T++)v[T]=this.i(T)|_.i(T);return new a(v,this.h|_.h)},n.xor=function(_){const m=Math.max(this.g.length,_.g.length),v=[];for(let T=0;T<m;T++)v[T]=this.i(T)^_.i(T);return new a(v,this.h^_.h)};function B(_){const m=_.g.length+1,v=[];for(let T=0;T<m;T++)v[T]=_.i(T)<<1|_.i(T-1)>>>31;return new a(v,_.h)}function K(_,m){const v=m>>5;m%=32;const T=_.g.length-v,I=[];for(let S=0;S<T;S++)I[S]=m>0?_.i(S+v)>>>m|_.i(S+v+1)<<32-m:_.i(S+v);return new a(I,_.h)}r.prototype.digest=r.prototype.A,r.prototype.reset=r.prototype.u,r.prototype.update=r.prototype.v,su=r,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.B,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=u,a.fromString=f,qt=a}).apply(typeof iu<"u"?iu:typeof self<"u"?self:typeof window<"u"?window:{});var es=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var ou,Vr,au,ts,Ho,cu,lu,uu;(function(){var n,e=Object.defineProperty;function t(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof es=="object"&&es];for(var h=0;h<o.length;++h){var d=o[h];if(d&&d.Math==Math)return d}throw Error("Cannot find global object")}var r=t(this);function i(o,h){if(h)e:{var d=r;o=o.split(".");for(var g=0;g<o.length-1;g++){var C=o[g];if(!(C in d))break e;d=d[C]}o=o[o.length-1],g=d[o],h=h(g),h!=g&&h!=null&&e(d,o,{configurable:!0,writable:!0,value:h})}}i("Symbol.dispose",function(o){return o||Symbol("Symbol.dispose")}),i("Array.prototype.values",function(o){return o||function(){return this[Symbol.iterator]()}}),i("Object.entries",function(o){return o||function(h){var d=[],g;for(g in h)Object.prototype.hasOwnProperty.call(h,g)&&d.push([g,h[g]]);return d}});/** @license

   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */var s=s||{},a=this||self;function c(o){var h=typeof o;return h=="object"&&o!=null||h=="function"}function l(o,h,d){return o.call.apply(o.bind,arguments)}function u(o,h,d){return u=l,u.apply(null,arguments)}function f(o,h){var d=Array.prototype.slice.call(arguments,1);return function(){var g=d.slice();return g.push.apply(g,arguments),o.apply(this,g)}}function p(o,h){function d(){}d.prototype=h.prototype,o.Z=h.prototype,o.prototype=new d,o.prototype.constructor=o,o.Ob=function(g,C,k){for(var U=Array(arguments.length-2),Y=2;Y<arguments.length;Y++)U[Y-2]=arguments[Y];return h.prototype[C].apply(g,U)}}var y=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?o=>o&&AsyncContext.Snapshot.wrap(o):o=>o;function A(o){const h=o.length;if(h>0){const d=Array(h);for(let g=0;g<h;g++)d[g]=o[g];return d}return[]}function E(o,h){for(let g=1;g<arguments.length;g++){const C=arguments[g];var d=typeof C;if(d=d!="object"?d:C?Array.isArray(C)?"array":d:"null",d=="array"||d=="object"&&typeof C.length=="number"){d=o.length||0;const k=C.length||0;o.length=d+k;for(let U=0;U<k;U++)o[d+U]=C[U]}else o.push(C)}}class w{constructor(h,d){this.i=h,this.j=d,this.h=0,this.g=null}get(){let h;return this.h>0?(this.h--,h=this.g,this.g=h.next,h.next=null):h=this.i(),h}}function x(o){a.setTimeout(()=>{throw o},0)}function R(){var o=_;let h=null;return o.g&&(h=o.g,o.g=o.g.next,o.g||(o.h=null),h.next=null),h}class P{constructor(){this.h=this.g=null}add(h,d){const g=N.get();g.set(h,d),this.h?this.h.next=g:this.g=g,this.h=g}}var N=new w(()=>new O,o=>o.reset());class O{constructor(){this.next=this.g=this.h=null}set(h,d){this.h=h,this.g=d,this.next=null}reset(){this.next=this.g=this.h=null}}let B,K=!1,_=new P,m=()=>{const o=Promise.resolve(void 0);B=()=>{o.then(v)}};function v(){for(var o;o=R();){try{o.h.call(o.g)}catch(d){x(d)}var h=N;h.j(o),h.h<100&&(h.h++,o.next=h.g,h.g=o)}K=!1}function T(){this.u=this.u,this.C=this.C}T.prototype.u=!1,T.prototype.dispose=function(){this.u||(this.u=!0,this.N())},T.prototype[Symbol.dispose]=function(){this.dispose()},T.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function I(o,h){this.type=o,this.g=this.target=h,this.defaultPrevented=!1}I.prototype.h=function(){this.defaultPrevented=!0};var S=function(){if(!a.addEventListener||!Object.defineProperty)return!1;var o=!1,h=Object.defineProperty({},"passive",{get:function(){o=!0}});try{const d=()=>{};a.addEventListener("test",d,h),a.removeEventListener("test",d,h)}catch{}return o}();function b(o){return/^[\s\xa0]*$/.test(o)}function se(o,h){I.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o&&this.init(o,h)}p(se,I),se.prototype.init=function(o,h){const d=this.type=o.type,g=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;this.target=o.target||o.srcElement,this.g=h,h=o.relatedTarget,h||(d=="mouseover"?h=o.fromElement:d=="mouseout"&&(h=o.toElement)),this.relatedTarget=h,g?(this.clientX=g.clientX!==void 0?g.clientX:g.pageX,this.clientY=g.clientY!==void 0?g.clientY:g.pageY,this.screenX=g.screenX||0,this.screenY=g.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=o.pointerType,this.state=o.state,this.i=o,o.defaultPrevented&&se.Z.h.call(this)},se.prototype.h=function(){se.Z.h.call(this);const o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var lt="closure_listenable_"+(Math.random()*1e6|0),hi=0;function qe(o,h,d,g,C){this.listener=o,this.proxy=null,this.src=h,this.type=d,this.capture=!!g,this.ha=C,this.key=++hi,this.da=this.fa=!1}function Ue(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function Ne(o,h,d){for(const g in o)h.call(d,o[g],g,o)}function ET(o,h){for(const d in o)h.call(void 0,o[d],d,o)}function xf(o){const h={};for(const d in o)h[d]=o[d];return h}const Af="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Sf(o,h){let d,g;for(let C=1;C<arguments.length;C++){g=arguments[C];for(d in g)o[d]=g[d];for(let k=0;k<Af.length;k++)d=Af[k],Object.prototype.hasOwnProperty.call(g,d)&&(o[d]=g[d])}}function to(o){this.src=o,this.g={},this.h=0}to.prototype.add=function(o,h,d,g,C){const k=o.toString();o=this.g[k],o||(o=this.g[k]=[],this.h++);const U=hc(o,h,g,C);return U>-1?(h=o[U],d||(h.fa=!1)):(h=new qe(h,this.src,k,!!g,C),h.fa=d,o.push(h)),h};function uc(o,h){const d=h.type;if(d in o.g){var g=o.g[d],C=Array.prototype.indexOf.call(g,h,void 0),k;(k=C>=0)&&Array.prototype.splice.call(g,C,1),k&&(Ue(h),o.g[d].length==0&&(delete o.g[d],o.h--))}}function hc(o,h,d,g){for(let C=0;C<o.length;++C){const k=o[C];if(!k.da&&k.listener==h&&k.capture==!!d&&k.ha==g)return C}return-1}var dc="closure_lm_"+(Math.random()*1e6|0),fc={};function Cf(o,h,d,g,C){if(Array.isArray(h)){for(let k=0;k<h.length;k++)Cf(o,h[k],d,g,C);return null}return d=Pf(d),o&&o[lt]?o.J(h,d,c(g)?!!g.capture:!1,C):TT(o,h,d,!1,g,C)}function TT(o,h,d,g,C,k){if(!h)throw Error("Invalid event type");const U=c(C)?!!C.capture:!!C;let Y=gc(o);if(Y||(o[dc]=Y=new to(o)),d=Y.add(h,d,g,U,k),d.proxy)return d;if(g=IT(),d.proxy=g,g.src=o,g.listener=d,o.addEventListener)S||(C=U),C===void 0&&(C=!1),o.addEventListener(h.toString(),g,C);else if(o.attachEvent)o.attachEvent(Rf(h.toString()),g);else if(o.addListener&&o.removeListener)o.addListener(g);else throw Error("addEventListener and attachEvent are unavailable.");return d}function IT(){function o(d){return h.call(o.src,o.listener,d)}const h=xT;return o}function kf(o,h,d,g,C){if(Array.isArray(h))for(var k=0;k<h.length;k++)kf(o,h[k],d,g,C);else g=c(g)?!!g.capture:!!g,d=Pf(d),o&&o[lt]?(o=o.i,k=String(h).toString(),k in o.g&&(h=o.g[k],d=hc(h,d,g,C),d>-1&&(Ue(h[d]),Array.prototype.splice.call(h,d,1),h.length==0&&(delete o.g[k],o.h--)))):o&&(o=gc(o))&&(h=o.g[h.toString()],o=-1,h&&(o=hc(h,d,g,C)),(d=o>-1?h[o]:null)&&pc(d))}function pc(o){if(typeof o!="number"&&o&&!o.da){var h=o.src;if(h&&h[lt])uc(h.i,o);else{var d=o.type,g=o.proxy;h.removeEventListener?h.removeEventListener(d,g,o.capture):h.detachEvent?h.detachEvent(Rf(d),g):h.addListener&&h.removeListener&&h.removeListener(g),(d=gc(h))?(uc(d,o),d.h==0&&(d.src=null,h[dc]=null)):Ue(o)}}}function Rf(o){return o in fc?fc[o]:fc[o]="on"+o}function xT(o,h){if(o.da)o=!0;else{h=new se(h,this);const d=o.listener,g=o.ha||o.src;o.fa&&pc(o),o=d.call(g,h)}return o}function gc(o){return o=o[dc],o instanceof to?o:null}var mc="__closure_events_fn_"+(Math.random()*1e9>>>0);function Pf(o){return typeof o=="function"?o:(o[mc]||(o[mc]=function(h){return o.handleEvent(h)}),o[mc])}function Re(){T.call(this),this.i=new to(this),this.M=this,this.G=null}p(Re,T),Re.prototype[lt]=!0,Re.prototype.removeEventListener=function(o,h,d,g){kf(this,o,h,d,g)};function De(o,h){var d,g=o.G;if(g)for(d=[];g;g=g.G)d.push(g);if(o=o.M,g=h.type||h,typeof h=="string")h=new I(h,o);else if(h instanceof I)h.target=h.target||o;else{var C=h;h=new I(g,o),Sf(h,C)}C=!0;let k,U;if(d)for(U=d.length-1;U>=0;U--)k=h.g=d[U],C=no(k,g,!0,h)&&C;if(k=h.g=o,C=no(k,g,!0,h)&&C,C=no(k,g,!1,h)&&C,d)for(U=0;U<d.length;U++)k=h.g=d[U],C=no(k,g,!1,h)&&C}Re.prototype.N=function(){if(Re.Z.N.call(this),this.i){var o=this.i;for(const h in o.g){const d=o.g[h];for(let g=0;g<d.length;g++)Ue(d[g]);delete o.g[h],o.h--}}this.G=null},Re.prototype.J=function(o,h,d,g){return this.i.add(String(o),h,!1,d,g)},Re.prototype.K=function(o,h,d,g){return this.i.add(String(o),h,!0,d,g)};function no(o,h,d,g){if(h=o.i.g[String(h)],!h)return!0;h=h.concat();let C=!0;for(let k=0;k<h.length;++k){const U=h[k];if(U&&!U.da&&U.capture==d){const Y=U.listener,ye=U.ha||U.src;U.fa&&uc(o.i,U),C=Y.call(ye,g)!==!1&&C}}return C&&!g.defaultPrevented}function AT(o,h){if(typeof o!="function")if(o&&typeof o.handleEvent=="function")o=u(o.handleEvent,o);else throw Error("Invalid listener argument");return Number(h)>2147483647?-1:a.setTimeout(o,h||0)}function Nf(o){o.g=AT(()=>{o.g=null,o.i&&(o.i=!1,Nf(o))},o.l);const h=o.h;o.h=null,o.m.apply(null,h)}class ST extends T{constructor(h,d){super(),this.m=h,this.l=d,this.h=null,this.i=!1,this.g=null}j(h){this.h=arguments,this.g?this.i=!0:Nf(this)}N(){super.N(),this.g&&(a.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function di(o){T.call(this),this.h=o,this.g={}}p(di,T);var Df=[];function Lf(o){Ne(o.g,function(h,d){this.g.hasOwnProperty(d)&&pc(h)},o),o.g={}}di.prototype.N=function(){di.Z.N.call(this),Lf(this)},di.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var yc=a.JSON.stringify,CT=a.JSON.parse,kT=class{stringify(o){return a.JSON.stringify(o,void 0)}parse(o){return a.JSON.parse(o,void 0)}};function Vf(){}function Of(){}var fi={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function vc(){I.call(this,"d")}p(vc,I);function _c(){I.call(this,"c")}p(_c,I);var An={},Mf=null;function ro(){return Mf=Mf||new Re}An.Ia="serverreachability";function Ff(o){I.call(this,An.Ia,o)}p(Ff,I);function pi(o){const h=ro();De(h,new Ff(h))}An.STAT_EVENT="statevent";function Uf(o,h){I.call(this,An.STAT_EVENT,o),this.stat=h}p(Uf,I);function Le(o){const h=ro();De(h,new Uf(h,o))}An.Ja="timingevent";function Bf(o,h){I.call(this,An.Ja,o),this.size=h}p(Bf,I);function gi(o,h){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return a.setTimeout(function(){o()},h)}function mi(){this.g=!0}mi.prototype.ua=function(){this.g=!1};function RT(o,h,d,g,C,k){o.info(function(){if(o.g)if(k){var U="",Y=k.split("&");for(let ne=0;ne<Y.length;ne++){var ye=Y[ne].split("=");if(ye.length>1){const be=ye[0];ye=ye[1];const ht=be.split("_");U=ht.length>=2&&ht[1]=="type"?U+(be+"="+ye+"&"):U+(be+"=redacted&")}}}else U=null;else U=k;return"XMLHTTP REQ ("+g+") [attempt "+C+"]: "+h+`
`+d+`
`+U})}function PT(o,h,d,g,C,k,U){o.info(function(){return"XMLHTTP RESP ("+g+") [ attempt "+C+"]: "+h+`
`+d+`
`+k+" "+U})}function fr(o,h,d,g){o.info(function(){return"XMLHTTP TEXT ("+h+"): "+DT(o,d)+(g?" "+g:"")})}function NT(o,h){o.info(function(){return"TIMEOUT: "+h})}mi.prototype.info=function(){};function DT(o,h){if(!o.g)return h;if(!h)return null;try{const k=JSON.parse(h);if(k){for(o=0;o<k.length;o++)if(Array.isArray(k[o])){var d=k[o];if(!(d.length<2)){var g=d[1];if(Array.isArray(g)&&!(g.length<1)){var C=g[0];if(C!="noop"&&C!="stop"&&C!="close")for(let U=1;U<g.length;U++)g[U]=""}}}}return yc(k)}catch{return h}}var io={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},qf={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},$f;function bc(){}p(bc,Vf),bc.prototype.g=function(){return new XMLHttpRequest},$f=new bc;function yi(o){return encodeURIComponent(String(o))}function LT(o){var h=1;o=o.split(":");const d=[];for(;h>0&&o.length;)d.push(o.shift()),h--;return o.length&&d.push(o.join(":")),d}function Xt(o,h,d,g){this.j=o,this.i=h,this.l=d,this.S=g||1,this.V=new di(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new Hf}function Hf(){this.i=null,this.g="",this.h=!1}var jf={},wc={};function Ec(o,h,d){o.M=1,o.A=oo(ut(h)),o.u=d,o.R=!0,Kf(o,null)}function Kf(o,h){o.F=Date.now(),so(o),o.B=ut(o.A);var d=o.B,g=o.S;Array.isArray(g)||(g=[String(g)]),ip(d.i,"t",g),o.C=0,d=o.j.L,o.h=new Hf,o.g=Ep(o.j,d?h:null,!o.u),o.P>0&&(o.O=new ST(u(o.Y,o,o.g),o.P)),h=o.V,d=o.g,g=o.ba;var C="readystatechange";Array.isArray(C)||(C&&(Df[0]=C.toString()),C=Df);for(let k=0;k<C.length;k++){const U=Cf(d,C[k],g||h.handleEvent,!1,h.h||h);if(!U)break;h.g[U.key]=U}h=o.J?xf(o.J):{},o.u?(o.v||(o.v="POST"),h["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.B,o.v,o.u,h)):(o.v="GET",o.g.ea(o.B,o.v,null,h)),pi(),RT(o.i,o.v,o.B,o.l,o.S,o.u)}Xt.prototype.ba=function(o){o=o.target;const h=this.O;h&&en(o)==3?h.j():this.Y(o)},Xt.prototype.Y=function(o){try{if(o==this.g)e:{const Y=en(this.g),ye=this.g.ya(),ne=this.g.ca();if(!(Y<3)&&(Y!=3||this.g&&(this.h.h||this.g.la()||hp(this.g)))){this.K||Y!=4||ye==7||(ye==8||ne<=0?pi(3):pi(2)),Tc(this);var h=this.g.ca();this.X=h;var d=VT(this);if(this.o=h==200,PT(this.i,this.v,this.B,this.l,this.S,Y,h),this.o){if(this.U&&!this.L){t:{if(this.g){var g,C=this.g;if((g=C.g?C.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!b(g)){var k=g;break t}}k=null}if(o=k)fr(this.i,this.l,o,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,Ic(this,o);else{this.o=!1,this.m=3,Le(12),Sn(this),vi(this);break e}}if(this.R){o=!0;let be;for(;!this.K&&this.C<d.length;)if(be=OT(this,d),be==wc){Y==4&&(this.m=4,Le(14),o=!1),fr(this.i,this.l,null,"[Incomplete Response]");break}else if(be==jf){this.m=4,Le(15),fr(this.i,this.l,d,"[Invalid Chunk]"),o=!1;break}else fr(this.i,this.l,be,null),Ic(this,be);if(zf(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),Y!=4||d.length!=0||this.h.h||(this.m=1,Le(16),o=!1),this.o=this.o&&o,!o)fr(this.i,this.l,d,"[Invalid Chunked Response]"),Sn(this),vi(this);else if(d.length>0&&!this.W){this.W=!0;var U=this.j;U.g==this&&U.aa&&!U.P&&(U.j.info("Great, no buffering proxy detected. Bytes received: "+d.length),Nc(U),U.P=!0,Le(11))}}else fr(this.i,this.l,d,null),Ic(this,d);Y==4&&Sn(this),this.o&&!this.K&&(Y==4?vp(this.j,this):(this.o=!1,so(this)))}else YT(this.g),h==400&&d.indexOf("Unknown SID")>0?(this.m=3,Le(12)):(this.m=0,Le(13)),Sn(this),vi(this)}}}catch{}finally{}};function VT(o){if(!zf(o))return o.g.la();const h=hp(o.g);if(h==="")return"";let d="";const g=h.length,C=en(o.g)==4;if(!o.h.i){if(typeof TextDecoder>"u")return Sn(o),vi(o),"";o.h.i=new a.TextDecoder}for(let k=0;k<g;k++)o.h.h=!0,d+=o.h.i.decode(h[k],{stream:!(C&&k==g-1)});return h.length=0,o.h.g+=d,o.C=0,o.h.g}function zf(o){return o.g?o.v=="GET"&&o.M!=2&&o.j.Aa:!1}function OT(o,h){var d=o.C,g=h.indexOf(`
`,d);return g==-1?wc:(d=Number(h.substring(d,g)),isNaN(d)?jf:(g+=1,g+d>h.length?wc:(h=h.slice(g,g+d),o.C=g+d,h)))}Xt.prototype.cancel=function(){this.K=!0,Sn(this)};function so(o){o.T=Date.now()+o.H,Gf(o,o.H)}function Gf(o,h){if(o.D!=null)throw Error("WatchDog timer not null");o.D=gi(u(o.aa,o),h)}function Tc(o){o.D&&(a.clearTimeout(o.D),o.D=null)}Xt.prototype.aa=function(){this.D=null;const o=Date.now();o-this.T>=0?(NT(this.i,this.B),this.M!=2&&(pi(),Le(17)),Sn(this),this.m=2,vi(this)):Gf(this,this.T-o)};function vi(o){o.j.I==0||o.K||vp(o.j,o)}function Sn(o){Tc(o);var h=o.O;h&&typeof h.dispose=="function"&&h.dispose(),o.O=null,Lf(o.V),o.g&&(h=o.g,o.g=null,h.abort(),h.dispose())}function Ic(o,h){try{var d=o.j;if(d.I!=0&&(d.g==o||xc(d.h,o))){if(!o.L&&xc(d.h,o)&&d.I==3){try{var g=d.Ba.g.parse(h)}catch{g=null}if(Array.isArray(g)&&g.length==3){var C=g;if(C[0]==0){e:if(!d.v){if(d.g)if(d.g.F+3e3<o.F)ho(d),lo(d);else break e;Pc(d),Le(18)}}else d.xa=C[1],0<d.xa-d.K&&C[2]<37500&&d.F&&d.A==0&&!d.C&&(d.C=gi(u(d.Va,d),6e3));Yf(d.h)<=1&&d.ta&&(d.ta=void 0)}else kn(d,11)}else if((o.L||d.g==o)&&ho(d),!b(h))for(C=d.Ba.g.parse(h),h=0;h<C.length;h++){let ne=C[h];const be=ne[0];if(!(be<=d.K))if(d.K=be,ne=ne[1],d.I==2)if(ne[0]=="c"){d.M=ne[1],d.ba=ne[2];const ht=ne[3];ht!=null&&(d.ka=ht,d.j.info("VER="+d.ka));const Rn=ne[4];Rn!=null&&(d.za=Rn,d.j.info("SVER="+d.za));const tn=ne[5];tn!=null&&typeof tn=="number"&&tn>0&&(g=1.5*tn,d.O=g,d.j.info("backChannelRequestTimeoutMs_="+g)),g=d;const nn=o.g;if(nn){const po=nn.g?nn.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(po){var k=g.h;k.g||po.indexOf("spdy")==-1&&po.indexOf("quic")==-1&&po.indexOf("h2")==-1||(k.j=k.l,k.g=new Set,k.h&&(Ac(k,k.h),k.h=null))}if(g.G){const Dc=nn.g?nn.g.getResponseHeader("X-HTTP-Session-Id"):null;Dc&&(g.wa=Dc,oe(g.J,g.G,Dc))}}d.I=3,d.l&&d.l.ra(),d.aa&&(d.T=Date.now()-o.F,d.j.info("Handshake RTT: "+d.T+"ms")),g=d;var U=o;if(g.na=wp(g,g.L?g.ba:null,g.W),U.L){Xf(g.h,U);var Y=U,ye=g.O;ye&&(Y.H=ye),Y.D&&(Tc(Y),so(Y)),g.g=U}else mp(g);d.i.length>0&&uo(d)}else ne[0]!="stop"&&ne[0]!="close"||kn(d,7);else d.I==3&&(ne[0]=="stop"||ne[0]=="close"?ne[0]=="stop"?kn(d,7):Rc(d):ne[0]!="noop"&&d.l&&d.l.qa(ne),d.A=0)}}pi(4)}catch{}}var MT=class{constructor(o,h){this.g=o,this.map=h}};function Wf(o){this.l=o||10,a.PerformanceNavigationTiming?(o=a.performance.getEntriesByType("navigation"),o=o.length>0&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(a.chrome&&a.chrome.loadTimes&&a.chrome.loadTimes()&&a.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function Qf(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function Yf(o){return o.h?1:o.g?o.g.size:0}function xc(o,h){return o.h?o.h==h:o.g?o.g.has(h):!1}function Ac(o,h){o.g?o.g.add(h):o.h=h}function Xf(o,h){o.h&&o.h==h?o.h=null:o.g&&o.g.has(h)&&o.g.delete(h)}Wf.prototype.cancel=function(){if(this.i=Jf(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const o of this.g.values())o.cancel();this.g.clear()}};function Jf(o){if(o.h!=null)return o.i.concat(o.h.G);if(o.g!=null&&o.g.size!==0){let h=o.i;for(const d of o.g.values())h=h.concat(d.G);return h}return A(o.i)}var Zf=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function FT(o,h){if(o){o=o.split("&");for(let d=0;d<o.length;d++){const g=o[d].indexOf("=");let C,k=null;g>=0?(C=o[d].substring(0,g),k=o[d].substring(g+1)):C=o[d],h(C,k?decodeURIComponent(k.replace(/\+/g," ")):"")}}}function Jt(o){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let h;o instanceof Jt?(this.l=o.l,_i(this,o.j),this.o=o.o,this.g=o.g,bi(this,o.u),this.h=o.h,Sc(this,sp(o.i)),this.m=o.m):o&&(h=String(o).match(Zf))?(this.l=!1,_i(this,h[1]||"",!0),this.o=wi(h[2]||""),this.g=wi(h[3]||"",!0),bi(this,h[4]),this.h=wi(h[5]||"",!0),Sc(this,h[6]||"",!0),this.m=wi(h[7]||"")):(this.l=!1,this.i=new Ti(null,this.l))}Jt.prototype.toString=function(){const o=[];var h=this.j;h&&o.push(Ei(h,ep,!0),":");var d=this.g;return(d||h=="file")&&(o.push("//"),(h=this.o)&&o.push(Ei(h,ep,!0),"@"),o.push(yi(d).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),d=this.u,d!=null&&o.push(":",String(d))),(d=this.h)&&(this.g&&d.charAt(0)!="/"&&o.push("/"),o.push(Ei(d,d.charAt(0)=="/"?qT:BT,!0))),(d=this.i.toString())&&o.push("?",d),(d=this.m)&&o.push("#",Ei(d,HT)),o.join("")},Jt.prototype.resolve=function(o){const h=ut(this);let d=!!o.j;d?_i(h,o.j):d=!!o.o,d?h.o=o.o:d=!!o.g,d?h.g=o.g:d=o.u!=null;var g=o.h;if(d)bi(h,o.u);else if(d=!!o.h){if(g.charAt(0)!="/")if(this.g&&!this.h)g="/"+g;else{var C=h.h.lastIndexOf("/");C!=-1&&(g=h.h.slice(0,C+1)+g)}if(C=g,C==".."||C==".")g="";else if(C.indexOf("./")!=-1||C.indexOf("/.")!=-1){g=C.lastIndexOf("/",0)==0,C=C.split("/");const k=[];for(let U=0;U<C.length;){const Y=C[U++];Y=="."?g&&U==C.length&&k.push(""):Y==".."?((k.length>1||k.length==1&&k[0]!="")&&k.pop(),g&&U==C.length&&k.push("")):(k.push(Y),g=!0)}g=k.join("/")}else g=C}return d?h.h=g:d=o.i.toString()!=="",d?Sc(h,sp(o.i)):d=!!o.m,d&&(h.m=o.m),h};function ut(o){return new Jt(o)}function _i(o,h,d){o.j=d?wi(h,!0):h,o.j&&(o.j=o.j.replace(/:$/,""))}function bi(o,h){if(h){if(h=Number(h),isNaN(h)||h<0)throw Error("Bad port number "+h);o.u=h}else o.u=null}function Sc(o,h,d){h instanceof Ti?(o.i=h,jT(o.i,o.l)):(d||(h=Ei(h,$T)),o.i=new Ti(h,o.l))}function oe(o,h,d){o.i.set(h,d)}function oo(o){return oe(o,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),o}function wi(o,h){return o?h?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function Ei(o,h,d){return typeof o=="string"?(o=encodeURI(o).replace(h,UT),d&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function UT(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var ep=/[#\/\?@]/g,BT=/[#\?:]/g,qT=/[#\?]/g,$T=/[#\?@]/g,HT=/#/g;function Ti(o,h){this.h=this.g=null,this.i=o||null,this.j=!!h}function Cn(o){o.g||(o.g=new Map,o.h=0,o.i&&FT(o.i,function(h,d){o.add(decodeURIComponent(h.replace(/\+/g," ")),d)}))}n=Ti.prototype,n.add=function(o,h){Cn(this),this.i=null,o=pr(this,o);let d=this.g.get(o);return d||this.g.set(o,d=[]),d.push(h),this.h+=1,this};function tp(o,h){Cn(o),h=pr(o,h),o.g.has(h)&&(o.i=null,o.h-=o.g.get(h).length,o.g.delete(h))}function np(o,h){return Cn(o),h=pr(o,h),o.g.has(h)}n.forEach=function(o,h){Cn(this),this.g.forEach(function(d,g){d.forEach(function(C){o.call(h,C,g,this)},this)},this)};function rp(o,h){Cn(o);let d=[];if(typeof h=="string")np(o,h)&&(d=d.concat(o.g.get(pr(o,h))));else for(o=Array.from(o.g.values()),h=0;h<o.length;h++)d=d.concat(o[h]);return d}n.set=function(o,h){return Cn(this),this.i=null,o=pr(this,o),np(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[h]),this.h+=1,this},n.get=function(o,h){return o?(o=rp(this,o),o.length>0?String(o[0]):h):h};function ip(o,h,d){tp(o,h),d.length>0&&(o.i=null,o.g.set(pr(o,h),A(d)),o.h+=d.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const o=[],h=Array.from(this.g.keys());for(let g=0;g<h.length;g++){var d=h[g];const C=yi(d);d=rp(this,d);for(let k=0;k<d.length;k++){let U=C;d[k]!==""&&(U+="="+yi(d[k])),o.push(U)}}return this.i=o.join("&")};function sp(o){const h=new Ti;return h.i=o.i,o.g&&(h.g=new Map(o.g),h.h=o.h),h}function pr(o,h){return h=String(h),o.j&&(h=h.toLowerCase()),h}function jT(o,h){h&&!o.j&&(Cn(o),o.i=null,o.g.forEach(function(d,g){const C=g.toLowerCase();g!=C&&(tp(this,g),ip(this,C,d))},o)),o.j=h}function KT(o,h){const d=new mi;if(a.Image){const g=new Image;g.onload=f(Zt,d,"TestLoadImage: loaded",!0,h,g),g.onerror=f(Zt,d,"TestLoadImage: error",!1,h,g),g.onabort=f(Zt,d,"TestLoadImage: abort",!1,h,g),g.ontimeout=f(Zt,d,"TestLoadImage: timeout",!1,h,g),a.setTimeout(function(){g.ontimeout&&g.ontimeout()},1e4),g.src=o}else h(!1)}function zT(o,h){const d=new mi,g=new AbortController,C=setTimeout(()=>{g.abort(),Zt(d,"TestPingServer: timeout",!1,h)},1e4);fetch(o,{signal:g.signal}).then(k=>{clearTimeout(C),k.ok?Zt(d,"TestPingServer: ok",!0,h):Zt(d,"TestPingServer: server error",!1,h)}).catch(()=>{clearTimeout(C),Zt(d,"TestPingServer: error",!1,h)})}function Zt(o,h,d,g,C){try{C&&(C.onload=null,C.onerror=null,C.onabort=null,C.ontimeout=null),g(d)}catch{}}function GT(){this.g=new kT}function Cc(o){this.i=o.Sb||null,this.h=o.ab||!1}p(Cc,Vf),Cc.prototype.g=function(){return new ao(this.i,this.h)};function ao(o,h){Re.call(this),this.H=o,this.o=h,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}p(ao,Re),n=ao.prototype,n.open=function(o,h){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=o,this.D=h,this.readyState=1,xi(this)},n.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const h={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};o&&(h.body=o),(this.H||a).fetch(new Request(this.D,h)).then(this.Pa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,Ii(this)),this.readyState=0},n.Pa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,xi(this)),this.g&&(this.readyState=3,xi(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof a.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;op(this)}else o.text().then(this.Oa.bind(this),this.ga.bind(this))};function op(o){o.j.read().then(o.Ma.bind(o)).catch(o.ga.bind(o))}n.Ma=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var h=o.value?o.value:new Uint8Array(0);(h=this.B.decode(h,{stream:!o.done}))&&(this.response=this.responseText+=h)}o.done?Ii(this):xi(this),this.readyState==3&&op(this)}},n.Oa=function(o){this.g&&(this.response=this.responseText=o,Ii(this))},n.Na=function(o){this.g&&(this.response=o,Ii(this))},n.ga=function(){this.g&&Ii(this)};function Ii(o){o.readyState=4,o.l=null,o.j=null,o.B=null,xi(o)}n.setRequestHeader=function(o,h){this.A.append(o,h)},n.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const o=[],h=this.h.entries();for(var d=h.next();!d.done;)d=d.value,o.push(d[0]+": "+d[1]),d=h.next();return o.join(`\r
`)};function xi(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(ao.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function ap(o){let h="";return Ne(o,function(d,g){h+=g,h+=":",h+=d,h+=`\r
`}),h}function kc(o,h,d){e:{for(g in d){var g=!1;break e}g=!0}g||(d=ap(d),typeof o=="string"?d!=null&&yi(d):oe(o,h,d))}function ce(o){Re.call(this),this.headers=new Map,this.L=o||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}p(ce,Re);var WT=/^https?$/i,QT=["POST","PUT"];n=ce.prototype,n.Fa=function(o){this.H=o},n.ea=function(o,h,d,g){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);h=h?h.toUpperCase():"GET",this.D=o,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():$f.g(),this.g.onreadystatechange=y(u(this.Ca,this));try{this.B=!0,this.g.open(h,String(o),!0),this.B=!1}catch(k){cp(this,k);return}if(o=d||"",d=new Map(this.headers),g)if(Object.getPrototypeOf(g)===Object.prototype)for(var C in g)d.set(C,g[C]);else if(typeof g.keys=="function"&&typeof g.get=="function")for(const k of g.keys())d.set(k,g.get(k));else throw Error("Unknown input type for opt_headers: "+String(g));g=Array.from(d.keys()).find(k=>k.toLowerCase()=="content-type"),C=a.FormData&&o instanceof a.FormData,!(Array.prototype.indexOf.call(QT,h,void 0)>=0)||g||C||d.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[k,U]of d)this.g.setRequestHeader(k,U);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(o),this.v=!1}catch(k){cp(this,k)}};function cp(o,h){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=h,o.o=5,lp(o),co(o)}function lp(o){o.A||(o.A=!0,De(o,"complete"),De(o,"error"))}n.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=o||7,De(this,"complete"),De(this,"abort"),co(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),co(this,!0)),ce.Z.N.call(this)},n.Ca=function(){this.u||(this.B||this.v||this.j?up(this):this.Xa())},n.Xa=function(){up(this)};function up(o){if(o.h&&typeof s<"u"){if(o.v&&en(o)==4)setTimeout(o.Ca.bind(o),0);else if(De(o,"readystatechange"),en(o)==4){o.h=!1;try{const k=o.ca();e:switch(k){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var h=!0;break e;default:h=!1}var d;if(!(d=h)){var g;if(g=k===0){let U=String(o.D).match(Zf)[1]||null;!U&&a.self&&a.self.location&&(U=a.self.location.protocol.slice(0,-1)),g=!WT.test(U?U.toLowerCase():"")}d=g}if(d)De(o,"complete"),De(o,"success");else{o.o=6;try{var C=en(o)>2?o.g.statusText:""}catch{C=""}o.l=C+" ["+o.ca()+"]",lp(o)}}finally{co(o)}}}}function co(o,h){if(o.g){o.m&&(clearTimeout(o.m),o.m=null);const d=o.g;o.g=null,h||De(o,"ready");try{d.onreadystatechange=null}catch{}}}n.isActive=function(){return!!this.g};function en(o){return o.g?o.g.readyState:0}n.ca=function(){try{return en(this)>2?this.g.status:-1}catch{return-1}},n.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.La=function(o){if(this.g){var h=this.g.responseText;return o&&h.indexOf(o)==0&&(h=h.substring(o.length)),CT(h)}};function hp(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.F){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function YT(o){const h={};o=(o.g&&en(o)>=2&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let g=0;g<o.length;g++){if(b(o[g]))continue;var d=LT(o[g]);const C=d[0];if(d=d[1],typeof d!="string")continue;d=d.trim();const k=h[C]||[];h[C]=k,k.push(d)}ET(h,function(g){return g.join(", ")})}n.ya=function(){return this.o},n.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function Ai(o,h,d){return d&&d.internalChannelParams&&d.internalChannelParams[o]||h}function dp(o){this.za=0,this.i=[],this.j=new mi,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=Ai("failFast",!1,o),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=Ai("baseRetryDelayMs",5e3,o),this.Za=Ai("retryDelaySeedMs",1e4,o),this.Ta=Ai("forwardChannelMaxRetries",2,o),this.va=Ai("forwardChannelRequestTimeoutMs",2e4,o),this.ma=o&&o.xmlHttpFactory||void 0,this.Ua=o&&o.Rb||void 0,this.Aa=o&&o.useFetchStreams||!1,this.O=void 0,this.L=o&&o.supportsCrossDomainXhr||!1,this.M="",this.h=new Wf(o&&o.concurrentRequestLimit),this.Ba=new GT,this.S=o&&o.fastHandshake||!1,this.R=o&&o.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=o&&o.Pb||!1,o&&o.ua&&this.j.ua(),o&&o.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&o&&o.detectBufferingProxy||!1,this.ia=void 0,o&&o.longPollingTimeout&&o.longPollingTimeout>0&&(this.ia=o.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}n=dp.prototype,n.ka=8,n.I=1,n.connect=function(o,h,d,g){Le(0),this.W=o,this.H=h||{},d&&g!==void 0&&(this.H.OSID=d,this.H.OAID=g),this.F=this.X,this.J=wp(this,null,this.W),uo(this)};function Rc(o){if(fp(o),o.I==3){var h=o.V++,d=ut(o.J);if(oe(d,"SID",o.M),oe(d,"RID",h),oe(d,"TYPE","terminate"),Si(o,d),h=new Xt(o,o.j,h),h.M=2,h.A=oo(ut(d)),d=!1,a.navigator&&a.navigator.sendBeacon)try{d=a.navigator.sendBeacon(h.A.toString(),"")}catch{}!d&&a.Image&&(new Image().src=h.A,d=!0),d||(h.g=Ep(h.j,null),h.g.ea(h.A)),h.F=Date.now(),so(h)}bp(o)}function lo(o){o.g&&(Nc(o),o.g.cancel(),o.g=null)}function fp(o){lo(o),o.v&&(a.clearTimeout(o.v),o.v=null),ho(o),o.h.cancel(),o.m&&(typeof o.m=="number"&&a.clearTimeout(o.m),o.m=null)}function uo(o){if(!Qf(o.h)&&!o.m){o.m=!0;var h=o.Ea;B||m(),K||(B(),K=!0),_.add(h,o),o.D=0}}function XT(o,h){return Yf(o.h)>=o.h.j-(o.m?1:0)?!1:o.m?(o.i=h.G.concat(o.i),!0):o.I==1||o.I==2||o.D>=(o.Sa?0:o.Ta)?!1:(o.m=gi(u(o.Ea,o,h),_p(o,o.D)),o.D++,!0)}n.Ea=function(o){if(this.m)if(this.m=null,this.I==1){if(!o){this.V=Math.floor(Math.random()*1e5),o=this.V++;const C=new Xt(this,this.j,o);let k=this.o;if(this.U&&(k?(k=xf(k),Sf(k,this.U)):k=this.U),this.u!==null||this.R||(C.J=k,k=null),this.S)e:{for(var h=0,d=0;d<this.i.length;d++){t:{var g=this.i[d];if("__data__"in g.map&&(g=g.map.__data__,typeof g=="string")){g=g.length;break t}g=void 0}if(g===void 0)break;if(h+=g,h>4096){h=d;break e}if(h===4096||d===this.i.length-1){h=d+1;break e}}h=1e3}else h=1e3;h=gp(this,C,h),d=ut(this.J),oe(d,"RID",o),oe(d,"CVER",22),this.G&&oe(d,"X-HTTP-Session-Id",this.G),Si(this,d),k&&(this.R?h="headers="+yi(ap(k))+"&"+h:this.u&&kc(d,this.u,k)),Ac(this.h,C),this.Ra&&oe(d,"TYPE","init"),this.S?(oe(d,"$req",h),oe(d,"SID","null"),C.U=!0,Ec(C,d,null)):Ec(C,d,h),this.I=2}}else this.I==3&&(o?pp(this,o):this.i.length==0||Qf(this.h)||pp(this))};function pp(o,h){var d;h?d=h.l:d=o.V++;const g=ut(o.J);oe(g,"SID",o.M),oe(g,"RID",d),oe(g,"AID",o.K),Si(o,g),o.u&&o.o&&kc(g,o.u,o.o),d=new Xt(o,o.j,d,o.D+1),o.u===null&&(d.J=o.o),h&&(o.i=h.G.concat(o.i)),h=gp(o,d,1e3),d.H=Math.round(o.va*.5)+Math.round(o.va*.5*Math.random()),Ac(o.h,d),Ec(d,g,h)}function Si(o,h){o.H&&Ne(o.H,function(d,g){oe(h,g,d)}),o.l&&Ne({},function(d,g){oe(h,g,d)})}function gp(o,h,d){d=Math.min(o.i.length,d);const g=o.l?u(o.l.Ka,o.l,o):null;e:{var C=o.i;let Y=-1;for(;;){const ye=["count="+d];Y==-1?d>0?(Y=C[0].g,ye.push("ofs="+Y)):Y=0:ye.push("ofs="+Y);let ne=!0;for(let be=0;be<d;be++){var k=C[be].g;const ht=C[be].map;if(k-=Y,k<0)Y=Math.max(0,C[be].g-100),ne=!1;else try{k="req"+k+"_"||"";try{var U=ht instanceof Map?ht:Object.entries(ht);for(const[Rn,tn]of U){let nn=tn;c(tn)&&(nn=yc(tn)),ye.push(k+Rn+"="+encodeURIComponent(nn))}}catch(Rn){throw ye.push(k+"type="+encodeURIComponent("_badmap")),Rn}}catch{g&&g(ht)}}if(ne){U=ye.join("&");break e}}U=void 0}return o=o.i.splice(0,d),h.G=o,U}function mp(o){if(!o.g&&!o.v){o.Y=1;var h=o.Da;B||m(),K||(B(),K=!0),_.add(h,o),o.A=0}}function Pc(o){return o.g||o.v||o.A>=3?!1:(o.Y++,o.v=gi(u(o.Da,o),_p(o,o.A)),o.A++,!0)}n.Da=function(){if(this.v=null,yp(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var o=4*this.T;this.j.info("BP detection timer enabled: "+o),this.B=gi(u(this.Wa,this),o)}},n.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,Le(10),lo(this),yp(this))};function Nc(o){o.B!=null&&(a.clearTimeout(o.B),o.B=null)}function yp(o){o.g=new Xt(o,o.j,"rpc",o.Y),o.u===null&&(o.g.J=o.o),o.g.P=0;var h=ut(o.na);oe(h,"RID","rpc"),oe(h,"SID",o.M),oe(h,"AID",o.K),oe(h,"CI",o.F?"0":"1"),!o.F&&o.ia&&oe(h,"TO",o.ia),oe(h,"TYPE","xmlhttp"),Si(o,h),o.u&&o.o&&kc(h,o.u,o.o),o.O&&(o.g.H=o.O);var d=o.g;o=o.ba,d.M=1,d.A=oo(ut(h)),d.u=null,d.R=!0,Kf(d,o)}n.Va=function(){this.C!=null&&(this.C=null,lo(this),Pc(this),Le(19))};function ho(o){o.C!=null&&(a.clearTimeout(o.C),o.C=null)}function vp(o,h){var d=null;if(o.g==h){ho(o),Nc(o),o.g=null;var g=2}else if(xc(o.h,h))d=h.G,Xf(o.h,h),g=1;else return;if(o.I!=0){if(h.o)if(g==1){d=h.u?h.u.length:0,h=Date.now()-h.F;var C=o.D;g=ro(),De(g,new Bf(g,d)),uo(o)}else mp(o);else if(C=h.m,C==3||C==0&&h.X>0||!(g==1&&XT(o,h)||g==2&&Pc(o)))switch(d&&d.length>0&&(h=o.h,h.i=h.i.concat(d)),C){case 1:kn(o,5);break;case 4:kn(o,10);break;case 3:kn(o,6);break;default:kn(o,2)}}}function _p(o,h){let d=o.Qa+Math.floor(Math.random()*o.Za);return o.isActive()||(d*=2),d*h}function kn(o,h){if(o.j.info("Error code "+h),h==2){var d=u(o.bb,o),g=o.Ua;const C=!g;g=new Jt(g||"//www.google.com/images/cleardot.gif"),a.location&&a.location.protocol=="http"||_i(g,"https"),oo(g),C?KT(g.toString(),d):zT(g.toString(),d)}else Le(2);o.I=0,o.l&&o.l.pa(h),bp(o),fp(o)}n.bb=function(o){o?(this.j.info("Successfully pinged google.com"),Le(2)):(this.j.info("Failed to ping google.com"),Le(1))};function bp(o){if(o.I=0,o.ja=[],o.l){const h=Jf(o.h);(h.length!=0||o.i.length!=0)&&(E(o.ja,h),E(o.ja,o.i),o.h.i.length=0,A(o.i),o.i.length=0),o.l.oa()}}function wp(o,h,d){var g=d instanceof Jt?ut(d):new Jt(d);if(g.g!="")h&&(g.g=h+"."+g.g),bi(g,g.u);else{var C=a.location;g=C.protocol,h=h?h+"."+C.hostname:C.hostname,C=+C.port;const k=new Jt(null);g&&_i(k,g),h&&(k.g=h),C&&bi(k,C),d&&(k.h=d),g=k}return d=o.G,h=o.wa,d&&h&&oe(g,d,h),oe(g,"VER",o.ka),Si(o,g),g}function Ep(o,h,d){if(h&&!o.L)throw Error("Can't create secondary domain capable XhrIo object.");return h=o.Aa&&!o.ma?new ce(new Cc({ab:d})):new ce(o.ma),h.Fa(o.L),h}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function Tp(){}n=Tp.prototype,n.ra=function(){},n.qa=function(){},n.pa=function(){},n.oa=function(){},n.isActive=function(){return!0},n.Ka=function(){};function fo(){}fo.prototype.g=function(o,h){return new $e(o,h)};function $e(o,h){Re.call(this),this.g=new dp(h),this.l=o,this.h=h&&h.messageUrlParams||null,o=h&&h.messageHeaders||null,h&&h.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=h&&h.initMessageHeaders||null,h&&h.messageContentType&&(o?o["X-WebChannel-Content-Type"]=h.messageContentType:o={"X-WebChannel-Content-Type":h.messageContentType}),h&&h.sa&&(o?o["X-WebChannel-Client-Profile"]=h.sa:o={"X-WebChannel-Client-Profile":h.sa}),this.g.U=o,(o=h&&h.Qb)&&!b(o)&&(this.g.u=o),this.A=h&&h.supportsCrossDomainXhr||!1,this.v=h&&h.sendRawJson||!1,(h=h&&h.httpSessionIdParam)&&!b(h)&&(this.g.G=h,o=this.h,o!==null&&h in o&&(o=this.h,h in o&&delete o[h])),this.j=new gr(this)}p($e,Re),$e.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},$e.prototype.close=function(){Rc(this.g)},$e.prototype.o=function(o){var h=this.g;if(typeof o=="string"){var d={};d.__data__=o,o=d}else this.v&&(d={},d.__data__=yc(o),o=d);h.i.push(new MT(h.Ya++,o)),h.I==3&&uo(h)},$e.prototype.N=function(){this.g.l=null,delete this.j,Rc(this.g),delete this.g,$e.Z.N.call(this)};function Ip(o){vc.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var h=o.__sm__;if(h){e:{for(const d in h){o=d;break e}o=void 0}(this.i=o)&&(o=this.i,h=h!==null&&o in h?h[o]:void 0),this.data=h}else this.data=o}p(Ip,vc);function xp(){_c.call(this),this.status=1}p(xp,_c);function gr(o){this.g=o}p(gr,Tp),gr.prototype.ra=function(){De(this.g,"a")},gr.prototype.qa=function(o){De(this.g,new Ip(o))},gr.prototype.pa=function(o){De(this.g,new xp)},gr.prototype.oa=function(){De(this.g,"b")},fo.prototype.createWebChannel=fo.prototype.g,$e.prototype.send=$e.prototype.o,$e.prototype.open=$e.prototype.m,$e.prototype.close=$e.prototype.close,uu=function(){return new fo},lu=function(){return ro()},cu=An,Ho={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},io.NO_ERROR=0,io.TIMEOUT=8,io.HTTP_ERROR=6,ts=io,qf.COMPLETE="complete",au=qf,Of.EventType=fi,fi.OPEN="a",fi.CLOSE="b",fi.ERROR="c",fi.MESSAGE="d",Re.prototype.listen=Re.prototype.J,Vr=Of,ce.prototype.listenOnce=ce.prototype.K,ce.prototype.getLastError=ce.prototype.Ha,ce.prototype.getLastErrorCode=ce.prototype.ya,ce.prototype.getStatus=ce.prototype.ca,ce.prototype.getResponseJson=ce.prototype.La,ce.prototype.getResponseText=ce.prototype.la,ce.prototype.send=ce.prototype.ea,ce.prototype.setWithCredentials=ce.prototype.Fa,ou=ce}).apply(typeof es<"u"?es:typeof self<"u"?self:typeof window<"u"?window:{});/**
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
 */let Hn="12.12.0";function Pv(n){Hn=n}/**
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
 */const fn=new yo("@firebase/firestore");function jn(){return fn.logLevel}function H(n,...e){if(fn.logLevel<=X.DEBUG){const t=e.map(jo);fn.debug(`Firestore (${Hn}): ${n}`,...t)}}function _t(n,...e){if(fn.logLevel<=X.ERROR){const t=e.map(jo);fn.error(`Firestore (${Hn}): ${n}`,...t)}}function pn(n,...e){if(fn.logLevel<=X.WARN){const t=e.map(jo);fn.warn(`Firestore (${Hn}): ${n}`,...t)}}function jo(n){if(typeof n=="string")return n;try{return function(t){return JSON.stringify(t)}(n)}catch{return n}}/**
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
 */function G(n,e,t){let r="Unexpected state";typeof e=="string"?r=e:t=e,hu(n,r,t)}function hu(n,e,t){let r=`FIRESTORE (${Hn}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{r+=" CONTEXT: "+JSON.stringify(t)}catch{r+=" CONTEXT: "+t}throw _t(r),new Error(r)}function te(n,e,t,r){let i="Unexpected state";typeof t=="string"?i=t:r=t,n||hu(e,i,r)}function Q(n,e){return n}/**
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
 */const L={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class q extends ft{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
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
 */class du{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class Nv{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(xe.UNAUTHENTICATED))}shutdown(){}}class Dv{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class Lv{constructor(e){this.t=e,this.currentUser=xe.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){te(this.o===void 0,42304);let r=this.i;const i=l=>this.i!==r?(r=this.i,t(l)):Promise.resolve();let s=new bt;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new bt,e.enqueueRetryable(()=>i(this.currentUser))};const a=()=>{const l=s;e.enqueueRetryable(async()=>{await l.promise,await i(this.currentUser)})},c=l=>{H("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=l,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit(l=>c(l)),setTimeout(()=>{if(!this.auth){const l=this.t.getImmediate({optional:!0});l?c(l):(H("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new bt)}},0),a()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(r=>this.i!==e?(H("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(te(typeof r.accessToken=="string",31837,{l:r}),new du(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return te(e===null||typeof e=="string",2055,{h:e}),new xe(e)}}class Vv{constructor(e,t,r){this.P=e,this.T=t,this.I=r,this.type="FirstParty",this.user=xe.FIRST_PARTY,this.R=new Map}A(){return this.I?this.I():null}get headers(){this.R.set("X-Goog-AuthUser",this.P);const e=this.A();return e&&this.R.set("Authorization",e),this.T&&this.R.set("X-Goog-Iam-Authorization-Token",this.T),this.R}}class Ov{constructor(e,t,r){this.P=e,this.T=t,this.I=r}getToken(){return Promise.resolve(new Vv(this.P,this.T,this.I))}start(e,t){e.enqueueRetryable(()=>t(xe.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class fu{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Mv{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,He(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){te(this.o===void 0,3512);const r=s=>{s.error!=null&&H("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${s.error.message}`);const a=s.token!==this.m;return this.m=s.token,H("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?t(s.token):Promise.resolve()};this.o=s=>{e.enqueueRetryable(()=>r(s))};const i=s=>{H("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=s,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(s=>i(s)),setTimeout(()=>{if(!this.appCheck){const s=this.V.getImmediate({optional:!0});s?i(s):H("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new fu(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(te(typeof t.token=="string",44558,{tokenResult:t}),this.m=t.token,new fu(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
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
 */function Fv(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
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
 */class Ko{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const i=Fv(40);for(let s=0;s<i.length;++s)r.length<20&&i[s]<t&&(r+=e.charAt(i[s]%62))}return r}}function J(n,e){return n<e?-1:n>e?1:0}function zo(n,e){const t=Math.min(n.length,e.length);for(let r=0;r<t;r++){const i=n.charAt(r),s=e.charAt(r);if(i!==s)return Go(i)===Go(s)?J(i,s):Go(i)?1:-1}return J(n.length,e.length)}const Uv=55296,Bv=57343;function Go(n){const e=n.charCodeAt(0);return e>=Uv&&e<=Bv}function Kn(n,e,t){return n.length===e.length&&n.every((r,i)=>t(r,e[i]))}/**
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
 */const pu="__name__";class rt{constructor(e,t,r){t===void 0?t=0:t>e.length&&G(637,{offset:t,range:e.length}),r===void 0?r=e.length-t:r>e.length-t&&G(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return rt.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof rt?e.forEach(r=>{t.push(r)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let i=0;i<r;i++){const s=rt.compareSegments(e.get(i),t.get(i));if(s!==0)return s}return J(e.length,t.length)}static compareSegments(e,t){const r=rt.isNumericId(e),i=rt.isNumericId(t);return r&&!i?-1:!r&&i?1:r&&i?rt.extractNumericId(e).compare(rt.extractNumericId(t)):zo(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return qt.fromString(e.substring(4,e.length-2))}}class re extends rt{construct(e,t,r){return new re(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new q(L.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(i=>i.length>0))}return new re(t)}static emptyPath(){return new re([])}}const qv=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class we extends rt{construct(e,t,r){return new we(e,t,r)}static isValidIdentifier(e){return qv.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),we.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===pu}static keyField(){return new we([pu])}static fromServerFormat(e){const t=[];let r="",i=0;const s=()=>{if(r.length===0)throw new q(L.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let a=!1;for(;i<e.length;){const c=e[i];if(c==="\\"){if(i+1===e.length)throw new q(L.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const l=e[i+1];if(l!=="\\"&&l!=="."&&l!=="`")throw new q(L.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=l,i+=2}else c==="`"?(a=!a,i++):c!=="."||a?(r+=c,i++):(s(),i++)}if(s(),a)throw new q(L.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new we(t)}static emptyPath(){return new we([])}}/**
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
 */class j{constructor(e){this.path=e}static fromPath(e){return new j(re.fromString(e))}static fromName(e){return new j(re.fromString(e).popFirst(5))}static empty(){return new j(re.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&re.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return re.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new j(new re(e.slice()))}}/**
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
 */function gu(n,e,t){if(!t)throw new q(L.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function $v(n,e,t,r){if(e===!0&&r===!0)throw new q(L.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function mu(n){if(!j.isDocumentKey(n))throw new q(L.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function yu(n){if(j.isDocumentKey(n))throw new q(L.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function vu(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function ns(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":G(12329,{type:typeof n})}function gn(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new q(L.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=ns(n);throw new q(L.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
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
 */function he(n,e){const t={typeString:n};return e&&(t.value=e),t}function Or(n,e){if(!vu(n))throw new q(L.INVALID_ARGUMENT,"JSON must be an object");let t;for(const r in e)if(e[r]){const i=e[r].typeString,s="value"in e[r]?{value:e[r].value}:void 0;if(!(r in n)){t=`JSON missing required field: '${r}'`;break}const a=n[r];if(i&&typeof a!==i){t=`JSON field '${r}' must be a ${i}.`;break}if(s!==void 0&&a!==s.value){t=`Expected '${r}' field to equal '${s.value}'`;break}}if(t)throw new q(L.INVALID_ARGUMENT,t);return!0}/**
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
 */const _u=-62135596800,bu=1e6;class ie{static now(){return ie.fromMillis(Date.now())}static fromDate(e){return ie.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor((e-1e3*t)*bu);return new ie(t,r)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new q(L.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new q(L.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<_u)throw new q(L.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new q(L.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/bu}_compareTo(e){return this.seconds===e.seconds?J(this.nanoseconds,e.nanoseconds):J(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:ie._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(Or(e,ie._jsonSchema))return new ie(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-_u;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}ie._jsonSchemaVersion="firestore/timestamp/1.0",ie._jsonSchema={type:he("string",ie._jsonSchemaVersion),seconds:he("number"),nanoseconds:he("number")};/**
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
 */class W{static fromTimestamp(e){return new W(e)}static min(){return new W(new ie(0,0))}static max(){return new W(new ie(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
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
 */const Mr=-1;function Hv(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,i=W.fromTimestamp(r===1e9?new ie(t+1,0):new ie(t,r));return new $t(i,j.empty(),e)}function jv(n){return new $t(n.readTime,n.key,Mr)}class $t{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new $t(W.min(),j.empty(),Mr)}static max(){return new $t(W.max(),j.empty(),Mr)}}function Kv(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=j.comparator(n.documentKey,e.documentKey),t!==0?t:J(n.largestBatchId,e.largestBatchId))}/**
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
 */const zv="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class Gv{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
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
 */async function zn(n){if(n.code!==L.FAILED_PRECONDITION||n.message!==zv)throw n;H("LocalStore","Unexpectedly lost primary lease")}/**
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
 */class V{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&G(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new V((r,i)=>{this.nextCallback=s=>{this.wrapSuccess(e,s).next(r,i)},this.catchCallback=s=>{this.wrapFailure(t,s).next(r,i)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof V?t:V.resolve(t)}catch(t){return V.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):V.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):V.reject(t)}static resolve(e){return new V((t,r)=>{t(e)})}static reject(e){return new V((t,r)=>{r(e)})}static waitFor(e){return new V((t,r)=>{let i=0,s=0,a=!1;e.forEach(c=>{++i,c.next(()=>{++s,a&&s===i&&t()},l=>r(l))}),a=!0,s===i&&t()})}static or(e){let t=V.resolve(!1);for(const r of e)t=t.next(i=>i?V.resolve(i):r());return t}static forEach(e,t){const r=[];return e.forEach((i,s)=>{r.push(t.call(this,i,s))}),this.waitFor(r)}static mapArray(e,t){return new V((r,i)=>{const s=e.length,a=new Array(s);let c=0;for(let l=0;l<s;l++){const u=l;t(e[u]).next(f=>{a[u]=f,++c,c===s&&r(a)},f=>i(f))}})}static doWhile(e,t){return new V((r,i)=>{const s=()=>{e()===!0?t().next(()=>{s()},i):r()};s()})}}function Wv(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function Gn(n){return n.name==="IndexedDbTransactionError"}/**
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
 */class rs{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.ae(r),this.ue=r=>t.writeSequenceNumber(r))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ue&&this.ue(e),e}}rs.ce=-1;/**
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
 */const Wo=-1;function is(n){return n==null}function ss(n){return n===0&&1/n==-1/0}function Qv(n){return typeof n=="number"&&Number.isInteger(n)&&!ss(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
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
 */const wu="";function Yv(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=Eu(e)),e=Xv(n.get(t),e);return Eu(e)}function Xv(n,e){let t=e;const r=n.length;for(let i=0;i<r;i++){const s=n.charAt(i);switch(s){case"\0":t+="";break;case wu:t+="";break;default:t+=s}}return t}function Eu(n){return n+wu+""}/**
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
 */function Tu(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function mn(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function Iu(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
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
 */class ae{constructor(e,t){this.comparator=e,this.root=t||Ee.EMPTY}insert(e,t){return new ae(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Ee.BLACK,null,null))}remove(e){return new ae(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Ee.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const i=this.comparator(e,r.key);if(i===0)return t+r.left.size;i<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){const e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new os(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new os(this.root,e,this.comparator,!1)}getReverseIterator(){return new os(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new os(this.root,e,this.comparator,!0)}}class os{constructor(e,t,r,i){this.isReverse=i,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=t?r(e.key,t):1,t&&i&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Ee{constructor(e,t,r,i,s){this.key=e,this.value=t,this.color=r??Ee.RED,this.left=i??Ee.EMPTY,this.right=s??Ee.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,i,s){return new Ee(e??this.key,t??this.value,r??this.color,i??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let i=this;const s=r(e,i.key);return i=s<0?i.copy(null,null,null,i.left.insert(e,t,r),null):s===0?i.copy(null,t,null,null,null):i.copy(null,null,null,null,i.right.insert(e,t,r)),i.fixUp()}removeMin(){if(this.left.isEmpty())return Ee.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,i=this;if(t(e,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(e,t),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),t(e,i.key)===0){if(i.right.isEmpty())return Ee.EMPTY;r=i.right.min(),i=i.copy(r.key,r.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(e,t))}return i.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Ee.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Ee.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw G(43730,{key:this.key,value:this.value});if(this.right.isRed())throw G(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw G(27949);return e+(this.isRed()?0:1)}}Ee.EMPTY=null,Ee.RED=!0,Ee.BLACK=!1,Ee.EMPTY=new class{constructor(){this.size=0}get key(){throw G(57766)}get value(){throw G(16141)}get color(){throw G(16727)}get left(){throw G(29726)}get right(){throw G(36894)}copy(e,t,r,i,s){return this}insert(e,t,r){return new Ee(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
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
 */class me{constructor(e){this.comparator=e,this.data=new ae(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const i=r.getNext();if(this.comparator(i.key,e[1])>=0)return;t(i.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new xu(this.data.getIterator())}getIteratorFrom(e){return new xu(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(r=>{t=t.add(r)}),t}isEqual(e){if(!(e instanceof me)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const i=t.getNext().key,s=r.getNext().key;if(this.comparator(i,s)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new me(this.comparator);return t.data=e,t}}class xu{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
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
 */class Xe{constructor(e){this.fields=e,e.sort(we.comparator)}static empty(){return new Xe([])}unionWith(e){let t=new me(we.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new Xe(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Kn(this.fields,e.fields,(t,r)=>t.isEqual(r))}}/**
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
 */class Au extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
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
 */class Te{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(i){try{return atob(i)}catch(s){throw typeof DOMException<"u"&&s instanceof DOMException?new Au("Invalid base64 string: "+s):s}}(e);return new Te(t)}static fromUint8Array(e){const t=function(i){let s="";for(let a=0;a<i.length;++a)s+=String.fromCharCode(i[a]);return s}(e);return new Te(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const r=new Uint8Array(t.length);for(let i=0;i<t.length;i++)r[i]=t.charCodeAt(i);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return J(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Te.EMPTY_BYTE_STRING=new Te("");const Jv=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Ht(n){if(te(!!n,39018),typeof n=="string"){let e=0;const t=Jv.exec(n);if(te(!!t,46558,{timestamp:n}),t[1]){let i=t[1];i=(i+"000000000").substr(0,9),e=Number(i)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:le(n.seconds),nanos:le(n.nanos)}}function le(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function jt(n){return typeof n=="string"?Te.fromBase64String(n):Te.fromUint8Array(n)}/**
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
 */const Su="server_timestamp",Cu="__type__",ku="__previous_value__",Ru="__local_write_time__";function Qo(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[Cu])==null?void 0:r.stringValue)===Su}function as(n){const e=n.mapValue.fields[ku];return Qo(e)?as(e):e}function Fr(n){const e=Ht(n.mapValue.fields[Ru].timestampValue);return new ie(e.seconds,e.nanos)}/**
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
 */class Zv{constructor(e,t,r,i,s,a,c,l,u,f,p){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=i,this.ssl=s,this.forceLongPolling=a,this.autoDetectLongPolling=c,this.longPollingOptions=l,this.useFetchStreams=u,this.isUsingEmulator=f,this.apiKey=p}}const cs="(default)";class Ur{constructor(e,t){this.projectId=e,this.database=t||cs}static empty(){return new Ur("","")}get isDefaultDatabase(){return this.database===cs}isEqual(e){return e instanceof Ur&&e.projectId===this.projectId&&e.database===this.database}}function e_(n,e){if(!Object.prototype.hasOwnProperty.apply(n.options,["projectId"]))throw new q(L.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Ur(n.options.projectId,e)}/**
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
 */const Pu="__type__",t_="__max__",ls={mapValue:{}},Nu="__vector__",us="value";function Kt(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?Qo(n)?4:r_(n)?9007199254740991:n_(n)?10:11:G(28295,{value:n})}function it(n,e){if(n===e)return!0;const t=Kt(n);if(t!==Kt(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return Fr(n).isEqual(Fr(e));case 3:return function(i,s){if(typeof i.timestampValue=="string"&&typeof s.timestampValue=="string"&&i.timestampValue.length===s.timestampValue.length)return i.timestampValue===s.timestampValue;const a=Ht(i.timestampValue),c=Ht(s.timestampValue);return a.seconds===c.seconds&&a.nanos===c.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(i,s){return jt(i.bytesValue).isEqual(jt(s.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(i,s){return le(i.geoPointValue.latitude)===le(s.geoPointValue.latitude)&&le(i.geoPointValue.longitude)===le(s.geoPointValue.longitude)}(n,e);case 2:return function(i,s){if("integerValue"in i&&"integerValue"in s)return le(i.integerValue)===le(s.integerValue);if("doubleValue"in i&&"doubleValue"in s){const a=le(i.doubleValue),c=le(s.doubleValue);return a===c?ss(a)===ss(c):isNaN(a)&&isNaN(c)}return!1}(n,e);case 9:return Kn(n.arrayValue.values||[],e.arrayValue.values||[],it);case 10:case 11:return function(i,s){const a=i.mapValue.fields||{},c=s.mapValue.fields||{};if(Tu(a)!==Tu(c))return!1;for(const l in a)if(a.hasOwnProperty(l)&&(c[l]===void 0||!it(a[l],c[l])))return!1;return!0}(n,e);default:return G(52216,{left:n})}}function Br(n,e){return(n.values||[]).find(t=>it(t,e))!==void 0}function Wn(n,e){if(n===e)return 0;const t=Kt(n),r=Kt(e);if(t!==r)return J(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return J(n.booleanValue,e.booleanValue);case 2:return function(s,a){const c=le(s.integerValue||s.doubleValue),l=le(a.integerValue||a.doubleValue);return c<l?-1:c>l?1:c===l?0:isNaN(c)?isNaN(l)?0:-1:1}(n,e);case 3:return Du(n.timestampValue,e.timestampValue);case 4:return Du(Fr(n),Fr(e));case 5:return zo(n.stringValue,e.stringValue);case 6:return function(s,a){const c=jt(s),l=jt(a);return c.compareTo(l)}(n.bytesValue,e.bytesValue);case 7:return function(s,a){const c=s.split("/"),l=a.split("/");for(let u=0;u<c.length&&u<l.length;u++){const f=J(c[u],l[u]);if(f!==0)return f}return J(c.length,l.length)}(n.referenceValue,e.referenceValue);case 8:return function(s,a){const c=J(le(s.latitude),le(a.latitude));return c!==0?c:J(le(s.longitude),le(a.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return Lu(n.arrayValue,e.arrayValue);case 10:return function(s,a){var y,A,E,w;const c=s.fields||{},l=a.fields||{},u=(y=c[us])==null?void 0:y.arrayValue,f=(A=l[us])==null?void 0:A.arrayValue,p=J(((E=u==null?void 0:u.values)==null?void 0:E.length)||0,((w=f==null?void 0:f.values)==null?void 0:w.length)||0);return p!==0?p:Lu(u,f)}(n.mapValue,e.mapValue);case 11:return function(s,a){if(s===ls.mapValue&&a===ls.mapValue)return 0;if(s===ls.mapValue)return 1;if(a===ls.mapValue)return-1;const c=s.fields||{},l=Object.keys(c),u=a.fields||{},f=Object.keys(u);l.sort(),f.sort();for(let p=0;p<l.length&&p<f.length;++p){const y=zo(l[p],f[p]);if(y!==0)return y;const A=Wn(c[l[p]],u[f[p]]);if(A!==0)return A}return J(l.length,f.length)}(n.mapValue,e.mapValue);default:throw G(23264,{he:t})}}function Du(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return J(n,e);const t=Ht(n),r=Ht(e),i=J(t.seconds,r.seconds);return i!==0?i:J(t.nanos,r.nanos)}function Lu(n,e){const t=n.values||[],r=e.values||[];for(let i=0;i<t.length&&i<r.length;++i){const s=Wn(t[i],r[i]);if(s)return s}return J(t.length,r.length)}function Qn(n){return Yo(n)}function Yo(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(t){const r=Ht(t);return`time(${r.seconds},${r.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(t){return jt(t).toBase64()}(n.bytesValue):"referenceValue"in n?function(t){return j.fromName(t).toString()}(n.referenceValue):"geoPointValue"in n?function(t){return`geo(${t.latitude},${t.longitude})`}(n.geoPointValue):"arrayValue"in n?function(t){let r="[",i=!0;for(const s of t.values||[])i?i=!1:r+=",",r+=Yo(s);return r+"]"}(n.arrayValue):"mapValue"in n?function(t){const r=Object.keys(t.fields||{}).sort();let i="{",s=!0;for(const a of r)s?s=!1:i+=",",i+=`${a}:${Yo(t.fields[a])}`;return i+"}"}(n.mapValue):G(61005,{value:n})}function hs(n){switch(Kt(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=as(n);return e?16+hs(e):16;case 5:return 2*n.stringValue.length;case 6:return jt(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return function(r){return(r.values||[]).reduce((i,s)=>i+hs(s),0)}(n.arrayValue);case 10:case 11:return function(r){let i=0;return mn(r.fields,(s,a)=>{i+=s.length+hs(a)}),i}(n.mapValue);default:throw G(13486,{value:n})}}function Vu(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function Xo(n){return!!n&&"integerValue"in n}function Jo(n){return!!n&&"arrayValue"in n}function Ou(n){return!!n&&"nullValue"in n}function Mu(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function ds(n){return!!n&&"mapValue"in n}function n_(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[Pu])==null?void 0:r.stringValue)===Nu}function qr(n){if(n.geoPointValue)return{geoPointValue:{...n.geoPointValue}};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:{...n.timestampValue}};if(n.mapValue){const e={mapValue:{fields:{}}};return mn(n.mapValue.fields,(t,r)=>e.mapValue.fields[t]=qr(r)),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=qr(n.arrayValue.values[t]);return e}return{...n}}function r_(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===t_}/**
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
 */class je{constructor(e){this.value=e}static empty(){return new je({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!ds(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=qr(t)}setAll(e){let t=we.emptyPath(),r={},i=[];e.forEach((a,c)=>{if(!t.isImmediateParentOf(c)){const l=this.getFieldsMap(t);this.applyChanges(l,r,i),r={},i=[],t=c.popLast()}a?r[c.lastSegment()]=qr(a):i.push(c.lastSegment())});const s=this.getFieldsMap(t);this.applyChanges(s,r,i)}delete(e){const t=this.field(e.popLast());ds(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return it(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let i=t.mapValue.fields[e.get(r)];ds(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=i),t=i}return t.mapValue.fields}applyChanges(e,t,r){mn(t,(i,s)=>e[i]=s);for(const i of r)delete e[i]}clone(){return new je(qr(this.value))}}function Fu(n){const e=[];return mn(n.fields,(t,r)=>{const i=new we([t]);if(ds(r)){const s=Fu(r.mapValue).fields;if(s.length===0)e.push(i);else for(const a of s)e.push(i.child(a))}else e.push(i)}),new Xe(e)}/**
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
 */class Ae{constructor(e,t,r,i,s,a,c){this.key=e,this.documentType=t,this.version=r,this.readTime=i,this.createTime=s,this.data=a,this.documentState=c}static newInvalidDocument(e){return new Ae(e,0,W.min(),W.min(),W.min(),je.empty(),0)}static newFoundDocument(e,t,r,i){return new Ae(e,1,t,W.min(),r,i,0)}static newNoDocument(e,t){return new Ae(e,2,t,W.min(),W.min(),je.empty(),0)}static newUnknownDocument(e,t){return new Ae(e,3,t,W.min(),W.min(),je.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(W.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=je.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=je.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=W.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Ae&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Ae(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
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
 */class fs{constructor(e,t){this.position=e,this.inclusive=t}}function Uu(n,e,t){let r=0;for(let i=0;i<n.position.length;i++){const s=e[i],a=n.position[i];if(s.field.isKeyField()?r=j.comparator(j.fromName(a.referenceValue),t.key):r=Wn(a,t.data.field(s.field)),s.dir==="desc"&&(r*=-1),r!==0)break}return r}function Bu(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!it(n.position[t],e.position[t]))return!1;return!0}/**
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
 */class ps{constructor(e,t="asc"){this.field=e,this.dir=t}}function i_(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
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
 */class qu{}class de extends qu{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new o_(e,t,r):t==="array-contains"?new l_(e,r):t==="in"?new u_(e,r):t==="not-in"?new h_(e,r):t==="array-contains-any"?new d_(e,r):new de(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new a_(e,r):new c_(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(Wn(t,this.value)):t!==null&&Kt(this.value)===Kt(t)&&this.matchesComparison(Wn(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return G(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Je extends qu{constructor(e,t){super(),this.filters=e,this.op=t,this.Pe=null}static create(e,t){return new Je(e,t)}matches(e){return $u(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.Pe!==null||(this.Pe=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}}function $u(n){return n.op==="and"}function Hu(n){return s_(n)&&$u(n)}function s_(n){for(const e of n.filters)if(e instanceof Je)return!1;return!0}function Zo(n){if(n instanceof de)return n.field.canonicalString()+n.op.toString()+Qn(n.value);if(Hu(n))return n.filters.map(e=>Zo(e)).join(",");{const e=n.filters.map(t=>Zo(t)).join(",");return`${n.op}(${e})`}}function ju(n,e){return n instanceof de?function(r,i){return i instanceof de&&r.op===i.op&&r.field.isEqual(i.field)&&it(r.value,i.value)}(n,e):n instanceof Je?function(r,i){return i instanceof Je&&r.op===i.op&&r.filters.length===i.filters.length?r.filters.reduce((s,a,c)=>s&&ju(a,i.filters[c]),!0):!1}(n,e):void G(19439)}function Ku(n){return n instanceof de?function(t){return`${t.field.canonicalString()} ${t.op} ${Qn(t.value)}`}(n):n instanceof Je?function(t){return t.op.toString()+" {"+t.getFilters().map(Ku).join(" ,")+"}"}(n):"Filter"}class o_ extends de{constructor(e,t,r){super(e,t,r),this.key=j.fromName(r.referenceValue)}matches(e){const t=j.comparator(e.key,this.key);return this.matchesComparison(t)}}class a_ extends de{constructor(e,t){super(e,"in",t),this.keys=zu("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class c_ extends de{constructor(e,t){super(e,"not-in",t),this.keys=zu("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function zu(n,e){var t;return(((t=e.arrayValue)==null?void 0:t.values)||[]).map(r=>j.fromName(r.referenceValue))}class l_ extends de{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Jo(t)&&Br(t.arrayValue,this.value)}}class u_ extends de{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Br(this.value.arrayValue,t)}}class h_ extends de{constructor(e,t){super(e,"not-in",t)}matches(e){if(Br(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!Br(this.value.arrayValue,t)}}class d_ extends de{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Jo(t)||!t.arrayValue.values)&&t.arrayValue.values.some(r=>Br(this.value.arrayValue,r))}}/**
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
 */class f_{constructor(e,t=null,r=[],i=[],s=null,a=null,c=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=i,this.limit=s,this.startAt=a,this.endAt=c,this.Te=null}}function Gu(n,e=null,t=[],r=[],i=null,s=null,a=null){return new f_(n,e,t,r,i,s,a)}function ea(n){const e=Q(n);if(e.Te===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(r=>Zo(r)).join(","),t+="|ob:",t+=e.orderBy.map(r=>function(s){return s.field.canonicalString()+s.dir}(r)).join(","),is(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(r=>Qn(r)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(r=>Qn(r)).join(",")),e.Te=t}return e.Te}function ta(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!i_(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!ju(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!Bu(n.startAt,e.startAt)&&Bu(n.endAt,e.endAt)}function na(n){return j.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
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
 */class $r{constructor(e,t=null,r=[],i=[],s=null,a="F",c=null,l=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=i,this.limit=s,this.limitType=a,this.startAt=c,this.endAt=l,this.Ee=null,this.Ie=null,this.Re=null,this.startAt,this.endAt}}function p_(n,e,t,r,i,s,a,c){return new $r(n,e,t,r,i,s,a,c)}function ra(n){return new $r(n)}function Wu(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function g_(n){return j.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function Qu(n){return n.collectionGroup!==null}function Hr(n){const e=Q(n);if(e.Ee===null){e.Ee=[];const t=new Set;for(const s of e.explicitOrderBy)e.Ee.push(s),t.add(s.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let c=new me(we.comparator);return a.filters.forEach(l=>{l.getFlattenedFilters().forEach(u=>{u.isInequality()&&(c=c.add(u.field))})}),c})(e).forEach(s=>{t.has(s.canonicalString())||s.isKeyField()||e.Ee.push(new ps(s,r))}),t.has(we.keyField().canonicalString())||e.Ee.push(new ps(we.keyField(),r))}return e.Ee}function st(n){const e=Q(n);return e.Ie||(e.Ie=m_(e,Hr(n))),e.Ie}function m_(n,e){if(n.limitType==="F")return Gu(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map(i=>{const s=i.dir==="desc"?"asc":"desc";return new ps(i.field,s)});const t=n.endAt?new fs(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new fs(n.startAt.position,n.startAt.inclusive):null;return Gu(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function ia(n,e){const t=n.filters.concat([e]);return new $r(n.path,n.collectionGroup,n.explicitOrderBy.slice(),t,n.limit,n.limitType,n.startAt,n.endAt)}function sa(n,e,t){return new $r(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function gs(n,e){return ta(st(n),st(e))&&n.limitType===e.limitType}function Yu(n){return`${ea(st(n))}|lt:${n.limitType}`}function Yn(n){return`Query(target=${function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map(i=>Ku(i)).join(", ")}]`),is(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map(i=>function(a){return`${a.field.canonicalString()} (${a.dir})`}(i)).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map(i=>Qn(i)).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map(i=>Qn(i)).join(",")),`Target(${r})`}(st(n))}; limitType=${n.limitType})`}function ms(n,e){return e.isFoundDocument()&&function(r,i){const s=i.key.path;return r.collectionGroup!==null?i.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(s):j.isDocumentKey(r.path)?r.path.isEqual(s):r.path.isImmediateParentOf(s)}(n,e)&&function(r,i){for(const s of Hr(r))if(!s.field.isKeyField()&&i.data.field(s.field)===null)return!1;return!0}(n,e)&&function(r,i){for(const s of r.filters)if(!s.matches(i))return!1;return!0}(n,e)&&function(r,i){return!(r.startAt&&!function(a,c,l){const u=Uu(a,c,l);return a.inclusive?u<=0:u<0}(r.startAt,Hr(r),i)||r.endAt&&!function(a,c,l){const u=Uu(a,c,l);return a.inclusive?u>=0:u>0}(r.endAt,Hr(r),i))}(n,e)}function y_(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function Xu(n){return(e,t)=>{let r=!1;for(const i of Hr(n)){const s=v_(i,e,t);if(s!==0)return s;r=r||i.field.isKeyField()}return 0}}function v_(n,e,t){const r=n.field.isKeyField()?j.comparator(e.key,t.key):function(s,a,c){const l=a.data.field(s),u=c.data.field(s);return l!==null&&u!==null?Wn(l,u):G(42886)}(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return G(19790,{direction:n.dir})}}/**
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
 */class yn{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[i,s]of r)if(this.equalsFn(i,e))return s}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),i=this.inner[r];if(i===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let s=0;s<i.length;s++)if(this.equalsFn(i[s][0],e))return void(i[s]=[e,t]);i.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let i=0;i<r.length;i++)if(this.equalsFn(r[i][0],e))return r.length===1?delete this.inner[t]:r.splice(i,1),this.innerSize--,!0;return!1}forEach(e){mn(this.inner,(t,r)=>{for(const[i,s]of r)e(i,s)})}isEmpty(){return Iu(this.inner)}size(){return this.innerSize}}/**
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
 */const __=new ae(j.comparator);function wt(){return __}const Ju=new ae(j.comparator);function jr(...n){let e=Ju;for(const t of n)e=e.insert(t.key,t);return e}function Zu(n){let e=Ju;return n.forEach((t,r)=>e=e.insert(t,r.overlayedDocument)),e}function vn(){return Kr()}function eh(){return Kr()}function Kr(){return new yn(n=>n.toString(),(n,e)=>n.isEqual(e))}const b_=new ae(j.comparator),w_=new me(j.comparator);function Z(...n){let e=w_;for(const t of n)e=e.add(t);return e}const E_=new me(J);function T_(){return E_}/**
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
 */function oa(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:ss(e)?"-0":e}}function th(n){return{integerValue:""+n}}function I_(n,e){return Qv(e)?th(e):oa(n,e)}/**
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
 */class ys{constructor(){this._=void 0}}function x_(n,e,t){return n instanceof zr?function(i,s){const a={fields:{[Cu]:{stringValue:Su},[Ru]:{timestampValue:{seconds:i.seconds,nanos:i.nanoseconds}}}};return s&&Qo(s)&&(s=as(s)),s&&(a.fields[ku]=s),{mapValue:a}}(t,e):n instanceof Gr?rh(n,e):n instanceof Wr?ih(n,e):function(i,s){const a=nh(i,s),c=sh(a)+sh(i.Ae);return Xo(a)&&Xo(i.Ae)?th(c):oa(i.serializer,c)}(n,e)}function A_(n,e,t){return n instanceof Gr?rh(n,e):n instanceof Wr?ih(n,e):t}function nh(n,e){return n instanceof vs?function(r){return Xo(r)||function(s){return!!s&&"doubleValue"in s}(r)}(e)?e:{integerValue:0}:null}class zr extends ys{}class Gr extends ys{constructor(e){super(),this.elements=e}}function rh(n,e){const t=oh(e);for(const r of n.elements)t.some(i=>it(i,r))||t.push(r);return{arrayValue:{values:t}}}class Wr extends ys{constructor(e){super(),this.elements=e}}function ih(n,e){let t=oh(e);for(const r of n.elements)t=t.filter(i=>!it(i,r));return{arrayValue:{values:t}}}class vs extends ys{constructor(e,t){super(),this.serializer=e,this.Ae=t}}function sh(n){return le(n.integerValue||n.doubleValue)}function oh(n){return Jo(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}/**
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
 */class S_{constructor(e,t){this.field=e,this.transform=t}}function C_(n,e){return n.field.isEqual(e.field)&&function(r,i){return r instanceof Gr&&i instanceof Gr||r instanceof Wr&&i instanceof Wr?Kn(r.elements,i.elements,it):r instanceof vs&&i instanceof vs?it(r.Ae,i.Ae):r instanceof zr&&i instanceof zr}(n.transform,e.transform)}class k_{constructor(e,t){this.version=e,this.transformResults=t}}class Et{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Et}static exists(e){return new Et(void 0,e)}static updateTime(e){return new Et(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function _s(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class bs{}function ah(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new dh(n.key,Et.none()):new Yr(n.key,n.data,Et.none());{const t=n.data,r=je.empty();let i=new me(we.comparator);for(let s of e.fields)if(!i.has(s)){let a=t.field(s);a===null&&s.length>1&&(s=s.popLast(),a=t.field(s)),a===null?r.delete(s):r.set(s,a),i=i.add(s)}return new _n(n.key,r,new Xe(i.toArray()),Et.none())}}function R_(n,e,t){n instanceof Yr?function(i,s,a){const c=i.value.clone(),l=uh(i.fieldTransforms,s,a.transformResults);c.setAll(l),s.convertToFoundDocument(a.version,c).setHasCommittedMutations()}(n,e,t):n instanceof _n?function(i,s,a){if(!_s(i.precondition,s))return void s.convertToUnknownDocument(a.version);const c=uh(i.fieldTransforms,s,a.transformResults),l=s.data;l.setAll(lh(i)),l.setAll(c),s.convertToFoundDocument(a.version,l).setHasCommittedMutations()}(n,e,t):function(i,s,a){s.convertToNoDocument(a.version).setHasCommittedMutations()}(0,e,t)}function Qr(n,e,t,r){return n instanceof Yr?function(s,a,c,l){if(!_s(s.precondition,a))return c;const u=s.value.clone(),f=hh(s.fieldTransforms,l,a);return u.setAll(f),a.convertToFoundDocument(a.version,u).setHasLocalMutations(),null}(n,e,t,r):n instanceof _n?function(s,a,c,l){if(!_s(s.precondition,a))return c;const u=hh(s.fieldTransforms,l,a),f=a.data;return f.setAll(lh(s)),f.setAll(u),a.convertToFoundDocument(a.version,f).setHasLocalMutations(),c===null?null:c.unionWith(s.fieldMask.fields).unionWith(s.fieldTransforms.map(p=>p.field))}(n,e,t,r):function(s,a,c){return _s(s.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):c}(n,e,t)}function P_(n,e){let t=null;for(const r of n.fieldTransforms){const i=e.data.field(r.field),s=nh(r.transform,i||null);s!=null&&(t===null&&(t=je.empty()),t.set(r.field,s))}return t||null}function ch(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!function(r,i){return r===void 0&&i===void 0||!(!r||!i)&&Kn(r,i,(s,a)=>C_(s,a))}(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class Yr extends bs{constructor(e,t,r,i=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class _n extends bs{constructor(e,t,r,i,s=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=i,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function lh(n){const e=new Map;return n.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}}),e}function uh(n,e,t){const r=new Map;te(n.length===t.length,32656,{Ve:t.length,de:n.length});for(let i=0;i<t.length;i++){const s=n[i],a=s.transform,c=e.data.field(s.field);r.set(s.field,A_(a,c,t[i]))}return r}function hh(n,e,t){const r=new Map;for(const i of n){const s=i.transform,a=t.data.field(i.field);r.set(i.field,x_(s,a,e))}return r}class dh extends bs{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class N_ extends bs{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
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
 */class D_{constructor(e,t,r,i){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=i}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let i=0;i<this.mutations.length;i++){const s=this.mutations[i];s.key.isEqual(e.key)&&R_(s,e,r[i])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=Qr(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=Qr(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=eh();return this.mutations.forEach(i=>{const s=e.get(i.key),a=s.overlayedDocument;let c=this.applyToLocalView(a,s.mutatedFields);c=t.has(i.key)?null:c;const l=ah(a,c);l!==null&&r.set(i.key,l),a.isValidDocument()||a.convertToNoDocument(W.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),Z())}isEqual(e){return this.batchId===e.batchId&&Kn(this.mutations,e.mutations,(t,r)=>ch(t,r))&&Kn(this.baseMutations,e.baseMutations,(t,r)=>ch(t,r))}}class aa{constructor(e,t,r,i){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=i}static from(e,t,r){te(e.mutations.length===r.length,58842,{me:e.mutations.length,fe:r.length});let i=function(){return b_}();const s=e.mutations;for(let a=0;a<s.length;a++)i=i.insert(s[a].key,r[a].version);return new aa(e,t,r,i)}}/**
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
 */class L_{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
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
 */class V_{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
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
 */var fe,ee;function O_(n){switch(n){case L.OK:return G(64938);case L.CANCELLED:case L.UNKNOWN:case L.DEADLINE_EXCEEDED:case L.RESOURCE_EXHAUSTED:case L.INTERNAL:case L.UNAVAILABLE:case L.UNAUTHENTICATED:return!1;case L.INVALID_ARGUMENT:case L.NOT_FOUND:case L.ALREADY_EXISTS:case L.PERMISSION_DENIED:case L.FAILED_PRECONDITION:case L.ABORTED:case L.OUT_OF_RANGE:case L.UNIMPLEMENTED:case L.DATA_LOSS:return!0;default:return G(15467,{code:n})}}function fh(n){if(n===void 0)return _t("GRPC error has no .code"),L.UNKNOWN;switch(n){case fe.OK:return L.OK;case fe.CANCELLED:return L.CANCELLED;case fe.UNKNOWN:return L.UNKNOWN;case fe.DEADLINE_EXCEEDED:return L.DEADLINE_EXCEEDED;case fe.RESOURCE_EXHAUSTED:return L.RESOURCE_EXHAUSTED;case fe.INTERNAL:return L.INTERNAL;case fe.UNAVAILABLE:return L.UNAVAILABLE;case fe.UNAUTHENTICATED:return L.UNAUTHENTICATED;case fe.INVALID_ARGUMENT:return L.INVALID_ARGUMENT;case fe.NOT_FOUND:return L.NOT_FOUND;case fe.ALREADY_EXISTS:return L.ALREADY_EXISTS;case fe.PERMISSION_DENIED:return L.PERMISSION_DENIED;case fe.FAILED_PRECONDITION:return L.FAILED_PRECONDITION;case fe.ABORTED:return L.ABORTED;case fe.OUT_OF_RANGE:return L.OUT_OF_RANGE;case fe.UNIMPLEMENTED:return L.UNIMPLEMENTED;case fe.DATA_LOSS:return L.DATA_LOSS;default:return G(39323,{code:n})}}(ee=fe||(fe={}))[ee.OK=0]="OK",ee[ee.CANCELLED=1]="CANCELLED",ee[ee.UNKNOWN=2]="UNKNOWN",ee[ee.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",ee[ee.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",ee[ee.NOT_FOUND=5]="NOT_FOUND",ee[ee.ALREADY_EXISTS=6]="ALREADY_EXISTS",ee[ee.PERMISSION_DENIED=7]="PERMISSION_DENIED",ee[ee.UNAUTHENTICATED=16]="UNAUTHENTICATED",ee[ee.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",ee[ee.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",ee[ee.ABORTED=10]="ABORTED",ee[ee.OUT_OF_RANGE=11]="OUT_OF_RANGE",ee[ee.UNIMPLEMENTED=12]="UNIMPLEMENTED",ee[ee.INTERNAL=13]="INTERNAL",ee[ee.UNAVAILABLE=14]="UNAVAILABLE",ee[ee.DATA_LOSS=15]="DATA_LOSS";/**
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
 */function M_(){return new TextEncoder}/**
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
 */const F_=new qt([4294967295,4294967295],0);function ph(n){const e=M_().encode(n),t=new su;return t.update(e),new Uint8Array(t.digest())}function gh(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),i=e.getUint32(8,!0),s=e.getUint32(12,!0);return[new qt([t,r],0),new qt([i,s],0)]}class ca{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new Xr(`Invalid padding: ${t}`);if(r<0)throw new Xr(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Xr(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new Xr(`Invalid padding when bitmap length is 0: ${t}`);this.ge=8*e.length-t,this.pe=qt.fromNumber(this.ge)}ye(e,t,r){let i=e.add(t.multiply(qt.fromNumber(r)));return i.compare(F_)===1&&(i=new qt([i.getBits(0),i.getBits(1)],0)),i.modulo(this.pe).toNumber()}we(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.ge===0)return!1;const t=ph(e),[r,i]=gh(t);for(let s=0;s<this.hashCount;s++){const a=this.ye(r,i,s);if(!this.we(a))return!1}return!0}static create(e,t,r){const i=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),a=new ca(s,i,t);return r.forEach(c=>a.insert(c)),a}insert(e){if(this.ge===0)return;const t=ph(e),[r,i]=gh(t);for(let s=0;s<this.hashCount;s++){const a=this.ye(r,i,s);this.Se(a)}}Se(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class Xr extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
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
 */class ws{constructor(e,t,r,i,s){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=i,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const i=new Map;return i.set(e,Jr.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new ws(W.min(),i,new ae(J),wt(),Z())}}class Jr{constructor(e,t,r,i,s){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=i,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new Jr(r,t,Z(),Z(),Z())}}/**
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
 */class Es{constructor(e,t,r,i){this.be=e,this.removedTargetIds=t,this.key=r,this.De=i}}class mh{constructor(e,t){this.targetId=e,this.Ce=t}}class yh{constructor(e,t,r=Te.EMPTY_BYTE_STRING,i=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=i}}class vh{constructor(){this.ve=0,this.Fe=_h(),this.Me=Te.EMPTY_BYTE_STRING,this.xe=!1,this.Oe=!0}get current(){return this.xe}get resumeToken(){return this.Me}get Ne(){return this.ve!==0}get Be(){return this.Oe}Le(e){e.approximateByteSize()>0&&(this.Oe=!0,this.Me=e)}ke(){let e=Z(),t=Z(),r=Z();return this.Fe.forEach((i,s)=>{switch(s){case 0:e=e.add(i);break;case 2:t=t.add(i);break;case 1:r=r.add(i);break;default:G(38017,{changeType:s})}}),new Jr(this.Me,this.xe,e,t,r)}qe(){this.Oe=!1,this.Fe=_h()}Ke(e,t){this.Oe=!0,this.Fe=this.Fe.insert(e,t)}Ue(e){this.Oe=!0,this.Fe=this.Fe.remove(e)}$e(){this.ve+=1}We(){this.ve-=1,te(this.ve>=0,3241,{ve:this.ve})}Qe(){this.Oe=!0,this.xe=!0}}class U_{constructor(e){this.Ge=e,this.ze=new Map,this.je=wt(),this.Je=Ts(),this.He=Ts(),this.Ze=new ae(J)}Xe(e){for(const t of e.be)e.De&&e.De.isFoundDocument()?this.Ye(t,e.De):this.et(t,e.key,e.De);for(const t of e.removedTargetIds)this.et(t,e.key,e.De)}tt(e){this.forEachTarget(e,t=>{const r=this.nt(t);switch(e.state){case 0:this.rt(t)&&r.Le(e.resumeToken);break;case 1:r.We(),r.Ne||r.qe(),r.Le(e.resumeToken);break;case 2:r.We(),r.Ne||this.removeTarget(t);break;case 3:this.rt(t)&&(r.Qe(),r.Le(e.resumeToken));break;case 4:this.rt(t)&&(this.it(t),r.Le(e.resumeToken));break;default:G(56790,{state:e.state})}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.ze.forEach((r,i)=>{this.rt(i)&&t(i)})}st(e){const t=e.targetId,r=e.Ce.count,i=this.ot(t);if(i){const s=i.target;if(na(s))if(r===0){const a=new j(s.path);this.et(t,a,Ae.newNoDocument(a,W.min()))}else te(r===1,20013,{expectedCount:r});else{const a=this._t(t);if(a!==r){const c=this.ut(e),l=c?this.ct(c,e,a):1;if(l!==0){this.it(t);const u=l===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ze=this.Ze.insert(t,u)}}}}}ut(e){const t=e.Ce.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:i=0},hashCount:s=0}=t;let a,c;try{a=jt(r).toUint8Array()}catch(l){if(l instanceof Au)return pn("Decoding the base64 bloom filter in existence filter failed ("+l.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw l}try{c=new ca(a,i,s)}catch(l){return pn(l instanceof Xr?"BloomFilter error: ":"Applying bloom filter failed: ",l),null}return c.ge===0?null:c}ct(e,t,r){return t.Ce.count===r-this.Pt(e,t.targetId)?0:2}Pt(e,t){const r=this.Ge.getRemoteKeysForTarget(t);let i=0;return r.forEach(s=>{const a=this.Ge.ht(),c=`projects/${a.projectId}/databases/${a.database}/documents/${s.path.canonicalString()}`;e.mightContain(c)||(this.et(t,s,null),i++)}),i}Tt(e){const t=new Map;this.ze.forEach((s,a)=>{const c=this.ot(a);if(c){if(s.current&&na(c.target)){const l=new j(c.target.path);this.Et(l).has(a)||this.It(a,l)||this.et(a,l,Ae.newNoDocument(l,e))}s.Be&&(t.set(a,s.ke()),s.qe())}});let r=Z();this.He.forEach((s,a)=>{let c=!0;a.forEachWhile(l=>{const u=this.ot(l);return!u||u.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)}),c&&(r=r.add(s))}),this.je.forEach((s,a)=>a.setReadTime(e));const i=new ws(e,t,this.Ze,this.je,r);return this.je=wt(),this.Je=Ts(),this.He=Ts(),this.Ze=new ae(J),i}Ye(e,t){if(!this.rt(e))return;const r=this.It(e,t.key)?2:0;this.nt(e).Ke(t.key,r),this.je=this.je.insert(t.key,t),this.Je=this.Je.insert(t.key,this.Et(t.key).add(e)),this.He=this.He.insert(t.key,this.Rt(t.key).add(e))}et(e,t,r){if(!this.rt(e))return;const i=this.nt(e);this.It(e,t)?i.Ke(t,1):i.Ue(t),this.He=this.He.insert(t,this.Rt(t).delete(e)),this.He=this.He.insert(t,this.Rt(t).add(e)),r&&(this.je=this.je.insert(t,r))}removeTarget(e){this.ze.delete(e)}_t(e){const t=this.nt(e).ke();return this.Ge.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}$e(e){this.nt(e).$e()}nt(e){let t=this.ze.get(e);return t||(t=new vh,this.ze.set(e,t)),t}Rt(e){let t=this.He.get(e);return t||(t=new me(J),this.He=this.He.insert(e,t)),t}Et(e){let t=this.Je.get(e);return t||(t=new me(J),this.Je=this.Je.insert(e,t)),t}rt(e){const t=this.ot(e)!==null;return t||H("WatchChangeAggregator","Detected inactive target",e),t}ot(e){const t=this.ze.get(e);return t&&t.Ne?null:this.Ge.At(e)}it(e){this.ze.set(e,new vh),this.Ge.getRemoteKeysForTarget(e).forEach(t=>{this.et(e,t,null)})}It(e,t){return this.Ge.getRemoteKeysForTarget(e).has(t)}}function Ts(){return new ae(j.comparator)}function _h(){return new ae(j.comparator)}const B_={asc:"ASCENDING",desc:"DESCENDING"},q_={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},$_={and:"AND",or:"OR"};class H_{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function la(n,e){return n.useProto3Json||is(e)?e:{value:e}}function Is(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function bh(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function j_(n,e){return Is(n,e.toTimestamp())}function ot(n){return te(!!n,49232),W.fromTimestamp(function(t){const r=Ht(t);return new ie(r.seconds,r.nanos)}(n))}function ua(n,e){return ha(n,e).canonicalString()}function ha(n,e){const t=function(i){return new re(["projects",i.projectId,"databases",i.database])}(n).child("documents");return e===void 0?t:t.child(e)}function wh(n){const e=re.fromString(n);return te(Sh(e),10190,{key:e.toString()}),e}function da(n,e){return ua(n.databaseId,e.path)}function fa(n,e){const t=wh(e);if(t.get(1)!==n.databaseId.projectId)throw new q(L.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new q(L.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new j(Th(t))}function Eh(n,e){return ua(n.databaseId,e)}function K_(n){const e=wh(n);return e.length===4?re.emptyPath():Th(e)}function pa(n){return new re(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function Th(n){return te(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function Ih(n,e,t){return{name:da(n,e),fields:t.value.mapValue.fields}}function z_(n,e){let t;if("targetChange"in e){e.targetChange;const r=function(u){return u==="NO_CHANGE"?0:u==="ADD"?1:u==="REMOVE"?2:u==="CURRENT"?3:u==="RESET"?4:G(39313,{state:u})}(e.targetChange.targetChangeType||"NO_CHANGE"),i=e.targetChange.targetIds||[],s=function(u,f){return u.useProto3Json?(te(f===void 0||typeof f=="string",58123),Te.fromBase64String(f||"")):(te(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),Te.fromUint8Array(f||new Uint8Array))}(n,e.targetChange.resumeToken),a=e.targetChange.cause,c=a&&function(u){const f=u.code===void 0?L.UNKNOWN:fh(u.code);return new q(f,u.message||"")}(a);t=new yh(r,i,s,c||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const i=fa(n,r.document.name),s=ot(r.document.updateTime),a=r.document.createTime?ot(r.document.createTime):W.min(),c=new je({mapValue:{fields:r.document.fields}}),l=Ae.newFoundDocument(i,s,a,c),u=r.targetIds||[],f=r.removedTargetIds||[];t=new Es(u,f,l.key,l)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const i=fa(n,r.document),s=r.readTime?ot(r.readTime):W.min(),a=Ae.newNoDocument(i,s),c=r.removedTargetIds||[];t=new Es([],c,a.key,a)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const i=fa(n,r.document),s=r.removedTargetIds||[];t=new Es([],s,i,null)}else{if(!("filter"in e))return G(11601,{Vt:e});{e.filter;const r=e.filter;r.targetId;const{count:i=0,unchangedNames:s}=r,a=new V_(i,s),c=r.targetId;t=new mh(c,a)}}return t}function G_(n,e){let t;if(e instanceof Yr)t={update:Ih(n,e.key,e.value)};else if(e instanceof dh)t={delete:da(n,e.key)};else if(e instanceof _n)t={update:Ih(n,e.key,e.data),updateMask:nb(e.fieldMask)};else{if(!(e instanceof N_))return G(16599,{dt:e.type});t={verify:da(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(r=>function(s,a){const c=a.transform;if(c instanceof zr)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(c instanceof Gr)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:c.elements}};if(c instanceof Wr)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:c.elements}};if(c instanceof vs)return{fieldPath:a.field.canonicalString(),increment:c.Ae};throw G(20930,{transform:a.transform})}(0,r))),e.precondition.isNone||(t.currentDocument=function(i,s){return s.updateTime!==void 0?{updateTime:j_(i,s.updateTime)}:s.exists!==void 0?{exists:s.exists}:G(27497)}(n,e.precondition)),t}function W_(n,e){return n&&n.length>0?(te(e!==void 0,14353),n.map(t=>function(i,s){let a=i.updateTime?ot(i.updateTime):ot(s);return a.isEqual(W.min())&&(a=ot(s)),new k_(a,i.transformResults||[])}(t,e))):[]}function Q_(n,e){return{documents:[Eh(n,e.path)]}}function Y_(n,e){const t={structuredQuery:{}},r=e.path;let i;e.collectionGroup!==null?(i=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(i=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=Eh(n,i);const s=function(u){if(u.length!==0)return Ah(Je.create(u,"and"))}(e.filters);s&&(t.structuredQuery.where=s);const a=function(u){if(u.length!==0)return u.map(f=>function(y){return{field:Xn(y.field),direction:Z_(y.dir)}}(f))}(e.orderBy);a&&(t.structuredQuery.orderBy=a);const c=la(n,e.limit);return c!==null&&(t.structuredQuery.limit=c),e.startAt&&(t.structuredQuery.startAt=function(u){return{before:u.inclusive,values:u.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(u){return{before:!u.inclusive,values:u.position}}(e.endAt)),{ft:t,parent:i}}function X_(n){let e=K_(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let i=null;if(r>0){te(r===1,65062);const f=t.from[0];f.allDescendants?i=f.collectionId:e=e.child(f.collectionId)}let s=[];t.where&&(s=function(p){const y=xh(p);return y instanceof Je&&Hu(y)?y.getFilters():[y]}(t.where));let a=[];t.orderBy&&(a=function(p){return p.map(y=>function(E){return new ps(Jn(E.field),function(x){switch(x){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(E.direction))}(y))}(t.orderBy));let c=null;t.limit&&(c=function(p){let y;return y=typeof p=="object"?p.value:p,is(y)?null:y}(t.limit));let l=null;t.startAt&&(l=function(p){const y=!!p.before,A=p.values||[];return new fs(A,y)}(t.startAt));let u=null;return t.endAt&&(u=function(p){const y=!p.before,A=p.values||[];return new fs(A,y)}(t.endAt)),p_(e,i,a,s,c,"F",l,u)}function J_(n,e){const t=function(i){switch(i){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return G(28987,{purpose:i})}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function xh(n){return n.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=Jn(t.unaryFilter.field);return de.create(r,"==",{doubleValue:NaN});case"IS_NULL":const i=Jn(t.unaryFilter.field);return de.create(i,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const s=Jn(t.unaryFilter.field);return de.create(s,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=Jn(t.unaryFilter.field);return de.create(a,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return G(61313);default:return G(60726)}}(n):n.fieldFilter!==void 0?function(t){return de.create(Jn(t.fieldFilter.field),function(i){switch(i){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return G(58110);default:return G(50506)}}(t.fieldFilter.op),t.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(t){return Je.create(t.compositeFilter.filters.map(r=>xh(r)),function(i){switch(i){case"AND":return"and";case"OR":return"or";default:return G(1026)}}(t.compositeFilter.op))}(n):G(30097,{filter:n})}function Z_(n){return B_[n]}function eb(n){return q_[n]}function tb(n){return $_[n]}function Xn(n){return{fieldPath:n.canonicalString()}}function Jn(n){return we.fromServerFormat(n.fieldPath)}function Ah(n){return n instanceof de?function(t){if(t.op==="=="){if(Mu(t.value))return{unaryFilter:{field:Xn(t.field),op:"IS_NAN"}};if(Ou(t.value))return{unaryFilter:{field:Xn(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(Mu(t.value))return{unaryFilter:{field:Xn(t.field),op:"IS_NOT_NAN"}};if(Ou(t.value))return{unaryFilter:{field:Xn(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Xn(t.field),op:eb(t.op),value:t.value}}}(n):n instanceof Je?function(t){const r=t.getFilters().map(i=>Ah(i));return r.length===1?r[0]:{compositeFilter:{op:tb(t.op),filters:r}}}(n):G(54877,{filter:n})}function nb(n){const e=[];return n.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function Sh(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}function Ch(n){return!!n&&typeof n._toProto=="function"&&n._protoValueType==="ProtoValue"}/**
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
 */class rb{constructor(e){this.yt=e}}function ib(n){const e=X_({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?sa(e,e.limit,"L"):e}/**
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
 */class sb{constructor(){this.bn=new ob}addToCollectionParentIndex(e,t){return this.bn.add(t),V.resolve()}getCollectionParents(e,t){return V.resolve(this.bn.getEntries(t))}addFieldIndex(e,t){return V.resolve()}deleteFieldIndex(e,t){return V.resolve()}deleteAllFieldIndexes(e){return V.resolve()}createTargetIndexes(e,t){return V.resolve()}getDocumentsMatchingTarget(e,t){return V.resolve(null)}getIndexType(e,t){return V.resolve(0)}getFieldIndexes(e,t){return V.resolve([])}getNextCollectionGroupToUpdate(e){return V.resolve(null)}getMinOffset(e,t){return V.resolve($t.min())}getMinOffsetFromCollectionGroup(e,t){return V.resolve($t.min())}updateCollectionGroup(e,t,r){return V.resolve()}updateIndexEntries(e,t){return V.resolve()}}class ob{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),i=this.index[t]||new me(re.comparator),s=!i.has(r);return this.index[t]=i.add(r),s}has(e){const t=e.lastSegment(),r=e.popLast(),i=this.index[t];return i&&i.has(r)}getEntries(e){return(this.index[e]||new me(re.comparator)).toArray()}}/**
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
 */const kh={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},Rh=41943040;class Oe{static withCacheSize(e){return new Oe(e,Oe.DEFAULT_COLLECTION_PERCENTILE,Oe.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}}/**
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
 */Oe.DEFAULT_COLLECTION_PERCENTILE=10,Oe.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Oe.DEFAULT=new Oe(Rh,Oe.DEFAULT_COLLECTION_PERCENTILE,Oe.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Oe.DISABLED=new Oe(-1,0,0);/**
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
 */class Zn{constructor(e){this.sr=e}next(){return this.sr+=2,this.sr}static _r(){return new Zn(0)}static ar(){return new Zn(-1)}}/**
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
 */const Ph="LruGarbageCollector",ab=1048576;function Nh([n,e],[t,r]){const i=J(n,t);return i===0?J(e,r):i}class cb{constructor(e){this.Pr=e,this.buffer=new me(Nh),this.Tr=0}Er(){return++this.Tr}Ir(e){const t=[e,this.Er()];if(this.buffer.size<this.Pr)this.buffer=this.buffer.add(t);else{const r=this.buffer.last();Nh(t,r)<0&&(this.buffer=this.buffer.delete(r).add(t))}}get maxValue(){return this.buffer.last()[0]}}class lb{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.Rr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Ar(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return this.Rr!==null}Ar(e){H(Ph,`Garbage collection scheduled in ${e}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){Gn(t)?H(Ph,"Ignoring IndexedDB error during garbage collection: ",t):await zn(t)}await this.Ar(3e5)})}}class ub{constructor(e,t){this.Vr=e,this.params=t}calculateTargetCount(e,t){return this.Vr.dr(e).next(r=>Math.floor(t/100*r))}nthSequenceNumber(e,t){if(t===0)return V.resolve(rs.ce);const r=new cb(t);return this.Vr.forEachTarget(e,i=>r.Ir(i.sequenceNumber)).next(()=>this.Vr.mr(e,i=>r.Ir(i))).next(()=>r.maxValue)}removeTargets(e,t,r){return this.Vr.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.Vr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(H("LruGarbageCollector","Garbage collection skipped; disabled"),V.resolve(kh)):this.getCacheSize(e).next(r=>r<this.params.cacheSizeCollectionThreshold?(H("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),kh):this.gr(e,t))}getCacheSize(e){return this.Vr.getCacheSize(e)}gr(e,t){let r,i,s,a,c,l,u;const f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(p=>(p>this.params.maximumSequenceNumbersToCollect?(H("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${p}`),i=this.params.maximumSequenceNumbersToCollect):i=p,a=Date.now(),this.nthSequenceNumber(e,i))).next(p=>(r=p,c=Date.now(),this.removeTargets(e,r,t))).next(p=>(s=p,l=Date.now(),this.removeOrphanedDocuments(e,r))).next(p=>(u=Date.now(),jn()<=X.DEBUG&&H("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${a-f}ms
	Determined least recently used ${i} in `+(c-a)+`ms
	Removed ${s} targets in `+(l-c)+`ms
	Removed ${p} documents in `+(u-l)+`ms
Total Duration: ${u-f}ms`),V.resolve({didRun:!0,sequenceNumbersCollected:i,targetsRemoved:s,documentsRemoved:p})))}}function hb(n,e){return new ub(n,e)}/**
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
 */class db{constructor(){this.changes=new yn(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Ae.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?V.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
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
 */class fb{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
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
 */class pb{constructor(e,t,r,i){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=i}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(i=>(r=i,this.remoteDocumentCache.getEntry(e,t))).next(i=>(r!==null&&Qr(r.mutation,i,Xe.empty(),ie.now()),i))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.getLocalViewOfDocuments(e,r,Z()).next(()=>r))}getLocalViewOfDocuments(e,t,r=Z()){const i=vn();return this.populateOverlays(e,i,t).next(()=>this.computeViews(e,t,i,r).next(s=>{let a=jr();return s.forEach((c,l)=>{a=a.insert(c,l.overlayedDocument)}),a}))}getOverlayedDocuments(e,t){const r=vn();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,Z()))}populateOverlays(e,t,r){const i=[];return r.forEach(s=>{t.has(s)||i.push(s)}),this.documentOverlayCache.getOverlays(e,i).next(s=>{s.forEach((a,c)=>{t.set(a,c)})})}computeViews(e,t,r,i){let s=wt();const a=Kr(),c=function(){return Kr()}();return t.forEach((l,u)=>{const f=r.get(u.key);i.has(u.key)&&(f===void 0||f.mutation instanceof _n)?s=s.insert(u.key,u):f!==void 0?(a.set(u.key,f.mutation.getFieldMask()),Qr(f.mutation,u,f.mutation.getFieldMask(),ie.now())):a.set(u.key,Xe.empty())}),this.recalculateAndSaveOverlays(e,s).next(l=>(l.forEach((u,f)=>a.set(u,f)),t.forEach((u,f)=>c.set(u,new fb(f,a.get(u)??null))),c))}recalculateAndSaveOverlays(e,t){const r=Kr();let i=new ae((a,c)=>a-c),s=Z();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(a=>{for(const c of a)c.keys().forEach(l=>{const u=t.get(l);if(u===null)return;let f=r.get(l)||Xe.empty();f=c.applyToLocalView(u,f),r.set(l,f);const p=(i.get(c.batchId)||Z()).add(l);i=i.insert(c.batchId,p)})}).next(()=>{const a=[],c=i.getReverseIterator();for(;c.hasNext();){const l=c.getNext(),u=l.key,f=l.value,p=eh();f.forEach(y=>{if(!s.has(y)){const A=ah(t.get(y),r.get(y));A!==null&&p.set(y,A),s=s.add(y)}}),a.push(this.documentOverlayCache.saveOverlays(e,u,p))}return V.waitFor(a)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,t,r,i){return g_(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):Qu(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,i):this.getDocumentsMatchingCollectionQuery(e,t,r,i)}getNextDocuments(e,t,r,i){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,i).next(s=>{const a=i-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,i-s.size):V.resolve(vn());let c=Mr,l=s;return a.next(u=>V.forEach(u,(f,p)=>(c<p.largestBatchId&&(c=p.largestBatchId),s.get(f)?V.resolve():this.remoteDocumentCache.getEntry(e,f).next(y=>{l=l.insert(f,y)}))).next(()=>this.populateOverlays(e,u,s)).next(()=>this.computeViews(e,l,u,Z())).next(f=>({batchId:c,changes:Zu(f)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new j(t)).next(r=>{let i=jr();return r.isFoundDocument()&&(i=i.insert(r.key,r)),i})}getDocumentsMatchingCollectionGroupQuery(e,t,r,i){const s=t.collectionGroup;let a=jr();return this.indexManager.getCollectionParents(e,s).next(c=>V.forEach(c,l=>{const u=function(p,y){return new $r(y,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)}(t,l.child(s));return this.getDocumentsMatchingCollectionQuery(e,u,r,i).next(f=>{f.forEach((p,y)=>{a=a.insert(p,y)})})}).next(()=>a))}getDocumentsMatchingCollectionQuery(e,t,r,i){let s;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(a=>(s=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,s,i))).next(a=>{s.forEach((l,u)=>{const f=u.getKey();a.get(f)===null&&(a=a.insert(f,Ae.newInvalidDocument(f)))});let c=jr();return a.forEach((l,u)=>{const f=s.get(l);f!==void 0&&Qr(f.mutation,u,Xe.empty(),ie.now()),ms(t,u)&&(c=c.insert(l,u))}),c})}}/**
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
 */class gb{constructor(e){this.serializer=e,this.Nr=new Map,this.Br=new Map}getBundleMetadata(e,t){return V.resolve(this.Nr.get(t))}saveBundleMetadata(e,t){return this.Nr.set(t.id,function(i){return{id:i.id,version:i.version,createTime:ot(i.createTime)}}(t)),V.resolve()}getNamedQuery(e,t){return V.resolve(this.Br.get(t))}saveNamedQuery(e,t){return this.Br.set(t.name,function(i){return{name:i.name,query:ib(i.bundledQuery),readTime:ot(i.readTime)}}(t)),V.resolve()}}/**
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
 */class mb{constructor(){this.overlays=new ae(j.comparator),this.Lr=new Map}getOverlay(e,t){return V.resolve(this.overlays.get(t))}getOverlays(e,t){const r=vn();return V.forEach(t,i=>this.getOverlay(e,i).next(s=>{s!==null&&r.set(i,s)})).next(()=>r)}saveOverlays(e,t,r){return r.forEach((i,s)=>{this.St(e,t,s)}),V.resolve()}removeOverlaysForBatchId(e,t,r){const i=this.Lr.get(r);return i!==void 0&&(i.forEach(s=>this.overlays=this.overlays.remove(s)),this.Lr.delete(r)),V.resolve()}getOverlaysForCollection(e,t,r){const i=vn(),s=t.length+1,a=new j(t.child("")),c=this.overlays.getIteratorFrom(a);for(;c.hasNext();){const l=c.getNext().value,u=l.getKey();if(!t.isPrefixOf(u.path))break;u.path.length===s&&l.largestBatchId>r&&i.set(l.getKey(),l)}return V.resolve(i)}getOverlaysForCollectionGroup(e,t,r,i){let s=new ae((u,f)=>u-f);const a=this.overlays.getIterator();for(;a.hasNext();){const u=a.getNext().value;if(u.getKey().getCollectionGroup()===t&&u.largestBatchId>r){let f=s.get(u.largestBatchId);f===null&&(f=vn(),s=s.insert(u.largestBatchId,f)),f.set(u.getKey(),u)}}const c=vn(),l=s.getIterator();for(;l.hasNext()&&(l.getNext().value.forEach((u,f)=>c.set(u,f)),!(c.size()>=i)););return V.resolve(c)}St(e,t,r){const i=this.overlays.get(r.key);if(i!==null){const a=this.Lr.get(i.largestBatchId).delete(r.key);this.Lr.set(i.largestBatchId,a)}this.overlays=this.overlays.insert(r.key,new L_(t,r));let s=this.Lr.get(t);s===void 0&&(s=Z(),this.Lr.set(t,s)),this.Lr.set(t,s.add(r.key))}}/**
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
 */class yb{constructor(){this.sessionToken=Te.EMPTY_BYTE_STRING}getSessionToken(e){return V.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,V.resolve()}}/**
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
 */class ga{constructor(){this.kr=new me(_e.qr),this.Kr=new me(_e.Ur)}isEmpty(){return this.kr.isEmpty()}addReference(e,t){const r=new _e(e,t);this.kr=this.kr.add(r),this.Kr=this.Kr.add(r)}$r(e,t){e.forEach(r=>this.addReference(r,t))}removeReference(e,t){this.Wr(new _e(e,t))}Qr(e,t){e.forEach(r=>this.removeReference(r,t))}Gr(e){const t=new j(new re([])),r=new _e(t,e),i=new _e(t,e+1),s=[];return this.Kr.forEachInRange([r,i],a=>{this.Wr(a),s.push(a.key)}),s}zr(){this.kr.forEach(e=>this.Wr(e))}Wr(e){this.kr=this.kr.delete(e),this.Kr=this.Kr.delete(e)}jr(e){const t=new j(new re([])),r=new _e(t,e),i=new _e(t,e+1);let s=Z();return this.Kr.forEachInRange([r,i],a=>{s=s.add(a.key)}),s}containsKey(e){const t=new _e(e,0),r=this.kr.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class _e{constructor(e,t){this.key=e,this.Jr=t}static qr(e,t){return j.comparator(e.key,t.key)||J(e.Jr,t.Jr)}static Ur(e,t){return J(e.Jr,t.Jr)||j.comparator(e.key,t.key)}}/**
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
 */class vb{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Yn=1,this.Hr=new me(_e.qr)}checkEmpty(e){return V.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,i){const s=this.Yn;this.Yn++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new D_(s,t,r,i);this.mutationQueue.push(a);for(const c of i)this.Hr=this.Hr.add(new _e(c.key,s)),this.indexManager.addToCollectionParentIndex(e,c.key.path.popLast());return V.resolve(a)}lookupMutationBatch(e,t){return V.resolve(this.Zr(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,i=this.Xr(r),s=i<0?0:i;return V.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return V.resolve(this.mutationQueue.length===0?Wo:this.Yn-1)}getAllMutationBatches(e){return V.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new _e(t,0),i=new _e(t,Number.POSITIVE_INFINITY),s=[];return this.Hr.forEachInRange([r,i],a=>{const c=this.Zr(a.Jr);s.push(c)}),V.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new me(J);return t.forEach(i=>{const s=new _e(i,0),a=new _e(i,Number.POSITIVE_INFINITY);this.Hr.forEachInRange([s,a],c=>{r=r.add(c.Jr)})}),V.resolve(this.Yr(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,i=r.length+1;let s=r;j.isDocumentKey(s)||(s=s.child(""));const a=new _e(new j(s),0);let c=new me(J);return this.Hr.forEachWhile(l=>{const u=l.key.path;return!!r.isPrefixOf(u)&&(u.length===i&&(c=c.add(l.Jr)),!0)},a),V.resolve(this.Yr(c))}Yr(e){const t=[];return e.forEach(r=>{const i=this.Zr(r);i!==null&&t.push(i)}),t}removeMutationBatch(e,t){te(this.ei(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.Hr;return V.forEach(t.mutations,i=>{const s=new _e(i.key,t.batchId);return r=r.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,i.key)}).next(()=>{this.Hr=r})}nr(e){}containsKey(e,t){const r=new _e(t,0),i=this.Hr.firstAfterOrEqual(r);return V.resolve(t.isEqual(i&&i.key))}performConsistencyCheck(e){return this.mutationQueue.length,V.resolve()}ei(e,t){return this.Xr(e)}Xr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Zr(e){const t=this.Xr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
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
 */class _b{constructor(e){this.ti=e,this.docs=function(){return new ae(j.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,i=this.docs.get(r),s=i?i.size:0,a=this.ti(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:a}),this.size+=a-s,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return V.resolve(r?r.document.mutableCopy():Ae.newInvalidDocument(t))}getEntries(e,t){let r=wt();return t.forEach(i=>{const s=this.docs.get(i);r=r.insert(i,s?s.document.mutableCopy():Ae.newInvalidDocument(i))}),V.resolve(r)}getDocumentsMatchingQuery(e,t,r,i){let s=wt();const a=t.path,c=new j(a.child("__id-9223372036854775808__")),l=this.docs.getIteratorFrom(c);for(;l.hasNext();){const{key:u,value:{document:f}}=l.getNext();if(!a.isPrefixOf(u.path))break;u.path.length>a.length+1||Kv(jv(f),r)<=0||(i.has(f.key)||ms(t,f))&&(s=s.insert(f.key,f.mutableCopy()))}return V.resolve(s)}getAllFromCollectionGroup(e,t,r,i){G(9500)}ni(e,t){return V.forEach(this.docs,r=>t(r))}newChangeBuffer(e){return new bb(this)}getSize(e){return V.resolve(this.size)}}class bb extends db{constructor(e){super(),this.Mr=e}applyChanges(e){const t=[];return this.changes.forEach((r,i)=>{i.isValidDocument()?t.push(this.Mr.addEntry(e,i)):this.Mr.removeEntry(r)}),V.waitFor(t)}getFromCache(e,t){return this.Mr.getEntry(e,t)}getAllFromCache(e,t){return this.Mr.getEntries(e,t)}}/**
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
 */class wb{constructor(e){this.persistence=e,this.ri=new yn(t=>ea(t),ta),this.lastRemoteSnapshotVersion=W.min(),this.highestTargetId=0,this.ii=0,this.si=new ga,this.targetCount=0,this.oi=Zn._r()}forEachTarget(e,t){return this.ri.forEach((r,i)=>t(i)),V.resolve()}getLastRemoteSnapshotVersion(e){return V.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return V.resolve(this.ii)}allocateTargetId(e){return this.highestTargetId=this.oi.next(),V.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.ii&&(this.ii=t),V.resolve()}lr(e){this.ri.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.oi=new Zn(t),this.highestTargetId=t),e.sequenceNumber>this.ii&&(this.ii=e.sequenceNumber)}addTargetData(e,t){return this.lr(t),this.targetCount+=1,V.resolve()}updateTargetData(e,t){return this.lr(t),V.resolve()}removeTargetData(e,t){return this.ri.delete(t.target),this.si.Gr(t.targetId),this.targetCount-=1,V.resolve()}removeTargets(e,t,r){let i=0;const s=[];return this.ri.forEach((a,c)=>{c.sequenceNumber<=t&&r.get(c.targetId)===null&&(this.ri.delete(a),s.push(this.removeMatchingKeysForTargetId(e,c.targetId)),i++)}),V.waitFor(s).next(()=>i)}getTargetCount(e){return V.resolve(this.targetCount)}getTargetData(e,t){const r=this.ri.get(t)||null;return V.resolve(r)}addMatchingKeys(e,t,r){return this.si.$r(t,r),V.resolve()}removeMatchingKeys(e,t,r){this.si.Qr(t,r);const i=this.persistence.referenceDelegate,s=[];return i&&t.forEach(a=>{s.push(i.markPotentiallyOrphaned(e,a))}),V.waitFor(s)}removeMatchingKeysForTargetId(e,t){return this.si.Gr(t),V.resolve()}getMatchingKeysForTargetId(e,t){const r=this.si.jr(t);return V.resolve(r)}containsKey(e,t){return V.resolve(this.si.containsKey(t))}}/**
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
 */class Dh{constructor(e,t){this._i={},this.overlays={},this.ai=new rs(0),this.ui=!1,this.ui=!0,this.ci=new yb,this.referenceDelegate=e(this),this.li=new wb(this),this.indexManager=new sb,this.remoteDocumentCache=function(i){return new _b(i)}(r=>this.referenceDelegate.hi(r)),this.serializer=new rb(t),this.Pi=new gb(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ui=!1,Promise.resolve()}get started(){return this.ui}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new mb,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this._i[e.toKey()];return r||(r=new vb(t,this.referenceDelegate),this._i[e.toKey()]=r),r}getGlobalsCache(){return this.ci}getTargetCache(){return this.li}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Pi}runTransaction(e,t,r){H("MemoryPersistence","Starting transaction:",e);const i=new Eb(this.ai.next());return this.referenceDelegate.Ti(),r(i).next(s=>this.referenceDelegate.Ei(i).next(()=>s)).toPromise().then(s=>(i.raiseOnCommittedEvent(),s))}Ii(e,t){return V.or(Object.values(this._i).map(r=>()=>r.containsKey(e,t)))}}class Eb extends Gv{constructor(e){super(),this.currentSequenceNumber=e}}class ma{constructor(e){this.persistence=e,this.Ri=new ga,this.Ai=null}static Vi(e){return new ma(e)}get di(){if(this.Ai)return this.Ai;throw G(60996)}addReference(e,t,r){return this.Ri.addReference(r,t),this.di.delete(r.toString()),V.resolve()}removeReference(e,t,r){return this.Ri.removeReference(r,t),this.di.add(r.toString()),V.resolve()}markPotentiallyOrphaned(e,t){return this.di.add(t.toString()),V.resolve()}removeTarget(e,t){this.Ri.Gr(t.targetId).forEach(i=>this.di.add(i.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(i=>{i.forEach(s=>this.di.add(s.toString()))}).next(()=>r.removeTargetData(e,t))}Ti(){this.Ai=new Set}Ei(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return V.forEach(this.di,r=>{const i=j.fromPath(r);return this.mi(e,i).next(s=>{s||t.removeEntry(i,W.min())})}).next(()=>(this.Ai=null,t.apply(e)))}updateLimboDocument(e,t){return this.mi(e,t).next(r=>{r?this.di.delete(t.toString()):this.di.add(t.toString())})}hi(e){return 0}mi(e,t){return V.or([()=>V.resolve(this.Ri.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Ii(e,t)])}}class xs{constructor(e,t){this.persistence=e,this.fi=new yn(r=>Yv(r.path),(r,i)=>r.isEqual(i)),this.garbageCollector=hb(this,t)}static Vi(e,t){return new xs(e,t)}Ti(){}Ei(e){return V.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}dr(e){const t=this.pr(e);return this.persistence.getTargetCache().getTargetCount(e).next(r=>t.next(i=>r+i))}pr(e){let t=0;return this.mr(e,r=>{t++}).next(()=>t)}mr(e,t){return V.forEach(this.fi,(r,i)=>this.wr(e,r,i).next(s=>s?V.resolve():t(i)))}removeTargets(e,t,r){return this.persistence.getTargetCache().removeTargets(e,t,r)}removeOrphanedDocuments(e,t){let r=0;const i=this.persistence.getRemoteDocumentCache(),s=i.newChangeBuffer();return i.ni(e,a=>this.wr(e,a,t).next(c=>{c||(r++,s.removeEntry(a,W.min()))})).next(()=>s.apply(e)).next(()=>r)}markPotentiallyOrphaned(e,t){return this.fi.set(t,e.currentSequenceNumber),V.resolve()}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,t,r){return this.fi.set(r,e.currentSequenceNumber),V.resolve()}removeReference(e,t,r){return this.fi.set(r,e.currentSequenceNumber),V.resolve()}updateLimboDocument(e,t){return this.fi.set(t,e.currentSequenceNumber),V.resolve()}hi(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=hs(e.data.value)),t}wr(e,t,r){return V.or([()=>this.persistence.Ii(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const i=this.fi.get(t);return V.resolve(i!==void 0&&i>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
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
 */class ya{constructor(e,t,r,i){this.targetId=e,this.fromCache=t,this.Ts=r,this.Es=i}static Is(e,t){let r=Z(),i=Z();for(const s of t.docChanges)switch(s.type){case 0:r=r.add(s.doc.key);break;case 1:i=i.add(s.doc.key)}return new ya(e,t.fromCache,r,i)}}/**
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
 */class Tb{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
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
 */class Ib{constructor(){this.Rs=!1,this.As=!1,this.Vs=100,this.ds=function(){return Yp()?8:Wv(Ie())>0?6:4}()}initialize(e,t){this.fs=e,this.indexManager=t,this.Rs=!0}getDocumentsMatchingQuery(e,t,r,i){const s={result:null};return this.gs(e,t).next(a=>{s.result=a}).next(()=>{if(!s.result)return this.ps(e,t,i,r).next(a=>{s.result=a})}).next(()=>{if(s.result)return;const a=new Tb;return this.ys(e,t,a).next(c=>{if(s.result=c,this.As)return this.ws(e,t,a,c.size)})}).next(()=>s.result)}ws(e,t,r,i){return r.documentReadCount<this.Vs?(jn()<=X.DEBUG&&H("QueryEngine","SDK will not create cache indexes for query:",Yn(t),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),V.resolve()):(jn()<=X.DEBUG&&H("QueryEngine","Query:",Yn(t),"scans",r.documentReadCount,"local documents and returns",i,"documents as results."),r.documentReadCount>this.ds*i?(jn()<=X.DEBUG&&H("QueryEngine","The SDK decides to create cache indexes for query:",Yn(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,st(t))):V.resolve())}gs(e,t){if(Wu(t))return V.resolve(null);let r=st(t);return this.indexManager.getIndexType(e,r).next(i=>i===0?null:(t.limit!==null&&i===1&&(t=sa(t,null,"F"),r=st(t)),this.indexManager.getDocumentsMatchingTarget(e,r).next(s=>{const a=Z(...s);return this.fs.getDocuments(e,a).next(c=>this.indexManager.getMinOffset(e,r).next(l=>{const u=this.Ss(t,c);return this.bs(t,u,a,l.readTime)?this.gs(e,sa(t,null,"F")):this.Ds(e,u,t,l)}))})))}ps(e,t,r,i){return Wu(t)||i.isEqual(W.min())?V.resolve(null):this.fs.getDocuments(e,r).next(s=>{const a=this.Ss(t,s);return this.bs(t,a,r,i)?V.resolve(null):(jn()<=X.DEBUG&&H("QueryEngine","Re-using previous result from %s to execute query: %s",i.toString(),Yn(t)),this.Ds(e,a,t,Hv(i,Mr)).next(c=>c))})}Ss(e,t){let r=new me(Xu(e));return t.forEach((i,s)=>{ms(e,s)&&(r=r.add(s))}),r}bs(e,t,r,i){if(e.limit===null)return!1;if(r.size!==t.size)return!0;const s=e.limitType==="F"?t.last():t.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(i)>0)}ys(e,t,r){return jn()<=X.DEBUG&&H("QueryEngine","Using full collection scan to execute query:",Yn(t)),this.fs.getDocumentsMatchingQuery(e,t,$t.min(),r)}Ds(e,t,r,i){return this.fs.getDocumentsMatchingQuery(e,r,i).next(s=>(t.forEach(a=>{s=s.insert(a.key,a)}),s))}}/**
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
 */const va="LocalStore",xb=3e8;class Ab{constructor(e,t,r,i){this.persistence=e,this.Cs=t,this.serializer=i,this.vs=new ae(J),this.Fs=new yn(s=>ea(s),ta),this.Ms=new Map,this.xs=e.getRemoteDocumentCache(),this.li=e.getTargetCache(),this.Pi=e.getBundleCache(),this.Os(r)}Os(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new pb(this.xs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.xs.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.vs))}}function Sb(n,e,t,r){return new Ab(n,e,t,r)}async function Lh(n,e){const t=Q(n);return await t.persistence.runTransaction("Handle user change","readonly",r=>{let i;return t.mutationQueue.getAllMutationBatches(r).next(s=>(i=s,t.Os(e),t.mutationQueue.getAllMutationBatches(r))).next(s=>{const a=[],c=[];let l=Z();for(const u of i){a.push(u.batchId);for(const f of u.mutations)l=l.add(f.key)}for(const u of s){c.push(u.batchId);for(const f of u.mutations)l=l.add(f.key)}return t.localDocuments.getDocuments(r,l).next(u=>({Ns:u,removedBatchIds:a,addedBatchIds:c}))})})}function Cb(n,e){const t=Q(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const i=e.batch.keys(),s=t.xs.newChangeBuffer({trackRemovals:!0});return function(c,l,u,f){const p=u.batch,y=p.keys();let A=V.resolve();return y.forEach(E=>{A=A.next(()=>f.getEntry(l,E)).next(w=>{const x=u.docVersions.get(E);te(x!==null,48541),w.version.compareTo(x)<0&&(p.applyToRemoteDocument(w,u),w.isValidDocument()&&(w.setReadTime(u.commitVersion),f.addEntry(w)))})}),A.next(()=>c.mutationQueue.removeMutationBatch(l,p))}(t,r,e,s).next(()=>s.apply(r)).next(()=>t.mutationQueue.performConsistencyCheck(r)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(r,i,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(c){let l=Z();for(let u=0;u<c.mutationResults.length;++u)c.mutationResults[u].transformResults.length>0&&(l=l.add(c.batch.mutations[u].key));return l}(e))).next(()=>t.localDocuments.getDocuments(r,i))})}function Vh(n){const e=Q(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.li.getLastRemoteSnapshotVersion(t))}function kb(n,e){const t=Q(n),r=e.snapshotVersion;let i=t.vs;return t.persistence.runTransaction("Apply remote event","readwrite-primary",s=>{const a=t.xs.newChangeBuffer({trackRemovals:!0});i=t.vs;const c=[];e.targetChanges.forEach((f,p)=>{const y=i.get(p);if(!y)return;c.push(t.li.removeMatchingKeys(s,f.removedDocuments,p).next(()=>t.li.addMatchingKeys(s,f.addedDocuments,p)));let A=y.withSequenceNumber(s.currentSequenceNumber);e.targetMismatches.get(p)!==null?A=A.withResumeToken(Te.EMPTY_BYTE_STRING,W.min()).withLastLimboFreeSnapshotVersion(W.min()):f.resumeToken.approximateByteSize()>0&&(A=A.withResumeToken(f.resumeToken,r)),i=i.insert(p,A),function(w,x,R){return w.resumeToken.approximateByteSize()===0||x.snapshotVersion.toMicroseconds()-w.snapshotVersion.toMicroseconds()>=xb?!0:R.addedDocuments.size+R.modifiedDocuments.size+R.removedDocuments.size>0}(y,A,f)&&c.push(t.li.updateTargetData(s,A))});let l=wt(),u=Z();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&c.push(t.persistence.referenceDelegate.updateLimboDocument(s,f))}),c.push(Rb(s,a,e.documentUpdates).next(f=>{l=f.Bs,u=f.Ls})),!r.isEqual(W.min())){const f=t.li.getLastRemoteSnapshotVersion(s).next(p=>t.li.setTargetsMetadata(s,s.currentSequenceNumber,r));c.push(f)}return V.waitFor(c).next(()=>a.apply(s)).next(()=>t.localDocuments.getLocalViewOfDocuments(s,l,u)).next(()=>l)}).then(s=>(t.vs=i,s))}function Rb(n,e,t){let r=Z(),i=Z();return t.forEach(s=>r=r.add(s)),e.getEntries(n,r).next(s=>{let a=wt();return t.forEach((c,l)=>{const u=s.get(c);l.isFoundDocument()!==u.isFoundDocument()&&(i=i.add(c)),l.isNoDocument()&&l.version.isEqual(W.min())?(e.removeEntry(c,l.readTime),a=a.insert(c,l)):!u.isValidDocument()||l.version.compareTo(u.version)>0||l.version.compareTo(u.version)===0&&u.hasPendingWrites?(e.addEntry(l),a=a.insert(c,l)):H(va,"Ignoring outdated watch update for ",c,". Current version:",u.version," Watch version:",l.version)}),{Bs:a,Ls:i}})}function Pb(n,e){const t=Q(n);return t.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=Wo),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function Nb(n,e){const t=Q(n);return t.persistence.runTransaction("Allocate target","readwrite",r=>{let i;return t.li.getTargetData(r,e).next(s=>s?(i=s,V.resolve(i)):t.li.allocateTargetId(r).next(a=>(i=new zt(e,a,"TargetPurposeListen",r.currentSequenceNumber),t.li.addTargetData(r,i).next(()=>i))))}).then(r=>{const i=t.vs.get(r.targetId);return(i===null||r.snapshotVersion.compareTo(i.snapshotVersion)>0)&&(t.vs=t.vs.insert(r.targetId,r),t.Fs.set(e,r.targetId)),r})}async function _a(n,e,t){const r=Q(n),i=r.vs.get(e),s=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",s,a=>r.persistence.referenceDelegate.removeTarget(a,i))}catch(a){if(!Gn(a))throw a;H(va,`Failed to update sequence numbers for target ${e}: ${a}`)}r.vs=r.vs.remove(e),r.Fs.delete(i.target)}function Oh(n,e,t){const r=Q(n);let i=W.min(),s=Z();return r.persistence.runTransaction("Execute query","readwrite",a=>function(l,u,f){const p=Q(l),y=p.Fs.get(f);return y!==void 0?V.resolve(p.vs.get(y)):p.li.getTargetData(u,f)}(r,a,st(e)).next(c=>{if(c)return i=c.lastLimboFreeSnapshotVersion,r.li.getMatchingKeysForTargetId(a,c.targetId).next(l=>{s=l})}).next(()=>r.Cs.getDocumentsMatchingQuery(a,e,t?i:W.min(),t?s:Z())).next(c=>(Db(r,y_(e),c),{documents:c,ks:s})))}function Db(n,e,t){let r=n.Ms.get(e)||W.min();t.forEach((i,s)=>{s.readTime.compareTo(r)>0&&(r=s.readTime)}),n.Ms.set(e,r)}class Mh{constructor(){this.activeTargetIds=T_()}Qs(e){this.activeTargetIds=this.activeTargetIds.add(e)}Gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Ws(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class Lb{constructor(){this.vo=new Mh,this.Fo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.vo.Qs(e),this.Fo[e]||"not-current"}updateQueryState(e,t,r){this.Fo[e]=t}removeLocalQueryTarget(e){this.vo.Gs(e)}isLocalQueryTarget(e){return this.vo.activeTargetIds.has(e)}clearQueryState(e){delete this.Fo[e]}getAllActiveQueryTargets(){return this.vo.activeTargetIds}isActiveQueryTarget(e){return this.vo.activeTargetIds.has(e)}start(){return this.vo=new Mh,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
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
 */class Vb{Mo(e){}shutdown(){}}/**
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
 */const Fh="ConnectivityMonitor";class Uh{constructor(){this.xo=()=>this.Oo(),this.No=()=>this.Bo(),this.Lo=[],this.ko()}Mo(e){this.Lo.push(e)}shutdown(){window.removeEventListener("online",this.xo),window.removeEventListener("offline",this.No)}ko(){window.addEventListener("online",this.xo),window.addEventListener("offline",this.No)}Oo(){H(Fh,"Network connectivity changed: AVAILABLE");for(const e of this.Lo)e(0)}Bo(){H(Fh,"Network connectivity changed: UNAVAILABLE");for(const e of this.Lo)e(1)}static v(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
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
 */let As=null;function ba(){return As===null?As=function(){return 268435456+Math.round(2147483648*Math.random())}():As++,"0x"+As.toString(16)}/**
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
 */const wa="RestConnection",Ob={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class Mb{get qo(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.Ko=t+"://"+e.host,this.Uo=`projects/${r}/databases/${i}`,this.$o=this.databaseId.database===cs?`project_id=${r}`:`project_id=${r}&database_id=${i}`}Wo(e,t,r,i,s){const a=ba(),c=this.Qo(e,t.toUriEncodedString());H(wa,`Sending RPC '${e}' ${a}:`,c,r);const l={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.$o};this.Go(l,i,s);const{host:u}=new URL(c),f=Ar(u);return this.zo(e,c,l,r,f).then(p=>(H(wa,`Received RPC '${e}' ${a}: `,p),p),p=>{throw pn(wa,`RPC '${e}' ${a} failed with error: `,p,"url: ",c,"request:",r),p})}jo(e,t,r,i,s,a){return this.Wo(e,t,r,i,s)}Go(e,t,r){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+Hn}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((i,s)=>e[s]=i),r&&r.headers.forEach((i,s)=>e[s]=i)}Qo(e,t){const r=Ob[e];let i=`${this.Ko}/v1/${t}:${r}`;return this.databaseInfo.apiKey&&(i=`${i}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),i}terminate(){}}/**
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
 */class Fb{constructor(e){this.Jo=e.Jo,this.Ho=e.Ho}Zo(e){this.Xo=e}Yo(e){this.e_=e}t_(e){this.n_=e}onMessage(e){this.r_=e}close(){this.Ho()}send(e){this.Jo(e)}i_(){this.Xo()}s_(){this.e_()}o_(e){this.n_(e)}__(e){this.r_(e)}}/**
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
 */const Se="WebChannelConnection",Zr=(n,e,t)=>{n.listen(e,r=>{try{t(r)}catch(i){setTimeout(()=>{throw i},0)}})};class er extends Mb{constructor(e){super(e),this.a_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static u_(){if(!er.c_){const e=lu();Zr(e,cu.STAT_EVENT,t=>{t.stat===Ho.PROXY?H(Se,"STAT_EVENT: detected buffering proxy"):t.stat===Ho.NOPROXY&&H(Se,"STAT_EVENT: detected no buffering proxy")}),er.c_=!0}}zo(e,t,r,i,s){const a=ba();return new Promise((c,l)=>{const u=new ou;u.setWithCredentials(!0),u.listenOnce(au.COMPLETE,()=>{try{switch(u.getLastErrorCode()){case ts.NO_ERROR:const p=u.getResponseJson();H(Se,`XHR for RPC '${e}' ${a} received:`,JSON.stringify(p)),c(p);break;case ts.TIMEOUT:H(Se,`RPC '${e}' ${a} timed out`),l(new q(L.DEADLINE_EXCEEDED,"Request time out"));break;case ts.HTTP_ERROR:const y=u.getStatus();if(H(Se,`RPC '${e}' ${a} failed with status:`,y,"response text:",u.getResponseText()),y>0){let A=u.getResponseJson();Array.isArray(A)&&(A=A[0]);const E=A==null?void 0:A.error;if(E&&E.status&&E.message){const w=function(R){const P=R.toLowerCase().replace(/_/g,"-");return Object.values(L).indexOf(P)>=0?P:L.UNKNOWN}(E.status);l(new q(w,E.message))}else l(new q(L.UNKNOWN,"Server responded with status "+u.getStatus()))}else l(new q(L.UNAVAILABLE,"Connection failed."));break;default:G(9055,{l_:e,streamId:a,h_:u.getLastErrorCode(),P_:u.getLastError()})}}finally{H(Se,`RPC '${e}' ${a} completed.`)}});const f=JSON.stringify(i);H(Se,`RPC '${e}' ${a} sending request:`,i),u.send(t,"POST",f,r,15)})}T_(e,t,r){const i=ba(),s=[this.Ko,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=this.createWebChannelTransport(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},l=this.longPollingOptions.timeoutSeconds;l!==void 0&&(c.longPollingTimeout=Math.round(1e3*l)),this.useFetchStreams&&(c.useFetchStreams=!0),this.Go(c.initMessageHeaders,t,r),c.encodeInitMessageHeaders=!0;const u=s.join("");H(Se,`Creating RPC '${e}' stream ${i}: ${u}`,c);const f=a.createWebChannel(u,c);this.E_(f);let p=!1,y=!1;const A=new Fb({Jo:E=>{y?H(Se,`Not sending because RPC '${e}' stream ${i} is closed:`,E):(p||(H(Se,`Opening RPC '${e}' stream ${i} transport.`),f.open(),p=!0),H(Se,`RPC '${e}' stream ${i} sending:`,E),f.send(E))},Ho:()=>f.close()});return Zr(f,Vr.EventType.OPEN,()=>{y||(H(Se,`RPC '${e}' stream ${i} transport opened.`),A.i_())}),Zr(f,Vr.EventType.CLOSE,()=>{y||(y=!0,H(Se,`RPC '${e}' stream ${i} transport closed`),A.o_(),this.I_(f))}),Zr(f,Vr.EventType.ERROR,E=>{y||(y=!0,pn(Se,`RPC '${e}' stream ${i} transport errored. Name:`,E.name,"Message:",E.message),A.o_(new q(L.UNAVAILABLE,"The operation could not be completed")))}),Zr(f,Vr.EventType.MESSAGE,E=>{var w;if(!y){const x=E.data[0];te(!!x,16349);const R=x,P=(R==null?void 0:R.error)||((w=R[0])==null?void 0:w.error);if(P){H(Se,`RPC '${e}' stream ${i} received error:`,P);const N=P.status;let O=function(_){const m=fe[_];if(m!==void 0)return fh(m)}(N),B=P.message;N==="NOT_FOUND"&&B.includes("database")&&B.includes("does not exist")&&B.includes(this.databaseId.database)&&pn(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),O===void 0&&(O=L.INTERNAL,B="Unknown error status: "+N+" with message "+P.message),y=!0,A.o_(new q(O,B)),f.close()}else H(Se,`RPC '${e}' stream ${i} received:`,x),A.__(x)}}),er.u_(),setTimeout(()=>{A.s_()},0),A}terminate(){this.a_.forEach(e=>e.close()),this.a_=[]}E_(e){this.a_.push(e)}I_(e){this.a_=this.a_.filter(t=>t===e)}Go(e,t,r){super.Go(e,t,r),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return uu()}}/**
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
 */function Ub(n){return new er(n)}function Ea(){return typeof document<"u"?document:null}/**
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
 */function Ss(n){return new H_(n,!0)}/**
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
 */er.c_=!1;class Bh{constructor(e,t,r=1e3,i=1.5,s=6e4){this.Ci=e,this.timerId=t,this.R_=r,this.A_=i,this.V_=s,this.d_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.d_=0}g_(){this.d_=this.V_}p_(e){this.cancel();const t=Math.floor(this.d_+this.y_()),r=Math.max(0,Date.now()-this.f_),i=Math.max(0,t-r);i>0&&H("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.d_} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.m_=this.Ci.enqueueAfterDelay(this.timerId,i,()=>(this.f_=Date.now(),e())),this.d_*=this.A_,this.d_<this.R_&&(this.d_=this.R_),this.d_>this.V_&&(this.d_=this.V_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.d_}}/**
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
 */const qh="PersistentStream";class $h{constructor(e,t,r,i,s,a,c,l){this.Ci=e,this.S_=r,this.b_=i,this.connection=s,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=c,this.listener=l,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new Bh(e,t)}x_(){return this.state===1||this.state===5||this.O_()}O_(){return this.state===2||this.state===3}start(){this.F_=0,this.state!==4?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&this.C_===null&&(this.C_=this.Ci.enqueueAfterDelay(this.S_,6e4,()=>this.k_()))}q_(e){this.K_(),this.stream.send(e)}async k_(){if(this.O_())return this.close(0)}K_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,t){this.K_(),this.U_(),this.M_.cancel(),this.D_++,e!==4?this.M_.reset():t&&t.code===L.RESOURCE_EXHAUSTED?(_t(t.toString()),_t("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):t&&t.code===L.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.W_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.t_(t)}W_(){}auth(){this.state=1;const e=this.Q_(this.D_),t=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,i])=>{this.D_===t&&this.G_(r,i)},r=>{e(()=>{const i=new q(L.UNKNOWN,"Fetching auth token failed: "+r.message);return this.z_(i)})})}G_(e,t){const r=this.Q_(this.D_);this.stream=this.j_(e,t),this.stream.Zo(()=>{r(()=>this.listener.Zo())}),this.stream.Yo(()=>{r(()=>(this.state=2,this.v_=this.Ci.enqueueAfterDelay(this.b_,1e4,()=>(this.O_()&&(this.state=3),Promise.resolve())),this.listener.Yo()))}),this.stream.t_(i=>{r(()=>this.z_(i))}),this.stream.onMessage(i=>{r(()=>++this.F_==1?this.J_(i):this.onNext(i))})}N_(){this.state=5,this.M_.p_(async()=>{this.state=0,this.start()})}z_(e){return H(qh,`close with error: ${e}`),this.stream=null,this.close(4,e)}Q_(e){return t=>{this.Ci.enqueueAndForget(()=>this.D_===e?t():(H(qh,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class Bb extends $h{constructor(e,t,r,i,s,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,i,a),this.serializer=s}j_(e,t){return this.connection.T_("Listen",e,t)}J_(e){return this.onNext(e)}onNext(e){this.M_.reset();const t=z_(this.serializer,e),r=function(s){if(!("targetChange"in s))return W.min();const a=s.targetChange;return a.targetIds&&a.targetIds.length?W.min():a.readTime?ot(a.readTime):W.min()}(e);return this.listener.H_(t,r)}Z_(e){const t={};t.database=pa(this.serializer),t.addTarget=function(s,a){let c;const l=a.target;if(c=na(l)?{documents:Q_(s,l)}:{query:Y_(s,l).ft},c.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){c.resumeToken=bh(s,a.resumeToken);const u=la(s,a.expectedCount);u!==null&&(c.expectedCount=u)}else if(a.snapshotVersion.compareTo(W.min())>0){c.readTime=Is(s,a.snapshotVersion.toTimestamp());const u=la(s,a.expectedCount);u!==null&&(c.expectedCount=u)}return c}(this.serializer,e);const r=J_(this.serializer,e);r&&(t.labels=r),this.q_(t)}X_(e){const t={};t.database=pa(this.serializer),t.removeTarget=e,this.q_(t)}}class qb extends $h{constructor(e,t,r,i,s,a){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,i,a),this.serializer=s}get Y_(){return this.F_>0}start(){this.lastStreamToken=void 0,super.start()}W_(){this.Y_&&this.ea([])}j_(e,t){return this.connection.T_("Write",e,t)}J_(e){return te(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,te(!e.writeResults||e.writeResults.length===0,55816),this.listener.ta()}onNext(e){te(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.M_.reset();const t=W_(e.writeResults,e.commitTime),r=ot(e.commitTime);return this.listener.na(r,t)}ra(){const e={};e.database=pa(this.serializer),this.q_(e)}ea(e){const t={streamToken:this.lastStreamToken,writes:e.map(r=>G_(this.serializer,r))};this.q_(t)}}/**
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
 */class $b{}class Hb extends $b{constructor(e,t,r,i){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=i,this.ia=!1}sa(){if(this.ia)throw new q(L.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(e,t,r,i){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,a])=>this.connection.Wo(e,ha(t,r),i,s,a)).catch(s=>{throw s.name==="FirebaseError"?(s.code===L.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new q(L.UNKNOWN,s.toString())})}jo(e,t,r,i,s){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([a,c])=>this.connection.jo(e,ha(t,r),i,a,c,s)).catch(a=>{throw a.name==="FirebaseError"?(a.code===L.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new q(L.UNKNOWN,a.toString())})}terminate(){this.ia=!0,this.connection.terminate()}}function jb(n,e,t,r){return new Hb(n,e,t,r)}class Kb{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){this.oa===0&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve())))}ha(e){this.state==="Online"?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ca("Offline")))}set(e){this.Pa(),this.oa=0,e==="Online"&&(this.aa=!1),this.ca(e)}ca(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}la(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.aa?(_t(t),this.aa=!1):H("OnlineStateTracker",t)}Pa(){this._a!==null&&(this._a.cancel(),this._a=null)}}/**
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
 */const bn="RemoteStore";class zb{constructor(e,t,r,i,s){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.Ta=[],this.Ea=new Map,this.Ia=new Set,this.Ra=[],this.Aa=s,this.Aa.Mo(a=>{r.enqueueAndForget(async()=>{wn(this)&&(H(bn,"Restarting streams for network reachability change."),await async function(l){const u=Q(l);u.Ia.add(4),await ei(u),u.Va.set("Unknown"),u.Ia.delete(4),await Cs(u)}(this))})}),this.Va=new Kb(r,i)}}async function Cs(n){if(wn(n))for(const e of n.Ra)await e(!0)}async function ei(n){for(const e of n.Ra)await e(!1)}function Hh(n,e){const t=Q(n);t.Ea.has(e.targetId)||(t.Ea.set(e.targetId,e),Aa(t)?xa(t):tr(t).O_()&&Ia(t,e))}function Ta(n,e){const t=Q(n),r=tr(t);t.Ea.delete(e),r.O_()&&jh(t,e),t.Ea.size===0&&(r.O_()?r.L_():wn(t)&&t.Va.set("Unknown"))}function Ia(n,e){if(n.da.$e(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(W.min())>0){const t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}tr(n).Z_(e)}function jh(n,e){n.da.$e(e),tr(n).X_(e)}function xa(n){n.da=new U_({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),At:e=>n.Ea.get(e)||null,ht:()=>n.datastore.serializer.databaseId}),tr(n).start(),n.Va.ua()}function Aa(n){return wn(n)&&!tr(n).x_()&&n.Ea.size>0}function wn(n){return Q(n).Ia.size===0}function Kh(n){n.da=void 0}async function Gb(n){n.Va.set("Online")}async function Wb(n){n.Ea.forEach((e,t)=>{Ia(n,e)})}async function Qb(n,e){Kh(n),Aa(n)?(n.Va.ha(e),xa(n)):n.Va.set("Unknown")}async function Yb(n,e,t){if(n.Va.set("Online"),e instanceof yh&&e.state===2&&e.cause)try{await async function(i,s){const a=s.cause;for(const c of s.targetIds)i.Ea.has(c)&&(await i.remoteSyncer.rejectListen(c,a),i.Ea.delete(c),i.da.removeTarget(c))}(n,e)}catch(r){H(bn,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),await ks(n,r)}else if(e instanceof Es?n.da.Xe(e):e instanceof mh?n.da.st(e):n.da.tt(e),!t.isEqual(W.min()))try{const r=await Vh(n.localStore);t.compareTo(r)>=0&&await function(s,a){const c=s.da.Tt(a);return c.targetChanges.forEach((l,u)=>{if(l.resumeToken.approximateByteSize()>0){const f=s.Ea.get(u);f&&s.Ea.set(u,f.withResumeToken(l.resumeToken,a))}}),c.targetMismatches.forEach((l,u)=>{const f=s.Ea.get(l);if(!f)return;s.Ea.set(l,f.withResumeToken(Te.EMPTY_BYTE_STRING,f.snapshotVersion)),jh(s,l);const p=new zt(f.target,l,u,f.sequenceNumber);Ia(s,p)}),s.remoteSyncer.applyRemoteEvent(c)}(n,t)}catch(r){H(bn,"Failed to raise snapshot:",r),await ks(n,r)}}async function ks(n,e,t){if(!Gn(e))throw e;n.Ia.add(1),await ei(n),n.Va.set("Offline"),t||(t=()=>Vh(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{H(bn,"Retrying IndexedDB access"),await t(),n.Ia.delete(1),await Cs(n)})}function zh(n,e){return e().catch(t=>ks(n,t,e))}async function Rs(n){const e=Q(n),t=Gt(e);let r=e.Ta.length>0?e.Ta[e.Ta.length-1].batchId:Wo;for(;Xb(e);)try{const i=await Pb(e.localStore,r);if(i===null){e.Ta.length===0&&t.L_();break}r=i.batchId,Jb(e,i)}catch(i){await ks(e,i)}Gh(e)&&Wh(e)}function Xb(n){return wn(n)&&n.Ta.length<10}function Jb(n,e){n.Ta.push(e);const t=Gt(n);t.O_()&&t.Y_&&t.ea(e.mutations)}function Gh(n){return wn(n)&&!Gt(n).x_()&&n.Ta.length>0}function Wh(n){Gt(n).start()}async function Zb(n){Gt(n).ra()}async function ew(n){const e=Gt(n);for(const t of n.Ta)e.ea(t.mutations)}async function tw(n,e,t){const r=n.Ta.shift(),i=aa.from(r,e,t);await zh(n,()=>n.remoteSyncer.applySuccessfulWrite(i)),await Rs(n)}async function nw(n,e){e&&Gt(n).Y_&&await async function(r,i){if(function(a){return O_(a)&&a!==L.ABORTED}(i.code)){const s=r.Ta.shift();Gt(r).B_(),await zh(r,()=>r.remoteSyncer.rejectFailedWrite(s.batchId,i)),await Rs(r)}}(n,e),Gh(n)&&Wh(n)}async function Qh(n,e){const t=Q(n);t.asyncQueue.verifyOperationInProgress(),H(bn,"RemoteStore received new credentials");const r=wn(t);t.Ia.add(3),await ei(t),r&&t.Va.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.Ia.delete(3),await Cs(t)}async function rw(n,e){const t=Q(n);e?(t.Ia.delete(2),await Cs(t)):e||(t.Ia.add(2),await ei(t),t.Va.set("Unknown"))}function tr(n){return n.ma||(n.ma=function(t,r,i){const s=Q(t);return s.sa(),new Bb(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(n.datastore,n.asyncQueue,{Zo:Gb.bind(null,n),Yo:Wb.bind(null,n),t_:Qb.bind(null,n),H_:Yb.bind(null,n)}),n.Ra.push(async e=>{e?(n.ma.B_(),Aa(n)?xa(n):n.Va.set("Unknown")):(await n.ma.stop(),Kh(n))})),n.ma}function Gt(n){return n.fa||(n.fa=function(t,r,i){const s=Q(t);return s.sa(),new qb(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(n.datastore,n.asyncQueue,{Zo:()=>Promise.resolve(),Yo:Zb.bind(null,n),t_:nw.bind(null,n),ta:ew.bind(null,n),na:tw.bind(null,n)}),n.Ra.push(async e=>{e?(n.fa.B_(),await Rs(n)):(await n.fa.stop(),n.Ta.length>0&&(H(bn,`Stopping write stream with ${n.Ta.length} pending writes`),n.Ta=[]))})),n.fa}/**
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
 */class Sa{constructor(e,t,r,i,s){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=i,this.removalCallback=s,this.deferred=new bt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(a=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,i,s){const a=Date.now()+r,c=new Sa(e,t,a,i,s);return c.start(r),c}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new q(L.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Ca(n,e){if(_t("AsyncQueue",`${e}: ${n}`),Gn(n))return new q(L.UNAVAILABLE,`${e}: ${n}`);throw n}/**
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
 */class nr{static emptySet(e){return new nr(e.comparator)}constructor(e){this.comparator=e?(t,r)=>e(t,r)||j.comparator(t.key,r.key):(t,r)=>j.comparator(t.key,r.key),this.keyedMap=jr(),this.sortedSet=new ae(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof nr)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const i=t.getNext().key,s=r.getNext().key;if(!i.isEqual(s))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new nr;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
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
 */class Yh{constructor(){this.ga=new ae(j.comparator)}track(e){const t=e.doc.key,r=this.ga.get(t);r?e.type!==0&&r.type===3?this.ga=this.ga.insert(t,e):e.type===3&&r.type!==1?this.ga=this.ga.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.ga=this.ga.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.ga=this.ga.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.ga=this.ga.remove(t):e.type===1&&r.type===2?this.ga=this.ga.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.ga=this.ga.insert(t,{type:2,doc:e.doc}):G(63341,{Vt:e,pa:r}):this.ga=this.ga.insert(t,e)}ya(){const e=[];return this.ga.inorderTraversal((t,r)=>{e.push(r)}),e}}class rr{constructor(e,t,r,i,s,a,c,l,u){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=i,this.mutatedKeys=s,this.fromCache=a,this.syncStateChanged=c,this.excludesMetadataChanges=l,this.hasCachedResults=u}static fromInitialDocuments(e,t,r,i,s){const a=[];return t.forEach(c=>{a.push({type:0,doc:c})}),new rr(e,t,nr.emptySet(t),a,r,i,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&gs(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let i=0;i<t.length;i++)if(t[i].type!==r[i].type||!t[i].doc.isEqual(r[i].doc))return!1;return!0}}/**
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
 */class iw{constructor(){this.wa=void 0,this.Sa=[]}ba(){return this.Sa.some(e=>e.Da())}}class sw{constructor(){this.queries=Xh(),this.onlineState="Unknown",this.Ca=new Set}terminate(){(function(t,r){const i=Q(t),s=i.queries;i.queries=Xh(),s.forEach((a,c)=>{for(const l of c.Sa)l.onError(r)})})(this,new q(L.ABORTED,"Firestore shutting down"))}}function Xh(){return new yn(n=>Yu(n),gs)}async function Jh(n,e){const t=Q(n);let r=3;const i=e.query;let s=t.queries.get(i);s?!s.ba()&&e.Da()&&(r=2):(s=new iw,r=e.Da()?0:1);try{switch(r){case 0:s.wa=await t.onListen(i,!0);break;case 1:s.wa=await t.onListen(i,!1);break;case 2:await t.onFirstRemoteStoreListen(i)}}catch(a){const c=Ca(a,`Initialization of query '${Yn(e.query)}' failed`);return void e.onError(c)}t.queries.set(i,s),s.Sa.push(e),e.va(t.onlineState),s.wa&&e.Fa(s.wa)&&ka(t)}async function Zh(n,e){const t=Q(n),r=e.query;let i=3;const s=t.queries.get(r);if(s){const a=s.Sa.indexOf(e);a>=0&&(s.Sa.splice(a,1),s.Sa.length===0?i=e.Da()?0:1:!s.ba()&&e.Da()&&(i=2))}switch(i){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function ow(n,e){const t=Q(n);let r=!1;for(const i of e){const s=i.query,a=t.queries.get(s);if(a){for(const c of a.Sa)c.Fa(i)&&(r=!0);a.wa=i}}r&&ka(t)}function aw(n,e,t){const r=Q(n),i=r.queries.get(e);if(i)for(const s of i.Sa)s.onError(t);r.queries.delete(e)}function ka(n){n.Ca.forEach(e=>{e.next()})}var Ra,ed;(ed=Ra||(Ra={})).Ma="default",ed.Cache="cache";class td{constructor(e,t,r){this.query=e,this.xa=t,this.Oa=!1,this.Na=null,this.onlineState="Unknown",this.options=r||{}}Fa(e){if(!this.options.includeMetadataChanges){const r=[];for(const i of e.docChanges)i.type!==3&&r.push(i);e=new rr(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Oa?this.Ba(e)&&(this.xa.next(e),t=!0):this.La(e,this.onlineState)&&(this.ka(e),t=!0),this.Na=e,t}onError(e){this.xa.error(e)}va(e){this.onlineState=e;let t=!1;return this.Na&&!this.Oa&&this.La(this.Na,e)&&(this.ka(this.Na),t=!0),t}La(e,t){if(!e.fromCache||!this.Da())return!0;const r=t!=="Offline";return(!this.options.qa||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Ba(e){if(e.docChanges.length>0)return!0;const t=this.Na&&this.Na.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}ka(e){e=rr.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Oa=!0,this.xa.next(e)}Da(){return this.options.source!==Ra.Cache}}/**
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
 */class nd{constructor(e){this.key=e}}class rd{constructor(e){this.key=e}}class cw{constructor(e,t){this.query=e,this.Za=t,this.Xa=null,this.hasCachedResults=!1,this.current=!1,this.Ya=Z(),this.mutatedKeys=Z(),this.eu=Xu(e),this.tu=new nr(this.eu)}get nu(){return this.Za}ru(e,t){const r=t?t.iu:new Yh,i=t?t.tu:this.tu;let s=t?t.mutatedKeys:this.mutatedKeys,a=i,c=!1;const l=this.query.limitType==="F"&&i.size===this.query.limit?i.last():null,u=this.query.limitType==="L"&&i.size===this.query.limit?i.first():null;if(e.inorderTraversal((f,p)=>{const y=i.get(f),A=ms(this.query,p)?p:null,E=!!y&&this.mutatedKeys.has(y.key),w=!!A&&(A.hasLocalMutations||this.mutatedKeys.has(A.key)&&A.hasCommittedMutations);let x=!1;y&&A?y.data.isEqual(A.data)?E!==w&&(r.track({type:3,doc:A}),x=!0):this.su(y,A)||(r.track({type:2,doc:A}),x=!0,(l&&this.eu(A,l)>0||u&&this.eu(A,u)<0)&&(c=!0)):!y&&A?(r.track({type:0,doc:A}),x=!0):y&&!A&&(r.track({type:1,doc:y}),x=!0,(l||u)&&(c=!0)),x&&(A?(a=a.add(A),s=w?s.add(f):s.delete(f)):(a=a.delete(f),s=s.delete(f)))}),this.query.limit!==null)for(;a.size>this.query.limit;){const f=this.query.limitType==="F"?a.last():a.first();a=a.delete(f.key),s=s.delete(f.key),r.track({type:1,doc:f})}return{tu:a,iu:r,bs:c,mutatedKeys:s}}su(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,i){const s=this.tu;this.tu=e.tu,this.mutatedKeys=e.mutatedKeys;const a=e.iu.ya();a.sort((f,p)=>function(A,E){const w=x=>{switch(x){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return G(20277,{Vt:x})}};return w(A)-w(E)}(f.type,p.type)||this.eu(f.doc,p.doc)),this.ou(r),i=i??!1;const c=t&&!i?this._u():[],l=this.Ya.size===0&&this.current&&!i?1:0,u=l!==this.Xa;return this.Xa=l,a.length!==0||u?{snapshot:new rr(this.query,e.tu,s,a,e.mutatedKeys,l===0,u,!1,!!r&&r.resumeToken.approximateByteSize()>0),au:c}:{au:c}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({tu:this.tu,iu:new Yh,mutatedKeys:this.mutatedKeys,bs:!1},!1)):{au:[]}}uu(e){return!this.Za.has(e)&&!!this.tu.has(e)&&!this.tu.get(e).hasLocalMutations}ou(e){e&&(e.addedDocuments.forEach(t=>this.Za=this.Za.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Za=this.Za.delete(t)),this.current=e.current)}_u(){if(!this.current)return[];const e=this.Ya;this.Ya=Z(),this.tu.forEach(r=>{this.uu(r.key)&&(this.Ya=this.Ya.add(r.key))});const t=[];return e.forEach(r=>{this.Ya.has(r)||t.push(new rd(r))}),this.Ya.forEach(r=>{e.has(r)||t.push(new nd(r))}),t}cu(e){this.Za=e.ks,this.Ya=Z();const t=this.ru(e.documents);return this.applyChanges(t,!0)}lu(){return rr.fromInitialDocuments(this.query,this.tu,this.mutatedKeys,this.Xa===0,this.hasCachedResults)}}const Pa="SyncEngine";class lw{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class uw{constructor(e){this.key=e,this.hu=!1}}class hw{constructor(e,t,r,i,s,a){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=i,this.currentUser=s,this.maxConcurrentLimboResolutions=a,this.Pu={},this.Tu=new yn(c=>Yu(c),gs),this.Eu=new Map,this.Iu=new Set,this.Ru=new ae(j.comparator),this.Au=new Map,this.Vu=new ga,this.du={},this.mu=new Map,this.fu=Zn.ar(),this.onlineState="Unknown",this.gu=void 0}get isPrimaryClient(){return this.gu===!0}}async function dw(n,e,t=!0){const r=hd(n);let i;const s=r.Tu.get(e);return s?(r.sharedClientState.addLocalQueryTarget(s.targetId),i=s.view.lu()):i=await id(r,e,t,!0),i}async function fw(n,e){const t=hd(n);await id(t,e,!0,!1)}async function id(n,e,t,r){const i=await Nb(n.localStore,st(e)),s=i.targetId,a=n.sharedClientState.addLocalQueryTarget(s,t);let c;return r&&(c=await pw(n,e,s,a==="current",i.resumeToken)),n.isPrimaryClient&&t&&Hh(n.remoteStore,i),c}async function pw(n,e,t,r,i){n.pu=(p,y,A)=>async function(w,x,R,P){let N=x.view.ru(R);N.bs&&(N=await Oh(w.localStore,x.query,!1).then(({documents:_})=>x.view.ru(_,N)));const O=P&&P.targetChanges.get(x.targetId),B=P&&P.targetMismatches.get(x.targetId)!=null,K=x.view.applyChanges(N,w.isPrimaryClient,O,B);return ud(w,x.targetId,K.au),K.snapshot}(n,p,y,A);const s=await Oh(n.localStore,e,!0),a=new cw(e,s.ks),c=a.ru(s.documents),l=Jr.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",i),u=a.applyChanges(c,n.isPrimaryClient,l);ud(n,t,u.au);const f=new lw(e,t,a);return n.Tu.set(e,f),n.Eu.has(t)?n.Eu.get(t).push(e):n.Eu.set(t,[e]),u.snapshot}async function gw(n,e,t){const r=Q(n),i=r.Tu.get(e),s=r.Eu.get(i.targetId);if(s.length>1)return r.Eu.set(i.targetId,s.filter(a=>!gs(a,e))),void r.Tu.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(i.targetId),r.sharedClientState.isActiveQueryTarget(i.targetId)||await _a(r.localStore,i.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(i.targetId),t&&Ta(r.remoteStore,i.targetId),Na(r,i.targetId)}).catch(zn)):(Na(r,i.targetId),await _a(r.localStore,i.targetId,!0))}async function mw(n,e){const t=Q(n),r=t.Tu.get(e),i=t.Eu.get(r.targetId);t.isPrimaryClient&&i.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),Ta(t.remoteStore,r.targetId))}async function yw(n,e,t){const r=Iw(n);try{const i=await function(a,c){const l=Q(a),u=ie.now(),f=c.reduce((A,E)=>A.add(E.key),Z());let p,y;return l.persistence.runTransaction("Locally write mutations","readwrite",A=>{let E=wt(),w=Z();return l.xs.getEntries(A,f).next(x=>{E=x,E.forEach((R,P)=>{P.isValidDocument()||(w=w.add(R))})}).next(()=>l.localDocuments.getOverlayedDocuments(A,E)).next(x=>{p=x;const R=[];for(const P of c){const N=P_(P,p.get(P.key).overlayedDocument);N!=null&&R.push(new _n(P.key,N,Fu(N.value.mapValue),Et.exists(!0)))}return l.mutationQueue.addMutationBatch(A,u,R,c)}).next(x=>{y=x;const R=x.applyToLocalDocumentSet(p,w);return l.documentOverlayCache.saveOverlays(A,x.batchId,R)})}).then(()=>({batchId:y.batchId,changes:Zu(p)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(i.batchId),function(a,c,l){let u=a.du[a.currentUser.toKey()];u||(u=new ae(J)),u=u.insert(c,l),a.du[a.currentUser.toKey()]=u}(r,i.batchId,t),await ti(r,i.changes),await Rs(r.remoteStore)}catch(i){const s=Ca(i,"Failed to persist write");t.reject(s)}}async function sd(n,e){const t=Q(n);try{const r=await kb(t.localStore,e);e.targetChanges.forEach((i,s)=>{const a=t.Au.get(s);a&&(te(i.addedDocuments.size+i.modifiedDocuments.size+i.removedDocuments.size<=1,22616),i.addedDocuments.size>0?a.hu=!0:i.modifiedDocuments.size>0?te(a.hu,14607):i.removedDocuments.size>0&&(te(a.hu,42227),a.hu=!1))}),await ti(t,r,e)}catch(r){await zn(r)}}function od(n,e,t){const r=Q(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const i=[];r.Tu.forEach((s,a)=>{const c=a.view.va(e);c.snapshot&&i.push(c.snapshot)}),function(a,c){const l=Q(a);l.onlineState=c;let u=!1;l.queries.forEach((f,p)=>{for(const y of p.Sa)y.va(c)&&(u=!0)}),u&&ka(l)}(r.eventManager,e),i.length&&r.Pu.H_(i),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function vw(n,e,t){const r=Q(n);r.sharedClientState.updateQueryState(e,"rejected",t);const i=r.Au.get(e),s=i&&i.key;if(s){let a=new ae(j.comparator);a=a.insert(s,Ae.newNoDocument(s,W.min()));const c=Z().add(s),l=new ws(W.min(),new Map,new ae(J),a,c);await sd(r,l),r.Ru=r.Ru.remove(s),r.Au.delete(e),Da(r)}else await _a(r.localStore,e,!1).then(()=>Na(r,e,t)).catch(zn)}async function _w(n,e){const t=Q(n),r=e.batch.batchId;try{const i=await Cb(t.localStore,e);cd(t,r,null),ad(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await ti(t,i)}catch(i){await zn(i)}}async function bw(n,e,t){const r=Q(n);try{const i=await function(a,c){const l=Q(a);return l.persistence.runTransaction("Reject batch","readwrite-primary",u=>{let f;return l.mutationQueue.lookupMutationBatch(u,c).next(p=>(te(p!==null,37113),f=p.keys(),l.mutationQueue.removeMutationBatch(u,p))).next(()=>l.mutationQueue.performConsistencyCheck(u)).next(()=>l.documentOverlayCache.removeOverlaysForBatchId(u,f,c)).next(()=>l.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(u,f)).next(()=>l.localDocuments.getDocuments(u,f))})}(r.localStore,e);cd(r,e,t),ad(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await ti(r,i)}catch(i){await zn(i)}}function ad(n,e){(n.mu.get(e)||[]).forEach(t=>{t.resolve()}),n.mu.delete(e)}function cd(n,e,t){const r=Q(n);let i=r.du[r.currentUser.toKey()];if(i){const s=i.get(e);s&&(t?s.reject(t):s.resolve(),i=i.remove(e)),r.du[r.currentUser.toKey()]=i}}function Na(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Eu.get(e))n.Tu.delete(r),t&&n.Pu.yu(r,t);n.Eu.delete(e),n.isPrimaryClient&&n.Vu.Gr(e).forEach(r=>{n.Vu.containsKey(r)||ld(n,r)})}function ld(n,e){n.Iu.delete(e.path.canonicalString());const t=n.Ru.get(e);t!==null&&(Ta(n.remoteStore,t),n.Ru=n.Ru.remove(e),n.Au.delete(t),Da(n))}function ud(n,e,t){for(const r of t)r instanceof nd?(n.Vu.addReference(r.key,e),ww(n,r)):r instanceof rd?(H(Pa,"Document no longer in limbo: "+r.key),n.Vu.removeReference(r.key,e),n.Vu.containsKey(r.key)||ld(n,r.key)):G(19791,{wu:r})}function ww(n,e){const t=e.key,r=t.path.canonicalString();n.Ru.get(t)||n.Iu.has(r)||(H(Pa,"New document in limbo: "+t),n.Iu.add(r),Da(n))}function Da(n){for(;n.Iu.size>0&&n.Ru.size<n.maxConcurrentLimboResolutions;){const e=n.Iu.values().next().value;n.Iu.delete(e);const t=new j(re.fromString(e)),r=n.fu.next();n.Au.set(r,new uw(t)),n.Ru=n.Ru.insert(t,r),Hh(n.remoteStore,new zt(st(ra(t.path)),r,"TargetPurposeLimboResolution",rs.ce))}}async function ti(n,e,t){const r=Q(n),i=[],s=[],a=[];r.Tu.isEmpty()||(r.Tu.forEach((c,l)=>{a.push(r.pu(l,e,t).then(u=>{var f;if((u||t)&&r.isPrimaryClient){const p=u?!u.fromCache:(f=t==null?void 0:t.targetChanges.get(l.targetId))==null?void 0:f.current;r.sharedClientState.updateQueryState(l.targetId,p?"current":"not-current")}if(u){i.push(u);const p=ya.Is(l.targetId,u);s.push(p)}}))}),await Promise.all(a),r.Pu.H_(i),await async function(l,u){const f=Q(l);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",p=>V.forEach(u,y=>V.forEach(y.Ts,A=>f.persistence.referenceDelegate.addReference(p,y.targetId,A)).next(()=>V.forEach(y.Es,A=>f.persistence.referenceDelegate.removeReference(p,y.targetId,A)))))}catch(p){if(!Gn(p))throw p;H(va,"Failed to update sequence numbers: "+p)}for(const p of u){const y=p.targetId;if(!p.fromCache){const A=f.vs.get(y),E=A.snapshotVersion,w=A.withLastLimboFreeSnapshotVersion(E);f.vs=f.vs.insert(y,w)}}}(r.localStore,s))}async function Ew(n,e){const t=Q(n);if(!t.currentUser.isEqual(e)){H(Pa,"User change. New user:",e.toKey());const r=await Lh(t.localStore,e);t.currentUser=e,function(s,a){s.mu.forEach(c=>{c.forEach(l=>{l.reject(new q(L.CANCELLED,a))})}),s.mu.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await ti(t,r.Ns)}}function Tw(n,e){const t=Q(n),r=t.Au.get(e);if(r&&r.hu)return Z().add(r.key);{let i=Z();const s=t.Eu.get(e);if(!s)return i;for(const a of s){const c=t.Tu.get(a);i=i.unionWith(c.view.nu)}return i}}function hd(n){const e=Q(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=sd.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=Tw.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=vw.bind(null,e),e.Pu.H_=ow.bind(null,e.eventManager),e.Pu.yu=aw.bind(null,e.eventManager),e}function Iw(n){const e=Q(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=_w.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=bw.bind(null,e),e}class Ps{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Ss(e.databaseInfo.databaseId),this.sharedClientState=this.Du(e),this.persistence=this.Cu(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Fu(e,this.localStore),this.indexBackfillerScheduler=this.Mu(e,this.localStore)}Fu(e,t){return null}Mu(e,t){return null}vu(e){return Sb(this.persistence,new Ib,e.initialUser,this.serializer)}Cu(e){return new Dh(ma.Vi,this.serializer)}Du(e){return new Lb}async terminate(){var e,t;(e=this.gcScheduler)==null||e.stop(),(t=this.indexBackfillerScheduler)==null||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Ps.provider={build:()=>new Ps};class xw extends Ps{constructor(e){super(),this.cacheSizeBytes=e}Fu(e,t){te(this.persistence.referenceDelegate instanceof xs,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new lb(r,e.asyncQueue,t)}Cu(e){const t=this.cacheSizeBytes!==void 0?Oe.withCacheSize(this.cacheSizeBytes):Oe.DEFAULT;return new Dh(r=>xs.Vi(r,t),this.serializer)}}class La{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>od(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=Ew.bind(null,this.syncEngine),await rw(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new sw}()}createDatastore(e){const t=Ss(e.databaseInfo.databaseId),r=Ub(e.databaseInfo);return jb(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return function(r,i,s,a,c){return new zb(r,i,s,a,c)}(this.localStore,this.datastore,e.asyncQueue,t=>od(this.syncEngine,t,0),function(){return Uh.v()?new Uh:new Vb}())}createSyncEngine(e,t){return function(i,s,a,c,l,u,f){const p=new hw(i,s,a,c,l,u);return f&&(p.gu=!0),p}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(i){const s=Q(i);H(bn,"RemoteStore shutting down."),s.Ia.add(5),await ei(s),s.Aa.shutdown(),s.Va.set("Unknown")}(this.remoteStore),(e=this.datastore)==null||e.terminate(),(t=this.eventManager)==null||t.terminate()}}La.provider={build:()=>new La};/**
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
 */class dd{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ou(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ou(this.observer.error,e):_t("Uncaught Error in snapshot listener:",e.toString()))}Nu(){this.muted=!0}Ou(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
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
 */const Wt="FirestoreClient";class Aw{constructor(e,t,r,i,s){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this._databaseInfo=i,this.user=xe.UNAUTHENTICATED,this.clientId=Ko.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(r,async a=>{H(Wt,"Received user=",a.uid),await this.authCredentialListener(a),this.user=a}),this.appCheckCredentials.start(r,a=>(H(Wt,"Received new app check token=",a),this.appCheckCredentialListener(a,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new bt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=Ca(t,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function Va(n,e){n.asyncQueue.verifyOperationInProgress(),H(Wt,"Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener(async i=>{r.isEqual(i)||(await Lh(e.localStore,i),r=i)}),e.persistence.setDatabaseDeletedListener(()=>n.terminate()),n._offlineComponents=e}async function fd(n,e){n.asyncQueue.verifyOperationInProgress();const t=await Sw(n);H(Wt,"Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener(r=>Qh(e.remoteStore,r)),n.setAppCheckTokenChangeListener((r,i)=>Qh(e.remoteStore,i)),n._onlineComponents=e}async function Sw(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){H(Wt,"Using user provided OfflineComponentProvider");try{await Va(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(i){return i.name==="FirebaseError"?i.code===L.FAILED_PRECONDITION||i.code===L.UNIMPLEMENTED:!(typeof DOMException<"u"&&i instanceof DOMException)||i.code===22||i.code===20||i.code===11}(t))throw t;pn("Error using user provided cache. Falling back to memory cache: "+t),await Va(n,new Ps)}}else H(Wt,"Using default OfflineComponentProvider"),await Va(n,new xw(void 0));return n._offlineComponents}async function pd(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(H(Wt,"Using user provided OnlineComponentProvider"),await fd(n,n._uninitializedComponentsProvider._online)):(H(Wt,"Using default OnlineComponentProvider"),await fd(n,new La))),n._onlineComponents}function Cw(n){return pd(n).then(e=>e.syncEngine)}async function gd(n){const e=await pd(n),t=e.eventManager;return t.onListen=dw.bind(null,e.syncEngine),t.onUnlisten=gw.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=fw.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=mw.bind(null,e.syncEngine),t}function kw(n,e,t={}){const r=new bt;return n.asyncQueue.enqueueAndForget(async()=>function(s,a,c,l,u){const f=new dd({next:y=>{f.Nu(),a.enqueueAndForget(()=>Zh(s,p));const A=y.docs.has(c);!A&&y.fromCache?u.reject(new q(L.UNAVAILABLE,"Failed to get document because the client is offline.")):A&&y.fromCache&&l&&l.source==="server"?u.reject(new q(L.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):u.resolve(y)},error:y=>u.reject(y)}),p=new td(ra(c.path),f,{includeMetadataChanges:!0,qa:!0});return Jh(s,p)}(await gd(n),n.asyncQueue,e,t,r)),r.promise}function Rw(n,e,t={}){const r=new bt;return n.asyncQueue.enqueueAndForget(async()=>function(s,a,c,l,u){const f=new dd({next:y=>{f.Nu(),a.enqueueAndForget(()=>Zh(s,p)),y.fromCache&&l.source==="server"?u.reject(new q(L.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):u.resolve(y)},error:y=>u.reject(y)}),p=new td(c,f,{includeMetadataChanges:!0,qa:!0});return Jh(s,p)}(await gd(n),n.asyncQueue,e,t,r)),r.promise}function Pw(n,e){const t=new bt;return n.asyncQueue.enqueueAndForget(async()=>yw(await Cw(n),e,t)),t.promise}/**
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
 */function md(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
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
 */const Nw="ComponentProvider",yd=new Map;function Dw(n,e,t,r,i){return new Zv(n,e,t,i.host,i.ssl,i.experimentalForceLongPolling,i.experimentalAutoDetectLongPolling,md(i.experimentalLongPollingOptions),i.useFetchStreams,i.isUsingEmulator,r)}/**
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
 */const vd="firestore.googleapis.com",_d=!0;class bd{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new q(L.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=vd,this.ssl=_d}else this.host=e.host,this.ssl=e.ssl??_d;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=Rh;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<ab)throw new q(L.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}$v("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=md(e.experimentalLongPollingOptions??{}),function(r){if(r.timeoutSeconds!==void 0){if(isNaN(r.timeoutSeconds))throw new q(L.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (must not be NaN)`);if(r.timeoutSeconds<5)throw new q(L.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (minimum allowed value is 5)`);if(r.timeoutSeconds>30)throw new q(L.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,i){return r.timeoutSeconds===i.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Ns{constructor(e,t,r,i){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new bd({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new q(L.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new q(L.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new bd(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new Nv;switch(r.type){case"firstParty":return new Ov(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new q(L.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const r=yd.get(t);r&&(H(Nw,"Removing Datastore"),yd.delete(t),r.terminate())}(this),Promise.resolve()}}function Lw(n,e,t,r={}){var u;n=gn(n,Ns);const i=Ar(e),s=n._getSettings(),a={...s,emulatorOptions:n._getEmulatorOptions()},c=`${e}:${t}`;i&&jc(`https://${c}`),s.host!==vd&&s.host!==c&&pn("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const l={...s,host:c,ssl:i,emulatorOptions:r};if(!an(l,a)&&(n._setSettings(l),r.mockUserToken)){let f,p;if(typeof r.mockUserToken=="string")f=r.mockUserToken,p=xe.MOCK_USER;else{f=Hp(r.mockUserToken,(u=n._app)==null?void 0:u.options.projectId);const y=r.mockUserToken.sub||r.mockUserToken.user_id;if(!y)throw new q(L.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");p=new xe(y)}n._authCredentials=new Dv(new du(f,p))}}/**
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
 */class ir{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new ir(this.firestore,e,this._query)}}class pe{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Qt(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new pe(this.firestore,e,this._key)}toJSON(){return{type:pe._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,r){if(Or(t,pe._jsonSchema))return new pe(e,r||null,new j(re.fromString(t.referencePath)))}}pe._jsonSchemaVersion="firestore/documentReference/1.0",pe._jsonSchema={type:he("string",pe._jsonSchemaVersion),referencePath:he("string")};class Qt extends ir{constructor(e,t,r){super(e,t,ra(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new pe(this.firestore,null,new j(e))}withConverter(e){return new Qt(this.firestore,e,this._path)}}function wd(n,e,...t){if(n=Pe(n),gu("collection","path",e),n instanceof Ns){const r=re.fromString(e,...t);return yu(r),new Qt(n,null,r)}{if(!(n instanceof pe||n instanceof Qt))throw new q(L.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(re.fromString(e,...t));return yu(r),new Qt(n.firestore,null,r)}}function Yt(n,e,...t){if(n=Pe(n),arguments.length===1&&(e=Ko.newId()),gu("doc","path",e),n instanceof Ns){const r=re.fromString(e,...t);return mu(r),new pe(n,null,new j(r))}{if(!(n instanceof pe||n instanceof Qt))throw new q(L.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(re.fromString(e,...t));return mu(r),new pe(n.firestore,n instanceof Qt?n.converter:null,new j(r))}}/**
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
 */const Ed="AsyncQueue";class Td{constructor(e=Promise.resolve()){this.Yu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new Bh(this,"async_queue_retry"),this._c=()=>{const r=Ea();r&&H(Ed,"Visibility state changed to "+r.visibilityState),this.M_.w_()},this.ac=e;const t=Ea();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.uc(),this.cc(e)}enterRestrictedMode(e){if(!this.ec){this.ec=!0,this.sc=e||!1;const t=Ea();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this._c)}}enqueue(e){if(this.uc(),this.ec)return new Promise(()=>{});const t=new bt;return this.cc(()=>this.ec&&this.sc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Yu.push(e),this.lc()))}async lc(){if(this.Yu.length!==0){try{await this.Yu[0](),this.Yu.shift(),this.M_.reset()}catch(e){if(!Gn(e))throw e;H(Ed,"Operation failed with retryable error: "+e)}this.Yu.length>0&&this.M_.p_(()=>this.lc())}}cc(e){const t=this.ac.then(()=>(this.rc=!0,e().catch(r=>{throw this.nc=r,this.rc=!1,_t("INTERNAL UNHANDLED ERROR: ",Id(r)),r}).then(r=>(this.rc=!1,r))));return this.ac=t,t}enqueueAfterDelay(e,t,r){this.uc(),this.oc.indexOf(e)>-1&&(t=0);const i=Sa.createAndSchedule(this,e,t,r,s=>this.hc(s));return this.tc.push(i),i}uc(){this.nc&&G(47125,{Pc:Id(this.nc)})}verifyOperationInProgress(){}async Tc(){let e;do e=this.ac,await e;while(e!==this.ac)}Ec(e){for(const t of this.tc)if(t.timerId===e)return!0;return!1}Ic(e){return this.Tc().then(()=>{this.tc.sort((t,r)=>t.targetTimeMs-r.targetTimeMs);for(const t of this.tc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.Tc()})}Rc(e){this.oc.push(e)}hc(e){const t=this.tc.indexOf(e);this.tc.splice(t,1)}}function Id(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}class Ds extends Ns{constructor(e,t,r,i){super(e,t,r,i),this.type="firestore",this._queue=new Td,this._persistenceKey=(i==null?void 0:i.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Td(e),this._firestoreClient=void 0,await e}}}function Vw(n,e){const t=typeof n=="object"?n:Zc(),r=typeof n=="string"?n:cs,i=So(t,"firestore").getImmediate({identifier:r});if(!i._initialized){const s=qp("firestore");s&&Lw(i,...s)}return i}function Oa(n){if(n._terminated)throw new q(L.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||Ow(n),n._firestoreClient}function Ow(n){var r,i,s,a;const e=n._freezeSettings(),t=Dw(n._databaseId,((r=n._app)==null?void 0:r.options.appId)||"",n._persistenceKey,(i=n._app)==null?void 0:i.options.apiKey,e);n._componentsProvider||(s=e.localCache)!=null&&s._offlineComponentProvider&&((a=e.localCache)!=null&&a._onlineComponentProvider)&&(n._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),n._firestoreClient=new Aw(n._authCredentials,n._appCheckCredentials,n._queue,t,n._componentsProvider&&function(l){const u=l==null?void 0:l._online.build();return{_offline:l==null?void 0:l._offline.build(u),_online:u}}(n._componentsProvider))}/**
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
 */class Ke{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Ke(Te.fromBase64String(e))}catch(t){throw new q(L.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new Ke(Te.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:Ke._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(Or(e,Ke._jsonSchema))return Ke.fromBase64String(e.bytes)}}Ke._jsonSchemaVersion="firestore/bytes/1.0",Ke._jsonSchema={type:he("string",Ke._jsonSchemaVersion),bytes:he("string")};/**
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
 */class xd{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new q(L.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new we(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
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
 */class Ma{constructor(e){this._methodName=e}}/**
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
 */class at{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new q(L.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new q(L.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return J(this._lat,e._lat)||J(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:at._jsonSchemaVersion}}static fromJSON(e){if(Or(e,at._jsonSchema))return new at(e.latitude,e.longitude)}}at._jsonSchemaVersion="firestore/geoPoint/1.0",at._jsonSchema={type:he("string",at._jsonSchemaVersion),latitude:he("number"),longitude:he("number")};/**
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
 */class Ze{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,i){if(r.length!==i.length)return!1;for(let s=0;s<r.length;++s)if(r[s]!==i[s])return!1;return!0}(this._values,e._values)}toJSON(){return{type:Ze._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(Or(e,Ze._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(t=>typeof t=="number"))return new Ze(e.vectorValues);throw new q(L.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}Ze._jsonSchemaVersion="firestore/vectorValue/1.0",Ze._jsonSchema={type:he("string",Ze._jsonSchemaVersion),vectorValues:he("object")};/**
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
 */const Mw=/^__.*__$/;class Fw{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new _n(e,this.data,this.fieldMask,t,this.fieldTransforms):new Yr(e,this.data,t,this.fieldTransforms)}}function Ad(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw G(40011,{dataSource:n})}}class Fa{constructor(e,t,r,i,s,a){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=i,s===void 0&&this.Ac(),this.fieldTransforms=s||[],this.fieldMask=a||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}i(e){return new Fa({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}dc(e){var i;const t=(i=this.path)==null?void 0:i.child(e),r=this.i({path:t,arrayElement:!1});return r.mc(e),r}fc(e){var i;const t=(i=this.path)==null?void 0:i.child(e),r=this.i({path:t,arrayElement:!1});return r.Ac(),r}gc(e){return this.i({path:void 0,arrayElement:!0})}yc(e){return Vs(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}Ac(){if(this.path)for(let e=0;e<this.path.length;e++)this.mc(this.path.get(e))}mc(e){if(e.length===0)throw this.yc("Document fields must not be empty");if(Ad(this.dataSource)&&Mw.test(e))throw this.yc('Document fields cannot begin and end with "__"')}}class Uw{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||Ss(e)}I(e,t,r,i=!1){return new Fa({dataSource:e,methodName:t,targetDoc:r,path:we.emptyPath(),arrayElement:!1,hasConverter:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Sd(n){const e=n._freezeSettings(),t=Ss(n._databaseId);return new Uw(n._databaseId,!!e.ignoreUndefinedProperties,t)}function Bw(n,e,t,r,i,s={}){const a=n.I(s.merge||s.mergeFields?2:0,e,t,i);Rd("Data must be an object, but it was:",a,r);const c=Cd(r,a);let l,u;if(s.merge)l=new Xe(a.fieldMask),u=a.fieldTransforms;else if(s.mergeFields){const f=[];for(const p of s.mergeFields){const y=Ls(e,p,t);if(!a.contains(y))throw new q(L.INVALID_ARGUMENT,`Field '${y}' is specified in your field mask but missing from your input data.`);jw(f,y)||f.push(y)}l=new Xe(f),u=a.fieldTransforms.filter(p=>l.covers(p.field))}else l=null,u=a.fieldTransforms;return new Fw(new je(c),l,u)}class Ua extends Ma{_toFieldTransform(e){return new S_(e.path,new zr)}isEqual(e){return e instanceof Ua}}function qw(n,e,t,r=!1){return Ba(t,n.I(r?4:3,e))}function Ba(n,e){if(kd(n=Pe(n)))return Rd("Unsupported field value:",e,n),Cd(n,e);if(n instanceof Ma)return function(r,i){if(!Ad(i.dataSource))throw i.yc(`${r._methodName}() can only be used with update() and set()`);if(!i.path)throw i.yc(`${r._methodName}() is not currently supported inside arrays`);const s=r._toFieldTransform(i);s&&i.fieldTransforms.push(s)}(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.yc("Nested arrays are not supported");return function(r,i){const s=[];let a=0;for(const c of r){let l=Ba(c,i.gc(a));l==null&&(l={nullValue:"NULL_VALUE"}),s.push(l),a++}return{arrayValue:{values:s}}}(n,e)}return function(r,i){if((r=Pe(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return I_(i.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const s=ie.fromDate(r);return{timestampValue:Is(i.serializer,s)}}if(r instanceof ie){const s=new ie(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:Is(i.serializer,s)}}if(r instanceof at)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof Ke)return{bytesValue:bh(i.serializer,r._byteString)};if(r instanceof pe){const s=i.databaseId,a=r.firestore._databaseId;if(!a.isEqual(s))throw i.yc(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${s.projectId}/${s.database}`);return{referenceValue:ua(r.firestore._databaseId||i.databaseId,r._key.path)}}if(r instanceof Ze)return function(a,c){const l=a instanceof Ze?a.toArray():a;return{mapValue:{fields:{[Pu]:{stringValue:Nu},[us]:{arrayValue:{values:l.map(f=>{if(typeof f!="number")throw c.yc("VectorValues must only contain numeric values.");return oa(c.serializer,f)})}}}}}}(r,i);if(Ch(r))return r._toProto(i.serializer);throw i.yc(`Unsupported field value: ${ns(r)}`)}(n,e)}function Cd(n,e){const t={};return Iu(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):mn(n,(r,i)=>{const s=Ba(i,e.dc(r));s!=null&&(t[r]=s)}),{mapValue:{fields:t}}}function kd(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof ie||n instanceof at||n instanceof Ke||n instanceof pe||n instanceof Ma||n instanceof Ze||Ch(n))}function Rd(n,e,t){if(!kd(t)||!vu(t)){const r=ns(t);throw r==="an object"?e.yc(n+" a custom object"):e.yc(n+" "+r)}}function Ls(n,e,t){if((e=Pe(e))instanceof xd)return e._internalPath;if(typeof e=="string")return Hw(n,e);throw Vs("Field path arguments must be of type string or ",n,!1,void 0,t)}const $w=new RegExp("[~\\*/\\[\\]]");function Hw(n,e,t){if(e.search($w)>=0)throw Vs(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new xd(...e.split("."))._internalPath}catch{throw Vs(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function Vs(n,e,t,r,i){const s=r&&!r.isEmpty(),a=i!==void 0;let c=`Function ${e}() called with invalid data`;t&&(c+=" (via `toFirestore()`)"),c+=". ";let l="";return(s||a)&&(l+=" (found",s&&(l+=` in field ${r}`),a&&(l+=` in document ${i}`),l+=")"),new q(L.INVALID_ARGUMENT,c+n+l)}function jw(n,e){return n.some(t=>t.isEqual(e))}/**
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
 */class Kw{convertValue(e,t="none"){switch(Kt(e)){case 0:return null;case 1:return e.booleanValue;case 2:return le(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(jt(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw G(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return mn(e,(i,s)=>{r[i]=this.convertValue(s,t)}),r}convertVectorValue(e){var r,i,s;const t=(s=(i=(r=e.fields)==null?void 0:r[us].arrayValue)==null?void 0:i.values)==null?void 0:s.map(a=>le(a.doubleValue));return new Ze(t)}convertGeoPoint(e){return new at(le(e.latitude),le(e.longitude))}convertArray(e,t){return(e.values||[]).map(r=>this.convertValue(r,t))}convertServerTimestamp(e,t){switch(t){case"previous":const r=as(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(Fr(e));default:return null}}convertTimestamp(e){const t=Ht(e);return new ie(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=re.fromString(e);te(Sh(r),9688,{name:e});const i=new Ur(r.get(1),r.get(3)),s=new j(r.popFirst(5));return i.isEqual(t)||_t(`Document ${s} contains a document reference within a different database (${i.projectId}/${i.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),s}}/**
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
 */class Pd extends Kw{constructor(e){super(),this.firestore=e}convertBytes(e){return new Ke(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new pe(this.firestore,null,t)}}function Os(){return new Ua("serverTimestamp")}const Nd="@firebase/firestore",Dd="4.14.0";/**
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
 */class Ld{constructor(e,t,r,i,s){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=i,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new pe(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new zw(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var e;return((e=this._document)==null?void 0:e.data.clone().value.mapValue.fields)??void 0}get(e){if(this._document){const t=this._document.data.field(Ls("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class zw extends Ld{data(){return super.data()}}/**
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
 */function Gw(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new q(L.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class qa{}class Ww extends qa{}function $a(n,e,...t){let r=[];e instanceof qa&&r.push(e),r=r.concat(t),function(s){const a=s.filter(l=>l instanceof Ha).length,c=s.filter(l=>l instanceof Ms).length;if(a>1||a>0&&c>0)throw new q(L.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const i of r)n=i._apply(n);return n}class Ms extends Ww{constructor(e,t,r){super(),this._field=e,this._op=t,this._value=r,this.type="where"}static _create(e,t,r){return new Ms(e,t,r)}_apply(e){const t=this._parse(e);return Md(e._query,t),new ir(e.firestore,e.converter,ia(e._query,t))}_parse(e){const t=Sd(e.firestore);return function(s,a,c,l,u,f,p){let y;if(u.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new q(L.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){Od(p,f);const E=[];for(const w of p)E.push(Vd(l,s,w));y={arrayValue:{values:E}}}else y=Vd(l,s,p)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||Od(p,f),y=qw(c,a,p,f==="in"||f==="not-in");return de.create(u,f,y)}(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function Fs(n,e,t){const r=e,i=Ls("where",n);return Ms._create(i,r,t)}class Ha extends qa{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new Ha(e,t)}_parse(e){const t=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return t.length===1?t[0]:Je.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:(function(i,s){let a=i;const c=s.getFlattenedFilters();for(const l of c)Md(a,l),a=ia(a,l)}(e._query,t),new ir(e.firestore,e.converter,ia(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}function Vd(n,e,t){if(typeof(t=Pe(t))=="string"){if(t==="")throw new q(L.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Qu(e)&&t.indexOf("/")!==-1)throw new q(L.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const r=e.path.child(re.fromString(t));if(!j.isDocumentKey(r))throw new q(L.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return Vu(n,new j(r))}if(t instanceof pe)return Vu(n,t._key);throw new q(L.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${ns(t)}.`)}function Od(n,e){if(!Array.isArray(n)||n.length===0)throw new q(L.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function Md(n,e){const t=function(i,s){for(const a of i)for(const c of a.getFlattenedFilters())if(s.indexOf(c.op)>=0)return c.op;return null}(n.filters,function(i){switch(i){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(t!==null)throw t===e.op?new q(L.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new q(L.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}function Qw(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}class ni{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class En extends Ld{constructor(e,t,r,i,s,a){super(e,t,r,i,a),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Us(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(Ls("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new q(L.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=En._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}En._jsonSchemaVersion="firestore/documentSnapshot/1.0",En._jsonSchema={type:he("string",En._jsonSchemaVersion),bundleSource:he("string","DocumentSnapshot"),bundleName:he("string"),bundle:he("string")};class Us extends En{data(e={}){return super.data(e)}}class sr{constructor(e,t,r,i){this._firestore=e,this._userDataWriter=t,this._snapshot=i,this.metadata=new ni(i.hasPendingWrites,i.fromCache),this.query=r}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(r=>{e.call(t,new Us(this._firestore,this._userDataWriter,r.key,r,new ni(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new q(L.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(i,s){if(i._snapshot.oldDocs.isEmpty()){let a=0;return i._snapshot.docChanges.map(c=>{const l=new Us(i._firestore,i._userDataWriter,c.doc.key,c.doc,new ni(i._snapshot.mutatedKeys.has(c.doc.key),i._snapshot.fromCache),i.query.converter);return c.doc,{type:"added",doc:l,oldIndex:-1,newIndex:a++}})}{let a=i._snapshot.oldDocs;return i._snapshot.docChanges.filter(c=>s||c.type!==3).map(c=>{const l=new Us(i._firestore,i._userDataWriter,c.doc.key,c.doc,new ni(i._snapshot.mutatedKeys.has(c.doc.key),i._snapshot.fromCache),i.query.converter);let u=-1,f=-1;return c.type!==0&&(u=a.indexOf(c.doc.key),a=a.delete(c.doc.key)),c.type!==1&&(a=a.add(c.doc),f=a.indexOf(c.doc.key)),{type:Yw(c.type),doc:l,oldIndex:u,newIndex:f}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new q(L.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=sr._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Ko.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],r=[],i=[];return this.docs.forEach(s=>{s._document!==null&&(t.push(s._document),r.push(this._userDataWriter.convertObjectMap(s._document.data.value.mapValue.fields,"previous")),i.push(s.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function Yw(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return G(61501,{type:n})}}/**
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
 */sr._jsonSchemaVersion="firestore/querySnapshot/1.0",sr._jsonSchema={type:he("string",sr._jsonSchemaVersion),bundleSource:he("string","QuerySnapshot"),bundleName:he("string"),bundle:he("string")};/**
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
 */function Bs(n){n=gn(n,pe);const e=gn(n.firestore,Ds),t=Oa(e);return kw(t,n._key).then(r=>Jw(e,n,r))}function ja(n){n=gn(n,ir);const e=gn(n.firestore,Ds),t=Oa(e),r=new Pd(e);return Gw(n._query),Rw(t,n._query).then(i=>new sr(e,r,n,i))}function qs(n,e,t){n=gn(n,pe);const r=gn(n.firestore,Ds),i=Qw(n.converter,e,t),s=Sd(r);return Xw(r,[Bw(s,"setDoc",n._key,i,n.converter!==null,t).toMutation(n._key,Et.none())])}function Xw(n,e){const t=Oa(n);return Pw(t,e)}function Jw(n,e,t){const r=t.docs.get(e._key),i=new Pd(n);return new En(n,i,e._key,r,new ni(t.hasPendingWrites,t.fromCache),e.converter)}(function(e,t=!0){Pv(Mn),On(new cn("firestore",(r,{instanceIdentifier:i,options:s})=>{const a=r.getProvider("app").getImmediate(),c=new Ds(new Lv(r.getProvider("auth-internal")),new Mv(a,r.getProvider("app-check-internal")),e_(a,i),a);return s={useFetchStreams:t,...s},c._setSettings(s),c},"PUBLIC").setMultipleInstances(!0)),Dt(Nd,Dd,e),Dt(Nd,Dd,"esm2020")})();const Fd=Jc({apiKey:"AIzaSyCe6R5U0MsHw9aBNl25AZP3ZemFXDKEK9w",authDomain:"vnpt-cloud-sync.firebaseapp.com",projectId:"vnpt-cloud-sync",storageBucket:"vnpt-cloud-sync.firebasestorage.app",messagingSenderId:"1034099532877",appId:"1:1034099532877:web:3bcbe2ab0ea8fae524e804",measurementId:"G-650CYB84PL"}),ze=kv(Fd),ct=Vw(Fd),$s="VNPT_PRO_SECRET_2026";function Zw(n){if(!n)return"";try{return btoa((t=>t.split("").map((r,i)=>String.fromCharCode(r.charCodeAt(0)^$s.charCodeAt(i%$s.length))).join(""))(n))}catch(e){return console.error("Encryption error:",e),n}}function eE(n){if(!n)return"";try{return(t=>t.split("").map((r,i)=>String.fromCharCode(r.charCodeAt(0)^$s.charCodeAt(i%$s.length))).join(""))(atob(n))}catch(e){return console.error("Decryption error:",e),n}}const Ge={async signUp(n,e){return await fy(ze,n,e)},async signIn(n,e){return await py(ze,n,e)},async logout(){await vy(ze)},onAuthChange(n){return yy(ze,n)},async pushProfile(n){const e=ze.currentUser;if(!e)throw new Error("Chưa đăng nhập Firebase");const t=Yt(ct,`users/${e.uid}/profiles`,n.id);await qs(t,{...n,updatedAt:Os()},{merge:!0})},async pullProfiles(){const n=ze.currentUser;if(!n)return[];const e=wd(ct,`users/${n.uid}/profiles`),t=$a(e);return(await ja(t)).docs.map(i=>i.data())},async backupKeys(n){const e=ze.currentUser;if(!e)return;const t={};for(const[i,s]of Object.entries(n))t[i]=Zw(s);const r=Yt(ct,`users/${e.uid}/secrets`,"api_keys");await qs(r,{...t,updatedAt:Os()},{merge:!0})},async restoreKeys(){const n=ze.currentUser;if(!n)return null;const e=Yt(ct,`users/${n.uid}/secrets`,"api_keys"),t=await Bs(e);if(!t.exists())return null;const r=t.data(),i={};for(const[s,a]of Object.entries(r))s!=="updatedAt"&&(i[s]=eE(a));return i},async updateUserSettings(n){const e=ze.currentUser;if(!e)return;const t=Yt(ct,`users/${e.uid}/settings`,"general");await qs(t,{...n,updatedAt:Os()},{merge:!0})},async getUserSettings(){const n=ze.currentUser;if(!n)return null;const e=Yt(ct,`users/${n.uid}/settings`,"general"),t=await Bs(e);return t.exists()?t.data():null},async pushGlobalConfig(n){const e=ze.currentUser;if(!e)return;const t=Yt(ct,`users/${e.uid}/settings`,"config");await qs(t,{...n,updatedAt:Os()},{merge:!0})},async pullGlobalConfig(){const n=ze.currentUser;if(!n)return null;const e=Yt(ct,`users/${n.uid}/settings`,"config"),t=await Bs(e);return t.exists()?t.data():null},async getSharedTemplates(){try{const n=await this.getUserSettings(),e=(n==null?void 0:n.workspace)||"global",t=wd(ct,"shared_templates"),r=$a(t,Fs("active","==",!0),Fs("workspace","==",e));let s=(await ja(r)).docs.map(a=>({id:a.id,...a.data()}));if(e!=="global"){const a=$a(t,Fs("active","==",!0),Fs("workspace","==","global")),l=(await ja(a)).docs.map(u=>({id:u.id,...u.data()}));s=[...s,...l]}return s}catch(n){return console.error("FirebaseService.getSharedTemplates error:",n),[]}},async getRemoteConfigs(){try{const n=Yt(ct,"settings","remote_configs"),e=await Bs(n);return e.exists()?e.data():null}catch(n){return console.error("FirebaseService.getRemoteConfigs error:",n),null}}};function or(){try{const n=M.get(_r)||[],e=n.filter(t=>t.type!=="local");return e.length!==n.length&&ar(e),e}catch{return[]}}function ar(n){M.set(_r,n)}function tE(n){const e=n.match(/drive\.google\.com\/file\/d\/([^/]+)/);return e?`https://drive.google.com/uc?export=download&id=${e[1]}`:n}function nE(n){return new Promise((e,t)=>{GM_xmlhttpRequest({method:"GET",url:tE(n),responseType:"arraybuffer",onload:r=>{if(r.status>=200&&r.status<300){if(r.response&&r.response.byteLength>4){const i=new Uint8Array(r.response.slice(0,4));if(i[0]===80&&i[1]===75&&i[2]===3&&i[3]===4){e(r.response);return}else{t(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}e(r.response)}else t(new Error(`HTTP ${r.status}: Không lấy được file`))},onerror:()=>t(new Error("Không thể tải URL.")),ontimeout:()=>t(new Error("Timeout khi tải URL."))})})}async function rE(n,e,t){const r=n.name.replace(/\.docx$/i,""),i=prompt("Đặt tên biến nhớ cho file này:",r);if(!(!i||!i.trim()))try{const s=await n.arrayBuffer();await Rp(i.trim(),s);const c=or().filter(l=>l.name!==i.trim()&&l.fileName!==n.name);c.unshift({name:i.trim(),type:"local_idb",fileName:n.name,lastUsed:Date.now()}),ar(c),Tn(e,t),t&&t(s,i.trim())}catch(s){F(`❌ Lỗi lưu file: ${s.message}`,"#dc3545")}}function Tn(n,e,t=null){let r=n.querySelector(".vnpt-template-manager-inner"),i,s,a,c=n.dataset.activeTab||"local";if(r)i=r.querySelector(".vnpt-local-list-container"),s=r.querySelector(".vnpt-cloud-list-container"),a=r.querySelector(".vnpt-btn-wrap"),i=r.querySelector(".vnpt-local-list-container"),s=r.querySelector(".vnpt-cloud-list-container"),a=r.querySelector(".vnpt-btn-wrap");else{n.innerHTML="",r=document.createElement("div"),r.className="vnpt-template-manager-inner";const u=document.createElement("div");u.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const f=document.createElement("span");f.className="vnpt-title-main",f.style.cssText="font-size:11px;font-weight:700;color:#444;",a=document.createElement("div"),a.className="vnpt-btn-wrap",a.style.cssText="display:flex;gap:4px;",u.appendChild(f),u.appendChild(a),r.appendChild(u),i=document.createElement("div"),i.className="vnpt-local-list-container",i.style.cssText="display:flex;flex-wrap:wrap;gap:4px;",r.appendChild(i),s=document.createElement("div"),s.className="vnpt-cloud-list-container",s.style.cssText="display:none;flex-direction:column;gap:4px;",r.appendChild(s),n.appendChild(r)}const l=r.querySelector(".vnpt-title-main");c==="local"?(i.style.display="flex",s.style.display="none",iE(i,l,e,t,n)):(i.style.display="none",s.style.display="flex",sE(s,l,e,t,n))}function iE(n,e,t,r,i){const s=or();if(e.innerHTML="Templates"+(r?` <span style="color:#2e7d32;">(Đang dùng: ${r})</span>`:""),s.length===0){n.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:12px;text-align:center;width:100%;">Chưa có mẫu nào. Hãy chọn file .docx bên dưới để lưu vào đây.</div>';return}n.innerHTML="",s.forEach((a,c)=>{const l=Ud(a,c,t,r,i);n.appendChild(l)})}function Ud(n,e,t,r,i){const s=document.createElement("div");s.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 8px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;transition:all 0.2s;",n.name===r&&(s.style.borderColor="var(--vnpt-primary)",s.style.background="var(--vnpt-primary-light)"),s.title=n.fileName||n.url||n.name,s.tabIndex=0,s.onfocus=()=>s.style.boxShadow="0 0 0 2px var(--vnpt-primary)",s.onblur=()=>s.style.boxShadow="none";const a=n.type==="local"||n.type==="local_base64"||n.type==="local_idb"?"OFF":"ON",c=a==="OFF"?"#6c757d":"#28a745",l=document.createElement("span");l.textContent=a,l.style.cssText=`font-size:8px;padding:1px 5px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${c};color:#fff;`;const u=document.createElement("span");if(u.textContent=n.name,u.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",s.onclick=()=>{s.focus(),aE(n,t,r,i)},s.appendChild(l),s.appendChild(u),n.type!=="cloud_shared"){const f=document.createElement("button");f.innerHTML="✎",f.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",f.onclick=y=>{y.stopPropagation();const A=prompt("Đổi tên template:",n.name);if(A&&A.trim()&&A.trim()!==n.name){const E=or(),w=E.findIndex(x=>x.name===n.name);w>=0&&(E[w].name=A.trim(),ar(E),Tn(i,t,r))}},s.appendChild(f);const p=document.createElement("button");p.innerHTML="✕",p.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",p.onclick=async y=>{if(y.stopPropagation(),confirm(`Xoá biểu mẫu "${n.name}"?`)){const A=or(),E=A.findIndex(w=>w.name===n.name);if(E>=0){const w=A[E];A.splice(E,1),ar(A),w.type==="local_idb"&&await Np(w.name).catch(()=>null),Tn(i,t,r===w.name?null:r)}}},s.appendChild(p)}else{const f=document.createElement("button");f.innerHTML="📥",f.title="Lưu về danh sách cá nhân",f.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:var(--vnpt-primary);cursor:pointer;margin-left:auto;",f.onclick=p=>{p.stopPropagation(),oE(n)},s.appendChild(f)}return s}async function sE(n,e,t,r,i){e.textContent="Thư viện dùng chung",n.innerHTML='<div style="text-align:center;padding:10px;font-size:10px;color:#666;">⏳ Đang tải từ Cloud...</div>';try{const s=await Ge.getSharedTemplates();if(s.length===0){n.innerHTML='<div style="text-align:center;padding:10px;font-size:10px;color:#999;font-style:italic;">Thư viện trống hoặc chưa được cấu hình.</div>';return}n.innerHTML="",s.forEach(a=>{const c={...a,type:"cloud_shared"},l=Ud(c,0,t,r,i);if(l.style.width="100%",l.style.borderRadius="8px",a.department){const u=document.createElement("span");u.textContent=a.department,u.style.cssText="font-size:9px;background:#e3f2fd;color:#1976d2;padding:1px 4px;border-radius:4px;margin-left:4px;",l.insertBefore(u,l.querySelector("button"))}n.appendChild(l)})}catch(s){n.innerHTML=`<div style="text-align:center;padding:10px;font-size:10px;color:#ea4335;">❌ Lỗi: ${s.message}</div>`}}async function oE(n){const e=or();if(e.some(r=>r.url===n.url)){F("Mẫu này đã có trong danh sách cá nhân của bạn.");return}e.unshift({name:n.name,url:n.url,type:"url",fileName:n.fileName||n.name+".docx",lastUsed:Date.now()}),ar(e),F(`✅ Đã thêm "${n.name}" vào danh sách cá nhân.`)}function aE(n,e,t,r){const i=or(),s=i.find(a=>a.name===n.name&&(a.url===n.url||a.type===n.type));if(s&&(s.lastUsed=Date.now(),ar(i)),n.type==="local_idb"){Pp(n.name).then(a=>{if(!a)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");e&&e(a,n.name),Tn(r,e,n.name)}).catch(a=>{F(`❌ Lỗi nạp File IDB: ${a.message}`,"#dc3545")});return}if(n.type==="local_base64"&&n.data){try{const a=window.atob(n.data.split(",")[1]),c=a.length,l=new Uint8Array(c);for(let u=0;u<c;u++)l[u]=a.charCodeAt(u);e&&e(l.buffer,n.name),Tn(r,e,n.name)}catch(a){F(`❌ Lỗi nạp Base64: ${a.message}`,"#dc3545")}return}nE(n.url).then(a=>{e&&e(a,n.name),Tn(r,e,n.name)}).catch(a=>{F(`❌ ${a.message}`,"#dc3545")})}function cE(n,e){if(n.length===0)return e.length;if(e.length===0)return n.length;const t=[];for(let r=0;r<=e.length;r++)t[r]=[r];for(let r=0;r<=n.length;r++)t[0][r]=r;for(let r=1;r<=e.length;r++)for(let i=1;i<=n.length;i++)e.charAt(r-1)===n.charAt(i-1)?t[r][i]=t[r-1][i-1]:t[r][i]=Math.min(t[r-1][i-1]+1,t[r][i-1]+1,t[r-1][i]+1);return t[e.length][n.length]}function lE(n,e){let t=n,r=e;n.length<e.length&&(t=e,r=n);const i=t.length;return i===0?1:(i-cE(t,r))/parseFloat(i)}function Ka(n,e,t=.7){let r=null,i=-1;const s=n.toLowerCase().trim();for(const a of e){const c=a.toLowerCase().trim(),l=lE(s,c);l>i&&l>=t&&(i=l,r=a)}return r}function uE(n){if(!n)return"";let e=n.replace(/\D/g,"");return e.startsWith("84")&&(e="0"+e.slice(2)),e}function Bd(n){if(!n)return"";let e=n.trim();if(!e)return"";if(/^\d{8}$/.test(e))return`${e.substring(0,2)}/${e.substring(2,4)}/${e.substring(4)}`;const t=e.split(/[-/.\s]/).filter(r=>!!r);if(t.length===3){let r,i,s;if(t[0].length===4)[s,i,r]=t;else if(t[2].length===4)[r,i,s]=t;else if(t[2].length===2)[r,i,s]=t,s=(parseInt(s)<50?"20":"19")+s.padStart(2,"0");else return e;return`${r.padStart(2,"0")}/${i.padStart(2,"0")}/${s}`}if(e.includes("T")&&!isNaN(Date.parse(e))){const r=new Date(e),i=String(r.getDate()).padStart(2,"0"),s=String(r.getMonth()+1).padStart(2,"0"),a=r.getFullYear();return`${i}/${s}/${a}`}return e}function za(n){if(!n)return{province:"",district:"",ward:"",street:""};const e=n.split(",").map(y=>y.trim()).filter(Boolean),t=e.length;let r="",i="",s="",a="";if(t===0)return{province:r,district:i,ward:s,street:a};r=e[t-1]||"",i=t>1?e[t-2]:"",s=t>2?e[t-3]:"";const c=/^(Xã|Phường|Thị trấn|TT|P|X)(?:\.|\s|$)/i,l=/^(Quận|Huyện|Thị xã|Thành phố|TP|Q|H)(?:\.|\s|$)/i;let u=e.slice(0,-1).find(y=>c.test(y)),f=e.slice(0,-1).find(y=>l.test(y));u&&(s=u),f&&(i=f);const p=e.indexOf(s);return p>0?a=e.slice(0,p).join(", "):t>=4&&!u?a=e.slice(0,t-3).join(", "):t>1?a=e[0]:a=n,{province:ri(r),district:ri(i),ward:ri(s),street:a}}function ri(n){return n?n.replace(/^(Tỉnh|Thành phố|Thành Phố|TP\.|TP|T\.|Quận|Huyện|Q\.|H\.|Xã|Phường|P\.|Thị xã|Thị trấn)\s+/i,"").trim():""}function cr(n,e){let t;return function(...i){const s=()=>{clearTimeout(t),n(...i)};clearTimeout(t),t=setTimeout(s,e)}}function Ga(n){return new Promise(e=>setTimeout(e,n))}let ge={byId:new Map,byName:new Map,byPlaceholder:new Map,byLabel:new Map,allInputs:[]},Hs=[];function qd(){ge.byId.clear(),ge.byName.clear(),ge.byPlaceholder.clear(),ge.byLabel.clear(),ge.allInputs=[]}function hE(){js=0}function $d(){return Hs=Array.from(document.querySelectorAll("label, .label, .label-text, span.title, .form-label")),Hs}let js=0;const dE=3e3;function lr(n=!1){const e=Date.now();if(!n&&js!==0&&e-js<dE&&ge.allInputs.length>0)return;const t=performance.now();js=e,qd();const r=Array.from(document.querySelectorAll("input, textarea, select, ng-select2"));ge.allInputs=r,r.forEach(c=>{c.id&&ge.byId.set(c.id,c),c.name&&ge.byName.set(c.name,c);const l=c.getAttribute("placeholder");l&&ge.byPlaceholder.set(l.trim(),c);const u=c.getAttribute("formcontrolname");u&&ge.byName.set(u,c)});const i=$d();i.forEach(c=>{const l=c.innerText.trim();if(!l)return;let u=null;if(c.htmlFor&&(u=document.getElementById(c.htmlFor)),!u){let f=c.parentElement,p=0;for(;f&&p<2&&(u=f.querySelector("input, textarea, select"),!u);)f=f.parentElement,p++}u&&ge.byLabel.set(l,u)});const a=performance.now()-t;a>10&&console.debug(`[DOM] Build map in ${a.toFixed(2)}ms for ${r.length} inputs and ${i.length} labels.`)}function Hd(n){if(!n)return;const e={bubbles:!0,cancelable:!0,composed:!0};if(n.dispatchEvent(new Event("focus",e)),n.dispatchEvent(new Event("input",e)),n.dispatchEvent(new Event("change",e)),n.tagName==="SELECT"){n.dispatchEvent(new CustomEvent("select2:select",{...e,detail:{data:{id:n.value}}}));let t=n.closest("ng-select2, .select2-container, .form-group");t&&(t.dispatchEvent(new Event("change",e)),t.dispatchEvent(new Event("input",e)));try{const r=window.jQuery||window.$;r&&typeof r(n).trigger=="function"&&(r(n).trigger("change"),r(n).trigger("select2:select"))}catch{}}n.dispatchEvent(new Event("blur",e))}function ur(n,e){var r;if(!n||e===void 0||e===null)return!1;let t=!1;if(n.tagName==="SELECT"||n.tagName==="NG-SELECT2"){const i=n.tagName==="NG-SELECT2"&&n.querySelector("select")||n,s=Array.from(i.options||[]),a=s.map(u=>u.text.trim());let c=e.toString().trim(),l=s.find(u=>u.value===c);if(!l&&c.includes(",")){const u=za(c),f=Qa(),p=n.closest("ng-select2")||n,y=(p.id||p.getAttribute("formcontrolname")||p.name||"").toLowerCase();f&&(p===f.tinh||n===f.tinh)?c=u.province:f&&(p===f.xaIdNew||n===f.xaIdNew)?c=u.ward||u.district:y.includes("tinh")?c=u.province:(y.includes("xa")||y.includes("huyen")||y.includes("quan"))&&(c=u.ward||u.district)}if(!l){let u=Ka(c,a,.75);if(!u){const f=ri(c),p=a.map(A=>ri(A)),y=Ka(f,p,.65);y&&(u=a[p.indexOf(y)])}u&&(l=s.find(f=>f.text.trim()===u))}if(l){const u=window.jQuery||window.$;u&&typeof u(i).val=="function"&&u(i).val(l.value).trigger("change").trigger("change.select2").trigger("select2:select"),i.value=l.value,t=!0}else if(e&&!e.toString().includes(",")){const u=window.jQuery||window.$;u&&typeof u(i).val=="function"&&u(i).val(e).trigger("change").trigger("change.select2"),i.value=e}return Hd(i),t}else{const i=Qa();i&&n===i.duong&&typeof e=="string"&&e.includes(",")&&(e=za(e).street);const s=n.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,a=(r=Object.getOwnPropertyDescriptor(s,"value"))==null?void 0:r.set;a?a.call(n,e):n.value=e,t=!0}return Hd(n),t}async function fE(n,e=3e3){const t=Date.now();let r=n.tagName==="NG-SELECT2"&&n.querySelector("select")||n;if(r.tagName!=="SELECT"&&r.tagName!=="NG-SELECT2")return console.debug(`[waitForOptions] Phần tử không phải SELECT/NG-SELECT2 (${r.tagName}), bỏ qua bước chờ options.`),!0;for(;Date.now()-t<e;){if(!document.contains(r)&&n.tagName==="NG-SELECT2"&&(r=n.querySelector("select")||n),r.options&&r.options.length>1)return console.debug(`[waitForOptions] Đã tìm thấy ${r.options.length} options sau ${Date.now()-t}ms.`),!0;await Ga(200)}return console.warn(`[waitForOptions] Timeout ${e}ms. Element "${n.id||n.name}" (${r.tagName}) chỉ có ${r.options?r.options.length:0} options.`),!1}function et(n,e=null){if(!n&&!e)return null;ge.allInputs.length===0&&lr();const t=i=>i?["INPUT","TEXTAREA","SELECT"].includes(i.tagName)||i.getAttribute("contenteditable")==="true"?i:i.querySelector('input, textarea, select, [contenteditable="true"]'):null;if(n){let i=ge.byId.get(n)||ge.byName.get(n)||ge.byPlaceholder.get(n)||ge.byLabel.get(n);if(i&&document.contains(i))return t(i)}if(e){let i=ge.byLabel.get(e);if(i&&document.contains(i))return t(i)}if(n&&(n.includes("xaId")||n.includes("quanHuyenId")||n.includes("phuongXaId")||n.includes("xaIdNew"))){const i=Qa();if(i&&i.xaIdNew)return t(i.xaIdNew)}if(n){const i=document.getElementById(n);if(i){const l=t(i);if(l)return l}const s=`input[id="${n}"], textarea[id="${n}"], select[id="${n}"], input[name="${n}"], textarea[name="${n}"], [placeholder="${n}"], [formcontrolname="${n}"]`,a=document.querySelector(s);if(a)return a;const c=document.querySelector(`[id="${n}"], [name="${n}"]`);if(c){const l=t(c);if(l)return l}}const r=e||n;if(r&&r.length>2){const i=Array.from(ge.byLabel.keys());i.length===0&&Hs.length>0&&i.push(...Hs.map(a=>a.innerText.trim()).filter(a=>a.length>0));const s=Ka(r,i,.82);if(s)return t(ge.byLabel.get(s))}return null}function jd(n){return et(null,n)}function ii(n,e,t=null){const r=et(n,t);return r?(ur(r,e),!0):!1}function pE(n,e){const t=(n||(e==null?void 0:e.id)||(e==null?void 0:e.getAttribute("formcontrolname"))||"").toLowerCase();if(t.includes("tinh")||t.includes("province")||t.includes("city"))return 1;if(t.includes("xaIdNew")||t.includes("huyen")||t.includes("quan")||t.includes("district")||t.includes("xa")||t.includes("phuong")||t.includes("ward"))return 2;const r=e!=null&&e.id?document.querySelector(`label[for="${e.id}"]`):null,i=((r==null?void 0:r.innerText)||"").toLowerCase();return i.includes("tỉnh")||i.includes("thành phố")?1:i.includes("huyện")||i.includes("quận")||i.includes("xã")||i.includes("phường")?2:9}async function gE(n,e=5e3){const t=Date.now();for(;Date.now()-t<e;){lr(!0);const r=et(n);if(r&&document.contains(r))return r;await Ga(500)}return null}async function Wa(n,e){if(!n||!n.length)return;const r=n.map(l=>l.toLowerCase()).some(l=>l.includes("diachi")||l.includes("địa chỉ")),i=typeof e=="string"&&e.includes(",");r&&i&&["tinhIdNew","diaChiTruSoTinhIdNew","xaIdNew","diaChiTruSoXaIdNew","duong","diaChiTruSoDuong"].forEach(u=>{!n.includes(u)&&et(u)&&n.push(u)});const s=n.map(l=>{const u=et(l);return{name:l,el:u,rank:pE(l,u)}}),a=[...new Set(s.map(l=>l.rank))].sort((l,u)=>l-u);let c=!0;for(const l of a){if(l<=2&&!c){console.warn(`[Sync Sequential] Bỏ qua Rank ${l} do cấp trên thất bại.`);continue}const u=s.filter(p=>p.rank===l);let f=!1;console.debug(`[Sync Sequential] Đang xử lý nhóm Rank ${l} với ${u.length} fields.`);for(const p of u){let y=et(p.name)||p.el;if(!y&&l===2&&(console.debug(`[Sync Sequential] Đợi element Xã/Huyện (${p.name})...`),y=await gE(p.name,3500)),y){if(l>1&&l<=2){const E=y.tagName==="NG-SELECT2"&&y.querySelector("select")||y;if(E.tagName==="SELECT"||E.tagName==="NG-SELECT2"){const w=y.tagName==="NG-SELECT2"&&y.querySelector(".select2-selection, .select2-choice")||y;w.dispatchEvent(new MouseEvent("mousedown",{bubbles:!0})),w.dispatchEvent(new MouseEvent("mouseup",{bubbles:!0})),await fE(E,3e3),w.dispatchEvent(new KeyboardEvent("keydown",{bubbles:!0,key:"Escape",code:"Escape"}))}}const A=ur(y,e);A&&(f=!0),console.debug(`[Sync Sequential] Điền ${p.name}: ${A?"OK":"FAIL"}`)}}if(c=f,f&&l<9){const p=l===1?600:300;console.debug(`[Sync Sequential] Hoàn tất Rank ${l}, nghỉ ${p}ms chờ AJAX...`),await Ga(p),lr(!0)}}}function Qa(){try{const e=Array.from(document.querySelectorAll("label, .label, span.title")).find(y=>{const A=y.innerText.toLowerCase();return(A.includes("địa chỉ")||A.includes("địa chỉ trụ sở"))&&!A.includes("email")});let t=null;if(e&&(t=e.closest(".row.row-form")||e.closest(".row"),console.debug(`[Positioning] Tìm thấy hàng địa chỉ qua nhãn: "${e.innerText.trim()}"`)),t||(t=Array.from(document.querySelectorAll("form .row.row-form, .row.row-form"))[2]),!t)return null;const r=t.querySelectorAll(".col-12.col-sm-6, .col-sm-6");if(r.length<2)return null;const i=r[0],s=r[1],a=(y,A)=>y.querySelector(A),c=Array.from(s.querySelectorAll("select, ng-select2, input")),l=a(s,'[formcontrolname*="xaIdNew" i], [id*="xaIdNew" i], [formcontrolname*="huyen" i], [id*="huyenId" i], [formcontrolname*="xa" i]'),u=a(s,'[formcontrolname*="duong" i], [id*="duong" i]'),f=a(s,'[formcontrolname*="soNha" i], [id*="sonha" i]');let p=null;return!u&&c.length>0&&(p=f&&c[c.length-1]===f?c[c.length-2]:c[c.length-1]),{tinh:a(i,'[formcontrolname*="tinhIdNew" i], [id*="tinhId" i]')||i.querySelector("select, ng-select2"),xaIdNew:l||c[0],duong:u||p}}catch(n){return console.error("[Positioning] Lỗi khi xác định bộ địa chỉ:",n),null}}function mE(n=new Date){return String(n.getDate()).padStart(2,"0")}function yE(n=new Date){return String(n.getMonth()+1).padStart(2,"0")}function vE(n=new Date){return String(n.getFullYear())}function Kd(){const n=new Date;return{ngay:mE(n),thang:yE(n),nam:vE(n)}}const{ngay:zd,thang:Gd,nam:Wd}=Kd(),Me={"ngayKy, ngayKy1":{label:"Ngày ký",value:zd,syncDir:"both"},"thangKy, thangKy1":{label:"Tháng ký",value:Gd,syncDir:"both"},"namKy, namKy1":{label:"Năm ký",value:Wd,syncDir:"both"},"ngayTiepNhan, ngayThangNamKy":{label:"Ngày ký (full)",value:`${zd}/${Gd}/${Wd}`,syncDir:"both"},tenDoanhNghiepB:{label:"Tên doanh nghiệp B",value:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM",syncDir:"both"},diaChiB:{label:"Địa chỉ B",value:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội",syncDir:"both"},maSoThueB:{label:"Mã số thuế B",value:"0100686223",syncDir:"both"},stkB:{label:"Số tài khoản B",value:"1600114156",syncDir:"both"},diaChiStkB:{label:"Ngân hàng/Địa chỉ STK B",value:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)",syncDir:"both"},"tenB, nguoiDaiDienB, tenDaiDienB":{label:"Người đại diện B",value:"Phạm Khánh Chung",syncDir:"both"},"chucVuB, chucVuDaiDienB":{label:"Chức vụ B",value:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",syncDir:"both"},"giayUyQuyenSoB, soGiayUyQuyenB":{label:"Giấy ủy quyền số B",value:"2628/GUQ-VNPT-HNI-VP",syncDir:"both"},"giayUyQuyenNgayB, ngayGiayUyQuyenB":{label:"Giấy ủy quyền ngày B",value:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",syncDir:"both"},GiayUyQuyenB:{label:"Nội dung Giấy ủy quyền B (full)",value:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",syncDir:"both"},tenDoanhNghiepB1:{label:"Tên doanh nghiệp B (phụ)",value:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",syncDir:"both"},donViTiepNhan:{label:"Đơn vị tiếp nhận",value:"TTKD KHDN",syncDir:"both"},"tenTiepNhan, tenNguoiNhan":{label:"Người tiếp nhận",value:"Bùi Anh",syncDir:"both"},dienThoaiB:{label:"Điện thoại B",value:"02436686868",syncDir:"both"},diaChiTaiKhoanB:{label:"Địa chỉ tài khoản B",value:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 ",syncDir:"both"},noiKy:{label:"Nơi ký",value:"Hà Nội",syncDir:"both"},emailB:{label:"Email B",value:"",syncDir:"both"},"lienheHopDongB, lienheTuVanB, lienheHoaDonB, sucoCap1B, sucoCap2B, sucoCap3B, sucoCap4B":{label:"Liên hệ B (AM)",value:"AM Bùi Anh",syncDir:"both"}},Ya={soHopDong:"soHopDong, inputContractGroupName"},Ks={after:["cuocDV","tongCong","tongCongHD","congCA","giaTriHopDong","tongGIaTriHopDong"],before:["donGiaCA","thanhTienCA","tongThanhTien","tongCuocTruocThue"],tax:["tongThueGTGT","tongThue","thueCA","thueVAT"],text:["soTienThanhToanBangChu","tongCongBangChu","tongCongHDbangChu","ghiChuGiaTriHopDong","tongGiaTriHopDongBangChu"]},Qd=.08,zs={SCAN:{key:"s",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Quét dữ liệu"},FILL:{key:"f",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Điền Web"},SCAN_PDF:{key:"p",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Scan PDF (AI)"},TOGGLE:{key:"`",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Đóng/Mở Widget"},CLEAN:{key:"d",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Dọn dẹp & Reset"}},Yd=Object.freeze(Object.defineProperty({__proto__:null,DEFAULT_CALC_MAP:Ks,DEFAULT_DATA:Me,DEFAULT_HOTKEYS:zs,DEFAULT_SYNC_DATA:Ya,DEFAULT_TAX_RATE:Qd},Symbol.toStringTag,{value:"Module"}));let In=!1;function _E(){let n=M.get(dt),e=JSON.parse(JSON.stringify(Me));return n?(["ngayKy, ngayKy1","thangKy, thangKy1","namKy, namKy1","ngayTiepNhan, ngayThangNamKy"].forEach(r=>{n[r]&&e[r]&&(n[r].value=e[r].value)}),n):e}async function Xd(){if(!In){In=!0;try{const n=_E(),e=M.get(rn)??{},t={...n,...e},r=Object.keys(t);for(const i of r){const s=t[i],a=s&&typeof s=="object"&&s.hasOwnProperty("value")?s.value:s,c=i.split(",").map(u=>u.trim()).filter(u=>u),l=s&&typeof s=="object"?s.label:null;l&&!c.includes(l)&&c.push(l),await Wa(c,a)}F("✅ Auto fill complete")}finally{setTimeout(()=>{In=!1},500)}}}function bE(){if(!In){In=!0;try{let n=M.get(At)??{};const e={...Ya,...n},t=Object.keys(e);if(t.length===0){F("⚠️ No sync mapping","#ffc107");return}t.forEach(r=>{let i=et(r)||jd(r);i&&i.value!==void 0&&i.value!==""&&e[r].split(",").map(a=>a.trim()).filter(a=>a).forEach(a=>ii(a,i.value))}),F("✅ Sync form complete","#d39e00")}finally{setTimeout(()=>{In=!1},500)}}}let Xa=!1;const Jd=new Map,wE=(n,e)=>{var l;if(Xa)return;let t=M.get(At)??{};const r={...Ya,...t};if(Object.keys(r).length===0)return;let i=n.id,s=n.name,a=null;if(i){const u=document.querySelector(`label[for="${i}"]`);u&&(a=u.textContent.trim())}if(!a){const u=n.closest("label");u&&(a=(l=Array.from(u.childNodes).find(f=>f.nodeType===3))==null?void 0:l.textContent.trim())}let c=r[i]||r[s]||r[a];if(c){Xa=!0;try{c.split(",").map(f=>f.trim()).filter(f=>f).forEach(f=>{if(f!==i&&f!==s&&f!==a){let p=Jd.get(f);(!p||!document.contains(p))&&(p=et(f)||jd(f),p&&Jd.set(f,p)),p&&document.activeElement!==p&&ur(p,e)}})}finally{Xa=!1}}},EE=cr((n,e)=>{wE(n,e)},250);function TE(){const n=e=>{if(In)return;const t=e.target.closest("input, textarea, select, ng-select2");if(!t||t.closest("#vnpt-docx-widget")||t.closest("#vnpt-inline-calc"))return;let r=t.value;if(t.tagName==="NG-SELECT2"||t.classList.contains("select2-hidden-accessible")){const i=t.parentElement?t.parentElement.querySelector(".select2-selection__rendered"):null;i&&i.getAttribute("title")?r=i.getAttribute("title"):i&&i.textContent&&(r=i.textContent.trim())}EE(t,r)};document.addEventListener("input",n),document.addEventListener("change",n)}const IE={async lookupMST(n){if(!n||n.length<10)return null;const e=`https://api.vietqr.io/v2/business/${n}`;try{const r=await(await fetch(e)).json();if(r.code==="00"&&r.data){const{name:i,address:s,representative:a,status:c}=r.data;return{name:i||"",address:s||"",representative:a||"",status:c||""}}return null}catch(t){return console.error("[MST Service] Error fetching MST:",t),null}}};function Zd(n){if(!n)return n;const e={};return Object.keys(n).forEach(t=>{const r=n[t];t.split(",").map(s=>s.trim()).filter(s=>s).forEach(s=>{e[s]=r})}),e}function ef(n=""){const e={version:"1.0",timestamp:new Date().toISOString(),backup:{fields:M.get(We),defaultFields:M.get(Ve),dataDefault:Zd(M.get(dt)),dataCustom:Zd(M.get(rn)),dataSync:M.get(At),taxRate:M.get(Nn),calcMap:M.get(St),templates:M.get(_r)}},t=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),r=URL.createObjectURL(t),i=document.createElement("a");i.href=r;let s=n;s?s.toLowerCase().endsWith(".json")||(s+=".json"):s=`vnpt_full_backup_${new Date().toLocaleDateString().replace(/\//g,"-")}.json`,i.download=s,i.click(),URL.revokeObjectURL(r),F(`✅ Đã xuất file: ${s}`)}async function tf(n){return new Promise(e=>{const t=new FileReader;t.onload=r=>{try{const i=JSON.parse(r.target.result);if(!i.backup)throw new Error("File không đúng định dạng backup.");const s=i.backup;s.fields&&M.set(We,s.fields),s.defaultFields&&M.set(Ve,s.defaultFields),s.dataDefault&&M.set(dt,s.dataDefault),s.dataCustom&&M.set(rn,s.dataCustom),s.dataSync&&M.set(At,s.dataSync),s.taxRate&&M.set(Nn,s.taxRate),s.calcMap&&M.set(St,s.calcMap),s.templates&&M.set(_r,s.templates),F("✅ Đã nhập dữ liệu thành công! Vui lòng tải lại trang hoặc widget.","#1e8e3e"),e(!0)}catch{F("❌ Lỗi: File sao lưu không hợp lệ.","#ff5252"),e(!1)}},t.readAsText(n)})}function si(n=""){let e=M.get(Pn);Array.isArray(e)||(e=[]);const t={id:Date.now().toString(),name:n||`Bản sao lưu ${new Date().toLocaleString()}`,timestamp:new Date().toISOString(),data:{fields:M.get(We),defaultFields:M.get(Ve)}};e.unshift(t);const r=e.slice(0,10);M.set(Pn,r),console.log(`✅ Field backup created: ${t.name}`)}function nf(){var r,i;const n=M.get(We)||{},e=((r=n.tenDaiDienn)==null?void 0:r.value)||"",t=((i=n.soHopDong)==null?void 0:i.value)||"";return!e&&!t?`Quét dữ liệu - ${new Date().toLocaleTimeString()}`:`${e} - ${t}`}function Gs(){const n=M.get(Pn);return n&&!Array.isArray(n)?(M.remove(Pn),[]):Array.isArray(n)?n:[]}function rf(n){const t=Gs().find(i=>i.id===n);if(!t||!t.data)return F("⚠️ Không tìm thấy bản sao lưu hợp lệ!","#ffc107"),!1;const r=t.data;return r.fields&&M.set(We,r.fields),r.defaultFields&&M.set(Ve,r.defaultFields),F(`✅ Đã khôi phục các trường: ${t.name}`,"#1e8e3e"),!0}function xE(n){let e=Gs();const t=e.length;return e=e.filter(r=>r.id!==n),e.length!==t?(M.set(Pn,e),!0):!1}let Ws=null;function sf(n,e){Ws&&Ws();const t=D.widget,r=n.querySelector(".btn-field-link"),i=[];let s=null;const a=N=>N?document.getElementById(N)||document.querySelector(`[formcontrolname="${CSS.escape(N)}"]`)||document.querySelector(`[name="${CSS.escape(N)}"]`)||document.querySelector(`[placeholder="${CSS.escape(N)}"]`):null,c=()=>{e.value.split(",").map(O=>O.trim()).filter(O=>O).forEach(O=>{const B=a(O);B&&!t.contains(B)&&!i.includes(B)&&(B.classList.add("vnpt-link-existing"),i.push(B))})},l=()=>{i.forEach(N=>{N.classList.remove("vnpt-link-existing"),N.classList.remove("vnpt-unlink-hover")}),i.length=0},u=()=>{const N=e.value.split(",").map(O=>O.trim()).filter(O=>O);return Math.max(0,N.length-1)},f=document.createElement("div");f.className="vnpt-linking-banner",f.style.pointerEvents="auto";const p=()=>{const N=u(),O=N>0?`<span class="vnpt-link-count-badge">${N} link</span>`:"";f.innerHTML=`
            🔗 <b>Liên kết đa điểm</b> ${O}
            &nbsp;·&nbsp; <span style="font-size:10px;opacity:0.85;">🔵 Click = link &nbsp; 🔴 Click lại = bỏ link</span>
            &nbsp;·&nbsp; <button class="vnpt-link-done-btn">✅ Xong</button>
            &nbsp; <kbd>Esc</kbd>
        `,f.querySelector(".vnpt-link-done-btn").onclick=B=>{B.stopPropagation(),R(!0)}};r.classList.add("active"),document.body.classList.add("vnpt-linking-mode"),t.style.opacity="0.15",t.style.pointerEvents="none",t.style.transition="opacity 0.3s",p(),document.body.appendChild(f),c();const y=N=>{const O=N.id||N.getAttribute("formcontrolname")||N.name||N.getAttribute("placeholder");if(O)return O;if((N.tagName==="LABEL"||N.classList.contains("label")||N.classList.contains("form-label"))&&N.innerText.trim())return N.innerText.trim();let K=N.parentElement,_=0;for(;K&&_<3;){const v=K.querySelector("label, .label, .label-text, span.title, .form-label");if(v&&v.innerText.trim())return v.innerText.trim();if(K.id&&!K.id.startsWith("ng-"))return K.id;K=K.parentElement,_++}const m=N.className&&typeof N.className=="string"?N.className.trim().split(/\s+/)[0]:"";return N.tagName.toLowerCase()+(m?"."+m:"")},A=new Set(["INPUT","TEXTAREA","SELECT","SPAN","DIV","P","LABEL","BUTTON","TD","TH","SECTION"]),E=N=>{const O=N.target;t.contains(O)||f.contains(O)||A.has(O.tagName)&&(s&&s!==O&&(s.classList.remove("vnpt-link-highlight"),s.classList.remove("vnpt-unlink-hover")),O.classList.contains("vnpt-link-existing")?O.classList.add("vnpt-unlink-hover"):O.classList.add("vnpt-link-highlight"),s=O)},w=N=>{const O=N.target;if(t.contains(O)||f.contains(O))return;N.preventDefault(),N.stopPropagation();const B=y(O),K=e.value.split(",").map(_=>_.trim()).filter(_=>_);if(K.includes(B)){const _=K.filter(v=>v!==B);e.value=_.join(", "),O.classList.remove("vnpt-link-existing"),O.classList.remove("vnpt-unlink-hover"),O.classList.add("vnpt-link-highlight");const m=i.indexOf(O);m!==-1&&i.splice(m,1),e.dispatchEvent(new Event("input",{bubbles:!0})),p(),F(`🔓 Đã bỏ "${B}"`,"#ea4335")}else e.value=[...K,B].join(", "),O.classList.remove("vnpt-link-highlight"),O.classList.add("vnpt-link-existing"),i.includes(O)||i.push(O),s===O&&(s=null),e.dispatchEvent(new Event("input",{bubbles:!0})),p(),F(`+🔗 "${B}" — Click lại để bỏ | ✅ Xong`,"#198754")},x=N=>{N.key==="Escape"&&(F("❌ Đã kết thúc liên kết","#ffc107"),R(!0))},R=(N=!0)=>{s&&(s.classList.remove("vnpt-link-highlight"),s.classList.remove("vnpt-unlink-hover")),l(),r.classList.remove("active"),document.body.classList.remove("vnpt-linking-mode"),t.style.opacity="",t.style.pointerEvents="",f.parentNode&&f.parentNode.removeChild(f),N&&e.dispatchEvent(new Event("change",{bubbles:!0})),document.removeEventListener("mouseover",E,!0),document.removeEventListener("click",w,!0),document.removeEventListener("keydown",x,!0),Ws=null};document.addEventListener("mouseover",E,!0),document.addEventListener("click",w,!0),document.addEventListener("keydown",x,!0),Ws=R;const P=u();F(P>0?`🔗 Đang có ${P} link — Click thêm hoặc ✅ Xong`:"🔗 Click vào elements để liên kết. ✅ Xong hoặc Esc khi hoàn tất.","#f57f17")}function AE(n,e,t){let r=!0,i=null;return n==="soDkdn"?i=wr.MST:n==="sdt"?i=wr.PHONE:n==="emailDaiDien"?i=wr.EMAIL:(n==="cmnd"||n==="cccd")&&(i=wr.ID_CARD),i&&e.trim()!==""&&(r=i.test(e.trim())),r?t.classList.remove("field-error"):(t.classList.add("field-error"),t.classList.add("vnpt-shake"),setTimeout(()=>t.classList.remove("vnpt-shake"),400)),r}function of(n){const e=n.querySelector(".f-key"),t=n.querySelector(".f-val");if(!e||!t)return;const r=e.value.split(",")[0].trim(),i=t.value.trim();yr.includes(r)?i?t.classList.remove("field-required-empty"):t.classList.add("field-required-empty"):t.classList.remove("field-required-empty"),AE(r,t.value,t)}function oi(n,e){const t={both:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 8 4 4-4 4"></path><path d="M2 12h20"></path><path d="m6 16-4-4 4-4"></path></svg>',down:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg>',up:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"></path><path d="M12 19V5"></path></svg>'};n.innerHTML=t[e]||t.both,n.setAttribute("data-dir",e),e==="both"?n.title="Đồng bộ 2 chiều (Mọi thay đổi đều được cập nhật giữa Bảng và Trang web)":e==="down"?n.title="Chỉ đồng bộ XUỐNG: Bảng dữ liệu ➔ Form Trang web":e==="up"&&(n.title="Chỉ đồng bộ LÊN: Form Trang web ➔ Bảng dữ liệu")}function ue(n,e,t=null,r="",i=null,s=!1){const a=D.fieldsContainer.querySelector(".text-hint");a&&a.remove();const c=D.fieldsContainer.querySelectorAll(".f-key");let l=!1;const u=n.split(",")[0].trim();for(let f of c)if(f.value.split(",")[0].trim()===u){const y=f.closest(".vnpt-field-row"),A=y.querySelector(".f-val"),E=y.querySelector(".f-label"),w=y.querySelector(".btn-sync-dir"),x=w?w.getAttribute("data-dir"):"both";e!==null&&A.value!==e&&document.activeElement!==A&&(s&&x==="down"||(A.value=e)),t!==null&&t!==""&&E.value!==t&&document.activeElement!==E&&(E.value=t),r!==""&&f.value!==n+", "+r&&document.activeElement!==f&&(f.value=n+", "+r),i&&w&&w.getAttribute("data-dir")!==i&&oi(w,i),of(y),l=!0;break}if(!l){(t===null||t==="")&&(t=ve[n]||"");const f=document.createElement("div");f.className="vnpt-field-row row-item",f.setAttribute("draggable","false");let p=n;r&&(p+=", "+r);const y=u;f.innerHTML=`
            <input type="checkbox" id="chk-${y}" name="chk-${y}" class="row-chk" title="Chọn" style="margin: 0 2px 0 2px;" />
            <input type="text" id="lbl-${y}" name="lbl-${y}" class="f-label" value="${t}" />
            <input type="text" id="key-${y}" name="key-${y}" class="f-key" value="${p}" title="Biến DOCX và IDs đồng bộ" />
            <button tabindex="-1" class="btn-sync-dir" title="Đồng bộ 2 chiều (bảng ↔ form)" data-dir="${i||"both"}">↔</button>
            <button class="btn-field-link" title="🔗 Click để liên kết với element trên trang (Esc để hủy)">🔗</button>
            ${y==="soDkdn"?`
                <div class="mst-lookup-wrapper">
                    <input type="text" id="val-${y}" name="val-${y}" class="f-val" value="${e}" placeholder="Mã số thuế..." />
                    <button class="btn-mst-lookup" title="Tra cứu Mã số thuế">
                        <span class="icon">🔍</span>
                        <div class="spinner"></div>
                    </button>
                </div>
            `:`
                <input type="text" id="val-${y}" name="val-${y}" class="f-val" value="${e}" />
            `}
        `;const A=f.querySelector(".f-val"),E=f.querySelector(".f-key");n==="tenToChuc"&&(A.style.textAlign="right");const w=async()=>{const O=f.querySelector(".btn-sync-dir");if((O?O.getAttribute("data-dir"):"both")==="up")return;const K=A.value,_=E.value.split(",").map(m=>m.trim()).filter(m=>m);await Wa(_,K)},x=cr(w,250);if(E.addEventListener("input",function(){Ce();const O=this.value.split(",")[0].trim();A.style.textAlign=O==="tenToChuc"?"right":""}),E.addEventListener("change",function(){w()}),f.querySelector(".f-label").addEventListener("input",Ce),A.addEventListener("input",function(){Ce(),of(f),x()}),A.addEventListener("change",function(){if(y.toLowerCase().includes("ngay")){const O=Bd(this.value);O!==this.value&&(this.value=O,Ce())}w()}),y==="soDkdn"){const O=f.querySelector(".btn-mst-lookup");O.onclick=async()=>{const B=A.value.trim();if(!B){F("⚠️ Vui lòng nhập mã số thuế","#ffc107");return}O.classList.add("loading");try{const K=await IE.lookupMST(B);if(K){A.value=B,ue("tenToChuc",K.name),ue("diaChi",K.address);const _=za(K.address);ue("tinhIdNew",_.province),ue("xaIdNew",_.ward||_.district),ue("duong",_.street),Ce(),setTimeout(()=>af(["soDkdn","tenToChuc","diaChi","xaIdNew","xaHuyen","duong"]),300),F(`✅ Đã tìm thấy: ${K.name}`,"#1a73e8")}else F("❌ Không tìm thấy thông tin MST này","#ea4335")}catch{F("❌ Lỗi khi tra cứu MST","#ea4335")}finally{O.classList.remove("loading")}}}const R=i||"both",P=f.querySelector(".btn-sync-dir");P&&(oi(P,R),P.addEventListener("click",O=>{O.preventDefault();let B=P.getAttribute("data-dir");B==="both"?B="down":B==="down"?B="up":B="both",oi(P,B),Ce()}));const N=f.querySelector(".btn-field-link");N&&N.addEventListener("click",O=>{O.stopPropagation(),sf(f,E)}),D.fieldsContainer.appendChild(f),D.fieldsContainer.scrollTop=D.fieldsContainer.scrollHeight}}function Ce(){const n=D.isDefaultMode?Ve:We,e={};D.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(r=>{const s=r.querySelector(".f-key").value.trim().split(",").map(y=>y.trim()).filter(y=>y),a=s[0],c=s.slice(1).join(", "),l=r.querySelector(".f-label").value.trim(),u=r.querySelector(".f-val").value,f=r.querySelector(".btn-sync-dir"),p=f?f.getAttribute("data-dir"):"both";a&&(e[a]={label:l,value:u,sync:c,syncDir:p})}),M.setDebounced(n,e,1e3),D.isDefaultMode&&Promise.resolve().then(()=>Vn).then(({SK_DATA_DEF:r})=>{M.setDebounced(r,e,1e3)})}function Ja(){var s,a,c;const n=M.get(D.isDefaultMode?Ve:We)||{},e=((s=n.tenToChuc)==null?void 0:s.value)||"",t=((a=n.tenDaiDienn)==null?void 0:a.value)||"",r=((c=n.soHopDong)==null?void 0:c.value)||"";if(!e&&!t&&!r)return`Bản sao lưu ${new Date().toLocaleString()}`;let i=e||t;return r&&(i+=` - ${r}`),i}function ai(){try{D.fieldsContainer.innerHTML="";const e=M.get(We)||{};Object.keys(ve).forEach(t=>{const r=ve[t],i=e[t];i&&typeof i=="object"?ue(t,i.value,i.label||r,i.sync||"",i.syncDir||"both"):i?ue(t,i,r,"","both"):ue(t,"",r,"","both")}),Object.keys(e).forEach(t=>{if(!(t in ve)){const r=e[t];typeof r=="object"?ue(t,r.value,r.label,r.sync||"",r.syncDir||"both"):ue(t,r,"","","both")}}),Object.keys(ve).length===0&&Object.keys(e).length===0&&(D.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(e){console.error("Error loading config:",e),Object.keys(ve).forEach(t=>ue(t,"",ve[t]))}const n=M.get(Ci);n&&D.widget&&(D.widget.style.bottom="auto",n.right?(D.widget.style.right=n.right,D.widget.style.left="auto"):n.left&&(D.widget.style.left=n.left,D.widget.style.right="auto"),n.top&&(D.widget.style.top=n.top))}function SE(){document.getElementById("vnpt-btn-toggle-id").onclick=()=>D.fieldsContainer.classList.toggle("show-ids");const n=document.getElementById("vnpt-btn-clean-data");n&&(n.onclick=()=>{const i=D.isDefaultMode;confirm(i?`BẠN ĐANG Ở CHẾ ĐỘ MẶC ĐỊNH.
Khôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?`:"Dữ liệu hiện tại sẽ được Xóa. Bạn có muốn SAO LƯU nhanh trước khi làm sạch không?")&&(i?(M.remove(Ve),F("🔄 Đã reset dữ liệu hệ thống VNPT","#1a73e8")):(si(Ja()),M.remove(We),F("🧹 Đã làm sạch & lưu bản cũ vào History","#1a73e8")),M.remove(St),M.remove(Nn),i?cf(!0):ai())});const e=document.getElementById("vnpt-btn-restore-last"),t=document.getElementById("vnpt-backup-history");e&&t?(e.title="Click để xem lịch sử sao lưu (Tối đa 10 bản)",e.onclick=i=>{i.preventDefault(),i.stopPropagation(),t.classList.toggle("show")&&r(t)},e.oncontextmenu=i=>{i.preventDefault(),i.stopPropagation();const s=Gs();if(s.length>0){const a=s[0];confirm(`Khôi phục nhanh bản gần nhất?
"${a.name}"`)&&rf(a.id)&&(D.isDefaultMode?D.isDefaultMode=!1:ai(),t.classList.remove("show"))}else F("⚠️ Chưa có bản sao lưu nào","#ffc107")},document.addEventListener("click",i=>{t.classList.contains("show")&&!t.contains(i.target)&&!e.contains(i.target)&&t.classList.remove("show")})):xt.error("❌ Fix UI: Could not find Restore button (#vnpt-btn-restore-last) or History container (#vnpt-backup-history).");function r(i){const s=Gs();if(i.innerHTML='<div class="backup-history-header">📋 Local History (Max 10)</div>',s.length===0){i.innerHTML+='<div class="backup-history-empty">Chưa có lịch sử. Dữ liệu sẽ tự lưu khi bạn Quét hoặc Dọn dẹp!</div>';return}s.forEach(a=>{const c=document.createElement("div");c.className="backup-history-item";const l=new Date(a.id*1).toLocaleString([],{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"});c.innerHTML=`
                <div class="backup-info">
                    <div class="backup-history-name" title="${a.name}">${a.name}</div>
                    <div class="backup-history-time">${l}</div>
                </div>
                <div class="backup-actions">
                    <button class="btn-restore-action" title="Khôi phục">⏪</button>
                    <button class="btn-delete-action" title="Xóa bản này">🗑️</button>
                </div>
            `,c.querySelector(".btn-restore-action").onclick=u=>{u.stopPropagation(),confirm(`Khôi phục dữ liệu từ bản: 
${a.name}?`)&&rf(a.id)&&(i.classList.remove("show"),D.isDefaultMode?D.isDefaultMode=!1:ai())},c.querySelector(".btn-delete-action").onclick=u=>{u.stopPropagation(),confirm(`Xoá vĩnh viễn bản sao lưu:
${a.name}?`)&&(xE(a.id),r(i),F("🗑️ Đã xoá bản sao lưu","#ff5252"))},i.appendChild(c)})}document.getElementById("vnpt-btn-default").onclick=()=>{D.isDefaultMode=!D.isDefaultMode},D.on("isDefaultMode",i=>cf(i)),document.getElementById("vnpt-btn-batch-del").onclick=i=>{var l;const s=D.fieldsContainer.querySelectorAll(".vnpt-field-row"),a=i.shiftKey;let c=0;if(s.forEach(u=>{var f;if((f=u.querySelector(".row-chk"))!=null&&f.checked){if(a)u.remove();else{const p=u.querySelector(".f-val");p&&(p.value="")}c++}}),c===0){const f=((l=(M.get(D.isDefaultMode?Ve:We)||{}).tenToChuc)==null?void 0:l.value)||"Dữ liệu hiện tại",p=f.length>25?f.substring(0,25)+"...":f;a?confirm(`Xóa TOÀN BỘ hàng dữ liệu của:
"${f}"?

(Hệ thống sẽ tự động lưu một bản vào History).`)&&(si(Ja()),s.forEach(y=>y.remove()),F(`🗑️ Đã xóa nội dung: ${p}`,"#ff5252"),Ce()):confirm(`Dọn dẹp TOÀN BỘ giá trị bảng của:
"${f}"?

(Hệ thống sẽ tự động lưu vào History).`)&&(si(Ja()),s.forEach(y=>{const A=y.querySelector(".f-val");A&&(A.value="")}),F(`🧹 Đã dọn dẹp: ${p}`,"#1a73e8"),Ce())}else F(`${a?"🗑️":"🧹"} Đã ${a?"Xóa":"Dọn giá trị"} ${c} trường`,a?"#ff5252":"#1a73e8"),Ce()},document.getElementById("vnpt-btn-add").onclick=()=>{const i=D.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;ue("bien_moi_"+i,"","",""),Ce()},document.getElementById("vnpt-btn-fill-back").onclick=()=>{af()}}async function af(n=null){n||Xd();let e=0;const t=D.fieldsContainer.querySelectorAll(".vnpt-field-row");for(const r of t){const i=r.querySelector(".btn-sync-dir");if((i?i.getAttribute("data-dir"):"both")==="up")continue;const a=r.querySelector(".f-key").value.trim(),c=a.split(",")[0].trim();if(n&&!n.includes(c))continue;const l=r.querySelector(".f-val").value;if(l==="")continue;const u=r.querySelector(".f-label").value.trim(),f=a.split(",").map(p=>p.trim()).filter(Boolean);u&&!f.includes(u)&&f.push(u),await Wa(f,l),f.length>0&&e++}n||(e>0?F(`✅ Đã đồng bộ ${e} hàng dữ liệu`,"#198754"):F("⚠️ Không có trường nào để đồng bộ","#ffc107"))}function cf(n){const e=document.getElementById("vnpt-btn-default");if(D.fieldsContainer.innerHTML="",D.bannerArea.innerHTML="",n){e.classList.add("active"),e.innerHTML="✅ Chế độ: Dữ liệu mặc định",document.getElementById("vnpt-fields-container").classList.add("vnpt-mode-default"),F("📌 Chế độ Dữ liệu mặc định (Có thể sửa)","#ea4335");const t=document.createElement("div");t.className="vnpt-default-banner",t.innerHTML='<span style="color: red;"> LƯU Ý: ĐÂY LÀ DỮ LIỆU MẶC ĐỊNH</span>',D.bannerArea.appendChild(t);const r=M.get(Ve);r===null?Object.keys(Me).forEach(i=>{const s=Me[i],a=s&&typeof s=="object"?s.value:s,c=s&&typeof s=="object"?s.label:ve[i]||"",l=s&&typeof s=="object"&&s.sync?s.sync:"",u=s&&typeof s=="object"&&s.syncDir?s.syncDir:"down";ue(i,a,c,l,u)}):Object.keys(r).forEach(i=>{const s=r[i];ue(i,s.value,s.label,s.sync||"",s.syncDir||"both")}),CE()}else e.classList.remove("active"),e.innerHTML="🛠 Dữ liệu mặc định VNPT",document.getElementById("vnpt-fields-container").classList.remove("vnpt-mode-default"),F("📋 Đã quay lại Dữ liệu cá nhân"),ai()}function CE(){const n=document.createElement("div");n.className="vnpt-calc-mapping-default-section",n.style.cssText="border: 1px dashed var(--vnpt-primary); border-radius: 8px; padding: 8px; margin: 8px 0; background: rgba(26, 115, 232, 0.05);",n.innerHTML=`
        <div class="vnpt-calc-mapping-header" style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; user-select: none; padding: 2px 0;">
            <div class="util-submenu-title" style="margin: 0; color: #1a73e8; font-weight: 800; font-size: 10px; text-transform: uppercase;">🛠️ LIÊN KẾT Ô (MAPPING CALC)</div>
            <span class="toggle-icon" style="font-size: 10px; color: #1a73e8; transition: transform 0.2s;">▶</span>
        </div>
        <div class="vnpt-calc-mapping-body" style="display: none; margin-top: 8px; border-top: 1px dashed rgba(26, 115, 232, 0.2); padding-top: 8px;">
            <div class="vnpt-field-row" style="background: none; border: none; padding: 0; margin-bottom: 4px; gap: 8px;">
                <span style="min-width: 70px; font-size: 11px; font-weight: bold;">Trước thuế</span>
                <input data-clink="before" class="cw-map-input" style="flex: 1; height: 26px; font-size: 11px;" placeholder="Ví dụ: tong_tien_truoc_thue">
                <button class="btn-sync-dir" title="Đồng bộ 2 chiều (bảng ↔ form)" data-dir="both" style="height: 26px; width: 26px; flex-shrink: 0; padding: 0; line-height: 26px;">↔</button>
                <button class="btn-field-link" title="🔗 Link trực quan" style="height: 26px; width: 26px; flex-shrink: 0;">🔗</button>
            </div>
            <div class="vnpt-field-row" style="background: none; border: none; padding: 0; margin-bottom: 4px; gap: 8px;">
                <span style="min-width: 70px; font-size: 11px; font-weight: bold;">Tiền thuế</span>
                <input data-clink="tax" class="cw-map-input" style="flex: 1; height: 26px; font-size: 11px;" placeholder="Ví dụ: thue_gtgt">
                <button class="btn-sync-dir" title="Đồng bộ 2 chiều (bảng ↔ form)" data-dir="both" style="height: 26px; width: 26px; flex-shrink: 0; padding: 0; line-height: 26px;">↔</button>
                <button class="btn-field-link" title="🔗 Link trực quan" style="height: 26px; width: 26px; flex-shrink: 0;">🔗</button>
            </div>
            <div class="vnpt-field-row" style="background: none; border: none; padding: 0; margin-bottom: 4px; gap: 8px;">
                <span style="min-width: 70px; font-size: 11px; font-weight: bold;">Sau thuế</span>
                <input data-clink="after" class="cw-map-input" style="flex: 1; height: 26px; font-size: 11px;" placeholder="Ví dụ: tong_cong">
                <button class="btn-sync-dir" title="Đồng bộ 2 chiều (bảng ↔ form)" data-dir="both" style="height: 26px; width: 26px; flex-shrink: 0; padding: 0; line-height: 26px;">↔</button>
                <button class="btn-field-link" title="🔗 Link trực quan" style="height: 26px; width: 26px; flex-shrink: 0;">🔗</button>
            </div>
            <div class="vnpt-field-row" style="background: none; border: none; padding: 0; gap: 8px;">
                <span style="min-width: 70px; font-size: 11px; font-weight: bold;">Bằng chữ</span>
                <input data-clink="text" class="cw-map-input" style="flex: 1; height: 26px; font-size: 11px;" placeholder="Ví dụ: doc_tien">
                <button class="btn-sync-dir" title="Đồng bộ 2 chiều (bảng ↔ form)" data-dir="both" style="height: 26px; width: 26px; flex-shrink: 0; padding: 0; line-height: 26px;">↔</button>
                <button class="btn-field-link" title="🔗 Link trực quan" style="height: 26px; width: 26px; flex-shrink: 0;">🔗</button>
            </div>
        </div>
    `;const e=n.querySelector(".vnpt-calc-mapping-header"),t=n.querySelector(".vnpt-calc-mapping-body"),r=n.querySelector(".toggle-icon");e.onclick=()=>{const s=t.style.display==="none";t.style.display=s?"block":"none",r.innerText=s?"▼":"▶"};const i=M.get(St)||{...Ks};n.querySelectorAll(".vnpt-field-row").forEach(s=>{const a=s.querySelector("input[data-clink]"),c=s.querySelector(".btn-sync-dir"),l=s.querySelector(".btn-field-link"),u=a.dataset.clink,f=i[u]||[],p=Array.isArray(f),y=p?f:f.sync||[],A=p?"both":f.syncDir||"both";a.value=y.join(", "),c&&(oi(c,A),c.onclick=w=>{w.preventDefault();let x=c.getAttribute("data-dir");x==="both"?x="down":x==="down"?x="up":x="both",oi(c,x),E()});const E=()=>{const w=M.get(St)||{...Ks},x=a.value.split(",").map(P=>P.trim()).filter(Boolean),R=c?c.getAttribute("data-dir"):"both";w[u]={sync:x,syncDir:R},M.set(St,w),F("✅ Đã cập nhật Mapping Calc hệ thống")};a.onchange=E,l.onclick=w=>{w.stopPropagation(),sf(s,a)}}),D.bannerArea.appendChild(n)}let Za=!1,hr=null,ci=null;function kE(){window.addEventListener("keydown",n=>{if(Za&&ci){DE(n);return}const e=M.get(br,zs);for(const[t,r]of Object.entries(e))if(RE(n,r)){n.preventDefault(),PE(t);return}})}function RE(n,e){if(!e||!e.key)return!1;const t=n.key.toLowerCase()===e.key.toLowerCase(),r=!!n.altKey==!!e.altKey,i=!!n.ctrlKey==!!e.ctrlKey,s=!!n.shiftKey==!!e.shiftKey;return t&&r&&i&&s}function PE(n){var e,t,r,i,s,a,c;switch(n){case"SCAN":(e=document.getElementById("vnpt-btn-scan"))==null||e.click();break;case"FILL":(t=document.getElementById("vnpt-btn-fill-back"))==null||t.click();break;case"SCAN_PDF":(r=document.getElementById("vnpt-btn-scan-pdf"))==null||r.click();break;case"EXPORT_DOCX":(i=document.getElementById("vnpt-btn-export"))==null||i.click();break;case"COPY_TXT":(s=document.getElementById("vnpt-btn-export-txt"))==null||s.click();break;case"TOGGLE":(a=document.getElementById("vnpt-toggle-btn"))==null||a.click();break;case"CLEAN":(c=document.getElementById("vnpt-btn-clean-data"))==null||c.click();break}}function NE(n,e){Za=!0,hr=n,ci=e,F("Vui lòng nhấn tổ hợp phím mong muốn...","info")}function DE(n){var i;if(["Alt","Control","Shift","Meta"].includes(n.key))return;n.preventDefault(),n.stopPropagation();const e={key:n.key.toLowerCase(),altKey:n.altKey,ctrlKey:n.ctrlKey,shiftKey:n.shiftKey},t=M.get(br,zs);t[hr]={...t[hr],...e},M.set(br,t);const r=((i=t[hr])==null?void 0:i.label)||hr;F(`Đã lưu phím tắt cho ${r}: ${ec(e)}`,"success"),ci&&ci(e),Za=!1,hr=null,ci=null}function ec(n){if(!n||!n.key)return"Chưa gán";const e=[];n.ctrlKey&&e.push("Ctrl"),n.altKey&&e.push("Alt"),n.shiftKey&&e.push("Shift");let t=n.key.toUpperCase();return t===" "&&(t="Space"),e.push(t),e.join(" + ")}async function lf({apiKey:n,model:e,systemInstruction:t,userText:r,fileData:i,filesData:s}){return new Promise((a,c)=>{if(!n)return c("Vui lòng nhập API Key Gemini trong Cài đặt.");const l=`https://generativelanguage.googleapis.com/v1beta/models/${e}:generateContent?key=${n}`,u={system_instruction:{parts:[{text:t}]},contents:[{parts:[{text:r}]}],generation_config:{response_mime_type:"application/json"}};i&&i.base64&&u.contents[0].parts.push({inline_data:{mime_type:i.mimeType,data:i.base64}}),s&&Array.isArray(s)&&s.forEach(p=>{p.base64&&u.contents[0].parts.push({inline_data:{mime_type:p.mimeType,data:p.base64}})});const f=p=>{if(p)try{let y=p.replace(/```json/g,"").replace(/```/g,"").trim();a(JSON.parse(y))}catch(y){console.error("Lỗi parse JSON từ Gemini",y,p),c("AI trả về kết quả không đúng cấu hình JSON.")}else c("AI không trả về kết quả hợp lệ.")};typeof GM_xmlhttpRequest<"u"?GM_xmlhttpRequest({method:"POST",url:l,headers:{"Content-Type":"application/json"},data:JSON.stringify(u),timeout:3e4,onload:p=>{var y,A,E,w,x;if(p.status>=200&&p.status<300)try{const R=JSON.parse(p.responseText),P=(x=(w=(E=(A=(y=R==null?void 0:R.candidates)==null?void 0:y[0])==null?void 0:A.content)==null?void 0:E.parts)==null?void 0:w[0])==null?void 0:x.text;f(P)}catch{c("Lỗi Parse kết quả từ Gemini API.")}else c(`API Gemini lỗi (${p.status}): ${p.responseText}`)},ontimeout:()=>c("Quá hạn thời gian gọi API (30s)"),onerror:p=>c("Lỗi kết nối đến Google Gemini API.")}):fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(u)}).then(p=>p.json()).then(p=>{var A,E,w,x,R;if(p.error)return c(p.error.message);const y=(R=(x=(w=(E=(A=p==null?void 0:p.candidates)==null?void 0:A[0])==null?void 0:E.content)==null?void 0:w.parts)==null?void 0:x[0])==null?void 0:R.text;f(y)}).catch(p=>c(p.message))})}async function LE(n,e){if(!n)throw new Error("Vui lòng nhập API Key.");const t={contents:[{parts:[{text:"Ping"}]}],generation_config:{max_output_tokens:5,response_mime_type:"text/plain"}},r=`https://generativelanguage.googleapis.com/v1beta/models/${e}:generateContent?key=${n}`;return new Promise((i,s)=>{const a=c=>{var l;try{return((l=JSON.parse(c).error)==null?void 0:l.message)||c}catch{return c}};typeof GM_xmlhttpRequest<"u"?GM_xmlhttpRequest({method:"POST",url:r,headers:{"Content-Type":"application/json"},data:JSON.stringify(t),timeout:1e4,onload:c=>{if(c.status>=200&&c.status<300)i(!0);else{const l=a(c.responseText);s(`API Error ${c.status}: ${l}`)}},onerror:c=>s("Lỗi kết nối mạng hoặc CORS."),ontimeout:()=>s("Hết thời gian chờ (10s).")}):fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}).then(async c=>{if(c.ok)return i(!0);const l=await c.text();s(`API Error ${c.status}: ${a(l)}`)}).catch(c=>s(c.message))})}function VE(n){const e=document.createElement("div");e.className="vnpt-cloud-sync-section";const t=r=>{r?(e.innerHTML=`
        <div class="util-submenu-title">☁️ Tài khoản Cloud</div>
        <div class="cloud-user-info" style="padding: 4px 12px; font-size: 11px; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 700; color: var(--vnpt-success);">● ${r.email}</span>
          <button class="util-item-small danger" id="vnpt-btn-cloud-logout" style="width: auto; padding: 2px 8px;">Đăng xuất</button>
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
      `,document.getElementById("vnpt-btn-cloud-logout").onclick=async()=>{await Ge.logout(),F("👋 Đã đăng xuất!")},document.getElementById("vnpt-btn-cloud-push").onclick=async()=>{try{F("⏳ Đang đẩy dữ liệu...");const{getProfiles:i}=await Promise.resolve().then(()=>If),s=i();for(const x of s)await Ge.pushProfile(x);const{SK_CALC_MAP:a,SK_HOTKEYS:c,LOCAL_KEY_FIELDS:l,SK_TEMPLATES:u,SK_TAX:f,SK_DATA_DEF:p,LOCAL_KEY_DEFAULT_FIELDS:y}=await Promise.resolve().then(()=>Vn),{Storage:A}=await Promise.resolve().then(()=>Oi),{DEFAULT_CALC_MAP:E}=await Promise.resolve().then(()=>Yd),w={calcMap:A.get(a)??E,hotkeys:A.get(c),fields:A.get(l),taxRate:A.get(f),templates:A.get(u),defaultFields:A.get(y),dataDefault:A.get(p)};await Ge.pushGlobalConfig(w),F("✅ Đã đồng bộ lên Cloud!")}catch(i){F("❌ Lỗi: "+i.message,"#ea4335")}},document.getElementById("vnpt-btn-cloud-pull").onclick=async()=>{try{F("⏳ Đang kéo dữ liệu...");const i=await Ge.pullProfiles(),s=await Ge.pullGlobalConfig();if(i.length===0&&!s){F("ℹ️ Không tìm thấy dữ liệu trên Cloud");return}if(confirm(`Tìm thấy ${i.length} bản ghi dữ liệu. Bạn có muốn ghi đè bộ cài đặt Local không?`)){const{importProfiles:a}=await Promise.resolve().then(()=>If);if(a(i),s){const{SK_CALC_MAP:c,SK_HOTKEYS:l,LOCAL_KEY_FIELDS:u,SK_TEMPLATES:f,SK_TAX:p,SK_DATA_DEF:y,LOCAL_KEY_DEFAULT_FIELDS:A}=await Promise.resolve().then(()=>Vn),{Storage:E}=await Promise.resolve().then(()=>Oi),{DEFAULT_CALC_MAP:w}=await Promise.resolve().then(()=>Yd);E.set(c,s.calcMap??w),s.hotkeys&&E.set(l,s.hotkeys),s.fields&&E.set(u,s.fields),s.taxRate!==void 0&&E.set(p,s.taxRate),s.templates&&E.set(f,s.templates),s.defaultFields&&E.set(A,s.defaultFields),s.dataDefault&&E.set(y,s.dataDefault)}F("✅ Đã khôi phục toàn bộ cấu hình!"),setTimeout(()=>location.reload(),1e3)}}catch(i){F("❌ Lỗi: "+i.message,"#ea4335")}},document.getElementById("vnpt-btn-cloud-keys-push").onclick=async()=>{try{const{SK_GEMINI_KEY:i}=await Promise.resolve().then(()=>Vn),{Storage:s}=await Promise.resolve().then(()=>Oi),a=s.get(i);if(!a){F("ℹ️ Không tìm thấy Gemini Key để sao lưu");return}F("⏳ Đang sao lưu Keys..."),await Ge.backupKeys({gemini_key:a}),F("✅ Đã sao lưu API Keys lên Cloud!")}catch(i){F("❌ Lỗ: "+i.message,"#ea4335")}},document.getElementById("vnpt-btn-cloud-keys-pull").onclick=async()=>{try{F("⏳ Đang khôi phục Keys...");const i=await Ge.restoreKeys();if(!i||!i.gemini_key){F("ℹ️ Không tìm thấy Keys trên Cloud");return}const{SK_GEMINI_KEY:s}=await Promise.resolve().then(()=>Vn),{Storage:a}=await Promise.resolve().then(()=>Oi);a.set(s,i.gemini_key),F("✅ Đã khôi phục API Keys từ Cloud!"),setTimeout(()=>location.reload(),1e3)}catch(i){F("❌ Lỗi: "+i.message,"#ea4335")}}):(e.innerHTML=`
        <div class="util-submenu-title">☁️ Tài khoản Cloud</div>
        <div style="padding: 8px; text-align: center;">
          <p style="font-size: 10px; color: #666; margin-bottom: 8px;">Đăng nhập để đồng bộ Profile & API Key giữa các máy tính.</p>
          <button class="vnpt-btn-confirm" id="vnpt-btn-cloud-login-trigger" style="width: 100%; font-size: 12px;">Đăng nhập / Đăng ký</button>
        </div>
      `,document.getElementById("vnpt-btn-cloud-login-trigger").onclick=()=>{OE()})};Ge.onAuthChange(t),n.appendChild(e)}function OE(){const n=document.createElement("div");n.className="vnpt-pdf-overlay",n.innerHTML=`
    <div class="vnpt-pdf-dialog-box" style="width: 320px;">
      <div class="pdf-dlg-header">
        <h3 style="text-align: center;">🔥 Firebase Sync</h3>
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
        <input type="email" id="cloud-email" placeholder="Email" class="cw-map-input" style="height: 36px; font-size: 13px;" autocomplete="new-password">
        <input type="text" id="cloud-password" placeholder="Mật khẩu" class="cw-map-input sensitive-mask" style="height: 36px; font-size: 13px;" autocomplete="new-password">
      </div>
      <div class="vnpt-pdf-actions" style="flex-direction: column; gap: 8px;">
        <button id="btn-do-login" class="vnpt-btn-confirm" style="width: 100%;">Đăng nhập</button>
        <button id="btn-do-signup" class="util-item-small" style="width: 100%; border: none; font-size: 11px;">Chưa có tài khoản? Đăng ký ngay</button>
        <button id="btn-close-cloud" class="pdf-btn-cancel" style="width: 100%;">Đóng</button>
      </div>
    </div>
  `,document.body.appendChild(n);const e=n.querySelector("#cloud-email"),t=n.querySelector("#cloud-password");n.querySelector("#btn-do-login").onclick=async()=>{try{await Ge.signIn(e.value,t.value),F("✅ Đăng nhập thành công!"),n.remove()}catch(r){console.error("[CloudSync] Login Error:",r);const i=r.code==="auth/operation-not-allowed"?"Lỗi: Bạn chưa bật Email/Password trong Firebase Console!":r.message;F("❌ "+i,"#ea4335")}},n.querySelector("#btn-do-signup").onclick=async()=>{try{if(!e.value||!t.value){F("⚠️ Vui lòng nhập đầy đủ Email và Mật khẩu","#ffc107");return}confirm("Đăng ký tài khoản mới với Email này?")&&(await Ge.signUp(e.value,t.value),F("✅ Đăng ký thành công!"),n.remove())}catch(r){console.error("[CloudSync] Signup Error:",r);const i=r.code==="auth/operation-not-allowed"?"Lỗi: Bạn chưa bật Email/Password trong Firebase Console!":r.message;F("❌ "+i,"#ea4335")}},n.querySelector("#btn-close-cloud").onclick=()=>n.remove()}const uf="vnpt_remote_labels",hf="vnpt_remote_last_fetch",df="vnpt_remote_info",ME=36e5,FE="https://raw.githubusercontent.com/tranchien2000/vnpt-tampermonkey-vite/main/version.json",Fe={activeLabels:{...ve},info:{latestVersion:Ct,updateUrl:"",message:""},async init(){const n=M.get(uf);n&&(this.activeLabels={...ve,...n});const e=M.get(df);e&&(this.info={...this.info,...e});const t=M.get(hf)||0;Date.now()-t>ME&&await this.refresh()},async refresh(){try{const n=await Ge.getRemoteConfigs();n&&n.selectors&&(this.activeLabels={...ve,...n.selectors},M.set(uf,n.selectors));const e=await fetch(`${FE}?t=${Date.now()}`);if(e.ok){const t=await e.json();t&&(this.info={latestVersion:t.version||Ct,updateUrl:t.updateUrl||"",message:t.message||""},M.set(df,this.info),console.log("[RemoteConfig] Update info fetched from GitHub:",this.info.latestVersion))}M.set(hf,Date.now())}catch(n){console.error("[RemoteConfig] Failed to fetch remote config:",n)}},getLabels(){return this.activeLabels},hasUpdate(){try{const n=Ct.split(".").map(Number),e=this.info.latestVersion.split(".").map(Number);for(let t=0;t<Math.max(n.length,e.length);t++){const r=n[t]||0,i=e[t]||0;if(i>r)return!0;if(i<r)return!1}}catch{}return!1}};function UE(){const n=document.getElementById("vnpt-docx-widget")||document.createElement("div");n.id="vnpt-docx-widget";const e=M.get(Ri)===!0;n.innerHTML=`
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
                    <span class="vnpt-version">v${Ct}</span>
                    <span id="vnpt-update-badge-container"></span>
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
                    <button class="vnpt-btn-icon btn-clean" id="vnpt-btn-batch-del" title="Dọn dẹp & Lưu vào History (Shift+Click để Xóa hàng)">🗑</button>
                    <div class="vnpt-restore-dropdown" style="position: relative; display: flex;">
                        <button class="vnpt-btn-icon btn-restore" id="vnpt-btn-restore-last" title="Khôi phục bản gần nhất">⏪</button>
                        <div id="vnpt-backup-history" class="vnpt-backup-history"></div>
                    </div>
                    
                    <div class="vnpt-util-dropdown">
                        <button class="vnpt-btn-icon btn-more" id="vnpt-btn-more" title="Thêm công cụ">⚙️</button>
                        <div class="vnpt-util-menu" id="vnpt-util-menu">
                            <div class="util-config-grid">
                                <div class="util-column">
                                    <div class="util-submenu-title">Hệ thống & Sao lưu</div>
                                    <div class="util-action-grid">
                                        <button class="util-item-compact" id="vnpt-btn-default" title="Dữ liệu mặc định VNPT">🏢 VNPT</button>
                                        <button class="util-item-compact danger" id="vnpt-btn-clean-data" title="Xóa dữ liệu hoặc Reset cài đặt hệ thống">🧹 Reset</button>
                                        <button class="util-item-compact" id="vnpt-btn-import-json" title="Nhập dữ liệu từ file JSON">📥 Nhập</button>
                                        <button class="util-item-compact" id="vnpt-btn-export-json" title="Xuất toàn bộ dữ liệu ra file JSON">📤 Xuất</button>
                                        <input type="file" id="vnpt-file-import-json" name="vnpt-file-import-json" accept=".json" style="display: none;">
                                    </div>

                                    <div class="util-separator"></div>
                                    <div class="util-row-compact">
                                        <span class="util-label-mini">Cỡ:</span>
                                        <div class="size-options-compact">
                                            <button data-size="S">S</button>
                                            <button data-size="M">M</button>
                                            <button data-size="L">L</button>
                                            <button data-size="Full">Full</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="util-column vertical-separator">
                                    <div class="util-submenu-title">Phím tắt</div>
                                    <div id="vnpt-hotkey-list" class="vnpt-hotkey-list">
                                        <!-- Replaced by renderHotkeys -->
                                    </div>
                                </div>
                            </div>
                                                        
                            <div class="util-separator"></div>
                            <div id="vnpt-cloud-sync-container"></div>

                            <div class="util-separator"></div>
                            <div class="util-submenu-title">AI OCR (Gemini)</div>
                            <div class="cw-row-map-compact">
                                <span title="API Key">🔑</span>
                                <input id="vnpt-gemini-key" type="text" placeholder="API Key..." class="cw-map-input sensitive-mask" autocomplete="new-password">
                                <button class="util-btn-test-mini" id="vnpt-btn-test-gemini" title="Kiểm tra kết nối">⚡</button>
                            </div>
                            <div class="cw-row-map-compact">
                                <span title="Mô hình">🤖</span>
                                <select id="vnpt-gemini-model" class="cw-map-input">
                                    <option value="gemini-2.5-flash" selected>2.5 Flash</option>
                                    <option value="gemini-2.5-flash-lite">2.5 Lite</option>
                                    <option value="gemini-3.1-flash-lite-preview">3.1 Lite</option>
                                </select>
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
                        <span class="ai-title">Xử lý tệp & Nhập văn bản:</span>
                    </div>
                    
                    <div class="ai-scan-row">
                        <div class="ai-queue-container" id="vnpt-ai-queue-container" title="Bấm để chọn file hoặc dán (Ctrl+V) file/ảnh vào đây">
                            <div class="ai-queue-placeholder" id="vnpt-ai-queue-placeholder">
                                <span>📁</span>
                                <span>Kéo thả / Ctrl+V</span>
                            </div>
                            <div class="ai-queue-list" id="vnpt-ai-queue-list"></div>
                        </div>

                        <textarea id="vnpt-raw-scan-input" placeholder="Nhập rác để quét tự động, HOẶC dùng @key để Copy thành Text Template..."></textarea>
                    </div>
                    
                    <div class="raw-scan-actions">
                        <button class="vnpt-btn-icon" id="vnpt-btn-show-pdf" title="Xem lại Kết quả cũ">📝</button>
                        <button class="vnpt-btn-icon" id="vnpt-btn-clear-queue" title="Xóa hàng đợi & nội dung">🗑️</button>
                        <button class="vnpt-btn-icon" id="vnpt-btn-scan-mail" title="Trích xuất nội dụng Mail (Gmail/Outlook)">📧</button>
                        <button class="vnpt-btn-icon" id="vnpt-btn-export-txt" title="Copy chuỗi thành Text Template">📋</button>
                        <button id="vnpt-btn-raw-process-local" class="vnpt-btn-confirm btn-local-process" title="Phân loại nhanh văn bản bằng offline Regex">QR Text</button>
                        <button id="vnpt-btn-ai-process" class="vnpt-btn-confirm btn-ai-process">QUÉT AI</button>
                    </div>
                </div>

                <div id="vnpt-banner-area"></div>
                <div id="vnpt-fields-container">
                    <div id="vnpt-fields-list">
                        <div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>
                    </div>
                </div>



                <!-- Template Manager -->
                <div id="vnpt-template-section">
                    <div id="vnpt-template-manager"></div>
                </div>



                <div class="bottom-export-row">
                    <div class="vnpt-control-group" id="vnpt-local-file-group">
                        <input type="file" id="vnpt-template-file" name="vnpt-template-file" accept=".docx" style="display:none;" />
                    </div>
                    <div class="vnpt-control-group">
                        <label for="vnpt-template-file" class="btn-upload-local" title="Chọn file DOCX từ máy tính">📁</label>
                        <input type="text" id="vnpt-export-filename" name="vnpt-export-filename" value="Export_Auto.docx" title="Tên file DOCX khi xuất" />
                        <button class="vnpt-btn-action btn-export" id="vnpt-btn-export" title="Xuất ra file DOCX">🖨️ XUẤT</button>
                    </div>

                </div>
            </div>
        </div>
    `,document.body.appendChild(n),D.widget=n,D.panel=document.getElementById("vnpt-export-panel"),D.toggleBtn=document.getElementById("vnpt-toggle-btn"),D.header=document.getElementById("vnpt-panel-header"),D.bannerArea=document.getElementById("vnpt-banner-area"),D.fieldsContainer=document.getElementById("vnpt-fields-list");try{const E=M.get(ki);E&&E.width&&E.height&&(D.panel.style.width=E.width+"px",D.panel.style.height=E.height+"px")}catch(E){console.error("Lỗi load size panel:",E)}new ResizeObserver(E=>{if(D.panel.style.display!=="none")for(let w of E){const{width:x,height:R}=w.contentRect;x>0&&R>0&&M.setDebounced(ki,{width:Math.round(x+20),height:Math.round(R+20)},1e3)}}).observe(D.panel),D.panelBody=document.getElementById("vnpt-panel-body"),Tn(document.getElementById("vnpt-template-manager"),(E,w)=>{D.templateBuffer=E,D.templateName=w}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const E=this.files&&this.files[0];if(!E)return;const w=document.getElementById("vnpt-template-manager");rE(E,w,(x,R)=>{D.templateBuffer=x,D.templateName=R}),this.value=""}),D.toggleBtn.addEventListener("click",E=>{D.hasDragged||(D.panel.style.display==="none"?(D.panel.style.display="flex",D.toggleBtn.className="btn-opened",D.toggleBtn.innerHTML="✖",M.set(Ri,!0)):(D.panel.style.display="none",D.toggleBtn.className="btn-closed",D.toggleBtn.innerHTML="📄",M.set(Ri,!1)))});const r=document.getElementById("vnpt-btn-more"),i=document.getElementById("vnpt-util-menu"),s={S:{width:"380px",height:"420px"},M:{width:"460px",height:"600px"},L:{width:"620px",height:"800px"},Full:{width:"98vw",height:"92vh"}},a=document.getElementById("vnpt-gemini-key"),c=document.getElementById("vnpt-gemini-model");a&&c&&Promise.resolve().then(()=>Vn).then(({SK_GEMINI_KEY:E,SK_GEMINI_MODEL:w})=>{a.value=M.get(E)||"";const x=M.get(w)||"gemini-2.5-flash";let R=Array.from(c.options).some(N=>N.value===x);c.value=R?x:"gemini-2.5-flash",a.onchange=()=>{M.set(E,a.value.trim())},c.onchange=()=>{M.set(w,c.value)};const P=document.getElementById("vnpt-btn-test-gemini");P&&(P.onclick=async()=>{const N=a.value.trim(),O=c.value;if(!N){F("⚠️ Vui lòng nhập API Key trước khi thử","#ffc107");return}P.disabled=!0,P.textContent="⏳ Đang thử...";try{await LE(N,O),F("✅ Kết nối tới Gemini thành công!","#1e8e3e")}catch(B){F("❌ Kết nối thất bại: "+B,"#ea4335")}finally{P.disabled=!1,P.textContent="⚡ Kiểm tra kết nối"}})}),document.getElementById("vnpt-btn-export-json").onclick=()=>ef();const l=document.getElementById("vnpt-btn-import-json"),u=document.getElementById("vnpt-file-import-json");l.onclick=()=>u.click(),u.onchange=async E=>{E.target.files.length>0&&await tf(E.target.files[0])&&setTimeout(()=>location.reload(),1500)},r.addEventListener("click",E=>{E.stopPropagation();const w=i.classList.toggle("show");r.classList.toggle("active",w)}),i.addEventListener("click",E=>{E.stopPropagation()}),document.addEventListener("click",E=>{i.classList.contains("show")&&(i.classList.remove("show"),r.classList.remove("active"))}),i.querySelectorAll(".size-options button").forEach(E=>{E.addEventListener("click",w=>{const x=w.target.getAttribute("data-size"),R=s[x];R&&(D.panel.style.width=R.width,D.panel.style.height=R.height),i.classList.remove("show"),r.classList.remove("active")})});function f(){const E=document.getElementById("vnpt-hotkey-list");if(!E)return;const w=M.get(br,zs);E.innerHTML="",Object.entries(w).forEach(([x,R])=>{const P=document.createElement("div");P.className="vnpt-hotkey-row",P.innerHTML=`
                <span class="vnpt-hotkey-label">${R.label||x}</span>
                <button class="vnpt-hotkey-btn" data-action="${x}">${ec(R)}</button>
            `;const N=P.querySelector(".vnpt-hotkey-btn");N.onclick=O=>{O.stopPropagation(),!N.classList.contains("recording")&&(N.classList.add("recording"),N.textContent="Bấm phím...",NE(x,B=>{N.classList.remove("recording"),N.textContent=ec(B)}))},E.appendChild(P)})}f(),D.panel.querySelectorAll(".vnpt-resizer").forEach(E=>{E.addEventListener("mousedown",w=>{w.preventDefault(),w.stopPropagation();const x=w.clientX,R=w.clientY,P=D.panel.offsetWidth,N=D.panel.offsetHeight,O=D.widget.getBoundingClientRect(),B=O.top;window.innerWidth-O.right,D.panel.classList.add("vnpt-resizing"),document.body.classList.add("vnpt-resizing-global");const K=window.getComputedStyle(E).cursor;document.body.style.cursor=K;const _=v=>{const T=v.clientX-x,I=v.clientY-R;if(E.classList.contains("br"))D.panel.style.width=Math.max(360,P+T)+"px",D.panel.style.height=Math.max(250,N+I)+"px";else if(E.classList.contains("bl")){const S=P-T;S>360&&(D.panel.style.width=S+"px"),D.panel.style.height=Math.max(250,N+I)+"px"}else if(E.classList.contains("tr")){D.panel.style.width=Math.max(360,P+T)+"px";const S=N-I;S>250&&(D.panel.style.height=S+"px",D.widget.style.top=B+I+"px")}else if(E.classList.contains("tl")){const S=P-T,b=N-I;S>360&&(D.panel.style.width=S+"px"),b>250&&(D.panel.style.height=b+"px",D.widget.style.top=B+I+"px")}},m=()=>{window.removeEventListener("mousemove",_),window.removeEventListener("mouseup",m),D.panel.classList.remove("vnpt-resizing"),document.body.classList.remove("vnpt-resizing-global"),document.body.style.cursor="";const v=D.widget.id==="vnpt-docx-widget";M.setDebounced(Ci,{right:v?D.widget.style.right:void 0,top:D.widget.style.top,x:v?void 0:parseFloat(D.widget.style.left),y:parseFloat(D.widget.style.top)},500),M.setDebounced(ki,{width:D.panel.offsetWidth,height:D.panel.offsetHeight},500)};window.addEventListener("mousemove",_),window.addEventListener("mouseup",m)})});const y=document.getElementById("vnpt-cloud-sync-container");y&&VE(y);function A(){const E=document.getElementById("vnpt-update-badge-container");if(E&&Fe.hasUpdate()){const w=document.createElement("span");w.className="vnpt-update-badge",w.textContent="NEW",w.title=`Có bản cập nhật mới v${Fe.info.latestVersion}. Click để xem!`,w.onclick=x=>{x.stopPropagation(),Fe.info.updateUrl?window.open(Fe.info.updateUrl,"_blank"):F(`Bản cập nhật v${Fe.info.latestVersion} đã sẵn sàng!`,"#1a73e8")},E.innerHTML="",E.appendChild(w)}}setTimeout(A,1e3)}function ff(n,e,t,r=null,i=null){let s=!1,a=0,c=0,l=0,u=0,f=!1;const p=5;function y(P){f!==P&&(f=P,i&&i(P))}function A(P){if(P.button!==0||["INPUT","BUTTON","SELECT","TEXTAREA"].includes(P.target.tagName)||P.target.isContentEditable)return;s=!0,D.hasDragged=!1,l=P.clientX,u=P.clientY;const O=n.getBoundingClientRect();a=P.clientX-O.left,c=P.clientY-O.top,document.body.style.userSelect="none",e&&e.forEach(B=>B.style.cursor="grabbing"),r&&r(),P.preventDefault()}e.forEach(P=>{P.addEventListener("mousedown",A)});let E=null,w=0,x=0;function R(){if(!s)return;let P=w,N=x;const O=window.innerWidth,B=window.innerHeight,K=document.getElementById("vnpt-toggle-btn"),_=K?K.offsetWidth:40,m=K?K.offsetHeight:40,v=n.id==="vnpt-docx-widget";let T=n.offsetWidth||0;if(v){let b=_+6-T,se=O-T+6;P<b&&(P=b),P>se&&(P=se)}else T=T||200,P<0&&(P=0),P+T>O&&(P=Math.max(0,O-T));let I=f;if(v?I=!1:f?x+c<B-40&&(I=!1):x+c>B-10&&(I=!0),N<0&&(N=0),I)y(!0),n.style.top=B-(n.offsetHeight||34)+"px",v?(n.style.right=O-P-T+"px",n.style.left="auto"):(n.style.left=P+"px",n.style.right="auto");else{y(!1);let S=n.offsetHeight||40,b;if(v)b=10+m;else{const se=n.querySelector(".cw-title-bar");b=se?se.offsetHeight:S}N+b>B&&(N=Math.max(0,B-b)),n.style.top=N+"px",v?(n.style.right=O-P-T+"px",n.style.left="auto"):(n.style.left=P+"px",n.style.right="auto")}n.style.bottom="auto",E=null}return document.addEventListener("mousemove",function(P){if(s){if(!D.hasDragged)if(Math.sqrt(Math.pow(P.clientX-l,2)+Math.pow(P.clientY-u,2))>p)D.hasDragged=!0;else return;w=P.clientX-a,x=P.clientY-c,E||(E=requestAnimationFrame(R))}}),document.addEventListener("mouseup",function(){if(s){if(s=!1,E&&(cancelAnimationFrame(E),E=null,R()),document.body.style.userSelect="",e&&e.forEach(P=>P.style.cursor="grab"),t){const P=n.id==="vnpt-docx-widget";M.set(t,{left:P?void 0:n.style.left,right:P?n.style.right:void 0,top:n.style.top,x:P?void 0:parseFloat(n.style.left),y:parseFloat(n.style.top),docked:f})}setTimeout(()=>{D.hasDragged=!1},100)}}),{isDocked:()=>f,setDocked:y}}function BE(){D.widget&&D.header&&(ff(D.widget,[D.header],Ci),window.addEventListener("resize",()=>{const n=window.innerWidth,e=window.innerHeight,t=document.getElementById("vnpt-toggle-btn"),r=t?t.offsetWidth:40,i=t?t.offsetHeight:40;let s=D.widget.getBoundingClientRect(),a=s.left,c=s.top,l=D.widget.offsetWidth||0,f=r+6-l,p=n-l+6;a<f&&(a=f),a>p&&(a=p),c+10+i>e&&(c=Math.max(0,e-(10+i))),D.widget.style.right=n-a-l+"px",D.widget.style.top=c+"px"}))}function pf(n){const e=n.toLowerCase(),{ngay:t,thang:r,nam:i}=Kd(),s=`${t}/${r}/${i}`;return{"ngayky, ngayky1":t,ngayky:t,"thangky, thangky1":r,thangky:r,"namky, namky1":i,namky:i,"ngaytiepnhan, ngaythangnamky":s,ngaytiepnhan:s,ngaythangnamky:s,soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[e]||""}function Qs(n){var t;if(!n)return"";const e=n.tagName.toLowerCase();if(e==="select")return((t=n.options[n.selectedIndex])==null?void 0:t.text)||"";if(e==="ng-select2"){const r=n.querySelector(".select2-selection__rendered");return r?r.getAttribute("title")||r.textContent.trim():""}return(n.value||n.getAttribute("title")||"").trim()}function gf(n=!1){n&&lr(!0);const e=Fe.getLabels(),t=Object.keys(e).find(c=>c.includes("diaChi"));if(!t)return"";const r=e[t],i=t.split(",").map(c=>c.trim());let s={detail:"",ward:"",district:"",province:""};i.forEach(c=>{const l=et(c,r);if(l){let u=Qs(l);u&&u!=="--- Chọn ---"&&!u.includes("Chọn")&&(c==="diaChi"||c==="duong"?(!s.detail||u.length>s.detail.length)&&(s.detail=u):c.includes("tinh")?s.province=u:c.includes("xaIdNew")||c.includes("huyen")||c.includes("quan")?s.district=u:(c.includes("xa")||c.includes("phuong"))&&(s.ward=u))}}),document.querySelectorAll("ng-select2").forEach(c=>{const l=c.querySelector(".select2-selection__rendered");if(!l)return;const u=(l.getAttribute("title")||l.textContent||"").trim();!u||u==="--- Chọn ---"||u.includes("Chọn")||((u.startsWith("Xã")||u.startsWith("Phường")||u.startsWith("Thị trấn"))&&!s.ward?s.ward=u:(u.startsWith("Quận")||u.startsWith("Huyện")||u.startsWith("Thị xã"))&&!s.district?s.district=u:(u.startsWith("Tỉnh")||u.startsWith("Thành phố"))&&!s.province&&(s.province=u))});let a=[];if(s.detail&&a.push(s.detail),s.ward&&a.push(s.ward),s.district&&a.push(s.district),s.province){let c=s.province;!c.startsWith("Tỉnh")&&!c.startsWith("Thành phố")&&(c="Tỉnh "+c),a.push(c)}return a.length>0&&a.push(""),a.filter(c=>!!c).join(", ")}function tc(){let n="";const e=["tinhIdNew","tinhId","diaChiTruSoTinhIdNew"];for(const t of e){const r=et(t);if(r&&(n=Qs(r),n&&n!=="--- Chọn ---"&&!n.includes("Chọn")))break}if(!n||n==="--- Chọn ---"){const t=document.querySelectorAll("ng-select2");for(const r of t){const i=r.querySelector(".select2-selection__rendered"),s=((i==null?void 0:i.getAttribute("title"))||(i==null?void 0:i.textContent)||"").trim();if(s&&(s.startsWith("Tỉnh")||s.startsWith("Thành phố"))&&!s.includes("Chọn")){n=s;break}}}return n?n.trim().replace(/^(Tỉnh|Thành phố)\s+/i,""):""}function qE(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){if(D.isDefaultMode){Object.keys(Me).forEach(u=>{ue(u,Me[u],ve[u]||"")}),Ce(),F("Đã nạp lại dữ liệu mặc định từ hệ thống.");return}let c=0;lr();const l=Fe.getLabels();Object.keys(l).forEach(u=>{const f=l[u],p=u.split(",").map(w=>w.trim()),y=p.includes("diaChi"),A=p.includes("noiCapSoDkdn");let E="";if(y)E=gf(!1),E&&c++;else if(A){const w=tc();w&&(E="SKDT "+w,c++)}else p.forEach(w=>{if(E)return;const x=et(w,f);x&&(E=Qs(x),E&&E!=="--- Chọn ---"&&!E.includes("Chọn")?c++:E="")});if(E=E||pf(u),E&&typeof E=="string"){const w=p[0];["sdt"].includes(w)?E=uE(E):["ngaySinhCustomer","ngayCapCustomer","ngayCapSoDkdnCustomer","ngayKy","ngayTiepNhan"].includes(w)&&(E=Bd(E))}ue(u,E,null,"",null,!1)}),Ce(),c>0?(this.style.background="#1e8e3e",this.style.color="#fff",this.innerText="Đã quét xong",setTimeout(()=>{this.style.background="",this.style.color="",this.innerText="Quét dữ liệu"},1e3)):F("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")});let n=null;function e(){const c=Fe.getLabels();if(n)return n;const l=new Map;return Object.keys(c).forEach(u=>{u.split(",").map(p=>p.trim()).forEach(p=>l.set(p,u))}),n=l,l}function t(c){if(c.target.closest("#vnpt-docx-widget")||c.target.closest("#vnpt-inline-calc")||c.type==="keydown"&&c.key!=="Enter")return;const l=c.target.closest("input, textarea, select, ng-select2");if(!l)return;const u=l.id,f=l.getAttribute("formcontrolname"),p=e(),y=u&&p.get(u)||f&&p.get(f);if(y!==void 0){let A;if(y.includes("diaChi")){A=gf(!1);const E=tc();if(E){const w="SKDT "+E,x=Array.from(p.values()).find(R=>R.includes("noiCapSoDkdn"));x&&ue(x,w,null,"",null,!0)}}else A=Qs(l);A!==void 0&&(ue(y,A,null,"",null,!0),Ce(),console.debug(`[Sync] Updated ${y} with value: "${A}"`))}}function r(){["tinhId","tinhIdNew","diaChiTruSoTinhIdNew"].forEach(l=>{const u=document.getElementById(l);if(u&&!u.dataset.widgetSyncBound){u.dataset.widgetSyncBound="1";const f=()=>{const p=tc();if(p){const y="SKDT "+p,A=e(),E=Array.from(A.values()).find(w=>w.includes("noiCapSoDkdn"));E&&(ue(E,y,null,"",null,!0),Ce())}};u.addEventListener("change",f),typeof $<"u"&&$(u).on("select2:select change",f)}})}const i=cr(t,100),s=cr(()=>{hE(),r()},500);document.addEventListener("input",i),document.addEventListener("change",t),document.addEventListener("keydown",t),r(),new MutationObserver(()=>s()).observe(document.body,{childList:!0,subtree:!0})}const $E={local:{download(n,e="arraybuffer"){return new Promise((t,r)=>{const i=new FileReader;switch(i.onload=s=>{let a=s.target.result;e==="base64"&&typeof a=="string"&&(a=a.split(",")[1]||a),t(a)},i.onerror=s=>r(s),e.toLowerCase()){case"arraybuffer":i.readAsArrayBuffer(n);break;case"base64":case"dataurl":i.readAsDataURL(n);break;case"text":i.readAsText(n);break;default:r(new Error(`Unsupported read type: ${e}`))}})},async upload(n){return this.download(n,"base64")}}},HE={getAdapter(n){const e=$E[n];if(!e)throw new Error(`Storage adapter not found: ${n}`);return e},async upload(n,e,t={}){return await this.getAdapter(n).upload(e,t)},async download(n,e,t={}){return await this.getAdapter(n).download(e,t.type||"arraybuffer")}};function mf(n,e,t){try{let r;try{r=new window.PizZip(n)}catch(l){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(l);return}const i=new window.docxtemplater(r,{paragraphLoop:!0,linebreaks:!0});i.render(e);const s=i.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",compression:"DEFLATE",compressionOptions:{level:9}}),a=URL.createObjectURL(s),c=document.createElement("a");c.href=a,c.download=t,document.body.appendChild(c),c.click(),setTimeout(()=>{document.body.removeChild(c),URL.revokeObjectURL(a)},100)}catch(r){let i=r.message;r.properties&&r.properties.errors instanceof Array?i=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+r.properties.errors.map(a=>"- "+(a.properties.explanation||a.message)).join(`
`):i="Lỗi phần mềm Word sinh ra: "+i,alert(i),console.error("DocX Error:",r)}}function jE(n,e){const t=n.replace(/@(\w+)/g,(r,i)=>e[i]!==void 0?e[i]:r);navigator.clipboard.writeText(t).then(()=>{alert("✅ Đã sao chép nội dung vào Clipboard!")}).catch(r=>{console.error("Lỗi khi copy:",r),alert("❌ Lỗi khi sao chép vào Clipboard. Vui lòng thử lại!")})}function KE(){const n=document.getElementById("vnpt-export-filename");n&&n.addEventListener("input",()=>{n.dataset.userEdited="1",n.value.trim()||(n.dataset.userEdited="0")});function e(){if(!n||n.dataset.userEdited==="1")return;let r="";if(D.fieldsContainer&&D.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(u=>{const p=u.querySelector(".f-key").value.trim().split(",")[0].trim(),y=u.querySelector(".f-val").value.trim();p==="tenToChuc"&&(r=y)}),!r){const l=document.getElementById("tenToChuc");l&&(r=l.tagName.toLowerCase()==="textarea"||l.tagName.toLowerCase()==="input"?l.value.trim():l.innerText.trim())}function i(l){if(!l)return"";let u=l;return u=u.replace(/Tổng công ty/gi,""),u=u.replace(/Công ty/gi,""),u=u.replace(/\bCty\b/gi,""),u=u.replace(/Trách nhiệm hữu hạn/gi,""),u=u.replace(/\bTNHH\b/gi,""),u=u.replace(/Cổ phần/gi,""),u=u.replace(/\bCP\b/gi,""),u=u.replace(/Một thành viên/gi,""),u=u.replace(/\bMTV\b/gi,""),u=u.replace(/Chi nhánh/gi,""),u=u.replace(/Việt Nam/gi,"VN"),u=u.replace(/Viet Nam/gi,"VN"),u=u.replace(/\s+/g," ").trim(),u=u.replace(/^[-,\s]+|[-,\s]+$/g,""),u.length>50&&(u=u.substring(0,47)+"..."),u.replace(/[<>:"/\\|?*]/g,"")}let s=i(r),a=D.templateName?D.templateName.replace(/\.docx$/i,""):"",c=[];a&&c.push(a),s&&c.push(s),c.length>0?n.value=c.join(" - ")+".docx":n.value||(n.value="Export_Auto.docx")}setInterval(e,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const r={};if(D.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(l=>{const f=l.querySelector(".f-key").value.trim().split(",")[0].trim(),p=l.querySelector(".f-val").value;f&&(r[f]=p)}),Object.keys(r).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}const s=[];if(yr.forEach(l=>{if(!r[l]||!r[l].trim()){const u=ve[l]||l;s.push(u)}}),s.length>0){const l=`Cảnh báo: Bạn còn các trường sau chưa điền dữ liệu:

- ${s.join(`
- `)}

Bạn có chắc chắn muốn tiếp tục xuất file không?`;if(!confirm(l))return}let a=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(a.toLowerCase().endsWith(".docx")||(a+=".docx"),D.templateBuffer){mf(D.templateBuffer,r,a);return}const c=document.getElementById("vnpt-template-file");if(c.files&&c.files.length>0){HE.download("local",c.files[0],{type:"arraybuffer"}).then(l=>mf(l,r,a)).catch(l=>alert(`Lỗi đọc file: ${l.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')});const t=document.getElementById("vnpt-btn-export-txt");t&&t.addEventListener("click",()=>{const r=document.getElementById("vnpt-raw-scan-input"),i=r?r.value:"";if(!i.trim()){alert(`Bạn chưa nhập nội dung Text Template!

Sử dụng @key làm placeholder, ví dụ: Tôi là @tenDaiDienn`);return}const s={};if(D.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(c=>{const u=c.querySelector(".f-key").value.trim().split(",")[0].trim(),f=c.querySelector(".f-val").value;u&&(s[u]=f)}),Object.keys(s).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}jE(i,s)})}const zE=["chucVu","noiCap","noiCapSoDkdn","ngayky","ngayky1","thangky","namky","thangky1","namky1","noiKy"],GE=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function WE(){function n(){zE.forEach(i=>{const s=document.getElementById(i);s&&!s.dataset.filled&&(s.dataset.filled="1",ur(s,pf(i)))}),GE.forEach(i=>{const s=document.getElementById(i.src),a=document.getElementById(i.target);s&&a&&!s.dataset.bound&&(s.dataset.bound="1",s.addEventListener("change",()=>ur(a,s.value)))}),["tinhId","tinhIdNew","diaChiTruSoTinhIdNew"].forEach(i=>{const s=document.getElementById(i),a=document.getElementById("noiCapSoDkdn");if(s&&a&&!s.dataset.skdtBound){s.dataset.skdtBound="1";const c=()=>{let l="";if(s.tagName.toLowerCase()==="ng-select2"||s.classList.contains("select2-hidden-accessible")){const u=s.parentElement.querySelector(".select2-selection__rendered");l=u?u.getAttribute("title")||u.textContent.trim():s.value}else l=s.value;if(l&&l!=="--- Chọn ---"&&!l.includes("Chọn")){const u=l.trim().replace(/^(Tỉnh|Thành phố)\s+/i,"");ur(a,"SKDT "+u)}};s.addEventListener("change",c),$(s).on("select2:select",c)}})}let e;new MutationObserver(r=>{r.some(s=>s.addedNodes.length>0?Array.from(s.addedNodes).some(c=>c.nodeType!==1?!1:["INPUT","TEXTAREA","SELECT"].includes(c.tagName)?!0:c.querySelector&&c.querySelector("input, textarea, select")):!1)&&(clearTimeout(e),e=setTimeout(n,200))}).observe(document.body,{childList:!0,subtree:!0}),n()}const QE=()=>{let n="";for(const[e,t]of Object.entries(ve)){const r=e.split(",")[0].trim();yr.includes(r)&&(n+=`    "${r}": "${t}",
`)}return`Bạn là chuyên gia trích xuất dữ liệu từ Hợp đồng/Phụ lục VNPT.
Nhiệm vụ: Đọc kỹ tài liệu và trích xuất thông tin của BÊN A (KHÁCH HÀNG). 
TUYỆT ĐỐI KHÔNG lấy thông tin của Bên B (VNPT).

CHỈ TRẢ VỀ JSON THUẦN TÚY.
Cấu trúc JSON yêu cầu:
{
  "fields": {
${n}    "ngayKy": "dd/MM/yyyy"
  },
  "rawFullText": "Toàn bộ nội dung văn bản đã được OCR"
}

QUY TẮC TRÍCH XUẤT:
1. "soDkdn": Lấy Mã số thuế (10 hoặc 13 số) hoặc số GPKD.
2. "noiCapSoDkdn": Luôn trả về định dạng "SKDT {Tỉnh}" (VD: "SKDT TP.HCM").
3. Định dạng ngày: Luôn là dd/MM/yyyy. Nếu chỉ có tháng/năm, hãy để trống ngày.
4. Ưu tiên lấy thông tin ở các trang có chữ ký/dấu mộc nếu có mâu thuẫn.
5. Nếu không tìm thấy trường thông tin, trả về "".

VÍ DỤ TRÍCH XUẤT:
Văn bản: "...Bên A: Công ty TNHH Giải Pháp AI. MST: 0312345678. Đại diện: Ông Trần Văn B. CMND: 123456789 cấp ngày 01/01/2010 tại CA TP.HCM..."
Kết quả: {
  "fields": {
    "tenToChuc": "Công ty TNHH Giải Pháp AI",
    "soDkdn": "0312345678",
    "tenDaiDienn": "Trần Văn B",
    "cmnd": "123456789",
    "ngayCapCustomer": "01/01/2010"
  },
  "rawFullText": "..."
}`};function YE(n,e,t="gemini-2.0-flash",r="application/pdf",i=null){const s={apiKey:e,model:t,systemInstruction:QE(),userText:"Đọc tài liệu hợp đồng này và trích xuất thành JSON. Nếu có nhiều trang, hãy kết nối thông tin với nhau để lấy ra thông tin đầy đủ nhất."};return i&&Array.isArray(i)&&(s.filesData=i),lf(s)}function nc(n){return new Promise((e,t)=>{const r=new FileReader,i=n.type||"application/octet-stream";r.onload=()=>{const s=r.result.split(",")[1];e({base64:s,mimeType:i})},r.onerror=s=>t(s),r.readAsDataURL(n)})}function yf(n,e,t,r){let i=document.getElementById("vnpt-pdf-dialog");i&&i.remove(),i=document.createElement("div"),i.id="vnpt-pdf-dialog",i.className="vnpt-pdf-overlay";const s=n.map((E,w)=>`
        <tr class="pdf-row-auto">
            <td style="text-align: center;">
                <input type="checkbox" class="pdf-row-chk" data-index="${w}" ${E.checked?"checked":""} />
            </td>
            <td><strong title="${E.key}">${E.label}</strong></td>
            <td>
                <input type="text" class="pdf-val-input" data-index="${w}" value="${E.value}" placeholder="..." />
            </td>
        </tr>
    `).join("");i.innerHTML=`
        <div class="vnpt-pdf-dialog-box" style="width: 1000px; height: 85vh;">
            <div class="pdf-dlg-header">
                <h3>🔍 KIỂM TRA & XÁC NHẬN KẾT QUẢ AI</h3>
            </div>
            
            <div class="pdf-dlg-cols" style="gap: 16px;">
                <!-- Cột trái: Nội dung gốc (Cho phép Edit) -->
                <div class="pdf-col-left" style="display: flex; flex-direction: column; padding: 0; background: #fff;">
                    <div style="font-weight: 800; color: #1a73e8; margin-bottom: 0; border-bottom: 2px solid var(--vnpt-primary-light); padding: 12px 14px; background: rgba(26, 115, 232, 0.05); border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
                        <span>VĂN BẢN GỐC (CÓ THỂ SỬA)</span>
                        <span style="font-size: 10px; opacity: 0.7; font-weight: 600;">EDITOR</span>
                    </div>
                    <textarea id="pdf-raw-text-edit" style="flex: 1; border: none; background: #fcfdfe; padding: 15px; resize: none; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 12.5px; line-height: 1.6; color: #2c3e50; outline: none; border-bottom: 1px solid #eee;">${e||""}</textarea>
                    

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
                            <tbody>${s}</tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="vnpt-pdf-actions">
                <div style="flex:1; font-size:11px; color:#5f6368;">
                    <strong>Mẹo:</strong> Bạn có thể sửa nội dung bên trái rồi nhấn "Cập nhật" để AI/Regex nhận diện lại nếu dữ liệu thô bị sai/thiếu.
                </div>
                <button class="pdf-btn-cancel" id="pdf-btn-cancel">Hủy bỏ(Esc)</button>
                <button class="pdf-btn-confirm" id="pdf-btn-confirm">Lưu vào bảng(Enter)</button>
                <button class="pdf-btn-reparse" id="pdf-btn-reparse">CẬP NHẬT</button>
            </div>
        </div>
    `,document.body.appendChild(i);const a=i.querySelector("#pdf-btn-cancel"),c=i.querySelector("#pdf-btn-confirm"),l=i.querySelector("#pdf-btn-reparse"),u=i.querySelector("#pdf-check-all"),f=i.querySelectorAll(".pdf-row-chk");i.querySelectorAll(".pdf-val-input");const p=i.querySelector("#pdf-raw-text-edit");u&&u.addEventListener("change",E=>{f.forEach(w=>w.checked=E.target.checked)});const y=()=>{window.removeEventListener("keydown",A),i.remove()},A=E=>{if(E.key==="Escape")y();else if(E.key==="Enter"){if(E.target&&E.target.id==="pdf-raw-text-edit")return;E.preventDefault(),c.click()}};window.addEventListener("keydown",A),a.onclick=y,l.onclick=()=>{if(r){const E=p.value;r(E)}},c.onclick=()=>{try{const E=[];i.querySelectorAll(".pdf-row-auto").forEach(x=>{const R=x.querySelector(".pdf-row-chk"),P=x.querySelector(".pdf-val-input");if(R&&R.checked&&P){const N=parseInt(R.getAttribute("data-index"));n[N]&&E.push({...n[N],value:P.value})}}),y(),t&&t(E)}catch(E){console.error("[VNPT] Lỗi khi xác nhận kết quả:",E),alert("Có lỗi xảy ra khi lưu dữ liệu. Vui lòng thử lại.")}}}const ke={name:n=>n?n.trim().toUpperCase().replace(/\s+/g," "):"",mst:n=>n?n.replace(/[^\d]/g,"").trim():"",date:(n,e,t)=>`${String(n).padStart(2,"0")}/${String(e).padStart(2,"0")}/${t}`,text:n=>n?n.trim().replace(/\s+/g," "):""};function Tt(n,e){for(const t of e){const r=n.match(t);if(r&&r[1])return r[1].trim()}return null}function XE(n){if(!n)return{};const e={},t=n.replace(/\r/g,"");if(t.includes("|")){const m=t.split("|").map(v=>v.trim());if(m.length>=6){e.cmnd=ke.mst(m[0]),e.tenDaiDienn=ke.name(m[2]);const v=m[3];v&&v.length===8&&!v.includes("/")?e.ngaySinhCustomer=ke.date(v.slice(0,2),v.slice(2,4),v.slice(4)):v&&(e.ngaySinhCustomer=v),m[5]&&(e.diaChiCustomer=ke.text(m[5]));const T=m[6];return T&&T.length===8&&!T.includes("/")?e.ngayCapCustomer=ke.date(T.slice(0,2),T.slice(2,4),T.slice(4)):T&&(e.ngayCapCustomer=T),e.noiCap="Cục Cảnh sát quản lý hành chính về trật tự xã hội",e}}const i=Tt(t,[/(?:Tên công ty viết bằng tiếng Việt|Tên doanh nghiệp|Tên tổ chức|Doanh nghiệp|Công ty):?\s*([\s\S]+?)(?=\n|Tên công ty|Mã số|$)/i,/Tên công ty viết bằng tiếng nước ngoài:?\s*([\s\S]+?)(?=\n|Tên công ty|$)/i,/Tên công ty viết tắt:?\s*([\s\S]+?)(?=\n|Địa chỉ|$)/i]);i&&(e.tenToChuc=ke.text(i));const a=Tt(t,[/(?:Mã số doanh nghiệp|Mã số thuế):?\s*([\d\s.]{10,16})/i,/MST:?\s*([\d\s.]{10,16})/i]);a&&(e.soDkdn=ke.mst(a));let l=Tt(t,[/(?:Họ và tên|Người đại diện theo pháp luật|Tên đại diện|Full name):?\s*([\s\S]+?)(?=\n|Chức danh|Chức vụ|Giới tính|Sinh ngày|Date of birth|$)/i,/Người đại diện:?\s*([\s\S]+?)(?=\n|Chức vụ|$)/i]);l&&(l=l.replace(/^(?:Họ và tên|Người đại diện theo pháp luật|Tên đại diện|Full name|[\/\s]*Full name):?\s*/i,"").replace(/^\/\s*/,""),e.tenDaiDienn=ke.name(l));const f=Tt(t,[/(?:Chức danh|Chức vụ):?\s*([\s\S]+?)(?=\n|Sinh ngày|Giới tính|Quốc tịch|$)/i]);f&&(e.chucVu=ke.text(f));const p=t.match(/(?:Đăng ký|Đảng kỷ|Cấp ngày|Ngày cấp) (?:lần đầu|thay đổi):?\s*ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i);p&&(e.ngayCapSoDkdnCustomer=ke.date(p[1],p[2],p[3]));const A=Tt(t,[/(?:Điện thoại|SĐT|Tel):?\s*([\d\s.-]{9,15})/i]);A&&(e.sdt=A.replace(/[\s.-]/g,"").trim());const w=Tt(t,[/(?:Thư điện tử|Email):?\s*([^\s\n]+)/i]);w&&(e.emailDaiDien=w.replace(/\(a\)/g,"@").trim());const R=Tt(t,[/(?:Số định danh cá nhân|Số CMND|Số CCCD|Số Hộ chiếu|Số \/ No\.):?\s*(\d[\d\s]{8,13})/i,/(?:CMND|CCCD) số:?\s*(\d[\d\s]{8,13})/i]);R&&(e.cmnd=ke.mst(R));const N=Tt(t,[/Nơi cấp:?\s*([\s\S]+?)(?=\n|Ngày cấp|$)/i,/Cục trưởng Cục Cảnh sát ([\s\S]+?)(?=\n|$)/i]);N&&(e.noiCap=ke.text(N));const O=t.match(/Ngày cấp:?\s*(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{4})/i);O&&(e.ngayCapCustomer=ke.date(O[1],O[2],O[3]));const B=t.match(/(?:Ngày, tháng, năm sinh|Sinh ngày|Ngày sinh):?\s*ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i);if(B)e.ngaySinhCustomer=ke.date(B[1],B[2],B[3]);else{const m=t.match(/(?:Ngày sinh|Sinh ngày):?\s*(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{4})/i);m&&(e.ngaySinhCustomer=ke.date(m[1],m[2],m[3]))}const _=Tt(t,[/(?:Địa chỉ trụ sở chính|Địa chỉ thường trú|Nơi thường trú|Địa chỉ):?\s*([\s\S]+?)(?=\n|Điện thoại|Email|SĐT|$)/i]);return _&&(e.diaChiCustomer=ke.text(_)),e}const JE=()=>{let n="";for(const[e,t]of Object.entries(ve)){const r=e.split(",")[0].trim();yr.includes(r)&&(n+=`    "${r}": "${t}",
`)}return`Bạn là một chuyên gia trích xuất dữ liệu từ văn bản thô (tin nhắn, email, ghi chú).
Nhiệm vụ: Tìm thông tin của KHÁCH HÀNG (BÊN A) từ văn bản được cung cấp. Bỏ qua thông tin của nhân viên VNPT hoặc Bên B.

CHỈ TRẢ VỀ JSON THUẦN TÚY.
Cấu trúc JSON yêu cầu:
{
${n}    "ngayKy": "Ngày ký hợp đồng"
}

QUY TẮC TRÍCH XUẤT:
1. "soDkdn": Lấy Mã số thuế (10 hoặc 13 số) hoặc Số GPKD. Xóa dấu chấm/khoảng cách.
2. "sdt": Lấy số điện thoại di động/cố định. Định dạng chỉ gồm chữ số.
3. "ngay...": Tất cả các trường ngày tháng phải đưa về định dạng dd/MM/yyyy.
4. "diaChi": Gộp toàn bộ số nhà, đường, phường, quận, tỉnh thành một chuỗi duy nhất.
5. "noiCapSoDkdn": Trả về định dạng "SKDT {Tỉnh}" (ví dụ: "SKDT Hà Nội").
6. Nếu không tìm thấy thông tin cho một trường, trả về "".
7. Tuyệt đối không tự bịa ra thông tin không có trong văn bản.

VÍ DỤ:
Văn bản: "Khách hàng Nguyễn Văn A, MST 0101234567, địa chỉ số 1 Tràng Tiền, Hoàn Kiếm, HN. SĐT 0987654321 ký ngày 12 tháng 4 năm 2024"
Kết quả: {
  "tenDaiDienn": "Nguyễn Văn A",
  "soDkdn": "0101234567",
  "diaChi": "số 1 Tràng Tiền, Hoàn Kiếm, Hà Nội",
  "sdt": "0987654321",
  "ngayKy": "12/04/2024"
}`};async function ZE(n,e,t="gemini-2.0-flash"){if(!n||!n.trim())throw new Error("Vui lòng nhập nội dung văn bản cần phân loại.");return lf({apiKey:e,model:t,systemInstruction:JE(),userText:`Hãy phân loại thông tin từ đoạn văn bản sau đây: 

${n}`})}function Ys(n){if(!n||!n.trim())throw new Error("Vui lòng nhập nội dung văn bản cần phân loại.");return XE(n)}const vf="vnpt_pending_mail_data",eT=vf;function tT(){const n=window.location.hostname;let e={subject:"",body:"",sender:"",attachmentUrls:[]};try{if(n.includes("mail.google.com")){const t=document.querySelector(".a3s.aiL"),r=document.querySelector("h2.hP"),i=document.querySelector(".gD");e.body=t?t.innerText:"",e.subject=r?r.innerText:"",e.sender=i?i.getAttribute("email")||i.innerText:"",document.querySelectorAll(".a98, .a7K").forEach(s=>{const a=s.closest("a")||s.querySelector("a");a&&a.href&&!a.href.includes("support.google.com")&&e.attachmentUrls.push({url:a.href,name:s.innerText.split(`
`)[0].trim()||"Tệp đính kèm"})})}else if(n.includes("outlook.live.com")||n.includes("outlook.office.com")||n.includes("outlook.office365.com")){const t=document.querySelector('[role="main"]'),r=document.querySelector('[data-automation-id="subject"]'),i=document.querySelector('[data-automation-id="from"]');e.body=t?t.innerText:"",e.subject=r?r.innerText:"",e.sender=i?i.innerText:"",document.querySelectorAll('[data-automation-id="AttachmentCard"]').forEach(s=>{const a=s.querySelector("a"),c=s.querySelector('[data-automation-id="attachmentName"]');a&&a.href&&e.attachmentUrls.push({url:a.href,name:c?c.innerText:"Tệp đính kèm"})})}}catch(t){console.error("[VNPT] Lỗi khi bóc tách Mail:",t)}return e}const rc="vnpt-send-to-vnpt-btn";function _f(){nT().then(()=>{bf(),rT()})}function nT(){return new Promise(n=>{if(document.body){n();return}const e=new MutationObserver(()=>{document.body&&(e.disconnect(),n())});e.observe(document.documentElement,{childList:!0}),setTimeout(n,1e4)})}function rT(){setInterval(()=>{document.getElementById(rc)||bf()},3e3)}function bf(){if(document.getElementById(rc)||!document.body)return;const n=document.createElement("button");n.id=rc,n.innerHTML="📋 Gửi sang VNPT",n.title="Trích xuất nội dung mail này và gửi sang tab VNPT Tool",Object.assign(n.style,{position:"fixed",bottom:"24px",right:"24px",zIndex:"99999",padding:"10px 18px",background:"linear-gradient(135deg, #4f46e5, #7c3aed)",color:"#fff",border:"none",borderRadius:"24px",fontSize:"13px",fontWeight:"600",cursor:"pointer",boxShadow:"0 4px 20px rgba(79,70,229,0.5)",transition:"all 0.2s ease",fontFamily:"sans-serif"}),n.addEventListener("mouseenter",()=>{n.style.transform="translateY(-2px)",n.style.boxShadow="0 8px 28px rgba(79,70,229,0.65)"}),n.addEventListener("mouseleave",()=>{n.style.transform="",n.style.boxShadow="0 4px 20px rgba(79,70,229,0.5)"}),n.addEventListener("click",()=>{const e=tT();if(!e.body&&!e.subject){ic("⚠️ Không tìm thấy nội dung mail. Hãy mở một email cụ thể!","#f59e0b");return}try{GM_setValue(vf,JSON.stringify({...e,_timestamp:Date.now(),_source:window.location.hostname})),ic('✅ Đã gửi! Chuyển sang tab VNPT và nhấn "📧 Quét Mail".',"#10b981");const t=n.innerHTML;n.innerHTML="✅ Đã gửi!",n.style.background="linear-gradient(135deg, #059669, #10b981)",setTimeout(()=>{n.innerHTML=t,n.style.background="linear-gradient(135deg, #4f46e5, #7c3aed)"},2500)}catch(t){console.error("[VNPT] Lỗi GM_setValue:",t),ic("❌ Lỗi ghi dữ liệu. Kiểm tra lại grant Tampermonkey.","#ef4444")}}),document.body.appendChild(n),console.log("[VNPT] Mail Bridge đã inject lên",window.location.hostname)}function ic(n,e="#4f46e5"){const t=document.createElement("div");Object.assign(t.style,{position:"fixed",bottom:"80px",right:"24px",zIndex:"99999",padding:"10px 16px",background:e,color:"#fff",borderRadius:"10px",fontSize:"13px",fontFamily:"sans-serif",fontWeight:"500",boxShadow:"0 4px 16px rgba(0,0,0,0.25)",maxWidth:"320px",lineHeight:"1.5",transition:"opacity 0.3s"}),t.textContent=n,document.body.appendChild(t),setTimeout(()=>{t.style.opacity="0"},2200),setTimeout(()=>{t.remove()},2600)}function iT(){try{const n=document.body.cloneNode(!0);["script","style","noscript","iframe","svg","nav","footer","header:not(article header)","aside",".sidebar",".menu",".banner","#vnpt-docx-widget","#vnpt-inline-calc",".vnpt-pdf-overlay",'[aria-hidden="true"]'].forEach(r=>{n.querySelectorAll(r).forEach(s=>s.remove())});let t=n.innerText||"";return t=t.split(`
`).map(r=>r.trim()).filter(r=>r.length>0).join(`
`),t}catch(n){return console.error("Lỗi khi quét màn hình:",n),""}}function sT(n,e){return new Promise((t,r)=>{if(typeof GM_xmlhttpRequest>"u"){r(new Error("GM_xmlhttpRequest không khả dụng. Hãy cài đặt trên Tampermonkey."));return}GM_xmlhttpRequest({method:"GET",url:n,responseType:"arraybuffer",onload:function(i){var s;if(i.status===200){const a=((s=i.responseHeaders.match(/content-type:\s*([^\s;]+)/i))==null?void 0:s[1])||"application/octet-stream",c=oT(i.response);t({base64:c,mimeType:a,name:e})}else r(new Error("Lỗi tải tệp: "+i.status))},onerror:function(i){r(i)}})})}function oT(n){let e="";const t=new Uint8Array(n),r=t.byteLength;for(let i=0;i<r;i++)e+=String.fromCharCode(t[i]);return window.btoa(e)}let Be=[];function xn(n,e){if(n.innerHTML="",Be.length===0){e.style.display="flex";return}e.style.display="none",Be.forEach((t,r)=>{const i=document.createElement("div");if(i.className="ai-queue-item",t.mimeType&&t.mimeType.startsWith("image/")){const a=document.createElement("img");a.src=`data:${t.mimeType};base64,${t.base64}`,i.appendChild(a)}else{const a=document.createElement("span");a.className="file-icon",a.textContent="📄",i.appendChild(a)}const s=document.createElement("button");s.className="btn-remove-item",s.innerHTML="✖",s.onclick=a=>{a.stopPropagation(),Be.splice(r,1),xn(n,e)},i.appendChild(s),n.appendChild(i)})}function aT(n,e,t){Be=[],t.value="",xn(n,e)}function cT(){const n=document.getElementById("vnpt-btn-ai-mode"),e=document.getElementById("vnpt-ai-scanner-section"),t=document.getElementById("vnpt-btn-ai-process"),r=document.getElementById("vnpt-btn-raw-process-local"),i=document.getElementById("vnpt-raw-scan-input"),s=document.getElementById("vnpt-ai-queue-container"),a=document.getElementById("vnpt-ai-queue-list"),c=document.getElementById("vnpt-ai-queue-placeholder"),l=document.getElementById("vnpt-btn-show-pdf"),u=document.getElementById("vnpt-btn-clear-queue"),f=document.getElementById("vnpt-pdf-input");if(!n||!e)return;n.addEventListener("click",w=>{w.preventDefault();const x=e.style.display==="none";e.style.display=x?"flex":"none",n.classList.toggle("active",x)});const p=M.get(Ln);p&&i&&(i.value=p),i&&i.addEventListener("input",()=>{M.setDebounced(Ln,i.value,1e3)}),l&&l.addEventListener("click",w=>{if(w.preventDefault(),D.lastPdfResults&&D.lastPdfResults.length>0)yf(D.lastPdfResults,D.lastPdfRawText||"",x=>{x.forEach(R=>{ue(R.key,R.value,R.label)}),Ce(),F(`✅ Đã cập nhật ${x.length} trường.`)},x=>{try{const R=Ys(x);E(R,x,"KẾT QUẢ QUÉT (CẬP NHẬT)")}catch(R){F("❌ Lỗi: "+R.message,"#ef4444")}});else if(i&&i.value.trim()){const x=i.value.trim();try{const R=Ys(x);E(R,x,"PHÂN LOẠI DỮ LIỆU THÔ (LOCAL)")}catch(R){F("❌ Lỗi: "+R.message,"#f44336")}}else F("Chưa có nội dung để hiển thị. Vui lòng nhập text hoặc chọn file.","#ffc107")}),u&&u.addEventListener("click",w=>{w.preventDefault(),aT(a,c,i)}),s.addEventListener("click",()=>{f.click()});const y=document.getElementById("vnpt-btn-scan-mail"),A=document.getElementById("vnpt-btn-scan-screen");y&&y.addEventListener("click",async()=>{let w;try{w=GM_getValue(eT,null)}catch{F("❌ Lỗi GM_getValue. Kiểm tra lại grant Tampermonkey.","#ef4444");return}if(!w){F(`⚠️ Chưa có mail nào được gửi!
👉 Mở Gmail/Outlook → chọn email → nhấn nút "📋 Gửi sang VNPT".`,"#f59e0b");return}let x;try{x=typeof w=="string"?JSON.parse(w):w}catch{F("❌ Dữ liệu mail bị lỗi định dạng.","#ef4444");return}const R=30*60*1e3;if(x._timestamp&&Date.now()-x._timestamp>R){F("⚠️ Dữ liệu mail đã quá cũ (>30 phút). Hãy gửi lại từ tab Gmail/Outlook.","#f59e0b");return}const P=`TIÊU ĐỀ: ${x.subject||""}
NGƯỜI GỬI: ${x.sender||""}

NỘI DUNG EMAIL:
${x.body||""}`;if(i.value.trim()?i.value+=`

--- MAIL MỚI ---
${P}`:i.value=P,M.set(Ln,i.value),F(`📧 Đã nhận mail từ ${x._source||"tab mail"}.`),x.attachmentUrls&&x.attachmentUrls.length>0){F(`📂 Đang tải ${x.attachmentUrls.length} tệp đính kèm...`,"#1a73e8");for(const N of x.attachmentUrls)try{const O=await sT(N.url,N.name);Be.push({file:{name:N.name},...O})}catch(O){console.error("[VNPT] Lỗi tải tệp:",N.name,O)}xn(a,c),F("✅ Đã nạp xong tệp đính kèm!")}t.click()}),A&&A.addEventListener("click",()=>{const w=iT();w?(i.value.trim()?i.value+=`

--- NỘI DUNG MÀN HÌNH MỚI ---
${w}`:i.value=w,M.set(Ln,i.value),F("🖥️ Đã quét toàn bộ màn hình."),t.click()):F("⚠️ Không thể quét nội dung màn hình","#ffc107")}),s.addEventListener("dragover",w=>{w.preventDefault(),s.classList.add("drag-over")}),s.addEventListener("dragleave",w=>{w.preventDefault(),s.classList.remove("drag-over")}),s.addEventListener("drop",async w=>{if(w.preventDefault(),s.classList.remove("drag-over"),w.dataTransfer.files&&w.dataTransfer.files.length>0){for(let x of w.dataTransfer.files){const R=await nc(x);Be.push({file:x,...R})}xn(a,c)}}),f.addEventListener("change",async w=>{if(w.target.files){for(let x of w.target.files){const R=await nc(x);Be.push({file:x,...R})}w.target.value="",xn(a,c)}}),window.addEventListener("paste",async w=>{if(e.style.display==="none")return;const x=(w.clipboardData||w.originalEvent.clipboardData).items;let R=!1;for(let N of x)if(N.type.indexOf("image")!==-1||N.type.indexOf("pdf")!==-1){R=!0;const O=N.getAsFile();if(O){const B=await nc(O);Be.push({file:O,...B}),xn(a,c),F("📋 Đã thêm vào hàng đợi ảnh/file.")}}const P=w.target;R&&(P.tagName==="INPUT"||P.tagName==="TEXTAREA")&&w.preventDefault()});const E=(w,x,R)=>{const P=new Set,N=[],O=["ngày ký","tháng ký","năm ký","số lượng gói","nơi ký","liên hệ a"],B=["ngayKy","ngayKy1","thangKy","thangKy1","namKy","namKy1","soLuongGoi","noiKy"];Object.entries(ve).forEach(([_,m])=>{const v=_.split(",").map(S=>S.trim());if(O.includes(m.toLowerCase())||v.every(S=>B.includes(S))){v.forEach(S=>P.add(S));return}let I="";for(const S of v)if(w[S]){I=w[S],P.add(S);break}N.push({key:_,value:I,label:m,checked:!!I})}),Object.keys(w).forEach(_=>{!P.has(_)&&!B.includes(_)&&w[_]&&N.push({key:_,value:w[_],label:_,checked:!0})}),N.every(_=>!_.value)&&F("⚠️ AI hoặc Regex không trích xuất được thông tin nào!","#ffc107"),D.lastPdfResults=N,D.lastPdfRawText=x||"",yf(N,x||"",_=>{_.forEach(m=>{ue(m.key,m.value,m.label)}),Ce(),F(`✅ Đã quét xong ${_.length} trường.`),D.lastPdfResults=D.lastPdfResults.map(m=>{const v=_.find(T=>T.key===m.key);return v?{...m,value:v.value,checked:!0}:{...m,checked:!1}})},_=>{try{const m=Ys(_);E(m,_,R),F("🔄 Đã cập nhật lại các trường từ text mới.")}catch(m){F("❌ Lỗi Cập nhật: "+m.message,"#ef4444")}});const K=document.querySelector("#vnpt-pdf-dialog h3");K&&(K.textContent=R)};r.addEventListener("click",()=>{const w=i.value.trim();if(!w){F("⚠️ Vui lòng nhập nội dung văn bản!","#ffc107");return}try{si("Trước khi phân loại Local: "+nf());const x=Ys(w);E(x,w,"PHÂN LOẠI DỮ LIỆU THÔ (LOCAL)")}catch(x){F("❌ Lỗi: "+x.message,"#f44336")}}),t.addEventListener("click",async()=>{const w=M.get(Vc),x=M.get(Oc)||"gemini-2.5-flash";if(!w){confirm(`Chưa cài đặt Gemini API Key!

AI Scanner yêu cầu mã Google AI Studio.

Nhấn 'OK' để xem hướng dẫn nhé!`)&&window.open("https://github.com/tranchien2000/vnpt-tampermonkey-vite/blob/main/docs/GEMINI_API_GUIDES.md","_blank");return}if(Be.length===0&&!i.value.trim()){F("⚠️ Hàng đợi trống. Vui lòng chọn file hoặc dán nội dung","#ffc107");return}i.classList.add("ai-scanning-glow"),t.disabled=!0,t.textContent="⏳ ĐANG QUÉT...";try{si("Trước khi AI Scan: "+nf());let R={},P="";if(Be.length>0){const N=await YE(null,w,x,null,Be);R=N.fields||{},P=N.rawTextSnippet||N.rawFullText||"",i.value.trim()?i.value+=`

--- KẾT QUẢ ĐỌC FILE ---
${P}`:i.value=P,M.set(Ln,i.value)}else{const N=i.value.trim();R=await ZE(N,w,x),P=N}E(R,P,"PHÂN LOẠI DỮ LIỆU THÔ (AI)"),Be.length>0&&(Be=[],xn(a,c))}catch(R){console.error("Lỗi AI Scan Pipeline:",R),alert(`Lỗi xử lý quét AI:
`+R)}finally{i.classList.remove("ai-scanning-glow"),t.disabled=!1,t.textContent="✨ BẮT ĐẦU QUÉT AI"}})}function t0(){}function dr(n,e=null){return M.get(n,e)}function Xs(n,e){M.set(n,e)}function wf(n,e){if(!e||e.replace(/\D/g,"").length<6)return;let t=dr(n,[]);t=t.filter(r=>r!==e),t.unshift(e),Xs(n,t.slice(0,10))}function Js(n,e){const t=document.getElementById(e);t&&(t.innerHTML=dr(n,[]).map(r=>`<option value="${r}">`).join(""))}function sc(n){return n.toLocaleString("en-US")}function oc(n){return Number(String(n).replace(/[^\d]/g,""))||0}function lT(n){return n.charAt(0).toUpperCase()+n.slice(1)}const li=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function uT(n){let e=Math.floor(n/100),t=Math.floor(n%100/10),r=n%10,i="";return e>0&&(i+=li[e]+" trăm ",t===0&&r>0&&(i+="lẻ ")),t>1?(i+=li[t]+" mươi ",r===1?i+="mốt":r===5?i+="lăm":r>0&&(i+=li[r])):t===1?(i+="mười ",r===5?i+="lăm":r>0&&(i+=li[r])):r>0&&(e>0&&(i+="lẻ "),i+=li[r]),i.trim()}function hT(n){if(n===0)return"không";const e=["","nghìn","triệu","tỷ"];let t="",r=0;for(;n>0;){const i=n%1e3;i>0&&(t=uT(i)+" "+e[r]+" "+t),n=Math.floor(n/1e3),r++}return t.trim()}function Ef(n,e,t){if(e===""||e===void 0||e===null)return{beforeNum:0,taxNum:0,afterNum:0,beforeStr:"",taxStr:"",afterStr:"",textStr:""};let r=0,i=0,s=0;n==="before"?(r=oc(e),i=t>0?Math.round(r*t):0,s=r+i):n==="tax"?(i=oc(e),r=t>0?Math.round(i/t):0,s=r+i):n==="after"&&(s=oc(e),r=t>0?Math.round(s/(1+t)):s,i=s-r);const a=lT(hT(s))+" đồng";return{beforeNum:r,taxNum:i,afterNum:s,beforeStr:sc(r),taxStr:sc(i),afterStr:sc(s),textStr:a}}function dT(n,e){e.before&&e.before.forEach(t=>ii(t,n.beforeStr)),e.tax&&e.tax.forEach(t=>ii(t,n.taxStr)),e.after&&e.after.forEach(t=>ii(t,n.afterStr)),e.text&&e.text.forEach(t=>ii(t,n.textStr))}function Zs(n,e=null){try{const t=localStorage.getItem(n);return t!==null?JSON.parse(t):e}catch{return e}}function It(n,e){localStorage.setItem(n,JSON.stringify(e))}function fT(n,e,t,r){let i=Zs(Dn)??"custom",s=Zs(dt)??{...Me},a=Zs(rn)??{},c=Zs(At)??{};const l=document.createElement("div");l.className="cw-tab-header";const u={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};u.custom.innerText="📋 Custom",u.custom.className="cw-tab cw-tab-custom",u.default.innerText="📌 Default",u.default.className="cw-tab cw-tab-default",u.sync.innerText="🔗 Sync",u.sync.className="cw-tab cw-tab-sync";function f(){Object.values(u).forEach(_=>_.classList.remove("active")),u[i].classList.add("active")}f();const p=document.createElement("div");p.style.display=r.data?"none":"block";const y=e("📋 Cấu hình Data","data",_=>{p.style.display=_?"none":"block",t(n)}),A=document.createElement("div");A.className="cw-data-body";function E(){A.innerHTML="";let _=i==="sync"?c:i==="custom"?a:s,m=i==="sync"?At:i==="custom"?rn:dt;const v=Object.keys(_);v.length===0&&i!=="default"&&(A.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),v.forEach(T=>{const I=document.createElement("div");I.className="cw-data-row";let S=i!=="default";const b=_[T],se=b&&typeof b=="object"&&b.hasOwnProperty("value"),lt=se?b.value:b,hi=se&&b.label||T,qe=document.createElement("input");qe.type="text",qe.value=hi,qe.id=`df-key-${T}`,qe.name=`df-key-${T}`,qe.className="cw-data-key"+(S?" mutable":""),qe.title=T,qe.readOnly=!S,S&&(qe.onchange=()=>{const Ne=qe.value.trim();if(!Ne||Ne===T){qe.value=hi;return}se?_[Ne]={...b,label:Ne}:_[Ne]=lt,delete _[T],It(m,_),E()});const Ue=document.createElement("input");if(Ue.type="text",Ue.value=lt??"",Ue.id=`df-val-${T}`,Ue.name=`df-val-${T}`,Ue.className="cw-data-val",Ue.oninput=()=>{se?_[T]={...b,value:Ue.value}:_[T]=Ue.value,It(m,_)},I.appendChild(qe),I.appendChild(Ue),S){const Ne=document.createElement("button");Ne.innerHTML="✕",Ne.className="cw-del-btn",Ne.onclick=()=>{confirm(`Delete "${hi}"?`)&&(delete _[T],It(m,_),E())},I.appendChild(Ne)}else I.appendChild(document.createElement("div")).className="cw-pad";A.appendChild(I)})}u.custom.onclick=()=>{i="custom",It(Dn,"custom"),f(),E()},u.default.onclick=()=>{i="default",It(Dn,"default"),f(),E()},u.sync.onclick=()=>{i="sync",It(Dn,"sync"),f(),E()};const w=document.createElement("button");w.innerText="📤",w.className="cw-icon-btn",w.title="Sao lưu toàn bộ dữ liệu ra JSON",w.onclick=()=>ef();const x=document.createElement("button");x.innerText="📥",x.className="cw-icon-btn",x.title="Khôi phục dữ liệu từ JSON";const R=document.createElement("input");R.type="file",R.accept=".json",R.style.display="none",R.onchange=async _=>{_.target.files.length>0&&await tf(_.target.files[0])&&setTimeout(()=>location.reload(),1500)},x.onclick=()=>R.click(),p.appendChild(l),l.appendChild(u.custom),l.appendChild(u.default),l.appendChild(u.sync),p.appendChild(A),n.appendChild(y),n.appendChild(p);const P=n.querySelector("#vnpt-cw-fill"),N=n.querySelector("#vnpt-cw-sync"),O=n.querySelector("#vnpt-cw-add"),B=n.querySelector("#vnpt-cw-reset");P&&(P.onclick=Xd),N&&(N.onclick=bE),O&&(O.onclick=()=>{i==="default"&&(i="custom",It(Dn,"custom"),f());let _=i==="sync"?c:a,m="new_field_"+Date.now();_[m]="",It(i==="sync"?At:rn,_),E(),A.scrollTop=A.scrollHeight}),B&&(B.onclick=()=>{confirm("Reset Default Data?")&&(s={...Me},It(dt,s),E())}),E();const K=y.querySelector(".cw-right-wrap")||document.createElement("div");K.className="cw-right-wrap",K.prepend(w),K.prepend(x),K.appendChild(R),y.appendChild(K)}function pT(n,e,t){let r=Number(localStorage.getItem(Nn))||Qd,i=dr(vr)??{calc:!1,data:!0};function s(w,x){const R=document.createElement("button");return R.innerText=w,R.className="cw-action-btn "+x,R}function a(w,x,R){const P=document.createElement("div");P.className="wg-sec-header";const N=document.createElement("span");N.innerText=w;const O=document.createElement("button");return O.className="wg-toggle-btn",O.innerText=i[x]?"▾":"▴",P.appendChild(N),P.appendChild(O),O.onclick=()=>{i[x]=!i[x],O.innerText=i[x]?"▾":"▴",Xs(vr,i),R(i[x])},P}function c(w){const x=window.innerWidth,R=window.innerHeight,P=w.getBoundingClientRect();w.style.left=Math.min(Math.max(parseFloat(w.style.left),0),x-P.width)+"px",w.style.top=Math.min(Math.max(parseFloat(w.style.top),0),R-36)+"px"}const l=document.createElement("div");if(!e){l.className="cw-title-bar",l.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const w=document.createElement("div");w.className="cw-btn-group";const x={fill:s("Fill","cw-btn-fill"),sync:s("Sync","cw-btn-sync"),add:s("Add","cw-btn-add"),reset:s("↺","cw-btn-reset")};x.sync.onclick=()=>{const R=p("before",f.before.value);y("before",R.beforeStr)},x.reset.title="Reset Default fields",Object.values(x).forEach(R=>w.appendChild(R)),l.appendChild(w),n.appendChild(l)}const u=document.createElement("div");u.className="cw-body-inline",u.innerHTML=`
    <div class="cw-inline-row">
        <input id="wg-before" name="wg-before" class="cw-input-inline" placeholder="Trước thuế" list="wg-before-list" title="Trước thuế">
        <datalist id="wg-before-list"></datalist>
        <div class="cw-tax-group-inline"><input id="wg-taxRate" name="wg-taxRate" class="cw-tax-input-inline" title="Thuế (%)"><span class="cw-tax-symbol">%</span></div>
        <input id="wg-tax" name="wg-tax" class="cw-input-inline" placeholder="Tiền thuế" title="Tiền thuế">
        <input id="wg-after" name="wg-after" class="cw-input-inline" placeholder="Sau thuế" list="wg-after-list" title="Sau thuế">
        <datalist id="wg-after-list"></datalist>
        <input id="wg-text" name="wg-text" class="cw-input-inline cw-input-readonly-inline" placeholder="Bằng chữ" readonly title="Bằng chữ">
        <button id="wg-sync-manual" class="cw-map-btn-inline" title="Đồng bộ kết quả lên trang web (🔄)">🔄</button>
    </div>`,e?e.appendChild(u):n.appendChild(u),e||fT(n,a,c,i);const f={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text")};f.taxRate.value=r*100,Js(Pi,"wg-before-list"),Js(Ni,"wg-after-list");function p(w,x){const R=Ef(w,x,r);return f.before.value=R.beforeStr,f.tax.value=R.taxStr,f.after.value=R.afterStr,f.text.value=R.textStr,R}function y(w,x){lr();const R=Ef(w,x,r),P=dr(St)||{...Ks};dT(R,P)}const A=cr((w,x)=>y(w,x),400);f.taxRate.oninput=()=>{r=Number(f.taxRate.value)/100||0,Xs(Nn,r),p("before",f.before.value),A("before",f.before.value)},f.taxRate.onchange=()=>{y("before",f.before.value)},f.before.oninput=()=>{p("before",f.before.value),A("before",f.before.value)},f.before.onchange=()=>{y("before",f.before.value),wf(Pi,f.before.value),Js(Pi,"wg-before-list")},f.tax.oninput=()=>{p("tax",f.tax.value),A("tax",f.tax.value)},f.tax.onchange=()=>{y("tax",f.tax.value)},f.after.oninput=()=>{p("after",f.after.value),A("after",f.after.value)},f.after.onchange=()=>{y("after",f.after.value),wf(Ni,f.after.value),Js(Ni,"wg-after-list")};const E=document.getElementById("wg-sync-manual");if(E&&(E.onclick=()=>{const w=p("before",f.before.value);y("before",w.beforeStr),E.style.transform="scale(1.2) rotate(360deg)",E.style.transition="all 0.4s",setTimeout(()=>{E.style.transform=""},400)}),[f.before,f.tax,f.after,f.text].forEach(w=>{["click","focus"].forEach(x=>w.addEventListener(x,()=>{if(!w.value)return;navigator.clipboard.writeText(w.value);const R=w.style.backgroundColor;w.style.backgroundColor="#d1e7dd",setTimeout(()=>w.style.backgroundColor=R,300)}))}),!e){const w=Array.from(n.children).filter(P=>P!==l),x=ff(n,[l],t,null,P=>{w.forEach(N=>N.style.display=P?"none":""),l.style.borderRadius=P?"8px":"0",P&&(n.style.top=window.innerHeight-(l.offsetHeight||34)+"px")}),R=dr(t);return R&&R.docked&&x.setDocked(!0),window.addEventListener("resize",()=>{x.isDocked()?n.style.top=window.innerHeight-l.offsetHeight+"px":c(n)}),x}return null}function gT(){const n=document.getElementById("vnpt-inline-calc"),e=document.getElementById("vnpt-btn-calc-toggle");let t=D.calcWidget||document.createElement("div");if(!n&&!D.calcWidget?(t.id="vnpt-calc-widget",document.body.appendChild(t),D.calcWidget=t):n&&(t=D.widget),n&&e){let r=dr(vr)??{calc:!1,data:!0};const i=s=>{n.style.display=s?"none":"block",e.classList.toggle("active",!s)};i(r.calc),e.onclick=()=>{r.calc=!r.calc,Xs(vr,r),i(r.calc)}}return pT(t,n,Lc)}function mT(){let n=!1;try{n=!1}catch{n=!1}n&&xt.info("[Migration] Dev mode active - Syncing configurations...");let e=M.get(dt);if(e){let r=!1;Object.keys(Me).forEach(i=>{const s=Me[i];if(!(i in e))e[i]=s,r=!0;else if(n){const a=e[i],c=s&&typeof s=="object",l=a&&typeof a=="object";let u=!1;!c&&!l?u=a!==s:c&&l?u=a.value!==s.value||a.label!==s.label:u=!0,u&&(e[i]=s,r=!0)}}),r&&M.set(dt,e)}let t=M.get(Ve);if(t){let r=!1;Object.keys(Me).forEach(i=>{const s=Me[i],a=s&&typeof s=="object"?s.value:s,c=s&&typeof s=="object"?s.label:ve[i]||"";if(!(i in t))t[i]={label:c,value:a,sync:""},r=!0;else if(n){const l=t[i];(l.value!==a||l.label!==c)&&(t[i]={label:c,value:a,sync:l.sync||""},r=!0)}}),r&&M.setDebounced(Ve,t,0)}}const Tf=["mail.google.com","outlook.live.com","outlook.office.com","outlook.office365.com"].some(n=>window.location.hostname.includes(n));let ui=null;async function ac(){if(!window.__vnptInited){window.__vnptInited=!0,xt.info("Initializing VNPT Userscript..."),mT();try{Fe.init(),Ap(),UE(),gT(),BE(),SE(),ai(),qE(),KE(),WE(),cT(),TE(),kE();const n=M.get("vnpt_last_run_version");n&&n!==Ct&&F(`🚀 Hợp đồng VNPT đã cập nhật lên v${Ct}!`,"#1a73e8"),M.set("vnpt_last_run_version",Ct),setTimeout(async()=>{sessionStorage.getItem("vnpt_update_skipped")||Fe.hasUpdate()&&(confirm(`[VNPT PRO] Đã có phiên bản mới v${Fe.info.latestVersion}.

Lời nhắn: ${Fe.info.message||"Không có mô tả."}

Bạn có muốn cập nhật ngay không?`)?Fe.info.updateUrl?window.open(Fe.info.updateUrl,"_blank"):F("Vui lòng click vào badge NEW để cập nhật!","#ea4335"):sessionStorage.setItem("vnpt_update_skipped","true"))},2e3);const e=cr(()=>{qd(),$d(),xt.debug("DOM Cache & Labels refreshed due to mutations")},1500);ui=new MutationObserver(t=>{t.some(i=>i.addedNodes.length>0||i.removedNodes.length>0?[...i.addedNodes,...i.removedNodes].some(a=>a.nodeType===1&&!["SCRIPT","STYLE","LINK"].includes(a.tagName)):!1)&&e()}),ui.observe(document.body,{childList:!0,subtree:!0}),xt.info("Userscript initialized successfully.")}catch(n){xt.error("Error during userscript initialization:",n)}}}function yT(){xt.info("Cleaning up VNPT Userscript for reload..."),ui&&(ui.disconnect(),ui=null);const n=document.getElementById("vnpt-docx-widget");n&&n.remove();const e=document.getElementById("vnpt-calc-widget");e&&e.remove();const t=document.getElementById("vnpt-styles");t&&t.remove(),window.__vnptInited=!1,xt.info("Cleanup completed.")}window.__vnptCleanup=yT,window.__vnptInit=ac,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{Tf?_f():ac()}):Tf?_f():ac();function vT(){const n=M.get(sn);if(!n||n.length===0){const e={id:"hanoi_default",name:"VNPT Hà Nội (Mặc định)",data:Me};M.set(sn,[e]),M.set(Di,"hanoi_default")}}function eo(){return M.get(sn)||[]}function cc(){return M.get(Di)}function lc(n){const t=eo().find(r=>r.id===n);return t?(M.set(Di,n),M.set(Ve,t.data),!0):!1}function _T(n){const e=eo(),t=M.get(Ve)||Me,r={id:"p_"+Date.now(),name:n,data:t};return e.push(r),M.set(sn,e),r.id}function bT(n){if(n==="hanoi_default")return!1;let e=eo();return e=e.filter(t=>t.id!==n),M.set(sn,e),cc()===n&&lc("hanoi_default"),!0}function wT(n){if(!Array.isArray(n))return;M.set(sn,n);const e=cc();n.find(t=>t.id===e)||lc("hanoi_default")}const If=Object.freeze(Object.defineProperty({__proto__:null,createProfileFromCurrent:_T,deleteProfile:bT,getActiveProfileId:cc,getProfiles:eo,importProfiles:wT,initProfiles:vT,switchProfile:lc},Symbol.toStringTag,{value:"Module"}))})();
