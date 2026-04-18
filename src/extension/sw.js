/**
 * @file sw.js
 * @desc Background Service Worker cho VNPT PRO Extension (Manifest v3).
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('🚀 VNPT Word Automation PRO Extension đã được cài đặt!');
});

// Lắng nghe tin nhắn từ Content Script nếu cần
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ping') {
    sendResponse({ status: 'pong' });
  }
  return true;
});

// Xử lý khi icon extension được click (nếu không có popup)
chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes('vnpt.vn')) {
    chrome.tabs.sendMessage(tab.id, { action: 'toggle_widget' });
  }
});
