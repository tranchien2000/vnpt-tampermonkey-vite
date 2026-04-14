import { AppState } from '../../core/state.js';
import { Storage } from '../../utils/storage.js';
import {
    LOCAL_KEY_FIELDS, LOCAL_KEY_DEFAULT_FIELDS, LOCAL_KEY_POS,
    DEFAULT_LABELS, SK_DATA_DEF
} from '../../core/constants.js';
import { addOrUpdateFieldRow } from './row.js';

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
        const syncDirEl = row.querySelector('.btn-sync-dir');
        const syncDir = syncDirEl ? syncDirEl.getAttribute('data-dir') : 'both';
        if (k) data[k] = { label: l, value: v, sync: s, syncDir: syncDir };
    });
    Storage.setDebounced(key, data, 1000);

    if (AppState.isDefaultMode) {
        Storage.setDebounced(SK_DATA_DEF, data, 1000);
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

export function loadSavedData() {
    try {
        AppState.fieldsContainer.innerHTML = '';
        const savedFields = Storage.get(LOCAL_KEY_FIELDS) || {};

        Object.keys(DEFAULT_LABELS).forEach(key => {
            const label = DEFAULT_LABELS[key];
            const saved = savedFields[key];
            if (saved && typeof saved === 'object') {
                addOrUpdateFieldRow(key, saved.value, saved.label || label, saved.sync || '', saved.syncDir || 'both');
            } else if (saved) {
                addOrUpdateFieldRow(key, saved, label, '', 'both');
            } else {
                addOrUpdateFieldRow(key, '', label, '', 'both');
            }
        });

        Object.keys(savedFields).forEach(key => {
            if (!(key in DEFAULT_LABELS)) {
                const saved = savedFields[key];
                if (typeof saved === 'object') {
                    addOrUpdateFieldRow(key, saved.value, saved.label, saved.sync || '', saved.syncDir || 'both');
                } else {
                    addOrUpdateFieldRow(key, saved, '', '', 'both');
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
