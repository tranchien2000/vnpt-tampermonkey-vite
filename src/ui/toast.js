/**
 * @file toast.js
 * @desc Hiển thị thông báo (toast) nhỏ gọn ở cạnh dưới màn hình.
 * @exports showToast  — Tạo DOM thông báo, hiện thị với hiệu ứng transition và tự động remove
 */
// src/ui/toast.js

export function showToast(msg, color = '#198754') {
    const t = document.createElement('div');
    t.innerText = msg;
    Object.assign(t.style, {
        position: 'fixed', 
        bottom: '20px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        background: color, 
        color: '#fff', 
        padding: '7px 16px', 
        borderRadius: '20px',
        zIndex: '100000', 
        opacity: '0', 
        transition: 'opacity .25s',
        fontSize: '13px', 
        fontFamily: "'Segoe UI',sans-serif", 
        boxShadow: '0 4px 14px rgba(0,0,0,.25)'
    });
    document.body.appendChild(t);
    setTimeout(() => t.style.opacity = '1', 30);
    setTimeout(() => { 
        t.style.opacity = '0'; 
        setTimeout(() => t.remove(), 280); 
    }, 2200);
}
