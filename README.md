# VNPT Word Automation (Vite Userscript)

Đây là một dự án Userscript (Tampermonkey) được module hóa và xây dựng trên công cụ **Vite**. Công cụ này tự động hóa việc lấy dữ liệu trên portal hợp đồng của VNPT, lưu trữ các biến thủ công và xuất ra tệp Hợp đồng DOCX.

Dự án này đã được tái cấu trúc thành các module độc lập, áp dụng các nguyên tắc kỹ thuật phần mềm tốt nhất (Event Bus, Feature Toggles, Shared State) để dễ bảo trì, tích hợp tính năng theo dạng "Pluggable" và build thành file duy nhất.

---

## 📂 Kiến Trúc Dự Án (Architecture)

Dự án áp dụng mô hình kiến trúc phân lớp, loại bỏ hoàn toàn "circular dependency" (phụ thuộc chéo) và sử dụng Event Bus để giao tiếp giữa các module. 

```text
tampermonkey-vite/
├── package.json           # Khai báo thư viện (docxtemplater, pizzip) & scripts build
├── vite.config.js         # Cấu hình Vite, cấu hình Userscript Header (Banner)
└── src/
    ├── main.js            # Entry Point: Nhúng UI và kích hoạt các module (Feature Toggles)
    ├── core/
    │   ├── constants.js   # Các Key LocalStorage, Default Labels, Events enum
    │   ├── state.js       # Centralized Shared State: Quản lý DOM Ref & các trạng thái (isDragging)
    │   ├── eventBus.js    # Cấu trúc giao tiếp Pub/Sub (Publish - Subscribe)
    │   └── featureToggle.js # Quản lý Bật/Tắt tính năng động
    ├── utils/
    │   ├── domHelper.js   # Trợ giúp trigger các hàm DOM thao tác Input/Select
    │   └── logger.js      # Ghi log thống nhất
    ├── ui/
    │   ├── styles.js      # Chứa cấu trúc CSS để chèn bằng GM_addStyle
    │   ├── widget.js      # Dựng khung HTML ban đầu vào trang web
    │   └── dragDrop.js    # Xử lý Logic kéo thả, co/kéo UI trên màn hình
    └── features/
        ├── fieldsManager.js # Controller cho các dòng Row, Drag Data, và Lưu LocalStorage
        ├── webScanner.js    # Nút quét dữ liệu & tự cập nhật khi người dùng gõ
        ├── docExport.js     # Đổ dữ liệu từ UI vào File Word (.docx)
        ├── autoFillForm.js  # Mutation Observer, tự động điền các Form có sẵn
        ├── dataFillFeature.js # Xử lý dữ liệu cấu hình, Sync và Auto-fill (Tab Default/Custom/Sync)
        └── calcWidgetFeature.js # Khung Giao diện Widget tính thuế và sao chép nhanh (VNPT Fast)
```

---

## 🛠️ Trọng Tâm Kỹ Thuật (Key Technical Features)

### 1. Kiến trúc Giao Tiếp Bằng Sự Kiện (Event Bus)
Trong mô hình cũ, bộ WebScanner phải `import` hàm trực tiếp từ FieldsManager để cập nhật các thanh input. Ở cấu trúc kiến trúc mới, chúng hoàn toàn cách ly (Decoupled).
* Khi **webScanner** tìm thấy dữ liệu, nó sẽ bắn tung một tín hiệu: `EventBus.emit('ADD_FIELD', data)`
* **fieldsManager** lắng nghe tín hiệu này và tự xử lý: `EventBus.on('ADD_FIELD', handler)`.
Điều này đảm bảo cho hệ thống linh hoạt và không bị sụp đổ nếu ta gỡ bỏ 1 tính năng.

### 2. Feature Toggles (Bật / Tắt Tính Năng)
Có một tệp trung tâm định nghĩa `config` về việc tính năng nào được phép chạy (Ví dụ: `{ webScanner: true, autoFillForm: false }`). Module khởi động (`main`) sẽ quét kiểm tra và chỉ khởi tạo bộ khởi động của tính năng nếu nó đang bật.

### 3. Tách Rời State Hiện Tại (Centralized Shared State)
Mọi references tới Widget DOM (`panel`, `container`), vị trí kéo thả (`offsetX`, `offsetY`)... đều gom vào `AppState` trong `core/state.js`. Không một file nào được khai báo biến Global chồng chéo, tránh rò rỉ bộ nhớ hoàn toàn.

### 4. Build Ra Mã Nguồn Duy Nhất Bằng Vite
Nhờ tính năng tự động parse dependency của Vite, mỗi khi chạy lệnh `npm run build`:
* Vite sẽ gom mọi file `js` từ `src/**`
* Rút gọn mã, áp template Header chuẩn của Tampermonkey lên đầu
* Định dạng mã vào trong một hàm gọi ngay lớp thứ nhất (IIFE). Kết quả là file `dist/myscript.user.js` sẵn sàng copy dán vào web mà không cần cấu hình phức tạp.

---

## 🚀 Hướng Dẫn Cài Đặt Khai Phát (Developer Guide)

**1. Cài Đặt Môi Trường**
Mở VS Code hoặc PowerShell tại thư mục dự án và gõ lệnh:
\`\`\`bash
npm install
\`\`\`

**2. Phát triển liên tục (Watch Mode - nếu có)**
\`\`\`bash
npm run dev
\`\`\`
Mọi thay đổi trên thư mục `src` có thể được config để tự động làm mới mã.

**3. Build Bundle Phát Hành**
Khi code xong, gõ chạy:
\`\`\`bash
npm run build
\`\`\`
Sản phậm xuất ra sẽ nằm ở file: `dist/myscript.user.js`. Nhặt file này đi đưa cho người sử dụng cài trên Tampermonkey của trình duyệt.
