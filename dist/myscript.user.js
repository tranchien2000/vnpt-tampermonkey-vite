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
(function(){"use strict";const ae={info:(...e)=>console.log("[Tampermonkey Script] INFO:",...e),error:(...e)=>console.error("[Tampermonkey Script] ERROR:",...e),warn:(...e)=>console.warn("[Tampermonkey Script] WARN:",...e)};function Be(){GM_addStyle(`
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
    `)}const c={widget:null,panel:null,header:null,toggleBtn:null,fieldsContainer:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1},S={tenDaiDienn:"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT",emailDaiDien:"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Số GPKD | MST",goiDV:"Gói Dịch Vụ",ngayKy:"Ngày ký",thangKy:"Tháng Ký",namKy:"Năm ký",soHopDong:"Số Hợp đồng",soLuongGoi:"Số Lượng Gói",ngayTiepNhan:"Ngày tiếp nhận",noiKy:"Nơi ký",tenTiepNhan:"AM tiếp nhận",dienThoaiB:"SĐT AM",lienheHopDongA:"Liên hệ Hợp đồng (A)",lienheHoaDonA:"Liên hệ Hóa đơn (A)",lienheTuVanA:"Liên hệ Tư vấn (A)",sucoCap1A:"Sự cố Cấp 1 (A)"},me="vnpt_docx_fields",he="vnpt_docx_position",be="vnpt_docx_size",ie="vnpt_docx_opened",W="vnpt_autofill_data_default",$="vnpt_autofill_data_custom",R="vnpt_autofill_data_sync",De="vnpt_widget_pos",xe="vnd_tax_rate",re="vnd_before_history",le="vnd_after_history",ye="vnpt_widget_collapsed",ve="vnd_calc_map",V="vnpt_widget_datatab",we="vnpt_templates";function E(e,t="#198754"){const n=document.createElement("div");n.innerText=e,Object.assign(n.style,{position:"fixed",bottom:"20px",left:"50%",transform:"translateX(-50%)",background:t,color:"#fff",padding:"7px 16px",borderRadius:"20px",zIndex:"100000",opacity:"0",transition:"opacity .25s",fontSize:"13px",fontFamily:"'Segoe UI',sans-serif",boxShadow:"0 4px 14px rgba(0,0,0,.25)"}),document.body.appendChild(n),setTimeout(()=>n.style.opacity="1",30),setTimeout(()=>{n.style.opacity="0",setTimeout(()=>n.remove(),280)},2200)}const Le={local:{download(e,t="arraybuffer"){return new Promise((n,o)=>{const a=new FileReader;switch(a.onload=l=>{let i=l.target.result;t==="base64"&&typeof i=="string"&&(i=i.split(",")[1]||i),n(i)},a.onerror=l=>o(l),t.toLowerCase()){case"arraybuffer":a.readAsArrayBuffer(e);break;case"base64":case"dataurl":a.readAsDataURL(e);break;case"text":a.readAsText(e);break;default:o(new Error(`Unsupported read type: ${t}`))}})},async upload(e){return this.download(e,"base64")}}},Ae={getAdapter(e){const t=Le[e];if(!t)throw new Error(`Storage adapter not found: ${e}`);return t},async upload(e,t,n={}){return await this.getAdapter(e).upload(t,n)},async download(e,t,n={}){return await this.getAdapter(e).download(t,n.type||"arraybuffer")}},Ie="vnpt_templates_db",H="buffers";let G=null;function ce(){return G?Promise.resolve(G):new Promise((e,t)=>{const n=indexedDB.open(Ie,1);n.onupgradeneeded=o=>{const a=o.target.result;a.objectStoreNames.contains(H)||a.createObjectStore(H)},n.onsuccess=o=>{G=o.target.result,e(G)},n.onerror=()=>t(n.error)})}async function He(e,t){const n=await ce();return new Promise((o,a)=>{const s=n.transaction(H,"readwrite").objectStore(H).put(t,e);s.onsuccess=()=>o(),s.onerror=()=>a(s.error)})}async function Oe(e){const t=await ce();return new Promise((n,o)=>{const i=t.transaction(H,"readonly").objectStore(H).get(e);i.onsuccess=()=>n(i.result),i.onerror=()=>o(i.error)})}async function Me(e){const t=await ce();return new Promise((n,o)=>{const i=t.transaction(H,"readwrite").objectStore(H).delete(e);i.onsuccess=()=>n(),i.onerror=()=>o(i.error)})}function F(){try{const e=JSON.parse(localStorage.getItem(we))||[],t=e.filter(n=>n.type!=="local");return t.length!==e.length&&P(t),t}catch{return[]}}function P(e){localStorage.setItem(we,JSON.stringify(e))}function _e(e){const t=e.match(/drive\.google\.com\/file\/d\/([^/]+)/);return t?`https://drive.google.com/uc?export=download&id=${t[1]}`:e}function ze(e){return new Promise((t,n)=>{GM_xmlhttpRequest({method:"GET",url:_e(e),responseType:"arraybuffer",onload:o=>{if(o.status>=200&&o.status<300){if(o.response&&o.response.byteLength>4){const a=new Uint8Array(o.response.slice(0,4));if(a[0]===80&&a[1]===75&&a[2]===3&&a[3]===4){t(o.response);return}else{n(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}t(o.response)}else n(new Error(`HTTP ${o.status}: Không lấy được file`))},onerror:()=>n(new Error("Không thể tải URL.")),ontimeout:()=>n(new Error("Timeout khi tải URL."))})})}async function Ke(e,t,n){const o=e.name.replace(/\.docx$/i,""),a=prompt("Đặt tên biến nhớ cho file này:",o);if(!(!a||!a.trim()))try{const l=await e.arrayBuffer();await He(a.trim(),l);const s=F().filter(r=>r.name!==a.trim()&&r.fileName!==e.name);s.unshift({name:a.trim(),type:"local_idb",fileName:e.name,lastUsed:Date.now()}),P(s),_(t,n),n&&n(l,a.trim())}catch(l){E(`❌ Lỗi lưu file: ${l.message}`,"#dc3545")}}function _(e,t,n=null){let o=e.querySelector(".vnpt-template-manager-inner"),a,l;if(o)a=o.querySelector(".vnpt-local-list-container"),l=o.querySelector(".vnpt-btn-wrap");else{e.innerHTML="",o=document.createElement("div"),o.className="vnpt-template-manager-inner";const r=document.createElement("div");r.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const d=document.createElement("span");d.className="vnpt-title-main",d.style.cssText="font-size:11px;font-weight:700;color:#444;",l=document.createElement("div"),l.className="vnpt-btn-wrap",l.style.cssText="display:flex;gap:4px;",r.appendChild(d),r.appendChild(l),o.appendChild(r),a=document.createElement("div"),a.className="vnpt-local-list-container",a.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",o.appendChild(a),e.appendChild(o)}const i=F(),s=o.querySelector(".vnpt-title-main");s.innerHTML="📁 Bộ nhớ Templates"+(n?` <span style="color:#2e7d32;">(Đang dùng: ${n})</span>`:""),i.length===0?a.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':a.innerHTML="",i.forEach((r,d)=>{const m=document.createElement("div");m.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",m.title=r.fileName||r.url||r.name,m.tabIndex=0,m.onfocus=()=>m.style.boxShadow="0 0 0 2px #28a745",m.onblur=()=>m.style.boxShadow="none";const g=r.type==="local"||r.type==="local_base64"||r.type==="local_idb"?"OFF":"ON",f=g==="OFF"?"#6c757d":"#28a745",p=document.createElement("span");p.textContent=g,p.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${f};color:#fff;`;const h=document.createElement("span");h.textContent=r.name,h.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",m.onclick=()=>{m.focus(),Re(r,t,n,e)},m.appendChild(p),m.appendChild(h);const v=document.createElement("button");v.innerHTML="✎",v.title="Đổi tên template",v.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",v.onclick=B=>{B.stopPropagation();const u=prompt("Đổi tên template:",r.name);if(u&&u.trim()&&u.trim()!==r.name){const x=F();x[d].name=u.trim(),P(x),_(e,t,n)}},m.appendChild(v);const T=document.createElement("button");T.innerHTML="✕",T.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",T.onclick=async B=>{if(B.stopPropagation(),confirm(`Xoá biểu mẫu "${r.name}"?`)){const u=F();u.splice(d,1),P(u),r.type==="local_idb"&&await Me(r.name).catch(()=>null),_(e,t,n===r.name?null:n)}},m.appendChild(T),a.appendChild(m)})}function Re(e,t,n,o){const a=F(),l=a.find(i=>i.name===e.name&&(i.url===e.url||i.type===e.type));if(l&&(l.lastUsed=Date.now(),P(a)),e.type==="local_idb"){Oe(e.name).then(i=>{if(!i)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");t&&t(i,e.name),_(o,t,e.name)}).catch(i=>{E(`❌ Lỗi nạp File IDB: ${i.message}`,"#dc3545")});return}if(e.type==="local_base64"&&e.data){try{const i=window.atob(e.data.split(",")[1]),s=i.length,r=new Uint8Array(s);for(let d=0;d<s;d++)r[d]=i.charCodeAt(d);t&&t(r.buffer,e.name),_(o,t,e.name)}catch(i){E(`❌ Lỗi nạp Base64: ${i.message}`,"#dc3545")}return}ze(e.url).then(i=>{t&&t(i,e.name),_(o,t,e.name)}).catch(i=>{E(`❌ ${i.message}`,"#dc3545")})}function Ve(e){e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function L(e,t){var a;if(!e||e.disabled||e.readOnly)return;const n=e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,o=(a=Object.getOwnPropertyDescriptor(n,"value"))==null?void 0:a.set;o?o.call(e,t):e.value=t,Ve(e)}function X(e){const t=document.getElementById(e);if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"))return t;for(const n of document.querySelectorAll("label"))if(n.textContent.trim()===e){if(n.htmlFor){const a=document.getElementById(n.htmlFor);if(a)return a}let o=n.parentElement;for(;o;){const a=o.querySelector("input,textarea");if(a)return a;if(o=o.parentElement,(o==null?void 0:o.tagName)==="FORM")break}}return null}function Y(e){for(const t of document.querySelectorAll("label"))if(t.innerText.trim()===e)return t.parentElement.querySelector("input, textarea");return null}function A(e,t){const n=X(e)||Y(e);n&&L(n,t)}const se=new Date,de=String(se.getDate()).padStart(2,"0"),J=String(se.getMonth()+1).padStart(2,"0"),Q=String(se.getFullYear()),q={ngayKy:de,thangKy:J,namKy:Q,ngayTiepNhan:`${de}/${J}/${Q}`,ngayThangNamKy:`${de}/${J}/${Q}`,thangKy1:J,namKy1:Q,tenDoanhNghiepB:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM",diaChiB:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội",maSoThueB:"0100686223",stkB:"1600114156",diaChiStkB:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)",tenB:"Phạm Khánh Chung",nguoiDaiDienB:"Phạm Khánh Chung",chucVuB:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",chucVuDaiDienB:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",giayUyQuyenSoB:"2628/GUQ-VNPT-HNI-VP",soGiayUyQuyenB:"2628/GUQ-VNPT-HNI-VP",giayUyQuyenNgayB:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",ngayGiayUyQuyenB:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",GiayUyQuyenB:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",tenDoanhNghiepB1:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",donViTiepNhan:"TTKD KHDN",tenTiepNhan:"Bùi Anh",tenNguoiNhan:"Bùi Anh",dienThoaiB:"02436686868",diaChiTaiKhoanB:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 ",noiKy:"Hà Nội",emailB:"",lienheHopDongB:"AM Bùi Anh",lienheTuVanB:"AM Bùi Anh",lienheHoaDonB:"AM Bùi Anh",sucoCap1B:"AM Bùi Anh",sucoCap2B:"AM Bùi Anh",sucoCap3B:"AM Bùi Anh",sucoCap4B:"AM Bùi Anh"},Ee=["lienheHopDongA","lienheHoaDonA","lienheTuVanA","sucoCap1A","sucoCap2A","sucoCap3A","sucoCap4A"];function N(e,t,n=null,o=""){const a=c.fieldsContainer.querySelector(".text-hint");a&&a.remove();const l=c.fieldsContainer.querySelectorAll(".f-key");let i=!1;for(let s of l)if(s.value.split(",")[0].trim()===e){const d=s.closest(".vnpt-field-row"),m=d.querySelector(".f-val"),g=d.querySelector(".f-label");t!==""&&(m.value=t),n!==null&&n!==""&&(g.value=n),o!==""&&(s.value.split(",").slice(1).map(f=>f.trim()).join(", "),s.value=e+", "+o),i=!0;break}if(!i){(n===null||n==="")&&(n=S[e]||"");const s=document.createElement("div");s.className="vnpt-field-row row-item",s.setAttribute("draggable","false");let r=e;o&&(r+=", "+o),s.innerHTML=`
            <input type="checkbox" class="row-chk" title="Chọn để thao tác hàng loạt" style="margin: 0 2px 0 2px;" />
            <input type="text" class="f-label" placeholder="Nhãn..." value="${n}" />
            <input type="text" class="f-key" placeholder="Mã biến / IDs đồng bộ" value="${r}" title="Biến DOCX (đầu tiên), theo sau là các ID web cách dấu phẩy" />
            <span class="row-drag-handle" title="Kéo thả để di chuyển">=</span>
            <input type="text" class="f-val" placeholder="Giá trị" value="${t}" />
        `;const d=s.querySelector(".f-val"),m=s.querySelector(".f-key");e==="tenToChuc"&&(d.style.textAlign="right"),m.addEventListener("keyup",function(){D();const f=this.value.split(",")[0].trim();d.style.textAlign=f==="tenToChuc"?"right":""}),s.querySelector(".f-label").addEventListener("keyup",D),d.addEventListener("keyup",function(){if(c.isDefaultMode&&!this.dataset.warned){if(!confirm("⚠️ Bạn đang chỉnh sửa dữ liệu mặc định. Thay đổi này sẽ không được lưu vào cấu hình cá nhân. Tiếp tục?")){pe();return}this.dataset.warned="true"}D();const p=m.value.split(",").map(h=>h.trim()).filter(h=>h);p.length>0&&p.forEach(h=>A(h,this.value))}),d.addEventListener("focus",function(){c.isDefaultMode&&this.dataset.warned});const g=s.querySelector(".row-drag-handle");g.addEventListener("mouseenter",()=>s.setAttribute("draggable","true")),g.addEventListener("mouseleave",()=>{s.classList.contains("dragging")||s.setAttribute("draggable","false")}),s.addEventListener("dragstart",function(f){c.draggedRowForVNPT=this,f.dataTransfer.effectAllowed="move",f.dataTransfer.setData("text/plain",e),this.classList.add("dragging")}),s.addEventListener("dragover",function(f){return f.preventDefault(),f.dataTransfer.dropEffect="move",!1}),s.addEventListener("dragenter",function(f){this.classList.add("over")}),s.addEventListener("dragleave",function(f){this.classList.remove("over")}),s.addEventListener("drop",function(f){if(f.stopPropagation(),c.draggedRowForVNPT&&c.draggedRowForVNPT!==this){const p=Array.from(c.fieldsContainer.querySelectorAll(".vnpt-field-row")),h=p.indexOf(c.draggedRowForVNPT),v=p.indexOf(this);h<v?this.parentNode.insertBefore(c.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(c.draggedRowForVNPT,this),D()}return!1}),s.addEventListener("dragend",function(f){this.setAttribute("draggable","false"),c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(h=>{h.classList.remove("over"),h.classList.remove("dragging")}),c.draggedRowForVNPT=null}),c.fieldsContainer.appendChild(s),c.fieldsContainer.scrollTop=c.fieldsContainer.scrollHeight}}async function D(){if(c.isDefaultMode)return;const e={};c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(n=>{const a=n.querySelector(".f-key").value.trim().split(",").map(d=>d.trim()).filter(d=>d),l=a[0],i=a.slice(1).join(", "),s=n.querySelector(".f-label").value.trim(),r=n.querySelector(".f-val").value;l&&(e[l]={label:s,value:r,sync:i})}),localStorage.setItem(me,JSON.stringify(e))}async function pe(){try{c.fieldsContainer.innerHTML="";const e=JSON.parse(localStorage.getItem(me))||{};Object.keys(S).forEach(t=>{const n=S[t],o=e[t];o&&typeof o=="object"?N(t,o.value,o.label||n,o.sync||""):o?N(t,o,n,""):N(t,"",n,"")}),Object.keys(e).forEach(t=>{if(!(t in S)){const n=e[t];typeof n=="object"?N(t,n.value,n.label,n.sync||""):N(t,n,"","")}}),Object.keys(S).length===0&&Object.keys(e).length===0&&(c.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(e){console.error("Error loading config:",e),Object.keys(S).forEach(t=>{N(t,"",S[t])})}try{const e=JSON.parse(localStorage.getItem(he));e&&c.widget&&(c.widget.style.bottom="auto",e.right?(c.widget.style.right=e.right,c.widget.style.left="auto"):e.left&&(c.widget.style.left=e.left,c.widget.style.right="auto"),e.top&&(c.widget.style.top=e.top))}catch{}}function Fe(){document.getElementById("vnpt-btn-toggle-id").addEventListener("click",function(){c.fieldsContainer.classList.toggle("show-ids")}),document.getElementById("vnpt-btn-default").addEventListener("click",Pe),document.getElementById("vnpt-btn-batch-del").addEventListener("click",function(){if(c.isDefaultMode){E("⚠️ Không thể xóa ở chế độ Dữ liệu mặc định","#ffc107");return}const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row");let t=0;e.forEach(n=>{const o=n.querySelector(".row-chk");o&&o.checked&&(n.remove(),t++)}),t===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(e.forEach(n=>n.remove()),E("🗑️ Đã xóa toàn bộ","#ff5252"),D()):(E(`🗑️ Đã xóa ${t} trường`,"#ff5252"),D())}),document.getElementById("vnpt-btn-add").addEventListener("click",function(){if(c.isDefaultMode){E("⚠️ Không thể thêm ở chế độ Dữ liệu mặc định","#ffc107");return}const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;N("bien_moi_"+e,"","",""),D()}),document.getElementById("vnpt-btn-fill-back").addEventListener("click",function(){const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row");let t=0;e.forEach(n=>{const o=n.querySelector(".f-key").value.trim(),a=n.querySelector(".f-val").value;o.split(",").map(i=>i.trim()).filter(Boolean).forEach(i=>{(document.getElementById(i)||document.getElementsByName(i)[0])&&(A(i,a),t++)})}),t>0?E(`✅ Đã điền ngược ${t} trường vào web`,"#198754"):E("⚠️ Không có trường nào khớp","#ffc107")})}function Pe(){c.isDefaultMode=!c.isDefaultMode;const e=document.getElementById("vnpt-btn-default");if(c.fieldsContainer.innerHTML="",c.bannerArea.innerHTML="",c.isDefaultMode){e.classList.add("active"),c.fieldsContainer.classList.add("vnpt-mode-default"),E("📌 Chế độ xem Dữ liệu mặc định","#ea4335");const t=document.createElement("div");t.className="vnpt-default-banner",t.innerHTML=`
            <span>📌 Đang xem Dữ liệu mặc định</span>
        `,c.bannerArea.appendChild(t),Object.keys(q).forEach(n=>{N(n,q[n],S[n]||"")})}else e.classList.remove("active"),c.fieldsContainer.classList.remove("vnpt-mode-default"),E("📋 Đã quay lại Dữ liệu cá nhân"),pe()}function qe(){const e=document.createElement("div");e.id="vnpt-docx-widget";const t=localStorage.getItem(ie)==="true";e.innerHTML=`
        <button id="vnpt-toggle-btn" title="Mở/Đóng UI Hợp đồng" class="${t?"btn-opened":"btn-closed"}">${t?"✖":"📄"}</button>

        <div id="vnpt-export-panel" style="display: ${t?"flex":"none"};">
            <div id="vnpt-panel-header" title="Kẹp chuột vào đây để di chuyển">
                <span id="vnpt-panel-title">Nhập|Xuất H.Đồng</span>
                <div class="btn-row" style="margin-bottom: 0; padding-right: 35px; gap: 4px;">
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-scan" title="Lấy data theo biểu mẫu web">Quét</button>
                    <button class="vnpt-btn-action btn-fill-back" id="vnpt-btn-fill-back" title="Điền dữ liệu ngược lên web">Điền</button>
                    <button class="vnpt-btn-action btn-default-toggle" id="vnpt-btn-default" title="📌 Dữ liệu mặc định VNPT">📌</button>
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
    `,document.body.appendChild(e),c.widget=e,c.panel=document.getElementById("vnpt-export-panel"),c.toggleBtn=document.getElementById("vnpt-toggle-btn"),c.header=document.getElementById("vnpt-panel-header"),c.bannerArea=document.getElementById("vnpt-banner-area"),c.fieldsContainer=document.getElementById("vnpt-fields-container");try{const o=JSON.parse(localStorage.getItem(be));o&&o.width&&o.height&&(c.panel.style.width=o.width+"px",c.panel.style.height=o.height+"px")}catch(o){console.error("Lỗi load size panel:",o)}new ResizeObserver(o=>{if(c.panel.style.display!=="none")for(let a of o){const{width:l,height:i}=a.contentRect;l>0&&i>0&&localStorage.setItem(be,JSON.stringify({width:Math.round(l+20),height:Math.round(i+20)}))}}).observe(c.panel),c.panelBody=document.getElementById("vnpt-panel-body"),_(document.getElementById("vnpt-template-manager"),(o,a)=>{c.templateBuffer=o,c.templateName=a}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const o=this.files&&this.files[0];if(!o)return;const a=document.getElementById("vnpt-template-manager");Ke(o,a,(l,i)=>{c.templateBuffer=l,c.templateName=i}),this.value=""}),c.toggleBtn.addEventListener("click",o=>{c.hasDragged||(c.panel.style.display==="none"?(c.panel.style.display="flex",c.toggleBtn.className="btn-opened",c.toggleBtn.innerHTML="✖",localStorage.setItem(ie,"true")):(c.panel.style.display="none",c.toggleBtn.className="btn-closed",c.toggleBtn.innerHTML="📄",localStorage.setItem(ie,"false")))})}function Te(e,t,n,o=null,a=null){let l=!1,i=0,s=0,r=!1;function d(g){r!==g&&(r=g,a&&a(g))}function m(g){if(g.button!==0)return;l=!0,c.hasDragged=!1;const f=e.getBoundingClientRect();i=g.clientX-f.left,s=g.clientY-f.top,document.body.style.userSelect="none",t&&t.forEach(p=>p.style.cursor="grabbing"),o&&o(),g.preventDefault()}return t.forEach(g=>{g.addEventListener("mousedown",m)}),document.addEventListener("mousemove",function(g){if(!l)return;c.hasDragged=!0;let f=g.clientX-i,p=g.clientY-s;const h=window.innerWidth,v=window.innerHeight,T=document.getElementById("vnpt-toggle-btn"),B=T?T.offsetWidth:40,u=T?T.offsetHeight:40,x=e.id==="vnpt-docx-widget";let b=e.offsetWidth||0;if(x){let w=B+6-b,C=h-b+6;f<w&&(f=w),f>C&&(f=C)}else b=b||200,f<0&&(f=0),f+b>h&&(f=Math.max(0,h-b));let y=r;if(x?y=!1:r?g.clientY<v-40&&(y=!1):g.clientY>v-10&&(y=!0),p<0&&(p=0),y)d(!0),e.style.top=v-e.offsetHeight+"px",x?(e.style.right=h-f-b+"px",e.style.left="auto"):(e.style.left=f+"px",e.style.right="auto"),e.style.bottom="auto";else{d(!1);let k=e.offsetHeight||40,w;if(x)w=10+u;else{const C=e.querySelector(".cw-title-bar");w=C?C.offsetHeight:k}p+w>v&&(p=Math.max(0,v-w)),e.style.top=p+"px",x?(e.style.right=h-f-b+"px",e.style.left="auto"):(e.style.left=f+"px",e.style.right="auto"),e.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(l&&(l=!1,document.body.style.userSelect="",t&&t.forEach(g=>g.style.cursor="grab"),n)){const g=e.id==="vnpt-docx-widget";localStorage.setItem(n,JSON.stringify({left:g?void 0:e.style.left,right:g?e.style.right:void 0,top:e.style.top,x:g?void 0:parseFloat(e.style.left),y:parseFloat(e.style.top),docked:r}))}}),{isDocked:()=>r,setDocked:d}}function Ue(){c.widget&&c.header&&c.toggleBtn&&(Te(c.widget,[c.header,c.toggleBtn],he),window.addEventListener("resize",()=>{const e=window.innerWidth,t=window.innerHeight,n=document.getElementById("vnpt-toggle-btn"),o=n?n.offsetWidth:40,a=n?n.offsetHeight:40;let l=c.widget.getBoundingClientRect(),i=l.left,s=l.top,r=c.widget.offsetWidth||0,m=o+6-r,g=e-r+6;i<m&&(i=m),i>g&&(i=g),s+10+a>t&&(s=Math.max(0,t-(10+a))),c.widget.style.right=e-i-r+"px",c.widget.style.top=s+"px"}))}function je(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){let e=0;Object.keys(S).forEach(t=>{var a;const n=document.getElementById(t);let o="";if(n&&(o=n.tagName.toLowerCase()==="select"?((a=n.options[n.selectedIndex])==null?void 0:a.text)||"":n.value,e++),!o){const l=t.toLowerCase(),i=new Date;l==="ngayky"&&(o=String(i.getDate()).padStart(2,"0")),(l==="thangky"||l==="thangky1")&&(o=String(i.getMonth()+1).padStart(2,"0")),(l==="namky"||l==="namky1")&&(o=String(i.getFullYear())),l==="soluonggoi"&&(o="1")}N(t,o,null)}),D(),e>0?(this.style.background="#34a853",this.style.color="#fff",this.innerText="Done",setTimeout(()=>{this.style.background="#fbbc04",this.style.color="#000",this.innerText="Quét"},1e3)):E("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(e){e.target&&e.target.id&&S[e.target.id]!==void 0&&(N(e.target.id,e.target.value,null),D())}),document.addEventListener("change",function(e){var t;if(e.target&&e.target.id&&S[e.target.id]!==void 0){let n=e.target.tagName.toLowerCase()==="select"?((t=e.target.options[e.target.selectedIndex])==null?void 0:t.text)||"":e.target.value;N(e.target.id,n,null),D()}})}function Ce(e,t,n){try{let o;try{o=new window.PizZip(e)}catch(r){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(r);return}const a=new window.docxtemplater(o,{paragraphLoop:!0,linebreaks:!0});a.render(t);const l=a.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),i=URL.createObjectURL(l),s=document.createElement("a");s.href=i,s.download=n,document.body.appendChild(s),s.click(),setTimeout(()=>{document.body.removeChild(s),URL.revokeObjectURL(i)},100)}catch(o){let a=o.message;o.properties&&o.properties.errors instanceof Array?a=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+o.properties.errors.map(i=>"- "+(i.properties.explanation||i.message)).join(`
`):a="Lỗi phần mềm Word sinh ra: "+a,alert(a),console.error("DocX Error:",o)}}function We(){const e=document.getElementById("vnpt-export-filename");e&&e.addEventListener("input",()=>{e.dataset.userEdited="1",e.value.trim()||(e.dataset.userEdited="0")});function t(){if(!e||e.dataset.userEdited==="1")return;let n="";if(c.fieldsContainer&&c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(r=>{const m=r.querySelector(".f-key").value.trim().split(",")[0].trim(),g=r.querySelector(".f-val").value.trim();m==="tenToChuc"&&(n=g)}),!n){const s=document.getElementById("tenToChuc");s&&(n=s.tagName.toLowerCase()==="textarea"||s.tagName.toLowerCase()==="input"?s.value.trim():s.innerText.trim())}function o(s){if(!s)return"";let r=s;return r=r.replace(/Tổng công ty/gi,""),r=r.replace(/Công ty/gi,""),r=r.replace(/\bCty\b/gi,""),r=r.replace(/Trách nhiệm hữu hạn/gi,""),r=r.replace(/\bTNHH\b/gi,""),r=r.replace(/Cổ phần/gi,""),r=r.replace(/\bCP\b/gi,""),r=r.replace(/Một thành viên/gi,""),r=r.replace(/\bMTV\b/gi,""),r=r.replace(/Chi nhánh/gi,""),r=r.replace(/Việt Nam/gi,"VN"),r=r.replace(/Viet Nam/gi,"VN"),r=r.replace(/\s+/g," ").trim(),r=r.replace(/^[-,\s]+|[-,\s]+$/g,""),r.length>50&&(r=r.substring(0,47)+"..."),r.replace(/[<>:"/\\|?*]/g,"")}let a=o(n),l=c.templateName?c.templateName.replace(/\.docx$/i,""):"",i=[];a&&i.push(a),l&&i.push(l),i.length>0?e.value=i.join(" - ")+".docx":e.value||(e.value="HopDong_Auto.docx")}setInterval(t,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const n={};if(c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(i=>{const r=i.querySelector(".f-key").value.trim().split(",")[0].trim(),d=i.querySelector(".f-val").value;r&&(n[r]=d)}),Object.keys(n).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}let a=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(a.toLowerCase().endsWith(".docx")||(a+=".docx"),c.templateBuffer){Ce(c.templateBuffer,n,a);return}const l=document.getElementById("vnpt-template-file");if(l.files&&l.files.length>0){Ae.download("local",l.files[0],{type:"arraybuffer"}).then(i=>Ce(i,n,a)).catch(i=>alert(`Lỗi đọc file: ${i.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')})}function $e(){function e(){const o=document.getElementById("chucVu");o&&!o.dataset.filled&&(o.dataset.filled="1",L(o,"Giám Đốc"));const a=document.getElementById("noiCap");a&&!a.dataset.filled&&(a.dataset.filled="1",L(a,"Cục trưởng Cục Cảnh sát QLHC về TTXH"));const l=document.getElementById("noiCapSoDkdn");l&&!l.dataset.filled&&(l.dataset.filled="1",L(l,""));const i=document.getElementById("duong"),s=document.getElementById("diaChiTruSoDuong");i&&s&&!i.dataset.bound&&(i.dataset.bound="1",i.addEventListener("input",()=>L(s,i.value)));const r=document.getElementById("sdt"),d=document.getElementById("sdtToChuc");r&&d&&!r.dataset.bound&&(r.dataset.bound="1",r.addEventListener("input",()=>L(d,r.value)));const m=document.getElementById("emailDaiDien"),g=document.getElementById("emailCongTy");m&&g&&!m.dataset.bound&&(m.dataset.bound="1",m.addEventListener("input",()=>L(g,m.value)));const f=document.getElementById("soDkdn"),p=document.getElementById("maSoThue");f&&p&&!f.dataset.bound&&(f.dataset.bound="1",f.addEventListener("input",()=>L(p,f.value)))}let t;new MutationObserver(()=>{clearTimeout(t),t=setTimeout(e,200)}).observe(document.body,{childList:!0,subtree:!0}),e()}function U(e,t=null){try{const n=localStorage.getItem(e);return n!==null?JSON.parse(n):t}catch{return t}}function Z(e,t){localStorage.setItem(e,JSON.stringify(t))}function ke(e,t){if(!t||t.replace(/\D/g,"").length<6)return;let n=U(e,[]);n=n.filter(o=>o!==t),n.unshift(t),Z(e,n.slice(0,10))}function ee(e,t){const n=document.getElementById(t);n&&(n.innerHTML=U(e,[]).map(o=>`<option value="${o}">`).join(""))}function ue(e){return e.toLocaleString("en-US")}function fe(e){return Number(String(e).replace(/[^\d]/g,""))||0}function Ge(e){return e.charAt(0).toUpperCase()+e.slice(1)}const j=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function Xe(e){let t=Math.floor(e/100),n=Math.floor(e%100/10),o=e%10,a="";return t>0&&(a+=j[t]+" trăm ",n===0&&o>0&&(a+="lẻ ")),n>1?(a+=j[n]+" mươi ",o===1?a+="mốt":o===5?a+="lăm":o>0&&(a+=j[o])):n===1?(a+="mười ",o===5?a+="lăm":o>0&&(a+=j[o])):o>0&&(t>0&&(a+="lẻ "),a+=j[o]),a.trim()}function Ye(e){if(e===0)return"không";const t=["","nghìn","triệu","tỷ"];let n="",o=0;for(;e>0;){const a=e%1e3;a>0&&(n=Xe(a)+" "+t[o]+" "+n),e=Math.floor(e/1e3),o++}return n.trim()}function Se(e,t,n){let o=0,a=0,l=0;e==="before"?(o=fe(t),a=Math.round(o*n),l=o+a):e==="tax"?(a=fe(t),o=Math.round(a/n),l=o+a):e==="after"&&(l=fe(t),o=Math.round(l/(1+n)),a=l-o);const i=Ge(Ye(l))+" đồng";return{beforeNum:o,taxNum:a,afterNum:l,beforeStr:ue(o),taxStr:ue(a),afterStr:ue(l),textStr:i}}function Je(e,t){t.before&&t.before.forEach(n=>A(n,e.beforeStr)),t.tax&&t.tax.forEach(n=>A(n,e.taxStr)),t.after&&t.after.forEach(n=>A(n,e.afterStr)),t.text&&t.text.forEach(n=>A(n,e.textStr))}function te(e,t=null){try{const n=localStorage.getItem(e);return n!==null?JSON.parse(n):t}catch{return t}}function Qe(){const e=te(W)??{...q},t=te($)??{},n={...e,...t};let o="";for(let a of Ee){const l=X(a)||Y(a);if(l&&l.value){o=l.value;break}}o&&Ee.forEach(a=>A(a,o)),Object.keys(n).forEach(a=>{let l=X(a)||Y(a);l&&L(l,n[a])}),E("✅ Auto fill complete")}function Ze(){let e=te(R)??{};const t=Object.keys(e);if(t.length===0){E("⚠️ No sync mapping","#ffc107");return}t.forEach(n=>{let o=X(n)||Y(n);o&&o.value!==void 0&&o.value!==""&&e[n].split(",").map(l=>l.trim()).filter(l=>l).forEach(l=>A(l,o.value))}),E("✅ Sync form complete","#d39e00")}let ge=!1;function et(){document.addEventListener("input",e=>{var i;if(ge||!e.target||!["INPUT","TEXTAREA"].includes(e.target.tagName))return;let t=te(R)??{};if(Object.keys(t).length===0)return;let n=e.target.id,o=e.target.name,a=null;if(n){const s=document.querySelector(`label[for="${n}"]`);s&&(a=s.textContent.trim())}if(!a){const s=e.target.closest("label");s&&(a=(i=Array.from(s.childNodes).find(r=>r.nodeType===3))==null?void 0:i.textContent.trim())}let l=t[n]||t[o]||t[a];if(l){ge=!0;try{const s=e.target.value;l.split(",").map(d=>d.trim()).filter(d=>d).forEach(d=>{d!==n&&d!==o&&d!==a&&A(d,s)})}finally{ge=!1}}})}function ne(e,t=null){try{const n=localStorage.getItem(e);return n!==null?JSON.parse(n):t}catch{return t}}function I(e,t){localStorage.setItem(e,JSON.stringify(t))}function tt(e,t,n,o){let a=ne(V)??"custom",l=ne(W)??{...q},i=ne($)??{},s=ne(R)??{};const r=document.createElement("div");r.className="cw-tab-header";const d={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};d.custom.innerText="📋 Custom",d.custom.className="cw-tab cw-tab-custom",d.default.innerText="📌 Default",d.default.className="cw-tab cw-tab-default",d.sync.innerText="🔗 Sync",d.sync.className="cw-tab cw-tab-sync";function m(){Object.values(d).forEach(y=>y.classList.remove("active")),d[a].classList.add("active")}m();const g=document.createElement("div");g.style.display=o.data?"none":"block";const f=t("📋 Cấu hình Data","data",y=>{g.style.display=y?"none":"block",n(e)}),p=document.createElement("div");p.className="cw-data-body";function h(){p.innerHTML="";let y=a==="sync"?s:a==="custom"?i:l,k=a==="sync"?R:a==="custom"?$:W;const w=Object.keys(y);w.length===0&&a!=="default"&&(p.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),w.forEach(C=>{const z=document.createElement("div");z.className="cw-data-row";let oe=a!=="default";const O=document.createElement("input");O.type="text",O.value=C,O.className="cw-data-key"+(oe?" mutable":""),O.readOnly=!oe,oe&&(O.onchange=()=>{const M=O.value.trim();if(!M||M===C){O.value=C;return}y[M]=y[C],delete y[C],I(k,y),h()});const K=document.createElement("input");if(K.type="text",K.value=y[C]??"",K.className="cw-data-val",K.oninput=()=>{y[C]=K.value,I(k,y)},z.appendChild(O),z.appendChild(K),oe){const M=document.createElement("button");M.innerHTML="✕",M.className="cw-del-btn",M.onclick=()=>{confirm(`Delete "${C}"?`)&&(delete y[C],I(k,y),h())},z.appendChild(M)}else z.appendChild(document.createElement("div")).className="cw-pad";p.appendChild(z)})}d.custom.onclick=()=>{a="custom",I(V,"custom"),m(),h()},d.default.onclick=()=>{a="default",I(V,"default"),m(),h()},d.sync.onclick=()=>{a="sync",I(V,"sync"),m(),h()};const v=document.createElement("button");v.innerText="📤",v.className="cw-icon-btn",v.onclick=()=>{const y=new Blob([JSON.stringify({defaultData:l,customData:i,syncData:s},null,2)],{type:"application/json"}),k=URL.createObjectURL(y),w=document.createElement("a");w.href=k,w.download=`vnpt_data_${Date.now()}.json`,w.click(),URL.revokeObjectURL(k)},g.appendChild(r),r.appendChild(d.custom),r.appendChild(d.default),r.appendChild(d.sync),g.appendChild(p),e.appendChild(f),e.appendChild(g);const T=e.querySelector("#vnpt-cw-fill"),B=e.querySelector("#vnpt-cw-sync"),u=e.querySelector("#vnpt-cw-add"),x=e.querySelector("#vnpt-cw-reset");T&&(T.onclick=Qe),B&&(B.onclick=Ze),u&&(u.onclick=()=>{a==="default"&&(a="custom",I(V,"custom"),m());let y=a==="sync"?s:i,k="new_field_"+Date.now();y[k]="",I(a==="sync"?R:$,y),h(),p.scrollTop=p.scrollHeight}),x&&(x.onclick=()=>{confirm("Reset Default Data?")&&(l={...q},I(W,l),h())}),h();const b=f.querySelector(".cw-right-wrap")||document.createElement("div");b.className="cw-right-wrap",b.prepend(v),f.appendChild(b)}function nt(){et()}function ot(e,t,n){let o=Number(localStorage.getItem(xe))||.08,a=U(ye)??{calc:!1,data:!0},l=U(ve)??{};function i(u,x){const b=document.createElement("button");return b.innerText=u,b.className="cw-action-btn "+x,b}function s(u,x,b){const y=document.createElement("div");y.className="wg-sec-header";const k=document.createElement("span");k.innerText=u;const w=document.createElement("button");return w.className="wg-toggle-btn",w.innerText=a[x]?"▾":"▴",y.appendChild(k),y.appendChild(w),w.onclick=()=>{a[x]=!a[x],w.innerText=a[x]?"▾":"▴",Z(ye,a),b(a[x])},y}function r(u){const x=window.innerWidth,b=window.innerHeight,y=u.getBoundingClientRect();u.style.left=Math.min(Math.max(parseFloat(u.style.left),0),x-y.width)+"px",u.style.top=Math.min(Math.max(parseFloat(u.style.top),0),b-36)+"px"}const d=document.createElement("div");d.className="cw-title-bar",d.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const m=document.createElement("div");m.className="cw-btn-group";const g={fill:i("Fill","cw-btn-fill"),sync:i("Sync","cw-btn-sync"),add:i("Add","cw-btn-add"),reset:i("↺","cw-btn-reset")};g.reset.title="Reset Default fields",Object.values(g).forEach(u=>m.appendChild(u)),d.appendChild(m),e.appendChild(d);const f=document.createElement("div");f.className="cw-body-inline",f.innerHTML=`
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
    </div>`,t?t.appendChild(f):e.appendChild(f),tt(e,s,r,a);const p={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text"),mapBtn:document.getElementById("wg-calc-map-btn"),mapWrap:document.getElementById("wg-calc-map-wrap")};p.taxRate.value=o*100,ee(re,"wg-before-list"),ee(le,"wg-after-list");function h(u,x){const b=Se(u,x,o);p.before.value=b.beforeStr,p.tax.value=b.taxStr,p.after.value=b.afterStr,p.text.value=b.textStr,Je(b,l)}p.taxRate.oninput=()=>{o=Number(p.taxRate.value)/100||0,Z(xe,o),h("before",p.before.value)},p.before.oninput=()=>{const u=Se("before",p.before.value,o);p.tax.value=u.taxStr,p.after.value=u.afterStr,p.text.value=u.textStr},p.before.onchange=()=>{h("before",p.before.value),ke(re,p.before.value),ee(re,"wg-before-list")},p.tax.oninput=()=>h("tax",p.tax.value),p.after.oninput=()=>h("after",p.after.value),p.after.onchange=()=>{h("after",p.after.value),ke(le,p.after.value),ee(le,"wg-after-list")},[p.before,p.tax,p.after,p.text].forEach(u=>{["click","focus"].forEach(x=>u.addEventListener(x,()=>{if(!u.value)return;navigator.clipboard.writeText(u.value);const b=u.style.backgroundColor;u.style.backgroundColor="#d1e7dd",setTimeout(()=>u.style.backgroundColor=b,300)}))}),p.mapBtn.onclick=()=>{const u=p.mapWrap.style.display==="flex";if(p.mapWrap.style.display=u?"none":"flex",!u){const x=b=>{!p.mapWrap.contains(b.target)&&b.target!==p.mapBtn&&(p.mapWrap.style.display="none",document.removeEventListener("click",x))};setTimeout(()=>document.addEventListener("click",x),0)}},e.querySelectorAll("input[data-clink]").forEach(u=>{const x=u.dataset.clink;u.value=(l[x]||[]).join(", "),u.oninput=()=>{l[x]=u.value.split(",").map(b=>b.trim()).filter(b=>b),Z(ve,l)}});const v=Array.from(e.children).filter(u=>u!==d),T=Te(e,[d],n,null,u=>{v.forEach(x=>x.style.display=u?"none":""),d.style.borderRadius=u?"8px":"0",u&&(e.style.top=window.innerHeight-(d.offsetHeight||34)+"px")}),B=U(n);return B&&B.docked&&T.setDocked(!0),window.addEventListener("resize",()=>{T.isDocked()?e.style.top=window.innerHeight-d.offsetHeight+"px":r(e)}),T}function at(){const e=document.getElementById("vnpt-inline-calc"),t=AppState.calcWidget||document.createElement("div");return AppState.calcWidget||(t.id="vnpt-calc-widget",document.body.appendChild(t),AppState.calcWidget=t),ot(t,e,De)}function Ne(){ae.info("Initializing VNPT Userscript...");try{Be(),qe(),Ue(),Fe(),pe(),je(),We(),$e(),at(),nt(),ae.info("Userscript initialized successfully.")}catch(e){ae.error("Error during userscript initialization:",e)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Ne):Ne()})();
