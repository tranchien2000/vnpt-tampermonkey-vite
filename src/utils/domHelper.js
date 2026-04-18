import { findBestMatch, cleanProvinceName, parseAddressComponents } from './stringHelper.js';
import { sleep } from './common.js';

// ─── DOM Map ───
let FullDOMMap = {
    byId: new Map(),
    byName: new Map(),
    byPlaceholder: new Map(),
    byLabel: new Map(),
    allInputs: []
};

let lastMapBuild = 0;
const MAP_BUILD_COOLDOWN = 1500;
let cachedAddressGroup = null;

/**
 * Xóa bộ nhớ đệm DOM.
 */
export function clearDOMCache() {
    FullDOMMap.byId.clear();
    FullDOMMap.byName.clear();
    FullDOMMap.byPlaceholder.clear();
    FullDOMMap.byLabel.clear();
    FullDOMMap.allInputs = [];
    cachedAddressGroup = null;
}

export function invalidateDOMMap() {
    lastMapBuild = 0;
}

/**
 * Xây dựng bản đồ toàn bộ DOM để truy vấn nhanh O(1).
 */
export function buildFullDOMMap(force = false) {
    const now = Date.now();
    if (!force && lastMapBuild !== 0 && now - lastMapBuild < MAP_BUILD_COOLDOWN && FullDOMMap.allInputs.length > 0) {
        return;
    }

    lastMapBuild = now;
    clearDOMCache();

    // 1. Quét toàn bộ các control nhập liệu
    const inputs = document.querySelectorAll('input, textarea, select, ng-select2, [contenteditable="true"]');
    FullDOMMap.allInputs = Array.from(inputs);

    FullDOMMap.allInputs.forEach(el => {
        const id = el.id ? el.id.toLowerCase() : null;
        const name = (el.name || el.getAttribute('formcontrolname'))?.toLowerCase();
        const placeholder = el.getAttribute('placeholder')?.toLowerCase().trim();

        if (id) FullDOMMap.byId.set(id, el);
        if (name) FullDOMMap.byName.set(name, el);
        if (placeholder) FullDOMMap.byPlaceholder.set(placeholder, el);
    });

    // 2. Quét toàn bộ nhãn (Label) và ánh xạ tới input gần nhất
    const labels = document.querySelectorAll('label, .label, .label-text, span.title, .form-label');
    labels.forEach(lbl => {
        const text = lbl.innerText.trim().toLowerCase();
        if (!text || text.length < 2) return;

        let targetEl = null;
        if (lbl.htmlFor) {
            targetEl = document.getElementById(lbl.htmlFor);
        }

        if (!targetEl) {
            const parent = lbl.closest('.form-group, .row, .col-sm-6, td, .form-item');
            if (parent) targetEl = parent.querySelector('input, textarea, select');
        }

        if (targetEl) {
            FullDOMMap.byLabel.set(text, targetEl);
        }
    });

    console.debug(`[DOM Map] Indexed ${FullDOMMap.allInputs.length} controls.`);
}

/**
 * Tìm input thông minh sử dụng Map đã build sẵn (O(1))
 */
export function findPageInput(name, labelText = null) {
    if (!name && !labelText) return null;

    if (FullDOMMap.allInputs.length === 0) buildFullDOMMap();

    const resolveToInput = (el) => {
        if (!el) return null;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.getAttribute('contenteditable') === 'true') {
            return el;
        }
        return el.querySelector('input, textarea, select, [contenteditable="true"]');
    };

    const nLower = name ? name.toLowerCase() : null;
    const lLower = labelText ? labelText.toLowerCase() : null;

    // 1. THỬ KHỚP CHÍNH XÁC ID/NAME
    if (nLower) {
        let el = FullDOMMap.byId.get(nLower) || FullDOMMap.byName.get(nLower) || FullDOMMap.byPlaceholder.get(nLower);
        if (el && document.contains(el)) return resolveToInput(el);
    }

    // 2. KHỚP THEO LABEL
    if (lLower) {
        let el = FullDOMMap.byLabel.get(lLower);
        if (el && document.contains(el)) return resolveToInput(el);
    }

    return null;
}

export function getInputByLabel(text) {
    return findPageInput(null, text);
}

export function setPageField(name, value, labelText = null) {
    const el = findPageInput(name, labelText);
    if (el) {
        syncSetValue(el, value);
        return true;
    }
    return false;
}

export function triggerCustom(el) {
    if (!el) return;
    const eventOptions = { bubbles: true, cancelable: true, composed: true };
    el.dispatchEvent(new Event('focus', eventOptions));
    el.dispatchEvent(new Event('input', eventOptions));
    el.dispatchEvent(new Event('change', eventOptions));

    if (el.tagName === 'SELECT') {
        el.dispatchEvent(new CustomEvent('select2:select', { ...eventOptions, detail: { data: { id: el.value } } }));
        let parentComp = el.closest('ng-select2, .select2-container, .form-group');
        if (parentComp) {
            parentComp.dispatchEvent(new Event('change', eventOptions));
            parentComp.dispatchEvent(new Event('input', eventOptions));
        }
        try {
            const $ = window.jQuery || window.$;
            if ($ && typeof $(el).trigger === 'function') {
                $(el).trigger('change');
                $(el).trigger('select2:select');
            }
        } catch (e) {}
    }
    el.dispatchEvent(new Event('blur', eventOptions));
}

function highlightElement(el, type = 'success') {
    if (!el) return;
    const color = type === 'success' ? '#28a745' : '#dc3545';
    const originalTransition = el.style.transition;
    const originalOutline = el.style.outline;
    el.style.transition = 'all 0.3s ease';
    el.style.outline = `2px solid ${color}`;
    setTimeout(() => {
        el.style.outline = originalOutline;
        setTimeout(() => { el.style.transition = originalTransition; }, 300);
    }, 1000);
}

export function syncSetValue(el, value) {
    if (!el || value === undefined || value === null) return false;

    const actualEl = el.tagName === 'NG-SELECT2' ? el.querySelector('select') || el : el;

    if (el.tagName === 'SELECT' || el.tagName === 'NG-SELECT2') {
        const selectEl = actualEl;
        const options = Array.from(selectEl.options || []);
        let searchVal = value.toString().trim().toLowerCase();

        let foundOption = options.find(o => o.value.toLowerCase() === searchVal || o.text.trim().toLowerCase() === searchVal);

        if (!foundOption) {
            const cleanVal = cleanProvinceName(searchVal);
            foundOption = options.find(o => cleanProvinceName(o.text.trim().toLowerCase()) === cleanVal);
        }

        if (foundOption) {
            selectEl.value = foundOption.value;
            triggerCustom(selectEl);
            highlightElement(el, 'success');
            return true;
        }
        return false;
    } else {
        const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
        if (setter) setter.call(el, value);
        else el.value = value;
        triggerCustom(el);
        highlightElement(el, 'success');
        return true;
    }
}

export async function setPageFieldsSequential(names, value) {
    if (!names || !names.length) return;
    
    for (const name of names) {
        const el = findPageInput(name);
        if (el) {
            syncSetValue(el, value);
            await sleep(20);
        }
    }
}

export function getVNPTAddressGroup() {
    if (cachedAddressGroup) return cachedAddressGroup;
    try {
        const mainRows = Array.from(document.querySelectorAll('form .row.row-form, .row.row-form'));
        const targetRow = mainRows[2]; 
        if (!targetRow) return null;
        const subCols = targetRow.querySelectorAll('.col-12.col-sm-6, .col-sm-6');
        if (subCols.length < 2) return null;
        const leftCol = subCols[0];
        const rightCol = subCols[1];
        const findDeep = (col, selector) => col.querySelector(selector);
        const controlsInRight = Array.from(rightCol.querySelectorAll('select, ng-select2, input'));
        cachedAddressGroup = {
            tinh: findDeep(leftCol, 'select, ng-select2'),
            xaIdNew: findDeep(rightCol, '[id*="xaIdNew" i], [id*="huyenId" i]') || controlsInRight[0],
            duong: findDeep(rightCol, '[id*="duong" i]') || controlsInRight[controlsInRight.length - 1]
        };
        return cachedAddressGroup;
    } catch (e) { return null; }
}

export function refreshLabelsCache() {
    return Array.from(document.querySelectorAll('label, .label, .label-text, span.title, .form-label'));
}
