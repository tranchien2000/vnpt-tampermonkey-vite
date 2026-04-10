---
description: Tổng hợp brain và đẩy lên NotebookLM dự án.
---

# Workflow: Update Project Brain to NotebookLM (/upnote)

Sử dụng workflow này để đồng bộ hóa bối cảnh dự án mới nhất lên NotebookLM.

## Các bước thực hiện

1. **Tổng hợp dữ liệu**:
   - Chạy lệnh: `node scripts/generate_brain.cjs` để làm mới file `.notebooklm/brain_context.md`.

2. **Truy xuất thông tin Notebook**:
   - Đọc `PROJECT_MEMORY.md` để lấy URL của Notebook dự án (đã cấu hình tại mục Decision Log).
   - URL dự kiến: `https://notebooklm.google.com/notebook/7e1829da-588e-42d2-8a87-afef88b6d3e7`.

3. **Đồng bộ lên NotebookLM**:
   - Sử dụng MCP tool `add_file_source` để tải file `.notebooklm/brain_context.md` lên Notebook.
   - Nếu Notebook chưa có trong thư viện MCP, sử dụng `add_notebook` trước.

4. **Xác nhận**:
   - Kiểm tra thông báo thành công và báo cáo lại cho người dùng.
