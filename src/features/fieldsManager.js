/**
 * @file fieldsManager.js
 * @desc Quản lý bảng fields (danh sách key-value-label-sync) trong VNPT Export Widget.
 *       Đã tối ưu: Sử dụng Storage utility, Reactive State (AppState.on), DOM Cache.
 */
import { AppState } from '../core/state.js';
import { LOCAL_KEY_FIELDS, LOCAL_KEY_DEFAULT_FIELDS, LOCAL_KEY_POS, DEFAULT_LABELS, SK_TAX, SK_CALC_MAP, REQUIRED_KEYS } from '../core/constants.js';
import { setPageField } from '../utils/domHelper.js';
import { showToast } from '../ui/toast.js';
import { DEFAULT_DATA, DEFAULT_CALC_MAP } from '../core/defaults.js';
import { doFillData } from './dataFill/syncEngine.js';
import { Storage } from '../utils/storage.js';
import { mstService } from '../api/mstService.js';

export function addOrUpdateFieldRow(keyText, valueText, labelText = null, syncText = '') {
    const hint = AppState.fieldsContainer.querySelector('.text-hint');
    if (hint) hint.remove();

    const existingInputs = AppState.fieldsContainer.querySelectorAll('.f-key');
    let isDuplicate = false;

    const incomingPK = keyText.split(',')[0].trim();

    for (let input of existingInputs) {
        const currentPK = input.value.split(',')[0].trim();
        if (currentPK === incomingPK) {
            const row = input.closest('.vnpt-field-row');
            const valueInput = row.querySelector('.f-val');
            const labelInput = row.querySelector('.f-label');

            if (valueText !== '' && valueInput.value !== valueText && document.activeElement !== valueInput) {
                valueInput.value = valueText;
            }
            if (labelText !== null && labelText !== '' && labelInput.value !== labelText && document.activeElement !== labelInput) {
                labelInput.value = labelText;
            }
            if (syncText !== '' && input.value !== (keyText + ', ' + syncText) && document.activeElement !== input) {
                input.value = keyText + ', ' + syncText;
            }
            isDuplicate = true;
            break;
        }
    }

    if (!isDuplicate) {
        if (labelText === null || labelText === '') {
            labelText = DEFAULT_LABELS[keyText] || '';
        }

        const row = document.createElement('div');
        row.className = 'vnpt-field-row row-item';
        row.setAttribute('draggable', 'false');

        let displayKey = keyText;
        if (syncText) displayKey += ', ' + syncText;

        const primaryKey = incomingPK;

        row.innerHTML = `
            <input type="checkbox" id="chk-${primaryKey}" name="chk-${primaryKey}" class="row-chk" title="Chọn" style="margin: 0 2px 0 2px;" />
            <input type="text" id="lbl-${primaryKey}" name="lbl-${primaryKey}" class="f-label" value="${labelText}" />
            <input type="text" id="key-${primaryKey}" name="key-${primaryKey}" class="f-key" value="${displayKey}" title="Biến DOCX và IDs đồng bộ" />
            <span class="row-drag-handle" title="Kéo">=</span>
            ${primaryKey === 'soDkdn' ? `
                <div class="mst-lookup-wrapper">
                    <input type="text" id="val-${primaryKey}" name="val-${primaryKey}" class="f-val" value="${valueText}" placeholder="Mã số thuế..." />
                    <button class="btn-mst-lookup" title="Tra cứu Mã số thuế">
                        <span class="icon">🔍</span>
                        <div class="spinner"></div>
                    </button>
                </div>
            ` : `
                <input type="text" id="val-${primaryKey}" name="val-${primaryKey}" class="f-val" value="${valueText}" />
            `}
        `;
        const fVal = row.querySelector('.f-val');
        const fKey = row.querySelector('.f-key');

        if (keyText === 'tenToChuc') fVal.style.textAlign = 'right';

        const checkRequired = () => {
            if (REQUIRED_KEYS.includes(incomingPK)) {
                if (!fVal.value.trim()) {
                    fVal.classList.add('field-required-empty');
                } else {
                    fVal.classList.remove('field-required-empty');
                }
            }
        };

        const syncThisRow = () => {
            const val = fVal.value;
            const targets = fKey.value.split(',').map(s => s.trim()).filter(s => s);
            targets.forEach(t => setPageField(t, val));
        };

        fKey.addEventListener('input', function () {
            saveFieldsToLocal();
            const firstKey = this.value.split(',')[0].trim();
            fVal.style.textAlign = firstKey === 'tenToChuc' ? 'right' : '';
        });
        fKey.addEventListener('change', function () {
            syncThisRow();
        });
        row.querySelector('.f-label').addEventListener('input', saveFieldsToLocal);

        fVal.addEventListener('input', function () {
            saveFieldsToLocal();
            checkRequired();
        });
        fVal.addEventListener('change', function () {
            syncThisRow();
        });

        // MST Lookup button handler
        if (primaryKey === 'soDkdn') {
            const btnLookup = row.querySelector('.btn-mst-lookup');
            btnLookup.onclick = async () => {
                const mst = fVal.value.trim();
                if (!mst) {
                    showToast("⚠️ Vui lòng nhập mã số thuế", "#ffc107");
                    return;
                }
                
                btnLookup.classList.add('loading');
                try {
                    const info = await mstService.lookupMST(mst);
                    if (info) {
                        // Update current MST row (might have been normalized or cleaned)
                        fVal.value = mst;
                        
                        // Find and update other linked fields
                        // Tên tổ chức
                        addOrUpdateFieldRow('tenToChuc', info.name);
                        // Địa chỉ
                        addOrUpdateFieldRow('diaChi', info.address);
                        // Đại diện (nếu có)
                        if (info.representative) {
                            addOrUpdateFieldRow('tenDaiDienn', info.representative);
                        }
                        
                        saveFieldsToLocal();
                        // Sync all updated fields to page
                        setTimeout(() => syncAllFields(), 300); 
                        
                        showToast(`✅ Đã tìm thấy: ${info.name}`, "#1a73e8");
                    } else {
                        showToast("❌ Không tìm thấy thông tin MST này", "#ea4335");
                    }
                } catch (err) {
                    showToast("❌ Lỗi khi tra cứu MST", "#ea4335");
                } finally {
                    btnLookup.classList.remove('loading');
                }
            };
        }

        // Khởi tạo trạng thái ban đầu
        checkRequired();

        // Drag & Drop Logic
        const dragHandle = row.querySelector('.row-drag-handle');
        dragHandle.addEventListener('mouseenter', () => row.setAttribute('draggable', 'true'));
        dragHandle.addEventListener('mouseleave', () => {
            if (!row.classList.contains('dragging')) row.setAttribute('draggable', 'false');
        });

        row.addEventListener('dragstart', function (e) {
            AppState.draggedRowForVNPT = this;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', keyText);
            this.classList.add('dragging');
        });
        row.addEventListener('dragover', e => { e.preventDefault(); return false; });
        row.addEventListener('dragenter', function () { this.classList.add('over'); });
        row.addEventListener('dragleave', function () { this.classList.remove('over'); });
        row.addEventListener('drop', function (e) {
            e.stopPropagation();
            if (AppState.draggedRowForVNPT && AppState.draggedRowForVNPT !== this) {
                const allRows = Array.from(AppState.fieldsContainer.querySelectorAll('.vnpt-field-row'));
                const draggedIdx = allRows.indexOf(AppState.draggedRowForVNPT);
                const targetIdx = allRows.indexOf(this);

                if (draggedIdx < targetIdx) {
                    this.parentNode.insertBefore(AppState.draggedRowForVNPT, this.nextSibling);
                } else {
                    this.parentNode.insertBefore(AppState.draggedRowForVNPT, this);
                }
                saveFieldsToLocal();
            }
            return false;
        });
        row.addEventListener('dragend', function () {
            this.setAttribute('draggable', 'false');
            AppState.fieldsContainer.querySelectorAll('.vnpt-field-row').forEach(r => {
                r.classList.remove('over', 'dragging');
            });
            AppState.draggedRowForVNPT = null;
        });

        AppState.fieldsContainer.appendChild(row);
        AppState.fieldsContainer.scrollTop = AppState.fieldsContainer.scrollHeight;
    }
}

export function saveFieldsToLocal() {
    const key = AppState.isDefaultMode ? LOCAL_KEY_DEFAULT_FIELDS : LOCAL_KEY_FIELDS;
    const data = {};
    const rows = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row');
    rows.forEach(row => {
        const rawKeyInput = row.querySelector('.f-key').value.trim();
        const parts = rawKeyInput.split(',').map(s => s.trim()).filter(s => s);
        const k = parts[0];
        const s = parts.slice(1).join(', ');
        const l = row.querySelector('.f-label').value.trim();
        const v = row.querySelector('.f-val').value;
        if (k) data[k] = { label: l, value: v, sync: s };
    });
    // Sử dụng setDebounced để tránh ghi đĩa liên tục khi gõ phím
    Storage.setDebounced(key, data, 1000);
}

export function loadSavedData() {
    try {
        AppState.fieldsContainer.innerHTML = '';
        const savedFields = Storage.get(LOCAL_KEY_FIELDS) || {};

        // Load Default Labels first
        Object.keys(DEFAULT_LABELS).forEach(key => {
            const label = DEFAULT_LABELS[key];
            const saved = savedFields[key];
            if (saved && typeof saved === 'object') {
                addOrUpdateFieldRow(key, saved.value, saved.label || label, saved.sync || '');
            } else if (saved) {
                addOrUpdateFieldRow(key, saved, label, '');
            } else {
                addOrUpdateFieldRow(key, '', label, '');
            }
        });

        // Load other non-default fields
        Object.keys(savedFields).forEach(key => {
            if (!(key in DEFAULT_LABELS)) {
                const saved = savedFields[key];
                if (typeof saved === 'object') {
                    addOrUpdateFieldRow(key, saved.value, saved.label, saved.sync || '');
                } else {
                    addOrUpdateFieldRow(key, saved, '', '');
                }
            }
        });

        if (Object.keys(DEFAULT_LABELS).length === 0 && Object.keys(savedFields).length === 0) {
            AppState.fieldsContainer.innerHTML = '<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>';
        }
    } catch (e) {
        console.error('Error loading config:', e);
        Object.keys(DEFAULT_LABELS).forEach(key => addOrUpdateFieldRow(key, '', DEFAULT_LABELS[key]));
    }

    // Load Position
    const pos = Storage.get(LOCAL_KEY_POS);
    if (pos && AppState.widget) {
        AppState.widget.style.bottom = 'auto';
        if (pos.right) {
            AppState.widget.style.right = pos.right;
            AppState.widget.style.left = 'auto';
        } else if (pos.left) {
            AppState.widget.style.left = pos.left;
            AppState.widget.style.right = 'auto';
        }
        if (pos.top) AppState.widget.style.top = pos.top;
    }
}

export function initFieldsManager() {
    // Nút Ẩn/Hiện Mã ID
    document.getElementById('vnpt-btn-toggle-id').onclick = () => AppState.fieldsContainer.classList.toggle('show-ids');

    // Nút Clean Data
    const btnCleanData = document.getElementById('vnpt-btn-clean-data');
    if (btnCleanData) {
        btnCleanData.onclick = () => {
            if (confirm("Làm sạch dữ liệu hiện tại và tải lại toàn bộ cấu trúc mặc định?")) {
                Storage.remove(LOCAL_KEY_FIELDS);
                Storage.remove(SK_CALC_MAP);
                Storage.remove(SK_TAX);

                // Cập nhật lại giao diện các ô Mapping Calc
                document.querySelectorAll('input[data-clink]').forEach(inp => {
                    const k = inp.dataset.clink;
                    inp.value = (DEFAULT_CALC_MAP[k] || []).join(', ');
                });

                if (AppState.isDefaultMode) {
                    // Nếu đang ở mode default, clean default data và reload default data
                    Storage.remove(LOCAL_KEY_DEFAULT_FIELDS);
                    updateUIForDefaultMode(true);
                } else {
                    loadSavedData();
                }
                showToast("🧹 Đã làm sạch toàn bộ dữ liệu & cấu hình", "#1a73e8");
            }
        };
    }

    // Nút chuyển chế độ mặc định
    document.getElementById('vnpt-btn-default').onclick = () => { AppState.isDefaultMode = !AppState.isDefaultMode; };

    // Register Listener cho isDefaultMode (Reactivity)
    AppState.on('isDefaultMode', (newVal) => updateUIForDefaultMode(newVal));

    // Reset dữ liệu mặc định
    document.getElementById('vnpt-btn-reset-default').onclick = () => {
        if (confirm("Khôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?")) {
            Storage.remove(LOCAL_KEY_DEFAULT_FIELDS);
            Storage.remove(SK_CALC_MAP);
            Storage.remove(SK_TAX);

            if (AppState.isDefaultMode) {
                updateUIForDefaultMode(true);
                showToast("🔄 Đã khôi phục dữ liệu gốc", "#1a73e8");
            }
        }
    };

    // Batch Xóa
    document.getElementById('vnpt-btn-batch-del').onclick = () => {
        const rows = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row');
        let checkedCount = 0;
        rows.forEach(row => {
            if (row.querySelector('.row-chk')?.checked) {
                row.remove();
                checkedCount++;
            }
        });
        if (checkedCount === 0) {
            if (confirm("Xóa TOÀN BỘ dữ liệu các trường?")) {
                rows.forEach(r => r.remove());
                showToast("🗑️ Đã xóa toàn bộ", "#ff5252");
                saveFieldsToLocal();
            }
        } else {
            showToast(`🗑️ Đã xóa ${checkedCount} trường`, "#ff5252");
            saveFieldsToLocal();
        }
    };

    // Thêm tay
    document.getElementById('vnpt-btn-add').onclick = () => {
        const uniqueNumber = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row').length + 1;
        addOrUpdateFieldRow('bien_moi_' + uniqueNumber, '', '', '');
        saveFieldsToLocal();
    };

    // Điền ngược (Reverse Fill)
    document.getElementById('vnpt-btn-fill-back').onclick = () => {
        syncAllFields();
    };
}

export function syncAllFields() {
    doFillData(); // Đồng bộ dữ liệu Tab Calc
    let count = 0;
    AppState.fieldsContainer.querySelectorAll('.vnpt-field-row').forEach(row => {
        const rawKey = row.querySelector('.f-key').value.trim();
        const val = row.querySelector('.f-val').value;
        rawKey.split(',').map(x => x.trim()).filter(Boolean).forEach(t => {
            const el = document.getElementById(t) || document.getElementsByName(t)[0];
            if (el) { setPageField(t, val); count++; }
        });
    });
    count > 0 ? showToast(`✅ Đã đồng bộ ${count} trường lên web`, '#198754') : showToast(`⚠️ Không có trường nào để đồng bộ`, '#ffc107');
}

function updateUIForDefaultMode(isDefault) {
    const btn = document.getElementById('vnpt-btn-default');
    const resetBtn = document.getElementById('vnpt-btn-reset-default');

    AppState.fieldsContainer.innerHTML = '';
    AppState.bannerArea.innerHTML = '';

    if (isDefault) {
        btn.classList.add('active');
        btn.innerHTML = '✅ Chế độ: Dữ liệu mặc định';
        if (resetBtn) resetBtn.style.display = 'flex';
        document.getElementById('vnpt-fields-container').classList.add('vnpt-mode-default');
        showToast("📌 Chế độ Dữ liệu mặc định (Có thể sửa)", "#ea4335");

        const banner = document.createElement('div');
        banner.className = 'vnpt-default-banner';
        banner.innerHTML = `<span style="color: red;"> LƯU Ý: ĐÂY LÀ DỮ LIỆU MẶC ĐỊNH</span>`;
        AppState.bannerArea.appendChild(banner);

        const overrides = Storage.get(LOCAL_KEY_DEFAULT_FIELDS);
        if (overrides === null) {
            Object.keys(DEFAULT_DATA).forEach(key => {
                const item = DEFAULT_DATA[key];
                const val = (item && typeof item === 'object') ? item.value : item;
                const lbl = (item && typeof item === 'object') ? item.label : (DEFAULT_LABELS[key] || '');
                addOrUpdateFieldRow(key, val, lbl);
            });
        } else {
            Object.keys(overrides).forEach(key => {
                const item = overrides[key];
                addOrUpdateFieldRow(key, item.value, item.label, item.sync || '');
            });
        }
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '🛠 Dữ liệu mặc định VNPT';
        if (resetBtn) resetBtn.style.display = 'none';
        document.getElementById('vnpt-fields-container').classList.remove('vnpt-mode-default');
        showToast("📋 Đã quay lại Dữ liệu cá nhân");
        loadSavedData();
    }
}

