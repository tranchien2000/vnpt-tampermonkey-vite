---
version: "1.0"
last_updated: "2026-04-06"
---

# Tiêu chuẩn Lập trình (coding.md)

## 1. Nhập khẩu (Imports)
- **Import có tên**: Sử dụng cú pháp `import { foo, bar } from './module.js'`.
- **Tránh import toàn bộ**: Không dùng `import * as utils from './utils.js'` vì làm tăng kích thước bundle và gây khó khăn khi grep.
- **Sắp xếp**: Nhóm import theo thứ tự: Thư viện bên ngoài → Core → Utils → Features → UI.

## 2. Hàm và Độ dài
- **Single‑Responsibility**: Mỗi hàm thực hiện một nhiệm vụ duy nhất, độ dài tối đa **30 dòng**.
- **Pure Functions**: Khi có thể, viết hàm thuần (không phụ thuộc vào trạng thái bên ngoài) để dễ test và giảm token khi mô tả.
- **Arrow Functions**: Ưu tiên arrow functions cho các hàm ngắn gọn.

## 3. JSDoc
- Mỗi hàm xuất khẩu phải có block JSDoc:
```js
/**
 * Mô tả ngắn gọn (tối đa 2 câu).
 * @param {type} name - Mô tả tham số.
 * @returns {type} - Mô tả giá trị trả về.
 */
export function foo(name) { ... }
```
- Đối với hàm nội bộ, chỉ cần comment ngắn gọn nếu không rõ ràng.

## 4. Comment Phân đoạn (Section Comments)
- Sử dụng comment dạng `/* Section: <Tên> */` ở đầu mỗi phần lớn trong file.
- Ví dụ trong `styles.js`:
```css
/* Section: Header */
:root { ... }
/* Section: Tabs */
...```
- Điều này cho phép `grep_search` nhanh chóng tìm phần cần.

## 5. Quy tắc Đặt tên
- **Biến & hàm**: `camelCase`
- **Lớp**: `PascalCase`
- **Hằng số**: `UPPER_SNAKE`
- **ID DOM**: Prefix `vnpt-` (ví dụ `vnpt-btn-submit`).

## 6. Lint & Pre‑commit
- Cài đặt **ESLint** với cấu hình:
```json
{
  "extends": ["eslint:recommended", "plugin:prettier/recommended"],
  "env": {"browser": true, "es2021": true},
  "rules": {
    "max-lines-per-function": ["error", {"max": 30}],
    "no-console": "warn",
    "prefer-const": "error"
  }
}
```
- Thêm **husky** hook:
```json
"husky": {"hooks": {"pre-commit": "npm run lint"}}
```
- Khi lint lỗi, AI sẽ cung cấp diff để sửa.

---
