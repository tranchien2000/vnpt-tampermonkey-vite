/**
 * @file mailScanner.js
 * @desc Trích xuất nội dung email từ Gmail và Outlook.
 *       Có 2 chế độ:
 *       1. getMailData()      — Scrape DOM trực tiếp (dùng khi đang ở tab mail)
 *       2. injectMailBridge() — Inject nút "Gửi sang VNPT" lên Gmail/Outlook,
 *          khi click sẽ lưu dữ liệu qua GM_setValue để tab VNPT đọc được.
 */

import { BridgeStore } from "/src/utils/bridgeStore.js.js";

const GM_MAIL_KEY = 'vnpt_pending_mail_data';

// ─── Storage Key Constant ──────────────────────────────────────────────────
export const MAIL_BRIDGE_KEY = GM_MAIL_KEY;

// ──────────────────────────────────────────────────────────────────────────
// 1. SCRAPE DOM — ĐƯỢC GỌI TRỰC TIẾP TRÊN TAB MAIL
// ──────────────────────────────────────────────────────────────────────────

/**
 * Cào nội dung email từ DOM của tab Gmail/Outlook hiện tại.
 * @returns {{ subject: string, body: string, sender: string, attachmentUrls: Array }}
 */
export function getMailData() {
    const host = window.location.hostname;
    let data = { subject: '', body: '', sender: '', attachmentUrls: [] };

    try {
        if (host.includes('mail.google.com')) {
            // Gmail Selectors
            const bodyEl    = document.querySelector('.a3s.aiL');
            const subjectEl = document.querySelector('h2.hP');
            const senderEl  = document.querySelector('.gD');

            data.body    = bodyEl    ? bodyEl.innerText    : '';
            data.subject = subjectEl ? subjectEl.innerText : '';
            data.sender  = senderEl  ? (senderEl.getAttribute('email') || senderEl.innerText) : '';

            // Tìm tệp đính kèm của Gmail
            document.querySelectorAll('.a98, .a7K').forEach(el => {
                const link = el.closest('a') || el.querySelector('a');
                if (link && link.href && !link.href.includes('support.google.com')) {
                    data.attachmentUrls.push({
                        url: link.href,
                        name: el.innerText.split('\n')[0].trim() || 'Tệp đính kèm'
                    });
                }
            });

        } else if (
            host.includes('outlook.live.com') ||
            host.includes('outlook.office.com') ||
            host.includes('outlook.office365.com')
        ) {
            // Outlook Selectors
            const bodyEl    = document.querySelector('[role="main"]');
            const subjectEl = document.querySelector('[data-automation-id="subject"]');
            const senderEl  = document.querySelector('[data-automation-id="from"]');

            data.body    = bodyEl    ? bodyEl.innerText    : '';
            data.subject = subjectEl ? subjectEl.innerText : '';
            data.sender  = senderEl  ? senderEl.innerText  : '';

            // Tìm tệp đính kèm của Outlook
            document.querySelectorAll('[data-automation-id="AttachmentCard"]').forEach(card => {
                const link   = card.querySelector('a');
                const nameEl = card.querySelector('[data-automation-id="attachmentName"]');
                if (link && link.href) {
                    data.attachmentUrls.push({
                        url: link.href,
                        name: nameEl ? nameEl.innerText : 'Tệp đính kèm'
                    });
                }
            });
        }
    } catch (err) {
        console.error('[VNPT] Lỗi khi bóc tách Mail:', err);
    }

    return data;
}

// ──────────────────────────────────────────────────────────────────────────
// 2. BRIDGE MODE — INJECT NÚT "GỬI SANG VNPT" VÀO GMAIL/OUTLOOK
// ──────────────────────────────────────────────────────────────────────────

const BRIDGE_BTN_ID = 'vnpt-send-to-vnpt-btn';

/**
 * Inject một nút nổi nhỏ vào Gmail hoặc Outlook.
 * Có cơ chế retry vì Gmail là SPA và DOM thay đổi liên tục.
 */
export function injectMailBridge() {
    // Đợi body sẵn sàng (Gmail SPA có thể delay render)
    _waitForBody().then(() => {
        _doInject();
        // Theo dõi và re-inject nếu Gmail router xóa mất button
        _keepAlive();
    });
}

/** Đợi document.body tồn tại (tối đa 10 giây) */
function _waitForBody() {
    return new Promise((resolve) => {
        if (document.body) { resolve(); return; }
        const obs = new MutationObserver(() => {
            if (document.body) { obs.disconnect(); resolve(); }
        });
        obs.observe(document.documentElement, { childList: true });
        setTimeout(resolve, 10000); // Fallback
    });
}

/** Re-inject button mỗi 3 giây nếu bị SPA navigation xóa */
function _keepAlive() {
    setInterval(() => {
        if (!document.getElementById(BRIDGE_BTN_ID)) {
            _doInject();
        }
    }, 3000);
}

/** Logic inject button thực sự */
function _doInject() {
    if (document.getElementById(BRIDGE_BTN_ID)) return;
    if (!document.body) return;

    const btn = document.createElement('button');
    btn.id = BRIDGE_BTN_ID;
    btn.innerHTML = '📋 Gửi sang VNPT';
    btn.title = 'Trích xuất nội dung mail này và gửi sang tab VNPT Tool';

    Object.assign(btn.style, {
        position:     'fixed',
        bottom:       '24px',
        right:        '24px',
        zIndex:       '99999',
        padding:      '10px 18px',
        background:   'linear-gradient(135deg, #4f46e5, #7c3aed)',
        color:        '#fff',
        border:       'none',
        borderRadius: '24px',
        fontSize:     '13px',
        fontWeight:   '600',
        cursor:       'pointer',
        boxShadow:    '0 4px 20px rgba(79,70,229,0.5)',
        transition:   'all 0.2s ease',
        fontFamily:   'sans-serif',
    });

    btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateY(-2px)';
        btn.style.boxShadow = '0 8px 28px rgba(79,70,229,0.65)';
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.boxShadow = '0 4px 20px rgba(79,70,229,0.5)';
    });

    btn.addEventListener('click', () => {
        const data = getMailData();

        if (!data.body && !data.subject) {
            _showBridgeToast('⚠️ Không tìm thấy nội dung mail. Hãy mở một email cụ thể!', '#f59e0b');
            return;
        }

        try {
            BridgeStore.set(GM_MAIL_KEY, JSON.stringify({
                ...data,
                _timestamp: Date.now(),
                _source: window.location.hostname
            }));

            _showBridgeToast('✅ Đã gửi! Chuyển sang tab VNPT và nhấn "📧 Quét Mail".', '#10b981');

            const orig = btn.innerHTML;
            btn.innerHTML = '✅ Đã gửi!';
            btn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
            setTimeout(() => {
                btn.innerHTML = orig;
                btn.style.background = 'linear-gradient(135deg, #4f46e5, #7c3aed)';
            }, 2500);
        } catch (err) {
            console.error('[VNPT] Lỗi BridgeStore.set:', err);
            _showBridgeToast('❌ Lỗi ghi dữ liệu. Kiểm tra lại quyền lưu trữ.', '#ef4444');
        }
    });

    document.body.appendChild(btn);
    console.log('[VNPT] Mail Bridge đã inject lên', window.location.hostname);
}



/** Toast nhỏ gọn cho Bridge (không dùng được toast của widget vì widget không có ở đây) */
function _showBridgeToast(msg, color = '#4f46e5') {
    const el = document.createElement('div');
    Object.assign(el.style, {
        position:     'fixed',
        bottom:       '80px',
        right:        '24px',
        zIndex:       '99999',
        padding:      '10px 16px',
        background:   color,
        color:        '#fff',
        borderRadius: '10px',
        fontSize:     '13px',
        fontFamily:   'sans-serif',
        fontWeight:   '500',
        boxShadow:    '0 4px 16px rgba(0,0,0,0.25)',
        maxWidth:     '320px',
        lineHeight:   '1.5',
        transition:   'opacity 0.3s',
    });
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; }, 2200);
    setTimeout(() => { el.remove(); }, 2600);
}
