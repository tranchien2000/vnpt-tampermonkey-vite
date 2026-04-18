/**
 * @file calcLogic.js
 * @desc Logic nghiệp vụ tính thuế và định dạng số cho Calc Widget.
 */
import { formatNum, parseNum, numToVN, capFirst } from '../../utils/numberHelper.js';
import { setPageField } from '../../utils/domHelper.js';

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
    const keys = ['before', 'tax', 'after', 'text'];
    const dataMap = {
        before: data.beforeStr,
        tax: data.taxStr,
        after: data.afterStr,
        text: data.textStr
    };

    keys.forEach(k => {
        const mapInfo = calcMaps[k];
        if (!mapInfo) return;

        // Hỗ trợ cả format cũ (Array) và format mới (Object {sync, syncDir})
        const targets = Array.isArray(mapInfo) ? mapInfo : (mapInfo.sync || []);
        const dir = Array.isArray(mapInfo) ? 'both' : (mapInfo.syncDir || 'both');

        // Chỉ sync xuống nếu hướng là 'both' hoặc 'down'
        if (dir === 'both' || dir === 'down') {
            targets.forEach(targetId => {
                setPageField(targetId, dataMap[k]);
            });
        }
    });
}
