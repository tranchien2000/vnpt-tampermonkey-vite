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
(function(){"use strict";const fe={info:(...e)=>console.log("[Tampermonkey Script] INFO:",...e),error:(...e)=>console.error("[Tampermonkey Script] ERROR:",...e),warn:(...e)=>console.warn("[Tampermonkey Script] WARN:",...e)};function Ve(){GM_addStyle(`
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

        .cw-body { padding: 8px 10px; background: #f8fbff; border-bottom: 1px solid #e0e8ff; display: block; }
        .cw-row { display: flex; align-items: center; gap: 4px; margin-bottom: 5px; }
        .cw-label { font-size: 10px; color: #0d6efd; font-weight: 600; width: 55px; }
        .cw-input { flex: 1; border: 1px solid #ccc; border-radius: 4px; padding: 3px 5px; font-size: 12px; min-width: 0; outline: none; }
        .cw-input-readonly { background: #fafafa; font-size: 11px; }
        .cw-btn-copy { padding: 3px 7px; font-size: 11px; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; background: #f0f0f0; }

        .cw-tax-group { width: 55px; display: flex; align-items: center; }
        .cw-tax-input { width: 20px; border: 1px solid #ccc; border-radius: 3px; padding: 1px; font-size: 9px; text-align: center; margin: 0 2px 0 3px; }
        .cw-tax-symbol { font-size: 9px; color: #555; font-weight: 600; }

        .cw-map-btn { background: none; border: none; cursor: pointer; font-size: 10px; color: #0d6efd; font-weight: 600; padding: 2px 0; margin-top: 6px; }
        .cw-map-wrap { margin-top: 4px; padding: 6px; background: #fff; border-radius: 4px; border: 1px solid #d0d9ff; flex-direction: column; gap: 4px; }
        .cw-map-label { font-size: 10px; color: #555; width: 55px; }
        .cw-map-input { flex: 1; min-width: 0; border: 1px solid #ccc; border-radius: 3px; padding: 2px 4px; font-size: 10px; outline: none; }
        .cw-map-hint { font-size: 9px; color: #888; margin-top: 2px; line-height: 1.2; }

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
    `)}const s={widget:null,panel:null,header:null,toggleBtn:null,fieldsContainer:null,calcWidget:null,draggedRowForVNPT:null},U={tenDaiDienn:"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT",emailDaiDien:"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Số GPKD | MST",goiDV:"Gói Dịch Vụ",ngayKy:"Ngày ký",thangKy:"Tháng Ký",namKy:"Năm ký",soHopDong:"Số Hợp đồng",soLuongGoi:"Số Lượng Gói"},Ce="vnpt_docx_fields",ke="vnpt_docx_position",Te="vnpt_docx_size",ge="vnpt_docx_opened",ee="vnpt_autofill_data_default",$="vnpt_autofill_data_custom",O="vnpt_autofill_data_sync",Se="vnpt_widget_pos",Ne="vnd_tax_rate",j="vnd_before_history",G="vnd_after_history",me="vnpt_widget_collapsed",Be="vnd_calc_map",te="vnpt_widget_datatab",Le="vnpt_templates";function D(e,n="#198754"){const t=document.createElement("div");t.innerText=e,Object.assign(t.style,{position:"fixed",bottom:"20px",left:"50%",transform:"translateX(-50%)",background:n,color:"#fff",padding:"7px 16px",borderRadius:"20px",zIndex:"100000",opacity:"0",transition:"opacity .25s",fontSize:"13px",fontFamily:"'Segoe UI',sans-serif",boxShadow:"0 4px 14px rgba(0,0,0,.25)"}),document.body.appendChild(t),setTimeout(()=>t.style.opacity="1",30),setTimeout(()=>{t.style.opacity="0",setTimeout(()=>t.remove(),280)},2200)}const Pe={local:{download(e,n="arraybuffer"){return new Promise((t,o)=>{const a=new FileReader;switch(a.onload=r=>{let l=r.target.result;n==="base64"&&typeof l=="string"&&(l=l.split(",")[1]||l),t(l)},a.onerror=r=>o(r),n.toLowerCase()){case"arraybuffer":a.readAsArrayBuffer(e);break;case"base64":case"dataurl":a.readAsDataURL(e);break;case"text":a.readAsText(e);break;default:o(new Error(`Unsupported read type: ${n}`))}})},async upload(e){return this.download(e,"base64")}}},De={getAdapter(e){const n=Pe[e];if(!n)throw new Error(`Storage adapter not found: ${e}`);return n},async upload(e,n,t={}){return await this.getAdapter(e).upload(n,t)},async download(e,n,t={}){return await this.getAdapter(e).download(n,t.type||"arraybuffer")}},qe="vnpt_templates_db",V="buffers";let ce=null;function he(){return ce?Promise.resolve(ce):new Promise((e,n)=>{const t=indexedDB.open(qe,1);t.onupgradeneeded=o=>{const a=o.target.result;a.objectStoreNames.contains(V)||a.createObjectStore(V)},t.onsuccess=o=>{ce=o.target.result,e(ce)},t.onerror=()=>n(t.error)})}async function Fe(e,n){const t=await he();return new Promise((o,a)=>{const c=t.transaction(V,"readwrite").objectStore(V).put(n,e);c.onsuccess=()=>o(),c.onerror=()=>a(c.error)})}async function Re(e){const n=await he();return new Promise((t,o)=>{const l=n.transaction(V,"readonly").objectStore(V).get(e);l.onsuccess=()=>t(l.result),l.onerror=()=>o(l.error)})}async function Ke(e){const n=await he();return new Promise((t,o)=>{const l=n.transaction(V,"readwrite").objectStore(V).delete(e);l.onsuccess=()=>t(),l.onerror=()=>o(l.error)})}function ne(){try{const e=JSON.parse(localStorage.getItem(Le))||[],n=e.filter(t=>t.type!=="local");return n.length!==e.length&&oe(n),n}catch{return[]}}function oe(e){localStorage.setItem(Le,JSON.stringify(e))}function Ue(e){const n=e.match(/drive\.google\.com\/file\/d\/([^/]+)/);return n?`https://drive.google.com/uc?export=download&id=${n[1]}`:e}function $e(e){return new Promise((n,t)=>{GM_xmlhttpRequest({method:"GET",url:Ue(e),responseType:"arraybuffer",onload:o=>{if(o.status>=200&&o.status<300){if(o.response&&o.response.byteLength>4){const a=new Uint8Array(o.response.slice(0,4));if(a[0]===80&&a[1]===75&&a[2]===3&&a[3]===4){n(o.response);return}else{t(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}n(o.response)}else t(new Error(`HTTP ${o.status}: Không lấy được file`))},onerror:()=>t(new Error("Không thể tải URL.")),ontimeout:()=>t(new Error("Timeout khi tải URL."))})})}async function je(e,n,t){const o=e.name.replace(/\.docx$/i,""),a=prompt("Đặt tên biến nhớ cho file này:",o);if(!(!a||!a.trim()))try{const r=await e.arrayBuffer();await Fe(a.trim(),r);const c=ne().filter(i=>i.name!==a.trim()&&i.fileName!==e.name);c.unshift({name:a.trim(),type:"local_idb",fileName:e.name,lastUsed:Date.now()}),oe(c),W(n,t),t&&t(r,a.trim())}catch(r){D(`❌ Lỗi lưu file: ${r.message}`,"#dc3545")}}function W(e,n,t=null){let o=e.querySelector(".vnpt-template-manager-inner"),a,r;if(o)a=o.querySelector(".vnpt-local-list-container"),r=o.querySelector(".vnpt-btn-wrap");else{e.innerHTML="",o=document.createElement("div"),o.className="vnpt-template-manager-inner";const i=document.createElement("div");i.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const f=document.createElement("span");f.className="vnpt-title-main",f.style.cssText="font-size:11px;font-weight:700;color:#444;",r=document.createElement("div"),r.className="vnpt-btn-wrap",r.style.cssText="display:flex;gap:4px;",i.appendChild(f),i.appendChild(r),o.appendChild(i),a=document.createElement("div"),a.className="vnpt-local-list-container",a.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",o.appendChild(a),e.appendChild(o)}const l=ne(),c=o.querySelector(".vnpt-title-main");c.innerHTML="📁 Bộ nhớ Templates"+(t?` <span style="color:#2e7d32;">(Đang dùng: ${t})</span>`:""),l.length===0?a.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':a.innerHTML="",l.forEach((i,f)=>{const p=document.createElement("div");p.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",p.title=i.fileName||i.url||i.name,p.tabIndex=0,p.onfocus=()=>p.style.boxShadow="0 0 0 2px #28a745",p.onblur=()=>p.style.boxShadow="none";const d=i.type==="local"||i.type==="local_base64"||i.type==="local_idb"?"OFF":"ON",u=d==="OFF"?"#6c757d":"#28a745",k=document.createElement("span");k.textContent=d,k.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${u};color:#fff;`;const N=document.createElement("span");N.textContent=i.name,N.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",p.onclick=()=>{p.focus(),Ge(i,n,t,e)},p.appendChild(k),p.appendChild(N);const C=document.createElement("button");C.innerHTML="✎",C.title="Đổi tên template",C.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",C.onclick=m=>{m.stopPropagation();const h=prompt("Đổi tên template:",i.name);if(h&&h.trim()&&h.trim()!==i.name){const v=ne();v[f].name=h.trim(),oe(v),W(e,n,t)}},p.appendChild(C);const b=document.createElement("button");b.innerHTML="✕",b.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",b.onclick=async m=>{if(m.stopPropagation(),confirm(`Xoá biểu mẫu "${i.name}"?`)){const h=ne();h.splice(f,1),oe(h),i.type==="local_idb"&&await Ke(i.name).catch(()=>null),W(e,n,t===i.name?null:t)}},p.appendChild(b),a.appendChild(p)})}function Ge(e,n,t,o){const a=ne(),r=a.find(l=>l.name===e.name&&(l.url===e.url||l.type===e.type));if(r&&(r.lastUsed=Date.now(),oe(a)),e.type==="local_idb"){Re(e.name).then(l=>{if(!l)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");n&&n(l,e.name),W(o,n,e.name)}).catch(l=>{D(`❌ Lỗi nạp File IDB: ${l.message}`,"#dc3545")});return}if(e.type==="local_base64"&&e.data){try{const l=window.atob(e.data.split(",")[1]),c=l.length,i=new Uint8Array(c);for(let f=0;f<c;f++)i[f]=l.charCodeAt(f);n&&n(i.buffer,e.name),W(o,n,e.name)}catch(l){D(`❌ Lỗi nạp Base64: ${l.message}`,"#dc3545")}return}$e(e.url).then(l=>{n&&n(l,e.name),W(o,n,e.name)}).catch(l=>{D(`❌ ${l.message}`,"#dc3545")})}function We(e){e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function z(e,n){var a;if(!e||e.disabled||e.readOnly)return;const t=e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,o=(a=Object.getOwnPropertyDescriptor(t,"value"))==null?void 0:a.set;o?o.call(e,n):e.value=n,We(e)}function se(e){const n=document.getElementById(e);if(n&&(n.tagName==="INPUT"||n.tagName==="TEXTAREA"))return n;for(const t of document.querySelectorAll("label"))if(t.textContent.trim()===e){if(t.htmlFor){const a=document.getElementById(t.htmlFor);if(a)return a}let o=t.parentElement;for(;o;){const a=o.querySelector("input,textarea");if(a)return a;if(o=o.parentElement,(o==null?void 0:o.tagName)==="FORM")break}}return null}function de(e){for(const n of document.querySelectorAll("label"))if(n.innerText.trim()===e)return n.parentElement.querySelector("input, textarea");return null}function M(e,n){const t=se(e)||de(e);t&&z(t,n)}function P(e,n=null){try{const t=localStorage.getItem(e);return t!==null?JSON.parse(t):n}catch{return n}}function A(e,n){localStorage.setItem(e,JSON.stringify(n))}const be=new Date,xe=String(be.getDate()).padStart(2,"0"),pe=String(be.getMonth()+1).padStart(2,"0"),ue=String(be.getFullYear()),ae={ngayKy:xe,thangKy:pe,namKy:ue,ngayTiepNhan:`${xe}/${pe}/${ue}`,ngayThangNamKy:`${xe}/${pe}/${ue}`,thangKy1:pe,namKy1:ue,tenDoanhNghiepB:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM",diaChiB:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội",maSoThueB:"0100686223",stkB:"1600114156",diaChiStkB:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)",tenB:"Phạm Khánh Chung",nguoiDaiDienB:"Phạm Khánh Chung",chucVuB:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",chucVuDaiDienB:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",giayUyQuyenSoB:"2628/GUQ-VNPT-HNI-VP",soGiayUyQuyenB:"2628/GUQ-VNPT-HNI-VP",giayUyQuyenNgayB:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",ngayGiayUyQuyenB:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",GiayUyQuyenB:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",tenDoanhNghiepB1:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",donViTiepNhan:"TTKD KHDN",tenTiepNhan:"Bùi Anh",tenNguoiNhan:"Bùi Anh",dienThoaiB:"02436686868",diaChiTaiKhoanB:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 ",noiKy:"Hà Nội",emailB:"",lienheHopDongB:"AM Bùi Anh",lienheTuVanB:"AM Bùi Anh",lienheHoaDonB:"AM Bùi Anh",sucoCap1B:"AM Bùi Anh",sucoCap2B:"AM Bùi Anh",sucoCap3B:"AM Bùi Anh",sucoCap4B:"AM Bùi Anh"},Ie=["lienheHopDongA","lienheHoaDonA","lienheTuVanA","sucoCap1A","sucoCap2A","sucoCap3A","sucoCap4A"];let q=P(ee)??{...ae},X=P($)??{},ie=P(O)??{},E=P(te)??"custom";function Xe(){q=P(ee)??{...ae},X=P($)??{};const e={...q,...X};let n="";for(let t of Ie){const o=se(t)||de(t);if(o&&o.value){n=o.value;break}}n&&Ie.forEach(t=>M(t,n)),Object.keys(e).forEach(t=>{let o=se(t)||de(t);o&&z(o,e[t])}),D("✅ Auto fill complete")}function Je(){let e=P(O)??{};const n=Object.keys(e);if(n.length===0){D("⚠️ No sync mapping","#ffc107");return}n.forEach(t=>{let o=se(t)||de(t);o&&o.value!==void 0&&o.value!==""&&e[t].split(",").map(r=>r.trim()).filter(r=>r).forEach(r=>M(r,o.value))}),D("✅ Sync form complete","#d39e00")}function Qe(e,n,t,o){const a=document.createElement("div");a.className="cw-tab-header";const r=document.createElement("div");r.innerText="📋 Custom",r.className="cw-tab cw-tab-custom";const l=document.createElement("div");l.innerText="🔗 Sync",l.className="cw-tab cw-tab-sync";const c=document.createElement("div");c.innerText="📌 Default",c.className="cw-tab cw-tab-default";function i(){r.classList.remove("active"),c.classList.remove("active"),l.classList.remove("active"),E==="custom"?r.classList.add("active"):E==="default"?c.classList.add("active"):l.classList.add("active")}i(),a.appendChild(r),a.appendChild(c),a.appendChild(l);const f=document.createElement("div");f.style.display=o.data?"none":"block";const p=n("📋 Cấu hình Data","data",m=>{f.style.display=m?"none":"block",t(e)}),d=document.createElement("button");d.innerText="📥",d.title="Import JSON";const u=document.createElement("button");u.innerText="📤",u.title="Export JSON",[d,u].forEach(m=>m.className="cw-icon-btn");const k=p.querySelector(".wg-toggle-btn"),N=document.createElement("div");N.className="cw-right-wrap",N.appendChild(d),N.appendChild(u),N.appendChild(k),p.appendChild(N);const C=document.createElement("div");C.className="cw-data-body",f.appendChild(a),f.appendChild(C),e.appendChild(p),e.appendChild(f);function b(){C.innerHTML="";let m=E==="sync"?ie:E==="custom"?X:q;const h=Object.keys(m);if(h.length===0&&(E==="custom"||E==="sync")){C.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>';return}h.forEach(x=>{const S=document.createElement("div");S.className="cw-data-row";let H=E==="custom"||E==="sync";const T=document.createElement("input");T.type="text",T.value=x,T.title=x,T.className="cw-data-key"+(H?" mutable":""),T.readOnly=!H,H&&(T.onchange=()=>{const L=T.value.trim();if(!L||L===x){T.value=x;return}if(m.hasOwnProperty(L)){alert(`Nhãn "${L}" đã tồn tại!`),T.value=x;return}m[L]=m[x],delete m[x],A(E==="sync"?O:$,m),b()});const B=document.createElement("input");if(B.type="text",B.value=m[x]??"",B.className="cw-data-val",B.oninput=()=>{m[x]=B.value,A(E==="sync"?O:E==="custom"?$:ee,m)},E==="sync"&&(B.placeholder="Các nhãn đích..."),S.appendChild(T),S.appendChild(B),E==="custom"||E==="sync"){const L=document.createElement("button");L.innerHTML="✕",L.className="cw-del-btn",L.onclick=()=>{confirm(`Delete "${x}"?`)&&(delete m[x],E==="custom"&&A($,m),E==="sync"&&A(O,m),b())},S.appendChild(L)}else{const L=document.createElement("div");L.className="cw-pad",S.appendChild(L)}C.appendChild(S)});const v=document.createElement("div");v.className="cw-data-hint",v.innerText=`${h.length} fields · auto-saved`,C.appendChild(v)}b(),r.onclick=()=>{E="custom",A(te,"custom"),i(),b()},c.onclick=()=>{E="default",A(te,"default"),i(),b()},l.onclick=()=>{E="sync",A(te,"sync"),i(),b()},u.onclick=()=>{const m={defaultData:q,customData:X,syncData:ie},h=new Blob([JSON.stringify(m,null,2)],{type:"application/json"}),v=URL.createObjectURL(h),x=document.createElement("a");x.href=v,x.download=`vnpt_data_${Date.now()}.json`,x.click(),URL.revokeObjectURL(v)},d.onclick=()=>{const m=document.createElement("input");m.type="file",m.accept=".json",m.onchange=async h=>{const v=h.target.files[0];if(v)try{const x=await De.download("local",v,{type:"text"}),S=JSON.parse(x);S.defaultData&&(q=S.defaultData,A(ee,q)),S.customData&&(X=S.customData,A($,X)),S.syncData&&(ie=S.syncData,A(O,ie)),b(),D("✅ Import successful!")}catch{alert("Invalid JSON file format or error reading file!")}},m.click()},e.querySelector("#vnpt-cw-fill").onclick=Xe,e.querySelector("#vnpt-cw-sync").onclick=Je,e.querySelector("#vnpt-cw-add").onclick=()=>{E==="default"&&(E="custom",A(te,"custom"),i());let m=E==="sync"?ie:X,h=1,v="new_field";for(;m.hasOwnProperty(v);)v="new_field_"+h,h++;m[v]="",A(E==="sync"?O:$,m),o.data&&(o.data=!1,A(me,o),f.style.display="block",p.querySelector(".wg-toggle-btn").innerText="▴"),b(),C.scrollTop=C.scrollHeight},e.querySelector("#vnpt-cw-reset").onclick=()=>{confirm("Reset [Default Data] to hardcoded values?")&&(q={...ae},A(ee,q),E==="default"&&b(),D("Reset complete","#17a2b8"))}}let ye=!1;document.addEventListener("input",e=>{var c,i,f;if(ye||!e.target||!["INPUT","TEXTAREA"].includes(e.target.tagName))return;let n=P(O)??{};if(Object.keys(n).length===0)return;let t=e.target.id,o=e.target.name,a=null,r=null;if(t){const p=document.querySelector(`label[for="${t}"]`);p&&(a=p.textContent.trim(),r=(c=p.innerText)==null?void 0:c.trim())}if(!a){const p=e.target.closest("label");p&&(a=(i=Array.from(p.childNodes).find(d=>d.nodeType===3))==null?void 0:i.textContent.trim(),r=(f=p.innerText)==null?void 0:f.trim())}let l=n[t]||n[o]||n[a]||n[r];if(l){ye=!0;try{const p=e.target.value;l.split(",").map(u=>u.trim()).filter(u=>u).forEach(u=>{u!==t&&u!==o&&u!==a&&u!==r&&M(u,p)})}finally{ye=!1}}});function J(e,n,t=null,o=""){const a=s.fieldsContainer.querySelector(".text-hint");a&&a.remove();const r=s.fieldsContainer.querySelectorAll(".f-key");let l=!1;for(let c of r)if(c.value===e){const i=c.closest(".vnpt-field-row"),f=i.querySelector(".f-val"),p=i.querySelector(".f-label"),d=i.querySelector(".f-sync");n!==""&&(f.value=n),t!==null&&t!==""&&(p.value=t),o!==""&&(d.value=o),l=!0;break}if(!l){(t===null||t==="")&&(t=U[e]||"");const c=document.createElement("div");c.className="vnpt-field-row row-item",c.setAttribute("draggable","false"),c.innerHTML=`
            <input type="checkbox" class="row-chk" title="Chọn để thao tác hàng loạt" style="margin: 0 2px 0 2px;" />
            <input type="text" class="f-label" placeholder="Nhãn..." value="${t}" />
            <input type="text" class="f-key" placeholder="Mã biến" value="${e}" />
            <input type="text" class="f-sync" placeholder="🔗 Đồng bộ" value="${o}" title="Nhập các ID đích trên web, cách nhau bởi dấu phẩy" />
            <span class="row-drag-handle" title="Kéo thả để di chuyển">=</span>
            <input type="text" class="f-val" placeholder="Giá trị" value="${n}" />
        `;const i=c.querySelector(".f-val"),f=c.querySelector(".f-sync");e==="tenToChuc"&&(i.style.textAlign="right"),c.querySelector(".f-key").addEventListener("keyup",function(){_(),i.style.textAlign=this.value.trim()==="tenToChuc"?"right":""}),c.querySelector(".f-label").addEventListener("keyup",_),f.addEventListener("keyup",_),i.addEventListener("keyup",function(){_();const d=f.value.split(",").map(u=>u.trim()).filter(u=>u);d.length>0&&d.forEach(u=>M(u,this.value))});const p=c.querySelector(".row-drag-handle");p.addEventListener("mouseenter",()=>c.setAttribute("draggable","true")),p.addEventListener("mouseleave",()=>{c.classList.contains("dragging")||c.setAttribute("draggable","false")}),c.addEventListener("dragstart",function(d){s.draggedRowForVNPT=this,d.dataTransfer.effectAllowed="move",d.dataTransfer.setData("text/plain",e),this.classList.add("dragging")}),c.addEventListener("dragover",function(d){return d.preventDefault(),d.dataTransfer.dropEffect="move",!1}),c.addEventListener("dragenter",function(d){this.classList.add("over")}),c.addEventListener("dragleave",function(d){this.classList.remove("over")}),c.addEventListener("drop",function(d){if(d.stopPropagation(),s.draggedRowForVNPT&&s.draggedRowForVNPT!==this){const u=Array.from(s.fieldsContainer.querySelectorAll(".vnpt-field-row")),k=u.indexOf(s.draggedRowForVNPT),N=u.indexOf(this);k<N?this.parentNode.insertBefore(s.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(s.draggedRowForVNPT,this),_()}return!1}),c.addEventListener("dragend",function(d){this.setAttribute("draggable","false"),s.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(k=>{k.classList.remove("over"),k.classList.remove("dragging")}),s.draggedRowForVNPT=null}),s.fieldsContainer.appendChild(c),s.fieldsContainer.scrollTop=s.fieldsContainer.scrollHeight}}async function _(){const e={};s.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(t=>{const o=t.querySelector(".f-key").value.trim(),a=t.querySelector(".f-label").value.trim(),r=t.querySelector(".f-val").value,l=t.querySelector(".f-sync").value.trim();o&&(e[o]={label:a,value:r,sync:l})}),localStorage.setItem(Ce,JSON.stringify(e))}async function Ye(){try{const e=JSON.parse(localStorage.getItem(Ce));if(e&&Object.keys(e).length>0){s.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(n=>n.remove());for(const n in e){let t=e[n];typeof t=="object"&&t!==null?J(n,t.value,t.label,t.sync||""):J(n,t,"","")}}}catch(e){console.error("Error loading config:",e)}try{const e=JSON.parse(localStorage.getItem(ke));e&&s.widget&&(s.widget.style.bottom="auto",e.right?(s.widget.style.right=e.right,s.widget.style.left="auto"):e.left&&(s.widget.style.left=e.left,s.widget.style.right="auto"),e.top&&(s.widget.style.top=e.top))}catch{}}function Ze(){document.getElementById("vnpt-btn-toggle-id").addEventListener("click",function(){s.fieldsContainer.classList.toggle("show-ids")}),document.getElementById("vnpt-btn-batch-del").addEventListener("click",function(){const e=s.fieldsContainer.querySelectorAll(".vnpt-field-row");let n=0;e.forEach(t=>{const o=t.querySelector(".row-chk");o&&o.checked&&(t.remove(),n++)}),n===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(e.forEach(t=>t.remove()),D("🗑️ Đã xóa toàn bộ","#ff5252"),_()):(D(`🗑️ Đã xóa ${n} trường`,"#ff5252"),_())}),document.getElementById("vnpt-btn-add").addEventListener("click",function(){const e=s.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;J("bien_moi_"+e,"","",""),_()}),document.getElementById("vnpt-btn-fill-back").addEventListener("click",function(){const e=s.fieldsContainer.querySelectorAll(".vnpt-field-row");let n=0;e.forEach(t=>{const o=t.querySelector(".f-key").value.trim(),a=t.querySelector(".f-val").value;o&&(document.getElementById(o)||document.getElementsByName(o)[0])&&(M(o,a),n++)}),n>0?D(`✅ Đã điền ngược ${n} trường vào web`,"#198754"):D("⚠️ Không có trường nào khớp","#ffc107")})}function et(e){if(!e)return;e.innerHTML="",Object.keys(ae).forEach(t=>{const o=document.createElement("div");o.className="vdp-item",o.innerHTML=`
            <span class="vdp-label">${U[t]||t}</span>
            <span class="vdp-key">${t}</span>
        `,o.onclick=()=>{J(t,ae[t],U[t]||""),_(),D(`📌 Đã thêm: ${U[t]||t}`)},e.appendChild(o)});const n=document.createElement("div");n.style.cssText="font-size: 10px; color: #999; padding: 10px; text-align: center; border-top: 1px solid #eee;",n.innerText="Nhấn vào một trường để thêm nhanh vào danh sách xuất hợp đồng.",e.appendChild(n)}function tt(){const e=document.createElement("div");e.id="vnpt-docx-widget";const n=localStorage.getItem(ge)==="true";e.innerHTML=`
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
    `,document.body.appendChild(e),s.widget=e,s.panel=document.getElementById("vnpt-export-panel"),s.toggleBtn=document.getElementById("vnpt-toggle-btn"),s.header=document.getElementById("vnpt-panel-header"),s.fieldsContainer=document.getElementById("vnpt-fields-container");try{const r=JSON.parse(localStorage.getItem(Te));r&&r.width&&r.height&&(s.panel.style.width=r.width+"px",s.panel.style.height=r.height+"px")}catch(r){console.error("Lỗi load size panel:",r)}new ResizeObserver(r=>{if(s.panel.style.display!=="none")for(let l of r){const{width:c,height:i}=l.contentRect;c>0&&i>0&&localStorage.setItem(Te,JSON.stringify({width:Math.round(c+20),height:Math.round(i+20)}))}}).observe(s.panel);const o=document.getElementById("vnpt-default-data-popup"),a=document.getElementById("vdp-list");et(a),document.getElementById("vnpt-btn-default").onclick=r=>{const l=o.style.display==="flex";o.style.display=l?"none":"flex"},document.getElementById("vdp-close").onclick=()=>{o.style.display="none"},W(document.getElementById("vnpt-template-manager"),(r,l)=>{s.templateBuffer=r,s.templateName=l}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const r=this.files&&this.files[0];if(!r)return;const l=document.getElementById("vnpt-template-manager");je(r,l,(c,i)=>{s.templateBuffer=c,s.templateName=i}),this.value=""}),s.panelBody=document.getElementById("vnpt-panel-body"),s.toggleBtn.addEventListener("click",r=>{s.hasDragged||(s.panel.style.display==="none"?(s.panel.style.display="flex",s.toggleBtn.className="btn-opened",s.toggleBtn.innerHTML="✖",localStorage.setItem(ge,"true")):(s.panel.style.display="none",s.toggleBtn.className="btn-closed",s.toggleBtn.innerHTML="📄",localStorage.setItem(ge,"false")))})}function Ae(e,n,t,o=null,a=null){let r=!1,l=0,c=0,i=!1;function f(d){i!==d&&(i=d,a&&a(d))}function p(d){if(d.button!==0)return;r=!0,s.hasDragged=!1;const u=e.getBoundingClientRect();l=d.clientX-u.left,c=d.clientY-u.top,document.body.style.userSelect="none",n&&n.forEach(k=>k.style.cursor="grabbing"),o&&o(),d.preventDefault()}return n.forEach(d=>{d.addEventListener("mousedown",p)}),document.addEventListener("mousemove",function(d){if(!r)return;s.hasDragged=!0;let u=d.clientX-l,k=d.clientY-c;const N=window.innerWidth,C=window.innerHeight,b=document.getElementById("vnpt-toggle-btn"),m=b?b.offsetWidth:40,h=b?b.offsetHeight:40,v=e.id==="vnpt-docx-widget";let x=e.offsetWidth||0;if(v){let T=m+6-x,B=N-x+6;u<T&&(u=T),u>B&&(u=B)}else x=x||200,u<0&&(u=0),u+x>N&&(u=Math.max(0,N-x));let S=i;if(v?S=!1:i?d.clientY<C-40&&(S=!1):d.clientY>C-10&&(S=!0),k<0&&(k=0),S)f(!0),e.style.top=C-e.offsetHeight+"px",v?(e.style.right=N-u-x+"px",e.style.left="auto"):(e.style.left=u+"px",e.style.right="auto"),e.style.bottom="auto";else{f(!1);let H=e.offsetHeight||40,T;if(v)T=10+h;else{const B=e.querySelector(".cw-title-bar");T=B?B.offsetHeight:H}k+T>C&&(k=Math.max(0,C-T)),e.style.top=k+"px",v?(e.style.right=N-u-x+"px",e.style.left="auto"):(e.style.left=u+"px",e.style.right="auto"),e.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(r&&(r=!1,document.body.style.userSelect="",n&&n.forEach(d=>d.style.cursor="grab"),t)){const d=e.id==="vnpt-docx-widget";localStorage.setItem(t,JSON.stringify({left:d?void 0:e.style.left,right:d?e.style.right:void 0,top:e.style.top,x:d?void 0:parseFloat(e.style.left),y:parseFloat(e.style.top),docked:i}))}}),{isDocked:()=>i,setDocked:f}}function nt(){s.widget&&s.header&&s.toggleBtn&&(Ae(s.widget,[s.header,s.toggleBtn],ke),window.addEventListener("resize",()=>{const e=window.innerWidth,n=window.innerHeight,t=document.getElementById("vnpt-toggle-btn"),o=t?t.offsetWidth:40,a=t?t.offsetHeight:40;let r=s.widget.getBoundingClientRect(),l=r.left,c=r.top,i=s.widget.offsetWidth||0,p=o+6-i,d=e-i+6;l<p&&(l=p),l>d&&(l=d),c+10+a>n&&(c=Math.max(0,n-(10+a))),s.widget.style.right=e-l-i+"px",s.widget.style.top=c+"px"}))}function ot(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){let e=0;Object.keys(U).forEach(n=>{var a;const t=document.getElementById(n);let o="";if(t&&(o=t.tagName.toLowerCase()==="select"?((a=t.options[t.selectedIndex])==null?void 0:a.text)||"":t.value,e++),!o){const r=n.toLowerCase(),l=new Date;r==="ngayky"&&(o=String(l.getDate()).padStart(2,"0")),(r==="thangky"||r==="thangky1")&&(o=String(l.getMonth()+1).padStart(2,"0")),(r==="namky"||r==="namky1")&&(o=String(l.getFullYear())),r==="soluonggoi"&&(o="1")}J(n,o,null)}),_(),e>0?(this.style.background="#34a853",this.style.color="#fff",this.innerText="Done",setTimeout(()=>{this.style.background="#fbbc04",this.style.color="#000",this.innerText="Quét"},1e3)):D("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(e){e.target&&e.target.id&&U[e.target.id]!==void 0&&(J(e.target.id,e.target.value,null),_())}),document.addEventListener("change",function(e){var n;if(e.target&&e.target.id&&U[e.target.id]!==void 0){let t=e.target.tagName.toLowerCase()==="select"?((n=e.target.options[e.target.selectedIndex])==null?void 0:n.text)||"":e.target.value;J(e.target.id,t,null),_()}})}function He(e,n,t){try{let o;try{o=new window.PizZip(e)}catch(i){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(i);return}const a=new window.docxtemplater(o,{paragraphLoop:!0,linebreaks:!0});a.render(n);const r=a.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),l=URL.createObjectURL(r),c=document.createElement("a");c.href=l,c.download=t,document.body.appendChild(c),c.click(),setTimeout(()=>{document.body.removeChild(c),URL.revokeObjectURL(l)},100)}catch(o){let a=o.message;o.properties&&o.properties.errors instanceof Array?a=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+o.properties.errors.map(l=>"- "+(l.properties.explanation||l.message)).join(`
`):a="Lỗi phần mềm Word sinh ra: "+a,alert(a),console.error("DocX Error:",o)}}function at(){const e=document.getElementById("vnpt-export-filename");e&&e.addEventListener("input",()=>{e.dataset.userEdited="1",e.value.trim()||(e.dataset.userEdited="0")});function n(){if(!e||e.dataset.userEdited==="1")return;let t="";if(s.fieldsContainer&&s.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(i=>{const f=i.querySelector(".f-key").value.trim(),p=i.querySelector(".f-val").value.trim();f==="tenToChuc"&&(t=p)}),!t){const c=document.getElementById("tenToChuc");c&&(t=c.tagName.toLowerCase()==="textarea"||c.tagName.toLowerCase()==="input"?c.value.trim():c.innerText.trim())}function o(c){if(!c)return"";let i=c;return i=i.replace(/Tổng công ty/gi,""),i=i.replace(/Công ty/gi,""),i=i.replace(/\bCty\b/gi,""),i=i.replace(/Trách nhiệm hữu hạn/gi,""),i=i.replace(/\bTNHH\b/gi,""),i=i.replace(/Cổ phần/gi,""),i=i.replace(/\bCP\b/gi,""),i=i.replace(/Một thành viên/gi,""),i=i.replace(/\bMTV\b/gi,""),i=i.replace(/Chi nhánh/gi,""),i=i.replace(/Việt Nam/gi,"VN"),i=i.replace(/Viet Nam/gi,"VN"),i=i.replace(/\s+/g," ").trim(),i=i.replace(/^[-,\s]+|[-,\s]+$/g,""),i.length>50&&(i=i.substring(0,47)+"..."),i.replace(/[<>:"/\\|?*]/g,"")}let a=o(t),r=s.templateName?s.templateName.replace(/\.docx$/i,""):"",l=[];a&&l.push(a),r&&l.push(r),l.length>0?e.value=l.join(" - ")+".docx":e.value||(e.value="HopDong_Auto.docx")}setInterval(n,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const t={};if(s.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(l=>{const c=l.querySelector(".f-key").value.trim(),i=l.querySelector(".f-val").value;c&&(t[c]=i)}),Object.keys(t).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}let a=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(a.toLowerCase().endsWith(".docx")||(a+=".docx"),s.templateBuffer){He(s.templateBuffer,t,a);return}const r=document.getElementById("vnpt-template-file");if(r.files&&r.files.length>0){De.download("local",r.files[0],{type:"arraybuffer"}).then(l=>He(l,t,a)).catch(l=>alert(`Lỗi đọc file: ${l.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')})}function it(){function e(){const o=document.getElementById("chucVu");o&&!o.dataset.filled&&(o.dataset.filled="1",z(o,"Giám Đốc"));const a=document.getElementById("noiCap");a&&!a.dataset.filled&&(a.dataset.filled="1",z(a,"Cục trưởng Cục Cảnh sát QLHC về TTXH"));const r=document.getElementById("noiCapSoDkdn");r&&!r.dataset.filled&&(r.dataset.filled="1",z(r,""));const l=document.getElementById("duong"),c=document.getElementById("diaChiTruSoDuong");l&&c&&!l.dataset.bound&&(l.dataset.bound="1",l.addEventListener("input",()=>z(c,l.value)));const i=document.getElementById("sdt"),f=document.getElementById("sdtToChuc");i&&f&&!i.dataset.bound&&(i.dataset.bound="1",i.addEventListener("input",()=>z(f,i.value)));const p=document.getElementById("emailDaiDien"),d=document.getElementById("emailCongTy");p&&d&&!p.dataset.bound&&(p.dataset.bound="1",p.addEventListener("input",()=>z(d,p.value)));const u=document.getElementById("soDkdn"),k=document.getElementById("maSoThue");u&&k&&!u.dataset.bound&&(u.dataset.bound="1",u.addEventListener("input",()=>z(k,u.value)))}let n;new MutationObserver(()=>{clearTimeout(n),n=setTimeout(e,200)}).observe(document.body,{childList:!0,subtree:!0}),e()}function I(e){return e.toLocaleString("en-US")}function F(e){return Number(String(e).replace(/[^\d]/g,""))||0}function _e(e){return e.charAt(0).toUpperCase()+e.slice(1)}const re=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function rt(e){let n=Math.floor(e/100),t=Math.floor(e%100/10),o=e%10,a="";return n>0&&(a+=re[n]+" trăm ",t===0&&o>0&&(a+="lẻ ")),t>1?(a+=re[t]+" mươi ",o===1?a+="mốt":o===5?a+="lăm":o>0&&(a+=re[o])):t===1?(a+="mười ",o===5?a+="lăm":o>0&&(a+=re[o])):o>0&&(n>0&&(a+="lẻ "),a+=re[o]),a.trim()}function ze(e){if(e===0)return"không";const n=["","nghìn","triệu","tỷ"];let t="",o=0;for(;e>0;){const a=e%1e3;a>0&&(t=rt(a)+" "+n[o]+" "+t),e=Math.floor(e/1e3),o++}return t.trim()}function le(e,n=null){try{const t=localStorage.getItem(e);return t!==null?JSON.parse(t):n}catch{return n}}function ve(e,n){localStorage.setItem(e,JSON.stringify(n))}let Q=Number(localStorage.getItem(Ne))||.08,R=le(me)??{calc:!1,data:!0};function Z(e,n){if(!n||n.replace(/\D/g,"").length<6)return;let t=le(e,[]);t=t.filter(o=>o!==n),t.unshift(n),ve(e,t.slice(0,10))}function K(e,n){const t=document.getElementById(n);t&&(t.innerHTML=le(e,[]).map(o=>`<option value="${o}">`).join(""))}function we(e){const n=window.innerWidth,t=window.innerHeight,o=e.getBoundingClientRect();e.style.left=Math.min(Math.max(parseFloat(e.style.left),0),n-o.width)+"px",e.style.top=Math.min(Math.max(parseFloat(e.style.top),0),t-36)+"px"}function lt(e,n,t){const o=document.createElement("div");o.className="wg-sec-header";const a=document.createElement("span");a.innerText=e;const r=document.createElement("button");return r.className="wg-toggle-btn",r.innerText=R[n]?"▾":"▴",o.appendChild(a),o.appendChild(r),r.onclick=()=>{R[n]=!R[n],r.innerText=R[n]?"▾":"▴",ve(me,R),t(R[n])},o}function ct(){const e=document.createElement("div");e.id="vnpt-calc-widget";const n=le(Se),t=!!(n&&n.docked);Object.assign(e.style,{top:n&&n.y?n.y+"px":"16px",left:n&&n.x?n.x+"px":window.innerWidth-236+"px"});function o(g,y){const w=document.createElement("button");return w.innerText=g,w.className="cw-action-btn "+y,w}const a=o("Fill","cw-btn-fill");a.id="vnpt-cw-fill";const r=o("Sync","cw-btn-sync");r.id="vnpt-cw-sync",r.title="Manual trigger for Sync Mapping";const l=o("Add","cw-btn-add");l.id="vnpt-cw-add";const c=o("↺","cw-btn-reset");c.id="vnpt-cw-reset",c.title="Reset Default fields back to original";const i=document.createElement("div");i.className="cw-btn-group",i.appendChild(a),i.appendChild(r),i.appendChild(l),i.appendChild(c);const f=document.createElement("div");f.className="cw-title-bar";const p=document.createElement("span");p.className="cw-title-label",p.innerHTML="VNPT Fast",f.appendChild(p),f.appendChild(i),e.appendChild(f),R.calc=!1;const d=document.createElement("div");d.className="cw-body",d.innerHTML=`
    <div class="cw-row">
        <span class="cw-label">Trước thuế</span>
        <input id="wg-before" class="cw-input" list="wg-before-list">
        <button data-wgcopy="wg-before" class="cw-btn-copy">Copy</button>
        <datalist id="wg-before-list"></datalist>
    </div>
    <div class="cw-row">
        <div class="cw-tax-group">
            <span class="cw-label" style="width:auto;">Thuế</span>
            <input id="wg-taxRate" class="cw-tax-input">
            <span class="cw-tax-symbol">%</span>
        </div>
        <input id="wg-tax" class="cw-input">
        <button data-wgcopy="wg-tax" class="cw-btn-copy">Copy</button>
    </div>
    <div class="cw-row">
        <span class="cw-label">Sau thuế</span>
        <input id="wg-after" class="cw-input" list="wg-after-list">
        <button data-wgcopy="wg-after" class="cw-btn-copy">Copy</button>
        <datalist id="wg-after-list"></datalist>
    </div>
    <div class="cw-row">
        <span class="cw-label">Bằng chữ</span>
        <input id="wg-text" class="cw-input cw-input-readonly" readonly>
        <button data-wgcopy="wg-text" class="cw-btn-copy">Copy</button>
    </div>

    <div>
        <button id="wg-calc-map-btn" class="cw-map-btn">+ Cấu hình "Gán" tự điền</button>
    </div>
    <div id="wg-calc-map-wrap" class="cw-map-wrap" style="display:none;">
         <div class="cw-row">
             <span class="cw-map-label">Trước thuế</span>
             <input data-clink="before" placeholder="Ví dụ: tongThanhTien, donGiaCA" class="cw-map-input">
         </div>
         <div class="cw-row">
             <span class="cw-map-label">Tiền thuế</span>
             <input data-clink="tax" placeholder="Ví dụ: thueCA, Thue GTGT" class="cw-map-input">
         </div>
         <div class="cw-row">
             <span class="cw-map-label">Sau thuế</span>
             <input data-clink="after" placeholder="Ví dụ: tongCongHD" class="cw-map-input">
         </div>
         <div class="cw-row">
             <span class="cw-map-label">Bằng chữ</span>
             <input data-clink="text" placeholder="Ví dụ: tongCongHDbangChu" class="cw-map-input">
         </div>
         <div class="cw-map-hint">Nhập các ID hoặc nhãn trên trang, cách nhau bởi dấu phẩy. Cấu hình sẽ được Auto-save và tự điền khi tính toán.</div>
    </div>
    `,e.appendChild(d),document.body.appendChild(e),s.calcWidget=e,Qe(e,lt,we,R);const u=Array.from(e.children).filter(g=>g!==f);function k(g){u.forEach(y=>{y.style.display=g?"none":""}),f.style.borderRadius=g?"8px":"0",e.style.borderRadius=g?"8px":"10px",e.style.boxShadow=g?"0 -3px 16px rgba(25,135,84,0.55)":"0 4px 24px rgba(0,0,0,.3)",g&&(e.style.top=window.innerHeight-(f.offsetHeight||34)+"px")}const N=Ae(e,[f],Se,null,g=>{k(g)});t&&N.setDocked(!0),window.addEventListener("resize",()=>{N.isDocked()?e.style.top=window.innerHeight-f.offsetHeight+"px":we(e)});const C=document.getElementById("wg-taxRate"),b=document.getElementById("wg-before"),m=document.getElementById("wg-tax"),h=document.getElementById("wg-after"),v=document.getElementById("wg-text"),x=document.getElementById("wg-calc-map-btn"),S=document.getElementById("wg-calc-map-wrap");let H=le(Be)??{};x.onclick=()=>{const g=S.style.display==="flex";S.style.display=g?"none":"flex",x.innerText=g?'+ Cấu hình "Gán" tự điền':'- Ẩn cấu hình "Gán" tự điền',we(e)},e.querySelectorAll("input[data-clink]").forEach(g=>{const y=g.dataset.clink;g.value=(H[y]||[]).join(", "),g.addEventListener("input",()=>{H[y]=g.value.split(",").map(w=>w.trim()).filter(w=>w),ve(Be,H)})}),C.value=Q*100,K(j,"wg-before-list"),K(G,"wg-after-list");function T(g,y,w){const Oe=_e(ze(w))+" đồng";v.value=Oe,(H.before||[]).forEach(Y=>M(Y,I(g))),(H.tax||[]).forEach(Y=>M(Y,I(y))),(H.after||[]).forEach(Y=>M(Y,I(w))),(H.text||[]).forEach(Y=>M(Y,Oe))}function B(){const g=F(b.value),y=Math.round(g*Q),w=g+y;m.value=I(y),h.value=I(w),T(g,y,w)}function L(){const g=F(m.value),y=Math.round(g/Q),w=y+g;b.value=I(y),h.value=I(w),T(y,g,w)}function Ee(){const g=F(h.value),y=Math.round(g/(1+Q)),w=g-y;b.value=I(y),m.value=I(w),T(y,w,g)}C.addEventListener("input",()=>{Q=Number(C.value)/100||0,localStorage.setItem(Ne,Q),B()}),b.addEventListener("input",()=>{const g=F(b.value),y=Math.round(g*Q),w=g+y;m.value=I(y),h.value=I(w),v.value=_e(ze(w))+" đồng"}),b.addEventListener("blur",()=>{b.value=I(F(b.value)),Z(j,b.value),K(j,"wg-before-list")}),b.addEventListener("change",()=>{b.value=I(F(b.value)),Z(j,b.value),K(j,"wg-before-list"),B()}),m.addEventListener("input",L),h.addEventListener("input",Ee),h.addEventListener("blur",()=>{h.value=I(F(h.value)),Z(G,h.value),K(G,"wg-after-list")}),h.addEventListener("change",()=>{h.value=I(F(h.value)),Z(G,h.value),K(G,"wg-after-list"),Ee()}),d.querySelectorAll("button[data-wgcopy]").forEach(g=>{g.addEventListener("click",()=>{var w;const y=((w=document.getElementById(g.dataset.wgcopy))==null?void 0:w.value)??"";navigator.clipboard.writeText(y),g.dataset.wgcopy==="wg-before"&&(Z(j,y),K(j,"wg-before-list")),g.dataset.wgcopy==="wg-after"&&(Z(G,y),K(G,"wg-after-list")),g.textContent="✓",setTimeout(()=>g.textContent="Copy",1e3)})})}function Me(){fe.info("Initializing VNPT Userscript...");try{Ve(),tt(),nt(),Ze(),Ye(),ot(),at(),it(),ct(),fe.info("Userscript initialized successfully.")}catch(e){fe.error("Error during userscript initialization:",e)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Me):Me()})();
