/**
 * @file stringHelper.js
 * @desc Các hàm tiện ích xử lý chuỗi: Levenshtein distance, fuzzy matching.
 */

/**
 * Tính khoảng cách Levenshtein giữa 2 chuỗi.
 * @param {string} a 
 * @param {string} b 
 * @returns {number}
 */
export function getLevenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // thay thế
                    matrix[i][j - 1] + 1,     // chèn
                    matrix[i - 1][j] + 1      // xóa
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Tính độ tương đồng giữa 2 chuỗi (0 -> 1).
 * @param {string} s1 
 * @param {string} s2 
 * @returns {number}
 */
export function getSimilarity(s1, s2) {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    const longerLength = longer.length;
    if (longerLength === 0) {
        return 1.0;
    }
    return (longerLength - getLevenshteinDistance(longer, shorter)) / parseFloat(longerLength);
}

/**
 * Tìm chuỗi khớp nhất trong một danh sách.
 * @param {string} target 
 * @param {Array<string>} list 
 * @param {number} threshold 
 * @returns {string|null}
 */
export function findBestMatch(target, list, threshold = 0.7) {
    let bestMatch = null;
    let highestSimilarity = -1;

    const normalizedTarget = target.toLowerCase().trim();

    for (const item of list) {
        const normalizedItem = item.toLowerCase().trim();
        const similarity = getSimilarity(normalizedTarget, normalizedItem);
        if (similarity > highestSimilarity && similarity >= threshold) {
            highestSimilarity = similarity;
            bestMatch = item;
        }
    }

    return bestMatch;
}

/**
 * Viết hoa chữ cái đầu của mỗi từ (Dùng cho tên riêng).
 * @param {string} str 
 * @returns {string}
 */
export function capitalizeName(str) {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

/**
 * Chuẩn hóa số điện thoại (về dạng 0xxx...).
 * @param {string} phone 
 * @returns {string}
 */
export function formatPhoneNumber(phone) {
    if (!phone) return '';
    // Loại bỏ mọi ký tự không phải số
    let cleaned = phone.replace(/\D/g, '');
    // Nếu bắt đầu bằng 84, thay bằng 0
    if (cleaned.startsWith('84')) {
        cleaned = '0' + cleaned.slice(2);
    }
    return cleaned;
}

/**
 * Chuẩn hóa ngày tháng (Về dạng DD/MM/YYYY).
 * @param {string} dateStr 
 * @returns {string}
 */
export function normalizeDate(dateStr) {
    if (!dateStr) return '';
    // Thử parse các định dạng phổ biến: YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
        let d, m, y;
        if (parts[0].length === 4) { // YYYY-MM-DD
            [y, m, d] = parts;
        } else { // DD-MM-YYYY
            [d, m, y] = parts;
        }
        return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
    return dateStr;
}
