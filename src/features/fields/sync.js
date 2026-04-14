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
    const rows = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row');

    for (const row of rows) {
        const btnSync = row.querySelector('.btn-sync-dir');
        const currentDir = btnSync ? btnSync.getAttribute('data-dir') : 'both';
        if (currentDir === 'up') continue;

        const rawKeyInput = row.querySelector('.f-key').value.trim();
        const primaryKey = rawKeyInput.split(',')[0].trim();

        if (targetKeys && !targetKeys.includes(primaryKey)) continue;

        const val = row.querySelector('.f-val').value;
        if (val === '') continue;

        const label = row.querySelector('.f-label').value.trim();
        const targets = rawKeyInput.split(',').map(x => x.trim()).filter(Boolean);

        if (label && !targets.includes(label)) {
            targets.push(label);
        }

        await setPageFieldsSequential(targets, val);
        if (targets.length > 0) count++;
    }

    if (!targetKeys) {
        count > 0 ? showToast(`✅ Đã đồng bộ ${count} hàng dữ liệu`, '#198754') : showToast(`⚠️ Không có trường nào để đồng bộ`, '#ffc107');
    }
}
