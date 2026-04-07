---
description: Quy trình báo cáo và sửa lỗi hiệu quả, tối thiểu token đầu vào.
---

# Quy trình xử lý lỗi (Bug Report Workflow)

## Context
Quy trình này áp dụng khi User báo lỗi (Bug) liên quan đến runtime hoặc console error.

## Các bước xử lý của AI (Tự động thực hiện)
1. **Tiếp nhận Error Trace:** Nhận dạng Error Message và File location từ tin nhắn của user. Nếu user chỉ nói "bị lỗi code", AI sẽ hỏi user "Bạn hãy chỉ cung cấp tên file và dòng lỗi (ví dụ: `src/main.js:154`) thay vì dán toàn bộ log."
// turbo
2. **View Context Hẹp:** Khởi tạo `view_file` tới đúng file đó, với `StartLine` = (Dòng lỗi - 15) và `EndLine` = (Dòng lỗi + 15).
3. **Phân tích Nhanh:** Thông báo cho user một dòng ngắn gọn tại sao bị lỗi.
4. **Sửa & Diff:** Dùng `replace_file_content` hoặc `multi_replace_file_content` để sửa trực tiếp và chỉ báo cho user biết đoạn file đã sửa hoàn tất. Không in lại nguyên khối code to ra cửa sổ chat.
