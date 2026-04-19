/**
 * @file backupHelper.js
 * @desc Hỗ trợ xuất/nhập toàn bộ cấu hình dự án ra file JSON.
 *       (Đã lược bỏ hệ thống Internal Backup cũ để chuyển sang Session Manager 2.0)
 */
import { 
    LOCAL_KEY_FIELDS, LOCAL_KEY_DEFAULT_FIELDS,
    SK_DATA_DEF, SK_DATA_CUS, SK_DATA_SYNC, 
    SK_TAX, SK_CALC_MAP, SK_TEMPLATES 
} from '../core/constants.js';
import { Storage } from './storage.js';
import { showToast } from '../ui/toast.js';

/**
 * Trải phẳng dữ liệu cho việc xuất file.
 */
function flattenData(obj) {
    if (!obj) return obj;
    const result = {};
    Object.keys(obj).forEach(key => {
        const val = obj[key];
        const parts = key.split(',').map(s => s.trim()).filter(s => s);
        parts.forEach(p => {
            result[p] = val;
        });
    });
    return result;
}

/**
 * Xuất toàn bộ dữ liệu ra file JSON để người dùng sao lưu thủ công.
 */
export function exportFullBackup(customFileName = '') {
    const data = {
        version: '2.0',
        timestamp: new Date().toISOString(),
        backup: {
            fields: Storage.get(LOCAL_KEY_FIELDS),
            defaultFields: Storage.get(LOCAL_KEY_DEFAULT_FIELDS),
            dataDefault: flattenData(Storage.get(SK_DATA_DEF)),
            dataCustom: flattenData(Storage.get(SK_DATA_CUS)),
            dataSync: Storage.get(SK_DATA_SYNC),
            taxRate: Storage.get(SK_TAX),
            calcMap: Storage.get(SK_CALC_MAP),
            templates: Storage.get(SK_TEMPLATES)
        }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    let fileName = customFileName || `vnpt_pro_backup_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    if (!fileName.toLowerCase().endsWith('.json')) fileName += '.json';

    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`✅ Đã xuất file sao lưu hệ thống`);
}

/**
 * Nhập dữ liệu từ file JSON.
 */
export async function importFullBackup(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.backup) throw new Error("File không đúng định dạng.");

                const b = data.backup;
                if (b.fields) Storage.set(LOCAL_KEY_FIELDS, b.fields);
                if (b.defaultFields) Storage.set(LOCAL_KEY_DEFAULT_FIELDS, b.defaultFields);
                if (b.dataDefault) Storage.set(SK_DATA_DEF, b.dataDefault);
                if (b.dataCustom) Storage.set(SK_DATA_CUS, b.dataCustom);
                if (b.dataSync) Storage.set(SK_DATA_SYNC, b.dataSync);
                if (b.taxRate) Storage.set(SK_TAX, b.taxRate);
                if (b.calcMap) Storage.set(SK_CALC_MAP, b.calcMap);
                if (b.templates) Storage.set(SK_TEMPLATES, b.templates);

                showToast("✅ Đã nhập dữ liệu thành công!", "#1e8e3e");
                resolve(true);
            } catch (err) {
                showToast("❌ Lỗi: File không hợp lệ.", "#ff5252");
                resolve(false);
            }
        };
        reader.readAsText(file);
    });
}

/**
 * Các hàm Mock để tránh lỗi ở các module chưa kịp cập nhật
 */
export function createInternalBackup() {}
export function getInternalBackups() { return []; }
export function restoreInternalBackup() { return Promise.resolve(false); }
export function deleteInternalBackup() {}
export function generateBackupName() { return ""; }
