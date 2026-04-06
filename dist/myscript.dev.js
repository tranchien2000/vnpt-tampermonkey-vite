(function(){"use strict";const ge={info:(...e)=>console.log("[Tampermonkey Script] INFO:",...e),error:(...e)=>console.error("[Tampermonkey Script] ERROR:",...e),warn:(...e)=>console.warn("[Tampermonkey Script] WARN:",...e)};function Ve(){GM_addStyle(`
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
    `)}const l={widget:null,panel:null,header:null,toggleBtn:null,fieldsContainer:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1},H={tenDaiDienn:"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT",emailDaiDien:"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Số GPKD | MST",goiDV:"Gói Dịch Vụ",ngayKy:"Ngày ký",thangKy:"Tháng Ký",namKy:"Năm ký",soHopDong:"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký"},ke="vnpt_docx_fields",Te="vnpt_docx_position",Ne="vnpt_docx_size",me="vnpt_docx_opened",te="vnpt_autofill_data_default",G="vnpt_autofill_data_custom",R="vnpt_autofill_data_sync",Se="vnpt_widget_pos",Le="vnd_tax_rate",z="vnd_before_history",K="vnd_after_history",he="vnpt_widget_collapsed",De="vnd_calc_map",ne="vnpt_widget_datatab",Be="vnpt_templates";function L(e,t="#198754"){const n=document.createElement("div");n.innerText=e,Object.assign(n.style,{position:"fixed",bottom:"20px",left:"50%",transform:"translateX(-50%)",background:t,color:"#fff",padding:"7px 16px",borderRadius:"20px",zIndex:"100000",opacity:"0",transition:"opacity .25s",fontSize:"13px",fontFamily:"'Segoe UI',sans-serif",boxShadow:"0 4px 14px rgba(0,0,0,.25)"}),document.body.appendChild(n),setTimeout(()=>n.style.opacity="1",30),setTimeout(()=>{n.style.opacity="0",setTimeout(()=>n.remove(),280)},2200)}const Re={local:{download(e,t="arraybuffer"){return new Promise((n,o)=>{const a=new FileReader;switch(a.onload=c=>{let r=c.target.result;t==="base64"&&typeof r=="string"&&(r=r.split(",")[1]||r),n(r)},a.onerror=c=>o(c),t.toLowerCase()){case"arraybuffer":a.readAsArrayBuffer(e);break;case"base64":case"dataurl":a.readAsDataURL(e);break;case"text":a.readAsText(e);break;default:o(new Error(`Unsupported read type: ${t}`))}})},async upload(e){return this.download(e,"base64")}}},Ie={getAdapter(e){const t=Re[e];if(!t)throw new Error(`Storage adapter not found: ${e}`);return t},async upload(e,t,n={}){return await this.getAdapter(e).upload(t,n)},async download(e,t,n={}){return await this.getAdapter(e).download(t,n.type||"arraybuffer")}},Pe="vnpt_templates_db",P="buffers";let se=null;function be(){return se?Promise.resolve(se):new Promise((e,t)=>{const n=indexedDB.open(Pe,1);n.onupgradeneeded=o=>{const a=o.target.result;a.objectStoreNames.contains(P)||a.createObjectStore(P)},n.onsuccess=o=>{se=o.target.result,e(se)},n.onerror=()=>t(n.error)})}async function qe(e,t){const n=await be();return new Promise((o,a)=>{const s=n.transaction(P,"readwrite").objectStore(P).put(t,e);s.onsuccess=()=>o(),s.onerror=()=>a(s.error)})}async function Ue(e){const t=await be();return new Promise((n,o)=>{const r=t.transaction(P,"readonly").objectStore(P).get(e);r.onsuccess=()=>n(r.result),r.onerror=()=>o(r.error)})}async function je(e){const t=await be();return new Promise((n,o)=>{const r=t.transaction(P,"readwrite").objectStore(P).delete(e);r.onsuccess=()=>n(),r.onerror=()=>o(r.error)})}function oe(){try{const e=JSON.parse(localStorage.getItem(Be))||[],t=e.filter(n=>n.type!=="local");return t.length!==e.length&&ae(t),t}catch{return[]}}function ae(e){localStorage.setItem(Be,JSON.stringify(e))}function $e(e){const t=e.match(/drive\.google\.com\/file\/d\/([^/]+)/);return t?`https://drive.google.com/uc?export=download&id=${t[1]}`:e}function We(e){return new Promise((t,n)=>{GM_xmlhttpRequest({method:"GET",url:$e(e),responseType:"arraybuffer",onload:o=>{if(o.status>=200&&o.status<300){if(o.response&&o.response.byteLength>4){const a=new Uint8Array(o.response.slice(0,4));if(a[0]===80&&a[1]===75&&a[2]===3&&a[3]===4){t(o.response);return}else{n(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}t(o.response)}else n(new Error(`HTTP ${o.status}: Không lấy được file`))},onerror:()=>n(new Error("Không thể tải URL.")),ontimeout:()=>n(new Error("Timeout khi tải URL."))})})}async function Ge(e,t,n){const o=e.name.replace(/\.docx$/i,""),a=prompt("Đặt tên biến nhớ cho file này:",o);if(!(!a||!a.trim()))try{const c=await e.arrayBuffer();await qe(a.trim(),c);const s=oe().filter(i=>i.name!==a.trim()&&i.fileName!==e.name);s.unshift({name:a.trim(),type:"local_idb",fileName:e.name,lastUsed:Date.now()}),ae(s),X(t,n),n&&n(c,a.trim())}catch(c){L(`❌ Lỗi lưu file: ${c.message}`,"#dc3545")}}function X(e,t,n=null){let o=e.querySelector(".vnpt-template-manager-inner"),a,c;if(o)a=o.querySelector(".vnpt-local-list-container"),c=o.querySelector(".vnpt-btn-wrap");else{e.innerHTML="",o=document.createElement("div"),o.className="vnpt-template-manager-inner";const i=document.createElement("div");i.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const p=document.createElement("span");p.className="vnpt-title-main",p.style.cssText="font-size:11px;font-weight:700;color:#444;",c=document.createElement("div"),c.className="vnpt-btn-wrap",c.style.cssText="display:flex;gap:4px;",i.appendChild(p),i.appendChild(c),o.appendChild(i),a=document.createElement("div"),a.className="vnpt-local-list-container",a.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",o.appendChild(a),e.appendChild(o)}const r=oe(),s=o.querySelector(".vnpt-title-main");s.innerHTML="📁 Bộ nhớ Templates"+(n?` <span style="color:#2e7d32;">(Đang dùng: ${n})</span>`:""),r.length===0?a.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':a.innerHTML="",r.forEach((i,p)=>{const u=document.createElement("div");u.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",u.title=i.fileName||i.url||i.name,u.tabIndex=0,u.onfocus=()=>u.style.boxShadow="0 0 0 2px #28a745",u.onblur=()=>u.style.boxShadow="none";const f=i.type==="local"||i.type==="local_base64"||i.type==="local_idb"?"OFF":"ON",d=f==="OFF"?"#6c757d":"#28a745",C=document.createElement("span");C.textContent=f,C.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${d};color:#fff;`;const y=document.createElement("span");y.textContent=i.name,y.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",u.onclick=()=>{u.focus(),Xe(i,t,n,e)},u.appendChild(C),u.appendChild(y);const k=document.createElement("button");k.innerHTML="✎",k.title="Đổi tên template",k.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",k.onclick=g=>{g.stopPropagation();const w=prompt("Đổi tên template:",i.name);if(w&&w.trim()&&w.trim()!==i.name){const h=oe();h[p].name=w.trim(),ae(h),X(e,t,n)}},u.appendChild(k);const N=document.createElement("button");N.innerHTML="✕",N.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",N.onclick=async g=>{if(g.stopPropagation(),confirm(`Xoá biểu mẫu "${i.name}"?`)){const w=oe();w.splice(p,1),ae(w),i.type==="local_idb"&&await je(i.name).catch(()=>null),X(e,t,n===i.name?null:n)}},u.appendChild(N),a.appendChild(u)})}function Xe(e,t,n,o){const a=oe(),c=a.find(r=>r.name===e.name&&(r.url===e.url||r.type===e.type));if(c&&(c.lastUsed=Date.now(),ae(a)),e.type==="local_idb"){Ue(e.name).then(r=>{if(!r)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");t&&t(r,e.name),X(o,t,e.name)}).catch(r=>{L(`❌ Lỗi nạp File IDB: ${r.message}`,"#dc3545")});return}if(e.type==="local_base64"&&e.data){try{const r=window.atob(e.data.split(",")[1]),s=r.length,i=new Uint8Array(s);for(let p=0;p<s;p++)i[p]=r.charCodeAt(p);t&&t(i.buffer,e.name),X(o,t,e.name)}catch(r){L(`❌ Lỗi nạp Base64: ${r.message}`,"#dc3545")}return}We(e.url).then(r=>{t&&t(r,e.name),X(o,t,e.name)}).catch(r=>{L(`❌ ${r.message}`,"#dc3545")})}function Ye(e){e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function F(e,t){var a;if(!e||e.disabled||e.readOnly)return;const n=e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,o=(a=Object.getOwnPropertyDescriptor(n,"value"))==null?void 0:a.set;o?o.call(e,t):e.value=t,Ye(e)}function de(e){const t=document.getElementById(e);if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"))return t;for(const n of document.querySelectorAll("label"))if(n.textContent.trim()===e){if(n.htmlFor){const a=document.getElementById(n.htmlFor);if(a)return a}let o=n.parentElement;for(;o;){const a=o.querySelector("input,textarea");if(a)return a;if(o=o.parentElement,(o==null?void 0:o.tagName)==="FORM")break}}return null}function pe(e){for(const t of document.querySelectorAll("label"))if(t.innerText.trim()===e)return t.parentElement.querySelector("input, textarea");return null}function V(e,t){const n=de(e)||pe(e);n&&F(n,t)}const xe=new Date,ye=String(xe.getDate()).padStart(2,"0"),ue=String(xe.getMonth()+1).padStart(2,"0"),fe=String(xe.getFullYear()),ie={ngayKy:ye,thangKy:ue,namKy:fe,ngayTiepNhan:`${ye}/${ue}/${fe}`,ngayThangNamKy:`${ye}/${ue}/${fe}`,thangKy1:ue,namKy1:fe,tenDoanhNghiepB:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM",diaChiB:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội",maSoThueB:"0100686223",stkB:"1600114156",diaChiStkB:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)",tenB:"Phạm Khánh Chung",nguoiDaiDienB:"Phạm Khánh Chung",chucVuB:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",chucVuDaiDienB:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",giayUyQuyenSoB:"2628/GUQ-VNPT-HNI-VP",soGiayUyQuyenB:"2628/GUQ-VNPT-HNI-VP",giayUyQuyenNgayB:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",ngayGiayUyQuyenB:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",GiayUyQuyenB:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",tenDoanhNghiepB1:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",donViTiepNhan:"TTKD KHDN",tenTiepNhan:"Bùi Anh",tenNguoiNhan:"Bùi Anh",dienThoaiB:"02436686868",diaChiTaiKhoanB:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 ",noiKy:"Hà Nội",emailB:"",lienheHopDongB:"AM Bùi Anh",lienheTuVanB:"AM Bùi Anh",lienheHoaDonB:"AM Bùi Anh",sucoCap1B:"AM Bùi Anh",sucoCap2B:"AM Bùi Anh",sucoCap3B:"AM Bùi Anh",sucoCap4B:"AM Bùi Anh"},Ae=["lienheHopDongA","lienheHoaDonA","lienheTuVanA","sucoCap1A","sucoCap2A","sucoCap3A","sucoCap4A"];function M(e,t,n=null,o=""){const a=l.fieldsContainer.querySelector(".text-hint");a&&a.remove();const c=l.fieldsContainer.querySelectorAll(".f-key");let r=!1;for(let s of c)if(s.value.split(",")[0].trim()===e){const p=s.closest(".vnpt-field-row"),u=p.querySelector(".f-val"),f=p.querySelector(".f-label");t!==""&&(u.value=t),n!==null&&n!==""&&(f.value=n),o!==""&&(s.value.split(",").slice(1).map(d=>d.trim()).join(", "),s.value=e+", "+o),r=!0;break}if(!r){(n===null||n==="")&&(n=H[e]||"");const s=document.createElement("div");s.className="vnpt-field-row row-item",s.setAttribute("draggable","false");let i=e;o&&(i+=", "+o),s.innerHTML=`
            <input type="checkbox" class="row-chk" title="Chọn để thao tác hàng loạt" style="margin: 0 2px 0 2px;" />
            <input type="text" class="f-label" placeholder="Nhãn..." value="${n}" />
            <input type="text" class="f-key" placeholder="Mã biến / IDs đồng bộ" value="${i}" title="Biến DOCX (đầu tiên), theo sau là các ID web cách dấu phẩy" />
            <span class="row-drag-handle" title="Kéo thả để di chuyển">=</span>
            <input type="text" class="f-val" placeholder="Giá trị" value="${t}" />
        `;const p=s.querySelector(".f-val"),u=s.querySelector(".f-key");e==="tenToChuc"&&(p.style.textAlign="right"),u.addEventListener("keyup",function(){_();const d=this.value.split(",")[0].trim();p.style.textAlign=d==="tenToChuc"?"right":""}),s.querySelector(".f-label").addEventListener("keyup",_),p.addEventListener("keyup",function(){if(l.isDefaultMode&&!this.dataset.warned){if(!confirm("⚠️ Bạn đang chỉnh sửa dữ liệu mặc định. Thay đổi này sẽ không được lưu vào cấu hình cá nhân. Tiếp tục?")){ve();return}this.dataset.warned="true"}_();const C=u.value.split(",").map(y=>y.trim()).filter(y=>y);C.length>0&&C.forEach(y=>V(y,this.value))}),p.addEventListener("focus",function(){l.isDefaultMode&&this.dataset.warned});const f=s.querySelector(".row-drag-handle");f.addEventListener("mouseenter",()=>s.setAttribute("draggable","true")),f.addEventListener("mouseleave",()=>{s.classList.contains("dragging")||s.setAttribute("draggable","false")}),s.addEventListener("dragstart",function(d){l.draggedRowForVNPT=this,d.dataTransfer.effectAllowed="move",d.dataTransfer.setData("text/plain",e),this.classList.add("dragging")}),s.addEventListener("dragover",function(d){return d.preventDefault(),d.dataTransfer.dropEffect="move",!1}),s.addEventListener("dragenter",function(d){this.classList.add("over")}),s.addEventListener("dragleave",function(d){this.classList.remove("over")}),s.addEventListener("drop",function(d){if(d.stopPropagation(),l.draggedRowForVNPT&&l.draggedRowForVNPT!==this){const C=Array.from(l.fieldsContainer.querySelectorAll(".vnpt-field-row")),y=C.indexOf(l.draggedRowForVNPT),k=C.indexOf(this);y<k?this.parentNode.insertBefore(l.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(l.draggedRowForVNPT,this),_()}return!1}),s.addEventListener("dragend",function(d){this.setAttribute("draggable","false"),l.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(y=>{y.classList.remove("over"),y.classList.remove("dragging")}),l.draggedRowForVNPT=null}),l.fieldsContainer.appendChild(s),l.fieldsContainer.scrollTop=l.fieldsContainer.scrollHeight}}async function _(){if(l.isDefaultMode)return;const e={};l.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(n=>{const a=n.querySelector(".f-key").value.trim().split(",").map(p=>p.trim()).filter(p=>p),c=a[0],r=a.slice(1).join(", "),s=n.querySelector(".f-label").value.trim(),i=n.querySelector(".f-val").value;c&&(e[c]={label:s,value:i,sync:r})}),localStorage.setItem(ke,JSON.stringify(e))}async function ve(){try{l.fieldsContainer.innerHTML="";const e=JSON.parse(localStorage.getItem(ke))||{};Object.keys(H).forEach(t=>{const n=H[t],o=e[t];o&&typeof o=="object"?M(t,o.value,o.label||n,o.sync||""):o?M(t,o,n,""):M(t,"",n,"")}),Object.keys(e).forEach(t=>{if(!(t in H)){const n=e[t];typeof n=="object"?M(t,n.value,n.label,n.sync||""):M(t,n,"","")}}),Object.keys(H).length===0&&Object.keys(e).length===0&&(l.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(e){console.error("Error loading config:",e),Object.keys(H).forEach(t=>{M(t,"",H[t])})}try{const e=JSON.parse(localStorage.getItem(Te));e&&l.widget&&(l.widget.style.bottom="auto",e.right?(l.widget.style.right=e.right,l.widget.style.left="auto"):e.left&&(l.widget.style.left=e.left,l.widget.style.right="auto"),e.top&&(l.widget.style.top=e.top))}catch{}}function Je(){document.getElementById("vnpt-btn-toggle-id").addEventListener("click",function(){l.fieldsContainer.classList.toggle("show-ids")}),document.getElementById("vnpt-btn-default").addEventListener("click",Qe),document.getElementById("vnpt-btn-batch-del").addEventListener("click",function(){if(l.isDefaultMode){L("⚠️ Không thể xóa ở chế độ Dữ liệu mặc định","#ffc107");return}const e=l.fieldsContainer.querySelectorAll(".vnpt-field-row");let t=0;e.forEach(n=>{const o=n.querySelector(".row-chk");o&&o.checked&&(n.remove(),t++)}),t===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(e.forEach(n=>n.remove()),L("🗑️ Đã xóa toàn bộ","#ff5252"),_()):(L(`🗑️ Đã xóa ${t} trường`,"#ff5252"),_())}),document.getElementById("vnpt-btn-add").addEventListener("click",function(){if(l.isDefaultMode){L("⚠️ Không thể thêm ở chế độ Dữ liệu mặc định","#ffc107");return}const e=l.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;M("bien_moi_"+e,"","",""),_()}),document.getElementById("vnpt-btn-fill-back").addEventListener("click",function(){const e=l.fieldsContainer.querySelectorAll(".vnpt-field-row");let t=0;e.forEach(n=>{const o=n.querySelector(".f-key").value.trim(),a=n.querySelector(".f-val").value;o.split(",").map(r=>r.trim()).filter(Boolean).forEach(r=>{(document.getElementById(r)||document.getElementsByName(r)[0])&&(V(r,a),t++)})}),t>0?L(`✅ Đã điền ngược ${t} trường vào web`,"#198754"):L("⚠️ Không có trường nào khớp","#ffc107")})}function Qe(){l.isDefaultMode=!l.isDefaultMode;const e=document.getElementById("vnpt-btn-default");if(l.fieldsContainer.innerHTML="",l.bannerArea.innerHTML="",l.isDefaultMode){e.classList.add("active"),l.fieldsContainer.classList.add("vnpt-mode-default"),L("📌 Chế độ xem Dữ liệu mặc định","#ea4335");const t=document.createElement("div");t.className="vnpt-default-banner",t.innerHTML=`
            <span>📌 Đang xem Dữ liệu mặc định</span>
        `,l.bannerArea.appendChild(t),Object.keys(ie).forEach(n=>{M(n,ie[n],H[n]||"")})}else e.classList.remove("active"),l.fieldsContainer.classList.remove("vnpt-mode-default"),L("📋 Đã quay lại Dữ liệu cá nhân"),ve()}function Ze(){const e=document.createElement("div");e.id="vnpt-docx-widget";const t=localStorage.getItem(me)==="true";e.innerHTML=`
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
    `,document.body.appendChild(e),l.widget=e,l.panel=document.getElementById("vnpt-export-panel"),l.toggleBtn=document.getElementById("vnpt-toggle-btn"),l.header=document.getElementById("vnpt-panel-header"),l.bannerArea=document.getElementById("vnpt-banner-area"),l.fieldsContainer=document.getElementById("vnpt-fields-container");try{const o=JSON.parse(localStorage.getItem(Ne));o&&o.width&&o.height&&(l.panel.style.width=o.width+"px",l.panel.style.height=o.height+"px")}catch(o){console.error("Lỗi load size panel:",o)}new ResizeObserver(o=>{if(l.panel.style.display!=="none")for(let a of o){const{width:c,height:r}=a.contentRect;c>0&&r>0&&localStorage.setItem(Ne,JSON.stringify({width:Math.round(c+20),height:Math.round(r+20)}))}}).observe(l.panel),l.panelBody=document.getElementById("vnpt-panel-body"),X(document.getElementById("vnpt-template-manager"),(o,a)=>{l.templateBuffer=o,l.templateName=a}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const o=this.files&&this.files[0];if(!o)return;const a=document.getElementById("vnpt-template-manager");Ge(o,a,(c,r)=>{l.templateBuffer=c,l.templateName=r}),this.value=""}),l.toggleBtn.addEventListener("click",o=>{l.hasDragged||(l.panel.style.display==="none"?(l.panel.style.display="flex",l.toggleBtn.className="btn-opened",l.toggleBtn.innerHTML="✖",localStorage.setItem(me,"true")):(l.panel.style.display="none",l.toggleBtn.className="btn-closed",l.toggleBtn.innerHTML="📄",localStorage.setItem(me,"false")))})}function He(e,t,n,o=null,a=null){let c=!1,r=0,s=0,i=!1;function p(f){i!==f&&(i=f,a&&a(f))}function u(f){if(f.button!==0)return;c=!0,l.hasDragged=!1;const d=e.getBoundingClientRect();r=f.clientX-d.left,s=f.clientY-d.top,document.body.style.userSelect="none",t&&t.forEach(C=>C.style.cursor="grabbing"),o&&o(),f.preventDefault()}return t.forEach(f=>{f.addEventListener("mousedown",u)}),document.addEventListener("mousemove",function(f){if(!c)return;l.hasDragged=!0;let d=f.clientX-r,C=f.clientY-s;const y=window.innerWidth,k=window.innerHeight,N=document.getElementById("vnpt-toggle-btn"),g=N?N.offsetWidth:40,w=N?N.offsetHeight:40,h=e.id==="vnpt-docx-widget";let x=e.offsetWidth||0;if(h){let E=g+6-x,D=y-x+6;d<E&&(d=E),d>D&&(d=D)}else x=x||200,d<0&&(d=0),d+x>y&&(d=Math.max(0,y-x));let S=i;if(h?S=!1:i?f.clientY<k-40&&(S=!1):f.clientY>k-10&&(S=!0),C<0&&(C=0),S)p(!0),e.style.top=k-e.offsetHeight+"px",h?(e.style.right=y-d-x+"px",e.style.left="auto"):(e.style.left=d+"px",e.style.right="auto"),e.style.bottom="auto";else{p(!1);let O=e.offsetHeight||40,E;if(h)E=10+w;else{const D=e.querySelector(".cw-title-bar");E=D?D.offsetHeight:O}C+E>k&&(C=Math.max(0,k-E)),e.style.top=C+"px",h?(e.style.right=y-d-x+"px",e.style.left="auto"):(e.style.left=d+"px",e.style.right="auto"),e.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(c&&(c=!1,document.body.style.userSelect="",t&&t.forEach(f=>f.style.cursor="grab"),n)){const f=e.id==="vnpt-docx-widget";localStorage.setItem(n,JSON.stringify({left:f?void 0:e.style.left,right:f?e.style.right:void 0,top:e.style.top,x:f?void 0:parseFloat(e.style.left),y:parseFloat(e.style.top),docked:i}))}}),{isDocked:()=>i,setDocked:p}}function et(){l.widget&&l.header&&l.toggleBtn&&(He(l.widget,[l.header,l.toggleBtn],Te),window.addEventListener("resize",()=>{const e=window.innerWidth,t=window.innerHeight,n=document.getElementById("vnpt-toggle-btn"),o=n?n.offsetWidth:40,a=n?n.offsetHeight:40;let c=l.widget.getBoundingClientRect(),r=c.left,s=c.top,i=l.widget.offsetWidth||0,u=o+6-i,f=e-i+6;r<u&&(r=u),r>f&&(r=f),s+10+a>t&&(s=Math.max(0,t-(10+a))),l.widget.style.right=e-r-i+"px",l.widget.style.top=s+"px"}))}function tt(e){const t=e.toLowerCase(),n=new Date;return{ngayky:String(n.getDate()).padStart(2,"0"),thangky:String(n.getMonth()+1).padStart(2,"0"),thangky1:String(n.getMonth()+1).padStart(2,"0"),namky:String(n.getFullYear()),namky1:String(n.getFullYear()),soluonggoi:"1"}[t]||""}function nt(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){let e=0;Object.keys(H).forEach(t=>{var a;const n=document.getElementById(t);let o="";n&&(o=n.tagName.toLowerCase()==="select"?((a=n.options[n.selectedIndex])==null?void 0:a.text)||"":n.value,e++),o||(o=tt(t)),M(t,o,null)}),_(),e>0?(this.style.background="#34a853",this.style.color="#fff",this.innerText="Done",setTimeout(()=>{this.style.background="#fbbc04",this.style.color="#000",this.innerText="Quét"},1e3)):L("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(e){e.target&&e.target.id&&H[e.target.id]!==void 0&&(M(e.target.id,e.target.value,null),_())}),document.addEventListener("change",function(e){var t;if(e.target&&e.target.id&&H[e.target.id]!==void 0){let n=e.target.tagName.toLowerCase()==="select"?((t=e.target.options[e.target.selectedIndex])==null?void 0:t.text)||"":e.target.value;M(e.target.id,n,null),_()}})}function Me(e,t,n){try{let o;try{o=new window.PizZip(e)}catch(i){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(i);return}const a=new window.docxtemplater(o,{paragraphLoop:!0,linebreaks:!0});a.render(t);const c=a.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),r=URL.createObjectURL(c),s=document.createElement("a");s.href=r,s.download=n,document.body.appendChild(s),s.click(),setTimeout(()=>{document.body.removeChild(s),URL.revokeObjectURL(r)},100)}catch(o){let a=o.message;o.properties&&o.properties.errors instanceof Array?a=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+o.properties.errors.map(r=>"- "+(r.properties.explanation||r.message)).join(`
`):a="Lỗi phần mềm Word sinh ra: "+a,alert(a),console.error("DocX Error:",o)}}function ot(){const e=document.getElementById("vnpt-export-filename");e&&e.addEventListener("input",()=>{e.dataset.userEdited="1",e.value.trim()||(e.dataset.userEdited="0")});function t(){if(!e||e.dataset.userEdited==="1")return;let n="";if(l.fieldsContainer&&l.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(i=>{const u=i.querySelector(".f-key").value.trim().split(",")[0].trim(),f=i.querySelector(".f-val").value.trim();u==="tenToChuc"&&(n=f)}),!n){const s=document.getElementById("tenToChuc");s&&(n=s.tagName.toLowerCase()==="textarea"||s.tagName.toLowerCase()==="input"?s.value.trim():s.innerText.trim())}function o(s){if(!s)return"";let i=s;return i=i.replace(/Tổng công ty/gi,""),i=i.replace(/Công ty/gi,""),i=i.replace(/\bCty\b/gi,""),i=i.replace(/Trách nhiệm hữu hạn/gi,""),i=i.replace(/\bTNHH\b/gi,""),i=i.replace(/Cổ phần/gi,""),i=i.replace(/\bCP\b/gi,""),i=i.replace(/Một thành viên/gi,""),i=i.replace(/\bMTV\b/gi,""),i=i.replace(/Chi nhánh/gi,""),i=i.replace(/Việt Nam/gi,"VN"),i=i.replace(/Viet Nam/gi,"VN"),i=i.replace(/\s+/g," ").trim(),i=i.replace(/^[-,\s]+|[-,\s]+$/g,""),i.length>50&&(i=i.substring(0,47)+"..."),i.replace(/[<>:"/\\|?*]/g,"")}let a=o(n),c=l.templateName?l.templateName.replace(/\.docx$/i,""):"",r=[];a&&r.push(a),c&&r.push(c),r.length>0?e.value=r.join(" - ")+".docx":e.value||(e.value="HopDong_Auto.docx")}setInterval(t,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const n={};if(l.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(r=>{const i=r.querySelector(".f-key").value.trim().split(",")[0].trim(),p=r.querySelector(".f-val").value;i&&(n[i]=p)}),Object.keys(n).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}let a=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(a.toLowerCase().endsWith(".docx")||(a+=".docx"),l.templateBuffer){Me(l.templateBuffer,n,a);return}const c=document.getElementById("vnpt-template-file");if(c.files&&c.files.length>0){Ie.download("local",c.files[0],{type:"arraybuffer"}).then(r=>Me(r,n,a)).catch(r=>alert(`Lỗi đọc file: ${r.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')})}function at(){function e(){const o=document.getElementById("chucVu");o&&!o.dataset.filled&&(o.dataset.filled="1",F(o,"Giám Đốc"));const a=document.getElementById("noiCap");a&&!a.dataset.filled&&(a.dataset.filled="1",F(a,"Cục trưởng Cục Cảnh sát QLHC về TTXH"));const c=document.getElementById("noiCapSoDkdn");c&&!c.dataset.filled&&(c.dataset.filled="1",F(c,""));const r=document.getElementById("duong"),s=document.getElementById("diaChiTruSoDuong");r&&s&&!r.dataset.bound&&(r.dataset.bound="1",r.addEventListener("input",()=>F(s,r.value)));const i=document.getElementById("sdt"),p=document.getElementById("sdtToChuc");i&&p&&!i.dataset.bound&&(i.dataset.bound="1",i.addEventListener("input",()=>F(p,i.value)));const u=document.getElementById("emailDaiDien"),f=document.getElementById("emailCongTy");u&&f&&!u.dataset.bound&&(u.dataset.bound="1",u.addEventListener("input",()=>F(f,u.value)));const d=document.getElementById("soDkdn"),C=document.getElementById("maSoThue");d&&C&&!d.dataset.bound&&(d.dataset.bound="1",d.addEventListener("input",()=>F(C,d.value)))}let t;new MutationObserver(()=>{clearTimeout(t),t=setTimeout(e,200)}).observe(document.body,{childList:!0,subtree:!0}),e()}function I(e){return e.toLocaleString("en-US")}function q(e){return Number(String(e).replace(/[^\d]/g,""))||0}function Oe(e){return e.charAt(0).toUpperCase()+e.slice(1)}const re=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function it(e){let t=Math.floor(e/100),n=Math.floor(e%100/10),o=e%10,a="";return t>0&&(a+=re[t]+" trăm ",n===0&&o>0&&(a+="lẻ ")),n>1?(a+=re[n]+" mươi ",o===1?a+="mốt":o===5?a+="lăm":o>0&&(a+=re[o])):n===1?(a+="mười ",o===5?a+="lăm":o>0&&(a+=re[o])):o>0&&(t>0&&(a+="lẻ "),a+=re[o]),a.trim()}function _e(e){if(e===0)return"không";const t=["","nghìn","triệu","tỷ"];let n="",o=0;for(;e>0;){const a=e%1e3;a>0&&(n=it(a)+" "+t[o]+" "+n),e=Math.floor(e/1e3),o++}return n.trim()}function U(e,t=null){try{const n=localStorage.getItem(e);return n!==null?JSON.parse(n):t}catch{return t}}function A(e,t){localStorage.setItem(e,JSON.stringify(t))}let j=U(te)??{...ie},Y=U(G)??{},le=U(R)??{},T=U(ne)??"custom";function rt(){j=U(te)??{...ie},Y=U(G)??{};const e={...j,...Y};let t="";for(let n of Ae){const o=de(n)||pe(n);if(o&&o.value){t=o.value;break}}t&&Ae.forEach(n=>V(n,t)),Object.keys(e).forEach(n=>{let o=de(n)||pe(n);o&&F(o,e[n])}),L("✅ Auto fill complete")}function lt(){let e=U(R)??{};const t=Object.keys(e);if(t.length===0){L("⚠️ No sync mapping","#ffc107");return}t.forEach(n=>{let o=de(n)||pe(n);o&&o.value!==void 0&&o.value!==""&&e[n].split(",").map(c=>c.trim()).filter(c=>c).forEach(c=>V(c,o.value))}),L("✅ Sync form complete","#d39e00")}function ct(e,t,n,o){const a=document.createElement("div");a.className="cw-tab-header";const c=document.createElement("div");c.innerText="📋 Custom",c.className="cw-tab cw-tab-custom";const r=document.createElement("div");r.innerText="🔗 Sync",r.className="cw-tab cw-tab-sync";const s=document.createElement("div");s.innerText="📌 Default",s.className="cw-tab cw-tab-default";function i(){c.classList.remove("active"),s.classList.remove("active"),r.classList.remove("active"),T==="custom"?c.classList.add("active"):T==="default"?s.classList.add("active"):r.classList.add("active")}i(),a.appendChild(c),a.appendChild(s),a.appendChild(r);const p=document.createElement("div");p.style.display=o.data?"none":"block";const u=t("📋 Cấu hình Data","data",g=>{p.style.display=g?"none":"block",n(e)}),f=document.createElement("button");f.innerText="📥",f.title="Import JSON";const d=document.createElement("button");d.innerText="📤",d.title="Export JSON",[f,d].forEach(g=>g.className="cw-icon-btn");const C=u.querySelector(".wg-toggle-btn"),y=document.createElement("div");y.className="cw-right-wrap",y.appendChild(f),y.appendChild(d),y.appendChild(C),u.appendChild(y);const k=document.createElement("div");k.className="cw-data-body",p.appendChild(a),p.appendChild(k),e.appendChild(u),e.appendChild(p);function N(){k.innerHTML="";let g=T==="sync"?le:T==="custom"?Y:j;const w=Object.keys(g);if(w.length===0&&(T==="custom"||T==="sync")){k.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>';return}w.forEach(x=>{const S=document.createElement("div");S.className="cw-data-row";let O=T==="custom"||T==="sync";const E=document.createElement("input");E.type="text",E.value=x,E.title=x,E.className="cw-data-key"+(O?" mutable":""),E.readOnly=!O,O&&(E.onchange=()=>{const B=E.value.trim();if(!B||B===x){E.value=x;return}if(g.hasOwnProperty(B)){alert(`Nhãn "${B}" đã tồn tại!`),E.value=x;return}g[B]=g[x],delete g[x],A(T==="sync"?R:G,g),N()});const D=document.createElement("input");if(D.type="text",D.value=g[x]??"",D.className="cw-data-val",D.oninput=()=>{g[x]=D.value,A(T==="sync"?R:T==="custom"?G:te,g)},T==="sync"&&(D.placeholder="Các nhãn đích..."),S.appendChild(E),S.appendChild(D),T==="custom"||T==="sync"){const B=document.createElement("button");B.innerHTML="✕",B.className="cw-del-btn",B.onclick=()=>{confirm(`Delete "${x}"?`)&&(delete g[x],T==="custom"&&A(G,g),T==="sync"&&A(R,g),N())},S.appendChild(B)}else{const B=document.createElement("div");B.className="cw-pad",S.appendChild(B)}k.appendChild(S)});const h=document.createElement("div");h.className="cw-data-hint",h.innerText=`${w.length} fields · auto-saved`,k.appendChild(h)}N(),c.onclick=()=>{T="custom",A(ne,"custom"),i(),N()},s.onclick=()=>{T="default",A(ne,"default"),i(),N()},r.onclick=()=>{T="sync",A(ne,"sync"),i(),N()},d.onclick=()=>{const g={defaultData:j,customData:Y,syncData:le},w=new Blob([JSON.stringify(g,null,2)],{type:"application/json"}),h=URL.createObjectURL(w),x=document.createElement("a");x.href=h,x.download=`vnpt_data_${Date.now()}.json`,x.click(),URL.revokeObjectURL(h)},f.onclick=()=>{const g=document.createElement("input");g.type="file",g.accept=".json",g.onchange=async w=>{const h=w.target.files[0];if(h)try{const x=await Ie.download("local",h,{type:"text"}),S=JSON.parse(x);S.defaultData&&(j=S.defaultData,A(te,j)),S.customData&&(Y=S.customData,A(G,Y)),S.syncData&&(le=S.syncData,A(R,le)),N(),L("✅ Import successful!")}catch{alert("Invalid JSON file format or error reading file!")}},g.click()},e.querySelector("#vnpt-cw-fill").onclick=rt,e.querySelector("#vnpt-cw-sync").onclick=lt,e.querySelector("#vnpt-cw-add").onclick=()=>{T==="default"&&(T="custom",A(ne,"custom"),i());let g=T==="sync"?le:Y,w=1,h="new_field";for(;g.hasOwnProperty(h);)h="new_field_"+w,w++;g[h]="",A(T==="sync"?R:G,g),o.data&&(o.data=!1,A(he,o),p.style.display="block",u.querySelector(".wg-toggle-btn").innerText="▴"),N(),k.scrollTop=k.scrollHeight},e.querySelector("#vnpt-cw-reset").onclick=()=>{confirm("Reset [Default Data] to hardcoded values?")&&(j={...ie},A(te,j),T==="default"&&N(),L("Reset complete","#17a2b8"))}}let we=!1;document.addEventListener("input",e=>{var s,i,p;if(we||!e.target||!["INPUT","TEXTAREA"].includes(e.target.tagName))return;let t=U(R)??{};if(Object.keys(t).length===0)return;let n=e.target.id,o=e.target.name,a=null,c=null;if(n){const u=document.querySelector(`label[for="${n}"]`);u&&(a=u.textContent.trim(),c=(s=u.innerText)==null?void 0:s.trim())}if(!a){const u=e.target.closest("label");u&&(a=(i=Array.from(u.childNodes).find(f=>f.nodeType===3))==null?void 0:i.textContent.trim(),c=(p=u.innerText)==null?void 0:p.trim())}let r=t[n]||t[o]||t[a]||t[c];if(r){we=!0;try{const u=e.target.value;r.split(",").map(d=>d.trim()).filter(d=>d).forEach(d=>{d!==n&&d!==o&&d!==a&&d!==c&&V(d,u)})}finally{we=!1}}});function ce(e,t=null){try{const n=localStorage.getItem(e);return n!==null?JSON.parse(n):t}catch{return t}}function Ee(e,t){localStorage.setItem(e,JSON.stringify(t))}let J=Number(localStorage.getItem(Le))||.08,$=ce(he)??{calc:!1,data:!0};function ee(e,t){if(!t||t.replace(/\D/g,"").length<6)return;let n=ce(e,[]);n=n.filter(o=>o!==t),n.unshift(t),Ee(e,n.slice(0,10))}function W(e,t){const n=document.getElementById(t);n&&(n.innerHTML=ce(e,[]).map(o=>`<option value="${o}">`).join(""))}function ze(e){const t=window.innerWidth,n=window.innerHeight,o=e.getBoundingClientRect();e.style.left=Math.min(Math.max(parseFloat(e.style.left),0),t-o.width)+"px",e.style.top=Math.min(Math.max(parseFloat(e.style.top),0),n-36)+"px"}function st(e,t,n){const o=document.createElement("div");o.className="wg-sec-header";const a=document.createElement("span");a.innerText=e;const c=document.createElement("button");return c.className="wg-toggle-btn",c.innerText=$[t]?"▾":"▴",o.appendChild(a),o.appendChild(c),c.onclick=()=>{$[t]=!$[t],c.innerText=$[t]?"▾":"▴",Ee(he,$),n($[t])},o}function dt(){const e=document.createElement("div");e.id="vnpt-calc-widget";const t=ce(Se),n=!!(t&&t.docked);Object.assign(e.style,{top:t&&t.y?t.y+"px":"16px",left:t&&t.x?t.x+"px":window.innerWidth-236+"px"});function o(m,v){const b=document.createElement("button");return b.innerText=m,b.className="cw-action-btn "+v,b}const a=o("Fill","cw-btn-fill");a.id="vnpt-cw-fill";const c=o("Sync","cw-btn-sync");c.id="vnpt-cw-sync",c.title="Manual trigger for Sync Mapping";const r=o("Add","cw-btn-add");r.id="vnpt-cw-add";const s=o("↺","cw-btn-reset");s.id="vnpt-cw-reset",s.title="Reset Default fields back to original";const i=document.createElement("div");i.className="cw-btn-group",i.appendChild(a),i.appendChild(c),i.appendChild(r),i.appendChild(s);const p=document.createElement("div");p.className="cw-title-bar";const u=document.createElement("span");u.className="cw-title-label",u.innerHTML="VNPT Fast",p.appendChild(u),p.appendChild(i),e.appendChild(p),$.calc=!1;const f=document.createElement("div");f.className="cw-body-inline",f.innerHTML=`
    <div class="cw-inline-row">
        <input id="wg-before" class="cw-input-inline" placeholder="Trước thuế" list="wg-before-list" title="Trước thuế (Click/Focus để Copy)">
        <datalist id="wg-before-list"></datalist>
        
        <div class="cw-tax-group-inline">
            <input id="wg-taxRate" class="cw-tax-input-inline" title="Thuế (%)">
            <span class="cw-tax-symbol">%</span>
        </div>
        
        <input id="wg-tax" class="cw-input-inline" placeholder="Tiền thuế" title="Tiền thuế (Click/Focus để Copy)">
        
        <input id="wg-after" class="cw-input-inline" placeholder="Sau thuế" list="wg-after-list" title="Sau thuế (Click/Focus để Copy)">
        <datalist id="wg-after-list"></datalist>
        
        <input id="wg-text" class="cw-input-inline cw-input-readonly-inline" placeholder="Bằng chữ" readonly title="Bằng chữ (Click/Focus để Copy)">

        <div class="cw-map-dropdown-container">
            <button id="wg-calc-map-btn" class="cw-map-btn-inline" title="Cấu hình Gán trường thông tin tự điền">⚙️</button>
            <div id="wg-calc-map-wrap" class="cw-map-wrap-popup" style="display:none;">
                <div class="cw-row"><span class="cw-map-label">Trước thuế</span><input data-clink="before" class="cw-map-input" placeholder="Ví dụ: tongThanhTien"></div>
                <div class="cw-row"><span class="cw-map-label">Tiền thuế</span><input data-clink="tax" class="cw-map-input" placeholder="Ví dụ: thueCA"></div>
                <div class="cw-row"><span class="cw-map-label">Sau thuế</span><input data-clink="after" class="cw-map-input" placeholder="Ví dụ: tongCongHD"></div>
                <div class="cw-row"><span class="cw-map-label">Bằng chữ</span><input data-clink="text" class="cw-map-input" placeholder="Ví dụ: tongCongHDbangChu"></div>
                <div class="cw-map-hint">Các id/nhãn trên trang cách nhau bởi dấu phẩy. Sẽ được Auto-save.</div>
            </div>
        </div>
    </div>
    `;const d=document.getElementById("vnpt-inline-calc");d?d.appendChild(f):e.appendChild(f),document.body.appendChild(e),l.calcWidget=e,ct(e,st,ze,$);const C=Array.from(e.children).filter(m=>m!==p);function y(m){C.forEach(v=>{v.style.display=m?"none":""}),p.style.borderRadius=m?"8px":"0",e.style.borderRadius=m?"8px":"10px",e.style.boxShadow=m?"0 -3px 16px rgba(25,135,84,0.55)":"0 4px 24px rgba(0,0,0,.3)",m&&(e.style.top=window.innerHeight-(p.offsetHeight||34)+"px")}const k=He(e,[p],Se,null,m=>{y(m)});n&&k.setDocked(!0),window.addEventListener("resize",()=>{k.isDocked()?e.style.top=window.innerHeight-p.offsetHeight+"px":ze(e)});const N=document.getElementById("wg-taxRate"),g=document.getElementById("wg-before"),w=document.getElementById("wg-tax"),h=document.getElementById("wg-after"),x=document.getElementById("wg-text"),S=document.getElementById("wg-calc-map-btn"),O=document.getElementById("wg-calc-map-wrap");let E=ce(De)??{};S.onclick=m=>{const v=O.style.display==="flex";if(O.style.display=v?"none":"flex",!v){const b=Q=>{!O.contains(Q.target)&&Q.target!==S&&(O.style.display="none",document.removeEventListener("click",b))};setTimeout(()=>document.addEventListener("click",b),0)}},e.querySelectorAll("input[data-clink]").forEach(m=>{const v=m.dataset.clink;m.value=(E[v]||[]).join(", "),m.addEventListener("input",()=>{E[v]=m.value.split(",").map(b=>b.trim()).filter(b=>b),Ee(De,E)})}),N.value=J*100,W(z,"wg-before-list"),W(K,"wg-after-list");function D(m,v,b){const Q=Oe(_e(b))+" đồng";x.value=Q,(E.before||[]).forEach(Z=>V(Z,I(m))),(E.tax||[]).forEach(Z=>V(Z,I(v))),(E.after||[]).forEach(Z=>V(Z,I(b))),(E.text||[]).forEach(Z=>V(Z,Q))}function B(){const m=q(g.value),v=Math.round(m*J),b=m+v;w.value=I(v),h.value=I(b),D(m,v,b)}function Ke(){const m=q(w.value),v=Math.round(m/J),b=v+m;g.value=I(v),h.value=I(b),D(v,m,b)}function Fe(){const m=q(h.value),v=Math.round(m/(1+J)),b=m-v;g.value=I(v),w.value=I(b),D(v,b,m)}N.addEventListener("input",()=>{J=Number(N.value)/100||0,localStorage.setItem(Le,J),B()}),g.addEventListener("input",()=>{const m=q(g.value),v=Math.round(m*J),b=m+v;w.value=I(v),h.value=I(b),x.value=Oe(_e(b))+" đồng"}),g.addEventListener("blur",()=>{g.value=I(q(g.value)),ee(z,g.value),W(z,"wg-before-list")}),g.addEventListener("change",()=>{g.value=I(q(g.value)),ee(z,g.value),W(z,"wg-before-list"),B()}),w.addEventListener("input",Ke),h.addEventListener("input",Fe),h.addEventListener("blur",()=>{h.value=I(q(h.value)),ee(K,h.value),W(K,"wg-after-list")}),h.addEventListener("change",()=>{h.value=I(q(h.value)),ee(K,h.value),W(K,"wg-after-list"),Fe()}),[{el:g,key:z},{el:w,key:null},{el:h,key:K},{el:x,key:null}].forEach(m=>{m.el&&["click","focus"].forEach(v=>{m.el.addEventListener(v,b=>{if(b.target.value){navigator.clipboard.writeText(b.target.value),m.key===z&&(ee(z,b.target.value),W(z,"wg-before-list")),m.key===K&&(ee(K,b.target.value),W(K,"wg-after-list"));const Q=b.target.style.backgroundColor;b.target.style.backgroundColor="#d1e7dd",setTimeout(()=>b.target.style.backgroundColor=Q,300)}})})})}function Ce(){if(!window.__vnptInited){window.__vnptInited=!0,ge.info("Initializing VNPT Userscript (DEV)...");try{Ve(),Ze(),et(),Je(),ve(),nt(),ot(),at(),dt(),ge.info("Userscript initialized successfully.")}catch(e){ge.error("Error during userscript initialization:",e)}}}window.__vnptInit=Ce,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Ce):Ce()})();
