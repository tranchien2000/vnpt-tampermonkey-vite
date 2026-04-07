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
(function(){"use strict";const U={info:(...e)=>console.log("[Tampermonkey Script] INFO:",...e),error:(...e)=>console.error("[Tampermonkey Script] ERROR:",...e),warn:(...e)=>console.warn("[Tampermonkey Script] WARN:",...e)};function We(){const e="vnpt-styles";if(document.getElementById(e))return;const t=document.createElement("style");t.id=e,t.textContent=`
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

        .btn-calc-toggle { background: rgba(26, 115, 232, 0.08); color: var(--vnpt-primary); }
        .btn-calc-toggle:hover { background: rgba(26, 115, 232, 0.15); }
        .btn-calc-toggle.active { background: var(--vnpt-primary); color: #fff; box-shadow: 0 4px 10px rgba(26, 115, 232, 0.3); }

        .btn-more.active { background: rgba(0,0,0,0.1); }

    `,document.head.appendChild(t)}const Xe={widget:null,panel:null,header:null,bannerArea:null,toggleBtn:null,fieldsContainer:null,panelBody:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1,templateBuffer:null,templateName:null,hasDragged:!1},Q=new Map,c=new Proxy(Xe,{get(e,t){return t==="on"?(o,n)=>{Q.has(o)||Q.set(o,[]),Q.get(o).push(n)}:e[t]},set(e,t,o){const n=e[t];return e[t]=o,n!==o&&Q.has(t)&&Q.get(t).forEach(i=>i(o,n)),!0}}),k={tenDaiDienn:"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT",emailDaiDien:"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Số GPKD | MST",goiDV:"Gói Dịch Vụ",ngayKy:"Ngày ký",thangKy:"Tháng Ký",namKy:"Năm ký",soHopDong:"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký"},Be=["soHopDong","tenDaiDienn","cmnd","sdt","diaChi","tenToChuc","ngayCapCustomer","emailDaiDien","soDkdn","goiDV","soHopDong"],se="vnpt_docx_fields",J="vnpt_docx_default_fields",ve="vnpt_docx_position",De="vnpt_docx_size",xe="vnpt_docx_opened",$="vnpt_autofill_data_default",G="vnpt_autofill_data_custom",F="vnpt_autofill_data_sync",Ye="vnpt_widget_pos",Z="vnd_tax_rate",ye="vnd_before_history",we="vnd_after_history",ce="vnpt_widget_collapsed",R="vnd_calc_map",ee="vnpt_widget_datatab",de="vnpt_templates";let H=null;function E(e,t="#198754",o=2500){H||(H=document.createElement("div"),H.id="vnpt-toast-container",Object.assign(H.style,{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column-reverse",alignItems:"center",gap:"8px",zIndex:"1000000",pointerEvents:"none"}),document.body.appendChild(H));const n=document.createElement("div");n.innerText=e,Object.assign(n.style,{background:t,color:"#fff",padding:"8px 18px",borderRadius:"24px",opacity:"0",transform:"translateY(10px)",transition:"opacity 0.3s, transform 0.3s",fontSize:"13px",fontWeight:"500",fontFamily:"'Segoe UI', Roboto, sans-serif",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",whiteSpace:"nowrap",pointerEvents:"auto"}),H.appendChild(n),requestAnimationFrame(()=>{n.style.opacity="1",n.style.transform="translateY(0)"}),setTimeout(()=>{n.style.opacity="0",n.style.transform="translateY(-10px)",setTimeout(()=>{n.remove(),H&&H.childNodes.length},300)},o)}const Qe="vnpt_templates_db",O="buffers";let pe=null;function Ee(){return pe?Promise.resolve(pe):new Promise((e,t)=>{const o=indexedDB.open(Qe,1);o.onupgradeneeded=n=>{const i=n.target.result;i.objectStoreNames.contains(O)||i.createObjectStore(O)},o.onsuccess=n=>{pe=n.target.result,e(pe)},o.onerror=()=>t(o.error)})}async function Je(e,t){const o=await Ee();return new Promise((n,i)=>{const d=o.transaction(O,"readwrite").objectStore(O).put(t,e);d.onsuccess=()=>n(),d.onerror=()=>i(d.error)})}async function Ze(e){const t=await Ee();return new Promise((o,n)=>{const s=t.transaction(O,"readonly").objectStore(O).get(e);s.onsuccess=()=>o(s.result),s.onerror=()=>n(s.error)})}async function et(e){const t=await Ee();return new Promise((o,n)=>{const s=t.transaction(O,"readwrite").objectStore(O).delete(e);s.onsuccess=()=>o(),s.onerror=()=>n(s.error)})}const K=new Map,ue=new Map,m={isGM:typeof GM_setValue<"u"&&typeof GM_getValue<"u",get(e,t=null){if(K.has(e))return K.get(e);try{let o;if(this.isGM?o=GM_getValue(e,null):o=localStorage.getItem(e),o==null)return t;const n=typeof o=="string"?JSON.parse(o):o;return K.set(e,n),n}catch(o){return console.warn(`[Storage] Không thể đọc key "${e}":`,o),t}},set(e,t){K.set(e,t);try{return this.isGM?GM_setValue(e,t):localStorage.setItem(e,JSON.stringify(t)),!0}catch(o){return console.error(`[Storage] Không thể ghi key "${e}":`,o),!1}},setDebounced(e,t,o=500){K.set(e,t),ue.has(e)&&clearTimeout(ue.get(e));const n=setTimeout(()=>{this.set(e,t),ue.delete(e)},o);ue.set(e,n)},remove(e){K.delete(e);try{this.isGM?GM_deleteValue(e):localStorage.removeItem(e)}catch(t){console.error(`[Storage] Không thể xóa key "${e}":`,t)}},clearCache(){K.clear()}};function te(){try{const e=m.get(de)||[],t=e.filter(o=>o.type!=="local");return t.length!==e.length&&ne(t),t}catch{return[]}}function ne(e){m.set(de,e)}function tt(e){const t=e.match(/drive\.google\.com\/file\/d\/([^/]+)/);return t?`https://drive.google.com/uc?export=download&id=${t[1]}`:e}function nt(e){return new Promise((t,o)=>{GM_xmlhttpRequest({method:"GET",url:tt(e),responseType:"arraybuffer",onload:n=>{if(n.status>=200&&n.status<300){if(n.response&&n.response.byteLength>4){const i=new Uint8Array(n.response.slice(0,4));if(i[0]===80&&i[1]===75&&i[2]===3&&i[3]===4){t(n.response);return}else{o(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}t(n.response)}else o(new Error(`HTTP ${n.status}: Không lấy được file`))},onerror:()=>o(new Error("Không thể tải URL.")),ontimeout:()=>o(new Error("Timeout khi tải URL."))})})}async function ot(e,t,o){const n=e.name.replace(/\.docx$/i,""),i=prompt("Đặt tên biến nhớ cho file này:",n);if(!(!i||!i.trim()))try{const l=await e.arrayBuffer();await Je(i.trim(),l);const d=te().filter(r=>r.name!==i.trim()&&r.fileName!==e.name);d.unshift({name:i.trim(),type:"local_idb",fileName:e.name,lastUsed:Date.now()}),ne(d),P(t,o),o&&o(l,i.trim())}catch(l){E(`❌ Lỗi lưu file: ${l.message}`,"#dc3545")}}function P(e,t,o=null){let n=e.querySelector(".vnpt-template-manager-inner"),i,l;if(n)i=n.querySelector(".vnpt-local-list-container"),l=n.querySelector(".vnpt-btn-wrap");else{e.innerHTML="",n=document.createElement("div"),n.className="vnpt-template-manager-inner";const r=document.createElement("div");r.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const u=document.createElement("span");u.className="vnpt-title-main",u.style.cssText="font-size:11px;font-weight:700;color:#444;",l=document.createElement("div"),l.className="vnpt-btn-wrap",l.style.cssText="display:flex;gap:4px;",r.appendChild(u),r.appendChild(l),n.appendChild(r),i=document.createElement("div"),i.className="vnpt-local-list-container",i.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",n.appendChild(i),e.appendChild(n)}const s=te(),d=n.querySelector(".vnpt-title-main");d.innerHTML="Templates"+(o?` <span style="color:#2e7d32;">(Đang dùng: ${o})</span>`:""),s.length===0?i.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':i.innerHTML="",s.forEach((r,u)=>{const a=document.createElement("div");a.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",a.title=r.fileName||r.url||r.name,a.tabIndex=0,a.onfocus=()=>a.style.boxShadow="0 0 0 2px #28a745",a.onblur=()=>a.style.boxShadow="none";const p=r.type==="local"||r.type==="local_base64"||r.type==="local_idb"?"OFF":"ON",f=p==="OFF"?"#6c757d":"#28a745",g=document.createElement("span");g.textContent=p,g.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${f};color:#fff;`;const h=document.createElement("span");h.textContent=r.name,h.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",a.onclick=()=>{a.focus(),it(r,t,o,e)},a.appendChild(g),a.appendChild(h);const b=document.createElement("button");b.innerHTML="✎",b.title="Đổi tên template",b.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",b.onclick=y=>{y.stopPropagation();const C=prompt("Đổi tên template:",r.name);if(C&&C.trim()&&C.trim()!==r.name){const S=te();S[u].name=C.trim(),ne(S),P(e,t,o)}},a.appendChild(b);const x=document.createElement("button");x.innerHTML="✕",x.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",x.onclick=async y=>{if(y.stopPropagation(),confirm(`Xoá biểu mẫu "${r.name}"?`)){const C=te();C.splice(u,1),ne(C),r.type==="local_idb"&&await et(r.name).catch(()=>null),P(e,t,o===r.name?null:o)}},a.appendChild(x),i.appendChild(a)})}function it(e,t,o,n){const i=te(),l=i.find(s=>s.name===e.name&&(s.url===e.url||s.type===e.type));if(l&&(l.lastUsed=Date.now(),ne(i)),e.type==="local_idb"){Ze(e.name).then(s=>{if(!s)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");t&&t(s,e.name),P(n,t,e.name)}).catch(s=>{E(`❌ Lỗi nạp File IDB: ${s.message}`,"#dc3545")});return}if(e.type==="local_base64"&&e.data){try{const s=window.atob(e.data.split(",")[1]),d=s.length,r=new Uint8Array(d);for(let u=0;u<d;u++)r[u]=s.charCodeAt(u);t&&t(r.buffer,e.name),P(n,t,e.name)}catch(s){E(`❌ Lỗi nạp Base64: ${s.message}`,"#dc3545")}return}nt(e.url).then(s=>{t&&t(s,e.name),P(n,t,e.name)}).catch(s=>{E(`❌ ${s.message}`,"#dc3545")})}function at(e,t){if(e.length===0)return t.length;if(t.length===0)return e.length;const o=[];for(let n=0;n<=t.length;n++)o[n]=[n];for(let n=0;n<=e.length;n++)o[0][n]=n;for(let n=1;n<=t.length;n++)for(let i=1;i<=e.length;i++)t.charAt(n-1)===e.charAt(i-1)?o[n][i]=o[n-1][i-1]:o[n][i]=Math.min(o[n-1][i-1]+1,o[n][i-1]+1,o[n-1][i]+1);return o[t.length][e.length]}function rt(e,t){let o=e,n=t;e.length<t.length&&(o=t,n=e);const i=o.length;return i===0?1:(i-at(o,n))/parseFloat(i)}function lt(e,t,o=.7){let n=null,i=-1;const l=e.toLowerCase().trim();for(const s of t){const d=s.toLowerCase().trim(),r=rt(l,d);r>i&&r>=o&&(i=r,n=s)}return n}function st(e){return e?e.toLowerCase().split(" ").map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(" "):""}function ct(e){if(!e)return"";let t=e.replace(/\D/g,"");return t.startsWith("84")&&(t="0"+t.slice(2)),t}function dt(e){if(!e)return"";const t=e.split(/[-/]/);if(t.length===3){let o,n,i;return t[0].length===4?[i,n,o]=t:[o,n,i]=t,`${o.padStart(2,"0")}/${n.padStart(2,"0")}/${i}`}return e}const oe=new Map;function pt(){oe.clear()}function ut(e){e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function ie(e,t){var i;const o=e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,n=(i=Object.getOwnPropertyDescriptor(o,"value"))==null?void 0:i.set;n?n.call(e,t):e.value=t,ut(e)}function W(e,t=null){if(!e)return null;const o=oe.get(e);if(o&&document.contains(o))return o;const n=document.getElementById(e);if(n&&(n.tagName==="INPUT"||n.tagName==="TEXTAREA"||n.tagName==="SELECT"))return oe.set(e,n),n;const i=`input[id="${e}"], textarea[id="${e}"], select[id="${e}"], input[name="${e}"], textarea[name="${e}"], input[formcontrolname="${e}"], textarea[formcontrolname="${e}"], input[placeholder="${e}"], textarea[placeholder="${e}"]`,l=document.querySelector(i);if(l)return oe.set(e,l),l;const s=t||e,d=Array.from(document.querySelectorAll("label, .label, .label-text, span.title"));let r=d.find(u=>u.innerText.trim()===s);if(!r&&s.length>2){const u=d.map(p=>p.innerText.trim()).filter(p=>p.length>0),a=lt(s,u,.8);a&&(r=d.find(p=>p.innerText.trim()===a))}if(r){let u=null;if(r.htmlFor&&(u=document.getElementById(r.htmlFor)),!u){let a=r.parentElement,p=0;for(;a&&p<3;){const f=a.querySelector("input, textarea, select");if(f){u=f;break}a=a.parentElement,p++}}if(u)return oe.set(e,u),u}return null}function Ce(e){return W(null,e)}function V(e,t,o=null){const n=W(e,o);n&&ie(n,t)}function ft(e=new Date){return String(e.getDate()).padStart(2,"0")}function gt(e=new Date){return String(e.getMonth()+1).padStart(2,"0")}function ht(e=new Date){return String(e.getFullYear())}function Ie(){const e=new Date;return{ngay:ft(e),thang:gt(e),nam:ht(e)}}const{ngay:Ae,thang:Me,nam:_e}=Ie(),j={ngayKy:{label:"Ngày ký",value:Ae},"thangKy, thangKy1":{label:"Tháng ký",value:Me},"namKy, namKy1":{label:"Năm ký",value:_e},"ngayTiepNhan, ngayThangNamKy":{label:"Ngày ký (full)",value:`${Ae}/${Me}/${_e}`},tenDoanhNghiepB:{label:"Tên doanh nghiệp B",value:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM"},diaChiB:{label:"Địa chỉ B",value:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội"},maSoThueB:{label:"Mã số thuế B",value:"0100686223"},stkB:{label:"Số tài khoản B",value:"1600114156"},diaChiStkB:{label:"Ngân hàng/Địa chỉ STK B",value:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)"},"tenB, nguoiDaiDienB":{label:"Người đại diện B",value:"Phạm Khánh Chung"},"chucVuB, chucVuDaiDienB":{label:"Chức vụ B",value:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp"},"giayUyQuyenSoB, soGiayUyQuyenB":{label:"Giấy ủy quyền số B",value:"2628/GUQ-VNPT-HNI-VP"},"giayUyQuyenNgayB, ngayGiayUyQuyenB":{label:"Giấy ủy quyền ngày B",value:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},GiayUyQuyenB:{label:"Giấy ủy quyền B (full)",value:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},tenDoanhNghiepB1:{label:"Tên doanh nghiệp B (phụ)",value:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},donViTiepNhan:{label:"Đơn vị tiếp nhận",value:"TTKD KHDN"},"tenTiepNhan, tenNguoiNhan":{label:"Người tiếp nhận",value:"Bùi Anh"},dienThoaiB:{label:"Điện thoại B",value:"02436686868"},diaChiTaiKhoanB:{label:"Địa chỉ tài khoản B",value:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 "},noiKy:{label:"Nơi ký",value:"Hà Nội"},emailB:{label:"Email B",value:""},"lienheHopDongB, lienheTuVanB, lienheHoaDonB, sucoCap1B, sucoCap2B, sucoCap3B, sucoCap4B":{label:"Liên hệ B (AM)",value:"AM Bùi Anh"}},He={soHopDong:"inputContractGroupName, contractName"},mt={after:["cuocDV","tongCong","tongCongHD","congCA","giaTriHopDong","tongGIaTriHopDong"],before:["donGiaCA","thanhTienCA","tongThanhTien","tongCuocTruocThue"],tax:["tongThueGTGT","tongThue","thueCA","thueVAT"],text:["soTienThanhToanBangChu","tongCongBangChu","tongCongHDbangChu","ghiChuGiaTriHopDong","tongGiaTriHopDongBangChu"]},bt=.08;function Oe(e,t){let o;return function(...i){const l=()=>{clearTimeout(o),e(...i)};clearTimeout(o),o=setTimeout(l,t)}}function ze(){const e=m.get($)??{...j},t=m.get(G)??{},o={...e,...t};Object.keys(o).forEach(n=>{const i=o[n],l=i&&typeof i=="object"&&i.hasOwnProperty("value")?i.value:i;n.split(",").map(d=>d.trim()).filter(d=>d).forEach(d=>{let r=W(d)||Ce(d);r&&ie(r,l)})}),E("✅ Auto fill complete")}function vt(){let e=m.get(F)??{};const t={...He,...e},o=Object.keys(t);if(o.length===0){E("⚠️ No sync mapping","#ffc107");return}o.forEach(n=>{let i=W(n)||Ce(n);i&&i.value!==void 0&&i.value!==""&&t[n].split(",").map(s=>s.trim()).filter(s=>s).forEach(s=>V(s,i.value))}),E("✅ Sync form complete","#d39e00")}let Te=!1;const xt=(e,t)=>{var r;if(Te)return;let o=m.get(F)??{};const n={...He,...o};if(Object.keys(n).length===0)return;let i=e.id,l=e.name,s=null;if(i){const u=document.querySelector(`label[for="${i}"]`);u&&(s=u.textContent.trim())}if(!s){const u=e.closest("label");u&&(s=(r=Array.from(u.childNodes).find(a=>a.nodeType===3))==null?void 0:r.textContent.trim())}let d=n[i]||n[l]||n[s];if(d){Te=!0;try{d.split(",").map(a=>a.trim()).filter(a=>a).forEach(a=>{if(a!==i&&a!==l&&a!==s){const p=W(a)||Ce(a);p&&document.activeElement!==p&&ie(p,t)}})}finally{Te=!1}}},yt=Oe((e,t)=>{xt(e,t)},250);function wt(){document.addEventListener("input",e=>{const t=e.target;!t||!["INPUT","TEXTAREA"].includes(t.tagName)||t.closest("#vnpt-docx-widget")||t.closest("#vnpt-inline-calc")||yt(t,t.value)})}function L(e,t,o=null,n=""){const i=c.fieldsContainer.querySelector(".text-hint");i&&i.remove();const l=c.fieldsContainer.querySelectorAll(".f-key");let s=!1;for(let d of l)if(d.value.split(",")[0].trim()===e){const u=d.closest(".vnpt-field-row"),a=u.querySelector(".f-val"),p=u.querySelector(".f-label");t!==""&&a.value!==t&&document.activeElement!==a&&(a.value=t),o!==null&&o!==""&&p.value!==o&&document.activeElement!==p&&(p.value=o),n!==""&&d.value!==e+", "+n&&document.activeElement!==d&&(d.value=e+", "+n),s=!0;break}if(!s){(o===null||o==="")&&(o=k[e]||"");const d=document.createElement("div");d.className="vnpt-field-row row-item",d.setAttribute("draggable","false");let r=e;n&&(r+=", "+n),d.innerHTML=`
            <input type="checkbox" class="row-chk" title="Chọn" style="margin: 0 2px 0 2px;" />
            <input type="text" class="f-label" value="${o}" />
            <input type="text" class="f-key" value="${r}" title="Biến DOCX và IDs đồng bộ" />
            <span class="row-drag-handle" title="Kéo">=</span>
            <input type="text" class="f-val" value="${t}" />
        `;const u=d.querySelector(".f-val"),a=d.querySelector(".f-key");e==="tenToChuc"&&(u.style.textAlign="right");const p=()=>{Be.includes(e)&&(u.value.trim()?u.classList.remove("field-required-empty"):u.classList.add("field-required-empty"))},f=()=>{const h=u.value;a.value.split(",").map(x=>x.trim()).filter(x=>x).forEach(x=>V(x,h))};a.addEventListener("input",function(){D();const h=this.value.split(",")[0].trim();u.style.textAlign=h==="tenToChuc"?"right":"",f()}),d.querySelector(".f-label").addEventListener("input",D),u.addEventListener("input",function(){D(),f(),p()}),p();const g=d.querySelector(".row-drag-handle");g.addEventListener("mouseenter",()=>d.setAttribute("draggable","true")),g.addEventListener("mouseleave",()=>{d.classList.contains("dragging")||d.setAttribute("draggable","false")}),d.addEventListener("dragstart",function(h){c.draggedRowForVNPT=this,h.dataTransfer.effectAllowed="move",h.dataTransfer.setData("text/plain",e),this.classList.add("dragging")}),d.addEventListener("dragover",h=>(h.preventDefault(),!1)),d.addEventListener("dragenter",function(){this.classList.add("over")}),d.addEventListener("dragleave",function(){this.classList.remove("over")}),d.addEventListener("drop",function(h){if(h.stopPropagation(),c.draggedRowForVNPT&&c.draggedRowForVNPT!==this){const b=Array.from(c.fieldsContainer.querySelectorAll(".vnpt-field-row")),x=b.indexOf(c.draggedRowForVNPT),y=b.indexOf(this);x<y?this.parentNode.insertBefore(c.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(c.draggedRowForVNPT,this),D()}return!1}),d.addEventListener("dragend",function(){this.setAttribute("draggable","false"),c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(h=>{h.classList.remove("over","dragging")}),c.draggedRowForVNPT=null}),c.fieldsContainer.appendChild(d),c.fieldsContainer.scrollTop=c.fieldsContainer.scrollHeight}}function D(){const e=c.isDefaultMode?J:se,t={};c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(n=>{const l=n.querySelector(".f-key").value.trim().split(",").map(a=>a.trim()).filter(a=>a),s=l[0],d=l.slice(1).join(", "),r=n.querySelector(".f-label").value.trim(),u=n.querySelector(".f-val").value;s&&(t[s]={label:r,value:u,sync:d})}),m.setDebounced(e,t,1e3)}function Fe(){try{c.fieldsContainer.innerHTML="";const t=m.get(se)||{};Object.keys(k).forEach(o=>{const n=k[o],i=t[o];i&&typeof i=="object"?L(o,i.value,i.label||n,i.sync||""):i?L(o,i,n,""):L(o,"",n,"")}),Object.keys(t).forEach(o=>{if(!(o in k)){const n=t[o];typeof n=="object"?L(o,n.value,n.label,n.sync||""):L(o,n,"","")}}),Object.keys(k).length===0&&Object.keys(t).length===0&&(c.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(t){console.error("Error loading config:",t),Object.keys(k).forEach(o=>L(o,"",k[o]))}const e=m.get(ve);e&&c.widget&&(c.widget.style.bottom="auto",e.right?(c.widget.style.right=e.right,c.widget.style.left="auto"):e.left&&(c.widget.style.left=e.left,c.widget.style.right="auto"),e.top&&(c.widget.style.top=e.top))}function Et(){document.getElementById("vnpt-btn-toggle-id").onclick=()=>c.fieldsContainer.classList.toggle("show-ids"),document.getElementById("vnpt-btn-default").onclick=()=>{c.isDefaultMode=!c.isDefaultMode},c.on("isDefaultMode",e=>Re(e)),document.getElementById("vnpt-btn-reset-default").onclick=()=>{confirm("Khôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?")&&(m.remove(J),m.remove(R),m.remove(Z),c.isDefaultMode&&(Re(!0),E("🔄 Đã khôi phục dữ liệu gốc","#1a73e8")))},document.getElementById("vnpt-btn-batch-del").onclick=()=>{const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row");let t=0;e.forEach(o=>{var n;(n=o.querySelector(".row-chk"))!=null&&n.checked&&(o.remove(),t++)}),t===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(e.forEach(o=>o.remove()),E("🗑️ Đã xóa toàn bộ","#ff5252"),D()):(E(`🗑️ Đã xóa ${t} trường`,"#ff5252"),D())},document.getElementById("vnpt-btn-add").onclick=()=>{const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;L("bien_moi_"+e,"","",""),D()},document.getElementById("vnpt-btn-fill-back").onclick=()=>{ze();let e=0;c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(t=>{const o=t.querySelector(".f-key").value.trim(),n=t.querySelector(".f-val").value;o.split(",").map(i=>i.trim()).filter(Boolean).forEach(i=>{(document.getElementById(i)||document.getElementsByName(i)[0])&&(V(i,n),e++)})}),e>0?E(`✅ Đã điền ngược ${e} trường`,"#198754"):E("⚠️ Không khớp trường nào","#ffc107")}}function Re(e){const t=document.getElementById("vnpt-btn-default"),o=document.getElementById("vnpt-btn-reset-default");if(c.fieldsContainer.innerHTML="",c.bannerArea.innerHTML="",e){t.classList.add("active"),t.innerHTML="✅ Chế độ: Dữ liệu mặc định",o&&(o.style.display="flex"),c.fieldsContainer.classList.add("vnpt-mode-default"),E("📌 Chế độ Dữ liệu mặc định (Có thể sửa)","#ea4335");const n=document.createElement("div");n.className="vnpt-default-banner",n.innerHTML="<span> Lưu ý: đây là Dữ liệu mặc định (Có thể sửa/lưu)</span>",c.bannerArea.appendChild(n);const i=m.get(J);i===null?Object.keys(j).forEach(l=>{const s=j[l],d=s&&typeof s=="object"?s.value:s,r=s&&typeof s=="object"?s.label:k[l]||"";L(l,d,r)}):Object.keys(i).forEach(l=>{const s=i[l];L(l,s.value,s.label,s.sync||"")})}else t.classList.remove("active"),t.innerHTML="🛠 Dữ liệu mặc định VNPT",o&&(o.style.display="none"),c.fieldsContainer.classList.remove("vnpt-mode-default"),E("📋 Đã quay lại Dữ liệu cá nhân"),Fe()}function Ke(){const e={version:"1.0",timestamp:new Date().toISOString(),backup:{fields:m.get(se),defaultFields:m.get(J),dataDefault:m.get($),dataCustom:m.get(G),dataSync:m.get(F),taxRate:m.get(Z),calcMap:m.get(R),templates:m.get(de)}},t=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),o=URL.createObjectURL(t),n=document.createElement("a");n.href=o,n.download=`vnpt_full_backup_${new Date().toLocaleDateString().replace(/\//g,"-")}.json`,n.click(),URL.revokeObjectURL(o),E("✅ Đã xuất file sao lưu hệ thống.")}async function Pe(e){return new Promise(t=>{const o=new FileReader;o.onload=n=>{try{const i=JSON.parse(n.target.result);if(!i.backup)throw new Error("File không đúng định dạng backup.");const l=i.backup;l.fields&&m.set(se,l.fields),l.defaultFields&&m.set(J,l.defaultFields),l.dataDefault&&m.set($,l.dataDefault),l.dataCustom&&m.set(G,l.dataCustom),l.dataSync&&m.set(F,l.dataSync),l.taxRate&&m.set(Z,l.taxRate),l.calcMap&&m.set(R,l.calcMap),l.templates&&m.set(de,l.templates),E("✅ Đã nhập dữ liệu thành công! Vui lòng tải lại trang hoặc widget.","#1e8e3e"),t(!0)}catch{E("❌ Lỗi: File sao lưu không hợp lệ.","#ff5252"),t(!1)}},o.readAsText(e)})}function Ct(){const e=document.getElementById("vnpt-docx-widget")||document.createElement("div");e.id="vnpt-docx-widget";const t=m.get(xe)===!0;e.innerHTML=`
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
                            <div class="cw-row-map"><span>Trước thuế</span><input data-clink="before" class="cw-map-input"></div>
                            <div class="cw-row-map"><span>Tiền thuế</span><input data-clink="tax" class="cw-map-input"></div>
                            <div class="cw-row-map"><span>Sau thuế</span><input data-clink="after" class="cw-map-input"></div>
                            <div class="cw-row-map"><span>Bằng chữ</span><input data-clink="text" class="cw-map-input"></div>
                            
                            <div class="util-separator"></div>
                            <div class="util-submenu-title">Dữ liệu hệ thống</div>
                            <div class="util-action-row">
                                <button class="util-item-small" id="vnpt-btn-import-json">📥 Nhập JSON</button>
                                <button class="util-item-small" id="vnpt-btn-export-json">📤 Xuất JSON</button>
                                <input type="file" id="vnpt-file-import-json" accept=".json" style="display: none;">
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
                        <input type="file" id="vnpt-template-file" accept=".docx" title="Hoặc sử dụng File nội bộ từ máy" />
                    </div>
                    <div class="vnpt-control-group">
                        <input type="text" id="vnpt-export-filename" value="Export_Auto.docx" title="Tên file DOCX khi xuất" />
                    </div>
                    <button class="vnpt-btn-action btn-export" id="vnpt-btn-export" title="Xuất ra file DOCX">🖨️ XUẤT FILE</button>
                </div>
            </div>
        </div>
    `,document.body.appendChild(e),c.widget=e,c.panel=document.getElementById("vnpt-export-panel"),c.toggleBtn=document.getElementById("vnpt-toggle-btn"),c.header=document.getElementById("vnpt-panel-header"),c.bannerArea=document.getElementById("vnpt-banner-area"),c.fieldsContainer=document.getElementById("vnpt-fields-list");try{const a=m.get(De);a&&a.width&&a.height&&(c.panel.style.width=a.width+"px",c.panel.style.height=a.height+"px")}catch(a){console.error("Lỗi load size panel:",a)}new ResizeObserver(a=>{if(c.panel.style.display!=="none")for(let p of a){const{width:f,height:g}=p.contentRect;f>0&&g>0&&m.setDebounced(De,{width:Math.round(f+20),height:Math.round(g+20)},1e3)}}).observe(c.panel),c.panelBody=document.getElementById("vnpt-panel-body"),P(document.getElementById("vnpt-template-manager"),(a,p)=>{c.templateBuffer=a,c.templateName=p}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const a=this.files&&this.files[0];if(!a)return;const p=document.getElementById("vnpt-template-manager");ot(a,p,(f,g)=>{c.templateBuffer=f,c.templateName=g}),this.value=""}),c.toggleBtn.addEventListener("click",a=>{c.hasDragged||(c.panel.style.display==="none"?(c.panel.style.display="flex",c.toggleBtn.className="btn-opened",c.toggleBtn.innerHTML="✖",m.set(xe,!0)):(c.panel.style.display="none",c.toggleBtn.className="btn-closed",c.toggleBtn.innerHTML="📄",m.set(xe,!1)))});const n=document.getElementById("vnpt-btn-more"),i=document.getElementById("vnpt-util-menu"),l={S:{width:"320px",height:"380px"},M:{width:"440px",height:"600px"},L:{width:"600px",height:"800px"},Full:{width:"98vw",height:"92vh"}},s=m.get(R)||{};i.querySelectorAll("input[data-clink]").forEach(a=>{const p=a.dataset.clink;s[p]&&(a.value=s[p].join(", ")),a.oninput=()=>{const f=m.get(R)||{};f[p]=a.value.split(",").map(g=>g.trim()).filter(g=>g),m.set(R,f)}}),document.getElementById("vnpt-btn-export-json").onclick=()=>Ke();const d=document.getElementById("vnpt-btn-import-json"),r=document.getElementById("vnpt-file-import-json");d.onclick=()=>r.click(),r.onchange=async a=>{a.target.files.length>0&&await Pe(a.target.files[0])&&setTimeout(()=>location.reload(),1500)},n.addEventListener("click",a=>{a.stopPropagation();const p=i.classList.toggle("show");n.classList.toggle("active",p)}),i.addEventListener("click",a=>{a.stopPropagation()}),document.addEventListener("click",a=>{i.classList.contains("show")&&(i.classList.remove("show"),n.classList.remove("active"))}),i.querySelectorAll(".size-options button").forEach(a=>{a.addEventListener("click",p=>{const f=p.target.getAttribute("data-size"),g=l[f];g&&(c.panel.style.width=g.width,c.panel.style.height=g.height),i.classList.remove("show"),n.classList.remove("active")})}),c.panel.querySelectorAll(".vnpt-resizer").forEach(a=>{a.addEventListener("mousedown",p=>{p.preventDefault(),p.stopPropagation();const f=p.clientX,g=p.clientY,h=c.panel.offsetWidth,b=c.panel.offsetHeight,x=c.widget.getBoundingClientRect(),y=x.top,C=window.innerWidth-x.right,S=B=>{const T=B.clientX-f,v=B.clientY-g;if(a.classList.contains("br"))c.panel.style.width=h+T+"px",c.panel.style.height=b+v+"px";else if(a.classList.contains("bl")){const w=h-T;w>300&&(c.panel.style.width=w+"px",c.widget.style.right=C+T+"px"),c.panel.style.height=b+v+"px"}else if(a.classList.contains("tr")){c.panel.style.width=h+T+"px";const w=b-v;w>150&&(c.panel.style.height=w+"px",c.widget.style.top=y+v+"px")}else if(a.classList.contains("tl")){const w=h-T,le=b-v;w>300&&(c.panel.style.width=w+"px",c.widget.style.right=C+T+"px"),le>150&&(c.panel.style.height=le+"px",c.widget.style.top=y+v+"px")}},N=()=>{window.removeEventListener("mousemove",S),window.removeEventListener("mouseup",N);const B=c.widget.id==="vnpt-docx-widget";m.setDebounced(ve,{right:B?c.widget.style.right:void 0,top:c.widget.style.top,x:B?void 0:parseFloat(c.widget.style.left),y:parseFloat(c.widget.style.top)},1e3)};window.addEventListener("mousemove",S),window.addEventListener("mouseup",N)})})}function Ve(e,t,o,n=null,i=null){let l=!1,s=0,d=0,r=!1;function u(p){r!==p&&(r=p,i&&i(p))}function a(p){if(p.button!==0)return;l=!0,c.hasDragged=!1;const f=e.getBoundingClientRect();s=p.clientX-f.left,d=p.clientY-f.top,document.body.style.userSelect="none",t&&t.forEach(g=>g.style.cursor="grabbing"),n&&n(),p.preventDefault()}return t.forEach(p=>{p.addEventListener("mousedown",a)}),document.addEventListener("mousemove",function(p){if(!l)return;c.hasDragged=!0;let f=p.clientX-s,g=p.clientY-d;const h=window.innerWidth,b=window.innerHeight,x=document.getElementById("vnpt-toggle-btn"),y=x?x.offsetWidth:40,C=x?x.offsetHeight:40,S=e.id==="vnpt-docx-widget";let N=e.offsetWidth||0;if(S){let v=y+6-N,w=h-N+6;f<v&&(f=v),f>w&&(f=w)}else N=N||200,f<0&&(f=0),f+N>h&&(f=Math.max(0,h-N));let B=r;if(S?B=!1:r?p.clientY<b-40&&(B=!1):p.clientY>b-10&&(B=!0),g<0&&(g=0),B)u(!0),e.style.top=b-e.offsetHeight+"px",S?(e.style.right=h-f-N+"px",e.style.left="auto"):(e.style.left=f+"px",e.style.right="auto"),e.style.bottom="auto";else{u(!1);let T=e.offsetHeight||40,v;if(S)v=10+C;else{const w=e.querySelector(".cw-title-bar");v=w?w.offsetHeight:T}g+v>b&&(g=Math.max(0,b-v)),e.style.top=g+"px",S?(e.style.right=h-f-N+"px",e.style.left="auto"):(e.style.left=f+"px",e.style.right="auto"),e.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(l&&(l=!1,document.body.style.userSelect="",t&&t.forEach(p=>p.style.cursor="grab"),o)){const p=e.id==="vnpt-docx-widget";m.set(o,{left:p?void 0:e.style.left,right:p?e.style.right:void 0,top:e.style.top,x:p?void 0:parseFloat(e.style.left),y:parseFloat(e.style.top),docked:r})}}),{isDocked:()=>r,setDocked:u}}function Tt(){c.widget&&c.header&&c.toggleBtn&&(Ve(c.widget,[c.header,c.toggleBtn],ve),window.addEventListener("resize",()=>{const e=window.innerWidth,t=window.innerHeight,o=document.getElementById("vnpt-toggle-btn"),n=o?o.offsetWidth:40,i=o?o.offsetHeight:40;let l=c.widget.getBoundingClientRect(),s=l.left,d=l.top,r=c.widget.offsetWidth||0,a=n+6-r,p=e-r+6;s<a&&(s=a),s>p&&(s=p),d+10+i>t&&(d=Math.max(0,t-(10+i))),c.widget.style.right=e-s-r+"px",c.widget.style.top=d+"px"}))}function je(e){const t=e.toLowerCase(),{ngay:o,thang:n,nam:i}=Ie();return{ngayky:o,thangky:n,thangky1:n,namky:i,namky1:i,soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[t]||""}function kt(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){if(c.isDefaultMode){Object.keys(j).forEach(t=>{L(t,j[t],k[t]||"")}),D(),E("Đã nạp lại dữ liệu mặc định từ hệ thống.");return}let e=0;Object.keys(k).forEach(t=>{var l;const o=k[t],n=W(t,o);let i="";n&&(i=n.tagName.toLowerCase()==="select"?((l=n.options[n.selectedIndex])==null?void 0:l.text)||"":n.value,e++),i||(i=je(t)),i&&typeof i=="string"&&(["tenDaiDienn","tenToChuc","noiCap","noiKy"].includes(t)?i=st(i):["sdt"].includes(t)?i=ct(i):["ngaySinhCustomer","ngayCapCustomer","ngayCapSoDkdnCustomer","ngayKy"].includes(t)&&(i=dt(i))),L(t,i,null)}),D(),e>0?(this.style.background="#1e8e3e",this.style.color="#fff",this.innerText="Đã quét xong",setTimeout(()=>{this.style.background="",this.style.color="",this.innerText="Quét dữ liệu"},1e3)):E("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(e){e.target.closest("#vnpt-docx-widget")||e.target.closest("#vnpt-inline-calc")||e.target&&e.target.id&&k[e.target.id]!==void 0&&(L(e.target.id,e.target.value,null),D())}),document.addEventListener("change",function(e){var t;if(!(e.target.closest("#vnpt-docx-widget")||e.target.closest("#vnpt-inline-calc"))&&e.target&&e.target.id&&k[e.target.id]!==void 0){let o=e.target.tagName.toLowerCase()==="select"?((t=e.target.options[e.target.selectedIndex])==null?void 0:t.text)||"":e.target.value;L(e.target.id,o,null),D()}})}const St={local:{download(e,t="arraybuffer"){return new Promise((o,n)=>{const i=new FileReader;switch(i.onload=l=>{let s=l.target.result;t==="base64"&&typeof s=="string"&&(s=s.split(",")[1]||s),o(s)},i.onerror=l=>n(l),t.toLowerCase()){case"arraybuffer":i.readAsArrayBuffer(e);break;case"base64":case"dataurl":i.readAsDataURL(e);break;case"text":i.readAsText(e);break;default:n(new Error(`Unsupported read type: ${t}`))}})},async upload(e){return this.download(e,"base64")}}},Nt={getAdapter(e){const t=St[e];if(!t)throw new Error(`Storage adapter not found: ${e}`);return t},async upload(e,t,o={}){return await this.getAdapter(e).upload(t,o)},async download(e,t,o={}){return await this.getAdapter(e).download(t,o.type||"arraybuffer")}};function qe(e,t,o){try{let n;try{n=new window.PizZip(e)}catch(r){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(r);return}const i=new window.docxtemplater(n,{paragraphLoop:!0,linebreaks:!0});i.render(t);const l=i.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),s=URL.createObjectURL(l),d=document.createElement("a");d.href=s,d.download=o,document.body.appendChild(d),d.click(),setTimeout(()=>{document.body.removeChild(d),URL.revokeObjectURL(s)},100)}catch(n){let i=n.message;n.properties&&n.properties.errors instanceof Array?i=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+n.properties.errors.map(s=>"- "+(s.properties.explanation||s.message)).join(`
`):i="Lỗi phần mềm Word sinh ra: "+i,alert(i),console.error("DocX Error:",n)}}function Lt(){const e=document.getElementById("vnpt-export-filename");e&&e.addEventListener("input",()=>{e.dataset.userEdited="1",e.value.trim()||(e.dataset.userEdited="0")});function t(){if(!e||e.dataset.userEdited==="1")return;let o="";if(c.fieldsContainer&&c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(r=>{const a=r.querySelector(".f-key").value.trim().split(",")[0].trim(),p=r.querySelector(".f-val").value.trim();a==="tenToChuc"&&(o=p)}),!o){const d=document.getElementById("tenToChuc");d&&(o=d.tagName.toLowerCase()==="textarea"||d.tagName.toLowerCase()==="input"?d.value.trim():d.innerText.trim())}function n(d){if(!d)return"";let r=d;return r=r.replace(/Tổng công ty/gi,""),r=r.replace(/Công ty/gi,""),r=r.replace(/\bCty\b/gi,""),r=r.replace(/Trách nhiệm hữu hạn/gi,""),r=r.replace(/\bTNHH\b/gi,""),r=r.replace(/Cổ phần/gi,""),r=r.replace(/\bCP\b/gi,""),r=r.replace(/Một thành viên/gi,""),r=r.replace(/\bMTV\b/gi,""),r=r.replace(/Chi nhánh/gi,""),r=r.replace(/Việt Nam/gi,"VN"),r=r.replace(/Viet Nam/gi,"VN"),r=r.replace(/\s+/g," ").trim(),r=r.replace(/^[-,\s]+|[-,\s]+$/g,""),r.length>50&&(r=r.substring(0,47)+"..."),r.replace(/[<>:"/\\|?*]/g,"")}let i=n(o),l=c.templateName?c.templateName.replace(/\.docx$/i,""):"",s=[];l&&s.push(l),i&&s.push(i),s.length>0?e.value=s.join(" - ")+".docx":e.value||(e.value="Export_Auto.docx")}setInterval(t,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const o={};if(c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(d=>{const u=d.querySelector(".f-key").value.trim().split(",")[0].trim(),a=d.querySelector(".f-val").value;u&&(o[u]=a)}),Object.keys(o).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}const i=[];if(Be.forEach(d=>{if(!o[d]||!o[d].trim()){const r=k[d]||d;i.push(r)}}),i.length>0){const d=`Cảnh báo: Bạn còn các trường sau chưa điền dữ liệu:

- ${i.join(`
- `)}

Bạn có chắc chắn muốn tiếp tục xuất file không?`;if(!confirm(d))return}let l=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(l.toLowerCase().endsWith(".docx")||(l+=".docx"),c.templateBuffer){qe(c.templateBuffer,o,l);return}const s=document.getElementById("vnpt-template-file");if(s.files&&s.files.length>0){Nt.download("local",s.files[0],{type:"arraybuffer"}).then(d=>qe(d,o,l)).catch(d=>alert(`Lỗi đọc file: ${d.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')})}const Bt=["chucVu","noiCap","noiCapSoDkdn","ngayky","thangky","namky","thangky1","namky1","noiKy"],Dt=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function It(){function e(){Bt.forEach(n=>{const i=document.getElementById(n);i&&!i.dataset.filled&&(i.dataset.filled="1",ie(i,je(n)))}),Dt.forEach(n=>{const i=document.getElementById(n.src),l=document.getElementById(n.target);i&&l&&!i.dataset.bound&&(i.dataset.bound="1",i.addEventListener("input",()=>ie(l,i.value)))})}let t;new MutationObserver(()=>{clearTimeout(t),t=setTimeout(e,200)}).observe(document.body,{childList:!0,subtree:!0}),e()}function X(e,t=null){return m.get(e,t)}function fe(e,t){m.set(e,t)}function Ue(e,t){if(!t||t.replace(/\D/g,"").length<6)return;let o=X(e,[]);o=o.filter(n=>n!==t),o.unshift(t),fe(e,o.slice(0,10))}function ge(e,t){const o=document.getElementById(t);o&&(o.innerHTML=X(e,[]).map(n=>`<option value="${n}">`).join(""))}function ke(e){return e.toLocaleString("en-US")}function Se(e){return Number(String(e).replace(/[^\d]/g,""))||0}function At(e){return e.charAt(0).toUpperCase()+e.slice(1)}const ae=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function Mt(e){let t=Math.floor(e/100),o=Math.floor(e%100/10),n=e%10,i="";return t>0&&(i+=ae[t]+" trăm ",o===0&&n>0&&(i+="lẻ ")),o>1?(i+=ae[o]+" mươi ",n===1?i+="mốt":n===5?i+="lăm":n>0&&(i+=ae[n])):o===1?(i+="mười ",n===5?i+="lăm":n>0&&(i+=ae[n])):n>0&&(t>0&&(i+="lẻ "),i+=ae[n]),i.trim()}function _t(e){if(e===0)return"không";const t=["","nghìn","triệu","tỷ"];let o="",n=0;for(;e>0;){const i=e%1e3;i>0&&(o=Mt(i)+" "+t[n]+" "+o),e=Math.floor(e/1e3),n++}return o.trim()}function $e(e,t,o){let n=0,i=0,l=0;e==="before"?(n=Se(t),i=Math.round(n*o),l=n+i):e==="tax"?(i=Se(t),n=Math.round(i/o),l=n+i):e==="after"&&(l=Se(t),n=Math.round(l/(1+o)),i=l-n);const s=At(_t(l))+" đồng";return{beforeNum:n,taxNum:i,afterNum:l,beforeStr:ke(n),taxStr:ke(i),afterStr:ke(l),textStr:s}}function Ht(e,t){t.before&&t.before.forEach(o=>V(o,e.beforeStr)),t.tax&&t.tax.forEach(o=>V(o,e.taxStr)),t.after&&t.after.forEach(o=>V(o,e.afterStr)),t.text&&t.text.forEach(o=>V(o,e.textStr))}function he(e,t=null){try{const o=localStorage.getItem(e);return o!==null?JSON.parse(o):t}catch{return t}}function A(e,t){localStorage.setItem(e,JSON.stringify(t))}function Ot(e,t,o,n){let i=he(ee)??"custom",l=he($)??{...j},s=he(G)??{},d=he(F)??{};const r=document.createElement("div");r.className="cw-tab-header";const u={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};u.custom.innerText="📋 Custom",u.custom.className="cw-tab cw-tab-custom",u.default.innerText="📌 Default",u.default.className="cw-tab cw-tab-default",u.sync.innerText="🔗 Sync",u.sync.className="cw-tab cw-tab-sync";function a(){Object.values(u).forEach(v=>v.classList.remove("active")),u[i].classList.add("active")}a();const p=document.createElement("div");p.style.display=n.data?"none":"block";const f=t("📋 Cấu hình Data","data",v=>{p.style.display=v?"none":"block",o(e)}),g=document.createElement("div");g.className="cw-data-body";function h(){g.innerHTML="";let v=i==="sync"?d:i==="custom"?s:l,w=i==="sync"?F:i==="custom"?G:$;const le=Object.keys(v);le.length===0&&i!=="default"&&(g.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),le.forEach(M=>{const Y=document.createElement("div");Y.className="cw-data-row";let me=i!=="default";const z=v[M],be=z&&typeof z=="object"&&z.hasOwnProperty("value"),Ge=be?z.value:z,Le=be&&z.label||M,_=document.createElement("input");_.type="text",_.value=Le,_.className="cw-data-key"+(me?" mutable":""),_.title=M,_.readOnly=!me,me&&(_.onchange=()=>{const I=_.value.trim();if(!I||I===M){_.value=Le;return}be?v[I]={...z,label:I}:v[I]=Ge,delete v[M],A(w,v),h()});const q=document.createElement("input");if(q.type="text",q.value=Ge??"",q.className="cw-data-val",q.oninput=()=>{be?v[M]={...z,value:q.value}:v[M]=q.value,A(w,v)},Y.appendChild(_),Y.appendChild(q),me){const I=document.createElement("button");I.innerHTML="✕",I.className="cw-del-btn",I.onclick=()=>{confirm(`Delete "${Le}"?`)&&(delete v[M],A(w,v),h())},Y.appendChild(I)}else Y.appendChild(document.createElement("div")).className="cw-pad";g.appendChild(Y)})}u.custom.onclick=()=>{i="custom",A(ee,"custom"),a(),h()},u.default.onclick=()=>{i="default",A(ee,"default"),a(),h()},u.sync.onclick=()=>{i="sync",A(ee,"sync"),a(),h()};const b=document.createElement("button");b.innerText="📤",b.className="cw-icon-btn",b.title="Sao lưu toàn bộ dữ liệu ra JSON",b.onclick=()=>Ke();const x=document.createElement("button");x.innerText="📥",x.className="cw-icon-btn",x.title="Khôi phục dữ liệu từ JSON";const y=document.createElement("input");y.type="file",y.accept=".json",y.style.display="none",y.onchange=async v=>{v.target.files.length>0&&await Pe(v.target.files[0])&&setTimeout(()=>location.reload(),1500)},x.onclick=()=>y.click(),p.appendChild(r),r.appendChild(u.custom),r.appendChild(u.default),r.appendChild(u.sync),p.appendChild(g),e.appendChild(f),e.appendChild(p);const C=e.querySelector("#vnpt-cw-fill"),S=e.querySelector("#vnpt-cw-sync"),N=e.querySelector("#vnpt-cw-add"),B=e.querySelector("#vnpt-cw-reset");C&&(C.onclick=ze),S&&(S.onclick=vt),N&&(N.onclick=()=>{i==="default"&&(i="custom",A(ee,"custom"),a());let v=i==="sync"?d:s,w="new_field_"+Date.now();v[w]="",A(i==="sync"?F:G,v),h(),g.scrollTop=g.scrollHeight}),B&&(B.onclick=()=>{confirm("Reset Default Data?")&&(l={...j},A($,l),h())}),h();const T=f.querySelector(".cw-right-wrap")||document.createElement("div");T.className="cw-right-wrap",T.prepend(b),T.prepend(x),T.appendChild(y),f.appendChild(T)}function zt(e,t,o){let n=Number(localStorage.getItem(Z))||bt,i=X(ce)??{calc:!1,data:!0};function l(f,g){const h=document.createElement("button");return h.innerText=f,h.className="cw-action-btn "+g,h}function s(f,g,h){const b=document.createElement("div");b.className="wg-sec-header";const x=document.createElement("span");x.innerText=f;const y=document.createElement("button");return y.className="wg-toggle-btn",y.innerText=i[g]?"▾":"▴",b.appendChild(x),b.appendChild(y),y.onclick=()=>{i[g]=!i[g],y.innerText=i[g]?"▾":"▴",fe(ce,i),h(i[g])},b}function d(f){const g=window.innerWidth,h=window.innerHeight,b=f.getBoundingClientRect();f.style.left=Math.min(Math.max(parseFloat(f.style.left),0),g-b.width)+"px",f.style.top=Math.min(Math.max(parseFloat(f.style.top),0),h-36)+"px"}const r=document.createElement("div");if(!t){r.className="cw-title-bar",r.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const f=document.createElement("div");f.className="cw-btn-group";const g={fill:l("Fill","cw-btn-fill"),sync:l("Sync","cw-btn-sync"),add:l("Add","cw-btn-add"),reset:l("↺","cw-btn-reset")};g.reset.title="Reset Default fields",Object.values(g).forEach(h=>f.appendChild(h)),r.appendChild(f),e.appendChild(r)}const u=document.createElement("div");u.className="cw-body-inline",u.innerHTML=`
    <div class="cw-inline-row">
        <input id="wg-before" class="cw-input-inline" placeholder="Trước thuế" list="wg-before-list" title="Trước thuế">
        <datalist id="wg-before-list"></datalist>
        <div class="cw-tax-group-inline"><input id="wg-taxRate" class="cw-tax-input-inline" title="Thuế (%)"><span class="cw-tax-symbol">%</span></div>
        <input id="wg-tax" class="cw-input-inline" placeholder="Tiền thuế" title="Tiền thuế">
        <input id="wg-after" class="cw-input-inline" placeholder="Sau thuế" list="wg-after-list" title="Sau thuế">
        <datalist id="wg-after-list"></datalist>
        <input id="wg-text" class="cw-input-inline cw-input-readonly-inline" placeholder="Bằng chữ" readonly title="Bằng chữ">
    </div>`,t?t.appendChild(u):e.appendChild(u),t||Ot(e,s,d,i);const a={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text")};a.taxRate.value=n*100,ge(ye,"wg-before-list"),ge(we,"wg-after-list");function p(f,g){const h=$e(f,g,n);a.before.value=h.beforeStr,a.tax.value=h.taxStr,a.after.value=h.afterStr,a.text.value=h.textStr;const b=X(R)||{...mt};Ht(h,b)}if(a.taxRate.oninput=()=>{n=Number(a.taxRate.value)/100||0,fe(Z,n),p("before",a.before.value)},a.before.oninput=()=>{const f=$e("before",a.before.value,n);a.tax.value=f.taxStr,a.after.value=f.afterStr,a.text.value=f.textStr},a.before.onchange=()=>{p("before",a.before.value),Ue(ye,a.before.value),ge(ye,"wg-before-list")},a.tax.oninput=()=>p("tax",a.tax.value),a.after.oninput=()=>p("after",a.after.value),a.after.onchange=()=>{p("after",a.after.value),Ue(we,a.after.value),ge(we,"wg-after-list")},[a.before,a.tax,a.after,a.text].forEach(f=>{["click","focus"].forEach(g=>f.addEventListener(g,()=>{if(!f.value)return;navigator.clipboard.writeText(f.value);const h=f.style.backgroundColor;f.style.backgroundColor="#d1e7dd",setTimeout(()=>f.style.backgroundColor=h,300)}))}),!t){const f=Array.from(e.children).filter(b=>b!==r),g=Ve(e,[r],o,null,b=>{f.forEach(x=>x.style.display=b?"none":""),r.style.borderRadius=b?"8px":"0",b&&(e.style.top=window.innerHeight-(r.offsetHeight||34)+"px")}),h=X(o);return h&&h.docked&&g.setDocked(!0),window.addEventListener("resize",()=>{g.isDocked()?e.style.top=window.innerHeight-r.offsetHeight+"px":d(e)}),g}return null}function Ft(){const e=document.getElementById("vnpt-inline-calc"),t=document.getElementById("vnpt-btn-calc-toggle");let o=c.calcWidget||document.createElement("div");if(!e&&!c.calcWidget?(o.id="vnpt-calc-widget",document.body.appendChild(o),c.calcWidget=o):e&&(o=c.widget),e&&t){let n=X(ce)??{calc:!1,data:!0};const i=l=>{e.style.display=l?"none":"block",t.classList.toggle("active",!l)};i(n.calc),t.onclick=()=>{n.calc=!n.calc,fe(ce,n),i(n.calc)}}return zt(o,e,Ye)}function Rt(){window.addEventListener("keydown",e=>{var t,o,n,i;if(e.altKey&&!e.ctrlKey&&!e.shiftKey){const l=e.key.toLowerCase();let s=!0;switch(l){case"s":(t=document.getElementById("vnpt-btn-scan"))==null||t.click();break;case"e":(o=document.getElementById("vnpt-btn-export"))==null||o.click();break;case"w":(n=document.getElementById("vnpt-toggle-btn"))==null||n.click();break;case"f":(i=document.getElementById("vnpt-btn-fill-back"))==null||i.click();break;default:s=!1;break}s&&e.preventDefault()}})}let re=null;function Ne(){if(!window.__vnptInited){window.__vnptInited=!0,U.info("Initializing VNPT Userscript...");try{We(),Ct(),Ft(),Tt(),Et(),Fe(),kt(),Lt(),It(),wt(),Rt();const e=Oe(()=>{pt(),U.debug("DOM Cache cleared due to mutations")},500);re=new MutationObserver(t=>{t.some(o=>o.addedNodes.length>0||o.removedNodes.length>0)&&e()}),re.observe(document.body,{childList:!0,subtree:!0}),U.info("Userscript initialized successfully.")}catch(e){U.error("Error during userscript initialization:",e)}}}function Kt(){U.info("Cleaning up VNPT Userscript for reload..."),re&&(re.disconnect(),re=null);const e=document.getElementById("vnpt-docx-widget");e&&e.remove();const t=document.getElementById("vnpt-calc-widget");t&&t.remove();const o=document.getElementById("vnpt-styles");o&&o.remove(),window.__vnptInited=!1,U.info("Cleanup completed.")}window.__vnptCleanup=Kt,window.__vnptInit=Ne,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Ne):Ne()})();
