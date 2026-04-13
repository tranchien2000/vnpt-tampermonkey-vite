# 📜 Quy tắc Dự án VNPT (Global Rules)

Tài liệu này định nghĩa tất cả các quy tắc bắt buộc cho mọi AI Agent và con người khi làm việc trên dự án **VNPT Tampermonkey Script**.

---

## 🚀 1. Core AI Mindset (Tư duy AI)

- **Planning First**: Khi nhận yêu cầu mới, **BẮT BUỘC** phải lập kế hoạch chi tiết dưới dạng artifact (tạo file `implementation_plan.md`). **KHÔNG** viết kế hoạch trực tiếp vào tin nhắn trả lời. Chờ người dùng gõ "ok", "trien khai" hoặc "y" mới được tiến hành code.
- **Concise Response**: Phản hồi ở mức tối giản (Ultra-Minimalist). Tuyệt đối **KHÔNG** lời chào (Xin chào, Chào bạn...), **KHÔNG** từ ngữ khách sáo (Dạ, Vâng, Tôi hiểu, Rất sẵn lòng/vui lòng...). Đi thẳng vào kết quả, giải pháp hoặc câu hỏi cần USER quyết định. Sử dụng danh sách (bullet points) thay cho đoạn văn dài. Chỉ giải thích logic nếu thực sự phức tạp hoặc được yêu cầu.
- **Memory Optimization**: Sử dụng `.notebooklm/brain_context.md` làm bộ nhớ lõi. Luôn cập nhật `PROJECT_MEMORY.md` sau mỗi task lớn qua workflow `/update-memory`.
- **Language Mandate**: Toàn bộ phản hồi, tài liệu, commit message và **code comments** phải dùng **Tiếng Việt**.
- **GKG Mandate**: Chỉ bắt buộc chạy lệnh cập nhật đồ thị (`gkg server stop; gkg index; gkg server start`) khi có thay đổi lớn về kiến trúc, cấu trúc thư mục hoặc logic đa file quan trọng. Đối với các thay đổi nhỏ (UI, fix typo, logic đơn lẻ), không bắt buộc chạy để tiết kiệm thời gian.
- **Token Efficiency**: Hạn chế sử dụng lệnh `view_file` lặp lại trên các file đã được đọc và phân tích trong cùng một phiên làm việc (session). Hãy tận dụng trí nhớ ngắn hạn và kết quả từ các bước trước đó hoặc dùng GKG để tra cứu nhanh thông tin thay vì load lại toàn bộ nội dung file, giúp tiết kiệm context, giảm thời gian phản hồi và tối ưu token.

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
