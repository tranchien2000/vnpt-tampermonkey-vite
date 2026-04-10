/**
 * @file backupHelper.js
 * @desc Hỗ trợ xuất/nhập toàn bộ cấu hình dự án ra file JSON.
 */
import { 
    LOCAL_KEY_FIELDS, LOCAL_KEY_DEFAULT_FIELDS, LOCAL_KEY_AUTO_BACKUP,
    SK_DATA_DEF, SK_DATA_CUS, SK_DATA_SYNC, 
    SK_TAX, SK_CALC_MAP, SK_TEMPLATES 
} from '../core/constants.js';
import { Storage } from './storage.js';
import { showToast } from '../ui/toast.js';

/**
 * Trải phẳng dữ liệu: Biến các key gộp "A, B" thành các key riêng lẻ "A", "B".
 * @param {Object} obj 
 * @returns {Object}
 */
function flattenData(obj) {
    if (!obj) return obj;
    const result = {};
    Object.keys(obj).forEach(key => {
        const val = obj[key];
        const parts = key.split(',').map(s => s.trim()).filter(s => s);
        parts.forEach(p => {
            // Nếu giá trị là object (label, value), giữ nguyên hoặc chỉ lấy value tùy nhu cầu
            // Ở đây giữ nguyên object để đảm bảo cấu hình đầy đủ
            result[p] = val;
        });
    });
    return result;
}

/**
 * Xuất toàn bộ dữ liệu ra file JSON.
 */
export function exportFullBackup() {
    const data = {
        version: '1.0',
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
    a.download = `vnpt_full_backup_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("✅ Đã xuất file sao lưu hệ thống.");
}

/**
 * Nhập dữ liệu từ file JSON.
 * @param {File} file 
 * @returns {Promise<boolean>}
 */
export async function importFullBackup(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.backup) throw new Error("File không đúng định dạng backup.");

                const b = data.backup;
                if (b.fields) Storage.set(LOCAL_KEY_FIELDS, b.fields);
                if (b.defaultFields) Storage.set(LOCAL_KEY_DEFAULT_FIELDS, b.defaultFields);
                if (b.dataDefault) Storage.set(SK_DATA_DEF, b.dataDefault);
                if (b.dataCustom) Storage.set(SK_DATA_CUS, b.dataCustom);
                if (b.dataSync) Storage.set(SK_DATA_SYNC, b.dataSync);
                if (b.taxRate) Storage.set(SK_TAX, b.taxRate);
                if (b.calcMap) Storage.set(SK_CALC_MAP, b.calcMap);
                if (b.templates) Storage.set(SK_TEMPLATES, b.templates);

                showToast("✅ Đã nhập dữ liệu thành công! Vui lòng tải lại trang hoặc widget.", "#1e8e3e");
                resolve(true);
            } catch (err) {
                showToast("❌ Lỗi: File sao lưu không hợp lệ.", "#ff5252");
                resolve(false);
            }
        };
        reader.readAsText(file);
    });
}

/**
 * Tạo bản sao lưu nội bộ vào localStorage (Lưu 10 bản gần nhất).
 * @param {string} name - Tên định danh bản sao lưu
 */
export function createInternalBackup(name = '') {
    let backups = Storage.get(LOCAL_KEY_AUTO_BACKUP);
    if (!Array.isArray(backups)) backups = [];
    
    const newEntry = {
        id: Date.now().toString(),
        name: name || `Bản sao lưu ${new Date().toLocaleString()}`,
        timestamp: new Date().toISOString(),
        data: {
            fields: Storage.get(LOCAL_KEY_FIELDS),
            defaultFields: Storage.get(LOCAL_KEY_DEFAULT_FIELDS)
        }
    };

    // Đưa lên đầu mảng
    backups.unshift(newEntry);
    
    // Giới hạn 10 bản
    const limitedBackups = backups.slice(0, 10);
    
    Storage.set(LOCAL_KEY_AUTO_BACKUP, limitedBackups);
    console.log(`✅ Field backup created: ${newEntry.name}`);
}

/**
 * Lấy danh sách các bản sao lưu nội bộ.
 * @returns {Array}
 */
export function getInternalBackups() {
    const backups = Storage.get(LOCAL_KEY_AUTO_BACKUP);
    if (backups && !Array.isArray(backups)) {
        // Nếu là dữ liệu cũ kiểu object, xóa đi để khởi tạo lại mảng
        Storage.remove(LOCAL_KEY_AUTO_BACKUP);
        return [];
    }
    return Array.isArray(backups) ? backups : [];
}

/**
 * Khôi phục dữ liệu từ một bản sao lưu nội bộ cụ thể.
 * @param {string} backupId - ID của bản sao lưu cần khôi phục
 * @returns {boolean}
 */
export function restoreInternalBackup(backupId) {
    const backups = getInternalBackups();
    const entry = backups.find(b => b.id === backupId);
    
    if (!entry || !entry.data) {
        showToast("⚠️ Không tìm thấy bản sao lưu hợp lệ!", "#ffc107");
        return false;
    }

    const data = entry.data;
    if (data.fields) Storage.set(LOCAL_KEY_FIELDS, data.fields);
    if (data.defaultFields) Storage.set(LOCAL_KEY_DEFAULT_FIELDS, data.defaultFields);

    showToast(`✅ Đã khôi phục các trường: ${entry.name}`, "#1e8e3e");
    return true;
}
