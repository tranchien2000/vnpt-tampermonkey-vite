---
description: Quy trình sửa lỗi hiển thị và tương tác trên web đích
---

Sử dụng khi Widget bị lỗi (không hiện, bị che, hoặc click không ăn):

1. **Z-Index**:
   Kiểm tra xem `z-index` của widget có đủ lớn không (mặc định nên là `999999`).

2. **Conflict Style**:
   Trang VNPT có thể có CSS trùng tên. Hãy sử dụng các class prefix `vnpt-` hoặc `cw-` (đã triển khai) để tránh xung đột.

3. **DOM Selector**:
   Nếu nút "Quét" hoặc "Điền" không hoạt động, hãy dùng Console kiểm tra xem ID của phần tử trên trang web có bị thay đổi không.

4. **IFrame**:
   Nếu form nằm trong IFrame, script cần được cấu chỉnh trong UserScript header để chạy vào nội dung IFrame.
