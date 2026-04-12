# VNPT Project Memory

File này lưu trữ các quyết định quan trọng, lỗi đặc thù và trạng thái dự án để AI luôn duy trì được bối cảnh giữa các phiên làm việc.

## 1. Mục tiêu hiện tại (Current Objective)

- [x] Triển khai giao diện Glassmorphism cao cấp.
- [x] Hợp nhất menu cài đặt và sao lưu.
- [x] Hệ thống kiểm tra dữ liệu bắt buộc (Required Fields Validation).
- [x] Cải thiện hệ thống "Trí nhớ dự án" (Đã khôi phục và đồng bộ).
- [x] Kiểm tra tính nhất quán của hệ thống Rules/Workflow với người dùng.
- [x] Triển khai tính năng Phân loại dữ liệu Local (Raw Scan).
- [x] Xây dựng công cụ Selector Inspector (Bắt selector bằng click).
- [x] Tích hợp API tra cứu MST doanh nghiệp (Xinvoice).
- [x] Tự động hóa trường Nơi cấp ĐKDN theo Tỉnh (`SKDT {Tỉnh}`).
- [x] Sửa lỗi VNPT Calculator tự động nhảy về số 0 khi xóa trắng ô nhập liệu.
- [x] Cải tiến Field Linker: Hỗ trợ Smart Mapping (tìm label/wrapper id khi input yếu).
- [x] Tích hợp visual link (🔗) vào phần Mapping Calc trong Banner.
- [x] Tích hợp Quét nội dung Mail (Gmail/Outlook) và Quét Màn hình trực tiếp qua AI Scanner.


- [x] Chế độ Xem trước OCR (Side-by-Side Review).
- [x] Quản lý Profile Side B (Đã gỡ bỏ theo yêu cầu người dùng).
- [x] Hệ thống Validation & Error Highlighting.
- [x] Mở rộng Multi-Source Scan (Ảnh/PDF) & Tối ưu hóa AI Prompt (Snippet).
- [x] Tái cấu trúc UI AI Mode (Hàng đợi File, Glow Animation, Multi-Media).
- [x] Triển khai Cloud Integration Phase 2 (Team Collaboration).
- [x] Thư viện mẫu dùng chung (Shared Cloud Templates).
- [x] Hệ thống Selectors từ Cloud (Remote UI Patches).
- [x] Phân quyền Workspace (Workspace ID).
- [x] Phân nhóm Fields (Đã gỡ bỏ theo yêu cầu người dùng).


## 2. Nhật ký Quyết định (Decision Log)

- **2026-04-07 (Glassmorphism UI)**: Thay thế hoàn toàn giao diện cũ sang phong cách mờ đục (blur) với màu Indigo/Slate để tăng tính sang trọng.
- **2026-04-07 (Storage Abstraction)**: Di chuyển toàn bộ logic `localStorage` vào `src/api/storage/` để quản lý tập trung và tránh xung đột dữ liệu.
- **2026-04-09 (Memory System)**: Quyết định dùng file `PROJECT_MEMORY.md` kết hợp `.cursorrules` để AI "nhớ" tốt hơn.
- **2026-04-09 (Rules & Workflow Alignment)**: Giải thích cơ chế Slash Commands cho người dùng (không có menu tự động) v*Ngày cập nhật: 16:45:00 11/4/2026*

> [!NOTE]
> Để có cái nhìn chi tiết và đầy đủ nhất về toàn bộ logic dự án cho NotebookLM, hãy tham khảo file:
> [.notebooklm/PROJECT_REPORT_2026.04.10.md](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/.notebooklm/PROJECT_REPORT_2026.04.10.md)
dẫn vào `RULES.md`.
- **2026-04-10 (Fix Slash Command Autocomplete)**: Phát hiện và sửa lỗi Extension UI không gọi được autocomplete do file `.gitignore` ẩn thư mục `.agents`. Đã cấu hình lại `.gitignore` và hoàn tác các rule sai lầm trước đó.
- **2026-04-10 (PDF Scan Button Enhancement)**: Bổ sung logic copy link hướng dẫn Gemini (GUIDE) vào clipboard nếu chưa cấu hình API Key khi bấm nút Scan PDF.
- **2026-04-10 (Startup Workflow)**: Triển khai `/start` để tự động hóa việc load bối cảnh dự án (brain_context + PROJECT_MEMORY).
- **2026-04-10 (NotebookLM Integration)**: Cấu hình Notebook dự án tại URL: `https://notebooklm.google.com/notebook/7e1829da-588e-42d2-8a87-afef88b6d3e7`. AI sẽ sử dụng URL này cho các tác vụ cập nhật brain mà không cần hỏi lại.
- **2026-04-10 (DOM Optimization)**: Triển khai `buildFullDOMMap` trong `domHelper.js` để chuyển đổi hiệu suất quét từ O(N*M) sang O(N+M), giúp widget xử lý nhanh ngay cả trên trang phức tạp.
- **2026-04-10 (Selector Inspector)**: Triển khai công cụ soi trường web giúp người dùng tự lấy selector mà không cần mở DevTools.
- **2026-04-10 (MST API Integration)**: Kết hợp tra cứu MST vào bảng fieldsManager để tự động điền thông tin doanh nghiệp.
- **2026-04-10 (UI/UX Refinement)**: Nâng cấp nút 🗑 thành Dual-mode (Clean All/JSON Backup/Delete Row).
- **2026-04-11 (XInvoice API)**: Tích hợp API XInvoice để tra cứu MST chính xác hơn, thay thế cơ chế cũ. Cấu hình headers `client-id` và `api-key`.
- **2026-04-11 (SKDT Automation)**: Triển khai logic tự động cập nhật trường "Nơi cấp ĐKDN" thành "SKDT {Tỉnh}" khi người dùng chọn Tỉnh/Thành phố.
- **2026-04-11 (Premium Upgrade Plan)**: Đề xuất 4 tính năng nâng cao (Grouping, OCR Review, Profiles, Validation) để chuyên nghiệp hóa công cụ.
- **2026-04-11 (Premium Implementation)**: Hoàn thành triển khai toàn bộ 4 tính năng Premium. Cấu trúc lại giao diện sang hệ thống Tab và Modal đối soát AI.
- **2026-04-11 (Grouping Revert)**: Gỡ bỏ tính năng Phân nhóm (Tabs) theo yêu cầu người dùng để quay lại danh sách phẳng.
- **2026-04-11 (PDF Scan UI Enhancement)**: Nâng cấp Modal đối soát PDF để luôn hiển thị đầy đủ các trường thông dụng (REQUIRED_KEYS) với nhãn Tiếng Việt, hỗ trợ nhập liệu thủ công khi AI bỏ sót.
- **2026-04-11 (Multi-Source Scan & Clipboard)**: Mở rộng khả năng quét AI cho cả định dạng Hình ảnh (.jpg, .png) và hỗ trợ thao tác Dán trực tiếp từ Clipboard (Ctrl+V), giúp tối ưu hóa quy trình làm việc từ ảnh chụp màn hình.
- **2026-04-11 (AI Model Upgrade & Prompt Optimization)**: Cập nhật danh sách Model AI chuẩn (Flash 2.0, Flash-Lite) và tối ưu hóa System Prompt để tăng tốc độ xử lý cho tài liệu nhiều trang, đảm bảo cân bằng giữa hiệu suất và độ chính xác.
- **2026-04-11 (AI Scanner UI Restructure)**: Tái cấu trúc lại luồng giao diện AI Mode. Gộp tính năng quét PDF/Ảnh và phân loại văn bản thô (Raw) vào một bảng điều khiển duy nhất. Hỗ trợ hiển thị "Hàng đợi tệp" (Queue) và hiệu ứng quét (Glow Animation) trực quan. Cập nhật Gemini API hỗ trợ truyền mảng file (Multimodal with array base64).
- **2026-04-11 (Calc Sync Fix)**: Sửa lỗi Sync không hoạt động bằng cách bổ sung nút kích hoạt thủ công (🔄), gán sự kiện onclick bị thiếu, và tích hợp tự động gọi buildFullDOMMap trước khi điền dữ liệu.
- **2026-04-11 (Dual-Action Restore)**: Nâng cấp nút Restore Last (⏪) hỗ trợ Click trái (Khôi phục ngay bản gần nhất) và Click phải (Mở menu lịch sử) để tối ưu hóa trải nghiệm người dùng.
- **2026-04-11 (Cloud Migration - Firebase)**: Chuyển đổi toàn bộ hạ tầng Cloud dự kiến từ Supabase sang Firebase theo yêu cầu người dùng. Triển khai Firebase Auth, Firestore Sync cho Profiles và mã hóa API Keys.
- **2026-04-11 (Calc Mapping UI Enhancement)**: Tích hợp hiển thị và chỉnh sửa trực tiếp 4 biến "Mapping Calc" vào khu vực banner khi ở chế độ "Dữ liệu mặc định VNPT", giúp tập trung toàn bộ cấu hình hệ thống vào một chỗ.
- **2026-04-11 (Process Optimization)**: Lược bỏ bước `npm run build` khỏi tất cả các quy trình Markdown (.agents/workflows/) để tối ưu hóa tốc độ phát triển. AI sẽ chỉ build khi thực sự cần thiết hoặc người dùng yêu cầu.
- **2026-04-11 (Shared Template Library)**: Hoàn thành Phase 2 Cloud Integration. Refactor `TemplateManager` hỗ trợ giao diện Tab (Local vs Cloud). Tích hợp logic lọc mẫu theo `workspace_id`.
- **2026-04-11 (Remote Config & Selectors)**: Triển khai `RemoteConfig` module để lấy selectors động từ Firebase, giúp fix lỗi UI trang đích mà không cần cập nhật mã nguồn Extension.
- **2026-04-11 (Date Sync Resolution)**: Sửa lỗi `ngayKy` bị treo khi tự động điền form (do LocalStorage lưu tĩnh timestamp). Đã thiết lập hàm `loadFreshenedDefaultData()` để luôn trộn đè các trường ngày tháng realtime (VD: `ngayKy`, `ngayTiepNhan`) từ `defaults.js` trong runtime lên cache của `SK_DATA_DEF` trong `dataFillFeature.js`.
- **2026-04-11 (Mapping Calc Cleanup)**: Loại bỏ các ô nhập liệu Mapping Calc dư thừa trong dropdown "More Tools" (id="vnpt-btn-more") vì đã được tích hợp tập trung vào giao diện "Dữ liệu mặc định VNPT".
- **2026-04-11 (Mapping Calc UI Refinement)**: Chuyển phần cấu hình Mapping Calc trong Banner sang dạng thu gọn (Collapsible Header), mặc định chỉ hiển thị 1 dòng tiêu đề để tiết kiệm diện tích.
- **2026-04-11 (Field Linker v2)**: Tính năng liên kết trực quan multi-link trên mỗi `vnpt-field-row`. Click 🔗 → widget mờ + banner nổi. Hover xanh dương = sẽ link, xanh lá = đã link, đỏ = sẽ unlink (toggle). Click tích lũy nhiều selectors (fix bug chỉ giữ `currentParts[0]`). Esc/✅ Xong dispatch `change` 1 lần → `syncThisRow()`. CSS: 3 states visual + badge counter + nút Xong trong banner.
- **2026-04-12 (Fix Calc Zero Default)**: Sửa lỗi calculator tự động điền số "0" khi người dùng xóa trắng (backspace hết) ô nhập liệu. Logic mới trong `calcLogic.js` sẽ trả về chuỗi rỗng thay vì "0", đồng thời xóa sạch các trường liên quan (Tiền thuế, Sau thuế, Bằng chữ) để UI sạch sẽ hơn.
- **2026-04-12 (Smart Field Linker)**: Nâng cấp `getBestSelector` để tự động leo lên thẻ cha tìm ID hoặc tìm Label lân cận nếu input không có thuộc tính định danh. Đồng thời cải tiến `findPageInput` để tự động resolve Wrapper ID về Input con bên trong, giúp mapping cực kỳ linh hoạt và ổn định.
- **2026-04-12 (Mapping Calc Linker)**: Tích hợp nút 🔗 vào giao diện cấu hình Mapping Calc trong Banner. Giờ đây người dùng có thể click trực tiếp để liên kết các ô Trước thuế, Sau thuế... với các element trên trang web một cách trực quan, tương tự như các field row thông thường.
- **2026-04-12 (Address Performance Optimization)**: Khắc phục triệt để hiện tượng giật lag khi gõ địa chỉ. Triển khai cơ chế Cooldown (3s) cho `buildFullDOMMap` và tối ưu hóa logic `scanFullAddress` để sử dụng cache thay vì quét lại DOM liên tục. Cải thiện logic ưu tiên chuỗi địa chỉ chi tiết nhất.
- **2026-04-12 (Full Label PDF Preview)**: Nâng cấp `handleExtractionResults` trong `pdfScan/index.js` để hiển thị toàn bộ danh sách trường từ `DEFAULT_LABELS` trong Dialog đối soát. Giúp người dùng dễ dàng kiểm tra và nhập thủ công mọi trường dữ liệu mà không bị giới hạn bởi danh sách `REQUIRED_KEYS`.
- **2026-04-12 (PDF Preview Filtering)**: Bổ sung bộ lọc `EXCLUDED_LABELS` vào bảng đối soát PDF để ẩn các trường mang tính chất mặc định hoặc ít thay đổi (Ngày/Tháng/Năm ký, Số lượng gói, Nơi ký, Liên hệ A).
- **2026-04-12 (Storage Fix - API Key & Raw Text)**: Khắc phục lỗi Raw Text không lưu được (triển khai `SK_RAW_SCAN`). Giữ nguyên sự kiện `onchange` cho API Key để tránh ghi đĩa liên tục.
- **2026-04-12 (Disable Autofill)**: Thêm `autocomplete="off"` vào input API Key để ngăn trình duyệt tự động điền (autofill) các key không mong muốn.
- **2026-04-12 (PDF Preview Filtering - Thorough)**: Nâng cấp bộ lọc EXCLUDED_LABELS và bổ sung EXCLUDED_KEYS để loại bỏ hoàn toàn Ngày/Tháng/Năm ký khỏi bảng đối soát, kể cả khi AI trả về các key này ngoài dự kiến. Loại bỏ `ngayKy` khỏi AI Prompt.
- **2026-04-12 (Storage JSON Bugfix)**: Sửa lỗi `Storage.get()` bị crash khi parse các chuỗi không phải JSON (như API Key). Đồng bộ hóa việc dùng `JSON.stringify` cho cả GM và LocalStorage để đảm bảo tính nhất quán.
- **2026-04-12 (UI Rule Update)**: Cập nhật quy tắc thiết kế UI: Tiêu đề phải ngắn gọn, đúng chức năng; hạn chế icon đi kèm title; cho phép dùng icon độc lập.
- **2026-04-12 (Script Update Notification)**: Triển khai hệ thống thông báo cập nhật kép. 1. Pre-update: Kiểm tra version từ GitHub `version.json`, hiện badge "NEW" nếu có bản mới. 2. Post-update: So sánh APP_VERSION với version chạy gần nhất để hiện Toast chúc mừng cập nhật thành công.
- **2026-04-12 (GitHub Update Automation)**: Thiết lập GitHub Action (`update-version.yml`) tự động đồng bộ hóa `package.json` version và mã commit cuối cùng vào `version.json` mỗi khi push code lên `main`. Giờ đây `package.json` là "Source of Truth" duy nhất cho phiên bản.


## 3. Lỗi đặc thù & Giải pháp (Technical Gotchas)

- **VNPT Selectors**: Các input trên trang VNPT thường không có ID cố định. Luôn ưu tiên dùng `placeholder` hoặc `label` text qua `webScanner.js`.
- **Z-Index Layering**: Widget cần có `z-index: 99999`.
- **MutationObserver Performance**: Chỉ quan sát các node cụ thể để tránh lag trang.
- **File Read Error**: tool `view_file` có thể lỗi "unsupported mime type" với file `.md` trong `graphify-out`. Khắc phục: Dùng lệnh `type` của CMD/PowerShell.
- **Address Real-time Lag**: Việc gọi `buildFullDOMMap` trên mỗi sự kiện `input` gây lag cực nặng. Giải pháp: Sử dụng cooldown và cache map in `domHelper.js`.
- **Storage get/set Inconsistency**: Việc `GM_setValue` lưu raw string trong khi `localStorage` dùng `JSON.stringify` gây lỗi khi `JSON.parse` dữ liệu không phải JSON (như API Key). Giải pháp: Luôn stringify khi lưu và try-catch khi đọc.
- **Calc Sync vs DOM Map**: Tính năng Sync của Calculator phụ thuộc vào FullDOMMap. Nếu Map chưa được build (do chưa Quét dữ liệu), Sync sẽ không tìm thấy các trường trên web. Đã khắc phục bằng cách gọi buildFullDOMMap() bên trong logic Sync.

## 4. Trạng thái các tính năng (Status Map)

- **Export DOCX**: Hoạt động ổn định.
- **Calc Widget**: Hoạt động ổn định, tích hợp sâu vào giao diện nhúng.
- **Sync Engine**: Hoạt động ổn định, hỗ trợ Sync thủ công (🔄) và tự động build DOM map trước khi điền.
- **Cloud Sync**: Hoạt động ổn định (Phòng làm việc Firebase). Hỗ trợ đồng bộ Profiles, API Keys, Thư viện mẫu dùng chung, Config tổng quát và Selectors từ xa.
- **Default Data Mode**: Hoàn thiện giao diện cấu hình tập trung, bao gồm cả biến dữ liệu và Mapping Calc. Đã loại bỏ hoàn toàn các cấu hình dư thừa ở các vị trí khác (như trong menu Công cụ).

---

_Ghi chú: AI phải cập nhật file này sau mỗi task lớn bằng workflow `/update-memory`._
