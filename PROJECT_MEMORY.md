# VNPT Project Memory

File này lưu trữ các quyết định quan trọng, lỗi đặc thù và trạng thái dự án để AI luôn duy trì được bối cảnh giữa các phiên làm việc.

## 1. Mục tiêu hiện tại (Current Objective)

- [x] Thêm tính năng Ghim (Pin) giao diện Widget, chỉ hiện Header và Calculator, mở rộng khi di chuột (Hover trễ thu gọn).
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
- [x] Phát hành bản cập nhật v1.6.16 (Nâng cấp visual Sync Direction, tối ưu GKG & Token Efficiency).
- [x] Nâng cấp visual cho nút Hướng đồng bộ (.btn-sync-dir): Sử dụng icon SVG premium, màu sắc theo trạng thái và hiệu ứng animation mượt mà.
- [x] Tích hợp chuẩn hóa ngày tháng thông minh (`normalizeDate`) hỗ trợ `DDMMYYYY` và tự động định dạng `dd/mm/yyyy` khi gõ hoặc quét.
- [x] Bổ sung validation và formatting cho CMND/CCCD (9 hoặc 12 số).
- [x] Tự động chuẩn hóa các trường "Ngày" (`ngaySinhCustomer`, `ngayCapCustomer`, `ngayCapSoDkdnCustomer`...) ngay khi thay đổi giá trị trong widget.
- [x] Bổ sung console log chi tiết cho quy trình bóc tách và nhập liệu trường `duong` (Địa chỉ đường) để hỗ trợ gỡ lỗi.
- [x] Điều chỉnh thu hẹp độ rộng cột Nhãn (Label) trong danh sách trường (0.35 -> 0.2) để tối ưu không gian cho ô nhập liệu.
- [x] Phát hành bản cập nhật v1.6.22 (Refactor UI Styles).
- [x] Phát hành bản cập nhật v1.6.23 (Tối ưu Modular Styles & Fix Bug).
- [x] Cấu hình ổn định bản Build: Tắt minification và bật keepNames để tránh lỗi logic mangling trong production.
- [x] Triển khai logic "Học máy" (Address Learning) cho trường Đường (Street): Tự động ghi nhớ và áp dụng các chỉnh sửa của người dùng.
- [x] Phát hành bản cập nhật v1.6.20 (Triển khai Address Learning và Tối ưu Build).
- [x] Tích hợp bộ đọc mã QR CCCD nội bộ siêu tốc, cắt ghép AI OCR pipeline.
- [x] Xây dựng bộ sinh Mock Data hỗ trợ kiểm thử form VNPT.
- [x] Xây dựng cơ chế Local Token/Usage Tracker đo đếm ngầm và thống kê API Gemini (trực tiếp tại Client).

## 2. Nhật ký Quyết định (Decision Log)

- **2026-04-15 (UI - Pinned Mode)**: Thêm tính năng Ghim thu gọn UI. Khi kích hoạt chế độ ghim, `.vnpt-pinned` được thiết lập trên Panel. Thông qua CSS hover thuần túy, nội dung bên trong (`vnpt-panel-body`) sẽ tự động ẩn và trả lại không gian cho trang web, giảm che khuất form nhập liệu, và mở bung khi di chuột qua.
- **2026-04-15 (Style Refactoring)**: Tách file `styles.js` nguyên khối (~1000 dòng) thành 7 module nhỏ trong thư mục `src/ui/styles/`. Cố định cấu trúc CSS thành các phần: Theme, Panel, Fields, Controls, Calculator, Scanner, Linker. Sử dụng `index.js` làm đầu mối gộp (Aggregator) để duy trì khả năng tương thích ngược cho hàm `injectStyles`. Việc này giúp giảm Cognitive Load khi analyze UI code.
- **2026-04-15 (Fields Manager Modularization)**: Tách file `fieldsManager.js` (~1100 dòng) thành 7 module chuyên biệt trong `src/features/fields/`: Linker, Validation, Row, Store, Sync, Mode, UI. Sử dụng `fieldsManager.js` làm aggregator re-export. Chuyển các hằng số liên quan đến tỉ lệ cột (`SK_COL_RATIO`, `COL_RATIO_MIN/MAX`) vào `src/core/constants.js` để quản lý tập trung. Cải thiện đáng kể khả năng bảo trì cho logic lõi của Widget.
- **2026-04-15 (Bug Fixes)**: Sửa lỗi hiển thị chuỗi literal trong bảng Fields do dư dấu backslash khi escape template strings. Sửa lỗi flexbox tại `bottom-export-row` gây ép dẹp ô nhập tên file.
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
- **2026-04-13 (UI - Premium Sync Direction Buttons)**: Thay thế icon text (`↔`, `⬇`, `⬆`) bằng SVG stroke-thick 3.5. Bổ sung hiệu ứng hover scale 1.25, xoay 180 độ khi click và phân loại màu theme rõ rệt: Blue (Both), Green (Down), Orange (Up). Đồng bộ hóa visual này cho cả main widget và Calc widget (.btn-sync-dir-calc).
- **2026-04-13 (Smart Date Normalization)**: Nâng cấp hàm `normalizeDate` để hỗ trợ đa dạng định dạng (viết liền 8 số, ISO, dấu chấm, dấu gạch ngang...). Tự động kích hoạt chuẩn hóa cho các trường có key chứa chữ "ngay" khi user thay đổi giá trị (`change` event) trong widget, đảm bảo dữ liệu luôn ở dạng `dd/mm/yyyy`.
- **2026-04-13 (ID Card Validation)**: Bổ sung regex kiểm tra CMND/CCCD (9 hoặc 12 chữ số) vào hệ thống validation để cảnh báo người dùng khi nhập sai định dạng.
- **2026-04-14 (Smart Address Parsing)**: Nâng cấp hàm `parseAddressComponents` sử dụng thuật toán Reverse Scan. Tối ưu theo yêu cầu người dùng: lấy phần đứng trước dấu phẩy thứ 2 từ phải sang để xác định phần Đường (Street), đảm bảo loại bỏ chính xác các cấp hành chính ở cuối.
- **2026-04-14 (UI - Fields List Label Width)**: Điều chỉnh flex value của `.f-label` và `.h-label` từ `0.35` xuống `0.2`. Thay đổi này giúp thu hẹp cột nhãn, dành nhiều diện tích hiển thị hơn cho các ô nhập liệu giá trị, đặc biệt hữu ích trên các màn hình nhỏ hoặc khi có nhiều trường dữ liệu dài.
- **2026-04-14 (Build Optimization - No Minify)**: Quyết định tắt hoàn toàn `minify` trong `vite.config.js` và bật `keepNames: true`. Lý do: Một số logic của Userscript (như Field Linker hoặc Dynamic Sync) phụ thuộc vào tên hàm và cấu trúc code nguyên bản; việc nén mã của esbuild gây ra sự không ổn định giữa môi trường Dev và Production.
- **2026-04-14 (Address Learning Logic)**: Triển khai tính năng "Học máy" cho trường Đường (Street). Script sẽ lưu trữ cặp `Địa chỉ gốc` -> `Đường đã sửa` vào `SK_ADDRESS_LEARNING`. Khi gặp lại địa chỉ gốc này, script sẽ ưu tiên dùng giá trị đã học thay vì regex mặc định, giúp giảm thiểu việc chỉnh sửa lặp lại cho các địa chỉ phức tạp.
- **2026-04-15 (Mock Data & CCCD QR Scanner)**: Thêm nút bấm 🎲 Sinh Mock tạo dữ liệu giả rác hợp lệ cho form. Tích hợp `jsqr` chạy Auto-Detect vào luồng nạp ảnh để đọc mã QR CCCD 100% local, bypass được Gemini AI -> Không tốn 1 đồng token, và có độ chính xác 100% cực nhanh.
- **2026-04-15 (Local Token Tracker)**: Tại thời điểm này Google không hỗ trợ API truy xuất Quota giới hạn. Quyết định viết bộ tính điểm (Tracker) chạy ở client: Chặn thông số `usageMetadata.totalTokenCount` ngay khi có Response JSON, lưu vào Storage (chìa khoá `VNPT_TOKEN_USAGE`) và Reset tự động khi sang ngày mới. Hiển thị qua Panel AI OCR.
- **2026-04-15 (Release v1.6.25)**: Phát hành bản cập nhật tích hợp CCCD QR Scanner và Mock Data Generator.

## 3. Lỗi đặc thù & Giải pháp (Technical Gotchas)

- **VNPT Selectors**: Các input trên trang VNPT thường không có ID cố định. Luôn ưu tiên dùng `placeholder` hoặc `label` text.
- **Address Real-time Lag**: Sử dụng cooldown và cache map trong `domHelper.js` để tránh lag khi gõ địa chỉ.
- **Storage get/set Inconsistency**: Luôn stringify khi lưu và try-catch khi đọc để tránh crash khi parse dữ liệu không phải JSON.
- **Browser Password Heuristics**: Browsers như Chrome tự động hiện popup "Save password?" khi thấy `type="password"`. Giải pháp là dùng `type="text"` + `-webkit-text-security: disc` và `autocomplete="new-password"`.
- **SyncDir Override Issue**: Khởi tạo Field Data (khi load lại từ Web Scanner) có thể vô tình đè mất `syncDir` người dùng đã chọn. Đã thay tham số mặc định của `syncDir` về Null để tự động bỏ qua ghi đè cập nhật hướng khi có cờ `isFromWebForm`.
- **Build vs Dev Discrepancy**: Bản build nén (minify) có thể làm hỏng các logic phụ thuộc vào `function.name` hoặc timing của `@run-at`. Giải pháp là tắt `minify` và kiểm soát chặt chẽ `init` timing trong `main.js`.
- **Address Learning Context**: Việc "học" địa chỉ phụ thuộc vào việc truyền `sourceContext` (địa chỉ đầy đủ) qua `addOrUpdateFieldRow`. Nếu context này bị mất (ví dụ do quét từng phần rời rạc), logic học sẽ không được kích hoạt. Luôn ưu tiên quét Full Address hoặc cung cấp info.address từ MST lookup.

## 4. Trạng thái các tính năng (Status Map)

- **Export DOCX**: Hoạt động ổn định.
*   **AI Scanner**: Hoạt động ổn định (PDF/Ảnh/Mail/Screen).
*   **Local History**: Hoạt động ổn định (Tối đa 10 bản, hỗ trợ CRUD).
- **Cloud Sync**: Hoạt động ổn định (Firebase).
- **Real-time 2-way Form Sync**: Hỗ trợ đầy đủ Custom Direction (1/2 chiều).

---

_Ghi chú: AI phải cập nhật bộ não bằng cách chạy lệnh `node scripts/generate_brain.cjs` sau mỗi thay đổi cấu trúc lớn. Quy tắc này đảm bảo các file `brain_*.md` trong thư mục `.notebooklm/` luôn phản ánh trạng thái mới nhất của dự án._
