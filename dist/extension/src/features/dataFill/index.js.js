/**
 * @file index.js (src/features/dataFill/)
 * @desc Entry point cho module DataFill.
 */
import { initSyncEngine } from "/src/features/dataFill/syncEngine.js.js";
export { renderDataFillTabs } from "/src/features/dataFill/dataFillUI.js.js";
export { doFillData, doSyncData } from "/src/features/dataFill/syncEngine.js.js";

export function initDataFill() {
    initSyncEngine();
}
