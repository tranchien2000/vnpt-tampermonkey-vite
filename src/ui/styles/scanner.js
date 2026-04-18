export const scannerStyles = `
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
        background: #fff; border-radius: 12px; padding: 0;
        width: 640px; max-width: 95vw; max-height: 80vh; 
        display: flex; flex-direction: column;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: pdfFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); 
        overflow: hidden;
    }
    @keyframes pdfFadeIn { 
        from { opacity:0; transform: scale(0.97) translateY(5px); }
        to { opacity:1; transform: scale(1) translateY(0); } 
    }

    .pdf-dlg-header {
        padding: 10px 16px;
        border-bottom: 1px solid #f1f3f4;
        display: flex; align-items: center; justify-content: space-between;
        background: #fafafa;
    }
    .pdf-dlg-header h3 { margin: 0; color: #1a73e8; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.3px; }
    
    .pdf-dlg-cols {
        display: flex; gap: 0; flex: 1; overflow: hidden; position: relative;
    }
    
    .pdf-col-left {
        width: 200px; min-width: 100px; max-width: 450px; background: #fff; 
        border-right: none;
        padding: 0; overflow: hidden; display: flex; flex-direction: column;
    }
    
    #pdf-raw-text-edit {
        flex: 1; width: 100%; border: none; background: #fcfcfc;
        padding: 12px; color: #3c4043; font-family: inherit; font-size: 10.5px;
        line-height: 1.5; resize: none; outline: none;
    }

    /* Thanh kéo chia cột */
    .pdf-dlg-splitter {
        width: 4px;
        background: #f1f3f4;
        cursor: col-resize;
        transition: background 0.2s;
        z-index: 10;
        display: flex; align-items: center; justify-content: center;
        border-left: 1px solid #e8eaed;
        border-right: 1px solid #e8eaed;
    }
    .pdf-dlg-splitter:hover, .pdf-dlg-splitter.dragging {
        background: var(--vnpt-primary);
    }
    .pdf-dlg-splitter::after {
        content: ''; width: 1px; height: 30px; background: rgba(255,255,255,0.2);
    }
    
    .pdf-col-right {
        flex: 1; display: flex; flex-direction: column; overflow: hidden;
        background: #fff;
    }

    .pdf-dlg-body { flex: 1; overflow-y: auto; padding: 8px; }

    .pdf-result-table { width: 100%; border-collapse: separate; border-spacing: 0 2px; font-size: 10.5px; }
    .pdf-result-table th { 
        background: #fff; padding: 6px 8px; text-align: left; font-weight: 800; 
        color: #5f6368; position: sticky; top: 0; z-index: 2; 
        border-bottom: 1px solid #f1f3f4; text-transform: uppercase; font-size: 9px;
    }
    .pdf-result-table td { padding: 4px 8px; vertical-align: middle; border-bottom: 1px solid #f8f9fa; }
    .pdf-row-auto:hover td { background: #f8faff; }

    .pdf-val-input {
        width: 100%; padding: 4px 8px; border: 1px solid #dadce0; border-radius: 4px;
        font-size: 10.5px; font-weight: 600; color: #1a73e8; transition: all 0.2s;
        box-sizing: border-box; background: #fff; height: 26px;
    }
    .pdf-val-input:focus { border-color: var(--vnpt-primary); outline: none; box-shadow: 0 0 0 2px var(--vnpt-primary-light); }

    .vnpt-pdf-actions { 
        display: flex; gap: 8px; justify-content: flex-end; align-items: center; 
        padding: 10px 16px; background: #fafafa; border-top: 1px solid #f1f3f4;
    }
    
    .pdf-btn-cancel {
        padding: 6px 16px; background: #fff; border: 1px solid #dadce0; border-radius: 6px;
        color: #5f6368; font-weight: 700; cursor: pointer; transition: 0.2s; font-size: 10.5px;
    }
    
    .pdf-btn-confirm {
        padding: 6px 20px; background: var(--vnpt-primary-grad); border: none; border-radius: 6px;
        color: #fff; font-weight: 700; cursor: pointer; transition: 0.2s; font-size: 10.5px;
        box-shadow: 0 2px 8px rgba(26, 115, 232, 0.2);
        text-transform: uppercase;
    }

    /* ═══════════════════════════════════════════
       SECTION 8: AI SCANNER UI
       ═══════════════════════════════════════════ */
    #vnpt-btn-ai-mode.active { background: var(--vnpt-primary); color: #fff; box-shadow: 0 4px 10px rgba(26, 115, 232, 0.3); }

    .vnpt-ai-scanner-section {
        padding: 6px; background: rgba(255, 255, 255, 0.5); border-bottom: 1px solid var(--vnpt-border);
        display: flex; flex-direction: column; gap: 4px;
    }

    .ai-scanner-header { display: flex; align-items: center; justify-content: space-between; }
    .ai-title { font-size: 10px; font-weight: 800; color: #1a73e8; text-transform: uppercase; letter-spacing: 0.3px; }
    
    .ai-scan-row { display: flex; flex-direction: row; gap: 4px; align-items: stretch; }

    .ai-queue-container {
        flex: 0 0 90px;
        border: 2px dashed #dadce0; border-radius: 10px; min-height: 70px; background: rgba(255,255,255,0.7);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        padding: 2px; gap: 2px; transition: all 0.2s; cursor: pointer; position: relative; overflow: hidden;
    }
    .ai-queue-container:hover, .ai-queue-container.drag-over { border-color: var(--vnpt-primary); background: var(--vnpt-primary-light); }
    .ai-queue-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; text-align: center; gap: 0; }
    .ai-queue-placeholder span:first-child { font-size: 16px; pointer-events: none; }
    .ai-queue-placeholder span:last-child { font-size: 8px; color: #9aa0a6; font-weight: 600; pointer-events: none; white-space: nowrap; line-height: 1.2; }
    
    .ai-queue-list { display: flex; flex-wrap: wrap; gap: 2px; overflow-y: auto; width: 100%; }
    .ai-queue-list::-webkit-scrollbar { width: 3px; }
    .ai-queue-list::-webkit-scrollbar-thumb { background: #dadce0; border-radius: 4px; }
    
    .ai-queue-item {
        flex: 0 0 auto; width: 32px; height: 32px; border-radius: 4px; position: relative; border: 1px solid #e0e0e0;
        background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden;
    }
    .ai-queue-item img { width: 100%; height: 100%; object-fit: cover; }
    .ai-queue-item .file-icon { font-size: 16px; }
    .ai-queue-item .btn-remove-item {
        position: absolute; top: 0; right: 0; background: rgba(234,67,53,0.9); color: #fff;
        width: 12px; height: 12px; font-size: 8px; display: flex; align-items: center; justify-content: center;
        border: none; cursor: pointer; border-bottom-left-radius: 4px; opacity: 0; transition: opacity 0.2s;
    }
    .ai-queue-item:hover .btn-remove-item { opacity: 1; }

    #vnpt-raw-scan-input {
        flex: 1; min-width: 0; min-height: 70px; padding: 6px; border-radius: 10px; box-sizing: border-box;
        border: 1px solid #1f5bd2ff; background: rgba(255, 255, 255, 0.8);
        font-size: 10px; font-family: inherit; resize: none; line-height: 1.4;
        transition: all 0.2s;
    }
    #vnpt-raw-scan-input:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 3px var(--vnpt-primary-light); outline: none; }
    #vnpt-raw-scan-input.ai-scanning-glow {
        border-color: #f57f17;
        animation: textPulse 1s infinite alternate;
        pointer-events: none; opacity: 0.8;
    }
    @keyframes textPulse {
        from { box-shadow: 0 0 0 2px rgba(245, 127, 23, 0.2); }
        to { box-shadow: 0 0 0 6px rgba(245, 127, 23, 0.5); border-color: #ffb300; }
    }
    
    .raw-scan-actions { 
        display: flex; 
        justify-content: space-between; 
        gap: 6px; 
        margin-top: 4px; 
        align-items: center;
    }

    .ai-tool-group {
        display: flex;
        gap: 2px;
        flex-shrink: 0;
    }
    
    .ai-main-group {
        display: flex;
        gap: 4px;
        flex: 1;
        justify-content: flex-end;
    }

    .btn-scan-action {
        padding: 0 12px;
        height: 26px;
        border-radius: 6px;
        border: none;
        font-size: 10px;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s;
        color: white;
        white-space: nowrap;
        display: flex;
        align-items: center;
        justify-content: center;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .btn-scan-action.btn-local {
        background: var(--vnpt-success);
        box-shadow: 0 2px 6px rgba(30, 142, 62, 0.2);
    }
    .btn-scan-action.btn-ai-main {
        background: var(--vnpt-primary-grad);
        box-shadow: 0 2px 6px rgba(26, 115, 232, 0.2);
        flex: 1;
        max-width: 120px;
    }

    .btn-scan-action:hover {
        transform: translateY(-1px);
        filter: brightness(1.1);
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
    .btn-scan-action:active {
        transform: translateY(0);
    }

    #vnpt-token-usage {
        font-size: 9px;
        color: #9aa0a6;
        font-weight: 600;
        white-space: nowrap;
    }

    /* ═══════════════════════════════════════════
       SECTION 5: TEMPLATE MANAGER & BOTTOM ROW
       ═══════════════════════════════════════════ */
    .bottom-export-area {
        display: flex; flex-direction: column;
        border-top: 1px solid var(--vnpt-border);
        background: rgba(255, 255, 255, 0.1);
        padding-top: 0px;
    }

    #vnpt-template-section {
        display: none;
        margin: 0;
        padding: 0;
    }

    .bottom-export-area:hover #vnpt-template-section {
        display: block;
        max-height: 350px;
        margin-bottom: 4px;
        padding-top: 2px;
    }

    .bottom-export-row { 
        display: flex; 
        align-items: center; 
        gap: 3px; 
        margin-top: 2px; 
        padding: 1px 4px 3px 4px; 
    }
    .bottom-export-row .vnpt-control-group { 
        margin-bottom: 0; 
        flex: 1; 
        min-width: 0; 
        display: flex; 
        align-items: center; 
        gap: 3px; 
    }
    .bottom-export-row .vnpt-control-group input[type="text"] { 
        height: 24px; 
        padding: 0 6px; 
        border-radius: 4px; 
        border: 1px solid rgba(31, 91, 210, 0.4); 
        flex: 1; 
        min-width: 0; 
        font-size: 10px;
        box-sizing: border-box;
        background: rgba(255, 255, 255, 0.8);
    }
    
    .btn-upload-local {
        display: flex; align-items: center; justify-content: center;
        width: 24px; height: 24px; border-radius: 4px;
        background: #f8f9fa; border: 1px solid #dadce0;
        font-size: 11px; cursor: pointer; transition: all 0.2s;
        color: #5f6368; flex-shrink: 0;
        margin: 0; padding: 0;
        box-sizing: border-box;
    }
    .btn-upload-local:hover { 
        background: #fff; border-color: var(--vnpt-primary);
        color: var(--vnpt-primary);
    }
    
    .vnpt-control-group .btn-export { 
        flex: 0 0 auto; 
        height: 24px; 
        margin: 0; 
        border-radius: 4px; 
        background: var(--vnpt-primary-grad); 
        color: white; border: none; 
        font-weight: 800; font-size: 10px; 
        padding: 0 10px; cursor: pointer; 
        display: flex; align-items: center; justify-content: center;
        text-transform: uppercase;
    }

    #vnpt-btn-export-txt { color: #00695c; border-color: rgba(0, 105, 92, 0.3); }
    #vnpt-btn-export-txt:hover { background: #00695c; color: white; border-color: transparent; }
    .text-hint { font-size: 11px; color: #70757a; font-style: italic; text-align: center; margin-bottom: 4px; }
`;
