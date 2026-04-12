---
description: Quy trình tự động hóa phát hành bản cập nhật (Bump version, Build, Commit, Push)
---

# Workflow: Fast Release (/release)

Sử dụng workflow này khi bạn muốn đẩy nhanh một bản cập nhật lên GitHub và thông báo cho người dùng.

## Các bước thực hiện

1. **Chuẩn bị nội dung**: Đảm bảo các thay đổi code đã được lưu.
2. **Chạy lệnh Release**:
   Sử dụng lệnh sau để thực hiện chuỗi lệnh tự động:
   
   ```powershell
   npm run release "Lời nhắn cho bản cập nhật này"
   ```

3. **Hệ thống sẽ tự động**:
   - Tăng số phiên bản (Patch) trong `package.json`.
   - Build lại `myscript.user.js` vào thư mục `dist/`.
   - Tạo commit với định dạng: `release: v1.x.x - Lời nhắn cho bản cập nhật này`.
   - Push code lên nhánh chính trên GitHub.

4. **Kiểm tra**:
   - Chờ GitHub Action chạy xong (khoảng 30s) để đồng bộ `version.json`.
   - Mở web đích để thấy badge **NEW** và thông báo nhắc nhở đã được cập nhật nội dung mới.

## Lưu ý

- Lời nhắn trong ngoặc kép sẽ được hiển thị trực tiếp cho người dùng trong thông báo "Đã có phiên bản mới".
- Nếu không nhập lời nhắn, hệ thống sẽ dùng mặc định là "Cập nhật tính năng mới".
