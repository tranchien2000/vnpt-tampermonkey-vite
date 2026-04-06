/**
 * @file index.js (src/features/calc/)
 * @desc Entry point cho module Calc. Xuất hàm initCalcWidget để main.js gọi.
 */
import { createCalcUI } from './calcUI.js';
import { AppState } from '../../core/state.js';
import { SK_POS_CALC } from '../../core/constants.js';

export function initCalcWidget() {
    // Tìm container inline nếu có (như trong widget.js có <div id="vnpt-inline-calc"></div>)
    const inlineContainer = document.getElementById('vnpt-inline-calc');
    
    // Nếu nhúng (inline), ta dùng widget chính của AppState
    // Nếu không nhúng (chạy floating), ta mới tạo/dùng calcWidget riêng
    let widget = AppState.calcWidget || document.createElement('div');
    
    if (!inlineContainer && !AppState.calcWidget) {
        widget.id = 'vnpt-calc-widget';
        document.body.appendChild(widget);
        AppState.calcWidget = widget;
    } else if (inlineContainer) {
        widget = AppState.widget; // Gắn logic vào widget chính của AppState
    }
    
    return createCalcUI(widget, inlineContainer, SK_POS_CALC);
}
