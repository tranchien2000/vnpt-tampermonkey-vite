import { addOrUpdateFieldRow, saveFieldsToLocal } from "/src/features/fieldsManager.js.js";
import { parseAddressComponents } from "/src/utils/stringHelper.js.js";

function randomDigit(length) {
    let s = '';
    for(let i=0; i<length; i++) s += Math.floor(Math.random() * 10);
    return s;
}

export function generateVNPTMockData() {
    const listNames = [
        'CÔNG TY TNHH CÔNG NGHỆ BÁO ĐỐM', 
        'CÔNG TY CP THƯƠNG MẠI VNPT XANH', 
        'DOANH NGHIỆP TƯ NHÂN HOÀNG HẢI',
        'CTY TNHH MTV DỊCH VỤ VÀ PHẦN MỀM SAO BIỂN',
        'CÔNG TY CỔ PHẦN TẬP ĐOÀN ĐẠI DƯƠNG'
    ];
    const listPeople = ['Nguyễn Văn Khôi', 'Trần Thị Thuỷ', 'Lê Hoàng Long', 'Phạm Quỳnh Anh', 'Đỗ Thành Đạt'];
    const listAddresses = [
        '12A Ngõ 45 Đường Láng, Phường Ngã Tư Sở, Quận Đống Đa, Thành phố Hà Nội', 
        '14/B Đường Lê Lợi, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh',
        'Số 5 Phố Tôn Đức Thắng, Phường Văn Miếu, Quận Đống Đa, Thành phố Hà Nội',
        '256 Nguyễn Công Trứ, Phường Nguyễn Thái Bình, Quận 1, Thành phố Hồ Chí Minh',
        'Tòa nhà H9, Khu đô thị Cầu Đất, Phường Vĩnh Tuy, Quận Hai Bà Trưng, Thành phố Hà Nội'
    ];
    const listOffices = [
        'Sở Kế hoạch và Đầu tư TP Hà Nội',
        'Sở Kế hoạch và Đầu tư TP Hồ Chí Minh',
        'Cục cảnh sát QLHC về TTXH',
        'CA Thành phố Hà Nội'
    ];
    
    // Auto-generate fields
    const mst = `010${randomDigit(7)}`; // 10 chữ số
    const cmnd = `0${Math.floor(Math.random() * 9)}${randomDigit(10)}`; // 12 chữ số CCCD
    const name = listNames[Math.floor(Math.random() * listNames.length)];
    const repName = listPeople[Math.floor(Math.random() * listPeople.length)];
    const address = listAddresses[Math.floor(Math.random() * listAddresses.length)];
    const phone = `09${Math.floor(Math.random() * 8 + 1)}${randomDigit(7)}`;
    const email = `contact_${randomDigit(4)}@testvnpt.com.vn`;
    
    const dob = `0${Math.floor(Math.random() * 9 + 1)}/0${Math.floor(Math.random() * 9 + 1)}/19${Math.floor(Math.random() * 20 + 70)}`;
    const issueDate = `1${Math.floor(Math.random() * 9)}/05/202${Math.floor(Math.random() * 4)}`;

    addOrUpdateFieldRow('tenToChuc', name);
    addOrUpdateFieldRow('soDkdn', mst);
    addOrUpdateFieldRow('diaChi', address);
    
    addOrUpdateFieldRow('nguoiDaiDien', repName);
    addOrUpdateFieldRow('tenCustomer', repName); // KH cá nhân
    
    addOrUpdateFieldRow('chucVu', 'Giám đốc');
    addOrUpdateFieldRow('sdt', phone);
    addOrUpdateFieldRow('sdtCustomer', phone);
    
    addOrUpdateFieldRow('email', email);
    addOrUpdateFieldRow('emailDaiDien', email);
    addOrUpdateFieldRow('emailCustomer', email);
    
    addOrUpdateFieldRow('cmnd', cmnd);
    addOrUpdateFieldRow('cccd', cmnd);
    addOrUpdateFieldRow('cmndCustomer', cmnd);
    addOrUpdateFieldRow('cccdCustomer', cmnd);
    
    addOrUpdateFieldRow('ngaySinhCustomer', dob);
    addOrUpdateFieldRow('ngayCapCustomer', issueDate);
    addOrUpdateFieldRow('ngayCapSoDkdnCustomer', issueDate);
    addOrUpdateFieldRow('ngayCap', issueDate);
    
    addOrUpdateFieldRow('noiCapCustomer', listOffices[2]);
    addOrUpdateFieldRow('noiCap', listOffices[0]);
    addOrUpdateFieldRow('noiCapSoDkdnCustomer', listOffices[0]);

    // Parse thử địa chỉ thông minh
    const parsedAddr = parseAddressComponents(address);
    if(parsedAddr.province) addOrUpdateFieldRow('tinhIdNew', parsedAddr.province);
    if(parsedAddr.district || parsedAddr.ward) addOrUpdateFieldRow('xaIdNew', parsedAddr.ward || parsedAddr.district);
    if(parsedAddr.street) addOrUpdateFieldRow('duong', parsedAddr.street);
    
    saveFieldsToLocal();
}
