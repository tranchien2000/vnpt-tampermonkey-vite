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
(function(){"use strict";const q={info:(...t)=>console.log("[Tampermonkey Script] INFO:",...t),error:(...t)=>console.error("[Tampermonkey Script] ERROR:",...t),warn:(...t)=>console.warn("[Tampermonkey Script] WARN:",...t)};function lt(){GM_addStyle(`
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

    `)}const a={widget:null,panel:null,header:null,toggleBtn:null,fieldsContainer:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1},y={tenDaiDienn:"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT",emailDaiDien:"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Số GPKD | MST",goiDV:"Gói Dịch Vụ",ngayKy:"Ngày ký",thangKy:"Tháng Ký",namKy:"Năm ký",soHopDong:"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký"},A="vnpt_docx_fields",O="vnpt_docx_position",H="vnpt_docx_size",U="vnpt_docx_opened",j="vnpt_autofill_data_default",$="vnpt_autofill_data_custom",G="vnpt_autofill_data_sync",M="vnpt_templates";function m(t,o="#198754"){const e=document.createElement("div");e.innerText=t,Object.assign(e.style,{position:"fixed",bottom:"20px",left:"50%",transform:"translateX(-50%)",background:o,color:"#fff",padding:"7px 16px",borderRadius:"20px",zIndex:"100000",opacity:"0",transition:"opacity .25s",fontSize:"13px",fontFamily:"'Segoe UI',sans-serif",boxShadow:"0 4px 14px rgba(0,0,0,.25)"}),document.body.appendChild(e),setTimeout(()=>e.style.opacity="1",30),setTimeout(()=>{e.style.opacity="0",setTimeout(()=>e.remove(),280)},2200)}const st={local:{download(t,o="arraybuffer"){return new Promise((e,i)=>{const n=new FileReader;switch(n.onload=c=>{let l=c.target.result;o==="base64"&&typeof l=="string"&&(l=l.split(",")[1]||l),e(l)},n.onerror=c=>i(c),o.toLowerCase()){case"arraybuffer":n.readAsArrayBuffer(t);break;case"base64":case"dataurl":n.readAsDataURL(t);break;case"text":n.readAsText(t);break;default:i(new Error(`Unsupported read type: ${o}`))}})},async upload(t){return this.download(t,"base64")}}},ct={getAdapter(t){const o=st[t];if(!o)throw new Error(`Storage adapter not found: ${t}`);return o},async upload(t,o,e={}){return await this.getAdapter(t).upload(o,e)},async download(t,o,e={}){return await this.getAdapter(t).download(o,e.type||"arraybuffer")}},dt="vnpt_templates_db",N="buffers";let K=null;function J(){return K?Promise.resolve(K):new Promise((t,o)=>{const e=indexedDB.open(dt,1);e.onupgradeneeded=i=>{const n=i.target.result;n.objectStoreNames.contains(N)||n.createObjectStore(N)},e.onsuccess=i=>{K=i.target.result,t(K)},e.onerror=()=>o(e.error)})}async function pt(t,o){const e=await J();return new Promise((i,n)=>{const s=e.transaction(N,"readwrite").objectStore(N).put(o,t);s.onsuccess=()=>i(),s.onerror=()=>n(s.error)})}async function ut(t){const o=await J();return new Promise((e,i)=>{const l=o.transaction(N,"readonly").objectStore(N).get(t);l.onsuccess=()=>e(l.result),l.onerror=()=>i(l.error)})}async function ft(t){const o=await J();return new Promise((e,i)=>{const l=o.transaction(N,"readwrite").objectStore(N).delete(t);l.onsuccess=()=>e(),l.onerror=()=>i(l.error)})}function L(){try{const t=JSON.parse(localStorage.getItem(M))||[],o=t.filter(e=>e.type!=="local");return o.length!==t.length&&D(o),o}catch{return[]}}function D(t){localStorage.setItem(M,JSON.stringify(t))}function gt(t){const o=t.match(/drive\.google\.com\/file\/d\/([^/]+)/);return o?`https://drive.google.com/uc?export=download&id=${o[1]}`:t}function ht(t){return new Promise((o,e)=>{GM_xmlhttpRequest({method:"GET",url:gt(t),responseType:"arraybuffer",onload:i=>{if(i.status>=200&&i.status<300){if(i.response&&i.response.byteLength>4){const n=new Uint8Array(i.response.slice(0,4));if(n[0]===80&&n[1]===75&&n[2]===3&&n[3]===4){o(i.response);return}else{e(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}o(i.response)}else e(new Error(`HTTP ${i.status}: Không lấy được file`))},onerror:()=>e(new Error("Không thể tải URL.")),ontimeout:()=>e(new Error("Timeout khi tải URL."))})})}async function mt(t,o,e){const i=t.name.replace(/\.docx$/i,""),n=prompt("Đặt tên biến nhớ cho file này:",i);if(!(!n||!n.trim()))try{const c=await t.arrayBuffer();await pt(n.trim(),c);const s=L().filter(r=>r.name!==n.trim()&&r.fileName!==t.name);s.unshift({name:n.trim(),type:"local_idb",fileName:t.name,lastUsed:Date.now()}),D(s),E(o,e),e&&e(c,n.trim())}catch(c){m(`❌ Lỗi lưu file: ${c.message}`,"#dc3545")}}function E(t,o,e=null){let i=t.querySelector(".vnpt-template-manager-inner"),n,c;if(i)n=i.querySelector(".vnpt-local-list-container"),c=i.querySelector(".vnpt-btn-wrap");else{t.innerHTML="",i=document.createElement("div"),i.className="vnpt-template-manager-inner";const r=document.createElement("div");r.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const d=document.createElement("span");d.className="vnpt-title-main",d.style.cssText="font-size:11px;font-weight:700;color:#444;",c=document.createElement("div"),c.className="vnpt-btn-wrap",c.style.cssText="display:flex;gap:4px;",r.appendChild(d),r.appendChild(c),i.appendChild(r),n=document.createElement("div"),n.className="vnpt-local-list-container",n.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",i.appendChild(n),t.appendChild(i)}const l=L(),s=i.querySelector(".vnpt-title-main");s.innerHTML="📁 Bộ nhớ Templates"+(e?` <span style="color:#2e7d32;">(Đang dùng: ${e})</span>`:""),l.length===0?n.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':n.innerHTML="",l.forEach((r,d)=>{const f=document.createElement("div");f.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",f.title=r.fileName||r.url||r.name,f.tabIndex=0,f.onfocus=()=>f.style.boxShadow="0 0 0 2px #28a745",f.onblur=()=>f.style.boxShadow="none";const p=r.type==="local"||r.type==="local_base64"||r.type==="local_idb"?"OFF":"ON",u=p==="OFF"?"#6c757d":"#28a745",h=document.createElement("span");h.textContent=p,h.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${u};color:#fff;`;const g=document.createElement("span");g.textContent=r.name,g.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",f.onclick=()=>{f.focus(),bt(r,o,e,t)},f.appendChild(h),f.appendChild(g);const b=document.createElement("button");b.innerHTML="✎",b.title="Đổi tên template",b.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",b.onclick=B=>{B.stopPropagation();const S=prompt("Đổi tên template:",r.name);if(S&&S.trim()&&S.trim()!==r.name){const T=L();T[d].name=S.trim(),D(T),E(t,o,e)}},f.appendChild(b);const w=document.createElement("button");w.innerHTML="✕",w.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",w.onclick=async B=>{if(B.stopPropagation(),confirm(`Xoá biểu mẫu "${r.name}"?`)){const S=L();S.splice(d,1),D(S),r.type==="local_idb"&&await ft(r.name).catch(()=>null),E(t,o,e===r.name?null:e)}},f.appendChild(w),n.appendChild(f)})}function bt(t,o,e,i){const n=L(),c=n.find(l=>l.name===t.name&&(l.url===t.url||l.type===t.type));if(c&&(c.lastUsed=Date.now(),D(n)),t.type==="local_idb"){ut(t.name).then(l=>{if(!l)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");o&&o(l,t.name),E(i,o,t.name)}).catch(l=>{m(`❌ Lỗi nạp File IDB: ${l.message}`,"#dc3545")});return}if(t.type==="local_base64"&&t.data){try{const l=window.atob(t.data.split(",")[1]),s=l.length,r=new Uint8Array(s);for(let d=0;d<s;d++)r[d]=l.charCodeAt(d);o&&o(r.buffer,t.name),E(i,o,t.name)}catch(l){m(`❌ Lỗi nạp Base64: ${l.message}`,"#dc3545")}return}ht(t.url).then(l=>{o&&o(l,t.name),E(i,o,t.name)}).catch(l=>{m(`❌ ${l.message}`,"#dc3545")})}function yt(t){t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}))}function P(t,o){var n;if(!t||t.disabled||t.readOnly)return;const e=t.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,i=(n=Object.getOwnPropertyDescriptor(e,"value"))==null?void 0:n.set;i?i.call(t,o):t.value=o,yt(t)}function X(t){const o=document.getElementById(t);if(o&&(o.tagName==="INPUT"||o.tagName==="TEXTAREA"))return o;for(const e of document.querySelectorAll("label"))if(e.textContent.trim()===t){if(e.htmlFor){const n=document.getElementById(e.htmlFor);if(n)return n}let i=e.parentElement;for(;i;){const n=i.querySelector("input,textarea");if(n)return n;if(i=i.parentElement,(i==null?void 0:i.tagName)==="FORM")break}}return null}function W(t){for(const o of document.querySelectorAll("label"))if(o.innerText.trim()===t)return o.parentElement.querySelector("input, textarea");return null}function V(t,o){const e=X(t)||W(t);e&&P(e,o)}const Y=new Date,Q=String(Y.getDate()).padStart(2,"0"),_=String(Y.getMonth()+1).padStart(2,"0"),z=String(Y.getFullYear()),Z={ngayKy:Q,thangKy:_,namKy:z,ngayTiepNhan:`${Q}/${_}/${z}`,ngayThangNamKy:`${Q}/${_}/${z}`,thangKy1:_,namKy1:z,tenDoanhNghiepB:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM",diaChiB:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội",maSoThueB:"0100686223",stkB:"1600114156",diaChiStkB:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)",tenB:"Phạm Khánh Chung",nguoiDaiDienB:"Phạm Khánh Chung",chucVuB:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",chucVuDaiDienB:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",giayUyQuyenSoB:"2628/GUQ-VNPT-HNI-VP",soGiayUyQuyenB:"2628/GUQ-VNPT-HNI-VP",giayUyQuyenNgayB:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",ngayGiayUyQuyenB:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",GiayUyQuyenB:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",tenDoanhNghiepB1:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",donViTiepNhan:"TTKD KHDN",tenTiepNhan:"Bùi Anh",tenNguoiNhan:"Bùi Anh",dienThoaiB:"02436686868",diaChiTaiKhoanB:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 ",noiKy:"Hà Nội",emailB:"",lienheHopDongB:"AM Bùi Anh",lienheTuVanB:"AM Bùi Anh",lienheHoaDonB:"AM Bùi Anh",sucoCap1B:"AM Bùi Anh",sucoCap2B:"AM Bùi Anh",sucoCap3B:"AM Bùi Anh",sucoCap4B:"AM Bùi Anh"},nt=["lienheHopDongA","lienheHoaDonA","lienheTuVanA","sucoCap1A","sucoCap2A","sucoCap3A","sucoCap4A"];function tt(t,o=null){try{const e=localStorage.getItem(t);return e!==null?JSON.parse(e):o}catch{return o}}function vt(){const t=tt(j)??{...Z},o=tt($)??{},e={...t,...o};let i="";for(let n of nt){const c=X(n)||W(n);if(c&&c.value){i=c.value;break}}i&&nt.forEach(n=>V(n,i)),Object.keys(e).forEach(n=>{let c=X(n)||W(n);c&&P(c,e[n])}),m("✅ Auto fill complete")}let et=!1;function xt(){document.addEventListener("input",t=>{var l;if(et||!t.target||!["INPUT","TEXTAREA"].includes(t.target.tagName))return;let o=tt(G)??{};if(Object.keys(o).length===0)return;let e=t.target.id,i=t.target.name,n=null;if(e){const s=document.querySelector(`label[for="${e}"]`);s&&(n=s.textContent.trim())}if(!n){const s=t.target.closest("label");s&&(n=(l=Array.from(s.childNodes).find(r=>r.nodeType===3))==null?void 0:l.textContent.trim())}let c=o[e]||o[i]||o[n];if(c){et=!0;try{const s=t.target.value;c.split(",").map(d=>d.trim()).filter(d=>d).forEach(d=>{d!==e&&d!==i&&d!==n&&V(d,s)})}finally{et=!1}}})}function v(t,o,e=null,i=""){const n=a.fieldsContainer.querySelector(".text-hint");n&&n.remove();const c=a.fieldsContainer.querySelectorAll(".f-key");let l=!1;for(let s of c)if(s.value.split(",")[0].trim()===t){const d=s.closest(".vnpt-field-row"),f=d.querySelector(".f-val"),p=d.querySelector(".f-label");o!==""&&(f.value=o),e!==null&&e!==""&&(p.value=e),i!==""&&(s.value.split(",").slice(1).map(u=>u.trim()).join(", "),s.value=t+", "+i),l=!0;break}if(!l){(e===null||e==="")&&(e=y[t]||"");const s=document.createElement("div");s.className="vnpt-field-row row-item",s.setAttribute("draggable","false");let r=t;i&&(r+=", "+i),s.innerHTML=`
            <input type="checkbox" class="row-chk" title="Chọn để thao tác hàng loạt" style="margin: 0 2px 0 2px;" />
            <input type="text" class="f-label" placeholder="Nhãn..." value="${e}" />
            <input type="text" class="f-key" placeholder="Mã biến / IDs đồng bộ" value="${r}" title="Biến DOCX (đầu tiên), theo sau là các ID web cách dấu phẩy" />
            <span class="row-drag-handle" title="Kéo thả để di chuyển">=</span>
            <input type="text" class="f-val" placeholder="Giá trị" value="${o}" />
        `;const d=s.querySelector(".f-val"),f=s.querySelector(".f-key");t==="tenToChuc"&&(d.style.textAlign="right"),f.addEventListener("keyup",function(){x();const u=this.value.split(",")[0].trim();d.style.textAlign=u==="tenToChuc"?"right":""}),s.querySelector(".f-label").addEventListener("keyup",x),d.addEventListener("keyup",function(){if(a.isDefaultMode&&!this.dataset.warned){if(!confirm("⚠️ Bạn đang chỉnh sửa dữ liệu mặc định. Thay đổi này sẽ không được lưu vào cấu hình cá nhân. Tiếp tục?")){F();return}this.dataset.warned="true"}x();const h=f.value.split(",").map(g=>g.trim()).filter(g=>g);h.length>0&&h.forEach(g=>V(g,this.value))}),d.addEventListener("focus",function(){a.isDefaultMode&&this.dataset.warned});const p=s.querySelector(".row-drag-handle");p.addEventListener("mouseenter",()=>s.setAttribute("draggable","true")),p.addEventListener("mouseleave",()=>{s.classList.contains("dragging")||s.setAttribute("draggable","false")}),s.addEventListener("dragstart",function(u){a.draggedRowForVNPT=this,u.dataTransfer.effectAllowed="move",u.dataTransfer.setData("text/plain",t),this.classList.add("dragging")}),s.addEventListener("dragover",function(u){return u.preventDefault(),u.dataTransfer.dropEffect="move",!1}),s.addEventListener("dragenter",function(u){this.classList.add("over")}),s.addEventListener("dragleave",function(u){this.classList.remove("over")}),s.addEventListener("drop",function(u){if(u.stopPropagation(),a.draggedRowForVNPT&&a.draggedRowForVNPT!==this){const h=Array.from(a.fieldsContainer.querySelectorAll(".vnpt-field-row")),g=h.indexOf(a.draggedRowForVNPT),b=h.indexOf(this);g<b?this.parentNode.insertBefore(a.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(a.draggedRowForVNPT,this),x()}return!1}),s.addEventListener("dragend",function(u){this.setAttribute("draggable","false"),a.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(g=>{g.classList.remove("over"),g.classList.remove("dragging")}),a.draggedRowForVNPT=null}),a.fieldsContainer.appendChild(s),a.fieldsContainer.scrollTop=a.fieldsContainer.scrollHeight}}async function x(){if(a.isDefaultMode)return;const t={};a.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(e=>{const n=e.querySelector(".f-key").value.trim().split(",").map(d=>d.trim()).filter(d=>d),c=n[0],l=n.slice(1).join(", "),s=e.querySelector(".f-label").value.trim(),r=e.querySelector(".f-val").value;c&&(t[c]={label:s,value:r,sync:l})}),localStorage.setItem(A,JSON.stringify(t))}async function F(){try{a.fieldsContainer.innerHTML="";const t=JSON.parse(localStorage.getItem(A))||{};Object.keys(y).forEach(o=>{const e=y[o],i=t[o];i&&typeof i=="object"?v(o,i.value,i.label||e,i.sync||""):i?v(o,i,e,""):v(o,"",e,"")}),Object.keys(t).forEach(o=>{if(!(o in y)){const e=t[o];typeof e=="object"?v(o,e.value,e.label,e.sync||""):v(o,e,"","")}}),Object.keys(y).length===0&&Object.keys(t).length===0&&(a.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(t){console.error("Error loading config:",t),Object.keys(y).forEach(o=>{v(o,"",y[o])})}try{const t=JSON.parse(localStorage.getItem(O));t&&a.widget&&(a.widget.style.bottom="auto",t.right?(a.widget.style.right=t.right,a.widget.style.left="auto"):t.left&&(a.widget.style.left=t.left,a.widget.style.right="auto"),t.top&&(a.widget.style.top=t.top))}catch{}}function wt(){document.getElementById("vnpt-btn-toggle-id").addEventListener("click",function(){a.fieldsContainer.classList.toggle("show-ids")}),document.getElementById("vnpt-btn-default").addEventListener("click",St),document.getElementById("vnpt-btn-batch-del").addEventListener("click",function(){if(a.isDefaultMode){m("⚠️ Không thể xóa ở chế độ Dữ liệu mặc định","#ffc107");return}const t=a.fieldsContainer.querySelectorAll(".vnpt-field-row");let o=0;t.forEach(e=>{const i=e.querySelector(".row-chk");i&&i.checked&&(e.remove(),o++)}),o===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(t.forEach(e=>e.remove()),m("🗑️ Đã xóa toàn bộ","#ff5252"),x()):(m(`🗑️ Đã xóa ${o} trường`,"#ff5252"),x())}),document.getElementById("vnpt-btn-add").addEventListener("click",function(){if(a.isDefaultMode){m("⚠️ Không thể thêm ở chế độ Dữ liệu mặc định","#ffc107");return}const t=a.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;v("bien_moi_"+t,"","",""),x()}),document.getElementById("vnpt-btn-fill-back").addEventListener("click",function(){vt();const t=a.fieldsContainer.querySelectorAll(".vnpt-field-row");let o=0;t.forEach(e=>{const i=e.querySelector(".f-key").value.trim(),n=e.querySelector(".f-val").value;i.split(",").map(l=>l.trim()).filter(Boolean).forEach(l=>{(document.getElementById(l)||document.getElementsByName(l)[0])&&(V(l,n),o++)})}),o>0?m(`✅ Đã điền ngược ${o} trường vào web`,"#198754"):m("⚠️ Không có trường nào khớp","#ffc107")})}function St(){a.isDefaultMode=!a.isDefaultMode;const t=document.getElementById("vnpt-btn-default");if(a.fieldsContainer.innerHTML="",a.bannerArea.innerHTML="",a.isDefaultMode){t.classList.add("active"),a.fieldsContainer.classList.add("vnpt-mode-default"),m("📌 Chế độ xem Dữ liệu mặc định","#ea4335");const o=document.createElement("div");o.className="vnpt-default-banner",o.innerHTML=`
            <span>📌 Đang xem Dữ liệu mặc định</span>
        `,a.bannerArea.appendChild(o),Object.keys(Z).forEach(e=>{v(e,Z[e],y[e]||"")})}else t.classList.remove("active"),a.fieldsContainer.classList.remove("vnpt-mode-default"),m("📋 Đã quay lại Dữ liệu cá nhân"),F()}function Nt(){const t={version:"1.0",timestamp:Date.now(),fields:JSON.parse(localStorage.getItem(A))||{},templates:JSON.parse(localStorage.getItem(M))||[],position:JSON.parse(localStorage.getItem(O))||null,size:JSON.parse(localStorage.getItem(H))||null,calc:{default:JSON.parse(localStorage.getItem(j))||null,custom:JSON.parse(localStorage.getItem($))||null,sync:JSON.parse(localStorage.getItem(G))||null}},o=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),e=URL.createObjectURL(o),i=document.createElement("a");i.href=e,i.download=`vnpt_config_${new Date().toISOString().slice(0,10)}.json`,i.click(),URL.revokeObjectURL(e),m("📤 Đã xuất cấu hình JSON")}function Et(){const t=document.createElement("input");t.type="file",t.accept=".json",t.onchange=async o=>{const e=o.target.files[0];if(e)try{const i=await e.text(),n=JSON.parse(i);if(!n.fields&&!n.calc)throw new Error("Định dạng file không hợp lệ!");n.fields&&localStorage.setItem(A,JSON.stringify(n.fields)),n.templates&&localStorage.setItem(M,JSON.stringify(n.templates)),n.position&&localStorage.setItem(O,JSON.stringify(n.position)),n.size&&localStorage.setItem(H,JSON.stringify(n.size)),n.calc&&(n.calc.default&&localStorage.setItem(j,JSON.stringify(n.calc.default)),n.calc.custom&&localStorage.setItem($,JSON.stringify(n.calc.custom)),n.calc.sync&&localStorage.setItem(G,JSON.stringify(n.calc.sync))),await F();const c=document.getElementById("vnpt-template-manager");c&&E(c,(l,s)=>{a.templateBuffer=l,a.templateName=s}),n.position&&a.widget&&(n.position.right?(a.widget.style.right=n.position.right,a.widget.style.left="auto"):n.position.left&&(a.widget.style.left=n.position.left,a.widget.style.right="auto"),n.position.top&&(a.widget.style.top=n.position.top),a.widget.style.bottom="auto"),n.size&&a.panel&&(a.panel.style.width=n.size.width+"px",a.panel.style.height=n.size.height+"px"),m("✅ Nhập cấu hình thành công!")}catch(i){console.error("Lỗi Import:",i),alert("Lỗi: "+i.message)}},t.click()}function Tt(){const t=document.createElement("div");t.id="vnpt-docx-widget";const o=localStorage.getItem(U)==="true";t.innerHTML=`
        <button id="vnpt-toggle-btn" title="Mở/Đóng UI Hợp đồng" class="${o?"btn-opened":"btn-closed"}">${o?"✖":"📄"}</button>

        <div id="vnpt-export-panel" style="display: ${o?"flex":"none"};">
            <div id="vnpt-panel-header" title="Kẹp chuột vào đây để di chuyển">
                <span id="vnpt-panel-title">VNPT PRO</span>
                <div class="btn-row" style="margin-bottom: 0; padding-right: 35px; gap: 4px;">
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-scan" title="Lấy data theo biểu mẫu web">Quét</button>
                    <button class="vnpt-btn-action btn-fill-back" id="vnpt-btn-fill-back" title="Điền dữ liệu ngược lên web">Điền Ngược</button>
                    <button class="vnpt-btn-action btn-default-toggle" id="vnpt-btn-default" title="Dữ liệu mặc định VNPT">📌</button>
                    <button class="vnpt-btn-action btn-import" id="vnpt-btn-import" title="Nhập cấu hình JSON">📥</button>
                    <button class="vnpt-btn-action btn-export-json" id="vnpt-btn-export-json" title="Xuất cấu hình JSON">📤</button>
                    <button class="vnpt-btn-action btn-toggle-id" id="vnpt-btn-toggle-id" title="Ẩn/Hiện Mã ID">ID</button>
                    <button class="vnpt-btn-action btn-add" id="vnpt-btn-add" title="Chèn thêm trường trống">➕</button>
                    <button class="vnpt-btn-action btn-clean" id="vnpt-btn-batch-del" title="Xóa chọn / Xóa tất cả">🗑️</button>
                </div>
            </div>

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
    `,document.body.appendChild(t),a.widget=t,a.panel=document.getElementById("vnpt-export-panel"),a.toggleBtn=document.getElementById("vnpt-toggle-btn"),a.header=document.getElementById("vnpt-panel-header"),a.bannerArea=document.getElementById("vnpt-banner-area"),a.fieldsContainer=document.getElementById("vnpt-fields-container");try{const i=JSON.parse(localStorage.getItem(H));i&&i.width&&i.height&&(a.panel.style.width=i.width+"px",a.panel.style.height=i.height+"px")}catch(i){console.error("Lỗi load size panel:",i)}new ResizeObserver(i=>{if(a.panel.style.display!=="none")for(let n of i){const{width:c,height:l}=n.contentRect;c>0&&l>0&&localStorage.setItem(H,JSON.stringify({width:Math.round(c+20),height:Math.round(l+20)}))}}).observe(a.panel),a.panelBody=document.getElementById("vnpt-panel-body"),E(document.getElementById("vnpt-template-manager"),(i,n)=>{a.templateBuffer=i,a.templateName=n}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const i=this.files&&this.files[0];if(!i)return;const n=document.getElementById("vnpt-template-manager");mt(i,n,(c,l)=>{a.templateBuffer=c,a.templateName=l}),this.value=""}),a.toggleBtn.addEventListener("click",i=>{a.hasDragged||(a.panel.style.display==="none"?(a.panel.style.display="flex",a.toggleBtn.className="btn-opened",a.toggleBtn.innerHTML="✖",localStorage.setItem(U,"true")):(a.panel.style.display="none",a.toggleBtn.className="btn-closed",a.toggleBtn.innerHTML="📄",localStorage.setItem(U,"false")))}),document.getElementById("vnpt-btn-import").onclick=Et,document.getElementById("vnpt-btn-export-json").onclick=Nt}function Ct(t,o,e,i=null,n=null){let c=!1,l=0,s=0,r=!1;function d(p){r!==p&&(r=p,n&&n(p))}function f(p){if(p.button!==0)return;c=!0,a.hasDragged=!1;const u=t.getBoundingClientRect();l=p.clientX-u.left,s=p.clientY-u.top,document.body.style.userSelect="none",o&&o.forEach(h=>h.style.cursor="grabbing"),i&&i(),p.preventDefault()}return o.forEach(p=>{p.addEventListener("mousedown",f)}),document.addEventListener("mousemove",function(p){if(!c)return;a.hasDragged=!0;let u=p.clientX-l,h=p.clientY-s;const g=window.innerWidth,b=window.innerHeight,w=document.getElementById("vnpt-toggle-btn"),B=w?w.offsetWidth:40,S=w?w.offsetHeight:40,T=t.id==="vnpt-docx-widget";let C=t.offsetWidth||0;if(T){let k=B+6-C,I=g-C+6;u<k&&(u=k),u>I&&(u=I)}else C=C||200,u<0&&(u=0),u+C>g&&(u=Math.max(0,g-C));let R=r;if(T?R=!1:r?p.clientY<b-40&&(R=!1):p.clientY>b-10&&(R=!0),h<0&&(h=0),R)d(!0),t.style.top=b-t.offsetHeight+"px",T?(t.style.right=g-u-C+"px",t.style.left="auto"):(t.style.left=u+"px",t.style.right="auto"),t.style.bottom="auto";else{d(!1);let rt=t.offsetHeight||40,k;if(T)k=10+S;else{const I=t.querySelector(".cw-title-bar");k=I?I.offsetHeight:rt}h+k>b&&(h=Math.max(0,b-k)),t.style.top=h+"px",T?(t.style.right=g-u-C+"px",t.style.left="auto"):(t.style.left=u+"px",t.style.right="auto"),t.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(c){c=!1,document.body.style.userSelect="",o&&o.forEach(p=>p.style.cursor="grab");{const p=t.id==="vnpt-docx-widget";localStorage.setItem(e,JSON.stringify({left:p?void 0:t.style.left,right:p?t.style.right:void 0,top:t.style.top,x:p?void 0:parseFloat(t.style.left),y:parseFloat(t.style.top),docked:r}))}}}),{isDocked:()=>r,setDocked:d}}function kt(){a.widget&&a.header&&a.toggleBtn&&(Ct(a.widget,[a.header,a.toggleBtn],O),window.addEventListener("resize",()=>{const t=window.innerWidth,o=window.innerHeight,e=document.getElementById("vnpt-toggle-btn"),i=e?e.offsetWidth:40,n=e?e.offsetHeight:40;let c=a.widget.getBoundingClientRect(),l=c.left,s=c.top,r=a.widget.offsetWidth||0,f=i+6-r,p=t-r+6;l<f&&(l=f),l>p&&(l=p),s+10+n>o&&(s=Math.max(0,o-(10+n))),a.widget.style.right=t-l-r+"px",a.widget.style.top=s+"px"}))}function ot(t){const o=t.toLowerCase(),e=new Date;return{ngayky:String(e.getDate()).padStart(2,"0"),thangky:String(e.getMonth()+1).padStart(2,"0"),thangky1:String(e.getMonth()+1).padStart(2,"0"),namky:String(e.getFullYear()),namky1:String(e.getFullYear()),soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[o]||""}function Lt(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){let t=0;Object.keys(y).forEach(o=>{var n;const e=document.getElementById(o);let i="";e&&(i=e.tagName.toLowerCase()==="select"?((n=e.options[e.selectedIndex])==null?void 0:n.text)||"":e.value,t++),i||(i=ot(o)),v(o,i,null)}),x(),t>0?(this.style.background="#34a853",this.style.color="#fff",this.innerText="Done",setTimeout(()=>{this.style.background="#fbbc04",this.style.color="#000",this.innerText="Quét"},1e3)):m("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(t){t.target&&t.target.id&&y[t.target.id]!==void 0&&(v(t.target.id,t.target.value,null),x())}),document.addEventListener("change",function(t){var o;if(t.target&&t.target.id&&y[t.target.id]!==void 0){let e=t.target.tagName.toLowerCase()==="select"?((o=t.target.options[t.target.selectedIndex])==null?void 0:o.text)||"":t.target.value;v(t.target.id,e,null),x()}})}function it(t,o,e){try{let i;try{i=new window.PizZip(t)}catch(r){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(r);return}const n=new window.docxtemplater(i,{paragraphLoop:!0,linebreaks:!0});n.render(o);const c=n.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),l=URL.createObjectURL(c),s=document.createElement("a");s.href=l,s.download=e,document.body.appendChild(s),s.click(),setTimeout(()=>{document.body.removeChild(s),URL.revokeObjectURL(l)},100)}catch(i){let n=i.message;i.properties&&i.properties.errors instanceof Array?n=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+i.properties.errors.map(l=>"- "+(l.properties.explanation||l.message)).join(`
`):n="Lỗi phần mềm Word sinh ra: "+n,alert(n),console.error("DocX Error:",i)}}function Dt(){const t=document.getElementById("vnpt-export-filename");t&&t.addEventListener("input",()=>{t.dataset.userEdited="1",t.value.trim()||(t.dataset.userEdited="0")});function o(){if(!t||t.dataset.userEdited==="1")return;let e="";if(a.fieldsContainer&&a.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(r=>{const f=r.querySelector(".f-key").value.trim().split(",")[0].trim(),p=r.querySelector(".f-val").value.trim();f==="tenToChuc"&&(e=p)}),!e){const s=document.getElementById("tenToChuc");s&&(e=s.tagName.toLowerCase()==="textarea"||s.tagName.toLowerCase()==="input"?s.value.trim():s.innerText.trim())}function i(s){if(!s)return"";let r=s;return r=r.replace(/Tổng công ty/gi,""),r=r.replace(/Công ty/gi,""),r=r.replace(/\bCty\b/gi,""),r=r.replace(/Trách nhiệm hữu hạn/gi,""),r=r.replace(/\bTNHH\b/gi,""),r=r.replace(/Cổ phần/gi,""),r=r.replace(/\bCP\b/gi,""),r=r.replace(/Một thành viên/gi,""),r=r.replace(/\bMTV\b/gi,""),r=r.replace(/Chi nhánh/gi,""),r=r.replace(/Việt Nam/gi,"VN"),r=r.replace(/Viet Nam/gi,"VN"),r=r.replace(/\s+/g," ").trim(),r=r.replace(/^[-,\s]+|[-,\s]+$/g,""),r.length>50&&(r=r.substring(0,47)+"..."),r.replace(/[<>:"/\\|?*]/g,"")}let n=i(e),c=a.templateName?a.templateName.replace(/\.docx$/i,""):"",l=[];n&&l.push(n),c&&l.push(c),l.length>0?t.value=l.join(" - ")+".docx":t.value||(t.value="HopDong_Auto.docx")}setInterval(o,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const e={};if(a.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(l=>{const r=l.querySelector(".f-key").value.trim().split(",")[0].trim(),d=l.querySelector(".f-val").value;r&&(e[r]=d)}),Object.keys(e).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}let n=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(n.toLowerCase().endsWith(".docx")||(n+=".docx"),a.templateBuffer){it(a.templateBuffer,e,n);return}const c=document.getElementById("vnpt-template-file");if(c.files&&c.files.length>0){ct.download("local",c.files[0],{type:"arraybuffer"}).then(l=>it(l,e,n)).catch(l=>alert(`Lỗi đọc file: ${l.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')})}const Bt=["chucVu","noiCap","noiCapSoDkdn","ngayky","thangky","namky","thangky1","namky1","noiKy"],It=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function At(){function t(){Bt.forEach(i=>{const n=document.getElementById(i);n&&!n.dataset.filled&&(n.dataset.filled="1",P(n,ot(i)))}),It.forEach(i=>{const n=document.getElementById(i.src),c=document.getElementById(i.target);n&&c&&!n.dataset.bound&&(n.dataset.bound="1",n.addEventListener("input",()=>P(c,n.value)))})}let o;new MutationObserver(()=>{clearTimeout(o),o=setTimeout(t,200)}).observe(document.body,{childList:!0,subtree:!0}),t()}function at(){q.info("Initializing VNPT Userscript...");try{lt(),Tt(),kt(),wt(),F(),Lt(),Dt(),At(),xt(),q.info("Userscript initialized successfully.")}catch(t){q.error("Error during userscript initialization:",t)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",at):at()})();
