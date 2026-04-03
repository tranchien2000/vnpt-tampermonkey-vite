// src/features/fieldsManager.js
import { AppState } from '../core/state.js';
import { LOCAL_KEY_FIELDS, LOCAL_KEY_POS, DEFAULT_LABELS } from '../core/constants.js';

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
        row.className = 'vnpt-field-row';
        row.setAttribute('draggable', 'true');
        row.innerHTML = `
            <span class="row-drag-handle" title="Kéo thả để sắp xếp">☰</span>
            <input type="text" class="f-label" placeholder="Nhãn..." value="${labelText}" />
            <input type="text" class="f-key" placeholder="Mã biến" value="${keyText}" />
            <span>=</span>
            <input type="text" class="f-val" placeholder="Giá trị" value="${valueText}" />
            <button class="vnpt-btn-del" title="Xóa">X</button>
        `;
        // Bắt sự kiện thay đổi dữ liệu để Lưu
        row.querySelector('.f-key').addEventListener('keyup', saveFieldsToLocal);
        row.querySelector('.f-label').addEventListener('keyup', saveFieldsToLocal);
        row.querySelector('.f-val').addEventListener('keyup', saveFieldsToLocal);

        row.querySelector('.vnpt-btn-del').addEventListener('click', function () {
            row.remove();
            saveFieldsToLocal(); // Lưu lại khi xóa hàng
        });

        // Logic kéo thả sắp xếp (Drag & Drop)
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

export function saveFieldsToLocal() {
    const data = {};
    const rows = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row');
    rows.forEach(row => {
        const k = row.querySelector('.f-key').value.trim();
        const l = row.querySelector('.f-label').value.trim();
        const v = row.querySelector('.f-val').value;
        if (k) data[k] = { label: l, value: v };
    });
    localStorage.setItem(LOCAL_KEY_FIELDS, JSON.stringify(data));
}

export function loadSavedData() {
    // Load Form Fields
    try {
        const savedFields = JSON.parse(localStorage.getItem(LOCAL_KEY_FIELDS));
        if (savedFields && Object.keys(savedFields).length > 0) {
            for (const key in savedFields) {
                let st = savedFields[key];
                if (typeof st === 'object' && st !== null) {
                    addOrUpdateFieldRow(key, st.value, st.label);
                } else {
                    addOrUpdateFieldRow(key, st, '');
                }
            }
        }
    } catch (e) { }

    // Load Position
    try {
        const pos = JSON.parse(localStorage.getItem(LOCAL_KEY_POS));
        if (pos && pos.left && AppState.widget) {
            AppState.widget.style.right = 'auto'; // Tắt right đi
            AppState.widget.style.bottom = 'auto';
            AppState.widget.style.left = pos.left;
            AppState.widget.style.top = pos.top;
        }
    } catch (e) { }
}

export function initFieldsManager() {
    // Nút Ẩn/Hiện Mã ID
    document.getElementById('vnpt-btn-toggle-id').addEventListener('click', function () {
        AppState.fieldsContainer.classList.toggle('show-ids');
    });

    // 👉 LOGIC 1.5: XÓA DỮ LIỆU (CLEAN)
    document.getElementById('vnpt-btn-clean').addEventListener('click', function () {
        const rows = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row');
        rows.forEach(row => {
            const valInput = row.querySelector('.f-val');
            if (valInput) valInput.value = '';
        });
        saveFieldsToLocal();
    });

    // 👉 LOGIC 2: THÊM TAY
    document.getElementById('vnpt-btn-add').addEventListener('click', function () {
        const uniqueNumber = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row').length + 1;
        addOrUpdateFieldRow('bien_moi_' + uniqueNumber, '', '');
        saveFieldsToLocal();
    });
}
