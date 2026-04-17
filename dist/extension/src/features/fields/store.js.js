import { AppState } from "/src/core/state.js.js";
import { Storage } from "/src/utils/storage.js.js";
import { logger } from "/src/utils/logger.js.js";
import {
    LOCAL_KEY_FIELDS, LOCAL_KEY_DEFAULT_FIELDS, LOCAL_KEY_POS,
    DEFAULT_LABELS, SK_DATA_DEF
} from "/src/core/constants.js.js";
import { addOrUpdateFieldRow } from "/src/features/fields/row.js.js";

export function saveFieldsToLocal() {
    const key = AppState.isDefaultMode ? LOCAL_KEY_DEFAULT_FIELDS : LOCAL_KEY_FIELDS;
    const data = {};
    const container = document.getElementById('vnpt-fields-list');
    if (!container) return;

    const rows = container.querySelectorAll('.vnpt-field-row');
    rows.forEach(row => {
        const keyInput = row.querySelector('.f-key');
        if (!keyInput) return;
        
        const rawKeyInput = keyInput.value.trim();
        const parts = rawKeyInput.split(',').map(s => s.trim()).filter(s => s);
        const k = parts[0];
        const s = parts.slice(1).join(', ');
        
        const labelInput = row.querySelector('.f-label');
        const valueInput = row.querySelector('.f-val');
        const syncDirEl = row.querySelector('.btn-sync-dir');
        
        if (k) {
            data[k] = { 
                label: labelInput ? labelInput.value.trim() : '', 
                value: valueInput ? valueInput.value : '', 
                sync: s, 
                syncDir: syncDirEl ? syncDirEl.getAttribute('data-dir') : 'both' 
            };
        }
    });
    
    Storage.setDebounced(key, data, 1000);
    if (AppState.isDefaultMode) {
        Storage.setDebounced(SK_DATA_DEF, data, 1000);
    }
}

export function loadSavedData() {
    console.log('[VNPT-Debug] loadSavedData START');
    
    const container = document.getElementById('vnpt-fields-list');
    if (!container) {
        console.warn('[VNPT-Debug] Container not found, retrying...');
        setTimeout(loadSavedData, 150);
        return;
    }

    AppState.fieldsContainer = container;
    container.innerHTML = ''; // Làm sạch bảng
    
    const savedFields = Storage.get(LOCAL_KEY_FIELDS) || {};
    const defaultEntries = Object.entries(DEFAULT_LABELS);
    
    console.log('[VNPT-Debug] Data from Storage:', Object.keys(savedFields).length, 'keys');

    // 1. Nạp các trường mặc định (Khung xương)
    defaultEntries.forEach(([keyString, label]) => {
        const primaryKey = keyString.split(',')[0].trim();
        const saved = savedFields[primaryKey];
        
        if (saved && typeof saved === 'object') {
            addOrUpdateFieldRow(keyString, saved.value || '', saved.label || label, saved.sync || '', saved.syncDir || 'both');
        } else if (saved && typeof saved === 'string') {
            addOrUpdateFieldRow(keyString, saved, label, '', 'both');
        } else {
            addOrUpdateFieldRow(keyString, '', label, '', 'both');
        }
    });

    // 2. Nạp các trường tùy biến (Người dùng tự thêm)
    const defaultPKs = new Set(defaultEntries.map(([keyString]) => keyString.split(',')[0].trim()));
    Object.keys(savedFields).forEach(primaryKey => {
        if (!defaultPKs.has(primaryKey)) {
            const saved = savedFields[primaryKey];
            if (saved && typeof saved === 'object') {
                addOrUpdateFieldRow(primaryKey, saved.value || '', saved.label || '', saved.sync || '', saved.syncDir || 'both');
            } else if (saved) {
                addOrUpdateFieldRow(primaryKey, saved, '', '', 'both');
            }
        }
    });

    console.log('[VNPT-Debug] Render completed. Rows in DOM:', container.querySelectorAll('.vnpt-field-row').length);

    if (container.querySelectorAll('.vnpt-field-row').length === 0) {
        container.innerHTML = '<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>';
    }
}

export function restorePosition() {
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

export function getBackupName() {
    const data = Storage.get(AppState.isDefaultMode ? LOCAL_KEY_DEFAULT_FIELDS : LOCAL_KEY_FIELDS) || {};
    const org = data['tenToChuc']?.value || '';
    const name = data['tenDaiDienn']?.value || '';
    const contract = data['soHopDong']?.value || '';
    if (!org && !name && !contract) return `Bản sao lưu ${new Date().toLocaleString()}`;
    let label = org || name;
    if (contract) label += ` - ${contract}`;
    return label;
}

export function getExportFileName() {
    const data = Storage.get(AppState.isDefaultMode ? LOCAL_KEY_DEFAULT_FIELDS : LOCAL_KEY_FIELDS) || {};
    const contract = data['soHopDong']?.value || '';
    const org = data['tenToChuc']?.value || '';
    if (!contract && !org) return `Backup_VNPT_${new Date().toLocaleDateString().replace(/\//g, '-')}`;
    const parts = [];
    if (contract) parts.push(contract);
    if (org) parts.push(org);
    return parts.join(' - ').replace(/[\\\\/:"*?<>|]/g, '_');
}
