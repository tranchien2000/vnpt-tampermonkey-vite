# Tài liệu kỹ thuật: VNPT Tampermonkey Extension

Dự án này là một Userscript (Tampermonkey) được xây dựng bằng Vite, hỗ trợ tự động hóa việc quét dữ liệu và điền form cho các hệ thống VNPT.

## 1. Kiến trúc tổng quan

Dự án được tổ chức theo cấu trúc module hóa:

- **Entry Point**: `src/main.js` - Chịu trách nhiệm khởi tạo toàn bộ ứng dụng, quản lý lifecycle (init/cleanup) và lắng nghe thay đổi DOM.
- **Core**: `src/core/` - Chứa các hằng số (`constants.js`), trạng thái ứng dụng (`state.js`), và cấu hình mặc định.
- **Features**: `src/features/` - Các tính năng chính:
    - `autoFillForm.js`: Logic tự động điền form dựa trên dữ liệu đã quét.
    - `dataFill/`: Engine đồng bộ dữ liệu ngầm.
    - `webScanner.js`: Quét dữ liệu từ trang web hiện tại.
    - `pdfScan/`: Sử dụng Gemini OCR để quét dữ liệu từ file PDF.
    - `fieldsManager.js`: Quản lý các trường dữ liệu và liên kết giữa chúng.
- **UI**: `src/ui/` - Các thành phần giao diện (Widget, Styles, Toast, Drag-and-Drop).
- **API**: `src/api/` - Kết nối với Firebase (Config, Storage, Remote Config) và Gemini AI.
- **Utils**: `src/utils/` - Các hàm bổ trợ (DOM helper, mã hóa, xử lý chuỗi, quản lý storage).

## 2. Luồng hoạt động (Lifecycle)

### Khởi tạo (`init`)
Khi người dùng truy cập một trang web thuộc phạm vi hỗ trợ:
1. `initStorageMerge()`: Đồng bộ local storage.
2. `RemoteConfig.init()`: Tải các bộ chọn (selectors) mới nhất từ Cloud.
3. `injectStyles()`: Nhúng CSS vào trang web.
4. `initWidget()` & `initCalcWidget()`: Hiển thị bảng điều khiển và công cụ tính toán.
5. Khởi tạo các trình quản lý dữ liệu: `initFieldsManager`, `loadSavedData`.
6. Kích hoạt các tính năng quét và điền: `initWebScanner`, `setupAutoFillForm`.
7. Lắng nghe thay đổi DOM bằng `MutationObserver` để làm mới bộ nhớ đệm (cache).

### Dọn dẹp (`cleanup`)
Hỗ trợ Hot Reload mà không cần tải lại trang:
1. Ngắt kết nối `MutationObserver`.
2. Hủy các listener của WebScanner, SyncEngine, Hotkeys.
3. Xóa các thành phần giao diện (Widget, Styles) khỏi DOM.
4. Reset trạng thái toàn cục `window.__vnptInited`.

## 3. Các tính năng chính

### Tự động điền Form (`autoFillForm.js`)
Sử dụng các quy tắc ánh xạ giữa tên trường dữ liệu và các bộ chọn (selectors) trên trang web để tự động điền giá trị. Hỗ trợ xử lý các loại input khác nhau (text, checkbox, radio, select).

### Quét dữ liệu thông minh
- **Web Scanner**: Tự động nhận diện thông tin khách hàng, hợp đồng từ giao diện web.
- **PDF/Screen Scanner**: Sử dụng AI (Gemini) để trích xuất thông tin từ ảnh chụp màn hình hoặc file PDF.

### Đồng bộ hóa dữ liệu
- **Sync Engine**: Theo dõi thay đổi input và đồng bộ hóa dữ liệu giữa các tab hoặc lưu trữ đám mây.
- **Cloud Sync**: Tích hợp Firebase để lưu trữ mẫu (templates) và cấu hình người dùng.

## 4. Ghi chú phát triển
- Dự án sử dụng **Vite** để đóng gói.
- File `version.json` quản lý phiên bản để hệ thống `RemoteConfig` nhận diện cập nhật.
- Sử dụng `logger.js` để theo dõi quá trình chạy trong Console của trình duyệt.
