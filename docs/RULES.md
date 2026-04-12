# 📜 Quy tắc Dự án VNPT (Global Rules)

Tài liệu này định nghĩa tất cả các quy tắc bắt buộc cho mọi AI Agent và con người khi làm việc trên dự án **VNPT Tampermonkey Script**.

---

## 🚀 1. Core AI Mindset (Tư duy AI)

- **Planning First**: Khi nhận yêu cầu mới, **PHẢI** lập kế hoạch chi tiết, tạo thành file `implementation_plan.md` (brain artifact) bằng Tiếng Việt và chờ người dùng gõ "ok", "trien khai" hoặc "y" mới được code.
- **Memory Optimization**: Sử dụng `.notebooklm/brain_context.md` làm bộ nhớ lõi. Luôn cập nhật `PROJECT_MEMORY.md` sau mỗi task lớn qua workflow `/update-memory`.
- **Language Mandate**: Toàn bộ phản hồi, tài liệu, commit message và **code comments** phải dùng **Tiếng Việt**.
- **Graphify Mandate**: Trước khi trả lời về kiến trúc hoặc cấu trúc codebase, PHẢI đọc `graphify-out/GRAPH_REPORT.md`. Luôn chạy lệnh rebuild graph: `python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"` sau khi sửa code.
- **Concise Response**: Phản hồi ngắn gọn, tập trung vào logic, không chào hỏi rườm rà.

---

## 🛠️ 2. Development Process (Quy trình Phát triển)

- **Workflow First**: Kiểm tra thư mục `.agents/workflows/` trước khi thực hiện các tác vụ lặp lại (thêm field, feature, sửa UI).
- **Commit Message Standard**: Định dạng: `[loại]: [mô tả ngắn bằng tiếng Việt]`.
  - Loại: `feat`, `fix`, `refactor`, `docs`, `style`.
- **Exclusion List**: Tuyệt đối KHÔNG đọc: `dist/`, `node_modules/`, `.git/`, `package-lock.json`, `original_script.js`, `source.js`.

---

## 📐 3. Technical Standards (Tiêu chuẩn Kỹ thuật)

- **Error Handling**: 
  - Mọi hàm `async` và thao tác DOM/API phải bọc trong `try-catch`.
  - Sử dụng `logger.js` từ `src/utils/logger.js`.
- **JSDoc Style**: Mọi hàm export mới phải có JSDoc mô tả tham số và giá trị trả về.
- **State Management**: Luôn sử dụng singleton `AppState` từ `src/core/state.js`. Không dùng biến toàn cục rải rác.
- **Storage Abstraction**: Mọi tương tác `localStorage` quy về `src/api/storage/`.
- **Tool Optimization**: Ưu tiên dùng `multi_replace_file_content` cho các thay đổi không liên tục.

---

## 🎨 4. Design System (Aesthetics)

- **Theme**: Dark Mode + Glassmorphism (blur: 10px, semi-transparent borders).
- **Colors**: HSL curated palettes (Indigo `#6366f1` primary, Slate background).
- **Typography**: `Outfit`, `Inter`, hoặc `Roboto` (Google Fonts).
- **Micro-animations**: Hover hiệu ứng, smooth transitions, loading states.
- **UI Title & Icons**: Tiêu đề (title) UI mới phải hiển thị đúng chức năng, ngắn gọn. Hạn chế sử dụng icon đi kèm tiêu đề. Chấp nhận việc chỉ hiển thị icon mà không có tiêu đề.
- **No Placeholders**: Sử dụng `generate_image` thay vì ảnh placeholder.

---

## 🔗 Tài liệu liên quan
- [ARCHITECTURE.md](file:///c:/Users/Chien/vnpt-tampermonkey-vite/docs/VNPT_PROJECT_BRAIN.md)
- [PROJECT_MEMORY.md](file:///c:/Users/Chien/vnpt-tampermonkey-vite/.notebooklm/brain_context.md#L98)
- [Workflow Index](file:///c:/Users/Chien/vnpt-tampermonkey-vite/.agents/workflows/_index.md)
