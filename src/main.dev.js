import { logger } from './utils/logger.js';
import { injectStyles } from './ui/styles.js';
import { initWidget } from './ui/widget.js';
import { initDragDrop } from './ui/dragDrop.js';
import { initFieldsManager, loadSavedData } from './features/fieldsManager.js';
import { initWebScanner } from './features/webScanner.js';
import { initDocExport } from './features/docExport.js';
import { setupAutoFillForm } from './features/autoFillForm.js';
import { initCalcWidget } from './features/calcWidgetFeature.js';

function init() {
  // Chống chạy 2 lần
  if (window.__vnptInited) return;
  window.__vnptInited = true;

  logger.info('Initializing VNPT Userscript (DEV)...');

  try {
    injectStyles();
    initWidget();
    initDragDrop();
    initFieldsManager();
    loadSavedData();
    initWebScanner();
    initDocExport();
    setupAutoFillForm();
    initCalcWidget();
    logger.info('Userscript initialized successfully.');
  } catch (error) {
    logger.error('Error during userscript initialization:', error);
  }
}

// Expose ra global để dev.user.js gọi sau nếu cần
window.__vnptInit = init;

// Tự động chạy khi load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
