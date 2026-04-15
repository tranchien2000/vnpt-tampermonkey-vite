import { addOrUpdateFieldRow } from './row.js';
import { AppState } from '../../core/state.js';
import { debounce } from '../../utils/common.js';
import { findPageInput, getInputByLabel } from '../../utils/domHelper.js';

let boundHandleEvents = null;

const debouncedReverseSync = debounce((target, val) => {
    // Tìm key tương ứng trong AppState/Widget
    let keyId = target.id;
    let keyName = target.name || target.getAttribute('formcontrolname');
    let keyLblStr = null;

    if (keyId) {
        const lblEl = document.querySelector(`label[for="${keyId}"]`);
        if (lblEl) keyLblStr = lblEl.textContent.trim();
    }
    
    // Tìm trong AppState.fieldsContainer xem có row nào ứng với target này không
    const rows = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row');
    for (const row of rows) {
        const fKey = row.querySelector('.f-key');
        const btnSync = row.querySelector('.btn-sync-dir');
        const currentDir = btnSync ? btnSync.getAttribute('data-dir') : 'both';
        
        // Chỉ sync LÊN nếu hướng là 'both' hoặc 'up'
        if (currentDir === 'down') continue;

        const targets = fKey.value.split(',').map(x => x.trim()).filter(Boolean);
        
        const isMatch = targets.some(t => t === keyId || t === keyName || t === keyLblStr);
        if (isMatch) {
            const fVal = row.querySelector('.f-val');
            if (fVal && fVal.value === val) continue; // Bỏ qua nếu giá trị đã giống hệt (tránh loop)

            // Cập nhật vào Widget
            addOrUpdateFieldRow(targets[0], val, null, '', null, true);
        }
    }
}, 300);

export function initReverseSync() {
    if (boundHandleEvents) return;

    boundHandleEvents = (e) => {
        const target = e.target.closest('input, textarea, select, ng-select2');
        if (!target) return;

        // Bỏ qua nếu là input từ trong chính Widget của chúng ta
        if (target.closest('#vnpt-docx-widget') || target.closest('#vnpt-inline-calc')) return;

        let val = target.value;
        // Xử lý đặc thù cho Select2
        if (target.tagName === 'NG-SELECT2' || target.classList.contains('select2-hidden-accessible')) {
            const span = target.parentElement ? target.parentElement.querySelector('.select2-selection__rendered') : null;
            if (span && span.getAttribute('title')) {
                val = span.getAttribute('title');
            } else if (span && span.textContent) {
                val = span.textContent.trim();
            }
        }

        debouncedReverseSync(target, val);
    };

    document.addEventListener('input', boundHandleEvents);
    document.addEventListener('change', boundHandleEvents);
}

export function cleanupReverseSync() {
    if (!boundHandleEvents) return;
    document.removeEventListener('input', boundHandleEvents);
    document.removeEventListener('change', boundHandleEvents);
    boundHandleEvents = null;
}
