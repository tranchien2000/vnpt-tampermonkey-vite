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
├── 📄 dev.user.js           # Script DEV: Hot Reload từ localhost (cài riêng vào TM)
├── 📄 .gitignore
│
└── src/
    ├── main.js              # Entry Point: Khởi động toàn bộ hệ thống
    │
    ├── core/                # Nền tảng — không import từ lớp nào khác
    │   ├── constants.js     # DEFAULT_LABELS, localStorage Keys, REQUIRED_KEYS
    │   ├── state.js         # Singleton AppState (DOM refs, drag state...)
    │   ├── defaults.js      # Dữ liệu mặc định Bên B + DEFAULT_SYNC_DATA + DEFAULT_CALC_MAP
    │   └── scannerFallbacks.js  # Logic fallback cho webScanner
    │
    ├── utils/               # Hàm tiện ích thuần (không có side-effect UI)
    │   ├── common.js        # debounce, throttle...
    │   ├── dateHelper.js    # getVNPTDateStrings() → {ngay, thang, nam}
    │   ├── domHelper.js     # setInputValue, setPageField, clearDOMCache
    │   ├── numberHelper.js  # Số → chữ tiếng Việt, formatMoney
    │   ├── stringHelper.js  # Xử lý chuỗi (trim, normalize...)
    │   ├── backupHelper.js  # Export/Import JSON trạng thái
    │   ├── migrationHelper.js   # Smart Merge LocalStorage khi deploy version mới
    │   ├── storage.js       # Wrapper localStorage với debounce & ký tự đặc biệt
    │   └── logger.js        # console.log có prefix & level
    │
    ├── api/
    │   └── storage/         # Adapter lưu trữ đa nguồn
    │       ├── index.js     # Factory: export { storage }
    │       ├── idb.js       # IndexedDB adapter (lưu file DOCX binary)
    │       └── localAdapter.js  # LocalStorage adapter
    │
    ├── ui/                  # Lớp giao diện
    │   ├── styles.js        # Toàn bộ CSS (6 Section Comments)
    │   ├── widget.js        # Khởi tạo HTML widget chính (Export Panel)
    │   ├── dragDrop.js      # Kéo thả 2 widget bằng mousedown/mousemove
    │   └── toast.js         # Thông báo góc màn hình
    │
    └── features/            # Logic tính năng (bulk of codebase)
        ├── main.js          # (Xem src/main.js — entry point)
        ├── fieldsManager.js # CRUD bảng field-rows, drag-sort, lưu localStorage
        ├── webScanner.js    # Quét DOM trang → fire EventBus 'ADD_FIELD'
        ├── docExport.js     # Xuất DOCX (docxtemplater) & Copy TXT clipboard
        ├── templateManager.js   # Quản lý mẫu DOCX: URL fetch ↔ IndexedDB
        ├── autoFillForm.js  # MutationObserver: điền form ngay khi xuất hiện
        ├── hotkeys.js       # Phím tắt toàn cục
        ├── configManager.js # Quản lý cấu hình người dùng
        │
        ├── calc/            # Calc Widget (tính thuế)
        │   ├── index.js     # initCalcWidget() — điểm khởi động
        │   ├── calcLogic.js # Tính thuế VAT, format số, số → chữ
        │   ├── calcUI.js    # DOM + Event Listeners cho Calc Widget
        │   └── calcHistory.js   # Lịch sử tính toán (before/after)
        │
        └── dataFill/        # DataFill Widget (đồng bộ dữ liệu)
            ├── index.js     # Re-export
            ├── dataFillUI.js    # Giao diện 3 tab: Default / Custom / Sync
            └── syncEngine.js    # Lắng nghe input toàn trang & điền ngược
```

---

## 🔍 Module Map chi tiết

### 1. `src/main.js` — Entry Point

Khởi tạo toàn bộ hệ thống theo thứ tự:

| Bước | Hàm | Mô tả |
|------|-----|-------|
| 1 | `initStorageMerge()` | Smart Merge LocalStorage trước khi dùng data |
| 2 | `injectStyles()` | Chèn CSS qua `GM_addStyle` |
| 3 | `initWidget()` | Dựng DOM widget chính vào trang |
| 4 | `initCalcWidget()` | Dựng Calc Widget |
| 5 | `initDragDrop()` | Cho phép kéo thả 2 widget |
| 6 | `initFieldsManager()` | Khởi tạo bảng quản lý biến |
| 7 | `loadSavedData()` | Tải dữ liệu cũ từ localStorage |
| 8 | `initWebScanner()` | Gắn nút quét và sự kiện thay đổi |
| 9 | `initDocExport()` | Gắn nút xuất DOCX & Copy TXT |
| 10 | `setupAutoFillForm()` | MutationObserver theo dõi form mới |
| 11 | `initSyncEngine()` | Engine đồng bộ ngầm |
| 12 | `initHotkeys()` | Đăng ký phím tắt |
| 13 | `MutationObserver` | Quản lý DOM Cache (xóa cache khi DOM thay đổi) |

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

#### `fieldsManager.js` (14 KB)

Bảng quản lý biến trung tâm. CRUD các field rows, drag-sort, lưu/tải localStorage.

| Hàm chính | Mô tả |
|-----------|-------|
| `initFieldsManager()` | Khởi tạo bảng, gắn event listeners |
| `loadSavedData()` | Tải data từ `LOCAL_KEY_FIELDS` |
| `addFieldRow(key, value)` | Thêm hàng mới vào bảng |
| `getFieldsData()` | Trả về `{ [key]: value }` từ toàn bộ rows |

#### `webScanner.js` (4.8 KB)

Quét DOM trang web theo `DEFAULT_LABELS`, điền kết quả vào bảng field rows.

**Cơ chế:** Tìm element theo `id` khớp với key trong `DEFAULT_LABELS` → lấy `value` hoặc `innerText`. Nếu không tìm thấy → dự phòng qua `scannerFallbacks.js`.

#### `docExport.js` (10 KB)

Hai chức năng xuất dữ liệu:

| Chức năng | Hàm | Mô tả |
|-----------|-----|-------|
| Xuất DOCX | `renderDocx(buffer, data, filename)` | Dùng `docxtemplater` + `PizZip` để render template |
| Copy TXT | `copyTxtToClipboard(template, data)` | Thay `@key` → value, copy vào Clipboard API |

**Ưu tiên template DOCX:**
1. `AppState.templateBuffer` (đã fetch từ URL)
2. File local (từ `<input type="file">`)

**Auto-filename:** Tự động tạo tên file từ `tenToChuc` + tên template, rút gọn các từ thừa (Công ty, TNHH, Cổ phần...).

#### `templateManager.js` (11 KB)

Quản lý danh sách template DOCX:

| Chức năng | Mô tả |
|-----------|-------|
| Lưu URL template | Fetch binary → lưu vào IndexedDB |
| Quản lý danh sách | CRUD template với `SK_TEMPLATES` key |
| Kích hoạt template | Gán `AppState.templateBuffer` để xuất |

#### `autoFillForm.js` (2.4 KB)

Dùng `MutationObserver` theo dõi DOM trang web. Khi phát hiện form mới load (SPA navigation), tự động điền các trường cố định không cần người dùng làm gì.

#### `hotkeys.js` (1.6 KB)

Đăng ký phím tắt toàn cục. Tham khảo file để biết các tổ hợp phím hiện có.

---

### 4. `src/features/calc/` — Calc Widget

| File | Mô tả |
|------|-------|
| `calcLogic.js` | Tính `truocThue`, `thue`, `sauThue` từ giá nhập; format số; chuyển số → chữ tiếng Việt |
| `calcUI.js` | DOM widget tính thuế, input listeners, hiển thị kết quả và sync ngược |
| `calcHistory.js` | Lưu/hiển thị lịch sử 2 giá trị `before` / `after` |
| `index.js` | `initCalcWidget()` — entry point |

**Luồng:** Nhập số → `calcLogic` tính → `calcUI` hiển thị → `DEFAULT_CALC_MAP` đồng bộ vào các field ID trên trang.

---

### 5. `src/features/dataFill/` — DataFill Widget (3 Tab)

| Tab | Nguồn dữ liệu | Mô tả |
|-----|---------------|-------|
| **Default** | `defaults.js → DEFAULT_DATA` | Thông tin Bên B cố định |
| **Custom** | `SK_DATA_CUS` (localStorage) | Dữ liệu tuỳ chỉnh người dùng nhập |
| **Sync** | `SK_DATA_SYNC` (localStorage) | Cấu hình đồng bộ liên trường |

**SyncEngine** (`syncEngine.js`): Lắng nghe event `input` toàn trang → khi field thay đổi → tìm trong mapping → tự động cập nhật các field liên quan.

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
// @version      1.5
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
| `/add-feature` | Tạo module tính năng mới |
| `/add-field` | Thêm trường dữ liệu vào hệ thống |
| `/add-helper` | Thêm hàm tiện ích mới vào `utils/` |
| `/add-template` | Thêm mẫu DOCX mới từ URL |
| `/api-request` | Gọi API ngoài an toàn với `GM_xmlhttpRequest` |
| `/debug-ui` | Sửa lỗi hiển thị CSS/HTML |
| `/dev-all` | Lệnh chạy môi trường dev |
| `/export-json` | Bảo trì tính năng Backup/Restore JSON |
| `/sync-logic` | Cấu hình đồng bộ widget → trang web |
| `/test-sync` | Debug CSS selectors trên trang đích |
| `/update-ui` | Cập nhật cấu trúc CSS widget |
| `/bug-report` | Tối ưu quy trình xử lý bug |
| `/polish-ui` | Tinh chỉnh giao diện |
| `/reset-all` | Reset data test |

---

## 🔑 Kỹ thuật nổi bật

### Hot Reload không cần refresh

`dev.user.js` polling localhost mỗi 5 giây, phát hiện nội dung thay đổi → gọi `cleanup()` dọn dẹp DOM cũ → `eval()` code mới → `init()` lại. Không cần F5.

### DOM Cache với MutationObserver

`domHelper.js` cache kết quả `document.getElementById()`. `main.js` dùng `MutationObserver` theo dõi `document.body`, khi DOM thay đổi lớn (form mới load) → `clearDOMCache()` để tránh stale reference.

### Smart Storage Migration

`migrationHelper.js` so sánh schema hiện tại với data cũ trong localStorage, tự động merge thêm key mới mà không mất data người dùng đã nhập.

### Multi-key Field System

`DEFAULT_LABELS` dùng chuỗi multi-key làm key (ví dụ: `"ngayKy, ngayKy1"`). Khi điền vào trang web, split theo dấu phẩy → set cho nhiều element ID cùng lúc.

### Template Priority Chain

Thứ tự ưu tiên khi xuất DOCX: **URL buffer** (đã fetch, lưu RAM) > **IndexedDB** (file local đã lưu) > **File input** (chọn file tức thời). Người dùng không cần chọn lại template mỗi lần.

---

*VNPT Word Automation — Tối ưu hóa quy trình nhập liệu hợp đồng nội bộ VNPT Hà Nội.*
