# 📜 Quy tắc Dự án VNPT (Master Global Rules)

Tài liệu này định nghĩa tất cả các quy tắc bắt buộc cho mọi AI Agent và con người khi làm việc trên dự án **VNPT Tampermonkey Script**.

> [!IMPORTANT]
> Đây là quy tắc lõi (Single Source of Truth). Mọi luồng tương tác và phát triển phải tuân thủ chuẩn tại đây.

---

## ⚡ 0. High-Efficiency Execution Rules (Tối ưu Hiệu suất Thực thi)

> [!IMPORTANT]
> **Mục tiêu:** Tối thiểu hóa việc sử dụng token, tối đa hóa tốc độ và tính nhất quán.
> Output duy nhất ở cuối cuối cùng phải tập trung vào **Final code**.

- **Kế hoạch & Phân tích (Plan First)**: Luôn phân tích toàn bộ yêu cầu và chốt một kế hoạch hoàn chỉnh trước khi bắt đầu chỉnh sửa code. Không phân tích lại từ đầu sau mỗi phần (no re-analyze after partial edits). Giới hạn quá trình suy luận (reasoning) trong một giai đoạn duy nhất.
- **Thực thi chớp nhoáng (Execute Batch)**: Toàn bộ thay đổi phải được gộp thành một khối (batch) trong một thao tác duy nhất. Cấm tuyệt đối các chu kỳ think-edit xen kẽ ngắn lẻ tẻ (no iterative edits). Sửa nhiều file cùng một lúc (parallel operations) khi có thể.
- **Tiêu chuẩn chỉnh sửa (Editing Standard)**: Ưu tiên can thiệp mỏng nhất có thể (minimal diffs). Hạn chế tối đa việc viết lại (rewrite) toàn bộ cấu trúc file nếu không cần thiết.
- **Quy tắc phanh khẩn cấp (Stopping Condition)**:
  - **Max iteration**: 2
  - **Max file edit cycles**: 1
  - **Dừng ngay lập tức** sau khi đã xả xong các chỉnh sửa theo kế hoạch. Tuyệt đối không tự động quay vòng (loop) hay tự thử lại (retry automatically). Nếu phát hiện vượt qua 2 chu kỳ → Ngưng tool ngay lập tức và in báo cáo.

---

## 🚀 1. Core AI Mindset & Communication (Tư duy AI & Giao tiếp)

- **One-Shot Execution (Batching)**: Áp dụng mô hình `Plan (1 lần) -> Execute tập trung (1 lần) -> Done`. Gộp tất cả các thao tác sửa file vào cùng **một lượt gọi tool (parallel tool calls)**. Chống tuyệt đối vòng lặp vô tận kiểu "Thought -> Edit -> Thought -> Edit".
- **Fast-Track Workflow**:
  - Đới với _Yêu cầu nhỏ/Sửa UI/Bug_: Bỏ qua lập `implementation_plan.md`, KHÔNG tạo `task.md`, KHÔNG tạo `walkthrough.md`. Execute thẳng vào file và báo cáo bằng đúng 1 câu.
  - Đối với _Chức năng lớn_: Lập `implementation_plan.md` -> Đợi "OK" -> Execute tất cả thay đổi trong 1 batch.
- **Concise Response & No Fluff**: Phản hồi ở mức tối giản (Ultra-Minimalist). Trả lời báo cáo kết quả cực ngắn (1-2 câu). Tuyệt đối KHÔNG chào hỏi rườm rà, KHÔNG lặp lại phân tích tư duy.
- **Language Mandate**: Toàn bộ phản hồi, tài liệu, và **code comments** phải dùng **Tiếng Việt**.
- **Trace-First / Error-First**: Giải quyết lỗi dựa trên Line Number. Không Dump Code ra cửa sổ chat.

---

## 🛠️ 2. Lập Trình Cơ Bản (Coding Standard)

- **Nhập khẩu (Imports)**: Dùng import cụ thể `import { foo } from 'module.js'`, tránh dùng `import *`.
- **Hàm (Functions)**: Single-Responsibility, ưu tiên pure funtions, mỗi hàm khuyến cáo tối đa **30 dòng**.
- **JSDoc**: Các export function lớn cần JSDoc (`/** @param ... */`).
- **Quy tắc đặt tên**:
  - Biến/hàm: `camelCase`.
  - Hằng số: `UPPER_SNAKE`.
  - ID DOM: Prefix `vnpt-` (ví dụ: `vnpt-btn-submit`).
- **Comment Phân Đoạn**: Khi file lớn, ghi `/* Section: Tên Phần */` trên đầu khu vực để AI dễ dàng Grep_Search.
- **Error Handling**: Mọi thao tác DOM và API ảo dễ gãy phải bọc `try-catch` và dùng logging tại `src/utils/logger.js`.
- **Lint**: Tôn trọng cấu hình ESlint và Hook Pre-commit.

---

## 🦍 3. Chuyên sâu Tampermonkey (Tampermonkey Specs)

- **Module Hóa**: Không viết toàn bộ logic vào file duy nhất. Biên dịch qua Vite/Rollup.
- **Quyền hạn `@grant` (Least Privilege)**: Cấp phát quyền thật mỏng và vừa đủ cho ứng dụng. Khai báo rõ `@connect` đối với API. Không nhúng thư viện lớn mà dùng định dạng CDN `@require`.
- **Shadow DOM**: Xóa bỏ xung đột bằng cách giới hạn widget trong Shadow DOM. Không dùng ID thông tục bừa bãi.
- **Đợi Web Load Dữ Liệu**: Gỡ dần `window.onload`. Bắt logic với các hàm WaitForElement hoặc xử lý quan sát qua `MutationObserver` kết hợp cơ chế `Debounce / Throttle` cẩn trọng.
- **Giao Tiếp Cross-Domain**: Sử dụng `GM_xmlhttpRequest` để bypass CORS khi gọi backend riêng biệt.
- **Xử lý File/Mảng Nặng**: Ưu tiên Blob Object kết hợp `URL.createObjectURL(blob)`, và bắt buộc gọi **`URL.revokeObjectURL()`** để chống Memory Leak khi xuất file PDF/WORD.
- **Trạng thái cấu hình**: Không dùng `GM_setValue` cục bộ, dùng màng bọc `Storage` (trong src/api/storage) để có caching. Dùng Singleton `AppState` (trong src/core/state.js).

---

## 🎨 4. Design System (Aesthetics)

- **Theme**: Ưu tiên Dark Mode + Glassmorphism.
- **Colors**: Bảng màu HSL tinh tế (VD Indigo primary, Slate background).
- **Typography**: Font hiện đại `Outfit`, `Inter` hoặc `Roboto`.
- **Micro-animations**: Cần Hover transition, hiệu ứng tải mượt mà.
- **No Placeholders**: Hãy tạo UI thực và dùng placeholder sinh động (hoặc tool gen image).
- **UI Title**: Tiêu đề ngắn gọn, gắn icon là đủ nếu chức năng ai cũng hiểu.

---

## ⛽ 5. Tối Ưu Token AI & Graphify

- **Graphify-First / GKG Mandate**: Đọc thẳng `graphify-out/GRAPH_REPORT.md` (hoặc `wiki/index.md`) thay vì grep toàn codebase để tránh ngập lụt context. Chỉ chạy lệnh GKG update (`gkg server stop; gkg index...`) nếu mới đổi mới mạnh logic thư mục.
- **Đọc Giới Hạn**: Chỉ dùng lệnh `view_file` StartLine - EndLine cho những vùng nghi ngờ nhất định, không load full file.
- **Sử Dụng Workflow**: AI truy cập `.agents/workflows/_index.md` để dùng sẵn lệnh trước khi rẽ việc mới.
- **Tận dụng Trí Nhớ Sưu Tầm (`PROJECT_MEMORY.md`)**: Khi Task lớn xong xuôi, hãy cập nhật báo cáo và chèn vào PROJECT_MEMORY theo quy trình `/update-memory`.
