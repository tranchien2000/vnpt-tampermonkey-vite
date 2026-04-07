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
        .btn-reset-default { background: #e53d3dff; color: #1a73e8; border: 1px solid #d2e3fc; font-size: 14px; }
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

    `)}const Ke={widget:null,panel:null,header:null,bannerArea:null,toggleBtn:null,fieldsContainer:null,panelBody:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1,templateBuffer:null,templateName:null,hasDragged:!1},$=new Map,c=new Proxy(Ke,{get(e,a){return a==="on"?(o,n)=>{$.has(o)||$.set(o,[]),$.get(o).push(n)}:e[a]},set(e,a,o){const n=e[a];return e[a]=o,n!==o&&$.has(a)&&$.get(a).forEach(t=>t(o,n)),!0}}),T={tenDaiDienn:"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT",emailDaiDien:"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Số GPKD | MST",goiDV:"Gói Dịch Vụ",ngayKy:"Ngày ký",thangKy:"Tháng Ký",namKy:"Năm ký",soHopDong:"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký"},te="vnpt_docx_fields",me="vnpt_docx_default_fields",ne="vnpt_docx_position",oe="vnpt_docx_size",he="vnpt_docx_opened",j="vnpt_autofill_data_default",q="vnpt_autofill_data_custom",z="vnpt_autofill_data_sync",Pe="vnpt_widget_pos",ae="vnd_tax_rate",be="vnd_before_history",ye="vnd_after_history",ie="vnpt_widget_collapsed",re="vnd_calc_map",J="vnpt_widget_datatab",le="vnpt_templates";let _=null;function S(e,a="#198754",o=2500){_||(_=document.createElement("div"),_.id="vnpt-toast-container",Object.assign(_.style,{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column-reverse",alignItems:"center",gap:"8px",zIndex:"1000000",pointerEvents:"none"}),document.body.appendChild(_));const n=document.createElement("div");n.innerText=e,Object.assign(n.style,{background:a,color:"#fff",padding:"8px 18px",borderRadius:"24px",opacity:"0",transform:"translateY(10px)",transition:"opacity 0.3s, transform 0.3s",fontSize:"13px",fontWeight:"500",fontFamily:"'Segoe UI', Roboto, sans-serif",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",whiteSpace:"nowrap",pointerEvents:"auto"}),_.appendChild(n),requestAnimationFrame(()=>{n.style.opacity="1",n.style.transform="translateY(0)"}),setTimeout(()=>{n.style.opacity="0",n.style.transform="translateY(-10px)",setTimeout(()=>{n.remove(),_&&_.childNodes.length},300)},o)}const je={local:{download(e,a="arraybuffer"){return new Promise((o,n)=>{const t=new FileReader;switch(t.onload=i=>{let l=i.target.result;a==="base64"&&typeof l=="string"&&(l=l.split(",")[1]||l),o(l)},t.onerror=i=>n(i),a.toLowerCase()){case"arraybuffer":t.readAsArrayBuffer(e);break;case"base64":case"dataurl":t.readAsDataURL(e);break;case"text":t.readAsText(e);break;default:n(new Error(`Unsupported read type: ${a}`))}})},async upload(e){return this.download(e,"base64")}}},qe={getAdapter(e){const a=je[e];if(!a)throw new Error(`Storage adapter not found: ${e}`);return a},async upload(e,a,o={}){return await this.getAdapter(e).upload(a,o)},async download(e,a,o={}){return await this.getAdapter(e).download(a,o.type||"arraybuffer")}},Ve="vnpt_templates_db",H="buffers";let ce=null;function ve(){return ce?Promise.resolve(ce):new Promise((e,a)=>{const o=indexedDB.open(Ve,1);o.onupgradeneeded=n=>{const t=n.target.result;t.objectStoreNames.contains(H)||t.createObjectStore(H)},o.onsuccess=n=>{ce=n.target.result,e(ce)},o.onerror=()=>a(o.error)})}async function Ue(e,a){const o=await ve();return new Promise((n,t)=>{const s=o.transaction(H,"readwrite").objectStore(H).put(a,e);s.onsuccess=()=>n(),s.onerror=()=>t(s.error)})}async function We(e){const a=await ve();return new Promise((o,n)=>{const l=a.transaction(H,"readonly").objectStore(H).get(e);l.onsuccess=()=>o(l.result),l.onerror=()=>n(l.error)})}async function $e(e){const a=await ve();return new Promise((o,n)=>{const l=a.transaction(H,"readwrite").objectStore(H).delete(e);l.onsuccess=()=>o(),l.onerror=()=>n(l.error)})}function G(){try{const e=JSON.parse(localStorage.getItem(le))||[],a=e.filter(o=>o.type!=="local");return a.length!==e.length&&X(a),a}catch{return[]}}function X(e){localStorage.setItem(le,JSON.stringify(e))}function Je(e){const a=e.match(/drive\.google\.com\/file\/d\/([^/]+)/);return a?`https://drive.google.com/uc?export=download&id=${a[1]}`:e}function Ge(e){return new Promise((a,o)=>{GM_xmlhttpRequest({method:"GET",url:Je(e),responseType:"arraybuffer",onload:n=>{if(n.status>=200&&n.status<300){if(n.response&&n.response.byteLength>4){const t=new Uint8Array(n.response.slice(0,4));if(t[0]===80&&t[1]===75&&t[2]===3&&t[3]===4){a(n.response);return}else{o(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}a(n.response)}else o(new Error(`HTTP ${n.status}: Không lấy được file`))},onerror:()=>o(new Error("Không thể tải URL.")),ontimeout:()=>o(new Error("Timeout khi tải URL."))})})}async function Xe(e,a,o){const n=e.name.replace(/\.docx$/i,""),t=prompt("Đặt tên biến nhớ cho file này:",n);if(!(!t||!t.trim()))try{const i=await e.arrayBuffer();await Ue(t.trim(),i);const s=G().filter(r=>r.name!==t.trim()&&r.fileName!==e.name);s.unshift({name:t.trim(),type:"local_idb",fileName:e.name,lastUsed:Date.now()}),X(s),M(a,o),o&&o(i,t.trim())}catch(i){S(`❌ Lỗi lưu file: ${i.message}`,"#dc3545")}}function M(e,a,o=null){let n=e.querySelector(".vnpt-template-manager-inner"),t,i;if(n)t=n.querySelector(".vnpt-local-list-container"),i=n.querySelector(".vnpt-btn-wrap");else{e.innerHTML="",n=document.createElement("div"),n.className="vnpt-template-manager-inner";const r=document.createElement("div");r.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const p=document.createElement("span");p.className="vnpt-title-main",p.style.cssText="font-size:11px;font-weight:700;color:#444;",i=document.createElement("div"),i.className="vnpt-btn-wrap",i.style.cssText="display:flex;gap:4px;",r.appendChild(p),r.appendChild(i),n.appendChild(r),t=document.createElement("div"),t.className="vnpt-local-list-container",t.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",n.appendChild(t),e.appendChild(n)}const l=G(),s=n.querySelector(".vnpt-title-main");s.innerHTML="Templates"+(o?` <span style="color:#2e7d32;">(Đang dùng: ${o})</span>`:""),l.length===0?t.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':t.innerHTML="",l.forEach((r,p)=>{const f=document.createElement("div");f.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",f.title=r.fileName||r.url||r.name,f.tabIndex=0,f.onfocus=()=>f.style.boxShadow="0 0 0 2px #28a745",f.onblur=()=>f.style.boxShadow="none";const d=r.type==="local"||r.type==="local_base64"||r.type==="local_idb"?"OFF":"ON",y=d==="OFF"?"#6c757d":"#28a745",m=document.createElement("span");m.textContent=d,m.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${y};color:#fff;`;const x=document.createElement("span");x.textContent=r.name,x.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",f.onclick=()=>{f.focus(),Ye(r,a,o,e)},f.appendChild(m),f.appendChild(x);const v=document.createElement("button");v.innerHTML="✎",v.title="Đổi tên template",v.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",v.onclick=h=>{h.stopPropagation();const g=prompt("Đổi tên template:",r.name);if(g&&g.trim()&&g.trim()!==r.name){const w=G();w[p].name=g.trim(),X(w),M(e,a,o)}},f.appendChild(v);const u=document.createElement("button");u.innerHTML="✕",u.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",u.onclick=async h=>{if(h.stopPropagation(),confirm(`Xoá biểu mẫu "${r.name}"?`)){const g=G();g.splice(p,1),X(g),r.type==="local_idb"&&await $e(r.name).catch(()=>null),M(e,a,o===r.name?null:o)}},f.appendChild(u),t.appendChild(f)})}function Ye(e,a,o,n){const t=G(),i=t.find(l=>l.name===e.name&&(l.url===e.url||l.type===e.type));if(i&&(i.lastUsed=Date.now(),X(t)),e.type==="local_idb"){We(e.name).then(l=>{if(!l)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");a&&a(l,e.name),M(n,a,e.name)}).catch(l=>{S(`❌ Lỗi nạp File IDB: ${l.message}`,"#dc3545")});return}if(e.type==="local_base64"&&e.data){try{const l=window.atob(e.data.split(",")[1]),s=l.length,r=new Uint8Array(s);for(let p=0;p<s;p++)r[p]=l.charCodeAt(p);a&&a(r.buffer,e.name),M(n,a,e.name)}catch(l){S(`❌ Lỗi nạp Base64: ${l.message}`,"#dc3545")}return}Ge(e.url).then(l=>{a&&a(l,e.name),M(n,a,e.name)}).catch(l=>{S(`❌ ${l.message}`,"#dc3545")})}const V=new Map;function Qe(){V.clear()}function Ze(e){e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function Y(e,a){var t;const o=e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,n=(t=Object.getOwnPropertyDescriptor(o,"value"))==null?void 0:t.set;n?n.call(e,a):e.value=a,Ze(e)}function se(e){if(!e)return null;const a=V.get(e);if(a&&document.contains(a))return a;const o=document.getElementById(e);if(o&&(o.tagName==="INPUT"||o.tagName==="TEXTAREA"))return V.set(e,o),o;for(const n of document.querySelectorAll("label"))if(n.textContent.trim()===e){let t=null;if(n.htmlFor&&(t=document.getElementById(n.htmlFor)),!t){let i=n.parentElement;for(;i;){const l=i.querySelector("input,textarea");if(l){t=l;break}if(i=i.parentElement,(i==null?void 0:i.tagName)==="FORM")break}}if(t)return V.set(e,t),t}return null}function de(e){if(!e)return null;const a=V.get(`lbl:${e}`);if(a&&document.contains(a))return a;for(const o of document.querySelectorAll("label"))if(o.innerText.trim()===e){const n=o.parentElement.querySelector("input, textarea");if(n)return V.set(`lbl:${e}`,n),n}return null}function F(e,a){const o=se(e)||de(e);o&&Y(o,a)}function et(e=new Date){return String(e.getDate()).padStart(2,"0")}function tt(e=new Date){return String(e.getMonth()+1).padStart(2,"0")}function nt(e=new Date){return String(e.getFullYear())}function ke(){const e=new Date;return{ngay:et(e),thang:tt(e),nam:nt(e)}}const{ngay:Ce,thang:Te,nam:Be}=ke(),K={ngayKy:{label:"Ngày ký",value:Ce},"thangKy, thangKy1":{label:"Tháng ký",value:Te},"namKy, namKy1":{label:"Năm ký",value:Be},"ngayTiepNhan, ngayThangNamKy":{label:"Ngày ký (full)",value:`${Ce}/${Te}/${Be}`},tenDoanhNghiepB:{label:"Tên doanh nghiệp B",value:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM"},diaChiB:{label:"Địa chỉ B",value:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội"},maSoThueB:{label:"Mã số thuế B",value:"0100686223"},stkB:{label:"Số tài khoản B",value:"1600114156"},diaChiStkB:{label:"Ngân hàng/Địa chỉ STK B",value:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)"},"tenB, nguoiDaiDienB":{label:"Người đại diện B",value:"Phạm Khánh Chung"},"chucVuB, chucVuDaiDienB":{label:"Chức vụ B",value:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp"},"giayUyQuyenSoB, soGiayUyQuyenB":{label:"Giấy ủy quyền số B",value:"2628/GUQ-VNPT-HNI-VP"},"giayUyQuyenNgayB, ngayGiayUyQuyenB":{label:"Giấy ủy quyền ngày B",value:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},GiayUyQuyenB:{label:"Giấy ủy quyền B (full)",value:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},tenDoanhNghiepB1:{label:"Tên doanh nghiệp B (phụ)",value:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},donViTiepNhan:{label:"Đơn vị tiếp nhận",value:"TTKD KHDN"},"tenTiepNhan, tenNguoiNhan":{label:"Người tiếp nhận",value:"Bùi Anh"},dienThoaiB:{label:"Điện thoại B",value:"02436686868"},diaChiTaiKhoanB:{label:"Địa chỉ tài khoản B",value:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 "},noiKy:{label:"Nơi ký",value:"Hà Nội"},emailB:{label:"Email B",value:""},"lienheHopDongB, lienheTuVanB, lienheHoaDonB, sucoCap1B, sucoCap2B, sucoCap3B, sucoCap4B":{label:"Liên hệ B (AM)",value:"AM Bùi Anh"}},D={get(e,a=null){try{const o=localStorage.getItem(e);return o===null?a:JSON.parse(o)}catch(o){return console.warn(`[Storage] Không thể đọc key "${e}":`,o),a}},set(e,a){try{return localStorage.setItem(e,JSON.stringify(a)),!0}catch(o){return console.error(`[Storage] Không thể ghi key "${e}":`,o),!1}},remove(e){try{localStorage.removeItem(e)}catch(a){console.error(`[Storage] Không thể xóa key "${e}":`,a)}}};function Ie(e,a){let o;return function(...t){const i=()=>{clearTimeout(o),e(...t)};clearTimeout(o),o=setTimeout(i,a)}}function Le(){const e=D.get(j)??{...K},a=D.get(q)??{},o={...e,...a};Object.keys(o).forEach(n=>{const t=o[n],i=t&&typeof t=="object"&&t.hasOwnProperty("value")?t.value:t;n.split(",").map(s=>s.trim()).filter(s=>s).forEach(s=>{let r=se(s)||de(s);r&&Y(r,i)})}),S("✅ Auto fill complete")}function ot(){let e=D.get(z)??{};const a=Object.keys(e);if(a.length===0){S("⚠️ No sync mapping","#ffc107");return}a.forEach(o=>{let n=se(o)||de(o);n&&n.value!==void 0&&n.value!==""&&e[o].split(",").map(i=>i.trim()).filter(i=>i).forEach(i=>F(i,n.value))}),S("✅ Sync form complete","#d39e00")}let xe=!1;const at=(e,a)=>{var s;if(xe)return;let o=D.get(z)??{};if(Object.keys(o).length===0)return;let n=e.id,t=e.name,i=null;if(n){const r=document.querySelector(`label[for="${n}"]`);r&&(i=r.textContent.trim())}if(!i){const r=e.closest("label");r&&(i=(s=Array.from(r.childNodes).find(p=>p.nodeType===3))==null?void 0:s.textContent.trim())}let l=o[n]||o[t]||o[i];if(l){xe=!0;try{l.split(",").map(p=>p.trim()).filter(p=>p).forEach(p=>{if(p!==n&&p!==t&&p!==i){const f=se(p)||de(p);f&&document.activeElement!==f&&Y(f,a)}})}finally{xe=!1}}},it=Ie((e,a)=>{at(e,a)},250);function rt(){document.addEventListener("input",e=>{const a=e.target;!a||!["INPUT","TEXTAREA"].includes(a.tagName)||a.closest("#vnpt-docx-widget")||a.closest("#vnpt-inline-calc")||it(a,a.value)})}function C(e,a,o=null,n=""){const t=c.fieldsContainer.querySelector(".text-hint");t&&t.remove();const i=c.fieldsContainer.querySelectorAll(".f-key");let l=!1;for(let s of i)if(s.value.split(",")[0].trim()===e){const p=s.closest(".vnpt-field-row"),f=p.querySelector(".f-val"),d=p.querySelector(".f-label");a!==""&&f.value!==a&&document.activeElement!==f&&(f.value=a),o!==null&&o!==""&&d.value!==o&&document.activeElement!==d&&(d.value=o),n!==""&&s.value!==e+", "+n&&document.activeElement!==s&&(s.value=e+", "+n),l=!0;break}if(!l){(o===null||o==="")&&(o=T[e]||"");const s=document.createElement("div");s.className="vnpt-field-row row-item",s.setAttribute("draggable","false");let r=e;n&&(r+=", "+n),s.innerHTML=`
            <input type="checkbox" class="row-chk" title="Chọn để thao tác hàng loạt" style="margin: 0 2px 0 2px;" />
            <input type="text" class="f-label" placeholder="Nhãn..." value="${o}" />
            <input type="text" class="f-key" placeholder="Mã biến / IDs đồng bộ" value="${r}" title="Biến DOCX (đầu tiên), theo sau là các ID web cách dấu phẩy" />
            <span class="row-drag-handle" title="Kéo thả để di chuyển">=</span>
            <input type="text" class="f-val" placeholder="Giá trị" value="${a}" />
        `;const p=s.querySelector(".f-val"),f=s.querySelector(".f-key");e==="tenToChuc"&&(p.style.textAlign="right");const d=()=>{const m=p.value;f.value.split(",").map(v=>v.trim()).filter(v=>v).forEach(v=>F(v,m))};f.addEventListener("input",function(){B();const m=this.value.split(",")[0].trim();p.style.textAlign=m==="tenToChuc"?"right":"",d()}),s.querySelector(".f-label").addEventListener("input",B),p.addEventListener("input",function(){B(),d()});const y=s.querySelector(".row-drag-handle");y.addEventListener("mouseenter",()=>s.setAttribute("draggable","true")),y.addEventListener("mouseleave",()=>{s.classList.contains("dragging")||s.setAttribute("draggable","false")}),s.addEventListener("dragstart",function(m){c.draggedRowForVNPT=this,m.dataTransfer.effectAllowed="move",m.dataTransfer.setData("text/plain",e),this.classList.add("dragging")}),s.addEventListener("dragover",m=>(m.preventDefault(),!1)),s.addEventListener("dragenter",function(){this.classList.add("over")}),s.addEventListener("dragleave",function(){this.classList.remove("over")}),s.addEventListener("drop",function(m){if(m.stopPropagation(),c.draggedRowForVNPT&&c.draggedRowForVNPT!==this){const x=Array.from(c.fieldsContainer.querySelectorAll(".vnpt-field-row")),v=x.indexOf(c.draggedRowForVNPT),u=x.indexOf(this);v<u?this.parentNode.insertBefore(c.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(c.draggedRowForVNPT,this),B()}return!1}),s.addEventListener("dragend",function(){this.setAttribute("draggable","false"),c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(m=>{m.classList.remove("over","dragging")}),c.draggedRowForVNPT=null}),c.fieldsContainer.appendChild(s),c.fieldsContainer.scrollTop=c.fieldsContainer.scrollHeight}}function B(){const e=c.isDefaultMode?me:te,a={};c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(n=>{const i=n.querySelector(".f-key").value.trim().split(",").map(f=>f.trim()).filter(f=>f),l=i[0],s=i.slice(1).join(", "),r=n.querySelector(".f-label").value.trim(),p=n.querySelector(".f-val").value;l&&(a[l]={label:r,value:p,sync:s})}),D.set(e,a)}function we(){try{c.fieldsContainer.innerHTML="";const a=D.get(te)||{};Object.keys(T).forEach(o=>{const n=T[o],t=a[o];t&&typeof t=="object"?C(o,t.value,t.label||n,t.sync||""):t?C(o,t,n,""):C(o,"",n,"")}),Object.keys(a).forEach(o=>{if(!(o in T)){const n=a[o];typeof n=="object"?C(o,n.value,n.label,n.sync||""):C(o,n,"","")}}),Object.keys(T).length===0&&Object.keys(a).length===0&&(c.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(a){console.error("Error loading config:",a),Object.keys(T).forEach(o=>C(o,"",T[o]))}const e=D.get(ne);e&&c.widget&&(c.widget.style.bottom="auto",e.right?(c.widget.style.right=e.right,c.widget.style.left="auto"):e.left&&(c.widget.style.left=e.left,c.widget.style.right="auto"),e.top&&(c.widget.style.top=e.top))}function lt(){document.getElementById("vnpt-btn-toggle-id").onclick=()=>c.fieldsContainer.classList.toggle("show-ids"),document.getElementById("vnpt-btn-default").onclick=()=>{c.isDefaultMode=!c.isDefaultMode},c.on("isDefaultMode",e=>De(e)),document.getElementById("vnpt-btn-reset-default").onclick=()=>{confirm("Khôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?")&&(D.remove(me),c.isDefaultMode&&(De(!0),S("🔄 Đã khôi phục dữ liệu gốc","#1a73e8")))},document.getElementById("vnpt-btn-batch-del").onclick=()=>{const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row");let a=0;e.forEach(o=>{var n;(n=o.querySelector(".row-chk"))!=null&&n.checked&&(o.remove(),a++)}),a===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(e.forEach(o=>o.remove()),S("🗑️ Đã xóa toàn bộ","#ff5252"),B()):(S(`🗑️ Đã xóa ${a} trường`,"#ff5252"),B())},document.getElementById("vnpt-btn-add").onclick=()=>{const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;C("bien_moi_"+e,"","",""),B()},document.getElementById("vnpt-btn-fill-back").onclick=()=>{Le();let e=0;c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(a=>{const o=a.querySelector(".f-key").value.trim(),n=a.querySelector(".f-val").value;o.split(",").map(t=>t.trim()).filter(Boolean).forEach(t=>{(document.getElementById(t)||document.getElementsByName(t)[0])&&(F(t,n),e++)})}),e>0?S(`✅ Đã điền ngược ${e} trường`,"#198754"):S("⚠️ Không khớp trường nào","#ffc107")}}function De(e){const a=document.getElementById("vnpt-btn-default"),o=document.getElementById("vnpt-btn-reset-default");if(c.fieldsContainer.innerHTML="",c.bannerArea.innerHTML="",e){a.classList.add("active"),o&&(o.style.display="flex"),c.fieldsContainer.classList.add("vnpt-mode-default"),S("📌 Chế độ Dữ liệu mặc định (Có thể sửa)","#ea4335");const n=document.createElement("div");n.className="vnpt-default-banner",n.innerHTML="<span> Lưu ý: đây là Dữ liệu mặc định (Có thể sửa/lưu)</span>",c.bannerArea.appendChild(n);const t=D.get(me);t===null?Object.keys(K).forEach(i=>{const l=K[i],s=l&&typeof l=="object"?l.value:l,r=l&&typeof l=="object"?l.label:T[i]||"";C(i,s,r)}):Object.keys(t).forEach(i=>{const l=t[i];C(i,l.value,l.label,l.sync||"")})}else a.classList.remove("active"),o&&(o.style.display="none"),c.fieldsContainer.classList.remove("vnpt-mode-default"),S("📋 Đã quay lại Dữ liệu cá nhân"),we()}function ct(){const e={version:"1.0",timestamp:Date.now(),fields:JSON.parse(localStorage.getItem(te))||{},templates:JSON.parse(localStorage.getItem(le))||[],position:JSON.parse(localStorage.getItem(ne))||null,size:JSON.parse(localStorage.getItem(oe))||null,calc:{default:JSON.parse(localStorage.getItem(j))||null,custom:JSON.parse(localStorage.getItem(q))||null,sync:JSON.parse(localStorage.getItem(z))||null,map:JSON.parse(localStorage.getItem(re))||{},taxRate:Number(localStorage.getItem(ae))||.08}},a=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),o=URL.createObjectURL(a),n=document.createElement("a");n.href=o,n.download=`vnpt_config_${new Date().toISOString().slice(0,10)}.json`,n.click(),URL.revokeObjectURL(o),S("📤 Đã xuất cấu hình JSON")}function st(){const e=document.createElement("input");e.type="file",e.accept=".json",e.onchange=async a=>{const o=a.target.files[0];if(o)try{const n=await o.text(),t=JSON.parse(n);if(!t.fields&&!t.calc)throw new Error("Định dạng file không hợp lệ!");t.fields&&localStorage.setItem(te,JSON.stringify(t.fields)),t.templates&&localStorage.setItem(le,JSON.stringify(t.templates)),t.position&&localStorage.setItem(ne,JSON.stringify(t.position)),t.size&&localStorage.setItem(oe,JSON.stringify(t.size)),t.calc&&(t.calc.default&&localStorage.setItem(j,JSON.stringify(t.calc.default)),t.calc.custom&&localStorage.setItem(q,JSON.stringify(t.calc.custom)),t.calc.sync&&localStorage.setItem(z,JSON.stringify(t.calc.sync)),t.calc.map&&localStorage.setItem(re,JSON.stringify(t.calc.map)),t.calc.taxRate!==void 0&&localStorage.setItem(ae,t.calc.taxRate)),await we();const i=document.getElementById("vnpt-calc-widget");if(i){const s=document.getElementById("wg-taxRate");s&&t.calc&&t.calc.taxRate!==void 0&&(s.value=t.calc.taxRate*100),t.calc&&t.calc.map&&i.querySelectorAll("input[data-clink]").forEach(r=>{const p=r.dataset.clink;t.calc.map[p]&&(r.value=(t.calc.map[p]||[]).join(", "))})}const l=document.getElementById("vnpt-template-manager");l&&M(l,(s,r)=>{c.templateBuffer=s,c.templateName=r}),t.position&&c.widget&&(t.position.right?(c.widget.style.right=t.position.right,c.widget.style.left="auto"):t.position.left&&(c.widget.style.left=t.position.left,c.widget.style.right="auto"),t.position.top&&(c.widget.style.top=t.position.top),c.widget.style.bottom="auto"),t.size&&c.panel&&(c.panel.style.width=t.size.width+"px",c.panel.style.height=t.size.height+"px"),S("✅ Nhập cấu hình thành công!")}catch(n){console.error("Lỗi Import:",n),alert("Lỗi: "+n.message)}},e.click()}function dt(){const e=document.createElement("div");e.id="vnpt-docx-widget";const a=localStorage.getItem(he)==="true";e.innerHTML=`
        <button id="vnpt-toggle-btn" title="Mở/Đóng UI Hợp đồng" class="${a?"btn-opened":"btn-closed"}">${a?"✖":"📄"}</button>

        <div id="vnpt-export-panel" style="display: ${a?"flex":"none"};">
            <div id="vnpt-panel-header" title="Kẹp chuột vào đây để di chuyển">
                <span id="vnpt-panel-title">VNPT PRO</span>
                <div class="btn-row" style="margin-bottom: 0; padding-right: 35px; gap: 4px; position: relative;">
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-scan" title="Lấy data theo biểu mẫu web">Scan</button>
                    <button class="vnpt-btn-action btn-fill-back" id="vnpt-btn-fill-back" title="Điền dữ liệu ngược lên web">Điền thông tin</button>
                    
                    <button class="vnpt-btn-action btn-default-toggle" id="vnpt-btn-default" title="Dữ liệu mặc định VNPT">Mặc định</button>
                    <button class="vnpt-btn-action btn-toggle-id" id="vnpt-btn-toggle-id" title="Ẩn/Hiện Mã ID">Nhập key</button>
                    <button class="vnpt-btn-action btn-add" id="vnpt-btn-add" title="Chèn thêm trường trống">➕</button>
                    <button class="vnpt-btn-action btn-clean" id="vnpt-btn-batch-del" title="Xóa chọn / Xóa tất cả">🗑️</button>
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
    `,document.body.appendChild(e),c.widget=e,c.panel=document.getElementById("vnpt-export-panel"),c.toggleBtn=document.getElementById("vnpt-toggle-btn"),c.header=document.getElementById("vnpt-panel-header"),c.bannerArea=document.getElementById("vnpt-banner-area"),c.fieldsContainer=document.getElementById("vnpt-fields-container");try{const n=JSON.parse(localStorage.getItem(oe));n&&n.width&&n.height&&(c.panel.style.width=n.width+"px",c.panel.style.height=n.height+"px")}catch(n){console.error("Lỗi load size panel:",n)}new ResizeObserver(n=>{if(c.panel.style.display!=="none")for(let t of n){const{width:i,height:l}=t.contentRect;i>0&&l>0&&localStorage.setItem(oe,JSON.stringify({width:Math.round(i+20),height:Math.round(l+20)}))}}).observe(c.panel),c.panelBody=document.getElementById("vnpt-panel-body"),M(document.getElementById("vnpt-template-manager"),(n,t)=>{c.templateBuffer=n,c.templateName=t}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const n=this.files&&this.files[0];if(!n)return;const t=document.getElementById("vnpt-template-manager");Xe(n,t,(i,l)=>{c.templateBuffer=i,c.templateName=l}),this.value=""}),c.toggleBtn.addEventListener("click",n=>{c.hasDragged||(c.panel.style.display==="none"?(c.panel.style.display="flex",c.toggleBtn.className="btn-opened",c.toggleBtn.innerHTML="✖",localStorage.setItem(he,"true")):(c.panel.style.display="none",c.toggleBtn.className="btn-closed",c.toggleBtn.innerHTML="📄",localStorage.setItem(he,"false")))})}function Oe(e,a,o,n=null,t=null){let i=!1,l=0,s=0,r=!1;function p(d){r!==d&&(r=d,t&&t(d))}function f(d){if(d.button!==0)return;i=!0,c.hasDragged=!1;const y=e.getBoundingClientRect();l=d.clientX-y.left,s=d.clientY-y.top,document.body.style.userSelect="none",a&&a.forEach(m=>m.style.cursor="grabbing"),n&&n(),d.preventDefault()}return a.forEach(d=>{d.addEventListener("mousedown",f)}),document.addEventListener("mousemove",function(d){if(!i)return;c.hasDragged=!0;let y=d.clientX-l,m=d.clientY-s;const x=window.innerWidth,v=window.innerHeight,u=document.getElementById("vnpt-toggle-btn"),h=u?u.offsetWidth:40,g=u?u.offsetHeight:40,w=e.id==="vnpt-docx-widget";let E=e.offsetWidth||0;if(w){let k=h+6-E,N=x-E+6;y<k&&(y=k),y>N&&(y=N)}else E=E||200,y<0&&(y=0),y+E>x&&(y=Math.max(0,x-E));let b=r;if(w?b=!1:r?d.clientY<v-40&&(b=!1):d.clientY>v-10&&(b=!0),m<0&&(m=0),b)p(!0),e.style.top=v-e.offsetHeight+"px",w?(e.style.right=x-y-E+"px",e.style.left="auto"):(e.style.left=y+"px",e.style.right="auto"),e.style.bottom="auto";else{p(!1);let I=e.offsetHeight||40,k;if(w)k=10+g;else{const N=e.querySelector(".cw-title-bar");k=N?N.offsetHeight:I}m+k>v&&(m=Math.max(0,v-k)),e.style.top=m+"px",w?(e.style.right=x-y-E+"px",e.style.left="auto"):(e.style.left=y+"px",e.style.right="auto"),e.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(i&&(i=!1,document.body.style.userSelect="",a&&a.forEach(d=>d.style.cursor="grab"),o)){const d=e.id==="vnpt-docx-widget";localStorage.setItem(o,JSON.stringify({left:d?void 0:e.style.left,right:d?e.style.right:void 0,top:e.style.top,x:d?void 0:parseFloat(e.style.left),y:parseFloat(e.style.top),docked:r}))}}),{isDocked:()=>r,setDocked:p}}function pt(){c.widget&&c.header&&c.toggleBtn&&(Oe(c.widget,[c.header,c.toggleBtn],ne),window.addEventListener("resize",()=>{const e=window.innerWidth,a=window.innerHeight,o=document.getElementById("vnpt-toggle-btn"),n=o?o.offsetWidth:40,t=o?o.offsetHeight:40;let i=c.widget.getBoundingClientRect(),l=i.left,s=i.top,r=c.widget.offsetWidth||0,f=n+6-r,d=e-r+6;l<f&&(l=f),l>d&&(l=d),s+10+t>a&&(s=Math.max(0,a-(10+t))),c.widget.style.right=e-l-r+"px",c.widget.style.top=s+"px"}))}function Ae(e){const a=e.toLowerCase(),{ngay:o,thang:n,nam:t}=ke();return{ngayky:o,thangky:n,thangky1:n,namky:t,namky1:t,soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[a]||""}function ut(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){if(c.isDefaultMode){Object.keys(K).forEach(a=>{C(a,K[a],T[a]||"")}),B(),S("Đã nạp lại dữ liệu mặc định từ hệ thống.");return}let e=0;Object.keys(T).forEach(a=>{var t;const o=document.getElementById(a);let n="";o&&(n=o.tagName.toLowerCase()==="select"?((t=o.options[o.selectedIndex])==null?void 0:t.text)||"":o.value,e++),n||(n=Ae(a)),C(a,n,null)}),B(),e>0?(this.style.background="#34a853",this.style.color="#fff",this.innerText="Done",setTimeout(()=>{this.style.background="#fbbc04",this.style.color="#000",this.innerText="Quét"},1e3)):S("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(e){e.target.closest("#vnpt-docx-widget")||e.target.closest("#vnpt-inline-calc")||e.target&&e.target.id&&T[e.target.id]!==void 0&&(C(e.target.id,e.target.value,null),B())}),document.addEventListener("change",function(e){var a;if(!(e.target.closest("#vnpt-docx-widget")||e.target.closest("#vnpt-inline-calc"))&&e.target&&e.target.id&&T[e.target.id]!==void 0){let o=e.target.tagName.toLowerCase()==="select"?((a=e.target.options[e.target.selectedIndex])==null?void 0:a.text)||"":e.target.value;C(e.target.id,o,null),B()}})}function _e(e,a,o){try{let n;try{n=new window.PizZip(e)}catch(r){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(r);return}const t=new window.docxtemplater(n,{paragraphLoop:!0,linebreaks:!0});t.render(a);const i=t.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),l=URL.createObjectURL(i),s=document.createElement("a");s.href=l,s.download=o,document.body.appendChild(s),s.click(),setTimeout(()=>{document.body.removeChild(s),URL.revokeObjectURL(l)},100)}catch(n){let t=n.message;n.properties&&n.properties.errors instanceof Array?t=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+n.properties.errors.map(l=>"- "+(l.properties.explanation||l.message)).join(`
`):t="Lỗi phần mềm Word sinh ra: "+t,alert(t),console.error("DocX Error:",n)}}function ft(){const e=document.getElementById("vnpt-export-filename");e&&e.addEventListener("input",()=>{e.dataset.userEdited="1",e.value.trim()||(e.dataset.userEdited="0")});function a(){if(!e||e.dataset.userEdited==="1")return;let o="";if(c.fieldsContainer&&c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(r=>{const f=r.querySelector(".f-key").value.trim().split(",")[0].trim(),d=r.querySelector(".f-val").value.trim();f==="tenToChuc"&&(o=d)}),!o){const s=document.getElementById("tenToChuc");s&&(o=s.tagName.toLowerCase()==="textarea"||s.tagName.toLowerCase()==="input"?s.value.trim():s.innerText.trim())}function n(s){if(!s)return"";let r=s;return r=r.replace(/Tổng công ty/gi,""),r=r.replace(/Công ty/gi,""),r=r.replace(/\bCty\b/gi,""),r=r.replace(/Trách nhiệm hữu hạn/gi,""),r=r.replace(/\bTNHH\b/gi,""),r=r.replace(/Cổ phần/gi,""),r=r.replace(/\bCP\b/gi,""),r=r.replace(/Một thành viên/gi,""),r=r.replace(/\bMTV\b/gi,""),r=r.replace(/Chi nhánh/gi,""),r=r.replace(/Việt Nam/gi,"VN"),r=r.replace(/Viet Nam/gi,"VN"),r=r.replace(/\s+/g," ").trim(),r=r.replace(/^[-,\s]+|[-,\s]+$/g,""),r.length>50&&(r=r.substring(0,47)+"..."),r.replace(/[<>:"/\\|?*]/g,"")}let t=n(o),i=c.templateName?c.templateName.replace(/\.docx$/i,""):"",l=[];i&&l.push(i),t&&l.push(t),l.length>0?e.value=l.join(" - ")+".docx":e.value||(e.value="Export_Auto.docx")}setInterval(a,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const o={};if(c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(l=>{const r=l.querySelector(".f-key").value.trim().split(",")[0].trim(),p=l.querySelector(".f-val").value;r&&(o[r]=p)}),Object.keys(o).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}let t=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(t.toLowerCase().endsWith(".docx")||(t+=".docx"),c.templateBuffer){_e(c.templateBuffer,o,t);return}const i=document.getElementById("vnpt-template-file");if(i.files&&i.files.length>0){qe.download("local",i.files[0],{type:"arraybuffer"}).then(l=>_e(l,o,t)).catch(l=>alert(`Lỗi đọc file: ${l.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')})}const gt=["chucVu","noiCap","noiCapSoDkdn","ngayky","thangky","namky","thangky1","namky1","noiKy"],mt=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function ht(){function e(){gt.forEach(n=>{const t=document.getElementById(n);t&&!t.dataset.filled&&(t.dataset.filled="1",Y(t,Ae(n)))}),mt.forEach(n=>{const t=document.getElementById(n.src),i=document.getElementById(n.target);t&&i&&!t.dataset.bound&&(t.dataset.bound="1",t.addEventListener("input",()=>Y(i,t.value)))})}let a;new MutationObserver(()=>{clearTimeout(a),a=setTimeout(e,200)}).observe(document.body,{childList:!0,subtree:!0}),e()}function U(e,a=null){try{const o=localStorage.getItem(e);return o!==null?JSON.parse(o):a}catch{return a}}function Q(e,a){localStorage.setItem(e,JSON.stringify(a))}function He(e,a){if(!a||a.replace(/\D/g,"").length<6)return;let o=U(e,[]);o=o.filter(n=>n!==a),o.unshift(a),Q(e,o.slice(0,10))}function pe(e,a){const o=document.getElementById(a);o&&(o.innerHTML=U(e,[]).map(n=>`<option value="${n}">`).join(""))}function Se(e){return e.toLocaleString("en-US")}function Ee(e){return Number(String(e).replace(/[^\d]/g,""))||0}function bt(e){return e.charAt(0).toUpperCase()+e.slice(1)}const Z=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function yt(e){let a=Math.floor(e/100),o=Math.floor(e%100/10),n=e%10,t="";return a>0&&(t+=Z[a]+" trăm ",o===0&&n>0&&(t+="lẻ ")),o>1?(t+=Z[o]+" mươi ",n===1?t+="mốt":n===5?t+="lăm":n>0&&(t+=Z[n])):o===1?(t+="mười ",n===5?t+="lăm":n>0&&(t+=Z[n])):n>0&&(a>0&&(t+="lẻ "),t+=Z[n]),t.trim()}function vt(e){if(e===0)return"không";const a=["","nghìn","triệu","tỷ"];let o="",n=0;for(;e>0;){const t=e%1e3;t>0&&(o=yt(t)+" "+a[n]+" "+o),e=Math.floor(e/1e3),n++}return o.trim()}function Me(e,a,o){let n=0,t=0,i=0;e==="before"?(n=Ee(a),t=Math.round(n*o),i=n+t):e==="tax"?(t=Ee(a),n=Math.round(t/o),i=n+t):e==="after"&&(i=Ee(a),n=Math.round(i/(1+o)),t=i-n);const l=bt(vt(i))+" đồng";return{beforeNum:n,taxNum:t,afterNum:i,beforeStr:Se(n),taxStr:Se(t),afterStr:Se(i),textStr:l}}function xt(e,a){a.before&&a.before.forEach(o=>F(o,e.beforeStr)),a.tax&&a.tax.forEach(o=>F(o,e.taxStr)),a.after&&a.after.forEach(o=>F(o,e.afterStr)),a.text&&a.text.forEach(o=>F(o,e.textStr))}function ue(e,a=null){try{const o=localStorage.getItem(e);return o!==null?JSON.parse(o):a}catch{return a}}function O(e,a){localStorage.setItem(e,JSON.stringify(a))}function wt(e,a,o,n){let t=ue(J)??"custom",i=ue(j)??{...K},l=ue(q)??{},s=ue(z)??{};const r=document.createElement("div");r.className="cw-tab-header";const p={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};p.custom.innerText="📋 Custom",p.custom.className="cw-tab cw-tab-custom",p.default.innerText="📌 Default",p.default.className="cw-tab cw-tab-default",p.sync.innerText="🔗 Sync",p.sync.className="cw-tab cw-tab-sync";function f(){Object.values(p).forEach(b=>b.classList.remove("active")),p[t].classList.add("active")}f();const d=document.createElement("div");d.style.display=n.data?"none":"block";const y=a("📋 Cấu hình Data","data",b=>{d.style.display=b?"none":"block",o(e)}),m=document.createElement("div");m.className="cw-data-body";function x(){m.innerHTML="";let b=t==="sync"?s:t==="custom"?l:i,I=t==="sync"?z:t==="custom"?q:j;const k=Object.keys(b);k.length===0&&t!=="default"&&(m.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),k.forEach(N=>{const W=document.createElement("div");W.className="cw-data-row";let fe=t!=="default";const R=b[N],ge=R&&typeof R=="object"&&R.hasOwnProperty("value"),ze=ge?R.value:R,Ne=ge&&R.label||N,A=document.createElement("input");A.type="text",A.value=Ne,A.className="cw-data-key"+(fe?" mutable":""),A.title=N,A.readOnly=!fe,fe&&(A.onchange=()=>{const L=A.value.trim();if(!L||L===N){A.value=Ne;return}ge?b[L]={...R,label:L}:b[L]=ze,delete b[N],O(I,b),x()});const P=document.createElement("input");if(P.type="text",P.value=ze??"",P.className="cw-data-val",P.oninput=()=>{ge?b[N]={...R,value:P.value}:b[N]=P.value,O(I,b)},W.appendChild(A),W.appendChild(P),fe){const L=document.createElement("button");L.innerHTML="✕",L.className="cw-del-btn",L.onclick=()=>{confirm(`Delete "${Ne}"?`)&&(delete b[N],O(I,b),x())},W.appendChild(L)}else W.appendChild(document.createElement("div")).className="cw-pad";m.appendChild(W)})}p.custom.onclick=()=>{t="custom",O(J,"custom"),f(),x()},p.default.onclick=()=>{t="default",O(J,"default"),f(),x()},p.sync.onclick=()=>{t="sync",O(J,"sync"),f(),x()};const v=document.createElement("button");v.innerText="📤",v.className="cw-icon-btn",v.onclick=()=>{const b=new Blob([JSON.stringify({defaultData:i,customData:l,syncData:s},null,2)],{type:"application/json"}),I=URL.createObjectURL(b),k=document.createElement("a");k.href=I,k.download=`vnpt_data_${Date.now()}.json`,k.click(),URL.revokeObjectURL(I)},d.appendChild(r),r.appendChild(p.custom),r.appendChild(p.default),r.appendChild(p.sync),d.appendChild(m),e.appendChild(y),e.appendChild(d);const u=e.querySelector("#vnpt-cw-fill"),h=e.querySelector("#vnpt-cw-sync"),g=e.querySelector("#vnpt-cw-add"),w=e.querySelector("#vnpt-cw-reset");u&&(u.onclick=Le),h&&(h.onclick=ot),g&&(g.onclick=()=>{t==="default"&&(t="custom",O(J,"custom"),f());let b=t==="sync"?s:l,I="new_field_"+Date.now();b[I]="",O(t==="sync"?z:q,b),x(),m.scrollTop=m.scrollHeight}),w&&(w.onclick=()=>{confirm("Reset Default Data?")&&(i={...K},O(j,i),x())}),x();const E=y.querySelector(".cw-right-wrap")||document.createElement("div");E.className="cw-right-wrap",E.prepend(v),y.appendChild(E)}function St(e,a,o){let n=Number(localStorage.getItem(ae))||.08,t=U(ie)??{calc:!1,data:!0},i=U(re)??{};function l(u,h){const g=document.createElement("button");return g.innerText=u,g.className="cw-action-btn "+h,g}function s(u,h,g){const w=document.createElement("div");w.className="wg-sec-header";const E=document.createElement("span");E.innerText=u;const b=document.createElement("button");return b.className="wg-toggle-btn",b.innerText=t[h]?"▾":"▴",w.appendChild(E),w.appendChild(b),b.onclick=()=>{t[h]=!t[h],b.innerText=t[h]?"▾":"▴",Q(ie,t),g(t[h])},w}function r(u){const h=window.innerWidth,g=window.innerHeight,w=u.getBoundingClientRect();u.style.left=Math.min(Math.max(parseFloat(u.style.left),0),h-w.width)+"px",u.style.top=Math.min(Math.max(parseFloat(u.style.top),0),g-36)+"px"}const p=document.createElement("div");if(!a){p.className="cw-title-bar",p.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const u=document.createElement("div");u.className="cw-btn-group";const h={fill:l("Fill","cw-btn-fill"),sync:l("Sync","cw-btn-sync"),add:l("Add","cw-btn-add"),reset:l("↺","cw-btn-reset")};h.reset.title="Reset Default fields",Object.values(h).forEach(g=>u.appendChild(g)),p.appendChild(u),e.appendChild(p)}const f=document.createElement("div");f.className="cw-body-inline",f.innerHTML=`
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
    </div>`,a?a.appendChild(f):e.appendChild(f),a||wt(e,s,r,t);const d={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text"),mapBtn:document.getElementById("wg-calc-map-btn"),mapWrap:document.getElementById("wg-calc-map-wrap")};d.taxRate.value=n*100,pe(be,"wg-before-list"),pe(ye,"wg-after-list");function y(u,h){const g=Me(u,h,n);d.before.value=g.beforeStr,d.tax.value=g.taxStr,d.after.value=g.afterStr,d.text.value=g.textStr,xt(g,i)}d.taxRate.oninput=()=>{n=Number(d.taxRate.value)/100||0,Q(ae,n),y("before",d.before.value)},d.before.oninput=()=>{const u=Me("before",d.before.value,n);d.tax.value=u.taxStr,d.after.value=u.afterStr,d.text.value=u.textStr},d.before.onchange=()=>{y("before",d.before.value),He(be,d.before.value),pe(be,"wg-before-list")},d.tax.oninput=()=>y("tax",d.tax.value),d.after.oninput=()=>y("after",d.after.value),d.after.onchange=()=>{y("after",d.after.value),He(ye,d.after.value),pe(ye,"wg-after-list")},[d.before,d.tax,d.after,d.text].forEach(u=>{["click","focus"].forEach(h=>u.addEventListener(h,()=>{if(!u.value)return;navigator.clipboard.writeText(u.value);const g=u.style.backgroundColor;u.style.backgroundColor="#d1e7dd",setTimeout(()=>u.style.backgroundColor=g,300)}))}),d.mapBtn.onclick=()=>{const u=d.mapWrap.style.display==="flex";if(d.mapWrap.style.display=u?"none":"flex",!u){const h=g=>{!d.mapWrap.contains(g.target)&&g.target!==d.mapBtn&&(d.mapWrap.style.display="none",document.removeEventListener("click",h))};setTimeout(()=>document.addEventListener("click",h),0)}},e.querySelectorAll("input[data-clink]").forEach(u=>{const h=u.dataset.clink;u.value=(i[h]||[]).join(", "),u.oninput=()=>{i[h]=u.value.split(",").map(g=>g.trim()).filter(g=>g),Q(re,i)}});const m=document.getElementById("vnpt-btn-import"),x=document.getElementById("vnpt-btn-export-json"),v=document.getElementById("vnpt-btn-reset-default");if(m&&(m.onclick=u=>{st(),d.mapWrap.style.display="none"}),x&&(x.onclick=u=>{ct(),d.mapWrap.style.display="none"}),v&&(v.onclick,v.addEventListener("click",()=>{d.mapWrap.style.display="none"})),!a){const u=Array.from(e.children).filter(w=>w!==p),h=Oe(e,[p],o,null,w=>{u.forEach(E=>E.style.display=w?"none":""),p.style.borderRadius=w?"8px":"0",w&&(e.style.top=window.innerHeight-(p.offsetHeight||34)+"px")}),g=U(o);return g&&g.docked&&h.setDocked(!0),window.addEventListener("resize",()=>{h.isDocked()?e.style.top=window.innerHeight-p.offsetHeight+"px":r(e)}),h}return null}function Et(){const e=document.getElementById("vnpt-inline-calc"),a=document.getElementById("vnpt-btn-calc-toggle");let o=c.calcWidget||document.createElement("div");if(!e&&!c.calcWidget?(o.id="vnpt-calc-widget",document.body.appendChild(o),c.calcWidget=o):e&&(o=c.widget),e&&a){let n=U(ie)??{calc:!1,data:!0};const t=i=>{e.style.display=i?"none":"block",a.classList.toggle("active",!i)};t(n.calc),a.onclick=()=>{n.calc=!n.calc,Q(ie,n),t(n.calc)}}return St(o,e,Pe)}function Re(){if(!window.__vnptInited){window.__vnptInited=!0,ee.info("Initializing VNPT Userscript...");try{Fe(),dt(),Et(),pt(),lt(),we(),ut(),ft(),ht(),rt();const e=Ie(()=>{Qe(),ee.debug("DOM Cache cleared due to mutations")},500);new MutationObserver(o=>{o.some(n=>n.addedNodes.length>0||n.removedNodes.length>0)&&e()}).observe(document.body,{childList:!0,subtree:!0}),ee.info("Userscript initialized successfully.")}catch(e){ee.error("Error during userscript initialization:",e)}}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Re):Re()})();
