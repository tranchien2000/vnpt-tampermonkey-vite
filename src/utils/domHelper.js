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
    const byId = document.getElementById(name);
    if (byId && (byId.tagName === 'INPUT' || byId.tagName === 'TEXTAREA')) return byId;
    for (const lbl of document.querySelectorAll('label')) {
        if (lbl.textContent.trim() === name) {
            if (lbl.htmlFor) { 
                const el = document.getElementById(lbl.htmlFor); 
                if (el) return el; 
            }
            let p = lbl.parentElement;
            while (p) { 
                const inp = p.querySelector('input,textarea'); 
                if (inp) return inp; 
                p = p.parentElement; 
                if (p?.tagName === 'FORM') break; 
            }
        }
    }
    return null;
}

export function getInputByLabel(text) {
    for (const lbl of document.querySelectorAll('label')) {
        if (lbl.innerText.trim() === text) {
            return lbl.parentElement.querySelector('input, textarea');
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
