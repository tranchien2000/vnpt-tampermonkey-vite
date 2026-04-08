---
description: Quy trình bảo trì và cập nhật chức năng xuất/nhập file JSON (Backup)
---

# Workflow Xuất/Nhập file JSON (Backup)

Chức năng **xuất file cấu hình JSON** là tính năng cốt lõi để người dùng có thể chia sẻ, lưu trữ sao lưu, và đồng bộ hóa các thiết lập (Template, Mapping, Fields form, v.v.) giữa nhiều thiết bị và trình duyệt khác nhau.

## Vị trí xử lý logic
Toàn bộ logic thao tác xử lý file import/export đều nằm ở một module duy nhất:
- **File:** `src/utils/backupHelper.js`

## Nguyên tắc Xuất Dữ liệu (Export)
1. **Dữ liệu trải phẳng (Flatten Data)** 
Khi xuất dữ liệu `dataDefault` hoặc `dataCustom`, chúng ta thường gặp các key gộp với dấu phẩy do người dùng khai báo ở giao diện (ví dụ `"MST, Mã khách hàng, Tên KH": "Thông tin KH"`).
Hệ thống **BẮT BUỘC PHẢI** sử dụng hàm `flattenData` nội bộ để tách các key này thành key độc lập trên cấu trúc JSON xuất ra để đảm bảo dữ liệu chuẩn khi sử dụng API hoặc nhập lại vào máy khác.

   ```javascript
   // LUÔN DÙNG flattenData cho dataDefault và dataCustom
   dataDefault: flattenData(Storage.get(SK_DATA_DEF)),
   dataCustom: flattenData(Storage.get(SK_DATA_CUS)),
   ```

2. **Dọn dẹp rác**
Tuyệt đối không lưu dữ liệu cache hoặc temp (chỉ tồn tại trong session) vào file JSON để giảm dung lượng tải và tránh bị sai logic luồng chạy trên thiết bị đích.

## Quy trình Thêm Mới Dữ Liệu vào file Backup
Khi bạn code xong một tính năng mới yêu cầu lưu cài đặt/trường vào `localStorage` (Ví dụ: Thêm tính năng cấu hình proxy mới với key `SK_PROXY_CONFIG`). Phải đảm bảo cập nhật đồng bộ Backup:

1. **Bước 1:** Mở file `src/utils/backupHelper.js`.
2. **Bước 2 (Export):** Tìm đến hàm `exportFullBackup()` và bổ sung key vào block payload `backup`:
   ```javascript
   backup: {
       // ... các settings cũ
       proxyConfig: Storage.get(SK_PROXY_CONFIG)
   }
   ```
3. **Bước 3 (Import):** Tìm đến hàm `importFullBackup()` và bổ sung lệnh phục hồi (kèm check dữ liệu undefined):
   ```javascript
   if (b.proxyConfig !== undefined) Storage.set(SK_PROXY_CONFIG, b.proxyConfig);
   ```

## Thay đổi cấu trúc và Tương thích ngược (Backward Compatibility)
Khi thay đổi lớn về cách cấu trúc mã đối tượng lưu trong JSON, bạn **PHẢI** lưu ý các file `.json` cũ mà người dùng có.
Trong hàm `importFullBackup()`, nếu một version `JSON` được import không có trường dữ liệu mới tạo (do là bản cũ), hàm phục hồi phải xử lý khéo léo để gán fallback (Ví dụ không đè lên giá trị Default vừa sinh ra lúc load trang lần đầu).
Làm sao ghi file báo lỗi (showToast) cụ thể nhất khi JSON parse fail.
