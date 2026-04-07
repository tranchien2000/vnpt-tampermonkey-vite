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
(function(){"use strict";const j={info:(...e)=>console.log("[Tampermonkey Script] INFO:",...e),error:(...e)=>console.error("[Tampermonkey Script] ERROR:",...e),warn:(...e)=>console.warn("[Tampermonkey Script] WARN:",...e)};function Pe(){const e="vnpt-styles";if(document.getElementById(e))return;const n=document.createElement("style");n.id=e,n.textContent=`
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

    `,document.head.appendChild(n)}const Ke={widget:null,panel:null,header:null,bannerArea:null,toggleBtn:null,fieldsContainer:null,panelBody:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1,templateBuffer:null,templateName:null,hasDragged:!1},J=new Map,c=new Proxy(Ke,{get(e,n){return n==="on"?(o,a)=>{J.has(o)||J.set(o,[]),J.get(o).push(a)}:e[n]},set(e,n,o){const a=e[n];return e[n]=o,a!==o&&J.has(n)&&J.get(n).forEach(t=>t(o,a)),!0}}),T={tenDaiDienn:"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT",emailDaiDien:"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Số GPKD | MST",goiDV:"Gói Dịch Vụ",ngayKy:"Ngày ký",thangKy:"Tháng Ký",namKy:"Năm ký",soHopDong:"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký"},ne="vnpt_docx_fields",he="vnpt_docx_default_fields",oe="vnpt_docx_position",ae="vnpt_docx_size",be="vnpt_docx_opened",q="vnpt_autofill_data_default",V="vnpt_autofill_data_custom",z="vnpt_autofill_data_sync",je="vnpt_widget_pos",ie="vnd_tax_rate",ye="vnd_before_history",ve="vnd_after_history",re="vnpt_widget_collapsed",le="vnd_calc_map",G="vnpt_widget_datatab",ce="vnpt_templates";let _=null;function E(e,n="#198754",o=2500){_||(_=document.createElement("div"),_.id="vnpt-toast-container",Object.assign(_.style,{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column-reverse",alignItems:"center",gap:"8px",zIndex:"1000000",pointerEvents:"none"}),document.body.appendChild(_));const a=document.createElement("div");a.innerText=e,Object.assign(a.style,{background:n,color:"#fff",padding:"8px 18px",borderRadius:"24px",opacity:"0",transform:"translateY(10px)",transition:"opacity 0.3s, transform 0.3s",fontSize:"13px",fontWeight:"500",fontFamily:"'Segoe UI', Roboto, sans-serif",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",whiteSpace:"nowrap",pointerEvents:"auto"}),_.appendChild(a),requestAnimationFrame(()=>{a.style.opacity="1",a.style.transform="translateY(0)"}),setTimeout(()=>{a.style.opacity="0",a.style.transform="translateY(-10px)",setTimeout(()=>{a.remove(),_&&_.childNodes.length},300)},o)}const qe={local:{download(e,n="arraybuffer"){return new Promise((o,a)=>{const t=new FileReader;switch(t.onload=i=>{let l=i.target.result;n==="base64"&&typeof l=="string"&&(l=l.split(",")[1]||l),o(l)},t.onerror=i=>a(i),n.toLowerCase()){case"arraybuffer":t.readAsArrayBuffer(e);break;case"base64":case"dataurl":t.readAsDataURL(e);break;case"text":t.readAsText(e);break;default:a(new Error(`Unsupported read type: ${n}`))}})},async upload(e){return this.download(e,"base64")}}},Ve={getAdapter(e){const n=qe[e];if(!n)throw new Error(`Storage adapter not found: ${e}`);return n},async upload(e,n,o={}){return await this.getAdapter(e).upload(n,o)},async download(e,n,o={}){return await this.getAdapter(e).download(n,o.type||"arraybuffer")}},Ue="vnpt_templates_db",H="buffers";let se=null;function xe(){return se?Promise.resolve(se):new Promise((e,n)=>{const o=indexedDB.open(Ue,1);o.onupgradeneeded=a=>{const t=a.target.result;t.objectStoreNames.contains(H)||t.createObjectStore(H)},o.onsuccess=a=>{se=a.target.result,e(se)},o.onerror=()=>n(o.error)})}async function We(e,n){const o=await xe();return new Promise((a,t)=>{const s=o.transaction(H,"readwrite").objectStore(H).put(n,e);s.onsuccess=()=>a(),s.onerror=()=>t(s.error)})}async function $e(e){const n=await xe();return new Promise((o,a)=>{const l=n.transaction(H,"readonly").objectStore(H).get(e);l.onsuccess=()=>o(l.result),l.onerror=()=>a(l.error)})}async function Je(e){const n=await xe();return new Promise((o,a)=>{const l=n.transaction(H,"readwrite").objectStore(H).delete(e);l.onsuccess=()=>o(),l.onerror=()=>a(l.error)})}function X(){try{const e=JSON.parse(localStorage.getItem(ce))||[],n=e.filter(o=>o.type!=="local");return n.length!==e.length&&Y(n),n}catch{return[]}}function Y(e){localStorage.setItem(ce,JSON.stringify(e))}function Ge(e){const n=e.match(/drive\.google\.com\/file\/d\/([^/]+)/);return n?`https://drive.google.com/uc?export=download&id=${n[1]}`:e}function Xe(e){return new Promise((n,o)=>{GM_xmlhttpRequest({method:"GET",url:Ge(e),responseType:"arraybuffer",onload:a=>{if(a.status>=200&&a.status<300){if(a.response&&a.response.byteLength>4){const t=new Uint8Array(a.response.slice(0,4));if(t[0]===80&&t[1]===75&&t[2]===3&&t[3]===4){n(a.response);return}else{o(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}n(a.response)}else o(new Error(`HTTP ${a.status}: Không lấy được file`))},onerror:()=>o(new Error("Không thể tải URL.")),ontimeout:()=>o(new Error("Timeout khi tải URL."))})})}async function Ye(e,n,o){const a=e.name.replace(/\.docx$/i,""),t=prompt("Đặt tên biến nhớ cho file này:",a);if(!(!t||!t.trim()))try{const i=await e.arrayBuffer();await We(t.trim(),i);const s=X().filter(r=>r.name!==t.trim()&&r.fileName!==e.name);s.unshift({name:t.trim(),type:"local_idb",fileName:e.name,lastUsed:Date.now()}),Y(s),M(n,o),o&&o(i,t.trim())}catch(i){E(`❌ Lỗi lưu file: ${i.message}`,"#dc3545")}}function M(e,n,o=null){let a=e.querySelector(".vnpt-template-manager-inner"),t,i;if(a)t=a.querySelector(".vnpt-local-list-container"),i=a.querySelector(".vnpt-btn-wrap");else{e.innerHTML="",a=document.createElement("div"),a.className="vnpt-template-manager-inner";const r=document.createElement("div");r.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const p=document.createElement("span");p.className="vnpt-title-main",p.style.cssText="font-size:11px;font-weight:700;color:#444;",i=document.createElement("div"),i.className="vnpt-btn-wrap",i.style.cssText="display:flex;gap:4px;",r.appendChild(p),r.appendChild(i),a.appendChild(r),t=document.createElement("div"),t.className="vnpt-local-list-container",t.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",a.appendChild(t),e.appendChild(a)}const l=X(),s=a.querySelector(".vnpt-title-main");s.innerHTML="Templates"+(o?` <span style="color:#2e7d32;">(Đang dùng: ${o})</span>`:""),l.length===0?t.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':t.innerHTML="",l.forEach((r,p)=>{const f=document.createElement("div");f.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",f.title=r.fileName||r.url||r.name,f.tabIndex=0,f.onfocus=()=>f.style.boxShadow="0 0 0 2px #28a745",f.onblur=()=>f.style.boxShadow="none";const d=r.type==="local"||r.type==="local_base64"||r.type==="local_idb"?"OFF":"ON",y=d==="OFF"?"#6c757d":"#28a745",m=document.createElement("span");m.textContent=d,m.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${y};color:#fff;`;const x=document.createElement("span");x.textContent=r.name,x.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",f.onclick=()=>{f.focus(),Qe(r,n,o,e)},f.appendChild(m),f.appendChild(x);const v=document.createElement("button");v.innerHTML="✎",v.title="Đổi tên template",v.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",v.onclick=h=>{h.stopPropagation();const g=prompt("Đổi tên template:",r.name);if(g&&g.trim()&&g.trim()!==r.name){const w=X();w[p].name=g.trim(),Y(w),M(e,n,o)}},f.appendChild(v);const u=document.createElement("button");u.innerHTML="✕",u.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",u.onclick=async h=>{if(h.stopPropagation(),confirm(`Xoá biểu mẫu "${r.name}"?`)){const g=X();g.splice(p,1),Y(g),r.type==="local_idb"&&await Je(r.name).catch(()=>null),M(e,n,o===r.name?null:o)}},f.appendChild(u),t.appendChild(f)})}function Qe(e,n,o,a){const t=X(),i=t.find(l=>l.name===e.name&&(l.url===e.url||l.type===e.type));if(i&&(i.lastUsed=Date.now(),Y(t)),e.type==="local_idb"){$e(e.name).then(l=>{if(!l)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");n&&n(l,e.name),M(a,n,e.name)}).catch(l=>{E(`❌ Lỗi nạp File IDB: ${l.message}`,"#dc3545")});return}if(e.type==="local_base64"&&e.data){try{const l=window.atob(e.data.split(",")[1]),s=l.length,r=new Uint8Array(s);for(let p=0;p<s;p++)r[p]=l.charCodeAt(p);n&&n(r.buffer,e.name),M(a,n,e.name)}catch(l){E(`❌ Lỗi nạp Base64: ${l.message}`,"#dc3545")}return}Xe(e.url).then(l=>{n&&n(l,e.name),M(a,n,e.name)}).catch(l=>{E(`❌ ${l.message}`,"#dc3545")})}const U=new Map;function Ze(){U.clear()}function et(e){e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function Q(e,n){var t;const o=e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,a=(t=Object.getOwnPropertyDescriptor(o,"value"))==null?void 0:t.set;a?a.call(e,n):e.value=n,et(e)}function de(e){if(!e)return null;const n=U.get(e);if(n&&document.contains(n))return n;const o=document.getElementById(e);if(o&&(o.tagName==="INPUT"||o.tagName==="TEXTAREA"))return U.set(e,o),o;for(const a of document.querySelectorAll("label"))if(a.textContent.trim()===e){let t=null;if(a.htmlFor&&(t=document.getElementById(a.htmlFor)),!t){let i=a.parentElement;for(;i;){const l=i.querySelector("input,textarea");if(l){t=l;break}if(i=i.parentElement,(i==null?void 0:i.tagName)==="FORM")break}}if(t)return U.set(e,t),t}return null}function pe(e){if(!e)return null;const n=U.get(`lbl:${e}`);if(n&&document.contains(n))return n;for(const o of document.querySelectorAll("label"))if(o.innerText.trim()===e){const a=o.parentElement.querySelector("input, textarea");if(a)return U.set(`lbl:${e}`,a),a}return null}function F(e,n){const o=de(e)||pe(e);o&&Q(o,n)}function tt(e=new Date){return String(e.getDate()).padStart(2,"0")}function nt(e=new Date){return String(e.getMonth()+1).padStart(2,"0")}function ot(e=new Date){return String(e.getFullYear())}function Te(){const e=new Date;return{ngay:tt(e),thang:nt(e),nam:ot(e)}}const{ngay:Be,thang:Ie,nam:Le}=Te(),P={ngayKy:{label:"Ngày ký",value:Be},"thangKy, thangKy1":{label:"Tháng ký",value:Ie},"namKy, namKy1":{label:"Năm ký",value:Le},"ngayTiepNhan, ngayThangNamKy":{label:"Ngày ký (full)",value:`${Be}/${Ie}/${Le}`},tenDoanhNghiepB:{label:"Tên doanh nghiệp B",value:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM"},diaChiB:{label:"Địa chỉ B",value:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội"},maSoThueB:{label:"Mã số thuế B",value:"0100686223"},stkB:{label:"Số tài khoản B",value:"1600114156"},diaChiStkB:{label:"Ngân hàng/Địa chỉ STK B",value:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)"},"tenB, nguoiDaiDienB":{label:"Người đại diện B",value:"Phạm Khánh Chung"},"chucVuB, chucVuDaiDienB":{label:"Chức vụ B",value:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp"},"giayUyQuyenSoB, soGiayUyQuyenB":{label:"Giấy ủy quyền số B",value:"2628/GUQ-VNPT-HNI-VP"},"giayUyQuyenNgayB, ngayGiayUyQuyenB":{label:"Giấy ủy quyền ngày B",value:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},GiayUyQuyenB:{label:"Giấy ủy quyền B (full)",value:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},tenDoanhNghiepB1:{label:"Tên doanh nghiệp B (phụ)",value:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam"},donViTiepNhan:{label:"Đơn vị tiếp nhận",value:"TTKD KHDN"},"tenTiepNhan, tenNguoiNhan":{label:"Người tiếp nhận",value:"Bùi Anh"},dienThoaiB:{label:"Điện thoại B",value:"02436686868"},diaChiTaiKhoanB:{label:"Địa chỉ tài khoản B",value:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 "},noiKy:{label:"Nơi ký",value:"Hà Nội"},emailB:{label:"Email B",value:""},"lienheHopDongB, lienheTuVanB, lienheHoaDonB, sucoCap1B, sucoCap2B, sucoCap3B, sucoCap4B":{label:"Liên hệ B (AM)",value:"AM Bùi Anh"}},D={get(e,n=null){try{const o=localStorage.getItem(e);return o===null?n:JSON.parse(o)}catch(o){return console.warn(`[Storage] Không thể đọc key "${e}":`,o),n}},set(e,n){try{return localStorage.setItem(e,JSON.stringify(n)),!0}catch(o){return console.error(`[Storage] Không thể ghi key "${e}":`,o),!1}},remove(e){try{localStorage.removeItem(e)}catch(n){console.error(`[Storage] Không thể xóa key "${e}":`,n)}}};function De(e,n){let o;return function(...t){const i=()=>{clearTimeout(o),e(...t)};clearTimeout(o),o=setTimeout(i,n)}}function Oe(){const e=D.get(q)??{...P},n=D.get(V)??{},o={...e,...n};Object.keys(o).forEach(a=>{const t=o[a],i=t&&typeof t=="object"&&t.hasOwnProperty("value")?t.value:t;a.split(",").map(s=>s.trim()).filter(s=>s).forEach(s=>{let r=de(s)||pe(s);r&&Q(r,i)})}),E("✅ Auto fill complete")}function at(){let e=D.get(z)??{};const n=Object.keys(e);if(n.length===0){E("⚠️ No sync mapping","#ffc107");return}n.forEach(o=>{let a=de(o)||pe(o);a&&a.value!==void 0&&a.value!==""&&e[o].split(",").map(i=>i.trim()).filter(i=>i).forEach(i=>F(i,a.value))}),E("✅ Sync form complete","#d39e00")}let we=!1;const it=(e,n)=>{var s;if(we)return;let o=D.get(z)??{};if(Object.keys(o).length===0)return;let a=e.id,t=e.name,i=null;if(a){const r=document.querySelector(`label[for="${a}"]`);r&&(i=r.textContent.trim())}if(!i){const r=e.closest("label");r&&(i=(s=Array.from(r.childNodes).find(p=>p.nodeType===3))==null?void 0:s.textContent.trim())}let l=o[a]||o[t]||o[i];if(l){we=!0;try{l.split(",").map(p=>p.trim()).filter(p=>p).forEach(p=>{if(p!==a&&p!==t&&p!==i){const f=de(p)||pe(p);f&&document.activeElement!==f&&Q(f,n)}})}finally{we=!1}}},rt=De((e,n)=>{it(e,n)},250);function lt(){document.addEventListener("input",e=>{const n=e.target;!n||!["INPUT","TEXTAREA"].includes(n.tagName)||n.closest("#vnpt-docx-widget")||n.closest("#vnpt-inline-calc")||rt(n,n.value)})}function C(e,n,o=null,a=""){const t=c.fieldsContainer.querySelector(".text-hint");t&&t.remove();const i=c.fieldsContainer.querySelectorAll(".f-key");let l=!1;for(let s of i)if(s.value.split(",")[0].trim()===e){const p=s.closest(".vnpt-field-row"),f=p.querySelector(".f-val"),d=p.querySelector(".f-label");n!==""&&f.value!==n&&document.activeElement!==f&&(f.value=n),o!==null&&o!==""&&d.value!==o&&document.activeElement!==d&&(d.value=o),a!==""&&s.value!==e+", "+a&&document.activeElement!==s&&(s.value=e+", "+a),l=!0;break}if(!l){(o===null||o==="")&&(o=T[e]||"");const s=document.createElement("div");s.className="vnpt-field-row row-item",s.setAttribute("draggable","false");let r=e;a&&(r+=", "+a),s.innerHTML=`
            <input type="checkbox" class="row-chk" title="Chọn để thao tác hàng loạt" style="margin: 0 2px 0 2px;" />
            <input type="text" class="f-label" placeholder="Nhãn..." value="${o}" />
            <input type="text" class="f-key" placeholder="Mã biến / IDs đồng bộ" value="${r}" title="Biến DOCX (đầu tiên), theo sau là các ID web cách dấu phẩy" />
            <span class="row-drag-handle" title="Kéo thả để di chuyển">=</span>
            <input type="text" class="f-val" placeholder="Giá trị" value="${n}" />
        `;const p=s.querySelector(".f-val"),f=s.querySelector(".f-key");e==="tenToChuc"&&(p.style.textAlign="right");const d=()=>{const m=p.value;f.value.split(",").map(v=>v.trim()).filter(v=>v).forEach(v=>F(v,m))};f.addEventListener("input",function(){B();const m=this.value.split(",")[0].trim();p.style.textAlign=m==="tenToChuc"?"right":"",d()}),s.querySelector(".f-label").addEventListener("input",B),p.addEventListener("input",function(){B(),d()});const y=s.querySelector(".row-drag-handle");y.addEventListener("mouseenter",()=>s.setAttribute("draggable","true")),y.addEventListener("mouseleave",()=>{s.classList.contains("dragging")||s.setAttribute("draggable","false")}),s.addEventListener("dragstart",function(m){c.draggedRowForVNPT=this,m.dataTransfer.effectAllowed="move",m.dataTransfer.setData("text/plain",e),this.classList.add("dragging")}),s.addEventListener("dragover",m=>(m.preventDefault(),!1)),s.addEventListener("dragenter",function(){this.classList.add("over")}),s.addEventListener("dragleave",function(){this.classList.remove("over")}),s.addEventListener("drop",function(m){if(m.stopPropagation(),c.draggedRowForVNPT&&c.draggedRowForVNPT!==this){const x=Array.from(c.fieldsContainer.querySelectorAll(".vnpt-field-row")),v=x.indexOf(c.draggedRowForVNPT),u=x.indexOf(this);v<u?this.parentNode.insertBefore(c.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(c.draggedRowForVNPT,this),B()}return!1}),s.addEventListener("dragend",function(){this.setAttribute("draggable","false"),c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(m=>{m.classList.remove("over","dragging")}),c.draggedRowForVNPT=null}),c.fieldsContainer.appendChild(s),c.fieldsContainer.scrollTop=c.fieldsContainer.scrollHeight}}function B(){const e=c.isDefaultMode?he:ne,n={};c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(a=>{const i=a.querySelector(".f-key").value.trim().split(",").map(f=>f.trim()).filter(f=>f),l=i[0],s=i.slice(1).join(", "),r=a.querySelector(".f-label").value.trim(),p=a.querySelector(".f-val").value;l&&(n[l]={label:r,value:p,sync:s})}),D.set(e,n)}function Ee(){try{c.fieldsContainer.innerHTML="";const n=D.get(ne)||{};Object.keys(T).forEach(o=>{const a=T[o],t=n[o];t&&typeof t=="object"?C(o,t.value,t.label||a,t.sync||""):t?C(o,t,a,""):C(o,"",a,"")}),Object.keys(n).forEach(o=>{if(!(o in T)){const a=n[o];typeof a=="object"?C(o,a.value,a.label,a.sync||""):C(o,a,"","")}}),Object.keys(T).length===0&&Object.keys(n).length===0&&(c.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(n){console.error("Error loading config:",n),Object.keys(T).forEach(o=>C(o,"",T[o]))}const e=D.get(oe);e&&c.widget&&(c.widget.style.bottom="auto",e.right?(c.widget.style.right=e.right,c.widget.style.left="auto"):e.left&&(c.widget.style.left=e.left,c.widget.style.right="auto"),e.top&&(c.widget.style.top=e.top))}function ct(){document.getElementById("vnpt-btn-toggle-id").onclick=()=>c.fieldsContainer.classList.toggle("show-ids"),document.getElementById("vnpt-btn-default").onclick=()=>{c.isDefaultMode=!c.isDefaultMode},c.on("isDefaultMode",e=>Ae(e)),document.getElementById("vnpt-btn-reset-default").onclick=()=>{confirm("Khôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?")&&(D.remove(he),c.isDefaultMode&&(Ae(!0),E("🔄 Đã khôi phục dữ liệu gốc","#1a73e8")))},document.getElementById("vnpt-btn-batch-del").onclick=()=>{const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row");let n=0;e.forEach(o=>{var a;(a=o.querySelector(".row-chk"))!=null&&a.checked&&(o.remove(),n++)}),n===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(e.forEach(o=>o.remove()),E("🗑️ Đã xóa toàn bộ","#ff5252"),B()):(E(`🗑️ Đã xóa ${n} trường`,"#ff5252"),B())},document.getElementById("vnpt-btn-add").onclick=()=>{const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;C("bien_moi_"+e,"","",""),B()},document.getElementById("vnpt-btn-fill-back").onclick=()=>{Oe();let e=0;c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(n=>{const o=n.querySelector(".f-key").value.trim(),a=n.querySelector(".f-val").value;o.split(",").map(t=>t.trim()).filter(Boolean).forEach(t=>{(document.getElementById(t)||document.getElementsByName(t)[0])&&(F(t,a),e++)})}),e>0?E(`✅ Đã điền ngược ${e} trường`,"#198754"):E("⚠️ Không khớp trường nào","#ffc107")}}function Ae(e){const n=document.getElementById("vnpt-btn-default"),o=document.getElementById("vnpt-btn-reset-default");if(c.fieldsContainer.innerHTML="",c.bannerArea.innerHTML="",e){n.classList.add("active"),o&&(o.style.display="flex"),c.fieldsContainer.classList.add("vnpt-mode-default"),E("📌 Chế độ Dữ liệu mặc định (Có thể sửa)","#ea4335");const a=document.createElement("div");a.className="vnpt-default-banner",a.innerHTML="<span> Lưu ý: đây là Dữ liệu mặc định (Có thể sửa/lưu)</span>",c.bannerArea.appendChild(a);const t=D.get(he);t===null?Object.keys(P).forEach(i=>{const l=P[i],s=l&&typeof l=="object"?l.value:l,r=l&&typeof l=="object"?l.label:T[i]||"";C(i,s,r)}):Object.keys(t).forEach(i=>{const l=t[i];C(i,l.value,l.label,l.sync||"")})}else n.classList.remove("active"),o&&(o.style.display="none"),c.fieldsContainer.classList.remove("vnpt-mode-default"),E("📋 Đã quay lại Dữ liệu cá nhân"),Ee()}function st(){const e={version:"1.0",timestamp:Date.now(),fields:JSON.parse(localStorage.getItem(ne))||{},templates:JSON.parse(localStorage.getItem(ce))||[],position:JSON.parse(localStorage.getItem(oe))||null,size:JSON.parse(localStorage.getItem(ae))||null,calc:{default:JSON.parse(localStorage.getItem(q))||null,custom:JSON.parse(localStorage.getItem(V))||null,sync:JSON.parse(localStorage.getItem(z))||null,map:JSON.parse(localStorage.getItem(le))||{},taxRate:Number(localStorage.getItem(ie))||.08}},n=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),o=URL.createObjectURL(n),a=document.createElement("a");a.href=o,a.download=`vnpt_config_${new Date().toISOString().slice(0,10)}.json`,a.click(),URL.revokeObjectURL(o),E("📤 Đã xuất cấu hình JSON")}function dt(){const e=document.createElement("input");e.type="file",e.accept=".json",e.onchange=async n=>{const o=n.target.files[0];if(o)try{const a=await o.text(),t=JSON.parse(a);if(!t.fields&&!t.calc)throw new Error("Định dạng file không hợp lệ!");t.fields&&localStorage.setItem(ne,JSON.stringify(t.fields)),t.templates&&localStorage.setItem(ce,JSON.stringify(t.templates)),t.position&&localStorage.setItem(oe,JSON.stringify(t.position)),t.size&&localStorage.setItem(ae,JSON.stringify(t.size)),t.calc&&(t.calc.default&&localStorage.setItem(q,JSON.stringify(t.calc.default)),t.calc.custom&&localStorage.setItem(V,JSON.stringify(t.calc.custom)),t.calc.sync&&localStorage.setItem(z,JSON.stringify(t.calc.sync)),t.calc.map&&localStorage.setItem(le,JSON.stringify(t.calc.map)),t.calc.taxRate!==void 0&&localStorage.setItem(ie,t.calc.taxRate)),await Ee();const i=document.getElementById("vnpt-calc-widget");if(i){const s=document.getElementById("wg-taxRate");s&&t.calc&&t.calc.taxRate!==void 0&&(s.value=t.calc.taxRate*100),t.calc&&t.calc.map&&i.querySelectorAll("input[data-clink]").forEach(r=>{const p=r.dataset.clink;t.calc.map[p]&&(r.value=(t.calc.map[p]||[]).join(", "))})}const l=document.getElementById("vnpt-template-manager");l&&M(l,(s,r)=>{c.templateBuffer=s,c.templateName=r}),t.position&&c.widget&&(t.position.right?(c.widget.style.right=t.position.right,c.widget.style.left="auto"):t.position.left&&(c.widget.style.left=t.position.left,c.widget.style.right="auto"),t.position.top&&(c.widget.style.top=t.position.top),c.widget.style.bottom="auto"),t.size&&c.panel&&(c.panel.style.width=t.size.width+"px",c.panel.style.height=t.size.height+"px"),E("✅ Nhập cấu hình thành công!")}catch(a){console.error("Lỗi Import:",a),alert("Lỗi: "+a.message)}},e.click()}function pt(){const e=document.createElement("div");e.id="vnpt-docx-widget";const n=localStorage.getItem(be)==="true";e.innerHTML=`
        <button id="vnpt-toggle-btn" title="Mở/Đóng UI Hợp đồng" class="${n?"btn-opened":"btn-closed"}">${n?"✖":"📄"}</button>

        <div id="vnpt-export-panel" style="display: ${n?"flex":"none"};">
            <div id="vnpt-panel-header" title="Kẹp chuột vào đây để di chuyển">
                <span id="vnpt-panel-title">VNPT PRO</span>
                <div class="btn-row" style="margin-bottom: 0; padding-right: 35px; gap: 4px; position: relative;">
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-scan" title="Lấy data theo biểu mẫu web">Scan</button>
                    <button class="vnpt-btn-action btn-fill-back" id="vnpt-btn-fill-back" title="Điền dữ liệu ngược lên web">Điền thông tin</button>
                    
                    <button class="vnpt-btn-action btn-default-toggle" id="vnpt-btn-default" title="Dữ liệu mặc định VNPT">Default</button>
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
    `,document.body.appendChild(e),c.widget=e,c.panel=document.getElementById("vnpt-export-panel"),c.toggleBtn=document.getElementById("vnpt-toggle-btn"),c.header=document.getElementById("vnpt-panel-header"),c.bannerArea=document.getElementById("vnpt-banner-area"),c.fieldsContainer=document.getElementById("vnpt-fields-container");try{const a=JSON.parse(localStorage.getItem(ae));a&&a.width&&a.height&&(c.panel.style.width=a.width+"px",c.panel.style.height=a.height+"px")}catch(a){console.error("Lỗi load size panel:",a)}new ResizeObserver(a=>{if(c.panel.style.display!=="none")for(let t of a){const{width:i,height:l}=t.contentRect;i>0&&l>0&&localStorage.setItem(ae,JSON.stringify({width:Math.round(i+20),height:Math.round(l+20)}))}}).observe(c.panel),c.panelBody=document.getElementById("vnpt-panel-body"),M(document.getElementById("vnpt-template-manager"),(a,t)=>{c.templateBuffer=a,c.templateName=t}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const a=this.files&&this.files[0];if(!a)return;const t=document.getElementById("vnpt-template-manager");Ye(a,t,(i,l)=>{c.templateBuffer=i,c.templateName=l}),this.value=""}),c.toggleBtn.addEventListener("click",a=>{c.hasDragged||(c.panel.style.display==="none"?(c.panel.style.display="flex",c.toggleBtn.className="btn-opened",c.toggleBtn.innerHTML="✖",localStorage.setItem(be,"true")):(c.panel.style.display="none",c.toggleBtn.className="btn-closed",c.toggleBtn.innerHTML="📄",localStorage.setItem(be,"false")))})}function _e(e,n,o,a=null,t=null){let i=!1,l=0,s=0,r=!1;function p(d){r!==d&&(r=d,t&&t(d))}function f(d){if(d.button!==0)return;i=!0,c.hasDragged=!1;const y=e.getBoundingClientRect();l=d.clientX-y.left,s=d.clientY-y.top,document.body.style.userSelect="none",n&&n.forEach(m=>m.style.cursor="grabbing"),a&&a(),d.preventDefault()}return n.forEach(d=>{d.addEventListener("mousedown",f)}),document.addEventListener("mousemove",function(d){if(!i)return;c.hasDragged=!0;let y=d.clientX-l,m=d.clientY-s;const x=window.innerWidth,v=window.innerHeight,u=document.getElementById("vnpt-toggle-btn"),h=u?u.offsetWidth:40,g=u?u.offsetHeight:40,w=e.id==="vnpt-docx-widget";let S=e.offsetWidth||0;if(w){let k=h+6-S,N=x-S+6;y<k&&(y=k),y>N&&(y=N)}else S=S||200,y<0&&(y=0),y+S>x&&(y=Math.max(0,x-S));let b=r;if(w?b=!1:r?d.clientY<v-40&&(b=!1):d.clientY>v-10&&(b=!0),m<0&&(m=0),b)p(!0),e.style.top=v-e.offsetHeight+"px",w?(e.style.right=x-y-S+"px",e.style.left="auto"):(e.style.left=y+"px",e.style.right="auto"),e.style.bottom="auto";else{p(!1);let I=e.offsetHeight||40,k;if(w)k=10+g;else{const N=e.querySelector(".cw-title-bar");k=N?N.offsetHeight:I}m+k>v&&(m=Math.max(0,v-k)),e.style.top=m+"px",w?(e.style.right=x-y-S+"px",e.style.left="auto"):(e.style.left=y+"px",e.style.right="auto"),e.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(i&&(i=!1,document.body.style.userSelect="",n&&n.forEach(d=>d.style.cursor="grab"),o)){const d=e.id==="vnpt-docx-widget";localStorage.setItem(o,JSON.stringify({left:d?void 0:e.style.left,right:d?e.style.right:void 0,top:e.style.top,x:d?void 0:parseFloat(e.style.left),y:parseFloat(e.style.top),docked:r}))}}),{isDocked:()=>r,setDocked:p}}function ut(){c.widget&&c.header&&c.toggleBtn&&(_e(c.widget,[c.header,c.toggleBtn],oe),window.addEventListener("resize",()=>{const e=window.innerWidth,n=window.innerHeight,o=document.getElementById("vnpt-toggle-btn"),a=o?o.offsetWidth:40,t=o?o.offsetHeight:40;let i=c.widget.getBoundingClientRect(),l=i.left,s=i.top,r=c.widget.offsetWidth||0,f=a+6-r,d=e-r+6;l<f&&(l=f),l>d&&(l=d),s+10+t>n&&(s=Math.max(0,n-(10+t))),c.widget.style.right=e-l-r+"px",c.widget.style.top=s+"px"}))}function He(e){const n=e.toLowerCase(),{ngay:o,thang:a,nam:t}=Te();return{ngayky:o,thangky:a,thangky1:a,namky:t,namky1:t,soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[n]||""}function ft(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){if(c.isDefaultMode){Object.keys(P).forEach(n=>{C(n,P[n],T[n]||"")}),B(),E("Đã nạp lại dữ liệu mặc định từ hệ thống.");return}let e=0;Object.keys(T).forEach(n=>{var t;const o=document.getElementById(n);let a="";o&&(a=o.tagName.toLowerCase()==="select"?((t=o.options[o.selectedIndex])==null?void 0:t.text)||"":o.value,e++),a||(a=He(n)),C(n,a,null)}),B(),e>0?(this.style.background="#34a853",this.style.color="#fff",this.innerText="Done",setTimeout(()=>{this.style.background="#fbbc04",this.style.color="#000",this.innerText="Quét"},1e3)):E("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(e){e.target.closest("#vnpt-docx-widget")||e.target.closest("#vnpt-inline-calc")||e.target&&e.target.id&&T[e.target.id]!==void 0&&(C(e.target.id,e.target.value,null),B())}),document.addEventListener("change",function(e){var n;if(!(e.target.closest("#vnpt-docx-widget")||e.target.closest("#vnpt-inline-calc"))&&e.target&&e.target.id&&T[e.target.id]!==void 0){let o=e.target.tagName.toLowerCase()==="select"?((n=e.target.options[e.target.selectedIndex])==null?void 0:n.text)||"":e.target.value;C(e.target.id,o,null),B()}})}function Me(e,n,o){try{let a;try{a=new window.PizZip(e)}catch(r){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(r);return}const t=new window.docxtemplater(a,{paragraphLoop:!0,linebreaks:!0});t.render(n);const i=t.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),l=URL.createObjectURL(i),s=document.createElement("a");s.href=l,s.download=o,document.body.appendChild(s),s.click(),setTimeout(()=>{document.body.removeChild(s),URL.revokeObjectURL(l)},100)}catch(a){let t=a.message;a.properties&&a.properties.errors instanceof Array?t=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+a.properties.errors.map(l=>"- "+(l.properties.explanation||l.message)).join(`
`):t="Lỗi phần mềm Word sinh ra: "+t,alert(t),console.error("DocX Error:",a)}}function gt(){const e=document.getElementById("vnpt-export-filename");e&&e.addEventListener("input",()=>{e.dataset.userEdited="1",e.value.trim()||(e.dataset.userEdited="0")});function n(){if(!e||e.dataset.userEdited==="1")return;let o="";if(c.fieldsContainer&&c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(r=>{const f=r.querySelector(".f-key").value.trim().split(",")[0].trim(),d=r.querySelector(".f-val").value.trim();f==="tenToChuc"&&(o=d)}),!o){const s=document.getElementById("tenToChuc");s&&(o=s.tagName.toLowerCase()==="textarea"||s.tagName.toLowerCase()==="input"?s.value.trim():s.innerText.trim())}function a(s){if(!s)return"";let r=s;return r=r.replace(/Tổng công ty/gi,""),r=r.replace(/Công ty/gi,""),r=r.replace(/\bCty\b/gi,""),r=r.replace(/Trách nhiệm hữu hạn/gi,""),r=r.replace(/\bTNHH\b/gi,""),r=r.replace(/Cổ phần/gi,""),r=r.replace(/\bCP\b/gi,""),r=r.replace(/Một thành viên/gi,""),r=r.replace(/\bMTV\b/gi,""),r=r.replace(/Chi nhánh/gi,""),r=r.replace(/Việt Nam/gi,"VN"),r=r.replace(/Viet Nam/gi,"VN"),r=r.replace(/\s+/g," ").trim(),r=r.replace(/^[-,\s]+|[-,\s]+$/g,""),r.length>50&&(r=r.substring(0,47)+"..."),r.replace(/[<>:"/\\|?*]/g,"")}let t=a(o),i=c.templateName?c.templateName.replace(/\.docx$/i,""):"",l=[];i&&l.push(i),t&&l.push(t),l.length>0?e.value=l.join(" - ")+".docx":e.value||(e.value="Export_Auto.docx")}setInterval(n,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const o={};if(c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(l=>{const r=l.querySelector(".f-key").value.trim().split(",")[0].trim(),p=l.querySelector(".f-val").value;r&&(o[r]=p)}),Object.keys(o).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}let t=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(t.toLowerCase().endsWith(".docx")||(t+=".docx"),c.templateBuffer){Me(c.templateBuffer,o,t);return}const i=document.getElementById("vnpt-template-file");if(i.files&&i.files.length>0){Ve.download("local",i.files[0],{type:"arraybuffer"}).then(l=>Me(l,o,t)).catch(l=>alert(`Lỗi đọc file: ${l.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')})}const mt=["chucVu","noiCap","noiCapSoDkdn","ngayky","thangky","namky","thangky1","namky1","noiKy"],ht=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function bt(){function e(){mt.forEach(a=>{const t=document.getElementById(a);t&&!t.dataset.filled&&(t.dataset.filled="1",Q(t,He(a)))}),ht.forEach(a=>{const t=document.getElementById(a.src),i=document.getElementById(a.target);t&&i&&!t.dataset.bound&&(t.dataset.bound="1",t.addEventListener("input",()=>Q(i,t.value)))})}let n;new MutationObserver(()=>{clearTimeout(n),n=setTimeout(e,200)}).observe(document.body,{childList:!0,subtree:!0}),e()}function W(e,n=null){try{const o=localStorage.getItem(e);return o!==null?JSON.parse(o):n}catch{return n}}function Z(e,n){localStorage.setItem(e,JSON.stringify(n))}function Re(e,n){if(!n||n.replace(/\D/g,"").length<6)return;let o=W(e,[]);o=o.filter(a=>a!==n),o.unshift(n),Z(e,o.slice(0,10))}function ue(e,n){const o=document.getElementById(n);o&&(o.innerHTML=W(e,[]).map(a=>`<option value="${a}">`).join(""))}function Se(e){return e.toLocaleString("en-US")}function Ne(e){return Number(String(e).replace(/[^\d]/g,""))||0}function yt(e){return e.charAt(0).toUpperCase()+e.slice(1)}const ee=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function vt(e){let n=Math.floor(e/100),o=Math.floor(e%100/10),a=e%10,t="";return n>0&&(t+=ee[n]+" trăm ",o===0&&a>0&&(t+="lẻ ")),o>1?(t+=ee[o]+" mươi ",a===1?t+="mốt":a===5?t+="lăm":a>0&&(t+=ee[a])):o===1?(t+="mười ",a===5?t+="lăm":a>0&&(t+=ee[a])):a>0&&(n>0&&(t+="lẻ "),t+=ee[a]),t.trim()}function xt(e){if(e===0)return"không";const n=["","nghìn","triệu","tỷ"];let o="",a=0;for(;e>0;){const t=e%1e3;t>0&&(o=vt(t)+" "+n[a]+" "+o),e=Math.floor(e/1e3),a++}return o.trim()}function ze(e,n,o){let a=0,t=0,i=0;e==="before"?(a=Ne(n),t=Math.round(a*o),i=a+t):e==="tax"?(t=Ne(n),a=Math.round(t/o),i=a+t):e==="after"&&(i=Ne(n),a=Math.round(i/(1+o)),t=i-a);const l=yt(xt(i))+" đồng";return{beforeNum:a,taxNum:t,afterNum:i,beforeStr:Se(a),taxStr:Se(t),afterStr:Se(i),textStr:l}}function wt(e,n){n.before&&n.before.forEach(o=>F(o,e.beforeStr)),n.tax&&n.tax.forEach(o=>F(o,e.taxStr)),n.after&&n.after.forEach(o=>F(o,e.afterStr)),n.text&&n.text.forEach(o=>F(o,e.textStr))}function fe(e,n=null){try{const o=localStorage.getItem(e);return o!==null?JSON.parse(o):n}catch{return n}}function O(e,n){localStorage.setItem(e,JSON.stringify(n))}function Et(e,n,o,a){let t=fe(G)??"custom",i=fe(q)??{...P},l=fe(V)??{},s=fe(z)??{};const r=document.createElement("div");r.className="cw-tab-header";const p={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};p.custom.innerText="📋 Custom",p.custom.className="cw-tab cw-tab-custom",p.default.innerText="📌 Default",p.default.className="cw-tab cw-tab-default",p.sync.innerText="🔗 Sync",p.sync.className="cw-tab cw-tab-sync";function f(){Object.values(p).forEach(b=>b.classList.remove("active")),p[t].classList.add("active")}f();const d=document.createElement("div");d.style.display=a.data?"none":"block";const y=n("📋 Cấu hình Data","data",b=>{d.style.display=b?"none":"block",o(e)}),m=document.createElement("div");m.className="cw-data-body";function x(){m.innerHTML="";let b=t==="sync"?s:t==="custom"?l:i,I=t==="sync"?z:t==="custom"?V:q;const k=Object.keys(b);k.length===0&&t!=="default"&&(m.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),k.forEach(N=>{const $=document.createElement("div");$.className="cw-data-row";let ge=t!=="default";const R=b[N],me=R&&typeof R=="object"&&R.hasOwnProperty("value"),Fe=me?R.value:R,Ce=me&&R.label||N,A=document.createElement("input");A.type="text",A.value=Ce,A.className="cw-data-key"+(ge?" mutable":""),A.title=N,A.readOnly=!ge,ge&&(A.onchange=()=>{const L=A.value.trim();if(!L||L===N){A.value=Ce;return}me?b[L]={...R,label:L}:b[L]=Fe,delete b[N],O(I,b),x()});const K=document.createElement("input");if(K.type="text",K.value=Fe??"",K.className="cw-data-val",K.oninput=()=>{me?b[N]={...R,value:K.value}:b[N]=K.value,O(I,b)},$.appendChild(A),$.appendChild(K),ge){const L=document.createElement("button");L.innerHTML="✕",L.className="cw-del-btn",L.onclick=()=>{confirm(`Delete "${Ce}"?`)&&(delete b[N],O(I,b),x())},$.appendChild(L)}else $.appendChild(document.createElement("div")).className="cw-pad";m.appendChild($)})}p.custom.onclick=()=>{t="custom",O(G,"custom"),f(),x()},p.default.onclick=()=>{t="default",O(G,"default"),f(),x()},p.sync.onclick=()=>{t="sync",O(G,"sync"),f(),x()};const v=document.createElement("button");v.innerText="📤",v.className="cw-icon-btn",v.onclick=()=>{const b=new Blob([JSON.stringify({defaultData:i,customData:l,syncData:s},null,2)],{type:"application/json"}),I=URL.createObjectURL(b),k=document.createElement("a");k.href=I,k.download=`vnpt_data_${Date.now()}.json`,k.click(),URL.revokeObjectURL(I)},d.appendChild(r),r.appendChild(p.custom),r.appendChild(p.default),r.appendChild(p.sync),d.appendChild(m),e.appendChild(y),e.appendChild(d);const u=e.querySelector("#vnpt-cw-fill"),h=e.querySelector("#vnpt-cw-sync"),g=e.querySelector("#vnpt-cw-add"),w=e.querySelector("#vnpt-cw-reset");u&&(u.onclick=Oe),h&&(h.onclick=at),g&&(g.onclick=()=>{t==="default"&&(t="custom",O(G,"custom"),f());let b=t==="sync"?s:l,I="new_field_"+Date.now();b[I]="",O(t==="sync"?z:V,b),x(),m.scrollTop=m.scrollHeight}),w&&(w.onclick=()=>{confirm("Reset Default Data?")&&(i={...P},O(q,i),x())}),x();const S=y.querySelector(".cw-right-wrap")||document.createElement("div");S.className="cw-right-wrap",S.prepend(v),y.appendChild(S)}function St(e,n,o){let a=Number(localStorage.getItem(ie))||.08,t=W(re)??{calc:!1,data:!0},i=W(le)??{};function l(u,h){const g=document.createElement("button");return g.innerText=u,g.className="cw-action-btn "+h,g}function s(u,h,g){const w=document.createElement("div");w.className="wg-sec-header";const S=document.createElement("span");S.innerText=u;const b=document.createElement("button");return b.className="wg-toggle-btn",b.innerText=t[h]?"▾":"▴",w.appendChild(S),w.appendChild(b),b.onclick=()=>{t[h]=!t[h],b.innerText=t[h]?"▾":"▴",Z(re,t),g(t[h])},w}function r(u){const h=window.innerWidth,g=window.innerHeight,w=u.getBoundingClientRect();u.style.left=Math.min(Math.max(parseFloat(u.style.left),0),h-w.width)+"px",u.style.top=Math.min(Math.max(parseFloat(u.style.top),0),g-36)+"px"}const p=document.createElement("div");if(!n){p.className="cw-title-bar",p.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const u=document.createElement("div");u.className="cw-btn-group";const h={fill:l("Fill","cw-btn-fill"),sync:l("Sync","cw-btn-sync"),add:l("Add","cw-btn-add"),reset:l("↺","cw-btn-reset")};h.reset.title="Reset Default fields",Object.values(h).forEach(g=>u.appendChild(g)),p.appendChild(u),e.appendChild(p)}const f=document.createElement("div");f.className="cw-body-inline",f.innerHTML=`
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
    </div>`,n?n.appendChild(f):e.appendChild(f),n||Et(e,s,r,t);const d={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text"),mapBtn:document.getElementById("wg-calc-map-btn"),mapWrap:document.getElementById("wg-calc-map-wrap")};d.taxRate.value=a*100,ue(ye,"wg-before-list"),ue(ve,"wg-after-list");function y(u,h){const g=ze(u,h,a);d.before.value=g.beforeStr,d.tax.value=g.taxStr,d.after.value=g.afterStr,d.text.value=g.textStr,wt(g,i)}d.taxRate.oninput=()=>{a=Number(d.taxRate.value)/100||0,Z(ie,a),y("before",d.before.value)},d.before.oninput=()=>{const u=ze("before",d.before.value,a);d.tax.value=u.taxStr,d.after.value=u.afterStr,d.text.value=u.textStr},d.before.onchange=()=>{y("before",d.before.value),Re(ye,d.before.value),ue(ye,"wg-before-list")},d.tax.oninput=()=>y("tax",d.tax.value),d.after.oninput=()=>y("after",d.after.value),d.after.onchange=()=>{y("after",d.after.value),Re(ve,d.after.value),ue(ve,"wg-after-list")},[d.before,d.tax,d.after,d.text].forEach(u=>{["click","focus"].forEach(h=>u.addEventListener(h,()=>{if(!u.value)return;navigator.clipboard.writeText(u.value);const g=u.style.backgroundColor;u.style.backgroundColor="#d1e7dd",setTimeout(()=>u.style.backgroundColor=g,300)}))}),d.mapBtn.onclick=()=>{const u=d.mapWrap.style.display==="flex";if(d.mapWrap.style.display=u?"none":"flex",!u){const h=g=>{!d.mapWrap.contains(g.target)&&g.target!==d.mapBtn&&(d.mapWrap.style.display="none",document.removeEventListener("click",h))};setTimeout(()=>document.addEventListener("click",h),0)}},e.querySelectorAll("input[data-clink]").forEach(u=>{const h=u.dataset.clink;u.value=(i[h]||[]).join(", "),u.oninput=()=>{i[h]=u.value.split(",").map(g=>g.trim()).filter(g=>g),Z(le,i)}});const m=document.getElementById("vnpt-btn-import"),x=document.getElementById("vnpt-btn-export-json"),v=document.getElementById("vnpt-btn-reset-default");if(m&&(m.onclick=u=>{dt(),d.mapWrap.style.display="none"}),x&&(x.onclick=u=>{st(),d.mapWrap.style.display="none"}),v&&(v.onclick,v.addEventListener("click",()=>{d.mapWrap.style.display="none"})),!n){const u=Array.from(e.children).filter(w=>w!==p),h=_e(e,[p],o,null,w=>{u.forEach(S=>S.style.display=w?"none":""),p.style.borderRadius=w?"8px":"0",w&&(e.style.top=window.innerHeight-(p.offsetHeight||34)+"px")}),g=W(o);return g&&g.docked&&h.setDocked(!0),window.addEventListener("resize",()=>{h.isDocked()?e.style.top=window.innerHeight-p.offsetHeight+"px":r(e)}),h}return null}function Nt(){const e=document.getElementById("vnpt-inline-calc"),n=document.getElementById("vnpt-btn-calc-toggle");let o=c.calcWidget||document.createElement("div");if(!e&&!c.calcWidget?(o.id="vnpt-calc-widget",document.body.appendChild(o),c.calcWidget=o):e&&(o=c.widget),e&&n){let a=W(re)??{calc:!1,data:!0};const t=i=>{e.style.display=i?"none":"block",n.classList.toggle("active",!i)};t(a.calc),n.onclick=()=>{a.calc=!a.calc,Z(re,a),t(a.calc)}}return St(o,e,je)}let te=null;function ke(){if(!window.__vnptInited){window.__vnptInited=!0,j.info("Initializing VNPT Userscript...");try{Pe(),pt(),Nt(),ut(),ct(),Ee(),ft(),gt(),bt(),lt();const e=De(()=>{Ze(),j.debug("DOM Cache cleared due to mutations")},500);te=new MutationObserver(n=>{n.some(o=>o.addedNodes.length>0||o.removedNodes.length>0)&&e()}),te.observe(document.body,{childList:!0,subtree:!0}),j.info("Userscript initialized successfully.")}catch(e){j.error("Error during userscript initialization:",e)}}}function kt(){j.info("Cleaning up VNPT Userscript for reload..."),te&&(te.disconnect(),te=null);const e=document.getElementById("vnpt-docx-widget");e&&e.remove();const n=document.getElementById("vnpt-calc-widget");n&&n.remove();const o=document.getElementById("vnpt-styles");o&&o.remove(),window.__vnptInited=!1,j.info("Cleanup completed.")}window.__vnptCleanup=kt,window.__vnptInit=ke,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",ke):ke()})();
