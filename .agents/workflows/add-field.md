---
description: Cách thêm một trường dữ liệu (field) mới vào toàn bộ hệ thống
---

Để thêm một trường mới (ví dụ: "Mã số thuế" - `maSoThue`), hãy thực hiện các bước sau:

1. **Core - Constants**:
   Mở [constants.js](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/src/core/constants.js) và thêm key-label vào `DEFAULT_LABELS`.
   ```js
   'maSoThue': 'Mã số thuế',
   ```

2. **Core - Defaults**:
   Nếu trường này cần giá trị mặc định cho VNPT Hà Nội, hãy thêm vào `src/core/defaults.js`.

3. **Features - Web Scanner**:
   [webScanner.js](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/src/features/webScanner.js) sẽ tự động nhận diện field này từ `DEFAULT_LABELS`, nhưng nếu cần logic lấy giá trị đặc biệt (ví dụ từ `select` hoặc `span`), hãy cập nhật hàm `initWebScanner`.

4. **Verify**:
   Chạy `npm run build` và kiểm tra nút "Quét" trên widget.
