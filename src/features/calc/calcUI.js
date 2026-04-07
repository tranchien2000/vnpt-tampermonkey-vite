/**
 * @file calcUI.js
 * @desc Xử lý tạo DOM và gán Event Listeners cho Calc Widget.
 */
import { AppState } from '../../core/state.js';
import { SK_TAX, SK_HIST_B, SK_HIST_A, SK_COLLAPSE, SK_CALC_MAP } from '../../core/constants.js';
import { ld, sv, saveHist, renderHist } from './calcHistory.js';
import { calculateValues, syncToPage } from './calcLogic.js';
import { formatNum, parseNum } from '../../utils/numberHelper.js';
import { renderDataFillTabs } from '../dataFill/index.js';
import { makeDraggable } from '../../ui/dragDrop.js';
import { DEFAULT_CALC_MAP, DEFAULT_TAX_RATE } from '../../core/defaults.js';

export function createCalcUI(widget, container, SK_POS_CALC) {
    let TAX_RATE = Number(localStorage.getItem(SK_TAX)) || DEFAULT_TAX_RATE;
    let collapsedSections = ld(SK_COLLAPSE) ?? { calc: false, data: true };

    // Internal helpers
    function mkBtn(label, extraClass) {
        const b = document.createElement('button');
        b.innerText = label;
        b.className = 'cw-action-btn ' + extraClass;
        return b;
    }

    function mkSecHeader(title, sectionKey, toggleCallback) {
        const hdr = document.createElement('div');
        hdr.className = 'wg-sec-header';
        const s = document.createElement('span'); s.innerText = title;
        const b = document.createElement('button');
        b.className = 'wg-toggle-btn';
        b.innerText = collapsedSections[sectionKey] ? '▾' : '▴';
        hdr.appendChild(s); hdr.appendChild(b);
        b.onclick = () => {
            collapsedSections[sectionKey] = !collapsedSections[sectionKey];
            b.innerText = collapsedSections[sectionKey] ? '▾' : '▴';
            sv(SK_COLLAPSE, collapsedSections);
            toggleCallback(collapsedSections[sectionKey]);
        };
        return hdr;
    }

    function clamp(w) {
        const vw = window.innerWidth, vh = window.innerHeight;
        const r = w.getBoundingClientRect();
        w.style.left = Math.min(Math.max(parseFloat(w.style.left), 0), vw - r.width) + 'px';
        w.style.top = Math.min(Math.max(parseFloat(w.style.top), 0), vh - 36) + 'px';
    }

    // ─── Render Title Bar (Only if NOT embedded) ───
    const titleBar = document.createElement('div');
    if (!container) {
        titleBar.className = 'cw-title-bar';
        titleBar.innerHTML = `<span class="cw-title-label">VNPT Fast</span>`;

        const btnGroup = document.createElement('div');
        btnGroup.className = 'cw-btn-group';
        const btns = {
            fill: mkBtn('Fill', 'cw-btn-fill'),
            sync: mkBtn('Sync', 'cw-btn-sync'),
            add: mkBtn('Add', 'cw-btn-add'),
            reset: mkBtn('↺', 'cw-btn-reset')
        };
        btns.reset.title = 'Reset Default fields';
        Object.values(btns).forEach(b => btnGroup.appendChild(b));
        titleBar.appendChild(btnGroup);
        widget.appendChild(titleBar);
    }

    // ─── Render Body ───
    const calcBody = document.createElement('div');
    calcBody.className = 'cw-body-inline';
    calcBody.innerHTML = `
    <div class="cw-inline-row">
        <input id="wg-before" class="cw-input-inline" placeholder="Trước thuế" list="wg-before-list" title="Trước thuế">
        <datalist id="wg-before-list"></datalist>
        <div class="cw-tax-group-inline"><input id="wg-taxRate" class="cw-tax-input-inline" title="Thuế (%)"><span class="cw-tax-symbol">%</span></div>
        <input id="wg-tax" class="cw-input-inline" placeholder="Tiền thuế" title="Tiền thuế">
        <input id="wg-after" class="cw-input-inline" placeholder="Sau thuế" list="wg-after-list" title="Sau thuế">
        <datalist id="wg-after-list"></datalist>
        <input id="wg-text" class="cw-input-inline cw-input-readonly-inline" placeholder="Bằng chữ" readonly title="Bằng chữ">
    </div>`;

    if (container) container.appendChild(calcBody);
    else widget.appendChild(calcBody);

    // Data tabs (Only if NOT embedded, keeping it simple for now)
    if (!container) {
        renderDataFillTabs(widget, mkSecHeader, clamp, collapsedSections);
    }

    // ─── Event Wiring ───
    const els = {
        taxRate: document.getElementById('wg-taxRate'),
        before: document.getElementById('wg-before'),
        tax: document.getElementById('wg-tax'),
        after: document.getElementById('wg-after'),
        text: document.getElementById('wg-text')
    };

    els.taxRate.value = TAX_RATE * 100;
    renderHist(SK_HIST_B, 'wg-before-list');
    renderHist(SK_HIST_A, 'wg-after-list');

    function update(type, val) {
        const res = calculateValues(type, val, TAX_RATE);
        els.before.value = res.beforeStr;
        els.tax.value = res.taxStr;
        els.after.value = res.afterStr;
        els.text.value = res.textStr;
        
        // Luôn lấy mapping mới nhất từ Storage
        const currentMaps = ld(SK_CALC_MAP) || { ...DEFAULT_CALC_MAP };
        syncToPage(res, currentMaps);
    }

    els.taxRate.oninput = () => { TAX_RATE = Number(els.taxRate.value) / 100 || 0; sv(SK_TAX, TAX_RATE); update('before', els.before.value); };
    els.before.oninput = () => { const res = calculateValues('before', els.before.value, TAX_RATE); els.tax.value = res.taxStr; els.after.value = res.afterStr; els.text.value = res.textStr; };
    els.before.onchange = () => { update('before', els.before.value); saveHist(SK_HIST_B, els.before.value); renderHist(SK_HIST_B, 'wg-before-list'); };
    els.tax.oninput = () => update('tax', els.tax.value);
    els.after.oninput = () => update('after', els.after.value);
    els.after.onchange = () => { update('after', els.after.value); saveHist(SK_HIST_A, els.after.value); renderHist(SK_HIST_A, 'wg-after-list'); };

    // Copy on click/focus
    [els.before, els.tax, els.after, els.text].forEach(el => {
        ['click', 'focus'].forEach(evt => el.addEventListener(evt, () => {
            if (!el.value) return;
            navigator.clipboard.writeText(el.value);
            const old = el.style.backgroundColor; el.style.backgroundColor = '#d1e7dd';
            setTimeout(() => el.style.backgroundColor = old, 300);
        }));
    });

    // ─── Drag & Dock (Only if NOT embedded) ───
    if (!container) {
        const content = Array.from(widget.children).filter(el => el !== titleBar);
        const handler = makeDraggable(widget, [titleBar], SK_POS_CALC, null, (docked) => {
            content.forEach(el => el.style.display = docked ? 'none' : '');
            titleBar.style.borderRadius = docked ? '8px' : '0';
            if (docked) widget.style.top = (window.innerHeight - (titleBar.offsetHeight || 34)) + 'px';
        });
        const savedPos = ld(SK_POS_CALC);
        if (savedPos && savedPos.docked) handler.setDocked(true);

        window.addEventListener('resize', () => {
            if (handler.isDocked()) widget.style.top = (window.innerHeight - titleBar.offsetHeight) + 'px';
            else clamp(widget);
        });

        return handler;
    }

    return null;
}
