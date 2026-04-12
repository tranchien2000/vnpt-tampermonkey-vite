# Kế hoạch tích hợp Đọc Mail và Quét Màn hình trực tiếp

Bản kế hoạch chi tiết cho việc mở rộng tính năng AI Scanner của công cụ VNPT Export, cho phép trích xuất dữ liệu trực tiếp từ các dịch vụ Email và nội dung hiển thị trên trình duyệt.

## 1. Mục tiêu và Phạm vi
- **Đọc nội dung Mail**: Tự động nhận diện và trích xuất thông tin hợp đồng/khách hàng từ Gmail và Outlook.
- **Quét tài liệu trực tiếp**: Chụp vùng màn hình hoặc quét toàn bộ văn bản hiển thị trong tab hiện tại (Visual OCR/DOM Scraper) để gởi cho Gemini.

---

## 2. Các Module mới cần tạo

### A. Mail Scanner (`src/features/mailScan/`)
Module này chịu trách nhiệm nhận diện cấu trúc email.
1. `mailScanner.js`:
   - Hàm `getMailContent()`: Kiểm tra `window.location.hostname`.
   - Nếu là Gmail: Sử dụng các selector như `.a3s.aiL` (body email).
   - Nếu là Outlook: Sử dụng selector `.x_BodyFragment` hoặc tương đương.
   - Trả về đối tượng gồm: `subject`, `sender`, `body`.

### B. Screen Scanner (`src/features/screenScan/`)
Module này hỗ trợ quét "trực tiếp" những gì user đang nhìn thấy.
1. `screenScanner.js`:
   - **Phương án 1 (DOM Scraper)**: Lấy toàn bộ `innerText` của `document.body` nhưng đã qua lọc bỏ các thành phần rác (nav, footer, widget).
   - **Phương án 2 (Viewport Capture)**: Sử dụng canvas để "chụp" vùng hiển thị (nếu tích hợp thư viện html2canvas) hoặc hướng dẫn user dùng phím nóng chụp vùng chọn.
   - *Ưu tiên*: Bắt đầu với DOM Scraper sạch vì nó nhẹ và chính xác hơn cho website.

---

## 3. Các bước thực hiện chi tiết

### Bước 1: Khởi tạo các file Feature
- Tạo thư mục `src/features/mailScan/` và `src/features/screenScan/`.
- Viết logic scraping cơ bản cho Gmail/Outlook.

### Bước 2: Cập nhật UI Widget
Thay đổi trong `src/ui/widget.js`:
- Thêm 2 nút mới vào section `raw-scan-actions`:
  - `vnpt-btn-scan-mail`: Biểu tượng 📧 (Quét Mail).
  - `vnpt-btn-scan-screen`: Biểu tượng 🖥️ (Quét màn hình).
- Cập nhật `src/ui/styles.js` để hỗ trợ các hiệu ứng hover/active cho nút mới.

### Bước 3: Đăng ký Event trong AI Scanner
Thay đổi trong `src/features/pdfScan/index.js`:
- Import `scanMail` và `scanScreen`.
- Gán sự kiện click cho 2 nút mới.
- Luồng xử lý:
  1. Click Nút -> Lấy text/ảnh.
  2. Đổ nội dung vào `vnpt-raw-scan-input`.
  3. Kích hoạt hiệu ứng `ai-scanning-glow`.
  4. Gọi `extractWithGemini` hoặc `extractFieldsFromText`.

### Bước 4: Tinh chỉnh System Prompt cho Gemini
- Cập nhật prompt trong `src/features/pdfScan/geminiOcr.js` để hiểu thêm ngữ cảnh "Dữ liệu từ Email" và "Dữ liệu từ trang web hiển thị".

---

## 4. Danh sách file thay đổi
| File | Nội dung thay đổi |
| :--- | :--- |
| `src/features/mailScan/index.js` | (Mới) Logic trích xuất mail. |
| `src/features/screenScan/index.js` | (Mới) Logic quét màn hình hiện tại. |
| `src/ui/widget.js` | Bổ sung HTML nút bấm. |
| `src/features/pdfScan/index.js` | Kết nối logic nút bấm với Gemini. |
| `src/ui/styles.js` | Thêm style cho các nút mới. |

---

## 5. Timeline dự kiến
1. **Ngày 1**: Hoàn thành Mail Scanner (Gmail/Outlook).
2. **Ngày 2**: Hoàn thành Screen Scanner & UI Integration.
3. **Ngày 3**: Testing và fix bug selector.

---
*Ghi chú: Kế hoạch này sẽ được thực hiện ngay sau khi người dùng xác nhận "OK".*
