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
(function(){"use strict";const ee={info:(...e)=>console.log("[Tampermonkey Script] INFO:",...e),error:(...e)=>console.error("[Tampermonkey Script] ERROR:",...e),warn:(...e)=>console.warn("[Tampermonkey Script] WARN:",...e)};function Fe(){GM_addStyle(`
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
        .btn-default-toggle { background: ##ea4335; color: #ffffffff; font-size: 14px; border: 1px solid transparent; } 
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

    `)}const Pe={widget:null,panel:null,header:null,bannerArea:null,toggleBtn:null,fieldsContainer:null,panelBody:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1,templateBuffer:null,templateName:null,hasDragged:!1},W=new Map,c=new Proxy(Pe,{get(e,o){return o==="on"?(t,a)=>{W.has(t)||W.set(t,[]),W.get(t).push(a)}:e[o]},set(e,o,t){const a=e[o];return e[o]=t,a!==t&&W.has(o)&&W.get(o).forEach(n=>n(t,a)),!0}}),k={tenDaiDienn:"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT",emailDaiDien:"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Số GPKD | MST",goiDV:"Gói Dịch Vụ",ngayKy:"Ngày ký",thangKy:"Tháng Ký",namKy:"Năm ký",soHopDong:"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký"},te="vnpt_docx_fields",fe="vnpt_docx_default_fields",ne="vnpt_docx_position",oe="vnpt_docx_size",ge="vnpt_docx_opened",j="vnpt_autofill_data_default",q="vnpt_autofill_data_custom",R="vnpt_autofill_data_sync",Ke="vnpt_widget_pos",Se="vnd_tax_rate",me="vnd_before_history",he="vnd_after_history",ae="vnpt_widget_collapsed",Ne="vnd_calc_map",J="vnpt_widget_datatab",ie="vnpt_templates";let _=null;function v(e,o="#198754",t=2500){_||(_=document.createElement("div"),_.id="vnpt-toast-container",Object.assign(_.style,{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column-reverse",alignItems:"center",gap:"8px",zIndex:"1000000",pointerEvents:"none"}),document.body.appendChild(_));const a=document.createElement("div");a.innerText=e,Object.assign(a.style,{background:o,color:"#fff",padding:"8px 18px",borderRadius:"24px",opacity:"0",transform:"translateY(10px)",transition:"opacity 0.3s, transform 0.3s",fontSize:"13px",fontWeight:"500",fontFamily:"'Segoe UI', Roboto, sans-serif",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",whiteSpace:"nowrap",pointerEvents:"auto"}),_.appendChild(a),requestAnimationFrame(()=>{a.style.opacity="1",a.style.transform="translateY(0)"}),setTimeout(()=>{a.style.opacity="0",a.style.transform="translateY(-10px)",setTimeout(()=>{a.remove(),_&&_.childNodes.length},300)},t)}const je={local:{download(e,o="arraybuffer"){return new Promise((t,a)=>{const n=new FileReader;switch(n.onload=i=>{let r=i.target.result;o==="base64"&&typeof r=="string"&&(r=r.split(",")[1]||r),t(r)},n.onerror=i=>a(i),o.toLowerCase()){case"arraybuffer":n.readAsArrayBuffer(e);break;case"base64":case"dataurl":n.readAsDataURL(e);break;case"text":n.readAsText(e);break;default:a(new Error(`Unsupported read type: ${o}`))}})},async upload(e){return this.download(e,"base64")}}},qe={getAdapter(e){const o=je[e];if(!o)throw new Error(`Storage adapter not found: ${e}`);return o},async upload(e,o,t={}){return await this.getAdapter(e).upload(o,t)},async download(e,o,t={}){return await this.getAdapter(e).download(o,t.type||"arraybuffer")}},Ve="vnpt_templates_db",H="buffers";let re=null;function be(){return re?Promise.resolve(re):new Promise((e,o)=>{const t=indexedDB.open(Ve,1);t.onupgradeneeded=a=>{const n=a.target.result;n.objectStoreNames.contains(H)||n.createObjectStore(H)},t.onsuccess=a=>{re=a.target.result,e(re)},t.onerror=()=>o(t.error)})}async function Ue(e,o){const t=await be();return new Promise((a,n)=>{const s=t.transaction(H,"readwrite").objectStore(H).put(o,e);s.onsuccess=()=>a(),s.onerror=()=>n(s.error)})}async function $e(e){const o=await be();return new Promise((t,a)=>{const r=o.transaction(H,"readonly").objectStore(H).get(e);r.onsuccess=()=>t(r.result),r.onerror=()=>a(r.error)})}async function We(e){const o=await be();return new Promise((t,a)=>{const r=o.transaction(H,"readwrite").objectStore(H).delete(e);r.onsuccess=()=>t(),r.onerror=()=>a(r.error)})}function G(){try{const e=JSON.parse(localStorage.getItem(ie))||[],o=e.filter(t=>t.type!=="local");return o.length!==e.length&&X(o),o}catch{return[]}}function X(e){localStorage.setItem(ie,JSON.stringify(e))}function Je(e){const o=e.match(/drive\.google\.com\/file\/d\/([^/]+)/);return o?`https://drive.google.com/uc?export=download&id=${o[1]}`:e}function Ge(e){return new Promise((o,t)=>{GM_xmlhttpRequest({method:"GET",url:Je(e),responseType:"arraybuffer",onload:a=>{if(a.status>=200&&a.status<300){if(a.response&&a.response.byteLength>4){const n=new Uint8Array(a.response.slice(0,4));if(n[0]===80&&n[1]===75&&n[2]===3&&n[3]===4){o(a.response);return}else{t(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}o(a.response)}else t(new Error(`HTTP ${a.status}: Không lấy được file`))},onerror:()=>t(new Error("Không thể tải URL.")),ontimeout:()=>t(new Error("Timeout khi tải URL."))})})}async function Xe(e,o,t){const a=e.name.replace(/\.docx$/i,""),n=prompt("Đặt tên biến nhớ cho file này:",a);if(!(!n||!n.trim()))try{const i=await e.arrayBuffer();await Ue(n.trim(),i);const s=G().filter(l=>l.name!==n.trim()&&l.fileName!==e.name);s.unshift({name:n.trim(),type:"local_idb",fileName:e.name,lastUsed:Date.now()}),X(s),M(o,t),t&&t(i,n.trim())}catch(i){v(`❌ Lỗi lưu file: ${i.message}`,"#dc3545")}}function M(e,o,t=null){let a=e.querySelector(".vnpt-template-manager-inner"),n,i;if(a)n=a.querySelector(".vnpt-local-list-container"),i=a.querySelector(".vnpt-btn-wrap");else{e.innerHTML="",a=document.createElement("div"),a.className="vnpt-template-manager-inner";const l=document.createElement("div");l.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const u=document.createElement("span");u.className="vnpt-title-main",u.style.cssText="font-size:11px;font-weight:700;color:#444;",i=document.createElement("div"),i.className="vnpt-btn-wrap",i.style.cssText="display:flex;gap:4px;",l.appendChild(u),l.appendChild(i),a.appendChild(l),n=document.createElement("div"),n.className="vnpt-local-list-container",n.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",a.appendChild(n),e.appendChild(a)}const r=G(),s=a.querySelector(".vnpt-title-main");s.innerHTML="Templates"+(t?` <span style="color:#2e7d32;">(Đang dùng: ${t})</span>`:""),r.length===0?n.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':n.innerHTML="",r.forEach((l,u)=>{const m=document.createElement("div");m.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",m.title=l.fileName||l.url||l.name,m.tabIndex=0,m.onfocus=()=>m.style.boxShadow="0 0 0 2px #28a745",m.onblur=()=>m.style.boxShadow="none";const d=l.type==="local"||l.type==="local_base64"||l.type==="local_idb"?"OFF":"ON",h=d==="OFF"?"#6c757d":"#28a745",p=document.createElement("span");p.textContent=d,p.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${h};color:#fff;`;const g=document.createElement("span");g.textContent=l.name,g.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",m.onclick=()=>{m.focus(),Ye(l,o,t,e)},m.appendChild(p),m.appendChild(g);const f=document.createElement("button");f.innerHTML="✎",f.title="Đổi tên template",f.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",f.onclick=N=>{N.stopPropagation();const x=prompt("Đổi tên template:",l.name);if(x&&x.trim()&&x.trim()!==l.name){const B=G();B[u].name=x.trim(),X(B),M(e,o,t)}},m.appendChild(f);const b=document.createElement("button");b.innerHTML="✕",b.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",b.onclick=async N=>{if(N.stopPropagation(),confirm(`Xoá biểu mẫu "${l.name}"?`)){const x=G();x.splice(u,1),X(x),l.type==="local_idb"&&await We(l.name).catch(()=>null),M(e,o,t===l.name?null:t)}},m.appendChild(b),n.appendChild(m)})}function Ye(e,o,t,a){const n=G(),i=n.find(r=>r.name===e.name&&(r.url===e.url||r.type===e.type));if(i&&(i.lastUsed=Date.now(),X(n)),e.type==="local_idb"){$e(e.name).then(r=>{if(!r)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");o&&o(r,e.name),M(a,o,e.name)}).catch(r=>{v(`❌ Lỗi nạp File IDB: ${r.message}`,"#dc3545")});return}if(e.type==="local_base64"&&e.data){try{const r=window.atob(e.data.split(",")[1]),s=r.length,l=new Uint8Array(s);for(let u=0;u<s;u++)l[u]=r.charCodeAt(u);o&&o(l.buffer,e.name),M(a,o,e.name)}catch(r){v(`❌ Lỗi nạp Base64: ${r.message}`,"#dc3545")}return}Ge(e.url).then(r=>{o&&o(r,e.name),M(a,o,e.name)}).catch(r=>{v(`❌ ${r.message}`,"#dc3545")})}const V=new Map;function Qe(){V.clear()}function Ze(e){e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function Y(e,o){var n;const t=e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,a=(n=Object.getOwnPropertyDescriptor(t,"value"))==null?void 0:n.set;a?a.call(e,o):e.value=o,Ze(e)}function le(e){if(!e)return null;const o=V.get(e);if(o&&document.contains(o))return o;const t=document.getElementById(e);if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"))return V.set(e,t),t;for(const a of document.querySelectorAll("label"))if(a.textContent.trim()===e){let n=null;if(a.htmlFor&&(n=document.getElementById(a.htmlFor)),!n){let i=a.parentElement;for(;i;){const r=i.querySelector("input,textarea");if(r){n=r;break}if(i=i.parentElement,(i==null?void 0:i.tagName)==="FORM")break}}if(n)return V.set(e,n),n}return null}function ce(e){if(!e)return null;const o=V.get(`lbl:${e}`);if(o&&document.contains(o))return o;for(const t of document.querySelectorAll("label"))if(t.innerText.trim()===e){const a=t.parentElement.querySelector("input, textarea");if(a)return V.set(`lbl:${e}`,a),a}return null}function F(e,o){const t=le(e)||ce(e);t&&Y(t,o)}function et(e=new Date){return String(e.getDate()).padStart(2,"0")}function tt(e=new Date){return String(e.getMonth()+1).padStart(2,"0")}function nt(e=new Date){return String(e.getFullYear())}function ke(){const e=new Date;return{ngay:et(e),thang:tt(e),nam:nt(e)}}const{ngay:Ce,thang:Te,nam:Be}=ke(),P={ngayKy:{label:"Ngày ký",value:Ce},"thangKy, thangKy1":{label:"Tháng ký",value:Te},"namKy, namKy1":{label:"Năm ký",value:Be},"ngayTiepNhan, ngayThangNamKy":{label:"Ngày ký (full)",value:`${Ce}/${Te}/${Be}`},tenDoanhNghiepB:{label:"Tên doanh nghiệp B",value:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM"},diaChiB:{label:"Địa chỉ B",value:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội"},maSoThueB:{label:"Mã số thuế B",value:"0100686223"},stkB:{label:"Số tài khoản B",value:"1600114156"},diaChiStkB:{label:"Ngân hàng/Địa chỉ STK B",value:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)"},"tenB, nguoiDaiDienB":{label:"Người đại diện B",value:"Phạm Khánh Chung"},"chucVuB, chucVuDaiDienB":{label:"Chức vụ B",value:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp"},"giayUyQuyenSoB, soGiayUyQuyenB":{label:"Giấy ủy quyền số B",value:"2628/GUQ-VNPT-HNI-VP"},"giayUyQuyenNgayB, ngayGiayUyQuyenB":{label:"Giấy ủy quyền ngày B",value:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},GiayUyQuyenB:{label:"Giấy ủy quyền B (full)",value:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},tenDoanhNghiepB1:{label:"Tên doanh nghiệp B (phụ)",value:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},donViTiepNhan:{label:"Đơn vị tiếp nhận",value:"TTKD KHDN"},"tenTiepNhan, tenNguoiNhan":{label:"Người tiếp nhận",value:"Bùi Anh"},dienThoaiB:{label:"Điện thoại B",value:"02436686868"},diaChiTaiKhoanB:{label:"Địa chỉ tài khoản B",value:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 "},noiKy:{label:"Nơi ký",value:"Hà Nội"},emailB:{label:"Email B",value:""},"lienheHopDongB, lienheTuVanB, lienheHoaDonB, sucoCap1B, sucoCap2B, sucoCap3B, sucoCap4B":{label:"Liên hệ B (AM)",value:"AM Bùi Anh"}},D={get(e,o=null){try{const t=localStorage.getItem(e);return t===null?o:JSON.parse(t)}catch(t){return console.warn(`[Storage] Không thể đọc key "${e}":`,t),o}},set(e,o){try{return localStorage.setItem(e,JSON.stringify(o)),!0}catch(t){return console.error(`[Storage] Không thể ghi key "${e}":`,t),!1}},remove(e){try{localStorage.removeItem(e)}catch(o){console.error(`[Storage] Không thể xóa key "${e}":`,o)}}};function Le(e,o){let t;return function(...n){const i=()=>{clearTimeout(t),e(...n)};clearTimeout(t),t=setTimeout(i,o)}}function Ie(){const e=D.get(j)??{...P},o=D.get(q)??{},t={...e,...o};Object.keys(t).forEach(a=>{const n=t[a],i=n&&typeof n=="object"&&n.hasOwnProperty("value")?n.value:n;a.split(",").map(s=>s.trim()).filter(s=>s).forEach(s=>{let l=le(s)||ce(s);l&&Y(l,i)})}),v("✅ Auto fill complete")}function ot(){let e=D.get(R)??{};const o=Object.keys(e);if(o.length===0){v("⚠️ No sync mapping","#ffc107");return}o.forEach(t=>{let a=le(t)||ce(t);a&&a.value!==void 0&&a.value!==""&&e[t].split(",").map(i=>i.trim()).filter(i=>i).forEach(i=>F(i,a.value))}),v("✅ Sync form complete","#d39e00")}let ye=!1;const at=(e,o)=>{var s;if(ye)return;let t=D.get(R)??{};if(Object.keys(t).length===0)return;let a=e.id,n=e.name,i=null;if(a){const l=document.querySelector(`label[for="${a}"]`);l&&(i=l.textContent.trim())}if(!i){const l=e.closest("label");l&&(i=(s=Array.from(l.childNodes).find(u=>u.nodeType===3))==null?void 0:s.textContent.trim())}let r=t[a]||t[n]||t[i];if(r){ye=!0;try{r.split(",").map(u=>u.trim()).filter(u=>u).forEach(u=>{if(u!==a&&u!==n&&u!==i){const m=le(u)||ce(u);m&&document.activeElement!==m&&Y(m,o)}})}finally{ye=!1}}},it=Le((e,o)=>{at(e,o)},250);function rt(){document.addEventListener("input",e=>{const o=e.target;!o||!["INPUT","TEXTAREA"].includes(o.tagName)||o.closest("#vnpt-docx-widget")||o.closest("#vnpt-inline-calc")||it(o,o.value)})}function S(e,o,t=null,a=""){const n=c.fieldsContainer.querySelector(".text-hint");n&&n.remove();const i=c.fieldsContainer.querySelectorAll(".f-key");let r=!1;for(let s of i)if(s.value.split(",")[0].trim()===e){const u=s.closest(".vnpt-field-row"),m=u.querySelector(".f-val"),d=u.querySelector(".f-label");o!==""&&m.value!==o&&document.activeElement!==m&&(m.value=o),t!==null&&t!==""&&d.value!==t&&document.activeElement!==d&&(d.value=t),a!==""&&s.value!==e+", "+a&&document.activeElement!==s&&(s.value=e+", "+a),r=!0;break}if(!r){(t===null||t==="")&&(t=k[e]||"");const s=document.createElement("div");s.className="vnpt-field-row row-item",s.setAttribute("draggable","false");let l=e;a&&(l+=", "+a),s.innerHTML=`
            <input type="checkbox" class="row-chk" title="Chọn để thao tác hàng loạt" style="margin: 0 2px 0 2px;" />
            <input type="text" class="f-label" placeholder="Nhãn..." value="${t}" />
            <input type="text" class="f-key" placeholder="Mã biến / IDs đồng bộ" value="${l}" title="Biến DOCX (đầu tiên), theo sau là các ID web cách dấu phẩy" />
            <span class="row-drag-handle" title="Kéo thả để di chuyển">=</span>
            <input type="text" class="f-val" placeholder="Giá trị" value="${o}" />
        `;const u=s.querySelector(".f-val"),m=s.querySelector(".f-key");e==="tenToChuc"&&(u.style.textAlign="right");const d=()=>{const p=u.value;m.value.split(",").map(f=>f.trim()).filter(f=>f).forEach(f=>F(f,p))};m.addEventListener("input",function(){T();const p=this.value.split(",")[0].trim();u.style.textAlign=p==="tenToChuc"?"right":"",d()}),s.querySelector(".f-label").addEventListener("input",T),u.addEventListener("input",function(){T(),d()});const h=s.querySelector(".row-drag-handle");h.addEventListener("mouseenter",()=>s.setAttribute("draggable","true")),h.addEventListener("mouseleave",()=>{s.classList.contains("dragging")||s.setAttribute("draggable","false")}),s.addEventListener("dragstart",function(p){c.draggedRowForVNPT=this,p.dataTransfer.effectAllowed="move",p.dataTransfer.setData("text/plain",e),this.classList.add("dragging")}),s.addEventListener("dragover",p=>(p.preventDefault(),!1)),s.addEventListener("dragenter",function(){this.classList.add("over")}),s.addEventListener("dragleave",function(){this.classList.remove("over")}),s.addEventListener("drop",function(p){if(p.stopPropagation(),c.draggedRowForVNPT&&c.draggedRowForVNPT!==this){const g=Array.from(c.fieldsContainer.querySelectorAll(".vnpt-field-row")),f=g.indexOf(c.draggedRowForVNPT),b=g.indexOf(this);f<b?this.parentNode.insertBefore(c.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(c.draggedRowForVNPT,this),T()}return!1}),s.addEventListener("dragend",function(){this.setAttribute("draggable","false"),c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(p=>{p.classList.remove("over","dragging")}),c.draggedRowForVNPT=null}),c.fieldsContainer.appendChild(s),c.fieldsContainer.scrollTop=c.fieldsContainer.scrollHeight}}function T(){const e=c.isDefaultMode?fe:te,o={};c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(a=>{const i=a.querySelector(".f-key").value.trim().split(",").map(m=>m.trim()).filter(m=>m),r=i[0],s=i.slice(1).join(", "),l=a.querySelector(".f-label").value.trim(),u=a.querySelector(".f-val").value;r&&(o[r]={label:l,value:u,sync:s})}),D.set(e,o)}function ve(){try{c.fieldsContainer.innerHTML="";const o=D.get(te)||{};Object.keys(k).forEach(t=>{const a=k[t],n=o[t];n&&typeof n=="object"?S(t,n.value,n.label||a,n.sync||""):n?S(t,n,a,""):S(t,"",a,"")}),Object.keys(o).forEach(t=>{if(!(t in k)){const a=o[t];typeof a=="object"?S(t,a.value,a.label,a.sync||""):S(t,a,"","")}}),Object.keys(k).length===0&&Object.keys(o).length===0&&(c.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(o){console.error("Error loading config:",o),Object.keys(k).forEach(t=>S(t,"",k[t]))}const e=D.get(ne);e&&c.widget&&(c.widget.style.bottom="auto",e.right?(c.widget.style.right=e.right,c.widget.style.left="auto"):e.left&&(c.widget.style.left=e.left,c.widget.style.right="auto"),e.top&&(c.widget.style.top=e.top))}function lt(){document.getElementById("vnpt-btn-toggle-id").onclick=()=>c.fieldsContainer.classList.toggle("show-ids"),document.getElementById("vnpt-btn-default").onclick=()=>{c.isDefaultMode=!c.isDefaultMode},c.on("isDefaultMode",e=>De(e)),document.getElementById("vnpt-btn-reset-default").onclick=()=>{confirm("Khôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?")&&(D.remove(fe),c.isDefaultMode&&(De(!0),v("🔄 Đã khôi phục dữ liệu gốc","#1a73e8")))},document.getElementById("vnpt-btn-batch-del").onclick=()=>{const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row");let o=0;e.forEach(t=>{var a;(a=t.querySelector(".row-chk"))!=null&&a.checked&&(t.remove(),o++)}),o===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(e.forEach(t=>t.remove()),v("🗑️ Đã xóa toàn bộ","#ff5252"),T()):(v(`🗑️ Đã xóa ${o} trường`,"#ff5252"),T())},document.getElementById("vnpt-btn-add").onclick=()=>{const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;S("bien_moi_"+e,"","",""),T()},document.getElementById("vnpt-btn-fill-back").onclick=()=>{Ie();let e=0;c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(o=>{const t=o.querySelector(".f-key").value.trim(),a=o.querySelector(".f-val").value;t.split(",").map(n=>n.trim()).filter(Boolean).forEach(n=>{(document.getElementById(n)||document.getElementsByName(n)[0])&&(F(n,a),e++)})}),e>0?v(`✅ Đã điền ngược ${e} trường`,"#198754"):v("⚠️ Không khớp trường nào","#ffc107")}}function De(e){const o=document.getElementById("vnpt-btn-default"),t=document.getElementById("vnpt-btn-reset-default");if(c.fieldsContainer.innerHTML="",c.bannerArea.innerHTML="",e){o.classList.add("active"),t&&(t.style.display="flex"),c.fieldsContainer.classList.add("vnpt-mode-default"),v("📌 Chế độ Dữ liệu mặc định (Có thể sửa)","#ea4335");const a=document.createElement("div");a.className="vnpt-default-banner",a.innerHTML="<span> Lưu ý: đây là Dữ liệu mặc định (Có thể sửa/lưu)</span>",c.bannerArea.appendChild(a);const n=D.get(fe);n===null?Object.keys(P).forEach(i=>{const r=P[i],s=r&&typeof r=="object"?r.value:r,l=r&&typeof r=="object"?r.label:k[i]||"";S(i,s,l)}):Object.keys(n).forEach(i=>{const r=n[i];S(i,r.value,r.label,r.sync||"")})}else o.classList.remove("active"),t&&(t.style.display="none"),c.fieldsContainer.classList.remove("vnpt-mode-default"),v("📋 Đã quay lại Dữ liệu cá nhân"),ve()}function ct(){const e={version:"1.0",timestamp:Date.now(),fields:JSON.parse(localStorage.getItem(te))||{},templates:JSON.parse(localStorage.getItem(ie))||[],position:JSON.parse(localStorage.getItem(ne))||null,size:JSON.parse(localStorage.getItem(oe))||null,calc:{default:JSON.parse(localStorage.getItem(j))||null,custom:JSON.parse(localStorage.getItem(q))||null,sync:JSON.parse(localStorage.getItem(R))||null}},o=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),t=URL.createObjectURL(o),a=document.createElement("a");a.href=t,a.download=`vnpt_config_${new Date().toISOString().slice(0,10)}.json`,a.click(),URL.revokeObjectURL(t),v("📤 Đã xuất cấu hình JSON")}function st(){const e=document.createElement("input");e.type="file",e.accept=".json",e.onchange=async o=>{const t=o.target.files[0];if(t)try{const a=await t.text(),n=JSON.parse(a);if(!n.fields&&!n.calc)throw new Error("Định dạng file không hợp lệ!");n.fields&&localStorage.setItem(te,JSON.stringify(n.fields)),n.templates&&localStorage.setItem(ie,JSON.stringify(n.templates)),n.position&&localStorage.setItem(ne,JSON.stringify(n.position)),n.size&&localStorage.setItem(oe,JSON.stringify(n.size)),n.calc&&(n.calc.default&&localStorage.setItem(j,JSON.stringify(n.calc.default)),n.calc.custom&&localStorage.setItem(q,JSON.stringify(n.calc.custom)),n.calc.sync&&localStorage.setItem(R,JSON.stringify(n.calc.sync))),await ve();const i=document.getElementById("vnpt-template-manager");i&&M(i,(r,s)=>{c.templateBuffer=r,c.templateName=s}),n.position&&c.widget&&(n.position.right?(c.widget.style.right=n.position.right,c.widget.style.left="auto"):n.position.left&&(c.widget.style.left=n.position.left,c.widget.style.right="auto"),n.position.top&&(c.widget.style.top=n.position.top),c.widget.style.bottom="auto"),n.size&&c.panel&&(c.panel.style.width=n.size.width+"px",c.panel.style.height=n.size.height+"px"),v("✅ Nhập cấu hình thành công!")}catch(a){console.error("Lỗi Import:",a),alert("Lỗi: "+a.message)}},e.click()}function dt(){const e=document.createElement("div");e.id="vnpt-docx-widget";const o=localStorage.getItem(ge)==="true";e.innerHTML=`
        <button id="vnpt-toggle-btn" title="Mở/Đóng UI Hợp đồng" class="${o?"btn-opened":"btn-closed"}">${o?"✖":"📄"}</button>

        <div id="vnpt-export-panel" style="display: ${o?"flex":"none"};">
            <div id="vnpt-panel-header" title="Kẹp chuột vào đây để di chuyển">
                <span id="vnpt-panel-title">VNPT PRO</span>
                <div class="btn-row" style="margin-bottom: 0; padding-right: 35px; gap: 4px; position: relative;">
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-scan" title="Lấy data theo biểu mẫu web">Scan</button>
                    <button class="vnpt-btn-action btn-fill-back" id="vnpt-btn-fill-back" title="Điền dữ liệu ngược lên web">Điền thông tin</button>
                    
                    <button class="vnpt-btn-action btn-default-toggle" id="vnpt-btn-default" title="Dữ liệu mặc định VNPT">Mặc định</button>
                    <button class="vnpt-btn-action btn-toggle-id" id="vnpt-btn-toggle-id" title="Ẩn/Hiện Mã ID">Nhập key</button>
                    <button class="vnpt-btn-action btn-add" id="vnpt-btn-add" title="Chèn thêm trường trống">➕</button>
                    <button class="vnpt-btn-action btn-clean" id="vnpt-btn-batch-del" title="Xóa chọn / Xóa tất cả">🗑️</button>
                    <!-- Nút Xem thêm và Menu ẩn -->
                    <div style="position: relative; display: flex;">
                        <button class="vnpt-btn-action btn-more" id="vnpt-btn-more" title="Cấu hình & Tiện ích khác">⚙️</button>
                        <div id="vnpt-more-menu" class="vnpt-more-menu" style="display: none;">
                            <button class="vnpt-btn-action btn-reset-default" id="vnpt-btn-reset-default" title="Khôi phục dữ liệu gốc">Reset Default</button>
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
                        <input type="text" id="vnpt-export-filename" value="Export_Auto.docx" placeholder="Tên file HD xuất..." title="Tên file HD xuất" />
                    </div>
                    <button class="vnpt-btn-action btn-export" id="vnpt-btn-export" title="Xuất ra file DOCX">🖨️ XUẤT FILE</button>
                </div>
            </div>
        </div>
    `,document.body.appendChild(e),c.widget=e,c.panel=document.getElementById("vnpt-export-panel"),c.toggleBtn=document.getElementById("vnpt-toggle-btn"),c.header=document.getElementById("vnpt-panel-header"),c.bannerArea=document.getElementById("vnpt-banner-area"),c.fieldsContainer=document.getElementById("vnpt-fields-container");try{const i=JSON.parse(localStorage.getItem(oe));i&&i.width&&i.height&&(c.panel.style.width=i.width+"px",c.panel.style.height=i.height+"px")}catch(i){console.error("Lỗi load size panel:",i)}new ResizeObserver(i=>{if(c.panel.style.display!=="none")for(let r of i){const{width:s,height:l}=r.contentRect;s>0&&l>0&&localStorage.setItem(oe,JSON.stringify({width:Math.round(s+20),height:Math.round(l+20)}))}}).observe(c.panel),c.panelBody=document.getElementById("vnpt-panel-body"),M(document.getElementById("vnpt-template-manager"),(i,r)=>{c.templateBuffer=i,c.templateName=r}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const i=this.files&&this.files[0];if(!i)return;const r=document.getElementById("vnpt-template-manager");Xe(i,r,(s,l)=>{c.templateBuffer=s,c.templateName=l}),this.value=""}),c.toggleBtn.addEventListener("click",i=>{c.hasDragged||(c.panel.style.display==="none"?(c.panel.style.display="flex",c.toggleBtn.className="btn-opened",c.toggleBtn.innerHTML="✖",localStorage.setItem(ge,"true")):(c.panel.style.display="none",c.toggleBtn.className="btn-closed",c.toggleBtn.innerHTML="📄",localStorage.setItem(ge,"false")))}),document.getElementById("vnpt-btn-import").onclick=i=>{st(),document.getElementById("vnpt-more-menu").style.display="none"},document.getElementById("vnpt-btn-export-json").onclick=i=>{ct(),document.getElementById("vnpt-more-menu").style.display="none"};const a=document.getElementById("vnpt-btn-more"),n=document.getElementById("vnpt-more-menu");a.onclick=i=>{i.stopPropagation();const r=n.style.display==="none";n.style.display=r?"flex":"none",a.classList.toggle("active",r)},document.addEventListener("click",()=>{n.style.display="none",a.classList.remove("active")})}function Oe(e,o,t,a=null,n=null){let i=!1,r=0,s=0,l=!1;function u(d){l!==d&&(l=d,n&&n(d))}function m(d){if(d.button!==0)return;i=!0,c.hasDragged=!1;const h=e.getBoundingClientRect();r=d.clientX-h.left,s=d.clientY-h.top,document.body.style.userSelect="none",o&&o.forEach(p=>p.style.cursor="grabbing"),a&&a(),d.preventDefault()}return o.forEach(d=>{d.addEventListener("mousedown",m)}),document.addEventListener("mousemove",function(d){if(!i)return;c.hasDragged=!0;let h=d.clientX-r,p=d.clientY-s;const g=window.innerWidth,f=window.innerHeight,b=document.getElementById("vnpt-toggle-btn"),N=b?b.offsetWidth:40,x=b?b.offsetHeight:40,B=e.id==="vnpt-docx-widget";let C=e.offsetWidth||0;if(B){let E=N+6-C,w=g-C+6;h<E&&(h=E),h>w&&(h=w)}else C=C||200,h<0&&(h=0),h+C>g&&(h=Math.max(0,g-C));let y=l;if(B?y=!1:l?d.clientY<f-40&&(y=!1):d.clientY>f-10&&(y=!0),p<0&&(p=0),y)u(!0),e.style.top=f-e.offsetHeight+"px",B?(e.style.right=g-h-C+"px",e.style.left="auto"):(e.style.left=h+"px",e.style.right="auto"),e.style.bottom="auto";else{u(!1);let L=e.offsetHeight||40,E;if(B)E=10+x;else{const w=e.querySelector(".cw-title-bar");E=w?w.offsetHeight:L}p+E>f&&(p=Math.max(0,f-E)),e.style.top=p+"px",B?(e.style.right=g-h-C+"px",e.style.left="auto"):(e.style.left=h+"px",e.style.right="auto"),e.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(i&&(i=!1,document.body.style.userSelect="",o&&o.forEach(d=>d.style.cursor="grab"),t)){const d=e.id==="vnpt-docx-widget";localStorage.setItem(t,JSON.stringify({left:d?void 0:e.style.left,right:d?e.style.right:void 0,top:e.style.top,x:d?void 0:parseFloat(e.style.left),y:parseFloat(e.style.top),docked:l}))}}),{isDocked:()=>l,setDocked:u}}function pt(){c.widget&&c.header&&c.toggleBtn&&(Oe(c.widget,[c.header,c.toggleBtn],ne),window.addEventListener("resize",()=>{const e=window.innerWidth,o=window.innerHeight,t=document.getElementById("vnpt-toggle-btn"),a=t?t.offsetWidth:40,n=t?t.offsetHeight:40;let i=c.widget.getBoundingClientRect(),r=i.left,s=i.top,l=c.widget.offsetWidth||0,m=a+6-l,d=e-l+6;r<m&&(r=m),r>d&&(r=d),s+10+n>o&&(s=Math.max(0,o-(10+n))),c.widget.style.right=e-r-l+"px",c.widget.style.top=s+"px"}))}function Ae(e){const o=e.toLowerCase(),{ngay:t,thang:a,nam:n}=ke();return{ngayky:t,thangky:a,thangky1:a,namky:n,namky1:n,soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[o]||""}function ut(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){if(c.isDefaultMode){Object.keys(P).forEach(o=>{S(o,P[o],k[o]||"")}),T(),v("Đã nạp lại dữ liệu mặc định từ hệ thống.");return}let e=0;Object.keys(k).forEach(o=>{var n;const t=document.getElementById(o);let a="";t&&(a=t.tagName.toLowerCase()==="select"?((n=t.options[t.selectedIndex])==null?void 0:n.text)||"":t.value,e++),a||(a=Ae(o)),S(o,a,null)}),T(),e>0?(this.style.background="#34a853",this.style.color="#fff",this.innerText="Done",setTimeout(()=>{this.style.background="#fbbc04",this.style.color="#000",this.innerText="Quét"},1e3)):v("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(e){e.target.closest("#vnpt-docx-widget")||e.target.closest("#vnpt-inline-calc")||e.target&&e.target.id&&k[e.target.id]!==void 0&&(S(e.target.id,e.target.value,null),T())}),document.addEventListener("change",function(e){var o;if(!(e.target.closest("#vnpt-docx-widget")||e.target.closest("#vnpt-inline-calc"))&&e.target&&e.target.id&&k[e.target.id]!==void 0){let t=e.target.tagName.toLowerCase()==="select"?((o=e.target.options[e.target.selectedIndex])==null?void 0:o.text)||"":e.target.value;S(e.target.id,t,null),T()}})}function _e(e,o,t){try{let a;try{a=new window.PizZip(e)}catch(l){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(l);return}const n=new window.docxtemplater(a,{paragraphLoop:!0,linebreaks:!0});n.render(o);const i=n.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),r=URL.createObjectURL(i),s=document.createElement("a");s.href=r,s.download=t,document.body.appendChild(s),s.click(),setTimeout(()=>{document.body.removeChild(s),URL.revokeObjectURL(r)},100)}catch(a){let n=a.message;a.properties&&a.properties.errors instanceof Array?n=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+a.properties.errors.map(r=>"- "+(r.properties.explanation||r.message)).join(`
`):n="Lỗi phần mềm Word sinh ra: "+n,alert(n),console.error("DocX Error:",a)}}function ft(){const e=document.getElementById("vnpt-export-filename");e&&e.addEventListener("input",()=>{e.dataset.userEdited="1",e.value.trim()||(e.dataset.userEdited="0")});function o(){if(!e||e.dataset.userEdited==="1")return;let t="";if(c.fieldsContainer&&c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(l=>{const m=l.querySelector(".f-key").value.trim().split(",")[0].trim(),d=l.querySelector(".f-val").value.trim();m==="tenToChuc"&&(t=d)}),!t){const s=document.getElementById("tenToChuc");s&&(t=s.tagName.toLowerCase()==="textarea"||s.tagName.toLowerCase()==="input"?s.value.trim():s.innerText.trim())}function a(s){if(!s)return"";let l=s;return l=l.replace(/Tổng công ty/gi,""),l=l.replace(/Công ty/gi,""),l=l.replace(/\bCty\b/gi,""),l=l.replace(/Trách nhiệm hữu hạn/gi,""),l=l.replace(/\bTNHH\b/gi,""),l=l.replace(/Cổ phần/gi,""),l=l.replace(/\bCP\b/gi,""),l=l.replace(/Một thành viên/gi,""),l=l.replace(/\bMTV\b/gi,""),l=l.replace(/Chi nhánh/gi,""),l=l.replace(/Việt Nam/gi,"VN"),l=l.replace(/Viet Nam/gi,"VN"),l=l.replace(/\s+/g," ").trim(),l=l.replace(/^[-,\s]+|[-,\s]+$/g,""),l.length>50&&(l=l.substring(0,47)+"..."),l.replace(/[<>:"/\\|?*]/g,"")}let n=a(t),i=c.templateName?c.templateName.replace(/\.docx$/i,""):"",r=[];i&&r.push(i),n&&r.push(n),r.length>0?e.value=r.join(" - ")+".docx":e.value||(e.value="Export_Auto.docx")}setInterval(o,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const t={};if(c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(r=>{const l=r.querySelector(".f-key").value.trim().split(",")[0].trim(),u=r.querySelector(".f-val").value;l&&(t[l]=u)}),Object.keys(t).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}let n=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(n.toLowerCase().endsWith(".docx")||(n+=".docx"),c.templateBuffer){_e(c.templateBuffer,t,n);return}const i=document.getElementById("vnpt-template-file");if(i.files&&i.files.length>0){qe.download("local",i.files[0],{type:"arraybuffer"}).then(r=>_e(r,t,n)).catch(r=>alert(`Lỗi đọc file: ${r.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')})}const gt=["chucVu","noiCap","noiCapSoDkdn","ngayky","thangky","namky","thangky1","namky1","noiKy"],mt=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function ht(){function e(){gt.forEach(a=>{const n=document.getElementById(a);n&&!n.dataset.filled&&(n.dataset.filled="1",Y(n,Ae(a)))}),mt.forEach(a=>{const n=document.getElementById(a.src),i=document.getElementById(a.target);n&&i&&!n.dataset.bound&&(n.dataset.bound="1",n.addEventListener("input",()=>Y(i,n.value)))})}let o;new MutationObserver(()=>{clearTimeout(o),o=setTimeout(e,200)}).observe(document.body,{childList:!0,subtree:!0}),e()}function U(e,o=null){try{const t=localStorage.getItem(e);return t!==null?JSON.parse(t):o}catch{return o}}function Q(e,o){localStorage.setItem(e,JSON.stringify(o))}function He(e,o){if(!o||o.replace(/\D/g,"").length<6)return;let t=U(e,[]);t=t.filter(a=>a!==o),t.unshift(o),Q(e,t.slice(0,10))}function se(e,o){const t=document.getElementById(o);t&&(t.innerHTML=U(e,[]).map(a=>`<option value="${a}">`).join(""))}function xe(e){return e.toLocaleString("en-US")}function we(e){return Number(String(e).replace(/[^\d]/g,""))||0}function bt(e){return e.charAt(0).toUpperCase()+e.slice(1)}const Z=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function yt(e){let o=Math.floor(e/100),t=Math.floor(e%100/10),a=e%10,n="";return o>0&&(n+=Z[o]+" trăm ",t===0&&a>0&&(n+="lẻ ")),t>1?(n+=Z[t]+" mươi ",a===1?n+="mốt":a===5?n+="lăm":a>0&&(n+=Z[a])):t===1?(n+="mười ",a===5?n+="lăm":a>0&&(n+=Z[a])):a>0&&(o>0&&(n+="lẻ "),n+=Z[a]),n.trim()}function vt(e){if(e===0)return"không";const o=["","nghìn","triệu","tỷ"];let t="",a=0;for(;e>0;){const n=e%1e3;n>0&&(t=yt(n)+" "+o[a]+" "+t),e=Math.floor(e/1e3),a++}return t.trim()}function Me(e,o,t){let a=0,n=0,i=0;e==="before"?(a=we(o),n=Math.round(a*t),i=a+n):e==="tax"?(n=we(o),a=Math.round(n/t),i=a+n):e==="after"&&(i=we(o),a=Math.round(i/(1+t)),n=i-a);const r=bt(vt(i))+" đồng";return{beforeNum:a,taxNum:n,afterNum:i,beforeStr:xe(a),taxStr:xe(n),afterStr:xe(i),textStr:r}}function xt(e,o){o.before&&o.before.forEach(t=>F(t,e.beforeStr)),o.tax&&o.tax.forEach(t=>F(t,e.taxStr)),o.after&&o.after.forEach(t=>F(t,e.afterStr)),o.text&&o.text.forEach(t=>F(t,e.textStr))}function de(e,o=null){try{const t=localStorage.getItem(e);return t!==null?JSON.parse(t):o}catch{return o}}function O(e,o){localStorage.setItem(e,JSON.stringify(o))}function wt(e,o,t,a){let n=de(J)??"custom",i=de(j)??{...P},r=de(q)??{},s=de(R)??{};const l=document.createElement("div");l.className="cw-tab-header";const u={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};u.custom.innerText="📋 Custom",u.custom.className="cw-tab cw-tab-custom",u.default.innerText="📌 Default",u.default.className="cw-tab cw-tab-default",u.sync.innerText="🔗 Sync",u.sync.className="cw-tab cw-tab-sync";function m(){Object.values(u).forEach(y=>y.classList.remove("active")),u[n].classList.add("active")}m();const d=document.createElement("div");d.style.display=a.data?"none":"block";const h=o("📋 Cấu hình Data","data",y=>{d.style.display=y?"none":"block",t(e)}),p=document.createElement("div");p.className="cw-data-body";function g(){p.innerHTML="";let y=n==="sync"?s:n==="custom"?r:i,L=n==="sync"?R:n==="custom"?q:j;const E=Object.keys(y);E.length===0&&n!=="default"&&(p.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),E.forEach(w=>{const $=document.createElement("div");$.className="cw-data-row";let pe=n!=="default";const z=y[w],ue=z&&typeof z=="object"&&z.hasOwnProperty("value"),Re=ue?z.value:z,Ee=ue&&z.label||w,A=document.createElement("input");A.type="text",A.value=Ee,A.className="cw-data-key"+(pe?" mutable":""),A.title=w,A.readOnly=!pe,pe&&(A.onchange=()=>{const I=A.value.trim();if(!I||I===w){A.value=Ee;return}ue?y[I]={...z,label:I}:y[I]=Re,delete y[w],O(L,y),g()});const K=document.createElement("input");if(K.type="text",K.value=Re??"",K.className="cw-data-val",K.oninput=()=>{ue?y[w]={...z,value:K.value}:y[w]=K.value,O(L,y)},$.appendChild(A),$.appendChild(K),pe){const I=document.createElement("button");I.innerHTML="✕",I.className="cw-del-btn",I.onclick=()=>{confirm(`Delete "${Ee}"?`)&&(delete y[w],O(L,y),g())},$.appendChild(I)}else $.appendChild(document.createElement("div")).className="cw-pad";p.appendChild($)})}u.custom.onclick=()=>{n="custom",O(J,"custom"),m(),g()},u.default.onclick=()=>{n="default",O(J,"default"),m(),g()},u.sync.onclick=()=>{n="sync",O(J,"sync"),m(),g()};const f=document.createElement("button");f.innerText="📤",f.className="cw-icon-btn",f.onclick=()=>{const y=new Blob([JSON.stringify({defaultData:i,customData:r,syncData:s},null,2)],{type:"application/json"}),L=URL.createObjectURL(y),E=document.createElement("a");E.href=L,E.download=`vnpt_data_${Date.now()}.json`,E.click(),URL.revokeObjectURL(L)},d.appendChild(l),l.appendChild(u.custom),l.appendChild(u.default),l.appendChild(u.sync),d.appendChild(p),e.appendChild(h),e.appendChild(d);const b=e.querySelector("#vnpt-cw-fill"),N=e.querySelector("#vnpt-cw-sync"),x=e.querySelector("#vnpt-cw-add"),B=e.querySelector("#vnpt-cw-reset");b&&(b.onclick=Ie),N&&(N.onclick=ot),x&&(x.onclick=()=>{n==="default"&&(n="custom",O(J,"custom"),m());let y=n==="sync"?s:r,L="new_field_"+Date.now();y[L]="",O(n==="sync"?R:q,y),g(),p.scrollTop=p.scrollHeight}),B&&(B.onclick=()=>{confirm("Reset Default Data?")&&(i={...P},O(j,i),g())}),g();const C=h.querySelector(".cw-right-wrap")||document.createElement("div");C.className="cw-right-wrap",C.prepend(f),h.appendChild(C)}function Et(e,o,t){let a=Number(localStorage.getItem(Se))||.08,n=U(ae)??{calc:!1,data:!0},i=U(Ne)??{};function r(p,g){const f=document.createElement("button");return f.innerText=p,f.className="cw-action-btn "+g,f}function s(p,g,f){const b=document.createElement("div");b.className="wg-sec-header";const N=document.createElement("span");N.innerText=p;const x=document.createElement("button");return x.className="wg-toggle-btn",x.innerText=n[g]?"▾":"▴",b.appendChild(N),b.appendChild(x),x.onclick=()=>{n[g]=!n[g],x.innerText=n[g]?"▾":"▴",Q(ae,n),f(n[g])},b}function l(p){const g=window.innerWidth,f=window.innerHeight,b=p.getBoundingClientRect();p.style.left=Math.min(Math.max(parseFloat(p.style.left),0),g-b.width)+"px",p.style.top=Math.min(Math.max(parseFloat(p.style.top),0),f-36)+"px"}const u=document.createElement("div");if(!o){u.className="cw-title-bar",u.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const p=document.createElement("div");p.className="cw-btn-group";const g={fill:r("Fill","cw-btn-fill"),sync:r("Sync","cw-btn-sync"),add:r("Add","cw-btn-add"),reset:r("↺","cw-btn-reset")};g.reset.title="Reset Default fields",Object.values(g).forEach(f=>p.appendChild(f)),u.appendChild(p),e.appendChild(u)}const m=document.createElement("div");m.className="cw-body-inline",m.innerHTML=`
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
    </div>`,o?o.appendChild(m):e.appendChild(m),o||wt(e,s,l,n);const d={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text"),mapBtn:document.getElementById("wg-calc-map-btn"),mapWrap:document.getElementById("wg-calc-map-wrap")};d.taxRate.value=a*100,se(me,"wg-before-list"),se(he,"wg-after-list");function h(p,g){const f=Me(p,g,a);d.before.value=f.beforeStr,d.tax.value=f.taxStr,d.after.value=f.afterStr,d.text.value=f.textStr,xt(f,i)}if(d.taxRate.oninput=()=>{a=Number(d.taxRate.value)/100||0,Q(Se,a),h("before",d.before.value)},d.before.oninput=()=>{const p=Me("before",d.before.value,a);d.tax.value=p.taxStr,d.after.value=p.afterStr,d.text.value=p.textStr},d.before.onchange=()=>{h("before",d.before.value),He(me,d.before.value),se(me,"wg-before-list")},d.tax.oninput=()=>h("tax",d.tax.value),d.after.oninput=()=>h("after",d.after.value),d.after.onchange=()=>{h("after",d.after.value),He(he,d.after.value),se(he,"wg-after-list")},[d.before,d.tax,d.after,d.text].forEach(p=>{["click","focus"].forEach(g=>p.addEventListener(g,()=>{if(!p.value)return;navigator.clipboard.writeText(p.value);const f=p.style.backgroundColor;p.style.backgroundColor="#d1e7dd",setTimeout(()=>p.style.backgroundColor=f,300)}))}),d.mapBtn.onclick=()=>{const p=d.mapWrap.style.display==="flex";if(d.mapWrap.style.display=p?"none":"flex",!p){const g=f=>{!d.mapWrap.contains(f.target)&&f.target!==d.mapBtn&&(d.mapWrap.style.display="none",document.removeEventListener("click",g))};setTimeout(()=>document.addEventListener("click",g),0)}},e.querySelectorAll("input[data-clink]").forEach(p=>{const g=p.dataset.clink;p.value=(i[g]||[]).join(", "),p.oninput=()=>{i[g]=p.value.split(",").map(f=>f.trim()).filter(f=>f),Q(Ne,i)}}),!o){const p=Array.from(e.children).filter(b=>b!==u),g=Oe(e,[u],t,null,b=>{p.forEach(N=>N.style.display=b?"none":""),u.style.borderRadius=b?"8px":"0",b&&(e.style.top=window.innerHeight-(u.offsetHeight||34)+"px")}),f=U(t);return f&&f.docked&&g.setDocked(!0),window.addEventListener("resize",()=>{g.isDocked()?e.style.top=window.innerHeight-u.offsetHeight+"px":l(e)}),g}return null}function St(){const e=document.getElementById("vnpt-inline-calc"),o=document.getElementById("vnpt-btn-calc-toggle");let t=c.calcWidget||document.createElement("div");if(!e&&!c.calcWidget?(t.id="vnpt-calc-widget",document.body.appendChild(t),c.calcWidget=t):e&&(t=c.widget),e&&o){let a=U(ae)??{calc:!1,data:!0};const n=i=>{e.style.display=i?"none":"block",o.classList.toggle("active",!i)};n(a.calc),o.onclick=()=>{a.calc=!a.calc,Q(ae,a),n(a.calc)}}return Et(t,e,Ke)}function ze(){if(!window.__vnptInited){window.__vnptInited=!0,ee.info("Initializing VNPT Userscript...");try{Fe(),dt(),St(),pt(),lt(),ve(),ut(),ft(),ht(),rt();const e=Le(()=>{Qe(),ee.debug("DOM Cache cleared due to mutations")},500);new MutationObserver(t=>{t.some(a=>a.addedNodes.length>0||a.removedNodes.length>0)&&e()}).observe(document.body,{childList:!0,subtree:!0}),ee.info("Userscript initialized successfully.")}catch(e){ee.error("Error during userscript initialization:",e)}}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",ze):ze()})();
