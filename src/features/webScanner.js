/**
 * @file webScanner.js
 * @desc Quét các trường (fields) trên trang web và đồng bộ vào bảng fields của widget.
 *       Bao gồm: nút "Quét" lấy values từ DOM theo DEFAULT_LABELS keys,
 *       và listener input/change để tự động cập nhật khi user gõ trực tiếp trên web.
 * @exports initWebScanner  — gán click/input/change listeners cho nút Quét
 * @seeAlso core/constants.js (DEFAULT_LABELS), fieldsManager.js (addOrUpdateFieldRow)
 */
// src/features/webScanner.js
import { DEFAULT_LABELS } from '../core/constants.js';
import { showToast } from '../ui/toast.js';
import { addOrUpdateFieldRow, saveFieldsToLocal } from './fieldsManager.js';
import { getScannerFallback } from '../core/scannerFallbacks.js';

export function initWebScanner() {
    document.getElementById('vnpt-btn-scan').addEventListener('click', function () {
        let foundCount = 0;

        Object.keys(DEFAULT_LABELS).forEach(id_can_tim => {
            const el = document.getElementById(id_can_tim);
            let val = '';
            if (el) {
                val = el.tagName.toLowerCase() === 'select' ? (el.options[el.selectedIndex]?.text || '') : el.value;
                foundCount++; // found an element
            }

            if (!val) {
                val = getScannerFallback(id_can_tim);
            }

            addOrUpdateFieldRow(id_can_tim, val, null);
        });

        saveFieldsToLocal(); // Quét xong thì lưu vào bộ nhớ mây

        if (foundCount > 0) {
            this.style.background = '#34a853'; this.style.color = '#fff';
            this.innerText = 'Done';
            setTimeout(() => { this.style.background = '#fbbc04'; this.style.color = '#000'; this.innerText = 'Quét'; }, 1000);
        } else {
            showToast("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.");
        }
    });

    // Bắt sự kiện 'input' (khi gõ text) và 'change' (khi chọn danh sách/ngày tháng) cực kỳ nhẹ, không tốn tài nguyên
    document.addEventListener('input', function (e) {
        // Bỏ qua nếu sự kiện phát ra từ trong chính Widget của chúng ta
        if (e.target.closest('#vnpt-docx-widget') || e.target.closest('#vnpt-inline-calc')) return;

        if (e.target && e.target.id && DEFAULT_LABELS[e.target.id] !== undefined) {
            addOrUpdateFieldRow(e.target.id, e.target.value, null);
            saveFieldsToLocal();
        }
    });

    document.addEventListener('change', function (e) {
        // Bỏ qua nếu sự kiện phát ra từ trong chính Widget của chúng ta
        if (e.target.closest('#vnpt-docx-widget') || e.target.closest('#vnpt-inline-calc')) return;

        if (e.target && e.target.id && DEFAULT_LABELS[e.target.id] !== undefined) {
            let val = e.target.tagName.toLowerCase() === 'select' ? (e.target.options[e.target.selectedIndex]?.text || '') : e.target.value;
            addOrUpdateFieldRow(e.target.id, val, null);
            saveFieldsToLocal();
        }
    });
}
