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
    `)}const c={widget:null,panel:null,header:null,toggleBtn:null,fieldsContainer:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1},V={tenDaiDienn:"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT",emailDaiDien:"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Số GPKD | MST",goiDV:"Gói Dịch Vụ",ngayKy:"Ngày ký",thangKy:"Tháng Ký",namKy:"Năm ký",soHopDong:"Số Hợp đồng",soLuongGoi:"Số Lượng Gói"},me="vnpt_docx_fields",he="vnpt_docx_position",be="vnpt_docx_size",ie="vnpt_docx_opened",W="vnpt_autofill_data_default",j="vnpt_autofill_data_custom",F="vnpt_autofill_data_sync",Le="vnpt_widget_pos",xe="vnd_tax_rate",re="vnd_before_history",le="vnd_after_history",ye="vnpt_widget_collapsed",ve="vnd_calc_map",R="vnpt_widget_datatab",we="vnpt_templates";function E(e,t="#198754"){const n=document.createElement("div");n.innerText=e,Object.assign(n.style,{position:"fixed",bottom:"20px",left:"50%",transform:"translateX(-50%)",background:t,color:"#fff",padding:"7px 16px",borderRadius:"20px",zIndex:"100000",opacity:"0",transition:"opacity .25s",fontSize:"13px",fontFamily:"'Segoe UI',sans-serif",boxShadow:"0 4px 14px rgba(0,0,0,.25)"}),document.body.appendChild(n),setTimeout(()=>n.style.opacity="1",30),setTimeout(()=>{n.style.opacity="0",setTimeout(()=>n.remove(),280)},2200)}const De={local:{download(e,t="arraybuffer"){return new Promise((n,o)=>{const a=new FileReader;switch(a.onload=l=>{let r=l.target.result;t==="base64"&&typeof r=="string"&&(r=r.split(",")[1]||r),n(r)},a.onerror=l=>o(l),t.toLowerCase()){case"arraybuffer":a.readAsArrayBuffer(e);break;case"base64":case"dataurl":a.readAsDataURL(e);break;case"text":a.readAsText(e);break;default:o(new Error(`Unsupported read type: ${t}`))}})},async upload(e){return this.download(e,"base64")}}},Ie={getAdapter(e){const t=De[e];if(!t)throw new Error(`Storage adapter not found: ${e}`);return t},async upload(e,t,n={}){return await this.getAdapter(e).upload(t,n)},async download(e,t,n={}){return await this.getAdapter(e).download(t,n.type||"arraybuffer")}},Ae="vnpt_templates_db",I="buffers";let G=null;function ce(){return G?Promise.resolve(G):new Promise((e,t)=>{const n=indexedDB.open(Ae,1);n.onupgradeneeded=o=>{const a=o.target.result;a.objectStoreNames.contains(I)||a.createObjectStore(I)},n.onsuccess=o=>{G=o.target.result,e(G)},n.onerror=()=>t(n.error)})}async function He(e,t){const n=await ce();return new Promise((o,a)=>{const s=n.transaction(I,"readwrite").objectStore(I).put(t,e);s.onsuccess=()=>o(),s.onerror=()=>a(s.error)})}async function Oe(e){const t=await ce();return new Promise((n,o)=>{const r=t.transaction(I,"readonly").objectStore(I).get(e);r.onsuccess=()=>n(r.result),r.onerror=()=>o(r.error)})}async function _e(e){const t=await ce();return new Promise((n,o)=>{const r=t.transaction(I,"readwrite").objectStore(I).delete(e);r.onsuccess=()=>n(),r.onerror=()=>o(r.error)})}function P(){try{const e=JSON.parse(localStorage.getItem(we))||[],t=e.filter(n=>n.type!=="local");return t.length!==e.length&&q(t),t}catch{return[]}}function q(e){localStorage.setItem(we,JSON.stringify(e))}function Me(e){const t=e.match(/drive\.google\.com\/file\/d\/([^/]+)/);return t?`https://drive.google.com/uc?export=download&id=${t[1]}`:e}function ze(e){return new Promise((t,n)=>{GM_xmlhttpRequest({method:"GET",url:Me(e),responseType:"arraybuffer",onload:o=>{if(o.status>=200&&o.status<300){if(o.response&&o.response.byteLength>4){const a=new Uint8Array(o.response.slice(0,4));if(a[0]===80&&a[1]===75&&a[2]===3&&a[3]===4){t(o.response);return}else{n(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}t(o.response)}else n(new Error(`HTTP ${o.status}: Không lấy được file`))},onerror:()=>n(new Error("Không thể tải URL.")),ontimeout:()=>n(new Error("Timeout khi tải URL."))})})}async function Ve(e,t,n){const o=e.name.replace(/\.docx$/i,""),a=prompt("Đặt tên biến nhớ cho file này:",o);if(!(!a||!a.trim()))try{const l=await e.arrayBuffer();await He(a.trim(),l);const s=P().filter(i=>i.name!==a.trim()&&i.fileName!==e.name);s.unshift({name:a.trim(),type:"local_idb",fileName:e.name,lastUsed:Date.now()}),q(s),O(t,n),n&&n(l,a.trim())}catch(l){E(`❌ Lỗi lưu file: ${l.message}`,"#dc3545")}}function O(e,t,n=null){let o=e.querySelector(".vnpt-template-manager-inner"),a,l;if(o)a=o.querySelector(".vnpt-local-list-container"),l=o.querySelector(".vnpt-btn-wrap");else{e.innerHTML="",o=document.createElement("div"),o.className="vnpt-template-manager-inner";const i=document.createElement("div");i.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const p=document.createElement("span");p.className="vnpt-title-main",p.style.cssText="font-size:11px;font-weight:700;color:#444;",l=document.createElement("div"),l.className="vnpt-btn-wrap",l.style.cssText="display:flex;gap:4px;",i.appendChild(p),i.appendChild(l),o.appendChild(i),a=document.createElement("div"),a.className="vnpt-local-list-container",a.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",o.appendChild(a),e.appendChild(o)}const r=P(),s=o.querySelector(".vnpt-title-main");s.innerHTML="📁 Bộ nhớ Templates"+(n?` <span style="color:#2e7d32;">(Đang dùng: ${n})</span>`:""),r.length===0?a.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':a.innerHTML="",r.forEach((i,p)=>{const g=document.createElement("div");g.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",g.title=i.fileName||i.url||i.name,g.tabIndex=0,g.onfocus=()=>g.style.boxShadow="0 0 0 2px #28a745",g.onblur=()=>g.style.boxShadow="none";const u=i.type==="local"||i.type==="local_base64"||i.type==="local_idb"?"OFF":"ON",m=u==="OFF"?"#6c757d":"#28a745",d=document.createElement("span");d.textContent=u,d.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${m};color:#fff;`;const y=document.createElement("span");y.textContent=i.name,y.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",g.onclick=()=>{g.focus(),Fe(i,t,n,e)},g.appendChild(d),g.appendChild(y);const w=document.createElement("button");w.innerHTML="✎",w.title="Đổi tên template",w.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",w.onclick=N=>{N.stopPropagation();const f=prompt("Đổi tên template:",i.name);if(f&&f.trim()&&f.trim()!==i.name){const b=P();b[p].name=f.trim(),q(b),O(e,t,n)}},g.appendChild(w);const k=document.createElement("button");k.innerHTML="✕",k.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",k.onclick=async N=>{if(N.stopPropagation(),confirm(`Xoá biểu mẫu "${i.name}"?`)){const f=P();f.splice(p,1),q(f),i.type==="local_idb"&&await _e(i.name).catch(()=>null),O(e,t,n===i.name?null:n)}},g.appendChild(k),a.appendChild(g)})}function Fe(e,t,n,o){const a=P(),l=a.find(r=>r.name===e.name&&(r.url===e.url||r.type===e.type));if(l&&(l.lastUsed=Date.now(),q(a)),e.type==="local_idb"){Oe(e.name).then(r=>{if(!r)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");t&&t(r,e.name),O(o,t,e.name)}).catch(r=>{E(`❌ Lỗi nạp File IDB: ${r.message}`,"#dc3545")});return}if(e.type==="local_base64"&&e.data){try{const r=window.atob(e.data.split(",")[1]),s=r.length,i=new Uint8Array(s);for(let p=0;p<s;p++)i[p]=r.charCodeAt(p);t&&t(i.buffer,e.name),O(o,t,e.name)}catch(r){E(`❌ Lỗi nạp Base64: ${r.message}`,"#dc3545")}return}ze(e.url).then(r=>{t&&t(r,e.name),O(o,t,e.name)}).catch(r=>{E(`❌ ${r.message}`,"#dc3545")})}function Re(e){e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function B(e,t){var a;if(!e||e.disabled||e.readOnly)return;const n=e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,o=(a=Object.getOwnPropertyDescriptor(n,"value"))==null?void 0:a.set;o?o.call(e,t):e.value=t,Re(e)}function X(e){const t=document.getElementById(e);if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"))return t;for(const n of document.querySelectorAll("label"))if(n.textContent.trim()===e){if(n.htmlFor){const a=document.getElementById(n.htmlFor);if(a)return a}let o=n.parentElement;for(;o;){const a=o.querySelector("input,textarea");if(a)return a;if(o=o.parentElement,(o==null?void 0:o.tagName)==="FORM")break}}return null}function Y(e){for(const t of document.querySelectorAll("label"))if(t.innerText.trim()===e)return t.parentElement.querySelector("input, textarea");return null}function L(e,t){const n=X(e)||Y(e);n&&B(n,t)}const se=new Date,de=String(se.getDate()).padStart(2,"0"),J=String(se.getMonth()+1).padStart(2,"0"),Q=String(se.getFullYear()),K={ngayKy:de,thangKy:J,namKy:Q,ngayTiepNhan:`${de}/${J}/${Q}`,ngayThangNamKy:`${de}/${J}/${Q}`,thangKy1:J,namKy1:Q,tenDoanhNghiepB:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM",diaChiB:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội",maSoThueB:"0100686223",stkB:"1600114156",diaChiStkB:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)",tenB:"Phạm Khánh Chung",nguoiDaiDienB:"Phạm Khánh Chung",chucVuB:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",chucVuDaiDienB:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",giayUyQuyenSoB:"2628/GUQ-VNPT-HNI-VP",soGiayUyQuyenB:"2628/GUQ-VNPT-HNI-VP",giayUyQuyenNgayB:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",ngayGiayUyQuyenB:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",GiayUyQuyenB:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",tenDoanhNghiepB1:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",donViTiepNhan:"TTKD KHDN",tenTiepNhan:"Bùi Anh",tenNguoiNhan:"Bùi Anh",dienThoaiB:"02436686868",diaChiTaiKhoanB:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 ",noiKy:"Hà Nội",emailB:"",lienheHopDongB:"AM Bùi Anh",lienheTuVanB:"AM Bùi Anh",lienheHoaDonB:"AM Bùi Anh",sucoCap1B:"AM Bùi Anh",sucoCap2B:"AM Bùi Anh",sucoCap3B:"AM Bùi Anh",sucoCap4B:"AM Bùi Anh"},Ee=["lienheHopDongA","lienheHoaDonA","lienheTuVanA","sucoCap1A","sucoCap2A","sucoCap3A","sucoCap4A"];function _(e,t,n=null,o=""){const a=c.fieldsContainer.querySelector(".text-hint");a&&a.remove();const l=c.fieldsContainer.querySelectorAll(".f-key");let r=!1;for(let s of l)if(s.value===e){const i=s.closest(".vnpt-field-row"),p=i.querySelector(".f-val"),g=i.querySelector(".f-label"),u=i.querySelector(".f-sync");t!==""&&(p.value=t),n!==null&&n!==""&&(g.value=n),o!==""&&(u.value=o),r=!0;break}if(!r){(n===null||n==="")&&(n=V[e]||"");const s=document.createElement("div");s.className="vnpt-field-row row-item",s.setAttribute("draggable","false"),s.innerHTML=`
            <input type="checkbox" class="row-chk" title="Chọn để thao tác hàng loạt" style="margin: 0 2px 0 2px;" />
            <input type="text" class="f-label" placeholder="Nhãn..." value="${n}" />
            <input type="text" class="f-key" placeholder="Mã biến" value="${e}" />
            <input type="text" class="f-sync" placeholder="🔗 Đồng bộ" value="${o}" title="Nhập các ID đích trên web, cách nhau bởi dấu phẩy" />
            <span class="row-drag-handle" title="Kéo thả để di chuyển">=</span>
            <input type="text" class="f-val" placeholder="Giá trị" value="${t}" />
        `;const i=s.querySelector(".f-val"),p=s.querySelector(".f-sync");e==="tenToChuc"&&(i.style.textAlign="right"),s.querySelector(".f-key").addEventListener("keyup",function(){T(),i.style.textAlign=this.value.trim()==="tenToChuc"?"right":""}),s.querySelector(".f-label").addEventListener("keyup",T),p.addEventListener("keyup",T),i.addEventListener("keyup",function(){if(c.isDefaultMode&&!this.dataset.warned){if(!confirm("⚠️ Bạn đang chỉnh sửa dữ liệu mặc định. Thay đổi này sẽ không được lưu vào cấu hình cá nhân. Tiếp tục?")){pe();return}this.dataset.warned="true"}T();const u=p.value.split(",").map(m=>m.trim()).filter(m=>m);u.length>0&&u.forEach(m=>L(m,this.value))}),i.addEventListener("focus",function(){c.isDefaultMode&&this.dataset.warned});const g=s.querySelector(".row-drag-handle");g.addEventListener("mouseenter",()=>s.setAttribute("draggable","true")),g.addEventListener("mouseleave",()=>{s.classList.contains("dragging")||s.setAttribute("draggable","false")}),s.addEventListener("dragstart",function(u){c.draggedRowForVNPT=this,u.dataTransfer.effectAllowed="move",u.dataTransfer.setData("text/plain",e),this.classList.add("dragging")}),s.addEventListener("dragover",function(u){return u.preventDefault(),u.dataTransfer.dropEffect="move",!1}),s.addEventListener("dragenter",function(u){this.classList.add("over")}),s.addEventListener("dragleave",function(u){this.classList.remove("over")}),s.addEventListener("drop",function(u){if(u.stopPropagation(),c.draggedRowForVNPT&&c.draggedRowForVNPT!==this){const m=Array.from(c.fieldsContainer.querySelectorAll(".vnpt-field-row")),d=m.indexOf(c.draggedRowForVNPT),y=m.indexOf(this);d<y?this.parentNode.insertBefore(c.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(c.draggedRowForVNPT,this),T()}return!1}),s.addEventListener("dragend",function(u){this.setAttribute("draggable","false"),c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(d=>{d.classList.remove("over"),d.classList.remove("dragging")}),c.draggedRowForVNPT=null}),c.fieldsContainer.appendChild(s),c.fieldsContainer.scrollTop=c.fieldsContainer.scrollHeight}}async function T(){if(c.isDefaultMode)return;const e={};c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(n=>{const o=n.querySelector(".f-key").value.trim(),a=n.querySelector(".f-label").value.trim(),l=n.querySelector(".f-val").value,r=n.querySelector(".f-sync").value.trim();o&&(e[o]={label:a,value:l,sync:r})}),localStorage.setItem(me,JSON.stringify(e))}async function pe(){try{const e=JSON.parse(localStorage.getItem(me));if(e&&Object.keys(e).length>0){c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(t=>t.remove());for(const t in e){let n=e[t];typeof n=="object"&&n!==null?_(t,n.value,n.label,n.sync||""):_(t,n,"","")}}}catch(e){console.error("Error loading config:",e)}try{const e=JSON.parse(localStorage.getItem(he));e&&c.widget&&(c.widget.style.bottom="auto",e.right?(c.widget.style.right=e.right,c.widget.style.left="auto"):e.left&&(c.widget.style.left=e.left,c.widget.style.right="auto"),e.top&&(c.widget.style.top=e.top))}catch{}}function Pe(){document.getElementById("vnpt-btn-toggle-id").addEventListener("click",function(){c.fieldsContainer.classList.toggle("show-ids")}),document.getElementById("vnpt-btn-default").addEventListener("click",qe),document.getElementById("vnpt-btn-batch-del").addEventListener("click",function(){if(c.isDefaultMode){E("⚠️ Không thể xóa ở chế độ Dữ liệu mặc định","#ffc107");return}const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row");let t=0;e.forEach(n=>{const o=n.querySelector(".row-chk");o&&o.checked&&(n.remove(),t++)}),t===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(e.forEach(n=>n.remove()),E("🗑️ Đã xóa toàn bộ","#ff5252"),T()):(E(`🗑️ Đã xóa ${t} trường`,"#ff5252"),T())}),document.getElementById("vnpt-btn-add").addEventListener("click",function(){if(c.isDefaultMode){E("⚠️ Không thể thêm ở chế độ Dữ liệu mặc định","#ffc107");return}const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;_("bien_moi_"+e,"","",""),T()}),document.getElementById("vnpt-btn-fill-back").addEventListener("click",function(){const e=c.fieldsContainer.querySelectorAll(".vnpt-field-row");let t=0;e.forEach(n=>{const o=n.querySelector(".f-key").value.trim(),a=n.querySelector(".f-val").value;o&&(document.getElementById(o)||document.getElementsByName(o)[0])&&(L(o,a),t++)}),t>0?E(`✅ Đã điền ngược ${t} trường vào web`,"#198754"):E("⚠️ Không có trường nào khớp","#ffc107")})}function qe(){c.isDefaultMode=!c.isDefaultMode;const e=document.getElementById("vnpt-btn-default");c.fieldsContainer.innerHTML="",c.isDefaultMode?(e.classList.add("active"),E("📌 Đang xem Dữ liệu mặc định","#1e8e3e"),Object.keys(K).forEach(t=>{_(t,K[t],V[t]||"")})):(e.classList.remove("active"),E("📋 Đã quay lại Dữ liệu cá nhân"),pe())}function Ke(){const e=document.createElement("div");e.id="vnpt-docx-widget";const t=localStorage.getItem(ie)==="true";e.innerHTML=`
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
    `,document.body.appendChild(e),c.widget=e,c.panel=document.getElementById("vnpt-export-panel"),c.toggleBtn=document.getElementById("vnpt-toggle-btn"),c.header=document.getElementById("vnpt-panel-header"),c.fieldsContainer=document.getElementById("vnpt-fields-container");try{const o=JSON.parse(localStorage.getItem(be));o&&o.width&&o.height&&(c.panel.style.width=o.width+"px",c.panel.style.height=o.height+"px")}catch(o){console.error("Lỗi load size panel:",o)}new ResizeObserver(o=>{if(c.panel.style.display!=="none")for(let a of o){const{width:l,height:r}=a.contentRect;l>0&&r>0&&localStorage.setItem(be,JSON.stringify({width:Math.round(l+20),height:Math.round(r+20)}))}}).observe(c.panel),c.panelBody=document.getElementById("vnpt-panel-body"),O(document.getElementById("vnpt-template-manager"),(o,a)=>{c.templateBuffer=o,c.templateName=a}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const o=this.files&&this.files[0];if(!o)return;const a=document.getElementById("vnpt-template-manager");Ve(o,a,(l,r)=>{c.templateBuffer=l,c.templateName=r}),this.value=""}),c.toggleBtn.addEventListener("click",o=>{c.hasDragged||(c.panel.style.display==="none"?(c.panel.style.display="flex",c.toggleBtn.className="btn-opened",c.toggleBtn.innerHTML="✖",localStorage.setItem(ie,"true")):(c.panel.style.display="none",c.toggleBtn.className="btn-closed",c.toggleBtn.innerHTML="📄",localStorage.setItem(ie,"false")))})}function ke(e,t,n,o=null,a=null){let l=!1,r=0,s=0,i=!1;function p(u){i!==u&&(i=u,a&&a(u))}function g(u){if(u.button!==0)return;l=!0,c.hasDragged=!1;const m=e.getBoundingClientRect();r=u.clientX-m.left,s=u.clientY-m.top,document.body.style.userSelect="none",t&&t.forEach(d=>d.style.cursor="grabbing"),o&&o(),u.preventDefault()}return t.forEach(u=>{u.addEventListener("mousedown",g)}),document.addEventListener("mousemove",function(u){if(!l)return;c.hasDragged=!0;let m=u.clientX-r,d=u.clientY-s;const y=window.innerWidth,w=window.innerHeight,k=document.getElementById("vnpt-toggle-btn"),N=k?k.offsetWidth:40,f=k?k.offsetHeight:40,b=e.id==="vnpt-docx-widget";let h=e.offsetWidth||0;if(b){let v=N+6-h,S=y-h+6;m<v&&(m=v),m>S&&(m=S)}else h=h||200,m<0&&(m=0),m+h>y&&(m=Math.max(0,y-h));let x=i;if(b?x=!1:i?u.clientY<w-40&&(x=!1):u.clientY>w-10&&(x=!0),d<0&&(d=0),x)p(!0),e.style.top=w-e.offsetHeight+"px",b?(e.style.right=y-m-h+"px",e.style.left="auto"):(e.style.left=m+"px",e.style.right="auto"),e.style.bottom="auto";else{p(!1);let C=e.offsetHeight||40,v;if(b)v=10+f;else{const S=e.querySelector(".cw-title-bar");v=S?S.offsetHeight:C}d+v>w&&(d=Math.max(0,w-v)),e.style.top=d+"px",b?(e.style.right=y-m-h+"px",e.style.left="auto"):(e.style.left=m+"px",e.style.right="auto"),e.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(l&&(l=!1,document.body.style.userSelect="",t&&t.forEach(u=>u.style.cursor="grab"),n)){const u=e.id==="vnpt-docx-widget";localStorage.setItem(n,JSON.stringify({left:u?void 0:e.style.left,right:u?e.style.right:void 0,top:e.style.top,x:u?void 0:parseFloat(e.style.left),y:parseFloat(e.style.top),docked:i}))}}),{isDocked:()=>i,setDocked:p}}function Ue(){c.widget&&c.header&&c.toggleBtn&&(ke(c.widget,[c.header,c.toggleBtn],he),window.addEventListener("resize",()=>{const e=window.innerWidth,t=window.innerHeight,n=document.getElementById("vnpt-toggle-btn"),o=n?n.offsetWidth:40,a=n?n.offsetHeight:40;let l=c.widget.getBoundingClientRect(),r=l.left,s=l.top,i=c.widget.offsetWidth||0,g=o+6-i,u=e-i+6;r<g&&(r=g),r>u&&(r=u),s+10+a>t&&(s=Math.max(0,t-(10+a))),c.widget.style.right=e-r-i+"px",c.widget.style.top=s+"px"}))}function $e(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){let e=0;Object.keys(V).forEach(t=>{var a;const n=document.getElementById(t);let o="";if(n&&(o=n.tagName.toLowerCase()==="select"?((a=n.options[n.selectedIndex])==null?void 0:a.text)||"":n.value,e++),!o){const l=t.toLowerCase(),r=new Date;l==="ngayky"&&(o=String(r.getDate()).padStart(2,"0")),(l==="thangky"||l==="thangky1")&&(o=String(r.getMonth()+1).padStart(2,"0")),(l==="namky"||l==="namky1")&&(o=String(r.getFullYear())),l==="soluonggoi"&&(o="1")}_(t,o,null)}),T(),e>0?(this.style.background="#34a853",this.style.color="#fff",this.innerText="Done",setTimeout(()=>{this.style.background="#fbbc04",this.style.color="#000",this.innerText="Quét"},1e3)):E("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(e){e.target&&e.target.id&&V[e.target.id]!==void 0&&(_(e.target.id,e.target.value,null),T())}),document.addEventListener("change",function(e){var t;if(e.target&&e.target.id&&V[e.target.id]!==void 0){let n=e.target.tagName.toLowerCase()==="select"?((t=e.target.options[e.target.selectedIndex])==null?void 0:t.text)||"":e.target.value;_(e.target.id,n,null),T()}})}function Se(e,t,n){try{let o;try{o=new window.PizZip(e)}catch(i){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(i);return}const a=new window.docxtemplater(o,{paragraphLoop:!0,linebreaks:!0});a.render(t);const l=a.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),r=URL.createObjectURL(l),s=document.createElement("a");s.href=r,s.download=n,document.body.appendChild(s),s.click(),setTimeout(()=>{document.body.removeChild(s),URL.revokeObjectURL(r)},100)}catch(o){let a=o.message;o.properties&&o.properties.errors instanceof Array?a=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+o.properties.errors.map(r=>"- "+(r.properties.explanation||r.message)).join(`
`):a="Lỗi phần mềm Word sinh ra: "+a,alert(a),console.error("DocX Error:",o)}}function We(){const e=document.getElementById("vnpt-export-filename");e&&e.addEventListener("input",()=>{e.dataset.userEdited="1",e.value.trim()||(e.dataset.userEdited="0")});function t(){if(!e||e.dataset.userEdited==="1")return;let n="";if(c.fieldsContainer&&c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(i=>{const p=i.querySelector(".f-key").value.trim(),g=i.querySelector(".f-val").value.trim();p==="tenToChuc"&&(n=g)}),!n){const s=document.getElementById("tenToChuc");s&&(n=s.tagName.toLowerCase()==="textarea"||s.tagName.toLowerCase()==="input"?s.value.trim():s.innerText.trim())}function o(s){if(!s)return"";let i=s;return i=i.replace(/Tổng công ty/gi,""),i=i.replace(/Công ty/gi,""),i=i.replace(/\bCty\b/gi,""),i=i.replace(/Trách nhiệm hữu hạn/gi,""),i=i.replace(/\bTNHH\b/gi,""),i=i.replace(/Cổ phần/gi,""),i=i.replace(/\bCP\b/gi,""),i=i.replace(/Một thành viên/gi,""),i=i.replace(/\bMTV\b/gi,""),i=i.replace(/Chi nhánh/gi,""),i=i.replace(/Việt Nam/gi,"VN"),i=i.replace(/Viet Nam/gi,"VN"),i=i.replace(/\s+/g," ").trim(),i=i.replace(/^[-,\s]+|[-,\s]+$/g,""),i.length>50&&(i=i.substring(0,47)+"..."),i.replace(/[<>:"/\\|?*]/g,"")}let a=o(n),l=c.templateName?c.templateName.replace(/\.docx$/i,""):"",r=[];a&&r.push(a),l&&r.push(l),r.length>0?e.value=r.join(" - ")+".docx":e.value||(e.value="HopDong_Auto.docx")}setInterval(t,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const n={};if(c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(r=>{const s=r.querySelector(".f-key").value.trim(),i=r.querySelector(".f-val").value;s&&(n[s]=i)}),Object.keys(n).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}let a=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(a.toLowerCase().endsWith(".docx")||(a+=".docx"),c.templateBuffer){Se(c.templateBuffer,n,a);return}const l=document.getElementById("vnpt-template-file");if(l.files&&l.files.length>0){Ie.download("local",l.files[0],{type:"arraybuffer"}).then(r=>Se(r,n,a)).catch(r=>alert(`Lỗi đọc file: ${r.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')})}function je(){function e(){const o=document.getElementById("chucVu");o&&!o.dataset.filled&&(o.dataset.filled="1",B(o,"Giám Đốc"));const a=document.getElementById("noiCap");a&&!a.dataset.filled&&(a.dataset.filled="1",B(a,"Cục trưởng Cục Cảnh sát QLHC về TTXH"));const l=document.getElementById("noiCapSoDkdn");l&&!l.dataset.filled&&(l.dataset.filled="1",B(l,""));const r=document.getElementById("duong"),s=document.getElementById("diaChiTruSoDuong");r&&s&&!r.dataset.bound&&(r.dataset.bound="1",r.addEventListener("input",()=>B(s,r.value)));const i=document.getElementById("sdt"),p=document.getElementById("sdtToChuc");i&&p&&!i.dataset.bound&&(i.dataset.bound="1",i.addEventListener("input",()=>B(p,i.value)));const g=document.getElementById("emailDaiDien"),u=document.getElementById("emailCongTy");g&&u&&!g.dataset.bound&&(g.dataset.bound="1",g.addEventListener("input",()=>B(u,g.value)));const m=document.getElementById("soDkdn"),d=document.getElementById("maSoThue");m&&d&&!m.dataset.bound&&(m.dataset.bound="1",m.addEventListener("input",()=>B(d,m.value)))}let t;new MutationObserver(()=>{clearTimeout(t),t=setTimeout(e,200)}).observe(document.body,{childList:!0,subtree:!0}),e()}function U(e,t=null){try{const n=localStorage.getItem(e);return n!==null?JSON.parse(n):t}catch{return t}}function Z(e,t){localStorage.setItem(e,JSON.stringify(t))}function Ce(e,t){if(!t||t.replace(/\D/g,"").length<6)return;let n=U(e,[]);n=n.filter(o=>o!==t),n.unshift(t),Z(e,n.slice(0,10))}function ee(e,t){const n=document.getElementById(t);n&&(n.innerHTML=U(e,[]).map(o=>`<option value="${o}">`).join(""))}function ue(e){return e.toLocaleString("en-US")}function fe(e){return Number(String(e).replace(/[^\d]/g,""))||0}function Ge(e){return e.charAt(0).toUpperCase()+e.slice(1)}const $=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function Xe(e){let t=Math.floor(e/100),n=Math.floor(e%100/10),o=e%10,a="";return t>0&&(a+=$[t]+" trăm ",n===0&&o>0&&(a+="lẻ ")),n>1?(a+=$[n]+" mươi ",o===1?a+="mốt":o===5?a+="lăm":o>0&&(a+=$[o])):n===1?(a+="mười ",o===5?a+="lăm":o>0&&(a+=$[o])):o>0&&(t>0&&(a+="lẻ "),a+=$[o]),a.trim()}function Ye(e){if(e===0)return"không";const t=["","nghìn","triệu","tỷ"];let n="",o=0;for(;e>0;){const a=e%1e3;a>0&&(n=Xe(a)+" "+t[o]+" "+n),e=Math.floor(e/1e3),o++}return n.trim()}function Te(e,t,n){let o=0,a=0,l=0;e==="before"?(o=fe(t),a=Math.round(o*n),l=o+a):e==="tax"?(a=fe(t),o=Math.round(a/n),l=o+a):e==="after"&&(l=fe(t),o=Math.round(l/(1+n)),a=l-o);const r=Ge(Ye(l))+" đồng";return{beforeNum:o,taxNum:a,afterNum:l,beforeStr:ue(o),taxStr:ue(a),afterStr:ue(l),textStr:r}}function Je(e,t){t.before&&t.before.forEach(n=>L(n,e.beforeStr)),t.tax&&t.tax.forEach(n=>L(n,e.taxStr)),t.after&&t.after.forEach(n=>L(n,e.afterStr)),t.text&&t.text.forEach(n=>L(n,e.textStr))}function te(e,t=null){try{const n=localStorage.getItem(e);return n!==null?JSON.parse(n):t}catch{return t}}function Qe(){const e=te(W)??{...K},t=te(j)??{},n={...e,...t};let o="";for(let a of Ee){const l=X(a)||Y(a);if(l&&l.value){o=l.value;break}}o&&Ee.forEach(a=>L(a,o)),Object.keys(n).forEach(a=>{let l=X(a)||Y(a);l&&B(l,n[a])}),E("✅ Auto fill complete")}function Ze(){let e=te(F)??{};const t=Object.keys(e);if(t.length===0){E("⚠️ No sync mapping","#ffc107");return}t.forEach(n=>{let o=X(n)||Y(n);o&&o.value!==void 0&&o.value!==""&&e[n].split(",").map(l=>l.trim()).filter(l=>l).forEach(l=>L(l,o.value))}),E("✅ Sync form complete","#d39e00")}let ge=!1;function et(){document.addEventListener("input",e=>{var r;if(ge||!e.target||!["INPUT","TEXTAREA"].includes(e.target.tagName))return;let t=te(F)??{};if(Object.keys(t).length===0)return;let n=e.target.id,o=e.target.name,a=null;if(n){const s=document.querySelector(`label[for="${n}"]`);s&&(a=s.textContent.trim())}if(!a){const s=e.target.closest("label");s&&(a=(r=Array.from(s.childNodes).find(i=>i.nodeType===3))==null?void 0:r.textContent.trim())}let l=t[n]||t[o]||t[a];if(l){ge=!0;try{const s=e.target.value;l.split(",").map(p=>p.trim()).filter(p=>p).forEach(p=>{p!==n&&p!==o&&p!==a&&L(p,s)})}finally{ge=!1}}})}function ne(e,t=null){try{const n=localStorage.getItem(e);return n!==null?JSON.parse(n):t}catch{return t}}function D(e,t){localStorage.setItem(e,JSON.stringify(t))}function tt(e,t,n,o){let a=ne(R)??"custom",l=ne(W)??{...K},r=ne(j)??{},s=ne(F)??{};const i=document.createElement("div");i.className="cw-tab-header";const p={custom:document.createElement("div"),default:document.createElement("div"),sync:document.createElement("div")};p.custom.innerText="📋 Custom",p.custom.className="cw-tab cw-tab-custom",p.default.innerText="📌 Default",p.default.className="cw-tab cw-tab-default",p.sync.innerText="🔗 Sync",p.sync.className="cw-tab cw-tab-sync";function g(){Object.values(p).forEach(x=>x.classList.remove("active")),p[a].classList.add("active")}g();const u=document.createElement("div");u.style.display=o.data?"none":"block";const m=t("📋 Cấu hình Data","data",x=>{u.style.display=x?"none":"block",n(e)}),d=document.createElement("div");d.className="cw-data-body";function y(){d.innerHTML="";let x=a==="sync"?s:a==="custom"?r:l,C=a==="sync"?F:a==="custom"?j:W;const v=Object.keys(x);v.length===0&&a!=="default"&&(d.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>'),v.forEach(S=>{const M=document.createElement("div");M.className="cw-data-row";let oe=a!=="default";const A=document.createElement("input");A.type="text",A.value=S,A.className="cw-data-key"+(oe?" mutable":""),A.readOnly=!oe,oe&&(A.onchange=()=>{const H=A.value.trim();if(!H||H===S){A.value=S;return}x[H]=x[S],delete x[S],D(C,x),y()});const z=document.createElement("input");if(z.type="text",z.value=x[S]??"",z.className="cw-data-val",z.oninput=()=>{x[S]=z.value,D(C,x)},M.appendChild(A),M.appendChild(z),oe){const H=document.createElement("button");H.innerHTML="✕",H.className="cw-del-btn",H.onclick=()=>{confirm(`Delete "${S}"?`)&&(delete x[S],D(C,x),y())},M.appendChild(H)}else M.appendChild(document.createElement("div")).className="cw-pad";d.appendChild(M)})}p.custom.onclick=()=>{a="custom",D(R,"custom"),g(),y()},p.default.onclick=()=>{a="default",D(R,"default"),g(),y()},p.sync.onclick=()=>{a="sync",D(R,"sync"),g(),y()};const w=document.createElement("button");w.innerText="📤",w.className="cw-icon-btn",w.onclick=()=>{const x=new Blob([JSON.stringify({defaultData:l,customData:r,syncData:s},null,2)],{type:"application/json"}),C=URL.createObjectURL(x),v=document.createElement("a");v.href=C,v.download=`vnpt_data_${Date.now()}.json`,v.click(),URL.revokeObjectURL(C)},u.appendChild(i),i.appendChild(p.custom),i.appendChild(p.default),i.appendChild(p.sync),u.appendChild(d),e.appendChild(m),e.appendChild(u);const k=e.querySelector("#vnpt-cw-fill"),N=e.querySelector("#vnpt-cw-sync"),f=e.querySelector("#vnpt-cw-add"),b=e.querySelector("#vnpt-cw-reset");k&&(k.onclick=Qe),N&&(N.onclick=Ze),f&&(f.onclick=()=>{a==="default"&&(a="custom",D(R,"custom"),g());let x=a==="sync"?s:r,C="new_field_"+Date.now();x[C]="",D(a==="sync"?F:j,x),y(),d.scrollTop=d.scrollHeight}),b&&(b.onclick=()=>{confirm("Reset Default Data?")&&(l={...K},D(W,l),y())}),y();const h=m.querySelector(".cw-right-wrap")||document.createElement("div");h.className="cw-right-wrap",h.prepend(w),m.appendChild(h)}function nt(){et()}function ot(e,t,n){let o=Number(localStorage.getItem(xe))||.08,a=U(ye)??{calc:!1,data:!0},l=U(ve)??{};function r(f,b){const h=document.createElement("button");return h.innerText=f,h.className="cw-action-btn "+b,h}function s(f,b,h){const x=document.createElement("div");x.className="wg-sec-header";const C=document.createElement("span");C.innerText=f;const v=document.createElement("button");return v.className="wg-toggle-btn",v.innerText=a[b]?"▾":"▴",x.appendChild(C),x.appendChild(v),v.onclick=()=>{a[b]=!a[b],v.innerText=a[b]?"▾":"▴",Z(ye,a),h(a[b])},x}function i(f){const b=window.innerWidth,h=window.innerHeight,x=f.getBoundingClientRect();f.style.left=Math.min(Math.max(parseFloat(f.style.left),0),b-x.width)+"px",f.style.top=Math.min(Math.max(parseFloat(f.style.top),0),h-36)+"px"}const p=document.createElement("div");p.className="cw-title-bar",p.innerHTML='<span class="cw-title-label">VNPT Fast</span>';const g=document.createElement("div");g.className="cw-btn-group";const u={fill:r("Fill","cw-btn-fill"),sync:r("Sync","cw-btn-sync"),add:r("Add","cw-btn-add"),reset:r("↺","cw-btn-reset")};u.reset.title="Reset Default fields",Object.values(u).forEach(f=>g.appendChild(f)),p.appendChild(g),e.appendChild(p);const m=document.createElement("div");m.className="cw-body-inline",m.innerHTML=`
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
    </div>`,t?t.appendChild(m):e.appendChild(m),tt(e,s,i,a);const d={taxRate:document.getElementById("wg-taxRate"),before:document.getElementById("wg-before"),tax:document.getElementById("wg-tax"),after:document.getElementById("wg-after"),text:document.getElementById("wg-text"),mapBtn:document.getElementById("wg-calc-map-btn"),mapWrap:document.getElementById("wg-calc-map-wrap")};d.taxRate.value=o*100,ee(re,"wg-before-list"),ee(le,"wg-after-list");function y(f,b){const h=Te(f,b,o);d.before.value=h.beforeStr,d.tax.value=h.taxStr,d.after.value=h.afterStr,d.text.value=h.textStr,Je(h,l)}d.taxRate.oninput=()=>{o=Number(d.taxRate.value)/100||0,Z(xe,o),y("before",d.before.value)},d.before.oninput=()=>{const f=Te("before",d.before.value,o);d.tax.value=f.taxStr,d.after.value=f.afterStr,d.text.value=f.textStr},d.before.onchange=()=>{y("before",d.before.value),Ce(re,d.before.value),ee(re,"wg-before-list")},d.tax.oninput=()=>y("tax",d.tax.value),d.after.oninput=()=>y("after",d.after.value),d.after.onchange=()=>{y("after",d.after.value),Ce(le,d.after.value),ee(le,"wg-after-list")},[d.before,d.tax,d.after,d.text].forEach(f=>{["click","focus"].forEach(b=>f.addEventListener(b,()=>{if(!f.value)return;navigator.clipboard.writeText(f.value);const h=f.style.backgroundColor;f.style.backgroundColor="#d1e7dd",setTimeout(()=>f.style.backgroundColor=h,300)}))}),d.mapBtn.onclick=()=>{const f=d.mapWrap.style.display==="flex";if(d.mapWrap.style.display=f?"none":"flex",!f){const b=h=>{!d.mapWrap.contains(h.target)&&h.target!==d.mapBtn&&(d.mapWrap.style.display="none",document.removeEventListener("click",b))};setTimeout(()=>document.addEventListener("click",b),0)}},e.querySelectorAll("input[data-clink]").forEach(f=>{const b=f.dataset.clink;f.value=(l[b]||[]).join(", "),f.oninput=()=>{l[b]=f.value.split(",").map(h=>h.trim()).filter(h=>h),Z(ve,l)}});const w=Array.from(e.children).filter(f=>f!==p),k=ke(e,[p],n,null,f=>{w.forEach(b=>b.style.display=f?"none":""),p.style.borderRadius=f?"8px":"0",f&&(e.style.top=window.innerHeight-(p.offsetHeight||34)+"px")}),N=U(n);return N&&N.docked&&k.setDocked(!0),window.addEventListener("resize",()=>{k.isDocked()?e.style.top=window.innerHeight-p.offsetHeight+"px":i(e)}),k}function at(){const e=document.getElementById("vnpt-inline-calc"),t=AppState.calcWidget||document.createElement("div");return AppState.calcWidget||(t.id="vnpt-calc-widget",document.body.appendChild(t),AppState.calcWidget=t),ot(t,e,Le)}function Ne(){ae.info("Initializing VNPT Userscript...");try{Be(),Ke(),Ue(),Pe(),pe(),$e(),We(),je(),at(),nt(),ae.info("Userscript initialized successfully.")}catch(e){ae.error("Error during userscript initialization:",e)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Ne):Ne()})();
