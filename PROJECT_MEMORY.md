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
- [x] Tích hợp API tra cứu MST doanh nghiệp.
- [x] Tối ưu hóa hiệu suất quét DOM (O(N+M)).
- [x] Hoàn thiện logic nút 🗑 (Dọn giá trị / Xóa hàng).


## 2. Nhật ký Quyết định (Decision Log)

- **2026-04-07 (Glassmorphism UI)**: Thay thế hoàn toàn giao diện cũ sang phong cách mờ đục (blur) với màu Indigo/Slate để tăng tính sang trọng.
- **2026-04-07 (Storage Abstraction)**: Di chuyển toàn bộ logic `localStorage` vào `src/api/storage/` để quản lý tập trung và tránh xung đột dữ liệu.
- **2026-04-09 (Memory System)**: Quyết định dùng file `PROJECT_MEMORY.md` kết hợp `.cursorrules` để AI "nhớ" tốt hơn.
- **2026-04-09 (Rules & Workflow Alignment)**: Giải thích cơ chế Slash Commands cho người dùng (không có menu tự động) v*Ngày cập nhật: 22:45:00 10/4/2026*

> [!NOTE]
> Để có cái nhìn chi tiết và đầy đủ nhất về toàn bộ logic dự án cho NotebookLM, hãy tham khảo file:
> [.notebooklm/PROJECT_REPORT_2026.04.10.md](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/.notebooklm/PROJECT_REPORT_2026.04.10.md)
dẫn vào `RULES.md`.
- **2026-04-10 (Fix Slash Command Autocomplete)**: Phát hiện và sửa lỗi Extension UI không gọi được autocomplete do file `.gitignore` ẩn thư mục `.agents`. Đã cấu hình lại `.gitignore` và hoàn tác các rule sai lầm trước đó.
- **2026-04-10 (PDF Scan Button Enhancement)**: Bổ sung logic copy link hướng dẫn Gemini (GUIDE) vào clipboard nếu chưa cấu hình API Key khi bấm nút Scan PDF.
- **2026-04-10 (Startup Workflow)**: Triển khai `/start` để tự động hóa việc load bối cảnh dự án (brain_context + PROJECT_MEMORY).
- **2026-04-10 (NotebookLM Integration)**: Cấu hình Notebook dự án tại URL: `https://notebooklm.google.com/notebook/7e1829da-588e-42d2-8a87-afef88b6d3e7`. AI sẽ sử dụng URL này cho các tác vụ cập nhật brain mà không cần hỏi lại.
- **2026-04-10 (DOM Optimization)**: Triển khai `buildFullDOMMap` trong `domHelper.js` để chuyển đổi hiệu suất quét từ O(N*M) sang O(N+M), giúp widget xử lý nhanh ngay cả trên trang phức tạp.
- **2026-04-10 (Selector Inspector)**: Triển khai công cụ soi trường web giúp người dùng tự lấy selector mà không cần mở DevTools.
- **2026-04-10 (MST API Integration)**: Kết hợp tra cứu MST vào bảng fieldsManager để tự động điền thông tin doanh nghiệp.
- **2026-04-10 (UI/UX Refinement)**: Nâng cấp nút 🗑 thành Dual-mode (Clean All/JSON Backup/Delete Row).


## 3. Lỗi đặc thù & Giải pháp (Technical Gotchas)

- **VNPT Selectors**: Các input trên trang VNPT thường không có ID cố định. Luôn ưu tiên dùng `placeholder` hoặc `label` text qua `webScanner.js`.
- **Z-Index Layering**: Widget cần có `z-index: 99999`.
- **MutationObserver Performance**: Chỉ quan sát các node cụ thể để tránh lag trang.

## 4. Trạng thái các tính năng (Status Map)

- **Export DOCX**: Hoạt động ổn định.
- **Calc Widget**: Đã hợp nhất vào settings.
- **Sync Engine**: Hỗ trợ lắng nghe sự kiện `input` thời gian thực.

---

_Ghi chú: AI phải cập nhật file này sau mỗi task lớn bằng workflow `/update-memory`._
