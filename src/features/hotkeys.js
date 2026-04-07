/**
 * @file hotkeys.js
 * @desc Quản lý phím tắt cho toàn bộ ứng dụng.
 *       Alt + S: Quét dữ liệu
 *       Alt + E: Xuất file
 *       Alt + W: Đóng/Mở widget
 *       Alt + F: Điền dữ liệu lên web
 */
import { showToast } from '../ui/toast.js';

export function initHotkeys() {
    window.addEventListener('keydown', (e) => {
        // Chỉ chạy nếu Alt được nhấn (không kèm Ctrl/Shift để tránh xung đột hệ thống)
        if (e.altKey && !e.ctrlKey && !e.shiftKey) {
            const key = e.key.toLowerCase();
            let matched = true;

            switch (key) {
                case 's': // Alt + S: Scan
                    document.getElementById('vnpt-btn-scan')?.click();
                    break;
                case 'e': // Alt + E: Export
                    document.getElementById('vnpt-btn-export')?.click();
                    break;
                case 'w': // Alt + W: Toggle Widget
                    document.getElementById('vnpt-toggle-btn')?.click();
                    break;
                case 'f': // Alt + F: Fill Back (Điền web)
                    document.getElementById('vnpt-btn-fill-back')?.click();
                    break;
                default:
                    matched = false;
                    break;
            }

            if (matched) {
                e.preventDefault();
                // Phím tắt thường không cần toast vì đã có effect của click, 
                // nhưng nếu widget đang đóng mà bấm S/E thì có thể báo hiệu.
            }
        }
    });
}
