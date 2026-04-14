// ==UserScript==
// @name         VNPT Word Automation
// @namespace    http://tampermonkey.net/
// @version      1.6.18
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
(function(){"use strict";const xt={info:(...n)=>console.log("[Tampermonkey Script] INFO:",...n),error:(...n)=>console.error("[Tampermonkey Script] ERROR:",...n),warn:(...n)=>console.warn("[Tampermonkey Script] WARN:",...n)};function Cp(){const n="vnpt-styles";if(document.getElementById(n))return;const e=document.createElement("style");e.id=n,e.textContent=`
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
        .vnpt-fields-header .h-label { flex: 0.2; padding-left: 5px; }
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
        .vnpt-field-row input.f-label { flex: 0.2; color: #1a73e8; font-weight: 700; background: rgba(26,115,232,0.03); }
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

    `,document.head.appendChild(e)}const kp={widget:null,panel:null,header:null,bannerArea:null,toggleBtn:null,fieldsContainer:null,panelBody:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1,templateBuffer:null,templateName:null,hasDragged:!1},yr=new Map,D=new Proxy(kp,{get(n,e){return e==="on"?(t,r)=>{yr.has(t)||yr.set(t,[]),yr.get(t).push(r)}:n[e]},set(n,e,t){const r=n[e];return n[e]=t,r!==t&&yr.has(e)&&yr.get(e).forEach(i=>i(t,r)),!0}}),Rp={version:"1.6.20"},ve={"tenDaiDienn, tenNguoiNhanCTS, ten":"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ (Full)","cmnd, cccd":"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT","emailDaiDien, emailNhanCTS, email":"Email Nhận TK",soDkdn:"Mã số thuế | GPKD","tenToChuc, tencty":"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD","noiCapSoDkdn, coQuanCapId, noiCapIdNew":"Nơi cấp ĐKDN/QĐTL/GPTL",goiDV:"Gói Dịch Vụ","soHopDong, inputContractGroupName":"SỐ HỢP ĐỒNG","lienheHopDongA, lienheTuVanA, lienheHoaDonA, sucoCap1A, sucoCap2A, sucoCap3A, sucoCap4A":"Liên hệ A","ngayKy, ngayKy1":"Ngày ký","thangKy, thangKy1":"Tháng Ký","namKy, namKy1":"Năm ký","ngayTiepNhan, ngayThangNamKy":"Ngày tiếp nhận / Ngày tháng năm ký",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký",duong:"Số nhà, tên đường","xaIdNew, diaChiTruSoXaIdNew":"Quận/Huyện - Xã/Phường","tinhIdNew, tinhId, diaChiTruSoTinhIdNew":"Tỉnh/Thành phố"},vr=["soHopDong","tenDaiDienn","cmnd","sdt","diaChi","tenToChuc","ngayCapCustomer","emailDaiDien","soDkdn","goiDV","soHopDong"],We="vnpt_docx_fields",Ve="vnpt_docx_default_fields",ki="vnpt_docx_position",Ri="vnpt_docx_size",Pi="vnpt_docx_opened",Pn="vnpt_docx_auto_backup",dt="vnpt_autofill_data_default",rn="vnpt_autofill_data_custom",At="vnpt_autofill_data_sync",Oc="vnpt_widget_pos",Nn="vnd_tax_rate",Ni="vnd_before_history",Di="vnd_after_history",_r="vnpt_widget_collapsed",St="vnd_calc_map",Dn="vnpt_widget_datatab",br="vnpt_templates",Mc="vnpt_gemini_api_key",Fc="vnpt_gemini_model",wr="vnpt_hotkeys",sn="vnpt_docx_profiles",Li="vnpt_docx_active_profile_id",Ln="vnpt_raw_scan_text",Vn="vnpt_address_learning",Er={MST:/^\d{10}(-\d{3})?$/,PHONE:/^(0|\+84)[3|5|7|8|9]\d{8}$/,EMAIL:/^[^\s@]+@[^\s@]+\.[^\s@]+$/,ID_CARD:/^(\d{9}|\d{12})$/},Ct=Rp.version,On=Object.freeze(Object.defineProperty({__proto__:null,APP_VERSION:Ct,DEFAULT_LABELS:ve,LOCAL_KEY_ACTIVE_PROFILE_ID:Li,LOCAL_KEY_AUTO_BACKUP:Pn,LOCAL_KEY_DEFAULT_FIELDS:Ve,LOCAL_KEY_FIELDS:We,LOCAL_KEY_OPENED:Pi,LOCAL_KEY_POS:ki,LOCAL_KEY_PROFILES:sn,LOCAL_KEY_SIZE:Ri,REQUIRED_KEYS:vr,SK_ADDRESS_LEARNING:Vn,SK_CALC_MAP:St,SK_COLLAPSE:_r,SK_DATATAB:Dn,SK_DATA_CUS:rn,SK_DATA_DEF:dt,SK_DATA_SYNC:At,SK_GEMINI_KEY:Mc,SK_GEMINI_MODEL:Fc,SK_HIST_A:Di,SK_HIST_B:Ni,SK_HOTKEYS:wr,SK_POS_CALC:Oc,SK_RAW_SCAN:Ln,SK_TAX:Nn,SK_TEMPLATES:br,VALIDATION_REGEX:Er},Symbol.toStringTag,{value:"Module"}));let kt=null;function F(n,e="#198754",t=2500){kt||(kt=document.createElement("div"),kt.id="vnpt-toast-container",Object.assign(kt.style,{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column-reverse",alignItems:"center",gap:"8px",zIndex:"1000000",pointerEvents:"none"}),document.body.appendChild(kt));const r=document.createElement("div");r.innerText=n,Object.assign(r.style,{background:e,color:"#fff",padding:"8px 18px",borderRadius:"24px",opacity:"0",transform:"translateY(10px)",transition:"opacity 0.3s, transform 0.3s",fontSize:"13px",fontWeight:"500",fontFamily:"'Segoe UI', Roboto, sans-serif",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",whiteSpace:"nowrap",pointerEvents:"auto"}),kt.appendChild(r),requestAnimationFrame(()=>{r.style.opacity="1",r.style.transform="translateY(0)"}),setTimeout(()=>{r.style.opacity="0",r.style.transform="translateY(-10px)",setTimeout(()=>{r.remove(),kt&&kt.childNodes.length},300)},t)}const Pp="vnpt_templates_db",Rt="buffers";let Vi=null;function mo(){return Vi?Promise.resolve(Vi):new Promise((n,e)=>{const t=indexedDB.open(Pp,1);t.onupgradeneeded=r=>{const i=r.target.result;i.objectStoreNames.contains(Rt)||i.createObjectStore(Rt)},t.onsuccess=r=>{Vi=r.target.result,n(Vi)},t.onerror=()=>e(t.error)})}async function Np(n,e){const t=await mo();return new Promise((r,i)=>{const c=t.transaction(Rt,"readwrite").objectStore(Rt).put(e,n);c.onsuccess=()=>r(),c.onerror=()=>i(c.error)})}async function Dp(n){const e=await mo();return new Promise((t,r)=>{const a=e.transaction(Rt,"readonly").objectStore(Rt).get(n);a.onsuccess=()=>t(a.result),a.onerror=()=>r(a.error)})}async function Lp(n){const e=await mo();return new Promise((t,r)=>{const a=e.transaction(Rt,"readwrite").objectStore(Rt).delete(n);a.onsuccess=()=>t(),a.onerror=()=>r(a.error)})}const on=new Map,Oi=new Map,O={isGM:typeof GM_setValue<"u"&&typeof GM_getValue<"u",get(n,e=null){if(on.has(n))return on.get(n);try{let t;if(this.isGM?t=GM_getValue(n,null):t=localStorage.getItem(n),t==null)return e;let r;if(typeof t=="string")try{r=JSON.parse(t)}catch{r=t}else r=t;return on.set(n,r),r}catch(t){return console.warn(`[Storage] Không thể đọc key "${n}":`,t),e}},set(n,e){on.set(n,e);try{const t=JSON.stringify(e);return this.isGM?GM_setValue(n,t):localStorage.setItem(n,t),!0}catch(t){return console.error(`[Storage] Không thể ghi key "${n}":`,t),!1}},setDebounced(n,e,t=500){on.set(n,e),Oi.has(n)&&clearTimeout(Oi.get(n));const r=setTimeout(()=>{this.set(n,e),Oi.delete(n)},t);Oi.set(n,r)},remove(n){on.delete(n);try{this.isGM?GM_deleteValue(n):localStorage.removeItem(n)}catch(e){console.error(`[Storage] Không thể xóa key "${n}":`,e)}},clearCache(){on.clear()}},Mi=Object.freeze(Object.defineProperty({__proto__:null,Storage:O},Symbol.toStringTag,{value:"Module"})),Vp=()=>{};/**
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
 */const Uc=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let i=n.charCodeAt(r);i<128?e[t++]=i:i<2048?(e[t++]=i>>6|192,e[t++]=i&63|128):(i&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=i>>18|240,e[t++]=i>>12&63|128,e[t++]=i>>6&63|128,e[t++]=i&63|128):(e[t++]=i>>12|224,e[t++]=i>>6&63|128,e[t++]=i&63|128)}return e},Op=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const i=n[t++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){const s=n[t++];e[r++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=n[t++],a=n[t++],c=n[t++],l=((i&7)<<18|(s&63)<<12|(a&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(l>>10)),e[r++]=String.fromCharCode(56320+(l&1023))}else{const s=n[t++],a=n[t++];e[r++]=String.fromCharCode((i&15)<<12|(s&63)<<6|a&63)}}return e.join("")},Bc={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<n.length;i+=3){const s=n[i],a=i+1<n.length,c=a?n[i+1]:0,l=i+2<n.length,u=l?n[i+2]:0,f=s>>2,p=(s&3)<<4|c>>4;let w=(c&15)<<2|u>>6,A=u&63;l||(A=64,a||(w=64)),r.push(t[f],t[p],t[w],t[A])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(Uc(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):Op(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<n.length;){const s=t[n.charAt(i++)],c=i<n.length?t[n.charAt(i)]:0;++i;const u=i<n.length?t[n.charAt(i)]:64;++i;const p=i<n.length?t[n.charAt(i)]:64;if(++i,s==null||c==null||u==null||p==null)throw new Mp;const w=s<<2|c>>4;if(r.push(w),u!==64){const A=c<<4&240|u>>2;if(r.push(A),p!==64){const T=u<<6&192|p;r.push(T)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class Mp extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Fp=function(n){const e=Uc(n);return Bc.encodeByteArray(e,!0)},Fi=function(n){return Fp(n).replace(/\./g,"")},qc=function(n){try{return Bc.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function Up(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const Bp=()=>Up().__FIREBASE_DEFAULTS__,qp=()=>{if(typeof process>"u"||typeof process.env>"u")return;const n=process.env.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},$p=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&qc(n[1]);return e&&JSON.parse(e)},Ui=()=>{try{return Vp()||Bp()||qp()||$p()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},$c=n=>{var e,t;return(t=(e=Ui())==null?void 0:e.emulatorHosts)==null?void 0:t[n]},Hp=n=>{const e=$c(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},Hc=()=>{var n;return(n=Ui())==null?void 0:n.config},jc=n=>{var e;return(e=Ui())==null?void 0:e[`_${n}`]};/**
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
 */class jp{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
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
 */function zp(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",i=n.iat||0,s=n.sub||n.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a={iss:`https://securetoken.google.com/${r}`,aud:r,iat:i,exp:i+3600,auth_time:i,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}},...n};return[Fi(JSON.stringify(t)),Fi(JSON.stringify(a)),""].join(".")}/**
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
 */function Ie(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Kp(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Ie())}function Gp(){var e;const n=(e=Ui())==null?void 0:e.forceEnvironment;if(n==="node")return!0;if(n==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Wp(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Qp(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Yp(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Xp(){const n=Ie();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function Jp(){return!Gp()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Zp(){try{return typeof indexedDB=="object"}catch{return!1}}function eg(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},i.onupgradeneeded=()=>{t=!1},i.onerror=()=>{var s;e(((s=i.error)==null?void 0:s.message)||"")}}catch(t){e(t)}})}/**
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
 */const tg="FirebaseError";class ft extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=tg,Object.setPrototypeOf(this,ft.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Tr.prototype.create)}}class Tr{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},i=`${this.service}/${e}`,s=this.errors[e],a=s?ng(s,r):"Error",c=`${this.serviceName}: ${a} (${i}).`;return new ft(i,c,r)}}function ng(n,e){return n.replace(rg,(t,r)=>{const i=e[r];return i!=null?String(i):`<${r}?>`})}const rg=/\{\$([^}]+)}/g;function ig(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function an(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const i of t){if(!r.includes(i))return!1;const s=n[i],a=e[i];if(zc(s)&&zc(a)){if(!an(s,a))return!1}else if(s!==a)return!1}for(const i of r)if(!t.includes(i))return!1;return!0}function zc(n){return n!==null&&typeof n=="object"}/**
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
 */function Ir(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function xr(n){const e={};return n.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[i,s]=r.split("=");e[decodeURIComponent(i)]=decodeURIComponent(s)}}),e}function Ar(n){const e=n.indexOf("?");if(!e)return"";const t=n.indexOf("#",e);return n.substring(e,t>0?t:void 0)}function sg(n,e){const t=new og(n,e);return t.subscribe.bind(t)}class og{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let i;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");ag(e,["next","error","complete"])?i=e:i={next:e,error:t,complete:r},i.next===void 0&&(i.next=yo),i.error===void 0&&(i.error=yo),i.complete===void 0&&(i.complete=yo);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function ag(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function yo(){}/**
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
 */function Sr(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Kc(n){return(await fetch(n,{credentials:"include"})).ok}class cn{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */class cg{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new jp;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:t});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(e==null?void 0:e.optional)??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(i){if(r)return null;throw i}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(ug(e))try{this.getOrInitializeService({instanceIdentifier:ln})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(t);try{const s=this.getOrInitializeService({instanceIdentifier:i});r.resolve(s)}catch{}}}}clearInstance(e=ln){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=ln){return this.instances.has(e)}getOptions(e=ln){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[s,a]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(s);r===c&&a.resolve(i)}return i}onInit(e,t){const r=this.normalizeInstanceIdentifier(t),i=this.onInitCallbacks.get(r)??new Set;i.add(e),this.onInitCallbacks.set(r,i);const s=this.instances.get(r);return s&&e(s,r),()=>{i.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const i of r)try{i(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:lg(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=ln){return this.component?this.component.multipleInstances?e:ln:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function lg(n){return n===ln?void 0:n}function ug(n){return n.instantiationMode==="EAGER"}/**
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
 */class hg{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new cg(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var X;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(X||(X={}));const dg={debug:X.DEBUG,verbose:X.VERBOSE,info:X.INFO,warn:X.WARN,error:X.ERROR,silent:X.SILENT},fg=X.INFO,pg={[X.DEBUG]:"log",[X.VERBOSE]:"log",[X.INFO]:"info",[X.WARN]:"warn",[X.ERROR]:"error"},gg=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),i=pg[e];if(i)console[i](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class vo{constructor(e){this.name=e,this._logLevel=fg,this._logHandler=gg,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in X))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?dg[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,X.DEBUG,...e),this._logHandler(this,X.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,X.VERBOSE,...e),this._logHandler(this,X.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,X.INFO,...e),this._logHandler(this,X.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,X.WARN,...e),this._logHandler(this,X.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,X.ERROR,...e),this._logHandler(this,X.ERROR,...e)}}const mg=(n,e)=>e.some(t=>n instanceof t);let Gc,Wc;function yg(){return Gc||(Gc=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function vg(){return Wc||(Wc=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Qc=new WeakMap,_o=new WeakMap,Yc=new WeakMap,bo=new WeakMap,wo=new WeakMap;function _g(n){const e=new Promise((t,r)=>{const i=()=>{n.removeEventListener("success",s),n.removeEventListener("error",a)},s=()=>{t(Pt(n.result)),i()},a=()=>{r(n.error),i()};n.addEventListener("success",s),n.addEventListener("error",a)});return e.then(t=>{t instanceof IDBCursor&&Qc.set(t,n)}).catch(()=>{}),wo.set(e,n),e}function bg(n){if(_o.has(n))return;const e=new Promise((t,r)=>{const i=()=>{n.removeEventListener("complete",s),n.removeEventListener("error",a),n.removeEventListener("abort",a)},s=()=>{t(),i()},a=()=>{r(n.error||new DOMException("AbortError","AbortError")),i()};n.addEventListener("complete",s),n.addEventListener("error",a),n.addEventListener("abort",a)});_o.set(n,e)}let Eo={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return _o.get(n);if(e==="objectStoreNames")return n.objectStoreNames||Yc.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return Pt(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function wg(n){Eo=n(Eo)}function Eg(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const r=n.call(To(this),e,...t);return Yc.set(r,e.sort?e.sort():[e]),Pt(r)}:vg().includes(n)?function(...e){return n.apply(To(this),e),Pt(Qc.get(this))}:function(...e){return Pt(n.apply(To(this),e))}}function Tg(n){return typeof n=="function"?Eg(n):(n instanceof IDBTransaction&&bg(n),mg(n,yg())?new Proxy(n,Eo):n)}function Pt(n){if(n instanceof IDBRequest)return _g(n);if(bo.has(n))return bo.get(n);const e=Tg(n);return e!==n&&(bo.set(n,e),wo.set(e,n)),e}const To=n=>wo.get(n);function Ig(n,e,{blocked:t,upgrade:r,blocking:i,terminated:s}={}){const a=indexedDB.open(n,e),c=Pt(a);return r&&a.addEventListener("upgradeneeded",l=>{r(Pt(a.result),l.oldVersion,l.newVersion,Pt(a.transaction),l)}),t&&a.addEventListener("blocked",l=>t(l.oldVersion,l.newVersion,l)),c.then(l=>{s&&l.addEventListener("close",()=>s()),i&&l.addEventListener("versionchange",u=>i(u.oldVersion,u.newVersion,u))}).catch(()=>{}),c}const xg=["get","getKey","getAll","getAllKeys","count"],Ag=["put","add","delete","clear"],Io=new Map;function Xc(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(Io.get(e))return Io.get(e);const t=e.replace(/FromIndex$/,""),r=e!==t,i=Ag.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(i||xg.includes(t)))return;const s=async function(a,...c){const l=this.transaction(a,i?"readwrite":"readonly");let u=l.store;return r&&(u=u.index(c.shift())),(await Promise.all([u[t](...c),i&&l.done]))[0]};return Io.set(e,s),s}wg(n=>({...n,get:(e,t,r)=>Xc(e,t)||n.get(e,t,r),has:(e,t)=>!!Xc(e,t)||n.has(e,t)}));/**
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
 */class Sg{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(Cg(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function Cg(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const xo="@firebase/app",Jc="0.14.11";/**
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
 */const pt=new vo("@firebase/app"),kg="@firebase/app-compat",Rg="@firebase/analytics-compat",Pg="@firebase/analytics",Ng="@firebase/app-check-compat",Dg="@firebase/app-check",Lg="@firebase/auth",Vg="@firebase/auth-compat",Og="@firebase/database",Mg="@firebase/data-connect",Fg="@firebase/database-compat",Ug="@firebase/functions",Bg="@firebase/functions-compat",qg="@firebase/installations",$g="@firebase/installations-compat",Hg="@firebase/messaging",jg="@firebase/messaging-compat",zg="@firebase/performance",Kg="@firebase/performance-compat",Gg="@firebase/remote-config",Wg="@firebase/remote-config-compat",Qg="@firebase/storage",Yg="@firebase/storage-compat",Xg="@firebase/firestore",Jg="@firebase/ai",Zg="@firebase/firestore-compat",em="firebase",tm="12.12.0";/**
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
 */const Ao="[DEFAULT]",nm={[xo]:"fire-core",[kg]:"fire-core-compat",[Pg]:"fire-analytics",[Rg]:"fire-analytics-compat",[Dg]:"fire-app-check",[Ng]:"fire-app-check-compat",[Lg]:"fire-auth",[Vg]:"fire-auth-compat",[Og]:"fire-rtdb",[Mg]:"fire-data-connect",[Fg]:"fire-rtdb-compat",[Ug]:"fire-fn",[Bg]:"fire-fn-compat",[qg]:"fire-iid",[$g]:"fire-iid-compat",[Hg]:"fire-fcm",[jg]:"fire-fcm-compat",[zg]:"fire-perf",[Kg]:"fire-perf-compat",[Gg]:"fire-rc",[Wg]:"fire-rc-compat",[Qg]:"fire-gcs",[Yg]:"fire-gcs-compat",[Xg]:"fire-fst",[Zg]:"fire-fst-compat",[Jg]:"fire-vertex","fire-js":"fire-js",[em]:"fire-js-all"};/**
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
 */const Bi=new Map,rm=new Map,So=new Map;function Zc(n,e){try{n.container.addComponent(e)}catch(t){pt.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Mn(n){const e=n.name;if(So.has(e))return pt.debug(`There were multiple attempts to register component ${e}.`),!1;So.set(e,n);for(const t of Bi.values())Zc(t,n);for(const t of rm.values())Zc(t,n);return!0}function Co(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function He(n){return n==null?!1:n.settings!==void 0}/**
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
 */const im={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Nt=new Tr("app","Firebase",im);/**
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
 */class sm{constructor(e,t,r){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new cn("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Nt.create("app-deleted",{appName:this._name})}}/**
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
 */const Fn=tm;function el(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r={name:Ao,automaticDataCollectionEnabled:!0,...e},i=r.name;if(typeof i!="string"||!i)throw Nt.create("bad-app-name",{appName:String(i)});if(t||(t=Hc()),!t)throw Nt.create("no-options");const s=Bi.get(i);if(s){if(an(t,s.options)&&an(r,s.config))return s;throw Nt.create("duplicate-app",{appName:i})}const a=new hg(i);for(const l of So.values())a.addComponent(l);const c=new sm(t,r,a);return Bi.set(i,c),c}function tl(n=Ao){const e=Bi.get(n);if(!e&&n===Ao&&Hc())return el();if(!e)throw Nt.create("no-app",{appName:n});return e}function Dt(n,e,t){let r=nm[n]??n;t&&(r+=`-${t}`);const i=r.match(/\s|\//),s=e.match(/\s|\//);if(i||s){const a=[`Unable to register library "${r}" with version "${e}":`];i&&a.push(`library name "${r}" contains illegal characters (whitespace or "/")`),i&&s&&a.push("and"),s&&a.push(`version name "${e}" contains illegal characters (whitespace or "/")`),pt.warn(a.join(" "));return}Mn(new cn(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
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
 */const om="firebase-heartbeat-database",am=1,Cr="firebase-heartbeat-store";let ko=null;function nl(){return ko||(ko=Ig(om,am,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Cr)}catch(t){console.warn(t)}}}}).catch(n=>{throw Nt.create("idb-open",{originalErrorMessage:n.message})})),ko}async function cm(n){try{const t=(await nl()).transaction(Cr),r=await t.objectStore(Cr).get(il(n));return await t.done,r}catch(e){if(e instanceof ft)pt.warn(e.message);else{const t=Nt.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});pt.warn(t.message)}}}async function rl(n,e){try{const r=(await nl()).transaction(Cr,"readwrite");await r.objectStore(Cr).put(e,il(n)),await r.done}catch(t){if(t instanceof ft)pt.warn(t.message);else{const r=Nt.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});pt.warn(r.message)}}}function il(n){return`${n.name}!${n.options.appId}`}/**
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
 */const lm=1024,um=30;class hm{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new fm(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=sl();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(a=>a.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats.length>um){const a=pm(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(a,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){pt.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=sl(),{heartbeatsToSend:r,unsentEntries:i}=dm(this._heartbeatsCache.heartbeats),s=Fi(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(t){return pt.warn(t),""}}}function sl(){return new Date().toISOString().substring(0,10)}function dm(n,e=lm){const t=[];let r=n.slice();for(const i of n){const s=t.find(a=>a.agent===i.agent);if(s){if(s.dates.push(i.date),ol(t)>e){s.dates.pop();break}}else if(t.push({agent:i.agent,dates:[i.date]}),ol(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class fm{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Zp()?eg().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await cm(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return rl(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return rl(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function ol(n){return Fi(JSON.stringify({version:2,heartbeats:n})).length}function pm(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let r=1;r<n.length;r++)n[r].date<t&&(t=n[r].date,e=r);return e}/**
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
 */function gm(n){Mn(new cn("platform-logger",e=>new Sg(e),"PRIVATE")),Mn(new cn("heartbeat",e=>new hm(e),"PRIVATE")),Dt(xo,Jc,n),Dt(xo,Jc,"esm2020"),Dt("fire-js","")}gm("");var mm="firebase",ym="12.12.0";/**
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
 */Dt(mm,ym,"app");function al(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const vm=al,cl=new Tr("auth","Firebase",al());/**
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
 */const qi=new vo("@firebase/auth");function _m(n,...e){qi.logLevel<=X.WARN&&qi.warn(`Auth (${Fn}): ${n}`,...e)}function $i(n,...e){qi.logLevel<=X.ERROR&&qi.error(`Auth (${Fn}): ${n}`,...e)}/**
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
 */function Qe(n,...e){throw Ro(n,...e)}function tt(n,...e){return Ro(n,...e)}function ll(n,e,t){const r={...vm(),[e]:t};return new Tr("auth","Firebase",r).create(e,{appName:n.name})}function gt(n){return ll(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Ro(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return cl.create(n,...e)}function K(n,e,...t){if(!n)throw Ro(e,...t)}function mt(n){const e="INTERNAL ASSERTION FAILED: "+n;throw $i(e),new Error(e)}function yt(n,e){n||mt(e)}/**
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
 */function Po(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.href)||""}function bm(){return ul()==="http:"||ul()==="https:"}function ul(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.protocol)||null}/**
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
 */function wm(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(bm()||Qp()||"connection"in navigator)?navigator.onLine:!0}function Em(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
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
 */class kr{constructor(e,t){this.shortDelay=e,this.longDelay=t,yt(t>e,"Short delay should be less than long delay!"),this.isMobile=Kp()||Yp()}get(){return wm()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function No(n,e){yt(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
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
 */class hl{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;mt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;mt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;mt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const Tm={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const Im=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],xm=new kr(3e4,6e4);function Lt(n,e){return n.tenantId&&!e.tenantId?{...e,tenantId:n.tenantId}:e}async function Vt(n,e,t,r,i={}){return dl(n,i,async()=>{let s={},a={};r&&(e==="GET"?a=r:s={body:JSON.stringify(r)});const c=Ir({key:n.config.apiKey,...a}).slice(1),l=await n._getAdditionalHeaders();l["Content-Type"]="application/json",n.languageCode&&(l["X-Firebase-Locale"]=n.languageCode);const u={method:e,headers:l,...s};return Wp()||(u.referrerPolicy="no-referrer"),n.emulatorConfig&&Sr(n.emulatorConfig.host)&&(u.credentials="include"),hl.fetch()(await fl(n,n.config.apiHost,t,c),u)})}async function dl(n,e,t){n._canInitEmulator=!1;const r={...Tm,...e};try{const i=new Sm(n),s=await Promise.race([t(),i.promise]);i.clearNetworkTimeout();const a=await s.json();if("needConfirmation"in a)throw Hi(n,"account-exists-with-different-credential",a);if(s.ok&&!("errorMessage"in a))return a;{const c=s.ok?a.errorMessage:a.error.message,[l,u]=c.split(" : ");if(l==="FEDERATED_USER_ID_ALREADY_LINKED")throw Hi(n,"credential-already-in-use",a);if(l==="EMAIL_EXISTS")throw Hi(n,"email-already-in-use",a);if(l==="USER_DISABLED")throw Hi(n,"user-disabled",a);const f=r[l]||l.toLowerCase().replace(/[_\s]+/g,"-");if(u)throw ll(n,f,u);Qe(n,f)}}catch(i){if(i instanceof ft)throw i;Qe(n,"network-request-failed",{message:String(i)})}}async function Rr(n,e,t,r,i={}){const s=await Vt(n,e,t,r,i);return"mfaPendingCredential"in s&&Qe(n,"multi-factor-auth-required",{_serverResponse:s}),s}async function fl(n,e,t,r){const i=`${e}${t}?${r}`,s=n,a=s.config.emulator?No(n.config,i):`${n.config.apiScheme}://${i}`;return Im.includes(t)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(a).toString():a}function Am(n){switch(n){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class Sm{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(tt(this.auth,"network-request-failed")),xm.get())})}}function Hi(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const i=tt(n,e,r);return i.customData._tokenResponse=t,i}function pl(n){return n!==void 0&&n.enterprise!==void 0}class Cm{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return Am(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function km(n,e){return Vt(n,"GET","/v2/recaptchaConfig",Lt(n,e))}/**
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
 */async function Rm(n,e){return Vt(n,"POST","/v1/accounts:delete",e)}async function ji(n,e){return Vt(n,"POST","/v1/accounts:lookup",e)}/**
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
 */function Pr(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function Pm(n,e=!1){const t=Pe(n),r=await t.getIdToken(e),i=Lo(r);K(i&&i.exp&&i.auth_time&&i.iat,t.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,a=s==null?void 0:s.sign_in_provider;return{claims:i,token:r,authTime:Pr(Do(i.auth_time)),issuedAtTime:Pr(Do(i.iat)),expirationTime:Pr(Do(i.exp)),signInProvider:a||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function Do(n){return Number(n)*1e3}function Lo(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return $i("JWT malformed, contained fewer than 3 sections"),null;try{const i=qc(t);return i?JSON.parse(i):($i("Failed to decode base64 JWT payload"),null)}catch(i){return $i("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function gl(n){const e=Lo(n);return K(e,"internal-error"),K(typeof e.exp<"u","internal-error"),K(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function Nr(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof ft&&Nm(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function Nm({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
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
 */class Dm{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const r=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,r)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class Vo{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Pr(this.lastLoginAt),this.creationTime=Pr(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function zi(n){var p;const e=n.auth,t=await n.getIdToken(),r=await Nr(n,ji(e,{idToken:t}));K(r==null?void 0:r.users.length,e,"internal-error");const i=r.users[0];n._notifyReloadListener(i);const s=(p=i.providerUserInfo)!=null&&p.length?ml(i.providerUserInfo):[],a=Vm(n.providerData,s),c=n.isAnonymous,l=!(n.email&&i.passwordHash)&&!(a!=null&&a.length),u=c?l:!1,f={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:a,metadata:new Vo(i.createdAt,i.lastLoginAt),isAnonymous:u};Object.assign(n,f)}async function Lm(n){const e=Pe(n);await zi(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function Vm(n,e){return[...n.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function ml(n){return n.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
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
 */async function Om(n,e){const t=await dl(n,{},async()=>{const r=Ir({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=n.config,a=await fl(n,i,"/v1/token",`key=${s}`),c=await n._getAdditionalHeaders();c["Content-Type"]="application/x-www-form-urlencoded";const l={method:"POST",headers:c,body:r};return n.emulatorConfig&&Sr(n.emulatorConfig.host)&&(l.credentials="include"),hl.fetch()(a,l)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function Mm(n,e){return Vt(n,"POST","/v2/accounts:revokeToken",Lt(n,e))}/**
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
 */class Un{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){K(e.idToken,"internal-error"),K(typeof e.idToken<"u","internal-error"),K(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):gl(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){K(e.length!==0,"internal-error");const t=gl(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(K(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:i,expiresIn:s}=await Om(e,t);this.updateTokensAndExpiration(r,i,Number(s))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:i,expirationTime:s}=t,a=new Un;return r&&(K(typeof r=="string","internal-error",{appName:e}),a.refreshToken=r),i&&(K(typeof i=="string","internal-error",{appName:e}),a.accessToken=i),s&&(K(typeof s=="number","internal-error",{appName:e}),a.expirationTime=s),a}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Un,this.toJSON())}_performRefresh(){return mt("not implemented")}}/**
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
 */function Ot(n,e){K(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class Ye{constructor({uid:e,auth:t,stsTokenManager:r,...i}){this.providerId="firebase",this.proactiveRefresh=new Dm(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new Vo(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const t=await Nr(this,this.stsTokenManager.getToken(this.auth,e));return K(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return Pm(this,e)}reload(){return Lm(this)}_assign(e){this!==e&&(K(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new Ye({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){K(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await zi(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(He(this.auth.app))return Promise.reject(gt(this.auth));const e=await this.getIdToken();return await Nr(this,Rm(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const r=t.displayName??void 0,i=t.email??void 0,s=t.phoneNumber??void 0,a=t.photoURL??void 0,c=t.tenantId??void 0,l=t._redirectEventId??void 0,u=t.createdAt??void 0,f=t.lastLoginAt??void 0,{uid:p,emailVerified:w,isAnonymous:A,providerData:T,stsTokenManager:v}=t;K(p&&v,e,"internal-error");const x=Un.fromJSON(this.name,v);K(typeof p=="string",e,"internal-error"),Ot(r,e.name),Ot(i,e.name),K(typeof w=="boolean",e,"internal-error"),K(typeof A=="boolean",e,"internal-error"),Ot(s,e.name),Ot(a,e.name),Ot(c,e.name),Ot(l,e.name),Ot(u,e.name),Ot(f,e.name);const k=new Ye({uid:p,auth:e,email:i,emailVerified:w,displayName:r,isAnonymous:A,photoURL:a,phoneNumber:s,tenantId:c,stsTokenManager:x,createdAt:u,lastLoginAt:f});return T&&Array.isArray(T)&&(k.providerData=T.map(P=>({...P}))),l&&(k._redirectEventId=l),k}static async _fromIdTokenResponse(e,t,r=!1){const i=new Un;i.updateFromServerResponse(t);const s=new Ye({uid:t.localId,auth:e,stsTokenManager:i,isAnonymous:r});return await zi(s),s}static async _fromGetAccountInfoResponse(e,t,r){const i=t.users[0];K(i.localId!==void 0,"internal-error");const s=i.providerUserInfo!==void 0?ml(i.providerUserInfo):[],a=!(i.email&&i.passwordHash)&&!(s!=null&&s.length),c=new Un;c.updateFromIdToken(r);const l=new Ye({uid:i.localId,auth:e,stsTokenManager:c,isAnonymous:a}),u={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new Vo(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(s!=null&&s.length)};return Object.assign(l,u),l}}/**
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
 */const yl=new Map;function vt(n){yt(n instanceof Function,"Expected a class definition");let e=yl.get(n);return e?(yt(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,yl.set(n,e),e)}/**
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
 */class vl{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}vl.type="NONE";const _l=vl;/**
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
 */function Ki(n,e,t){return`firebase:${n}:${e}:${t}`}class Bn{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:i,name:s}=this.auth;this.fullUserKey=Ki(this.userKey,i.apiKey,s),this.fullPersistenceKey=Ki("persistence",i.apiKey,s),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await ji(this.auth,{idToken:e}).catch(()=>{});return t?Ye._fromGetAccountInfoResponse(this.auth,t,e):null}return Ye._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new Bn(vt(_l),e,r);const i=(await Promise.all(t.map(async u=>{if(await u._isAvailable())return u}))).filter(u=>u);let s=i[0]||vt(_l);const a=Ki(r,e.config.apiKey,e.name);let c=null;for(const u of t)try{const f=await u._get(a);if(f){let p;if(typeof f=="string"){const w=await ji(e,{idToken:f}).catch(()=>{});if(!w)break;p=await Ye._fromGetAccountInfoResponse(e,w,f)}else p=Ye._fromJSON(e,f);u!==s&&(c=p),s=u;break}}catch{}const l=i.filter(u=>u._shouldAllowMigration);return!s._shouldAllowMigration||!l.length?new Bn(s,e,r):(s=l[0],c&&await s._set(a,c.toJSON()),await Promise.all(t.map(async u=>{if(u!==s)try{await u._remove(a)}catch{}})),new Bn(s,e,r))}}/**
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
 */function bl(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Il(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(wl(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Al(e))return"Blackberry";if(Sl(e))return"Webos";if(El(e))return"Safari";if((e.includes("chrome/")||Tl(e))&&!e.includes("edge/"))return"Chrome";if(xl(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function wl(n=Ie()){return/firefox\//i.test(n)}function El(n=Ie()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Tl(n=Ie()){return/crios\//i.test(n)}function Il(n=Ie()){return/iemobile/i.test(n)}function xl(n=Ie()){return/android/i.test(n)}function Al(n=Ie()){return/blackberry/i.test(n)}function Sl(n=Ie()){return/webos/i.test(n)}function Oo(n=Ie()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function Fm(n=Ie()){var e;return Oo(n)&&!!((e=window.navigator)!=null&&e.standalone)}function Um(){return Xp()&&document.documentMode===10}function Cl(n=Ie()){return Oo(n)||xl(n)||Sl(n)||Al(n)||/windows phone/i.test(n)||Il(n)}/**
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
 */function kl(n,e=[]){let t;switch(n){case"Browser":t=bl(Ie());break;case"Worker":t=`${bl(Ie())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${Fn}/${r}`}/**
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
 */class Bm{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=s=>new Promise((a,c)=>{try{const l=e(s);a(l)}catch(l){c(l)}});r.onAbort=t,this.queue.push(r);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const i of t)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
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
 */async function qm(n,e={}){return Vt(n,"GET","/v2/passwordPolicy",Lt(n,e))}/**
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
 */const $m=6;class Hm{constructor(e){var r;const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??$m,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((r=e.allowedNonAlphanumericCharacters)==null?void 0:r.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),i&&(t.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let i=0;i<e.length;i++)r=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
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
 */class jm{constructor(e,t,r,i){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Rl(this),this.idTokenSubscription=new Rl(this),this.beforeStateQueue=new Bm(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=cl,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=vt(t)),this._initializationPromise=this.queue(async()=>{var r,i,s;if(!this._deleted&&(this.persistenceManager=await Bn.create(this,e),(r=this._resolvePersistenceManagerAvailable)==null||r.call(this),!this._deleted)){if((i=this._popupRedirectResolver)!=null&&i._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((s=this.currentUser)==null?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await ji(this,{idToken:e}),r=await Ye._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var s;if(He(this.app)){const a=this.app.settings.authIdToken;return a?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(a).then(c,c))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let r=t,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const a=(s=this.redirectUser)==null?void 0:s._redirectEventId,c=r==null?void 0:r._redirectEventId,l=await this.tryRedirectSignIn(e);(!a||a===c)&&(l!=null&&l.user)&&(r=l.user,i=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(r)}catch(a){r=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(a))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return K(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await zi(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=Em()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(He(this.app))return Promise.reject(gt(this));const t=e?Pe(e):null;return t&&K(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&K(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return He(this.app)?Promise.reject(gt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return He(this.app)?Promise.reject(gt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(vt(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await qm(this),t=new Hm(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Tr("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await Mm(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&vt(e)||this._popupRedirectResolver;K(t,this,"argument-error"),this.redirectPersistenceManager=await Bn.create(this,[vt(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)==null?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)==null?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((t=this.currentUser)==null?void 0:t.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,i){if(this._deleted)return()=>{};const s=typeof t=="function"?t:t.next.bind(t);let a=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(K(c,this,"internal-error"),c.then(()=>{a||s(this.currentUser)}),typeof t=="function"){const l=e.addObserver(t,r,i);return()=>{a=!0,l()}}else{const l=e.addObserver(t);return()=>{a=!0,l()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return K(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=kl(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var i;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await((i=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:i.getHeartbeatsHeader());t&&(e["X-Firebase-Client"]=t);const r=await this._getAppCheckToken();return r&&(e["X-Firebase-AppCheck"]=r),e}async _getAppCheckToken(){var t;if(He(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((t=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:t.getToken());return e!=null&&e.error&&_m(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function un(n){return Pe(n)}class Rl{constructor(e){this.auth=e,this.observer=null,this.addObserver=sg(t=>this.observer=t)}get next(){return K(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let Gi={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function zm(n){Gi=n}function Pl(n){return Gi.loadJS(n)}function Km(){return Gi.recaptchaEnterpriseScript}function Gm(){return Gi.gapiScript}function Wm(n){return`__${n}${Math.floor(Math.random()*1e6)}`}class Qm{constructor(){this.enterprise=new Ym}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class Ym{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}const Xm="recaptcha-enterprise",Nl="NO_RECAPTCHA";class Jm{constructor(e){this.type=Xm,this.auth=un(e)}async verify(e="verify",t=!1){async function r(s){if(!t){if(s.tenantId==null&&s._agentRecaptchaConfig!=null)return s._agentRecaptchaConfig.siteKey;if(s.tenantId!=null&&s._tenantRecaptchaConfigs[s.tenantId]!==void 0)return s._tenantRecaptchaConfigs[s.tenantId].siteKey}return new Promise(async(a,c)=>{km(s,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(l=>{if(l.recaptchaKey===void 0)c(new Error("recaptcha Enterprise site key undefined"));else{const u=new Cm(l);return s.tenantId==null?s._agentRecaptchaConfig=u:s._tenantRecaptchaConfigs[s.tenantId]=u,a(u.siteKey)}}).catch(l=>{c(l)})})}function i(s,a,c){const l=window.grecaptcha;pl(l)?l.enterprise.ready(()=>{l.enterprise.execute(s,{action:e}).then(u=>{a(u)}).catch(()=>{a(Nl)})}):c(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new Qm().execute("siteKey",{action:"verify"}):new Promise((s,a)=>{r(this.auth).then(c=>{if(!t&&pl(window.grecaptcha))i(c,s,a);else{if(typeof window>"u"){a(new Error("RecaptchaVerifier is only supported in browser"));return}let l=Km();l.length!==0&&(l+=c),Pl(l).then(()=>{i(c,s,a)}).catch(u=>{a(u)})}}).catch(c=>{a(c)})})}}async function Dl(n,e,t,r=!1,i=!1){const s=new Jm(n);let a;if(i)a=Nl;else try{a=await s.verify(t)}catch{a=await s.verify(t,!0)}const c={...e};if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in c){const l=c.phoneEnrollmentInfo.phoneNumber,u=c.phoneEnrollmentInfo.recaptchaToken;Object.assign(c,{phoneEnrollmentInfo:{phoneNumber:l,recaptchaToken:u,captchaResponse:a,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in c){const l=c.phoneSignInInfo.recaptchaToken;Object.assign(c,{phoneSignInInfo:{recaptchaToken:l,captchaResponse:a,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return c}return r?Object.assign(c,{captchaResp:a}):Object.assign(c,{captchaResponse:a}),Object.assign(c,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(c,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),c}async function Mo(n,e,t,r,i){var s;if((s=n._getRecaptchaConfig())!=null&&s.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const a=await Dl(n,e,t,t==="getOobCode");return r(n,a)}else return r(n,e).catch(async a=>{if(a.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const c=await Dl(n,e,t,t==="getOobCode");return r(n,c)}else return Promise.reject(a)})}/**
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
 */function Zm(n,e){const t=Co(n,"auth");if(t.isInitialized()){const i=t.getImmediate(),s=t.getOptions();if(an(s,e??{}))return i;Qe(i,"already-initialized")}return t.initialize({options:e})}function ey(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(vt);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function ty(n,e,t){const r=un(n);K(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const i=!1,s=Ll(e),{host:a,port:c}=ny(e),l=c===null?"":`:${c}`,u={url:`${s}//${a}${l}/`},f=Object.freeze({host:a,port:c,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:i})});if(!r._canInitEmulator){K(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),K(an(u,r.config.emulator)&&an(f,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=u,r.emulatorConfig=f,r.settings.appVerificationDisabledForTesting=!0,Sr(a)?Kc(`${s}//${a}${l}`):ry()}function Ll(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function ny(n){const e=Ll(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(r);if(i){const s=i[1];return{host:s,port:Vl(r.substr(s.length+1))}}else{const[s,a]=r.split(":");return{host:s,port:Vl(a)}}}function Vl(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function ry(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
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
 */class Fo{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return mt("not implemented")}_getIdTokenResponse(e){return mt("not implemented")}_linkToIdToken(e,t){return mt("not implemented")}_getReauthenticationResolver(e){return mt("not implemented")}}async function iy(n,e){return Vt(n,"POST","/v1/accounts:signUp",e)}/**
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
 */async function sy(n,e){return Rr(n,"POST","/v1/accounts:signInWithPassword",Lt(n,e))}/**
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
 */async function oy(n,e){return Rr(n,"POST","/v1/accounts:signInWithEmailLink",Lt(n,e))}async function ay(n,e){return Rr(n,"POST","/v1/accounts:signInWithEmailLink",Lt(n,e))}/**
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
 */class Dr extends Fo{constructor(e,t,r,i=null){super("password",r),this._email=e,this._password=t,this._tenantId=i}static _fromEmailAndPassword(e,t){return new Dr(e,t,"password")}static _fromEmailAndCode(e,t,r=null){return new Dr(e,t,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Mo(e,t,"signInWithPassword",sy);case"emailLink":return oy(e,{email:this._email,oobCode:this._password});default:Qe(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const r={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Mo(e,r,"signUpPassword",iy);case"emailLink":return ay(e,{idToken:t,email:this._email,oobCode:this._password});default:Qe(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
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
 */async function qn(n,e){return Rr(n,"POST","/v1/accounts:signInWithIdp",Lt(n,e))}/**
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
 */const cy="http://localhost";class hn extends Fo{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new hn(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):Qe("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i,...s}=t;if(!r||!i)return null;const a=new hn(r,i);return a.idToken=s.idToken||void 0,a.accessToken=s.accessToken||void 0,a.secret=s.secret,a.nonce=s.nonce,a.pendingToken=s.pendingToken||null,a}_getIdTokenResponse(e){const t=this.buildRequest();return qn(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,qn(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,qn(e,t)}buildRequest(){const e={requestUri:cy,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=Ir(t)}return e}}/**
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
 */function ly(n){switch(n){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function uy(n){const e=xr(Ar(n)).link,t=e?xr(Ar(e)).deep_link_id:null,r=xr(Ar(n)).deep_link_id;return(r?xr(Ar(r)).link:null)||r||t||e||n}class Uo{constructor(e){const t=xr(Ar(e)),r=t.apiKey??null,i=t.oobCode??null,s=ly(t.mode??null);K(r&&i&&s,"argument-error"),this.apiKey=r,this.operation=s,this.code=i,this.continueUrl=t.continueUrl??null,this.languageCode=t.lang??null,this.tenantId=t.tenantId??null}static parseLink(e){const t=uy(e);try{return new Uo(t)}catch{return null}}}/**
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
 */class $n{constructor(){this.providerId=$n.PROVIDER_ID}static credential(e,t){return Dr._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const r=Uo.parseLink(t);return K(r,"argument-error"),Dr._fromEmailAndCode(e,r.code,r.tenantId)}}$n.PROVIDER_ID="password",$n.EMAIL_PASSWORD_SIGN_IN_METHOD="password",$n.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
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
 */class Ol{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class Lr extends Ol{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
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
 */class Mt extends Lr{constructor(){super("facebook.com")}static credential(e){return hn._fromParams({providerId:Mt.PROVIDER_ID,signInMethod:Mt.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Mt.credentialFromTaggedObject(e)}static credentialFromError(e){return Mt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Mt.credential(e.oauthAccessToken)}catch{return null}}}Mt.FACEBOOK_SIGN_IN_METHOD="facebook.com",Mt.PROVIDER_ID="facebook.com";/**
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
 */class Ft extends Lr{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return hn._fromParams({providerId:Ft.PROVIDER_ID,signInMethod:Ft.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return Ft.credentialFromTaggedObject(e)}static credentialFromError(e){return Ft.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return Ft.credential(t,r)}catch{return null}}}Ft.GOOGLE_SIGN_IN_METHOD="google.com",Ft.PROVIDER_ID="google.com";/**
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
 */class Ut extends Lr{constructor(){super("github.com")}static credential(e){return hn._fromParams({providerId:Ut.PROVIDER_ID,signInMethod:Ut.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Ut.credentialFromTaggedObject(e)}static credentialFromError(e){return Ut.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Ut.credential(e.oauthAccessToken)}catch{return null}}}Ut.GITHUB_SIGN_IN_METHOD="github.com",Ut.PROVIDER_ID="github.com";/**
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
 */class Bt extends Lr{constructor(){super("twitter.com")}static credential(e,t){return hn._fromParams({providerId:Bt.PROVIDER_ID,signInMethod:Bt.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return Bt.credentialFromTaggedObject(e)}static credentialFromError(e){return Bt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return Bt.credential(t,r)}catch{return null}}}Bt.TWITTER_SIGN_IN_METHOD="twitter.com",Bt.PROVIDER_ID="twitter.com";/**
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
 */async function hy(n,e){return Rr(n,"POST","/v1/accounts:signUp",Lt(n,e))}/**
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
 */class dn{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,i=!1){const s=await Ye._fromIdTokenResponse(e,r,i),a=Ml(r);return new dn({user:s,providerId:a,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const i=Ml(r);return new dn({user:e,providerId:i,_tokenResponse:r,operationType:t})}}function Ml(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
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
 */class Wi extends ft{constructor(e,t,r,i){super(t.code,t.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,Wi.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,i){return new Wi(e,t,r,i)}}function Fl(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?Wi._fromErrorAndOperation(n,s,e,r):s})}async function dy(n,e,t=!1){const r=await Nr(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return dn._forOperation(n,"link",r)}/**
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
 */async function fy(n,e,t=!1){const{auth:r}=n;if(He(r.app))return Promise.reject(gt(r));const i="reauthenticate";try{const s=await Nr(n,Fl(r,i,e,n),t);K(s.idToken,r,"internal-error");const a=Lo(s.idToken);K(a,r,"internal-error");const{sub:c}=a;return K(n.uid===c,r,"user-mismatch"),dn._forOperation(n,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&Qe(r,"user-mismatch"),s}}/**
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
 */async function Ul(n,e,t=!1){if(He(n.app))return Promise.reject(gt(n));const r="signIn",i=await Fl(n,r,e),s=await dn._fromIdTokenResponse(n,r,i);return t||await n._updateCurrentUser(s.user),s}async function py(n,e){return Ul(un(n),e)}/**
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
 */async function Bl(n){const e=un(n);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function gy(n,e,t){if(He(n.app))return Promise.reject(gt(n));const r=un(n),a=await Mo(r,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",hy).catch(l=>{throw l.code==="auth/password-does-not-meet-requirements"&&Bl(n),l}),c=await dn._fromIdTokenResponse(r,"signIn",a);return await r._updateCurrentUser(c.user),c}function my(n,e,t){return He(n.app)?Promise.reject(gt(n)):py(Pe(n),$n.credential(e,t)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&Bl(n),r})}function yy(n,e,t,r){return Pe(n).onIdTokenChanged(e,t,r)}function vy(n,e,t){return Pe(n).beforeAuthStateChanged(e,t)}function _y(n,e,t,r){return Pe(n).onAuthStateChanged(e,t,r)}function by(n){return Pe(n).signOut()}const Qi="__sak";/**
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
 */class ql{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Qi,"1"),this.storage.removeItem(Qi),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const wy=1e3,Ey=10;class $l extends ql{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Cl(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),i=this.localCache[t];r!==i&&e(t,i,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((a,c,l)=>{this.notifyListeners(a,l)});return}const r=e.key;t?this.detachListener():this.stopPolling();const i=()=>{const a=this.storage.getItem(r);!t&&this.localCache[r]===a||this.notifyListeners(r,a)},s=this.storage.getItem(r);Um()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,Ey):i()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},wy)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}$l.type="LOCAL";const Ty=$l;/**
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
 */class Hl extends ql{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}Hl.type="SESSION";const jl=Hl;/**
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
 */function Iy(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
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
 */class Yi{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(i=>i.isListeningto(e));if(t)return t;const r=new Yi(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:i,data:s}=t.data,a=this.handlersMap[i];if(!(a!=null&&a.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:i});const c=Array.from(a).map(async u=>u(t.origin,s)),l=await Iy(c);t.ports[0].postMessage({status:"done",eventId:r,eventType:i,response:l})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Yi.receivers=[];/**
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
 */function Bo(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
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
 */class xy{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,a;return new Promise((c,l)=>{const u=Bo("",20);i.port1.start();const f=setTimeout(()=>{l(new Error("unsupported_event"))},r);a={messageChannel:i,onMessage(p){const w=p;if(w.data.eventId===u)switch(w.data.status){case"ack":clearTimeout(f),s=setTimeout(()=>{l(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),c(w.data.response);break;default:clearTimeout(f),clearTimeout(s),l(new Error("invalid_response"));break}}},this.handlers.add(a),i.port1.addEventListener("message",a.onMessage),this.target.postMessage({eventType:e,eventId:u,data:t},[i.port2])}).finally(()=>{a&&this.removeMessageHandler(a)})}}/**
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
 */function nt(){return window}function Ay(n){nt().location.href=n}/**
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
 */function zl(){return typeof nt().WorkerGlobalScope<"u"&&typeof nt().importScripts=="function"}async function Sy(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function Cy(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)==null?void 0:n.controller)||null}function ky(){return zl()?self:null}/**
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
 */const Kl="firebaseLocalStorageDb",Ry=1,Xi="firebaseLocalStorage",Gl="fbase_key";class Vr{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function Ji(n,e){return n.transaction([Xi],e?"readwrite":"readonly").objectStore(Xi)}function Py(){const n=indexedDB.deleteDatabase(Kl);return new Vr(n).toPromise()}function qo(){const n=indexedDB.open(Kl,Ry);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(Xi,{keyPath:Gl})}catch(i){t(i)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(Xi)?e(r):(r.close(),await Py(),e(await qo()))})})}async function Wl(n,e,t){const r=Ji(n,!0).put({[Gl]:e,value:t});return new Vr(r).toPromise()}async function Ny(n,e){const t=Ji(n,!1).get(e),r=await new Vr(t).toPromise();return r===void 0?null:r.value}function Ql(n,e){const t=Ji(n,!0).delete(e);return new Vr(t).toPromise()}const Dy=800,Ly=3;class Yl{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await qo(),this.db)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>Ly)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return zl()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Yi._getInstance(ky()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var t,r;if(this.activeServiceWorker=await Sy(),!this.activeServiceWorker)return;this.sender=new xy(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(t=e[0])!=null&&t.fulfilled&&(r=e[0])!=null&&r.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||Cy()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await qo();return await Wl(e,Qi,"1"),await Ql(e,Qi),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>Wl(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>Ny(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Ql(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(i=>{const s=Ji(i,!1).getAll();return new Vr(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:i,value:s}of e)r.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),t.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!r.has(i)&&(this.notifyListeners(i,null),t.push(i));return t}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),Dy)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}Yl.type="LOCAL";const Vy=Yl;new kr(3e4,6e4);/**
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
 */function Oy(n,e){return e?vt(e):(K(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
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
 */class $o extends Fo{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return qn(e,this._buildIdpRequest())}_linkToIdToken(e,t){return qn(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return qn(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function My(n){return Ul(n.auth,new $o(n),n.bypassAuthState)}function Fy(n){const{auth:e,user:t}=n;return K(t,e,"internal-error"),fy(t,new $o(n),n.bypassAuthState)}async function Uy(n){const{auth:e,user:t}=n;return K(t,e,"internal-error"),dy(t,new $o(n),n.bypassAuthState)}/**
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
 */class Xl{constructor(e,t,r,i,s=!1){this.auth=e,this.resolver=r,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:i,tenantId:s,error:a,type:c}=e;if(a){this.reject(a);return}const l={auth:this.auth,requestUri:t,sessionId:r,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(l))}catch(u){this.reject(u)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return My;case"linkViaPopup":case"linkViaRedirect":return Uy;case"reauthViaPopup":case"reauthViaRedirect":return Fy;default:Qe(this.auth,"internal-error")}}resolve(e){yt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){yt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const By=new kr(2e3,1e4);class Hn extends Xl{constructor(e,t,r,i,s){super(e,t,i,s),this.provider=r,this.authWindow=null,this.pollId=null,Hn.currentPopupAction&&Hn.currentPopupAction.cancel(),Hn.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return K(e,this.auth,"internal-error"),e}async onExecution(){yt(this.filter.length===1,"Popup operations only handle one event");const e=Bo();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(tt(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(tt(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Hn.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if((r=(t=this.authWindow)==null?void 0:t.window)!=null&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(tt(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,By.get())};e()}}Hn.currentPopupAction=null;/**
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
 */const qy="pendingRedirect",Zi=new Map;class $y extends Xl{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=Zi.get(this.auth._key());if(!e){try{const r=await Hy(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}Zi.set(this.auth._key(),e)}return this.bypassAuthState||Zi.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function Hy(n,e){const t=Ky(e),r=zy(n);if(!await r._isAvailable())return!1;const i=await r._get(t)==="true";return await r._remove(t),i}function jy(n,e){Zi.set(n._key(),e)}function zy(n){return vt(n._redirectPersistence)}function Ky(n){return Ki(qy,n.config.apiKey,n.name)}async function Gy(n,e,t=!1){if(He(n.app))return Promise.reject(gt(n));const r=un(n),i=Oy(r,e),a=await new $y(r,i,t).execute();return a&&!t&&(delete a.user._redirectEventId,await r._persistUserIfCurrent(a.user),await r._setRedirectUser(null,e)),a}/**
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
 */const Wy=10*60*1e3;class Qy{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!Yy(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!Zl(e)){const i=((r=e.error.code)==null?void 0:r.split("auth/")[1])||"internal-error";t.onError(tt(this.auth,i))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=Wy&&this.cachedEventUids.clear(),this.cachedEventUids.has(Jl(e))}saveEventToCache(e){this.cachedEventUids.add(Jl(e)),this.lastProcessedEventTime=Date.now()}}function Jl(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function Zl({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function Yy(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Zl(n);default:return!1}}/**
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
 */async function Xy(n,e={}){return Vt(n,"GET","/v1/projects",e)}/**
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
 */const Jy=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Zy=/^https?/;async function ev(n){if(n.config.emulator)return;const{authorizedDomains:e}=await Xy(n);for(const t of e)try{if(tv(t))return}catch{}Qe(n,"unauthorized-domain")}function tv(n){const e=Po(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const a=new URL(n);return a.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&a.hostname===r}if(!Zy.test(t))return!1;if(Jy.test(n))return r===n;const i=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(r)}/**
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
 */const nv=new kr(3e4,6e4);function eu(){const n=nt().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function rv(n){return new Promise((e,t)=>{var i,s,a;function r(){eu(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{eu(),t(tt(n,"network-request-failed"))},timeout:nv.get()})}if((s=(i=nt().gapi)==null?void 0:i.iframes)!=null&&s.Iframe)e(gapi.iframes.getContext());else if((a=nt().gapi)!=null&&a.load)r();else{const c=Wm("iframefcb");return nt()[c]=()=>{gapi.load?r():t(tt(n,"network-request-failed"))},Pl(`${Gm()}?onload=${c}`).catch(l=>t(l))}}).catch(e=>{throw es=null,e})}let es=null;function iv(n){return es=es||rv(n),es}/**
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
 */const sv=new kr(5e3,15e3),ov="__/auth/iframe",av="emulator/auth/iframe",cv={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},lv=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function uv(n){const e=n.config;K(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?No(e,av):`https://${n.config.authDomain}/${ov}`,r={apiKey:e.apiKey,appName:n.name,v:Fn},i=lv.get(n.config.apiHost);i&&(r.eid=i);const s=n._getFrameworks();return s.length&&(r.fw=s.join(",")),`${t}?${Ir(r).slice(1)}`}async function hv(n){const e=await iv(n),t=nt().gapi;return K(t,n,"internal-error"),e.open({where:document.body,url:uv(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:cv,dontclear:!0},r=>new Promise(async(i,s)=>{await r.restyle({setHideOnLeave:!1});const a=tt(n,"network-request-failed"),c=nt().setTimeout(()=>{s(a)},sv.get());function l(){nt().clearTimeout(c),i(r)}r.ping(l).then(l,()=>{s(a)})}))}/**
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
 */const dv={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},fv=500,pv=600,gv="_blank",mv="http://localhost";class tu{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function yv(n,e,t,r=fv,i=pv){const s=Math.max((window.screen.availHeight-i)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString();let c="";const l={...dv,width:r.toString(),height:i.toString(),top:s,left:a},u=Ie().toLowerCase();t&&(c=Tl(u)?gv:t),wl(u)&&(e=e||mv,l.scrollbars="yes");const f=Object.entries(l).reduce((w,[A,T])=>`${w}${A}=${T},`,"");if(Fm(u)&&c!=="_self")return vv(e||"",c),new tu(null);const p=window.open(e||"",c,f);K(p,n,"popup-blocked");try{p.focus()}catch{}return new tu(p)}function vv(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
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
 */const _v="__/auth/handler",bv="emulator/auth/handler",wv=encodeURIComponent("fac");async function nu(n,e,t,r,i,s){K(n.config.authDomain,n,"auth-domain-config-required"),K(n.config.apiKey,n,"invalid-api-key");const a={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:Fn,eventId:i};if(e instanceof Ol){e.setDefaultLanguage(n.languageCode),a.providerId=e.providerId||"",ig(e.getCustomParameters())||(a.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,p]of Object.entries({}))a[f]=p}if(e instanceof Lr){const f=e.getScopes().filter(p=>p!=="");f.length>0&&(a.scopes=f.join(","))}n.tenantId&&(a.tid=n.tenantId);const c=a;for(const f of Object.keys(c))c[f]===void 0&&delete c[f];const l=await n._getAppCheckToken(),u=l?`#${wv}=${encodeURIComponent(l)}`:"";return`${Ev(n)}?${Ir(c).slice(1)}${u}`}function Ev({config:n}){return n.emulator?No(n,bv):`https://${n.authDomain}/${_v}`}/**
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
 */const Ho="webStorageSupport";class Tv{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=jl,this._completeRedirectFn=Gy,this._overrideRedirectResult=jy}async _openPopup(e,t,r,i){var a;yt((a=this.eventManagers[e._key()])==null?void 0:a.manager,"_initialize() not called before _openPopup()");const s=await nu(e,t,r,Po(),i);return yv(e,s,Bo())}async _openRedirect(e,t,r,i){await this._originValidation(e);const s=await nu(e,t,r,Po(),i);return Ay(s),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:i,promise:s}=this.eventManagers[t];return i?Promise.resolve(i):(yt(s,"If manager is not set, promise should be"),s)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await hv(e),r=new Qy(e);return t.register("authEvent",i=>(K(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:r.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Ho,{type:Ho},i=>{var a;const s=(a=i==null?void 0:i[0])==null?void 0:a[Ho];s!==void 0&&t(!!s),Qe(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=ev(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Cl()||El()||Oo()}}const Iv=Tv;var ru="@firebase/auth",iu="1.13.0";/**
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
 */class xv{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){K(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function Av(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Sv(n){Mn(new cn("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:a,authDomain:c}=r.options;K(a&&!a.includes(":"),"invalid-api-key",{appName:r.name});const l={apiKey:a,authDomain:c,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:kl(n)},u=new jm(r,i,s,l);return ey(u,t),u},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),Mn(new cn("auth-internal",e=>{const t=un(e.getProvider("auth").getImmediate());return(r=>new xv(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),Dt(ru,iu,Av(n)),Dt(ru,iu,"esm2020")}/**
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
 */const Cv=5*60,kv=jc("authIdTokenMaxAge")||Cv;let su=null;const Rv=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>kv)return;const i=t==null?void 0:t.token;su!==i&&(su=i,await fetch(n,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function Pv(n=tl()){const e=Co(n,"auth");if(e.isInitialized())return e.getImmediate();const t=Zm(n,{popupRedirectResolver:Iv,persistence:[Vy,Ty,jl]}),r=jc("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const s=new URL(r,location.origin);if(location.origin===s.origin){const a=Rv(s.toString());vy(t,a,()=>a(t.currentUser)),yy(t,c=>a(c))}}const i=$c("auth");return i&&ty(t,`http://${i}`),t}function Nv(){var n;return((n=document.getElementsByTagName("head"))==null?void 0:n[0])??document}zm({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=i=>{const s=tt("internal-error");s.customData=i,t(s)},r.type="text/javascript",r.charset="UTF-8",Nv().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="}),Sv("Browser");var ou=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var qt,au;(function(){var n;/** @license

   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */function e(_,m){function y(){}y.prototype=m.prototype,_.F=m.prototype,_.prototype=new y,_.prototype.constructor=_,_.D=function(E,I,S){for(var b=Array(arguments.length-2),se=2;se<arguments.length;se++)b[se-2]=arguments[se];return m.prototype[I].apply(E,b)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(r,t),r.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function i(_,m,y){y||(y=0);const E=Array(16);if(typeof m=="string")for(var I=0;I<16;++I)E[I]=m.charCodeAt(y++)|m.charCodeAt(y++)<<8|m.charCodeAt(y++)<<16|m.charCodeAt(y++)<<24;else for(I=0;I<16;++I)E[I]=m[y++]|m[y++]<<8|m[y++]<<16|m[y++]<<24;m=_.g[0],y=_.g[1],I=_.g[2];let S=_.g[3],b;b=m+(S^y&(I^S))+E[0]+3614090360&4294967295,m=y+(b<<7&4294967295|b>>>25),b=S+(I^m&(y^I))+E[1]+3905402710&4294967295,S=m+(b<<12&4294967295|b>>>20),b=I+(y^S&(m^y))+E[2]+606105819&4294967295,I=S+(b<<17&4294967295|b>>>15),b=y+(m^I&(S^m))+E[3]+3250441966&4294967295,y=I+(b<<22&4294967295|b>>>10),b=m+(S^y&(I^S))+E[4]+4118548399&4294967295,m=y+(b<<7&4294967295|b>>>25),b=S+(I^m&(y^I))+E[5]+1200080426&4294967295,S=m+(b<<12&4294967295|b>>>20),b=I+(y^S&(m^y))+E[6]+2821735955&4294967295,I=S+(b<<17&4294967295|b>>>15),b=y+(m^I&(S^m))+E[7]+4249261313&4294967295,y=I+(b<<22&4294967295|b>>>10),b=m+(S^y&(I^S))+E[8]+1770035416&4294967295,m=y+(b<<7&4294967295|b>>>25),b=S+(I^m&(y^I))+E[9]+2336552879&4294967295,S=m+(b<<12&4294967295|b>>>20),b=I+(y^S&(m^y))+E[10]+4294925233&4294967295,I=S+(b<<17&4294967295|b>>>15),b=y+(m^I&(S^m))+E[11]+2304563134&4294967295,y=I+(b<<22&4294967295|b>>>10),b=m+(S^y&(I^S))+E[12]+1804603682&4294967295,m=y+(b<<7&4294967295|b>>>25),b=S+(I^m&(y^I))+E[13]+4254626195&4294967295,S=m+(b<<12&4294967295|b>>>20),b=I+(y^S&(m^y))+E[14]+2792965006&4294967295,I=S+(b<<17&4294967295|b>>>15),b=y+(m^I&(S^m))+E[15]+1236535329&4294967295,y=I+(b<<22&4294967295|b>>>10),b=m+(I^S&(y^I))+E[1]+4129170786&4294967295,m=y+(b<<5&4294967295|b>>>27),b=S+(y^I&(m^y))+E[6]+3225465664&4294967295,S=m+(b<<9&4294967295|b>>>23),b=I+(m^y&(S^m))+E[11]+643717713&4294967295,I=S+(b<<14&4294967295|b>>>18),b=y+(S^m&(I^S))+E[0]+3921069994&4294967295,y=I+(b<<20&4294967295|b>>>12),b=m+(I^S&(y^I))+E[5]+3593408605&4294967295,m=y+(b<<5&4294967295|b>>>27),b=S+(y^I&(m^y))+E[10]+38016083&4294967295,S=m+(b<<9&4294967295|b>>>23),b=I+(m^y&(S^m))+E[15]+3634488961&4294967295,I=S+(b<<14&4294967295|b>>>18),b=y+(S^m&(I^S))+E[4]+3889429448&4294967295,y=I+(b<<20&4294967295|b>>>12),b=m+(I^S&(y^I))+E[9]+568446438&4294967295,m=y+(b<<5&4294967295|b>>>27),b=S+(y^I&(m^y))+E[14]+3275163606&4294967295,S=m+(b<<9&4294967295|b>>>23),b=I+(m^y&(S^m))+E[3]+4107603335&4294967295,I=S+(b<<14&4294967295|b>>>18),b=y+(S^m&(I^S))+E[8]+1163531501&4294967295,y=I+(b<<20&4294967295|b>>>12),b=m+(I^S&(y^I))+E[13]+2850285829&4294967295,m=y+(b<<5&4294967295|b>>>27),b=S+(y^I&(m^y))+E[2]+4243563512&4294967295,S=m+(b<<9&4294967295|b>>>23),b=I+(m^y&(S^m))+E[7]+1735328473&4294967295,I=S+(b<<14&4294967295|b>>>18),b=y+(S^m&(I^S))+E[12]+2368359562&4294967295,y=I+(b<<20&4294967295|b>>>12),b=m+(y^I^S)+E[5]+4294588738&4294967295,m=y+(b<<4&4294967295|b>>>28),b=S+(m^y^I)+E[8]+2272392833&4294967295,S=m+(b<<11&4294967295|b>>>21),b=I+(S^m^y)+E[11]+1839030562&4294967295,I=S+(b<<16&4294967295|b>>>16),b=y+(I^S^m)+E[14]+4259657740&4294967295,y=I+(b<<23&4294967295|b>>>9),b=m+(y^I^S)+E[1]+2763975236&4294967295,m=y+(b<<4&4294967295|b>>>28),b=S+(m^y^I)+E[4]+1272893353&4294967295,S=m+(b<<11&4294967295|b>>>21),b=I+(S^m^y)+E[7]+4139469664&4294967295,I=S+(b<<16&4294967295|b>>>16),b=y+(I^S^m)+E[10]+3200236656&4294967295,y=I+(b<<23&4294967295|b>>>9),b=m+(y^I^S)+E[13]+681279174&4294967295,m=y+(b<<4&4294967295|b>>>28),b=S+(m^y^I)+E[0]+3936430074&4294967295,S=m+(b<<11&4294967295|b>>>21),b=I+(S^m^y)+E[3]+3572445317&4294967295,I=S+(b<<16&4294967295|b>>>16),b=y+(I^S^m)+E[6]+76029189&4294967295,y=I+(b<<23&4294967295|b>>>9),b=m+(y^I^S)+E[9]+3654602809&4294967295,m=y+(b<<4&4294967295|b>>>28),b=S+(m^y^I)+E[12]+3873151461&4294967295,S=m+(b<<11&4294967295|b>>>21),b=I+(S^m^y)+E[15]+530742520&4294967295,I=S+(b<<16&4294967295|b>>>16),b=y+(I^S^m)+E[2]+3299628645&4294967295,y=I+(b<<23&4294967295|b>>>9),b=m+(I^(y|~S))+E[0]+4096336452&4294967295,m=y+(b<<6&4294967295|b>>>26),b=S+(y^(m|~I))+E[7]+1126891415&4294967295,S=m+(b<<10&4294967295|b>>>22),b=I+(m^(S|~y))+E[14]+2878612391&4294967295,I=S+(b<<15&4294967295|b>>>17),b=y+(S^(I|~m))+E[5]+4237533241&4294967295,y=I+(b<<21&4294967295|b>>>11),b=m+(I^(y|~S))+E[12]+1700485571&4294967295,m=y+(b<<6&4294967295|b>>>26),b=S+(y^(m|~I))+E[3]+2399980690&4294967295,S=m+(b<<10&4294967295|b>>>22),b=I+(m^(S|~y))+E[10]+4293915773&4294967295,I=S+(b<<15&4294967295|b>>>17),b=y+(S^(I|~m))+E[1]+2240044497&4294967295,y=I+(b<<21&4294967295|b>>>11),b=m+(I^(y|~S))+E[8]+1873313359&4294967295,m=y+(b<<6&4294967295|b>>>26),b=S+(y^(m|~I))+E[15]+4264355552&4294967295,S=m+(b<<10&4294967295|b>>>22),b=I+(m^(S|~y))+E[6]+2734768916&4294967295,I=S+(b<<15&4294967295|b>>>17),b=y+(S^(I|~m))+E[13]+1309151649&4294967295,y=I+(b<<21&4294967295|b>>>11),b=m+(I^(y|~S))+E[4]+4149444226&4294967295,m=y+(b<<6&4294967295|b>>>26),b=S+(y^(m|~I))+E[11]+3174756917&4294967295,S=m+(b<<10&4294967295|b>>>22),b=I+(m^(S|~y))+E[2]+718787259&4294967295,I=S+(b<<15&4294967295|b>>>17),b=y+(S^(I|~m))+E[9]+3951481745&4294967295,_.g[0]=_.g[0]+m&4294967295,_.g[1]=_.g[1]+(I+(b<<21&4294967295|b>>>11))&4294967295,_.g[2]=_.g[2]+I&4294967295,_.g[3]=_.g[3]+S&4294967295}r.prototype.v=function(_,m){m===void 0&&(m=_.length);const y=m-this.blockSize,E=this.C;let I=this.h,S=0;for(;S<m;){if(I==0)for(;S<=y;)i(this,_,S),S+=this.blockSize;if(typeof _=="string"){for(;S<m;)if(E[I++]=_.charCodeAt(S++),I==this.blockSize){i(this,E),I=0;break}}else for(;S<m;)if(E[I++]=_[S++],I==this.blockSize){i(this,E),I=0;break}}this.h=I,this.o+=m},r.prototype.A=function(){var _=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);_[0]=128;for(var m=1;m<_.length-8;++m)_[m]=0;m=this.o*8;for(var y=_.length-8;y<_.length;++y)_[y]=m&255,m/=256;for(this.v(_),_=Array(16),m=0,y=0;y<4;++y)for(let E=0;E<32;E+=8)_[m++]=this.g[y]>>>E&255;return _};function s(_,m){var y=c;return Object.prototype.hasOwnProperty.call(y,_)?y[_]:y[_]=m(_)}function a(_,m){this.h=m;const y=[];let E=!0;for(let I=_.length-1;I>=0;I--){const S=_[I]|0;E&&S==m||(y[I]=S,E=!1)}this.g=y}var c={};function l(_){return-128<=_&&_<128?s(_,function(m){return new a([m|0],m<0?-1:0)}):new a([_|0],_<0?-1:0)}function u(_){if(isNaN(_)||!isFinite(_))return p;if(_<0)return x(u(-_));const m=[];let y=1;for(let E=0;_>=y;E++)m[E]=_/y|0,y*=4294967296;return new a(m,0)}function f(_,m){if(_.length==0)throw Error("number format error: empty string");if(m=m||10,m<2||36<m)throw Error("radix out of range: "+m);if(_.charAt(0)=="-")return x(f(_.substring(1),m));if(_.indexOf("-")>=0)throw Error('number format error: interior "-" character');const y=u(Math.pow(m,8));let E=p;for(let S=0;S<_.length;S+=8){var I=Math.min(8,_.length-S);const b=parseInt(_.substring(S,S+I),m);I<8?(I=u(Math.pow(m,I)),E=E.j(I).add(u(b))):(E=E.j(y),E=E.add(u(b)))}return E}var p=l(0),w=l(1),A=l(16777216);n=a.prototype,n.m=function(){if(v(this))return-x(this).m();let _=0,m=1;for(let y=0;y<this.g.length;y++){const E=this.i(y);_+=(E>=0?E:4294967296+E)*m,m*=4294967296}return _},n.toString=function(_){if(_=_||10,_<2||36<_)throw Error("radix out of range: "+_);if(T(this))return"0";if(v(this))return"-"+x(this).toString(_);const m=u(Math.pow(_,6));var y=this;let E="";for(;;){const I=M(y,m).g;y=k(y,I.j(m));let S=((y.g.length>0?y.g[0]:y.h)>>>0).toString(_);if(y=I,T(y))return S+E;for(;S.length<6;)S="0"+S;E=S+E}},n.i=function(_){return _<0?0:_<this.g.length?this.g[_]:this.h};function T(_){if(_.h!=0)return!1;for(let m=0;m<_.g.length;m++)if(_.g[m]!=0)return!1;return!0}function v(_){return _.h==-1}n.l=function(_){return _=k(this,_),v(_)?-1:T(_)?0:1};function x(_){const m=_.g.length,y=[];for(let E=0;E<m;E++)y[E]=~_.g[E];return new a(y,~_.h).add(w)}n.abs=function(){return v(this)?x(this):this},n.add=function(_){const m=Math.max(this.g.length,_.g.length),y=[];let E=0;for(let I=0;I<=m;I++){let S=E+(this.i(I)&65535)+(_.i(I)&65535),b=(S>>>16)+(this.i(I)>>>16)+(_.i(I)>>>16);E=b>>>16,S&=65535,b&=65535,y[I]=b<<16|S}return new a(y,y[y.length-1]&-2147483648?-1:0)};function k(_,m){return _.add(x(m))}n.j=function(_){if(T(this)||T(_))return p;if(v(this))return v(_)?x(this).j(x(_)):x(x(this).j(_));if(v(_))return x(this.j(x(_)));if(this.l(A)<0&&_.l(A)<0)return u(this.m()*_.m());const m=this.g.length+_.g.length,y=[];for(var E=0;E<2*m;E++)y[E]=0;for(E=0;E<this.g.length;E++)for(let I=0;I<_.g.length;I++){const S=this.i(E)>>>16,b=this.i(E)&65535,se=_.i(I)>>>16,lt=_.i(I)&65535;y[2*E+2*I]+=b*lt,P(y,2*E+2*I),y[2*E+2*I+1]+=S*lt,P(y,2*E+2*I+1),y[2*E+2*I+1]+=b*se,P(y,2*E+2*I+1),y[2*E+2*I+2]+=S*se,P(y,2*E+2*I+2)}for(_=0;_<m;_++)y[_]=y[2*_+1]<<16|y[2*_];for(_=m;_<2*m;_++)y[_]=0;return new a(y,0)};function P(_,m){for(;(_[m]&65535)!=_[m];)_[m+1]+=_[m]>>>16,_[m]&=65535,m++}function N(_,m){this.g=_,this.h=m}function M(_,m){if(T(m))throw Error("division by zero");if(T(_))return new N(p,p);if(v(_))return m=M(x(_),m),new N(x(m.g),x(m.h));if(v(m))return m=M(_,x(m)),new N(x(m.g),m.h);if(_.g.length>30){if(v(_)||v(m))throw Error("slowDivide_ only works with positive integers.");for(var y=w,E=m;E.l(_)<=0;)y=B(y),E=B(E);var I=j(y,1),S=j(E,1);for(E=j(E,2),y=j(y,2);!T(E);){var b=S.add(E);b.l(_)<=0&&(I=I.add(y),S=b),E=j(E,1),y=j(y,1)}return m=k(_,I.j(m)),new N(I,m)}for(I=p;_.l(m)>=0;){for(y=Math.max(1,Math.floor(_.m()/m.m())),E=Math.ceil(Math.log(y)/Math.LN2),E=E<=48?1:Math.pow(2,E-48),S=u(y),b=S.j(m);v(b)||b.l(_)>0;)y-=E,S=u(y),b=S.j(m);T(S)&&(S=w),I=I.add(S),_=k(_,b)}return new N(I,_)}n.B=function(_){return M(this,_).h},n.and=function(_){const m=Math.max(this.g.length,_.g.length),y=[];for(let E=0;E<m;E++)y[E]=this.i(E)&_.i(E);return new a(y,this.h&_.h)},n.or=function(_){const m=Math.max(this.g.length,_.g.length),y=[];for(let E=0;E<m;E++)y[E]=this.i(E)|_.i(E);return new a(y,this.h|_.h)},n.xor=function(_){const m=Math.max(this.g.length,_.g.length),y=[];for(let E=0;E<m;E++)y[E]=this.i(E)^_.i(E);return new a(y,this.h^_.h)};function B(_){const m=_.g.length+1,y=[];for(let E=0;E<m;E++)y[E]=_.i(E)<<1|_.i(E-1)>>>31;return new a(y,_.h)}function j(_,m){const y=m>>5;m%=32;const E=_.g.length-y,I=[];for(let S=0;S<E;S++)I[S]=m>0?_.i(S+y)>>>m|_.i(S+y+1)<<32-m:_.i(S+y);return new a(I,_.h)}r.prototype.digest=r.prototype.A,r.prototype.reset=r.prototype.u,r.prototype.update=r.prototype.v,au=r,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.B,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=u,a.fromString=f,qt=a}).apply(typeof ou<"u"?ou:typeof self<"u"?self:typeof window<"u"?window:{});var ts=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var cu,Or,lu,ns,jo,uu,hu,du;(function(){var n,e=Object.defineProperty;function t(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof ts=="object"&&ts];for(var h=0;h<o.length;++h){var d=o[h];if(d&&d.Math==Math)return d}throw Error("Cannot find global object")}var r=t(this);function i(o,h){if(h)e:{var d=r;o=o.split(".");for(var g=0;g<o.length-1;g++){var C=o[g];if(!(C in d))break e;d=d[C]}o=o[o.length-1],g=d[o],h=h(g),h!=g&&h!=null&&e(d,o,{configurable:!0,writable:!0,value:h})}}i("Symbol.dispose",function(o){return o||Symbol("Symbol.dispose")}),i("Array.prototype.values",function(o){return o||function(){return this[Symbol.iterator]()}}),i("Object.entries",function(o){return o||function(h){var d=[],g;for(g in h)Object.prototype.hasOwnProperty.call(h,g)&&d.push([g,h[g]]);return d}});/** @license

   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */var s=s||{},a=this||self;function c(o){var h=typeof o;return h=="object"&&o!=null||h=="function"}function l(o,h,d){return o.call.apply(o.bind,arguments)}function u(o,h,d){return u=l,u.apply(null,arguments)}function f(o,h){var d=Array.prototype.slice.call(arguments,1);return function(){var g=d.slice();return g.push.apply(g,arguments),o.apply(this,g)}}function p(o,h){function d(){}d.prototype=h.prototype,o.Z=h.prototype,o.prototype=new d,o.prototype.constructor=o,o.Ob=function(g,C,R){for(var U=Array(arguments.length-2),Y=2;Y<arguments.length;Y++)U[Y-2]=arguments[Y];return h.prototype[C].apply(g,U)}}var w=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?o=>o&&AsyncContext.Snapshot.wrap(o):o=>o;function A(o){const h=o.length;if(h>0){const d=Array(h);for(let g=0;g<h;g++)d[g]=o[g];return d}return[]}function T(o,h){for(let g=1;g<arguments.length;g++){const C=arguments[g];var d=typeof C;if(d=d!="object"?d:C?Array.isArray(C)?"array":d:"null",d=="array"||d=="object"&&typeof C.length=="number"){d=o.length||0;const R=C.length||0;o.length=d+R;for(let U=0;U<R;U++)o[d+U]=C[U]}else o.push(C)}}class v{constructor(h,d){this.i=h,this.j=d,this.h=0,this.g=null}get(){let h;return this.h>0?(this.h--,h=this.g,this.g=h.next,h.next=null):h=this.i(),h}}function x(o){a.setTimeout(()=>{throw o},0)}function k(){var o=_;let h=null;return o.g&&(h=o.g,o.g=o.g.next,o.g||(o.h=null),h.next=null),h}class P{constructor(){this.h=this.g=null}add(h,d){const g=N.get();g.set(h,d),this.h?this.h.next=g:this.g=g,this.h=g}}var N=new v(()=>new M,o=>o.reset());class M{constructor(){this.next=this.g=this.h=null}set(h,d){this.h=h,this.g=d,this.next=null}reset(){this.next=this.g=this.h=null}}let B,j=!1,_=new P,m=()=>{const o=Promise.resolve(void 0);B=()=>{o.then(y)}};function y(){for(var o;o=k();){try{o.h.call(o.g)}catch(d){x(d)}var h=N;h.j(o),h.h<100&&(h.h++,o.next=h.g,h.g=o)}j=!1}function E(){this.u=this.u,this.C=this.C}E.prototype.u=!1,E.prototype.dispose=function(){this.u||(this.u=!0,this.N())},E.prototype[Symbol.dispose]=function(){this.dispose()},E.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function I(o,h){this.type=o,this.g=this.target=h,this.defaultPrevented=!1}I.prototype.h=function(){this.defaultPrevented=!0};var S=function(){if(!a.addEventListener||!Object.defineProperty)return!1;var o=!1,h=Object.defineProperty({},"passive",{get:function(){o=!0}});try{const d=()=>{};a.addEventListener("test",d,h),a.removeEventListener("test",d,h)}catch{}return o}();function b(o){return/^[\s\xa0]*$/.test(o)}function se(o,h){I.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o&&this.init(o,h)}p(se,I),se.prototype.init=function(o,h){const d=this.type=o.type,g=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;this.target=o.target||o.srcElement,this.g=h,h=o.relatedTarget,h||(d=="mouseover"?h=o.fromElement:d=="mouseout"&&(h=o.toElement)),this.relatedTarget=h,g?(this.clientX=g.clientX!==void 0?g.clientX:g.pageX,this.clientY=g.clientY!==void 0?g.clientY:g.pageY,this.screenX=g.screenX||0,this.screenY=g.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=o.pointerType,this.state=o.state,this.i=o,o.defaultPrevented&&se.Z.h.call(this)},se.prototype.h=function(){se.Z.h.call(this);const o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var lt="closure_listenable_"+(Math.random()*1e6|0),di=0;function qe(o,h,d,g,C){this.listener=o,this.proxy=null,this.src=h,this.type=d,this.capture=!!g,this.ha=C,this.key=++di,this.da=this.fa=!1}function Ue(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function Ne(o,h,d){for(const g in o)h.call(d,o[g],g,o)}function xT(o,h){for(const d in o)h.call(void 0,o[d],d,o)}function Sf(o){const h={};for(const d in o)h[d]=o[d];return h}const Cf="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function kf(o,h){let d,g;for(let C=1;C<arguments.length;C++){g=arguments[C];for(d in g)o[d]=g[d];for(let R=0;R<Cf.length;R++)d=Cf[R],Object.prototype.hasOwnProperty.call(g,d)&&(o[d]=g[d])}}function no(o){this.src=o,this.g={},this.h=0}no.prototype.add=function(o,h,d,g,C){const R=o.toString();o=this.g[R],o||(o=this.g[R]=[],this.h++);const U=fc(o,h,g,C);return U>-1?(h=o[U],d||(h.fa=!1)):(h=new qe(h,this.src,R,!!g,C),h.fa=d,o.push(h)),h};function dc(o,h){const d=h.type;if(d in o.g){var g=o.g[d],C=Array.prototype.indexOf.call(g,h,void 0),R;(R=C>=0)&&Array.prototype.splice.call(g,C,1),R&&(Ue(h),o.g[d].length==0&&(delete o.g[d],o.h--))}}function fc(o,h,d,g){for(let C=0;C<o.length;++C){const R=o[C];if(!R.da&&R.listener==h&&R.capture==!!d&&R.ha==g)return C}return-1}var pc="closure_lm_"+(Math.random()*1e6|0),gc={};function Rf(o,h,d,g,C){if(Array.isArray(h)){for(let R=0;R<h.length;R++)Rf(o,h[R],d,g,C);return null}return d=Df(d),o&&o[lt]?o.J(h,d,c(g)?!!g.capture:!1,C):AT(o,h,d,!1,g,C)}function AT(o,h,d,g,C,R){if(!h)throw Error("Invalid event type");const U=c(C)?!!C.capture:!!C;let Y=yc(o);if(Y||(o[pc]=Y=new no(o)),d=Y.add(h,d,g,U,R),d.proxy)return d;if(g=ST(),d.proxy=g,g.src=o,g.listener=d,o.addEventListener)S||(C=U),C===void 0&&(C=!1),o.addEventListener(h.toString(),g,C);else if(o.attachEvent)o.attachEvent(Nf(h.toString()),g);else if(o.addListener&&o.removeListener)o.addListener(g);else throw Error("addEventListener and attachEvent are unavailable.");return d}function ST(){function o(d){return h.call(o.src,o.listener,d)}const h=CT;return o}function Pf(o,h,d,g,C){if(Array.isArray(h))for(var R=0;R<h.length;R++)Pf(o,h[R],d,g,C);else g=c(g)?!!g.capture:!!g,d=Df(d),o&&o[lt]?(o=o.i,R=String(h).toString(),R in o.g&&(h=o.g[R],d=fc(h,d,g,C),d>-1&&(Ue(h[d]),Array.prototype.splice.call(h,d,1),h.length==0&&(delete o.g[R],o.h--)))):o&&(o=yc(o))&&(h=o.g[h.toString()],o=-1,h&&(o=fc(h,d,g,C)),(d=o>-1?h[o]:null)&&mc(d))}function mc(o){if(typeof o!="number"&&o&&!o.da){var h=o.src;if(h&&h[lt])dc(h.i,o);else{var d=o.type,g=o.proxy;h.removeEventListener?h.removeEventListener(d,g,o.capture):h.detachEvent?h.detachEvent(Nf(d),g):h.addListener&&h.removeListener&&h.removeListener(g),(d=yc(h))?(dc(d,o),d.h==0&&(d.src=null,h[pc]=null)):Ue(o)}}}function Nf(o){return o in gc?gc[o]:gc[o]="on"+o}function CT(o,h){if(o.da)o=!0;else{h=new se(h,this);const d=o.listener,g=o.ha||o.src;o.fa&&mc(o),o=d.call(g,h)}return o}function yc(o){return o=o[pc],o instanceof no?o:null}var vc="__closure_events_fn_"+(Math.random()*1e9>>>0);function Df(o){return typeof o=="function"?o:(o[vc]||(o[vc]=function(h){return o.handleEvent(h)}),o[vc])}function Re(){E.call(this),this.i=new no(this),this.M=this,this.G=null}p(Re,E),Re.prototype[lt]=!0,Re.prototype.removeEventListener=function(o,h,d,g){Pf(this,o,h,d,g)};function De(o,h){var d,g=o.G;if(g)for(d=[];g;g=g.G)d.push(g);if(o=o.M,g=h.type||h,typeof h=="string")h=new I(h,o);else if(h instanceof I)h.target=h.target||o;else{var C=h;h=new I(g,o),kf(h,C)}C=!0;let R,U;if(d)for(U=d.length-1;U>=0;U--)R=h.g=d[U],C=ro(R,g,!0,h)&&C;if(R=h.g=o,C=ro(R,g,!0,h)&&C,C=ro(R,g,!1,h)&&C,d)for(U=0;U<d.length;U++)R=h.g=d[U],C=ro(R,g,!1,h)&&C}Re.prototype.N=function(){if(Re.Z.N.call(this),this.i){var o=this.i;for(const h in o.g){const d=o.g[h];for(let g=0;g<d.length;g++)Ue(d[g]);delete o.g[h],o.h--}}this.G=null},Re.prototype.J=function(o,h,d,g){return this.i.add(String(o),h,!1,d,g)},Re.prototype.K=function(o,h,d,g){return this.i.add(String(o),h,!0,d,g)};function ro(o,h,d,g){if(h=o.i.g[String(h)],!h)return!0;h=h.concat();let C=!0;for(let R=0;R<h.length;++R){const U=h[R];if(U&&!U.da&&U.capture==d){const Y=U.listener,ye=U.ha||U.src;U.fa&&dc(o.i,U),C=Y.call(ye,g)!==!1&&C}}return C&&!g.defaultPrevented}function kT(o,h){if(typeof o!="function")if(o&&typeof o.handleEvent=="function")o=u(o.handleEvent,o);else throw Error("Invalid listener argument");return Number(h)>2147483647?-1:a.setTimeout(o,h||0)}function Lf(o){o.g=kT(()=>{o.g=null,o.i&&(o.i=!1,Lf(o))},o.l);const h=o.h;o.h=null,o.m.apply(null,h)}class RT extends E{constructor(h,d){super(),this.m=h,this.l=d,this.h=null,this.i=!1,this.g=null}j(h){this.h=arguments,this.g?this.i=!0:Lf(this)}N(){super.N(),this.g&&(a.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function fi(o){E.call(this),this.h=o,this.g={}}p(fi,E);var Vf=[];function Of(o){Ne(o.g,function(h,d){this.g.hasOwnProperty(d)&&mc(h)},o),o.g={}}fi.prototype.N=function(){fi.Z.N.call(this),Of(this)},fi.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var _c=a.JSON.stringify,PT=a.JSON.parse,NT=class{stringify(o){return a.JSON.stringify(o,void 0)}parse(o){return a.JSON.parse(o,void 0)}};function Mf(){}function Ff(){}var pi={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function bc(){I.call(this,"d")}p(bc,I);function wc(){I.call(this,"c")}p(wc,I);var An={},Uf=null;function io(){return Uf=Uf||new Re}An.Ia="serverreachability";function Bf(o){I.call(this,An.Ia,o)}p(Bf,I);function gi(o){const h=io();De(h,new Bf(h))}An.STAT_EVENT="statevent";function qf(o,h){I.call(this,An.STAT_EVENT,o),this.stat=h}p(qf,I);function Le(o){const h=io();De(h,new qf(h,o))}An.Ja="timingevent";function $f(o,h){I.call(this,An.Ja,o),this.size=h}p($f,I);function mi(o,h){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return a.setTimeout(function(){o()},h)}function yi(){this.g=!0}yi.prototype.ua=function(){this.g=!1};function DT(o,h,d,g,C,R){o.info(function(){if(o.g)if(R){var U="",Y=R.split("&");for(let ne=0;ne<Y.length;ne++){var ye=Y[ne].split("=");if(ye.length>1){const be=ye[0];ye=ye[1];const ht=be.split("_");U=ht.length>=2&&ht[1]=="type"?U+(be+"="+ye+"&"):U+(be+"=redacted&")}}}else U=null;else U=R;return"XMLHTTP REQ ("+g+") [attempt "+C+"]: "+h+`
`+d+`
`+U})}function LT(o,h,d,g,C,R,U){o.info(function(){return"XMLHTTP RESP ("+g+") [ attempt "+C+"]: "+h+`
`+d+`
`+R+" "+U})}function pr(o,h,d,g){o.info(function(){return"XMLHTTP TEXT ("+h+"): "+OT(o,d)+(g?" "+g:"")})}function VT(o,h){o.info(function(){return"TIMEOUT: "+h})}yi.prototype.info=function(){};function OT(o,h){if(!o.g)return h;if(!h)return null;try{const R=JSON.parse(h);if(R){for(o=0;o<R.length;o++)if(Array.isArray(R[o])){var d=R[o];if(!(d.length<2)){var g=d[1];if(Array.isArray(g)&&!(g.length<1)){var C=g[0];if(C!="noop"&&C!="stop"&&C!="close")for(let U=1;U<g.length;U++)g[U]=""}}}}return _c(R)}catch{return h}}var so={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},Hf={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},jf;function Ec(){}p(Ec,Mf),Ec.prototype.g=function(){return new XMLHttpRequest},jf=new Ec;function vi(o){return encodeURIComponent(String(o))}function MT(o){var h=1;o=o.split(":");const d=[];for(;h>0&&o.length;)d.push(o.shift()),h--;return o.length&&d.push(o.join(":")),d}function Xt(o,h,d,g){this.j=o,this.i=h,this.l=d,this.S=g||1,this.V=new fi(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new zf}function zf(){this.i=null,this.g="",this.h=!1}var Kf={},Tc={};function Ic(o,h,d){o.M=1,o.A=ao(ut(h)),o.u=d,o.R=!0,Gf(o,null)}function Gf(o,h){o.F=Date.now(),oo(o),o.B=ut(o.A);var d=o.B,g=o.S;Array.isArray(g)||(g=[String(g)]),op(d.i,"t",g),o.C=0,d=o.j.L,o.h=new zf,o.g=Ip(o.j,d?h:null,!o.u),o.P>0&&(o.O=new RT(u(o.Y,o,o.g),o.P)),h=o.V,d=o.g,g=o.ba;var C="readystatechange";Array.isArray(C)||(C&&(Vf[0]=C.toString()),C=Vf);for(let R=0;R<C.length;R++){const U=Rf(d,C[R],g||h.handleEvent,!1,h.h||h);if(!U)break;h.g[U.key]=U}h=o.J?Sf(o.J):{},o.u?(o.v||(o.v="POST"),h["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.B,o.v,o.u,h)):(o.v="GET",o.g.ea(o.B,o.v,null,h)),gi(),DT(o.i,o.v,o.B,o.l,o.S,o.u)}Xt.prototype.ba=function(o){o=o.target;const h=this.O;h&&en(o)==3?h.j():this.Y(o)},Xt.prototype.Y=function(o){try{if(o==this.g)e:{const Y=en(this.g),ye=this.g.ya(),ne=this.g.ca();if(!(Y<3)&&(Y!=3||this.g&&(this.h.h||this.g.la()||fp(this.g)))){this.K||Y!=4||ye==7||(ye==8||ne<=0?gi(3):gi(2)),xc(this);var h=this.g.ca();this.X=h;var d=FT(this);if(this.o=h==200,LT(this.i,this.v,this.B,this.l,this.S,Y,h),this.o){if(this.U&&!this.L){t:{if(this.g){var g,C=this.g;if((g=C.g?C.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!b(g)){var R=g;break t}}R=null}if(o=R)pr(this.i,this.l,o,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,Ac(this,o);else{this.o=!1,this.m=3,Le(12),Sn(this),_i(this);break e}}if(this.R){o=!0;let be;for(;!this.K&&this.C<d.length;)if(be=UT(this,d),be==Tc){Y==4&&(this.m=4,Le(14),o=!1),pr(this.i,this.l,null,"[Incomplete Response]");break}else if(be==Kf){this.m=4,Le(15),pr(this.i,this.l,d,"[Invalid Chunk]"),o=!1;break}else pr(this.i,this.l,be,null),Ac(this,be);if(Wf(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),Y!=4||d.length!=0||this.h.h||(this.m=1,Le(16),o=!1),this.o=this.o&&o,!o)pr(this.i,this.l,d,"[Invalid Chunked Response]"),Sn(this),_i(this);else if(d.length>0&&!this.W){this.W=!0;var U=this.j;U.g==this&&U.aa&&!U.P&&(U.j.info("Great, no buffering proxy detected. Bytes received: "+d.length),Lc(U),U.P=!0,Le(11))}}else pr(this.i,this.l,d,null),Ac(this,d);Y==4&&Sn(this),this.o&&!this.K&&(Y==4?bp(this.j,this):(this.o=!1,oo(this)))}else ZT(this.g),h==400&&d.indexOf("Unknown SID")>0?(this.m=3,Le(12)):(this.m=0,Le(13)),Sn(this),_i(this)}}}catch{}finally{}};function FT(o){if(!Wf(o))return o.g.la();const h=fp(o.g);if(h==="")return"";let d="";const g=h.length,C=en(o.g)==4;if(!o.h.i){if(typeof TextDecoder>"u")return Sn(o),_i(o),"";o.h.i=new a.TextDecoder}for(let R=0;R<g;R++)o.h.h=!0,d+=o.h.i.decode(h[R],{stream:!(C&&R==g-1)});return h.length=0,o.h.g+=d,o.C=0,o.h.g}function Wf(o){return o.g?o.v=="GET"&&o.M!=2&&o.j.Aa:!1}function UT(o,h){var d=o.C,g=h.indexOf(`
`,d);return g==-1?Tc:(d=Number(h.substring(d,g)),isNaN(d)?Kf:(g+=1,g+d>h.length?Tc:(h=h.slice(g,g+d),o.C=g+d,h)))}Xt.prototype.cancel=function(){this.K=!0,Sn(this)};function oo(o){o.T=Date.now()+o.H,Qf(o,o.H)}function Qf(o,h){if(o.D!=null)throw Error("WatchDog timer not null");o.D=mi(u(o.aa,o),h)}function xc(o){o.D&&(a.clearTimeout(o.D),o.D=null)}Xt.prototype.aa=function(){this.D=null;const o=Date.now();o-this.T>=0?(VT(this.i,this.B),this.M!=2&&(gi(),Le(17)),Sn(this),this.m=2,_i(this)):Qf(this,this.T-o)};function _i(o){o.j.I==0||o.K||bp(o.j,o)}function Sn(o){xc(o);var h=o.O;h&&typeof h.dispose=="function"&&h.dispose(),o.O=null,Of(o.V),o.g&&(h=o.g,o.g=null,h.abort(),h.dispose())}function Ac(o,h){try{var d=o.j;if(d.I!=0&&(d.g==o||Sc(d.h,o))){if(!o.L&&Sc(d.h,o)&&d.I==3){try{var g=d.Ba.g.parse(h)}catch{g=null}if(Array.isArray(g)&&g.length==3){var C=g;if(C[0]==0){e:if(!d.v){if(d.g)if(d.g.F+3e3<o.F)fo(d),uo(d);else break e;Dc(d),Le(18)}}else d.xa=C[1],0<d.xa-d.K&&C[2]<37500&&d.F&&d.A==0&&!d.C&&(d.C=mi(u(d.Va,d),6e3));Jf(d.h)<=1&&d.ta&&(d.ta=void 0)}else kn(d,11)}else if((o.L||d.g==o)&&fo(d),!b(h))for(C=d.Ba.g.parse(h),h=0;h<C.length;h++){let ne=C[h];const be=ne[0];if(!(be<=d.K))if(d.K=be,ne=ne[1],d.I==2)if(ne[0]=="c"){d.M=ne[1],d.ba=ne[2];const ht=ne[3];ht!=null&&(d.ka=ht,d.j.info("VER="+d.ka));const Rn=ne[4];Rn!=null&&(d.za=Rn,d.j.info("SVER="+d.za));const tn=ne[5];tn!=null&&typeof tn=="number"&&tn>0&&(g=1.5*tn,d.O=g,d.j.info("backChannelRequestTimeoutMs_="+g)),g=d;const nn=o.g;if(nn){const go=nn.g?nn.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(go){var R=g.h;R.g||go.indexOf("spdy")==-1&&go.indexOf("quic")==-1&&go.indexOf("h2")==-1||(R.j=R.l,R.g=new Set,R.h&&(Cc(R,R.h),R.h=null))}if(g.G){const Vc=nn.g?nn.g.getResponseHeader("X-HTTP-Session-Id"):null;Vc&&(g.wa=Vc,oe(g.J,g.G,Vc))}}d.I=3,d.l&&d.l.ra(),d.aa&&(d.T=Date.now()-o.F,d.j.info("Handshake RTT: "+d.T+"ms")),g=d;var U=o;if(g.na=Tp(g,g.L?g.ba:null,g.W),U.L){Zf(g.h,U);var Y=U,ye=g.O;ye&&(Y.H=ye),Y.D&&(xc(Y),oo(Y)),g.g=U}else vp(g);d.i.length>0&&ho(d)}else ne[0]!="stop"&&ne[0]!="close"||kn(d,7);else d.I==3&&(ne[0]=="stop"||ne[0]=="close"?ne[0]=="stop"?kn(d,7):Nc(d):ne[0]!="noop"&&d.l&&d.l.qa(ne),d.A=0)}}gi(4)}catch{}}var BT=class{constructor(o,h){this.g=o,this.map=h}};function Yf(o){this.l=o||10,a.PerformanceNavigationTiming?(o=a.performance.getEntriesByType("navigation"),o=o.length>0&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(a.chrome&&a.chrome.loadTimes&&a.chrome.loadTimes()&&a.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function Xf(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function Jf(o){return o.h?1:o.g?o.g.size:0}function Sc(o,h){return o.h?o.h==h:o.g?o.g.has(h):!1}function Cc(o,h){o.g?o.g.add(h):o.h=h}function Zf(o,h){o.h&&o.h==h?o.h=null:o.g&&o.g.has(h)&&o.g.delete(h)}Yf.prototype.cancel=function(){if(this.i=ep(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const o of this.g.values())o.cancel();this.g.clear()}};function ep(o){if(o.h!=null)return o.i.concat(o.h.G);if(o.g!=null&&o.g.size!==0){let h=o.i;for(const d of o.g.values())h=h.concat(d.G);return h}return A(o.i)}var tp=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function qT(o,h){if(o){o=o.split("&");for(let d=0;d<o.length;d++){const g=o[d].indexOf("=");let C,R=null;g>=0?(C=o[d].substring(0,g),R=o[d].substring(g+1)):C=o[d],h(C,R?decodeURIComponent(R.replace(/\+/g," ")):"")}}}function Jt(o){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let h;o instanceof Jt?(this.l=o.l,bi(this,o.j),this.o=o.o,this.g=o.g,wi(this,o.u),this.h=o.h,kc(this,ap(o.i)),this.m=o.m):o&&(h=String(o).match(tp))?(this.l=!1,bi(this,h[1]||"",!0),this.o=Ei(h[2]||""),this.g=Ei(h[3]||"",!0),wi(this,h[4]),this.h=Ei(h[5]||"",!0),kc(this,h[6]||"",!0),this.m=Ei(h[7]||"")):(this.l=!1,this.i=new Ii(null,this.l))}Jt.prototype.toString=function(){const o=[];var h=this.j;h&&o.push(Ti(h,np,!0),":");var d=this.g;return(d||h=="file")&&(o.push("//"),(h=this.o)&&o.push(Ti(h,np,!0),"@"),o.push(vi(d).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),d=this.u,d!=null&&o.push(":",String(d))),(d=this.h)&&(this.g&&d.charAt(0)!="/"&&o.push("/"),o.push(Ti(d,d.charAt(0)=="/"?jT:HT,!0))),(d=this.i.toString())&&o.push("?",d),(d=this.m)&&o.push("#",Ti(d,KT)),o.join("")},Jt.prototype.resolve=function(o){const h=ut(this);let d=!!o.j;d?bi(h,o.j):d=!!o.o,d?h.o=o.o:d=!!o.g,d?h.g=o.g:d=o.u!=null;var g=o.h;if(d)wi(h,o.u);else if(d=!!o.h){if(g.charAt(0)!="/")if(this.g&&!this.h)g="/"+g;else{var C=h.h.lastIndexOf("/");C!=-1&&(g=h.h.slice(0,C+1)+g)}if(C=g,C==".."||C==".")g="";else if(C.indexOf("./")!=-1||C.indexOf("/.")!=-1){g=C.lastIndexOf("/",0)==0,C=C.split("/");const R=[];for(let U=0;U<C.length;){const Y=C[U++];Y=="."?g&&U==C.length&&R.push(""):Y==".."?((R.length>1||R.length==1&&R[0]!="")&&R.pop(),g&&U==C.length&&R.push("")):(R.push(Y),g=!0)}g=R.join("/")}else g=C}return d?h.h=g:d=o.i.toString()!=="",d?kc(h,ap(o.i)):d=!!o.m,d&&(h.m=o.m),h};function ut(o){return new Jt(o)}function bi(o,h,d){o.j=d?Ei(h,!0):h,o.j&&(o.j=o.j.replace(/:$/,""))}function wi(o,h){if(h){if(h=Number(h),isNaN(h)||h<0)throw Error("Bad port number "+h);o.u=h}else o.u=null}function kc(o,h,d){h instanceof Ii?(o.i=h,GT(o.i,o.l)):(d||(h=Ti(h,zT)),o.i=new Ii(h,o.l))}function oe(o,h,d){o.i.set(h,d)}function ao(o){return oe(o,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),o}function Ei(o,h){return o?h?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function Ti(o,h,d){return typeof o=="string"?(o=encodeURI(o).replace(h,$T),d&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function $T(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var np=/[#\/\?@]/g,HT=/[#\?:]/g,jT=/[#\?]/g,zT=/[#\?@]/g,KT=/#/g;function Ii(o,h){this.h=this.g=null,this.i=o||null,this.j=!!h}function Cn(o){o.g||(o.g=new Map,o.h=0,o.i&&qT(o.i,function(h,d){o.add(decodeURIComponent(h.replace(/\+/g," ")),d)}))}n=Ii.prototype,n.add=function(o,h){Cn(this),this.i=null,o=gr(this,o);let d=this.g.get(o);return d||this.g.set(o,d=[]),d.push(h),this.h+=1,this};function rp(o,h){Cn(o),h=gr(o,h),o.g.has(h)&&(o.i=null,o.h-=o.g.get(h).length,o.g.delete(h))}function ip(o,h){return Cn(o),h=gr(o,h),o.g.has(h)}n.forEach=function(o,h){Cn(this),this.g.forEach(function(d,g){d.forEach(function(C){o.call(h,C,g,this)},this)},this)};function sp(o,h){Cn(o);let d=[];if(typeof h=="string")ip(o,h)&&(d=d.concat(o.g.get(gr(o,h))));else for(o=Array.from(o.g.values()),h=0;h<o.length;h++)d=d.concat(o[h]);return d}n.set=function(o,h){return Cn(this),this.i=null,o=gr(this,o),ip(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[h]),this.h+=1,this},n.get=function(o,h){return o?(o=sp(this,o),o.length>0?String(o[0]):h):h};function op(o,h,d){rp(o,h),d.length>0&&(o.i=null,o.g.set(gr(o,h),A(d)),o.h+=d.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const o=[],h=Array.from(this.g.keys());for(let g=0;g<h.length;g++){var d=h[g];const C=vi(d);d=sp(this,d);for(let R=0;R<d.length;R++){let U=C;d[R]!==""&&(U+="="+vi(d[R])),o.push(U)}}return this.i=o.join("&")};function ap(o){const h=new Ii;return h.i=o.i,o.g&&(h.g=new Map(o.g),h.h=o.h),h}function gr(o,h){return h=String(h),o.j&&(h=h.toLowerCase()),h}function GT(o,h){h&&!o.j&&(Cn(o),o.i=null,o.g.forEach(function(d,g){const C=g.toLowerCase();g!=C&&(rp(this,g),op(this,C,d))},o)),o.j=h}function WT(o,h){const d=new yi;if(a.Image){const g=new Image;g.onload=f(Zt,d,"TestLoadImage: loaded",!0,h,g),g.onerror=f(Zt,d,"TestLoadImage: error",!1,h,g),g.onabort=f(Zt,d,"TestLoadImage: abort",!1,h,g),g.ontimeout=f(Zt,d,"TestLoadImage: timeout",!1,h,g),a.setTimeout(function(){g.ontimeout&&g.ontimeout()},1e4),g.src=o}else h(!1)}function QT(o,h){const d=new yi,g=new AbortController,C=setTimeout(()=>{g.abort(),Zt(d,"TestPingServer: timeout",!1,h)},1e4);fetch(o,{signal:g.signal}).then(R=>{clearTimeout(C),R.ok?Zt(d,"TestPingServer: ok",!0,h):Zt(d,"TestPingServer: server error",!1,h)}).catch(()=>{clearTimeout(C),Zt(d,"TestPingServer: error",!1,h)})}function Zt(o,h,d,g,C){try{C&&(C.onload=null,C.onerror=null,C.onabort=null,C.ontimeout=null),g(d)}catch{}}function YT(){this.g=new NT}function Rc(o){this.i=o.Sb||null,this.h=o.ab||!1}p(Rc,Mf),Rc.prototype.g=function(){return new co(this.i,this.h)};function co(o,h){Re.call(this),this.H=o,this.o=h,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}p(co,Re),n=co.prototype,n.open=function(o,h){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=o,this.D=h,this.readyState=1,Ai(this)},n.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const h={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};o&&(h.body=o),(this.H||a).fetch(new Request(this.D,h)).then(this.Pa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,xi(this)),this.readyState=0},n.Pa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,Ai(this)),this.g&&(this.readyState=3,Ai(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof a.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;cp(this)}else o.text().then(this.Oa.bind(this),this.ga.bind(this))};function cp(o){o.j.read().then(o.Ma.bind(o)).catch(o.ga.bind(o))}n.Ma=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var h=o.value?o.value:new Uint8Array(0);(h=this.B.decode(h,{stream:!o.done}))&&(this.response=this.responseText+=h)}o.done?xi(this):Ai(this),this.readyState==3&&cp(this)}},n.Oa=function(o){this.g&&(this.response=this.responseText=o,xi(this))},n.Na=function(o){this.g&&(this.response=o,xi(this))},n.ga=function(){this.g&&xi(this)};function xi(o){o.readyState=4,o.l=null,o.j=null,o.B=null,Ai(o)}n.setRequestHeader=function(o,h){this.A.append(o,h)},n.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const o=[],h=this.h.entries();for(var d=h.next();!d.done;)d=d.value,o.push(d[0]+": "+d[1]),d=h.next();return o.join(`\r
`)};function Ai(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(co.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function lp(o){let h="";return Ne(o,function(d,g){h+=g,h+=":",h+=d,h+=`\r
`}),h}function Pc(o,h,d){e:{for(g in d){var g=!1;break e}g=!0}g||(d=lp(d),typeof o=="string"?d!=null&&vi(d):oe(o,h,d))}function ce(o){Re.call(this),this.headers=new Map,this.L=o||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}p(ce,Re);var XT=/^https?$/i,JT=["POST","PUT"];n=ce.prototype,n.Fa=function(o){this.H=o},n.ea=function(o,h,d,g){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);h=h?h.toUpperCase():"GET",this.D=o,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():jf.g(),this.g.onreadystatechange=w(u(this.Ca,this));try{this.B=!0,this.g.open(h,String(o),!0),this.B=!1}catch(R){up(this,R);return}if(o=d||"",d=new Map(this.headers),g)if(Object.getPrototypeOf(g)===Object.prototype)for(var C in g)d.set(C,g[C]);else if(typeof g.keys=="function"&&typeof g.get=="function")for(const R of g.keys())d.set(R,g.get(R));else throw Error("Unknown input type for opt_headers: "+String(g));g=Array.from(d.keys()).find(R=>R.toLowerCase()=="content-type"),C=a.FormData&&o instanceof a.FormData,!(Array.prototype.indexOf.call(JT,h,void 0)>=0)||g||C||d.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[R,U]of d)this.g.setRequestHeader(R,U);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(o),this.v=!1}catch(R){up(this,R)}};function up(o,h){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=h,o.o=5,hp(o),lo(o)}function hp(o){o.A||(o.A=!0,De(o,"complete"),De(o,"error"))}n.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=o||7,De(this,"complete"),De(this,"abort"),lo(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),lo(this,!0)),ce.Z.N.call(this)},n.Ca=function(){this.u||(this.B||this.v||this.j?dp(this):this.Xa())},n.Xa=function(){dp(this)};function dp(o){if(o.h&&typeof s<"u"){if(o.v&&en(o)==4)setTimeout(o.Ca.bind(o),0);else if(De(o,"readystatechange"),en(o)==4){o.h=!1;try{const R=o.ca();e:switch(R){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var h=!0;break e;default:h=!1}var d;if(!(d=h)){var g;if(g=R===0){let U=String(o.D).match(tp)[1]||null;!U&&a.self&&a.self.location&&(U=a.self.location.protocol.slice(0,-1)),g=!XT.test(U?U.toLowerCase():"")}d=g}if(d)De(o,"complete"),De(o,"success");else{o.o=6;try{var C=en(o)>2?o.g.statusText:""}catch{C=""}o.l=C+" ["+o.ca()+"]",hp(o)}}finally{lo(o)}}}}function lo(o,h){if(o.g){o.m&&(clearTimeout(o.m),o.m=null);const d=o.g;o.g=null,h||De(o,"ready");try{d.onreadystatechange=null}catch{}}}n.isActive=function(){return!!this.g};function en(o){return o.g?o.g.readyState:0}n.ca=function(){try{return en(this)>2?this.g.status:-1}catch{return-1}},n.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.La=function(o){if(this.g){var h=this.g.responseText;return o&&h.indexOf(o)==0&&(h=h.substring(o.length)),PT(h)}};function fp(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.F){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function ZT(o){const h={};o=(o.g&&en(o)>=2&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let g=0;g<o.length;g++){if(b(o[g]))continue;var d=MT(o[g]);const C=d[0];if(d=d[1],typeof d!="string")continue;d=d.trim();const R=h[C]||[];h[C]=R,R.push(d)}xT(h,function(g){return g.join(", ")})}n.ya=function(){return this.o},n.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function Si(o,h,d){return d&&d.internalChannelParams&&d.internalChannelParams[o]||h}function pp(o){this.za=0,this.i=[],this.j=new yi,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=Si("failFast",!1,o),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=Si("baseRetryDelayMs",5e3,o),this.Za=Si("retryDelaySeedMs",1e4,o),this.Ta=Si("forwardChannelMaxRetries",2,o),this.va=Si("forwardChannelRequestTimeoutMs",2e4,o),this.ma=o&&o.xmlHttpFactory||void 0,this.Ua=o&&o.Rb||void 0,this.Aa=o&&o.useFetchStreams||!1,this.O=void 0,this.L=o&&o.supportsCrossDomainXhr||!1,this.M="",this.h=new Yf(o&&o.concurrentRequestLimit),this.Ba=new YT,this.S=o&&o.fastHandshake||!1,this.R=o&&o.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=o&&o.Pb||!1,o&&o.ua&&this.j.ua(),o&&o.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&o&&o.detectBufferingProxy||!1,this.ia=void 0,o&&o.longPollingTimeout&&o.longPollingTimeout>0&&(this.ia=o.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}n=pp.prototype,n.ka=8,n.I=1,n.connect=function(o,h,d,g){Le(0),this.W=o,this.H=h||{},d&&g!==void 0&&(this.H.OSID=d,this.H.OAID=g),this.F=this.X,this.J=Tp(this,null,this.W),ho(this)};function Nc(o){if(gp(o),o.I==3){var h=o.V++,d=ut(o.J);if(oe(d,"SID",o.M),oe(d,"RID",h),oe(d,"TYPE","terminate"),Ci(o,d),h=new Xt(o,o.j,h),h.M=2,h.A=ao(ut(d)),d=!1,a.navigator&&a.navigator.sendBeacon)try{d=a.navigator.sendBeacon(h.A.toString(),"")}catch{}!d&&a.Image&&(new Image().src=h.A,d=!0),d||(h.g=Ip(h.j,null),h.g.ea(h.A)),h.F=Date.now(),oo(h)}Ep(o)}function uo(o){o.g&&(Lc(o),o.g.cancel(),o.g=null)}function gp(o){uo(o),o.v&&(a.clearTimeout(o.v),o.v=null),fo(o),o.h.cancel(),o.m&&(typeof o.m=="number"&&a.clearTimeout(o.m),o.m=null)}function ho(o){if(!Xf(o.h)&&!o.m){o.m=!0;var h=o.Ea;B||m(),j||(B(),j=!0),_.add(h,o),o.D=0}}function e0(o,h){return Jf(o.h)>=o.h.j-(o.m?1:0)?!1:o.m?(o.i=h.G.concat(o.i),!0):o.I==1||o.I==2||o.D>=(o.Sa?0:o.Ta)?!1:(o.m=mi(u(o.Ea,o,h),wp(o,o.D)),o.D++,!0)}n.Ea=function(o){if(this.m)if(this.m=null,this.I==1){if(!o){this.V=Math.floor(Math.random()*1e5),o=this.V++;const C=new Xt(this,this.j,o);let R=this.o;if(this.U&&(R?(R=Sf(R),kf(R,this.U)):R=this.U),this.u!==null||this.R||(C.J=R,R=null),this.S)e:{for(var h=0,d=0;d<this.i.length;d++){t:{var g=this.i[d];if("__data__"in g.map&&(g=g.map.__data__,typeof g=="string")){g=g.length;break t}g=void 0}if(g===void 0)break;if(h+=g,h>4096){h=d;break e}if(h===4096||d===this.i.length-1){h=d+1;break e}}h=1e3}else h=1e3;h=yp(this,C,h),d=ut(this.J),oe(d,"RID",o),oe(d,"CVER",22),this.G&&oe(d,"X-HTTP-Session-Id",this.G),Ci(this,d),R&&(this.R?h="headers="+vi(lp(R))+"&"+h:this.u&&Pc(d,this.u,R)),Cc(this.h,C),this.Ra&&oe(d,"TYPE","init"),this.S?(oe(d,"$req",h),oe(d,"SID","null"),C.U=!0,Ic(C,d,null)):Ic(C,d,h),this.I=2}}else this.I==3&&(o?mp(this,o):this.i.length==0||Xf(this.h)||mp(this))};function mp(o,h){var d;h?d=h.l:d=o.V++;const g=ut(o.J);oe(g,"SID",o.M),oe(g,"RID",d),oe(g,"AID",o.K),Ci(o,g),o.u&&o.o&&Pc(g,o.u,o.o),d=new Xt(o,o.j,d,o.D+1),o.u===null&&(d.J=o.o),h&&(o.i=h.G.concat(o.i)),h=yp(o,d,1e3),d.H=Math.round(o.va*.5)+Math.round(o.va*.5*Math.random()),Cc(o.h,d),Ic(d,g,h)}function Ci(o,h){o.H&&Ne(o.H,function(d,g){oe(h,g,d)}),o.l&&Ne({},function(d,g){oe(h,g,d)})}function yp(o,h,d){d=Math.min(o.i.length,d);const g=o.l?u(o.l.Ka,o.l,o):null;e:{var C=o.i;let Y=-1;for(;;){const ye=["count="+d];Y==-1?d>0?(Y=C[0].g,ye.push("ofs="+Y)):Y=0:ye.push("ofs="+Y);let ne=!0;for(let be=0;be<d;be++){var R=C[be].g;const ht=C[be].map;if(R-=Y,R<0)Y=Math.max(0,C[be].g-100),ne=!1;else try{R="req"+R+"_"||"";try{var U=ht instanceof Map?ht:Object.entries(ht);for(const[Rn,tn]of U){let nn=tn;c(tn)&&(nn=_c(tn)),ye.push(R+Rn+"="+encodeURIComponent(nn))}}catch(Rn){throw ye.push(R+"type="+encodeURIComponent("_badmap")),Rn}}catch{g&&g(ht)}}if(ne){U=ye.join("&");break e}}U=void 0}return o=o.i.splice(0,d),h.G=o,U}function vp(o){if(!o.g&&!o.v){o.Y=1;var h=o.Da;B||m(),j||(B(),j=!0),_.add(h,o),o.A=0}}function Dc(o){return o.g||o.v||o.A>=3?!1:(o.Y++,o.v=mi(u(o.Da,o),wp(o,o.A)),o.A++,!0)}n.Da=function(){if(this.v=null,_p(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var o=4*this.T;this.j.info("BP detection timer enabled: "+o),this.B=mi(u(this.Wa,this),o)}},n.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,Le(10),uo(this),_p(this))};function Lc(o){o.B!=null&&(a.clearTimeout(o.B),o.B=null)}function _p(o){o.g=new Xt(o,o.j,"rpc",o.Y),o.u===null&&(o.g.J=o.o),o.g.P=0;var h=ut(o.na);oe(h,"RID","rpc"),oe(h,"SID",o.M),oe(h,"AID",o.K),oe(h,"CI",o.F?"0":"1"),!o.F&&o.ia&&oe(h,"TO",o.ia),oe(h,"TYPE","xmlhttp"),Ci(o,h),o.u&&o.o&&Pc(h,o.u,o.o),o.O&&(o.g.H=o.O);var d=o.g;o=o.ba,d.M=1,d.A=ao(ut(h)),d.u=null,d.R=!0,Gf(d,o)}n.Va=function(){this.C!=null&&(this.C=null,uo(this),Dc(this),Le(19))};function fo(o){o.C!=null&&(a.clearTimeout(o.C),o.C=null)}function bp(o,h){var d=null;if(o.g==h){fo(o),Lc(o),o.g=null;var g=2}else if(Sc(o.h,h))d=h.G,Zf(o.h,h),g=1;else return;if(o.I!=0){if(h.o)if(g==1){d=h.u?h.u.length:0,h=Date.now()-h.F;var C=o.D;g=io(),De(g,new $f(g,d)),ho(o)}else vp(o);else if(C=h.m,C==3||C==0&&h.X>0||!(g==1&&e0(o,h)||g==2&&Dc(o)))switch(d&&d.length>0&&(h=o.h,h.i=h.i.concat(d)),C){case 1:kn(o,5);break;case 4:kn(o,10);break;case 3:kn(o,6);break;default:kn(o,2)}}}function wp(o,h){let d=o.Qa+Math.floor(Math.random()*o.Za);return o.isActive()||(d*=2),d*h}function kn(o,h){if(o.j.info("Error code "+h),h==2){var d=u(o.bb,o),g=o.Ua;const C=!g;g=new Jt(g||"//www.google.com/images/cleardot.gif"),a.location&&a.location.protocol=="http"||bi(g,"https"),ao(g),C?WT(g.toString(),d):QT(g.toString(),d)}else Le(2);o.I=0,o.l&&o.l.pa(h),Ep(o),gp(o)}n.bb=function(o){o?(this.j.info("Successfully pinged google.com"),Le(2)):(this.j.info("Failed to ping google.com"),Le(1))};function Ep(o){if(o.I=0,o.ja=[],o.l){const h=ep(o.h);(h.length!=0||o.i.length!=0)&&(T(o.ja,h),T(o.ja,o.i),o.h.i.length=0,A(o.i),o.i.length=0),o.l.oa()}}function Tp(o,h,d){var g=d instanceof Jt?ut(d):new Jt(d);if(g.g!="")h&&(g.g=h+"."+g.g),wi(g,g.u);else{var C=a.location;g=C.protocol,h=h?h+"."+C.hostname:C.hostname,C=+C.port;const R=new Jt(null);g&&bi(R,g),h&&(R.g=h),C&&wi(R,C),d&&(R.h=d),g=R}return d=o.G,h=o.wa,d&&h&&oe(g,d,h),oe(g,"VER",o.ka),Ci(o,g),g}function Ip(o,h,d){if(h&&!o.L)throw Error("Can't create secondary domain capable XhrIo object.");return h=o.Aa&&!o.ma?new ce(new Rc({ab:d})):new ce(o.ma),h.Fa(o.L),h}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function xp(){}n=xp.prototype,n.ra=function(){},n.qa=function(){},n.pa=function(){},n.oa=function(){},n.isActive=function(){return!0},n.Ka=function(){};function po(){}po.prototype.g=function(o,h){return new $e(o,h)};function $e(o,h){Re.call(this),this.g=new pp(h),this.l=o,this.h=h&&h.messageUrlParams||null,o=h&&h.messageHeaders||null,h&&h.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=h&&h.initMessageHeaders||null,h&&h.messageContentType&&(o?o["X-WebChannel-Content-Type"]=h.messageContentType:o={"X-WebChannel-Content-Type":h.messageContentType}),h&&h.sa&&(o?o["X-WebChannel-Client-Profile"]=h.sa:o={"X-WebChannel-Client-Profile":h.sa}),this.g.U=o,(o=h&&h.Qb)&&!b(o)&&(this.g.u=o),this.A=h&&h.supportsCrossDomainXhr||!1,this.v=h&&h.sendRawJson||!1,(h=h&&h.httpSessionIdParam)&&!b(h)&&(this.g.G=h,o=this.h,o!==null&&h in o&&(o=this.h,h in o&&delete o[h])),this.j=new mr(this)}p($e,Re),$e.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},$e.prototype.close=function(){Nc(this.g)},$e.prototype.o=function(o){var h=this.g;if(typeof o=="string"){var d={};d.__data__=o,o=d}else this.v&&(d={},d.__data__=_c(o),o=d);h.i.push(new BT(h.Ya++,o)),h.I==3&&ho(h)},$e.prototype.N=function(){this.g.l=null,delete this.j,Nc(this.g),delete this.g,$e.Z.N.call(this)};function Ap(o){bc.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var h=o.__sm__;if(h){e:{for(const d in h){o=d;break e}o=void 0}(this.i=o)&&(o=this.i,h=h!==null&&o in h?h[o]:void 0),this.data=h}else this.data=o}p(Ap,bc);function Sp(){wc.call(this),this.status=1}p(Sp,wc);function mr(o){this.g=o}p(mr,xp),mr.prototype.ra=function(){De(this.g,"a")},mr.prototype.qa=function(o){De(this.g,new Ap(o))},mr.prototype.pa=function(o){De(this.g,new Sp)},mr.prototype.oa=function(){De(this.g,"b")},po.prototype.createWebChannel=po.prototype.g,$e.prototype.send=$e.prototype.o,$e.prototype.open=$e.prototype.m,$e.prototype.close=$e.prototype.close,du=function(){return new po},hu=function(){return io()},uu=An,jo={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},so.NO_ERROR=0,so.TIMEOUT=8,so.HTTP_ERROR=6,ns=so,Hf.COMPLETE="complete",lu=Hf,Ff.EventType=pi,pi.OPEN="a",pi.CLOSE="b",pi.ERROR="c",pi.MESSAGE="d",Re.prototype.listen=Re.prototype.J,Or=Ff,ce.prototype.listenOnce=ce.prototype.K,ce.prototype.getLastError=ce.prototype.Ha,ce.prototype.getLastErrorCode=ce.prototype.ya,ce.prototype.getStatus=ce.prototype.ca,ce.prototype.getResponseJson=ce.prototype.La,ce.prototype.getResponseText=ce.prototype.la,ce.prototype.send=ce.prototype.ea,ce.prototype.setWithCredentials=ce.prototype.Fa,cu=ce}).apply(typeof ts<"u"?ts:typeof self<"u"?self:typeof window<"u"?window:{});/**
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
 */let jn="12.12.0";function Dv(n){jn=n}/**
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
 */const fn=new vo("@firebase/firestore");function zn(){return fn.logLevel}function H(n,...e){if(fn.logLevel<=X.DEBUG){const t=e.map(zo);fn.debug(`Firestore (${jn}): ${n}`,...t)}}function _t(n,...e){if(fn.logLevel<=X.ERROR){const t=e.map(zo);fn.error(`Firestore (${jn}): ${n}`,...t)}}function pn(n,...e){if(fn.logLevel<=X.WARN){const t=e.map(zo);fn.warn(`Firestore (${jn}): ${n}`,...t)}}function zo(n){if(typeof n=="string")return n;try{return function(t){return JSON.stringify(t)}(n)}catch{return n}}/**
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
 */function G(n,e,t){let r="Unexpected state";typeof e=="string"?r=e:t=e,fu(n,r,t)}function fu(n,e,t){let r=`FIRESTORE (${jn}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{r+=" CONTEXT: "+JSON.stringify(t)}catch{r+=" CONTEXT: "+t}throw _t(r),new Error(r)}function te(n,e,t,r){let i="Unexpected state";typeof t=="string"?i=t:r=t,n||fu(e,i,r)}function Q(n,e){return n}/**
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
 */class pu{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class Lv{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(xe.UNAUTHENTICATED))}shutdown(){}}class Vv{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class Ov{constructor(e){this.t=e,this.currentUser=xe.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){te(this.o===void 0,42304);let r=this.i;const i=l=>this.i!==r?(r=this.i,t(l)):Promise.resolve();let s=new bt;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new bt,e.enqueueRetryable(()=>i(this.currentUser))};const a=()=>{const l=s;e.enqueueRetryable(async()=>{await l.promise,await i(this.currentUser)})},c=l=>{H("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=l,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit(l=>c(l)),setTimeout(()=>{if(!this.auth){const l=this.t.getImmediate({optional:!0});l?c(l):(H("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new bt)}},0),a()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(r=>this.i!==e?(H("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(te(typeof r.accessToken=="string",31837,{l:r}),new pu(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return te(e===null||typeof e=="string",2055,{h:e}),new xe(e)}}class Mv{constructor(e,t,r){this.P=e,this.T=t,this.I=r,this.type="FirstParty",this.user=xe.FIRST_PARTY,this.R=new Map}A(){return this.I?this.I():null}get headers(){this.R.set("X-Goog-AuthUser",this.P);const e=this.A();return e&&this.R.set("Authorization",e),this.T&&this.R.set("X-Goog-Iam-Authorization-Token",this.T),this.R}}class Fv{constructor(e,t,r){this.P=e,this.T=t,this.I=r}getToken(){return Promise.resolve(new Mv(this.P,this.T,this.I))}start(e,t){e.enqueueRetryable(()=>t(xe.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class gu{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Uv{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,He(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){te(this.o===void 0,3512);const r=s=>{s.error!=null&&H("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${s.error.message}`);const a=s.token!==this.m;return this.m=s.token,H("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?t(s.token):Promise.resolve()};this.o=s=>{e.enqueueRetryable(()=>r(s))};const i=s=>{H("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=s,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(s=>i(s)),setTimeout(()=>{if(!this.appCheck){const s=this.V.getImmediate({optional:!0});s?i(s):H("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new gu(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(te(typeof t.token=="string",44558,{tokenResult:t}),this.m=t.token,new gu(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
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
 */function Bv(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
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
 */class Ko{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const i=Bv(40);for(let s=0;s<i.length;++s)r.length<20&&i[s]<t&&(r+=e.charAt(i[s]%62))}return r}}function J(n,e){return n<e?-1:n>e?1:0}function Go(n,e){const t=Math.min(n.length,e.length);for(let r=0;r<t;r++){const i=n.charAt(r),s=e.charAt(r);if(i!==s)return Wo(i)===Wo(s)?J(i,s):Wo(i)?1:-1}return J(n.length,e.length)}const qv=55296,$v=57343;function Wo(n){const e=n.charCodeAt(0);return e>=qv&&e<=$v}function Kn(n,e,t){return n.length===e.length&&n.every((r,i)=>t(r,e[i]))}/**
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
 */const mu="__name__";class rt{constructor(e,t,r){t===void 0?t=0:t>e.length&&G(637,{offset:t,range:e.length}),r===void 0?r=e.length-t:r>e.length-t&&G(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return rt.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof rt?e.forEach(r=>{t.push(r)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let i=0;i<r;i++){const s=rt.compareSegments(e.get(i),t.get(i));if(s!==0)return s}return J(e.length,t.length)}static compareSegments(e,t){const r=rt.isNumericId(e),i=rt.isNumericId(t);return r&&!i?-1:!r&&i?1:r&&i?rt.extractNumericId(e).compare(rt.extractNumericId(t)):Go(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return qt.fromString(e.substring(4,e.length-2))}}class re extends rt{construct(e,t,r){return new re(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new q(L.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(i=>i.length>0))}return new re(t)}static emptyPath(){return new re([])}}const Hv=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class we extends rt{construct(e,t,r){return new we(e,t,r)}static isValidIdentifier(e){return Hv.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),we.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===mu}static keyField(){return new we([mu])}static fromServerFormat(e){const t=[];let r="",i=0;const s=()=>{if(r.length===0)throw new q(L.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let a=!1;for(;i<e.length;){const c=e[i];if(c==="\\"){if(i+1===e.length)throw new q(L.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const l=e[i+1];if(l!=="\\"&&l!=="."&&l!=="`")throw new q(L.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=l,i+=2}else c==="`"?(a=!a,i++):c!=="."||a?(r+=c,i++):(s(),i++)}if(s(),a)throw new q(L.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new we(t)}static emptyPath(){return new we([])}}/**
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
 */class z{constructor(e){this.path=e}static fromPath(e){return new z(re.fromString(e))}static fromName(e){return new z(re.fromString(e).popFirst(5))}static empty(){return new z(re.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&re.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return re.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new z(new re(e.slice()))}}/**
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
 */function yu(n,e,t){if(!t)throw new q(L.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function jv(n,e,t,r){if(e===!0&&r===!0)throw new q(L.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function vu(n){if(!z.isDocumentKey(n))throw new q(L.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function _u(n){if(z.isDocumentKey(n))throw new q(L.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function bu(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function rs(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":G(12329,{type:typeof n})}function gn(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new q(L.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=rs(n);throw new q(L.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
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
 */function he(n,e){const t={typeString:n};return e&&(t.value=e),t}function Mr(n,e){if(!bu(n))throw new q(L.INVALID_ARGUMENT,"JSON must be an object");let t;for(const r in e)if(e[r]){const i=e[r].typeString,s="value"in e[r]?{value:e[r].value}:void 0;if(!(r in n)){t=`JSON missing required field: '${r}'`;break}const a=n[r];if(i&&typeof a!==i){t=`JSON field '${r}' must be a ${i}.`;break}if(s!==void 0&&a!==s.value){t=`Expected '${r}' field to equal '${s.value}'`;break}}if(t)throw new q(L.INVALID_ARGUMENT,t);return!0}/**
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
 */const wu=-62135596800,Eu=1e6;class ie{static now(){return ie.fromMillis(Date.now())}static fromDate(e){return ie.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor((e-1e3*t)*Eu);return new ie(t,r)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new q(L.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new q(L.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<wu)throw new q(L.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new q(L.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/Eu}_compareTo(e){return this.seconds===e.seconds?J(this.nanoseconds,e.nanoseconds):J(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:ie._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(Mr(e,ie._jsonSchema))return new ie(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-wu;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}ie._jsonSchemaVersion="firestore/timestamp/1.0",ie._jsonSchema={type:he("string",ie._jsonSchemaVersion),seconds:he("number"),nanoseconds:he("number")};/**
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
 */const Fr=-1;function zv(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,i=W.fromTimestamp(r===1e9?new ie(t+1,0):new ie(t,r));return new $t(i,z.empty(),e)}function Kv(n){return new $t(n.readTime,n.key,Fr)}class $t{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new $t(W.min(),z.empty(),Fr)}static max(){return new $t(W.max(),z.empty(),Fr)}}function Gv(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=z.comparator(n.documentKey,e.documentKey),t!==0?t:J(n.largestBatchId,e.largestBatchId))}/**
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
 */const Wv="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class Qv{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
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
 */async function Gn(n){if(n.code!==L.FAILED_PRECONDITION||n.message!==Wv)throw n;H("LocalStore","Unexpectedly lost primary lease")}/**
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
 */class V{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&G(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new V((r,i)=>{this.nextCallback=s=>{this.wrapSuccess(e,s).next(r,i)},this.catchCallback=s=>{this.wrapFailure(t,s).next(r,i)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof V?t:V.resolve(t)}catch(t){return V.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):V.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):V.reject(t)}static resolve(e){return new V((t,r)=>{t(e)})}static reject(e){return new V((t,r)=>{r(e)})}static waitFor(e){return new V((t,r)=>{let i=0,s=0,a=!1;e.forEach(c=>{++i,c.next(()=>{++s,a&&s===i&&t()},l=>r(l))}),a=!0,s===i&&t()})}static or(e){let t=V.resolve(!1);for(const r of e)t=t.next(i=>i?V.resolve(i):r());return t}static forEach(e,t){const r=[];return e.forEach((i,s)=>{r.push(t.call(this,i,s))}),this.waitFor(r)}static mapArray(e,t){return new V((r,i)=>{const s=e.length,a=new Array(s);let c=0;for(let l=0;l<s;l++){const u=l;t(e[u]).next(f=>{a[u]=f,++c,c===s&&r(a)},f=>i(f))}})}static doWhile(e,t){return new V((r,i)=>{const s=()=>{e()===!0?t().next(()=>{s()},i):r()};s()})}}function Yv(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function Wn(n){return n.name==="IndexedDbTransactionError"}/**
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
 */class is{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.ae(r),this.ue=r=>t.writeSequenceNumber(r))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ue&&this.ue(e),e}}is.ce=-1;/**
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
 */const Qo=-1;function ss(n){return n==null}function os(n){return n===0&&1/n==-1/0}function Xv(n){return typeof n=="number"&&Number.isInteger(n)&&!os(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
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
 */const Tu="";function Jv(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=Iu(e)),e=Zv(n.get(t),e);return Iu(e)}function Zv(n,e){let t=e;const r=n.length;for(let i=0;i<r;i++){const s=n.charAt(i);switch(s){case"\0":t+="";break;case Tu:t+="";break;default:t+=s}}return t}function Iu(n){return n+Tu+""}/**
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
 */function xu(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function mn(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function Au(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
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
 */class ae{constructor(e,t){this.comparator=e,this.root=t||Ee.EMPTY}insert(e,t){return new ae(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Ee.BLACK,null,null))}remove(e){return new ae(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Ee.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const i=this.comparator(e,r.key);if(i===0)return t+r.left.size;i<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){const e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new as(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new as(this.root,e,this.comparator,!1)}getReverseIterator(){return new as(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new as(this.root,e,this.comparator,!0)}}class as{constructor(e,t,r,i){this.isReverse=i,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=t?r(e.key,t):1,t&&i&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Ee{constructor(e,t,r,i,s){this.key=e,this.value=t,this.color=r??Ee.RED,this.left=i??Ee.EMPTY,this.right=s??Ee.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,i,s){return new Ee(e??this.key,t??this.value,r??this.color,i??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let i=this;const s=r(e,i.key);return i=s<0?i.copy(null,null,null,i.left.insert(e,t,r),null):s===0?i.copy(null,t,null,null,null):i.copy(null,null,null,null,i.right.insert(e,t,r)),i.fixUp()}removeMin(){if(this.left.isEmpty())return Ee.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,i=this;if(t(e,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(e,t),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),t(e,i.key)===0){if(i.right.isEmpty())return Ee.EMPTY;r=i.right.min(),i=i.copy(r.key,r.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(e,t))}return i.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Ee.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Ee.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw G(43730,{key:this.key,value:this.value});if(this.right.isRed())throw G(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw G(27949);return e+(this.isRed()?0:1)}}Ee.EMPTY=null,Ee.RED=!0,Ee.BLACK=!1,Ee.EMPTY=new class{constructor(){this.size=0}get key(){throw G(57766)}get value(){throw G(16141)}get color(){throw G(16727)}get left(){throw G(29726)}get right(){throw G(36894)}copy(e,t,r,i,s){return this}insert(e,t,r){return new Ee(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
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
 */class me{constructor(e){this.comparator=e,this.data=new ae(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const i=r.getNext();if(this.comparator(i.key,e[1])>=0)return;t(i.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new Su(this.data.getIterator())}getIteratorFrom(e){return new Su(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(r=>{t=t.add(r)}),t}isEqual(e){if(!(e instanceof me)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const i=t.getNext().key,s=r.getNext().key;if(this.comparator(i,s)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new me(this.comparator);return t.data=e,t}}class Su{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
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
 */class Cu extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
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
 */class Te{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(i){try{return atob(i)}catch(s){throw typeof DOMException<"u"&&s instanceof DOMException?new Cu("Invalid base64 string: "+s):s}}(e);return new Te(t)}static fromUint8Array(e){const t=function(i){let s="";for(let a=0;a<i.length;++a)s+=String.fromCharCode(i[a]);return s}(e);return new Te(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const r=new Uint8Array(t.length);for(let i=0;i<t.length;i++)r[i]=t.charCodeAt(i);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return J(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Te.EMPTY_BYTE_STRING=new Te("");const e_=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Ht(n){if(te(!!n,39018),typeof n=="string"){let e=0;const t=e_.exec(n);if(te(!!t,46558,{timestamp:n}),t[1]){let i=t[1];i=(i+"000000000").substr(0,9),e=Number(i)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:le(n.seconds),nanos:le(n.nanos)}}function le(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function jt(n){return typeof n=="string"?Te.fromBase64String(n):Te.fromUint8Array(n)}/**
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
 */const ku="server_timestamp",Ru="__type__",Pu="__previous_value__",Nu="__local_write_time__";function Yo(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[Ru])==null?void 0:r.stringValue)===ku}function cs(n){const e=n.mapValue.fields[Pu];return Yo(e)?cs(e):e}function Ur(n){const e=Ht(n.mapValue.fields[Nu].timestampValue);return new ie(e.seconds,e.nanos)}/**
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
 */class t_{constructor(e,t,r,i,s,a,c,l,u,f,p){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=i,this.ssl=s,this.forceLongPolling=a,this.autoDetectLongPolling=c,this.longPollingOptions=l,this.useFetchStreams=u,this.isUsingEmulator=f,this.apiKey=p}}const ls="(default)";class Br{constructor(e,t){this.projectId=e,this.database=t||ls}static empty(){return new Br("","")}get isDefaultDatabase(){return this.database===ls}isEqual(e){return e instanceof Br&&e.projectId===this.projectId&&e.database===this.database}}function n_(n,e){if(!Object.prototype.hasOwnProperty.apply(n.options,["projectId"]))throw new q(L.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Br(n.options.projectId,e)}/**
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
 */const Du="__type__",r_="__max__",us={mapValue:{}},Lu="__vector__",hs="value";function zt(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?Yo(n)?4:s_(n)?9007199254740991:i_(n)?10:11:G(28295,{value:n})}function it(n,e){if(n===e)return!0;const t=zt(n);if(t!==zt(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return Ur(n).isEqual(Ur(e));case 3:return function(i,s){if(typeof i.timestampValue=="string"&&typeof s.timestampValue=="string"&&i.timestampValue.length===s.timestampValue.length)return i.timestampValue===s.timestampValue;const a=Ht(i.timestampValue),c=Ht(s.timestampValue);return a.seconds===c.seconds&&a.nanos===c.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(i,s){return jt(i.bytesValue).isEqual(jt(s.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(i,s){return le(i.geoPointValue.latitude)===le(s.geoPointValue.latitude)&&le(i.geoPointValue.longitude)===le(s.geoPointValue.longitude)}(n,e);case 2:return function(i,s){if("integerValue"in i&&"integerValue"in s)return le(i.integerValue)===le(s.integerValue);if("doubleValue"in i&&"doubleValue"in s){const a=le(i.doubleValue),c=le(s.doubleValue);return a===c?os(a)===os(c):isNaN(a)&&isNaN(c)}return!1}(n,e);case 9:return Kn(n.arrayValue.values||[],e.arrayValue.values||[],it);case 10:case 11:return function(i,s){const a=i.mapValue.fields||{},c=s.mapValue.fields||{};if(xu(a)!==xu(c))return!1;for(const l in a)if(a.hasOwnProperty(l)&&(c[l]===void 0||!it(a[l],c[l])))return!1;return!0}(n,e);default:return G(52216,{left:n})}}function qr(n,e){return(n.values||[]).find(t=>it(t,e))!==void 0}function Qn(n,e){if(n===e)return 0;const t=zt(n),r=zt(e);if(t!==r)return J(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return J(n.booleanValue,e.booleanValue);case 2:return function(s,a){const c=le(s.integerValue||s.doubleValue),l=le(a.integerValue||a.doubleValue);return c<l?-1:c>l?1:c===l?0:isNaN(c)?isNaN(l)?0:-1:1}(n,e);case 3:return Vu(n.timestampValue,e.timestampValue);case 4:return Vu(Ur(n),Ur(e));case 5:return Go(n.stringValue,e.stringValue);case 6:return function(s,a){const c=jt(s),l=jt(a);return c.compareTo(l)}(n.bytesValue,e.bytesValue);case 7:return function(s,a){const c=s.split("/"),l=a.split("/");for(let u=0;u<c.length&&u<l.length;u++){const f=J(c[u],l[u]);if(f!==0)return f}return J(c.length,l.length)}(n.referenceValue,e.referenceValue);case 8:return function(s,a){const c=J(le(s.latitude),le(a.latitude));return c!==0?c:J(le(s.longitude),le(a.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return Ou(n.arrayValue,e.arrayValue);case 10:return function(s,a){var w,A,T,v;const c=s.fields||{},l=a.fields||{},u=(w=c[hs])==null?void 0:w.arrayValue,f=(A=l[hs])==null?void 0:A.arrayValue,p=J(((T=u==null?void 0:u.values)==null?void 0:T.length)||0,((v=f==null?void 0:f.values)==null?void 0:v.length)||0);return p!==0?p:Ou(u,f)}(n.mapValue,e.mapValue);case 11:return function(s,a){if(s===us.mapValue&&a===us.mapValue)return 0;if(s===us.mapValue)return 1;if(a===us.mapValue)return-1;const c=s.fields||{},l=Object.keys(c),u=a.fields||{},f=Object.keys(u);l.sort(),f.sort();for(let p=0;p<l.length&&p<f.length;++p){const w=Go(l[p],f[p]);if(w!==0)return w;const A=Qn(c[l[p]],u[f[p]]);if(A!==0)return A}return J(l.length,f.length)}(n.mapValue,e.mapValue);default:throw G(23264,{he:t})}}function Vu(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return J(n,e);const t=Ht(n),r=Ht(e),i=J(t.seconds,r.seconds);return i!==0?i:J(t.nanos,r.nanos)}function Ou(n,e){const t=n.values||[],r=e.values||[];for(let i=0;i<t.length&&i<r.length;++i){const s=Qn(t[i],r[i]);if(s)return s}return J(t.length,r.length)}function Yn(n){return Xo(n)}function Xo(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(t){const r=Ht(t);return`time(${r.seconds},${r.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(t){return jt(t).toBase64()}(n.bytesValue):"referenceValue"in n?function(t){return z.fromName(t).toString()}(n.referenceValue):"geoPointValue"in n?function(t){return`geo(${t.latitude},${t.longitude})`}(n.geoPointValue):"arrayValue"in n?function(t){let r="[",i=!0;for(const s of t.values||[])i?i=!1:r+=",",r+=Xo(s);return r+"]"}(n.arrayValue):"mapValue"in n?function(t){const r=Object.keys(t.fields||{}).sort();let i="{",s=!0;for(const a of r)s?s=!1:i+=",",i+=`${a}:${Xo(t.fields[a])}`;return i+"}"}(n.mapValue):G(61005,{value:n})}function ds(n){switch(zt(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=cs(n);return e?16+ds(e):16;case 5:return 2*n.stringValue.length;case 6:return jt(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return function(r){return(r.values||[]).reduce((i,s)=>i+ds(s),0)}(n.arrayValue);case 10:case 11:return function(r){let i=0;return mn(r.fields,(s,a)=>{i+=s.length+ds(a)}),i}(n.mapValue);default:throw G(13486,{value:n})}}function Mu(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function Jo(n){return!!n&&"integerValue"in n}function Zo(n){return!!n&&"arrayValue"in n}function Fu(n){return!!n&&"nullValue"in n}function Uu(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function fs(n){return!!n&&"mapValue"in n}function i_(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[Du])==null?void 0:r.stringValue)===Lu}function $r(n){if(n.geoPointValue)return{geoPointValue:{...n.geoPointValue}};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:{...n.timestampValue}};if(n.mapValue){const e={mapValue:{fields:{}}};return mn(n.mapValue.fields,(t,r)=>e.mapValue.fields[t]=$r(r)),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=$r(n.arrayValue.values[t]);return e}return{...n}}function s_(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===r_}/**
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
 */class je{constructor(e){this.value=e}static empty(){return new je({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!fs(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=$r(t)}setAll(e){let t=we.emptyPath(),r={},i=[];e.forEach((a,c)=>{if(!t.isImmediateParentOf(c)){const l=this.getFieldsMap(t);this.applyChanges(l,r,i),r={},i=[],t=c.popLast()}a?r[c.lastSegment()]=$r(a):i.push(c.lastSegment())});const s=this.getFieldsMap(t);this.applyChanges(s,r,i)}delete(e){const t=this.field(e.popLast());fs(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return it(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let i=t.mapValue.fields[e.get(r)];fs(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=i),t=i}return t.mapValue.fields}applyChanges(e,t,r){mn(t,(i,s)=>e[i]=s);for(const i of r)delete e[i]}clone(){return new je($r(this.value))}}function Bu(n){const e=[];return mn(n.fields,(t,r)=>{const i=new we([t]);if(fs(r)){const s=Bu(r.mapValue).fields;if(s.length===0)e.push(i);else for(const a of s)e.push(i.child(a))}else e.push(i)}),new Xe(e)}/**
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
 */class ps{constructor(e,t){this.position=e,this.inclusive=t}}function qu(n,e,t){let r=0;for(let i=0;i<n.position.length;i++){const s=e[i],a=n.position[i];if(s.field.isKeyField()?r=z.comparator(z.fromName(a.referenceValue),t.key):r=Qn(a,t.data.field(s.field)),s.dir==="desc"&&(r*=-1),r!==0)break}return r}function $u(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!it(n.position[t],e.position[t]))return!1;return!0}/**
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
 */class gs{constructor(e,t="asc"){this.field=e,this.dir=t}}function o_(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
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
 */class Hu{}class de extends Hu{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new c_(e,t,r):t==="array-contains"?new h_(e,r):t==="in"?new d_(e,r):t==="not-in"?new f_(e,r):t==="array-contains-any"?new p_(e,r):new de(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new l_(e,r):new u_(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(Qn(t,this.value)):t!==null&&zt(this.value)===zt(t)&&this.matchesComparison(Qn(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return G(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Je extends Hu{constructor(e,t){super(),this.filters=e,this.op=t,this.Pe=null}static create(e,t){return new Je(e,t)}matches(e){return ju(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.Pe!==null||(this.Pe=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}}function ju(n){return n.op==="and"}function zu(n){return a_(n)&&ju(n)}function a_(n){for(const e of n.filters)if(e instanceof Je)return!1;return!0}function ea(n){if(n instanceof de)return n.field.canonicalString()+n.op.toString()+Yn(n.value);if(zu(n))return n.filters.map(e=>ea(e)).join(",");{const e=n.filters.map(t=>ea(t)).join(",");return`${n.op}(${e})`}}function Ku(n,e){return n instanceof de?function(r,i){return i instanceof de&&r.op===i.op&&r.field.isEqual(i.field)&&it(r.value,i.value)}(n,e):n instanceof Je?function(r,i){return i instanceof Je&&r.op===i.op&&r.filters.length===i.filters.length?r.filters.reduce((s,a,c)=>s&&Ku(a,i.filters[c]),!0):!1}(n,e):void G(19439)}function Gu(n){return n instanceof de?function(t){return`${t.field.canonicalString()} ${t.op} ${Yn(t.value)}`}(n):n instanceof Je?function(t){return t.op.toString()+" {"+t.getFilters().map(Gu).join(" ,")+"}"}(n):"Filter"}class c_ extends de{constructor(e,t,r){super(e,t,r),this.key=z.fromName(r.referenceValue)}matches(e){const t=z.comparator(e.key,this.key);return this.matchesComparison(t)}}class l_ extends de{constructor(e,t){super(e,"in",t),this.keys=Wu("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class u_ extends de{constructor(e,t){super(e,"not-in",t),this.keys=Wu("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function Wu(n,e){var t;return(((t=e.arrayValue)==null?void 0:t.values)||[]).map(r=>z.fromName(r.referenceValue))}class h_ extends de{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Zo(t)&&qr(t.arrayValue,this.value)}}class d_ extends de{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&qr(this.value.arrayValue,t)}}class f_ extends de{constructor(e,t){super(e,"not-in",t)}matches(e){if(qr(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!qr(this.value.arrayValue,t)}}class p_ extends de{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Zo(t)||!t.arrayValue.values)&&t.arrayValue.values.some(r=>qr(this.value.arrayValue,r))}}/**
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
 */class g_{constructor(e,t=null,r=[],i=[],s=null,a=null,c=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=i,this.limit=s,this.startAt=a,this.endAt=c,this.Te=null}}function Qu(n,e=null,t=[],r=[],i=null,s=null,a=null){return new g_(n,e,t,r,i,s,a)}function ta(n){const e=Q(n);if(e.Te===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(r=>ea(r)).join(","),t+="|ob:",t+=e.orderBy.map(r=>function(s){return s.field.canonicalString()+s.dir}(r)).join(","),ss(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(r=>Yn(r)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(r=>Yn(r)).join(",")),e.Te=t}return e.Te}function na(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!o_(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!Ku(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!$u(n.startAt,e.startAt)&&$u(n.endAt,e.endAt)}function ra(n){return z.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
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
 */class Hr{constructor(e,t=null,r=[],i=[],s=null,a="F",c=null,l=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=i,this.limit=s,this.limitType=a,this.startAt=c,this.endAt=l,this.Ee=null,this.Ie=null,this.Re=null,this.startAt,this.endAt}}function m_(n,e,t,r,i,s,a,c){return new Hr(n,e,t,r,i,s,a,c)}function ia(n){return new Hr(n)}function Yu(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function y_(n){return z.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function Xu(n){return n.collectionGroup!==null}function jr(n){const e=Q(n);if(e.Ee===null){e.Ee=[];const t=new Set;for(const s of e.explicitOrderBy)e.Ee.push(s),t.add(s.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let c=new me(we.comparator);return a.filters.forEach(l=>{l.getFlattenedFilters().forEach(u=>{u.isInequality()&&(c=c.add(u.field))})}),c})(e).forEach(s=>{t.has(s.canonicalString())||s.isKeyField()||e.Ee.push(new gs(s,r))}),t.has(we.keyField().canonicalString())||e.Ee.push(new gs(we.keyField(),r))}return e.Ee}function st(n){const e=Q(n);return e.Ie||(e.Ie=v_(e,jr(n))),e.Ie}function v_(n,e){if(n.limitType==="F")return Qu(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map(i=>{const s=i.dir==="desc"?"asc":"desc";return new gs(i.field,s)});const t=n.endAt?new ps(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new ps(n.startAt.position,n.startAt.inclusive):null;return Qu(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function sa(n,e){const t=n.filters.concat([e]);return new Hr(n.path,n.collectionGroup,n.explicitOrderBy.slice(),t,n.limit,n.limitType,n.startAt,n.endAt)}function oa(n,e,t){return new Hr(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function ms(n,e){return na(st(n),st(e))&&n.limitType===e.limitType}function Ju(n){return`${ta(st(n))}|lt:${n.limitType}`}function Xn(n){return`Query(target=${function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map(i=>Gu(i)).join(", ")}]`),ss(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map(i=>function(a){return`${a.field.canonicalString()} (${a.dir})`}(i)).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map(i=>Yn(i)).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map(i=>Yn(i)).join(",")),`Target(${r})`}(st(n))}; limitType=${n.limitType})`}function ys(n,e){return e.isFoundDocument()&&function(r,i){const s=i.key.path;return r.collectionGroup!==null?i.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(s):z.isDocumentKey(r.path)?r.path.isEqual(s):r.path.isImmediateParentOf(s)}(n,e)&&function(r,i){for(const s of jr(r))if(!s.field.isKeyField()&&i.data.field(s.field)===null)return!1;return!0}(n,e)&&function(r,i){for(const s of r.filters)if(!s.matches(i))return!1;return!0}(n,e)&&function(r,i){return!(r.startAt&&!function(a,c,l){const u=qu(a,c,l);return a.inclusive?u<=0:u<0}(r.startAt,jr(r),i)||r.endAt&&!function(a,c,l){const u=qu(a,c,l);return a.inclusive?u>=0:u>0}(r.endAt,jr(r),i))}(n,e)}function __(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function Zu(n){return(e,t)=>{let r=!1;for(const i of jr(n)){const s=b_(i,e,t);if(s!==0)return s;r=r||i.field.isKeyField()}return 0}}function b_(n,e,t){const r=n.field.isKeyField()?z.comparator(e.key,t.key):function(s,a,c){const l=a.data.field(s),u=c.data.field(s);return l!==null&&u!==null?Qn(l,u):G(42886)}(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return G(19790,{direction:n.dir})}}/**
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
 */class yn{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[i,s]of r)if(this.equalsFn(i,e))return s}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),i=this.inner[r];if(i===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let s=0;s<i.length;s++)if(this.equalsFn(i[s][0],e))return void(i[s]=[e,t]);i.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let i=0;i<r.length;i++)if(this.equalsFn(r[i][0],e))return r.length===1?delete this.inner[t]:r.splice(i,1),this.innerSize--,!0;return!1}forEach(e){mn(this.inner,(t,r)=>{for(const[i,s]of r)e(i,s)})}isEmpty(){return Au(this.inner)}size(){return this.innerSize}}/**
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
 */const w_=new ae(z.comparator);function wt(){return w_}const eh=new ae(z.comparator);function zr(...n){let e=eh;for(const t of n)e=e.insert(t.key,t);return e}function th(n){let e=eh;return n.forEach((t,r)=>e=e.insert(t,r.overlayedDocument)),e}function vn(){return Kr()}function nh(){return Kr()}function Kr(){return new yn(n=>n.toString(),(n,e)=>n.isEqual(e))}const E_=new ae(z.comparator),T_=new me(z.comparator);function Z(...n){let e=T_;for(const t of n)e=e.add(t);return e}const I_=new me(J);function x_(){return I_}/**
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
 */function aa(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:os(e)?"-0":e}}function rh(n){return{integerValue:""+n}}function A_(n,e){return Xv(e)?rh(e):aa(n,e)}/**
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
 */class vs{constructor(){this._=void 0}}function S_(n,e,t){return n instanceof Gr?function(i,s){const a={fields:{[Ru]:{stringValue:ku},[Nu]:{timestampValue:{seconds:i.seconds,nanos:i.nanoseconds}}}};return s&&Yo(s)&&(s=cs(s)),s&&(a.fields[Pu]=s),{mapValue:a}}(t,e):n instanceof Wr?sh(n,e):n instanceof Qr?oh(n,e):function(i,s){const a=ih(i,s),c=ah(a)+ah(i.Ae);return Jo(a)&&Jo(i.Ae)?rh(c):aa(i.serializer,c)}(n,e)}function C_(n,e,t){return n instanceof Wr?sh(n,e):n instanceof Qr?oh(n,e):t}function ih(n,e){return n instanceof _s?function(r){return Jo(r)||function(s){return!!s&&"doubleValue"in s}(r)}(e)?e:{integerValue:0}:null}class Gr extends vs{}class Wr extends vs{constructor(e){super(),this.elements=e}}function sh(n,e){const t=ch(e);for(const r of n.elements)t.some(i=>it(i,r))||t.push(r);return{arrayValue:{values:t}}}class Qr extends vs{constructor(e){super(),this.elements=e}}function oh(n,e){let t=ch(e);for(const r of n.elements)t=t.filter(i=>!it(i,r));return{arrayValue:{values:t}}}class _s extends vs{constructor(e,t){super(),this.serializer=e,this.Ae=t}}function ah(n){return le(n.integerValue||n.doubleValue)}function ch(n){return Zo(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}/**
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
 */class k_{constructor(e,t){this.field=e,this.transform=t}}function R_(n,e){return n.field.isEqual(e.field)&&function(r,i){return r instanceof Wr&&i instanceof Wr||r instanceof Qr&&i instanceof Qr?Kn(r.elements,i.elements,it):r instanceof _s&&i instanceof _s?it(r.Ae,i.Ae):r instanceof Gr&&i instanceof Gr}(n.transform,e.transform)}class P_{constructor(e,t){this.version=e,this.transformResults=t}}class Et{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Et}static exists(e){return new Et(void 0,e)}static updateTime(e){return new Et(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function bs(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class ws{}function lh(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new ph(n.key,Et.none()):new Xr(n.key,n.data,Et.none());{const t=n.data,r=je.empty();let i=new me(we.comparator);for(let s of e.fields)if(!i.has(s)){let a=t.field(s);a===null&&s.length>1&&(s=s.popLast(),a=t.field(s)),a===null?r.delete(s):r.set(s,a),i=i.add(s)}return new _n(n.key,r,new Xe(i.toArray()),Et.none())}}function N_(n,e,t){n instanceof Xr?function(i,s,a){const c=i.value.clone(),l=dh(i.fieldTransforms,s,a.transformResults);c.setAll(l),s.convertToFoundDocument(a.version,c).setHasCommittedMutations()}(n,e,t):n instanceof _n?function(i,s,a){if(!bs(i.precondition,s))return void s.convertToUnknownDocument(a.version);const c=dh(i.fieldTransforms,s,a.transformResults),l=s.data;l.setAll(hh(i)),l.setAll(c),s.convertToFoundDocument(a.version,l).setHasCommittedMutations()}(n,e,t):function(i,s,a){s.convertToNoDocument(a.version).setHasCommittedMutations()}(0,e,t)}function Yr(n,e,t,r){return n instanceof Xr?function(s,a,c,l){if(!bs(s.precondition,a))return c;const u=s.value.clone(),f=fh(s.fieldTransforms,l,a);return u.setAll(f),a.convertToFoundDocument(a.version,u).setHasLocalMutations(),null}(n,e,t,r):n instanceof _n?function(s,a,c,l){if(!bs(s.precondition,a))return c;const u=fh(s.fieldTransforms,l,a),f=a.data;return f.setAll(hh(s)),f.setAll(u),a.convertToFoundDocument(a.version,f).setHasLocalMutations(),c===null?null:c.unionWith(s.fieldMask.fields).unionWith(s.fieldTransforms.map(p=>p.field))}(n,e,t,r):function(s,a,c){return bs(s.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):c}(n,e,t)}function D_(n,e){let t=null;for(const r of n.fieldTransforms){const i=e.data.field(r.field),s=ih(r.transform,i||null);s!=null&&(t===null&&(t=je.empty()),t.set(r.field,s))}return t||null}function uh(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!function(r,i){return r===void 0&&i===void 0||!(!r||!i)&&Kn(r,i,(s,a)=>R_(s,a))}(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class Xr extends ws{constructor(e,t,r,i=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class _n extends ws{constructor(e,t,r,i,s=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=i,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function hh(n){const e=new Map;return n.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}}),e}function dh(n,e,t){const r=new Map;te(n.length===t.length,32656,{Ve:t.length,de:n.length});for(let i=0;i<t.length;i++){const s=n[i],a=s.transform,c=e.data.field(s.field);r.set(s.field,C_(a,c,t[i]))}return r}function fh(n,e,t){const r=new Map;for(const i of n){const s=i.transform,a=t.data.field(i.field);r.set(i.field,S_(s,a,e))}return r}class ph extends ws{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class L_ extends ws{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
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
 */class V_{constructor(e,t,r,i){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=i}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let i=0;i<this.mutations.length;i++){const s=this.mutations[i];s.key.isEqual(e.key)&&N_(s,e,r[i])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=Yr(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=Yr(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=nh();return this.mutations.forEach(i=>{const s=e.get(i.key),a=s.overlayedDocument;let c=this.applyToLocalView(a,s.mutatedFields);c=t.has(i.key)?null:c;const l=lh(a,c);l!==null&&r.set(i.key,l),a.isValidDocument()||a.convertToNoDocument(W.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),Z())}isEqual(e){return this.batchId===e.batchId&&Kn(this.mutations,e.mutations,(t,r)=>uh(t,r))&&Kn(this.baseMutations,e.baseMutations,(t,r)=>uh(t,r))}}class ca{constructor(e,t,r,i){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=i}static from(e,t,r){te(e.mutations.length===r.length,58842,{me:e.mutations.length,fe:r.length});let i=function(){return E_}();const s=e.mutations;for(let a=0;a<s.length;a++)i=i.insert(s[a].key,r[a].version);return new ca(e,t,r,i)}}/**
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
 */class O_{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
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
 */class M_{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
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
 */var fe,ee;function F_(n){switch(n){case L.OK:return G(64938);case L.CANCELLED:case L.UNKNOWN:case L.DEADLINE_EXCEEDED:case L.RESOURCE_EXHAUSTED:case L.INTERNAL:case L.UNAVAILABLE:case L.UNAUTHENTICATED:return!1;case L.INVALID_ARGUMENT:case L.NOT_FOUND:case L.ALREADY_EXISTS:case L.PERMISSION_DENIED:case L.FAILED_PRECONDITION:case L.ABORTED:case L.OUT_OF_RANGE:case L.UNIMPLEMENTED:case L.DATA_LOSS:return!0;default:return G(15467,{code:n})}}function gh(n){if(n===void 0)return _t("GRPC error has no .code"),L.UNKNOWN;switch(n){case fe.OK:return L.OK;case fe.CANCELLED:return L.CANCELLED;case fe.UNKNOWN:return L.UNKNOWN;case fe.DEADLINE_EXCEEDED:return L.DEADLINE_EXCEEDED;case fe.RESOURCE_EXHAUSTED:return L.RESOURCE_EXHAUSTED;case fe.INTERNAL:return L.INTERNAL;case fe.UNAVAILABLE:return L.UNAVAILABLE;case fe.UNAUTHENTICATED:return L.UNAUTHENTICATED;case fe.INVALID_ARGUMENT:return L.INVALID_ARGUMENT;case fe.NOT_FOUND:return L.NOT_FOUND;case fe.ALREADY_EXISTS:return L.ALREADY_EXISTS;case fe.PERMISSION_DENIED:return L.PERMISSION_DENIED;case fe.FAILED_PRECONDITION:return L.FAILED_PRECONDITION;case fe.ABORTED:return L.ABORTED;case fe.OUT_OF_RANGE:return L.OUT_OF_RANGE;case fe.UNIMPLEMENTED:return L.UNIMPLEMENTED;case fe.DATA_LOSS:return L.DATA_LOSS;default:return G(39323,{code:n})}}(ee=fe||(fe={}))[ee.OK=0]="OK",ee[ee.CANCELLED=1]="CANCELLED",ee[ee.UNKNOWN=2]="UNKNOWN",ee[ee.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",ee[ee.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",ee[ee.NOT_FOUND=5]="NOT_FOUND",ee[ee.ALREADY_EXISTS=6]="ALREADY_EXISTS",ee[ee.PERMISSION_DENIED=7]="PERMISSION_DENIED",ee[ee.UNAUTHENTICATED=16]="UNAUTHENTICATED",ee[ee.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",ee[ee.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",ee[ee.ABORTED=10]="ABORTED",ee[ee.OUT_OF_RANGE=11]="OUT_OF_RANGE",ee[ee.UNIMPLEMENTED=12]="UNIMPLEMENTED",ee[ee.INTERNAL=13]="INTERNAL",ee[ee.UNAVAILABLE=14]="UNAVAILABLE",ee[ee.DATA_LOSS=15]="DATA_LOSS";/**
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
 */function U_(){return new TextEncoder}/**
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
 */const B_=new qt([4294967295,4294967295],0);function mh(n){const e=U_().encode(n),t=new au;return t.update(e),new Uint8Array(t.digest())}function yh(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),i=e.getUint32(8,!0),s=e.getUint32(12,!0);return[new qt([t,r],0),new qt([i,s],0)]}class la{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new Jr(`Invalid padding: ${t}`);if(r<0)throw new Jr(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Jr(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new Jr(`Invalid padding when bitmap length is 0: ${t}`);this.ge=8*e.length-t,this.pe=qt.fromNumber(this.ge)}ye(e,t,r){let i=e.add(t.multiply(qt.fromNumber(r)));return i.compare(B_)===1&&(i=new qt([i.getBits(0),i.getBits(1)],0)),i.modulo(this.pe).toNumber()}we(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.ge===0)return!1;const t=mh(e),[r,i]=yh(t);for(let s=0;s<this.hashCount;s++){const a=this.ye(r,i,s);if(!this.we(a))return!1}return!0}static create(e,t,r){const i=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),a=new la(s,i,t);return r.forEach(c=>a.insert(c)),a}insert(e){if(this.ge===0)return;const t=mh(e),[r,i]=yh(t);for(let s=0;s<this.hashCount;s++){const a=this.ye(r,i,s);this.Se(a)}}Se(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class Jr extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
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
 */class Es{constructor(e,t,r,i,s){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=i,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const i=new Map;return i.set(e,Zr.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new Es(W.min(),i,new ae(J),wt(),Z())}}class Zr{constructor(e,t,r,i,s){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=i,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new Zr(r,t,Z(),Z(),Z())}}/**
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
 */class Ts{constructor(e,t,r,i){this.be=e,this.removedTargetIds=t,this.key=r,this.De=i}}class vh{constructor(e,t){this.targetId=e,this.Ce=t}}class _h{constructor(e,t,r=Te.EMPTY_BYTE_STRING,i=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=i}}class bh{constructor(){this.ve=0,this.Fe=wh(),this.Me=Te.EMPTY_BYTE_STRING,this.xe=!1,this.Oe=!0}get current(){return this.xe}get resumeToken(){return this.Me}get Ne(){return this.ve!==0}get Be(){return this.Oe}Le(e){e.approximateByteSize()>0&&(this.Oe=!0,this.Me=e)}ke(){let e=Z(),t=Z(),r=Z();return this.Fe.forEach((i,s)=>{switch(s){case 0:e=e.add(i);break;case 2:t=t.add(i);break;case 1:r=r.add(i);break;default:G(38017,{changeType:s})}}),new Zr(this.Me,this.xe,e,t,r)}qe(){this.Oe=!1,this.Fe=wh()}Ke(e,t){this.Oe=!0,this.Fe=this.Fe.insert(e,t)}Ue(e){this.Oe=!0,this.Fe=this.Fe.remove(e)}$e(){this.ve+=1}We(){this.ve-=1,te(this.ve>=0,3241,{ve:this.ve})}Qe(){this.Oe=!0,this.xe=!0}}class q_{constructor(e){this.Ge=e,this.ze=new Map,this.je=wt(),this.Je=Is(),this.He=Is(),this.Ze=new ae(J)}Xe(e){for(const t of e.be)e.De&&e.De.isFoundDocument()?this.Ye(t,e.De):this.et(t,e.key,e.De);for(const t of e.removedTargetIds)this.et(t,e.key,e.De)}tt(e){this.forEachTarget(e,t=>{const r=this.nt(t);switch(e.state){case 0:this.rt(t)&&r.Le(e.resumeToken);break;case 1:r.We(),r.Ne||r.qe(),r.Le(e.resumeToken);break;case 2:r.We(),r.Ne||this.removeTarget(t);break;case 3:this.rt(t)&&(r.Qe(),r.Le(e.resumeToken));break;case 4:this.rt(t)&&(this.it(t),r.Le(e.resumeToken));break;default:G(56790,{state:e.state})}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.ze.forEach((r,i)=>{this.rt(i)&&t(i)})}st(e){const t=e.targetId,r=e.Ce.count,i=this.ot(t);if(i){const s=i.target;if(ra(s))if(r===0){const a=new z(s.path);this.et(t,a,Ae.newNoDocument(a,W.min()))}else te(r===1,20013,{expectedCount:r});else{const a=this._t(t);if(a!==r){const c=this.ut(e),l=c?this.ct(c,e,a):1;if(l!==0){this.it(t);const u=l===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ze=this.Ze.insert(t,u)}}}}}ut(e){const t=e.Ce.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:i=0},hashCount:s=0}=t;let a,c;try{a=jt(r).toUint8Array()}catch(l){if(l instanceof Cu)return pn("Decoding the base64 bloom filter in existence filter failed ("+l.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw l}try{c=new la(a,i,s)}catch(l){return pn(l instanceof Jr?"BloomFilter error: ":"Applying bloom filter failed: ",l),null}return c.ge===0?null:c}ct(e,t,r){return t.Ce.count===r-this.Pt(e,t.targetId)?0:2}Pt(e,t){const r=this.Ge.getRemoteKeysForTarget(t);let i=0;return r.forEach(s=>{const a=this.Ge.ht(),c=`projects/${a.projectId}/databases/${a.database}/documents/${s.path.canonicalString()}`;e.mightContain(c)||(this.et(t,s,null),i++)}),i}Tt(e){const t=new Map;this.ze.forEach((s,a)=>{const c=this.ot(a);if(c){if(s.current&&ra(c.target)){const l=new z(c.target.path);this.Et(l).has(a)||this.It(a,l)||this.et(a,l,Ae.newNoDocument(l,e))}s.Be&&(t.set(a,s.ke()),s.qe())}});let r=Z();this.He.forEach((s,a)=>{let c=!0;a.forEachWhile(l=>{const u=this.ot(l);return!u||u.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)}),c&&(r=r.add(s))}),this.je.forEach((s,a)=>a.setReadTime(e));const i=new Es(e,t,this.Ze,this.je,r);return this.je=wt(),this.Je=Is(),this.He=Is(),this.Ze=new ae(J),i}Ye(e,t){if(!this.rt(e))return;const r=this.It(e,t.key)?2:0;this.nt(e).Ke(t.key,r),this.je=this.je.insert(t.key,t),this.Je=this.Je.insert(t.key,this.Et(t.key).add(e)),this.He=this.He.insert(t.key,this.Rt(t.key).add(e))}et(e,t,r){if(!this.rt(e))return;const i=this.nt(e);this.It(e,t)?i.Ke(t,1):i.Ue(t),this.He=this.He.insert(t,this.Rt(t).delete(e)),this.He=this.He.insert(t,this.Rt(t).add(e)),r&&(this.je=this.je.insert(t,r))}removeTarget(e){this.ze.delete(e)}_t(e){const t=this.nt(e).ke();return this.Ge.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}$e(e){this.nt(e).$e()}nt(e){let t=this.ze.get(e);return t||(t=new bh,this.ze.set(e,t)),t}Rt(e){let t=this.He.get(e);return t||(t=new me(J),this.He=this.He.insert(e,t)),t}Et(e){let t=this.Je.get(e);return t||(t=new me(J),this.Je=this.Je.insert(e,t)),t}rt(e){const t=this.ot(e)!==null;return t||H("WatchChangeAggregator","Detected inactive target",e),t}ot(e){const t=this.ze.get(e);return t&&t.Ne?null:this.Ge.At(e)}it(e){this.ze.set(e,new bh),this.Ge.getRemoteKeysForTarget(e).forEach(t=>{this.et(e,t,null)})}It(e,t){return this.Ge.getRemoteKeysForTarget(e).has(t)}}function Is(){return new ae(z.comparator)}function wh(){return new ae(z.comparator)}const $_={asc:"ASCENDING",desc:"DESCENDING"},H_={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},j_={and:"AND",or:"OR"};class z_{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function ua(n,e){return n.useProto3Json||ss(e)?e:{value:e}}function xs(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Eh(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function K_(n,e){return xs(n,e.toTimestamp())}function ot(n){return te(!!n,49232),W.fromTimestamp(function(t){const r=Ht(t);return new ie(r.seconds,r.nanos)}(n))}function ha(n,e){return da(n,e).canonicalString()}function da(n,e){const t=function(i){return new re(["projects",i.projectId,"databases",i.database])}(n).child("documents");return e===void 0?t:t.child(e)}function Th(n){const e=re.fromString(n);return te(kh(e),10190,{key:e.toString()}),e}function fa(n,e){return ha(n.databaseId,e.path)}function pa(n,e){const t=Th(e);if(t.get(1)!==n.databaseId.projectId)throw new q(L.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new q(L.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new z(xh(t))}function Ih(n,e){return ha(n.databaseId,e)}function G_(n){const e=Th(n);return e.length===4?re.emptyPath():xh(e)}function ga(n){return new re(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function xh(n){return te(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function Ah(n,e,t){return{name:fa(n,e),fields:t.value.mapValue.fields}}function W_(n,e){let t;if("targetChange"in e){e.targetChange;const r=function(u){return u==="NO_CHANGE"?0:u==="ADD"?1:u==="REMOVE"?2:u==="CURRENT"?3:u==="RESET"?4:G(39313,{state:u})}(e.targetChange.targetChangeType||"NO_CHANGE"),i=e.targetChange.targetIds||[],s=function(u,f){return u.useProto3Json?(te(f===void 0||typeof f=="string",58123),Te.fromBase64String(f||"")):(te(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),Te.fromUint8Array(f||new Uint8Array))}(n,e.targetChange.resumeToken),a=e.targetChange.cause,c=a&&function(u){const f=u.code===void 0?L.UNKNOWN:gh(u.code);return new q(f,u.message||"")}(a);t=new _h(r,i,s,c||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const i=pa(n,r.document.name),s=ot(r.document.updateTime),a=r.document.createTime?ot(r.document.createTime):W.min(),c=new je({mapValue:{fields:r.document.fields}}),l=Ae.newFoundDocument(i,s,a,c),u=r.targetIds||[],f=r.removedTargetIds||[];t=new Ts(u,f,l.key,l)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const i=pa(n,r.document),s=r.readTime?ot(r.readTime):W.min(),a=Ae.newNoDocument(i,s),c=r.removedTargetIds||[];t=new Ts([],c,a.key,a)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const i=pa(n,r.document),s=r.removedTargetIds||[];t=new Ts([],s,i,null)}else{if(!("filter"in e))return G(11601,{Vt:e});{e.filter;const r=e.filter;r.targetId;const{count:i=0,unchangedNames:s}=r,a=new M_(i,s),c=r.targetId;t=new vh(c,a)}}return t}function Q_(n,e){let t;if(e instanceof Xr)t={update:Ah(n,e.key,e.value)};else if(e instanceof ph)t={delete:fa(n,e.key)};else if(e instanceof _n)t={update:Ah(n,e.key,e.data),updateMask:ib(e.fieldMask)};else{if(!(e instanceof L_))return G(16599,{dt:e.type});t={verify:fa(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(r=>function(s,a){const c=a.transform;if(c instanceof Gr)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(c instanceof Wr)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:c.elements}};if(c instanceof Qr)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:c.elements}};if(c instanceof _s)return{fieldPath:a.field.canonicalString(),increment:c.Ae};throw G(20930,{transform:a.transform})}(0,r))),e.precondition.isNone||(t.currentDocument=function(i,s){return s.updateTime!==void 0?{updateTime:K_(i,s.updateTime)}:s.exists!==void 0?{exists:s.exists}:G(27497)}(n,e.precondition)),t}function Y_(n,e){return n&&n.length>0?(te(e!==void 0,14353),n.map(t=>function(i,s){let a=i.updateTime?ot(i.updateTime):ot(s);return a.isEqual(W.min())&&(a=ot(s)),new P_(a,i.transformResults||[])}(t,e))):[]}function X_(n,e){return{documents:[Ih(n,e.path)]}}function J_(n,e){const t={structuredQuery:{}},r=e.path;let i;e.collectionGroup!==null?(i=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(i=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=Ih(n,i);const s=function(u){if(u.length!==0)return Ch(Je.create(u,"and"))}(e.filters);s&&(t.structuredQuery.where=s);const a=function(u){if(u.length!==0)return u.map(f=>function(w){return{field:Jn(w.field),direction:tb(w.dir)}}(f))}(e.orderBy);a&&(t.structuredQuery.orderBy=a);const c=ua(n,e.limit);return c!==null&&(t.structuredQuery.limit=c),e.startAt&&(t.structuredQuery.startAt=function(u){return{before:u.inclusive,values:u.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(u){return{before:!u.inclusive,values:u.position}}(e.endAt)),{ft:t,parent:i}}function Z_(n){let e=G_(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let i=null;if(r>0){te(r===1,65062);const f=t.from[0];f.allDescendants?i=f.collectionId:e=e.child(f.collectionId)}let s=[];t.where&&(s=function(p){const w=Sh(p);return w instanceof Je&&zu(w)?w.getFilters():[w]}(t.where));let a=[];t.orderBy&&(a=function(p){return p.map(w=>function(T){return new gs(Zn(T.field),function(x){switch(x){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(T.direction))}(w))}(t.orderBy));let c=null;t.limit&&(c=function(p){let w;return w=typeof p=="object"?p.value:p,ss(w)?null:w}(t.limit));let l=null;t.startAt&&(l=function(p){const w=!!p.before,A=p.values||[];return new ps(A,w)}(t.startAt));let u=null;return t.endAt&&(u=function(p){const w=!p.before,A=p.values||[];return new ps(A,w)}(t.endAt)),m_(e,i,a,s,c,"F",l,u)}function eb(n,e){const t=function(i){switch(i){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return G(28987,{purpose:i})}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function Sh(n){return n.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=Zn(t.unaryFilter.field);return de.create(r,"==",{doubleValue:NaN});case"IS_NULL":const i=Zn(t.unaryFilter.field);return de.create(i,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const s=Zn(t.unaryFilter.field);return de.create(s,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=Zn(t.unaryFilter.field);return de.create(a,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return G(61313);default:return G(60726)}}(n):n.fieldFilter!==void 0?function(t){return de.create(Zn(t.fieldFilter.field),function(i){switch(i){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return G(58110);default:return G(50506)}}(t.fieldFilter.op),t.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(t){return Je.create(t.compositeFilter.filters.map(r=>Sh(r)),function(i){switch(i){case"AND":return"and";case"OR":return"or";default:return G(1026)}}(t.compositeFilter.op))}(n):G(30097,{filter:n})}function tb(n){return $_[n]}function nb(n){return H_[n]}function rb(n){return j_[n]}function Jn(n){return{fieldPath:n.canonicalString()}}function Zn(n){return we.fromServerFormat(n.fieldPath)}function Ch(n){return n instanceof de?function(t){if(t.op==="=="){if(Uu(t.value))return{unaryFilter:{field:Jn(t.field),op:"IS_NAN"}};if(Fu(t.value))return{unaryFilter:{field:Jn(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(Uu(t.value))return{unaryFilter:{field:Jn(t.field),op:"IS_NOT_NAN"}};if(Fu(t.value))return{unaryFilter:{field:Jn(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Jn(t.field),op:nb(t.op),value:t.value}}}(n):n instanceof Je?function(t){const r=t.getFilters().map(i=>Ch(i));return r.length===1?r[0]:{compositeFilter:{op:rb(t.op),filters:r}}}(n):G(54877,{filter:n})}function ib(n){const e=[];return n.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function kh(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}function Rh(n){return!!n&&typeof n._toProto=="function"&&n._protoValueType==="ProtoValue"}/**
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
 */class Kt{constructor(e,t,r,i,s=W.min(),a=W.min(),c=Te.EMPTY_BYTE_STRING,l=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=i,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=c,this.expectedCount=l}withSequenceNumber(e){return new Kt(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new Kt(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new Kt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new Kt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
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
 */class sb{constructor(e){this.yt=e}}function ob(n){const e=Z_({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?oa(e,e.limit,"L"):e}/**
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
 */class ab{constructor(){this.bn=new cb}addToCollectionParentIndex(e,t){return this.bn.add(t),V.resolve()}getCollectionParents(e,t){return V.resolve(this.bn.getEntries(t))}addFieldIndex(e,t){return V.resolve()}deleteFieldIndex(e,t){return V.resolve()}deleteAllFieldIndexes(e){return V.resolve()}createTargetIndexes(e,t){return V.resolve()}getDocumentsMatchingTarget(e,t){return V.resolve(null)}getIndexType(e,t){return V.resolve(0)}getFieldIndexes(e,t){return V.resolve([])}getNextCollectionGroupToUpdate(e){return V.resolve(null)}getMinOffset(e,t){return V.resolve($t.min())}getMinOffsetFromCollectionGroup(e,t){return V.resolve($t.min())}updateCollectionGroup(e,t,r){return V.resolve()}updateIndexEntries(e,t){return V.resolve()}}class cb{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),i=this.index[t]||new me(re.comparator),s=!i.has(r);return this.index[t]=i.add(r),s}has(e){const t=e.lastSegment(),r=e.popLast(),i=this.index[t];return i&&i.has(r)}getEntries(e){return(this.index[e]||new me(re.comparator)).toArray()}}/**
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
 */const Ph={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},Nh=41943040;class Oe{static withCacheSize(e){return new Oe(e,Oe.DEFAULT_COLLECTION_PERCENTILE,Oe.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}}/**
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
 */Oe.DEFAULT_COLLECTION_PERCENTILE=10,Oe.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Oe.DEFAULT=new Oe(Nh,Oe.DEFAULT_COLLECTION_PERCENTILE,Oe.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Oe.DISABLED=new Oe(-1,0,0);/**
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
 */class er{constructor(e){this.sr=e}next(){return this.sr+=2,this.sr}static _r(){return new er(0)}static ar(){return new er(-1)}}/**
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
 */const Dh="LruGarbageCollector",lb=1048576;function Lh([n,e],[t,r]){const i=J(n,t);return i===0?J(e,r):i}class ub{constructor(e){this.Pr=e,this.buffer=new me(Lh),this.Tr=0}Er(){return++this.Tr}Ir(e){const t=[e,this.Er()];if(this.buffer.size<this.Pr)this.buffer=this.buffer.add(t);else{const r=this.buffer.last();Lh(t,r)<0&&(this.buffer=this.buffer.delete(r).add(t))}}get maxValue(){return this.buffer.last()[0]}}class hb{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.Rr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Ar(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return this.Rr!==null}Ar(e){H(Dh,`Garbage collection scheduled in ${e}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){Wn(t)?H(Dh,"Ignoring IndexedDB error during garbage collection: ",t):await Gn(t)}await this.Ar(3e5)})}}class db{constructor(e,t){this.Vr=e,this.params=t}calculateTargetCount(e,t){return this.Vr.dr(e).next(r=>Math.floor(t/100*r))}nthSequenceNumber(e,t){if(t===0)return V.resolve(is.ce);const r=new ub(t);return this.Vr.forEachTarget(e,i=>r.Ir(i.sequenceNumber)).next(()=>this.Vr.mr(e,i=>r.Ir(i))).next(()=>r.maxValue)}removeTargets(e,t,r){return this.Vr.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.Vr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(H("LruGarbageCollector","Garbage collection skipped; disabled"),V.resolve(Ph)):this.getCacheSize(e).next(r=>r<this.params.cacheSizeCollectionThreshold?(H("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Ph):this.gr(e,t))}getCacheSize(e){return this.Vr.getCacheSize(e)}gr(e,t){let r,i,s,a,c,l,u;const f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(p=>(p>this.params.maximumSequenceNumbersToCollect?(H("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${p}`),i=this.params.maximumSequenceNumbersToCollect):i=p,a=Date.now(),this.nthSequenceNumber(e,i))).next(p=>(r=p,c=Date.now(),this.removeTargets(e,r,t))).next(p=>(s=p,l=Date.now(),this.removeOrphanedDocuments(e,r))).next(p=>(u=Date.now(),zn()<=X.DEBUG&&H("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${a-f}ms
	Determined least recently used ${i} in `+(c-a)+`ms
	Removed ${s} targets in `+(l-c)+`ms
	Removed ${p} documents in `+(u-l)+`ms
Total Duration: ${u-f}ms`),V.resolve({didRun:!0,sequenceNumbersCollected:i,targetsRemoved:s,documentsRemoved:p})))}}function fb(n,e){return new db(n,e)}/**
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
 */class pb{constructor(){this.changes=new yn(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Ae.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?V.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
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
 */class gb{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
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
 */class mb{constructor(e,t,r,i){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=i}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(i=>(r=i,this.remoteDocumentCache.getEntry(e,t))).next(i=>(r!==null&&Yr(r.mutation,i,Xe.empty(),ie.now()),i))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.getLocalViewOfDocuments(e,r,Z()).next(()=>r))}getLocalViewOfDocuments(e,t,r=Z()){const i=vn();return this.populateOverlays(e,i,t).next(()=>this.computeViews(e,t,i,r).next(s=>{let a=zr();return s.forEach((c,l)=>{a=a.insert(c,l.overlayedDocument)}),a}))}getOverlayedDocuments(e,t){const r=vn();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,Z()))}populateOverlays(e,t,r){const i=[];return r.forEach(s=>{t.has(s)||i.push(s)}),this.documentOverlayCache.getOverlays(e,i).next(s=>{s.forEach((a,c)=>{t.set(a,c)})})}computeViews(e,t,r,i){let s=wt();const a=Kr(),c=function(){return Kr()}();return t.forEach((l,u)=>{const f=r.get(u.key);i.has(u.key)&&(f===void 0||f.mutation instanceof _n)?s=s.insert(u.key,u):f!==void 0?(a.set(u.key,f.mutation.getFieldMask()),Yr(f.mutation,u,f.mutation.getFieldMask(),ie.now())):a.set(u.key,Xe.empty())}),this.recalculateAndSaveOverlays(e,s).next(l=>(l.forEach((u,f)=>a.set(u,f)),t.forEach((u,f)=>c.set(u,new gb(f,a.get(u)??null))),c))}recalculateAndSaveOverlays(e,t){const r=Kr();let i=new ae((a,c)=>a-c),s=Z();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(a=>{for(const c of a)c.keys().forEach(l=>{const u=t.get(l);if(u===null)return;let f=r.get(l)||Xe.empty();f=c.applyToLocalView(u,f),r.set(l,f);const p=(i.get(c.batchId)||Z()).add(l);i=i.insert(c.batchId,p)})}).next(()=>{const a=[],c=i.getReverseIterator();for(;c.hasNext();){const l=c.getNext(),u=l.key,f=l.value,p=nh();f.forEach(w=>{if(!s.has(w)){const A=lh(t.get(w),r.get(w));A!==null&&p.set(w,A),s=s.add(w)}}),a.push(this.documentOverlayCache.saveOverlays(e,u,p))}return V.waitFor(a)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,t,r,i){return y_(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):Xu(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,i):this.getDocumentsMatchingCollectionQuery(e,t,r,i)}getNextDocuments(e,t,r,i){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,i).next(s=>{const a=i-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,i-s.size):V.resolve(vn());let c=Fr,l=s;return a.next(u=>V.forEach(u,(f,p)=>(c<p.largestBatchId&&(c=p.largestBatchId),s.get(f)?V.resolve():this.remoteDocumentCache.getEntry(e,f).next(w=>{l=l.insert(f,w)}))).next(()=>this.populateOverlays(e,u,s)).next(()=>this.computeViews(e,l,u,Z())).next(f=>({batchId:c,changes:th(f)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new z(t)).next(r=>{let i=zr();return r.isFoundDocument()&&(i=i.insert(r.key,r)),i})}getDocumentsMatchingCollectionGroupQuery(e,t,r,i){const s=t.collectionGroup;let a=zr();return this.indexManager.getCollectionParents(e,s).next(c=>V.forEach(c,l=>{const u=function(p,w){return new Hr(w,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)}(t,l.child(s));return this.getDocumentsMatchingCollectionQuery(e,u,r,i).next(f=>{f.forEach((p,w)=>{a=a.insert(p,w)})})}).next(()=>a))}getDocumentsMatchingCollectionQuery(e,t,r,i){let s;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(a=>(s=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,s,i))).next(a=>{s.forEach((l,u)=>{const f=u.getKey();a.get(f)===null&&(a=a.insert(f,Ae.newInvalidDocument(f)))});let c=zr();return a.forEach((l,u)=>{const f=s.get(l);f!==void 0&&Yr(f.mutation,u,Xe.empty(),ie.now()),ys(t,u)&&(c=c.insert(l,u))}),c})}}/**
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
 */class yb{constructor(e){this.serializer=e,this.Nr=new Map,this.Br=new Map}getBundleMetadata(e,t){return V.resolve(this.Nr.get(t))}saveBundleMetadata(e,t){return this.Nr.set(t.id,function(i){return{id:i.id,version:i.version,createTime:ot(i.createTime)}}(t)),V.resolve()}getNamedQuery(e,t){return V.resolve(this.Br.get(t))}saveNamedQuery(e,t){return this.Br.set(t.name,function(i){return{name:i.name,query:ob(i.bundledQuery),readTime:ot(i.readTime)}}(t)),V.resolve()}}/**
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
 */class vb{constructor(){this.overlays=new ae(z.comparator),this.Lr=new Map}getOverlay(e,t){return V.resolve(this.overlays.get(t))}getOverlays(e,t){const r=vn();return V.forEach(t,i=>this.getOverlay(e,i).next(s=>{s!==null&&r.set(i,s)})).next(()=>r)}saveOverlays(e,t,r){return r.forEach((i,s)=>{this.St(e,t,s)}),V.resolve()}removeOverlaysForBatchId(e,t,r){const i=this.Lr.get(r);return i!==void 0&&(i.forEach(s=>this.overlays=this.overlays.remove(s)),this.Lr.delete(r)),V.resolve()}getOverlaysForCollection(e,t,r){const i=vn(),s=t.length+1,a=new z(t.child("")),c=this.overlays.getIteratorFrom(a);for(;c.hasNext();){const l=c.getNext().value,u=l.getKey();if(!t.isPrefixOf(u.path))break;u.path.length===s&&l.largestBatchId>r&&i.set(l.getKey(),l)}return V.resolve(i)}getOverlaysForCollectionGroup(e,t,r,i){let s=new ae((u,f)=>u-f);const a=this.overlays.getIterator();for(;a.hasNext();){const u=a.getNext().value;if(u.getKey().getCollectionGroup()===t&&u.largestBatchId>r){let f=s.get(u.largestBatchId);f===null&&(f=vn(),s=s.insert(u.largestBatchId,f)),f.set(u.getKey(),u)}}const c=vn(),l=s.getIterator();for(;l.hasNext()&&(l.getNext().value.forEach((u,f)=>c.set(u,f)),!(c.size()>=i)););return V.resolve(c)}St(e,t,r){const i=this.overlays.get(r.key);if(i!==null){const a=this.Lr.get(i.largestBatchId).delete(r.key);this.Lr.set(i.largestBatchId,a)}this.overlays=this.overlays.insert(r.key,new O_(t,r));let s=this.Lr.get(t);s===void 0&&(s=Z(),this.Lr.set(t,s)),this.Lr.set(t,s.add(r.key))}}/**
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
 */class _b{constructor(){this.sessionToken=Te.EMPTY_BYTE_STRING}getSessionToken(e){return V.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,V.resolve()}}/**
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
 */class ma{constructor(){this.kr=new me(_e.qr),this.Kr=new me(_e.Ur)}isEmpty(){return this.kr.isEmpty()}addReference(e,t){const r=new _e(e,t);this.kr=this.kr.add(r),this.Kr=this.Kr.add(r)}$r(e,t){e.forEach(r=>this.addReference(r,t))}removeReference(e,t){this.Wr(new _e(e,t))}Qr(e,t){e.forEach(r=>this.removeReference(r,t))}Gr(e){const t=new z(new re([])),r=new _e(t,e),i=new _e(t,e+1),s=[];return this.Kr.forEachInRange([r,i],a=>{this.Wr(a),s.push(a.key)}),s}zr(){this.kr.forEach(e=>this.Wr(e))}Wr(e){this.kr=this.kr.delete(e),this.Kr=this.Kr.delete(e)}jr(e){const t=new z(new re([])),r=new _e(t,e),i=new _e(t,e+1);let s=Z();return this.Kr.forEachInRange([r,i],a=>{s=s.add(a.key)}),s}containsKey(e){const t=new _e(e,0),r=this.kr.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class _e{constructor(e,t){this.key=e,this.Jr=t}static qr(e,t){return z.comparator(e.key,t.key)||J(e.Jr,t.Jr)}static Ur(e,t){return J(e.Jr,t.Jr)||z.comparator(e.key,t.key)}}/**
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
 */class bb{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Yn=1,this.Hr=new me(_e.qr)}checkEmpty(e){return V.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,i){const s=this.Yn;this.Yn++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new V_(s,t,r,i);this.mutationQueue.push(a);for(const c of i)this.Hr=this.Hr.add(new _e(c.key,s)),this.indexManager.addToCollectionParentIndex(e,c.key.path.popLast());return V.resolve(a)}lookupMutationBatch(e,t){return V.resolve(this.Zr(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,i=this.Xr(r),s=i<0?0:i;return V.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return V.resolve(this.mutationQueue.length===0?Qo:this.Yn-1)}getAllMutationBatches(e){return V.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new _e(t,0),i=new _e(t,Number.POSITIVE_INFINITY),s=[];return this.Hr.forEachInRange([r,i],a=>{const c=this.Zr(a.Jr);s.push(c)}),V.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new me(J);return t.forEach(i=>{const s=new _e(i,0),a=new _e(i,Number.POSITIVE_INFINITY);this.Hr.forEachInRange([s,a],c=>{r=r.add(c.Jr)})}),V.resolve(this.Yr(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,i=r.length+1;let s=r;z.isDocumentKey(s)||(s=s.child(""));const a=new _e(new z(s),0);let c=new me(J);return this.Hr.forEachWhile(l=>{const u=l.key.path;return!!r.isPrefixOf(u)&&(u.length===i&&(c=c.add(l.Jr)),!0)},a),V.resolve(this.Yr(c))}Yr(e){const t=[];return e.forEach(r=>{const i=this.Zr(r);i!==null&&t.push(i)}),t}removeMutationBatch(e,t){te(this.ei(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.Hr;return V.forEach(t.mutations,i=>{const s=new _e(i.key,t.batchId);return r=r.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,i.key)}).next(()=>{this.Hr=r})}nr(e){}containsKey(e,t){const r=new _e(t,0),i=this.Hr.firstAfterOrEqual(r);return V.resolve(t.isEqual(i&&i.key))}performConsistencyCheck(e){return this.mutationQueue.length,V.resolve()}ei(e,t){return this.Xr(e)}Xr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Zr(e){const t=this.Xr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
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
 */class wb{constructor(e){this.ti=e,this.docs=function(){return new ae(z.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,i=this.docs.get(r),s=i?i.size:0,a=this.ti(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:a}),this.size+=a-s,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return V.resolve(r?r.document.mutableCopy():Ae.newInvalidDocument(t))}getEntries(e,t){let r=wt();return t.forEach(i=>{const s=this.docs.get(i);r=r.insert(i,s?s.document.mutableCopy():Ae.newInvalidDocument(i))}),V.resolve(r)}getDocumentsMatchingQuery(e,t,r,i){let s=wt();const a=t.path,c=new z(a.child("__id-9223372036854775808__")),l=this.docs.getIteratorFrom(c);for(;l.hasNext();){const{key:u,value:{document:f}}=l.getNext();if(!a.isPrefixOf(u.path))break;u.path.length>a.length+1||Gv(Kv(f),r)<=0||(i.has(f.key)||ys(t,f))&&(s=s.insert(f.key,f.mutableCopy()))}return V.resolve(s)}getAllFromCollectionGroup(e,t,r,i){G(9500)}ni(e,t){return V.forEach(this.docs,r=>t(r))}newChangeBuffer(e){return new Eb(this)}getSize(e){return V.resolve(this.size)}}class Eb extends pb{constructor(e){super(),this.Mr=e}applyChanges(e){const t=[];return this.changes.forEach((r,i)=>{i.isValidDocument()?t.push(this.Mr.addEntry(e,i)):this.Mr.removeEntry(r)}),V.waitFor(t)}getFromCache(e,t){return this.Mr.getEntry(e,t)}getAllFromCache(e,t){return this.Mr.getEntries(e,t)}}/**
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
 */class Tb{constructor(e){this.persistence=e,this.ri=new yn(t=>ta(t),na),this.lastRemoteSnapshotVersion=W.min(),this.highestTargetId=0,this.ii=0,this.si=new ma,this.targetCount=0,this.oi=er._r()}forEachTarget(e,t){return this.ri.forEach((r,i)=>t(i)),V.resolve()}getLastRemoteSnapshotVersion(e){return V.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return V.resolve(this.ii)}allocateTargetId(e){return this.highestTargetId=this.oi.next(),V.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.ii&&(this.ii=t),V.resolve()}lr(e){this.ri.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.oi=new er(t),this.highestTargetId=t),e.sequenceNumber>this.ii&&(this.ii=e.sequenceNumber)}addTargetData(e,t){return this.lr(t),this.targetCount+=1,V.resolve()}updateTargetData(e,t){return this.lr(t),V.resolve()}removeTargetData(e,t){return this.ri.delete(t.target),this.si.Gr(t.targetId),this.targetCount-=1,V.resolve()}removeTargets(e,t,r){let i=0;const s=[];return this.ri.forEach((a,c)=>{c.sequenceNumber<=t&&r.get(c.targetId)===null&&(this.ri.delete(a),s.push(this.removeMatchingKeysForTargetId(e,c.targetId)),i++)}),V.waitFor(s).next(()=>i)}getTargetCount(e){return V.resolve(this.targetCount)}getTargetData(e,t){const r=this.ri.get(t)||null;return V.resolve(r)}addMatchingKeys(e,t,r){return this.si.$r(t,r),V.resolve()}removeMatchingKeys(e,t,r){this.si.Qr(t,r);const i=this.persistence.referenceDelegate,s=[];return i&&t.forEach(a=>{s.push(i.markPotentiallyOrphaned(e,a))}),V.waitFor(s)}removeMatchingKeysForTargetId(e,t){return this.si.Gr(t),V.resolve()}getMatchingKeysForTargetId(e,t){const r=this.si.jr(t);return V.resolve(r)}containsKey(e,t){return V.resolve(this.si.containsKey(t))}}/**
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
 */class Vh{constructor(e,t){this._i={},this.overlays={},this.ai=new is(0),this.ui=!1,this.ui=!0,this.ci=new _b,this.referenceDelegate=e(this),this.li=new Tb(this),this.indexManager=new ab,this.remoteDocumentCache=function(i){return new wb(i)}(r=>this.referenceDelegate.hi(r)),this.serializer=new sb(t),this.Pi=new yb(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ui=!1,Promise.resolve()}get started(){return this.ui}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new vb,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this._i[e.toKey()];return r||(r=new bb(t,this.referenceDelegate),this._i[e.toKey()]=r),r}getGlobalsCache(){return this.ci}getTargetCache(){return this.li}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Pi}runTransaction(e,t,r){H("MemoryPersistence","Starting transaction:",e);const i=new Ib(this.ai.next());return this.referenceDelegate.Ti(),r(i).next(s=>this.referenceDelegate.Ei(i).next(()=>s)).toPromise().then(s=>(i.raiseOnCommittedEvent(),s))}Ii(e,t){return V.or(Object.values(this._i).map(r=>()=>r.containsKey(e,t)))}}class Ib extends Qv{constructor(e){super(),this.currentSequenceNumber=e}}class ya{constructor(e){this.persistence=e,this.Ri=new ma,this.Ai=null}static Vi(e){return new ya(e)}get di(){if(this.Ai)return this.Ai;throw G(60996)}addReference(e,t,r){return this.Ri.addReference(r,t),this.di.delete(r.toString()),V.resolve()}removeReference(e,t,r){return this.Ri.removeReference(r,t),this.di.add(r.toString()),V.resolve()}markPotentiallyOrphaned(e,t){return this.di.add(t.toString()),V.resolve()}removeTarget(e,t){this.Ri.Gr(t.targetId).forEach(i=>this.di.add(i.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(i=>{i.forEach(s=>this.di.add(s.toString()))}).next(()=>r.removeTargetData(e,t))}Ti(){this.Ai=new Set}Ei(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return V.forEach(this.di,r=>{const i=z.fromPath(r);return this.mi(e,i).next(s=>{s||t.removeEntry(i,W.min())})}).next(()=>(this.Ai=null,t.apply(e)))}updateLimboDocument(e,t){return this.mi(e,t).next(r=>{r?this.di.delete(t.toString()):this.di.add(t.toString())})}hi(e){return 0}mi(e,t){return V.or([()=>V.resolve(this.Ri.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Ii(e,t)])}}class As{constructor(e,t){this.persistence=e,this.fi=new yn(r=>Jv(r.path),(r,i)=>r.isEqual(i)),this.garbageCollector=fb(this,t)}static Vi(e,t){return new As(e,t)}Ti(){}Ei(e){return V.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}dr(e){const t=this.pr(e);return this.persistence.getTargetCache().getTargetCount(e).next(r=>t.next(i=>r+i))}pr(e){let t=0;return this.mr(e,r=>{t++}).next(()=>t)}mr(e,t){return V.forEach(this.fi,(r,i)=>this.wr(e,r,i).next(s=>s?V.resolve():t(i)))}removeTargets(e,t,r){return this.persistence.getTargetCache().removeTargets(e,t,r)}removeOrphanedDocuments(e,t){let r=0;const i=this.persistence.getRemoteDocumentCache(),s=i.newChangeBuffer();return i.ni(e,a=>this.wr(e,a,t).next(c=>{c||(r++,s.removeEntry(a,W.min()))})).next(()=>s.apply(e)).next(()=>r)}markPotentiallyOrphaned(e,t){return this.fi.set(t,e.currentSequenceNumber),V.resolve()}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,t,r){return this.fi.set(r,e.currentSequenceNumber),V.resolve()}removeReference(e,t,r){return this.fi.set(r,e.currentSequenceNumber),V.resolve()}updateLimboDocument(e,t){return this.fi.set(t,e.currentSequenceNumber),V.resolve()}hi(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=ds(e.data.value)),t}wr(e,t,r){return V.or([()=>this.persistence.Ii(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const i=this.fi.get(t);return V.resolve(i!==void 0&&i>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
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
 */class va{constructor(e,t,r,i){this.targetId=e,this.fromCache=t,this.Ts=r,this.Es=i}static Is(e,t){let r=Z(),i=Z();for(const s of t.docChanges)switch(s.type){case 0:r=r.add(s.doc.key);break;case 1:i=i.add(s.doc.key)}return new va(e,t.fromCache,r,i)}}/**
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
 */class xb{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
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
 */class Ab{constructor(){this.Rs=!1,this.As=!1,this.Vs=100,this.ds=function(){return Jp()?8:Yv(Ie())>0?6:4}()}initialize(e,t){this.fs=e,this.indexManager=t,this.Rs=!0}getDocumentsMatchingQuery(e,t,r,i){const s={result:null};return this.gs(e,t).next(a=>{s.result=a}).next(()=>{if(!s.result)return this.ps(e,t,i,r).next(a=>{s.result=a})}).next(()=>{if(s.result)return;const a=new xb;return this.ys(e,t,a).next(c=>{if(s.result=c,this.As)return this.ws(e,t,a,c.size)})}).next(()=>s.result)}ws(e,t,r,i){return r.documentReadCount<this.Vs?(zn()<=X.DEBUG&&H("QueryEngine","SDK will not create cache indexes for query:",Xn(t),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),V.resolve()):(zn()<=X.DEBUG&&H("QueryEngine","Query:",Xn(t),"scans",r.documentReadCount,"local documents and returns",i,"documents as results."),r.documentReadCount>this.ds*i?(zn()<=X.DEBUG&&H("QueryEngine","The SDK decides to create cache indexes for query:",Xn(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,st(t))):V.resolve())}gs(e,t){if(Yu(t))return V.resolve(null);let r=st(t);return this.indexManager.getIndexType(e,r).next(i=>i===0?null:(t.limit!==null&&i===1&&(t=oa(t,null,"F"),r=st(t)),this.indexManager.getDocumentsMatchingTarget(e,r).next(s=>{const a=Z(...s);return this.fs.getDocuments(e,a).next(c=>this.indexManager.getMinOffset(e,r).next(l=>{const u=this.Ss(t,c);return this.bs(t,u,a,l.readTime)?this.gs(e,oa(t,null,"F")):this.Ds(e,u,t,l)}))})))}ps(e,t,r,i){return Yu(t)||i.isEqual(W.min())?V.resolve(null):this.fs.getDocuments(e,r).next(s=>{const a=this.Ss(t,s);return this.bs(t,a,r,i)?V.resolve(null):(zn()<=X.DEBUG&&H("QueryEngine","Re-using previous result from %s to execute query: %s",i.toString(),Xn(t)),this.Ds(e,a,t,zv(i,Fr)).next(c=>c))})}Ss(e,t){let r=new me(Zu(e));return t.forEach((i,s)=>{ys(e,s)&&(r=r.add(s))}),r}bs(e,t,r,i){if(e.limit===null)return!1;if(r.size!==t.size)return!0;const s=e.limitType==="F"?t.last():t.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(i)>0)}ys(e,t,r){return zn()<=X.DEBUG&&H("QueryEngine","Using full collection scan to execute query:",Xn(t)),this.fs.getDocumentsMatchingQuery(e,t,$t.min(),r)}Ds(e,t,r,i){return this.fs.getDocumentsMatchingQuery(e,r,i).next(s=>(t.forEach(a=>{s=s.insert(a.key,a)}),s))}}/**
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
 */const _a="LocalStore",Sb=3e8;class Cb{constructor(e,t,r,i){this.persistence=e,this.Cs=t,this.serializer=i,this.vs=new ae(J),this.Fs=new yn(s=>ta(s),na),this.Ms=new Map,this.xs=e.getRemoteDocumentCache(),this.li=e.getTargetCache(),this.Pi=e.getBundleCache(),this.Os(r)}Os(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new mb(this.xs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.xs.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.vs))}}function kb(n,e,t,r){return new Cb(n,e,t,r)}async function Oh(n,e){const t=Q(n);return await t.persistence.runTransaction("Handle user change","readonly",r=>{let i;return t.mutationQueue.getAllMutationBatches(r).next(s=>(i=s,t.Os(e),t.mutationQueue.getAllMutationBatches(r))).next(s=>{const a=[],c=[];let l=Z();for(const u of i){a.push(u.batchId);for(const f of u.mutations)l=l.add(f.key)}for(const u of s){c.push(u.batchId);for(const f of u.mutations)l=l.add(f.key)}return t.localDocuments.getDocuments(r,l).next(u=>({Ns:u,removedBatchIds:a,addedBatchIds:c}))})})}function Rb(n,e){const t=Q(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const i=e.batch.keys(),s=t.xs.newChangeBuffer({trackRemovals:!0});return function(c,l,u,f){const p=u.batch,w=p.keys();let A=V.resolve();return w.forEach(T=>{A=A.next(()=>f.getEntry(l,T)).next(v=>{const x=u.docVersions.get(T);te(x!==null,48541),v.version.compareTo(x)<0&&(p.applyToRemoteDocument(v,u),v.isValidDocument()&&(v.setReadTime(u.commitVersion),f.addEntry(v)))})}),A.next(()=>c.mutationQueue.removeMutationBatch(l,p))}(t,r,e,s).next(()=>s.apply(r)).next(()=>t.mutationQueue.performConsistencyCheck(r)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(r,i,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(c){let l=Z();for(let u=0;u<c.mutationResults.length;++u)c.mutationResults[u].transformResults.length>0&&(l=l.add(c.batch.mutations[u].key));return l}(e))).next(()=>t.localDocuments.getDocuments(r,i))})}function Mh(n){const e=Q(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.li.getLastRemoteSnapshotVersion(t))}function Pb(n,e){const t=Q(n),r=e.snapshotVersion;let i=t.vs;return t.persistence.runTransaction("Apply remote event","readwrite-primary",s=>{const a=t.xs.newChangeBuffer({trackRemovals:!0});i=t.vs;const c=[];e.targetChanges.forEach((f,p)=>{const w=i.get(p);if(!w)return;c.push(t.li.removeMatchingKeys(s,f.removedDocuments,p).next(()=>t.li.addMatchingKeys(s,f.addedDocuments,p)));let A=w.withSequenceNumber(s.currentSequenceNumber);e.targetMismatches.get(p)!==null?A=A.withResumeToken(Te.EMPTY_BYTE_STRING,W.min()).withLastLimboFreeSnapshotVersion(W.min()):f.resumeToken.approximateByteSize()>0&&(A=A.withResumeToken(f.resumeToken,r)),i=i.insert(p,A),function(v,x,k){return v.resumeToken.approximateByteSize()===0||x.snapshotVersion.toMicroseconds()-v.snapshotVersion.toMicroseconds()>=Sb?!0:k.addedDocuments.size+k.modifiedDocuments.size+k.removedDocuments.size>0}(w,A,f)&&c.push(t.li.updateTargetData(s,A))});let l=wt(),u=Z();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&c.push(t.persistence.referenceDelegate.updateLimboDocument(s,f))}),c.push(Nb(s,a,e.documentUpdates).next(f=>{l=f.Bs,u=f.Ls})),!r.isEqual(W.min())){const f=t.li.getLastRemoteSnapshotVersion(s).next(p=>t.li.setTargetsMetadata(s,s.currentSequenceNumber,r));c.push(f)}return V.waitFor(c).next(()=>a.apply(s)).next(()=>t.localDocuments.getLocalViewOfDocuments(s,l,u)).next(()=>l)}).then(s=>(t.vs=i,s))}function Nb(n,e,t){let r=Z(),i=Z();return t.forEach(s=>r=r.add(s)),e.getEntries(n,r).next(s=>{let a=wt();return t.forEach((c,l)=>{const u=s.get(c);l.isFoundDocument()!==u.isFoundDocument()&&(i=i.add(c)),l.isNoDocument()&&l.version.isEqual(W.min())?(e.removeEntry(c,l.readTime),a=a.insert(c,l)):!u.isValidDocument()||l.version.compareTo(u.version)>0||l.version.compareTo(u.version)===0&&u.hasPendingWrites?(e.addEntry(l),a=a.insert(c,l)):H(_a,"Ignoring outdated watch update for ",c,". Current version:",u.version," Watch version:",l.version)}),{Bs:a,Ls:i}})}function Db(n,e){const t=Q(n);return t.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=Qo),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function Lb(n,e){const t=Q(n);return t.persistence.runTransaction("Allocate target","readwrite",r=>{let i;return t.li.getTargetData(r,e).next(s=>s?(i=s,V.resolve(i)):t.li.allocateTargetId(r).next(a=>(i=new Kt(e,a,"TargetPurposeListen",r.currentSequenceNumber),t.li.addTargetData(r,i).next(()=>i))))}).then(r=>{const i=t.vs.get(r.targetId);return(i===null||r.snapshotVersion.compareTo(i.snapshotVersion)>0)&&(t.vs=t.vs.insert(r.targetId,r),t.Fs.set(e,r.targetId)),r})}async function ba(n,e,t){const r=Q(n),i=r.vs.get(e),s=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",s,a=>r.persistence.referenceDelegate.removeTarget(a,i))}catch(a){if(!Wn(a))throw a;H(_a,`Failed to update sequence numbers for target ${e}: ${a}`)}r.vs=r.vs.remove(e),r.Fs.delete(i.target)}function Fh(n,e,t){const r=Q(n);let i=W.min(),s=Z();return r.persistence.runTransaction("Execute query","readwrite",a=>function(l,u,f){const p=Q(l),w=p.Fs.get(f);return w!==void 0?V.resolve(p.vs.get(w)):p.li.getTargetData(u,f)}(r,a,st(e)).next(c=>{if(c)return i=c.lastLimboFreeSnapshotVersion,r.li.getMatchingKeysForTargetId(a,c.targetId).next(l=>{s=l})}).next(()=>r.Cs.getDocumentsMatchingQuery(a,e,t?i:W.min(),t?s:Z())).next(c=>(Vb(r,__(e),c),{documents:c,ks:s})))}function Vb(n,e,t){let r=n.Ms.get(e)||W.min();t.forEach((i,s)=>{s.readTime.compareTo(r)>0&&(r=s.readTime)}),n.Ms.set(e,r)}class Uh{constructor(){this.activeTargetIds=x_()}Qs(e){this.activeTargetIds=this.activeTargetIds.add(e)}Gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Ws(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class Ob{constructor(){this.vo=new Uh,this.Fo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.vo.Qs(e),this.Fo[e]||"not-current"}updateQueryState(e,t,r){this.Fo[e]=t}removeLocalQueryTarget(e){this.vo.Gs(e)}isLocalQueryTarget(e){return this.vo.activeTargetIds.has(e)}clearQueryState(e){delete this.Fo[e]}getAllActiveQueryTargets(){return this.vo.activeTargetIds}isActiveQueryTarget(e){return this.vo.activeTargetIds.has(e)}start(){return this.vo=new Uh,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
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
 */class Mb{Mo(e){}shutdown(){}}/**
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
 */const Bh="ConnectivityMonitor";class qh{constructor(){this.xo=()=>this.Oo(),this.No=()=>this.Bo(),this.Lo=[],this.ko()}Mo(e){this.Lo.push(e)}shutdown(){window.removeEventListener("online",this.xo),window.removeEventListener("offline",this.No)}ko(){window.addEventListener("online",this.xo),window.addEventListener("offline",this.No)}Oo(){H(Bh,"Network connectivity changed: AVAILABLE");for(const e of this.Lo)e(0)}Bo(){H(Bh,"Network connectivity changed: UNAVAILABLE");for(const e of this.Lo)e(1)}static v(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
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
 */let Ss=null;function wa(){return Ss===null?Ss=function(){return 268435456+Math.round(2147483648*Math.random())}():Ss++,"0x"+Ss.toString(16)}/**
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
 */const Ea="RestConnection",Fb={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class Ub{get qo(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.Ko=t+"://"+e.host,this.Uo=`projects/${r}/databases/${i}`,this.$o=this.databaseId.database===ls?`project_id=${r}`:`project_id=${r}&database_id=${i}`}Wo(e,t,r,i,s){const a=wa(),c=this.Qo(e,t.toUriEncodedString());H(Ea,`Sending RPC '${e}' ${a}:`,c,r);const l={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.$o};this.Go(l,i,s);const{host:u}=new URL(c),f=Sr(u);return this.zo(e,c,l,r,f).then(p=>(H(Ea,`Received RPC '${e}' ${a}: `,p),p),p=>{throw pn(Ea,`RPC '${e}' ${a} failed with error: `,p,"url: ",c,"request:",r),p})}jo(e,t,r,i,s,a){return this.Wo(e,t,r,i,s)}Go(e,t,r){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+jn}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((i,s)=>e[s]=i),r&&r.headers.forEach((i,s)=>e[s]=i)}Qo(e,t){const r=Fb[e];let i=`${this.Ko}/v1/${t}:${r}`;return this.databaseInfo.apiKey&&(i=`${i}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),i}terminate(){}}/**
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
 */class Bb{constructor(e){this.Jo=e.Jo,this.Ho=e.Ho}Zo(e){this.Xo=e}Yo(e){this.e_=e}t_(e){this.n_=e}onMessage(e){this.r_=e}close(){this.Ho()}send(e){this.Jo(e)}i_(){this.Xo()}s_(){this.e_()}o_(e){this.n_(e)}__(e){this.r_(e)}}/**
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
 */const Se="WebChannelConnection",ei=(n,e,t)=>{n.listen(e,r=>{try{t(r)}catch(i){setTimeout(()=>{throw i},0)}})};class tr extends Ub{constructor(e){super(e),this.a_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static u_(){if(!tr.c_){const e=hu();ei(e,uu.STAT_EVENT,t=>{t.stat===jo.PROXY?H(Se,"STAT_EVENT: detected buffering proxy"):t.stat===jo.NOPROXY&&H(Se,"STAT_EVENT: detected no buffering proxy")}),tr.c_=!0}}zo(e,t,r,i,s){const a=wa();return new Promise((c,l)=>{const u=new cu;u.setWithCredentials(!0),u.listenOnce(lu.COMPLETE,()=>{try{switch(u.getLastErrorCode()){case ns.NO_ERROR:const p=u.getResponseJson();H(Se,`XHR for RPC '${e}' ${a} received:`,JSON.stringify(p)),c(p);break;case ns.TIMEOUT:H(Se,`RPC '${e}' ${a} timed out`),l(new q(L.DEADLINE_EXCEEDED,"Request time out"));break;case ns.HTTP_ERROR:const w=u.getStatus();if(H(Se,`RPC '${e}' ${a} failed with status:`,w,"response text:",u.getResponseText()),w>0){let A=u.getResponseJson();Array.isArray(A)&&(A=A[0]);const T=A==null?void 0:A.error;if(T&&T.status&&T.message){const v=function(k){const P=k.toLowerCase().replace(/_/g,"-");return Object.values(L).indexOf(P)>=0?P:L.UNKNOWN}(T.status);l(new q(v,T.message))}else l(new q(L.UNKNOWN,"Server responded with status "+u.getStatus()))}else l(new q(L.UNAVAILABLE,"Connection failed."));break;default:G(9055,{l_:e,streamId:a,h_:u.getLastErrorCode(),P_:u.getLastError()})}}finally{H(Se,`RPC '${e}' ${a} completed.`)}});const f=JSON.stringify(i);H(Se,`RPC '${e}' ${a} sending request:`,i),u.send(t,"POST",f,r,15)})}T_(e,t,r){const i=wa(),s=[this.Ko,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=this.createWebChannelTransport(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},l=this.longPollingOptions.timeoutSeconds;l!==void 0&&(c.longPollingTimeout=Math.round(1e3*l)),this.useFetchStreams&&(c.useFetchStreams=!0),this.Go(c.initMessageHeaders,t,r),c.encodeInitMessageHeaders=!0;const u=s.join("");H(Se,`Creating RPC '${e}' stream ${i}: ${u}`,c);const f=a.createWebChannel(u,c);this.E_(f);let p=!1,w=!1;const A=new Bb({Jo:T=>{w?H(Se,`Not sending because RPC '${e}' stream ${i} is closed:`,T):(p||(H(Se,`Opening RPC '${e}' stream ${i} transport.`),f.open(),p=!0),H(Se,`RPC '${e}' stream ${i} sending:`,T),f.send(T))},Ho:()=>f.close()});return ei(f,Or.EventType.OPEN,()=>{w||(H(Se,`RPC '${e}' stream ${i} transport opened.`),A.i_())}),ei(f,Or.EventType.CLOSE,()=>{w||(w=!0,H(Se,`RPC '${e}' stream ${i} transport closed`),A.o_(),this.I_(f))}),ei(f,Or.EventType.ERROR,T=>{w||(w=!0,pn(Se,`RPC '${e}' stream ${i} transport errored. Name:`,T.name,"Message:",T.message),A.o_(new q(L.UNAVAILABLE,"The operation could not be completed")))}),ei(f,Or.EventType.MESSAGE,T=>{var v;if(!w){const x=T.data[0];te(!!x,16349);const k=x,P=(k==null?void 0:k.error)||((v=k[0])==null?void 0:v.error);if(P){H(Se,`RPC '${e}' stream ${i} received error:`,P);const N=P.status;let M=function(_){const m=fe[_];if(m!==void 0)return gh(m)}(N),B=P.message;N==="NOT_FOUND"&&B.includes("database")&&B.includes("does not exist")&&B.includes(this.databaseId.database)&&pn(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),M===void 0&&(M=L.INTERNAL,B="Unknown error status: "+N+" with message "+P.message),w=!0,A.o_(new q(M,B)),f.close()}else H(Se,`RPC '${e}' stream ${i} received:`,x),A.__(x)}}),tr.u_(),setTimeout(()=>{A.s_()},0),A}terminate(){this.a_.forEach(e=>e.close()),this.a_=[]}E_(e){this.a_.push(e)}I_(e){this.a_=this.a_.filter(t=>t===e)}Go(e,t,r){super.Go(e,t,r),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return du()}}/**
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
 */function qb(n){return new tr(n)}function Ta(){return typeof document<"u"?document:null}/**
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
 */function Cs(n){return new z_(n,!0)}/**
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
 */tr.c_=!1;class $h{constructor(e,t,r=1e3,i=1.5,s=6e4){this.Ci=e,this.timerId=t,this.R_=r,this.A_=i,this.V_=s,this.d_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.d_=0}g_(){this.d_=this.V_}p_(e){this.cancel();const t=Math.floor(this.d_+this.y_()),r=Math.max(0,Date.now()-this.f_),i=Math.max(0,t-r);i>0&&H("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.d_} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.m_=this.Ci.enqueueAfterDelay(this.timerId,i,()=>(this.f_=Date.now(),e())),this.d_*=this.A_,this.d_<this.R_&&(this.d_=this.R_),this.d_>this.V_&&(this.d_=this.V_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.d_}}/**
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
 */const Hh="PersistentStream";class jh{constructor(e,t,r,i,s,a,c,l){this.Ci=e,this.S_=r,this.b_=i,this.connection=s,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=c,this.listener=l,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new $h(e,t)}x_(){return this.state===1||this.state===5||this.O_()}O_(){return this.state===2||this.state===3}start(){this.F_=0,this.state!==4?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&this.C_===null&&(this.C_=this.Ci.enqueueAfterDelay(this.S_,6e4,()=>this.k_()))}q_(e){this.K_(),this.stream.send(e)}async k_(){if(this.O_())return this.close(0)}K_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,t){this.K_(),this.U_(),this.M_.cancel(),this.D_++,e!==4?this.M_.reset():t&&t.code===L.RESOURCE_EXHAUSTED?(_t(t.toString()),_t("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):t&&t.code===L.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.W_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.t_(t)}W_(){}auth(){this.state=1;const e=this.Q_(this.D_),t=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,i])=>{this.D_===t&&this.G_(r,i)},r=>{e(()=>{const i=new q(L.UNKNOWN,"Fetching auth token failed: "+r.message);return this.z_(i)})})}G_(e,t){const r=this.Q_(this.D_);this.stream=this.j_(e,t),this.stream.Zo(()=>{r(()=>this.listener.Zo())}),this.stream.Yo(()=>{r(()=>(this.state=2,this.v_=this.Ci.enqueueAfterDelay(this.b_,1e4,()=>(this.O_()&&(this.state=3),Promise.resolve())),this.listener.Yo()))}),this.stream.t_(i=>{r(()=>this.z_(i))}),this.stream.onMessage(i=>{r(()=>++this.F_==1?this.J_(i):this.onNext(i))})}N_(){this.state=5,this.M_.p_(async()=>{this.state=0,this.start()})}z_(e){return H(Hh,`close with error: ${e}`),this.stream=null,this.close(4,e)}Q_(e){return t=>{this.Ci.enqueueAndForget(()=>this.D_===e?t():(H(Hh,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class $b extends jh{constructor(e,t,r,i,s,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,i,a),this.serializer=s}j_(e,t){return this.connection.T_("Listen",e,t)}J_(e){return this.onNext(e)}onNext(e){this.M_.reset();const t=W_(this.serializer,e),r=function(s){if(!("targetChange"in s))return W.min();const a=s.targetChange;return a.targetIds&&a.targetIds.length?W.min():a.readTime?ot(a.readTime):W.min()}(e);return this.listener.H_(t,r)}Z_(e){const t={};t.database=ga(this.serializer),t.addTarget=function(s,a){let c;const l=a.target;if(c=ra(l)?{documents:X_(s,l)}:{query:J_(s,l).ft},c.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){c.resumeToken=Eh(s,a.resumeToken);const u=ua(s,a.expectedCount);u!==null&&(c.expectedCount=u)}else if(a.snapshotVersion.compareTo(W.min())>0){c.readTime=xs(s,a.snapshotVersion.toTimestamp());const u=ua(s,a.expectedCount);u!==null&&(c.expectedCount=u)}return c}(this.serializer,e);const r=eb(this.serializer,e);r&&(t.labels=r),this.q_(t)}X_(e){const t={};t.database=ga(this.serializer),t.removeTarget=e,this.q_(t)}}class Hb extends jh{constructor(e,t,r,i,s,a){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,i,a),this.serializer=s}get Y_(){return this.F_>0}start(){this.lastStreamToken=void 0,super.start()}W_(){this.Y_&&this.ea([])}j_(e,t){return this.connection.T_("Write",e,t)}J_(e){return te(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,te(!e.writeResults||e.writeResults.length===0,55816),this.listener.ta()}onNext(e){te(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.M_.reset();const t=Y_(e.writeResults,e.commitTime),r=ot(e.commitTime);return this.listener.na(r,t)}ra(){const e={};e.database=ga(this.serializer),this.q_(e)}ea(e){const t={streamToken:this.lastStreamToken,writes:e.map(r=>Q_(this.serializer,r))};this.q_(t)}}/**
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
 */class jb{}class zb extends jb{constructor(e,t,r,i){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=i,this.ia=!1}sa(){if(this.ia)throw new q(L.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(e,t,r,i){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,a])=>this.connection.Wo(e,da(t,r),i,s,a)).catch(s=>{throw s.name==="FirebaseError"?(s.code===L.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new q(L.UNKNOWN,s.toString())})}jo(e,t,r,i,s){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([a,c])=>this.connection.jo(e,da(t,r),i,a,c,s)).catch(a=>{throw a.name==="FirebaseError"?(a.code===L.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new q(L.UNKNOWN,a.toString())})}terminate(){this.ia=!0,this.connection.terminate()}}function Kb(n,e,t,r){return new zb(n,e,t,r)}class Gb{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){this.oa===0&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve())))}ha(e){this.state==="Online"?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ca("Offline")))}set(e){this.Pa(),this.oa=0,e==="Online"&&(this.aa=!1),this.ca(e)}ca(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}la(e){const t=`Could not reach Cloud Firestore backend. ${e}
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
 */const bn="RemoteStore";class Wb{constructor(e,t,r,i,s){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.Ta=[],this.Ea=new Map,this.Ia=new Set,this.Ra=[],this.Aa=s,this.Aa.Mo(a=>{r.enqueueAndForget(async()=>{wn(this)&&(H(bn,"Restarting streams for network reachability change."),await async function(l){const u=Q(l);u.Ia.add(4),await ti(u),u.Va.set("Unknown"),u.Ia.delete(4),await ks(u)}(this))})}),this.Va=new Gb(r,i)}}async function ks(n){if(wn(n))for(const e of n.Ra)await e(!0)}async function ti(n){for(const e of n.Ra)await e(!1)}function zh(n,e){const t=Q(n);t.Ea.has(e.targetId)||(t.Ea.set(e.targetId,e),Sa(t)?Aa(t):nr(t).O_()&&xa(t,e))}function Ia(n,e){const t=Q(n),r=nr(t);t.Ea.delete(e),r.O_()&&Kh(t,e),t.Ea.size===0&&(r.O_()?r.L_():wn(t)&&t.Va.set("Unknown"))}function xa(n,e){if(n.da.$e(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(W.min())>0){const t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}nr(n).Z_(e)}function Kh(n,e){n.da.$e(e),nr(n).X_(e)}function Aa(n){n.da=new q_({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),At:e=>n.Ea.get(e)||null,ht:()=>n.datastore.serializer.databaseId}),nr(n).start(),n.Va.ua()}function Sa(n){return wn(n)&&!nr(n).x_()&&n.Ea.size>0}function wn(n){return Q(n).Ia.size===0}function Gh(n){n.da=void 0}async function Qb(n){n.Va.set("Online")}async function Yb(n){n.Ea.forEach((e,t)=>{xa(n,e)})}async function Xb(n,e){Gh(n),Sa(n)?(n.Va.ha(e),Aa(n)):n.Va.set("Unknown")}async function Jb(n,e,t){if(n.Va.set("Online"),e instanceof _h&&e.state===2&&e.cause)try{await async function(i,s){const a=s.cause;for(const c of s.targetIds)i.Ea.has(c)&&(await i.remoteSyncer.rejectListen(c,a),i.Ea.delete(c),i.da.removeTarget(c))}(n,e)}catch(r){H(bn,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),await Rs(n,r)}else if(e instanceof Ts?n.da.Xe(e):e instanceof vh?n.da.st(e):n.da.tt(e),!t.isEqual(W.min()))try{const r=await Mh(n.localStore);t.compareTo(r)>=0&&await function(s,a){const c=s.da.Tt(a);return c.targetChanges.forEach((l,u)=>{if(l.resumeToken.approximateByteSize()>0){const f=s.Ea.get(u);f&&s.Ea.set(u,f.withResumeToken(l.resumeToken,a))}}),c.targetMismatches.forEach((l,u)=>{const f=s.Ea.get(l);if(!f)return;s.Ea.set(l,f.withResumeToken(Te.EMPTY_BYTE_STRING,f.snapshotVersion)),Kh(s,l);const p=new Kt(f.target,l,u,f.sequenceNumber);xa(s,p)}),s.remoteSyncer.applyRemoteEvent(c)}(n,t)}catch(r){H(bn,"Failed to raise snapshot:",r),await Rs(n,r)}}async function Rs(n,e,t){if(!Wn(e))throw e;n.Ia.add(1),await ti(n),n.Va.set("Offline"),t||(t=()=>Mh(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{H(bn,"Retrying IndexedDB access"),await t(),n.Ia.delete(1),await ks(n)})}function Wh(n,e){return e().catch(t=>Rs(n,t,e))}async function Ps(n){const e=Q(n),t=Gt(e);let r=e.Ta.length>0?e.Ta[e.Ta.length-1].batchId:Qo;for(;Zb(e);)try{const i=await Db(e.localStore,r);if(i===null){e.Ta.length===0&&t.L_();break}r=i.batchId,ew(e,i)}catch(i){await Rs(e,i)}Qh(e)&&Yh(e)}function Zb(n){return wn(n)&&n.Ta.length<10}function ew(n,e){n.Ta.push(e);const t=Gt(n);t.O_()&&t.Y_&&t.ea(e.mutations)}function Qh(n){return wn(n)&&!Gt(n).x_()&&n.Ta.length>0}function Yh(n){Gt(n).start()}async function tw(n){Gt(n).ra()}async function nw(n){const e=Gt(n);for(const t of n.Ta)e.ea(t.mutations)}async function rw(n,e,t){const r=n.Ta.shift(),i=ca.from(r,e,t);await Wh(n,()=>n.remoteSyncer.applySuccessfulWrite(i)),await Ps(n)}async function iw(n,e){e&&Gt(n).Y_&&await async function(r,i){if(function(a){return F_(a)&&a!==L.ABORTED}(i.code)){const s=r.Ta.shift();Gt(r).B_(),await Wh(r,()=>r.remoteSyncer.rejectFailedWrite(s.batchId,i)),await Ps(r)}}(n,e),Qh(n)&&Yh(n)}async function Xh(n,e){const t=Q(n);t.asyncQueue.verifyOperationInProgress(),H(bn,"RemoteStore received new credentials");const r=wn(t);t.Ia.add(3),await ti(t),r&&t.Va.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.Ia.delete(3),await ks(t)}async function sw(n,e){const t=Q(n);e?(t.Ia.delete(2),await ks(t)):e||(t.Ia.add(2),await ti(t),t.Va.set("Unknown"))}function nr(n){return n.ma||(n.ma=function(t,r,i){const s=Q(t);return s.sa(),new $b(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(n.datastore,n.asyncQueue,{Zo:Qb.bind(null,n),Yo:Yb.bind(null,n),t_:Xb.bind(null,n),H_:Jb.bind(null,n)}),n.Ra.push(async e=>{e?(n.ma.B_(),Sa(n)?Aa(n):n.Va.set("Unknown")):(await n.ma.stop(),Gh(n))})),n.ma}function Gt(n){return n.fa||(n.fa=function(t,r,i){const s=Q(t);return s.sa(),new Hb(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(n.datastore,n.asyncQueue,{Zo:()=>Promise.resolve(),Yo:tw.bind(null,n),t_:iw.bind(null,n),ta:nw.bind(null,n),na:rw.bind(null,n)}),n.Ra.push(async e=>{e?(n.fa.B_(),await Ps(n)):(await n.fa.stop(),n.Ta.length>0&&(H(bn,`Stopping write stream with ${n.Ta.length} pending writes`),n.Ta=[]))})),n.fa}/**
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
 */class Ca{constructor(e,t,r,i,s){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=i,this.removalCallback=s,this.deferred=new bt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(a=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,i,s){const a=Date.now()+r,c=new Ca(e,t,a,i,s);return c.start(r),c}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new q(L.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function ka(n,e){if(_t("AsyncQueue",`${e}: ${n}`),Wn(n))return new q(L.UNAVAILABLE,`${e}: ${n}`);throw n}/**
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
 */class rr{static emptySet(e){return new rr(e.comparator)}constructor(e){this.comparator=e?(t,r)=>e(t,r)||z.comparator(t.key,r.key):(t,r)=>z.comparator(t.key,r.key),this.keyedMap=zr(),this.sortedSet=new ae(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof rr)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const i=t.getNext().key,s=r.getNext().key;if(!i.isEqual(s))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new rr;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
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
 */class Jh{constructor(){this.ga=new ae(z.comparator)}track(e){const t=e.doc.key,r=this.ga.get(t);r?e.type!==0&&r.type===3?this.ga=this.ga.insert(t,e):e.type===3&&r.type!==1?this.ga=this.ga.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.ga=this.ga.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.ga=this.ga.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.ga=this.ga.remove(t):e.type===1&&r.type===2?this.ga=this.ga.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.ga=this.ga.insert(t,{type:2,doc:e.doc}):G(63341,{Vt:e,pa:r}):this.ga=this.ga.insert(t,e)}ya(){const e=[];return this.ga.inorderTraversal((t,r)=>{e.push(r)}),e}}class ir{constructor(e,t,r,i,s,a,c,l,u){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=i,this.mutatedKeys=s,this.fromCache=a,this.syncStateChanged=c,this.excludesMetadataChanges=l,this.hasCachedResults=u}static fromInitialDocuments(e,t,r,i,s){const a=[];return t.forEach(c=>{a.push({type:0,doc:c})}),new ir(e,t,rr.emptySet(t),a,r,i,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&ms(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let i=0;i<t.length;i++)if(t[i].type!==r[i].type||!t[i].doc.isEqual(r[i].doc))return!1;return!0}}/**
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
 */class ow{constructor(){this.wa=void 0,this.Sa=[]}ba(){return this.Sa.some(e=>e.Da())}}class aw{constructor(){this.queries=Zh(),this.onlineState="Unknown",this.Ca=new Set}terminate(){(function(t,r){const i=Q(t),s=i.queries;i.queries=Zh(),s.forEach((a,c)=>{for(const l of c.Sa)l.onError(r)})})(this,new q(L.ABORTED,"Firestore shutting down"))}}function Zh(){return new yn(n=>Ju(n),ms)}async function ed(n,e){const t=Q(n);let r=3;const i=e.query;let s=t.queries.get(i);s?!s.ba()&&e.Da()&&(r=2):(s=new ow,r=e.Da()?0:1);try{switch(r){case 0:s.wa=await t.onListen(i,!0);break;case 1:s.wa=await t.onListen(i,!1);break;case 2:await t.onFirstRemoteStoreListen(i)}}catch(a){const c=ka(a,`Initialization of query '${Xn(e.query)}' failed`);return void e.onError(c)}t.queries.set(i,s),s.Sa.push(e),e.va(t.onlineState),s.wa&&e.Fa(s.wa)&&Ra(t)}async function td(n,e){const t=Q(n),r=e.query;let i=3;const s=t.queries.get(r);if(s){const a=s.Sa.indexOf(e);a>=0&&(s.Sa.splice(a,1),s.Sa.length===0?i=e.Da()?0:1:!s.ba()&&e.Da()&&(i=2))}switch(i){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function cw(n,e){const t=Q(n);let r=!1;for(const i of e){const s=i.query,a=t.queries.get(s);if(a){for(const c of a.Sa)c.Fa(i)&&(r=!0);a.wa=i}}r&&Ra(t)}function lw(n,e,t){const r=Q(n),i=r.queries.get(e);if(i)for(const s of i.Sa)s.onError(t);r.queries.delete(e)}function Ra(n){n.Ca.forEach(e=>{e.next()})}var Pa,nd;(nd=Pa||(Pa={})).Ma="default",nd.Cache="cache";class rd{constructor(e,t,r){this.query=e,this.xa=t,this.Oa=!1,this.Na=null,this.onlineState="Unknown",this.options=r||{}}Fa(e){if(!this.options.includeMetadataChanges){const r=[];for(const i of e.docChanges)i.type!==3&&r.push(i);e=new ir(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Oa?this.Ba(e)&&(this.xa.next(e),t=!0):this.La(e,this.onlineState)&&(this.ka(e),t=!0),this.Na=e,t}onError(e){this.xa.error(e)}va(e){this.onlineState=e;let t=!1;return this.Na&&!this.Oa&&this.La(this.Na,e)&&(this.ka(this.Na),t=!0),t}La(e,t){if(!e.fromCache||!this.Da())return!0;const r=t!=="Offline";return(!this.options.qa||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Ba(e){if(e.docChanges.length>0)return!0;const t=this.Na&&this.Na.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}ka(e){e=ir.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Oa=!0,this.xa.next(e)}Da(){return this.options.source!==Pa.Cache}}/**
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
 */class id{constructor(e){this.key=e}}class sd{constructor(e){this.key=e}}class uw{constructor(e,t){this.query=e,this.Za=t,this.Xa=null,this.hasCachedResults=!1,this.current=!1,this.Ya=Z(),this.mutatedKeys=Z(),this.eu=Zu(e),this.tu=new rr(this.eu)}get nu(){return this.Za}ru(e,t){const r=t?t.iu:new Jh,i=t?t.tu:this.tu;let s=t?t.mutatedKeys:this.mutatedKeys,a=i,c=!1;const l=this.query.limitType==="F"&&i.size===this.query.limit?i.last():null,u=this.query.limitType==="L"&&i.size===this.query.limit?i.first():null;if(e.inorderTraversal((f,p)=>{const w=i.get(f),A=ys(this.query,p)?p:null,T=!!w&&this.mutatedKeys.has(w.key),v=!!A&&(A.hasLocalMutations||this.mutatedKeys.has(A.key)&&A.hasCommittedMutations);let x=!1;w&&A?w.data.isEqual(A.data)?T!==v&&(r.track({type:3,doc:A}),x=!0):this.su(w,A)||(r.track({type:2,doc:A}),x=!0,(l&&this.eu(A,l)>0||u&&this.eu(A,u)<0)&&(c=!0)):!w&&A?(r.track({type:0,doc:A}),x=!0):w&&!A&&(r.track({type:1,doc:w}),x=!0,(l||u)&&(c=!0)),x&&(A?(a=a.add(A),s=v?s.add(f):s.delete(f)):(a=a.delete(f),s=s.delete(f)))}),this.query.limit!==null)for(;a.size>this.query.limit;){const f=this.query.limitType==="F"?a.last():a.first();a=a.delete(f.key),s=s.delete(f.key),r.track({type:1,doc:f})}return{tu:a,iu:r,bs:c,mutatedKeys:s}}su(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,i){const s=this.tu;this.tu=e.tu,this.mutatedKeys=e.mutatedKeys;const a=e.iu.ya();a.sort((f,p)=>function(A,T){const v=x=>{switch(x){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return G(20277,{Vt:x})}};return v(A)-v(T)}(f.type,p.type)||this.eu(f.doc,p.doc)),this.ou(r),i=i??!1;const c=t&&!i?this._u():[],l=this.Ya.size===0&&this.current&&!i?1:0,u=l!==this.Xa;return this.Xa=l,a.length!==0||u?{snapshot:new ir(this.query,e.tu,s,a,e.mutatedKeys,l===0,u,!1,!!r&&r.resumeToken.approximateByteSize()>0),au:c}:{au:c}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({tu:this.tu,iu:new Jh,mutatedKeys:this.mutatedKeys,bs:!1},!1)):{au:[]}}uu(e){return!this.Za.has(e)&&!!this.tu.has(e)&&!this.tu.get(e).hasLocalMutations}ou(e){e&&(e.addedDocuments.forEach(t=>this.Za=this.Za.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Za=this.Za.delete(t)),this.current=e.current)}_u(){if(!this.current)return[];const e=this.Ya;this.Ya=Z(),this.tu.forEach(r=>{this.uu(r.key)&&(this.Ya=this.Ya.add(r.key))});const t=[];return e.forEach(r=>{this.Ya.has(r)||t.push(new sd(r))}),this.Ya.forEach(r=>{e.has(r)||t.push(new id(r))}),t}cu(e){this.Za=e.ks,this.Ya=Z();const t=this.ru(e.documents);return this.applyChanges(t,!0)}lu(){return ir.fromInitialDocuments(this.query,this.tu,this.mutatedKeys,this.Xa===0,this.hasCachedResults)}}const Na="SyncEngine";class hw{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class dw{constructor(e){this.key=e,this.hu=!1}}class fw{constructor(e,t,r,i,s,a){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=i,this.currentUser=s,this.maxConcurrentLimboResolutions=a,this.Pu={},this.Tu=new yn(c=>Ju(c),ms),this.Eu=new Map,this.Iu=new Set,this.Ru=new ae(z.comparator),this.Au=new Map,this.Vu=new ma,this.du={},this.mu=new Map,this.fu=er.ar(),this.onlineState="Unknown",this.gu=void 0}get isPrimaryClient(){return this.gu===!0}}async function pw(n,e,t=!0){const r=fd(n);let i;const s=r.Tu.get(e);return s?(r.sharedClientState.addLocalQueryTarget(s.targetId),i=s.view.lu()):i=await od(r,e,t,!0),i}async function gw(n,e){const t=fd(n);await od(t,e,!0,!1)}async function od(n,e,t,r){const i=await Lb(n.localStore,st(e)),s=i.targetId,a=n.sharedClientState.addLocalQueryTarget(s,t);let c;return r&&(c=await mw(n,e,s,a==="current",i.resumeToken)),n.isPrimaryClient&&t&&zh(n.remoteStore,i),c}async function mw(n,e,t,r,i){n.pu=(p,w,A)=>async function(v,x,k,P){let N=x.view.ru(k);N.bs&&(N=await Fh(v.localStore,x.query,!1).then(({documents:_})=>x.view.ru(_,N)));const M=P&&P.targetChanges.get(x.targetId),B=P&&P.targetMismatches.get(x.targetId)!=null,j=x.view.applyChanges(N,v.isPrimaryClient,M,B);return dd(v,x.targetId,j.au),j.snapshot}(n,p,w,A);const s=await Fh(n.localStore,e,!0),a=new uw(e,s.ks),c=a.ru(s.documents),l=Zr.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",i),u=a.applyChanges(c,n.isPrimaryClient,l);dd(n,t,u.au);const f=new hw(e,t,a);return n.Tu.set(e,f),n.Eu.has(t)?n.Eu.get(t).push(e):n.Eu.set(t,[e]),u.snapshot}async function yw(n,e,t){const r=Q(n),i=r.Tu.get(e),s=r.Eu.get(i.targetId);if(s.length>1)return r.Eu.set(i.targetId,s.filter(a=>!ms(a,e))),void r.Tu.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(i.targetId),r.sharedClientState.isActiveQueryTarget(i.targetId)||await ba(r.localStore,i.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(i.targetId),t&&Ia(r.remoteStore,i.targetId),Da(r,i.targetId)}).catch(Gn)):(Da(r,i.targetId),await ba(r.localStore,i.targetId,!0))}async function vw(n,e){const t=Q(n),r=t.Tu.get(e),i=t.Eu.get(r.targetId);t.isPrimaryClient&&i.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),Ia(t.remoteStore,r.targetId))}async function _w(n,e,t){const r=Aw(n);try{const i=await function(a,c){const l=Q(a),u=ie.now(),f=c.reduce((A,T)=>A.add(T.key),Z());let p,w;return l.persistence.runTransaction("Locally write mutations","readwrite",A=>{let T=wt(),v=Z();return l.xs.getEntries(A,f).next(x=>{T=x,T.forEach((k,P)=>{P.isValidDocument()||(v=v.add(k))})}).next(()=>l.localDocuments.getOverlayedDocuments(A,T)).next(x=>{p=x;const k=[];for(const P of c){const N=D_(P,p.get(P.key).overlayedDocument);N!=null&&k.push(new _n(P.key,N,Bu(N.value.mapValue),Et.exists(!0)))}return l.mutationQueue.addMutationBatch(A,u,k,c)}).next(x=>{w=x;const k=x.applyToLocalDocumentSet(p,v);return l.documentOverlayCache.saveOverlays(A,x.batchId,k)})}).then(()=>({batchId:w.batchId,changes:th(p)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(i.batchId),function(a,c,l){let u=a.du[a.currentUser.toKey()];u||(u=new ae(J)),u=u.insert(c,l),a.du[a.currentUser.toKey()]=u}(r,i.batchId,t),await ni(r,i.changes),await Ps(r.remoteStore)}catch(i){const s=ka(i,"Failed to persist write");t.reject(s)}}async function ad(n,e){const t=Q(n);try{const r=await Pb(t.localStore,e);e.targetChanges.forEach((i,s)=>{const a=t.Au.get(s);a&&(te(i.addedDocuments.size+i.modifiedDocuments.size+i.removedDocuments.size<=1,22616),i.addedDocuments.size>0?a.hu=!0:i.modifiedDocuments.size>0?te(a.hu,14607):i.removedDocuments.size>0&&(te(a.hu,42227),a.hu=!1))}),await ni(t,r,e)}catch(r){await Gn(r)}}function cd(n,e,t){const r=Q(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const i=[];r.Tu.forEach((s,a)=>{const c=a.view.va(e);c.snapshot&&i.push(c.snapshot)}),function(a,c){const l=Q(a);l.onlineState=c;let u=!1;l.queries.forEach((f,p)=>{for(const w of p.Sa)w.va(c)&&(u=!0)}),u&&Ra(l)}(r.eventManager,e),i.length&&r.Pu.H_(i),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function bw(n,e,t){const r=Q(n);r.sharedClientState.updateQueryState(e,"rejected",t);const i=r.Au.get(e),s=i&&i.key;if(s){let a=new ae(z.comparator);a=a.insert(s,Ae.newNoDocument(s,W.min()));const c=Z().add(s),l=new Es(W.min(),new Map,new ae(J),a,c);await ad(r,l),r.Ru=r.Ru.remove(s),r.Au.delete(e),La(r)}else await ba(r.localStore,e,!1).then(()=>Da(r,e,t)).catch(Gn)}async function ww(n,e){const t=Q(n),r=e.batch.batchId;try{const i=await Rb(t.localStore,e);ud(t,r,null),ld(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await ni(t,i)}catch(i){await Gn(i)}}async function Ew(n,e,t){const r=Q(n);try{const i=await function(a,c){const l=Q(a);return l.persistence.runTransaction("Reject batch","readwrite-primary",u=>{let f;return l.mutationQueue.lookupMutationBatch(u,c).next(p=>(te(p!==null,37113),f=p.keys(),l.mutationQueue.removeMutationBatch(u,p))).next(()=>l.mutationQueue.performConsistencyCheck(u)).next(()=>l.documentOverlayCache.removeOverlaysForBatchId(u,f,c)).next(()=>l.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(u,f)).next(()=>l.localDocuments.getDocuments(u,f))})}(r.localStore,e);ud(r,e,t),ld(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await ni(r,i)}catch(i){await Gn(i)}}function ld(n,e){(n.mu.get(e)||[]).forEach(t=>{t.resolve()}),n.mu.delete(e)}function ud(n,e,t){const r=Q(n);let i=r.du[r.currentUser.toKey()];if(i){const s=i.get(e);s&&(t?s.reject(t):s.resolve(),i=i.remove(e)),r.du[r.currentUser.toKey()]=i}}function Da(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Eu.get(e))n.Tu.delete(r),t&&n.Pu.yu(r,t);n.Eu.delete(e),n.isPrimaryClient&&n.Vu.Gr(e).forEach(r=>{n.Vu.containsKey(r)||hd(n,r)})}function hd(n,e){n.Iu.delete(e.path.canonicalString());const t=n.Ru.get(e);t!==null&&(Ia(n.remoteStore,t),n.Ru=n.Ru.remove(e),n.Au.delete(t),La(n))}function dd(n,e,t){for(const r of t)r instanceof id?(n.Vu.addReference(r.key,e),Tw(n,r)):r instanceof sd?(H(Na,"Document no longer in limbo: "+r.key),n.Vu.removeReference(r.key,e),n.Vu.containsKey(r.key)||hd(n,r.key)):G(19791,{wu:r})}function Tw(n,e){const t=e.key,r=t.path.canonicalString();n.Ru.get(t)||n.Iu.has(r)||(H(Na,"New document in limbo: "+t),n.Iu.add(r),La(n))}function La(n){for(;n.Iu.size>0&&n.Ru.size<n.maxConcurrentLimboResolutions;){const e=n.Iu.values().next().value;n.Iu.delete(e);const t=new z(re.fromString(e)),r=n.fu.next();n.Au.set(r,new dw(t)),n.Ru=n.Ru.insert(t,r),zh(n.remoteStore,new Kt(st(ia(t.path)),r,"TargetPurposeLimboResolution",is.ce))}}async function ni(n,e,t){const r=Q(n),i=[],s=[],a=[];r.Tu.isEmpty()||(r.Tu.forEach((c,l)=>{a.push(r.pu(l,e,t).then(u=>{var f;if((u||t)&&r.isPrimaryClient){const p=u?!u.fromCache:(f=t==null?void 0:t.targetChanges.get(l.targetId))==null?void 0:f.current;r.sharedClientState.updateQueryState(l.targetId,p?"current":"not-current")}if(u){i.push(u);const p=va.Is(l.targetId,u);s.push(p)}}))}),await Promise.all(a),r.Pu.H_(i),await async function(l,u){const f=Q(l);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",p=>V.forEach(u,w=>V.forEach(w.Ts,A=>f.persistence.referenceDelegate.addReference(p,w.targetId,A)).next(()=>V.forEach(w.Es,A=>f.persistence.referenceDelegate.removeReference(p,w.targetId,A)))))}catch(p){if(!Wn(p))throw p;H(_a,"Failed to update sequence numbers: "+p)}for(const p of u){const w=p.targetId;if(!p.fromCache){const A=f.vs.get(w),T=A.snapshotVersion,v=A.withLastLimboFreeSnapshotVersion(T);f.vs=f.vs.insert(w,v)}}}(r.localStore,s))}async function Iw(n,e){const t=Q(n);if(!t.currentUser.isEqual(e)){H(Na,"User change. New user:",e.toKey());const r=await Oh(t.localStore,e);t.currentUser=e,function(s,a){s.mu.forEach(c=>{c.forEach(l=>{l.reject(new q(L.CANCELLED,a))})}),s.mu.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await ni(t,r.Ns)}}function xw(n,e){const t=Q(n),r=t.Au.get(e);if(r&&r.hu)return Z().add(r.key);{let i=Z();const s=t.Eu.get(e);if(!s)return i;for(const a of s){const c=t.Tu.get(a);i=i.unionWith(c.view.nu)}return i}}function fd(n){const e=Q(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=ad.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=xw.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=bw.bind(null,e),e.Pu.H_=cw.bind(null,e.eventManager),e.Pu.yu=lw.bind(null,e.eventManager),e}function Aw(n){const e=Q(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=ww.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=Ew.bind(null,e),e}class Ns{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Cs(e.databaseInfo.databaseId),this.sharedClientState=this.Du(e),this.persistence=this.Cu(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Fu(e,this.localStore),this.indexBackfillerScheduler=this.Mu(e,this.localStore)}Fu(e,t){return null}Mu(e,t){return null}vu(e){return kb(this.persistence,new Ab,e.initialUser,this.serializer)}Cu(e){return new Vh(ya.Vi,this.serializer)}Du(e){return new Ob}async terminate(){var e,t;(e=this.gcScheduler)==null||e.stop(),(t=this.indexBackfillerScheduler)==null||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Ns.provider={build:()=>new Ns};class Sw extends Ns{constructor(e){super(),this.cacheSizeBytes=e}Fu(e,t){te(this.persistence.referenceDelegate instanceof As,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new hb(r,e.asyncQueue,t)}Cu(e){const t=this.cacheSizeBytes!==void 0?Oe.withCacheSize(this.cacheSizeBytes):Oe.DEFAULT;return new Vh(r=>As.Vi(r,t),this.serializer)}}class Va{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>cd(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=Iw.bind(null,this.syncEngine),await sw(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new aw}()}createDatastore(e){const t=Cs(e.databaseInfo.databaseId),r=qb(e.databaseInfo);return Kb(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return function(r,i,s,a,c){return new Wb(r,i,s,a,c)}(this.localStore,this.datastore,e.asyncQueue,t=>cd(this.syncEngine,t,0),function(){return qh.v()?new qh:new Mb}())}createSyncEngine(e,t){return function(i,s,a,c,l,u,f){const p=new fw(i,s,a,c,l,u);return f&&(p.gu=!0),p}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(i){const s=Q(i);H(bn,"RemoteStore shutting down."),s.Ia.add(5),await ti(s),s.Aa.shutdown(),s.Va.set("Unknown")}(this.remoteStore),(e=this.datastore)==null||e.terminate(),(t=this.eventManager)==null||t.terminate()}}Va.provider={build:()=>new Va};/**
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
 */class pd{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ou(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ou(this.observer.error,e):_t("Uncaught Error in snapshot listener:",e.toString()))}Nu(){this.muted=!0}Ou(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
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
 */const Wt="FirestoreClient";class Cw{constructor(e,t,r,i,s){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this._databaseInfo=i,this.user=xe.UNAUTHENTICATED,this.clientId=Ko.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(r,async a=>{H(Wt,"Received user=",a.uid),await this.authCredentialListener(a),this.user=a}),this.appCheckCredentials.start(r,a=>(H(Wt,"Received new app check token=",a),this.appCheckCredentialListener(a,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new bt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=ka(t,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function Oa(n,e){n.asyncQueue.verifyOperationInProgress(),H(Wt,"Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener(async i=>{r.isEqual(i)||(await Oh(e.localStore,i),r=i)}),e.persistence.setDatabaseDeletedListener(()=>n.terminate()),n._offlineComponents=e}async function gd(n,e){n.asyncQueue.verifyOperationInProgress();const t=await kw(n);H(Wt,"Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener(r=>Xh(e.remoteStore,r)),n.setAppCheckTokenChangeListener((r,i)=>Xh(e.remoteStore,i)),n._onlineComponents=e}async function kw(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){H(Wt,"Using user provided OfflineComponentProvider");try{await Oa(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(i){return i.name==="FirebaseError"?i.code===L.FAILED_PRECONDITION||i.code===L.UNIMPLEMENTED:!(typeof DOMException<"u"&&i instanceof DOMException)||i.code===22||i.code===20||i.code===11}(t))throw t;pn("Error using user provided cache. Falling back to memory cache: "+t),await Oa(n,new Ns)}}else H(Wt,"Using default OfflineComponentProvider"),await Oa(n,new Sw(void 0));return n._offlineComponents}async function md(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(H(Wt,"Using user provided OnlineComponentProvider"),await gd(n,n._uninitializedComponentsProvider._online)):(H(Wt,"Using default OnlineComponentProvider"),await gd(n,new Va))),n._onlineComponents}function Rw(n){return md(n).then(e=>e.syncEngine)}async function yd(n){const e=await md(n),t=e.eventManager;return t.onListen=pw.bind(null,e.syncEngine),t.onUnlisten=yw.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=gw.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=vw.bind(null,e.syncEngine),t}function Pw(n,e,t={}){const r=new bt;return n.asyncQueue.enqueueAndForget(async()=>function(s,a,c,l,u){const f=new pd({next:w=>{f.Nu(),a.enqueueAndForget(()=>td(s,p));const A=w.docs.has(c);!A&&w.fromCache?u.reject(new q(L.UNAVAILABLE,"Failed to get document because the client is offline.")):A&&w.fromCache&&l&&l.source==="server"?u.reject(new q(L.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):u.resolve(w)},error:w=>u.reject(w)}),p=new rd(ia(c.path),f,{includeMetadataChanges:!0,qa:!0});return ed(s,p)}(await yd(n),n.asyncQueue,e,t,r)),r.promise}function Nw(n,e,t={}){const r=new bt;return n.asyncQueue.enqueueAndForget(async()=>function(s,a,c,l,u){const f=new pd({next:w=>{f.Nu(),a.enqueueAndForget(()=>td(s,p)),w.fromCache&&l.source==="server"?u.reject(new q(L.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):u.resolve(w)},error:w=>u.reject(w)}),p=new rd(c,f,{includeMetadataChanges:!0,qa:!0});return ed(s,p)}(await yd(n),n.asyncQueue,e,t,r)),r.promise}function Dw(n,e){const t=new bt;return n.asyncQueue.enqueueAndForget(async()=>_w(await Rw(n),e,t)),t.promise}/**
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
 */function vd(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
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
 */const Lw="ComponentProvider",_d=new Map;function Vw(n,e,t,r,i){return new t_(n,e,t,i.host,i.ssl,i.experimentalForceLongPolling,i.experimentalAutoDetectLongPolling,vd(i.experimentalLongPollingOptions),i.useFetchStreams,i.isUsingEmulator,r)}/**
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
 */const bd="firestore.googleapis.com",wd=!0;class Ed{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new q(L.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=bd,this.ssl=wd}else this.host=e.host,this.ssl=e.ssl??wd;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=Nh;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<lb)throw new q(L.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}jv("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=vd(e.experimentalLongPollingOptions??{}),function(r){if(r.timeoutSeconds!==void 0){if(isNaN(r.timeoutSeconds))throw new q(L.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (must not be NaN)`);if(r.timeoutSeconds<5)throw new q(L.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (minimum allowed value is 5)`);if(r.timeoutSeconds>30)throw new q(L.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,i){return r.timeoutSeconds===i.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Ds{constructor(e,t,r,i){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Ed({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new q(L.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new q(L.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Ed(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new Lv;switch(r.type){case"firstParty":return new Fv(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new q(L.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const r=_d.get(t);r&&(H(Lw,"Removing Datastore"),_d.delete(t),r.terminate())}(this),Promise.resolve()}}function Ow(n,e,t,r={}){var u;n=gn(n,Ds);const i=Sr(e),s=n._getSettings(),a={...s,emulatorOptions:n._getEmulatorOptions()},c=`${e}:${t}`;i&&Kc(`https://${c}`),s.host!==bd&&s.host!==c&&pn("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const l={...s,host:c,ssl:i,emulatorOptions:r};if(!an(l,a)&&(n._setSettings(l),r.mockUserToken)){let f,p;if(typeof r.mockUserToken=="string")f=r.mockUserToken,p=xe.MOCK_USER;else{f=zp(r.mockUserToken,(u=n._app)==null?void 0:u.options.projectId);const w=r.mockUserToken.sub||r.mockUserToken.user_id;if(!w)throw new q(L.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");p=new xe(w)}n._authCredentials=new Vv(new pu(f,p))}}/**
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
 */class sr{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new sr(this.firestore,e,this._query)}}class pe{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Qt(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new pe(this.firestore,e,this._key)}toJSON(){return{type:pe._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,r){if(Mr(t,pe._jsonSchema))return new pe(e,r||null,new z(re.fromString(t.referencePath)))}}pe._jsonSchemaVersion="firestore/documentReference/1.0",pe._jsonSchema={type:he("string",pe._jsonSchemaVersion),referencePath:he("string")};class Qt extends sr{constructor(e,t,r){super(e,t,ia(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new pe(this.firestore,null,new z(e))}withConverter(e){return new Qt(this.firestore,e,this._path)}}function Td(n,e,...t){if(n=Pe(n),yu("collection","path",e),n instanceof Ds){const r=re.fromString(e,...t);return _u(r),new Qt(n,null,r)}{if(!(n instanceof pe||n instanceof Qt))throw new q(L.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(re.fromString(e,...t));return _u(r),new Qt(n.firestore,null,r)}}function Yt(n,e,...t){if(n=Pe(n),arguments.length===1&&(e=Ko.newId()),yu("doc","path",e),n instanceof Ds){const r=re.fromString(e,...t);return vu(r),new pe(n,null,new z(r))}{if(!(n instanceof pe||n instanceof Qt))throw new q(L.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(re.fromString(e,...t));return vu(r),new pe(n.firestore,n instanceof Qt?n.converter:null,new z(r))}}/**
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
 */const Id="AsyncQueue";class xd{constructor(e=Promise.resolve()){this.Yu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new $h(this,"async_queue_retry"),this._c=()=>{const r=Ta();r&&H(Id,"Visibility state changed to "+r.visibilityState),this.M_.w_()},this.ac=e;const t=Ta();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.uc(),this.cc(e)}enterRestrictedMode(e){if(!this.ec){this.ec=!0,this.sc=e||!1;const t=Ta();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this._c)}}enqueue(e){if(this.uc(),this.ec)return new Promise(()=>{});const t=new bt;return this.cc(()=>this.ec&&this.sc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Yu.push(e),this.lc()))}async lc(){if(this.Yu.length!==0){try{await this.Yu[0](),this.Yu.shift(),this.M_.reset()}catch(e){if(!Wn(e))throw e;H(Id,"Operation failed with retryable error: "+e)}this.Yu.length>0&&this.M_.p_(()=>this.lc())}}cc(e){const t=this.ac.then(()=>(this.rc=!0,e().catch(r=>{throw this.nc=r,this.rc=!1,_t("INTERNAL UNHANDLED ERROR: ",Ad(r)),r}).then(r=>(this.rc=!1,r))));return this.ac=t,t}enqueueAfterDelay(e,t,r){this.uc(),this.oc.indexOf(e)>-1&&(t=0);const i=Ca.createAndSchedule(this,e,t,r,s=>this.hc(s));return this.tc.push(i),i}uc(){this.nc&&G(47125,{Pc:Ad(this.nc)})}verifyOperationInProgress(){}async Tc(){let e;do e=this.ac,await e;while(e!==this.ac)}Ec(e){for(const t of this.tc)if(t.timerId===e)return!0;return!1}Ic(e){return this.Tc().then(()=>{this.tc.sort((t,r)=>t.targetTimeMs-r.targetTimeMs);for(const t of this.tc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.Tc()})}Rc(e){this.oc.push(e)}hc(e){const t=this.tc.indexOf(e);this.tc.splice(t,1)}}function Ad(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}class Ls extends Ds{constructor(e,t,r,i){super(e,t,r,i),this.type="firestore",this._queue=new xd,this._persistenceKey=(i==null?void 0:i.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new xd(e),this._firestoreClient=void 0,await e}}}function Mw(n,e){const t=typeof n=="object"?n:tl(),r=typeof n=="string"?n:ls,i=Co(t,"firestore").getImmediate({identifier:r});if(!i._initialized){const s=Hp("firestore");s&&Ow(i,...s)}return i}function Ma(n){if(n._terminated)throw new q(L.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||Fw(n),n._firestoreClient}function Fw(n){var r,i,s,a;const e=n._freezeSettings(),t=Vw(n._databaseId,((r=n._app)==null?void 0:r.options.appId)||"",n._persistenceKey,(i=n._app)==null?void 0:i.options.apiKey,e);n._componentsProvider||(s=e.localCache)!=null&&s._offlineComponentProvider&&((a=e.localCache)!=null&&a._onlineComponentProvider)&&(n._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),n._firestoreClient=new Cw(n._authCredentials,n._appCheckCredentials,n._queue,t,n._componentsProvider&&function(l){const u=l==null?void 0:l._online.build();return{_offline:l==null?void 0:l._offline.build(u),_online:u}}(n._componentsProvider))}/**
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
 */class ze{constructor(e){this._byteString=e}static fromBase64String(e){try{return new ze(Te.fromBase64String(e))}catch(t){throw new q(L.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new ze(Te.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:ze._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(Mr(e,ze._jsonSchema))return ze.fromBase64String(e.bytes)}}ze._jsonSchemaVersion="firestore/bytes/1.0",ze._jsonSchema={type:he("string",ze._jsonSchemaVersion),bytes:he("string")};/**
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
 */class Sd{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new q(L.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new we(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
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
 */class Fa{constructor(e){this._methodName=e}}/**
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
 */class at{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new q(L.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new q(L.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return J(this._lat,e._lat)||J(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:at._jsonSchemaVersion}}static fromJSON(e){if(Mr(e,at._jsonSchema))return new at(e.latitude,e.longitude)}}at._jsonSchemaVersion="firestore/geoPoint/1.0",at._jsonSchema={type:he("string",at._jsonSchemaVersion),latitude:he("number"),longitude:he("number")};/**
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
 */class Ze{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,i){if(r.length!==i.length)return!1;for(let s=0;s<r.length;++s)if(r[s]!==i[s])return!1;return!0}(this._values,e._values)}toJSON(){return{type:Ze._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(Mr(e,Ze._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(t=>typeof t=="number"))return new Ze(e.vectorValues);throw new q(L.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}Ze._jsonSchemaVersion="firestore/vectorValue/1.0",Ze._jsonSchema={type:he("string",Ze._jsonSchemaVersion),vectorValues:he("object")};/**
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
 */const Uw=/^__.*__$/;class Bw{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new _n(e,this.data,this.fieldMask,t,this.fieldTransforms):new Xr(e,this.data,t,this.fieldTransforms)}}function Cd(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw G(40011,{dataSource:n})}}class Ua{constructor(e,t,r,i,s,a){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=i,s===void 0&&this.Ac(),this.fieldTransforms=s||[],this.fieldMask=a||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}i(e){return new Ua({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}dc(e){var i;const t=(i=this.path)==null?void 0:i.child(e),r=this.i({path:t,arrayElement:!1});return r.mc(e),r}fc(e){var i;const t=(i=this.path)==null?void 0:i.child(e),r=this.i({path:t,arrayElement:!1});return r.Ac(),r}gc(e){return this.i({path:void 0,arrayElement:!0})}yc(e){return Os(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}Ac(){if(this.path)for(let e=0;e<this.path.length;e++)this.mc(this.path.get(e))}mc(e){if(e.length===0)throw this.yc("Document fields must not be empty");if(Cd(this.dataSource)&&Uw.test(e))throw this.yc('Document fields cannot begin and end with "__"')}}class qw{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||Cs(e)}I(e,t,r,i=!1){return new Ua({dataSource:e,methodName:t,targetDoc:r,path:we.emptyPath(),arrayElement:!1,hasConverter:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function kd(n){const e=n._freezeSettings(),t=Cs(n._databaseId);return new qw(n._databaseId,!!e.ignoreUndefinedProperties,t)}function $w(n,e,t,r,i,s={}){const a=n.I(s.merge||s.mergeFields?2:0,e,t,i);Nd("Data must be an object, but it was:",a,r);const c=Rd(r,a);let l,u;if(s.merge)l=new Xe(a.fieldMask),u=a.fieldTransforms;else if(s.mergeFields){const f=[];for(const p of s.mergeFields){const w=Vs(e,p,t);if(!a.contains(w))throw new q(L.INVALID_ARGUMENT,`Field '${w}' is specified in your field mask but missing from your input data.`);Kw(f,w)||f.push(w)}l=new Xe(f),u=a.fieldTransforms.filter(p=>l.covers(p.field))}else l=null,u=a.fieldTransforms;return new Bw(new je(c),l,u)}class Ba extends Fa{_toFieldTransform(e){return new k_(e.path,new Gr)}isEqual(e){return e instanceof Ba}}function Hw(n,e,t,r=!1){return qa(t,n.I(r?4:3,e))}function qa(n,e){if(Pd(n=Pe(n)))return Nd("Unsupported field value:",e,n),Rd(n,e);if(n instanceof Fa)return function(r,i){if(!Cd(i.dataSource))throw i.yc(`${r._methodName}() can only be used with update() and set()`);if(!i.path)throw i.yc(`${r._methodName}() is not currently supported inside arrays`);const s=r._toFieldTransform(i);s&&i.fieldTransforms.push(s)}(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.yc("Nested arrays are not supported");return function(r,i){const s=[];let a=0;for(const c of r){let l=qa(c,i.gc(a));l==null&&(l={nullValue:"NULL_VALUE"}),s.push(l),a++}return{arrayValue:{values:s}}}(n,e)}return function(r,i){if((r=Pe(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return A_(i.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const s=ie.fromDate(r);return{timestampValue:xs(i.serializer,s)}}if(r instanceof ie){const s=new ie(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:xs(i.serializer,s)}}if(r instanceof at)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof ze)return{bytesValue:Eh(i.serializer,r._byteString)};if(r instanceof pe){const s=i.databaseId,a=r.firestore._databaseId;if(!a.isEqual(s))throw i.yc(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${s.projectId}/${s.database}`);return{referenceValue:ha(r.firestore._databaseId||i.databaseId,r._key.path)}}if(r instanceof Ze)return function(a,c){const l=a instanceof Ze?a.toArray():a;return{mapValue:{fields:{[Du]:{stringValue:Lu},[hs]:{arrayValue:{values:l.map(f=>{if(typeof f!="number")throw c.yc("VectorValues must only contain numeric values.");return aa(c.serializer,f)})}}}}}}(r,i);if(Rh(r))return r._toProto(i.serializer);throw i.yc(`Unsupported field value: ${rs(r)}`)}(n,e)}function Rd(n,e){const t={};return Au(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):mn(n,(r,i)=>{const s=qa(i,e.dc(r));s!=null&&(t[r]=s)}),{mapValue:{fields:t}}}function Pd(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof ie||n instanceof at||n instanceof ze||n instanceof pe||n instanceof Fa||n instanceof Ze||Rh(n))}function Nd(n,e,t){if(!Pd(t)||!bu(t)){const r=rs(t);throw r==="an object"?e.yc(n+" a custom object"):e.yc(n+" "+r)}}function Vs(n,e,t){if((e=Pe(e))instanceof Sd)return e._internalPath;if(typeof e=="string")return zw(n,e);throw Os("Field path arguments must be of type string or ",n,!1,void 0,t)}const jw=new RegExp("[~\\*/\\[\\]]");function zw(n,e,t){if(e.search(jw)>=0)throw Os(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new Sd(...e.split("."))._internalPath}catch{throw Os(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function Os(n,e,t,r,i){const s=r&&!r.isEmpty(),a=i!==void 0;let c=`Function ${e}() called with invalid data`;t&&(c+=" (via `toFirestore()`)"),c+=". ";let l="";return(s||a)&&(l+=" (found",s&&(l+=` in field ${r}`),a&&(l+=` in document ${i}`),l+=")"),new q(L.INVALID_ARGUMENT,c+n+l)}function Kw(n,e){return n.some(t=>t.isEqual(e))}/**
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
 */class Gw{convertValue(e,t="none"){switch(zt(e)){case 0:return null;case 1:return e.booleanValue;case 2:return le(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(jt(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw G(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return mn(e,(i,s)=>{r[i]=this.convertValue(s,t)}),r}convertVectorValue(e){var r,i,s;const t=(s=(i=(r=e.fields)==null?void 0:r[hs].arrayValue)==null?void 0:i.values)==null?void 0:s.map(a=>le(a.doubleValue));return new Ze(t)}convertGeoPoint(e){return new at(le(e.latitude),le(e.longitude))}convertArray(e,t){return(e.values||[]).map(r=>this.convertValue(r,t))}convertServerTimestamp(e,t){switch(t){case"previous":const r=cs(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(Ur(e));default:return null}}convertTimestamp(e){const t=Ht(e);return new ie(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=re.fromString(e);te(kh(r),9688,{name:e});const i=new Br(r.get(1),r.get(3)),s=new z(r.popFirst(5));return i.isEqual(t)||_t(`Document ${s} contains a document reference within a different database (${i.projectId}/${i.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),s}}/**
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
 */class Dd extends Gw{constructor(e){super(),this.firestore=e}convertBytes(e){return new ze(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new pe(this.firestore,null,t)}}function Ms(){return new Ba("serverTimestamp")}const Ld="@firebase/firestore",Vd="4.14.0";/**
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
 */class Od{constructor(e,t,r,i,s){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=i,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new pe(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new Ww(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var e;return((e=this._document)==null?void 0:e.data.clone().value.mapValue.fields)??void 0}get(e){if(this._document){const t=this._document.data.field(Vs("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class Ww extends Od{data(){return super.data()}}/**
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
 */function Qw(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new q(L.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class $a{}class Yw extends $a{}function Ha(n,e,...t){let r=[];e instanceof $a&&r.push(e),r=r.concat(t),function(s){const a=s.filter(l=>l instanceof ja).length,c=s.filter(l=>l instanceof Fs).length;if(a>1||a>0&&c>0)throw new q(L.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const i of r)n=i._apply(n);return n}class Fs extends Yw{constructor(e,t,r){super(),this._field=e,this._op=t,this._value=r,this.type="where"}static _create(e,t,r){return new Fs(e,t,r)}_apply(e){const t=this._parse(e);return Ud(e._query,t),new sr(e.firestore,e.converter,sa(e._query,t))}_parse(e){const t=kd(e.firestore);return function(s,a,c,l,u,f,p){let w;if(u.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new q(L.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){Fd(p,f);const T=[];for(const v of p)T.push(Md(l,s,v));w={arrayValue:{values:T}}}else w=Md(l,s,p)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||Fd(p,f),w=Hw(c,a,p,f==="in"||f==="not-in");return de.create(u,f,w)}(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function Us(n,e,t){const r=e,i=Vs("where",n);return Fs._create(i,r,t)}class ja extends $a{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new ja(e,t)}_parse(e){const t=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return t.length===1?t[0]:Je.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:(function(i,s){let a=i;const c=s.getFlattenedFilters();for(const l of c)Ud(a,l),a=sa(a,l)}(e._query,t),new sr(e.firestore,e.converter,sa(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}function Md(n,e,t){if(typeof(t=Pe(t))=="string"){if(t==="")throw new q(L.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Xu(e)&&t.indexOf("/")!==-1)throw new q(L.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const r=e.path.child(re.fromString(t));if(!z.isDocumentKey(r))throw new q(L.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return Mu(n,new z(r))}if(t instanceof pe)return Mu(n,t._key);throw new q(L.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${rs(t)}.`)}function Fd(n,e){if(!Array.isArray(n)||n.length===0)throw new q(L.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function Ud(n,e){const t=function(i,s){for(const a of i)for(const c of a.getFlattenedFilters())if(s.indexOf(c.op)>=0)return c.op;return null}(n.filters,function(i){switch(i){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(t!==null)throw t===e.op?new q(L.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new q(L.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}function Xw(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}class ri{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class En extends Od{constructor(e,t,r,i,s,a){super(e,t,r,i,a),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Bs(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(Vs("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new q(L.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=En._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}En._jsonSchemaVersion="firestore/documentSnapshot/1.0",En._jsonSchema={type:he("string",En._jsonSchemaVersion),bundleSource:he("string","DocumentSnapshot"),bundleName:he("string"),bundle:he("string")};class Bs extends En{data(e={}){return super.data(e)}}class or{constructor(e,t,r,i){this._firestore=e,this._userDataWriter=t,this._snapshot=i,this.metadata=new ri(i.hasPendingWrites,i.fromCache),this.query=r}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(r=>{e.call(t,new Bs(this._firestore,this._userDataWriter,r.key,r,new ri(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new q(L.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(i,s){if(i._snapshot.oldDocs.isEmpty()){let a=0;return i._snapshot.docChanges.map(c=>{const l=new Bs(i._firestore,i._userDataWriter,c.doc.key,c.doc,new ri(i._snapshot.mutatedKeys.has(c.doc.key),i._snapshot.fromCache),i.query.converter);return c.doc,{type:"added",doc:l,oldIndex:-1,newIndex:a++}})}{let a=i._snapshot.oldDocs;return i._snapshot.docChanges.filter(c=>s||c.type!==3).map(c=>{const l=new Bs(i._firestore,i._userDataWriter,c.doc.key,c.doc,new ri(i._snapshot.mutatedKeys.has(c.doc.key),i._snapshot.fromCache),i.query.converter);let u=-1,f=-1;return c.type!==0&&(u=a.indexOf(c.doc.key),a=a.delete(c.doc.key)),c.type!==1&&(a=a.add(c.doc),f=a.indexOf(c.doc.key)),{type:Jw(c.type),doc:l,oldIndex:u,newIndex:f}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new q(L.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=or._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Ko.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],r=[],i=[];return this.docs.forEach(s=>{s._document!==null&&(t.push(s._document),r.push(this._userDataWriter.convertObjectMap(s._document.data.value.mapValue.fields,"previous")),i.push(s.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function Jw(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return G(61501,{type:n})}}/**
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
 */or._jsonSchemaVersion="firestore/querySnapshot/1.0",or._jsonSchema={type:he("string",or._jsonSchemaVersion),bundleSource:he("string","QuerySnapshot"),bundleName:he("string"),bundle:he("string")};/**
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
 */function qs(n){n=gn(n,pe);const e=gn(n.firestore,Ls),t=Ma(e);return Pw(t,n._key).then(r=>eE(e,n,r))}function za(n){n=gn(n,sr);const e=gn(n.firestore,Ls),t=Ma(e),r=new Dd(e);return Qw(n._query),Nw(t,n._query).then(i=>new or(e,r,n,i))}function $s(n,e,t){n=gn(n,pe);const r=gn(n.firestore,Ls),i=Xw(n.converter,e,t),s=kd(r);return Zw(r,[$w(s,"setDoc",n._key,i,n.converter!==null,t).toMutation(n._key,Et.none())])}function Zw(n,e){const t=Ma(n);return Dw(t,e)}function eE(n,e,t){const r=t.docs.get(e._key),i=new Dd(n);return new En(n,i,e._key,r,new ri(t.hasPendingWrites,t.fromCache),e.converter)}(function(e,t=!0){Dv(Fn),Mn(new cn("firestore",(r,{instanceIdentifier:i,options:s})=>{const a=r.getProvider("app").getImmediate(),c=new Ls(new Ov(r.getProvider("auth-internal")),new Uv(a,r.getProvider("app-check-internal")),n_(a,i),a);return s={useFetchStreams:t,...s},c._setSettings(s),c},"PUBLIC").setMultipleInstances(!0)),Dt(Ld,Vd,e),Dt(Ld,Vd,"esm2020")})();const Bd=el({apiKey:"***REMOVED***",authDomain:"vnpt-cloud-sync.firebaseapp.com",projectId:"vnpt-cloud-sync",storageBucket:"vnpt-cloud-sync.firebasestorage.app",messagingSenderId:"1034099532877",appId:"1:1034099532877:web:3bcbe2ab0ea8fae524e804",measurementId:"G-650CYB84PL"}),Ke=Pv(Bd),ct=Mw(Bd),Hs="VNPT_PRO_SECRET_2026";function tE(n){if(!n)return"";try{return btoa((t=>t.split("").map((r,i)=>String.fromCharCode(r.charCodeAt(0)^Hs.charCodeAt(i%Hs.length))).join(""))(n))}catch(e){return console.error("Encryption error:",e),n}}function nE(n){if(!n)return"";try{return(t=>t.split("").map((r,i)=>String.fromCharCode(r.charCodeAt(0)^Hs.charCodeAt(i%Hs.length))).join(""))(atob(n))}catch(e){return console.error("Decryption error:",e),n}}const Ge={async signUp(n,e){return await gy(Ke,n,e)},async signIn(n,e){return await my(Ke,n,e)},async logout(){await by(Ke)},onAuthChange(n){return _y(Ke,n)},async pushProfile(n){const e=Ke.currentUser;if(!e)throw new Error("Chưa đăng nhập Firebase");const t=Yt(ct,`users/${e.uid}/profiles`,n.id);await $s(t,{...n,updatedAt:Ms()},{merge:!0})},async pullProfiles(){const n=Ke.currentUser;if(!n)return[];const e=Td(ct,`users/${n.uid}/profiles`),t=Ha(e);return(await za(t)).docs.map(i=>i.data())},async backupKeys(n){const e=Ke.currentUser;if(!e)return;const t={};for(const[i,s]of Object.entries(n))t[i]=tE(s);const r=Yt(ct,`users/${e.uid}/secrets`,"api_keys");await $s(r,{...t,updatedAt:Ms()},{merge:!0})},async restoreKeys(){const n=Ke.currentUser;if(!n)return null;const e=Yt(ct,`users/${n.uid}/secrets`,"api_keys"),t=await qs(e);if(!t.exists())return null;const r=t.data(),i={};for(const[s,a]of Object.entries(r))s!=="updatedAt"&&(i[s]=nE(a));return i},async updateUserSettings(n){const e=Ke.currentUser;if(!e)return;const t=Yt(ct,`users/${e.uid}/settings`,"general");await $s(t,{...n,updatedAt:Ms()},{merge:!0})},async getUserSettings(){const n=Ke.currentUser;if(!n)return null;const e=Yt(ct,`users/${n.uid}/settings`,"general"),t=await qs(e);return t.exists()?t.data():null},async pushGlobalConfig(n){const e=Ke.currentUser;if(!e)return;const t=Yt(ct,`users/${e.uid}/settings`,"config");await $s(t,{...n,updatedAt:Ms()},{merge:!0})},async pullGlobalConfig(){const n=Ke.currentUser;if(!n)return null;const e=Yt(ct,`users/${n.uid}/settings`,"config"),t=await qs(e);return t.exists()?t.data():null},async getSharedTemplates(){try{const n=await this.getUserSettings(),e=(n==null?void 0:n.workspace)||"global",t=Td(ct,"shared_templates"),r=Ha(t,Us("active","==",!0),Us("workspace","==",e));let s=(await za(r)).docs.map(a=>({id:a.id,...a.data()}));if(e!=="global"){const a=Ha(t,Us("active","==",!0),Us("workspace","==","global")),l=(await za(a)).docs.map(u=>({id:u.id,...u.data()}));s=[...s,...l]}return s}catch(n){return console.error("FirebaseService.getSharedTemplates error:",n),[]}},async getRemoteConfigs(){try{const n=Yt(ct,"settings","remote_configs"),e=await qs(n);return e.exists()?e.data():null}catch(n){return console.error("FirebaseService.getRemoteConfigs error:",n),null}}};function ar(){try{const n=O.get(br)||[],e=n.filter(t=>t.type!=="local");return e.length!==n.length&&cr(e),e}catch{return[]}}function cr(n){O.set(br,n)}function rE(n){const e=n.match(/drive\.google\.com\/file\/d\/([^/]+)/);return e?`https://drive.google.com/uc?export=download&id=${e[1]}`:n}function iE(n){return new Promise((e,t)=>{GM_xmlhttpRequest({method:"GET",url:rE(n),responseType:"arraybuffer",onload:r=>{if(r.status>=200&&r.status<300){if(r.response&&r.response.byteLength>4){const i=new Uint8Array(r.response.slice(0,4));if(i[0]===80&&i[1]===75&&i[2]===3&&i[3]===4){e(r.response);return}else{t(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}e(r.response)}else t(new Error(`HTTP ${r.status}: Không lấy được file`))},onerror:()=>t(new Error("Không thể tải URL.")),ontimeout:()=>t(new Error("Timeout khi tải URL."))})})}async function sE(n,e,t){const r=n.name.replace(/\.docx$/i,""),i=prompt("Đặt tên biến nhớ cho file này:",r);if(!(!i||!i.trim()))try{const s=await n.arrayBuffer();await Np(i.trim(),s);const c=ar().filter(l=>l.name!==i.trim()&&l.fileName!==n.name);c.unshift({name:i.trim(),type:"local_idb",fileName:n.name,lastUsed:Date.now()}),cr(c),Tn(e,t),t&&t(s,i.trim())}catch(s){F(`❌ Lỗi lưu file: ${s.message}`,"#dc3545")}}function Tn(n,e,t=null){let r=n.querySelector(".vnpt-template-manager-inner"),i,s,a,c=n.dataset.activeTab||"local";if(r)i=r.querySelector(".vnpt-local-list-container"),s=r.querySelector(".vnpt-cloud-list-container"),a=r.querySelector(".vnpt-btn-wrap"),i=r.querySelector(".vnpt-local-list-container"),s=r.querySelector(".vnpt-cloud-list-container"),a=r.querySelector(".vnpt-btn-wrap");else{n.innerHTML="",r=document.createElement("div"),r.className="vnpt-template-manager-inner";const u=document.createElement("div");u.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const f=document.createElement("span");f.className="vnpt-title-main",f.style.cssText="font-size:11px;font-weight:700;color:#444;",a=document.createElement("div"),a.className="vnpt-btn-wrap",a.style.cssText="display:flex;gap:4px;",u.appendChild(f),u.appendChild(a),r.appendChild(u),i=document.createElement("div"),i.className="vnpt-local-list-container",i.style.cssText="display:flex;flex-wrap:wrap;gap:4px;",r.appendChild(i),s=document.createElement("div"),s.className="vnpt-cloud-list-container",s.style.cssText="display:none;flex-direction:column;gap:4px;",r.appendChild(s),n.appendChild(r)}const l=r.querySelector(".vnpt-title-main");c==="local"?(i.style.display="flex",s.style.display="none",oE(i,l,e,t,n)):(i.style.display="none",s.style.display="flex",aE(s,l,e,t,n))}function oE(n,e,t,r,i){const s=ar();if(e.innerHTML="Templates"+(r?` <span style="color:#2e7d32;">(Đang dùng: ${r})</span>`:""),s.length===0){n.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:12px;text-align:center;width:100%;">Chưa có mẫu nào. Hãy chọn file .docx bên dưới để lưu vào đây.</div>';return}n.innerHTML="",s.forEach((a,c)=>{const l=qd(a,c,t,r,i);n.appendChild(l)})}function qd(n,e,t,r,i){const s=document.createElement("div");s.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 8px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;transition:all 0.2s;",n.name===r&&(s.style.borderColor="var(--vnpt-primary)",s.style.background="var(--vnpt-primary-light)"),s.title=n.fileName||n.url||n.name,s.tabIndex=0,s.onfocus=()=>s.style.boxShadow="0 0 0 2px var(--vnpt-primary)",s.onblur=()=>s.style.boxShadow="none";const a=n.type==="local"||n.type==="local_base64"||n.type==="local_idb"?"OFF":"ON",c=a==="OFF"?"#6c757d":"#28a745",l=document.createElement("span");l.textContent=a,l.style.cssText=`font-size:8px;padding:1px 5px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${c};color:#fff;`;const u=document.createElement("span");if(u.textContent=n.name,u.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",s.onclick=()=>{s.focus(),lE(n,t,r,i)},s.appendChild(l),s.appendChild(u),n.type!=="cloud_shared"){const f=document.createElement("button");f.innerHTML="✎",f.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",f.onclick=w=>{w.stopPropagation();const A=prompt("Đổi tên template:",n.name);if(A&&A.trim()&&A.trim()!==n.name){const T=ar(),v=T.findIndex(x=>x.name===n.name);v>=0&&(T[v].name=A.trim(),cr(T),Tn(i,t,r))}},s.appendChild(f);const p=document.createElement("button");p.innerHTML="✕",p.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",p.onclick=async w=>{if(w.stopPropagation(),confirm(`Xoá biểu mẫu "${n.name}"?`)){const A=ar(),T=A.findIndex(v=>v.name===n.name);if(T>=0){const v=A[T];A.splice(T,1),cr(A),v.type==="local_idb"&&await Lp(v.name).catch(()=>null),Tn(i,t,r===v.name?null:r)}}},s.appendChild(p)}else{const f=document.createElement("button");f.innerHTML="📥",f.title="Lưu về danh sách cá nhân",f.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:var(--vnpt-primary);cursor:pointer;margin-left:auto;",f.onclick=p=>{p.stopPropagation(),cE(n)},s.appendChild(f)}return s}async function aE(n,e,t,r,i){e.textContent="Thư viện dùng chung",n.innerHTML='<div style="text-align:center;padding:10px;font-size:10px;color:#666;">⏳ Đang tải từ Cloud...</div>';try{const s=await Ge.getSharedTemplates();if(s.length===0){n.innerHTML='<div style="text-align:center;padding:10px;font-size:10px;color:#999;font-style:italic;">Thư viện trống hoặc chưa được cấu hình.</div>';return}n.innerHTML="",s.forEach(a=>{const c={...a,type:"cloud_shared"},l=qd(c,0,t,r,i);if(l.style.width="100%",l.style.borderRadius="8px",a.department){const u=document.createElement("span");u.textContent=a.department,u.style.cssText="font-size:9px;background:#e3f2fd;color:#1976d2;padding:1px 4px;border-radius:4px;margin-left:4px;",l.insertBefore(u,l.querySelector("button"))}n.appendChild(l)})}catch(s){n.innerHTML=`<div style="text-align:center;padding:10px;font-size:10px;color:#ea4335;">❌ Lỗi: ${s.message}</div>`}}async function cE(n){const e=ar();if(e.some(r=>r.url===n.url)){F("Mẫu này đã có trong danh sách cá nhân của bạn.");return}e.unshift({name:n.name,url:n.url,type:"url",fileName:n.fileName||n.name+".docx",lastUsed:Date.now()}),cr(e),F(`✅ Đã thêm "${n.name}" vào danh sách cá nhân.`)}function lE(n,e,t,r){const i=ar(),s=i.find(a=>a.name===n.name&&(a.url===n.url||a.type===n.type));if(s&&(s.lastUsed=Date.now(),cr(i)),n.type==="local_idb"){Dp(n.name).then(a=>{if(!a)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");e&&e(a,n.name),Tn(r,e,n.name)}).catch(a=>{F(`❌ Lỗi nạp File IDB: ${a.message}`,"#dc3545")});return}if(n.type==="local_base64"&&n.data){try{const a=window.atob(n.data.split(",")[1]),c=a.length,l=new Uint8Array(c);for(let u=0;u<c;u++)l[u]=a.charCodeAt(u);e&&e(l.buffer,n.name),Tn(r,e,n.name)}catch(a){F(`❌ Lỗi nạp Base64: ${a.message}`,"#dc3545")}return}iE(n.url).then(a=>{e&&e(a,n.name),Tn(r,e,n.name)}).catch(a=>{F(`❌ ${a.message}`,"#dc3545")})}function Ka(n){return n?n.toString().toLowerCase().trim().replace(/\s+/g," ").replace(/[.,\s]+$/,""):""}const uE={saveLearning(n,e){if(!n||!e)return;const t=Ka(n),r=e.trim(),i=O.get(Vn,{});i[t]!==r&&(i[t]=r,O.setDebounced(Vn,i,1e3),console.debug(`[AddressLearning] Learned: "${t}" -> "${r}"`))},getLearnedStreet(n){if(!n)return null;const e=Ka(n);return O.get(Vn,{})[e]||null},forgetLearning(n){if(!n)return;const e=Ka(n),t=O.get(Vn,{});t[e]&&(delete t[e],O.set(Vn,t))}};function hE(n,e){if(n.length===0)return e.length;if(e.length===0)return n.length;const t=[];for(let r=0;r<=e.length;r++)t[r]=[r];for(let r=0;r<=n.length;r++)t[0][r]=r;for(let r=1;r<=e.length;r++)for(let i=1;i<=n.length;i++)e.charAt(r-1)===n.charAt(i-1)?t[r][i]=t[r-1][i-1]:t[r][i]=Math.min(t[r-1][i-1]+1,t[r][i-1]+1,t[r-1][i]+1);return t[e.length][n.length]}function dE(n,e){let t=n,r=e;n.length<e.length&&(t=e,r=n);const i=t.length;return i===0?1:(i-hE(t,r))/parseFloat(i)}function Ga(n,e,t=.7){let r=null,i=-1;const s=n.toLowerCase().trim();for(const a of e){const c=a.toLowerCase().trim(),l=dE(s,c);l>i&&l>=t&&(i=l,r=a)}return r}function fE(n){if(!n)return"";let e=n.replace(/\D/g,"");return e.startsWith("84")&&(e="0"+e.slice(2)),e}function $d(n){if(!n)return"";let e=n.trim();if(!e)return"";if(/^\d{8}$/.test(e))return`${e.substring(0,2)}/${e.substring(2,4)}/${e.substring(4)}`;const t=e.split(/[-/.\s]/).filter(r=>!!r);if(t.length===3){let r,i,s;if(t[0].length===4)[s,i,r]=t;else if(t[2].length===4)[r,i,s]=t;else if(t[2].length===2)[r,i,s]=t,s=(parseInt(s)<50?"20":"19")+s.padStart(2,"0");else return e;return`${r.padStart(2,"0")}/${i.padStart(2,"0")}/${s}`}if(e.includes("T")&&!isNaN(Date.parse(e))){const r=new Date(e),i=String(r.getDate()).padStart(2,"0"),s=String(r.getMonth()+1).padStart(2,"0"),a=r.getFullYear();return`${i}/${s}/${a}`}return e}function Wa(n){if(!n)return{province:"",district:"",ward:"",street:""};const e=n.split(",").map(u=>u.trim()).filter(Boolean),t=e.length;let r="",i="",s="",a="";return t===0?{province:r,district:i,ward:s,street:a}:(r=e[t-1]||"",t>=2&&(i=e[t-2],s=e[t-2]),/(Tỉnh|Thành phố|Thành Phố|TP|T\.|Hà Nội|Hồ Chí Minh|Đà Nẵng|Cần Thơ|Hải Phòng|Quận|Huyện|Q\.|H\.|Phường|Xã|P\.|X\.)$/i.test(r)?t>=3?a=e.slice(0,t-2).join(", "):t===2?a=e[0]:a=n:a=n,{province:ii(r),district:ii(i),ward:ii(s),street:a})}function ii(n){return n?n.replace(/^(Tỉnh|Thành phố|Thành Phố|TP\.|TP|T\.|Quận|Huyện|Q\.|H\.|Xã|Phường|P\.|Thị xã|Thị trấn)\s+/i,"").trim():""}function lr(n,e){let t;return function(...i){const s=()=>{clearTimeout(t),n(...i)};clearTimeout(t),t=setTimeout(s,e)}}function Qa(n){return new Promise(e=>setTimeout(e,n))}let ge={byId:new Map,byName:new Map,byPlaceholder:new Map,byLabel:new Map,allInputs:[]},js=[];function Hd(){ge.byId.clear(),ge.byName.clear(),ge.byPlaceholder.clear(),ge.byLabel.clear(),ge.allInputs=[]}function pE(){zs=0}function jd(){return js=Array.from(document.querySelectorAll("label, .label, .label-text, span.title, .form-label")),js}let zs=0;const gE=3e3;function ur(n=!1){const e=Date.now();if(!n&&zs!==0&&e-zs<gE&&ge.allInputs.length>0)return;const t=performance.now();zs=e,Hd();const r=Array.from(document.querySelectorAll("input, textarea, select, ng-select2"));ge.allInputs=r,r.forEach(c=>{c.id&&ge.byId.set(c.id,c),c.name&&ge.byName.set(c.name,c);const l=c.getAttribute("placeholder");l&&ge.byPlaceholder.set(l.trim(),c);const u=c.getAttribute("formcontrolname");u&&ge.byName.set(u,c)});const i=jd();i.forEach(c=>{const l=c.innerText.trim();if(!l)return;let u=null;if(c.htmlFor&&(u=document.getElementById(c.htmlFor)),!u){let f=c.parentElement,p=0;for(;f&&p<2&&(u=f.querySelector("input, textarea, select"),!u);)f=f.parentElement,p++}u&&ge.byLabel.set(l,u)});const a=performance.now()-t;a>10&&console.debug(`[DOM] Build map in ${a.toFixed(2)}ms for ${r.length} inputs and ${i.length} labels.`)}function zd(n){if(!n)return;const e={bubbles:!0,cancelable:!0,composed:!0};if(n.dispatchEvent(new Event("focus",e)),n.dispatchEvent(new Event("input",e)),n.dispatchEvent(new Event("change",e)),n.tagName==="SELECT"){n.dispatchEvent(new CustomEvent("select2:select",{...e,detail:{data:{id:n.value}}}));let t=n.closest("ng-select2, .select2-container, .form-group");t&&(t.dispatchEvent(new Event("change",e)),t.dispatchEvent(new Event("input",e)));try{const r=window.jQuery||window.$;r&&typeof r(n).trigger=="function"&&(r(n).trigger("change"),r(n).trigger("select2:select"))}catch{}}n.dispatchEvent(new Event("blur",e))}function hr(n,e){var r;if(!n||e===void 0||e===null)return!1;let t=!1;if(n.tagName==="SELECT"||n.tagName==="NG-SELECT2"){const i=n.tagName==="NG-SELECT2"&&n.querySelector("select")||n,s=Array.from(i.options||[]),a=s.map(u=>u.text.trim());let c=e.toString().trim(),l=s.find(u=>u.value===c);if(!l&&c.includes(",")){const u=Wa(c),f=Xa(),p=n.closest("ng-select2")||n,w=(p.id||p.getAttribute("formcontrolname")||p.name||"").toLowerCase();f&&(p===f.tinh||n===f.tinh)?c=u.province:f&&(p===f.xaIdNew||n===f.xaIdNew)?c=u.ward||u.district:w.includes("tinh")?c=u.province:(w.includes("xa")||w.includes("huyen")||w.includes("quan"))&&(c=u.ward||u.district)}if(!l){let u=Ga(c,a,.75);if(!u){const f=ii(c),p=a.map(A=>ii(A)),w=Ga(f,p,.65);w&&(u=a[p.indexOf(w)])}u&&(l=s.find(f=>f.text.trim()===u))}if(l){const u=window.jQuery||window.$;u&&typeof u(i).val=="function"&&u(i).val(l.value).trigger("change").trigger("change.select2").trigger("select2:select"),i.value=l.value,t=!0}else if(e&&!e.toString().includes(",")){const u=window.jQuery||window.$;u&&typeof u(i).val=="function"&&u(i).val(e).trigger("change").trigger("change.select2"),i.value=e}return zd(i),t}else{const i=Xa(),s=(n.id||n.name||n.getAttribute("formcontrolname")||"").toLowerCase(),a=(n.getAttribute("placeholder")||"").toLowerCase(),c=i&&n===i.duong||s.includes("duong")||s.includes("diachichitiet")||a.includes("đường")||a.includes("số nhà");if(c&&typeof e=="string"&&e.includes(",")){const f=e;e=Wa(e).street,console.log(`[Sync] Phát hiện trường 'duong' (${s}), bóc tách địa chỉ: "${f}" -> "${e}"`)}else c?console.log(`[Sync] Trường 'duong' (${s}) nhận giá trị gốc (không có dấu phẩy): "${e}"`):console.debug(`[Sync] Trường thường (${s}) nhận giá trị: "${e}"`);const l=n.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,u=(r=Object.getOwnPropertyDescriptor(l,"value"))==null?void 0:r.set;console.debug(`[Sync] Ghi giá trị vào element {id: ${n.id}, name: ${n.name}}: "${e}"`),u?u.call(n,e):n.value=e,t=!0}return zd(n),t}async function mE(n,e=3e3){const t=Date.now();let r=n.tagName==="NG-SELECT2"&&n.querySelector("select")||n;if(r.tagName!=="SELECT"&&r.tagName!=="NG-SELECT2")return console.debug(`[waitForOptions] Phần tử không phải SELECT/NG-SELECT2 (${r.tagName}), bỏ qua bước chờ options.`),!0;for(;Date.now()-t<e;){if(!document.contains(r)&&n.tagName==="NG-SELECT2"&&(r=n.querySelector("select")||n),r.options&&r.options.length>1)return console.debug(`[waitForOptions] Đã tìm thấy ${r.options.length} options sau ${Date.now()-t}ms.`),!0;await Qa(200)}return console.warn(`[waitForOptions] Timeout ${e}ms. Element "${n.id||n.name}" (${r.tagName}) chỉ có ${r.options?r.options.length:0} options.`),!1}function et(n,e=null){if(!n&&!e)return null;ge.allInputs.length===0&&ur();const t=i=>i?["INPUT","TEXTAREA","SELECT"].includes(i.tagName)||i.getAttribute("contenteditable")==="true"?i:i.querySelector('input, textarea, select, [contenteditable="true"]'):null;if(n){let i=ge.byId.get(n)||ge.byName.get(n)||ge.byPlaceholder.get(n)||ge.byLabel.get(n);if(i&&document.contains(i))return t(i)}if(e){let i=ge.byLabel.get(e);if(i&&document.contains(i))return t(i)}if(n&&(n.includes("xaId")||n.includes("quanHuyenId")||n.includes("phuongXaId")||n.includes("xaIdNew"))){const i=Xa();if(i&&i.xaIdNew)return t(i.xaIdNew)}if(n){const i=document.getElementById(n);if(i){const l=t(i);if(l)return l}const s=`input[id="${n}"], textarea[id="${n}"], select[id="${n}"], input[name="${n}"], textarea[name="${n}"], [placeholder="${n}"], [formcontrolname="${n}"]`,a=document.querySelector(s);if(a)return a;const c=document.querySelector(`[id="${n}"], [name="${n}"]`);if(c){const l=t(c);if(l)return l}}const r=e||n;if(r&&r.length>2){const i=Array.from(ge.byLabel.keys());i.length===0&&js.length>0&&i.push(...js.map(a=>a.innerText.trim()).filter(a=>a.length>0));const s=Ga(r,i,.82);if(s)return t(ge.byLabel.get(s))}return null}function Kd(n){return et(null,n)}function si(n,e,t=null){const r=et(n,t);return r?(hr(r,e),!0):!1}function yE(n,e){const t=(n||(e==null?void 0:e.id)||(e==null?void 0:e.getAttribute("formcontrolname"))||"").toLowerCase();if(t.includes("tinh")||t.includes("province")||t.includes("city"))return 1;if(t.includes("xaIdNew")||t.includes("huyen")||t.includes("quan")||t.includes("district")||t.includes("xa")||t.includes("phuong")||t.includes("ward"))return 2;const r=e!=null&&e.id?document.querySelector(`label[for="${e.id}"]`):null,i=((r==null?void 0:r.innerText)||"").toLowerCase();return i.includes("tỉnh")||i.includes("thành phố")?1:i.includes("huyện")||i.includes("quận")||i.includes("xã")||i.includes("phường")?2:9}async function vE(n,e=5e3){const t=Date.now();for(;Date.now()-t<e;){ur(!0);const r=et(n);if(r&&document.contains(r))return r;await Qa(500)}return null}async function Ya(n,e){if(!n||!n.length)return;const r=n.map(l=>l.toLowerCase()).some(l=>l.includes("diachi")||l.includes("địa chỉ")),i=typeof e=="string"&&e.includes(",");r&&i&&["tinhIdNew","diaChiTruSoTinhIdNew","xaIdNew","diaChiTruSoXaIdNew","duong","diaChiTruSoDuong"].forEach(u=>{!n.includes(u)&&et(u)&&n.push(u)});const s=n.map(l=>{const u=et(l);return{name:l,el:u,rank:yE(l,u)}}),a=[...new Set(s.map(l=>l.rank))].sort((l,u)=>l-u);let c=!0;for(const l of a){if(l<=2&&!c){console.warn(`[Sync Sequential] Bỏ qua Rank ${l} do cấp trên thất bại.`);continue}const u=s.filter(p=>p.rank===l);let f=!1;console.debug(`[Sync Sequential] Đang xử lý nhóm Rank ${l} với ${u.length} fields.`);for(const p of u){let w=et(p.name)||p.el;if(!w&&l===2&&(console.debug(`[Sync Sequential] Đợi element Xã/Huyện (${p.name})...`),w=await vE(p.name,3500)),w){if(l>1&&l<=2){const T=w.tagName==="NG-SELECT2"&&w.querySelector("select")||w;if(T.tagName==="SELECT"||T.tagName==="NG-SELECT2"){const v=w.tagName==="NG-SELECT2"&&w.querySelector(".select2-selection, .select2-choice")||w;v.dispatchEvent(new MouseEvent("mousedown",{bubbles:!0})),v.dispatchEvent(new MouseEvent("mouseup",{bubbles:!0})),await mE(T,3e3),v.dispatchEvent(new KeyboardEvent("keydown",{bubbles:!0,key:"Escape",code:"Escape"}))}}p.name.toLowerCase().includes("duong")&&console.log(`[Sync Sequential] Đang nhập trường 'duong' (${p.name}) với giá trị: "${e}"`);const A=hr(w,e);A&&(f=!0),console.debug(`[Sync Sequential] Điền ${p.name}: ${A?"OK":"FAIL"}`)}}if(c=f,f&&l<9){const p=l===1?600:300;console.debug(`[Sync Sequential] Hoàn tất Rank ${l}, nghỉ ${p}ms chờ AJAX...`),await Qa(p),ur(!0)}}}function Xa(){try{const e=Array.from(document.querySelectorAll("label, .label, span.title")).find(w=>{const A=w.innerText.toLowerCase();return(A.includes("địa chỉ")||A.includes("địa chỉ trụ sở"))&&!A.includes("email")});let t=null;if(e&&(t=e.closest(".row.row-form")||e.closest(".row"),console.debug(`[Positioning] Tìm thấy hàng địa chỉ qua nhãn: "${e.innerText.trim()}"`)),t||(t=Array.from(document.querySelectorAll("form .row.row-form, .row.row-form"))[2]),!t)return null;const r=t.querySelectorAll(".col-12.col-sm-6, .col-sm-6");if(r.length<2)return null;const i=r[0],s=r[1],a=(w,A)=>w.querySelector(A),c=Array.from(s.querySelectorAll("select, ng-select2, input")),l=a(s,'[formcontrolname*="xaIdNew" i], [id*="xaIdNew" i], [formcontrolname*="huyen" i], [id*="huyenId" i], [formcontrolname*="xa" i]'),u=a(s,'[formcontrolname*="duong" i], [id*="duong" i]'),f=a(s,'[formcontrolname*="soNha" i], [id*="sonha" i]');let p=null;return!u&&c.length>0&&(p=f&&c[c.length-1]===f?c[c.length-2]:c[c.length-1]),console.debug("[Positioning] Kết quả xác định bộ địa chỉ:",{tinh:a(i,'[formcontrolname*="tinhIdNew" i], [id*="tinhId" i]')||i.querySelector("select, ng-select2"),xaIdNew:l||c[0],duong:u||p}),{tinh:a(i,'[formcontrolname*="tinhIdNew" i], [id*="tinhId" i]')||i.querySelector("select, ng-select2"),xaIdNew:l||c[0],duong:u||p}}catch(n){return console.error("[Positioning] Lỗi khi xác định bộ địa chỉ:",n),null}}function _E(n=new Date){return String(n.getDate()).padStart(2,"0")}function bE(n=new Date){return String(n.getMonth()+1).padStart(2,"0")}function wE(n=new Date){return String(n.getFullYear())}function Gd(){const n=new Date;return{ngay:_E(n),thang:bE(n),nam:wE(n)}}const{ngay:Wd,thang:Qd,nam:Yd}=Gd(),Me={"ngayKy, ngayKy1":{label:"Ngày ký",value:Wd,syncDir:"both"},"thangKy, thangKy1":{label:"Tháng ký",value:Qd,syncDir:"both"},"namKy, namKy1":{label:"Năm ký",value:Yd,syncDir:"both"},"ngayTiepNhan, ngayThangNamKy":{label:"Ngày ký (full)",value:`${Wd}/${Qd}/${Yd}`,syncDir:"both"},tenDoanhNghiepB:{label:"Tên doanh nghiệp B",value:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM",syncDir:"both"},diaChiB:{label:"Địa chỉ B",value:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội",syncDir:"both"},maSoThueB:{label:"Mã số thuế B",value:"0100686223",syncDir:"both"},stkB:{label:"Số tài khoản B",value:"1600114156",syncDir:"both"},diaChiStkB:{label:"Ngân hàng/Địa chỉ STK B",value:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)",syncDir:"both"},"tenB, nguoiDaiDienB, tenDaiDienB":{label:"Người đại diện B",value:"Phạm Khánh Chung",syncDir:"both"},"chucVuB, chucVuDaiDienB":{label:"Chức vụ B",value:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",syncDir:"both"},"giayUyQuyenSoB, soGiayUyQuyenB":{label:"Giấy ủy quyền số B",value:"2628/GUQ-VNPT-HNI-VP",syncDir:"both"},"giayUyQuyenNgayB, ngayGiayUyQuyenB":{label:"Giấy ủy quyền ngày B",value:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",syncDir:"both"},GiayUyQuyenB:{label:"Nội dung Giấy ủy quyền B (full)",value:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",syncDir:"both"},tenDoanhNghiepB1:{label:"Tên doanh nghiệp B (phụ)",value:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",syncDir:"both"},donViTiepNhan:{label:"Đơn vị tiếp nhận",value:"TTKD KHDN",syncDir:"both"},"tenTiepNhan, tenNguoiNhan":{label:"Người tiếp nhận",value:"Bùi Anh",syncDir:"both"},dienThoaiB:{label:"Điện thoại B",value:"02436686868",syncDir:"both"},diaChiTaiKhoanB:{label:"Địa chỉ tài khoản B",value:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 ",syncDir:"both"},noiKy:{label:"Nơi ký",value:"Hà Nội",syncDir:"both"},emailB:{label:"Email B",value:"",syncDir:"both"},dvtGoi:{label:"Đơn vị gói",value:"Gói",syncDir:"both"},"lienheHopDongB, lienheTuVanB, lienheHoaDonB, sucoCap1B, sucoCap2B, sucoCap3B, sucoCap4B":{label:"Liên hệ B (AM)",value:"AM Bùi Anh",syncDir:"both"}},Ja={soHopDong:"soHopDong, inputContractGroupName"},Ks={after:["cuocDV","tongCong","tongCongHD","congCA","giaTriHopDong","tongGIaTriHopDong","thanhTienGoi"],before:["donGiaCA","thanhTienCA","tongThanhTien","tongCuocTruocThue","congGoi"],tax:["tongThueGTGT","tongThue","thueCA","thueVAT","thueGTGTgoi"],text:["soTienThanhToanBangChu","tongCongBangChu","tongCongHDbangChu","ghiChuGiaTriHopDong","tongGiaTriHopDongBangChu","ghiChuGiaTriHopDongBangChu"]},Xd=.08,Gs={SCAN:{key:"s",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Quét dữ liệu"},FILL:{key:"f",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Điền Web"},SCAN_PDF:{key:"p",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Scan PDF (AI)"},TOGGLE:{key:"`",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Đóng/Mở Widget"},CLEAN:{key:"d",altKey:!0,ctrlKey:!1,shiftKey:!1,label:"Dọn dẹp & Reset"}},Jd=Object.freeze(Object.defineProperty({__proto__:null,DEFAULT_CALC_MAP:Ks,DEFAULT_DATA:Me,DEFAULT_HOTKEYS:Gs,DEFAULT_SYNC_DATA:Ja,DEFAULT_TAX_RATE:Xd},Symbol.toStringTag,{value:"Module"}));let In=!1;function EE(){let n=O.get(dt),e=JSON.parse(JSON.stringify(Me));return n?(["ngayKy, ngayKy1","thangKy, thangKy1","namKy, namKy1","ngayTiepNhan, ngayThangNamKy"].forEach(r=>{n[r]&&e[r]&&(n[r].value=e[r].value)}),n):e}async function Zd(){if(!In){In=!0;try{const n=EE(),e=O.get(rn)??{},t={...n,...e},r=Object.keys(t);for(const i of r){const s=t[i],a=s&&typeof s=="object"&&s.hasOwnProperty("value")?s.value:s,c=i.split(",").map(u=>u.trim()).filter(u=>u),l=s&&typeof s=="object"?s.label:null;l&&!c.includes(l)&&c.push(l),await Ya(c,a)}F("✅ Auto fill complete")}finally{setTimeout(()=>{In=!1},500)}}}function TE(){if(!In){In=!0;try{let n=O.get(At)??{};const e={...Ja,...n},t=Object.keys(e);if(t.length===0){F("⚠️ No sync mapping","#ffc107");return}t.forEach(r=>{let i=et(r)||Kd(r);i&&i.value!==void 0&&i.value!==""&&e[r].split(",").map(a=>a.trim()).filter(a=>a).forEach(a=>si(a,i.value))}),F("✅ Sync form complete","#d39e00")}finally{setTimeout(()=>{In=!1},500)}}}let Za=!1;const ef=new Map,IE=(n,e)=>{var l;if(Za)return;let t=O.get(At)??{};const r={...Ja,...t};if(Object.keys(r).length===0)return;let i=n.id,s=n.name,a=null;if(i){const u=document.querySelector(`label[for="${i}"]`);u&&(a=u.textContent.trim())}if(!a){const u=n.closest("label");u&&(a=(l=Array.from(u.childNodes).find(f=>f.nodeType===3))==null?void 0:l.textContent.trim())}let c=r[i]||r[s]||r[a];if(c){Za=!0;try{c.split(",").map(f=>f.trim()).filter(f=>f).forEach(f=>{if(f!==i&&f!==s&&f!==a){let p=ef.get(f);(!p||!document.contains(p))&&(p=et(f)||Kd(f),p&&ef.set(f,p)),p&&document.activeElement!==p&&hr(p,e)}})}finally{Za=!1}}},xE=lr((n,e)=>{IE(n,e)},250);function AE(){const n=e=>{if(In)return;const t=e.target.closest("input, textarea, select, ng-select2");if(!t||t.closest("#vnpt-docx-widget")||t.closest("#vnpt-inline-calc"))return;let r=t.value;if(t.tagName==="NG-SELECT2"||t.classList.contains("select2-hidden-accessible")){const i=t.parentElement?t.parentElement.querySelector(".select2-selection__rendered"):null;i&&i.getAttribute("title")?r=i.getAttribute("title"):i&&i.textContent&&(r=i.textContent.trim())}xE(t,r)};document.addEventListener("input",n),document.addEventListener("change",n)}const SE={async lookupMST(n){if(!n||n.length<10)return null;const e=`https://api.vietqr.io/v2/business/${n}`;try{const r=await(await fetch(e)).json();if(r.code==="00"&&r.data){const{name:i,address:s,representative:a,status:c}=r.data;return{name:i||"",address:s||"",representative:a||"",status:c||""}}return null}catch(t){return console.error("[MST Service] Error fetching MST:",t),null}}};function tf(n){if(!n)return n;const e={};return Object.keys(n).forEach(t=>{const r=n[t];t.split(",").map(s=>s.trim()).filter(s=>s).forEach(s=>{e[s]=r})}),e}function nf(n=""){const e={version:"1.0",timestamp:new Date().toISOString(),backup:{fields:O.get(We),defaultFields:O.get(Ve),dataDefault:tf(O.get(dt)),dataCustom:tf(O.get(rn)),dataSync:O.get(At),taxRate:O.get(Nn),calcMap:O.get(St),templates:O.get(br)}},t=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),r=URL.createObjectURL(t),i=document.createElement("a");i.href=r;let s=n;s?s.toLowerCase().endsWith(".json")||(s+=".json"):s=`vnpt_full_backup_${new Date().toLocaleDateString().replace(/\//g,"-")}.json`,i.download=s,i.click(),URL.revokeObjectURL(r),F(`✅ Đã xuất file: ${s}`)}async function rf(n){return new Promise(e=>{const t=new FileReader;t.onload=r=>{try{const i=JSON.parse(r.target.result);if(!i.backup)throw new Error("File không đúng định dạng backup.");const s=i.backup;s.fields&&O.set(We,s.fields),s.defaultFields&&O.set(Ve,s.defaultFields),s.dataDefault&&O.set(dt,s.dataDefault),s.dataCustom&&O.set(rn,s.dataCustom),s.dataSync&&O.set(At,s.dataSync),s.taxRate&&O.set(Nn,s.taxRate),s.calcMap&&O.set(St,s.calcMap),s.templates&&O.set(br,s.templates),F("✅ Đã nhập dữ liệu thành công! Vui lòng tải lại trang hoặc widget.","#1e8e3e"),e(!0)}catch{F("❌ Lỗi: File sao lưu không hợp lệ.","#ff5252"),e(!1)}},t.readAsText(n)})}function oi(n=""){let e=O.get(Pn);Array.isArray(e)||(e=[]);const t={id:Date.now().toString(),name:n||`Bản sao lưu ${new Date().toLocaleString()}`,timestamp:new Date().toISOString(),data:{fields:O.get(We),defaultFields:O.get(Ve)}};e.unshift(t);const r=e.slice(0,10);O.set(Pn,r),console.log(`✅ Field backup created: ${t.name}`)}function sf(){var r,i;const n=O.get(We)||{},e=((r=n.tenDaiDienn)==null?void 0:r.value)||"",t=((i=n.soHopDong)==null?void 0:i.value)||"";return!e&&!t?`Quét dữ liệu - ${new Date().toLocaleTimeString()}`:`${e} - ${t}`}function Ws(){const n=O.get(Pn);return n&&!Array.isArray(n)?(O.remove(Pn),[]):Array.isArray(n)?n:[]}function of(n){const t=Ws().find(i=>i.id===n);if(!t||!t.data)return F("⚠️ Không tìm thấy bản sao lưu hợp lệ!","#ffc107"),!1;const r=t.data;return r.fields&&O.set(We,r.fields),r.defaultFields&&O.set(Ve,r.defaultFields),F(`✅ Đã khôi phục các trường: ${t.name}`,"#1e8e3e"),!0}function CE(n){let e=Ws();const t=e.length;return e=e.filter(r=>r.id!==n),e.length!==t?(O.set(Pn,e),!0):!1}let Qs=null;function af(n,e){Qs&&Qs();const t=D.widget,r=n.querySelector(".btn-field-link"),i=[];let s=null;const a=N=>N?document.getElementById(N)||document.querySelector(`[formcontrolname="${CSS.escape(N)}"]`)||document.querySelector(`[name="${CSS.escape(N)}"]`)||document.querySelector(`[placeholder="${CSS.escape(N)}"]`):null,c=()=>{e.value.split(",").map(M=>M.trim()).filter(M=>M).forEach(M=>{const B=a(M);B&&!t.contains(B)&&!i.includes(B)&&(B.classList.add("vnpt-link-existing"),i.push(B))})},l=()=>{i.forEach(N=>{N.classList.remove("vnpt-link-existing"),N.classList.remove("vnpt-unlink-hover")}),i.length=0},u=()=>{const N=e.value.split(",").map(M=>M.trim()).filter(M=>M);return Math.max(0,N.length-1)},f=document.createElement("div");f.className="vnpt-linking-banner",f.style.pointerEvents="auto";const p=()=>{const N=u(),M=N>0?`<span class="vnpt-link-count-badge">${N} link</span>`:"";f.innerHTML=`
            🔗 <b>Liên kết đa điểm</b> ${M}
            &nbsp;·&nbsp; <span style="font-size:10px;opacity:0.85;">🔵 Click = link &nbsp; 🔴 Click lại = bỏ link</span>
            &nbsp;·&nbsp; <button class="vnpt-link-done-btn">✅ Xong</button>
            &nbsp; <kbd>Esc</kbd>
        `,f.querySelector(".vnpt-link-done-btn").onclick=B=>{B.stopPropagation(),k(!0)}};r.classList.add("active"),document.body.classList.add("vnpt-linking-mode"),t.style.opacity="0.15",t.style.pointerEvents="none",t.style.transition="opacity 0.3s",p(),document.body.appendChild(f),c();const w=N=>{const M=N.id||N.getAttribute("formcontrolname")||N.name||N.getAttribute("placeholder");if(M)return M;if((N.tagName==="LABEL"||N.classList.contains("label")||N.classList.contains("form-label"))&&N.innerText.trim())return N.innerText.trim();let j=N.parentElement,_=0;for(;j&&_<3;){const y=j.querySelector("label, .label, .label-text, span.title, .form-label");if(y&&y.innerText.trim())return y.innerText.trim();if(j.id&&!j.id.startsWith("ng-"))return j.id;j=j.parentElement,_++}const m=N.className&&typeof N.className=="string"?N.className.trim().split(/\s+/)[0]:"";return N.tagName.toLowerCase()+(m?"."+m:"")},A=new Set(["INPUT","TEXTAREA","SELECT","SPAN","DIV","P","LABEL","BUTTON","TD","TH","SECTION"]),T=N=>{const M=N.target;t.contains(M)||f.contains(M)||A.has(M.tagName)&&(s&&s!==M&&(s.classList.remove("vnpt-link-highlight"),s.classList.remove("vnpt-unlink-hover")),M.classList.contains("vnpt-link-existing")?M.classList.add("vnpt-unlink-hover"):M.classList.add("vnpt-link-highlight"),s=M)},v=N=>{const M=N.target;if(t.contains(M)||f.contains(M))return;N.preventDefault(),N.stopPropagation();const B=w(M),j=e.value.split(",").map(_=>_.trim()).filter(_=>_);if(j.includes(B)){const _=j.filter(y=>y!==B);e.value=_.join(", "),M.classList.remove("vnpt-link-existing"),M.classList.remove("vnpt-unlink-hover"),M.classList.add("vnpt-link-highlight");const m=i.indexOf(M);m!==-1&&i.splice(m,1),e.dispatchEvent(new Event("input",{bubbles:!0})),p(),F(`🔓 Đã bỏ "${B}"`,"#ea4335")}else e.value=[...j,B].join(", "),M.classList.remove("vnpt-link-highlight"),M.classList.add("vnpt-link-existing"),i.includes(M)||i.push(M),s===M&&(s=null),e.dispatchEvent(new Event("input",{bubbles:!0})),p(),F(`+🔗 "${B}" — Click lại để bỏ | ✅ Xong`,"#198754")},x=N=>{N.key==="Escape"&&(F("❌ Đã kết thúc liên kết","#ffc107"),k(!0))},k=(N=!0)=>{s&&(s.classList.remove("vnpt-link-highlight"),s.classList.remove("vnpt-unlink-hover")),l(),r.classList.remove("active"),document.body.classList.remove("vnpt-linking-mode"),t.style.opacity="",t.style.pointerEvents="",f.parentNode&&f.parentNode.removeChild(f),N&&e.dispatchEvent(new Event("change",{bubbles:!0})),document.removeEventListener("mouseover",T,!0),document.removeEventListener("click",v,!0),document.removeEventListener("keydown",x,!0),Qs=null};document.addEventListener("mouseover",T,!0),document.addEventListener("click",v,!0),document.addEventListener("keydown",x,!0),Qs=k;const P=u();F(P>0?`🔗 Đang có ${P} link — Click thêm hoặc ✅ Xong`:"🔗 Click vào elements để liên kết. ✅ Xong hoặc Esc khi hoàn tất.","#f57f17")}function kE(n,e,t){let r=!0,i=null;return n==="soDkdn"?i=Er.MST:n==="sdt"?i=Er.PHONE:n==="emailDaiDien"?i=Er.EMAIL:(n==="cmnd"||n==="cccd")&&(i=Er.ID_CARD),i&&e.trim()!==""&&(r=i.test(e.trim())),r?t.classList.remove("field-error"):(t.classList.add("field-error"),t.classList.add("vnpt-shake"),setTimeout(()=>t.classList.remove("vnpt-shake"),400)),r}function cf(n){const e=n.querySelector(".f-key"),t=n.querySelector(".f-val");if(!e||!t)return;const r=e.value.split(",")[0].trim(),i=t.value.trim();vr.includes(r)?i?t.classList.remove("field-required-empty"):t.classList.add("field-required-empty"):t.classList.remove("field-required-empty"),kE(r,t.value,t)}function ai(n,e){const t={both:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 8 4 4-4 4"></path><path d="M2 12h20"></path><path d="m6 16-4-4 4-4"></path></svg>',down:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg>',up:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"></path><path d="M12 19V5"></path></svg>'};n.innerHTML=t[e]||t.both,n.setAttribute("data-dir",e),e==="both"?n.title="Đồng bộ 2 chiều (Mọi thay đổi đều được cập nhật giữa Bảng và Trang web)":e==="down"?n.title="Chỉ đồng bộ XUỐNG: Bảng dữ liệu ➔ Form Trang web":e==="up"&&(n.title="Chỉ đồng bộ LÊN: Form Trang web ➔ Bảng dữ liệu")}function ue(n,e,t=null,r="",i=null,s=!1,a=null){const c=D.fieldsContainer.querySelector(".text-hint");c&&c.remove();const l=D.fieldsContainer.querySelectorAll(".f-key");let u=!1;const f=n.split(",")[0].trim();for(let p of l)if(p.value.split(",")[0].trim()===f){const A=p.closest(".vnpt-field-row"),T=A.querySelector(".f-val"),v=A.querySelector(".f-label"),x=A.querySelector(".btn-sync-dir"),k=x?x.getAttribute("data-dir"):"both";e!==null&&T.value!==e&&document.activeElement!==T&&(s&&k==="down"||(T.value=e)),t!==null&&t!==""&&v.value!==t&&document.activeElement!==v&&(v.value=t),r!==""&&p.value!==n+", "+r&&document.activeElement!==p&&(p.value=n+", "+r),i&&x&&x.getAttribute("data-dir")!==i&&ai(x,i),a&&T&&(T.dataset.sourceAddress=a),cf(A),u=!0;break}if(!u){(t===null||t==="")&&(t=ve[n]||"");const p=document.createElement("div");p.className="vnpt-field-row row-item",p.setAttribute("draggable","false");let w=n;r&&(w+=", "+r);const A=f;p.innerHTML=`
            <input type="checkbox" id="chk-${A}" name="chk-${A}" class="row-chk" title="Chọn" style="margin: 0 2px 0 2px;" />
            <input type="text" id="lbl-${A}" name="lbl-${A}" class="f-label" value="${t}" />
            <input type="text" id="key-${A}" name="key-${A}" class="f-key" value="${w}" title="Biến DOCX và IDs đồng bộ" />
            <button tabindex="-1" class="btn-sync-dir" title="Đồng bộ 2 chiều (bảng ↔ form)" data-dir="${i||"both"}">↔</button>
            <button class="btn-field-link" title="🔗 Click để liên kết với element trên trang (Esc để hủy)">🔗</button>
            ${A==="soDkdn"?`
                <div class="mst-lookup-wrapper">
                    <input type="text" id="val-${A}" name="val-${A}" class="f-val" value="${e}" placeholder="Mã số thuế..." />
                    <button class="btn-mst-lookup" title="Tra cứu Mã số thuế">
                        <span class="icon">🔍</span>
                        <div class="spinner"></div>
                    </button>
                </div>
            `:`
                <input type="text" id="val-${A}" name="val-${A}" class="f-val" value="${e}" />
            `}
        `;const T=p.querySelector(".f-val"),v=p.querySelector(".f-key");a&&T&&(T.dataset.sourceAddress=a),n==="tenToChuc"&&(T.style.textAlign="right");const x=async()=>{const B=p.querySelector(".btn-sync-dir");if((B?B.getAttribute("data-dir"):"both")==="up")return;const _=T.value,m=v.value.split(",").map(y=>y.trim()).filter(y=>y);await Ya(m,_)},k=lr(x,250);if(v.addEventListener("input",function(){Ce();const B=this.value.split(",")[0].trim();T.style.textAlign=B==="tenToChuc"?"right":""}),v.addEventListener("change",function(){x()}),p.querySelector(".f-label").addEventListener("input",Ce),T.addEventListener("input",function(){Ce(),cf(p),k()}),T.addEventListener("change",function(){if(A.toLowerCase().includes("ngay")){const B=$d(this.value);B!==this.value&&(this.value=B,Ce())}A==="duong"&&this.dataset.sourceAddress&&uE.saveLearning(this.dataset.sourceAddress,this.value),x()}),A==="soDkdn"){const B=p.querySelector(".btn-mst-lookup");B.onclick=async()=>{const j=T.value.trim();if(!j){F("⚠️ Vui lòng nhập mã số thuế","#ffc107");return}B.classList.add("loading");try{const _=await SE.lookupMST(j);if(_){T.value=j,ue("tenToChuc",_.name),ue("diaChi",_.address);const m=Wa(_.address);ue("tinhIdNew",m.province),ue("xaIdNew",m.ward||m.district),ue("duong",m.street,null,"",null,!1,_.address),Ce(),setTimeout(()=>lf(["soDkdn","tenToChuc","diaChi","xaIdNew","xaHuyen","duong"]),300),F(`✅ Đã tìm thấy: ${_.name}`,"#1a73e8")}else F("❌ Không tìm thấy thông tin MST này","#ea4335")}catch{F("❌ Lỗi khi tra cứu MST","#ea4335")}finally{B.classList.remove("loading")}}}const P=i||"both",N=p.querySelector(".btn-sync-dir");N&&(ai(N,P),N.addEventListener("click",B=>{B.preventDefault();let j=N.getAttribute("data-dir");j==="both"?j="down":j==="down"?j="up":j="both",ai(N,j),Ce()}));const M=p.querySelector(".btn-field-link");M&&M.addEventListener("click",B=>{B.stopPropagation(),af(p,v)}),D.fieldsContainer.appendChild(p),D.fieldsContainer.scrollTop=D.fieldsContainer.scrollHeight}}function Ce(){const n=D.isDefaultMode?Ve:We,e={};D.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(r=>{const s=r.querySelector(".f-key").value.trim().split(",").map(w=>w.trim()).filter(w=>w),a=s[0],c=s.slice(1).join(", "),l=r.querySelector(".f-label").value.trim(),u=r.querySelector(".f-val").value,f=r.querySelector(".btn-sync-dir"),p=f?f.getAttribute("data-dir"):"both";a&&(e[a]={label:l,value:u,sync:c,syncDir:p})}),O.setDebounced(n,e,1e3),D.isDefaultMode&&Promise.resolve().then(()=>On).then(({SK_DATA_DEF:r})=>{O.setDebounced(r,e,1e3)})}function ec(){var s,a,c;const n=O.get(D.isDefaultMode?Ve:We)||{},e=((s=n.tenToChuc)==null?void 0:s.value)||"",t=((a=n.tenDaiDienn)==null?void 0:a.value)||"",r=((c=n.soHopDong)==null?void 0:c.value)||"";if(!e&&!t&&!r)return`Bản sao lưu ${new Date().toLocaleString()}`;let i=e||t;return r&&(i+=` - ${r}`),i}function ci(){try{D.fieldsContainer.innerHTML="";const e=O.get(We)||{};Object.keys(ve).forEach(t=>{const r=ve[t],i=e[t];i&&typeof i=="object"?ue(t,i.value,i.label||r,i.sync||"",i.syncDir||"both"):i?ue(t,i,r,"","both"):ue(t,"",r,"","both")}),Object.keys(e).forEach(t=>{if(!(t in ve)){const r=e[t];typeof r=="object"?ue(t,r.value,r.label,r.sync||"",r.syncDir||"both"):ue(t,r,"","","both")}}),Object.keys(ve).length===0&&Object.keys(e).length===0&&(D.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(e){console.error("Error loading config:",e),Object.keys(ve).forEach(t=>ue(t,"",ve[t]))}const n=O.get(ki);n&&D.widget&&(D.widget.style.bottom="auto",n.right?(D.widget.style.right=n.right,D.widget.style.left="auto"):n.left&&(D.widget.style.left=n.left,D.widget.style.right="auto"),n.top&&(D.widget.style.top=n.top))}function RE(){document.getElementById("vnpt-btn-toggle-id").onclick=()=>D.fieldsContainer.classList.toggle("show-ids");const n=document.getElementById("vnpt-btn-clean-data");n&&(n.onclick=()=>{const i=D.isDefaultMode;confirm(i?`BẠN ĐANG Ở CHẾ ĐỘ MẶC ĐỊNH.
Khôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?`:"Dữ liệu hiện tại sẽ được Xóa. Bạn có muốn SAO LƯU nhanh trước khi làm sạch không?")&&(i?(O.remove(Ve),F("🔄 Đã reset dữ liệu hệ thống VNPT","#1a73e8")):(oi(ec()),O.remove(We),F("🧹 Đã làm sạch & lưu bản cũ vào History","#1a73e8")),O.remove(St),O.remove(Nn),i?uf(!0):ci())});const e=document.getElementById("vnpt-btn-restore-last"),t=document.getElementById("vnpt-backup-history");e&&t?(e.title="Click để xem lịch sử sao lưu (Tối đa 10 bản)",e.onclick=i=>{i.preventDefault(),i.stopPropagation(),t.classList.toggle("show")&&r(t)},e.oncontextmenu=i=>{i.preventDefault(),i.stopPropagation();const s=Ws();if(s.length>0){const a=s[0];confirm(`Khôi phục nhanh bản gần nhất?
"${a.name}"`)&&of(a.id)&&(D.isDefaultMode?D.isDefaultMode=!1:ci(),t.classList.remove("show"))}else F("⚠️ Chưa có bản sao lưu nào","#ffc107")},document.addEventListener("click",i=>{t.classList.contains("show")&&!t.contains(i.target)&&!e.contains(i.target)&&t.classList.remove("show")})):xt.error("❌ Fix UI: Could not find Restore button (#vnpt-btn-restore-last) or History container (#vnpt-backup-history).");function r(i){const s=Ws();if(i.innerHTML='<div class="backup-history-header">📋 Local History (Max 10)</div>',s.length===0){i.innerHTML+='<div class="backup-history-empty">Chưa có lịch sử. Dữ liệu sẽ tự lưu khi bạn Quét hoặc Dọn dẹp!</div>';return}s.forEach(a=>{const c=document.createElement("div");c.className="backup-history-item";const l=new Date(a.id*1).toLocaleString([],{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"});c.innerHTML=`
                <div class="backup-info">
                    <div class="backup-history-name" title="${a.name}">${a.name}</div>
                    <div class="backup-history-time">${l}</div>
                </div>
                <div class="backup-actions">
                    <button class="btn-restore-action" title="Khôi phục">⏪</button>
                    <button class="btn-delete-action" title="Xóa bản này">🗑️</button>
                </div>
            `,c.querySelector(".btn-restore-action").onclick=u=>{u.stopPropagation(),confirm(`Khôi phục dữ liệu từ bản: 
${a.name}?`)&&of(a.id)&&(i.classList.remove("show"),D.isDefaultMode?D.isDefaultMode=!1:ci())},c.querySelector(".btn-delete-action").onclick=u=>{u.stopPropagation(),confirm(`Xoá vĩnh viễn bản sao lưu:
${a.name}?`)&&(CE(a.id),r(i),F("🗑️ Đã xoá bản sao lưu","#ff5252"))},i.appendChild(c)})}document.getElementById("vnpt-btn-default").onclick=()=>{D.isDefaultMode=!D.isDefaultMode},D.on("isDefaultMode",i=>uf(i)),document.getElementById("vnpt-btn-batch-del").onclick=i=>{var l;const s=D.fieldsContainer.querySelectorAll(".vnpt-field-row"),a=i.shiftKey;let c=0;if(s.forEach(u=>{var f;if((f=u.querySelector(".row-chk"))!=null&&f.checked){if(a)u.remove();else{const p=u.querySelector(".f-val");p&&(p.value="")}c++}}),c===0){const f=((l=(O.get(D.isDefaultMode?Ve:We)||{}).tenToChuc)==null?void 0:l.value)||"Dữ liệu hiện tại",p=f.length>25?f.substring(0,25)+"...":f;a?confirm(`Xóa TOÀN BỘ hàng dữ liệu của:
"${f}"?

(Hệ thống sẽ tự động lưu một bản vào History).`)&&(oi(ec()),s.forEach(w=>w.remove()),F(`🗑️ Đã xóa nội dung: ${p}`,"#ff5252"),Ce()):confirm(`Dọn dẹp TOÀN BỘ giá trị bảng của:
"${f}"?

(Hệ thống sẽ tự động lưu vào History).`)&&(oi(ec()),s.forEach(w=>{const A=w.querySelector(".f-val");A&&(A.value="")}),F(`🧹 Đã dọn dẹp: ${p}`,"#1a73e8"),Ce())}else F(`${a?"🗑️":"🧹"} Đã ${a?"Xóa":"Dọn giá trị"} ${c} trường`,a?"#ff5252":"#1a73e8"),Ce()},document.getElementById("vnpt-btn-add").onclick=()=>{const i=D.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;ue("bien_moi_"+i,"","",""),Ce()},document.getElementById("vnpt-btn-fill-back").onclick=()=>{lf()}}async function lf(n=null){n||Zd();let e=0;const t=D.fieldsContainer.querySelectorAll(".vnpt-field-row");for(const r of t){const i=r.querySelector(".btn-sync-dir");if((i?i.getAttribute("data-dir"):"both")==="up")continue;const a=r.querySelector(".f-key").value.trim(),c=a.split(",")[0].trim();if(n&&!n.includes(c))continue;const l=r.querySelector(".f-val").value;if(l==="")continue;const u=r.querySelector(".f-label").value.trim(),f=a.split(",").map(p=>p.trim()).filter(Boolean);u&&!f.includes(u)&&f.push(u),await Ya(f,l),f.length>0&&e++}n||(e>0?F(`✅ Đã đồng bộ ${e} hàng dữ liệu`,"#198754"):F("⚠️ Không có trường nào để đồng bộ","#ffc107"))}function uf(n){const e=document.getElementById("vnpt-btn-default");if(D.fieldsContainer.innerHTML="",D.bannerArea.innerHTML="",n){e.classList.add("active"),e.innerHTML="✅ Chế độ: Dữ liệu mặc định",document.getElementById("vnpt-fields-container").classList.add("vnpt-mode-default"),F("📌 Chế độ Dữ liệu mặc định (Có thể sửa)","#ea4335");const t=document.createElement("div");t.className="vnpt-default-banner",t.innerHTML='<span style="color: red;"> LƯU Ý: ĐÂY LÀ DỮ LIỆU MẶC ĐỊNH</span>',D.bannerArea.appendChild(t);const r=O.get(Ve);r===null?Object.keys(Me).forEach(i=>{const s=Me[i],a=s&&typeof s=="object"?s.value:s,c=s&&typeof s=="object"?s.label:ve[i]||"",l=s&&typeof s=="object"&&s.sync?s.sync:"",u=s&&typeof s=="object"&&s.syncDir?s.syncDir:"down";ue(i,a,c,l,u)}):Object.keys(r).forEach(i=>{const s=r[i];ue(i,s.value,s.label,s.sync||"",s.syncDir||"both")}),PE()}else e.classList.remove("active"),e.innerHTML="🛠 Dữ liệu mặc định VNPT",document.getElementById("vnpt-fields-container").classList.remove("vnpt-mode-default"),F("📋 Đã quay lại Dữ liệu cá nhân"),ci()}function PE(){const n=document.createElement("div");n.className="vnpt-calc-mapping-default-section",n.style.cssText="border: 1px dashed var(--vnpt-primary); border-radius: 8px; padding: 8px; margin: 8px 0; background: rgba(26, 115, 232, 0.05);",n.innerHTML=`
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
    `;const e=n.querySelector(".vnpt-calc-mapping-header"),t=n.querySelector(".vnpt-calc-mapping-body"),r=n.querySelector(".toggle-icon");e.onclick=()=>{const s=t.style.display==="none";t.style.display=s?"block":"none",r.innerText=s?"▼":"▶"};const i=O.get(St)||{...Ks};n.querySelectorAll(".vnpt-field-row").forEach(s=>{const a=s.querySelector("input[data-clink]"),c=s.querySelector(".btn-sync-dir"),l=s.querySelector(".btn-field-link"),u=a.dataset.clink,f=i[u]||[],p=Array.isArray(f),w=p?f:f.sync||[],A=p?"both":f.syncDir||"both";a.value=w.join(", "),c&&(ai(c,A),c.onclick=v=>{v.preventDefault();let x=c.getAttribute("data-dir");x==="both"?x="down":x==="down"?x="up":x="both",ai(c,x),T()});const T=()=>{const v=O.get(St)||{...Ks},x=a.value.split(",").map(P=>P.trim()).filter(Boolean),k=c?c.getAttribute("data-dir"):"both";v[u]={sync:x,syncDir:k},O.set(St,v),F("✅ Đã cập nhật Mapping Calc hệ thống")};a.onchange=T,l.onclick=v=>{v.stopPropagation(),af(s,a)}}),D.bannerArea.appendChild(n)}let tc=!1,dr=null,li=null;function NE(){window.addEventListener("keydown",n=>{if(tc&&li){OE(n);return}const e=O.get(wr,Gs);for(const[t,r]of Object.entries(e))if(DE(n,r)){n.preventDefault(),LE(t);return}})}function DE(n,e){if(!e||!e.key)return!1;const t=n.key.toLowerCase()===e.key.toLowerCase(),r=!!n.altKey==!!e.altKey,i=!!n.ctrlKey==!!e.ctrlKey,s=!!n.shiftKey==!!e.shiftKey;return t&&r&&i&&s}function LE(n){var e,t,r,i,s,a,c;switch(n){case"SCAN":(e=document.getElementById("vnpt-btn-scan"))==null||e.click();break;case"FILL":(t=document.getElementById("vnpt-btn-fill-back"))==null||t.click();break;case"SCAN_PDF":(r=document.getElementById("vnpt-btn-scan-pdf"))==null||r.click();break;case"EXPORT_DOCX":(i=document.getElementById("vnpt-btn-export"))==null||i.click();break;case"COPY_TXT":(s=document.getElementById("vnpt-btn-export-txt"))==null||s.click();break;case"TOGGLE":(a=document.getElementById("vnpt-toggle-btn"))==null||a.click();break;case"CLEAN":(c=document.getElementById("vnpt-btn-clean-data"))==null||c.click();break}}function VE(n,e){tc=!0,dr=n,li=e,F("Vui lòng nhấn tổ hợp phím mong muốn...","info")}function OE(n){var i;if(["Alt","Control","Shift","Meta"].includes(n.key))return;n.preventDefault(),n.stopPropagation();const e={key:n.key.toLowerCase(),altKey:n.altKey,ctrlKey:n.ctrlKey,shiftKey:n.shiftKey},t=O.get(wr,Gs);t[dr]={...t[dr],...e},O.set(wr,t);const r=((i=t[dr])==null?void 0:i.label)||dr;F(`Đã lưu phím tắt cho ${r}: ${nc(e)}`,"success"),li&&li(e),tc=!1,dr=null,li=null}function nc(n){if(!n||!n.key)return"Chưa gán";const e=[];n.ctrlKey&&e.push("Ctrl"),n.altKey&&e.push("Alt"),n.shiftKey&&e.push("Shift");let t=n.key.toUpperCase();return t===" "&&(t="Space"),e.push(t),e.join(" + ")}async function hf({apiKey:n,model:e,systemInstruction:t,userText:r,fileData:i,filesData:s}){return new Promise((a,c)=>{if(!n)return c("Vui lòng nhập API Key Gemini trong Cài đặt.");const l=`https://generativelanguage.googleapis.com/v1beta/models/${e}:generateContent?key=${n}`,u={system_instruction:{parts:[{text:t}]},contents:[{parts:[{text:r}]}],generation_config:{response_mime_type:"application/json"}};i&&i.base64&&u.contents[0].parts.push({inline_data:{mime_type:i.mimeType,data:i.base64}}),s&&Array.isArray(s)&&s.forEach(p=>{p.base64&&u.contents[0].parts.push({inline_data:{mime_type:p.mimeType,data:p.base64}})});const f=p=>{if(p)try{let w=p.replace(/```json/g,"").replace(/```/g,"").trim();a(JSON.parse(w))}catch(w){console.error("Lỗi parse JSON từ Gemini",w,p),c("AI trả về kết quả không đúng cấu hình JSON.")}else c("AI không trả về kết quả hợp lệ.")};typeof GM_xmlhttpRequest<"u"?GM_xmlhttpRequest({method:"POST",url:l,headers:{"Content-Type":"application/json"},data:JSON.stringify(u),timeout:3e4,onload:p=>{var w,A,T,v,x;if(p.status>=200&&p.status<300)try{const k=JSON.parse(p.responseText),P=(x=(v=(T=(A=(w=k==null?void 0:k.candidates)==null?void 0:w[0])==null?void 0:A.content)==null?void 0:T.parts)==null?void 0:v[0])==null?void 0:x.text;f(P)}catch{c("Lỗi Parse kết quả từ Gemini API.")}else c(`API Gemini lỗi (${p.status}): ${p.responseText}`)},ontimeout:()=>c("Quá hạn thời gian gọi API (30s)"),onerror:p=>c("Lỗi kết nối đến Google Gemini API.")}):fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(u)}).then(p=>p.json()).then(p=>{var A,T,v,x,k;if(p.error)return c(p.error.message);const w=(k=(x=(v=(T=(A=p==null?void 0:p.candidates)==null?void 0:A[0])==null?void 0:T.content)==null?void 0:v.parts)==null?void 0:x[0])==null?void 0:k.text;f(w)}).catch(p=>c(p.message))})}async function ME(n,e){if(!n)throw new Error("Vui lòng nhập API Key.");const t={contents:[{parts:[{text:"Ping"}]}],generation_config:{max_output_tokens:5,response_mime_type:"text/plain"}},r=`https://generativelanguage.googleapis.com/v1beta/models/${e}:generateContent?key=${n}`;return new Promise((i,s)=>{const a=c=>{var l;try{return((l=JSON.parse(c).error)==null?void 0:l.message)||c}catch{return c}};typeof GM_xmlhttpRequest<"u"?GM_xmlhttpRequest({method:"POST",url:r,headers:{"Content-Type":"application/json"},data:JSON.stringify(t),timeout:1e4,onload:c=>{if(c.status>=200&&c.status<300)i(!0);else{const l=a(c.responseText);s(`API Error ${c.status}: ${l}`)}},onerror:c=>s("Lỗi kết nối mạng hoặc CORS."),ontimeout:()=>s("Hết thời gian chờ (10s).")}):fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}).then(async c=>{if(c.ok)return i(!0);const l=await c.text();s(`API Error ${c.status}: ${a(l)}`)}).catch(c=>s(c.message))})}function FE(n){const e=document.createElement("div");e.className="vnpt-cloud-sync-section";const t=r=>{r?(e.innerHTML=`
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
      `,document.getElementById("vnpt-btn-cloud-logout").onclick=async()=>{await Ge.logout(),F("👋 Đã đăng xuất!")},document.getElementById("vnpt-btn-cloud-push").onclick=async()=>{try{F("⏳ Đang đẩy dữ liệu...");const{getProfiles:i}=await Promise.resolve().then(()=>Af),s=i();for(const k of s)await Ge.pushProfile(k);const{SK_CALC_MAP:a,SK_HOTKEYS:c,LOCAL_KEY_FIELDS:l,SK_TEMPLATES:u,SK_TAX:f,SK_DATA_DEF:p,LOCAL_KEY_DEFAULT_FIELDS:w,SK_ADDRESS_LEARNING:A}=await Promise.resolve().then(()=>On),{Storage:T}=await Promise.resolve().then(()=>Mi),{DEFAULT_CALC_MAP:v}=await Promise.resolve().then(()=>Jd),x={calcMap:T.get(a)??v,hotkeys:T.get(c),fields:T.get(l),taxRate:T.get(f),templates:T.get(u),defaultFields:T.get(w),dataDefault:T.get(p),addressLearning:T.get(A)};await Ge.pushGlobalConfig(x),F("✅ Đã đồng bộ lên Cloud!")}catch(i){F("❌ Lỗi: "+i.message,"#ea4335")}},document.getElementById("vnpt-btn-cloud-pull").onclick=async()=>{try{F("⏳ Đang kéo dữ liệu...");const i=await Ge.pullProfiles(),s=await Ge.pullGlobalConfig();if(i.length===0&&!s){F("ℹ️ Không tìm thấy dữ liệu trên Cloud");return}if(confirm(`Tìm thấy ${i.length} bản ghi dữ liệu. Bạn có muốn ghi đè bộ cài đặt Local không?`)){const{importProfiles:a}=await Promise.resolve().then(()=>Af);if(a(i),s){const{SK_CALC_MAP:c,SK_HOTKEYS:l,LOCAL_KEY_FIELDS:u,SK_TEMPLATES:f,SK_TAX:p,SK_DATA_DEF:w,LOCAL_KEY_DEFAULT_FIELDS:A,SK_ADDRESS_LEARNING:T}=await Promise.resolve().then(()=>On),{Storage:v}=await Promise.resolve().then(()=>Mi),{DEFAULT_CALC_MAP:x}=await Promise.resolve().then(()=>Jd);v.set(c,s.calcMap??x),s.hotkeys&&v.set(l,s.hotkeys),s.fields&&v.set(u,s.fields),s.taxRate!==void 0&&v.set(p,s.taxRate),s.templates&&v.set(f,s.templates),s.defaultFields&&v.set(A,s.defaultFields),s.dataDefault&&v.set(w,s.dataDefault),s.addressLearning&&v.set(T,s.addressLearning)}F("✅ Đã khôi phục toàn bộ cấu hình!"),setTimeout(()=>location.reload(),1e3)}}catch(i){F("❌ Lỗi: "+i.message,"#ea4335")}},document.getElementById("vnpt-btn-cloud-keys-push").onclick=async()=>{try{const{SK_GEMINI_KEY:i}=await Promise.resolve().then(()=>On),{Storage:s}=await Promise.resolve().then(()=>Mi),a=s.get(i);if(!a){F("ℹ️ Không tìm thấy Gemini Key để sao lưu");return}F("⏳ Đang sao lưu Keys..."),await Ge.backupKeys({gemini_key:a}),F("✅ Đã sao lưu API Keys lên Cloud!")}catch(i){F("❌ Lỗ: "+i.message,"#ea4335")}},document.getElementById("vnpt-btn-cloud-keys-pull").onclick=async()=>{try{F("⏳ Đang khôi phục Keys...");const i=await Ge.restoreKeys();if(!i||!i.gemini_key){F("ℹ️ Không tìm thấy Keys trên Cloud");return}const{SK_GEMINI_KEY:s}=await Promise.resolve().then(()=>On),{Storage:a}=await Promise.resolve().then(()=>Mi);a.set(s,i.gemini_key),F("✅ Đã khôi phục API Keys từ Cloud!"),setTimeout(()=>location.reload(),1e3)}catch(i){F("❌ Lỗi: "+i.message,"#ea4335")}}):(e.innerHTML=`
        <div class="util-submenu-title">☁️ Tài khoản Cloud</div>
        <div style="padding: 8px; text-align: center;">
          <p style="font-size: 10px; color: #666; margin-bottom: 8px;">Đăng nhập để đồng bộ Profile & API Key giữa các máy tính.</p>
          <button class="vnpt-btn-confirm" id="vnpt-btn-cloud-login-trigger" style="width: 100%; font-size: 12px;">Đăng nhập / Đăng ký</button>
        </div>
      `,document.getElementById("vnpt-btn-cloud-login-trigger").onclick=()=>{UE()})};Ge.onAuthChange(t),n.appendChild(e)}function UE(){const n=document.createElement("div");n.className="vnpt-pdf-overlay",n.innerHTML=`
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
  `,document.body.appendChild(n);const e=n.querySelector("#cloud-email"),t=n.querySelector("#cloud-password");n.querySelector("#btn-do-login").onclick=async()=>{try{await Ge.signIn(e.value,t.value),F("✅ Đăng nhập thành công!"),n.remove()}catch(r){console.error("[CloudSync] Login Error:",r);const i=r.code==="auth/operation-not-allowed"?"Lỗi: Bạn chưa bật Email/Password trong Firebase Console!":r.message;F("❌ "+i,"#ea4335")}},n.querySelector("#btn-do-signup").onclick=async()=>{try{if(!e.value||!t.value){F("⚠️ Vui lòng nhập đầy đủ Email và Mật khẩu","#ffc107");return}confirm("Đăng ký tài khoản mới với Email này?")&&(await Ge.signUp(e.value,t.value),F("✅ Đăng ký thành công!"),n.remove())}catch(r){console.error("[CloudSync] Signup Error:",r);const i=r.code==="auth/operation-not-allowed"?"Lỗi: Bạn chưa bật Email/Password trong Firebase Console!":r.message;F("❌ "+i,"#ea4335")}},n.querySelector("#btn-close-cloud").onclick=()=>n.remove()}const df="vnpt_remote_labels",ff="vnpt_remote_last_fetch",pf="vnpt_remote_info",BE=36e5,qE="https://raw.githubusercontent.com/tranchien2000/vnpt-tampermonkey-vite/main/version.json",Fe={activeLabels:{...ve},info:{latestVersion:Ct,updateUrl:"",message:""},async init(){const n=O.get(df);n&&(this.activeLabels={...ve,...n});const e=O.get(pf);e&&(this.info={...this.info,...e});const t=O.get(ff)||0;Date.now()-t>BE&&await this.refresh()},async refresh(){try{const n=await Ge.getRemoteConfigs();n&&n.selectors&&(this.activeLabels={...ve,...n.selectors},O.set(df,n.selectors));const e=await fetch(`${qE}?t=${Date.now()}`);if(e.ok){const t=await e.json();t&&(this.info={latestVersion:t.version||Ct,updateUrl:t.updateUrl||"",message:t.message||""},O.set(pf,this.info),console.log("[RemoteConfig] Update info fetched from GitHub:",this.info.latestVersion))}O.set(ff,Date.now())}catch(n){console.error("[RemoteConfig] Failed to fetch remote config:",n)}},getLabels(){return this.activeLabels},hasUpdate(){try{const n=Ct.split(".").map(Number),e=this.info.latestVersion.split(".").map(Number);for(let t=0;t<Math.max(n.length,e.length);t++){const r=n[t]||0,i=e[t]||0;if(i>r)return!0;if(i<r)return!1}}catch{}return!1}};function $E(){const n=document.getElementById("vnpt-docx-widget")||document.createElement("div");n.id="vnpt-docx-widget";const e=O.get(Pi)===!0;n.innerHTML=`
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
    `,document.body.appendChild(n),D.widget=n,D.panel=document.getElementById("vnpt-export-panel"),D.toggleBtn=document.getElementById("vnpt-toggle-btn"),D.header=document.getElementById("vnpt-panel-header"),D.bannerArea=document.getElementById("vnpt-banner-area"),D.fieldsContainer=document.getElementById("vnpt-fields-list");try{const T=O.get(Ri);T&&T.width&&T.height&&(D.panel.style.width=T.width+"px",D.panel.style.height=T.height+"px")}catch(T){console.error("Lỗi load size panel:",T)}new ResizeObserver(T=>{if(D.panel.style.display!=="none")for(let v of T){const{width:x,height:k}=v.contentRect;x>0&&k>0&&O.setDebounced(Ri,{width:Math.round(x+20),height:Math.round(k+20)},1e3)}}).observe(D.panel),D.panelBody=document.getElementById("vnpt-panel-body"),Tn(document.getElementById("vnpt-template-manager"),(T,v)=>{D.templateBuffer=T,D.templateName=v}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const T=this.files&&this.files[0];if(!T)return;const v=document.getElementById("vnpt-template-manager");sE(T,v,(x,k)=>{D.templateBuffer=x,D.templateName=k}),this.value=""}),D.toggleBtn.addEventListener("click",T=>{D.hasDragged||(D.panel.style.display==="none"?(D.panel.style.display="flex",D.toggleBtn.className="btn-opened",D.toggleBtn.innerHTML="✖",O.set(Pi,!0)):(D.panel.style.display="none",D.toggleBtn.className="btn-closed",D.toggleBtn.innerHTML="📄",O.set(Pi,!1)))});const r=document.getElementById("vnpt-btn-more"),i=document.getElementById("vnpt-util-menu"),s={S:{width:"380px",height:"420px"},M:{width:"460px",height:"600px"},L:{width:"620px",height:"800px"},Full:{width:"98vw",height:"92vh"}},a=document.getElementById("vnpt-gemini-key"),c=document.getElementById("vnpt-gemini-model");a&&c&&Promise.resolve().then(()=>On).then(({SK_GEMINI_KEY:T,SK_GEMINI_MODEL:v})=>{a.value=O.get(T)||"";const x=O.get(v)||"gemini-2.5-flash";let k=Array.from(c.options).some(N=>N.value===x);c.value=k?x:"gemini-2.5-flash",a.onchange=()=>{O.set(T,a.value.trim())},c.onchange=()=>{O.set(v,c.value)};const P=document.getElementById("vnpt-btn-test-gemini");P&&(P.onclick=async()=>{const N=a.value.trim(),M=c.value;if(!N){F("⚠️ Vui lòng nhập API Key trước khi thử","#ffc107");return}P.disabled=!0,P.textContent="⏳ Đang thử...";try{await ME(N,M),F("✅ Kết nối tới Gemini thành công!","#1e8e3e")}catch(B){F("❌ Kết nối thất bại: "+B,"#ea4335")}finally{P.disabled=!1,P.textContent="⚡ Kiểm tra kết nối"}})}),document.getElementById("vnpt-btn-export-json").onclick=()=>nf();const l=document.getElementById("vnpt-btn-import-json"),u=document.getElementById("vnpt-file-import-json");l.onclick=()=>u.click(),u.onchange=async T=>{T.target.files.length>0&&await rf(T.target.files[0])&&setTimeout(()=>location.reload(),1500)},r.addEventListener("click",T=>{T.stopPropagation();const v=i.classList.toggle("show");r.classList.toggle("active",v)}),i.addEventListener("click",T=>{T.stopPropagation()}),document.addEventListener("click",T=>{i.classList.contains("show")&&(i.classList.remove("show"),r.classList.remove("active"))}),i.querySelectorAll(".size-options button").forEach(T=>{T.addEventListener("click",v=>{const x=v.target.getAttribute("data-size"),k=s[x];k&&(D.panel.style.width=k.width,D.panel.style.height=k.height),i.classList.remove("show"),r.classList.remove("active")})});function f(){const T=document.getElementById("vnpt-hotkey-list");if(!T)return;const v=O.get(wr,Gs);T.innerHTML="",Object.entries(v).forEach(([x,k])=>{const P=document.createElement("div");P.className="vnpt-hotkey-row",P.innerHTML=`
                <span class="vnpt-hotkey-label">${k.label||x}</span>
                <button class="vnpt-hotkey-btn" data-action="${x}">${nc(k)}</button>
            `;const N=P.querySelector(".vnpt-hotkey-btn");N.onclick=M=>{M.stopPropagation(),!N.classList.contains("recording")&&(N.classList.add("recording"),N.textContent="Bấm phím...",VE(x,B=>{N.classList.remove("recording"),N.textContent=nc(B)}))},T.appendChild(P)})}f(),D.panel.querySelectorAll(".vnpt-resizer").forEach(T=>{T.addEventListener("mousedown",v=>{v.preventDefault(),v.stopPropagation();const x=v.clientX,k=v.clientY,P=D.panel.offsetWidth,N=D.panel.offsetHeight,M=D.widget.getBoundingClientRect(),B=M.top;window.innerWidth-M.right,D.panel.classList.add("vnpt-resizing"),document.body.classList.add("vnpt-resizing-global");const j=window.getComputedStyle(T).cursor;document.body.style.cursor=j;const _=y=>{const E=y.clientX-x,I=y.clientY-k;if(T.classList.contains("br"))D.panel.style.width=Math.max(360,P+E)+"px",D.panel.style.height=Math.max(250,N+I)+"px";else if(T.classList.contains("bl")){const S=P-E;S>360&&(D.panel.style.width=S+"px"),D.panel.style.height=Math.max(250,N+I)+"px"}else if(T.classList.contains("tr")){D.panel.style.width=Math.max(360,P+E)+"px";const S=N-I;S>250&&(D.panel.style.height=S+"px",D.widget.style.top=B+I+"px")}else if(T.classList.contains("tl")){const S=P-E,b=N-I;S>360&&(D.panel.style.width=S+"px"),b>250&&(D.panel.style.height=b+"px",D.widget.style.top=B+I+"px")}},m=()=>{window.removeEventListener("mousemove",_),window.removeEventListener("mouseup",m),D.panel.classList.remove("vnpt-resizing"),document.body.classList.remove("vnpt-resizing-global"),document.body.style.cursor="";const y=D.widget.id==="vnpt-docx-widget";O.setDebounced(ki,{right:y?D.widget.style.right:void 0,top:D.widget.style.top,x:y?void 0:parseFloat(D.widget.style.left),y:parseFloat(D.widget.style.top)},500),O.setDebounced(Ri,{width:D.panel.offsetWidth,height:D.panel.offsetHeight},500)};window.addEventListener("mousemove",_),window.addEventListener("mouseup",m)})});const w=document.getElementById("vnpt-cloud-sync-container");w&&FE(w);function A(){const T=document.getElementById("vnpt-update-badge-container");if(T&&Fe.hasUpdate()){const v=document.createElement("span");v.className="vnpt-update-badge",v.textContent="NEW",v.title=`Có bản cập nhật mới v${Fe.info.latestVersion}. Click để xem!`,v.onclick=x=>{x.stopPropagation(),Fe.info.updateUrl?window.open(Fe.info.updateUrl,"_blank"):F(`Bản cập nhật v${Fe.info.latestVersion} đã sẵn sàng!`,"#1a73e8")},T.innerHTML="",T.appendChild(v)}}setTimeout(A,1e3)}function gf(n,e,t,r=null,i=null){let s=!1,a=0,c=0,l=0,u=0,f=!1;const p=5;function w(P){f!==P&&(f=P,i&&i(P))}function A(P){if(P.button!==0||["INPUT","BUTTON","SELECT","TEXTAREA"].includes(P.target.tagName)||P.target.isContentEditable)return;s=!0,D.hasDragged=!1,l=P.clientX,u=P.clientY;const M=n.getBoundingClientRect();a=P.clientX-M.left,c=P.clientY-M.top,document.body.style.userSelect="none",e&&e.forEach(B=>B.style.cursor="grabbing"),r&&r(),P.preventDefault()}e.forEach(P=>{P.addEventListener("mousedown",A)});let T=null,v=0,x=0;function k(){if(!s)return;let P=v,N=x;const M=window.innerWidth,B=window.innerHeight,j=document.getElementById("vnpt-toggle-btn"),_=j?j.offsetWidth:40,m=j?j.offsetHeight:40,y=n.id==="vnpt-docx-widget";let E=n.offsetWidth||0;if(y){let b=_+6-E,se=M-E+6;P<b&&(P=b),P>se&&(P=se)}else E=E||200,P<0&&(P=0),P+E>M&&(P=Math.max(0,M-E));let I=f;if(y?I=!1:f?x+c<B-40&&(I=!1):x+c>B-10&&(I=!0),N<0&&(N=0),I)w(!0),n.style.top=B-(n.offsetHeight||34)+"px",y?(n.style.right=M-P-E+"px",n.style.left="auto"):(n.style.left=P+"px",n.style.right="auto");else{w(!1);let S=n.offsetHeight||40,b;if(y)b=10+m;else{const se=n.querySelector(".cw-title-bar");b=se?se.offsetHeight:S}N+b>B&&(N=Math.max(0,B-b)),n.style.top=N+"px",y?(n.style.right=M-P-E+"px",n.style.left="auto"):(n.style.left=P+"px",n.style.right="auto")}n.style.bottom="auto",T=null}return document.addEventListener("mousemove",function(P){if(s){if(!D.hasDragged)if(Math.sqrt(Math.pow(P.clientX-l,2)+Math.pow(P.clientY-u,2))>p)D.hasDragged=!0;else return;v=P.clientX-a,x=P.clientY-c,T||(T=requestAnimationFrame(k))}}),document.addEventListener("mouseup",function(){if(s){if(s=!1,T&&(cancelAnimationFrame(T),T=null,k()),document.body.style.userSelect="",e&&e.forEach(P=>P.style.cursor="grab"),t){const P=n.id==="vnpt-docx-widget";O.set(t,{left:P?void 0:n.style.left,right:P?n.style.right:void 0,top:n.style.top,x:P?void 0:parseFloat(n.style.left),y:parseFloat(n.style.top),docked:f})}setTimeout(()=>{D.hasDragged=!1},100)}}),{isDocked:()=>f,setDocked:w}}function HE(){D.widget&&D.header&&(gf(D.widget,[D.header],ki),window.addEventListener("resize",()=>{const n=window.innerWidth,e=window.innerHeight,t=document.getElementById("vnpt-toggle-btn"),r=t?t.offsetWidth:40,i=t?t.offsetHeight:40;let s=D.widget.getBoundingClientRect(),a=s.left,c=s.top,l=D.widget.offsetWidth||0,f=r+6-l,p=n-l+6;a<f&&(a=f),a>p&&(a=p),c+10+i>e&&(c=Math.max(0,e-(10+i))),D.widget.style.right=n-a-l+"px",D.widget.style.top=c+"px"}))}function mf(n){const e=n.toLowerCase(),{ngay:t,thang:r,nam:i}=Gd(),s=`${t}/${r}/${i}`;return{"ngayky, ngayky1":t,ngayky:t,"thangky, thangky1":r,thangky:r,"namky, namky1":i,namky:i,"ngaytiepnhan, ngaythangnamky":s,ngaytiepnhan:s,ngaythangnamky:s,soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[e]||""}function Ys(n){var t;if(!n)return"";const e=n.tagName.toLowerCase();if(e==="select")return((t=n.options[n.selectedIndex])==null?void 0:t.text)||"";if(e==="ng-select2"){const r=n.querySelector(".select2-selection__rendered");return r?r.getAttribute("title")||r.textContent.trim():""}return(n.value||n.getAttribute("title")||"").trim()}function yf(n=!1){n&&ur(!0);const e=Fe.getLabels(),t=Object.keys(e).find(c=>c.includes("diaChi"));if(!t)return"";const r=e[t],i=t.split(",").map(c=>c.trim());let s={detail:"",ward:"",district:"",province:""};i.forEach(c=>{const l=et(c,r);if(l){let u=Ys(l);if(u&&u!=="--- Chọn ---"&&!u.includes("Chọn"))if(c==="diaChi"||c==="duong"){const f=c==="duong"&&u.includes(",")?parseAddressComponents(u).street:u;(!s.detail||f.length>s.detail.length)&&(s.detail=f)}else c.includes("tinh")?s.province=u:c.includes("xaIdNew")||c.includes("huyen")||c.includes("quan")?s.district=u:(c.includes("xa")||c.includes("phuong"))&&(s.ward=u)}}),document.querySelectorAll("ng-select2").forEach(c=>{const l=c.querySelector(".select2-selection__rendered");if(!l)return;const u=(l.getAttribute("title")||l.textContent||"").trim();!u||u==="--- Chọn ---"||u.includes("Chọn")||((u.startsWith("Xã")||u.startsWith("Phường")||u.startsWith("Thị trấn"))&&!s.ward?s.ward=u:(u.startsWith("Quận")||u.startsWith("Huyện")||u.startsWith("Thị xã"))&&!s.district?s.district=u:(u.startsWith("Tỉnh")||u.startsWith("Thành phố"))&&!s.province&&(s.province=u))});let a=[];if(s.detail&&a.push(s.detail),s.ward&&a.push(s.ward),s.district&&a.push(s.district),s.province){let c=s.province;!c.startsWith("Tỉnh")&&!c.startsWith("Thành phố")&&(c="Tỉnh "+c),a.push(c)}return a.length>0&&a.push(""),a.filter(c=>!!c).join(", ")}function rc(){let n="";const e=["tinhIdNew","tinhId","diaChiTruSoTinhIdNew"];for(const t of e){const r=et(t);if(r&&(n=Ys(r),n&&n!=="--- Chọn ---"&&!n.includes("Chọn")))break}if(!n||n==="--- Chọn ---"){const t=document.querySelectorAll("ng-select2");for(const r of t){const i=r.querySelector(".select2-selection__rendered"),s=((i==null?void 0:i.getAttribute("title"))||(i==null?void 0:i.textContent)||"").trim();if(s&&(s.startsWith("Tỉnh")||s.startsWith("Thành phố"))&&!s.includes("Chọn")){n=s;break}}}return n?n.trim().replace(/^(Tỉnh|Thành phố)\s+/i,""):""}function jE(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){if(D.isDefaultMode){Object.keys(Me).forEach(f=>{ue(f,Me[f],ve[f]||"")}),Ce(),F("Đã nạp lại dữ liệu mặc định từ hệ thống.");return}let c=0;ur();const l=Fe.getLabels();let u="";Object.keys(l).forEach(f=>{const p=l[f],w=f.split(",").map(k=>k.trim()),A=w.includes("diaChi"),T=w.includes("noiCapSoDkdn");let v="";if(A)v=yf(!1),v&&(c++,u=v);else if(T){const k=rc();k&&(v="SKDT "+k,c++)}else w.forEach(k=>{if(v)return;const P=et(k,p);P&&(v=Ys(P),v&&v!=="--- Chọn ---"&&!v.includes("Chọn")?c++:v="")});if(v=v||mf(f),v&&typeof v=="string"){const k=w[0];["sdt"].includes(k)?v=fE(v):["ngaySinhCustomer","ngayCapCustomer","ngayCapSoDkdnCustomer","ngayKy","ngayTiepNhan"].includes(k)&&(v=$d(v))}const x=w.includes("duong")?u:null;ue(f,v,null,"",null,!1,x)}),Ce(),c>0?(this.style.background="#1e8e3e",this.style.color="#fff",this.innerText="Đã quét xong",setTimeout(()=>{this.style.background="",this.style.color="",this.innerText="Quét dữ liệu"},1e3)):F("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")});let n=null;function e(){const c=Fe.getLabels();if(n)return n;const l=new Map;return Object.keys(c).forEach(u=>{u.split(",").map(p=>p.trim()).forEach(p=>l.set(p,u))}),n=l,l}function t(c){if(c.target.closest("#vnpt-docx-widget")||c.target.closest("#vnpt-inline-calc")||c.type==="keydown"&&c.key!=="Enter")return;const l=c.target.closest("input, textarea, select, ng-select2");if(!l)return;const u=l.id,f=l.getAttribute("formcontrolname"),p=e(),w=u&&p.get(u)||f&&p.get(f);if(w!==void 0){let A;if(w.includes("diaChi")){A=yf(!1);const T=rc();if(T){const v="SKDT "+T,x=Array.from(p.values()).find(k=>k.includes("noiCapSoDkdn"));x&&ue(x,v,null,"",null,!0)}}else A=Ys(l);A!==void 0&&(ue(w,A,null,"",null,!0),Ce(),console.debug(`[Sync] Updated ${w} with value: "${A}"`))}}function r(){["tinhId","tinhIdNew","diaChiTruSoTinhIdNew"].forEach(l=>{const u=document.getElementById(l);if(u&&!u.dataset.widgetSyncBound){u.dataset.widgetSyncBound="1";const f=()=>{const p=rc();if(p){const w="SKDT "+p,A=e(),T=Array.from(A.values()).find(v=>v.includes("noiCapSoDkdn"));T&&(ue(T,w,null,"",null,!0),Ce())}};u.addEventListener("change",f),typeof $<"u"&&$(u).on("select2:select change",f)}})}const i=lr(t,100),s=lr(()=>{pE(),r()},500);document.addEventListener("input",i),document.addEventListener("change",t),document.addEventListener("keydown",t),r(),new MutationObserver(()=>s()).observe(document.body,{childList:!0,subtree:!0})}const zE={local:{download(n,e="arraybuffer"){return new Promise((t,r)=>{const i=new FileReader;switch(i.onload=s=>{let a=s.target.result;e==="base64"&&typeof a=="string"&&(a=a.split(",")[1]||a),t(a)},i.onerror=s=>r(s),e.toLowerCase()){case"arraybuffer":i.readAsArrayBuffer(n);break;case"base64":case"dataurl":i.readAsDataURL(n);break;case"text":i.readAsText(n);break;default:r(new Error(`Unsupported read type: ${e}`))}})},async upload(n){return this.download(n,"base64")}}},KE={getAdapter(n){const e=zE[n];if(!e)throw new Error(`Storage adapter not found: ${n}`);return e},async upload(n,e,t={}){return await this.getAdapter(n).upload(e,t)},async download(n,e,t={}){return await this.getAdapter(n).download(e,t.type||"arraybuffer")}};function vf(n,e,t){try{let r;try{r=new window.PizZip(n)}catch(l){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(l);return}const i=new window.docxtemplater(r,{paragraphLoop:!0,linebreaks:!0});i.render(e);const s=i.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",compression:"DEFLATE",compressionOptions:{level:9}}),a=URL.createObjectURL(s),c=document.createElement("a");c.href=a,c.download=t,document.body.appendChild(c),c.click(),setTimeout(()=>{document.body.removeChild(c),URL.revokeObjectURL(a)},100)}catch(r){let i=r.message;r.properties&&r.properties.errors instanceof Array?i=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+r.properties.errors.map(a=>"- "+(a.properties.explanation||a.message)).join(`
`):i="Lỗi phần mềm Word sinh ra: "+i,alert(i),console.error("DocX Error:",r)}}function GE(n,e){const t=n.replace(/@(\w+)/g,(r,i)=>e[i]!==void 0?e[i]:r);navigator.clipboard.writeText(t).then(()=>{alert("✅ Đã sao chép nội dung vào Clipboard!")}).catch(r=>{console.error("Lỗi khi copy:",r),alert("❌ Lỗi khi sao chép vào Clipboard. Vui lòng thử lại!")})}function WE(){const n=document.getElementById("vnpt-export-filename");n&&n.addEventListener("input",()=>{n.dataset.userEdited="1",n.value.trim()||(n.dataset.userEdited="0")});function e(){if(!n||n.dataset.userEdited==="1")return;let r="";if(D.fieldsContainer&&D.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(u=>{const p=u.querySelector(".f-key").value.trim().split(",")[0].trim(),w=u.querySelector(".f-val").value.trim();p==="tenToChuc"&&(r=w)}),!r){const l=document.getElementById("tenToChuc");l&&(r=l.tagName.toLowerCase()==="textarea"||l.tagName.toLowerCase()==="input"?l.value.trim():l.innerText.trim())}function i(l){if(!l)return"";let u=l;return u=u.replace(/Tổng công ty/gi,""),u=u.replace(/Công ty/gi,""),u=u.replace(/\bCty\b/gi,""),u=u.replace(/Trách nhiệm hữu hạn/gi,""),u=u.replace(/\bTNHH\b/gi,""),u=u.replace(/Cổ phần/gi,""),u=u.replace(/\bCP\b/gi,""),u=u.replace(/Một thành viên/gi,""),u=u.replace(/\bMTV\b/gi,""),u=u.replace(/Chi nhánh/gi,""),u=u.replace(/Việt Nam/gi,"VN"),u=u.replace(/Viet Nam/gi,"VN"),u=u.replace(/\s+/g," ").trim(),u=u.replace(/^[-,\s]+|[-,\s]+$/g,""),u.length>50&&(u=u.substring(0,47)+"..."),u.replace(/[<>:"/\\|?*]/g,"")}let s=i(r),a=D.templateName?D.templateName.replace(/\.docx$/i,""):"",c=[];a&&c.push(a),s&&c.push(s),c.length>0?n.value=c.join(" - ")+".docx":n.value||(n.value="Export_Auto.docx")}setInterval(e,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const r={};if(D.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(l=>{const f=l.querySelector(".f-key").value.trim().split(",")[0].trim(),p=l.querySelector(".f-val").value;f&&(r[f]=p)}),Object.keys(r).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}const s=[];if(vr.forEach(l=>{if(!r[l]||!r[l].trim()){const u=ve[l]||l;s.push(u)}}),s.length>0){const l=`Cảnh báo: Bạn còn các trường sau chưa điền dữ liệu:

- ${s.join(`
- `)}

Bạn có chắc chắn muốn tiếp tục xuất file không?`;if(!confirm(l))return}let a=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(a.toLowerCase().endsWith(".docx")||(a+=".docx"),D.templateBuffer){vf(D.templateBuffer,r,a);return}const c=document.getElementById("vnpt-template-file");if(c.files&&c.files.length>0){KE.download("local",c.files[0],{type:"arraybuffer"}).then(l=>vf(l,r,a)).catch(l=>alert(`Lỗi đọc file: ${l.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')});const t=document.getElementById("vnpt-btn-export-txt");t&&t.addEventListener("click",()=>{const r=document.getElementById("vnpt-raw-scan-input"),i=r?r.value:"";if(!i.trim()){alert(`Bạn chưa nhập nội dung Text Template!

Sử dụng @key làm placeholder, ví dụ: Tôi là @tenDaiDienn`);return}const s={};if(D.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(c=>{const u=c.querySelector(".f-key").value.trim().split(",")[0].trim(),f=c.querySelector(".f-val").value;u&&(s[u]=f)}),Object.keys(s).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}GE(i,s)})}const QE=["chucVu","noiCap","noiCapSoDkdn","ngayky","ngayky1","thangky","namky","thangky1","namky1","noiKy"],YE=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function XE(){function n(){QE.forEach(i=>{const s=document.getElementById(i);s&&!s.dataset.filled&&(s.dataset.filled="1",hr(s,mf(i)))}),YE.forEach(i=>{const s=document.getElementById(i.src),a=document.getElementById(i.target);s&&a&&!s.dataset.bound&&(s.dataset.bound="1",s.addEventListener("change",()=>hr(a,s.value)))}),["tinhId","tinhIdNew","diaChiTruSoTinhIdNew"].forEach(i=>{const s=document.getElementById(i),a=document.getElementById("noiCapSoDkdn");if(s&&a&&!s.dataset.skdtBound){s.dataset.skdtBound="1";const c=()=>{let l="";if(s.tagName.toLowerCase()==="ng-select2"||s.classList.contains("select2-hidden-accessible")){const u=s.parentElement.querySelector(".select2-selection__rendered");l=u?u.getAttribute("title")||u.textContent.trim():s.value}else l=s.value;if(l&&l!=="--- Chọn ---"&&!l.includes("Chọn")){const u=l.trim().replace(/^(Tỉnh|Thành phố)\s+/i,"");hr(a,"SKDT "+u)}};s.addEventListener("change",c),$(s).on("select2:select",c)}})}let e;new MutationObserver(r=>{r.some(s=>s.addedNodes.length>0?Array.from(s.addedNodes).some(c=>c.nodeType!==1?!1:["INPUT","TEXTAREA","SELECT"].includes(c.tagName)?!0:c.querySelector&&c.querySelector("input, textarea, select")):!1)&&(clearTimeout(e),e=setTimeout(n,200))}).observe(document.body,{childList:!0,subtree:!0}),n()}const JE=()=>{let n="";for(const[e,t]of Object.entries(ve)){const r=e.split(",")[0].trim();vr.includes(r)&&(n+=`    "${r}": "${t}",
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
}`};function ZE(n,e,t="gemini-2.0-flash",r="application/pdf",i=null){const s={apiKey:e,model:t,systemInstruction:JE(),userText:"Đọc tài liệu hợp đồng này và trích xuất thành JSON. Nếu có nhiều trang, hãy kết nối thông tin với nhau để lấy ra thông tin đầy đủ nhất."};return i&&Array.isArray(i)&&(s.filesData=i),hf(s)}function ic(n){return new Promise((e,t)=>{const r=new FileReader,i=n.type||"application/octet-stream";r.onload=()=>{const s=r.result.split(",")[1];e({base64:s,mimeType:i})},r.onerror=s=>t(s),r.readAsDataURL(n)})}function _f(n,e,t,r){let i=document.getElementById("vnpt-pdf-dialog");i&&i.remove(),i=document.createElement("div"),i.id="vnpt-pdf-dialog",i.className="vnpt-pdf-overlay";const s=n.map((T,v)=>`
        <tr class="pdf-row-auto">
            <td style="text-align: center;">
                <input type="checkbox" class="pdf-row-chk" data-index="${v}" ${T.checked?"checked":""} />
            </td>
            <td><strong title="${T.key}">${T.label}</strong></td>
            <td>
                <input type="text" class="pdf-val-input" data-index="${v}" value="${T.value}" placeholder="..." />
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
    `,document.body.appendChild(i);const a=i.querySelector("#pdf-btn-cancel"),c=i.querySelector("#pdf-btn-confirm"),l=i.querySelector("#pdf-btn-reparse"),u=i.querySelector("#pdf-check-all"),f=i.querySelectorAll(".pdf-row-chk");i.querySelectorAll(".pdf-val-input");const p=i.querySelector("#pdf-raw-text-edit");u&&u.addEventListener("change",T=>{f.forEach(v=>v.checked=T.target.checked)});const w=()=>{window.removeEventListener("keydown",A),i.remove()},A=T=>{if(T.key==="Escape")w();else if(T.key==="Enter"){if(T.target&&T.target.id==="pdf-raw-text-edit")return;T.preventDefault(),c.click()}};window.addEventListener("keydown",A),a.onclick=w,l.onclick=()=>{if(r){const T=p.value;r(T)}},c.onclick=()=>{try{const T=[];i.querySelectorAll(".pdf-row-auto").forEach(x=>{const k=x.querySelector(".pdf-row-chk"),P=x.querySelector(".pdf-val-input");if(k&&k.checked&&P){const N=parseInt(k.getAttribute("data-index"));n[N]&&T.push({...n[N],value:P.value})}}),w(),t&&t(T)}catch(T){console.error("[VNPT] Lỗi khi xác nhận kết quả:",T),alert("Có lỗi xảy ra khi lưu dữ liệu. Vui lòng thử lại.")}}}const ke={name:n=>n?n.trim().toUpperCase().replace(/\s+/g," "):"",mst:n=>n?n.replace(/[^\d]/g,"").trim():"",date:(n,e,t)=>`${String(n).padStart(2,"0")}/${String(e).padStart(2,"0")}/${t}`,text:n=>n?n.trim().replace(/\s+/g," "):""};function Tt(n,e){for(const t of e){const r=n.match(t);if(r&&r[1])return r[1].trim()}return null}function eT(n){if(!n)return{};const e={},t=n.replace(/\r/g,"");if(t.includes("|")){const m=t.split("|").map(y=>y.trim());if(m.length>=6){e.cmnd=ke.mst(m[0]),e.tenDaiDienn=ke.name(m[2]);const y=m[3];y&&y.length===8&&!y.includes("/")?e.ngaySinhCustomer=ke.date(y.slice(0,2),y.slice(2,4),y.slice(4)):y&&(e.ngaySinhCustomer=y),m[5]&&(e.diaChiCustomer=ke.text(m[5]));const E=m[6];return E&&E.length===8&&!E.includes("/")?e.ngayCapCustomer=ke.date(E.slice(0,2),E.slice(2,4),E.slice(4)):E&&(e.ngayCapCustomer=E),e.noiCap="Cục Cảnh sát quản lý hành chính về trật tự xã hội",e}}const i=Tt(t,[/(?:Tên công ty viết bằng tiếng Việt|Tên doanh nghiệp|Tên tổ chức|Doanh nghiệp|Công ty):?\s*([\s\S]+?)(?=\n|Tên công ty|Mã số|$)/i,/Tên công ty viết bằng tiếng nước ngoài:?\s*([\s\S]+?)(?=\n|Tên công ty|$)/i,/Tên công ty viết tắt:?\s*([\s\S]+?)(?=\n|Địa chỉ|$)/i]);i&&(e.tenToChuc=ke.text(i));const a=Tt(t,[/(?:Mã số doanh nghiệp|Mã số thuế):?\s*([\d\s.]{10,16})/i,/MST:?\s*([\d\s.]{10,16})/i]);a&&(e.soDkdn=ke.mst(a));let l=Tt(t,[/(?:Họ và tên|Người đại diện theo pháp luật|Tên đại diện|Full name):?\s*([\s\S]+?)(?=\n|Chức danh|Chức vụ|Giới tính|Sinh ngày|Date of birth|$)/i,/Người đại diện:?\s*([\s\S]+?)(?=\n|Chức vụ|$)/i]);l&&(l=l.replace(/^(?:Họ và tên|Người đại diện theo pháp luật|Tên đại diện|Full name|[\/\s]*Full name):?\s*/i,"").replace(/^\/\s*/,""),e.tenDaiDienn=ke.name(l));const f=Tt(t,[/(?:Chức danh|Chức vụ):?\s*([\s\S]+?)(?=\n|Sinh ngày|Giới tính|Quốc tịch|$)/i]);f&&(e.chucVu=ke.text(f));const p=t.match(/(?:Đăng ký|Đảng kỷ|Cấp ngày|Ngày cấp) (?:lần đầu|thay đổi):?\s*ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i);p&&(e.ngayCapSoDkdnCustomer=ke.date(p[1],p[2],p[3]));const A=Tt(t,[/(?:Điện thoại|SĐT|Tel):?\s*([\d\s.-]{9,15})/i]);A&&(e.sdt=A.replace(/[\s.-]/g,"").trim());const v=Tt(t,[/(?:Thư điện tử|Email):?\s*([^\s\n]+)/i]);v&&(e.emailDaiDien=v.replace(/\(a\)/g,"@").trim());const k=Tt(t,[/(?:Số định danh cá nhân|Số CMND|Số CCCD|Số Hộ chiếu|Số \/ No\.):?\s*(\d[\d\s]{8,13})/i,/(?:CMND|CCCD) số:?\s*(\d[\d\s]{8,13})/i]);k&&(e.cmnd=ke.mst(k));const N=Tt(t,[/Nơi cấp:?\s*([\s\S]+?)(?=\n|Ngày cấp|$)/i,/Cục trưởng Cục Cảnh sát ([\s\S]+?)(?=\n|$)/i]);N&&(e.noiCap=ke.text(N));const M=t.match(/Ngày cấp:?\s*(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{4})/i);M&&(e.ngayCapCustomer=ke.date(M[1],M[2],M[3]));const B=t.match(/(?:Ngày, tháng, năm sinh|Sinh ngày|Ngày sinh):?\s*ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i);if(B)e.ngaySinhCustomer=ke.date(B[1],B[2],B[3]);else{const m=t.match(/(?:Ngày sinh|Sinh ngày):?\s*(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{4})/i);m&&(e.ngaySinhCustomer=ke.date(m[1],m[2],m[3]))}const _=Tt(t,[/(?:Địa chỉ trụ sở chính|Địa chỉ thường trú|Nơi thường trú|Địa chỉ):?\s*([\s\S]+?)(?=\n|Điện thoại|Email|SĐT|$)/i]);return _&&(e.diaChiCustomer=ke.text(_)),e}const tT=()=>{let n="";for(const[e,t]of Object.entries(ve)){const r=e.split(",")[0].trim();vr.includes(r)&&(n+=`    "${r}": "${t}",
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
}`};async function nT(n,e,t="gemini-2.0-flash"){if(!n||!n.trim())throw new Error("Vui lòng nhập nội dung văn bản cần phân loại.");return hf({apiKey:e,model:t,systemInstruction:tT(),userText:`Hãy phân loại thông tin từ đoạn văn bản sau đây: 

${n}`})}function Xs(n){if(!n||!n.trim())throw new Error("Vui lòng nhập nội dung văn bản cần phân loại.");return eT(n)}const bf="vnpt_pending_mail_data",rT=bf;function iT(){const n=window.location.hostname;let e={subject:"",body:"",sender:"",attachmentUrls:[]};try{if(n.includes("mail.google.com")){const t=document.querySelector(".a3s.aiL"),r=document.querySelector("h2.hP"),i=document.querySelector(".gD");e.body=t?t.innerText:"",e.subject=r?r.innerText:"",e.sender=i?i.getAttribute("email")||i.innerText:"",document.querySelectorAll(".a98, .a7K").forEach(s=>{const a=s.closest("a")||s.querySelector("a");a&&a.href&&!a.href.includes("support.google.com")&&e.attachmentUrls.push({url:a.href,name:s.innerText.split(`
`)[0].trim()||"Tệp đính kèm"})})}else if(n.includes("outlook.live.com")||n.includes("outlook.office.com")||n.includes("outlook.office365.com")){const t=document.querySelector('[role="main"]'),r=document.querySelector('[data-automation-id="subject"]'),i=document.querySelector('[data-automation-id="from"]');e.body=t?t.innerText:"",e.subject=r?r.innerText:"",e.sender=i?i.innerText:"",document.querySelectorAll('[data-automation-id="AttachmentCard"]').forEach(s=>{const a=s.querySelector("a"),c=s.querySelector('[data-automation-id="attachmentName"]');a&&a.href&&e.attachmentUrls.push({url:a.href,name:c?c.innerText:"Tệp đính kèm"})})}}catch(t){console.error("[VNPT] Lỗi khi bóc tách Mail:",t)}return e}const sc="vnpt-send-to-vnpt-btn";function wf(){sT().then(()=>{Ef(),oT()})}function sT(){return new Promise(n=>{if(document.body){n();return}const e=new MutationObserver(()=>{document.body&&(e.disconnect(),n())});e.observe(document.documentElement,{childList:!0}),setTimeout(n,1e4)})}function oT(){setInterval(()=>{document.getElementById(sc)||Ef()},3e3)}function Ef(){if(document.getElementById(sc)||!document.body)return;const n=document.createElement("button");n.id=sc,n.innerHTML="📋 Gửi sang VNPT",n.title="Trích xuất nội dung mail này và gửi sang tab VNPT Tool",Object.assign(n.style,{position:"fixed",bottom:"24px",right:"24px",zIndex:"99999",padding:"10px 18px",background:"linear-gradient(135deg, #4f46e5, #7c3aed)",color:"#fff",border:"none",borderRadius:"24px",fontSize:"13px",fontWeight:"600",cursor:"pointer",boxShadow:"0 4px 20px rgba(79,70,229,0.5)",transition:"all 0.2s ease",fontFamily:"sans-serif"}),n.addEventListener("mouseenter",()=>{n.style.transform="translateY(-2px)",n.style.boxShadow="0 8px 28px rgba(79,70,229,0.65)"}),n.addEventListener("mouseleave",()=>{n.style.transform="",n.style.boxShadow="0 4px 20px rgba(79,70,229,0.5)"}),n.addEventListener("click",()=>{const e=iT();if(!e.body&&!e.subject){oc("⚠️ Không tìm thấy nội dung mail. Hãy mở một email cụ thể!","#f59e0b");return}try{GM_setValue(bf,JSON.stringify({...e,_timestamp:Date.now(),_source:window.location.hostname})),oc('✅ Đã gửi! Chuyển sang tab VNPT và nhấn "📧 Quét Mail".',"#10b981");const t=n.innerHTML;n.innerHTML="✅ Đã gửi!",n.style.background="linear-gradient(135deg, #059669, #10b981)",setTimeout(()=>{n.innerHTML=t,n.style.background="linear-gradient(135deg, #4f46e5, #7c3aed)"},2500)}catch(t){console.error("[VNPT] Lỗi GM_setValue:",t),oc("❌ Lỗi ghi dữ liệu. Kiểm tra lại grant Tampermonkey.","#ef4444")}}),document.body.appendChild(n),console.log("[VNPT] Mail Bridge đã inject lên",window.location.hostname)}function oc(n,e="#4f46e5"){const t=document.createElement("div");Object.assign(t.style,{position:"fixed",bottom:"80px",right:"24px",zIndex:"99999",padding:"10px 16px",background:e,color:"#fff",borderRadius:"10px",fontSize:"13px",fontFamily:"sans-serif",fontWeight:"500",boxShadow:"0 4px 16px rgba(0,0,0,0.25)",maxWidth:"320px",lineHeight:"1.5",transition:"opacity 0.3s"}),t.textContent=n,document.body.appendChild(t),setTimeout(()=>{t.style.opacity="0"},2200),setTimeout(()=>{t.remove()},2600)}function aT(){try{const n=document.body.cloneNode(!0);["script","style","noscript","iframe","svg","nav","footer","header:not(article header)","aside",".sidebar",".menu",".banner","#vnpt-docx-widget","#vnpt-inline-calc",".vnpt-pdf-overlay",'[aria-hidden="true"]'].forEach(r=>{n.querySelectorAll(r).forEach(s=>s.remove())});let t=n.innerText||"";return t=t.split(`
`).map(r=>r.trim()).filter(r=>r.length>0).join(`
`),t}catch(n){return console.error("Lỗi khi quét màn hình:",n),""}}function cT(n,e){return new Promise((t,r)=>{if(typeof GM_xmlhttpRequest>"u"){r(new Error("GM_xmlhttpRequest không khả dụng. Hãy cài đặt trên Tampermonkey."));return}GM_xmlhttpRequest({method:"GET",url:n,responseType:"arraybuffer",onload:function(i){var s;if(i.status===200){const a=((s=i.responseHeaders.match(/content-type:\s*([^\s;]+)/i))==null?void 0:s[1])||"application/octet-stream",c=lT(i.response);t({base64:c,mimeType:a,name:e})}else r(new Error("Lỗi tải tệp: "+i.status))},onerror:function(i){r(i)}})})}function lT(n){let e="";const t=new Uint8Array(n),r=t.byteLength;for(let i=0;i<r;i++)e+=String.fromCharCode(t[i]);return window.btoa(e)}let Be=[];function xn(n,e){if(n.innerHTML="",Be.length===0){e.style.display="flex";return}e.style.display="none",Be.forEach((t,r)=>{const i=document.createElement("div");if(i.className="ai-queue-item",t.mimeType&&t.mimeType.startsWith("image/")){const a=document.createElement("img");a.src=`data:${t.mimeType};base64,${t.base64}`,i.appendChild(a)}else{const a=document.createElement("span");a.className="file-icon",a.textContent="📄",i.appendChild(a)}const s=document.createElement("button");s.className="btn-remove-item",s.innerHTML="✖",s.onclick=a=>{a.stopPropagation(),Be.splice(r,1),xn(n,e)},i.appendChild(s),n.appendChild(i)})}function uT(n,e,t){Be=[],t.value="",xn(n,e)}function hT(){const n=document.getElementById("vnpt-btn-ai-mode"),e=document.getElementById("vnpt-ai-scanner-section"),t=document.getElementById("vnpt-btn-ai-process"),r=document.getElementById("vnpt-btn-raw-process-local"),i=document.getElementById("vnpt-raw-scan-input"),s=document.getElementById("vnpt-ai-queue-container"),a=document.getElementById("vnpt-ai-queue-list"),c=document.getElementById("vnpt-ai-queue-placeholder"),l=document.getElementById("vnpt-btn-show-pdf"),u=document.getElementById("vnpt-btn-clear-queue"),f=document.getElementById("vnpt-pdf-input");if(!n||!e)return;n.addEventListener("click",v=>{v.preventDefault();const x=e.style.display==="none";e.style.display=x?"flex":"none",n.classList.toggle("active",x)});const p=O.get(Ln);p&&i&&(i.value=p),i&&i.addEventListener("input",()=>{O.setDebounced(Ln,i.value,1e3)}),l&&l.addEventListener("click",v=>{if(v.preventDefault(),D.lastPdfResults&&D.lastPdfResults.length>0)_f(D.lastPdfResults,D.lastPdfRawText||"",x=>{x.forEach(k=>{ue(k.key,k.value,k.label)}),Ce(),F(`✅ Đã cập nhật ${x.length} trường.`)},x=>{try{const k=Xs(x);T(k,x,"KẾT QUẢ QUÉT (CẬP NHẬT)")}catch(k){F("❌ Lỗi: "+k.message,"#ef4444")}});else if(i&&i.value.trim()){const x=i.value.trim();try{const k=Xs(x);T(k,x,"PHÂN LOẠI DỮ LIỆU THÔ (LOCAL)")}catch(k){F("❌ Lỗi: "+k.message,"#f44336")}}else F("Chưa có nội dung để hiển thị. Vui lòng nhập text hoặc chọn file.","#ffc107")}),u&&u.addEventListener("click",v=>{v.preventDefault(),uT(a,c,i)}),s.addEventListener("click",()=>{f.click()});const w=document.getElementById("vnpt-btn-scan-mail"),A=document.getElementById("vnpt-btn-scan-screen");w&&w.addEventListener("click",async()=>{let v;try{v=GM_getValue(rT,null)}catch{F("❌ Lỗi GM_getValue. Kiểm tra lại grant Tampermonkey.","#ef4444");return}if(!v){F(`⚠️ Chưa có mail nào được gửi!
👉 Mở Gmail/Outlook → chọn email → nhấn nút "📋 Gửi sang VNPT".`,"#f59e0b");return}let x;try{x=typeof v=="string"?JSON.parse(v):v}catch{F("❌ Dữ liệu mail bị lỗi định dạng.","#ef4444");return}const k=30*60*1e3;if(x._timestamp&&Date.now()-x._timestamp>k){F("⚠️ Dữ liệu mail đã quá cũ (>30 phút). Hãy gửi lại từ tab Gmail/Outlook.","#f59e0b");return}const P=`TIÊU ĐỀ: ${x.subject||""}
NGƯỜI GỬI: ${x.sender||""}

NỘI DUNG EMAIL:
${x.body||""}`;if(i.value.trim()?i.value+=`

--- MAIL MỚI ---
${P}`:i.value=P,O.set(Ln,i.value),F(`📧 Đã nhận mail từ ${x._source||"tab mail"}.`),x.attachmentUrls&&x.attachmentUrls.length>0){F(`📂 Đang tải ${x.attachmentUrls.length} tệp đính kèm...`,"#1a73e8");for(const N of x.attachmentUrls)try{const M=await cT(N.url,N.name);Be.push({file:{name:N.name},...M})}catch(M){console.error("[VNPT] Lỗi tải tệp:",N.name,M)}xn(a,c),F("✅ Đã nạp xong tệp đính kèm!")}t.click()}),A&&A.addEventListener("click",()=>{const v=aT();v?(i.value.trim()?i.value+=`

--- NỘI DUNG MÀN HÌNH MỚI ---
${v}`:i.value=v,O.set(Ln,i.value),F("🖥️ Đã quét toàn bộ màn hình."),t.click()):F("⚠️ Không thể quét nội dung màn hình","#ffc107")}),s.addEventListener("dragover",v=>{v.preventDefault(),s.classList.add("drag-over")}),s.addEventListener("dragleave",v=>{v.preventDefault(),s.classList.remove("drag-over")}),s.addEventListener("drop",async v=>{if(v.preventDefault(),s.classList.remove("drag-over"),v.dataTransfer.files&&v.dataTransfer.files.length>0){for(let x of v.dataTransfer.files){const k=await ic(x);Be.push({file:x,...k})}xn(a,c)}}),f.addEventListener("change",async v=>{if(v.target.files){for(let x of v.target.files){const k=await ic(x);Be.push({file:x,...k})}v.target.value="",xn(a,c)}}),window.addEventListener("paste",async v=>{if(e.style.display==="none")return;const x=(v.clipboardData||v.originalEvent.clipboardData).items;let k=!1;for(let N of x)if(N.type.indexOf("image")!==-1||N.type.indexOf("pdf")!==-1){k=!0;const M=N.getAsFile();if(M){const B=await ic(M);Be.push({file:M,...B}),xn(a,c),F("📋 Đã thêm vào hàng đợi ảnh/file.")}}const P=v.target;k&&(P.tagName==="INPUT"||P.tagName==="TEXTAREA")&&v.preventDefault()});const T=(v,x,k)=>{const P=new Set,N=[],M=["ngày ký","tháng ký","năm ký","số lượng gói","nơi ký","liên hệ a"],B=["ngayKy","ngayKy1","thangKy","thangKy1","namKy","namKy1","soLuongGoi","noiKy"];Object.entries(ve).forEach(([_,m])=>{const y=_.split(",").map(S=>S.trim());if(M.includes(m.toLowerCase())||y.every(S=>B.includes(S))){y.forEach(S=>P.add(S));return}let I="";for(const S of y)if(v[S]){I=v[S],P.add(S);break}N.push({key:_,value:I,label:m,checked:!!I})}),Object.keys(v).forEach(_=>{!P.has(_)&&!B.includes(_)&&v[_]&&N.push({key:_,value:v[_],label:_,checked:!0})}),N.every(_=>!_.value)&&F("⚠️ AI hoặc Regex không trích xuất được thông tin nào!","#ffc107"),D.lastPdfResults=N,D.lastPdfRawText=x||"",_f(N,x||"",_=>{_.forEach(m=>{ue(m.key,m.value,m.label)}),Ce(),F(`✅ Đã quét xong ${_.length} trường.`),D.lastPdfResults=D.lastPdfResults.map(m=>{const y=_.find(E=>E.key===m.key);return y?{...m,value:y.value,checked:!0}:{...m,checked:!1}})},_=>{try{const m=Xs(_);T(m,_,k),F("🔄 Đã cập nhật lại các trường từ text mới.")}catch(m){F("❌ Lỗi Cập nhật: "+m.message,"#ef4444")}});const j=document.querySelector("#vnpt-pdf-dialog h3");j&&(j.textContent=k)};r.addEventListener("click",()=>{const v=i.value.trim();if(!v){F("⚠️ Vui lòng nhập nội dung văn bản!","#ffc107");return}try{oi("Trước khi phân loại Local: "+sf());const x=Xs(v);T(x,v,"PHÂN LOẠI DỮ LIỆU THÔ (LOCAL)")}catch(x){F("❌ Lỗi: "+x.message,"#f44336")}}),t.addEventListener("click",async()=>{const v=O.get(Mc),x=O.get(Fc)||"gemini-2.5-flash";if(!v){confirm(`Chưa cài đặt Gemini API Key!

AI Scanner yêu cầu mã Google AI Studio.

Nhấn 'OK' để xem hướng dẫn nhé!`)&&window.open("https://github.com/tranchien2000/vnpt-tampermonkey-vite/blob/main/docs/GEMINI_API_GUIDES.md","_blank");return}if(Be.length===0&&!i.value.trim()){F("⚠️ Hàng đợi trống. Vui lòng chọn file hoặc dán nội dung","#ffc107");return}i.classList.add("ai-scanning-glow"),t.disabled=!0,t.textContent="⏳ ĐANG QUÉT...";try{oi("Trước khi AI Scan: "+sf());let k={},P="";if(Be.length>0){const N=await ZE(null,v,x,null,Be);k=N.fields||{},P=N.rawTextSnippet||N.rawFullText||"",i.value.trim()?i.value+=`

--- KẾT QUẢ ĐỌC FILE ---
${P}`:i.value=P,O.set(Ln,i.value)}else{const N=i.value.trim();k=await nT(N,v,x),P=N}T(k,P,"PHÂN LOẠI DỮ LIỆU THÔ (AI)"),Be.length>0&&(Be=[],xn(a,c))}catch(k){console.error("Lỗi AI Scan Pipeline:",k),alert(`Lỗi xử lý quét AI:
`+k)}finally{i.classList.remove("ai-scanning-glow"),t.disabled=!1,t.textContent="✨ BẮT ĐẦU QUÉT AI"}})}function i0(){}function fr(n,e=null){return O.get(n,e)}function Js(n,e){O.set(n,e)}function Tf(n,e){if(!e||e.replace(/\D/g,"").length<6)return;let t=fr(n,[]);t=t.filter(r=>r!==e),t.unshift(e),Js(n,t.slice(0,10))}function Zs(n,e){const t=document.getElementById(e);t&&(t.innerHTML=fr(n,[]).map(r=>`<option value="${r}">`).join(""))}function ac(n){return n.toLocaleString("en-US")}function cc(n){return Number(String(n).replace(/[^\d]/g,""))||0}function dT(n){return n.charAt(0).toUpperCase()+n.slice(1)}const ui=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function fT(n){let e=Math.floor(n/100),t=Math.floor(n%100/10),r=n%10,i="";return e>0&&(i+=ui[e]+" trăm ",t===0&&r>0&&(i+="lẻ ")),t>1?(i+=ui[t]+" mươi ",r===1?i+="mốt":r===5?i+="lăm":r>0&&(i+=ui[r])):t===1?(i+="mười ",r===5?i+="lăm":r>0&&(i+=ui[r])):r>0&&(e>0&&(i+="lẻ "),i+=ui[r]),i.trim()}function pT(n){if(n===0)return"không";const e=["","nghìn","triệu","tỷ"];let t="",r=0;for(;n>0;){const i=n%1e3;i>0&&(t=fT(i)+" "+e[r]+" "+t),n=Math.floor(n/1e3),r++}return t.trim()}function If(n,e,t){if(e===""||e===void 0||e===null)return{beforeNum:0,taxNum:0,afterNum:0,beforeStr:"",taxStr:"",afterStr:"",textStr:""};let r=0,i=0,s=0;n==="before"?(r=cc(e),i=t>0?Math.round(r*t):0,s=r+i):n==="tax"?(i=cc(e),r=t>0?Math.round(i/t):0,s=r+i):n==="after"&&(s=cc(e),r=t>0?Math.round(s/(1+t)):s,i=s-r);const a=dT(pT(s))+" đồng";return{beforeNum:r,taxNum:i,afterNum:s,beforeStr:ac(r),taxStr:ac(i),afterStr:ac(s),textStr:a}}function gT(n,e){e.before&&e.before.forEach(t=>si(t,n.beforeStr)),e.tax&&e.tax.forEach(t=>si(t,n.taxStr)),e.after&&e.after.forEach(t=>si(t,n.afterStr)),e.text&&e.text.forEach(t=>si(t,n.textStr))}function eo(n,e=null){try{const t=localStorage.getItem(n);return t!==null?JSON.parse(t):e}catch{return e}}function It(n,e){localStorage.setItem(n,JSON.stringify(e))}function mT(n,e,t,r){let i=eo(Dn)??"custom",s=eo(dt)??{...Me},a=eo(rn)??{},c=eo(At)??{};const l=document.createElement("div");l.className="cw-tab-header";const u={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};u.custom.innerText="📋 Custom",u.custom.className="cw-tab cw-tab-custom",u.default.innerText="📌 Default",u.default.className="cw-tab cw-tab-default",u.sync.innerText="🔗 Sync",u.sync.className="cw-tab cw-tab-sync";function f(){Object.values(u).forEach(_=>_.classList.remove("active")),u[i].classList.add("active")}f();const p=document.createElement("div");p.style.display=r.data?"none":"block";const w=e("📋 Cấu hình Data","data",_=>{p.style.display=_?"none":"block",t(n)}),A=document.createElement("div");A.className="cw-data-body";function T(){A.innerHTML="";let _=i==="sync"?c:i==="custom"?a:s,m=i==="sync"?At:i==="custom"?rn:dt;const y=Object.keys(_);y.length===0&&i!=="default"&&(A.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),y.forEach(E=>{const I=document.createElement("div");I.className="cw-data-row";let S=i!=="default";const b=_[E],se=b&&typeof b=="object"&&b.hasOwnProperty("value"),lt=se?b.value:b,di=se&&b.label||E,qe=document.createElement("input");qe.type="text",qe.value=di,qe.id=`df-key-${E}`,qe.name=`df-key-${E}`,qe.className="cw-data-key"+(S?" mutable":""),qe.title=E,qe.readOnly=!S,S&&(qe.onchange=()=>{const Ne=qe.value.trim();if(!Ne||Ne===E){qe.value=di;return}se?_[Ne]={...b,label:Ne}:_[Ne]=lt,delete _[E],It(m,_),T()});const Ue=document.createElement("input");if(Ue.type="text",Ue.value=lt??"",Ue.id=`df-val-${E}`,Ue.name=`df-val-${E}`,Ue.className="cw-data-val",Ue.oninput=()=>{se?_[E]={...b,value:Ue.value}:_[E]=Ue.value,It(m,_)},I.appendChild(qe),I.appendChild(Ue),S){const Ne=document.createElement("button");Ne.innerHTML="✕",Ne.className="cw-del-btn",Ne.onclick=()=>{confirm(`Delete "${di}"?`)&&(delete _[E],It(m,_),T())},I.appendChild(Ne)}else I.appendChild(document.createElement("div")).className="cw-pad";A.appendChild(I)})}u.custom.onclick=()=>{i="custom",It(Dn,"custom"),f(),T()},u.default.onclick=()=>{i="default",It(Dn,"default"),f(),T()},u.sync.onclick=()=>{i="sync",It(Dn,"sync"),f(),T()};const v=document.createElement("button");v.innerText="📤",v.className="cw-icon-btn",v.title="Sao lưu toàn bộ dữ liệu ra JSON",v.onclick=()=>nf();const x=document.createElement("button");x.innerText="📥",x.className="cw-icon-btn",x.title="Khôi phục dữ liệu từ JSON";const k=document.createElement("input");k.type="file",k.accept=".json",k.style.display="none",k.onchange=async _=>{_.target.files.length>0&&await rf(_.target.files[0])&&setTimeout(()=>location.reload(),1500)},x.onclick=()=>k.click(),p.appendChild(l),l.appendChild(u.custom),l.appendChild(u.default),l.appendChild(u.sync),p.appendChild(A),n.appendChild(w),n.appendChild(p);const P=n.querySelector("#vnpt-cw-fill"),N=n.querySelector("#vnpt-cw-sync"),M=n.querySelector("#vnpt-cw-add"),B=n.querySelector("#vnpt-cw-reset");P&&(P.onclick=Zd),N&&(N.onclick=TE),M&&(M.onclick=()=>{i==="default"&&(i="custom",It(Dn,"custom"),f());let _=i==="sync"?c:a,m="new_field_"+Date.now();_[m]="",It(i==="sync"?At:rn,_),T(),A.scrollTop=A.scrollHeight}),B&&(B.onclick=()=>{confirm("Reset Default Data?")&&(s={...Me},It(dt,s),T())}),T();const j=w.querySelector(".cw-right-wrap")||document.createElement("div");j.className="cw-right-wrap",j.prepend(v),j.prepend(x),j.appendChild(k),w.appendChild(j)}function yT(n,e,t){let r=Number(localStorage.getItem(Nn))||Xd,i=fr(_r)??{calc:!1,data:!0};function s(v,x){const k=document.createElement("button");return k.innerText=v,k.className="cw-action-btn "+x,k}function a(v,x,k){const P=document.createElement("div");P.className="wg-sec-header";const N=document.createElement("span");N.innerText=v;const M=document.createElement("button");return M.className="wg-toggle-btn",M.innerText=i[x]?"▾":"▴",P.appendChild(N),P.appendChild(M),M.onclick=()=>{i[x]=!i[x],M.innerText=i[x]?"▾":"▴",Js(_r,i),k(i[x])},P}function c(v){const x=window.innerWidth,k=window.innerHeight,P=v.getBoundingClientRect();v.style.left=Math.min(Math.max(parseFloat(v.style.left),0),x-P.width)+"px",v.style.top=Math.min(Math.max(parseFloat(v.style.top),0),k-36)+"px"}const l=document.createElement("div");if(!e){l.className="cw-title-bar",l.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const v=document.createElement("div");v.className="cw-btn-group";const x={fill:s("Fill","cw-btn-fill"),sync:s("Sync","cw-btn-sync"),add:s("Add","cw-btn-add"),reset:s("↺","cw-btn-reset")};x.sync.onclick=()=>{const k=p("before",f.before.value);w("before",k.beforeStr)},x.reset.title="Reset Default fields",Object.values(x).forEach(k=>v.appendChild(k)),l.appendChild(v),n.appendChild(l)}const u=document.createElement("div");u.className="cw-body-inline",u.innerHTML=`
    <div class="cw-inline-row">
        <input id="wg-before" name="wg-before" class="cw-input-inline" placeholder="Trước thuế" list="wg-before-list" title="Trước thuế">
        <datalist id="wg-before-list"></datalist>
        <div class="cw-tax-group-inline"><input id="wg-taxRate" name="wg-taxRate" class="cw-tax-input-inline" title="Thuế (%)"><span class="cw-tax-symbol">%</span></div>
        <input id="wg-tax" name="wg-tax" class="cw-input-inline" placeholder="Tiền thuế" title="Tiền thuế">
        <input id="wg-after" name="wg-after" class="cw-input-inline" placeholder="Sau thuế" list="wg-after-list" title="Sau thuế">
        <datalist id="wg-after-list"></datalist>
        <input id="wg-text" name="wg-text" class="cw-input-inline cw-input-readonly-inline" placeholder="Bằng chữ" readonly title="Bằng chữ">
        <button id="wg-sync-manual" class="cw-map-btn-inline" title="Đồng bộ kết quả lên trang web (🔄)">🔄</button>
    </div>`,e?e.appendChild(u):n.appendChild(u),e||mT(n,a,c,i);const f={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text")};f.taxRate.value=r*100,Zs(Ni,"wg-before-list"),Zs(Di,"wg-after-list");function p(v,x){const k=If(v,x,r);return f.before.value=k.beforeStr,f.tax.value=k.taxStr,f.after.value=k.afterStr,f.text.value=k.textStr,k}function w(v,x){ur();const k=If(v,x,r),P=fr(St)||{...Ks};gT(k,P)}const A=lr((v,x)=>w(v,x),400);f.taxRate.oninput=()=>{r=Number(f.taxRate.value)/100||0,Js(Nn,r),p("before",f.before.value),A("before",f.before.value)},f.taxRate.onchange=()=>{w("before",f.before.value)},f.before.oninput=()=>{p("before",f.before.value),A("before",f.before.value)},f.before.onchange=()=>{w("before",f.before.value),Tf(Ni,f.before.value),Zs(Ni,"wg-before-list")},f.tax.oninput=()=>{p("tax",f.tax.value),A("tax",f.tax.value)},f.tax.onchange=()=>{w("tax",f.tax.value)},f.after.oninput=()=>{p("after",f.after.value),A("after",f.after.value)},f.after.onchange=()=>{w("after",f.after.value),Tf(Di,f.after.value),Zs(Di,"wg-after-list")};const T=document.getElementById("wg-sync-manual");if(T&&(T.onclick=()=>{const v=p("before",f.before.value);w("before",v.beforeStr),T.style.transform="scale(1.2) rotate(360deg)",T.style.transition="all 0.4s",setTimeout(()=>{T.style.transform=""},400)}),[f.before,f.tax,f.after,f.text].forEach(v=>{["click","focus"].forEach(x=>v.addEventListener(x,()=>{if(!v.value)return;navigator.clipboard.writeText(v.value);const k=v.style.backgroundColor;v.style.backgroundColor="#d1e7dd",setTimeout(()=>v.style.backgroundColor=k,300)}))}),!e){const v=Array.from(n.children).filter(P=>P!==l),x=gf(n,[l],t,null,P=>{v.forEach(N=>N.style.display=P?"none":""),l.style.borderRadius=P?"8px":"0",P&&(n.style.top=window.innerHeight-(l.offsetHeight||34)+"px")}),k=fr(t);return k&&k.docked&&x.setDocked(!0),window.addEventListener("resize",()=>{x.isDocked()?n.style.top=window.innerHeight-l.offsetHeight+"px":c(n)}),x}return null}function vT(){const n=document.getElementById("vnpt-inline-calc"),e=document.getElementById("vnpt-btn-calc-toggle");let t=D.calcWidget||document.createElement("div");if(!n&&!D.calcWidget?(t.id="vnpt-calc-widget",document.body.appendChild(t),D.calcWidget=t):n&&(t=D.widget),n&&e){let r=fr(_r)??{calc:!1,data:!0};const i=s=>{n.style.display=s?"none":"block",e.classList.toggle("active",!s)};i(r.calc),e.onclick=()=>{r.calc=!r.calc,Js(_r,r),i(r.calc)}}return yT(t,n,Oc)}function _T(){let n=!1;try{n=!1}catch{n=!1}n&&xt.info("[Migration] Dev mode active - Syncing configurations...");let e=O.get(dt);if(e){let r=!1;Object.keys(Me).forEach(i=>{const s=Me[i];if(!(i in e))e[i]=s,r=!0;else if(n){const a=e[i],c=s&&typeof s=="object",l=a&&typeof a=="object";let u=!1;!c&&!l?u=a!==s:c&&l?u=a.value!==s.value||a.label!==s.label:u=!0,u&&(e[i]=s,r=!0)}}),r&&O.set(dt,e)}let t=O.get(Ve);if(t){let r=!1;Object.keys(Me).forEach(i=>{const s=Me[i],a=s&&typeof s=="object"?s.value:s,c=s&&typeof s=="object"?s.label:ve[i]||"";if(!(i in t))t[i]={label:c,value:a,sync:""},r=!0;else if(n){const l=t[i];(l.value!==a||l.label!==c)&&(t[i]={label:c,value:a,sync:l.sync||""},r=!0)}}),r&&O.setDebounced(Ve,t,0)}}const xf=["mail.google.com","outlook.live.com","outlook.office.com","outlook.office365.com"].some(n=>window.location.hostname.includes(n));let hi=null;async function lc(){if(!window.__vnptInited){window.__vnptInited=!0,xt.info("Initializing VNPT Userscript..."),_T();try{Fe.init(),Cp(),$E(),vT(),HE(),RE(),ci(),jE(),WE(),XE(),hT(),AE(),NE();const n=O.get("vnpt_last_run_version");n&&n!==Ct&&F(`🚀 Hợp đồng VNPT đã cập nhật lên v${Ct}!`,"#1a73e8"),O.set("vnpt_last_run_version",Ct),setTimeout(async()=>{sessionStorage.getItem("vnpt_update_skipped")||Fe.hasUpdate()&&(confirm(`[VNPT PRO] Đã có phiên bản mới v${Fe.info.latestVersion}.

Lời nhắn: ${Fe.info.message||"Không có mô tả."}

Bạn có muốn cập nhật ngay không?`)?Fe.info.updateUrl?window.open(Fe.info.updateUrl,"_blank"):F("Vui lòng click vào badge NEW để cập nhật!","#ea4335"):sessionStorage.setItem("vnpt_update_skipped","true"))},2e3);const e=lr(()=>{Hd(),jd(),xt.debug("DOM Cache & Labels refreshed due to mutations")},1500);hi=new MutationObserver(t=>{t.some(i=>i.addedNodes.length>0||i.removedNodes.length>0?[...i.addedNodes,...i.removedNodes].some(a=>a.nodeType===1&&!["SCRIPT","STYLE","LINK"].includes(a.tagName)):!1)&&e()}),hi.observe(document.body,{childList:!0,subtree:!0}),xt.info("Userscript initialized successfully.")}catch(n){xt.error("Error during userscript initialization:",n)}}}function bT(){xt.info("Cleaning up VNPT Userscript for reload..."),hi&&(hi.disconnect(),hi=null);const n=document.getElementById("vnpt-docx-widget");n&&n.remove();const e=document.getElementById("vnpt-calc-widget");e&&e.remove();const t=document.getElementById("vnpt-styles");t&&t.remove(),window.__vnptInited=!1,xt.info("Cleanup completed.")}window.__vnptCleanup=bT,window.__vnptInit=lc,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{xf?wf():lc()}):xf?wf():lc();function wT(){const n=O.get(sn);if(!n||n.length===0){const e={id:"hanoi_default",name:"VNPT Hà Nội (Mặc định)",data:Me};O.set(sn,[e]),O.set(Li,"hanoi_default")}}function to(){return O.get(sn)||[]}function uc(){return O.get(Li)}function hc(n){const t=to().find(r=>r.id===n);return t?(O.set(Li,n),O.set(Ve,t.data),!0):!1}function ET(n){const e=to(),t=O.get(Ve)||Me,r={id:"p_"+Date.now(),name:n,data:t};return e.push(r),O.set(sn,e),r.id}function TT(n){if(n==="hanoi_default")return!1;let e=to();return e=e.filter(t=>t.id!==n),O.set(sn,e),uc()===n&&hc("hanoi_default"),!0}function IT(n){if(!Array.isArray(n))return;O.set(sn,n);const e=uc();n.find(t=>t.id===e)||hc("hanoi_default")}const Af=Object.freeze(Object.defineProperty({__proto__:null,createProfileFromCurrent:ET,deleteProfile:TT,getActiveProfileId:uc,getProfiles:to,importProfiles:IT,initProfiles:wT,switchProfile:hc},Symbol.toStringTag,{value:"Module"}))})();
