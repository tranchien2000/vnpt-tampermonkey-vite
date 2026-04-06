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
(function(){"use strict";const ge={info:(...e)=>console.log("[Tampermonkey Script] INFO:",...e),error:(...e)=>console.error("[Tampermonkey Script] ERROR:",...e),warn:(...e)=>console.warn("[Tampermonkey Script] WARN:",...e)};function Pe(){GM_addStyle(`
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
        #vnpt-fields-container { flex: 1; max-height: unset; overflow-y: auto; background: #f8f9fa; border: 1px solid #dadce0; border-radius: 6px; padding: 4px; margin-bottom: 4px;}
        .vnpt-field-row { display: flex; gap: 2px; margin-bottom: 2px; align-items: center; }
        .row-drag-handle { cursor: grab; padding: 0 4px; font-size: 16px; font-weight: bold; color: #aaa; user-select: none; }
        .row-drag-handle:active { cursor: grabbing; }
        .vnpt-field-row.dragging { opacity: 0.4; }
        .vnpt-field-row.over { background-color: #e3f2fd; border-radius: 4px; }
        .vnpt-field-row input { flex: 1; padding: 5px; border: 1px solid #ccc; border-radius: 4px; font-size: 11px; }
        .vnpt-field-row input.row-chk { flex: 0 0 auto; width: auto; height: auto; margin: 0 4px 0 0; padding: 0; cursor: pointer; }
        .vnpt-field-row input.f-label { flex: 0.35; color: #0056b3; font-weight: bold;}
        .vnpt-field-row input.f-key { display: none; flex: 0.3; font-weight: bold; color: #d63384;}
        .vnpt-field-row input.f-sync { display: none; flex: 0.15; color: #d39e00; font-weight: bold; text-align: center; }
        .show-ids .vnpt-field-row input.f-key, .show-ids .vnpt-field-row input.f-sync { display: block; }
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
    `)}const c={widget:null,panel:null,header:null,toggleBtn:null,fieldsContainer:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1},ee={tenDaiDienn:"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT",emailDaiDien:"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Số GPKD | MST",goiDV:"Gói Dịch Vụ",ngayKy:"Ngày ký",thangKy:"Tháng Ký",namKy:"Năm ký",soHopDong:"Số Hợp đồng",soLuongGoi:"Số Lượng Gói"},Ce="vnpt_docx_fields",ke="vnpt_docx_position",Te="vnpt_docx_size",he="vnpt_docx_opened",te="vnpt_autofill_data_default",W="vnpt_autofill_data_custom",F="vnpt_autofill_data_sync",Ne="vnpt_widget_pos",Se="vnd_tax_rate",O="vnd_before_history",_="vnd_after_history",me="vnpt_widget_collapsed",Le="vnd_calc_map",ne="vnpt_widget_datatab",Be="vnpt_templates";function L(e,t="#198754"){const n=document.createElement("div");n.innerText=e,Object.assign(n.style,{position:"fixed",bottom:"20px",left:"50%",transform:"translateX(-50%)",background:t,color:"#fff",padding:"7px 16px",borderRadius:"20px",zIndex:"100000",opacity:"0",transition:"opacity .25s",fontSize:"13px",fontFamily:"'Segoe UI',sans-serif",boxShadow:"0 4px 14px rgba(0,0,0,.25)"}),document.body.appendChild(n),setTimeout(()=>n.style.opacity="1",30),setTimeout(()=>{n.style.opacity="0",setTimeout(()=>n.remove(),280)},2200)}const Re={local:{download(e,t="arraybuffer"){return new Promise((n,o)=>{const a=new FileReader;switch(a.onload=l=>{let r=l.target.result;t==="base64"&&typeof r=="string"&&(r=r.split(",")[1]||r),n(r)},a.onerror=l=>o(l),t.toLowerCase()){case"arraybuffer":a.readAsArrayBuffer(e);break;case"base64":case"dataurl":a.readAsDataURL(e);break;case"text":a.readAsText(e);break;default:o(new Error(`Unsupported read type: ${t}`))}})},async upload(e){return this.download(e,"base64")}}},De={getAdapter(e){const t=Re[e];if(!t)throw new Error(`Storage adapter not found: ${e}`);return t},async upload(e,t,n={}){return await this.getAdapter(e).upload(t,n)},async download(e,t,n={}){return await this.getAdapter(e).download(t,n.type||"arraybuffer")}},qe="vnpt_templates_db",P="buffers";let se=null;function be(){return se?Promise.resolve(se):new Promise((e,t)=>{const n=indexedDB.open(qe,1);n.onupgradeneeded=o=>{const a=o.target.result;a.objectStoreNames.contains(P)||a.createObjectStore(P)},n.onsuccess=o=>{se=o.target.result,e(se)},n.onerror=()=>t(n.error)})}async function Ke(e,t){const n=await be();return new Promise((o,a)=>{const s=n.transaction(P,"readwrite").objectStore(P).put(t,e);s.onsuccess=()=>o(),s.onerror=()=>a(s.error)})}async function Ue(e){const t=await be();return new Promise((n,o)=>{const r=t.transaction(P,"readonly").objectStore(P).get(e);r.onsuccess=()=>n(r.result),r.onerror=()=>o(r.error)})}async function $e(e){const t=await be();return new Promise((n,o)=>{const r=t.transaction(P,"readwrite").objectStore(P).delete(e);r.onsuccess=()=>n(),r.onerror=()=>o(r.error)})}function oe(){try{const e=JSON.parse(localStorage.getItem(Be))||[],t=e.filter(n=>n.type!=="local");return t.length!==e.length&&ae(t),t}catch{return[]}}function ae(e){localStorage.setItem(Be,JSON.stringify(e))}function We(e){const t=e.match(/drive\.google\.com\/file\/d\/([^/]+)/);return t?`https://drive.google.com/uc?export=download&id=${t[1]}`:e}function je(e){return new Promise((t,n)=>{GM_xmlhttpRequest({method:"GET",url:We(e),responseType:"arraybuffer",onload:o=>{if(o.status>=200&&o.status<300){if(o.response&&o.response.byteLength>4){const a=new Uint8Array(o.response.slice(0,4));if(a[0]===80&&a[1]===75&&a[2]===3&&a[3]===4){t(o.response);return}else{n(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}t(o.response)}else n(new Error(`HTTP ${o.status}: Không lấy được file`))},onerror:()=>n(new Error("Không thể tải URL.")),ontimeout:()=>n(new Error("Timeout khi tải URL."))})})}async function Ge(e,t,n){const o=e.name.replace(/\.docx$/i,""),a=prompt("Đặt tên biến nhớ cho file này:",o);if(!(!a||!a.trim()))try{const l=await e.arrayBuffer();await Ke(a.trim(),l);const s=oe().filter(i=>i.name!==a.trim()&&i.fileName!==e.name);s.unshift({name:a.trim(),type:"local_idb",fileName:e.name,lastUsed:Date.now()}),ae(s),j(t,n),n&&n(l,a.trim())}catch(l){L(`❌ Lỗi lưu file: ${l.message}`,"#dc3545")}}function j(e,t,n=null){let o=e.querySelector(".vnpt-template-manager-inner"),a,l;if(o)a=o.querySelector(".vnpt-local-list-container"),l=o.querySelector(".vnpt-btn-wrap");else{e.innerHTML="",o=document.createElement("div"),o.className="vnpt-template-manager-inner";const i=document.createElement("div");i.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const g=document.createElement("span");g.className="vnpt-title-main",g.style.cssText="font-size:11px;font-weight:700;color:#444;",l=document.createElement("div"),l.className="vnpt-btn-wrap",l.style.cssText="display:flex;gap:4px;",i.appendChild(g),i.appendChild(l),o.appendChild(i),a=document.createElement("div"),a.className="vnpt-local-list-container",a.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",o.appendChild(a),e.appendChild(o)}const r=oe(),s=o.querySelector(".vnpt-title-main");s.innerHTML="📁 Bộ nhớ Templates"+(n?` <span style="color:#2e7d32;">(Đang dùng: ${n})</span>`:""),r.length===0?a.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':a.innerHTML="",r.forEach((i,g)=>{const u=document.createElement("div");u.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",u.title=i.fileName||i.url||i.name,u.tabIndex=0,u.onfocus=()=>u.style.boxShadow="0 0 0 2px #28a745",u.onblur=()=>u.style.boxShadow="none";const d=i.type==="local"||i.type==="local_base64"||i.type==="local_idb"?"OFF":"ON",p=d==="OFF"?"#6c757d":"#28a745",C=document.createElement("span");C.textContent=d,C.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${p};color:#fff;`;const S=document.createElement("span");S.textContent=i.name,S.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",u.onclick=()=>{u.focus(),Xe(i,t,n,e)},u.appendChild(C),u.appendChild(S);const k=document.createElement("button");k.innerHTML="✎",k.title="Đổi tên template",k.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",k.onclick=f=>{f.stopPropagation();const v=prompt("Đổi tên template:",i.name);if(v&&v.trim()&&v.trim()!==i.name){const m=oe();m[g].name=v.trim(),ae(m),j(e,t,n)}},u.appendChild(k);const T=document.createElement("button");T.innerHTML="✕",T.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",T.onclick=async f=>{if(f.stopPropagation(),confirm(`Xoá biểu mẫu "${i.name}"?`)){const v=oe();v.splice(g,1),ae(v),i.type==="local_idb"&&await $e(i.name).catch(()=>null),j(e,t,n===i.name?null:n)}},u.appendChild(T),a.appendChild(u)})}function Xe(e,t,n,o){const a=oe(),l=a.find(r=>r.name===e.name&&(r.url===e.url||r.type===e.type));if(l&&(l.lastUsed=Date.now(),ae(a)),e.type==="local_idb"){Ue(e.name).then(r=>{if(!r)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");t&&t(r,e.name),j(o,t,e.name)}).catch(r=>{L(`❌ Lỗi nạp File IDB: ${r.message}`,"#dc3545")});return}if(e.type==="local_base64"&&e.data){try{const r=window.atob(e.data.split(",")[1]),s=r.length,i=new Uint8Array(s);for(let g=0;g<s;g++)i[g]=r.charCodeAt(g);t&&t(i.buffer,e.name),j(o,t,e.name)}catch(r){L(`❌ Lỗi nạp Base64: ${r.message}`,"#dc3545")}return}je(e.url).then(r=>{t&&t(r,e.name),j(o,t,e.name)}).catch(r=>{L(`❌ ${r.message}`,"#dc3545")})}function Je(e){e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function z(e,t){var a;if(!e||e.disabled||e.readOnly)return;const n=e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,o=(a=Object.getOwnPropertyDescriptor(n,"value"))==null?void 0:a.set;o?o.call(e,t):e.value=t,Je(e)}function de(e){const t=document.getElementById(e);if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"))return t;for(const n of document.querySelectorAll("label"))if(n.textContent.trim()===e){if(n.htmlFor){const a=document.getElementById(n.htmlFor);if(a)return a}let o=n.parentElement;for(;o;){const a=o.querySelector("input,textarea");if(a)return a;if(o=o.parentElement,(o==null?void 0:o.tagName)==="FORM")break}}return null}function pe(e){for(const t of document.querySelectorAll("label"))if(t.innerText.trim()===e)return t.parentElement.querySelector("input, textarea");return null}function V(e,t){const n=de(e)||pe(e);n&&z(n,t)}const ye=new Date,xe=String(ye.getDate()).padStart(2,"0"),ue=String(ye.getMonth()+1).padStart(2,"0"),fe=String(ye.getFullYear()),ie={ngayKy:xe,thangKy:ue,namKy:fe,ngayTiepNhan:`${xe}/${ue}/${fe}`,ngayThangNamKy:`${xe}/${ue}/${fe}`,thangKy1:ue,namKy1:fe,tenDoanhNghiepB:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM",diaChiB:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội",maSoThueB:"0100686223",stkB:"1600114156",diaChiStkB:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)",tenB:"Phạm Khánh Chung",nguoiDaiDienB:"Phạm Khánh Chung",chucVuB:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",chucVuDaiDienB:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",giayUyQuyenSoB:"2628/GUQ-VNPT-HNI-VP",soGiayUyQuyenB:"2628/GUQ-VNPT-HNI-VP",giayUyQuyenNgayB:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",ngayGiayUyQuyenB:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",GiayUyQuyenB:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",tenDoanhNghiepB1:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",donViTiepNhan:"TTKD KHDN",tenTiepNhan:"Bùi Anh",tenNguoiNhan:"Bùi Anh",dienThoaiB:"02436686868",diaChiTaiKhoanB:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 ",noiKy:"Hà Nội",emailB:"",lienheHopDongB:"AM Bùi Anh",lienheTuVanB:"AM Bùi Anh",lienheHoaDonB:"AM Bùi Anh",sucoCap1B:"AM Bùi Anh",sucoCap2B:"AM Bùi Anh",sucoCap3B:"AM Bùi Anh",sucoCap4B:"AM Bùi Anh"},Ie=["lienheHopDongA","lienheHoaDonA","lienheTuVanA","sucoCap1A","sucoCap2A","sucoCap3A","sucoCap4A"];function G(e,t,n=null,o=""){const a=c.fieldsContainer.querySelector(".text-hint");a&&a.remove();const l=c.fieldsContainer.querySelectorAll(".f-key");let r=!1;for(let s of l)if(s.value===e){const i=s.closest(".vnpt-field-row"),g=i.querySelector(".f-val"),u=i.querySelector(".f-label"),d=i.querySelector(".f-sync");t!==""&&(g.value=t),n!==null&&n!==""&&(u.value=n),o!==""&&(d.value=o),r=!0;break}if(!r){(n===null||n==="")&&(n=ee[e]||"");const s=document.createElement("div");s.className="vnpt-field-row row-item",s.setAttribute("draggable","false"),s.innerHTML=`
            <input type="checkbox" class="row-chk" title="Chọn để thao tác hàng loạt" style="margin: 0 2px 0 2px;" />
            <input type="text" class="f-label" placeholder="Nhãn..." value="${n}" />
            <input type="text" class="f-key" placeholder="Mã biến" value="${e}" />
            <input type="text" class="f-sync" placeholder="🔗 Đồng bộ" value="${o}" title="Nhập các ID đích trên web, cách nhau bởi dấu phẩy" />
            <span class="row-drag-handle" title="Kéo thả để di chuyển">=</span>
            <input type="text" class="f-val" placeholder="Giá trị" value="${t}" />
        `;const i=s.querySelector(".f-val"),g=s.querySelector(".f-sync");e==="tenToChuc"&&(i.style.textAlign="right"),s.querySelector(".f-key").addEventListener("keyup",function(){H(),i.style.textAlign=this.value.trim()==="tenToChuc"?"right":""}),s.querySelector(".f-label").addEventListener("keyup",H),g.addEventListener("keyup",H),i.addEventListener("keyup",function(){if(c.isDefaultMode&&!this.dataset.warned){if(!confirm("⚠️ Bạn đang chỉnh sửa dữ liệu mặc định. Thay đổi này sẽ không được lưu vào cấu hình cá nhân. Tiếp tục?")){ve();return}this.dataset.warned="true"}H();const d=g.value.split(",").map(p=>p.trim()).filter(p=>p);d.length>0&&d.forEach(p=>V(p,this.value))}),i.addEventListener("focus",function(){c.isDefaultMode&&this.dataset.warned});const u=s.querySelector(".row-drag-handle");u.addEventListener("mouseenter",()=>s.setAttribute("draggable","true")),u.addEventListener("mouseleave",()=>{s.classList.contains("dragging")||s.setAttribute("draggable","false")}),s.addEventListener("dragstart",function(d){c.draggedRowForVNPT=this,d.dataTransfer.effectAllowed="move",d.dataTransfer.setData("text/plain",e),this.classList.add("dragging")}),s.addEventListener("dragover",function(d){return d.preventDefault(),d.dataTransfer.dropEffect="move",!1}),s.addEventListener("dragenter",function(d){this.classList.add("over")}),s.addEventListener("dragleave",function(d){this.classList.remove("over")}),s.addEventListener("drop",function(d){if(d.stopPropagation(),c.draggedRowForVNPT&&c.draggedRowForVNPT!==this){const p=Array.from(c.fieldsContainer.querySelectorAll(".vnpt-field-row")),C=p.indexOf(c.draggedRowForVNPT),S=p.indexOf(this);C<S?this.parentNode.insertBefore(c.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(c.draggedRowForVNPT,this),H()}return!1}),s.addEventListener("dragend",function(d){this.setAttribute("draggable","false"),c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(C=>{C.classList.remove("over"),C.classList.remove("dragging")}),c.draggedRowForVNPT=null}),c.fieldsContainer.appendChild(s),c.fieldsContainer.scrollTop=c.fieldsContainer.scrollHeight}}async function H(){if(c.isDefaultMode)return;const e={};c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(n=>{const o=n.querySelector(".f-key").value.trim(),a=n.querySelector(".f-label").value.trim(),l=n.querySelector(".f-val").value,r=n.querySelector(".f-sync").value.trim();o&&(e[o]={label:a,value:l,sync:r})}),localStorage.setItem(Ce,JSON.stringify(e))}async function ve(){try{const e=JSON.parse(localStorage.getItem(Ce));if(e&&Object.keys(e).length>0){c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(t=>t.remove());for(const t in e){let n=e[t];typeof n=="object"&&n!==null?G(t,n.value,n.label,n.sync||""):G(t,n,"","")}}}catch(e){console.error("Error loading config:",e)}try{const e=JSON.parse(localStorage.getItem(ke));e&&c.widget&&(c.widget.style.bottom="auto",e.right?(c.widget.style.right=e.right,c.widget.style.left="auto"):e.left&&(c.widget.style.left=e.left,c.widget.style.right="auto"),e.top&&(c.widget.style.top=e.top))}catch{}}function Ye(){document.getElementById("vnpt-btn-toggle-id").addEventListener("click",function(){c.fieldsContainer.classList.toggle("show-ids")}),document.getElementById("vnpt-btn-default").addEventListener("click",Qe),document.getElementById("vnpt-btn-batch-del").addEventListener("click",function(){if(c.isDefaultMode){L("⚠️ Không thể xóa ở chế độ Dữ liệu mặc định","#ffc107");return}const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row");let t=0;e.forEach(n=>{const o=n.querySelector(".row-chk");o&&o.checked&&(n.remove(),t++)}),t===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(e.forEach(n=>n.remove()),L("🗑️ Đã xóa toàn bộ","#ff5252"),H()):(L(`🗑️ Đã xóa ${t} trường`,"#ff5252"),H())}),document.getElementById("vnpt-btn-add").addEventListener("click",function(){if(c.isDefaultMode){L("⚠️ Không thể thêm ở chế độ Dữ liệu mặc định","#ffc107");return}const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;G("bien_moi_"+e,"","",""),H()}),document.getElementById("vnpt-btn-fill-back").addEventListener("click",function(){const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row");let t=0;e.forEach(n=>{const o=n.querySelector(".f-key").value.trim(),a=n.querySelector(".f-val").value;o&&(document.getElementById(o)||document.getElementsByName(o)[0])&&(V(o,a),t++)}),t>0?L(`✅ Đã điền ngược ${t} trường vào web`,"#198754"):L("⚠️ Không có trường nào khớp","#ffc107")})}function Qe(){c.isDefaultMode=!c.isDefaultMode;const e=document.getElementById("vnpt-btn-default");c.fieldsContainer.innerHTML="",c.isDefaultMode?(e.classList.add("active"),L("📌 Đang xem Dữ liệu mặc định","#1e8e3e"),Object.keys(ie).forEach(t=>{G(t,ie[t],ee[t]||"")})):(e.classList.remove("active"),L("📋 Đã quay lại Dữ liệu cá nhân"),ve())}function Ze(){const e=document.createElement("div");e.id="vnpt-docx-widget";const t=localStorage.getItem(he)==="true";e.innerHTML=`
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
    `,document.body.appendChild(e),c.widget=e,c.panel=document.getElementById("vnpt-export-panel"),c.toggleBtn=document.getElementById("vnpt-toggle-btn"),c.header=document.getElementById("vnpt-panel-header"),c.fieldsContainer=document.getElementById("vnpt-fields-container");try{const o=JSON.parse(localStorage.getItem(Te));o&&o.width&&o.height&&(c.panel.style.width=o.width+"px",c.panel.style.height=o.height+"px")}catch(o){console.error("Lỗi load size panel:",o)}new ResizeObserver(o=>{if(c.panel.style.display!=="none")for(let a of o){const{width:l,height:r}=a.contentRect;l>0&&r>0&&localStorage.setItem(Te,JSON.stringify({width:Math.round(l+20),height:Math.round(r+20)}))}}).observe(c.panel),c.panelBody=document.getElementById("vnpt-panel-body"),j(document.getElementById("vnpt-template-manager"),(o,a)=>{c.templateBuffer=o,c.templateName=a}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const o=this.files&&this.files[0];if(!o)return;const a=document.getElementById("vnpt-template-manager");Ge(o,a,(l,r)=>{c.templateBuffer=l,c.templateName=r}),this.value=""}),c.toggleBtn.addEventListener("click",o=>{c.hasDragged||(c.panel.style.display==="none"?(c.panel.style.display="flex",c.toggleBtn.className="btn-opened",c.toggleBtn.innerHTML="✖",localStorage.setItem(he,"true")):(c.panel.style.display="none",c.toggleBtn.className="btn-closed",c.toggleBtn.innerHTML="📄",localStorage.setItem(he,"false")))})}function Ae(e,t,n,o=null,a=null){let l=!1,r=0,s=0,i=!1;function g(d){i!==d&&(i=d,a&&a(d))}function u(d){if(d.button!==0)return;l=!0,c.hasDragged=!1;const p=e.getBoundingClientRect();r=d.clientX-p.left,s=d.clientY-p.top,document.body.style.userSelect="none",t&&t.forEach(C=>C.style.cursor="grabbing"),o&&o(),d.preventDefault()}return t.forEach(d=>{d.addEventListener("mousedown",u)}),document.addEventListener("mousemove",function(d){if(!l)return;c.hasDragged=!0;let p=d.clientX-r,C=d.clientY-s;const S=window.innerWidth,k=window.innerHeight,T=document.getElementById("vnpt-toggle-btn"),f=T?T.offsetWidth:40,v=T?T.offsetHeight:40,m=e.id==="vnpt-docx-widget";let y=e.offsetWidth||0;if(m){let w=f+6-y,B=S-y+6;p<w&&(p=w),p>B&&(p=B)}else y=y||200,p<0&&(p=0),p+y>S&&(p=Math.max(0,S-y));let N=i;if(m?N=!1:i?d.clientY<k-40&&(N=!1):d.clientY>k-10&&(N=!0),C<0&&(C=0),N)g(!0),e.style.top=k-e.offsetHeight+"px",m?(e.style.right=S-p-y+"px",e.style.left="auto"):(e.style.left=p+"px",e.style.right="auto"),e.style.bottom="auto";else{g(!1);let M=e.offsetHeight||40,w;if(m)w=10+v;else{const B=e.querySelector(".cw-title-bar");w=B?B.offsetHeight:M}C+w>k&&(C=Math.max(0,k-w)),e.style.top=C+"px",m?(e.style.right=S-p-y+"px",e.style.left="auto"):(e.style.left=p+"px",e.style.right="auto"),e.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(l&&(l=!1,document.body.style.userSelect="",t&&t.forEach(d=>d.style.cursor="grab"),n)){const d=e.id==="vnpt-docx-widget";localStorage.setItem(n,JSON.stringify({left:d?void 0:e.style.left,right:d?e.style.right:void 0,top:e.style.top,x:d?void 0:parseFloat(e.style.left),y:parseFloat(e.style.top),docked:i}))}}),{isDocked:()=>i,setDocked:g}}function et(){c.widget&&c.header&&c.toggleBtn&&(Ae(c.widget,[c.header,c.toggleBtn],ke),window.addEventListener("resize",()=>{const e=window.innerWidth,t=window.innerHeight,n=document.getElementById("vnpt-toggle-btn"),o=n?n.offsetWidth:40,a=n?n.offsetHeight:40;let l=c.widget.getBoundingClientRect(),r=l.left,s=l.top,i=c.widget.offsetWidth||0,u=o+6-i,d=e-i+6;r<u&&(r=u),r>d&&(r=d),s+10+a>t&&(s=Math.max(0,t-(10+a))),c.widget.style.right=e-r-i+"px",c.widget.style.top=s+"px"}))}function tt(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){let e=0;Object.keys(ee).forEach(t=>{var a;const n=document.getElementById(t);let o="";if(n&&(o=n.tagName.toLowerCase()==="select"?((a=n.options[n.selectedIndex])==null?void 0:a.text)||"":n.value,e++),!o){const l=t.toLowerCase(),r=new Date;l==="ngayky"&&(o=String(r.getDate()).padStart(2,"0")),(l==="thangky"||l==="thangky1")&&(o=String(r.getMonth()+1).padStart(2,"0")),(l==="namky"||l==="namky1")&&(o=String(r.getFullYear())),l==="soluonggoi"&&(o="1")}G(t,o,null)}),H(),e>0?(this.style.background="#34a853",this.style.color="#fff",this.innerText="Done",setTimeout(()=>{this.style.background="#fbbc04",this.style.color="#000",this.innerText="Quét"},1e3)):L("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(e){e.target&&e.target.id&&ee[e.target.id]!==void 0&&(G(e.target.id,e.target.value,null),H())}),document.addEventListener("change",function(e){var t;if(e.target&&e.target.id&&ee[e.target.id]!==void 0){let n=e.target.tagName.toLowerCase()==="select"?((t=e.target.options[e.target.selectedIndex])==null?void 0:t.text)||"":e.target.value;G(e.target.id,n,null),H()}})}function He(e,t,n){try{let o;try{o=new window.PizZip(e)}catch(i){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(i);return}const a=new window.docxtemplater(o,{paragraphLoop:!0,linebreaks:!0});a.render(t);const l=a.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),r=URL.createObjectURL(l),s=document.createElement("a");s.href=r,s.download=n,document.body.appendChild(s),s.click(),setTimeout(()=>{document.body.removeChild(s),URL.revokeObjectURL(r)},100)}catch(o){let a=o.message;o.properties&&o.properties.errors instanceof Array?a=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+o.properties.errors.map(r=>"- "+(r.properties.explanation||r.message)).join(`
`):a="Lỗi phần mềm Word sinh ra: "+a,alert(a),console.error("DocX Error:",o)}}function nt(){const e=document.getElementById("vnpt-export-filename");e&&e.addEventListener("input",()=>{e.dataset.userEdited="1",e.value.trim()||(e.dataset.userEdited="0")});function t(){if(!e||e.dataset.userEdited==="1")return;let n="";if(c.fieldsContainer&&c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(i=>{const g=i.querySelector(".f-key").value.trim(),u=i.querySelector(".f-val").value.trim();g==="tenToChuc"&&(n=u)}),!n){const s=document.getElementById("tenToChuc");s&&(n=s.tagName.toLowerCase()==="textarea"||s.tagName.toLowerCase()==="input"?s.value.trim():s.innerText.trim())}function o(s){if(!s)return"";let i=s;return i=i.replace(/Tổng công ty/gi,""),i=i.replace(/Công ty/gi,""),i=i.replace(/\bCty\b/gi,""),i=i.replace(/Trách nhiệm hữu hạn/gi,""),i=i.replace(/\bTNHH\b/gi,""),i=i.replace(/Cổ phần/gi,""),i=i.replace(/\bCP\b/gi,""),i=i.replace(/Một thành viên/gi,""),i=i.replace(/\bMTV\b/gi,""),i=i.replace(/Chi nhánh/gi,""),i=i.replace(/Việt Nam/gi,"VN"),i=i.replace(/Viet Nam/gi,"VN"),i=i.replace(/\s+/g," ").trim(),i=i.replace(/^[-,\s]+|[-,\s]+$/g,""),i.length>50&&(i=i.substring(0,47)+"..."),i.replace(/[<>:"/\\|?*]/g,"")}let a=o(n),l=c.templateName?c.templateName.replace(/\.docx$/i,""):"",r=[];a&&r.push(a),l&&r.push(l),r.length>0?e.value=r.join(" - ")+".docx":e.value||(e.value="HopDong_Auto.docx")}setInterval(t,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const n={};if(c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(r=>{const s=r.querySelector(".f-key").value.trim(),i=r.querySelector(".f-val").value;s&&(n[s]=i)}),Object.keys(n).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}let a=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(a.toLowerCase().endsWith(".docx")||(a+=".docx"),c.templateBuffer){He(c.templateBuffer,n,a);return}const l=document.getElementById("vnpt-template-file");if(l.files&&l.files.length>0){De.download("local",l.files[0],{type:"arraybuffer"}).then(r=>He(r,n,a)).catch(r=>alert(`Lỗi đọc file: ${r.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')})}function ot(){function e(){const o=document.getElementById("chucVu");o&&!o.dataset.filled&&(o.dataset.filled="1",z(o,"Giám Đốc"));const a=document.getElementById("noiCap");a&&!a.dataset.filled&&(a.dataset.filled="1",z(a,"Cục trưởng Cục Cảnh sát QLHC về TTXH"));const l=document.getElementById("noiCapSoDkdn");l&&!l.dataset.filled&&(l.dataset.filled="1",z(l,""));const r=document.getElementById("duong"),s=document.getElementById("diaChiTruSoDuong");r&&s&&!r.dataset.bound&&(r.dataset.bound="1",r.addEventListener("input",()=>z(s,r.value)));const i=document.getElementById("sdt"),g=document.getElementById("sdtToChuc");i&&g&&!i.dataset.bound&&(i.dataset.bound="1",i.addEventListener("input",()=>z(g,i.value)));const u=document.getElementById("emailDaiDien"),d=document.getElementById("emailCongTy");u&&d&&!u.dataset.bound&&(u.dataset.bound="1",u.addEventListener("input",()=>z(d,u.value)));const p=document.getElementById("soDkdn"),C=document.getElementById("maSoThue");p&&C&&!p.dataset.bound&&(p.dataset.bound="1",p.addEventListener("input",()=>z(C,p.value)))}let t;new MutationObserver(()=>{clearTimeout(t),t=setTimeout(e,200)}).observe(document.body,{childList:!0,subtree:!0}),e()}function I(e){return e.toLocaleString("en-US")}function R(e){return Number(String(e).replace(/[^\d]/g,""))||0}function Me(e){return e.charAt(0).toUpperCase()+e.slice(1)}const re=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function at(e){let t=Math.floor(e/100),n=Math.floor(e%100/10),o=e%10,a="";return t>0&&(a+=re[t]+" trăm ",n===0&&o>0&&(a+="lẻ ")),n>1?(a+=re[n]+" mươi ",o===1?a+="mốt":o===5?a+="lăm":o>0&&(a+=re[o])):n===1?(a+="mười ",o===5?a+="lăm":o>0&&(a+=re[o])):o>0&&(t>0&&(a+="lẻ "),a+=re[o]),a.trim()}function Oe(e){if(e===0)return"không";const t=["","nghìn","triệu","tỷ"];let n="",o=0;for(;e>0;){const a=e%1e3;a>0&&(n=at(a)+" "+t[o]+" "+n),e=Math.floor(e/1e3),o++}return n.trim()}function q(e,t=null){try{const n=localStorage.getItem(e);return n!==null?JSON.parse(n):t}catch{return t}}function A(e,t){localStorage.setItem(e,JSON.stringify(t))}let K=q(te)??{...ie},X=q(W)??{},le=q(F)??{},E=q(ne)??"custom";function it(){K=q(te)??{...ie},X=q(W)??{};const e={...K,...X};let t="";for(let n of Ie){const o=de(n)||pe(n);if(o&&o.value){t=o.value;break}}t&&Ie.forEach(n=>V(n,t)),Object.keys(e).forEach(n=>{let o=de(n)||pe(n);o&&z(o,e[n])}),L("✅ Auto fill complete")}function rt(){let e=q(F)??{};const t=Object.keys(e);if(t.length===0){L("⚠️ No sync mapping","#ffc107");return}t.forEach(n=>{let o=de(n)||pe(n);o&&o.value!==void 0&&o.value!==""&&e[n].split(",").map(l=>l.trim()).filter(l=>l).forEach(l=>V(l,o.value))}),L("✅ Sync form complete","#d39e00")}function lt(e,t,n,o){const a=document.createElement("div");a.className="cw-tab-header";const l=document.createElement("div");l.innerText="📋 Custom",l.className="cw-tab cw-tab-custom";const r=document.createElement("div");r.innerText="🔗 Sync",r.className="cw-tab cw-tab-sync";const s=document.createElement("div");s.innerText="📌 Default",s.className="cw-tab cw-tab-default";function i(){l.classList.remove("active"),s.classList.remove("active"),r.classList.remove("active"),E==="custom"?l.classList.add("active"):E==="default"?s.classList.add("active"):r.classList.add("active")}i(),a.appendChild(l),a.appendChild(s),a.appendChild(r);const g=document.createElement("div");g.style.display=o.data?"none":"block";const u=t("📋 Cấu hình Data","data",f=>{g.style.display=f?"none":"block",n(e)}),d=document.createElement("button");d.innerText="📥",d.title="Import JSON";const p=document.createElement("button");p.innerText="📤",p.title="Export JSON",[d,p].forEach(f=>f.className="cw-icon-btn");const C=u.querySelector(".wg-toggle-btn"),S=document.createElement("div");S.className="cw-right-wrap",S.appendChild(d),S.appendChild(p),S.appendChild(C),u.appendChild(S);const k=document.createElement("div");k.className="cw-data-body",g.appendChild(a),g.appendChild(k),e.appendChild(u),e.appendChild(g);function T(){k.innerHTML="";let f=E==="sync"?le:E==="custom"?X:K;const v=Object.keys(f);if(v.length===0&&(E==="custom"||E==="sync")){k.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>';return}v.forEach(y=>{const N=document.createElement("div");N.className="cw-data-row";let M=E==="custom"||E==="sync";const w=document.createElement("input");w.type="text",w.value=y,w.title=y,w.className="cw-data-key"+(M?" mutable":""),w.readOnly=!M,M&&(w.onchange=()=>{const D=w.value.trim();if(!D||D===y){w.value=y;return}if(f.hasOwnProperty(D)){alert(`Nhãn "${D}" đã tồn tại!`),w.value=y;return}f[D]=f[y],delete f[y],A(E==="sync"?F:W,f),T()});const B=document.createElement("input");if(B.type="text",B.value=f[y]??"",B.className="cw-data-val",B.oninput=()=>{f[y]=B.value,A(E==="sync"?F:E==="custom"?W:te,f)},E==="sync"&&(B.placeholder="Các nhãn đích..."),N.appendChild(w),N.appendChild(B),E==="custom"||E==="sync"){const D=document.createElement("button");D.innerHTML="✕",D.className="cw-del-btn",D.onclick=()=>{confirm(`Delete "${y}"?`)&&(delete f[y],E==="custom"&&A(W,f),E==="sync"&&A(F,f),T())},N.appendChild(D)}else{const D=document.createElement("div");D.className="cw-pad",N.appendChild(D)}k.appendChild(N)});const m=document.createElement("div");m.className="cw-data-hint",m.innerText=`${v.length} fields · auto-saved`,k.appendChild(m)}T(),l.onclick=()=>{E="custom",A(ne,"custom"),i(),T()},s.onclick=()=>{E="default",A(ne,"default"),i(),T()},r.onclick=()=>{E="sync",A(ne,"sync"),i(),T()},p.onclick=()=>{const f={defaultData:K,customData:X,syncData:le},v=new Blob([JSON.stringify(f,null,2)],{type:"application/json"}),m=URL.createObjectURL(v),y=document.createElement("a");y.href=m,y.download=`vnpt_data_${Date.now()}.json`,y.click(),URL.revokeObjectURL(m)},d.onclick=()=>{const f=document.createElement("input");f.type="file",f.accept=".json",f.onchange=async v=>{const m=v.target.files[0];if(m)try{const y=await De.download("local",m,{type:"text"}),N=JSON.parse(y);N.defaultData&&(K=N.defaultData,A(te,K)),N.customData&&(X=N.customData,A(W,X)),N.syncData&&(le=N.syncData,A(F,le)),T(),L("✅ Import successful!")}catch{alert("Invalid JSON file format or error reading file!")}},f.click()},e.querySelector("#vnpt-cw-fill").onclick=it,e.querySelector("#vnpt-cw-sync").onclick=rt,e.querySelector("#vnpt-cw-add").onclick=()=>{E==="default"&&(E="custom",A(ne,"custom"),i());let f=E==="sync"?le:X,v=1,m="new_field";for(;f.hasOwnProperty(m);)m="new_field_"+v,v++;f[m]="",A(E==="sync"?F:W,f),o.data&&(o.data=!1,A(me,o),g.style.display="block",u.querySelector(".wg-toggle-btn").innerText="▴"),T(),k.scrollTop=k.scrollHeight},e.querySelector("#vnpt-cw-reset").onclick=()=>{confirm("Reset [Default Data] to hardcoded values?")&&(K={...ie},A(te,K),E==="default"&&T(),L("Reset complete","#17a2b8"))}}let we=!1;document.addEventListener("input",e=>{var s,i,g;if(we||!e.target||!["INPUT","TEXTAREA"].includes(e.target.tagName))return;let t=q(F)??{};if(Object.keys(t).length===0)return;let n=e.target.id,o=e.target.name,a=null,l=null;if(n){const u=document.querySelector(`label[for="${n}"]`);u&&(a=u.textContent.trim(),l=(s=u.innerText)==null?void 0:s.trim())}if(!a){const u=e.target.closest("label");u&&(a=(i=Array.from(u.childNodes).find(d=>d.nodeType===3))==null?void 0:i.textContent.trim(),l=(g=u.innerText)==null?void 0:g.trim())}let r=t[n]||t[o]||t[a]||t[l];if(r){we=!0;try{const u=e.target.value;r.split(",").map(p=>p.trim()).filter(p=>p).forEach(p=>{p!==n&&p!==o&&p!==a&&p!==l&&V(p,u)})}finally{we=!1}}});function ce(e,t=null){try{const n=localStorage.getItem(e);return n!==null?JSON.parse(n):t}catch{return t}}function Ee(e,t){localStorage.setItem(e,JSON.stringify(t))}let J=Number(localStorage.getItem(Se))||.08,U=ce(me)??{calc:!1,data:!0};function Z(e,t){if(!t||t.replace(/\D/g,"").length<6)return;let n=ce(e,[]);n=n.filter(o=>o!==t),n.unshift(t),Ee(e,n.slice(0,10))}function $(e,t){const n=document.getElementById(t);n&&(n.innerHTML=ce(e,[]).map(o=>`<option value="${o}">`).join(""))}function _e(e){const t=window.innerWidth,n=window.innerHeight,o=e.getBoundingClientRect();e.style.left=Math.min(Math.max(parseFloat(e.style.left),0),t-o.width)+"px",e.style.top=Math.min(Math.max(parseFloat(e.style.top),0),n-36)+"px"}function ct(e,t,n){const o=document.createElement("div");o.className="wg-sec-header";const a=document.createElement("span");a.innerText=e;const l=document.createElement("button");return l.className="wg-toggle-btn",l.innerText=U[t]?"▾":"▴",o.appendChild(a),o.appendChild(l),l.onclick=()=>{U[t]=!U[t],l.innerText=U[t]?"▾":"▴",Ee(me,U),n(U[t])},o}function st(){const e=document.createElement("div");e.id="vnpt-calc-widget";const t=ce(Ne),n=!!(t&&t.docked);Object.assign(e.style,{top:t&&t.y?t.y+"px":"16px",left:t&&t.x?t.x+"px":window.innerWidth-236+"px"});function o(h,x){const b=document.createElement("button");return b.innerText=h,b.className="cw-action-btn "+x,b}const a=o("Fill","cw-btn-fill");a.id="vnpt-cw-fill";const l=o("Sync","cw-btn-sync");l.id="vnpt-cw-sync",l.title="Manual trigger for Sync Mapping";const r=o("Add","cw-btn-add");r.id="vnpt-cw-add";const s=o("↺","cw-btn-reset");s.id="vnpt-cw-reset",s.title="Reset Default fields back to original";const i=document.createElement("div");i.className="cw-btn-group",i.appendChild(a),i.appendChild(l),i.appendChild(r),i.appendChild(s);const g=document.createElement("div");g.className="cw-title-bar";const u=document.createElement("span");u.className="cw-title-label",u.innerHTML="VNPT Fast",g.appendChild(u),g.appendChild(i),e.appendChild(g),U.calc=!1;const d=document.createElement("div");d.className="cw-body-inline",d.innerHTML=`
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
    `;const p=document.getElementById("vnpt-inline-calc");p?p.appendChild(d):e.appendChild(d),document.body.appendChild(e),c.calcWidget=e,lt(e,ct,_e,U);const C=Array.from(e.children).filter(h=>h!==g);function S(h){C.forEach(x=>{x.style.display=h?"none":""}),g.style.borderRadius=h?"8px":"0",e.style.borderRadius=h?"8px":"10px",e.style.boxShadow=h?"0 -3px 16px rgba(25,135,84,0.55)":"0 4px 24px rgba(0,0,0,.3)",h&&(e.style.top=window.innerHeight-(g.offsetHeight||34)+"px")}const k=Ae(e,[g],Ne,null,h=>{S(h)});n&&k.setDocked(!0),window.addEventListener("resize",()=>{k.isDocked()?e.style.top=window.innerHeight-g.offsetHeight+"px":_e(e)});const T=document.getElementById("wg-taxRate"),f=document.getElementById("wg-before"),v=document.getElementById("wg-tax"),m=document.getElementById("wg-after"),y=document.getElementById("wg-text"),N=document.getElementById("wg-calc-map-btn"),M=document.getElementById("wg-calc-map-wrap");let w=ce(Le)??{};N.onclick=h=>{const x=M.style.display==="flex";if(M.style.display=x?"none":"flex",!x){const b=Y=>{!M.contains(Y.target)&&Y.target!==N&&(M.style.display="none",document.removeEventListener("click",b))};setTimeout(()=>document.addEventListener("click",b),0)}},e.querySelectorAll("input[data-clink]").forEach(h=>{const x=h.dataset.clink;h.value=(w[x]||[]).join(", "),h.addEventListener("input",()=>{w[x]=h.value.split(",").map(b=>b.trim()).filter(b=>b),Ee(Le,w)})}),T.value=J*100,$(O,"wg-before-list"),$(_,"wg-after-list");function B(h,x,b){const Y=Me(Oe(b))+" đồng";y.value=Y,(w.before||[]).forEach(Q=>V(Q,I(h))),(w.tax||[]).forEach(Q=>V(Q,I(x))),(w.after||[]).forEach(Q=>V(Q,I(b))),(w.text||[]).forEach(Q=>V(Q,Y))}function D(){const h=R(f.value),x=Math.round(h*J),b=h+x;v.value=I(x),m.value=I(b),B(h,x,b)}function Ve(){const h=R(v.value),x=Math.round(h/J),b=x+h;f.value=I(x),m.value=I(b),B(x,h,b)}function Fe(){const h=R(m.value),x=Math.round(h/(1+J)),b=h-x;f.value=I(x),v.value=I(b),B(x,b,h)}T.addEventListener("input",()=>{J=Number(T.value)/100||0,localStorage.setItem(Se,J),D()}),f.addEventListener("input",()=>{const h=R(f.value),x=Math.round(h*J),b=h+x;v.value=I(x),m.value=I(b),y.value=Me(Oe(b))+" đồng"}),f.addEventListener("blur",()=>{f.value=I(R(f.value)),Z(O,f.value),$(O,"wg-before-list")}),f.addEventListener("change",()=>{f.value=I(R(f.value)),Z(O,f.value),$(O,"wg-before-list"),D()}),v.addEventListener("input",Ve),m.addEventListener("input",Fe),m.addEventListener("blur",()=>{m.value=I(R(m.value)),Z(_,m.value),$(_,"wg-after-list")}),m.addEventListener("change",()=>{m.value=I(R(m.value)),Z(_,m.value),$(_,"wg-after-list"),Fe()}),[{el:f,key:O},{el:v,key:null},{el:m,key:_},{el:y,key:null}].forEach(h=>{h.el&&["click","focus"].forEach(x=>{h.el.addEventListener(x,b=>{if(b.target.value){navigator.clipboard.writeText(b.target.value),h.key===O&&(Z(O,b.target.value),$(O,"wg-before-list")),h.key===_&&(Z(_,b.target.value),$(_,"wg-after-list"));const Y=b.target.style.backgroundColor;b.target.style.backgroundColor="#d1e7dd",setTimeout(()=>b.target.style.backgroundColor=Y,300)}})})})}function ze(){ge.info("Initializing VNPT Userscript...");try{Pe(),Ze(),et(),Ye(),ve(),tt(),nt(),ot(),st(),ge.info("Userscript initialized successfully.")}catch(e){ge.error("Error during userscript initialization:",e)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",ze):ze()})();
