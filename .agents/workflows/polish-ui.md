---
description: Quy trình kiểm tra và làm đẹp giao diện (UI Polish)
---

Sử dụng workflow này khi cần nâng cấp giao diện lên mức "Premium":

1. **Kiểm tra Shadow & Border**:
   - Thay `border: 1px solid #ccc` bằng `border: 1px solid #dadce0` hoặc `rgba(0,0,0,0.1)`.
   - Sử dụng `box-shadow: 0 4px 24px rgba(0,0,0,0.2)` cho các panel chính.

2. **Gradients & Colors**:
   - Sử dụng Linear Gradient cho Header (ví dụ: `linear-gradient(135deg, #1a73e8, #1557b0)`).
   - Đảm bảo độ tương phản (Contrast) tốt cho văn bản.

3. **Micro-animations**:
   - Thêm `transition: all 0.2s ease` cho các hiệu ứng hover.
   - Các nút bấm nên có hiệu ứng `:active { transform: scale(0.95); }`.

4. **Glassmorphism (nếu cần)**:
   - Sử dụng `backdrop-filter: blur(10px)` và `background: rgba(255,255,255,0.8)`.
