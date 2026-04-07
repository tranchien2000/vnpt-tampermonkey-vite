/**
 * @file fieldsManager.js
 * @desc Quản lý bảng fields (danh sách key-value-label-sync) trong VNPT Export Widget.
 *       Bao gồm: CRUD hàng, drag-drop sắp xếp, lưu/load localStorage,
 *       toggle chế độ Default Mode (xem dữ liệu mặc định VNPT).
 * @exports addOrUpdateFieldRow  — thêm hoặc cập nhật 1 hàng trong bảng fields
 * @exports saveFieldsToLocal    — lưu toàn bộ bảng fields vào localStorage
 * @exports loadSavedData        — load fields + vị trí widget từ localStorage
 * @exports initFieldsManager    — gán event listeners cho các nút quản lý fields
 * @exports toggleDefaultMode    — bật/tắt chế độ xem dữ liệu mặc định
 * @seeAlso core/defaults.js (DEFAULT_DATA), core/constants.js (keys), widget.js (UI host)
 */
import { AppState } from '../core/state.js';
import { LOCAL_KEY_FIELDS, LOCAL_KEY_DEFAULT_FIELDS, LOCAL_KEY_POS, DEFAULT_LABELS } from '../core/constants.js';
import { setPageField } from '../utils/domHelper.js';
import { showToast } from '../ui/toast.js';
import { DEFAULT_DATA } from '../core/defaults.js';
import { doFillData } from './dataFill/syncEngine.js';

export function addOrUpdateFieldRow(keyText, valueText, labelText = null, syncText = '') {
    const hint = AppState.fieldsContainer.querySelector('.text-hint');
    if (hint) hint.remove();

    const existingInputs = AppState.fieldsContainer.querySelectorAll('.f-key');
    let isDuplicate = false;

    for (let input of existingInputs) {
        // extract prefix from comma-separated input.f-key
        const currentKeyText = input.value.split(',')[0].trim();
        if (currentKeyText === keyText) {
            const row = input.closest('.vnpt-field-row');
            const valueInput = row.querySelector('.f-val');
            const labelInput = row.querySelector('.f-label');

            // Chỉ cập nhật nếu giá trị Khác và Ô đó KHÔNG đang được người dùng focus
            if (valueText !== '' && valueInput.value !== valueText && document.activeElement !== valueInput) {
                valueInput.value = valueText;
            }
            if (labelText !== null && labelText !== '' && labelInput.value !== labelText && document.activeElement !== labelInput) {
                labelInput.value = labelText;
            }
            if (syncText !== '' && input.value !== (keyText + ', ' + syncText) && document.activeElement !== input) {
                // append to existing if not already there? simple mode: replace it
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

        row.innerHTML = `
            <input type="checkbox" class="row-chk" title="Chọn để thao tác hàng loạt" style="margin: 0 2px 0 2px;" />
            <input type="text" class="f-label" placeholder="Nhãn..." value="${labelText}" />
            <input type="text" class="f-key" placeholder="Mã biến / IDs đồng bộ" value="${displayKey}" title="Biến DOCX (đầu tiên), theo sau là các ID web cách dấu phẩy" />
            <span class="row-drag-handle" title="Kéo thả để di chuyển">=</span>
            <input type="text" class="f-val" placeholder="Giá trị" value="${valueText}" />
        `;
        const fVal = row.querySelector('.f-val');
        const fKey = row.querySelector('.f-key');

        if (keyText === 'tenToChuc') {
            fVal.style.textAlign = 'right';
        }

        // Helper đồng bộ giá trị của hàng này lên các field trên trang web
        const syncThisRow = () => {
            const val = fVal.value;
            const targets = fKey.value.split(',').map(s => s.trim()).filter(s => s);
            targets.forEach(t => setPageField(t, val));
        };

        // Bắt sự kiện thay đổi dữ liệu để Lưu (Dùng 'input' thay cho 'keyup' để mượt hơn và bắt được đủ ký tự)
        fKey.addEventListener('input', function () {
            saveFieldsToLocal();
            const firstKey = this.value.split(',')[0].trim();
            fVal.style.textAlign = firstKey === 'tenToChuc' ? 'right' : '';
            syncThisRow(); // Đồng bộ ngay khi sửa key
        });
        row.querySelector('.f-label').addEventListener('input', saveFieldsToLocal);

        fVal.addEventListener('input', function () {
            saveFieldsToLocal();
            syncThisRow(); // Đồng bộ ngay khi sửa giá trị
        });



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
    localStorage.setItem(key, JSON.stringify(data));
}

export async function loadSavedData() {
    // 1. Load Form Fields (Local only)
    try {
        // Luôn xoá sạch các field cũ trước khi load để tránh duplicate hoặc rác
        AppState.fieldsContainer.innerHTML = '';

        const savedFields = JSON.parse(localStorage.getItem(LOCAL_KEY_FIELDS)) || {};

        // PASS 1: Nạp các trường cốt yếu trong DEFAULT_LABELS (Luôn ở đầu)
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

        // PASS 2: Nạp các trường còn lại trong savedFields mà không thuộc mặc định
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

        // Hiển thị hint nhẹ cuối danh sách nếu bảng trống (không xảy ra vì đã có DEFAULT_LABELS)
        if (Object.keys(DEFAULT_LABELS).length === 0 && Object.keys(savedFields).length === 0) {
            AppState.fieldsContainer.innerHTML = '<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>';
        }
    } catch (e) {
        console.error('Error loading config:', e);
        // Dự phòng nạp chay DEFAULT_LABELS nếu lỗi JSON
        Object.keys(DEFAULT_LABELS).forEach(key => {
            addOrUpdateFieldRow(key, '', DEFAULT_LABELS[key]);
        });
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

    // 👉 LOGIC CHUYỂN CHẾ ĐỘ MẶC ĐỊNH
    document.getElementById('vnpt-btn-default').addEventListener('click', toggleDefaultMode);

    // 👉 LOGIC RESET DỮ LIỆU MẶC ĐỊNH (Chỉ khôi phục bộ VNPT)
    document.getElementById('vnpt-btn-reset-default').addEventListener('click', function () {
        if (confirm("Khôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu? (Sẽ xóa các chỉnh sửa hiện tại của bạn trong chế độ này)")) {
            localStorage.removeItem(LOCAL_KEY_DEFAULT_FIELDS);
            if (AppState.isDefaultMode) {
                // Refresh lại view bằng cách tắt rồi bật lại (đơn giản nhất)
                AppState.isDefaultMode = false;
                toggleDefaultMode();
                showToast("🔄 Đã khôi phục dữ liệu gốc", "#1a73e8");
            }
        }
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
        addOrUpdateFieldRow('bien_moi_' + uniqueNumber, '', '', '');
        saveFieldsToLocal();
    });

    // 👉 LOGIC 3: ĐIỀN NGƯỢC (REVERSE FILL)
    document.getElementById('vnpt-btn-fill-back').addEventListener('click', function () {
        // 1. Điền các trường cố định (như tên đơn vị B, địa chỉ B, STK...) từ bộ nhớ cấu hình (Default + Custom data)
        doFillData();

        // 2. Chạy logic điền từ bảng: Điền các giá trị đang hiển thị trong bảng Fields
        const rows = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row');
        let count = 0;
        rows.forEach(row => {
            const rawKey = row.querySelector('.f-key').value.trim();
            const val = row.querySelector('.f-val').value;
            const targets = rawKey.split(',').map(x => x.trim()).filter(Boolean);
            targets.forEach(t => {
                const el = document.getElementById(t) || document.getElementsByName(t)[0];
                if (el) {
                    setPageField(t, val);
                    count++;
                }
            });
        });
        if (count > 0) {
            showToast(`✅ Đã điền ngược ${count} trường vào web`, '#198754');
        } else {
            showToast(`⚠️ Không có trường nào khớp`, '#ffc107');
        }
    });
}

export function toggleDefaultMode() {
    AppState.isDefaultMode = !AppState.isDefaultMode;
    const btn = document.getElementById('vnpt-btn-default');
    const resetBtn = document.getElementById('vnpt-btn-reset-default');

    // Xóa toàn bộ nội dung hiện tại để nạp bộ mới
    AppState.fieldsContainer.innerHTML = '';
    AppState.bannerArea.innerHTML = '';

    if (AppState.isDefaultMode) {
        btn.classList.add('active');
        if (resetBtn) resetBtn.style.display = 'flex';
        AppState.fieldsContainer.classList.add('vnpt-mode-default');
        showToast("📌 Chế độ Dữ liệu mặc định (Có thể chỉnh sửa)", "#ea4335");

        // Thêm banner thông báo
        const banner = document.createElement('div');
        banner.className = 'vnpt-default-banner';
        banner.innerHTML = `
            <span> Lưu ý: đây là Dữ liệu mặc định (Có thể sửa/lưu)</span>
        `;
        AppState.bannerArea.appendChild(banner);

        // Nạp dữ liệu mặc định hoặc Overrides từ localStorage
        const rawOverrides = localStorage.getItem(LOCAL_KEY_DEFAULT_FIELDS);
        if (rawOverrides === null) {
            // Chưa có tùy chỉnh, nạp toàn bộ mặc định từ file defaults.js
            Object.keys(DEFAULT_DATA).forEach(key => {
                const item = DEFAULT_DATA[key];
                const val = (item && typeof item === 'object') ? item.value : item;
                const lbl = (item && typeof item === 'object') ? item.label : (DEFAULT_LABELS[key] || '');
                addOrUpdateFieldRow(key, val, lbl);
            });
        } else {
            // Đã có tùy chỉnh (thêm/bớt/sửa), nạp từ localStorage
            try {
                const overrides = JSON.parse(rawOverrides);
                Object.keys(overrides).forEach(key => {
                    const item = overrides[key];
                    addOrUpdateFieldRow(key, item.value, item.label, item.sync || '');
                });
            } catch (e) {
                console.error("Lỗi nạp Default Overrides:", e);
                // Fallback nếu JSON hỏng
                Object.keys(DEFAULT_DATA).forEach(key => {
                    const item = DEFAULT_DATA[key];
                    const val = (item && typeof item === 'object') ? item.value : item;
                    const lbl = (item && typeof item === 'object') ? item.label : (DEFAULT_LABELS[key] || '');
                    addOrUpdateFieldRow(key, val, lbl);
                });
            }
        }
    } else {
        btn.classList.remove('active');
        if (resetBtn) resetBtn.style.display = 'none';
        AppState.fieldsContainer.classList.remove('vnpt-mode-default');
        showToast("📋 Đã quay lại Dữ liệu cá nhân");

        // Nạp lại dữ liệu từ local
        loadSavedData();
    }
}

