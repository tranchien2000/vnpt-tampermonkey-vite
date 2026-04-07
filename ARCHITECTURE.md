# VNPT Tampermonkey Script Architecture

## Overview
Dự án là một Tampermonkey Userscript dùng để tự động hóa việc nhập liệu và xuất file DOCX từ các biểu mẫu web của VNPT. Script được cấu trúc theo dạng module ESM, sử dụng Vite để build.

```mermaid
graph TD;
  Core[Core (constants, state, defaults)] --> UI[UI (widget, styles)];
  UI --> Features[Features];
  Features --> Utils[Utils];
  Features -->|điền dữ liệu| DataFill[dataFill];
  Features -->|tạo file| DocExport[docExport];
```

## Module Map

### 1. Core (State & Constants)
Các file lưu trữ cấu hình tĩnh và trạng thái runtime. AI nên đọc các file này trước để biết các hằng số và keys.

- [constants.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/core/constants.js): Chứa mapping nhãn (DEFAULT_LABELS) và các key của localStorage.
- [state.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/core/state.js): Singleton AppState lưu giữ tham chiếu đến các thành phần UI (DOM) và các cờ trạng thái (flags).
- [defaults.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/core/defaults.js): Chứa dữ liệu bên B mặc định (DEFAULT_DATA) và danh sách trường bên A (fieldsA).
- [scannerFallbacks.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/core/scannerFallbacks.js): [NEW] Xử lý logic dự phòng khi quét dữ liệu trang web không tìm thấy nhãn chuẩn.

### 2. UI (Giao diện)
Phần render và điều khiển layout của widget.

- [styles.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/ui/styles.js): Chứa toàn bộ CSS (với 6 Section Comments giúp AI định vị nhanh).
- [widget.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/ui/widget.js): Khởi tạo giao diện chính (Export Widget), quản lý resize/đóng mở.
- [dragDrop.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/ui/dragDrop.js): Logic kéo thả chung cho cả 2 widget chính.
- [toast.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/ui/toast.js): Hiển thị thông báo góc màn hình.

### 3. API (Giao tiếp & Lưu trữ)
Quản lý các kết nối ngoại vi và lưu trữ tập trung.

- [storage/](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/api/storage/): Quản lý lưu trữ dữ liệu (localStorage, GM_setValue) với cơ chế debounce và caching.

### 3. Features (Tính năng)
Logic nghiệp vụ chính của script.

- [calc/](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/features/calc/): Thư mục quản lý Calc Widget (Gồm Logic, UI, History).
  - [calcLogic.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/features/calc/calcLogic.js): Logic tính thuế & format số.
  - [calcUI.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/features/calc/calcUI.js): Khởi tạo DOM & Event Listeners.
- [dataFill/](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/features/dataFill/): Thư mục quản lý dữ liệu và đồng bộ (Tabs UI, Sync Engine).
  - [syncEngine.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/features/dataFill/syncEngine.js): Logic điền dữ liệu & lắng nghe sự kiện input toàn trang.
  - [dataFillUI.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/features/dataFill/dataFillUI.js): Giao diện 3 tab dữ liệu & Import/Export.
- [fieldsManager.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/features/fieldsManager.js): Quản lý bảng dữ liệu trung tâm của widget Export (CRUD, drag-sort).
- [docExport.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/features/docExport.js): Logic render file .docx bằng docxtemplater.
- [templateManager.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/features/templateManager.js): Quản lý các mẫu .docx (URL hoặc file local lưu trong IndexedDB).
- [webScanner.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/features/webScanner.js): Quét dữ liệu từ trang web đưa vào bảng quản lý.
- [autoFillForm.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/features/autoFillForm.js): Tự động điền các trường cố định ngay khi load form.

### 4. Utils (Tiện ích)
- [domHelper.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/utils/domHelper.js): Các hàm thao tác DOM (setValue, setPageField).
- [numberHelper.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/utils/numberHelper.js): Chuyển số -> chữ tiếng Việt, format tiền.
- [logger.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/utils/logger.js): Logging quản lý log ra console.

## Data Flow
1. **Quét dữ liệu**: Người dùng bấm nút "Quét" (`webScanner.js`) -> Dữ liệu đổ vào `fieldsManager.js` -> Lưu vào `localStorage (LOCAL_KEY_FIELDS)`.
2. **Xuất file**: Người dùng bấm "Xuất file" (`docExport.js`) -> Lấy template từ `templateManager.js` -> Lấy data từ `fieldsManager.js` -> Tải file về.
3. **Tính toán**: Nhập liệu vào Calc Widget (`calcWidgetFeature.js`) -> Đồng bộ ngược vào web hoặc Data Tabs (`dataFillFeature.js`).
4. **Tự động**: `autoFillForm.js` tự động điền ngay khi form xuất hiện qua `MutationObserver`.

## Token Optimization & Cheat Sheet

### 1. Cheat Sheet (Lược đồ nhanh)

| Component | File chính | Chức năng |
| :--- | :--- | :--- |
| **Giao diện** | [styles.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/ui/styles.js) | Chứa 100% CSS (Tìm theo Section Comments) |
| **Widget** | [widget.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/ui/widget.js) | Khung sườn UI chính |
| **Dữ liệu** | [constants.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/core/constants.js) | Chứa nhãn (Labels) và Keys cho storage |
| **Logic Tính** | [calcLogic.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/features/calc/calcLogic.js) | Thuế, format tiền, số -> chữ |
| **Đồng bộ** | [syncEngine.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/features/dataFill/syncEngine.js) | Điền dữ liệu từ widget vào trang web |
| **Xuất file** | [docExport.js](file:///c:/Users/Chien/vnpt-tampermonkey-vite/src/features/docExport.js) | Tạo file .docx |

### 2. Quy trình "Tiết kiệm Token" cho AI

1. **Grep-First**: Thay vì `view_file` toàn bộ 400 dòng `styles.js`, hãy dùng `grep_search` với từ khóa của Section (ví dụ: `/* Section 3: Tabs */`).
2. **Context-Aware Mapping**: Luôn đối chiếu `constants.js` trước khi sửa bất kỳ logic lấy dữ liệu nào.
3. **Skip Large Files**: Tuyệt đối không đọc `original_script.js` hay `source.js` trừ khi có chỉ thị đặc biệt.
4. **Workflow Check**: Xem `.agents/workflows/` để biết các bước thực hiện chuẩn cho các tác vụ lặp lại.
5. **JSDoc Header**: Chỉ đọc 20 dòng đầu của file để hiểu nhiệm vụ trước khi đào sâu code.

---
*Lưu ý: Toàn bộ code comments và tài liệu phải duy trì bằng Tiếng Việt.*
