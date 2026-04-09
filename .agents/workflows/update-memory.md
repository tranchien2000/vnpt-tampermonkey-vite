---
description: Quy trình tóm tắt và cập nhật "Bộ nhớ dự án" sau mỗi task lớn.
---

# /update-memory

Workflow này được sử dụng khi AI hoàn thành một tính năng mới, sửa một bug phức tạp, hoặc thay đổi kiến trúc hệ thống.

## Các bước thực hiện

1. **Phân tích kết quả**: Xác định những gì đã thay đổi (Code, UI, Logic).
2. **Cập nhật Status**: Sửa trạng thái trong mục `Current Objective` của [PROJECT_MEMORY.md](file:///c:/Users/Chien/vnpt-tampermonkey-vite/PROJECT_MEMORY.md).
3. **Ghi nhật ký quyết định**: Thêm một dòng mới vào `Decision Log` với định dạng: `YYYY-MM-DD (Tên tính năng): [Mô tả ngắn gọn lý do và kết quả]`.
4. **Ghi lại "Gotchas"**: Nếu trong quá trình làm có gặp lỗi khó hiểu hoặc phải tìm giải pháp đặc biệt, hãy ghi vào mục `Technical Gotchas`.
5. **Dọn dẹp Task**: Đảm bảo [task.md](file:///C:/Users/Chien/.gemini/antigravity/brain/8bc212f9-41fc-446c-8f50-02b7b74f5b9c/task.md) được đánh dấu hoàn thành.
6. **Làm mới bộ não NotebookLM**: Chạy lệnh `node scripts/generate_brain.cjs` để làm mới file tổng hợp tại `.notebooklm/brain_context.md`.

## Lưu ý cho AI
- Không cần ghi chép những thay đổi nhỏ (fix typo, đổi màu nút).
- Chỉ tập trung vào những thông tin mà phiên AI kế tiếp cần biết để không làm sai.
