/**
 * @file styles.js
 * @desc Inject toàn bộ CSS cho cả hai widget vào trang bằng GM_addStyle.
 *       CSS được chia thành các SECTION rõ ràng để dễ locate.
 *       SECTION 1: Widget container & toggle button
 *       SECTION 2: Export panel layout & header
 *       SECTION 3: Fields container & field rows
 *       SECTION 4: Control buttons
 *       SECTION 5: Template manager
 *       SECTION 6: Calc Widget (title bar, calculator, data tabs)
 * @exports injectStyles  — gọi GM_addStyle để inject CSS
 * @seeAlso widget.js (HTML structure), calcWidgetFeature.js (Calc Widget HTML)
 */
// src/ui/styles.js

export function injectStyles() {
    const styleId = 'vnpt-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        :root {
            --vnpt-primary: #1a73e8;
            --vnpt-primary-hover: #1557b0;
            --vnpt-primary-light: rgba(26, 115, 232, 0.1);
            --vnpt-primary-grad: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
            --vnpt-danger: #ea4335;
            --vnpt-danger-hover: #d93025;
            --vnpt-success: #1e8e3e;
            --vnpt-bg-glass: rgba(255, 255, 255, 0.82);
            --vnpt-border: rgba(0, 0, 0, 0.08);
            --vnpt-border-bright: rgba(255, 255, 255, 0.4);
            --vnpt-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
            --vnpt-radius: 16px;
            --vnpt-font: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

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

        /* ═══════════════════════════════════════════
           SECTION 3: FIELDS CONTAINER & FIELD ROWS
           ═══════════════════════════════════════════ */
        #vnpt-fields-container { 
            flex: 1; overflow: hidden; background: rgba(255, 255, 255, 0.3); 
            border: 1px solid var(--vnpt-border); border-radius: 12px; 
            margin-bottom: 4px; position: relative; display: flex; flex-direction: column; 
            box-shadow: inset 0 2px 10px rgba(0,0,0,0.02);
            transition: all 0.3s ease;
        }
        #vnpt-fields-container.vnpt-mode-default {
            border: 2px dashed var(--vnpt-danger);
            background: rgba(234, 67, 53, 0.05);
            box-shadow: inset 0 0 15px rgba(234, 67, 53, 0.1);
        }
        #vnpt-fields-list { flex: 1; overflow-y: auto; padding: 4px; }

        .vnpt-fields-header {
            display: flex; gap: 4px; padding: 2px 4px;
            background: rgba(255, 255, 255, 0.5); border-bottom: 1px solid var(--vnpt-border);
            font-size: 10px; font-weight: 800; color: #5f6368;
            align-items: center; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .vnpt-fields-header span { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .vnpt-fields-header .h-chk { flex: 0 0 24px; text-align: center; }
        .vnpt-fields-header .h-label { flex: 0.35; padding-left: 5px; }
        .vnpt-fields-header .h-key { flex: 0.45; display: none; padding-left: 5px; }
        .show-ids .vnpt-fields-header .h-key { display: block; }
        .vnpt-fields-header .h-drag { flex: 0 0 18px; }
        .vnpt-fields-header .h-val { flex: 1; padding-left: 50px; }

        .vnpt-field-row { 
            display: flex; gap: 4px; margin-bottom: 2px; align-items: center; 
            padding: 2px; border-radius: 10px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            background: rgba(255, 255, 255, 0.6); border: 1px solid transparent;
        }
        .vnpt-field-row:hover { 
            background: #fff; border-color: var(--vnpt-primary-light); 
            transform: translateX(4px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); 
        }
        
        .row-drag-handle { cursor: grab; padding: 0; font-size: 16px; color: #bdc1c6; user-select: none; flex: 0 0 18px; text-align: center; }
        .row-drag-handle:active { cursor: grabbing; }
        .vnpt-field-row.dragging { opacity: 0.4; }
        .vnpt-field-row.over { background-color: #e8f0fe; border: 1px dashed var(--vnpt-primary); }

        .vnpt-field-row input { 
            flex: 1; padding: 4px 8px; border: 1px solid #1f5bd2ff; border-radius: 6px; 
            font-size: 11.5px; transition: all 0.2s; background: #fff;
        }
        .vnpt-field-row input:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.1); outline: none; }
        
        .vnpt-field-row input.row-chk { flex: 0 0 24px; width: 16px; height: 16px; cursor: pointer; accent-color: var(--vnpt-primary); }
        .vnpt-field-row input.f-label { flex: 0.35; color: #1a73e8; font-weight: 700; background: rgba(26,115,232,0.03); }
        .vnpt-field-row input.f-key { display: none; flex: 0.45; font-weight: 700; color: #d63384; background: rgba(214,51,132,0.03); }
        .show-ids .vnpt-field-row input.f-key { display: block; }

        .vnpt-btn-hide { background: #f1f3f4; border: none; border-radius: 4px; font-size: 10px; cursor: pointer; padding: 4px 8px; color: #5f6368; font-weight: 600; }
        .vnpt-btn-hide:hover { background: #e8eaed; color: #3c4043; }
        
        .vnpt-btn-del { background: #fce8e6; color: var(--vnpt-danger); border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-weight: 700; font-size: 10px; }
        .vnpt-btn-del:hover { background: #f9d7d1; }

        .vnpt-control-group { margin-bottom: 5px; }
        .vnpt-control-group label { display: block; font-weight: 700; font-size: 12px; color: #3c4043; margin-bottom: 2px; }
        .vnpt-control-group input[type="text"] { 
            width: 100%; box-sizing: border-box; padding: 8px 12px; 
            border: 1px solid #0055ffff; border-radius: 8px; font-size: 12px;
            background: #fff; transition: all 0.2s;
        }
        .vnpt-control-group input[type="text"]:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1); outline: none; }

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

        .btn-fill-back { background: #f3e5f5; color: #7b1fa2; border: 1px solid rgba(123, 31, 162, 0.1); } 
        .btn-fill-back:hover { background: #7b1fa2; color: #fff; border-color: transparent; }
        
        .btn-export { 
            background: var(--vnpt-primary-grad); 
            color: white; padding: 0 20px; font-weight: 800; 
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        } 
        .btn-export:hover { box-shadow: 0 6px 20px rgba(26, 115, 232, 0.4); }

        /* Utility Menu UI */
        .vnpt-util-dropdown { position: relative; }
        .vnpt-util-menu {
            position: absolute; top: calc(100% + 12px); right: 0;
            background: rgba(255, 255, 255, 0.95); 
            backdrop-filter: blur(15px);
            border: 1px solid var(--vnpt-border); border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15); z-index: 100000;
            display: none; flex-direction: column; min-width: 500px;
            padding: 4px 0; animation: menuFadeIn 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
            transform-origin: top right;
        }
        @keyframes menuFadeIn { 
            from { opacity: 0; transform: translateY(-15px) scale(0.9); } 
            to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        .vnpt-util-menu.show { display: flex; }
        
        .util-item {
            background: none; border: none; padding: 4px 12px; width: 100%;
            text-align: left; font-size: 12px; cursor: pointer;
            color: #3c4043; font-weight: 600; transition: all 0.2s;
            display: flex; align-items: center; gap: 6px;
            border-left: 3px solid transparent;
        }
        .util-item:hover { 
            background: rgba(26, 115, 232, 0.05); color: var(--vnpt-primary); 
            border-left-color: var(--vnpt-primary);
            padding-left: 18px;
        }
        
        .util-item.danger { color: var(--vnpt-danger); }
        .util-item.danger:hover { 
            background: #fff5f5; color: var(--vnpt-danger); 
            border-left-color: var(--vnpt-danger);
        }
        
        .util-separator { height: 1px; background: rgba(0,0,0,0.05); margin: 4px 0; }
        .util-submenu-title { 
            padding: 4px 12px 2px 12px; font-size: 9.5px; font-weight: 800; 
            color: #1a73e8; text-transform: uppercase; letter-spacing: 0.8px; 
            background: rgba(26, 115, 232, 0.04); margin-bottom: 1px;
        }

        /* 2-Column Grid for Top Config */
        .util-config-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            padding: 0;
        }
        .util-column { display: flex; flex-direction: column; }
        .util-column.vertical-separator { border-left: 1px solid var(--vnpt-border); }

        /* Mapping Rows in Utility Menu */
        .cw-row-map {
            display: flex; align-items: center; justify-content: space-between;
            padding: 1px 12px; gap: 4px;
        }
        .cw-row-map span { font-size: 11px; font-weight: 700; color: #5f6368; flex: 0 0 75px; }
        .cw-map-input {
            flex: 1; padding: 4px 8px; border: 1px solid #dadce0; border-radius: 6px;
            font-size: 10.5px; background: #fff; transition: all 0.2s;
        }
        .cw-map-input:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 2px var(--vnpt-primary-light); outline: none; }

        /* System Data Actions */
        .util-action-row { display: flex; padding: 3px 8px; gap: 4px; }
        .util-item-small {
            flex: 1; border: 1px solid #e0e0e0; background: #fff; color: #3c4043;
            padding: 5px 0; border-radius: 8px; font-size: 10.5px; font-weight: 700;
            cursor: pointer; transition: all 0.2s; text-align: center;
        }
        .util-item-small:hover { background: var(--vnpt-primary-light); color: var(--vnpt-primary); border-color: var(--vnpt-primary); }
        
        .size-options { display: flex; padding: 3px 8px; gap: 4px; }
        .size-options button {
            flex: 1; padding: 5px 0; border: 1px solid #e0e0e0; border-radius: 8px;
            background: #fff; font-size: 11px; font-weight: 700; cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            color: #5f6368;
        }
        .size-options button:hover { 
            background: var(--vnpt-primary); border-color: var(--vnpt-primary); color: #fff; 
            transform: translateY(-2px); box-shadow: 0 4px 8px rgba(26, 115, 232, 0.2);
        }
        .size-options button:active { transform: translateY(0); }

        /* Hotkey Config UI */
        .vnpt-hotkey-list { display: flex; flex-direction: column; padding: 3px 8px; gap: 3px; }
        .vnpt-hotkey-row {
            display: flex; align-items: center; justify-content: space-between;
            background: rgba(0,0,0,0.02); padding: 3px 8px; border-radius: 8px;
            transition: all 0.2s; border: 1px solid transparent;
        }
        .vnpt-hotkey-row:hover { 
            background: #fff; border-color: var(--vnpt-primary-light); 
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .vnpt-hotkey-label { font-size: 10.5px; font-weight: 700; color: #5f6368; }
        .vnpt-hotkey-btn {
            background: #fff; border: 1px solid #dadce0; border-radius: 6px;
            padding: 3px 8px; font-size: 10px; font-weight: 800; cursor: pointer;
            min-width: 80px; text-align: center; color: var(--vnpt-primary);
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

        /* ═══════════════════════════════════════════
           SECTION 5: TEMPLATE MANAGER
           ═══════════════════════════════════════════ */
        #vnpt-template-section { border-top: 1px solid var(--vnpt-border); margin-top: 4px; padding-top: 4px; }
        
        /* Text Template Section */
        #vnpt-txt-section {
            border-top: 1px solid var(--vnpt-border);
            margin-top: 4px; padding-top: 4px;
        }
        .vnpt-txt-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 2px; margin-top: 2px;
        }
        .vnpt-txt-header span {
            font-size: 11px; font-weight: 800; color: #1a73e8;
            text-transform: uppercase; letter-spacing: 0.5px;
        }
        #vnpt-txt-toggle {
            background: none; border: none; cursor: pointer;
            font-size: 10px; color: #5f6368; padding: 2px 6px;
            border-radius: 4px; transition: all 0.2s;
        }
        #vnpt-txt-toggle:hover { background: var(--vnpt-primary-light); color: var(--vnpt-primary); }
        #vnpt-txt-template {
            width: 100%; box-sizing: border-box;
            padding: 8px 10px; border: 1px solid #0055ffff; border-radius: 8px;
            font-size: 11.5px; font-family: 'Courier New', Courier, monospace;
            resize: vertical; min-height: 72px; max-height: 200px;
            background: rgba(255,255,255,0.8); color: #3c4043;
            transition: all 0.2s; line-height: 1.6;
        }
        #vnpt-txt-template:focus {
            border-color: var(--vnpt-primary);
            box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
            outline: none;
        }
        #vnpt-txt-template::placeholder { color: #aaa; font-style: italic; }

        .bottom-export-row { 
            display: flex; gap: 4px; align-items: center; 
            border-top: 1px solid var(--vnpt-border); 
            margin: 4px -4px -4px -4px; padding: 4px;
            background: rgba(248, 249, 250, 0.5);
            border-radius: 0 0 var(--vnpt-radius) var(--vnpt-radius);
        }
        .bottom-export-row .vnpt-control-group { margin-bottom: 0; flex: 1; min-width: 0; }
        #vnpt-local-file-group { flex: 0 0 auto !important; }
        .bottom-export-row .vnpt-control-group input[type="text"] { height: 32px; padding: 6px 10px; }
        .bottom-export-row .btn-export { flex: 0 0 auto; height: 32px; margin: 0; border-radius: 8px; }

        /* Nút Upload File Local (icon-only) */
        .btn-upload-local {
            display: inline-flex; align-items: center; justify-content: center;
            width: 32px; height: 32px; border-radius: 8px;
            background: rgba(0,0,0,0.04); border: 1px solid #dadce0;
            font-size: 15px; cursor: pointer; transition: all 0.2s;
            color: #5f6368; box-sizing: border-box;
            flex-shrink: 0;
        }
        .btn-upload-local:hover { 
            background: var(--vnpt-primary-light); border-color: var(--vnpt-primary);
            color: var(--vnpt-primary); transform: scale(1.05);
        }
        .btn-upload-local:active { transform: scale(0.95); }

        /* Nút Xuất TXT */
        .btn-export-txt {
            background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
            color: white; padding: 0 14px; font-weight: 800;
            height: 32px; flex: 0 0 auto; border-radius: 8px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .btn-export-txt:hover { box-shadow: 0 6px 20px rgba(0, 137, 123, 0.4); }


        .text-hint { font-size: 11px; color: #70757a; font-style: italic; text-align: center; margin-bottom: 4px; }

        #vnpt-fields-list::-webkit-scrollbar { width: 6px; }
        #vnpt-fields-list::-webkit-scrollbar-track { background: transparent; }
        #vnpt-fields-list::-webkit-scrollbar-thumb { background: #dadce0; border-radius: 10px; }
        #vnpt-fields-list::-webkit-scrollbar-thumb:hover { background: #bdc1c6; }

        /* ═══════════════════════════════════════════
           SECTION 6: INLINE CALC (Premium Layout)
           ═══════════════════════════════════════════ */
        #vnpt-inline-calc { 
            background: rgba(255, 255, 255, 0.3); 
            padding: 2px 6px; 
            border-bottom: 1px solid var(--vnpt-border);
            display: block;
        }
        .cw-body-inline { display: flex; flex-direction: column; gap: 3px; }
        .cw-inline-row { display: flex; align-items: center; gap: 3px; width: 100%; box-sizing: border-box; }
        .cw-input-inline { 
            flex: 1; min-width: 60px; padding: 4px 10px; border: 1px solid #0055ffff; border-radius: 8px; 
            font-size: 11.5px; font-weight: 600; height: 28px; box-sizing: border-box;
            background: #fff; transition: all 0.2s;
        }
        .cw-input-inline:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 3px var(--vnpt-primary-light); outline: none; }
        .cw-input-readonly-inline { background-color: rgba(30, 142, 62, 0.05); color: var(--vnpt-success); cursor: default; flex: 1.5; border-color: rgba(30, 142, 62, 0.2); }
        
        .cw-tax-group-inline { position: relative; display: flex; align-items: center; flex: 0 0 auto; min-width: 45px; }
        .cw-tax-input-inline { width: 45px; padding: 4px 18px 4px 8px; border: 1px solid #dadce0; border-radius: 6px; font-size: 11px; text-align: right; height: 28px; }
        .cw-tax-symbol { position: absolute; right: 6px; color: #5f6368; font-size: 9px; font-weight: bold; pointer-events: none; }

        .btn-calc-toggle { background: rgba(26, 115, 232, 0.08); color: var(--vnpt-primary); }
        .btn-calc-toggle:hover { background: rgba(26, 115, 232, 0.15); }
        .btn-calc-toggle.active { background: var(--vnpt-primary); color: #fff; box-shadow: 0 4px 10px rgba(26, 115, 232, 0.3); }

        .btn-more.active { background: rgba(0,0,0,0.1); }

        /* ═══════════════════════════════════════════
           SECTION 7: PDF SCAN MODAL
           ═══════════════════════════════════════════ */
        .btn-scan-pdf { background: rgba(30, 142, 62, 0.08); color: var(--vnpt-success); border: 1px solid rgba(30, 142, 62, 0.1); } 
        .btn-scan-pdf:hover { background: var(--vnpt-success); color: #fff; border-color: transparent; }

        .vnpt-pdf-overlay { 
            position: fixed; inset: 0; background: rgba(0,0,0,0.4);
            backdrop-filter: blur(4px); z-index: 9999999; display: flex;
            align-items: center; justify-content: center; font-family: var(--vnpt-font);
        }
        
        .vnpt-pdf-loading-box {
            background: #fff; padding: 30px 40px; border-radius: 20px;
            text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
            animation: pdfFadeIn 0.3s ease;
        }

        .loader-spinner {
            border: 4px solid #f3f3f3; border-top: 4px solid var(--vnpt-primary);
            border-radius: 50%; width: 40px; height: 40px; margin: 0 auto;
            animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        .vnpt-pdf-dialog-box { 
            background: #fff; border-radius: 20px; padding: 20px;
            width: 560px; max-width: 92vw; max-height: 80vh; 
            display: flex; flex-direction: column;
            box-shadow: 0 24px 80px rgba(0,0,0,0.2); animation: pdfFadeIn 0.3s ease; 
        }
        @keyframes pdfFadeIn { 
            from { opacity:0; transform: scale(0.92) translateY(20px); }
            to { opacity:1; transform: scale(1) translateY(0); } 
        }

        .pdf-dlg-header h3 { margin: 0 0 16px 0; color: #3c4043; font-size: 15px; }

        .pdf-dlg-body { flex: 1; overflow-y: auto; margin-bottom: 16px; border: 1px solid #e0e0e0; border-radius: 8px;}

        .pdf-result-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .pdf-result-table th { background: #f8f9fa; padding: 8px 10px; text-align: left; font-weight: 800; color: #5f6368; position: sticky; top: 0;}
        .pdf-result-table td { padding: 6px 10px; border-bottom: 1px solid #f1f3f4; }
        .pdf-row-auto td { background: rgba(30,142,62,0.04); }

        .vnpt-pdf-actions { display: flex; gap: 8px; justify-content: flex-end; align-items: center; }
        
        .pdf-btn-cancel {
            padding: 8px 16px; background: #f1f3f4; border: none; border-radius: 8px;
            color: #3c4043; font-weight: 700; cursor: pointer; transition: 0.2s;
        }
        .pdf-btn-cancel:hover { background: #e8eaed; }
        .pdf-btn-confirm {
            padding: 8px 16px; background: var(--vnpt-primary); border: none; border-radius: 8px;
            color: #fff; font-weight: 700; cursor: pointer; transition: 0.2s;
        }
        .pdf-btn-confirm:hover { background: var(--vnpt-primary-hover); box-shadow: 0 4px 12px rgba(26, 115, 232, 0.3); }

    `;
    document.head.appendChild(style);
}
