export const tipsStyles = `
    /* ═══════════════════════════════════════════
       TIPS MODAL
       ═══════════════════════════════════════════ */
    .vnpt-tips-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        z-index: 10000000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .vnpt-tips-content {
        background: white;
        border-radius: 16px;
        width: 90%;
        max-width: 700px;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    @keyframes slideUp {
        from {
            transform: translateY(30px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .vnpt-tips-header {
        padding: 20px 24px;
        border-bottom: 2px solid var(--vnpt-primary-light);
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: linear-gradient(135deg, rgba(26, 115, 232, 0.05) 0%, rgba(26, 115, 232, 0.02) 100%);
        border-radius: 16px 16px 0 0;
    }

    .vnpt-tips-header h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 800;
        color: var(--vnpt-primary);
        letter-spacing: 0.3px;
    }

    .vnpt-tips-close {
        width: 32px;
        height: 32px;
        border: none;
        background: rgba(0, 0, 0, 0.05);
        border-radius: 8px;
        cursor: pointer;
        font-size: 18px;
        color: #5f6368;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    }

    .vnpt-tips-close:hover {
        background: var(--vnpt-danger);
        color: white;
        transform: scale(1.1);
    }

    .vnpt-tips-body {
        padding: 20px 24px;
        overflow-y: auto;
        flex: 1;
    }

    .vnpt-tips-body::-webkit-scrollbar {
        width: 8px;
    }

    .vnpt-tips-body::-webkit-scrollbar-track {
        background: #f1f3f4;
        border-radius: 10px;
    }

    .vnpt-tips-body::-webkit-scrollbar-thumb {
        background: #dadce0;
        border-radius: 10px;
    }

    .vnpt-tips-body::-webkit-scrollbar-thumb:hover {
        background: #bdc1c6;
    }

    .tips-section {
        margin-bottom: 24px;
        padding: 16px;
        background: rgba(26, 115, 232, 0.02);
        border-radius: 12px;
        border-left: 4px solid var(--vnpt-primary);
    }

    .tips-section:last-child {
        margin-bottom: 0;
    }

    .tips-section h3 {
        margin: 0 0 12px 0;
        font-size: 15px;
        font-weight: 800;
        color: var(--vnpt-primary);
        letter-spacing: 0.3px;
    }

    .tips-section ul {
        margin: 0;
        padding-left: 20px;
        list-style: none;
    }

    .tips-section li {
        margin-bottom: 10px;
        font-size: 13px;
        line-height: 1.6;
        color: #3c4043;
        position: relative;
        padding-left: 8px;
    }

    .tips-section li:last-child {
        margin-bottom: 0;
    }

    .tips-section li::before {
        content: "▸";
        position: absolute;
        left: -12px;
        color: var(--vnpt-primary);
        font-weight: bold;
    }

    .tips-section li strong {
        color: var(--vnpt-primary);
        font-weight: 700;
    }
`;
