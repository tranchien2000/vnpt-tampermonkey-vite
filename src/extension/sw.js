// Service worker for Chrome Extension (MV3).
// Handles GM_xmlhttpRequest proxy to bypass page CORS.

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.type !== 'GM_xmlhttpRequest') return;

  (async () => {
    const { method, url, headers, data, timeout } = msg.payload || {};
    const controller = new AbortController();
    const t = timeout ? setTimeout(() => controller.abort('timeout'), timeout) : null;

    try {
      const res = await fetch(url, {
        method: method || 'GET',
        headers: headers || undefined,
        body: data !== undefined ? data : undefined,
        signal: controller.signal,
        // credentials are not allowed in extension fetch cross-origin; keep default
      });

      const text = await res.text();
      sendResponse({
        type: 'ok',
        status: res.status,
        responseText: text,
        finalUrl: res.url,
      });
    } catch (e) {
      if (String(e?.name || '').includes('AbortError') || String(e) === 'timeout') {
        sendResponse({ type: 'timeout' });
      } else {
        sendResponse({ type: 'error', error: String(e?.message || e) });
      }
    } finally {
      if (t) clearTimeout(t);
    }
  })();

  return true; // keep channel open
});

