# VNPT Project Memory

File này lưu trữ các quyết định quan trọng, lỗi đặc thù và trạng thái dự án để AI luôn duy trì được bối cảnh giữa các phiên làm việc.

## 1. Mục tiêu hiện tại (Current Objective)
- [x] Triển khai giao diện Glassmorphism cao cấp.
- [x] Hợp nhất menu cài đặt và sao lưu.
- [x] Hệ thống kiểm tra dữ liệu bắt buộc (Required Fields Validation).
- [/] Cải thiện hệ thống "Trí nhớ dự án" (Task hiện tại).

## 2. Nhật ký Quyết định (Decision Log)
- **2026-04-07 (Glassmorphism UI)**: Thay thế hoàn toàn giao diện cũ sang phong cách mờ đục (blur) với màu Indigo/Slate để tăng tính sang trọng.
- **2026-04-07 (Storage Abstraction)**: Di chuyển toàn bộ logic `localStorage` vào `src/api/storage/` để quản lý tập trung và tránh xung đột dữ liệu.
- **2026-04-09 (Memory System)**: Quyết định dùng file `PROJECT_MEMORY.md` kết hợp `.cursorrules` để AI "nhớ" tốt hơn thay vì chỉ dựa vào Context Window.

## 3. Lỗi đặc thù & Giải pháp (Technical Gotchas)
- **VNPT Selectors**: Các input trên trang VNPT thường không có ID cố định hoặc ID thay đổi theo phiên. Luôn ưu tiên dùng `placeholder` hoặc `label` text thông qua `webScanner.js`.
- **Z-Index Layering**: Widget cần có `z-index: 99999` để không bị đè bởi các modal của hệ thống VNPT.
- **MutationObserver Performance**: Khi quét form tự động, chỉ quan sát các node cụ thể thay vì toàn bộ `document.body` để tránh lag trang (đã tối ưu trong `autoFillForm.js`).

## 4. Trạng thái các tính năng (Status Map)
- **Export DOCX**: Hoạt động ổn định (Dùng docxtemplater).
- **Calc Widget**: Đã hợp nhất vào settings chính.
- **Sync Engine**: Hỗ trợ lắng nghe sự kiện `input` thời gian thực.

---
*Ghi chú: AI phải cập nhật file này sau mỗi task lớn bằng workflow `/update-memory`.*
