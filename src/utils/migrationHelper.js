import { Storage } from './storage.js';
import { SK_DATA_DEF, LOCAL_KEY_DEFAULT_FIELDS, DEFAULT_LABELS } from '../core/constants.js';
import { DEFAULT_DATA } from '../core/defaults.js';
import { logger } from './logger.js';

/**
 * @desc Đồng bộ cấu hình từ mã nguồn vào phân vùng lưu trữ LocalStorage.
 * Nếu đang ở DEV mode -> ghi đè cả value (Dễ debug).
 * Nếu không phải DEV mode -> chỉ Smart Merge (chèn key mới chưa tồn tại).
 */
export function initStorageMerge() {
    let devMode = false;
    try {
        devMode = import.meta.env.DEV;
    } catch(e) {
        devMode = false;
    }

    if (devMode) {
        logger.info('[Migration] Dev mode active - Syncing configurations...');
    }

    // 1. Merge SK_DATA_DEF (AutoFill Default Data)
    let currentDataDef = Storage.get(SK_DATA_DEF);
    if (currentDataDef) {
        let isModified = false;
        Object.keys(DEFAULT_DATA).forEach(key => {
            const hardCodeVal = DEFAULT_DATA[key];
            if (!(key in currentDataDef)) {
                // Key mới hoàn toàn -> Gắn vào
                currentDataDef[key] = hardCodeVal;
                isModified = true;
            } else if (devMode) {
                // Đang Code Dev -> Bắt buộc overwrite value cũ trong Store theo mã nguồn mới nhất
                // Note: hardCodeVal có thể là string hoặc Object { label, value }
                
                const cVal = currentDataDef[key];
                const hVal_isObj = (hardCodeVal && typeof hardCodeVal === 'object');
                const cVal_isObj = (cVal && typeof cVal === 'object');
                
                let valHasChanged = false;
                if (!hVal_isObj && !cVal_isObj) {
                    valHasChanged = (cVal !== hardCodeVal);
                } else if (hVal_isObj && cVal_isObj) {
                    valHasChanged = (cVal.value !== hardCodeVal.value || cVal.label !== hardCodeVal.label);
                } else {
                    valHasChanged = true;
                }
                
                if (valHasChanged) {
                    currentDataDef[key] = hardCodeVal;
                    isModified = true;
                }
            }
        });
        if (isModified) {
            Storage.set(SK_DATA_DEF, currentDataDef);
        }
    }

    // 2. Merge LOCAL_KEY_DEFAULT_FIELDS (VNPT Widget Form Data overrides cho Mặc Định)
    let currentFieldsDef = Storage.get(LOCAL_KEY_DEFAULT_FIELDS);
    if (currentFieldsDef) {
        let isModified = false;
        Object.keys(DEFAULT_DATA).forEach(key => {
            const item = DEFAULT_DATA[key];
            const hardCodeVal = (item && typeof item === 'object') ? item.value : item;
            const hardCodeLbl = (item && typeof item === 'object') ? item.label : (DEFAULT_LABELS[key] || '');

            if (!(key in currentFieldsDef)) {
                currentFieldsDef[key] = { label: hardCodeLbl, value: hardCodeVal, sync: '' };
                isModified = true;
            } else if (devMode) {
                const cField = currentFieldsDef[key];
                if (cField.value !== hardCodeVal || cField.label !== hardCodeLbl) {
                    currentFieldsDef[key] = { label: hardCodeLbl, value: hardCodeVal, sync: cField.sync || '' };
                    isModified = true;
                }
            }
        });
        if (isModified) {
            Storage.setDebounced(LOCAL_KEY_DEFAULT_FIELDS, currentFieldsDef, 0); // Lưu ngay lập tức
        }
    }
}
