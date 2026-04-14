export const panelStyles = `
    /* SECTION 1: WIDGET CONTAINER & TOGGLE BTN */
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

    /* SECTION 2: EXPORT PANEL LAYOUT & HEADER */
    #vnpt-export-panel { 
        position: relative; 
        width: 460px; min-width: 360px; 
        height: auto; min-height: 250px;
        max-height: 92vh; max-width: 98vw;
        display: flex; flex-direction: column; 
        background: var(--vnpt-bg-glass);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid var(--vnpt-border-bright);
        border-radius: var(--vnpt-radius); padding: 4px; 
        box-shadow: var(--vnpt-shadow);
        transition: width 0.2s ease, height 0.2s ease;
    }
    #vnpt-export-panel.vnpt-resizing { transition: none !important; user-select: none !important; }
    
    #vnpt-panel-body { display: flex; flex-direction: column; overflow: hidden; flex: 1; margin-top: 4px; border-radius: 12px; }

    #vnpt-panel-header { 
        margin: -4px -4px 0 -4px; padding: 4px 8px;
        border-bottom: 1px solid var(--vnpt-border); 
        cursor: move; user-select: none; 
        display: flex; align-items: center; justify-content: space-between; 
        background: rgba(255, 255, 255, 0.4);
        border-radius: var(--vnpt-radius) var(--vnpt-radius) 0 0;
        gap: 4px;
        position: relative;
    }
    #vnpt-panel-header::after {
        content: ""; position: absolute; bottom: -1px; left: 12px; right: 12px;
        height: 1px; background: linear-gradient(90deg, transparent, var(--vnpt-primary), transparent);
        opacity: 0.3;
    }
    #vnpt-panel-header:hover { background: rgba(255, 255, 255, 0.6); }
    
    .header-left { display: flex; align-items: center; min-width: 60px; flex-shrink: 0; }
    .header-center { display: flex; gap: 4px; flex: 1; justify-content: center; min-width: 0; overflow: hidden; }
    .header-right { 
        display: flex; gap: 4px; align-items: center; 
        margin-right: 34px; flex-shrink: 0;
    }

    #vnpt-panel-title { 
        font-size: 13px; font-weight: 800; letter-spacing: 0.5px;
        background: var(--vnpt-primary-grad);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-transform: uppercase;
    }

    /* SECTION 4: CONTROL BUTTONS */
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

    /* Resizers */
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
    #vnpt-export-panel.vnpt-pinned:not(:hover) {
        min-height: unset !important;
        height: auto !important;
        padding-bottom: 0 !important;
        width: 460px; /* Thêm width cố định để không bị giật khi hover (sẽ tự resize theo inline-style) */
    }
    #vnpt-export-panel.vnpt-pinned:not(:hover) #vnpt-panel-body {
        display: none !important;
    }
    /* Chắc chắn inline calc đang hiện khi pinned */
    #vnpt-export-panel.vnpt-pinned:not(:hover) #vnpt-inline-calc {
        display: block !important;
    }
`;
