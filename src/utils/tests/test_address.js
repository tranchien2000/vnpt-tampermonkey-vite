import { parseAddressComponents } from '../stringHelper.js';

const testAddresses = [
    "Số nhà 41, ngõ 9, đường Bảo Đà, Xã Bình Minh, TP Hà Nội",
    "123 Lý Thường Kiệt, Phường 5, Quận 10, TP. Hồ Chí Minh",
    "Thôn 1, Xã Ea Kao, Thành phố Buôn Ma Thuột, Đắk Lắk",
    "Số 10, ngách 2, ngõ 5, đường Hoàng Hoa Thám, P. Liễu Giai, Q. Ba Đình, Hà Nội",
    "Số nhà 41 ngõ 9 đường Bảo Đà - Xã Bình Minh - TP Hà Nội",
    "Số 102 Lê Duẩn\nPhường Cửa Nam\nQuận Hoàn Kiếm\nHà Nội"
];

testAddresses.forEach(addr => {
    const result = parseAddressComponents(addr);
    console.log(`Address: ${addr}`);
    console.log(`- Street:   "${result.street}"`);
    console.log(`- Ward:     "${result.ward}"`);
    console.log(`- District: "${result.district}"`);
    console.log(`- Province: "${result.province}"`);
    console.log('---');
});
