import { AppState } from '../../core/state.js';
import { logger } from '../../utils/logger.js';
import { Storage } from '../../utils/storage.js';
import {
    LOCAL_KEY_FIELDS, LOCAL_KEY_DEFAULT_FIELDS, SK_TAX, SK_CALC_MAP,
    SK_COL_RATIO, COL_RATIO_MIN, COL_RATIO_MAX
} from '../../core/constants.js';
import { showToast } from '../../ui/toast.js';
import {
    createInternalBackup, restoreInternalBackup, getInternalBackups, deleteInternalBackup
} from '../../utils/backupHelper.js';
import { addOrUpdateFieldRow } from './row.js';
import { saveFieldsToLocal, loadSavedData, getBackupName } from './store.js';
import { syncAllFields } from './sync.js';
import { updateUIForDefaultMode } from './mode.js';

/**
 * Khởi tạo thanh kéo chia cột (Label / Value) trong Fields List.
 */
export function initColSplitter() {
    const splitter = document.getElementById('vnpt-col-splitter');
    const container = document.getElementById('vnpt-fields-container');
    if (!splitter || !container) return;

    const savedRatio = parseFloat(Storage.get(SK_COL_RATIO)) || 0.2;
    container.style.setProperty('--label-flex', savedRatio);

    splitter.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();

        splitter.classList.add('dragging');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        const containerRect = container.getBoundingClientRect();
        const startX = e.clientX;
        const startRatio = parseFloat(container.style.getPropertyValue('--label-flex')) || 0.2;

        const onMouseMove = (moveEvt) => {
            const dx = moveEvt.clientX - startX;
            const totalWidth = containerRect.width;
            const deltaRatio = dx / totalWidth;
            const newRatio = Math.min(COL_RATIO_MAX, Math.max(COL_RATIO_MIN, startRatio + deltaRatio));
            container.style.setProperty('--label-flex', newRatio.toFixed(3));
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            splitter.classList.remove('dragging');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';

            const finalRatio = container.style.getPropertyValue('--label-flex');
            Storage.set(SK_COL_RATIO, parseFloat(finalRatio));
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    });

    splitter.addEventListener('dblclick', () => {
        container.style.setProperty('--label-flex', '0.2');
        Storage.set(SK_COL_RATIO, 0.2);
        showToast('↔ Đã reset tỉ lệ cột về mặc định', '#5f6368');
    });
}

function renderBackupHistory(container) {
    const backups = getInternalBackups();
    container.innerHTML = `<div class="backup-history-header">📋 Local History (Max 20)</div>`;

    if (backups.length === 0) {
        container.innerHTML += '<div class="backup-history-empty">Chưa có lịch sử. Dữ liệu sẽ tự lưu khi bạn Quét hoặc Dọn dẹp!</div>';
        return;
    }

    backups.forEach((b) => {
        const item = document.createElement('div');
        item.className = 'backup-history-item';
        item.style.flexDirection = 'column';
        item.style.alignItems = 'stretch';

        const timeStr = new Date(b.id * 1).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

        item.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <div class="backup-info">
                    <div class="backup-history-name" title="${b.name}">${b.name}</div>
                    <div class="backup-history-time">${timeStr}</div>
                </div>
                <div class="backup-actions">
                    <button class="btn-restore-action" title="Khôi phục">⏪</button>
                    <button class="btn-delete-action" title="Xóa bản này">🗑️</button>
                </div>
            </div>
            <div class="backup-preview-content"></div>
        `;

        const previewContent = item.querySelector('.backup-preview-content');
        
        // Tự động nạp dữ liệu khi di chuột qua (Hover)
        item.onmouseenter = () => {
            if (previewContent.innerHTML === '') {
                const fields = b.data?.fields || {};
                // Ưu tiên các trường quan trọng để preview
                const importantKeys = ['tenToChuc', 'soHopDong', 'tenDaiDienn', 'soDkdn', 'diaChi'];
                let html = '';
                
                importantKeys.forEach(k => {
                    if (fields[k] && fields[k].value) {
                        const label = fields[k].label || k;
                        html += `
                            <div class="preview-row">
                                <span class="preview-label">${label}:</span>
                                <span class="preview-val">${fields[k].value}</span>
                            </div>
                        `;
                    }
                });

                if (!html) {
                    // Nếu không có trường quan trọng, lấy 5 trường bất kỳ
                    Object.keys(fields).slice(0, 5).forEach(k => {
                        html += `
                            <div class="preview-row">
                                <span class="preview-label">${fields[k].label || k}:</span>
                                <span class="preview-val">${fields[k].value || ''}</span>
                            </div>
                        `;
                    });
                }
                
                previewContent.innerHTML = html || '<div style="text-align:center; color:#9aa0a6;">(Trống)</div>';
            }
        };

        item.querySelector('.btn-restore-action').onclick = (e) => {
            e.stopPropagation();
            if (confirm(`Khôi phục dữ liệu từ bản: \n${b.name}?`)) {
                if (restoreInternalBackup(b.id)) {
                    container.classList.remove('show');
                    if (AppState.isDefaultMode) AppState.isDefaultMode = false;
                    else loadSavedData();
                }
            }
        };

        item.querySelector('.btn-delete-action').onclick = (e) => {
            e.stopPropagation();
            if (confirm(`Xoá vĩnh viễn bản sao lưu:\n${b.name}?`)) {
                deleteInternalBackup(b.id);
                renderBackupHistory(container);
                showToast("🗑️ Đã xoá bản sao lưu", "#ff5252");
            }
        };

        container.appendChild(item);
    });
}

export function initFieldsManager() {
    const container = document.getElementById('vnpt-fields-container');

    // Toggle Chế độ nâng cao (gộp cả show-ids và show-row-tools)
    const btnToggleAdvanced = document.getElementById('vnpt-btn-toggle-advanced');
    if (btnToggleAdvanced && container) {
        // Load state
        const isAdvanced = Storage.get('vnpt_advanced_mode') === 'true';

        const updateAdvancedMode = (enabled) => {
            if (enabled) {
                container.classList.add('show-ids', 'show-row-tools');
                btnToggleAdvanced.style.background = 'var(--vnpt-primary)';
                btnToggleAdvanced.style.color = '#fff';
                btnToggleAdvanced.innerHTML = '✅ Chế độ nâng cao';
            } else {
                container.classList.remove('show-ids', 'show-row-tools');
                btnToggleAdvanced.style.background = '';
                btnToggleAdvanced.style.color = '';
                btnToggleAdvanced.innerHTML = '🔧 Chế độ nâng cao';
            }
            Storage.set('vnpt_advanced_mode', enabled ? 'true' : 'false');
        };

        // Init state
        updateAdvancedMode(isAdvanced);

        // Toggle on click
        btnToggleAdvanced.addEventListener('click', () => {
            const currentState = Storage.get('vnpt_advanced_mode') === 'true';
            updateAdvancedMode(!currentState);
        });
    }

    initColSplitter();

    const btnCleanData = document.getElementById('vnpt-btn-clean-data');
    if (btnCleanData) {
        btnCleanData.onclick = () => {
            const isDefault = AppState.isDefaultMode;
            const msg = isDefault
                ? "BẠN ĐANG Ở CHẾ ĐỘ MẶC ĐỊNH.\nKhôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?"
                : "Dữ liệu hiện tại sẽ được Xóa. Bạn có muốn SAO LƯU nhanh trước khi làm sạch không?";

            if (confirm(msg)) {
                if (!isDefault) {
                    createInternalBackup(getBackupName());
                    Storage.remove(LOCAL_KEY_FIELDS);
                    showToast("🧹 Đã làm sạch & lưu bản cũ vào History", "#1a73e8");
                } else {
                    Storage.remove(LOCAL_KEY_DEFAULT_FIELDS);
                    showToast("🔄 Đã reset dữ liệu hệ thống VNPT", "#1a73e8");
                }

                Storage.remove(SK_CALC_MAP);
                Storage.remove(SK_TAX);

                if (isDefault) {
                    updateUIForDefaultMode(true);
                } else {
                    loadSavedData();
                }
            }
        };
    }

    const btnRestore = document.getElementById('vnpt-btn-restore-last');
    const backupHistory = document.getElementById('vnpt-backup-history');

    if (btnRestore && backupHistory) {
        btnRestore.title = "Click để xem lịch sử sao lưu (Tối đa 20 bản)";

        btnRestore.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const isShow = backupHistory.classList.toggle('show');
            if (isShow) {
                renderBackupHistory(backupHistory);
            }
        };

        btnRestore.oncontextmenu = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const backups = getInternalBackups();
            if (backups.length > 0) {
                const latest = backups[0];
                if (confirm(`Khôi phục nhanh bản gần nhất?\n"${latest.name}"`)) {
                    if (restoreInternalBackup(latest.id)) {
                        if (AppState.isDefaultMode) AppState.isDefaultMode = false;
                        else loadSavedData();
                        backupHistory.classList.remove('show');
                    }
                }
            } else {
                showToast("⚠️ Chưa có bản sao lưu nào", "#ffc107");
            }
        };

        document.addEventListener('click', (e) => {
            if (backupHistory.classList.contains('show') && !backupHistory.contains(e.target) && !btnRestore.contains(e.target)) {
                backupHistory.classList.remove('show');
            }
        });
    }

    document.getElementById('vnpt-btn-default').onclick = () => { AppState.isDefaultMode = !AppState.isDefaultMode; };

    AppState.on('isDefaultMode', (newVal) => updateUIForDefaultMode(newVal));

    document.getElementById('vnpt-btn-batch-del').onclick = (e) => {
        const rows = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row');
        const isDeleteMode = e.shiftKey;
        let checkedCount = 0;

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
            const fields = Storage.get(AppState.isDefaultMode ? LOCAL_KEY_DEFAULT_FIELDS : LOCAL_KEY_FIELDS) || {};
            const orgName = fields['tenToChuc']?.value || "Dữ liệu hiện tại";
            const displayName = orgName.length > 25 ? orgName.substring(0, 25) + "..." : orgName;
            if (isDeleteMode) {
                if (confirm(`Xóa TOÀN BỘ hàng dữ liệu của:\n"${orgName}"?\n\n(Hệ thống sẽ tự động lưu một bản vào History).`)) {
                    createInternalBackup(getBackupName());
                    rows.forEach(r => r.remove());
                    showToast(`🗑️ Đã xóa nội dung: ${displayName}`, "#ff5252");
                    saveFieldsToLocal();
                }
            } else {
                if (confirm(`Dọn dẹp TOÀN BỘ giá trị bảng của:\n"${orgName}"?\n\n(Hệ thống sẽ tự động lưu vào History).`)) {
                    createInternalBackup(getBackupName());
                    rows.forEach(row => {
                        const fVal = row.querySelector('.f-val');
                        if (fVal) fVal.value = "";
                    });
                    showToast(`🧹 Đã dọn dẹp: ${displayName}`, "#1a73e8");
                    saveFieldsToLocal();
                }
            }
        } else {
            const actionText = isDeleteMode ? "Xóa" : "Dọn giá trị";
            const icon = isDeleteMode ? "🗑️" : "🧹";
            showToast(`${icon} Đã ${actionText} ${checkedCount} trường`, isDeleteMode ? "#ff5252" : "#1a73e8");
            saveFieldsToLocal();
        }
    };

    document.getElementById('vnpt-btn-add').onclick = () => {
        const uniqueNumber = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row').length + 1;
        addOrUpdateFieldRow('bien_moi_' + uniqueNumber, '', '', '');
        saveFieldsToLocal();
    };

    const btnFillBack = document.getElementById('vnpt-btn-fill-back');
    if (btnFillBack) {
        btnFillBack.onclick = async () => {
            if (btnFillBack.classList.contains('loading')) return;
            
            btnFillBack.classList.add('loading');
            btnFillBack.disabled = true;
            try {
                await syncAllFields();
            } finally {
                btnFillBack.classList.remove('loading');
                btnFillBack.disabled = false;
            }
        };
    }
}
