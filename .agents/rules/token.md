---
version: "1.0"
last_updated: "2026-04-06"
---

# Quy tắc Tối ưu Token (token.md)

## 1. Chiến lược Graphify‑First
- Trước khi thực hiện bất kỳ lệnh tìm kiếm hay đọc file nào, luôn đọc `graphify-out/GRAPH_REPORT.md` (hoặc `graphify-out/wiki/index.md` nếu có) để nắm bắt cấu trúc God Nodes và Communities.
- **Hạn chế Grep**: Chỉ sử dụng `grep` để tìm các từ khóa cụ thể (như Label UI, Placeholder, hoặc ID động) sau khi đã xác định được module mục tiêu thông qua Graphify.
- Tránh grep mù quáng trên toàn bộ thư mục `src/` nếu chưa biết logic thuộc community nào.

## 2. Đọc Giới hạn Ngữ cảnh
- Khi cần xem một hàm hoặc khối logic, chỉ yêu cầu **StartLine** và **EndLine**.
- Ví dụ: `view_file` dòng 120‑150 của `autoFillForm.js`.

## 3. Tránh Dump Toàn file (>400 dòng)
- Nếu file > 400 dòng, chỉ **grep** để tìm section, sau đó **view_file** phần nhỏ.
- Nếu thực sự cần toàn bộ, hãy **đánh dấu** trong `implementation_plan.md` để AI biết đây là yêu cầu đặc biệt.

## 4. Lưu trữ Snippet
- Tạo thư mục `snippets/` ở gốc dự án.
- Mỗi snippet là file `.js` hoặc `.md` với tên mô tả, ví dụ `setPageField.js`.
- Khi muốn chèn, dùng thẻ **!INCLUDE** trong rule file hoặc trong code comment:
```
!INCLUDE snippets/setPageField.js
```
- AI sẽ tự động mở snippet và chèn nội dung khi cần.

## 5. Tái sử dụng Workflow
- Các workflow trong `.agents/workflows/` đã có các bước chuẩn (thêm trường, cập nhật UI, …).
- Khi một tác vụ lặp lại, AI chỉ cần gọi workflow và **turbo** các bước `run_command` an toàn.

## 6. Mẫu Prompt (Prompt Templates)
| Mục đích | Prompt mẫu |
|---|---|
| Thêm JSDoc cho hàm | `Thêm JSDoc cho hàm ${functionName} trong file ${filePath}` |
| Tối ưu import | `Rà soát import trong ${filePath}, loại bỏ import không dùng` |
| Tạo snippet | `Tạo snippet ${snippetName} cho đoạn code sau: ${codeSnippet}` |

## 7. Kiểm tra Token trong CI
- Script `scripts/token-audit.js` sẽ đọc log AI (đường dẫn `.gemini/logs`) và tính tổng token.
- Nếu **> 5000 token** trong một phiên mà không có `@token‑justification` comment, CI sẽ **fail**.

## 8. Nguyên tắc No-Fluff (Tiết kiệm Q&A)
- **Bỏ qua câu chào:** Không bắt đầu câu trả lời bằng "Vâng", "Chắc chắn rồi", "Để tôi giúp bạn". Vào thẳng vấn đề.
- **Không giải thích thừa:** Không tóm tắt hoặc nhắc lại những gì user vừa nói.
- **Snippet/Diff Only:** Khi cập nhật code, ưu tiên chỉ output file name và snippet phần thay đổi, KHÔNG in lại cả file lớn trên đoạn chat.

---
