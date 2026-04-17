/**
 * @file fieldsManager.js
 * @desc Quản lý bảng fields (danh sách key-value-label-sync).
 *       Refactored: Chuyển đổi sang cấu trúc module trong thư mục src/features/fields/
 */

export { startFieldLinker } from './fields/linker.js';
export { validateField, refreshRowValidation } from './fields/validation.js';
export { addOrUpdateFieldRow, updateSyncDirIcon } from './fields/row.js';
export { saveFieldsToLocal, loadSavedData, getBackupName, getExportFileName, restorePosition } from './fields/store.js';
export { syncAllFields } from './fields/sync.js';
export { updateUIForDefaultMode, renderCalcMappingInBanner } from './fields/mode.js';
export { initFieldsManager, initColSplitter } from './fields/ui.js';
export { initReverseSync, cleanupReverseSync } from './fields/reverseSync.js';
