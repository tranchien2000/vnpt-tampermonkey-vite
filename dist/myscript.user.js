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
(function(){"use strict";const de={info:(...e)=>console.log("[Tampermonkey Script] INFO:",...e),error:(...e)=>console.error("[Tampermonkey Script] ERROR:",...e),warn:(...e)=>console.warn("[Tampermonkey Script] WARN:",...e)};function Ie(){GM_addStyle(`
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

        .btn-scan { background: #ff6200ff; color: #000; } .btn-scan:hover { background: #f2a500; }
        .btn-toggle-id { background: #ee0feeff; color: #ffffffff; } .btn-toggle-id:hover { background: #d2e3fc; }
        .btn-default-toggle { background: #17e050ff; color: #ffffffff; font-size: 14px; border: 1px solid transparent; } 
        .btn-default-toggle:hover { background: #ceead6; }
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
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); width: 220px;
            padding: 8px; display: flex; flex-direction: column; gap: 6px;
            animation: fadeIn 0.2s;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        
        .cw-row { display: flex; align-items: center; gap: 6px; justify-content: space-between; }
        .cw-map-label { font-size: 11px; font-weight: 600; color: #555; white-space: nowrap; }
        .cw-map-input { flex: 1; padding: 4px; border: 1px solid #ccc; border-radius: 4px; font-size: 10px; width: 120px; }
        .cw-map-hint { font-size: 9px; color: #888; margin-top: 4px; line-height: 1.2; }

        /* Menu Xem thêm (Dropdown) */
        .vnpt-more-menu {
            position: absolute;
            top: 100%;
            right: 0;
            background: #ffffff;
            border: 1px solid #dadce0;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            padding: 6px;
            display: none;
            flex-direction: column;
            gap: 4px;
            min-width: 120px;
            margin-top: 5px;
            animation: fadeIn 0.2s ease-out;
        }
        .vnpt-more-menu .vnpt-btn-action {
            justify-content: flex-start;
            width: 100%;
            padding: 0 10px;
            background: transparent;
            color: #3c4043;
        }
        .vnpt-more-menu .vnpt-btn-action:hover {
            background: #f1f3f4;
        }
        .btn-more { background: #f1f3f4; color: #3c4043; }
        .btn-more:hover { background: #e8eaed; }
        .btn-more.active { background: #dadce0; }

    `)}const r={widget:null,panel:null,header:null,toggleBtn:null,fieldsContainer:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1},k={tenDaiDienn:"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT",emailDaiDien:"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Số GPKD | MST",goiDV:"Gói Dịch Vụ",ngayKy:"Ngày ký",thangKy:"Tháng Ký",namKy:"Năm ký",soHopDong:"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký"},W="vnpt_docx_fields",X="vnpt_docx_position",G="vnpt_docx_size",pe="vnpt_docx_opened",z="vnpt_autofill_data_default",R="vnpt_autofill_data_custom",_="vnpt_autofill_data_sync",De="vnpt_widget_pos",ve="vnd_tax_rate",ue="vnd_before_history",fe="vnd_after_history",Y="vnpt_widget_collapsed",we="vnd_calc_map",V="vnpt_widget_datatab",Q="vnpt_templates";function x(e,o="#198754"){const t=document.createElement("div");t.innerText=e,Object.assign(t.style,{position:"fixed",bottom:"20px",left:"50%",transform:"translateX(-50%)",background:o,color:"#fff",padding:"7px 16px",borderRadius:"20px",zIndex:"100000",opacity:"0",transition:"opacity .25s",fontSize:"13px",fontFamily:"'Segoe UI',sans-serif",boxShadow:"0 4px 14px rgba(0,0,0,.25)"}),document.body.appendChild(t),setTimeout(()=>t.style.opacity="1",30),setTimeout(()=>{t.style.opacity="0",setTimeout(()=>t.remove(),280)},2200)}const Ae={local:{download(e,o="arraybuffer"){return new Promise((t,a)=>{const n=new FileReader;switch(n.onload=i=>{let l=i.target.result;o==="base64"&&typeof l=="string"&&(l=l.split(",")[1]||l),t(l)},n.onerror=i=>a(i),o.toLowerCase()){case"arraybuffer":n.readAsArrayBuffer(e);break;case"base64":case"dataurl":n.readAsDataURL(e);break;case"text":n.readAsText(e);break;default:a(new Error(`Unsupported read type: ${o}`))}})},async upload(e){return this.download(e,"base64")}}},Oe={getAdapter(e){const o=Ae[e];if(!o)throw new Error(`Storage adapter not found: ${e}`);return o},async upload(e,o,t={}){return await this.getAdapter(e).upload(o,t)},async download(e,o,t={}){return await this.getAdapter(e).download(o,t.type||"arraybuffer")}},He="vnpt_templates_db",A="buffers";let Z=null;function ge(){return Z?Promise.resolve(Z):new Promise((e,o)=>{const t=indexedDB.open(He,1);t.onupgradeneeded=a=>{const n=a.target.result;n.objectStoreNames.contains(A)||n.createObjectStore(A)},t.onsuccess=a=>{Z=a.target.result,e(Z)},t.onerror=()=>o(t.error)})}async function Me(e,o){const t=await ge();return new Promise((a,n)=>{const s=t.transaction(A,"readwrite").objectStore(A).put(o,e);s.onsuccess=()=>a(),s.onerror=()=>n(s.error)})}async function _e(e){const o=await ge();return new Promise((t,a)=>{const l=o.transaction(A,"readonly").objectStore(A).get(e);l.onsuccess=()=>t(l.result),l.onerror=()=>a(l.error)})}async function ze(e){const o=await ge();return new Promise((t,a)=>{const l=o.transaction(A,"readwrite").objectStore(A).delete(e);l.onsuccess=()=>t(),l.onerror=()=>a(l.error)})}function q(){try{const e=JSON.parse(localStorage.getItem(Q))||[],o=e.filter(t=>t.type!=="local");return o.length!==e.length&&U(o),o}catch{return[]}}function U(e){localStorage.setItem(Q,JSON.stringify(e))}function Re(e){const o=e.match(/drive\.google\.com\/file\/d\/([^/]+)/);return o?`https://drive.google.com/uc?export=download&id=${o[1]}`:e}function Ke(e){return new Promise((o,t)=>{GM_xmlhttpRequest({method:"GET",url:Re(e),responseType:"arraybuffer",onload:a=>{if(a.status>=200&&a.status<300){if(a.response&&a.response.byteLength>4){const n=new Uint8Array(a.response.slice(0,4));if(n[0]===80&&n[1]===75&&n[2]===3&&n[3]===4){o(a.response);return}else{t(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}o(a.response)}else t(new Error(`HTTP ${a.status}: Không lấy được file`))},onerror:()=>t(new Error("Không thể tải URL.")),ontimeout:()=>t(new Error("Timeout khi tải URL."))})})}async function Pe(e,o,t){const a=e.name.replace(/\.docx$/i,""),n=prompt("Đặt tên biến nhớ cho file này:",a);if(!(!n||!n.trim()))try{const i=await e.arrayBuffer();await Me(n.trim(),i);const s=q().filter(c=>c.name!==n.trim()&&c.fileName!==e.name);s.unshift({name:n.trim(),type:"local_idb",fileName:e.name,lastUsed:Date.now()}),U(s),O(o,t),t&&t(i,n.trim())}catch(i){x(`❌ Lỗi lưu file: ${i.message}`,"#dc3545")}}function O(e,o,t=null){let a=e.querySelector(".vnpt-template-manager-inner"),n,i;if(a)n=a.querySelector(".vnpt-local-list-container"),i=a.querySelector(".vnpt-btn-wrap");else{e.innerHTML="",a=document.createElement("div"),a.className="vnpt-template-manager-inner";const c=document.createElement("div");c.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const p=document.createElement("span");p.className="vnpt-title-main",p.style.cssText="font-size:11px;font-weight:700;color:#444;",i=document.createElement("div"),i.className="vnpt-btn-wrap",i.style.cssText="display:flex;gap:4px;",c.appendChild(p),c.appendChild(i),a.appendChild(c),n=document.createElement("div"),n.className="vnpt-local-list-container",n.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",a.appendChild(n),e.appendChild(a)}const l=q(),s=a.querySelector(".vnpt-title-main");s.innerHTML="Templates"+(t?` <span style="color:#2e7d32;">(Đang dùng: ${t})</span>`:""),l.length===0?n.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':n.innerHTML="",l.forEach((c,p)=>{const h=document.createElement("div");h.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",h.title=c.fileName||c.url||c.name,h.tabIndex=0,h.onfocus=()=>h.style.boxShadow="0 0 0 2px #28a745",h.onblur=()=>h.style.boxShadow="none";const d=c.type==="local"||c.type==="local_base64"||c.type==="local_idb"?"OFF":"ON",m=d==="OFF"?"#6c757d":"#28a745",u=document.createElement("span");u.textContent=d,u.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${m};color:#fff;`;const f=document.createElement("span");f.textContent=c.name,f.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",h.onclick=()=>{h.focus(),Fe(c,o,t,e)},h.appendChild(u),h.appendChild(f);const g=document.createElement("button");g.innerHTML="✎",g.title="Đổi tên template",g.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",g.onclick=E=>{E.stopPropagation();const v=prompt("Đổi tên template:",c.name);if(v&&v.trim()&&v.trim()!==c.name){const C=q();C[p].name=v.trim(),U(C),O(e,o,t)}},h.appendChild(g);const b=document.createElement("button");b.innerHTML="✕",b.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",b.onclick=async E=>{if(E.stopPropagation(),confirm(`Xoá biểu mẫu "${c.name}"?`)){const v=q();v.splice(p,1),U(v),c.type==="local_idb"&&await ze(c.name).catch(()=>null),O(e,o,t===c.name?null:t)}},h.appendChild(b),n.appendChild(h)})}function Fe(e,o,t,a){const n=q(),i=n.find(l=>l.name===e.name&&(l.url===e.url||l.type===e.type));if(i&&(i.lastUsed=Date.now(),U(n)),e.type==="local_idb"){_e(e.name).then(l=>{if(!l)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");o&&o(l,e.name),O(a,o,e.name)}).catch(l=>{x(`❌ Lỗi nạp File IDB: ${l.message}`,"#dc3545")});return}if(e.type==="local_base64"&&e.data){try{const l=window.atob(e.data.split(",")[1]),s=l.length,c=new Uint8Array(s);for(let p=0;p<s;p++)c[p]=l.charCodeAt(p);o&&o(c.buffer,e.name),O(a,o,e.name)}catch(l){x(`❌ Lỗi nạp Base64: ${l.message}`,"#dc3545")}return}Ke(e.url).then(l=>{o&&o(l,e.name),O(a,o,e.name)}).catch(l=>{x(`❌ ${l.message}`,"#dc3545")})}function Ve(e){e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function ee(e,o){var n;if(!e||e.disabled||e.readOnly)return;const t=e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,a=(n=Object.getOwnPropertyDescriptor(t,"value"))==null?void 0:n.set;a?a.call(e,o):e.value=o,Ve(e)}function te(e){const o=document.getElementById(e);if(o&&(o.tagName==="INPUT"||o.tagName==="TEXTAREA"))return o;for(const t of document.querySelectorAll("label"))if(t.textContent.trim()===e){if(t.htmlFor){const n=document.getElementById(t.htmlFor);if(n)return n}let a=t.parentElement;for(;a;){const n=a.querySelector("input,textarea");if(n)return n;if(a=a.parentElement,(a==null?void 0:a.tagName)==="FORM")break}}return null}function ne(e){for(const o of document.querySelectorAll("label"))if(o.innerText.trim()===e)return o.parentElement.querySelector("input, textarea");return null}function I(e,o){const t=te(e)||ne(e);t&&ee(t,o)}const me=new Date,he=String(me.getDate()).padStart(2,"0"),oe=String(me.getMonth()+1).padStart(2,"0"),ae=String(me.getFullYear()),j={ngayKy:he,thangKy:oe,namKy:ae,ngayTiepNhan:`${he}/${oe}/${ae}`,ngayThangNamKy:`${he}/${oe}/${ae}`,thangKy1:oe,namKy1:ae,tenDoanhNghiepB:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM",diaChiB:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội",maSoThueB:"0100686223",stkB:"1600114156",diaChiStkB:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)",tenB:"Phạm Khánh Chung",nguoiDaiDienB:"Phạm Khánh Chung",chucVuB:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",chucVuDaiDienB:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",giayUyQuyenSoB:"2628/GUQ-VNPT-HNI-VP",soGiayUyQuyenB:"2628/GUQ-VNPT-HNI-VP",giayUyQuyenNgayB:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",ngayGiayUyQuyenB:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",GiayUyQuyenB:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",tenDoanhNghiepB1:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",donViTiepNhan:"TTKD KHDN",tenTiepNhan:"Bùi Anh",tenNguoiNhan:"Bùi Anh",dienThoaiB:"02436686868",diaChiTaiKhoanB:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 ",noiKy:"Hà Nội",emailB:"",lienheHopDongB:"AM Bùi Anh",lienheTuVanB:"AM Bùi Anh",lienheHoaDonB:"AM Bùi Anh",sucoCap1B:"AM Bùi Anh",sucoCap2B:"AM Bùi Anh",sucoCap3B:"AM Bùi Anh",sucoCap4B:"AM Bùi Anh"},Se=["lienheHopDongA","lienheHoaDonA","lienheTuVanA","sucoCap1A","sucoCap2A","sucoCap3A","sucoCap4A"];function ie(e,o=null){try{const t=localStorage.getItem(e);return t!==null?JSON.parse(t):o}catch{return o}}function Ee(){const e=ie(z)??{...j},o=ie(R)??{},t={...e,...o};let a="";for(let n of Se){const i=te(n)||ne(n);if(i&&i.value){a=i.value;break}}a&&Se.forEach(n=>I(n,a)),Object.keys(t).forEach(n=>{let i=te(n)||ne(n);i&&ee(i,t[n])}),x("✅ Auto fill complete")}function qe(){let e=ie(_)??{};const o=Object.keys(e);if(o.length===0){x("⚠️ No sync mapping","#ffc107");return}o.forEach(t=>{let a=te(t)||ne(t);a&&a.value!==void 0&&a.value!==""&&e[t].split(",").map(i=>i.trim()).filter(i=>i).forEach(i=>I(i,a.value))}),x("✅ Sync form complete","#d39e00")}let be=!1;function Ue(){document.addEventListener("input",e=>{var l;if(be||!e.target||!["INPUT","TEXTAREA"].includes(e.target.tagName))return;let o=ie(_)??{};if(Object.keys(o).length===0)return;let t=e.target.id,a=e.target.name,n=null;if(t){const s=document.querySelector(`label[for="${t}"]`);s&&(n=s.textContent.trim())}if(!n){const s=e.target.closest("label");s&&(n=(l=Array.from(s.childNodes).find(c=>c.nodeType===3))==null?void 0:l.textContent.trim())}let i=o[t]||o[a]||o[n];if(i){be=!0;try{const s=e.target.value;i.split(",").map(p=>p.trim()).filter(p=>p).forEach(p=>{p!==t&&p!==a&&p!==n&&I(p,s)})}finally{be=!1}}})}function T(e,o,t=null,a=""){const n=r.fieldsContainer.querySelector(".text-hint");n&&n.remove();const i=r.fieldsContainer.querySelectorAll(".f-key");let l=!1;for(let s of i)if(s.value.split(",")[0].trim()===e){const p=s.closest(".vnpt-field-row"),h=p.querySelector(".f-val"),d=p.querySelector(".f-label");o!==""&&(h.value=o),t!==null&&t!==""&&(d.value=t),a!==""&&(s.value.split(",").slice(1).map(m=>m.trim()).join(", "),s.value=e+", "+a),l=!0;break}if(!l){(t===null||t==="")&&(t=k[e]||"");const s=document.createElement("div");s.className="vnpt-field-row row-item",s.setAttribute("draggable","false");let c=e;a&&(c+=", "+a),s.innerHTML=`
            <input type="checkbox" class="row-chk" title="Chọn để thao tác hàng loạt" style="margin: 0 2px 0 2px;" />
            <input type="text" class="f-label" placeholder="Nhãn..." value="${t}" />
            <input type="text" class="f-key" placeholder="Mã biến / IDs đồng bộ" value="${c}" title="Biến DOCX (đầu tiên), theo sau là các ID web cách dấu phẩy" />
            <span class="row-drag-handle" title="Kéo thả để di chuyển">=</span>
            <input type="text" class="f-val" placeholder="Giá trị" value="${o}" />
        `;const p=s.querySelector(".f-val"),h=s.querySelector(".f-key");e==="tenToChuc"&&(p.style.textAlign="right"),h.addEventListener("keyup",function(){B();const m=this.value.split(",")[0].trim();p.style.textAlign=m==="tenToChuc"?"right":""}),s.querySelector(".f-label").addEventListener("keyup",B),p.addEventListener("keyup",function(){if(r.isDefaultMode&&!this.dataset.warned){if(!confirm("⚠️ Bạn đang chỉnh sửa dữ liệu mặc định. Thay đổi này sẽ không được lưu vào cấu hình cá nhân. Tiếp tục?")){re();return}this.dataset.warned="true"}B();const u=h.value.split(",").map(f=>f.trim()).filter(f=>f);u.length>0&&u.forEach(f=>I(f,this.value))}),p.addEventListener("focus",function(){r.isDefaultMode&&this.dataset.warned});const d=s.querySelector(".row-drag-handle");d.addEventListener("mouseenter",()=>s.setAttribute("draggable","true")),d.addEventListener("mouseleave",()=>{s.classList.contains("dragging")||s.setAttribute("draggable","false")}),s.addEventListener("dragstart",function(m){r.draggedRowForVNPT=this,m.dataTransfer.effectAllowed="move",m.dataTransfer.setData("text/plain",e),this.classList.add("dragging")}),s.addEventListener("dragover",function(m){return m.preventDefault(),m.dataTransfer.dropEffect="move",!1}),s.addEventListener("dragenter",function(m){this.classList.add("over")}),s.addEventListener("dragleave",function(m){this.classList.remove("over")}),s.addEventListener("drop",function(m){if(m.stopPropagation(),r.draggedRowForVNPT&&r.draggedRowForVNPT!==this){const u=Array.from(r.fieldsContainer.querySelectorAll(".vnpt-field-row")),f=u.indexOf(r.draggedRowForVNPT),g=u.indexOf(this);f<g?this.parentNode.insertBefore(r.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(r.draggedRowForVNPT,this),B()}return!1}),s.addEventListener("dragend",function(m){this.setAttribute("draggable","false"),r.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(f=>{f.classList.remove("over"),f.classList.remove("dragging")}),r.draggedRowForVNPT=null}),r.fieldsContainer.appendChild(s),r.fieldsContainer.scrollTop=r.fieldsContainer.scrollHeight}}async function B(){if(r.isDefaultMode)return;const e={};r.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(t=>{const n=t.querySelector(".f-key").value.trim().split(",").map(p=>p.trim()).filter(p=>p),i=n[0],l=n.slice(1).join(", "),s=t.querySelector(".f-label").value.trim(),c=t.querySelector(".f-val").value;i&&(e[i]={label:s,value:c,sync:l})}),localStorage.setItem(W,JSON.stringify(e))}async function re(){try{r.fieldsContainer.innerHTML="";const e=JSON.parse(localStorage.getItem(W))||{};Object.keys(k).forEach(o=>{const t=k[o],a=e[o];a&&typeof a=="object"?T(o,a.value,a.label||t,a.sync||""):a?T(o,a,t,""):T(o,"",t,"")}),Object.keys(e).forEach(o=>{if(!(o in k)){const t=e[o];typeof t=="object"?T(o,t.value,t.label,t.sync||""):T(o,t,"","")}}),Object.keys(k).length===0&&Object.keys(e).length===0&&(r.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(e){console.error("Error loading config:",e),Object.keys(k).forEach(o=>{T(o,"",k[o])})}try{const e=JSON.parse(localStorage.getItem(X));e&&r.widget&&(r.widget.style.bottom="auto",e.right?(r.widget.style.right=e.right,r.widget.style.left="auto"):e.left&&(r.widget.style.left=e.left,r.widget.style.right="auto"),e.top&&(r.widget.style.top=e.top))}catch{}}function je(){document.getElementById("vnpt-btn-toggle-id").addEventListener("click",function(){r.fieldsContainer.classList.toggle("show-ids")}),document.getElementById("vnpt-btn-default").addEventListener("click",$e),document.getElementById("vnpt-btn-batch-del").addEventListener("click",function(){if(r.isDefaultMode){x("⚠️ Không thể xóa ở chế độ Dữ liệu mặc định","#ffc107");return}const e=r.fieldsContainer.querySelectorAll(".vnpt-field-row");let o=0;e.forEach(t=>{const a=t.querySelector(".row-chk");a&&a.checked&&(t.remove(),o++)}),o===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(e.forEach(t=>t.remove()),x("🗑️ Đã xóa toàn bộ","#ff5252"),B()):(x(`🗑️ Đã xóa ${o} trường`,"#ff5252"),B())}),document.getElementById("vnpt-btn-add").addEventListener("click",function(){if(r.isDefaultMode){x("⚠️ Không thể thêm ở chế độ Dữ liệu mặc định","#ffc107");return}const e=r.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;T("bien_moi_"+e,"","",""),B()}),document.getElementById("vnpt-btn-fill-back").addEventListener("click",function(){Ee();const e=r.fieldsContainer.querySelectorAll(".vnpt-field-row");let o=0;e.forEach(t=>{const a=t.querySelector(".f-key").value.trim(),n=t.querySelector(".f-val").value;a.split(",").map(l=>l.trim()).filter(Boolean).forEach(l=>{(document.getElementById(l)||document.getElementsByName(l)[0])&&(I(l,n),o++)})}),o>0?x(`✅ Đã điền ngược ${o} trường vào web`,"#198754"):x("⚠️ Không có trường nào khớp","#ffc107")})}function $e(){r.isDefaultMode=!r.isDefaultMode;const e=document.getElementById("vnpt-btn-default");if(r.fieldsContainer.innerHTML="",r.bannerArea.innerHTML="",r.isDefaultMode){e.classList.add("active"),r.fieldsContainer.classList.add("vnpt-mode-default"),x("📌 Chế độ xem Dữ liệu mặc định","#ea4335");const o=document.createElement("div");o.className="vnpt-default-banner",o.innerHTML=`
            <span>📌 Đang xem Dữ liệu mặc định</span>
        `,r.bannerArea.appendChild(o),Object.keys(j).forEach(t=>{T(t,j[t],k[t]||"")})}else e.classList.remove("active"),r.fieldsContainer.classList.remove("vnpt-mode-default"),x("📋 Đã quay lại Dữ liệu cá nhân"),re()}function Je(){const e={version:"1.0",timestamp:Date.now(),fields:JSON.parse(localStorage.getItem(W))||{},templates:JSON.parse(localStorage.getItem(Q))||[],position:JSON.parse(localStorage.getItem(X))||null,size:JSON.parse(localStorage.getItem(G))||null,calc:{default:JSON.parse(localStorage.getItem(z))||null,custom:JSON.parse(localStorage.getItem(R))||null,sync:JSON.parse(localStorage.getItem(_))||null}},o=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),t=URL.createObjectURL(o),a=document.createElement("a");a.href=t,a.download=`vnpt_config_${new Date().toISOString().slice(0,10)}.json`,a.click(),URL.revokeObjectURL(t),x("📤 Đã xuất cấu hình JSON")}function We(){const e=document.createElement("input");e.type="file",e.accept=".json",e.onchange=async o=>{const t=o.target.files[0];if(t)try{const a=await t.text(),n=JSON.parse(a);if(!n.fields&&!n.calc)throw new Error("Định dạng file không hợp lệ!");n.fields&&localStorage.setItem(W,JSON.stringify(n.fields)),n.templates&&localStorage.setItem(Q,JSON.stringify(n.templates)),n.position&&localStorage.setItem(X,JSON.stringify(n.position)),n.size&&localStorage.setItem(G,JSON.stringify(n.size)),n.calc&&(n.calc.default&&localStorage.setItem(z,JSON.stringify(n.calc.default)),n.calc.custom&&localStorage.setItem(R,JSON.stringify(n.calc.custom)),n.calc.sync&&localStorage.setItem(_,JSON.stringify(n.calc.sync))),await re();const i=document.getElementById("vnpt-template-manager");i&&O(i,(l,s)=>{r.templateBuffer=l,r.templateName=s}),n.position&&r.widget&&(n.position.right?(r.widget.style.right=n.position.right,r.widget.style.left="auto"):n.position.left&&(r.widget.style.left=n.position.left,r.widget.style.right="auto"),n.position.top&&(r.widget.style.top=n.position.top),r.widget.style.bottom="auto"),n.size&&r.panel&&(r.panel.style.width=n.size.width+"px",r.panel.style.height=n.size.height+"px"),x("✅ Nhập cấu hình thành công!")}catch(a){console.error("Lỗi Import:",a),alert("Lỗi: "+a.message)}},e.click()}function Xe(){const e=document.createElement("div");e.id="vnpt-docx-widget";const o=localStorage.getItem(pe)==="true";e.innerHTML=`
        <button id="vnpt-toggle-btn" title="Mở/Đóng UI Hợp đồng" class="${o?"btn-opened":"btn-closed"}">${o?"✖":"📄"}</button>

        <div id="vnpt-export-panel" style="display: ${o?"flex":"none"};">
            <div id="vnpt-panel-header" title="Kẹp chuột vào đây để di chuyển">
                <span id="vnpt-panel-title">VNPT PRO</span>
                <div class="btn-row" style="margin-bottom: 0; padding-right: 35px; gap: 4px; position: relative;">
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-scan" title="Lấy data theo biểu mẫu web">Scan</button>
                    <button class="vnpt-btn-action btn-fill-back" id="vnpt-btn-fill-back" title="Điền dữ liệu ngược lên web">Điền thông tin</button>
                    
                    <button class="vnpt-btn-action btn-toggle-id" id="vnpt-btn-toggle-id" title="Ẩn/Hiện Mã ID">Nhập key</button>
                    <button class="vnpt-btn-action btn-default-toggle" id="vnpt-btn-default" title="Dữ liệu mặc định VNPT">Mặc định</button>
                    <button class="vnpt-btn-action btn-add" id="vnpt-btn-add" title="Chèn thêm trường trống">➕</button>
                    <button class="vnpt-btn-action btn-clean" id="vnpt-btn-batch-del" title="Xóa chọn / Xóa tất cả">🗑️</button>
                    <!-- Nút Xem thêm và Menu ẩn -->
                    <div style="position: relative; display: flex;">
                        <button class="vnpt-btn-action btn-more" id="vnpt-btn-more" title="Cấu hình & Tiện ích khác">⚙️</button>
                        <div id="vnpt-more-menu" class="vnpt-more-menu" style="display: none;">
                            <button class="vnpt-btn-action btn-import" id="vnpt-btn-import" title="Nhập cấu hình JSON">📥 Nhập JSON</button>
                            <button class="vnpt-btn-action btn-export-json" id="vnpt-btn-export-json" title="Xuất cấu hình JSON">📤 Xuất JSON</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Inline Calculator Container -->
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
    `,document.body.appendChild(e),r.widget=e,r.panel=document.getElementById("vnpt-export-panel"),r.toggleBtn=document.getElementById("vnpt-toggle-btn"),r.header=document.getElementById("vnpt-panel-header"),r.bannerArea=document.getElementById("vnpt-banner-area"),r.fieldsContainer=document.getElementById("vnpt-fields-container");try{const i=JSON.parse(localStorage.getItem(G));i&&i.width&&i.height&&(r.panel.style.width=i.width+"px",r.panel.style.height=i.height+"px")}catch(i){console.error("Lỗi load size panel:",i)}new ResizeObserver(i=>{if(r.panel.style.display!=="none")for(let l of i){const{width:s,height:c}=l.contentRect;s>0&&c>0&&localStorage.setItem(G,JSON.stringify({width:Math.round(s+20),height:Math.round(c+20)}))}}).observe(r.panel),r.panelBody=document.getElementById("vnpt-panel-body"),O(document.getElementById("vnpt-template-manager"),(i,l)=>{r.templateBuffer=i,r.templateName=l}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const i=this.files&&this.files[0];if(!i)return;const l=document.getElementById("vnpt-template-manager");Pe(i,l,(s,c)=>{r.templateBuffer=s,r.templateName=c}),this.value=""}),r.toggleBtn.addEventListener("click",i=>{r.hasDragged||(r.panel.style.display==="none"?(r.panel.style.display="flex",r.toggleBtn.className="btn-opened",r.toggleBtn.innerHTML="✖",localStorage.setItem(pe,"true")):(r.panel.style.display="none",r.toggleBtn.className="btn-closed",r.toggleBtn.innerHTML="📄",localStorage.setItem(pe,"false")))}),document.getElementById("vnpt-btn-import").onclick=i=>{We(),document.getElementById("vnpt-more-menu").style.display="none"},document.getElementById("vnpt-btn-export-json").onclick=i=>{Je(),document.getElementById("vnpt-more-menu").style.display="none"};const a=document.getElementById("vnpt-btn-more"),n=document.getElementById("vnpt-more-menu");a.onclick=i=>{i.stopPropagation();const l=n.style.display==="none";n.style.display=l?"flex":"none",a.classList.toggle("active",l)},document.addEventListener("click",()=>{n.style.display="none",a.classList.remove("active")})}function Ne(e,o,t,a=null,n=null){let i=!1,l=0,s=0,c=!1;function p(d){c!==d&&(c=d,n&&n(d))}function h(d){if(d.button!==0)return;i=!0,r.hasDragged=!1;const m=e.getBoundingClientRect();l=d.clientX-m.left,s=d.clientY-m.top,document.body.style.userSelect="none",o&&o.forEach(u=>u.style.cursor="grabbing"),a&&a(),d.preventDefault()}return o.forEach(d=>{d.addEventListener("mousedown",h)}),document.addEventListener("mousemove",function(d){if(!i)return;r.hasDragged=!0;let m=d.clientX-l,u=d.clientY-s;const f=window.innerWidth,g=window.innerHeight,b=document.getElementById("vnpt-toggle-btn"),E=b?b.offsetWidth:40,v=b?b.offsetHeight:40,C=e.id==="vnpt-docx-widget";let N=e.offsetWidth||0;if(C){let S=E+6-N,w=f-N+6;m<S&&(m=S),m>w&&(m=w)}else N=N||200,m<0&&(m=0),m+N>f&&(m=Math.max(0,f-N));let y=c;if(C?y=!1:c?d.clientY<g-40&&(y=!1):d.clientY>g-10&&(y=!0),u<0&&(u=0),y)p(!0),e.style.top=g-e.offsetHeight+"px",C?(e.style.right=f-m-N+"px",e.style.left="auto"):(e.style.left=m+"px",e.style.right="auto"),e.style.bottom="auto";else{p(!1);let L=e.offsetHeight||40,S;if(C)S=10+v;else{const w=e.querySelector(".cw-title-bar");S=w?w.offsetHeight:L}u+S>g&&(u=Math.max(0,g-S)),e.style.top=u+"px",C?(e.style.right=f-m-N+"px",e.style.left="auto"):(e.style.left=m+"px",e.style.right="auto"),e.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(i&&(i=!1,document.body.style.userSelect="",o&&o.forEach(d=>d.style.cursor="grab"),t)){const d=e.id==="vnpt-docx-widget";localStorage.setItem(t,JSON.stringify({left:d?void 0:e.style.left,right:d?e.style.right:void 0,top:e.style.top,x:d?void 0:parseFloat(e.style.left),y:parseFloat(e.style.top),docked:c}))}}),{isDocked:()=>c,setDocked:p}}function Ge(){r.widget&&r.header&&r.toggleBtn&&(Ne(r.widget,[r.header,r.toggleBtn],X),window.addEventListener("resize",()=>{const e=window.innerWidth,o=window.innerHeight,t=document.getElementById("vnpt-toggle-btn"),a=t?t.offsetWidth:40,n=t?t.offsetHeight:40;let i=r.widget.getBoundingClientRect(),l=i.left,s=i.top,c=r.widget.offsetWidth||0,h=a+6-c,d=e-c+6;l<h&&(l=h),l>d&&(l=d),s+10+n>o&&(s=Math.max(0,o-(10+n))),r.widget.style.right=e-l-c+"px",r.widget.style.top=s+"px"}))}function ke(e){const o=e.toLowerCase(),t=new Date;return{ngayky:String(t.getDate()).padStart(2,"0"),thangky:String(t.getMonth()+1).padStart(2,"0"),thangky1:String(t.getMonth()+1).padStart(2,"0"),namky:String(t.getFullYear()),namky1:String(t.getFullYear()),soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[o]||""}function Ye(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){let e=0;Object.keys(k).forEach(o=>{var n;const t=document.getElementById(o);let a="";t&&(a=t.tagName.toLowerCase()==="select"?((n=t.options[t.selectedIndex])==null?void 0:n.text)||"":t.value,e++),a||(a=ke(o)),T(o,a,null)}),B(),e>0?(this.style.background="#34a853",this.style.color="#fff",this.innerText="Done",setTimeout(()=>{this.style.background="#fbbc04",this.style.color="#000",this.innerText="Quét"},1e3)):x("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(e){e.target&&e.target.id&&k[e.target.id]!==void 0&&(T(e.target.id,e.target.value,null),B())}),document.addEventListener("change",function(e){var o;if(e.target&&e.target.id&&k[e.target.id]!==void 0){let t=e.target.tagName.toLowerCase()==="select"?((o=e.target.options[e.target.selectedIndex])==null?void 0:o.text)||"":e.target.value;T(e.target.id,t,null),B()}})}function Te(e,o,t){try{let a;try{a=new window.PizZip(e)}catch(c){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(c);return}const n=new window.docxtemplater(a,{paragraphLoop:!0,linebreaks:!0});n.render(o);const i=n.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),l=URL.createObjectURL(i),s=document.createElement("a");s.href=l,s.download=t,document.body.appendChild(s),s.click(),setTimeout(()=>{document.body.removeChild(s),URL.revokeObjectURL(l)},100)}catch(a){let n=a.message;a.properties&&a.properties.errors instanceof Array?n=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+a.properties.errors.map(l=>"- "+(l.properties.explanation||l.message)).join(`
`):n="Lỗi phần mềm Word sinh ra: "+n,alert(n),console.error("DocX Error:",a)}}function Qe(){const e=document.getElementById("vnpt-export-filename");e&&e.addEventListener("input",()=>{e.dataset.userEdited="1",e.value.trim()||(e.dataset.userEdited="0")});function o(){if(!e||e.dataset.userEdited==="1")return;let t="";if(r.fieldsContainer&&r.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(c=>{const h=c.querySelector(".f-key").value.trim().split(",")[0].trim(),d=c.querySelector(".f-val").value.trim();h==="tenToChuc"&&(t=d)}),!t){const s=document.getElementById("tenToChuc");s&&(t=s.tagName.toLowerCase()==="textarea"||s.tagName.toLowerCase()==="input"?s.value.trim():s.innerText.trim())}function a(s){if(!s)return"";let c=s;return c=c.replace(/Tổng công ty/gi,""),c=c.replace(/Công ty/gi,""),c=c.replace(/\bCty\b/gi,""),c=c.replace(/Trách nhiệm hữu hạn/gi,""),c=c.replace(/\bTNHH\b/gi,""),c=c.replace(/Cổ phần/gi,""),c=c.replace(/\bCP\b/gi,""),c=c.replace(/Một thành viên/gi,""),c=c.replace(/\bMTV\b/gi,""),c=c.replace(/Chi nhánh/gi,""),c=c.replace(/Việt Nam/gi,"VN"),c=c.replace(/Viet Nam/gi,"VN"),c=c.replace(/\s+/g," ").trim(),c=c.replace(/^[-,\s]+|[-,\s]+$/g,""),c.length>50&&(c=c.substring(0,47)+"..."),c.replace(/[<>:"/\\|?*]/g,"")}let n=a(t),i=r.templateName?r.templateName.replace(/\.docx$/i,""):"",l=[];n&&l.push(n),i&&l.push(i),l.length>0?e.value=l.join(" - ")+".docx":e.value||(e.value="HopDong_Auto.docx")}setInterval(o,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const t={};if(r.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(l=>{const c=l.querySelector(".f-key").value.trim().split(",")[0].trim(),p=l.querySelector(".f-val").value;c&&(t[c]=p)}),Object.keys(t).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}let n=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(n.toLowerCase().endsWith(".docx")||(n+=".docx"),r.templateBuffer){Te(r.templateBuffer,t,n);return}const i=document.getElementById("vnpt-template-file");if(i.files&&i.files.length>0){Oe.download("local",i.files[0],{type:"arraybuffer"}).then(l=>Te(l,t,n)).catch(l=>alert(`Lỗi đọc file: ${l.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')})}const Ze=["chucVu","noiCap","noiCapSoDkdn","ngayky","thangky","namky","thangky1","namky1","noiKy"],et=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function tt(){function e(){Ze.forEach(a=>{const n=document.getElementById(a);n&&!n.dataset.filled&&(n.dataset.filled="1",ee(n,ke(a)))}),et.forEach(a=>{const n=document.getElementById(a.src),i=document.getElementById(a.target);n&&i&&!n.dataset.bound&&(n.dataset.bound="1",n.addEventListener("input",()=>ee(i,n.value)))})}let o;new MutationObserver(()=>{clearTimeout(o),o=setTimeout(e,200)}).observe(document.body,{childList:!0,subtree:!0}),e()}function K(e,o=null){try{const t=localStorage.getItem(e);return t!==null?JSON.parse(t):o}catch{return o}}function $(e,o){localStorage.setItem(e,JSON.stringify(o))}function Ce(e,o){if(!o||o.replace(/\D/g,"").length<6)return;let t=K(e,[]);t=t.filter(a=>a!==o),t.unshift(o),$(e,t.slice(0,10))}function le(e,o){const t=document.getElementById(o);t&&(t.innerHTML=K(e,[]).map(a=>`<option value="${a}">`).join(""))}function ye(e){return e.toLocaleString("en-US")}function xe(e){return Number(String(e).replace(/[^\d]/g,""))||0}function nt(e){return e.charAt(0).toUpperCase()+e.slice(1)}const J=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function ot(e){let o=Math.floor(e/100),t=Math.floor(e%100/10),a=e%10,n="";return o>0&&(n+=J[o]+" trăm ",t===0&&a>0&&(n+="lẻ ")),t>1?(n+=J[t]+" mươi ",a===1?n+="mốt":a===5?n+="lăm":a>0&&(n+=J[a])):t===1?(n+="mười ",a===5?n+="lăm":a>0&&(n+=J[a])):a>0&&(o>0&&(n+="lẻ "),n+=J[a]),n.trim()}function at(e){if(e===0)return"không";const o=["","nghìn","triệu","tỷ"];let t="",a=0;for(;e>0;){const n=e%1e3;n>0&&(t=ot(n)+" "+o[a]+" "+t),e=Math.floor(e/1e3),a++}return t.trim()}function Le(e,o,t){let a=0,n=0,i=0;e==="before"?(a=xe(o),n=Math.round(a*t),i=a+n):e==="tax"?(n=xe(o),a=Math.round(n/t),i=a+n):e==="after"&&(i=xe(o),a=Math.round(i/(1+t)),n=i-a);const l=nt(at(i))+" đồng";return{beforeNum:a,taxNum:n,afterNum:i,beforeStr:ye(a),taxStr:ye(n),afterStr:ye(i),textStr:l}}function it(e,o){o.before&&o.before.forEach(t=>I(t,e.beforeStr)),o.tax&&o.tax.forEach(t=>I(t,e.taxStr)),o.after&&o.after.forEach(t=>I(t,e.afterStr)),o.text&&o.text.forEach(t=>I(t,e.textStr))}function ce(e,o=null){try{const t=localStorage.getItem(e);return t!==null?JSON.parse(t):o}catch{return o}}function D(e,o){localStorage.setItem(e,JSON.stringify(o))}function rt(e,o,t,a){let n=ce(V)??"custom",i=ce(z)??{...j},l=ce(R)??{},s=ce(_)??{};const c=document.createElement("div");c.className="cw-tab-header";const p={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};p.custom.innerText="📋 Custom",p.custom.className="cw-tab cw-tab-custom",p.default.innerText="📌 Default",p.default.className="cw-tab cw-tab-default",p.sync.innerText="🔗 Sync",p.sync.className="cw-tab cw-tab-sync";function h(){Object.values(p).forEach(y=>y.classList.remove("active")),p[n].classList.add("active")}h();const d=document.createElement("div");d.style.display=a.data?"none":"block";const m=o("📋 Cấu hình Data","data",y=>{d.style.display=y?"none":"block",t(e)}),u=document.createElement("div");u.className="cw-data-body";function f(){u.innerHTML="";let y=n==="sync"?s:n==="custom"?l:i,L=n==="sync"?_:n==="custom"?R:z;const S=Object.keys(y);S.length===0&&n!=="default"&&(u.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),S.forEach(w=>{const P=document.createElement("div");P.className="cw-data-row";let se=n!=="default";const H=document.createElement("input");H.type="text",H.value=w,H.className="cw-data-key"+(se?" mutable":""),H.readOnly=!se,se&&(H.onchange=()=>{const M=H.value.trim();if(!M||M===w){H.value=w;return}y[M]=y[w],delete y[w],D(L,y),f()});const F=document.createElement("input");if(F.type="text",F.value=y[w]??"",F.className="cw-data-val",F.oninput=()=>{y[w]=F.value,D(L,y)},P.appendChild(H),P.appendChild(F),se){const M=document.createElement("button");M.innerHTML="✕",M.className="cw-del-btn",M.onclick=()=>{confirm(`Delete "${w}"?`)&&(delete y[w],D(L,y),f())},P.appendChild(M)}else P.appendChild(document.createElement("div")).className="cw-pad";u.appendChild(P)})}p.custom.onclick=()=>{n="custom",D(V,"custom"),h(),f()},p.default.onclick=()=>{n="default",D(V,"default"),h(),f()},p.sync.onclick=()=>{n="sync",D(V,"sync"),h(),f()};const g=document.createElement("button");g.innerText="📤",g.className="cw-icon-btn",g.onclick=()=>{const y=new Blob([JSON.stringify({defaultData:i,customData:l,syncData:s},null,2)],{type:"application/json"}),L=URL.createObjectURL(y),S=document.createElement("a");S.href=L,S.download=`vnpt_data_${Date.now()}.json`,S.click(),URL.revokeObjectURL(L)},d.appendChild(c),c.appendChild(p.custom),c.appendChild(p.default),c.appendChild(p.sync),d.appendChild(u),e.appendChild(m),e.appendChild(d);const b=e.querySelector("#vnpt-cw-fill"),E=e.querySelector("#vnpt-cw-sync"),v=e.querySelector("#vnpt-cw-add"),C=e.querySelector("#vnpt-cw-reset");b&&(b.onclick=Ee),E&&(E.onclick=qe),v&&(v.onclick=()=>{n==="default"&&(n="custom",D(V,"custom"),h());let y=n==="sync"?s:l,L="new_field_"+Date.now();y[L]="",D(n==="sync"?_:R,y),f(),u.scrollTop=u.scrollHeight}),C&&(C.onclick=()=>{confirm("Reset Default Data?")&&(i={...j},D(z,i),f())}),f();const N=m.querySelector(".cw-right-wrap")||document.createElement("div");N.className="cw-right-wrap",N.prepend(g),m.appendChild(N)}function lt(e,o,t){let a=Number(localStorage.getItem(ve))||.08,n=K(Y)??{calc:!1,data:!0},i=K(we)??{};function l(u,f){const g=document.createElement("button");return g.innerText=u,g.className="cw-action-btn "+f,g}function s(u,f,g){const b=document.createElement("div");b.className="wg-sec-header";const E=document.createElement("span");E.innerText=u;const v=document.createElement("button");return v.className="wg-toggle-btn",v.innerText=n[f]?"▾":"▴",b.appendChild(E),b.appendChild(v),v.onclick=()=>{n[f]=!n[f],v.innerText=n[f]?"▾":"▴",$(Y,n),g(n[f])},b}function c(u){const f=window.innerWidth,g=window.innerHeight,b=u.getBoundingClientRect();u.style.left=Math.min(Math.max(parseFloat(u.style.left),0),f-b.width)+"px",u.style.top=Math.min(Math.max(parseFloat(u.style.top),0),g-36)+"px"}const p=document.createElement("div");if(!o){p.className="cw-title-bar",p.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const u=document.createElement("div");u.className="cw-btn-group";const f={fill:l("Fill","cw-btn-fill"),sync:l("Sync","cw-btn-sync"),add:l("Add","cw-btn-add"),reset:l("↺","cw-btn-reset")};f.reset.title="Reset Default fields",Object.values(f).forEach(g=>u.appendChild(g)),p.appendChild(u),e.appendChild(p)}const h=document.createElement("div");h.className="cw-body-inline",h.innerHTML=`
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
    </div>`,o?o.appendChild(h):e.appendChild(h),o||rt(e,s,c,n);const d={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text"),mapBtn:document.getElementById("wg-calc-map-btn"),mapWrap:document.getElementById("wg-calc-map-wrap")};d.taxRate.value=a*100,le(ue,"wg-before-list"),le(fe,"wg-after-list");function m(u,f){const g=Le(u,f,a);d.before.value=g.beforeStr,d.tax.value=g.taxStr,d.after.value=g.afterStr,d.text.value=g.textStr,it(g,i)}if(d.taxRate.oninput=()=>{a=Number(d.taxRate.value)/100||0,$(ve,a),m("before",d.before.value)},d.before.oninput=()=>{const u=Le("before",d.before.value,a);d.tax.value=u.taxStr,d.after.value=u.afterStr,d.text.value=u.textStr},d.before.onchange=()=>{m("before",d.before.value),Ce(ue,d.before.value),le(ue,"wg-before-list")},d.tax.oninput=()=>m("tax",d.tax.value),d.after.oninput=()=>m("after",d.after.value),d.after.onchange=()=>{m("after",d.after.value),Ce(fe,d.after.value),le(fe,"wg-after-list")},[d.before,d.tax,d.after,d.text].forEach(u=>{["click","focus"].forEach(f=>u.addEventListener(f,()=>{if(!u.value)return;navigator.clipboard.writeText(u.value);const g=u.style.backgroundColor;u.style.backgroundColor="#d1e7dd",setTimeout(()=>u.style.backgroundColor=g,300)}))}),d.mapBtn.onclick=()=>{const u=d.mapWrap.style.display==="flex";if(d.mapWrap.style.display=u?"none":"flex",!u){const f=g=>{!d.mapWrap.contains(g.target)&&g.target!==d.mapBtn&&(d.mapWrap.style.display="none",document.removeEventListener("click",f))};setTimeout(()=>document.addEventListener("click",f),0)}},e.querySelectorAll("input[data-clink]").forEach(u=>{const f=u.dataset.clink;u.value=(i[f]||[]).join(", "),u.oninput=()=>{i[f]=u.value.split(",").map(g=>g.trim()).filter(g=>g),$(we,i)}}),!o){const u=Array.from(e.children).filter(b=>b!==p),f=Ne(e,[p],t,null,b=>{u.forEach(E=>E.style.display=b?"none":""),p.style.borderRadius=b?"8px":"0",b&&(e.style.top=window.innerHeight-(p.offsetHeight||34)+"px")}),g=K(t);return g&&g.docked&&f.setDocked(!0),window.addEventListener("resize",()=>{f.isDocked()?e.style.top=window.innerHeight-p.offsetHeight+"px":c(e)}),f}return null}function ct(){const e=document.getElementById("vnpt-inline-calc"),o=document.getElementById("vnpt-btn-calc-toggle");let t=r.calcWidget||document.createElement("div");if(!e&&!r.calcWidget?(t.id="vnpt-calc-widget",document.body.appendChild(t),r.calcWidget=t):e&&(t=r.widget),e&&o){let a=K(Y)??{calc:!1,data:!0};const n=i=>{e.style.display=i?"none":"block",o.classList.toggle("active",!i)};n(a.calc),o.onclick=()=>{a.calc=!a.calc,$(Y,a),n(a.calc)}}return lt(t,e,De)}function Be(){de.info("Initializing VNPT Userscript...");try{Ie(),Xe(),ct(),Ge(),je(),re(),Ye(),Qe(),tt(),Ue(),de.info("Userscript initialized successfully.")}catch(e){de.error("Error during userscript initialization:",e)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Be):Be()})();
