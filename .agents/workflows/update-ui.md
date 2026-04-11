---
description: Quy trình cập nhật hoặc sửa đổi giao diện (CSS) cho các widget
---

Để cập nhật giao diện mà không làm mất tính thẩm mỹ và cấu trúc, hãy thực hiện:

1. **Tìm đúng Section**:
   Mở [styles.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/ui/styles.js) và định vị mã CSS trong 6 SECTION:
   - SECTION 1: Khung bao ngoài & nút Toggle.
   - SECTION 2-5: Export Panel & Template Manager.
   - SECTION 6: Calc Widget (bao gồm cả các Tab Data).

2. **Tiêu chuẩn thiết kế (Antigravity Standard)**:
   - **Màu sắc**: Không dùng màu cơ bản (Red/Blue/Green). Hãy dùng HSL hoặc HEX phối hợp (ví dụ: `#1a73e8`, `#1e8e3e`).
   - **Hiệu ứng**: Ưu tiên Gradients, Box-Shadow nhẹ, và Border-Radius (thường là 8px-15px).
   - **Tương tác**: Thêm `:hover` hoặc `:active` với `transition: 0.2s`.

3. **Verify**:
   Kiểm tra trên trình duyệt để đảm bảo không lỗi cú pháp CSS trong template string.
