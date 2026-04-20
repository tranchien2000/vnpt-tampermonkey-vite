import { AppState } from '../../core/state.js';
import { Storage } from '../../utils/storage.js';
import { logger } from '../../utils/logger.js';
import {
    LOCAL_KEY_FIELDS, LOCAL_KEY_DEFAULT_FIELDS, LOCAL_KEY_POS,
    DEFAULT_LABELS, SK_DATA_DEF
} from '../../core/constants.js';
import { addOrUpdateFieldRow } from './row.js';

export function saveFieldsToLocal() {
    const key = AppState.isDefaultMode ? LOCAL_KEY_DEFAULT_FIELDS : LOCAL_KEY_FIELDS;
    const data = {};
    const container = document.getElementById('vnpt-fields-list');
    if (!container) return;

    const rows = container.querySelectorAll('.vnpt-field-row');
    rows.forEach(row => {
        const keyInput = row.querySelector('.f-key');
        const labelInput = row.querySelector('.f-label');
        const valueInput = row.querySelector('.f-val');
        const syncDirEl = row.querySelector('.btn-sync-dir');

        if (!keyInput || !labelInput || !valueInput) {
            console.warn('[VNPT] Bỏ qua hàng do thiếu input:', row);
            return;
        }
        
        const rawKeyInput = keyInput.value.trim();
        const parts = rawKeyInput.split(',').map(s => s.trim()).filter(s => s);
        const k = parts[0];
        const s = parts.slice(1).join(', ');
        
        if (k) {
            data[k] = { 
                label: labelInput.value.trim(), 
                value: valueInput.value, 
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
    
    // Sử dụng DocumentFragment để tối ưu hóa render, giảm lag khi chuyển bảng
    const fragment = document.createDocumentFragment();
    
    const savedFields = Storage.get(LOCAL_KEY_FIELDS) || {};
    const defaultEntries = Object.entries(DEFAULT_LABELS);
    
    console.log('[VNPT-Debug] Data from Storage:', Object.keys(savedFields).length, 'keys');

    // 1. Nạp các trường mặc định (Khung xương)
    defaultEntries.forEach(([keyString, label]) => {
        // Lọc bỏ các trường Calc dư thừa nếu có trong danh sách mặc định (phòng hờ)
        if (label.includes('Calc:') || label.includes('🛠️')) return;

        const primaryKey = keyString.split(',')[0].trim();
        const saved = savedFields[primaryKey];
        
        if (saved && typeof saved === 'object') {
            addOrUpdateFieldRow(keyString, saved.value || '', saved.label || label, saved.sync || '', saved.syncDir || 'both', false, null, false, fragment);
        } else if (saved && typeof saved === 'string') {
            addOrUpdateFieldRow(keyString, saved, label, '', 'both', false, null, false, fragment);
        } else {
            addOrUpdateFieldRow(keyString, '', label, '', 'both', false, null, false, fragment);
        }
    });

    // 2. Nạp các trường tùy biến (Người dùng tự thêm)
    const defaultPKs = new Set(defaultEntries.map(([keyString]) => keyString.split(',')[0].trim()));
    Object.keys(savedFields).forEach(primaryKey => {
        if (!defaultPKs.has(primaryKey)) {
            const saved = savedFields[primaryKey];
            const label = (saved && typeof saved === 'object') ? (saved.label || '') : '';
            
            // Xoá bỏ các trường có tiền tố "🛠️ Calc:" hoặc "Calc:" theo yêu cầu
            if (label.includes('Calc:') || label.includes('🛠️')) {
                return;
            }

            if (saved && typeof saved === 'object') {
                addOrUpdateFieldRow(primaryKey, saved.value || '', saved.label || '', saved.sync || '', saved.syncDir || 'both', false, null, false, fragment);
            } else if (saved) {
                addOrUpdateFieldRow(primaryKey, saved, '', '', 'both', false, null, false, fragment);
            }
        }
    });

    container.innerHTML = ''; // Làm sạch bảng
    container.appendChild(fragment); // Chèn toàn bộ hàng vào DOM một lần duy nhất

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
