export const controlStyles = `
    /* ═══════════════════════════════════════════
       SECTION 4: CONTROL BUTTONS
       ═══════════════════════════════════════════ */
    .vnpt-btn-action { 
        padding: 0 10px; height: 30px; 
        display: flex; align-items: center; justify-content: center; 
        font-weight: 700; font-size: 11px; cursor: pointer; 
        border-radius: 8px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
        white-space: nowrap; box-sizing: border-box; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        flex-shrink: 1; min-width: 0;
    }
    .vnpt-btn-action:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .vnpt-btn-action:active { transform: translateY(0) scale(0.96); }

    .vnpt-btn-icon {
        border: 1px solid #1f5bd2ff;
        background: rgba(0,0,0,0.03); width: 30px; height: 30px;
        display: flex; align-items: center; justify-content: center;
        font-size: 15px; cursor: pointer; border-radius: 8px;
        color: #5f6368; transition: all 0.2s;
    }
    .vnpt-btn-icon:hover { background: var(--vnpt-primary-light); color: var(--vnpt-primary); transform: scale(1.05); }
    .vnpt-btn-icon.active { background: var(--vnpt-primary); color: white; box-shadow: 0 4px 10px rgba(26, 115, 232, 0.3); }

    .btn-scan { background: #e6f4ea; color: var(--vnpt-success); border: 1px solid rgba(30, 142, 62, 0.1); } 
    .btn-scan:hover { background: var(--vnpt-success); color: #fff; border-color: transparent; }
    
    .btn-fill-back { background: #f3e5f5; color: #7b1fa2; border: 1px solid rgba(123, 31, 162, 0.1); } 
    .btn-fill-back:hover { background: #7b1fa2; color: #fff; border-color: transparent; }

    .btn-restore { background: #e8f0fe; color: var(--vnpt-primary); border: 1px solid rgba(26, 115, 232, 0.1); }
    .vnpt-btn-restore:hover { background: var(--vnpt-primary); color: #fff; border-color: transparent; }
    
    /* ═══════════════════════════════════════════
       SECTION: BACKUP HISTORY DROPDOWN
       ═══════════════════════════════════════════ */
    .vnpt-backup-history {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(20px); 
        border: 1px solid var(--vnpt-border);
        border-radius: 12px; 
        box-shadow: 0 10px 40px rgba(0,0,0,0.25);
        width: 320px; 
        max-height: 420px; 
        overflow-y: auto;
        display: none; 
        flex-direction: column; 
        z-index: 1000000;
        padding: 8px; 
        animation: menuFadeIn 0.25s cubic-bezier(0.165, 0.84, 0.44, 1);
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
    
    .backup-history-empty { padding: 30px 20px; text-align: center; font-size: 11px; color: #9aa0a6; font-style: italic; line-height: 1.6; }

    /* Utility Menu UI */
    .vnpt-util-dropdown { position: relative; }
    .vnpt-util-menu {
        position: absolute; top: calc(100% + 12px); right: 0;
        background: rgba(255, 255, 255, 0.95); 
        backdrop-filter: blur(15px);
        border: 1px solid var(--vnpt-border); border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.15); z-index: 100000;
        display: none; flex-direction: column; min-width: 400px;
        padding: 8px 0; animation: menuFadeIn 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
        transform-origin: top right;
    }
    @keyframes menuFadeIn { 
        from { opacity: 0; transform: translateY(-15px) scale(0.9); } 
        to { opacity: 1; transform: translateY(0) scale(1); } 
    }
    .vnpt-util-menu.show { display: flex; }
    
    .util-item, .util-item-compact {
        background: none; border: none; padding: 4px 12px;
        text-align: left; font-size: 11.5px; cursor: pointer;
        color: #3c4043; font-weight: 600; transition: all 0.2s;
        display: flex; align-items: center; gap: 6px;
        border-left: 3px solid transparent;
    }
    .util-item:hover, .util-item-compact:hover { 
        background: rgba(26, 115, 232, 0.05); color: var(--vnpt-primary); 
        border-left-color: var(--vnpt-primary);
    }
    
    .util-item-compact {
        padding: 4px 6px; border-radius: 6px; font-size: 10.5px;
        background: #f8f9fa; border: 1px solid #e0e0e0; border-left: none;
        justify-content: center; flex: 1;
    }
    .util-item-compact.danger { color: var(--vnpt-danger); }
    .util-item-compact.danger:hover { background: #fff5f5; border-color: var(--vnpt-danger); }

    .util-action-grid {
        display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 4px 12px;
    }
    
    .util-separator { height: 1px; background: rgba(0,0,0,0.05); margin: 4px 0; }
    .util-submenu-title { 
        padding: 6px 12px 4px 12px; font-size: 9px; font-weight: 800; 
        color: #1a73e8; text-transform: uppercase; letter-spacing: 0.8px; 
        background: rgba(26, 115, 232, 0.04); margin-bottom: 2px;
    }

    /* 2-Column Grid for Top Config */
    .util-config-grid {
        display: grid; grid-template-columns: 1fr 1fr; padding: 0;
    }
    .util-column { display: flex; flex-direction: column; overflow: hidden; }
    .util-column.vertical-separator { border-left: 1px solid var(--vnpt-border); }

    .util-row-compact { display: flex; align-items: center; padding: 4px 12px; gap: 8px; }
    .util-label-mini { font-size: 10px; font-weight: 800; color: #5f6368; text-transform: uppercase; }
    
    .size-options-compact { display: flex; gap: 4px; flex: 1; }
    .size-options-compact button {
        flex: 1; padding: 4px 0; border: 1px solid #e0e0e0; border-radius: 6px;
        background: #fff; font-size: 10px; font-weight: 700; cursor: pointer;
        transition: all 0.2s; color: #5f6368;
    }
    .size-options-compact button:hover { 
        background: var(--vnpt-primary); border-color: var(--vnpt-primary); color: #fff; 
    }

    /* Mapping Rows in Utility Menu / Hotkeys */
    .cw-row-map-compact {
        display: flex; align-items: center; padding: 4px 12px; gap: 6px;
    }
    .cw-row-map-compact span { font-size: 12px; flex: 0 0 20px; text-align: center; }
    .cw-map-input {
        flex: 1; padding: 4px 8px; border: 1px solid #dadce0; border-radius: 6px;
        font-size: 10.5px; background: #fff; transition: all 0.2s;
    }
    .cw-map-input:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 2px var(--vnpt-primary-light); outline: none; }
    
    .util-btn-test-mini {
        background: var(--vnpt-primary-light); color: var(--vnpt-primary);
        border: 1px solid var(--vnpt-primary); border-radius: 6px;
        width: 28px; height: 26px; cursor: pointer; transition: all 0.2s;
        display: flex; align-items: center; justify-content: center; font-size: 10px; flex-shrink: 0;
    }
    .util-btn-test-mini:hover { background: var(--vnpt-primary); color: #fff; }
    
    .vnpt-hotkey-list { 
        display: flex; flex-direction: column; padding: 4px 8px; gap: 4px;
        max-height: 150px; overflow-y: auto;
    }
    .vnpt-hotkey-list::-webkit-scrollbar { width: 3px; }
    .vnpt-hotkey-list::-webkit-scrollbar-thumb { background: #dadce0; border-radius: 4px; }

    .vnpt-hotkey-row {
        display: flex; align-items: center; justify-content: space-between;
        background: rgba(0,0,0,0.02); padding: 4px 8px; border-radius: 8px;
        transition: all 0.2s; border: 1px solid transparent; gap: 8px;
    }
    .vnpt-hotkey-row:hover { 
        background: #fff; border-color: var(--vnpt-primary-light); 
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .vnpt-hotkey-label { font-size: 10px; font-weight: 700; color: #5f6368; }
    .vnpt-hotkey-btn {
        background: #fff; border: 1px solid #dadce0; border-radius: 6px;
        padding: 3px 8px; font-size: 10px; font-weight: 800; cursor: pointer;
        min-width: 70px; text-align: center; color: var(--vnpt-primary);
        transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .vnpt-hotkey-btn:hover { border-color: var(--vnpt-primary); background: var(--vnpt-primary-light); }
    .vnpt-hotkey-btn.recording {
        background: var(--vnpt-danger); color: #fff; border-color: var(--vnpt-danger);
        animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.6; }
        100% { opacity: 1; }
    }
`;
