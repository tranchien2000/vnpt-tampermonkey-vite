// src/utils/numberHelper.js

export function formatNum(n) { 
    return n.toLocaleString('en-US'); 
}

export function parseNum(s) { 
    return Number(String(s).replace(/[^\d]/g, '')) || 0; 
}

export function capFirst(s) { 
    return s.charAt(0).toUpperCase() + s.slice(1); 
}

const ONES = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function read3(n) {
    let h = Math.floor(n / 100), t = Math.floor((n % 100) / 10), u = n % 10, s = '';
    if (h > 0) { 
        s += ONES[h] + ' trăm '; 
        if (t === 0 && u > 0) s += 'lẻ '; 
    }
    if (t > 1) { 
        s += ONES[t] + ' mươi '; 
        if (u === 1) s += 'mốt'; 
        else if (u === 5) s += 'lăm'; 
        else if (u > 0) s += ONES[u]; 
    } else if (t === 1) { 
        s += 'mười '; 
        if (u === 5) s += 'lăm'; 
        else if (u > 0) s += ONES[u]; 
    } else if (u > 0) { 
        if (h > 0) s += 'lẻ '; 
        s += ONES[u]; 
    }
    return s.trim();
}

export function numToVN(n) {
    if (n === 0) return 'không';
    const units = ['', 'nghìn', 'triệu', 'tỷ'];
    let s = '', i = 0;
    while (n > 0) { 
        const c = n % 1000; 
        if (c > 0) s = read3(c) + ' ' + units[i] + ' ' + s; 
        n = Math.floor(n / 1000); 
        i++; 
    }
    return s.trim();
}
