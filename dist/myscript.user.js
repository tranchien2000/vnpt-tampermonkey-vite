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
(function(){"use strict";const re={info:(...e)=>console.log("[Tampermonkey Script] INFO:",...e),error:(...e)=>console.error("[Tampermonkey Script] ERROR:",...e),warn:(...e)=>console.warn("[Tampermonkey Script] WARN:",...e)};function He(){GM_addStyle(`
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
            resize: both; overflow: hidden; 
            display: flex; flex-direction: column; 
            background: #ffffff; border: 1px solid #dadce0; 
            border-radius: 10px; padding: 10px; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.25); 
            transition: none; 
        }
        #vnpt-export-panel::after {
            content: "";
            position: absolute;
            bottom: 0;
            right: 0;
            width: 15px;
            height: 15px;
            cursor: nwse-resize;
            background: linear-gradient(135deg, transparent 50%, #ccc 50%, #ccc 60%, transparent 60%, transparent 70%, #ccc 70%, #ccc 80%, transparent 80%);
            pointer-events: none; /* Let the native resize handle receive clicks */
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
        #vnpt-fields-container { flex: 1; max-height: unset; overflow-y: auto; background: #f8f9fa; border: 1px solid #dadce0; border-radius: 6px; padding: 4px; margin-bottom: 4px; position: relative; }
        
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

        .vnpt-field-row { display: flex; gap: 2px; margin-bottom: 2px; align-items: center; }
        .row-drag-handle { cursor: grab; padding: 0 4px; font-size: 16px; font-weight: bold; color: #aaa; user-select: none; }
        .row-drag-handle:active { cursor: grabbing; }
        .vnpt-field-row.dragging { opacity: 0.4; }
        .vnpt-field-row.over { background-color: #e3f2fd; border-radius: 4px; }
        .vnpt-field-row input { flex: 1; padding: 5px; border: 1px solid #ccc; border-radius: 4px; font-size: 11px; }
        .vnpt-field-row input.row-chk { flex: 0 0 auto; width: auto; height: auto; margin: 0 4px 0 0; padding: 0; cursor: pointer; }
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

        .btn-scan { background: #fbbc04; color: #000; } .btn-scan:hover { background: #f2a500; }
        .btn-toggle-id { background: #e8f0fe; color: #1a73e8; } .btn-toggle-id:hover { background: #d2e3fc; }
        .btn-default-toggle { background: #e6f4ea; color: #1e8e3e; font-size: 14px; border: 1px solid transparent; } 
        .btn-default-toggle:hover { background: #ceead6; }
        .btn-default-toggle.active { background: #1e8e3e; color: #fff; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2); border-color: #155e2a;}
        .btn-add { background: #f1f3f4; color: #3c4043; } .btn-add:hover { background: #e8eaed; }
        .btn-fill-back { background: #ab47bc; color: #fff; } .btn-fill-back:hover { background: #8e24aa; }
        .btn-clean { background: #ea4335; color: #fff; } .btn-clean:hover { background: #d93025; }
        .btn-export { background: #1a73e8; color: white; padding: 4px 10px; font-size: 11px; font-weight: bold;} .btn-export:hover { background: #1557b0; }

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
           SECTION 6: CALC WIDGET (TITLE, CALC, DATA)
           ═══════════════════════════════════════════ */
        /* Calc Widget */
        #vnpt-calc-widget { position: fixed; z-index: 99999; width: 232px; font-family: 'Segoe UI', sans-serif; font-size: 13px; border-radius: 10px; box-shadow: 0 4px 24px rgba(0,0,0,.3); overflow: hidden; user-select: none; background: #fff; transition: box-shadow 0.2s; }
        .cw-title-bar { display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: #198754; color: #fff; cursor: grab; gap: 4px; }
        .cw-title-label { font-size: 12px; font-weight: 700; user-select: none; display: flex; align-items: center; gap: 5px; }
        .cw-btn-group { display: flex; gap: 4px; align-items: center; }
        .cw-action-btn { padding: 3px 7px; border: none; border-radius: 4px; cursor: pointer; font-size: 10px; font-weight: 1000; }
        .cw-action-btn:hover { filter: brightness(0.88); }
        .cw-btn-fill { background: #fff; color: #0d6efd; }
        .cw-btn-sync { background: #ffc107; color: #000; }
        .cw-btn-add { background: rgba(255,255,255,0.25); color: #fff; }
        .cw-btn-reset { background: rgba(255,255,255,0.25); color: #fff; }

        /* Inline Calculator Classes */
        .cw-body-inline { padding: 4px 6px; background: #f1f8ff; border-bottom: 2px solid #1a73e8; border-top: 2px solid #1a73e8; display: block; margin: 0 -10px; }
        .cw-inline-row { display: flex; align-items: center; gap: 4px; flex-wrap: nowrap; width: 100%; box-sizing: border-box;}
        .cw-input-inline { flex: 1; min-width: 50px; border: 1px solid #b6d4fe; border-radius: 4px; padding: 3px 5px; font-size: 11px; outline: none; cursor: pointer;}
        .cw-input-inline:hover { background-color: #e9ecef; }
        .cw-input-readonly-inline { background: #e9ecef; font-weight: 600; color: #084298; cursor: pointer; border: 1px solid #a3bced;}
        
        .cw-tax-group-inline { display: flex; align-items: center; width: auto; flex-shrink: 0; }
        .cw-tax-input-inline { width: 18px; border: 1px solid #b6d4fe; border-radius: 3px; padding: 2px 1px; font-size: 10px; text-align: center; margin-right: 2px; }
        .cw-tax-symbol { font-size: 10px; color: #555; font-weight: 600; }

        .cw-map-dropdown-container { position: relative; display: inline-block; flex-shrink: 0;}
        .cw-map-btn-inline { background: none; border: none; cursor: pointer; font-size: 14px; padding: 2px; margin: 0; outline: none; transition: transform 0.2s;}
        .cw-map-btn-inline:hover { transform: scale(1.1); }
        .cw-map-wrap-popup { position: absolute; top: calc(100% + 4px); right: 0; width: 220px; z-index: 1000; padding: 8px; background: #fff; border-radius: 6px; border: 1px solid #d0d9ff; box-shadow: 0 4px 12px rgba(0,0,0,0.2); flex-direction: column; gap: 4px; }
        
        .cw-row { display: flex; align-items: center; gap: 4px; margin-bottom: 5px; }
        .cw-map-label { font-size: 10px; color: #555; width: 55px; }
        .cw-map-input { flex: 1; min-width: 0; border: 1px solid #ccc; border-radius: 3px; padding: 2px 4px; font-size: 10px; outline: none; }
        .cw-map-hint { font-size: 9px; color: #888; margin-top: 4px; line-height: 1.2; text-align: center;}

        .wg-toggle-btn { background: none; border: none; cursor: pointer; font-size: 12px; padding: 0 4px; }
        .wg-sec-header { display: flex; align-items: center; justify-content: space-between; padding: 5px 10px; background: #e9ecef; color: #495057; font-size: 11px; font-weight: 700; border-bottom: 1px solid #dee2e6; }

        /* Data Fill Widget */
        .cw-tab-header { display: flex; background: #f8f9fa; border-bottom: 1px solid #dee2e6; }
        .cw-tab { flex: 1; text-align: center; padding: 6px 0; font-size: 10px; font-weight: 700; cursor: pointer; user-select: none; color: #6c757d; border-bottom: 2px solid transparent; }
        .cw-tab-custom.active { color: #0d6efd; border-bottom: 2px solid #0d6efd; background: #fff; }
        .cw-tab-default.active { color: #198754; border-bottom: 2px solid #198754; background: #fff; }
        .cw-tab-sync.active { color: #ffc107; border-bottom: 2px solid #ffc107; background: #fff; }

        .cw-icon-btn { background: none; border: none; cursor: pointer; font-size: 13px; padding: 0 4px; line-height: 1; }
        .cw-right-wrap { display: flex; align-items: center; gap: 4px; }
        .cw-data-body { background: #fff; max-height: 35vh; overflow-y: auto; }

        .cw-data-empty { padding: 15px; text-align: center; color: #888; font-size: 11px; }
        .cw-data-row { display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-bottom: 1px solid #f0f0f0; }
        
        .cw-data-key { font-size: 10px; color: #0d6efd; font-weight: 600; width: 85px; min-width: 85px; border: none; background: transparent; border-radius: 3px; padding: 2px 4px; outline: none; }
        .cw-data-key.mutable { color: #084298; border: 1px solid #cce5ff; background: #f8fbff; }
        .cw-data-key.mutable:focus { border-color: #86b7fe; }
        
        .cw-data-val { flex: 1; border: 1px solid #dee2e6; border-radius: 4px; padding: 3px 5px; font-size: 11px; min-width: 0; outline: none; }
        .cw-data-val:focus { border-color: #0d6efd; }
        
        .cw-del-btn { background: none; border: none; color: #dc3545; cursor: pointer; font-size: 11px; padding: 0 2px; line-height: 1; flex-shrink: 0; }
        .cw-pad { width: 13px; }
        .cw-data-hint { font-size: 10px; color: #aaa; text-align: center; padding: 5px 8px; }
    `)}const c={widget:null,panel:null,header:null,toggleBtn:null,fieldsContainer:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1},C={tenDaiDienn:"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT",emailDaiDien:"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Số GPKD | MST",goiDV:"Gói Dịch Vụ",ngayKy:"Ngày ký",thangKy:"Tháng Ký",namKy:"Năm ký",soHopDong:"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký"},xe="vnpt_docx_fields",ye="vnpt_docx_position",ve="vnpt_docx_size",le="vnpt_docx_opened",K="vnpt_autofill_data_default",R="vnpt_autofill_data_custom",M="vnpt_autofill_data_sync",Oe="vnpt_widget_pos",we="vnd_tax_rate",ce="vnd_before_history",se="vnd_after_history",Ee="vnpt_widget_collapsed",ke="vnd_calc_map",P="vnpt_widget_datatab",Se="vnpt_templates";function E(e,n="#198754"){const t=document.createElement("div");t.innerText=e,Object.assign(t.style,{position:"fixed",bottom:"20px",left:"50%",transform:"translateX(-50%)",background:n,color:"#fff",padding:"7px 16px",borderRadius:"20px",zIndex:"100000",opacity:"0",transition:"opacity .25s",fontSize:"13px",fontFamily:"'Segoe UI',sans-serif",boxShadow:"0 4px 14px rgba(0,0,0,.25)"}),document.body.appendChild(t),setTimeout(()=>t.style.opacity="1",30),setTimeout(()=>{t.style.opacity="0",setTimeout(()=>t.remove(),280)},2200)}const Me={local:{download(e,n="arraybuffer"){return new Promise((t,o)=>{const a=new FileReader;switch(a.onload=l=>{let r=l.target.result;n==="base64"&&typeof r=="string"&&(r=r.split(",")[1]||r),t(r)},a.onerror=l=>o(l),n.toLowerCase()){case"arraybuffer":a.readAsArrayBuffer(e);break;case"base64":case"dataurl":a.readAsDataURL(e);break;case"text":a.readAsText(e);break;default:o(new Error(`Unsupported read type: ${n}`))}})},async upload(e){return this.download(e,"base64")}}},_e={getAdapter(e){const n=Me[e];if(!n)throw new Error(`Storage adapter not found: ${e}`);return n},async upload(e,n,t={}){return await this.getAdapter(e).upload(n,t)},async download(e,n,t={}){return await this.getAdapter(e).download(n,t.type||"arraybuffer")}},ze="vnpt_templates_db",I="buffers";let J=null;function de(){return J?Promise.resolve(J):new Promise((e,n)=>{const t=indexedDB.open(ze,1);t.onupgradeneeded=o=>{const a=o.target.result;a.objectStoreNames.contains(I)||a.createObjectStore(I)},t.onsuccess=o=>{J=o.target.result,e(J)},t.onerror=()=>n(t.error)})}async function Fe(e,n){const t=await de();return new Promise((o,a)=>{const s=t.transaction(I,"readwrite").objectStore(I).put(n,e);s.onsuccess=()=>o(),s.onerror=()=>a(s.error)})}async function Ke(e){const n=await de();return new Promise((t,o)=>{const r=n.transaction(I,"readonly").objectStore(I).get(e);r.onsuccess=()=>t(r.result),r.onerror=()=>o(r.error)})}async function Re(e){const n=await de();return new Promise((t,o)=>{const r=n.transaction(I,"readwrite").objectStore(I).delete(e);r.onsuccess=()=>t(),r.onerror=()=>o(r.error)})}function $(){try{const e=JSON.parse(localStorage.getItem(Se))||[],n=e.filter(t=>t.type!=="local");return n.length!==e.length&&W(n),n}catch{return[]}}function W(e){localStorage.setItem(Se,JSON.stringify(e))}function Pe(e){const n=e.match(/drive\.google\.com\/file\/d\/([^/]+)/);return n?`https://drive.google.com/uc?export=download&id=${n[1]}`:e}function Ve(e){return new Promise((n,t)=>{GM_xmlhttpRequest({method:"GET",url:Pe(e),responseType:"arraybuffer",onload:o=>{if(o.status>=200&&o.status<300){if(o.response&&o.response.byteLength>4){const a=new Uint8Array(o.response.slice(0,4));if(a[0]===80&&a[1]===75&&a[2]===3&&a[3]===4){n(o.response);return}else{t(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}n(o.response)}else t(new Error(`HTTP ${o.status}: Không lấy được file`))},onerror:()=>t(new Error("Không thể tải URL.")),ontimeout:()=>t(new Error("Timeout khi tải URL."))})})}async function qe(e,n,t){const o=e.name.replace(/\.docx$/i,""),a=prompt("Đặt tên biến nhớ cho file này:",o);if(!(!a||!a.trim()))try{const l=await e.arrayBuffer();await Fe(a.trim(),l);const s=$().filter(i=>i.name!==a.trim()&&i.fileName!==e.name);s.unshift({name:a.trim(),type:"local_idb",fileName:e.name,lastUsed:Date.now()}),W(s),_(n,t),t&&t(l,a.trim())}catch(l){E(`❌ Lỗi lưu file: ${l.message}`,"#dc3545")}}function _(e,n,t=null){let o=e.querySelector(".vnpt-template-manager-inner"),a,l;if(o)a=o.querySelector(".vnpt-local-list-container"),l=o.querySelector(".vnpt-btn-wrap");else{e.innerHTML="",o=document.createElement("div"),o.className="vnpt-template-manager-inner";const i=document.createElement("div");i.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const d=document.createElement("span");d.className="vnpt-title-main",d.style.cssText="font-size:11px;font-weight:700;color:#444;",l=document.createElement("div"),l.className="vnpt-btn-wrap",l.style.cssText="display:flex;gap:4px;",i.appendChild(d),i.appendChild(l),o.appendChild(i),a=document.createElement("div"),a.className="vnpt-local-list-container",a.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",o.appendChild(a),e.appendChild(o)}const r=$(),s=o.querySelector(".vnpt-title-main");s.innerHTML="📁 Bộ nhớ Templates"+(t?` <span style="color:#2e7d32;">(Đang dùng: ${t})</span>`:""),r.length===0?a.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':a.innerHTML="",r.forEach((i,d)=>{const g=document.createElement("div");g.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",g.title=i.fileName||i.url||i.name,g.tabIndex=0,g.onfocus=()=>g.style.boxShadow="0 0 0 2px #28a745",g.onblur=()=>g.style.boxShadow="none";const m=i.type==="local"||i.type==="local_base64"||i.type==="local_idb"?"OFF":"ON",u=m==="OFF"?"#6c757d":"#28a745",p=document.createElement("span");p.textContent=m,p.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${u};color:#fff;`;const h=document.createElement("span");h.textContent=i.name,h.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",g.onclick=()=>{g.focus(),Ue(i,n,t,e)},g.appendChild(p),g.appendChild(h);const v=document.createElement("button");v.innerHTML="✎",v.title="Đổi tên template",v.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",v.onclick=D=>{D.stopPropagation();const f=prompt("Đổi tên template:",i.name);if(f&&f.trim()&&f.trim()!==i.name){const x=$();x[d].name=f.trim(),W(x),_(e,n,t)}},g.appendChild(v);const k=document.createElement("button");k.innerHTML="✕",k.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",k.onclick=async D=>{if(D.stopPropagation(),confirm(`Xoá biểu mẫu "${i.name}"?`)){const f=$();f.splice(d,1),W(f),i.type==="local_idb"&&await Re(i.name).catch(()=>null),_(e,n,t===i.name?null:t)}},g.appendChild(k),a.appendChild(g)})}function Ue(e,n,t,o){const a=$(),l=a.find(r=>r.name===e.name&&(r.url===e.url||r.type===e.type));if(l&&(l.lastUsed=Date.now(),W(a)),e.type==="local_idb"){Ke(e.name).then(r=>{if(!r)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");n&&n(r,e.name),_(o,n,e.name)}).catch(r=>{E(`❌ Lỗi nạp File IDB: ${r.message}`,"#dc3545")});return}if(e.type==="local_base64"&&e.data){try{const r=window.atob(e.data.split(",")[1]),s=r.length,i=new Uint8Array(s);for(let d=0;d<s;d++)i[d]=r.charCodeAt(d);n&&n(i.buffer,e.name),_(o,n,e.name)}catch(r){E(`❌ Lỗi nạp Base64: ${r.message}`,"#dc3545")}return}Ve(e.url).then(r=>{n&&n(r,e.name),_(o,n,e.name)}).catch(r=>{E(`❌ ${r.message}`,"#dc3545")})}function je(e){e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function G(e,n){var a;if(!e||e.disabled||e.readOnly)return;const t=e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,o=(a=Object.getOwnPropertyDescriptor(t,"value"))==null?void 0:a.set;o?o.call(e,n):e.value=n,je(e)}function V(e){const n=document.getElementById(e);if(n&&(n.tagName==="INPUT"||n.tagName==="TEXTAREA"))return n;for(const t of document.querySelectorAll("label"))if(t.textContent.trim()===e){if(t.htmlFor){const a=document.getElementById(t.htmlFor);if(a)return a}let o=t.parentElement;for(;o;){const a=o.querySelector("input,textarea");if(a)return a;if(o=o.parentElement,(o==null?void 0:o.tagName)==="FORM")break}}return null}function q(e){for(const n of document.querySelectorAll("label"))if(n.innerText.trim()===e)return n.parentElement.querySelector("input, textarea");return null}function N(e,n){const t=V(e)||q(e);t&&G(t,n)}const pe=new Date,ue=String(pe.getDate()).padStart(2,"0"),Q=String(pe.getMonth()+1).padStart(2,"0"),Z=String(pe.getFullYear()),z={ngayKy:ue,thangKy:Q,namKy:Z,ngayTiepNhan:`${ue}/${Q}/${Z}`,ngayThangNamKy:`${ue}/${Q}/${Z}`,thangKy1:Q,namKy1:Z,tenDoanhNghiepB:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM",diaChiB:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội",maSoThueB:"0100686223",stkB:"1600114156",diaChiStkB:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)",tenB:"Phạm Khánh Chung",nguoiDaiDienB:"Phạm Khánh Chung",chucVuB:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",chucVuDaiDienB:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",giayUyQuyenSoB:"2628/GUQ-VNPT-HNI-VP",soGiayUyQuyenB:"2628/GUQ-VNPT-HNI-VP",giayUyQuyenNgayB:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",ngayGiayUyQuyenB:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",GiayUyQuyenB:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",tenDoanhNghiepB1:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",donViTiepNhan:"TTKD KHDN",tenTiepNhan:"Bùi Anh",tenNguoiNhan:"Bùi Anh",dienThoaiB:"02436686868",diaChiTaiKhoanB:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 ",noiKy:"Hà Nội",emailB:"",lienheHopDongB:"AM Bùi Anh",lienheTuVanB:"AM Bùi Anh",lienheHoaDonB:"AM Bùi Anh",sucoCap1B:"AM Bùi Anh",sucoCap2B:"AM Bùi Anh",sucoCap3B:"AM Bùi Anh",sucoCap4B:"AM Bùi Anh"},ee=["lienheHopDongA","lienheHoaDonA","lienheTuVanA","sucoCap1A","sucoCap2A","sucoCap3A","sucoCap4A"];function F(e,n=null){try{const t=localStorage.getItem(e);return t!==null?JSON.parse(t):n}catch{return n}}let Te=F(K)??{...z},Ce=F(R)??{};F(M),F(P);function $e(){Te=F(K)??{...z},Ce=F(R)??{};const e={...Te,...Ce};let n="";for(let t of ee){const o=V(t)||q(t);if(o&&o.value){n=o.value;break}}n&&ee.forEach(t=>N(t,n)),Object.keys(e).forEach(t=>{let o=V(t)||q(t);o&&G(o,e[t])}),E("✅ Auto fill complete")}let fe=!1;document.addEventListener("input",e=>{var s,i,d;if(fe||!e.target||!["INPUT","TEXTAREA"].includes(e.target.tagName))return;let n=F(M)??{};if(Object.keys(n).length===0)return;let t=e.target.id,o=e.target.name,a=null,l=null;if(t){const g=document.querySelector(`label[for="${t}"]`);g&&(a=g.textContent.trim(),l=(s=g.innerText)==null?void 0:s.trim())}if(!a){const g=e.target.closest("label");g&&(a=(i=Array.from(g.childNodes).find(m=>m.nodeType===3))==null?void 0:i.textContent.trim(),l=(d=g.innerText)==null?void 0:d.trim())}let r=n[t]||n[o]||n[a]||n[l];if(r){fe=!0;try{const g=e.target.value;r.split(",").map(u=>u.trim()).filter(u=>u).forEach(u=>{u!==t&&u!==o&&u!==a&&u!==l&&N(u,g)})}finally{fe=!1}}});function L(e,n,t=null,o=""){const a=c.fieldsContainer.querySelector(".text-hint");a&&a.remove();const l=c.fieldsContainer.querySelectorAll(".f-key");let r=!1;for(let s of l)if(s.value.split(",")[0].trim()===e){const d=s.closest(".vnpt-field-row"),g=d.querySelector(".f-val"),m=d.querySelector(".f-label");n!==""&&(g.value=n),t!==null&&t!==""&&(m.value=t),o!==""&&(s.value.split(",").slice(1).map(u=>u.trim()).join(", "),s.value=e+", "+o),r=!0;break}if(!r){(t===null||t==="")&&(t=C[e]||"");const s=document.createElement("div");s.className="vnpt-field-row row-item",s.setAttribute("draggable","false");let i=e;o&&(i+=", "+o),s.innerHTML=`
            <input type="checkbox" class="row-chk" title="Chọn để thao tác hàng loạt" style="margin: 0 2px 0 2px;" />
            <input type="text" class="f-label" placeholder="Nhãn..." value="${t}" />
            <input type="text" class="f-key" placeholder="Mã biến / IDs đồng bộ" value="${i}" title="Biến DOCX (đầu tiên), theo sau là các ID web cách dấu phẩy" />
            <span class="row-drag-handle" title="Kéo thả để di chuyển">=</span>
            <input type="text" class="f-val" placeholder="Giá trị" value="${n}" />
        `;const d=s.querySelector(".f-val"),g=s.querySelector(".f-key");e==="tenToChuc"&&(d.style.textAlign="right"),g.addEventListener("keyup",function(){B();const u=this.value.split(",")[0].trim();d.style.textAlign=u==="tenToChuc"?"right":""}),s.querySelector(".f-label").addEventListener("keyup",B),d.addEventListener("keyup",function(){if(c.isDefaultMode&&!this.dataset.warned){if(!confirm("⚠️ Bạn đang chỉnh sửa dữ liệu mặc định. Thay đổi này sẽ không được lưu vào cấu hình cá nhân. Tiếp tục?")){ge();return}this.dataset.warned="true"}B();const p=g.value.split(",").map(h=>h.trim()).filter(h=>h);p.length>0&&p.forEach(h=>N(h,this.value))}),d.addEventListener("focus",function(){c.isDefaultMode&&this.dataset.warned});const m=s.querySelector(".row-drag-handle");m.addEventListener("mouseenter",()=>s.setAttribute("draggable","true")),m.addEventListener("mouseleave",()=>{s.classList.contains("dragging")||s.setAttribute("draggable","false")}),s.addEventListener("dragstart",function(u){c.draggedRowForVNPT=this,u.dataTransfer.effectAllowed="move",u.dataTransfer.setData("text/plain",e),this.classList.add("dragging")}),s.addEventListener("dragover",function(u){return u.preventDefault(),u.dataTransfer.dropEffect="move",!1}),s.addEventListener("dragenter",function(u){this.classList.add("over")}),s.addEventListener("dragleave",function(u){this.classList.remove("over")}),s.addEventListener("drop",function(u){if(u.stopPropagation(),c.draggedRowForVNPT&&c.draggedRowForVNPT!==this){const p=Array.from(c.fieldsContainer.querySelectorAll(".vnpt-field-row")),h=p.indexOf(c.draggedRowForVNPT),v=p.indexOf(this);h<v?this.parentNode.insertBefore(c.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(c.draggedRowForVNPT,this),B()}return!1}),s.addEventListener("dragend",function(u){this.setAttribute("draggable","false"),c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(h=>{h.classList.remove("over"),h.classList.remove("dragging")}),c.draggedRowForVNPT=null}),c.fieldsContainer.appendChild(s),c.fieldsContainer.scrollTop=c.fieldsContainer.scrollHeight}}async function B(){if(c.isDefaultMode)return;const e={};c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(t=>{const a=t.querySelector(".f-key").value.trim().split(",").map(d=>d.trim()).filter(d=>d),l=a[0],r=a.slice(1).join(", "),s=t.querySelector(".f-label").value.trim(),i=t.querySelector(".f-val").value;l&&(e[l]={label:s,value:i,sync:r})}),localStorage.setItem(xe,JSON.stringify(e))}async function ge(){try{c.fieldsContainer.innerHTML="";const e=JSON.parse(localStorage.getItem(xe))||{};Object.keys(C).forEach(n=>{const t=C[n],o=e[n];o&&typeof o=="object"?L(n,o.value,o.label||t,o.sync||""):o?L(n,o,t,""):L(n,"",t,"")}),Object.keys(e).forEach(n=>{if(!(n in C)){const t=e[n];typeof t=="object"?L(n,t.value,t.label,t.sync||""):L(n,t,"","")}}),Object.keys(C).length===0&&Object.keys(e).length===0&&(c.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(e){console.error("Error loading config:",e),Object.keys(C).forEach(n=>{L(n,"",C[n])})}try{const e=JSON.parse(localStorage.getItem(ye));e&&c.widget&&(c.widget.style.bottom="auto",e.right?(c.widget.style.right=e.right,c.widget.style.left="auto"):e.left&&(c.widget.style.left=e.left,c.widget.style.right="auto"),e.top&&(c.widget.style.top=e.top))}catch{}}function We(){document.getElementById("vnpt-btn-toggle-id").addEventListener("click",function(){c.fieldsContainer.classList.toggle("show-ids")}),document.getElementById("vnpt-btn-default").addEventListener("click",Ge),document.getElementById("vnpt-btn-batch-del").addEventListener("click",function(){if(c.isDefaultMode){E("⚠️ Không thể xóa ở chế độ Dữ liệu mặc định","#ffc107");return}const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row");let n=0;e.forEach(t=>{const o=t.querySelector(".row-chk");o&&o.checked&&(t.remove(),n++)}),n===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(e.forEach(t=>t.remove()),E("🗑️ Đã xóa toàn bộ","#ff5252"),B()):(E(`🗑️ Đã xóa ${n} trường`,"#ff5252"),B())}),document.getElementById("vnpt-btn-add").addEventListener("click",function(){if(c.isDefaultMode){E("⚠️ Không thể thêm ở chế độ Dữ liệu mặc định","#ffc107");return}const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;L("bien_moi_"+e,"","",""),B()}),document.getElementById("vnpt-btn-fill-back").addEventListener("click",function(){$e();const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row");let n=0;e.forEach(t=>{const o=t.querySelector(".f-key").value.trim(),a=t.querySelector(".f-val").value;o.split(",").map(r=>r.trim()).filter(Boolean).forEach(r=>{(document.getElementById(r)||document.getElementsByName(r)[0])&&(N(r,a),n++)})}),n>0?E(`✅ Đã điền ngược ${n} trường vào web`,"#198754"):E("⚠️ Không có trường nào khớp","#ffc107")})}function Ge(){c.isDefaultMode=!c.isDefaultMode;const e=document.getElementById("vnpt-btn-default");if(c.fieldsContainer.innerHTML="",c.bannerArea.innerHTML="",c.isDefaultMode){e.classList.add("active"),c.fieldsContainer.classList.add("vnpt-mode-default"),E("📌 Chế độ xem Dữ liệu mặc định","#ea4335");const n=document.createElement("div");n.className="vnpt-default-banner",n.innerHTML=`
            <span>📌 Đang xem Dữ liệu mặc định</span>
        `,c.bannerArea.appendChild(n),Object.keys(z).forEach(t=>{L(t,z[t],C[t]||"")})}else e.classList.remove("active"),c.fieldsContainer.classList.remove("vnpt-mode-default"),E("📋 Đã quay lại Dữ liệu cá nhân"),ge()}function Xe(){const e=document.createElement("div");e.id="vnpt-docx-widget";const n=localStorage.getItem(le)==="true";e.innerHTML=`
        <button id="vnpt-toggle-btn" title="Mở/Đóng UI Hợp đồng" class="${n?"btn-opened":"btn-closed"}">${n?"✖":"📄"}</button>

        <div id="vnpt-export-panel" style="display: ${n?"flex":"none"};">
            <div id="vnpt-panel-header" title="Kẹp chuột vào đây để di chuyển">
                <span id="vnpt-panel-title">Nhập|Xuất H.Đồng</span>
                <div class="btn-row" style="margin-bottom: 0; padding-right: 35px; gap: 4px;">
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-scan" title="Lấy data theo biểu mẫu web">Quét</button>
                    <button class="vnpt-btn-action btn-fill-back" id="vnpt-btn-fill-back" title="Điền dữ liệu ngược lên web">Điền Ngược</button>
                    <button class="vnpt-btn-action btn-default-toggle" id="vnpt-btn-default" title="Dữ liệu mặc định VNPT">📌</button>
                    <button class="vnpt-btn-action btn-toggle-id" id="vnpt-btn-toggle-id" title="Ẩn/Hiện Mã ID">ID</button>
                    <button class="vnpt-btn-action btn-add" id="vnpt-btn-add" title="Chèn thêm trường trống">➕</button>
                    <button class="vnpt-btn-action btn-clean" id="vnpt-btn-batch-del" title="Xóa chọn / Xóa tất cả">🗑️</button>
                </div>
            </div>

            <div id="vnpt-inline-calc"></div>

            <div id="vnpt-panel-body">
                <div id="vnpt-banner-area"></div>
                <div id="vnpt-fields-container">
                    <div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>
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
                        <input type="text" id="vnpt-export-filename" value="HopDong_Auto.docx" placeholder="Tên file HD xuất..." title="Tên file HD xuất" />
                    </div>
                    <button class="vnpt-btn-action btn-export" id="vnpt-btn-export" title="Xuất ra file DOCX">🖨️ XUẤT FILE</button>
                </div>
            </div>
        </div>
    `,document.body.appendChild(e),c.widget=e,c.panel=document.getElementById("vnpt-export-panel"),c.toggleBtn=document.getElementById("vnpt-toggle-btn"),c.header=document.getElementById("vnpt-panel-header"),c.bannerArea=document.getElementById("vnpt-banner-area"),c.fieldsContainer=document.getElementById("vnpt-fields-container");try{const o=JSON.parse(localStorage.getItem(ve));o&&o.width&&o.height&&(c.panel.style.width=o.width+"px",c.panel.style.height=o.height+"px")}catch(o){console.error("Lỗi load size panel:",o)}new ResizeObserver(o=>{if(c.panel.style.display!=="none")for(let a of o){const{width:l,height:r}=a.contentRect;l>0&&r>0&&localStorage.setItem(ve,JSON.stringify({width:Math.round(l+20),height:Math.round(r+20)}))}}).observe(c.panel),c.panelBody=document.getElementById("vnpt-panel-body"),_(document.getElementById("vnpt-template-manager"),(o,a)=>{c.templateBuffer=o,c.templateName=a}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const o=this.files&&this.files[0];if(!o)return;const a=document.getElementById("vnpt-template-manager");qe(o,a,(l,r)=>{c.templateBuffer=l,c.templateName=r}),this.value=""}),c.toggleBtn.addEventListener("click",o=>{c.hasDragged||(c.panel.style.display==="none"?(c.panel.style.display="flex",c.toggleBtn.className="btn-opened",c.toggleBtn.innerHTML="✖",localStorage.setItem(le,"true")):(c.panel.style.display="none",c.toggleBtn.className="btn-closed",c.toggleBtn.innerHTML="📄",localStorage.setItem(le,"false")))})}function Ne(e,n,t,o=null,a=null){let l=!1,r=0,s=0,i=!1;function d(m){i!==m&&(i=m,a&&a(m))}function g(m){if(m.button!==0)return;l=!0,c.hasDragged=!1;const u=e.getBoundingClientRect();r=m.clientX-u.left,s=m.clientY-u.top,document.body.style.userSelect="none",n&&n.forEach(p=>p.style.cursor="grabbing"),o&&o(),m.preventDefault()}return n.forEach(m=>{m.addEventListener("mousedown",g)}),document.addEventListener("mousemove",function(m){if(!l)return;c.hasDragged=!0;let u=m.clientX-r,p=m.clientY-s;const h=window.innerWidth,v=window.innerHeight,k=document.getElementById("vnpt-toggle-btn"),D=k?k.offsetWidth:40,f=k?k.offsetHeight:40,x=e.id==="vnpt-docx-widget";let b=e.offsetWidth||0;if(x){let w=D+6-b,S=h-b+6;u<w&&(u=w),u>S&&(u=S)}else b=b||200,u<0&&(u=0),u+b>h&&(u=Math.max(0,h-b));let y=i;if(x?y=!1:i?m.clientY<v-40&&(y=!1):m.clientY>v-10&&(y=!0),p<0&&(p=0),y)d(!0),e.style.top=v-e.offsetHeight+"px",x?(e.style.right=h-u-b+"px",e.style.left="auto"):(e.style.left=u+"px",e.style.right="auto"),e.style.bottom="auto";else{d(!1);let T=e.offsetHeight||40,w;if(x)w=10+f;else{const S=e.querySelector(".cw-title-bar");w=S?S.offsetHeight:T}p+w>v&&(p=Math.max(0,v-w)),e.style.top=p+"px",x?(e.style.right=h-u-b+"px",e.style.left="auto"):(e.style.left=u+"px",e.style.right="auto"),e.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(l&&(l=!1,document.body.style.userSelect="",n&&n.forEach(m=>m.style.cursor="grab"),t)){const m=e.id==="vnpt-docx-widget";localStorage.setItem(t,JSON.stringify({left:m?void 0:e.style.left,right:m?e.style.right:void 0,top:e.style.top,x:m?void 0:parseFloat(e.style.left),y:parseFloat(e.style.top),docked:i}))}}),{isDocked:()=>i,setDocked:d}}function Ye(){c.widget&&c.header&&c.toggleBtn&&(Ne(c.widget,[c.header,c.toggleBtn],ye),window.addEventListener("resize",()=>{const e=window.innerWidth,n=window.innerHeight,t=document.getElementById("vnpt-toggle-btn"),o=t?t.offsetWidth:40,a=t?t.offsetHeight:40;let l=c.widget.getBoundingClientRect(),r=l.left,s=l.top,i=c.widget.offsetWidth||0,g=o+6-i,m=e-i+6;r<g&&(r=g),r>m&&(r=m),s+10+a>n&&(s=Math.max(0,n-(10+a))),c.widget.style.right=e-r-i+"px",c.widget.style.top=s+"px"}))}function Le(e){const n=e.toLowerCase(),t=new Date;return{ngayky:String(t.getDate()).padStart(2,"0"),thangky:String(t.getMonth()+1).padStart(2,"0"),thangky1:String(t.getMonth()+1).padStart(2,"0"),namky:String(t.getFullYear()),namky1:String(t.getFullYear()),soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[n]||""}function Je(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){let e=0;Object.keys(C).forEach(n=>{var a;const t=document.getElementById(n);let o="";t&&(o=t.tagName.toLowerCase()==="select"?((a=t.options[t.selectedIndex])==null?void 0:a.text)||"":t.value,e++),o||(o=Le(n)),L(n,o,null)}),B(),e>0?(this.style.background="#34a853",this.style.color="#fff",this.innerText="Done",setTimeout(()=>{this.style.background="#fbbc04",this.style.color="#000",this.innerText="Quét"},1e3)):E("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(e){e.target&&e.target.id&&C[e.target.id]!==void 0&&(L(e.target.id,e.target.value,null),B())}),document.addEventListener("change",function(e){var n;if(e.target&&e.target.id&&C[e.target.id]!==void 0){let t=e.target.tagName.toLowerCase()==="select"?((n=e.target.options[e.target.selectedIndex])==null?void 0:n.text)||"":e.target.value;L(e.target.id,t,null),B()}})}function De(e,n,t){try{let o;try{o=new window.PizZip(e)}catch(i){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(i);return}const a=new window.docxtemplater(o,{paragraphLoop:!0,linebreaks:!0});a.render(n);const l=a.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),r=URL.createObjectURL(l),s=document.createElement("a");s.href=r,s.download=t,document.body.appendChild(s),s.click(),setTimeout(()=>{document.body.removeChild(s),URL.revokeObjectURL(r)},100)}catch(o){let a=o.message;o.properties&&o.properties.errors instanceof Array?a=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+o.properties.errors.map(r=>"- "+(r.properties.explanation||r.message)).join(`
`):a="Lỗi phần mềm Word sinh ra: "+a,alert(a),console.error("DocX Error:",o)}}function Qe(){const e=document.getElementById("vnpt-export-filename");e&&e.addEventListener("input",()=>{e.dataset.userEdited="1",e.value.trim()||(e.dataset.userEdited="0")});function n(){if(!e||e.dataset.userEdited==="1")return;let t="";if(c.fieldsContainer&&c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(i=>{const g=i.querySelector(".f-key").value.trim().split(",")[0].trim(),m=i.querySelector(".f-val").value.trim();g==="tenToChuc"&&(t=m)}),!t){const s=document.getElementById("tenToChuc");s&&(t=s.tagName.toLowerCase()==="textarea"||s.tagName.toLowerCase()==="input"?s.value.trim():s.innerText.trim())}function o(s){if(!s)return"";let i=s;return i=i.replace(/Tổng công ty/gi,""),i=i.replace(/Công ty/gi,""),i=i.replace(/\bCty\b/gi,""),i=i.replace(/Trách nhiệm hữu hạn/gi,""),i=i.replace(/\bTNHH\b/gi,""),i=i.replace(/Cổ phần/gi,""),i=i.replace(/\bCP\b/gi,""),i=i.replace(/Một thành viên/gi,""),i=i.replace(/\bMTV\b/gi,""),i=i.replace(/Chi nhánh/gi,""),i=i.replace(/Việt Nam/gi,"VN"),i=i.replace(/Viet Nam/gi,"VN"),i=i.replace(/\s+/g," ").trim(),i=i.replace(/^[-,\s]+|[-,\s]+$/g,""),i.length>50&&(i=i.substring(0,47)+"..."),i.replace(/[<>:"/\\|?*]/g,"")}let a=o(t),l=c.templateName?c.templateName.replace(/\.docx$/i,""):"",r=[];a&&r.push(a),l&&r.push(l),r.length>0?e.value=r.join(" - ")+".docx":e.value||(e.value="HopDong_Auto.docx")}setInterval(n,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const t={};if(c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(r=>{const i=r.querySelector(".f-key").value.trim().split(",")[0].trim(),d=r.querySelector(".f-val").value;i&&(t[i]=d)}),Object.keys(t).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}let a=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(a.toLowerCase().endsWith(".docx")||(a+=".docx"),c.templateBuffer){De(c.templateBuffer,t,a);return}const l=document.getElementById("vnpt-template-file");if(l.files&&l.files.length>0){_e.download("local",l.files[0],{type:"arraybuffer"}).then(r=>De(r,t,a)).catch(r=>alert(`Lỗi đọc file: ${r.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')})}const Ze=["chucVu","noiCap","noiCapSoDkdn","ngayky","thangky","namky","thangky1","namky1","noiKy"],et=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function tt(){function e(){Ze.forEach(o=>{const a=document.getElementById(o);a&&!a.dataset.filled&&(a.dataset.filled="1",G(a,Le(o)))}),et.forEach(o=>{const a=document.getElementById(o.src),l=document.getElementById(o.target);a&&l&&!a.dataset.bound&&(a.dataset.bound="1",a.addEventListener("input",()=>G(l,a.value)))})}let n;new MutationObserver(()=>{clearTimeout(n),n=setTimeout(e,200)}).observe(document.body,{childList:!0,subtree:!0}),e()}function X(e,n=null){try{const t=localStorage.getItem(e);return t!==null?JSON.parse(t):n}catch{return n}}function te(e,n){localStorage.setItem(e,JSON.stringify(n))}function Be(e,n){if(!n||n.replace(/\D/g,"").length<6)return;let t=X(e,[]);t=t.filter(o=>o!==n),t.unshift(n),te(e,t.slice(0,10))}function ne(e,n){const t=document.getElementById(n);t&&(t.innerHTML=X(e,[]).map(o=>`<option value="${o}">`).join(""))}function me(e){return e.toLocaleString("en-US")}function he(e){return Number(String(e).replace(/[^\d]/g,""))||0}function nt(e){return e.charAt(0).toUpperCase()+e.slice(1)}const Y=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function ot(e){let n=Math.floor(e/100),t=Math.floor(e%100/10),o=e%10,a="";return n>0&&(a+=Y[n]+" trăm ",t===0&&o>0&&(a+="lẻ ")),t>1?(a+=Y[t]+" mươi ",o===1?a+="mốt":o===5?a+="lăm":o>0&&(a+=Y[o])):t===1?(a+="mười ",o===5?a+="lăm":o>0&&(a+=Y[o])):o>0&&(n>0&&(a+="lẻ "),a+=Y[o]),a.trim()}function at(e){if(e===0)return"không";const n=["","nghìn","triệu","tỷ"];let t="",o=0;for(;e>0;){const a=e%1e3;a>0&&(t=ot(a)+" "+n[o]+" "+t),e=Math.floor(e/1e3),o++}return t.trim()}function Ae(e,n,t){let o=0,a=0,l=0;e==="before"?(o=he(n),a=Math.round(o*t),l=o+a):e==="tax"?(a=he(n),o=Math.round(a/t),l=o+a):e==="after"&&(l=he(n),o=Math.round(l/(1+t)),a=l-o);const r=nt(at(l))+" đồng";return{beforeNum:o,taxNum:a,afterNum:l,beforeStr:me(o),taxStr:me(a),afterStr:me(l),textStr:r}}function it(e,n){n.before&&n.before.forEach(t=>N(t,e.beforeStr)),n.tax&&n.tax.forEach(t=>N(t,e.taxStr)),n.after&&n.after.forEach(t=>N(t,e.afterStr)),n.text&&n.text.forEach(t=>N(t,e.textStr))}function oe(e,n=null){try{const t=localStorage.getItem(e);return t!==null?JSON.parse(t):n}catch{return n}}function rt(){const e=oe(K)??{...z},n=oe(R)??{},t={...e,...n};let o="";for(let a of ee){const l=V(a)||q(a);if(l&&l.value){o=l.value;break}}o&&ee.forEach(a=>N(a,o)),Object.keys(t).forEach(a=>{let l=V(a)||q(a);l&&G(l,t[a])}),E("✅ Auto fill complete")}function lt(){let e=oe(M)??{};const n=Object.keys(e);if(n.length===0){E("⚠️ No sync mapping","#ffc107");return}n.forEach(t=>{let o=V(t)||q(t);o&&o.value!==void 0&&o.value!==""&&e[t].split(",").map(l=>l.trim()).filter(l=>l).forEach(l=>N(l,o.value))}),E("✅ Sync form complete","#d39e00")}let be=!1;function ct(){document.addEventListener("input",e=>{var r;if(be||!e.target||!["INPUT","TEXTAREA"].includes(e.target.tagName))return;let n=oe(M)??{};if(Object.keys(n).length===0)return;let t=e.target.id,o=e.target.name,a=null;if(t){const s=document.querySelector(`label[for="${t}"]`);s&&(a=s.textContent.trim())}if(!a){const s=e.target.closest("label");s&&(a=(r=Array.from(s.childNodes).find(i=>i.nodeType===3))==null?void 0:r.textContent.trim())}let l=n[t]||n[o]||n[a];if(l){be=!0;try{const s=e.target.value;l.split(",").map(d=>d.trim()).filter(d=>d).forEach(d=>{d!==t&&d!==o&&d!==a&&N(d,s)})}finally{be=!1}}})}function ae(e,n=null){try{const t=localStorage.getItem(e);return t!==null?JSON.parse(t):n}catch{return n}}function A(e,n){localStorage.setItem(e,JSON.stringify(n))}function st(e,n,t,o){let a=ae(P)??"custom",l=ae(K)??{...z},r=ae(R)??{},s=ae(M)??{};const i=document.createElement("div");i.className="cw-tab-header";const d={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};d.custom.innerText="📋 Custom",d.custom.className="cw-tab cw-tab-custom",d.default.innerText="📌 Default",d.default.className="cw-tab cw-tab-default",d.sync.innerText="🔗 Sync",d.sync.className="cw-tab cw-tab-sync";function g(){Object.values(d).forEach(y=>y.classList.remove("active")),d[a].classList.add("active")}g();const m=document.createElement("div");m.style.display=o.data?"none":"block";const u=n("📋 Cấu hình Data","data",y=>{m.style.display=y?"none":"block",t(e)}),p=document.createElement("div");p.className="cw-data-body";function h(){p.innerHTML="";let y=a==="sync"?s:a==="custom"?r:l,T=a==="sync"?M:a==="custom"?R:K;const w=Object.keys(y);w.length===0&&a!=="default"&&(p.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),w.forEach(S=>{const U=document.createElement("div");U.className="cw-data-row";let ie=a!=="default";const H=document.createElement("input");H.type="text",H.value=S,H.className="cw-data-key"+(ie?" mutable":""),H.readOnly=!ie,ie&&(H.onchange=()=>{const O=H.value.trim();if(!O||O===S){H.value=S;return}y[O]=y[S],delete y[S],A(T,y),h()});const j=document.createElement("input");if(j.type="text",j.value=y[S]??"",j.className="cw-data-val",j.oninput=()=>{y[S]=j.value,A(T,y)},U.appendChild(H),U.appendChild(j),ie){const O=document.createElement("button");O.innerHTML="✕",O.className="cw-del-btn",O.onclick=()=>{confirm(`Delete "${S}"?`)&&(delete y[S],A(T,y),h())},U.appendChild(O)}else U.appendChild(document.createElement("div")).className="cw-pad";p.appendChild(U)})}d.custom.onclick=()=>{a="custom",A(P,"custom"),g(),h()},d.default.onclick=()=>{a="default",A(P,"default"),g(),h()},d.sync.onclick=()=>{a="sync",A(P,"sync"),g(),h()};const v=document.createElement("button");v.innerText="📤",v.className="cw-icon-btn",v.onclick=()=>{const y=new Blob([JSON.stringify({defaultData:l,customData:r,syncData:s},null,2)],{type:"application/json"}),T=URL.createObjectURL(y),w=document.createElement("a");w.href=T,w.download=`vnpt_data_${Date.now()}.json`,w.click(),URL.revokeObjectURL(T)},m.appendChild(i),i.appendChild(d.custom),i.appendChild(d.default),i.appendChild(d.sync),m.appendChild(p),e.appendChild(u),e.appendChild(m);const k=e.querySelector("#vnpt-cw-fill"),D=e.querySelector("#vnpt-cw-sync"),f=e.querySelector("#vnpt-cw-add"),x=e.querySelector("#vnpt-cw-reset");k&&(k.onclick=rt),D&&(D.onclick=lt),f&&(f.onclick=()=>{a==="default"&&(a="custom",A(P,"custom"),g());let y=a==="sync"?s:r,T="new_field_"+Date.now();y[T]="",A(a==="sync"?M:R,y),h(),p.scrollTop=p.scrollHeight}),x&&(x.onclick=()=>{confirm("Reset Default Data?")&&(l={...z},A(K,l),h())}),h();const b=u.querySelector(".cw-right-wrap")||document.createElement("div");b.className="cw-right-wrap",b.prepend(v),u.appendChild(b)}function dt(){ct()}function pt(e,n,t){let o=Number(localStorage.getItem(we))||.08,a=X(Ee)??{calc:!1,data:!0},l=X(ke)??{};function r(f,x){const b=document.createElement("button");return b.innerText=f,b.className="cw-action-btn "+x,b}function s(f,x,b){const y=document.createElement("div");y.className="wg-sec-header";const T=document.createElement("span");T.innerText=f;const w=document.createElement("button");return w.className="wg-toggle-btn",w.innerText=a[x]?"▾":"▴",y.appendChild(T),y.appendChild(w),w.onclick=()=>{a[x]=!a[x],w.innerText=a[x]?"▾":"▴",te(Ee,a),b(a[x])},y}function i(f){const x=window.innerWidth,b=window.innerHeight,y=f.getBoundingClientRect();f.style.left=Math.min(Math.max(parseFloat(f.style.left),0),x-y.width)+"px",f.style.top=Math.min(Math.max(parseFloat(f.style.top),0),b-36)+"px"}const d=document.createElement("div");d.className="cw-title-bar",d.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const g=document.createElement("div");g.className="cw-btn-group";const m={fill:r("Fill","cw-btn-fill"),sync:r("Sync","cw-btn-sync"),add:r("Add","cw-btn-add"),reset:r("↺","cw-btn-reset")};m.reset.title="Reset Default fields",Object.values(m).forEach(f=>g.appendChild(f)),d.appendChild(g),e.appendChild(d);const u=document.createElement("div");u.className="cw-body-inline",u.innerHTML=`
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
            </div>
        </div>
    </div>`,n?n.appendChild(u):e.appendChild(u),st(e,s,i,a);const p={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text"),mapBtn:document.getElementById("wg-calc-map-btn"),mapWrap:document.getElementById("wg-calc-map-wrap")};p.taxRate.value=o*100,ne(ce,"wg-before-list"),ne(se,"wg-after-list");function h(f,x){const b=Ae(f,x,o);p.before.value=b.beforeStr,p.tax.value=b.taxStr,p.after.value=b.afterStr,p.text.value=b.textStr,it(b,l)}p.taxRate.oninput=()=>{o=Number(p.taxRate.value)/100||0,te(we,o),h("before",p.before.value)},p.before.oninput=()=>{const f=Ae("before",p.before.value,o);p.tax.value=f.taxStr,p.after.value=f.afterStr,p.text.value=f.textStr},p.before.onchange=()=>{h("before",p.before.value),Be(ce,p.before.value),ne(ce,"wg-before-list")},p.tax.oninput=()=>h("tax",p.tax.value),p.after.oninput=()=>h("after",p.after.value),p.after.onchange=()=>{h("after",p.after.value),Be(se,p.after.value),ne(se,"wg-after-list")},[p.before,p.tax,p.after,p.text].forEach(f=>{["click","focus"].forEach(x=>f.addEventListener(x,()=>{if(!f.value)return;navigator.clipboard.writeText(f.value);const b=f.style.backgroundColor;f.style.backgroundColor="#d1e7dd",setTimeout(()=>f.style.backgroundColor=b,300)}))}),p.mapBtn.onclick=()=>{const f=p.mapWrap.style.display==="flex";if(p.mapWrap.style.display=f?"none":"flex",!f){const x=b=>{!p.mapWrap.contains(b.target)&&b.target!==p.mapBtn&&(p.mapWrap.style.display="none",document.removeEventListener("click",x))};setTimeout(()=>document.addEventListener("click",x),0)}},e.querySelectorAll("input[data-clink]").forEach(f=>{const x=f.dataset.clink;f.value=(l[x]||[]).join(", "),f.oninput=()=>{l[x]=f.value.split(",").map(b=>b.trim()).filter(b=>b),te(ke,l)}});const v=Array.from(e.children).filter(f=>f!==d),k=Ne(e,[d],t,null,f=>{v.forEach(x=>x.style.display=f?"none":""),d.style.borderRadius=f?"8px":"0",f&&(e.style.top=window.innerHeight-(d.offsetHeight||34)+"px")}),D=X(t);return D&&D.docked&&k.setDocked(!0),window.addEventListener("resize",()=>{k.isDocked()?e.style.top=window.innerHeight-d.offsetHeight+"px":i(e)}),k}function ut(){const e=document.getElementById("vnpt-inline-calc"),n=AppState.calcWidget||document.createElement("div");return AppState.calcWidget||(n.id="vnpt-calc-widget",document.body.appendChild(n),AppState.calcWidget=n),pt(n,e,Oe)}function Ie(){re.info("Initializing VNPT Userscript...");try{He(),Xe(),Ye(),We(),ge(),Je(),Qe(),tt(),ut(),dt(),re.info("Userscript initialized successfully.")}catch(e){re.error("Error during userscript initialization:",e)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Ie):Ie()})();
