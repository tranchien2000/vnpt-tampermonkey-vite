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

export function setupAutoFillForm() {
    function initAutoFillForm() {
        // ===== 1. AUTO TEXT =====
        const chucVu = document.getElementById('chucVu');
        if (chucVu && !chucVu.dataset.filled) {
            chucVu.dataset.filled = "1";
            syncSetValue(chucVu, 'Giám Đốc');
        }

        const noiCapCCCD = document.getElementById('noiCap');
        if (noiCapCCCD && !noiCapCCCD.dataset.filled) {
            noiCapCCCD.dataset.filled = "1";
            syncSetValue(noiCapCCCD, 'Cục trưởng Cục Cảnh sát QLHC về TTXH');
        }

        const noiCapDKDN = document.getElementById('noiCapSoDkdn');
        if (noiCapDKDN && !noiCapDKDN.dataset.filled) {
            noiCapDKDN.dataset.filled = "1";
            syncSetValue(noiCapDKDN, '');
        }

        // ===== 2. ĐỒNG BỘ ĐỊA CHỈ =====
        const duong = document.getElementById('duong');
        const diaChi = document.getElementById('diaChiTruSoDuong');
        if (duong && diaChi && !duong.dataset.bound) {
            duong.dataset.bound = "1";
            duong.addEventListener('input', () => syncSetValue(diaChi, duong.value));
        }

        // ===== 3. ĐỒNG BỘ SĐT =====
        const sdt = document.getElementById('sdt');
        const sdtToChuc = document.getElementById('sdtToChuc');
        if (sdt && sdtToChuc && !sdt.dataset.bound) {
            sdt.dataset.bound = "1";
            sdt.addEventListener('input', () => syncSetValue(sdtToChuc, sdt.value));
        }

        // ===== 4. ĐỒNG BỘ EMAIL =====
        const emailDD = document.getElementById('emailDaiDien');
        const emailCT = document.getElementById('emailCongTy');
        if (emailDD && emailCT && !emailDD.dataset.bound) {
            emailDD.dataset.bound = "1";
            emailDD.addEventListener('input', () => syncSetValue(emailCT, emailDD.value));
        }

        // ===== 5. ĐỒNG BỘ MST =====
        const dkdn = document.getElementById('soDkdn');
        const mst = document.getElementById('maSoThue');
        if (dkdn && mst && !dkdn.dataset.bound) {
            dkdn.dataset.bound = "1";
            dkdn.addEventListener('input', () => syncSetValue(mst, dkdn.value));
        }
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
