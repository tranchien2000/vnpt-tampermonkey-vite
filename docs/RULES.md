# 📜 Quy tắc Dự án VNPT (Global Rules)

> [!IMPORTANT]
> **Cách sử dụng Workflows:** Để kích hoạt các quy trình tự động, bạn cần gõ **đầy đủ** lệnh trực tiếp vào Chat (ví dụ: `/add-feature`, `/update-memory`) và nhấn Enter. 
> **Lưu ý:** Hệ thống KHÔNG có menu gợi ý (autocomplete) tự động cho các lệnh này.

Tài liệu này định nghĩa tất cả các quy tắc bắt buộc cho mọi AI Agent và con người khi làm việc trên dự án **VNPT Tampermonkey Script**.

---

## 🚀 1. Core AI Mindset (Tư duy AI)

- **Planning First**: Khi nhận yêu cầu mới, **PHẢI** lập kế hoạch chi tiết trong `implementation_plan.md` (brain artifact) và chờ người dùng gõ "ok", "trien khai" hoặc "y" mới được code.
- **Memory Optimization**: Sử dụng `.notebooklm/brain_context.md` làm bộ nhớ lõi. Luôn cập nhật `PROJECT_MEMORY.md` sau mỗi task lớn qua workflow `/update-memory`.
- **Language Mandate**: Toàn bộ phản hồi, tài liệu, commit message và **code comments** phải dùng **Tiếng Việt**.
- **Grep-First Mandate**: Nếu file > 100 dòng, PHẢI dùng `grep_search` để tìm đoạn code cần sửa trước khi dùng `view_file`.
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
- **No Placeholders**: Sử dụng `generate_image` thay vì ảnh placeholder.

---

## 🔗 Tài liệu liên quan
- [ARCHITECTURE.md](file:///c:/Users/Chien/vnpt-tampermonkey-vite/docs/VNPT_PROJECT_BRAIN.md)
- [PROJECT_MEMORY.md](file:///c:/Users/Chien/vnpt-tampermonkey-vite/.notebooklm/brain_context.md#L98)
- [Workflow Index](file:///c:/Users/Chien/vnpt-tampermonkey-vite/.agents/workflows/_index.md)
