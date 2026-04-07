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
(function(){"use strict";const U={info:(...e)=>console.log("[Tampermonkey Script] INFO:",...e),error:(...e)=>console.error("[Tampermonkey Script] ERROR:",...e),warn:(...e)=>console.warn("[Tampermonkey Script] WARN:",...e)};function Ue(){const e="vnpt-styles";if(document.getElementById(e))return;const n=document.createElement("style");n.id=e,n.textContent=`
        :root {
            --vnpt-primary: #1a73e8;
            --vnpt-primary-hover: #1557b0;
            --vnpt-danger: #ea4335;
            --vnpt-danger-hover: #d93025;
            --vnpt-success: #1e8e3e;
            --vnpt-bg-glass: rgba(255, 255, 255, 0.85);
            --vnpt-border: rgba(0, 0, 0, 0.1);
            --vnpt-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
            --vnpt-radius: 12px;
            --vnpt-font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: var(--vnpt-radius); padding: 12px; 
            box-shadow: var(--vnpt-shadow);
            transition: width 0.2s ease, height 0.2s ease;
        }
        
        #vnpt-panel-body { display: flex; flex-direction: column; overflow: hidden; flex: 1; margin-top: 8px; border-radius: 8px; }

        #vnpt-panel-header { 
            margin: -12px -12px 0 -12px; padding: 10px 15px;
            color: var(--vnpt-primary); font-size: 14px; 
            border-bottom: 1px solid var(--vnpt-border); 
            cursor: move; user-select: none; 
            display: flex; align-items: center; justify-content: space-between; 
            font-weight: 700; background: rgba(255, 255, 255, 0.5);
            border-radius: var(--vnpt-radius) var(--vnpt-radius) 0 0;
            gap: 12px;
        }
        #vnpt-panel-header:hover { background: rgba(255, 255, 255, 0.8); }
        
        .header-left { display: flex; align-items: center; min-width: 80px; }
        .header-center { display: flex; gap: 8px; flex: 1; justify-content: center; margin-right: 30px; }
        .header-right { 
            display: flex; gap: 6px; align-items: center; 
            position: absolute; right: 48px; /* Chừa chỗ cho nút close */
            top: 10px;
        }

        #vnpt-panel-title { font-size: 13px; letter-spacing: 0.5px; color: var(--vnpt-primary); text-transform: uppercase; }

        /* ═══════════════════════════════════════════
           SECTION 3: FIELDS CONTAINER & FIELD ROWS
           ═══════════════════════════════════════════ */
        #vnpt-fields-container { 
            flex: 1; overflow: hidden; background: rgba(255, 255, 255, 0.4); 
            border: 1px solid var(--vnpt-border); border-radius: 8px; 
            margin-bottom: 8px; position: relative; display: flex; flex-direction: column; 
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }
        #vnpt-fields-list { flex: 1; overflow-y: auto; padding: 6px; }

        .vnpt-fields-header {
            display: flex; gap: 4px; padding: 6px 8px;
            background: rgba(26, 115, 232, 0.08); border-bottom: 1px solid var(--vnpt-border);
            font-size: 10px; font-weight: 800; color: var(--vnpt-primary);
            align-items: center; text-transform: uppercase; letter-spacing: 0.3px;
        }
        .vnpt-fields-header span { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .vnpt-fields-header .h-chk { flex: 0 0 24px; text-align: center; }
        .vnpt-fields-header .h-label { flex: 0.35; padding-left: 5px; }
        .vnpt-fields-header .h-key { flex: 0.45; display: none; padding-left: 5px; }
        .show-ids .vnpt-fields-header .h-key { display: block; }
        .vnpt-fields-header .h-drag { flex: 0 0 18px; }
        .vnpt-fields-header .h-val { flex: 1; padding-left: 5px; }
        
        .vnpt-default-banner {
            background: linear-gradient(90deg, #ea4335, #d93025); color: #fff;
            padding: 6px 12px; font-size: 11px; font-weight: 700;
            text-align: center; border-radius: 6px; margin: 0 8px 8px 8px;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            box-shadow: 0 4px 10px rgba(234, 67, 53, 0.3);
            animation: slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        
        #vnpt-fields-container.vnpt-mode-default {
            border: 2px solid var(--vnpt-danger) !important;
            box-shadow: inset 0 0 12px rgba(234, 67, 53, 0.1);
        }

        .vnpt-field-row { 
            display: flex; gap: 4px; margin-bottom: 4px; align-items: center; 
            padding: 4px; border-radius: 6px; transition: all 0.2s;
            background: rgba(255, 255, 255, 0.5); border: 1px solid transparent;
        }
        .vnpt-field-row:hover { background: #fff; border-color: rgba(26, 115, 232, 0.2); transform: translateX(2px); box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        
        .row-drag-handle { cursor: grab; padding: 0; font-size: 16px; color: #bdc1c6; user-select: none; flex: 0 0 18px; text-align: center; }
        .row-drag-handle:active { cursor: grabbing; }
        .vnpt-field-row.dragging { opacity: 0.4; }
        .vnpt-field-row.over { background-color: #e8f0fe; border: 1px dashed var(--vnpt-primary); }

        .vnpt-field-row input { 
            flex: 1; padding: 6px 8px; border: 1px solid #dadce0; border-radius: 6px; 
            font-size: 12px; transition: all 0.2s; background: #fff;
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
            border: none; padding: 0 15px; height: 32px; 
            display: flex; align-items: center; justify-content: center; 
            font-weight: 700; font-size: 12px; cursor: pointer; 
            border-radius: 8px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
            white-space: nowrap; box-sizing: border-box; 
        }
        .vnpt-btn-action:active { transform: scale(0.96); }

        .vnpt-btn-icon {
            background: transparent; border: none; width: 32px; height: 32px;
            display: flex; align-items: center; justify-content: center;
            font-size: 18px; cursor: pointer; border-radius: 8px;
            color: #5f6368; transition: all 0.2s;
        }
        .vnpt-btn-icon:hover { background: rgba(0,0,0,0.05); color: var(--vnpt-primary); }
        .vnpt-btn-icon.active { background: rgba(26, 115, 232, 0.12); color: var(--vnpt-primary); }

        .btn-scan { background: #e6f4ea; color: var(--vnpt-success); border: 1px solid #ceead6; } 
        .btn-scan:hover { background: var(--vnpt-success); color: #fff; box-shadow: 0 4px 10px rgba(30, 142, 62, 0.3); }
        
        .btn-fill-back { background: #f3e5f5; color: #7b1fa2; border: 1px solid #e1bee7; } 
        .btn-fill-back:hover { background: #7b1fa2; color: #fff; box-shadow: 0 4px 10px rgba(123, 31, 162, 0.3); }

        .field-required-empty {
            border-color: var(--vnpt-danger) !important;
            background-color: #fff0f0 !important;
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
            40%, 60% { transform: translate3d(3px, 0, 0); }
        }

        .btn-export { background: var(--vnpt-primary); color: white; padding: 0 16px; font-weight: 800; } 
        .btn-export:hover { background: var(--vnpt-primary-hover); box-shadow: 0 4px 12px rgba(26, 115, 232, 0.4); }

        /* Utility Menu UI */
        .vnpt-util-dropdown { position: relative; }
        .vnpt-util-menu {
            position: absolute; top: calc(100% + 8px); right: 0;
            background: #fff; border: 1px solid var(--vnpt-border); border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15); z-index: 100000;
            display: none; flex-direction: column; min-width: 240px;
            padding: 8px 0; animation: menuFadeIn 0.2s ease-out;
        }
        @keyframes menuFadeIn { from { opacity: 0; transform: translateY(-15px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .vnpt-util-menu.show { display: flex; }
        
        .util-item {
            background: none; border: none; padding: 10px 16px; width: 100%;
            text-align: left; font-size: 13px; cursor: pointer;
            color: #3c4043; font-weight: 600; transition: all 0.2s;
            display: flex; align-items: center; gap: 12px;
        }
        .util-item:hover { background: #f8f9fa; color: var(--vnpt-primary); }
        
        .util-separator { height: 1px; background: #f1f3f4; margin: 6px 0; }
        .util-submenu-title { padding: 8px 16px 4px 18px; font-size: 10px; font-weight: 800; color: #9aa0a6; text-transform: uppercase; letter-spacing: 0.5px; }
        
        .size-options { display: flex; padding: 6px 16px 10px 16px; gap: 8px; }
        .size-options button {
            flex: 1; padding: 6px 0; border: 1px solid #dadce0; border-radius: 6px;
            background: #fff; font-size: 11px; font-weight: 700; cursor: pointer;
            transition: all 0.2s;
        }
        .size-options button:hover { background: #e8f0fe; border-color: #d2e3fc; color: var(--vnpt-primary); }

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
            background: rgba(241, 243, 244, 0.6); 
            padding: 8px 12px; 
            border-bottom: 1px solid var(--vnpt-border);
            display: block;
        }
        .cw-body-inline { display: flex; flex-direction: column; gap: 6px; }
        .cw-inline-row { display: flex; align-items: center; gap: 6px; width: 100%; box-sizing: border-box; }
        .cw-input-inline { 
            flex: 1; min-width: 60px; padding: 6px 10px; border: 1px solid #dadce0; border-radius: 6px; 
            font-size: 12px; font-weight: 600; height: 30px; box-sizing: border-box;
            background: #fff; transition: all 0.2s;
        }
        .cw-input-inline:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 2px rgba(26,115,232,0.1); outline: none; }
        .cw-input-readonly-inline { background-color: #f8f9fa; color: var(--vnpt-success); cursor: default; flex: 1.5; border-color: #ceead6; }
        
        .cw-tax-group-inline { position: relative; display: flex; align-items: center; flex: 0 0 auto; min-width: 50px; }
        .cw-tax-input-inline { width: 50px; padding: 6px 20px 6px 8px; border: 1px solid #dadce0; border-radius: 6px; font-size: 12px; text-align: right; height: 30px; }
        .cw-tax-symbol { position: absolute; right: 6px; color: #5f6368; font-size: 10px; font-weight: bold; pointer-events: none; }

        .cw-map-dropdown-container { position: relative; flex-shrink: 0; }
        .cw-map-btn-inline { background: #fff; border: 1px solid #dadce0; border-radius: 6px; cursor: pointer; height: 30px; width: 30px; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: all 0.2s; color: #5f6368; }
        .cw-map-btn-inline:hover { background: #f8f9fa; color: var(--vnpt-primary); border-color: var(--vnpt-primary); }

        .btn-calc-toggle { background: rgba(26, 115, 232, 0.08); color: var(--vnpt-primary); }
        .btn-calc-toggle:hover { background: rgba(26, 115, 232, 0.15); }
        .btn-calc-toggle.active { background: var(--vnpt-primary); color: #fff; box-shadow: 0 4px 10px rgba(26, 115, 232, 0.3); }

        .btn-more.active { background: rgba(0,0,0,0.1); }

    `,document.head.appendChild(n)}const je={widget:null,panel:null,header:null,bannerArea:null,toggleBtn:null,fieldsContainer:null,panelBody:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1,templateBuffer:null,templateName:null,hasDragged:!1},X=new Map,s=new Proxy(je,{get(e,n){return n==="on"?(o,a)=>{X.has(o)||X.set(o,[]),X.get(o).push(a)}:e[n]},set(e,n,o){const a=e[n];return e[n]=o,a!==o&&X.has(n)&&X.get(n).forEach(t=>t(o,a)),!0}}),L={tenDaiDienn:"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT",emailDaiDien:"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Số GPKD | MST",goiDV:"Gói Dịch Vụ",ngayKy:"Ngày ký",thangKy:"Tháng Ký",namKy:"Năm ký",soHopDong:"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký"},Be=["soHopDong","tenDaiDienn","cmnd","sdt","diaChi","tenToChuc","ngayCapCustomer","emailDaiDien","soDkdn","goiDV","soHopDong"],re="vnpt_docx_fields",ve="vnpt_docx_default_fields",Y="vnpt_docx_position",le="vnpt_docx_size",xe="vnpt_docx_opened",j="vnpt_autofill_data_default",$="vnpt_autofill_data_custom",R="vnpt_autofill_data_sync",$e="vnpt_widget_pos",Q="vnd_tax_rate",ye="vnd_before_history",we="vnd_after_history",se="vnpt_widget_collapsed",J="vnd_calc_map",Z="vnpt_widget_datatab",ce="vnpt_templates";let M=null;function T(e,n="#198754",o=2500){M||(M=document.createElement("div"),M.id="vnpt-toast-container",Object.assign(M.style,{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column-reverse",alignItems:"center",gap:"8px",zIndex:"1000000",pointerEvents:"none"}),document.body.appendChild(M));const a=document.createElement("div");a.innerText=e,Object.assign(a.style,{background:n,color:"#fff",padding:"8px 18px",borderRadius:"24px",opacity:"0",transform:"translateY(10px)",transition:"opacity 0.3s, transform 0.3s",fontSize:"13px",fontWeight:"500",fontFamily:"'Segoe UI', Roboto, sans-serif",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",whiteSpace:"nowrap",pointerEvents:"auto"}),M.appendChild(a),requestAnimationFrame(()=>{a.style.opacity="1",a.style.transform="translateY(0)"}),setTimeout(()=>{a.style.opacity="0",a.style.transform="translateY(-10px)",setTimeout(()=>{a.remove(),M&&M.childNodes.length},300)},o)}const Ge="vnpt_templates_db",O="buffers";let de=null;function Ee(){return de?Promise.resolve(de):new Promise((e,n)=>{const o=indexedDB.open(Ge,1);o.onupgradeneeded=a=>{const t=a.target.result;t.objectStoreNames.contains(O)||t.createObjectStore(O)},o.onsuccess=a=>{de=a.target.result,e(de)},o.onerror=()=>n(o.error)})}async function We(e,n){const o=await Ee();return new Promise((a,t)=>{const i=o.transaction(O,"readwrite").objectStore(O).put(n,e);i.onsuccess=()=>a(),i.onerror=()=>t(i.error)})}async function Xe(e){const n=await Ee();return new Promise((o,a)=>{const l=n.transaction(O,"readonly").objectStore(O).get(e);l.onsuccess=()=>o(l.result),l.onerror=()=>a(l.error)})}async function Ye(e){const n=await Ee();return new Promise((o,a)=>{const l=n.transaction(O,"readwrite").objectStore(O).delete(e);l.onsuccess=()=>o(),l.onerror=()=>a(l.error)})}const F=new Map,pe=new Map,m={isGM:typeof GM_setValue<"u"&&typeof GM_getValue<"u",get(e,n=null){if(F.has(e))return F.get(e);try{let o;if(this.isGM?o=GM_getValue(e,null):o=localStorage.getItem(e),o==null)return n;const a=typeof o=="string"?JSON.parse(o):o;return F.set(e,a),a}catch(o){return console.warn(`[Storage] Không thể đọc key "${e}":`,o),n}},set(e,n){F.set(e,n);try{return this.isGM?GM_setValue(e,n):localStorage.setItem(e,JSON.stringify(n)),!0}catch(o){return console.error(`[Storage] Không thể ghi key "${e}":`,o),!1}},setDebounced(e,n,o=500){F.set(e,n),pe.has(e)&&clearTimeout(pe.get(e));const a=setTimeout(()=>{this.set(e,n),pe.delete(e)},o);pe.set(e,a)},remove(e){F.delete(e);try{this.isGM?GM_deleteValue(e):localStorage.removeItem(e)}catch(n){console.error(`[Storage] Không thể xóa key "${e}":`,n)}},clearCache(){F.clear()}};function ee(){try{const e=m.get(ce)||[],n=e.filter(o=>o.type!=="local");return n.length!==e.length&&te(n),n}catch{return[]}}function te(e){m.set(ce,e)}function Qe(e){const n=e.match(/drive\.google\.com\/file\/d\/([^/]+)/);return n?`https://drive.google.com/uc?export=download&id=${n[1]}`:e}function Je(e){return new Promise((n,o)=>{GM_xmlhttpRequest({method:"GET",url:Qe(e),responseType:"arraybuffer",onload:a=>{if(a.status>=200&&a.status<300){if(a.response&&a.response.byteLength>4){const t=new Uint8Array(a.response.slice(0,4));if(t[0]===80&&t[1]===75&&t[2]===3&&t[3]===4){n(a.response);return}else{o(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}n(a.response)}else o(new Error(`HTTP ${a.status}: Không lấy được file`))},onerror:()=>o(new Error("Không thể tải URL.")),ontimeout:()=>o(new Error("Timeout khi tải URL."))})})}async function Ze(e,n,o){const a=e.name.replace(/\.docx$/i,""),t=prompt("Đặt tên biến nhớ cho file này:",a);if(!(!t||!t.trim()))try{const c=await e.arrayBuffer();await We(t.trim(),c);const i=ee().filter(r=>r.name!==t.trim()&&r.fileName!==e.name);i.unshift({name:t.trim(),type:"local_idb",fileName:e.name,lastUsed:Date.now()}),te(i),H(n,o),o&&o(c,t.trim())}catch(c){T(`❌ Lỗi lưu file: ${c.message}`,"#dc3545")}}function H(e,n,o=null){let a=e.querySelector(".vnpt-template-manager-inner"),t,c;if(a)t=a.querySelector(".vnpt-local-list-container"),c=a.querySelector(".vnpt-btn-wrap");else{e.innerHTML="",a=document.createElement("div"),a.className="vnpt-template-manager-inner";const r=document.createElement("div");r.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const p=document.createElement("span");p.className="vnpt-title-main",p.style.cssText="font-size:11px;font-weight:700;color:#444;",c=document.createElement("div"),c.className="vnpt-btn-wrap",c.style.cssText="display:flex;gap:4px;",r.appendChild(p),r.appendChild(c),a.appendChild(r),t=document.createElement("div"),t.className="vnpt-local-list-container",t.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",a.appendChild(t),e.appendChild(a)}const l=ee(),i=a.querySelector(".vnpt-title-main");i.innerHTML="Templates"+(o?` <span style="color:#2e7d32;">(Đang dùng: ${o})</span>`:""),l.length===0?t.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':t.innerHTML="",l.forEach((r,p)=>{const u=document.createElement("div");u.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",u.title=r.fileName||r.url||r.name,u.tabIndex=0,u.onfocus=()=>u.style.boxShadow="0 0 0 2px #28a745",u.onblur=()=>u.style.boxShadow="none";const d=r.type==="local"||r.type==="local_base64"||r.type==="local_idb"?"OFF":"ON",x=d==="OFF"?"#6c757d":"#28a745",w=document.createElement("span");w.textContent=d,w.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${x};color:#fff;`;const v=document.createElement("span");v.textContent=r.name,v.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",u.onclick=()=>{u.focus(),et(r,n,o,e)},u.appendChild(w),u.appendChild(v);const E=document.createElement("button");E.innerHTML="✎",E.title="Đổi tên template",E.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",E.onclick=h=>{h.stopPropagation();const g=prompt("Đổi tên template:",r.name);if(g&&g.trim()&&g.trim()!==r.name){const y=ee();y[p].name=g.trim(),te(y),H(e,n,o)}},u.appendChild(E);const f=document.createElement("button");f.innerHTML="✕",f.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",f.onclick=async h=>{if(h.stopPropagation(),confirm(`Xoá biểu mẫu "${r.name}"?`)){const g=ee();g.splice(p,1),te(g),r.type==="local_idb"&&await Ye(r.name).catch(()=>null),H(e,n,o===r.name?null:o)}},u.appendChild(f),t.appendChild(u)})}function et(e,n,o,a){const t=ee(),c=t.find(l=>l.name===e.name&&(l.url===e.url||l.type===e.type));if(c&&(c.lastUsed=Date.now(),te(t)),e.type==="local_idb"){Xe(e.name).then(l=>{if(!l)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");n&&n(l,e.name),H(a,n,e.name)}).catch(l=>{T(`❌ Lỗi nạp File IDB: ${l.message}`,"#dc3545")});return}if(e.type==="local_base64"&&e.data){try{const l=window.atob(e.data.split(",")[1]),i=l.length,r=new Uint8Array(i);for(let p=0;p<i;p++)r[p]=l.charCodeAt(p);n&&n(r.buffer,e.name),H(a,n,e.name)}catch(l){T(`❌ Lỗi nạp Base64: ${l.message}`,"#dc3545")}return}Je(e.url).then(l=>{n&&n(l,e.name),H(a,n,e.name)}).catch(l=>{T(`❌ ${l.message}`,"#dc3545")})}const P=new Map;function tt(){P.clear()}function nt(e){e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function ne(e,n){var t;const o=e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,a=(t=Object.getOwnPropertyDescriptor(o,"value"))==null?void 0:t.set;a?a.call(e,n):e.value=n,nt(e)}function ue(e){if(!e)return null;const n=P.get(e);if(n&&document.contains(n))return n;const o=document.getElementById(e);if(o&&(o.tagName==="INPUT"||o.tagName==="TEXTAREA"))return P.set(e,o),o;const a=`input[id="${e}"], textarea[id="${e}"], input[name="${e}"], textarea[name="${e}"], input[formcontrolname="${e}"], textarea[formcontrolname="${e}"], input[placeholder="${e}"], textarea[placeholder="${e}"]`,t=document.querySelector(a);if(t)return P.set(e,t),t;for(const c of document.querySelectorAll("label"))if(c.textContent.trim()===e){let l=null;if(c.htmlFor&&(l=document.getElementById(c.htmlFor)),!l){let i=c.parentElement;for(;i;){const r=i.querySelector("input,textarea");if(r){l=r;break}if(i=i.parentElement,(i==null?void 0:i.tagName)==="FORM")break}}if(l)return P.set(e,l),l}return null}function fe(e){if(!e)return null;const n=P.get(`lbl:${e}`);if(n&&document.contains(n))return n;for(const o of document.querySelectorAll("label"))if(o.innerText.trim()===e){const a=o.parentElement.querySelector("input, textarea");if(a)return P.set(`lbl:${e}`,a),a}return null}function K(e,n){const o=ue(e)||fe(e);o&&ne(o,n)}function ot(e=new Date){return String(e.getDate()).padStart(2,"0")}function at(e=new Date){return String(e.getMonth()+1).padStart(2,"0")}function it(e=new Date){return String(e.getFullYear())}function De(){const e=new Date;return{ngay:ot(e),thang:at(e),nam:it(e)}}const{ngay:Ie,thang:Ae,nam:_e}=De(),V={ngayKy:{label:"Ngày ký",value:Ie},"thangKy, thangKy1":{label:"Tháng ký",value:Ae},"namKy, namKy1":{label:"Năm ký",value:_e},"ngayTiepNhan, ngayThangNamKy":{label:"Ngày ký (full)",value:`${Ie}/${Ae}/${_e}`},tenDoanhNghiepB:{label:"Tên doanh nghiệp B",value:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM"},diaChiB:{label:"Địa chỉ B",value:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội"},maSoThueB:{label:"Mã số thuế B",value:"0100686223"},stkB:{label:"Số tài khoản B",value:"1600114156"},diaChiStkB:{label:"Ngân hàng/Địa chỉ STK B",value:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)"},"tenB, nguoiDaiDienB":{label:"Người đại diện B",value:"Phạm Khánh Chung"},"chucVuB, chucVuDaiDienB":{label:"Chức vụ B",value:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp"},"giayUyQuyenSoB, soGiayUyQuyenB":{label:"Giấy ủy quyền số B",value:"2628/GUQ-VNPT-HNI-VP"},"giayUyQuyenNgayB, ngayGiayUyQuyenB":{label:"Giấy ủy quyền ngày B",value:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},GiayUyQuyenB:{label:"Giấy ủy quyền B (full)",value:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},tenDoanhNghiepB1:{label:"Tên doanh nghiệp B (phụ)",value:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},donViTiepNhan:{label:"Đơn vị tiếp nhận",value:"TTKD KHDN"},"tenTiepNhan, tenNguoiNhan":{label:"Người tiếp nhận",value:"Bùi Anh"},dienThoaiB:{label:"Điện thoại B",value:"02436686868"},diaChiTaiKhoanB:{label:"Địa chỉ tài khoản B",value:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 "},noiKy:{label:"Nơi ký",value:"Hà Nội"},emailB:{label:"Email B",value:""},"lienheHopDongB, lienheTuVanB, lienheHoaDonB, sucoCap1B, sucoCap2B, sucoCap3B, sucoCap4B":{label:"Liên hệ B (AM)",value:"AM Bùi Anh"}},Me={soHopDong:"inputContractGroupName, contractName"},rt={after:["cuocDV","tongCong","tongCongHD","congCA","giaTriHopDong","tongGIaTriHopDong"],before:["donGiaCA","thanhTienCA","tongThanhTien","tongCuocTruocThue"],tax:["tongThueGTGT","tongThue","thueCA","thueVAT"],text:["soTienThanhToanBangChu","tongCongBangChu","tongCongHDbangChu","ghiChuGiaTriHopDong","tongGiaTriHopDongBangChu"]},lt=.08;function Oe(e,n){let o;return function(...t){const c=()=>{clearTimeout(o),e(...t)};clearTimeout(o),o=setTimeout(c,n)}}function He(){const e=m.get(j)??{...V},n=m.get($)??{},o={...e,...n};Object.keys(o).forEach(a=>{const t=o[a],c=t&&typeof t=="object"&&t.hasOwnProperty("value")?t.value:t;a.split(",").map(i=>i.trim()).filter(i=>i).forEach(i=>{let r=ue(i)||fe(i);r&&ne(r,c)})}),T("✅ Auto fill complete")}function st(){let e=m.get(R)??{};const n={...Me,...e},o=Object.keys(n);if(o.length===0){T("⚠️ No sync mapping","#ffc107");return}o.forEach(a=>{let t=ue(a)||fe(a);t&&t.value!==void 0&&t.value!==""&&n[a].split(",").map(l=>l.trim()).filter(l=>l).forEach(l=>K(l,t.value))}),T("✅ Sync form complete","#d39e00")}let Ce=!1;const ct=(e,n)=>{var r;if(Ce)return;let o=m.get(R)??{};const a={...Me,...o};if(Object.keys(a).length===0)return;let t=e.id,c=e.name,l=null;if(t){const p=document.querySelector(`label[for="${t}"]`);p&&(l=p.textContent.trim())}if(!l){const p=e.closest("label");p&&(l=(r=Array.from(p.childNodes).find(u=>u.nodeType===3))==null?void 0:r.textContent.trim())}let i=a[t]||a[c]||a[l];if(i){Ce=!0;try{i.split(",").map(u=>u.trim()).filter(u=>u).forEach(u=>{if(u!==t&&u!==c&&u!==l){const d=ue(u)||fe(u);d&&document.activeElement!==d&&ne(d,n)}})}finally{Ce=!1}}},dt=Oe((e,n)=>{ct(e,n)},250);function pt(){document.addEventListener("input",e=>{const n=e.target;!n||!["INPUT","TEXTAREA"].includes(n.tagName)||n.closest("#vnpt-docx-widget")||n.closest("#vnpt-inline-calc")||dt(n,n.value)})}function B(e,n,o=null,a=""){const t=s.fieldsContainer.querySelector(".text-hint");t&&t.remove();const c=s.fieldsContainer.querySelectorAll(".f-key");let l=!1;for(let i of c)if(i.value.split(",")[0].trim()===e){const p=i.closest(".vnpt-field-row"),u=p.querySelector(".f-val"),d=p.querySelector(".f-label");n!==""&&u.value!==n&&document.activeElement!==u&&(u.value=n),o!==null&&o!==""&&d.value!==o&&document.activeElement!==d&&(d.value=o),a!==""&&i.value!==e+", "+a&&document.activeElement!==i&&(i.value=e+", "+a),l=!0;break}if(!l){(o===null||o==="")&&(o=L[e]||"");const i=document.createElement("div");i.className="vnpt-field-row row-item",i.setAttribute("draggable","false");let r=e;a&&(r+=", "+a),i.innerHTML=`
            <input type="checkbox" class="row-chk" title="Chọn" style="margin: 0 2px 0 2px;" />
            <input type="text" class="f-label" value="${o}" />
            <input type="text" class="f-key" value="${r}" title="Biến DOCX và IDs đồng bộ" />
            <span class="row-drag-handle" title="Kéo">=</span>
            <input type="text" class="f-val" value="${n}" />
        `;const p=i.querySelector(".f-val"),u=i.querySelector(".f-key");e==="tenToChuc"&&(p.style.textAlign="right");const d=()=>{Be.includes(e)&&(p.value.trim()?p.classList.remove("field-required-empty"):p.classList.add("field-required-empty"))},x=()=>{const v=p.value;u.value.split(",").map(f=>f.trim()).filter(f=>f).forEach(f=>K(f,v))};u.addEventListener("input",function(){D();const v=this.value.split(",")[0].trim();p.style.textAlign=v==="tenToChuc"?"right":"",x()}),i.querySelector(".f-label").addEventListener("input",D),p.addEventListener("input",function(){D(),x(),d()}),d();const w=i.querySelector(".row-drag-handle");w.addEventListener("mouseenter",()=>i.setAttribute("draggable","true")),w.addEventListener("mouseleave",()=>{i.classList.contains("dragging")||i.setAttribute("draggable","false")}),i.addEventListener("dragstart",function(v){s.draggedRowForVNPT=this,v.dataTransfer.effectAllowed="move",v.dataTransfer.setData("text/plain",e),this.classList.add("dragging")}),i.addEventListener("dragover",v=>(v.preventDefault(),!1)),i.addEventListener("dragenter",function(){this.classList.add("over")}),i.addEventListener("dragleave",function(){this.classList.remove("over")}),i.addEventListener("drop",function(v){if(v.stopPropagation(),s.draggedRowForVNPT&&s.draggedRowForVNPT!==this){const E=Array.from(s.fieldsContainer.querySelectorAll(".vnpt-field-row")),f=E.indexOf(s.draggedRowForVNPT),h=E.indexOf(this);f<h?this.parentNode.insertBefore(s.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(s.draggedRowForVNPT,this),D()}return!1}),i.addEventListener("dragend",function(){this.setAttribute("draggable","false"),s.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(v=>{v.classList.remove("over","dragging")}),s.draggedRowForVNPT=null}),s.fieldsContainer.appendChild(i),s.fieldsContainer.scrollTop=s.fieldsContainer.scrollHeight}}function D(){const e=s.isDefaultMode?ve:re,n={};s.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(a=>{const c=a.querySelector(".f-key").value.trim().split(",").map(u=>u.trim()).filter(u=>u),l=c[0],i=c.slice(1).join(", "),r=a.querySelector(".f-label").value.trim(),p=a.querySelector(".f-val").value;l&&(n[l]={label:r,value:p,sync:i})}),m.setDebounced(e,n,1e3)}function Te(){try{s.fieldsContainer.innerHTML="";const n=m.get(re)||{};Object.keys(L).forEach(o=>{const a=L[o],t=n[o];t&&typeof t=="object"?B(o,t.value,t.label||a,t.sync||""):t?B(o,t,a,""):B(o,"",a,"")}),Object.keys(n).forEach(o=>{if(!(o in L)){const a=n[o];typeof a=="object"?B(o,a.value,a.label,a.sync||""):B(o,a,"","")}}),Object.keys(L).length===0&&Object.keys(n).length===0&&(s.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(n){console.error("Error loading config:",n),Object.keys(L).forEach(o=>B(o,"",L[o]))}const e=m.get(Y);e&&s.widget&&(s.widget.style.bottom="auto",e.right?(s.widget.style.right=e.right,s.widget.style.left="auto"):e.left&&(s.widget.style.left=e.left,s.widget.style.right="auto"),e.top&&(s.widget.style.top=e.top))}function ut(){document.getElementById("vnpt-btn-toggle-id").onclick=()=>s.fieldsContainer.classList.toggle("show-ids"),document.getElementById("vnpt-btn-default").onclick=()=>{s.isDefaultMode=!s.isDefaultMode},s.on("isDefaultMode",e=>ze(e)),document.getElementById("vnpt-btn-reset-default").onclick=()=>{confirm("Khôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?")&&(m.remove(ve),m.remove(J),m.remove(Q),s.isDefaultMode&&(ze(!0),T("🔄 Đã khôi phục dữ liệu gốc","#1a73e8")))},document.getElementById("vnpt-btn-batch-del").onclick=()=>{const e=s.fieldsContainer.querySelectorAll(".vnpt-field-row");let n=0;e.forEach(o=>{var a;(a=o.querySelector(".row-chk"))!=null&&a.checked&&(o.remove(),n++)}),n===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(e.forEach(o=>o.remove()),T("🗑️ Đã xóa toàn bộ","#ff5252"),D()):(T(`🗑️ Đã xóa ${n} trường`,"#ff5252"),D())},document.getElementById("vnpt-btn-add").onclick=()=>{const e=s.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;B("bien_moi_"+e,"","",""),D()},document.getElementById("vnpt-btn-fill-back").onclick=()=>{He();let e=0;s.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(n=>{const o=n.querySelector(".f-key").value.trim(),a=n.querySelector(".f-val").value;o.split(",").map(t=>t.trim()).filter(Boolean).forEach(t=>{(document.getElementById(t)||document.getElementsByName(t)[0])&&(K(t,a),e++)})}),e>0?T(`✅ Đã điền ngược ${e} trường`,"#198754"):T("⚠️ Không khớp trường nào","#ffc107")}}function ze(e){const n=document.getElementById("vnpt-btn-default"),o=document.getElementById("vnpt-btn-reset-default");if(s.fieldsContainer.innerHTML="",s.bannerArea.innerHTML="",e){n.classList.add("active"),n.innerHTML="✅ Chế độ: Dữ liệu mặc định",o&&(o.style.display="flex"),s.fieldsContainer.classList.add("vnpt-mode-default"),T("📌 Chế độ Dữ liệu mặc định (Có thể sửa)","#ea4335");const a=document.createElement("div");a.className="vnpt-default-banner",a.innerHTML="<span> Lưu ý: đây là Dữ liệu mặc định (Có thể sửa/lưu)</span>",s.bannerArea.appendChild(a);const t=m.get(ve);t===null?Object.keys(V).forEach(c=>{const l=V[c],i=l&&typeof l=="object"?l.value:l,r=l&&typeof l=="object"?l.label:L[c]||"";B(c,i,r)}):Object.keys(t).forEach(c=>{const l=t[c];B(c,l.value,l.label,l.sync||"")})}else n.classList.remove("active"),n.innerHTML="🛠 Dữ liệu mặc định VNPT",o&&(o.style.display="none"),s.fieldsContainer.classList.remove("vnpt-mode-default"),T("📋 Đã quay lại Dữ liệu cá nhân"),Te()}function ft(){const e={version:"1.0",timestamp:Date.now(),fields:m.get(re)||{},templates:m.get(ce)||[],position:m.get(Y)||null,size:m.get(le)||null,calc:{default:m.get(j)||null,custom:m.get($)||null,sync:m.get(R)||null,map:m.get(J)||{},taxRate:Number(m.get(Q))||.08}},n=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),o=URL.createObjectURL(n),a=document.createElement("a");a.href=o,a.download=`vnpt_config_${new Date().toISOString().slice(0,10)}.json`,a.click(),URL.revokeObjectURL(o),T("📤 Đã xuất cấu hình JSON")}function gt(){const e=document.createElement("input");e.type="file",e.accept=".json",e.onchange=async n=>{const o=n.target.files[0];if(o)try{const a=await o.text(),t=JSON.parse(a);if(!t.fields&&!t.calc)throw new Error("Định dạng file không hợp lệ!");t.fields&&m.set(re,t.fields),t.templates&&m.set(ce,t.templates),t.position&&m.set(Y,t.position),t.size&&m.set(le,t.size),t.calc&&(t.calc.default&&m.set(j,t.calc.default),t.calc.custom&&m.set($,t.calc.custom),t.calc.sync&&m.set(R,t.calc.sync),t.calc.map&&m.set(J,t.calc.map),t.calc.taxRate!==void 0&&m.set(Q,t.calc.taxRate)),await Te();const c=document.getElementById("vnpt-calc-widget");if(c){const i=document.getElementById("wg-taxRate");i&&t.calc&&t.calc.taxRate!==void 0&&(i.value=t.calc.taxRate*100),t.calc&&t.calc.map&&c.querySelectorAll("input[data-clink]").forEach(r=>{const p=r.dataset.clink;t.calc.map[p]&&(r.value=(t.calc.map[p]||[]).join(", "))})}const l=document.getElementById("vnpt-template-manager");l&&H(l,(i,r)=>{AppState.templateBuffer=i,AppState.templateName=r}),t.position&&AppState.widget&&(t.position.right?(AppState.widget.style.right=t.position.right,AppState.widget.style.left="auto"):t.position.left&&(AppState.widget.style.left=t.position.left,AppState.widget.style.right="auto"),t.position.top&&(AppState.widget.style.top=t.position.top),AppState.widget.style.bottom="auto"),t.size&&AppState.panel&&(AppState.panel.style.width=t.size.width+"px",AppState.panel.style.height=t.size.height+"px"),T("✅ Nhập cấu hình thành công!")}catch(a){console.error("Lỗi Import:",a),alert("Lỗi: "+a.message)}},e.click()}function mt(){const e=document.getElementById("vnpt-docx-widget")||document.createElement("div");e.id="vnpt-docx-widget";const n=m.get(xe)===!0;e.innerHTML=`
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
                        <button class="vnpt-btn-icon btn-more" id="vnpt-btn-more" title="Thêm công cụ">⋮</button>
                        <div class="vnpt-util-menu" id="vnpt-util-menu">
                            <button class="util-item" id="vnpt-btn-default">🛠 Dữ liệu mặc định VNPT</button>
                            <button class="util-item" id="vnpt-btn-reset-default" style="display: none; color: #d32f2f;">🔄 Khôi phục dữ liệu gốc</button>
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
    `,document.body.appendChild(e),s.widget=e,s.panel=document.getElementById("vnpt-export-panel"),s.toggleBtn=document.getElementById("vnpt-toggle-btn"),s.header=document.getElementById("vnpt-panel-header"),s.bannerArea=document.getElementById("vnpt-banner-area"),s.fieldsContainer=document.getElementById("vnpt-fields-list");try{const i=m.get(le);i&&i.width&&i.height&&(s.panel.style.width=i.width+"px",s.panel.style.height=i.height+"px")}catch(i){console.error("Lỗi load size panel:",i)}new ResizeObserver(i=>{if(s.panel.style.display!=="none")for(let r of i){const{width:p,height:u}=r.contentRect;p>0&&u>0&&m.setDebounced(le,{width:Math.round(p+20),height:Math.round(u+20)},1e3)}}).observe(s.panel),s.panelBody=document.getElementById("vnpt-panel-body"),H(document.getElementById("vnpt-template-manager"),(i,r)=>{s.templateBuffer=i,s.templateName=r}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const i=this.files&&this.files[0];if(!i)return;const r=document.getElementById("vnpt-template-manager");Ze(i,r,(p,u)=>{s.templateBuffer=p,s.templateName=u}),this.value=""}),s.toggleBtn.addEventListener("click",i=>{s.hasDragged||(s.panel.style.display==="none"?(s.panel.style.display="flex",s.toggleBtn.className="btn-opened",s.toggleBtn.innerHTML="✖",m.set(xe,!0)):(s.panel.style.display="none",s.toggleBtn.className="btn-closed",s.toggleBtn.innerHTML="📄",m.set(xe,!1)))});const a=document.getElementById("vnpt-btn-more"),t=document.getElementById("vnpt-util-menu"),c={S:{width:"350px",height:"400px"},M:{width:"440px",height:"600px"},L:{width:"600px",height:"800px"},Full:{width:"98vw",height:"92vh"}};a.addEventListener("click",i=>{i.stopPropagation(),t.classList.toggle("show"),a.classList.toggle("active")}),document.addEventListener("click",()=>{t.classList.remove("show"),a.classList.remove("active")}),t.querySelectorAll(".size-options button").forEach(i=>{i.addEventListener("click",r=>{const p=r.target.getAttribute("data-size"),u=c[p];u&&(s.panel.style.width=u.width,s.panel.style.height=u.height),t.classList.remove("show"),a.classList.remove("active")})}),s.panel.querySelectorAll(".vnpt-resizer").forEach(i=>{i.addEventListener("mousedown",r=>{r.preventDefault(),r.stopPropagation();const p=r.clientX,u=r.clientY,d=s.panel.offsetWidth,x=s.panel.offsetHeight,w=s.widget.getBoundingClientRect(),v=w.top,E=window.innerWidth-w.right,f=g=>{const y=g.clientX-p,C=g.clientY-u;if(i.classList.contains("br"))s.panel.style.width=d+y+"px",s.panel.style.height=x+C+"px";else if(i.classList.contains("bl")){const b=d-y;b>300&&(s.panel.style.width=b+"px",s.widget.style.right=E+y+"px"),s.panel.style.height=x+C+"px"}else if(i.classList.contains("tr")){s.panel.style.width=d+y+"px";const b=x-C;b>150&&(s.panel.style.height=b+"px",s.widget.style.top=v+C+"px")}else if(i.classList.contains("tl")){const b=d-y,k=x-C;b>300&&(s.panel.style.width=b+"px",s.widget.style.right=E+y+"px"),k>150&&(s.panel.style.height=k+"px",s.widget.style.top=v+C+"px")}},h=()=>{window.removeEventListener("mousemove",f),window.removeEventListener("mouseup",h);const g=s.widget.id==="vnpt-docx-widget";m.setDebounced(Y,{right:g?s.widget.style.right:void 0,top:s.widget.style.top,x:g?void 0:parseFloat(s.widget.style.left),y:parseFloat(s.widget.style.top)},1e3)};window.addEventListener("mousemove",f),window.addEventListener("mouseup",h)})})}function Re(e,n,o,a=null,t=null){let c=!1,l=0,i=0,r=!1;function p(d){r!==d&&(r=d,t&&t(d))}function u(d){if(d.button!==0)return;c=!0,s.hasDragged=!1;const x=e.getBoundingClientRect();l=d.clientX-x.left,i=d.clientY-x.top,document.body.style.userSelect="none",n&&n.forEach(w=>w.style.cursor="grabbing"),a&&a(),d.preventDefault()}return n.forEach(d=>{d.addEventListener("mousedown",u)}),document.addEventListener("mousemove",function(d){if(!c)return;s.hasDragged=!0;let x=d.clientX-l,w=d.clientY-i;const v=window.innerWidth,E=window.innerHeight,f=document.getElementById("vnpt-toggle-btn"),h=f?f.offsetWidth:40,g=f?f.offsetHeight:40,y=e.id==="vnpt-docx-widget";let C=e.offsetWidth||0;if(y){let N=h+6-C,S=v-C+6;x<N&&(x=N),x>S&&(x=S)}else C=C||200,x<0&&(x=0),x+C>v&&(x=Math.max(0,v-C));let b=r;if(y?b=!1:r?d.clientY<E-40&&(b=!1):d.clientY>E-10&&(b=!0),w<0&&(w=0),b)p(!0),e.style.top=E-e.offsetHeight+"px",y?(e.style.right=v-x-C+"px",e.style.left="auto"):(e.style.left=x+"px",e.style.right="auto"),e.style.bottom="auto";else{p(!1);let k=e.offsetHeight||40,N;if(y)N=10+g;else{const S=e.querySelector(".cw-title-bar");N=S?S.offsetHeight:k}w+N>E&&(w=Math.max(0,E-N)),e.style.top=w+"px",y?(e.style.right=v-x-C+"px",e.style.left="auto"):(e.style.left=x+"px",e.style.right="auto"),e.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(c&&(c=!1,document.body.style.userSelect="",n&&n.forEach(d=>d.style.cursor="grab"),o)){const d=e.id==="vnpt-docx-widget";m.set(o,{left:d?void 0:e.style.left,right:d?e.style.right:void 0,top:e.style.top,x:d?void 0:parseFloat(e.style.left),y:parseFloat(e.style.top),docked:r})}}),{isDocked:()=>r,setDocked:p}}function ht(){s.widget&&s.header&&s.toggleBtn&&(Re(s.widget,[s.header,s.toggleBtn],Y),window.addEventListener("resize",()=>{const e=window.innerWidth,n=window.innerHeight,o=document.getElementById("vnpt-toggle-btn"),a=o?o.offsetWidth:40,t=o?o.offsetHeight:40;let c=s.widget.getBoundingClientRect(),l=c.left,i=c.top,r=s.widget.offsetWidth||0,u=a+6-r,d=e-r+6;l<u&&(l=u),l>d&&(l=d),i+10+t>n&&(i=Math.max(0,n-(10+t))),s.widget.style.right=e-l-r+"px",s.widget.style.top=i+"px"}))}function Fe(e){const n=e.toLowerCase(),{ngay:o,thang:a,nam:t}=De();return{ngayky:o,thangky:a,thangky1:a,namky:t,namky1:t,soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[n]||""}function bt(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){if(s.isDefaultMode){Object.keys(V).forEach(n=>{B(n,V[n],L[n]||"")}),D(),T("Đã nạp lại dữ liệu mặc định từ hệ thống.");return}let e=0;Object.keys(L).forEach(n=>{var t;const o=document.getElementById(n);let a="";o&&(a=o.tagName.toLowerCase()==="select"?((t=o.options[o.selectedIndex])==null?void 0:t.text)||"":o.value,e++),a||(a=Fe(n)),B(n,a,null)}),D(),e>0?(this.style.background="#1e8e3e",this.style.color="#fff",this.innerText="Đã quét xong",setTimeout(()=>{this.style.background="",this.style.color="",this.innerText="Quét dữ liệu"},1e3)):T("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(e){e.target.closest("#vnpt-docx-widget")||e.target.closest("#vnpt-inline-calc")||e.target&&e.target.id&&L[e.target.id]!==void 0&&(B(e.target.id,e.target.value,null),D())}),document.addEventListener("change",function(e){var n;if(!(e.target.closest("#vnpt-docx-widget")||e.target.closest("#vnpt-inline-calc"))&&e.target&&e.target.id&&L[e.target.id]!==void 0){let o=e.target.tagName.toLowerCase()==="select"?((n=e.target.options[e.target.selectedIndex])==null?void 0:n.text)||"":e.target.value;B(e.target.id,o,null),D()}})}const vt={local:{download(e,n="arraybuffer"){return new Promise((o,a)=>{const t=new FileReader;switch(t.onload=c=>{let l=c.target.result;n==="base64"&&typeof l=="string"&&(l=l.split(",")[1]||l),o(l)},t.onerror=c=>a(c),n.toLowerCase()){case"arraybuffer":t.readAsArrayBuffer(e);break;case"base64":case"dataurl":t.readAsDataURL(e);break;case"text":t.readAsText(e);break;default:a(new Error(`Unsupported read type: ${n}`))}})},async upload(e){return this.download(e,"base64")}}},xt={getAdapter(e){const n=vt[e];if(!n)throw new Error(`Storage adapter not found: ${e}`);return n},async upload(e,n,o={}){return await this.getAdapter(e).upload(n,o)},async download(e,n,o={}){return await this.getAdapter(e).download(n,o.type||"arraybuffer")}};function Pe(e,n,o){try{let a;try{a=new window.PizZip(e)}catch(r){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(r);return}const t=new window.docxtemplater(a,{paragraphLoop:!0,linebreaks:!0});t.render(n);const c=t.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),l=URL.createObjectURL(c),i=document.createElement("a");i.href=l,i.download=o,document.body.appendChild(i),i.click(),setTimeout(()=>{document.body.removeChild(i),URL.revokeObjectURL(l)},100)}catch(a){let t=a.message;a.properties&&a.properties.errors instanceof Array?t=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+a.properties.errors.map(l=>"- "+(l.properties.explanation||l.message)).join(`
`):t="Lỗi phần mềm Word sinh ra: "+t,alert(t),console.error("DocX Error:",a)}}function yt(){const e=document.getElementById("vnpt-export-filename");e&&e.addEventListener("input",()=>{e.dataset.userEdited="1",e.value.trim()||(e.dataset.userEdited="0")});function n(){if(!e||e.dataset.userEdited==="1")return;let o="";if(s.fieldsContainer&&s.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(r=>{const u=r.querySelector(".f-key").value.trim().split(",")[0].trim(),d=r.querySelector(".f-val").value.trim();u==="tenToChuc"&&(o=d)}),!o){const i=document.getElementById("tenToChuc");i&&(o=i.tagName.toLowerCase()==="textarea"||i.tagName.toLowerCase()==="input"?i.value.trim():i.innerText.trim())}function a(i){if(!i)return"";let r=i;return r=r.replace(/Tổng công ty/gi,""),r=r.replace(/Công ty/gi,""),r=r.replace(/\bCty\b/gi,""),r=r.replace(/Trách nhiệm hữu hạn/gi,""),r=r.replace(/\bTNHH\b/gi,""),r=r.replace(/Cổ phần/gi,""),r=r.replace(/\bCP\b/gi,""),r=r.replace(/Một thành viên/gi,""),r=r.replace(/\bMTV\b/gi,""),r=r.replace(/Chi nhánh/gi,""),r=r.replace(/Việt Nam/gi,"VN"),r=r.replace(/Viet Nam/gi,"VN"),r=r.replace(/\s+/g," ").trim(),r=r.replace(/^[-,\s]+|[-,\s]+$/g,""),r.length>50&&(r=r.substring(0,47)+"..."),r.replace(/[<>:"/\\|?*]/g,"")}let t=a(o),c=s.templateName?s.templateName.replace(/\.docx$/i,""):"",l=[];c&&l.push(c),t&&l.push(t),l.length>0?e.value=l.join(" - ")+".docx":e.value||(e.value="Export_Auto.docx")}setInterval(n,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const o={};if(s.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(i=>{const p=i.querySelector(".f-key").value.trim().split(",")[0].trim(),u=i.querySelector(".f-val").value;p&&(o[p]=u)}),Object.keys(o).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}const t=[];if(Be.forEach(i=>{if(!o[i]||!o[i].trim()){const r=L[i]||i;t.push(r)}}),t.length>0){const i=`Cảnh báo: Bạn còn các trường sau chưa điền dữ liệu:

- ${t.join(`
- `)}

Bạn có chắc chắn muốn tiếp tục xuất file không?`;if(!confirm(i))return}let c=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(c.toLowerCase().endsWith(".docx")||(c+=".docx"),s.templateBuffer){Pe(s.templateBuffer,o,c);return}const l=document.getElementById("vnpt-template-file");if(l.files&&l.files.length>0){xt.download("local",l.files[0],{type:"arraybuffer"}).then(i=>Pe(i,o,c)).catch(i=>alert(`Lỗi đọc file: ${i.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')})}const wt=["chucVu","noiCap","noiCapSoDkdn","ngayky","thangky","namky","thangky1","namky1","noiKy"],Et=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function Ct(){function e(){wt.forEach(a=>{const t=document.getElementById(a);t&&!t.dataset.filled&&(t.dataset.filled="1",ne(t,Fe(a)))}),Et.forEach(a=>{const t=document.getElementById(a.src),c=document.getElementById(a.target);t&&c&&!t.dataset.bound&&(t.dataset.bound="1",t.addEventListener("input",()=>ne(c,t.value)))})}let n;new MutationObserver(()=>{clearTimeout(n),n=setTimeout(e,200)}).observe(document.body,{childList:!0,subtree:!0}),e()}function G(e,n=null){return m.get(e,n)}function oe(e,n){m.set(e,n)}function Ke(e,n){if(!n||n.replace(/\D/g,"").length<6)return;let o=G(e,[]);o=o.filter(a=>a!==n),o.unshift(n),oe(e,o.slice(0,10))}function ge(e,n){const o=document.getElementById(n);o&&(o.innerHTML=G(e,[]).map(a=>`<option value="${a}">`).join(""))}function Se(e){return e.toLocaleString("en-US")}function ke(e){return Number(String(e).replace(/[^\d]/g,""))||0}function Tt(e){return e.charAt(0).toUpperCase()+e.slice(1)}const ae=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function St(e){let n=Math.floor(e/100),o=Math.floor(e%100/10),a=e%10,t="";return n>0&&(t+=ae[n]+" trăm ",o===0&&a>0&&(t+="lẻ ")),o>1?(t+=ae[o]+" mươi ",a===1?t+="mốt":a===5?t+="lăm":a>0&&(t+=ae[a])):o===1?(t+="mười ",a===5?t+="lăm":a>0&&(t+=ae[a])):a>0&&(n>0&&(t+="lẻ "),t+=ae[a]),t.trim()}function kt(e){if(e===0)return"không";const n=["","nghìn","triệu","tỷ"];let o="",a=0;for(;e>0;){const t=e%1e3;t>0&&(o=St(t)+" "+n[a]+" "+o),e=Math.floor(e/1e3),a++}return o.trim()}function Ve(e,n,o){let a=0,t=0,c=0;e==="before"?(a=ke(n),t=Math.round(a*o),c=a+t):e==="tax"?(t=ke(n),a=Math.round(t/o),c=a+t):e==="after"&&(c=ke(n),a=Math.round(c/(1+o)),t=c-a);const l=Tt(kt(c))+" đồng";return{beforeNum:a,taxNum:t,afterNum:c,beforeStr:Se(a),taxStr:Se(t),afterStr:Se(c),textStr:l}}function Nt(e,n){n.before&&n.before.forEach(o=>K(o,e.beforeStr)),n.tax&&n.tax.forEach(o=>K(o,e.taxStr)),n.after&&n.after.forEach(o=>K(o,e.afterStr)),n.text&&n.text.forEach(o=>K(o,e.textStr))}function me(e,n=null){try{const o=localStorage.getItem(e);return o!==null?JSON.parse(o):n}catch{return n}}function A(e,n){localStorage.setItem(e,JSON.stringify(n))}function Lt(e,n,o,a){let t=me(Z)??"custom",c=me(j)??{...V},l=me($)??{},i=me(R)??{};const r=document.createElement("div");r.className="cw-tab-header";const p={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};p.custom.innerText="📋 Custom",p.custom.className="cw-tab cw-tab-custom",p.default.innerText="📌 Default",p.default.className="cw-tab cw-tab-default",p.sync.innerText="🔗 Sync",p.sync.className="cw-tab cw-tab-sync";function u(){Object.values(p).forEach(b=>b.classList.remove("active")),p[t].classList.add("active")}u();const d=document.createElement("div");d.style.display=a.data?"none":"block";const x=n("📋 Cấu hình Data","data",b=>{d.style.display=b?"none":"block",o(e)}),w=document.createElement("div");w.className="cw-data-body";function v(){w.innerHTML="";let b=t==="sync"?i:t==="custom"?l:c,k=t==="sync"?R:t==="custom"?$:j;const N=Object.keys(b);N.length===0&&t!=="default"&&(w.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),N.forEach(S=>{const W=document.createElement("div");W.className="cw-data-row";let he=t!=="default";const z=b[S],be=z&&typeof z=="object"&&z.hasOwnProperty("value"),qe=be?z.value:z,Le=be&&z.label||S,_=document.createElement("input");_.type="text",_.value=Le,_.className="cw-data-key"+(he?" mutable":""),_.title=S,_.readOnly=!he,he&&(_.onchange=()=>{const I=_.value.trim();if(!I||I===S){_.value=Le;return}be?b[I]={...z,label:I}:b[I]=qe,delete b[S],A(k,b),v()});const q=document.createElement("input");if(q.type="text",q.value=qe??"",q.className="cw-data-val",q.oninput=()=>{be?b[S]={...z,value:q.value}:b[S]=q.value,A(k,b)},W.appendChild(_),W.appendChild(q),he){const I=document.createElement("button");I.innerHTML="✕",I.className="cw-del-btn",I.onclick=()=>{confirm(`Delete "${Le}"?`)&&(delete b[S],A(k,b),v())},W.appendChild(I)}else W.appendChild(document.createElement("div")).className="cw-pad";w.appendChild(W)})}p.custom.onclick=()=>{t="custom",A(Z,"custom"),u(),v()},p.default.onclick=()=>{t="default",A(Z,"default"),u(),v()},p.sync.onclick=()=>{t="sync",A(Z,"sync"),u(),v()};const E=document.createElement("button");E.innerText="📤",E.className="cw-icon-btn",E.onclick=()=>{const b=new Blob([JSON.stringify({defaultData:c,customData:l,syncData:i},null,2)],{type:"application/json"}),k=URL.createObjectURL(b),N=document.createElement("a");N.href=k,N.download=`vnpt_data_${Date.now()}.json`,N.click(),URL.revokeObjectURL(k)},d.appendChild(r),r.appendChild(p.custom),r.appendChild(p.default),r.appendChild(p.sync),d.appendChild(w),e.appendChild(x),e.appendChild(d);const f=e.querySelector("#vnpt-cw-fill"),h=e.querySelector("#vnpt-cw-sync"),g=e.querySelector("#vnpt-cw-add"),y=e.querySelector("#vnpt-cw-reset");f&&(f.onclick=He),h&&(h.onclick=st),g&&(g.onclick=()=>{t==="default"&&(t="custom",A(Z,"custom"),u());let b=t==="sync"?i:l,k="new_field_"+Date.now();b[k]="",A(t==="sync"?R:$,b),v(),w.scrollTop=w.scrollHeight}),y&&(y.onclick=()=>{confirm("Reset Default Data?")&&(c={...V},A(j,c),v())}),v();const C=x.querySelector(".cw-right-wrap")||document.createElement("div");C.className="cw-right-wrap",C.prepend(E),x.appendChild(C)}function Bt(e,n,o){let a=Number(localStorage.getItem(Q))||lt,t=G(se)??{calc:!1,data:!0},c=G(J)??{...rt};function l(f,h){const g=document.createElement("button");return g.innerText=f,g.className="cw-action-btn "+h,g}function i(f,h,g){const y=document.createElement("div");y.className="wg-sec-header";const C=document.createElement("span");C.innerText=f;const b=document.createElement("button");return b.className="wg-toggle-btn",b.innerText=t[h]?"▾":"▴",y.appendChild(C),y.appendChild(b),b.onclick=()=>{t[h]=!t[h],b.innerText=t[h]?"▾":"▴",oe(se,t),g(t[h])},y}function r(f){const h=window.innerWidth,g=window.innerHeight,y=f.getBoundingClientRect();f.style.left=Math.min(Math.max(parseFloat(f.style.left),0),h-y.width)+"px",f.style.top=Math.min(Math.max(parseFloat(f.style.top),0),g-36)+"px"}const p=document.createElement("div");if(!n){p.className="cw-title-bar",p.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const f=document.createElement("div");f.className="cw-btn-group";const h={fill:l("Fill","cw-btn-fill"),sync:l("Sync","cw-btn-sync"),add:l("Add","cw-btn-add"),reset:l("↺","cw-btn-reset")};h.reset.title="Reset Default fields",Object.values(h).forEach(g=>f.appendChild(g)),p.appendChild(f),e.appendChild(p)}const u=document.createElement("div");u.className="cw-body-inline",u.innerHTML=`
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
                <div class="cw-row"><span class="cw-map-label">Trước thuế</span><input data-clink="before" class="cw-map-input"></div>
                <div class="cw-row"><span class="cw-map-label">Tiền thuế</span><input data-clink="tax" class="cw-map-input"></div>
                <div class="cw-row"><span class="cw-map-label">Sau thuế</span><input data-clink="after" class="cw-map-input"></div>
                <div class="cw-row"><span class="cw-map-label">Bằng chữ</span><input data-clink="text" class="cw-map-input"></div>                
                <div class="cw-map-separator"></div>
                <div class="cw-map-actions">
                    <button class="vnpt-btn-action btn-reset-default" id="vnpt-btn-reset-default" title="Khôi phục dữ liệu gốc">Reset Default</button>
                    <button class="vnpt-btn-action btn-import" id="vnpt-btn-import" title="Nhập cấu hình JSON">📥 Nhập JSON</button>
                    <button class="vnpt-btn-action btn-export-json" id="vnpt-btn-export-json" title="Xuất cấu hình JSON">📤 Xuất JSON</button>
                </div>
            </div>
        </div>
    </div>`,n?n.appendChild(u):e.appendChild(u),n||Lt(e,i,r,t);const d={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text"),mapBtn:document.getElementById("wg-calc-map-btn"),mapWrap:document.getElementById("wg-calc-map-wrap")};d.taxRate.value=a*100,ge(ye,"wg-before-list"),ge(we,"wg-after-list");function x(f,h){const g=Ve(f,h,a);d.before.value=g.beforeStr,d.tax.value=g.taxStr,d.after.value=g.afterStr,d.text.value=g.textStr,Nt(g,c)}d.taxRate.oninput=()=>{a=Number(d.taxRate.value)/100||0,oe(Q,a),x("before",d.before.value)},d.before.oninput=()=>{const f=Ve("before",d.before.value,a);d.tax.value=f.taxStr,d.after.value=f.afterStr,d.text.value=f.textStr},d.before.onchange=()=>{x("before",d.before.value),Ke(ye,d.before.value),ge(ye,"wg-before-list")},d.tax.oninput=()=>x("tax",d.tax.value),d.after.oninput=()=>x("after",d.after.value),d.after.onchange=()=>{x("after",d.after.value),Ke(we,d.after.value),ge(we,"wg-after-list")},[d.before,d.tax,d.after,d.text].forEach(f=>{["click","focus"].forEach(h=>f.addEventListener(h,()=>{if(!f.value)return;navigator.clipboard.writeText(f.value);const g=f.style.backgroundColor;f.style.backgroundColor="#d1e7dd",setTimeout(()=>f.style.backgroundColor=g,300)}))}),d.mapBtn.onclick=()=>{const f=d.mapWrap.style.display==="flex";if(d.mapWrap.style.display=f?"none":"flex",!f){const h=g=>{!d.mapWrap.contains(g.target)&&g.target!==d.mapBtn&&(d.mapWrap.style.display="none",document.removeEventListener("click",h))};setTimeout(()=>document.addEventListener("click",h),0)}},e.querySelectorAll("input[data-clink]").forEach(f=>{const h=f.dataset.clink;f.value=(c[h]||[]).join(", "),f.oninput=()=>{c[h]=f.value.split(",").map(g=>g.trim()).filter(g=>g),oe(J,c)}});const w=document.getElementById("vnpt-btn-import"),v=document.getElementById("vnpt-btn-export-json"),E=document.getElementById("vnpt-btn-reset-default");if(w&&(w.onclick=f=>{gt(),d.mapWrap.style.display="none"}),v&&(v.onclick=f=>{ft(),d.mapWrap.style.display="none"}),E&&(E.onclick,E.addEventListener("click",()=>{d.mapWrap.style.display="none"})),!n){const f=Array.from(e.children).filter(y=>y!==p),h=Re(e,[p],o,null,y=>{f.forEach(C=>C.style.display=y?"none":""),p.style.borderRadius=y?"8px":"0",y&&(e.style.top=window.innerHeight-(p.offsetHeight||34)+"px")}),g=G(o);return g&&g.docked&&h.setDocked(!0),window.addEventListener("resize",()=>{h.isDocked()?e.style.top=window.innerHeight-p.offsetHeight+"px":r(e)}),h}return null}function Dt(){const e=document.getElementById("vnpt-inline-calc"),n=document.getElementById("vnpt-btn-calc-toggle");let o=s.calcWidget||document.createElement("div");if(!e&&!s.calcWidget?(o.id="vnpt-calc-widget",document.body.appendChild(o),s.calcWidget=o):e&&(o=s.widget),e&&n){let a=G(se)??{calc:!1,data:!0};const t=c=>{e.style.display=c?"none":"block",n.classList.toggle("active",!c)};t(a.calc),n.onclick=()=>{a.calc=!a.calc,oe(se,a),t(a.calc)}}return Bt(o,e,$e)}let ie=null;function Ne(){if(!window.__vnptInited){window.__vnptInited=!0,U.info("Initializing VNPT Userscript...");try{Ue(),mt(),Dt(),ht(),ut(),Te(),bt(),yt(),Ct(),pt();const e=Oe(()=>{tt(),U.debug("DOM Cache cleared due to mutations")},500);ie=new MutationObserver(n=>{n.some(o=>o.addedNodes.length>0||o.removedNodes.length>0)&&e()}),ie.observe(document.body,{childList:!0,subtree:!0}),U.info("Userscript initialized successfully.")}catch(e){U.error("Error during userscript initialization:",e)}}}function It(){U.info("Cleaning up VNPT Userscript for reload..."),ie&&(ie.disconnect(),ie=null);const e=document.getElementById("vnpt-docx-widget");e&&e.remove();const n=document.getElementById("vnpt-calc-widget");n&&n.remove();const o=document.getElementById("vnpt-styles");o&&o.remove(),window.__vnptInited=!1,U.info("Cleanup completed.")}window.__vnptCleanup=It,window.__vnptInit=Ne,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Ne):Ne()})();
