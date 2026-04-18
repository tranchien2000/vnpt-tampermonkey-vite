export const fieldsStyles = `
    /* ═══════════════════════════════════════════
       SECTION 3: FIELDS CONTAINER & FIELD ROWS
       ═══════════════════════════════════════════ */
    #vnpt-fields-container { 
        --label-flex: 0.2;
        flex: 1; min-height: 100px; background: rgba(255, 255, 255, 0.4); 
        border: 1px solid var(--vnpt-border); border-radius: 12px; 
        margin-bottom: 4px; position: relative; display: flex; flex-direction: column; 
        box-shadow: inset 0 2px 10px rgba(0,0,0,0.02);
    }

    #vnpt-fields-container.vnpt-mode-default {
        border: 2px dashed var(--vnpt-danger);
        background: rgba(234, 67, 53, 0.03);
    }
    #vnpt-fields-list { flex: 1; padding: 6px 4px; }

    .vnpt-field-row { 
        display: flex; gap: 4px; margin-bottom: 3px; align-items: center; 
        padding: 2px 4px; border-radius: 8px; transition: all 0.2s;
        background: #fff; border: 1px solid transparent;
        box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    }
    .vnpt-field-row:hover { 
        border-color: var(--vnpt-primary-light); 
        transform: translateX(2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); 
        z-index: 2;
    }

    .btn-sync-dir, .btn-sync-dir-calc {
        cursor: pointer; padding: 0; user-select: none;
        flex: 0 0 16px; height: 16px; display: flex; align-items: center; justify-content: center;
        border: none; background: transparent; color: #bdc1c6;
        transition: 0.2s;
    }
    .btn-sync-dir:hover { color: var(--vnpt-primary); transform: scale(1.2); }
    
    .btn-sync-dir[data-dir="both"] { color: var(--vnpt-primary); }
    .btn-sync-dir[data-dir="up"] { color: #f57c00; }
    .btn-sync-dir[data-dir="down"] { color: var(--vnpt-success); }

    .vnpt-field-row input { 
        flex: 1; padding: 2px 4px; border: 1px solid #e8eaed; border-radius: 6px; 
        font-size: 10.5px; height: 24px; transition: all 0.2s; background: #fdfdfd;
        color: #3c4043; font-family: inherit;
    }
    .vnpt-field-row input:focus { 
        border-color: var(--vnpt-primary); 
        box-shadow: 0 0 0 2px var(--vnpt-primary-light); 
        outline: none; background: #fff;
    }
    
    .vnpt-field-row input.row-chk { flex: 0 0 16px; width: 14px; height: 14px; margin: 0; cursor: pointer; accent-color: var(--vnpt-primary); }
    .vnpt-field-row input.f-label { flex: var(--label-flex); color: #1a73e8; font-weight: 700; background: rgba(26,115,232,0.02); }
    .vnpt-field-row input.f-key { display: none; width: 60px; font-weight: 700; color: #d63384; background: rgba(214,51,132,0.02); }
    .show-ids .vnpt-field-row input.f-key { display: block; }

    .btn-field-link {
        cursor: pointer; padding: 0; user-select: none;
        flex: 0 0 20px; height: 20px; display: flex; align-items: center; justify-content: center;
        border: none; background: transparent; color: #bdc1c6; transition: 0.2s; font-size: 11px;
    }
    .btn-field-link:hover { color: var(--vnpt-primary); transform: scale(1.1); }

    /* MST Lookup */
    .mst-lookup-wrapper { position: relative; display: flex; align-items: center; flex: 1; }
    .btn-mst-lookup {
        position: absolute; right: 3px; width: 18px; height: 18px; border-radius: 4px;
        border: none; background: var(--vnpt-primary-light); color: var(--vnpt-primary);
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        font-size: 10px; transition: 0.2s; z-index: 5;
    }
    .btn-mst-lookup:hover { background: var(--vnpt-primary); color: white; }

    /* Validation & Effects */
    @keyframes field-flash-success {
        0% { background-color: rgba(40, 167, 69, 0.3); }
        100% { background-color: #fff; }
    }
    .field-flash-success { animation: field-flash-success 2s ease; }

    #vnpt-fields-list::-webkit-scrollbar { width: 4px; }
    #vnpt-fields-list::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
`;
