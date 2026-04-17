/**
 * @file main.js
 * @desc Điểm khởi đầu (entry point) của UserScript.
 *       Phối hợp gọi các hàm init từ các module: injectStyles, widget,
 *       dragDrop, fieldsManager, scanners, export, và calcWidget.
 * @exports init  — Khởi tạo toàn bộ ứng dụng
 * @seeAlso ui/styles.js, ui/widget.js, features/calcWidgetFeature.js
 */
import { logger } from "/src/utils/logger.js.js";
import { injectStyles } from "/src/ui/styles.js.js";
import { initWidget } from "/src/ui/widget.js.js";
import { initDragDrop } from "/src/ui/dragDrop.js.js";
import { initFieldsManager, loadSavedData, initReverseSync, cleanupReverseSync, restorePosition } from "/src/features/fieldsManager.js.js";
import { initWebScanner } from "/src/features/webScanner.js.js";
import { initDocExport } from "/src/features/docExport.js.js";
import { setupAutoFillForm } from "/src/features/autoFillForm.js.js";
import { initPdfScan } from "/src/features/pdfScan/index.js.js";
import { initRawScan } from "/src/features/rawScan/index.js.js";
import { initSyncEngine } from "/src/features/dataFill/syncEngine.js.js";
import { initCalcWidget } from "/src/features/calc/index.js.js";
import { clearDOMCache, refreshLabelsCache } from "/src/utils/domHelper.js.js";
import { debounce } from "/src/utils/common.js.js";
import { initHotkeys, cleanupHotkeys } from "/src/features/hotkeys.js.js";
import { cleanupSyncEngine } from "/src/features/dataFill/syncEngine.js.js";
import { cleanupWebScanner } from "/src/features/webScanner.js.js";
import { initStorageMerge } from "/src/utils/migrationHelper.js.js";
import { RemoteConfig } from "/src/api/remoteConfig.js.js";
import { injectMailBridge } from "/src/features/mailScan/mailScanner.js.js";
import { APP_VERSION } from "/src/core/constants.js.js";
import { Storage } from "/src/utils/storage.js.js";
import { showToast } from "/src/ui/toast.js.js";

/** Danh sách domain của các dịch vụ mail được hỗ trợ */
const MAIL_DOMAINS = [
  'mail.google.com',
  'outlook.live.com',
  'outlook.office.com',
  'outlook.office365.com',
];

const isMailDomain = MAIL_DOMAINS.some(d => window.location.hostname.includes(d));

let cacheObserver = null;

async function init() {
  // Chống chạy 2 lần
  if (window.__vnptInited) return;
  window.__vnptInited = true;

    logger.info('Initializing VNPT Userscript...');
    console.log('[VNPT-Debug] 1. Starting Init...');

    // Khởi chạy Smart Merge/Dev Sync cho Local Storage trước khi chốt Data
    initStorageMerge();

    try {
        RemoteConfig.init(); // Tải Selectors từ Cloud (Asynchronous)
        injectStyles();
        console.log('[VNPT-Debug] 2. Styles injected.');
        initWidget();        // Docx Export Widget
        console.log('[VNPT-Debug] 3. Widget created.');
        restorePosition();   // Khôi phục vị trí widget
        initCalcWidget();    // Calculator UI
        initDragDrop();
        initFieldsManager();
        console.log('[VNPT-Debug] 4. FieldsManager initialized.');
        initReverseSync();
        
        // Để một chút thời gian cho Widget render HTML xong
        setTimeout(() => {
            loadSavedData();
            console.log('[VNPT-Debug] 5. Data loaded.');
        }, 100);
    initWebScanner();
    initDocExport();
    setupAutoFillForm();
    initPdfScan();
    initRawScan();

    initSyncEngine();    // Khởi tạo engine đồng bộ gõ phím ngầm
    initHotkeys();       // Khởi tạo phím tắt

    // ─── Post-Update Notification ───
    const lastRunVersion = Storage.get('vnpt_last_run_version');
    if (lastRunVersion && lastRunVersion !== APP_VERSION) {
      showToast(`🚀 Hợp đồng VNPT đã cập nhật lên v${APP_VERSION}!`, "#1a73e8");
    }
    Storage.set('vnpt_last_run_version', APP_VERSION);

    // ─── Pre-Update Prompt (F5 Check) ───
    /* 
    setTimeout(async () => {
      // Kiểm tra xem trong phiên làm việc này (session) đã nhắc chưa
      if (sessionStorage.getItem('vnpt_update_skipped')) return;

      if (RemoteConfig.hasUpdate()) {
        const confirmed = confirm(`[VNPT PRO] Đã có phiên bản mới v${RemoteConfig.info.latestVersion}.\n\nLời nhắn: ${RemoteConfig.info.message || 'Không có mô tả.'}\n\nBạn có muốn cập nhật ngay không?`);
        if (confirmed) {
          if (RemoteConfig.info.updateUrl) {
            window.open(RemoteConfig.info.updateUrl, '_blank');
          } else {
            showToast("Vui lòng click vào badge NEW để cập nhật!", "#ea4335");
          }
        } else {
          // Nếu user bấm Cancel, không nhắc lại trong session này để tránh phiền
          sessionStorage.setItem('vnpt_update_skipped', 'true');
        }
      }
    }, 2000); // Đợi 2s để RemoteConfig hoàn thành fetch ngầm
    */

    // ─── DOM Cache Management ───
    // Xóa cache khi DOM thay đổi lớn (SPA navigation hoặc load form mới)
    // Tăng debounce lên 1500ms để tránh việc xóa cache quá liên tục khi trang web đang render
    const debouncedClearCache = debounce(() => {
      clearDOMCache();
      refreshLabelsCache(); // Cập nhật luôn cả danh sách label
      logger.debug('DOM Cache & Labels refreshed due to mutations');
    }, 1500);

    cacheObserver = new MutationObserver((mutations) => {
      // Chỉ trigger nếu có thêm/bớt Node lớn (không phải text change)
      const hasSignificantChange = mutations.some(m => {
        if (m.addedNodes.length > 0 || m.removedNodes.length > 0) {
          // Kiểm tra xem có phải là thẻ script/style không (bỏ qua)
          const nodes = [...m.addedNodes, ...m.removedNodes];
          return nodes.some(n => n.nodeType === 1 && !['SCRIPT', 'STYLE', 'LINK'].includes(n.tagName));
        }
        return false;
      });

      if (hasSignificantChange) {
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

  // 1.1 Gỡ global listeners (tránh bị bind nhiều lần khi hot reload)
  try { cleanupWebScanner(); } catch (e) { /* ignore */ }
  try { cleanupReverseSync(); } catch (e) { /* ignore */ }
  try { cleanupSyncEngine(); } catch (e) { /* ignore */ }
  try { cleanupHotkeys(); } catch (e) { /* ignore */ }

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
  document.addEventListener('DOMContentLoaded', () => {
    if (isMailDomain) {
      injectMailBridge(); // Chế độ nhẹ: Chỉ inject nút "Gửi sang VNPT" trên trang mail
    } else {
      init();             // Chế độ đầy đủ: Load toàn bộ widget VNPT
    }
  });
} else {
  if (isMailDomain) {
    injectMailBridge();
  } else {
    init();
  }
}
