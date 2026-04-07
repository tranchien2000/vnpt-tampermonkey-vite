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

        .btn-scan { background: #11ff00ff; color: #000; } .btn-scan:hover { background: #f2a500; }
        .btn-toggle-id { background: #ee0feeff; color: #ffffffff; } .btn-toggle-id:hover { background: #d2e3fc; }
        .btn-default-toggle { background: #ea4335; color: #ffffffff; font-size: 14px; border: 1px solid transparent; } 
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

    `)}const Pe={widget:null,panel:null,header:null,bannerArea:null,toggleBtn:null,fieldsContainer:null,panelBody:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1,templateBuffer:null,templateName:null,hasDragged:!1},J=new Map,c=new Proxy(Pe,{get(e,o){return o==="on"?(n,a)=>{J.has(n)||J.set(n,[]),J.get(n).push(a)}:e[o]},set(e,o,n){const a=e[o];return e[o]=n,a!==n&&J.has(o)&&J.get(o).forEach(t=>t(n,a)),!0}}),k={tenDaiDienn:"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT",emailDaiDien:"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Số GPKD | MST",goiDV:"Gói Dịch Vụ",ngayKy:"Ngày ký",thangKy:"Tháng Ký",namKy:"Năm ký",soHopDong:"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký"},te="vnpt_docx_fields",me="vnpt_docx_default_fields",ne="vnpt_docx_position",oe="vnpt_docx_size",he="vnpt_docx_opened",j="vnpt_autofill_data_default",q="vnpt_autofill_data_custom",z="vnpt_autofill_data_sync",Ke="vnpt_widget_pos",ae="vnd_tax_rate",be="vnd_before_history",ye="vnd_after_history",ie="vnpt_widget_collapsed",re="vnd_calc_map",W="vnpt_widget_datatab",le="vnpt_templates";let _=null;function v(e,o="#198754",n=2500){_||(_=document.createElement("div"),_.id="vnpt-toast-container",Object.assign(_.style,{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column-reverse",alignItems:"center",gap:"8px",zIndex:"1000000",pointerEvents:"none"}),document.body.appendChild(_));const a=document.createElement("div");a.innerText=e,Object.assign(a.style,{background:o,color:"#fff",padding:"8px 18px",borderRadius:"24px",opacity:"0",transform:"translateY(10px)",transition:"opacity 0.3s, transform 0.3s",fontSize:"13px",fontWeight:"500",fontFamily:"'Segoe UI', Roboto, sans-serif",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",whiteSpace:"nowrap",pointerEvents:"auto"}),_.appendChild(a),requestAnimationFrame(()=>{a.style.opacity="1",a.style.transform="translateY(0)"}),setTimeout(()=>{a.style.opacity="0",a.style.transform="translateY(-10px)",setTimeout(()=>{a.remove(),_&&_.childNodes.length},300)},n)}const je={local:{download(e,o="arraybuffer"){return new Promise((n,a)=>{const t=new FileReader;switch(t.onload=i=>{let l=i.target.result;o==="base64"&&typeof l=="string"&&(l=l.split(",")[1]||l),n(l)},t.onerror=i=>a(i),o.toLowerCase()){case"arraybuffer":t.readAsArrayBuffer(e);break;case"base64":case"dataurl":t.readAsDataURL(e);break;case"text":t.readAsText(e);break;default:a(new Error(`Unsupported read type: ${o}`))}})},async upload(e){return this.download(e,"base64")}}},qe={getAdapter(e){const o=je[e];if(!o)throw new Error(`Storage adapter not found: ${e}`);return o},async upload(e,o,n={}){return await this.getAdapter(e).upload(o,n)},async download(e,o,n={}){return await this.getAdapter(e).download(o,n.type||"arraybuffer")}},Ve="vnpt_templates_db",H="buffers";let ce=null;function ve(){return ce?Promise.resolve(ce):new Promise((e,o)=>{const n=indexedDB.open(Ve,1);n.onupgradeneeded=a=>{const t=a.target.result;t.objectStoreNames.contains(H)||t.createObjectStore(H)},n.onsuccess=a=>{ce=a.target.result,e(ce)},n.onerror=()=>o(n.error)})}async function Ue(e,o){const n=await ve();return new Promise((a,t)=>{const s=n.transaction(H,"readwrite").objectStore(H).put(o,e);s.onsuccess=()=>a(),s.onerror=()=>t(s.error)})}async function $e(e){const o=await ve();return new Promise((n,a)=>{const l=o.transaction(H,"readonly").objectStore(H).get(e);l.onsuccess=()=>n(l.result),l.onerror=()=>a(l.error)})}async function Je(e){const o=await ve();return new Promise((n,a)=>{const l=o.transaction(H,"readwrite").objectStore(H).delete(e);l.onsuccess=()=>n(),l.onerror=()=>a(l.error)})}function G(){try{const e=JSON.parse(localStorage.getItem(le))||[],o=e.filter(n=>n.type!=="local");return o.length!==e.length&&X(o),o}catch{return[]}}function X(e){localStorage.setItem(le,JSON.stringify(e))}function We(e){const o=e.match(/drive\.google\.com\/file\/d\/([^/]+)/);return o?`https://drive.google.com/uc?export=download&id=${o[1]}`:e}function Ge(e){return new Promise((o,n)=>{GM_xmlhttpRequest({method:"GET",url:We(e),responseType:"arraybuffer",onload:a=>{if(a.status>=200&&a.status<300){if(a.response&&a.response.byteLength>4){const t=new Uint8Array(a.response.slice(0,4));if(t[0]===80&&t[1]===75&&t[2]===3&&t[3]===4){o(a.response);return}else{n(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}o(a.response)}else n(new Error(`HTTP ${a.status}: Không lấy được file`))},onerror:()=>n(new Error("Không thể tải URL.")),ontimeout:()=>n(new Error("Timeout khi tải URL."))})})}async function Xe(e,o,n){const a=e.name.replace(/\.docx$/i,""),t=prompt("Đặt tên biến nhớ cho file này:",a);if(!(!t||!t.trim()))try{const i=await e.arrayBuffer();await Ue(t.trim(),i);const s=G().filter(r=>r.name!==t.trim()&&r.fileName!==e.name);s.unshift({name:t.trim(),type:"local_idb",fileName:e.name,lastUsed:Date.now()}),X(s),M(o,n),n&&n(i,t.trim())}catch(i){v(`❌ Lỗi lưu file: ${i.message}`,"#dc3545")}}function M(e,o,n=null){let a=e.querySelector(".vnpt-template-manager-inner"),t,i;if(a)t=a.querySelector(".vnpt-local-list-container"),i=a.querySelector(".vnpt-btn-wrap");else{e.innerHTML="",a=document.createElement("div"),a.className="vnpt-template-manager-inner";const r=document.createElement("div");r.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const p=document.createElement("span");p.className="vnpt-title-main",p.style.cssText="font-size:11px;font-weight:700;color:#444;",i=document.createElement("div"),i.className="vnpt-btn-wrap",i.style.cssText="display:flex;gap:4px;",r.appendChild(p),r.appendChild(i),a.appendChild(r),t=document.createElement("div"),t.className="vnpt-local-list-container",t.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",a.appendChild(t),e.appendChild(a)}const l=G(),s=a.querySelector(".vnpt-title-main");s.innerHTML="Templates"+(n?` <span style="color:#2e7d32;">(Đang dùng: ${n})</span>`:""),l.length===0?t.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':t.innerHTML="",l.forEach((r,p)=>{const m=document.createElement("div");m.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",m.title=r.fileName||r.url||r.name,m.tabIndex=0,m.onfocus=()=>m.style.boxShadow="0 0 0 2px #28a745",m.onblur=()=>m.style.boxShadow="none";const d=r.type==="local"||r.type==="local_base64"||r.type==="local_idb"?"OFF":"ON",h=d==="OFF"?"#6c757d":"#28a745",u=document.createElement("span");u.textContent=d,u.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${h};color:#fff;`;const g=document.createElement("span");g.textContent=r.name,g.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",m.onclick=()=>{m.focus(),Ye(r,o,n,e)},m.appendChild(u),m.appendChild(g);const f=document.createElement("button");f.innerHTML="✎",f.title="Đổi tên template",f.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",f.onclick=N=>{N.stopPropagation();const x=prompt("Đổi tên template:",r.name);if(x&&x.trim()&&x.trim()!==r.name){const B=G();B[p].name=x.trim(),X(B),M(e,o,n)}},m.appendChild(f);const b=document.createElement("button");b.innerHTML="✕",b.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",b.onclick=async N=>{if(N.stopPropagation(),confirm(`Xoá biểu mẫu "${r.name}"?`)){const x=G();x.splice(p,1),X(x),r.type==="local_idb"&&await Je(r.name).catch(()=>null),M(e,o,n===r.name?null:n)}},m.appendChild(b),t.appendChild(m)})}function Ye(e,o,n,a){const t=G(),i=t.find(l=>l.name===e.name&&(l.url===e.url||l.type===e.type));if(i&&(i.lastUsed=Date.now(),X(t)),e.type==="local_idb"){$e(e.name).then(l=>{if(!l)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");o&&o(l,e.name),M(a,o,e.name)}).catch(l=>{v(`❌ Lỗi nạp File IDB: ${l.message}`,"#dc3545")});return}if(e.type==="local_base64"&&e.data){try{const l=window.atob(e.data.split(",")[1]),s=l.length,r=new Uint8Array(s);for(let p=0;p<s;p++)r[p]=l.charCodeAt(p);o&&o(r.buffer,e.name),M(a,o,e.name)}catch(l){v(`❌ Lỗi nạp Base64: ${l.message}`,"#dc3545")}return}Ge(e.url).then(l=>{o&&o(l,e.name),M(a,o,e.name)}).catch(l=>{v(`❌ ${l.message}`,"#dc3545")})}const V=new Map;function Qe(){V.clear()}function Ze(e){e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function Y(e,o){var t;const n=e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,a=(t=Object.getOwnPropertyDescriptor(n,"value"))==null?void 0:t.set;a?a.call(e,o):e.value=o,Ze(e)}function se(e){if(!e)return null;const o=V.get(e);if(o&&document.contains(o))return o;const n=document.getElementById(e);if(n&&(n.tagName==="INPUT"||n.tagName==="TEXTAREA"))return V.set(e,n),n;for(const a of document.querySelectorAll("label"))if(a.textContent.trim()===e){let t=null;if(a.htmlFor&&(t=document.getElementById(a.htmlFor)),!t){let i=a.parentElement;for(;i;){const l=i.querySelector("input,textarea");if(l){t=l;break}if(i=i.parentElement,(i==null?void 0:i.tagName)==="FORM")break}}if(t)return V.set(e,t),t}return null}function de(e){if(!e)return null;const o=V.get(`lbl:${e}`);if(o&&document.contains(o))return o;for(const n of document.querySelectorAll("label"))if(n.innerText.trim()===e){const a=n.parentElement.querySelector("input, textarea");if(a)return V.set(`lbl:${e}`,a),a}return null}function F(e,o){const n=se(e)||de(e);n&&Y(n,o)}function et(e=new Date){return String(e.getDate()).padStart(2,"0")}function tt(e=new Date){return String(e.getMonth()+1).padStart(2,"0")}function nt(e=new Date){return String(e.getFullYear())}function ke(){const e=new Date;return{ngay:et(e),thang:tt(e),nam:nt(e)}}const{ngay:Ce,thang:Te,nam:Be}=ke(),P={ngayKy:{label:"Ngày ký",value:Ce},"thangKy, thangKy1":{label:"Tháng ký",value:Te},"namKy, namKy1":{label:"Năm ký",value:Be},"ngayTiepNhan, ngayThangNamKy":{label:"Ngày ký (full)",value:`${Ce}/${Te}/${Be}`},tenDoanhNghiepB:{label:"Tên doanh nghiệp B",value:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM"},diaChiB:{label:"Địa chỉ B",value:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội"},maSoThueB:{label:"Mã số thuế B",value:"0100686223"},stkB:{label:"Số tài khoản B",value:"1600114156"},diaChiStkB:{label:"Ngân hàng/Địa chỉ STK B",value:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)"},"tenB, nguoiDaiDienB":{label:"Người đại diện B",value:"Phạm Khánh Chung"},"chucVuB, chucVuDaiDienB":{label:"Chức vụ B",value:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp"},"giayUyQuyenSoB, soGiayUyQuyenB":{label:"Giấy ủy quyền số B",value:"2628/GUQ-VNPT-HNI-VP"},"giayUyQuyenNgayB, ngayGiayUyQuyenB":{label:"Giấy ủy quyền ngày B",value:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},GiayUyQuyenB:{label:"Giấy ủy quyền B (full)",value:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},tenDoanhNghiepB1:{label:"Tên doanh nghiệp B (phụ)",value:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},donViTiepNhan:{label:"Đơn vị tiếp nhận",value:"TTKD KHDN"},"tenTiepNhan, tenNguoiNhan":{label:"Người tiếp nhận",value:"Bùi Anh"},dienThoaiB:{label:"Điện thoại B",value:"02436686868"},diaChiTaiKhoanB:{label:"Địa chỉ tài khoản B",value:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 "},noiKy:{label:"Nơi ký",value:"Hà Nội"},emailB:{label:"Email B",value:""},"lienheHopDongB, lienheTuVanB, lienheHoaDonB, sucoCap1B, sucoCap2B, sucoCap3B, sucoCap4B":{label:"Liên hệ B (AM)",value:"AM Bùi Anh"}},D={get(e,o=null){try{const n=localStorage.getItem(e);return n===null?o:JSON.parse(n)}catch(n){return console.warn(`[Storage] Không thể đọc key "${e}":`,n),o}},set(e,o){try{return localStorage.setItem(e,JSON.stringify(o)),!0}catch(n){return console.error(`[Storage] Không thể ghi key "${e}":`,n),!1}},remove(e){try{localStorage.removeItem(e)}catch(o){console.error(`[Storage] Không thể xóa key "${e}":`,o)}}};function Ie(e,o){let n;return function(...t){const i=()=>{clearTimeout(n),e(...t)};clearTimeout(n),n=setTimeout(i,o)}}function Le(){const e=D.get(j)??{...P},o=D.get(q)??{},n={...e,...o};Object.keys(n).forEach(a=>{const t=n[a],i=t&&typeof t=="object"&&t.hasOwnProperty("value")?t.value:t;a.split(",").map(s=>s.trim()).filter(s=>s).forEach(s=>{let r=se(s)||de(s);r&&Y(r,i)})}),v("✅ Auto fill complete")}function ot(){let e=D.get(z)??{};const o=Object.keys(e);if(o.length===0){v("⚠️ No sync mapping","#ffc107");return}o.forEach(n=>{let a=se(n)||de(n);a&&a.value!==void 0&&a.value!==""&&e[n].split(",").map(i=>i.trim()).filter(i=>i).forEach(i=>F(i,a.value))}),v("✅ Sync form complete","#d39e00")}let xe=!1;const at=(e,o)=>{var s;if(xe)return;let n=D.get(z)??{};if(Object.keys(n).length===0)return;let a=e.id,t=e.name,i=null;if(a){const r=document.querySelector(`label[for="${a}"]`);r&&(i=r.textContent.trim())}if(!i){const r=e.closest("label");r&&(i=(s=Array.from(r.childNodes).find(p=>p.nodeType===3))==null?void 0:s.textContent.trim())}let l=n[a]||n[t]||n[i];if(l){xe=!0;try{l.split(",").map(p=>p.trim()).filter(p=>p).forEach(p=>{if(p!==a&&p!==t&&p!==i){const m=se(p)||de(p);m&&document.activeElement!==m&&Y(m,o)}})}finally{xe=!1}}},it=Ie((e,o)=>{at(e,o)},250);function rt(){document.addEventListener("input",e=>{const o=e.target;!o||!["INPUT","TEXTAREA"].includes(o.tagName)||o.closest("#vnpt-docx-widget")||o.closest("#vnpt-inline-calc")||it(o,o.value)})}function E(e,o,n=null,a=""){const t=c.fieldsContainer.querySelector(".text-hint");t&&t.remove();const i=c.fieldsContainer.querySelectorAll(".f-key");let l=!1;for(let s of i)if(s.value.split(",")[0].trim()===e){const p=s.closest(".vnpt-field-row"),m=p.querySelector(".f-val"),d=p.querySelector(".f-label");o!==""&&m.value!==o&&document.activeElement!==m&&(m.value=o),n!==null&&n!==""&&d.value!==n&&document.activeElement!==d&&(d.value=n),a!==""&&s.value!==e+", "+a&&document.activeElement!==s&&(s.value=e+", "+a),l=!0;break}if(!l){(n===null||n==="")&&(n=k[e]||"");const s=document.createElement("div");s.className="vnpt-field-row row-item",s.setAttribute("draggable","false");let r=e;a&&(r+=", "+a),s.innerHTML=`
            <input type="checkbox" class="row-chk" title="Chọn để thao tác hàng loạt" style="margin: 0 2px 0 2px;" />
            <input type="text" class="f-label" placeholder="Nhãn..." value="${n}" />
            <input type="text" class="f-key" placeholder="Mã biến / IDs đồng bộ" value="${r}" title="Biến DOCX (đầu tiên), theo sau là các ID web cách dấu phẩy" />
            <span class="row-drag-handle" title="Kéo thả để di chuyển">=</span>
            <input type="text" class="f-val" placeholder="Giá trị" value="${o}" />
        `;const p=s.querySelector(".f-val"),m=s.querySelector(".f-key");e==="tenToChuc"&&(p.style.textAlign="right");const d=()=>{const u=p.value;m.value.split(",").map(f=>f.trim()).filter(f=>f).forEach(f=>F(f,u))};m.addEventListener("input",function(){T();const u=this.value.split(",")[0].trim();p.style.textAlign=u==="tenToChuc"?"right":"",d()}),s.querySelector(".f-label").addEventListener("input",T),p.addEventListener("input",function(){T(),d()});const h=s.querySelector(".row-drag-handle");h.addEventListener("mouseenter",()=>s.setAttribute("draggable","true")),h.addEventListener("mouseleave",()=>{s.classList.contains("dragging")||s.setAttribute("draggable","false")}),s.addEventListener("dragstart",function(u){c.draggedRowForVNPT=this,u.dataTransfer.effectAllowed="move",u.dataTransfer.setData("text/plain",e),this.classList.add("dragging")}),s.addEventListener("dragover",u=>(u.preventDefault(),!1)),s.addEventListener("dragenter",function(){this.classList.add("over")}),s.addEventListener("dragleave",function(){this.classList.remove("over")}),s.addEventListener("drop",function(u){if(u.stopPropagation(),c.draggedRowForVNPT&&c.draggedRowForVNPT!==this){const g=Array.from(c.fieldsContainer.querySelectorAll(".vnpt-field-row")),f=g.indexOf(c.draggedRowForVNPT),b=g.indexOf(this);f<b?this.parentNode.insertBefore(c.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(c.draggedRowForVNPT,this),T()}return!1}),s.addEventListener("dragend",function(){this.setAttribute("draggable","false"),c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(u=>{u.classList.remove("over","dragging")}),c.draggedRowForVNPT=null}),c.fieldsContainer.appendChild(s),c.fieldsContainer.scrollTop=c.fieldsContainer.scrollHeight}}function T(){const e=c.isDefaultMode?me:te,o={};c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(a=>{const i=a.querySelector(".f-key").value.trim().split(",").map(m=>m.trim()).filter(m=>m),l=i[0],s=i.slice(1).join(", "),r=a.querySelector(".f-label").value.trim(),p=a.querySelector(".f-val").value;l&&(o[l]={label:r,value:p,sync:s})}),D.set(e,o)}function we(){try{c.fieldsContainer.innerHTML="";const o=D.get(te)||{};Object.keys(k).forEach(n=>{const a=k[n],t=o[n];t&&typeof t=="object"?E(n,t.value,t.label||a,t.sync||""):t?E(n,t,a,""):E(n,"",a,"")}),Object.keys(o).forEach(n=>{if(!(n in k)){const a=o[n];typeof a=="object"?E(n,a.value,a.label,a.sync||""):E(n,a,"","")}}),Object.keys(k).length===0&&Object.keys(o).length===0&&(c.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(o){console.error("Error loading config:",o),Object.keys(k).forEach(n=>E(n,"",k[n]))}const e=D.get(ne);e&&c.widget&&(c.widget.style.bottom="auto",e.right?(c.widget.style.right=e.right,c.widget.style.left="auto"):e.left&&(c.widget.style.left=e.left,c.widget.style.right="auto"),e.top&&(c.widget.style.top=e.top))}function lt(){document.getElementById("vnpt-btn-toggle-id").onclick=()=>c.fieldsContainer.classList.toggle("show-ids"),document.getElementById("vnpt-btn-default").onclick=()=>{c.isDefaultMode=!c.isDefaultMode},c.on("isDefaultMode",e=>De(e)),document.getElementById("vnpt-btn-reset-default").onclick=()=>{confirm("Khôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?")&&(D.remove(me),c.isDefaultMode&&(De(!0),v("🔄 Đã khôi phục dữ liệu gốc","#1a73e8")))},document.getElementById("vnpt-btn-batch-del").onclick=()=>{const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row");let o=0;e.forEach(n=>{var a;(a=n.querySelector(".row-chk"))!=null&&a.checked&&(n.remove(),o++)}),o===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(e.forEach(n=>n.remove()),v("🗑️ Đã xóa toàn bộ","#ff5252"),T()):(v(`🗑️ Đã xóa ${o} trường`,"#ff5252"),T())},document.getElementById("vnpt-btn-add").onclick=()=>{const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;E("bien_moi_"+e,"","",""),T()},document.getElementById("vnpt-btn-fill-back").onclick=()=>{Le();let e=0;c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(o=>{const n=o.querySelector(".f-key").value.trim(),a=o.querySelector(".f-val").value;n.split(",").map(t=>t.trim()).filter(Boolean).forEach(t=>{(document.getElementById(t)||document.getElementsByName(t)[0])&&(F(t,a),e++)})}),e>0?v(`✅ Đã điền ngược ${e} trường`,"#198754"):v("⚠️ Không khớp trường nào","#ffc107")}}function De(e){const o=document.getElementById("vnpt-btn-default"),n=document.getElementById("vnpt-btn-reset-default");if(c.fieldsContainer.innerHTML="",c.bannerArea.innerHTML="",e){o.classList.add("active"),n&&(n.style.display="flex"),c.fieldsContainer.classList.add("vnpt-mode-default"),v("📌 Chế độ Dữ liệu mặc định (Có thể sửa)","#ea4335");const a=document.createElement("div");a.className="vnpt-default-banner",a.innerHTML="<span> Lưu ý: đây là Dữ liệu mặc định (Có thể sửa/lưu)</span>",c.bannerArea.appendChild(a);const t=D.get(me);t===null?Object.keys(P).forEach(i=>{const l=P[i],s=l&&typeof l=="object"?l.value:l,r=l&&typeof l=="object"?l.label:k[i]||"";E(i,s,r)}):Object.keys(t).forEach(i=>{const l=t[i];E(i,l.value,l.label,l.sync||"")})}else o.classList.remove("active"),n&&(n.style.display="none"),c.fieldsContainer.classList.remove("vnpt-mode-default"),v("📋 Đã quay lại Dữ liệu cá nhân"),we()}function ct(){const e={version:"1.0",timestamp:Date.now(),fields:JSON.parse(localStorage.getItem(te))||{},templates:JSON.parse(localStorage.getItem(le))||[],position:JSON.parse(localStorage.getItem(ne))||null,size:JSON.parse(localStorage.getItem(oe))||null,calc:{default:JSON.parse(localStorage.getItem(j))||null,custom:JSON.parse(localStorage.getItem(q))||null,sync:JSON.parse(localStorage.getItem(z))||null,map:JSON.parse(localStorage.getItem(re))||{},taxRate:Number(localStorage.getItem(ae))||.08}},o=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),n=URL.createObjectURL(o),a=document.createElement("a");a.href=n,a.download=`vnpt_config_${new Date().toISOString().slice(0,10)}.json`,a.click(),URL.revokeObjectURL(n),v("📤 Đã xuất cấu hình JSON")}function st(){const e=document.createElement("input");e.type="file",e.accept=".json",e.onchange=async o=>{const n=o.target.files[0];if(n)try{const a=await n.text(),t=JSON.parse(a);if(!t.fields&&!t.calc)throw new Error("Định dạng file không hợp lệ!");t.fields&&localStorage.setItem(te,JSON.stringify(t.fields)),t.templates&&localStorage.setItem(le,JSON.stringify(t.templates)),t.position&&localStorage.setItem(ne,JSON.stringify(t.position)),t.size&&localStorage.setItem(oe,JSON.stringify(t.size)),t.calc&&(t.calc.default&&localStorage.setItem(j,JSON.stringify(t.calc.default)),t.calc.custom&&localStorage.setItem(q,JSON.stringify(t.calc.custom)),t.calc.sync&&localStorage.setItem(z,JSON.stringify(t.calc.sync)),t.calc.map&&localStorage.setItem(re,JSON.stringify(t.calc.map)),t.calc.taxRate!==void 0&&localStorage.setItem(ae,t.calc.taxRate)),await we();const i=document.getElementById("vnpt-calc-widget");if(i){const s=document.getElementById("wg-taxRate");s&&t.calc&&t.calc.taxRate!==void 0&&(s.value=t.calc.taxRate*100),t.calc&&t.calc.map&&i.querySelectorAll("input[data-clink]").forEach(r=>{const p=r.dataset.clink;t.calc.map[p]&&(r.value=(t.calc.map[p]||[]).join(", "))})}const l=document.getElementById("vnpt-template-manager");l&&M(l,(s,r)=>{c.templateBuffer=s,c.templateName=r}),t.position&&c.widget&&(t.position.right?(c.widget.style.right=t.position.right,c.widget.style.left="auto"):t.position.left&&(c.widget.style.left=t.position.left,c.widget.style.right="auto"),t.position.top&&(c.widget.style.top=t.position.top),c.widget.style.bottom="auto"),t.size&&c.panel&&(c.panel.style.width=t.size.width+"px",c.panel.style.height=t.size.height+"px"),v("✅ Nhập cấu hình thành công!")}catch(a){console.error("Lỗi Import:",a),alert("Lỗi: "+a.message)}},e.click()}function dt(){const e=document.createElement("div");e.id="vnpt-docx-widget";const o=localStorage.getItem(he)==="true";e.innerHTML=`
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
    `,document.body.appendChild(e),c.widget=e,c.panel=document.getElementById("vnpt-export-panel"),c.toggleBtn=document.getElementById("vnpt-toggle-btn"),c.header=document.getElementById("vnpt-panel-header"),c.bannerArea=document.getElementById("vnpt-banner-area"),c.fieldsContainer=document.getElementById("vnpt-fields-container");try{const i=JSON.parse(localStorage.getItem(oe));i&&i.width&&i.height&&(c.panel.style.width=i.width+"px",c.panel.style.height=i.height+"px")}catch(i){console.error("Lỗi load size panel:",i)}new ResizeObserver(i=>{if(c.panel.style.display!=="none")for(let l of i){const{width:s,height:r}=l.contentRect;s>0&&r>0&&localStorage.setItem(oe,JSON.stringify({width:Math.round(s+20),height:Math.round(r+20)}))}}).observe(c.panel),c.panelBody=document.getElementById("vnpt-panel-body"),M(document.getElementById("vnpt-template-manager"),(i,l)=>{c.templateBuffer=i,c.templateName=l}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const i=this.files&&this.files[0];if(!i)return;const l=document.getElementById("vnpt-template-manager");Xe(i,l,(s,r)=>{c.templateBuffer=s,c.templateName=r}),this.value=""}),c.toggleBtn.addEventListener("click",i=>{c.hasDragged||(c.panel.style.display==="none"?(c.panel.style.display="flex",c.toggleBtn.className="btn-opened",c.toggleBtn.innerHTML="✖",localStorage.setItem(he,"true")):(c.panel.style.display="none",c.toggleBtn.className="btn-closed",c.toggleBtn.innerHTML="📄",localStorage.setItem(he,"false")))}),document.getElementById("vnpt-btn-import").onclick=i=>{st(),document.getElementById("vnpt-more-menu").style.display="none"},document.getElementById("vnpt-btn-export-json").onclick=i=>{ct(),document.getElementById("vnpt-more-menu").style.display="none"};const a=document.getElementById("vnpt-btn-more"),t=document.getElementById("vnpt-more-menu");a.onclick=i=>{i.stopPropagation();const l=t.style.display==="none";t.style.display=l?"flex":"none",a.classList.toggle("active",l)},document.addEventListener("click",()=>{t.style.display="none",a.classList.remove("active")})}function Oe(e,o,n,a=null,t=null){let i=!1,l=0,s=0,r=!1;function p(d){r!==d&&(r=d,t&&t(d))}function m(d){if(d.button!==0)return;i=!0,c.hasDragged=!1;const h=e.getBoundingClientRect();l=d.clientX-h.left,s=d.clientY-h.top,document.body.style.userSelect="none",o&&o.forEach(u=>u.style.cursor="grabbing"),a&&a(),d.preventDefault()}return o.forEach(d=>{d.addEventListener("mousedown",m)}),document.addEventListener("mousemove",function(d){if(!i)return;c.hasDragged=!0;let h=d.clientX-l,u=d.clientY-s;const g=window.innerWidth,f=window.innerHeight,b=document.getElementById("vnpt-toggle-btn"),N=b?b.offsetWidth:40,x=b?b.offsetHeight:40,B=e.id==="vnpt-docx-widget";let C=e.offsetWidth||0;if(B){let S=N+6-C,w=g-C+6;h<S&&(h=S),h>w&&(h=w)}else C=C||200,h<0&&(h=0),h+C>g&&(h=Math.max(0,g-C));let y=r;if(B?y=!1:r?d.clientY<f-40&&(y=!1):d.clientY>f-10&&(y=!0),u<0&&(u=0),y)p(!0),e.style.top=f-e.offsetHeight+"px",B?(e.style.right=g-h-C+"px",e.style.left="auto"):(e.style.left=h+"px",e.style.right="auto"),e.style.bottom="auto";else{p(!1);let I=e.offsetHeight||40,S;if(B)S=10+x;else{const w=e.querySelector(".cw-title-bar");S=w?w.offsetHeight:I}u+S>f&&(u=Math.max(0,f-S)),e.style.top=u+"px",B?(e.style.right=g-h-C+"px",e.style.left="auto"):(e.style.left=h+"px",e.style.right="auto"),e.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(i&&(i=!1,document.body.style.userSelect="",o&&o.forEach(d=>d.style.cursor="grab"),n)){const d=e.id==="vnpt-docx-widget";localStorage.setItem(n,JSON.stringify({left:d?void 0:e.style.left,right:d?e.style.right:void 0,top:e.style.top,x:d?void 0:parseFloat(e.style.left),y:parseFloat(e.style.top),docked:r}))}}),{isDocked:()=>r,setDocked:p}}function pt(){c.widget&&c.header&&c.toggleBtn&&(Oe(c.widget,[c.header,c.toggleBtn],ne),window.addEventListener("resize",()=>{const e=window.innerWidth,o=window.innerHeight,n=document.getElementById("vnpt-toggle-btn"),a=n?n.offsetWidth:40,t=n?n.offsetHeight:40;let i=c.widget.getBoundingClientRect(),l=i.left,s=i.top,r=c.widget.offsetWidth||0,m=a+6-r,d=e-r+6;l<m&&(l=m),l>d&&(l=d),s+10+t>o&&(s=Math.max(0,o-(10+t))),c.widget.style.right=e-l-r+"px",c.widget.style.top=s+"px"}))}function Ae(e){const o=e.toLowerCase(),{ngay:n,thang:a,nam:t}=ke();return{ngayky:n,thangky:a,thangky1:a,namky:t,namky1:t,soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[o]||""}function ut(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){if(c.isDefaultMode){Object.keys(P).forEach(o=>{E(o,P[o],k[o]||"")}),T(),v("Đã nạp lại dữ liệu mặc định từ hệ thống.");return}let e=0;Object.keys(k).forEach(o=>{var t;const n=document.getElementById(o);let a="";n&&(a=n.tagName.toLowerCase()==="select"?((t=n.options[n.selectedIndex])==null?void 0:t.text)||"":n.value,e++),a||(a=Ae(o)),E(o,a,null)}),T(),e>0?(this.style.background="#34a853",this.style.color="#fff",this.innerText="Done",setTimeout(()=>{this.style.background="#fbbc04",this.style.color="#000",this.innerText="Quét"},1e3)):v("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(e){e.target.closest("#vnpt-docx-widget")||e.target.closest("#vnpt-inline-calc")||e.target&&e.target.id&&k[e.target.id]!==void 0&&(E(e.target.id,e.target.value,null),T())}),document.addEventListener("change",function(e){var o;if(!(e.target.closest("#vnpt-docx-widget")||e.target.closest("#vnpt-inline-calc"))&&e.target&&e.target.id&&k[e.target.id]!==void 0){let n=e.target.tagName.toLowerCase()==="select"?((o=e.target.options[e.target.selectedIndex])==null?void 0:o.text)||"":e.target.value;E(e.target.id,n,null),T()}})}function _e(e,o,n){try{let a;try{a=new window.PizZip(e)}catch(r){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(r);return}const t=new window.docxtemplater(a,{paragraphLoop:!0,linebreaks:!0});t.render(o);const i=t.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),l=URL.createObjectURL(i),s=document.createElement("a");s.href=l,s.download=n,document.body.appendChild(s),s.click(),setTimeout(()=>{document.body.removeChild(s),URL.revokeObjectURL(l)},100)}catch(a){let t=a.message;a.properties&&a.properties.errors instanceof Array?t=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+a.properties.errors.map(l=>"- "+(l.properties.explanation||l.message)).join(`
`):t="Lỗi phần mềm Word sinh ra: "+t,alert(t),console.error("DocX Error:",a)}}function ft(){const e=document.getElementById("vnpt-export-filename");e&&e.addEventListener("input",()=>{e.dataset.userEdited="1",e.value.trim()||(e.dataset.userEdited="0")});function o(){if(!e||e.dataset.userEdited==="1")return;let n="";if(c.fieldsContainer&&c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(r=>{const m=r.querySelector(".f-key").value.trim().split(",")[0].trim(),d=r.querySelector(".f-val").value.trim();m==="tenToChuc"&&(n=d)}),!n){const s=document.getElementById("tenToChuc");s&&(n=s.tagName.toLowerCase()==="textarea"||s.tagName.toLowerCase()==="input"?s.value.trim():s.innerText.trim())}function a(s){if(!s)return"";let r=s;return r=r.replace(/Tổng công ty/gi,""),r=r.replace(/Công ty/gi,""),r=r.replace(/\bCty\b/gi,""),r=r.replace(/Trách nhiệm hữu hạn/gi,""),r=r.replace(/\bTNHH\b/gi,""),r=r.replace(/Cổ phần/gi,""),r=r.replace(/\bCP\b/gi,""),r=r.replace(/Một thành viên/gi,""),r=r.replace(/\bMTV\b/gi,""),r=r.replace(/Chi nhánh/gi,""),r=r.replace(/Việt Nam/gi,"VN"),r=r.replace(/Viet Nam/gi,"VN"),r=r.replace(/\s+/g," ").trim(),r=r.replace(/^[-,\s]+|[-,\s]+$/g,""),r.length>50&&(r=r.substring(0,47)+"..."),r.replace(/[<>:"/\\|?*]/g,"")}let t=a(n),i=c.templateName?c.templateName.replace(/\.docx$/i,""):"",l=[];i&&l.push(i),t&&l.push(t),l.length>0?e.value=l.join(" - ")+".docx":e.value||(e.value="Export_Auto.docx")}setInterval(o,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const n={};if(c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(l=>{const r=l.querySelector(".f-key").value.trim().split(",")[0].trim(),p=l.querySelector(".f-val").value;r&&(n[r]=p)}),Object.keys(n).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}let t=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(t.toLowerCase().endsWith(".docx")||(t+=".docx"),c.templateBuffer){_e(c.templateBuffer,n,t);return}const i=document.getElementById("vnpt-template-file");if(i.files&&i.files.length>0){qe.download("local",i.files[0],{type:"arraybuffer"}).then(l=>_e(l,n,t)).catch(l=>alert(`Lỗi đọc file: ${l.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')})}const gt=["chucVu","noiCap","noiCapSoDkdn","ngayky","thangky","namky","thangky1","namky1","noiKy"],mt=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function ht(){function e(){gt.forEach(a=>{const t=document.getElementById(a);t&&!t.dataset.filled&&(t.dataset.filled="1",Y(t,Ae(a)))}),mt.forEach(a=>{const t=document.getElementById(a.src),i=document.getElementById(a.target);t&&i&&!t.dataset.bound&&(t.dataset.bound="1",t.addEventListener("input",()=>Y(i,t.value)))})}let o;new MutationObserver(()=>{clearTimeout(o),o=setTimeout(e,200)}).observe(document.body,{childList:!0,subtree:!0}),e()}function U(e,o=null){try{const n=localStorage.getItem(e);return n!==null?JSON.parse(n):o}catch{return o}}function Q(e,o){localStorage.setItem(e,JSON.stringify(o))}function He(e,o){if(!o||o.replace(/\D/g,"").length<6)return;let n=U(e,[]);n=n.filter(a=>a!==o),n.unshift(o),Q(e,n.slice(0,10))}function pe(e,o){const n=document.getElementById(o);n&&(n.innerHTML=U(e,[]).map(a=>`<option value="${a}">`).join(""))}function Se(e){return e.toLocaleString("en-US")}function Ee(e){return Number(String(e).replace(/[^\d]/g,""))||0}function bt(e){return e.charAt(0).toUpperCase()+e.slice(1)}const Z=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function yt(e){let o=Math.floor(e/100),n=Math.floor(e%100/10),a=e%10,t="";return o>0&&(t+=Z[o]+" trăm ",n===0&&a>0&&(t+="lẻ ")),n>1?(t+=Z[n]+" mươi ",a===1?t+="mốt":a===5?t+="lăm":a>0&&(t+=Z[a])):n===1?(t+="mười ",a===5?t+="lăm":a>0&&(t+=Z[a])):a>0&&(o>0&&(t+="lẻ "),t+=Z[a]),t.trim()}function vt(e){if(e===0)return"không";const o=["","nghìn","triệu","tỷ"];let n="",a=0;for(;e>0;){const t=e%1e3;t>0&&(n=yt(t)+" "+o[a]+" "+n),e=Math.floor(e/1e3),a++}return n.trim()}function Me(e,o,n){let a=0,t=0,i=0;e==="before"?(a=Ee(o),t=Math.round(a*n),i=a+t):e==="tax"?(t=Ee(o),a=Math.round(t/n),i=a+t):e==="after"&&(i=Ee(o),a=Math.round(i/(1+n)),t=i-a);const l=bt(vt(i))+" đồng";return{beforeNum:a,taxNum:t,afterNum:i,beforeStr:Se(a),taxStr:Se(t),afterStr:Se(i),textStr:l}}function xt(e,o){o.before&&o.before.forEach(n=>F(n,e.beforeStr)),o.tax&&o.tax.forEach(n=>F(n,e.taxStr)),o.after&&o.after.forEach(n=>F(n,e.afterStr)),o.text&&o.text.forEach(n=>F(n,e.textStr))}function ue(e,o=null){try{const n=localStorage.getItem(e);return n!==null?JSON.parse(n):o}catch{return o}}function O(e,o){localStorage.setItem(e,JSON.stringify(o))}function wt(e,o,n,a){let t=ue(W)??"custom",i=ue(j)??{...P},l=ue(q)??{},s=ue(z)??{};const r=document.createElement("div");r.className="cw-tab-header";const p={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};p.custom.innerText="📋 Custom",p.custom.className="cw-tab cw-tab-custom",p.default.innerText="📌 Default",p.default.className="cw-tab cw-tab-default",p.sync.innerText="🔗 Sync",p.sync.className="cw-tab cw-tab-sync";function m(){Object.values(p).forEach(y=>y.classList.remove("active")),p[t].classList.add("active")}m();const d=document.createElement("div");d.style.display=a.data?"none":"block";const h=o("📋 Cấu hình Data","data",y=>{d.style.display=y?"none":"block",n(e)}),u=document.createElement("div");u.className="cw-data-body";function g(){u.innerHTML="";let y=t==="sync"?s:t==="custom"?l:i,I=t==="sync"?z:t==="custom"?q:j;const S=Object.keys(y);S.length===0&&t!=="default"&&(u.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),S.forEach(w=>{const $=document.createElement("div");$.className="cw-data-row";let fe=t!=="default";const R=y[w],ge=R&&typeof R=="object"&&R.hasOwnProperty("value"),ze=ge?R.value:R,Ne=ge&&R.label||w,A=document.createElement("input");A.type="text",A.value=Ne,A.className="cw-data-key"+(fe?" mutable":""),A.title=w,A.readOnly=!fe,fe&&(A.onchange=()=>{const L=A.value.trim();if(!L||L===w){A.value=Ne;return}ge?y[L]={...R,label:L}:y[L]=ze,delete y[w],O(I,y),g()});const K=document.createElement("input");if(K.type="text",K.value=ze??"",K.className="cw-data-val",K.oninput=()=>{ge?y[w]={...R,value:K.value}:y[w]=K.value,O(I,y)},$.appendChild(A),$.appendChild(K),fe){const L=document.createElement("button");L.innerHTML="✕",L.className="cw-del-btn",L.onclick=()=>{confirm(`Delete "${Ne}"?`)&&(delete y[w],O(I,y),g())},$.appendChild(L)}else $.appendChild(document.createElement("div")).className="cw-pad";u.appendChild($)})}p.custom.onclick=()=>{t="custom",O(W,"custom"),m(),g()},p.default.onclick=()=>{t="default",O(W,"default"),m(),g()},p.sync.onclick=()=>{t="sync",O(W,"sync"),m(),g()};const f=document.createElement("button");f.innerText="📤",f.className="cw-icon-btn",f.onclick=()=>{const y=new Blob([JSON.stringify({defaultData:i,customData:l,syncData:s},null,2)],{type:"application/json"}),I=URL.createObjectURL(y),S=document.createElement("a");S.href=I,S.download=`vnpt_data_${Date.now()}.json`,S.click(),URL.revokeObjectURL(I)},d.appendChild(r),r.appendChild(p.custom),r.appendChild(p.default),r.appendChild(p.sync),d.appendChild(u),e.appendChild(h),e.appendChild(d);const b=e.querySelector("#vnpt-cw-fill"),N=e.querySelector("#vnpt-cw-sync"),x=e.querySelector("#vnpt-cw-add"),B=e.querySelector("#vnpt-cw-reset");b&&(b.onclick=Le),N&&(N.onclick=ot),x&&(x.onclick=()=>{t==="default"&&(t="custom",O(W,"custom"),m());let y=t==="sync"?s:l,I="new_field_"+Date.now();y[I]="",O(t==="sync"?z:q,y),g(),u.scrollTop=u.scrollHeight}),B&&(B.onclick=()=>{confirm("Reset Default Data?")&&(i={...P},O(j,i),g())}),g();const C=h.querySelector(".cw-right-wrap")||document.createElement("div");C.className="cw-right-wrap",C.prepend(f),h.appendChild(C)}function St(e,o,n){let a=Number(localStorage.getItem(ae))||.08,t=U(ie)??{calc:!1,data:!0},i=U(re)??{};function l(u,g){const f=document.createElement("button");return f.innerText=u,f.className="cw-action-btn "+g,f}function s(u,g,f){const b=document.createElement("div");b.className="wg-sec-header";const N=document.createElement("span");N.innerText=u;const x=document.createElement("button");return x.className="wg-toggle-btn",x.innerText=t[g]?"▾":"▴",b.appendChild(N),b.appendChild(x),x.onclick=()=>{t[g]=!t[g],x.innerText=t[g]?"▾":"▴",Q(ie,t),f(t[g])},b}function r(u){const g=window.innerWidth,f=window.innerHeight,b=u.getBoundingClientRect();u.style.left=Math.min(Math.max(parseFloat(u.style.left),0),g-b.width)+"px",u.style.top=Math.min(Math.max(parseFloat(u.style.top),0),f-36)+"px"}const p=document.createElement("div");if(!o){p.className="cw-title-bar",p.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const u=document.createElement("div");u.className="cw-btn-group";const g={fill:l("Fill","cw-btn-fill"),sync:l("Sync","cw-btn-sync"),add:l("Add","cw-btn-add"),reset:l("↺","cw-btn-reset")};g.reset.title="Reset Default fields",Object.values(g).forEach(f=>u.appendChild(f)),p.appendChild(u),e.appendChild(p)}const m=document.createElement("div");m.className="cw-body-inline",m.innerHTML=`
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
    </div>`,o?o.appendChild(m):e.appendChild(m),o||wt(e,s,r,t);const d={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text"),mapBtn:document.getElementById("wg-calc-map-btn"),mapWrap:document.getElementById("wg-calc-map-wrap")};d.taxRate.value=a*100,pe(be,"wg-before-list"),pe(ye,"wg-after-list");function h(u,g){const f=Me(u,g,a);d.before.value=f.beforeStr,d.tax.value=f.taxStr,d.after.value=f.afterStr,d.text.value=f.textStr,xt(f,i)}if(d.taxRate.oninput=()=>{a=Number(d.taxRate.value)/100||0,Q(ae,a),h("before",d.before.value)},d.before.oninput=()=>{const u=Me("before",d.before.value,a);d.tax.value=u.taxStr,d.after.value=u.afterStr,d.text.value=u.textStr},d.before.onchange=()=>{h("before",d.before.value),He(be,d.before.value),pe(be,"wg-before-list")},d.tax.oninput=()=>h("tax",d.tax.value),d.after.oninput=()=>h("after",d.after.value),d.after.onchange=()=>{h("after",d.after.value),He(ye,d.after.value),pe(ye,"wg-after-list")},[d.before,d.tax,d.after,d.text].forEach(u=>{["click","focus"].forEach(g=>u.addEventListener(g,()=>{if(!u.value)return;navigator.clipboard.writeText(u.value);const f=u.style.backgroundColor;u.style.backgroundColor="#d1e7dd",setTimeout(()=>u.style.backgroundColor=f,300)}))}),d.mapBtn.onclick=()=>{const u=d.mapWrap.style.display==="flex";if(d.mapWrap.style.display=u?"none":"flex",!u){const g=f=>{!d.mapWrap.contains(f.target)&&f.target!==d.mapBtn&&(d.mapWrap.style.display="none",document.removeEventListener("click",g))};setTimeout(()=>document.addEventListener("click",g),0)}},e.querySelectorAll("input[data-clink]").forEach(u=>{const g=u.dataset.clink;u.value=(i[g]||[]).join(", "),u.oninput=()=>{i[g]=u.value.split(",").map(f=>f.trim()).filter(f=>f),Q(re,i)}}),!o){const u=Array.from(e.children).filter(b=>b!==p),g=Oe(e,[p],n,null,b=>{u.forEach(N=>N.style.display=b?"none":""),p.style.borderRadius=b?"8px":"0",b&&(e.style.top=window.innerHeight-(p.offsetHeight||34)+"px")}),f=U(n);return f&&f.docked&&g.setDocked(!0),window.addEventListener("resize",()=>{g.isDocked()?e.style.top=window.innerHeight-p.offsetHeight+"px":r(e)}),g}return null}function Et(){const e=document.getElementById("vnpt-inline-calc"),o=document.getElementById("vnpt-btn-calc-toggle");let n=c.calcWidget||document.createElement("div");if(!e&&!c.calcWidget?(n.id="vnpt-calc-widget",document.body.appendChild(n),c.calcWidget=n):e&&(n=c.widget),e&&o){let a=U(ie)??{calc:!1,data:!0};const t=i=>{e.style.display=i?"none":"block",o.classList.toggle("active",!i)};t(a.calc),o.onclick=()=>{a.calc=!a.calc,Q(ie,a),t(a.calc)}}return St(n,e,Ke)}function Re(){if(!window.__vnptInited){window.__vnptInited=!0,ee.info("Initializing VNPT Userscript...");try{Fe(),dt(),Et(),pt(),lt(),we(),ut(),ft(),ht(),rt();const e=Ie(()=>{Qe(),ee.debug("DOM Cache cleared due to mutations")},500);new MutationObserver(n=>{n.some(a=>a.addedNodes.length>0||a.removedNodes.length>0)&&e()}).observe(document.body,{childList:!0,subtree:!0}),ee.info("Userscript initialized successfully.")}catch(e){ee.error("Error during userscript initialization:",e)}}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Re):Re()})();
