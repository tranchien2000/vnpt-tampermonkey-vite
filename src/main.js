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
import { initHotkeys } from './features/hotkeys.js';
import { initStorageMerge } from './utils/migrationHelper.js';

let cacheObserver = null;

function init() {
  // Chống chạy 2 lần
  if (window.__vnptInited) return;
  window.__vnptInited = true;

  logger.info('Initializing VNPT Userscript...');
  
  // Khởi chạy Smart Merge/Dev Sync cho Local Storage trước khi chốt Data
  initStorageMerge();

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
    initHotkeys();       // Khởi tạo phím tắt

    // ─── DOM Cache Management ───
    // Xóa cache khi DOM thay đổi lớn (SPA navigation hoặc load form mới)
    const debouncedClearCache = debounce(() => {
        clearDOMCache();
        logger.debug('DOM Cache cleared due to mutations');
    }, 500);

    cacheObserver = new MutationObserver((mutations) => {
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

/**
 * Cleanup function to remove all side effects of the script.
 * Used for Hot Reload (No-refresh update).
 */
function cleanup() {
  logger.info('Cleaning up VNPT Userscript for reload...');
  
  // 1. Dừng Observer
  if (cacheObserver) {
    cacheObserver.disconnect();
    cacheObserver = null;
  }

  // 2. Xóa Widget chính
  const widget = document.getElementById('vnpt-docx-widget');
  if (widget) widget.remove();

  // 3. Xóa Calc Widget (nếu có riêng, nhưng hiện tại nó nằm trong widget chính)
  const calcWidget = document.getElementById('vnpt-calc-widget'); 
  if (calcWidget) calcWidget.remove();

  // 4. Xóa Style
  const style = document.getElementById('vnpt-styles');
  if (style) style.remove();

  // 5. Reset flag
  window.__vnptInited = false;
  
  logger.info('Cleanup completed.');
}

// Expose to window for dev.user.js
window.__vnptCleanup = cleanup;
window.__vnptInit = init;

// Ensure the DOM is fully loaded or run immediately if already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
