/**
 * @file main.js
 * @desc Điểm khởi đầu (entry point) của UserScript.
 *       Phối hợp gọi các hàm init từ các module: injectStyles, widget,
 *       dragDrop, fieldsManager, scanners, export, và calcWidget.
 * @exports init  — Khởi tạo toàn bộ ứng dụng
 * @seeAlso ui/styles.js, ui/widget.js, features/calcWidgetFeature.js
 */
import { logger } from './utils/logger.js';
import { injectStyles } from './ui/styles.js';
import { initWidget } from './ui/widget.js';
import { initDragDrop } from './ui/dragDrop.js';
import { initFieldsManager, loadSavedData } from './features/fieldsManager.js';
import { initWebScanner } from './features/webScanner.js';
import { initDocExport } from './features/docExport.js';
import { setupAutoFillForm } from './features/autoFillForm.js';
import { initSyncEngine } from './features/dataFill/syncEngine.js';
import { initCalcWidget } from './features/calc/index.js';

function init() {
  logger.info('Initializing VNPT Userscript...');

  try {
    injectStyles();
    initWidget();        // Docx Export Widget
    initCalcWidget();    // Calculator UI (will attach to #vnpt-inline-calc)
    initDragDrop();      // Make Docx widget draggable
    initFieldsManager();
    loadSavedData();
    initWebScanner();
    initDocExport();
    setupAutoFillForm();
    
    initSyncEngine();    // Khởi tạo engine đồng bộ gõ phím ngầm
    
    logger.info('Userscript initialized successfully.');
  } catch (error) {
    logger.error('Error during userscript initialization:', error);
  }
}

// Ensure the DOM is fully loaded or run immediately if already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
