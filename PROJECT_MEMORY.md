# VNPT Project Memory

File này lưu trữ các quyết định quan trọng, lỗi đặc thù và trạng thái dự án để AI luôn duy trì được bối cảnh giữa các phiên làm việc.

## 1. Mục tiêu hiện tại (Current Objective)

- [x] Triển khai Sync 2 chiều (Reverse Sync) cho trường "Tên Tổ Chức" (Đã bị USER gỡ bỏ thủ công).
- [x] Sửa lỗi Quét địa chỉ (id="duong", tỉnh) lấy nhầm ID số thay vì Title/Text.
- [x] Hợp nhất menu cài đặt và sao lưu.
- [x] Hệ thống kiểm tra dữ liệu bắt buộc (Required Fields Validation).
- [x] Cải thiện hệ thống "Trí nhớ dự án" (Đã khôi phục và đồng bộ).
- [x] Kiểm tra tính nhất quán của hệ thống Rules/Workflow với người dùng.
- [x] Triển khai tính năng Phân loại dữ liệu Local (Raw Scan).
- [x] ~~Xây dựng công cụ Selector Inspector (Bắt selector bằng click)~~ (Đã xóa để tối ưu code).
- [x] ~~Nâng cấp Selector Inspector: Batch Capture mode, Top Banner, Esc support và Smart Labeling~~ (Đã xóa).
- [x] Tích hợp API tra cứu MST doanh nghiệp (Xinvoice).
- [x] Tự động hóa trường Nơi cấp ĐKDN theo Tỉnh (`SKDT {Tỉnh}`).
- [x] Sửa lỗi VNPT Calculator tự động nhảy về số 0 khi xóa trắng ô nhập liệu.
- [x] Cải tiến Field Linker: Hỗ trợ Smart Mapping (tìm label/wrapper id khi input yếu).
- [x] Tích hợp visual link (🔗) vào phần Mapping Calc trong Banner.
- [x] Tích hợp Quét nội dung Mail (Gmail/Outlook) và Quét Màn hình trực tiếp qua AI Scanner.
- [x] Nâng cấp hệ thống Local History (Tối đa 10 bản).
- [x] Quản lý bản ghi (Khôi phục/Xóa) trực tiếp trên nút ⏪.
- [x] Chuyển đổi cơ chế nút 🗑 sang lưu History thay vì export file JSON.
- [x] Khử bỏ thông báo "Save password" của trình duyệt cho các trường API Key và Cloud Pass.
- [x] Phát hành bản cập nhật v1.6.5 (Tối ưu model, Backup nội bộ, Fix Autofill).
- [x] Phát hành bản cập nhật v1.6.9 (Tối ưu performance Drag & Drop, Group-by-Rank Address Sync).
- [x] Tự động tách Tỉnh/Thành phố từ MST và điền thông tin thông minh vào dropdown (Select2).
- [x] Cấu trúc lại nhóm địa chỉ (Tỉnh trái, Huyện/Xã/Đường phải) theo layout VNPT mới.
- [x] Tối ưu Tra cứu MST: Chỉ cập nhật Tên tổ chức/Địa chỉ và đồng bộ có mục tiêu (Targeted Sync).
- [x] Gộp chung logic xử lý cho trường Xã và Huyện thành một thực thể duy nhất (`xaHuyen`) để phù hợp với thay đổi trên trang web VNPT.
- [x] Sửa lỗi Tỉnh/Q.Huyện không nhận giá trị khi nhập Địa chỉ Full vào input hoặc qua Data Fill.
- [x] Phủ sóng tính năng Real-time Sync: (1) Widget cập nhật form ngay khi gõ/paste (không chờ blur), (2) Sync Mapping trang web bắt được sự kiện dropdowns thay đổi.
- [x] Điều chỉnh hướng sync value (3 chiều: Tự do ↔, Ghi đè form ⬇, Hút từ form ⬆) thay thế biểu tượng = (drag-handle) bằng nút điều hướng.
- [x] Tối ưu hóa tốc độ điền địa chỉ: Nhóm các trường cùng cấp (Tỉnh/TP) để điền đồng thời, giảm thiểu trễ AJAX lặp lại (Group-by-Rank).
- [x] Tối ưu hóa mượt mà Drag & Drop: Sử dụng requestAnimationFrame để render 60fps và gom nhóm logic lưu tọa độ một lần duy nhất khi thả chuột (mouseup).
- [x] Tối ưu logic bóc tách địa chỉ (giữ nguyên phần đường/số nhà, phân tích Tỉnh/Xã/Huyện ngược từ dưới lên).
- [x] Sửa lỗi tách địa chỉ: Viết lại logic `parseAddressComponents` ưu tiên tìm Tỉnh/Huyện/Xã bằng Regex từ dưới lên, tránh lỗi cắt nhầm chuỗi đường/số nhà.
- [x] Phát hành bản cập nhật v1.6.13 (Tối ưu logic tách địa chỉ đường).
- [x] Phát hành bản cập nhật v1.6.14 (Tối ưu Mapping Fields và Cleanup logic).
- [x] Phát hành bản cập nhật v1.6.15 (Realtime Sync bộ tính thuế Calc on-input).



## 2. Nhật ký Quyết định (Decision Log)

- **2026-04-07 (Glassmorphism UI)**: Thay thế hoàn toàn giao diện cũ sang phong cách mờ đục (blur) với màu Indigo/Slate để tăng tính sang trọng.
- **2026-04-07 (Storage Abstraction)**: Di chuyển toàn bộ logic `localStorage` vào `src/api/storage/` để quản lý tập trung và tránh xung đột dữ liệu.
- **2026-04-09 (Memory System)**: Quyết định dùng file `PROJECT_MEMORY.md` kết hợp `.cursorrules` để AI "nhớ" tốt hơn.
- **2026-04-12 (2-Way Sync - Tên Tổ Chức)**: Triển khai tính năng đồng bộ ngược (Page -> Widget). *Lưu ý: USER đã gỡ bỏ tính năng này thủ công ngay sau đó.*
- **2026-04-12 (Address Title Extraction Fix)**: Sửa lỗi hàm `scanFullAddress` và `getProvinceName` lấy giá trị `.value` (ID) của thẻ SELECT thay vì lấy `.text` (Title), dẫn đến việc địa chỉ "duong" hoặc "tỉnh" chỉ hiện số. Đã gom nhóm logic vào hàm `getElValueText` dùng chung.
- **2026-04-12 (Local History Enhancement)**: Chuyển đổi cơ chế sao lưu từ file JSON sang Local Storage (tối đa 10 bản) cho nút 🗑. Nâng cấp nút ⏪ thành menu quản lý bản ghi (khôi phục/xoá) để tối ưu trải nghiệm người dùng.
- **2026-04-12 (No More Password Prompt)**: Chuyển đổi các trường Password/API Key sang `type="text"` kết hợp CSS `-webkit-text-security: disc` để đánh lừa browser password manager, giải quyết triệt để thông báo "Save password?".
- **2026-04-12 (Advanced Selector Inspector)**: Thay đổi toàn diện công cụ 🔍. Thêm Banner hướng dẫn phía trên, cho phép chọn nhiều trường liên tục (Batch Capture), hỗ trợ phím Esc và cải thiện thuật toán tìm nhãn (label) tự động.
- **2026-04-12 (Validation Sync Fix)**: Tái cấu trúc logic validation trong `fieldsManager.js`, tách thành hàm `refreshRowValidation` dùng chung. Cho phép cập nhật giá trị rỗng từ AI để kích hoạt cảnh báo `field-required-empty` chính xác hơn.
- **2026-04-12 (Address Layout Grouping)**: Cập nhật `getVNPTAddressGroup` để gom Huyện và Xã về cột phải (col-sm-6) cùng với trường Đường, tách biệt với Tỉnh ở cột trái. Cải thiện logic tuần tự để đợi AJAX load Huyện/Xã.
- **2026-04-12 (Real-time Sync Perfection)**: Rút đoạn code duplicate trong `dataFillFeature` xóa bỏ conflict. Bổ sung `change` event listener vào `initSyncEngine` kéo theo khả năng bắt tín hiệu từ các Web-DOM dropdowns (kể cả ng-select2). Tại Widget, gắn debounce sync thẳng vào sự kiện `input` giúp form trên trang luôn cập nhật trực tiếp theo nhịp gõ của user thay vì phải đợi mất focus (blur).
- **2026-04-12 (Sync Direction Control)**: Thay thế chức năng drag-drop (kéo thả sắp xếp field) bằng nút điều chỉnh hướng sync (`↔`, `⬇`, `⬆`). Bổ sung `isFromWebForm` flag vào `addOrUpdateFieldRow` để kiểm soát dữ liệu sync từ Web Form lên Widget không bị ghi đè thuộc tính hướng, đảm bảo lưu trạng thái hướng độc lập cho người dùng.
- **2026-04-13 (Address Sync Optimization)**: Tái cấu trúc `setPageFieldsSequential` để nhóm các trường theo Rank (Tỉnh=1, Huyện/Xã=2). Các trường cùng Rank sẽ được điền đồng thời (không đợi trễ giữa các trường cùng cấp), giúp xử lý nhanh các form có nhiều bộ địa chỉ (đại diện + trụ sở) và giảm thời gian chờ AJAX.
- **2026-04-13 (Drag Performance Optimization)**: Sử dụng `requestAnimationFrame` để xử lý mượt mà việc kéo thả Widget (60fps). Loại bỏ việc ghi Storage liên tục trong sự kiện `mousemove`, chỉ thực hiện lưu tọa độ cuối cùng khi `mouseup`, giúp loại bỏ hoàn toàn hiện tượng "jank" khi kéo.
- **2026-04-13 (UI - Compact Cloud Sync)**: Loại bỏ phần quản lý Workspace/Cơ quan thủ công khỏi giao diện để tinh gọn menu, chuyển sang sử dụng workspace mặc định hoặc cấu hình ngầm.
- **2026-04-13 (UI - Compact Util Menu)**: Tái cấu trúc Menu Công cụ (⚙️) thành dạng icon-compact để tiết kiệm diện tích, gộp các hành động ít dùng và tối ưu hóa layout AI OCR.
- **2026-04-13 (Cleanup - Selector Inspector Removal)**: Loại bỏ hoàn toàn tính năng Selector Inspector (nút 🔍) để tối ưu hóa mã nguồn và giảm tải các thành phần giao diện không cần thiết theo yêu cầu của USER.
- **2026-04-13 (Release v1.6.9)**: Đóng gói và phát hành các cải tiến về hiệu suất UI và logic điền địa chỉ thông minh.



## 3. Lỗi đặc thù & Giải pháp (Technical Gotchas)

- **VNPT Selectors**: Các input trên trang VNPT thường không có ID cố định. Luôn ưu tiên dùng `placeholder` hoặc `label` text.
- **Address Real-time Lag**: Sử dụng cooldown và cache map trong `domHelper.js` để tránh lag khi gõ địa chỉ.
- **Storage get/set Inconsistency**: Luôn stringify khi lưu và try-catch khi đọc để tránh crash khi parse dữ liệu không phải JSON.
- **Browser Password Heuristics**: Browsers như Chrome tự động hiện popup "Save password?" khi thấy `type="password"`. Giải pháp là dùng `type="text"` + `-webkit-text-security: disc` và `autocomplete="new-password"`.
- **SyncDir Override Issue**: Khởi tạo Field Data (khi load lại từ Web Scanner) có thể vô tình đè mất `syncDir` người dùng đã chọn. Đã thay tham số mặc định của `syncDir` về Null để tự động bỏ qua ghi đè cập nhật hướng khi có cờ `isFromWebForm`.

## 4. Trạng thái các tính năng (Status Map)

- **Export DOCX**: Hoạt động ổn định.
*   **AI Scanner**: Hoạt động ổn định (PDF/Ảnh/Mail/Screen).
*   **Local History**: Hoạt động ổn định (Tối đa 10 bản, hỗ trợ CRUD).
- **Cloud Sync**: Hoạt động ổn định (Firebase).
- **Real-time 2-way Form Sync**: Hỗ trợ đầy đủ Custom Direction (1/2 chiều).

---

_Ghi chú: AI phải cập nhật file này sau mỗi task lớn bằng workflow `/update-memory`._
