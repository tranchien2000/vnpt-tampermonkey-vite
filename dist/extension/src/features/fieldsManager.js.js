/**
 * @file fieldsManager.js
 * @desc Quản lý bảng fields (danh sách key-value-label-sync).
 *       Refactored: Chuyển đổi sang cấu trúc module trong thư mục src/features/fields/
 */

export { startFieldLinker } from "/src/features/fields/linker.js.js";
export { validateField, refreshRowValidation } from "/src/features/fields/validation.js.js";
export { addOrUpdateFieldRow, updateSyncDirIcon } from "/src/features/fields/row.js.js";
export { saveFieldsToLocal, loadSavedData, getBackupName, getExportFileName, restorePosition } from "/src/features/fields/store.js.js";
export { syncAllFields } from "/src/features/fields/sync.js.js";
export { updateUIForDefaultMode, renderCalcMappingInBanner } from "/src/features/fields/mode.js.js";
export { initFieldsManager, initColSplitter } from "/src/features/fields/ui.js.js";
export { initReverseSync, cleanupReverseSync } from "/src/features/fields/reverseSync.js.js";
