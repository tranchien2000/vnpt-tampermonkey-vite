export const linkerStyles = `
    /* ═══════════════════════════════════════════
       SECTION 10: FIELD LINKER
       ═══════════════════════════════════════════ */

    /* Nút 🔗 trên mỗi field row */
    .btn-field-link {
        flex: 0 0 22px;
        width: 22px;
        height: 22px;
        border-radius: 5px;
        border: 1px solid rgba(26, 115, 232, 0.25);
        background: rgba(26, 115, 232, 0.06);
        color: #1a73e8;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        line-height: 1;
        padding: 0;
        flex-shrink: 0;
        transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .btn-field-link:hover {
        background: var(--vnpt-primary);
        color: white;
        border-color: var(--vnpt-primary);
        transform: scale(1.15) rotate(-5deg);
        box-shadow: 0 3px 8px rgba(26, 115, 232, 0.35);
    }
    .btn-field-link.active {
        background: #f57f17;
        color: white;
        border-color: #e65100;
        box-shadow: 0 0 0 3px rgba(245, 127, 23, 0.3);
        animation: pulse-orange 1.2s infinite;
    }

    @keyframes pulse-orange {
        0% { box-shadow: 0 0 0 0 rgba(245, 127, 23, 0.4); }
        70% { box-shadow: 0 0 0 6px rgba(245, 127, 23, 0); }
        100% { box-shadow: 0 0 0 0 rgba(245, 127, 23, 0); }
    }

    /* Con trỏ crosshair khi ở chế độ linking */
    .vnpt-linking-mode,
    .vnpt-linking-mode *:not(.vnpt-linking-banner):not(.vnpt-linking-banner *) {
        cursor: crosshair !important;
    }

    /* Hover highlight - xanh dương (element chuẩn bị được link) */
    .vnpt-link-highlight {
        outline: 2.5px solid #1a73e8 !important;
        outline-offset: 3px !important;
        position: relative;
        z-index: 9999990 !important;
        animation: linkPulse 0.9s infinite alternate;
    }
    @keyframes linkPulse {
        from { outline-color: #1a73e8; outline-offset: 2px; box-shadow: 0 0 0 0 rgba(26,115,232,0.2); }
        to   { outline-color: #4fc3f7; outline-offset: 5px; box-shadow: 0 0 12px 4px rgba(26,115,232,0.15); }
    }

    /* Existing highlight - xanh lá (element ĐÃ được link) */
    .vnpt-link-existing {
        outline: 2.5px solid #1e8e3e !important;
        outline-offset: 3px !important;
        position: relative;
        z-index: 9999989 !important;
        animation: existingPulse 1.2s infinite alternate;
    }
    @keyframes existingPulse {
        from { outline-color: #1e8e3e; outline-offset: 2px; box-shadow: 0 0 0 0 rgba(30,142,62,0.2); }
        to   { outline-color: #34a853; outline-offset: 5px; box-shadow: 0 0 10px 3px rgba(30,142,62,0.15); }
    }

    /* Unlink hover - đỏ/cam (hover trên element đã link =Click để BỎ link) */
    .vnpt-unlink-hover {
        outline: 2.5px solid #ea4335 !important;
        outline-offset: 3px !important;
        position: relative;
        z-index: 9999991 !important;
        animation: unlinkPulse 0.7s infinite alternate;
    }
    .vnpt-unlink-hover::after {
        content: '🔓';
        position: absolute;
        top: -18px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 12px;
        pointer-events: none;
        z-index: 9999992;
    }
    @keyframes unlinkPulse {
        from { outline-color: #ea4335; outline-offset: 2px; box-shadow: 0 0 0 0 rgba(234,67,53,0.2); }
        to   { outline-color: #ff7043; outline-offset: 5px; box-shadow: 0 0 10px 3px rgba(234,67,53,0.18); }
    }

    /* Banner hướng dẫn nổi ở đầu trang */
    .vnpt-linking-banner {
        position: fixed;
        top: 18px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
        color: white;
        padding: 8px 20px;
        border-radius: 30px;
        font-size: 12px;
        font-weight: 600;
        z-index: 99999999;
        box-shadow: 0 8px 28px rgba(26, 115, 232, 0.5);
        white-space: nowrap;
        letter-spacing: 0.3px;
        display: flex;
        align-items: center;
        gap: 6px;
        animation: bannerSlideDown 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .vnpt-linking-banner kbd {
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.4);
        border-radius: 4px;
        padding: 1px 6px;
        font-family: inherit;
        font-size: 11px;
    }
    /* Badge đếm số links đã chọn */
    .vnpt-link-count-badge {
        background: #34a853;
        color: white;
        font-size: 10px;
        font-weight: 800;
        padding: 2px 8px;
        border-radius: 20px;
        letter-spacing: 0.3px;
        animation: badgePop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes badgePop {
        from { transform: scale(0.7); opacity: 0.5; }
        to   { transform: scale(1);   opacity: 1; }
    }
    /* Nút "✅ Xong" bên trong banner */
    .vnpt-link-done-btn {
        background: rgba(255,255,255,0.22);
        border: 1px solid rgba(255,255,255,0.5);
        color: white;
        border-radius: 20px;
        padding: 3px 12px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
    }
    .vnpt-link-done-btn:hover {
        background: rgba(255,255,255,0.35);
        transform: scale(1.05);
    }
    .vnpt-link-done-btn:active { transform: scale(0.96); }

    @keyframes bannerSlideDown {
        from { opacity: 0; transform: translateX(-50%) translateY(-16px) scale(0.9); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0)      scale(1); }
    }
`;
