/**
 * @file dragDrop.js
 * @desc Xử lý kéo thả (drag & drop) cho hai widget DOCX và Calc.
 *       Hỗ trợ dock/snap vào cạnh dưới màn hình, giới hạn phạm vi di chuyển,
 *       lưu vị trí vào localStorage (LOCAL_KEY_POS, SK_POS_CALC).
 * @exports makeDraggable  — Kích hoạt kéo thả cho một element với handle cụ thể
 * @exports initDragDrop    — Hàm wrapper khởi tạo cho widget DOCX
 * @seeAlso core/state.js (AppState.hasDragged), ui/widget.js (host)
 */
// src/ui/dragDrop.js
import { AppState } from '../core/state.js';
import { LOCAL_KEY_POS } from '../core/constants.js';
import { Storage } from '../utils/storage.js';

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

        // Nếu click vào input, button, select... thì không kéo để nhường sự kiện focus/click
        const isInteractive = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable;
        if (isInteractive) return;

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

        const isRightAnchor = widgetEl.id === 'vnpt-docx-widget';
        let pWidth = widgetEl.offsetWidth || 0;

        if (isRightAnchor) {
            let btnSpace = iconWidth + 6;
            let minX = btnSpace - pWidth;
            let maxX = w - pWidth + 6;
            if (newX < minX) newX = minX;
            if (newX > maxX) newX = maxX;
        } else {
            pWidth = pWidth || 200;
            if (newX < 0) newX = 0;
            if (newX + pWidth > w) newX = Math.max(0, w - pWidth);
        }

        let shouldDock = isDocked;
        if (isRightAnchor) {
            shouldDock = false; // Disable docking for vnpt-docx-widget completely
        } else {
            if (!isDocked) {
                if (e.clientY > h - 10) shouldDock = true;
            } else {
                if (e.clientY < h - 40) shouldDock = false;
            }
        }

        if (newY < 0) newY = 0;

        if (shouldDock) {
            setDocked(true);
            widgetEl.style.top = (h - widgetEl.offsetHeight) + 'px';
            if (isRightAnchor) {
                widgetEl.style.right = (w - newX - pWidth) + 'px';
                widgetEl.style.left = 'auto';
            } else {
                widgetEl.style.left = newX + 'px';
                widgetEl.style.right = 'auto';
            }
            widgetEl.style.bottom = 'auto';
        } else {
            setDocked(false);
            
            // Evaluate height AFTER undocking (in case it expanded)
            let pHeight = widgetEl.offsetHeight || 40;
            // Widget DOCX có thể kéo được panel ra khỏi màn hình, chỉ giữ lại toggleBtn (top: 10)
            let bottomLimit;
            if (isRightAnchor) {
                bottomLimit = 10 + iconHeight;
            } else {
                const tb = widgetEl.querySelector('.cw-title-bar');
                bottomLimit = tb ? tb.offsetHeight : pHeight;
            }
            if (newY + bottomLimit > h) newY = Math.max(0, h - bottomLimit);

            widgetEl.style.top = newY + 'px';
            if (isRightAnchor) {
                widgetEl.style.right = (w - newX - pWidth) + 'px';
                widgetEl.style.left = 'auto';
            } else {
                widgetEl.style.left = newX + 'px';
                widgetEl.style.right = 'auto';
            }
            widgetEl.style.bottom = 'auto';
        }
    });

    document.addEventListener('mouseup', function () {
        if (!isDragging) return;
        isDragging = false;
        document.body.style.userSelect = '';
        
        if (handleEls) handleEls.forEach(el => el.style.cursor = 'grab');

        if (storageKey) {
            const isRightAnchor = widgetEl.id === 'vnpt-docx-widget';
            Storage.set(storageKey, {
                left: isRightAnchor ? undefined : widgetEl.style.left,
                right: isRightAnchor ? widgetEl.style.right : undefined,
                top: widgetEl.style.top,
                x: isRightAnchor ? undefined : parseFloat(widgetEl.style.left),
                y: parseFloat(widgetEl.style.top),
                docked: isDocked
            });
        }
    });

    return { isDocked: () => isDocked, setDocked };
}

export function initDragDrop() {
    if (AppState.widget && AppState.header && AppState.toggleBtn) {
        makeDraggable(AppState.widget, [AppState.header, AppState.toggleBtn], LOCAL_KEY_POS);

        window.addEventListener('resize', () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const toggleBtn = document.getElementById('vnpt-toggle-btn');
            const iconWidth = toggleBtn ? toggleBtn.offsetWidth : 40;
            const iconHeight = toggleBtn ? toggleBtn.offsetHeight : 40;

            let rect = AppState.widget.getBoundingClientRect();
            let newX = rect.left;
            let newY = rect.top;

            let pWidth = AppState.widget.offsetWidth || 0;
            let btnSpace = iconWidth + 6;
            let minX = btnSpace - pWidth;
            let maxX = w - pWidth + 6;
            
            if (newX < minX) newX = minX;
            if (newX > maxX) newX = maxX;
            if (newY + 10 + iconHeight > h) newY = Math.max(0, h - (10 + iconHeight));

            AppState.widget.style.right = (w - newX - pWidth) + 'px';
            AppState.widget.style.top = newY + 'px';
        });
    }
}
