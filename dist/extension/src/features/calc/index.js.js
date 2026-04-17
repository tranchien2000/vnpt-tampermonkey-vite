/**
 * @file index.js (src/features/calc/)
 * @desc Entry point cho module Calc. Xuất hàm initCalcWidget để main.js gọi.
 */
import { createCalcUI } from "/src/features/calc/calcUI.js.js";
import { AppState } from "/src/core/state.js.js";
import { SK_POS_CALC, SK_COLLAPSE } from "/src/core/constants.js.js";
import { ld, sv } from "/src/features/calc/calcHistory.js.js";

export function initCalcWidget() {
    // Tìm container inline nếu có (như trong widget.js có <div id="vnpt-inline-calc"></div>)
    const inlineContainer = document.getElementById('vnpt-inline-calc');
    const toggleBtn = document.getElementById('vnpt-btn-calc-toggle');
    
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
    
    // Logic cho nút toggle trên header
    if (inlineContainer && toggleBtn) {
        let collapsed = ld(SK_COLLAPSE) ?? { calc: false, data: true };
        
        const applyState = (isCollapsed) => {
            inlineContainer.style.display = isCollapsed ? 'none' : 'block';
            toggleBtn.classList.toggle('active', !isCollapsed);
        };
        
        applyState(collapsed.calc);
        
        toggleBtn.onclick = () => {
            collapsed.calc = !collapsed.calc;
            sv(SK_COLLAPSE, collapsed);
            applyState(collapsed.calc);
        };
    }
    
    return createCalcUI(widget, inlineContainer, SK_POS_CALC);
}
