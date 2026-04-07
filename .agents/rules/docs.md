---
trigger: always_on
---

# Tài liệu Dự án (docs.md)

## 1. Tổng quan Kiến trúc

- **ARCHITECTURE.md** luôn được cập nhật, bao gồm mô tả mô-đun và luồng dữ liệu.
- Thêm sơ đồ Mermaid để nhanh nhìn thấy mối quan hệ:

```mermaid
graph TD;
  Core[Core (constants, state, defaults)] --> UI[UI (widget, styles)];
  UI --> Features[Features];
  Features --> Utils[Utils];
  Features -->|điền dữ liệu| DataFill[dataFill];
  Features -->|tạo file| DocExport[docExport];
```

## 2. Cheat‑Sheet Tính năng

| Tính năng    | Core File      | UI File     | Feature File      | Hàm chính        |
| ------------ | -------------- | ----------- | ----------------- | ---------------- |
| Quét dữ liệu | `constants.js` | `widget.js` | `webScanner.js`   | `initWebScanner` |
| Điền dữ liệu | `defaults.js`  | `styles.js` | `autoFillForm.js` | `autoFillFields` |
| Xuất DOCX    | `constants.js` | `widget.js` | `docExport.js`    | `exportDoc`      |
| Tính thuế    | `calcLogic.js` | `calcUI.js` | `calcFeature.js`  | `calculateTax`   |

## 3. Comment Nội bộ

- Chỉ để lại comment **giải thích logic quan trọng**; các chi tiết triển khai chuyển sang cheat‑sheet.
- Sử dụng comment dạng `/** */` cho các khối lớn, và `//` cho ghi chú ngắn.

## 4. Định dạng Markdown

- Đầu mỗi file quy tắc có **front‑matter** (version, last_updated).
- Các bảng, danh sách, và diagram luôn dùng **GitHub Flavored Markdown** để hiển thị tốt trong IDE.

## 5. Plan

- Dùng toàn bộ bằng tiếng việt
- Mỗi khi đưa ra yêu cầu bất kì thì luôn lên plan việc cần làm trước, khi nào có xác nhận từ phía tôi mới tiến hành code, ví dụ khi tôi type "ok", "code" thì mới bắt đầu code

---
