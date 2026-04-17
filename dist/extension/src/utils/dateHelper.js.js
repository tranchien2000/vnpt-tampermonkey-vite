/**
 * @file dateHelper.js
 * @desc Các hàm bổ trợ xử lý ngày tháng năm.
 */

export function getToday() {
    return new Date();
}

export function formatDay(d = new Date()) {
    return String(d.getDate()).padStart(2, '0');
}

export function formatMonth(d = new Date()) {
    return String(d.getMonth() + 1).padStart(2, '0');
}

export function formatYear(d = new Date()) {
    return String(d.getFullYear());
}

export function getVNPTDateStrings() {
    const d = new Date();
    return {
        ngay: formatDay(d),
        thang: formatMonth(d),
        nam: formatYear(d)
    };
}
