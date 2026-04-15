/**
 * @file hotkeys.js
 * @desc Quản lý phím tắt động cho toàn bộ ứng dụng.
 *       Hỗ trợ cấu hình phím tắt, lưu trữ và ghi nhận phím mới từ UI.
 */
import { Storage } from '../utils/storage.js';
import { SK_HOTKEYS } from '../core/constants.js';
import { DEFAULT_HOTKEYS } from '../core/defaults.js';
import { showToast } from '../ui/toast.js';

let isRecording = false;
let currentRecordingAction = null;
let recordingCallback = null;
let keydownHandler = null;

/**
 * Khởi tạo hệ thống phím tắt
 */
export function initHotkeys() {
    if (keydownHandler) return; // Prevent duplicate listeners (hot reload)

    keydownHandler = (e) => {
        // Nếu đang ở chế độ ghi phím tắt
        if (isRecording && recordingCallback) {
            handleRecording(e);
            return;
        }

        const hotkeys = Storage.get(SK_HOTKEYS, DEFAULT_HOTKEYS);
        
        // Duyệt qua các action để tìm phím khớp
        for (const [action, config] of Object.entries(hotkeys)) {
            if (isMatch(e, config)) {
                e.preventDefault();
                executeAction(action);
                return;
            }
        }
    };

    window.addEventListener('keydown', keydownHandler);
}

export function cleanupHotkeys() {
    if (!keydownHandler) return;
    window.removeEventListener('keydown', keydownHandler);
    keydownHandler = null;
}

/**
 * Kiểm tra xem sự kiện phím có khớp với cấu hình không
 */
function isMatch(e, config) {
    if (!config || !config.key) return false;
    
    // So sánh phím (không phân biệt hoa thường)
    const keyMatch = e.key.toLowerCase() === config.key.toLowerCase();
    
    // So sánh các phím bổ trợ
    const altMatch = !!e.altKey === !!config.altKey;
    const ctrlMatch = !!e.ctrlKey === !!config.ctrlKey;
    const shiftMatch = !!e.shiftKey === !!config.shiftKey;
    
    return keyMatch && altMatch && ctrlMatch && shiftMatch;
}

/**
 * Thực thi hành động tương ứng
 */
function executeAction(action) {
    switch (action) {
        case 'SCAN':
            document.getElementById('vnpt-btn-scan')?.click();
            break;
        case 'FILL':
            document.getElementById('vnpt-btn-fill-back')?.click();
            break;
        case 'SCAN_PDF':
            document.getElementById('vnpt-btn-scan-pdf')?.click();
            break;
        case 'EXPORT_DOCX':
            document.getElementById('vnpt-btn-export')?.click();
            break;
        case 'COPY_TXT':
            document.getElementById('vnpt-btn-export-txt')?.click();
            break;
        case 'TOGGLE':
            document.getElementById('vnpt-toggle-btn')?.click();
            break;
        case 'CLEAN':
            document.getElementById('vnpt-btn-clean-data')?.click();
            break;
    }
}

/**
 * Bắt đầu chế độ ghi phím tắt
 */
export function startRecording(action, callback) {
    isRecording = true;
    currentRecordingAction = action;
    recordingCallback = callback;
    showToast('Vui lòng nhấn tổ hợp phím mong muốn...', 'info');
}

/**
 * Xử lý khi đang ghi phím
 */
function handleRecording(e) {
    // Không ghi nhận nếu chỉ nhấn phím bổ trợ đơn thuần
    if (['Alt', 'Control', 'Shift', 'Meta'].includes(e.key)) return;

    e.preventDefault();
    e.stopPropagation();

    const newConfig = {
        key: e.key.toLowerCase(),
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey
    };

    // Lưu vào storage
    const hotkeys = Storage.get(SK_HOTKEYS, DEFAULT_HOTKEYS);
    hotkeys[currentRecordingAction] = { 
        ...hotkeys[currentRecordingAction], 
        ...newConfig 
    };
    Storage.set(SK_HOTKEYS, hotkeys);

    // Dừng ghi
    const actionLabel = hotkeys[currentRecordingAction]?.label || currentRecordingAction;
    showToast(`Đã lưu phím tắt cho ${actionLabel}: ${getHotkeyString(newConfig)}`, 'success');
    
    if (recordingCallback) recordingCallback(newConfig);
    
    isRecording = false;
    currentRecordingAction = null;
    recordingCallback = null;
}

/**
 * Trả về chuỗi hiển thị phím tắt (vd: "Alt+S")
 */
export function getHotkeyString(config) {
    if (!config || !config.key) return 'Chưa gán';
    const parts = [];
    if (config.ctrlKey) parts.push('Ctrl');
    if (config.altKey) parts.push('Alt');
    if (config.shiftKey) parts.push('Shift');
    
    // Chuẩn hóa tên phím
    let keyName = config.key.toUpperCase();
    if (keyName === ' ') keyName = 'Space';
    
    parts.push(keyName);
    return parts.join(' + ');
}

/**
 * Xóa phím tắt
 */
export function clearHotkey(action) {
    const hotkeys = Storage.get(SK_HOTKEYS, DEFAULT_HOTKEYS);
    if (hotkeys[action]) {
        hotkeys[action].key = '';
        Storage.set(SK_HOTKEYS, hotkeys);
        return true;
    }
    return false;
}
