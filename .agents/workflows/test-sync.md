---
description: Công cụ/Quy trình debug nhanh CSS selectors và IDs trên trang web VNPT
---

Dùng khi bạn muốn biết một ô nhập liệu trên web có ID hay Name gì để cấu hình Sync:

1. **Console Snippet**:
   Dán mã này vào Console trình duyệt để hiện ID/Name của phần tử đang được focus:
   ```js
   document.addEventListener('focusin', (e) => {
     console.log('ID:', e.target.id, '| Name:', e.target.name);
   });
   ```

2. **Quét tự động**:
   Sử dụng nút **[Quét]** trên Widget Export. AI sẽ đối chiếu `DEFAULT_LABELS` trong [constants.js](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/src/core/constants.js) để tìm phần tử tương ứng.

3. **Lỗi không quét được**:
   Nếu selector sai, hãy cập nhật `DEFAULT_LABELS` với ID/Name chính xác nhất vừa tìm được ở Bước 1.
