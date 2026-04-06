---
description: Cách thêm một hàm bổ trợ (helper) vào hệ thống
---

Để thêm một hàm format tiền, ngày tháng hoặc xử lý chuỗi:

1. **Chọn vị trí**:
   - Thao tác số/tiền: [numberHelper.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/utils/numberHelper.js)
   - Thao tác DOM: [domHelper.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/utils/domHelper.js)
   - Logic chung: Tạo file mới trong `src/utils/`.

2. **Viết JSDoc**:
   Luôn bắt đầu hàm với JSDoc rành mạch để AI có thể hiểu mà không cần đọc logic:
   ```js
   /**
    * @param {number} val
    * @returns {string} định dạng dd/mm/yyyy
    */
   export function formatDate(val) { ... }
   ```

3. **Sử dụng**:
   Import hàm vào các `features/` tương ứng. Nếu là logic tính toán cho Calc, hãy cập nhật [calcLogic.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/features/calc/calcLogic.js).
