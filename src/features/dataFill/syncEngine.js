/**
 * @file syncEngine.js
 * @desc Logic đồng bộ dữ liệu ngầm và lắng nghe sự kiện input/change trên toàn trang web.
 *       Đã tối ưu: Debounce 250ms, Focus Guard, DOM Cache.
 */
import { SK_DATA_DEF, SK_DATA_CUS, SK_DATA_SYNC } from '../../core/constants.js';
import { setPageField, findPageInput, getInputByLabel, syncSetValue, setPageFieldsSequential, buildFullDOMMap } from '../../utils/domHelper.js';
import { showToast } from '../../ui/toast.js';
import { DEFAULT_DATA as _DEFAULT_DATA, DEFAULT_SYNC_DATA } from '../../core/defaults.js';
import { Storage } from '../../utils/storage.js';
import { debounce } from '../../utils/common.js';
import { getVNPTDateStrings } from '../../utils/dateHelper.js';

// Trạng thái khóa để ngăn chặn việc lắng nghe sự kiện khi đang auto-fill hàng loạt
let isAutoFilling = false;

function loadFreshenedDefaultData() {
    // Một số UI module ghi trực tiếp vào localStorage (không qua Storage wrapper),
    // nên cần đọc "fresh" và tránh dùng reference/cached object.
    const cachedRaw = Storage.get(SK_DATA_DEF);
    let cached = cachedRaw ? JSON.parse(JSON.stringify(cachedRaw)) : null;
    let fresh = JSON.parse(JSON.stringify(_DEFAULT_DATA));

    // Đảm bảo các field ngày tháng (dynamic) luôn có mặt trong fresh data
    const { ngay, thang, nam } = getVNPTDateStrings();
    fresh["ngayKy, ngayKy1"] = { label: "Ngày ký", value: ngay, syncDir: "both" };
    fresh["thangKy, thangKy1"] = { label: "Tháng ký", value: thang, syncDir: "both" };
    fresh["namKy, namKy1"] = { label: "Năm ký", value: nam, syncDir: "both" };
    fresh["ngayTiepNhan, ngayThangNamKy"] = { label: "Ngày ký (full)", value: `${ngay}/${thang}/${nam}`, syncDir: "both" };

    if (!cached) return fresh;

    // Overlay fresh dates onto cached default data
    const dynamicKeys = ["ngayKy, ngayKy1", "thangKy, thangKy1", "namKy, namKy1", "ngayTiepNhan, ngayThangNamKy"];
    dynamicKeys.forEach(k => {
        if (cached[k] && fresh[k]) {
            cached[k].value = fresh[k].value;
        } else if (!cached[k] && fresh[k]) {
            cached[k] = fresh[k];
        }
    });
    return cached;
}

export async function doFillData() {
    // Ensure we read latest values even if other modules wrote storage directly
    Storage.clearCache();
    if (isAutoFilling) return;
    isAutoFilling = true;

    // Đảm bảo map DOM được xây dựng chính xác trước khi điền hàng loạt
    buildFullDOMMap(true);

    try {
        const defaultData = loadFreshenedDefaultData();
        const customRaw = Storage.get(SK_DATA_CUS) ?? {};
        const customData = JSON.parse(JSON.stringify(customRaw));
        const merged = { ...defaultData, ...customData };

        // Danh sách các biến NHẠY CẢM của Khách hàng (Bên A)
        // Nếu các biến này bị trống trong Custom Data, tuyệt đối không lấy Default Data của VNPT điền vào.
        const SENSITIVE_KEYS = ['tenToChuc', 'tenDaiDien', 'diaChi', 'soDkdn', 'sdt', 'email'];

        // Fill fields B (Merged)
        const keys = Object.keys(merged);
        for (const k of keys) {
            const dataItem = merged[k];
            let val = (dataItem && typeof dataItem === 'object' && dataItem.hasOwnProperty('value'))
                ? dataItem.value
                : dataItem;

            const targets = k.split(',').map(s => s.trim()).filter(s => s);
            const label = (dataItem && typeof dataItem === 'object') ? dataItem.label : null;
            
            // --- KIỂM TRA BẢO VỆ DỮ LIỆU ---
            const isSensitive = SENSITIVE_KEYS.some(sk => k.toLowerCase().includes(sk.toLowerCase()));
            if (isSensitive) {
                // Nếu trường này có trong Default Data nhưng lại trống trong Custom Data, 
                // và nó là trường nhạy cảm của khách hàng -> Bỏ qua không điền (tránh điền tên AM vào tên khách)
                const isBlank = !val || val.toString().trim() === '';
                if (isBlank) {
                    console.warn(`[Fill Guard] Bỏ qua điền trường nhạy cảm bị trống: ${k}`);
                    continue; 
                }
            }

            if (label && !targets.includes(label)) {
                targets.push(label);
            }

            await setPageFieldsSequential(targets, val);
        }
        showToast('✅ Auto fill complete');
    } finally {
        // Luôn mở khóa kể cả khi có lỗi xảy ra
        setTimeout(() => { isAutoFilling = false; }, 500);
    }
}

export function doSyncData() {
    Storage.clearCache();
    if (isAutoFilling) return;
    isAutoFilling = true;

    try {
        let userSyncMap = Storage.get(SK_DATA_SYNC) ?? {};
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
    } finally {
        setTimeout(() => { isAutoFilling = false; }, 500);
    }
}

// ─── Event Listener Logic ───
let isSyncing = false;
const targetElementCache = new Map(); // Cache cho các target elements (tăng tốc độ gõ phím)
let boundHandleEvents = null;

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
    if (boundHandleEvents) return; // Prevent duplicate listeners (hot reload)

    boundHandleEvents = (e) => {
        // Nếu trang web đang trong quá trình Auto-fill tự động, bỏ qua các sự kiện input/change
        if (isAutoFilling) return;

        const target = e.target.closest('input, textarea, select, ng-select2');
        if (!target) return;

        // Bỏ qua nếu là input từ trong chính Widget của chúng ta
        if (target.closest('#vnpt-docx-widget') || target.closest('#vnpt-inline-calc')) return;

        let val = target.value;
        if (target.tagName === 'NG-SELECT2' || target.classList.contains('select2-hidden-accessible')) {
            const span = target.parentElement ? target.parentElement.querySelector('.select2-selection__rendered') : null;
            if (span && span.getAttribute('title')) {
                val = span.getAttribute('title');
            } else if (span && span.textContent) {
                val = span.textContent.trim();
            }
        }

        // Gọi xử lý đồng bộ với debounce (250ms delay)
        debouncedSync(target, val);
    };

    document.addEventListener('input', boundHandleEvents);
    document.addEventListener('change', boundHandleEvents);
}

export function cleanupSyncEngine() {
    if (!boundHandleEvents) return;
    document.removeEventListener('input', boundHandleEvents);
    document.removeEventListener('change', boundHandleEvents);
    boundHandleEvents = null;
    targetElementCache.clear();
}
