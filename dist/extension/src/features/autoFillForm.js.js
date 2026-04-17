/**
 * @file autoFillForm.js
 * @desc Tự động điền và đồng bộ các trường cố định ngay khi trang load hoặc AJAX render form.
 *       Sử dụng MutationObserver để detect form mới, sau đó điền: chức vụ, nơi cấp CCCD,
 *       đồng bộ địa chỉ, SĐT, email, MST theo cặp field tương ứng.
 * @exports setupAutoFillForm  — khởi tạo MutationObserver + chạy fill lần đầu
 * @seeAlso utils/domHelper.js (syncSetValue), dataFillFeature.js (fill nâng cao)
 */
// src/features/autoFillForm.js
import { syncSetValue } from "/src/utils/domHelper.js.js";
import { getScannerFallback } from "/src/core/scannerFallbacks.js.js";

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
                srcEl.addEventListener('change', () => syncSetValue(targetEl, srcEl.value));
            }
        });

        // ===== 3. ĐỒNG BỘ SKDT TỪ TỈNH =====
        const provinceIds = ['tinhId', 'tinhIdNew', 'diaChiTruSoTinhIdNew'];
        provinceIds.forEach(pId => {
            const pEl = document.getElementById(pId);
            const targetNoiCap = document.getElementById('noiCapSoDkdn');
            if (pEl && targetNoiCap && !pEl.dataset.skdtBound) {
                pEl.dataset.skdtBound = "1";
                const updateSkdt = () => {
                    let val = '';
                    if (pEl.tagName.toLowerCase() === 'ng-select2' || pEl.classList.contains('select2-hidden-accessible')) {
                        // Với Select2, giá trị thực tế nằm ở span hiển thị
                        const span = pEl.parentElement.querySelector('.select2-selection__rendered');
                        val = span ? (span.getAttribute('title') || span.textContent.trim()) : pEl.value;
                    } else {
                        val = pEl.value;
                    }
                    if (val && val !== '--- Chọn ---' && !val.includes('Chọn')) {
                        // Cắt bỏ "Tỉnh " hoặc "Thành phố "
                        const cleanProvince = val.trim().replace(/^(Tỉnh|Thành phố)\s+/i, '');
                        syncSetValue(targetNoiCap, "SKDT " + cleanProvince);
                    }
                };
                pEl.addEventListener('change', updateSkdt);
                // Với Select2 cần lắng nghe cả sự kiện đặc thù của nó nếu có
                $(pEl).on('select2:select', updateSkdt);
            }
        });
    }

    // Khởi tạo MutationObserver để luôn auto-fill kể cả khi trang tải form bằng AJAX
    let autoFillTimeout;
    const autoFillObserver = new MutationObserver((mutations) => {
        let hasFormElement = false;
        for (const m of mutations) {
            if (m.addedNodes.length > 0) {
                for (const n of m.addedNodes) {
                    if (n.nodeType === 1) {
                        hasFormElement = true;
                        break;
                    }
                }
            }
            if (hasFormElement) break;
        }

        if (hasFormElement) {
            clearTimeout(autoFillTimeout);
            autoFillTimeout = setTimeout(initAutoFillForm, 500);
        }
    });

    autoFillObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Chạy lần đầu
    initAutoFillForm();
}
