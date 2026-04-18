/**
 * @file localClassifier.js
 * @desc Logic bóc tách dữ liệu từ văn bản thô bằng Regex (không dùng AI).
 *       Tối ưu cho việc bắt Mã số thuế (MST/GPKD) và thông tin CCCD.
 */

/**
 * Các hàm helper chuẩn hóa dữ liệu
 */
const normalize = {
    name: (s) => s ? s.trim().toUpperCase().replace(/\s+/g, ' ') : '',
    mst: (s) => s ? s.replace(/[^\d-]/g, '').trim() : '',
    date: (d, m, y) => `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`,
    phone: (s) => {
        if (!s) return '';
        let cleaned = s.replace(/[^\d]/g, '');
        if (cleaned.startsWith('84')) cleaned = '0' + cleaned.slice(2);
        if (cleaned.length === 9 && !cleaned.startsWith('0')) cleaned = '0' + cleaned;
        return cleaned;
    },
    text: (s) => s ? s.trim().replace(/\s+/g, ' ').replace(/[;:.]$/, '') : ''
};

/**
 * Tìm kiếm giá trị dựa trên danh sách các mẫu (Patterns).
 */
function findFirstMatch(text, patterns) {
    for (const regex of patterns) {
        const match = text.match(regex);
        if (match && match[1]) return match[1].trim();
    }
    return null;
}

/**
 * Phân loại văn bản thô dựa trên các mẫu Regex phổ biến.
 * @param {string} text - Nội dung văn bản thô cần phân loại.
 * @returns {Object} Đối tượng chứa các trường dữ liệu tìm thấy.
 */
export function classifyTextLocally(text) {
    if (!text) return {};

    const results = {};
    const cleanText = text.replace(/\r/g, ''); 

    // --- 1. KIỂM TRA ĐỊNH DẠNG QR CCCD (ĐỊNH DẠNG ĐƯỜNG ỐNG '|') ---
    if (cleanText.includes('|')) {
        const parts = cleanText.split('|').map(p => p.trim());
        if (parts.length >= 6) {
            results.cmnd = normalize.mst(parts[0]);
            results.tenDaiDienn = normalize.name(parts[2]);
            const rawDob = parts[3];
            if (rawDob && rawDob.length === 8 && !rawDob.includes('/')) {
                results.ngaySinhCustomer = normalize.date(rawDob.slice(0, 2), rawDob.slice(2, 4), rawDob.slice(4));
            }
            if (parts[5]) results.diaChiCustomer = normalize.text(parts[5]);
            const rawIssue = parts[6];
            if (rawIssue && rawIssue.length === 8 && !rawIssue.includes('/')) {
                results.ngayCapCustomer = normalize.date(rawIssue.slice(0, 2), rawIssue.slice(2, 4), rawIssue.slice(4));
            }
            results.noiCap = "Cục Cảnh sát quản lý hành chính về trật tự xã hội";
            return results;
        }
    }

    // 1. Mã số doanh nghiệp / Mã số thuế / GPKD (Ưu tiên hàng đầu)
    const mstPatterns = [
        /(?:Mã số doanh nghiệp|Mã số thuế|Số GPKD|Mã số|MST|GCNĐKDN):?\s*([\d\s.-]{10,16})/i,
        /Số:?\s*([\d]{10,14})/i // Bắt các dòng chỉ ghi Số: 0123456789
    ];
    const mstRaw = findFirstMatch(cleanText, mstPatterns);
    if (mstRaw) results.soDkdn = normalize.mst(mstRaw);

    // 2. Tên tổ chức/công ty (Nếu có sẽ hỗ trợ tra cứu)
    const companyPatterns = [
        /(?:Tên công ty viết bằng tiếng Việt|Tên doanh nghiệp|Tên tổ chức|Doanh nghiệp|Công ty):?\s*([\s\S]+?)(?=\n|Tên công ty|Mã số|$)/i
    ];
    const companyName = findFirstMatch(cleanText, companyPatterns);
    if (companyName) results.tenToChuc = normalize.text(companyName);

    // 3. Người đại diện / Tên đại diện
    const dirmPatterns = [
        /(?:Họ và tên|Người đại diện theo pháp luật|Tên đại diện|Người đại diện|Đại diện|Full name):?\s*([\s\S]+?)(?=\n|Chức danh|Chức vụ|Giới tính|Sinh ngày|Số định danh|CMND|CCCD|$)/i,
        /(?:Ông|Bà)\s+([A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯ][a-zàáâãèéêìíòóôõùúăđĩũơư]+\s+[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯ][a-zàáâãèéêìíòóôõùúăđĩũơư]+(?:\s+[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯ][a-zàáâãèéêìíòóôõùúăđĩũơư]+)*)/
    ];
    let repName = findFirstMatch(cleanText, dirmPatterns);
    if (repName) {
        repName = repName.replace(/^(?:Họ và tên|Người đại diện theo pháp luật|Tên đại diện|Người đại diện|Đại diện|Full name|Ông|Bà):?\s*/i, '');
        results.tenDaiDienn = normalize.name(repName);
    }

    // 4. Chức danh / Chức vụ
    const posPatterns = [
        /(?:Chức danh|Chức vụ):?\s*([\s\S]+?)(?=\n|Sinh ngày|Giới tính|Quốc tịch|$)/i
    ];
    const pos = findFirstMatch(cleanText, posPatterns);
    if (pos) results.chucVu = normalize.text(pos);

    // 5. CMND / CCCD (Dành cho cá nhân)
    const cccdPatterns = [
        /(?:Số định danh cá nhân|Số CMND|Số CCCD|Số Hộ chiếu|Số \/ No\.|Số thẻ):?\s*(\d[\d\s]{8,13})/i,
        /(?:CMND|CCCD) số:?\s*(\d[\d\s]{8,13})/i
    ];
    const cccdRaw = findFirstMatch(cleanText, cccdPatterns);
    if (cccdRaw) results.cmnd = normalize.mst(cccdRaw);

    // 6. Số điện thoại
    const sdtPatterns = [
        /(?:Điện thoại|SĐT|Tel|Mobile|Số ĐT):?\s*([\d\s.-]{9,15})/i
    ];
    const sdt = findFirstMatch(cleanText, sdtPatterns);
    if (sdt) results.sdt = normalize.phone(sdt);

    // 7. Email
    const emailPatterns = [
        /(?:Thư điện tử|Email|E-mail):?\s*([^\s\n,]+)/i
    ];
    const email = findFirstMatch(cleanText, emailPatterns);
    if (email) results.emailDaiDien = email.replace(/\(a\)/g, '@').replace(/,$/, '').trim();

    return results;
}
