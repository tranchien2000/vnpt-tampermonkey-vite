/**
 * @file index.js (src/features/dataFill/)
 * @desc Entry point cho module DataFill.
 */
import { initSyncEngine } from './syncEngine.js';
export { renderDataFillTabs } from './dataFillUI.js';
export { doFillData, doSyncData } from './syncEngine.js';

export function initDataFill() {
    initSyncEngine();
}
