---
description: Cách cấu hình để Widget tự động điền dữ liệu lên trang web
---

Có 2 cấp độ đồng bộ (Sync) dữ liệu:

1. **Cấp độ Field (Widget Export)**:
   - Trong bảng Fields, điền vào cột **🔗 Sync (Mã ID)**. 
   - Mã này có thể là ID hoặc Name của phần tử trên trang web.
   - Phân cách nhiều ID bằng dấu phẩy nháy (ví dụ: `hoTen, hoTen_A, recipient_name`).

2. **Cấp độ Tab Sync (Calc Widget)**:
   - Mở Tab **🔗 Sync** trong Calc Widget.
   - Thêm một cặp: `Nguồn (Label/ID trên trang)` → `Đích (Các ID/Name đích)`.
   - Cơ chế này sử dụng `doSyncData` trong [dataFillFeature.js](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/src/features/dataFillFeature.js).

3. **Sửa logic đồng bộ**:
   - Mọi thao tác gán giá trị đều đi qua [domHelper.js](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/src/utils/domHelper.js) (hàm `setPageField` hoặc `syncSetValue`).
