import { AppState } from '../../core/state.js';
import { Storage } from '../../utils/storage.js';
import {
    LOCAL_KEY_FIELDS, LOCAL_KEY_DEFAULT_FIELDS, LOCAL_KEY_POS,
    DEFAULT_LABELS, SK_DATA_DEF
} from '../../core/constants.js';
import { createRowDOM, updateRowConnectionStatus } from './row.js';

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
    const container = document.getElementById('vnpt-fields-list');
    if (!container) {
        setTimeout(loadSavedData, 50);
        return;
    }

    AppState.fieldsContainer = container;
    const savedFields = Storage.get(LOCAL_KEY_FIELDS) || {};
    const defaultEntries = Object.entries(DEFAULT_LABELS);
    
    const fragment = document.createDocumentFragment();

    // 1. Nạp các trường mặc định
    defaultEntries.forEach(([keyString, label]) => {
        if (label.includes('Calc:') || label.includes('🛠️')) return;

        const primaryKey = keyString.split(',')[0].trim();
        const saved = savedFields[primaryKey];
        
        const row = createRowDOM(
            keyString, 
            (typeof saved === 'object' ? saved.value : (saved || '')), 
            (typeof saved === 'object' ? saved.label : (label || '')), 
            (typeof saved === 'object' ? saved.sync : ''), 
            (typeof saved === 'object' ? (saved.syncDir || 'both') : 'both')
        );
        fragment.appendChild(row);
    });

    // 2. Nạp các trường tùy biến
    const defaultPKs = new Set(defaultEntries.map(([keyString]) => keyString.split(',')[0].trim()));
    Object.keys(savedFields).forEach(primaryKey => {
        if (!defaultPKs.has(primaryKey)) {
            const saved = savedFields[primaryKey];
            const label = (saved && typeof saved === 'object') ? (saved.label || '') : '';
            if (label.includes('Calc:') || label.includes('🛠️')) return;

            const row = createRowDOM(
                primaryKey, 
                (typeof saved === 'object' ? saved.value : (saved || '')), 
                label, 
                (typeof saved === 'object' ? saved.sync : ''), 
                (typeof saved === 'object' ? (saved.syncDir || 'both') : 'both')
            );
            fragment.appendChild(row);
        }
    });

    container.innerHTML = '';
    container.appendChild(fragment);

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
