import { AppState } from '../../core/state.js';
import { setPageFieldsSequential } from '../../utils/domHelper.js';
import { showToast } from '../../ui/toast.js';
import { doFillData } from '../dataFill/syncEngine.js';

/**
 * Đồng bộ toàn bộ bảng dữ liệu lên trang web
 */
export async function syncAllFields(targetKeys = null) {
    if (!targetKeys) doFillData(); // Chỉ đồng bộ Tab Calc nếu là full sync

    let count = 0;
    const rows = Array.from(AppState.fieldsContainer.querySelectorAll('.vnpt-field-row'));
    
    // Thu thập toàn bộ dữ liệu cần sync trước khi bắt đầu loop async (để tránh DOM mutation làm chậm)
    const syncTasks = rows.map(row => {
        const btnSync = row.querySelector('.btn-sync-dir');
        const currentDir = btnSync ? btnSync.getAttribute('data-dir') : 'both';
        if (currentDir === 'up') return null;

        const fKeyEl = row.querySelector('.f-key');
        const fValEl = row.querySelector('.f-val');
        const fLabelEl = row.querySelector('.f-label');

        if (!fKeyEl || !fValEl || !fLabelEl) return null; // Skip invalid rows

        const rawKeyInput = fKeyEl.value.trim();
        const primaryKey = rawKeyInput.split(',')[0].trim();
        if (targetKeys && !targetKeys.includes(primaryKey)) return null;

        const val = fValEl.value;
        if (val === '') return null;

        const label = fLabelEl.value.trim();
        const targets = rawKeyInput.split(',').map(x => x.trim()).filter(Boolean);
        if (label && !targets.includes(label)) targets.push(label);

        return { targets, val };
    }).filter(Boolean);

    // Thực hiện sync tuần tự (sequential) để tránh nghẽn browser khi xử lý nhiều dropdown AJAX cùng lúc
    for (const task of syncTasks) {
        await setPageFieldsSequential(task.targets, task.val);
        count++;
    }

    if (!targetKeys) {
        count > 0 ? showToast(`✅ Đã đồng bộ ${count} hàng dữ liệu`, '#198754') : showToast(`⚠️ Không có trường nào để đồng bộ`, '#ffc107');
    }
}
