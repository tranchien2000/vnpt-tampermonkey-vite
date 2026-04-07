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
(function(){"use strict";const se={info:(...e)=>console.log("[Tampermonkey Script] INFO:",...e),error:(...e)=>console.error("[Tampermonkey Script] ERROR:",...e),warn:(...e)=>console.warn("[Tampermonkey Script] WARN:",...e)};function Ae(){GM_addStyle(`
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
        .btn-reset-default { background: #e8f0fe; color: #1a73e8; border: 1px solid #d2e3fc; font-size: 14px; }
        .btn-reset-default:hover { background: #d2e3fc; }
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

    `)}const c={widget:null,panel:null,header:null,toggleBtn:null,fieldsContainer:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1},k={tenDaiDienn:"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT",emailDaiDien:"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Số GPKD | MST",goiDV:"Gói Dịch Vụ",ngayKy:"Ngày ký",thangKy:"Tháng Ký",namKy:"Năm ký",soHopDong:"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký"},W="vnpt_docx_fields",de="vnpt_docx_default_fields",X="vnpt_docx_position",G="vnpt_docx_size",pe="vnpt_docx_opened",R="vnpt_autofill_data_default",K="vnpt_autofill_data_custom",M="vnpt_autofill_data_sync",Oe="vnpt_widget_pos",we="vnd_tax_rate",ue="vnd_before_history",fe="vnd_after_history",Y="vnpt_widget_collapsed",Se="vnd_calc_map",U="vnpt_widget_datatab",Q="vnpt_templates";function x(e,n="#198754"){const o=document.createElement("div");o.innerText=e,Object.assign(o.style,{position:"fixed",bottom:"20px",left:"50%",transform:"translateX(-50%)",background:n,color:"#fff",padding:"7px 16px",borderRadius:"20px",zIndex:"100000",opacity:"0",transition:"opacity .25s",fontSize:"13px",fontFamily:"'Segoe UI',sans-serif",boxShadow:"0 4px 14px rgba(0,0,0,.25)"}),document.body.appendChild(o),setTimeout(()=>o.style.opacity="1",30),setTimeout(()=>{o.style.opacity="0",setTimeout(()=>o.remove(),280)},2200)}const He={local:{download(e,n="arraybuffer"){return new Promise((o,a)=>{const t=new FileReader;switch(t.onload=i=>{let r=i.target.result;n==="base64"&&typeof r=="string"&&(r=r.split(",")[1]||r),o(r)},t.onerror=i=>a(i),n.toLowerCase()){case"arraybuffer":t.readAsArrayBuffer(e);break;case"base64":case"dataurl":t.readAsDataURL(e);break;case"text":t.readAsText(e);break;default:a(new Error(`Unsupported read type: ${n}`))}})},async upload(e){return this.download(e,"base64")}}},_e={getAdapter(e){const n=He[e];if(!n)throw new Error(`Storage adapter not found: ${e}`);return n},async upload(e,n,o={}){return await this.getAdapter(e).upload(n,o)},async download(e,n,o={}){return await this.getAdapter(e).download(n,o.type||"arraybuffer")}},Me="vnpt_templates_db",A="buffers";let Z=null;function ge(){return Z?Promise.resolve(Z):new Promise((e,n)=>{const o=indexedDB.open(Me,1);o.onupgradeneeded=a=>{const t=a.target.result;t.objectStoreNames.contains(A)||t.createObjectStore(A)},o.onsuccess=a=>{Z=a.target.result,e(Z)},o.onerror=()=>n(o.error)})}async function ze(e,n){const o=await ge();return new Promise((a,t)=>{const s=o.transaction(A,"readwrite").objectStore(A).put(n,e);s.onsuccess=()=>a(),s.onerror=()=>t(s.error)})}async function Re(e){const n=await ge();return new Promise((o,a)=>{const r=n.transaction(A,"readonly").objectStore(A).get(e);r.onsuccess=()=>o(r.result),r.onerror=()=>a(r.error)})}async function Ke(e){const n=await ge();return new Promise((o,a)=>{const r=n.transaction(A,"readwrite").objectStore(A).delete(e);r.onsuccess=()=>o(),r.onerror=()=>a(r.error)})}function j(){try{const e=JSON.parse(localStorage.getItem(Q))||[],n=e.filter(o=>o.type!=="local");return n.length!==e.length&&q(n),n}catch{return[]}}function q(e){localStorage.setItem(Q,JSON.stringify(e))}function Pe(e){const n=e.match(/drive\.google\.com\/file\/d\/([^/]+)/);return n?`https://drive.google.com/uc?export=download&id=${n[1]}`:e}function Fe(e){return new Promise((n,o)=>{GM_xmlhttpRequest({method:"GET",url:Pe(e),responseType:"arraybuffer",onload:a=>{if(a.status>=200&&a.status<300){if(a.response&&a.response.byteLength>4){const t=new Uint8Array(a.response.slice(0,4));if(t[0]===80&&t[1]===75&&t[2]===3&&t[3]===4){n(a.response);return}else{o(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}n(a.response)}else o(new Error(`HTTP ${a.status}: Không lấy được file`))},onerror:()=>o(new Error("Không thể tải URL.")),ontimeout:()=>o(new Error("Timeout khi tải URL."))})})}async function Ve(e,n,o){const a=e.name.replace(/\.docx$/i,""),t=prompt("Đặt tên biến nhớ cho file này:",a);if(!(!t||!t.trim()))try{const i=await e.arrayBuffer();await ze(t.trim(),i);const s=j().filter(l=>l.name!==t.trim()&&l.fileName!==e.name);s.unshift({name:t.trim(),type:"local_idb",fileName:e.name,lastUsed:Date.now()}),q(s),O(n,o),o&&o(i,t.trim())}catch(i){x(`❌ Lỗi lưu file: ${i.message}`,"#dc3545")}}function O(e,n,o=null){let a=e.querySelector(".vnpt-template-manager-inner"),t,i;if(a)t=a.querySelector(".vnpt-local-list-container"),i=a.querySelector(".vnpt-btn-wrap");else{e.innerHTML="",a=document.createElement("div"),a.className="vnpt-template-manager-inner";const l=document.createElement("div");l.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const u=document.createElement("span");u.className="vnpt-title-main",u.style.cssText="font-size:11px;font-weight:700;color:#444;",i=document.createElement("div"),i.className="vnpt-btn-wrap",i.style.cssText="display:flex;gap:4px;",l.appendChild(u),l.appendChild(i),a.appendChild(l),t=document.createElement("div"),t.className="vnpt-local-list-container",t.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",a.appendChild(t),e.appendChild(a)}const r=j(),s=a.querySelector(".vnpt-title-main");s.innerHTML="Templates"+(o?` <span style="color:#2e7d32;">(Đang dùng: ${o})</span>`:""),r.length===0?t.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':t.innerHTML="",r.forEach((l,u)=>{const h=document.createElement("div");h.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",h.title=l.fileName||l.url||l.name,h.tabIndex=0,h.onfocus=()=>h.style.boxShadow="0 0 0 2px #28a745",h.onblur=()=>h.style.boxShadow="none";const d=l.type==="local"||l.type==="local_base64"||l.type==="local_idb"?"OFF":"ON",m=d==="OFF"?"#6c757d":"#28a745",p=document.createElement("span");p.textContent=d,p.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${m};color:#fff;`;const f=document.createElement("span");f.textContent=l.name,f.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",h.onclick=()=>{h.focus(),Ue(l,n,o,e)},h.appendChild(p),h.appendChild(f);const g=document.createElement("button");g.innerHTML="✎",g.title="Đổi tên template",g.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",g.onclick=N=>{N.stopPropagation();const v=prompt("Đổi tên template:",l.name);if(v&&v.trim()&&v.trim()!==l.name){const T=j();T[u].name=v.trim(),q(T),O(e,n,o)}},h.appendChild(g);const b=document.createElement("button");b.innerHTML="✕",b.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",b.onclick=async N=>{if(N.stopPropagation(),confirm(`Xoá biểu mẫu "${l.name}"?`)){const v=j();v.splice(u,1),q(v),l.type==="local_idb"&&await Ke(l.name).catch(()=>null),O(e,n,o===l.name?null:o)}},h.appendChild(b),t.appendChild(h)})}function Ue(e,n,o,a){const t=j(),i=t.find(r=>r.name===e.name&&(r.url===e.url||r.type===e.type));if(i&&(i.lastUsed=Date.now(),q(t)),e.type==="local_idb"){Re(e.name).then(r=>{if(!r)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");n&&n(r,e.name),O(a,n,e.name)}).catch(r=>{x(`❌ Lỗi nạp File IDB: ${r.message}`,"#dc3545")});return}if(e.type==="local_base64"&&e.data){try{const r=window.atob(e.data.split(",")[1]),s=r.length,l=new Uint8Array(s);for(let u=0;u<s;u++)l[u]=r.charCodeAt(u);n&&n(l.buffer,e.name),O(a,n,e.name)}catch(r){x(`❌ Lỗi nạp Base64: ${r.message}`,"#dc3545")}return}Fe(e.url).then(r=>{n&&n(r,e.name),O(a,n,e.name)}).catch(r=>{x(`❌ ${r.message}`,"#dc3545")})}function je(e){e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function ee(e,n){var t;if(!e||e.disabled||e.readOnly)return;const o=e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,a=(t=Object.getOwnPropertyDescriptor(o,"value"))==null?void 0:t.set;a?a.call(e,n):e.value=n,je(e)}function te(e){const n=document.getElementById(e);if(n&&(n.tagName==="INPUT"||n.tagName==="TEXTAREA"))return n;for(const o of document.querySelectorAll("label"))if(o.textContent.trim()===e){if(o.htmlFor){const t=document.getElementById(o.htmlFor);if(t)return t}let a=o.parentElement;for(;a;){const t=a.querySelector("input,textarea");if(t)return t;if(a=a.parentElement,(a==null?void 0:a.tagName)==="FORM")break}}return null}function ne(e){for(const n of document.querySelectorAll("label"))if(n.innerText.trim()===e)return n.parentElement.querySelector("input, textarea");return null}function I(e,n){const o=te(e)||ne(e);o&&ee(o,n)}const me=new Date,he=String(me.getDate()).padStart(2,"0"),oe=String(me.getMonth()+1).padStart(2,"0"),ae=String(me.getFullYear()),z={ngayKy:he,thangKy:oe,namKy:ae,ngayTiepNhan:`${he}/${oe}/${ae}`,ngayThangNamKy:`${he}/${oe}/${ae}`,thangKy1:oe,namKy1:ae,tenDoanhNghiepB:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM",diaChiB:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội",maSoThueB:"0100686223",stkB:"1600114156",diaChiStkB:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)",tenB:"Phạm Khánh Chung",nguoiDaiDienB:"Phạm Khánh Chung",chucVuB:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",chucVuDaiDienB:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",giayUyQuyenSoB:"2628/GUQ-VNPT-HNI-VP",soGiayUyQuyenB:"2628/GUQ-VNPT-HNI-VP",giayUyQuyenNgayB:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",ngayGiayUyQuyenB:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",GiayUyQuyenB:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",tenDoanhNghiepB1:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",donViTiepNhan:"TTKD KHDN",tenTiepNhan:"Bùi Anh",tenNguoiNhan:"Bùi Anh",dienThoaiB:"02436686868",diaChiTaiKhoanB:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 ",noiKy:"Hà Nội",emailB:"",lienheHopDongB:"AM Bùi Anh",lienheTuVanB:"AM Bùi Anh",lienheHoaDonB:"AM Bùi Anh",sucoCap1B:"AM Bùi Anh",sucoCap2B:"AM Bùi Anh",sucoCap3B:"AM Bùi Anh",sucoCap4B:"AM Bùi Anh"},Ee=["lienheHopDongA","lienheHoaDonA","lienheTuVanA","sucoCap1A","sucoCap2A","sucoCap3A","sucoCap4A"];function ie(e,n=null){try{const o=localStorage.getItem(e);return o!==null?JSON.parse(o):n}catch{return n}}function Ne(){const e=ie(R)??{...z},n=ie(K)??{},o={...e,...n};let a="";for(let t of Ee){const i=te(t)||ne(t);if(i&&i.value){a=i.value;break}}a&&Ee.forEach(t=>I(t,a)),Object.keys(o).forEach(t=>{let i=te(t)||ne(t);i&&ee(i,o[t])}),x("✅ Auto fill complete")}function qe(){let e=ie(M)??{};const n=Object.keys(e);if(n.length===0){x("⚠️ No sync mapping","#ffc107");return}n.forEach(o=>{let a=te(o)||ne(o);a&&a.value!==void 0&&a.value!==""&&e[o].split(",").map(i=>i.trim()).filter(i=>i).forEach(i=>I(i,a.value))}),x("✅ Sync form complete","#d39e00")}let be=!1;function Je(){document.addEventListener("input",e=>{var r;if(be||!e.target||!["INPUT","TEXTAREA"].includes(e.target.tagName))return;let n=ie(M)??{};if(Object.keys(n).length===0)return;let o=e.target.id,a=e.target.name,t=null;if(o){const s=document.querySelector(`label[for="${o}"]`);s&&(t=s.textContent.trim())}if(!t){const s=e.target.closest("label");s&&(t=(r=Array.from(s.childNodes).find(l=>l.nodeType===3))==null?void 0:r.textContent.trim())}let i=n[o]||n[a]||n[t];if(i){be=!0;try{const s=e.target.value;i.split(",").map(u=>u.trim()).filter(u=>u).forEach(u=>{u!==o&&u!==a&&u!==t&&I(u,s)})}finally{be=!1}}})}function E(e,n,o=null,a=""){const t=c.fieldsContainer.querySelector(".text-hint");t&&t.remove();const i=c.fieldsContainer.querySelectorAll(".f-key");let r=!1;for(let s of i)if(s.value.split(",")[0].trim()===e){const u=s.closest(".vnpt-field-row"),h=u.querySelector(".f-val"),d=u.querySelector(".f-label");n!==""&&(h.value=n),o!==null&&o!==""&&(d.value=o),a!==""&&(s.value.split(",").slice(1).map(m=>m.trim()).join(", "),s.value=e+", "+a),r=!0;break}if(!r){(o===null||o==="")&&(o=k[e]||"");const s=document.createElement("div");s.className="vnpt-field-row row-item",s.setAttribute("draggable","false");let l=e;a&&(l+=", "+a),s.innerHTML=`
            <input type="checkbox" class="row-chk" title="Chọn để thao tác hàng loạt" style="margin: 0 2px 0 2px;" />
            <input type="text" class="f-label" placeholder="Nhãn..." value="${o}" />
            <input type="text" class="f-key" placeholder="Mã biến / IDs đồng bộ" value="${l}" title="Biến DOCX (đầu tiên), theo sau là các ID web cách dấu phẩy" />
            <span class="row-drag-handle" title="Kéo thả để di chuyển">=</span>
            <input type="text" class="f-val" placeholder="Giá trị" value="${n}" />
        `;const u=s.querySelector(".f-val"),h=s.querySelector(".f-key");e==="tenToChuc"&&(u.style.textAlign="right"),h.addEventListener("keyup",function(){B();const m=this.value.split(",")[0].trim();u.style.textAlign=m==="tenToChuc"?"right":""}),s.querySelector(".f-label").addEventListener("keyup",B),u.addEventListener("keyup",function(){B();const p=h.value.split(",").map(f=>f.trim()).filter(f=>f);p.length>0&&p.forEach(f=>I(f,this.value))});const d=s.querySelector(".row-drag-handle");d.addEventListener("mouseenter",()=>s.setAttribute("draggable","true")),d.addEventListener("mouseleave",()=>{s.classList.contains("dragging")||s.setAttribute("draggable","false")}),s.addEventListener("dragstart",function(m){c.draggedRowForVNPT=this,m.dataTransfer.effectAllowed="move",m.dataTransfer.setData("text/plain",e),this.classList.add("dragging")}),s.addEventListener("dragover",function(m){return m.preventDefault(),m.dataTransfer.dropEffect="move",!1}),s.addEventListener("dragenter",function(m){this.classList.add("over")}),s.addEventListener("dragleave",function(m){this.classList.remove("over")}),s.addEventListener("drop",function(m){if(m.stopPropagation(),c.draggedRowForVNPT&&c.draggedRowForVNPT!==this){const p=Array.from(c.fieldsContainer.querySelectorAll(".vnpt-field-row")),f=p.indexOf(c.draggedRowForVNPT),g=p.indexOf(this);f<g?this.parentNode.insertBefore(c.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(c.draggedRowForVNPT,this),B()}return!1}),s.addEventListener("dragend",function(m){this.setAttribute("draggable","false"),c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(f=>{f.classList.remove("over"),f.classList.remove("dragging")}),c.draggedRowForVNPT=null}),c.fieldsContainer.appendChild(s),c.fieldsContainer.scrollTop=c.fieldsContainer.scrollHeight}}async function B(){const e=c.isDefaultMode?de:W,n={};c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(a=>{const i=a.querySelector(".f-key").value.trim().split(",").map(h=>h.trim()).filter(h=>h),r=i[0],s=i.slice(1).join(", "),l=a.querySelector(".f-label").value.trim(),u=a.querySelector(".f-val").value;r&&(n[r]={label:l,value:u,sync:s})}),localStorage.setItem(e,JSON.stringify(n))}async function ye(){try{c.fieldsContainer.innerHTML="";const e=JSON.parse(localStorage.getItem(W))||{};Object.keys(k).forEach(n=>{const o=k[n],a=e[n];a&&typeof a=="object"?E(n,a.value,a.label||o,a.sync||""):a?E(n,a,o,""):E(n,"",o,"")}),Object.keys(e).forEach(n=>{if(!(n in k)){const o=e[n];typeof o=="object"?E(n,o.value,o.label,o.sync||""):E(n,o,"","")}}),Object.keys(k).length===0&&Object.keys(e).length===0&&(c.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(e){console.error("Error loading config:",e),Object.keys(k).forEach(n=>{E(n,"",k[n])})}try{const e=JSON.parse(localStorage.getItem(X));e&&c.widget&&(c.widget.style.bottom="auto",e.right?(c.widget.style.right=e.right,c.widget.style.left="auto"):e.left&&(c.widget.style.left=e.left,c.widget.style.right="auto"),e.top&&(c.widget.style.top=e.top))}catch{}}function $e(){document.getElementById("vnpt-btn-toggle-id").addEventListener("click",function(){c.fieldsContainer.classList.toggle("show-ids")}),document.getElementById("vnpt-btn-default").addEventListener("click",ke),document.getElementById("vnpt-btn-reset-default").addEventListener("click",function(){confirm("Khôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu? (Sẽ xóa các chỉnh sửa hiện tại của bạn trong chế độ này)")&&(localStorage.removeItem(de),c.isDefaultMode&&(c.isDefaultMode=!1,ke(),x("🔄 Đã khôi phục dữ liệu gốc","#1a73e8")))}),document.getElementById("vnpt-btn-batch-del").addEventListener("click",function(){const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row");let n=0;e.forEach(o=>{const a=o.querySelector(".row-chk");a&&a.checked&&(o.remove(),n++)}),n===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(e.forEach(o=>o.remove()),x("🗑️ Đã xóa toàn bộ","#ff5252"),B()):(x(`🗑️ Đã xóa ${n} trường`,"#ff5252"),B())}),document.getElementById("vnpt-btn-add").addEventListener("click",function(){const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;E("bien_moi_"+e,"","",""),B()}),document.getElementById("vnpt-btn-fill-back").addEventListener("click",function(){Ne();const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row");let n=0;e.forEach(o=>{const a=o.querySelector(".f-key").value.trim(),t=o.querySelector(".f-val").value;a.split(",").map(r=>r.trim()).filter(Boolean).forEach(r=>{(document.getElementById(r)||document.getElementsByName(r)[0])&&(I(r,t),n++)})}),n>0?x(`✅ Đã điền ngược ${n} trường vào web`,"#198754"):x("⚠️ Không có trường nào khớp","#ffc107")})}function ke(){c.isDefaultMode=!c.isDefaultMode;const e=document.getElementById("vnpt-btn-default"),n=document.getElementById("vnpt-btn-reset-default");if(c.fieldsContainer.innerHTML="",c.bannerArea.innerHTML="",c.isDefaultMode){e.classList.add("active"),n&&(n.style.display="flex"),c.fieldsContainer.classList.add("vnpt-mode-default"),x("📌 Chế độ Dữ liệu mặc định (Có thể chỉnh sửa)","#ea4335");const o=document.createElement("div");o.className="vnpt-default-banner",o.innerHTML=`
            <span>📌 Đang dùng Dữ liệu mặc định (Có thể sửa/lưu)</span>
        `,c.bannerArea.appendChild(o);const a=localStorage.getItem(de);if(a===null)Object.keys(z).forEach(t=>{E(t,z[t],k[t]||"")});else try{const t=JSON.parse(a);Object.keys(t).forEach(i=>{const r=t[i];E(i,r.value,r.label,r.sync||"")})}catch(t){console.error("Lỗi nạp Default Overrides:",t),Object.keys(z).forEach(i=>{E(i,z[i],k[i]||"")})}}else e.classList.remove("active"),n&&(n.style.display="none"),c.fieldsContainer.classList.remove("vnpt-mode-default"),x("📋 Đã quay lại Dữ liệu cá nhân"),ye()}function We(){const e={version:"1.0",timestamp:Date.now(),fields:JSON.parse(localStorage.getItem(W))||{},templates:JSON.parse(localStorage.getItem(Q))||[],position:JSON.parse(localStorage.getItem(X))||null,size:JSON.parse(localStorage.getItem(G))||null,calc:{default:JSON.parse(localStorage.getItem(R))||null,custom:JSON.parse(localStorage.getItem(K))||null,sync:JSON.parse(localStorage.getItem(M))||null}},n=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),o=URL.createObjectURL(n),a=document.createElement("a");a.href=o,a.download=`vnpt_config_${new Date().toISOString().slice(0,10)}.json`,a.click(),URL.revokeObjectURL(o),x("📤 Đã xuất cấu hình JSON")}function Xe(){const e=document.createElement("input");e.type="file",e.accept=".json",e.onchange=async n=>{const o=n.target.files[0];if(o)try{const a=await o.text(),t=JSON.parse(a);if(!t.fields&&!t.calc)throw new Error("Định dạng file không hợp lệ!");t.fields&&localStorage.setItem(W,JSON.stringify(t.fields)),t.templates&&localStorage.setItem(Q,JSON.stringify(t.templates)),t.position&&localStorage.setItem(X,JSON.stringify(t.position)),t.size&&localStorage.setItem(G,JSON.stringify(t.size)),t.calc&&(t.calc.default&&localStorage.setItem(R,JSON.stringify(t.calc.default)),t.calc.custom&&localStorage.setItem(K,JSON.stringify(t.calc.custom)),t.calc.sync&&localStorage.setItem(M,JSON.stringify(t.calc.sync))),await ye();const i=document.getElementById("vnpt-template-manager");i&&O(i,(r,s)=>{c.templateBuffer=r,c.templateName=s}),t.position&&c.widget&&(t.position.right?(c.widget.style.right=t.position.right,c.widget.style.left="auto"):t.position.left&&(c.widget.style.left=t.position.left,c.widget.style.right="auto"),t.position.top&&(c.widget.style.top=t.position.top),c.widget.style.bottom="auto"),t.size&&c.panel&&(c.panel.style.width=t.size.width+"px",c.panel.style.height=t.size.height+"px"),x("✅ Nhập cấu hình thành công!")}catch(a){console.error("Lỗi Import:",a),alert("Lỗi: "+a.message)}},e.click()}function Ge(){const e=document.createElement("div");e.id="vnpt-docx-widget";const n=localStorage.getItem(pe)==="true";e.innerHTML=`
        <button id="vnpt-toggle-btn" title="Mở/Đóng UI Hợp đồng" class="${n?"btn-opened":"btn-closed"}">${n?"✖":"📄"}</button>

        <div id="vnpt-export-panel" style="display: ${n?"flex":"none"};">
            <div id="vnpt-panel-header" title="Kẹp chuột vào đây để di chuyển">
                <span id="vnpt-panel-title">VNPT PRO</span>
                <div class="btn-row" style="margin-bottom: 0; padding-right: 35px; gap: 4px; position: relative;">
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-scan" title="Lấy data theo biểu mẫu web">Scan</button>
                    <button class="vnpt-btn-action btn-fill-back" id="vnpt-btn-fill-back" title="Điền dữ liệu ngược lên web">Điền thông tin</button>
                    
                    <button class="vnpt-btn-action btn-toggle-id" id="vnpt-btn-toggle-id" title="Ẩn/Hiện Mã ID">Nhập key</button>
                    <button class="vnpt-btn-action btn-default-toggle" id="vnpt-btn-default" title="Dữ liệu mặc định VNPT">Mặc định</button>
                    <button class="vnpt-btn-action btn-reset-default" id="vnpt-btn-reset-default" title="Khôi phục dữ liệu gốc" style="display: none;">↺</button>
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
    `,document.body.appendChild(e),c.widget=e,c.panel=document.getElementById("vnpt-export-panel"),c.toggleBtn=document.getElementById("vnpt-toggle-btn"),c.header=document.getElementById("vnpt-panel-header"),c.bannerArea=document.getElementById("vnpt-banner-area"),c.fieldsContainer=document.getElementById("vnpt-fields-container");try{const i=JSON.parse(localStorage.getItem(G));i&&i.width&&i.height&&(c.panel.style.width=i.width+"px",c.panel.style.height=i.height+"px")}catch(i){console.error("Lỗi load size panel:",i)}new ResizeObserver(i=>{if(c.panel.style.display!=="none")for(let r of i){const{width:s,height:l}=r.contentRect;s>0&&l>0&&localStorage.setItem(G,JSON.stringify({width:Math.round(s+20),height:Math.round(l+20)}))}}).observe(c.panel),c.panelBody=document.getElementById("vnpt-panel-body"),O(document.getElementById("vnpt-template-manager"),(i,r)=>{c.templateBuffer=i,c.templateName=r}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const i=this.files&&this.files[0];if(!i)return;const r=document.getElementById("vnpt-template-manager");Ve(i,r,(s,l)=>{c.templateBuffer=s,c.templateName=l}),this.value=""}),c.toggleBtn.addEventListener("click",i=>{c.hasDragged||(c.panel.style.display==="none"?(c.panel.style.display="flex",c.toggleBtn.className="btn-opened",c.toggleBtn.innerHTML="✖",localStorage.setItem(pe,"true")):(c.panel.style.display="none",c.toggleBtn.className="btn-closed",c.toggleBtn.innerHTML="📄",localStorage.setItem(pe,"false")))}),document.getElementById("vnpt-btn-import").onclick=i=>{Xe(),document.getElementById("vnpt-more-menu").style.display="none"},document.getElementById("vnpt-btn-export-json").onclick=i=>{We(),document.getElementById("vnpt-more-menu").style.display="none"};const a=document.getElementById("vnpt-btn-more"),t=document.getElementById("vnpt-more-menu");a.onclick=i=>{i.stopPropagation();const r=t.style.display==="none";t.style.display=r?"flex":"none",a.classList.toggle("active",r)},document.addEventListener("click",()=>{t.style.display="none",a.classList.remove("active")})}function Ce(e,n,o,a=null,t=null){let i=!1,r=0,s=0,l=!1;function u(d){l!==d&&(l=d,t&&t(d))}function h(d){if(d.button!==0)return;i=!0,c.hasDragged=!1;const m=e.getBoundingClientRect();r=d.clientX-m.left,s=d.clientY-m.top,document.body.style.userSelect="none",n&&n.forEach(p=>p.style.cursor="grabbing"),a&&a(),d.preventDefault()}return n.forEach(d=>{d.addEventListener("mousedown",h)}),document.addEventListener("mousemove",function(d){if(!i)return;c.hasDragged=!0;let m=d.clientX-r,p=d.clientY-s;const f=window.innerWidth,g=window.innerHeight,b=document.getElementById("vnpt-toggle-btn"),N=b?b.offsetWidth:40,v=b?b.offsetHeight:40,T=e.id==="vnpt-docx-widget";let C=e.offsetWidth||0;if(T){let S=N+6-C,w=f-C+6;m<S&&(m=S),m>w&&(m=w)}else C=C||200,m<0&&(m=0),m+C>f&&(m=Math.max(0,f-C));let y=l;if(T?y=!1:l?d.clientY<g-40&&(y=!1):d.clientY>g-10&&(y=!0),p<0&&(p=0),y)u(!0),e.style.top=g-e.offsetHeight+"px",T?(e.style.right=f-m-C+"px",e.style.left="auto"):(e.style.left=m+"px",e.style.right="auto"),e.style.bottom="auto";else{u(!1);let L=e.offsetHeight||40,S;if(T)S=10+v;else{const w=e.querySelector(".cw-title-bar");S=w?w.offsetHeight:L}p+S>g&&(p=Math.max(0,g-S)),e.style.top=p+"px",T?(e.style.right=f-m-C+"px",e.style.left="auto"):(e.style.left=m+"px",e.style.right="auto"),e.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(i&&(i=!1,document.body.style.userSelect="",n&&n.forEach(d=>d.style.cursor="grab"),o)){const d=e.id==="vnpt-docx-widget";localStorage.setItem(o,JSON.stringify({left:d?void 0:e.style.left,right:d?e.style.right:void 0,top:e.style.top,x:d?void 0:parseFloat(e.style.left),y:parseFloat(e.style.top),docked:l}))}}),{isDocked:()=>l,setDocked:u}}function Ye(){c.widget&&c.header&&c.toggleBtn&&(Ce(c.widget,[c.header,c.toggleBtn],X),window.addEventListener("resize",()=>{const e=window.innerWidth,n=window.innerHeight,o=document.getElementById("vnpt-toggle-btn"),a=o?o.offsetWidth:40,t=o?o.offsetHeight:40;let i=c.widget.getBoundingClientRect(),r=i.left,s=i.top,l=c.widget.offsetWidth||0,h=a+6-l,d=e-l+6;r<h&&(r=h),r>d&&(r=d),s+10+t>n&&(s=Math.max(0,n-(10+t))),c.widget.style.right=e-r-l+"px",c.widget.style.top=s+"px"}))}function Te(e){const n=e.toLowerCase(),o=new Date;return{ngayky:String(o.getDate()).padStart(2,"0"),thangky:String(o.getMonth()+1).padStart(2,"0"),thangky1:String(o.getMonth()+1).padStart(2,"0"),namky:String(o.getFullYear()),namky1:String(o.getFullYear()),soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[n]||""}function Qe(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){let e=0;Object.keys(k).forEach(n=>{var t;const o=document.getElementById(n);let a="";o&&(a=o.tagName.toLowerCase()==="select"?((t=o.options[o.selectedIndex])==null?void 0:t.text)||"":o.value,e++),a||(a=Te(n)),E(n,a,null)}),B(),e>0?(this.style.background="#34a853",this.style.color="#fff",this.innerText="Done",setTimeout(()=>{this.style.background="#fbbc04",this.style.color="#000",this.innerText="Quét"},1e3)):x("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(e){e.target&&e.target.id&&k[e.target.id]!==void 0&&(E(e.target.id,e.target.value,null),B())}),document.addEventListener("change",function(e){var n;if(e.target&&e.target.id&&k[e.target.id]!==void 0){let o=e.target.tagName.toLowerCase()==="select"?((n=e.target.options[e.target.selectedIndex])==null?void 0:n.text)||"":e.target.value;E(e.target.id,o,null),B()}})}function Le(e,n,o){try{let a;try{a=new window.PizZip(e)}catch(l){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(l);return}const t=new window.docxtemplater(a,{paragraphLoop:!0,linebreaks:!0});t.render(n);const i=t.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),r=URL.createObjectURL(i),s=document.createElement("a");s.href=r,s.download=o,document.body.appendChild(s),s.click(),setTimeout(()=>{document.body.removeChild(s),URL.revokeObjectURL(r)},100)}catch(a){let t=a.message;a.properties&&a.properties.errors instanceof Array?t=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+a.properties.errors.map(r=>"- "+(r.properties.explanation||r.message)).join(`
`):t="Lỗi phần mềm Word sinh ra: "+t,alert(t),console.error("DocX Error:",a)}}function Ze(){const e=document.getElementById("vnpt-export-filename");e&&e.addEventListener("input",()=>{e.dataset.userEdited="1",e.value.trim()||(e.dataset.userEdited="0")});function n(){if(!e||e.dataset.userEdited==="1")return;let o="";if(c.fieldsContainer&&c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(l=>{const h=l.querySelector(".f-key").value.trim().split(",")[0].trim(),d=l.querySelector(".f-val").value.trim();h==="tenToChuc"&&(o=d)}),!o){const s=document.getElementById("tenToChuc");s&&(o=s.tagName.toLowerCase()==="textarea"||s.tagName.toLowerCase()==="input"?s.value.trim():s.innerText.trim())}function a(s){if(!s)return"";let l=s;return l=l.replace(/Tổng công ty/gi,""),l=l.replace(/Công ty/gi,""),l=l.replace(/\bCty\b/gi,""),l=l.replace(/Trách nhiệm hữu hạn/gi,""),l=l.replace(/\bTNHH\b/gi,""),l=l.replace(/Cổ phần/gi,""),l=l.replace(/\bCP\b/gi,""),l=l.replace(/Một thành viên/gi,""),l=l.replace(/\bMTV\b/gi,""),l=l.replace(/Chi nhánh/gi,""),l=l.replace(/Việt Nam/gi,"VN"),l=l.replace(/Viet Nam/gi,"VN"),l=l.replace(/\s+/g," ").trim(),l=l.replace(/^[-,\s]+|[-,\s]+$/g,""),l.length>50&&(l=l.substring(0,47)+"..."),l.replace(/[<>:"/\\|?*]/g,"")}let t=a(o),i=c.templateName?c.templateName.replace(/\.docx$/i,""):"",r=[];t&&r.push(t),i&&r.push(i),r.length>0?e.value=r.join(" - ")+".docx":e.value||(e.value="HopDong_Auto.docx")}setInterval(n,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const o={};if(c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(r=>{const l=r.querySelector(".f-key").value.trim().split(",")[0].trim(),u=r.querySelector(".f-val").value;l&&(o[l]=u)}),Object.keys(o).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}let t=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(t.toLowerCase().endsWith(".docx")||(t+=".docx"),c.templateBuffer){Le(c.templateBuffer,o,t);return}const i=document.getElementById("vnpt-template-file");if(i.files&&i.files.length>0){_e.download("local",i.files[0],{type:"arraybuffer"}).then(r=>Le(r,o,t)).catch(r=>alert(`Lỗi đọc file: ${r.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')})}const et=["chucVu","noiCap","noiCapSoDkdn","ngayky","thangky","namky","thangky1","namky1","noiKy"],tt=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function nt(){function e(){et.forEach(a=>{const t=document.getElementById(a);t&&!t.dataset.filled&&(t.dataset.filled="1",ee(t,Te(a)))}),tt.forEach(a=>{const t=document.getElementById(a.src),i=document.getElementById(a.target);t&&i&&!t.dataset.bound&&(t.dataset.bound="1",t.addEventListener("input",()=>ee(i,t.value)))})}let n;new MutationObserver(()=>{clearTimeout(n),n=setTimeout(e,200)}).observe(document.body,{childList:!0,subtree:!0}),e()}function P(e,n=null){try{const o=localStorage.getItem(e);return o!==null?JSON.parse(o):n}catch{return n}}function J(e,n){localStorage.setItem(e,JSON.stringify(n))}function Be(e,n){if(!n||n.replace(/\D/g,"").length<6)return;let o=P(e,[]);o=o.filter(a=>a!==n),o.unshift(n),J(e,o.slice(0,10))}function re(e,n){const o=document.getElementById(n);o&&(o.innerHTML=P(e,[]).map(a=>`<option value="${a}">`).join(""))}function ve(e){return e.toLocaleString("en-US")}function xe(e){return Number(String(e).replace(/[^\d]/g,""))||0}function ot(e){return e.charAt(0).toUpperCase()+e.slice(1)}const $=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function at(e){let n=Math.floor(e/100),o=Math.floor(e%100/10),a=e%10,t="";return n>0&&(t+=$[n]+" trăm ",o===0&&a>0&&(t+="lẻ ")),o>1?(t+=$[o]+" mươi ",a===1?t+="mốt":a===5?t+="lăm":a>0&&(t+=$[a])):o===1?(t+="mười ",a===5?t+="lăm":a>0&&(t+=$[a])):a>0&&(n>0&&(t+="lẻ "),t+=$[a]),t.trim()}function it(e){if(e===0)return"không";const n=["","nghìn","triệu","tỷ"];let o="",a=0;for(;e>0;){const t=e%1e3;t>0&&(o=at(t)+" "+n[a]+" "+o),e=Math.floor(e/1e3),a++}return o.trim()}function Ie(e,n,o){let a=0,t=0,i=0;e==="before"?(a=xe(n),t=Math.round(a*o),i=a+t):e==="tax"?(t=xe(n),a=Math.round(t/o),i=a+t):e==="after"&&(i=xe(n),a=Math.round(i/(1+o)),t=i-a);const r=ot(it(i))+" đồng";return{beforeNum:a,taxNum:t,afterNum:i,beforeStr:ve(a),taxStr:ve(t),afterStr:ve(i),textStr:r}}function rt(e,n){n.before&&n.before.forEach(o=>I(o,e.beforeStr)),n.tax&&n.tax.forEach(o=>I(o,e.taxStr)),n.after&&n.after.forEach(o=>I(o,e.afterStr)),n.text&&n.text.forEach(o=>I(o,e.textStr))}function le(e,n=null){try{const o=localStorage.getItem(e);return o!==null?JSON.parse(o):n}catch{return n}}function D(e,n){localStorage.setItem(e,JSON.stringify(n))}function lt(e,n,o,a){let t=le(U)??"custom",i=le(R)??{...z},r=le(K)??{},s=le(M)??{};const l=document.createElement("div");l.className="cw-tab-header";const u={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};u.custom.innerText="📋 Custom",u.custom.className="cw-tab cw-tab-custom",u.default.innerText="📌 Default",u.default.className="cw-tab cw-tab-default",u.sync.innerText="🔗 Sync",u.sync.className="cw-tab cw-tab-sync";function h(){Object.values(u).forEach(y=>y.classList.remove("active")),u[t].classList.add("active")}h();const d=document.createElement("div");d.style.display=a.data?"none":"block";const m=n("📋 Cấu hình Data","data",y=>{d.style.display=y?"none":"block",o(e)}),p=document.createElement("div");p.className="cw-data-body";function f(){p.innerHTML="";let y=t==="sync"?s:t==="custom"?r:i,L=t==="sync"?M:t==="custom"?K:R;const S=Object.keys(y);S.length===0&&t!=="default"&&(p.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),S.forEach(w=>{const F=document.createElement("div");F.className="cw-data-row";let ce=t!=="default";const H=document.createElement("input");H.type="text",H.value=w,H.className="cw-data-key"+(ce?" mutable":""),H.readOnly=!ce,ce&&(H.onchange=()=>{const _=H.value.trim();if(!_||_===w){H.value=w;return}y[_]=y[w],delete y[w],D(L,y),f()});const V=document.createElement("input");if(V.type="text",V.value=y[w]??"",V.className="cw-data-val",V.oninput=()=>{y[w]=V.value,D(L,y)},F.appendChild(H),F.appendChild(V),ce){const _=document.createElement("button");_.innerHTML="✕",_.className="cw-del-btn",_.onclick=()=>{confirm(`Delete "${w}"?`)&&(delete y[w],D(L,y),f())},F.appendChild(_)}else F.appendChild(document.createElement("div")).className="cw-pad";p.appendChild(F)})}u.custom.onclick=()=>{t="custom",D(U,"custom"),h(),f()},u.default.onclick=()=>{t="default",D(U,"default"),h(),f()},u.sync.onclick=()=>{t="sync",D(U,"sync"),h(),f()};const g=document.createElement("button");g.innerText="📤",g.className="cw-icon-btn",g.onclick=()=>{const y=new Blob([JSON.stringify({defaultData:i,customData:r,syncData:s},null,2)],{type:"application/json"}),L=URL.createObjectURL(y),S=document.createElement("a");S.href=L,S.download=`vnpt_data_${Date.now()}.json`,S.click(),URL.revokeObjectURL(L)},d.appendChild(l),l.appendChild(u.custom),l.appendChild(u.default),l.appendChild(u.sync),d.appendChild(p),e.appendChild(m),e.appendChild(d);const b=e.querySelector("#vnpt-cw-fill"),N=e.querySelector("#vnpt-cw-sync"),v=e.querySelector("#vnpt-cw-add"),T=e.querySelector("#vnpt-cw-reset");b&&(b.onclick=Ne),N&&(N.onclick=qe),v&&(v.onclick=()=>{t==="default"&&(t="custom",D(U,"custom"),h());let y=t==="sync"?s:r,L="new_field_"+Date.now();y[L]="",D(t==="sync"?M:K,y),f(),p.scrollTop=p.scrollHeight}),T&&(T.onclick=()=>{confirm("Reset Default Data?")&&(i={...z},D(R,i),f())}),f();const C=m.querySelector(".cw-right-wrap")||document.createElement("div");C.className="cw-right-wrap",C.prepend(g),m.appendChild(C)}function ct(e,n,o){let a=Number(localStorage.getItem(we))||.08,t=P(Y)??{calc:!1,data:!0},i=P(Se)??{};function r(p,f){const g=document.createElement("button");return g.innerText=p,g.className="cw-action-btn "+f,g}function s(p,f,g){const b=document.createElement("div");b.className="wg-sec-header";const N=document.createElement("span");N.innerText=p;const v=document.createElement("button");return v.className="wg-toggle-btn",v.innerText=t[f]?"▾":"▴",b.appendChild(N),b.appendChild(v),v.onclick=()=>{t[f]=!t[f],v.innerText=t[f]?"▾":"▴",J(Y,t),g(t[f])},b}function l(p){const f=window.innerWidth,g=window.innerHeight,b=p.getBoundingClientRect();p.style.left=Math.min(Math.max(parseFloat(p.style.left),0),f-b.width)+"px",p.style.top=Math.min(Math.max(parseFloat(p.style.top),0),g-36)+"px"}const u=document.createElement("div");if(!n){u.className="cw-title-bar",u.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const p=document.createElement("div");p.className="cw-btn-group";const f={fill:r("Fill","cw-btn-fill"),sync:r("Sync","cw-btn-sync"),add:r("Add","cw-btn-add"),reset:r("↺","cw-btn-reset")};f.reset.title="Reset Default fields",Object.values(f).forEach(g=>p.appendChild(g)),u.appendChild(p),e.appendChild(u)}const h=document.createElement("div");h.className="cw-body-inline",h.innerHTML=`
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
    </div>`,n?n.appendChild(h):e.appendChild(h),n||lt(e,s,l,t);const d={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text"),mapBtn:document.getElementById("wg-calc-map-btn"),mapWrap:document.getElementById("wg-calc-map-wrap")};d.taxRate.value=a*100,re(ue,"wg-before-list"),re(fe,"wg-after-list");function m(p,f){const g=Ie(p,f,a);d.before.value=g.beforeStr,d.tax.value=g.taxStr,d.after.value=g.afterStr,d.text.value=g.textStr,rt(g,i)}if(d.taxRate.oninput=()=>{a=Number(d.taxRate.value)/100||0,J(we,a),m("before",d.before.value)},d.before.oninput=()=>{const p=Ie("before",d.before.value,a);d.tax.value=p.taxStr,d.after.value=p.afterStr,d.text.value=p.textStr},d.before.onchange=()=>{m("before",d.before.value),Be(ue,d.before.value),re(ue,"wg-before-list")},d.tax.oninput=()=>m("tax",d.tax.value),d.after.oninput=()=>m("after",d.after.value),d.after.onchange=()=>{m("after",d.after.value),Be(fe,d.after.value),re(fe,"wg-after-list")},[d.before,d.tax,d.after,d.text].forEach(p=>{["click","focus"].forEach(f=>p.addEventListener(f,()=>{if(!p.value)return;navigator.clipboard.writeText(p.value);const g=p.style.backgroundColor;p.style.backgroundColor="#d1e7dd",setTimeout(()=>p.style.backgroundColor=g,300)}))}),d.mapBtn.onclick=()=>{const p=d.mapWrap.style.display==="flex";if(d.mapWrap.style.display=p?"none":"flex",!p){const f=g=>{!d.mapWrap.contains(g.target)&&g.target!==d.mapBtn&&(d.mapWrap.style.display="none",document.removeEventListener("click",f))};setTimeout(()=>document.addEventListener("click",f),0)}},e.querySelectorAll("input[data-clink]").forEach(p=>{const f=p.dataset.clink;p.value=(i[f]||[]).join(", "),p.oninput=()=>{i[f]=p.value.split(",").map(g=>g.trim()).filter(g=>g),J(Se,i)}}),!n){const p=Array.from(e.children).filter(b=>b!==u),f=Ce(e,[u],o,null,b=>{p.forEach(N=>N.style.display=b?"none":""),u.style.borderRadius=b?"8px":"0",b&&(e.style.top=window.innerHeight-(u.offsetHeight||34)+"px")}),g=P(o);return g&&g.docked&&f.setDocked(!0),window.addEventListener("resize",()=>{f.isDocked()?e.style.top=window.innerHeight-u.offsetHeight+"px":l(e)}),f}return null}function st(){const e=document.getElementById("vnpt-inline-calc"),n=document.getElementById("vnpt-btn-calc-toggle");let o=c.calcWidget||document.createElement("div");if(!e&&!c.calcWidget?(o.id="vnpt-calc-widget",document.body.appendChild(o),c.calcWidget=o):e&&(o=c.widget),e&&n){let a=P(Y)??{calc:!1,data:!0};const t=i=>{e.style.display=i?"none":"block",n.classList.toggle("active",!i)};t(a.calc),n.onclick=()=>{a.calc=!a.calc,J(Y,a),t(a.calc)}}return ct(o,e,Oe)}function De(){if(!window.__vnptInited){window.__vnptInited=!0,se.info("Initializing VNPT Userscript...");try{Ae(),Ge(),st(),Ye(),$e(),ye(),Qe(),Ze(),nt(),Je(),se.info("Userscript initialized successfully.")}catch(e){se.error("Error during userscript initialization:",e)}}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",De):De()})();
