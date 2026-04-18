export const panelStyles = `
    /* ═══════════════════════════════════════════
       SECTION 1: WIDGET CONTAINER & TOGGLE BTN
       ═══════════════════════════════════════════ */
    #vnpt-docx-widget { position: fixed; top: 100px; right: 50px; z-index: 999999; font-family: var(--vnpt-font); }

    #vnpt-toggle-btn.btn-closed { 
        position: absolute; right: 10px; top: 10px;
        width: 32px; height: 32px; font-size: 14px; border-radius: 8px;
        background: var(--vnpt-primary); color: white; border: none; 
        cursor: pointer; display: flex; align-items: center; justify-content: center; 
        box-shadow: 0 4px 12px rgba(26, 115, 232, 0.4); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 10;
    }
    #vnpt-toggle-btn.btn-closed:hover { transform: scale(1.1) rotate(5deg); background: var(--vnpt-primary-hover); }

    #vnpt-toggle-btn.btn-opened {
        position: absolute; right: 10px; top: 2px;
        width: 32px; height: 32px; font-size: 14px; border-radius: 8px;
        background: var(--vnpt-danger); color: white; border: none;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 12px rgba(234, 67, 53, 0.4); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 10;
    }
    #vnpt-toggle-btn.btn-opened:hover { transform: scale(1.1) rotate(-5deg); background: var(--vnpt-danger-hover); }

    /* ═══════════════════════════════════════════
       SECTION 2: EXPORT PANEL LAYOUT & HEADER
       ═══════════════════════════════════════════ */
    #vnpt-export-panel { 
        position: relative; 
        width: 380px; min-width: 320px; 
        height: auto; min-height: 200px;
        max-height: 92vh; max-width: 98vw;
        display: flex; flex-direction: column; 
        background: var(--vnpt-bg-glass);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid var(--vnpt-border-bright);
        border-radius: var(--vnpt-radius); padding: 4px; 
        box-shadow: var(--vnpt-shadow);
    }
    #vnpt-export-panel.vnpt-resizing { transition: none !important; user-select: none !important; }
    
    #vnpt-panel-body { display: flex; flex-direction: column; overflow: hidden; flex: 1; margin-top: 4px; border-radius: 12px; }

    #vnpt-panel-header { 
        margin: -4px -4px 0 -4px; padding: 2px 8px;
        border-bottom: 1px solid var(--vnpt-border); 
        cursor: move; user-select: none; 
        display: flex; align-items: center; justify-content: space-between; 
        background: rgba(255, 255, 255, 0.4);
        border-radius: var(--vnpt-radius) var(--vnpt-radius) 0 0;
        gap: 2px;
        position: relative;
    }
    #vnpt-panel-header::after {
        content: ""; position: absolute; bottom: -1px; left: 12px; right: 12px;
        height: 1px; background: linear-gradient(90deg, transparent, var(--vnpt-primary), transparent);
        opacity: 0.3;
    }
    #vnpt-panel-header:hover { background: rgba(255, 255, 255, 0.6); }
    
    .header-left { display: flex; align-items: center; min-width: 40px; flex-shrink: 0; }
    .header-center { 
        display: flex; gap: 2px; flex: 1; justify-content: center; min-width: 0; overflow: hidden; 
        background: white; border-radius: 6px; padding: 2px; margin: 0 4px;
    }
    .header-right { 
        display: flex; gap: 2px; align-items: center; 
        margin-right: 34px; flex-shrink: 0;
    }

    #vnpt-panel-title { 
        font-size: 11px; font-weight: 800; letter-spacing: 0.3px;
        background: var(--vnpt-primary-grad);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-transform: uppercase;
    }

    .vnpt-version {
        font-size: 9px; font-weight: 700; color: #9aa0a6;
        margin-left: 4px; vertical-align: bottom; opacity: 0.8;
    }

    .vnpt-update-badge {
        font-size: 8px; font-weight: 900; background: var(--vnpt-danger);
        color: white; padding: 1px 4px; border-radius: 4px;
        margin-left: 4px; cursor: pointer; text-transform: uppercase;
        animation: bounce 2s infinite; display: inline-block;
    }

    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
        40% {transform: translateY(-3px);}
        60% {transform: translateY(-2px);}
    }

    /* 4 Corner Resizers */
    .vnpt-resizer {
        position: absolute; width: 16px; height: 16px; z-index: 10000;
    }
    .vnpt-resizer.tl { top: -4px; left: -4px; cursor: nwse-resize; }
    .vnpt-resizer.tr { top: -4px; right: -4px; cursor: nesw-resize; }
    .vnpt-resizer.bl { bottom: -4px; left: -4px; cursor: nesw-resize; }
    .vnpt-resizer.br { bottom: -4px; right: -4px; cursor: nwse-resize; }
    .vnpt-resizer:hover { background: rgba(26, 115, 232, 0.4); border-radius: 50%; }
    .vnpt-resizer:active { background: var(--vnpt-primary); transform: scale(1.2); }

    body.vnpt-resizing-global * { user-select: none !important; cursor: inherit !important; }

    /* Pinned state */
    #vnpt-export-panel.vnpt-pinned {
        transition: none !important;
    }

    #vnpt-export-panel.vnpt-pinned:not(:hover) {
        min-height: unset !important;
        height: 64px !important;
        width: 460px;
        overflow: hidden;
        padding-bottom: 0 !important;
    }
    
    #vnpt-export-panel.vnpt-pinned:not(:hover) #vnpt-panel-body {
        display: none !important;
    }

    #vnpt-export-panel.vnpt-pinned:hover #vnpt-panel-body {
        display: flex !important;
    }
`;
