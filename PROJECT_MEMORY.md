# VNPT Project Memory

File này lưu trữ các quyết định quan trọng, lỗi đặc thù và trạng thái dự án để AI luôn duy trì được bối cảnh giữa các phiên làm việc.

## 1. Mục tiêu hiện tại (Current Objective)

- [x] Triển khai giao diện Glassmorphism cao cấp.
- [x] Hợp nhất menu cài đặt và sao lưu.
- [x] Hệ thống kiểm tra dữ liệu bắt buộc (Required Fields Validation).
- [x] Cải thiện hệ thống "Trí nhớ dự án" (Đã khôi phục và đồng bộ).
- [x] Kiểm tra tính nhất quán của hệ thống Rules/Workflow với người dùng.
- [x] Triển khai tính năng Phân loại dữ liệu Local (Raw Scan).
- [x] Xây dựng công cụ Selector Inspector (Bắt selector bằng click).
- [x] Nâng cấp Selector Inspector: Batch Capture mode, Top Banner, Esc support và Smart Labeling.
- [x] Tích hợp API tra cứu MST doanh nghiệp (Xinvoice).
- [x] Tự động hóa trường Nơi cấp ĐKDN theo Tỉnh (`SKDT {Tỉnh}`).
- [x] Sửa lỗi VNPT Calculator tự động nhảy về số 0 khi xóa trắng ô nhập liệu.
- [x] Cải tiến Field Linker: Hỗ trợ Smart Mapping (tìm label/wrapper id khi input yếu).
- [x] Tích hợp visual link (🔗) vào phần Mapping Calc trong Banner.
- [x] Tích hợp Quét nội dung Mail (Gmail/Outlook) và Quét Màn hình trực tiếp qua AI Scanner.
- [x] Nâng cấp hệ thống Local History (Tối đa 10 bản).
- [x] Quản lý bản ghi (Khôi phục/Xóa) trực tiếp trên nút ⏪.
- [x] Chuyển đổi cơ chế nút 🗑 sang lưu History thay vì export file JSON.
- [x] Khử bỏ thông báo "Save password" của trình duyệt cho các trường API Key và Cloud Pass.

## 2. Nhật ký Quyết định (Decision Log)

- **2026-04-07 (Glassmorphism UI)**: Thay thế hoàn toàn giao diện cũ sang phong cách mờ đục (blur) với màu Indigo/Slate để tăng tính sang trọng.
- **2026-04-07 (Storage Abstraction)**: Di chuyển toàn bộ logic `localStorage` vào `src/api/storage/` để quản lý tập trung và tránh xung đột dữ liệu.
- **2026-04-09 (Memory System)**: Quyết định dùng file `PROJECT_MEMORY.md` kết hợp `.cursorrules` để AI "nhớ" tốt hơn.
- **2026-04-10 (Selector Inspector)**: Triển khai công cụ soi trường web giúp người dùng tự lấy selector mà không cần mở DevTools.
- **2026-04-11 (Cloud Sync)**: Hoàn thành Cloud Integration với Firebase (Firestore/Auth/Storage).
- **2026-04-12 (Local History Enhancement)**: Chuyển đổi cơ chế sao lưu từ file JSON sang Local Storage (tối đa 10 bản) cho nút 🗑. Nâng cấp nút ⏪ thành menu quản lý bản ghi (khôi phục/xoá) để tối ưu trải nghiệm người dùng.
- **2026-04-12 (No More Password Prompt)**: Chuyển đổi các trường Password/API Key sang `type="text"` kết hợp CSS `-webkit-text-security: disc` để đánh lừa browser password manager, giải quyết triệt để thông báo "Save password?".
- **2026-04-12 (Advanced Selector Inspector)**: Thay đổi toàn diện công cụ 🔍. Thêm Banner hướng dẫn phía trên, cho phép chọn nhiều trường liên tục (Batch Capture), hỗ trợ phím Esc và cải thiện thuật toán tìm nhãn (label) tự động.

## 3. Lỗi đặc thù & Giải pháp (Technical Gotchas)

- **VNPT Selectors**: Các input trên trang VNPT thường không có ID cố định. Luôn ưu tiên dùng `placeholder` hoặc `label` text.
- **Address Real-time Lag**: Sử dụng cooldown và cache map trong `domHelper.js` để tránh lag khi gõ địa chỉ.
- **Storage get/set Inconsistency**: Luôn stringify khi lưu và try-catch khi đọc để tránh crash khi parse dữ liệu không phải JSON.
- **Browser Password Heuristics**: Browsers như Chrome tự động hiện popup "Save password?" khi thấy `type="password"`. Giải pháp là dùng `type="text"` + `-webkit-text-security: disc` và `autocomplete="new-password"`.

## 4. Trạng thái các tính năng (Status Map)

- **Export DOCX**: Hoạt động ổn định.
*   **AI Scanner**: Hoạt động ổn định (PDF/Ảnh/Mail/Screen).
*   **Local History**: Hoạt động ổn định (Tối đa 10 bản, hỗ trợ CRUD).
- **Cloud Sync**: Hoạt động ổn định (Firebase).

---

_Ghi chú: AI phải cập nhật file này sau mỗi task lớn bằng workflow `/update-memory`._
