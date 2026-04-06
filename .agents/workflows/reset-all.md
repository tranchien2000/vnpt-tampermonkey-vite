---
description: Quy trình xóa sạch dữ liệu cũ để bắt đầu môi trường test mới
---

Để xóa toàn bộ dữ liệu lưu trong trình duyệt (LocalStorage & IndexedDB):

1. **Xóa SQL/IDB**:
   AI hoặc người dùng có thể chạy mã sau trong Console trình duyệt:
   ```js
   localStorage.clear();
   indexedDB.deleteDatabase("VNPT_Templates_DB");
   location.reload();
   ```

2. **Xóa Build**:
   Sử dụng lệnh hệ thống để xóa thư mục `dist/`:
   ```cmd
   rmdir /s /q dist
   ```

3. **Re-init**:
   Sử dụng workflow `/dev-all` để cài đặt lại.
