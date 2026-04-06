/**
 * @file syncEngine.js
 * @desc Logic đồng bộ dữ liệu ngầm và lắng nghe sự kiện input/change trên toàn trang web.
 */
import { SK_DATA_DEF, SK_DATA_CUS, SK_DATA_SYNC } from '../../core/constants.js';
import { setPageField, findPageInput, getInputByLabel, syncSetValue } from '../../utils/domHelper.js';
import { showToast } from '../../ui/toast.js';
import { DEFAULT_DATA as _DEFAULT_DATA, fieldsA } from '../../core/defaults.js';

function ld(k, def = null) { try { const s = localStorage.getItem(k); return s !== null ? JSON.parse(s) : def; } catch { return def; } }

export function doFillData() {
    const defaultData = ld(SK_DATA_DEF) ?? { ..._DEFAULT_DATA };
    const customData = ld(SK_DATA_CUS) ?? {};
    const merged = { ...defaultData, ...customData };
    
    // Fill fields A
    let valueA = "";
    for (let name of fieldsA) {
        const el = findPageInput(name) || getInputByLabel(name);
        if (el && el.value) { valueA = el.value; break; }
    }
    if (valueA) fieldsA.forEach(name => setPageField(name, valueA));

    // Fill fields B (Merged)
    Object.keys(merged).forEach(k => {
        let el = findPageInput(k) || getInputByLabel(k);
        if (el) syncSetValue(el, merged[k]);
    });
    showToast('✅ Auto fill complete');
}

export function doSyncData() {
    let syncMap = ld(SK_DATA_SYNC) ?? {};
    const keys = Object.keys(syncMap);
    if (keys.length === 0) { showToast('⚠️ No sync mapping', '#ffc107'); return; }
    keys.forEach(src => {
        let srcEl = findPageInput(src) || getInputByLabel(src);
        if (srcEl && srcEl.value !== undefined && srcEl.value !== '') {
            let targets = syncMap[src].split(',').map(s => s.trim()).filter(s => s);
            targets.forEach(t => setPageField(t, srcEl.value));
        }
    });
    showToast('✅ Sync form complete', '#d39e00');
}

// ─── Event Listener ───
let isSyncing = false;
export function initSyncEngine() {
    document.addEventListener('input', (e) => {
        if (isSyncing || !e.target || !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

        let sMap = ld(SK_DATA_SYNC) ?? {};
        if (Object.keys(sMap).length === 0) return;

        let keyId = e.target.id;
        let keyName = e.target.name;
        let keyLblStr = null;

        // Try to find label
        if (keyId) {
            const lblEl = document.querySelector(`label[for="${keyId}"]`);
            if (lblEl) keyLblStr = lblEl.textContent.trim();
        }
        if (!keyLblStr) {
            const p = e.target.closest('label');
            if (p) keyLblStr = Array.from(p.childNodes).find(n => n.nodeType === 3)?.textContent.trim();
        }

        let targets = sMap[keyId] || sMap[keyName] || sMap[keyLblStr];
        if (targets) {
            isSyncing = true;
            try {
                const val = e.target.value;
                const list = targets.split(',').map(s => s.trim()).filter(s => s);
                list.forEach(t => {
                    if (t !== keyId && t !== keyName && t !== keyLblStr) setPageField(t, val);
                });
            } finally { isSyncing = false; }
        }
    });
}
