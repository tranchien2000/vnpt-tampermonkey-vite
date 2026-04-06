/**
 * @file index.js (src/features/calc/)
 * @desc Entry point cho module Calc. Xuất hàm initCalcWidget để main.js gọi.
 */
import { createCalcUI } from './calcUI.js';
import { SK_POS_CALC } from '../../core/constants.js';

export function initCalcWidget() {
    // Tìm container inline nếu có (như trong widget.js có <div id="vnpt-inline-calc"></div>)
    const inlineContainer = document.getElementById('vnpt-inline-calc');
    const widget = AppState.calcWidget || document.createElement('div');
    
    // Nếu widget chưa tồn tại (chưa có trong AppState), ta tạo mới
    if (!AppState.calcWidget) {
        widget.id = 'vnpt-calc-widget';
        document.body.appendChild(widget);
        AppState.calcWidget = widget;
    }
    
    return createCalcUI(widget, inlineContainer, SK_POS_CALC);
}
