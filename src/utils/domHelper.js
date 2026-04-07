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

// Tìm input theo id, name, hoặc nhãn thẻ label
export function findPageInput(name) {
    if (!name) return null;
    
    // Kiểm tra cache trước
    const cached = DOMCache.get(name);
    if (cached && document.contains(cached)) return cached;

    const byId = document.getElementById(name);
    if (byId && (byId.tagName === 'INPUT' || byId.tagName === 'TEXTAREA')) {
        DOMCache.set(name, byId);
        return byId;
    }
    
    for (const lbl of document.querySelectorAll('label')) {
        if (lbl.textContent.trim() === name) {
            let el = null;
            if (lbl.htmlFor) { 
                el = document.getElementById(lbl.htmlFor); 
            }
            if (!el) {
                let p = lbl.parentElement;
                while (p) { 
                    const inp = p.querySelector('input,textarea'); 
                    if (inp) { el = inp; break; }
                    p = p.parentElement; 
                    if (p?.tagName === 'FORM') break; 
                }
            }
            if (el) {
                DOMCache.set(name, el);
                return el;
            }
        }
    }
    return null;
}

export function getInputByLabel(text) {
    if (!text) return null;

    // Check cache
    const cached = DOMCache.get(`lbl:${text}`);
    if (cached && document.contains(cached)) return cached;

    for (const lbl of document.querySelectorAll('label')) {
        if (lbl.innerText.trim() === text) {
            const el = lbl.parentElement.querySelector('input, textarea');
            if (el) {
                DOMCache.set(`lbl:${text}`, el);
                return el;
            }
        }
    }
    return null;
}

export function setPageField(name, value) {
    const el = findPageInput(name) || getInputByLabel(name);
    if (el) {
        syncSetValue(el, value);
    }
}
