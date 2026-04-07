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
(function(){"use strict";const U={info:(...t)=>console.log("[Tampermonkey Script] INFO:",...t),error:(...t)=>console.error("[Tampermonkey Script] ERROR:",...t),warn:(...t)=>console.warn("[Tampermonkey Script] WARN:",...t)};function Ut(){const t="vnpt-styles";if(document.getElementById(t))return;const n=document.createElement("style");n.id=t,n.textContent=`
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
            position: absolute; right: 10px; top: 10px;
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
            border-radius: var(--vnpt-radius); padding: 10px; 
            box-shadow: var(--vnpt-shadow);
            transition: width 0.2s ease, height 0.2s ease;
        }
        
        #vnpt-panel-body { display: flex; flex-direction: column; overflow: hidden; flex: 1; margin-top: 6px; border-radius: 12px; }

        #vnpt-panel-header { 
            margin: -10px -10px 0 -10px; padding: 8px 12px;
            border-bottom: 1px solid var(--vnpt-border); 
            cursor: move; user-select: none; 
            display: flex; align-items: center; justify-content: space-between; 
            background: rgba(255, 255, 255, 0.4);
            border-radius: var(--vnpt-radius) var(--vnpt-radius) 0 0;
            gap: 10px;
            position: relative;
        }
        #vnpt-panel-header::after {
            content: ""; position: absolute; bottom: -1px; left: 12px; right: 12px;
            height: 1px; background: linear-gradient(90deg, transparent, var(--vnpt-primary), transparent);
            opacity: 0.3;
        }
        #vnpt-panel-header:hover { background: rgba(255, 255, 255, 0.6); }
        
        .header-left { display: flex; align-items: center; min-width: 80px; }
        .header-center { display: flex; gap: 8px; flex: 1; justify-content: center; }
        .header-right { 
            display: flex; gap: 6px; align-items: center; 
            margin-right: 34px; /* Cách nút đóng khoảng 34px */
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
            margin-bottom: 6px; position: relative; display: flex; flex-direction: column; 
            box-shadow: inset 0 2px 10px rgba(0,0,0,0.02);
        }
        #vnpt-fields-list { flex: 1; overflow-y: auto; padding: 6px; }

        .vnpt-fields-header {
            display: flex; gap: 6px; padding: 4px 8px;
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
        .vnpt-fields-header .h-val { flex: 1; padding-left: 5px; }

        .vnpt-field-row { 
            display: flex; gap: 6px; margin-bottom: 4px; align-items: center; 
            padding: 4px; border-radius: 10px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
            flex: 1; padding: 4px 8px; border: 1px solid #dadce0; border-radius: 6px; 
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

        .vnpt-control-group { margin-bottom: 12px; }
        .vnpt-control-group label { display: block; font-weight: 700; font-size: 12px; color: #3c4043; margin-bottom: 6px; }
        .vnpt-control-group input[type="text"] { 
            width: 100%; box-sizing: border-box; padding: 8px 12px; 
            border: 1px solid #dadce0; border-radius: 8px; font-size: 12px;
            background: #fff; transition: all 0.2s;
        }
        .vnpt-control-group input[type="text"]:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1); outline: none; }

        /* ═══════════════════════════════════════════
           SECTION 4: CONTROL BUTTONS
           ═══════════════════════════════════════════ */
        .vnpt-btn-action { 
            border: none; padding: 0 12px; height: 30px; 
            display: flex; align-items: center; justify-content: center; 
            font-weight: 700; font-size: 11px; cursor: pointer; 
            border-radius: 8px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
            white-space: nowrap; box-sizing: border-box; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .vnpt-btn-action:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .vnpt-btn-action:active { transform: translateY(0) scale(0.96); }

        .vnpt-btn-icon {
            background: rgba(0,0,0,0.03); border: none; width: 30px; height: 30px;
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
            padding: 12px 0; animation: menuFadeIn 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
            transform-origin: top right;
        }
        @keyframes menuFadeIn { 
            from { opacity: 0; transform: translateY(-15px) scale(0.9); } 
            to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        .vnpt-util-menu.show { display: flex; }
        
        .util-item {
            background: none; border: none; padding: 12px 24px; width: 100%;
            text-align: left; font-size: 13px; cursor: pointer;
            color: #3c4043; font-weight: 600; transition: all 0.2s;
            display: flex; align-items: center; gap: 14px;
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
        
        .util-separator { height: 1px; background: rgba(0,0,0,0.05); margin: 8px 0; }
        .util-submenu-title { 
            padding: 10px 20px 6px 20px; font-size: 10.5px; font-weight: 800; 
            color: #1a73e8; text-transform: uppercase; letter-spacing: 1px; 
            background: rgba(26, 115, 232, 0.04); margin-bottom: 4px;
        }
        
        .size-options { display: flex; padding: 10px 18px 12px 18px; gap: 8px; }
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
        .vnpt-resizer:hover { background: rgba(26, 115, 232, 0.2); border-radius: 50%; }

        /* ═══════════════════════════════════════════
           SECTION 5: TEMPLATE MANAGER
           ═══════════════════════════════════════════ */
        #vnpt-template-section { border-top: 1px solid var(--vnpt-border); margin-top: 8px; padding-top: 10px; }
        
        .bottom-export-row { 
            display: flex; gap: 8px; align-items: flex-end; 
            border-top: 1px solid var(--vnpt-border); 
            margin: 8px -12px -12px -12px; padding: 12px;
            background: rgba(248, 249, 250, 0.5);
            border-radius: 0 0 var(--vnpt-radius) var(--vnpt-radius);
        }
        .bottom-export-row .vnpt-control-group { margin-bottom: 0; flex: 1; min-width: 0; }
        .bottom-export-row .vnpt-control-group input[type="text"] { height: 32px; padding: 6px 10px; }
        .bottom-export-row .btn-export { flex: 0 0 auto; height: 32px; margin: 0; border-radius: 8px; }

        .text-hint { font-size: 11px; color: #70757a; font-style: italic; text-align: center; margin-bottom: 8px; }

        #vnpt-fields-list::-webkit-scrollbar { width: 6px; }
        #vnpt-fields-list::-webkit-scrollbar-track { background: transparent; }
        #vnpt-fields-list::-webkit-scrollbar-thumb { background: #dadce0; border-radius: 10px; }
        #vnpt-fields-list::-webkit-scrollbar-thumb:hover { background: #bdc1c6; }

        /* ═══════════════════════════════════════════
           SECTION 6: INLINE CALC (Premium Layout)
           ═══════════════════════════════════════════ */
        #vnpt-inline-calc { 
            background: rgba(255, 255, 255, 0.3); 
            padding: 6px 10px; 
            border-bottom: 1px solid var(--vnpt-border);
            display: block;
        }
        .cw-body-inline { display: flex; flex-direction: column; gap: 6px; }
        .cw-inline-row { display: flex; align-items: center; gap: 6px; width: 100%; box-sizing: border-box; }
        .cw-input-inline { 
            flex: 1; min-width: 60px; padding: 4px 10px; border: 1px solid #dadce0; border-radius: 8px; 
            font-size: 11.5px; font-weight: 600; height: 28px; box-sizing: border-box;
            background: #fff; transition: all 0.2s;
        }
        .cw-input-inline:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 3px var(--vnpt-primary-light); outline: none; }
        .cw-input-readonly-inline { background-color: rgba(30, 142, 62, 0.05); color: var(--vnpt-success); cursor: default; flex: 1.5; border-color: rgba(30, 142, 62, 0.2); }
        
        .cw-tax-group-inline { position: relative; display: flex; align-items: center; flex: 0 0 auto; min-width: 45px; }
        .cw-tax-input-inline { width: 45px; padding: 4px 18px 4px 8px; border: 1px solid #dadce0; border-radius: 6px; font-size: 11px; text-align: right; height: 28px; }
        .cw-tax-symbol { position: absolute; right: 6px; color: #5f6368; font-size: 9px; font-weight: bold; pointer-events: none; }

        .cw-map-dropdown-container { position: relative; flex-shrink: 0; }
        .cw-map-btn-inline { background: #fff; border: 1px solid #dadce0; border-radius: 6px; cursor: pointer; height: 30px; width: 30px; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: all 0.2s; color: #5f6368; }
        .cw-map-btn-inline:hover { background: #f8f9fa; color: var(--vnpt-primary); border-color: var(--vnpt-primary); }

        .cw-map-wrap-popup { 
            position: absolute; right: 0; top: 35px; z-index: 1000;
            background: var(--vnpt-bg-glass);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.4);
            border-radius: 16px;
            box-shadow: 0 15px 45px rgba(0,0,0,0.15); 
            width: 280px;
            padding: 12px 0; display: none; flex-direction: column; 
            animation: menuFadeIn 0.25s cubic-bezier(0.165, 0.84, 0.44, 1);
            transform-origin: top right;
        }
        
        .cw-row { 
            display: flex; align-items: center; gap: 10px; 
            justify-content: space-between; padding: 6px 18px;
            transition: background 0.2s;
        }
        .cw-row:hover { background: rgba(255, 255, 255, 0.5); }
        
        .cw-map-label { font-size: 12px; font-weight: 700; color: #3c4043; white-space: nowrap; flex: 0 0 75px; }
        .cw-map-input { 
            flex: 1; padding: 6px 10px; border: 1px solid #dadce0; border-radius: 8px; 
            font-size: 11px; width: 100%; transition: all 0.2s; background: #fff;
        }
        .cw-map-input:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 2px rgba(26,115,232,0.1); outline: none; }
        .cw-map-hint { font-size: 10px; color: #70757a; margin-top: 6px; line-height: 1.4; text-align: center; padding: 0 18px; }

        .cw-map-separator { height: 1px; background: var(--vnpt-border); margin: 8px 0; }
        
        .cw-map-actions { display: flex; flex-direction: column; gap: 4px; padding: 0 10px; }
        .cw-map-actions .vnpt-btn-action { 
            justify-content: flex-start; width: 100%; padding: 0 12px; 
            background: transparent; color: #3c4043; border-radius: 8px;
            height: 34px; font-size: 12px;
        }
        .cw-map-actions .vnpt-btn-action:hover { background: #f1f3f4; color: var(--vnpt-primary); }
        .cw-map-actions .btn-reset-default { color: var(--vnpt-danger); font-weight: 800; }
        .cw-map-actions .btn-reset-default:hover { background: #fff5f5; color: var(--vnpt-danger); border-left: 3px solid var(--vnpt-danger); padding-left: 15px; }

        .btn-calc-toggle { background: rgba(26, 115, 232, 0.08); color: var(--vnpt-primary); }
        .btn-calc-toggle:hover { background: rgba(26, 115, 232, 0.15); }
        .btn-calc-toggle.active { background: var(--vnpt-primary); color: #fff; box-shadow: 0 4px 10px rgba(26, 115, 232, 0.3); }

        .btn-more.active { background: rgba(0,0,0,0.1); }

    `,document.head.appendChild(n)}const jt={widget:null,panel:null,header:null,bannerArea:null,toggleBtn:null,fieldsContainer:null,panelBody:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1,templateBuffer:null,templateName:null,hasDragged:!1},X=new Map,s=new Proxy(jt,{get(t,n){return n==="on"?(o,a)=>{X.has(o)||X.set(o,[]),X.get(o).push(a)}:t[n]},set(t,n,o){const a=t[n];return t[n]=o,a!==o&&X.has(n)&&X.get(n).forEach(e=>e(o,a)),!0}}),L={tenDaiDienn:"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT",emailDaiDien:"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Số GPKD | MST",goiDV:"Gói Dịch Vụ",ngayKy:"Ngày ký",thangKy:"Tháng Ký",namKy:"Năm ký",soHopDong:"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký"},Bt=["soHopDong","tenDaiDienn","cmnd","sdt","diaChi","tenToChuc","ngayCapCustomer","emailDaiDien","soDkdn","goiDV","soHopDong"],rt="vnpt_docx_fields",vt="vnpt_docx_default_fields",Y="vnpt_docx_position",lt="vnpt_docx_size",xt="vnpt_docx_opened",j="vnpt_autofill_data_default",$="vnpt_autofill_data_custom",R="vnpt_autofill_data_sync",$t="vnpt_widget_pos",Q="vnd_tax_rate",yt="vnd_before_history",wt="vnd_after_history",st="vnpt_widget_collapsed",J="vnd_calc_map",Z="vnpt_widget_datatab",ct="vnpt_templates";let M=null;function k(t,n="#198754",o=2500){M||(M=document.createElement("div"),M.id="vnpt-toast-container",Object.assign(M.style,{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column-reverse",alignItems:"center",gap:"8px",zIndex:"1000000",pointerEvents:"none"}),document.body.appendChild(M));const a=document.createElement("div");a.innerText=t,Object.assign(a.style,{background:n,color:"#fff",padding:"8px 18px",borderRadius:"24px",opacity:"0",transform:"translateY(10px)",transition:"opacity 0.3s, transform 0.3s",fontSize:"13px",fontWeight:"500",fontFamily:"'Segoe UI', Roboto, sans-serif",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",whiteSpace:"nowrap",pointerEvents:"auto"}),M.appendChild(a),requestAnimationFrame(()=>{a.style.opacity="1",a.style.transform="translateY(0)"}),setTimeout(()=>{a.style.opacity="0",a.style.transform="translateY(-10px)",setTimeout(()=>{a.remove(),M&&M.childNodes.length},300)},o)}const Gt="vnpt_templates_db",O="buffers";let dt=null;function Et(){return dt?Promise.resolve(dt):new Promise((t,n)=>{const o=indexedDB.open(Gt,1);o.onupgradeneeded=a=>{const e=a.target.result;e.objectStoreNames.contains(O)||e.createObjectStore(O)},o.onsuccess=a=>{dt=a.target.result,t(dt)},o.onerror=()=>n(o.error)})}async function Wt(t,n){const o=await Et();return new Promise((a,e)=>{const i=o.transaction(O,"readwrite").objectStore(O).put(n,t);i.onsuccess=()=>a(),i.onerror=()=>e(i.error)})}async function Xt(t){const n=await Et();return new Promise((o,a)=>{const l=n.transaction(O,"readonly").objectStore(O).get(t);l.onsuccess=()=>o(l.result),l.onerror=()=>a(l.error)})}async function Yt(t){const n=await Et();return new Promise((o,a)=>{const l=n.transaction(O,"readwrite").objectStore(O).delete(t);l.onsuccess=()=>o(),l.onerror=()=>a(l.error)})}const F=new Map,pt=new Map,h={isGM:typeof GM_setValue<"u"&&typeof GM_getValue<"u",get(t,n=null){if(F.has(t))return F.get(t);try{let o;if(this.isGM?o=GM_getValue(t,null):o=localStorage.getItem(t),o==null)return n;const a=typeof o=="string"?JSON.parse(o):o;return F.set(t,a),a}catch(o){return console.warn(`[Storage] Không thể đọc key "${t}":`,o),n}},set(t,n){F.set(t,n);try{return this.isGM?GM_setValue(t,n):localStorage.setItem(t,JSON.stringify(n)),!0}catch(o){return console.error(`[Storage] Không thể ghi key "${t}":`,o),!1}},setDebounced(t,n,o=500){F.set(t,n),pt.has(t)&&clearTimeout(pt.get(t));const a=setTimeout(()=>{this.set(t,n),pt.delete(t)},o);pt.set(t,a)},remove(t){F.delete(t);try{this.isGM?GM_deleteValue(t):localStorage.removeItem(t)}catch(n){console.error(`[Storage] Không thể xóa key "${t}":`,n)}},clearCache(){F.clear()}};function tt(){try{const t=h.get(ct)||[],n=t.filter(o=>o.type!=="local");return n.length!==t.length&&et(n),n}catch{return[]}}function et(t){h.set(ct,t)}function Qt(t){const n=t.match(/drive\.google\.com\/file\/d\/([^/]+)/);return n?`https://drive.google.com/uc?export=download&id=${n[1]}`:t}function Jt(t){return new Promise((n,o)=>{GM_xmlhttpRequest({method:"GET",url:Qt(t),responseType:"arraybuffer",onload:a=>{if(a.status>=200&&a.status<300){if(a.response&&a.response.byteLength>4){const e=new Uint8Array(a.response.slice(0,4));if(e[0]===80&&e[1]===75&&e[2]===3&&e[3]===4){n(a.response);return}else{o(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}n(a.response)}else o(new Error(`HTTP ${a.status}: Không lấy được file`))},onerror:()=>o(new Error("Không thể tải URL.")),ontimeout:()=>o(new Error("Timeout khi tải URL."))})})}async function Zt(t,n,o){const a=t.name.replace(/\.docx$/i,""),e=prompt("Đặt tên biến nhớ cho file này:",a);if(!(!e||!e.trim()))try{const c=await t.arrayBuffer();await Wt(e.trim(),c);const i=tt().filter(r=>r.name!==e.trim()&&r.fileName!==t.name);i.unshift({name:e.trim(),type:"local_idb",fileName:t.name,lastUsed:Date.now()}),et(i),H(n,o),o&&o(c,e.trim())}catch(c){k(`❌ Lỗi lưu file: ${c.message}`,"#dc3545")}}function H(t,n,o=null){let a=t.querySelector(".vnpt-template-manager-inner"),e,c;if(a)e=a.querySelector(".vnpt-local-list-container"),c=a.querySelector(".vnpt-btn-wrap");else{t.innerHTML="",a=document.createElement("div"),a.className="vnpt-template-manager-inner";const r=document.createElement("div");r.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const p=document.createElement("span");p.className="vnpt-title-main",p.style.cssText="font-size:11px;font-weight:700;color:#444;",c=document.createElement("div"),c.className="vnpt-btn-wrap",c.style.cssText="display:flex;gap:4px;",r.appendChild(p),r.appendChild(c),a.appendChild(r),e=document.createElement("div"),e.className="vnpt-local-list-container",e.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",a.appendChild(e),t.appendChild(a)}const l=tt(),i=a.querySelector(".vnpt-title-main");i.innerHTML="Templates"+(o?` <span style="color:#2e7d32;">(Đang dùng: ${o})</span>`:""),l.length===0?e.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':e.innerHTML="",l.forEach((r,p)=>{const u=document.createElement("div");u.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",u.title=r.fileName||r.url||r.name,u.tabIndex=0,u.onfocus=()=>u.style.boxShadow="0 0 0 2px #28a745",u.onblur=()=>u.style.boxShadow="none";const d=r.type==="local"||r.type==="local_base64"||r.type==="local_idb"?"OFF":"ON",x=d==="OFF"?"#6c757d":"#28a745",w=document.createElement("span");w.textContent=d,w.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${x};color:#fff;`;const v=document.createElement("span");v.textContent=r.name,v.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",u.onclick=()=>{u.focus(),te(r,n,o,t)},u.appendChild(w),u.appendChild(v);const E=document.createElement("button");E.innerHTML="✎",E.title="Đổi tên template",E.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",E.onclick=m=>{m.stopPropagation();const g=prompt("Đổi tên template:",r.name);if(g&&g.trim()&&g.trim()!==r.name){const y=tt();y[p].name=g.trim(),et(y),H(t,n,o)}},u.appendChild(E);const f=document.createElement("button");f.innerHTML="✕",f.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",f.onclick=async m=>{if(m.stopPropagation(),confirm(`Xoá biểu mẫu "${r.name}"?`)){const g=tt();g.splice(p,1),et(g),r.type==="local_idb"&&await Yt(r.name).catch(()=>null),H(t,n,o===r.name?null:o)}},u.appendChild(f),e.appendChild(u)})}function te(t,n,o,a){const e=tt(),c=e.find(l=>l.name===t.name&&(l.url===t.url||l.type===t.type));if(c&&(c.lastUsed=Date.now(),et(e)),t.type==="local_idb"){Xt(t.name).then(l=>{if(!l)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");n&&n(l,t.name),H(a,n,t.name)}).catch(l=>{k(`❌ Lỗi nạp File IDB: ${l.message}`,"#dc3545")});return}if(t.type==="local_base64"&&t.data){try{const l=window.atob(t.data.split(",")[1]),i=l.length,r=new Uint8Array(i);for(let p=0;p<i;p++)r[p]=l.charCodeAt(p);n&&n(r.buffer,t.name),H(a,n,t.name)}catch(l){k(`❌ Lỗi nạp Base64: ${l.message}`,"#dc3545")}return}Jt(t.url).then(l=>{n&&n(l,t.name),H(a,n,t.name)}).catch(l=>{k(`❌ ${l.message}`,"#dc3545")})}const P=new Map;function ee(){P.clear()}function ne(t){t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}))}function nt(t,n){var e;const o=t.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,a=(e=Object.getOwnPropertyDescriptor(o,"value"))==null?void 0:e.set;a?a.call(t,n):t.value=n,ne(t)}function ut(t){if(!t)return null;const n=P.get(t);if(n&&document.contains(n))return n;const o=document.getElementById(t);if(o&&(o.tagName==="INPUT"||o.tagName==="TEXTAREA"))return P.set(t,o),o;const a=`input[id="${t}"], textarea[id="${t}"], input[name="${t}"], textarea[name="${t}"], input[formcontrolname="${t}"], textarea[formcontrolname="${t}"], input[placeholder="${t}"], textarea[placeholder="${t}"]`,e=document.querySelector(a);if(e)return P.set(t,e),e;for(const c of document.querySelectorAll("label"))if(c.textContent.trim()===t){let l=null;if(c.htmlFor&&(l=document.getElementById(c.htmlFor)),!l){let i=c.parentElement;for(;i;){const r=i.querySelector("input,textarea");if(r){l=r;break}if(i=i.parentElement,(i==null?void 0:i.tagName)==="FORM")break}}if(l)return P.set(t,l),l}return null}function ft(t){if(!t)return null;const n=P.get(`lbl:${t}`);if(n&&document.contains(n))return n;for(const o of document.querySelectorAll("label"))if(o.innerText.trim()===t){const a=o.parentElement.querySelector("input, textarea");if(a)return P.set(`lbl:${t}`,a),a}return null}function K(t,n){const o=ut(t)||ft(t);o&&nt(o,n)}function oe(t=new Date){return String(t.getDate()).padStart(2,"0")}function ae(t=new Date){return String(t.getMonth()+1).padStart(2,"0")}function ie(t=new Date){return String(t.getFullYear())}function Dt(){const t=new Date;return{ngay:oe(t),thang:ae(t),nam:ie(t)}}const{ngay:It,thang:At,nam:_t}=Dt(),V={ngayKy:{label:"Ngày ký",value:It},"thangKy, thangKy1":{label:"Tháng ký",value:At},"namKy, namKy1":{label:"Năm ký",value:_t},"ngayTiepNhan, ngayThangNamKy":{label:"Ngày ký (full)",value:`${It}/${At}/${_t}`},tenDoanhNghiepB:{label:"Tên doanh nghiệp B",value:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM"},diaChiB:{label:"Địa chỉ B",value:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội"},maSoThueB:{label:"Mã số thuế B",value:"0100686223"},stkB:{label:"Số tài khoản B",value:"1600114156"},diaChiStkB:{label:"Ngân hàng/Địa chỉ STK B",value:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)"},"tenB, nguoiDaiDienB":{label:"Người đại diện B",value:"Phạm Khánh Chung"},"chucVuB, chucVuDaiDienB":{label:"Chức vụ B",value:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp"},"giayUyQuyenSoB, soGiayUyQuyenB":{label:"Giấy ủy quyền số B",value:"2628/GUQ-VNPT-HNI-VP"},"giayUyQuyenNgayB, ngayGiayUyQuyenB":{label:"Giấy ủy quyền ngày B",value:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},GiayUyQuyenB:{label:"Giấy ủy quyền B (full)",value:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},tenDoanhNghiepB1:{label:"Tên doanh nghiệp B (phụ)",value:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},donViTiepNhan:{label:"Đơn vị tiếp nhận",value:"TTKD KHDN"},"tenTiepNhan, tenNguoiNhan":{label:"Người tiếp nhận",value:"Bùi Anh"},dienThoaiB:{label:"Điện thoại B",value:"02436686868"},diaChiTaiKhoanB:{label:"Địa chỉ tài khoản B",value:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 "},noiKy:{label:"Nơi ký",value:"Hà Nội"},emailB:{label:"Email B",value:""},"lienheHopDongB, lienheTuVanB, lienheHoaDonB, sucoCap1B, sucoCap2B, sucoCap3B, sucoCap4B":{label:"Liên hệ B (AM)",value:"AM Bùi Anh"}},Mt={soHopDong:"inputContractGroupName, contractName"},re={after:["cuocDV","tongCong","tongCongHD","congCA","giaTriHopDong","tongGIaTriHopDong"],before:["donGiaCA","thanhTienCA","tongThanhTien","tongCuocTruocThue"],tax:["tongThueGTGT","tongThue","thueCA","thueVAT"],text:["soTienThanhToanBangChu","tongCongBangChu","tongCongHDbangChu","ghiChuGiaTriHopDong","tongGiaTriHopDongBangChu"]},le=.08;function Ot(t,n){let o;return function(...e){const c=()=>{clearTimeout(o),t(...e)};clearTimeout(o),o=setTimeout(c,n)}}function Ht(){const t=h.get(j)??{...V},n=h.get($)??{},o={...t,...n};Object.keys(o).forEach(a=>{const e=o[a],c=e&&typeof e=="object"&&e.hasOwnProperty("value")?e.value:e;a.split(",").map(i=>i.trim()).filter(i=>i).forEach(i=>{let r=ut(i)||ft(i);r&&nt(r,c)})}),k("✅ Auto fill complete")}function se(){let t=h.get(R)??{};const n={...Mt,...t},o=Object.keys(n);if(o.length===0){k("⚠️ No sync mapping","#ffc107");return}o.forEach(a=>{let e=ut(a)||ft(a);e&&e.value!==void 0&&e.value!==""&&n[a].split(",").map(l=>l.trim()).filter(l=>l).forEach(l=>K(l,e.value))}),k("✅ Sync form complete","#d39e00")}let Ct=!1;const ce=(t,n)=>{var r;if(Ct)return;let o=h.get(R)??{};const a={...Mt,...o};if(Object.keys(a).length===0)return;let e=t.id,c=t.name,l=null;if(e){const p=document.querySelector(`label[for="${e}"]`);p&&(l=p.textContent.trim())}if(!l){const p=t.closest("label");p&&(l=(r=Array.from(p.childNodes).find(u=>u.nodeType===3))==null?void 0:r.textContent.trim())}let i=a[e]||a[c]||a[l];if(i){Ct=!0;try{i.split(",").map(u=>u.trim()).filter(u=>u).forEach(u=>{if(u!==e&&u!==c&&u!==l){const d=ut(u)||ft(u);d&&document.activeElement!==d&&nt(d,n)}})}finally{Ct=!1}}},de=Ot((t,n)=>{ce(t,n)},250);function pe(){document.addEventListener("input",t=>{const n=t.target;!n||!["INPUT","TEXTAREA"].includes(n.tagName)||n.closest("#vnpt-docx-widget")||n.closest("#vnpt-inline-calc")||de(n,n.value)})}function B(t,n,o=null,a=""){const e=s.fieldsContainer.querySelector(".text-hint");e&&e.remove();const c=s.fieldsContainer.querySelectorAll(".f-key");let l=!1;for(let i of c)if(i.value.split(",")[0].trim()===t){const p=i.closest(".vnpt-field-row"),u=p.querySelector(".f-val"),d=p.querySelector(".f-label");n!==""&&u.value!==n&&document.activeElement!==u&&(u.value=n),o!==null&&o!==""&&d.value!==o&&document.activeElement!==d&&(d.value=o),a!==""&&i.value!==t+", "+a&&document.activeElement!==i&&(i.value=t+", "+a),l=!0;break}if(!l){(o===null||o==="")&&(o=L[t]||"");const i=document.createElement("div");i.className="vnpt-field-row row-item",i.setAttribute("draggable","false");let r=t;a&&(r+=", "+a),i.innerHTML=`
            <input type="checkbox" class="row-chk" title="Chọn" style="margin: 0 2px 0 2px;" />
            <input type="text" class="f-label" value="${o}" />
            <input type="text" class="f-key" value="${r}" title="Biến DOCX và IDs đồng bộ" />
            <span class="row-drag-handle" title="Kéo">=</span>
            <input type="text" class="f-val" value="${n}" />
        `;const p=i.querySelector(".f-val"),u=i.querySelector(".f-key");t==="tenToChuc"&&(p.style.textAlign="right");const d=()=>{Bt.includes(t)&&(p.value.trim()?p.classList.remove("field-required-empty"):p.classList.add("field-required-empty"))},x=()=>{const v=p.value;u.value.split(",").map(f=>f.trim()).filter(f=>f).forEach(f=>K(f,v))};u.addEventListener("input",function(){D();const v=this.value.split(",")[0].trim();p.style.textAlign=v==="tenToChuc"?"right":"",x()}),i.querySelector(".f-label").addEventListener("input",D),p.addEventListener("input",function(){D(),x(),d()}),d();const w=i.querySelector(".row-drag-handle");w.addEventListener("mouseenter",()=>i.setAttribute("draggable","true")),w.addEventListener("mouseleave",()=>{i.classList.contains("dragging")||i.setAttribute("draggable","false")}),i.addEventListener("dragstart",function(v){s.draggedRowForVNPT=this,v.dataTransfer.effectAllowed="move",v.dataTransfer.setData("text/plain",t),this.classList.add("dragging")}),i.addEventListener("dragover",v=>(v.preventDefault(),!1)),i.addEventListener("dragenter",function(){this.classList.add("over")}),i.addEventListener("dragleave",function(){this.classList.remove("over")}),i.addEventListener("drop",function(v){if(v.stopPropagation(),s.draggedRowForVNPT&&s.draggedRowForVNPT!==this){const E=Array.from(s.fieldsContainer.querySelectorAll(".vnpt-field-row")),f=E.indexOf(s.draggedRowForVNPT),m=E.indexOf(this);f<m?this.parentNode.insertBefore(s.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(s.draggedRowForVNPT,this),D()}return!1}),i.addEventListener("dragend",function(){this.setAttribute("draggable","false"),s.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(v=>{v.classList.remove("over","dragging")}),s.draggedRowForVNPT=null}),s.fieldsContainer.appendChild(i),s.fieldsContainer.scrollTop=s.fieldsContainer.scrollHeight}}function D(){const t=s.isDefaultMode?vt:rt,n={};s.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(a=>{const c=a.querySelector(".f-key").value.trim().split(",").map(u=>u.trim()).filter(u=>u),l=c[0],i=c.slice(1).join(", "),r=a.querySelector(".f-label").value.trim(),p=a.querySelector(".f-val").value;l&&(n[l]={label:r,value:p,sync:i})}),h.setDebounced(t,n,1e3)}function kt(){try{s.fieldsContainer.innerHTML="";const n=h.get(rt)||{};Object.keys(L).forEach(o=>{const a=L[o],e=n[o];e&&typeof e=="object"?B(o,e.value,e.label||a,e.sync||""):e?B(o,e,a,""):B(o,"",a,"")}),Object.keys(n).forEach(o=>{if(!(o in L)){const a=n[o];typeof a=="object"?B(o,a.value,a.label,a.sync||""):B(o,a,"","")}}),Object.keys(L).length===0&&Object.keys(n).length===0&&(s.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(n){console.error("Error loading config:",n),Object.keys(L).forEach(o=>B(o,"",L[o]))}const t=h.get(Y);t&&s.widget&&(s.widget.style.bottom="auto",t.right?(s.widget.style.right=t.right,s.widget.style.left="auto"):t.left&&(s.widget.style.left=t.left,s.widget.style.right="auto"),t.top&&(s.widget.style.top=t.top))}function ue(){document.getElementById("vnpt-btn-toggle-id").onclick=()=>s.fieldsContainer.classList.toggle("show-ids"),document.getElementById("vnpt-btn-default").onclick=()=>{s.isDefaultMode=!s.isDefaultMode},s.on("isDefaultMode",t=>zt(t)),document.getElementById("vnpt-btn-reset-default").onclick=()=>{confirm("Khôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?")&&(h.remove(vt),h.remove(J),h.remove(Q),s.isDefaultMode&&(zt(!0),k("🔄 Đã khôi phục dữ liệu gốc","#1a73e8")))},document.getElementById("vnpt-btn-batch-del").onclick=()=>{const t=s.fieldsContainer.querySelectorAll(".vnpt-field-row");let n=0;t.forEach(o=>{var a;(a=o.querySelector(".row-chk"))!=null&&a.checked&&(o.remove(),n++)}),n===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(t.forEach(o=>o.remove()),k("🗑️ Đã xóa toàn bộ","#ff5252"),D()):(k(`🗑️ Đã xóa ${n} trường`,"#ff5252"),D())},document.getElementById("vnpt-btn-add").onclick=()=>{const t=s.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;B("bien_moi_"+t,"","",""),D()},document.getElementById("vnpt-btn-fill-back").onclick=()=>{Ht();let t=0;s.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(n=>{const o=n.querySelector(".f-key").value.trim(),a=n.querySelector(".f-val").value;o.split(",").map(e=>e.trim()).filter(Boolean).forEach(e=>{(document.getElementById(e)||document.getElementsByName(e)[0])&&(K(e,a),t++)})}),t>0?k(`✅ Đã điền ngược ${t} trường`,"#198754"):k("⚠️ Không khớp trường nào","#ffc107")}}function zt(t){const n=document.getElementById("vnpt-btn-default"),o=document.getElementById("vnpt-btn-reset-default");if(s.fieldsContainer.innerHTML="",s.bannerArea.innerHTML="",t){n.classList.add("active"),n.innerHTML="✅ Chế độ: Dữ liệu mặc định",o&&(o.style.display="flex"),s.fieldsContainer.classList.add("vnpt-mode-default"),k("📌 Chế độ Dữ liệu mặc định (Có thể sửa)","#ea4335");const a=document.createElement("div");a.className="vnpt-default-banner",a.innerHTML="<span> Lưu ý: đây là Dữ liệu mặc định (Có thể sửa/lưu)</span>",s.bannerArea.appendChild(a);const e=h.get(vt);e===null?Object.keys(V).forEach(c=>{const l=V[c],i=l&&typeof l=="object"?l.value:l,r=l&&typeof l=="object"?l.label:L[c]||"";B(c,i,r)}):Object.keys(e).forEach(c=>{const l=e[c];B(c,l.value,l.label,l.sync||"")})}else n.classList.remove("active"),n.innerHTML="🛠 Dữ liệu mặc định VNPT",o&&(o.style.display="none"),s.fieldsContainer.classList.remove("vnpt-mode-default"),k("📋 Đã quay lại Dữ liệu cá nhân"),kt()}function fe(){const t={version:"1.0",timestamp:Date.now(),fields:h.get(rt)||{},templates:h.get(ct)||[],position:h.get(Y)||null,size:h.get(lt)||null,calc:{default:h.get(j)||null,custom:h.get($)||null,sync:h.get(R)||null,map:h.get(J)||{},taxRate:Number(h.get(Q))||.08}},n=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),o=URL.createObjectURL(n),a=document.createElement("a");a.href=o,a.download=`vnpt_config_${new Date().toISOString().slice(0,10)}.json`,a.click(),URL.revokeObjectURL(o),k("📤 Đã xuất cấu hình JSON")}function ge(){const t=document.createElement("input");t.type="file",t.accept=".json",t.onchange=async n=>{const o=n.target.files[0];if(o)try{const a=await o.text(),e=JSON.parse(a);if(!e.fields&&!e.calc)throw new Error("Định dạng file không hợp lệ!");e.fields&&h.set(rt,e.fields),e.templates&&h.set(ct,e.templates),e.position&&h.set(Y,e.position),e.size&&h.set(lt,e.size),e.calc&&(e.calc.default&&h.set(j,e.calc.default),e.calc.custom&&h.set($,e.calc.custom),e.calc.sync&&h.set(R,e.calc.sync),e.calc.map&&h.set(J,e.calc.map),e.calc.taxRate!==void 0&&h.set(Q,e.calc.taxRate)),await kt();const c=document.getElementById("vnpt-calc-widget");if(c){const i=document.getElementById("wg-taxRate");i&&e.calc&&e.calc.taxRate!==void 0&&(i.value=e.calc.taxRate*100),e.calc&&e.calc.map&&c.querySelectorAll("input[data-clink]").forEach(r=>{const p=r.dataset.clink;e.calc.map[p]&&(r.value=(e.calc.map[p]||[]).join(", "))})}const l=document.getElementById("vnpt-template-manager");l&&H(l,(i,r)=>{AppState.templateBuffer=i,AppState.templateName=r}),e.position&&AppState.widget&&(e.position.right?(AppState.widget.style.right=e.position.right,AppState.widget.style.left="auto"):e.position.left&&(AppState.widget.style.left=e.position.left,AppState.widget.style.right="auto"),e.position.top&&(AppState.widget.style.top=e.position.top),AppState.widget.style.bottom="auto"),e.size&&AppState.panel&&(AppState.panel.style.width=e.size.width+"px",AppState.panel.style.height=e.size.height+"px"),k("✅ Nhập cấu hình thành công!")}catch(a){console.error("Lỗi Import:",a),alert("Lỗi: "+a.message)}},t.click()}function he(){const t=document.getElementById("vnpt-docx-widget")||document.createElement("div");t.id="vnpt-docx-widget";const n=h.get(xt)===!0;t.innerHTML=`
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
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-scan" title="Lấy data theo biểu mẫu web">Quét dữ liệu</button>
                    <button class="vnpt-btn-action btn-fill-back" id="vnpt-btn-fill-back" title="Điền dữ liệu ngược lên web">Điền web</button>
                </div>
                <div class="header-right">
                    <button class="vnpt-btn-icon btn-add" id="vnpt-btn-add" title="Chèn thêm trường trống">✚</button>
                    <button class="vnpt-btn-icon btn-clean" id="vnpt-btn-batch-del" title="Xóa chọn / Xóa tất cả">🗑</button>
                    
                    <div class="vnpt-util-dropdown">
                        <button class="vnpt-btn-icon btn-more" id="vnpt-btn-more" title="Thêm công cụ">⚙️</button>
                        <div class="vnpt-util-menu" id="vnpt-util-menu">
                            <div class="util-submenu-title">Cấu hình hệ thống</div>
                            <button class="util-item" id="vnpt-btn-default">🛠 Dữ liệu mặc định VNPT</button>
                            <button class="util-item danger" id="vnpt-btn-reset-default" style="display: none;">🔄 Khôi phục dữ liệu gốc</button>
                            <button class="util-item" id="vnpt-btn-toggle-id">🆔 Hiện/Ẩn Mã ID (Nhập code)</button>
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

                <!-- Template Manager -->
                <div id="vnpt-template-section">
                    <div id="vnpt-template-manager"></div>
                </div>

                <div class="bottom-export-row">
                    <div class="vnpt-control-group" id="vnpt-local-file-group">
                        <input type="file" id="vnpt-template-file" accept=".docx" title="Hoặc sử dụng File nội bộ từ máy" />
                    </div>
                    <div class="vnpt-control-group">
                        <input type="text" id="vnpt-export-filename" value="Export_Auto.docx" title="Tên file DOCX khi xuất" />
                    </div>
                    <button class="vnpt-btn-action btn-export" id="vnpt-btn-export" title="Xuất ra file DOCX">🖨️ XUẤT FILE</button>
                </div>
            </div>
        </div>
    `,document.body.appendChild(t),s.widget=t,s.panel=document.getElementById("vnpt-export-panel"),s.toggleBtn=document.getElementById("vnpt-toggle-btn"),s.header=document.getElementById("vnpt-panel-header"),s.bannerArea=document.getElementById("vnpt-banner-area"),s.fieldsContainer=document.getElementById("vnpt-fields-list");try{const i=h.get(lt);i&&i.width&&i.height&&(s.panel.style.width=i.width+"px",s.panel.style.height=i.height+"px")}catch(i){console.error("Lỗi load size panel:",i)}new ResizeObserver(i=>{if(s.panel.style.display!=="none")for(let r of i){const{width:p,height:u}=r.contentRect;p>0&&u>0&&h.setDebounced(lt,{width:Math.round(p+20),height:Math.round(u+20)},1e3)}}).observe(s.panel),s.panelBody=document.getElementById("vnpt-panel-body"),H(document.getElementById("vnpt-template-manager"),(i,r)=>{s.templateBuffer=i,s.templateName=r}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const i=this.files&&this.files[0];if(!i)return;const r=document.getElementById("vnpt-template-manager");Zt(i,r,(p,u)=>{s.templateBuffer=p,s.templateName=u}),this.value=""}),s.toggleBtn.addEventListener("click",i=>{s.hasDragged||(s.panel.style.display==="none"?(s.panel.style.display="flex",s.toggleBtn.className="btn-opened",s.toggleBtn.innerHTML="✖",h.set(xt,!0)):(s.panel.style.display="none",s.toggleBtn.className="btn-closed",s.toggleBtn.innerHTML="📄",h.set(xt,!1)))});const a=document.getElementById("vnpt-btn-more"),e=document.getElementById("vnpt-util-menu"),c={S:{width:"320px",height:"380px"},M:{width:"440px",height:"600px"},L:{width:"600px",height:"800px"},Full:{width:"98vw",height:"92vh"}};a.addEventListener("click",i=>{i.stopPropagation(),e.classList.toggle("show"),a.classList.toggle("active")}),document.addEventListener("click",()=>{e.classList.remove("show"),a.classList.remove("active")}),e.querySelectorAll(".size-options button").forEach(i=>{i.addEventListener("click",r=>{const p=r.target.getAttribute("data-size"),u=c[p];u&&(s.panel.style.width=u.width,s.panel.style.height=u.height),e.classList.remove("show"),a.classList.remove("active")})}),s.panel.querySelectorAll(".vnpt-resizer").forEach(i=>{i.addEventListener("mousedown",r=>{r.preventDefault(),r.stopPropagation();const p=r.clientX,u=r.clientY,d=s.panel.offsetWidth,x=s.panel.offsetHeight,w=s.widget.getBoundingClientRect(),v=w.top,E=window.innerWidth-w.right,f=g=>{const y=g.clientX-p,C=g.clientY-u;if(i.classList.contains("br"))s.panel.style.width=d+y+"px",s.panel.style.height=x+C+"px";else if(i.classList.contains("bl")){const b=d-y;b>300&&(s.panel.style.width=b+"px",s.widget.style.right=E+y+"px"),s.panel.style.height=x+C+"px"}else if(i.classList.contains("tr")){s.panel.style.width=d+y+"px";const b=x-C;b>150&&(s.panel.style.height=b+"px",s.widget.style.top=v+C+"px")}else if(i.classList.contains("tl")){const b=d-y,S=x-C;b>300&&(s.panel.style.width=b+"px",s.widget.style.right=E+y+"px"),S>150&&(s.panel.style.height=S+"px",s.widget.style.top=v+C+"px")}},m=()=>{window.removeEventListener("mousemove",f),window.removeEventListener("mouseup",m);const g=s.widget.id==="vnpt-docx-widget";h.setDebounced(Y,{right:g?s.widget.style.right:void 0,top:s.widget.style.top,x:g?void 0:parseFloat(s.widget.style.left),y:parseFloat(s.widget.style.top)},1e3)};window.addEventListener("mousemove",f),window.addEventListener("mouseup",m)})})}function Rt(t,n,o,a=null,e=null){let c=!1,l=0,i=0,r=!1;function p(d){r!==d&&(r=d,e&&e(d))}function u(d){if(d.button!==0)return;c=!0,s.hasDragged=!1;const x=t.getBoundingClientRect();l=d.clientX-x.left,i=d.clientY-x.top,document.body.style.userSelect="none",n&&n.forEach(w=>w.style.cursor="grabbing"),a&&a(),d.preventDefault()}return n.forEach(d=>{d.addEventListener("mousedown",u)}),document.addEventListener("mousemove",function(d){if(!c)return;s.hasDragged=!0;let x=d.clientX-l,w=d.clientY-i;const v=window.innerWidth,E=window.innerHeight,f=document.getElementById("vnpt-toggle-btn"),m=f?f.offsetWidth:40,g=f?f.offsetHeight:40,y=t.id==="vnpt-docx-widget";let C=t.offsetWidth||0;if(y){let N=m+6-C,T=v-C+6;x<N&&(x=N),x>T&&(x=T)}else C=C||200,x<0&&(x=0),x+C>v&&(x=Math.max(0,v-C));let b=r;if(y?b=!1:r?d.clientY<E-40&&(b=!1):d.clientY>E-10&&(b=!0),w<0&&(w=0),b)p(!0),t.style.top=E-t.offsetHeight+"px",y?(t.style.right=v-x-C+"px",t.style.left="auto"):(t.style.left=x+"px",t.style.right="auto"),t.style.bottom="auto";else{p(!1);let S=t.offsetHeight||40,N;if(y)N=10+g;else{const T=t.querySelector(".cw-title-bar");N=T?T.offsetHeight:S}w+N>E&&(w=Math.max(0,E-N)),t.style.top=w+"px",y?(t.style.right=v-x-C+"px",t.style.left="auto"):(t.style.left=x+"px",t.style.right="auto"),t.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(c&&(c=!1,document.body.style.userSelect="",n&&n.forEach(d=>d.style.cursor="grab"),o)){const d=t.id==="vnpt-docx-widget";h.set(o,{left:d?void 0:t.style.left,right:d?t.style.right:void 0,top:t.style.top,x:d?void 0:parseFloat(t.style.left),y:parseFloat(t.style.top),docked:r})}}),{isDocked:()=>r,setDocked:p}}function me(){s.widget&&s.header&&s.toggleBtn&&(Rt(s.widget,[s.header,s.toggleBtn],Y),window.addEventListener("resize",()=>{const t=window.innerWidth,n=window.innerHeight,o=document.getElementById("vnpt-toggle-btn"),a=o?o.offsetWidth:40,e=o?o.offsetHeight:40;let c=s.widget.getBoundingClientRect(),l=c.left,i=c.top,r=s.widget.offsetWidth||0,u=a+6-r,d=t-r+6;l<u&&(l=u),l>d&&(l=d),i+10+e>n&&(i=Math.max(0,n-(10+e))),s.widget.style.right=t-l-r+"px",s.widget.style.top=i+"px"}))}function Ft(t){const n=t.toLowerCase(),{ngay:o,thang:a,nam:e}=Dt();return{ngayky:o,thangky:a,thangky1:a,namky:e,namky1:e,soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[n]||""}function be(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){if(s.isDefaultMode){Object.keys(V).forEach(n=>{B(n,V[n],L[n]||"")}),D(),k("Đã nạp lại dữ liệu mặc định từ hệ thống.");return}let t=0;Object.keys(L).forEach(n=>{var e;const o=document.getElementById(n);let a="";o&&(a=o.tagName.toLowerCase()==="select"?((e=o.options[o.selectedIndex])==null?void 0:e.text)||"":o.value,t++),a||(a=Ft(n)),B(n,a,null)}),D(),t>0?(this.style.background="#1e8e3e",this.style.color="#fff",this.innerText="Đã quét xong",setTimeout(()=>{this.style.background="",this.style.color="",this.innerText="Quét dữ liệu"},1e3)):k("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(t){t.target.closest("#vnpt-docx-widget")||t.target.closest("#vnpt-inline-calc")||t.target&&t.target.id&&L[t.target.id]!==void 0&&(B(t.target.id,t.target.value,null),D())}),document.addEventListener("change",function(t){var n;if(!(t.target.closest("#vnpt-docx-widget")||t.target.closest("#vnpt-inline-calc"))&&t.target&&t.target.id&&L[t.target.id]!==void 0){let o=t.target.tagName.toLowerCase()==="select"?((n=t.target.options[t.target.selectedIndex])==null?void 0:n.text)||"":t.target.value;B(t.target.id,o,null),D()}})}const ve={local:{download(t,n="arraybuffer"){return new Promise((o,a)=>{const e=new FileReader;switch(e.onload=c=>{let l=c.target.result;n==="base64"&&typeof l=="string"&&(l=l.split(",")[1]||l),o(l)},e.onerror=c=>a(c),n.toLowerCase()){case"arraybuffer":e.readAsArrayBuffer(t);break;case"base64":case"dataurl":e.readAsDataURL(t);break;case"text":e.readAsText(t);break;default:a(new Error(`Unsupported read type: ${n}`))}})},async upload(t){return this.download(t,"base64")}}},xe={getAdapter(t){const n=ve[t];if(!n)throw new Error(`Storage adapter not found: ${t}`);return n},async upload(t,n,o={}){return await this.getAdapter(t).upload(n,o)},async download(t,n,o={}){return await this.getAdapter(t).download(n,o.type||"arraybuffer")}};function Pt(t,n,o){try{let a;try{a=new window.PizZip(t)}catch(r){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(r);return}const e=new window.docxtemplater(a,{paragraphLoop:!0,linebreaks:!0});e.render(n);const c=e.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),l=URL.createObjectURL(c),i=document.createElement("a");i.href=l,i.download=o,document.body.appendChild(i),i.click(),setTimeout(()=>{document.body.removeChild(i),URL.revokeObjectURL(l)},100)}catch(a){let e=a.message;a.properties&&a.properties.errors instanceof Array?e=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+a.properties.errors.map(l=>"- "+(l.properties.explanation||l.message)).join(`
`):e="Lỗi phần mềm Word sinh ra: "+e,alert(e),console.error("DocX Error:",a)}}function ye(){const t=document.getElementById("vnpt-export-filename");t&&t.addEventListener("input",()=>{t.dataset.userEdited="1",t.value.trim()||(t.dataset.userEdited="0")});function n(){if(!t||t.dataset.userEdited==="1")return;let o="";if(s.fieldsContainer&&s.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(r=>{const u=r.querySelector(".f-key").value.trim().split(",")[0].trim(),d=r.querySelector(".f-val").value.trim();u==="tenToChuc"&&(o=d)}),!o){const i=document.getElementById("tenToChuc");i&&(o=i.tagName.toLowerCase()==="textarea"||i.tagName.toLowerCase()==="input"?i.value.trim():i.innerText.trim())}function a(i){if(!i)return"";let r=i;return r=r.replace(/Tổng công ty/gi,""),r=r.replace(/Công ty/gi,""),r=r.replace(/\bCty\b/gi,""),r=r.replace(/Trách nhiệm hữu hạn/gi,""),r=r.replace(/\bTNHH\b/gi,""),r=r.replace(/Cổ phần/gi,""),r=r.replace(/\bCP\b/gi,""),r=r.replace(/Một thành viên/gi,""),r=r.replace(/\bMTV\b/gi,""),r=r.replace(/Chi nhánh/gi,""),r=r.replace(/Việt Nam/gi,"VN"),r=r.replace(/Viet Nam/gi,"VN"),r=r.replace(/\s+/g," ").trim(),r=r.replace(/^[-,\s]+|[-,\s]+$/g,""),r.length>50&&(r=r.substring(0,47)+"..."),r.replace(/[<>:"/\\|?*]/g,"")}let e=a(o),c=s.templateName?s.templateName.replace(/\.docx$/i,""):"",l=[];c&&l.push(c),e&&l.push(e),l.length>0?t.value=l.join(" - ")+".docx":t.value||(t.value="Export_Auto.docx")}setInterval(n,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const o={};if(s.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(i=>{const p=i.querySelector(".f-key").value.trim().split(",")[0].trim(),u=i.querySelector(".f-val").value;p&&(o[p]=u)}),Object.keys(o).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}const e=[];if(Bt.forEach(i=>{if(!o[i]||!o[i].trim()){const r=L[i]||i;e.push(r)}}),e.length>0){const i=`Cảnh báo: Bạn còn các trường sau chưa điền dữ liệu:

- ${e.join(`
- `)}

Bạn có chắc chắn muốn tiếp tục xuất file không?`;if(!confirm(i))return}let c=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(c.toLowerCase().endsWith(".docx")||(c+=".docx"),s.templateBuffer){Pt(s.templateBuffer,o,c);return}const l=document.getElementById("vnpt-template-file");if(l.files&&l.files.length>0){xe.download("local",l.files[0],{type:"arraybuffer"}).then(i=>Pt(i,o,c)).catch(i=>alert(`Lỗi đọc file: ${i.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')})}const we=["chucVu","noiCap","noiCapSoDkdn","ngayky","thangky","namky","thangky1","namky1","noiKy"],Ee=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function Ce(){function t(){we.forEach(a=>{const e=document.getElementById(a);e&&!e.dataset.filled&&(e.dataset.filled="1",nt(e,Ft(a)))}),Ee.forEach(a=>{const e=document.getElementById(a.src),c=document.getElementById(a.target);e&&c&&!e.dataset.bound&&(e.dataset.bound="1",e.addEventListener("input",()=>nt(c,e.value)))})}let n;new MutationObserver(()=>{clearTimeout(n),n=setTimeout(t,200)}).observe(document.body,{childList:!0,subtree:!0}),t()}function G(t,n=null){return h.get(t,n)}function ot(t,n){h.set(t,n)}function Kt(t,n){if(!n||n.replace(/\D/g,"").length<6)return;let o=G(t,[]);o=o.filter(a=>a!==n),o.unshift(n),ot(t,o.slice(0,10))}function gt(t,n){const o=document.getElementById(n);o&&(o.innerHTML=G(t,[]).map(a=>`<option value="${a}">`).join(""))}function Tt(t){return t.toLocaleString("en-US")}function St(t){return Number(String(t).replace(/[^\d]/g,""))||0}function ke(t){return t.charAt(0).toUpperCase()+t.slice(1)}const at=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function Te(t){let n=Math.floor(t/100),o=Math.floor(t%100/10),a=t%10,e="";return n>0&&(e+=at[n]+" trăm ",o===0&&a>0&&(e+="lẻ ")),o>1?(e+=at[o]+" mươi ",a===1?e+="mốt":a===5?e+="lăm":a>0&&(e+=at[a])):o===1?(e+="mười ",a===5?e+="lăm":a>0&&(e+=at[a])):a>0&&(n>0&&(e+="lẻ "),e+=at[a]),e.trim()}function Se(t){if(t===0)return"không";const n=["","nghìn","triệu","tỷ"];let o="",a=0;for(;t>0;){const e=t%1e3;e>0&&(o=Te(e)+" "+n[a]+" "+o),t=Math.floor(t/1e3),a++}return o.trim()}function Vt(t,n,o){let a=0,e=0,c=0;t==="before"?(a=St(n),e=Math.round(a*o),c=a+e):t==="tax"?(e=St(n),a=Math.round(e/o),c=a+e):t==="after"&&(c=St(n),a=Math.round(c/(1+o)),e=c-a);const l=ke(Se(c))+" đồng";return{beforeNum:a,taxNum:e,afterNum:c,beforeStr:Tt(a),taxStr:Tt(e),afterStr:Tt(c),textStr:l}}function Ne(t,n){n.before&&n.before.forEach(o=>K(o,t.beforeStr)),n.tax&&n.tax.forEach(o=>K(o,t.taxStr)),n.after&&n.after.forEach(o=>K(o,t.afterStr)),n.text&&n.text.forEach(o=>K(o,t.textStr))}function ht(t,n=null){try{const o=localStorage.getItem(t);return o!==null?JSON.parse(o):n}catch{return n}}function A(t,n){localStorage.setItem(t,JSON.stringify(n))}function Le(t,n,o,a){let e=ht(Z)??"custom",c=ht(j)??{...V},l=ht($)??{},i=ht(R)??{};const r=document.createElement("div");r.className="cw-tab-header";const p={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};p.custom.innerText="📋 Custom",p.custom.className="cw-tab cw-tab-custom",p.default.innerText="📌 Default",p.default.className="cw-tab cw-tab-default",p.sync.innerText="🔗 Sync",p.sync.className="cw-tab cw-tab-sync";function u(){Object.values(p).forEach(b=>b.classList.remove("active")),p[e].classList.add("active")}u();const d=document.createElement("div");d.style.display=a.data?"none":"block";const x=n("📋 Cấu hình Data","data",b=>{d.style.display=b?"none":"block",o(t)}),w=document.createElement("div");w.className="cw-data-body";function v(){w.innerHTML="";let b=e==="sync"?i:e==="custom"?l:c,S=e==="sync"?R:e==="custom"?$:j;const N=Object.keys(b);N.length===0&&e!=="default"&&(w.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),N.forEach(T=>{const W=document.createElement("div");W.className="cw-data-row";let mt=e!=="default";const z=b[T],bt=z&&typeof z=="object"&&z.hasOwnProperty("value"),qt=bt?z.value:z,Lt=bt&&z.label||T,_=document.createElement("input");_.type="text",_.value=Lt,_.className="cw-data-key"+(mt?" mutable":""),_.title=T,_.readOnly=!mt,mt&&(_.onchange=()=>{const I=_.value.trim();if(!I||I===T){_.value=Lt;return}bt?b[I]={...z,label:I}:b[I]=qt,delete b[T],A(S,b),v()});const q=document.createElement("input");if(q.type="text",q.value=qt??"",q.className="cw-data-val",q.oninput=()=>{bt?b[T]={...z,value:q.value}:b[T]=q.value,A(S,b)},W.appendChild(_),W.appendChild(q),mt){const I=document.createElement("button");I.innerHTML="✕",I.className="cw-del-btn",I.onclick=()=>{confirm(`Delete "${Lt}"?`)&&(delete b[T],A(S,b),v())},W.appendChild(I)}else W.appendChild(document.createElement("div")).className="cw-pad";w.appendChild(W)})}p.custom.onclick=()=>{e="custom",A(Z,"custom"),u(),v()},p.default.onclick=()=>{e="default",A(Z,"default"),u(),v()},p.sync.onclick=()=>{e="sync",A(Z,"sync"),u(),v()};const E=document.createElement("button");E.innerText="📤",E.className="cw-icon-btn",E.onclick=()=>{const b=new Blob([JSON.stringify({defaultData:c,customData:l,syncData:i},null,2)],{type:"application/json"}),S=URL.createObjectURL(b),N=document.createElement("a");N.href=S,N.download=`vnpt_data_${Date.now()}.json`,N.click(),URL.revokeObjectURL(S)},d.appendChild(r),r.appendChild(p.custom),r.appendChild(p.default),r.appendChild(p.sync),d.appendChild(w),t.appendChild(x),t.appendChild(d);const f=t.querySelector("#vnpt-cw-fill"),m=t.querySelector("#vnpt-cw-sync"),g=t.querySelector("#vnpt-cw-add"),y=t.querySelector("#vnpt-cw-reset");f&&(f.onclick=Ht),m&&(m.onclick=se),g&&(g.onclick=()=>{e==="default"&&(e="custom",A(Z,"custom"),u());let b=e==="sync"?i:l,S="new_field_"+Date.now();b[S]="",A(e==="sync"?R:$,b),v(),w.scrollTop=w.scrollHeight}),y&&(y.onclick=()=>{confirm("Reset Default Data?")&&(c={...V},A(j,c),v())}),v();const C=x.querySelector(".cw-right-wrap")||document.createElement("div");C.className="cw-right-wrap",C.prepend(E),x.appendChild(C)}function Be(t,n,o){let a=Number(localStorage.getItem(Q))||le,e=G(st)??{calc:!1,data:!0},c=G(J)??{...re};function l(f,m){const g=document.createElement("button");return g.innerText=f,g.className="cw-action-btn "+m,g}function i(f,m,g){const y=document.createElement("div");y.className="wg-sec-header";const C=document.createElement("span");C.innerText=f;const b=document.createElement("button");return b.className="wg-toggle-btn",b.innerText=e[m]?"▾":"▴",y.appendChild(C),y.appendChild(b),b.onclick=()=>{e[m]=!e[m],b.innerText=e[m]?"▾":"▴",ot(st,e),g(e[m])},y}function r(f){const m=window.innerWidth,g=window.innerHeight,y=f.getBoundingClientRect();f.style.left=Math.min(Math.max(parseFloat(f.style.left),0),m-y.width)+"px",f.style.top=Math.min(Math.max(parseFloat(f.style.top),0),g-36)+"px"}const p=document.createElement("div");if(!n){p.className="cw-title-bar",p.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const f=document.createElement("div");f.className="cw-btn-group";const m={fill:l("Fill","cw-btn-fill"),sync:l("Sync","cw-btn-sync"),add:l("Add","cw-btn-add"),reset:l("↺","cw-btn-reset")};m.reset.title="Reset Default fields",Object.values(m).forEach(g=>f.appendChild(g)),p.appendChild(f),t.appendChild(p)}const u=document.createElement("div");u.className="cw-body-inline",u.innerHTML=`
    <div class="cw-inline-row">
        <input id="wg-before" class="cw-input-inline" placeholder="Trước thuế" list="wg-before-list" title="Trước thuế">
        <datalist id="wg-before-list"></datalist>
        <div class="cw-tax-group-inline"><input id="wg-taxRate" class="cw-tax-input-inline" title="Thuế (%)"><span class="cw-tax-symbol">%</span></div>
        <input id="wg-tax" class="cw-input-inline" placeholder="Tiền thuế" title="Tiền thuế">
        <input id="wg-after" class="cw-input-inline" placeholder="Sau thuế" list="wg-after-list" title="Sau thuế">
        <datalist id="wg-after-list"></datalist>
        <input id="wg-text" class="cw-input-inline cw-input-readonly-inline" placeholder="Bằng chữ" readonly title="Bằng chữ">
        <div class="cw-map-dropdown-container">
            <button id="wg-calc-map-btn" class="cw-map-btn-inline" title="Cấu hình">⚙️</button>
            <div id="wg-calc-map-wrap" class="cw-map-wrap-popup" style="display:none;">
                <div class="util-submenu-title">Liên kết ô (Mapping)</div>
                <div class="cw-row"><span class="cw-map-label">Trước thuế</span><input data-clink="before" class="cw-map-input"></div>
                <div class="cw-row"><span class="cw-map-label">Tiền thuế</span><input data-clink="tax" class="cw-map-input"></div>
                <div class="cw-row"><span class="cw-map-label">Sau thuế</span><input data-clink="after" class="cw-map-input"></div>
                <div class="cw-row"><span class="cw-map-label">Bằng chữ</span><input data-clink="text" class="cw-map-input"></div>                
                <div class="cw-map-separator"></div>
                <div class="cw-map-actions">
                    <button class="vnpt-btn-action btn-reset-default danger" id="vnpt-btn-reset-default" title="Khôi phục dữ liệu gốc">Reset Default</button>
                    <button class="vnpt-btn-action btn-import" id="vnpt-btn-import" title="Nhập cấu hình JSON">📥 Nhập JSON</button>
                    <button class="vnpt-btn-action btn-export-json" id="vnpt-btn-export-json" title="Xuất cấu hình JSON">📤 Xuất JSON</button>
                </div>
            </div>
        </div>
    </div>`,n?n.appendChild(u):t.appendChild(u),n||Le(t,i,r,e);const d={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text"),mapBtn:document.getElementById("wg-calc-map-btn"),mapWrap:document.getElementById("wg-calc-map-wrap")};d.taxRate.value=a*100,gt(yt,"wg-before-list"),gt(wt,"wg-after-list");function x(f,m){const g=Vt(f,m,a);d.before.value=g.beforeStr,d.tax.value=g.taxStr,d.after.value=g.afterStr,d.text.value=g.textStr,Ne(g,c)}d.taxRate.oninput=()=>{a=Number(d.taxRate.value)/100||0,ot(Q,a),x("before",d.before.value)},d.before.oninput=()=>{const f=Vt("before",d.before.value,a);d.tax.value=f.taxStr,d.after.value=f.afterStr,d.text.value=f.textStr},d.before.onchange=()=>{x("before",d.before.value),Kt(yt,d.before.value),gt(yt,"wg-before-list")},d.tax.oninput=()=>x("tax",d.tax.value),d.after.oninput=()=>x("after",d.after.value),d.after.onchange=()=>{x("after",d.after.value),Kt(wt,d.after.value),gt(wt,"wg-after-list")},[d.before,d.tax,d.after,d.text].forEach(f=>{["click","focus"].forEach(m=>f.addEventListener(m,()=>{if(!f.value)return;navigator.clipboard.writeText(f.value);const g=f.style.backgroundColor;f.style.backgroundColor="#d1e7dd",setTimeout(()=>f.style.backgroundColor=g,300)}))}),d.mapBtn.onclick=()=>{const f=d.mapWrap.style.display==="flex";if(d.mapWrap.style.display=f?"none":"flex",!f){const m=g=>{!d.mapWrap.contains(g.target)&&g.target!==d.mapBtn&&(d.mapWrap.style.display="none",document.removeEventListener("click",m))};setTimeout(()=>document.addEventListener("click",m),0)}},t.querySelectorAll("input[data-clink]").forEach(f=>{const m=f.dataset.clink;f.value=(c[m]||[]).join(", "),f.oninput=()=>{c[m]=f.value.split(",").map(g=>g.trim()).filter(g=>g),ot(J,c)}});const w=document.getElementById("vnpt-btn-import"),v=document.getElementById("vnpt-btn-export-json"),E=document.getElementById("vnpt-btn-reset-default");if(w&&(w.onclick=f=>{ge(),d.mapWrap.style.display="none"}),v&&(v.onclick=f=>{fe(),d.mapWrap.style.display="none"}),E&&(E.onclick,E.addEventListener("click",()=>{d.mapWrap.style.display="none"})),!n){const f=Array.from(t.children).filter(y=>y!==p),m=Rt(t,[p],o,null,y=>{f.forEach(C=>C.style.display=y?"none":""),p.style.borderRadius=y?"8px":"0",y&&(t.style.top=window.innerHeight-(p.offsetHeight||34)+"px")}),g=G(o);return g&&g.docked&&m.setDocked(!0),window.addEventListener("resize",()=>{m.isDocked()?t.style.top=window.innerHeight-p.offsetHeight+"px":r(t)}),m}return null}function De(){const t=document.getElementById("vnpt-inline-calc"),n=document.getElementById("vnpt-btn-calc-toggle");let o=s.calcWidget||document.createElement("div");if(!t&&!s.calcWidget?(o.id="vnpt-calc-widget",document.body.appendChild(o),s.calcWidget=o):t&&(o=s.widget),t&&n){let a=G(st)??{calc:!1,data:!0};const e=c=>{t.style.display=c?"none":"block",n.classList.toggle("active",!c)};e(a.calc),n.onclick=()=>{a.calc=!a.calc,ot(st,a),e(a.calc)}}return Be(o,t,$t)}let it=null;function Nt(){if(!window.__vnptInited){window.__vnptInited=!0,U.info("Initializing VNPT Userscript...");try{Ut(),he(),De(),me(),ue(),kt(),be(),ye(),Ce(),pe();const t=Ot(()=>{ee(),U.debug("DOM Cache cleared due to mutations")},500);it=new MutationObserver(n=>{n.some(o=>o.addedNodes.length>0||o.removedNodes.length>0)&&t()}),it.observe(document.body,{childList:!0,subtree:!0}),U.info("Userscript initialized successfully.")}catch(t){U.error("Error during userscript initialization:",t)}}}function Ie(){U.info("Cleaning up VNPT Userscript for reload..."),it&&(it.disconnect(),it=null);const t=document.getElementById("vnpt-docx-widget");t&&t.remove();const n=document.getElementById("vnpt-calc-widget");n&&n.remove();const o=document.getElementById("vnpt-styles");o&&o.remove(),window.__vnptInited=!1,U.info("Cleanup completed.")}window.__vnptCleanup=Ie,window.__vnptInit=Nt,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Nt):Nt()})();
