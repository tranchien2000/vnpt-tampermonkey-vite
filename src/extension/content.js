// Content script entry for Chrome extension build.
// Provides minimal GM_* polyfills needed by existing code, then boots `src/main.js`.

function gmAddStyle(css) {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  return style;
}

function gmXmlHttpRequest(details) {
  const {
    method = 'GET',
    url,
    headers,
    data,
    timeout,
    onload,
    onerror,
    ontimeout,
  } = details || {};

  chrome.runtime.sendMessage(
    {
      type: 'GM_xmlhttpRequest',
      payload: { method, url, headers, data, timeout },
    },
    (res) => {
      const err = chrome.runtime.lastError;
      if (err) {
        onerror?.(err);
        return;
      }
      if (!res) {
        onerror?.(new Error('No response from service worker'));
        return;
      }
      if (res.type === 'timeout') {
        ontimeout?.();
        return;
      }
      if (res.type === 'error') {
        onerror?.(res.error);
        return;
      }
      onload?.({
        status: res.status,
        responseText: res.responseText,
        finalUrl: res.finalUrl,
      });
    }
  );
}

// Install polyfills only when missing (Tampermonkey still works as-is)
if (typeof window.GM_addStyle === 'undefined') window.GM_addStyle = gmAddStyle;
if (typeof window.GM_xmlhttpRequest === 'undefined') window.GM_xmlhttpRequest = gmXmlHttpRequest;

// Mocking GM_getValue/setValue for Extension context using localStorage
if (typeof window.GM_getValue === 'undefined') {
  window.GM_getValue = (key, defaultValue) => {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : defaultValue;
  };
}
if (typeof window.GM_setValue === 'undefined') {
  window.GM_setValue = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };
}

import '../main.js';

