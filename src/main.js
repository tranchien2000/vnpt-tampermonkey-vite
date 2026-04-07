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
import { clearDOMCache } from './utils/domHelper.js';
import { debounce } from './utils/common.js';

function init() {
  // Chống chạy 2 lần
  if (window.__vnptInited) return;
  window.__vnptInited = true;

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

    // ─── DOM Cache Management ───
    // Xóa cache khi DOM thay đổi lớn (SPA navigation hoặc load form mới)
    const debouncedClearCache = debounce(() => {
        clearDOMCache();
        logger.debug('DOM Cache cleared due to mutations');
    }, 500);

    const cacheObserver = new MutationObserver((mutations) => {
        if (mutations.some(m => m.addedNodes.length > 0 || m.removedNodes.length > 0)) {
            debouncedClearCache();
        }
    });
    cacheObserver.observe(document.body, { childList: true, subtree: true });
    
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
