/**
 * @file dataFillFeature.js
 * @desc Quản lý 3 tab dữ liệu (Custom / Default / Sync) trong Calc Widget.
 *       Bao gồm: render giao diện tab, CRUD dữ liệu, import/export JSON,
 *       và engine tự động đồng bộ field theo mapping khi user gõ trên trang.
 * @exports renderDataFillTabs  — render toàn bộ phần Data vào widget
 * @exports doFillData          — điền dữ liệu merged (default+custom) lên trang
 * @exports doSyncData          — trigger đồng bộ theo sync-map thủ công
 * @exports DEFAULT_DATA        — re-export từ core/defaults.js (backward compat)
 * @seeAlso core/defaults.js (data), calcWidgetFeature.js (caller), core/constants.js (keys)
 */

import { SK_DATA_DEF, SK_DATA_CUS, SK_DATA_SYNC, SK_DATATAB, SK_COLLAPSE } from '../core/constants.js';
import { setPageField, findPageInput, getInputByLabel, syncSetValue } from '../utils/domHelper.js';
import { showToast } from '../ui/toast.js';
import { storage } from '../api/storage/index.js';
import { DEFAULT_DATA as _DEFAULT_DATA, fieldsA } from '../core/defaults.js';
export { DEFAULT_DATA } from '../core/defaults.js'; // re-export cho backward compat

// Storage helpers
function ld(k, def = null) { try { const s = localStorage.getItem(k); return s !== null ? JSON.parse(s) : def; } catch { return def; } }
function sv(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

let defaultData = ld(SK_DATA_DEF) ?? { ..._DEFAULT_DATA };
let customData = ld(SK_DATA_CUS) ?? {};
let syncData = ld(SK_DATA_SYNC) ?? {};
let currentDataTab = ld(SK_DATATAB) ?? 'custom';

export function doFillData() {
    defaultData = ld(SK_DATA_DEF) ?? { ..._DEFAULT_DATA };
    customData = ld(SK_DATA_CUS) ?? {};
    const merged = { ...defaultData, ...customData };
    
    let valueA = "";
    for (let name of fieldsA) {
        const el = findPageInput(name) || getInputByLabel(name);
        if (el && el.value) {
            valueA = el.value;
            break;
        }
    }
    if (valueA) {
        fieldsA.forEach(name => setPageField(name, valueA));
    }

    Object.keys(merged).forEach(k => {
        let el = findPageInput(k) || getInputByLabel(k);
        if (el) syncSetValue(el, merged[k]);
    });

    showToast('✅ Auto fill complete');
}

export function doSyncData() {
    let syncMap = ld(SK_DATA_SYNC) ?? {};
    const keys = Object.keys(syncMap);
    if (keys.length === 0) {
        showToast('⚠️ No sync mapping', '#ffc107');
        return;
    }
    keys.forEach(src => {
        let srcEl = findPageInput(src) || getInputByLabel(src);
        if (srcEl && srcEl.value !== undefined && srcEl.value !== '') {
            let targets = syncMap[src].split(',').map(s => s.trim()).filter(s => s);
            targets.forEach(t => setPageField(t, srcEl.value));
        }
    });
    showToast('✅ Sync form complete', '#d39e00');
}

export function renderDataFillTabs(widget, mkSecHeader, clamp, collapsedSections) {
    // ══════════════ SECTION: DATA TABS ══════════════
    const tabHeader = document.createElement('div');
    tabHeader.className = 'cw-tab-header';

    const tabCustom = document.createElement('div'); tabCustom.innerText = '📋 Custom'; 
    tabCustom.className = 'cw-tab cw-tab-custom';
    const tabSync = document.createElement('div'); tabSync.innerText = '🔗 Sync';
    tabSync.className = 'cw-tab cw-tab-sync';
    const tabDefault = document.createElement('div'); tabDefault.innerText = '📌 Default';
    tabDefault.className = 'cw-tab cw-tab-default';

    function applyTabStyles() {
        tabCustom.classList.remove('active');
        tabDefault.classList.remove('active');
        tabSync.classList.remove('active');
        if (currentDataTab === 'custom') {
            tabCustom.classList.add('active');
        } else if (currentDataTab === 'default') {
            tabDefault.classList.add('active');
        } else {
            tabSync.classList.add('active');
        }
    }
    applyTabStyles();

    tabHeader.appendChild(tabCustom);
    tabHeader.appendChild(tabDefault);
    tabHeader.appendChild(tabSync);

    const dataWrap = document.createElement('div');
    dataWrap.style.display = collapsedSections.data ? 'none' : 'block';

    const dataHeader = mkSecHeader('📋 Cấu hình Data', 'data', (isHidden) => {
        dataWrap.style.display = isHidden ? 'none' : 'block';
        clamp(widget);
    });

    const importBtn = document.createElement('button'); importBtn.innerText = '📥'; importBtn.title = 'Import JSON';
    const exportBtn = document.createElement('button'); exportBtn.innerText = '📤'; exportBtn.title = 'Export JSON';
    [importBtn, exportBtn].forEach(b => b.className = 'cw-icon-btn');

    const dataToggleBtn = dataHeader.querySelector('.wg-toggle-btn');
    const rightWrap = document.createElement('div');
    rightWrap.className = 'cw-right-wrap';
    rightWrap.appendChild(importBtn);
    rightWrap.appendChild(exportBtn);
    rightWrap.appendChild(dataToggleBtn);
    dataHeader.appendChild(rightWrap);

    const dataBody = document.createElement('div');
    dataBody.className = 'cw-data-body';

    dataWrap.appendChild(tabHeader);
    dataWrap.appendChild(dataBody);

    widget.appendChild(dataHeader);
    widget.appendChild(dataWrap);

    // ─── Data fields rendering ───
    function renderDataFields() {
        dataBody.innerHTML = '';
        let activeData = currentDataTab === 'sync' ? syncData : (currentDataTab === 'custom' ? customData : defaultData);
        const keys = Object.keys(activeData);

        if (keys.length === 0 && (currentDataTab === 'custom' || currentDataTab === 'sync')) {
            dataBody.innerHTML = `<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>`;
            return;
        }

        keys.forEach(key => {
            const row = document.createElement('div');
            row.className = 'cw-data-row';

            let isMutable = currentDataTab === 'custom' || currentDataTab === 'sync';

            const keyInp = document.createElement('input');
            keyInp.type = 'text'; keyInp.value = key; keyInp.title = key;
            keyInp.className = 'cw-data-key' + (isMutable ? ' mutable' : '');
            
            keyInp.readOnly = !isMutable;
            if (isMutable) {
                keyInp.onchange = () => {
                    const newKey = keyInp.value.trim();
                    if (!newKey || newKey === key) { keyInp.value = key; return; }
                    if (activeData.hasOwnProperty(newKey)) { alert(`Nhãn "${newKey}" đã tồn tại!`); keyInp.value = key; return; }
                    activeData[newKey] = activeData[key];
                    delete activeData[key];
                    let sk = currentDataTab === 'sync' ? SK_DATA_SYNC : SK_DATA_CUS;
                    sv(sk, activeData);
                    renderDataFields();
                };
            }

            const inp = document.createElement('input');
            inp.type = 'text'; inp.value = activeData[key] ?? '';
            inp.className = 'cw-data-val';
            
            inp.oninput = () => {
                activeData[key] = inp.value;
                let sk = currentDataTab === 'sync' ? SK_DATA_SYNC : (currentDataTab === 'custom' ? SK_DATA_CUS : SK_DATA_DEF);
                sv(sk, activeData);
            };

            if (currentDataTab === 'sync') inp.placeholder = 'Các nhãn đích...';
            row.appendChild(keyInp); row.appendChild(inp);

            if (currentDataTab === 'custom' || currentDataTab === 'sync') {
                const del = document.createElement('button');
                del.innerHTML = '✕';
                del.className = 'cw-del-btn';
                del.onclick = () => {
                    if (confirm(`Delete "${key}"?`)) {
                        delete activeData[key];
                        if (currentDataTab === 'custom') sv(SK_DATA_CUS, activeData);
                        if (currentDataTab === 'sync') sv(SK_DATA_SYNC, activeData);
                        renderDataFields();
                    }
                };
                row.appendChild(del);
            } else {
                const pad = document.createElement('div');
                pad.className = 'cw-pad';
                row.appendChild(pad);
            }

            dataBody.appendChild(row);
        });

        const hint = document.createElement('div');
        hint.className = 'cw-data-hint';
        hint.innerText = `${keys.length} fields · auto-saved`;
        dataBody.appendChild(hint);
    }
    renderDataFields();

    tabCustom.onclick = () => { currentDataTab = 'custom'; sv(SK_DATATAB, 'custom'); applyTabStyles(); renderDataFields(); };
    tabDefault.onclick = () => { currentDataTab = 'default'; sv(SK_DATATAB, 'default'); applyTabStyles(); renderDataFields(); };
    tabSync.onclick = () => { currentDataTab = 'sync'; sv(SK_DATATAB, 'sync'); applyTabStyles(); renderDataFields(); };

    exportBtn.onclick = () => {
        const dataToExport = { defaultData, customData, syncData };
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vnpt_data_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    importBtn.onclick = () => {
        const fileInp = document.createElement('input');
        fileInp.type = 'file';
        fileInp.accept = '.json';
        fileInp.onchange = async e => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                const text = await storage.download('local', file, { type: 'text' });
                const parsed = JSON.parse(text);
                if (parsed.defaultData) { defaultData = parsed.defaultData; sv(SK_DATA_DEF, defaultData); }
                if (parsed.customData) { customData = parsed.customData; sv(SK_DATA_CUS, customData); }
                if (parsed.syncData) { syncData = parsed.syncData; sv(SK_DATA_SYNC, syncData); }
                renderDataFields();
                showToast('✅ Import successful!');
            } catch (err) { alert('Invalid JSON file format or error reading file!'); }
        };
        fileInp.click();
    };

    widget.querySelector('#vnpt-cw-fill').onclick = doFillData;
    widget.querySelector('#vnpt-cw-sync').onclick = doSyncData;
    widget.querySelector('#vnpt-cw-add').onclick = () => {
        if (currentDataTab === 'default') {
            currentDataTab = 'custom'; sv(SK_DATATAB, 'custom'); applyTabStyles();
        }
        let activeData = currentDataTab === 'sync' ? syncData : customData;
        let i = 1, newKey = "new_field";
        while (activeData.hasOwnProperty(newKey)) { newKey = "new_field_" + i; i++; }
        activeData[newKey] = "";
        sv(currentDataTab === 'sync' ? SK_DATA_SYNC : SK_DATA_CUS, activeData);
        if (collapsedSections.data) {
            collapsedSections.data = false;
            sv(SK_COLLAPSE, collapsedSections);
            dataWrap.style.display = 'block';
            dataHeader.querySelector('.wg-toggle-btn').innerText = '▴';
        }
        renderDataFields();
        dataBody.scrollTop = dataBody.scrollHeight;
    };
    widget.querySelector('#vnpt-cw-reset').onclick = () => {
        if (confirm('Reset [Default Data] to hardcoded values?')) {
            defaultData = { ..._DEFAULT_DATA };
            sv(SK_DATA_DEF, defaultData);
            if (currentDataTab === 'default') renderDataFields();
            showToast('Reset complete', '#17a2b8');
        }
    };
}

// ─── SYNC ENGINE ───
let isSyncing = false;
document.addEventListener('input', (e) => {
    if (isSyncing || !e.target || !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

    let sMap = ld(SK_DATA_SYNC) ?? {};
    if (Object.keys(sMap).length === 0) return;

    let keyId = e.target.id;
    let keyName = e.target.name;
    let keyLblStr = null;
    let keyLblText = null;

    if (keyId) {
        const lblEl = document.querySelector(`label[for="${keyId}"]`);
        if (lblEl) {
            keyLblStr = lblEl.textContent.trim();
            keyLblText = lblEl.innerText?.trim();
        }
    }
    if (!keyLblStr) {
        const p = e.target.closest('label');
        if (p) {
            keyLblStr = Array.from(p.childNodes).find(n => n.nodeType === 3)?.textContent.trim();
            keyLblText = p.innerText?.trim();
        }
    }

    let targets = sMap[keyId] || sMap[keyName] || sMap[keyLblStr] || sMap[keyLblText];
    if (targets) {
        isSyncing = true;
        try {
            const val = e.target.value;
            const list = targets.split(',').map(s => s.trim()).filter(s => s);
            list.forEach(t => {
                if (t !== keyId && t !== keyName && t !== keyLblStr && t !== keyLblText) setPageField(t, val);
            });
        } finally {
            isSyncing = false;
        }
    }
});
