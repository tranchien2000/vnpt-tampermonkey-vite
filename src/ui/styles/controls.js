export const controlStyles = `
    /* ═══════════════════════════════════════════
       SECTION 4: CONTROL BUTTONS
       ═══════════════════════════════════════════ */
    .vnpt-btn-action { 
        padding: 0 8px; height: 24px; 
        display: flex; align-items: center; justify-content: center; 
        font-weight: 700; font-size: 11px; cursor: pointer; 
        border-radius: 6px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
        white-space: nowrap; box-sizing: border-box; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        flex-shrink: 1; min-width: 0;
    }
    .vnpt-btn-action:hover { transform: translateY(-1px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
    .vnpt-btn-action:active { transform: translateY(0) scale(0.96); }

    .vnpt-btn-icon {
        border: 1px solid #1f5bd2ff;
        background: rgba(0,0,0,0.03); width: 24px; height: 24px;
        display: flex; align-items: center; justify-content: center;
        font-size: 12px; cursor: pointer; border-radius: 6px;
        color: #5f6368; transition: all 0.2s;
    }
    .vnpt-btn-icon:hover { background: var(--vnpt-primary-light); color: var(--vnpt-primary); transform: scale(1.05); }
    .vnpt-btn-icon.active { background: var(--vnpt-primary); color: white; box-shadow: 0 4px 10px rgba(26, 115, 232, 0.3); }

    .header-center { 
        display: flex; 
        gap: 2px; 
        background: rgba(255, 255, 255, 0.04); 
        padding: 2px; 
        border-radius: 8px;
        align-items: center;
    }

    .vnpt-btn-header {
        height: 24px;
        padding: 0 10px;
        border: none;
        background: transparent;
        color: #5f6368;
        font-size: 10.5px;
        font-weight: 700;
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
    }
    .vnpt-btn-header:hover {
        background: #ffffffff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    /* Đặc trị màu sắc cho từng nút */
    .vnpt-btn-header.btn-ai { color: #8e24aa; background: rgba(142, 36, 170, 0.05); }
    .vnpt-btn-header.btn-ai:hover { background: #8e24aa; color: white; }
    
    .vnpt-btn-header.btn-scan { color: #1e8e3e; background: rgba(30, 142, 62, 0.05); }
    .vnpt-btn-header.btn-scan:hover { background: #1e8e3e; color: white; }
    
    .vnpt-btn-header.btn-fill { color: #f57c00; background: rgba(245, 124, 0, 0.05); }
    .vnpt-btn-header.btn-fill:hover { background: #f57c00; color: white; }
    
    .vnpt-btn-header.btn-id { color: #d81b60; background: rgba(216, 27, 96, 0.05); }
    .vnpt-btn-header.btn-id:hover { background: #d81b60; color: white; }

    .vnpt-btn-header.active {
        background: var(--vnpt-primary);
        color: white;
        box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3);
    }
    
    /* ═══════════════════════════════════════════
       SECTION: BACKUP HISTORY DROPDOWN
       ═══════════════════════════════════════════ */
    .vnpt-backup-history {
        position: absolute;
        top: calc(100% + 4px);
        right: 0;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(20px); 
        border: 1px solid var(--vnpt-border);
        border-radius: 12px; 
        box-shadow: 0 10px 40px rgba(0,0,0,0.25);
        width: 320px; 
        max-height: 400px; 
        overflow-y: auto;
        display: none; 
        flex-direction: column; 
        z-index: 1000000;
        padding: 8px; 
        transform-origin: top right;
    }
    .vnpt-backup-history.show { display: flex; }
    .backup-history-header {
        padding: 10px 14px;
        font-size: 11px;
        font-weight: 800;
        color: var(--vnpt-primary);
        text-transform: uppercase;
        letter-spacing: 0.8px;
        border-bottom: 1px solid rgba(26, 115, 232, 0.1);
        background: rgba(26, 115, 232, 0.04);
        border-radius: 12px 12px 0 0;
        margin: -8px -8px 6px -8px;
    }
    .backup-history-item {
        padding: 10px 12px; border-radius: 10px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
        border-bottom: 1px solid rgba(0,0,0,0.03);
        display: flex; align-items: center; justify-content: space-between; gap: 10px;
    }
    .backup-history-item:hover { background: var(--vnpt-primary-light); transform: scale(1.02); }
    .backup-info { flex: 1; min-width: 0; }
    .backup-history-name { font-size: 11.5px; font-weight: 700; color: #3c4043; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .backup-history-time { font-size: 9px; color: #9aa0a6; font-weight: 600; margin-top: 2px; }
    
    .backup-actions { display: flex; gap: 4px; flex-shrink: 0; }
    .backup-actions button {
        width: 28px; height: 28px; border-radius: 6px; border: 1px solid #dadce0;
        background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
        font-size: 12px; transition: all 0.2s;
    }
    .btn-restore-action:hover { background: var(--vnpt-success); color: #fff; border-color: var(--vnpt-success); }
    .btn-delete-action:hover { background: var(--vnpt-danger); color: #fff; border-color: var(--vnpt-danger); }
    
    .backup-history-item:hover .backup-preview-content { display: flex; }

    .backup-preview-content {
        margin-top: 8px;
        padding: 8px;
        background: rgba(0,0,0,0.03);
        border-radius: 8px;
        font-size: 10px;
        display: none;
        flex-direction: column;
        gap: 4px;
        border: 1px dashed #dadce0;
    }
    .backup-preview-content.show { display: flex; }
    .preview-row { display: flex; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,0.02); padding-bottom: 2px; }
    .preview-label { font-weight: 700; color: #5f6368; }
    .preview-val { color: #1a73e8; font-weight: 600; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px; }
    
    .backup-history-empty { padding: 30px 20px; text-align: center; font-size: 11px; color: #9aa0a6; font-style: italic; line-height: 1.6; }

    /* Utility Menu UI - Ultra Compact */
    .vnpt-util-dropdown { position: relative; }
    .vnpt-util-menu {
        position: absolute; top: calc(100% + 8px); right: 0;
        background: #fff; border: 1px solid var(--vnpt-border); border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.12); z-index: 100000;
        display: none; flex-direction: column; width: 320px;
        padding: 6px;
        transform-origin: top right;
    }
    .vnpt-util-menu.show { display: flex; }
    
    .util-config-container { display: flex; flex-direction: column; gap: 8px; }

    .util-section-mini {
        padding: 4px; border-bottom: 1px solid #f0f0f0;
    }
    .util-section-mini:last-child { border-bottom: none; }

    .util-action-row { 
        display: flex; 
        gap: 4px; 
        align-items: center; 
        width: 100%; 
        box-sizing: border-box; 
        flex-wrap: nowrap;
        padding: 2px 0;
    }
    
    .util-item-mini {
        flex: 1;
        min-width: 0; 
        background: #f8f9fa; border: 1px solid #eee; border-radius: 6px;
        padding: 5px 1px; font-size: 9px; font-weight: 700; color: #3c4043;
        cursor: pointer; transition: all 0.2s; text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: flex; align-items: center; justify-content: center; gap: 1px;
    }
    .util-json-group {
        display: flex;
        gap: 2px;
        flex: 0 0 52px;
    }
    .util-item-mini.btn-json-icon {
        flex: 1;
        width: 24px;
        height: 24px;
        font-size: 11px;
        padding: 0;
        border-color: #dadce0;
    }
    .util-item-mini:hover { background: var(--vnpt-primary-light); border-color: var(--vnpt-primary); color: var(--vnpt-primary); }
    .util-item-mini.danger:hover { background: #fdf2f2; border-color: #d93025; color: #d93025; }

    .util-row-compact { display: flex; align-items: center; gap: 8px; }
    .util-label-tiny { font-size: 9px; font-weight: 800; color: #9aa0a6; text-transform: uppercase; }
    
    .size-options-tiny { display: flex; gap: 2px; flex: 1; }
    .size-options-tiny button {
        flex: 1; padding: 2px 0; border: 1px solid #eee; border-radius: 4px;
        background: #fff; font-size: 9px; font-weight: 700; cursor: pointer;
    }
    .size-options-tiny button:hover { background: var(--vnpt-primary); color: #fff; border-color: var(--vnpt-primary); }

    .cw-row-mini { display: flex; gap: 4px; }
    .cw-input-mini {
        flex: 1; padding: 4px 8px; border: 1px solid #eee; border-radius: 6px;
        font-size: 10px; background: #fafafa;
    }
    .cw-input-mini:focus { border-color: var(--vnpt-primary); outline: none; background: #fff; }
    
    .util-btn-test-tiny {
        background: #f0f4ff; color: var(--vnpt-primary); border: none;
        border-radius: 6px; width: 24px; cursor: pointer; font-size: 10px;
    }

    .gemini-config-mini-row {
        display: flex;
        gap: 4px;
        align-items: center;
        margin-top: 6px;
    }
    .gemini-config-mini-row .model-select {
        flex: 0 0 90px;
        padding: 4px 2px;
    }
    .gemini-config-mini-row .util-btn-test-tiny {
        height: 24px;
        flex: 0 0 24px;
    }

    .vnpt-hotkey-list-mini { display: flex; flex-direction: column; gap: 3px; max-height: 120px; overflow-y: auto; }
    .vnpt-hotkey-row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 2px 4px; background: #fafafa; border-radius: 4px;
    }
    .vnpt-hotkey-label { font-size: 9px; color: #5f6368; }
    .vnpt-hotkey-btn {
        background: #fff; border: 1px solid #eee; border-radius: 4px;
        padding: 1px 4px; font-size: 9px; font-weight: 700; color: var(--vnpt-primary);
        min-width: 50px; text-align: center;
    }
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.6; }
        100% { opacity: 1; }
    }
`;
