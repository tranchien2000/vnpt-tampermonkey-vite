# VNPT Tampermonkey Script Architecture

## Overview
Dự án là một Tampermonkey Userscript dùng để tự động hóa việc nhập liệu và xuất file DOCX từ các biểu mẫu web của VNPT. Script được cấu trúc theo dạng module ESM, sử dụng Vite để build.

## Module Map

### 1. Core (State & Constants)
Các file lưu trữ cấu hình tĩnh và trạng thái runtime. AI nên đọc các file này trước để biết các hằng số và keys.

- [constants.js](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/src/core/constants.js): Chứa mapping nhãn (DEFAULT_LABELS) và các key của localStorage.
- [state.js](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/src/core/state.js): Singleton AppState lưu giữ tham chiếu đến các thành phần UI (DOM) và các cờ trạng thái (flags).
- [defaults.js](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/src/core/defaults.js): [NEW] Chứa dữ liệu bên B mặc định (DEFAULT_DATA) và danh sách trường bên A (fieldsA).

### 2. UI (Giao diện)
Phần render và điều khiển layout của widget.

- [styles.js](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/src/ui/styles.js): Chứa toàn bộ CSS (với 6 Section Comments giúp AI định vị nhanh).
- [widget.js](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/src/ui/widget.js): Khởi tạo giao diện chính (Export Widget), quản lý resize/đóng mở.
- [dragDrop.js](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/src/ui/dragDrop.js): Logic kéo thả chung cho cả 2 widget chính.
- [toast.js](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/src/ui/toast.js): Hiển thị thông báo góc màn hình.

### 3. Features (Tính năng)
Logic nghiệp vụ chính của script.

- [calcWidgetFeature.js](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/src/features/calcWidgetFeature.js): Widget tính toán thuế và điền dữ liệu. Là host cho phần Data Fill Tabs.
- [dataFillFeature.js](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/src/features/dataFillFeature.js): Quản lý 3 tab dữ liệu (Custom/Default/Sync). Chứa engine tự động đồng bộ khi gõ.
- [fieldsManager.js](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/src/features/fieldsManager.js): Quản lý bảng dữ liệu trung tâm của widget Export (CRUD, drag-sort).
- [docExport.js](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/src/features/docExport.js): Logic render file .docx bằng docxtemplater.
- [templateManager.js](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/src/features/templateManager.js): Quản lý các mẫu .docx (URL hoặc file local lưu trong IndexedDB).
- [webScanner.js](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/src/features/webScanner.js): Quét dữ liệu từ trang web đưa vào bảng quản lý.
- [autoFillForm.js](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/src/features/autoFillForm.js): Tự động điền các trường cố định ngay khi load form.

### 4. Utils (Tiện ích)
- [domHelper.js](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/src/utils/domHelper.js): Các hàm thao tác DOM (setValue, setPageField).
- [numberHelper.js](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/src/utils/numberHelper.js): Chuyển số -> chữ tiếng Việt, format tiền.
- [logger.js](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/src/utils/logger.js): Logging quản lý log ra console.

## Data Flow
1. **Quét dữ liệu**: Người dùng bấm nút "Quét" (`webScanner.js`) -> Dữ liệu đổ vào `fieldsManager.js` -> Lưu vào `localStorage (LOCAL_KEY_FIELDS)`.
2. **Xuất file**: Người dùng bấm "Xuất file" (`docExport.js`) -> Lấy template từ `templateManager.js` -> Lấy data từ `fieldsManager.js` -> Tải file về.
3. **Tính toán**: Nhập liệu vào Calc Widget (`calcWidgetFeature.js`) -> Đồng bộ ngược vào web hoặc Data Tabs (`dataFillFeature.js`).
4. **Tự động**: `autoFillForm.js` tự động điền ngay khi form xuất hiện qua `MutationObserver`.

## Token Optimization Best Practices
- AI hãy đọc file [ARCHITECTURE.md](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/ARCHITECTURE.md) này đầu tiên.
- Luôn kiểm tra JSDoc ở đầu mỗi file trước khi đọc nội dung code.
- Khi cần sửa CSS, hãy tìm section tương ứng dựa trên [styles.js](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/src/ui/styles.js) section comments.
