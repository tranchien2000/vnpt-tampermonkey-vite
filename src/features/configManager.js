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
    SK_CALC_MAP, SK_TAX 
} from '../core/constants.js';
import { showToast } from '../ui/toast.js';
import { loadSavedData } from './fieldsManager.js';
import { renderTemplateManager } from './templateManager.js';
import { AppState } from '../core/state.js';

/**
 * Xuất toàn bộ cấu hình hiện tại ra file JSON
 */
export function exportConfig() {
    const config = {
        version: '1.0',
        timestamp: Date.now(),
        fields: JSON.parse(localStorage.getItem(LOCAL_KEY_FIELDS)) || {},
        templates: JSON.parse(localStorage.getItem(SK_TEMPLATES)) || [],
        position: JSON.parse(localStorage.getItem(LOCAL_KEY_POS)) || null,
        size: JSON.parse(localStorage.getItem(LOCAL_KEY_SIZE)) || null,
        calc: {
            default: JSON.parse(localStorage.getItem(SK_DATA_DEF)) || null,
            custom: JSON.parse(localStorage.getItem(SK_DATA_CUS)) || null,
            sync: JSON.parse(localStorage.getItem(SK_DATA_SYNC)) || null,
            map: JSON.parse(localStorage.getItem(SK_CALC_MAP)) || {},
            taxRate: Number(localStorage.getItem(SK_TAX)) || 0.08
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

            // Lưu vào localStorage
            if (config.fields) localStorage.setItem(LOCAL_KEY_FIELDS, JSON.stringify(config.fields));
            if (config.templates) localStorage.setItem(SK_TEMPLATES, JSON.stringify(config.templates));
            if (config.position) localStorage.setItem(LOCAL_KEY_POS, JSON.stringify(config.position));
            if (config.size) localStorage.setItem(LOCAL_KEY_SIZE, JSON.stringify(config.size));
            
            if (config.calc) {
                if (config.calc.default) localStorage.setItem(SK_DATA_DEF, JSON.stringify(config.calc.default));
                if (config.calc.custom) localStorage.setItem(SK_DATA_CUS, JSON.stringify(config.calc.custom));
                if (config.calc.sync) localStorage.setItem(SK_DATA_SYNC, JSON.stringify(config.calc.sync));
                if (config.calc.map) localStorage.setItem(SK_CALC_MAP, JSON.stringify(config.calc.map));
                if (config.calc.taxRate !== undefined) localStorage.setItem(SK_TAX, config.calc.taxRate);
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
