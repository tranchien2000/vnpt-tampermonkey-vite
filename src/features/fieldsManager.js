// src/features/fieldsManager.js
import { AppState } from '../core/state.js';
import { loadUserConfig, saveUserConfig } from '../api/firebase.js';
import { LOCAL_KEY_FIELDS, LOCAL_KEY_POS, DEFAULT_LABELS } from '../core/constants.js';
import { setPageField } from '../utils/domHelper.js';
import { showToast } from '../ui/toast.js';

export function addOrUpdateFieldRow(keyText, valueText, labelText = null) {
    const hint = AppState.fieldsContainer.querySelector('.text-hint');
    if (hint) hint.remove();

    const existingInputs = AppState.fieldsContainer.querySelectorAll('.f-key');
    let isDuplicate = false;

    for (let input of existingInputs) {
        if (input.value === keyText) {
            const row = input.closest('.vnpt-field-row');
            const valueInput = row.querySelector('.f-val');
            const labelInput = row.querySelector('.f-label');
            if (valueText !== '') {
                valueInput.value = valueText;
            }
            if (labelText !== null && labelText !== '') {
                labelInput.value = labelText;
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

        row.innerHTML = `
            <input type="checkbox" class="row-chk" title="Chọn để thao tác hàng loạt" style="margin: 0 2px 0 2px;" />
            <input type="text" class="f-label" placeholder="Nhãn..." value="${labelText}" />
            <input type="text" class="f-key" placeholder="Mã biến" value="${keyText}" />
            <span class="row-drag-handle" title="Kéo thả để di chuyển">=</span>
            <input type="text" class="f-val" placeholder="Giá trị" value="${valueText}" />
        `;
        const fVal = row.querySelector('.f-val');
        if (keyText === 'tenToChuc') {
            fVal.style.textAlign = 'right';
        }

        // Bắt sự kiện thay đổi dữ liệu để Lưu
        row.querySelector('.f-key').addEventListener('keyup', function() {
            saveFieldsToLocal();
            fVal.style.textAlign = this.value.trim() === 'tenToChuc' ? 'right' : '';
        });
        row.querySelector('.f-label').addEventListener('keyup', saveFieldsToLocal);
        fVal.addEventListener('keyup', saveFieldsToLocal);



        // Logic kéo thả sắp xếp (Drag & Drop)
        const dragHandle = row.querySelector('.row-drag-handle');
        dragHandle.addEventListener('mouseenter', () => row.setAttribute('draggable', 'true'));
        dragHandle.addEventListener('mouseleave', () => {
            if (!row.classList.contains('dragging')) {
                row.setAttribute('draggable', 'false');
            }
        });

        row.addEventListener('dragstart', function (e) {
            AppState.draggedRowForVNPT = this;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', keyText);
            this.classList.add('dragging');
        });
        row.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            return false;
        });
        row.addEventListener('dragenter', function (e) {
            this.classList.add('over');
        });
        row.addEventListener('dragleave', function (e) {
            this.classList.remove('over');
        });
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
                saveFieldsToLocal(); // Lưu thứ tự mới
            }
            return false;
        });
        row.addEventListener('dragend', function (e) {
            this.setAttribute('draggable', 'false');
            const rows = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row');
            rows.forEach(r => {
                r.classList.remove('over');
                r.classList.remove('dragging');
            });
            AppState.draggedRowForVNPT = null;
        });

        AppState.fieldsContainer.appendChild(row);
        AppState.fieldsContainer.scrollTop = AppState.fieldsContainer.scrollHeight;
    }
}

export async function saveFieldsToLocal() {
    const data = {};
    const rows = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row');
    rows.forEach(row => {
        const k = row.querySelector('.f-key').value.trim();
        const l = row.querySelector('.f-label').value.trim();
        const v = row.querySelector('.f-val').value;
        if (k) data[k] = { label: l, value: v };
    });
    localStorage.setItem(LOCAL_KEY_FIELDS, JSON.stringify(data));
    
    // Sync to firebase debounce (fire and forget cho nhanh, có thể cải tiến sau)
    saveUserConfig({ fields: data });
}

export async function loadSavedData() {
    // 1. Load Form Fields (ưu tiên firebase)
    try {
        let savedFields = null;
        const cloudConfig = await loadUserConfig();
        if (cloudConfig && cloudConfig.fields) {
            savedFields = cloudConfig.fields;
            // Cập nhật lại local cache
            localStorage.setItem(LOCAL_KEY_FIELDS, JSON.stringify(savedFields));
        } else {
            savedFields = JSON.parse(localStorage.getItem(LOCAL_KEY_FIELDS));
        }

        if (savedFields && Object.keys(savedFields).length > 0) {
            // Xoá trắng các field cũ trước khi load để tránh duplicate
            AppState.fieldsContainer.querySelectorAll('.vnpt-field-row').forEach(row => row.remove());
            
            for (const key in savedFields) {
                let st = savedFields[key];
                if (typeof st === 'object' && st !== null) {
                    addOrUpdateFieldRow(key, st.value, st.label);
                } else {
                    addOrUpdateFieldRow(key, st, '');
                }
            }
        }
    } catch (e) {
        console.error('Error loading config:', e);
    }

    // Load Position
    try {
        const pos = JSON.parse(localStorage.getItem(LOCAL_KEY_POS));
        if (pos && AppState.widget) {
            AppState.widget.style.bottom = 'auto';
            if (pos.right) {
                AppState.widget.style.right = pos.right;
                AppState.widget.style.left = 'auto';
            } else if (pos.left) { // Tuong thich phien ban cu
                AppState.widget.style.left = pos.left;
                AppState.widget.style.right = 'auto';
            }
            if (pos.top) AppState.widget.style.top = pos.top;
        }
    } catch (e) { }
}

export function initFieldsManager() {
    // Nút Ẩn/Hiện Mã ID
    document.getElementById('vnpt-btn-toggle-id').addEventListener('click', function () {
        AppState.fieldsContainer.classList.toggle('show-ids');
    });

    // 👉 LOGIC BATCH XÓA
    document.getElementById('vnpt-btn-batch-del').addEventListener('click', function () {
        const rows = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row');
        let checkedCount = 0;
        rows.forEach(row => {
            const chk = row.querySelector('.row-chk');
            if (chk && chk.checked) {
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
    });

    // 👉 LOGIC 2: THÊM TAY
    document.getElementById('vnpt-btn-add').addEventListener('click', function () {
        const uniqueNumber = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row').length + 1;
        addOrUpdateFieldRow('bien_moi_' + uniqueNumber, '', '');
        saveFieldsToLocal();
    });

    // 👉 LOGIC 3: ĐIỀN NGƯỢC (REVERSE FILL)
    document.getElementById('vnpt-btn-fill-back').addEventListener('click', function() {
        const rows = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row');
        let count = 0;
        rows.forEach(row => {
            const key = row.querySelector('.f-key').value.trim();
            const val = row.querySelector('.f-val').value;
            if (key) {
                const el = document.getElementById(key) || document.getElementsByName(key)[0];
                if (el) {
                    setPageField(key, val);
                    count++;
                }
            }
        });
        if (count > 0) {
            showToast(`✅ Đã điền ngược ${count} trường vào web`, '#198754');
        } else {
            showToast(`⚠️ Không có trường nào khớp`, '#ffc107');
        }
    });
}
