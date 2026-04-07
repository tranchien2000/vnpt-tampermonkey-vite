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
(function(){"use strict";const j={info:(...e)=>console.log("[Tampermonkey Script] INFO:",...e),error:(...e)=>console.error("[Tampermonkey Script] ERROR:",...e),warn:(...e)=>console.warn("[Tampermonkey Script] WARN:",...e)};function qe(){const e="vnpt-styles";if(document.getElementById(e))return;const n=document.createElement("style");n.id=e,n.textContent=`
        /* ═══════════════════════════════════════════
           SECTION 1: WIDGET CONTAINER & TOGGLE BTN
           ═══════════════════════════════════════════ */
        /* Khối Widget tổng hợp bọc toàn bộ, đây sẽ là khối duy chuyển */
        #vnpt-docx-widget { position: fixed; top: 100px; right: 50px; z-index: 999999; font-family: 'Segoe UI', Tahoma, Verdana, sans-serif;}

        /* Nút khi panel ĐÓNG */
        #vnpt-toggle-btn.btn-closed { 
            position: absolute; right: 10px; top: 10px;
            width: 27px; height: 27px; font-size: 13px; border-radius: 5px;
            background-color: #1a73e8; color: white; border: none; 
            cursor: pointer; display: flex; align-items: center; justify-content: center; 
            box-shadow: 0 2px 5px rgba(0,0,0,0.3); transition: all 0.2s; z-index: 10;
        }
        #vnpt-toggle-btn.btn-closed:hover { transform: scale(1.05); background-color: #1557b0; }

        /* Nút khi panel MỞ (Đồng bộ vị trí/size với nút đóng) */
        #vnpt-toggle-btn.btn-opened {
            position: absolute; right: 10px; top: 10px;
            width: 27px; height: 27px; font-size: 13px; border-radius: 5px;
            background-color: #d32f2f; color: white; border: none;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3); transition: all 0.2s; z-index: 10;
        }
        #vnpt-toggle-btn.btn-opened:hover { transform: scale(1.05); background-color: #b71c1c; }

        /* ═══════════════════════════════════════════
           SECTION 2: EXPORT PANEL LAYOUT & HEADER
           ═══════════════════════════════════════════ */
        /* Bảng điều khiển */
        #vnpt-export-panel { 
            position: relative; 
            width: 440px; min-width: 350px; 
            height: auto; min-height: 200px;
            max-height: 92vh; max-width: 98vw;
            display: flex; flex-direction: column; 
            background: #ffffff; border: 1px solid #dadce0; 
            border-radius: 10px; padding: 10px; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.25); 
            transition: none; 
        }
        
        
        #vnpt-panel-body { display: flex; flex-direction: column; overflow: auto; flex: 1; margin-top: 5px; }

        /* Header vùng kéo thả */
        #vnpt-panel-header { 
            margin: 0 -10px 0 -10px; padding: 0 10px 5px 10px;
            color: #1a73e8; font-size: 14px; 
            border-bottom: 2px solid #f1f3f4; 
            cursor: move; user-select: none; 
            display: flex; align-items: center; justify-content: space-between; 
            font-weight: bold;
        }
        #vnpt-panel-header:hover { background: #f8f9fa; border-radius: 4px; }
        .drag-icon { font-size: 14px; cursor: move; opacity: 0.6; }

        /* ═══════════════════════════════════════════
           SECTION 3: FIELDS CONTAINER & FIELD ROWS
           ═══════════════════════════════════════════ */
        /* Box chứa danh sách biến */
        #vnpt-fields-container { flex: 1; max-height: unset; overflow: hidden; background: #f8f9fa; border: 1px solid #dadce0; border-radius: 6px; margin-bottom: 4px; position: relative; display: flex; flex-direction: column; }
        #vnpt-fields-list { flex: 1; overflow-y: auto; padding: 4px; }

        /* Fields Table Header */
        .vnpt-fields-header {
            display: flex; gap: 2px; padding: 4px;
            background: #e8f0fe; border-bottom: 1px solid #dadce0;
            font-size: 9px; font-weight: bold; color: #1a73e8;
            align-items: center; text-transform: uppercase;
        }
        .vnpt-fields-header span { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .vnpt-fields-header .h-chk { flex: 0 0 20px; text-align: center; }
        .vnpt-fields-header .h-label { flex: 0.35; padding-left: 5px; }
        .vnpt-fields-header .h-key { flex: 0.45; display: none; padding-left: 5px; }
        .show-ids .vnpt-fields-header .h-key { display: block; }
        .vnpt-fields-header .h-drag { flex: 0 0 15px; }
        .vnpt-fields-header .h-val { flex: 1; padding-left: 5px; }
        
        /* Banner thông báo chế độ Dữ liệu mặc định - Tông Đỏ thông báo */
        .vnpt-default-banner {
            background: #ea4335; color: #fff;
            padding: 4px 8px; font-size: 11px; font-weight: bold;
            text-align: center; border-radius: 4px; margin-bottom: 5px;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            animation: slideDown 0.3s ease-out;
            box-shadow: 0 2px 4px rgba(234, 67, 53, 0.3);
        }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        
        /* Chế độ Default (High Alert) */
        #vnpt-fields-container.vnpt-mode-default {
            border: 2px solid #ea4335 !important;
            box-shadow: inset 0 0 8px rgba(234, 67, 53, 0.15);
            background-color: #fffafb;
        }

        .vnpt-field-row { display: flex; gap: 2px; margin-bottom: 2px; align-items: center; padding: 0 2px; }
        .row-drag-handle { cursor: grab; padding: 0; font-size: 16px; font-weight: bold; color: #aaa; user-select: none; flex: 0 0 15px; text-align: center; }
        .row-drag-handle:active { cursor: grabbing; }
        .vnpt-field-row.dragging { opacity: 0.4; }
        .vnpt-field-row.over { background-color: #e3f2fd; border-radius: 4px; }
        .vnpt-field-row input { flex: 1; padding: 5px; border: 1px solid #ccc; border-radius: 4px; font-size: 11px; }
        .vnpt-field-row input.row-chk { flex: 0 0 20px; width: 14px; height: 14px; margin: 0; padding: 0; cursor: pointer; }
        .vnpt-field-row input.f-label { flex: 0.35; color: #0056b3; font-weight: bold;}
        .vnpt-field-row input.f-key { display: none; flex: 0.45; font-weight: bold; color: #d63384;}
        .show-ids .vnpt-field-row input.f-key { display: block; }
        .vnpt-btn-hide { background: #f0f0f0; border: 1px solid #ccc; border-radius: 4px; font-size: 10px; cursor: pointer; padding: 3px 6px; }
        .vnpt-btn-hide:hover { background: #e0e0e0; }
        .vnpt-btn-del { background: #fee; color: #d32f2f; border: 1px solid #fcc; padding: 3px 6px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 10px;}
        .vnpt-btn-del:hover { background: #fcc; }

        .vnpt-control-group { margin-bottom: 10px; }
        .vnpt-control-group label { display: block; font-weight: 600; font-size: 12px; color: #444; margin-bottom: 4px; }
        .vnpt-control-group input[type="file"], .vnpt-control-group input[type="text"] { width: 100%; box-sizing: border-box; padding: 6px; border: 1px solid #ccc; border-radius: 5px; font-size: 12px;}

        /* ═══════════════════════════════════════════
           SECTION 4: CONTROL BUTTONS
           ═══════════════════════════════════════════ */
        .btn-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .vnpt-btn-action { border: none; padding: 0 8px; height: 27px; min-width: 27px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; cursor: pointer; border-radius: 5px; transition: background 0.2s; white-space: nowrap; box-sizing: border-box; }

        .btn-scan { background: #11ff00ff; color: #000; } .btn-scan:hover { background: #f2a500; }
        .btn-toggle-id { background: #ee0feeff; color: #ffffffff; } .btn-toggle-id:hover { background: #d2e3fc; }
        .btn-default-toggle { background: #ea4335; color: #ffffffff; font-size: 14px; border: 1px solid transparent; } 
        .btn-default-toggle:hover { background: #ceead6; }
        .btn-reset-default { background: #e53d3dff; color: #1a73e8; border: 1px solid #d2e3fc; font-size: 14px; }
        .btn-reset-default:hover { background: #d2e3fc; }
        .btn-add { background: #f1f3f4; color: #3c4043; } .btn-add:hover { background: #e8eaed; }
        .btn-fill-back { background: #ab47bc; color: #fff; } .btn-fill-back:hover { background: #8e24aa; }
        .btn-clean { background: #ea4335; color: #fff; } .btn-clean:hover { background: #d93025; }
        .btn-export { background: #1a73e8; color: white; padding: 4px 10px; font-size: 11px; font-weight: bold;} .btn-export:hover { background: #1557b0; }
        .btn-size { background: #f8f9fa; color: #3c4043; border: 1px solid #dadce0 !important; }
        .btn-size:hover { background: #e8eaed; }

        /* Size Dropdown & Menu */
        .vnpt-size-dropdown { position: relative; }
        .vnpt-size-menu {
            position: absolute; top: calc(100% + 5px); left: 0;
            background: #fff; border: 1px solid #dadce0; border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.15); z-index: 100000;
            display: none; flex-direction: column; min-width: 60px;
            overflow: hidden; animation: fadeIn 0.15s ease-out;
        }
        .vnpt-size-menu.show { display: flex; }
        .vnpt-size-menu button {
            background: none; border: none; padding: 8px 14px;
            text-align: center; font-size: 11px; cursor: pointer;
            color: #3c4043; font-weight: 600; transition: all 0.2s;
            border-bottom: 1px solid #f1f3f4;
        }
        .vnpt-size-menu button:last-child { border-bottom: none; }
        .vnpt-size-menu button:hover { background: #e8f0fe; color: #1a73e8; }

        /* 4 Corner Resizers */
        .vnpt-resizer {
            position: absolute;
            width: 14px;
            height: 14px;
            z-index: 10000;
            /* background: rgba(26, 115, 232, 0.1); /* Để debug, có thể bỏ */
        }
        .vnpt-resizer.tl { top: -2px; left: -2px; cursor: nwse-resize; }
        .vnpt-resizer.tr { top: -2px; right: -2px; cursor: nesw-resize; }
        .vnpt-resizer.bl { bottom: -2px; left: -2px; cursor: nesw-resize; }
        .vnpt-resizer.br { bottom: -2px; right: -2px; cursor: nwse-resize; }

        .vnpt-resizer:hover {
            background: rgba(26, 115, 232, 0.4);
            border-radius: 4px;
        }

        /* Popup Default Data - Removed */

        /* ═══════════════════════════════════════════
           SECTION 5: TEMPLATE MANAGER
           ═══════════════════════════════════════════ */
        #vnpt-template-section { border-top: 1px solid #e0e0e0; margin-top: 4px; padding-top: 6px; }
        
        .bottom-export-row { display: flex; gap: 4px; align-items: center; border-top: 1px solid #eee; margin-top: 4px; padding-top: 6px; }
        .bottom-export-row .vnpt-control-group { margin-bottom: 0; flex: 1; min-width: 0; }
        .bottom-export-row .vnpt-control-group input[type="file"] { width: 145px; }
        .bottom-export-row .vnpt-control-group input { padding: 4px; font-size: 11px; }
        .bottom-export-row .btn-export { flex: 0 0 auto; height: 26px; margin: 0; border-radius: 5px; }

        .text-hint { font-size: 11px; color: #666; font-style: italic; text-align: center; margin-bottom: 5px;}

        #vnpt-fields-container::-webkit-scrollbar { width: 5px; }
        #vnpt-fields-container::-webkit-scrollbar-thumb { background-color: #bbb; border-radius: 10px; }

        /* ═══════════════════════════════════════════
           SECTION 6: INLINE CALC (Premium Layout)
           ═══════════════════════════════════════════ */
        #vnpt-inline-calc { 
            background: #f1f3f4; 
            padding: 5px 8px; 
            border-bottom: 1px solid #dadce0;
            display: block; /* Mặc định hiện, sẽ được toggle bằng JS */
        }
        .cw-body-inline { display: flex; flex-direction: column; gap: 4px; }
        .cw-inline-row { 
            display: flex; align-items: center; gap: 4px; width: 100%; box-sizing: border-box; 
            flex-wrap: wrap; /* Cho phép rớt dòng nếu quá hẹp */
        }
        .cw-input-inline { 
            flex: 1; min-width: 60px; padding: 4px 6px; border: 1px solid #ced4da; border-radius: 4px; 
            font-size: 11px; font-weight: 500; height: 26px; box-sizing: border-box;
            background: #fff; transition: background 0.2s;
        }
        .cw-input-inline:focus { border-color: #1a73e8; outline: none; box-shadow: 0 0 0 2px rgba(26,115,232,0.1); }
        .cw-input-readonly-inline { background-color: #f8f9fa; color: #1e8e3e; cursor: default; flex: 1.5; min-width: 100px; }
        
        .cw-tax-group-inline { position: relative; display: flex; align-items: center; flex: 0 0 auto; min-width: 45px; }
        .cw-tax-input-inline { width: 45px; padding: 4px 18px 4px 4px; border: 1px solid #ced4da; border-radius: 4px; font-size: 11px; text-align: right; height: 26px; box-sizing: border-box;}
        .cw-tax-symbol { position: absolute; right: 4px; color: #666; font-size: 10px; pointer-events: none; }

        .cw-map-dropdown-container { position: relative; flex-shrink: 0; }
        .cw-map-btn-inline { background: #e8f0fe; border: 1px solid #d2e3fc; border-radius: 4px; cursor: pointer; height: 26px; width: 26px; display: flex; align-items: center; justify-content: center; font-size: 12px; transition: all 0.2s; }
        .cw-map-btn-inline:hover { background: #d2e3fc; }

        /* Style cho nút toggle trên header */
        .btn-calc-toggle { background: #e8f0fe; color: #1a73e8; }
        .btn-calc-toggle:hover { background: #d2e3fc; }
        .btn-calc-toggle.active { background: #1a73e8; color: #fff; }
        
        .cw-map-wrap-popup { 
            position: absolute; right: 0; top: 30px; z-index: 1000;
            background: white; border: 1px solid #dadce0; border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); width: 240px;
            padding: 10px; display: flex; flex-direction: column; gap: 6px;
            animation: fadeIn 0.2s;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        
        .cw-row { display: flex; align-items: center; gap: 6px; justify-content: space-between; }
        .cw-map-label { font-size: 11px; font-weight: 600; color: #555; white-space: nowrap; }
        .cw-map-input { flex: 1; padding: 4px; border: 1px solid #ccc; border-radius: 4px; font-size: 10px; width: 140px; }
        .cw-map-hint { font-size: 9px; color: #888; margin-top: 4px; line-height: 1.2; text-align: center; }

        .cw-map-separator { height: 1px; background: #eee; margin: 4px 0; }
        
        .cw-map-actions { display: flex; flex-direction: column; gap: 4px; }
        .cw-map-actions .vnpt-btn-action { 
            justify-content: flex-start; width: 100%; padding: 0 10px; 
            background: transparent; color: #3c4043; border-radius: 6px;
        }
        .cw-map-actions .vnpt-btn-action:hover { background: #f1f3f4; }
        .cw-map-actions .btn-reset-default { color: #d32f2f; }
        .cw-map-actions .btn-reset-default:hover { background: #fff5f5; }

        .btn-more.active { background: #dadce0; }

    `,document.head.appendChild(n)}const je={widget:null,panel:null,header:null,bannerArea:null,toggleBtn:null,fieldsContainer:null,panelBody:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1,templateBuffer:null,templateName:null,hasDragged:!1},X=new Map,s=new Proxy(je,{get(e,n){return n==="on"?(o,i)=>{X.has(o)||X.set(o,[]),X.get(o).push(i)}:e[n]},set(e,n,o){const i=e[n];return e[n]=o,i!==o&&X.has(n)&&X.get(n).forEach(t=>t(o,i)),!0}}),L={tenDaiDienn:"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT",emailDaiDien:"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Số GPKD | MST",goiDV:"Gói Dịch Vụ",ngayKy:"Ngày ký",thangKy:"Tháng Ký",namKy:"Năm ký",soHopDong:"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký"},re="vnpt_docx_fields",ve="vnpt_docx_default_fields",Y="vnpt_docx_position",le="vnpt_docx_size",ye="vnpt_docx_opened",U="vnpt_autofill_data_default",$="vnpt_autofill_data_custom",R="vnpt_autofill_data_sync",Ue="vnpt_widget_pos",J="vnd_tax_rate",xe="vnd_before_history",we="vnd_after_history",se="vnpt_widget_collapsed",Q="vnd_calc_map",Z="vnpt_widget_datatab",ce="vnpt_templates";let z=null;function T(e,n="#198754",o=2500){z||(z=document.createElement("div"),z.id="vnpt-toast-container",Object.assign(z.style,{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column-reverse",alignItems:"center",gap:"8px",zIndex:"1000000",pointerEvents:"none"}),document.body.appendChild(z));const i=document.createElement("div");i.innerText=e,Object.assign(i.style,{background:n,color:"#fff",padding:"8px 18px",borderRadius:"24px",opacity:"0",transform:"translateY(10px)",transition:"opacity 0.3s, transform 0.3s",fontSize:"13px",fontWeight:"500",fontFamily:"'Segoe UI', Roboto, sans-serif",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",whiteSpace:"nowrap",pointerEvents:"auto"}),z.appendChild(i),requestAnimationFrame(()=>{i.style.opacity="1",i.style.transform="translateY(0)"}),setTimeout(()=>{i.style.opacity="0",i.style.transform="translateY(-10px)",setTimeout(()=>{i.remove(),z&&z.childNodes.length},300)},o)}const $e="vnpt_templates_db",M="buffers";let de=null;function Ee(){return de?Promise.resolve(de):new Promise((e,n)=>{const o=indexedDB.open($e,1);o.onupgradeneeded=i=>{const t=i.target.result;t.objectStoreNames.contains(M)||t.createObjectStore(M)},o.onsuccess=i=>{de=i.target.result,e(de)},o.onerror=()=>n(o.error)})}async function Ge(e,n){const o=await Ee();return new Promise((i,t)=>{const r=o.transaction(M,"readwrite").objectStore(M).put(n,e);r.onsuccess=()=>i(),r.onerror=()=>t(r.error)})}async function We(e){const n=await Ee();return new Promise((o,i)=>{const l=n.transaction(M,"readonly").objectStore(M).get(e);l.onsuccess=()=>o(l.result),l.onerror=()=>i(l.error)})}async function Xe(e){const n=await Ee();return new Promise((o,i)=>{const l=n.transaction(M,"readwrite").objectStore(M).delete(e);l.onsuccess=()=>o(),l.onerror=()=>i(l.error)})}const F=new Map,pe=new Map,h={isGM:typeof GM_setValue<"u"&&typeof GM_getValue<"u",get(e,n=null){if(F.has(e))return F.get(e);try{let o;if(this.isGM?o=GM_getValue(e,null):o=localStorage.getItem(e),o==null)return n;const i=typeof o=="string"?JSON.parse(o):o;return F.set(e,i),i}catch(o){return console.warn(`[Storage] Không thể đọc key "${e}":`,o),n}},set(e,n){F.set(e,n);try{return this.isGM?GM_setValue(e,n):localStorage.setItem(e,JSON.stringify(n)),!0}catch(o){return console.error(`[Storage] Không thể ghi key "${e}":`,o),!1}},setDebounced(e,n,o=500){F.set(e,n),pe.has(e)&&clearTimeout(pe.get(e));const i=setTimeout(()=>{this.set(e,n),pe.delete(e)},o);pe.set(e,i)},remove(e){F.delete(e);try{this.isGM?GM_deleteValue(e):localStorage.removeItem(e)}catch(n){console.error(`[Storage] Không thể xóa key "${e}":`,n)}},clearCache(){F.clear()}};function ee(){try{const e=h.get(ce)||[],n=e.filter(o=>o.type!=="local");return n.length!==e.length&&te(n),n}catch{return[]}}function te(e){h.set(ce,e)}function Ye(e){const n=e.match(/drive\.google\.com\/file\/d\/([^/]+)/);return n?`https://drive.google.com/uc?export=download&id=${n[1]}`:e}function Je(e){return new Promise((n,o)=>{GM_xmlhttpRequest({method:"GET",url:Ye(e),responseType:"arraybuffer",onload:i=>{if(i.status>=200&&i.status<300){if(i.response&&i.response.byteLength>4){const t=new Uint8Array(i.response.slice(0,4));if(t[0]===80&&t[1]===75&&t[2]===3&&t[3]===4){n(i.response);return}else{o(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}n(i.response)}else o(new Error(`HTTP ${i.status}: Không lấy được file`))},onerror:()=>o(new Error("Không thể tải URL.")),ontimeout:()=>o(new Error("Timeout khi tải URL."))})})}async function Qe(e,n,o){const i=e.name.replace(/\.docx$/i,""),t=prompt("Đặt tên biến nhớ cho file này:",i);if(!(!t||!t.trim()))try{const c=await e.arrayBuffer();await Ge(t.trim(),c);const r=ee().filter(a=>a.name!==t.trim()&&a.fileName!==e.name);r.unshift({name:t.trim(),type:"local_idb",fileName:e.name,lastUsed:Date.now()}),te(r),O(n,o),o&&o(c,t.trim())}catch(c){T(`❌ Lỗi lưu file: ${c.message}`,"#dc3545")}}function O(e,n,o=null){let i=e.querySelector(".vnpt-template-manager-inner"),t,c;if(i)t=i.querySelector(".vnpt-local-list-container"),c=i.querySelector(".vnpt-btn-wrap");else{e.innerHTML="",i=document.createElement("div"),i.className="vnpt-template-manager-inner";const a=document.createElement("div");a.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const p=document.createElement("span");p.className="vnpt-title-main",p.style.cssText="font-size:11px;font-weight:700;color:#444;",c=document.createElement("div"),c.className="vnpt-btn-wrap",c.style.cssText="display:flex;gap:4px;",a.appendChild(p),a.appendChild(c),i.appendChild(a),t=document.createElement("div"),t.className="vnpt-local-list-container",t.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",i.appendChild(t),e.appendChild(i)}const l=ee(),r=i.querySelector(".vnpt-title-main");r.innerHTML="Templates"+(o?` <span style="color:#2e7d32;">(Đang dùng: ${o})</span>`:""),l.length===0?t.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':t.innerHTML="",l.forEach((a,p)=>{const u=document.createElement("div");u.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",u.title=a.fileName||a.url||a.name,u.tabIndex=0,u.onfocus=()=>u.style.boxShadow="0 0 0 2px #28a745",u.onblur=()=>u.style.boxShadow="none";const d=a.type==="local"||a.type==="local_base64"||a.type==="local_idb"?"OFF":"ON",y=d==="OFF"?"#6c757d":"#28a745",b=document.createElement("span");b.textContent=d,b.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${y};color:#fff;`;const E=document.createElement("span");E.textContent=a.name,E.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",u.onclick=()=>{u.focus(),Ze(a,n,o,e)},u.appendChild(b),u.appendChild(E);const x=document.createElement("button");x.innerHTML="✎",x.title="Đổi tên template",x.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",x.onclick=v=>{v.stopPropagation();const g=prompt("Đổi tên template:",a.name);if(g&&g.trim()&&g.trim()!==a.name){const w=ee();w[p].name=g.trim(),te(w),O(e,n,o)}},u.appendChild(x);const f=document.createElement("button");f.innerHTML="✕",f.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",f.onclick=async v=>{if(v.stopPropagation(),confirm(`Xoá biểu mẫu "${a.name}"?`)){const g=ee();g.splice(p,1),te(g),a.type==="local_idb"&&await Xe(a.name).catch(()=>null),O(e,n,o===a.name?null:o)}},u.appendChild(f),t.appendChild(u)})}function Ze(e,n,o,i){const t=ee(),c=t.find(l=>l.name===e.name&&(l.url===e.url||l.type===e.type));if(c&&(c.lastUsed=Date.now(),te(t)),e.type==="local_idb"){We(e.name).then(l=>{if(!l)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");n&&n(l,e.name),O(i,n,e.name)}).catch(l=>{T(`❌ Lỗi nạp File IDB: ${l.message}`,"#dc3545")});return}if(e.type==="local_base64"&&e.data){try{const l=window.atob(e.data.split(",")[1]),r=l.length,a=new Uint8Array(r);for(let p=0;p<r;p++)a[p]=l.charCodeAt(p);n&&n(a.buffer,e.name),O(i,n,e.name)}catch(l){T(`❌ Lỗi nạp Base64: ${l.message}`,"#dc3545")}return}Je(e.url).then(l=>{n&&n(l,e.name),O(i,n,e.name)}).catch(l=>{T(`❌ ${l.message}`,"#dc3545")})}const P=new Map;function et(){P.clear()}function tt(e){e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function ne(e,n){var t;const o=e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,i=(t=Object.getOwnPropertyDescriptor(o,"value"))==null?void 0:t.set;i?i.call(e,n):e.value=n,tt(e)}function ue(e){if(!e)return null;const n=P.get(e);if(n&&document.contains(n))return n;const o=document.getElementById(e);if(o&&(o.tagName==="INPUT"||o.tagName==="TEXTAREA"))return P.set(e,o),o;const i=`input[id="${e}"], textarea[id="${e}"], input[name="${e}"], textarea[name="${e}"], input[formcontrolname="${e}"], textarea[formcontrolname="${e}"], input[placeholder="${e}"], textarea[placeholder="${e}"]`,t=document.querySelector(i);if(t)return P.set(e,t),t;for(const c of document.querySelectorAll("label"))if(c.textContent.trim()===e){let l=null;if(c.htmlFor&&(l=document.getElementById(c.htmlFor)),!l){let r=c.parentElement;for(;r;){const a=r.querySelector("input,textarea");if(a){l=a;break}if(r=r.parentElement,(r==null?void 0:r.tagName)==="FORM")break}}if(l)return P.set(e,l),l}return null}function fe(e){if(!e)return null;const n=P.get(`lbl:${e}`);if(n&&document.contains(n))return n;for(const o of document.querySelectorAll("label"))if(o.innerText.trim()===e){const i=o.parentElement.querySelector("input, textarea");if(i)return P.set(`lbl:${e}`,i),i}return null}function K(e,n){const o=ue(e)||fe(e);o&&ne(o,n)}function nt(e=new Date){return String(e.getDate()).padStart(2,"0")}function ot(e=new Date){return String(e.getMonth()+1).padStart(2,"0")}function it(e=new Date){return String(e.getFullYear())}function Le(){const e=new Date;return{ngay:nt(e),thang:ot(e),nam:it(e)}}const{ngay:De,thang:Ie,nam:Ae}=Le(),V={ngayKy:{label:"Ngày ký",value:De},"thangKy, thangKy1":{label:"Tháng ký",value:Ie},"namKy, namKy1":{label:"Năm ký",value:Ae},"ngayTiepNhan, ngayThangNamKy":{label:"Ngày ký (full)",value:`${De}/${Ie}/${Ae}`},tenDoanhNghiepB:{label:"Tên doanh nghiệp B",value:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM"},diaChiB:{label:"Địa chỉ B",value:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội"},maSoThueB:{label:"Mã số thuế B",value:"0100686223"},stkB:{label:"Số tài khoản B",value:"1600114156"},diaChiStkB:{label:"Ngân hàng/Địa chỉ STK B",value:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)"},"tenB, nguoiDaiDienB":{label:"Người đại diện B",value:"Phạm Khánh Chung"},"chucVuB, chucVuDaiDienB":{label:"Chức vụ B",value:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp"},"giayUyQuyenSoB, soGiayUyQuyenB":{label:"Giấy ủy quyền số B",value:"2628/GUQ-VNPT-HNI-VP"},"giayUyQuyenNgayB, ngayGiayUyQuyenB":{label:"Giấy ủy quyền ngày B",value:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},GiayUyQuyenB:{label:"Giấy ủy quyền B (full)",value:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},tenDoanhNghiepB1:{label:"Tên doanh nghiệp B (phụ)",value:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},donViTiepNhan:{label:"Đơn vị tiếp nhận",value:"TTKD KHDN"},"tenTiepNhan, tenNguoiNhan":{label:"Người tiếp nhận",value:"Bùi Anh"},dienThoaiB:{label:"Điện thoại B",value:"02436686868"},diaChiTaiKhoanB:{label:"Địa chỉ tài khoản B",value:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 "},noiKy:{label:"Nơi ký",value:"Hà Nội"},emailB:{label:"Email B",value:""},"lienheHopDongB, lienheTuVanB, lienheHoaDonB, sucoCap1B, sucoCap2B, sucoCap3B, sucoCap4B":{label:"Liên hệ B (AM)",value:"AM Bùi Anh"}},_e={soHopDong:"inputContractGroupName, contractName"},at={after:["cuocDV","tongCong","tongCongHD","congCA","giaTriHopDong","tongGIaTriHopDong"],before:["donGiaCA","thanhTienCA","tongThanhTien","tongCuocTruocThue"],tax:["tongThueGTGT","tongThue","thueCA","thueVAT"],text:["soTienThanhToanBangChu","tongCongBangChu","tongCongHDbangChu","ghiChuGiaTriHopDong","tongGiaTriHopDongBangChu"]},rt=.08;function ze(e,n){let o;return function(...t){const c=()=>{clearTimeout(o),e(...t)};clearTimeout(o),o=setTimeout(c,n)}}function Me(){const e=h.get(U)??{...V},n=h.get($)??{},o={...e,...n};Object.keys(o).forEach(i=>{const t=o[i],c=t&&typeof t=="object"&&t.hasOwnProperty("value")?t.value:t;i.split(",").map(r=>r.trim()).filter(r=>r).forEach(r=>{let a=ue(r)||fe(r);a&&ne(a,c)})}),T("✅ Auto fill complete")}function lt(){let e=h.get(R)??{};const n={..._e,...e},o=Object.keys(n);if(o.length===0){T("⚠️ No sync mapping","#ffc107");return}o.forEach(i=>{let t=ue(i)||fe(i);t&&t.value!==void 0&&t.value!==""&&n[i].split(",").map(l=>l.trim()).filter(l=>l).forEach(l=>K(l,t.value))}),T("✅ Sync form complete","#d39e00")}let Ce=!1;const st=(e,n)=>{var a;if(Ce)return;let o=h.get(R)??{};const i={..._e,...o};if(Object.keys(i).length===0)return;let t=e.id,c=e.name,l=null;if(t){const p=document.querySelector(`label[for="${t}"]`);p&&(l=p.textContent.trim())}if(!l){const p=e.closest("label");p&&(l=(a=Array.from(p.childNodes).find(u=>u.nodeType===3))==null?void 0:a.textContent.trim())}let r=i[t]||i[c]||i[l];if(r){Ce=!0;try{r.split(",").map(u=>u.trim()).filter(u=>u).forEach(u=>{if(u!==t&&u!==c&&u!==l){const d=ue(u)||fe(u);d&&document.activeElement!==d&&ne(d,n)}})}finally{Ce=!1}}},ct=ze((e,n)=>{st(e,n)},250);function dt(){document.addEventListener("input",e=>{const n=e.target;!n||!["INPUT","TEXTAREA"].includes(n.tagName)||n.closest("#vnpt-docx-widget")||n.closest("#vnpt-inline-calc")||ct(n,n.value)})}function B(e,n,o=null,i=""){const t=s.fieldsContainer.querySelector(".text-hint");t&&t.remove();const c=s.fieldsContainer.querySelectorAll(".f-key");let l=!1;for(let r of c)if(r.value.split(",")[0].trim()===e){const p=r.closest(".vnpt-field-row"),u=p.querySelector(".f-val"),d=p.querySelector(".f-label");n!==""&&u.value!==n&&document.activeElement!==u&&(u.value=n),o!==null&&o!==""&&d.value!==o&&document.activeElement!==d&&(d.value=o),i!==""&&r.value!==e+", "+i&&document.activeElement!==r&&(r.value=e+", "+i),l=!0;break}if(!l){(o===null||o==="")&&(o=L[e]||"");const r=document.createElement("div");r.className="vnpt-field-row row-item",r.setAttribute("draggable","false");let a=e;i&&(a+=", "+i),r.innerHTML=`
            <input type="checkbox" class="row-chk" title="Chọn" style="margin: 0 2px 0 2px;" />
            <input type="text" class="f-label" value="${o}" />
            <input type="text" class="f-key" value="${a}" title="Biến DOCX và IDs đồng bộ" />
            <span class="row-drag-handle" title="Kéo">=</span>
            <input type="text" class="f-val" value="${n}" />
        `;const p=r.querySelector(".f-val"),u=r.querySelector(".f-key");e==="tenToChuc"&&(p.style.textAlign="right");const d=()=>{const b=p.value;u.value.split(",").map(x=>x.trim()).filter(x=>x).forEach(x=>K(x,b))};u.addEventListener("input",function(){D();const b=this.value.split(",")[0].trim();p.style.textAlign=b==="tenToChuc"?"right":"",d()}),r.querySelector(".f-label").addEventListener("input",D),p.addEventListener("input",function(){D(),d()});const y=r.querySelector(".row-drag-handle");y.addEventListener("mouseenter",()=>r.setAttribute("draggable","true")),y.addEventListener("mouseleave",()=>{r.classList.contains("dragging")||r.setAttribute("draggable","false")}),r.addEventListener("dragstart",function(b){s.draggedRowForVNPT=this,b.dataTransfer.effectAllowed="move",b.dataTransfer.setData("text/plain",e),this.classList.add("dragging")}),r.addEventListener("dragover",b=>(b.preventDefault(),!1)),r.addEventListener("dragenter",function(){this.classList.add("over")}),r.addEventListener("dragleave",function(){this.classList.remove("over")}),r.addEventListener("drop",function(b){if(b.stopPropagation(),s.draggedRowForVNPT&&s.draggedRowForVNPT!==this){const E=Array.from(s.fieldsContainer.querySelectorAll(".vnpt-field-row")),x=E.indexOf(s.draggedRowForVNPT),f=E.indexOf(this);x<f?this.parentNode.insertBefore(s.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(s.draggedRowForVNPT,this),D()}return!1}),r.addEventListener("dragend",function(){this.setAttribute("draggable","false"),s.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(b=>{b.classList.remove("over","dragging")}),s.draggedRowForVNPT=null}),s.fieldsContainer.appendChild(r),s.fieldsContainer.scrollTop=s.fieldsContainer.scrollHeight}}function D(){const e=s.isDefaultMode?ve:re,n={};s.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(i=>{const c=i.querySelector(".f-key").value.trim().split(",").map(u=>u.trim()).filter(u=>u),l=c[0],r=c.slice(1).join(", "),a=i.querySelector(".f-label").value.trim(),p=i.querySelector(".f-val").value;l&&(n[l]={label:a,value:p,sync:r})}),h.setDebounced(e,n,1e3)}function Te(){try{s.fieldsContainer.innerHTML="";const n=h.get(re)||{};Object.keys(L).forEach(o=>{const i=L[o],t=n[o];t&&typeof t=="object"?B(o,t.value,t.label||i,t.sync||""):t?B(o,t,i,""):B(o,"",i,"")}),Object.keys(n).forEach(o=>{if(!(o in L)){const i=n[o];typeof i=="object"?B(o,i.value,i.label,i.sync||""):B(o,i,"","")}}),Object.keys(L).length===0&&Object.keys(n).length===0&&(s.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(n){console.error("Error loading config:",n),Object.keys(L).forEach(o=>B(o,"",L[o]))}const e=h.get(Y);e&&s.widget&&(s.widget.style.bottom="auto",e.right?(s.widget.style.right=e.right,s.widget.style.left="auto"):e.left&&(s.widget.style.left=e.left,s.widget.style.right="auto"),e.top&&(s.widget.style.top=e.top))}function pt(){document.getElementById("vnpt-btn-toggle-id").onclick=()=>s.fieldsContainer.classList.toggle("show-ids"),document.getElementById("vnpt-btn-default").onclick=()=>{s.isDefaultMode=!s.isDefaultMode},s.on("isDefaultMode",e=>Oe(e)),document.getElementById("vnpt-btn-reset-default").onclick=()=>{confirm("Khôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?")&&(h.remove(ve),h.remove(Q),h.remove(J),s.isDefaultMode&&(Oe(!0),T("🔄 Đã khôi phục dữ liệu gốc","#1a73e8")))},document.getElementById("vnpt-btn-batch-del").onclick=()=>{const e=s.fieldsContainer.querySelectorAll(".vnpt-field-row");let n=0;e.forEach(o=>{var i;(i=o.querySelector(".row-chk"))!=null&&i.checked&&(o.remove(),n++)}),n===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(e.forEach(o=>o.remove()),T("🗑️ Đã xóa toàn bộ","#ff5252"),D()):(T(`🗑️ Đã xóa ${n} trường`,"#ff5252"),D())},document.getElementById("vnpt-btn-add").onclick=()=>{const e=s.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;B("bien_moi_"+e,"","",""),D()},document.getElementById("vnpt-btn-fill-back").onclick=()=>{Me();let e=0;s.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(n=>{const o=n.querySelector(".f-key").value.trim(),i=n.querySelector(".f-val").value;o.split(",").map(t=>t.trim()).filter(Boolean).forEach(t=>{(document.getElementById(t)||document.getElementsByName(t)[0])&&(K(t,i),e++)})}),e>0?T(`✅ Đã điền ngược ${e} trường`,"#198754"):T("⚠️ Không khớp trường nào","#ffc107")}}function Oe(e){const n=document.getElementById("vnpt-btn-default"),o=document.getElementById("vnpt-btn-reset-default");if(s.fieldsContainer.innerHTML="",s.bannerArea.innerHTML="",e){n.classList.add("active"),o&&(o.style.display="flex"),s.fieldsContainer.classList.add("vnpt-mode-default"),T("📌 Chế độ Dữ liệu mặc định (Có thể sửa)","#ea4335");const i=document.createElement("div");i.className="vnpt-default-banner",i.innerHTML="<span> Lưu ý: đây là Dữ liệu mặc định (Có thể sửa/lưu)</span>",s.bannerArea.appendChild(i);const t=h.get(ve);t===null?Object.keys(V).forEach(c=>{const l=V[c],r=l&&typeof l=="object"?l.value:l,a=l&&typeof l=="object"?l.label:L[c]||"";B(c,r,a)}):Object.keys(t).forEach(c=>{const l=t[c];B(c,l.value,l.label,l.sync||"")})}else n.classList.remove("active"),o&&(o.style.display="none"),s.fieldsContainer.classList.remove("vnpt-mode-default"),T("📋 Đã quay lại Dữ liệu cá nhân"),Te()}function ut(){const e={version:"1.0",timestamp:Date.now(),fields:h.get(re)||{},templates:h.get(ce)||[],position:h.get(Y)||null,size:h.get(le)||null,calc:{default:h.get(U)||null,custom:h.get($)||null,sync:h.get(R)||null,map:h.get(Q)||{},taxRate:Number(h.get(J))||.08}},n=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),o=URL.createObjectURL(n),i=document.createElement("a");i.href=o,i.download=`vnpt_config_${new Date().toISOString().slice(0,10)}.json`,i.click(),URL.revokeObjectURL(o),T("📤 Đã xuất cấu hình JSON")}function ft(){const e=document.createElement("input");e.type="file",e.accept=".json",e.onchange=async n=>{const o=n.target.files[0];if(o)try{const i=await o.text(),t=JSON.parse(i);if(!t.fields&&!t.calc)throw new Error("Định dạng file không hợp lệ!");t.fields&&h.set(re,t.fields),t.templates&&h.set(ce,t.templates),t.position&&h.set(Y,t.position),t.size&&h.set(le,t.size),t.calc&&(t.calc.default&&h.set(U,t.calc.default),t.calc.custom&&h.set($,t.calc.custom),t.calc.sync&&h.set(R,t.calc.sync),t.calc.map&&h.set(Q,t.calc.map),t.calc.taxRate!==void 0&&h.set(J,t.calc.taxRate)),await Te();const c=document.getElementById("vnpt-calc-widget");if(c){const r=document.getElementById("wg-taxRate");r&&t.calc&&t.calc.taxRate!==void 0&&(r.value=t.calc.taxRate*100),t.calc&&t.calc.map&&c.querySelectorAll("input[data-clink]").forEach(a=>{const p=a.dataset.clink;t.calc.map[p]&&(a.value=(t.calc.map[p]||[]).join(", "))})}const l=document.getElementById("vnpt-template-manager");l&&O(l,(r,a)=>{AppState.templateBuffer=r,AppState.templateName=a}),t.position&&AppState.widget&&(t.position.right?(AppState.widget.style.right=t.position.right,AppState.widget.style.left="auto"):t.position.left&&(AppState.widget.style.left=t.position.left,AppState.widget.style.right="auto"),t.position.top&&(AppState.widget.style.top=t.position.top),AppState.widget.style.bottom="auto"),t.size&&AppState.panel&&(AppState.panel.style.width=t.size.width+"px",AppState.panel.style.height=t.size.height+"px"),T("✅ Nhập cấu hình thành công!")}catch(i){console.error("Lỗi Import:",i),alert("Lỗi: "+i.message)}},e.click()}function gt(){const e=document.getElementById("vnpt-docx-widget")||document.createElement("div");e.id="vnpt-docx-widget";const n=h.get(ye)===!0;e.innerHTML=`
        <button id="vnpt-toggle-btn" title="Mở/Đóng UI Hợp đồng" class="${n?"btn-opened":"btn-closed"}">${n?"✖":"📄"}</button>

        <div id="vnpt-export-panel" style="display: ${n?"flex":"none"};">
            <!-- 4 Corner Resizers -->
            <div class="vnpt-resizer tl"></div>
            <div class="vnpt-resizer tr"></div>
            <div class="vnpt-resizer bl"></div>
            <div class="vnpt-resizer br"></div>

            <div id="vnpt-panel-header" title="Kẹp chuột vào đây để di chuyển">
                <span id="vnpt-panel-title">VNPT PRO</span>
                <div class="btn-row" style="margin-bottom: 0; padding-right: 35px; gap: 4px; position: relative;">
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-scan" title="Lấy data theo biểu mẫu web">Scan</button>
                    <button class="vnpt-btn-action btn-fill-back" id="vnpt-btn-fill-back" title="Điền dữ liệu ngược lên web">Điền thông tin</button>
                    
                    <button class="vnpt-btn-action btn-default-toggle" id="vnpt-btn-default" title="Dữ liệu mặc định VNPT">Default</button>
                    <div class="vnpt-size-dropdown">
                        <button class="vnpt-btn-action btn-size" id="vnpt-btn-size" title="Thay đổi kích thước">Size ▾</button>
                        <div class="vnpt-size-menu" id="vnpt-size-menu">
                            <button data-size="S">S</button>
                            <button data-size="M">M</button>
                            <button data-size="L">L</button>
                            <button data-size="Full">Full</button>
                        </div>
                    </div>
                    <button class="vnpt-btn-action btn-toggle-id" id="vnpt-btn-toggle-id" title="Ẩn/Hiện Mã ID">Nhập code</button>
                    <button class="vnpt-btn-action btn-add" id="vnpt-btn-add" title="Chèn thêm trường trống">➕</button>
                    <button class="vnpt-btn-action btn-clean" id="vnpt-btn-batch-del" title="Xóa chọn / Xóa tất cả">🗑️</button>
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
    `,document.body.appendChild(e),s.widget=e,s.panel=document.getElementById("vnpt-export-panel"),s.toggleBtn=document.getElementById("vnpt-toggle-btn"),s.header=document.getElementById("vnpt-panel-header"),s.bannerArea=document.getElementById("vnpt-banner-area"),s.fieldsContainer=document.getElementById("vnpt-fields-list");try{const r=h.get(le);r&&r.width&&r.height&&(s.panel.style.width=r.width+"px",s.panel.style.height=r.height+"px")}catch(r){console.error("Lỗi load size panel:",r)}new ResizeObserver(r=>{if(s.panel.style.display!=="none")for(let a of r){const{width:p,height:u}=a.contentRect;p>0&&u>0&&h.setDebounced(le,{width:Math.round(p+20),height:Math.round(u+20)},1e3)}}).observe(s.panel),s.panelBody=document.getElementById("vnpt-panel-body"),O(document.getElementById("vnpt-template-manager"),(r,a)=>{s.templateBuffer=r,s.templateName=a}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const r=this.files&&this.files[0];if(!r)return;const a=document.getElementById("vnpt-template-manager");Qe(r,a,(p,u)=>{s.templateBuffer=p,s.templateName=u}),this.value=""}),s.toggleBtn.addEventListener("click",r=>{s.hasDragged||(s.panel.style.display==="none"?(s.panel.style.display="flex",s.toggleBtn.className="btn-opened",s.toggleBtn.innerHTML="✖",h.set(ye,!0)):(s.panel.style.display="none",s.toggleBtn.className="btn-closed",s.toggleBtn.innerHTML="📄",h.set(ye,!1)))});const i=document.getElementById("vnpt-btn-size"),t=document.getElementById("vnpt-size-menu"),c={S:{width:"350px",height:"400px"},M:{width:"440px",height:"600px"},L:{width:"600px",height:"800px"},Full:{width:"98vw",height:"92vh"}};i.addEventListener("click",r=>{r.stopPropagation(),t.classList.toggle("show")}),document.addEventListener("click",()=>t.classList.remove("show")),t.querySelectorAll("button").forEach(r=>{r.addEventListener("click",a=>{const p=a.target.getAttribute("data-size"),u=c[p];u&&(s.panel.style.width=u.width,s.panel.style.height=u.height),t.classList.remove("show")})}),s.panel.querySelectorAll(".vnpt-resizer").forEach(r=>{r.addEventListener("mousedown",a=>{a.preventDefault(),a.stopPropagation();const p=a.clientX,u=a.clientY,d=s.panel.offsetWidth,y=s.panel.offsetHeight,b=s.widget.getBoundingClientRect(),E=b.top,x=window.innerWidth-b.right,f=g=>{const w=g.clientX-p,C=g.clientY-u;if(r.classList.contains("br"))s.panel.style.width=d+w+"px",s.panel.style.height=y+C+"px";else if(r.classList.contains("bl")){const m=d-w;m>300&&(s.panel.style.width=m+"px",s.widget.style.right=x+w+"px"),s.panel.style.height=y+C+"px"}else if(r.classList.contains("tr")){s.panel.style.width=d+w+"px";const m=y-C;m>150&&(s.panel.style.height=m+"px",s.widget.style.top=E+C+"px")}else if(r.classList.contains("tl")){const m=d-w,k=y-C;m>300&&(s.panel.style.width=m+"px",s.widget.style.right=x+w+"px"),k>150&&(s.panel.style.height=k+"px",s.widget.style.top=E+C+"px")}},v=()=>{window.removeEventListener("mousemove",f),window.removeEventListener("mouseup",v);const g=s.widget.id==="vnpt-docx-widget";h.setDebounced(Y,{right:g?s.widget.style.right:void 0,top:s.widget.style.top,x:g?void 0:parseFloat(s.widget.style.left),y:parseFloat(s.widget.style.top)},1e3)};window.addEventListener("mousemove",f),window.addEventListener("mouseup",v)})})}function He(e,n,o,i=null,t=null){let c=!1,l=0,r=0,a=!1;function p(d){a!==d&&(a=d,t&&t(d))}function u(d){if(d.button!==0)return;c=!0,s.hasDragged=!1;const y=e.getBoundingClientRect();l=d.clientX-y.left,r=d.clientY-y.top,document.body.style.userSelect="none",n&&n.forEach(b=>b.style.cursor="grabbing"),i&&i(),d.preventDefault()}return n.forEach(d=>{d.addEventListener("mousedown",u)}),document.addEventListener("mousemove",function(d){if(!c)return;s.hasDragged=!0;let y=d.clientX-l,b=d.clientY-r;const E=window.innerWidth,x=window.innerHeight,f=document.getElementById("vnpt-toggle-btn"),v=f?f.offsetWidth:40,g=f?f.offsetHeight:40,w=e.id==="vnpt-docx-widget";let C=e.offsetWidth||0;if(w){let N=v+6-C,S=E-C+6;y<N&&(y=N),y>S&&(y=S)}else C=C||200,y<0&&(y=0),y+C>E&&(y=Math.max(0,E-C));let m=a;if(w?m=!1:a?d.clientY<x-40&&(m=!1):d.clientY>x-10&&(m=!0),b<0&&(b=0),m)p(!0),e.style.top=x-e.offsetHeight+"px",w?(e.style.right=E-y-C+"px",e.style.left="auto"):(e.style.left=y+"px",e.style.right="auto"),e.style.bottom="auto";else{p(!1);let k=e.offsetHeight||40,N;if(w)N=10+g;else{const S=e.querySelector(".cw-title-bar");N=S?S.offsetHeight:k}b+N>x&&(b=Math.max(0,x-N)),e.style.top=b+"px",w?(e.style.right=E-y-C+"px",e.style.left="auto"):(e.style.left=y+"px",e.style.right="auto"),e.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(c&&(c=!1,document.body.style.userSelect="",n&&n.forEach(d=>d.style.cursor="grab"),o)){const d=e.id==="vnpt-docx-widget";h.set(o,{left:d?void 0:e.style.left,right:d?e.style.right:void 0,top:e.style.top,x:d?void 0:parseFloat(e.style.left),y:parseFloat(e.style.top),docked:a})}}),{isDocked:()=>a,setDocked:p}}function ht(){s.widget&&s.header&&s.toggleBtn&&(He(s.widget,[s.header,s.toggleBtn],Y),window.addEventListener("resize",()=>{const e=window.innerWidth,n=window.innerHeight,o=document.getElementById("vnpt-toggle-btn"),i=o?o.offsetWidth:40,t=o?o.offsetHeight:40;let c=s.widget.getBoundingClientRect(),l=c.left,r=c.top,a=s.widget.offsetWidth||0,u=i+6-a,d=e-a+6;l<u&&(l=u),l>d&&(l=d),r+10+t>n&&(r=Math.max(0,n-(10+t))),s.widget.style.right=e-l-a+"px",s.widget.style.top=r+"px"}))}function Re(e){const n=e.toLowerCase(),{ngay:o,thang:i,nam:t}=Le();return{ngayky:o,thangky:i,thangky1:i,namky:t,namky1:t,soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[n]||""}function mt(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){if(s.isDefaultMode){Object.keys(V).forEach(n=>{B(n,V[n],L[n]||"")}),D(),T("Đã nạp lại dữ liệu mặc định từ hệ thống.");return}let e=0;Object.keys(L).forEach(n=>{var t;const o=document.getElementById(n);let i="";o&&(i=o.tagName.toLowerCase()==="select"?((t=o.options[o.selectedIndex])==null?void 0:t.text)||"":o.value,e++),i||(i=Re(n)),B(n,i,null)}),D(),e>0?(this.style.background="#34a853",this.style.color="#fff",this.innerText="Done",setTimeout(()=>{this.style.background="#fbbc04",this.style.color="#000",this.innerText="Quét"},1e3)):T("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(e){e.target.closest("#vnpt-docx-widget")||e.target.closest("#vnpt-inline-calc")||e.target&&e.target.id&&L[e.target.id]!==void 0&&(B(e.target.id,e.target.value,null),D())}),document.addEventListener("change",function(e){var n;if(!(e.target.closest("#vnpt-docx-widget")||e.target.closest("#vnpt-inline-calc"))&&e.target&&e.target.id&&L[e.target.id]!==void 0){let o=e.target.tagName.toLowerCase()==="select"?((n=e.target.options[e.target.selectedIndex])==null?void 0:n.text)||"":e.target.value;B(e.target.id,o,null),D()}})}const bt={local:{download(e,n="arraybuffer"){return new Promise((o,i)=>{const t=new FileReader;switch(t.onload=c=>{let l=c.target.result;n==="base64"&&typeof l=="string"&&(l=l.split(",")[1]||l),o(l)},t.onerror=c=>i(c),n.toLowerCase()){case"arraybuffer":t.readAsArrayBuffer(e);break;case"base64":case"dataurl":t.readAsDataURL(e);break;case"text":t.readAsText(e);break;default:i(new Error(`Unsupported read type: ${n}`))}})},async upload(e){return this.download(e,"base64")}}},vt={getAdapter(e){const n=bt[e];if(!n)throw new Error(`Storage adapter not found: ${e}`);return n},async upload(e,n,o={}){return await this.getAdapter(e).upload(n,o)},async download(e,n,o={}){return await this.getAdapter(e).download(n,o.type||"arraybuffer")}};function Fe(e,n,o){try{let i;try{i=new window.PizZip(e)}catch(a){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(a);return}const t=new window.docxtemplater(i,{paragraphLoop:!0,linebreaks:!0});t.render(n);const c=t.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),l=URL.createObjectURL(c),r=document.createElement("a");r.href=l,r.download=o,document.body.appendChild(r),r.click(),setTimeout(()=>{document.body.removeChild(r),URL.revokeObjectURL(l)},100)}catch(i){let t=i.message;i.properties&&i.properties.errors instanceof Array?t=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+i.properties.errors.map(l=>"- "+(l.properties.explanation||l.message)).join(`
`):t="Lỗi phần mềm Word sinh ra: "+t,alert(t),console.error("DocX Error:",i)}}function yt(){const e=document.getElementById("vnpt-export-filename");e&&e.addEventListener("input",()=>{e.dataset.userEdited="1",e.value.trim()||(e.dataset.userEdited="0")});function n(){if(!e||e.dataset.userEdited==="1")return;let o="";if(s.fieldsContainer&&s.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(a=>{const u=a.querySelector(".f-key").value.trim().split(",")[0].trim(),d=a.querySelector(".f-val").value.trim();u==="tenToChuc"&&(o=d)}),!o){const r=document.getElementById("tenToChuc");r&&(o=r.tagName.toLowerCase()==="textarea"||r.tagName.toLowerCase()==="input"?r.value.trim():r.innerText.trim())}function i(r){if(!r)return"";let a=r;return a=a.replace(/Tổng công ty/gi,""),a=a.replace(/Công ty/gi,""),a=a.replace(/\bCty\b/gi,""),a=a.replace(/Trách nhiệm hữu hạn/gi,""),a=a.replace(/\bTNHH\b/gi,""),a=a.replace(/Cổ phần/gi,""),a=a.replace(/\bCP\b/gi,""),a=a.replace(/Một thành viên/gi,""),a=a.replace(/\bMTV\b/gi,""),a=a.replace(/Chi nhánh/gi,""),a=a.replace(/Việt Nam/gi,"VN"),a=a.replace(/Viet Nam/gi,"VN"),a=a.replace(/\s+/g," ").trim(),a=a.replace(/^[-,\s]+|[-,\s]+$/g,""),a.length>50&&(a=a.substring(0,47)+"..."),a.replace(/[<>:"/\\|?*]/g,"")}let t=i(o),c=s.templateName?s.templateName.replace(/\.docx$/i,""):"",l=[];c&&l.push(c),t&&l.push(t),l.length>0?e.value=l.join(" - ")+".docx":e.value||(e.value="Export_Auto.docx")}setInterval(n,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const o={};if(s.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(l=>{const a=l.querySelector(".f-key").value.trim().split(",")[0].trim(),p=l.querySelector(".f-val").value;a&&(o[a]=p)}),Object.keys(o).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}let t=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(t.toLowerCase().endsWith(".docx")||(t+=".docx"),s.templateBuffer){Fe(s.templateBuffer,o,t);return}const c=document.getElementById("vnpt-template-file");if(c.files&&c.files.length>0){vt.download("local",c.files[0],{type:"arraybuffer"}).then(l=>Fe(l,o,t)).catch(l=>alert(`Lỗi đọc file: ${l.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')})}const xt=["chucVu","noiCap","noiCapSoDkdn","ngayky","thangky","namky","thangky1","namky1","noiKy"],wt=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function Et(){function e(){xt.forEach(i=>{const t=document.getElementById(i);t&&!t.dataset.filled&&(t.dataset.filled="1",ne(t,Re(i)))}),wt.forEach(i=>{const t=document.getElementById(i.src),c=document.getElementById(i.target);t&&c&&!t.dataset.bound&&(t.dataset.bound="1",t.addEventListener("input",()=>ne(c,t.value)))})}let n;new MutationObserver(()=>{clearTimeout(n),n=setTimeout(e,200)}).observe(document.body,{childList:!0,subtree:!0}),e()}function G(e,n=null){return h.get(e,n)}function oe(e,n){h.set(e,n)}function Pe(e,n){if(!n||n.replace(/\D/g,"").length<6)return;let o=G(e,[]);o=o.filter(i=>i!==n),o.unshift(n),oe(e,o.slice(0,10))}function ge(e,n){const o=document.getElementById(n);o&&(o.innerHTML=G(e,[]).map(i=>`<option value="${i}">`).join(""))}function Se(e){return e.toLocaleString("en-US")}function ke(e){return Number(String(e).replace(/[^\d]/g,""))||0}function Ct(e){return e.charAt(0).toUpperCase()+e.slice(1)}const ie=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function Tt(e){let n=Math.floor(e/100),o=Math.floor(e%100/10),i=e%10,t="";return n>0&&(t+=ie[n]+" trăm ",o===0&&i>0&&(t+="lẻ ")),o>1?(t+=ie[o]+" mươi ",i===1?t+="mốt":i===5?t+="lăm":i>0&&(t+=ie[i])):o===1?(t+="mười ",i===5?t+="lăm":i>0&&(t+=ie[i])):i>0&&(n>0&&(t+="lẻ "),t+=ie[i]),t.trim()}function St(e){if(e===0)return"không";const n=["","nghìn","triệu","tỷ"];let o="",i=0;for(;e>0;){const t=e%1e3;t>0&&(o=Tt(t)+" "+n[i]+" "+o),e=Math.floor(e/1e3),i++}return o.trim()}function Ke(e,n,o){let i=0,t=0,c=0;e==="before"?(i=ke(n),t=Math.round(i*o),c=i+t):e==="tax"?(t=ke(n),i=Math.round(t/o),c=i+t):e==="after"&&(c=ke(n),i=Math.round(c/(1+o)),t=c-i);const l=Ct(St(c))+" đồng";return{beforeNum:i,taxNum:t,afterNum:c,beforeStr:Se(i),taxStr:Se(t),afterStr:Se(c),textStr:l}}function kt(e,n){n.before&&n.before.forEach(o=>K(o,e.beforeStr)),n.tax&&n.tax.forEach(o=>K(o,e.taxStr)),n.after&&n.after.forEach(o=>K(o,e.afterStr)),n.text&&n.text.forEach(o=>K(o,e.textStr))}function he(e,n=null){try{const o=localStorage.getItem(e);return o!==null?JSON.parse(o):n}catch{return n}}function A(e,n){localStorage.setItem(e,JSON.stringify(n))}function Nt(e,n,o,i){let t=he(Z)??"custom",c=he(U)??{...V},l=he($)??{},r=he(R)??{};const a=document.createElement("div");a.className="cw-tab-header";const p={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};p.custom.innerText="📋 Custom",p.custom.className="cw-tab cw-tab-custom",p.default.innerText="📌 Default",p.default.className="cw-tab cw-tab-default",p.sync.innerText="🔗 Sync",p.sync.className="cw-tab cw-tab-sync";function u(){Object.values(p).forEach(m=>m.classList.remove("active")),p[t].classList.add("active")}u();const d=document.createElement("div");d.style.display=i.data?"none":"block";const y=n("📋 Cấu hình Data","data",m=>{d.style.display=m?"none":"block",o(e)}),b=document.createElement("div");b.className="cw-data-body";function E(){b.innerHTML="";let m=t==="sync"?r:t==="custom"?l:c,k=t==="sync"?R:t==="custom"?$:U;const N=Object.keys(m);N.length===0&&t!=="default"&&(b.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),N.forEach(S=>{const W=document.createElement("div");W.className="cw-data-row";let me=t!=="default";const H=m[S],be=H&&typeof H=="object"&&H.hasOwnProperty("value"),Ve=be?H.value:H,Be=be&&H.label||S,_=document.createElement("input");_.type="text",_.value=Be,_.className="cw-data-key"+(me?" mutable":""),_.title=S,_.readOnly=!me,me&&(_.onchange=()=>{const I=_.value.trim();if(!I||I===S){_.value=Be;return}be?m[I]={...H,label:I}:m[I]=Ve,delete m[S],A(k,m),E()});const q=document.createElement("input");if(q.type="text",q.value=Ve??"",q.className="cw-data-val",q.oninput=()=>{be?m[S]={...H,value:q.value}:m[S]=q.value,A(k,m)},W.appendChild(_),W.appendChild(q),me){const I=document.createElement("button");I.innerHTML="✕",I.className="cw-del-btn",I.onclick=()=>{confirm(`Delete "${Be}"?`)&&(delete m[S],A(k,m),E())},W.appendChild(I)}else W.appendChild(document.createElement("div")).className="cw-pad";b.appendChild(W)})}p.custom.onclick=()=>{t="custom",A(Z,"custom"),u(),E()},p.default.onclick=()=>{t="default",A(Z,"default"),u(),E()},p.sync.onclick=()=>{t="sync",A(Z,"sync"),u(),E()};const x=document.createElement("button");x.innerText="📤",x.className="cw-icon-btn",x.onclick=()=>{const m=new Blob([JSON.stringify({defaultData:c,customData:l,syncData:r},null,2)],{type:"application/json"}),k=URL.createObjectURL(m),N=document.createElement("a");N.href=k,N.download=`vnpt_data_${Date.now()}.json`,N.click(),URL.revokeObjectURL(k)},d.appendChild(a),a.appendChild(p.custom),a.appendChild(p.default),a.appendChild(p.sync),d.appendChild(b),e.appendChild(y),e.appendChild(d);const f=e.querySelector("#vnpt-cw-fill"),v=e.querySelector("#vnpt-cw-sync"),g=e.querySelector("#vnpt-cw-add"),w=e.querySelector("#vnpt-cw-reset");f&&(f.onclick=Me),v&&(v.onclick=lt),g&&(g.onclick=()=>{t==="default"&&(t="custom",A(Z,"custom"),u());let m=t==="sync"?r:l,k="new_field_"+Date.now();m[k]="",A(t==="sync"?R:$,m),E(),b.scrollTop=b.scrollHeight}),w&&(w.onclick=()=>{confirm("Reset Default Data?")&&(c={...V},A(U,c),E())}),E();const C=y.querySelector(".cw-right-wrap")||document.createElement("div");C.className="cw-right-wrap",C.prepend(x),y.appendChild(C)}function Bt(e,n,o){let i=Number(localStorage.getItem(J))||rt,t=G(se)??{calc:!1,data:!0},c=G(Q)??{...at};function l(f,v){const g=document.createElement("button");return g.innerText=f,g.className="cw-action-btn "+v,g}function r(f,v,g){const w=document.createElement("div");w.className="wg-sec-header";const C=document.createElement("span");C.innerText=f;const m=document.createElement("button");return m.className="wg-toggle-btn",m.innerText=t[v]?"▾":"▴",w.appendChild(C),w.appendChild(m),m.onclick=()=>{t[v]=!t[v],m.innerText=t[v]?"▾":"▴",oe(se,t),g(t[v])},w}function a(f){const v=window.innerWidth,g=window.innerHeight,w=f.getBoundingClientRect();f.style.left=Math.min(Math.max(parseFloat(f.style.left),0),v-w.width)+"px",f.style.top=Math.min(Math.max(parseFloat(f.style.top),0),g-36)+"px"}const p=document.createElement("div");if(!n){p.className="cw-title-bar",p.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const f=document.createElement("div");f.className="cw-btn-group";const v={fill:l("Fill","cw-btn-fill"),sync:l("Sync","cw-btn-sync"),add:l("Add","cw-btn-add"),reset:l("↺","cw-btn-reset")};v.reset.title="Reset Default fields",Object.values(v).forEach(g=>f.appendChild(g)),p.appendChild(f),e.appendChild(p)}const u=document.createElement("div");u.className="cw-body-inline",u.innerHTML=`
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
    </div>`,n?n.appendChild(u):e.appendChild(u),n||Nt(e,r,a,t);const d={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text"),mapBtn:document.getElementById("wg-calc-map-btn"),mapWrap:document.getElementById("wg-calc-map-wrap")};d.taxRate.value=i*100,ge(xe,"wg-before-list"),ge(we,"wg-after-list");function y(f,v){const g=Ke(f,v,i);d.before.value=g.beforeStr,d.tax.value=g.taxStr,d.after.value=g.afterStr,d.text.value=g.textStr,kt(g,c)}d.taxRate.oninput=()=>{i=Number(d.taxRate.value)/100||0,oe(J,i),y("before",d.before.value)},d.before.oninput=()=>{const f=Ke("before",d.before.value,i);d.tax.value=f.taxStr,d.after.value=f.afterStr,d.text.value=f.textStr},d.before.onchange=()=>{y("before",d.before.value),Pe(xe,d.before.value),ge(xe,"wg-before-list")},d.tax.oninput=()=>y("tax",d.tax.value),d.after.oninput=()=>y("after",d.after.value),d.after.onchange=()=>{y("after",d.after.value),Pe(we,d.after.value),ge(we,"wg-after-list")},[d.before,d.tax,d.after,d.text].forEach(f=>{["click","focus"].forEach(v=>f.addEventListener(v,()=>{if(!f.value)return;navigator.clipboard.writeText(f.value);const g=f.style.backgroundColor;f.style.backgroundColor="#d1e7dd",setTimeout(()=>f.style.backgroundColor=g,300)}))}),d.mapBtn.onclick=()=>{const f=d.mapWrap.style.display==="flex";if(d.mapWrap.style.display=f?"none":"flex",!f){const v=g=>{!d.mapWrap.contains(g.target)&&g.target!==d.mapBtn&&(d.mapWrap.style.display="none",document.removeEventListener("click",v))};setTimeout(()=>document.addEventListener("click",v),0)}},e.querySelectorAll("input[data-clink]").forEach(f=>{const v=f.dataset.clink;f.value=(c[v]||[]).join(", "),f.oninput=()=>{c[v]=f.value.split(",").map(g=>g.trim()).filter(g=>g),oe(Q,c)}});const b=document.getElementById("vnpt-btn-import"),E=document.getElementById("vnpt-btn-export-json"),x=document.getElementById("vnpt-btn-reset-default");if(b&&(b.onclick=f=>{ft(),d.mapWrap.style.display="none"}),E&&(E.onclick=f=>{ut(),d.mapWrap.style.display="none"}),x&&(x.onclick,x.addEventListener("click",()=>{d.mapWrap.style.display="none"})),!n){const f=Array.from(e.children).filter(w=>w!==p),v=He(e,[p],o,null,w=>{f.forEach(C=>C.style.display=w?"none":""),p.style.borderRadius=w?"8px":"0",w&&(e.style.top=window.innerHeight-(p.offsetHeight||34)+"px")}),g=G(o);return g&&g.docked&&v.setDocked(!0),window.addEventListener("resize",()=>{v.isDocked()?e.style.top=window.innerHeight-p.offsetHeight+"px":a(e)}),v}return null}function Lt(){const e=document.getElementById("vnpt-inline-calc"),n=document.getElementById("vnpt-btn-calc-toggle");let o=s.calcWidget||document.createElement("div");if(!e&&!s.calcWidget?(o.id="vnpt-calc-widget",document.body.appendChild(o),s.calcWidget=o):e&&(o=s.widget),e&&n){let i=G(se)??{calc:!1,data:!0};const t=c=>{e.style.display=c?"none":"block",n.classList.toggle("active",!c)};t(i.calc),n.onclick=()=>{i.calc=!i.calc,oe(se,i),t(i.calc)}}return Bt(o,e,Ue)}let ae=null;function Ne(){if(!window.__vnptInited){window.__vnptInited=!0,j.info("Initializing VNPT Userscript...");try{qe(),gt(),Lt(),ht(),pt(),Te(),mt(),yt(),Et(),dt();const e=ze(()=>{et(),j.debug("DOM Cache cleared due to mutations")},500);ae=new MutationObserver(n=>{n.some(o=>o.addedNodes.length>0||o.removedNodes.length>0)&&e()}),ae.observe(document.body,{childList:!0,subtree:!0}),j.info("Userscript initialized successfully.")}catch(e){j.error("Error during userscript initialization:",e)}}}function Dt(){j.info("Cleaning up VNPT Userscript for reload..."),ae&&(ae.disconnect(),ae=null);const e=document.getElementById("vnpt-docx-widget");e&&e.remove();const n=document.getElementById("vnpt-calc-widget");n&&n.remove();const o=document.getElementById("vnpt-styles");o&&o.remove(),window.__vnptInited=!1,j.info("Cleanup completed.")}window.__vnptCleanup=Dt,window.__vnptInit=Ne,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Ne):Ne()})();
