/**
 * @file toast.js
 * @desc Hiển thị thông báo (toast) nhỏ gọn.
 *       Đã tối ưu: Hỗ trợ cộng dồn (stacking) nhiều thông báo cùng lúc.
 */

let toastContainer = null;

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

    const t = document.createElement('div');
    t.innerText = msg;
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
        pointerEvents: 'auto'
    });

    toastContainer.appendChild(t);

    // Fade in
    requestAnimationFrame(() => {
        t.style.opacity = '1';
        t.style.transform = 'translateY(0)';
    });

    // Fade out and remove
    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            t.remove();
            // Nếu không còn toast nào, xóa container để giải phóng tài nguyên (tùy chọn)
            if (toastContainer && toastContainer.childNodes.length === 0) {
                // Giữ lại container để tái sử dụng nhanh hơn
            }
        }, 300);
    }, duration);
}
