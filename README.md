# VNPT Automation Tool — Tampermonkey Userscript (Vite)

> **Phiên bản:** 1.6.17 &nbsp;|&nbsp; **Build Tool:** Vite 5 &nbsp;|&nbsp; **Môi trường:** Tampermonkey / hopdong.vnpt.vn

Userscript tối ưu hóa và tự động hóa toàn bộ luồng quy trình nghiệp vụ trên hệ thống VNPT:
- **AI Multi-source Scanner**: Bóc tách dữ liệu thông minh từ PDF, Ảnh, Gmail, Outlook và Screen Capture thông qua Gemini AI.
- **Real-time 2-way Sync**: Động bộ dữ liệu hai chiều giữa Widget và Form web với quyền kiểm soát hướng (Sync Direction).
- **Xuất file DOCX**: Render tài liệu theo template chuyên nghiệp hỗ trợ cả Cloud (Google Drive) và Local.
- **Tính thuế & Phí**: Bộ công cụ Calc Widget thông minh, tự động điền kết quả vào các trường tương ứng trên trang.
- **Quản lý Lịch sử & Cloud Sync**: Lưu trữ an toàn 10 phiên làm việc gần nhất và đồng bộ dữ liệu qua Firebase.

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

Dự án áp dụng **kiến trúc phân lớp** (Layered Architecture) kết hợp với **Service Pattern** để tích hợp các dịch vụ bên ngoài (AI, Cloud). Hệ thống sử dụng **Event Bus** và **Storage Abstraction** để đảm bảo tính module và khả năng mở rộng.

```mermaid
graph TD
  subgraph Cloud ["📡 Cloud & AI Services"]
    gemini["Gemini AI OCR"]
    firebase["Firebase Cloud Sync"]
    mst["MST Lookup Service"]
  end

  subgraph Core ["🧱 Core (Nền tảng)"]
    constants["constants.js\n(Labels, Keys)"]
    state["state.js\n(AppState Singleton)"]
    defaults["defaults.js\n(Dữ liệu mặc định)"]
    scannerFallbacks["scannerFallbacks.js"]
  end

  subgraph Utils ["🔧 Utils"]
    domHelper["domHelper.js (DOM Cache)"]
    storage["storage.js (Debounced)"]
    history["backupHelper.js (History)"]
    normalization["stringHelper.js (Date/MST Norm)"]
  end

  subgraph UI ["🖼️ UI (Premium Glassmorphism)"]
    styles["styles.js (Modular CSS)"]
    widget["widget.js (Main Container)"]
    components["CloudSyncUI.js / Toast.js"]
    premium["Icon SVG & Animations"]
  end

  subgraph Features ["⚙️ Features"]
    direction FeatureScan ["🔍 AI & Web Scanners"]
    direction FeatureFill ["🔄 Real-time Sync Engine"]
    direction FeatureDoc ["📄 Doc & Text Export"]

    FeatureScan --- pdfScan["PDF/Image Scan"]
    FeatureScan --- mailScan["Mail Scan"]
    FeatureScan --- webScan["Web Scanner"]
    
    FeatureFill --- syncEngine["Sync Engine v2"]
    FeatureFill --- calc["Calc Widget"]
    
    FeatureDoc --- docExport["DOCX Export"]
    FeatureDoc --- templateManager["Template Manager"]
  end

  Cloud --> Features
  Core --> UI
  Core --> Utils
  UI --> Features
  Utils --> Features
```

---

## 📂 Cấu trúc thư mục

```text
tampermonkey-vite/
│
├── 📄 package.json          # Dependencies & npm scripts
├── 📄 vite.config.js        # Cấu hình build Vite + Tampermonkey Header banner
├── 📄 dev.user.js           # Script DEV: Hot Reload từ localhost (cài riêng vào TM)
├── 📄 .gitignore
│
└── src/
    ├── main.js              # Entry Point: Khởi động toàn bộ hệ thống
    │
    ├── api/                 # Các dịch vụ bên ngoài & Storage
    │   ├── firebaseConfig.js # Cấu hình Firebase
    │   ├── firebaseService.js # Đồng bộ dữ liệu đám mây
    │   ├── gemini.js        # Giao tiếp với Gemini AI API
    │   ├── mstService.js    # Tra cứu Mã số thuế doanh nghiệp (Xinvoice)
    │   ├── remoteConfig.js  # Cấu hình từ xa cho App
    │   └── storage/         # Adapter lưu trữ đa nguồn (IndexedDB, LocalStorage)
    │
    ├── core/                # Nền tảng (Constants, State, Defaults)
    │   ├── constants.js     # Labels, Keys, Configuration
    │   ├── state.js         # Singleton AppState
    │   └── defaults.js      # Dữ liệu mặc định & Mapping
    │
    ├── features/            # Logic tính năng (Modularized)
    │   ├── pdfScan/         # AI Scanner (PDF, Image) - Gemini OCR
    │   ├── mailScan/        # Quét nội dung Gmail, Outlook
    │   ├── screenScan/      # Chụp màn hình & OCR trực tiếp
    │   ├── rawScan/         # Phân loại dữ liệu thô (Regex-based)
    │   ├── calc/            # Calc Widget (Tính thuế VAT)
    │   ├── dataFill/        # Real-time Sync Engine v2
    │   ├── webScanner.js    # Quét DOM trang web host
    │   ├── fieldsManager.js # Quản trị bảng biến trung tâm
    │   ├── docExport.js     # Xuất DOCX & Copy TXT
    │   └── templateManager.js # Quản lý mẫu DOCX (Google Drive Integration)
    │
    ├── ui/                  # Lớp giao diện (Premium Design)
    │   ├── components/      # UI Components (CloudSync, Toasts)
    │   ├── styles/          # Modular CSS (Theme, Panel, Fields)
    │   ├── styles.js        # Main Stylist (Legacy/Unified CSS)
    │   ├── widget.js        # Main Interaction Widget
    │   └── dragDrop.js      # Smooth High-performance Dragging (60fps)
    │
    └── utils/               # Tiện ích bổ trợ (Date, String, DOM, History)
```

---

## 🔍 Module Map chi tiết

### 1. `src/main.js` — Entry Point

Khởi tạo toàn bộ hệ thống theo thứ tự:

| Bước | Hàm | Mô tả |
|------|-----|-------|
| 1 | `initStorageMerge()` | Smart Merge LocalStorage & Di chuyển dữ liệu cũ |
| 2 | `injectStyles()` | Chèn CSS Premium (Modular / Unified) |
| 3 | `initWidget()` | Khởi tạo Widget chính (Glassmorphism UI) |
| 4 | `initCalcWidget()` | Khởi tạo công cụ tính thuế & đồng bộ Calc |
| 5 | `initDragDrop()` | Gắn kết nối kéo thả mượt mà (60fps) |
| 6 | `initFieldsManager()` | Khởi động bảng quản trị biến & Mapping |
| 7 | `initWebScanner()` | Gắn nút quét DOM & bóc tách dữ liệu |
| 8 | `initAiScanner()` | (Mới) Kích hoạt Gemini AI Scanner (PDF/Image) |
| 9 | `initSyncEngine()` | Kích hoạt Real-time 2-way Sync Engine v2 |
| 10 | `initRemoteConfig()` | Đồng bộ cấu hình từ Firebase Remote Config |
| 11 | `initHotkeys()` | Đăng ký phím tắt điều khiển nhanh |

> Script hỗ trợ **Hot Reload** qua `window.__vnptCleanup` và `window.__vnptInit`.

---

### 2. `src/core/` — Lớp nền tảng

#### `constants.js`

| Export | Kiểu | Mô tả |
|--------|------|-------|
| `DEFAULT_LABELS` | `{string: string}` | Map ID element → tên nhãn tiếng Việt (cho webScanner) |
| `REQUIRED_KEYS` | `string[]` | Danh sách key bắt buộc khi xuất file |
| `LOCAL_KEY_FIELDS` | `string` | Key lưu bảng biến export |
| `LOCAL_KEY_DEFAULT_FIELDS` | `string` | Key lưu biến mặc định |
| `LOCAL_KEY_POS` / `_SIZE` / `_OPENED` | `string` | UI state widget |
| `SK_DATA_DEF/CUS/SYNC` | `string` | Key lưu data autofill 3 tab |
| `SK_TAX`, `SK_HIST_B/A` | `string` | Key Calc Widget |
| `SK_TEMPLATES` | `string` | Key danh sách template DOCX |
| `SK_TXT_TEMPLATE` | `string` | Key nội dung text template (Copy TXT) |

#### `state.js`

Singleton `AppState` — tập trung mọi DOM reference và flag runtime:

| Property | Loại | Mô tả |
|----------|------|-------|
| `panel` | `HTMLElement` | Widget chính |
| `fieldsContainer` | `HTMLElement` | `<div>` chứa các field rows |
| `templateBuffer` | `ArrayBuffer \| null` | Buffer template DOCX đang active |
| `templateName` | `string` | Tên template cho auto-fill filename |
| `isDragging` | `boolean` | Trạng thái đang kéo widget |
| `offsetX / offsetY` | `number` | Vị trí chuột khi bắt đầu kéo |

#### `defaults.js`

Cấu hình dữ liệu mặc định:

| Export | Mô tả |
|--------|-------|
| `DEFAULT_DATA` | Data Bên B (VNPT Hà Nội): tên, địa chỉ, MST, STK, người đại diện, ngày ký tự động |
| `DEFAULT_SYNC_DATA` | Mapping đồng bộ: khi `soHopDong` thay đổi → các field liên quan cập nhật theo |
| `DEFAULT_CALC_MAP` | Mapping kết quả Calc Widget → ID field trên trang web |
| `DEFAULT_TAX_RATE` | Thuế suất mặc định: `0.08` (8%) |

---

### 3. `src/features/` — Lớp tính năng

#### `fieldsManager.js`
Bảng quản lý biến trung tâm. CRUD các field rows, đồng bộ dữ liệu với localStorage và hỗ trợ kéo thả sắp xếp.

#### `pdfScan/` & `geminiOcr.js` (AI Scanner)
Tích hợp Google Gemini AI để bóc tách dữ liệu từ file PDF, Ảnh chụp, hoặc nội dung Mail/Screen. Tự động ánh xạ thông tin bóc tách được vào bảng biến.

#### `syncEngine.js` (Real-time Sync v2)
Lắng nghe sự kiện `input` toàn trang để đồng bộ dữ liệu tức thì:
- **Hướng đồng bộ**: Tùy chỉnh (Đồng bộ cả hai, Chỉ Widget -> Form, hoặc Chỉ Form -> Widget).
- **Group-by-Rank**: Nhóm địa chỉ (Tỉnh, Huyện, Xã) để điền tuần tự, đảm bảo dữ liệu AJAX không bị ghi đè.

#### `calc/` — Calc Widget
Bộ công cụ tính toán thuế VAT và phí dịch vụ. Tự động chuyển đổi số thành chữ tiếng Việt và điền kết quả vào form hệ thống.

#### `backupHelper.js` (Hệ thống Lịch sử)
Tự động sao lưu 10 bản ghi gần nhất vào LocalStorage. Hỗ trợ khôi phục nhanh qua menu ⏪ để đảm bảo an toàn dữ liệu.

#### `docExport.js` & `templateManager.js`
Xuất dữ liệu ra file `.docx` dựa trên template. Hỗ trợ lưu trữ template trong IndexedDB để tái sử dụng nhanh chóng.

---

### 6. `src/ui/` — Lớp giao diện

#### `styles.js` (24 KB) — 6 Section Comments

Dùng **grep theo Section** thay vì đọc toàn file:

| Section | Nội dung |
|---------|----------|
| `/* Section 1: Base & Layout */` | Widget container, panel, header |
| `/* Section 2: Fields Table */` | Bảng biến, field rows, input styles |
| `/* Section 3: Tabs */` | Tab navigation DataFill widget |
| `/* Section 4: Buttons */` | Export buttons, action buttons |
| `/* Section 5: Calc Widget */` | Giao diện tính thuế |
| `/* Section 6: Toast & Utils */` | Toast notifications, helpers |

#### `widget.js` (18 KB)

Dựng toàn bộ HTML widget Export, quản lý:
- **Resize**: 3 cỡ S / M / L
- **Collapse/Expand**: Ẩn/hiện nội dung
- **File input**: Styled button nhỏ gọn ẩn native input
- **Template Manager**: Danh sách template + nút "✔ Dùng"
- **Text Template**: Textarea nhập `@key` template + nút Copy

---

### 7. `src/utils/` — Tiện ích

| File | Hàm chính | Mô tả |
|------|-----------|-------|
| `domHelper.js` | `setInputValue(el, val)`, `setPageField(id, val)`, `clearDOMCache()` | Trigger React/Vue synthetic events khi set value |
| `numberHelper.js` | `docToText(n)`, `formatMoney(n)` | Số → chữ tiếng Việt, format VNĐ |
| `dateHelper.js` | `getVNPTDateStrings()` | Trả `{ngay, thang, nam}` từ ngày hiện tại |
| `stringHelper.js` | Utility chuỗi | Normalize, truncate, encode... |
| `backupHelper.js` | `exportJSON()`, `importJSON()` | Sao lưu/phục hồi toàn bộ localStorage state |
| `migrationHelper.js` | `initStorageMerge()` | Smart Merge: ghép data cũ với schema mới khi update version |
| `storage.js` | `Storage.get/set/setDebounced` | Wrapper localStorage với debounce để tránh write storm |
| `common.js` | `debounce(fn, ms)`, `throttle(fn, ms)` | Utility timing |
| `logger.js` | `logger.info/debug/error` | Prefix log với `[VNPT]` |

---

## 🚀 Hướng dẫn cài đặt & phát triển

### Yêu cầu

- **Node.js** >= 16
- **Tampermonkey** extension trên trình duyệt
- Truy cập trang `hopdong.vnpt.vn`

### Cài đặt

```bash
npm install
```

### Chế độ phát triển (Hot Reload)

```bash
# Chạy song song: build watch + file server
npm run dev:all
```

Sau đó cài **`dev.user.js`** vào Tampermonkey (thay thế script chính). Script này:
1. Polling mỗi 5 giây đến `http://localhost:8788/myscript.user.js`
2. Phát hiện thay đổi nội dung → gọi `window.__vnptCleanup()` để dọn dẹp version cũ
3. `eval()` script mới → `window.__vnptInit()` khởi tạo lại
4. **Không cần refresh trang** khi code thay đổi

> **Lưu ý:** `npm run dev` = `vite build --watch` (build không minify, `emptyOutDir: false`)
> **Lưu ý:** `npm run serve` = `serve dist --cors -p 8788` (local file server)

### Build phát hành

```bash
npm run build
```

Output: `dist/myscript.user.js` — file duy nhất dạng IIFE, kèm đầy đủ Tampermonkey Header, sẵn sàng phân phối.

**Tampermonkey Header tự động thêm vào:**

```js
// ==UserScript==
// @name         VNPT Word Automation (Vite)
// @version      1.6.17
// @match        *://hopdong.vnpt.vn/*
// @require      docxtemplater@3.37.11
// @require      pizzip@3.1.4
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      localhost, drive.google.com, raw.githubusercontent.com, *
// ==/UserScript==
```

### Cập nhật tự động

```
@updateURL  https://raw.githubusercontent.com/tranchien2000/vnpt-tampermonkey-vite/main/dist/myscript.user.js
@downloadURL https://raw.githubusercontent.com/tranchien2000/vnpt-tampermonkey-vite/main/dist/myscript.user.js
```

Người dùng cuối chỉ cần cài một lần — Tampermonkey tự kiểm tra cập nhật.

---

## 🔄 Luồng dữ liệu (Data Flow)

### 1. Quét dữ liệu từ trang web

```
Người dùng bấm "Quét"
    → webScanner.js đọc DEFAULT_LABELS
    → Tìm element trên DOM theo ID key
    → Fallback: scannerFallbacks.js nếu không khớp
    → Ghi kết quả vào bảng (fieldsManager.addFieldRow)
    → Auto-save vào localStorage (LOCAL_KEY_FIELDS)
```

### 2. Xuất file DOCX

```
Người dùng bấm "Xuất DOCX"
    → docExport.js lấy data từ fieldsManager.getFieldsData()
    → Kiểm tra REQUIRED_KEYS → cảnh báo nếu thiếu
    → Ưu tiên 1: AppState.templateBuffer (đã fetch URL)
    → Ưu tiên 2: file local từ <input type="file">
    → renderDocx(): PizZip + docxtemplater render
    → Tạo Blob → trigger download
```

### 3. Copy Text Template

```
Người dùng nhập text template (ví dụ: "Khách hàng @tenDaiDienn, MST: @soDkdn")
    → Lưu tự động vào localStorage (SK_TXT_TEMPLATE) với debounce 800ms
    → Bấm "Copy Text"
    → copyTxtToClipboard(): thay @key → value từ bảng fields
    → navigator.clipboard.writeText() → thông báo thành công
```

### 4. Tính thuế & đồng bộ

```
Nhập giá vào Calc Widget
    → calcLogic.js tính truocThue / thue / sauThue
    → calcUI.js hiển thị kết quả
    → DEFAULT_CALC_MAP mapping key → danh sách ID field trên trang
    → domHelper.setPageField() điền vào trang web (trigger synthetic event)
```

### 5. Auto-fill khi load form

```
autoFillForm.js: MutationObserver(document.body)
    → Phát hiện form mới xuất hiện (SPA navigation)
    → Điền các trường cố định từ DEFAULT_DATA + Custom Data
    → syncEngine.js lắng nghe 'input' event toàn trang
    → Khi soHopDong thay đổi → auto-fill các field liên quan (DEFAULT_SYNC_DATA)
```

---

## 🗄️ Cấu hình & LocalStorage Keys

### VNPT Export Widget

| Key | Mô tả |
|-----|-------|
| `vnpt_docx_fields` | Mảng JSON các field rows của bảng biến Export |
| `vnpt_docx_default_fields` | Các trường mặc định đã tuỳ chỉnh |
| `vnpt_docx_position` | Vị trí widget (top, left) |
| `vnpt_docx_size` | Cỡ widget: `'S'` / `'M'` / `'L'` |
| `vnpt_docx_opened` | Trạng thái mở/đóng widget |
| `vnpt_templates` | `[{name, url, lastUsed}]` — danh sách template DOCX |
| `vnpt_txt_template` | Nội dung text template cho Copy TXT |

### Calc & AutoFill Widget

| Key | Mô tả |
|-----|-------|
| `vnpt_autofill_data_default` | Data Tab Default (JSON) |
| `vnpt_autofill_data_custom` | Data Tab Custom (JSON) |
| `vnpt_autofill_data_sync` | Data Tab Sync mapping (JSON) |
| `vnpt_widget_pos` | Vị trí Calc Widget |
| `vnpt_widget_collapsed` | `'calc'` \| `'data'` \| `''` — trạng thái thu gọn |
| `vnpt_widget_datatab` | `'default'` \| `'custom'` — tab đang active |
| `vnd_tax_rate` | Thuế suất (mặc định 0.08) |
| `vnd_before_history` | Lịch sử giá trước thuế |
| `vnd_after_history` | Lịch sử giá sau thuế |
| `vnd_calc_map` | Custom mapping Calc → field IDs |

---

## 🤖 Quy tắc dành cho AI Agent

Dự án này được tối ưu cho các Agentic AI (Antigravity, Claude...).

### ✅ Làm đúng

| Quy tắc | Lý do |
|---------|-------|
| Đọc `ARCHITECTURE.md` trước tiên | Nắm bức tranh tổng thể, tiết kiệm action token |
| Kiểm tra `.agents/workflows/_index.md` | Có sẵn workflow cho các tác vụ lặp lại |
| Dùng `grep_search` thay vì `view_file` cho file > 100 dòng | Tiết kiệm token đọc |
| Đọc JSDoc header 20 dòng đầu của mỗi file | Hiểu nhiệm vụ trước khi đào sâu |
| Đối chiếu `constants.js` khi sửa logic lấy dữ liệu | Tránh dùng literal string thay key |
| Dùng `grep "/* Section"` trong `styles.js` để định vị CSS | File 24KB, Section Comment là "map" |

### ❌ Không làm

| Quy tắc | Lý do |
|---------|-------|
| Không đọc `dist/`, `node_modules/` | Mã đã build / vendor, không có ích |
| Không đọc `original_script.js`, `source.js`, `temp_vnpt*.js` | File legacy lớn (>25KB), chỉ lưu lại tham khảo |
| Không khai báo biến Global (ngoài `window.__vnptInit/Cleanup`) | Tránh rò rỉ bộ nhớ, conflict |
| Không dùng `import` chéo giữa module cùng lớp | Giữ kiến trúc phân lớp |

### Workflows sẵn có

| Slash command | Khi nào dùng |
|---------------|-------------|
| `/start` | Khởi tạo bối cảnh phiên làm việc mới |
| `/add-feature` | Tạo module tính năng mới từ A-Z |
| `/add-field` | Thêm trường dữ liệu (field) mới vào hệ thống |
| `/add-template` | Thêm mẫu Template DOCX từ URL ngoài |
| `/api-request` | Gọi API Cross-origin an toàn (Tampermonkey) |
| `/debug-ui` | Sửa lỗi hiển thị UI nội tuyến trên web host |
| `/release` | Quy trình tự động hóa phát hành bản cập nhật |
| `/bug-report` | Quy trình báo cáo và xử lý lỗi tối ưu |
| `/upnote` | Tổng hợp tri thức dự án lên NotebookLM |
| `/reset-all` | Xóa trắng dữ liệu môi trường test |

---

### Gemini AI OCR Integration
Sử dụng `gemini-1.5-flash` để phân tích cấu trúc văn bản từ ảnh chụp hoặc file PDF, tự động ánh xạ thông tin vào bảng biến với độ trễ cực thấp.

### Group-by-Rank Address Sync
Thuật toán điền địa chỉ thông minh: chia các trường địa chỉ thành các cấp độ ưu tiên (Rank). Hệ thống đợi AJAX của Tỉnh/Thành phố load xong mới điền Quận/Huyện, giúp loại bỏ hoàn toàn lỗi mất dữ liệu khi điền form SPA phức tạp.

### Smooth 60fps Drag-n-Drop
Sử dụng `requestAnimationFrame` và cơ chế `Lazy Storage Write` để đảm bảo trải nghiệm di chuyển Widget mượt mà, không giật lag ngay cả trên các trang web nặng.

### Storage Abstraction Layer
Tách biệt logic lưu trữ (IndexedDB cho file lớn, LocalStorage cho cấu hình) giúp hệ thống hoạt động ổn định và dễ dàng mở rộng sang các nền tảng lưu trữ đám mây.

---

*VNPT Automation Tool — Giải pháp tự động hóa nghiệp vụ chuyên sâu cho hệ sinh thái VNPT.*
