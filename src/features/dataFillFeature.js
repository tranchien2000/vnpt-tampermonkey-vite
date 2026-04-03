// src/features/dataFillFeature.js

import { SK_DATA_DEF, SK_DATA_CUS, SK_DATA_SYNC, SK_DATATAB, SK_COLLAPSE } from '../core/constants.js';
import { setPageField, findPageInput, getInputByLabel, syncSetValue } from '../utils/domHelper.js';
import { showToast } from '../ui/toast.js';

// Storage helpers
function ld(k, def = null) { try { const s = localStorage.getItem(k); return s !== null ? JSON.parse(s) : def; } catch { return def; } }
function sv(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

const now = new Date();
const ngay = String(now.getDate()).padStart(2, '0');
const thang = String(now.getMonth() + 1).padStart(2, '0');
const nam = String(now.getFullYear());

const DEFAULT_DATA = {
    ngayKy: ngay,
    thangKy: thang,
    namKy: nam,
    ngayTiepNhan: `${ngay}/${thang}/${nam}`,
    ngayThangNamKy: `${ngay}/${thang}/${nam}`,
    thangKy1: thang,
    namKy1: nam,
    tenDoanhNghiepB: "VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM",
    diaChiB: "75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội",
    maSoThueB: "0100686223",
    stkB: "1600114156",
    diaChiStkB: "Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)",
    tenB: "Phạm Khánh Chung",
    nguoiDaiDienB: "Phạm Khánh Chung",
    chucVuB: "Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",
    chucVuDaiDienB: "Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",
    giayUyQuyenSoB: "2628/GUQ-VNPT-HNI-VP",
    soGiayUyQuyenB: "2628/GUQ-VNPT-HNI-VP",
    giayUyQuyenNgayB: "1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",
    ngayGiayUyQuyenB: "1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",
    GiayUyQuyenB: "2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",
    tenDoanhNghiepB1: "Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",
    donViTiepNhan: "TTKD KHDN",
    tenTiepNhan: "Bùi Anh",
    tenNguoiNhan: "Bùi Anh",
    dienThoaiB: "02436686868",
    diaChiTaiKhoanB: "NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 ",
    noiKy: "Hà Nội",
    emailB: "",
    lienheHopDongB: "AM Bùi Anh",
    lienheTuVanB: "AM Bùi Anh",
    lienheHoaDonB: "AM Bùi Anh",
    sucoCap1B: "AM Bùi Anh",
    sucoCap2B: "AM Bùi Anh",
    sucoCap3B: "AM Bùi Anh",
    sucoCap4B: "AM Bùi Anh"
};

const fieldsA = [
    "lienheHopDongA",
    "lienheHoaDonA",
    "lienheTuVanA",
    "sucoCap1A",
    "sucoCap2A",
    "sucoCap3A",
    "sucoCap4A"
];

let defaultData = ld(SK_DATA_DEF) ?? { ...DEFAULT_DATA };
let customData = ld(SK_DATA_CUS) ?? {};
let syncData = ld(SK_DATA_SYNC) ?? {};
let currentDataTab = ld(SK_DATATAB) ?? 'custom';

export function doFillData() {
    defaultData = ld(SK_DATA_DEF) ?? { ...DEFAULT_DATA };
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
    Object.assign(tabHeader.style, {
        display: 'flex',
        background: '#f8f9fa',
        borderBottom: '1px solid #dee2e6'
    });

    const tabCustom = document.createElement('div'); tabCustom.innerText = '📋 Custom';
    const tabSync = document.createElement('div'); tabSync.innerText = '🔗 Sync';
    const tabDefault = document.createElement('div'); tabDefault.innerText = '📌 Default';

    function applyTabStyles() {
        [tabCustom, tabDefault, tabSync].forEach(t => {
            Object.assign(t.style, {
                flex: '1', textAlign: 'center', padding: '6px 0', fontSize: '10px',
                fontWeight: '700', cursor: 'pointer', userSelect: 'none',
                color: '#6c757d', borderBottom: '2px solid transparent'
            });
        });
        if (currentDataTab === 'custom') {
            tabCustom.style.color = '#0d6efd';
            tabCustom.style.borderBottom = '2px solid #0d6efd';
            tabCustom.style.background = '#fff';
        } else if (currentDataTab === 'default') {
            tabDefault.style.color = '#198754';
            tabDefault.style.borderBottom = '2px solid #198754';
            tabDefault.style.background = '#fff';
        } else {
            tabSync.style.color = '#ffc107';
            tabSync.style.borderBottom = '2px solid #ffc107';
            tabSync.style.background = '#fff';
        }
    }
    applyTabStyles();

    tabHeader.appendChild(tabCustom);
    tabHeader.appendChild(tabDefault);
    tabHeader.appendChild(tabSync);

    const dataWrap = document.createElement('div');
    Object.assign(dataWrap.style, { display: collapsedSections.data ? 'none' : 'block' });

    const dataHeader = mkSecHeader('📋 Cấu hình Data', 'data', (isHidden) => {
        dataWrap.style.display = isHidden ? 'none' : 'block';
        clamp(widget);
    });

    const importBtn = document.createElement('button'); importBtn.innerText = '📥'; importBtn.title = 'Import JSON';
    const exportBtn = document.createElement('button'); exportBtn.innerText = '📤'; exportBtn.title = 'Export JSON';
    [importBtn, exportBtn].forEach(b => Object.assign(b.style, {
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '13px', padding: '0 4px', lineHeight: '1'
    }));

    const dataToggleBtn = dataHeader.querySelector('.wg-toggle-btn');
    const rightWrap = document.createElement('div');
    Object.assign(rightWrap.style, { display: 'flex', alignItems: 'center', gap: '4px' });
    rightWrap.appendChild(importBtn);
    rightWrap.appendChild(exportBtn);
    rightWrap.appendChild(dataToggleBtn);
    dataHeader.appendChild(rightWrap);

    const dataBody = document.createElement('div');
    Object.assign(dataBody.style, { background: '#fff', maxHeight: '35vh', overflowY: 'auto' });

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
            dataBody.innerHTML = `<div style="padding:15px;text-align:center;color:#888;font-size:11px;">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>`;
            return;
        }

        keys.forEach(key => {
            const row = document.createElement('div');
            Object.assign(row.style, { display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderBottom: '1px solid #f0f0f0' });

            let isMutable = currentDataTab === 'custom' || currentDataTab === 'sync';

            const keyInp = document.createElement('input');
            keyInp.type = 'text'; keyInp.value = key; keyInp.title = key;
            Object.assign(keyInp.style, {
                fontSize: '10px', color: isMutable ? '#084298' : '#0d6efd', fontWeight: '600',
                width: '85px', minWidth: '85px', border: isMutable ? '1px solid #cce5ff' : 'none',
                background: isMutable ? '#f8fbff' : 'transparent', borderRadius: '3px',
                padding: '2px 4px', outline: 'none'
            });
            keyInp.readOnly = !isMutable;
            if (isMutable) {
                keyInp.onfocus = () => keyInp.style.borderColor = '#86b7fe';
                keyInp.onblur = () => keyInp.style.borderColor = '#cce5ff';
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
            Object.assign(inp.style, { flex: '1', border: '1px solid #dee2e6', borderRadius: '4px', padding: '3px 5px', fontSize: '11px', minWidth: '0', outline: 'none' });
            inp.onfocus = () => inp.style.borderColor = '#0d6efd';
            inp.onblur = () => inp.style.borderColor = '#dee2e6';

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
                Object.assign(del.style, { background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '11px', padding: '0 2px', lineHeight: '1', flexShrink: '0' });
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
                pad.style.width = '13px';
                row.appendChild(pad);
            }

            dataBody.appendChild(row);
        });

        const hint = document.createElement('div');
        hint.style.cssText = 'font-size:10px;color:#aaa;text-align:center;padding:5px 8px;';
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
        fileInp.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
                try {
                    const parsed = JSON.parse(ev.target.result);
                    if (parsed.defaultData) { defaultData = parsed.defaultData; sv(SK_DATA_DEF, defaultData); }
                    if (parsed.customData) { customData = parsed.customData; sv(SK_DATA_CUS, customData); }
                    if (parsed.syncData) { syncData = parsed.syncData; sv(SK_DATA_SYNC, syncData); }
                    renderDataFields();
                    showToast('✅ Import successful!');
                } catch (err) { alert('Invalid JSON file format!'); }
            };
            reader.readAsText(file);
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
            defaultData = { ...DEFAULT_DATA };
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
