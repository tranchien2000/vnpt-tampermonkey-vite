/**
 * @file localClassifier.js
 * @desc Logic bóc tách dữ liệu từ văn bản thô bằng Regex (không dùng AI).
 *       Tối ưu cho mẫu Giấy đăng ký doanh nghiệp.
 */

/**
 * Phân loại văn bản thô dựa trên các mẫu Regex phổ biến.
 * @param {string} text - Nội dung văn bản thô cần phân loại.
 * @returns {Object} Đối tượng chứa các trường dữ liệu tìm thấy.
 */
export function classifyTextLocally(text) {
    if (!text) return {};

    const results = {};

    // 1. Tên tổ chức/công ty
    const companyMatch = text.match(/(?:Tên công ty viết bằng tiếng Việt|Tên tổ chức):?\s*([\s\S]+?)(?=\n|Tên công ty|$)/i);
    if (companyMatch) results.tenToChuc = companyMatch[1].trim();

    // 2. Mã số doanh nghiệp / Mã số thuế
    const mstMatch = text.match(/(?:Mã số doanh nghiệp|Mã số thuế):?\s*(\d{10,13})/i);
    if (mstMatch) results.soDkdn = mstMatch[1].trim();

    // 3. Người đại diện / Tên đại diện
    let dirmMatch = text.match(/(?:Họ và tên|Tên đại diện|Người đại diện theo pháp luật):?\s*([\s\S]+?)(?=\n|Chức vụ|Chức danh|Giới tính|Sinh ngày|$)/i);
    if (dirmMatch) {
        let name = dirmMatch[1].trim();
        // Loại bỏ tiền tố nếu bị dính (do nested labels)
        name = name.replace(/^(?:Họ và tên|Tên đại diện|Người đại diện theo pháp luật):?\s*/i, '');
        results.tenDaiDienn = name.toUpperCase();
    }

    // 4. Chức danh / Chức vụ
    const posMatch = text.match(/(?:Chức danh|Chức vụ):?\s*([\s\S]+?)(?=\n|Sinh ngày|$)/i);
    if (posMatch) results.chucVu = posMatch[1].trim();

    // 5. Ngày cấp đăng ký kinh doanh
    const ngayCapDkMatch = text.match(/(?:Đăng ký|Đảng kỷ) lần đầu:?\s*ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i);
    if (ngayCapDkMatch) {
        results.ngayCapSoDkdnCustomer = `${ngayCapDkMatch[1].padStart(2, '0')}/${ngayCapDkMatch[2].padStart(2, '0')}/${ngayCapDkMatch[3]}`;
    }

    // 6. Số điện thoại
    const sdtMatch = text.match(/(?:Điện thoại|SĐT):?\s*([\d\s.-]{9,15})/i);
    if (sdtMatch) results.sdt = sdtMatch[1].replace(/[\s.-]/g, '').trim();

    // 7. Email
    const emailMatch = text.match(/(?:Thư điện tử|Email):?\s*([^\s\n]+)/i);
    if (emailMatch) {
        results.emailDaiDien = emailMatch[1].replace(/\(a\)/g, '@').trim();
    }

    // 8. Địa chỉ (Trụ sở hoặc Liên lạc)
    const addressMatch = text.match(/(?:Địa chỉ trụ sở chính|Địa chỉ liên lạc|Nơi thường trú|Nơi ở hiện nay):?\s*([\s\S]+?)(?=\n|Điện thoại|Thư điện tử|Mã số thuế|$)/i);
    if (addressMatch) results.diaChi = addressMatch[1].trim().replace(/\s+/g, ' ');

    // 9. CMND / CCCD / Hộ chiếu
    const cccdMatch = text.match(/(?:Số định danh cá nhân|Số CMND|Số CCCD|Số Hộ chiếu):?\s*(\d{9,12})/i);
    if (cccdMatch) results.cmnd = cccdMatch[1].trim(); 

    // 10. Nơi cấp
    const noiCapMatch = text.match(/(?:Nơi cấp):?\s*([\s\S]+?)(?=\n|$)/i);
    if (noiCapMatch) results.noiCap = noiCapMatch[1].trim();

    // 11. Ngày cấp CMND/CCCD
    const ngayCapCccdMatch = text.match(/(?:Ngày cấp):?\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/i);
    if (ngayCapCccdMatch) {
        results.ngayCapCustomer = `${ngayCapCccdMatch[1].padStart(2, '0')}/${ngayCapCccdMatch[2].padStart(2, '0')}/${ngayCapCccdMatch[3]}`;
    }

    // 12. Ngày sinh
    const dobMatch = text.match(/(?:Ngày, tháng, năm sinh|Sinh ngày):?\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/i);
    if (dobMatch) {
        results.ngaySinhCustomer = `${dobMatch[1].padStart(2, '0')}/${dobMatch[2].padStart(2, '0')}/${dobMatch[3]}`;
    } else {
        const dobVnMatch = text.match(/(?:Ngày, tháng, năm sinh|Sinh ngày):?\s*ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i);
        if (dobVnMatch) {
            results.ngaySinhCustomer = `${dobVnMatch[1].padStart(2, '0')}/${dobVnMatch[2].padStart(2, '0')}/${dobVnMatch[3]}`;
        }
    }

    return results;
}
