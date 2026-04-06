/**
 * @file calcHistory.js
 * @desc Quản lý việc lưu trữ (localStorage) và lịch sử (History) cho Calc Widget.
 */
import { SK_HIST_B, SK_HIST_A, SK_COLL_CALC } from '../../core/constants.js';

export function ld(k, def = null) { 
    try { const s = localStorage.getItem(k); return s !== null ? JSON.parse(s) : def; } 
    catch { return def; } 
}

export function sv(k, v) { 
    localStorage.setItem(k, JSON.stringify(v)); 
}

export function saveHist(key, val) {
    if (!val || val.replace(/\D/g, '').length < 6) return;
    let arr = ld(key, []);
    arr = arr.filter(v => v !== val);
    arr.unshift(val);
    sv(key, arr.slice(0, 10));
}

export function renderHist(key, listId) {
    const el = document.getElementById(listId);
    if (!el) return;
    el.innerHTML = (ld(key, [])).map(v => `<option value="${v}">`).join('');
}
