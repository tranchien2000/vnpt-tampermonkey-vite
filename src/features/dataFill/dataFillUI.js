import { SK_DATA_DEF, SK_DATA_CUS, SK_DATA_SYNC, SK_DATATAB, SK_COLLAPSE } from '../../core/constants.js';
import { showToast } from '../../ui/toast.js';
import { storage } from '../../api/storage/index.js';
import { DEFAULT_DATA as _DEFAULT_DATA } from '../../core/defaults.js';
import { doFillData, doSyncData } from './syncEngine.js';
import { exportFullBackup, importFullBackup } from '../../utils/backupHelper.js';

function ld(k, def = null) { try { const s = localStorage.getItem(k); return s !== null ? JSON.parse(s) : def; } catch { return def; } }
function sv(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

export function renderDataFillTabs(widget, mkSecHeader, clamp, collapsedSections) {
    let currentDataTab = ld(SK_DATATAB) ?? 'custom';
    let defaultData = ld(SK_DATA_DEF) ?? { ..._DEFAULT_DATA };
    let customData = ld(SK_DATA_CUS) ?? {};
    let syncData = ld(SK_DATA_SYNC) ?? {};

    const tabHeader = document.createElement('div');
    tabHeader.className = 'cw-tab-header';

    const tabs = {
        custom: document.createElement('div'),
        default: document.createElement('div'),
        sync: document.createElement('div')
    };
    tabs.custom.innerText = '📋 Custom'; tabs.custom.className = 'cw-tab cw-tab-custom';
    tabs.default.innerText = '📌 Default'; tabs.default.className = 'cw-tab cw-tab-default';
    tabs.sync.innerText = '🔗 Sync'; tabs.sync.className = 'cw-tab cw-tab-sync';

    function applyStyles() {
        Object.values(tabs).forEach(t => t.classList.remove('active'));
        tabs[currentDataTab].classList.add('active');
    }
    applyStyles();

    const dataWrap = document.createElement('div');
    dataWrap.style.display = collapsedSections.data ? 'none' : 'block';
    const dataHeader = mkSecHeader('📋 Cấu hình Data', 'data', (isHidden) => {
        dataWrap.style.display = isHidden ? 'none' : 'block';
        clamp(widget);
    });

    const dataBody = document.createElement('div');
    dataBody.className = 'cw-data-body';

    function renderFields() {
        dataBody.innerHTML = '';
        let active = currentDataTab === 'sync' ? syncData : (currentDataTab === 'custom' ? customData : defaultData);
        let sk = currentDataTab === 'sync' ? SK_DATA_SYNC : (currentDataTab === 'custom' ? SK_DATA_CUS : SK_DATA_DEF);
        const keys = Object.keys(active);

        if (keys.length === 0 && currentDataTab !== 'default') {
            dataBody.innerHTML = `<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>`;
        }

        keys.forEach(k => {
            const row = document.createElement('div'); row.className = 'cw-data-row';
            let mut = currentDataTab !== 'default';
            const dataItem = active[k];
            const isObj = (dataItem && typeof dataItem === 'object' && dataItem.hasOwnProperty('value'));
            const val = isObj ? dataItem.value : dataItem;
            const lbl = isObj ? (dataItem.label || k) : k;

            const kInp = document.createElement('input'); 
            kInp.type = 'text'; kInp.value = lbl; 
            kInp.id = `df-key-${k}`; kInp.name = `df-key-${k}`;
            kInp.className = 'cw-data-key' + (mut ? ' mutable' : '');
            kInp.title = k; // Technical Key is shown on hover
            kInp.readOnly = !mut;

            if (mut) {
                kInp.onchange = () => {
                    const nk = kInp.value.trim(); if (!nk || nk === k) { kInp.value = lbl; return; }
                    // Update key while preserving value (and label if it was an object)
                    if (isObj) {
                        active[nk] = { ...dataItem, label: nk };
                    } else {
                        active[nk] = val;
                    }
                    delete active[k]; 
                    sv(sk, active); renderFields();
                };
            }

            const vInp = document.createElement('input'); 
            vInp.type = 'text'; vInp.value = val ?? ''; 
            vInp.id = `df-val-${k}`; vInp.name = `df-val-${k}`;
            vInp.className = 'cw-data-val';
            vInp.oninput = () => { 
                if (isObj) {
                    active[k] = { ...dataItem, value: vInp.value };
                } else {
                    active[k] = vInp.value;
                }
                sv(sk, active); 
            };

            row.appendChild(kInp); row.appendChild(vInp);
            if (mut) {
                const del = document.createElement('button'); del.innerHTML = '✕'; del.className = 'cw-del-btn';
                del.onclick = () => { if (confirm(`Delete "${lbl}"?`)) { delete active[k]; sv(sk, active); renderFields(); } };
                row.appendChild(del);
            } else row.appendChild(document.createElement('div')).className = 'cw-pad';
            dataBody.appendChild(row);
        });
    }

    tabs.custom.onclick = () => { currentDataTab = 'custom'; sv(SK_DATATAB, 'custom'); applyStyles(); renderFields(); };
    tabs.default.onclick = () => { currentDataTab = 'default'; sv(SK_DATATAB, 'default'); applyStyles(); renderFields(); };
    tabs.sync.onclick = () => { currentDataTab = 'sync'; sv(SK_DATATAB, 'sync'); applyStyles(); renderFields(); };

    /* JSON Import/Export logic - Đã xóa */
    /*
    const expBtn = document.createElement('button'); expBtn.innerText = '📤'; expBtn.className = 'cw-icon-btn';
    expBtn.title = "Sao lưu toàn bộ dữ liệu ra JSON";
    expBtn.onclick = () => exportFullBackup();

    const impBtn = document.createElement('button'); impBtn.innerText = '📥'; impBtn.className = 'cw-icon-btn';
    impBtn.title = "Khôi phục dữ liệu từ JSON";
    const fileInp = document.createElement('input'); fileInp.type = 'file'; fileInp.accept = '.json'; fileInp.style.display = 'none';
    fileInp.onchange = async (e) => {
        if (e.target.files.length > 0) {
            const success = await importFullBackup(e.target.files[0]);
            if (success) {
                setTimeout(() => location.reload(), 1500);
            }
        }
    };
    impBtn.onclick = () => fileInp.click();
    */

    dataWrap.appendChild(tabHeader); tabHeader.appendChild(tabs.custom); tabHeader.appendChild(tabs.default); tabHeader.appendChild(tabs.sync);
    dataWrap.appendChild(dataBody); widget.appendChild(dataHeader); widget.appendChild(dataWrap);
    
    // Action overrides (Fill/Sync buttons are in title bar)
    const fillB = widget.querySelector('#vnpt-cw-fill'), syncB = widget.querySelector('#vnpt-cw-sync'), addB = widget.querySelector('#vnpt-cw-add'), resB = widget.querySelector('#vnpt-cw-reset');
    if (fillB) fillB.onclick = doFillData;
    if (syncB) syncB.onclick = doSyncData;
    if (addB) addB.onclick = () => {
        if (currentDataTab === 'default') { currentDataTab = 'custom'; sv(SK_DATATAB, 'custom'); applyStyles(); }
        let active = currentDataTab === 'sync' ? syncData : customData;
        let nk = "new_field_" + Date.now(); active[nk] = "";
        sv(currentDataTab === 'sync' ? SK_DATA_SYNC : SK_DATA_CUS, active);
        renderFields(); dataBody.scrollTop = dataBody.scrollHeight;
    };
    if (resB) resB.onclick = () => {
        if (confirm('Reset Default Data?')) { defaultData = {..._DEFAULT_DATA}; sv(SK_DATA_DEF, defaultData); renderFields(); }
    };
    
    renderFields();
    /*
    const right = dataHeader.querySelector('.cw-right-wrap') || document.createElement('div');
    right.className = 'cw-right-wrap'; 
    right.prepend(expBtn); 
    right.prepend(impBtn); 
    right.appendChild(fileInp); // Thêm file input vào DOM
    dataHeader.appendChild(right);
    */
}
