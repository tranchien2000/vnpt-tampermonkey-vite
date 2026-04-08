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
(function(){"use strict";const q={info:(...e)=>console.log("[Tampermonkey Script] INFO:",...e),error:(...e)=>console.error("[Tampermonkey Script] ERROR:",...e),warn:(...e)=>console.warn("[Tampermonkey Script] WARN:",...e)};function We(){const e="vnpt-styles";if(document.getElementById(e))return;const t=document.createElement("style");t.id=e,t.textContent=`
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

    `,document.head.appendChild(t)}const Xe={widget:null,panel:null,header:null,bannerArea:null,toggleBtn:null,fieldsContainer:null,panelBody:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1,templateBuffer:null,templateName:null,hasDragged:!1},Q=new Map,c=new Proxy(Xe,{get(e,t){return t==="on"?(a,n)=>{Q.has(a)||Q.set(a,[]),Q.get(a).push(n)}:e[t]},set(e,t,a){const n=e[t];return e[t]=a,n!==a&&Q.has(t)&&Q.get(t).forEach(o=>o(a,n)),!0}}),C={tenDaiDienn:"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT",emailDaiDien:"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Số GPKD | MST",goiDV:"Gói Dịch Vụ",ngayKy:"Ngày ký",thangKy:"Tháng Ký",namKy:"Năm ký",soHopDong:"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký"},Be=["soHopDong","tenDaiDienn","cmnd","sdt","diaChi","tenToChuc","ngayCapCustomer","emailDaiDien","soDkdn","goiDV","soHopDong"],se="vnpt_docx_fields",J="vnpt_docx_default_fields",ve="vnpt_docx_position",xe="vnpt_docx_size",ye="vnpt_docx_opened",U="vnpt_autofill_data_default",G="vnpt_autofill_data_custom",R="vnpt_autofill_data_sync",Ye="vnpt_widget_pos",Z="vnd_tax_rate",we="vnd_before_history",Ee="vnd_after_history",ce="vnpt_widget_collapsed",K="vnd_calc_map",ee="vnpt_widget_datatab",de="vnpt_templates";let z=null;function E(e,t="#198754",a=2500){z||(z=document.createElement("div"),z.id="vnpt-toast-container",Object.assign(z.style,{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column-reverse",alignItems:"center",gap:"8px",zIndex:"1000000",pointerEvents:"none"}),document.body.appendChild(z));const n=document.createElement("div");n.innerText=e,Object.assign(n.style,{background:t,color:"#fff",padding:"8px 18px",borderRadius:"24px",opacity:"0",transform:"translateY(10px)",transition:"opacity 0.3s, transform 0.3s",fontSize:"13px",fontWeight:"500",fontFamily:"'Segoe UI', Roboto, sans-serif",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",whiteSpace:"nowrap",pointerEvents:"auto"}),z.appendChild(n),requestAnimationFrame(()=>{n.style.opacity="1",n.style.transform="translateY(0)"}),setTimeout(()=>{n.style.opacity="0",n.style.transform="translateY(-10px)",setTimeout(()=>{n.remove(),z&&z.childNodes.length},300)},a)}const Qe="vnpt_templates_db",O="buffers";let pe=null;function Ce(){return pe?Promise.resolve(pe):new Promise((e,t)=>{const a=indexedDB.open(Qe,1);a.onupgradeneeded=n=>{const o=n.target.result;o.objectStoreNames.contains(O)||o.createObjectStore(O)},a.onsuccess=n=>{pe=n.target.result,e(pe)},a.onerror=()=>t(a.error)})}async function Je(e,t){const a=await Ce();return new Promise((n,o)=>{const d=a.transaction(O,"readwrite").objectStore(O).put(t,e);d.onsuccess=()=>n(),d.onerror=()=>o(d.error)})}async function Ze(e){const t=await Ce();return new Promise((a,n)=>{const s=t.transaction(O,"readonly").objectStore(O).get(e);s.onsuccess=()=>a(s.result),s.onerror=()=>n(s.error)})}async function et(e){const t=await Ce();return new Promise((a,n)=>{const s=t.transaction(O,"readwrite").objectStore(O).delete(e);s.onsuccess=()=>a(),s.onerror=()=>n(s.error)})}const P=new Map,ue=new Map,h={isGM:typeof GM_setValue<"u"&&typeof GM_getValue<"u",get(e,t=null){if(P.has(e))return P.get(e);try{let a;if(this.isGM?a=GM_getValue(e,null):a=localStorage.getItem(e),a==null)return t;const n=typeof a=="string"?JSON.parse(a):a;return P.set(e,n),n}catch(a){return console.warn(`[Storage] Không thể đọc key "${e}":`,a),t}},set(e,t){P.set(e,t);try{return this.isGM?GM_setValue(e,t):localStorage.setItem(e,JSON.stringify(t)),!0}catch(a){return console.error(`[Storage] Không thể ghi key "${e}":`,a),!1}},setDebounced(e,t,a=500){P.set(e,t),ue.has(e)&&clearTimeout(ue.get(e));const n=setTimeout(()=>{this.set(e,t),ue.delete(e)},a);ue.set(e,n)},remove(e){P.delete(e);try{this.isGM?GM_deleteValue(e):localStorage.removeItem(e)}catch(t){console.error(`[Storage] Không thể xóa key "${e}":`,t)}},clearCache(){P.clear()}};function te(){try{const e=h.get(de)||[],t=e.filter(a=>a.type!=="local");return t.length!==e.length&&ne(t),t}catch{return[]}}function ne(e){h.set(de,e)}function tt(e){const t=e.match(/drive\.google\.com\/file\/d\/([^/]+)/);return t?`https://drive.google.com/uc?export=download&id=${t[1]}`:e}function nt(e){return new Promise((t,a)=>{GM_xmlhttpRequest({method:"GET",url:tt(e),responseType:"arraybuffer",onload:n=>{if(n.status>=200&&n.status<300){if(n.response&&n.response.byteLength>4){const o=new Uint8Array(n.response.slice(0,4));if(o[0]===80&&o[1]===75&&o[2]===3&&o[3]===4){t(n.response);return}else{a(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}t(n.response)}else a(new Error(`HTTP ${n.status}: Không lấy được file`))},onerror:()=>a(new Error("Không thể tải URL.")),ontimeout:()=>a(new Error("Timeout khi tải URL."))})})}async function at(e,t,a){const n=e.name.replace(/\.docx$/i,""),o=prompt("Đặt tên biến nhớ cho file này:",n);if(!(!o||!o.trim()))try{const l=await e.arrayBuffer();await Je(o.trim(),l);const d=te().filter(r=>r.name!==o.trim()&&r.fileName!==e.name);d.unshift({name:o.trim(),type:"local_idb",fileName:e.name,lastUsed:Date.now()}),ne(d),V(t,a),a&&a(l,o.trim())}catch(l){E(`❌ Lỗi lưu file: ${l.message}`,"#dc3545")}}function V(e,t,a=null){let n=e.querySelector(".vnpt-template-manager-inner"),o,l;if(n)o=n.querySelector(".vnpt-local-list-container"),l=n.querySelector(".vnpt-btn-wrap");else{e.innerHTML="",n=document.createElement("div"),n.className="vnpt-template-manager-inner";const r=document.createElement("div");r.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const u=document.createElement("span");u.className="vnpt-title-main",u.style.cssText="font-size:11px;font-weight:700;color:#444;",l=document.createElement("div"),l.className="vnpt-btn-wrap",l.style.cssText="display:flex;gap:4px;",r.appendChild(u),r.appendChild(l),n.appendChild(r),o=document.createElement("div"),o.className="vnpt-local-list-container",o.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",n.appendChild(o),e.appendChild(n)}const s=te(),d=n.querySelector(".vnpt-title-main");d.innerHTML="Templates"+(a?` <span style="color:#2e7d32;">(Đang dùng: ${a})</span>`:""),s.length===0?o.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':o.innerHTML="",s.forEach((r,u)=>{const i=document.createElement("div");i.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",i.title=r.fileName||r.url||r.name,i.tabIndex=0,i.onfocus=()=>i.style.boxShadow="0 0 0 2px #28a745",i.onblur=()=>i.style.boxShadow="none";const p=r.type==="local"||r.type==="local_base64"||r.type==="local_idb"?"OFF":"ON",f=p==="OFF"?"#6c757d":"#28a745",g=document.createElement("span");g.textContent=p,g.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${f};color:#fff;`;const m=document.createElement("span");m.textContent=r.name,m.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",i.onclick=()=>{i.focus(),ot(r,t,a,e)},i.appendChild(g),i.appendChild(m);const b=document.createElement("button");b.innerHTML="✎",b.title="Đổi tên template",b.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",b.onclick=y=>{y.stopPropagation();const T=prompt("Đổi tên template:",r.name);if(T&&T.trim()&&T.trim()!==r.name){const k=te();k[u].name=T.trim(),ne(k),V(e,t,a)}},i.appendChild(b);const x=document.createElement("button");x.innerHTML="✕",x.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",x.onclick=async y=>{if(y.stopPropagation(),confirm(`Xoá biểu mẫu "${r.name}"?`)){const T=te();T.splice(u,1),ne(T),r.type==="local_idb"&&await et(r.name).catch(()=>null),V(e,t,a===r.name?null:a)}},i.appendChild(x),o.appendChild(i)})}function ot(e,t,a,n){const o=te(),l=o.find(s=>s.name===e.name&&(s.url===e.url||s.type===e.type));if(l&&(l.lastUsed=Date.now(),ne(o)),e.type==="local_idb"){Ze(e.name).then(s=>{if(!s)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");t&&t(s,e.name),V(n,t,e.name)}).catch(s=>{E(`❌ Lỗi nạp File IDB: ${s.message}`,"#dc3545")});return}if(e.type==="local_base64"&&e.data){try{const s=window.atob(e.data.split(",")[1]),d=s.length,r=new Uint8Array(d);for(let u=0;u<d;u++)r[u]=s.charCodeAt(u);t&&t(r.buffer,e.name),V(n,t,e.name)}catch(s){E(`❌ Lỗi nạp Base64: ${s.message}`,"#dc3545")}return}nt(e.url).then(s=>{t&&t(s,e.name),V(n,t,e.name)}).catch(s=>{E(`❌ ${s.message}`,"#dc3545")})}function it(e,t){if(e.length===0)return t.length;if(t.length===0)return e.length;const a=[];for(let n=0;n<=t.length;n++)a[n]=[n];for(let n=0;n<=e.length;n++)a[0][n]=n;for(let n=1;n<=t.length;n++)for(let o=1;o<=e.length;o++)t.charAt(n-1)===e.charAt(o-1)?a[n][o]=a[n-1][o-1]:a[n][o]=Math.min(a[n-1][o-1]+1,a[n][o-1]+1,a[n-1][o]+1);return a[t.length][e.length]}function rt(e,t){let a=e,n=t;e.length<t.length&&(a=t,n=e);const o=a.length;return o===0?1:(o-it(a,n))/parseFloat(o)}function lt(e,t,a=.7){let n=null,o=-1;const l=e.toLowerCase().trim();for(const s of t){const d=s.toLowerCase().trim(),r=rt(l,d);r>o&&r>=a&&(o=r,n=s)}return n}function st(e){return e?e.toLowerCase().split(" ").map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(" "):""}function ct(e){if(!e)return"";let t=e.replace(/\D/g,"");return t.startsWith("84")&&(t="0"+t.slice(2)),t}function dt(e){if(!e)return"";const t=e.split(/[-/]/);if(t.length===3){let a,n,o;return t[0].length===4?[o,n,a]=t:[a,n,o]=t,`${a.padStart(2,"0")}/${n.padStart(2,"0")}/${o}`}return e}const ae=new Map;function pt(){ae.clear()}function ut(e){e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function oe(e,t){var o;const a=e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,n=(o=Object.getOwnPropertyDescriptor(a,"value"))==null?void 0:o.set;n?n.call(e,t):e.value=t,ut(e)}function W(e,t=null){if(!e)return null;const a=ae.get(e);if(a&&document.contains(a))return a;const n=document.getElementById(e);if(n&&(n.tagName==="INPUT"||n.tagName==="TEXTAREA"||n.tagName==="SELECT"))return ae.set(e,n),n;const o=`input[id="${e}"], textarea[id="${e}"], select[id="${e}"], input[name="${e}"], textarea[name="${e}"], input[formcontrolname="${e}"], textarea[formcontrolname="${e}"], input[placeholder="${e}"], textarea[placeholder="${e}"]`,l=document.querySelector(o);if(l)return ae.set(e,l),l;const s=t||e,d=Array.from(document.querySelectorAll("label, .label, .label-text, span.title"));let r=d.find(u=>u.innerText.trim()===s);if(!r&&s.length>2){const u=d.map(p=>p.innerText.trim()).filter(p=>p.length>0),i=lt(s,u,.8);i&&(r=d.find(p=>p.innerText.trim()===i))}if(r){let u=null;if(r.htmlFor&&(u=document.getElementById(r.htmlFor)),!u){let i=r.parentElement,p=0;for(;i&&p<3;){const f=i.querySelector("input, textarea, select");if(f){u=f;break}i=i.parentElement,p++}}if(u)return ae.set(e,u),u}return null}function Te(e){return W(null,e)}function j(e,t,a=null){const n=W(e,a);n&&oe(n,t)}function ft(e=new Date){return String(e.getDate()).padStart(2,"0")}function gt(e=new Date){return String(e.getMonth()+1).padStart(2,"0")}function mt(e=new Date){return String(e.getFullYear())}function Ie(){const e=new Date;return{ngay:ft(e),thang:gt(e),nam:mt(e)}}const{ngay:Ae,thang:Me,nam:_e}=Ie(),$={ngayKy:{label:"Ngày ký",value:Ae},"thangKy, thangKy1":{label:"Tháng ký",value:Me},"namKy, namKy1":{label:"Năm ký",value:_e},"ngayTiepNhan, ngayThangNamKy":{label:"Ngày ký (full)",value:`${Ae}/${Me}/${_e}`},tenDoanhNghiepB:{label:"Tên doanh nghiệp B",value:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM"},diaChiB:{label:"Địa chỉ B",value:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội"},maSoThueB:{label:"Mã số thuế B",value:"0100686223"},stkB:{label:"Số tài khoản B",value:"1600114156"},diaChiStkB:{label:"Ngân hàng/Địa chỉ STK B",value:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)"},"tenB, nguoiDaiDienB":{label:"Người đại diện B",value:"Phạm Khánh Chung"},"chucVuB, chucVuDaiDienB":{label:"Chức vụ B",value:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp"},"giayUyQuyenSoB, soGiayUyQuyenB":{label:"Giấy ủy quyền số B",value:"2628/GUQ-VNPT-HNI-VP"},"giayUyQuyenNgayB, ngayGiayUyQuyenB":{label:"Giấy ủy quyền ngày B",value:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},GiayUyQuyenB:{label:"Giấy ủy quyền B (full)",value:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},tenDoanhNghiepB1:{label:"Tên doanh nghiệp B (phụ)",value:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},donViTiepNhan:{label:"Đơn vị tiếp nhận",value:"TTKD KHDN"},"tenTiepNhan, tenNguoiNhan":{label:"Người tiếp nhận",value:"Bùi Anh"},dienThoaiB:{label:"Điện thoại B",value:"02436686868"},diaChiTaiKhoanB:{label:"Địa chỉ tài khoản B",value:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 "},noiKy:{label:"Nơi ký",value:"Hà Nội"},emailB:{label:"Email B",value:""},"lienheHopDongB, lienheTuVanB, lienheHoaDonB, sucoCap1B, sucoCap2B, sucoCap3B, sucoCap4B":{label:"Liên hệ B (AM)",value:"AM Bùi Anh"}},He={soHopDong:"inputContractGroupName, contractName"},ht={after:["cuocDV","tongCong","tongCongHD","congCA","giaTriHopDong","tongGIaTriHopDong"],before:["donGiaCA","thanhTienCA","tongThanhTien","tongCuocTruocThue"],tax:["tongThueGTGT","tongThue","thueCA","thueVAT"],text:["soTienThanhToanBangChu","tongCongBangChu","tongCongHDbangChu","ghiChuGiaTriHopDong","tongGiaTriHopDongBangChu"]},bt=.08;function ze(e,t){let a;return function(...o){const l=()=>{clearTimeout(a),e(...o)};clearTimeout(a),a=setTimeout(l,t)}}function Oe(){const e=h.get(U)??{...$},t=h.get(G)??{},a={...e,...t};Object.keys(a).forEach(n=>{const o=a[n],l=o&&typeof o=="object"&&o.hasOwnProperty("value")?o.value:o;n.split(",").map(d=>d.trim()).filter(d=>d).forEach(d=>{let r=W(d)||Te(d);r&&oe(r,l)})}),E("✅ Auto fill complete")}function vt(){let e=h.get(R)??{};const t={...He,...e},a=Object.keys(t);if(a.length===0){E("⚠️ No sync mapping","#ffc107");return}a.forEach(n=>{let o=W(n)||Te(n);o&&o.value!==void 0&&o.value!==""&&t[n].split(",").map(s=>s.trim()).filter(s=>s).forEach(s=>j(s,o.value))}),E("✅ Sync form complete","#d39e00")}let ke=!1;const xt=(e,t)=>{var r;if(ke)return;let a=h.get(R)??{};const n={...He,...a};if(Object.keys(n).length===0)return;let o=e.id,l=e.name,s=null;if(o){const u=document.querySelector(`label[for="${o}"]`);u&&(s=u.textContent.trim())}if(!s){const u=e.closest("label");u&&(s=(r=Array.from(u.childNodes).find(i=>i.nodeType===3))==null?void 0:r.textContent.trim())}let d=n[o]||n[l]||n[s];if(d){ke=!0;try{d.split(",").map(i=>i.trim()).filter(i=>i).forEach(i=>{if(i!==o&&i!==l&&i!==s){const p=W(i)||Te(i);p&&document.activeElement!==p&&oe(p,t)}})}finally{ke=!1}}},yt=ze((e,t)=>{xt(e,t)},250);function wt(){document.addEventListener("input",e=>{const t=e.target;!t||!["INPUT","TEXTAREA"].includes(t.tagName)||t.closest("#vnpt-docx-widget")||t.closest("#vnpt-inline-calc")||yt(t,t.value)})}function L(e,t,a=null,n=""){const o=c.fieldsContainer.querySelector(".text-hint");o&&o.remove();const l=c.fieldsContainer.querySelectorAll(".f-key");let s=!1;for(let d of l)if(d.value.split(",")[0].trim()===e){const u=d.closest(".vnpt-field-row"),i=u.querySelector(".f-val"),p=u.querySelector(".f-label");t!==""&&i.value!==t&&document.activeElement!==i&&(i.value=t),a!==null&&a!==""&&p.value!==a&&document.activeElement!==p&&(p.value=a),n!==""&&d.value!==e+", "+n&&document.activeElement!==d&&(d.value=e+", "+n),s=!0;break}if(!s){(a===null||a==="")&&(a=C[e]||"");const d=document.createElement("div");d.className="vnpt-field-row row-item",d.setAttribute("draggable","false");let r=e;n&&(r+=", "+n),d.innerHTML=`
            <input type="checkbox" id="chk-${e}" name="chk-${e}" class="row-chk" title="Chọn" style="margin: 0 2px 0 2px;" />
            <input type="text" id="lbl-${e}" name="lbl-${e}" class="f-label" value="${a}" />
            <input type="text" id="key-${e}" name="key-${e}" class="f-key" value="${r}" title="Biến DOCX và IDs đồng bộ" />
            <span class="row-drag-handle" title="Kéo">=</span>
            <input type="text" id="val-${e}" name="val-${e}" class="f-val" value="${t}" />
        `;const u=d.querySelector(".f-val"),i=d.querySelector(".f-key");e==="tenToChuc"&&(u.style.textAlign="right");const p=()=>{Be.includes(e)&&(u.value.trim()?u.classList.remove("field-required-empty"):u.classList.add("field-required-empty"))},f=()=>{const m=u.value;i.value.split(",").map(x=>x.trim()).filter(x=>x).forEach(x=>j(x,m))};i.addEventListener("input",function(){I();const m=this.value.split(",")[0].trim();u.style.textAlign=m==="tenToChuc"?"right":"",f()}),d.querySelector(".f-label").addEventListener("input",I),u.addEventListener("input",function(){I(),f(),p()}),p();const g=d.querySelector(".row-drag-handle");g.addEventListener("mouseenter",()=>d.setAttribute("draggable","true")),g.addEventListener("mouseleave",()=>{d.classList.contains("dragging")||d.setAttribute("draggable","false")}),d.addEventListener("dragstart",function(m){c.draggedRowForVNPT=this,m.dataTransfer.effectAllowed="move",m.dataTransfer.setData("text/plain",e),this.classList.add("dragging")}),d.addEventListener("dragover",m=>(m.preventDefault(),!1)),d.addEventListener("dragenter",function(){this.classList.add("over")}),d.addEventListener("dragleave",function(){this.classList.remove("over")}),d.addEventListener("drop",function(m){if(m.stopPropagation(),c.draggedRowForVNPT&&c.draggedRowForVNPT!==this){const b=Array.from(c.fieldsContainer.querySelectorAll(".vnpt-field-row")),x=b.indexOf(c.draggedRowForVNPT),y=b.indexOf(this);x<y?this.parentNode.insertBefore(c.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(c.draggedRowForVNPT,this),I()}return!1}),d.addEventListener("dragend",function(){this.setAttribute("draggable","false"),c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(m=>{m.classList.remove("over","dragging")}),c.draggedRowForVNPT=null}),c.fieldsContainer.appendChild(d),c.fieldsContainer.scrollTop=c.fieldsContainer.scrollHeight}}function I(){const e=c.isDefaultMode?J:se,t={};c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(n=>{const l=n.querySelector(".f-key").value.trim().split(",").map(i=>i.trim()).filter(i=>i),s=l[0],d=l.slice(1).join(", "),r=n.querySelector(".f-label").value.trim(),u=n.querySelector(".f-val").value;s&&(t[s]={label:r,value:u,sync:d})}),h.setDebounced(e,t,1e3)}function Fe(){try{c.fieldsContainer.innerHTML="";const t=h.get(se)||{};Object.keys(C).forEach(a=>{const n=C[a],o=t[a];o&&typeof o=="object"?L(a,o.value,o.label||n,o.sync||""):o?L(a,o,n,""):L(a,"",n,"")}),Object.keys(t).forEach(a=>{if(!(a in C)){const n=t[a];typeof n=="object"?L(a,n.value,n.label,n.sync||""):L(a,n,"","")}}),Object.keys(C).length===0&&Object.keys(t).length===0&&(c.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(t){console.error("Error loading config:",t),Object.keys(C).forEach(a=>L(a,"",C[a]))}const e=h.get(ve);e&&c.widget&&(c.widget.style.bottom="auto",e.right?(c.widget.style.right=e.right,c.widget.style.left="auto"):e.left&&(c.widget.style.left=e.left,c.widget.style.right="auto"),e.top&&(c.widget.style.top=e.top))}function Et(){document.getElementById("vnpt-btn-toggle-id").onclick=()=>c.fieldsContainer.classList.toggle("show-ids"),document.getElementById("vnpt-btn-default").onclick=()=>{c.isDefaultMode=!c.isDefaultMode},c.on("isDefaultMode",e=>Re(e)),document.getElementById("vnpt-btn-reset-default").onclick=()=>{confirm("Khôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?")&&(h.remove(J),h.remove(K),h.remove(Z),c.isDefaultMode&&(Re(!0),E("🔄 Đã khôi phục dữ liệu gốc","#1a73e8")))},document.getElementById("vnpt-btn-batch-del").onclick=()=>{const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row");let t=0;e.forEach(a=>{var n;(n=a.querySelector(".row-chk"))!=null&&n.checked&&(a.remove(),t++)}),t===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(e.forEach(a=>a.remove()),E("🗑️ Đã xóa toàn bộ","#ff5252"),I()):(E(`🗑️ Đã xóa ${t} trường`,"#ff5252"),I())},document.getElementById("vnpt-btn-add").onclick=()=>{const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;L("bien_moi_"+e,"","",""),I()},document.getElementById("vnpt-btn-fill-back").onclick=()=>{Oe();let e=0;c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(t=>{const a=t.querySelector(".f-key").value.trim(),n=t.querySelector(".f-val").value;a.split(",").map(o=>o.trim()).filter(Boolean).forEach(o=>{(document.getElementById(o)||document.getElementsByName(o)[0])&&(j(o,n),e++)})}),e>0?E(`✅ Đã điền ngược ${e} trường`,"#198754"):E("⚠️ Không khớp trường nào","#ffc107")}}function Re(e){const t=document.getElementById("vnpt-btn-default"),a=document.getElementById("vnpt-btn-reset-default");if(c.fieldsContainer.innerHTML="",c.bannerArea.innerHTML="",e){t.classList.add("active"),t.innerHTML="✅ Chế độ: Dữ liệu mặc định",a&&(a.style.display="flex"),c.fieldsContainer.classList.add("vnpt-mode-default"),E("📌 Chế độ Dữ liệu mặc định (Có thể sửa)","#ea4335");const n=document.createElement("div");n.className="vnpt-default-banner",n.innerHTML="<span> Lưu ý: đây là Dữ liệu mặc định (Có thể sửa/lưu)</span>",c.bannerArea.appendChild(n);const o=h.get(J);o===null?Object.keys($).forEach(l=>{const s=$[l],d=s&&typeof s=="object"?s.value:s,r=s&&typeof s=="object"?s.label:C[l]||"";L(l,d,r)}):Object.keys(o).forEach(l=>{const s=o[l];L(l,s.value,s.label,s.sync||"")})}else t.classList.remove("active"),t.innerHTML="🛠 Dữ liệu mặc định VNPT",a&&(a.style.display="none"),c.fieldsContainer.classList.remove("vnpt-mode-default"),E("📋 Đã quay lại Dữ liệu cá nhân"),Fe()}function Ke(){const e={version:"1.0",timestamp:new Date().toISOString(),backup:{fields:h.get(se),defaultFields:h.get(J),dataDefault:h.get(U),dataCustom:h.get(G),dataSync:h.get(R),taxRate:h.get(Z),calcMap:h.get(K),templates:h.get(de)}},t=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),a=URL.createObjectURL(t),n=document.createElement("a");n.href=a,n.download=`vnpt_full_backup_${new Date().toLocaleDateString().replace(/\//g,"-")}.json`,n.click(),URL.revokeObjectURL(a),E("✅ Đã xuất file sao lưu hệ thống.")}async function Pe(e){return new Promise(t=>{const a=new FileReader;a.onload=n=>{try{const o=JSON.parse(n.target.result);if(!o.backup)throw new Error("File không đúng định dạng backup.");const l=o.backup;l.fields&&h.set(se,l.fields),l.defaultFields&&h.set(J,l.defaultFields),l.dataDefault&&h.set(U,l.dataDefault),l.dataCustom&&h.set(G,l.dataCustom),l.dataSync&&h.set(R,l.dataSync),l.taxRate&&h.set(Z,l.taxRate),l.calcMap&&h.set(K,l.calcMap),l.templates&&h.set(de,l.templates),E("✅ Đã nhập dữ liệu thành công! Vui lòng tải lại trang hoặc widget.","#1e8e3e"),t(!0)}catch{E("❌ Lỗi: File sao lưu không hợp lệ.","#ff5252"),t(!1)}},a.readAsText(e)})}function Ct(){const e=document.getElementById("vnpt-docx-widget")||document.createElement("div");e.id="vnpt-docx-widget";const t=h.get(ye)===!0;e.innerHTML=`
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
    `,document.body.appendChild(e),c.widget=e,c.panel=document.getElementById("vnpt-export-panel"),c.toggleBtn=document.getElementById("vnpt-toggle-btn"),c.header=document.getElementById("vnpt-panel-header"),c.bannerArea=document.getElementById("vnpt-banner-area"),c.fieldsContainer=document.getElementById("vnpt-fields-list");try{const i=h.get(xe);i&&i.width&&i.height&&(c.panel.style.width=i.width+"px",c.panel.style.height=i.height+"px")}catch(i){console.error("Lỗi load size panel:",i)}new ResizeObserver(i=>{if(c.panel.style.display!=="none")for(let p of i){const{width:f,height:g}=p.contentRect;f>0&&g>0&&h.setDebounced(xe,{width:Math.round(f+20),height:Math.round(g+20)},1e3)}}).observe(c.panel),c.panelBody=document.getElementById("vnpt-panel-body"),V(document.getElementById("vnpt-template-manager"),(i,p)=>{c.templateBuffer=i,c.templateName=p}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const i=this.files&&this.files[0];if(!i)return;const p=document.getElementById("vnpt-template-manager");at(i,p,(f,g)=>{c.templateBuffer=f,c.templateName=g}),this.value=""}),c.toggleBtn.addEventListener("click",i=>{c.hasDragged||(c.panel.style.display==="none"?(c.panel.style.display="flex",c.toggleBtn.className="btn-opened",c.toggleBtn.innerHTML="✖",h.set(ye,!0)):(c.panel.style.display="none",c.toggleBtn.className="btn-closed",c.toggleBtn.innerHTML="📄",h.set(ye,!1)))});const n=document.getElementById("vnpt-btn-more"),o=document.getElementById("vnpt-util-menu"),l={S:{width:"320px",height:"380px"},M:{width:"440px",height:"600px"},L:{width:"600px",height:"800px"},Full:{width:"98vw",height:"92vh"}},s=h.get(K)||{};o.querySelectorAll("input[data-clink]").forEach(i=>{const p=i.dataset.clink;s[p]&&(i.value=s[p].join(", ")),i.oninput=()=>{const f=h.get(K)||{};f[p]=i.value.split(",").map(g=>g.trim()).filter(g=>g),h.set(K,f)}}),document.getElementById("vnpt-btn-export-json").onclick=()=>Ke();const d=document.getElementById("vnpt-btn-import-json"),r=document.getElementById("vnpt-file-import-json");d.onclick=()=>r.click(),r.onchange=async i=>{i.target.files.length>0&&await Pe(i.target.files[0])&&setTimeout(()=>location.reload(),1500)},n.addEventListener("click",i=>{i.stopPropagation();const p=o.classList.toggle("show");n.classList.toggle("active",p)}),o.addEventListener("click",i=>{i.stopPropagation()}),document.addEventListener("click",i=>{o.classList.contains("show")&&(o.classList.remove("show"),n.classList.remove("active"))}),o.querySelectorAll(".size-options button").forEach(i=>{i.addEventListener("click",p=>{const f=p.target.getAttribute("data-size"),g=l[f];g&&(c.panel.style.width=g.width,c.panel.style.height=g.height),o.classList.remove("show"),n.classList.remove("active")})}),c.panel.querySelectorAll(".vnpt-resizer").forEach(i=>{i.addEventListener("mousedown",p=>{p.preventDefault(),p.stopPropagation();const f=p.clientX,g=p.clientY,m=c.panel.offsetWidth,b=c.panel.offsetHeight,x=c.widget.getBoundingClientRect(),y=x.top;window.innerWidth-x.right,c.panel.classList.add("vnpt-resizing"),document.body.classList.add("vnpt-resizing-global");const T=window.getComputedStyle(i).cursor;document.body.style.cursor=T;const k=N=>{const D=N.clientX-f,v=N.clientY-g;if(i.classList.contains("br"))c.panel.style.width=Math.max(360,m+D)+"px",c.panel.style.height=Math.max(250,b+v)+"px";else if(i.classList.contains("bl")){const w=m-D;w>360&&(c.panel.style.width=w+"px"),c.panel.style.height=Math.max(250,b+v)+"px"}else if(i.classList.contains("tr")){c.panel.style.width=Math.max(360,m+D)+"px";const w=b-v;w>250&&(c.panel.style.height=w+"px",c.widget.style.top=y+v+"px")}else if(i.classList.contains("tl")){const w=m-D,le=b-v;w>360&&(c.panel.style.width=w+"px"),le>250&&(c.panel.style.height=le+"px",c.widget.style.top=y+v+"px")}},S=()=>{window.removeEventListener("mousemove",k),window.removeEventListener("mouseup",S),c.panel.classList.remove("vnpt-resizing"),document.body.classList.remove("vnpt-resizing-global"),document.body.style.cursor="";const N=c.widget.id==="vnpt-docx-widget";h.setDebounced(ve,{right:N?c.widget.style.right:void 0,top:c.widget.style.top,x:N?void 0:parseFloat(c.widget.style.left),y:parseFloat(c.widget.style.top)},500),h.setDebounced(xe,{width:c.panel.offsetWidth,height:c.panel.offsetHeight},500)};window.addEventListener("mousemove",k),window.addEventListener("mouseup",S)})})}function Ve(e,t,a,n=null,o=null){let l=!1,s=0,d=0,r=!1;function u(p){r!==p&&(r=p,o&&o(p))}function i(p){if(p.button!==0)return;l=!0,c.hasDragged=!1;const f=e.getBoundingClientRect();s=p.clientX-f.left,d=p.clientY-f.top,document.body.style.userSelect="none",t&&t.forEach(g=>g.style.cursor="grabbing"),n&&n(),p.preventDefault()}return t.forEach(p=>{p.addEventListener("mousedown",i)}),document.addEventListener("mousemove",function(p){if(!l)return;c.hasDragged=!0;let f=p.clientX-s,g=p.clientY-d;const m=window.innerWidth,b=window.innerHeight,x=document.getElementById("vnpt-toggle-btn"),y=x?x.offsetWidth:40,T=x?x.offsetHeight:40,k=e.id==="vnpt-docx-widget";let S=e.offsetWidth||0;if(k){let v=y+6-S,w=m-S+6;f<v&&(f=v),f>w&&(f=w)}else S=S||200,f<0&&(f=0),f+S>m&&(f=Math.max(0,m-S));let N=r;if(k?N=!1:r?p.clientY<b-40&&(N=!1):p.clientY>b-10&&(N=!0),g<0&&(g=0),N)u(!0),e.style.top=b-e.offsetHeight+"px",k?(e.style.right=m-f-S+"px",e.style.left="auto"):(e.style.left=f+"px",e.style.right="auto"),e.style.bottom="auto";else{u(!1);let D=e.offsetHeight||40,v;if(k)v=10+T;else{const w=e.querySelector(".cw-title-bar");v=w?w.offsetHeight:D}g+v>b&&(g=Math.max(0,b-v)),e.style.top=g+"px",k?(e.style.right=m-f-S+"px",e.style.left="auto"):(e.style.left=f+"px",e.style.right="auto"),e.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(l&&(l=!1,document.body.style.userSelect="",t&&t.forEach(p=>p.style.cursor="grab"),a)){const p=e.id==="vnpt-docx-widget";h.set(a,{left:p?void 0:e.style.left,right:p?e.style.right:void 0,top:e.style.top,x:p?void 0:parseFloat(e.style.left),y:parseFloat(e.style.top),docked:r})}}),{isDocked:()=>r,setDocked:u}}function Tt(){c.widget&&c.header&&c.toggleBtn&&(Ve(c.widget,[c.header,c.toggleBtn],ve),window.addEventListener("resize",()=>{const e=window.innerWidth,t=window.innerHeight,a=document.getElementById("vnpt-toggle-btn"),n=a?a.offsetWidth:40,o=a?a.offsetHeight:40;let l=c.widget.getBoundingClientRect(),s=l.left,d=l.top,r=c.widget.offsetWidth||0,i=n+6-r,p=e-r+6;s<i&&(s=i),s>p&&(s=p),d+10+o>t&&(d=Math.max(0,t-(10+o))),c.widget.style.right=e-s-r+"px",c.widget.style.top=d+"px"}))}function je(e){const t=e.toLowerCase(),{ngay:a,thang:n,nam:o}=Ie();return{ngayky:a,thangky:n,thangky1:n,namky:o,namky1:o,soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[t]||""}function kt(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){if(c.isDefaultMode){Object.keys($).forEach(t=>{L(t,$[t],C[t]||"")}),I(),E("Đã nạp lại dữ liệu mặc định từ hệ thống.");return}let e=0;Object.keys(C).forEach(t=>{var l;const a=C[t],n=W(t,a);let o="";n&&(o=n.tagName.toLowerCase()==="select"?((l=n.options[n.selectedIndex])==null?void 0:l.text)||"":n.value,e++),o||(o=je(t)),o&&typeof o=="string"&&(["tenDaiDienn","tenToChuc","noiCap","noiKy"].includes(t)?o=st(o):["sdt"].includes(t)?o=ct(o):["ngaySinhCustomer","ngayCapCustomer","ngayCapSoDkdnCustomer","ngayKy"].includes(t)&&(o=dt(o))),L(t,o,null)}),I(),e>0?(this.style.background="#1e8e3e",this.style.color="#fff",this.innerText="Đã quét xong",setTimeout(()=>{this.style.background="",this.style.color="",this.innerText="Quét dữ liệu"},1e3)):E("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(e){e.target.closest("#vnpt-docx-widget")||e.target.closest("#vnpt-inline-calc")||e.target&&e.target.id&&C[e.target.id]!==void 0&&(L(e.target.id,e.target.value,null),I())}),document.addEventListener("change",function(e){var t;if(!(e.target.closest("#vnpt-docx-widget")||e.target.closest("#vnpt-inline-calc"))&&e.target&&e.target.id&&C[e.target.id]!==void 0){let a=e.target.tagName.toLowerCase()==="select"?((t=e.target.options[e.target.selectedIndex])==null?void 0:t.text)||"":e.target.value;L(e.target.id,a,null),I()}})}const St={local:{download(e,t="arraybuffer"){return new Promise((a,n)=>{const o=new FileReader;switch(o.onload=l=>{let s=l.target.result;t==="base64"&&typeof s=="string"&&(s=s.split(",")[1]||s),a(s)},o.onerror=l=>n(l),t.toLowerCase()){case"arraybuffer":o.readAsArrayBuffer(e);break;case"base64":case"dataurl":o.readAsDataURL(e);break;case"text":o.readAsText(e);break;default:n(new Error(`Unsupported read type: ${t}`))}})},async upload(e){return this.download(e,"base64")}}},Lt={getAdapter(e){const t=St[e];if(!t)throw new Error(`Storage adapter not found: ${e}`);return t},async upload(e,t,a={}){return await this.getAdapter(e).upload(t,a)},async download(e,t,a={}){return await this.getAdapter(e).download(t,a.type||"arraybuffer")}};function $e(e,t,a){try{let n;try{n=new window.PizZip(e)}catch(r){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(r);return}const o=new window.docxtemplater(n,{paragraphLoop:!0,linebreaks:!0});o.render(t);const l=o.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),s=URL.createObjectURL(l),d=document.createElement("a");d.href=s,d.download=a,document.body.appendChild(d),d.click(),setTimeout(()=>{document.body.removeChild(d),URL.revokeObjectURL(s)},100)}catch(n){let o=n.message;n.properties&&n.properties.errors instanceof Array?o=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+n.properties.errors.map(s=>"- "+(s.properties.explanation||s.message)).join(`
`):o="Lỗi phần mềm Word sinh ra: "+o,alert(o),console.error("DocX Error:",n)}}function Nt(){const e=document.getElementById("vnpt-export-filename");e&&e.addEventListener("input",()=>{e.dataset.userEdited="1",e.value.trim()||(e.dataset.userEdited="0")});function t(){if(!e||e.dataset.userEdited==="1")return;let a="";if(c.fieldsContainer&&c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(r=>{const i=r.querySelector(".f-key").value.trim().split(",")[0].trim(),p=r.querySelector(".f-val").value.trim();i==="tenToChuc"&&(a=p)}),!a){const d=document.getElementById("tenToChuc");d&&(a=d.tagName.toLowerCase()==="textarea"||d.tagName.toLowerCase()==="input"?d.value.trim():d.innerText.trim())}function n(d){if(!d)return"";let r=d;return r=r.replace(/Tổng công ty/gi,""),r=r.replace(/Công ty/gi,""),r=r.replace(/\bCty\b/gi,""),r=r.replace(/Trách nhiệm hữu hạn/gi,""),r=r.replace(/\bTNHH\b/gi,""),r=r.replace(/Cổ phần/gi,""),r=r.replace(/\bCP\b/gi,""),r=r.replace(/Một thành viên/gi,""),r=r.replace(/\bMTV\b/gi,""),r=r.replace(/Chi nhánh/gi,""),r=r.replace(/Việt Nam/gi,"VN"),r=r.replace(/Viet Nam/gi,"VN"),r=r.replace(/\s+/g," ").trim(),r=r.replace(/^[-,\s]+|[-,\s]+$/g,""),r.length>50&&(r=r.substring(0,47)+"..."),r.replace(/[<>:"/\\|?*]/g,"")}let o=n(a),l=c.templateName?c.templateName.replace(/\.docx$/i,""):"",s=[];l&&s.push(l),o&&s.push(o),s.length>0?e.value=s.join(" - ")+".docx":e.value||(e.value="Export_Auto.docx")}setInterval(t,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const a={};if(c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(d=>{const u=d.querySelector(".f-key").value.trim().split(",")[0].trim(),i=d.querySelector(".f-val").value;u&&(a[u]=i)}),Object.keys(a).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}const o=[];if(Be.forEach(d=>{if(!a[d]||!a[d].trim()){const r=C[d]||d;o.push(r)}}),o.length>0){const d=`Cảnh báo: Bạn còn các trường sau chưa điền dữ liệu:

- ${o.join(`
- `)}

Bạn có chắc chắn muốn tiếp tục xuất file không?`;if(!confirm(d))return}let l=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(l.toLowerCase().endsWith(".docx")||(l+=".docx"),c.templateBuffer){$e(c.templateBuffer,a,l);return}const s=document.getElementById("vnpt-template-file");if(s.files&&s.files.length>0){Lt.download("local",s.files[0],{type:"arraybuffer"}).then(d=>$e(d,a,l)).catch(d=>alert(`Lỗi đọc file: ${d.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')})}const Dt=["chucVu","noiCap","noiCapSoDkdn","ngayky","thangky","namky","thangky1","namky1","noiKy"],Bt=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function It(){function e(){Dt.forEach(n=>{const o=document.getElementById(n);o&&!o.dataset.filled&&(o.dataset.filled="1",oe(o,je(n)))}),Bt.forEach(n=>{const o=document.getElementById(n.src),l=document.getElementById(n.target);o&&l&&!o.dataset.bound&&(o.dataset.bound="1",o.addEventListener("input",()=>oe(l,o.value)))})}let t;new MutationObserver(()=>{clearTimeout(t),t=setTimeout(e,200)}).observe(document.body,{childList:!0,subtree:!0}),e()}function X(e,t=null){return h.get(e,t)}function fe(e,t){h.set(e,t)}function qe(e,t){if(!t||t.replace(/\D/g,"").length<6)return;let a=X(e,[]);a=a.filter(n=>n!==t),a.unshift(t),fe(e,a.slice(0,10))}function ge(e,t){const a=document.getElementById(t);a&&(a.innerHTML=X(e,[]).map(n=>`<option value="${n}">`).join(""))}function Se(e){return e.toLocaleString("en-US")}function Le(e){return Number(String(e).replace(/[^\d]/g,""))||0}function At(e){return e.charAt(0).toUpperCase()+e.slice(1)}const ie=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function Mt(e){let t=Math.floor(e/100),a=Math.floor(e%100/10),n=e%10,o="";return t>0&&(o+=ie[t]+" trăm ",a===0&&n>0&&(o+="lẻ ")),a>1?(o+=ie[a]+" mươi ",n===1?o+="mốt":n===5?o+="lăm":n>0&&(o+=ie[n])):a===1?(o+="mười ",n===5?o+="lăm":n>0&&(o+=ie[n])):n>0&&(t>0&&(o+="lẻ "),o+=ie[n]),o.trim()}function _t(e){if(e===0)return"không";const t=["","nghìn","triệu","tỷ"];let a="",n=0;for(;e>0;){const o=e%1e3;o>0&&(a=Mt(o)+" "+t[n]+" "+a),e=Math.floor(e/1e3),n++}return a.trim()}function Ue(e,t,a){let n=0,o=0,l=0;e==="before"?(n=Le(t),o=Math.round(n*a),l=n+o):e==="tax"?(o=Le(t),n=Math.round(o/a),l=n+o):e==="after"&&(l=Le(t),n=Math.round(l/(1+a)),o=l-n);const s=At(_t(l))+" đồng";return{beforeNum:n,taxNum:o,afterNum:l,beforeStr:Se(n),taxStr:Se(o),afterStr:Se(l),textStr:s}}function Ht(e,t){t.before&&t.before.forEach(a=>j(a,e.beforeStr)),t.tax&&t.tax.forEach(a=>j(a,e.taxStr)),t.after&&t.after.forEach(a=>j(a,e.afterStr)),t.text&&t.text.forEach(a=>j(a,e.textStr))}function me(e,t=null){try{const a=localStorage.getItem(e);return a!==null?JSON.parse(a):t}catch{return t}}function _(e,t){localStorage.setItem(e,JSON.stringify(t))}function zt(e,t,a,n){let o=me(ee)??"custom",l=me(U)??{...$},s=me(G)??{},d=me(R)??{};const r=document.createElement("div");r.className="cw-tab-header";const u={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};u.custom.innerText="📋 Custom",u.custom.className="cw-tab cw-tab-custom",u.default.innerText="📌 Default",u.default.className="cw-tab cw-tab-default",u.sync.innerText="🔗 Sync",u.sync.className="cw-tab cw-tab-sync";function i(){Object.values(u).forEach(v=>v.classList.remove("active")),u[o].classList.add("active")}i();const p=document.createElement("div");p.style.display=n.data?"none":"block";const f=t("📋 Cấu hình Data","data",v=>{p.style.display=v?"none":"block",a(e)}),g=document.createElement("div");g.className="cw-data-body";function m(){g.innerHTML="";let v=o==="sync"?d:o==="custom"?s:l,w=o==="sync"?R:o==="custom"?G:U;const le=Object.keys(v);le.length===0&&o!=="default"&&(g.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),le.forEach(B=>{const Y=document.createElement("div");Y.className="cw-data-row";let he=o!=="default";const F=v[B],be=F&&typeof F=="object"&&F.hasOwnProperty("value"),Ge=be?F.value:F,De=be&&F.label||B,A=document.createElement("input");A.type="text",A.value=De,A.id=`df-key-${B}`,A.name=`df-key-${B}`,A.className="cw-data-key"+(he?" mutable":""),A.title=B,A.readOnly=!he,he&&(A.onchange=()=>{const M=A.value.trim();if(!M||M===B){A.value=De;return}be?v[M]={...F,label:M}:v[M]=Ge,delete v[B],_(w,v),m()});const H=document.createElement("input");if(H.type="text",H.value=Ge??"",H.id=`df-val-${B}`,H.name=`df-val-${B}`,H.className="cw-data-val",H.oninput=()=>{be?v[B]={...F,value:H.value}:v[B]=H.value,_(w,v)},Y.appendChild(A),Y.appendChild(H),he){const M=document.createElement("button");M.innerHTML="✕",M.className="cw-del-btn",M.onclick=()=>{confirm(`Delete "${De}"?`)&&(delete v[B],_(w,v),m())},Y.appendChild(M)}else Y.appendChild(document.createElement("div")).className="cw-pad";g.appendChild(Y)})}u.custom.onclick=()=>{o="custom",_(ee,"custom"),i(),m()},u.default.onclick=()=>{o="default",_(ee,"default"),i(),m()},u.sync.onclick=()=>{o="sync",_(ee,"sync"),i(),m()};const b=document.createElement("button");b.innerText="📤",b.className="cw-icon-btn",b.title="Sao lưu toàn bộ dữ liệu ra JSON",b.onclick=()=>Ke();const x=document.createElement("button");x.innerText="📥",x.className="cw-icon-btn",x.title="Khôi phục dữ liệu từ JSON";const y=document.createElement("input");y.type="file",y.accept=".json",y.style.display="none",y.onchange=async v=>{v.target.files.length>0&&await Pe(v.target.files[0])&&setTimeout(()=>location.reload(),1500)},x.onclick=()=>y.click(),p.appendChild(r),r.appendChild(u.custom),r.appendChild(u.default),r.appendChild(u.sync),p.appendChild(g),e.appendChild(f),e.appendChild(p);const T=e.querySelector("#vnpt-cw-fill"),k=e.querySelector("#vnpt-cw-sync"),S=e.querySelector("#vnpt-cw-add"),N=e.querySelector("#vnpt-cw-reset");T&&(T.onclick=Oe),k&&(k.onclick=vt),S&&(S.onclick=()=>{o==="default"&&(o="custom",_(ee,"custom"),i());let v=o==="sync"?d:s,w="new_field_"+Date.now();v[w]="",_(o==="sync"?R:G,v),m(),g.scrollTop=g.scrollHeight}),N&&(N.onclick=()=>{confirm("Reset Default Data?")&&(l={...$},_(U,l),m())}),m();const D=f.querySelector(".cw-right-wrap")||document.createElement("div");D.className="cw-right-wrap",D.prepend(b),D.prepend(x),D.appendChild(y),f.appendChild(D)}function Ot(e,t,a){let n=Number(localStorage.getItem(Z))||bt,o=X(ce)??{calc:!1,data:!0};function l(f,g){const m=document.createElement("button");return m.innerText=f,m.className="cw-action-btn "+g,m}function s(f,g,m){const b=document.createElement("div");b.className="wg-sec-header";const x=document.createElement("span");x.innerText=f;const y=document.createElement("button");return y.className="wg-toggle-btn",y.innerText=o[g]?"▾":"▴",b.appendChild(x),b.appendChild(y),y.onclick=()=>{o[g]=!o[g],y.innerText=o[g]?"▾":"▴",fe(ce,o),m(o[g])},b}function d(f){const g=window.innerWidth,m=window.innerHeight,b=f.getBoundingClientRect();f.style.left=Math.min(Math.max(parseFloat(f.style.left),0),g-b.width)+"px",f.style.top=Math.min(Math.max(parseFloat(f.style.top),0),m-36)+"px"}const r=document.createElement("div");if(!t){r.className="cw-title-bar",r.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const f=document.createElement("div");f.className="cw-btn-group";const g={fill:l("Fill","cw-btn-fill"),sync:l("Sync","cw-btn-sync"),add:l("Add","cw-btn-add"),reset:l("↺","cw-btn-reset")};g.reset.title="Reset Default fields",Object.values(g).forEach(m=>f.appendChild(m)),r.appendChild(f),e.appendChild(r)}const u=document.createElement("div");u.className="cw-body-inline",u.innerHTML=`
    <div class="cw-inline-row">
        <input id="wg-before" name="wg-before" class="cw-input-inline" placeholder="Trước thuế" list="wg-before-list" title="Trước thuế">
        <datalist id="wg-before-list"></datalist>
        <div class="cw-tax-group-inline"><input id="wg-taxRate" name="wg-taxRate" class="cw-tax-input-inline" title="Thuế (%)"><span class="cw-tax-symbol">%</span></div>
        <input id="wg-tax" name="wg-tax" class="cw-input-inline" placeholder="Tiền thuế" title="Tiền thuế">
        <input id="wg-after" name="wg-after" class="cw-input-inline" placeholder="Sau thuế" list="wg-after-list" title="Sau thuế">
        <datalist id="wg-after-list"></datalist>
        <input id="wg-text" name="wg-text" class="cw-input-inline cw-input-readonly-inline" placeholder="Bằng chữ" readonly title="Bằng chữ">
    </div>`,t?t.appendChild(u):e.appendChild(u),t||zt(e,s,d,o);const i={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text")};i.taxRate.value=n*100,ge(we,"wg-before-list"),ge(Ee,"wg-after-list");function p(f,g){const m=Ue(f,g,n);i.before.value=m.beforeStr,i.tax.value=m.taxStr,i.after.value=m.afterStr,i.text.value=m.textStr;const b=X(K)||{...ht};Ht(m,b)}if(i.taxRate.oninput=()=>{n=Number(i.taxRate.value)/100||0,fe(Z,n),p("before",i.before.value)},i.before.oninput=()=>{const f=Ue("before",i.before.value,n);i.tax.value=f.taxStr,i.after.value=f.afterStr,i.text.value=f.textStr},i.before.onchange=()=>{p("before",i.before.value),qe(we,i.before.value),ge(we,"wg-before-list")},i.tax.oninput=()=>p("tax",i.tax.value),i.after.oninput=()=>p("after",i.after.value),i.after.onchange=()=>{p("after",i.after.value),qe(Ee,i.after.value),ge(Ee,"wg-after-list")},[i.before,i.tax,i.after,i.text].forEach(f=>{["click","focus"].forEach(g=>f.addEventListener(g,()=>{if(!f.value)return;navigator.clipboard.writeText(f.value);const m=f.style.backgroundColor;f.style.backgroundColor="#d1e7dd",setTimeout(()=>f.style.backgroundColor=m,300)}))}),!t){const f=Array.from(e.children).filter(b=>b!==r),g=Ve(e,[r],a,null,b=>{f.forEach(x=>x.style.display=b?"none":""),r.style.borderRadius=b?"8px":"0",b&&(e.style.top=window.innerHeight-(r.offsetHeight||34)+"px")}),m=X(a);return m&&m.docked&&g.setDocked(!0),window.addEventListener("resize",()=>{g.isDocked()?e.style.top=window.innerHeight-r.offsetHeight+"px":d(e)}),g}return null}function Ft(){const e=document.getElementById("vnpt-inline-calc"),t=document.getElementById("vnpt-btn-calc-toggle");let a=c.calcWidget||document.createElement("div");if(!e&&!c.calcWidget?(a.id="vnpt-calc-widget",document.body.appendChild(a),c.calcWidget=a):e&&(a=c.widget),e&&t){let n=X(ce)??{calc:!1,data:!0};const o=l=>{e.style.display=l?"none":"block",t.classList.toggle("active",!l)};o(n.calc),t.onclick=()=>{n.calc=!n.calc,fe(ce,n),o(n.calc)}}return Ot(a,e,Ye)}function Rt(){window.addEventListener("keydown",e=>{var t,a,n,o;if(e.altKey&&!e.ctrlKey&&!e.shiftKey){const l=e.key.toLowerCase();let s=!0;switch(l){case"s":(t=document.getElementById("vnpt-btn-scan"))==null||t.click();break;case"e":(a=document.getElementById("vnpt-btn-export"))==null||a.click();break;case"w":(n=document.getElementById("vnpt-toggle-btn"))==null||n.click();break;case"f":(o=document.getElementById("vnpt-btn-fill-back"))==null||o.click();break;default:s=!1;break}s&&e.preventDefault()}})}let re=null;function Ne(){if(!window.__vnptInited){window.__vnptInited=!0,q.info("Initializing VNPT Userscript...");try{We(),Ct(),Ft(),Tt(),Et(),Fe(),kt(),Nt(),It(),wt(),Rt();const e=ze(()=>{pt(),q.debug("DOM Cache cleared due to mutations")},500);re=new MutationObserver(t=>{t.some(a=>a.addedNodes.length>0||a.removedNodes.length>0)&&e()}),re.observe(document.body,{childList:!0,subtree:!0}),q.info("Userscript initialized successfully.")}catch(e){q.error("Error during userscript initialization:",e)}}}function Kt(){q.info("Cleaning up VNPT Userscript for reload..."),re&&(re.disconnect(),re=null);const e=document.getElementById("vnpt-docx-widget");e&&e.remove();const t=document.getElementById("vnpt-calc-widget");t&&t.remove();const a=document.getElementById("vnpt-styles");a&&a.remove(),window.__vnptInited=!1,q.info("Cleanup completed.")}window.__vnptCleanup=Kt,window.__vnptInit=Ne,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Ne):Ne()})();
