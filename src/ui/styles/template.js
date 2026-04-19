export const templateStyles = `
    /* ═══════════════════════════════════════════
       SECTION: TEMPLATE MANAGER
       ═══════════════════════════════════════════ */
    .vnpt-template-manager-inner {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .tmpl-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 5px;
        border-top: 1px solid #eee;
        padding-top: 5px;
    }

    .vnpt-title-main {
        font-size: 11px;
        font-weight: 700;
        color: #444;
    }

    .vnpt-btn-wrap {
        display: flex;
        gap: 4px;
    }

    .vnpt-local-list-container {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        max-height: 240px;
        overflow-y: auto;
        padding-right: 4px;
    }
    .vnpt-local-list-container::-webkit-scrollbar { width: 3px; }
    .vnpt-local-list-container::-webkit-scrollbar-thumb { background: #eee; border-radius: 4px; }

    .tmpl-row-item {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 3px 8px;
        background: #f8f9fa;
        border: 1px solid #e0e0e0;
        border-radius: 15px;
        cursor: pointer;
        outline: none;
        transition: all 0.2s;
    }
    .tmpl-row-item:hover {
        background: #fff;
        border-color: var(--vnpt-primary-light);
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .tmpl-row-item.active {
        border-color: var(--vnpt-primary);
        background: var(--vnpt-primary-light);
    }

    .tmpl-badge-cloud {
        font-size: 8px;
        padding: 1px 5px;
        border-radius: 10px;
        flex-shrink: 0;
        font-weight: bold;
        background: #1976d2;
        color: #fff;
    }

    .tmpl-name-text {
        font-size: 11px;
        font-weight: 600;
        color: #212529;
        white-space: nowrap;
    }
    .tmpl-row-item.active .tmpl-name-text {
        color: var(--vnpt-primary);
    }

    .tmpl-btn-rename {
        font-size: 10px;
        padding: 1px 4px;
        border: none;
        background: none;
        color: #555;
        cursor: pointer;
        margin-left: auto;
    }
    .tmpl-btn-del {
        font-size: 10px;
        padding: 1px 4px;
        border: none;
        background: none;
        color: #d32f2f;
        cursor: pointer;
        margin-left: 2px;
    }
`;
