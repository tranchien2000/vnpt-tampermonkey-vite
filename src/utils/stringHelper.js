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
 * Hỗ trợ: YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, DDMMYYYY, D/M/YYYY
 * @param {string} dateStr 
 * @returns {string}
 */
export function normalizeDate(dateStr) {
    if (!dateStr) return '';
    
    // Loại bỏ khoảng trắng thừa
    let s = dateStr.trim();
    if (!s) return '';

    // 1. Nếu là chuỗi số 8 chữ số (DDMMYYYY)
    if (/^\d{8}$/.test(s)) {
        return `${s.substring(0, 2)}/${s.substring(2, 4)}/${s.substring(4)}`;
    }

    // 2. Nếu là chuỗi số 6 chữ số (DDMMYY) - Tạm thời không hỗ trợ vì dễ nhầm lẫn
    
    // 3. Thử parse các định dạng có dấu phân cách: YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, D.M.Y
    const parts = s.split(/[-/.\s]/).filter(p => !!p);
    
    if (parts.length === 3) {
        let d, m, y;
        // Kiểm tra xem phần nào là Năm (4 chữ số)
        if (parts[0].length === 4) { // YYYY-MM-DD
            [y, m, d] = parts;
        } else if (parts[2].length === 4) { // DD-MM-YYYY
            [d, m, y] = parts;
        } else if (parts[2].length === 2) { // DD-MM-YY
            [d, m, y] = parts;
            y = (parseInt(y) < 50 ? '20' : '19') + y.padStart(2, '0');
        } else {
            return s; // Không rõ định dạng
        }
        
        return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }

    // 4. Nếu là ISO String (2023-10-27T...)
    if (s.includes('T') && !isNaN(Date.parse(s))) {
        const date = new Date(s);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    return s;
}
/**
 * Bóc tách địa chỉ Việt Nam thành các phần: Tỉnh, Quận/Huyện, Phường/Xã.
 * @param {string} address 
 * @returns {{province: string, district: string, ward: string}}
 */
export function parseAddressComponents(address) {
    if (!address) return { province: '', district: '', ward: '', street: '' };

    const parts = address.split(',').map(p => p.trim()).filter(Boolean);
    const n = parts.length;
    
    let province = '', district = '', ward = '', street = '';

    if (n === 0) return { province, district, ward, street };

    // Quy tắc cực kỳ đơn giản: đếm ngược từ phải sang
    // 1. Tỉnh: phần cuối cùng
    province = parts[n - 1] || '';
    
    // 2. Huyện/Xã: phần thứ 2 từ phải sang
    if (n >= 2) {
        district = parts[n - 2];
        ward = parts[n - 2];
    }

    // 3. Đường (Street): Mọi thứ đứng trước dấu phẩy thứ 2 từ phải sang
    // CHỈ THỰC HIỆN nếu chuỗi có dấu hiệu của địa chỉ đầy đủ (có Tỉnh/TP/Quận/Huyện/Xã/Phường ở cuối)
    const adminRegex = /(Tỉnh|Thành phố|Thành Phố|TP|T\.|Hà Nội|Hồ Chí Minh|Đà Nẵng|Cần Thơ|Hải Phòng|Quận|Huyện|Q\.|H\.|Phường|Xã|P\.|X\.)$/i;
    const isFullAddress = adminRegex.test(province);

    if (isFullAddress) {
        if (n >= 3) {
            street = parts.slice(0, n - 2).join(', ');
        } else if (n === 2) {
            street = parts[0];
        } else {
            street = address;
        }
    } else {
        // Nếu không phải địa chỉ đầy đủ (đã bóc tách rồi), giữ nguyên để tránh lặp
        street = address;
    }

    return {
        province: cleanProvinceName(province),
        district: cleanProvinceName(district),
        ward: cleanProvinceName(ward),
        street
    };
}

/**
 * Loại bỏ các tiền tố hành chính để lấy tên lõi của Tỉnh/Quận/Huyện/Xã.
 * @param {string} name 
 * @returns {string}
 */
export function cleanProvinceName(name) {
    if (!name) return '';
    // Xóa "Tỉnh ", "Thành phố ", "Quận ", "Huyện ", "Xã ", "Phường ", "Thị xã "...
    return name.replace(/^(Tỉnh|Thành phố|Thành Phố|TP\.|TP|T\.|Quận|Huyện|Q\.|H\.|Xã|Phường|P\.|Thị xã|Thị trấn)\s+/i, '').trim();
}

/**
 * Trích xuất phần địa chỉ nhà / đường từ một chuỗi địa chỉ đầy đủ.
 * @param {string} address 
 * @returns {string}
 */
export function getStreetPart(address) {
    if (!address || !address.includes(',')) return address;
    const parts = address.split(',').map(p => p.trim()).filter(Boolean);

    // Tìm index của phần Xã/Phường
    const wardIndex = parts.findIndex(p => /Xã|Phường|Thị trấn|TT\.|P\.|X\./i.test(p));

    if (wardIndex > 0) {
        // Nếu tìm thấy Xã/Phường, phần đường sẽ là từ đầu đến trước Xã
        return parts.slice(0, wardIndex).join(', ');
    } else if (parts.length >= 4) {
        // Nếu không tìm thấy bằng regex, nhưng có từ 4 phần trở lên, giả định 3 phần cuối là Tỉnh, Huyện, Xã
        return parts.slice(0, parts.length - 3).join(', ');
    } else if (parts.length > 1) {
        // Nếu chỉ có 2-3 phần mà không nhận diện được, lấy phần đầu tiên
        return parts[0];
    }

    return address;
}

/**
 * Tách một chuỗi kết hợp (Số nhà, Đường) thành hai phần riêng biệt.
 * Phục vụ cho các form có id="soNha" và id="duong" tách rời.
 * @param {string} streetCombo 
 * @returns {{houseNumber: string, streetName: string}}
 */
export function splitHouseNumberAndStreet(streetCombo) {
    if (!streetCombo) return { houseNumber: '', streetName: '' };

    // Nếu có dấu phẩy đầu tiên, lấy phần trước là số nhà, phần sau là đường
    const commaIndex = streetCombo.indexOf(',');
    if (commaIndex > 0) {
        return {
            houseNumber: streetCombo.substring(0, commaIndex).trim(),
            streetName: streetCombo.substring(commaIndex + 1).trim()
        };
    }

    // Phân tách nếu chuỗi bắt đầu bằng Từ khóa báo số nhà
    // Ví dụ: Số 12A, Tòa nhà B, Ngõ 3, Thôn 4, Lô 5...
    const match = streetCombo.match(/^(?:số|sn|nhà|lô|tổ|thôn|xóm|ngõ|ngách|hẻm|kđt|khu|ấp|bản|tòa|phòng|tầng|căn hộ|chung cư)\s*[0-9a-zA-Z\-\.\/]+\s/i);
    if (match) {
        return {
            houseNumber: match[0].trim(),
            streetName: streetCombo.substring(match[0].length).trim()
        };
    }

    // Nếu chỉ có một cụm bắt đầu bằng số (VD: "12A Lý Thường Kiệt")
    const matchNumber = streetCombo.match(/^[\d]+[a-zA-Z\-\/]*\s/);
    if (matchNumber) {
        return {
            houseNumber: matchNumber[0].trim(),
            streetName: streetCombo.substring(matchNumber[0].length).trim()
        };
    }

    // Default: không có số nhà rõ ràng, đưa tất cả vào đường
    return { houseNumber: '', streetName: streetCombo };
}
