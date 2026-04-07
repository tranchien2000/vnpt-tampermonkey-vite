/**
 * @file common.js
 * @desc Các hàm tiện ích dùng chung (debounce, v.v.)
 */

/**
 * Hàm chống rung (debounce)
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
