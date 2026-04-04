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
(function(){"use strict";const xe={info:(...n)=>console.log("[Tampermonkey Script] INFO:",...n),error:(...n)=>console.error("[Tampermonkey Script] ERROR:",...n),warn:(...n)=>console.warn("[Tampermonkey Script] WARN:",...n)};function k_(){GM_addStyle(`
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
        #vnpt-export-panel { position: relative; width: 440px; min-width: 300px; max-height: 85vh; resize: both; overflow: hidden; display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 10px; padding: 10px; box-shadow: 0 8px 30px rgba(0,0,0,0.2); transition: none; }
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
        #vnpt-panel-header { margin: 0 0 0 0; color: #1a73e8; font-size: 15px; border-bottom: 2px solid #f0f0f0; cursor: move; user-select: none; display: flex; align-items: center; justify-content: space-between; font-weight: bold;}
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
        .vnpt-field-row input.f-label { flex: 0.55; color: #0056b3; font-weight: bold;}
        .vnpt-field-row input.f-key { display: none; flex: 0.45; font-weight: bold; color: #d63384;}
        .show-ids .vnpt-field-row input.f-key { display: block; }
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
        .btn-toggle-id { background: #e0f7fa; color: #00838f; } .btn-toggle-id:hover { background: #b2ebf2; }
        .btn-add { background: #e8eaed; color: #3c4043; } .btn-add:hover { background: #dadce0; }
        .btn-fill-back { background: #ab47bc; color: #fff; } .btn-fill-back:hover { background: #8e24aa; }
        .btn-clean { background: #ff5252; color: #fff; } .btn-clean:hover { background: #ff1744; }
        .btn-export { background: #1a73e8; color: white; padding: 4px 10px; font-size: 11px; font-weight: bold;} .btn-export:hover { background: #1557b0; }

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
    `)}const L={widget:null,panel:null,header:null,toggleBtn:null,fieldsContainer:null,calcWidget:null,draggedRowForVNPT:null},dr={tenDaiDienn:"Tên Đại Diện",chucVu:"Chức Vụ",ngaySinhCustomer:"Ngày Sinh KH",diaChi:"Địa chỉ",cmnd:"CMND/CCCD",ngayCapCustomer:"Ngày Cấp CMND",noiCap:"Nơi Cấp",sdt:"SĐT",emailDaiDien:"Email Nhận TK",tenToChuc:"Tên Tổ Chức",ngayCapSoDkdnCustomer:"Ngày Cấp ĐKKD",soDkdn:"Số GPKD | MST",goiDV:"Gói Dịch Vụ",ngayKy:"Ngày ký",thangKy:"Tháng Ký",namKy:"Năm ký",soHopDong:"Số Hợp đồng",soLuongGoi:"Số Lượng Gói"},fa="vnpt_docx_fields",yu="vnpt_docx_position",vu="vnpt_docx_size",pa="vnpt_docx_opened",Wi="vnpt_autofill_data_default",An="vnpt_autofill_data_custom",Ut="vnpt_autofill_data_sync",Eu="vnpt_widget_pos",wu="vnd_tax_rate",Sn="vnd_before_history",Rn="vnd_after_history",ga="vnpt_widget_collapsed",Tu="vnd_calc_map",ji="vnpt_widget_datatab",Iu="vnpt_templates";function fe(n,e="#198754"){const t=document.createElement("div");t.innerText=n,Object.assign(t.style,{position:"fixed",bottom:"20px",left:"50%",transform:"translateX(-50%)",background:e,color:"#fff",padding:"7px 16px",borderRadius:"20px",zIndex:"100000",opacity:"0",transition:"opacity .25s",fontSize:"13px",fontFamily:"'Segoe UI',sans-serif",boxShadow:"0 4px 14px rgba(0,0,0,.25)"}),document.body.appendChild(t),setTimeout(()=>t.style.opacity="1",30),setTimeout(()=>{t.style.opacity="0",setTimeout(()=>t.remove(),280)},2200)}const N_=()=>{};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bu={NODE_ADMIN:!1,SDK_VERSION:"${JSCORE_VERSION}"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const x=function(n,e){if(!n)throw si(e)},si=function(n){return new Error("Firebase Database ("+bu.SDK_VERSION+") INTERNAL ASSERT FAILED: "+n)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cu=function(n){const e=[];let t=0;for(let i=0;i<n.length;i++){let s=n.charCodeAt(i);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&i+1<n.length&&(n.charCodeAt(i+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++i)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},x_=function(n){const e=[];let t=0,i=0;for(;t<n.length;){const s=n[t++];if(s<128)e[i++]=String.fromCharCode(s);else if(s>191&&s<224){const r=n[t++];e[i++]=String.fromCharCode((s&31)<<6|r&63)}else if(s>239&&s<365){const r=n[t++],o=n[t++],l=n[t++],c=((s&7)<<18|(r&63)<<12|(o&63)<<6|l&63)-65536;e[i++]=String.fromCharCode(55296+(c>>10)),e[i++]=String.fromCharCode(56320+(c&1023))}else{const r=n[t++],o=n[t++];e[i++]=String.fromCharCode((s&15)<<12|(r&63)<<6|o&63)}}return e.join("")},ma={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,i=[];for(let s=0;s<n.length;s+=3){const r=n[s],o=s+1<n.length,l=o?n[s+1]:0,c=s+2<n.length,u=c?n[s+2]:0,f=r>>2,p=(r&3)<<4|l>>4;let m=(l&15)<<2|u>>6,b=u&63;c||(b=64,o||(m=64)),i.push(t[f],t[p],t[m],t[b])}return i.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(Cu(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):x_(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,i=[];for(let s=0;s<n.length;){const r=t[n.charAt(s++)],l=s<n.length?t[n.charAt(s)]:0;++s;const u=s<n.length?t[n.charAt(s)]:64;++s;const p=s<n.length?t[n.charAt(s)]:64;if(++s,r==null||l==null||u==null||p==null)throw new D_;const m=r<<2|l>>4;if(i.push(m),u!==64){const b=l<<4&240|u>>2;if(i.push(b),p!==64){const S=u<<6&192|p;i.push(S)}}}return i},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class D_ extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Au=function(n){const e=Cu(n);return ma.encodeByteArray(e,!0)},fr=function(n){return Au(n).replace(/\./g,"")},pr=function(n){try{return ma.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function O_(n){return Su(void 0,n)}function Su(n,e){if(!(e instanceof Object))return e;switch(e.constructor){case Date:const t=e;return new Date(t.getTime());case Object:n===void 0&&(n={});break;case Array:n=[];break;default:return e}for(const t in e)!e.hasOwnProperty(t)||!V_(t)||(n[t]=Su(n[t],e[t]));return n}function V_(n){return n!=="__proto__"}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function L_(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const M_=()=>L_().__FIREBASE_DEFAULTS__,F_=()=>{if(typeof process>"u"||typeof process.env>"u")return;const n=process.env.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},U_=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&pr(n[1]);return e&&JSON.parse(e)},gr=()=>{try{return N_()||M_()||F_()||U_()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Ru=n=>{var e,t;return(t=(e=gr())==null?void 0:e.emulatorHosts)==null?void 0:t[n]},Pu=n=>{const e=Ru(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const i=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),i]:[e.substring(0,t),i]},ku=()=>{var n;return(n=gr())==null?void 0:n.config},Nu=n=>{var e;return(e=gr())==null?void 0:e[`_${n}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mr{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,i)=>{t?this.reject(t):this.resolve(i),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,i))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xu(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},i=e||"demo-project",s=n.iat||0,r=n.sub||n.user_id;if(!r)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o={iss:`https://securetoken.google.com/${i}`,aud:i,iat:s,exp:s+3600,auth_time:s,sub:r,user_id:r,firebase:{sign_in_provider:"custom",identities:{}},...n};return[fr(JSON.stringify(t)),fr(JSON.stringify(o)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Le(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function _a(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Le())}function B_(){var e;const n=(e=gr())==null?void 0:e.forceEnvironment;if(n==="node")return!0;if(n==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function q_(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function H_(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Du(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function z_(){const n=Le();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function W_(){return bu.NODE_ADMIN===!0}function j_(){return!B_()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function $_(){try{return typeof indexedDB=="object"}catch{return!1}}function G_(){return new Promise((n,e)=>{try{let t=!0;const i="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(i);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(i),n(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var r;e(((r=s.error)==null?void 0:r.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const K_="FirebaseError";class It extends Error{constructor(e,t,i){super(t),this.code=e,this.customData=i,this.name=K_,Object.setPrototypeOf(this,It.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,$i.prototype.create)}}class $i{constructor(e,t,i){this.service=e,this.serviceName=t,this.errors=i}create(e,...t){const i=t[0]||{},s=`${this.service}/${e}`,r=this.errors[e],o=r?Q_(r,i):"Error",l=`${this.serviceName}: ${o} (${s}).`;return new It(s,l,i)}}function Q_(n,e){return n.replace(Y_,(t,i)=>{const s=e[i];return s!=null?String(s):`<${i}?>`})}const Y_=/\{\$([^}]+)}/g;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gi(n){return JSON.parse(n)}function Ee(n){return JSON.stringify(n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ou=function(n){let e={},t={},i={},s="";try{const r=n.split(".");e=Gi(pr(r[0])||""),t=Gi(pr(r[1])||""),s=r[2],i=t.d||{},delete t.d}catch{}return{header:e,claims:t,data:i,signature:s}},X_=function(n){const e=Ou(n),t=e.claims;return!!t&&typeof t=="object"&&t.hasOwnProperty("iat")},J_=function(n){const e=Ou(n).claims;return typeof e=="object"&&e.admin===!0};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bt(n,e){return Object.prototype.hasOwnProperty.call(n,e)}function ri(n,e){if(Object.prototype.hasOwnProperty.call(n,e))return n[e]}function ya(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function _r(n,e,t){const i={};for(const s in n)Object.prototype.hasOwnProperty.call(n,s)&&(i[s]=e.call(t,n[s],s,n));return i}function Bt(n,e){if(n===e)return!0;const t=Object.keys(n),i=Object.keys(e);for(const s of t){if(!i.includes(s))return!1;const r=n[s],o=e[s];if(Vu(r)&&Vu(o)){if(!Bt(r,o))return!1}else if(r!==o)return!1}for(const s of i)if(!t.includes(s))return!1;return!0}function Vu(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oi(n){const e=[];for(const[t,i]of Object.entries(n))Array.isArray(i)?i.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(i));return e.length?"&"+e.join("&"):""}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Z_{constructor(){this.chain_=[],this.buf_=[],this.W_=[],this.pad_=[],this.inbuf_=0,this.total_=0,this.blockSize=512/8,this.pad_[0]=128;for(let e=1;e<this.blockSize;++e)this.pad_[e]=0;this.reset()}reset(){this.chain_[0]=1732584193,this.chain_[1]=4023233417,this.chain_[2]=2562383102,this.chain_[3]=271733878,this.chain_[4]=3285377520,this.inbuf_=0,this.total_=0}compress_(e,t){t||(t=0);const i=this.W_;if(typeof e=="string")for(let p=0;p<16;p++)i[p]=e.charCodeAt(t)<<24|e.charCodeAt(t+1)<<16|e.charCodeAt(t+2)<<8|e.charCodeAt(t+3),t+=4;else for(let p=0;p<16;p++)i[p]=e[t]<<24|e[t+1]<<16|e[t+2]<<8|e[t+3],t+=4;for(let p=16;p<80;p++){const m=i[p-3]^i[p-8]^i[p-14]^i[p-16];i[p]=(m<<1|m>>>31)&4294967295}let s=this.chain_[0],r=this.chain_[1],o=this.chain_[2],l=this.chain_[3],c=this.chain_[4],u,f;for(let p=0;p<80;p++){p<40?p<20?(u=l^r&(o^l),f=1518500249):(u=r^o^l,f=1859775393):p<60?(u=r&o|l&(r|o),f=2400959708):(u=r^o^l,f=3395469782);const m=(s<<5|s>>>27)+u+c+f+i[p]&4294967295;c=l,l=o,o=(r<<30|r>>>2)&4294967295,r=s,s=m}this.chain_[0]=this.chain_[0]+s&4294967295,this.chain_[1]=this.chain_[1]+r&4294967295,this.chain_[2]=this.chain_[2]+o&4294967295,this.chain_[3]=this.chain_[3]+l&4294967295,this.chain_[4]=this.chain_[4]+c&4294967295}update(e,t){if(e==null)return;t===void 0&&(t=e.length);const i=t-this.blockSize;let s=0;const r=this.buf_;let o=this.inbuf_;for(;s<t;){if(o===0)for(;s<=i;)this.compress_(e,s),s+=this.blockSize;if(typeof e=="string"){for(;s<t;)if(r[o]=e.charCodeAt(s),++o,++s,o===this.blockSize){this.compress_(r),o=0;break}}else for(;s<t;)if(r[o]=e[s],++o,++s,o===this.blockSize){this.compress_(r),o=0;break}}this.inbuf_=o,this.total_+=t}digest(){const e=[];let t=this.total_*8;this.inbuf_<56?this.update(this.pad_,56-this.inbuf_):this.update(this.pad_,this.blockSize-(this.inbuf_-56));for(let s=this.blockSize-1;s>=56;s--)this.buf_[s]=t&255,t/=256;this.compress_(this.buf_);let i=0;for(let s=0;s<5;s++)for(let r=24;r>=0;r-=8)e[i]=this.chain_[s]>>r&255,++i;return e}}function ey(n,e){const t=new ty(n,e);return t.subscribe.bind(t)}class ty{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(i=>{this.error(i)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,i){let s;if(e===void 0&&t===void 0&&i===void 0)throw new Error("Missing Observer.");ny(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:i},s.next===void 0&&(s.next=va),s.error===void 0&&(s.error=va),s.complete===void 0&&(s.complete=va);const r=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),r}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(i){typeof console<"u"&&console.error&&console.error(i)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function ny(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function va(){}function Ea(n,e){return`${n} failed: ${e} argument `}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iy=function(n){const e=[];let t=0;for(let i=0;i<n.length;i++){let s=n.charCodeAt(i);if(s>=55296&&s<=56319){const r=s-55296;i++,x(i<n.length,"Surrogate pair missing trail surrogate.");const o=n.charCodeAt(i)-56320;s=65536+(r<<10)+o}s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):s<65536?(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},yr=function(n){let e=0;for(let t=0;t<n.length;t++){const i=n.charCodeAt(t);i<128?e++:i<2048?e+=2:i>=55296&&i<=56319?(e+=4,t++):e+=3}return e};/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ae(n){return n&&n._delegate?n._delegate:n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pn(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function wa(n){return(await fetch(n,{credentials:"include"})).ok}class qt{constructor(e,t,i){this.name=e,this.instanceFactory=t,this.type=i,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kn="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sy{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const i=new mr;if(this.instancesDeferred.set(t,i),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&i.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),i=(e==null?void 0:e.optional)??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(s){if(i)return null;throw s}else{if(i)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(oy(e))try{this.getOrInitializeService({instanceIdentifier:kn})}catch{}for(const[t,i]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const r=this.getOrInitializeService({instanceIdentifier:s});i.resolve(r)}catch{}}}}clearInstance(e=kn){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=kn){return this.instances.has(e)}getOptions(e=kn){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,i=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(i))throw Error(`${this.name}(${i}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:i,options:t});for(const[r,o]of this.instancesDeferred.entries()){const l=this.normalizeInstanceIdentifier(r);i===l&&o.resolve(s)}return s}onInit(e,t){const i=this.normalizeInstanceIdentifier(t),s=this.onInitCallbacks.get(i)??new Set;s.add(e),this.onInitCallbacks.set(i,s);const r=this.instances.get(i);return r&&e(r,i),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const i=this.onInitCallbacks.get(t);if(i)for(const s of i)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let i=this.instances.get(e);if(!i&&this.component&&(i=this.component.instanceFactory(this.container,{instanceIdentifier:ry(e),options:t}),this.instances.set(e,i),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(i,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,i)}catch{}return i||null}normalizeInstanceIdentifier(e=kn){return this.component?this.component.multipleInstances?e:kn:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function ry(n){return n===kn?void 0:n}function oy(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ay{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new sy(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Y;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(Y||(Y={}));const ly={debug:Y.DEBUG,verbose:Y.VERBOSE,info:Y.INFO,warn:Y.WARN,error:Y.ERROR,silent:Y.SILENT},cy=Y.INFO,uy={[Y.DEBUG]:"log",[Y.VERBOSE]:"log",[Y.INFO]:"info",[Y.WARN]:"warn",[Y.ERROR]:"error"},hy=(n,e,...t)=>{if(e<n.logLevel)return;const i=new Date().toISOString(),s=uy[e];if(s)console[s](`[${i}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class vr{constructor(e){this.name=e,this._logLevel=cy,this._logHandler=hy,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in Y))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?ly[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,Y.DEBUG,...e),this._logHandler(this,Y.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,Y.VERBOSE,...e),this._logHandler(this,Y.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,Y.INFO,...e),this._logHandler(this,Y.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,Y.WARN,...e),this._logHandler(this,Y.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,Y.ERROR,...e),this._logHandler(this,Y.ERROR,...e)}}const dy=(n,e)=>e.some(t=>n instanceof t);let Lu,Mu;function fy(){return Lu||(Lu=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function py(){return Mu||(Mu=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Fu=new WeakMap,Ta=new WeakMap,Uu=new WeakMap,Ia=new WeakMap,ba=new WeakMap;function gy(n){const e=new Promise((t,i)=>{const s=()=>{n.removeEventListener("success",r),n.removeEventListener("error",o)},r=()=>{t(Ht(n.result)),s()},o=()=>{i(n.error),s()};n.addEventListener("success",r),n.addEventListener("error",o)});return e.then(t=>{t instanceof IDBCursor&&Fu.set(t,n)}).catch(()=>{}),ba.set(e,n),e}function my(n){if(Ta.has(n))return;const e=new Promise((t,i)=>{const s=()=>{n.removeEventListener("complete",r),n.removeEventListener("error",o),n.removeEventListener("abort",o)},r=()=>{t(),s()},o=()=>{i(n.error||new DOMException("AbortError","AbortError")),s()};n.addEventListener("complete",r),n.addEventListener("error",o),n.addEventListener("abort",o)});Ta.set(n,e)}let Ca={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return Ta.get(n);if(e==="objectStoreNames")return n.objectStoreNames||Uu.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return Ht(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function _y(n){Ca=n(Ca)}function yy(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const i=n.call(Aa(this),e,...t);return Uu.set(i,e.sort?e.sort():[e]),Ht(i)}:py().includes(n)?function(...e){return n.apply(Aa(this),e),Ht(Fu.get(this))}:function(...e){return Ht(n.apply(Aa(this),e))}}function vy(n){return typeof n=="function"?yy(n):(n instanceof IDBTransaction&&my(n),dy(n,fy())?new Proxy(n,Ca):n)}function Ht(n){if(n instanceof IDBRequest)return gy(n);if(Ia.has(n))return Ia.get(n);const e=vy(n);return e!==n&&(Ia.set(n,e),ba.set(e,n)),e}const Aa=n=>ba.get(n);function Ey(n,e,{blocked:t,upgrade:i,blocking:s,terminated:r}={}){const o=indexedDB.open(n,e),l=Ht(o);return i&&o.addEventListener("upgradeneeded",c=>{i(Ht(o.result),c.oldVersion,c.newVersion,Ht(o.transaction),c)}),t&&o.addEventListener("blocked",c=>t(c.oldVersion,c.newVersion,c)),l.then(c=>{r&&c.addEventListener("close",()=>r()),s&&c.addEventListener("versionchange",u=>s(u.oldVersion,u.newVersion,u))}).catch(()=>{}),l}const wy=["get","getKey","getAll","getAllKeys","count"],Ty=["put","add","delete","clear"],Sa=new Map;function Bu(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(Sa.get(e))return Sa.get(e);const t=e.replace(/FromIndex$/,""),i=e!==t,s=Ty.includes(t);if(!(t in(i?IDBIndex:IDBObjectStore).prototype)||!(s||wy.includes(t)))return;const r=async function(o,...l){const c=this.transaction(o,s?"readwrite":"readonly");let u=c.store;return i&&(u=u.index(l.shift())),(await Promise.all([u[t](...l),s&&c.done]))[0]};return Sa.set(e,r),r}_y(n=>({...n,get:(e,t,i)=>Bu(e,t)||n.get(e,t,i),has:(e,t)=>!!Bu(e,t)||n.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Iy{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(by(t)){const i=t.getImmediate();return`${i.library}/${i.version}`}else return null}).filter(t=>t).join(" ")}}function by(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Ra="@firebase/app",qu="0.14.10";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ct=new vr("@firebase/app"),Cy="@firebase/app-compat",Ay="@firebase/analytics-compat",Sy="@firebase/analytics",Ry="@firebase/app-check-compat",Py="@firebase/app-check",ky="@firebase/auth",Ny="@firebase/auth-compat",xy="@firebase/database",Dy="@firebase/data-connect",Oy="@firebase/database-compat",Vy="@firebase/functions",Ly="@firebase/functions-compat",My="@firebase/installations",Fy="@firebase/installations-compat",Uy="@firebase/messaging",By="@firebase/messaging-compat",qy="@firebase/performance",Hy="@firebase/performance-compat",zy="@firebase/remote-config",Wy="@firebase/remote-config-compat",jy="@firebase/storage",$y="@firebase/storage-compat",Gy="@firebase/firestore",Ky="@firebase/ai",Qy="@firebase/firestore-compat",Yy="firebase",Xy="12.11.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pa="[DEFAULT]",Jy={[Ra]:"fire-core",[Cy]:"fire-core-compat",[Sy]:"fire-analytics",[Ay]:"fire-analytics-compat",[Py]:"fire-app-check",[Ry]:"fire-app-check-compat",[ky]:"fire-auth",[Ny]:"fire-auth-compat",[xy]:"fire-rtdb",[Dy]:"fire-data-connect",[Oy]:"fire-rtdb-compat",[Vy]:"fire-fn",[Ly]:"fire-fn-compat",[My]:"fire-iid",[Fy]:"fire-iid-compat",[Uy]:"fire-fcm",[By]:"fire-fcm-compat",[qy]:"fire-perf",[Hy]:"fire-perf-compat",[zy]:"fire-rc",[Wy]:"fire-rc-compat",[jy]:"fire-gcs",[$y]:"fire-gcs-compat",[Gy]:"fire-fst",[Qy]:"fire-fst-compat",[Ky]:"fire-vertex","fire-js":"fire-js",[Yy]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Er=new Map,Zy=new Map,ka=new Map;function Hu(n,e){try{n.container.addComponent(e)}catch(t){Ct.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Nn(n){const e=n.name;if(ka.has(e))return Ct.debug(`There were multiple attempts to register component ${e}.`),!1;ka.set(e,n);for(const t of Er.values())Hu(t,n);for(const t of Zy.values())Hu(t,n);return!0}function wr(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function Ze(n){return n==null?!1:n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ev={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},zt=new $i("app","Firebase",ev);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tv{constructor(e,t,i){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=i,this.container.addComponent(new qt("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw zt.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xn=Xy;function zu(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const i={name:Pa,automaticDataCollectionEnabled:!0,...e},s=i.name;if(typeof s!="string"||!s)throw zt.create("bad-app-name",{appName:String(s)});if(t||(t=ku()),!t)throw zt.create("no-options");const r=Er.get(s);if(r){if(Bt(t,r.options)&&Bt(i,r.config))return r;throw zt.create("duplicate-app",{appName:s})}const o=new ay(s);for(const c of ka.values())o.addComponent(c);const l=new tv(t,i,o);return Er.set(s,l),l}function Na(n=Pa){const e=Er.get(n);if(!e&&n===Pa&&ku())return zu();if(!e)throw zt.create("no-app",{appName:n});return e}function ct(n,e,t){let i=Jy[n]??n;t&&(i+=`-${t}`);const s=i.match(/\s|\//),r=e.match(/\s|\//);if(s||r){const o=[`Unable to register library "${i}" with version "${e}":`];s&&o.push(`library name "${i}" contains illegal characters (whitespace or "/")`),s&&r&&o.push("and"),r&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Ct.warn(o.join(" "));return}Nn(new qt(`${i}-version`,()=>({library:i,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nv="firebase-heartbeat-database",iv=1,Ki="firebase-heartbeat-store";let xa=null;function Wu(){return xa||(xa=Ey(nv,iv,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Ki)}catch(t){console.warn(t)}}}}).catch(n=>{throw zt.create("idb-open",{originalErrorMessage:n.message})})),xa}async function sv(n){try{const t=(await Wu()).transaction(Ki),i=await t.objectStore(Ki).get($u(n));return await t.done,i}catch(e){if(e instanceof It)Ct.warn(e.message);else{const t=zt.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Ct.warn(t.message)}}}async function ju(n,e){try{const i=(await Wu()).transaction(Ki,"readwrite");await i.objectStore(Ki).put(e,$u(n)),await i.done}catch(t){if(t instanceof It)Ct.warn(t.message);else{const i=zt.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});Ct.warn(i.message)}}}function $u(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rv=1024,ov=30;class av{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new cv(t),this._heartbeatsCachePromise=this._storage.read().then(i=>(this._heartbeatsCache=i,i))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),r=Gu();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===r||this._heartbeatsCache.heartbeats.some(o=>o.date===r))return;if(this._heartbeatsCache.heartbeats.push({date:r,agent:s}),this._heartbeatsCache.heartbeats.length>ov){const o=uv(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(i){Ct.warn(i)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=Gu(),{heartbeatsToSend:i,unsentEntries:s}=lv(this._heartbeatsCache.heartbeats),r=fr(JSON.stringify({version:2,heartbeats:i}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),r}catch(t){return Ct.warn(t),""}}}function Gu(){return new Date().toISOString().substring(0,10)}function lv(n,e=rv){const t=[];let i=n.slice();for(const s of n){const r=t.find(o=>o.agent===s.agent);if(r){if(r.dates.push(s.date),Ku(t)>e){r.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),Ku(t)>e){t.pop();break}i=i.slice(1)}return{heartbeatsToSend:t,unsentEntries:i}}class cv{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return $_()?G_().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await sv(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const i=await this.read();return ju(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??i.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const i=await this.read();return ju(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...e.heartbeats]})}else return}}function Ku(n){return fr(JSON.stringify({version:2,heartbeats:n})).length}function uv(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let i=1;i<n.length;i++)n[i].date<t&&(t=n[i].date,e=i);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hv(n){Nn(new qt("platform-logger",e=>new Iy(e),"PRIVATE")),Nn(new qt("heartbeat",e=>new av(e),"PRIVATE")),ct(Ra,qu,n),ct(Ra,qu,"esm2020"),ct("fire-js","")}hv("");var dv="firebase",fv="12.11.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ct(dv,fv,"app");function Qu(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const pv=Qu,Yu=new $i("auth","Firebase",Qu());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Tr=new vr("@firebase/auth");function gv(n,...e){Tr.logLevel<=Y.WARN&&Tr.warn(`Auth (${xn}): ${n}`,...e)}function Ir(n,...e){Tr.logLevel<=Y.ERROR&&Tr.error(`Auth (${xn}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function At(n,...e){throw Da(n,...e)}function ut(n,...e){return Da(n,...e)}function Xu(n,e,t){const i={...pv(),[e]:t};return new $i("auth","Firebase",i).create(e,{appName:n.name})}function Wt(n){return Xu(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Da(n,...e){if(typeof n!="string"){const t=e[0],i=[...e.slice(1)];return i[0]&&(i[0].appName=n.name),n._errorFactory.create(t,...i)}return Yu.create(n,...e)}function z(n,e,...t){if(!n)throw Da(e,...t)}function St(n){const e="INTERNAL ASSERTION FAILED: "+n;throw Ir(e),new Error(e)}function Rt(n,e){n||St(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Oa(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.href)||""}function mv(){return Ju()==="http:"||Ju()==="https:"}function Ju(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _v(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(mv()||H_()||"connection"in navigator)?navigator.onLine:!0}function yv(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qi{constructor(e,t){this.shortDelay=e,this.longDelay=t,Rt(t>e,"Short delay should be less than long delay!"),this.isMobile=_a()||Du()}get(){return _v()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Va(n,e){Rt(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zu{static initialize(e,t,i){this.fetchImpl=e,t&&(this.headersImpl=t),i&&(this.responseImpl=i)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;St("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;St("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;St("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vv={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ev=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],wv=new Qi(3e4,6e4);function br(n,e){return n.tenantId&&!e.tenantId?{...e,tenantId:n.tenantId}:e}async function ai(n,e,t,i,s={}){return eh(n,s,async()=>{let r={},o={};i&&(e==="GET"?o=i:r={body:JSON.stringify(i)});const l=oi({key:n.config.apiKey,...o}).slice(1),c=await n._getAdditionalHeaders();c["Content-Type"]="application/json",n.languageCode&&(c["X-Firebase-Locale"]=n.languageCode);const u={method:e,headers:c,...r};return q_()||(u.referrerPolicy="no-referrer"),n.emulatorConfig&&Pn(n.emulatorConfig.host)&&(u.credentials="include"),Zu.fetch()(await nh(n,n.config.apiHost,t,l),u)})}async function eh(n,e,t){n._canInitEmulator=!1;const i={...vv,...e};try{const s=new Tv(n),r=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const o=await r.json();if("needConfirmation"in o)throw Cr(n,"account-exists-with-different-credential",o);if(r.ok&&!("errorMessage"in o))return o;{const l=r.ok?o.errorMessage:o.error.message,[c,u]=l.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw Cr(n,"credential-already-in-use",o);if(c==="EMAIL_EXISTS")throw Cr(n,"email-already-in-use",o);if(c==="USER_DISABLED")throw Cr(n,"user-disabled",o);const f=i[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(u)throw Xu(n,f,u);At(n,f)}}catch(s){if(s instanceof It)throw s;At(n,"network-request-failed",{message:String(s)})}}async function th(n,e,t,i,s={}){const r=await ai(n,e,t,i,s);return"mfaPendingCredential"in r&&At(n,"multi-factor-auth-required",{_serverResponse:r}),r}async function nh(n,e,t,i){const s=`${e}${t}?${i}`,r=n,o=r.config.emulator?Va(n.config,s):`${n.config.apiScheme}://${s}`;return Ev.includes(t)&&(await r._persistenceManagerAvailable,r._getPersistenceType()==="COOKIE")?r._getPersistence()._getFinalTarget(o).toString():o}class Tv{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,i)=>{this.timer=setTimeout(()=>i(ut(this.auth,"network-request-failed")),wv.get())})}}function Cr(n,e,t){const i={appName:n.name};t.email&&(i.email=t.email),t.phoneNumber&&(i.phoneNumber=t.phoneNumber);const s=ut(n,e,i);return s.customData._tokenResponse=t,s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Iv(n,e){return ai(n,"POST","/v1/accounts:delete",e)}async function Ar(n,e){return ai(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yi(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function bv(n,e=!1){const t=Ae(n),i=await t.getIdToken(e),s=Ma(i);z(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const r=typeof s.firebase=="object"?s.firebase:void 0,o=r==null?void 0:r.sign_in_provider;return{claims:s,token:i,authTime:Yi(La(s.auth_time)),issuedAtTime:Yi(La(s.iat)),expirationTime:Yi(La(s.exp)),signInProvider:o||null,signInSecondFactor:(r==null?void 0:r.sign_in_second_factor)||null}}function La(n){return Number(n)*1e3}function Ma(n){const[e,t,i]=n.split(".");if(e===void 0||t===void 0||i===void 0)return Ir("JWT malformed, contained fewer than 3 sections"),null;try{const s=pr(t);return s?JSON.parse(s):(Ir("Failed to decode base64 JWT payload"),null)}catch(s){return Ir("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function ih(n){const e=Ma(n);return z(e,"internal-error"),z(typeof e.exp<"u","internal-error"),z(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Xi(n,e,t=!1){if(t)return e;try{return await e}catch(i){throw i instanceof It&&Cv(i)&&n.auth.currentUser===n&&await n.auth.signOut(),i}}function Cv({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Av{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const i=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,i)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fa{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Yi(this.lastLoginAt),this.creationTime=Yi(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Sr(n){var p;const e=n.auth,t=await n.getIdToken(),i=await Xi(n,Ar(e,{idToken:t}));z(i==null?void 0:i.users.length,e,"internal-error");const s=i.users[0];n._notifyReloadListener(s);const r=(p=s.providerUserInfo)!=null&&p.length?sh(s.providerUserInfo):[],o=Rv(n.providerData,r),l=n.isAnonymous,c=!(n.email&&s.passwordHash)&&!(o!=null&&o.length),u=l?c:!1,f={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:o,metadata:new Fa(s.createdAt,s.lastLoginAt),isAnonymous:u};Object.assign(n,f)}async function Sv(n){const e=Ae(n);await Sr(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function Rv(n,e){return[...n.filter(i=>!e.some(s=>s.providerId===i.providerId)),...e]}function sh(n){return n.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Pv(n,e){const t=await eh(n,{},async()=>{const i=oi({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:r}=n.config,o=await nh(n,s,"/v1/token",`key=${r}`),l=await n._getAdditionalHeaders();l["Content-Type"]="application/x-www-form-urlencoded";const c={method:"POST",headers:l,body:i};return n.emulatorConfig&&Pn(n.emulatorConfig.host)&&(c.credentials="include"),Zu.fetch()(o,c)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function kv(n,e){return ai(n,"POST","/v2/accounts:revokeToken",br(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class li{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){z(e.idToken,"internal-error"),z(typeof e.idToken<"u","internal-error"),z(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):ih(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){z(e.length!==0,"internal-error");const t=ih(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(z(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:i,refreshToken:s,expiresIn:r}=await Pv(e,t);this.updateTokensAndExpiration(i,s,Number(r))}updateTokensAndExpiration(e,t,i){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+i*1e3}static fromJSON(e,t){const{refreshToken:i,accessToken:s,expirationTime:r}=t,o=new li;return i&&(z(typeof i=="string","internal-error",{appName:e}),o.refreshToken=i),s&&(z(typeof s=="string","internal-error",{appName:e}),o.accessToken=s),r&&(z(typeof r=="number","internal-error",{appName:e}),o.expirationTime=r),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new li,this.toJSON())}_performRefresh(){return St("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jt(n,e){z(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class nt{constructor({uid:e,auth:t,stsTokenManager:i,...s}){this.providerId="firebase",this.proactiveRefresh=new Av(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=i,this.accessToken=i.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new Fa(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const t=await Xi(this,this.stsTokenManager.getToken(this.auth,e));return z(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return bv(this,e)}reload(){return Sv(this)}_assign(e){this!==e&&(z(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new nt({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){z(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let i=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),i=!0),t&&await Sr(this),await this.auth._persistUserIfCurrent(this),i&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Ze(this.auth.app))return Promise.reject(Wt(this.auth));const e=await this.getIdToken();return await Xi(this,Iv(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const i=t.displayName??void 0,s=t.email??void 0,r=t.phoneNumber??void 0,o=t.photoURL??void 0,l=t.tenantId??void 0,c=t._redirectEventId??void 0,u=t.createdAt??void 0,f=t.lastLoginAt??void 0,{uid:p,emailVerified:m,isAnonymous:b,providerData:S,stsTokenManager:N}=t;z(p&&N,e,"internal-error");const P=li.fromJSON(this.name,N);z(typeof p=="string",e,"internal-error"),jt(i,e.name),jt(s,e.name),z(typeof m=="boolean",e,"internal-error"),z(typeof b=="boolean",e,"internal-error"),jt(r,e.name),jt(o,e.name),jt(l,e.name),jt(c,e.name),jt(u,e.name),jt(f,e.name);const D=new nt({uid:p,auth:e,email:s,emailVerified:m,displayName:i,isAnonymous:b,photoURL:o,phoneNumber:r,tenantId:l,stsTokenManager:P,createdAt:u,lastLoginAt:f});return S&&Array.isArray(S)&&(D.providerData=S.map(V=>({...V}))),c&&(D._redirectEventId=c),D}static async _fromIdTokenResponse(e,t,i=!1){const s=new li;s.updateFromServerResponse(t);const r=new nt({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:i});return await Sr(r),r}static async _fromGetAccountInfoResponse(e,t,i){const s=t.users[0];z(s.localId!==void 0,"internal-error");const r=s.providerUserInfo!==void 0?sh(s.providerUserInfo):[],o=!(s.email&&s.passwordHash)&&!(r!=null&&r.length),l=new li;l.updateFromIdToken(i);const c=new nt({uid:s.localId,auth:e,stsTokenManager:l,isAnonymous:o}),u={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:r,metadata:new Fa(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(r!=null&&r.length)};return Object.assign(c,u),c}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rh=new Map;function Pt(n){Rt(n instanceof Function,"Expected a class definition");let e=rh.get(n);return e?(Rt(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,rh.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oh{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}oh.type="NONE";const ah=oh;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rr(n,e,t){return`firebase:${n}:${e}:${t}`}class ci{constructor(e,t,i){this.persistence=e,this.auth=t,this.userKey=i;const{config:s,name:r}=this.auth;this.fullUserKey=Rr(this.userKey,s.apiKey,r),this.fullPersistenceKey=Rr("persistence",s.apiKey,r),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await Ar(this.auth,{idToken:e}).catch(()=>{});return t?nt._fromGetAccountInfoResponse(this.auth,t,e):null}return nt._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,i="authUser"){if(!t.length)return new ci(Pt(ah),e,i);const s=(await Promise.all(t.map(async u=>{if(await u._isAvailable())return u}))).filter(u=>u);let r=s[0]||Pt(ah);const o=Rr(i,e.config.apiKey,e.name);let l=null;for(const u of t)try{const f=await u._get(o);if(f){let p;if(typeof f=="string"){const m=await Ar(e,{idToken:f}).catch(()=>{});if(!m)break;p=await nt._fromGetAccountInfoResponse(e,m,f)}else p=nt._fromJSON(e,f);u!==r&&(l=p),r=u;break}}catch{}const c=s.filter(u=>u._shouldAllowMigration);return!r._shouldAllowMigration||!c.length?new ci(r,e,i):(r=c[0],l&&await r._set(o,l.toJSON()),await Promise.all(t.map(async u=>{if(u!==r)try{await u._remove(o)}catch{}})),new ci(r,e,i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lh(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(dh(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(ch(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(ph(e))return"Blackberry";if(gh(e))return"Webos";if(uh(e))return"Safari";if((e.includes("chrome/")||hh(e))&&!e.includes("edge/"))return"Chrome";if(fh(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,i=n.match(t);if((i==null?void 0:i.length)===2)return i[1]}return"Other"}function ch(n=Le()){return/firefox\//i.test(n)}function uh(n=Le()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function hh(n=Le()){return/crios\//i.test(n)}function dh(n=Le()){return/iemobile/i.test(n)}function fh(n=Le()){return/android/i.test(n)}function ph(n=Le()){return/blackberry/i.test(n)}function gh(n=Le()){return/webos/i.test(n)}function Ua(n=Le()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function Nv(n=Le()){var e;return Ua(n)&&!!((e=window.navigator)!=null&&e.standalone)}function xv(){return z_()&&document.documentMode===10}function mh(n=Le()){return Ua(n)||fh(n)||gh(n)||ph(n)||/windows phone/i.test(n)||dh(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _h(n,e=[]){let t;switch(n){case"Browser":t=lh(Le());break;case"Worker":t=`${lh(Le())}-${n}`;break;default:t=n}const i=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${xn}/${i}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dv{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const i=r=>new Promise((o,l)=>{try{const c=e(r);o(c)}catch(c){l(c)}});i.onAbort=t,this.queue.push(i);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const i of this.queue)await i(e),i.onAbort&&t.push(i.onAbort)}catch(i){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:i==null?void 0:i.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ov(n,e={}){return ai(n,"GET","/v2/passwordPolicy",br(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vv=6;class Lv{constructor(e){var i;const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??Vv,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((i=e.allowedNonAlphanumericCharacters)==null?void 0:i.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const i=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;i&&(t.meetsMinPasswordLength=e.length>=i),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let i;for(let s=0;s<e.length;s++)i=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,i>="a"&&i<="z",i>="A"&&i<="Z",i>="0"&&i<="9",this.allowedNonAlphanumericCharacters.includes(i))}updatePasswordCharacterOptionsStatuses(e,t,i,s,r){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=i)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mv{constructor(e,t,i,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=i,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new yh(this),this.idTokenSubscription=new yh(this),this.beforeStateQueue=new Dv(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Yu,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(r=>this._resolvePersistenceManagerAvailable=r)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=Pt(t)),this._initializationPromise=this.queue(async()=>{var i,s,r;if(!this._deleted&&(this.persistenceManager=await ci.create(this,e),(i=this._resolvePersistenceManagerAvailable)==null||i.call(this),!this._deleted)){if((s=this._popupRedirectResolver)!=null&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((r=this.currentUser)==null?void 0:r.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Ar(this,{idToken:e}),i=await nt._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(i)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var r;if(Ze(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(l=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(l,l))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let i=t,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(r=this.redirectUser)==null?void 0:r._redirectEventId,l=i==null?void 0:i._redirectEventId,c=await this.tryRedirectSignIn(e);(!o||o===l)&&(c!=null&&c.user)&&(i=c.user,s=!0)}if(!i)return this.directlySetCurrentUser(null);if(!i._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(i)}catch(o){i=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return i?this.reloadAndSetCurrentUserOrClear(i):this.directlySetCurrentUser(null)}return z(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===i._redirectEventId?this.directlySetCurrentUser(i):this.reloadAndSetCurrentUserOrClear(i)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await Sr(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=yv()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Ze(this.app))return Promise.reject(Wt(this));const t=e?Ae(e):null;return t&&z(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&z(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Ze(this.app)?Promise.reject(Wt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Ze(this.app)?Promise.reject(Wt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Pt(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Ov(this),t=new Lv(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new $i("auth","Firebase",e())}onAuthStateChanged(e,t,i){return this.registerStateListener(this.authStateSubscription,e,t,i)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,i){return this.registerStateListener(this.idTokenSubscription,e,t,i)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const i=this.onAuthStateChanged(()=>{i(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),i={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(i.tenantId=this.tenantId),await kv(this,i)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,t){const i=await this.getOrInitRedirectPersistenceManager(t);return e===null?i.removeCurrentUser():i.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&Pt(e)||this._popupRedirectResolver;z(t,this,"argument-error"),this.redirectPersistenceManager=await ci.create(this,[Pt(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,i;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)==null?void 0:t._redirectEventId)===e?this._currentUser:((i=this.redirectUser)==null?void 0:i._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((t=this.currentUser)==null?void 0:t.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,i,s){if(this._deleted)return()=>{};const r=typeof t=="function"?t:t.next.bind(t);let o=!1;const l=this._isInitialized?Promise.resolve():this._initializationPromise;if(z(l,this,"internal-error"),l.then(()=>{o||r(this.currentUser)}),typeof t=="function"){const c=e.addObserver(t,i,s);return()=>{o=!0,c()}}else{const c=e.addObserver(t);return()=>{o=!0,c()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return z(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=_h(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var s;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await((s=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:s.getHeartbeatsHeader());t&&(e["X-Firebase-Client"]=t);const i=await this._getAppCheckToken();return i&&(e["X-Firebase-AppCheck"]=i),e}async _getAppCheckToken(){var t;if(Ze(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((t=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:t.getToken());return e!=null&&e.error&&gv(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function Pr(n){return Ae(n)}class yh{constructor(e){this.auth=e,this.observer=null,this.addObserver=ey(t=>this.observer=t)}get next(){return z(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ba={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Fv(n){Ba=n}function Uv(n){return Ba.loadJS(n)}function Bv(){return Ba.gapiScript}function qv(n){return`__${n}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hv(n,e){const t=wr(n,"auth");if(t.isInitialized()){const s=t.getImmediate(),r=t.getOptions();if(Bt(r,e??{}))return s;At(s,"already-initialized")}return t.initialize({options:e})}function zv(n,e){const t=(e==null?void 0:e.persistence)||[],i=(Array.isArray(t)?t:[t]).map(Pt);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(i,e==null?void 0:e.popupRedirectResolver)}function Wv(n,e,t){const i=Pr(n);z(/^https?:\/\//.test(e),i,"invalid-emulator-scheme");const s=!1,r=vh(e),{host:o,port:l}=jv(e),c=l===null?"":`:${l}`,u={url:`${r}//${o}${c}/`},f=Object.freeze({host:o,port:l,protocol:r.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!i._canInitEmulator){z(i.config.emulator&&i.emulatorConfig,i,"emulator-config-failed"),z(Bt(u,i.config.emulator)&&Bt(f,i.emulatorConfig),i,"emulator-config-failed");return}i.config.emulator=u,i.emulatorConfig=f,i.settings.appVerificationDisabledForTesting=!0,Pn(o)?wa(`${r}//${o}${c}`):$v()}function vh(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function jv(n){const e=vh(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const i=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(i);if(s){const r=s[1];return{host:r,port:Eh(i.substr(r.length+1))}}else{const[r,o]=i.split(":");return{host:r,port:Eh(o)}}}function Eh(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function $v(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wh{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return St("not implemented")}_getIdTokenResponse(e){return St("not implemented")}_linkToIdToken(e,t){return St("not implemented")}_getReauthenticationResolver(e){return St("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ui(n,e){return th(n,"POST","/v1/accounts:signInWithIdp",br(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gv="http://localhost";class Dn extends wh{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new Dn(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):At("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:i,signInMethod:s,...r}=t;if(!i||!s)return null;const o=new Dn(i,s);return o.idToken=r.idToken||void 0,o.accessToken=r.accessToken||void 0,o.secret=r.secret,o.nonce=r.nonce,o.pendingToken=r.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return ui(e,t)}_linkToIdToken(e,t){const i=this.buildRequest();return i.idToken=t,ui(e,i)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,ui(e,t)}buildRequest(){const e={requestUri:Gv,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=oi(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Th{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ji extends Th{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $t extends Ji{constructor(){super("facebook.com")}static credential(e){return Dn._fromParams({providerId:$t.PROVIDER_ID,signInMethod:$t.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return $t.credentialFromTaggedObject(e)}static credentialFromError(e){return $t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return $t.credential(e.oauthAccessToken)}catch{return null}}}$t.FACEBOOK_SIGN_IN_METHOD="facebook.com",$t.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gt extends Ji{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return Dn._fromParams({providerId:Gt.PROVIDER_ID,signInMethod:Gt.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return Gt.credentialFromTaggedObject(e)}static credentialFromError(e){return Gt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:i}=e;if(!t&&!i)return null;try{return Gt.credential(t,i)}catch{return null}}}Gt.GOOGLE_SIGN_IN_METHOD="google.com",Gt.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kt extends Ji{constructor(){super("github.com")}static credential(e){return Dn._fromParams({providerId:Kt.PROVIDER_ID,signInMethod:Kt.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Kt.credentialFromTaggedObject(e)}static credentialFromError(e){return Kt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Kt.credential(e.oauthAccessToken)}catch{return null}}}Kt.GITHUB_SIGN_IN_METHOD="github.com",Kt.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qt extends Ji{constructor(){super("twitter.com")}static credential(e,t){return Dn._fromParams({providerId:Qt.PROVIDER_ID,signInMethod:Qt.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return Qt.credentialFromTaggedObject(e)}static credentialFromError(e){return Qt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:i}=e;if(!t||!i)return null;try{return Qt.credential(t,i)}catch{return null}}}Qt.TWITTER_SIGN_IN_METHOD="twitter.com",Qt.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Kv(n,e){return th(n,"POST","/v1/accounts:signUp",br(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yt{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,i,s=!1){const r=await nt._fromIdTokenResponse(e,i,s),o=Ih(i);return new Yt({user:r,providerId:o,_tokenResponse:i,operationType:t})}static async _forOperation(e,t,i){await e._updateTokensIfNecessary(i,!0);const s=Ih(i);return new Yt({user:e,providerId:s,_tokenResponse:i,operationType:t})}}function Ih(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Qv(n){var s;if(Ze(n.app))return Promise.reject(Wt(n));const e=Pr(n);if(await e._initializationPromise,(s=e.currentUser)!=null&&s.isAnonymous)return new Yt({user:e.currentUser,providerId:null,operationType:"signIn"});const t=await Kv(e,{returnSecureToken:!0}),i=await Yt._fromIdTokenResponse(e,"signIn",t,!0);return await e._updateCurrentUser(i.user),i}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kr extends It{constructor(e,t,i,s){super(t.code,t.message),this.operationType=i,this.user=s,Object.setPrototypeOf(this,kr.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:i}}static _fromErrorAndOperation(e,t,i,s){return new kr(e,t,i,s)}}function bh(n,e,t,i){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(r=>{throw r.code==="auth/multi-factor-auth-required"?kr._fromErrorAndOperation(n,r,e,i):r})}async function Yv(n,e,t=!1){const i=await Xi(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return Yt._forOperation(n,"link",i)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Xv(n,e,t=!1){const{auth:i}=n;if(Ze(i.app))return Promise.reject(Wt(i));const s="reauthenticate";try{const r=await Xi(n,bh(i,s,e,n),t);z(r.idToken,i,"internal-error");const o=Ma(r.idToken);z(o,i,"internal-error");const{sub:l}=o;return z(n.uid===l,i,"user-mismatch"),Yt._forOperation(n,s,r)}catch(r){throw(r==null?void 0:r.code)==="auth/user-not-found"&&At(i,"user-mismatch"),r}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Jv(n,e,t=!1){if(Ze(n.app))return Promise.reject(Wt(n));const i="signIn",s=await bh(n,i,e),r=await Yt._fromIdTokenResponse(n,i,s);return t||await n._updateCurrentUser(r.user),r}function Zv(n,e,t,i){return Ae(n).onIdTokenChanged(e,t,i)}function eE(n,e,t){return Ae(n).beforeAuthStateChanged(e,t)}function tE(n,e,t,i){return Ae(n).onAuthStateChanged(e,t,i)}const Nr="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ch{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Nr,"1"),this.storage.removeItem(Nr),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nE=1e3,iE=10;class Ah extends Ch{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=mh(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const i=this.storage.getItem(t),s=this.localCache[t];i!==s&&e(t,s,i)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,l,c)=>{this.notifyListeners(o,c)});return}const i=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const o=this.storage.getItem(i);!t&&this.localCache[i]===o||this.notifyListeners(i,o)},r=this.storage.getItem(i);xv()&&r!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,iE):s()}notifyListeners(e,t){this.localCache[e]=t;const i=this.listeners[e];if(i)for(const s of Array.from(i))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,i)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:i}),!0)})},nE)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}Ah.type="LOCAL";const sE=Ah;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sh extends Ch{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}Sh.type="SESSION";const Rh=Sh;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rE(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xr{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const i=new xr(e);return this.receivers.push(i),i}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:i,eventType:s,data:r}=t.data,o=this.handlersMap[s];if(!(o!=null&&o.size))return;t.ports[0].postMessage({status:"ack",eventId:i,eventType:s});const l=Array.from(o).map(async u=>u(t.origin,r)),c=await rE(l);t.ports[0].postMessage({status:"done",eventId:i,eventType:s,response:c})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}xr.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qa(n="",e=10){let t="";for(let i=0;i<e;i++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oE{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,i=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let r,o;return new Promise((l,c)=>{const u=qa("",20);s.port1.start();const f=setTimeout(()=>{c(new Error("unsupported_event"))},i);o={messageChannel:s,onMessage(p){const m=p;if(m.data.eventId===u)switch(m.data.status){case"ack":clearTimeout(f),r=setTimeout(()=>{c(new Error("timeout"))},3e3);break;case"done":clearTimeout(r),l(m.data.response);break;default:clearTimeout(f),clearTimeout(r),c(new Error("invalid_response"));break}}},this.handlers.add(o),s.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:u,data:t},[s.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ht(){return window}function aE(n){ht().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ph(){return typeof ht().WorkerGlobalScope<"u"&&typeof ht().importScripts=="function"}async function lE(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function cE(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)==null?void 0:n.controller)||null}function uE(){return Ph()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kh="firebaseLocalStorageDb",hE=1,Dr="firebaseLocalStorage",Nh="fbase_key";class Zi{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function Or(n,e){return n.transaction([Dr],e?"readwrite":"readonly").objectStore(Dr)}function dE(){const n=indexedDB.deleteDatabase(kh);return new Zi(n).toPromise()}function Ha(){const n=indexedDB.open(kh,hE);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const i=n.result;try{i.createObjectStore(Dr,{keyPath:Nh})}catch(s){t(s)}}),n.addEventListener("success",async()=>{const i=n.result;i.objectStoreNames.contains(Dr)?e(i):(i.close(),await dE(),e(await Ha()))})})}async function xh(n,e,t){const i=Or(n,!0).put({[Nh]:e,value:t});return new Zi(i).toPromise()}async function fE(n,e){const t=Or(n,!1).get(e),i=await new Zi(t).toPromise();return i===void 0?null:i.value}function Dh(n,e){const t=Or(n,!0).delete(e);return new Zi(t).toPromise()}const pE=800,gE=3;class Oh{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Ha(),this.db)}async _withRetries(e){let t=0;for(;;)try{const i=await this._openDb();return await e(i)}catch(i){if(t++>gE)throw i;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return Ph()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=xr._getInstance(uE()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var t,i;if(this.activeServiceWorker=await lE(),!this.activeServiceWorker)return;this.sender=new oE(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(t=e[0])!=null&&t.fulfilled&&(i=e[0])!=null&&i.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||cE()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await Ha();return await xh(e,Nr,"1"),await Dh(e,Nr),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(i=>xh(i,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(i=>fE(i,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Dh(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const r=Or(s,!1).getAll();return new Zi(r).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],i=new Set;if(e.length!==0)for(const{fbase_key:s,value:r}of e)i.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(r)&&(this.notifyListeners(s,r),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!i.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}notifyListeners(e,t){this.localCache[e]=t;const i=this.listeners[e];if(i)for(const s of Array.from(i))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),pE)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}Oh.type="LOCAL";const mE=Oh;new Qi(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _E(n,e){return e?Pt(e):(z(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class za extends wh{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return ui(e,this._buildIdpRequest())}_linkToIdToken(e,t){return ui(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return ui(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function yE(n){return Jv(n.auth,new za(n),n.bypassAuthState)}function vE(n){const{auth:e,user:t}=n;return z(t,e,"internal-error"),Xv(t,new za(n),n.bypassAuthState)}async function EE(n){const{auth:e,user:t}=n;return z(t,e,"internal-error"),Yv(t,new za(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vh{constructor(e,t,i,s,r=!1){this.auth=e,this.resolver=i,this.user=s,this.bypassAuthState=r,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(i){this.reject(i)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:i,postBody:s,tenantId:r,error:o,type:l}=e;if(o){this.reject(o);return}const c={auth:this.auth,requestUri:t,sessionId:i,tenantId:r||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(l)(c))}catch(u){this.reject(u)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return yE;case"linkViaPopup":case"linkViaRedirect":return EE;case"reauthViaPopup":case"reauthViaRedirect":return vE;default:At(this.auth,"internal-error")}}resolve(e){Rt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Rt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wE=new Qi(2e3,1e4);class hi extends Vh{constructor(e,t,i,s,r){super(e,t,s,r),this.provider=i,this.authWindow=null,this.pollId=null,hi.currentPopupAction&&hi.currentPopupAction.cancel(),hi.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return z(e,this.auth,"internal-error"),e}async onExecution(){Rt(this.filter.length===1,"Popup operations only handle one event");const e=qa();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(ut(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(ut(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,hi.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,i;if((i=(t=this.authWindow)==null?void 0:t.window)!=null&&i.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(ut(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,wE.get())};e()}}hi.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const TE="pendingRedirect",Vr=new Map;class IE extends Vh{constructor(e,t,i=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,i),this.eventId=null}async execute(){let e=Vr.get(this.auth._key());if(!e){try{const i=await bE(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(i)}catch(t){e=()=>Promise.reject(t)}Vr.set(this.auth._key(),e)}return this.bypassAuthState||Vr.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function bE(n,e){const t=SE(e),i=AE(n);if(!await i._isAvailable())return!1;const s=await i._get(t)==="true";return await i._remove(t),s}function CE(n,e){Vr.set(n._key(),e)}function AE(n){return Pt(n._redirectPersistence)}function SE(n){return Rr(TE,n.config.apiKey,n.name)}async function RE(n,e,t=!1){if(Ze(n.app))return Promise.reject(Wt(n));const i=Pr(n),s=_E(i,e),o=await new IE(i,s,t).execute();return o&&!t&&(delete o.user._redirectEventId,await i._persistUserIfCurrent(o.user),await i._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const PE=10*60*1e3;class kE{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(i=>{this.isEventForConsumer(e,i)&&(t=!0,this.sendToConsumer(e,i),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!NE(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var i;if(e.error&&!Mh(e)){const s=((i=e.error.code)==null?void 0:i.split("auth/")[1])||"internal-error";t.onError(ut(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const i=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&i}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=PE&&this.cachedEventUids.clear(),this.cachedEventUids.has(Lh(e))}saveEventToCache(e){this.cachedEventUids.add(Lh(e)),this.lastProcessedEventTime=Date.now()}}function Lh(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function Mh({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function NE(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Mh(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function xE(n,e={}){return ai(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const DE=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,OE=/^https?/;async function VE(n){if(n.config.emulator)return;const{authorizedDomains:e}=await xE(n);for(const t of e)try{if(LE(t))return}catch{}At(n,"unauthorized-domain")}function LE(n){const e=Oa(),{protocol:t,hostname:i}=new URL(e);if(n.startsWith("chrome-extension://")){const o=new URL(n);return o.hostname===""&&i===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===i}if(!OE.test(t))return!1;if(DE.test(n))return i===n;const s=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(i)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ME=new Qi(3e4,6e4);function Fh(){const n=ht().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function FE(n){return new Promise((e,t)=>{var s,r,o;function i(){Fh(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Fh(),t(ut(n,"network-request-failed"))},timeout:ME.get()})}if((r=(s=ht().gapi)==null?void 0:s.iframes)!=null&&r.Iframe)e(gapi.iframes.getContext());else if((o=ht().gapi)!=null&&o.load)i();else{const l=qv("iframefcb");return ht()[l]=()=>{gapi.load?i():t(ut(n,"network-request-failed"))},Uv(`${Bv()}?onload=${l}`).catch(c=>t(c))}}).catch(e=>{throw Lr=null,e})}let Lr=null;function UE(n){return Lr=Lr||FE(n),Lr}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const BE=new Qi(5e3,15e3),qE="__/auth/iframe",HE="emulator/auth/iframe",zE={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},WE=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function jE(n){const e=n.config;z(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Va(e,HE):`https://${n.config.authDomain}/${qE}`,i={apiKey:e.apiKey,appName:n.name,v:xn},s=WE.get(n.config.apiHost);s&&(i.eid=s);const r=n._getFrameworks();return r.length&&(i.fw=r.join(",")),`${t}?${oi(i).slice(1)}`}async function $E(n){const e=await UE(n),t=ht().gapi;return z(t,n,"internal-error"),e.open({where:document.body,url:jE(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:zE,dontclear:!0},i=>new Promise(async(s,r)=>{await i.restyle({setHideOnLeave:!1});const o=ut(n,"network-request-failed"),l=ht().setTimeout(()=>{r(o)},BE.get());function c(){ht().clearTimeout(l),s(i)}i.ping(c).then(c,()=>{r(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const GE={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},KE=500,QE=600,YE="_blank",XE="http://localhost";class Uh{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function JE(n,e,t,i=KE,s=QE){const r=Math.max((window.screen.availHeight-s)/2,0).toString(),o=Math.max((window.screen.availWidth-i)/2,0).toString();let l="";const c={...GE,width:i.toString(),height:s.toString(),top:r,left:o},u=Le().toLowerCase();t&&(l=hh(u)?YE:t),ch(u)&&(e=e||XE,c.scrollbars="yes");const f=Object.entries(c).reduce((m,[b,S])=>`${m}${b}=${S},`,"");if(Nv(u)&&l!=="_self")return ZE(e||"",l),new Uh(null);const p=window.open(e||"",l,f);z(p,n,"popup-blocked");try{p.focus()}catch{}return new Uh(p)}function ZE(n,e){const t=document.createElement("a");t.href=n,t.target=e;const i=document.createEvent("MouseEvent");i.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(i)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ew="__/auth/handler",tw="emulator/auth/handler",nw=encodeURIComponent("fac");async function Bh(n,e,t,i,s,r){z(n.config.authDomain,n,"auth-domain-config-required"),z(n.config.apiKey,n,"invalid-api-key");const o={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:i,v:xn,eventId:s};if(e instanceof Th){e.setDefaultLanguage(n.languageCode),o.providerId=e.providerId||"",ya(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,p]of Object.entries({}))o[f]=p}if(e instanceof Ji){const f=e.getScopes().filter(p=>p!=="");f.length>0&&(o.scopes=f.join(","))}n.tenantId&&(o.tid=n.tenantId);const l=o;for(const f of Object.keys(l))l[f]===void 0&&delete l[f];const c=await n._getAppCheckToken(),u=c?`#${nw}=${encodeURIComponent(c)}`:"";return`${iw(n)}?${oi(l).slice(1)}${u}`}function iw({config:n}){return n.emulator?Va(n,tw):`https://${n.authDomain}/${ew}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wa="webStorageSupport";class sw{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Rh,this._completeRedirectFn=RE,this._overrideRedirectResult=CE}async _openPopup(e,t,i,s){var o;Rt((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const r=await Bh(e,t,i,Oa(),s);return JE(e,r,qa())}async _openRedirect(e,t,i,s){await this._originValidation(e);const r=await Bh(e,t,i,Oa(),s);return aE(r),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:r}=this.eventManagers[t];return s?Promise.resolve(s):(Rt(r,"If manager is not set, promise should be"),r)}const i=this.initAndGetManager(e);return this.eventManagers[t]={promise:i},i.catch(()=>{delete this.eventManagers[t]}),i}async initAndGetManager(e){const t=await $E(e),i=new kE(e);return t.register("authEvent",s=>(z(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:i.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:i},this.iframes[e._key()]=t,i}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Wa,{type:Wa},s=>{var o;const r=(o=s==null?void 0:s[0])==null?void 0:o[Wa];r!==void 0&&t(!!r),At(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=VE(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return mh()||uh()||Ua()}}const rw=sw;var qh="@firebase/auth",Hh="1.12.2";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ow{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(i=>{e((i==null?void 0:i.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){z(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function aw(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function lw(n){Nn(new qt("auth",(e,{options:t})=>{const i=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),r=e.getProvider("app-check-internal"),{apiKey:o,authDomain:l}=i.options;z(o&&!o.includes(":"),"invalid-api-key",{appName:i.name});const c={apiKey:o,authDomain:l,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:_h(n)},u=new Mv(i,s,r,c);return zv(u,t),u},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,i)=>{e.getProvider("auth-internal").initialize()})),Nn(new qt("auth-internal",e=>{const t=Pr(e.getProvider("auth").getImmediate());return(i=>new ow(i))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),ct(qh,Hh,aw(n)),ct(qh,Hh,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cw=5*60,uw=Nu("authIdTokenMaxAge")||cw;let zh=null;const hw=n=>async e=>{const t=e&&await e.getIdTokenResult(),i=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(i&&i>uw)return;const s=t==null?void 0:t.token;zh!==s&&(zh=s,await fetch(n,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function dw(n=Na()){const e=wr(n,"auth");if(e.isInitialized())return e.getImmediate();const t=Hv(n,{popupRedirectResolver:rw,persistence:[mE,sE,Rh]}),i=Nu("authTokenSyncURL");if(i&&typeof isSecureContext=="boolean"&&isSecureContext){const r=new URL(i,location.origin);if(location.origin===r.origin){const o=hw(r.toString());eE(t,o,()=>o(t.currentUser)),Zv(t,l=>o(l))}}const s=Ru("auth");return s&&Wv(t,`http://${s}`),t}function fw(){var n;return((n=document.getElementsByTagName("head"))==null?void 0:n[0])??document}Fv({loadJS(n){return new Promise((e,t)=>{const i=document.createElement("script");i.setAttribute("src",n),i.onload=e,i.onerror=s=>{const r=ut("internal-error");r.customData=s,t(r)},i.type="text/javascript",i.charset="UTF-8",fw().appendChild(i)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="}),lw("Browser");var Wh=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Xt,jh;(function(){var n;/** @license

   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */function e(w,_){function E(){}E.prototype=_.prototype,w.F=_.prototype,w.prototype=new E,w.prototype.constructor=w,w.D=function(I,v,T){for(var y=Array(arguments.length-2),Ve=2;Ve<arguments.length;Ve++)y[Ve-2]=arguments[Ve];return _.prototype[v].apply(I,y)}}function t(){this.blockSize=-1}function i(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(i,t),i.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(w,_,E){E||(E=0);const I=Array(16);if(typeof _=="string")for(var v=0;v<16;++v)I[v]=_.charCodeAt(E++)|_.charCodeAt(E++)<<8|_.charCodeAt(E++)<<16|_.charCodeAt(E++)<<24;else for(v=0;v<16;++v)I[v]=_[E++]|_[E++]<<8|_[E++]<<16|_[E++]<<24;_=w.g[0],E=w.g[1],v=w.g[2];let T=w.g[3],y;y=_+(T^E&(v^T))+I[0]+3614090360&4294967295,_=E+(y<<7&4294967295|y>>>25),y=T+(v^_&(E^v))+I[1]+3905402710&4294967295,T=_+(y<<12&4294967295|y>>>20),y=v+(E^T&(_^E))+I[2]+606105819&4294967295,v=T+(y<<17&4294967295|y>>>15),y=E+(_^v&(T^_))+I[3]+3250441966&4294967295,E=v+(y<<22&4294967295|y>>>10),y=_+(T^E&(v^T))+I[4]+4118548399&4294967295,_=E+(y<<7&4294967295|y>>>25),y=T+(v^_&(E^v))+I[5]+1200080426&4294967295,T=_+(y<<12&4294967295|y>>>20),y=v+(E^T&(_^E))+I[6]+2821735955&4294967295,v=T+(y<<17&4294967295|y>>>15),y=E+(_^v&(T^_))+I[7]+4249261313&4294967295,E=v+(y<<22&4294967295|y>>>10),y=_+(T^E&(v^T))+I[8]+1770035416&4294967295,_=E+(y<<7&4294967295|y>>>25),y=T+(v^_&(E^v))+I[9]+2336552879&4294967295,T=_+(y<<12&4294967295|y>>>20),y=v+(E^T&(_^E))+I[10]+4294925233&4294967295,v=T+(y<<17&4294967295|y>>>15),y=E+(_^v&(T^_))+I[11]+2304563134&4294967295,E=v+(y<<22&4294967295|y>>>10),y=_+(T^E&(v^T))+I[12]+1804603682&4294967295,_=E+(y<<7&4294967295|y>>>25),y=T+(v^_&(E^v))+I[13]+4254626195&4294967295,T=_+(y<<12&4294967295|y>>>20),y=v+(E^T&(_^E))+I[14]+2792965006&4294967295,v=T+(y<<17&4294967295|y>>>15),y=E+(_^v&(T^_))+I[15]+1236535329&4294967295,E=v+(y<<22&4294967295|y>>>10),y=_+(v^T&(E^v))+I[1]+4129170786&4294967295,_=E+(y<<5&4294967295|y>>>27),y=T+(E^v&(_^E))+I[6]+3225465664&4294967295,T=_+(y<<9&4294967295|y>>>23),y=v+(_^E&(T^_))+I[11]+643717713&4294967295,v=T+(y<<14&4294967295|y>>>18),y=E+(T^_&(v^T))+I[0]+3921069994&4294967295,E=v+(y<<20&4294967295|y>>>12),y=_+(v^T&(E^v))+I[5]+3593408605&4294967295,_=E+(y<<5&4294967295|y>>>27),y=T+(E^v&(_^E))+I[10]+38016083&4294967295,T=_+(y<<9&4294967295|y>>>23),y=v+(_^E&(T^_))+I[15]+3634488961&4294967295,v=T+(y<<14&4294967295|y>>>18),y=E+(T^_&(v^T))+I[4]+3889429448&4294967295,E=v+(y<<20&4294967295|y>>>12),y=_+(v^T&(E^v))+I[9]+568446438&4294967295,_=E+(y<<5&4294967295|y>>>27),y=T+(E^v&(_^E))+I[14]+3275163606&4294967295,T=_+(y<<9&4294967295|y>>>23),y=v+(_^E&(T^_))+I[3]+4107603335&4294967295,v=T+(y<<14&4294967295|y>>>18),y=E+(T^_&(v^T))+I[8]+1163531501&4294967295,E=v+(y<<20&4294967295|y>>>12),y=_+(v^T&(E^v))+I[13]+2850285829&4294967295,_=E+(y<<5&4294967295|y>>>27),y=T+(E^v&(_^E))+I[2]+4243563512&4294967295,T=_+(y<<9&4294967295|y>>>23),y=v+(_^E&(T^_))+I[7]+1735328473&4294967295,v=T+(y<<14&4294967295|y>>>18),y=E+(T^_&(v^T))+I[12]+2368359562&4294967295,E=v+(y<<20&4294967295|y>>>12),y=_+(E^v^T)+I[5]+4294588738&4294967295,_=E+(y<<4&4294967295|y>>>28),y=T+(_^E^v)+I[8]+2272392833&4294967295,T=_+(y<<11&4294967295|y>>>21),y=v+(T^_^E)+I[11]+1839030562&4294967295,v=T+(y<<16&4294967295|y>>>16),y=E+(v^T^_)+I[14]+4259657740&4294967295,E=v+(y<<23&4294967295|y>>>9),y=_+(E^v^T)+I[1]+2763975236&4294967295,_=E+(y<<4&4294967295|y>>>28),y=T+(_^E^v)+I[4]+1272893353&4294967295,T=_+(y<<11&4294967295|y>>>21),y=v+(T^_^E)+I[7]+4139469664&4294967295,v=T+(y<<16&4294967295|y>>>16),y=E+(v^T^_)+I[10]+3200236656&4294967295,E=v+(y<<23&4294967295|y>>>9),y=_+(E^v^T)+I[13]+681279174&4294967295,_=E+(y<<4&4294967295|y>>>28),y=T+(_^E^v)+I[0]+3936430074&4294967295,T=_+(y<<11&4294967295|y>>>21),y=v+(T^_^E)+I[3]+3572445317&4294967295,v=T+(y<<16&4294967295|y>>>16),y=E+(v^T^_)+I[6]+76029189&4294967295,E=v+(y<<23&4294967295|y>>>9),y=_+(E^v^T)+I[9]+3654602809&4294967295,_=E+(y<<4&4294967295|y>>>28),y=T+(_^E^v)+I[12]+3873151461&4294967295,T=_+(y<<11&4294967295|y>>>21),y=v+(T^_^E)+I[15]+530742520&4294967295,v=T+(y<<16&4294967295|y>>>16),y=E+(v^T^_)+I[2]+3299628645&4294967295,E=v+(y<<23&4294967295|y>>>9),y=_+(v^(E|~T))+I[0]+4096336452&4294967295,_=E+(y<<6&4294967295|y>>>26),y=T+(E^(_|~v))+I[7]+1126891415&4294967295,T=_+(y<<10&4294967295|y>>>22),y=v+(_^(T|~E))+I[14]+2878612391&4294967295,v=T+(y<<15&4294967295|y>>>17),y=E+(T^(v|~_))+I[5]+4237533241&4294967295,E=v+(y<<21&4294967295|y>>>11),y=_+(v^(E|~T))+I[12]+1700485571&4294967295,_=E+(y<<6&4294967295|y>>>26),y=T+(E^(_|~v))+I[3]+2399980690&4294967295,T=_+(y<<10&4294967295|y>>>22),y=v+(_^(T|~E))+I[10]+4293915773&4294967295,v=T+(y<<15&4294967295|y>>>17),y=E+(T^(v|~_))+I[1]+2240044497&4294967295,E=v+(y<<21&4294967295|y>>>11),y=_+(v^(E|~T))+I[8]+1873313359&4294967295,_=E+(y<<6&4294967295|y>>>26),y=T+(E^(_|~v))+I[15]+4264355552&4294967295,T=_+(y<<10&4294967295|y>>>22),y=v+(_^(T|~E))+I[6]+2734768916&4294967295,v=T+(y<<15&4294967295|y>>>17),y=E+(T^(v|~_))+I[13]+1309151649&4294967295,E=v+(y<<21&4294967295|y>>>11),y=_+(v^(E|~T))+I[4]+4149444226&4294967295,_=E+(y<<6&4294967295|y>>>26),y=T+(E^(_|~v))+I[11]+3174756917&4294967295,T=_+(y<<10&4294967295|y>>>22),y=v+(_^(T|~E))+I[2]+718787259&4294967295,v=T+(y<<15&4294967295|y>>>17),y=E+(T^(v|~_))+I[9]+3951481745&4294967295,w.g[0]=w.g[0]+_&4294967295,w.g[1]=w.g[1]+(v+(y<<21&4294967295|y>>>11))&4294967295,w.g[2]=w.g[2]+v&4294967295,w.g[3]=w.g[3]+T&4294967295}i.prototype.v=function(w,_){_===void 0&&(_=w.length);const E=_-this.blockSize,I=this.C;let v=this.h,T=0;for(;T<_;){if(v==0)for(;T<=E;)s(this,w,T),T+=this.blockSize;if(typeof w=="string"){for(;T<_;)if(I[v++]=w.charCodeAt(T++),v==this.blockSize){s(this,I),v=0;break}}else for(;T<_;)if(I[v++]=w[T++],v==this.blockSize){s(this,I),v=0;break}}this.h=v,this.o+=_},i.prototype.A=function(){var w=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);w[0]=128;for(var _=1;_<w.length-8;++_)w[_]=0;_=this.o*8;for(var E=w.length-8;E<w.length;++E)w[E]=_&255,_/=256;for(this.v(w),w=Array(16),_=0,E=0;E<4;++E)for(let I=0;I<32;I+=8)w[_++]=this.g[E]>>>I&255;return w};function r(w,_){var E=l;return Object.prototype.hasOwnProperty.call(E,w)?E[w]:E[w]=_(w)}function o(w,_){this.h=_;const E=[];let I=!0;for(let v=w.length-1;v>=0;v--){const T=w[v]|0;I&&T==_||(E[v]=T,I=!1)}this.g=E}var l={};function c(w){return-128<=w&&w<128?r(w,function(_){return new o([_|0],_<0?-1:0)}):new o([w|0],w<0?-1:0)}function u(w){if(isNaN(w)||!isFinite(w))return p;if(w<0)return P(u(-w));const _=[];let E=1;for(let I=0;w>=E;I++)_[I]=w/E|0,E*=4294967296;return new o(_,0)}function f(w,_){if(w.length==0)throw Error("number format error: empty string");if(_=_||10,_<2||36<_)throw Error("radix out of range: "+_);if(w.charAt(0)=="-")return P(f(w.substring(1),_));if(w.indexOf("-")>=0)throw Error('number format error: interior "-" character');const E=u(Math.pow(_,8));let I=p;for(let T=0;T<w.length;T+=8){var v=Math.min(8,w.length-T);const y=parseInt(w.substring(T,T+v),_);v<8?(v=u(Math.pow(_,v)),I=I.j(v).add(u(y))):(I=I.j(E),I=I.add(u(y)))}return I}var p=c(0),m=c(1),b=c(16777216);n=o.prototype,n.m=function(){if(N(this))return-P(this).m();let w=0,_=1;for(let E=0;E<this.g.length;E++){const I=this.i(E);w+=(I>=0?I:4294967296+I)*_,_*=4294967296}return w},n.toString=function(w){if(w=w||10,w<2||36<w)throw Error("radix out of range: "+w);if(S(this))return"0";if(N(this))return"-"+P(this).toString(w);const _=u(Math.pow(w,6));var E=this;let I="";for(;;){const v=W(E,_).g;E=D(E,v.j(_));let T=((E.g.length>0?E.g[0]:E.h)>>>0).toString(w);if(E=v,S(E))return T+I;for(;T.length<6;)T="0"+T;I=T+I}},n.i=function(w){return w<0?0:w<this.g.length?this.g[w]:this.h};function S(w){if(w.h!=0)return!1;for(let _=0;_<w.g.length;_++)if(w.g[_]!=0)return!1;return!0}function N(w){return w.h==-1}n.l=function(w){return w=D(this,w),N(w)?-1:S(w)?0:1};function P(w){const _=w.g.length,E=[];for(let I=0;I<_;I++)E[I]=~w.g[I];return new o(E,~w.h).add(m)}n.abs=function(){return N(this)?P(this):this},n.add=function(w){const _=Math.max(this.g.length,w.g.length),E=[];let I=0;for(let v=0;v<=_;v++){let T=I+(this.i(v)&65535)+(w.i(v)&65535),y=(T>>>16)+(this.i(v)>>>16)+(w.i(v)>>>16);I=y>>>16,T&=65535,y&=65535,E[v]=y<<16|T}return new o(E,E[E.length-1]&-2147483648?-1:0)};function D(w,_){return w.add(P(_))}n.j=function(w){if(S(this)||S(w))return p;if(N(this))return N(w)?P(this).j(P(w)):P(P(this).j(w));if(N(w))return P(this.j(P(w)));if(this.l(b)<0&&w.l(b)<0)return u(this.m()*w.m());const _=this.g.length+w.g.length,E=[];for(var I=0;I<2*_;I++)E[I]=0;for(I=0;I<this.g.length;I++)for(let v=0;v<w.g.length;v++){const T=this.i(I)>>>16,y=this.i(I)&65535,Ve=w.i(v)>>>16,We=w.i(v)&65535;E[2*I+2*v]+=y*We,V(E,2*I+2*v),E[2*I+2*v+1]+=T*We,V(E,2*I+2*v+1),E[2*I+2*v+1]+=y*Ve,V(E,2*I+2*v+1),E[2*I+2*v+2]+=T*Ve,V(E,2*I+2*v+2)}for(w=0;w<_;w++)E[w]=E[2*w+1]<<16|E[2*w];for(w=_;w<2*_;w++)E[w]=0;return new o(E,0)};function V(w,_){for(;(w[_]&65535)!=w[_];)w[_+1]+=w[_]>>>16,w[_]&=65535,_++}function U(w,_){this.g=w,this.h=_}function W(w,_){if(S(_))throw Error("division by zero");if(S(w))return new U(p,p);if(N(w))return _=W(P(w),_),new U(P(_.g),P(_.h));if(N(_))return _=W(w,P(_)),new U(P(_.g),_.h);if(w.g.length>30){if(N(w)||N(_))throw Error("slowDivide_ only works with positive integers.");for(var E=m,I=_;I.l(w)<=0;)E=te(E),I=te(I);var v=G(E,1),T=G(I,1);for(I=G(I,2),E=G(E,2);!S(I);){var y=T.add(I);y.l(w)<=0&&(v=v.add(E),T=y),I=G(I,1),E=G(E,1)}return _=D(w,v.j(_)),new U(v,_)}for(v=p;w.l(_)>=0;){for(E=Math.max(1,Math.floor(w.m()/_.m())),I=Math.ceil(Math.log(E)/Math.LN2),I=I<=48?1:Math.pow(2,I-48),T=u(E),y=T.j(_);N(y)||y.l(w)>0;)E-=I,T=u(E),y=T.j(_);S(T)&&(T=m),v=v.add(T),w=D(w,y)}return new U(v,w)}n.B=function(w){return W(this,w).h},n.and=function(w){const _=Math.max(this.g.length,w.g.length),E=[];for(let I=0;I<_;I++)E[I]=this.i(I)&w.i(I);return new o(E,this.h&w.h)},n.or=function(w){const _=Math.max(this.g.length,w.g.length),E=[];for(let I=0;I<_;I++)E[I]=this.i(I)|w.i(I);return new o(E,this.h|w.h)},n.xor=function(w){const _=Math.max(this.g.length,w.g.length),E=[];for(let I=0;I<_;I++)E[I]=this.i(I)^w.i(I);return new o(E,this.h^w.h)};function te(w){const _=w.g.length+1,E=[];for(let I=0;I<_;I++)E[I]=w.i(I)<<1|w.i(I-1)>>>31;return new o(E,w.h)}function G(w,_){const E=_>>5;_%=32;const I=w.g.length-E,v=[];for(let T=0;T<I;T++)v[T]=_>0?w.i(T+E)>>>_|w.i(T+E+1)<<32-_:w.i(T+E);return new o(v,w.h)}i.prototype.digest=i.prototype.A,i.prototype.reset=i.prototype.u,i.prototype.update=i.prototype.v,jh=i,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.B,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=u,o.fromString=f,Xt=o}).apply(typeof Wh<"u"?Wh:typeof self<"u"?self:typeof window<"u"?window:{});var Mr=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var $h,es,Gh,Fr,ja,Kh,Qh,Yh;(function(){var n,e=Object.defineProperty;function t(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof Mr=="object"&&Mr];for(var h=0;h<a.length;++h){var d=a[h];if(d&&d.Math==Math)return d}throw Error("Cannot find global object")}var i=t(this);function s(a,h){if(h)e:{var d=i;a=a.split(".");for(var g=0;g<a.length-1;g++){var C=a[g];if(!(C in d))break e;d=d[C]}a=a[a.length-1],g=d[a],h=h(g),h!=g&&h!=null&&e(d,a,{configurable:!0,writable:!0,value:h})}}s("Symbol.dispose",function(a){return a||Symbol("Symbol.dispose")}),s("Array.prototype.values",function(a){return a||function(){return this[Symbol.iterator]()}}),s("Object.entries",function(a){return a||function(h){var d=[],g;for(g in h)Object.prototype.hasOwnProperty.call(h,g)&&d.push([g,h[g]]);return d}});/** @license

   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */var r=r||{},o=this||self;function l(a){var h=typeof a;return h=="object"&&a!=null||h=="function"}function c(a,h,d){return a.call.apply(a.bind,arguments)}function u(a,h,d){return u=c,u.apply(null,arguments)}function f(a,h){var d=Array.prototype.slice.call(arguments,1);return function(){var g=d.slice();return g.push.apply(g,arguments),a.apply(this,g)}}function p(a,h){function d(){}d.prototype=h.prototype,a.Z=h.prototype,a.prototype=new d,a.prototype.constructor=a,a.Ob=function(g,C,A){for(var O=Array(arguments.length-2),K=2;K<arguments.length;K++)O[K-2]=arguments[K];return h.prototype[C].apply(g,O)}}var m=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?a=>a&&AsyncContext.Snapshot.wrap(a):a=>a;function b(a){const h=a.length;if(h>0){const d=Array(h);for(let g=0;g<h;g++)d[g]=a[g];return d}return[]}function S(a,h){for(let g=1;g<arguments.length;g++){const C=arguments[g];var d=typeof C;if(d=d!="object"?d:C?Array.isArray(C)?"array":d:"null",d=="array"||d=="object"&&typeof C.length=="number"){d=a.length||0;const A=C.length||0;a.length=d+A;for(let O=0;O<A;O++)a[d+O]=C[O]}else a.push(C)}}class N{constructor(h,d){this.i=h,this.j=d,this.h=0,this.g=null}get(){let h;return this.h>0?(this.h--,h=this.g,this.g=h.next,h.next=null):h=this.i(),h}}function P(a){o.setTimeout(()=>{throw a},0)}function D(){var a=w;let h=null;return a.g&&(h=a.g,a.g=a.g.next,a.g||(a.h=null),h.next=null),h}class V{constructor(){this.h=this.g=null}add(h,d){const g=U.get();g.set(h,d),this.h?this.h.next=g:this.g=g,this.h=g}}var U=new N(()=>new W,a=>a.reset());class W{constructor(){this.next=this.g=this.h=null}set(h,d){this.h=h,this.g=d,this.next=null}reset(){this.next=this.g=this.h=null}}let te,G=!1,w=new V,_=()=>{const a=Promise.resolve(void 0);te=()=>{a.then(E)}};function E(){for(var a;a=D();){try{a.h.call(a.g)}catch(d){P(d)}var h=U;h.j(a),h.h<100&&(h.h++,a.next=h.g,h.g=a)}G=!1}function I(){this.u=this.u,this.C=this.C}I.prototype.u=!1,I.prototype.dispose=function(){this.u||(this.u=!0,this.N())},I.prototype[Symbol.dispose]=function(){this.dispose()},I.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function v(a,h){this.type=a,this.g=this.target=h,this.defaultPrevented=!1}v.prototype.h=function(){this.defaultPrevented=!0};var T=function(){if(!o.addEventListener||!Object.defineProperty)return!1;var a=!1,h=Object.defineProperty({},"passive",{get:function(){a=!0}});try{const d=()=>{};o.addEventListener("test",d,h),o.removeEventListener("test",d,h)}catch{}return a}();function y(a){return/^[\s\xa0]*$/.test(a)}function Ve(a,h){v.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a&&this.init(a,h)}p(Ve,v),Ve.prototype.init=function(a,h){const d=this.type=a.type,g=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;this.target=a.target||a.srcElement,this.g=h,h=a.relatedTarget,h||(d=="mouseover"?h=a.fromElement:d=="mouseout"&&(h=a.toElement)),this.relatedTarget=h,g?(this.clientX=g.clientX!==void 0?g.clientX:g.pageX,this.clientY=g.clientY!==void 0?g.clientY:g.pageY,this.screenX=g.screenX||0,this.screenY=g.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=a.pointerType,this.state=a.state,this.i=a,a.defaultPrevented&&Ve.Z.h.call(this)},Ve.prototype.h=function(){Ve.Z.h.call(this);const a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var We="closure_listenable_"+(Math.random()*1e6|0),wR=0;function TR(a,h,d,g,C){this.listener=a,this.proxy=null,this.src=h,this.type=d,this.capture=!!g,this.ha=C,this.key=++wR,this.da=this.fa=!1}function Jo(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function Zo(a,h,d){for(const g in a)h.call(d,a[g],g,a)}function IR(a,h){for(const d in a)h.call(void 0,a[d],d,a)}function Pm(a){const h={};for(const d in a)h[d]=a[d];return h}const km="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Nm(a,h){let d,g;for(let C=1;C<arguments.length;C++){g=arguments[C];for(d in g)a[d]=g[d];for(let A=0;A<km.length;A++)d=km[A],Object.prototype.hasOwnProperty.call(g,d)&&(a[d]=g[d])}}function ea(a){this.src=a,this.g={},this.h=0}ea.prototype.add=function(a,h,d,g,C){const A=a.toString();a=this.g[A],a||(a=this.g[A]=[],this.h++);const O=Kc(a,h,g,C);return O>-1?(h=a[O],d||(h.fa=!1)):(h=new TR(h,this.src,A,!!g,C),h.fa=d,a.push(h)),h};function Gc(a,h){const d=h.type;if(d in a.g){var g=a.g[d],C=Array.prototype.indexOf.call(g,h,void 0),A;(A=C>=0)&&Array.prototype.splice.call(g,C,1),A&&(Jo(h),a.g[d].length==0&&(delete a.g[d],a.h--))}}function Kc(a,h,d,g){for(let C=0;C<a.length;++C){const A=a[C];if(!A.da&&A.listener==h&&A.capture==!!d&&A.ha==g)return C}return-1}var Qc="closure_lm_"+(Math.random()*1e6|0),Yc={};function xm(a,h,d,g,C){if(Array.isArray(h)){for(let A=0;A<h.length;A++)xm(a,h[A],d,g,C);return null}return d=Vm(d),a&&a[We]?a.J(h,d,l(g)?!!g.capture:!1,C):bR(a,h,d,!1,g,C)}function bR(a,h,d,g,C,A){if(!h)throw Error("Invalid event type");const O=l(C)?!!C.capture:!!C;let K=Jc(a);if(K||(a[Qc]=K=new ea(a)),d=K.add(h,d,g,O,A),d.proxy)return d;if(g=CR(),d.proxy=g,g.src=a,g.listener=d,a.addEventListener)T||(C=O),C===void 0&&(C=!1),a.addEventListener(h.toString(),g,C);else if(a.attachEvent)a.attachEvent(Om(h.toString()),g);else if(a.addListener&&a.removeListener)a.addListener(g);else throw Error("addEventListener and attachEvent are unavailable.");return d}function CR(){function a(d){return h.call(a.src,a.listener,d)}const h=AR;return a}function Dm(a,h,d,g,C){if(Array.isArray(h))for(var A=0;A<h.length;A++)Dm(a,h[A],d,g,C);else g=l(g)?!!g.capture:!!g,d=Vm(d),a&&a[We]?(a=a.i,A=String(h).toString(),A in a.g&&(h=a.g[A],d=Kc(h,d,g,C),d>-1&&(Jo(h[d]),Array.prototype.splice.call(h,d,1),h.length==0&&(delete a.g[A],a.h--)))):a&&(a=Jc(a))&&(h=a.g[h.toString()],a=-1,h&&(a=Kc(h,d,g,C)),(d=a>-1?h[a]:null)&&Xc(d))}function Xc(a){if(typeof a!="number"&&a&&!a.da){var h=a.src;if(h&&h[We])Gc(h.i,a);else{var d=a.type,g=a.proxy;h.removeEventListener?h.removeEventListener(d,g,a.capture):h.detachEvent?h.detachEvent(Om(d),g):h.addListener&&h.removeListener&&h.removeListener(g),(d=Jc(h))?(Gc(d,a),d.h==0&&(d.src=null,h[Qc]=null)):Jo(a)}}}function Om(a){return a in Yc?Yc[a]:Yc[a]="on"+a}function AR(a,h){if(a.da)a=!0;else{h=new Ve(h,this);const d=a.listener,g=a.ha||a.src;a.fa&&Xc(a),a=d.call(g,h)}return a}function Jc(a){return a=a[Qc],a instanceof ea?a:null}var Zc="__closure_events_fn_"+(Math.random()*1e9>>>0);function Vm(a){return typeof a=="function"?a:(a[Zc]||(a[Zc]=function(h){return a.handleEvent(h)}),a[Zc])}function qe(){I.call(this),this.i=new ea(this),this.M=this,this.G=null}p(qe,I),qe.prototype[We]=!0,qe.prototype.removeEventListener=function(a,h,d,g){Dm(this,a,h,d,g)};function je(a,h){var d,g=a.G;if(g)for(d=[];g;g=g.G)d.push(g);if(a=a.M,g=h.type||h,typeof h=="string")h=new v(h,a);else if(h instanceof v)h.target=h.target||a;else{var C=h;h=new v(g,a),Nm(h,C)}C=!0;let A,O;if(d)for(O=d.length-1;O>=0;O--)A=h.g=d[O],C=ta(A,g,!0,h)&&C;if(A=h.g=a,C=ta(A,g,!0,h)&&C,C=ta(A,g,!1,h)&&C,d)for(O=0;O<d.length;O++)A=h.g=d[O],C=ta(A,g,!1,h)&&C}qe.prototype.N=function(){if(qe.Z.N.call(this),this.i){var a=this.i;for(const h in a.g){const d=a.g[h];for(let g=0;g<d.length;g++)Jo(d[g]);delete a.g[h],a.h--}}this.G=null},qe.prototype.J=function(a,h,d,g){return this.i.add(String(a),h,!1,d,g)},qe.prototype.K=function(a,h,d,g){return this.i.add(String(a),h,!0,d,g)};function ta(a,h,d,g){if(h=a.i.g[String(h)],!h)return!0;h=h.concat();let C=!0;for(let A=0;A<h.length;++A){const O=h[A];if(O&&!O.da&&O.capture==d){const K=O.listener,Ce=O.ha||O.src;O.fa&&Gc(a.i,O),C=K.call(Ce,g)!==!1&&C}}return C&&!g.defaultPrevented}function SR(a,h){if(typeof a!="function")if(a&&typeof a.handleEvent=="function")a=u(a.handleEvent,a);else throw Error("Invalid listener argument");return Number(h)>2147483647?-1:o.setTimeout(a,h||0)}function Lm(a){a.g=SR(()=>{a.g=null,a.i&&(a.i=!1,Lm(a))},a.l);const h=a.h;a.h=null,a.m.apply(null,h)}class RR extends I{constructor(h,d){super(),this.m=h,this.l=d,this.h=null,this.i=!1,this.g=null}j(h){this.h=arguments,this.g?this.i=!0:Lm(this)}N(){super.N(),this.g&&(o.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Ys(a){I.call(this),this.h=a,this.g={}}p(Ys,I);var Mm=[];function Fm(a){Zo(a.g,function(h,d){this.g.hasOwnProperty(d)&&Xc(h)},a),a.g={}}Ys.prototype.N=function(){Ys.Z.N.call(this),Fm(this)},Ys.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var eu=o.JSON.stringify,PR=o.JSON.parse,kR=class{stringify(a){return o.JSON.stringify(a,void 0)}parse(a){return o.JSON.parse(a,void 0)}};function Um(){}function Bm(){}var Xs={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function tu(){v.call(this,"d")}p(tu,v);function nu(){v.call(this,"c")}p(nu,v);var Zn={},qm=null;function na(){return qm=qm||new qe}Zn.Ia="serverreachability";function Hm(a){v.call(this,Zn.Ia,a)}p(Hm,v);function Js(a){const h=na();je(h,new Hm(h))}Zn.STAT_EVENT="statevent";function zm(a,h){v.call(this,Zn.STAT_EVENT,a),this.stat=h}p(zm,v);function $e(a){const h=na();je(h,new zm(h,a))}Zn.Ja="timingevent";function Wm(a,h){v.call(this,Zn.Ja,a),this.size=h}p(Wm,v);function Zs(a,h){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return o.setTimeout(function(){a()},h)}function er(){this.g=!0}er.prototype.ua=function(){this.g=!1};function NR(a,h,d,g,C,A){a.info(function(){if(a.g)if(A){var O="",K=A.split("&");for(let oe=0;oe<K.length;oe++){var Ce=K[oe].split("=");if(Ce.length>1){const Ne=Ce[0];Ce=Ce[1];const Tt=Ne.split("_");O=Tt.length>=2&&Tt[1]=="type"?O+(Ne+"="+Ce+"&"):O+(Ne+"=redacted&")}}}else O=null;else O=A;return"XMLHTTP REQ ("+g+") [attempt "+C+"]: "+h+`
`+d+`
`+O})}function xR(a,h,d,g,C,A,O){a.info(function(){return"XMLHTTP RESP ("+g+") [ attempt "+C+"]: "+h+`
`+d+`
`+A+" "+O})}function qi(a,h,d,g){a.info(function(){return"XMLHTTP TEXT ("+h+"): "+OR(a,d)+(g?" "+g:"")})}function DR(a,h){a.info(function(){return"TIMEOUT: "+h})}er.prototype.info=function(){};function OR(a,h){if(!a.g)return h;if(!h)return null;try{const A=JSON.parse(h);if(A){for(a=0;a<A.length;a++)if(Array.isArray(A[a])){var d=A[a];if(!(d.length<2)){var g=d[1];if(Array.isArray(g)&&!(g.length<1)){var C=g[0];if(C!="noop"&&C!="stop"&&C!="close")for(let O=1;O<g.length;O++)g[O]=""}}}}return eu(A)}catch{return h}}var ia={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},jm={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},$m;function iu(){}p(iu,Um),iu.prototype.g=function(){return new XMLHttpRequest},$m=new iu;function tr(a){return encodeURIComponent(String(a))}function VR(a){var h=1;a=a.split(":");const d=[];for(;h>0&&a.length;)d.push(a.shift()),h--;return a.length&&d.push(a.join(":")),d}function En(a,h,d,g){this.j=a,this.i=h,this.l=d,this.S=g||1,this.V=new Ys(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new Gm}function Gm(){this.i=null,this.g="",this.h=!1}var Km={},su={};function ru(a,h,d){a.M=1,a.A=ra(wt(h)),a.u=d,a.R=!0,Qm(a,null)}function Qm(a,h){a.F=Date.now(),sa(a),a.B=wt(a.A);var d=a.B,g=a.S;Array.isArray(g)||(g=[String(g)]),l_(d.i,"t",g),a.C=0,d=a.j.L,a.h=new Gm,a.g=A_(a.j,d?h:null,!a.u),a.P>0&&(a.O=new RR(u(a.Y,a,a.g),a.P)),h=a.V,d=a.g,g=a.ba;var C="readystatechange";Array.isArray(C)||(C&&(Mm[0]=C.toString()),C=Mm);for(let A=0;A<C.length;A++){const O=xm(d,C[A],g||h.handleEvent,!1,h.h||h);if(!O)break;h.g[O.key]=O}h=a.J?Pm(a.J):{},a.u?(a.v||(a.v="POST"),h["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.B,a.v,a.u,h)):(a.v="GET",a.g.ea(a.B,a.v,null,h)),Js(),NR(a.i,a.v,a.B,a.l,a.S,a.u)}En.prototype.ba=function(a){a=a.target;const h=this.O;h&&In(a)==3?h.j():this.Y(a)},En.prototype.Y=function(a){try{if(a==this.g)e:{const K=In(this.g),Ce=this.g.ya(),oe=this.g.ca();if(!(K<3)&&(K!=3||this.g&&(this.h.h||this.g.la()||g_(this.g)))){this.K||K!=4||Ce==7||(Ce==8||oe<=0?Js(3):Js(2)),ou(this);var h=this.g.ca();this.X=h;var d=LR(this);if(this.o=h==200,xR(this.i,this.v,this.B,this.l,this.S,K,h),this.o){if(this.U&&!this.L){t:{if(this.g){var g,C=this.g;if((g=C.g?C.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!y(g)){var A=g;break t}}A=null}if(a=A)qi(this.i,this.l,a,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,au(this,a);else{this.o=!1,this.m=3,$e(12),ei(this),nr(this);break e}}if(this.R){a=!0;let Ne;for(;!this.K&&this.C<d.length;)if(Ne=MR(this,d),Ne==su){K==4&&(this.m=4,$e(14),a=!1),qi(this.i,this.l,null,"[Incomplete Response]");break}else if(Ne==Km){this.m=4,$e(15),qi(this.i,this.l,d,"[Invalid Chunk]"),a=!1;break}else qi(this.i,this.l,Ne,null),au(this,Ne);if(Ym(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),K!=4||d.length!=0||this.h.h||(this.m=1,$e(16),a=!1),this.o=this.o&&a,!a)qi(this.i,this.l,d,"[Invalid Chunked Response]"),ei(this),nr(this);else if(d.length>0&&!this.W){this.W=!0;var O=this.j;O.g==this&&O.aa&&!O.P&&(O.j.info("Great, no buffering proxy detected. Bytes received: "+d.length),gu(O),O.P=!0,$e(11))}}else qi(this.i,this.l,d,null),au(this,d);K==4&&ei(this),this.o&&!this.K&&(K==4?T_(this.j,this):(this.o=!1,sa(this)))}else XR(this.g),h==400&&d.indexOf("Unknown SID")>0?(this.m=3,$e(12)):(this.m=0,$e(13)),ei(this),nr(this)}}}catch{}finally{}};function LR(a){if(!Ym(a))return a.g.la();const h=g_(a.g);if(h==="")return"";let d="";const g=h.length,C=In(a.g)==4;if(!a.h.i){if(typeof TextDecoder>"u")return ei(a),nr(a),"";a.h.i=new o.TextDecoder}for(let A=0;A<g;A++)a.h.h=!0,d+=a.h.i.decode(h[A],{stream:!(C&&A==g-1)});return h.length=0,a.h.g+=d,a.C=0,a.h.g}function Ym(a){return a.g?a.v=="GET"&&a.M!=2&&a.j.Aa:!1}function MR(a,h){var d=a.C,g=h.indexOf(`
`,d);return g==-1?su:(d=Number(h.substring(d,g)),isNaN(d)?Km:(g+=1,g+d>h.length?su:(h=h.slice(g,g+d),a.C=g+d,h)))}En.prototype.cancel=function(){this.K=!0,ei(this)};function sa(a){a.T=Date.now()+a.H,Xm(a,a.H)}function Xm(a,h){if(a.D!=null)throw Error("WatchDog timer not null");a.D=Zs(u(a.aa,a),h)}function ou(a){a.D&&(o.clearTimeout(a.D),a.D=null)}En.prototype.aa=function(){this.D=null;const a=Date.now();a-this.T>=0?(DR(this.i,this.B),this.M!=2&&(Js(),$e(17)),ei(this),this.m=2,nr(this)):Xm(this,this.T-a)};function nr(a){a.j.I==0||a.K||T_(a.j,a)}function ei(a){ou(a);var h=a.O;h&&typeof h.dispose=="function"&&h.dispose(),a.O=null,Fm(a.V),a.g&&(h=a.g,a.g=null,h.abort(),h.dispose())}function au(a,h){try{var d=a.j;if(d.I!=0&&(d.g==a||lu(d.h,a))){if(!a.L&&lu(d.h,a)&&d.I==3){try{var g=d.Ba.g.parse(h)}catch{g=null}if(Array.isArray(g)&&g.length==3){var C=g;if(C[0]==0){e:if(!d.v){if(d.g)if(d.g.F+3e3<a.F)ua(d),la(d);else break e;pu(d),$e(18)}}else d.xa=C[1],0<d.xa-d.K&&C[2]<37500&&d.F&&d.A==0&&!d.C&&(d.C=Zs(u(d.Va,d),6e3));e_(d.h)<=1&&d.ta&&(d.ta=void 0)}else ni(d,11)}else if((a.L||d.g==a)&&ua(d),!y(h))for(C=d.Ba.g.parse(h),h=0;h<C.length;h++){let oe=C[h];const Ne=oe[0];if(!(Ne<=d.K))if(d.K=Ne,oe=oe[1],d.I==2)if(oe[0]=="c"){d.M=oe[1],d.ba=oe[2];const Tt=oe[3];Tt!=null&&(d.ka=Tt,d.j.info("VER="+d.ka));const ii=oe[4];ii!=null&&(d.za=ii,d.j.info("SVER="+d.za));const bn=oe[5];bn!=null&&typeof bn=="number"&&bn>0&&(g=1.5*bn,d.O=g,d.j.info("backChannelRequestTimeoutMs_="+g)),g=d;const Cn=a.g;if(Cn){const da=Cn.g?Cn.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(da){var A=g.h;A.g||da.indexOf("spdy")==-1&&da.indexOf("quic")==-1&&da.indexOf("h2")==-1||(A.j=A.l,A.g=new Set,A.h&&(cu(A,A.h),A.h=null))}if(g.G){const mu=Cn.g?Cn.g.getResponseHeader("X-HTTP-Session-Id"):null;mu&&(g.wa=mu,he(g.J,g.G,mu))}}d.I=3,d.l&&d.l.ra(),d.aa&&(d.T=Date.now()-a.F,d.j.info("Handshake RTT: "+d.T+"ms")),g=d;var O=a;if(g.na=C_(g,g.L?g.ba:null,g.W),O.L){t_(g.h,O);var K=O,Ce=g.O;Ce&&(K.H=Ce),K.D&&(ou(K),sa(K)),g.g=O}else E_(g);d.i.length>0&&ca(d)}else oe[0]!="stop"&&oe[0]!="close"||ni(d,7);else d.I==3&&(oe[0]=="stop"||oe[0]=="close"?oe[0]=="stop"?ni(d,7):fu(d):oe[0]!="noop"&&d.l&&d.l.qa(oe),d.A=0)}}Js(4)}catch{}}var FR=class{constructor(a,h){this.g=a,this.map=h}};function Jm(a){this.l=a||10,o.PerformanceNavigationTiming?(a=o.performance.getEntriesByType("navigation"),a=a.length>0&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(o.chrome&&o.chrome.loadTimes&&o.chrome.loadTimes()&&o.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function Zm(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function e_(a){return a.h?1:a.g?a.g.size:0}function lu(a,h){return a.h?a.h==h:a.g?a.g.has(h):!1}function cu(a,h){a.g?a.g.add(h):a.h=h}function t_(a,h){a.h&&a.h==h?a.h=null:a.g&&a.g.has(h)&&a.g.delete(h)}Jm.prototype.cancel=function(){if(this.i=n_(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const a of this.g.values())a.cancel();this.g.clear()}};function n_(a){if(a.h!=null)return a.i.concat(a.h.G);if(a.g!=null&&a.g.size!==0){let h=a.i;for(const d of a.g.values())h=h.concat(d.G);return h}return b(a.i)}var i_=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function UR(a,h){if(a){a=a.split("&");for(let d=0;d<a.length;d++){const g=a[d].indexOf("=");let C,A=null;g>=0?(C=a[d].substring(0,g),A=a[d].substring(g+1)):C=a[d],h(C,A?decodeURIComponent(A.replace(/\+/g," ")):"")}}}function wn(a){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let h;a instanceof wn?(this.l=a.l,ir(this,a.j),this.o=a.o,this.g=a.g,sr(this,a.u),this.h=a.h,uu(this,c_(a.i)),this.m=a.m):a&&(h=String(a).match(i_))?(this.l=!1,ir(this,h[1]||"",!0),this.o=rr(h[2]||""),this.g=rr(h[3]||"",!0),sr(this,h[4]),this.h=rr(h[5]||"",!0),uu(this,h[6]||"",!0),this.m=rr(h[7]||"")):(this.l=!1,this.i=new ar(null,this.l))}wn.prototype.toString=function(){const a=[];var h=this.j;h&&a.push(or(h,s_,!0),":");var d=this.g;return(d||h=="file")&&(a.push("//"),(h=this.o)&&a.push(or(h,s_,!0),"@"),a.push(tr(d).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),d=this.u,d!=null&&a.push(":",String(d))),(d=this.h)&&(this.g&&d.charAt(0)!="/"&&a.push("/"),a.push(or(d,d.charAt(0)=="/"?HR:qR,!0))),(d=this.i.toString())&&a.push("?",d),(d=this.m)&&a.push("#",or(d,WR)),a.join("")},wn.prototype.resolve=function(a){const h=wt(this);let d=!!a.j;d?ir(h,a.j):d=!!a.o,d?h.o=a.o:d=!!a.g,d?h.g=a.g:d=a.u!=null;var g=a.h;if(d)sr(h,a.u);else if(d=!!a.h){if(g.charAt(0)!="/")if(this.g&&!this.h)g="/"+g;else{var C=h.h.lastIndexOf("/");C!=-1&&(g=h.h.slice(0,C+1)+g)}if(C=g,C==".."||C==".")g="";else if(C.indexOf("./")!=-1||C.indexOf("/.")!=-1){g=C.lastIndexOf("/",0)==0,C=C.split("/");const A=[];for(let O=0;O<C.length;){const K=C[O++];K=="."?g&&O==C.length&&A.push(""):K==".."?((A.length>1||A.length==1&&A[0]!="")&&A.pop(),g&&O==C.length&&A.push("")):(A.push(K),g=!0)}g=A.join("/")}else g=C}return d?h.h=g:d=a.i.toString()!=="",d?uu(h,c_(a.i)):d=!!a.m,d&&(h.m=a.m),h};function wt(a){return new wn(a)}function ir(a,h,d){a.j=d?rr(h,!0):h,a.j&&(a.j=a.j.replace(/:$/,""))}function sr(a,h){if(h){if(h=Number(h),isNaN(h)||h<0)throw Error("Bad port number "+h);a.u=h}else a.u=null}function uu(a,h,d){h instanceof ar?(a.i=h,jR(a.i,a.l)):(d||(h=or(h,zR)),a.i=new ar(h,a.l))}function he(a,h,d){a.i.set(h,d)}function ra(a){return he(a,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),a}function rr(a,h){return a?h?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function or(a,h,d){return typeof a=="string"?(a=encodeURI(a).replace(h,BR),d&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function BR(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var s_=/[#\/\?@]/g,qR=/[#\?:]/g,HR=/[#\?]/g,zR=/[#\?@]/g,WR=/#/g;function ar(a,h){this.h=this.g=null,this.i=a||null,this.j=!!h}function ti(a){a.g||(a.g=new Map,a.h=0,a.i&&UR(a.i,function(h,d){a.add(decodeURIComponent(h.replace(/\+/g," ")),d)}))}n=ar.prototype,n.add=function(a,h){ti(this),this.i=null,a=Hi(this,a);let d=this.g.get(a);return d||this.g.set(a,d=[]),d.push(h),this.h+=1,this};function r_(a,h){ti(a),h=Hi(a,h),a.g.has(h)&&(a.i=null,a.h-=a.g.get(h).length,a.g.delete(h))}function o_(a,h){return ti(a),h=Hi(a,h),a.g.has(h)}n.forEach=function(a,h){ti(this),this.g.forEach(function(d,g){d.forEach(function(C){a.call(h,C,g,this)},this)},this)};function a_(a,h){ti(a);let d=[];if(typeof h=="string")o_(a,h)&&(d=d.concat(a.g.get(Hi(a,h))));else for(a=Array.from(a.g.values()),h=0;h<a.length;h++)d=d.concat(a[h]);return d}n.set=function(a,h){return ti(this),this.i=null,a=Hi(this,a),o_(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[h]),this.h+=1,this},n.get=function(a,h){return a?(a=a_(this,a),a.length>0?String(a[0]):h):h};function l_(a,h,d){r_(a,h),d.length>0&&(a.i=null,a.g.set(Hi(a,h),b(d)),a.h+=d.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const a=[],h=Array.from(this.g.keys());for(let g=0;g<h.length;g++){var d=h[g];const C=tr(d);d=a_(this,d);for(let A=0;A<d.length;A++){let O=C;d[A]!==""&&(O+="="+tr(d[A])),a.push(O)}}return this.i=a.join("&")};function c_(a){const h=new ar;return h.i=a.i,a.g&&(h.g=new Map(a.g),h.h=a.h),h}function Hi(a,h){return h=String(h),a.j&&(h=h.toLowerCase()),h}function jR(a,h){h&&!a.j&&(ti(a),a.i=null,a.g.forEach(function(d,g){const C=g.toLowerCase();g!=C&&(r_(this,g),l_(this,C,d))},a)),a.j=h}function $R(a,h){const d=new er;if(o.Image){const g=new Image;g.onload=f(Tn,d,"TestLoadImage: loaded",!0,h,g),g.onerror=f(Tn,d,"TestLoadImage: error",!1,h,g),g.onabort=f(Tn,d,"TestLoadImage: abort",!1,h,g),g.ontimeout=f(Tn,d,"TestLoadImage: timeout",!1,h,g),o.setTimeout(function(){g.ontimeout&&g.ontimeout()},1e4),g.src=a}else h(!1)}function GR(a,h){const d=new er,g=new AbortController,C=setTimeout(()=>{g.abort(),Tn(d,"TestPingServer: timeout",!1,h)},1e4);fetch(a,{signal:g.signal}).then(A=>{clearTimeout(C),A.ok?Tn(d,"TestPingServer: ok",!0,h):Tn(d,"TestPingServer: server error",!1,h)}).catch(()=>{clearTimeout(C),Tn(d,"TestPingServer: error",!1,h)})}function Tn(a,h,d,g,C){try{C&&(C.onload=null,C.onerror=null,C.onabort=null,C.ontimeout=null),g(d)}catch{}}function KR(){this.g=new kR}function hu(a){this.i=a.Sb||null,this.h=a.ab||!1}p(hu,Um),hu.prototype.g=function(){return new oa(this.i,this.h)};function oa(a,h){qe.call(this),this.H=a,this.o=h,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}p(oa,qe),n=oa.prototype,n.open=function(a,h){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=a,this.D=h,this.readyState=1,cr(this)},n.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const h={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};a&&(h.body=a),(this.H||o).fetch(new Request(this.D,h)).then(this.Pa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,lr(this)),this.readyState=0},n.Pa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,cr(this)),this.g&&(this.readyState=3,cr(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof o.ReadableStream<"u"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;u_(this)}else a.text().then(this.Oa.bind(this),this.ga.bind(this))};function u_(a){a.j.read().then(a.Ma.bind(a)).catch(a.ga.bind(a))}n.Ma=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var h=a.value?a.value:new Uint8Array(0);(h=this.B.decode(h,{stream:!a.done}))&&(this.response=this.responseText+=h)}a.done?lr(this):cr(this),this.readyState==3&&u_(this)}},n.Oa=function(a){this.g&&(this.response=this.responseText=a,lr(this))},n.Na=function(a){this.g&&(this.response=a,lr(this))},n.ga=function(){this.g&&lr(this)};function lr(a){a.readyState=4,a.l=null,a.j=null,a.B=null,cr(a)}n.setRequestHeader=function(a,h){this.A.append(a,h)},n.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const a=[],h=this.h.entries();for(var d=h.next();!d.done;)d=d.value,a.push(d[0]+": "+d[1]),d=h.next();return a.join(`\r
`)};function cr(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(oa.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function h_(a){let h="";return Zo(a,function(d,g){h+=g,h+=":",h+=d,h+=`\r
`}),h}function du(a,h,d){e:{for(g in d){var g=!1;break e}g=!0}g||(d=h_(d),typeof a=="string"?d!=null&&tr(d):he(a,h,d))}function ge(a){qe.call(this),this.headers=new Map,this.L=a||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}p(ge,qe);var QR=/^https?$/i,YR=["POST","PUT"];n=ge.prototype,n.Fa=function(a){this.H=a},n.ea=function(a,h,d,g){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);h=h?h.toUpperCase():"GET",this.D=a,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():$m.g(),this.g.onreadystatechange=m(u(this.Ca,this));try{this.B=!0,this.g.open(h,String(a),!0),this.B=!1}catch(A){d_(this,A);return}if(a=d||"",d=new Map(this.headers),g)if(Object.getPrototypeOf(g)===Object.prototype)for(var C in g)d.set(C,g[C]);else if(typeof g.keys=="function"&&typeof g.get=="function")for(const A of g.keys())d.set(A,g.get(A));else throw Error("Unknown input type for opt_headers: "+String(g));g=Array.from(d.keys()).find(A=>A.toLowerCase()=="content-type"),C=o.FormData&&a instanceof o.FormData,!(Array.prototype.indexOf.call(YR,h,void 0)>=0)||g||C||d.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[A,O]of d)this.g.setRequestHeader(A,O);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(a),this.v=!1}catch(A){d_(this,A)}};function d_(a,h){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=h,a.o=5,f_(a),aa(a)}function f_(a){a.A||(a.A=!0,je(a,"complete"),je(a,"error"))}n.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=a||7,je(this,"complete"),je(this,"abort"),aa(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),aa(this,!0)),ge.Z.N.call(this)},n.Ca=function(){this.u||(this.B||this.v||this.j?p_(this):this.Xa())},n.Xa=function(){p_(this)};function p_(a){if(a.h&&typeof r<"u"){if(a.v&&In(a)==4)setTimeout(a.Ca.bind(a),0);else if(je(a,"readystatechange"),In(a)==4){a.h=!1;try{const A=a.ca();e:switch(A){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var h=!0;break e;default:h=!1}var d;if(!(d=h)){var g;if(g=A===0){let O=String(a.D).match(i_)[1]||null;!O&&o.self&&o.self.location&&(O=o.self.location.protocol.slice(0,-1)),g=!QR.test(O?O.toLowerCase():"")}d=g}if(d)je(a,"complete"),je(a,"success");else{a.o=6;try{var C=In(a)>2?a.g.statusText:""}catch{C=""}a.l=C+" ["+a.ca()+"]",f_(a)}}finally{aa(a)}}}}function aa(a,h){if(a.g){a.m&&(clearTimeout(a.m),a.m=null);const d=a.g;a.g=null,h||je(a,"ready");try{d.onreadystatechange=null}catch{}}}n.isActive=function(){return!!this.g};function In(a){return a.g?a.g.readyState:0}n.ca=function(){try{return In(this)>2?this.g.status:-1}catch{return-1}},n.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.La=function(a){if(this.g){var h=this.g.responseText;return a&&h.indexOf(a)==0&&(h=h.substring(a.length)),PR(h)}};function g_(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.F){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function XR(a){const h={};a=(a.g&&In(a)>=2&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let g=0;g<a.length;g++){if(y(a[g]))continue;var d=VR(a[g]);const C=d[0];if(d=d[1],typeof d!="string")continue;d=d.trim();const A=h[C]||[];h[C]=A,A.push(d)}IR(h,function(g){return g.join(", ")})}n.ya=function(){return this.o},n.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function ur(a,h,d){return d&&d.internalChannelParams&&d.internalChannelParams[a]||h}function m_(a){this.za=0,this.i=[],this.j=new er,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=ur("failFast",!1,a),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=ur("baseRetryDelayMs",5e3,a),this.Za=ur("retryDelaySeedMs",1e4,a),this.Ta=ur("forwardChannelMaxRetries",2,a),this.va=ur("forwardChannelRequestTimeoutMs",2e4,a),this.ma=a&&a.xmlHttpFactory||void 0,this.Ua=a&&a.Rb||void 0,this.Aa=a&&a.useFetchStreams||!1,this.O=void 0,this.L=a&&a.supportsCrossDomainXhr||!1,this.M="",this.h=new Jm(a&&a.concurrentRequestLimit),this.Ba=new KR,this.S=a&&a.fastHandshake||!1,this.R=a&&a.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=a&&a.Pb||!1,a&&a.ua&&this.j.ua(),a&&a.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&a&&a.detectBufferingProxy||!1,this.ia=void 0,a&&a.longPollingTimeout&&a.longPollingTimeout>0&&(this.ia=a.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}n=m_.prototype,n.ka=8,n.I=1,n.connect=function(a,h,d,g){$e(0),this.W=a,this.H=h||{},d&&g!==void 0&&(this.H.OSID=d,this.H.OAID=g),this.F=this.X,this.J=C_(this,null,this.W),ca(this)};function fu(a){if(__(a),a.I==3){var h=a.V++,d=wt(a.J);if(he(d,"SID",a.M),he(d,"RID",h),he(d,"TYPE","terminate"),hr(a,d),h=new En(a,a.j,h),h.M=2,h.A=ra(wt(d)),d=!1,o.navigator&&o.navigator.sendBeacon)try{d=o.navigator.sendBeacon(h.A.toString(),"")}catch{}!d&&o.Image&&(new Image().src=h.A,d=!0),d||(h.g=A_(h.j,null),h.g.ea(h.A)),h.F=Date.now(),sa(h)}b_(a)}function la(a){a.g&&(gu(a),a.g.cancel(),a.g=null)}function __(a){la(a),a.v&&(o.clearTimeout(a.v),a.v=null),ua(a),a.h.cancel(),a.m&&(typeof a.m=="number"&&o.clearTimeout(a.m),a.m=null)}function ca(a){if(!Zm(a.h)&&!a.m){a.m=!0;var h=a.Ea;te||_(),G||(te(),G=!0),w.add(h,a),a.D=0}}function JR(a,h){return e_(a.h)>=a.h.j-(a.m?1:0)?!1:a.m?(a.i=h.G.concat(a.i),!0):a.I==1||a.I==2||a.D>=(a.Sa?0:a.Ta)?!1:(a.m=Zs(u(a.Ea,a,h),I_(a,a.D)),a.D++,!0)}n.Ea=function(a){if(this.m)if(this.m=null,this.I==1){if(!a){this.V=Math.floor(Math.random()*1e5),a=this.V++;const C=new En(this,this.j,a);let A=this.o;if(this.U&&(A?(A=Pm(A),Nm(A,this.U)):A=this.U),this.u!==null||this.R||(C.J=A,A=null),this.S)e:{for(var h=0,d=0;d<this.i.length;d++){t:{var g=this.i[d];if("__data__"in g.map&&(g=g.map.__data__,typeof g=="string")){g=g.length;break t}g=void 0}if(g===void 0)break;if(h+=g,h>4096){h=d;break e}if(h===4096||d===this.i.length-1){h=d+1;break e}}h=1e3}else h=1e3;h=v_(this,C,h),d=wt(this.J),he(d,"RID",a),he(d,"CVER",22),this.G&&he(d,"X-HTTP-Session-Id",this.G),hr(this,d),A&&(this.R?h="headers="+tr(h_(A))+"&"+h:this.u&&du(d,this.u,A)),cu(this.h,C),this.Ra&&he(d,"TYPE","init"),this.S?(he(d,"$req",h),he(d,"SID","null"),C.U=!0,ru(C,d,null)):ru(C,d,h),this.I=2}}else this.I==3&&(a?y_(this,a):this.i.length==0||Zm(this.h)||y_(this))};function y_(a,h){var d;h?d=h.l:d=a.V++;const g=wt(a.J);he(g,"SID",a.M),he(g,"RID",d),he(g,"AID",a.K),hr(a,g),a.u&&a.o&&du(g,a.u,a.o),d=new En(a,a.j,d,a.D+1),a.u===null&&(d.J=a.o),h&&(a.i=h.G.concat(a.i)),h=v_(a,d,1e3),d.H=Math.round(a.va*.5)+Math.round(a.va*.5*Math.random()),cu(a.h,d),ru(d,g,h)}function hr(a,h){a.H&&Zo(a.H,function(d,g){he(h,g,d)}),a.l&&Zo({},function(d,g){he(h,g,d)})}function v_(a,h,d){d=Math.min(a.i.length,d);const g=a.l?u(a.l.Ka,a.l,a):null;e:{var C=a.i;let K=-1;for(;;){const Ce=["count="+d];K==-1?d>0?(K=C[0].g,Ce.push("ofs="+K)):K=0:Ce.push("ofs="+K);let oe=!0;for(let Ne=0;Ne<d;Ne++){var A=C[Ne].g;const Tt=C[Ne].map;if(A-=K,A<0)K=Math.max(0,C[Ne].g-100),oe=!1;else try{A="req"+A+"_"||"";try{var O=Tt instanceof Map?Tt:Object.entries(Tt);for(const[ii,bn]of O){let Cn=bn;l(bn)&&(Cn=eu(bn)),Ce.push(A+ii+"="+encodeURIComponent(Cn))}}catch(ii){throw Ce.push(A+"type="+encodeURIComponent("_badmap")),ii}}catch{g&&g(Tt)}}if(oe){O=Ce.join("&");break e}}O=void 0}return a=a.i.splice(0,d),h.G=a,O}function E_(a){if(!a.g&&!a.v){a.Y=1;var h=a.Da;te||_(),G||(te(),G=!0),w.add(h,a),a.A=0}}function pu(a){return a.g||a.v||a.A>=3?!1:(a.Y++,a.v=Zs(u(a.Da,a),I_(a,a.A)),a.A++,!0)}n.Da=function(){if(this.v=null,w_(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var a=4*this.T;this.j.info("BP detection timer enabled: "+a),this.B=Zs(u(this.Wa,this),a)}},n.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,$e(10),la(this),w_(this))};function gu(a){a.B!=null&&(o.clearTimeout(a.B),a.B=null)}function w_(a){a.g=new En(a,a.j,"rpc",a.Y),a.u===null&&(a.g.J=a.o),a.g.P=0;var h=wt(a.na);he(h,"RID","rpc"),he(h,"SID",a.M),he(h,"AID",a.K),he(h,"CI",a.F?"0":"1"),!a.F&&a.ia&&he(h,"TO",a.ia),he(h,"TYPE","xmlhttp"),hr(a,h),a.u&&a.o&&du(h,a.u,a.o),a.O&&(a.g.H=a.O);var d=a.g;a=a.ba,d.M=1,d.A=ra(wt(h)),d.u=null,d.R=!0,Qm(d,a)}n.Va=function(){this.C!=null&&(this.C=null,la(this),pu(this),$e(19))};function ua(a){a.C!=null&&(o.clearTimeout(a.C),a.C=null)}function T_(a,h){var d=null;if(a.g==h){ua(a),gu(a),a.g=null;var g=2}else if(lu(a.h,h))d=h.G,t_(a.h,h),g=1;else return;if(a.I!=0){if(h.o)if(g==1){d=h.u?h.u.length:0,h=Date.now()-h.F;var C=a.D;g=na(),je(g,new Wm(g,d)),ca(a)}else E_(a);else if(C=h.m,C==3||C==0&&h.X>0||!(g==1&&JR(a,h)||g==2&&pu(a)))switch(d&&d.length>0&&(h=a.h,h.i=h.i.concat(d)),C){case 1:ni(a,5);break;case 4:ni(a,10);break;case 3:ni(a,6);break;default:ni(a,2)}}}function I_(a,h){let d=a.Qa+Math.floor(Math.random()*a.Za);return a.isActive()||(d*=2),d*h}function ni(a,h){if(a.j.info("Error code "+h),h==2){var d=u(a.bb,a),g=a.Ua;const C=!g;g=new wn(g||"//www.google.com/images/cleardot.gif"),o.location&&o.location.protocol=="http"||ir(g,"https"),ra(g),C?$R(g.toString(),d):GR(g.toString(),d)}else $e(2);a.I=0,a.l&&a.l.pa(h),b_(a),__(a)}n.bb=function(a){a?(this.j.info("Successfully pinged google.com"),$e(2)):(this.j.info("Failed to ping google.com"),$e(1))};function b_(a){if(a.I=0,a.ja=[],a.l){const h=n_(a.h);(h.length!=0||a.i.length!=0)&&(S(a.ja,h),S(a.ja,a.i),a.h.i.length=0,b(a.i),a.i.length=0),a.l.oa()}}function C_(a,h,d){var g=d instanceof wn?wt(d):new wn(d);if(g.g!="")h&&(g.g=h+"."+g.g),sr(g,g.u);else{var C=o.location;g=C.protocol,h=h?h+"."+C.hostname:C.hostname,C=+C.port;const A=new wn(null);g&&ir(A,g),h&&(A.g=h),C&&sr(A,C),d&&(A.h=d),g=A}return d=a.G,h=a.wa,d&&h&&he(g,d,h),he(g,"VER",a.ka),hr(a,g),g}function A_(a,h,d){if(h&&!a.L)throw Error("Can't create secondary domain capable XhrIo object.");return h=a.Aa&&!a.ma?new ge(new hu({ab:d})):new ge(a.ma),h.Fa(a.L),h}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function S_(){}n=S_.prototype,n.ra=function(){},n.qa=function(){},n.pa=function(){},n.oa=function(){},n.isActive=function(){return!0},n.Ka=function(){};function ha(){}ha.prototype.g=function(a,h){return new Je(a,h)};function Je(a,h){qe.call(this),this.g=new m_(h),this.l=a,this.h=h&&h.messageUrlParams||null,a=h&&h.messageHeaders||null,h&&h.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=h&&h.initMessageHeaders||null,h&&h.messageContentType&&(a?a["X-WebChannel-Content-Type"]=h.messageContentType:a={"X-WebChannel-Content-Type":h.messageContentType}),h&&h.sa&&(a?a["X-WebChannel-Client-Profile"]=h.sa:a={"X-WebChannel-Client-Profile":h.sa}),this.g.U=a,(a=h&&h.Qb)&&!y(a)&&(this.g.u=a),this.A=h&&h.supportsCrossDomainXhr||!1,this.v=h&&h.sendRawJson||!1,(h=h&&h.httpSessionIdParam)&&!y(h)&&(this.g.G=h,a=this.h,a!==null&&h in a&&(a=this.h,h in a&&delete a[h])),this.j=new zi(this)}p(Je,qe),Je.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},Je.prototype.close=function(){fu(this.g)},Je.prototype.o=function(a){var h=this.g;if(typeof a=="string"){var d={};d.__data__=a,a=d}else this.v&&(d={},d.__data__=eu(a),a=d);h.i.push(new FR(h.Ya++,a)),h.I==3&&ca(h)},Je.prototype.N=function(){this.g.l=null,delete this.j,fu(this.g),delete this.g,Je.Z.N.call(this)};function R_(a){tu.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var h=a.__sm__;if(h){e:{for(const d in h){a=d;break e}a=void 0}(this.i=a)&&(a=this.i,h=h!==null&&a in h?h[a]:void 0),this.data=h}else this.data=a}p(R_,tu);function P_(){nu.call(this),this.status=1}p(P_,nu);function zi(a){this.g=a}p(zi,S_),zi.prototype.ra=function(){je(this.g,"a")},zi.prototype.qa=function(a){je(this.g,new R_(a))},zi.prototype.pa=function(a){je(this.g,new P_)},zi.prototype.oa=function(){je(this.g,"b")},ha.prototype.createWebChannel=ha.prototype.g,Je.prototype.send=Je.prototype.o,Je.prototype.open=Je.prototype.m,Je.prototype.close=Je.prototype.close,Yh=function(){return new ha},Qh=function(){return na()},Kh=Zn,ja={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},ia.NO_ERROR=0,ia.TIMEOUT=8,ia.HTTP_ERROR=6,Fr=ia,jm.COMPLETE="complete",Gh=jm,Bm.EventType=Xs,Xs.OPEN="a",Xs.CLOSE="b",Xs.ERROR="c",Xs.MESSAGE="d",qe.prototype.listen=qe.prototype.J,es=Bm,ge.prototype.listenOnce=ge.prototype.K,ge.prototype.getLastError=ge.prototype.Ha,ge.prototype.getLastErrorCode=ge.prototype.ya,ge.prototype.getStatus=ge.prototype.ca,ge.prototype.getResponseJson=ge.prototype.La,ge.prototype.getResponseText=ge.prototype.la,ge.prototype.send=ge.prototype.ea,ge.prototype.setWithCredentials=ge.prototype.Fa,$h=ge}).apply(typeof Mr<"u"?Mr:typeof self<"u"?self:typeof window<"u"?window:{});/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Me{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Me.UNAUTHENTICATED=new Me(null),Me.GOOGLE_CREDENTIALS=new Me("google-credentials-uid"),Me.FIRST_PARTY=new Me("first-party-uid"),Me.MOCK_USER=new Me("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let di="12.11.0";function pw(n){di=n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const On=new vr("@firebase/firestore");function fi(){return On.logLevel}function M(n,...e){if(On.logLevel<=Y.DEBUG){const t=e.map($a);On.debug(`Firestore (${di}): ${n}`,...t)}}function kt(n,...e){if(On.logLevel<=Y.ERROR){const t=e.map($a);On.error(`Firestore (${di}): ${n}`,...t)}}function Vn(n,...e){if(On.logLevel<=Y.WARN){const t=e.map($a);On.warn(`Firestore (${di}): ${n}`,...t)}}function $a(n){if(typeof n=="string")return n;try{return function(t){return JSON.stringify(t)}(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function q(n,e,t){let i="Unexpected state";typeof e=="string"?i=e:t=e,Xh(n,i,t)}function Xh(n,e,t){let i=`FIRESTORE (${di}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{i+=" CONTEXT: "+JSON.stringify(t)}catch{i+=" CONTEXT: "+t}throw kt(i),new Error(i)}function se(n,e,t,i){let s="Unexpected state";typeof t=="string"?s=t:i=t,n||Xh(e,s,i)}function $(n,e){return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const k={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class F extends It{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nt{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jh{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class gw{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(Me.UNAUTHENTICATED))}shutdown(){}}class mw{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class _w{constructor(e){this.t=e,this.currentUser=Me.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){se(this.o===void 0,42304);let i=this.i;const s=c=>this.i!==i?(i=this.i,t(c)):Promise.resolve();let r=new Nt;this.o=()=>{this.i++,this.currentUser=this.u(),r.resolve(),r=new Nt,e.enqueueRetryable(()=>s(this.currentUser))};const o=()=>{const c=r;e.enqueueRetryable(async()=>{await c.promise,await s(this.currentUser)})},l=c=>{M("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=c,this.o&&(this.auth.addAuthTokenListener(this.o),o())};this.t.onInit(c=>l(c)),setTimeout(()=>{if(!this.auth){const c=this.t.getImmediate({optional:!0});c?l(c):(M("FirebaseAuthCredentialsProvider","Auth not yet detected"),r.resolve(),r=new Nt)}},0),o()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(i=>this.i!==e?(M("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):i?(se(typeof i.accessToken=="string",31837,{l:i}),new Jh(i.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return se(e===null||typeof e=="string",2055,{h:e}),new Me(e)}}class yw{constructor(e,t,i){this.P=e,this.T=t,this.I=i,this.type="FirstParty",this.user=Me.FIRST_PARTY,this.R=new Map}A(){return this.I?this.I():null}get headers(){this.R.set("X-Goog-AuthUser",this.P);const e=this.A();return e&&this.R.set("Authorization",e),this.T&&this.R.set("X-Goog-Iam-Authorization-Token",this.T),this.R}}class vw{constructor(e,t,i){this.P=e,this.T=t,this.I=i}getToken(){return Promise.resolve(new yw(this.P,this.T,this.I))}start(e,t){e.enqueueRetryable(()=>t(Me.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Zh{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Ew{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Ze(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){se(this.o===void 0,3512);const i=r=>{r.error!=null&&M("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${r.error.message}`);const o=r.token!==this.m;return this.m=r.token,M("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?t(r.token):Promise.resolve()};this.o=r=>{e.enqueueRetryable(()=>i(r))};const s=r=>{M("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=r,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(r=>s(r)),setTimeout(()=>{if(!this.appCheck){const r=this.V.getImmediate({optional:!0});r?s(r):M("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new Zh(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(se(typeof t.token=="string",44558,{tokenResult:t}),this.m=t.token,new Zh(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ww(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let i=0;i<n;i++)t[i]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ga{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let i="";for(;i.length<20;){const s=ww(40);for(let r=0;r<s.length;++r)i.length<20&&s[r]<t&&(i+=e.charAt(s[r]%62))}return i}}function J(n,e){return n<e?-1:n>e?1:0}function Ka(n,e){const t=Math.min(n.length,e.length);for(let i=0;i<t;i++){const s=n.charAt(i),r=e.charAt(i);if(s!==r)return Qa(s)===Qa(r)?J(s,r):Qa(s)?1:-1}return J(n.length,e.length)}const Tw=55296,Iw=57343;function Qa(n){const e=n.charCodeAt(0);return e>=Tw&&e<=Iw}function pi(n,e,t){return n.length===e.length&&n.every((i,s)=>t(i,e[s]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ed="__name__";class dt{constructor(e,t,i){t===void 0?t=0:t>e.length&&q(637,{offset:t,range:e.length}),i===void 0?i=e.length-t:i>e.length-t&&q(1746,{length:i,range:e.length-t}),this.segments=e,this.offset=t,this.len=i}get length(){return this.len}isEqual(e){return dt.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof dt?e.forEach(i=>{t.push(i)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,i=this.limit();t<i;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const i=Math.min(e.length,t.length);for(let s=0;s<i;s++){const r=dt.compareSegments(e.get(s),t.get(s));if(r!==0)return r}return J(e.length,t.length)}static compareSegments(e,t){const i=dt.isNumericId(e),s=dt.isNumericId(t);return i&&!s?-1:!i&&s?1:i&&s?dt.extractNumericId(e).compare(dt.extractNumericId(t)):Ka(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return Xt.fromString(e.substring(4,e.length-2))}}class le extends dt{construct(e,t,i){return new le(e,t,i)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const i of e){if(i.indexOf("//")>=0)throw new F(k.INVALID_ARGUMENT,`Invalid segment (${i}). Paths must not contain // in them.`);t.push(...i.split("/").filter(s=>s.length>0))}return new le(t)}static emptyPath(){return new le([])}}const bw=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class De extends dt{construct(e,t,i){return new De(e,t,i)}static isValidIdentifier(e){return bw.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),De.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===ed}static keyField(){return new De([ed])}static fromServerFormat(e){const t=[];let i="",s=0;const r=()=>{if(i.length===0)throw new F(k.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(i),i=""};let o=!1;for(;s<e.length;){const l=e[s];if(l==="\\"){if(s+1===e.length)throw new F(k.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const c=e[s+1];if(c!=="\\"&&c!=="."&&c!=="`")throw new F(k.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);i+=c,s+=2}else l==="`"?(o=!o,s++):l!=="."||o?(i+=l,s++):(r(),s++)}if(r(),o)throw new F(k.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new De(t)}static emptyPath(){return new De([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class B{constructor(e){this.path=e}static fromPath(e){return new B(le.fromString(e))}static fromName(e){return new B(le.fromString(e).popFirst(5))}static empty(){return new B(le.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&le.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return le.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new B(new le(e.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function td(n,e,t){if(!t)throw new F(k.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function Cw(n,e,t,i){if(e===!0&&i===!0)throw new F(k.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function nd(n){if(!B.isDocumentKey(n))throw new F(k.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function id(n){if(B.isDocumentKey(n))throw new F(k.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function sd(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function Ya(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(i){return i.constructor?i.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":q(12329,{type:typeof n})}function Jt(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new F(k.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=Ya(n);throw new F(k.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _e(n,e){const t={typeString:n};return e&&(t.value=e),t}function ts(n,e){if(!sd(n))throw new F(k.INVALID_ARGUMENT,"JSON must be an object");let t;for(const i in e)if(e[i]){const s=e[i].typeString,r="value"in e[i]?{value:e[i].value}:void 0;if(!(i in n)){t=`JSON missing required field: '${i}'`;break}const o=n[i];if(s&&typeof o!==s){t=`JSON field '${i}' must be a ${s}.`;break}if(r!==void 0&&o!==r.value){t=`Expected '${i}' field to equal '${r.value}'`;break}}if(t)throw new F(k.INVALID_ARGUMENT,t);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rd=-62135596800,od=1e6;class ce{static now(){return ce.fromMillis(Date.now())}static fromDate(e){return ce.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),i=Math.floor((e-1e3*t)*od);return new ce(t,i)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new F(k.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new F(k.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<rd)throw new F(k.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new F(k.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/od}_compareTo(e){return this.seconds===e.seconds?J(this.nanoseconds,e.nanoseconds):J(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:ce._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(ts(e,ce._jsonSchema))return new ce(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-rd;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}ce._jsonSchemaVersion="firestore/timestamp/1.0",ce._jsonSchema={type:_e("string",ce._jsonSchemaVersion),seconds:_e("number"),nanoseconds:_e("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class j{static fromTimestamp(e){return new j(e)}static min(){return new j(new ce(0,0))}static max(){return new j(new ce(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ns=-1;function Aw(n,e){const t=n.toTimestamp().seconds,i=n.toTimestamp().nanoseconds+1,s=j.fromTimestamp(i===1e9?new ce(t+1,0):new ce(t,i));return new Zt(s,B.empty(),e)}function Sw(n){return new Zt(n.readTime,n.key,ns)}class Zt{constructor(e,t,i){this.readTime=e,this.documentKey=t,this.largestBatchId=i}static min(){return new Zt(j.min(),B.empty(),ns)}static max(){return new Zt(j.max(),B.empty(),ns)}}function Rw(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=B.comparator(n.documentKey,e.documentKey),t!==0?t:J(n.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pw="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class kw{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function gi(n){if(n.code!==k.FAILED_PRECONDITION||n.message!==Pw)throw n;M("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class R{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&q(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new R((i,s)=>{this.nextCallback=r=>{this.wrapSuccess(e,r).next(i,s)},this.catchCallback=r=>{this.wrapFailure(t,r).next(i,s)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof R?t:R.resolve(t)}catch(t){return R.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):R.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):R.reject(t)}static resolve(e){return new R((t,i)=>{t(e)})}static reject(e){return new R((t,i)=>{i(e)})}static waitFor(e){return new R((t,i)=>{let s=0,r=0,o=!1;e.forEach(l=>{++s,l.next(()=>{++r,o&&r===s&&t()},c=>i(c))}),o=!0,r===s&&t()})}static or(e){let t=R.resolve(!1);for(const i of e)t=t.next(s=>s?R.resolve(s):i());return t}static forEach(e,t){const i=[];return e.forEach((s,r)=>{i.push(t.call(this,s,r))}),this.waitFor(i)}static mapArray(e,t){return new R((i,s)=>{const r=e.length,o=new Array(r);let l=0;for(let c=0;c<r;c++){const u=c;t(e[u]).next(f=>{o[u]=f,++l,l===r&&i(o)},f=>s(f))}})}static doWhile(e,t){return new R((i,s)=>{const r=()=>{e()===!0?t().next(()=>{r()},s):i()};r()})}}function Nw(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function mi(n){return n.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ur{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=i=>this.ae(i),this.ue=i=>t.writeSequenceNumber(i))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ue&&this.ue(e),e}}Ur.ce=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xa=-1;function Br(n){return n==null}function qr(n){return n===0&&1/n==-1/0}function xw(n){return typeof n=="number"&&Number.isInteger(n)&&!qr(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ad="";function Dw(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=ld(e)),e=Ow(n.get(t),e);return ld(e)}function Ow(n,e){let t=e;const i=n.length;for(let s=0;s<i;s++){const r=n.charAt(s);switch(r){case"\0":t+="";break;case ad:t+="";break;default:t+=r}}return t}function ld(n){return n+ad+""}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cd(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function Ln(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function ud(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ye=class _u{constructor(e,t){this.comparator=e,this.root=t||en.EMPTY}insert(e,t){return new _u(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,en.BLACK,null,null))}remove(e){return new _u(this.comparator,this.root.remove(e,this.comparator).copy(null,null,en.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const i=this.comparator(e,t.key);if(i===0)return t.value;i<0?t=t.left:i>0&&(t=t.right)}return null}indexOf(e){let t=0,i=this.root;for(;!i.isEmpty();){const s=this.comparator(e,i.key);if(s===0)return t+i.left.size;s<0?i=i.left:(t+=i.left.size+1,i=i.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,i)=>(e(t,i),!1))}toString(){const e=[];return this.inorderTraversal((t,i)=>(e.push(`${t}:${i}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Hr(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Hr(this.root,e,this.comparator,!1)}getReverseIterator(){return new Hr(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Hr(this.root,e,this.comparator,!0)}},Hr=class{constructor(e,t,i,s){this.isReverse=s,this.nodeStack=[];let r=1;for(;!e.isEmpty();)if(r=t?i(e.key,t):1,t&&s&&(r*=-1),r<0)e=this.isReverse?e.left:e.right;else{if(r===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}},en=class Ft{constructor(e,t,i,s,r){this.key=e,this.value=t,this.color=i??Ft.RED,this.left=s??Ft.EMPTY,this.right=r??Ft.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,i,s,r){return new Ft(e??this.key,t??this.value,i??this.color,s??this.left,r??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,i){let s=this;const r=i(e,s.key);return s=r<0?s.copy(null,null,null,s.left.insert(e,t,i),null):r===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,i)),s.fixUp()}removeMin(){if(this.left.isEmpty())return Ft.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let i,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return Ft.EMPTY;i=s.right.min(),s=s.copy(i.key,i.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Ft.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Ft.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw q(43730,{key:this.key,value:this.value});if(this.right.isRed())throw q(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw q(27949);return e+(this.isRed()?0:1)}};en.EMPTY=null,en.RED=!0,en.BLACK=!1,en.EMPTY=new class{constructor(){this.size=0}get key(){throw q(57766)}get value(){throw q(16141)}get color(){throw q(16727)}get left(){throw q(29726)}get right(){throw q(36894)}copy(e,t,i,s,r){return this}insert(e,t,i){return new en(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class we{constructor(e){this.comparator=e,this.data=new ye(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,i)=>(e(t),!1))}forEachInRange(e,t){const i=this.data.getIteratorFrom(e[0]);for(;i.hasNext();){const s=i.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let i;for(i=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();i.hasNext();)if(!e(i.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new hd(this.data.getIterator())}getIteratorFrom(e){return new hd(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(i=>{t=t.add(i)}),t}isEqual(e){if(!(e instanceof we)||this.size!==e.size)return!1;const t=this.data.getIterator(),i=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,r=i.getNext().key;if(this.comparator(s,r)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new we(this.comparator);return t.data=e,t}}class hd{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class it{constructor(e){this.fields=e,e.sort(De.comparator)}static empty(){return new it([])}unionWith(e){let t=new we(De.comparator);for(const i of this.fields)t=t.add(i);for(const i of e)t=t.add(i);return new it(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return pi(this.fields,e.fields,(t,i)=>t.isEqual(i))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dd extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oe{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(s){try{return atob(s)}catch(r){throw typeof DOMException<"u"&&r instanceof DOMException?new dd("Invalid base64 string: "+r):r}}(e);return new Oe(t)}static fromUint8Array(e){const t=function(s){let r="";for(let o=0;o<s.length;++o)r+=String.fromCharCode(s[o]);return r}(e);return new Oe(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const i=new Uint8Array(t.length);for(let s=0;s<t.length;s++)i[s]=t.charCodeAt(s);return i}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return J(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Oe.EMPTY_BYTE_STRING=new Oe("");const Vw=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function tn(n){if(se(!!n,39018),typeof n=="string"){let e=0;const t=Vw.exec(n);if(se(!!t,46558,{timestamp:n}),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const i=new Date(n);return{seconds:Math.floor(i.getTime()/1e3),nanos:e}}return{seconds:me(n.seconds),nanos:me(n.nanos)}}function me(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function nn(n){return typeof n=="string"?Oe.fromBase64String(n):Oe.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fd="server_timestamp",pd="__type__",gd="__previous_value__",md="__local_write_time__";function Ja(n){var t,i;return((i=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[pd])==null?void 0:i.stringValue)===fd}function zr(n){const e=n.mapValue.fields[gd];return Ja(e)?zr(e):e}function is(n){const e=tn(n.mapValue.fields[md].timestampValue);return new ce(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lw{constructor(e,t,i,s,r,o,l,c,u,f,p){this.databaseId=e,this.appId=t,this.persistenceKey=i,this.host=s,this.ssl=r,this.forceLongPolling=o,this.autoDetectLongPolling=l,this.longPollingOptions=c,this.useFetchStreams=u,this.isUsingEmulator=f,this.apiKey=p}}const Wr="(default)";class ss{constructor(e,t){this.projectId=e,this.database=t||Wr}static empty(){return new ss("","")}get isDefaultDatabase(){return this.database===Wr}isEqual(e){return e instanceof ss&&e.projectId===this.projectId&&e.database===this.database}}function Mw(n,e){if(!Object.prototype.hasOwnProperty.apply(n.options,["projectId"]))throw new F(k.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new ss(n.options.projectId,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _d="__type__",Fw="__max__",jr={mapValue:{}},yd="__vector__",$r="value";function sn(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?Ja(n)?4:Bw(n)?9007199254740991:Uw(n)?10:11:q(28295,{value:n})}function ft(n,e){if(n===e)return!0;const t=sn(n);if(t!==sn(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return is(n).isEqual(is(e));case 3:return function(s,r){if(typeof s.timestampValue=="string"&&typeof r.timestampValue=="string"&&s.timestampValue.length===r.timestampValue.length)return s.timestampValue===r.timestampValue;const o=tn(s.timestampValue),l=tn(r.timestampValue);return o.seconds===l.seconds&&o.nanos===l.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(s,r){return nn(s.bytesValue).isEqual(nn(r.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(s,r){return me(s.geoPointValue.latitude)===me(r.geoPointValue.latitude)&&me(s.geoPointValue.longitude)===me(r.geoPointValue.longitude)}(n,e);case 2:return function(s,r){if("integerValue"in s&&"integerValue"in r)return me(s.integerValue)===me(r.integerValue);if("doubleValue"in s&&"doubleValue"in r){const o=me(s.doubleValue),l=me(r.doubleValue);return o===l?qr(o)===qr(l):isNaN(o)&&isNaN(l)}return!1}(n,e);case 9:return pi(n.arrayValue.values||[],e.arrayValue.values||[],ft);case 10:case 11:return function(s,r){const o=s.mapValue.fields||{},l=r.mapValue.fields||{};if(cd(o)!==cd(l))return!1;for(const c in o)if(o.hasOwnProperty(c)&&(l[c]===void 0||!ft(o[c],l[c])))return!1;return!0}(n,e);default:return q(52216,{left:n})}}function rs(n,e){return(n.values||[]).find(t=>ft(t,e))!==void 0}function _i(n,e){if(n===e)return 0;const t=sn(n),i=sn(e);if(t!==i)return J(t,i);switch(t){case 0:case 9007199254740991:return 0;case 1:return J(n.booleanValue,e.booleanValue);case 2:return function(r,o){const l=me(r.integerValue||r.doubleValue),c=me(o.integerValue||o.doubleValue);return l<c?-1:l>c?1:l===c?0:isNaN(l)?isNaN(c)?0:-1:1}(n,e);case 3:return vd(n.timestampValue,e.timestampValue);case 4:return vd(is(n),is(e));case 5:return Ka(n.stringValue,e.stringValue);case 6:return function(r,o){const l=nn(r),c=nn(o);return l.compareTo(c)}(n.bytesValue,e.bytesValue);case 7:return function(r,o){const l=r.split("/"),c=o.split("/");for(let u=0;u<l.length&&u<c.length;u++){const f=J(l[u],c[u]);if(f!==0)return f}return J(l.length,c.length)}(n.referenceValue,e.referenceValue);case 8:return function(r,o){const l=J(me(r.latitude),me(o.latitude));return l!==0?l:J(me(r.longitude),me(o.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return Ed(n.arrayValue,e.arrayValue);case 10:return function(r,o){var m,b,S,N;const l=r.fields||{},c=o.fields||{},u=(m=l[$r])==null?void 0:m.arrayValue,f=(b=c[$r])==null?void 0:b.arrayValue,p=J(((S=u==null?void 0:u.values)==null?void 0:S.length)||0,((N=f==null?void 0:f.values)==null?void 0:N.length)||0);return p!==0?p:Ed(u,f)}(n.mapValue,e.mapValue);case 11:return function(r,o){if(r===jr.mapValue&&o===jr.mapValue)return 0;if(r===jr.mapValue)return 1;if(o===jr.mapValue)return-1;const l=r.fields||{},c=Object.keys(l),u=o.fields||{},f=Object.keys(u);c.sort(),f.sort();for(let p=0;p<c.length&&p<f.length;++p){const m=Ka(c[p],f[p]);if(m!==0)return m;const b=_i(l[c[p]],u[f[p]]);if(b!==0)return b}return J(c.length,f.length)}(n.mapValue,e.mapValue);default:throw q(23264,{he:t})}}function vd(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return J(n,e);const t=tn(n),i=tn(e),s=J(t.seconds,i.seconds);return s!==0?s:J(t.nanos,i.nanos)}function Ed(n,e){const t=n.values||[],i=e.values||[];for(let s=0;s<t.length&&s<i.length;++s){const r=_i(t[s],i[s]);if(r)return r}return J(t.length,i.length)}function yi(n){return Za(n)}function Za(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(t){const i=tn(t);return`time(${i.seconds},${i.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(t){return nn(t).toBase64()}(n.bytesValue):"referenceValue"in n?function(t){return B.fromName(t).toString()}(n.referenceValue):"geoPointValue"in n?function(t){return`geo(${t.latitude},${t.longitude})`}(n.geoPointValue):"arrayValue"in n?function(t){let i="[",s=!0;for(const r of t.values||[])s?s=!1:i+=",",i+=Za(r);return i+"]"}(n.arrayValue):"mapValue"in n?function(t){const i=Object.keys(t.fields||{}).sort();let s="{",r=!0;for(const o of i)r?r=!1:s+=",",s+=`${o}:${Za(t.fields[o])}`;return s+"}"}(n.mapValue):q(61005,{value:n})}function Gr(n){switch(sn(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=zr(n);return e?16+Gr(e):16;case 5:return 2*n.stringValue.length;case 6:return nn(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return function(i){return(i.values||[]).reduce((s,r)=>s+Gr(r),0)}(n.arrayValue);case 10:case 11:return function(i){let s=0;return Ln(i.fields,(r,o)=>{s+=r.length+Gr(o)}),s}(n.mapValue);default:throw q(13486,{value:n})}}function el(n){return!!n&&"integerValue"in n}function tl(n){return!!n&&"arrayValue"in n}function wd(n){return!!n&&"nullValue"in n}function Td(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function Kr(n){return!!n&&"mapValue"in n}function Uw(n){var t,i;return((i=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[_d])==null?void 0:i.stringValue)===yd}function os(n){if(n.geoPointValue)return{geoPointValue:{...n.geoPointValue}};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:{...n.timestampValue}};if(n.mapValue){const e={mapValue:{fields:{}}};return Ln(n.mapValue.fields,(t,i)=>e.mapValue.fields[t]=os(i)),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=os(n.arrayValue.values[t]);return e}return{...n}}function Bw(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===Fw}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class et{constructor(e){this.value=e}static empty(){return new et({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let i=0;i<e.length-1;++i)if(t=(t.mapValue.fields||{})[e.get(i)],!Kr(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=os(t)}setAll(e){let t=De.emptyPath(),i={},s=[];e.forEach((o,l)=>{if(!t.isImmediateParentOf(l)){const c=this.getFieldsMap(t);this.applyChanges(c,i,s),i={},s=[],t=l.popLast()}o?i[l.lastSegment()]=os(o):s.push(l.lastSegment())});const r=this.getFieldsMap(t);this.applyChanges(r,i,s)}delete(e){const t=this.field(e.popLast());Kr(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return ft(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let i=0;i<e.length;++i){let s=t.mapValue.fields[e.get(i)];Kr(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(i)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,i){Ln(t,(s,r)=>e[s]=r);for(const s of i)delete e[s]}clone(){return new et(os(this.value))}}function Id(n){const e=[];return Ln(n.fields,(t,i)=>{const s=new De([t]);if(Kr(i)){const r=Id(i.mapValue).fields;if(r.length===0)e.push(s);else for(const o of r)e.push(s.child(o))}else e.push(s)}),new it(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fe{constructor(e,t,i,s,r,o,l){this.key=e,this.documentType=t,this.version=i,this.readTime=s,this.createTime=r,this.data=o,this.documentState=l}static newInvalidDocument(e){return new Fe(e,0,j.min(),j.min(),j.min(),et.empty(),0)}static newFoundDocument(e,t,i,s){return new Fe(e,1,t,j.min(),i,s,0)}static newNoDocument(e,t){return new Fe(e,2,t,j.min(),j.min(),et.empty(),0)}static newUnknownDocument(e,t){return new Fe(e,3,t,j.min(),j.min(),et.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(j.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=et.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=et.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=j.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Fe&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Fe(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qr{constructor(e,t){this.position=e,this.inclusive=t}}function bd(n,e,t){let i=0;for(let s=0;s<n.position.length;s++){const r=e[s],o=n.position[s];if(r.field.isKeyField()?i=B.comparator(B.fromName(o.referenceValue),t.key):i=_i(o,t.data.field(r.field)),r.dir==="desc"&&(i*=-1),i!==0)break}return i}function Cd(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!ft(n.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yr{constructor(e,t="asc"){this.field=e,this.dir=t}}function qw(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ad{}class Te extends Ad{constructor(e,t,i){super(),this.field=e,this.op=t,this.value=i}static create(e,t,i){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,i):new zw(e,t,i):t==="array-contains"?new $w(e,i):t==="in"?new Gw(e,i):t==="not-in"?new Kw(e,i):t==="array-contains-any"?new Qw(e,i):new Te(e,t,i)}static createKeyFieldInFilter(e,t,i){return t==="in"?new Ww(e,i):new jw(e,i)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(_i(t,this.value)):t!==null&&sn(this.value)===sn(t)&&this.matchesComparison(_i(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return q(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class pt extends Ad{constructor(e,t){super(),this.filters=e,this.op=t,this.Pe=null}static create(e,t){return new pt(e,t)}matches(e){return Sd(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.Pe!==null||(this.Pe=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}}function Sd(n){return n.op==="and"}function Rd(n){return Hw(n)&&Sd(n)}function Hw(n){for(const e of n.filters)if(e instanceof pt)return!1;return!0}function nl(n){if(n instanceof Te)return n.field.canonicalString()+n.op.toString()+yi(n.value);if(Rd(n))return n.filters.map(e=>nl(e)).join(",");{const e=n.filters.map(t=>nl(t)).join(",");return`${n.op}(${e})`}}function Pd(n,e){return n instanceof Te?function(i,s){return s instanceof Te&&i.op===s.op&&i.field.isEqual(s.field)&&ft(i.value,s.value)}(n,e):n instanceof pt?function(i,s){return s instanceof pt&&i.op===s.op&&i.filters.length===s.filters.length?i.filters.reduce((r,o,l)=>r&&Pd(o,s.filters[l]),!0):!1}(n,e):void q(19439)}function kd(n){return n instanceof Te?function(t){return`${t.field.canonicalString()} ${t.op} ${yi(t.value)}`}(n):n instanceof pt?function(t){return t.op.toString()+" {"+t.getFilters().map(kd).join(" ,")+"}"}(n):"Filter"}class zw extends Te{constructor(e,t,i){super(e,t,i),this.key=B.fromName(i.referenceValue)}matches(e){const t=B.comparator(e.key,this.key);return this.matchesComparison(t)}}class Ww extends Te{constructor(e,t){super(e,"in",t),this.keys=Nd("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class jw extends Te{constructor(e,t){super(e,"not-in",t),this.keys=Nd("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function Nd(n,e){var t;return(((t=e.arrayValue)==null?void 0:t.values)||[]).map(i=>B.fromName(i.referenceValue))}class $w extends Te{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return tl(t)&&rs(t.arrayValue,this.value)}}class Gw extends Te{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&rs(this.value.arrayValue,t)}}class Kw extends Te{constructor(e,t){super(e,"not-in",t)}matches(e){if(rs(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!rs(this.value.arrayValue,t)}}class Qw extends Te{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!tl(t)||!t.arrayValue.values)&&t.arrayValue.values.some(i=>rs(this.value.arrayValue,i))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yw{constructor(e,t=null,i=[],s=[],r=null,o=null,l=null){this.path=e,this.collectionGroup=t,this.orderBy=i,this.filters=s,this.limit=r,this.startAt=o,this.endAt=l,this.Te=null}}function xd(n,e=null,t=[],i=[],s=null,r=null,o=null){return new Yw(n,e,t,i,s,r,o)}function il(n){const e=$(n);if(e.Te===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(i=>nl(i)).join(","),t+="|ob:",t+=e.orderBy.map(i=>function(r){return r.field.canonicalString()+r.dir}(i)).join(","),Br(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(i=>yi(i)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(i=>yi(i)).join(",")),e.Te=t}return e.Te}function sl(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!qw(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!Pd(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!Cd(n.startAt,e.startAt)&&Cd(n.endAt,e.endAt)}function rl(n){return B.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xr{constructor(e,t=null,i=[],s=[],r=null,o="F",l=null,c=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=i,this.filters=s,this.limit=r,this.limitType=o,this.startAt=l,this.endAt=c,this.Ee=null,this.Ie=null,this.Re=null,this.startAt,this.endAt}}function Xw(n,e,t,i,s,r,o,l){return new Xr(n,e,t,i,s,r,o,l)}function ol(n){return new Xr(n)}function Dd(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function Jw(n){return B.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function Zw(n){return n.collectionGroup!==null}function as(n){const e=$(n);if(e.Ee===null){e.Ee=[];const t=new Set;for(const r of e.explicitOrderBy)e.Ee.push(r),t.add(r.field.canonicalString());const i=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let l=new we(De.comparator);return o.filters.forEach(c=>{c.getFlattenedFilters().forEach(u=>{u.isInequality()&&(l=l.add(u.field))})}),l})(e).forEach(r=>{t.has(r.canonicalString())||r.isKeyField()||e.Ee.push(new Yr(r,i))}),t.has(De.keyField().canonicalString())||e.Ee.push(new Yr(De.keyField(),i))}return e.Ee}function gt(n){const e=$(n);return e.Ie||(e.Ie=eT(e,as(n))),e.Ie}function eT(n,e){if(n.limitType==="F")return xd(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map(s=>{const r=s.dir==="desc"?"asc":"desc";return new Yr(s.field,r)});const t=n.endAt?new Qr(n.endAt.position,n.endAt.inclusive):null,i=n.startAt?new Qr(n.startAt.position,n.startAt.inclusive):null;return xd(n.path,n.collectionGroup,e,n.filters,n.limit,t,i)}}function al(n,e,t){return new Xr(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function Jr(n,e){return sl(gt(n),gt(e))&&n.limitType===e.limitType}function Od(n){return`${il(gt(n))}|lt:${n.limitType}`}function vi(n){return`Query(target=${function(t){let i=t.path.canonicalString();return t.collectionGroup!==null&&(i+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(i+=`, filters: [${t.filters.map(s=>kd(s)).join(", ")}]`),Br(t.limit)||(i+=", limit: "+t.limit),t.orderBy.length>0&&(i+=`, orderBy: [${t.orderBy.map(s=>function(o){return`${o.field.canonicalString()} (${o.dir})`}(s)).join(", ")}]`),t.startAt&&(i+=", startAt: ",i+=t.startAt.inclusive?"b:":"a:",i+=t.startAt.position.map(s=>yi(s)).join(",")),t.endAt&&(i+=", endAt: ",i+=t.endAt.inclusive?"a:":"b:",i+=t.endAt.position.map(s=>yi(s)).join(",")),`Target(${i})`}(gt(n))}; limitType=${n.limitType})`}function Zr(n,e){return e.isFoundDocument()&&function(i,s){const r=s.key.path;return i.collectionGroup!==null?s.key.hasCollectionId(i.collectionGroup)&&i.path.isPrefixOf(r):B.isDocumentKey(i.path)?i.path.isEqual(r):i.path.isImmediateParentOf(r)}(n,e)&&function(i,s){for(const r of as(i))if(!r.field.isKeyField()&&s.data.field(r.field)===null)return!1;return!0}(n,e)&&function(i,s){for(const r of i.filters)if(!r.matches(s))return!1;return!0}(n,e)&&function(i,s){return!(i.startAt&&!function(o,l,c){const u=bd(o,l,c);return o.inclusive?u<=0:u<0}(i.startAt,as(i),s)||i.endAt&&!function(o,l,c){const u=bd(o,l,c);return o.inclusive?u>=0:u>0}(i.endAt,as(i),s))}(n,e)}function tT(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function Vd(n){return(e,t)=>{let i=!1;for(const s of as(n)){const r=nT(s,e,t);if(r!==0)return r;i=i||s.field.isKeyField()}return 0}}function nT(n,e,t){const i=n.field.isKeyField()?B.comparator(e.key,t.key):function(r,o,l){const c=o.data.field(r),u=l.data.field(r);return c!==null&&u!==null?_i(c,u):q(42886)}(n.field,e,t);switch(n.dir){case"asc":return i;case"desc":return-1*i;default:return q(19790,{direction:n.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mn{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),i=this.inner[t];if(i!==void 0){for(const[s,r]of i)if(this.equalsFn(s,e))return r}}has(e){return this.get(e)!==void 0}set(e,t){const i=this.mapKeyFn(e),s=this.inner[i];if(s===void 0)return this.inner[i]=[[e,t]],void this.innerSize++;for(let r=0;r<s.length;r++)if(this.equalsFn(s[r][0],e))return void(s[r]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),i=this.inner[t];if(i===void 0)return!1;for(let s=0;s<i.length;s++)if(this.equalsFn(i[s][0],e))return i.length===1?delete this.inner[t]:i.splice(s,1),this.innerSize--,!0;return!1}forEach(e){Ln(this.inner,(t,i)=>{for(const[s,r]of i)e(s,r)})}isEmpty(){return ud(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iT=new ye(B.comparator);function xt(){return iT}const Ld=new ye(B.comparator);function ls(...n){let e=Ld;for(const t of n)e=e.insert(t.key,t);return e}function Md(n){let e=Ld;return n.forEach((t,i)=>e=e.insert(t,i.overlayedDocument)),e}function Fn(){return cs()}function Fd(){return cs()}function cs(){return new Mn(n=>n.toString(),(n,e)=>n.isEqual(e))}const sT=new ye(B.comparator),rT=new we(B.comparator);function Z(...n){let e=rT;for(const t of n)e=e.add(t);return e}const oT=new we(J);function aT(){return oT}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ll(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:qr(e)?"-0":e}}function Ud(n){return{integerValue:""+n}}function lT(n,e){return xw(e)?Ud(e):ll(n,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eo{constructor(){this._=void 0}}function cT(n,e,t){return n instanceof us?function(s,r){const o={fields:{[pd]:{stringValue:fd},[md]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return r&&Ja(r)&&(r=zr(r)),r&&(o.fields[gd]=r),{mapValue:o}}(t,e):n instanceof hs?qd(n,e):n instanceof ds?Hd(n,e):function(s,r){const o=Bd(s,r),l=zd(o)+zd(s.Ae);return el(o)&&el(s.Ae)?Ud(l):ll(s.serializer,l)}(n,e)}function uT(n,e,t){return n instanceof hs?qd(n,e):n instanceof ds?Hd(n,e):t}function Bd(n,e){return n instanceof to?function(i){return el(i)||function(r){return!!r&&"doubleValue"in r}(i)}(e)?e:{integerValue:0}:null}class us extends eo{}class hs extends eo{constructor(e){super(),this.elements=e}}function qd(n,e){const t=Wd(e);for(const i of n.elements)t.some(s=>ft(s,i))||t.push(i);return{arrayValue:{values:t}}}class ds extends eo{constructor(e){super(),this.elements=e}}function Hd(n,e){let t=Wd(e);for(const i of n.elements)t=t.filter(s=>!ft(s,i));return{arrayValue:{values:t}}}class to extends eo{constructor(e,t){super(),this.serializer=e,this.Ae=t}}function zd(n){return me(n.integerValue||n.doubleValue)}function Wd(n){return tl(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hT{constructor(e,t){this.field=e,this.transform=t}}function dT(n,e){return n.field.isEqual(e.field)&&function(i,s){return i instanceof hs&&s instanceof hs||i instanceof ds&&s instanceof ds?pi(i.elements,s.elements,ft):i instanceof to&&s instanceof to?ft(i.Ae,s.Ae):i instanceof us&&s instanceof us}(n.transform,e.transform)}class fT{constructor(e,t){this.version=e,this.transformResults=t}}class mt{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new mt}static exists(e){return new mt(void 0,e)}static updateTime(e){return new mt(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function no(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class io{}function jd(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new cl(n.key,mt.none()):new ps(n.key,n.data,mt.none());{const t=n.data,i=et.empty();let s=new we(De.comparator);for(let r of e.fields)if(!s.has(r)){let o=t.field(r);o===null&&r.length>1&&(r=r.popLast(),o=t.field(r)),o===null?i.delete(r):i.set(r,o),s=s.add(r)}return new Un(n.key,i,new it(s.toArray()),mt.none())}}function pT(n,e,t){n instanceof ps?function(s,r,o){const l=s.value.clone(),c=Kd(s.fieldTransforms,r,o.transformResults);l.setAll(c),r.convertToFoundDocument(o.version,l).setHasCommittedMutations()}(n,e,t):n instanceof Un?function(s,r,o){if(!no(s.precondition,r))return void r.convertToUnknownDocument(o.version);const l=Kd(s.fieldTransforms,r,o.transformResults),c=r.data;c.setAll(Gd(s)),c.setAll(l),r.convertToFoundDocument(o.version,c).setHasCommittedMutations()}(n,e,t):function(s,r,o){r.convertToNoDocument(o.version).setHasCommittedMutations()}(0,e,t)}function fs(n,e,t,i){return n instanceof ps?function(r,o,l,c){if(!no(r.precondition,o))return l;const u=r.value.clone(),f=Qd(r.fieldTransforms,c,o);return u.setAll(f),o.convertToFoundDocument(o.version,u).setHasLocalMutations(),null}(n,e,t,i):n instanceof Un?function(r,o,l,c){if(!no(r.precondition,o))return l;const u=Qd(r.fieldTransforms,c,o),f=o.data;return f.setAll(Gd(r)),f.setAll(u),o.convertToFoundDocument(o.version,f).setHasLocalMutations(),l===null?null:l.unionWith(r.fieldMask.fields).unionWith(r.fieldTransforms.map(p=>p.field))}(n,e,t,i):function(r,o,l){return no(r.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):l}(n,e,t)}function gT(n,e){let t=null;for(const i of n.fieldTransforms){const s=e.data.field(i.field),r=Bd(i.transform,s||null);r!=null&&(t===null&&(t=et.empty()),t.set(i.field,r))}return t||null}function $d(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!function(i,s){return i===void 0&&s===void 0||!(!i||!s)&&pi(i,s,(r,o)=>dT(r,o))}(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class ps extends io{constructor(e,t,i,s=[]){super(),this.key=e,this.value=t,this.precondition=i,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class Un extends io{constructor(e,t,i,s,r=[]){super(),this.key=e,this.data=t,this.fieldMask=i,this.precondition=s,this.fieldTransforms=r,this.type=1}getFieldMask(){return this.fieldMask}}function Gd(n){const e=new Map;return n.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const i=n.data.field(t);e.set(t,i)}}),e}function Kd(n,e,t){const i=new Map;se(n.length===t.length,32656,{Ve:t.length,de:n.length});for(let s=0;s<t.length;s++){const r=n[s],o=r.transform,l=e.data.field(r.field);i.set(r.field,uT(o,l,t[s]))}return i}function Qd(n,e,t){const i=new Map;for(const s of n){const r=s.transform,o=t.data.field(s.field);i.set(s.field,cT(r,o,e))}return i}class cl extends io{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class mT extends io{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _T{constructor(e,t,i,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=i,this.mutations=s}applyToRemoteDocument(e,t){const i=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const r=this.mutations[s];r.key.isEqual(e.key)&&pT(r,e,i[s])}}applyToLocalView(e,t){for(const i of this.baseMutations)i.key.isEqual(e.key)&&(t=fs(i,e,t,this.localWriteTime));for(const i of this.mutations)i.key.isEqual(e.key)&&(t=fs(i,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const i=Fd();return this.mutations.forEach(s=>{const r=e.get(s.key),o=r.overlayedDocument;let l=this.applyToLocalView(o,r.mutatedFields);l=t.has(s.key)?null:l;const c=jd(o,l);c!==null&&i.set(s.key,c),o.isValidDocument()||o.convertToNoDocument(j.min())}),i}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),Z())}isEqual(e){return this.batchId===e.batchId&&pi(this.mutations,e.mutations,(t,i)=>$d(t,i))&&pi(this.baseMutations,e.baseMutations,(t,i)=>$d(t,i))}}class ul{constructor(e,t,i,s){this.batch=e,this.commitVersion=t,this.mutationResults=i,this.docVersions=s}static from(e,t,i){se(e.mutations.length===i.length,58842,{me:e.mutations.length,fe:i.length});let s=function(){return sT}();const r=e.mutations;for(let o=0;o<r.length;o++)s=s.insert(r[o].key,i[o].version);return new ul(e,t,i,s)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yT{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vT{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var ve,ne;function ET(n){switch(n){case k.OK:return q(64938);case k.CANCELLED:case k.UNKNOWN:case k.DEADLINE_EXCEEDED:case k.RESOURCE_EXHAUSTED:case k.INTERNAL:case k.UNAVAILABLE:case k.UNAUTHENTICATED:return!1;case k.INVALID_ARGUMENT:case k.NOT_FOUND:case k.ALREADY_EXISTS:case k.PERMISSION_DENIED:case k.FAILED_PRECONDITION:case k.ABORTED:case k.OUT_OF_RANGE:case k.UNIMPLEMENTED:case k.DATA_LOSS:return!0;default:return q(15467,{code:n})}}function Yd(n){if(n===void 0)return kt("GRPC error has no .code"),k.UNKNOWN;switch(n){case ve.OK:return k.OK;case ve.CANCELLED:return k.CANCELLED;case ve.UNKNOWN:return k.UNKNOWN;case ve.DEADLINE_EXCEEDED:return k.DEADLINE_EXCEEDED;case ve.RESOURCE_EXHAUSTED:return k.RESOURCE_EXHAUSTED;case ve.INTERNAL:return k.INTERNAL;case ve.UNAVAILABLE:return k.UNAVAILABLE;case ve.UNAUTHENTICATED:return k.UNAUTHENTICATED;case ve.INVALID_ARGUMENT:return k.INVALID_ARGUMENT;case ve.NOT_FOUND:return k.NOT_FOUND;case ve.ALREADY_EXISTS:return k.ALREADY_EXISTS;case ve.PERMISSION_DENIED:return k.PERMISSION_DENIED;case ve.FAILED_PRECONDITION:return k.FAILED_PRECONDITION;case ve.ABORTED:return k.ABORTED;case ve.OUT_OF_RANGE:return k.OUT_OF_RANGE;case ve.UNIMPLEMENTED:return k.UNIMPLEMENTED;case ve.DATA_LOSS:return k.DATA_LOSS;default:return q(39323,{code:n})}}(ne=ve||(ve={}))[ne.OK=0]="OK",ne[ne.CANCELLED=1]="CANCELLED",ne[ne.UNKNOWN=2]="UNKNOWN",ne[ne.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",ne[ne.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",ne[ne.NOT_FOUND=5]="NOT_FOUND",ne[ne.ALREADY_EXISTS=6]="ALREADY_EXISTS",ne[ne.PERMISSION_DENIED=7]="PERMISSION_DENIED",ne[ne.UNAUTHENTICATED=16]="UNAUTHENTICATED",ne[ne.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",ne[ne.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",ne[ne.ABORTED=10]="ABORTED",ne[ne.OUT_OF_RANGE=11]="OUT_OF_RANGE",ne[ne.UNIMPLEMENTED=12]="UNIMPLEMENTED",ne[ne.INTERNAL=13]="INTERNAL",ne[ne.UNAVAILABLE=14]="UNAVAILABLE",ne[ne.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wT(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const TT=new Xt([4294967295,4294967295],0);function Xd(n){const e=wT().encode(n),t=new jh;return t.update(e),new Uint8Array(t.digest())}function Jd(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),i=e.getUint32(4,!0),s=e.getUint32(8,!0),r=e.getUint32(12,!0);return[new Xt([t,i],0),new Xt([s,r],0)]}class hl{constructor(e,t,i){if(this.bitmap=e,this.padding=t,this.hashCount=i,t<0||t>=8)throw new gs(`Invalid padding: ${t}`);if(i<0)throw new gs(`Invalid hash count: ${i}`);if(e.length>0&&this.hashCount===0)throw new gs(`Invalid hash count: ${i}`);if(e.length===0&&t!==0)throw new gs(`Invalid padding when bitmap length is 0: ${t}`);this.ge=8*e.length-t,this.pe=Xt.fromNumber(this.ge)}ye(e,t,i){let s=e.add(t.multiply(Xt.fromNumber(i)));return s.compare(TT)===1&&(s=new Xt([s.getBits(0),s.getBits(1)],0)),s.modulo(this.pe).toNumber()}we(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.ge===0)return!1;const t=Xd(e),[i,s]=Jd(t);for(let r=0;r<this.hashCount;r++){const o=this.ye(i,s,r);if(!this.we(o))return!1}return!0}static create(e,t,i){const s=e%8==0?0:8-e%8,r=new Uint8Array(Math.ceil(e/8)),o=new hl(r,s,t);return i.forEach(l=>o.insert(l)),o}insert(e){if(this.ge===0)return;const t=Xd(e),[i,s]=Jd(t);for(let r=0;r<this.hashCount;r++){const o=this.ye(i,s,r);this.Se(o)}}Se(e){const t=Math.floor(e/8),i=e%8;this.bitmap[t]|=1<<i}}class gs extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class so{constructor(e,t,i,s,r){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=i,this.documentUpdates=s,this.resolvedLimboDocuments=r}static createSynthesizedRemoteEventForCurrentChange(e,t,i){const s=new Map;return s.set(e,ms.createSynthesizedTargetChangeForCurrentChange(e,t,i)),new so(j.min(),s,new ye(J),xt(),Z())}}class ms{constructor(e,t,i,s,r){this.resumeToken=e,this.current=t,this.addedDocuments=i,this.modifiedDocuments=s,this.removedDocuments=r}static createSynthesizedTargetChangeForCurrentChange(e,t,i){return new ms(i,t,Z(),Z(),Z())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ro{constructor(e,t,i,s){this.be=e,this.removedTargetIds=t,this.key=i,this.De=s}}class Zd{constructor(e,t){this.targetId=e,this.Ce=t}}class ef{constructor(e,t,i=Oe.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=i,this.cause=s}}class tf{constructor(){this.ve=0,this.Fe=nf(),this.Me=Oe.EMPTY_BYTE_STRING,this.xe=!1,this.Oe=!0}get current(){return this.xe}get resumeToken(){return this.Me}get Ne(){return this.ve!==0}get Be(){return this.Oe}Le(e){e.approximateByteSize()>0&&(this.Oe=!0,this.Me=e)}ke(){let e=Z(),t=Z(),i=Z();return this.Fe.forEach((s,r)=>{switch(r){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:i=i.add(s);break;default:q(38017,{changeType:r})}}),new ms(this.Me,this.xe,e,t,i)}qe(){this.Oe=!1,this.Fe=nf()}Ke(e,t){this.Oe=!0,this.Fe=this.Fe.insert(e,t)}Ue(e){this.Oe=!0,this.Fe=this.Fe.remove(e)}$e(){this.ve+=1}We(){this.ve-=1,se(this.ve>=0,3241,{ve:this.ve})}Qe(){this.Oe=!0,this.xe=!0}}class IT{constructor(e){this.Ge=e,this.ze=new Map,this.je=xt(),this.Je=oo(),this.He=oo(),this.Ze=new ye(J)}Xe(e){for(const t of e.be)e.De&&e.De.isFoundDocument()?this.Ye(t,e.De):this.et(t,e.key,e.De);for(const t of e.removedTargetIds)this.et(t,e.key,e.De)}tt(e){this.forEachTarget(e,t=>{const i=this.nt(t);switch(e.state){case 0:this.rt(t)&&i.Le(e.resumeToken);break;case 1:i.We(),i.Ne||i.qe(),i.Le(e.resumeToken);break;case 2:i.We(),i.Ne||this.removeTarget(t);break;case 3:this.rt(t)&&(i.Qe(),i.Le(e.resumeToken));break;case 4:this.rt(t)&&(this.it(t),i.Le(e.resumeToken));break;default:q(56790,{state:e.state})}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.ze.forEach((i,s)=>{this.rt(s)&&t(s)})}st(e){const t=e.targetId,i=e.Ce.count,s=this.ot(t);if(s){const r=s.target;if(rl(r))if(i===0){const o=new B(r.path);this.et(t,o,Fe.newNoDocument(o,j.min()))}else se(i===1,20013,{expectedCount:i});else{const o=this._t(t);if(o!==i){const l=this.ut(e),c=l?this.ct(l,e,o):1;if(c!==0){this.it(t);const u=c===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ze=this.Ze.insert(t,u)}}}}}ut(e){const t=e.Ce.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:i="",padding:s=0},hashCount:r=0}=t;let o,l;try{o=nn(i).toUint8Array()}catch(c){if(c instanceof dd)return Vn("Decoding the base64 bloom filter in existence filter failed ("+c.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw c}try{l=new hl(o,s,r)}catch(c){return Vn(c instanceof gs?"BloomFilter error: ":"Applying bloom filter failed: ",c),null}return l.ge===0?null:l}ct(e,t,i){return t.Ce.count===i-this.Pt(e,t.targetId)?0:2}Pt(e,t){const i=this.Ge.getRemoteKeysForTarget(t);let s=0;return i.forEach(r=>{const o=this.Ge.ht(),l=`projects/${o.projectId}/databases/${o.database}/documents/${r.path.canonicalString()}`;e.mightContain(l)||(this.et(t,r,null),s++)}),s}Tt(e){const t=new Map;this.ze.forEach((r,o)=>{const l=this.ot(o);if(l){if(r.current&&rl(l.target)){const c=new B(l.target.path);this.Et(c).has(o)||this.It(o,c)||this.et(o,c,Fe.newNoDocument(c,e))}r.Be&&(t.set(o,r.ke()),r.qe())}});let i=Z();this.He.forEach((r,o)=>{let l=!0;o.forEachWhile(c=>{const u=this.ot(c);return!u||u.purpose==="TargetPurposeLimboResolution"||(l=!1,!1)}),l&&(i=i.add(r))}),this.je.forEach((r,o)=>o.setReadTime(e));const s=new so(e,t,this.Ze,this.je,i);return this.je=xt(),this.Je=oo(),this.He=oo(),this.Ze=new ye(J),s}Ye(e,t){if(!this.rt(e))return;const i=this.It(e,t.key)?2:0;this.nt(e).Ke(t.key,i),this.je=this.je.insert(t.key,t),this.Je=this.Je.insert(t.key,this.Et(t.key).add(e)),this.He=this.He.insert(t.key,this.Rt(t.key).add(e))}et(e,t,i){if(!this.rt(e))return;const s=this.nt(e);this.It(e,t)?s.Ke(t,1):s.Ue(t),this.He=this.He.insert(t,this.Rt(t).delete(e)),this.He=this.He.insert(t,this.Rt(t).add(e)),i&&(this.je=this.je.insert(t,i))}removeTarget(e){this.ze.delete(e)}_t(e){const t=this.nt(e).ke();return this.Ge.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}$e(e){this.nt(e).$e()}nt(e){let t=this.ze.get(e);return t||(t=new tf,this.ze.set(e,t)),t}Rt(e){let t=this.He.get(e);return t||(t=new we(J),this.He=this.He.insert(e,t)),t}Et(e){let t=this.Je.get(e);return t||(t=new we(J),this.Je=this.Je.insert(e,t)),t}rt(e){const t=this.ot(e)!==null;return t||M("WatchChangeAggregator","Detected inactive target",e),t}ot(e){const t=this.ze.get(e);return t&&t.Ne?null:this.Ge.At(e)}it(e){this.ze.set(e,new tf),this.Ge.getRemoteKeysForTarget(e).forEach(t=>{this.et(e,t,null)})}It(e,t){return this.Ge.getRemoteKeysForTarget(e).has(t)}}function oo(){return new ye(B.comparator)}function nf(){return new ye(B.comparator)}const bT={asc:"ASCENDING",desc:"DESCENDING"},CT={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},AT={and:"AND",or:"OR"};class ST{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function dl(n,e){return n.useProto3Json||Br(e)?e:{value:e}}function ao(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function sf(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function RT(n,e){return ao(n,e.toTimestamp())}function _t(n){return se(!!n,49232),j.fromTimestamp(function(t){const i=tn(t);return new ce(i.seconds,i.nanos)}(n))}function fl(n,e){return pl(n,e).canonicalString()}function pl(n,e){const t=function(s){return new le(["projects",s.projectId,"databases",s.database])}(n).child("documents");return e===void 0?t:t.child(e)}function rf(n){const e=le.fromString(n);return se(hf(e),10190,{key:e.toString()}),e}function gl(n,e){return fl(n.databaseId,e.path)}function ml(n,e){const t=rf(e);if(t.get(1)!==n.databaseId.projectId)throw new F(k.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new F(k.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new B(af(t))}function of(n,e){return fl(n.databaseId,e)}function PT(n){const e=rf(n);return e.length===4?le.emptyPath():af(e)}function _l(n){return new le(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function af(n){return se(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function lf(n,e,t){return{name:gl(n,e),fields:t.value.mapValue.fields}}function kT(n,e){let t;if("targetChange"in e){e.targetChange;const i=function(u){return u==="NO_CHANGE"?0:u==="ADD"?1:u==="REMOVE"?2:u==="CURRENT"?3:u==="RESET"?4:q(39313,{state:u})}(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],r=function(u,f){return u.useProto3Json?(se(f===void 0||typeof f=="string",58123),Oe.fromBase64String(f||"")):(se(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),Oe.fromUint8Array(f||new Uint8Array))}(n,e.targetChange.resumeToken),o=e.targetChange.cause,l=o&&function(u){const f=u.code===void 0?k.UNKNOWN:Yd(u.code);return new F(f,u.message||"")}(o);t=new ef(i,s,r,l||null)}else if("documentChange"in e){e.documentChange;const i=e.documentChange;i.document,i.document.name,i.document.updateTime;const s=ml(n,i.document.name),r=_t(i.document.updateTime),o=i.document.createTime?_t(i.document.createTime):j.min(),l=new et({mapValue:{fields:i.document.fields}}),c=Fe.newFoundDocument(s,r,o,l),u=i.targetIds||[],f=i.removedTargetIds||[];t=new ro(u,f,c.key,c)}else if("documentDelete"in e){e.documentDelete;const i=e.documentDelete;i.document;const s=ml(n,i.document),r=i.readTime?_t(i.readTime):j.min(),o=Fe.newNoDocument(s,r),l=i.removedTargetIds||[];t=new ro([],l,o.key,o)}else if("documentRemove"in e){e.documentRemove;const i=e.documentRemove;i.document;const s=ml(n,i.document),r=i.removedTargetIds||[];t=new ro([],r,s,null)}else{if(!("filter"in e))return q(11601,{Vt:e});{e.filter;const i=e.filter;i.targetId;const{count:s=0,unchangedNames:r}=i,o=new vT(s,r),l=i.targetId;t=new Zd(l,o)}}return t}function NT(n,e){let t;if(e instanceof ps)t={update:lf(n,e.key,e.value)};else if(e instanceof cl)t={delete:gl(n,e.key)};else if(e instanceof Un)t={update:lf(n,e.key,e.data),updateMask:BT(e.fieldMask)};else{if(!(e instanceof mT))return q(16599,{dt:e.type});t={verify:gl(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(i=>function(r,o){const l=o.transform;if(l instanceof us)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(l instanceof hs)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:l.elements}};if(l instanceof ds)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:l.elements}};if(l instanceof to)return{fieldPath:o.field.canonicalString(),increment:l.Ae};throw q(20930,{transform:o.transform})}(0,i))),e.precondition.isNone||(t.currentDocument=function(s,r){return r.updateTime!==void 0?{updateTime:RT(s,r.updateTime)}:r.exists!==void 0?{exists:r.exists}:q(27497)}(n,e.precondition)),t}function xT(n,e){return n&&n.length>0?(se(e!==void 0,14353),n.map(t=>function(s,r){let o=s.updateTime?_t(s.updateTime):_t(r);return o.isEqual(j.min())&&(o=_t(r)),new fT(o,s.transformResults||[])}(t,e))):[]}function DT(n,e){return{documents:[of(n,e.path)]}}function OT(n,e){const t={structuredQuery:{}},i=e.path;let s;e.collectionGroup!==null?(s=i,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=i.popLast(),t.structuredQuery.from=[{collectionId:i.lastSegment()}]),t.parent=of(n,s);const r=function(u){if(u.length!==0)return uf(pt.create(u,"and"))}(e.filters);r&&(t.structuredQuery.where=r);const o=function(u){if(u.length!==0)return u.map(f=>function(m){return{field:Ei(m.field),direction:MT(m.dir)}}(f))}(e.orderBy);o&&(t.structuredQuery.orderBy=o);const l=dl(n,e.limit);return l!==null&&(t.structuredQuery.limit=l),e.startAt&&(t.structuredQuery.startAt=function(u){return{before:u.inclusive,values:u.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(u){return{before:!u.inclusive,values:u.position}}(e.endAt)),{ft:t,parent:s}}function VT(n){let e=PT(n.parent);const t=n.structuredQuery,i=t.from?t.from.length:0;let s=null;if(i>0){se(i===1,65062);const f=t.from[0];f.allDescendants?s=f.collectionId:e=e.child(f.collectionId)}let r=[];t.where&&(r=function(p){const m=cf(p);return m instanceof pt&&Rd(m)?m.getFilters():[m]}(t.where));let o=[];t.orderBy&&(o=function(p){return p.map(m=>function(S){return new Yr(wi(S.field),function(P){switch(P){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(S.direction))}(m))}(t.orderBy));let l=null;t.limit&&(l=function(p){let m;return m=typeof p=="object"?p.value:p,Br(m)?null:m}(t.limit));let c=null;t.startAt&&(c=function(p){const m=!!p.before,b=p.values||[];return new Qr(b,m)}(t.startAt));let u=null;return t.endAt&&(u=function(p){const m=!p.before,b=p.values||[];return new Qr(b,m)}(t.endAt)),Xw(e,s,o,r,l,"F",c,u)}function LT(n,e){const t=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return q(28987,{purpose:s})}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function cf(n){return n.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const i=wi(t.unaryFilter.field);return Te.create(i,"==",{doubleValue:NaN});case"IS_NULL":const s=wi(t.unaryFilter.field);return Te.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const r=wi(t.unaryFilter.field);return Te.create(r,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=wi(t.unaryFilter.field);return Te.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return q(61313);default:return q(60726)}}(n):n.fieldFilter!==void 0?function(t){return Te.create(wi(t.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return q(58110);default:return q(50506)}}(t.fieldFilter.op),t.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(t){return pt.create(t.compositeFilter.filters.map(i=>cf(i)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return q(1026)}}(t.compositeFilter.op))}(n):q(30097,{filter:n})}function MT(n){return bT[n]}function FT(n){return CT[n]}function UT(n){return AT[n]}function Ei(n){return{fieldPath:n.canonicalString()}}function wi(n){return De.fromServerFormat(n.fieldPath)}function uf(n){return n instanceof Te?function(t){if(t.op==="=="){if(Td(t.value))return{unaryFilter:{field:Ei(t.field),op:"IS_NAN"}};if(wd(t.value))return{unaryFilter:{field:Ei(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(Td(t.value))return{unaryFilter:{field:Ei(t.field),op:"IS_NOT_NAN"}};if(wd(t.value))return{unaryFilter:{field:Ei(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Ei(t.field),op:FT(t.op),value:t.value}}}(n):n instanceof pt?function(t){const i=t.getFilters().map(s=>uf(s));return i.length===1?i[0]:{compositeFilter:{op:UT(t.op),filters:i}}}(n):q(54877,{filter:n})}function BT(n){const e=[];return n.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function hf(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}function df(n){return!!n&&typeof n._toProto=="function"&&n._protoValueType==="ProtoValue"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rn{constructor(e,t,i,s,r=j.min(),o=j.min(),l=Oe.EMPTY_BYTE_STRING,c=null){this.target=e,this.targetId=t,this.purpose=i,this.sequenceNumber=s,this.snapshotVersion=r,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=l,this.expectedCount=c}withSequenceNumber(e){return new rn(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new rn(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new rn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new rn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qT{constructor(e){this.yt=e}}function HT(n){const e=VT({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?al(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zT{constructor(){this.bn=new WT}addToCollectionParentIndex(e,t){return this.bn.add(t),R.resolve()}getCollectionParents(e,t){return R.resolve(this.bn.getEntries(t))}addFieldIndex(e,t){return R.resolve()}deleteFieldIndex(e,t){return R.resolve()}deleteAllFieldIndexes(e){return R.resolve()}createTargetIndexes(e,t){return R.resolve()}getDocumentsMatchingTarget(e,t){return R.resolve(null)}getIndexType(e,t){return R.resolve(0)}getFieldIndexes(e,t){return R.resolve([])}getNextCollectionGroupToUpdate(e){return R.resolve(null)}getMinOffset(e,t){return R.resolve(Zt.min())}getMinOffsetFromCollectionGroup(e,t){return R.resolve(Zt.min())}updateCollectionGroup(e,t,i){return R.resolve()}updateIndexEntries(e,t){return R.resolve()}}class WT{constructor(){this.index={}}add(e){const t=e.lastSegment(),i=e.popLast(),s=this.index[t]||new we(le.comparator),r=!s.has(i);return this.index[t]=s.add(i),r}has(e){const t=e.lastSegment(),i=e.popLast(),s=this.index[t];return s&&s.has(i)}getEntries(e){return(this.index[e]||new we(le.comparator)).toArray()}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ff={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},pf=41943040;class Ge{static withCacheSize(e){return new Ge(e,Ge.DEFAULT_COLLECTION_PERCENTILE,Ge.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,i){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=i}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Ge.DEFAULT_COLLECTION_PERCENTILE=10,Ge.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Ge.DEFAULT=new Ge(pf,Ge.DEFAULT_COLLECTION_PERCENTILE,Ge.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Ge.DISABLED=new Ge(-1,0,0);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ti{constructor(e){this.sr=e}next(){return this.sr+=2,this.sr}static _r(){return new Ti(0)}static ar(){return new Ti(-1)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gf="LruGarbageCollector",jT=1048576;function mf([n,e],[t,i]){const s=J(n,t);return s===0?J(e,i):s}class $T{constructor(e){this.Pr=e,this.buffer=new we(mf),this.Tr=0}Er(){return++this.Tr}Ir(e){const t=[e,this.Er()];if(this.buffer.size<this.Pr)this.buffer=this.buffer.add(t);else{const i=this.buffer.last();mf(t,i)<0&&(this.buffer=this.buffer.delete(i).add(t))}}get maxValue(){return this.buffer.last()[0]}}class GT{constructor(e,t,i){this.garbageCollector=e,this.asyncQueue=t,this.localStore=i,this.Rr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Ar(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return this.Rr!==null}Ar(e){M(gf,`Garbage collection scheduled in ${e}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){mi(t)?M(gf,"Ignoring IndexedDB error during garbage collection: ",t):await gi(t)}await this.Ar(3e5)})}}class KT{constructor(e,t){this.Vr=e,this.params=t}calculateTargetCount(e,t){return this.Vr.dr(e).next(i=>Math.floor(t/100*i))}nthSequenceNumber(e,t){if(t===0)return R.resolve(Ur.ce);const i=new $T(t);return this.Vr.forEachTarget(e,s=>i.Ir(s.sequenceNumber)).next(()=>this.Vr.mr(e,s=>i.Ir(s))).next(()=>i.maxValue)}removeTargets(e,t,i){return this.Vr.removeTargets(e,t,i)}removeOrphanedDocuments(e,t){return this.Vr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(M("LruGarbageCollector","Garbage collection skipped; disabled"),R.resolve(ff)):this.getCacheSize(e).next(i=>i<this.params.cacheSizeCollectionThreshold?(M("LruGarbageCollector",`Garbage collection skipped; Cache size ${i} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),ff):this.gr(e,t))}getCacheSize(e){return this.Vr.getCacheSize(e)}gr(e,t){let i,s,r,o,l,c,u;const f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(p=>(p>this.params.maximumSequenceNumbersToCollect?(M("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${p}`),s=this.params.maximumSequenceNumbersToCollect):s=p,o=Date.now(),this.nthSequenceNumber(e,s))).next(p=>(i=p,l=Date.now(),this.removeTargets(e,i,t))).next(p=>(r=p,c=Date.now(),this.removeOrphanedDocuments(e,i))).next(p=>(u=Date.now(),fi()<=Y.DEBUG&&M("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-f}ms
	Determined least recently used ${s} in `+(l-o)+`ms
	Removed ${r} targets in `+(c-l)+`ms
	Removed ${p} documents in `+(u-c)+`ms
Total Duration: ${u-f}ms`),R.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:r,documentsRemoved:p})))}}function QT(n,e){return new KT(n,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class YT{constructor(){this.changes=new Mn(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Fe.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const i=this.changes.get(t);return i!==void 0?R.resolve(i):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class XT{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class JT{constructor(e,t,i,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=i,this.indexManager=s}getDocument(e,t){let i=null;return this.documentOverlayCache.getOverlay(e,t).next(s=>(i=s,this.remoteDocumentCache.getEntry(e,t))).next(s=>(i!==null&&fs(i.mutation,s,it.empty(),ce.now()),s))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(i=>this.getLocalViewOfDocuments(e,i,Z()).next(()=>i))}getLocalViewOfDocuments(e,t,i=Z()){const s=Fn();return this.populateOverlays(e,s,t).next(()=>this.computeViews(e,t,s,i).next(r=>{let o=ls();return r.forEach((l,c)=>{o=o.insert(l,c.overlayedDocument)}),o}))}getOverlayedDocuments(e,t){const i=Fn();return this.populateOverlays(e,i,t).next(()=>this.computeViews(e,t,i,Z()))}populateOverlays(e,t,i){const s=[];return i.forEach(r=>{t.has(r)||s.push(r)}),this.documentOverlayCache.getOverlays(e,s).next(r=>{r.forEach((o,l)=>{t.set(o,l)})})}computeViews(e,t,i,s){let r=xt();const o=cs(),l=function(){return cs()}();return t.forEach((c,u)=>{const f=i.get(u.key);s.has(u.key)&&(f===void 0||f.mutation instanceof Un)?r=r.insert(u.key,u):f!==void 0?(o.set(u.key,f.mutation.getFieldMask()),fs(f.mutation,u,f.mutation.getFieldMask(),ce.now())):o.set(u.key,it.empty())}),this.recalculateAndSaveOverlays(e,r).next(c=>(c.forEach((u,f)=>o.set(u,f)),t.forEach((u,f)=>l.set(u,new XT(f,o.get(u)??null))),l))}recalculateAndSaveOverlays(e,t){const i=cs();let s=new ye((o,l)=>o-l),r=Z();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(o=>{for(const l of o)l.keys().forEach(c=>{const u=t.get(c);if(u===null)return;let f=i.get(c)||it.empty();f=l.applyToLocalView(u,f),i.set(c,f);const p=(s.get(l.batchId)||Z()).add(c);s=s.insert(l.batchId,p)})}).next(()=>{const o=[],l=s.getReverseIterator();for(;l.hasNext();){const c=l.getNext(),u=c.key,f=c.value,p=Fd();f.forEach(m=>{if(!r.has(m)){const b=jd(t.get(m),i.get(m));b!==null&&p.set(m,b),r=r.add(m)}}),o.push(this.documentOverlayCache.saveOverlays(e,u,p))}return R.waitFor(o)}).next(()=>i)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(i=>this.recalculateAndSaveOverlays(e,i))}getDocumentsMatchingQuery(e,t,i,s){return Jw(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):Zw(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,i,s):this.getDocumentsMatchingCollectionQuery(e,t,i,s)}getNextDocuments(e,t,i,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,i,s).next(r=>{const o=s-r.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,i.largestBatchId,s-r.size):R.resolve(Fn());let l=ns,c=r;return o.next(u=>R.forEach(u,(f,p)=>(l<p.largestBatchId&&(l=p.largestBatchId),r.get(f)?R.resolve():this.remoteDocumentCache.getEntry(e,f).next(m=>{c=c.insert(f,m)}))).next(()=>this.populateOverlays(e,u,r)).next(()=>this.computeViews(e,c,u,Z())).next(f=>({batchId:l,changes:Md(f)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new B(t)).next(i=>{let s=ls();return i.isFoundDocument()&&(s=s.insert(i.key,i)),s})}getDocumentsMatchingCollectionGroupQuery(e,t,i,s){const r=t.collectionGroup;let o=ls();return this.indexManager.getCollectionParents(e,r).next(l=>R.forEach(l,c=>{const u=function(p,m){return new Xr(m,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)}(t,c.child(r));return this.getDocumentsMatchingCollectionQuery(e,u,i,s).next(f=>{f.forEach((p,m)=>{o=o.insert(p,m)})})}).next(()=>o))}getDocumentsMatchingCollectionQuery(e,t,i,s){let r;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,i.largestBatchId).next(o=>(r=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,i,r,s))).next(o=>{r.forEach((c,u)=>{const f=u.getKey();o.get(f)===null&&(o=o.insert(f,Fe.newInvalidDocument(f)))});let l=ls();return o.forEach((c,u)=>{const f=r.get(c);f!==void 0&&fs(f.mutation,u,it.empty(),ce.now()),Zr(t,u)&&(l=l.insert(c,u))}),l})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ZT{constructor(e){this.serializer=e,this.Nr=new Map,this.Br=new Map}getBundleMetadata(e,t){return R.resolve(this.Nr.get(t))}saveBundleMetadata(e,t){return this.Nr.set(t.id,function(s){return{id:s.id,version:s.version,createTime:_t(s.createTime)}}(t)),R.resolve()}getNamedQuery(e,t){return R.resolve(this.Br.get(t))}saveNamedQuery(e,t){return this.Br.set(t.name,function(s){return{name:s.name,query:HT(s.bundledQuery),readTime:_t(s.readTime)}}(t)),R.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eI{constructor(){this.overlays=new ye(B.comparator),this.Lr=new Map}getOverlay(e,t){return R.resolve(this.overlays.get(t))}getOverlays(e,t){const i=Fn();return R.forEach(t,s=>this.getOverlay(e,s).next(r=>{r!==null&&i.set(s,r)})).next(()=>i)}saveOverlays(e,t,i){return i.forEach((s,r)=>{this.St(e,t,r)}),R.resolve()}removeOverlaysForBatchId(e,t,i){const s=this.Lr.get(i);return s!==void 0&&(s.forEach(r=>this.overlays=this.overlays.remove(r)),this.Lr.delete(i)),R.resolve()}getOverlaysForCollection(e,t,i){const s=Fn(),r=t.length+1,o=new B(t.child("")),l=this.overlays.getIteratorFrom(o);for(;l.hasNext();){const c=l.getNext().value,u=c.getKey();if(!t.isPrefixOf(u.path))break;u.path.length===r&&c.largestBatchId>i&&s.set(c.getKey(),c)}return R.resolve(s)}getOverlaysForCollectionGroup(e,t,i,s){let r=new ye((u,f)=>u-f);const o=this.overlays.getIterator();for(;o.hasNext();){const u=o.getNext().value;if(u.getKey().getCollectionGroup()===t&&u.largestBatchId>i){let f=r.get(u.largestBatchId);f===null&&(f=Fn(),r=r.insert(u.largestBatchId,f)),f.set(u.getKey(),u)}}const l=Fn(),c=r.getIterator();for(;c.hasNext()&&(c.getNext().value.forEach((u,f)=>l.set(u,f)),!(l.size()>=s)););return R.resolve(l)}St(e,t,i){const s=this.overlays.get(i.key);if(s!==null){const o=this.Lr.get(s.largestBatchId).delete(i.key);this.Lr.set(s.largestBatchId,o)}this.overlays=this.overlays.insert(i.key,new yT(t,i));let r=this.Lr.get(t);r===void 0&&(r=Z(),this.Lr.set(t,r)),this.Lr.set(t,r.add(i.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tI{constructor(){this.sessionToken=Oe.EMPTY_BYTE_STRING}getSessionToken(e){return R.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,R.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yl{constructor(){this.kr=new we(Se.qr),this.Kr=new we(Se.Ur)}isEmpty(){return this.kr.isEmpty()}addReference(e,t){const i=new Se(e,t);this.kr=this.kr.add(i),this.Kr=this.Kr.add(i)}$r(e,t){e.forEach(i=>this.addReference(i,t))}removeReference(e,t){this.Wr(new Se(e,t))}Qr(e,t){e.forEach(i=>this.removeReference(i,t))}Gr(e){const t=new B(new le([])),i=new Se(t,e),s=new Se(t,e+1),r=[];return this.Kr.forEachInRange([i,s],o=>{this.Wr(o),r.push(o.key)}),r}zr(){this.kr.forEach(e=>this.Wr(e))}Wr(e){this.kr=this.kr.delete(e),this.Kr=this.Kr.delete(e)}jr(e){const t=new B(new le([])),i=new Se(t,e),s=new Se(t,e+1);let r=Z();return this.Kr.forEachInRange([i,s],o=>{r=r.add(o.key)}),r}containsKey(e){const t=new Se(e,0),i=this.kr.firstAfterOrEqual(t);return i!==null&&e.isEqual(i.key)}}class Se{constructor(e,t){this.key=e,this.Jr=t}static qr(e,t){return B.comparator(e.key,t.key)||J(e.Jr,t.Jr)}static Ur(e,t){return J(e.Jr,t.Jr)||B.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nI{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Yn=1,this.Hr=new we(Se.qr)}checkEmpty(e){return R.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,i,s){const r=this.Yn;this.Yn++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new _T(r,t,i,s);this.mutationQueue.push(o);for(const l of s)this.Hr=this.Hr.add(new Se(l.key,r)),this.indexManager.addToCollectionParentIndex(e,l.key.path.popLast());return R.resolve(o)}lookupMutationBatch(e,t){return R.resolve(this.Zr(t))}getNextMutationBatchAfterBatchId(e,t){const i=t+1,s=this.Xr(i),r=s<0?0:s;return R.resolve(this.mutationQueue.length>r?this.mutationQueue[r]:null)}getHighestUnacknowledgedBatchId(){return R.resolve(this.mutationQueue.length===0?Xa:this.Yn-1)}getAllMutationBatches(e){return R.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const i=new Se(t,0),s=new Se(t,Number.POSITIVE_INFINITY),r=[];return this.Hr.forEachInRange([i,s],o=>{const l=this.Zr(o.Jr);r.push(l)}),R.resolve(r)}getAllMutationBatchesAffectingDocumentKeys(e,t){let i=new we(J);return t.forEach(s=>{const r=new Se(s,0),o=new Se(s,Number.POSITIVE_INFINITY);this.Hr.forEachInRange([r,o],l=>{i=i.add(l.Jr)})}),R.resolve(this.Yr(i))}getAllMutationBatchesAffectingQuery(e,t){const i=t.path,s=i.length+1;let r=i;B.isDocumentKey(r)||(r=r.child(""));const o=new Se(new B(r),0);let l=new we(J);return this.Hr.forEachWhile(c=>{const u=c.key.path;return!!i.isPrefixOf(u)&&(u.length===s&&(l=l.add(c.Jr)),!0)},o),R.resolve(this.Yr(l))}Yr(e){const t=[];return e.forEach(i=>{const s=this.Zr(i);s!==null&&t.push(s)}),t}removeMutationBatch(e,t){se(this.ei(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let i=this.Hr;return R.forEach(t.mutations,s=>{const r=new Se(s.key,t.batchId);return i=i.delete(r),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)}).next(()=>{this.Hr=i})}nr(e){}containsKey(e,t){const i=new Se(t,0),s=this.Hr.firstAfterOrEqual(i);return R.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,R.resolve()}ei(e,t){return this.Xr(e)}Xr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Zr(e){const t=this.Xr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class iI{constructor(e){this.ti=e,this.docs=function(){return new ye(B.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const i=t.key,s=this.docs.get(i),r=s?s.size:0,o=this.ti(t);return this.docs=this.docs.insert(i,{document:t.mutableCopy(),size:o}),this.size+=o-r,this.indexManager.addToCollectionParentIndex(e,i.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const i=this.docs.get(t);return R.resolve(i?i.document.mutableCopy():Fe.newInvalidDocument(t))}getEntries(e,t){let i=xt();return t.forEach(s=>{const r=this.docs.get(s);i=i.insert(s,r?r.document.mutableCopy():Fe.newInvalidDocument(s))}),R.resolve(i)}getDocumentsMatchingQuery(e,t,i,s){let r=xt();const o=t.path,l=new B(o.child("__id-9223372036854775808__")),c=this.docs.getIteratorFrom(l);for(;c.hasNext();){const{key:u,value:{document:f}}=c.getNext();if(!o.isPrefixOf(u.path))break;u.path.length>o.length+1||Rw(Sw(f),i)<=0||(s.has(f.key)||Zr(t,f))&&(r=r.insert(f.key,f.mutableCopy()))}return R.resolve(r)}getAllFromCollectionGroup(e,t,i,s){q(9500)}ni(e,t){return R.forEach(this.docs,i=>t(i))}newChangeBuffer(e){return new sI(this)}getSize(e){return R.resolve(this.size)}}class sI extends YT{constructor(e){super(),this.Mr=e}applyChanges(e){const t=[];return this.changes.forEach((i,s)=>{s.isValidDocument()?t.push(this.Mr.addEntry(e,s)):this.Mr.removeEntry(i)}),R.waitFor(t)}getFromCache(e,t){return this.Mr.getEntry(e,t)}getAllFromCache(e,t){return this.Mr.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rI{constructor(e){this.persistence=e,this.ri=new Mn(t=>il(t),sl),this.lastRemoteSnapshotVersion=j.min(),this.highestTargetId=0,this.ii=0,this.si=new yl,this.targetCount=0,this.oi=Ti._r()}forEachTarget(e,t){return this.ri.forEach((i,s)=>t(s)),R.resolve()}getLastRemoteSnapshotVersion(e){return R.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return R.resolve(this.ii)}allocateTargetId(e){return this.highestTargetId=this.oi.next(),R.resolve(this.highestTargetId)}setTargetsMetadata(e,t,i){return i&&(this.lastRemoteSnapshotVersion=i),t>this.ii&&(this.ii=t),R.resolve()}lr(e){this.ri.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.oi=new Ti(t),this.highestTargetId=t),e.sequenceNumber>this.ii&&(this.ii=e.sequenceNumber)}addTargetData(e,t){return this.lr(t),this.targetCount+=1,R.resolve()}updateTargetData(e,t){return this.lr(t),R.resolve()}removeTargetData(e,t){return this.ri.delete(t.target),this.si.Gr(t.targetId),this.targetCount-=1,R.resolve()}removeTargets(e,t,i){let s=0;const r=[];return this.ri.forEach((o,l)=>{l.sequenceNumber<=t&&i.get(l.targetId)===null&&(this.ri.delete(o),r.push(this.removeMatchingKeysForTargetId(e,l.targetId)),s++)}),R.waitFor(r).next(()=>s)}getTargetCount(e){return R.resolve(this.targetCount)}getTargetData(e,t){const i=this.ri.get(t)||null;return R.resolve(i)}addMatchingKeys(e,t,i){return this.si.$r(t,i),R.resolve()}removeMatchingKeys(e,t,i){this.si.Qr(t,i);const s=this.persistence.referenceDelegate,r=[];return s&&t.forEach(o=>{r.push(s.markPotentiallyOrphaned(e,o))}),R.waitFor(r)}removeMatchingKeysForTargetId(e,t){return this.si.Gr(t),R.resolve()}getMatchingKeysForTargetId(e,t){const i=this.si.jr(t);return R.resolve(i)}containsKey(e,t){return R.resolve(this.si.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _f{constructor(e,t){this._i={},this.overlays={},this.ai=new Ur(0),this.ui=!1,this.ui=!0,this.ci=new tI,this.referenceDelegate=e(this),this.li=new rI(this),this.indexManager=new zT,this.remoteDocumentCache=function(s){return new iI(s)}(i=>this.referenceDelegate.hi(i)),this.serializer=new qT(t),this.Pi=new ZT(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ui=!1,Promise.resolve()}get started(){return this.ui}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new eI,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let i=this._i[e.toKey()];return i||(i=new nI(t,this.referenceDelegate),this._i[e.toKey()]=i),i}getGlobalsCache(){return this.ci}getTargetCache(){return this.li}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Pi}runTransaction(e,t,i){M("MemoryPersistence","Starting transaction:",e);const s=new oI(this.ai.next());return this.referenceDelegate.Ti(),i(s).next(r=>this.referenceDelegate.Ei(s).next(()=>r)).toPromise().then(r=>(s.raiseOnCommittedEvent(),r))}Ii(e,t){return R.or(Object.values(this._i).map(i=>()=>i.containsKey(e,t)))}}class oI extends kw{constructor(e){super(),this.currentSequenceNumber=e}}class vl{constructor(e){this.persistence=e,this.Ri=new yl,this.Ai=null}static Vi(e){return new vl(e)}get di(){if(this.Ai)return this.Ai;throw q(60996)}addReference(e,t,i){return this.Ri.addReference(i,t),this.di.delete(i.toString()),R.resolve()}removeReference(e,t,i){return this.Ri.removeReference(i,t),this.di.add(i.toString()),R.resolve()}markPotentiallyOrphaned(e,t){return this.di.add(t.toString()),R.resolve()}removeTarget(e,t){this.Ri.Gr(t.targetId).forEach(s=>this.di.add(s.toString()));const i=this.persistence.getTargetCache();return i.getMatchingKeysForTargetId(e,t.targetId).next(s=>{s.forEach(r=>this.di.add(r.toString()))}).next(()=>i.removeTargetData(e,t))}Ti(){this.Ai=new Set}Ei(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return R.forEach(this.di,i=>{const s=B.fromPath(i);return this.mi(e,s).next(r=>{r||t.removeEntry(s,j.min())})}).next(()=>(this.Ai=null,t.apply(e)))}updateLimboDocument(e,t){return this.mi(e,t).next(i=>{i?this.di.delete(t.toString()):this.di.add(t.toString())})}hi(e){return 0}mi(e,t){return R.or([()=>R.resolve(this.Ri.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Ii(e,t)])}}class lo{constructor(e,t){this.persistence=e,this.fi=new Mn(i=>Dw(i.path),(i,s)=>i.isEqual(s)),this.garbageCollector=QT(this,t)}static Vi(e,t){return new lo(e,t)}Ti(){}Ei(e){return R.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}dr(e){const t=this.pr(e);return this.persistence.getTargetCache().getTargetCount(e).next(i=>t.next(s=>i+s))}pr(e){let t=0;return this.mr(e,i=>{t++}).next(()=>t)}mr(e,t){return R.forEach(this.fi,(i,s)=>this.wr(e,i,s).next(r=>r?R.resolve():t(s)))}removeTargets(e,t,i){return this.persistence.getTargetCache().removeTargets(e,t,i)}removeOrphanedDocuments(e,t){let i=0;const s=this.persistence.getRemoteDocumentCache(),r=s.newChangeBuffer();return s.ni(e,o=>this.wr(e,o,t).next(l=>{l||(i++,r.removeEntry(o,j.min()))})).next(()=>r.apply(e)).next(()=>i)}markPotentiallyOrphaned(e,t){return this.fi.set(t,e.currentSequenceNumber),R.resolve()}removeTarget(e,t){const i=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,i)}addReference(e,t,i){return this.fi.set(i,e.currentSequenceNumber),R.resolve()}removeReference(e,t,i){return this.fi.set(i,e.currentSequenceNumber),R.resolve()}updateLimboDocument(e,t){return this.fi.set(t,e.currentSequenceNumber),R.resolve()}hi(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=Gr(e.data.value)),t}wr(e,t,i){return R.or([()=>this.persistence.Ii(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const s=this.fi.get(t);return R.resolve(s!==void 0&&s>i)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class El{constructor(e,t,i,s){this.targetId=e,this.fromCache=t,this.Ts=i,this.Es=s}static Is(e,t){let i=Z(),s=Z();for(const r of t.docChanges)switch(r.type){case 0:i=i.add(r.doc.key);break;case 1:s=s.add(r.doc.key)}return new El(e,t.fromCache,i,s)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aI{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lI{constructor(){this.Rs=!1,this.As=!1,this.Vs=100,this.ds=function(){return j_()?8:Nw(Le())>0?6:4}()}initialize(e,t){this.fs=e,this.indexManager=t,this.Rs=!0}getDocumentsMatchingQuery(e,t,i,s){const r={result:null};return this.gs(e,t).next(o=>{r.result=o}).next(()=>{if(!r.result)return this.ps(e,t,s,i).next(o=>{r.result=o})}).next(()=>{if(r.result)return;const o=new aI;return this.ys(e,t,o).next(l=>{if(r.result=l,this.As)return this.ws(e,t,o,l.size)})}).next(()=>r.result)}ws(e,t,i,s){return i.documentReadCount<this.Vs?(fi()<=Y.DEBUG&&M("QueryEngine","SDK will not create cache indexes for query:",vi(t),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),R.resolve()):(fi()<=Y.DEBUG&&M("QueryEngine","Query:",vi(t),"scans",i.documentReadCount,"local documents and returns",s,"documents as results."),i.documentReadCount>this.ds*s?(fi()<=Y.DEBUG&&M("QueryEngine","The SDK decides to create cache indexes for query:",vi(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,gt(t))):R.resolve())}gs(e,t){if(Dd(t))return R.resolve(null);let i=gt(t);return this.indexManager.getIndexType(e,i).next(s=>s===0?null:(t.limit!==null&&s===1&&(t=al(t,null,"F"),i=gt(t)),this.indexManager.getDocumentsMatchingTarget(e,i).next(r=>{const o=Z(...r);return this.fs.getDocuments(e,o).next(l=>this.indexManager.getMinOffset(e,i).next(c=>{const u=this.Ss(t,l);return this.bs(t,u,o,c.readTime)?this.gs(e,al(t,null,"F")):this.Ds(e,u,t,c)}))})))}ps(e,t,i,s){return Dd(t)||s.isEqual(j.min())?R.resolve(null):this.fs.getDocuments(e,i).next(r=>{const o=this.Ss(t,r);return this.bs(t,o,i,s)?R.resolve(null):(fi()<=Y.DEBUG&&M("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),vi(t)),this.Ds(e,o,t,Aw(s,ns)).next(l=>l))})}Ss(e,t){let i=new we(Vd(e));return t.forEach((s,r)=>{Zr(e,r)&&(i=i.add(r))}),i}bs(e,t,i,s){if(e.limit===null)return!1;if(i.size!==t.size)return!0;const r=e.limitType==="F"?t.last():t.first();return!!r&&(r.hasPendingWrites||r.version.compareTo(s)>0)}ys(e,t,i){return fi()<=Y.DEBUG&&M("QueryEngine","Using full collection scan to execute query:",vi(t)),this.fs.getDocumentsMatchingQuery(e,t,Zt.min(),i)}Ds(e,t,i,s){return this.fs.getDocumentsMatchingQuery(e,i,s).next(r=>(t.forEach(o=>{r=r.insert(o.key,o)}),r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wl="LocalStore",cI=3e8;class uI{constructor(e,t,i,s){this.persistence=e,this.Cs=t,this.serializer=s,this.vs=new ye(J),this.Fs=new Mn(r=>il(r),sl),this.Ms=new Map,this.xs=e.getRemoteDocumentCache(),this.li=e.getTargetCache(),this.Pi=e.getBundleCache(),this.Os(i)}Os(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new JT(this.xs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.xs.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.vs))}}function hI(n,e,t,i){return new uI(n,e,t,i)}async function yf(n,e){const t=$(n);return await t.persistence.runTransaction("Handle user change","readonly",i=>{let s;return t.mutationQueue.getAllMutationBatches(i).next(r=>(s=r,t.Os(e),t.mutationQueue.getAllMutationBatches(i))).next(r=>{const o=[],l=[];let c=Z();for(const u of s){o.push(u.batchId);for(const f of u.mutations)c=c.add(f.key)}for(const u of r){l.push(u.batchId);for(const f of u.mutations)c=c.add(f.key)}return t.localDocuments.getDocuments(i,c).next(u=>({Ns:u,removedBatchIds:o,addedBatchIds:l}))})})}function dI(n,e){const t=$(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",i=>{const s=e.batch.keys(),r=t.xs.newChangeBuffer({trackRemovals:!0});return function(l,c,u,f){const p=u.batch,m=p.keys();let b=R.resolve();return m.forEach(S=>{b=b.next(()=>f.getEntry(c,S)).next(N=>{const P=u.docVersions.get(S);se(P!==null,48541),N.version.compareTo(P)<0&&(p.applyToRemoteDocument(N,u),N.isValidDocument()&&(N.setReadTime(u.commitVersion),f.addEntry(N)))})}),b.next(()=>l.mutationQueue.removeMutationBatch(c,p))}(t,i,e,r).next(()=>r.apply(i)).next(()=>t.mutationQueue.performConsistencyCheck(i)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(i,s,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(i,function(l){let c=Z();for(let u=0;u<l.mutationResults.length;++u)l.mutationResults[u].transformResults.length>0&&(c=c.add(l.batch.mutations[u].key));return c}(e))).next(()=>t.localDocuments.getDocuments(i,s))})}function vf(n){const e=$(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.li.getLastRemoteSnapshotVersion(t))}function fI(n,e){const t=$(n),i=e.snapshotVersion;let s=t.vs;return t.persistence.runTransaction("Apply remote event","readwrite-primary",r=>{const o=t.xs.newChangeBuffer({trackRemovals:!0});s=t.vs;const l=[];e.targetChanges.forEach((f,p)=>{const m=s.get(p);if(!m)return;l.push(t.li.removeMatchingKeys(r,f.removedDocuments,p).next(()=>t.li.addMatchingKeys(r,f.addedDocuments,p)));let b=m.withSequenceNumber(r.currentSequenceNumber);e.targetMismatches.get(p)!==null?b=b.withResumeToken(Oe.EMPTY_BYTE_STRING,j.min()).withLastLimboFreeSnapshotVersion(j.min()):f.resumeToken.approximateByteSize()>0&&(b=b.withResumeToken(f.resumeToken,i)),s=s.insert(p,b),function(N,P,D){return N.resumeToken.approximateByteSize()===0||P.snapshotVersion.toMicroseconds()-N.snapshotVersion.toMicroseconds()>=cI?!0:D.addedDocuments.size+D.modifiedDocuments.size+D.removedDocuments.size>0}(m,b,f)&&l.push(t.li.updateTargetData(r,b))});let c=xt(),u=Z();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&l.push(t.persistence.referenceDelegate.updateLimboDocument(r,f))}),l.push(pI(r,o,e.documentUpdates).next(f=>{c=f.Bs,u=f.Ls})),!i.isEqual(j.min())){const f=t.li.getLastRemoteSnapshotVersion(r).next(p=>t.li.setTargetsMetadata(r,r.currentSequenceNumber,i));l.push(f)}return R.waitFor(l).next(()=>o.apply(r)).next(()=>t.localDocuments.getLocalViewOfDocuments(r,c,u)).next(()=>c)}).then(r=>(t.vs=s,r))}function pI(n,e,t){let i=Z(),s=Z();return t.forEach(r=>i=i.add(r)),e.getEntries(n,i).next(r=>{let o=xt();return t.forEach((l,c)=>{const u=r.get(l);c.isFoundDocument()!==u.isFoundDocument()&&(s=s.add(l)),c.isNoDocument()&&c.version.isEqual(j.min())?(e.removeEntry(l,c.readTime),o=o.insert(l,c)):!u.isValidDocument()||c.version.compareTo(u.version)>0||c.version.compareTo(u.version)===0&&u.hasPendingWrites?(e.addEntry(c),o=o.insert(l,c)):M(wl,"Ignoring outdated watch update for ",l,". Current version:",u.version," Watch version:",c.version)}),{Bs:o,Ls:s}})}function gI(n,e){const t=$(n);return t.persistence.runTransaction("Get next mutation batch","readonly",i=>(e===void 0&&(e=Xa),t.mutationQueue.getNextMutationBatchAfterBatchId(i,e)))}function mI(n,e){const t=$(n);return t.persistence.runTransaction("Allocate target","readwrite",i=>{let s;return t.li.getTargetData(i,e).next(r=>r?(s=r,R.resolve(s)):t.li.allocateTargetId(i).next(o=>(s=new rn(e,o,"TargetPurposeListen",i.currentSequenceNumber),t.li.addTargetData(i,s).next(()=>s))))}).then(i=>{const s=t.vs.get(i.targetId);return(s===null||i.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.vs=t.vs.insert(i.targetId,i),t.Fs.set(e,i.targetId)),i})}async function Tl(n,e,t){const i=$(n),s=i.vs.get(e),r=t?"readwrite":"readwrite-primary";try{t||await i.persistence.runTransaction("Release target",r,o=>i.persistence.referenceDelegate.removeTarget(o,s))}catch(o){if(!mi(o))throw o;M(wl,`Failed to update sequence numbers for target ${e}: ${o}`)}i.vs=i.vs.remove(e),i.Fs.delete(s.target)}function Ef(n,e,t){const i=$(n);let s=j.min(),r=Z();return i.persistence.runTransaction("Execute query","readwrite",o=>function(c,u,f){const p=$(c),m=p.Fs.get(f);return m!==void 0?R.resolve(p.vs.get(m)):p.li.getTargetData(u,f)}(i,o,gt(e)).next(l=>{if(l)return s=l.lastLimboFreeSnapshotVersion,i.li.getMatchingKeysForTargetId(o,l.targetId).next(c=>{r=c})}).next(()=>i.Cs.getDocumentsMatchingQuery(o,e,t?s:j.min(),t?r:Z())).next(l=>(_I(i,tT(e),l),{documents:l,ks:r})))}function _I(n,e,t){let i=n.Ms.get(e)||j.min();t.forEach((s,r)=>{r.readTime.compareTo(i)>0&&(i=r.readTime)}),n.Ms.set(e,i)}class wf{constructor(){this.activeTargetIds=aT()}Qs(e){this.activeTargetIds=this.activeTargetIds.add(e)}Gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Ws(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class yI{constructor(){this.vo=new wf,this.Fo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,i){}addLocalQueryTarget(e,t=!0){return t&&this.vo.Qs(e),this.Fo[e]||"not-current"}updateQueryState(e,t,i){this.Fo[e]=t}removeLocalQueryTarget(e){this.vo.Gs(e)}isLocalQueryTarget(e){return this.vo.activeTargetIds.has(e)}clearQueryState(e){delete this.Fo[e]}getAllActiveQueryTargets(){return this.vo.activeTargetIds}isActiveQueryTarget(e){return this.vo.activeTargetIds.has(e)}start(){return this.vo=new wf,Promise.resolve()}handleUserChange(e,t,i){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vI{Mo(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Tf="ConnectivityMonitor";class If{constructor(){this.xo=()=>this.Oo(),this.No=()=>this.Bo(),this.Lo=[],this.ko()}Mo(e){this.Lo.push(e)}shutdown(){window.removeEventListener("online",this.xo),window.removeEventListener("offline",this.No)}ko(){window.addEventListener("online",this.xo),window.addEventListener("offline",this.No)}Oo(){M(Tf,"Network connectivity changed: AVAILABLE");for(const e of this.Lo)e(0)}Bo(){M(Tf,"Network connectivity changed: UNAVAILABLE");for(const e of this.Lo)e(1)}static v(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let co=null;function Il(){return co===null?co=function(){return 268435456+Math.round(2147483648*Math.random())}():co++,"0x"+co.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bl="RestConnection",EI={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class wI{get qo(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",i=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Ko=t+"://"+e.host,this.Uo=`projects/${i}/databases/${s}`,this.$o=this.databaseId.database===Wr?`project_id=${i}`:`project_id=${i}&database_id=${s}`}Wo(e,t,i,s,r){const o=Il(),l=this.Qo(e,t.toUriEncodedString());M(bl,`Sending RPC '${e}' ${o}:`,l,i);const c={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.$o};this.Go(c,s,r);const{host:u}=new URL(l),f=Pn(u);return this.zo(e,l,c,i,f).then(p=>(M(bl,`Received RPC '${e}' ${o}: `,p),p),p=>{throw Vn(bl,`RPC '${e}' ${o} failed with error: `,p,"url: ",l,"request:",i),p})}jo(e,t,i,s,r,o){return this.Wo(e,t,i,s,r)}Go(e,t,i){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+di}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((s,r)=>e[r]=s),i&&i.headers.forEach((s,r)=>e[r]=s)}Qo(e,t){const i=EI[e];let s=`${this.Ko}/v1/${t}:${i}`;return this.databaseInfo.apiKey&&(s=`${s}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),s}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class TI{constructor(e){this.Jo=e.Jo,this.Ho=e.Ho}Zo(e){this.Xo=e}Yo(e){this.e_=e}t_(e){this.n_=e}onMessage(e){this.r_=e}close(){this.Ho()}send(e){this.Jo(e)}i_(){this.Xo()}s_(){this.e_()}o_(e){this.n_(e)}__(e){this.r_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ue="WebChannelConnection",_s=(n,e,t)=>{n.listen(e,i=>{try{t(i)}catch(s){setTimeout(()=>{throw s},0)}})};class Ii extends wI{constructor(e){super(e),this.a_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static u_(){if(!Ii.c_){const e=Qh();_s(e,Kh.STAT_EVENT,t=>{t.stat===ja.PROXY?M(Ue,"STAT_EVENT: detected buffering proxy"):t.stat===ja.NOPROXY&&M(Ue,"STAT_EVENT: detected no buffering proxy")}),Ii.c_=!0}}zo(e,t,i,s,r){const o=Il();return new Promise((l,c)=>{const u=new $h;u.setWithCredentials(!0),u.listenOnce(Gh.COMPLETE,()=>{try{switch(u.getLastErrorCode()){case Fr.NO_ERROR:const p=u.getResponseJson();M(Ue,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(p)),l(p);break;case Fr.TIMEOUT:M(Ue,`RPC '${e}' ${o} timed out`),c(new F(k.DEADLINE_EXCEEDED,"Request time out"));break;case Fr.HTTP_ERROR:const m=u.getStatus();if(M(Ue,`RPC '${e}' ${o} failed with status:`,m,"response text:",u.getResponseText()),m>0){let b=u.getResponseJson();Array.isArray(b)&&(b=b[0]);const S=b==null?void 0:b.error;if(S&&S.status&&S.message){const N=function(D){const V=D.toLowerCase().replace(/_/g,"-");return Object.values(k).indexOf(V)>=0?V:k.UNKNOWN}(S.status);c(new F(N,S.message))}else c(new F(k.UNKNOWN,"Server responded with status "+u.getStatus()))}else c(new F(k.UNAVAILABLE,"Connection failed."));break;default:q(9055,{l_:e,streamId:o,h_:u.getLastErrorCode(),P_:u.getLastError()})}}finally{M(Ue,`RPC '${e}' ${o} completed.`)}});const f=JSON.stringify(s);M(Ue,`RPC '${e}' ${o} sending request:`,s),u.send(t,"POST",f,i,15)})}T_(e,t,i){const s=Il(),r=[this.Ko,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=this.createWebChannelTransport(),l={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},c=this.longPollingOptions.timeoutSeconds;c!==void 0&&(l.longPollingTimeout=Math.round(1e3*c)),this.useFetchStreams&&(l.useFetchStreams=!0),this.Go(l.initMessageHeaders,t,i),l.encodeInitMessageHeaders=!0;const u=r.join("");M(Ue,`Creating RPC '${e}' stream ${s}: ${u}`,l);const f=o.createWebChannel(u,l);this.E_(f);let p=!1,m=!1;const b=new TI({Jo:S=>{m?M(Ue,`Not sending because RPC '${e}' stream ${s} is closed:`,S):(p||(M(Ue,`Opening RPC '${e}' stream ${s} transport.`),f.open(),p=!0),M(Ue,`RPC '${e}' stream ${s} sending:`,S),f.send(S))},Ho:()=>f.close()});return _s(f,es.EventType.OPEN,()=>{m||(M(Ue,`RPC '${e}' stream ${s} transport opened.`),b.i_())}),_s(f,es.EventType.CLOSE,()=>{m||(m=!0,M(Ue,`RPC '${e}' stream ${s} transport closed`),b.o_(),this.I_(f))}),_s(f,es.EventType.ERROR,S=>{m||(m=!0,Vn(Ue,`RPC '${e}' stream ${s} transport errored. Name:`,S.name,"Message:",S.message),b.o_(new F(k.UNAVAILABLE,"The operation could not be completed")))}),_s(f,es.EventType.MESSAGE,S=>{var N;if(!m){const P=S.data[0];se(!!P,16349);const D=P,V=(D==null?void 0:D.error)||((N=D[0])==null?void 0:N.error);if(V){M(Ue,`RPC '${e}' stream ${s} received error:`,V);const U=V.status;let W=function(w){const _=ve[w];if(_!==void 0)return Yd(_)}(U),te=V.message;U==="NOT_FOUND"&&te.includes("database")&&te.includes("does not exist")&&te.includes(this.databaseId.database)&&Vn(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),W===void 0&&(W=k.INTERNAL,te="Unknown error status: "+U+" with message "+V.message),m=!0,b.o_(new F(W,te)),f.close()}else M(Ue,`RPC '${e}' stream ${s} received:`,P),b.__(P)}}),Ii.u_(),setTimeout(()=>{b.s_()},0),b}terminate(){this.a_.forEach(e=>e.close()),this.a_=[]}E_(e){this.a_.push(e)}I_(e){this.a_=this.a_.filter(t=>t===e)}Go(e,t,i){super.Go(e,t,i),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return Yh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function II(n){return new Ii(n)}function Cl(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function uo(n){return new ST(n,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Ii.c_=!1;class bf{constructor(e,t,i=1e3,s=1.5,r=6e4){this.Ci=e,this.timerId=t,this.R_=i,this.A_=s,this.V_=r,this.d_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.d_=0}g_(){this.d_=this.V_}p_(e){this.cancel();const t=Math.floor(this.d_+this.y_()),i=Math.max(0,Date.now()-this.f_),s=Math.max(0,t-i);s>0&&M("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.d_} ms, delay with jitter: ${t} ms, last attempt: ${i} ms ago)`),this.m_=this.Ci.enqueueAfterDelay(this.timerId,s,()=>(this.f_=Date.now(),e())),this.d_*=this.A_,this.d_<this.R_&&(this.d_=this.R_),this.d_>this.V_&&(this.d_=this.V_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.d_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cf="PersistentStream";class Af{constructor(e,t,i,s,r,o,l,c){this.Ci=e,this.S_=i,this.b_=s,this.connection=r,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=l,this.listener=c,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new bf(e,t)}x_(){return this.state===1||this.state===5||this.O_()}O_(){return this.state===2||this.state===3}start(){this.F_=0,this.state!==4?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&this.C_===null&&(this.C_=this.Ci.enqueueAfterDelay(this.S_,6e4,()=>this.k_()))}q_(e){this.K_(),this.stream.send(e)}async k_(){if(this.O_())return this.close(0)}K_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,t){this.K_(),this.U_(),this.M_.cancel(),this.D_++,e!==4?this.M_.reset():t&&t.code===k.RESOURCE_EXHAUSTED?(kt(t.toString()),kt("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):t&&t.code===k.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.W_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.t_(t)}W_(){}auth(){this.state=1;const e=this.Q_(this.D_),t=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([i,s])=>{this.D_===t&&this.G_(i,s)},i=>{e(()=>{const s=new F(k.UNKNOWN,"Fetching auth token failed: "+i.message);return this.z_(s)})})}G_(e,t){const i=this.Q_(this.D_);this.stream=this.j_(e,t),this.stream.Zo(()=>{i(()=>this.listener.Zo())}),this.stream.Yo(()=>{i(()=>(this.state=2,this.v_=this.Ci.enqueueAfterDelay(this.b_,1e4,()=>(this.O_()&&(this.state=3),Promise.resolve())),this.listener.Yo()))}),this.stream.t_(s=>{i(()=>this.z_(s))}),this.stream.onMessage(s=>{i(()=>++this.F_==1?this.J_(s):this.onNext(s))})}N_(){this.state=5,this.M_.p_(async()=>{this.state=0,this.start()})}z_(e){return M(Cf,`close with error: ${e}`),this.stream=null,this.close(4,e)}Q_(e){return t=>{this.Ci.enqueueAndForget(()=>this.D_===e?t():(M(Cf,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class bI extends Af{constructor(e,t,i,s,r,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,i,s,o),this.serializer=r}j_(e,t){return this.connection.T_("Listen",e,t)}J_(e){return this.onNext(e)}onNext(e){this.M_.reset();const t=kT(this.serializer,e),i=function(r){if(!("targetChange"in r))return j.min();const o=r.targetChange;return o.targetIds&&o.targetIds.length?j.min():o.readTime?_t(o.readTime):j.min()}(e);return this.listener.H_(t,i)}Z_(e){const t={};t.database=_l(this.serializer),t.addTarget=function(r,o){let l;const c=o.target;if(l=rl(c)?{documents:DT(r,c)}:{query:OT(r,c).ft},l.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){l.resumeToken=sf(r,o.resumeToken);const u=dl(r,o.expectedCount);u!==null&&(l.expectedCount=u)}else if(o.snapshotVersion.compareTo(j.min())>0){l.readTime=ao(r,o.snapshotVersion.toTimestamp());const u=dl(r,o.expectedCount);u!==null&&(l.expectedCount=u)}return l}(this.serializer,e);const i=LT(this.serializer,e);i&&(t.labels=i),this.q_(t)}X_(e){const t={};t.database=_l(this.serializer),t.removeTarget=e,this.q_(t)}}class CI extends Af{constructor(e,t,i,s,r,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,i,s,o),this.serializer=r}get Y_(){return this.F_>0}start(){this.lastStreamToken=void 0,super.start()}W_(){this.Y_&&this.ea([])}j_(e,t){return this.connection.T_("Write",e,t)}J_(e){return se(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,se(!e.writeResults||e.writeResults.length===0,55816),this.listener.ta()}onNext(e){se(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.M_.reset();const t=xT(e.writeResults,e.commitTime),i=_t(e.commitTime);return this.listener.na(i,t)}ra(){const e={};e.database=_l(this.serializer),this.q_(e)}ea(e){const t={streamToken:this.lastStreamToken,writes:e.map(i=>NT(this.serializer,i))};this.q_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AI{}class SI extends AI{constructor(e,t,i,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=i,this.serializer=s,this.ia=!1}sa(){if(this.ia)throw new F(k.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(e,t,i,s){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([r,o])=>this.connection.Wo(e,pl(t,i),s,r,o)).catch(r=>{throw r.name==="FirebaseError"?(r.code===k.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),r):new F(k.UNKNOWN,r.toString())})}jo(e,t,i,s,r){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,l])=>this.connection.jo(e,pl(t,i),s,o,l,r)).catch(o=>{throw o.name==="FirebaseError"?(o.code===k.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new F(k.UNKNOWN,o.toString())})}terminate(){this.ia=!0,this.connection.terminate()}}function RI(n,e,t,i){return new SI(n,e,t,i)}class PI{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){this.oa===0&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve())))}ha(e){this.state==="Online"?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ca("Offline")))}set(e){this.Pa(),this.oa=0,e==="Online"&&(this.aa=!1),this.ca(e)}ca(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}la(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.aa?(kt(t),this.aa=!1):M("OnlineStateTracker",t)}Pa(){this._a!==null&&(this._a.cancel(),this._a=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bn="RemoteStore";class kI{constructor(e,t,i,s,r){this.localStore=e,this.datastore=t,this.asyncQueue=i,this.remoteSyncer={},this.Ta=[],this.Ea=new Map,this.Ia=new Set,this.Ra=[],this.Aa=r,this.Aa.Mo(o=>{i.enqueueAndForget(async()=>{qn(this)&&(M(Bn,"Restarting streams for network reachability change."),await async function(c){const u=$(c);u.Ia.add(4),await ys(u),u.Va.set("Unknown"),u.Ia.delete(4),await ho(u)}(this))})}),this.Va=new PI(i,s)}}async function ho(n){if(qn(n))for(const e of n.Ra)await e(!0)}async function ys(n){for(const e of n.Ra)await e(!1)}function Sf(n,e){const t=$(n);t.Ea.has(e.targetId)||(t.Ea.set(e.targetId,e),Pl(t)?Rl(t):bi(t).O_()&&Sl(t,e))}function Al(n,e){const t=$(n),i=bi(t);t.Ea.delete(e),i.O_()&&Rf(t,e),t.Ea.size===0&&(i.O_()?i.L_():qn(t)&&t.Va.set("Unknown"))}function Sl(n,e){if(n.da.$e(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(j.min())>0){const t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}bi(n).Z_(e)}function Rf(n,e){n.da.$e(e),bi(n).X_(e)}function Rl(n){n.da=new IT({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),At:e=>n.Ea.get(e)||null,ht:()=>n.datastore.serializer.databaseId}),bi(n).start(),n.Va.ua()}function Pl(n){return qn(n)&&!bi(n).x_()&&n.Ea.size>0}function qn(n){return $(n).Ia.size===0}function Pf(n){n.da=void 0}async function NI(n){n.Va.set("Online")}async function xI(n){n.Ea.forEach((e,t)=>{Sl(n,e)})}async function DI(n,e){Pf(n),Pl(n)?(n.Va.ha(e),Rl(n)):n.Va.set("Unknown")}async function OI(n,e,t){if(n.Va.set("Online"),e instanceof ef&&e.state===2&&e.cause)try{await async function(s,r){const o=r.cause;for(const l of r.targetIds)s.Ea.has(l)&&(await s.remoteSyncer.rejectListen(l,o),s.Ea.delete(l),s.da.removeTarget(l))}(n,e)}catch(i){M(Bn,"Failed to remove targets %s: %s ",e.targetIds.join(","),i),await fo(n,i)}else if(e instanceof ro?n.da.Xe(e):e instanceof Zd?n.da.st(e):n.da.tt(e),!t.isEqual(j.min()))try{const i=await vf(n.localStore);t.compareTo(i)>=0&&await function(r,o){const l=r.da.Tt(o);return l.targetChanges.forEach((c,u)=>{if(c.resumeToken.approximateByteSize()>0){const f=r.Ea.get(u);f&&r.Ea.set(u,f.withResumeToken(c.resumeToken,o))}}),l.targetMismatches.forEach((c,u)=>{const f=r.Ea.get(c);if(!f)return;r.Ea.set(c,f.withResumeToken(Oe.EMPTY_BYTE_STRING,f.snapshotVersion)),Rf(r,c);const p=new rn(f.target,c,u,f.sequenceNumber);Sl(r,p)}),r.remoteSyncer.applyRemoteEvent(l)}(n,t)}catch(i){M(Bn,"Failed to raise snapshot:",i),await fo(n,i)}}async function fo(n,e,t){if(!mi(e))throw e;n.Ia.add(1),await ys(n),n.Va.set("Offline"),t||(t=()=>vf(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{M(Bn,"Retrying IndexedDB access"),await t(),n.Ia.delete(1),await ho(n)})}function kf(n,e){return e().catch(t=>fo(n,t,e))}async function po(n){const e=$(n),t=on(e);let i=e.Ta.length>0?e.Ta[e.Ta.length-1].batchId:Xa;for(;VI(e);)try{const s=await gI(e.localStore,i);if(s===null){e.Ta.length===0&&t.L_();break}i=s.batchId,LI(e,s)}catch(s){await fo(e,s)}Nf(e)&&xf(e)}function VI(n){return qn(n)&&n.Ta.length<10}function LI(n,e){n.Ta.push(e);const t=on(n);t.O_()&&t.Y_&&t.ea(e.mutations)}function Nf(n){return qn(n)&&!on(n).x_()&&n.Ta.length>0}function xf(n){on(n).start()}async function MI(n){on(n).ra()}async function FI(n){const e=on(n);for(const t of n.Ta)e.ea(t.mutations)}async function UI(n,e,t){const i=n.Ta.shift(),s=ul.from(i,e,t);await kf(n,()=>n.remoteSyncer.applySuccessfulWrite(s)),await po(n)}async function BI(n,e){e&&on(n).Y_&&await async function(i,s){if(function(o){return ET(o)&&o!==k.ABORTED}(s.code)){const r=i.Ta.shift();on(i).B_(),await kf(i,()=>i.remoteSyncer.rejectFailedWrite(r.batchId,s)),await po(i)}}(n,e),Nf(n)&&xf(n)}async function Df(n,e){const t=$(n);t.asyncQueue.verifyOperationInProgress(),M(Bn,"RemoteStore received new credentials");const i=qn(t);t.Ia.add(3),await ys(t),i&&t.Va.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.Ia.delete(3),await ho(t)}async function qI(n,e){const t=$(n);e?(t.Ia.delete(2),await ho(t)):e||(t.Ia.add(2),await ys(t),t.Va.set("Unknown"))}function bi(n){return n.ma||(n.ma=function(t,i,s){const r=$(t);return r.sa(),new bI(i,r.connection,r.authCredentials,r.appCheckCredentials,r.serializer,s)}(n.datastore,n.asyncQueue,{Zo:NI.bind(null,n),Yo:xI.bind(null,n),t_:DI.bind(null,n),H_:OI.bind(null,n)}),n.Ra.push(async e=>{e?(n.ma.B_(),Pl(n)?Rl(n):n.Va.set("Unknown")):(await n.ma.stop(),Pf(n))})),n.ma}function on(n){return n.fa||(n.fa=function(t,i,s){const r=$(t);return r.sa(),new CI(i,r.connection,r.authCredentials,r.appCheckCredentials,r.serializer,s)}(n.datastore,n.asyncQueue,{Zo:()=>Promise.resolve(),Yo:MI.bind(null,n),t_:BI.bind(null,n),ta:FI.bind(null,n),na:UI.bind(null,n)}),n.Ra.push(async e=>{e?(n.fa.B_(),await po(n)):(await n.fa.stop(),n.Ta.length>0&&(M(Bn,`Stopping write stream with ${n.Ta.length} pending writes`),n.Ta=[]))})),n.fa}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kl{constructor(e,t,i,s,r){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=i,this.op=s,this.removalCallback=r,this.deferred=new Nt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,i,s,r){const o=Date.now()+i,l=new kl(e,t,o,s,r);return l.start(i),l}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new F(k.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Nl(n,e){if(kt("AsyncQueue",`${e}: ${n}`),mi(n))return new F(k.UNAVAILABLE,`${e}: ${n}`);throw n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ci{static emptySet(e){return new Ci(e.comparator)}constructor(e){this.comparator=e?(t,i)=>e(t,i)||B.comparator(t.key,i.key):(t,i)=>B.comparator(t.key,i.key),this.keyedMap=ls(),this.sortedSet=new ye(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,i)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof Ci)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),i=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,r=i.getNext().key;if(!s.isEqual(r))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const i=new Ci;return i.comparator=this.comparator,i.keyedMap=e,i.sortedSet=t,i}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Of{constructor(){this.ga=new ye(B.comparator)}track(e){const t=e.doc.key,i=this.ga.get(t);i?e.type!==0&&i.type===3?this.ga=this.ga.insert(t,e):e.type===3&&i.type!==1?this.ga=this.ga.insert(t,{type:i.type,doc:e.doc}):e.type===2&&i.type===2?this.ga=this.ga.insert(t,{type:2,doc:e.doc}):e.type===2&&i.type===0?this.ga=this.ga.insert(t,{type:0,doc:e.doc}):e.type===1&&i.type===0?this.ga=this.ga.remove(t):e.type===1&&i.type===2?this.ga=this.ga.insert(t,{type:1,doc:i.doc}):e.type===0&&i.type===1?this.ga=this.ga.insert(t,{type:2,doc:e.doc}):q(63341,{Vt:e,pa:i}):this.ga=this.ga.insert(t,e)}ya(){const e=[];return this.ga.inorderTraversal((t,i)=>{e.push(i)}),e}}class Ai{constructor(e,t,i,s,r,o,l,c,u){this.query=e,this.docs=t,this.oldDocs=i,this.docChanges=s,this.mutatedKeys=r,this.fromCache=o,this.syncStateChanged=l,this.excludesMetadataChanges=c,this.hasCachedResults=u}static fromInitialDocuments(e,t,i,s,r){const o=[];return t.forEach(l=>{o.push({type:0,doc:l})}),new Ai(e,t,Ci.emptySet(t),o,i,s,!0,!1,r)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Jr(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,i=e.docChanges;if(t.length!==i.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==i[s].type||!t[s].doc.isEqual(i[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class HI{constructor(){this.wa=void 0,this.Sa=[]}ba(){return this.Sa.some(e=>e.Da())}}class zI{constructor(){this.queries=Vf(),this.onlineState="Unknown",this.Ca=new Set}terminate(){(function(t,i){const s=$(t),r=s.queries;s.queries=Vf(),r.forEach((o,l)=>{for(const c of l.Sa)c.onError(i)})})(this,new F(k.ABORTED,"Firestore shutting down"))}}function Vf(){return new Mn(n=>Od(n),Jr)}async function Lf(n,e){const t=$(n);let i=3;const s=e.query;let r=t.queries.get(s);r?!r.ba()&&e.Da()&&(i=2):(r=new HI,i=e.Da()?0:1);try{switch(i){case 0:r.wa=await t.onListen(s,!0);break;case 1:r.wa=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(o){const l=Nl(o,`Initialization of query '${vi(e.query)}' failed`);return void e.onError(l)}t.queries.set(s,r),r.Sa.push(e),e.va(t.onlineState),r.wa&&e.Fa(r.wa)&&xl(t)}async function Mf(n,e){const t=$(n),i=e.query;let s=3;const r=t.queries.get(i);if(r){const o=r.Sa.indexOf(e);o>=0&&(r.Sa.splice(o,1),r.Sa.length===0?s=e.Da()?0:1:!r.ba()&&e.Da()&&(s=2))}switch(s){case 0:return t.queries.delete(i),t.onUnlisten(i,!0);case 1:return t.queries.delete(i),t.onUnlisten(i,!1);case 2:return t.onLastRemoteStoreUnlisten(i);default:return}}function WI(n,e){const t=$(n);let i=!1;for(const s of e){const r=s.query,o=t.queries.get(r);if(o){for(const l of o.Sa)l.Fa(s)&&(i=!0);o.wa=s}}i&&xl(t)}function jI(n,e,t){const i=$(n),s=i.queries.get(e);if(s)for(const r of s.Sa)r.onError(t);i.queries.delete(e)}function xl(n){n.Ca.forEach(e=>{e.next()})}var Dl,Ff;(Ff=Dl||(Dl={})).Ma="default",Ff.Cache="cache";class Uf{constructor(e,t,i){this.query=e,this.xa=t,this.Oa=!1,this.Na=null,this.onlineState="Unknown",this.options=i||{}}Fa(e){if(!this.options.includeMetadataChanges){const i=[];for(const s of e.docChanges)s.type!==3&&i.push(s);e=new Ai(e.query,e.docs,e.oldDocs,i,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Oa?this.Ba(e)&&(this.xa.next(e),t=!0):this.La(e,this.onlineState)&&(this.ka(e),t=!0),this.Na=e,t}onError(e){this.xa.error(e)}va(e){this.onlineState=e;let t=!1;return this.Na&&!this.Oa&&this.La(this.Na,e)&&(this.ka(this.Na),t=!0),t}La(e,t){if(!e.fromCache||!this.Da())return!0;const i=t!=="Offline";return(!this.options.qa||!i)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Ba(e){if(e.docChanges.length>0)return!0;const t=this.Na&&this.Na.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}ka(e){e=Ai.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Oa=!0,this.xa.next(e)}Da(){return this.options.source!==Dl.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bf{constructor(e){this.key=e}}class qf{constructor(e){this.key=e}}class $I{constructor(e,t){this.query=e,this.Za=t,this.Xa=null,this.hasCachedResults=!1,this.current=!1,this.Ya=Z(),this.mutatedKeys=Z(),this.eu=Vd(e),this.tu=new Ci(this.eu)}get nu(){return this.Za}ru(e,t){const i=t?t.iu:new Of,s=t?t.tu:this.tu;let r=t?t.mutatedKeys:this.mutatedKeys,o=s,l=!1;const c=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,u=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(e.inorderTraversal((f,p)=>{const m=s.get(f),b=Zr(this.query,p)?p:null,S=!!m&&this.mutatedKeys.has(m.key),N=!!b&&(b.hasLocalMutations||this.mutatedKeys.has(b.key)&&b.hasCommittedMutations);let P=!1;m&&b?m.data.isEqual(b.data)?S!==N&&(i.track({type:3,doc:b}),P=!0):this.su(m,b)||(i.track({type:2,doc:b}),P=!0,(c&&this.eu(b,c)>0||u&&this.eu(b,u)<0)&&(l=!0)):!m&&b?(i.track({type:0,doc:b}),P=!0):m&&!b&&(i.track({type:1,doc:m}),P=!0,(c||u)&&(l=!0)),P&&(b?(o=o.add(b),r=N?r.add(f):r.delete(f)):(o=o.delete(f),r=r.delete(f)))}),this.query.limit!==null)for(;o.size>this.query.limit;){const f=this.query.limitType==="F"?o.last():o.first();o=o.delete(f.key),r=r.delete(f.key),i.track({type:1,doc:f})}return{tu:o,iu:i,bs:l,mutatedKeys:r}}su(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,i,s){const r=this.tu;this.tu=e.tu,this.mutatedKeys=e.mutatedKeys;const o=e.iu.ya();o.sort((f,p)=>function(b,S){const N=P=>{switch(P){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return q(20277,{Vt:P})}};return N(b)-N(S)}(f.type,p.type)||this.eu(f.doc,p.doc)),this.ou(i),s=s??!1;const l=t&&!s?this._u():[],c=this.Ya.size===0&&this.current&&!s?1:0,u=c!==this.Xa;return this.Xa=c,o.length!==0||u?{snapshot:new Ai(this.query,e.tu,r,o,e.mutatedKeys,c===0,u,!1,!!i&&i.resumeToken.approximateByteSize()>0),au:l}:{au:l}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({tu:this.tu,iu:new Of,mutatedKeys:this.mutatedKeys,bs:!1},!1)):{au:[]}}uu(e){return!this.Za.has(e)&&!!this.tu.has(e)&&!this.tu.get(e).hasLocalMutations}ou(e){e&&(e.addedDocuments.forEach(t=>this.Za=this.Za.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Za=this.Za.delete(t)),this.current=e.current)}_u(){if(!this.current)return[];const e=this.Ya;this.Ya=Z(),this.tu.forEach(i=>{this.uu(i.key)&&(this.Ya=this.Ya.add(i.key))});const t=[];return e.forEach(i=>{this.Ya.has(i)||t.push(new qf(i))}),this.Ya.forEach(i=>{e.has(i)||t.push(new Bf(i))}),t}cu(e){this.Za=e.ks,this.Ya=Z();const t=this.ru(e.documents);return this.applyChanges(t,!0)}lu(){return Ai.fromInitialDocuments(this.query,this.tu,this.mutatedKeys,this.Xa===0,this.hasCachedResults)}}const Ol="SyncEngine";class GI{constructor(e,t,i){this.query=e,this.targetId=t,this.view=i}}class KI{constructor(e){this.key=e,this.hu=!1}}class QI{constructor(e,t,i,s,r,o){this.localStore=e,this.remoteStore=t,this.eventManager=i,this.sharedClientState=s,this.currentUser=r,this.maxConcurrentLimboResolutions=o,this.Pu={},this.Tu=new Mn(l=>Od(l),Jr),this.Eu=new Map,this.Iu=new Set,this.Ru=new ye(B.comparator),this.Au=new Map,this.Vu=new yl,this.du={},this.mu=new Map,this.fu=Ti.ar(),this.onlineState="Unknown",this.gu=void 0}get isPrimaryClient(){return this.gu===!0}}async function YI(n,e,t=!0){const i=Qf(n);let s;const r=i.Tu.get(e);return r?(i.sharedClientState.addLocalQueryTarget(r.targetId),s=r.view.lu()):s=await Hf(i,e,t,!0),s}async function XI(n,e){const t=Qf(n);await Hf(t,e,!0,!1)}async function Hf(n,e,t,i){const s=await mI(n.localStore,gt(e)),r=s.targetId,o=n.sharedClientState.addLocalQueryTarget(r,t);let l;return i&&(l=await JI(n,e,r,o==="current",s.resumeToken)),n.isPrimaryClient&&t&&Sf(n.remoteStore,s),l}async function JI(n,e,t,i,s){n.pu=(p,m,b)=>async function(N,P,D,V){let U=P.view.ru(D);U.bs&&(U=await Ef(N.localStore,P.query,!1).then(({documents:w})=>P.view.ru(w,U)));const W=V&&V.targetChanges.get(P.targetId),te=V&&V.targetMismatches.get(P.targetId)!=null,G=P.view.applyChanges(U,N.isPrimaryClient,W,te);return Kf(N,P.targetId,G.au),G.snapshot}(n,p,m,b);const r=await Ef(n.localStore,e,!0),o=new $I(e,r.ks),l=o.ru(r.documents),c=ms.createSynthesizedTargetChangeForCurrentChange(t,i&&n.onlineState!=="Offline",s),u=o.applyChanges(l,n.isPrimaryClient,c);Kf(n,t,u.au);const f=new GI(e,t,o);return n.Tu.set(e,f),n.Eu.has(t)?n.Eu.get(t).push(e):n.Eu.set(t,[e]),u.snapshot}async function ZI(n,e,t){const i=$(n),s=i.Tu.get(e),r=i.Eu.get(s.targetId);if(r.length>1)return i.Eu.set(s.targetId,r.filter(o=>!Jr(o,e))),void i.Tu.delete(e);i.isPrimaryClient?(i.sharedClientState.removeLocalQueryTarget(s.targetId),i.sharedClientState.isActiveQueryTarget(s.targetId)||await Tl(i.localStore,s.targetId,!1).then(()=>{i.sharedClientState.clearQueryState(s.targetId),t&&Al(i.remoteStore,s.targetId),Vl(i,s.targetId)}).catch(gi)):(Vl(i,s.targetId),await Tl(i.localStore,s.targetId,!0))}async function eb(n,e){const t=$(n),i=t.Tu.get(e),s=t.Eu.get(i.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(i.targetId),Al(t.remoteStore,i.targetId))}async function tb(n,e,t){const i=lb(n);try{const s=await function(o,l){const c=$(o),u=ce.now(),f=l.reduce((b,S)=>b.add(S.key),Z());let p,m;return c.persistence.runTransaction("Locally write mutations","readwrite",b=>{let S=xt(),N=Z();return c.xs.getEntries(b,f).next(P=>{S=P,S.forEach((D,V)=>{V.isValidDocument()||(N=N.add(D))})}).next(()=>c.localDocuments.getOverlayedDocuments(b,S)).next(P=>{p=P;const D=[];for(const V of l){const U=gT(V,p.get(V.key).overlayedDocument);U!=null&&D.push(new Un(V.key,U,Id(U.value.mapValue),mt.exists(!0)))}return c.mutationQueue.addMutationBatch(b,u,D,l)}).next(P=>{m=P;const D=P.applyToLocalDocumentSet(p,N);return c.documentOverlayCache.saveOverlays(b,P.batchId,D)})}).then(()=>({batchId:m.batchId,changes:Md(p)}))}(i.localStore,e);i.sharedClientState.addPendingMutation(s.batchId),function(o,l,c){let u=o.du[o.currentUser.toKey()];u||(u=new ye(J)),u=u.insert(l,c),o.du[o.currentUser.toKey()]=u}(i,s.batchId,t),await vs(i,s.changes),await po(i.remoteStore)}catch(s){const r=Nl(s,"Failed to persist write");t.reject(r)}}async function zf(n,e){const t=$(n);try{const i=await fI(t.localStore,e);e.targetChanges.forEach((s,r)=>{const o=t.Au.get(r);o&&(se(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?o.hu=!0:s.modifiedDocuments.size>0?se(o.hu,14607):s.removedDocuments.size>0&&(se(o.hu,42227),o.hu=!1))}),await vs(t,i,e)}catch(i){await gi(i)}}function Wf(n,e,t){const i=$(n);if(i.isPrimaryClient&&t===0||!i.isPrimaryClient&&t===1){const s=[];i.Tu.forEach((r,o)=>{const l=o.view.va(e);l.snapshot&&s.push(l.snapshot)}),function(o,l){const c=$(o);c.onlineState=l;let u=!1;c.queries.forEach((f,p)=>{for(const m of p.Sa)m.va(l)&&(u=!0)}),u&&xl(c)}(i.eventManager,e),s.length&&i.Pu.H_(s),i.onlineState=e,i.isPrimaryClient&&i.sharedClientState.setOnlineState(e)}}async function nb(n,e,t){const i=$(n);i.sharedClientState.updateQueryState(e,"rejected",t);const s=i.Au.get(e),r=s&&s.key;if(r){let o=new ye(B.comparator);o=o.insert(r,Fe.newNoDocument(r,j.min()));const l=Z().add(r),c=new so(j.min(),new Map,new ye(J),o,l);await zf(i,c),i.Ru=i.Ru.remove(r),i.Au.delete(e),Ll(i)}else await Tl(i.localStore,e,!1).then(()=>Vl(i,e,t)).catch(gi)}async function ib(n,e){const t=$(n),i=e.batch.batchId;try{const s=await dI(t.localStore,e);$f(t,i,null),jf(t,i),t.sharedClientState.updateMutationState(i,"acknowledged"),await vs(t,s)}catch(s){await gi(s)}}async function sb(n,e,t){const i=$(n);try{const s=await function(o,l){const c=$(o);return c.persistence.runTransaction("Reject batch","readwrite-primary",u=>{let f;return c.mutationQueue.lookupMutationBatch(u,l).next(p=>(se(p!==null,37113),f=p.keys(),c.mutationQueue.removeMutationBatch(u,p))).next(()=>c.mutationQueue.performConsistencyCheck(u)).next(()=>c.documentOverlayCache.removeOverlaysForBatchId(u,f,l)).next(()=>c.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(u,f)).next(()=>c.localDocuments.getDocuments(u,f))})}(i.localStore,e);$f(i,e,t),jf(i,e),i.sharedClientState.updateMutationState(e,"rejected",t),await vs(i,s)}catch(s){await gi(s)}}function jf(n,e){(n.mu.get(e)||[]).forEach(t=>{t.resolve()}),n.mu.delete(e)}function $f(n,e,t){const i=$(n);let s=i.du[i.currentUser.toKey()];if(s){const r=s.get(e);r&&(t?r.reject(t):r.resolve(),s=s.remove(e)),i.du[i.currentUser.toKey()]=s}}function Vl(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const i of n.Eu.get(e))n.Tu.delete(i),t&&n.Pu.yu(i,t);n.Eu.delete(e),n.isPrimaryClient&&n.Vu.Gr(e).forEach(i=>{n.Vu.containsKey(i)||Gf(n,i)})}function Gf(n,e){n.Iu.delete(e.path.canonicalString());const t=n.Ru.get(e);t!==null&&(Al(n.remoteStore,t),n.Ru=n.Ru.remove(e),n.Au.delete(t),Ll(n))}function Kf(n,e,t){for(const i of t)i instanceof Bf?(n.Vu.addReference(i.key,e),rb(n,i)):i instanceof qf?(M(Ol,"Document no longer in limbo: "+i.key),n.Vu.removeReference(i.key,e),n.Vu.containsKey(i.key)||Gf(n,i.key)):q(19791,{wu:i})}function rb(n,e){const t=e.key,i=t.path.canonicalString();n.Ru.get(t)||n.Iu.has(i)||(M(Ol,"New document in limbo: "+t),n.Iu.add(i),Ll(n))}function Ll(n){for(;n.Iu.size>0&&n.Ru.size<n.maxConcurrentLimboResolutions;){const e=n.Iu.values().next().value;n.Iu.delete(e);const t=new B(le.fromString(e)),i=n.fu.next();n.Au.set(i,new KI(t)),n.Ru=n.Ru.insert(t,i),Sf(n.remoteStore,new rn(gt(ol(t.path)),i,"TargetPurposeLimboResolution",Ur.ce))}}async function vs(n,e,t){const i=$(n),s=[],r=[],o=[];i.Tu.isEmpty()||(i.Tu.forEach((l,c)=>{o.push(i.pu(c,e,t).then(u=>{var f;if((u||t)&&i.isPrimaryClient){const p=u?!u.fromCache:(f=t==null?void 0:t.targetChanges.get(c.targetId))==null?void 0:f.current;i.sharedClientState.updateQueryState(c.targetId,p?"current":"not-current")}if(u){s.push(u);const p=El.Is(c.targetId,u);r.push(p)}}))}),await Promise.all(o),i.Pu.H_(s),await async function(c,u){const f=$(c);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",p=>R.forEach(u,m=>R.forEach(m.Ts,b=>f.persistence.referenceDelegate.addReference(p,m.targetId,b)).next(()=>R.forEach(m.Es,b=>f.persistence.referenceDelegate.removeReference(p,m.targetId,b)))))}catch(p){if(!mi(p))throw p;M(wl,"Failed to update sequence numbers: "+p)}for(const p of u){const m=p.targetId;if(!p.fromCache){const b=f.vs.get(m),S=b.snapshotVersion,N=b.withLastLimboFreeSnapshotVersion(S);f.vs=f.vs.insert(m,N)}}}(i.localStore,r))}async function ob(n,e){const t=$(n);if(!t.currentUser.isEqual(e)){M(Ol,"User change. New user:",e.toKey());const i=await yf(t.localStore,e);t.currentUser=e,function(r,o){r.mu.forEach(l=>{l.forEach(c=>{c.reject(new F(k.CANCELLED,o))})}),r.mu.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,i.removedBatchIds,i.addedBatchIds),await vs(t,i.Ns)}}function ab(n,e){const t=$(n),i=t.Au.get(e);if(i&&i.hu)return Z().add(i.key);{let s=Z();const r=t.Eu.get(e);if(!r)return s;for(const o of r){const l=t.Tu.get(o);s=s.unionWith(l.view.nu)}return s}}function Qf(n){const e=$(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=zf.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=ab.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=nb.bind(null,e),e.Pu.H_=WI.bind(null,e.eventManager),e.Pu.yu=jI.bind(null,e.eventManager),e}function lb(n){const e=$(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=ib.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=sb.bind(null,e),e}class go{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=uo(e.databaseInfo.databaseId),this.sharedClientState=this.Du(e),this.persistence=this.Cu(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Fu(e,this.localStore),this.indexBackfillerScheduler=this.Mu(e,this.localStore)}Fu(e,t){return null}Mu(e,t){return null}vu(e){return hI(this.persistence,new lI,e.initialUser,this.serializer)}Cu(e){return new _f(vl.Vi,this.serializer)}Du(e){return new yI}async terminate(){var e,t;(e=this.gcScheduler)==null||e.stop(),(t=this.indexBackfillerScheduler)==null||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}go.provider={build:()=>new go};class cb extends go{constructor(e){super(),this.cacheSizeBytes=e}Fu(e,t){se(this.persistence.referenceDelegate instanceof lo,46915);const i=this.persistence.referenceDelegate.garbageCollector;return new GT(i,e.asyncQueue,t)}Cu(e){const t=this.cacheSizeBytes!==void 0?Ge.withCacheSize(this.cacheSizeBytes):Ge.DEFAULT;return new _f(i=>lo.Vi(i,t),this.serializer)}}class Ml{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=i=>Wf(this.syncEngine,i,1),this.remoteStore.remoteSyncer.handleCredentialChange=ob.bind(null,this.syncEngine),await qI(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new zI}()}createDatastore(e){const t=uo(e.databaseInfo.databaseId),i=II(e.databaseInfo);return RI(e.authCredentials,e.appCheckCredentials,i,t)}createRemoteStore(e){return function(i,s,r,o,l){return new kI(i,s,r,o,l)}(this.localStore,this.datastore,e.asyncQueue,t=>Wf(this.syncEngine,t,0),function(){return If.v()?new If:new vI}())}createSyncEngine(e,t){return function(s,r,o,l,c,u,f){const p=new QI(s,r,o,l,c,u);return f&&(p.gu=!0),p}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(s){const r=$(s);M(Bn,"RemoteStore shutting down."),r.Ia.add(5),await ys(r),r.Aa.shutdown(),r.Va.set("Unknown")}(this.remoteStore),(e=this.datastore)==null||e.terminate(),(t=this.eventManager)==null||t.terminate()}}Ml.provider={build:()=>new Ml};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yf{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ou(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ou(this.observer.error,e):kt("Uncaught Error in snapshot listener:",e.toString()))}Nu(){this.muted=!0}Ou(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const an="FirestoreClient";class ub{constructor(e,t,i,s,r){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=i,this._databaseInfo=s,this.user=Me.UNAUTHENTICATED,this.clientId=Ga.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=r,this.authCredentials.start(i,async o=>{M(an,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o}),this.appCheckCredentials.start(i,o=>(M(an,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Nt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const i=Nl(t,"Failed to shutdown persistence");e.reject(i)}}),e.promise}}async function Fl(n,e){n.asyncQueue.verifyOperationInProgress(),M(an,"Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let i=t.initialUser;n.setCredentialChangeListener(async s=>{i.isEqual(s)||(await yf(e.localStore,s),i=s)}),e.persistence.setDatabaseDeletedListener(()=>n.terminate()),n._offlineComponents=e}async function Xf(n,e){n.asyncQueue.verifyOperationInProgress();const t=await hb(n);M(an,"Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener(i=>Df(e.remoteStore,i)),n.setAppCheckTokenChangeListener((i,s)=>Df(e.remoteStore,s)),n._onlineComponents=e}async function hb(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){M(an,"Using user provided OfflineComponentProvider");try{await Fl(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(s){return s.name==="FirebaseError"?s.code===k.FAILED_PRECONDITION||s.code===k.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(t))throw t;Vn("Error using user provided cache. Falling back to memory cache: "+t),await Fl(n,new go)}}else M(an,"Using default OfflineComponentProvider"),await Fl(n,new cb(void 0));return n._offlineComponents}async function Jf(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(M(an,"Using user provided OnlineComponentProvider"),await Xf(n,n._uninitializedComponentsProvider._online)):(M(an,"Using default OnlineComponentProvider"),await Xf(n,new Ml))),n._onlineComponents}function db(n){return Jf(n).then(e=>e.syncEngine)}async function Zf(n){const e=await Jf(n),t=e.eventManager;return t.onListen=YI.bind(null,e.syncEngine),t.onUnlisten=ZI.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=XI.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=eb.bind(null,e.syncEngine),t}function fb(n,e,t={}){const i=new Nt;return n.asyncQueue.enqueueAndForget(async()=>function(r,o,l,c,u){const f=new Yf({next:m=>{f.Nu(),o.enqueueAndForget(()=>Mf(r,p));const b=m.docs.has(l);!b&&m.fromCache?u.reject(new F(k.UNAVAILABLE,"Failed to get document because the client is offline.")):b&&m.fromCache&&c&&c.source==="server"?u.reject(new F(k.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):u.resolve(m)},error:m=>u.reject(m)}),p=new Uf(ol(l.path),f,{includeMetadataChanges:!0,qa:!0});return Lf(r,p)}(await Zf(n),n.asyncQueue,e,t,i)),i.promise}function pb(n,e,t={}){const i=new Nt;return n.asyncQueue.enqueueAndForget(async()=>function(r,o,l,c,u){const f=new Yf({next:m=>{f.Nu(),o.enqueueAndForget(()=>Mf(r,p)),m.fromCache&&c.source==="server"?u.reject(new F(k.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):u.resolve(m)},error:m=>u.reject(m)}),p=new Uf(l,f,{includeMetadataChanges:!0,qa:!0});return Lf(r,p)}(await Zf(n),n.asyncQueue,e,t,i)),i.promise}function gb(n,e){const t=new Nt;return n.asyncQueue.enqueueAndForget(async()=>tb(await db(n),e,t)),t.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ep(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mb="ComponentProvider",tp=new Map;function _b(n,e,t,i,s){return new Lw(n,e,t,s.host,s.ssl,s.experimentalForceLongPolling,s.experimentalAutoDetectLongPolling,ep(s.experimentalLongPollingOptions),s.useFetchStreams,s.isUsingEmulator,i)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const np="firestore.googleapis.com",ip=!0;class sp{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new F(k.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=np,this.ssl=ip}else this.host=e.host,this.ssl=e.ssl??ip;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=pf;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<jT)throw new F(k.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Cw("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=ep(e.experimentalLongPollingOptions??{}),function(i){if(i.timeoutSeconds!==void 0){if(isNaN(i.timeoutSeconds))throw new F(k.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (must not be NaN)`);if(i.timeoutSeconds<5)throw new F(k.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (minimum allowed value is 5)`);if(i.timeoutSeconds>30)throw new F(k.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(i,s){return i.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class mo{constructor(e,t,i,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=i,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new sp({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new F(k.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new F(k.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new sp(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(i){if(!i)return new gw;switch(i.type){case"firstParty":return new vw(i.sessionIndex||"0",i.iamToken||null,i.authTokenFactory||null);case"provider":return i.client;default:throw new F(k.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const i=tp.get(t);i&&(M(mb,"Removing Datastore"),tp.delete(t),i.terminate())}(this),Promise.resolve()}}function yb(n,e,t,i={}){var u;n=Jt(n,mo);const s=Pn(e),r=n._getSettings(),o={...r,emulatorOptions:n._getEmulatorOptions()},l=`${e}:${t}`;s&&wa(`https://${l}`),r.host!==np&&r.host!==l&&Vn("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const c={...r,host:l,ssl:s,emulatorOptions:i};if(!Bt(c,o)&&(n._setSettings(c),i.mockUserToken)){let f,p;if(typeof i.mockUserToken=="string")f=i.mockUserToken,p=Me.MOCK_USER;else{f=xu(i.mockUserToken,(u=n._app)==null?void 0:u.options.projectId);const m=i.mockUserToken.sub||i.mockUserToken.user_id;if(!m)throw new F(k.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");p=new Me(m)}n._authCredentials=new mw(new Jh(f,p))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _o{constructor(e,t,i){this.converter=t,this._query=i,this.type="query",this.firestore=e}withConverter(e){return new _o(this.firestore,e,this._query)}}class Ie{constructor(e,t,i){this.converter=t,this._key=i,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new ln(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Ie(this.firestore,e,this._key)}toJSON(){return{type:Ie._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,i){if(ts(t,Ie._jsonSchema))return new Ie(e,i||null,new B(le.fromString(t.referencePath)))}}Ie._jsonSchemaVersion="firestore/documentReference/1.0",Ie._jsonSchema={type:_e("string",Ie._jsonSchemaVersion),referencePath:_e("string")};class ln extends _o{constructor(e,t,i){super(e,t,ol(i)),this._path=i,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Ie(this.firestore,null,new B(e))}withConverter(e){return new ln(this.firestore,e,this._path)}}function rp(n,e,...t){if(n=Ae(n),td("collection","path",e),n instanceof mo){const i=le.fromString(e,...t);return id(i),new ln(n,null,i)}{if(!(n instanceof Ie||n instanceof ln))throw new F(k.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const i=n._path.child(le.fromString(e,...t));return id(i),new ln(n.firestore,null,i)}}function yo(n,e,...t){if(n=Ae(n),arguments.length===1&&(e=Ga.newId()),td("doc","path",e),n instanceof mo){const i=le.fromString(e,...t);return nd(i),new Ie(n,null,new B(i))}{if(!(n instanceof Ie||n instanceof ln))throw new F(k.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const i=n._path.child(le.fromString(e,...t));return nd(i),new Ie(n.firestore,n instanceof ln?n.converter:null,new B(i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const op="AsyncQueue";class ap{constructor(e=Promise.resolve()){this.Yu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new bf(this,"async_queue_retry"),this._c=()=>{const i=Cl();i&&M(op,"Visibility state changed to "+i.visibilityState),this.M_.w_()},this.ac=e;const t=Cl();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.uc(),this.cc(e)}enterRestrictedMode(e){if(!this.ec){this.ec=!0,this.sc=e||!1;const t=Cl();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this._c)}}enqueue(e){if(this.uc(),this.ec)return new Promise(()=>{});const t=new Nt;return this.cc(()=>this.ec&&this.sc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Yu.push(e),this.lc()))}async lc(){if(this.Yu.length!==0){try{await this.Yu[0](),this.Yu.shift(),this.M_.reset()}catch(e){if(!mi(e))throw e;M(op,"Operation failed with retryable error: "+e)}this.Yu.length>0&&this.M_.p_(()=>this.lc())}}cc(e){const t=this.ac.then(()=>(this.rc=!0,e().catch(i=>{throw this.nc=i,this.rc=!1,kt("INTERNAL UNHANDLED ERROR: ",lp(i)),i}).then(i=>(this.rc=!1,i))));return this.ac=t,t}enqueueAfterDelay(e,t,i){this.uc(),this.oc.indexOf(e)>-1&&(t=0);const s=kl.createAndSchedule(this,e,t,i,r=>this.hc(r));return this.tc.push(s),s}uc(){this.nc&&q(47125,{Pc:lp(this.nc)})}verifyOperationInProgress(){}async Tc(){let e;do e=this.ac,await e;while(e!==this.ac)}Ec(e){for(const t of this.tc)if(t.timerId===e)return!0;return!1}Ic(e){return this.Tc().then(()=>{this.tc.sort((t,i)=>t.targetTimeMs-i.targetTimeMs);for(const t of this.tc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.Tc()})}Rc(e){this.oc.push(e)}hc(e){const t=this.tc.indexOf(e);this.tc.splice(t,1)}}function lp(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}class Es extends mo{constructor(e,t,i,s){super(e,t,i,s),this.type="firestore",this._queue=new ap,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new ap(e),this._firestoreClient=void 0,await e}}}function vb(n,e){const t=typeof n=="object"?n:Na(),i=typeof n=="string"?n:Wr,s=wr(t,"firestore").getImmediate({identifier:i});if(!s._initialized){const r=Pu("firestore");r&&yb(s,...r)}return s}function Ul(n){if(n._terminated)throw new F(k.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||Eb(n),n._firestoreClient}function Eb(n){var i,s,r,o;const e=n._freezeSettings(),t=_b(n._databaseId,((i=n._app)==null?void 0:i.options.appId)||"",n._persistenceKey,(s=n._app)==null?void 0:s.options.apiKey,e);n._componentsProvider||(r=e.localCache)!=null&&r._offlineComponentProvider&&((o=e.localCache)!=null&&o._onlineComponentProvider)&&(n._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),n._firestoreClient=new ub(n._authCredentials,n._appCheckCredentials,n._queue,t,n._componentsProvider&&function(c){const u=c==null?void 0:c._online.build();return{_offline:c==null?void 0:c._offline.build(u),_online:u}}(n._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tt{constructor(e){this._byteString=e}static fromBase64String(e){try{return new tt(Oe.fromBase64String(e))}catch(t){throw new F(k.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new tt(Oe.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:tt._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(ts(e,tt._jsonSchema))return tt.fromBase64String(e.bytes)}}tt._jsonSchemaVersion="firestore/bytes/1.0",tt._jsonSchema={type:_e("string",tt._jsonSchemaVersion),bytes:_e("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cp{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new F(k.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new De(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bl{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yt{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new F(k.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new F(k.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return J(this._lat,e._lat)||J(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:yt._jsonSchemaVersion}}static fromJSON(e){if(ts(e,yt._jsonSchema))return new yt(e.latitude,e.longitude)}}yt._jsonSchemaVersion="firestore/geoPoint/1.0",yt._jsonSchema={type:_e("string",yt._jsonSchemaVersion),latitude:_e("number"),longitude:_e("number")};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class st{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(i,s){if(i.length!==s.length)return!1;for(let r=0;r<i.length;++r)if(i[r]!==s[r])return!1;return!0}(this._values,e._values)}toJSON(){return{type:st._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(ts(e,st._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(t=>typeof t=="number"))return new st(e.vectorValues);throw new F(k.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}st._jsonSchemaVersion="firestore/vectorValue/1.0",st._jsonSchema={type:_e("string",st._jsonSchemaVersion),vectorValues:_e("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wb=/^__.*__$/;class Tb{constructor(e,t,i){this.data=e,this.fieldMask=t,this.fieldTransforms=i}toMutation(e,t){return this.fieldMask!==null?new Un(e,this.data,this.fieldMask,t,this.fieldTransforms):new ps(e,this.data,t,this.fieldTransforms)}}function up(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw q(40011,{dataSource:n})}}class ql{constructor(e,t,i,s,r,o){this.settings=e,this.databaseId=t,this.serializer=i,this.ignoreUndefinedProperties=s,r===void 0&&this.Ac(),this.fieldTransforms=r||[],this.fieldMask=o||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}i(e){return new ql({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}dc(e){var s;const t=(s=this.path)==null?void 0:s.child(e),i=this.i({path:t,arrayElement:!1});return i.mc(e),i}fc(e){var s;const t=(s=this.path)==null?void 0:s.child(e),i=this.i({path:t,arrayElement:!1});return i.Ac(),i}gc(e){return this.i({path:void 0,arrayElement:!0})}yc(e){return vo(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}Ac(){if(this.path)for(let e=0;e<this.path.length;e++)this.mc(this.path.get(e))}mc(e){if(e.length===0)throw this.yc("Document fields must not be empty");if(up(this.dataSource)&&wb.test(e))throw this.yc('Document fields cannot begin and end with "__"')}}class Ib{constructor(e,t,i){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=i||uo(e)}A(e,t,i,s=!1){return new ql({dataSource:e,methodName:t,targetDoc:i,path:De.emptyPath(),arrayElement:!1,hasConverter:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function bb(n){const e=n._freezeSettings(),t=uo(n._databaseId);return new Ib(n._databaseId,!!e.ignoreUndefinedProperties,t)}function Cb(n,e,t,i,s,r={}){const o=n.A(r.merge||r.mergeFields?2:0,e,t,s);pp("Data must be an object, but it was:",o,i);const l=dp(i,o);let c,u;if(r.merge)c=new it(o.fieldMask),u=o.fieldTransforms;else if(r.mergeFields){const f=[];for(const p of r.mergeFields){const m=zl(e,p,t);if(!o.contains(m))throw new F(k.INVALID_ARGUMENT,`Field '${m}' is specified in your field mask but missing from your input data.`);Rb(f,m)||f.push(m)}c=new it(f),u=o.fieldTransforms.filter(p=>c.covers(p.field))}else c=null,u=o.fieldTransforms;return new Tb(new et(l),c,u)}class Hl extends Bl{_toFieldTransform(e){return new hT(e.path,new us)}isEqual(e){return e instanceof Hl}}function hp(n,e){if(fp(n=Ae(n)))return pp("Unsupported field value:",e,n),dp(n,e);if(n instanceof Bl)return function(i,s){if(!up(s.dataSource))throw s.yc(`${i._methodName}() can only be used with update() and set()`);if(!s.path)throw s.yc(`${i._methodName}() is not currently supported inside arrays`);const r=i._toFieldTransform(s);r&&s.fieldTransforms.push(r)}(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.yc("Nested arrays are not supported");return function(i,s){const r=[];let o=0;for(const l of i){let c=hp(l,s.gc(o));c==null&&(c={nullValue:"NULL_VALUE"}),r.push(c),o++}return{arrayValue:{values:r}}}(n,e)}return function(i,s){if((i=Ae(i))===null)return{nullValue:"NULL_VALUE"};if(typeof i=="number")return lT(s.serializer,i);if(typeof i=="boolean")return{booleanValue:i};if(typeof i=="string")return{stringValue:i};if(i instanceof Date){const r=ce.fromDate(i);return{timestampValue:ao(s.serializer,r)}}if(i instanceof ce){const r=new ce(i.seconds,1e3*Math.floor(i.nanoseconds/1e3));return{timestampValue:ao(s.serializer,r)}}if(i instanceof yt)return{geoPointValue:{latitude:i.latitude,longitude:i.longitude}};if(i instanceof tt)return{bytesValue:sf(s.serializer,i._byteString)};if(i instanceof Ie){const r=s.databaseId,o=i.firestore._databaseId;if(!o.isEqual(r))throw s.yc(`Document reference is for database ${o.projectId}/${o.database} but should be for database ${r.projectId}/${r.database}`);return{referenceValue:fl(i.firestore._databaseId||s.databaseId,i._key.path)}}if(i instanceof st)return function(o,l){const c=o instanceof st?o.toArray():o;return{mapValue:{fields:{[_d]:{stringValue:yd},[$r]:{arrayValue:{values:c.map(f=>{if(typeof f!="number")throw l.yc("VectorValues must only contain numeric values.");return ll(l.serializer,f)})}}}}}}(i,s);if(df(i))return i._toProto(s.serializer);throw s.yc(`Unsupported field value: ${Ya(i)}`)}(n,e)}function dp(n,e){const t={};return ud(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Ln(n,(i,s)=>{const r=hp(s,e.dc(i));r!=null&&(t[i]=r)}),{mapValue:{fields:t}}}function fp(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof ce||n instanceof yt||n instanceof tt||n instanceof Ie||n instanceof Bl||n instanceof st||df(n))}function pp(n,e,t){if(!fp(t)||!sd(t)){const i=Ya(t);throw i==="an object"?e.yc(n+" a custom object"):e.yc(n+" "+i)}}function zl(n,e,t){if((e=Ae(e))instanceof cp)return e._internalPath;if(typeof e=="string")return Sb(n,e);throw vo("Field path arguments must be of type string or ",n,!1,void 0,t)}const Ab=new RegExp("[~\\*/\\[\\]]");function Sb(n,e,t){if(e.search(Ab)>=0)throw vo(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new cp(...e.split("."))._internalPath}catch{throw vo(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function vo(n,e,t,i,s){const r=i&&!i.isEmpty(),o=s!==void 0;let l=`Function ${e}() called with invalid data`;t&&(l+=" (via `toFirestore()`)"),l+=". ";let c="";return(r||o)&&(c+=" (found",r&&(c+=` in field ${i}`),o&&(c+=` in document ${s}`),c+=")"),new F(k.INVALID_ARGUMENT,l+n+c)}function Rb(n,e){return n.some(t=>t.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pb{convertValue(e,t="none"){switch(sn(e)){case 0:return null;case 1:return e.booleanValue;case 2:return me(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(nn(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw q(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const i={};return Ln(e,(s,r)=>{i[s]=this.convertValue(r,t)}),i}convertVectorValue(e){var i,s,r;const t=(r=(s=(i=e.fields)==null?void 0:i[$r].arrayValue)==null?void 0:s.values)==null?void 0:r.map(o=>me(o.doubleValue));return new st(t)}convertGeoPoint(e){return new yt(me(e.latitude),me(e.longitude))}convertArray(e,t){return(e.values||[]).map(i=>this.convertValue(i,t))}convertServerTimestamp(e,t){switch(t){case"previous":const i=zr(e);return i==null?null:this.convertValue(i,t);case"estimate":return this.convertTimestamp(is(e));default:return null}}convertTimestamp(e){const t=tn(e);return new ce(t.seconds,t.nanos)}convertDocumentKey(e,t){const i=le.fromString(e);se(hf(i),9688,{name:e});const s=new ss(i.get(1),i.get(3)),r=new B(i.popFirst(5));return s.isEqual(t)||kt(`Document ${r} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),r}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gp extends Pb{constructor(e){super(),this.firestore=e}convertBytes(e){return new tt(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Ie(this.firestore,null,t)}}function mp(){return new Hl("serverTimestamp")}const _p="@firebase/firestore",yp="4.13.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vp{constructor(e,t,i,s,r){this._firestore=e,this._userDataWriter=t,this._key=i,this._document=s,this._converter=r}get id(){return this._key.path.lastSegment()}get ref(){return new Ie(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new kb(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var e;return((e=this._document)==null?void 0:e.data.clone().value.mapValue.fields)??void 0}get(e){if(this._document){const t=this._document.data.field(zl("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class kb extends vp{data(){return super.data()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nb(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new F(k.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}function xb(n,e,t){let i;return i=n?n.toFirestore(e):e,i}class ws{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Hn extends vp{constructor(e,t,i,s,r,o){super(e,t,i,s,o),this._firestore=e,this._firestoreImpl=e,this.metadata=r}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Eo(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const i=this._document.data.field(zl("DocumentSnapshot.get",e));if(i!==null)return this._userDataWriter.convertValue(i,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new F(k.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=Hn._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}Hn._jsonSchemaVersion="firestore/documentSnapshot/1.0",Hn._jsonSchema={type:_e("string",Hn._jsonSchemaVersion),bundleSource:_e("string","DocumentSnapshot"),bundleName:_e("string"),bundle:_e("string")};class Eo extends Hn{data(e={}){return super.data(e)}}class Si{constructor(e,t,i,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new ws(s.hasPendingWrites,s.fromCache),this.query=i}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(i=>{e.call(t,new Eo(this._firestore,this._userDataWriter,i.key,i,new ws(this._snapshot.mutatedKeys.has(i.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new F(k.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(s,r){if(s._snapshot.oldDocs.isEmpty()){let o=0;return s._snapshot.docChanges.map(l=>{const c=new Eo(s._firestore,s._userDataWriter,l.doc.key,l.doc,new ws(s._snapshot.mutatedKeys.has(l.doc.key),s._snapshot.fromCache),s.query.converter);return l.doc,{type:"added",doc:c,oldIndex:-1,newIndex:o++}})}{let o=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(l=>r||l.type!==3).map(l=>{const c=new Eo(s._firestore,s._userDataWriter,l.doc.key,l.doc,new ws(s._snapshot.mutatedKeys.has(l.doc.key),s._snapshot.fromCache),s.query.converter);let u=-1,f=-1;return l.type!==0&&(u=o.indexOf(l.doc.key),o=o.delete(l.doc.key)),l.type!==1&&(o=o.add(l.doc),f=o.indexOf(l.doc.key)),{type:Db(l.type),doc:c,oldIndex:u,newIndex:f}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new F(k.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=Si._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Ga.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],i=[],s=[];return this.docs.forEach(r=>{r._document!==null&&(t.push(r._document),i.push(this._userDataWriter.convertObjectMap(r._document.data.value.mapValue.fields,"previous")),s.push(r.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function Db(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return q(61501,{type:n})}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Si._jsonSchemaVersion="firestore/querySnapshot/1.0",Si._jsonSchema={type:_e("string",Si._jsonSchemaVersion),bundleSource:_e("string","QuerySnapshot"),bundleName:_e("string"),bundle:_e("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ob(n){n=Jt(n,Ie);const e=Jt(n.firestore,Es),t=Ul(e);return fb(t,n._key).then(i=>Mb(e,n,i))}function Vb(n){n=Jt(n,_o);const e=Jt(n.firestore,Es),t=Ul(e),i=new gp(e);return Nb(n._query),pb(t,n._query).then(s=>new Si(e,i,n,s))}function Ep(n,e,t){n=Jt(n,Ie);const i=Jt(n.firestore,Es),s=xb(n.converter,e),r=bb(i);return wp(i,[Cb(r,"setDoc",n._key,s,n.converter!==null,t).toMutation(n._key,mt.none())])}function Lb(n){return wp(Jt(n.firestore,Es),[new cl(n._key,mt.none())])}function wp(n,e){const t=Ul(n);return gb(t,e)}function Mb(n,e,t){const i=t.docs.get(e._key),s=new gp(n);return new Hn(n,s,e._key,i,new ws(t.hasPendingWrites,t.fromCache),e.converter)}(function(e,t=!0){pw(xn),Nn(new qt("firestore",(i,{instanceIdentifier:s,options:r})=>{const o=i.getProvider("app").getImmediate(),l=new Es(new _w(i.getProvider("auth-internal")),new Ew(o,i.getProvider("app-check-internal")),Mw(o,s),o);return r={useFetchStreams:t,...r},l._setSettings(r),l},"PUBLIC").setMultipleInstances(!0)),ct(_p,yp,e),ct(_p,yp,"esm2020")})();const Tp="@firebase/database",Ip="1.1.2";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let bp="";function Fb(n){bp=n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ub{constructor(e){this.domStorage_=e,this.prefix_="firebase:"}set(e,t){t==null?this.domStorage_.removeItem(this.prefixedName_(e)):this.domStorage_.setItem(this.prefixedName_(e),Ee(t))}get(e){const t=this.domStorage_.getItem(this.prefixedName_(e));return t==null?null:Gi(t)}remove(e){this.domStorage_.removeItem(this.prefixedName_(e))}prefixedName_(e){return this.prefix_+e}toString(){return this.domStorage_.toString()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bb{constructor(){this.cache_={},this.isInMemoryStorage=!0}set(e,t){t==null?delete this.cache_[e]:this.cache_[e]=t}get(e){return bt(this.cache_,e)?this.cache_[e]:null}remove(e){delete this.cache_[e]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cp=function(n){try{if(typeof window<"u"&&typeof window[n]<"u"){const e=window[n];return e.setItem("firebase:sentinel","cache"),e.removeItem("firebase:sentinel"),new Ub(e)}}catch{}return new Bb},zn=Cp("localStorage"),qb=Cp("sessionStorage");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ri=new vr("@firebase/database"),Hb=function(){let n=1;return function(){return n++}}(),Ap=function(n){const e=iy(n),t=new Z_;t.update(e);const i=t.digest();return ma.encodeByteArray(i)},Ts=function(...n){let e="";for(let t=0;t<n.length;t++){const i=n[t];Array.isArray(i)||i&&typeof i=="object"&&typeof i.length=="number"?e+=Ts.apply(null,i):typeof i=="object"?e+=Ee(i):e+=i,e+=" "}return e};let Is=null,Sp=!0;const zb=function(n,e){x(!0,"Can't turn on custom loggers persistently."),Ri.logLevel=Y.VERBOSE,Is=Ri.log.bind(Ri)},Be=function(...n){if(Sp===!0&&(Sp=!1,Is===null&&qb.get("logging_enabled")===!0&&zb()),Is){const e=Ts.apply(null,n);Is(e)}},bs=function(n){return function(...e){Be(n,...e)}},Wl=function(...n){const e="FIREBASE INTERNAL ERROR: "+Ts(...n);Ri.error(e)},Dt=function(...n){const e=`FIREBASE FATAL ERROR: ${Ts(...n)}`;throw Ri.error(e),new Error(e)},Ke=function(...n){const e="FIREBASE WARNING: "+Ts(...n);Ri.warn(e)},Wb=function(){typeof window<"u"&&window.location&&window.location.protocol&&window.location.protocol.indexOf("https:")!==-1&&Ke("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().")},Rp=function(n){return typeof n=="number"&&(n!==n||n===Number.POSITIVE_INFINITY||n===Number.NEGATIVE_INFINITY)},jb=function(n){if(document.readyState==="complete")n();else{let e=!1;const t=function(){if(!document.body){setTimeout(t,Math.floor(10));return}e||(e=!0,n())};document.addEventListener?(document.addEventListener("DOMContentLoaded",t,!1),window.addEventListener("load",t,!1)):document.attachEvent&&(document.attachEvent("onreadystatechange",()=>{document.readyState==="complete"&&t()}),window.attachEvent("onload",t))}},Pi="[MIN_NAME]",Wn="[MAX_NAME]",ki=function(n,e){if(n===e)return 0;if(n===Pi||e===Wn)return-1;if(e===Pi||n===Wn)return 1;{const t=Np(n),i=Np(e);return t!==null?i!==null?t-i===0?n.length-e.length:t-i:-1:i!==null?1:n<e?-1:1}},$b=function(n,e){return n===e?0:n<e?-1:1},Cs=function(n,e){if(e&&n in e)return e[n];throw new Error("Missing required key ("+n+") in object: "+Ee(e))},jl=function(n){if(typeof n!="object"||n===null)return Ee(n);const e=[];for(const i in n)e.push(i);e.sort();let t="{";for(let i=0;i<e.length;i++)i!==0&&(t+=","),t+=Ee(e[i]),t+=":",t+=jl(n[e[i]]);return t+="}",t},Pp=function(n,e){const t=n.length;if(t<=e)return[n];const i=[];for(let s=0;s<t;s+=e)s+e>t?i.push(n.substring(s,t)):i.push(n.substring(s,s+e));return i};function Qe(n,e){for(const t in n)n.hasOwnProperty(t)&&e(t,n[t])}const kp=function(n){x(!Rp(n),"Invalid JSON number");const e=11,t=52,i=(1<<e-1)-1;let s,r,o,l,c;n===0?(r=0,o=0,s=1/n===-1/0?1:0):(s=n<0,n=Math.abs(n),n>=Math.pow(2,1-i)?(l=Math.min(Math.floor(Math.log(n)/Math.LN2),i),r=l+i,o=Math.round(n*Math.pow(2,t-l)-Math.pow(2,t))):(r=0,o=Math.round(n/Math.pow(2,1-i-t))));const u=[];for(c=t;c;c-=1)u.push(o%2?1:0),o=Math.floor(o/2);for(c=e;c;c-=1)u.push(r%2?1:0),r=Math.floor(r/2);u.push(s?1:0),u.reverse();const f=u.join("");let p="";for(c=0;c<64;c+=8){let m=parseInt(f.substr(c,8),2).toString(16);m.length===1&&(m="0"+m),p=p+m}return p.toLowerCase()},Gb=function(){return!!(typeof window=="object"&&window.chrome&&window.chrome.extension&&!/^chrome/.test(window.location.href))},Kb=function(){return typeof Windows=="object"&&typeof Windows.UI=="object"};function Qb(n,e){let t="Unknown Error";n==="too_big"?t="The data requested exceeds the maximum size that can be accessed with a single request.":n==="permission_denied"?t="Client doesn't have permission to access the desired data.":n==="unavailable"&&(t="The service is unavailable");const i=new Error(n+" at "+e._path.toString()+": "+t);return i.code=n.toUpperCase(),i}const Yb=new RegExp("^-?(0*)\\d{1,10}$"),Xb=-2147483648,Jb=2147483647,Np=function(n){if(Yb.test(n)){const e=Number(n);if(e>=Xb&&e<=Jb)return e}return null},Ni=function(n){try{n()}catch(e){setTimeout(()=>{const t=e.stack||"";throw Ke("Exception was thrown by user callback.",t),e},Math.floor(0))}},Zb=function(){return(typeof window=="object"&&window.navigator&&window.navigator.userAgent||"").search(/googlebot|google webmaster tools|bingbot|yahoo! slurp|baiduspider|yandexbot|duckduckbot/i)>=0},As=function(n,e){const t=setTimeout(n,e);return typeof t=="number"&&typeof Deno<"u"&&Deno.unrefTimer?Deno.unrefTimer(t):typeof t=="object"&&t.unref&&t.unref(),t};/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eC{constructor(e,t){this.appCheckProvider=t,this.appName=e.name,Ze(e)&&e.settings.appCheckToken&&(this.serverAppAppCheckToken=e.settings.appCheckToken),this.appCheck=t==null?void 0:t.getImmediate({optional:!0}),this.appCheck||t==null||t.get().then(i=>this.appCheck=i)}getToken(e){if(this.serverAppAppCheckToken){if(e)throw new Error("Attempted reuse of `FirebaseServerApp.appCheckToken` after previous usage failed.");return Promise.resolve({token:this.serverAppAppCheckToken})}return this.appCheck?this.appCheck.getToken(e):new Promise((t,i)=>{setTimeout(()=>{this.appCheck?this.getToken(e).then(t,i):t(null)},0)})}addTokenChangeListener(e){var t;(t=this.appCheckProvider)==null||t.get().then(i=>i.addTokenListener(e))}notifyForInvalidToken(){Ke(`Provided AppCheck credentials for the app named "${this.appName}" are invalid. This usually indicates your app was not initialized correctly.`)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tC{constructor(e,t,i){this.appName_=e,this.firebaseOptions_=t,this.authProvider_=i,this.auth_=null,this.auth_=i.getImmediate({optional:!0}),this.auth_||i.onInit(s=>this.auth_=s)}getToken(e){return this.auth_?this.auth_.getToken(e).catch(t=>t&&t.code==="auth/token-not-initialized"?(Be("Got auth/token-not-initialized error.  Treating as null token."),null):Promise.reject(t)):new Promise((t,i)=>{setTimeout(()=>{this.auth_?this.getToken(e).then(t,i):t(null)},0)})}addTokenChangeListener(e){this.auth_?this.auth_.addAuthTokenListener(e):this.authProvider_.get().then(t=>t.addAuthTokenListener(e))}removeTokenChangeListener(e){this.authProvider_.get().then(t=>t.removeAuthTokenListener(e))}notifyForInvalidToken(){let e='Provided authentication credentials for the app named "'+this.appName_+'" are invalid. This usually indicates your app was not initialized correctly. ';"credential"in this.firebaseOptions_?e+='Make sure the "credential" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':"serviceAccount"in this.firebaseOptions_?e+='Make sure the "serviceAccount" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':e+='Make sure the "apiKey" and "databaseURL" properties provided to initializeApp() match the values provided for your app at https://console.firebase.google.com/.',Ke(e)}}class wo{constructor(e){this.accessToken=e}getToken(e){return Promise.resolve({accessToken:this.accessToken})}addTokenChangeListener(e){e(this.accessToken)}removeTokenChangeListener(e){}notifyForInvalidToken(){}}wo.OWNER="owner";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $l="5",xp="v",Dp="s",Op="r",Vp="f",Lp=/(console\.firebase|firebase-console-\w+\.corp|firebase\.corp)\.google\.com/,Mp="ls",Fp="p",Gl="ac",Up="websocket",Bp="long_polling";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qp{constructor(e,t,i,s,r=!1,o="",l=!1,c=!1,u=null){this.secure=t,this.namespace=i,this.webSocketOnly=s,this.nodeAdmin=r,this.persistenceKey=o,this.includeNamespaceInQueryParams=l,this.isUsingEmulator=c,this.emulatorOptions=u,this._host=e.toLowerCase(),this._domain=this._host.substr(this._host.indexOf(".")+1),this.internalHost=zn.get("host:"+e)||this._host}isCacheableHost(){return this.internalHost.substr(0,2)==="s-"}isCustomHost(){return this._domain!=="firebaseio.com"&&this._domain!=="firebaseio-demo.com"}get host(){return this._host}set host(e){e!==this.internalHost&&(this.internalHost=e,this.isCacheableHost()&&zn.set("host:"+this._host,this.internalHost))}toString(){let e=this.toURLString();return this.persistenceKey&&(e+="<"+this.persistenceKey+">"),e}toURLString(){const e=this.secure?"https://":"http://",t=this.includeNamespaceInQueryParams?`?ns=${this.namespace}`:"";return`${e}${this.host}/${t}`}}function nC(n){return n.host!==n.internalHost||n.isCustomHost()||n.includeNamespaceInQueryParams}function Hp(n,e,t){x(typeof e=="string","typeof type must == string"),x(typeof t=="object","typeof params must == object");let i;if(e===Up)i=(n.secure?"wss://":"ws://")+n.internalHost+"/.ws?";else if(e===Bp)i=(n.secure?"https://":"http://")+n.internalHost+"/.lp?";else throw new Error("Unknown connection type: "+e);nC(n)&&(t.ns=n.namespace);const s=[];return Qe(t,(r,o)=>{s.push(r+"="+o)}),i+s.join("&")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class iC{constructor(){this.counters_={}}incrementCounter(e,t=1){bt(this.counters_,e)||(this.counters_[e]=0),this.counters_[e]+=t}get(){return O_(this.counters_)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Kl={},Ql={};function Yl(n){const e=n.toString();return Kl[e]||(Kl[e]=new iC),Kl[e]}function sC(n,e){const t=n.toString();return Ql[t]||(Ql[t]=e()),Ql[t]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rC{constructor(e){this.onMessage_=e,this.pendingResponses=[],this.currentResponseNum=0,this.closeAfterResponse=-1,this.onClose=null}closeAfter(e,t){this.closeAfterResponse=e,this.onClose=t,this.closeAfterResponse<this.currentResponseNum&&(this.onClose(),this.onClose=null)}handleResponse(e,t){for(this.pendingResponses[e]=t;this.pendingResponses[this.currentResponseNum];){const i=this.pendingResponses[this.currentResponseNum];delete this.pendingResponses[this.currentResponseNum];for(let s=0;s<i.length;++s)i[s]&&Ni(()=>{this.onMessage_(i[s])});if(this.currentResponseNum===this.closeAfterResponse){this.onClose&&(this.onClose(),this.onClose=null);break}this.currentResponseNum++}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zp="start",oC="close",aC="pLPCommand",lC="pRTLPCB",Wp="id",jp="pw",$p="ser",cC="cb",uC="seg",hC="ts",dC="d",fC="dframe",Gp=1870,Kp=30,pC=Gp-Kp,gC=25e3,mC=3e4;class xi{constructor(e,t,i,s,r,o,l){this.connId=e,this.repoInfo=t,this.applicationId=i,this.appCheckToken=s,this.authToken=r,this.transportSessionId=o,this.lastSessionId=l,this.bytesSent=0,this.bytesReceived=0,this.everConnected_=!1,this.log_=bs(e),this.stats_=Yl(t),this.urlFn=c=>(this.appCheckToken&&(c[Gl]=this.appCheckToken),Hp(t,Bp,c))}open(e,t){this.curSegmentNum=0,this.onDisconnect_=t,this.myPacketOrderer=new rC(e),this.isClosed_=!1,this.connectTimeoutTimer_=setTimeout(()=>{this.log_("Timed out trying to connect."),this.onClosed_(),this.connectTimeoutTimer_=null},Math.floor(mC)),jb(()=>{if(this.isClosed_)return;this.scriptTagHolder=new Xl((...r)=>{const[o,l,c,u,f]=r;if(this.incrementIncomingBytes_(r),!!this.scriptTagHolder)if(this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null),this.everConnected_=!0,o===zp)this.id=l,this.password=c;else if(o===oC)l?(this.scriptTagHolder.sendNewPolls=!1,this.myPacketOrderer.closeAfter(l,()=>{this.onClosed_()})):this.onClosed_();else throw new Error("Unrecognized command received: "+o)},(...r)=>{const[o,l]=r;this.incrementIncomingBytes_(r),this.myPacketOrderer.handleResponse(o,l)},()=>{this.onClosed_()},this.urlFn);const i={};i[zp]="t",i[$p]=Math.floor(Math.random()*1e8),this.scriptTagHolder.uniqueCallbackIdentifier&&(i[cC]=this.scriptTagHolder.uniqueCallbackIdentifier),i[xp]=$l,this.transportSessionId&&(i[Dp]=this.transportSessionId),this.lastSessionId&&(i[Mp]=this.lastSessionId),this.applicationId&&(i[Fp]=this.applicationId),this.appCheckToken&&(i[Gl]=this.appCheckToken),typeof location<"u"&&location.hostname&&Lp.test(location.hostname)&&(i[Op]=Vp);const s=this.urlFn(i);this.log_("Connecting via long-poll to "+s),this.scriptTagHolder.addTag(s,()=>{})})}start(){this.scriptTagHolder.startLongPoll(this.id,this.password),this.addDisconnectPingFrame(this.id,this.password)}static forceAllow(){xi.forceAllow_=!0}static forceDisallow(){xi.forceDisallow_=!0}static isAvailable(){return xi.forceAllow_?!0:!xi.forceDisallow_&&typeof document<"u"&&document.createElement!=null&&!Gb()&&!Kb()}markConnectionHealthy(){}shutdown_(){this.isClosed_=!0,this.scriptTagHolder&&(this.scriptTagHolder.close(),this.scriptTagHolder=null),this.myDisconnFrame&&(document.body.removeChild(this.myDisconnFrame),this.myDisconnFrame=null),this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null)}onClosed_(){this.isClosed_||(this.log_("Longpoll is closing itself"),this.shutdown_(),this.onDisconnect_&&(this.onDisconnect_(this.everConnected_),this.onDisconnect_=null))}close(){this.isClosed_||(this.log_("Longpoll is being closed."),this.shutdown_())}send(e){const t=Ee(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const i=Au(t),s=Pp(i,pC);for(let r=0;r<s.length;r++)this.scriptTagHolder.enqueueSegment(this.curSegmentNum,s.length,s[r]),this.curSegmentNum++}addDisconnectPingFrame(e,t){this.myDisconnFrame=document.createElement("iframe");const i={};i[fC]="t",i[Wp]=e,i[jp]=t,this.myDisconnFrame.src=this.urlFn(i),this.myDisconnFrame.style.display="none",document.body.appendChild(this.myDisconnFrame)}incrementIncomingBytes_(e){const t=Ee(e).length;this.bytesReceived+=t,this.stats_.incrementCounter("bytes_received",t)}}class Xl{constructor(e,t,i,s){this.onDisconnect=i,this.urlFn=s,this.outstandingRequests=new Set,this.pendingSegs=[],this.currentSerial=Math.floor(Math.random()*1e8),this.sendNewPolls=!0;{this.uniqueCallbackIdentifier=Hb(),window[aC+this.uniqueCallbackIdentifier]=e,window[lC+this.uniqueCallbackIdentifier]=t,this.myIFrame=Xl.createIFrame_();let r="";this.myIFrame.src&&this.myIFrame.src.substr(0,11)==="javascript:"&&(r='<script>document.domain="'+document.domain+'";<\/script>');const o="<html><body>"+r+"</body></html>";try{this.myIFrame.doc.open(),this.myIFrame.doc.write(o),this.myIFrame.doc.close()}catch(l){Be("frame writing exception"),l.stack&&Be(l.stack),Be(l)}}}static createIFrame_(){const e=document.createElement("iframe");if(e.style.display="none",document.body){document.body.appendChild(e);try{e.contentWindow.document||Be("No IE domain setting required")}catch{const i=document.domain;e.src="javascript:void((function(){document.open();document.domain='"+i+"';document.close();})())"}}else throw"Document body has not initialized. Wait to initialize Firebase until after the document is ready.";return e.contentDocument?e.doc=e.contentDocument:e.contentWindow?e.doc=e.contentWindow.document:e.document&&(e.doc=e.document),e}close(){this.alive=!1,this.myIFrame&&(this.myIFrame.doc.body.textContent="",setTimeout(()=>{this.myIFrame!==null&&(document.body.removeChild(this.myIFrame),this.myIFrame=null)},Math.floor(0)));const e=this.onDisconnect;e&&(this.onDisconnect=null,e())}startLongPoll(e,t){for(this.myID=e,this.myPW=t,this.alive=!0;this.newRequest_(););}newRequest_(){if(this.alive&&this.sendNewPolls&&this.outstandingRequests.size<(this.pendingSegs.length>0?2:1)){this.currentSerial++;const e={};e[Wp]=this.myID,e[jp]=this.myPW,e[$p]=this.currentSerial;let t=this.urlFn(e),i="",s=0;for(;this.pendingSegs.length>0&&this.pendingSegs[0].d.length+Kp+i.length<=Gp;){const o=this.pendingSegs.shift();i=i+"&"+uC+s+"="+o.seg+"&"+hC+s+"="+o.ts+"&"+dC+s+"="+o.d,s++}return t=t+i,this.addLongPollTag_(t,this.currentSerial),!0}else return!1}enqueueSegment(e,t,i){this.pendingSegs.push({seg:e,ts:t,d:i}),this.alive&&this.newRequest_()}addLongPollTag_(e,t){this.outstandingRequests.add(t);const i=()=>{this.outstandingRequests.delete(t),this.newRequest_()},s=setTimeout(i,Math.floor(gC)),r=()=>{clearTimeout(s),i()};this.addTag(e,r)}addTag(e,t){setTimeout(()=>{try{if(!this.sendNewPolls)return;const i=this.myIFrame.doc.createElement("script");i.type="text/javascript",i.async=!0,i.src=e,i.onload=i.onreadystatechange=function(){const s=i.readyState;(!s||s==="loaded"||s==="complete")&&(i.onload=i.onreadystatechange=null,i.parentNode&&i.parentNode.removeChild(i),t())},i.onerror=()=>{Be("Long-poll script failed to load: "+e),this.sendNewPolls=!1,this.close()},this.myIFrame.doc.body.appendChild(i)}catch{}},Math.floor(1))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _C=16384,yC=45e3;let To=null;typeof MozWebSocket<"u"?To=MozWebSocket:typeof WebSocket<"u"&&(To=WebSocket);class rt{constructor(e,t,i,s,r,o,l){this.connId=e,this.applicationId=i,this.appCheckToken=s,this.authToken=r,this.keepaliveTimer=null,this.frames=null,this.totalFrames=0,this.bytesSent=0,this.bytesReceived=0,this.log_=bs(this.connId),this.stats_=Yl(t),this.connURL=rt.connectionURL_(t,o,l,s,i),this.nodeAdmin=t.nodeAdmin}static connectionURL_(e,t,i,s,r){const o={};return o[xp]=$l,typeof location<"u"&&location.hostname&&Lp.test(location.hostname)&&(o[Op]=Vp),t&&(o[Dp]=t),i&&(o[Mp]=i),s&&(o[Gl]=s),r&&(o[Fp]=r),Hp(e,Up,o)}open(e,t){this.onDisconnect=t,this.onMessage=e,this.log_("Websocket connecting to "+this.connURL),this.everConnected_=!1,zn.set("previous_websocket_failure",!0);try{let i;W_(),this.mySock=new To(this.connURL,[],i)}catch(i){this.log_("Error instantiating WebSocket.");const s=i.message||i.data;s&&this.log_(s),this.onClosed_();return}this.mySock.onopen=()=>{this.log_("Websocket connected."),this.everConnected_=!0},this.mySock.onclose=()=>{this.log_("Websocket connection was disconnected."),this.mySock=null,this.onClosed_()},this.mySock.onmessage=i=>{this.handleIncomingFrame(i)},this.mySock.onerror=i=>{this.log_("WebSocket error.  Closing connection.");const s=i.message||i.data;s&&this.log_(s),this.onClosed_()}}start(){}static forceDisallow(){rt.forceDisallow_=!0}static isAvailable(){let e=!1;if(typeof navigator<"u"&&navigator.userAgent){const t=/Android ([0-9]{0,}\.[0-9]{0,})/,i=navigator.userAgent.match(t);i&&i.length>1&&parseFloat(i[1])<4.4&&(e=!0)}return!e&&To!==null&&!rt.forceDisallow_}static previouslyFailed(){return zn.isInMemoryStorage||zn.get("previous_websocket_failure")===!0}markConnectionHealthy(){zn.remove("previous_websocket_failure")}appendFrame_(e){if(this.frames.push(e),this.frames.length===this.totalFrames){const t=this.frames.join("");this.frames=null;const i=Gi(t);this.onMessage(i)}}handleNewFrameCount_(e){this.totalFrames=e,this.frames=[]}extractFrameCount_(e){if(x(this.frames===null,"We already have a frame buffer"),e.length<=6){const t=Number(e);if(!isNaN(t))return this.handleNewFrameCount_(t),null}return this.handleNewFrameCount_(1),e}handleIncomingFrame(e){if(this.mySock===null)return;const t=e.data;if(this.bytesReceived+=t.length,this.stats_.incrementCounter("bytes_received",t.length),this.resetKeepAlive(),this.frames!==null)this.appendFrame_(t);else{const i=this.extractFrameCount_(t);i!==null&&this.appendFrame_(i)}}send(e){this.resetKeepAlive();const t=Ee(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const i=Pp(t,_C);i.length>1&&this.sendString_(String(i.length));for(let s=0;s<i.length;s++)this.sendString_(i[s])}shutdown_(){this.isClosed_=!0,this.keepaliveTimer&&(clearInterval(this.keepaliveTimer),this.keepaliveTimer=null),this.mySock&&(this.mySock.close(),this.mySock=null)}onClosed_(){this.isClosed_||(this.log_("WebSocket is closing itself"),this.shutdown_(),this.onDisconnect&&(this.onDisconnect(this.everConnected_),this.onDisconnect=null))}close(){this.isClosed_||(this.log_("WebSocket is being closed"),this.shutdown_())}resetKeepAlive(){clearInterval(this.keepaliveTimer),this.keepaliveTimer=setInterval(()=>{this.mySock&&this.sendString_("0"),this.resetKeepAlive()},Math.floor(yC))}sendString_(e){try{this.mySock.send(e)}catch(t){this.log_("Exception thrown from WebSocket.send():",t.message||t.data,"Closing connection."),setTimeout(this.onClosed_.bind(this),0)}}}rt.responsesRequiredToBeHealthy=2,rt.healthyTimeout=3e4;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ss{static get ALL_TRANSPORTS(){return[xi,rt]}static get IS_TRANSPORT_INITIALIZED(){return this.globalTransportInitialized_}constructor(e){this.initTransports_(e)}initTransports_(e){const t=rt&&rt.isAvailable();let i=t&&!rt.previouslyFailed();if(e.webSocketOnly&&(t||Ke("wss:// URL used, but browser isn't known to support websockets.  Trying anyway."),i=!0),i)this.transports_=[rt];else{const s=this.transports_=[];for(const r of Ss.ALL_TRANSPORTS)r&&r.isAvailable()&&s.push(r);Ss.globalTransportInitialized_=!0}}initialTransport(){if(this.transports_.length>0)return this.transports_[0];throw new Error("No transports available")}upgradeTransport(){return this.transports_.length>1?this.transports_[1]:null}}Ss.globalTransportInitialized_=!1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vC=6e4,EC=5e3,wC=10*1024,TC=100*1024,Jl="t",Qp="d",IC="s",Yp="r",bC="e",Xp="o",Jp="a",Zp="n",eg="p",CC="h";class AC{constructor(e,t,i,s,r,o,l,c,u,f){this.id=e,this.repoInfo_=t,this.applicationId_=i,this.appCheckToken_=s,this.authToken_=r,this.onMessage_=o,this.onReady_=l,this.onDisconnect_=c,this.onKill_=u,this.lastSessionId=f,this.connectionCount=0,this.pendingDataMessages=[],this.state_=0,this.log_=bs("c:"+this.id+":"),this.transportManager_=new Ss(t),this.log_("Connection created"),this.start_()}start_(){const e=this.transportManager_.initialTransport();this.conn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,null,this.lastSessionId),this.primaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.conn_),i=this.disconnReceiver_(this.conn_);this.tx_=this.conn_,this.rx_=this.conn_,this.secondaryConn_=null,this.isHealthy_=!1,setTimeout(()=>{this.conn_&&this.conn_.open(t,i)},Math.floor(0));const s=e.healthyTimeout||0;s>0&&(this.healthyTimeout_=As(()=>{this.healthyTimeout_=null,this.isHealthy_||(this.conn_&&this.conn_.bytesReceived>TC?(this.log_("Connection exceeded healthy timeout but has received "+this.conn_.bytesReceived+" bytes.  Marking connection healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()):this.conn_&&this.conn_.bytesSent>wC?this.log_("Connection exceeded healthy timeout but has sent "+this.conn_.bytesSent+" bytes.  Leaving connection alive."):(this.log_("Closing unhealthy connection after timeout."),this.close()))},Math.floor(s)))}nextTransportId_(){return"c:"+this.id+":"+this.connectionCount++}disconnReceiver_(e){return t=>{e===this.conn_?this.onConnectionLost_(t):e===this.secondaryConn_?(this.log_("Secondary connection lost."),this.onSecondaryConnectionLost_()):this.log_("closing an old connection")}}connReceiver_(e){return t=>{this.state_!==2&&(e===this.rx_?this.onPrimaryMessageReceived_(t):e===this.secondaryConn_?this.onSecondaryMessageReceived_(t):this.log_("message on old connection"))}}sendRequest(e){const t={t:"d",d:e};this.sendData_(t)}tryCleanupConnection(){this.tx_===this.secondaryConn_&&this.rx_===this.secondaryConn_&&(this.log_("cleaning up and promoting a connection: "+this.secondaryConn_.connId),this.conn_=this.secondaryConn_,this.secondaryConn_=null)}onSecondaryControl_(e){if(Jl in e){const t=e[Jl];t===Jp?this.upgradeIfSecondaryHealthy_():t===Yp?(this.log_("Got a reset on secondary, closing it"),this.secondaryConn_.close(),(this.tx_===this.secondaryConn_||this.rx_===this.secondaryConn_)&&this.close()):t===Xp&&(this.log_("got pong on secondary."),this.secondaryResponsesRequired_--,this.upgradeIfSecondaryHealthy_())}}onSecondaryMessageReceived_(e){const t=Cs("t",e),i=Cs("d",e);if(t==="c")this.onSecondaryControl_(i);else if(t==="d")this.pendingDataMessages.push(i);else throw new Error("Unknown protocol layer: "+t)}upgradeIfSecondaryHealthy_(){this.secondaryResponsesRequired_<=0?(this.log_("Secondary connection is healthy."),this.isHealthy_=!0,this.secondaryConn_.markConnectionHealthy(),this.proceedWithUpgrade_()):(this.log_("sending ping on secondary."),this.secondaryConn_.send({t:"c",d:{t:eg,d:{}}}))}proceedWithUpgrade_(){this.secondaryConn_.start(),this.log_("sending client ack on secondary"),this.secondaryConn_.send({t:"c",d:{t:Jp,d:{}}}),this.log_("Ending transmission on primary"),this.conn_.send({t:"c",d:{t:Zp,d:{}}}),this.tx_=this.secondaryConn_,this.tryCleanupConnection()}onPrimaryMessageReceived_(e){const t=Cs("t",e),i=Cs("d",e);t==="c"?this.onControl_(i):t==="d"&&this.onDataMessage_(i)}onDataMessage_(e){this.onPrimaryResponse_(),this.onMessage_(e)}onPrimaryResponse_(){this.isHealthy_||(this.primaryResponsesRequired_--,this.primaryResponsesRequired_<=0&&(this.log_("Primary connection is healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()))}onControl_(e){const t=Cs(Jl,e);if(Qp in e){const i=e[Qp];if(t===CC){const s={...i};this.repoInfo_.isUsingEmulator&&(s.h=this.repoInfo_.host),this.onHandshake_(s)}else if(t===Zp){this.log_("recvd end transmission on primary"),this.rx_=this.secondaryConn_;for(let s=0;s<this.pendingDataMessages.length;++s)this.onDataMessage_(this.pendingDataMessages[s]);this.pendingDataMessages=[],this.tryCleanupConnection()}else t===IC?this.onConnectionShutdown_(i):t===Yp?this.onReset_(i):t===bC?Wl("Server Error: "+i):t===Xp?(this.log_("got pong on primary."),this.onPrimaryResponse_(),this.sendPingOnPrimaryIfNecessary_()):Wl("Unknown control packet command: "+t)}}onHandshake_(e){const t=e.ts,i=e.v,s=e.h;this.sessionId=e.s,this.repoInfo_.host=s,this.state_===0&&(this.conn_.start(),this.onConnectionEstablished_(this.conn_,t),$l!==i&&Ke("Protocol version mismatch detected"),this.tryStartUpgrade_())}tryStartUpgrade_(){const e=this.transportManager_.upgradeTransport();e&&this.startUpgrade_(e)}startUpgrade_(e){this.secondaryConn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,this.sessionId),this.secondaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.secondaryConn_),i=this.disconnReceiver_(this.secondaryConn_);this.secondaryConn_.open(t,i),As(()=>{this.secondaryConn_&&(this.log_("Timed out trying to upgrade."),this.secondaryConn_.close())},Math.floor(vC))}onReset_(e){this.log_("Reset packet received.  New host: "+e),this.repoInfo_.host=e,this.state_===1?this.close():(this.closeConnections_(),this.start_())}onConnectionEstablished_(e,t){this.log_("Realtime connection established."),this.conn_=e,this.state_=1,this.onReady_&&(this.onReady_(t,this.sessionId),this.onReady_=null),this.primaryResponsesRequired_===0?(this.log_("Primary connection is healthy."),this.isHealthy_=!0):As(()=>{this.sendPingOnPrimaryIfNecessary_()},Math.floor(EC))}sendPingOnPrimaryIfNecessary_(){!this.isHealthy_&&this.state_===1&&(this.log_("sending ping on primary."),this.sendData_({t:"c",d:{t:eg,d:{}}}))}onSecondaryConnectionLost_(){const e=this.secondaryConn_;this.secondaryConn_=null,(this.tx_===e||this.rx_===e)&&this.close()}onConnectionLost_(e){this.conn_=null,!e&&this.state_===0?(this.log_("Realtime connection failed."),this.repoInfo_.isCacheableHost()&&(zn.remove("host:"+this.repoInfo_.host),this.repoInfo_.internalHost=this.repoInfo_.host)):this.state_===1&&this.log_("Realtime connection lost."),this.close()}onConnectionShutdown_(e){this.log_("Connection shutdown command received. Shutting down..."),this.onKill_&&(this.onKill_(e),this.onKill_=null),this.onDisconnect_=null,this.close()}sendData_(e){if(this.state_!==1)throw"Connection is not connected";this.tx_.send(e)}close(){this.state_!==2&&(this.log_("Closing realtime connection."),this.state_=2,this.closeConnections_(),this.onDisconnect_&&(this.onDisconnect_(),this.onDisconnect_=null))}closeConnections_(){this.log_("Shutting down all connections"),this.conn_&&(this.conn_.close(),this.conn_=null),this.secondaryConn_&&(this.secondaryConn_.close(),this.secondaryConn_=null),this.healthyTimeout_&&(clearTimeout(this.healthyTimeout_),this.healthyTimeout_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tg{put(e,t,i,s){}merge(e,t,i,s){}refreshAuthToken(e){}refreshAppCheckToken(e){}onDisconnectPut(e,t,i){}onDisconnectMerge(e,t,i){}onDisconnectCancel(e,t){}reportStats(e){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ng{constructor(e){this.allowedEvents_=e,this.listeners_={},x(Array.isArray(e)&&e.length>0,"Requires a non-empty array")}trigger(e,...t){if(Array.isArray(this.listeners_[e])){const i=[...this.listeners_[e]];for(let s=0;s<i.length;s++)i[s].callback.apply(i[s].context,t)}}on(e,t,i){this.validateEventType_(e),this.listeners_[e]=this.listeners_[e]||[],this.listeners_[e].push({callback:t,context:i});const s=this.getInitialEvent(e);s&&t.apply(i,s)}off(e,t,i){this.validateEventType_(e);const s=this.listeners_[e]||[];for(let r=0;r<s.length;r++)if(s[r].callback===t&&(!i||i===s[r].context)){s.splice(r,1);return}}validateEventType_(e){x(this.allowedEvents_.find(t=>t===e),"Unknown event: "+e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Io extends ng{static getInstance(){return new Io}constructor(){super(["online"]),this.online_=!0,typeof window<"u"&&typeof window.addEventListener<"u"&&!_a()&&(window.addEventListener("online",()=>{this.online_||(this.online_=!0,this.trigger("online",!0))},!1),window.addEventListener("offline",()=>{this.online_&&(this.online_=!1,this.trigger("online",!1))},!1))}getInitialEvent(e){return x(e==="online","Unknown event type: "+e),[this.online_]}currentlyOnline(){return this.online_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ig=32,sg=768;class re{constructor(e,t){if(t===void 0){this.pieces_=e.split("/");let i=0;for(let s=0;s<this.pieces_.length;s++)this.pieces_[s].length>0&&(this.pieces_[i]=this.pieces_[s],i++);this.pieces_.length=i,this.pieceNum_=0}else this.pieces_=e,this.pieceNum_=t}toString(){let e="";for(let t=this.pieceNum_;t<this.pieces_.length;t++)this.pieces_[t]!==""&&(e+="/"+this.pieces_[t]);return e||"/"}}function ie(){return new re("")}function ee(n){return n.pieceNum_>=n.pieces_.length?null:n.pieces_[n.pieceNum_]}function cn(n){return n.pieces_.length-n.pieceNum_}function ae(n){let e=n.pieceNum_;return e<n.pieces_.length&&e++,new re(n.pieces_,e)}function rg(n){return n.pieceNum_<n.pieces_.length?n.pieces_[n.pieces_.length-1]:null}function SC(n){let e="";for(let t=n.pieceNum_;t<n.pieces_.length;t++)n.pieces_[t]!==""&&(e+="/"+encodeURIComponent(String(n.pieces_[t])));return e||"/"}function og(n,e=0){return n.pieces_.slice(n.pieceNum_+e)}function ag(n){if(n.pieceNum_>=n.pieces_.length)return null;const e=[];for(let t=n.pieceNum_;t<n.pieces_.length-1;t++)e.push(n.pieces_[t]);return new re(e,0)}function be(n,e){const t=[];for(let i=n.pieceNum_;i<n.pieces_.length;i++)t.push(n.pieces_[i]);if(e instanceof re)for(let i=e.pieceNum_;i<e.pieces_.length;i++)t.push(e.pieces_[i]);else{const i=e.split("/");for(let s=0;s<i.length;s++)i[s].length>0&&t.push(i[s])}return new re(t,0)}function X(n){return n.pieceNum_>=n.pieces_.length}function He(n,e){const t=ee(n),i=ee(e);if(t===null)return e;if(t===i)return He(ae(n),ae(e));throw new Error("INTERNAL ERROR: innerPath ("+e+") is not within outerPath ("+n+")")}function lg(n,e){if(cn(n)!==cn(e))return!1;for(let t=n.pieceNum_,i=e.pieceNum_;t<=n.pieces_.length;t++,i++)if(n.pieces_[t]!==e.pieces_[i])return!1;return!0}function ot(n,e){let t=n.pieceNum_,i=e.pieceNum_;if(cn(n)>cn(e))return!1;for(;t<n.pieces_.length;){if(n.pieces_[t]!==e.pieces_[i])return!1;++t,++i}return!0}class RC{constructor(e,t){this.errorPrefix_=t,this.parts_=og(e,0),this.byteLength_=Math.max(1,this.parts_.length);for(let i=0;i<this.parts_.length;i++)this.byteLength_+=yr(this.parts_[i]);cg(this)}}function PC(n,e){n.parts_.length>0&&(n.byteLength_+=1),n.parts_.push(e),n.byteLength_+=yr(e),cg(n)}function kC(n){const e=n.parts_.pop();n.byteLength_-=yr(e),n.parts_.length>0&&(n.byteLength_-=1)}function cg(n){if(n.byteLength_>sg)throw new Error(n.errorPrefix_+"has a key path longer than "+sg+" bytes ("+n.byteLength_+").");if(n.parts_.length>ig)throw new Error(n.errorPrefix_+"path specified exceeds the maximum depth that can be written ("+ig+") or object contains a cycle "+jn(n))}function jn(n){return n.parts_.length===0?"":"in property '"+n.parts_.join(".")+"'"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zl extends ng{static getInstance(){return new Zl}constructor(){super(["visible"]);let e,t;typeof document<"u"&&typeof document.addEventListener<"u"&&(typeof document.hidden<"u"?(t="visibilitychange",e="hidden"):typeof document.mozHidden<"u"?(t="mozvisibilitychange",e="mozHidden"):typeof document.msHidden<"u"?(t="msvisibilitychange",e="msHidden"):typeof document.webkitHidden<"u"&&(t="webkitvisibilitychange",e="webkitHidden")),this.visible_=!0,t&&document.addEventListener(t,()=>{const i=!document[e];i!==this.visible_&&(this.visible_=i,this.trigger("visible",i))},!1)}getInitialEvent(e){return x(e==="visible","Unknown event type: "+e),[this.visible_]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rs=1e3,NC=60*5*1e3,ug=30*1e3,xC=1.3,DC=3e4,OC="server_kill",hg=3;class Ot extends tg{constructor(e,t,i,s,r,o,l,c){if(super(),this.repoInfo_=e,this.applicationId_=t,this.onDataUpdate_=i,this.onConnectStatus_=s,this.onServerInfoUpdate_=r,this.authTokenProvider_=o,this.appCheckTokenProvider_=l,this.authOverride_=c,this.id=Ot.nextPersistentConnectionId_++,this.log_=bs("p:"+this.id+":"),this.interruptReasons_={},this.listens=new Map,this.outstandingPuts_=[],this.outstandingGets_=[],this.outstandingPutCount_=0,this.outstandingGetCount_=0,this.onDisconnectRequestQueue_=[],this.connected_=!1,this.reconnectDelay_=Rs,this.maxReconnectDelay_=NC,this.securityDebugCallback_=null,this.lastSessionId=null,this.establishConnectionTimer_=null,this.visible_=!1,this.requestCBHash_={},this.requestNumber_=0,this.realtime_=null,this.authToken_=null,this.appCheckToken_=null,this.forceTokenRefresh_=!1,this.invalidAuthTokenCount_=0,this.invalidAppCheckTokenCount_=0,this.firstConnection_=!0,this.lastConnectionAttemptTime_=null,this.lastConnectionEstablishedTime_=null,c)throw new Error("Auth override specified in options, but not supported on non Node.js platforms");Zl.getInstance().on("visible",this.onVisible_,this),e.host.indexOf("fblocal")===-1&&Io.getInstance().on("online",this.onOnline_,this)}sendRequest(e,t,i){const s=++this.requestNumber_,r={r:s,a:e,b:t};this.log_(Ee(r)),x(this.connected_,"sendRequest call when we're not connected not allowed."),this.realtime_.sendRequest(r),i&&(this.requestCBHash_[s]=i)}get(e){this.initConnection_();const t=new mr,s={action:"g",request:{p:e._path.toString(),q:e._queryObject},onComplete:o=>{const l=o.d;o.s==="ok"?t.resolve(l):t.reject(l)}};this.outstandingGets_.push(s),this.outstandingGetCount_++;const r=this.outstandingGets_.length-1;return this.connected_&&this.sendGet_(r),t.promise}listen(e,t,i,s){this.initConnection_();const r=e._queryIdentifier,o=e._path.toString();this.log_("Listen called for "+o+" "+r),this.listens.has(o)||this.listens.set(o,new Map),x(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"listen() called for non-default but complete query"),x(!this.listens.get(o).has(r),"listen() called twice for same path/queryId.");const l={onComplete:s,hashFn:t,query:e,tag:i};this.listens.get(o).set(r,l),this.connected_&&this.sendListen_(l)}sendGet_(e){const t=this.outstandingGets_[e];this.sendRequest("g",t.request,i=>{delete this.outstandingGets_[e],this.outstandingGetCount_--,this.outstandingGetCount_===0&&(this.outstandingGets_=[]),t.onComplete&&t.onComplete(i)})}sendListen_(e){const t=e.query,i=t._path.toString(),s=t._queryIdentifier;this.log_("Listen on "+i+" for "+s);const r={p:i},o="q";e.tag&&(r.q=t._queryObject,r.t=e.tag),r.h=e.hashFn(),this.sendRequest(o,r,l=>{const c=l.d,u=l.s;Ot.warnOnListenWarnings_(c,t),(this.listens.get(i)&&this.listens.get(i).get(s))===e&&(this.log_("listen response",l),u!=="ok"&&this.removeListen_(i,s),e.onComplete&&e.onComplete(u,c))})}static warnOnListenWarnings_(e,t){if(e&&typeof e=="object"&&bt(e,"w")){const i=ri(e,"w");if(Array.isArray(i)&&~i.indexOf("no_index")){const s='".indexOn": "'+t._queryParams.getIndex().toString()+'"',r=t._path.toString();Ke(`Using an unspecified index. Your data will be downloaded and filtered on the client. Consider adding ${s} at ${r} to your security rules for better performance.`)}}}refreshAuthToken(e){this.authToken_=e,this.log_("Auth token refreshed"),this.authToken_?this.tryAuth():this.connected_&&this.sendRequest("unauth",{},()=>{}),this.reduceReconnectDelayIfAdminCredential_(e)}reduceReconnectDelayIfAdminCredential_(e){(e&&e.length===40||J_(e))&&(this.log_("Admin auth credential detected.  Reducing max reconnect time."),this.maxReconnectDelay_=ug)}refreshAppCheckToken(e){this.appCheckToken_=e,this.log_("App check token refreshed"),this.appCheckToken_?this.tryAppCheck():this.connected_&&this.sendRequest("unappeck",{},()=>{})}tryAuth(){if(this.connected_&&this.authToken_){const e=this.authToken_,t=X_(e)?"auth":"gauth",i={cred:e};this.authOverride_===null?i.noauth=!0:typeof this.authOverride_=="object"&&(i.authvar=this.authOverride_),this.sendRequest(t,i,s=>{const r=s.s,o=s.d||"error";this.authToken_===e&&(r==="ok"?this.invalidAuthTokenCount_=0:this.onAuthRevoked_(r,o))})}}tryAppCheck(){this.connected_&&this.appCheckToken_&&this.sendRequest("appcheck",{token:this.appCheckToken_},e=>{const t=e.s,i=e.d||"error";t==="ok"?this.invalidAppCheckTokenCount_=0:this.onAppCheckRevoked_(t,i)})}unlisten(e,t){const i=e._path.toString(),s=e._queryIdentifier;this.log_("Unlisten called for "+i+" "+s),x(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"unlisten() called for non-default but complete query"),this.removeListen_(i,s)&&this.connected_&&this.sendUnlisten_(i,s,e._queryObject,t)}sendUnlisten_(e,t,i,s){this.log_("Unlisten on "+e+" for "+t);const r={p:e},o="n";s&&(r.q=i,r.t=s),this.sendRequest(o,r)}onDisconnectPut(e,t,i){this.initConnection_(),this.connected_?this.sendOnDisconnect_("o",e,t,i):this.onDisconnectRequestQueue_.push({pathString:e,action:"o",data:t,onComplete:i})}onDisconnectMerge(e,t,i){this.initConnection_(),this.connected_?this.sendOnDisconnect_("om",e,t,i):this.onDisconnectRequestQueue_.push({pathString:e,action:"om",data:t,onComplete:i})}onDisconnectCancel(e,t){this.initConnection_(),this.connected_?this.sendOnDisconnect_("oc",e,null,t):this.onDisconnectRequestQueue_.push({pathString:e,action:"oc",data:null,onComplete:t})}sendOnDisconnect_(e,t,i,s){const r={p:t,d:i};this.log_("onDisconnect "+e,r),this.sendRequest(e,r,o=>{s&&setTimeout(()=>{s(o.s,o.d)},Math.floor(0))})}put(e,t,i,s){this.putInternal("p",e,t,i,s)}merge(e,t,i,s){this.putInternal("m",e,t,i,s)}putInternal(e,t,i,s,r){this.initConnection_();const o={p:t,d:i};r!==void 0&&(o.h=r),this.outstandingPuts_.push({action:e,request:o,onComplete:s}),this.outstandingPutCount_++;const l=this.outstandingPuts_.length-1;this.connected_?this.sendPut_(l):this.log_("Buffering put: "+t)}sendPut_(e){const t=this.outstandingPuts_[e].action,i=this.outstandingPuts_[e].request,s=this.outstandingPuts_[e].onComplete;this.outstandingPuts_[e].queued=this.connected_,this.sendRequest(t,i,r=>{this.log_(t+" response",r),delete this.outstandingPuts_[e],this.outstandingPutCount_--,this.outstandingPutCount_===0&&(this.outstandingPuts_=[]),s&&s(r.s,r.d)})}reportStats(e){if(this.connected_){const t={c:e};this.log_("reportStats",t),this.sendRequest("s",t,i=>{if(i.s!=="ok"){const r=i.d;this.log_("reportStats","Error sending stats: "+r)}})}}onDataMessage_(e){if("r"in e){this.log_("from server: "+Ee(e));const t=e.r,i=this.requestCBHash_[t];i&&(delete this.requestCBHash_[t],i(e.b))}else{if("error"in e)throw"A server-side error has occurred: "+e.error;"a"in e&&this.onDataPush_(e.a,e.b)}}onDataPush_(e,t){this.log_("handleServerMessage",e,t),e==="d"?this.onDataUpdate_(t.p,t.d,!1,t.t):e==="m"?this.onDataUpdate_(t.p,t.d,!0,t.t):e==="c"?this.onListenRevoked_(t.p,t.q):e==="ac"?this.onAuthRevoked_(t.s,t.d):e==="apc"?this.onAppCheckRevoked_(t.s,t.d):e==="sd"?this.onSecurityDebugPacket_(t):Wl("Unrecognized action received from server: "+Ee(e)+`
Are you using the latest client?`)}onReady_(e,t){this.log_("connection ready"),this.connected_=!0,this.lastConnectionEstablishedTime_=new Date().getTime(),this.handleTimestamp_(e),this.lastSessionId=t,this.firstConnection_&&this.sendConnectStats_(),this.restoreState_(),this.firstConnection_=!1,this.onConnectStatus_(!0)}scheduleConnect_(e){x(!this.realtime_,"Scheduling a connect when we're already connected/ing?"),this.establishConnectionTimer_&&clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=setTimeout(()=>{this.establishConnectionTimer_=null,this.establishConnection_()},Math.floor(e))}initConnection_(){!this.realtime_&&this.firstConnection_&&this.scheduleConnect_(0)}onVisible_(e){e&&!this.visible_&&this.reconnectDelay_===this.maxReconnectDelay_&&(this.log_("Window became visible.  Reducing delay."),this.reconnectDelay_=Rs,this.realtime_||this.scheduleConnect_(0)),this.visible_=e}onOnline_(e){e?(this.log_("Browser went online."),this.reconnectDelay_=Rs,this.realtime_||this.scheduleConnect_(0)):(this.log_("Browser went offline.  Killing connection."),this.realtime_&&this.realtime_.close())}onRealtimeDisconnect_(){if(this.log_("data client disconnected"),this.connected_=!1,this.realtime_=null,this.cancelSentTransactions_(),this.requestCBHash_={},this.shouldReconnect_()){this.visible_?this.lastConnectionEstablishedTime_&&(new Date().getTime()-this.lastConnectionEstablishedTime_>DC&&(this.reconnectDelay_=Rs),this.lastConnectionEstablishedTime_=null):(this.log_("Window isn't visible.  Delaying reconnect."),this.reconnectDelay_=this.maxReconnectDelay_,this.lastConnectionAttemptTime_=new Date().getTime());const e=Math.max(0,new Date().getTime()-this.lastConnectionAttemptTime_);let t=Math.max(0,this.reconnectDelay_-e);t=Math.random()*t,this.log_("Trying to reconnect in "+t+"ms"),this.scheduleConnect_(t),this.reconnectDelay_=Math.min(this.maxReconnectDelay_,this.reconnectDelay_*xC)}this.onConnectStatus_(!1)}async establishConnection_(){if(this.shouldReconnect_()){this.log_("Making a connection attempt"),this.lastConnectionAttemptTime_=new Date().getTime(),this.lastConnectionEstablishedTime_=null;const e=this.onDataMessage_.bind(this),t=this.onReady_.bind(this),i=this.onRealtimeDisconnect_.bind(this),s=this.id+":"+Ot.nextConnectionId_++,r=this.lastSessionId;let o=!1,l=null;const c=function(){l?l.close():(o=!0,i())},u=function(p){x(l,"sendRequest call when we're not connected not allowed."),l.sendRequest(p)};this.realtime_={close:c,sendRequest:u};const f=this.forceTokenRefresh_;this.forceTokenRefresh_=!1;try{const[p,m]=await Promise.all([this.authTokenProvider_.getToken(f),this.appCheckTokenProvider_.getToken(f)]);o?Be("getToken() completed but was canceled"):(Be("getToken() completed. Creating connection."),this.authToken_=p&&p.accessToken,this.appCheckToken_=m&&m.token,l=new AC(s,this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,e,t,i,b=>{Ke(b+" ("+this.repoInfo_.toString()+")"),this.interrupt(OC)},r))}catch(p){this.log_("Failed to get token: "+p),o||(this.repoInfo_.nodeAdmin&&Ke(p),c())}}}interrupt(e){Be("Interrupting connection for reason: "+e),this.interruptReasons_[e]=!0,this.realtime_?this.realtime_.close():(this.establishConnectionTimer_&&(clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=null),this.connected_&&this.onRealtimeDisconnect_())}resume(e){Be("Resuming connection for reason: "+e),delete this.interruptReasons_[e],ya(this.interruptReasons_)&&(this.reconnectDelay_=Rs,this.realtime_||this.scheduleConnect_(0))}handleTimestamp_(e){const t=e-new Date().getTime();this.onServerInfoUpdate_({serverTimeOffset:t})}cancelSentTransactions_(){for(let e=0;e<this.outstandingPuts_.length;e++){const t=this.outstandingPuts_[e];t&&"h"in t.request&&t.queued&&(t.onComplete&&t.onComplete("disconnect"),delete this.outstandingPuts_[e],this.outstandingPutCount_--)}this.outstandingPutCount_===0&&(this.outstandingPuts_=[])}onListenRevoked_(e,t){let i;t?i=t.map(r=>jl(r)).join("$"):i="default";const s=this.removeListen_(e,i);s&&s.onComplete&&s.onComplete("permission_denied")}removeListen_(e,t){const i=new re(e).toString();let s;if(this.listens.has(i)){const r=this.listens.get(i);s=r.get(t),r.delete(t),r.size===0&&this.listens.delete(i)}else s=void 0;return s}onAuthRevoked_(e,t){Be("Auth token revoked: "+e+"/"+t),this.authToken_=null,this.forceTokenRefresh_=!0,this.realtime_.close(),(e==="invalid_token"||e==="permission_denied")&&(this.invalidAuthTokenCount_++,this.invalidAuthTokenCount_>=hg&&(this.reconnectDelay_=ug,this.authTokenProvider_.notifyForInvalidToken()))}onAppCheckRevoked_(e,t){Be("App check token revoked: "+e+"/"+t),this.appCheckToken_=null,this.forceTokenRefresh_=!0,(e==="invalid_token"||e==="permission_denied")&&(this.invalidAppCheckTokenCount_++,this.invalidAppCheckTokenCount_>=hg&&this.appCheckTokenProvider_.notifyForInvalidToken())}onSecurityDebugPacket_(e){this.securityDebugCallback_?this.securityDebugCallback_(e):"msg"in e&&console.log("FIREBASE: "+e.msg.replace(`
`,`
FIREBASE: `))}restoreState_(){this.tryAuth(),this.tryAppCheck();for(const e of this.listens.values())for(const t of e.values())this.sendListen_(t);for(let e=0;e<this.outstandingPuts_.length;e++)this.outstandingPuts_[e]&&this.sendPut_(e);for(;this.onDisconnectRequestQueue_.length;){const e=this.onDisconnectRequestQueue_.shift();this.sendOnDisconnect_(e.action,e.pathString,e.data,e.onComplete)}for(let e=0;e<this.outstandingGets_.length;e++)this.outstandingGets_[e]&&this.sendGet_(e)}sendConnectStats_(){const e={};let t="js";e["sdk."+t+"."+bp.replace(/\./g,"-")]=1,_a()?e["framework.cordova"]=1:Du()&&(e["framework.reactnative"]=1),this.reportStats(e)}shouldReconnect_(){const e=Io.getInstance().currentlyOnline();return ya(this.interruptReasons_)&&e}}Ot.nextPersistentConnectionId_=0,Ot.nextConnectionId_=0;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Q{constructor(e,t){this.name=e,this.node=t}static Wrap(e,t){return new Q(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bo{getCompare(){return this.compare.bind(this)}indexedValueChanged(e,t){const i=new Q(Pi,e),s=new Q(Pi,t);return this.compare(i,s)!==0}minPost(){return Q.MIN}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Co;class dg extends bo{static get __EMPTY_NODE(){return Co}static set __EMPTY_NODE(e){Co=e}compare(e,t){return ki(e.name,t.name)}isDefinedOn(e){throw si("KeyIndex.isDefinedOn not expected to be called.")}indexedValueChanged(e,t){return!1}minPost(){return Q.MIN}maxPost(){return new Q(Wn,Co)}makePost(e,t){return x(typeof e=="string","KeyIndex indexValue must always be a string."),new Q(e,Co)}toString(){return".key"}}const Di=new dg;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ao{constructor(e,t,i,s,r=null){this.isReverse_=s,this.resultGenerator_=r,this.nodeStack_=[];let o=1;for(;!e.isEmpty();)if(e=e,o=t?i(e.key,t):1,s&&(o*=-1),o<0)this.isReverse_?e=e.left:e=e.right;else if(o===0){this.nodeStack_.push(e);break}else this.nodeStack_.push(e),this.isReverse_?e=e.right:e=e.left}getNext(){if(this.nodeStack_.length===0)return null;let e=this.nodeStack_.pop(),t;if(this.resultGenerator_?t=this.resultGenerator_(e.key,e.value):t={key:e.key,value:e.value},this.isReverse_)for(e=e.left;!e.isEmpty();)this.nodeStack_.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack_.push(e),e=e.left;return t}hasNext(){return this.nodeStack_.length>0}peek(){if(this.nodeStack_.length===0)return null;const e=this.nodeStack_[this.nodeStack_.length-1];return this.resultGenerator_?this.resultGenerator_(e.key,e.value):{key:e.key,value:e.value}}}class Re{constructor(e,t,i,s,r){this.key=e,this.value=t,this.color=i??Re.RED,this.left=s??Ye.EMPTY_NODE,this.right=r??Ye.EMPTY_NODE}copy(e,t,i,s,r){return new Re(e??this.key,t??this.value,i??this.color,s??this.left,r??this.right)}count(){return this.left.count()+1+this.right.count()}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||!!e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min_(){return this.left.isEmpty()?this:this.left.min_()}minKey(){return this.min_().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,i){let s=this;const r=i(e,s.key);return r<0?s=s.copy(null,null,null,s.left.insert(e,t,i),null):r===0?s=s.copy(null,t,null,null,null):s=s.copy(null,null,null,null,s.right.insert(e,t,i)),s.fixUp_()}removeMin_(){if(this.left.isEmpty())return Ye.EMPTY_NODE;let e=this;return!e.left.isRed_()&&!e.left.left.isRed_()&&(e=e.moveRedLeft_()),e=e.copy(null,null,null,e.left.removeMin_(),null),e.fixUp_()}remove(e,t){let i,s;if(i=this,t(e,i.key)<0)!i.left.isEmpty()&&!i.left.isRed_()&&!i.left.left.isRed_()&&(i=i.moveRedLeft_()),i=i.copy(null,null,null,i.left.remove(e,t),null);else{if(i.left.isRed_()&&(i=i.rotateRight_()),!i.right.isEmpty()&&!i.right.isRed_()&&!i.right.left.isRed_()&&(i=i.moveRedRight_()),t(e,i.key)===0){if(i.right.isEmpty())return Ye.EMPTY_NODE;s=i.right.min_(),i=i.copy(s.key,s.value,null,null,i.right.removeMin_())}i=i.copy(null,null,null,null,i.right.remove(e,t))}return i.fixUp_()}isRed_(){return this.color}fixUp_(){let e=this;return e.right.isRed_()&&!e.left.isRed_()&&(e=e.rotateLeft_()),e.left.isRed_()&&e.left.left.isRed_()&&(e=e.rotateRight_()),e.left.isRed_()&&e.right.isRed_()&&(e=e.colorFlip_()),e}moveRedLeft_(){let e=this.colorFlip_();return e.right.left.isRed_()&&(e=e.copy(null,null,null,null,e.right.rotateRight_()),e=e.rotateLeft_(),e=e.colorFlip_()),e}moveRedRight_(){let e=this.colorFlip_();return e.left.left.isRed_()&&(e=e.rotateRight_(),e=e.colorFlip_()),e}rotateLeft_(){const e=this.copy(null,null,Re.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight_(){const e=this.copy(null,null,Re.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip_(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth_(){const e=this.check_();return Math.pow(2,e)<=this.count()+1}check_(){if(this.isRed_()&&this.left.isRed_())throw new Error("Red node has red child("+this.key+","+this.value+")");if(this.right.isRed_())throw new Error("Right child of ("+this.key+","+this.value+") is red");const e=this.left.check_();if(e!==this.right.check_())throw new Error("Black depths differ");return e+(this.isRed_()?0:1)}}Re.RED=!0,Re.BLACK=!1;class VC{copy(e,t,i,s,r){return this}insert(e,t,i){return new Re(e,t,null)}remove(e,t){return this}count(){return 0}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}check_(){return 0}isRed_(){return!1}}class Ye{constructor(e,t=Ye.EMPTY_NODE){this.comparator_=e,this.root_=t}insert(e,t){return new Ye(this.comparator_,this.root_.insert(e,t,this.comparator_).copy(null,null,Re.BLACK,null,null))}remove(e){return new Ye(this.comparator_,this.root_.remove(e,this.comparator_).copy(null,null,Re.BLACK,null,null))}get(e){let t,i=this.root_;for(;!i.isEmpty();){if(t=this.comparator_(e,i.key),t===0)return i.value;t<0?i=i.left:t>0&&(i=i.right)}return null}getPredecessorKey(e){let t,i=this.root_,s=null;for(;!i.isEmpty();)if(t=this.comparator_(e,i.key),t===0){if(i.left.isEmpty())return s?s.key:null;for(i=i.left;!i.right.isEmpty();)i=i.right;return i.key}else t<0?i=i.left:t>0&&(s=i,i=i.right);throw new Error("Attempted to find predecessor key for a nonexistent key.  What gives?")}isEmpty(){return this.root_.isEmpty()}count(){return this.root_.count()}minKey(){return this.root_.minKey()}maxKey(){return this.root_.maxKey()}inorderTraversal(e){return this.root_.inorderTraversal(e)}reverseTraversal(e){return this.root_.reverseTraversal(e)}getIterator(e){return new Ao(this.root_,null,this.comparator_,!1,e)}getIteratorFrom(e,t){return new Ao(this.root_,e,this.comparator_,!1,t)}getReverseIteratorFrom(e,t){return new Ao(this.root_,e,this.comparator_,!0,t)}getReverseIterator(e){return new Ao(this.root_,null,this.comparator_,!0,e)}}Ye.EMPTY_NODE=new VC;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function LC(n,e){return ki(n.name,e.name)}function ec(n,e){return ki(n,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let tc;function MC(n){tc=n}const fg=function(n){return typeof n=="number"?"number:"+kp(n):"string:"+n},pg=function(n){if(n.isLeafNode()){const e=n.val();x(typeof e=="string"||typeof e=="number"||typeof e=="object"&&bt(e,".sv"),"Priority must be a string or number.")}else x(n===tc||n.isEmpty(),"priority of unexpected type.");x(n===tc||n.getPriority().isEmpty(),"Priority nodes can't have a priority of their own.")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let gg;class Pe{static set __childrenNodeConstructor(e){gg=e}static get __childrenNodeConstructor(){return gg}constructor(e,t=Pe.__childrenNodeConstructor.EMPTY_NODE){this.value_=e,this.priorityNode_=t,this.lazyHash_=null,x(this.value_!==void 0&&this.value_!==null,"LeafNode shouldn't be created with null/undefined value."),pg(this.priorityNode_)}isLeafNode(){return!0}getPriority(){return this.priorityNode_}updatePriority(e){return new Pe(this.value_,e)}getImmediateChild(e){return e===".priority"?this.priorityNode_:Pe.__childrenNodeConstructor.EMPTY_NODE}getChild(e){return X(e)?this:ee(e)===".priority"?this.priorityNode_:Pe.__childrenNodeConstructor.EMPTY_NODE}hasChild(){return!1}getPredecessorChildName(e,t){return null}updateImmediateChild(e,t){return e===".priority"?this.updatePriority(t):t.isEmpty()&&e!==".priority"?this:Pe.__childrenNodeConstructor.EMPTY_NODE.updateImmediateChild(e,t).updatePriority(this.priorityNode_)}updateChild(e,t){const i=ee(e);return i===null?t:t.isEmpty()&&i!==".priority"?this:(x(i!==".priority"||cn(e)===1,".priority must be the last token in a path"),this.updateImmediateChild(i,Pe.__childrenNodeConstructor.EMPTY_NODE.updateChild(ae(e),t)))}isEmpty(){return!1}numChildren(){return 0}forEachChild(e,t){return!1}val(e){return e&&!this.getPriority().isEmpty()?{".value":this.getValue(),".priority":this.getPriority().val()}:this.getValue()}hash(){if(this.lazyHash_===null){let e="";this.priorityNode_.isEmpty()||(e+="priority:"+fg(this.priorityNode_.val())+":");const t=typeof this.value_;e+=t+":",t==="number"?e+=kp(this.value_):e+=this.value_,this.lazyHash_=Ap(e)}return this.lazyHash_}getValue(){return this.value_}compareTo(e){return e===Pe.__childrenNodeConstructor.EMPTY_NODE?1:e instanceof Pe.__childrenNodeConstructor?-1:(x(e.isLeafNode(),"Unknown node type"),this.compareToLeafNode_(e))}compareToLeafNode_(e){const t=typeof e.value_,i=typeof this.value_,s=Pe.VALUE_TYPE_ORDER.indexOf(t),r=Pe.VALUE_TYPE_ORDER.indexOf(i);return x(s>=0,"Unknown leaf type: "+t),x(r>=0,"Unknown leaf type: "+i),s===r?i==="object"?0:this.value_<e.value_?-1:this.value_===e.value_?0:1:r-s}withIndex(){return this}isIndexed(){return!0}equals(e){if(e===this)return!0;if(e.isLeafNode()){const t=e;return this.value_===t.value_&&this.priorityNode_.equals(t.priorityNode_)}else return!1}}Pe.VALUE_TYPE_ORDER=["object","boolean","number","string"];/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let mg,_g;function FC(n){mg=n}function UC(n){_g=n}class BC extends bo{compare(e,t){const i=e.node.getPriority(),s=t.node.getPriority(),r=i.compareTo(s);return r===0?ki(e.name,t.name):r}isDefinedOn(e){return!e.getPriority().isEmpty()}indexedValueChanged(e,t){return!e.getPriority().equals(t.getPriority())}minPost(){return Q.MIN}maxPost(){return new Q(Wn,new Pe("[PRIORITY-POST]",_g))}makePost(e,t){const i=mg(e);return new Q(t,new Pe("[PRIORITY-POST]",i))}toString(){return".priority"}}const pe=new BC;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qC=Math.log(2);class HC{constructor(e){const t=r=>parseInt(Math.log(r)/qC,10),i=r=>parseInt(Array(r+1).join("1"),2);this.count=t(e+1),this.current_=this.count-1;const s=i(this.count);this.bits_=e+1&s}nextBitIsOne(){const e=!(this.bits_&1<<this.current_);return this.current_--,e}}const So=function(n,e,t,i){n.sort(e);const s=function(c,u){const f=u-c;let p,m;if(f===0)return null;if(f===1)return p=n[c],m=t?t(p):p,new Re(m,p.node,Re.BLACK,null,null);{const b=parseInt(f/2,10)+c,S=s(c,b),N=s(b+1,u);return p=n[b],m=t?t(p):p,new Re(m,p.node,Re.BLACK,S,N)}},r=function(c){let u=null,f=null,p=n.length;const m=function(S,N){const P=p-S,D=p;p-=S;const V=s(P+1,D),U=n[P],W=t?t(U):U;b(new Re(W,U.node,N,null,V))},b=function(S){u?(u.left=S,u=S):(f=S,u=S)};for(let S=0;S<c.count;++S){const N=c.nextBitIsOne(),P=Math.pow(2,c.count-(S+1));N?m(P,Re.BLACK):(m(P,Re.BLACK),m(P,Re.RED))}return f},o=new HC(n.length),l=r(o);return new Ye(i||e,l)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let nc;const Oi={};class Vt{static get Default(){return x(Oi&&pe,"ChildrenNode.ts has not been loaded"),nc=nc||new Vt({".priority":Oi},{".priority":pe}),nc}constructor(e,t){this.indexes_=e,this.indexSet_=t}get(e){const t=ri(this.indexes_,e);if(!t)throw new Error("No index defined for "+e);return t instanceof Ye?t:null}hasIndex(e){return bt(this.indexSet_,e.toString())}addIndex(e,t){x(e!==Di,"KeyIndex always exists and isn't meant to be added to the IndexMap.");const i=[];let s=!1;const r=t.getIterator(Q.Wrap);let o=r.getNext();for(;o;)s=s||e.isDefinedOn(o.node),i.push(o),o=r.getNext();let l;s?l=So(i,e.getCompare()):l=Oi;const c=e.toString(),u={...this.indexSet_};u[c]=e;const f={...this.indexes_};return f[c]=l,new Vt(f,u)}addToIndexes(e,t){const i=_r(this.indexes_,(s,r)=>{const o=ri(this.indexSet_,r);if(x(o,"Missing index implementation for "+r),s===Oi)if(o.isDefinedOn(e.node)){const l=[],c=t.getIterator(Q.Wrap);let u=c.getNext();for(;u;)u.name!==e.name&&l.push(u),u=c.getNext();return l.push(e),So(l,o.getCompare())}else return Oi;else{const l=t.get(e.name);let c=s;return l&&(c=c.remove(new Q(e.name,l))),c.insert(e,e.node)}});return new Vt(i,this.indexSet_)}removeFromIndexes(e,t){const i=_r(this.indexes_,s=>{if(s===Oi)return s;{const r=t.get(e.name);return r?s.remove(new Q(e.name,r)):s}});return new Vt(i,this.indexSet_)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ps;class H{static get EMPTY_NODE(){return Ps||(Ps=new H(new Ye(ec),null,Vt.Default))}constructor(e,t,i){this.children_=e,this.priorityNode_=t,this.indexMap_=i,this.lazyHash_=null,this.priorityNode_&&pg(this.priorityNode_),this.children_.isEmpty()&&x(!this.priorityNode_||this.priorityNode_.isEmpty(),"An empty node cannot have a priority")}isLeafNode(){return!1}getPriority(){return this.priorityNode_||Ps}updatePriority(e){return this.children_.isEmpty()?this:new H(this.children_,e,this.indexMap_)}getImmediateChild(e){if(e===".priority")return this.getPriority();{const t=this.children_.get(e);return t===null?Ps:t}}getChild(e){const t=ee(e);return t===null?this:this.getImmediateChild(t).getChild(ae(e))}hasChild(e){return this.children_.get(e)!==null}updateImmediateChild(e,t){if(x(t,"We should always be passing snapshot nodes"),e===".priority")return this.updatePriority(t);{const i=new Q(e,t);let s,r;t.isEmpty()?(s=this.children_.remove(e),r=this.indexMap_.removeFromIndexes(i,this.children_)):(s=this.children_.insert(e,t),r=this.indexMap_.addToIndexes(i,this.children_));const o=s.isEmpty()?Ps:this.priorityNode_;return new H(s,o,r)}}updateChild(e,t){const i=ee(e);if(i===null)return t;{x(ee(e)!==".priority"||cn(e)===1,".priority must be the last token in a path");const s=this.getImmediateChild(i).updateChild(ae(e),t);return this.updateImmediateChild(i,s)}}isEmpty(){return this.children_.isEmpty()}numChildren(){return this.children_.count()}val(e){if(this.isEmpty())return null;const t={};let i=0,s=0,r=!0;if(this.forEachChild(pe,(o,l)=>{t[o]=l.val(e),i++,r&&H.INTEGER_REGEXP_.test(o)?s=Math.max(s,Number(o)):r=!1}),!e&&r&&s<2*i){const o=[];for(const l in t)o[l]=t[l];return o}else return e&&!this.getPriority().isEmpty()&&(t[".priority"]=this.getPriority().val()),t}hash(){if(this.lazyHash_===null){let e="";this.getPriority().isEmpty()||(e+="priority:"+fg(this.getPriority().val())+":"),this.forEachChild(pe,(t,i)=>{const s=i.hash();s!==""&&(e+=":"+t+":"+s)}),this.lazyHash_=e===""?"":Ap(e)}return this.lazyHash_}getPredecessorChildName(e,t,i){const s=this.resolveIndex_(i);if(s){const r=s.getPredecessorKey(new Q(e,t));return r?r.name:null}else return this.children_.getPredecessorKey(e)}getFirstChildName(e){const t=this.resolveIndex_(e);if(t){const i=t.minKey();return i&&i.name}else return this.children_.minKey()}getFirstChild(e){const t=this.getFirstChildName(e);return t?new Q(t,this.children_.get(t)):null}getLastChildName(e){const t=this.resolveIndex_(e);if(t){const i=t.maxKey();return i&&i.name}else return this.children_.maxKey()}getLastChild(e){const t=this.getLastChildName(e);return t?new Q(t,this.children_.get(t)):null}forEachChild(e,t){const i=this.resolveIndex_(e);return i?i.inorderTraversal(s=>t(s.name,s.node)):this.children_.inorderTraversal(t)}getIterator(e){return this.getIteratorFrom(e.minPost(),e)}getIteratorFrom(e,t){const i=this.resolveIndex_(t);if(i)return i.getIteratorFrom(e,s=>s);{const s=this.children_.getIteratorFrom(e.name,Q.Wrap);let r=s.peek();for(;r!=null&&t.compare(r,e)<0;)s.getNext(),r=s.peek();return s}}getReverseIterator(e){return this.getReverseIteratorFrom(e.maxPost(),e)}getReverseIteratorFrom(e,t){const i=this.resolveIndex_(t);if(i)return i.getReverseIteratorFrom(e,s=>s);{const s=this.children_.getReverseIteratorFrom(e.name,Q.Wrap);let r=s.peek();for(;r!=null&&t.compare(r,e)>0;)s.getNext(),r=s.peek();return s}}compareTo(e){return this.isEmpty()?e.isEmpty()?0:-1:e.isLeafNode()||e.isEmpty()?1:e===ks?-1:0}withIndex(e){if(e===Di||this.indexMap_.hasIndex(e))return this;{const t=this.indexMap_.addIndex(e,this.children_);return new H(this.children_,this.priorityNode_,t)}}isIndexed(e){return e===Di||this.indexMap_.hasIndex(e)}equals(e){if(e===this)return!0;if(e.isLeafNode())return!1;{const t=e;if(this.getPriority().equals(t.getPriority()))if(this.children_.count()===t.children_.count()){const i=this.getIterator(pe),s=t.getIterator(pe);let r=i.getNext(),o=s.getNext();for(;r&&o;){if(r.name!==o.name||!r.node.equals(o.node))return!1;r=i.getNext(),o=s.getNext()}return r===null&&o===null}else return!1;else return!1}}resolveIndex_(e){return e===Di?null:this.indexMap_.get(e.toString())}}H.INTEGER_REGEXP_=/^(0|[1-9]\d*)$/;class zC extends H{constructor(){super(new Ye(ec),H.EMPTY_NODE,Vt.Default)}compareTo(e){return e===this?0:1}equals(e){return e===this}getPriority(){return this}getImmediateChild(e){return H.EMPTY_NODE}isEmpty(){return!1}}const ks=new zC;Object.defineProperties(Q,{MIN:{value:new Q(Pi,H.EMPTY_NODE)},MAX:{value:new Q(Wn,ks)}}),dg.__EMPTY_NODE=H.EMPTY_NODE,Pe.__childrenNodeConstructor=H,MC(ks),UC(ks);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const WC=!0;function ke(n,e=null){if(n===null)return H.EMPTY_NODE;if(typeof n=="object"&&".priority"in n&&(e=n[".priority"]),x(e===null||typeof e=="string"||typeof e=="number"||typeof e=="object"&&".sv"in e,"Invalid priority type found: "+typeof e),typeof n=="object"&&".value"in n&&n[".value"]!==null&&(n=n[".value"]),typeof n!="object"||".sv"in n){const t=n;return new Pe(t,ke(e))}if(!(n instanceof Array)&&WC){const t=[];let i=!1;if(Qe(n,(o,l)=>{if(o.substring(0,1)!=="."){const c=ke(l);c.isEmpty()||(i=i||!c.getPriority().isEmpty(),t.push(new Q(o,c)))}}),t.length===0)return H.EMPTY_NODE;const r=So(t,LC,o=>o.name,ec);if(i){const o=So(t,pe.getCompare());return new H(r,ke(e),new Vt({".priority":o},{".priority":pe}))}else return new H(r,ke(e),Vt.Default)}else{let t=H.EMPTY_NODE;return Qe(n,(i,s)=>{if(bt(n,i)&&i.substring(0,1)!=="."){const r=ke(s);(r.isLeafNode()||!r.isEmpty())&&(t=t.updateImmediateChild(i,r))}}),t.updatePriority(ke(e))}}FC(ke);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jC extends bo{constructor(e){super(),this.indexPath_=e,x(!X(e)&&ee(e)!==".priority","Can't create PathIndex with empty path or .priority key")}extractChild(e){return e.getChild(this.indexPath_)}isDefinedOn(e){return!e.getChild(this.indexPath_).isEmpty()}compare(e,t){const i=this.extractChild(e.node),s=this.extractChild(t.node),r=i.compareTo(s);return r===0?ki(e.name,t.name):r}makePost(e,t){const i=ke(e),s=H.EMPTY_NODE.updateChild(this.indexPath_,i);return new Q(t,s)}maxPost(){const e=H.EMPTY_NODE.updateChild(this.indexPath_,ks);return new Q(Wn,e)}toString(){return og(this.indexPath_,0).join("/")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $C extends bo{compare(e,t){const i=e.node.compareTo(t.node);return i===0?ki(e.name,t.name):i}isDefinedOn(e){return!0}indexedValueChanged(e,t){return!e.equals(t)}minPost(){return Q.MIN}maxPost(){return Q.MAX}makePost(e,t){const i=ke(e);return new Q(t,i)}toString(){return".value"}}const GC=new $C;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yg(n){return{type:"value",snapshotNode:n}}function Vi(n,e){return{type:"child_added",snapshotNode:e,childName:n}}function Ns(n,e){return{type:"child_removed",snapshotNode:e,childName:n}}function xs(n,e,t){return{type:"child_changed",snapshotNode:e,childName:n,oldSnap:t}}function KC(n,e){return{type:"child_moved",snapshotNode:e,childName:n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ic{constructor(e){this.index_=e}updateChild(e,t,i,s,r,o){x(e.isIndexed(this.index_),"A node must be indexed if only a child is updated");const l=e.getImmediateChild(t);return l.getChild(s).equals(i.getChild(s))&&l.isEmpty()===i.isEmpty()||(o!=null&&(i.isEmpty()?e.hasChild(t)?o.trackChildChange(Ns(t,l)):x(e.isLeafNode(),"A child remove without an old child only makes sense on a leaf node"):l.isEmpty()?o.trackChildChange(Vi(t,i)):o.trackChildChange(xs(t,i,l))),e.isLeafNode()&&i.isEmpty())?e:e.updateImmediateChild(t,i).withIndex(this.index_)}updateFullNode(e,t,i){return i!=null&&(e.isLeafNode()||e.forEachChild(pe,(s,r)=>{t.hasChild(s)||i.trackChildChange(Ns(s,r))}),t.isLeafNode()||t.forEachChild(pe,(s,r)=>{if(e.hasChild(s)){const o=e.getImmediateChild(s);o.equals(r)||i.trackChildChange(xs(s,r,o))}else i.trackChildChange(Vi(s,r))})),t.withIndex(this.index_)}updatePriority(e,t){return e.isEmpty()?H.EMPTY_NODE:e.updatePriority(t)}filtersNodes(){return!1}getIndexedFilter(){return this}getIndex(){return this.index_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ds{constructor(e){this.indexedFilter_=new ic(e.getIndex()),this.index_=e.getIndex(),this.startPost_=Ds.getStartPost_(e),this.endPost_=Ds.getEndPost_(e),this.startIsInclusive_=!e.startAfterSet_,this.endIsInclusive_=!e.endBeforeSet_}getStartPost(){return this.startPost_}getEndPost(){return this.endPost_}matches(e){const t=this.startIsInclusive_?this.index_.compare(this.getStartPost(),e)<=0:this.index_.compare(this.getStartPost(),e)<0,i=this.endIsInclusive_?this.index_.compare(e,this.getEndPost())<=0:this.index_.compare(e,this.getEndPost())<0;return t&&i}updateChild(e,t,i,s,r,o){return this.matches(new Q(t,i))||(i=H.EMPTY_NODE),this.indexedFilter_.updateChild(e,t,i,s,r,o)}updateFullNode(e,t,i){t.isLeafNode()&&(t=H.EMPTY_NODE);let s=t.withIndex(this.index_);s=s.updatePriority(H.EMPTY_NODE);const r=this;return t.forEachChild(pe,(o,l)=>{r.matches(new Q(o,l))||(s=s.updateImmediateChild(o,H.EMPTY_NODE))}),this.indexedFilter_.updateFullNode(e,s,i)}updatePriority(e,t){return e}filtersNodes(){return!0}getIndexedFilter(){return this.indexedFilter_}getIndex(){return this.index_}static getStartPost_(e){if(e.hasStart()){const t=e.getIndexStartName();return e.getIndex().makePost(e.getIndexStartValue(),t)}else return e.getIndex().minPost()}static getEndPost_(e){if(e.hasEnd()){const t=e.getIndexEndName();return e.getIndex().makePost(e.getIndexEndValue(),t)}else return e.getIndex().maxPost()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class QC{constructor(e){this.withinDirectionalStart=t=>this.reverse_?this.withinEndPost(t):this.withinStartPost(t),this.withinDirectionalEnd=t=>this.reverse_?this.withinStartPost(t):this.withinEndPost(t),this.withinStartPost=t=>{const i=this.index_.compare(this.rangedFilter_.getStartPost(),t);return this.startIsInclusive_?i<=0:i<0},this.withinEndPost=t=>{const i=this.index_.compare(t,this.rangedFilter_.getEndPost());return this.endIsInclusive_?i<=0:i<0},this.rangedFilter_=new Ds(e),this.index_=e.getIndex(),this.limit_=e.getLimit(),this.reverse_=!e.isViewFromLeft(),this.startIsInclusive_=!e.startAfterSet_,this.endIsInclusive_=!e.endBeforeSet_}updateChild(e,t,i,s,r,o){return this.rangedFilter_.matches(new Q(t,i))||(i=H.EMPTY_NODE),e.getImmediateChild(t).equals(i)?e:e.numChildren()<this.limit_?this.rangedFilter_.getIndexedFilter().updateChild(e,t,i,s,r,o):this.fullLimitUpdateChild_(e,t,i,r,o)}updateFullNode(e,t,i){let s;if(t.isLeafNode()||t.isEmpty())s=H.EMPTY_NODE.withIndex(this.index_);else if(this.limit_*2<t.numChildren()&&t.isIndexed(this.index_)){s=H.EMPTY_NODE.withIndex(this.index_);let r;this.reverse_?r=t.getReverseIteratorFrom(this.rangedFilter_.getEndPost(),this.index_):r=t.getIteratorFrom(this.rangedFilter_.getStartPost(),this.index_);let o=0;for(;r.hasNext()&&o<this.limit_;){const l=r.getNext();if(this.withinDirectionalStart(l))if(this.withinDirectionalEnd(l))s=s.updateImmediateChild(l.name,l.node),o++;else break;else continue}}else{s=t.withIndex(this.index_),s=s.updatePriority(H.EMPTY_NODE);let r;this.reverse_?r=s.getReverseIterator(this.index_):r=s.getIterator(this.index_);let o=0;for(;r.hasNext();){const l=r.getNext();o<this.limit_&&this.withinDirectionalStart(l)&&this.withinDirectionalEnd(l)?o++:s=s.updateImmediateChild(l.name,H.EMPTY_NODE)}}return this.rangedFilter_.getIndexedFilter().updateFullNode(e,s,i)}updatePriority(e,t){return e}filtersNodes(){return!0}getIndexedFilter(){return this.rangedFilter_.getIndexedFilter()}getIndex(){return this.index_}fullLimitUpdateChild_(e,t,i,s,r){let o;if(this.reverse_){const p=this.index_.getCompare();o=(m,b)=>p(b,m)}else o=this.index_.getCompare();const l=e;x(l.numChildren()===this.limit_,"");const c=new Q(t,i),u=this.reverse_?l.getFirstChild(this.index_):l.getLastChild(this.index_),f=this.rangedFilter_.matches(c);if(l.hasChild(t)){const p=l.getImmediateChild(t);let m=s.getChildAfterChild(this.index_,u,this.reverse_);for(;m!=null&&(m.name===t||l.hasChild(m.name));)m=s.getChildAfterChild(this.index_,m,this.reverse_);const b=m==null?1:o(m,c);if(f&&!i.isEmpty()&&b>=0)return r!=null&&r.trackChildChange(xs(t,i,p)),l.updateImmediateChild(t,i);{r!=null&&r.trackChildChange(Ns(t,p));const N=l.updateImmediateChild(t,H.EMPTY_NODE);return m!=null&&this.rangedFilter_.matches(m)?(r!=null&&r.trackChildChange(Vi(m.name,m.node)),N.updateImmediateChild(m.name,m.node)):N}}else return i.isEmpty()?e:f&&o(u,c)>=0?(r!=null&&(r.trackChildChange(Ns(u.name,u.node)),r.trackChildChange(Vi(t,i))),l.updateImmediateChild(t,i).updateImmediateChild(u.name,H.EMPTY_NODE)):e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sc{constructor(){this.limitSet_=!1,this.startSet_=!1,this.startNameSet_=!1,this.startAfterSet_=!1,this.endSet_=!1,this.endNameSet_=!1,this.endBeforeSet_=!1,this.limit_=0,this.viewFrom_="",this.indexStartValue_=null,this.indexStartName_="",this.indexEndValue_=null,this.indexEndName_="",this.index_=pe}hasStart(){return this.startSet_}isViewFromLeft(){return this.viewFrom_===""?this.startSet_:this.viewFrom_==="l"}getIndexStartValue(){return x(this.startSet_,"Only valid if start has been set"),this.indexStartValue_}getIndexStartName(){return x(this.startSet_,"Only valid if start has been set"),this.startNameSet_?this.indexStartName_:Pi}hasEnd(){return this.endSet_}getIndexEndValue(){return x(this.endSet_,"Only valid if end has been set"),this.indexEndValue_}getIndexEndName(){return x(this.endSet_,"Only valid if end has been set"),this.endNameSet_?this.indexEndName_:Wn}hasLimit(){return this.limitSet_}hasAnchoredLimit(){return this.limitSet_&&this.viewFrom_!==""}getLimit(){return x(this.limitSet_,"Only valid if limit has been set"),this.limit_}getIndex(){return this.index_}loadsAllData(){return!(this.startSet_||this.endSet_||this.limitSet_)}isDefault(){return this.loadsAllData()&&this.index_===pe}copy(){const e=new sc;return e.limitSet_=this.limitSet_,e.limit_=this.limit_,e.startSet_=this.startSet_,e.startAfterSet_=this.startAfterSet_,e.indexStartValue_=this.indexStartValue_,e.startNameSet_=this.startNameSet_,e.indexStartName_=this.indexStartName_,e.endSet_=this.endSet_,e.endBeforeSet_=this.endBeforeSet_,e.indexEndValue_=this.indexEndValue_,e.endNameSet_=this.endNameSet_,e.indexEndName_=this.indexEndName_,e.index_=this.index_,e.viewFrom_=this.viewFrom_,e}}function YC(n){return n.loadsAllData()?new ic(n.getIndex()):n.hasLimit()?new QC(n):new Ds(n)}function vg(n){const e={};if(n.isDefault())return e;let t;if(n.index_===pe?t="$priority":n.index_===GC?t="$value":n.index_===Di?t="$key":(x(n.index_ instanceof jC,"Unrecognized index type!"),t=n.index_.toString()),e.orderBy=Ee(t),n.startSet_){const i=n.startAfterSet_?"startAfter":"startAt";e[i]=Ee(n.indexStartValue_),n.startNameSet_&&(e[i]+=","+Ee(n.indexStartName_))}if(n.endSet_){const i=n.endBeforeSet_?"endBefore":"endAt";e[i]=Ee(n.indexEndValue_),n.endNameSet_&&(e[i]+=","+Ee(n.indexEndName_))}return n.limitSet_&&(n.isViewFromLeft()?e.limitToFirst=n.limit_:e.limitToLast=n.limit_),e}function Eg(n){const e={};if(n.startSet_&&(e.sp=n.indexStartValue_,n.startNameSet_&&(e.sn=n.indexStartName_),e.sin=!n.startAfterSet_),n.endSet_&&(e.ep=n.indexEndValue_,n.endNameSet_&&(e.en=n.indexEndName_),e.ein=!n.endBeforeSet_),n.limitSet_){e.l=n.limit_;let t=n.viewFrom_;t===""&&(n.isViewFromLeft()?t="l":t="r"),e.vf=t}return n.index_!==pe&&(e.i=n.index_.toString()),e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ro extends tg{reportStats(e){throw new Error("Method not implemented.")}static getListenId_(e,t){return t!==void 0?"tag$"+t:(x(e._queryParams.isDefault(),"should have a tag if it's not a default query."),e._path.toString())}constructor(e,t,i,s){super(),this.repoInfo_=e,this.onDataUpdate_=t,this.authTokenProvider_=i,this.appCheckTokenProvider_=s,this.log_=bs("p:rest:"),this.listens_={}}listen(e,t,i,s){const r=e._path.toString();this.log_("Listen called for "+r+" "+e._queryIdentifier);const o=Ro.getListenId_(e,i),l={};this.listens_[o]=l;const c=vg(e._queryParams);this.restRequest_(r+".json",c,(u,f)=>{let p=f;if(u===404&&(p=null,u=null),u===null&&this.onDataUpdate_(r,p,!1,i),ri(this.listens_,o)===l){let m;u?u===401?m="permission_denied":m="rest_error:"+u:m="ok",s(m,null)}})}unlisten(e,t){const i=Ro.getListenId_(e,t);delete this.listens_[i]}get(e){const t=vg(e._queryParams),i=e._path.toString(),s=new mr;return this.restRequest_(i+".json",t,(r,o)=>{let l=o;r===404&&(l=null,r=null),r===null?(this.onDataUpdate_(i,l,!1,null),s.resolve(l)):s.reject(new Error(l))}),s.promise}refreshAuthToken(e){}restRequest_(e,t={},i){return t.format="export",Promise.all([this.authTokenProvider_.getToken(!1),this.appCheckTokenProvider_.getToken(!1)]).then(([s,r])=>{s&&s.accessToken&&(t.auth=s.accessToken),r&&r.token&&(t.ac=r.token);const o=(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host+e+"?ns="+this.repoInfo_.namespace+oi(t);this.log_("Sending REST request for "+o);const l=new XMLHttpRequest;l.onreadystatechange=()=>{if(i&&l.readyState===4){this.log_("REST Response for "+o+" received. status:",l.status,"response:",l.responseText);let c=null;if(l.status>=200&&l.status<300){try{c=Gi(l.responseText)}catch{Ke("Failed to parse JSON response for "+o+": "+l.responseText)}i(null,c)}else l.status!==401&&l.status!==404&&Ke("Got unsuccessful REST response for "+o+" Status: "+l.status),i(l.status);i=null}},l.open("GET",o,!0),l.send()})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class XC{constructor(){this.rootNode_=H.EMPTY_NODE}getNode(e){return this.rootNode_.getChild(e)}updateSnapshot(e,t){this.rootNode_=this.rootNode_.updateChild(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Po(){return{value:null,children:new Map}}function wg(n,e,t){if(X(e))n.value=t,n.children.clear();else if(n.value!==null)n.value=n.value.updateChild(e,t);else{const i=ee(e);n.children.has(i)||n.children.set(i,Po());const s=n.children.get(i);e=ae(e),wg(s,e,t)}}function rc(n,e,t){n.value!==null?t(e,n.value):JC(n,(i,s)=>{const r=new re(e.toString()+"/"+i);rc(s,r,t)})}function JC(n,e){n.children.forEach((t,i)=>{e(i,t)})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ZC{constructor(e){this.collection_=e,this.last_=null}get(){const e=this.collection_.get(),t={...e};return this.last_&&Qe(this.last_,(i,s)=>{t[i]=t[i]-s}),this.last_=e,t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Tg=10*1e3,eA=30*1e3,tA=5*60*1e3;class nA{constructor(e,t){this.server_=t,this.statsToReport_={},this.statsListener_=new ZC(e);const i=Tg+(eA-Tg)*Math.random();As(this.reportStats_.bind(this),Math.floor(i))}reportStats_(){const e=this.statsListener_.get(),t={};let i=!1;Qe(e,(s,r)=>{r>0&&bt(this.statsToReport_,s)&&(t[s]=r,i=!0)}),i&&this.server_.reportStats(t),As(this.reportStats_.bind(this),Math.floor(Math.random()*2*tA))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var at;(function(n){n[n.OVERWRITE=0]="OVERWRITE",n[n.MERGE=1]="MERGE",n[n.ACK_USER_WRITE=2]="ACK_USER_WRITE",n[n.LISTEN_COMPLETE=3]="LISTEN_COMPLETE"})(at||(at={}));function Ig(){return{fromUser:!0,fromServer:!1,queryId:null,tagged:!1}}function oc(){return{fromUser:!1,fromServer:!0,queryId:null,tagged:!1}}function ac(n){return{fromUser:!1,fromServer:!0,queryId:n,tagged:!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ko{constructor(e,t,i){this.path=e,this.affectedTree=t,this.revert=i,this.type=at.ACK_USER_WRITE,this.source=Ig()}operationForChild(e){if(X(this.path)){if(this.affectedTree.value!=null)return x(this.affectedTree.children.isEmpty(),"affectedTree should not have overlapping affected paths."),this;{const t=this.affectedTree.subtree(new re(e));return new ko(ie(),t,this.revert)}}else return x(ee(this.path)===e,"operationForChild called for unrelated child."),new ko(ae(this.path),this.affectedTree,this.revert)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Os{constructor(e,t){this.source=e,this.path=t,this.type=at.LISTEN_COMPLETE}operationForChild(e){return X(this.path)?new Os(this.source,ie()):new Os(this.source,ae(this.path))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $n{constructor(e,t,i){this.source=e,this.path=t,this.snap=i,this.type=at.OVERWRITE}operationForChild(e){return X(this.path)?new $n(this.source,ie(),this.snap.getImmediateChild(e)):new $n(this.source,ae(this.path),this.snap)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vs{constructor(e,t,i){this.source=e,this.path=t,this.children=i,this.type=at.MERGE}operationForChild(e){if(X(this.path)){const t=this.children.subtree(new re(e));return t.isEmpty()?null:t.value?new $n(this.source,ie(),t.value):new Vs(this.source,ie(),t)}else return x(ee(this.path)===e,"Can't get a merge for a child not on the path of the operation"),new Vs(this.source,ae(this.path),this.children)}toString(){return"Operation("+this.path+": "+this.source.toString()+" merge: "+this.children.toString()+")"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class un{constructor(e,t,i){this.node_=e,this.fullyInitialized_=t,this.filtered_=i}isFullyInitialized(){return this.fullyInitialized_}isFiltered(){return this.filtered_}isCompleteForPath(e){if(X(e))return this.isFullyInitialized()&&!this.filtered_;const t=ee(e);return this.isCompleteForChild(t)}isCompleteForChild(e){return this.isFullyInitialized()&&!this.filtered_||this.node_.hasChild(e)}getNode(){return this.node_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class iA{constructor(e){this.query_=e,this.index_=this.query_._queryParams.getIndex()}}function sA(n,e,t,i){const s=[],r=[];return e.forEach(o=>{o.type==="child_changed"&&n.index_.indexedValueChanged(o.oldSnap,o.snapshotNode)&&r.push(KC(o.childName,o.snapshotNode))}),Ls(n,s,"child_removed",e,i,t),Ls(n,s,"child_added",e,i,t),Ls(n,s,"child_moved",r,i,t),Ls(n,s,"child_changed",e,i,t),Ls(n,s,"value",e,i,t),s}function Ls(n,e,t,i,s,r){const o=i.filter(l=>l.type===t);o.sort((l,c)=>oA(n,l,c)),o.forEach(l=>{const c=rA(n,l,r);s.forEach(u=>{u.respondsTo(l.type)&&e.push(u.createEvent(c,n.query_))})})}function rA(n,e,t){return e.type==="value"||e.type==="child_removed"||(e.prevName=t.getPredecessorChildName(e.childName,e.snapshotNode,n.index_)),e}function oA(n,e,t){if(e.childName==null||t.childName==null)throw si("Should only compare child_ events.");const i=new Q(e.childName,e.snapshotNode),s=new Q(t.childName,t.snapshotNode);return n.index_.compare(i,s)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function No(n,e){return{eventCache:n,serverCache:e}}function Ms(n,e,t,i){return No(new un(e,t,i),n.serverCache)}function bg(n,e,t,i){return No(n.eventCache,new un(e,t,i))}function xo(n){return n.eventCache.isFullyInitialized()?n.eventCache.getNode():null}function Gn(n){return n.serverCache.isFullyInitialized()?n.serverCache.getNode():null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let lc;const aA=()=>(lc||(lc=new Ye($b)),lc);class ue{static fromObject(e){let t=new ue(null);return Qe(e,(i,s)=>{t=t.set(new re(i),s)}),t}constructor(e,t=aA()){this.value=e,this.children=t}isEmpty(){return this.value===null&&this.children.isEmpty()}findRootMostMatchingPathAndValue(e,t){if(this.value!=null&&t(this.value))return{path:ie(),value:this.value};if(X(e))return null;{const i=ee(e),s=this.children.get(i);if(s!==null){const r=s.findRootMostMatchingPathAndValue(ae(e),t);return r!=null?{path:be(new re(i),r.path),value:r.value}:null}else return null}}findRootMostValueAndPath(e){return this.findRootMostMatchingPathAndValue(e,()=>!0)}subtree(e){if(X(e))return this;{const t=ee(e),i=this.children.get(t);return i!==null?i.subtree(ae(e)):new ue(null)}}set(e,t){if(X(e))return new ue(t,this.children);{const i=ee(e),r=(this.children.get(i)||new ue(null)).set(ae(e),t),o=this.children.insert(i,r);return new ue(this.value,o)}}remove(e){if(X(e))return this.children.isEmpty()?new ue(null):new ue(null,this.children);{const t=ee(e),i=this.children.get(t);if(i){const s=i.remove(ae(e));let r;return s.isEmpty()?r=this.children.remove(t):r=this.children.insert(t,s),this.value===null&&r.isEmpty()?new ue(null):new ue(this.value,r)}else return this}}get(e){if(X(e))return this.value;{const t=ee(e),i=this.children.get(t);return i?i.get(ae(e)):null}}setTree(e,t){if(X(e))return t;{const i=ee(e),r=(this.children.get(i)||new ue(null)).setTree(ae(e),t);let o;return r.isEmpty()?o=this.children.remove(i):o=this.children.insert(i,r),new ue(this.value,o)}}fold(e){return this.fold_(ie(),e)}fold_(e,t){const i={};return this.children.inorderTraversal((s,r)=>{i[s]=r.fold_(be(e,s),t)}),t(e,this.value,i)}findOnPath(e,t){return this.findOnPath_(e,ie(),t)}findOnPath_(e,t,i){const s=this.value?i(t,this.value):!1;if(s)return s;if(X(e))return null;{const r=ee(e),o=this.children.get(r);return o?o.findOnPath_(ae(e),be(t,r),i):null}}foreachOnPath(e,t){return this.foreachOnPath_(e,ie(),t)}foreachOnPath_(e,t,i){if(X(e))return this;{this.value&&i(t,this.value);const s=ee(e),r=this.children.get(s);return r?r.foreachOnPath_(ae(e),be(t,s),i):new ue(null)}}foreach(e){this.foreach_(ie(),e)}foreach_(e,t){this.children.inorderTraversal((i,s)=>{s.foreach_(be(e,i),t)}),this.value&&t(e,this.value)}foreachChild(e){this.children.inorderTraversal((t,i)=>{i.value&&e(t,i.value)})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lt{constructor(e){this.writeTree_=e}static empty(){return new lt(new ue(null))}}function Fs(n,e,t){if(X(e))return new lt(new ue(t));{const i=n.writeTree_.findRootMostValueAndPath(e);if(i!=null){const s=i.path;let r=i.value;const o=He(s,e);return r=r.updateChild(o,t),new lt(n.writeTree_.set(s,r))}else{const s=new ue(t),r=n.writeTree_.setTree(e,s);return new lt(r)}}}function Cg(n,e,t){let i=n;return Qe(t,(s,r)=>{i=Fs(i,be(e,s),r)}),i}function Ag(n,e){if(X(e))return lt.empty();{const t=n.writeTree_.setTree(e,new ue(null));return new lt(t)}}function cc(n,e){return Kn(n,e)!=null}function Kn(n,e){const t=n.writeTree_.findRootMostValueAndPath(e);return t!=null?n.writeTree_.get(t.path).getChild(He(t.path,e)):null}function Sg(n){const e=[],t=n.writeTree_.value;return t!=null?t.isLeafNode()||t.forEachChild(pe,(i,s)=>{e.push(new Q(i,s))}):n.writeTree_.children.inorderTraversal((i,s)=>{s.value!=null&&e.push(new Q(i,s.value))}),e}function hn(n,e){if(X(e))return n;{const t=Kn(n,e);return t!=null?new lt(new ue(t)):new lt(n.writeTree_.subtree(e))}}function uc(n){return n.writeTree_.isEmpty()}function Li(n,e){return Rg(ie(),n.writeTree_,e)}function Rg(n,e,t){if(e.value!=null)return t.updateChild(n,e.value);{let i=null;return e.children.inorderTraversal((s,r)=>{s===".priority"?(x(r.value!==null,"Priority writes must always be leaf nodes"),i=r.value):t=Rg(be(n,s),r,t)}),!t.getChild(n).isEmpty()&&i!==null&&(t=t.updateChild(be(n,".priority"),i)),t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Do(n,e){return Dg(e,n)}function lA(n,e,t,i,s){x(i>n.lastWriteId,"Stacking an older write on top of newer ones"),s===void 0&&(s=!0),n.allWrites.push({path:e,snap:t,writeId:i,visible:s}),s&&(n.visibleWrites=Fs(n.visibleWrites,e,t)),n.lastWriteId=i}function cA(n,e){for(let t=0;t<n.allWrites.length;t++){const i=n.allWrites[t];if(i.writeId===e)return i}return null}function uA(n,e){const t=n.allWrites.findIndex(l=>l.writeId===e);x(t>=0,"removeWrite called with nonexistent writeId.");const i=n.allWrites[t];n.allWrites.splice(t,1);let s=i.visible,r=!1,o=n.allWrites.length-1;for(;s&&o>=0;){const l=n.allWrites[o];l.visible&&(o>=t&&hA(l,i.path)?s=!1:ot(i.path,l.path)&&(r=!0)),o--}if(s){if(r)return dA(n),!0;if(i.snap)n.visibleWrites=Ag(n.visibleWrites,i.path);else{const l=i.children;Qe(l,c=>{n.visibleWrites=Ag(n.visibleWrites,be(i.path,c))})}return!0}else return!1}function hA(n,e){if(n.snap)return ot(n.path,e);for(const t in n.children)if(n.children.hasOwnProperty(t)&&ot(be(n.path,t),e))return!0;return!1}function dA(n){n.visibleWrites=Pg(n.allWrites,fA,ie()),n.allWrites.length>0?n.lastWriteId=n.allWrites[n.allWrites.length-1].writeId:n.lastWriteId=-1}function fA(n){return n.visible}function Pg(n,e,t){let i=lt.empty();for(let s=0;s<n.length;++s){const r=n[s];if(e(r)){const o=r.path;let l;if(r.snap)ot(t,o)?(l=He(t,o),i=Fs(i,l,r.snap)):ot(o,t)&&(l=He(o,t),i=Fs(i,ie(),r.snap.getChild(l)));else if(r.children){if(ot(t,o))l=He(t,o),i=Cg(i,l,r.children);else if(ot(o,t))if(l=He(o,t),X(l))i=Cg(i,ie(),r.children);else{const c=ri(r.children,ee(l));if(c){const u=c.getChild(ae(l));i=Fs(i,ie(),u)}}}else throw si("WriteRecord should have .snap or .children")}}return i}function kg(n,e,t,i,s){if(!i&&!s){const r=Kn(n.visibleWrites,e);if(r!=null)return r;{const o=hn(n.visibleWrites,e);if(uc(o))return t;if(t==null&&!cc(o,ie()))return null;{const l=t||H.EMPTY_NODE;return Li(o,l)}}}else{const r=hn(n.visibleWrites,e);if(!s&&uc(r))return t;if(!s&&t==null&&!cc(r,ie()))return null;{const o=function(u){return(u.visible||s)&&(!i||!~i.indexOf(u.writeId))&&(ot(u.path,e)||ot(e,u.path))},l=Pg(n.allWrites,o,e),c=t||H.EMPTY_NODE;return Li(l,c)}}}function pA(n,e,t){let i=H.EMPTY_NODE;const s=Kn(n.visibleWrites,e);if(s)return s.isLeafNode()||s.forEachChild(pe,(r,o)=>{i=i.updateImmediateChild(r,o)}),i;if(t){const r=hn(n.visibleWrites,e);return t.forEachChild(pe,(o,l)=>{const c=Li(hn(r,new re(o)),l);i=i.updateImmediateChild(o,c)}),Sg(r).forEach(o=>{i=i.updateImmediateChild(o.name,o.node)}),i}else{const r=hn(n.visibleWrites,e);return Sg(r).forEach(o=>{i=i.updateImmediateChild(o.name,o.node)}),i}}function gA(n,e,t,i,s){x(i||s,"Either existingEventSnap or existingServerSnap must exist");const r=be(e,t);if(cc(n.visibleWrites,r))return null;{const o=hn(n.visibleWrites,r);return uc(o)?s.getChild(t):Li(o,s.getChild(t))}}function mA(n,e,t,i){const s=be(e,t),r=Kn(n.visibleWrites,s);if(r!=null)return r;if(i.isCompleteForChild(t)){const o=hn(n.visibleWrites,s);return Li(o,i.getNode().getImmediateChild(t))}else return null}function _A(n,e){return Kn(n.visibleWrites,e)}function yA(n,e,t,i,s,r,o){let l;const c=hn(n.visibleWrites,e),u=Kn(c,ie());if(u!=null)l=u;else if(t!=null)l=Li(c,t);else return[];if(l=l.withIndex(o),!l.isEmpty()&&!l.isLeafNode()){const f=[],p=o.getCompare(),m=r?l.getReverseIteratorFrom(i,o):l.getIteratorFrom(i,o);let b=m.getNext();for(;b&&f.length<s;)p(b,i)!==0&&f.push(b),b=m.getNext();return f}else return[]}function vA(){return{visibleWrites:lt.empty(),allWrites:[],lastWriteId:-1}}function Oo(n,e,t,i){return kg(n.writeTree,n.treePath,e,t,i)}function hc(n,e){return pA(n.writeTree,n.treePath,e)}function Ng(n,e,t,i){return gA(n.writeTree,n.treePath,e,t,i)}function Vo(n,e){return _A(n.writeTree,be(n.treePath,e))}function EA(n,e,t,i,s,r){return yA(n.writeTree,n.treePath,e,t,i,s,r)}function dc(n,e,t){return mA(n.writeTree,n.treePath,e,t)}function xg(n,e){return Dg(be(n.treePath,e),n.writeTree)}function Dg(n,e){return{treePath:n,writeTree:e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wA{constructor(){this.changeMap=new Map}trackChildChange(e){const t=e.type,i=e.childName;x(t==="child_added"||t==="child_changed"||t==="child_removed","Only child changes supported for tracking"),x(i!==".priority","Only non-priority child changes can be tracked.");const s=this.changeMap.get(i);if(s){const r=s.type;if(t==="child_added"&&r==="child_removed")this.changeMap.set(i,xs(i,e.snapshotNode,s.snapshotNode));else if(t==="child_removed"&&r==="child_added")this.changeMap.delete(i);else if(t==="child_removed"&&r==="child_changed")this.changeMap.set(i,Ns(i,s.oldSnap));else if(t==="child_changed"&&r==="child_added")this.changeMap.set(i,Vi(i,e.snapshotNode));else if(t==="child_changed"&&r==="child_changed")this.changeMap.set(i,xs(i,e.snapshotNode,s.oldSnap));else throw si("Illegal combination of changes: "+e+" occurred after "+s)}else this.changeMap.set(i,e)}getChanges(){return Array.from(this.changeMap.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class TA{getCompleteChild(e){return null}getChildAfterChild(e,t,i){return null}}const Og=new TA;class fc{constructor(e,t,i=null){this.writes_=e,this.viewCache_=t,this.optCompleteServerCache_=i}getCompleteChild(e){const t=this.viewCache_.eventCache;if(t.isCompleteForChild(e))return t.getNode().getImmediateChild(e);{const i=this.optCompleteServerCache_!=null?new un(this.optCompleteServerCache_,!0,!1):this.viewCache_.serverCache;return dc(this.writes_,e,i)}}getChildAfterChild(e,t,i){const s=this.optCompleteServerCache_!=null?this.optCompleteServerCache_:Gn(this.viewCache_),r=EA(this.writes_,s,t,1,i,e);return r.length===0?null:r[0]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function IA(n){return{filter:n}}function bA(n,e){x(e.eventCache.getNode().isIndexed(n.filter.getIndex()),"Event snap not indexed"),x(e.serverCache.getNode().isIndexed(n.filter.getIndex()),"Server snap not indexed")}function CA(n,e,t,i,s){const r=new wA;let o,l;if(t.type===at.OVERWRITE){const u=t;u.source.fromUser?o=pc(n,e,u.path,u.snap,i,s,r):(x(u.source.fromServer,"Unknown source."),l=u.source.tagged||e.serverCache.isFiltered()&&!X(u.path),o=Lo(n,e,u.path,u.snap,i,s,l,r))}else if(t.type===at.MERGE){const u=t;u.source.fromUser?o=SA(n,e,u.path,u.children,i,s,r):(x(u.source.fromServer,"Unknown source."),l=u.source.tagged||e.serverCache.isFiltered(),o=gc(n,e,u.path,u.children,i,s,l,r))}else if(t.type===at.ACK_USER_WRITE){const u=t;u.revert?o=kA(n,e,u.path,i,s,r):o=RA(n,e,u.path,u.affectedTree,i,s,r)}else if(t.type===at.LISTEN_COMPLETE)o=PA(n,e,t.path,i,r);else throw si("Unknown operation type: "+t.type);const c=r.getChanges();return AA(e,o,c),{viewCache:o,changes:c}}function AA(n,e,t){const i=e.eventCache;if(i.isFullyInitialized()){const s=i.getNode().isLeafNode()||i.getNode().isEmpty(),r=xo(n);(t.length>0||!n.eventCache.isFullyInitialized()||s&&!i.getNode().equals(r)||!i.getNode().getPriority().equals(r.getPriority()))&&t.push(yg(xo(e)))}}function Vg(n,e,t,i,s,r){const o=e.eventCache;if(Vo(i,t)!=null)return e;{let l,c;if(X(t))if(x(e.serverCache.isFullyInitialized(),"If change path is empty, we must have complete server data"),e.serverCache.isFiltered()){const u=Gn(e),f=u instanceof H?u:H.EMPTY_NODE,p=hc(i,f);l=n.filter.updateFullNode(e.eventCache.getNode(),p,r)}else{const u=Oo(i,Gn(e));l=n.filter.updateFullNode(e.eventCache.getNode(),u,r)}else{const u=ee(t);if(u===".priority"){x(cn(t)===1,"Can't have a priority with additional path components");const f=o.getNode();c=e.serverCache.getNode();const p=Ng(i,t,f,c);p!=null?l=n.filter.updatePriority(f,p):l=o.getNode()}else{const f=ae(t);let p;if(o.isCompleteForChild(u)){c=e.serverCache.getNode();const m=Ng(i,t,o.getNode(),c);m!=null?p=o.getNode().getImmediateChild(u).updateChild(f,m):p=o.getNode().getImmediateChild(u)}else p=dc(i,u,e.serverCache);p!=null?l=n.filter.updateChild(o.getNode(),u,p,f,s,r):l=o.getNode()}}return Ms(e,l,o.isFullyInitialized()||X(t),n.filter.filtersNodes())}}function Lo(n,e,t,i,s,r,o,l){const c=e.serverCache;let u;const f=o?n.filter:n.filter.getIndexedFilter();if(X(t))u=f.updateFullNode(c.getNode(),i,null);else if(f.filtersNodes()&&!c.isFiltered()){const b=c.getNode().updateChild(t,i);u=f.updateFullNode(c.getNode(),b,null)}else{const b=ee(t);if(!c.isCompleteForPath(t)&&cn(t)>1)return e;const S=ae(t),P=c.getNode().getImmediateChild(b).updateChild(S,i);b===".priority"?u=f.updatePriority(c.getNode(),P):u=f.updateChild(c.getNode(),b,P,S,Og,null)}const p=bg(e,u,c.isFullyInitialized()||X(t),f.filtersNodes()),m=new fc(s,p,r);return Vg(n,p,t,s,m,l)}function pc(n,e,t,i,s,r,o){const l=e.eventCache;let c,u;const f=new fc(s,e,r);if(X(t))u=n.filter.updateFullNode(e.eventCache.getNode(),i,o),c=Ms(e,u,!0,n.filter.filtersNodes());else{const p=ee(t);if(p===".priority")u=n.filter.updatePriority(e.eventCache.getNode(),i),c=Ms(e,u,l.isFullyInitialized(),l.isFiltered());else{const m=ae(t),b=l.getNode().getImmediateChild(p);let S;if(X(m))S=i;else{const N=f.getCompleteChild(p);N!=null?rg(m)===".priority"&&N.getChild(ag(m)).isEmpty()?S=N:S=N.updateChild(m,i):S=H.EMPTY_NODE}if(b.equals(S))c=e;else{const N=n.filter.updateChild(l.getNode(),p,S,m,f,o);c=Ms(e,N,l.isFullyInitialized(),n.filter.filtersNodes())}}}return c}function Lg(n,e){return n.eventCache.isCompleteForChild(e)}function SA(n,e,t,i,s,r,o){let l=e;return i.foreach((c,u)=>{const f=be(t,c);Lg(e,ee(f))&&(l=pc(n,l,f,u,s,r,o))}),i.foreach((c,u)=>{const f=be(t,c);Lg(e,ee(f))||(l=pc(n,l,f,u,s,r,o))}),l}function Mg(n,e,t){return t.foreach((i,s)=>{e=e.updateChild(i,s)}),e}function gc(n,e,t,i,s,r,o,l){if(e.serverCache.getNode().isEmpty()&&!e.serverCache.isFullyInitialized())return e;let c=e,u;X(t)?u=i:u=new ue(null).setTree(t,i);const f=e.serverCache.getNode();return u.children.inorderTraversal((p,m)=>{if(f.hasChild(p)){const b=e.serverCache.getNode().getImmediateChild(p),S=Mg(n,b,m);c=Lo(n,c,new re(p),S,s,r,o,l)}}),u.children.inorderTraversal((p,m)=>{const b=!e.serverCache.isCompleteForChild(p)&&m.value===null;if(!f.hasChild(p)&&!b){const S=e.serverCache.getNode().getImmediateChild(p),N=Mg(n,S,m);c=Lo(n,c,new re(p),N,s,r,o,l)}}),c}function RA(n,e,t,i,s,r,o){if(Vo(s,t)!=null)return e;const l=e.serverCache.isFiltered(),c=e.serverCache;if(i.value!=null){if(X(t)&&c.isFullyInitialized()||c.isCompleteForPath(t))return Lo(n,e,t,c.getNode().getChild(t),s,r,l,o);if(X(t)){let u=new ue(null);return c.getNode().forEachChild(Di,(f,p)=>{u=u.set(new re(f),p)}),gc(n,e,t,u,s,r,l,o)}else return e}else{let u=new ue(null);return i.foreach((f,p)=>{const m=be(t,f);c.isCompleteForPath(m)&&(u=u.set(f,c.getNode().getChild(m)))}),gc(n,e,t,u,s,r,l,o)}}function PA(n,e,t,i,s){const r=e.serverCache,o=bg(e,r.getNode(),r.isFullyInitialized()||X(t),r.isFiltered());return Vg(n,o,t,i,Og,s)}function kA(n,e,t,i,s,r){let o;if(Vo(i,t)!=null)return e;{const l=new fc(i,e,s),c=e.eventCache.getNode();let u;if(X(t)||ee(t)===".priority"){let f;if(e.serverCache.isFullyInitialized())f=Oo(i,Gn(e));else{const p=e.serverCache.getNode();x(p instanceof H,"serverChildren would be complete if leaf node"),f=hc(i,p)}f=f,u=n.filter.updateFullNode(c,f,r)}else{const f=ee(t);let p=dc(i,f,e.serverCache);p==null&&e.serverCache.isCompleteForChild(f)&&(p=c.getImmediateChild(f)),p!=null?u=n.filter.updateChild(c,f,p,ae(t),l,r):e.eventCache.getNode().hasChild(f)?u=n.filter.updateChild(c,f,H.EMPTY_NODE,ae(t),l,r):u=c,u.isEmpty()&&e.serverCache.isFullyInitialized()&&(o=Oo(i,Gn(e)),o.isLeafNode()&&(u=n.filter.updateFullNode(u,o,r)))}return o=e.serverCache.isFullyInitialized()||Vo(i,ie())!=null,Ms(e,u,o,n.filter.filtersNodes())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class NA{constructor(e,t){this.query_=e,this.eventRegistrations_=[];const i=this.query_._queryParams,s=new ic(i.getIndex()),r=YC(i);this.processor_=IA(r);const o=t.serverCache,l=t.eventCache,c=s.updateFullNode(H.EMPTY_NODE,o.getNode(),null),u=r.updateFullNode(H.EMPTY_NODE,l.getNode(),null),f=new un(c,o.isFullyInitialized(),s.filtersNodes()),p=new un(u,l.isFullyInitialized(),r.filtersNodes());this.viewCache_=No(p,f),this.eventGenerator_=new iA(this.query_)}get query(){return this.query_}}function xA(n){return n.viewCache_.serverCache.getNode()}function DA(n){return xo(n.viewCache_)}function OA(n,e){const t=Gn(n.viewCache_);return t&&(n.query._queryParams.loadsAllData()||!X(e)&&!t.getImmediateChild(ee(e)).isEmpty())?t.getChild(e):null}function Fg(n){return n.eventRegistrations_.length===0}function VA(n,e){n.eventRegistrations_.push(e)}function Ug(n,e,t){const i=[];if(t){x(e==null,"A cancel should cancel all event registrations.");const s=n.query._path;n.eventRegistrations_.forEach(r=>{const o=r.createCancelEvent(t,s);o&&i.push(o)})}if(e){let s=[];for(let r=0;r<n.eventRegistrations_.length;++r){const o=n.eventRegistrations_[r];if(!o.matches(e))s.push(o);else if(e.hasAnyCallback()){s=s.concat(n.eventRegistrations_.slice(r+1));break}}n.eventRegistrations_=s}else n.eventRegistrations_=[];return i}function Bg(n,e,t,i){e.type===at.MERGE&&e.source.queryId!==null&&(x(Gn(n.viewCache_),"We should always have a full cache before handling merges"),x(xo(n.viewCache_),"Missing event cache, even though we have a server cache"));const s=n.viewCache_,r=CA(n.processor_,s,e,t,i);return bA(n.processor_,r.viewCache),x(r.viewCache.serverCache.isFullyInitialized()||!s.serverCache.isFullyInitialized(),"Once a server snap is complete, it should never go back"),n.viewCache_=r.viewCache,qg(n,r.changes,r.viewCache.eventCache.getNode(),null)}function LA(n,e){const t=n.viewCache_.eventCache,i=[];return t.getNode().isLeafNode()||t.getNode().forEachChild(pe,(r,o)=>{i.push(Vi(r,o))}),t.isFullyInitialized()&&i.push(yg(t.getNode())),qg(n,i,t.getNode(),e)}function qg(n,e,t,i){const s=i?[i]:n.eventRegistrations_;return sA(n.eventGenerator_,e,t,s)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Mo;class Hg{constructor(){this.views=new Map}}function MA(n){x(!Mo,"__referenceConstructor has already been defined"),Mo=n}function FA(){return x(Mo,"Reference.ts has not been loaded"),Mo}function UA(n){return n.views.size===0}function mc(n,e,t,i){const s=e.source.queryId;if(s!==null){const r=n.views.get(s);return x(r!=null,"SyncTree gave us an op for an invalid query."),Bg(r,e,t,i)}else{let r=[];for(const o of n.views.values())r=r.concat(Bg(o,e,t,i));return r}}function zg(n,e,t,i,s){const r=e._queryIdentifier,o=n.views.get(r);if(!o){let l=Oo(t,s?i:null),c=!1;l?c=!0:i instanceof H?(l=hc(t,i),c=!1):(l=H.EMPTY_NODE,c=!1);const u=No(new un(l,c,!1),new un(i,s,!1));return new NA(e,u)}return o}function BA(n,e,t,i,s,r){const o=zg(n,e,i,s,r);return n.views.has(e._queryIdentifier)||n.views.set(e._queryIdentifier,o),VA(o,t),LA(o,t)}function qA(n,e,t,i){const s=e._queryIdentifier,r=[];let o=[];const l=fn(n);if(s==="default")for(const[c,u]of n.views.entries())o=o.concat(Ug(u,t,i)),Fg(u)&&(n.views.delete(c),u.query._queryParams.loadsAllData()||r.push(u.query));else{const c=n.views.get(s);c&&(o=o.concat(Ug(c,t,i)),Fg(c)&&(n.views.delete(s),c.query._queryParams.loadsAllData()||r.push(c.query)))}return l&&!fn(n)&&r.push(new(FA())(e._repo,e._path)),{removed:r,events:o}}function Wg(n){const e=[];for(const t of n.views.values())t.query._queryParams.loadsAllData()||e.push(t);return e}function dn(n,e){let t=null;for(const i of n.views.values())t=t||OA(i,e);return t}function jg(n,e){if(e._queryParams.loadsAllData())return Fo(n);{const i=e._queryIdentifier;return n.views.get(i)}}function $g(n,e){return jg(n,e)!=null}function fn(n){return Fo(n)!=null}function Fo(n){for(const e of n.views.values())if(e.query._queryParams.loadsAllData())return e;return null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Uo;function HA(n){x(!Uo,"__referenceConstructor has already been defined"),Uo=n}function zA(){return x(Uo,"Reference.ts has not been loaded"),Uo}let WA=1;class Gg{constructor(e){this.listenProvider_=e,this.syncPointTree_=new ue(null),this.pendingWriteTree_=vA(),this.tagToQueryMap=new Map,this.queryToTagMap=new Map}}function Kg(n,e,t,i,s){return lA(n.pendingWriteTree_,e,t,i,s),s?Bs(n,new $n(Ig(),e,t)):[]}function Qn(n,e,t=!1){const i=cA(n.pendingWriteTree_,e);if(uA(n.pendingWriteTree_,e)){let r=new ue(null);return i.snap!=null?r=r.set(ie(),!0):Qe(i.children,o=>{r=r.set(new re(o),!0)}),Bs(n,new ko(i.path,r,t))}else return[]}function Us(n,e,t){return Bs(n,new $n(oc(),e,t))}function jA(n,e,t){const i=ue.fromObject(t);return Bs(n,new Vs(oc(),e,i))}function $A(n,e){return Bs(n,new Os(oc(),e))}function GA(n,e,t){const i=yc(n,t);if(i){const s=vc(i),r=s.path,o=s.queryId,l=He(r,e),c=new Os(ac(o),l);return Ec(n,r,c)}else return[]}function Qg(n,e,t,i,s=!1){const r=e._path,o=n.syncPointTree_.get(r);let l=[];if(o&&(e._queryIdentifier==="default"||$g(o,e))){const c=qA(o,e,t,i);UA(o)&&(n.syncPointTree_=n.syncPointTree_.remove(r));const u=c.removed;if(l=c.events,!s){const f=u.findIndex(m=>m._queryParams.loadsAllData())!==-1,p=n.syncPointTree_.findOnPath(r,(m,b)=>fn(b));if(f&&!p){const m=n.syncPointTree_.subtree(r);if(!m.isEmpty()){const b=XA(m);for(let S=0;S<b.length;++S){const N=b[S],P=N.query,D=Zg(n,N);n.listenProvider_.startListening(Hs(P),qs(n,P),D.hashFn,D.onComplete)}}}!p&&u.length>0&&!i&&(f?n.listenProvider_.stopListening(Hs(e),null):u.forEach(m=>{const b=n.queryToTagMap.get(Bo(m));n.listenProvider_.stopListening(Hs(m),b)}))}JA(n,u)}return l}function Yg(n,e,t,i){const s=yc(n,i);if(s!=null){const r=vc(s),o=r.path,l=r.queryId,c=He(o,e),u=new $n(ac(l),c,t);return Ec(n,o,u)}else return[]}function KA(n,e,t,i){const s=yc(n,i);if(s){const r=vc(s),o=r.path,l=r.queryId,c=He(o,e),u=ue.fromObject(t),f=new Vs(ac(l),c,u);return Ec(n,o,f)}else return[]}function QA(n,e,t,i=!1){const s=e._path;let r=null,o=!1;n.syncPointTree_.foreachOnPath(s,(m,b)=>{const S=He(m,s);r=r||dn(b,S),o=o||fn(b)});let l=n.syncPointTree_.get(s);l?(o=o||fn(l),r=r||dn(l,ie())):(l=new Hg,n.syncPointTree_=n.syncPointTree_.set(s,l));let c;r!=null?c=!0:(c=!1,r=H.EMPTY_NODE,n.syncPointTree_.subtree(s).foreachChild((b,S)=>{const N=dn(S,ie());N&&(r=r.updateImmediateChild(b,N))}));const u=$g(l,e);if(!u&&!e._queryParams.loadsAllData()){const m=Bo(e);x(!n.queryToTagMap.has(m),"View does not exist, but we have a tag");const b=ZA();n.queryToTagMap.set(m,b),n.tagToQueryMap.set(b,m)}const f=Do(n.pendingWriteTree_,s);let p=BA(l,e,t,f,r,c);if(!u&&!o&&!i){const m=jg(l,e);p=p.concat(eS(n,e,m))}return p}function _c(n,e,t){const s=n.pendingWriteTree_,r=n.syncPointTree_.findOnPath(e,(o,l)=>{const c=He(o,e),u=dn(l,c);if(u)return u});return kg(s,e,r,t,!0)}function YA(n,e){const t=e._path;let i=null;n.syncPointTree_.foreachOnPath(t,(u,f)=>{const p=He(u,t);i=i||dn(f,p)});let s=n.syncPointTree_.get(t);s?i=i||dn(s,ie()):(s=new Hg,n.syncPointTree_=n.syncPointTree_.set(t,s));const r=i!=null,o=r?new un(i,!0,!1):null,l=Do(n.pendingWriteTree_,e._path),c=zg(s,e,l,r?o.getNode():H.EMPTY_NODE,r);return DA(c)}function Bs(n,e){return Xg(e,n.syncPointTree_,null,Do(n.pendingWriteTree_,ie()))}function Xg(n,e,t,i){if(X(n.path))return Jg(n,e,t,i);{const s=e.get(ie());t==null&&s!=null&&(t=dn(s,ie()));let r=[];const o=ee(n.path),l=n.operationForChild(o),c=e.children.get(o);if(c&&l){const u=t?t.getImmediateChild(o):null,f=xg(i,o);r=r.concat(Xg(l,c,u,f))}return s&&(r=r.concat(mc(s,n,i,t))),r}}function Jg(n,e,t,i){const s=e.get(ie());t==null&&s!=null&&(t=dn(s,ie()));let r=[];return e.children.inorderTraversal((o,l)=>{const c=t?t.getImmediateChild(o):null,u=xg(i,o),f=n.operationForChild(o);f&&(r=r.concat(Jg(f,l,c,u)))}),s&&(r=r.concat(mc(s,n,i,t))),r}function Zg(n,e){const t=e.query,i=qs(n,t);return{hashFn:()=>(xA(e)||H.EMPTY_NODE).hash(),onComplete:s=>{if(s==="ok")return i?GA(n,t._path,i):$A(n,t._path);{const r=Qb(s,t);return Qg(n,t,null,r)}}}}function qs(n,e){const t=Bo(e);return n.queryToTagMap.get(t)}function Bo(n){return n._path.toString()+"$"+n._queryIdentifier}function yc(n,e){return n.tagToQueryMap.get(e)}function vc(n){const e=n.indexOf("$");return x(e!==-1&&e<n.length-1,"Bad queryKey."),{queryId:n.substr(e+1),path:new re(n.substr(0,e))}}function Ec(n,e,t){const i=n.syncPointTree_.get(e);x(i,"Missing sync point for query tag that we're tracking");const s=Do(n.pendingWriteTree_,e);return mc(i,t,s,null)}function XA(n){return n.fold((e,t,i)=>{if(t&&fn(t))return[Fo(t)];{let s=[];return t&&(s=Wg(t)),Qe(i,(r,o)=>{s=s.concat(o)}),s}})}function Hs(n){return n._queryParams.loadsAllData()&&!n._queryParams.isDefault()?new(zA())(n._repo,n._path):n}function JA(n,e){for(let t=0;t<e.length;++t){const i=e[t];if(!i._queryParams.loadsAllData()){const s=Bo(i),r=n.queryToTagMap.get(s);n.queryToTagMap.delete(s),n.tagToQueryMap.delete(r)}}}function ZA(){return WA++}function eS(n,e,t){const i=e._path,s=qs(n,e),r=Zg(n,t),o=n.listenProvider_.startListening(Hs(e),s,r.hashFn,r.onComplete),l=n.syncPointTree_.subtree(i);if(s)x(!fn(l.value),"If we're adding a query, it shouldn't be shadowed");else{const c=l.fold((u,f,p)=>{if(!X(u)&&f&&fn(f))return[Fo(f).query];{let m=[];return f&&(m=m.concat(Wg(f).map(b=>b.query))),Qe(p,(b,S)=>{m=m.concat(S)}),m}});for(let u=0;u<c.length;++u){const f=c[u];n.listenProvider_.stopListening(Hs(f),qs(n,f))}}return o}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wc{constructor(e){this.node_=e}getImmediateChild(e){const t=this.node_.getImmediateChild(e);return new wc(t)}node(){return this.node_}}class Tc{constructor(e,t){this.syncTree_=e,this.path_=t}getImmediateChild(e){const t=be(this.path_,e);return new Tc(this.syncTree_,t)}node(){return _c(this.syncTree_,this.path_)}}const tS=function(n){return n=n||{},n.timestamp=n.timestamp||new Date().getTime(),n},em=function(n,e,t){if(!n||typeof n!="object")return n;if(x(".sv"in n,"Unexpected leaf node or priority contents"),typeof n[".sv"]=="string")return nS(n[".sv"],e,t);if(typeof n[".sv"]=="object")return iS(n[".sv"],e);x(!1,"Unexpected server value: "+JSON.stringify(n,null,2))},nS=function(n,e,t){switch(n){case"timestamp":return t.timestamp;default:x(!1,"Unexpected server value: "+n)}},iS=function(n,e,t){n.hasOwnProperty("increment")||x(!1,"Unexpected server value: "+JSON.stringify(n,null,2));const i=n.increment;typeof i!="number"&&x(!1,"Unexpected increment value: "+i);const s=e.node();if(x(s!==null&&typeof s<"u","Expected ChildrenNode.EMPTY_NODE for nulls"),!s.isLeafNode())return i;const o=s.getValue();return typeof o!="number"?i:o+i},sS=function(n,e,t,i){return Ic(e,new Tc(t,n),i)},tm=function(n,e,t){return Ic(n,new wc(e),t)};function Ic(n,e,t){const i=n.getPriority().val(),s=em(i,e.getImmediateChild(".priority"),t);let r;if(n.isLeafNode()){const o=n,l=em(o.getValue(),e,t);return l!==o.getValue()||s!==o.getPriority().val()?new Pe(l,ke(s)):n}else{const o=n;return r=o,s!==o.getPriority().val()&&(r=r.updatePriority(new Pe(s))),o.forEachChild(pe,(l,c)=>{const u=Ic(c,e.getImmediateChild(l),t);u!==c&&(r=r.updateImmediateChild(l,u))}),r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bc{constructor(e="",t=null,i={children:{},childCount:0}){this.name=e,this.parent=t,this.node=i}}function Cc(n,e){let t=e instanceof re?e:new re(e),i=n,s=ee(t);for(;s!==null;){const r=ri(i.node.children,s)||{children:{},childCount:0};i=new bc(s,i,r),t=ae(t),s=ee(t)}return i}function Mi(n){return n.node.value}function nm(n,e){n.node.value=e,Ac(n)}function im(n){return n.node.childCount>0}function rS(n){return Mi(n)===void 0&&!im(n)}function qo(n,e){Qe(n.node.children,(t,i)=>{e(new bc(t,n,i))})}function sm(n,e,t,i){t&&e(n),qo(n,s=>{sm(s,e,!0)})}function oS(n,e,t){let i=n.parent;for(;i!==null;){if(e(i))return!0;i=i.parent}return!1}function zs(n){return new re(n.parent===null?n.name:zs(n.parent)+"/"+n.name)}function Ac(n){n.parent!==null&&aS(n.parent,n.name,n)}function aS(n,e,t){const i=rS(t),s=bt(n.node.children,e);i&&s?(delete n.node.children[e],n.node.childCount--,Ac(n)):!i&&!s&&(n.node.children[e]=t.node,n.node.childCount++,Ac(n))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lS=/[\[\].#$\/\u0000-\u001F\u007F]/,cS=/[\[\].#$\u0000-\u001F\u007F]/,Sc=10*1024*1024,rm=function(n){return typeof n=="string"&&n.length!==0&&!lS.test(n)},om=function(n){return typeof n=="string"&&n.length!==0&&!cS.test(n)},uS=function(n){return n&&(n=n.replace(/^\/*\.info(\/|$)/,"/")),om(n)},hS=function(n,e,t,i){Rc(Ea(n,"value"),e,t)},Rc=function(n,e,t){const i=t instanceof re?new RC(t,n):t;if(e===void 0)throw new Error(n+"contains undefined "+jn(i));if(typeof e=="function")throw new Error(n+"contains a function "+jn(i)+" with contents = "+e.toString());if(Rp(e))throw new Error(n+"contains "+e.toString()+" "+jn(i));if(typeof e=="string"&&e.length>Sc/3&&yr(e)>Sc)throw new Error(n+"contains a string greater than "+Sc+" utf8 bytes "+jn(i)+" ('"+e.substring(0,50)+"...')");if(e&&typeof e=="object"){let s=!1,r=!1;if(Qe(e,(o,l)=>{if(o===".value")s=!0;else if(o!==".priority"&&o!==".sv"&&(r=!0,!rm(o)))throw new Error(n+" contains an invalid key ("+o+") "+jn(i)+`.  Keys must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"`);PC(i,o),Rc(n,l,i),kC(i)}),s&&r)throw new Error(n+' contains ".value" child '+jn(i)+" in addition to actual children.")}},am=function(n,e,t,i){if(!om(t))throw new Error(Ea(n,e)+'was an invalid path = "'+t+`". Paths must be non-empty strings and can't contain ".", "#", "$", "[", or "]"`)},dS=function(n,e,t,i){t&&(t=t.replace(/^\/*\.info(\/|$)/,"/")),am(n,e,t)},lm=function(n,e){if(ee(e)===".info")throw new Error(n+" failed = Can't modify data under /.info/")},fS=function(n,e){const t=e.path.toString();if(typeof e.repoInfo.host!="string"||e.repoInfo.host.length===0||!rm(e.repoInfo.namespace)&&e.repoInfo.host.split(":")[0]!=="localhost"||t.length!==0&&!uS(t))throw new Error(Ea(n,"url")+`must be a valid firebase URL and the path can't contain ".", "#", "$", "[", or "]".`)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pS{constructor(){this.eventLists_=[],this.recursionDepth_=0}}function cm(n,e){let t=null;for(let i=0;i<e.length;i++){const s=e[i],r=s.getPath();t!==null&&!lg(r,t.path)&&(n.eventLists_.push(t),t=null),t===null&&(t={events:[],path:r}),t.events.push(s)}t&&n.eventLists_.push(t)}function vt(n,e,t){cm(n,t),gS(n,i=>ot(i,e)||ot(e,i))}function gS(n,e){n.recursionDepth_++;let t=!0;for(let i=0;i<n.eventLists_.length;i++){const s=n.eventLists_[i];if(s){const r=s.path;e(r)?(mS(n.eventLists_[i]),n.eventLists_[i]=null):t=!1}}t&&(n.eventLists_=[]),n.recursionDepth_--}function mS(n){for(let e=0;e<n.events.length;e++){const t=n.events[e];if(t!==null){n.events[e]=null;const i=t.getEventRunner();Is&&Be("event: "+t.toString()),Ni(i)}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _S="repo_interrupt",yS=25;class vS{constructor(e,t,i,s){this.repoInfo_=e,this.forceRestClient_=t,this.authTokenProvider_=i,this.appCheckProvider_=s,this.dataUpdateCount=0,this.statsListener_=null,this.eventQueue_=new pS,this.nextWriteId_=1,this.interceptServerDataCallback_=null,this.onDisconnect_=Po(),this.transactionQueueTree_=new bc,this.persistentConnection_=null,this.key=this.repoInfo_.toURLString()}toString(){return(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host}}function ES(n,e,t){if(n.stats_=Yl(n.repoInfo_),n.forceRestClient_||Zb())n.server_=new Ro(n.repoInfo_,(i,s,r,o)=>{um(n,i,s,r,o)},n.authTokenProvider_,n.appCheckProvider_),setTimeout(()=>hm(n,!0),0);else{if(typeof t<"u"&&t!==null){if(typeof t!="object")throw new Error("Only objects are supported for option databaseAuthVariableOverride");try{Ee(t)}catch(i){throw new Error("Invalid authOverride provided: "+i)}}n.persistentConnection_=new Ot(n.repoInfo_,e,(i,s,r,o)=>{um(n,i,s,r,o)},i=>{hm(n,i)},i=>{TS(n,i)},n.authTokenProvider_,n.appCheckProvider_,t),n.server_=n.persistentConnection_}n.authTokenProvider_.addTokenChangeListener(i=>{n.server_.refreshAuthToken(i)}),n.appCheckProvider_.addTokenChangeListener(i=>{n.server_.refreshAppCheckToken(i.token)}),n.statsReporter_=sC(n.repoInfo_,()=>new nA(n.stats_,n.server_)),n.infoData_=new XC,n.infoSyncTree_=new Gg({startListening:(i,s,r,o)=>{let l=[];const c=n.infoData_.getNode(i._path);return c.isEmpty()||(l=Us(n.infoSyncTree_,i._path,c),setTimeout(()=>{o("ok")},0)),l},stopListening:()=>{}}),kc(n,"connected",!1),n.serverSyncTree_=new Gg({startListening:(i,s,r,o)=>(n.server_.listen(i,r,s,(l,c)=>{const u=o(l,c);vt(n.eventQueue_,i._path,u)}),[]),stopListening:(i,s)=>{n.server_.unlisten(i,s)}})}function wS(n){const t=n.infoData_.getNode(new re(".info/serverTimeOffset")).val()||0;return new Date().getTime()+t}function Pc(n){return tS({timestamp:wS(n)})}function um(n,e,t,i,s){n.dataUpdateCount++;const r=new re(e);t=n.interceptServerDataCallback_?n.interceptServerDataCallback_(e,t):t;let o=[];if(s)if(i){const c=_r(t,u=>ke(u));o=KA(n.serverSyncTree_,r,c,s)}else{const c=ke(t);o=Yg(n.serverSyncTree_,r,c,s)}else if(i){const c=_r(t,u=>ke(u));o=jA(n.serverSyncTree_,r,c)}else{const c=ke(t);o=Us(n.serverSyncTree_,r,c)}let l=r;o.length>0&&(l=zo(n,r)),vt(n.eventQueue_,l,o)}function hm(n,e){kc(n,"connected",e),e===!1&&CS(n)}function TS(n,e){Qe(e,(t,i)=>{kc(n,t,i)})}function kc(n,e,t){const i=new re("/.info/"+e),s=ke(t);n.infoData_.updateSnapshot(i,s);const r=Us(n.infoSyncTree_,i,s);vt(n.eventQueue_,i,r)}function dm(n){return n.nextWriteId_++}function IS(n,e,t){const i=YA(n.serverSyncTree_,e);return i!=null?Promise.resolve(i):n.server_.get(e).then(s=>{const r=ke(s).withIndex(e._queryParams.getIndex());QA(n.serverSyncTree_,e,t,!0);let o;if(e._queryParams.loadsAllData())o=Us(n.serverSyncTree_,e._path,r);else{const l=qs(n.serverSyncTree_,e);o=Yg(n.serverSyncTree_,e._path,r,l)}return vt(n.eventQueue_,e._path,o),Qg(n.serverSyncTree_,e,t,null,!0),r},s=>(Ho(n,"get for query "+Ee(e)+" failed: "+s),Promise.reject(new Error(s))))}function bS(n,e,t,i,s){Ho(n,"set",{path:e.toString(),value:t,priority:i});const r=Pc(n),o=ke(t,i),l=_c(n.serverSyncTree_,e),c=tm(o,l,r),u=dm(n),f=Kg(n.serverSyncTree_,e,c,u,!0);cm(n.eventQueue_,f),n.server_.put(e.toString(),o.val(!0),(m,b)=>{const S=m==="ok";S||Ke("set at "+e+" failed: "+m);const N=Qn(n.serverSyncTree_,u,!S);vt(n.eventQueue_,e,N),SS(n,s,m,b)});const p=_m(n,e);zo(n,p),vt(n.eventQueue_,p,[])}function CS(n){Ho(n,"onDisconnectEvents");const e=Pc(n),t=Po();rc(n.onDisconnect_,ie(),(s,r)=>{const o=sS(s,r,n.serverSyncTree_,e);wg(t,s,o)});let i=[];rc(t,ie(),(s,r)=>{i=i.concat(Us(n.serverSyncTree_,s,r));const o=_m(n,s);zo(n,o)}),n.onDisconnect_=Po(),vt(n.eventQueue_,ie(),i)}function AS(n){n.persistentConnection_&&n.persistentConnection_.interrupt(_S)}function Ho(n,...e){let t="";n.persistentConnection_&&(t=n.persistentConnection_.id+":"),Be(t,...e)}function SS(n,e,t,i){e&&Ni(()=>{if(t==="ok")e(null);else{const s=(t||"error").toUpperCase();let r=s;i&&(r+=": "+i);const o=new Error(r);o.code=s,e(o)}})}function fm(n,e,t){return _c(n.serverSyncTree_,e,t)||H.EMPTY_NODE}function Nc(n,e=n.transactionQueueTree_){if(e||Wo(n,e),Mi(e)){const t=gm(n,e);x(t.length>0,"Sending zero length transaction queue"),t.every(s=>s.status===0)&&RS(n,zs(e),t)}else im(e)&&qo(e,t=>{Nc(n,t)})}function RS(n,e,t){const i=t.map(u=>u.currentWriteId),s=fm(n,e,i);let r=s;const o=s.hash();for(let u=0;u<t.length;u++){const f=t[u];x(f.status===0,"tryToSendTransactionQueue_: items in queue should all be run."),f.status=1,f.retryCount++;const p=He(e,f.path);r=r.updateChild(p,f.currentOutputSnapshotRaw)}const l=r.val(!0),c=e;n.server_.put(c.toString(),l,u=>{Ho(n,"transaction put response",{path:c.toString(),status:u});let f=[];if(u==="ok"){const p=[];for(let m=0;m<t.length;m++)t[m].status=2,f=f.concat(Qn(n.serverSyncTree_,t[m].currentWriteId)),t[m].onComplete&&p.push(()=>t[m].onComplete(null,!0,t[m].currentOutputSnapshotResolved)),t[m].unwatcher();Wo(n,Cc(n.transactionQueueTree_,e)),Nc(n,n.transactionQueueTree_),vt(n.eventQueue_,e,f);for(let m=0;m<p.length;m++)Ni(p[m])}else{if(u==="datastale")for(let p=0;p<t.length;p++)t[p].status===3?t[p].status=4:t[p].status=0;else{Ke("transaction at "+c.toString()+" failed: "+u);for(let p=0;p<t.length;p++)t[p].status=4,t[p].abortReason=u}zo(n,e)}},o)}function zo(n,e){const t=pm(n,e),i=zs(t),s=gm(n,t);return PS(n,s,i),i}function PS(n,e,t){if(e.length===0)return;const i=[];let s=[];const o=e.filter(l=>l.status===0).map(l=>l.currentWriteId);for(let l=0;l<e.length;l++){const c=e[l],u=He(t,c.path);let f=!1,p;if(x(u!==null,"rerunTransactionsUnderNode_: relativePath should not be null."),c.status===4)f=!0,p=c.abortReason,s=s.concat(Qn(n.serverSyncTree_,c.currentWriteId,!0));else if(c.status===0)if(c.retryCount>=yS)f=!0,p="maxretry",s=s.concat(Qn(n.serverSyncTree_,c.currentWriteId,!0));else{const m=fm(n,c.path,o);c.currentInputSnapshot=m;const b=e[l].update(m.val());if(b!==void 0){Rc("transaction failed: Data returned ",b,c.path);let S=ke(b);typeof b=="object"&&b!=null&&bt(b,".priority")||(S=S.updatePriority(m.getPriority()));const P=c.currentWriteId,D=Pc(n),V=tm(S,m,D);c.currentOutputSnapshotRaw=S,c.currentOutputSnapshotResolved=V,c.currentWriteId=dm(n),o.splice(o.indexOf(P),1),s=s.concat(Kg(n.serverSyncTree_,c.path,V,c.currentWriteId,c.applyLocally)),s=s.concat(Qn(n.serverSyncTree_,P,!0))}else f=!0,p="nodata",s=s.concat(Qn(n.serverSyncTree_,c.currentWriteId,!0))}vt(n.eventQueue_,t,s),s=[],f&&(e[l].status=2,function(m){setTimeout(m,Math.floor(0))}(e[l].unwatcher),e[l].onComplete&&(p==="nodata"?i.push(()=>e[l].onComplete(null,!1,e[l].currentInputSnapshot)):i.push(()=>e[l].onComplete(new Error(p),!1,null))))}Wo(n,n.transactionQueueTree_);for(let l=0;l<i.length;l++)Ni(i[l]);Nc(n,n.transactionQueueTree_)}function pm(n,e){let t,i=n.transactionQueueTree_;for(t=ee(e);t!==null&&Mi(i)===void 0;)i=Cc(i,t),e=ae(e),t=ee(e);return i}function gm(n,e){const t=[];return mm(n,e,t),t.sort((i,s)=>i.order-s.order),t}function mm(n,e,t){const i=Mi(e);if(i)for(let s=0;s<i.length;s++)t.push(i[s]);qo(e,s=>{mm(n,s,t)})}function Wo(n,e){const t=Mi(e);if(t){let i=0;for(let s=0;s<t.length;s++)t[s].status!==2&&(t[i]=t[s],i++);t.length=i,nm(e,t.length>0?t:void 0)}qo(e,i=>{Wo(n,i)})}function _m(n,e){const t=zs(pm(n,e)),i=Cc(n.transactionQueueTree_,e);return oS(i,s=>{xc(n,s)}),xc(n,i),sm(i,s=>{xc(n,s)}),t}function xc(n,e){const t=Mi(e);if(t){const i=[];let s=[],r=-1;for(let o=0;o<t.length;o++)t[o].status===3||(t[o].status===1?(x(r===o-1,"All SENT items should be at beginning of queue."),r=o,t[o].status=3,t[o].abortReason="set"):(x(t[o].status===0,"Unexpected transaction status in abort"),t[o].unwatcher(),s=s.concat(Qn(n.serverSyncTree_,t[o].currentWriteId,!0)),t[o].onComplete&&i.push(t[o].onComplete.bind(null,new Error("set"),!1,null))));r===-1?nm(e,void 0):t.length=r+1,vt(n.eventQueue_,zs(e),s);for(let o=0;o<i.length;o++)Ni(i[o])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kS(n){let e="";const t=n.split("/");for(let i=0;i<t.length;i++)if(t[i].length>0){let s=t[i];try{s=decodeURIComponent(s.replace(/\+/g," "))}catch{}e+="/"+s}return e}function NS(n){const e={};n.charAt(0)==="?"&&(n=n.substring(1));for(const t of n.split("&")){if(t.length===0)continue;const i=t.split("=");i.length===2?e[decodeURIComponent(i[0])]=decodeURIComponent(i[1]):Ke(`Invalid query segment '${t}' in query '${n}'`)}return e}const ym=function(n,e){const t=xS(n),i=t.namespace;t.domain==="firebase.com"&&Dt(t.host+" is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead"),(!i||i==="undefined")&&t.domain!=="localhost"&&Dt("Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com"),t.secure||Wb();const s=t.scheme==="ws"||t.scheme==="wss";return{repoInfo:new qp(t.host,t.secure,i,s,e,"",i!==t.subdomain),path:new re(t.pathString)}},xS=function(n){let e="",t="",i="",s="",r="",o=!0,l="https",c=443;if(typeof n=="string"){let u=n.indexOf("//");u>=0&&(l=n.substring(0,u-1),n=n.substring(u+2));let f=n.indexOf("/");f===-1&&(f=n.length);let p=n.indexOf("?");p===-1&&(p=n.length),e=n.substring(0,Math.min(f,p)),f<p&&(s=kS(n.substring(f,p)));const m=NS(n.substring(Math.min(n.length,p)));u=e.indexOf(":"),u>=0?(o=l==="https"||l==="wss",c=parseInt(e.substring(u+1),10)):u=e.length;const b=e.slice(0,u);if(b.toLowerCase()==="localhost")t="localhost";else if(b.split(".").length<=2)t=b;else{const S=e.indexOf(".");i=e.substring(0,S).toLowerCase(),t=e.substring(S+1),r=i}"ns"in m&&(r=m.ns)}return{host:e,port:c,domain:t,subdomain:i,secure:o,scheme:l,pathString:s,namespace:r}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class DS{constructor(e,t,i,s){this.eventType=e,this.eventRegistration=t,this.snapshot=i,this.prevName=s}getPath(){const e=this.snapshot.ref;return this.eventType==="value"?e._path:e.parent._path}getEventType(){return this.eventType}getEventRunner(){return this.eventRegistration.getEventRunner(this)}toString(){return this.getPath().toString()+":"+this.eventType+":"+Ee(this.snapshot.exportVal())}}class OS{constructor(e,t,i){this.eventRegistration=e,this.error=t,this.path=i}getPath(){return this.path}getEventType(){return"cancel"}getEventRunner(){return this.eventRegistration.getEventRunner(this)}toString(){return this.path.toString()+":cancel"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class VS{constructor(e,t){this.snapshotCallback=e,this.cancelCallback=t}onValue(e,t){this.snapshotCallback.call(null,e,t)}onCancel(e){return x(this.hasCancelCallback,"Raising a cancel event on a listener with no cancel callback"),this.cancelCallback.call(null,e)}get hasCancelCallback(){return!!this.cancelCallback}matches(e){return this.snapshotCallback===e.snapshotCallback||this.snapshotCallback.userCallback!==void 0&&this.snapshotCallback.userCallback===e.snapshotCallback.userCallback&&this.snapshotCallback.context===e.snapshotCallback.context}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dc{constructor(e,t,i,s){this._repo=e,this._path=t,this._queryParams=i,this._orderByCalled=s}get key(){return X(this._path)?null:rg(this._path)}get ref(){return new Lt(this._repo,this._path)}get _queryIdentifier(){const e=Eg(this._queryParams),t=jl(e);return t==="{}"?"default":t}get _queryObject(){return Eg(this._queryParams)}isEqual(e){if(e=Ae(e),!(e instanceof Dc))return!1;const t=this._repo===e._repo,i=lg(this._path,e._path),s=this._queryIdentifier===e._queryIdentifier;return t&&i&&s}toJSON(){return this.toString()}toString(){return this._repo.toString()+SC(this._path)}}class Lt extends Dc{constructor(e,t){super(e,t,new sc,!1)}get parent(){const e=ag(this._path);return e===null?null:new Lt(this._repo,e)}get root(){let e=this;for(;e.parent!==null;)e=e.parent;return e}}class Ws{constructor(e,t,i){this._node=e,this.ref=t,this._index=i}get priority(){return this._node.getPriority().val()}get key(){return this.ref.key}get size(){return this._node.numChildren()}child(e){const t=new re(e),i=Vc(this.ref,e);return new Ws(this._node.getChild(t),i,pe)}exists(){return!this._node.isEmpty()}exportVal(){return this._node.val(!0)}forEach(e){return this._node.isLeafNode()?!1:!!this._node.forEachChild(this._index,(i,s)=>e(new Ws(s,Vc(this.ref,i),pe)))}hasChild(e){const t=new re(e);return!this._node.getChild(t).isEmpty()}hasChildren(){return this._node.isLeafNode()?!1:!this._node.isEmpty()}toJSON(){return this.exportVal()}val(){return this._node.val()}}function Oc(n,e){return n=Ae(n),n._checkNotDeleted("ref"),e!==void 0?Vc(n._root,e):n._root}function Vc(n,e){return n=Ae(n),ee(n._path)===null?dS("child","path",e):am("child","path",e),new Lt(n._repo,be(n._path,e))}function LS(n){return lm("remove",n._path),vm(n,null)}function vm(n,e){n=Ae(n),lm("set",n._path),hS("set",e,n._path);const t=new mr;return bS(n._repo,n._path,e,null,t.wrapCallback(()=>{})),t.promise}function MS(n){n=Ae(n);const e=new VS(()=>{}),t=new Lc(e);return IS(n._repo,n,t).then(i=>new Ws(i,new Lt(n._repo,n._path),n._queryParams.getIndex()))}class Lc{constructor(e){this.callbackContext=e}respondsTo(e){return e==="value"}createEvent(e,t){const i=t._queryParams.getIndex();return new DS("value",this,new Ws(e.snapshotNode,new Lt(t._repo,t._path),i))}getEventRunner(e){return e.getEventType()==="cancel"?()=>this.callbackContext.onCancel(e.error):()=>this.callbackContext.onValue(e.snapshot,null)}createCancelEvent(e,t){return this.callbackContext.hasCancelCallback?new OS(this,e,t):null}matches(e){return e instanceof Lc?!e.callbackContext||!this.callbackContext?!0:e.callbackContext.matches(this.callbackContext):!1}hasAnyCallback(){return this.callbackContext!==null}}MA(Lt),HA(Lt);/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const FS="FIREBASE_DATABASE_EMULATOR_HOST",Mc={};let US=!1;function BS(n,e,t,i){const s=e.lastIndexOf(":"),r=e.substring(0,s),o=Pn(r);n.repoInfo_=new qp(e,o,n.repoInfo_.namespace,n.repoInfo_.webSocketOnly,n.repoInfo_.nodeAdmin,n.repoInfo_.persistenceKey,n.repoInfo_.includeNamespaceInQueryParams,!0,t),i&&(n.authTokenProvider_=i)}function qS(n,e,t,i,s){let r=i||n.options.databaseURL;r===void 0&&(n.options.projectId||Dt("Can't determine Firebase Database URL. Be sure to include  a Project ID when calling firebase.initializeApp()."),Be("Using default host for project ",n.options.projectId),r=`${n.options.projectId}-default-rtdb.firebaseio.com`);let o=ym(r,s),l=o.repoInfo,c;typeof process<"u"&&process.env&&(c=process.env[FS]),c?(r=`http://${c}?ns=${l.namespace}`,o=ym(r,s),l=o.repoInfo):o.repoInfo.secure;const u=new tC(n.name,n.options,e);fS("Invalid Firebase Database URL",o),X(o.path)||Dt("Database URL must point to the root of a Firebase Database (not including a child path).");const f=zS(l,n,u,new eC(n,t));return new WS(f,n)}function HS(n,e){const t=Mc[e];(!t||t[n.key]!==n)&&Dt(`Database ${e}(${n.repoInfo_}) has already been deleted.`),AS(n),delete t[n.key]}function zS(n,e,t,i){let s=Mc[e.name];s||(s={},Mc[e.name]=s);let r=s[n.toURLString()];return r&&Dt("Database initialized multiple times. Please make sure the format of the database URL matches with each database() call."),r=new vS(n,US,t,i),s[n.toURLString()]=r,r}class WS{constructor(e,t){this._repoInternal=e,this.app=t,this.type="database",this._instanceStarted=!1}get _repo(){return this._instanceStarted||(ES(this._repoInternal,this.app.options.appId,this.app.options.databaseAuthVariableOverride),this._instanceStarted=!0),this._repoInternal}get _root(){return this._rootInternal||(this._rootInternal=new Lt(this._repo,ie())),this._rootInternal}_delete(){return this._rootInternal!==null&&(HS(this._repo,this.app.name),this._repoInternal=null,this._rootInternal=null),Promise.resolve()}_checkNotDeleted(e){this._rootInternal===null&&Dt("Cannot call "+e+" on a deleted database.")}}function jS(n=Na(),e){const t=wr(n,"database").getImmediate({identifier:e});if(!t._instanceStarted){const i=Pu("database");i&&$S(t,...i)}return t}function $S(n,e,t,i={}){n=Ae(n),n._checkNotDeleted("useEmulator");const s=`${e}:${t}`,r=n._repoInternal;if(n._instanceStarted){if(s===n._repoInternal.repoInfo_.host&&Bt(i,r.repoInfo_.emulatorOptions))return;Dt("connectDatabaseEmulator() cannot initialize or alter the emulator configuration after the database instance has started.")}let o;if(r.repoInfo_.nodeAdmin)i.mockUserToken&&Dt('mockUserToken is not supported by the Admin SDK. For client access with mock users, please use the "firebase" package instead of "firebase-admin".'),o=new wo(wo.OWNER);else if(i.mockUserToken){const l=typeof i.mockUserToken=="string"?i.mockUserToken:xu(i.mockUserToken,n.app.options.projectId);o=new wo(l)}Pn(e)&&wa(e),BS(r,s,i,o)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function GS(n){Fb(xn),Nn(new qt("database",(e,{instanceIdentifier:t})=>{const i=e.getProvider("app").getImmediate(),s=e.getProvider("auth-internal"),r=e.getProvider("app-check-internal");return qS(i,s,r,t)},"PUBLIC").setMultipleInstances(!0)),ct(Tp,Ip,n),ct(Tp,Ip,"esm2020")}Ot.prototype.simpleListen=function(n,e){this.sendRequest("q",{p:n},e)},Ot.prototype.echo=function(n,e){this.sendRequest("echo",{d:n},e)},GS();const KS={apiKey:"AIzaSyCYrdBg99Oz9nGjAoY7gF0kt4YZtZiNjHQ",authDomain:"vnpt-backup-field-v1.firebaseapp.com",databaseURL:"https://vnpt-backup-field-v1-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"vnpt-backup-field-v1",storageBucket:"vnpt-backup-field-v1.firebasestorage.app",messagingSenderId:"409213606694",appId:"1:409213606694:web:c8046b6640b01f3ddbffe7",measurementId:"G-QDW2M6RB0Z"};let jo=null,Fc=null,Fi=null,$o=null,Go=null;function QS(){try{jo=zu(KS),Fc=dw(jo),Fi=vb(jo),$o=jS(jo),Qv(Fc).then(()=>xe.info("[Firebase] Anonymous sign-in OK")).catch(n=>xe.error("[Firebase] Sign-in error:",n)),tE(Fc,n=>{Go=n,n&&(xe.info(`[Firebase] UID: ${n.uid}`),window.__firebaseUID=n.uid)}),xe.info("[Firebase] Initialized")}catch(n){xe.error("[Firebase] Init failed:",n)}}function Uc(){return(Go==null?void 0:Go.uid)??null}async function YS(){const n=Uc();if(!n)return null;try{const e=await Ob(yo(Fi,"users",n,"config","main"));return e.exists()?e.data():null}catch(e){return xe.error("[Firebase] loadUserConfig error:",e),null}}async function XS(n){const e=Uc();if(e)try{await Ep(yo(Fi,"users",e,"config","main"),{...n,updatedAt:mp()}),xe.info("[Firebase] User config saved")}catch(t){xe.error("[Firebase] saveUserConfig error:",t)}}async function JS(){try{return(await Vb(rp(Fi,"templates"))).docs.map(e=>({id:e.id,...e.data()}))}catch(n){return xe.error("[Firebase] listCloudTemplates error:",n),[]}}async function ZS(n,e,t=""){const i=Uc();try{const s=yo(rp(Fi,"templates")),r=Oc($o,`template_files/${s.id}`);return await vm(r,n),await Ep(s,{name:e,description:t,uploadedBy:i??"unknown",createdAt:mp()}),xe.info(`[Firebase] Template uploaded to RTDB: ${s.id}`),s.id}catch(s){return xe.error("[Firebase] uploadCloudTemplate error:",s),null}}async function Em(n){try{const e=await MS(Oc($o,`template_files/${n}`));if(!e.exists())return null;const t=e.val(),i=atob(t),s=i.length,r=new Uint8Array(s);for(let o=0;o<s;o++)r[o]=i.charCodeAt(o);return r.buffer}catch(e){return xe.error("[Firebase] downloadCloudTemplateArrayBuffer error:",e),null}}async function eR(n){try{await LS(Oc($o,`template_files/${n}`)),await Lb(yo(Fi,"templates",n)),xe.info(`[Firebase] Template deleted: ${n}`)}catch(e){xe.error("[Firebase] deleteCloudTemplate error:",e)}}function tR(n,e,t,i=null){e.querySelectorAll(".cloud-control-btn").forEach(u=>u.remove());let r=n.querySelector(".vnpt-cloud-tpl-section");r?r.innerHTML="":(r=document.createElement("div"),r.className="vnpt-cloud-tpl-section",r.style.cssText="margin-top: 10px; border-top: 1px dashed #ccc; padding-top: 5px;",n.appendChild(r));const o=document.createElement("button");o.className="cloud-control-btn",o.textContent="⬆ Up",o.title="Tải file .docx lên Cloud",o.style.cssText="font-size:10px;padding:2px 5px;border:1px solid #28a745;background:#e8f5e9;color:#28a745;border-radius:4px;cursor:pointer;font-weight:600;display:block;",o.onclick=()=>{const u=document.createElement("input");u.type="file",u.accept=".docx",u.onchange=async f=>{f.target.files&&f.target.files[0]&&await wm(f.target.files[0],t,n)},u.click()};const l=document.createElement("button");l.className="cloud-control-btn",l.textContent="⬇ Down",l.style.cssText="font-size:10px;padding:2px 5px;border:1px solid #17a2b8;background:#e0f7fa;color:#00838f;border-radius:4px;cursor:pointer;font-weight:600;display:block;",l.onclick=async()=>{fe("⬇ Đang tải danh sách...","#17a2b8"),await Bc(c,t)},e.insertBefore(l,e.firstChild),e.insertBefore(o,e.firstChild);const c=document.createElement("div");c.style.display="block",r.appendChild(c),Bc(c,t)}async function Bc(n,e,t){n.innerHTML="";const i=await JS();if(i.length===0)return;const s=document.createElement("div");s.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",i.forEach(r=>{const o=document.createElement("div");o.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#e3f2fd;border:1px solid #bbdefb;border-radius:15px;cursor:pointer;",o.title=r.description||r.name;const l=document.createElement("span");l.textContent=r.name,l.style.cssText="font-size:11px;font-weight:600;color:#0d47a1;white-space:nowrap;padding-left:4px;",o.onclick=async()=>{fe(`☁️ Đang tải ${r.name}...`,"#1976d2");const f=await Em(r.id);f?(e&&e(f,r.name),fe(`✅ Đã nạp ${r.name}`,"#28a745")):fe("❌ Lỗi tải arraybuffer","#dc3545")};const c=document.createElement("button");c.innerHTML="⬇️",c.title="Tải file gốc về máy tính",c.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;cursor:pointer;margin-left:auto;",c.onclick=async f=>{f.stopPropagation(),fe("Đang tạo file tải xuống...","#1976d2");const p=await Em(r.id);if(p){const m=new Blob([p],{type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),b=URL.createObjectURL(m),S=document.createElement("a");S.href=b,S.download=r.name+".docx",document.body.appendChild(S),S.click(),setTimeout(()=>{document.body.removeChild(S),URL.revokeObjectURL(b)},100)}else fe("Lỗi lấy dữ liệu tải xuống","#dc3545")};const u=document.createElement("button");u.innerHTML="✕",u.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",u.onclick=async f=>{f.stopPropagation(),confirm(`Xoá template cloud "${r.name}"?`)&&(await eR(r.id),Bc(n,e))},o.appendChild(l),o.appendChild(c),o.appendChild(u),s.appendChild(o)}),n.appendChild(s)}async function wm(n,e,t){const i=prompt("Tên template trên Cloud:",n.name.replace(/\.docx$/i,""));if(!i||!i.trim())return;const s=prompt("Mô tả (tuỳ chọn):","");fe("☁️ Đang xử lý file...","#1976d2");try{const r=await new Promise((l,c)=>{const u=new FileReader;u.readAsDataURL(n),u.onload=()=>l(u.result.split(",")[1]),u.onerror=f=>c(f)});fe(`☁️ Đang upload ${i}...`,"#1976d2"),await ZS(r,i.trim(),s)&&(fe("✅ Upload thành công!","#28a745"),Yn(t,e))}catch(r){fe(`❌ Lỗi upload: ${r.message}`,"#dc3545")}}function js(){try{const n=JSON.parse(localStorage.getItem(Iu))||[],e=n.filter(t=>t.type!=="local");return e.length!==n.length&&$s(e),e}catch{return[]}}function $s(n){localStorage.setItem(Iu,JSON.stringify(n))}function nR(n){const e=n.match(/drive\.google\.com\/file\/d\/([^/]+)/);return e?`https://drive.google.com/uc?export=download&id=${e[1]}`:n}function iR(n){return new Promise((e,t)=>{GM_xmlhttpRequest({method:"GET",url:nR(n),responseType:"arraybuffer",onload:i=>{if(i.status>=200&&i.status<300){if(i.response&&i.response.byteLength>4){const s=new Uint8Array(i.response.slice(0,4));if(s[0]===80&&s[1]===75&&s[2]===3&&s[3]===4){e(i.response);return}else{t(new Error("Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai)."));return}}e(i.response)}else t(new Error(`HTTP ${i.status}: Không lấy được file`))},onerror:()=>t(new Error("Không thể tải URL.")),ontimeout:()=>t(new Error("Timeout khi tải URL."))})})}function sR(n){return new Promise((e,t)=>{const i=new FileReader;i.readAsDataURL(n),i.onload=()=>e(i.result),i.onerror=s=>t(s)})}function Tm(n){const e=window.atob(n.split(",")[1]),t=e.length,i=new Uint8Array(t);for(let s=0;s<t;s++)i[s]=e.charCodeAt(s);return i.buffer}async function rR(n,e,t){const i=n.name.replace(/\.docx$/i,""),s=prompt("Đặt tên biến nhớ cho file này:",i);if(!(!s||!s.trim()))try{const r=await sR(n),l=js().filter(u=>u.name!==s.trim()&&u.fileName!==n.name);l.unshift({name:s.trim(),type:"local_base64",data:r,fileName:n.name,lastUsed:Date.now()}),$s(l),Yn(e,t);const c=Tm(r);t&&t(c,s.trim())}catch(r){fe(`❌ Lỗi lưu file: ${r.message}`,"#dc3545")}}function Yn(n,e,t=null){n.innerHTML="";const i=js(),s=document.createElement("div");s.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;";const r=document.createElement("span");r.style.cssText="font-size:11px;font-weight:700;color:#444;",r.innerHTML="📁 Bộ nhớ Templates"+(t?` <span style="color:#2e7d32;">(Đang dùng: ${t})</span>`:"");const o=document.createElement("div");if(o.style.cssText="display:flex;gap:4px;",s.appendChild(r),s.appendChild(o),n.appendChild(s),i.length===0){const c=document.createElement("div");c.style.cssText="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;",c.textContent="Chọn file bên dưới để tự ghi nhớ mẫu",n.appendChild(c);return}const l=document.createElement("div");l.style.cssText="display:flex;flex-wrap:wrap;gap:2px;",i.forEach((c,u)=>{const f=document.createElement("div");f.style.cssText="display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;",f.title=c.fileName||c.url||c.name;const p=c.type==="local"||c.type==="local_base64"?"OFF":"ON",m=p==="OFF"?"#6c757d":"#28a745",b=document.createElement("span");b.textContent=p,b.style.cssText=`font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${m};color:#fff;`;const S=document.createElement("span");S.textContent=c.name,S.style.cssText="font-size:11px;font-weight:600;color:#212529;white-space:nowrap;",f.onclick=()=>{oR(c,e,t,n)},f.appendChild(b),f.appendChild(S);const N=document.createElement("button");if(N.innerHTML="✎",N.title="Đổi tên template",N.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;",N.onclick=D=>{D.stopPropagation();const V=prompt("Đổi tên template:",c.name);if(V&&V.trim()&&V.trim()!==c.name){const U=js();U[u].name=V.trim(),$s(U),Yn(n,e,t)}},f.appendChild(N),c.type==="local_base64"){const D=document.createElement("button");D.innerHTML="☁️",D.title="Tải lên Cloud (Chia sẻ)",D.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#1976d2;cursor:pointer;margin-left:2px;",D.onclick=async V=>{V.stopPropagation();const U=atob(c.data.split(",")[1]),W=new ArrayBuffer(U.length),te=new Uint8Array(W);for(let _=0;_<U.length;_++)te[_]=U.charCodeAt(_);const G=new Blob([te],{type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),w=new File([G],c.name+".docx",{type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});await wm(w,e,n)},f.appendChild(D)}const P=document.createElement("button");P.innerHTML="✕",P.style.cssText="font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;",P.onclick=D=>{if(D.stopPropagation(),confirm(`Xoá biểu mẫu "${c.name}"?`)){const V=js();V.splice(u,1),$s(V),Yn(n,e,t===c.name?null:t)}},f.appendChild(P),l.appendChild(f)}),n.appendChild(l),tR(n,o,e,t)}function oR(n,e,t,i){const s=js(),r=s.find(o=>o.url===n.url&&o.name===n.name||o.data===n.data&&o.name===n.name);if(r&&(r.lastUsed=Date.now(),$s(s)),n.type==="local_base64"&&n.data){try{const o=Tm(n.data);e&&e(o,n.name),Yn(i,e,n.name)}catch(o){fe(`❌ Lỗi nạp Base64: ${o.message}`,"#dc3545")}return}iR(n.url).then(o=>{e&&e(o,n.name),Yn(i,e,n.name)}).catch(o=>{fe(`❌ ${o.message}`,"#dc3545")})}function aR(){const n=document.createElement("div");n.id="vnpt-docx-widget";const e=localStorage.getItem(pa)==="true";n.innerHTML=`
        <button id="vnpt-toggle-btn" title="Mở/Đóng UI Hợp đồng" class="${e?"btn-opened":"btn-closed"}">${e?"✖":"📄"}</button>

        <div id="vnpt-export-panel" style="display: ${e?"flex":"none"};">
            <div id="vnpt-panel-header" title="Kẹp chuột vào đây để di chuyển">
                <span id="vnpt-panel-title">Nhập|Xuất H.Đồng</span>
                <div class="btn-row" style="margin-bottom: 0; padding-right: 35px; gap: 4px;">
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-scan" title="Lấy data theo biểu mẫu web">Quét</button>
                    <button class="vnpt-btn-action btn-fill-back" id="vnpt-btn-fill-back" title="Điền dữ liệu ngược lên web">Điền</button>
                    <button class="vnpt-btn-action btn-toggle-id" id="vnpt-btn-toggle-id" title="Ẩn/Hiện Mã ID">ID</button>
                    <button class="vnpt-btn-action btn-add" id="vnpt-btn-add" title="Chèn thêm trường trống">➕</button>
                    <button class="vnpt-btn-action btn-clean" id="vnpt-btn-batch-del" title="Xóa chọn / Xóa tất cả">🗑️</button>
                </div>
            </div>

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
    `,document.body.appendChild(n),L.widget=n,L.panel=document.getElementById("vnpt-export-panel"),L.toggleBtn=document.getElementById("vnpt-toggle-btn"),L.header=document.getElementById("vnpt-panel-header"),L.fieldsContainer=document.getElementById("vnpt-fields-container");try{const i=JSON.parse(localStorage.getItem(vu));i&&i.width&&i.height&&(L.panel.style.width=i.width+"px",L.panel.style.height=i.height+"px")}catch(i){console.error("Lỗi load size panel:",i)}new ResizeObserver(i=>{if(L.panel.style.display!=="none")for(let s of i){const{width:r,height:o}=s.contentRect;r>0&&o>0&&localStorage.setItem(vu,JSON.stringify({width:Math.round(r+20),height:Math.round(o+20)}))}}).observe(L.panel),Yn(document.getElementById("vnpt-template-manager"),(i,s)=>{L.templateBuffer=i,L.templateName=s}),document.getElementById("vnpt-template-file").addEventListener("change",function(){const i=this.files&&this.files[0];if(!i)return;const s=document.getElementById("vnpt-template-manager");rR(i,s,(r,o)=>{L.templateBuffer=r,L.templateName=o}),this.value=""}),L.panelBody=document.getElementById("vnpt-panel-body"),L.toggleBtn.addEventListener("click",i=>{L.hasDragged||(L.panel.style.display==="none"?(L.panel.style.display="flex",L.toggleBtn.className="btn-opened",L.toggleBtn.innerHTML="✖",localStorage.setItem(pa,"true")):(L.panel.style.display="none",L.toggleBtn.className="btn-closed",L.toggleBtn.innerHTML="📄",localStorage.setItem(pa,"false")))})}function Im(n,e,t,i=null,s=null){let r=!1,o=0,l=0,c=!1;function u(p){c!==p&&(c=p,s&&s(p))}function f(p){if(p.button!==0)return;r=!0,L.hasDragged=!1;const m=n.getBoundingClientRect();o=p.clientX-m.left,l=p.clientY-m.top,document.body.style.userSelect="none",e&&e.forEach(b=>b.style.cursor="grabbing"),i&&i(),p.preventDefault()}return e.forEach(p=>{p.addEventListener("mousedown",f)}),document.addEventListener("mousemove",function(p){if(!r)return;L.hasDragged=!0;let m=p.clientX-o,b=p.clientY-l;const S=window.innerWidth,N=window.innerHeight,P=document.getElementById("vnpt-toggle-btn"),D=P?P.offsetWidth:40,V=P?P.offsetHeight:40,U=n.id==="vnpt-docx-widget";let W=n.offsetWidth||0;if(U){let w=D+6-W,_=S-W+6;m<w&&(m=w),m>_&&(m=_)}else W=W||200,m<0&&(m=0),m+W>S&&(m=Math.max(0,S-W));let te=c;if(U?te=!1:c?p.clientY<N-40&&(te=!1):p.clientY>N-10&&(te=!0),b<0&&(b=0),te)u(!0),n.style.top=N-n.offsetHeight+"px",U?(n.style.right=S-m-W+"px",n.style.left="auto"):(n.style.left=m+"px",n.style.right="auto"),n.style.bottom="auto";else{u(!1);let G=n.offsetHeight||40,w;if(U)w=10+V;else{const _=n.querySelector(".cw-title-bar");w=_?_.offsetHeight:G}b+w>N&&(b=Math.max(0,N-w)),n.style.top=b+"px",U?(n.style.right=S-m-W+"px",n.style.left="auto"):(n.style.left=m+"px",n.style.right="auto"),n.style.bottom="auto"}}),document.addEventListener("mouseup",function(){if(r&&(r=!1,document.body.style.userSelect="",e&&e.forEach(p=>p.style.cursor="grab"),t)){const p=n.id==="vnpt-docx-widget";localStorage.setItem(t,JSON.stringify({left:p?void 0:n.style.left,right:p?n.style.right:void 0,top:n.style.top,x:p?void 0:parseFloat(n.style.left),y:parseFloat(n.style.top),docked:c}))}}),{isDocked:()=>c,setDocked:u}}function lR(){L.widget&&L.header&&L.toggleBtn&&(Im(L.widget,[L.header,L.toggleBtn],yu),window.addEventListener("resize",()=>{const n=window.innerWidth,e=window.innerHeight,t=document.getElementById("vnpt-toggle-btn"),i=t?t.offsetWidth:40,s=t?t.offsetHeight:40;let r=L.widget.getBoundingClientRect(),o=r.left,l=r.top,c=L.widget.offsetWidth||0,f=i+6-c,p=n-c+6;o<f&&(o=f),o>p&&(o=p),l+10+s>e&&(l=Math.max(0,e-(10+s))),L.widget.style.right=n-o-c+"px",L.widget.style.top=l+"px"}))}function cR(n){n.dispatchEvent(new Event("input",{bubbles:!0})),n.dispatchEvent(new Event("change",{bubbles:!0}))}function Mt(n,e){var s;if(!n||n.disabled||n.readOnly)return;const t=n.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,i=(s=Object.getOwnPropertyDescriptor(t,"value"))==null?void 0:s.set;i?i.call(n,e):n.value=e,cR(n)}function Ko(n){const e=document.getElementById(n);if(e&&(e.tagName==="INPUT"||e.tagName==="TEXTAREA"))return e;for(const t of document.querySelectorAll("label"))if(t.textContent.trim()===n){if(t.htmlFor){const s=document.getElementById(t.htmlFor);if(s)return s}let i=t.parentElement;for(;i;){const s=i.querySelector("input,textarea");if(s)return s;if(i=i.parentElement,(i==null?void 0:i.tagName)==="FORM")break}}return null}function Qo(n){for(const e of document.querySelectorAll("label"))if(e.innerText.trim()===n)return e.parentElement.querySelector("input, textarea");return null}function pn(n,e){const t=Ko(n)||Qo(n);t&&Mt(t,e)}function Ui(n,e,t=null){const i=L.fieldsContainer.querySelector(".text-hint");i&&i.remove();const s=L.fieldsContainer.querySelectorAll(".f-key");let r=!1;for(let o of s)if(o.value===n){const l=o.closest(".vnpt-field-row"),c=l.querySelector(".f-val"),u=l.querySelector(".f-label");e!==""&&(c.value=e),t!==null&&t!==""&&(u.value=t),r=!0;break}if(!r){(t===null||t==="")&&(t=dr[n]||"");const o=document.createElement("div");o.className="vnpt-field-row row-item",o.setAttribute("draggable","false"),o.innerHTML=`
            <input type="checkbox" class="row-chk" title="Chọn để thao tác hàng loạt" style="margin: 0 2px 0 2px;" />
            <input type="text" class="f-label" placeholder="Nhãn..." value="${t}" />
            <input type="text" class="f-key" placeholder="Mã biến" value="${n}" />
            <span class="row-drag-handle" title="Kéo thả để di chuyển">=</span>
            <input type="text" class="f-val" placeholder="Giá trị" value="${e}" />
        `;const l=o.querySelector(".f-val");n==="tenToChuc"&&(l.style.textAlign="right"),o.querySelector(".f-key").addEventListener("keyup",function(){Et(),l.style.textAlign=this.value.trim()==="tenToChuc"?"right":""}),o.querySelector(".f-label").addEventListener("keyup",Et),l.addEventListener("keyup",Et);const c=o.querySelector(".row-drag-handle");c.addEventListener("mouseenter",()=>o.setAttribute("draggable","true")),c.addEventListener("mouseleave",()=>{o.classList.contains("dragging")||o.setAttribute("draggable","false")}),o.addEventListener("dragstart",function(u){L.draggedRowForVNPT=this,u.dataTransfer.effectAllowed="move",u.dataTransfer.setData("text/plain",n),this.classList.add("dragging")}),o.addEventListener("dragover",function(u){return u.preventDefault(),u.dataTransfer.dropEffect="move",!1}),o.addEventListener("dragenter",function(u){this.classList.add("over")}),o.addEventListener("dragleave",function(u){this.classList.remove("over")}),o.addEventListener("drop",function(u){if(u.stopPropagation(),L.draggedRowForVNPT&&L.draggedRowForVNPT!==this){const f=Array.from(L.fieldsContainer.querySelectorAll(".vnpt-field-row")),p=f.indexOf(L.draggedRowForVNPT),m=f.indexOf(this);p<m?this.parentNode.insertBefore(L.draggedRowForVNPT,this.nextSibling):this.parentNode.insertBefore(L.draggedRowForVNPT,this),Et()}return!1}),o.addEventListener("dragend",function(u){this.setAttribute("draggable","false"),L.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(p=>{p.classList.remove("over"),p.classList.remove("dragging")}),L.draggedRowForVNPT=null}),L.fieldsContainer.appendChild(o),L.fieldsContainer.scrollTop=L.fieldsContainer.scrollHeight}}async function Et(){const n={};L.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(t=>{const i=t.querySelector(".f-key").value.trim(),s=t.querySelector(".f-label").value.trim(),r=t.querySelector(".f-val").value;i&&(n[i]={label:s,value:r})}),localStorage.setItem(fa,JSON.stringify(n)),XS({fields:n})}async function uR(){try{let n=null;const e=await YS();if(e&&e.fields?(n=e.fields,localStorage.setItem(fa,JSON.stringify(n))):n=JSON.parse(localStorage.getItem(fa)),n&&Object.keys(n).length>0){L.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(t=>t.remove());for(const t in n){let i=n[t];typeof i=="object"&&i!==null?Ui(t,i.value,i.label):Ui(t,i,"")}}}catch(n){console.error("Error loading config:",n)}try{const n=JSON.parse(localStorage.getItem(yu));n&&L.widget&&(L.widget.style.bottom="auto",n.right?(L.widget.style.right=n.right,L.widget.style.left="auto"):n.left&&(L.widget.style.left=n.left,L.widget.style.right="auto"),n.top&&(L.widget.style.top=n.top))}catch{}}function hR(){document.getElementById("vnpt-btn-toggle-id").addEventListener("click",function(){L.fieldsContainer.classList.toggle("show-ids")}),document.getElementById("vnpt-btn-batch-del").addEventListener("click",function(){const n=L.fieldsContainer.querySelectorAll(".vnpt-field-row");let e=0;n.forEach(t=>{const i=t.querySelector(".row-chk");i&&i.checked&&(t.remove(),e++)}),e===0?confirm("Xóa TOÀN BỘ dữ liệu các trường?")&&(n.forEach(t=>t.remove()),fe("🗑️ Đã xóa toàn bộ","#ff5252"),Et()):(fe(`🗑️ Đã xóa ${e} trường`,"#ff5252"),Et())}),document.getElementById("vnpt-btn-add").addEventListener("click",function(){const n=L.fieldsContainer.querySelectorAll(".vnpt-field-row").length+1;Ui("bien_moi_"+n,"",""),Et()}),document.getElementById("vnpt-btn-fill-back").addEventListener("click",function(){const n=L.fieldsContainer.querySelectorAll(".vnpt-field-row");let e=0;n.forEach(t=>{const i=t.querySelector(".f-key").value.trim(),s=t.querySelector(".f-val").value;i&&(document.getElementById(i)||document.getElementsByName(i)[0])&&(pn(i,s),e++)}),e>0?fe(`✅ Đã điền ngược ${e} trường vào web`,"#198754"):fe("⚠️ Không có trường nào khớp","#ffc107")})}function dR(){document.getElementById("vnpt-btn-scan").addEventListener("click",function(){let n=0;Object.keys(dr).forEach(e=>{var s;const t=document.getElementById(e);let i="";if(t&&(i=t.tagName.toLowerCase()==="select"?((s=t.options[t.selectedIndex])==null?void 0:s.text)||"":t.value,n++),!i){const r=e.toLowerCase(),o=new Date;r==="ngayky"&&(i=String(o.getDate()).padStart(2,"0")),(r==="thangky"||r==="thangky1")&&(i=String(o.getMonth()+1).padStart(2,"0")),(r==="namky"||r==="namky1")&&(i=String(o.getFullYear())),r==="soluonggoi"&&(i="1")}Ui(e,i,null)}),Et(),n>0?(this.style.background="#34a853",this.style.color="#fff",this.innerText="Done",setTimeout(()=>{this.style.background="#fbbc04",this.style.color="#000",this.innerText="Quét"},1e3)):fe("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.")}),document.addEventListener("input",function(n){n.target&&n.target.id&&dr[n.target.id]!==void 0&&(Ui(n.target.id,n.target.value,null),Et())}),document.addEventListener("change",function(n){var e;if(n.target&&n.target.id&&dr[n.target.id]!==void 0){let t=n.target.tagName.toLowerCase()==="select"?((e=n.target.options[n.target.selectedIndex])==null?void 0:e.text)||"":n.target.value;Ui(n.target.id,t,null),Et()}})}function bm(n,e,t){try{let i;try{i=new window.PizZip(n)}catch(c){alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!'),console.error(c);return}const s=new window.docxtemplater(i,{paragraphLoop:!0,linebreaks:!0});s.render(e);const r=s.getZip().generate({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),o=URL.createObjectURL(r),l=document.createElement("a");l.href=o,l.download=t,document.body.appendChild(l),l.click(),setTimeout(()=>{document.body.removeChild(l),URL.revokeObjectURL(o)},100)}catch(i){let s=i.message;i.properties&&i.properties.errors instanceof Array?s=`Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:

`+i.properties.errors.map(o=>"- "+(o.properties.explanation||o.message)).join(`
`):s="Lỗi phần mềm Word sinh ra: "+s,alert(s),console.error("DocX Error:",i)}}function fR(){const n=document.getElementById("vnpt-export-filename");n&&n.addEventListener("input",()=>{n.dataset.userEdited="1",n.value.trim()||(n.dataset.userEdited="0")});function e(){if(!n||n.dataset.userEdited==="1")return;let t="";if(L.fieldsContainer&&L.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(c=>{const u=c.querySelector(".f-key").value.trim(),f=c.querySelector(".f-val").value.trim();u==="tenToChuc"&&(t=f)}),!t){const l=document.getElementById("tenToChuc");l&&(t=l.tagName.toLowerCase()==="textarea"||l.tagName.toLowerCase()==="input"?l.value.trim():l.innerText.trim())}function i(l){if(!l)return"";let c=l;return c=c.replace(/Tổng công ty/gi,""),c=c.replace(/Công ty/gi,""),c=c.replace(/\bCty\b/gi,""),c=c.replace(/Trách nhiệm hữu hạn/gi,""),c=c.replace(/\bTNHH\b/gi,""),c=c.replace(/Cổ phần/gi,""),c=c.replace(/\bCP\b/gi,""),c=c.replace(/Một thành viên/gi,""),c=c.replace(/\bMTV\b/gi,""),c=c.replace(/Chi nhánh/gi,""),c=c.replace(/Việt Nam/gi,"VN"),c=c.replace(/Viet Nam/gi,"VN"),c=c.replace(/\s+/g," ").trim(),c=c.replace(/^[-,\s]+|[-,\s]+$/g,""),c.length>50&&(c=c.substring(0,47)+"..."),c.replace(/[<>:"/\\|?*]/g,"")}let s=i(t),r=L.templateName?L.templateName.replace(/\.docx$/i,""):"",o=[];s&&o.push(s),r&&o.push(r),o.length>0?n.value=o.join(" - ")+".docx":n.value||(n.value="HopDong_Auto.docx")}setInterval(e,1e3),document.getElementById("vnpt-btn-export").addEventListener("click",function(){const t={};if(L.fieldsContainer.querySelectorAll(".vnpt-field-row").forEach(o=>{const l=o.querySelector(".f-key").value.trim(),c=o.querySelector(".f-val").value;l&&(t[l]=c)}),Object.keys(t).length===0){alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.");return}let s=document.getElementById("vnpt-export-filename").value.trim()||"HopDong_Auto.docx";if(s.toLowerCase().endsWith(".docx")||(s+=".docx"),L.templateBuffer){bm(L.templateBuffer,t,s);return}const r=document.getElementById("vnpt-template-file");if(r.files&&r.files.length>0){const o=new FileReader;o.onload=l=>bm(l.target.result,t,s),o.readAsArrayBuffer(r.files[0]);return}alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.')})}function pR(){function n(){const i=document.getElementById("chucVu");i&&!i.dataset.filled&&(i.dataset.filled="1",Mt(i,"Giám Đốc"));const s=document.getElementById("noiCap");s&&!s.dataset.filled&&(s.dataset.filled="1",Mt(s,"Cục trưởng Cục Cảnh sát QLHC về TTXH"));const r=document.getElementById("noiCapSoDkdn");r&&!r.dataset.filled&&(r.dataset.filled="1",Mt(r,""));const o=document.getElementById("duong"),l=document.getElementById("diaChiTruSoDuong");o&&l&&!o.dataset.bound&&(o.dataset.bound="1",o.addEventListener("input",()=>Mt(l,o.value)));const c=document.getElementById("sdt"),u=document.getElementById("sdtToChuc");c&&u&&!c.dataset.bound&&(c.dataset.bound="1",c.addEventListener("input",()=>Mt(u,c.value)));const f=document.getElementById("emailDaiDien"),p=document.getElementById("emailCongTy");f&&p&&!f.dataset.bound&&(f.dataset.bound="1",f.addEventListener("input",()=>Mt(p,f.value)));const m=document.getElementById("soDkdn"),b=document.getElementById("maSoThue");m&&b&&!m.dataset.bound&&(m.dataset.bound="1",m.addEventListener("input",()=>Mt(b,m.value)))}let e;new MutationObserver(()=>{clearTimeout(e),e=setTimeout(n,200)}).observe(document.body,{childList:!0,subtree:!0}),n()}function ze(n){return n.toLocaleString("en-US")}function gn(n){return Number(String(n).replace(/[^\d]/g,""))||0}function Cm(n){return n.charAt(0).toUpperCase()+n.slice(1)}const Gs=["","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];function gR(n){let e=Math.floor(n/100),t=Math.floor(n%100/10),i=n%10,s="";return e>0&&(s+=Gs[e]+" trăm ",t===0&&i>0&&(s+="lẻ ")),t>1?(s+=Gs[t]+" mươi ",i===1?s+="mốt":i===5?s+="lăm":i>0&&(s+=Gs[i])):t===1?(s+="mười ",i===5?s+="lăm":i>0&&(s+=Gs[i])):i>0&&(e>0&&(s+="lẻ "),s+=Gs[i]),s.trim()}function Am(n){if(n===0)return"không";const e=["","nghìn","triệu","tỷ"];let t="",i=0;for(;n>0;){const s=n%1e3;s>0&&(t=gR(s)+" "+e[i]+" "+t),n=Math.floor(n/1e3),i++}return t.trim()}function mn(n,e=null){try{const t=localStorage.getItem(n);return t!==null?JSON.parse(t):e}catch{return e}}function Xe(n,e){localStorage.setItem(n,JSON.stringify(e))}const qc=new Date,Hc=String(qc.getDate()).padStart(2,"0"),Yo=String(qc.getMonth()+1).padStart(2,"0"),Xo=String(qc.getFullYear()),zc={ngayKy:Hc,thangKy:Yo,namKy:Xo,ngayTiepNhan:`${Hc}/${Yo}/${Xo}`,ngayThangNamKy:`${Hc}/${Yo}/${Xo}`,thangKy1:Yo,namKy1:Xo,tenDoanhNghiepB:"VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM",diaChiB:"75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội",maSoThueB:"0100686223",stkB:"1600114156",diaChiStkB:"Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)",tenB:"Phạm Khánh Chung",nguoiDaiDienB:"Phạm Khánh Chung",chucVuB:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",chucVuDaiDienB:"Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",giayUyQuyenSoB:"2628/GUQ-VNPT-HNI-VP",soGiayUyQuyenB:"2628/GUQ-VNPT-HNI-VP",giayUyQuyenNgayB:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",ngayGiayUyQuyenB:"1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",GiayUyQuyenB:"2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",tenDoanhNghiepB1:"Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",donViTiepNhan:"TTKD KHDN",tenTiepNhan:"Bùi Anh",tenNguoiNhan:"Bùi Anh",dienThoaiB:"02436686868",diaChiTaiKhoanB:"NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 ",noiKy:"Hà Nội",emailB:"",lienheHopDongB:"AM Bùi Anh",lienheTuVanB:"AM Bùi Anh",lienheHoaDonB:"AM Bùi Anh",sucoCap1B:"AM Bùi Anh",sucoCap2B:"AM Bùi Anh",sucoCap3B:"AM Bùi Anh",sucoCap4B:"AM Bùi Anh"},Sm=["lienheHopDongA","lienheHoaDonA","lienheTuVanA","sucoCap1A","sucoCap2A","sucoCap3A","sucoCap4A"];let _n=mn(Wi)??{...zc},Xn=mn(An)??{},Ks=mn(Ut)??{},de=mn(ji)??"custom";function mR(){_n=mn(Wi)??{...zc},Xn=mn(An)??{};const n={..._n,...Xn};let e="";for(let t of Sm){const i=Ko(t)||Qo(t);if(i&&i.value){e=i.value;break}}e&&Sm.forEach(t=>pn(t,e)),Object.keys(n).forEach(t=>{let i=Ko(t)||Qo(t);i&&Mt(i,n[t])}),fe("✅ Auto fill complete")}function _R(){let n=mn(Ut)??{};const e=Object.keys(n);if(e.length===0){fe("⚠️ No sync mapping","#ffc107");return}e.forEach(t=>{let i=Ko(t)||Qo(t);i&&i.value!==void 0&&i.value!==""&&n[t].split(",").map(r=>r.trim()).filter(r=>r).forEach(r=>pn(r,i.value))}),fe("✅ Sync form complete","#d39e00")}function yR(n,e,t,i){const s=document.createElement("div");s.className="cw-tab-header";const r=document.createElement("div");r.innerText="📋 Custom",r.className="cw-tab cw-tab-custom";const o=document.createElement("div");o.innerText="🔗 Sync",o.className="cw-tab cw-tab-sync";const l=document.createElement("div");l.innerText="📌 Default",l.className="cw-tab cw-tab-default";function c(){r.classList.remove("active"),l.classList.remove("active"),o.classList.remove("active"),de==="custom"?r.classList.add("active"):de==="default"?l.classList.add("active"):o.classList.add("active")}c(),s.appendChild(r),s.appendChild(l),s.appendChild(o);const u=document.createElement("div");u.style.display=i.data?"none":"block";const f=e("📋 Cấu hình Data","data",D=>{u.style.display=D?"none":"block",t(n)}),p=document.createElement("button");p.innerText="📥",p.title="Import JSON";const m=document.createElement("button");m.innerText="📤",m.title="Export JSON",[p,m].forEach(D=>D.className="cw-icon-btn");const b=f.querySelector(".wg-toggle-btn"),S=document.createElement("div");S.className="cw-right-wrap",S.appendChild(p),S.appendChild(m),S.appendChild(b),f.appendChild(S);const N=document.createElement("div");N.className="cw-data-body",u.appendChild(s),u.appendChild(N),n.appendChild(f),n.appendChild(u);function P(){N.innerHTML="";let D=de==="sync"?Ks:de==="custom"?Xn:_n;const V=Object.keys(D);if(V.length===0&&(de==="custom"||de==="sync")){N.innerHTML='<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>';return}V.forEach(W=>{const te=document.createElement("div");te.className="cw-data-row";let G=de==="custom"||de==="sync";const w=document.createElement("input");w.type="text",w.value=W,w.title=W,w.className="cw-data-key"+(G?" mutable":""),w.readOnly=!G,G&&(w.onchange=()=>{const E=w.value.trim();if(!E||E===W){w.value=W;return}if(D.hasOwnProperty(E)){alert(`Nhãn "${E}" đã tồn tại!`),w.value=W;return}D[E]=D[W],delete D[W],Xe(de==="sync"?Ut:An,D),P()});const _=document.createElement("input");if(_.type="text",_.value=D[W]??"",_.className="cw-data-val",_.oninput=()=>{D[W]=_.value,Xe(de==="sync"?Ut:de==="custom"?An:Wi,D)},de==="sync"&&(_.placeholder="Các nhãn đích..."),te.appendChild(w),te.appendChild(_),de==="custom"||de==="sync"){const E=document.createElement("button");E.innerHTML="✕",E.className="cw-del-btn",E.onclick=()=>{confirm(`Delete "${W}"?`)&&(delete D[W],de==="custom"&&Xe(An,D),de==="sync"&&Xe(Ut,D),P())},te.appendChild(E)}else{const E=document.createElement("div");E.className="cw-pad",te.appendChild(E)}N.appendChild(te)});const U=document.createElement("div");U.className="cw-data-hint",U.innerText=`${V.length} fields · auto-saved`,N.appendChild(U)}P(),r.onclick=()=>{de="custom",Xe(ji,"custom"),c(),P()},l.onclick=()=>{de="default",Xe(ji,"default"),c(),P()},o.onclick=()=>{de="sync",Xe(ji,"sync"),c(),P()},m.onclick=()=>{const D={defaultData:_n,customData:Xn,syncData:Ks},V=new Blob([JSON.stringify(D,null,2)],{type:"application/json"}),U=URL.createObjectURL(V),W=document.createElement("a");W.href=U,W.download=`vnpt_data_${Date.now()}.json`,W.click(),URL.revokeObjectURL(U)},p.onclick=()=>{const D=document.createElement("input");D.type="file",D.accept=".json",D.onchange=V=>{const U=V.target.files[0];if(!U)return;const W=new FileReader;W.onload=te=>{try{const G=JSON.parse(te.target.result);G.defaultData&&(_n=G.defaultData,Xe(Wi,_n)),G.customData&&(Xn=G.customData,Xe(An,Xn)),G.syncData&&(Ks=G.syncData,Xe(Ut,Ks)),P(),fe("✅ Import successful!")}catch{alert("Invalid JSON file format!")}},W.readAsText(U)},D.click()},n.querySelector("#vnpt-cw-fill").onclick=mR,n.querySelector("#vnpt-cw-sync").onclick=_R,n.querySelector("#vnpt-cw-add").onclick=()=>{de==="default"&&(de="custom",Xe(ji,"custom"),c());let D=de==="sync"?Ks:Xn,V=1,U="new_field";for(;D.hasOwnProperty(U);)U="new_field_"+V,V++;D[U]="",Xe(de==="sync"?Ut:An,D),i.data&&(i.data=!1,Xe(ga,i),u.style.display="block",f.querySelector(".wg-toggle-btn").innerText="▴"),P(),N.scrollTop=N.scrollHeight},n.querySelector("#vnpt-cw-reset").onclick=()=>{confirm("Reset [Default Data] to hardcoded values?")&&(_n={...zc},Xe(Wi,_n),de==="default"&&P(),fe("Reset complete","#17a2b8"))}}let Wc=!1;document.addEventListener("input",n=>{var l,c,u;if(Wc||!n.target||!["INPUT","TEXTAREA"].includes(n.target.tagName))return;let e=mn(Ut)??{};if(Object.keys(e).length===0)return;let t=n.target.id,i=n.target.name,s=null,r=null;if(t){const f=document.querySelector(`label[for="${t}"]`);f&&(s=f.textContent.trim(),r=(l=f.innerText)==null?void 0:l.trim())}if(!s){const f=n.target.closest("label");f&&(s=(c=Array.from(f.childNodes).find(p=>p.nodeType===3))==null?void 0:c.textContent.trim(),r=(u=f.innerText)==null?void 0:u.trim())}let o=e[t]||e[i]||e[s]||e[r];if(o){Wc=!0;try{const f=n.target.value;o.split(",").map(m=>m.trim()).filter(m=>m).forEach(m=>{m!==t&&m!==i&&m!==s&&m!==r&&pn(m,f)})}finally{Wc=!1}}});function Qs(n,e=null){try{const t=localStorage.getItem(n);return t!==null?JSON.parse(t):e}catch{return e}}function jc(n,e){localStorage.setItem(n,JSON.stringify(e))}let Jn=Number(localStorage.getItem(wu))||.08,yn=Qs(ga)??{calc:!1,data:!0};function Bi(n,e){if(!e||e.replace(/\D/g,"").length<6)return;let t=Qs(n,[]);t=t.filter(i=>i!==e),t.unshift(e),jc(n,t.slice(0,10))}function vn(n,e){const t=document.getElementById(e);t&&(t.innerHTML=Qs(n,[]).map(i=>`<option value="${i}">`).join(""))}function $c(n){const e=window.innerWidth,t=window.innerHeight,i=n.getBoundingClientRect();n.style.left=Math.min(Math.max(parseFloat(n.style.left),0),e-i.width)+"px",n.style.top=Math.min(Math.max(parseFloat(n.style.top),0),t-36)+"px"}function vR(n,e,t){const i=document.createElement("div");i.className="wg-sec-header";const s=document.createElement("span");s.innerText=n;const r=document.createElement("button");return r.className="wg-toggle-btn",r.innerText=yn[e]?"▾":"▴",i.appendChild(s),i.appendChild(r),r.onclick=()=>{yn[e]=!yn[e],r.innerText=yn[e]?"▾":"▴",jc(ga,yn),t(yn[e])},i}function ER(){const n=document.createElement("div");n.id="vnpt-calc-widget";const e=Qs(Eu),t=!!(e&&e.docked);Object.assign(n.style,{top:e&&e.y?e.y+"px":"16px",left:e&&e.x?e.x+"px":window.innerWidth-236+"px"});function i(v,T){const y=document.createElement("button");return y.innerText=v,y.className="cw-action-btn "+T,y}const s=i("Fill","cw-btn-fill");s.id="vnpt-cw-fill";const r=i("Sync","cw-btn-sync");r.id="vnpt-cw-sync",r.title="Manual trigger for Sync Mapping";const o=i("Add","cw-btn-add");o.id="vnpt-cw-add";const l=i("↺","cw-btn-reset");l.id="vnpt-cw-reset",l.title="Reset Default fields back to original";const c=document.createElement("div");c.className="cw-btn-group",c.appendChild(s),c.appendChild(r),c.appendChild(o),c.appendChild(l);const u=document.createElement("div");u.className="cw-title-bar";const f=document.createElement("span");f.className="cw-title-label",f.innerHTML="VNPT Fast",u.appendChild(f),u.appendChild(c),n.appendChild(u),yn.calc=!1;const p=document.createElement("div");p.className="cw-body",p.innerHTML=`
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
    `,n.appendChild(p),document.body.appendChild(n),L.calcWidget=n,yR(n,vR,$c,yn);const m=Array.from(n.children).filter(v=>v!==u);function b(v){m.forEach(T=>{T.style.display=v?"none":""}),u.style.borderRadius=v?"8px":"0",n.style.borderRadius=v?"8px":"10px",n.style.boxShadow=v?"0 -3px 16px rgba(25,135,84,0.55)":"0 4px 24px rgba(0,0,0,.3)",v&&(n.style.top=window.innerHeight-(u.offsetHeight||34)+"px")}const S=Im(n,[u],Eu,null,v=>{b(v)});t&&S.setDocked(!0),window.addEventListener("resize",()=>{S.isDocked()?n.style.top=window.innerHeight-u.offsetHeight+"px":$c(n)});const N=document.getElementById("wg-taxRate"),P=document.getElementById("wg-before"),D=document.getElementById("wg-tax"),V=document.getElementById("wg-after"),U=document.getElementById("wg-text"),W=document.getElementById("wg-calc-map-btn"),te=document.getElementById("wg-calc-map-wrap");let G=Qs(Tu)??{};W.onclick=()=>{const v=te.style.display==="flex";te.style.display=v?"none":"flex",W.innerText=v?'+ Cấu hình "Gán" tự điền':'- Ẩn cấu hình "Gán" tự điền',$c(n)},n.querySelectorAll("input[data-clink]").forEach(v=>{const T=v.dataset.clink;v.value=(G[T]||[]).join(", "),v.addEventListener("input",()=>{G[T]=v.value.split(",").map(y=>y.trim()).filter(y=>y),jc(Tu,G)})}),N.value=Jn*100,vn(Sn,"wg-before-list"),vn(Rn,"wg-after-list");function w(v,T,y){const Ve=Cm(Am(y))+" đồng";U.value=Ve,(G.before||[]).forEach(We=>pn(We,ze(v))),(G.tax||[]).forEach(We=>pn(We,ze(T))),(G.after||[]).forEach(We=>pn(We,ze(y))),(G.text||[]).forEach(We=>pn(We,Ve))}function _(){const v=gn(P.value),T=Math.round(v*Jn),y=v+T;D.value=ze(T),V.value=ze(y),w(v,T,y)}function E(){const v=gn(D.value),T=Math.round(v/Jn),y=T+v;P.value=ze(T),V.value=ze(y),w(T,v,y)}function I(){const v=gn(V.value),T=Math.round(v/(1+Jn)),y=v-T;P.value=ze(T),D.value=ze(y),w(T,y,v)}N.addEventListener("input",()=>{Jn=Number(N.value)/100||0,localStorage.setItem(wu,Jn),_()}),P.addEventListener("input",()=>{const v=gn(P.value),T=Math.round(v*Jn),y=v+T;D.value=ze(T),V.value=ze(y),U.value=Cm(Am(y))+" đồng"}),P.addEventListener("blur",()=>{P.value=ze(gn(P.value)),Bi(Sn,P.value),vn(Sn,"wg-before-list")}),P.addEventListener("change",()=>{P.value=ze(gn(P.value)),Bi(Sn,P.value),vn(Sn,"wg-before-list"),_()}),D.addEventListener("input",E),V.addEventListener("input",I),V.addEventListener("blur",()=>{V.value=ze(gn(V.value)),Bi(Rn,V.value),vn(Rn,"wg-after-list")}),V.addEventListener("change",()=>{V.value=ze(gn(V.value)),Bi(Rn,V.value),vn(Rn,"wg-after-list"),I()}),p.querySelectorAll("button[data-wgcopy]").forEach(v=>{v.addEventListener("click",()=>{var y;const T=((y=document.getElementById(v.dataset.wgcopy))==null?void 0:y.value)??"";navigator.clipboard.writeText(T),v.dataset.wgcopy==="wg-before"&&(Bi(Sn,T),vn(Sn,"wg-before-list")),v.dataset.wgcopy==="wg-after"&&(Bi(Rn,T),vn(Rn,"wg-after-list")),v.textContent="✓",setTimeout(()=>v.textContent="Copy",1e3)})})}function Rm(){xe.info("Initializing VNPT Userscript...");try{QS(),k_(),aR(),lR(),hR(),uR(),dR(),fR(),pR(),ER(),xe.info("Userscript initialized successfully.")}catch(n){xe.error("Error during userscript initialization:",n)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Rm):Rm()})();
