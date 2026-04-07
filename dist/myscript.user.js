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
(function(){"use strict";const q={info:(...e)=>console.log("[Tampermonkey Script] INFO:",...e),error:(...e)=>console.error("[Tampermonkey Script] ERROR:",...e),warn:(...e)=>console.warn("[Tampermonkey Script] WARN:",...e)};function Ke(){const e="vnpt-styles";if(document.getElementById(e))return;const n=document.createElement("style");n.id=e,n.textContent=`
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

    `,document.head.appendChild(n)}const qe={widget:null,panel:null,header:null,bannerArea:null,toggleBtn:null,fieldsContainer:null,panelBody:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1,templateBuffer:null,templateName:null,hasDragged:!1},J=new Map,i=new Proxy(qe,{get(e,n){return n==="on"?(o,a)=>{J.has(o)||J.set(o,[]),J.get(o).push(a)}:e[n]},set(e,n,o){const a=e[n];return e[n]=o,a!==o&&J.has(n)&&J.get(n).forEach(t=>t(o,a)),!0}}),B={tenDaiDienn:"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT",emailDaiDien:"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Số GPKD | MST",goiDV:"Gói Dịch Vụ",ngayKy:"Ngày ký",thangKy:"Tháng Ký",namKy:"Năm ký",soHopDong:"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký"},ne="vnpt_docx_fields",he="vnpt_docx_default_fields",oe="vnpt_docx_position",ae="vnpt_docx_size",be="vnpt_docx_opened",j="vnpt_autofill_data_default",V="vnpt_autofill_data_custom",R="vnpt_autofill_data_sync",je="vnpt_widget_pos",ie="vnd_tax_rate",ve="vnd_before_history",ye="vnd_after_history",le="vnpt_widget_collapsed",re="vnd_calc_map",X="vnpt_widget_datatab",se="vnpt_templates";let z=null;function S(e,n="#198754",o=2500){z||(z=document.createElement("div"),z.id="vnpt-toast-container",Object.assign(z.style,{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column-reverse",alignItems:"center",gap:"8px",zIndex:"1000000",pointerEvents:"none"}),document.body.appendChild(z));const a=document.createElement("div");a.innerText=e,Object.assign(a.style,{background:n,color:"#fff",padding:"8px 18px",borderRadius:"24px",opacity:"0",transform:"translateY(10px)",transition:"opacity 0.3s, transform 0.3s",fontSize:"13px",fontWeight:"500",fontFamily:"'Segoe UI', Roboto, sans-serif",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",whiteSpace:"nowrap",pointerEvents:"auto"}),z.appendChild(a),requestAnimationFrame(()=>{a.style.opacity="1",a.style.transform="translateY(0)"}),setTimeout(()=>{a.style.opacity="0",a.style.transform="translateY(-10px)",setTimeout(()=>{a.remove(),z&&z.childNodes.length},300)},o)}const Ve={local:{download(e,n="arraybuffer"){return new Promise((o,a)=>{const t=new FileReader;switch(t.onload=c=>{let r=c.target.result;n==="base64"&&typeof r=="string"&&(r=r.split(",")[1]||r),o(r)},t.onerror=c=>a(c),n.toLowerCase()){case"arraybuffer":t.readAsArrayBuffer(e);break;case"base64":case"dataurl":t.readAsDataURL(e);break;case"text":t.readAsText(e);break;default:a(new Error(`Unsupported read type: ${n}`))}})},async upload(e){return this.download(e,"base64")}}},Ue={getAdapter(e){const n=Ve[e];if(!n)throw new Error(`Storage adapter not found: ${e}`);return n},async upload(e,n,o={}){return await this.getAdapter(e).upload(n,o)},async download(e,n,o={}){return await this.getAdapter(e).download(n,o.type||"arraybuffer")}},We="vnpt_templates_db",_="buffers";let ce=null;function xe(){return ce?Promise.resolve(ce):new Promise((e,n)=>{const o=indexedDB.open(We,1);o.onupgradeneeded=a=>{const t=a.target.result;t.objectStoreNames.contains(_)||t.createObjectStore(_)},o.onsuccess=a=>{ce=a.target.result,e(ce)},o.onerror=()=>n(o.error)})}async function $e(e,n){const o=await xe();return new Promise((a,t)=>{const s=o.transaction(_,"readwrite").objectStore(_).put(n,e);s.onsuccess=()=>a(),s.onerror=()=>t(s.error)})}async function Je(e){const n=await xe();return new Promise((o,a)=>{const r=n.transaction(_,"readonly").objectStore(_).get(e);r.onsuccess=()=>o(r.result),r.onerror=()=>a(r.error)})}async function Xe(e){const n=await xe();return new Promise((o,a)=>{const r=n.transaction(_,"readwrite").objectStore(_).delete(e);r.onsuccess=()=>o(),r.onerror=()=>a(r.error)})}function G(){try{const e=JSON.parse(localStorage.getItem(se))||[],n=e.filter(o=>o.type!=="local");return n.length!==e.length&&Y(n),n}catch{return[]}}function Y(e){localStorage.setItem(se,JSON.stringify(e))}function Ge(e){const n=e.match(/drive\.google\.com\/file\/d\/([^/]+)/);return n?`https://drive.google.com/uc?export=download&id=${n[1]}`:e}function Ye(e){return new Promise((n,o)=>{GM_xmlhttpRequest({method:"GET",url:Ge(e),responseType:"arraybuffer",onload:a=>{if(a.status>=200&&a.status<300){if(a.response&&a.response.byteLength>4){const t=new Uint8Array(a.response.slice(0,4));if(t[0]===80&&t[1]===75&&t[2]===3&&t[3]===4){n(a.response);return}else{o(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}n(a.response)}else o(new Error(`HTTP ${a.status}: Không lấy được file`))},onerror:()=>o(new Error("Không thể tải URL.")),ontimeout:()=>o(new Error("Timeout khi tải URL."))})})}async function Qe(e,n,o){const a=e.name.replace(/\.docx$/i,""),t=prompt("Đặt tên biến nhớ cho file này:",a);if(!(!t||!t.trim()))try{const c=await e.arrayBuffer();await $e(t.trim(),c);const s=G().filter(l=>l.name!==t.trim()&&l.fileName!==e.name);s.unshift({name:t.trim(),type:"local_idb",fileName:e.name,lastUsed:Date.now()}),Y(s),H(n,o),o&&o(c,t.trim())}catch(c){S(`❌ Lỗi lưu file: ${c.message}`,"#dc3545")}}function H(e,n,o=null){let a=e.querySelector(".vnpt-template-manager-inner"),t,c;if(a)t=a.querySelector(".vnpt-local-list-container"),c=a.querySelector(".vnpt-btn-wrap");else{e.innerHTML="",a=document.createElement("div"),a.className="vnpt-template-manager-inner";const l=document.createElement("div");l.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const p=document.createElement("span");p.className="vnpt-title-main",p.style.cssText="font-size:11px;font-weight:700;color:#444;",c=document.createElement("div"),c.className="vnpt-btn-wrap",c.style.cssText="display:flex;gap:4px;",l.appendChild(p),l.appendChild(c),a.appendChild(l),t=document.createElement("div"),t.className="vnpt-local-list-container",t.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",a.appendChild(t),e.appendChild(a)}const r=G(),s=a.querySelector(".vnpt-title-main");s.innerHTML="Templates"+(o?` <span style="color:#2e7d32;">(Đang dùng: ${o})</span>`:""),r.length===0?t.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':t.innerHTML="",r.forEach((l,p)=>{const u=document.createElement("div");u.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",u.title=l.fileName||l.url||l.name,u.tabIndex=0,u.onfocus=()=>u.style.boxShadow="0 0 0 2px #28a745",u.onblur=()=>u.style.boxShadow="none";const d=l.type==="local"||l.type==="local_base64"||l.type==="local_idb"?"OFF":"ON",v=d==="OFF"?"#6c757d":"#28a745",h=document.createElement("span");h.textContent=d,h.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${v};color:#fff;`;const w=document.createElement("span");w.textContent=l.name,w.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",u.onclick=()=>{u.focus(),Ze(l,n,o,e)},u.appendChild(h),u.appendChild(w);const y=document.createElement("button");y.innerHTML="✎",y.title="Đổi tên template",y.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",y.onclick=b=>{b.stopPropagation();const g=prompt("Đổi tên template:",l.name);if(g&&g.trim()&&g.trim()!==l.name){const x=G();x[p].name=g.trim(),Y(x),H(e,n,o)}},u.appendChild(y);const f=document.createElement("button");f.innerHTML="✕",f.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",f.onclick=async b=>{if(b.stopPropagation(),confirm(`Xoá biểu mẫu "${l.name}"?`)){const g=G();g.splice(p,1),Y(g),l.type==="local_idb"&&await Xe(l.name).catch(()=>null),H(e,n,o===l.name?null:o)}},u.appendChild(f),t.appendChild(u)})}function Ze(e,n,o,a){const t=G(),c=t.find(r=>r.name===e.name&&(r.url===e.url||r.type===e.type));if(c&&(c.lastUsed=Date.now(),Y(t)),e.type==="local_idb"){Je(e.name).then(r=>{if(!r)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");n&&n(r,e.name),H(a,n,e.name)}).catch(r=>{S(`❌ Lỗi nạp File IDB: ${r.message}`,"#dc3545")});return}if(e.type==="local_base64"&&e.data){try{const r=window.atob(e.data.split(",")[1]),s=r.length,l=new Uint8Array(s);for(let p=0;p<s;p++)l[p]=r.charCodeAt(p);n&&n(l.buffer,e.name),H(a,n,e.name)}catch(r){S(`❌ Lỗi nạp Base64: ${r.message}`,"#dc3545")}return}Ye(e.url).then(r=>{n&&n(r,e.name),H(a,n,e.name)}).catch(r=>{S(`❌ ${r.message}`,"#dc3545")})}const U=new Map;function et(){U.clear()}function tt(e){e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function Q(e,n){var t;const o=e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,a=(t=Object.getOwnPropertyDescriptor(o,"value"))==null?void 0:t.set;a?a.call(e,n):e.value=n,tt(e)}function de(e){if(!e)return null;const n=U.get(e);if(n&&document.contains(n))return n;const o=document.getElementById(e);if(o&&(o.tagName==="INPUT"||o.tagName==="TEXTAREA"))return U.set(e,o),o;for(const a of document.querySelectorAll("label"))if(a.textContent.trim()===e){let t=null;if(a.htmlFor&&(t=document.getElementById(a.htmlFor)),!t){let c=a.parentElement;for(;c;){const r=c.querySelector("input,textarea");if(r){t=r;break}if(c=c.parentElement,(c==null?void 0:c.tagName)==="FORM")break}}if(t)return U.set(e,t),t}return null}function pe(e){if(!e)return null;const n=U.get(`lbl:${e}`);if(n&&document.contains(n))return n;for(const o of document.querySelectorAll("label"))if(o.innerText.trim()===e){const a=o.parentElement.querySelector("input, textarea");if(a)return U.set(`lbl:${e}`,a),a}return null}function F(e,n){const o=de(e)||pe(e);o&&Q(o,n)}function nt(e=new Date){return String(e.getDate()).padStart(2,"0")}function ot(e=new Date){return String(e.getMonth()+1).padStart(2,"0")}function at(e=new Date){return String(e.getFullYear())}function Te(){const e=new Date;return{ngay:nt(e),thang:ot(e),nam:at(e)}}const{ngay:Be,thang:Le,nam:Ie}=Te(),P={ngayKy:{label:"Ngày ký",value:Be},"thangKy, thangKy1":{label:"Tháng ký",value:Le},"namKy, namKy1":{label:"Năm ký",value:Ie},"ngayTiepNhan, ngayThangNamKy":{label:"Ngày ký (full)",value:`${Be}/${Le}/${Ie}`},tenDoanhNghiepB:{label:"Tên doanh nghiệp B",value:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM"},diaChiB:{label:"Địa chỉ B",value:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội"},maSoThueB:{label:"Mã số thuế B",value:"0100686223"},stkB:{label:"Số tài khoản B",value:"1600114156"},diaChiStkB:{label:"Ngân hàng/Địa chỉ STK B",value:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)"},"tenB, nguoiDaiDienB":{label:"Người đại diện B",value:"Phạm Khánh Chung"},"chucVuB, chucVuDaiDienB":{label:"Chức vụ B",value:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp"},"giayUyQuyenSoB, soGiayUyQuyenB":{label:"Giấy ủy quyền số B",value:"2628/GUQ-VNPT-HNI-VP"},"giayUyQuyenNgayB, ngayGiayUyQuyenB":{label:"Giấy ủy quyền ngày B",value:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},GiayUyQuyenB:{label:"Giấy ủy quyền B (full)",value:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},tenDoanhNghiepB1:{label:"Tên doanh nghiệp B (phụ)",value:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},donViTiepNhan:{label:"Đơn vị tiếp nhận",value:"TTKD KHDN"},"tenTiepNhan, tenNguoiNhan":{label:"Người tiếp nhận",value:"Bùi Anh"},dienThoaiB:{label:"Điện thoại B",value:"02436686868"},diaChiTaiKhoanB:{label:"Địa chỉ tài khoản B",value:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 "},noiKy:{label:"Nơi ký",value:"Hà Nội"},emailB:{label:"Email B",value:""},"lienheHopDongB, lienheTuVanB, lienheHoaDonB, sucoCap1B, sucoCap2B, sucoCap3B, sucoCap4B":{label:"Liên hệ B (AM)",value:"AM Bùi Anh"}},De={soHopDong:"inputContractGroupName"},D={get(e,n=null){try{const o=localStorage.getItem(e);return o===null?n:JSON.parse(o)}catch(o){return console.warn(`[Storage] Không thể đọc key "${e}":`,o),n}},set(e,n){try{return localStorage.setItem(e,JSON.stringify(n)),!0}catch(o){return console.error(`[Storage] Không thể ghi key "${e}":`,o),!1}},remove(e){try{localStorage.removeItem(e)}catch(n){console.error(`[Storage] Không thể xóa key "${e}":`,n)}}};function Oe(e,n){let o;return function(...t){const c=()=>{clearTimeout(o),e(...t)};clearTimeout(o),o=setTimeout(c,n)}}function Ae(){const e=D.get(j)??{...P},n=D.get(V)??{},o={...e,...n};Object.keys(o).forEach(a=>{const t=o[a],c=t&&typeof t=="object"&&t.hasOwnProperty("value")?t.value:t;a.split(",").map(s=>s.trim()).filter(s=>s).forEach(s=>{let l=de(s)||pe(s);l&&Q(l,c)})}),S("✅ Auto fill complete")}function it(){let e=D.get(R)??{};const n={...De,...e},o=Object.keys(n);if(o.length===0){S("⚠️ No sync mapping","#ffc107");return}o.forEach(a=>{let t=de(a)||pe(a);t&&t.value!==void 0&&t.value!==""&&n[a].split(",").map(r=>r.trim()).filter(r=>r).forEach(r=>F(r,t.value))}),S("✅ Sync form complete","#d39e00")}let we=!1;const lt=(e,n)=>{var l;if(we)return;let o=D.get(R)??{};const a={...De,...o};if(Object.keys(a).length===0)return;let t=e.id,c=e.name,r=null;if(t){const p=document.querySelector(`label[for="${t}"]`);p&&(r=p.textContent.trim())}if(!r){const p=e.closest("label");p&&(r=(l=Array.from(p.childNodes).find(u=>u.nodeType===3))==null?void 0:l.textContent.trim())}let s=a[t]||a[c]||a[r];if(s){we=!0;try{s.split(",").map(u=>u.trim()).filter(u=>u).forEach(u=>{if(u!==t&&u!==c&&u!==r){const d=de(u)||pe(u);d&&document.activeElement!==d&&Q(d,n)}})}finally{we=!1}}},rt=Oe((e,n)=>{lt(e,n)},250);function st(){document.addEventListener("input",e=>{const n=e.target;!n||!["INPUT","TEXTAREA"].includes(n.tagName)||n.closest("#vnpt-docx-widget")||n.closest("#vnpt-inline-calc")||rt(n,n.value)})}function T(e,n,o=null,a=""){const t=i.fieldsContainer.querySelector(".text-hint");t&&t.remove();const c=i.fieldsContainer.querySelectorAll(".f-key");let r=!1;for(let s of c)if(s.value.split(",")[0].trim()===e){const p=s.closest(".vnpt-field-row"),u=p.querySelector(".f-val"),d=p.querySelector(".f-label");n!==""&&u.value!==n&&document.activeElement!==u&&(u.value=n),o!==null&&o!==""&&d.value!==o&&document.activeElement!==d&&(d.value=o),a!==""&&s.value!==e+", "+a&&document.activeElement!==s&&(s.value=e+", "+a),r=!0;break}if(!r){(o===null||o==="")&&(o=B[e]||"");const s=document.createElement("div");s.className="vnpt-field-row row-item",s.setAttribute("draggable","false");let l=e;a&&(l+=", "+a),s.innerHTML=`
            <input type="checkbox" class="row-chk" title="Chọn" style="margin: 0 2px 0 2px;" />
            <input type="text" class="f-label" value="${o}" />
            <input type="text" class="f-key" value="${l}" title="Biến DOCX và IDs đồng bộ" />
            <span class="row-drag-handle" title="Kéo">=</span>
            <input type="text" class="f-val" value="${n}" />
        `;const p=s.querySelector(".f-val"),u=s.querySelector(".f-key");e==="tenToChuc"&&(p.style.textAlign="right");const d=()=>{const h=p.value;u.value.split(",").map(y=>y.trim()).filter(y=>y).forEach(y=>F(y,h))};u.addEventListener("input",function(){L();const h=this.value.split(",")[0].trim();p.style.textAlign=h==="tenToChuc"?"right":"",d()}),s.querySelector(".f-label").addEventListener("input",L),p.addEventListener("input",function(){L(),d()});const v=s.querySelector(".row-drag-handle");v.addEventListener("mouseenter",()=>s.setAttribute("draggable","true")),v.addEventListener("mouseleave",()=>{s.classList.contains("dragging")||s.setAttribute("draggable","false")}),s.addEventListener("dragstart",function(h){i.draggedRowForVNPT=this,h.dataTransfer.effectAllowed="move",h.dataTransfer.setData("text/plain",e),this.classList.add("dragging")}),s.addEventListener("dragover",h=>(h.preventDefault(),!1)),s.addEventListener("dragenter",function(){this.classList.add("over")}),s.addEventListener("dragleave",function(){this.classList.remove("over")}),s.addEventListener("drop",function(h){if(h.stopPropagation(),i.draggedRowForVNPT&&i.draggedRowForVNPT!==this){const w=Array.from(i.fieldsContainer.querySelectorAll(".vnpt-field-row")),y=w.indexOf(i.draggedRowForVNPT),f=w.indexOf(this);y<f?this.parentNode.insertBefore(i.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(i.draggedRowForVNPT,this),L()}return!1}),s.addEventListener("dragend",function(){this.setAttribute("draggable","false"),i.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(h=>{h.classList.remove("over","dragging")}),i.draggedRowForVNPT=null}),i.fieldsContainer.appendChild(s),i.fieldsContainer.scrollTop=i.fieldsContainer.scrollHeight}}function L(){const e=i.isDefaultMode?he:ne,n={};i.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(a=>{const c=a.querySelector(".f-key").value.trim().split(",").map(u=>u.trim()).filter(u=>u),r=c[0],s=c.slice(1).join(", "),l=a.querySelector(".f-label").value.trim(),p=a.querySelector(".f-val").value;r&&(n[r]={label:l,value:p,sync:s})}),D.set(e,n)}function Ee(){try{i.fieldsContainer.innerHTML="";const n=D.get(ne)||{};Object.keys(B).forEach(o=>{const a=B[o],t=n[o];t&&typeof t=="object"?T(o,t.value,t.label||a,t.sync||""):t?T(o,t,a,""):T(o,"",a,"")}),Object.keys(n).forEach(o=>{if(!(o in B)){const a=n[o];typeof a=="object"?T(o,a.value,a.label,a.sync||""):T(o,a,"","")}}),Object.keys(B).length===0&&Object.keys(n).length===0&&(i.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(n){console.error("Error loading config:",n),Object.keys(B).forEach(o=>T(o,"",B[o]))}const e=D.get(oe);e&&i.widget&&(i.widget.style.bottom="auto",e.right?(i.widget.style.right=e.right,i.widget.style.left="auto"):e.left&&(i.widget.style.left=e.left,i.widget.style.right="auto"),e.top&&(i.widget.style.top=e.top))}function ct(){document.getElementById("vnpt-btn-toggle-id").onclick=()=>i.fieldsContainer.classList.toggle("show-ids"),document.getElementById("vnpt-btn-default").onclick=()=>{i.isDefaultMode=!i.isDefaultMode},i.on("isDefaultMode",e=>ze(e)),document.getElementById("vnpt-btn-reset-default").onclick=()=>{confirm("Khôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?")&&(D.remove(he),i.isDefaultMode&&(ze(!0),S("🔄 Đã khôi phục dữ liệu gốc","#1a73e8")))},document.getElementById("vnpt-btn-batch-del").onclick=()=>{const e=i.fieldsContainer.querySelectorAll(".vnpt-field-row");let n=0;e.forEach(o=>{var a;(a=o.querySelector(".row-chk"))!=null&&a.checked&&(o.remove(),n++)}),n===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(e.forEach(o=>o.remove()),S("🗑️ Đã xóa toàn bộ","#ff5252"),L()):(S(`🗑️ Đã xóa ${n} trường`,"#ff5252"),L())},document.getElementById("vnpt-btn-add").onclick=()=>{const e=i.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;T("bien_moi_"+e,"","",""),L()},document.getElementById("vnpt-btn-fill-back").onclick=()=>{Ae();let e=0;i.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(n=>{const o=n.querySelector(".f-key").value.trim(),a=n.querySelector(".f-val").value;o.split(",").map(t=>t.trim()).filter(Boolean).forEach(t=>{(document.getElementById(t)||document.getElementsByName(t)[0])&&(F(t,a),e++)})}),e>0?S(`✅ Đã điền ngược ${e} trường`,"#198754"):S("⚠️ Không khớp trường nào","#ffc107")}}function ze(e){const n=document.getElementById("vnpt-btn-default"),o=document.getElementById("vnpt-btn-reset-default");if(i.fieldsContainer.innerHTML="",i.bannerArea.innerHTML="",e){n.classList.add("active"),o&&(o.style.display="flex"),i.fieldsContainer.classList.add("vnpt-mode-default"),S("📌 Chế độ Dữ liệu mặc định (Có thể sửa)","#ea4335");const a=document.createElement("div");a.className="vnpt-default-banner",a.innerHTML="<span> Lưu ý: đây là Dữ liệu mặc định (Có thể sửa/lưu)</span>",i.bannerArea.appendChild(a);const t=D.get(he);t===null?Object.keys(P).forEach(c=>{const r=P[c],s=r&&typeof r=="object"?r.value:r,l=r&&typeof r=="object"?r.label:B[c]||"";T(c,s,l)}):Object.keys(t).forEach(c=>{const r=t[c];T(c,r.value,r.label,r.sync||"")})}else n.classList.remove("active"),o&&(o.style.display="none"),i.fieldsContainer.classList.remove("vnpt-mode-default"),S("📋 Đã quay lại Dữ liệu cá nhân"),Ee()}function dt(){const e={version:"1.0",timestamp:Date.now(),fields:JSON.parse(localStorage.getItem(ne))||{},templates:JSON.parse(localStorage.getItem(se))||[],position:JSON.parse(localStorage.getItem(oe))||null,size:JSON.parse(localStorage.getItem(ae))||null,calc:{default:JSON.parse(localStorage.getItem(j))||null,custom:JSON.parse(localStorage.getItem(V))||null,sync:JSON.parse(localStorage.getItem(R))||null,map:JSON.parse(localStorage.getItem(re))||{},taxRate:Number(localStorage.getItem(ie))||.08}},n=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),o=URL.createObjectURL(n),a=document.createElement("a");a.href=o,a.download=`vnpt_config_${new Date().toISOString().slice(0,10)}.json`,a.click(),URL.revokeObjectURL(o),S("📤 Đã xuất cấu hình JSON")}function pt(){const e=document.createElement("input");e.type="file",e.accept=".json",e.onchange=async n=>{const o=n.target.files[0];if(o)try{const a=await o.text(),t=JSON.parse(a);if(!t.fields&&!t.calc)throw new Error("Định dạng file không hợp lệ!");t.fields&&localStorage.setItem(ne,JSON.stringify(t.fields)),t.templates&&localStorage.setItem(se,JSON.stringify(t.templates)),t.position&&localStorage.setItem(oe,JSON.stringify(t.position)),t.size&&localStorage.setItem(ae,JSON.stringify(t.size)),t.calc&&(t.calc.default&&localStorage.setItem(j,JSON.stringify(t.calc.default)),t.calc.custom&&localStorage.setItem(V,JSON.stringify(t.calc.custom)),t.calc.sync&&localStorage.setItem(R,JSON.stringify(t.calc.sync)),t.calc.map&&localStorage.setItem(re,JSON.stringify(t.calc.map)),t.calc.taxRate!==void 0&&localStorage.setItem(ie,t.calc.taxRate)),await Ee();const c=document.getElementById("vnpt-calc-widget");if(c){const s=document.getElementById("wg-taxRate");s&&t.calc&&t.calc.taxRate!==void 0&&(s.value=t.calc.taxRate*100),t.calc&&t.calc.map&&c.querySelectorAll("input[data-clink]").forEach(l=>{const p=l.dataset.clink;t.calc.map[p]&&(l.value=(t.calc.map[p]||[]).join(", "))})}const r=document.getElementById("vnpt-template-manager");r&&H(r,(s,l)=>{i.templateBuffer=s,i.templateName=l}),t.position&&i.widget&&(t.position.right?(i.widget.style.right=t.position.right,i.widget.style.left="auto"):t.position.left&&(i.widget.style.left=t.position.left,i.widget.style.right="auto"),t.position.top&&(i.widget.style.top=t.position.top),i.widget.style.bottom="auto"),t.size&&i.panel&&(i.panel.style.width=t.size.width+"px",i.panel.style.height=t.size.height+"px"),S("✅ Nhập cấu hình thành công!")}catch(a){console.error("Lỗi Import:",a),alert("Lỗi: "+a.message)}},e.click()}function ut(){const e=document.createElement("div");e.id="vnpt-docx-widget";const n=localStorage.getItem(be)==="true";e.innerHTML=`
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
    `,document.body.appendChild(e),i.widget=e,i.panel=document.getElementById("vnpt-export-panel"),i.toggleBtn=document.getElementById("vnpt-toggle-btn"),i.header=document.getElementById("vnpt-panel-header"),i.bannerArea=document.getElementById("vnpt-banner-area"),i.fieldsContainer=document.getElementById("vnpt-fields-list");try{const s=JSON.parse(localStorage.getItem(ae));s&&s.width&&s.height&&(i.panel.style.width=s.width+"px",i.panel.style.height=s.height+"px")}catch(s){console.error("Lỗi load size panel:",s)}new ResizeObserver(s=>{if(i.panel.style.display!=="none")for(let l of s){const{width:p,height:u}=l.contentRect;p>0&&u>0&&localStorage.setItem(ae,JSON.stringify({width:Math.round(p+20),height:Math.round(u+20)}))}}).observe(i.panel),i.panelBody=document.getElementById("vnpt-panel-body"),H(document.getElementById("vnpt-template-manager"),(s,l)=>{i.templateBuffer=s,i.templateName=l}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const s=this.files&&this.files[0];if(!s)return;const l=document.getElementById("vnpt-template-manager");Qe(s,l,(p,u)=>{i.templateBuffer=p,i.templateName=u}),this.value=""}),i.toggleBtn.addEventListener("click",s=>{i.hasDragged||(i.panel.style.display==="none"?(i.panel.style.display="flex",i.toggleBtn.className="btn-opened",i.toggleBtn.innerHTML="✖",localStorage.setItem(be,"true")):(i.panel.style.display="none",i.toggleBtn.className="btn-closed",i.toggleBtn.innerHTML="📄",localStorage.setItem(be,"false")))});const a=document.getElementById("vnpt-btn-size"),t=document.getElementById("vnpt-size-menu"),c={S:{width:"350px",height:"400px"},M:{width:"440px",height:"600px"},L:{width:"600px",height:"800px"},Full:{width:"98vw",height:"92vh"}};a.addEventListener("click",s=>{s.stopPropagation(),t.classList.toggle("show")}),document.addEventListener("click",()=>t.classList.remove("show")),t.querySelectorAll("button").forEach(s=>{s.addEventListener("click",l=>{const p=l.target.getAttribute("data-size"),u=c[p];u&&(i.panel.style.width=u.width,i.panel.style.height=u.height),t.classList.remove("show")})}),i.panel.querySelectorAll(".vnpt-resizer").forEach(s=>{s.addEventListener("mousedown",l=>{l.preventDefault(),l.stopPropagation();const p=l.clientX,u=l.clientY,d=i.panel.offsetWidth,v=i.panel.offsetHeight,h=i.widget.getBoundingClientRect(),w=h.top,y=window.innerWidth-h.right,f=g=>{const x=g.clientX-p,E=g.clientY-u;if(s.classList.contains("br"))i.panel.style.width=d+x+"px",i.panel.style.height=v+E+"px";else if(s.classList.contains("bl")){const m=d-x;m>300&&(i.panel.style.width=m+"px",i.widget.style.right=y+x+"px"),i.panel.style.height=v+E+"px"}else if(s.classList.contains("tr")){i.panel.style.width=d+x+"px";const m=v-E;m>150&&(i.panel.style.height=m+"px",i.widget.style.top=w+E+"px")}else if(s.classList.contains("tl")){const m=d-x,k=v-E;m>300&&(i.panel.style.width=m+"px",i.widget.style.right=y+x+"px"),k>150&&(i.panel.style.height=k+"px",i.widget.style.top=w+E+"px")}},b=()=>{window.removeEventListener("mousemove",f),window.removeEventListener("mouseup",b);const g=i.widget.id==="vnpt-docx-widget";localStorage.setItem(LOCAL_KEY_POS,JSON.stringify({right:g?i.widget.style.right:void 0,top:i.widget.style.top,x:g?void 0:parseFloat(i.widget.style.left),y:parseFloat(i.widget.style.top)}))};window.addEventListener("mousemove",f),window.addEventListener("mouseup",b)})})}function _e(e,n,o,a=null,t=null){let c=!1,r=0,s=0,l=!1;function p(d){l!==d&&(l=d,t&&t(d))}function u(d){if(d.button!==0)return;c=!0,i.hasDragged=!1;const v=e.getBoundingClientRect();r=d.clientX-v.left,s=d.clientY-v.top,document.body.style.userSelect="none",n&&n.forEach(h=>h.style.cursor="grabbing"),a&&a(),d.preventDefault()}return n.forEach(d=>{d.addEventListener("mousedown",u)}),document.addEventListener("mousemove",function(d){if(!c)return;i.hasDragged=!0;let v=d.clientX-r,h=d.clientY-s;const w=window.innerWidth,y=window.innerHeight,f=document.getElementById("vnpt-toggle-btn"),b=f?f.offsetWidth:40,g=f?f.offsetHeight:40,x=e.id==="vnpt-docx-widget";let E=e.offsetWidth||0;if(x){let C=b+6-E,N=w-E+6;v<C&&(v=C),v>N&&(v=N)}else E=E||200,v<0&&(v=0),v+E>w&&(v=Math.max(0,w-E));let m=l;if(x?m=!1:l?d.clientY<y-40&&(m=!1):d.clientY>y-10&&(m=!0),h<0&&(h=0),m)p(!0),e.style.top=y-e.offsetHeight+"px",x?(e.style.right=w-v-E+"px",e.style.left="auto"):(e.style.left=v+"px",e.style.right="auto"),e.style.bottom="auto";else{p(!1);let k=e.offsetHeight||40,C;if(x)C=10+g;else{const N=e.querySelector(".cw-title-bar");C=N?N.offsetHeight:k}h+C>y&&(h=Math.max(0,y-C)),e.style.top=h+"px",x?(e.style.right=w-v-E+"px",e.style.left="auto"):(e.style.left=v+"px",e.style.right="auto"),e.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(c&&(c=!1,document.body.style.userSelect="",n&&n.forEach(d=>d.style.cursor="grab"),o)){const d=e.id==="vnpt-docx-widget";localStorage.setItem(o,JSON.stringify({left:d?void 0:e.style.left,right:d?e.style.right:void 0,top:e.style.top,x:d?void 0:parseFloat(e.style.left),y:parseFloat(e.style.top),docked:l}))}}),{isDocked:()=>l,setDocked:p}}function ft(){i.widget&&i.header&&i.toggleBtn&&(_e(i.widget,[i.header,i.toggleBtn],oe),window.addEventListener("resize",()=>{const e=window.innerWidth,n=window.innerHeight,o=document.getElementById("vnpt-toggle-btn"),a=o?o.offsetWidth:40,t=o?o.offsetHeight:40;let c=i.widget.getBoundingClientRect(),r=c.left,s=c.top,l=i.widget.offsetWidth||0,u=a+6-l,d=e-l+6;r<u&&(r=u),r>d&&(r=d),s+10+t>n&&(s=Math.max(0,n-(10+t))),i.widget.style.right=e-r-l+"px",i.widget.style.top=s+"px"}))}function He(e){const n=e.toLowerCase(),{ngay:o,thang:a,nam:t}=Te();return{ngayky:o,thangky:a,thangky1:a,namky:t,namky1:t,soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[n]||""}function gt(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){if(i.isDefaultMode){Object.keys(P).forEach(n=>{T(n,P[n],B[n]||"")}),L(),S("Đã nạp lại dữ liệu mặc định từ hệ thống.");return}let e=0;Object.keys(B).forEach(n=>{var t;const o=document.getElementById(n);let a="";o&&(a=o.tagName.toLowerCase()==="select"?((t=o.options[o.selectedIndex])==null?void 0:t.text)||"":o.value,e++),a||(a=He(n)),T(n,a,null)}),L(),e>0?(this.style.background="#34a853",this.style.color="#fff",this.innerText="Done",setTimeout(()=>{this.style.background="#fbbc04",this.style.color="#000",this.innerText="Quét"},1e3)):S("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(e){e.target.closest("#vnpt-docx-widget")||e.target.closest("#vnpt-inline-calc")||e.target&&e.target.id&&B[e.target.id]!==void 0&&(T(e.target.id,e.target.value,null),L())}),document.addEventListener("change",function(e){var n;if(!(e.target.closest("#vnpt-docx-widget")||e.target.closest("#vnpt-inline-calc"))&&e.target&&e.target.id&&B[e.target.id]!==void 0){let o=e.target.tagName.toLowerCase()==="select"?((n=e.target.options[e.target.selectedIndex])==null?void 0:n.text)||"":e.target.value;T(e.target.id,o,null),L()}})}function Me(e,n,o){try{let a;try{a=new window.PizZip(e)}catch(l){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(l);return}const t=new window.docxtemplater(a,{paragraphLoop:!0,linebreaks:!0});t.render(n);const c=t.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),r=URL.createObjectURL(c),s=document.createElement("a");s.href=r,s.download=o,document.body.appendChild(s),s.click(),setTimeout(()=>{document.body.removeChild(s),URL.revokeObjectURL(r)},100)}catch(a){let t=a.message;a.properties&&a.properties.errors instanceof Array?t=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+a.properties.errors.map(r=>"- "+(r.properties.explanation||r.message)).join(`
`):t="Lỗi phần mềm Word sinh ra: "+t,alert(t),console.error("DocX Error:",a)}}function mt(){const e=document.getElementById("vnpt-export-filename");e&&e.addEventListener("input",()=>{e.dataset.userEdited="1",e.value.trim()||(e.dataset.userEdited="0")});function n(){if(!e||e.dataset.userEdited==="1")return;let o="";if(i.fieldsContainer&&i.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(l=>{const u=l.querySelector(".f-key").value.trim().split(",")[0].trim(),d=l.querySelector(".f-val").value.trim();u==="tenToChuc"&&(o=d)}),!o){const s=document.getElementById("tenToChuc");s&&(o=s.tagName.toLowerCase()==="textarea"||s.tagName.toLowerCase()==="input"?s.value.trim():s.innerText.trim())}function a(s){if(!s)return"";let l=s;return l=l.replace(/Tổng công ty/gi,""),l=l.replace(/Công ty/gi,""),l=l.replace(/\bCty\b/gi,""),l=l.replace(/Trách nhiệm hữu hạn/gi,""),l=l.replace(/\bTNHH\b/gi,""),l=l.replace(/Cổ phần/gi,""),l=l.replace(/\bCP\b/gi,""),l=l.replace(/Một thành viên/gi,""),l=l.replace(/\bMTV\b/gi,""),l=l.replace(/Chi nhánh/gi,""),l=l.replace(/Việt Nam/gi,"VN"),l=l.replace(/Viet Nam/gi,"VN"),l=l.replace(/\s+/g," ").trim(),l=l.replace(/^[-,\s]+|[-,\s]+$/g,""),l.length>50&&(l=l.substring(0,47)+"..."),l.replace(/[<>:"/\\|?*]/g,"")}let t=a(o),c=i.templateName?i.templateName.replace(/\.docx$/i,""):"",r=[];c&&r.push(c),t&&r.push(t),r.length>0?e.value=r.join(" - ")+".docx":e.value||(e.value="Export_Auto.docx")}setInterval(n,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const o={};if(i.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(r=>{const l=r.querySelector(".f-key").value.trim().split(",")[0].trim(),p=r.querySelector(".f-val").value;l&&(o[l]=p)}),Object.keys(o).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}let t=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(t.toLowerCase().endsWith(".docx")||(t+=".docx"),i.templateBuffer){Me(i.templateBuffer,o,t);return}const c=document.getElementById("vnpt-template-file");if(c.files&&c.files.length>0){Ue.download("local",c.files[0],{type:"arraybuffer"}).then(r=>Me(r,o,t)).catch(r=>alert(`Lỗi đọc file: ${r.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')})}const ht=["chucVu","noiCap","noiCapSoDkdn","ngayky","thangky","namky","thangky1","namky1","noiKy"],bt=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function vt(){function e(){ht.forEach(a=>{const t=document.getElementById(a);t&&!t.dataset.filled&&(t.dataset.filled="1",Q(t,He(a)))}),bt.forEach(a=>{const t=document.getElementById(a.src),c=document.getElementById(a.target);t&&c&&!t.dataset.bound&&(t.dataset.bound="1",t.addEventListener("input",()=>Q(c,t.value)))})}let n;new MutationObserver(()=>{clearTimeout(n),n=setTimeout(e,200)}).observe(document.body,{childList:!0,subtree:!0}),e()}function W(e,n=null){try{const o=localStorage.getItem(e);return o!==null?JSON.parse(o):n}catch{return n}}function Z(e,n){localStorage.setItem(e,JSON.stringify(n))}function Re(e,n){if(!n||n.replace(/\D/g,"").length<6)return;let o=W(e,[]);o=o.filter(a=>a!==n),o.unshift(n),Z(e,o.slice(0,10))}function ue(e,n){const o=document.getElementById(n);o&&(o.innerHTML=W(e,[]).map(a=>`<option value="${a}">`).join(""))}function Se(e){return e.toLocaleString("en-US")}function Ne(e){return Number(String(e).replace(/[^\d]/g,""))||0}function yt(e){return e.charAt(0).toUpperCase()+e.slice(1)}const ee=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function xt(e){let n=Math.floor(e/100),o=Math.floor(e%100/10),a=e%10,t="";return n>0&&(t+=ee[n]+" trăm ",o===0&&a>0&&(t+="lẻ ")),o>1?(t+=ee[o]+" mươi ",a===1?t+="mốt":a===5?t+="lăm":a>0&&(t+=ee[a])):o===1?(t+="mười ",a===5?t+="lăm":a>0&&(t+=ee[a])):a>0&&(n>0&&(t+="lẻ "),t+=ee[a]),t.trim()}function wt(e){if(e===0)return"không";const n=["","nghìn","triệu","tỷ"];let o="",a=0;for(;e>0;){const t=e%1e3;t>0&&(o=xt(t)+" "+n[a]+" "+o),e=Math.floor(e/1e3),a++}return o.trim()}function Fe(e,n,o){let a=0,t=0,c=0;e==="before"?(a=Ne(n),t=Math.round(a*o),c=a+t):e==="tax"?(t=Ne(n),a=Math.round(t/o),c=a+t):e==="after"&&(c=Ne(n),a=Math.round(c/(1+o)),t=c-a);const r=yt(wt(c))+" đồng";return{beforeNum:a,taxNum:t,afterNum:c,beforeStr:Se(a),taxStr:Se(t),afterStr:Se(c),textStr:r}}function Et(e,n){n.before&&n.before.forEach(o=>F(o,e.beforeStr)),n.tax&&n.tax.forEach(o=>F(o,e.taxStr)),n.after&&n.after.forEach(o=>F(o,e.afterStr)),n.text&&n.text.forEach(o=>F(o,e.textStr))}function fe(e,n=null){try{const o=localStorage.getItem(e);return o!==null?JSON.parse(o):n}catch{return n}}function O(e,n){localStorage.setItem(e,JSON.stringify(n))}function St(e,n,o,a){let t=fe(X)??"custom",c=fe(j)??{...P},r=fe(V)??{},s=fe(R)??{};const l=document.createElement("div");l.className="cw-tab-header";const p={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};p.custom.innerText="📋 Custom",p.custom.className="cw-tab cw-tab-custom",p.default.innerText="📌 Default",p.default.className="cw-tab cw-tab-default",p.sync.innerText="🔗 Sync",p.sync.className="cw-tab cw-tab-sync";function u(){Object.values(p).forEach(m=>m.classList.remove("active")),p[t].classList.add("active")}u();const d=document.createElement("div");d.style.display=a.data?"none":"block";const v=n("📋 Cấu hình Data","data",m=>{d.style.display=m?"none":"block",o(e)}),h=document.createElement("div");h.className="cw-data-body";function w(){h.innerHTML="";let m=t==="sync"?s:t==="custom"?r:c,k=t==="sync"?R:t==="custom"?V:j;const C=Object.keys(m);C.length===0&&t!=="default"&&(h.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),C.forEach(N=>{const $=document.createElement("div");$.className="cw-data-row";let ge=t!=="default";const M=m[N],me=M&&typeof M=="object"&&M.hasOwnProperty("value"),Pe=me?M.value:M,Ce=me&&M.label||N,A=document.createElement("input");A.type="text",A.value=Ce,A.className="cw-data-key"+(ge?" mutable":""),A.title=N,A.readOnly=!ge,ge&&(A.onchange=()=>{const I=A.value.trim();if(!I||I===N){A.value=Ce;return}me?m[I]={...M,label:I}:m[I]=Pe,delete m[N],O(k,m),w()});const K=document.createElement("input");if(K.type="text",K.value=Pe??"",K.className="cw-data-val",K.oninput=()=>{me?m[N]={...M,value:K.value}:m[N]=K.value,O(k,m)},$.appendChild(A),$.appendChild(K),ge){const I=document.createElement("button");I.innerHTML="✕",I.className="cw-del-btn",I.onclick=()=>{confirm(`Delete "${Ce}"?`)&&(delete m[N],O(k,m),w())},$.appendChild(I)}else $.appendChild(document.createElement("div")).className="cw-pad";h.appendChild($)})}p.custom.onclick=()=>{t="custom",O(X,"custom"),u(),w()},p.default.onclick=()=>{t="default",O(X,"default"),u(),w()},p.sync.onclick=()=>{t="sync",O(X,"sync"),u(),w()};const y=document.createElement("button");y.innerText="📤",y.className="cw-icon-btn",y.onclick=()=>{const m=new Blob([JSON.stringify({defaultData:c,customData:r,syncData:s},null,2)],{type:"application/json"}),k=URL.createObjectURL(m),C=document.createElement("a");C.href=k,C.download=`vnpt_data_${Date.now()}.json`,C.click(),URL.revokeObjectURL(k)},d.appendChild(l),l.appendChild(p.custom),l.appendChild(p.default),l.appendChild(p.sync),d.appendChild(h),e.appendChild(v),e.appendChild(d);const f=e.querySelector("#vnpt-cw-fill"),b=e.querySelector("#vnpt-cw-sync"),g=e.querySelector("#vnpt-cw-add"),x=e.querySelector("#vnpt-cw-reset");f&&(f.onclick=Ae),b&&(b.onclick=it),g&&(g.onclick=()=>{t==="default"&&(t="custom",O(X,"custom"),u());let m=t==="sync"?s:r,k="new_field_"+Date.now();m[k]="",O(t==="sync"?R:V,m),w(),h.scrollTop=h.scrollHeight}),x&&(x.onclick=()=>{confirm("Reset Default Data?")&&(c={...P},O(j,c),w())}),w();const E=v.querySelector(".cw-right-wrap")||document.createElement("div");E.className="cw-right-wrap",E.prepend(y),v.appendChild(E)}function Nt(e,n,o){let a=Number(localStorage.getItem(ie))||.08,t=W(le)??{calc:!1,data:!0},c=W(re)??{};function r(f,b){const g=document.createElement("button");return g.innerText=f,g.className="cw-action-btn "+b,g}function s(f,b,g){const x=document.createElement("div");x.className="wg-sec-header";const E=document.createElement("span");E.innerText=f;const m=document.createElement("button");return m.className="wg-toggle-btn",m.innerText=t[b]?"▾":"▴",x.appendChild(E),x.appendChild(m),m.onclick=()=>{t[b]=!t[b],m.innerText=t[b]?"▾":"▴",Z(le,t),g(t[b])},x}function l(f){const b=window.innerWidth,g=window.innerHeight,x=f.getBoundingClientRect();f.style.left=Math.min(Math.max(parseFloat(f.style.left),0),b-x.width)+"px",f.style.top=Math.min(Math.max(parseFloat(f.style.top),0),g-36)+"px"}const p=document.createElement("div");if(!n){p.className="cw-title-bar",p.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const f=document.createElement("div");f.className="cw-btn-group";const b={fill:r("Fill","cw-btn-fill"),sync:r("Sync","cw-btn-sync"),add:r("Add","cw-btn-add"),reset:r("↺","cw-btn-reset")};b.reset.title="Reset Default fields",Object.values(b).forEach(g=>f.appendChild(g)),p.appendChild(f),e.appendChild(p)}const u=document.createElement("div");u.className="cw-body-inline",u.innerHTML=`
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
    </div>`,n?n.appendChild(u):e.appendChild(u),n||St(e,s,l,t);const d={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text"),mapBtn:document.getElementById("wg-calc-map-btn"),mapWrap:document.getElementById("wg-calc-map-wrap")};d.taxRate.value=a*100,ue(ve,"wg-before-list"),ue(ye,"wg-after-list");function v(f,b){const g=Fe(f,b,a);d.before.value=g.beforeStr,d.tax.value=g.taxStr,d.after.value=g.afterStr,d.text.value=g.textStr,Et(g,c)}d.taxRate.oninput=()=>{a=Number(d.taxRate.value)/100||0,Z(ie,a),v("before",d.before.value)},d.before.oninput=()=>{const f=Fe("before",d.before.value,a);d.tax.value=f.taxStr,d.after.value=f.afterStr,d.text.value=f.textStr},d.before.onchange=()=>{v("before",d.before.value),Re(ve,d.before.value),ue(ve,"wg-before-list")},d.tax.oninput=()=>v("tax",d.tax.value),d.after.oninput=()=>v("after",d.after.value),d.after.onchange=()=>{v("after",d.after.value),Re(ye,d.after.value),ue(ye,"wg-after-list")},[d.before,d.tax,d.after,d.text].forEach(f=>{["click","focus"].forEach(b=>f.addEventListener(b,()=>{if(!f.value)return;navigator.clipboard.writeText(f.value);const g=f.style.backgroundColor;f.style.backgroundColor="#d1e7dd",setTimeout(()=>f.style.backgroundColor=g,300)}))}),d.mapBtn.onclick=()=>{const f=d.mapWrap.style.display==="flex";if(d.mapWrap.style.display=f?"none":"flex",!f){const b=g=>{!d.mapWrap.contains(g.target)&&g.target!==d.mapBtn&&(d.mapWrap.style.display="none",document.removeEventListener("click",b))};setTimeout(()=>document.addEventListener("click",b),0)}},e.querySelectorAll("input[data-clink]").forEach(f=>{const b=f.dataset.clink;f.value=(c[b]||[]).join(", "),f.oninput=()=>{c[b]=f.value.split(",").map(g=>g.trim()).filter(g=>g),Z(re,c)}});const h=document.getElementById("vnpt-btn-import"),w=document.getElementById("vnpt-btn-export-json"),y=document.getElementById("vnpt-btn-reset-default");if(h&&(h.onclick=f=>{pt(),d.mapWrap.style.display="none"}),w&&(w.onclick=f=>{dt(),d.mapWrap.style.display="none"}),y&&(y.onclick,y.addEventListener("click",()=>{d.mapWrap.style.display="none"})),!n){const f=Array.from(e.children).filter(x=>x!==p),b=_e(e,[p],o,null,x=>{f.forEach(E=>E.style.display=x?"none":""),p.style.borderRadius=x?"8px":"0",x&&(e.style.top=window.innerHeight-(p.offsetHeight||34)+"px")}),g=W(o);return g&&g.docked&&b.setDocked(!0),window.addEventListener("resize",()=>{b.isDocked()?e.style.top=window.innerHeight-p.offsetHeight+"px":l(e)}),b}return null}function kt(){const e=document.getElementById("vnpt-inline-calc"),n=document.getElementById("vnpt-btn-calc-toggle");let o=i.calcWidget||document.createElement("div");if(!e&&!i.calcWidget?(o.id="vnpt-calc-widget",document.body.appendChild(o),i.calcWidget=o):e&&(o=i.widget),e&&n){let a=W(le)??{calc:!1,data:!0};const t=c=>{e.style.display=c?"none":"block",n.classList.toggle("active",!c)};t(a.calc),n.onclick=()=>{a.calc=!a.calc,Z(le,a),t(a.calc)}}return Nt(o,e,je)}let te=null;function ke(){if(!window.__vnptInited){window.__vnptInited=!0,q.info("Initializing VNPT Userscript...");try{Ke(),ut(),kt(),ft(),ct(),Ee(),gt(),mt(),vt(),st();const e=Oe(()=>{et(),q.debug("DOM Cache cleared due to mutations")},500);te=new MutationObserver(n=>{n.some(o=>o.addedNodes.length>0||o.removedNodes.length>0)&&e()}),te.observe(document.body,{childList:!0,subtree:!0}),q.info("Userscript initialized successfully.")}catch(e){q.error("Error during userscript initialization:",e)}}}function Ct(){q.info("Cleaning up VNPT Userscript for reload..."),te&&(te.disconnect(),te=null);const e=document.getElementById("vnpt-docx-widget");e&&e.remove();const n=document.getElementById("vnpt-calc-widget");n&&n.remove();const o=document.getElementById("vnpt-styles");o&&o.remove(),window.__vnptInited=!1,q.info("Cleanup completed.")}window.__vnptCleanup=Ct,window.__vnptInit=ke,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",ke):ke()})();
