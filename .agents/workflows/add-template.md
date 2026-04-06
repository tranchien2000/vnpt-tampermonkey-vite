---
description: Quy trình thêm một mẫu Template DOCX từ Google Drive hoặc URL
---

Mặc định các mẫu được lưu trong LocalStorage, nếu bạn muốn AI thêm một mẫu cố định vào danh sách cho người dùng khác:

1. **Chuẩn bị Link**:
   Link Google Drive phải ở dạng "Bất kỳ ai có liên kết đều có thể đọc".

2. **Khởi tạo Code**:
   Mẫu thường được render bởi `renderTemplateManager` trong [widget.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/ui/widget.js).
   Để thêm mẫu mặc định, AI cần chèn logic nạp mẫu vào `localStorage (SK_TEMPLATES)` nếu nó chưa tồn tại trong [templateManager.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/features/templateManager.js).

3. **Xử lý URL**:
   Sử dụng hàm `normalizeUrl(url)` để chuyển link trực tiếp của GDrive thành link tải file `uc?export=download`.

4. **Verify**:
   Chạy `npm run build` và kiểm tra xem template có xuất hiện trong danh sách "📁 Bộ nhớ Templates" hay không.
