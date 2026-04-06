(function(){"use strict";const xt={info:(...t)=>console.log("[Tampermonkey Script] INFO:",...t),error:(...t)=>console.error("[Tampermonkey Script] ERROR:",...t),warn:(...t)=>console.warn("[Tampermonkey Script] WARN:",...t)};function Vt(){GM_addStyle(`
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
        .btn-default-toggle { background: #17e050ff; color: #ffffffff; font-size: 14px; border: 1px solid transparent; } 
        .btn-default-toggle:hover { background: #ceead6; }
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

    `)}const c={widget:null,panel:null,header:null,toggleBtn:null,fieldsContainer:null,calcWidget:null,draggedRowForVNPT:null,isDefaultMode:!1},O={tenDaiDienn:"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT",emailDaiDien:"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Số GPKD | MST",goiDV:"Gói Dịch Vụ",ngayKy:"Ngày ký",thangKy:"Tháng Ký",namKy:"Năm ký",soHopDong:"SỐ HỢP ĐỒNG",soLuongGoi:"Số Lượng Gói",noiKy:"Nơi ký"},pt="vnpt_docx_fields",ut="vnpt_docx_position",ft="vnpt_docx_size",wt="vnpt_docx_opened",V="vnpt_autofill_data_default",_="vnpt_autofill_data_custom",R="vnpt_autofill_data_sync",Bt="vnpt_widget_pos",Dt="vnd_tax_rate",K="vnd_before_history",P="vnd_after_history",Et="vnpt_widget_collapsed",It="vnd_calc_map",at="vnpt_widget_datatab",gt="vnpt_templates";function T(t,e="#198754"){const n=document.createElement("div");n.innerText=t,Object.assign(n.style,{position:"fixed",bottom:"20px",left:"50%",transform:"translateX(-50%)",background:e,color:"#fff",padding:"7px 16px",borderRadius:"20px",zIndex:"100000",opacity:"0",transition:"opacity .25s",fontSize:"13px",fontFamily:"'Segoe UI',sans-serif",boxShadow:"0 4px 14px rgba(0,0,0,.25)"}),document.body.appendChild(n),setTimeout(()=>n.style.opacity="1",30),setTimeout(()=>{n.style.opacity="0",setTimeout(()=>n.remove(),280)},2200)}const qt={local:{download(t,e="arraybuffer"){return new Promise((n,a)=>{const o=new FileReader;switch(o.onload=i=>{let l=i.target.result;e==="base64"&&typeof l=="string"&&(l=l.split(",")[1]||l),n(l)},o.onerror=i=>a(i),e.toLowerCase()){case"arraybuffer":o.readAsArrayBuffer(t);break;case"base64":case"dataurl":o.readAsDataURL(t);break;case"text":o.readAsText(t);break;default:a(new Error(`Unsupported read type: ${e}`))}})},async upload(t){return this.download(t,"base64")}}},At={getAdapter(t){const e=qt[t];if(!e)throw new Error(`Storage adapter not found: ${t}`);return e},async upload(t,e,n={}){return await this.getAdapter(t).upload(e,n)},async download(t,e,n={}){return await this.getAdapter(t).download(e,n.type||"arraybuffer")}},Ut="vnpt_templates_db",q="buffers";let mt=null;function St(){return mt?Promise.resolve(mt):new Promise((t,e)=>{const n=indexedDB.open(Ut,1);n.onupgradeneeded=a=>{const o=a.target.result;o.objectStoreNames.contains(q)||o.createObjectStore(q)},n.onsuccess=a=>{mt=a.target.result,t(mt)},n.onerror=()=>e(n.error)})}async function jt(t,e){const n=await St();return new Promise((a,o)=>{const s=n.transaction(q,"readwrite").objectStore(q).put(e,t);s.onsuccess=()=>a(),s.onerror=()=>o(s.error)})}async function Jt(t){const e=await St();return new Promise((n,a)=>{const l=e.transaction(q,"readonly").objectStore(q).get(t);l.onsuccess=()=>n(l.result),l.onerror=()=>a(l.error)})}async function $t(t){const e=await St();return new Promise((n,a)=>{const l=e.transaction(q,"readwrite").objectStore(q).delete(t);l.onsuccess=()=>n(),l.onerror=()=>a(l.error)})}function it(){try{const t=JSON.parse(localStorage.getItem(gt))||[],e=t.filter(n=>n.type!=="local");return e.length!==t.length&&rt(e),e}catch{return[]}}function rt(t){localStorage.setItem(gt,JSON.stringify(t))}function Gt(t){const e=t.match(/drive\.google\.com\/file\/d\/([^/]+)/);return e?`https://drive.google.com/uc?export=download&id=${e[1]}`:t}function Xt(t){return new Promise((e,n)=>{GM_xmlhttpRequest({method:"GET",url:Gt(t),responseType:"arraybuffer",onload:a=>{if(a.status>=200&&a.status<300){if(a.response&&a.response.byteLength>4){const o=new Uint8Array(a.response.slice(0,4));if(o[0]===80&&o[1]===75&&o[2]===3&&o[3]===4){e(a.response);return}else{n(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}e(a.response)}else n(new Error(`HTTP ${a.status}: Không lấy được file`))},onerror:()=>n(new Error("Không thể tải URL.")),ontimeout:()=>n(new Error("Timeout khi tải URL."))})})}async function Wt(t,e,n){const a=t.name.replace(/\.docx$/i,""),o=prompt("Đặt tên biến nhớ cho file này:",a);if(!(!o||!o.trim()))try{const i=await t.arrayBuffer();await jt(o.trim(),i);const s=it().filter(r=>r.name!==o.trim()&&r.fileName!==t.name);s.unshift({name:o.trim(),type:"local_idb",fileName:t.name,lastUsed:Date.now()}),rt(s),U(e,n),n&&n(i,o.trim())}catch(i){T(`❌ Lỗi lưu file: ${i.message}`,"#dc3545")}}function U(t,e,n=null){let a=t.querySelector(".vnpt-template-manager-inner"),o,i;if(a)o=a.querySelector(".vnpt-local-list-container"),i=a.querySelector(".vnpt-btn-wrap");else{t.innerHTML="",a=document.createElement("div"),a.className="vnpt-template-manager-inner";const r=document.createElement("div");r.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const p=document.createElement("span");p.className="vnpt-title-main",p.style.cssText="font-size:11px;font-weight:700;color:#444;",i=document.createElement("div"),i.className="vnpt-btn-wrap",i.style.cssText="display:flex;gap:4px;",r.appendChild(p),r.appendChild(i),a.appendChild(r),o=document.createElement("div"),o.className="vnpt-local-list-container",o.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",a.appendChild(o),t.appendChild(a)}const l=it(),s=a.querySelector(".vnpt-title-main");s.innerHTML="📁 Bộ nhớ Templates"+(n?` <span style="color:#2e7d32;">(Đang dùng: ${n})</span>`:""),l.length===0?o.innerHTML='<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>':o.innerHTML="",l.forEach((r,p)=>{const g=document.createElement("div");g.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;",g.title=r.fileName||r.url||r.name,g.tabIndex=0,g.onfocus=()=>g.style.boxShadow="0 0 0 2px #28a745",g.onblur=()=>g.style.boxShadow="none";const u=r.type==="local"||r.type==="local_base64"||r.type==="local_idb"?"OFF":"ON",d=u==="OFF"?"#6c757d":"#28a745",k=document.createElement("span");k.textContent=u,k.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${d};color:#fff;`;const v=document.createElement("span");v.textContent=r.name,v.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",g.onclick=()=>{g.focus(),Yt(r,e,n,t)},g.appendChild(k),g.appendChild(v);const S=document.createElement("button");S.innerHTML="✎",S.title="Đổi tên template",S.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",S.onclick=f=>{f.stopPropagation();const w=prompt("Đổi tên template:",r.name);if(w&&w.trim()&&w.trim()!==r.name){const h=it();h[p].name=w.trim(),rt(h),U(t,e,n)}},g.appendChild(S);const N=document.createElement("button");N.innerHTML="✕",N.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",N.onclick=async f=>{if(f.stopPropagation(),confirm(`Xoá biểu mẫu "${r.name}"?`)){const w=it();w.splice(p,1),rt(w),r.type==="local_idb"&&await $t(r.name).catch(()=>null),U(t,e,n===r.name?null:n)}},g.appendChild(N),o.appendChild(g)})}function Yt(t,e,n,a){const o=it(),i=o.find(l=>l.name===t.name&&(l.url===t.url||l.type===t.type));if(i&&(i.lastUsed=Date.now(),rt(o)),t.type==="local_idb"){Jt(t.name).then(l=>{if(!l)throw new Error("Không tìm thấy dữ liệu trong IndexedDB");e&&e(l,t.name),U(a,e,t.name)}).catch(l=>{T(`❌ Lỗi nạp File IDB: ${l.message}`,"#dc3545")});return}if(t.type==="local_base64"&&t.data){try{const l=window.atob(t.data.split(",")[1]),s=l.length,r=new Uint8Array(s);for(let p=0;p<s;p++)r[p]=l.charCodeAt(p);e&&e(r.buffer,t.name),U(a,e,t.name)}catch(l){T(`❌ Lỗi nạp Base64: ${l.message}`,"#dc3545")}return}Xt(t.url).then(l=>{e&&e(l,t.name),U(a,e,t.name)}).catch(l=>{T(`❌ ${l.message}`,"#dc3545")})}function Qt(t){t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}))}function lt(t,e){var o;if(!t||t.disabled||t.readOnly)return;const n=t.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,a=(o=Object.getOwnPropertyDescriptor(n,"value"))==null?void 0:o.set;a?a.call(t,e):t.value=e,Qt(t)}function tt(t){const e=document.getElementById(t);if(e&&(e.tagName==="INPUT"||e.tagName==="TEXTAREA"))return e;for(const n of document.querySelectorAll("label"))if(n.textContent.trim()===t){if(n.htmlFor){const o=document.getElementById(n.htmlFor);if(o)return o}let a=n.parentElement;for(;a;){const o=a.querySelector("input,textarea");if(o)return o;if(a=a.parentElement,(a==null?void 0:a.tagName)==="FORM")break}}return null}function et(t){for(const e of document.querySelectorAll("label"))if(e.innerText.trim()===t)return e.parentElement.querySelector("input, textarea");return null}function z(t,e){const n=tt(t)||et(t);n&&lt(n,e)}const Ct=new Date,Nt=String(Ct.getDate()).padStart(2,"0"),ht=String(Ct.getMonth()+1).padStart(2,"0"),bt=String(Ct.getFullYear()),nt={ngayKy:Nt,thangKy:ht,namKy:bt,ngayTiepNhan:`${Nt}/${ht}/${bt}`,ngayThangNamKy:`${Nt}/${ht}/${bt}`,thangKy1:ht,namKy1:bt,tenDoanhNghiepB:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM",diaChiB:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội",maSoThueB:"0100686223",stkB:"1600114156",diaChiStkB:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)",tenB:"Phạm Khánh Chung",nguoiDaiDienB:"Phạm Khánh Chung",chucVuB:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",chucVuDaiDienB:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",giayUyQuyenSoB:"2628/GUQ-VNPT-HNI-VP",soGiayUyQuyenB:"2628/GUQ-VNPT-HNI-VP",giayUyQuyenNgayB:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",ngayGiayUyQuyenB:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",GiayUyQuyenB:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",tenDoanhNghiepB1:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",donViTiepNhan:"TTKD KHDN",tenTiepNhan:"Bùi Anh",tenNguoiNhan:"Bùi Anh",dienThoaiB:"02436686868",diaChiTaiKhoanB:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 ",noiKy:"Hà Nội",emailB:"",lienheHopDongB:"AM Bùi Anh",lienheTuVanB:"AM Bùi Anh",lienheHoaDonB:"AM Bùi Anh",sucoCap1B:"AM Bùi Anh",sucoCap2B:"AM Bùi Anh",sucoCap3B:"AM Bùi Anh",sucoCap4B:"AM Bùi Anh"},yt=["lienheHopDongA","lienheHoaDonA","lienheTuVanA","sucoCap1A","sucoCap2A","sucoCap3A","sucoCap4A"];function Ot(t,e=null){try{const n=localStorage.getItem(t);return n!==null?JSON.parse(n):e}catch{return e}}function Zt(){const t=Ot(V)??{...nt},e=Ot(_)??{},n={...t,...e};let a="";for(let o of yt){const i=tt(o)||et(o);if(i&&i.value){a=i.value;break}}a&&yt.forEach(o=>z(o,a)),Object.keys(n).forEach(o=>{let i=tt(o)||et(o);i&&lt(i,n[o])}),T("✅ Auto fill complete")}function H(t,e,n=null,a=""){const o=c.fieldsContainer.querySelector(".text-hint");o&&o.remove();const i=c.fieldsContainer.querySelectorAll(".f-key");let l=!1;for(let s of i)if(s.value.split(",")[0].trim()===t){const p=s.closest(".vnpt-field-row"),g=p.querySelector(".f-val"),u=p.querySelector(".f-label");e!==""&&(g.value=e),n!==null&&n!==""&&(u.value=n),a!==""&&(s.value.split(",").slice(1).map(d=>d.trim()).join(", "),s.value=t+", "+a),l=!0;break}if(!l){(n===null||n==="")&&(n=O[t]||"");const s=document.createElement("div");s.className="vnpt-field-row row-item",s.setAttribute("draggable","false");let r=t;a&&(r+=", "+a),s.innerHTML=`
            <input type="checkbox" class="row-chk" title="Chọn để thao tác hàng loạt" style="margin: 0 2px 0 2px;" />
            <input type="text" class="f-label" placeholder="Nhãn..." value="${n}" />
            <input type="text" class="f-key" placeholder="Mã biến / IDs đồng bộ" value="${r}" title="Biến DOCX (đầu tiên), theo sau là các ID web cách dấu phẩy" />
            <span class="row-drag-handle" title="Kéo thả để di chuyển">=</span>
            <input type="text" class="f-val" placeholder="Giá trị" value="${e}" />
        `;const p=s.querySelector(".f-val"),g=s.querySelector(".f-key");t==="tenToChuc"&&(p.style.textAlign="right"),g.addEventListener("keyup",function(){F();const d=this.value.split(",")[0].trim();p.style.textAlign=d==="tenToChuc"?"right":""}),s.querySelector(".f-label").addEventListener("keyup",F),p.addEventListener("keyup",function(){if(c.isDefaultMode&&!this.dataset.warned){if(!confirm("⚠️ Bạn đang chỉnh sửa dữ liệu mặc định. Thay đổi này sẽ không được lưu vào cấu hình cá nhân. Tiếp tục?")){vt();return}this.dataset.warned="true"}F();const k=g.value.split(",").map(v=>v.trim()).filter(v=>v);k.length>0&&k.forEach(v=>z(v,this.value))}),p.addEventListener("focus",function(){c.isDefaultMode&&this.dataset.warned});const u=s.querySelector(".row-drag-handle");u.addEventListener("mouseenter",()=>s.setAttribute("draggable","true")),u.addEventListener("mouseleave",()=>{s.classList.contains("dragging")||s.setAttribute("draggable","false")}),s.addEventListener("dragstart",function(d){c.draggedRowForVNPT=this,d.dataTransfer.effectAllowed="move",d.dataTransfer.setData("text/plain",t),this.classList.add("dragging")}),s.addEventListener("dragover",function(d){return d.preventDefault(),d.dataTransfer.dropEffect="move",!1}),s.addEventListener("dragenter",function(d){this.classList.add("over")}),s.addEventListener("dragleave",function(d){this.classList.remove("over")}),s.addEventListener("drop",function(d){if(d.stopPropagation(),c.draggedRowForVNPT&&c.draggedRowForVNPT!==this){const k=Array.from(c.fieldsContainer.querySelectorAll(".vnpt-field-row")),v=k.indexOf(c.draggedRowForVNPT),S=k.indexOf(this);v<S?this.parentNode.insertBefore(c.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(c.draggedRowForVNPT,this),F()}return!1}),s.addEventListener("dragend",function(d){this.setAttribute("draggable","false"),c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(v=>{v.classList.remove("over"),v.classList.remove("dragging")}),c.draggedRowForVNPT=null}),c.fieldsContainer.appendChild(s),c.fieldsContainer.scrollTop=c.fieldsContainer.scrollHeight}}async function F(){if(c.isDefaultMode)return;const t={};c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(n=>{const o=n.querySelector(".f-key").value.trim().split(",").map(p=>p.trim()).filter(p=>p),i=o[0],l=o.slice(1).join(", "),s=n.querySelector(".f-label").value.trim(),r=n.querySelector(".f-val").value;i&&(t[i]={label:s,value:r,sync:l})}),localStorage.setItem(pt,JSON.stringify(t))}async function vt(){try{c.fieldsContainer.innerHTML="";const t=JSON.parse(localStorage.getItem(pt))||{};Object.keys(O).forEach(e=>{const n=O[e],a=t[e];a&&typeof a=="object"?H(e,a.value,a.label||n,a.sync||""):a?H(e,a,n,""):H(e,"",n,"")}),Object.keys(t).forEach(e=>{if(!(e in O)){const n=t[e];typeof n=="object"?H(e,n.value,n.label,n.sync||""):H(e,n,"","")}}),Object.keys(O).length===0&&Object.keys(t).length===0&&(c.fieldsContainer.innerHTML='<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>')}catch(t){console.error("Error loading config:",t),Object.keys(O).forEach(e=>{H(e,"",O[e])})}try{const t=JSON.parse(localStorage.getItem(ut));t&&c.widget&&(c.widget.style.bottom="auto",t.right?(c.widget.style.right=t.right,c.widget.style.left="auto"):t.left&&(c.widget.style.left=t.left,c.widget.style.right="auto"),t.top&&(c.widget.style.top=t.top))}catch{}}function te(){document.getElementById("vnpt-btn-toggle-id").addEventListener("click",function(){c.fieldsContainer.classList.toggle("show-ids")}),document.getElementById("vnpt-btn-default").addEventListener("click",ee),document.getElementById("vnpt-btn-batch-del").addEventListener("click",function(){if(c.isDefaultMode){T("⚠️ Không thể xóa ở chế độ Dữ liệu mặc định","#ffc107");return}const t=c.fieldsContainer.querySelectorAll(".vnpt-field-row");let e=0;t.forEach(n=>{const a=n.querySelector(".row-chk");a&&a.checked&&(n.remove(),e++)}),e===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(t.forEach(n=>n.remove()),T("🗑️ Đã xóa toàn bộ","#ff5252"),F()):(T(`🗑️ Đã xóa ${e} trường`,"#ff5252"),F())}),document.getElementById("vnpt-btn-add").addEventListener("click",function(){if(c.isDefaultMode){T("⚠️ Không thể thêm ở chế độ Dữ liệu mặc định","#ffc107");return}const t=c.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;H("bien_moi_"+t,"","",""),F()}),document.getElementById("vnpt-btn-fill-back").addEventListener("click",function(){Zt();const t=c.fieldsContainer.querySelectorAll(".vnpt-field-row");let e=0;t.forEach(n=>{const a=n.querySelector(".f-key").value.trim(),o=n.querySelector(".f-val").value;a.split(",").map(l=>l.trim()).filter(Boolean).forEach(l=>{(document.getElementById(l)||document.getElementsByName(l)[0])&&(z(l,o),e++)})}),e>0?T(`✅ Đã điền ngược ${e} trường vào web`,"#198754"):T("⚠️ Không có trường nào khớp","#ffc107")})}function ee(){c.isDefaultMode=!c.isDefaultMode;const t=document.getElementById("vnpt-btn-default");if(c.fieldsContainer.innerHTML="",c.bannerArea.innerHTML="",c.isDefaultMode){t.classList.add("active"),c.fieldsContainer.classList.add("vnpt-mode-default"),T("📌 Chế độ xem Dữ liệu mặc định","#ea4335");const e=document.createElement("div");e.className="vnpt-default-banner",e.innerHTML=`
            <span>📌 Đang xem Dữ liệu mặc định</span>
        `,c.bannerArea.appendChild(e),Object.keys(nt).forEach(n=>{H(n,nt[n],O[n]||"")})}else t.classList.remove("active"),c.fieldsContainer.classList.remove("vnpt-mode-default"),T("📋 Đã quay lại Dữ liệu cá nhân"),vt()}function ne(){const t={version:"1.0",timestamp:Date.now(),fields:JSON.parse(localStorage.getItem(pt))||{},templates:JSON.parse(localStorage.getItem(gt))||[],position:JSON.parse(localStorage.getItem(ut))||null,size:JSON.parse(localStorage.getItem(ft))||null,calc:{default:JSON.parse(localStorage.getItem(V))||null,custom:JSON.parse(localStorage.getItem(_))||null,sync:JSON.parse(localStorage.getItem(R))||null}},e=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),n=URL.createObjectURL(e),a=document.createElement("a");a.href=n,a.download=`vnpt_config_${new Date().toISOString().slice(0,10)}.json`,a.click(),URL.revokeObjectURL(n),T("📤 Đã xuất cấu hình JSON")}function oe(){const t=document.createElement("input");t.type="file",t.accept=".json",t.onchange=async e=>{const n=e.target.files[0];if(n)try{const a=await n.text(),o=JSON.parse(a);if(!o.fields&&!o.calc)throw new Error("Định dạng file không hợp lệ!");o.fields&&localStorage.setItem(pt,JSON.stringify(o.fields)),o.templates&&localStorage.setItem(gt,JSON.stringify(o.templates)),o.position&&localStorage.setItem(ut,JSON.stringify(o.position)),o.size&&localStorage.setItem(ft,JSON.stringify(o.size)),o.calc&&(o.calc.default&&localStorage.setItem(V,JSON.stringify(o.calc.default)),o.calc.custom&&localStorage.setItem(_,JSON.stringify(o.calc.custom)),o.calc.sync&&localStorage.setItem(R,JSON.stringify(o.calc.sync))),await vt();const i=document.getElementById("vnpt-template-manager");i&&U(i,(l,s)=>{c.templateBuffer=l,c.templateName=s}),o.position&&c.widget&&(o.position.right?(c.widget.style.right=o.position.right,c.widget.style.left="auto"):o.position.left&&(c.widget.style.left=o.position.left,c.widget.style.right="auto"),o.position.top&&(c.widget.style.top=o.position.top),c.widget.style.bottom="auto"),o.size&&c.panel&&(c.panel.style.width=o.size.width+"px",c.panel.style.height=o.size.height+"px"),T("✅ Nhập cấu hình thành công!")}catch(a){console.error("Lỗi Import:",a),alert("Lỗi: "+a.message)}},t.click()}function ae(){const t=document.createElement("div");t.id="vnpt-docx-widget";const e=localStorage.getItem(wt)==="true";t.innerHTML=`
        <button id="vnpt-toggle-btn" title="Mở/Đóng UI Hợp đồng" class="${e?"btn-opened":"btn-closed"}">${e?"✖":"📄"}</button>

        <div id="vnpt-export-panel" style="display: ${e?"flex":"none"};">
            <div id="vnpt-panel-header" title="Kẹp chuột vào đây để di chuyển">
                <span id="vnpt-panel-title">VNPT PRO</span>
                <div class="btn-row" style="margin-bottom: 0; padding-right: 35px; gap: 4px; position: relative;">
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-scan" title="Lấy data theo biểu mẫu web">Scan</button>
                    <button class="vnpt-btn-action btn-fill-back" id="vnpt-btn-fill-back" title="Điền dữ liệu ngược lên web">Điền thông tin</button>
                    
                    <button class="vnpt-btn-action btn-toggle-id" id="vnpt-btn-toggle-id" title="Ẩn/Hiện Mã ID">Nhập key</button>
                    <button class="vnpt-btn-action btn-default-toggle" id="vnpt-btn-default" title="Dữ liệu mặc định VNPT">Mặc định</button>
                    <button class="vnpt-btn-action btn-add" id="vnpt-btn-add" title="Chèn thêm trường trống">➕</button>
                    <button class="vnpt-btn-action btn-clean" id="vnpt-btn-batch-del" title="Xóa chọn / Xóa tất cả">🗑️</button>
                    <!-- Nút Xem thêm và Menu ẩn -->
                    <div style="position: relative; display: flex;">
                        <button class="vnpt-btn-action btn-more" id="vnpt-btn-more" title="Cấu hình & Tiện ích khác">⚙️</button>
                        <div id="vnpt-more-menu" class="vnpt-more-menu" style="display: none;">
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
                        <input type="text" id="vnpt-export-filename" value="HopDong_Auto.docx" placeholder="Tên file HD xuất..." title="Tên file HD xuất" />
                    </div>
                    <button class="vnpt-btn-action btn-export" id="vnpt-btn-export" title="Xuất ra file DOCX">🖨️ XUẤT FILE</button>
                </div>
            </div>
        </div>
    `,document.body.appendChild(t),c.widget=t,c.panel=document.getElementById("vnpt-export-panel"),c.toggleBtn=document.getElementById("vnpt-toggle-btn"),c.header=document.getElementById("vnpt-panel-header"),c.bannerArea=document.getElementById("vnpt-banner-area"),c.fieldsContainer=document.getElementById("vnpt-fields-container");try{const i=JSON.parse(localStorage.getItem(ft));i&&i.width&&i.height&&(c.panel.style.width=i.width+"px",c.panel.style.height=i.height+"px")}catch(i){console.error("Lỗi load size panel:",i)}new ResizeObserver(i=>{if(c.panel.style.display!=="none")for(let l of i){const{width:s,height:r}=l.contentRect;s>0&&r>0&&localStorage.setItem(ft,JSON.stringify({width:Math.round(s+20),height:Math.round(r+20)}))}}).observe(c.panel),c.panelBody=document.getElementById("vnpt-panel-body"),U(document.getElementById("vnpt-template-manager"),(i,l)=>{c.templateBuffer=i,c.templateName=l}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const i=this.files&&this.files[0];if(!i)return;const l=document.getElementById("vnpt-template-manager");Wt(i,l,(s,r)=>{c.templateBuffer=s,c.templateName=r}),this.value=""}),c.toggleBtn.addEventListener("click",i=>{c.hasDragged||(c.panel.style.display==="none"?(c.panel.style.display="flex",c.toggleBtn.className="btn-opened",c.toggleBtn.innerHTML="✖",localStorage.setItem(wt,"true")):(c.panel.style.display="none",c.toggleBtn.className="btn-closed",c.toggleBtn.innerHTML="📄",localStorage.setItem(wt,"false")))}),document.getElementById("vnpt-btn-import").onclick=i=>{oe(),document.getElementById("vnpt-more-menu").style.display="none"},document.getElementById("vnpt-btn-export-json").onclick=i=>{ne(),document.getElementById("vnpt-more-menu").style.display="none"};const a=document.getElementById("vnpt-btn-more"),o=document.getElementById("vnpt-more-menu");a.onclick=i=>{i.stopPropagation();const l=o.style.display==="none";o.style.display=l?"flex":"none",a.classList.toggle("active",l)},document.addEventListener("click",()=>{o.style.display="none",a.classList.remove("active")})}function Ht(t,e,n,a=null,o=null){let i=!1,l=0,s=0,r=!1;function p(u){r!==u&&(r=u,o&&o(u))}function g(u){if(u.button!==0)return;i=!0,c.hasDragged=!1;const d=t.getBoundingClientRect();l=u.clientX-d.left,s=u.clientY-d.top,document.body.style.userSelect="none",e&&e.forEach(k=>k.style.cursor="grabbing"),a&&a(),u.preventDefault()}return e.forEach(u=>{u.addEventListener("mousedown",g)}),document.addEventListener("mousemove",function(u){if(!i)return;c.hasDragged=!0;let d=u.clientX-l,k=u.clientY-s;const v=window.innerWidth,S=window.innerHeight,N=document.getElementById("vnpt-toggle-btn"),f=N?N.offsetWidth:40,w=N?N.offsetHeight:40,h=t.id==="vnpt-docx-widget";let y=t.offsetWidth||0;if(h){let E=f+6-y,B=v-y+6;d<E&&(d=E),d>B&&(d=B)}else y=y||200,d<0&&(d=0),d+y>v&&(d=Math.max(0,v-y));let L=r;if(h?L=!1:r?u.clientY<S-40&&(L=!1):u.clientY>S-10&&(L=!0),k<0&&(k=0),L)p(!0),t.style.top=S-t.offsetHeight+"px",h?(t.style.right=v-d-y+"px",t.style.left="auto"):(t.style.left=d+"px",t.style.right="auto"),t.style.bottom="auto";else{p(!1);let M=t.offsetHeight||40,E;if(h)E=10+w;else{const B=t.querySelector(".cw-title-bar");E=B?B.offsetHeight:M}k+E>S&&(k=Math.max(0,S-E)),t.style.top=k+"px",h?(t.style.right=v-d-y+"px",t.style.left="auto"):(t.style.left=d+"px",t.style.right="auto"),t.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(i&&(i=!1,document.body.style.userSelect="",e&&e.forEach(u=>u.style.cursor="grab"),n)){const u=t.id==="vnpt-docx-widget";localStorage.setItem(n,JSON.stringify({left:u?void 0:t.style.left,right:u?t.style.right:void 0,top:t.style.top,x:u?void 0:parseFloat(t.style.left),y:parseFloat(t.style.top),docked:r}))}}),{isDocked:()=>r,setDocked:p}}function ie(){c.widget&&c.header&&c.toggleBtn&&(Ht(c.widget,[c.header,c.toggleBtn],ut),window.addEventListener("resize",()=>{const t=window.innerWidth,e=window.innerHeight,n=document.getElementById("vnpt-toggle-btn"),a=n?n.offsetWidth:40,o=n?n.offsetHeight:40;let i=c.widget.getBoundingClientRect(),l=i.left,s=i.top,r=c.widget.offsetWidth||0,g=a+6-r,u=t-r+6;l<g&&(l=g),l>u&&(l=u),s+10+o>e&&(s=Math.max(0,e-(10+o))),c.widget.style.right=t-l-r+"px",c.widget.style.top=s+"px"}))}function Mt(t){const e=t.toLowerCase(),n=new Date;return{ngayky:String(n.getDate()).padStart(2,"0"),thangky:String(n.getMonth()+1).padStart(2,"0"),thangky1:String(n.getMonth()+1).padStart(2,"0"),namky:String(n.getFullYear()),namky1:String(n.getFullYear()),soluonggoi:"1",noiky:"Hà Nội",noicap:"Cục trưởng Cục Cảnh sát QLHC về TTXH",noicapsodkdn:"",chucvu:"Giám Đốc"}[e]||""}function re(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){let t=0;Object.keys(O).forEach(e=>{var o;const n=document.getElementById(e);let a="";n&&(a=n.tagName.toLowerCase()==="select"?((o=n.options[n.selectedIndex])==null?void 0:o.text)||"":n.value,t++),a||(a=Mt(e)),H(e,a,null)}),F(),t>0?(this.style.background="#34a853",this.style.color="#fff",this.innerText="Done",setTimeout(()=>{this.style.background="#fbbc04",this.style.color="#000",this.innerText="Quét"},1e3)):T("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(t){t.target&&t.target.id&&O[t.target.id]!==void 0&&(H(t.target.id,t.target.value,null),F())}),document.addEventListener("change",function(t){var e;if(t.target&&t.target.id&&O[t.target.id]!==void 0){let n=t.target.tagName.toLowerCase()==="select"?((e=t.target.options[t.target.selectedIndex])==null?void 0:e.text)||"":t.target.value;H(t.target.id,n,null),F()}})}function _t(t,e,n){try{let a;try{a=new window.PizZip(t)}catch(r){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(r);return}const o=new window.docxtemplater(a,{paragraphLoop:!0,linebreaks:!0});o.render(e);const i=o.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),l=URL.createObjectURL(i),s=document.createElement("a");s.href=l,s.download=n,document.body.appendChild(s),s.click(),setTimeout(()=>{document.body.removeChild(s),URL.revokeObjectURL(l)},100)}catch(a){let o=a.message;a.properties&&a.properties.errors instanceof Array?o=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+a.properties.errors.map(l=>"- "+(l.properties.explanation||l.message)).join(`
`):o="Lỗi phần mềm Word sinh ra: "+o,alert(o),console.error("DocX Error:",a)}}function le(){const t=document.getElementById("vnpt-export-filename");t&&t.addEventListener("input",()=>{t.dataset.userEdited="1",t.value.trim()||(t.dataset.userEdited="0")});function e(){if(!t||t.dataset.userEdited==="1")return;let n="";if(c.fieldsContainer&&c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(r=>{const g=r.querySelector(".f-key").value.trim().split(",")[0].trim(),u=r.querySelector(".f-val").value.trim();g==="tenToChuc"&&(n=u)}),!n){const s=document.getElementById("tenToChuc");s&&(n=s.tagName.toLowerCase()==="textarea"||s.tagName.toLowerCase()==="input"?s.value.trim():s.innerText.trim())}function a(s){if(!s)return"";let r=s;return r=r.replace(/Tổng công ty/gi,""),r=r.replace(/Công ty/gi,""),r=r.replace(/\bCty\b/gi,""),r=r.replace(/Trách nhiệm hữu hạn/gi,""),r=r.replace(/\bTNHH\b/gi,""),r=r.replace(/Cổ phần/gi,""),r=r.replace(/\bCP\b/gi,""),r=r.replace(/Một thành viên/gi,""),r=r.replace(/\bMTV\b/gi,""),r=r.replace(/Chi nhánh/gi,""),r=r.replace(/Việt Nam/gi,"VN"),r=r.replace(/Viet Nam/gi,"VN"),r=r.replace(/\s+/g," ").trim(),r=r.replace(/^[-,\s]+|[-,\s]+$/g,""),r.length>50&&(r=r.substring(0,47)+"..."),r.replace(/[<>:"/\\|?*]/g,"")}let o=a(n),i=c.templateName?c.templateName.replace(/\.docx$/i,""):"",l=[];o&&l.push(o),i&&l.push(i),l.length>0?t.value=l.join(" - ")+".docx":t.value||(t.value="HopDong_Auto.docx")}setInterval(e,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const n={};if(c.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(l=>{const r=l.querySelector(".f-key").value.trim().split(",")[0].trim(),p=l.querySelector(".f-val").value;r&&(n[r]=p)}),Object.keys(n).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}let o=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(o.toLowerCase().endsWith(".docx")||(o+=".docx"),c.templateBuffer){_t(c.templateBuffer,n,o);return}const i=document.getElementById("vnpt-template-file");if(i.files&&i.files.length>0){At.download("local",i.files[0],{type:"arraybuffer"}).then(l=>_t(l,n,o)).catch(l=>alert(`Lỗi đọc file: ${l.message}`));return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')})}const ce=["chucVu","noiCap","noiCapSoDkdn","ngayky","thangky","namky","thangky1","namky1","noiKy"],se=[{src:"duong",target:"diaChiTruSoDuong"},{src:"sdt",target:"sdtToChuc"},{src:"emailDaiDien",target:"emailCongTy"},{src:"soDkdn",target:"maSoThue"}];function de(){function t(){ce.forEach(a=>{const o=document.getElementById(a);o&&!o.dataset.filled&&(o.dataset.filled="1",lt(o,Mt(a)))}),se.forEach(a=>{const o=document.getElementById(a.src),i=document.getElementById(a.target);o&&i&&!o.dataset.bound&&(o.dataset.bound="1",o.addEventListener("input",()=>lt(i,o.value)))})}let e;new MutationObserver(()=>{clearTimeout(e),e=setTimeout(t,200)}).observe(document.body,{childList:!0,subtree:!0}),t()}function I(t){return t.toLocaleString("en-US")}function j(t){return Number(String(t).replace(/[^\d]/g,""))||0}function Rt(t){return t.charAt(0).toUpperCase()+t.slice(1)}const ct=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function pe(t){let e=Math.floor(t/100),n=Math.floor(t%100/10),a=t%10,o="";return e>0&&(o+=ct[e]+" trăm ",n===0&&a>0&&(o+="lẻ ")),n>1?(o+=ct[n]+" mươi ",a===1?o+="mốt":a===5?o+="lăm":a>0&&(o+=ct[a])):n===1?(o+="mười ",a===5?o+="lăm":a>0&&(o+=ct[a])):a>0&&(e>0&&(o+="lẻ "),o+=ct[a]),o.trim()}function zt(t){if(t===0)return"không";const e=["","nghìn","triệu","tỷ"];let n="",a=0;for(;t>0;){const o=t%1e3;o>0&&(n=pe(o)+" "+e[a]+" "+n),t=Math.floor(t/1e3),a++}return n.trim()}function J(t,e=null){try{const n=localStorage.getItem(t);return n!==null?JSON.parse(n):e}catch{return e}}function A(t,e){localStorage.setItem(t,JSON.stringify(e))}let $=J(V)??{...nt},W=J(_)??{},st=J(R)??{},C=J(at)??"custom";function ue(){$=J(V)??{...nt},W=J(_)??{};const t={...$,...W};let e="";for(let n of yt){const a=tt(n)||et(n);if(a&&a.value){e=a.value;break}}e&&yt.forEach(n=>z(n,e)),Object.keys(t).forEach(n=>{let a=tt(n)||et(n);a&&lt(a,t[n])}),T("✅ Auto fill complete")}function fe(){let t=J(R)??{};const e=Object.keys(t);if(e.length===0){T("⚠️ No sync mapping","#ffc107");return}e.forEach(n=>{let a=tt(n)||et(n);a&&a.value!==void 0&&a.value!==""&&t[n].split(",").map(i=>i.trim()).filter(i=>i).forEach(i=>z(i,a.value))}),T("✅ Sync form complete","#d39e00")}function ge(t,e,n,a){const o=document.createElement("div");o.className="cw-tab-header";const i=document.createElement("div");i.innerText="📋 Custom",i.className="cw-tab cw-tab-custom";const l=document.createElement("div");l.innerText="🔗 Sync",l.className="cw-tab cw-tab-sync";const s=document.createElement("div");s.innerText="📌 Default",s.className="cw-tab cw-tab-default";function r(){i.classList.remove("active"),s.classList.remove("active"),l.classList.remove("active"),C==="custom"?i.classList.add("active"):C==="default"?s.classList.add("active"):l.classList.add("active")}r(),o.appendChild(i),o.appendChild(s),o.appendChild(l);const p=document.createElement("div");p.style.display=a.data?"none":"block";const g=e("📋 Cấu hình Data","data",f=>{p.style.display=f?"none":"block",n(t)}),u=document.createElement("button");u.innerText="📥",u.title="Import JSON";const d=document.createElement("button");d.innerText="📤",d.title="Export JSON",[u,d].forEach(f=>f.className="cw-icon-btn");const k=g.querySelector(".wg-toggle-btn"),v=document.createElement("div");v.className="cw-right-wrap",v.appendChild(u),v.appendChild(d),v.appendChild(k),g.appendChild(v);const S=document.createElement("div");S.className="cw-data-body",p.appendChild(o),p.appendChild(S),t.appendChild(g),t.appendChild(p);function N(){S.innerHTML="";let f=C==="sync"?st:C==="custom"?W:$;const w=Object.keys(f);if(w.length===0&&(C==="custom"||C==="sync")){S.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>';return}w.forEach(y=>{const L=document.createElement("div");L.className="cw-data-row";let M=C==="custom"||C==="sync";const E=document.createElement("input");E.type="text",E.value=y,E.title=y,E.className="cw-data-key"+(M?" mutable":""),E.readOnly=!M,M&&(E.onchange=()=>{const D=E.value.trim();if(!D||D===y){E.value=y;return}if(f.hasOwnProperty(D)){alert(`Nhãn "${D}" đã tồn tại!`),E.value=y;return}f[D]=f[y],delete f[y],A(C==="sync"?R:_,f),N()});const B=document.createElement("input");if(B.type="text",B.value=f[y]??"",B.className="cw-data-val",B.oninput=()=>{f[y]=B.value,A(C==="sync"?R:C==="custom"?_:V,f)},C==="sync"&&(B.placeholder="Các nhãn đích..."),L.appendChild(E),L.appendChild(B),C==="custom"||C==="sync"){const D=document.createElement("button");D.innerHTML="✕",D.className="cw-del-btn",D.onclick=()=>{confirm(`Delete "${y}"?`)&&(delete f[y],C==="custom"&&A(_,f),C==="sync"&&A(R,f),N())},L.appendChild(D)}else{const D=document.createElement("div");D.className="cw-pad",L.appendChild(D)}S.appendChild(L)});const h=document.createElement("div");h.className="cw-data-hint",h.innerText=`${w.length} fields · auto-saved`,S.appendChild(h)}N(),i.onclick=()=>{C="custom",A(at,"custom"),r(),N()},s.onclick=()=>{C="default",A(at,"default"),r(),N()},l.onclick=()=>{C="sync",A(at,"sync"),r(),N()},d.onclick=()=>{const f={defaultData:$,customData:W,syncData:st},w=new Blob([JSON.stringify(f,null,2)],{type:"application/json"}),h=URL.createObjectURL(w),y=document.createElement("a");y.href=h,y.download=`vnpt_data_${Date.now()}.json`,y.click(),URL.revokeObjectURL(h)},u.onclick=()=>{const f=document.createElement("input");f.type="file",f.accept=".json",f.onchange=async w=>{const h=w.target.files[0];if(h)try{const y=await At.download("local",h,{type:"text"}),L=JSON.parse(y);L.defaultData&&($=L.defaultData,A(V,$)),L.customData&&(W=L.customData,A(_,W)),L.syncData&&(st=L.syncData,A(R,st)),N(),T("✅ Import successful!")}catch{alert("Invalid JSON file format or error reading file!")}},f.click()},t.querySelector("#vnpt-cw-fill").onclick=ue,t.querySelector("#vnpt-cw-sync").onclick=fe,t.querySelector("#vnpt-cw-add").onclick=()=>{C==="default"&&(C="custom",A(at,"custom"),r());let f=C==="sync"?st:W,w=1,h="new_field";for(;f.hasOwnProperty(h);)h="new_field_"+w,w++;f[h]="",A(C==="sync"?R:_,f),a.data&&(a.data=!1,A(Et,a),p.style.display="block",g.querySelector(".wg-toggle-btn").innerText="▴"),N(),S.scrollTop=S.scrollHeight},t.querySelector("#vnpt-cw-reset").onclick=()=>{confirm("Reset [Default Data] to hardcoded values?")&&($={...nt},A(V,$),C==="default"&&N(),T("Reset complete","#17a2b8"))}}let kt=!1;document.addEventListener("input",t=>{var s,r,p;if(kt||!t.target||!["INPUT","TEXTAREA"].includes(t.target.tagName))return;let e=J(R)??{};if(Object.keys(e).length===0)return;let n=t.target.id,a=t.target.name,o=null,i=null;if(n){const g=document.querySelector(`label[for="${n}"]`);g&&(o=g.textContent.trim(),i=(s=g.innerText)==null?void 0:s.trim())}if(!o){const g=t.target.closest("label");g&&(o=(r=Array.from(g.childNodes).find(u=>u.nodeType===3))==null?void 0:r.textContent.trim(),i=(p=g.innerText)==null?void 0:p.trim())}let l=e[n]||e[a]||e[o]||e[i];if(l){kt=!0;try{const g=t.target.value;l.split(",").map(d=>d.trim()).filter(d=>d).forEach(d=>{d!==n&&d!==a&&d!==o&&d!==i&&z(d,g)})}finally{kt=!1}}});function dt(t,e=null){try{const n=localStorage.getItem(t);return n!==null?JSON.parse(n):e}catch{return e}}function Tt(t,e){localStorage.setItem(t,JSON.stringify(e))}let Y=Number(localStorage.getItem(Dt))||.08,G=dt(Et)??{calc:!1,data:!0};function ot(t,e){if(!e||e.replace(/\D/g,"").length<6)return;let n=dt(t,[]);n=n.filter(a=>a!==e),n.unshift(e),Tt(t,n.slice(0,10))}function X(t,e){const n=document.getElementById(e);n&&(n.innerHTML=dt(t,[]).map(a=>`<option value="${a}">`).join(""))}function Ft(t){const e=window.innerWidth,n=window.innerHeight,a=t.getBoundingClientRect();t.style.left=Math.min(Math.max(parseFloat(t.style.left),0),e-a.width)+"px",t.style.top=Math.min(Math.max(parseFloat(t.style.top),0),n-36)+"px"}function me(t,e,n){const a=document.createElement("div");a.className="wg-sec-header";const o=document.createElement("span");o.innerText=t;const i=document.createElement("button");return i.className="wg-toggle-btn",i.innerText=G[e]?"▾":"▴",a.appendChild(o),a.appendChild(i),i.onclick=()=>{G[e]=!G[e],i.innerText=G[e]?"▾":"▴",Tt(Et,G),n(G[e])},a}function he(){const t=document.createElement("div");t.id="vnpt-calc-widget";const e=dt(Bt),n=!!(e&&e.docked);Object.assign(t.style,{top:e&&e.y?e.y+"px":"16px",left:e&&e.x?e.x+"px":window.innerWidth-236+"px"});function a(m,x){const b=document.createElement("button");return b.innerText=m,b.className="cw-action-btn "+x,b}const o=a("Fill","cw-btn-fill");o.id="vnpt-cw-fill";const i=a("Sync","cw-btn-sync");i.id="vnpt-cw-sync",i.title="Manual trigger for Sync Mapping";const l=a("Add","cw-btn-add");l.id="vnpt-cw-add";const s=a("↺","cw-btn-reset");s.id="vnpt-cw-reset",s.title="Reset Default fields back to original";const r=document.createElement("div");r.className="cw-btn-group",r.appendChild(o),r.appendChild(i),r.appendChild(l),r.appendChild(s);const p=document.createElement("div");p.className="cw-title-bar";const g=document.createElement("span");g.className="cw-title-label",g.innerHTML="VNPT Fast",p.appendChild(g),p.appendChild(r),t.appendChild(p),G.calc=!1;const u=document.createElement("div");u.className="cw-body-inline",u.innerHTML=`
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
    `;const d=document.getElementById("vnpt-inline-calc");d?d.appendChild(u):t.appendChild(u),document.body.appendChild(t),c.calcWidget=t,ge(t,me,Ft,G);const k=Array.from(t.children).filter(m=>m!==p);function v(m){k.forEach(x=>{x.style.display=m?"none":""}),p.style.borderRadius=m?"8px":"0",t.style.borderRadius=m?"8px":"10px",t.style.boxShadow=m?"0 -3px 16px rgba(25,135,84,0.55)":"0 4px 24px rgba(0,0,0,.3)",m&&(t.style.top=window.innerHeight-(p.offsetHeight||34)+"px")}const S=Ht(t,[p],Bt,null,m=>{v(m)});n&&S.setDocked(!0),window.addEventListener("resize",()=>{S.isDocked()?t.style.top=window.innerHeight-p.offsetHeight+"px":Ft(t)});const N=document.getElementById("wg-taxRate"),f=document.getElementById("wg-before"),w=document.getElementById("wg-tax"),h=document.getElementById("wg-after"),y=document.getElementById("wg-text"),L=document.getElementById("wg-calc-map-btn"),M=document.getElementById("wg-calc-map-wrap");let E=dt(It)??{};L.onclick=m=>{const x=M.style.display==="flex";if(M.style.display=x?"none":"flex",!x){const b=Q=>{!M.contains(Q.target)&&Q.target!==L&&(M.style.display="none",document.removeEventListener("click",b))};setTimeout(()=>document.addEventListener("click",b),0)}},t.querySelectorAll("input[data-clink]").forEach(m=>{const x=m.dataset.clink;m.value=(E[x]||[]).join(", "),m.addEventListener("input",()=>{E[x]=m.value.split(",").map(b=>b.trim()).filter(b=>b),Tt(It,E)})}),N.value=Y*100,X(K,"wg-before-list"),X(P,"wg-after-list");function B(m,x,b){const Q=Rt(zt(b))+" đồng";y.value=Q,(E.before||[]).forEach(Z=>z(Z,I(m))),(E.tax||[]).forEach(Z=>z(Z,I(x))),(E.after||[]).forEach(Z=>z(Z,I(b))),(E.text||[]).forEach(Z=>z(Z,Q))}function D(){const m=j(f.value),x=Math.round(m*Y),b=m+x;w.value=I(x),h.value=I(b),B(m,x,b)}function Kt(){const m=j(w.value),x=Math.round(m/Y),b=x+m;f.value=I(x),h.value=I(b),B(x,m,b)}function Pt(){const m=j(h.value),x=Math.round(m/(1+Y)),b=m-x;f.value=I(x),w.value=I(b),B(x,b,m)}N.addEventListener("input",()=>{Y=Number(N.value)/100||0,localStorage.setItem(Dt,Y),D()}),f.addEventListener("input",()=>{const m=j(f.value),x=Math.round(m*Y),b=m+x;w.value=I(x),h.value=I(b),y.value=Rt(zt(b))+" đồng"}),f.addEventListener("blur",()=>{f.value=I(j(f.value)),ot(K,f.value),X(K,"wg-before-list")}),f.addEventListener("change",()=>{f.value=I(j(f.value)),ot(K,f.value),X(K,"wg-before-list"),D()}),w.addEventListener("input",Kt),h.addEventListener("input",Pt),h.addEventListener("blur",()=>{h.value=I(j(h.value)),ot(P,h.value),X(P,"wg-after-list")}),h.addEventListener("change",()=>{h.value=I(j(h.value)),ot(P,h.value),X(P,"wg-after-list"),Pt()}),[{el:f,key:K},{el:w,key:null},{el:h,key:P},{el:y,key:null}].forEach(m=>{m.el&&["click","focus"].forEach(x=>{m.el.addEventListener(x,b=>{if(b.target.value){navigator.clipboard.writeText(b.target.value),m.key===K&&(ot(K,b.target.value),X(K,"wg-before-list")),m.key===P&&(ot(P,b.target.value),X(P,"wg-after-list"));const Q=b.target.style.backgroundColor;b.target.style.backgroundColor="#d1e7dd",setTimeout(()=>b.target.style.backgroundColor=Q,300)}})})})}function Lt(){if(!window.__vnptInited){window.__vnptInited=!0,xt.info("Initializing VNPT Userscript (DEV)...");try{Vt(),ae(),ie(),te(),vt(),re(),le(),de(),he(),xt.info("Userscript initialized successfully.")}catch(t){xt.error("Error during userscript initialization:",t)}}}window.__vnptInit=Lt,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Lt):Lt()})();
