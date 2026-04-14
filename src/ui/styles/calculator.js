export const calculatorStyles = `
    /* ═══════════════════════════════════════════
       SECTION 6: INLINE CALC (Premium Layout)
       ═══════════════════════════════════════════ */
    #vnpt-inline-calc { 
        background: rgba(255, 255, 255, 0.3); 
        padding: 4px 8px; 
        border-bottom: 1px solid var(--vnpt-border);
        display: block;
    }
    .cw-body-inline { display: flex; flex-direction: column; gap: 4px; }
    .cw-inline-row { display: flex; align-items: center; gap: 4px; width: 100%; box-sizing: border-box; }
    .cw-input-inline { 
        flex: 1; min-width: 60px; padding: 4px 10px; border: 1px solid #0055ffff; border-radius: 8px; 
        font-size: 11.5px; font-weight: 600; height: 30px; box-sizing: border-box;
        background: #fff; transition: all 0.2s;
    }
    .cw-input-inline:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 3px var(--vnpt-primary-light); outline: none; }
    .cw-input-readonly-inline { background-color: rgba(30, 142, 62, 0.05); color: var(--vnpt-success); cursor: default; flex: 1.5; border-color: rgba(30, 142, 62, 0.2); }
    
    .cw-tax-group-inline { position: relative; display: flex; align-items: center; flex: 0 0 auto; min-width: 45px; }
    .cw-tax-input-inline { width: 45px; padding: 4px 18px 4px 8px; border: 1px solid #dadce0; border-radius: 6px; font-size: 11px; text-align: right; height: 30px; }
    .cw-tax-symbol { position: absolute; right: 6px; color: #5f6368; font-size: 9px; font-weight: bold; pointer-events: none; }

    .cw-map-btn-inline {
        background: rgba(255, 255, 255, 0.82); border: 1px solid #1a73e8; border-radius: 8px;
        width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
        font-size: 13px; cursor: pointer; transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
        color: #1a73e8; flex-shrink: 0; padding: 0;
        box-shadow: 0 2px 4px rgba(26, 115, 232, 0.1);
    }
    .cw-map-btn-inline:hover { background: var(--vnpt-primary-grad); color: white; transform: scale(1.1) rotate(5deg); box-shadow: 0 4px 8px rgba(26, 115, 232, 0.3); }

    .btn-calc-toggle { background: rgba(26, 115, 232, 0.08); color: var(--vnpt-primary); }
    .btn-calc-toggle:hover { background: rgba(26, 115, 232, 0.15); }
    .btn-calc-toggle.active { background: var(--vnpt-primary); color: #fff; box-shadow: 0 4px 10px rgba(26, 115, 232, 0.3); }
`;
