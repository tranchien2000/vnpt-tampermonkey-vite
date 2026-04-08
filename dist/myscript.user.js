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
(function(){"use strict";const P={info:(...e)=>console.log("[Tampermonkey Script] INFO:",...e),error:(...e)=>console.error("[Tampermonkey Script] ERROR:",...e),warn:(...e)=>console.warn("[Tampermonkey Script] WARN:",...e)};function Ye(){const e="vnpt-styles";if(document.getElementById(e))return;const t=document.createElement("style");t.id=e,t.textContent=`
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
        #vnpt-export-panel.vnpt-resizing { transition: none !important; user-select: none !important; }
        
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

        /* Mapping Rows in Utility Menu */
        .cw-row-map {
            display: flex; align-items: center; justify-content: space-between;
            padding: 4px 20px; gap: 10px;
        }
        .cw-row-map span { font-size: 11px; font-weight: 700; color: #5f6368; flex: 0 0 75px; }
        .cw-map-input {
            flex: 1; padding: 5px 10px; border: 1px solid #dadce0; border-radius: 8px;
            font-size: 11px; background: #fff; transition: all 0.2s;
        }
        .cw-map-input:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 2px var(--vnpt-primary-light); outline: none; }

        /* System Data Actions */
        .util-action-row { display: flex; padding: 6px 16px; gap: 8px; }
        .util-item-small {
            flex: 1; border: 1px solid #e0e0e0; background: #fff; color: #3c4043;
            padding: 8px 0; border-radius: 10px; font-size: 11px; font-weight: 700;
            cursor: pointer; transition: all 0.2s; text-align: center;
        }
        .util-item-small:hover { background: var(--vnpt-primary-light); color: var(--vnpt-primary); border-color: var(--vnpt-primary); }
        
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
        .vnpt-resizer:hover { background: rgba(26, 115, 232, 0.4); border-radius: 50%; }
        .vnpt-resizer:active { background: var(--vnpt-primary); transform: scale(1.2); }

        body.vnpt-resizing-global * { user-select: none !important; cursor: inherit !important; }

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

        .btn-calc-toggle { background: rgba(26, 115, 232, 0.08); color: var(--vnpt-primary); }
        .btn-calc-toggle:hover { background: rgba(26, 115, 232, 0.15); }
        .btn-calc-toggle.active { background: var(--vnpt-primary); color: #fff; box-shadow: 0 4px 10px rgba(26, 115, 232, 0.3); }

        .btn-more.active { background: rgba(0,0,0,0.1); }

    `,document.head.appendChild(t)}const Qe={widget:null,panel:null,header:null,bannerArea:null,toggleBtn:null,fieldsContainer:null,panelBody:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1,templateBuffer:null,templateName:null,hasDragged:!1},J=new Map,c=new Proxy(Qe,{get(e,t){return t==="on"?(a,n)=>{J.has(a)||J.set(a,[]),J.get(a).push(n)}:e[t]},set(e,t,a){const n=e[t];return e[t]=a,n!==a&&J.has(t)&&J.get(t).forEach(i=>i(a,n)),!0}}),k={tenDaiDienn:"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT",emailDaiDien:"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Số GPKD | MST",goiDV:"Gói Dịch Vụ","ngayKy, ngayKy1":"Ngày ký","thangKy, thangKy1":"Tháng Ký","namKy, namKy1":"Năm ký",ngayTiepNhan:"Ngày tiếp nhận",ngayThangNamKy:"Ngày tháng năm ký","soHopDong, inputContractGroupName, contractNumber, contractName":"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký"},Be=["soHopDong","tenDaiDienn","cmnd","sdt","diaChi","tenToChuc","ngayCapCustomer","emailDaiDien","soDkdn","goiDV","soHopDong"],se="vnpt_docx_fields",V="vnpt_docx_default_fields",ve="vnpt_docx_position",ye="vnpt_docx_size",xe="vnpt_docx_opened",z="vnpt_autofill_data_default",W="vnpt_autofill_data_custom",j="vnpt_autofill_data_sync",Je="vnpt_widget_pos",Z="vnd_tax_rate",we="vnd_before_history",Ee="vnd_after_history",ce="vnpt_widget_collapsed",U="vnd_calc_map",ee="vnpt_widget_datatab",de="vnpt_templates";let F=null;function C(e,t="#198754",a=2500){F||(F=document.createElement("div"),F.id="vnpt-toast-container",Object.assign(F.style,{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column-reverse",alignItems:"center",gap:"8px",zIndex:"1000000",pointerEvents:"none"}),document.body.appendChild(F));const n=document.createElement("div");n.innerText=e,Object.assign(n.style,{background:t,color:"#fff",padding:"8px 18px",borderRadius:"24px",opacity:"0",transform:"translateY(10px)",transition:"opacity 0.3s, transform 0.3s",fontSize:"13px",fontWeight:"500",fontFamily:"'Segoe UI', Roboto, sans-serif",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",whiteSpace:"nowrap",pointerEvents:"auto"}),F.appendChild(n),requestAnimationFrame(()=>{n.style.opacity="1",n.style.transform="translateY(0)"}),setTimeout(()=>{n.style.opacity="0",n.style.transform="translateY(-10px)",setTimeout(()=>{n.remove(),F&&F.childNodes.length},300)},a)}const Ze="vnpt_templates_db",K="buffers";let pe=null;function Ce(){return pe?Promise.resolve(pe):new Promise((e,t)=>{const a=indexedDB.open(Ze,1);a.onupgradeneeded=n=>{const i=n.target.result;i.objectStoreNames.contains(K)||i.createObjectStore(K)},a.onsuccess=n=>{pe=n.target.result,e(pe)},a.onerror=()=>t(a.error)})}async function et(e,t){const a=await Ce();return new Promise((n,i)=>{const p=a.transaction(K,"readwrite").objectStore(K).put(t,e);p.onsuccess=()=>n(),p.onerror=()=>i(p.error)})}async function tt(e){const t=await Ce();return new Promise((a,n)=>{const s=t.transaction(K,"readonly").objectStore(K).get(e);s.onsuccess=()=>a(s.result),s.onerror=()=>n(s.error)})}async function nt(e){const t=await Ce();return new Promise((a,n)=>{const s=t.transaction(K,"readwrite").objectStore(K).delete(e);s.onsuccess=()=>a(),s.onerror=()=>n(s.error)})}const $=new Map,ue=new Map,h={isGM:typeof GM_setValue<"u"&&typeof GM_getValue<"u",get(e,t=null){if($.has(e))return $.get(e);try{let a;if(this.isGM?a=GM_getValue(e,null):a=localStorage.getItem(e),a==null)return t;const n=typeof a=="string"?JSON.parse(a):a;return $.set(e,n),n}catch(a){return console.warn(`[Storage] Không thể đọc key "${e}":`,a),t}},set(e,t){$.set(e,t);try{return this.isGM?GM_setValue(e,t):localStorage.setItem(e,JSON.stringify(t)),!0}catch(a){return console.error(`[Storage] Không thể ghi key "${e}":`,a),!1}},setDebounced(e,t,a=500){$.set(e,t),ue.has(e)&&clearTimeout(ue.get(e));const n=setTimeout(()=>{this.set(e,t),ue.delete(e)},a);ue.set(e,n)},remove(e){$.delete(e);try{this.isGM?GM_deleteValue(e):localStorage.removeItem(e)}catch(t){console.error(`[Storage] Không thể xóa key "${e}":`,t)}},clearCache(){$.clear()}};function te(){try{const e=h.get(de)||[],t=e.filter(a=>a.type!=="local");return t.length!==e.length&&ne(t),t}catch{return[]}}function ne(e){h.set(de,e)}function at(e){const t=e.match(/drive\.google\.com\/file\/d\/([^/]+)/);return t?`https://drive.google.com/uc?export=download&id=${t[1]}`:e}function it(e){return new Promise((t,a)=>{GM_xmlhttpRequest({method:"GET",url:at(e),responseType:"arraybuffer",onload:n=>{if(n.status>=200&&n.status<300){if(n.response&&n.response.byteLength>4){const i=new Uint8Array(n.response.slice(0,4));if(i[0]===80&&i[1]===75&&i[2]===3&&i[3]===4){t(n.response);return}else{a(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}t(n.response)}else a(new Error(`HTTP ${n.status}: Không lấy được file`))},onerror:()=>a(new Error("Không thể tải URL.")),ontimeout:()=>a(new Error("Timeout khi tải URL."))})})}async function ot(e,t,a){const n=e.name.replace(/\.docx$/i,""),i=prompt("Đặt tên biến nhớ cho file này:",n);if(!(!i||!i.trim()))try{const r=await e.arrayBuffer();await et(i.trim(),r);const p=te().filter(o=>o.name!==i.trim()&&o.fileName!==e.name);p.unshift({name:i.trim(),type:"local_idb",fileName:e.name,lastUsed:Date.now()}),ne(p),q(t,a),a&&a(r,i.trim())}catch(r){C(`❌ Lỗi lưu file: ${r.message}`,"#dc3545")}}function q(e,t,a=null){let n=e.querySelector(".vnpt-template-manager-inner"),i,r;if(n)i=n.querySelector(".vnpt-local-list-container"),r=n.querySelector(".vnpt-btn-wrap");else{e.innerHTML="",n=document.createElement("div"),n.className="vnpt-template-manager-inner";const o=document.createElement("div");o.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const u=document.createElement("span");u.className="vnpt-title-main",u.style.cssText="font-size:11px;font-weight:700;color:#444;",r=document.createElement("div"),r.className="vnpt-btn-wrap",r.style.cssText="display:flex;gap:4px;",o.appendChild(u),o.appendChild(r),n.appendChild(o),i=document.createElement("div"),i.className="vnpt-local-list-container",i.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",n.appendChild(i),e.appendChild(n)}const s=te(),p=n.querySelector(".vnpt-title-main");p.innerHTML="Templates"+(a?` <span style="color:#2e7d32;">(Đang dùng: ${a})</span>`:""),s.length===0?i.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':i.innerHTML="",s.forEach((o,u)=>{const l=document.createElement("div");l.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",l.title=o.fileName||o.url||o.name,l.tabIndex=0,l.onfocus=()=>l.style.boxShadow="0 0 0 2px #28a745",l.onblur=()=>l.style.boxShadow="none";const d=o.type==="local"||o.type==="local_base64"||o.type==="local_idb"?"OFF":"ON",f=d==="OFF"?"#6c757d":"#28a745",g=document.createElement("span");g.textContent=d,g.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${f};color:#fff;`;const m=document.createElement("span");m.textContent=o.name,m.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",l.onclick=()=>{l.focus(),rt(o,t,a,e)},l.appendChild(g),l.appendChild(m);const b=document.createElement("button");b.innerHTML="✎",b.title="Đổi tên template",b.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",b.onclick=x=>{x.stopPropagation();const w=prompt("Đổi tên template:",o.name);if(w&&w.trim()&&w.trim()!==o.name){const T=te();T[u].name=w.trim(),ne(T),q(e,t,a)}},l.appendChild(b);const v=document.createElement("button");v.innerHTML="✕",v.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",v.onclick=async x=>{if(x.stopPropagation(),confirm(`Xoá biểu mẫu "${o.name}"?`)){const w=te();w.splice(u,1),ne(w),o.type==="local_idb"&&await nt(o.name).catch(()=>null),q(e,t,a===o.name?null:a)}},l.appendChild(v),i.appendChild(l)})}function rt(e,t,a,n){const i=te(),r=i.find(s=>s.name===e.name&&(s.url===e.url||s.type===e.type));if(r&&(r.lastUsed=Date.now(),ne(i)),e.type==="local_idb"){tt(e.name).then(s=>{if(!s)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");t&&t(s,e.name),q(n,t,e.name)}).catch(s=>{C(`❌ Lỗi nạp File IDB: ${s.message}`,"#dc3545")});return}if(e.type==="local_base64"&&e.data){try{const s=window.atob(e.data.split(",")[1]),p=s.length,o=new Uint8Array(p);for(let u=0;u<p;u++)o[u]=s.charCodeAt(u);t&&t(o.buffer,e.name),q(n,t,e.name)}catch(s){C(`❌ Lỗi nạp Base64: ${s.message}`,"#dc3545")}return}it(e.url).then(s=>{t&&t(s,e.name),q(n,t,e.name)}).catch(s=>{C(`❌ ${s.message}`,"#dc3545")})}function lt(e,t){if(e.length===0)return t.length;if(t.length===0)return e.length;const a=[];for(let n=0;n<=t.length;n++)a[n]=[n];for(let n=0;n<=e.length;n++)a[0][n]=n;for(let n=1;n<=t.length;n++)for(let i=1;i<=e.length;i++)t.charAt(n-1)===e.charAt(i-1)?a[n][i]=a[n-1][i-1]:a[n][i]=Math.min(a[n-1][i-1]+1,a[n][i-1]+1,a[n-1][i]+1);return a[t.length][e.length]}function st(e,t){let a=e,n=t;e.length<t.length&&(a=t,n=e);const i=a.length;return i===0?1:(i-lt(a,n))/parseFloat(i)}function ct(e,t,a=.7){let n=null,i=-1;const r=e.toLowerCase().trim();for(const s of t){const p=s.toLowerCase().trim(),o=st(r,p);o>i&&o>=a&&(i=o,n=s)}return n}function dt(e){return e?e.toLowerCase().split(" ").map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(" "):""}function pt(e){if(!e)return"";let t=e.replace(/\D/g,"");return t.startsWith("84")&&(t="0"+t.slice(2)),t}function ut(e){if(!e)return"";const t=e.split(/[-/]/);if(t.length===3){let a,n,i;return t[0].length===4?[i,n,a]=t:[a,n,i]=t,`${a.padStart(2,"0")}/${n.padStart(2,"0")}/${i}`}return e}const ae=new Map;function ft(){ae.clear()}function gt(e){e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function ie(e,t){var i;const a=e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,n=(i=Object.getOwnPropertyDescriptor(a,"value"))==null?void 0:i.set;n?n.call(e,t):e.value=t,gt(e)}function X(e,t=null){if(!e)return null;const a=ae.get(e);if(a&&document.contains(a))return a;const n=document.getElementById(e);if(n&&(n.tagName==="INPUT"||n.tagName==="TEXTAREA"||n.tagName==="SELECT"))return ae.set(e,n),n;const i=`input[id="${e}"], textarea[id="${e}"], select[id="${e}"], input[name="${e}"], textarea[name="${e}"], input[formcontrolname="${e}"], textarea[formcontrolname="${e}"], input[placeholder="${e}"], textarea[placeholder="${e}"]`,r=document.querySelector(i);if(r)return ae.set(e,r),r;const s=t||e,p=Array.from(document.querySelectorAll("label, .label, .label-text, span.title"));let o=p.find(u=>u.innerText.trim()===s);if(!o&&s.length>2){const u=p.map(d=>d.innerText.trim()).filter(d=>d.length>0),l=ct(s,u,.8);l&&(o=p.find(d=>d.innerText.trim()===l))}if(o){let u=null;if(o.htmlFor&&(u=document.getElementById(o.htmlFor)),!u){let l=o.parentElement,d=0;for(;l&&d<3;){const f=l.querySelector("input, textarea, select");if(f){u=f;break}l=l.parentElement,d++}}if(u)return ae.set(e,u),u}return null}function Te(e){return X(null,e)}function G(e,t,a=null){const n=X(e,a);n&&ie(n,t)}function mt(e=new Date){return String(e.getDate()).padStart(2,"0")}function ht(e=new Date){return String(e.getMonth()+1).padStart(2,"0")}function bt(e=new Date){return String(e.getFullYear())}function Ie(){const e=new Date;return{ngay:mt(e),thang:ht(e),nam:bt(e)}}const{ngay:Ae,thang:Me,nam:_e}=Ie(),I={"ngayKy, ngayKy1":{label:"Ngày ký",value:Ae},"thangKy, thangKy1":{label:"Tháng ký",value:Me},"namKy, namKy1":{label:"Năm ký",value:_e},"ngayTiepNhan, ngayThangNamKy":{label:"Ngày ký (full)",value:`${Ae}/${Me}/${_e}`},tenDoanhNghiepB:{label:"Tên doanh nghiệp B",value:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM"},diaChiB:{label:"Địa chỉ B",value:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội"},maSoThueB:{label:"Mã số thuế B",value:"0100686223"},stkB:{label:"Số tài khoản B",value:"1600114156"},diaChiStkB:{label:"Ngân hàng/Địa chỉ STK B",value:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)"},"tenB, nguoiDaiDienB":{label:"Người đại diện B",value:"Phạm Khánh Chung"},"chucVuB, chucVuDaiDienB":{label:"Chức vụ B",value:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp"},"giayUyQuyenSoB, soGiayUyQuyenB":{label:"Giấy ủy quyền số B",value:"2628/GUQ-VNPT-HNI-VP"},"giayUyQuyenNgayB, ngayGiayUyQuyenB":{label:"Giấy ủy quyền ngày B",value:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},GiayUyQuyenB:{label:"Giấy ủy quyền B (full)",value:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},tenDoanhNghiepB1:{label:"Tên doanh nghiệp B (phụ)",value:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},donViTiepNhan:{label:"Đơn vị tiếp nhận",value:"TTKD KHDN"},"tenTiepNhan, tenNguoiNhan":{label:"Người tiếp nhận",value:"Bùi Anh"},dienThoaiB:{label:"Điện thoại B",value:"02436686868"},diaChiTaiKhoanB:{label:"Địa chỉ tài khoản B",value:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 "},noiKy:{label:"Nơi ký",value:"Hà Nội"},emailB:{label:"Email B",value:""},"lienheHopDongB, lienheTuVanB, lienheHoaDonB, sucoCap1B, sucoCap2B, sucoCap3B, sucoCap4B":{label:"Liên hệ B (AM)",value:"AM Bùi Anh"}},He={soHopDong:"soHopDong, inputContractGroupName, contractNumber, contractName"},Oe={after:["vnpt-map-after","cuocDV","tongCong","tongCongHD","congCA","giaTriHopDong","tongGIaTriHopDong"],before:["vnpt-map-before","donGiaCA","thanhTienCA","tongThanhTien","tongCuocTruocThue"],tax:["vnpt-map-tax","tongThueGTGT","tongThue","thueCA","thueVAT"],text:["vnpt-map-text","soTienThanhToanBangChu","tongCongBangChu","tongCongHDbangChu","ghiChuGiaTriHopDong","tongGiaTriHopDongBangChu"]},vt=.08;function ze(e,t){let a;return function(...i){const r=()=>{clearTimeout(a),e(...i)};clearTimeout(a),a=setTimeout(r,t)}}function Fe(){const e=h.get(z)??{...I},t=h.get(W)??{},a={...e,...t};Object.keys(a).forEach(n=>{const i=a[n],r=i&&typeof i=="object"&&i.hasOwnProperty("value")?i.value:i;n.split(",").map(p=>p.trim()).filter(p=>p).forEach(p=>{let o=X(p)||Te(p);o&&ie(o,r)})}),C("✅ Auto fill complete")}function yt(){let e=h.get(j)??{};const t={...He,...e},a=Object.keys(t);if(a.length===0){C("⚠️ No sync mapping","#ffc107");return}a.forEach(n=>{let i=X(n)||Te(n);i&&i.value!==void 0&&i.value!==""&&t[n].split(",").map(s=>s.trim()).filter(s=>s).forEach(s=>G(s,i.value))}),C("✅ Sync form complete","#d39e00")}let ke=!1;const xt=(e,t)=>{var o;if(ke)return;let a=h.get(j)??{};const n={...He,...a};if(Object.keys(n).length===0)return;let i=e.id,r=e.name,s=null;if(i){const u=document.querySelector(`label[for="${i}"]`);u&&(s=u.textContent.trim())}if(!s){const u=e.closest("label");u&&(s=(o=Array.from(u.childNodes).find(l=>l.nodeType===3))==null?void 0:o.textContent.trim())}let p=n[i]||n[r]||n[s];if(p){ke=!0;try{p.split(",").map(l=>l.trim()).filter(l=>l).forEach(l=>{if(l!==i&&l!==r&&l!==s){const d=X(l)||Te(l);d&&document.activeElement!==d&&ie(d,t)}})}finally{ke=!1}}},wt=ze((e,t)=>{xt(e,t)},250);function Et(){document.addEventListener("input",e=>{const t=e.target;!t||!["INPUT","TEXTAREA"].includes(t.tagName)||t.closest("#vnpt-docx-widget")||t.closest("#vnpt-inline-calc")||wt(t,t.value)})}function N(e,t,a=null,n=""){const i=c.fieldsContainer.querySelector(".text-hint");i&&i.remove();const r=c.fieldsContainer.querySelectorAll(".f-key");let s=!1;const p=e.split(",")[0].trim();for(let o of r)if(o.value.split(",")[0].trim()===p){const l=o.closest(".vnpt-field-row"),d=l.querySelector(".f-val"),f=l.querySelector(".f-label");t!==""&&d.value!==t&&document.activeElement!==d&&(d.value=t),a!==null&&a!==""&&f.value!==a&&document.activeElement!==f&&(f.value=a),n!==""&&o.value!==e+", "+n&&document.activeElement!==o&&(o.value=e+", "+n),s=!0;break}if(!s){(a===null||a==="")&&(a=k[e]||"");const o=document.createElement("div");o.className="vnpt-field-row row-item",o.setAttribute("draggable","false");let u=e;n&&(u+=", "+n);const l=p;o.innerHTML=`
            <input type="checkbox" id="chk-${l}" name="chk-${l}" class="row-chk" title="Chọn" style="margin: 0 2px 0 2px;" />
            <input type="text" id="lbl-${l}" name="lbl-${l}" class="f-label" value="${a}" />
            <input type="text" id="key-${l}" name="key-${l}" class="f-key" value="${u}" title="Biến DOCX và IDs đồng bộ" />
            <span class="row-drag-handle" title="Kéo">=</span>
            <input type="text" id="val-${l}" name="val-${l}" class="f-val" value="${t}" />
        `;const d=o.querySelector(".f-val"),f=o.querySelector(".f-key");e==="tenToChuc"&&(d.style.textAlign="right");const g=()=>{Be.includes(p)&&(d.value.trim()?d.classList.remove("field-required-empty"):d.classList.add("field-required-empty"))},m=()=>{const v=d.value;f.value.split(",").map(w=>w.trim()).filter(w=>w).forEach(w=>G(w,v))};f.addEventListener("input",function(){A();const v=this.value.split(",")[0].trim();d.style.textAlign=v==="tenToChuc"?"right":"",m()}),o.querySelector(".f-label").addEventListener("input",A),d.addEventListener("input",function(){A(),m(),g()}),g();const b=o.querySelector(".row-drag-handle");b.addEventListener("mouseenter",()=>o.setAttribute("draggable","true")),b.addEventListener("mouseleave",()=>{o.classList.contains("dragging")||o.setAttribute("draggable","false")}),o.addEventListener("dragstart",function(v){c.draggedRowForVNPT=this,v.dataTransfer.effectAllowed="move",v.dataTransfer.setData("text/plain",e),this.classList.add("dragging")}),o.addEventListener("dragover",v=>(v.preventDefault(),!1)),o.addEventListener("dragenter",function(){this.classList.add("over")}),o.addEventListener("dragleave",function(){this.classList.remove("over")}),o.addEventListener("drop",function(v){if(v.stopPropagation(),c.draggedRowForVNPT&&c.draggedRowForVNPT!==this){const x=Array.from(c.fieldsContainer.querySelectorAll(".vnpt-field-row")),w=x.indexOf(c.draggedRowForVNPT),T=x.indexOf(this);w<T?this.parentNode.insertBefore(c.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(c.draggedRowForVNPT,this),A()}return!1}),o.addEventListener("dragend",function(){this.setAttribute("draggable","false"),c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(v=>{v.classList.remove("over","dragging")}),c.draggedRowForVNPT=null}),c.fieldsContainer.appendChild(o),c.fieldsContainer.scrollTop=c.fieldsContainer.scrollHeight}}function A(){const e=c.isDefaultMode?V:se,t={};c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(n=>{const r=n.querySelector(".f-key").value.trim().split(",").map(l=>l.trim()).filter(l=>l),s=r[0],p=r.slice(1).join(", "),o=n.querySelector(".f-label").value.trim(),u=n.querySelector(".f-val").value;s&&(t[s]={label:o,value:u,sync:p})}),h.setDebounced(e,t,1e3)}function Ke(){try{c.fieldsContainer.innerHTML="";const t=h.get(se)||{};Object.keys(k).forEach(a=>{const n=k[a],i=t[a];i&&typeof i=="object"?N(a,i.value,i.label||n,i.sync||""):i?N(a,i,n,""):N(a,"",n,"")}),Object.keys(t).forEach(a=>{if(!(a in k)){const n=t[a];typeof n=="object"?N(a,n.value,n.label,n.sync||""):N(a,n,"","")}}),Object.keys(k).length===0&&Object.keys(t).length===0&&(c.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(t){console.error("Error loading config:",t),Object.keys(k).forEach(a=>N(a,"",k[a]))}const e=h.get(ve);e&&c.widget&&(c.widget.style.bottom="auto",e.right?(c.widget.style.right=e.right,c.widget.style.left="auto"):e.left&&(c.widget.style.left=e.left,c.widget.style.right="auto"),e.top&&(c.widget.style.top=e.top))}function Ct(){document.getElementById("vnpt-btn-toggle-id").onclick=()=>c.fieldsContainer.classList.toggle("show-ids"),document.getElementById("vnpt-btn-default").onclick=()=>{c.isDefaultMode=!c.isDefaultMode},c.on("isDefaultMode",e=>Re(e)),document.getElementById("vnpt-btn-reset-default").onclick=()=>{confirm("Khôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?")&&(h.remove(V),h.remove(U),h.remove(Z),c.isDefaultMode&&(Re(!0),C("🔄 Đã khôi phục dữ liệu gốc","#1a73e8")))},document.getElementById("vnpt-btn-batch-del").onclick=()=>{const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row");let t=0;e.forEach(a=>{var n;(n=a.querySelector(".row-chk"))!=null&&n.checked&&(a.remove(),t++)}),t===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(e.forEach(a=>a.remove()),C("🗑️ Đã xóa toàn bộ","#ff5252"),A()):(C(`🗑️ Đã xóa ${t} trường`,"#ff5252"),A())},document.getElementById("vnpt-btn-add").onclick=()=>{const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;N("bien_moi_"+e,"","",""),A()},document.getElementById("vnpt-btn-fill-back").onclick=()=>{Fe();let e=0;c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(t=>{const a=t.querySelector(".f-key").value.trim(),n=t.querySelector(".f-val").value;a.split(",").map(i=>i.trim()).filter(Boolean).forEach(i=>{(document.getElementById(i)||document.getElementsByName(i)[0])&&(G(i,n),e++)})}),e>0?C(`✅ Đã điền ngược ${e} trường`,"#198754"):C("⚠️ Không khớp trường nào","#ffc107")}}function Re(e){const t=document.getElementById("vnpt-btn-default"),a=document.getElementById("vnpt-btn-reset-default");if(c.fieldsContainer.innerHTML="",c.bannerArea.innerHTML="",e){t.classList.add("active"),t.innerHTML="✅ Chế độ: Dữ liệu mặc định",a&&(a.style.display="flex"),c.fieldsContainer.classList.add("vnpt-mode-default"),C("📌 Chế độ Dữ liệu mặc định (Có thể sửa)","#ea4335");const n=document.createElement("div");n.className="vnpt-default-banner",n.innerHTML='<span style="color: red;"> LƯU Ý: ĐÂY LÀ DỮ LIỆU MẶC ĐỊNH</span>',c.bannerArea.appendChild(n);const i=h.get(V);i===null?Object.keys(I).forEach(r=>{const s=I[r],p=s&&typeof s=="object"?s.value:s,o=s&&typeof s=="object"?s.label:k[r]||"";N(r,p,o)}):Object.keys(i).forEach(r=>{const s=i[r];N(r,s.value,s.label,s.sync||"")})}else t.classList.remove("active"),t.innerHTML="🛠 Dữ liệu mặc định VNPT",a&&(a.style.display="none"),c.fieldsContainer.classList.remove("vnpt-mode-default"),C("📋 Đã quay lại Dữ liệu cá nhân"),Ke()}function Pe(e){if(!e)return e;const t={};return Object.keys(e).forEach(a=>{const n=e[a];a.split(",").map(r=>r.trim()).filter(r=>r).forEach(r=>{t[r]=n})}),t}function Ve(){const e={version:"1.0",timestamp:new Date().toISOString(),backup:{fields:h.get(se),defaultFields:h.get(V),dataDefault:Pe(h.get(z)),dataCustom:Pe(h.get(W)),dataSync:h.get(j),taxRate:h.get(Z),calcMap:h.get(U),templates:h.get(de)}},t=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),a=URL.createObjectURL(t),n=document.createElement("a");n.href=a,n.download=`vnpt_full_backup_${new Date().toLocaleDateString().replace(/\//g,"-")}.json`,n.click(),URL.revokeObjectURL(a),C("✅ Đã xuất file sao lưu hệ thống.")}async function je(e){return new Promise(t=>{const a=new FileReader;a.onload=n=>{try{const i=JSON.parse(n.target.result);if(!i.backup)throw new Error("File không đúng định dạng backup.");const r=i.backup;r.fields&&h.set(se,r.fields),r.defaultFields&&h.set(V,r.defaultFields),r.dataDefault&&h.set(z,r.dataDefault),r.dataCustom&&h.set(W,r.dataCustom),r.dataSync&&h.set(j,r.dataSync),r.taxRate&&h.set(Z,r.taxRate),r.calcMap&&h.set(U,r.calcMap),r.templates&&h.set(de,r.templates),C("✅ Đã nhập dữ liệu thành công! Vui lòng tải lại trang hoặc widget.","#1e8e3e"),t(!0)}catch{C("❌ Lỗi: File sao lưu không hợp lệ.","#ff5252"),t(!1)}},a.readAsText(e)})}function Tt(){const e=document.getElementById("vnpt-docx-widget")||document.createElement("div");e.id="vnpt-docx-widget";const t=h.get(xe)===!0;e.innerHTML=`
        <button id="vnpt-toggle-btn" title="Mở/Đóng UI Hợp đồng" class="${t?"btn-opened":"btn-closed"}">${t?"✖":"📄"}</button>

        <div id="vnpt-export-panel" style="display: ${t?"flex":"none"};">
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

                <!-- Template Manager -->
                <div id="vnpt-template-section">
                    <div id="vnpt-template-manager"></div>
                </div>

                <div class="bottom-export-row">
                    <div class="vnpt-control-group" id="vnpt-local-file-group">
                        <input type="file" id="vnpt-template-file" name="vnpt-template-file" accept=".docx" title="Hoặc sử dụng File nội bộ từ máy" />
                    </div>
                    <div class="vnpt-control-group">
                        <input type="text" id="vnpt-export-filename" name="vnpt-export-filename" value="Export_Auto.docx" title="Tên file DOCX khi xuất" />
                    </div>
                    <button class="vnpt-btn-action btn-export" id="vnpt-btn-export" title="Xuất ra file DOCX">🖨️ XUẤT FILE</button>
                </div>
            </div>
        </div>
    `,document.body.appendChild(e),c.widget=e,c.panel=document.getElementById("vnpt-export-panel"),c.toggleBtn=document.getElementById("vnpt-toggle-btn"),c.header=document.getElementById("vnpt-panel-header"),c.bannerArea=document.getElementById("vnpt-banner-area"),c.fieldsContainer=document.getElementById("vnpt-fields-list");try{const l=h.get(ye);l&&l.width&&l.height&&(c.panel.style.width=l.width+"px",c.panel.style.height=l.height+"px")}catch(l){console.error("Lỗi load size panel:",l)}new ResizeObserver(l=>{if(c.panel.style.display!=="none")for(let d of l){const{width:f,height:g}=d.contentRect;f>0&&g>0&&h.setDebounced(ye,{width:Math.round(f+20),height:Math.round(g+20)},1e3)}}).observe(c.panel),c.panelBody=document.getElementById("vnpt-panel-body"),q(document.getElementById("vnpt-template-manager"),(l,d)=>{c.templateBuffer=l,c.templateName=d}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const l=this.files&&this.files[0];if(!l)return;const d=document.getElementById("vnpt-template-manager");ot(l,d,(f,g)=>{c.templateBuffer=f,c.templateName=g}),this.value=""}),c.toggleBtn.addEventListener("click",l=>{c.hasDragged||(c.panel.style.display==="none"?(c.panel.style.display="flex",c.toggleBtn.className="btn-opened",c.toggleBtn.innerHTML="✖",h.set(xe,!0)):(c.panel.style.display="none",c.toggleBtn.className="btn-closed",c.toggleBtn.innerHTML="📄",h.set(xe,!1)))});const n=document.getElementById("vnpt-btn-more"),i=document.getElementById("vnpt-util-menu"),r={S:{width:"320px",height:"380px"},M:{width:"440px",height:"600px"},L:{width:"600px",height:"800px"},Full:{width:"98vw",height:"92vh"}},s=h.get(U)||{};i.querySelectorAll("input[data-clink]").forEach(l=>{const d=l.dataset.clink,f=s[d]||Oe[d]||[];l.value=f.join(", "),l.oninput=()=>{const g=h.get(U)||{};g[d]=l.value.split(",").map(m=>m.trim()).filter(m=>m),h.set(U,g)}}),document.getElementById("vnpt-btn-export-json").onclick=()=>Ve();const p=document.getElementById("vnpt-btn-import-json"),o=document.getElementById("vnpt-file-import-json");p.onclick=()=>o.click(),o.onchange=async l=>{l.target.files.length>0&&await je(l.target.files[0])&&setTimeout(()=>location.reload(),1500)},n.addEventListener("click",l=>{l.stopPropagation();const d=i.classList.toggle("show");n.classList.toggle("active",d)}),i.addEventListener("click",l=>{l.stopPropagation()}),document.addEventListener("click",l=>{i.classList.contains("show")&&(i.classList.remove("show"),n.classList.remove("active"))}),i.querySelectorAll(".size-options button").forEach(l=>{l.addEventListener("click",d=>{const f=d.target.getAttribute("data-size"),g=r[f];g&&(c.panel.style.width=g.width,c.panel.style.height=g.height),i.classList.remove("show"),n.classList.remove("active")})}),c.panel.querySelectorAll(".vnpt-resizer").forEach(l=>{l.addEventListener("mousedown",d=>{d.preventDefault(),d.stopPropagation();const f=d.clientX,g=d.clientY,m=c.panel.offsetWidth,b=c.panel.offsetHeight,v=c.widget.getBoundingClientRect(),x=v.top;window.innerWidth-v.right,c.panel.classList.add("vnpt-resizing"),document.body.classList.add("vnpt-resizing-global");const w=window.getComputedStyle(l).cursor;document.body.style.cursor=w;const T=L=>{const D=L.clientX-f,y=L.clientY-g;if(l.classList.contains("br"))c.panel.style.width=Math.max(360,m+D)+"px",c.panel.style.height=Math.max(250,b+y)+"px";else if(l.classList.contains("bl")){const E=m-D;E>360&&(c.panel.style.width=E+"px"),c.panel.style.height=Math.max(250,b+y)+"px"}else if(l.classList.contains("tr")){c.panel.style.width=Math.max(360,m+D)+"px";const E=b-y;E>250&&(c.panel.style.height=E+"px",c.widget.style.top=x+y+"px")}else if(l.classList.contains("tl")){const E=m-D,le=b-y;E>360&&(c.panel.style.width=E+"px"),le>250&&(c.panel.style.height=le+"px",c.widget.style.top=x+y+"px")}},S=()=>{window.removeEventListener("mousemove",T),window.removeEventListener("mouseup",S),c.panel.classList.remove("vnpt-resizing"),document.body.classList.remove("vnpt-resizing-global"),document.body.style.cursor="";const L=c.widget.id==="vnpt-docx-widget";h.setDebounced(ve,{right:L?c.widget.style.right:void 0,top:c.widget.style.top,x:L?void 0:parseFloat(c.widget.style.left),y:parseFloat(c.widget.style.top)},500),h.setDebounced(ye,{width:c.panel.offsetWidth,height:c.panel.offsetHeight},500)};window.addEventListener("mousemove",T),window.addEventListener("mouseup",S)})})}function Ue(e,t,a,n=null,i=null){let r=!1,s=0,p=0,o=!1;function u(d){o!==d&&(o=d,i&&i(d))}function l(d){if(d.button!==0||["INPUT","BUTTON","SELECT","TEXTAREA"].includes(d.target.tagName)||d.target.isContentEditable)return;r=!0,c.hasDragged=!1;const g=e.getBoundingClientRect();s=d.clientX-g.left,p=d.clientY-g.top,document.body.style.userSelect="none",t&&t.forEach(m=>m.style.cursor="grabbing"),n&&n(),d.preventDefault()}return t.forEach(d=>{d.addEventListener("mousedown",l)}),document.addEventListener("mousemove",function(d){if(!r)return;c.hasDragged=!0;let f=d.clientX-s,g=d.clientY-p;const m=window.innerWidth,b=window.innerHeight,v=document.getElementById("vnpt-toggle-btn"),x=v?v.offsetWidth:40,w=v?v.offsetHeight:40,T=e.id==="vnpt-docx-widget";let S=e.offsetWidth||0;if(T){let y=x+6-S,E=m-S+6;f<y&&(f=y),f>E&&(f=E)}else S=S||200,f<0&&(f=0),f+S>m&&(f=Math.max(0,m-S));let L=o;if(T?L=!1:o?d.clientY<b-40&&(L=!1):d.clientY>b-10&&(L=!0),g<0&&(g=0),L)u(!0),e.style.top=b-e.offsetHeight+"px",T?(e.style.right=m-f-S+"px",e.style.left="auto"):(e.style.left=f+"px",e.style.right="auto"),e.style.bottom="auto";else{u(!1);let D=e.offsetHeight||40,y;if(T)y=10+w;else{const E=e.querySelector(".cw-title-bar");y=E?E.offsetHeight:D}g+y>b&&(g=Math.max(0,b-y)),e.style.top=g+"px",T?(e.style.right=m-f-S+"px",e.style.left="auto"):(e.style.left=f+"px",e.style.right="auto"),e.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(r&&(r=!1,document.body.style.userSelect="",t&&t.forEach(d=>d.style.cursor="grab"),a)){const d=e.id==="vnpt-docx-widget";h.set(a,{left:d?void 0:e.style.left,right:d?e.style.right:void 0,top:e.style.top,x:d?void 0:parseFloat(e.style.left),y:parseFloat(e.style.top),docked:o})}}),{isDocked:()=>o,setDocked:u}}function kt(){c.widget&&c.header&&c.toggleBtn&&(Ue(c.widget,[c.header,c.toggleBtn],ve),window.addEventListener("resize",()=>{const e=window.innerWidth,t=window.innerHeight,a=document.getElementById("vnpt-toggle-btn"),n=a?a.offsetWidth:40,i=a?a.offsetHeight:40;let r=c.widget.getBoundingClientRect(),s=r.left,p=r.top,o=c.widget.offsetWidth||0,l=n+6-o,d=e-o+6;s<l&&(s=l),s>d&&(s=d),p+10+i>t&&(p=Math.max(0,t-(10+i))),c.widget.style.right=e-s-o+"px",c.widget.style.top=p+"px"}))}function $e(e){const t=e.toLowerCase(),{ngay:a,thang:n,nam:i}=Ie();return{"ngayky, ngayky1":a,ngayky:a,"thangky, thangky1":n,thangky:n,"namky, namky1":i,namky:i,soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[t]||""}function St(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){if(c.isDefaultMode){Object.keys(I).forEach(t=>{N(t,I[t],k[t]||"")}),A(),C("Đã nạp lại dữ liệu mặc định từ hệ thống.");return}let e=0;Object.keys(k).forEach(t=>{var s;const a=k[t],n=t.split(",")[0].trim(),i=X(n,a);let r="";i&&(r=i.tagName.toLowerCase()==="select"?((s=i.options[i.selectedIndex])==null?void 0:s.text)||"":i.value,e++),r||(r=$e(t)),r&&typeof r=="string"&&(["tenDaiDienn","tenToChuc","noiCap","noiKy"].includes(n)?r=dt(r):["sdt"].includes(n)?r=pt(r):["ngaySinhCustomer","ngayCapCustomer","ngayCapSoDkdnCustomer","ngayKy","ngayTiepNhan","ngayThangNamKy"].includes(n)&&(r=ut(r))),N(t,r,null)}),A(),e>0?(this.style.background="#1e8e3e",this.style.color="#fff",this.innerText="Đã quét xong",setTimeout(()=>{this.style.background="",this.style.color="",this.innerText="Quét dữ liệu"},1e3)):C("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(e){if(!(e.target.closest("#vnpt-docx-widget")||e.target.closest("#vnpt-inline-calc"))&&e.target&&e.target.id){const t=Object.keys(k).find(a=>a.split(",").map(n=>n.trim()).includes(e.target.id));t!==void 0&&(N(t,e.target.value,null),A())}}),document.addEventListener("change",function(e){var t;if(!(e.target.closest("#vnpt-docx-widget")||e.target.closest("#vnpt-inline-calc"))&&e.target&&e.target.id){const a=Object.keys(k).find(n=>n.split(",").map(i=>i.trim()).includes(e.target.id));if(a!==void 0){let n=e.target.tagName.toLowerCase()==="select"?((t=e.target.options[e.target.selectedIndex])==null?void 0:t.text)||"":e.target.value;N(a,n,null),A()}}})}const Nt={local:{download(e,t="arraybuffer"){return new Promise((a,n)=>{const i=new FileReader;switch(i.onload=r=>{let s=r.target.result;t==="base64"&&typeof s=="string"&&(s=s.split(",")[1]||s),a(s)},i.onerror=r=>n(r),t.toLowerCase()){case"arraybuffer":i.readAsArrayBuffer(e);break;case"base64":case"dataurl":i.readAsDataURL(e);break;case"text":i.readAsText(e);break;default:n(new Error(`Unsupported read type: ${t}`))}})},async upload(e){return this.download(e,"base64")}}},Lt={getAdapter(e){const t=Nt[e];if(!t)throw new Error(`Storage adapter not found: ${e}`);return t},async upload(e,t,a={}){return await this.getAdapter(e).upload(t,a)},async download(e,t,a={}){return await this.getAdapter(e).download(t,a.type||"arraybuffer")}};function qe(e,t,a){try{let n;try{n=new window.PizZip(e)}catch(o){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(o);return}const i=new window.docxtemplater(n,{paragraphLoop:!0,linebreaks:!0});i.render(t);const r=i.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),s=URL.createObjectURL(r),p=document.createElement("a");p.href=s,p.download=a,document.body.appendChild(p),p.click(),setTimeout(()=>{document.body.removeChild(p),URL.revokeObjectURL(s)},100)}catch(n){let i=n.message;n.properties&&n.properties.errors instanceof Array?i=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+n.properties.errors.map(s=>"- "+(s.properties.explanation||s.message)).join(`
`):i="Lỗi phần mềm Word sinh ra: "+i,alert(i),console.error("DocX Error:",n)}}function Dt(){const e=document.getElementById("vnpt-export-filename");e&&e.addEventListener("input",()=>{e.dataset.userEdited="1",e.value.trim()||(e.dataset.userEdited="0")});function t(){if(!e||e.dataset.userEdited==="1")return;let a="";if(c.fieldsContainer&&c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(o=>{const l=o.querySelector(".f-key").value.trim().split(",")[0].trim(),d=o.querySelector(".f-val").value.trim();l==="tenToChuc"&&(a=d)}),!a){const p=document.getElementById("tenToChuc");p&&(a=p.tagName.toLowerCase()==="textarea"||p.tagName.toLowerCase()==="input"?p.value.trim():p.innerText.trim())}function n(p){if(!p)return"";let o=p;return o=o.replace(/Tổng công ty/gi,""),o=o.replace(/Công ty/gi,""),o=o.replace(/\bCty\b/gi,""),o=o.replace(/Trách nhiệm hữu hạn/gi,""),o=o.replace(/\bTNHH\b/gi,""),o=o.replace(/Cổ phần/gi,""),o=o.replace(/\bCP\b/gi,""),o=o.replace(/Một thành viên/gi,""),o=o.replace(/\bMTV\b/gi,""),o=o.replace(/Chi nhánh/gi,""),o=o.replace(/Việt Nam/gi,"VN"),o=o.replace(/Viet Nam/gi,"VN"),o=o.replace(/\s+/g," ").trim(),o=o.replace(/^[-,\s]+|[-,\s]+$/g,""),o.length>50&&(o=o.substring(0,47)+"..."),o.replace(/[<>:"/\\|?*]/g,"")}let i=n(a),r=c.templateName?c.templateName.replace(/\.docx$/i,""):"",s=[];r&&s.push(r),i&&s.push(i),s.length>0?e.value=s.join(" - ")+".docx":e.value||(e.value="Export_Auto.docx")}setInterval(t,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const a={};if(c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(p=>{const u=p.querySelector(".f-key").value.trim().split(",")[0].trim(),l=p.querySelector(".f-val").value;u&&(a[u]=l)}),Object.keys(a).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}const i=[];if(Be.forEach(p=>{if(!a[p]||!a[p].trim()){const o=k[p]||p;i.push(o)}}),i.length>0){const p=`Cảnh báo: Bạn còn các trường sau chưa điền dữ liệu:

- ${i.join(`
- `)}

Bạn có chắc chắn muốn tiếp tục xuất file không?`;if(!confirm(p))return}let r=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(r.toLowerCase().endsWith(".docx")||(r+=".docx"),c.templateBuffer){qe(c.templateBuffer,a,r);return}const s=document.getElementById("vnpt-template-file");if(s.files&&s.files.length>0){Lt.download("local",s.files[0],{type:"arraybuffer"}).then(p=>qe(p,a,r)).catch(p=>alert(`Lỗi đọc file: ${p.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')})}const Bt=["chucVu","noiCap","noiCapSoDkdn","ngayky","ngayky1","thangky","namky","thangky1","namky1","noiKy"],It=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function At(){function e(){Bt.forEach(n=>{const i=document.getElementById(n);i&&!i.dataset.filled&&(i.dataset.filled="1",ie(i,$e(n)))}),It.forEach(n=>{const i=document.getElementById(n.src),r=document.getElementById(n.target);i&&r&&!i.dataset.bound&&(i.dataset.bound="1",i.addEventListener("input",()=>ie(r,i.value)))})}let t;new MutationObserver(()=>{clearTimeout(t),t=setTimeout(e,200)}).observe(document.body,{childList:!0,subtree:!0}),e()}function Y(e,t=null){return h.get(e,t)}function fe(e,t){h.set(e,t)}function Ge(e,t){if(!t||t.replace(/\D/g,"").length<6)return;let a=Y(e,[]);a=a.filter(n=>n!==t),a.unshift(t),fe(e,a.slice(0,10))}function ge(e,t){const a=document.getElementById(t);a&&(a.innerHTML=Y(e,[]).map(n=>`<option value="${n}">`).join(""))}function Se(e){return e.toLocaleString("en-US")}function Ne(e){return Number(String(e).replace(/[^\d]/g,""))||0}function Mt(e){return e.charAt(0).toUpperCase()+e.slice(1)}const oe=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function _t(e){let t=Math.floor(e/100),a=Math.floor(e%100/10),n=e%10,i="";return t>0&&(i+=oe[t]+" trăm ",a===0&&n>0&&(i+="lẻ ")),a>1?(i+=oe[a]+" mươi ",n===1?i+="mốt":n===5?i+="lăm":n>0&&(i+=oe[n])):a===1?(i+="mười ",n===5?i+="lăm":n>0&&(i+=oe[n])):n>0&&(t>0&&(i+="lẻ "),i+=oe[n]),i.trim()}function Ht(e){if(e===0)return"không";const t=["","nghìn","triệu","tỷ"];let a="",n=0;for(;e>0;){const i=e%1e3;i>0&&(a=_t(i)+" "+t[n]+" "+a),e=Math.floor(e/1e3),n++}return a.trim()}function We(e,t,a){let n=0,i=0,r=0;e==="before"?(n=Ne(t),i=Math.round(n*a),r=n+i):e==="tax"?(i=Ne(t),n=Math.round(i/a),r=n+i):e==="after"&&(r=Ne(t),n=Math.round(r/(1+a)),i=r-n);const s=Mt(Ht(r))+" đồng";return{beforeNum:n,taxNum:i,afterNum:r,beforeStr:Se(n),taxStr:Se(i),afterStr:Se(r),textStr:s}}function Ot(e,t){t.before&&t.before.forEach(a=>G(a,e.beforeStr)),t.tax&&t.tax.forEach(a=>G(a,e.taxStr)),t.after&&t.after.forEach(a=>G(a,e.afterStr)),t.text&&t.text.forEach(a=>G(a,e.textStr))}function me(e,t=null){try{const a=localStorage.getItem(e);return a!==null?JSON.parse(a):t}catch{return t}}function H(e,t){localStorage.setItem(e,JSON.stringify(t))}function zt(e,t,a,n){let i=me(ee)??"custom",r=me(z)??{...I},s=me(W)??{},p=me(j)??{};const o=document.createElement("div");o.className="cw-tab-header";const u={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};u.custom.innerText="📋 Custom",u.custom.className="cw-tab cw-tab-custom",u.default.innerText="📌 Default",u.default.className="cw-tab cw-tab-default",u.sync.innerText="🔗 Sync",u.sync.className="cw-tab cw-tab-sync";function l(){Object.values(u).forEach(y=>y.classList.remove("active")),u[i].classList.add("active")}l();const d=document.createElement("div");d.style.display=n.data?"none":"block";const f=t("📋 Cấu hình Data","data",y=>{d.style.display=y?"none":"block",a(e)}),g=document.createElement("div");g.className="cw-data-body";function m(){g.innerHTML="";let y=i==="sync"?p:i==="custom"?s:r,E=i==="sync"?j:i==="custom"?W:z;const le=Object.keys(y);le.length===0&&i!=="default"&&(g.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),le.forEach(B=>{const Q=document.createElement("div");Q.className="cw-data-row";let he=i!=="default";const R=y[B],be=R&&typeof R=="object"&&R.hasOwnProperty("value"),Xe=be?R.value:R,De=be&&R.label||B,M=document.createElement("input");M.type="text",M.value=De,M.id=`df-key-${B}`,M.name=`df-key-${B}`,M.className="cw-data-key"+(he?" mutable":""),M.title=B,M.readOnly=!he,he&&(M.onchange=()=>{const _=M.value.trim();if(!_||_===B){M.value=De;return}be?y[_]={...R,label:_}:y[_]=Xe,delete y[B],H(E,y),m()});const O=document.createElement("input");if(O.type="text",O.value=Xe??"",O.id=`df-val-${B}`,O.name=`df-val-${B}`,O.className="cw-data-val",O.oninput=()=>{be?y[B]={...R,value:O.value}:y[B]=O.value,H(E,y)},Q.appendChild(M),Q.appendChild(O),he){const _=document.createElement("button");_.innerHTML="✕",_.className="cw-del-btn",_.onclick=()=>{confirm(`Delete "${De}"?`)&&(delete y[B],H(E,y),m())},Q.appendChild(_)}else Q.appendChild(document.createElement("div")).className="cw-pad";g.appendChild(Q)})}u.custom.onclick=()=>{i="custom",H(ee,"custom"),l(),m()},u.default.onclick=()=>{i="default",H(ee,"default"),l(),m()},u.sync.onclick=()=>{i="sync",H(ee,"sync"),l(),m()};const b=document.createElement("button");b.innerText="📤",b.className="cw-icon-btn",b.title="Sao lưu toàn bộ dữ liệu ra JSON",b.onclick=()=>Ve();const v=document.createElement("button");v.innerText="📥",v.className="cw-icon-btn",v.title="Khôi phục dữ liệu từ JSON";const x=document.createElement("input");x.type="file",x.accept=".json",x.style.display="none",x.onchange=async y=>{y.target.files.length>0&&await je(y.target.files[0])&&setTimeout(()=>location.reload(),1500)},v.onclick=()=>x.click(),d.appendChild(o),o.appendChild(u.custom),o.appendChild(u.default),o.appendChild(u.sync),d.appendChild(g),e.appendChild(f),e.appendChild(d);const w=e.querySelector("#vnpt-cw-fill"),T=e.querySelector("#vnpt-cw-sync"),S=e.querySelector("#vnpt-cw-add"),L=e.querySelector("#vnpt-cw-reset");w&&(w.onclick=Fe),T&&(T.onclick=yt),S&&(S.onclick=()=>{i==="default"&&(i="custom",H(ee,"custom"),l());let y=i==="sync"?p:s,E="new_field_"+Date.now();y[E]="",H(i==="sync"?j:W,y),m(),g.scrollTop=g.scrollHeight}),L&&(L.onclick=()=>{confirm("Reset Default Data?")&&(r={...I},H(z,r),m())}),m();const D=f.querySelector(".cw-right-wrap")||document.createElement("div");D.className="cw-right-wrap",D.prepend(b),D.prepend(v),D.appendChild(x),f.appendChild(D)}function Ft(e,t,a){let n=Number(localStorage.getItem(Z))||vt,i=Y(ce)??{calc:!1,data:!0};function r(f,g){const m=document.createElement("button");return m.innerText=f,m.className="cw-action-btn "+g,m}function s(f,g,m){const b=document.createElement("div");b.className="wg-sec-header";const v=document.createElement("span");v.innerText=f;const x=document.createElement("button");return x.className="wg-toggle-btn",x.innerText=i[g]?"▾":"▴",b.appendChild(v),b.appendChild(x),x.onclick=()=>{i[g]=!i[g],x.innerText=i[g]?"▾":"▴",fe(ce,i),m(i[g])},b}function p(f){const g=window.innerWidth,m=window.innerHeight,b=f.getBoundingClientRect();f.style.left=Math.min(Math.max(parseFloat(f.style.left),0),g-b.width)+"px",f.style.top=Math.min(Math.max(parseFloat(f.style.top),0),m-36)+"px"}const o=document.createElement("div");if(!t){o.className="cw-title-bar",o.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const f=document.createElement("div");f.className="cw-btn-group";const g={fill:r("Fill","cw-btn-fill"),sync:r("Sync","cw-btn-sync"),add:r("Add","cw-btn-add"),reset:r("↺","cw-btn-reset")};g.reset.title="Reset Default fields",Object.values(g).forEach(m=>f.appendChild(m)),o.appendChild(f),e.appendChild(o)}const u=document.createElement("div");u.className="cw-body-inline",u.innerHTML=`
    <div class="cw-inline-row">
        <input id="wg-before" name="wg-before" class="cw-input-inline" placeholder="Trước thuế" list="wg-before-list" title="Trước thuế">
        <datalist id="wg-before-list"></datalist>
        <div class="cw-tax-group-inline"><input id="wg-taxRate" name="wg-taxRate" class="cw-tax-input-inline" title="Thuế (%)"><span class="cw-tax-symbol">%</span></div>
        <input id="wg-tax" name="wg-tax" class="cw-input-inline" placeholder="Tiền thuế" title="Tiền thuế">
        <input id="wg-after" name="wg-after" class="cw-input-inline" placeholder="Sau thuế" list="wg-after-list" title="Sau thuế">
        <datalist id="wg-after-list"></datalist>
        <input id="wg-text" name="wg-text" class="cw-input-inline cw-input-readonly-inline" placeholder="Bằng chữ" readonly title="Bằng chữ">
    </div>`,t?t.appendChild(u):e.appendChild(u),t||zt(e,s,p,i);const l={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text")};l.taxRate.value=n*100,ge(we,"wg-before-list"),ge(Ee,"wg-after-list");function d(f,g){const m=We(f,g,n);l.before.value=m.beforeStr,l.tax.value=m.taxStr,l.after.value=m.afterStr,l.text.value=m.textStr;const b=Y(U)||{...Oe};Ot(m,b)}if(l.taxRate.oninput=()=>{n=Number(l.taxRate.value)/100||0,fe(Z,n),d("before",l.before.value)},l.before.oninput=()=>{const f=We("before",l.before.value,n);l.tax.value=f.taxStr,l.after.value=f.afterStr,l.text.value=f.textStr},l.before.onchange=()=>{d("before",l.before.value),Ge(we,l.before.value),ge(we,"wg-before-list")},l.tax.oninput=()=>d("tax",l.tax.value),l.after.oninput=()=>d("after",l.after.value),l.after.onchange=()=>{d("after",l.after.value),Ge(Ee,l.after.value),ge(Ee,"wg-after-list")},[l.before,l.tax,l.after,l.text].forEach(f=>{["click","focus"].forEach(g=>f.addEventListener(g,()=>{if(!f.value)return;navigator.clipboard.writeText(f.value);const m=f.style.backgroundColor;f.style.backgroundColor="#d1e7dd",setTimeout(()=>f.style.backgroundColor=m,300)}))}),!t){const f=Array.from(e.children).filter(b=>b!==o),g=Ue(e,[o],a,null,b=>{f.forEach(v=>v.style.display=b?"none":""),o.style.borderRadius=b?"8px":"0",b&&(e.style.top=window.innerHeight-(o.offsetHeight||34)+"px")}),m=Y(a);return m&&m.docked&&g.setDocked(!0),window.addEventListener("resize",()=>{g.isDocked()?e.style.top=window.innerHeight-o.offsetHeight+"px":p(e)}),g}return null}function Kt(){const e=document.getElementById("vnpt-inline-calc"),t=document.getElementById("vnpt-btn-calc-toggle");let a=c.calcWidget||document.createElement("div");if(!e&&!c.calcWidget?(a.id="vnpt-calc-widget",document.body.appendChild(a),c.calcWidget=a):e&&(a=c.widget),e&&t){let n=Y(ce)??{calc:!1,data:!0};const i=r=>{e.style.display=r?"none":"block",t.classList.toggle("active",!r)};i(n.calc),t.onclick=()=>{n.calc=!n.calc,fe(ce,n),i(n.calc)}}return Ft(a,e,Je)}function Rt(){window.addEventListener("keydown",e=>{var t,a,n,i;if(e.altKey&&!e.ctrlKey&&!e.shiftKey){const r=e.key.toLowerCase();let s=!0;switch(r){case"s":(t=document.getElementById("vnpt-btn-scan"))==null||t.click();break;case"e":(a=document.getElementById("vnpt-btn-export"))==null||a.click();break;case"w":(n=document.getElementById("vnpt-toggle-btn"))==null||n.click();break;case"f":(i=document.getElementById("vnpt-btn-fill-back"))==null||i.click();break;default:s=!1;break}s&&e.preventDefault()}})}function Pt(){let e=!1;try{e=!1}catch{e=!1}e&&P.info("[Migration] Dev mode active - Syncing configurations...");let t=h.get(z);if(t){let n=!1;Object.keys(I).forEach(i=>{const r=I[i];if(!(i in t))t[i]=r,n=!0;else if(e){const s=t[i],p=r&&typeof r=="object",o=s&&typeof s=="object";let u=!1;!p&&!o?u=s!==r:p&&o?u=s.value!==r.value||s.label!==r.label:u=!0,u&&(t[i]=r,n=!0)}}),n&&h.set(z,t)}let a=h.get(V);if(a){let n=!1;Object.keys(I).forEach(i=>{const r=I[i],s=r&&typeof r=="object"?r.value:r,p=r&&typeof r=="object"?r.label:k[i]||"";if(!(i in a))a[i]={label:p,value:s,sync:""},n=!0;else if(e){const o=a[i];(o.value!==s||o.label!==p)&&(a[i]={label:p,value:s,sync:o.sync||""},n=!0)}}),n&&h.setDebounced(V,a,0)}}let re=null;function Le(){if(!window.__vnptInited){window.__vnptInited=!0,P.info("Initializing VNPT Userscript..."),Pt();try{Ye(),Tt(),Kt(),kt(),Ct(),Ke(),St(),Dt(),At(),Et(),Rt();const e=ze(()=>{ft(),P.debug("DOM Cache cleared due to mutations")},500);re=new MutationObserver(t=>{t.some(a=>a.addedNodes.length>0||a.removedNodes.length>0)&&e()}),re.observe(document.body,{childList:!0,subtree:!0}),P.info("Userscript initialized successfully.")}catch(e){P.error("Error during userscript initialization:",e)}}}function Vt(){P.info("Cleaning up VNPT Userscript for reload..."),re&&(re.disconnect(),re=null);const e=document.getElementById("vnpt-docx-widget");e&&e.remove();const t=document.getElementById("vnpt-calc-widget");t&&t.remove();const a=document.getElementById("vnpt-styles");a&&a.remove(),window.__vnptInited=!1,P.info("Cleanup completed.")}window.__vnptCleanup=Vt,window.__vnptInit=Le,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Le):Le()})();
