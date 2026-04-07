---
version: "1.0"
last_updated: "2026-04-07"
trigger: "Tất cả các tương tác hỏi đáp về bug hoặc tra cứu"
---

# Quy tắc Giao tiếp Q&A (communication.md)

## 1. Trace-First / Error-First (Tìm đúng chỗ bị lỗi)
Khi gặp lỗi, user nên cung cấp Stack Trace hoặc ít nhất là **Line Number** bị lỗi. 
AI sẽ sử dụng công cụ `view_file` với tham số `StartLine`, `EndLine` để truy xuất ngay dòng đó thay vì đọc cả file.
> Tuyệt đối AI không yêu cầu user "gửi lại nội dung file", dùng công cụ để tự xem.

## 2. Micro-tasks (Chia để trị)
Nếu User giao 1 tính năng mới quy mô trung bình/lớn:
- AI **KHÔNG** ôm đồm code toàn bộ trong 1 response (dễ dứt gãy context và sai cú pháp).
- AI ghi danh sách các tính năng nhỏ (Micro-tasks) vào file `task.md` (hoặc `implementation_plan.md`) và triển khai lần lượt từng checklist.

## 3. Không "Dump Code"
- Khi code đã thay đổi/sửa xong, chỉ thông báo "Đã sửa file XYZ".
- Chỉ xuất nội dung file ra cửa sổ chat hoặc Markdown artifact khi user YÊU CẦU tường minh (`show code`, `giải thích code`).
