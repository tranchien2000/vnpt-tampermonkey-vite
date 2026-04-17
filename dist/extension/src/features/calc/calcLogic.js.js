/**
 * @file calcLogic.js
 * @desc Logic nghiệp vụ tính thuế và định dạng số cho Calc Widget.
 */
import { formatNum, parseNum, numToVN, capFirst } from "/src/utils/numberHelper.js.js";
import { setPageField } from "/src/utils/domHelper.js.js";

export function calculateValues(type, value, taxRate) {
    if (value === '' || value === undefined || value === null) {
        return {
            beforeNum: 0,
            taxNum: 0,
            afterNum: 0,
            beforeStr: '',
            taxStr: '',
            afterStr: '',
            textStr: ''
        };
    }

    let b = 0, t = 0, a = 0;
    
    if (type === 'before') {
        b = parseNum(value);
        t = taxRate > 0 ? Math.round(b * taxRate) : 0;
        a = b + t;
    } else if (type === 'tax') {
        t = parseNum(value);
        b = taxRate > 0 ? Math.round(t / taxRate) : 0;
        a = b + t;
    } else if (type === 'after') {
        a = parseNum(value);
        b = taxRate > 0 ? Math.round(a / (1 + taxRate)) : a;
        t = a - b;
    }
    
    const text = a === 0 ? '' : capFirst(numToVN(a)) + ' đồng';
    
    return {
        beforeNum: b,
        taxNum: t,
        afterNum: a,
        beforeStr: b === 0 ? '' : formatNum(b),
        taxStr: t === 0 ? '' : formatNum(t),
        afterStr: a === 0 ? '' : formatNum(a),
        textStr: text
    };
}

export function syncToPage(data, calcMaps) {
    if (calcMaps.before) calcMaps.before.forEach(n => setPageField(n, data.beforeStr));
    if (calcMaps.tax) calcMaps.tax.forEach(n => setPageField(n, data.taxStr));
    if (calcMaps.after) calcMaps.after.forEach(n => setPageField(n, data.afterStr));
    if (calcMaps.text) calcMaps.text.forEach(n => setPageField(n, data.textStr));
}
