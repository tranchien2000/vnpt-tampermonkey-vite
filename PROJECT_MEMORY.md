# VNPT Project Memory

File này lưu trữ các quyết định quan trọng, lỗi đặc thù và trạng thái dự án để AI luôn duy trì được bối cảnh giữa các phiên làm việc.

## 1. Mục tiêu hiện tại (Current Objective)

- [x] Tối ưu hóa hệ thống bộ nhớ dự án (Project Memory) để tiết kiệm token.
- [x] Triển khai logic "Học máy" (Address Learning) cho trường Đường.
- [x] Tích hợp bộ đọc mã QR CCCD nội bộ siêu tốc.
- [x] Tự động hóa và chuẩn hóa các trường dữ liệu Ngày/CCCD.
- [x] Tối ưu hóa dung lượng file build (Externalize libraries, Firestore Lite).
- [x] Hệ thống đo đếm Token Gemini tại Client.

## 2. Nhật ký Quyết định (Decision Log)

### 2026-04-15 (Latest)
- **Memory Optimization**: Nén Decision Log cũ, loại bỏ các mục trùng lặp để giảm context window cho AI.
- **Build Optimization**: Chuyển `pizzip`, `docxtemplater`, `jsqr` sang CDN. Chuyển sang Firestore Lite. Tắt minify nhưng giữ `keepNames: true` để ổn định logic.
- **CCCD QR & Mock Data**: Tích hợp quét QR CCCD offline (jsqr) và generator dữ liệu mẫu.
- **Address Learning**: Lưu trữ cặp `Địa chỉ gốc` -> `Đường đã sửa` giúp tự động hóa việc điền địa chỉ phức tạp.
- **UI Improvements**: Thêm chế độ Pinned (Ghim), tối ưu mượt Drag & Drop (60fps), refactor modular Styles và Fields Manager.
- **Token Tracker**: Theo dõi mức tiêu thụ token Gemini ngay tại client.

### Legacy Summary (v1.6.0 - v1.6.24)
- **Sync System**: Triển khai Reverse Sync (Page -> Widget), Real-time 2-way sync, và Sync Direction UI (icon SVG).
- **Automation**: Chuẩn hóa ngày tháng thông minh (`normalizeDate`) và validation CMND/CCCD.
- **Performance**: Tối ưu AJAX địa chỉ bằng Group-by-Rank. Tách file monolithic thành các module nhỏ (Styles, Fields).
- **Security**: Chuyển đổi storage API Key sang cơ chế text-security để tránh browser save password.

## 3. Lỗi đặc thù & Giải pháp (Technical Gotchas)

- **VNPT Selectors**: Các input trên trang VNPT thường không có ID cố định. Luôn ưu tiên dùng `placeholder` hoặc `label` text.
- **Address Learning Context**: Việc "học" địa chỉ phụ thuộc vào `sourceContext` (địa chỉ đầy đủ). Nếu mất context này, logic học sẽ không kích hoạt.
- **Build vs Dev Discrepancy**: Bản build nén có thể làm hỏng logic phụ thuộc vào `function.name`. Giải pháp: tắt `minify`.
- **Browser Password Manager**: Dùng `type="text"` + `-webkit-text-security: disc` để bypass thông báo "Save password".

## 4. Trạng thái các tính năng (Status Map)

- **AI Scanner**: Ổn định (PDF/Ảnh/Mail/Screen).
- **CCCD QR**: Ổn định (Offline).
- **Local History**: Ổn định (20 bản ghi).
- **Cloud Sync**: Ổn định (Firebase Lite).
- **Real-time Sync**: Hỗ trợ 2 chiều, hướng tùy chỉnh.

---
_Cập nhật lần cuối: 2026-04-15. AI cần đọc file này đầu tiên khi bắt đầu session._
