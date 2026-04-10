# VNPT PROJECT BRAIN CONTEXT (OPTIMIZED)
*Ngày cập nhật: 23:15:50 10/4/2026*

## 1. TÀI LIỆU CỐT LÕI (CORE DOCUMENTS)

### File: PROJECT_MEMORY.md

# VNPT Project Memory

File này lưu trữ các quyết định quan trọng, lỗi đặc thù và trạng thái dự án để AI luôn duy trì được bối cảnh giữa các phiên làm việc.

## 1. Mục tiêu hiện tại (Current Objective)

- [x] Triển khai giao diện Glassmorphism cao cấp.
- [x] Hợp nhất menu cài đặt và sao lưu.
- [x] Hệ thống kiểm tra dữ liệu bắt buộc (Required Fields Validation).
- [x] Cải thiện hệ thống "Trí nhớ dự án" (Đã khôi phục và đồng bộ).
- [x] Kiểm tra tính nhất quán của hệ thống Rules/Workflow với người dùng.
- [x] Triển khai tính năng Phân loại dữ liệu Local (Raw Scan).
- [x] Xây dựng công cụ Selector Inspector (Bắt selector bằng click).
- [x] Tích hợp API tra cứu MST doanh nghiệp.
- [x] Tối ưu hóa hiệu suất quét DOM (O(N+M)).
- [x] Hoàn thiện logic nút 🗑 (Dọn giá trị / Xóa hàng).


## 2. Nhật ký Quyết định (Decision Log)

- **2026-04-07 (Glassmorphism UI)**: Thay thế hoàn toàn giao diện cũ sang phong cách mờ đục (blur) với màu Indigo/Slate để tăng tính sang trọng.
- **2026-04-07 (Storage Abstraction)**: Di chuyển toàn bộ logic `localStorage` vào `src/api/storage/` để quản lý tập trung và tránh xung đột dữ liệu.
- **2026-04-09 (Memory System)**: Quyết định dùng file `PROJECT_MEMORY.md` kết hợp `.cursorrules` để AI "nhớ" tốt hơn.
- **2026-04-09 (Rules & Workflow Alignment)**: Giải thích cơ chế Slash Commands cho người dùng (không có menu tự động) v*Ngày cập nhật: 22:45:00 10/4/2026*

> [!NOTE]
> Để có cái nhìn chi tiết và đầy đủ nhất về toàn bộ logic dự án cho NotebookLM, hãy tham khảo file:
> [.notebooklm/PROJECT_REPORT_2026.04.10.md](file:///c:/Users/Chien/.gemini/antigravity/scratch/tampermonkey-vite/.notebooklm/PROJECT_REPORT_2026.04.10.md)
dẫn vào `RULES.md`.
- **2026-04-10 (Fix Slash Command Autocomplete)**: Phát hiện và sửa lỗi Extension UI không gọi được autocomplete do file `.gitignore` ẩn thư mục `.agents`. Đã cấu hình lại `.gitignore` và hoàn tác các rule sai lầm trước đó.
- **2026-04-10 (PDF Scan Button Enhancement)**: Bổ sung logic copy link hướng dẫn Gemini (GUIDE) vào clipboard nếu chưa cấu hình API Key khi bấm nút Scan PDF.
- **2026-04-10 (Startup Workflow)**: Triển khai `/start` để tự động hóa việc load bối cảnh dự án (brain_context + PROJECT_MEMORY).
- **2026-04-10 (NotebookLM Integration)**: Cấu hình Notebook dự án tại URL: `https://notebooklm.google.com/notebook/7e1829da-588e-42d2-8a87-afef88b6d3e7`. AI sẽ sử dụng URL này cho các tác vụ cập nhật brain mà không cần hỏi lại.
- **2026-04-10 (DOM Optimization)**: Triển khai `buildFullDOMMap` trong `domHelper.js` để chuyển đổi hiệu suất quét từ O(N*M) sang O(N+M), giúp widget xử lý nhanh ngay cả trên trang phức tạp.
- **2026-04-10 (Selector Inspector)**: Triển khai công cụ soi trường web giúp người dùng tự lấy selector mà không cần mở DevTools.
- **2026-04-10 (MST API Integration)**: Kết hợp tra cứu MST vào bảng fieldsManager để tự động điền thông tin doanh nghiệp.
- **2026-04-10 (UI/UX Refinement)**: Nâng cấp nút 🗑 thành Dual-mode (Clean All/JSON Backup/Delete Row).


## 3. Lỗi đặc thù & Giải pháp (Technical Gotchas)

- **VNPT Selectors**: Các input trên trang VNPT thường không có ID cố định. Luôn ưu tiên dùng `placeholder` hoặc `label` text qua `webScanner.js`.
- **Z-Index Layering**: Widget cần có `z-index: 99999`.
- **MutationObserver Performance**: Chỉ quan sát các node cụ thể để tránh lag trang.

## 4. Trạng thái các tính năng (Status Map)

- **Export DOCX**: Hoạt động ổn định.
- **Calc Widget**: Đã hợp nhất vào settings.
- **Sync Engine**: Hỗ trợ lắng nghe sự kiện `input` thời gian thực.

---

_Ghi chú: AI phải cập nhật file này sau mỗi task lớn bằng workflow `/update-memory`._


---

### File: README.md

# VNPT Word Automation — Tampermonkey Userscript (Vite)

> **Phiên bản:** 1.5 &nbsp;|&nbsp; **Build Tool:** Vite 5 &nbsp;|&nbsp; **Môi trường:** Tampermonkey / hopdong.vnpt.vn

Userscript tự động hóa toàn bộ luồng nhập liệu hợp đồng VNPT:
- **Quét dữ liệu** từ portal web → điền tự động vào bảng biến
- **Xuất file DOCX** theo template có sẵn (URL Google Drive hoặc file local)
- **Copy text nhanh** bằng template văn bản tuỳ chỉnh (`@key` placeholder)
- **Tính thuế & phí dịch vụ** với bộ Calc Widget tích hợp
- **Đồng bộ hai chiều** giữa widget và các form trên trang web

---

## 📖 Mục lục

- [Tổng quan kiến trúc](#-tổng-quan-kiến-trúc)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Module Map chi tiết](#-module-map-chi-tiết)
- [Hướng dẫn cài đặt & phát triển](#-hướng-dẫn-cài-đặt--phát-triển)
- [Luồng dữ liệu (Data Flow)](#-luồng-dữ-liệu-data-flow)
- [Tính năng chi tiết](#-tính-năng-chi-tiết)
- [Cấu hình & LocalStorage Keys](#-cấu-hình--localstorage-keys)
- [Quy tắc dành cho AI Agent](#-quy-tắc-dành-cho-ai-agent)

---

## 🏗️ Tổng quan kiến trúc

Dự án áp dụng **kiến trúc phân lớp** (Layered Architecture) loại bỏ hoàn toàn circular dependency. Các lớp giao tiếp một chiều từ trên xuống dưới, và sử dụng **Event Bus** để các module giao tiếp ngang hàng mà không cần `import` trực tiếp lẫn nhau.

```mermaid
graph TD
  subgraph Core ["🧱 Core (Nền tảng)"]
    constants["constants.js\n(Labels, Keys)"]
    state["state.js\n(AppState Singleton)"]
    defaults["defaults.js\n(Data mặc định Bên B)"]
    scannerFallbacks["scannerFallbacks.js\n(Fallback khi quét)"]
  end

  subgraph Utils ["🔧 Utils (Tiện ích)"]
    domHelper["domHelper.js"]
    numberHelper["numberHelper.js"]
    dateHelper["dateHelper.js"]
    stringHelper["stringHelper.js"]
    backupHelper["backupHelper.js"]
    migrationHelper["migrationHelper.js"]
    storage["storage.js"]
    logger["logger.js"]
  end

  subgraph API ["📡 API (Storage)"]
    idb["idb.js\n(IndexedDB)"]
    localAdapter["localAdapter.js"]
  end

  subgraph UI ["🖼️ UI (Giao diện)"]
    styles["styles.js\n(6 Section CSS)"]
    widget["widget.js\n(HTML khung chính)"]
    dragDrop["dragDrop.js"]
    toast["toast.js"]
  end

  subgraph Features ["⚙️ Features (Tính năng)"]
    fieldsManager["fieldsManager.js\n(Bảng biến trung tâm)"]
    webScanner["webScanner.js\n(Quét dữ liệu web)"]
    docExport["docExport.js\n(Xuất DOCX + Copy TXT)"]
    templateManager["templateManager.js\n(Quản lý mẫu .docx)"]
    autoFillForm["autoFillForm.js\n(MutationObserver)"]
    hotkeys["hotkeys.js\n(Phím tắt)"]
    configManager["configManager.js"]

    subgraph calc ["📊 Calc Widget"]
      calcLogic["calcLogic.js"]
      calcUI["calcUI.js"]
      calcHistory["calcHistory.js"]
    end

    subgraph dataFill ["🔄 DataFill"]
      syncEngine["syncEngine.js"]
      dataFillUI["dataFillUI.js"]
    end
  end

  Core --> UI
  Core --> Utils
  Core --> API
  UI --> Features
  Utils --> Features
  API --> Features
```

---

## 📂 Cấu trúc thư mục

```text
tampermonkey-vite/
│
├── 📄 package.json          # Dependencies & npm scripts
├── 📄 vite.config.js        # Cấu hình build Vite + Tampermonkey Header banner

... (phần còn lại đã được lược bỏ để tiết kiệm context) ...

---

## 2. TÓM TẮT CẤU TRÚC MÃ NGUỒN (CODE LOGIC SUMMARIES)

### Thư mục: src/core

| File | Mô tả |
| :--- | :--- |
| constants.js | /**<br>* @file constants.js<br>* @desc Tất cả hằng số dùng chung toàn dự án: localStorage keys, DEFAULT_LABELS.<br>* @exports DEFAULT_LABELS    — map{id → tên nhãn tiếng Việt} dùng cho webScanner<br>* @exports LOCAL_KEY_*       — localStorage keys cho VNPT Export Widget<br>* @exports SK_*              — localStorage keys cho Calc & AutoFill Widget<br>* @seeAlso core/defaults.js (data mặc định), core/state.js (AppState)<br>*/ |
| defaults.js | /**<br>* @file defaults.js<br>* @desc Dữ liệu mặc định cho bên B (VNPT Hà Nội).<br>*       File này KHÔNG chứa logic — chỉ là data thuần.<br>* @exports DEFAULT_DATA  — object{key: string} dùng làm giá trị mặc định<br>* @seeAlso syncEngine.js (consumer), fieldsManager.js (consumer)<br>*/ |
| scannerFallbacks.js | /**<br>* @file scannerFallbacks.js<br>* @desc Cấu hình các giá trị mặc định cho scanner khi không tìm thấy dữ liệu trên web.<br>*       Tách riêng logic gán giá trị mặc định (như ngày hiện tại, số lượng mặc định)<br>*       ra khỏi logic quét DOM.<br>*/<br>/**<br>* Lấy giá trị mặc định dựa trên ID của trường (field ID).<br>* @param {string} id_can_tim - ID của trường cần lấy fallback.<br>* @returns {string} Giá trị mặc định hoặc chuỗi rỗng. |
| state.js | /**<br>* @file state.js<br>* @desc Singleton AppState — lưu tham chiếu các DOM elements và trạng thái toàn cục.<br>*       Sử dụng Proxy để hỗ trợ reactivity (lắng nghe thay đổi qua .on()).<br>*/ |

### Thư mục: src/features

| File | Mô tả |
| :--- | :--- |
| autoFillForm.js | /**<br>* @file autoFillForm.js<br>* @desc Tự động điền và đồng bộ các trường cố định ngay khi trang load hoặc AJAX render form.<br>*       Sử dụng MutationObserver để detect form mới, sau đó điền: chức vụ, nơi cấp CCCD,<br>*       đồng bộ địa chỉ, SĐT, email, MST theo cặp field tương ứng.<br>* @exports setupAutoFillForm  — khởi tạo MutationObserver + chạy fill lần đầu<br>* @seeAlso utils/domHelper.js (syncSetValue), dataFillFeature.js (fill nâng cao)<br>*/<br>// src/features/autoFillForm.js |
| calcWidgetFeature.js | /**<br>* @file calcWidgetFeature.js<br>* @desc Khởi tạo và điều phối Calc & AutoFill Widget (widget phụ, nổi góc màn hình).<br>*       Bao gồm: title bar, calculator thuế (trước/thuế/sau/bằng chữ), lịch sử,<br>*       dock/undock, cấu hình field-mapping (⚙️), và gọi renderDataFillTabs().<br>* @exports initCalcWidget  — tạo toàn bộ DOM và gán logic cho widget<br>* @seeAlso dataFillFeature.js (tab data), ui/dragDrop.js (dock/drag), core/constants.js (SK_*)<br>*/<br>// src/features/calcWidgetFeature.js |
| configManager.js | /**<br>* @file configManager.js<br>* @desc Quản lý việc Nhập (Import) và Xuất (Export) cấu hình JSON cho VNPT Export Widget.<br>*       Bao gồm: Fields data, Templates list, Widget Position & Size.<br>* @exports exportConfig — Hàm xuất JSON tải về máy<br>* @exports importConfig — Hàm nhập JSON từ máy người dùng<br>*/ |
| dataFillFeature.js | /**<br>* @file dataFillFeature.js<br>* @desc Quản lý 3 tab dữ liệu (Custom / Default / Sync) trong Calc Widget.<br>*       Bao gồm: render giao diện tab, CRUD dữ liệu, import/export JSON,<br>*       và engine tự động đồng bộ field theo mapping khi user gõ trên trang.<br>* @exports renderDataFillTabs  — render toàn bộ phần Data vào widget<br>* @exports doFillData          — điền dữ liệu merged (default+custom) lên trang<br>* @exports doSyncData          — trigger đồng bộ theo sync-map thủ công<br>* @exports DEFAULT_DATA        — re-export từ core/defaults.js (backward compat)<br>* @seeAlso core/defaults.js (data), calcWidgetFeature.js (caller), core/constants.js (keys)<br>*/ |
| docExport.js | /**<br>* @file docExport.js<br>* @desc Xử lý xuất file DOCX từ template bằng docxtemplater + PizZip.<br>*       Bao gồm: render DOCX (fill data), tự động cập nhật tên file xuất,<br>*       và ưu tiên template: URL buffer → file local.<br>* @exports initDocExport  — gán click handler cho nút xuất DOCX và logic tên file<br>* @seeAlso templateManager.js (template buffer), fieldsManager.js (data source)<br>*/<br>// src/features/docExport.js |
| fieldsManager.js | /**<br>* @file fieldsManager.js<br>* @desc Quản lý bảng fields (danh sách key-value-label-sync) trong VNPT Export Widget.<br>*       Đã tối ưu: Sử dụng Storage utility, Reactive State (AppState.on), DOM Cache.<br>*/ |
| hotkeys.js | /**<br>* @file hotkeys.js<br>* @desc Quản lý phím tắt động cho toàn bộ ứng dụng.<br>*       Hỗ trợ cấu hình phím tắt, lưu trữ và ghi nhận phím mới từ UI.<br>*/ |
| selectorInspector.js | /**<br>* @file selectorInspector.js<br>* @desc Công cụ "Soi" trường dữ liệu (Selector Inspector).<br>*       Giúp người dùng bắt ID/Name/FormControlName bằng cách di chuột và click trực tiếp trên web.<br>*/ |
| templateManager.js | /**<br>* @file templateManager.js<br>* @desc Quản lý danh sách template DOCX (lưu URL hoặc file local qua IndexedDB).<br>*       Bao gồm: load/save danh sách, fetch từ URL (Google Drive), lưu file local vào<br>*       IndexedDB (idbSave/idbLoad), render UI danh sách, chọn/xoá/đổi tên template.<br>* @exports loadTemplates         — đọc danh sách template từ localStorage<br>* @exports fetchTemplateFromUrl  — tải ArrayBuffer từ URL qua GM_xmlhttpRequest<br>* @exports saveLocalTemplate     — lưu file local vào IDB + cập nhật danh sách<br>* @exports renderTemplateManager — render/refresh UI danh sách template vào container<br>* @seeAlso api/storage/idb.js (IndexedDB), widget.js (host container), docExport.js (consumer)<br>*/ |
| webScanner.js | /**<br>* @file webScanner.js<br>* @desc Quét các trường (fields) trên trang web và đồng bộ vào bảng fields của widget.<br>*       Bao gồm: nút "Quét" lấy values từ DOM theo DEFAULT_LABELS keys,<br>*       và listener input/change để tự động cập nhật khi user gõ trực tiếp trên web.<br>* @exports initWebScanner  — gán click/input/change listeners cho nút Quét<br>* @seeAlso core/constants.js (DEFAULT_LABELS), fieldsManager.js (addOrUpdateFieldRow)<br>*/ |

### Thư mục: src/api

| File | Mô tả |
| :--- | :--- |
| gemini.js | /**<br>* @file gemini.js<br>* @desc Utility để kết nối với Google Gemini API.<br>*       Hỗ trợ cả text-only và multimodal (image/pdf).<br>*/<br>/**<br>* Gọi API Gemini để xử lý nội dung.<br>* @param {Object} options - Các tùy chọn gọi API<br>* @param {string} options.apiKey - Gemini API Key<br>* @param {string} options.model - Tên mô hình (ví dụ: gemini-2.0-flash) |
| mstService.js | /**<br>* @file mstService.js<br>* @desc Dịch vụ tra cứu mã số thuế doanh nghiệp qua API VietQR.<br>*/ |

### Thư mục: src/utils

| File | Mô tả |
| :--- | :--- |
| backupHelper.js | /**<br>* @file backupHelper.js<br>* @desc Hỗ trợ xuất/nhập toàn bộ cấu hình dự án ra file JSON.<br>*/ |
| common.js | /**<br>* @file common.js<br>* @desc Các hàm tiện ích dùng chung (debounce, v.v.)<br>*/<br>/**<br>* Hàm chống rung (debounce)<br>* @param {Function} func<br>* @param {number} wait<br>* @returns {Function}<br>*/ |
| dateHelper.js | /**<br>* @file dateHelper.js<br>* @desc Các hàm bổ trợ xử lý ngày tháng năm.<br>*/ |
| domHelper.js | No description available. |
| localClassifier.js | /**<br>* @file localClassifier.js<br>* @desc Logic bóc tách dữ liệu từ văn bản thô bằng Regex (không dùng AI).<br>*       Tối ưu cho mẫu Giấy đăng ký doanh nghiệp.<br>*/<br>/**<br>* Phân loại văn bản thô dựa trên các mẫu Regex phổ biến.<br>* @param {string} text - Nội dung văn bản thô cần phân loại.<br>* @returns {Object} Đối tượng chứa các trường dữ liệu tìm thấy.<br>*/ |
| logger.js | No description available. |
| migrationHelper.js | No description available. |
| numberHelper.js | // src/utils/numberHelper.js |
| storage.js | /**<br>* @file storage.js<br>* @desc Tiện ích quản lý dữ liệu lưu trữ (Hỗ trợ localStorage và Tampermonkey GM_storage).<br>*       Đã tối ưu: JSON tự động, xử lý lỗi, Debounce ghi đĩa và Cache nội bộ.<br>*/ |
| stringHelper.js | /**<br>* @file stringHelper.js<br>* @desc Các hàm tiện ích xử lý chuỗi: Levenshtein distance, fuzzy matching.<br>*/<br>/**<br>* Tính khoảng cách Levenshtein giữa 2 chuỗi.<br>* @param {string} a<br>* @param {string} b<br>* @returns {number}<br>*/ |

## 3. DANH MỤC QUY TRÌNH (WORKFLOWS MAP)

- **/add-feature**: Quy trình chuẩn để tạo một module tính năng mới từ A-Z
- **/add-field**: Cách thêm một trường dữ liệu (field) mới vào toàn bộ hệ thống
- **/add-helper**: Cách thêm một hàm bổ trợ (helper) vào hệ thống
- **/add-template**: Quy trình thêm một mẫu Template DOCX từ Google Drive hoặc URL
- **/api-request**: Cách gọi API ngoài an toàn và đúng chuẩn Tampermonkey
- **/bug-report**: Quy trình báo cáo và sửa lỗi hiệu quả, tối thiểu token đầu vào.
- **/debug-ui**: Quy trình sửa lỗi hiển thị và tương tác trên web đích
- **/dev-all**: Quy trình build và chạy server phát triển song song
- **/export-json**: Quy trình bảo trì và cập nhật chức năng xuất/nhập file JSON (Backup)
- **/polish-ui**: Quy trình kiểm tra và làm đẹp giao diện (UI Polish)
- **/reset-all**: Quy trình xóa sạch dữ liệu cũ để bắt đầu môi trường test mới
- **/start**: Khôi phục bối cảnh dự án và tóm tắt trạng thái phiên làm việc trước đó.
- **/sync-logic**: Cách cấu hình để Widget tự động điền dữ liệu lên trang web
- **/test-sync**: Công cụ/Quy trình debug nhanh CSS selectors và IDs trên trang web VNPT
- **/update-memory**: Quy trình tóm tắt và cập nhật "Bộ nhớ dự án" sau mỗi task lớn.
- **/update-ui**: Quy trình cập nhật hoặc sửa đổi giao diện (CSS) cho các widget
- **/upnote**: Tổng hợp brain và đẩy lên NotebookLM dự án.
- **/_index**: Danh mục nhanh (Cheat-sheet) các workflow hệ thống

> *Lưu ý: Để xem chi tiết workflow, hãy dùng lệnh view_file trực tiếp vào file trong thư mục .agents/workflows/*

## 4. QUY TẮC DỰ ÁN (.cursorrules)

AI **PHẢI** tuân thủ bộ quy tắc trung tâm tại: [docs/RULES.md](file:///c:/Users/Chien/vnpt-tampermonkey-vite/docs/RULES.md)

### 🚀 Quy tắc Ưu tiên (Quick Reference):
1. AI **PHẢI** đọc [.notebooklm/brain_context.md](file:///c:/Users/Chien/vnpt-tampermonkey-vite/.notebooklm/brain_context.md) ngay khi bắt đầu.
2. **Planning First**: Lập `implementation_plan.md` và chờ xác nhận trước khi code.
3. **Execution**: Chỉ code sau khi người dùng gõ "ok", "trien khai" hoặc "y".
4. **Grep-First**: Dùng `grep_search` cho file > 100 dòng.
5. **Language**: Toàn bộ phản hồi và code comments là **Tiếng Việt**.
6. **Slash Commands**: Dùng phím `/` để mở menu gợi ý và chọn các workflow từ `.agents/workflows/` (ví dụ: `/update-memory`).

Xem chi tiết tại [RULES.md](file:///c:/Users/Chien/vnpt-tampermonkey-vite/docs/RULES.md) để biết về tiêu chuẩn JSDoc, Error Handling, State Management và Design System (Glassmorphism).


