# VNPT Tampermonkey Script - Project Brain

## 1. Overview
Dự án là một Userscript (Tampermonkey) dùng để tự động hóa việc nhập liệu và xuất file DOCX từ các biểu mẫu của mạng VNPT. Script viết bằng JavaScript (ESM) và build bằng Vite.
Cấu trúc có 4 phần chính: Core, UI, Features, Utils.

## 2. Các Module Chính
- **Core**: `constants.js` (Labels, Keys), `state.js` (AppState), `defaults.js` (Default Data), `scannerFallbacks.js`.
- **UI**: `styles.js` (CSS chia 6 sections), `widget.js` (Giao diện chính), `dragDrop.js`, `toast.js`.
- **API**: `storage/` (localStorage/GM_setValue quản lý tập trung).
- **Features**: 
    - `calc/` (Tính thuế, format số)
    - `dataFill/` (Đồng bộ, điền dữ liệu vào form, Import/Export tab)
    - `fieldsManager.js` (Quản lý data tập trung bảng)
    - `docExport.js` (Render DOCX bằng docxtemplater)
    - `templateManager.js` (Quản lý mẫu)
    - `webScanner.js` (Quét form web)
    - `autoFillForm.js` (Điền tự động)
- **Utils**: `domHelper.js`, `numberHelper.js`, `logger.js`.

## 3. Data Flow
1. Quét dữ liệu (webScanner) -> fieldsManager -> localStorage.
2. Xuất file: Người dùng chọn Template -> form data từ fieldsManager -> tải file .docx (docExport).
3. AutoFill: Tự động điền qua MutationObserver (autoFillForm).
4. Calc: Nhập liệu tính thuế -> đồng bộ vào trang (calcWidgetFeature -> syncEngine).

## 4. Project Memory & Quyết Định
- **UI**: Dùng Glassmorphism, z-index: 99999.
- **Form Inputs**: VNPT inputs thường thiếu ID hoặc dễ đổi, phải quét qua placeholder/label text (`webScanner.js`).
- **MutationObserver**: Tối ưu chỉ quan sát node cụ thể, tránh lag toàn bộ body.
- **Storage**: Mọi tương tác local storage quy về `src/api/storage/`.

## 5. Hướng dẫn cho AI
- **QUY TẮC CỐT LÕI**: Luôn tuân thủ [RULES.md](file:///c:/Users/Chien/vnpt-tampermonkey-vite/docs/RULES.md) (Planning First, Tiếng Việt Mandate...).
- Mọi CSS nằm trong `styles.js`.
- Luôn kiểm tra `constants.js` khi thêm trường dữ liệu.
- Mọi Workflow có sẵn trong `.agents/workflows/`. Đọc các workflow để xử lý task lặp lại.
- Luôn kiểm tra `PROJECT_MEMORY.md` để nắm tình trạng mới nhất.
