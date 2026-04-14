# 📜 Quy tắc Dự án VNPT (Master Global Rules)

Tài liệu này định nghĩa tất cả các quy tắc bắt buộc cho mọi AI Agent và con người khi làm việc trên dự án **VNPT Tampermonkey Script**.

> [!IMPORTANT]
> Đây là quy tắc lõi (Single Source of Truth). Mọi luồng tương tác và phát triển phải tuân thủ chuẩn tại đây.

---

## 🚀 1. Core AI Mindset & Communication (Tư duy AI & Giao tiếp)

- **Planning First**: Khi nhận yêu cầu mới, **BẮT BUỘC** phải lập kế hoạch chi tiết dưới dạng artifact (`implementation_plan.md`). **KHÔNG** viết kế hoạch trực tiếp vào trò chuyện. Chờ người dùng gõ "ok", "triển khai" thì mới tiến hành code.
- **Concise Response & No Fluff**: Phản hồi ở mức tối giản (Ultra-Minimalist). Tuyệt đối KHÔNG lời chào rườm rà. Đi thẳng vào kết quả, giải pháp hoặc câu hỏi cần người dùng quyết định.
- **Language Mandate**: Toàn bộ phản hồi, tài liệu, commit message và **code comments** phải dùng **Tiếng Việt**.
- **Trace-First / Error-First**: Cần giải quyết lỗi dựa trên dòng Stack Trace rõ ràng (Line Number). **Không** Dump Code ra cửa sổ chat trừ phi người dùng dặn dò "show code".
- **Micro-tasks (Chia để trị)**: Dùng `task.md` chia nhỏ chức năng thành checklist để triển khai.

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
