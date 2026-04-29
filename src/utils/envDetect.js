/**
 * @file envDetect.js
 * @desc Phát hiện môi trường chạy (Userscript vs Extension) và ngăn conflict khi cả 2 cùng active
 */

import { ENV_USERSCRIPT, ENV_EXTENSION, INIT_FLAG_KEY } from '../core/constants.js';

/**
 * Phát hiện môi trường đang chạy
 * @returns {string|null} 'userscript' | 'extension' | null
 */
export function detectEnvironment() {
  const hasGMInfo = typeof GM_info !== 'undefined';
  const hasChromeRuntime = typeof chrome !== 'undefined' && chrome.runtime?.id;

  if (hasGMInfo) return ENV_USERSCRIPT;
  if (hasChromeRuntime) return ENV_EXTENSION;
  return null;
}

/**
 * Kiểm tra mutual exclusion: chỉ cho phép 1 phiên bản chạy trên cùng 1 page
 * @returns {boolean} true = cho phép init, false = block init
 */
export function checkMutualExclusion() {
  const currentEnv = detectEnvironment();
  const existingEnv = window[INIT_FLAG_KEY];

  // Nếu đã có phiên bản khác đang chạy → block
  if (existingEnv && existingEnv !== currentEnv) {
    console.warn(`[VNPT] Phát hiện ${existingEnv} đã chạy, bỏ qua ${currentEnv}`);
    return false;
  }

  // Đánh dấu phiên bản hiện tại đã init
  window[INIT_FLAG_KEY] = currentEnv;
  return true;
}
