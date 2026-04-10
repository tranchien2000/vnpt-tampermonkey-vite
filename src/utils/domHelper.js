import { findBestMatch } from './stringHelper.js';

// ─── DOM Map ───
let FullDOMMap = {
    byId: new Map(),
    byName: new Map(),
    byPlaceholder: new Map(),
    byLabel: new Map(),
    allInputs: []
};

let LabelCache = [];
let lastLabelUpdate = 0;

/**
 * Xóa bộ nhớ đệm DOM khi trang thay đổi cấu trúc lớn.
 */
export function clearDOMCache() {
    FullDOMMap.byId.clear();
    FullDOMMap.byName.clear();
    FullDOMMap.byPlaceholder.clear();
    FullDOMMap.byLabel.clear();
    FullDOMMap.allInputs = [];
}

/**
 * Cập nhật lại danh sách labels từ DOM.
 */
export function refreshLabelsCache() {
    LabelCache = Array.from(document.querySelectorAll('label, .label, .label-text, span.title, .form-label'));
    lastLabelUpdate = Date.now();
    return LabelCache;
}

/**
 * Xây dựng bản đồ toàn bộ DOM để truy vấn nhanh O(1).
 * Nên gọi hàm này trước khi thực hiện Quét hàng loạt.
 */
export function buildFullDOMMap() {
    const start = performance.now();
    clearDOMCache();
    
    // 1. Lấy tất cả các control nhập liệu (Bao gồm ng-select2 của Angular)
    const inputs = Array.from(document.querySelectorAll('input, textarea, select, ng-select2'));
    FullDOMMap.allInputs = inputs;

    inputs.forEach(el => {
        if (el.id) FullDOMMap.byId.set(el.id, el);
        if (el.name) FullDOMMap.byName.set(el.name, el);
        
        const placeholder = el.getAttribute('placeholder');
        if (placeholder) FullDOMMap.byPlaceholder.set(placeholder.trim(), el);
        
        const fcn = el.getAttribute('formcontrolname');
        if (fcn) FullDOMMap.byName.set(fcn, el);
    });

    // 2. Lấy và ánh xạ Label
    const labels = refreshLabelsCache();
    labels.forEach(lbl => {
        const text = lbl.innerText.trim();
        if (!text) return;

        let targetEl = null;
        if (lbl.htmlFor) {
            targetEl = document.getElementById(lbl.htmlFor);
        }
        
        if (!targetEl) {
            // Tìm trong phạm vi gần (cha hoặc anh em)
            let p = lbl.parentElement;
            let depth = 0;
            while (p && depth < 2) {
                targetEl = p.querySelector('input, textarea, select');
                if (targetEl) break;
                p = p.parentElement;
                depth++;
            }
        }

        if (targetEl) {
            FullDOMMap.byLabel.set(text, targetEl);
        }
    });

    const end = performance.now();
    console.debug(`[DOM] Build map in ${(end - start).toFixed(2)}ms for ${inputs.length} inputs and ${labels.length} labels.`);
}

export function triggerCustom(el) {
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
}

export function syncSetValue(el, value) {
    // Use prototype setter to bypass framework wrappers if any
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (setter) {
        setter.call(el, value);
    } else {
        el.value = value;
    }
    
    triggerCustom(el);
}

// Tìm input theo id, name, hoặc nhãn thẻ label (Hỗ trợ Fuzzy Search)
export function findPageInput(name, labelText = null) {
    if (!name && !labelText) return null;
    
    // 1. Thử tra cứu từ Map (O(1))
    if (name) {
        let el = FullDOMMap.byId.get(name) || FullDOMMap.byName.get(name) || FullDOMMap.byPlaceholder.get(name);
        if (el && document.contains(el)) return el;
    }

    if (labelText) {
        let el = FullDOMMap.byLabel.get(labelText);
        if (el && document.contains(el)) return el;
    }

    // 2. Nếu Map chưa có (hoặc hỏng), thử tìm trực tiếp (Fallback)
    if (name) {
        const byId = document.getElementById(name);
        if (byId && ['INPUT', 'TEXTAREA', 'SELECT'].includes(byId.tagName)) return byId;

        const selector = `input[id="${name}"], textarea[id="${name}"], select[id="${name}"], input[name="${name}"], textarea[name="${name}"], [placeholder="${name}"]`;
        const byAttr = document.querySelector(selector);
        if (byAttr) return byAttr;
    }

    // 3. Fuzzy Match trên Label (Tốn kém hơn)
    const targetLabel = labelText || name;
    if (targetLabel && targetLabel.length > 2) {
        const labelTexts = Array.from(FullDOMMap.byLabel.keys());
        if (labelTexts.length === 0 && LabelCache.length > 0) {
             // Fallback nếu Map chưa được build nhưng LabelCache đã có
             labelTexts.push(...LabelCache.map(l => l.innerText.trim()).filter(t => t.length > 0));
        }

        const bestText = findBestMatch(targetLabel, labelTexts, 0.82);
        if (bestText) {
            return FullDOMMap.byLabel.get(bestText) || null;
        }
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
    }
}
