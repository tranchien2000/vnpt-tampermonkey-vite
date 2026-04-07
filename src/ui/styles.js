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
            --vnpt-danger: #ea4335;
            --vnpt-danger-hover: #d93025;
            --vnpt-success: #1e8e3e;
            --vnpt-bg-glass: rgba(255, 255, 255, 0.85);
            --vnpt-border: rgba(0, 0, 0, 0.1);
            --vnpt-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
            --vnpt-radius: 12px;
            --vnpt-font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
            position: absolute; right: 10px; top: 10px;
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
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: var(--vnpt-radius); padding: 12px; 
            box-shadow: var(--vnpt-shadow);
            transition: width 0.2s ease, height 0.2s ease;
        }
        
        #vnpt-panel-body { display: flex; flex-direction: column; overflow: hidden; flex: 1; margin-top: 8px; border-radius: 8px; }

        #vnpt-panel-header { 
            margin: -12px -12px 0 -12px; padding: 10px 15px;
            color: var(--vnpt-primary); font-size: 14px; 
            border-bottom: 1px solid var(--vnpt-border); 
            cursor: move; user-select: none; 
            display: flex; align-items: center; justify-content: space-between; 
            font-weight: 700; background: rgba(255, 255, 255, 0.5);
            border-radius: var(--vnpt-radius) var(--vnpt-radius) 0 0;
            gap: 12px;
        }
        #vnpt-panel-header:hover { background: rgba(255, 255, 255, 0.8); }
        
        .header-left { display: flex; align-items: center; min-width: 80px; }
        .header-center { display: flex; gap: 8px; flex: 1; justify-content: center; margin-right: 30px; }
        .header-right { 
            display: flex; gap: 6px; align-items: center; 
            position: absolute; right: 48px; /* Chừa chỗ cho nút close */
            top: 10px;
        }

        #vnpt-panel-title { font-size: 13px; letter-spacing: 0.5px; color: var(--vnpt-primary); text-transform: uppercase; }

        /* ═══════════════════════════════════════════
           SECTION 3: FIELDS CONTAINER & FIELD ROWS
           ═══════════════════════════════════════════ */
        #vnpt-fields-container { 
            flex: 1; overflow: hidden; background: rgba(255, 255, 255, 0.4); 
            border: 1px solid var(--vnpt-border); border-radius: 8px; 
            margin-bottom: 8px; position: relative; display: flex; flex-direction: column; 
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }
        #vnpt-fields-list { flex: 1; overflow-y: auto; padding: 6px; }

        .vnpt-fields-header {
            display: flex; gap: 4px; padding: 6px 8px;
            background: rgba(26, 115, 232, 0.08); border-bottom: 1px solid var(--vnpt-border);
            font-size: 10px; font-weight: 800; color: var(--vnpt-primary);
            align-items: center; text-transform: uppercase; letter-spacing: 0.3px;
        }
        .vnpt-fields-header span { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .vnpt-fields-header .h-chk { flex: 0 0 24px; text-align: center; }
        .vnpt-fields-header .h-label { flex: 0.35; padding-left: 5px; }
        .vnpt-fields-header .h-key { flex: 0.45; display: none; padding-left: 5px; }
        .show-ids .vnpt-fields-header .h-key { display: block; }
        .vnpt-fields-header .h-drag { flex: 0 0 18px; }
        .vnpt-fields-header .h-val { flex: 1; padding-left: 5px; }
        
        .vnpt-default-banner {
            background: linear-gradient(90deg, #ea4335, #d93025); color: #fff;
            padding: 6px 12px; font-size: 11px; font-weight: 700;
            text-align: center; border-radius: 6px; margin: 0 8px 8px 8px;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            box-shadow: 0 4px 10px rgba(234, 67, 53, 0.3);
            animation: slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        
        #vnpt-fields-container.vnpt-mode-default {
            border: 2px solid var(--vnpt-danger) !important;
            box-shadow: inset 0 0 12px rgba(234, 67, 53, 0.1);
        }

        .vnpt-field-row { 
            display: flex; gap: 4px; margin-bottom: 4px; align-items: center; 
            padding: 4px; border-radius: 6px; transition: all 0.2s;
            background: rgba(255, 255, 255, 0.5); border: 1px solid transparent;
        }
        .vnpt-field-row:hover { background: #fff; border-color: rgba(26, 115, 232, 0.2); transform: translateX(2px); box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        
        .row-drag-handle { cursor: grab; padding: 0; font-size: 16px; color: #bdc1c6; user-select: none; flex: 0 0 18px; text-align: center; }
        .row-drag-handle:active { cursor: grabbing; }
        .vnpt-field-row.dragging { opacity: 0.4; }
        .vnpt-field-row.over { background-color: #e8f0fe; border: 1px dashed var(--vnpt-primary); }

        .vnpt-field-row input { 
            flex: 1; padding: 6px 8px; border: 1px solid #dadce0; border-radius: 6px; 
            font-size: 12px; transition: all 0.2s; background: #fff;
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

        .vnpt-control-group { margin-bottom: 12px; }
        .vnpt-control-group label { display: block; font-weight: 700; font-size: 12px; color: #3c4043; margin-bottom: 6px; }
        .vnpt-control-group input[type="text"] { 
            width: 100%; box-sizing: border-box; padding: 8px 12px; 
            border: 1px solid #dadce0; border-radius: 8px; font-size: 12px;
            background: #fff; transition: all 0.2s;
        }
        .vnpt-control-group input[type="text"]:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1); outline: none; }

        /* ═══════════════════════════════════════════
           SECTION 4: CONTROL BUTTONS
           ═══════════════════════════════════════════ */
        .vnpt-btn-action { 
            border: none; padding: 0 15px; height: 32px; 
            display: flex; align-items: center; justify-content: center; 
            font-weight: 700; font-size: 12px; cursor: pointer; 
            border-radius: 8px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
            white-space: nowrap; box-sizing: border-box; 
        }
        .vnpt-btn-action:active { transform: scale(0.96); }

        .vnpt-btn-icon {
            background: transparent; border: none; width: 32px; height: 32px;
            display: flex; align-items: center; justify-content: center;
            font-size: 18px; cursor: pointer; border-radius: 8px;
            color: #5f6368; transition: all 0.2s;
        }
        .vnpt-btn-icon:hover { background: rgba(0,0,0,0.05); color: var(--vnpt-primary); }
        .vnpt-btn-icon.active { background: rgba(26, 115, 232, 0.12); color: var(--vnpt-primary); }

        .btn-scan { background: #e6f4ea; color: var(--vnpt-success); border: 1px solid #ceead6; } 
        .btn-scan:hover { background: var(--vnpt-success); color: #fff; box-shadow: 0 4px 10px rgba(30, 142, 62, 0.3); }
        
        .btn-fill-back { background: #f3e5f5; color: #7b1fa2; border: 1px solid #e1bee7; } 
        .btn-fill-back:hover { background: #7b1fa2; color: #fff; box-shadow: 0 4px 10px rgba(123, 31, 162, 0.3); }

        .field-required-empty {
            border-color: var(--vnpt-danger) !important;
            background-color: #fff0f0 !important;
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
            40%, 60% { transform: translate3d(3px, 0, 0); }
        }

        .btn-export { background: var(--vnpt-primary); color: white; padding: 0 16px; font-weight: 800; } 
        .btn-export:hover { background: var(--vnpt-primary-hover); box-shadow: 0 4px 12px rgba(26, 115, 232, 0.4); }

        /* Utility Menu UI */
        .vnpt-util-dropdown { position: relative; }
        .vnpt-util-menu {
            position: absolute; top: calc(100% + 8px); right: 0;
            background: #fff; border: 1px solid var(--vnpt-border); border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15); z-index: 100000;
            display: none; flex-direction: column; min-width: 240px;
            padding: 8px 0; animation: menuFadeIn 0.2s ease-out;
        }
        @keyframes menuFadeIn { from { opacity: 0; transform: translateY(-15px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .vnpt-util-menu.show { display: flex; }
        
        .util-item {
            background: none; border: none; padding: 10px 16px; width: 100%;
            text-align: left; font-size: 13px; cursor: pointer;
            color: #3c4043; font-weight: 600; transition: all 0.2s;
            display: flex; align-items: center; gap: 12px;
        }
        .util-item:hover { background: #f8f9fa; color: var(--vnpt-primary); }
        
        .util-separator { height: 1px; background: #f1f3f4; margin: 6px 0; }
        .util-submenu-title { padding: 8px 16px 4px 18px; font-size: 10px; font-weight: 800; color: #9aa0a6; text-transform: uppercase; letter-spacing: 0.5px; }
        
        .size-options { display: flex; padding: 6px 16px 10px 16px; gap: 8px; }
        .size-options button {
            flex: 1; padding: 6px 0; border: 1px solid #dadce0; border-radius: 6px;
            background: #fff; font-size: 11px; font-weight: 700; cursor: pointer;
            transition: all 0.2s;
        }
        .size-options button:hover { background: #e8f0fe; border-color: #d2e3fc; color: var(--vnpt-primary); }

        /* 4 Corner Resizers */
        .vnpt-resizer {
            position: absolute; width: 16px; height: 16px; z-index: 10000;
        }
        .vnpt-resizer.tl { top: -4px; left: -4px; cursor: nwse-resize; }
        .vnpt-resizer.tr { top: -4px; right: -4px; cursor: nesw-resize; }
        .vnpt-resizer.bl { bottom: -4px; left: -4px; cursor: nesw-resize; }
        .vnpt-resizer.br { bottom: -4px; right: -4px; cursor: nwse-resize; }
        .vnpt-resizer:hover { background: rgba(26, 115, 232, 0.2); border-radius: 50%; }

        /* ═══════════════════════════════════════════
           SECTION 5: TEMPLATE MANAGER
           ═══════════════════════════════════════════ */
        #vnpt-template-section { border-top: 1px solid var(--vnpt-border); margin-top: 8px; padding-top: 10px; }
        
        .bottom-export-row { 
            display: flex; gap: 8px; align-items: flex-end; 
            border-top: 1px solid var(--vnpt-border); 
            margin: 8px -12px -12px -12px; padding: 12px;
            background: rgba(248, 249, 250, 0.5);
            border-radius: 0 0 var(--vnpt-radius) var(--vnpt-radius);
        }
        .bottom-export-row .vnpt-control-group { margin-bottom: 0; flex: 1; min-width: 0; }
        .bottom-export-row .vnpt-control-group input[type="text"] { height: 32px; padding: 6px 10px; }
        .bottom-export-row .btn-export { flex: 0 0 auto; height: 32px; margin: 0; border-radius: 8px; }

        .text-hint { font-size: 11px; color: #70757a; font-style: italic; text-align: center; margin-bottom: 8px; }

        #vnpt-fields-list::-webkit-scrollbar { width: 6px; }
        #vnpt-fields-list::-webkit-scrollbar-track { background: transparent; }
        #vnpt-fields-list::-webkit-scrollbar-thumb { background: #dadce0; border-radius: 10px; }
        #vnpt-fields-list::-webkit-scrollbar-thumb:hover { background: #bdc1c6; }

        /* ═══════════════════════════════════════════
           SECTION 6: INLINE CALC (Premium Layout)
           ═══════════════════════════════════════════ */
        #vnpt-inline-calc { 
            background: rgba(241, 243, 244, 0.6); 
            padding: 8px 12px; 
            border-bottom: 1px solid var(--vnpt-border);
            display: block;
        }
        .cw-body-inline { display: flex; flex-direction: column; gap: 6px; }
        .cw-inline-row { display: flex; align-items: center; gap: 6px; width: 100%; box-sizing: border-box; }
        .cw-input-inline { 
            flex: 1; min-width: 60px; padding: 6px 10px; border: 1px solid #dadce0; border-radius: 6px; 
            font-size: 12px; font-weight: 600; height: 30px; box-sizing: border-box;
            background: #fff; transition: all 0.2s;
        }
        .cw-input-inline:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 2px rgba(26,115,232,0.1); outline: none; }
        .cw-input-readonly-inline { background-color: #f8f9fa; color: var(--vnpt-success); cursor: default; flex: 1.5; border-color: #ceead6; }
        
        .cw-tax-group-inline { position: relative; display: flex; align-items: center; flex: 0 0 auto; min-width: 50px; }
        .cw-tax-input-inline { width: 50px; padding: 6px 20px 6px 8px; border: 1px solid #dadce0; border-radius: 6px; font-size: 12px; text-align: right; height: 30px; }
        .cw-tax-symbol { position: absolute; right: 6px; color: #5f6368; font-size: 10px; font-weight: bold; pointer-events: none; }

        .cw-map-dropdown-container { position: relative; flex-shrink: 0; }
        .cw-map-btn-inline { background: #fff; border: 1px solid #dadce0; border-radius: 6px; cursor: pointer; height: 30px; width: 30px; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: all 0.2s; color: #5f6368; }
        .cw-map-btn-inline:hover { background: #f8f9fa; color: var(--vnpt-primary); border-color: var(--vnpt-primary); }

        .btn-calc-toggle { background: rgba(26, 115, 232, 0.08); color: var(--vnpt-primary); }
        .btn-calc-toggle:hover { background: rgba(26, 115, 232, 0.15); }
        .btn-calc-toggle.active { background: var(--vnpt-primary); color: #fff; box-shadow: 0 4px 10px rgba(26, 115, 232, 0.3); }

        .btn-more.active { background: rgba(0,0,0,0.1); }

    `;
    document.head.appendChild(style);
}
