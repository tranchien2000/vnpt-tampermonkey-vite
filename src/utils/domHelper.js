import { findBestMatch } from './stringHelper.js';

// ─── DOM Cache ───
const DOMCache = new Map();

/**
 * Xóa bộ nhớ đệm DOM khi trang thay đổi cấu trúc lớn.
 */
export function clearDOMCache() {
    DOMCache.clear();
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
    if (!name) return null;
    
    // Kiểm tra cache trước
    const cached = DOMCache.get(name);
    if (cached && document.contains(cached)) return cached;

    // 1. Tìm chính xác theo ID
    const byId = document.getElementById(name);
    if (byId && (byId.tagName === 'INPUT' || byId.tagName === 'TEXTAREA' || byId.tagName === 'SELECT')) {
        DOMCache.set(name, byId);
        return byId;
    }

    // 2. Tìm theo các thuộc tính thông dụng
    const selector = `input[id="${name}"], textarea[id="${name}"], select[id="${name}"], input[name="${name}"], textarea[name="${name}"], input[formcontrolname="${name}"], textarea[formcontrolname="${name}"], input[placeholder="${name}"], textarea[placeholder="${name}"]`;
    const byAttr = document.querySelector(selector);
    if (byAttr) {
        DOMCache.set(name, byAttr);
        return byAttr;
    }
    
    // 3. Tìm theo nhãn thẻ label (Chính xác hoặc Mờ)
    const targetLabel = labelText || name;
    const allLabels = Array.from(document.querySelectorAll('label, .label, .label-text, span.title'));
    
    // Thử tìm chính xác trước
    let foundLabel = allLabels.find(lbl => lbl.innerText.trim() === targetLabel);
    
    // Nếu không thấy, dùng Fuzzy Match
    if (!foundLabel && targetLabel.length > 2) {
        const labelTexts = allLabels.map(l => l.innerText.trim()).filter(t => t.length > 0);
        const bestText = findBestMatch(targetLabel, labelTexts, 0.8);
        if (bestText) {
            foundLabel = allLabels.find(lbl => lbl.innerText.trim() === bestText);
        }
    }

    if (foundLabel) {
        let el = null;
        if (foundLabel.htmlFor) { 
            el = document.getElementById(foundLabel.htmlFor); 
        }
        if (!el) {
            // Tìm input lân cận (trong cùng cha hoặc anh em)
            let p = foundLabel.parentElement;
            let depth = 0;
            while (p && depth < 3) { 
                const inp = p.querySelector('input, textarea, select'); 
                if (inp) { el = inp; break; }
                p = p.parentElement; 
                depth++;
            }
        }
        if (el) {
            DOMCache.set(name, el);
            return el;
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
