/**
 * @file autoFillForm.js
 * @desc Tự động điền và đồng bộ các trường cố định ngay khi trang load hoặc AJAX render form.
 *       Sử dụng MutationObserver để detect form mới, sau đó điền: chức vụ, nơi cấp CCCD,
 *       đồng bộ địa chỉ, SĐT, email, MST theo cặp field tương ứng.
 * @exports setupAutoFillForm  — khởi tạo MutationObserver + chạy fill lần đầu
 * @seeAlso utils/domHelper.js (syncSetValue), dataFillFeature.js (fill nâng cao)
 */
// src/features/autoFillForm.js
import { syncSetValue } from '../utils/domHelper.js';
import { getScannerFallback } from '../core/scannerFallbacks.js';

const AUTO_FILL_FIELDS = [
    'chucVu', 'noiCap', 'noiCapSoDkdn',
    'ngayky', 'ngayky1', 'thangky', 'namky',
    'thangky1', 'namky1', 'noiKy'
];

const SYNC_PAIRS = [
    { src: 'duong', target: 'diaChiTruSoDuong' },
    { src: 'sdt', target: 'sdtToChuc' },
    { src: 'emailDaiDien', target: 'emailCongTy' },
    { src: 'soDkdn', target: 'maSoThue' }
];

export function setupAutoFillForm() {
    function initAutoFillForm() {
        // ===== 1. AUTO TEXT TỪ SCANNER FALLBACKS =====
        AUTO_FILL_FIELDS.forEach(id => {
            const el = document.getElementById(id);
            if (el && !el.dataset.filled) {
                el.dataset.filled = "1";
                // getScannerFallback tự xử lý in hoa/in thường do đã có .toLowerCase() bên trong
                syncSetValue(el, getScannerFallback(id));
            }
        });

        // ===== 2. ĐỒNG BỘ CÁC TRƯỜNG =====
        SYNC_PAIRS.forEach(pair => {
            const srcEl = document.getElementById(pair.src);
            const targetEl = document.getElementById(pair.target);
            if (srcEl && targetEl && !srcEl.dataset.bound) {
                srcEl.dataset.bound = "1";
                srcEl.addEventListener('input', () => syncSetValue(targetEl, srcEl.value));
            }
        });
    }

    // Khởi tạo MutationObserver để luôn auto-fill kể cả khi trang tải form bằng AJAX
    let autoFillTimeout;
    const autoFillObserver = new MutationObserver(() => {
        clearTimeout(autoFillTimeout);
        autoFillTimeout = setTimeout(initAutoFillForm, 200);
    });

    autoFillObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Chạy lần đầu
    initAutoFillForm();
}
