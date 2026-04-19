import { AppState } from '../../core/state.js';
import { DEFAULT_LABELS } from '../../core/constants.js';
import { setPageFieldsSequential, findPageInput } from '../../utils/domHelper.js';
import { mstService } from '../../api/mstService.js';
import { parseAddressComponents, normalizeDate } from '../../utils/stringHelper.js';
import { AddressLearning } from '../../utils/addressLearning.js';
import { debounce } from '../../utils/common.js';
import { showToast } from '../../ui/toast.js';
import { refreshRowValidation } from './validation.js';
import { startFieldLinker } from './linker.js';
// Circular dependency handled by dynamic import or just re-export in fieldsManager
const saveFieldsToLocal = () => import('./store.js').then(m => m.saveFieldsToLocal());
const syncAllFields = (keys) => import('./sync.js').then(m => m.syncAllFields(keys));

export function updateSyncDirIcon(btn, dir) {
    const icons = {
        both: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 8 4 4-4 4"></path><path d="M2 12h20"></path><path d="m6 16-4-4 4-4"></path></svg>`,
        down: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg>`,
        up: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"></path><path d="M12 19V5"></path></svg>`
    };

    btn.innerHTML = icons[dir] || icons.both;
    btn.setAttribute('data-dir', dir);

    if (dir === 'both') {
        btn.title = 'Đồng bộ 2 chiều (Mọi thay đổi đều được cập nhật giữa Bảng và Trang web)';
    } else if (dir === 'down') {
        btn.title = 'Chỉ đồng bộ XUỐNG: Bảng dữ liệu ➔ Form Trang web';
    } else if (dir === 'up') {
        btn.title = 'Chỉ đồng bộ LÊN: Form Trang web ➔ Bảng dữ liệu';
    }
}

export function updateRowConnectionStatus(row) {
    const fKey = row.querySelector('.f-key');
    const badge = row.querySelector('.connection-badge');
    if (!fKey || !badge) return;

    const targets = fKey.value.split(',').map(s => s.trim()).filter(s => s);
    const isConnected = targets.some(t => findPageInput(t) !== null);

    if (isConnected) {
        badge.innerText = '●';
        badge.className = 'connection-badge connected';
        badge.title = 'Đã tìm thấy ô nhập liệu tương ứng trên trang web';
    } else {
        badge.innerText = '○';
        badge.className = 'connection-badge disconnected';
        badge.title = 'Không tìm thấy ô nhập liệu nào khớp trên trang web';
    }
}

export function createRowDOM(keyText, valueText, labelText = null, syncText = '', syncDir = 'both', sourceContext = null) {
    if (labelText === null || labelText === '') {
        labelText = DEFAULT_LABELS[keyText] || '';
    }

    const incomingPK = keyText.split(',')[0].trim();
    const row = document.createElement('div');
    row.className = 'vnpt-field-row row-item';
    row.setAttribute('draggable', 'false');
    row.setAttribute('data-pk', incomingPK);

    let displayKey = keyText;
    if (syncText) displayKey += ', ' + syncText;

    const primaryKey = incomingPK;

    row.innerHTML = `
        <input type="checkbox" id="chk-${primaryKey}" name="chk-${primaryKey}" class="row-chk" title="Chọn" />
        <button tabindex="-1" class="btn-sync-dir" title="Đồng bộ" data-dir="${syncDir}">↔</button>
        <button class="btn-field-link" title="Liên kết">🔗</button>
        <input type="text" id="lbl-${primaryKey}" name="lbl-${primaryKey}" class="f-label" value="${labelText}" />
        <input type="text" id="key-${primaryKey}" name="key-${primaryKey}" class="f-key" value="${displayKey}" title="Biến DOCX và IDs đồng bộ" />
        
        ${primaryKey === 'soDkdn' ? `
            <div class="mst-lookup-wrapper" style="flex: 1; display: flex; position: relative;">
                <input type="text" id="val-${primaryKey}" name="val-${primaryKey}" class="f-val f-value" value="${valueText}" placeholder="Mã số thuế..." />
                <button class="btn-mst-lookup" title="Tra cứu">🔍</button>
            </div>
        ` : `
            <input type="text" id="val-${primaryKey}" name="val-${primaryKey}" class="f-val f-value" value="${valueText}" />
        `}


    `;

    const fVal = row.querySelector('.f-val');
    const fKey = row.querySelector('.f-key');
    const btnSyncDir = row.querySelector('.btn-sync-dir');

    if (sourceContext && fVal) fVal.dataset.sourceAddress = sourceContext;
    if (keyText === 'tenToChuc') fVal.style.textAlign = 'right';
    if (btnSyncDir) updateSyncDirIcon(btnSyncDir, syncDir);

    // Đăng ký sự kiện
    setupRowListeners(row, fKey, fVal, primaryKey);
    
    return row;
}

function setupRowListeners(row, fKey, fVal, primaryKey) {
    const syncThisRow = async () => {
        const btnSync = row.querySelector('.btn-sync-dir');
        const currentDir = btnSync ? btnSync.getAttribute('data-dir') : 'both';
        if (currentDir === 'up') return;
        const targets = fKey.value.split(',').map(s => s.trim()).filter(s => s);
        await setPageFieldsSequential(targets, fVal.value);
    };

    const debouncedSyncRow = debounce(syncThisRow, 250);

    fKey.addEventListener('input', function () {
        saveFieldsToLocal();
        updateRowConnectionStatus(row);
        fVal.style.textAlign = this.value.split(',')[0].trim() === 'tenToChuc' ? 'right' : '';
    });
    fKey.addEventListener('change', syncThisRow);
    row.querySelector('.f-label').addEventListener('input', () => saveFieldsToLocal());

    fVal.addEventListener('input', function (e) {
        // Tự động thêm dấu / cho các trường ngày tháng
        if (primaryKey && primaryKey.toLowerCase().includes('ngay')) {
            let val = this.value.replace(/\D/g, ''); // Chỉ lấy số
            if (val.length > 8) val = val.substring(0, 8);
            
            let finalVal = '';
            if (val.length > 0) {
                finalVal = val.substring(0, 2);
                if (val.length > 2) {
                    finalVal += '/' + val.substring(2, 4);
                    if (val.length > 4) {
                        finalVal += '/' + val.substring(4, 8);
                    }
                }
            }
            
            // Chỉ cập nhật nếu giá trị thực sự thay đổi (để không làm hỏng vị trí con trỏ nếu không cần)
            if (this.value !== finalVal && e.inputType !== 'deleteContentBackward') {
                this.value = finalVal;
            }
        }

        saveFieldsToLocal();
        refreshRowValidation(row);
        debouncedSyncRow();
    });
    fVal.addEventListener('change', function () {
        if (primaryKey && primaryKey.toLowerCase().includes('ngay')) {
            const normalized = normalizeDate(this.value);
            if (normalized !== this.value) {
                this.value = normalized;
                saveFieldsToLocal();
            }
        }
        if (primaryKey === 'duong' && this.dataset.sourceAddress) {
            AddressLearning.saveLearning(this.dataset.sourceAddress, this.value);
        }

        // TỰ ĐỘNG TẠO HỒ SƠ MỚI CHO MST MỚI
        if (primaryKey === 'soDkdn' && !AppState.isDefaultMode) {
            const mstVal = this.value.trim();
            if (mstVal) {
                import('../sessionManager.js').then(m => m.SessionManager.checkAndCreateForNewMST(mstVal));
            }
        }

        syncThisRow();
    });

    if (primaryKey === 'soDkdn') {
        const btnLookup = row.querySelector('.btn-mst-lookup');
        btnLookup.addEventListener('click', (e) => handleMSTLookup(e, fVal, btnLookup));
        fVal.addEventListener('keydown', (e) => e.key === 'Enter' && handleMSTLookup(e, fVal, btnLookup));
    }

    const btnSyncDir = row.querySelector('.btn-sync-dir');
    if (btnSyncDir) {
        btnSyncDir.addEventListener('click', (e) => {
            e.preventDefault();
            let currentDir = btnSyncDir.getAttribute('data-dir');
            currentDir = currentDir === 'both' ? 'down' : (currentDir === 'down' ? 'up' : 'both');
            updateSyncDirIcon(btnSyncDir, currentDir);
            saveFieldsToLocal();
        });
    }

    const linkBtn = row.querySelector('.btn-field-link');
    if (linkBtn) {
        linkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            startFieldLinker(row, fKey);
        });
    }
}

async function handleMSTLookup(e, fVal, btnLookup) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const mst = fVal.value.trim();
    if (!mst || btnLookup.classList.contains('loading')) return;

    btnLookup.classList.add('loading');
    try {
        const info = await mstService.lookupMST(mst);
        if (info) {
            fVal.value = mst;
            addOrUpdateFieldRow('tenToChuc', info.name);
            addOrUpdateFieldRow('diaChi', info.address);
            const parsed = parseAddressComponents(info.address);
            addOrUpdateFieldRow('tinhIdNew', parsed.province);
            addOrUpdateFieldRow('xaIdNew', parsed.ward || parsed.district);
            addOrUpdateFieldRow('duong', parsed.street, null, '', null, false, info.address);
            saveFieldsToLocal();
            setTimeout(() => syncAllFields(['soDkdn', 'tenToChuc', 'diaChi', 'xaIdNew', 'xaHuyen', 'duong']), 300);
            showToast(`✅ Đã tìm thấy: ${info.name}`, "#1a73e8");
        } else {
            showToast("❌ Không tìm thấy MST", "#ea4335");
        }
    } catch (err) {
        showToast("❌ Lỗi tra cứu", "#ea4335");
    } finally {
        btnLookup.classList.remove('loading');
    }
}

export function addOrUpdateFieldRow(keyText, valueText, labelText = null, syncText = '', syncDir = null, isFromWebForm = false, sourceContext = null, skipIfNotEmpty = false) {
    const container = AppState.fieldsContainer || document.getElementById('vnpt-fields-list');
    if (!container) return;
    
    const incomingPK = keyText.split(',')[0].trim();
    // TÌM KIẾM TRIỆT ĐỂ: Chỉ tìm trong hàng con trực tiếp của container hiện tại
    const existingRow = Array.from(container.querySelectorAll('.vnpt-field-row'))
                             .find(row => row.getAttribute('data-pk') === incomingPK);

    if (existingRow) {
        const valueInput = existingRow.querySelector('.f-val');
        const labelInput = existingRow.querySelector('.f-label');
        const keyInput = existingRow.querySelector('.f-key');
        const btnSyncDir = existingRow.querySelector('.btn-sync-dir');
        const currentDir = btnSyncDir ? btnSyncDir.getAttribute('data-dir') : 'both';

        if (valueText !== null && valueInput.value !== valueText && document.activeElement !== valueInput) {
            const hasData = valueInput.value && valueInput.value.trim() !== '';
            if (!(skipIfNotEmpty && hasData) && !(isFromWebForm && currentDir === 'down')) {
                const oldVal = valueInput.value;
                valueInput.value = valueText;
                if (oldVal !== valueText && valueText) {
                    existingRow.classList.add('field-flash-success');
                    setTimeout(() => existingRow.classList.remove('field-flash-success'), 3000);
                }
            }
        }
        if (labelText && labelInput.value !== labelText && document.activeElement !== labelInput) labelInput.value = labelText;
        if (syncText !== '' && keyInput.value !== (keyText + ', ' + syncText)) keyInput.value = keyText + ', ' + syncText;
        if (syncDir && btnSyncDir && btnSyncDir.getAttribute('data-dir') !== syncDir) updateSyncDirIcon(btnSyncDir, syncDir);
        if (sourceContext && valueInput) valueInput.dataset.sourceAddress = sourceContext;

        refreshRowValidation(existingRow);
        updateRowConnectionStatus(existingRow);
    } else {
        const row = createRowDOM(keyText, valueText, labelText, syncText, syncDir || 'both', sourceContext);
        container.appendChild(row);
        updateRowConnectionStatus(row);
        container.scrollTop = container.scrollHeight;
    }
}
