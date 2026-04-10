/**
 * @file fieldsManager.js
 * @desc Quản lý bảng fields (danh sách key-value-label-sync) trong VNPT Export Widget.
 *       Đã tối ưu: Sử dụng Storage utility, Reactive State (AppState.on), DOM Cache.
 */
import { logger } from '../utils/logger.js';
import { AppState } from '../core/state.js';
import { LOCAL_KEY_FIELDS, LOCAL_KEY_DEFAULT_FIELDS, LOCAL_KEY_POS, DEFAULT_LABELS, SK_TAX, SK_CALC_MAP, REQUIRED_KEYS } from '../core/constants.js';
import { setPageField } from '../utils/domHelper.js';
import { showToast } from '../ui/toast.js';
import { DEFAULT_DATA, DEFAULT_CALC_MAP } from '../core/defaults.js';
import { doFillData } from './dataFill/syncEngine.js';
import { Storage } from '../utils/storage.js';
import { mstService } from '../api/mstService.js';
import { createInternalBackup, restoreInternalBackup, getInternalBackups, exportFullBackup } from '../utils/backupHelper.js';

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

/**
 * Lấy tên cho bản sao lưu: [Tên Đại Diện] - [Số HĐ]
 */
function getBackupName() {
    const data = Storage.get(AppState.isDefaultMode ? LOCAL_KEY_DEFAULT_FIELDS : LOCAL_KEY_FIELDS) || {};
    const name = data['tenDaiDienn']?.value || '';
    const contract = data['soHopDong']?.value || '';
    if (!name && !contract) return `Bản sao lưu ${new Date().toLocaleString()}`;
    return `${name} - ${contract}`;
}

/**
 * Lấy tên file export JSON theo yêu cầu của USER: [Số HĐ] - [Tên tổ chức]
 */
function getExportFileName() {
    const data = Storage.get(AppState.isDefaultMode ? LOCAL_KEY_DEFAULT_FIELDS : LOCAL_KEY_FIELDS) || {};
    const contract = data['soHopDong']?.value || '';
    const org = data['tenToChuc']?.value || '';
    
    if (!contract && !org) return `Backup_VNPT_${new Date().toLocaleDateString().replace(/\//g, '-')}`;
    
    const parts = [];
    if (contract) parts.push(contract);
    if (org) parts.push(org);
    
    // Loại bỏ các ký tự không hợp lệ cho tên file (nếu có)
    return parts.join(' - ').replace(/[\\/:"*?<>|]/g, '_');
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

    // Nút Clean Data / Reset hệ thống
    const btnCleanData = document.getElementById('vnpt-btn-clean-data');
    if (btnCleanData) {
        btnCleanData.onclick = () => {
            const isDefault = AppState.isDefaultMode;
            const msg = isDefault 
                ? "BẠN ĐANG Ở CHẾ ĐỘ MẶC ĐỊNH.\nKhôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?"
                : "Dữ liệu hiện tại sẽ được Xóa. Bạn có muốn SAO LƯU nhanh trước khi làm sạch không?";

            if (confirm(msg)) {
                if (!isDefault) {
                    createInternalBackup(getBackupName()); // Sao lưu trước khi xóa dữ liệu cá nhân
                    Storage.remove(LOCAL_KEY_FIELDS);
                    showToast("🧹 Đã làm sạch dữ liệu cá nhân", "#1a73e8");
                } else {
                    Storage.remove(LOCAL_KEY_DEFAULT_FIELDS);
                    showToast("🔄 Đã reset dữ liệu hệ thống VNPT", "#1a73e8");
                }

                Storage.remove(SK_CALC_MAP);
                Storage.remove(SK_TAX);

                // Cập nhật lại giao diện các ô Mapping Calc
                document.querySelectorAll('input[data-clink]').forEach(inp => {
                    const k = inp.dataset.clink;
                    inp.value = (DEFAULT_CALC_MAP[k] || []).join(', ');
                });

                if (isDefault) {
                    updateUIForDefaultMode(true);
                } else {
                    loadSavedData();
                }
            }
        };
    }

    // Nút Khôi phục bản gần nhất (Hiện danh sách)
    const btnRestore = document.getElementById('vnpt-btn-restore-last');
    const backupHistory = document.getElementById('vnpt-backup-history');
    
    if (btnRestore && backupHistory) {
        logger.info("🔄 Restore button found and bound successfully.");
        btnRestore.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isShow = backupHistory.classList.toggle('show');
            if (isShow) {
                renderBackupHistory(backupHistory);
                logger.debug("✨ Backup history displayed.");
            }
        };

        // Đóng danh sách khi click ra ngoài
        document.addEventListener('click', (e) => {
            if (backupHistory.classList.contains('show') && !backupHistory.contains(e.target) && !btnRestore.contains(e.target)) {
                backupHistory.classList.remove('show');
            }
        });
    } else {
        logger.error("❌ Fix UI: Could not find Restore button (#vnpt-btn-restore-last) or History container (#vnpt-backup-history).");
    }

    function renderBackupHistory(container) {
        const backups = getInternalBackups();
        logger.debug("📋 Rendering backups count:", backups.length);
        container.innerHTML = '';
        
        if (backups.length === 0) {
            container.innerHTML = '<div class="backup-history-empty">Chưa có bản sao lưu nào. Hãy thử Clean Data để tạo bản mới!</div>';
            return;
        }

        backups.forEach((b) => {
            const item = document.createElement('div');
            item.className = 'backup-history-item';
            const timeStr = new Date(b.id * 1).toLocaleString();
            item.innerHTML = `
                <div class="backup-history-name" title="${b.name}">${b.name}</div>
                <div class="backup-history-time">${timeStr}</div>
            `;
            item.onclick = (e) => {
                e.stopPropagation();
                if (confirm(`Bạn có chắc muốn khôi phục dữ liệu từ bản: \n${b.name}?`)) {
                    const success = restoreInternalBackup(b.id);
                    if (success) {
                        container.classList.remove('show');
                        // Tự động load lại dữ liệu
                        if (AppState.isDefaultMode) {
                            document.getElementById('vnpt-btn-default')?.click();
                        } else {
                            loadSavedData();
                        }
                    }
                }
            };
            container.appendChild(item);
        });
    }

    // Nút chuyển chế độ mặc định
    document.getElementById('vnpt-btn-default').onclick = () => { AppState.isDefaultMode = !AppState.isDefaultMode; };

    // Register Listener cho isDefaultMode (Reactivity)
    AppState.on('isDefaultMode', (newVal) => updateUIForDefaultMode(newVal));

    // Reset dữ liệu mặc định (Đã gộp vào Clean Data)


    // Batch Xóa / Dọn dẹp
    document.getElementById('vnpt-btn-batch-del').onclick = (e) => {
        const rows = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row');
        const isDeleteMode = e.shiftKey; // Shift+Click = Xóa hàng, Click thường = Dọn giá trị
        let checkedCount = 0;

        // Xử lý các hàng được chọn qua checkbox
        rows.forEach(row => {
            if (row.querySelector('.row-chk')?.checked) {
                if (isDeleteMode) {
                    row.remove();
                } else {
                    const fVal = row.querySelector('.f-val');
                    if (fVal) fVal.value = "";
                }
                checkedCount++;
            }
        });

        if (checkedCount === 0) {
            // Trường hợp không chọn hàng nào -> Xử lý toàn bộ
            const fileName = getExportFileName();
            
            if (isDeleteMode) {
                // Shift+Click: Xóa toàn bộ hàng
                if (confirm(`Xóa TOÀN BỘ hàng dữ liệu?\n\n(Hệ thống sẽ tự động lưu một bản nội bộ để có thể khôi phục).`)) {
                    createInternalBackup(getBackupName()); 
                    rows.forEach(r => r.remove());
                    showToast("🗑️ Đã xóa toàn bộ hàng", "#ff5252");
                    saveFieldsToLocal();
                }
            } else {
                // Click thường: Dọn dẹp giá trị & Xuất JSON
                if (confirm(`Dọn dẹp TOÀN BỘ giá trị và Xuất JSON dự phòng?\n\nFile: "${fileName}.json"\n\n(Hệ thống vẫn tự động lưu một bản nội bộ).`)) {
                    // 1. Xuất file JSON
                    exportFullBackup(fileName);
                    
                    // 2. Sao lưu nội bộ (safety net)
                    createInternalBackup(getBackupName()); 
                    
                    // 3. Thực hiện dọn giá trị
                    rows.forEach(row => {
                        const fVal = row.querySelector('.f-val');
                        if (fVal) fVal.value = "";
                    });
                    
                    showToast("🧹 Đã lưu JSON & Dọn dẹp giá trị", "#1a73e8");
                    saveFieldsToLocal();
                }
            }
        } else {
            // Thông báo kết quả cho các hàng được chọn
            const actionText = isDeleteMode ? "Xóa" : "Dọn giá trị";
            const icon = isDeleteMode ? "🗑️" : "🧹";
            showToast(`${icon} Đã ${actionText} ${checkedCount} trường`, isDeleteMode ? "#ff5252" : "#1a73e8");
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

    AppState.fieldsContainer.innerHTML = '';
    AppState.bannerArea.innerHTML = '';

    if (isDefault) {
        btn.classList.add('active');
        btn.innerHTML = '✅ Chế độ: Dữ liệu mặc định';
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
        document.getElementById('vnpt-fields-container').classList.remove('vnpt-mode-default');
        showToast("📋 Đã quay lại Dữ liệu cá nhân");
        loadSavedData();
    }
}

