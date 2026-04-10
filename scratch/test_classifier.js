import { classifyTextLocally } from '../src/utils/localClassifier.js';

const sampleText = `
GIẤY CHỨNG NHẬN ĐĂNG KÝ DOANH NGHIỆP
Mã số doanh nghiệp: 0101234567
Đăng ký lần đầu: ngày 11 tháng 01 năm 2024
Tên công ty viết bằng tiếng Việt: CÔNG TY TNHH GIẢI PHÁP CÔNG NGHỆ VNPT
Địa chỉ trụ sở chính: Số 123 Phố Duy Tân, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Thành phố Hà Nội, Việt Nam
Điện thoại: 02437931234
Thư điện tử: support(a)vnpt.vn

Người đại diện theo pháp luật:
Họ và tên: NGUYỄN VĂN A
Giới tính: Nam
Chức danh: Giám đốc
Sinh ngày: 01/05/1990
Dân tộc: Kinh
Quốc tịch: Việt Nam
Số CCCD: 001090123456
Ngày cấp: 15/02/2023
Nơi cấp: Cục Cảnh sát Quản lý hành chính về trật tự xã hội
Nơi thường trú: Thái Bình
Nơi ở hiện nay: Hà Nội
`;

const results = classifyTextLocally(sampleText);
console.log("--- TEST RESULTS ---");
console.log(JSON.stringify(results, null, 2));

const tests = [
    { field: 'soDkdn', expected: "0101234567" },
    { field: 'tenToChuc', expected: "CÔNG TY TNHH GIẢI PHÁP CÔNG NGHỆ VNPT" },
    { field: 'tenDaiDienn', expected: "NGUYỄN VĂN A" },
    { field: 'chucVu', expected: "Giám đốc" },
    { field: 'cmnd', expected: "001090123456" },
    { field: 'ngayCapCustomer', expected: "15/02/2023" },
    { field: 'noiCap', expected: "Cục Cảnh sát Quản lý hành chính về trật tự xã hội" },
    { field: 'ngaySinhCustomer', expected: "01/05/1990" },
    { field: 'emailDaiDien', expected: "support@vnpt.vn" }
];

tests.forEach(t => {
    if (results[t.field] === t.expected) {
        console.log(`✅ [${t.field}] Match!`);
    } else {
        console.log(`❌ [${t.field}] Mismatch! Expected: "${t.expected}", Found: "${results[t.field]}"`);
    }
});
