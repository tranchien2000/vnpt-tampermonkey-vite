# Quy Tắc Phát Triển Tampermonkey UserScript (JS)

Bộ quy tắc này quy định các tiêu chuẩn về kiến trúc, bảo mật, và hiệu năng khi phát triển Tampermonkey Userscript, đặc biệt với các dự án tích hợp thư viện bên thứ 3 (Export, Preview, OCR). Hệ thống AI phải tuyệt đối tuân thủ các nguyên tắc này khi khởi tạo và tái cấu trúc mã nguồn.

## 1. Kiến Trúc & Build Process (Architecture & Build Process)
- **Module Hóa (Modularization):** Không duy trì toàn bộ code trong một file `.js` duy nhất. Phải sử dụng Bundler (như Vite, Webpack, Rollup) và TypeScript để quản lý mã nguồn. Code sẽ tự động bundle thành file Userscript khi deploy.
- **Tách Biệt Lớp (Separation of Concerns):** Core Logic (xử lý dữ liệu, giao tiếp API, cấu trúc Model) phải độc lập hoàn toàn với lớp UI. Nhờ vậy, source có thể tái sử dụng dễ dàng cho Web App hoặc Browser Extension chuẩn.
- **Tự Động Hóa Metadata:** Các meta header của Userscript (`@name`, `@match`, `@require`, v.v.) phải được cấu hình và sinh tự động thông qua quá trình build, hạn chế việc hard-code rải rác.

## 2. Cấu hình Metadata Tampermonkey & Bảo Mật
- **Khai báo `@require`:** Tuyệt đối không nhúng nội dung thư viện khổng lồ (như Tesseract.js, docxtemplater) trực tiếp vào script. Bắt buộc dùng `@require` để tải thư viện từ các CDN uy tín (unpkg, cdnjs, jsdelivr).
- **Quyền hạn `@grant` (Least Privilege):** Chỉ phê duyệt quyền trên Header khi thật sự cần thiết (VD: `GM_xmlhttpRequest`, `GM_setValue`, `GM_download`, `GM_addStyle`). Việc khai báo thừa quyền sẽ báo động hệ thống quét bảo mật của trình duyệt và Tampermonkey.
- **Khai báo `@connect`:** Mọi domain của server bên ngoài (VD: OCR Server API) phải được khai báo minh bạch bằng lệnh `@connect` để tránh bị hệ thống mặc định ngăn chặn.
- **Bất Biến & Phòng Chống XSS:** Tuyệt đối khử mã độc khi render dữ liệu từ người dùng hoặc hệ thống không tin cậy. Dùng tuần tự `document.createElement`, `element.textContent`, và `element.classList` thay vì chèn ồ ạt qua cơ chế `element.innerHTML`.

## 3. Cách Ly & Quản Lý Giao Diện (UI Isolation)
- **Bắt Buộc Dùng Shadow DOM:** Bất kỳ giao diện phụ nào (Widget panel, Button, Modal) inject vào host page bắt buộc phải nằm trong `Shadow DOM`. Chế độ này giúp cách ly hoàn toàn CSS, cho phép can thiệp nội dung widget an toàn mà không làm rách/lệch giao diện trang chủ và ngược lại. Ở những nơi bất khả kháng, có thể dùng tiền tố ID/Class cực kì cụ thể để khoanh vùng.
- **Style Management:** Không viết CSS dựa vào tên thẻ thông dụng hay thuộc tính bị trùng lặp. Đặt CSS thành các tập tin độc lập sau đó chèn qua thẻ `<style>` đi kèm hệ thống Shadow DOM. Tuyệt đối hạn chế inline style.
- **Tiêm HTML Rành Mạch:** Tạo dựng UI có cấu trúc rõ ràng. Hạn chế thiết đặt giao diện bằng chuỗi nhúng dài mà nên ứng dụng API DOM chuẩn nếu form đi kèm logic.

## 4. Tương Tác DOM & Hiệu Năng (DOM Parsing & Performance)
- **Đợi Web Load Dữ Liệu Động (Ajax/React/Vue):** Thay vì dựa vào `window.onload`, phải bọc logic tìm kiếm element bên trong `MutationObserver` hoặc hệ thống vòng lặp chờ đợi (VD: hàm `waitForElement()`). Tránh hiện tượng ứng dụng khởi chạy khi trang chưa xong.
- **An Toàn Null Check:** Tất cả thao tác truy vết trong DOM (`querySelector`, `getElementById`) BẮT BUỘC có hàm kiểm tra an toàn / `null check` / Optional Chaining trước khi sử dụng tài nguyên `.value` hay `.innerText`.
- **Tối Ưu MutationObserver:**
  - Thu hẹp vòng quan sát (`targetNode`) nhỏ và sâu tận cùng hết mức có thể, không áp trực tiếp Observer vào `document.body` khiến event bắn thừa thãi.
  - Phải xử lý logic qua cơ chế **Debounce** hoặc **Throttle** để giới hạn tải CPU khi kích hoạt xử lý callback thay đổi giao diện.
  - Cần gọi `.disconnect()` giải phóng tài nguyên đối với MutationObserver khi tính năng ngừng kích hoạt / widget ẩn tắt.

## 5. Xử Lý Tích Hợp & Giao Tiếp Bên Thứ 3
- **Bypass CORS bằng GM_xmlhttpRequest:** Mọi call API liên miền (Cross-domain request) BẮT BUỘC sử dụng hàm `GM_xmlhttpRequest` (vượt phân quyền CORS native của trình duyệt host). Không lạm dụng `fetch()` vì host domain có thể đánh sập ngay.
- **Giao Tiếp Nội Bộ (Event-driven):** Việc tương tác và liên lạc giữa nhiều iframe preview hay các thành phần của script với nhau cần thực hiện qua `window.postMessage` hoặc `CustomEvent` với namespace định danh mang tính độc nhất (VD: `vnpt-tamper-sync-req`) thay vì đụng chạm vào event gốc.
- **Xử Lý Export (File & Blob URLs):** Khi khởi tạo dữ liệu lớn (Word/PDF/Excel), phải giữ định dạng ở mức `Blob`. Tạo đường dẫn lưu File bằng `URL.createObjectURL(blob)`, và đặc biệt LƯU Ý luôn gọi **`URL.revokeObjectURL()`** để ra lệnh cho Garbage Collector giải phóng RAM ngay lập tức, ngăn ngừa phình bộ nhớ trầm trọng. Kiên quyết không chuyển toàn file nhị phân thành Base64 string vì sẽ ngốn RAM lớn.
- **Tính Năng Preview File:** Đối với tài liệu, hãy ứng dụng thẻ `iframe` với Blob URL truyền vào cấu trúc `src` để preview mượt mà và an toàn trên nội bộ máy khách.

## 6. Quản Lý Trạng Thái & Thiết Lập (Persistence State)
- **Xài Storage Độc Lập Tampermonkey:** Tuyệt đối không lưu cấu hình hay Token vào `localStorage` hay `sessionStorage` của website bởi nó dễ gặp nguy cơ bảo mật đồng thời dễ bị website ghi đè. Giải pháp tiêu chuẩn là cấu trúc `GM_setValue`, `GM_getValue`, `GM_deleteValue` của chính Tampermonkey.
- **Bảo Vệ Dữ Liệu Nhạy Cảm:** Với Access Token hay các tham số hệ thống đặc thù, tuyệt đối không hard-code tĩnh vào mã nguồn. Để tính năng input prompt báo cho User nhập ở UI hoặc giao diện Option config tuân thủ quyền riêng tư.
- **Tính Tuần Tự Hóa (Serialization):** Cấu trúc settings phải cho phép dễ dàng serialize qua `JSON` để đáp ứng khả năng đồng bộ (Sync config qua Cloud), cho phép backup trích xuất trạng thái một cách hiện đại.
