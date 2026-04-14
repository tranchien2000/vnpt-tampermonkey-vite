export const fieldsStyles = `
    /* ═══════════════════════════════════════════
       SECTION 3: FIELDS CONTAINER & FIELD ROWS
       ═══════════════════════════════════════════ */
    #vnpt-fields-container { 
        --label-flex: 0.2;
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
    .vnpt-fields-header .h-label { flex: var(--label-flex); padding-left: 5px; }
    .vnpt-fields-header .h-key { flex: 0.45; display: none; padding-left: 5px; }
    .show-ids .vnpt-fields-header .h-key { display: block; }
    .vnpt-fields-header .h-drag { flex: 0 0 18px; }
    .vnpt-fields-header .h-val { flex: 1; padding-left: 50px; }

    /* Column splitter */
    .fields-col-splitter {
        flex: 0 0 6px; cursor: col-resize;
        display: flex; align-items: center; justify-content: center;
        background: transparent; border-radius: 3px;
        opacity: 0; transition: opacity 0.2s, background 0.2s;
        position: relative; z-index: 2;
    }
    .fields-col-splitter::after {
        content: ''; display: block;
        width: 2px; height: 60%; min-height: 10px;
        background: var(--vnpt-border); border-radius: 2px;
        transition: background 0.2s;
    }
    #vnpt-fields-container:hover .fields-col-splitter { opacity: 1; }
    .fields-col-splitter:hover::after,
    .fields-col-splitter.dragging::after { background: var(--vnpt-primary); }
    .fields-col-splitter.dragging { opacity: 1; cursor: col-resize; }

    .vnpt-field-row { 
        display: flex; gap: 4px; margin-bottom: 2px; align-items: center; 
        padding: 2px; border-radius: 10px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        background: rgba(255, 255, 255, 0.6); border: 1px solid transparent;
    }
    .vnpt-field-row:hover { 
        background: #fff; border-color: var(--vnpt-primary-light); 
        transform: translateX(4px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); 
    }
    
    .btn-sync-dir, .btn-sync-dir-calc {
        cursor: pointer; padding: 0; user-select: none;
        flex: 0 0 20px; height: 20px; display: flex; align-items: center; justify-content: center;
        border: none; background: transparent; color: #bdc1c6;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        opacity: 0.8;
    }
    .btn-sync-dir:hover, .btn-sync-dir-calc:hover { 
        transform: scale(1.25); opacity: 1;
        background: rgba(0,0,0,0.03); border-radius: 4px;
    }
    .btn-sync-dir:active, .btn-sync-dir-calc:active { transform: scale(0.9); }
    
    .btn-sync-dir[data-dir="both"], .btn-sync-dir-calc[data-dir="both"] { color: var(--vnpt-primary); }
    .btn-sync-dir[data-dir="up"], .btn-sync-dir-calc[data-dir="up"] { color: #f57c00; }
    .btn-sync-dir[data-dir="down"], .btn-sync-dir-calc[data-dir="down"] { color: var(--vnpt-success); }
    
    .btn-sync-dir svg, .btn-sync-dir-calc svg { transition: transform 0.3s ease; }
    .btn-sync-dir:active svg, .btn-sync-dir-calc:active svg { transform: rotate(180deg); }

    .vnpt-field-row input { 
        flex: 1; padding: 4px 8px; border: 1px solid #1f5bd2ff; border-radius: 6px; 
        font-size: 11.5px; transition: all 0.2s; background: #fff;
    }
    .vnpt-field-row input:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.1); outline: none; }
    
    .vnpt-field-row input.row-chk { flex: 0 0 24px; width: 16px; height: 16px; cursor: pointer; accent-color: var(--vnpt-primary); }
    .vnpt-field-row input.f-label { flex: var(--label-flex); color: #1a73e8; font-weight: 700; background: rgba(26,115,232,0.03); }
    .vnpt-field-row input.f-key { display: none; flex: 0.45; font-weight: 700; color: #d63384; background: rgba(214,51,132,0.03); }
    .show-ids .vnpt-field-row input.f-key { display: block; }

    .vnpt-btn-hide { background: #f1f3f4; border: none; border-radius: 4px; font-size: 10px; cursor: pointer; padding: 4px 8px; color: #5f6368; font-weight: 600; }
    .vnpt-btn-hide:hover { background: #e8eaed; color: #3c4043; }
    
    .vnpt-btn-del { background: #fce8e6; color: var(--vnpt-danger); border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-weight: 700; font-size: 10px; }
    .vnpt-btn-del:hover { background: #f9d7d1; }

    /* MST Lookup Button */
    .mst-lookup-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        flex: 1;
    }
    .btn-mst-lookup {
        position: absolute;
        right: 4px;
        width: 22px;
        height: 22px;
        border-radius: 4px;
        border: none;
        background: var(--vnpt-primary-light);
        color: var(--vnpt-primary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        transition: all 0.2s;
        z-index: 5;
        padding: 0;
        line-height: 1;
    }
    .btn-mst-lookup:hover {
        background: var(--vnpt-primary);
        color: white;
        transform: scale(1.1);
    }
    .btn-mst-lookup.loading {
        pointer-events: none;
        opacity: 0.8;
    }
    .btn-mst-lookup .spinner {
        display: none;
        width: 12px;
        height: 12px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin-small 0.8s linear infinite;
    }
    .btn-mst-lookup.loading .spinner { display: block; }
    .btn-mst-lookup.loading .icon { display: none; }

    /* Validation & Error States */
    @keyframes vnpt-shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        75% { transform: translateX(4px); }
    }
    .vnpt-shake { animation: vnpt-shake 0.3s ease-in-out; }
    
    .field-error { 
        border-color: #ea4335 !important; 
        background-color: #fff1f0 !important; 
        color: #ea4335 !important;
        box-shadow: 0 0 0 3px rgba(234, 67, 53, 0.1) !important;
    }
    .field-required-empty {
        border: 1px dashed var(--vnpt-danger) !important;
        background: rgba(234, 67, 53, 0.05) !important;
    }

    @keyframes spin-small { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    #vnpt-fields-list::-webkit-scrollbar { width: 6px; }
    #vnpt-fields-list::-webkit-scrollbar-track { background: transparent; }
    #vnpt-fields-list::-webkit-scrollbar-thumb { background: #dadce0; border-radius: 10px; }
    #vnpt-fields-list::-webkit-scrollbar-thumb:hover { background: #bdc1c6; }
`;
