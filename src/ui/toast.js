/**
 * @file toast.js
 * @desc Hiển thị thông báo (toast) nhỏ gọn.
 *       Đã tối ưu: Hỗ trợ cộng dồn (stacking) nhiều thông báo cùng lúc.
 *       Smart grouping: Gộp các toast giống nhau và hiển thị số lần.
 */

let toastContainer = null;
const activeToasts = new Map(); // Map<messageKey, {element, count, timer}>

/**
 * Hiển thị thông báo dạng toast
 * @param {string} msg Nội dung thông báo
 * @param {string} color Màu nền (Hex/CSS color)
 * @param {number} duration Thời gian hiển thị (ms)
 */
export function showToast(msg, color = '#198754', duration = 2500) {
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'vnpt-toast-container';
        Object.assign(toastContainer.style, {
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column-reverse', // Thông báo mới ở dưới cùng, đẩy cũ lên
            alignItems: 'center',
            gap: '8px',
            zIndex: '1000000',
            pointerEvents: 'none'
        });
        document.body.appendChild(toastContainer);
    }

    // Create unique key for grouping (message + color)
    const toastKey = `${msg}|${color}`;

    // Check if same toast already exists
    if (activeToasts.has(toastKey)) {
        const existing = activeToasts.get(toastKey);
        existing.count++;

        // Update badge
        const badge = existing.element.querySelector('.toast-badge');
        if (badge) {
            badge.textContent = `×${existing.count}`;
            badge.style.display = 'inline-block';

            // Animate badge
            badge.style.transform = 'scale(1.3)';
            setTimeout(() => {
                badge.style.transform = 'scale(1)';
            }, 150);
        }

        // Clear old timer and set new one
        clearTimeout(existing.timer);
        existing.timer = setTimeout(() => {
            fadeOutAndRemove(existing.element, toastKey);
        }, duration);

        // Reset opacity
        existing.element.style.opacity = '1';
        existing.element.style.transform = 'translateY(0)';

        return;
    }

    // Create new toast
    const t = document.createElement('div');
    t.innerHTML = `
        <span class="toast-message">${msg}</span>
        <span class="toast-badge" style="display: none;">×1</span>
    `;

    Object.assign(t.style, {
        background: color,
        color: '#fff',
        padding: '8px 18px',
        borderRadius: '24px',
        opacity: '0',
        transform: 'translateY(10px)',
        transition: 'opacity 0.3s, transform 0.3s',
        fontSize: '13px',
        fontWeight: '500',
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        whiteSpace: 'nowrap',
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    });

    // Style badge
    const badge = t.querySelector('.toast-badge');
    Object.assign(badge.style, {
        background: 'rgba(255,255,255,0.25)',
        padding: '2px 6px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '700',
        transition: 'transform 0.15s'
    });

    toastContainer.appendChild(t);

    // Fade in
    requestAnimationFrame(() => {
        t.style.opacity = '1';
        t.style.transform = 'translateY(0)';
    });

    // Store in active toasts
    const timer = setTimeout(() => {
        fadeOutAndRemove(t, toastKey);
    }, duration);

    activeToasts.set(toastKey, {
        element: t,
        count: 1,
        timer: timer
    });
}

function fadeOutAndRemove(element, toastKey) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(-10px)';

    setTimeout(() => {
        element.remove();
        activeToasts.delete(toastKey);

        // Clean up container if empty
        if (toastContainer && toastContainer.childNodes.length === 0) {
            // Keep container for reuse
        }
    }, 300);
}
