---
description: Ủy thác nhiệm vụ (Delegate) cho Pi.dev CLI Agent
---

# Delegate to Pi Agent

Sử dụng workflow này khi bạn muốn Antigravity đóng vai trò là "Kiến trúc sư/Người giám sát" và ủy thác các tác vụ lập trình độc lập, lặp đi lặp lại hoặc nằm ở mức file đơn lẻ cho **Pi.dev** (một sub-agent).

## Quy trình đối với Antigravity:
Khi người dùng gõ lệnh `/pi [Nhiệm vụ]`, Antigravity HÃY:

1. Phân tích `[Nhiệm vụ]` của người dùng.
2. Dùng công cụ `run_command` để gọi Pi.dev chạy ở chế độ Print/JSON (chế độ không cần tương tác) với cú pháp:
   ```bash
   // turbo
   npx pi -p "[Nhiệm vụ]"
   ```
3. Đợi lệnh chạy xong thông qua công cụ check status.
4. Thu thập toàn bộ nội dung mà `pi` in ra màn hình hoặc báo cáo, sau đó kiểm tra các file mà `pi` đã thay đổi.
5. Báo cáo lại kết quả cho người dùng một cách tóm tắt, kiểm duyệt lại mã nguồn (Code Review) xem Pi tạo ra có đúng tiêu chuẩn hệ thống không.
