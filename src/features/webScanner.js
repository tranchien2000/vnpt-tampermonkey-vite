// src/features/webScanner.js
import { DEFAULT_LABELS } from '../core/constants.js';
import { addOrUpdateFieldRow, saveFieldsToLocal } from './fieldsManager.js';

export function initWebScanner() {
    document.getElementById('vnpt-btn-scan').addEventListener('click', function () {
        let foundCount = 0;

        Object.keys(DEFAULT_LABELS).forEach(id_can_tim => {
            const el = document.getElementById(id_can_tim);
            if (el) {
                let val = el.tagName.toLowerCase() === 'select' ? (el.options[el.selectedIndex]?.text || '') : el.value;
                addOrUpdateFieldRow(id_can_tim, val, null);
                foundCount++;
            } else {
                addOrUpdateFieldRow(id_can_tim, '', null);
            }
        });

        saveFieldsToLocal(); // Quét xong thì lưu vào bộ nhớ mây

        if (foundCount > 0) {
            this.style.background = '#34a853'; this.style.color = '#fff';
            this.innerText = '✔️ Đã cập nhật';
            setTimeout(() => { this.style.background = '#fbbc04'; this.style.color = '#000'; this.innerText = '🔍 Quét'; }, 1000);
        } else {
            alert("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.");
        }
    });

    // Bắt sự kiện 'input' (khi gõ text) và 'change' (khi chọn danh sách/ngày tháng) cực kỳ nhẹ, không tốn tài nguyên
    document.addEventListener('input', function (e) {
        if (e.target && e.target.id && DEFAULT_LABELS[e.target.id] !== undefined) {
            addOrUpdateFieldRow(e.target.id, e.target.value, null);
            saveFieldsToLocal();
        }
    });

    document.addEventListener('change', function (e) {
        if (e.target && e.target.id && DEFAULT_LABELS[e.target.id] !== undefined) {
            let val = e.target.tagName.toLowerCase() === 'select' ? (e.target.options[e.target.selectedIndex]?.text || '') : e.target.value;
            addOrUpdateFieldRow(e.target.id, val, null);
            saveFieldsToLocal();
        }
    });
}
