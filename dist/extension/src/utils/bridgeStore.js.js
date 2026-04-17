/**
 * Cross-context storage bridge for mail->VNPT transfer.
 * - Tampermonkey: uses GM_setValue/GM_getValue (sync)
 * - Chrome extension: uses chrome.storage.local (async)
 */

function hasChromeStorage() {
  return typeof chrome !== 'undefined' && !!chrome.storage?.local;
}

export const BridgeStore = {
  /**
   * @param {string} key
   * @returns {Promise<any|null>}
   */
  async get(key) {
    try {
      if (typeof GM_getValue !== 'undefined') {
        return GM_getValue(key, null);
      }
    } catch {
      // ignore and fallback
    }

    if (hasChromeStorage()) {
      const obj = await chrome.storage.local.get(key);
      return obj?.[key] ?? null;
    }

    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? raw : null;
    } catch {
      return null;
    }
  },

  /**
   * @param {string} key
   * @param {any} value
   * @returns {Promise<boolean>}
   */
  async set(key, value) {
    try {
      if (typeof GM_setValue !== 'undefined') {
        GM_setValue(key, typeof value === 'string' ? value : JSON.stringify(value));
        return true;
      }
    } catch {
      // ignore and fallback
    }

    if (hasChromeStorage()) {
      await chrome.storage.local.set({ [key]: value });
      return true;
    }

    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
};

