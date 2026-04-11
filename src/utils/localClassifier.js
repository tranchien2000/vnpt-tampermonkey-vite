/**
 * @file localClassifier.js
 * @desc Logic bóc tách dữ liệu từ văn bản thô bằng Regex (không dùng AI).
 *       Tối ưu cho mẫu Giấy đăng ký doanh nghiệp và căn cước công dân.
 */

/**
 * Các hàm helper chuẩn hóa dữ liệu
 */
const normalize = {
    // Viết hoa toàn bộ và trim
    name: (s) => s ? s.trim().toUpperCase().replace(/\s+/g, ' ') : '',
    // Làm sạch MST (chỉ giữ số)
    mst: (s) => s ? s.replace(/[^\d]/g, '').trim() : '',
    // Chuẩn hóa ngày về dd/MM/yyyy
    date: (d, m, y) => `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`,
    // Làm sạch text chung
    text: (s) => s ? s.trim().replace(/\s+/g, ' ') : ''
};

/**
 * Tìm kiếm giá trị dựa trên danh sách các mẫu (Patterns).
 * @param {string} text 
 * @param {RegExp[]} patterns 
 * @returns {string|null}
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
    const cleanText = text.replace(/\r/g, ''); // Đồng nhất xuống dòng

    // 1. Tên tổ chức/công ty (Ưu tiên tiếng Việt -> Tiếng Anh -> Viết tắt)
    const companyPatterns = [
        /(?:Tên công ty viết bằng tiếng Việt|Tên tổ chức):?\s*([\s\S]+?)(?=\n|Tên công ty|$)/i,
        /Tên công ty viết bằng tiếng nước ngoài:?\s*([\s\S]+?)(?=\n|Tên công ty|$)/i,
        /Tên công ty viết tắt:?\s*([\s\S]+?)(?=\n|Địa chỉ|$)/i
    ];
    const companyName = findFirstMatch(cleanText, companyPatterns);
    if (companyName) results.tenToChuc = normalize.text(companyName);

    // 2. Mã số doanh nghiệp / Mã số thuế
    const mstPatterns = [
        /(?:Mã số doanh nghiệp|Mã số thuế):?\s*([\d\s.]{10,16})/i,
        /MST:?\s*([\d\s.]{10,16})/i
    ];
    const mstRaw = findFirstMatch(cleanText, mstPatterns);
    if (mstRaw) results.soDkdn = normalize.mst(mstRaw);

    // 3. Người đại diện / Tên đại diện
    const dirmPatterns = [
        /(?:Họ và tên|Người đại diện theo pháp luật|Tên đại diện|Full name):?\s*([\s\S]+?)(?=\n|Chức danh|Chức vụ|Giới tính|Sinh ngày|Date of birth|$)/i,
        /Người đại diện:?\s*([\s\S]+?)(?=\n|Chức vụ|$)/i
    ];
    let repName = findFirstMatch(cleanText, dirmPatterns);
    if (repName) {
        // Loại bỏ nhãn nếu bị bám dính do regex lỏng (đặc biệt cho mẫu song ngữ CCCD)
        repName = repName.replace(/^(?:Họ và tên|Người đại diện theo pháp luật|Tên đại diện|Full name|[\/\s]*Full name):?\s*/i, '')
                         .replace(/^\/\s*/, ''); // Xóa dấu gạch chéo dư thừa
        results.tenDaiDienn = normalize.name(repName);
    }

    // 4. Chức danh / Chức vụ
    const posPatterns = [
        /(?:Chức danh|Chức vụ):?\s*([\s\S]+?)(?=\n|Sinh ngày|Giới tính|Quốc tịch|$)/i
    ];
    const pos = findFirstMatch(cleanText, posPatterns);
    if (pos) results.chucVu = normalize.text(pos);

    // 5. Ngày cấp đăng ký kinh doanh
    const ngayCapDkMatch = cleanText.match(/(?:Đăng ký|Đảng kỷ|Cấp ngày|Ngày cấp) (?:lần đầu|thay đổi):?\s*ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i);
    if (ngayCapDkMatch) {
        results.ngayCapSoDkdnCustomer = normalize.date(ngayCapDkMatch[1], ngayCapDkMatch[2], ngayCapDkMatch[3]);
    }

    // 6. Số điện thoại
    const sdtPatterns = [
        /(?:Điện thoại|SĐT|Tel):?\s*([\d\s.-]{9,15})/i
    ];
    const sdt = findFirstMatch(cleanText, sdtPatterns);
    if (sdt) results.sdt = sdt.replace(/[\s.-]/g, '').trim();

    // 7. Email
    const emailPatterns = [
        /(?:Thư điện tử|Email):?\s*([^\s\n]+)/i
    ];
    const email = findFirstMatch(cleanText, emailPatterns);
    if (email) results.emailDaiDien = email.replace(/\(a\)/g, '@').trim();

    // 8. CMND / CCCD / Hộ chiếu
    const cccdPatterns = [
        /(?:Số định danh cá nhân|Số CMND|Số CCCD|Số Hộ chiếu|Số \/ No\.):?\s*(\d[\d\s]{8,13})/i,
        /(?:CMND|CCCD) số:?\s*(\d[\d\s]{8,13})/i
    ];
    const cccdRaw = findFirstMatch(cleanText, cccdPatterns);
    if (cccdRaw) results.cmnd = normalize.mst(cccdRaw); 

    // 9. Nơi cấp (Ưu tiên nơi cấp CCCD)
    const noiCapPatterns = [
        /Nơi cấp:?\s*([\s\S]+?)(?=\n|Ngày cấp|$)/i,
        /Cục trưởng Cục Cảnh sát ([\s\S]+?)(?=\n|$)/i
    ];
    const noiCap = findFirstMatch(cleanText, noiCapPatterns);
    if (noiCap) results.noiCap = normalize.text(noiCap);

    // 10. Ngày cấp CMND/CCCD
    const ngayCapMatch = cleanText.match(/Ngày cấp:?\s*(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{4})/i);
    if (ngayCapMatch) {
        results.ngayCapCustomer = normalize.date(ngayCapMatch[1], ngayCapMatch[2], ngayCapMatch[3]);
    }

    // 11. Ngày sinh
    const dobMatch = cleanText.match(/(?:Ngày, tháng, năm sinh|Sinh ngày|Ngày sinh):?\s*ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i);
    if (dobMatch) {
        results.ngaySinhCustomer = normalize.date(dobMatch[1], dobMatch[2], dobMatch[3]);
    } else {
        const dobSimpleMatch = cleanText.match(/(?:Ngày sinh|Sinh ngày):?\s*(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{4})/i);
        if (dobSimpleMatch) {
            results.ngaySinhCustomer = normalize.date(dobSimpleMatch[1], dobSimpleMatch[2], dobSimpleMatch[3]);
        }
    }

    return results;
}
