---
description: Quy trình chuẩn để tạo một module tính năng mới từ A-Z
---

Để thêm một tính năng lớn (ví dụ: "Thống kê báo cáo"), hãy tuân thủ cấu trúc module:

1. **Tạo thư mục**: `src/features/tenTinhNang/`.
2. **Chia nhỏ logic**:
   - `logic.js`: Chỉ chứa tính toán, xử lý dữ liệu, không có DOM.
   - `ui.js`: Chỉ chứa tạo DOM và gán Event Listeners.
   - `index.js`: Export hàm khởi tạo chính (ví dụ: `initStats`).
3. **Khai báo hằng số**: Thêm các key Storage mới vào [constants.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/core/constants.js).
4. **Khởi tạo**: Import và gọi hàm init trong [main.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/main.js).
5. **Cập nhật tài liệu**: Thêm module mới vào [ARCHITECTURE.md](file:///c:/Users/Chien/vnpt-tampermonkey-vite/ARCHITECTURE.md).
