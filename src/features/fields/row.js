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

export function addOrUpdateFieldRow(keyText, valueText, labelText = null, syncText = '', syncDir = null, isFromWebForm = false, sourceContext = null, skipIfNotEmpty = false) {
    const container = AppState.fieldsContainer || document.getElementById('vnpt-fields-list');
    if (!container) {
        console.error('[VNPT-Debug] No container found in addOrUpdateFieldRow for:', keyText);
        return;
    }
    
    const hint = container.querySelector('.text-hint');
    if (hint) hint.remove();

    const existingInputs = container.querySelectorAll('.f-key');
    let isDuplicate = false;

    const incomingPK = keyText.split(',')[0].trim();
    
    // Tìm hàng dựa trên data-pk thay vì class f-key để tránh trùng lặp class
    const existingRow = container.querySelector(`.vnpt-field-row[data-pk="${incomingPK}"]`);

    if (existingRow) {
        const valueInput = existingRow.querySelector('.f-val');
        const labelInput = existingRow.querySelector('.f-label');
        const keyInput = existingRow.querySelector('.f-key');
        const btnSyncDir = existingRow.querySelector('.btn-sync-dir');
        const currentDir = btnSyncDir ? btnSyncDir.getAttribute('data-dir') : 'both';

        // Không cập nhật value nếu:
        // 1. Chế độ skipIfNotEmpty đang bật và value hiện tại đã có dữ liệu
        // 2. Cập nhật từ form web mà chiều sync bị chặn 'down'
        if (valueText !== null && valueInput.value !== valueText && document.activeElement !== valueInput) {
            const hasData = valueInput.value && valueInput.value.trim() !== '';
            if (skipIfNotEmpty && hasData) {
                // Bỏ qua không ghi đè
            } else if (!(isFromWebForm && currentDir === 'down')) {
                const oldVal = valueInput.value;
                valueInput.value = valueText;

                // Hiệu ứng nháy xanh nếu giá trị thực sự thay đổi và không phải rỗng
                if (oldVal !== valueText && valueText) {
                    existingRow.classList.remove('field-flash-success');
                    void existingRow.offsetWidth; // Trigger reflow
                    existingRow.classList.add('field-flash-success');
                    setTimeout(() => existingRow.classList.remove('field-flash-success'), 3000);
                }
            }
        }
        if (labelText !== null && labelText !== '' && labelInput.value !== labelText && document.activeElement !== labelInput) {
            labelInput.value = labelText;
        }
        if (syncText !== '' && keyInput.value !== (keyText + ', ' + syncText) && document.activeElement !== keyInput) {
            keyInput.value = keyText + ', ' + syncText;
        }
        if (syncDir && btnSyncDir && btnSyncDir.getAttribute('data-dir') !== syncDir) {
            updateSyncDirIcon(btnSyncDir, syncDir);
        }

        // Lưu context (địa chỉ mang tính ngữ cảnh) để hỗ trợ "học máy"
        if (sourceContext && valueInput) {
            valueInput.dataset.sourceAddress = sourceContext;
        }

        // QUAN TRỌNG: Re-validate sau khi cập nhật
        refreshRowValidation(existingRow);
        updateRowConnectionStatus(existingRow);

        isDuplicate = true;
    }

    if (!isDuplicate) {
        if (labelText === null || labelText === '') {
            labelText = DEFAULT_LABELS[keyText] || '';
        }

        const container = AppState.fieldsContainer || document.getElementById('vnpt-fields-list');
        if (!container) {
            console.error('[VNPT-Debug] Cannot find container in addOrUpdateFieldRow for key:', keyText);
            return;
        }

        const row = document.createElement('div');
        row.className = 'vnpt-field-row row-item';
        row.setAttribute('draggable', 'false');
        row.setAttribute('data-pk', incomingPK); // Gán PK duy nhất cho hàng

        let displayKey = keyText;
        if (syncText) displayKey += ', ' + syncText;

        const primaryKey = incomingPK;

        row.innerHTML = `
            <input type="checkbox" id="chk-${primaryKey}" name="chk-${primaryKey}" class="row-chk" title="Chọn" />
            <span class="connection-badge disconnected" title="Đang kiểm tra kết nối...">○</span>
            <input type="text" id="lbl-${primaryKey}" name="lbl-${primaryKey}" class="f-label" value="${labelText}" />
            <input type="text" id="key-${primaryKey}" name="key-${primaryKey}" class="f-key" value="${displayKey}" title="Biến DOCX và IDs đồng bộ" />
            <button tabindex="-1" class="btn-sync-dir" title="Đồng bộ" data-dir="${syncDir || 'both'}">↔</button>
            <button class="btn-field-link" title="Liên kết">🔗</button>
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

        if (sourceContext && fVal) {
            fVal.dataset.sourceAddress = sourceContext;
        }

        if (keyText === 'tenToChuc') fVal.style.textAlign = 'right';

        const syncThisRow = async () => {
            const btnSync = row.querySelector('.btn-sync-dir');
            const currentDir = btnSync ? btnSync.getAttribute('data-dir') : 'both';
            if (currentDir === 'up') return;

            const val = fVal.value;
            const targets = fKey.value.split(',').map(s => s.trim()).filter(s => s);
            await setPageFieldsSequential(targets, val);
        };

        const debouncedSyncRow = debounce(syncThisRow, 250);

        fKey.addEventListener('input', function () {
            saveFieldsToLocal();
            updateRowConnectionStatus(row);
            const firstKey = this.value.split(',')[0].trim();
            fVal.style.textAlign = firstKey === 'tenToChuc' ? 'right' : '';
        });
        fKey.addEventListener('change', function () {
            syncThisRow();
        });
        row.querySelector('.f-label').addEventListener('input', () => saveFieldsToLocal());

        fVal.addEventListener('input', function () {
            saveFieldsToLocal();
            refreshRowValidation(row);
            debouncedSyncRow();
        });
        fVal.addEventListener('change', function () {
            if (primaryKey && primaryKey.toLowerCase().includes('ngay') && !primaryKey.toLowerCase().includes('giayuyquyen')) {
                const normalized = normalizeDate(this.value);
                if (normalized !== this.value) {
                    this.value = normalized;
                    saveFieldsToLocal();
                }
            }

            if (primaryKey === 'duong' && this.dataset.sourceAddress) {
                AddressLearning.saveLearning(this.dataset.sourceAddress, this.value);
            }

            syncThisRow();
        });

        if (primaryKey === 'soDkdn') {
            const btnLookup = row.querySelector('.btn-mst-lookup');
            const handleLookup = async (e) => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                
                const mst = fVal.value.trim();
                if (!mst) {
                    showToast("⚠️ Vui lòng nhập mã số thuế", "#ffc107");
                    return;
                }

                if (btnLookup.classList.contains('loading')) return;

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
                        showToast("❌ Không tìm thấy thông tin MST này", "#ea4335");
                    }
                } catch (err) {
                    console.error("[MST Lookup] Error:", err);
                    showToast("❌ Lỗi khi tra cứu MST", "#ea4335");
                } finally {
                    btnLookup.classList.remove('loading');
                }
            };

            btnLookup.addEventListener('click', handleLookup);
            fVal.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    handleLookup(e);
                }
            });
        }

        const initDir = syncDir || 'both';
        const btnSyncDir = row.querySelector('.btn-sync-dir');
        if (btnSyncDir) {
            updateSyncDirIcon(btnSyncDir, initDir);
            btnSyncDir.addEventListener('click', (e) => {
                e.preventDefault();
                let currentDir = btnSyncDir.getAttribute('data-dir');
                if (currentDir === 'both') currentDir = 'down';
                else if (currentDir === 'down') currentDir = 'up';
                else currentDir = 'both';
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

        container.appendChild(row);
        updateRowConnectionStatus(row);
        
        if (container === AppState.fieldsContainer || container === document.getElementById('vnpt-fields-list')) {
            container.scrollTop = container.scrollHeight;
        }

        return row;
    }
}
