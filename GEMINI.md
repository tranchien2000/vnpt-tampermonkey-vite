## GitLab Knowledge Graph (GKG)

This project uses GitLab Knowledge Graph for code intelligence.

Rules:
- Use GKG to understand cross-file dependencies and core abstractions.
- Sau khi có thay đổi lớn về kiến trúc hoặc file (major changes), hãy chạy `gkg server stop; gkg index; gkg server start` để cập nhật đồ thị.
