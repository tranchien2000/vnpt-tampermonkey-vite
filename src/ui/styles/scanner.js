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
    
    .pdf-dlg-cols {
        display: flex; gap: 12px; flex: 1; overflow: hidden; margin-bottom: 16px;
    }
    
    .pdf-col-left {
        flex: 1; background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 12px;
        padding: 12px; overflow-y: auto; font-family: 'Courier New', monospace;
        font-size: 12px; line-height: 1.6; color: #3c4043; white-space: pre-wrap;
    }
    
    .pdf-col-right {
        flex: 1.2; display: flex; flex-direction: column; overflow: hidden;
        border: 1px solid #e0e0e0; border-radius: 12px;
    }

    .pdf-dlg-body { flex: 1; overflow-y: auto; }

    .pdf-result-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
    .pdf-result-table th { background: #f8f9fa; padding: 10px; text-align: left; font-weight: 800; color: #5f6368; position: sticky; top: 0; z-index: 2; border-bottom: 1px solid #e0e0e0; }
    .pdf-result-table td { padding: 8px; border-bottom: 1px solid #f1f3f4; vertical-align: middle; }
    .pdf-row-auto td { background: #fff; }
    .pdf-row-auto:hover td { background: #f8f9fa; }

    .pdf-val-input {
        width: 100%; padding: 6px 10px; border: 1px solid #dadce0; border-radius: 6px;
        font-size: 12px; font-weight: 600; color: #1a73e8; transition: all 0.2s;
        box-sizing: border-box;
    }
    .pdf-val-input:focus { border-color: var(--vnpt-primary); outline: none; box-shadow: 0 0 0 3px var(--vnpt-primary-light); }

    .vnpt-pdf-actions { display: flex; gap: 8px; justify-content: flex-end; align-items: center; border-top: 1px solid #f1f3f4; padding-top: 12px; }
    
    .pdf-btn-cancel, .pdf-btn-confirm, .pdf-btn-reparse {
        padding: 8px 16px; border: none; border-radius: 8px;
        font-weight: 700; cursor: pointer; transition: 0.2s; font-size: 11px;
    }
    
    .pdf-btn-cancel {
        background: #f1f3f4; color: #3c4043;
    }
    .pdf-btn-cancel:hover { background: #e8eaed; }
    
    .pdf-btn-reparse {
        background: var(--vnpt-success); color: #fff;
    }
    .pdf-btn-reparse:hover { background: #177a33; box-shadow: 0 4px 12px rgba(30, 142, 62, 0.3); }
    
    .pdf-btn-confirm {
        background: var(--vnpt-primary); color: #fff;
    }
    .pdf-btn-confirm:hover { background: var(--vnpt-primary-hover); box-shadow: 0 4px 12px rgba(26, 115, 232, 0.3); }

    /* ═══════════════════════════════════════════
       SECTION 8: AI SCANNER UI
       ═══════════════════════════════════════════ */
    #vnpt-btn-ai-mode.active { background: var(--vnpt-primary); color: #fff; box-shadow: 0 4px 10px rgba(26, 115, 232, 0.3); }

    .vnpt-ai-scanner-section {
        padding: 8px; background: rgba(255, 255, 255, 0.5); border-bottom: 1px solid var(--vnpt-border);
        display: flex; flex-direction: column; gap: 6px;
    }

    .ai-scanner-header { display: flex; align-items: center; justify-content: space-between; }
    .ai-title { font-size: 11px; font-weight: 800; color: #1a73e8; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .ai-scan-row { display: flex; flex-direction: row; gap: 6px; align-items: stretch; }

    .ai-queue-container {
        flex: 0 0 110px;
        border: 2px dashed #dadce0; border-radius: 12px; min-height: 100px; background: rgba(255,255,255,0.7);
        display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
        padding: 4px; gap: 4px; transition: all 0.2s; cursor: pointer; position: relative; overflow: hidden;
    }
    .ai-queue-container:hover, .ai-queue-container.drag-over { border-color: var(--vnpt-primary); background: var(--vnpt-primary-light); }
    .ai-queue-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; text-align: center; gap: 2px; }
    .ai-queue-placeholder span:first-child { font-size: 20px; pointer-events: none; }
    .ai-queue-placeholder span:last-child { font-size: 9px; color: #9aa0a6; font-weight: 600; pointer-events: none; white-space: nowrap; line-height: 1.3; }
    
    .ai-queue-list { display: flex; flex-wrap: wrap; gap: 4px; overflow-y: auto; width: 100%; }
    .ai-queue-list::-webkit-scrollbar { width: 3px; }
    .ai-queue-list::-webkit-scrollbar-thumb { background: #dadce0; border-radius: 4px; }
    
    .ai-queue-item {
        flex: 0 0 auto; width: 40px; height: 40px; border-radius: 6px; position: relative; border: 1px solid #e0e0e0;
        background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden;
    }
    .ai-queue-item img { width: 100%; height: 100%; object-fit: cover; }
    .ai-queue-item .file-icon { font-size: 20px; }
    .ai-queue-item .btn-remove-item {
        position: absolute; top: 0; right: 0; background: rgba(234,67,53,0.9); color: #fff;
        width: 14px; height: 14px; font-size: 9px; display: flex; align-items: center; justify-content: center;
        border: none; cursor: pointer; border-bottom-left-radius: 4px; opacity: 0; transition: opacity 0.2s;
    }
    .ai-queue-item:hover .btn-remove-item { opacity: 1; }

    #vnpt-raw-scan-input {
        flex: 1; min-width: 0; min-height: 100px; padding: 8px; border-radius: 12px; box-sizing: border-box;
        border: 1px solid #1f5bd2ff; background: rgba(255, 255, 255, 0.8);
        font-size: 11px; font-family: inherit; resize: none; line-height: 1.5;
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
    
    .raw-scan-actions { display: flex; justify-content: space-between; gap: 6px; margin-top: 4px; }
    .raw-scan-actions .vnpt-btn-confirm { padding: 6px 12px; font-size: 11px; height: auto; flex: 1; text-align: center; }
    .btn-local-process { background: var(--vnpt-success) !important; box-shadow: 0 4px 12px rgba(30, 142, 62, 0.2) !important; flex: 1; }
    .btn-local-process:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-ai-process { background: var(--vnpt-primary-grad) !important; box-shadow: 0 4px 12px rgba(26, 115, 232, 0.2) !important; font-weight: 800; flex: 1.3;}

    /* ═══════════════════════════════════════════
       SECTION 5: TEMPLATE MANAGER & BOTTOM ROW
       ═══════════════════════════════════════════ */
    .bottom-export-area {
        display: flex; flex-direction: column;
        border-top: 1px solid var(--vnpt-border);
        background: rgba(255, 255, 255, 0.1);
        padding-top: 2px;
    }

    #vnpt-template-section {
        display: none;
        margin: 0;
        padding: 0;
    }

    .bottom-export-area:hover #vnpt-template-section {
        display: block;
        max-height: 400px;
        margin-bottom: 8px;
        padding-top: 4px;
    }

    .bottom-export-row { display: flex; align-items: center; gap: 6px; margin-top: 4px; padding: 0 4px; }
    .bottom-export-row .vnpt-control-group { margin-bottom: 0; flex: 1; min-width: 0; display: flex; align-items: center; gap: 4px; }
    .bottom-export-row .vnpt-control-group input[type="text"] { height: 24px; padding: 2px 8px; border-radius: 6px; border: 1px solid #1f5bd2ff; flex: 1; min-width: 0; font-size: 11px; }
    
    .btn-upload-local {
        display: inline-flex; align-items: center; justify-content: center;
        width: 24px; height: 24px; border-radius: 6px;
        background: rgba(0,0,0,0.04); border: 1px solid #dadce0;
        font-size: 12px; cursor: pointer; transition: all 0.2s;
        color: #5f6368; box-sizing: border-box;
        flex-shrink: 0;
    }
    .btn-upload-local:hover { 
        background: var(--vnpt-primary-light); border-color: var(--vnpt-primary);
        color: var(--vnpt-primary); transform: scale(1.05);
    }
    
    .vnpt-control-group .btn-export { flex: 0 0 auto; height: 24px; margin: 0; border-radius: 6px; background: var(--vnpt-primary-grad); color: white; border: none; font-weight: 800; font-size: 11px; padding: 0 12px; cursor: pointer; }
    .vnpt-control-group .btn-export:hover { opacity: 0.9; transform: translateY(-1px); }

    #vnpt-btn-export-txt { color: #00695c; border-color: rgba(0, 105, 92, 0.3); }
    #vnpt-btn-export-txt:hover { background: #00695c; color: white; border-color: transparent; }
    .text-hint { font-size: 11px; color: #70757a; font-style: italic; text-align: center; margin-bottom: 4px; }
`;
