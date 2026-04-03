// src/ui/dragDrop.js
import { AppState } from '../core/state.js';
import { LOCAL_KEY_POS } from '../core/constants.js';

const DOCK_THRESHOLD = 60; // px từ cạnh dưới màn hình để kích hoạt dock

export function makeDraggable(widgetEl, handleEls, storageKey, onDragStartCallback = null, onDockChange = null) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    let isDocked = false;

    function setDocked(docked) {
        if (isDocked === docked) return;
        isDocked = docked;
        if (onDockChange) onDockChange(docked);
    }

    function startDrag(e) {
        if (e.button !== 0) return; // Chỉ nhận click chuột trái
        isDragging = true;
        
        // Cập nhật state toàn cục để UI khác biết đang drag (ví dụ toggleBtn)
        AppState.hasDragged = false;
        
        const rect = widgetEl.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        document.body.style.userSelect = 'none';

        if (handleEls) {
            handleEls.forEach(el => el.style.cursor = 'grabbing');
        }
        
        if (onDragStartCallback) onDragStartCallback();
        e.preventDefault();
    }

    handleEls.forEach(el => {
        el.addEventListener('mousedown', startDrag);
    });

    document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        AppState.hasDragged = true;

        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;

        const w = window.innerWidth;
        const h = window.innerHeight;

        const toggleBtn = document.getElementById('vnpt-toggle-btn');
        const iconWidth = toggleBtn ? toggleBtn.offsetWidth : 40;
        const iconHeight = toggleBtn ? toggleBtn.offsetHeight : 40;

        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + iconWidth > w) newX = w - iconWidth;
        if (newY + iconHeight > h) newY = h - iconHeight;

        // Phát hiện kéo vào vùng dock (cạnh dưới) dựa trên vị trí chuột, tránh nhấp nháy 
        let shouldDock = isDocked;

        if (!isDocked) {
            // Nếu chuột tiến vào sát đáy màn hình (cách đáy 10px)
            if (e.clientY > h - 10) {
                shouldDock = true;
            }
        } else {
            // Nếu đang dock, kéo chuột lên cách đáy > 40px mới undock
            if (e.clientY < h - 40) {
                shouldDock = false;
            }
        }

        if (shouldDock) {
            setDocked(true);
            // Bám dính vào đáy
            widgetEl.style.top = (h - widgetEl.offsetHeight) + 'px';
            widgetEl.style.left = newX + 'px';
            widgetEl.style.right = 'auto';
            widgetEl.style.bottom = 'auto';
        } else {
            setDocked(false);
            // Giữ nguyên newY theo hướng chuột, không giới hạn để chuột luôn trùng khớp title bar
            widgetEl.style.top = newY + 'px';
            widgetEl.style.left = newX + 'px';
            widgetEl.style.right = 'auto';
            widgetEl.style.bottom = 'auto';
        }
    });

    document.addEventListener('mouseup', function () {
        if (!isDragging) return;
        isDragging = false;
        document.body.style.userSelect = '';
        
        if (handleEls) {
            handleEls.forEach(el => el.style.cursor = 'grab');
        }

        if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify({
                left: widgetEl.style.left,
                top: widgetEl.style.top,
                x: parseFloat(widgetEl.style.left),
                y: parseFloat(widgetEl.style.top),
                docked: isDocked
            }));
        }
    });

    // Trả về hàm để kiểm tra / set dock state từ bên ngoài
    return { isDocked: () => isDocked, setDocked };
}

export function initDragDrop() {
    // Tích hợp Drag & Drop cho Docx Widget
    if (AppState.widget && AppState.header && AppState.toggleBtn) {
        makeDraggable(AppState.widget, [AppState.header, AppState.toggleBtn], LOCAL_KEY_POS);

        // Bắt sự kiện resize màn hình để đẩy cái nút vào trong nều ở ngoài (ví dụ thu vào)
        window.addEventListener('resize', () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const toggleBtn = document.getElementById('vnpt-toggle-btn');
            const iconWidth = toggleBtn ? toggleBtn.offsetWidth : 40;
            const iconHeight = toggleBtn ? toggleBtn.offsetHeight : 40;

            let rect = AppState.widget.getBoundingClientRect();
            let newX = rect.left;
            let newY = rect.top;

            if (newX + iconWidth > w) newX = Math.max(0, w - iconWidth);
            if (newY + iconHeight > h) newY = Math.max(0, h - iconHeight);

            AppState.widget.style.left = newX + 'px';
            AppState.widget.style.top = newY + 'px';
        });
    }
}
