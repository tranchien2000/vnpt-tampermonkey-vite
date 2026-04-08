/**
 * @file webScanner.js
 * @desc Quét các trường (fields) trên trang web và đồng bộ vào bảng fields của widget.
 *       Bao gồm: nút "Quét" lấy values từ DOM theo DEFAULT_LABELS keys,
 *       và listener input/change để tự động cập nhật khi user gõ trực tiếp trên web.
 * @exports initWebScanner  — gán click/input/change listeners cho nút Quét
 * @seeAlso core/constants.js (DEFAULT_LABELS), fieldsManager.js (addOrUpdateFieldRow)
 */
import { DEFAULT_LABELS } from '../core/constants.js';
import { showToast } from '../ui/toast.js';
import { addOrUpdateFieldRow, saveFieldsToLocal } from './fieldsManager.js';
import { getScannerFallback } from '../core/scannerFallbacks.js';
import { AppState } from '../core/state.js';
import { DEFAULT_DATA } from '../core/defaults.js';
import { findPageInput } from '../utils/domHelper.js';
import { capitalizeName, formatPhoneNumber, normalizeDate } from '../utils/stringHelper.js';

export function initWebScanner() {
    document.getElementById('vnpt-btn-scan').addEventListener('click', function () {
        if (AppState.isDefaultMode) {
            Object.keys(DEFAULT_DATA).forEach(key => {
                addOrUpdateFieldRow(key, DEFAULT_DATA[key], DEFAULT_LABELS[key] || '');
            });
            saveFieldsToLocal();
            showToast("Đã nạp lại dữ liệu mặc định từ hệ thống.");
            return;
        }

        let foundCount = 0;

        Object.keys(DEFAULT_LABELS).forEach(id_can_tim => {
            const labelText = DEFAULT_LABELS[id_can_tim];
            const primaryId = id_can_tim.split(',')[0].trim();
            const el = findPageInput(primaryId, labelText);
            
            let val = '';
            if (el) {
                val = el.tagName.toLowerCase() === 'select' ? (el.options[el.selectedIndex]?.text || '') : el.value;
                foundCount++; 
            }

            if (!val) {
                val = getScannerFallback(id_can_tim);
            }

            // --- Bắt đầu chuẩn hóa dữ liệu ---
            if (val && typeof val === 'string') {
                if (['tenDaiDienn', 'tenToChuc', 'noiCap', 'noiKy'].includes(primaryId)) {
                    val = capitalizeName(val);
                } else if (['sdt'].includes(primaryId)) {
                    val = formatPhoneNumber(val);
                } else if (['ngaySinhCustomer', 'ngayCapCustomer', 'ngayCapSoDkdnCustomer', 'ngayKy', 'ngayTiepNhan'].includes(primaryId)) {
                    val = normalizeDate(val);
                }
            }
            // --- Kết thúc chuẩn hóa ---

            addOrUpdateFieldRow(id_can_tim, val, null);
        });

        saveFieldsToLocal(); // Quét xong thì lưu vào bộ nhớ mây

        if (foundCount > 0) {
            this.style.background = '#1e8e3e'; this.style.color = '#fff';
            this.innerText = 'Đã quét xong';
            setTimeout(() => { 
                this.style.background = ''; this.style.color = ''; 
                this.innerText = 'Quét dữ liệu'; 
            }, 1000);
        } else {
            showToast("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.");
        }
    });

    // Bắt sự kiện 'input' (khi gõ text) và 'change' (khi chọn danh sách/ngày tháng) cực kỳ nhẹ, không tốn tài nguyên
    document.addEventListener('input', function (e) {
        // Bỏ qua nếu sự kiện phát ra từ trong chính Widget của chúng ta
        if (e.target.closest('#vnpt-docx-widget') || e.target.closest('#vnpt-inline-calc')) return;

        if (e.target && e.target.id) {
            const matchedKey = Object.keys(DEFAULT_LABELS).find(k => k.split(',').map(s=>s.trim()).includes(e.target.id));
            if (matchedKey !== undefined) {
                addOrUpdateFieldRow(matchedKey, e.target.value, null);
                saveFieldsToLocal();
            }
        }
    });

    document.addEventListener('change', function (e) {
        // Bỏ qua nếu sự kiện phát ra từ trong chính Widget của chúng ta
        if (e.target.closest('#vnpt-docx-widget') || e.target.closest('#vnpt-inline-calc')) return;

        if (e.target && e.target.id) {
            const matchedKey = Object.keys(DEFAULT_LABELS).find(k => k.split(',').map(s=>s.trim()).includes(e.target.id));
            if (matchedKey !== undefined) {
                let val = e.target.tagName.toLowerCase() === 'select' ? (e.target.options[e.target.selectedIndex]?.text || '') : e.target.value;
                addOrUpdateFieldRow(matchedKey, val, null);
                saveFieldsToLocal();
            }
        }
    });
}
