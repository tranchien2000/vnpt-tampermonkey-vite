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
(function(){"use strict";const ge={info:(...e)=>console.log("[Tampermonkey Script] INFO:",...e),error:(...e)=>console.error("[Tampermonkey Script] ERROR:",...e),warn:(...e)=>console.warn("[Tampermonkey Script] WARN:",...e)};function Fe(){GM_addStyle(`
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

        .btn-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .vnpt-btn-action { border: none; padding: 0 8px; height: 27px; min-width: 27px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; cursor: pointer; border-radius: 5px; transition: background 0.2s; white-space: nowrap; box-sizing: border-box; }

        .btn-scan { background: #fbbc04; color: #000; } .btn-scan:hover { background: #f2a500; }
        .btn-toggle-id { background: #e8f0fe; color: #1a73e8; } .btn-toggle-id:hover { background: #d2e3fc; }
        .btn-default-toggle { background: #e6f4ea; color: #1e8e3e; font-size: 14px; } .btn-default-toggle:hover { background: #ceead6; }
        .btn-add { background: #f1f3f4; color: #3c4043; } .btn-add:hover { background: #e8eaed; }
        .btn-fill-back { background: #ab47bc; color: #fff; } .btn-fill-back:hover { background: #8e24aa; }
        .btn-clean { background: #ea4335; color: #fff; } .btn-clean:hover { background: #d93025; }
        .btn-export { background: #1a73e8; color: white; padding: 4px 10px; font-size: 11px; font-weight: bold;} .btn-export:hover { background: #1557b0; }

        /* Popup Default Data */
        #vnpt-default-data-popup {
            position: absolute; top: 40px; right: 10px; 
            width: 250px; max-height: 250px; 
            background: #fff; border: 1px solid #dadce0; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
            border-radius: 8px; z-index: 100; 
            display: none; flex-direction: column; overflow: hidden;
        }
        .vdp-header { background: #f8f9fa; padding: 6px 10px; font-size: 11px; font-weight: 700; border-bottom: 1px solid #eee; color: #1e8e3e; display: flex; justify-content: space-between; align-items: center;}
        .vdp-list { overflow-y: auto; padding: 4px 0; }
        .vdp-item { 
            padding: 5px 10px; cursor: pointer; font-size: 11px; color: #3c4043; 
            display: flex; justify-content: space-between; align-items: center;
        }
        .vdp-item:hover { background: #e6f4ea; color: #1e8e3e; }
        .vdp-item .vdp-key { color: #888; font-family: monospace; font-size: 9px; margin-left: 10px; }

        #vnpt-template-section { border-top: 1px solid #e0e0e0; margin-top: 4px; padding-top: 6px; }
        
        .bottom-export-row { display: flex; gap: 4px; align-items: center; border-top: 1px solid #eee; margin-top: 4px; padding-top: 6px; }
        .bottom-export-row .vnpt-control-group { margin-bottom: 0; flex: 1; min-width: 0; }
        .bottom-export-row .vnpt-control-group input[type="file"] { width: 145px; }
        .bottom-export-row .vnpt-control-group input { padding: 4px; font-size: 11px; }
        .bottom-export-row .btn-export { flex: 0 0 auto; height: 26px; margin: 0; border-radius: 5px; }

        .text-hint { font-size: 11px; color: #666; font-style: italic; text-align: center; margin-bottom: 5px;}

        #vnpt-fields-container::-webkit-scrollbar { width: 5px; }
        #vnpt-fields-container::-webkit-scrollbar-thumb { background-color: #bbb; border-radius: 10px; }

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
    `)}const s={widget:null,panel:null,header:null,toggleBtn:null,fieldsContainer:null,calcWidget:null,draggedRowForVNPT:null},j={tenDaiDienn:"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT",emailDaiDien:"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Số GPKD | MST",goiDV:"Gói Dịch Vụ",ngayKy:"Ngày ký",thangKy:"Tháng Ký",namKy:"Năm ký",soHopDong:"Số Hợp đồng",soLuongGoi:"Số Lượng Gói"},Ee="vnpt_docx_fields",ke="vnpt_docx_position",Ce="vnpt_docx_size",me="vnpt_docx_opened",te="vnpt_autofill_data_default",W="vnpt_autofill_data_custom",F="vnpt_autofill_data_sync",Te="vnpt_widget_pos",Se="vnd_tax_rate",M="vnd_before_history",z="vnd_after_history",he="vnpt_widget_collapsed",Ne="vnd_calc_map",ne="vnpt_widget_datatab",Be="vnpt_templates";function D(e,n="#198754"){const t=document.createElement("div");t.innerText=e,Object.assign(t.style,{position:"fixed",bottom:"20px",left:"50%",transform:"translateX(-50%)",background:n,color:"#fff",padding:"7px 16px",borderRadius:"20px",zIndex:"100000",opacity:"0",transition:"opacity .25s",fontSize:"13px",fontFamily:"'Segoe UI',sans-serif",boxShadow:"0 4px 14px rgba(0,0,0,.25)"}),document.body.appendChild(t),setTimeout(()=>t.style.opacity="1",30),setTimeout(()=>{t.style.opacity="0",setTimeout(()=>t.remove(),280)},2200)}const Pe={local:{download(e,n="arraybuffer"){return new Promise((t,o)=>{const a=new FileReader;switch(a.onload=r=>{let l=r.target.result;n==="base64"&&typeof l=="string"&&(l=l.split(",")[1]||l),t(l)},a.onerror=r=>o(r),n.toLowerCase()){case"arraybuffer":a.readAsArrayBuffer(e);break;case"base64":case"dataurl":a.readAsDataURL(e);break;case"text":a.readAsText(e);break;default:o(new Error(`Unsupported read type: ${n}`))}})},async upload(e){return this.download(e,"base64")}}},Le={getAdapter(e){const n=Pe[e];if(!n)throw new Error(`Storage adapter not found: ${e}`);return n},async upload(e,n,t={}){return await this.getAdapter(e).upload(n,t)},async download(e,n,t={}){return await this.getAdapter(e).download(n,t.type||"arraybuffer")}},qe="vnpt_templates_db",P="buffers";let se=null;function be(){return se?Promise.resolve(se):new Promise((e,n)=>{const t=indexedDB.open(qe,1);t.onupgradeneeded=o=>{const a=o.target.result;a.objectStoreNames.contains(P)||a.createObjectStore(P)},t.onsuccess=o=>{se=o.target.result,e(se)},t.onerror=()=>n(t.error)})}async function Re(e,n){const t=await be();return new Promise((o,a)=>{const c=t.transaction(P,"readwrite").objectStore(P).put(n,e);c.onsuccess=()=>o(),c.onerror=()=>a(c.error)})}async function Ke(e){const n=await be();return new Promise((t,o)=>{const l=n.transaction(P,"readonly").objectStore(P).get(e);l.onsuccess=()=>t(l.result),l.onerror=()=>o(l.error)})}async function Ue(e){const n=await be();return new Promise((t,o)=>{const l=n.transaction(P,"readwrite").objectStore(P).delete(e);l.onsuccess=()=>t(),l.onerror=()=>o(l.error)})}function oe(){try{const e=JSON.parse(localStorage.getItem(Be))||[],n=e.filter(t=>t.type!=="local");return n.length!==e.length&&ae(n),n}catch{return[]}}function ae(e){localStorage.setItem(Be,JSON.stringify(e))}function $e(e){const n=e.match(/drive\.google\.com\/file\/d\/([^/]+)/);return n?`https://drive.google.com/uc?export=download&id=${n[1]}`:e}function je(e){return new Promise((n,t)=>{GM_xmlhttpRequest({method:"GET",url:$e(e),responseType:"arraybuffer",onload:o=>{if(o.status>=200&&o.status<300){if(o.response&&o.response.byteLength>4){const a=new Uint8Array(o.response.slice(0,4));if(a[0]===80&&a[1]===75&&a[2]===3&&a[3]===4){n(o.response);return}else{t(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}n(o.response)}else t(new Error(`HTTP ${o.status}: Không lấy được file`))},onerror:()=>t(new Error("Không thể tải URL.")),ontimeout:()=>t(new Error("Timeout khi tải URL."))})})}async function We(e,n,t){const o=e.name.replace(/\.docx$/i,""),a=prompt("Đặt tên biến nhớ cho file này:",o);if(!(!a||!a.trim()))try{const r=await e.arrayBuffer();await Re(a.trim(),r);const c=oe().filter(i=>i.name!==a.trim()&&i.fileName!==e.name);c.unshift({name:a.trim(),type:"local_idb",fileName:e.name,lastUsed:Date.now()}),ae(c),G(n,t),t&&t(r,a.trim())}catch(r){D(`❌ Lỗi lưu file: ${r.message}`,"#dc3545")}}function G(e,n,t=null){let o=e.querySelector(".vnpt-template-manager-inner"),a,r;if(o)a=o.querySelector(".vnpt-local-list-container"),r=o.querySelector(".vnpt-btn-wrap");else{e.innerHTML="",o=document.createElement("div"),o.className="vnpt-template-manager-inner";const i=document.createElement("div");i.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const g=document.createElement("span");g.className="vnpt-title-main",g.style.cssText="font-size:11px;font-weight:700;color:#444;",r=document.createElement("div"),r.className="vnpt-btn-wrap",r.style.cssText="display:flex;gap:4px;",i.appendChild(g),i.appendChild(r),o.appendChild(i),a=document.createElement("div"),a.className="vnpt-local-list-container",a.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",o.appendChild(a),e.appendChild(o)}const l=oe(),c=o.querySelector(".vnpt-title-main");c.innerHTML="📁 Bộ nhớ Templates"+(t?` <span style="color:#2e7d32;">(Đang dùng: ${t})</span>`:""),l.length===0?a.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':a.innerHTML="",l.forEach((i,g)=>{const u=document.createElement("div");u.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",u.title=i.fileName||i.url||i.name,u.tabIndex=0,u.onfocus=()=>u.style.boxShadow="0 0 0 2px #28a745",u.onblur=()=>u.style.boxShadow="none";const d=i.type==="local"||i.type==="local_base64"||i.type==="local_idb"?"OFF":"ON",p=d==="OFF"?"#6c757d":"#28a745",k=document.createElement("span");k.textContent=d,k.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${p};color:#fff;`;const N=document.createElement("span");N.textContent=i.name,N.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",u.onclick=()=>{u.focus(),Ge(i,n,t,e)},u.appendChild(k),u.appendChild(N);const C=document.createElement("button");C.innerHTML="✎",C.title="Đổi tên template",C.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",C.onclick=f=>{f.stopPropagation();const v=prompt("Đổi tên template:",i.name);if(v&&v.trim()&&v.trim()!==i.name){const h=oe();h[g].name=v.trim(),ae(h),G(e,n,t)}},u.appendChild(C);const T=document.createElement("button");T.innerHTML="✕",T.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",T.onclick=async f=>{if(f.stopPropagation(),confirm(`Xoá biểu mẫu "${i.name}"?`)){const v=oe();v.splice(g,1),ae(v),i.type==="local_idb"&&await Ue(i.name).catch(()=>null),G(e,n,t===i.name?null:t)}},u.appendChild(T),a.appendChild(u)})}function Ge(e,n,t,o){const a=oe(),r=a.find(l=>l.name===e.name&&(l.url===e.url||l.type===e.type));if(r&&(r.lastUsed=Date.now(),ae(a)),e.type==="local_idb"){Ke(e.name).then(l=>{if(!l)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");n&&n(l,e.name),G(o,n,e.name)}).catch(l=>{D(`❌ Lỗi nạp File IDB: ${l.message}`,"#dc3545")});return}if(e.type==="local_base64"&&e.data){try{const l=window.atob(e.data.split(",")[1]),c=l.length,i=new Uint8Array(c);for(let g=0;g<c;g++)i[g]=l.charCodeAt(g);n&&n(i.buffer,e.name),G(o,n,e.name)}catch(l){D(`❌ Lỗi nạp Base64: ${l.message}`,"#dc3545")}return}je(e.url).then(l=>{n&&n(l,e.name),G(o,n,e.name)}).catch(l=>{D(`❌ ${l.message}`,"#dc3545")})}function Xe(e){e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function O(e,n){var a;if(!e||e.disabled||e.readOnly)return;const t=e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,o=(a=Object.getOwnPropertyDescriptor(t,"value"))==null?void 0:a.set;o?o.call(e,n):e.value=n,Xe(e)}function de(e){const n=document.getElementById(e);if(n&&(n.tagName==="INPUT"||n.tagName==="TEXTAREA"))return n;for(const t of document.querySelectorAll("label"))if(t.textContent.trim()===e){if(t.htmlFor){const a=document.getElementById(t.htmlFor);if(a)return a}let o=t.parentElement;for(;o;){const a=o.querySelector("input,textarea");if(a)return a;if(o=o.parentElement,(o==null?void 0:o.tagName)==="FORM")break}}return null}function pe(e){for(const n of document.querySelectorAll("label"))if(n.innerText.trim()===e)return n.parentElement.querySelector("input, textarea");return null}function V(e,n){const t=de(e)||pe(e);t&&O(t,n)}function q(e,n=null){try{const t=localStorage.getItem(e);return t!==null?JSON.parse(t):n}catch{return n}}function A(e,n){localStorage.setItem(e,JSON.stringify(n))}const xe=new Date,ye=String(xe.getDate()).padStart(2,"0"),ue=String(xe.getMonth()+1).padStart(2,"0"),fe=String(xe.getFullYear()),ie={ngayKy:ye,thangKy:ue,namKy:fe,ngayTiepNhan:`${ye}/${ue}/${fe}`,ngayThangNamKy:`${ye}/${ue}/${fe}`,thangKy1:ue,namKy1:fe,tenDoanhNghiepB:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM",diaChiB:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội",maSoThueB:"0100686223",stkB:"1600114156",diaChiStkB:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)",tenB:"Phạm Khánh Chung",nguoiDaiDienB:"Phạm Khánh Chung",chucVuB:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",chucVuDaiDienB:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",giayUyQuyenSoB:"2628/GUQ-VNPT-HNI-VP",soGiayUyQuyenB:"2628/GUQ-VNPT-HNI-VP",giayUyQuyenNgayB:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",ngayGiayUyQuyenB:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",GiayUyQuyenB:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",tenDoanhNghiepB1:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",donViTiepNhan:"TTKD KHDN",tenTiepNhan:"Bùi Anh",tenNguoiNhan:"Bùi Anh",dienThoaiB:"02436686868",diaChiTaiKhoanB:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 ",noiKy:"Hà Nội",emailB:"",lienheHopDongB:"AM Bùi Anh",lienheTuVanB:"AM Bùi Anh",lienheHoaDonB:"AM Bùi Anh",sucoCap1B:"AM Bùi Anh",sucoCap2B:"AM Bùi Anh",sucoCap3B:"AM Bùi Anh",sucoCap4B:"AM Bùi Anh"},De=["lienheHopDongA","lienheHoaDonA","lienheTuVanA","sucoCap1A","sucoCap2A","sucoCap3A","sucoCap4A"];let R=q(te)??{...ie},X=q(W)??{},re=q(F)??{},E=q(ne)??"custom";function Je(){R=q(te)??{...ie},X=q(W)??{};const e={...R,...X};let n="";for(let t of De){const o=de(t)||pe(t);if(o&&o.value){n=o.value;break}}n&&De.forEach(t=>V(t,n)),Object.keys(e).forEach(t=>{let o=de(t)||pe(t);o&&O(o,e[t])}),D("✅ Auto fill complete")}function Qe(){let e=q(F)??{};const n=Object.keys(e);if(n.length===0){D("⚠️ No sync mapping","#ffc107");return}n.forEach(t=>{let o=de(t)||pe(t);o&&o.value!==void 0&&o.value!==""&&e[t].split(",").map(r=>r.trim()).filter(r=>r).forEach(r=>V(r,o.value))}),D("✅ Sync form complete","#d39e00")}function Ye(e,n,t,o){const a=document.createElement("div");a.className="cw-tab-header";const r=document.createElement("div");r.innerText="📋 Custom",r.className="cw-tab cw-tab-custom";const l=document.createElement("div");l.innerText="🔗 Sync",l.className="cw-tab cw-tab-sync";const c=document.createElement("div");c.innerText="📌 Default",c.className="cw-tab cw-tab-default";function i(){r.classList.remove("active"),c.classList.remove("active"),l.classList.remove("active"),E==="custom"?r.classList.add("active"):E==="default"?c.classList.add("active"):l.classList.add("active")}i(),a.appendChild(r),a.appendChild(c),a.appendChild(l);const g=document.createElement("div");g.style.display=o.data?"none":"block";const u=n("📋 Cấu hình Data","data",f=>{g.style.display=f?"none":"block",t(e)}),d=document.createElement("button");d.innerText="📥",d.title="Import JSON";const p=document.createElement("button");p.innerText="📤",p.title="Export JSON",[d,p].forEach(f=>f.className="cw-icon-btn");const k=u.querySelector(".wg-toggle-btn"),N=document.createElement("div");N.className="cw-right-wrap",N.appendChild(d),N.appendChild(p),N.appendChild(k),u.appendChild(N);const C=document.createElement("div");C.className="cw-data-body",g.appendChild(a),g.appendChild(C),e.appendChild(u),e.appendChild(g);function T(){C.innerHTML="";let f=E==="sync"?re:E==="custom"?X:R;const v=Object.keys(f);if(v.length===0&&(E==="custom"||E==="sync")){C.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>';return}v.forEach(x=>{const S=document.createElement("div");S.className="cw-data-row";let _=E==="custom"||E==="sync";const w=document.createElement("input");w.type="text",w.value=x,w.title=x,w.className="cw-data-key"+(_?" mutable":""),w.readOnly=!_,_&&(w.onchange=()=>{const L=w.value.trim();if(!L||L===x){w.value=x;return}if(f.hasOwnProperty(L)){alert(`Nhãn "${L}" đã tồn tại!`),w.value=x;return}f[L]=f[x],delete f[x],A(E==="sync"?F:W,f),T()});const B=document.createElement("input");if(B.type="text",B.value=f[x]??"",B.className="cw-data-val",B.oninput=()=>{f[x]=B.value,A(E==="sync"?F:E==="custom"?W:te,f)},E==="sync"&&(B.placeholder="Các nhãn đích..."),S.appendChild(w),S.appendChild(B),E==="custom"||E==="sync"){const L=document.createElement("button");L.innerHTML="✕",L.className="cw-del-btn",L.onclick=()=>{confirm(`Delete "${x}"?`)&&(delete f[x],E==="custom"&&A(W,f),E==="sync"&&A(F,f),T())},S.appendChild(L)}else{const L=document.createElement("div");L.className="cw-pad",S.appendChild(L)}C.appendChild(S)});const h=document.createElement("div");h.className="cw-data-hint",h.innerText=`${v.length} fields · auto-saved`,C.appendChild(h)}T(),r.onclick=()=>{E="custom",A(ne,"custom"),i(),T()},c.onclick=()=>{E="default",A(ne,"default"),i(),T()},l.onclick=()=>{E="sync",A(ne,"sync"),i(),T()},p.onclick=()=>{const f={defaultData:R,customData:X,syncData:re},v=new Blob([JSON.stringify(f,null,2)],{type:"application/json"}),h=URL.createObjectURL(v),x=document.createElement("a");x.href=h,x.download=`vnpt_data_${Date.now()}.json`,x.click(),URL.revokeObjectURL(h)},d.onclick=()=>{const f=document.createElement("input");f.type="file",f.accept=".json",f.onchange=async v=>{const h=v.target.files[0];if(h)try{const x=await Le.download("local",h,{type:"text"}),S=JSON.parse(x);S.defaultData&&(R=S.defaultData,A(te,R)),S.customData&&(X=S.customData,A(W,X)),S.syncData&&(re=S.syncData,A(F,re)),T(),D("✅ Import successful!")}catch{alert("Invalid JSON file format or error reading file!")}},f.click()},e.querySelector("#vnpt-cw-fill").onclick=Je,e.querySelector("#vnpt-cw-sync").onclick=Qe,e.querySelector("#vnpt-cw-add").onclick=()=>{E==="default"&&(E="custom",A(ne,"custom"),i());let f=E==="sync"?re:X,v=1,h="new_field";for(;f.hasOwnProperty(h);)h="new_field_"+v,v++;f[h]="",A(E==="sync"?F:W,f),o.data&&(o.data=!1,A(he,o),g.style.display="block",u.querySelector(".wg-toggle-btn").innerText="▴"),T(),C.scrollTop=C.scrollHeight},e.querySelector("#vnpt-cw-reset").onclick=()=>{confirm("Reset [Default Data] to hardcoded values?")&&(R={...ie},A(te,R),E==="default"&&T(),D("Reset complete","#17a2b8"))}}let ve=!1;document.addEventListener("input",e=>{var c,i,g;if(ve||!e.target||!["INPUT","TEXTAREA"].includes(e.target.tagName))return;let n=q(F)??{};if(Object.keys(n).length===0)return;let t=e.target.id,o=e.target.name,a=null,r=null;if(t){const u=document.querySelector(`label[for="${t}"]`);u&&(a=u.textContent.trim(),r=(c=u.innerText)==null?void 0:c.trim())}if(!a){const u=e.target.closest("label");u&&(a=(i=Array.from(u.childNodes).find(d=>d.nodeType===3))==null?void 0:i.textContent.trim(),r=(g=u.innerText)==null?void 0:g.trim())}let l=n[t]||n[o]||n[a]||n[r];if(l){ve=!0;try{const u=e.target.value;l.split(",").map(p=>p.trim()).filter(p=>p).forEach(p=>{p!==t&&p!==o&&p!==a&&p!==r&&V(p,u)})}finally{ve=!1}}});function J(e,n,t=null,o=""){const a=s.fieldsContainer.querySelector(".text-hint");a&&a.remove();const r=s.fieldsContainer.querySelectorAll(".f-key");let l=!1;for(let c of r)if(c.value===e){const i=c.closest(".vnpt-field-row"),g=i.querySelector(".f-val"),u=i.querySelector(".f-label"),d=i.querySelector(".f-sync");n!==""&&(g.value=n),t!==null&&t!==""&&(u.value=t),o!==""&&(d.value=o),l=!0;break}if(!l){(t===null||t==="")&&(t=j[e]||"");const c=document.createElement("div");c.className="vnpt-field-row row-item",c.setAttribute("draggable","false"),c.innerHTML=`
            <input type="checkbox" class="row-chk" title="Chọn để thao tác hàng loạt" style="margin: 0 2px 0 2px;" />
            <input type="text" class="f-label" placeholder="Nhãn..." value="${t}" />
            <input type="text" class="f-key" placeholder="Mã biến" value="${e}" />
            <input type="text" class="f-sync" placeholder="🔗 Đồng bộ" value="${o}" title="Nhập các ID đích trên web, cách nhau bởi dấu phẩy" />
            <span class="row-drag-handle" title="Kéo thả để di chuyển">=</span>
            <input type="text" class="f-val" placeholder="Giá trị" value="${n}" />
        `;const i=c.querySelector(".f-val"),g=c.querySelector(".f-sync");e==="tenToChuc"&&(i.style.textAlign="right"),c.querySelector(".f-key").addEventListener("keyup",function(){H(),i.style.textAlign=this.value.trim()==="tenToChuc"?"right":""}),c.querySelector(".f-label").addEventListener("keyup",H),g.addEventListener("keyup",H),i.addEventListener("keyup",function(){H();const d=g.value.split(",").map(p=>p.trim()).filter(p=>p);d.length>0&&d.forEach(p=>V(p,this.value))});const u=c.querySelector(".row-drag-handle");u.addEventListener("mouseenter",()=>c.setAttribute("draggable","true")),u.addEventListener("mouseleave",()=>{c.classList.contains("dragging")||c.setAttribute("draggable","false")}),c.addEventListener("dragstart",function(d){s.draggedRowForVNPT=this,d.dataTransfer.effectAllowed="move",d.dataTransfer.setData("text/plain",e),this.classList.add("dragging")}),c.addEventListener("dragover",function(d){return d.preventDefault(),d.dataTransfer.dropEffect="move",!1}),c.addEventListener("dragenter",function(d){this.classList.add("over")}),c.addEventListener("dragleave",function(d){this.classList.remove("over")}),c.addEventListener("drop",function(d){if(d.stopPropagation(),s.draggedRowForVNPT&&s.draggedRowForVNPT!==this){const p=Array.from(s.fieldsContainer.querySelectorAll(".vnpt-field-row")),k=p.indexOf(s.draggedRowForVNPT),N=p.indexOf(this);k<N?this.parentNode.insertBefore(s.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(s.draggedRowForVNPT,this),H()}return!1}),c.addEventListener("dragend",function(d){this.setAttribute("draggable","false"),s.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(k=>{k.classList.remove("over"),k.classList.remove("dragging")}),s.draggedRowForVNPT=null}),s.fieldsContainer.appendChild(c),s.fieldsContainer.scrollTop=s.fieldsContainer.scrollHeight}}async function H(){const e={};s.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(t=>{const o=t.querySelector(".f-key").value.trim(),a=t.querySelector(".f-label").value.trim(),r=t.querySelector(".f-val").value,l=t.querySelector(".f-sync").value.trim();o&&(e[o]={label:a,value:r,sync:l})}),localStorage.setItem(Ee,JSON.stringify(e))}async function Ze(){try{const e=JSON.parse(localStorage.getItem(Ee));if(e&&Object.keys(e).length>0){s.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(n=>n.remove());for(const n in e){let t=e[n];typeof t=="object"&&t!==null?J(n,t.value,t.label,t.sync||""):J(n,t,"","")}}}catch(e){console.error("Error loading config:",e)}try{const e=JSON.parse(localStorage.getItem(ke));e&&s.widget&&(s.widget.style.bottom="auto",e.right?(s.widget.style.right=e.right,s.widget.style.left="auto"):e.left&&(s.widget.style.left=e.left,s.widget.style.right="auto"),e.top&&(s.widget.style.top=e.top))}catch{}}function et(){document.getElementById("vnpt-btn-toggle-id").addEventListener("click",function(){s.fieldsContainer.classList.toggle("show-ids")}),document.getElementById("vnpt-btn-batch-del").addEventListener("click",function(){const e=s.fieldsContainer.querySelectorAll(".vnpt-field-row");let n=0;e.forEach(t=>{const o=t.querySelector(".row-chk");o&&o.checked&&(t.remove(),n++)}),n===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(e.forEach(t=>t.remove()),D("🗑️ Đã xóa toàn bộ","#ff5252"),H()):(D(`🗑️ Đã xóa ${n} trường`,"#ff5252"),H())}),document.getElementById("vnpt-btn-add").addEventListener("click",function(){const e=s.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;J("bien_moi_"+e,"","",""),H()}),document.getElementById("vnpt-btn-fill-back").addEventListener("click",function(){const e=s.fieldsContainer.querySelectorAll(".vnpt-field-row");let n=0;e.forEach(t=>{const o=t.querySelector(".f-key").value.trim(),a=t.querySelector(".f-val").value;o&&(document.getElementById(o)||document.getElementsByName(o)[0])&&(V(o,a),n++)}),n>0?D(`✅ Đã điền ngược ${n} trường vào web`,"#198754"):D("⚠️ Không có trường nào khớp","#ffc107")})}function tt(e){if(!e)return;e.innerHTML="",Object.keys(ie).forEach(t=>{const o=document.createElement("div");o.className="vdp-item",o.innerHTML=`
            <span class="vdp-label">${j[t]||t}</span>
            <span class="vdp-key">${t}</span>
        `,o.onclick=()=>{J(t,ie[t],j[t]||""),H(),D(`📌 Đã thêm: ${j[t]||t}`)},e.appendChild(o)});const n=document.createElement("div");n.style.cssText="font-size: 10px; color: #999; padding: 10px; text-align: center; border-top: 1px solid #eee;",n.innerText="Nhấn vào một trường để thêm nhanh vào danh sách xuất hợp đồng.",e.appendChild(n)}function nt(){const e=document.createElement("div");e.id="vnpt-docx-widget";const n=localStorage.getItem(me)==="true";e.innerHTML=`
        <button id="vnpt-toggle-btn" title="Mở/Đóng UI Hợp đồng" class="${n?"btn-opened":"btn-closed"}">${n?"✖":"📄"}</button>

        <div id="vnpt-export-panel" style="display: ${n?"flex":"none"};">
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
                <div id="vnpt-default-data-popup">
                    <div class="vdp-header">📌 Dữ liệu mặc định <span id="vdp-close" style="cursor:pointer;">✕</span></div>
                    <div class="vdp-list" id="vdp-list"></div>
                </div>
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
    `,document.body.appendChild(e),s.widget=e,s.panel=document.getElementById("vnpt-export-panel"),s.toggleBtn=document.getElementById("vnpt-toggle-btn"),s.header=document.getElementById("vnpt-panel-header"),s.fieldsContainer=document.getElementById("vnpt-fields-container");try{const r=JSON.parse(localStorage.getItem(Ce));r&&r.width&&r.height&&(s.panel.style.width=r.width+"px",s.panel.style.height=r.height+"px")}catch(r){console.error("Lỗi load size panel:",r)}new ResizeObserver(r=>{if(s.panel.style.display!=="none")for(let l of r){const{width:c,height:i}=l.contentRect;c>0&&i>0&&localStorage.setItem(Ce,JSON.stringify({width:Math.round(c+20),height:Math.round(i+20)}))}}).observe(s.panel);const o=document.getElementById("vnpt-default-data-popup"),a=document.getElementById("vdp-list");tt(a),document.getElementById("vnpt-btn-default").onclick=r=>{const l=o.style.display==="flex";o.style.display=l?"none":"flex"},document.getElementById("vdp-close").onclick=()=>{o.style.display="none"},G(document.getElementById("vnpt-template-manager"),(r,l)=>{s.templateBuffer=r,s.templateName=l}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const r=this.files&&this.files[0];if(!r)return;const l=document.getElementById("vnpt-template-manager");We(r,l,(c,i)=>{s.templateBuffer=c,s.templateName=i}),this.value=""}),s.panelBody=document.getElementById("vnpt-panel-body"),s.toggleBtn.addEventListener("click",r=>{s.hasDragged||(s.panel.style.display==="none"?(s.panel.style.display="flex",s.toggleBtn.className="btn-opened",s.toggleBtn.innerHTML="✖",localStorage.setItem(me,"true")):(s.panel.style.display="none",s.toggleBtn.className="btn-closed",s.toggleBtn.innerHTML="📄",localStorage.setItem(me,"false")))})}function Ie(e,n,t,o=null,a=null){let r=!1,l=0,c=0,i=!1;function g(d){i!==d&&(i=d,a&&a(d))}function u(d){if(d.button!==0)return;r=!0,s.hasDragged=!1;const p=e.getBoundingClientRect();l=d.clientX-p.left,c=d.clientY-p.top,document.body.style.userSelect="none",n&&n.forEach(k=>k.style.cursor="grabbing"),o&&o(),d.preventDefault()}return n.forEach(d=>{d.addEventListener("mousedown",u)}),document.addEventListener("mousemove",function(d){if(!r)return;s.hasDragged=!0;let p=d.clientX-l,k=d.clientY-c;const N=window.innerWidth,C=window.innerHeight,T=document.getElementById("vnpt-toggle-btn"),f=T?T.offsetWidth:40,v=T?T.offsetHeight:40,h=e.id==="vnpt-docx-widget";let x=e.offsetWidth||0;if(h){let w=f+6-x,B=N-x+6;p<w&&(p=w),p>B&&(p=B)}else x=x||200,p<0&&(p=0),p+x>N&&(p=Math.max(0,N-x));let S=i;if(h?S=!1:i?d.clientY<C-40&&(S=!1):d.clientY>C-10&&(S=!0),k<0&&(k=0),S)g(!0),e.style.top=C-e.offsetHeight+"px",h?(e.style.right=N-p-x+"px",e.style.left="auto"):(e.style.left=p+"px",e.style.right="auto"),e.style.bottom="auto";else{g(!1);let _=e.offsetHeight||40,w;if(h)w=10+v;else{const B=e.querySelector(".cw-title-bar");w=B?B.offsetHeight:_}k+w>C&&(k=Math.max(0,C-w)),e.style.top=k+"px",h?(e.style.right=N-p-x+"px",e.style.left="auto"):(e.style.left=p+"px",e.style.right="auto"),e.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(r&&(r=!1,document.body.style.userSelect="",n&&n.forEach(d=>d.style.cursor="grab"),t)){const d=e.id==="vnpt-docx-widget";localStorage.setItem(t,JSON.stringify({left:d?void 0:e.style.left,right:d?e.style.right:void 0,top:e.style.top,x:d?void 0:parseFloat(e.style.left),y:parseFloat(e.style.top),docked:i}))}}),{isDocked:()=>i,setDocked:g}}function ot(){s.widget&&s.header&&s.toggleBtn&&(Ie(s.widget,[s.header,s.toggleBtn],ke),window.addEventListener("resize",()=>{const e=window.innerWidth,n=window.innerHeight,t=document.getElementById("vnpt-toggle-btn"),o=t?t.offsetWidth:40,a=t?t.offsetHeight:40;let r=s.widget.getBoundingClientRect(),l=r.left,c=r.top,i=s.widget.offsetWidth||0,u=o+6-i,d=e-i+6;l<u&&(l=u),l>d&&(l=d),c+10+a>n&&(c=Math.max(0,n-(10+a))),s.widget.style.right=e-l-i+"px",s.widget.style.top=c+"px"}))}function at(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){let e=0;Object.keys(j).forEach(n=>{var a;const t=document.getElementById(n);let o="";if(t&&(o=t.tagName.toLowerCase()==="select"?((a=t.options[t.selectedIndex])==null?void 0:a.text)||"":t.value,e++),!o){const r=n.toLowerCase(),l=new Date;r==="ngayky"&&(o=String(l.getDate()).padStart(2,"0")),(r==="thangky"||r==="thangky1")&&(o=String(l.getMonth()+1).padStart(2,"0")),(r==="namky"||r==="namky1")&&(o=String(l.getFullYear())),r==="soluonggoi"&&(o="1")}J(n,o,null)}),H(),e>0?(this.style.background="#34a853",this.style.color="#fff",this.innerText="Done",setTimeout(()=>{this.style.background="#fbbc04",this.style.color="#000",this.innerText="Quét"},1e3)):D("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(e){e.target&&e.target.id&&j[e.target.id]!==void 0&&(J(e.target.id,e.target.value,null),H())}),document.addEventListener("change",function(e){var n;if(e.target&&e.target.id&&j[e.target.id]!==void 0){let t=e.target.tagName.toLowerCase()==="select"?((n=e.target.options[e.target.selectedIndex])==null?void 0:n.text)||"":e.target.value;J(e.target.id,t,null),H()}})}function Ae(e,n,t){try{let o;try{o=new window.PizZip(e)}catch(i){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(i);return}const a=new window.docxtemplater(o,{paragraphLoop:!0,linebreaks:!0});a.render(n);const r=a.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),l=URL.createObjectURL(r),c=document.createElement("a");c.href=l,c.download=t,document.body.appendChild(c),c.click(),setTimeout(()=>{document.body.removeChild(c),URL.revokeObjectURL(l)},100)}catch(o){let a=o.message;o.properties&&o.properties.errors instanceof Array?a=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+o.properties.errors.map(l=>"- "+(l.properties.explanation||l.message)).join(`
`):a="Lỗi phần mềm Word sinh ra: "+a,alert(a),console.error("DocX Error:",o)}}function it(){const e=document.getElementById("vnpt-export-filename");e&&e.addEventListener("input",()=>{e.dataset.userEdited="1",e.value.trim()||(e.dataset.userEdited="0")});function n(){if(!e||e.dataset.userEdited==="1")return;let t="";if(s.fieldsContainer&&s.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(i=>{const g=i.querySelector(".f-key").value.trim(),u=i.querySelector(".f-val").value.trim();g==="tenToChuc"&&(t=u)}),!t){const c=document.getElementById("tenToChuc");c&&(t=c.tagName.toLowerCase()==="textarea"||c.tagName.toLowerCase()==="input"?c.value.trim():c.innerText.trim())}function o(c){if(!c)return"";let i=c;return i=i.replace(/Tổng công ty/gi,""),i=i.replace(/Công ty/gi,""),i=i.replace(/\bCty\b/gi,""),i=i.replace(/Trách nhiệm hữu hạn/gi,""),i=i.replace(/\bTNHH\b/gi,""),i=i.replace(/Cổ phần/gi,""),i=i.replace(/\bCP\b/gi,""),i=i.replace(/Một thành viên/gi,""),i=i.replace(/\bMTV\b/gi,""),i=i.replace(/Chi nhánh/gi,""),i=i.replace(/Việt Nam/gi,"VN"),i=i.replace(/Viet Nam/gi,"VN"),i=i.replace(/\s+/g," ").trim(),i=i.replace(/^[-,\s]+|[-,\s]+$/g,""),i.length>50&&(i=i.substring(0,47)+"..."),i.replace(/[<>:"/\\|?*]/g,"")}let a=o(t),r=s.templateName?s.templateName.replace(/\.docx$/i,""):"",l=[];a&&l.push(a),r&&l.push(r),l.length>0?e.value=l.join(" - ")+".docx":e.value||(e.value="HopDong_Auto.docx")}setInterval(n,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const t={};if(s.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(l=>{const c=l.querySelector(".f-key").value.trim(),i=l.querySelector(".f-val").value;c&&(t[c]=i)}),Object.keys(t).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}let a=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(a.toLowerCase().endsWith(".docx")||(a+=".docx"),s.templateBuffer){Ae(s.templateBuffer,t,a);return}const r=document.getElementById("vnpt-template-file");if(r.files&&r.files.length>0){Le.download("local",r.files[0],{type:"arraybuffer"}).then(l=>Ae(l,t,a)).catch(l=>alert(`Lỗi đọc file: ${l.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')})}function rt(){function e(){const o=document.getElementById("chucVu");o&&!o.dataset.filled&&(o.dataset.filled="1",O(o,"Giám Đốc"));const a=document.getElementById("noiCap");a&&!a.dataset.filled&&(a.dataset.filled="1",O(a,"Cục trưởng Cục Cảnh sát QLHC về TTXH"));const r=document.getElementById("noiCapSoDkdn");r&&!r.dataset.filled&&(r.dataset.filled="1",O(r,""));const l=document.getElementById("duong"),c=document.getElementById("diaChiTruSoDuong");l&&c&&!l.dataset.bound&&(l.dataset.bound="1",l.addEventListener("input",()=>O(c,l.value)));const i=document.getElementById("sdt"),g=document.getElementById("sdtToChuc");i&&g&&!i.dataset.bound&&(i.dataset.bound="1",i.addEventListener("input",()=>O(g,i.value)));const u=document.getElementById("emailDaiDien"),d=document.getElementById("emailCongTy");u&&d&&!u.dataset.bound&&(u.dataset.bound="1",u.addEventListener("input",()=>O(d,u.value)));const p=document.getElementById("soDkdn"),k=document.getElementById("maSoThue");p&&k&&!p.dataset.bound&&(p.dataset.bound="1",p.addEventListener("input",()=>O(k,p.value)))}let n;new MutationObserver(()=>{clearTimeout(n),n=setTimeout(e,200)}).observe(document.body,{childList:!0,subtree:!0}),e()}function I(e){return e.toLocaleString("en-US")}function K(e){return Number(String(e).replace(/[^\d]/g,""))||0}function He(e){return e.charAt(0).toUpperCase()+e.slice(1)}const le=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function lt(e){let n=Math.floor(e/100),t=Math.floor(e%100/10),o=e%10,a="";return n>0&&(a+=le[n]+" trăm ",t===0&&o>0&&(a+="lẻ ")),t>1?(a+=le[t]+" mươi ",o===1?a+="mốt":o===5?a+="lăm":o>0&&(a+=le[o])):t===1?(a+="mười ",o===5?a+="lăm":o>0&&(a+=le[o])):o>0&&(n>0&&(a+="lẻ "),a+=le[o]),a.trim()}function _e(e){if(e===0)return"không";const n=["","nghìn","triệu","tỷ"];let t="",o=0;for(;e>0;){const a=e%1e3;a>0&&(t=lt(a)+" "+n[o]+" "+t),e=Math.floor(e/1e3),o++}return t.trim()}function ce(e,n=null){try{const t=localStorage.getItem(e);return t!==null?JSON.parse(t):n}catch{return n}}function we(e,n){localStorage.setItem(e,JSON.stringify(n))}let Q=Number(localStorage.getItem(Se))||.08,U=ce(he)??{calc:!1,data:!0};function ee(e,n){if(!n||n.replace(/\D/g,"").length<6)return;let t=ce(e,[]);t=t.filter(o=>o!==n),t.unshift(n),we(e,t.slice(0,10))}function $(e,n){const t=document.getElementById(n);t&&(t.innerHTML=ce(e,[]).map(o=>`<option value="${o}">`).join(""))}function Me(e){const n=window.innerWidth,t=window.innerHeight,o=e.getBoundingClientRect();e.style.left=Math.min(Math.max(parseFloat(e.style.left),0),n-o.width)+"px",e.style.top=Math.min(Math.max(parseFloat(e.style.top),0),t-36)+"px"}function ct(e,n,t){const o=document.createElement("div");o.className="wg-sec-header";const a=document.createElement("span");a.innerText=e;const r=document.createElement("button");return r.className="wg-toggle-btn",r.innerText=U[n]?"▾":"▴",o.appendChild(a),o.appendChild(r),r.onclick=()=>{U[n]=!U[n],r.innerText=U[n]?"▾":"▴",we(he,U),t(U[n])},o}function st(){const e=document.createElement("div");e.id="vnpt-calc-widget";const n=ce(Te),t=!!(n&&n.docked);Object.assign(e.style,{top:n&&n.y?n.y+"px":"16px",left:n&&n.x?n.x+"px":window.innerWidth-236+"px"});function o(m,y){const b=document.createElement("button");return b.innerText=m,b.className="cw-action-btn "+y,b}const a=o("Fill","cw-btn-fill");a.id="vnpt-cw-fill";const r=o("Sync","cw-btn-sync");r.id="vnpt-cw-sync",r.title="Manual trigger for Sync Mapping";const l=o("Add","cw-btn-add");l.id="vnpt-cw-add";const c=o("↺","cw-btn-reset");c.id="vnpt-cw-reset",c.title="Reset Default fields back to original";const i=document.createElement("div");i.className="cw-btn-group",i.appendChild(a),i.appendChild(r),i.appendChild(l),i.appendChild(c);const g=document.createElement("div");g.className="cw-title-bar";const u=document.createElement("span");u.className="cw-title-label",u.innerHTML="VNPT Fast",g.appendChild(u),g.appendChild(i),e.appendChild(g),U.calc=!1;const d=document.createElement("div");d.className="cw-body-inline",d.innerHTML=`
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
    `;const p=document.getElementById("vnpt-inline-calc");p?p.appendChild(d):e.appendChild(d),document.body.appendChild(e),s.calcWidget=e,Ye(e,ct,Me,U);const k=Array.from(e.children).filter(m=>m!==g);function N(m){k.forEach(y=>{y.style.display=m?"none":""}),g.style.borderRadius=m?"8px":"0",e.style.borderRadius=m?"8px":"10px",e.style.boxShadow=m?"0 -3px 16px rgba(25,135,84,0.55)":"0 4px 24px rgba(0,0,0,.3)",m&&(e.style.top=window.innerHeight-(g.offsetHeight||34)+"px")}const C=Ie(e,[g],Te,null,m=>{N(m)});t&&C.setDocked(!0),window.addEventListener("resize",()=>{C.isDocked()?e.style.top=window.innerHeight-g.offsetHeight+"px":Me(e)});const T=document.getElementById("wg-taxRate"),f=document.getElementById("wg-before"),v=document.getElementById("wg-tax"),h=document.getElementById("wg-after"),x=document.getElementById("wg-text"),S=document.getElementById("wg-calc-map-btn"),_=document.getElementById("wg-calc-map-wrap");let w=ce(Ne)??{};S.onclick=m=>{const y=_.style.display==="flex";if(_.style.display=y?"none":"flex",!y){const b=Y=>{!_.contains(Y.target)&&Y.target!==S&&(_.style.display="none",document.removeEventListener("click",b))};setTimeout(()=>document.addEventListener("click",b),0)}},e.querySelectorAll("input[data-clink]").forEach(m=>{const y=m.dataset.clink;m.value=(w[y]||[]).join(", "),m.addEventListener("input",()=>{w[y]=m.value.split(",").map(b=>b.trim()).filter(b=>b),we(Ne,w)})}),T.value=Q*100,$(M,"wg-before-list"),$(z,"wg-after-list");function B(m,y,b){const Y=He(_e(b))+" đồng";x.value=Y,(w.before||[]).forEach(Z=>V(Z,I(m))),(w.tax||[]).forEach(Z=>V(Z,I(y))),(w.after||[]).forEach(Z=>V(Z,I(b))),(w.text||[]).forEach(Z=>V(Z,Y))}function L(){const m=K(f.value),y=Math.round(m*Q),b=m+y;v.value=I(y),h.value=I(b),B(m,y,b)}function Oe(){const m=K(v.value),y=Math.round(m/Q),b=y+m;f.value=I(y),h.value=I(b),B(y,m,b)}function Ve(){const m=K(h.value),y=Math.round(m/(1+Q)),b=m-y;f.value=I(y),v.value=I(b),B(y,b,m)}T.addEventListener("input",()=>{Q=Number(T.value)/100||0,localStorage.setItem(Se,Q),L()}),f.addEventListener("input",()=>{const m=K(f.value),y=Math.round(m*Q),b=m+y;v.value=I(y),h.value=I(b),x.value=He(_e(b))+" đồng"}),f.addEventListener("blur",()=>{f.value=I(K(f.value)),ee(M,f.value),$(M,"wg-before-list")}),f.addEventListener("change",()=>{f.value=I(K(f.value)),ee(M,f.value),$(M,"wg-before-list"),L()}),v.addEventListener("input",Oe),h.addEventListener("input",Ve),h.addEventListener("blur",()=>{h.value=I(K(h.value)),ee(z,h.value),$(z,"wg-after-list")}),h.addEventListener("change",()=>{h.value=I(K(h.value)),ee(z,h.value),$(z,"wg-after-list"),Ve()}),[{el:f,key:M},{el:v,key:null},{el:h,key:z},{el:x,key:null}].forEach(m=>{m.el&&["click","focus"].forEach(y=>{m.el.addEventListener(y,b=>{if(b.target.value){navigator.clipboard.writeText(b.target.value),m.key===M&&(ee(M,b.target.value),$(M,"wg-before-list")),m.key===z&&(ee(z,b.target.value),$(z,"wg-after-list"));const Y=b.target.style.backgroundColor;b.target.style.backgroundColor="#d1e7dd",setTimeout(()=>b.target.style.backgroundColor=Y,300)}})})})}function ze(){ge.info("Initializing VNPT Userscript...");try{Fe(),nt(),ot(),et(),Ze(),at(),it(),rt(),st(),ge.info("Userscript initialized successfully.")}catch(e){ge.error("Error during userscript initialization:",e)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",ze):ze()})();
