# VNPT EXPORT WIDGET - PROJECT COMPREHENSIVE REPORT (APRIL 10, 2026)

Tài liệu này tổng hợp toàn bộ trạng thái, kiến trúc và tính năng của dự án VNPT Export Widget để làm nguồn dữ liệu (Source) cho NotebookLM.

---

## 1. TỔNG QUAN DỰ ÁN (OVERVIEW)

**Dự án:** VNPT Word Automation (Export Widget)
**Nền tảng:** Tampermonkey Userscript / Vite 5 / Vanilla JS
**Mục tiêu:** Tự động hóa quy trình soạn thảo hợp đồng trên hệ thống Portal VNPT. Giải quyết các vấn đề về nhập liệu thủ công, sai sót thông tin và tốc độ xử lý hợp đồng.

### Các thành phần chính:
- **Widget trung tâm:** Quản lý bảng dữ liệu (bên A/B), đồng bộ với trang web.
- **AI Integration:** Sử dụng Gemini AI (Flash 2.0) để quét PDF và phân loại văn bản thô.
- **Data Engine:** Đồng bộ 2 chiều giữa UI Widget và DOM của Portal VNPT.
- **Calculators:** Bộ tính toán thuế suất và phí dịch vụ chuyên dụng.

---

## 2. KIẾN TRÚC HỆ THỐNG (ARCHITECTURE)

Dự án áp dụng **Kiến trúc phân lớp (Layered Architecture)** để đảm bảo tính module và dễ mở rộng.

### Cấu trúc thư mục:
- `src/core`: Chứa constants, state (Singleton AppState) và defaults (dữ liệu mặc định VNPT).
- `src/ui`: Chứa CSS Glassmorphism và layout HTML chính của Widget.
- `src/features`: Chứa logic nghiệp vụ (quét web, xuất file, quản lý template).
- `src/api`: Kết nối external services (Gemini AI, MST Lookup).
- `src/utils`: Các helper xử lý chuỗi, ngày tháng, sao lưu và quản lý storage.

### Data Flow (Luồng dữ liệu):
1. **Input:** Quét từ Web (DOM), Upload PDF (AI OCR), hoặc Nhập thô (AI/Local Classifier).
2. **Storage:** Dữ liệu được lưu vào `LocalStorage` (thông qua `storage.js` với cơ chế debounce để tối ưu hiệu suất).
3. **Processing:** Dữ liệu được map vào bảng Biến (Fields Table), người dùng có thể chỉnh sửa trực tiếp.
4. **Output:** Đồng bộ ngược lên Web (Auto-fill) hoặc Xuất ra file `.docx` (PizZip/Docxtemplater).

---

## 3. CÁC TÍNH NĂNG CỐT LÕI (CORE FEATURES)

### A. Quét & Phân loại dữ liệu (Web/PDF/Raw)
- **Web Scanner**: Tự động nhận diện các trường thông tin dựa trên Placeholder, Label hoặc FormControlName.
- **AI PDF Scanner**: Sử dụng Gemini API v1beta để trích xuất thông tin từ file PDF hợp đồng sang JSON.
- **Raw Multi-purpose Scan**:
    - **Local Mode (Regex)**: Phân loại cực nhanh không cần Internet cho các trường phổ biến (MST, Email, SĐT, Số HĐ).
    - **AI Mode (Gemini)**: Phân loại văn bản phức tạp, không định dạng.

### B. Selector Inspector (Mới cập nhật 🚀)
- Công cụ "Soi" trường dữ liệu: Cho phép người dùng click trực tiếp vào một ô nhập liệu trên trang VNPT để tự động lấy `ID/Name/FormControlName` và thêm vào bảng Mapping của Widget.

### C. Quản lý Template & Xuất file
- Hỗ trợ đa Template (.docx).
- Lưu trữ template local trong IndexedDB (thường có dung lượng ~500KB - 2MB).
- Đồng bộ tên file xuất tự động theo định dạng: `Số HĐ - Tên Tổ Chức.docx`.

### D. Hệ thống đồng bộ (Sync Engine)
- Sử dụng `MutationObserver` để theo dõi các sự kiện thay đổi trên DOM.
- Cơ chế `Sync Back`: Điền dữ liệu từ Widget ngược lên trang web với độ trễ tối thiểu.
- Hỗ trợ các component phức tạp như `Select2`.

---

## 4. NHẬT KÝ CẬP NHẬT GẦN ĐÂY (LAST UPDATES - 10/4/2026)

1. **Selector Inspector (Bắt selector web)**: 
    - Giải quyết vấn đề trang VNPT thay đổi selector liên tục.
    - Hỗ trợ nhận diện Label thông minh để tự gắn tên Nhãn cho ID bắt được.

2. **MST Lookup Service**:
    - Tích hợp API tra cứu Mã số thuế.
    - Tự động điền: Tên doanh nghiệp, Địa chỉ, Người đại diện từ Mã số thuế.

3. **Optimized Scanner (Hiệu suất & Độ chính xác)**:
    - Triển khai `buildFullDOMMap`: Giảm thời gian quét trang từ O(N*M) xuống O(N+M).
    - Cải thiện việc ghép nốt địa chỉ (Tỉnh/Huyện/Xã/Số nhà) thành chuỗi duy nhất.

4. **Refined UI & Interaction**:
    - Hợp nhất các chức năng Dọn dẹp dữ liệu (Clean Data).
    - Nút 🗑 (Thùng rác) đa năng: Click thường = Dọn giá trị & Lưu JSON; Shift+Click = Xóa hàng.
    - Giao diện Raw Scan tối ưu diện tích với nút điều khiển dạng cột đứng.

---

## 5. DỮ LIỆU KỸ THUẬT (TECHNICAL SPECS)

- **LocalStorage Keys:** `VNPT_FIELDS`, `VNPT_CONFIG`, `VNPT_TEMPLATES`, `calc_data_map`.
- **Gemini Model:** `gemini-2.0-flash` (Ưu tiên tốc độ).
- **Libraries:**
    - `docxtemplater` & `pizzip`: Xử lý Word.
    - `SweetAlert2` (tùy chọn) hoặc custom Toasts: Thông báo.
    - `Vite`: Compiler.

---
*Tài liệu này được tạo bởi AI Assistant cho mục đích đồng bộ kiến thức vào NotebookLM.*
