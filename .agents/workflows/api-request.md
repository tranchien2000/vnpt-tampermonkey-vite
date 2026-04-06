---
description: Cách gọi API ngoài an toàn và đúng chuẩn Tampermonkey
---

Do chính sách bảo mật (CORS), bạn không nên dùng `fetch` thông thường. Hãy dùng `GM_xmlhttpRequest`:

1. **Mô tả**:
   Hàm này cho phép gọi API từ cross-domain (ví dụ: gọi từ `vnpt.vn` tới `api.google.com`).

2. **Cách dùng**:
   ```js
   GM_xmlhttpRequest({
     method: "GET",
     url: "https://api.example.com/data",
     onload: function(response) {
       console.log(JSON.parse(response.responseText));
     }
   });
   ```

3. **Lưu ý**:
   - Luôn kiểm tra `response.status` trước khi xử lý.
   - Tránh truyền dữ liệu nhạy cảm qua URL không mã hóa.
