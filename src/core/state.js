/**
 * @file state.js
 * @desc Singleton AppState — lưu tham chiếu các DOM elements và trạng thái toàn cục.
 *       Sử dụng Proxy để hỗ trợ reactivity (lắng nghe thay đổi qua .on()).
 */

const internalState = {
    // VNPT Docx Widget
    widget: null,
    panel: null,
    header: null,
    bannerArea: null,
    toggleBtn: null,
    fieldsContainer: null,
    panelBody: null,

    // VNPT Calc Widget
    calcWidget: null,

    // Row reordering tracking
    draggedRowForVNPT: null,

    // VNPT Data display status
    isDefaultMode: false,
    
    // Template status
    templateBuffer: null,
    templateName: null,

    // Drag status
    hasDragged: false,

    // Inspector status
    isInspecting: false
};

const listeners = new Map();

/**
 * AppState Singleton Proxy
 * @property {Function} on - Đăng ký listener: AppState.on('isDefaultMode', (newVal) => { ... })
 */
export const AppState = new Proxy(internalState, {
    get(target, prop) {
        if (prop === 'on') {
            return (key, cb) => {
                if (!listeners.has(key)) listeners.set(key, []);
                listeners.get(key).push(cb);
            };
        }
        return target[prop];
    },
    set(target, prop, value) {
        const oldValue = target[prop];
        target[prop] = value;
        
        // Chỉ trigger nếu giá trị thực sự thay đổi
        if (oldValue !== value && listeners.has(prop)) {
            listeners.get(prop).forEach(cb => cb(value, oldValue));
        }
        return true;
    }
});
