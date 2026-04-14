/**
 * @file configManager.js
 * @desc Quản lý việc Nhập (Import) và Xuất (Export) cấu hình JSON cho VNPT Export Widget.
 *       Bao gồm: Fields data, Templates list, Widget Position & Size.
 * @exports exportConfig — Hàm xuất JSON tải về máy
 * @exports importConfig — Hàm nhập JSON từ máy người dùng
 */

import { 
    LOCAL_KEY_FIELDS, LOCAL_KEY_POS, LOCAL_KEY_SIZE, 
    SK_TEMPLATES, SK_DATA_DEF, SK_DATA_CUS, SK_DATA_SYNC,
    SK_CALC_MAP, SK_TAX, SK_ADDRESS_LEARNING 
} from '../core/constants.js';
import { showToast } from '../ui/toast.js';
import { loadSavedData } from './fieldsManager.js';
import { renderTemplateManager } from './templateManager.js';
import { Storage } from '../utils/storage.js';

/**
 * Xuất toàn bộ cấu hình hiện tại ra file JSON
 */
export function exportConfig() {
    const config = {
        version: '1.0',
        timestamp: Date.now(),
        fields: Storage.get(LOCAL_KEY_FIELDS) || {},
        templates: Storage.get(SK_TEMPLATES) || [],
        position: Storage.get(LOCAL_KEY_POS) || null,
        size: Storage.get(LOCAL_KEY_SIZE) || null,
        addressLearning: Storage.get(SK_ADDRESS_LEARNING) || {},
        calc: {
            default: Storage.get(SK_DATA_DEF) || null,
            custom: Storage.get(SK_DATA_CUS) || null,
            sync: Storage.get(SK_DATA_SYNC) || null,
            map: Storage.get(SK_CALC_MAP) || {},
            taxRate: Number(Storage.get(SK_TAX)) || 0.08
        }
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vnpt_config_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('📤 Đã xuất cấu hình JSON');
}

/**
 * Nhập cấu hình từ file JSON do người dùng chọn
 */
export function importConfig() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const config = JSON.parse(text);

            if (!config.fields && !config.calc) {
                throw new Error('Định dạng file không hợp lệ!');
            }

            // Lưu vào Storage utility
            if (config.fields) Storage.set(LOCAL_KEY_FIELDS, config.fields);
            if (config.templates) Storage.set(SK_TEMPLATES, config.templates);
            if (config.position) Storage.set(LOCAL_KEY_POS, config.position);
            if (config.size) Storage.set(LOCAL_KEY_SIZE, config.size);
            if (config.addressLearning) Storage.set(SK_ADDRESS_LEARNING, config.addressLearning);
            
            if (config.calc) {
                if (config.calc.default) Storage.set(SK_DATA_DEF, config.calc.default);
                if (config.calc.custom) Storage.set(SK_DATA_CUS, config.calc.custom);
                if (config.calc.sync) Storage.set(SK_DATA_SYNC, config.calc.sync);
                if (config.calc.map) Storage.set(SK_CALC_MAP, config.calc.map);
                if (config.calc.taxRate !== undefined) Storage.set(SK_TAX, config.calc.taxRate);
            }

            // Cập nhật giao diện
            await loadSavedData(); // Tải lại bảng fields

            // Cập nhật giao diện Calculator nếu widget đang mở
            const calcWidget = document.getElementById('vnpt-calc-widget');
            if (calcWidget) {
                const taxRateEl = document.getElementById('wg-taxRate');
                if (taxRateEl && config.calc && config.calc.taxRate !== undefined) {
                    taxRateEl.value = config.calc.taxRate * 100;
                }
                if (config.calc && config.calc.map) {
                    calcWidget.querySelectorAll('input[data-clink]').forEach(inp => {
                        const key = inp.dataset.clink;
                        if (config.calc.map[key]) {
                            inp.value = (config.calc.map[key] || []).join(', ');
                        }
                    });
                }
            }
            
            // Tải lại danh sách templates
            const tmplContainer = document.getElementById('vnpt-template-manager');
            if (tmplContainer) {
                renderTemplateManager(tmplContainer, (arrayBuffer, name) => {
                    AppState.templateBuffer = arrayBuffer;
                    AppState.templateName = name;
                });
            }

            // Cập nhật vị trí/kích thước widget (nếu có trong AppState)
            if (config.position && AppState.widget) {
                if (config.position.right) {
                    AppState.widget.style.right = config.position.right;
                    AppState.widget.style.left = 'auto';
                } else if (config.position.left) {
                    AppState.widget.style.left = config.position.left;
                    AppState.widget.style.right = 'auto';
                }
                if (config.position.top) AppState.widget.style.top = config.position.top;
                AppState.widget.style.bottom = 'auto';
            }
            if (config.size && AppState.panel) {
                AppState.panel.style.width = config.size.width + 'px';
                AppState.panel.style.height = config.size.height + 'px';
            }

            showToast('✅ Nhập cấu hình thành công!');
        } catch (err) {
            console.error('Lỗi Import:', err);
            alert('Lỗi: ' + err.message);
        }
    };

    input.click();
}
