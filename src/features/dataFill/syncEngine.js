/**
 * @file syncEngine.js
 * @desc Logic đồng bộ dữ liệu ngầm và lắng nghe sự kiện input/change trên toàn trang web.
 *       Đã tối ưu: Debounce 250ms, Focus Guard, DOM Cache.
 */
import { SK_DATA_DEF, SK_DATA_CUS, SK_DATA_SYNC } from '../../core/constants.js';
import { setPageField, findPageInput, getInputByLabel, syncSetValue } from '../../utils/domHelper.js';
import { showToast } from '../../ui/toast.js';
import { DEFAULT_DATA as _DEFAULT_DATA, DEFAULT_SYNC_DATA } from '../../core/defaults.js';
import { Storage } from '../../utils/storage.js';
import { debounce } from '../../utils/common.js';

export function doFillData() {
    const defaultData = Storage.get(SK_DATA_DEF) ?? { ..._DEFAULT_DATA };
    const customData = Storage.get(SK_DATA_CUS) ?? {};
    const merged = { ...defaultData, ...customData };

    // Fill fields B (Merged)
    Object.keys(merged).forEach(k => {
        const dataItem = merged[k];
        const val = (dataItem && typeof dataItem === 'object' && dataItem.hasOwnProperty('value'))
            ? dataItem.value
            : dataItem;

        // Hỗ trợ gán nhiều field bằng dấu phẩy
        const targets = k.split(',').map(s => s.trim()).filter(s => s);
        targets.forEach(t => {
            let el = findPageInput(t) || getInputByLabel(t);
            if (el) syncSetValue(el, val);
        });
    });
    showToast('✅ Auto fill complete');
}

export function doSyncData() {
    let userSyncMap = Storage.get(SK_DATA_SYNC) ?? {};
    // Gộp mapping mặc định với mapping của người dùng
    const syncMap = { ...DEFAULT_SYNC_DATA, ...userSyncMap };

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

// ─── Event Listener Logic ───
let isSyncing = false;
const targetElementCache = new Map(); // Cache cho các target elements (tăng tốc độ gõ phím)

const processSync = (target, val) => {
    if (isSyncing) return;

    let userSyncMap = Storage.get(SK_DATA_SYNC) ?? {};
    const sMap = { ...DEFAULT_SYNC_DATA, ...userSyncMap };

    if (Object.keys(sMap).length === 0) return;

    let keyId = target.id;
    let keyName = target.name;
    let keyLblStr = null;

    // Tìm label tương ứng
    if (keyId) {
        const lblEl = document.querySelector(`label[for="${keyId}"]`);
        if (lblEl) keyLblStr = lblEl.textContent.trim();
    }
    if (!keyLblStr) {
        const p = target.closest('label');
        if (p) keyLblStr = Array.from(p.childNodes).find(n => n.nodeType === 3)?.textContent.trim();
    }

    let targets = sMap[keyId] || sMap[keyName] || sMap[keyLblStr];
    if (targets) {
        isSyncing = true;
        try {
            const list = targets.split(',').map(s => s.trim()).filter(s => s);
            list.forEach(t => {
                // Focus Guard: Chỉ cập nhật nếu field đích đang KHÔNG được focus
                if (t !== keyId && t !== keyName && t !== keyLblStr) {
                    // Kiểm tra cache trước
                    let targetEl = targetElementCache.get(t);
                    if (!targetEl || !document.contains(targetEl)) {
                        targetEl = findPageInput(t) || getInputByLabel(t);
                        if (targetEl) targetElementCache.set(t, targetEl);
                    }

                    if (targetEl && document.activeElement !== targetEl) {
                        syncSetValue(targetEl, val);
                    }
                }
            });
        } finally {
            isSyncing = false;
        }
    }
};

const debouncedSync = debounce((target, val) => {
    processSync(target, val);
}, 250);

export function initSyncEngine() {
    document.addEventListener('input', (e) => {
        const target = e.target;
        if (!target || !['INPUT', 'TEXTAREA'].includes(target.tagName)) return;

        // Bỏ qua nếu là input từ trong chính Widget của chúng ta
        if (target.closest('#vnpt-docx-widget') || target.closest('#vnpt-inline-calc')) return;

        // Gọi xử lý đồng bộ với debounce (250ms delay)
        debouncedSync(target, target.value);
    });
}
