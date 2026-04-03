// src/features/calcWidgetFeature.js

import { AppState } from '../core/state.js';
import { SK_POS_CALC, SK_TAX, SK_HIST_B, SK_HIST_A, SK_COLLAPSE, SK_CALC_MAP } from '../core/constants.js';
import { makeDraggable } from '../ui/dragDrop.js';
import { formatNum, parseNum, numToVN, capFirst } from '../utils/numberHelper.js';
import { setPageField } from '../utils/domHelper.js';
import { renderDataFillTabs } from './dataFillFeature.js'; // We will import rendering for the bottom half

// Storage helpers
function ld(k, def = null) { try { const s = localStorage.getItem(k); return s !== null ? JSON.parse(s) : def; } catch { return def; } }
function sv(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

let TAX_RATE = Number(localStorage.getItem(SK_TAX)) || 0.08;
let collapsedSections = ld(SK_COLLAPSE) ?? { calc: false, data: true };

// History functions
function saveHist(key, val) {
    if (!val || val.replace(/\D/g, '').length < 6) return;
    let arr = ld(key, []);
    arr = arr.filter(v => v !== val);
    arr.unshift(val);
    sv(key, arr.slice(0, 10));
}

function renderHist(key, listId) {
    const el = document.getElementById(listId);
    if (!el) return;
    el.innerHTML = (ld(key, [])).map(v => `<option value="${v}">`).join('');
}

function clamp(widget) {
    const vw = window.innerWidth, vh = window.innerHeight;
    const r = widget.getBoundingClientRect();
    widget.style.left = Math.min(Math.max(parseFloat(widget.style.left), 0), vw - r.width) + 'px';
    widget.style.top = Math.min(Math.max(parseFloat(widget.style.top), 0), vh - 36) + 'px';
}

function mkSecHeader(title, sectionKey, toggleCallback) {
    const hdr = document.createElement('div');
    Object.assign(hdr.style, {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '5px 10px', background: '#e9ecef', color: '#495057', fontSize: '11px',
        fontWeight: '700', borderBottom: '1px solid #dee2e6'
    });
    const s = document.createElement('span'); s.innerText = title;
    const b = document.createElement('button');
    b.className = 'wg-toggle-btn';
    b.innerText = collapsedSections[sectionKey] ? '▾' : '▴';
    Object.assign(b.style, {
        background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', padding: '0 4px'
    });
    hdr.appendChild(s);
    hdr.appendChild(b);
    
    b.onclick = () => {
        collapsedSections[sectionKey] = !collapsedSections[sectionKey];
        b.innerText = collapsedSections[sectionKey] ? '▾' : '▴';
        sv(SK_COLLAPSE, collapsedSections);
        toggleCallback(collapsedSections[sectionKey]);
    };
    return hdr;
}

export function initCalcWidget() {
    const widget = document.createElement('div');
    widget.id = 'vnpt-calc-widget';

    const savedPos = ld(SK_POS_CALC);
    const startDocked = !!(savedPos && savedPos.docked);
    Object.assign(widget.style, {
        position: 'fixed',
        top: (savedPos && savedPos.y) ? savedPos.y + 'px' : '16px',
        left: (savedPos && savedPos.x) ? savedPos.x + 'px' : (window.innerWidth - 236) + 'px',
        zIndex: '99999', width: '232px',
        fontFamily: "'Segoe UI', sans-serif", fontSize: '13px',
        borderRadius: '10px', boxShadow: '0 4px 24px rgba(0,0,0,.3)',
        overflow: 'hidden', userSelect: 'none', background: '#fff',
        transition: 'box-shadow 0.2s'
    });

    // ══════════════ ACTION BUTTONS ══════════════
    function mkBtn(label, bg, fg = '#fff') {
        const b = document.createElement('button');
        b.innerText = label;
        Object.assign(b.style, {
            padding: '3px 7px', background: bg, color: fg, border: 'none',
            borderRadius: '4px', cursor: 'pointer', fontSize: '10px',
            fontWeight: '1000'
        });
        b.onmouseover = () => b.style.filter = 'brightness(.88)';
        b.onmouseout = () => b.style.filter = 'none';
        return b;
    }

    const fillBtn = mkBtn('Fill', '#fff', '#0d6efd'); fillBtn.id = "vnpt-cw-fill";
    const syncBtn = mkBtn('Sync', '#ffc107', '#000'); syncBtn.id = "vnpt-cw-sync";
    syncBtn.title = 'Manual trigger for Sync Mapping';
    const addBtn = mkBtn('Add', 'rgba(255,255,255,0.25)', '#fff'); addBtn.id = "vnpt-cw-add";
    const resetBtn = mkBtn('↺', 'rgba(255,255,255,0.25)', '#fff'); resetBtn.id = "vnpt-cw-reset";
    resetBtn.title = 'Reset Default fields back to original';

    const btnGroup = document.createElement('div');
    Object.assign(btnGroup.style, { display: 'flex', gap: '4px', alignItems: 'center' });
    btnGroup.appendChild(fillBtn);
    btnGroup.appendChild(syncBtn);
    btnGroup.appendChild(addBtn);
    btnGroup.appendChild(resetBtn);

    // ══════════════ TITLE BAR ══════════════
    const titleBar = document.createElement('div');
    Object.assign(titleBar.style, {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 10px', background: '#198754', color: '#fff',
        cursor: 'grab', gap: '4px'
    });
    const titleLabel = document.createElement('span');
    titleLabel.style.cssText = 'font-size:12px;font-weight:700;user-select:none;display:flex;align-items:center;gap:5px;';
    titleLabel.innerHTML = 'VNPT Fast';
    titleBar.appendChild(titleLabel);
    titleBar.appendChild(btnGroup);
    widget.appendChild(titleBar);

    // ══════════════ SECTION: CALCULATOR ══════════════
    collapsedSections.calc = false; // Always default open for calc or use saved
    const calcBody = document.createElement('div');
    Object.assign(calcBody.style, {
        padding: '8px 10px', background: '#f8fbff',
        borderBottom: '1px solid #e0e8ff',
        display: 'block'
    });

    calcBody.innerHTML = `
    <div style="display:flex;align-items:center;gap:4px;margin-bottom:5px;">
        <span style="font-size:10px;color:#0d6efd;font-weight:600;width:55px;">Trước thuế</span>
        <input id="wg-before" list="wg-before-list" style="flex:1;border:1px solid #ccc;border-radius:4px;padding:3px 5px;font-size:12px;min-width:0;outline:none;">
        <button data-wgcopy="wg-before" style="padding:3px 7px;font-size:11px;cursor:pointer;border:1px solid #ccc;border-radius:4px;background:#f0f0f0;">Copy</button>
        <datalist id="wg-before-list"></datalist>
    </div>
    <div style="display:flex;align-items:center;gap:4px;margin-bottom:5px;">
        <div style="width:55px;display:flex;align-items:center;">
            <span style="font-size:10px;color:#0d6efd;font-weight:600;">Thuế</span>
            <input id="wg-taxRate" style="width:20px;border:1px solid #ccc;border-radius:3px;padding:1px;font-size:9px;text-align:center;margin:0 2px 0 3px;">
            <span style="font-size:9px;color:#555;font-weight:600;">%</span>
        </div>
        <input id="wg-tax" style="flex:1;border:1px solid #ccc;border-radius:4px;padding:3px 5px;font-size:12px;min-width:0;outline:none;">
        <button data-wgcopy="wg-tax" style="padding:3px 7px;font-size:11px;cursor:pointer;border:1px solid #ccc;border-radius:4px;background:#f0f0f0;">Copy</button>
    </div>
    <div style="display:flex;align-items:center;gap:4px;margin-bottom:5px;">
        <span style="font-size:10px;color:#0d6efd;font-weight:600;width:55px;">Sau thuế</span>
        <input id="wg-after" list="wg-after-list" style="flex:1;border:1px solid #ccc;border-radius:4px;padding:3px 5px;font-size:12px;min-width:0;outline:none;">
        <button data-wgcopy="wg-after" style="padding:3px 7px;font-size:11px;cursor:pointer;border:1px solid #ccc;border-radius:4px;background:#f0f0f0;">Copy</button>
        <datalist id="wg-after-list"></datalist>
    </div>
    <div style="display:flex;align-items:center;gap:4px;margin-bottom:5px;">
        <span style="font-size:10px;color:#0d6efd;font-weight:600;width:55px;">Bằng chữ</span>
        <input id="wg-text" readonly style="flex:1;border:1px solid #ccc;border-radius:4px;padding:3px 5px;font-size:11px;min-width:0;background:#fafafa;outline:none;">
        <button data-wgcopy="wg-text" style="padding:3px 7px;font-size:11px;cursor:pointer;border:1px solid #ccc;border-radius:4px;background:#f0f0f0;">Copy</button>
    </div>

    <div style="margin-top:6px;">
        <button id="wg-calc-map-btn" style="background:none;border:none;cursor:pointer;font-size:10px;color:#0d6efd;font-weight:600;padding:2px 0;">+ Cấu hình "Gán" tự điền</button>
    </div>
    <div id="wg-calc-map-wrap" style="display:none;margin-top:4px;padding:6px;background:#fff;border-radius:4px;border:1px solid #d0d9ff;flex-direction:column;gap:4px;">
         <div style="display:flex;align-items:center;gap:4px;">
             <span style="font-size:10px;color:#555;width:55px;">Trước thuế</span>
             <input data-clink="before" placeholder="Ví dụ: tongThanhTien, donGiaCA" style="flex:1;min-width:0;border:1px solid #ccc;border-radius:3px;padding:2px 4px;font-size:10px;outline:none;">
         </div>
         <div style="display:flex;align-items:center;gap:4px;">
             <span style="font-size:10px;color:#555;width:55px;">Tiền thuế</span>
             <input data-clink="tax" placeholder="Ví dụ: thueCA, Thue GTGT" style="flex:1;min-width:0;border:1px solid #ccc;border-radius:3px;padding:2px 4px;font-size:10px;outline:none;">
         </div>
         <div style="display:flex;align-items:center;gap:4px;">
             <span style="font-size:10px;color:#555;width:55px;">Sau thuế</span>
             <input data-clink="after" placeholder="Ví dụ: tongCongHD" style="flex:1;min-width:0;border:1px solid #ccc;border-radius:3px;padding:2px 4px;font-size:10px;outline:none;">
         </div>
         <div style="display:flex;align-items:center;gap:4px;">
             <span style="font-size:10px;color:#555;width:55px;">Bằng chữ</span>
             <input data-clink="text" placeholder="Ví dụ: tongCongHDbangChu" style="flex:1;min-width:0;border:1px solid #ccc;border-radius:3px;padding:2px 4px;font-size:10px;outline:none;">
         </div>
         <div style="font-size:9px;color:#888;margin-top:2px;line-height:1.2;">Nhập các ID hoặc nhãn trên trang, cách nhau bởi dấu phẩy. Cấu hình sẽ được Auto-save và tự điền khi tính toán.</div>
    </div>
    `;
    widget.appendChild(calcBody);

    // Document Append
    document.body.appendChild(widget);
    AppState.calcWidget = widget;

    // Call data fill functionality rendering to build the bottom half of the widget
    renderDataFillTabs(widget, mkSecHeader, clamp, collapsedSections);

    // ══════════════ DOCK LOGIC ══════════════
    const contentEls = Array.from(widget.children).filter(el => el !== titleBar);

    function applyDock(docked) {
        contentEls.forEach(el => { el.style.display = docked ? 'none' : ''; });
        titleBar.style.borderRadius = docked ? '8px' : '0';
        widget.style.borderRadius = docked ? '8px' : '10px';
        widget.style.boxShadow = docked
            ? '0 -3px 16px rgba(25,135,84,0.55)'
            : '0 4px 24px rgba(0,0,0,.3)';
        
        // Khi dock, snap top = đáy - chiều cao title bar
        if (docked) {
            widget.style.top = (window.innerHeight - titleBar.offsetHeight) + 'px';
        }
    }

    // Make Draggable
    const dragHandle = makeDraggable(widget, [titleBar], SK_POS_CALC, null, (docked) => {
        applyDock(docked);
    });

    // Khởi tạo trạng thái dock từ localStorage
    if (startDocked) applyDock(true);
    
    // Window clamp on resize
    window.addEventListener('resize', () => {
        if (dragHandle.isDocked()) {
            widget.style.top = (window.innerHeight - titleBar.offsetHeight) + 'px';
        } else {
            clamp(widget);
        }
    });

    // ─── Post Render Wiring ───
    const taxRateEl = document.getElementById('wg-taxRate');
    const beforeEl = document.getElementById('wg-before');
    const taxEl = document.getElementById('wg-tax');
    const afterEl = document.getElementById('wg-after');
    const textEl = document.getElementById('wg-text');

    const mapBtn = document.getElementById('wg-calc-map-btn');
    const mapWrap = document.getElementById('wg-calc-map-wrap');
    let calcMaps = ld(SK_CALC_MAP) ?? {};

    mapBtn.onclick = () => {
        const isVis = mapWrap.style.display === 'flex';
        mapWrap.style.display = isVis ? 'none' : 'flex';
        mapBtn.innerText = isVis ? '+ Cấu hình "Gán" tự điền' : '- Ẩn cấu hình "Gán" tự điền';
        clamp(widget);
    };

    widget.querySelectorAll('input[data-clink]').forEach(inp => {
        const key = inp.dataset.clink;
        inp.value = (calcMaps[key] || []).join(', ');
        inp.addEventListener('input', () => {
            calcMaps[key] = inp.value.split(',').map(s => s.trim()).filter(s => s);
            sv(SK_CALC_MAP, calcMaps);
        });
    });

    taxRateEl.value = TAX_RATE * 100;
    renderHist(SK_HIST_B, 'wg-before-list');
    renderHist(SK_HIST_A, 'wg-after-list');

    function calcUpdate(before, tax, after) {
        const txt = capFirst(numToVN(after)) + ' đồng';
        textEl.value = txt;

        (calcMaps.before || []).forEach(n => setPageField(n, formatNum(before)));
        (calcMaps.tax || []).forEach(n => setPageField(n, formatNum(tax)));
        (calcMaps.after || []).forEach(n => setPageField(n, formatNum(after)));
        (calcMaps.text || []).forEach(n => setPageField(n, txt));
    }

    function fromBefore() {
        const b = parseNum(beforeEl.value), t = Math.round(b * TAX_RATE), a = b + t;
        taxEl.value = formatNum(t); afterEl.value = formatNum(a);
        calcUpdate(b, t, a);
    }
    function fromTax() {
        const t = parseNum(taxEl.value), b = Math.round(t / TAX_RATE), a = b + t;
        beforeEl.value = formatNum(b); afterEl.value = formatNum(a);
        calcUpdate(b, t, a);
    }
    function fromAfter() {
        const a = parseNum(afterEl.value), b = Math.round(a / (1 + TAX_RATE)), t = a - b;
        beforeEl.value = formatNum(b); taxEl.value = formatNum(t);
        calcUpdate(b, t, a);
    }

    taxRateEl.addEventListener('input', () => {
        TAX_RATE = Number(taxRateEl.value) / 100 || 0;
        localStorage.setItem(SK_TAX, TAX_RATE);
        fromBefore();
    });
    beforeEl.addEventListener('input', () => {
        const b = parseNum(beforeEl.value), t = Math.round(b * TAX_RATE), a = b + t;
        taxEl.value = formatNum(t); afterEl.value = formatNum(a);
        textEl.value = capFirst(numToVN(a)) + ' đồng';
    });
    beforeEl.addEventListener('blur', () => { 
        beforeEl.value = formatNum(parseNum(beforeEl.value)); 
        saveHist(SK_HIST_B, beforeEl.value); 
        renderHist(SK_HIST_B, 'wg-before-list'); 
    });
    beforeEl.addEventListener('change', () => { 
        beforeEl.value = formatNum(parseNum(beforeEl.value)); 
        saveHist(SK_HIST_B, beforeEl.value); 
        renderHist(SK_HIST_B, 'wg-before-list'); 
        fromBefore(); 
    });
    taxEl.addEventListener('input', fromTax);
    afterEl.addEventListener('input', fromAfter);
    afterEl.addEventListener('blur', () => { 
        afterEl.value = formatNum(parseNum(afterEl.value)); 
        saveHist(SK_HIST_A, afterEl.value); 
        renderHist(SK_HIST_A, 'wg-after-list'); 
    });
    afterEl.addEventListener('change', () => { 
        afterEl.value = formatNum(parseNum(afterEl.value)); 
        saveHist(SK_HIST_A, afterEl.value); 
        renderHist(SK_HIST_A, 'wg-after-list'); 
        fromAfter(); 
    });

    calcBody.querySelectorAll('button[data-wgcopy]').forEach(btn => {
        btn.addEventListener('click', () => {
            const val = document.getElementById(btn.dataset.wgcopy)?.value ?? '';
            navigator.clipboard.writeText(val);
            if (btn.dataset.wgcopy === 'wg-before') { saveHist(SK_HIST_B, val); renderHist(SK_HIST_B, 'wg-before-list'); }
            if (btn.dataset.wgcopy === 'wg-after') { saveHist(SK_HIST_A, val); renderHist(SK_HIST_A, 'wg-after-list'); }
            btn.textContent = '✓'; setTimeout(() => btn.textContent = 'Copy', 1000);
        });
    });
}
