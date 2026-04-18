# 🚀 VNPT Word Automation Pro (v1.7.0+)

**VNPT Word Automation Pro** là một công cụ (Userscript/Chrome Extension) mạnh mẽ được thiết kế để tự động hóa quy trình nghiệp vụ trên các hệ thống Portal của VNPT. Công cụ giúp bóc tách dữ liệu khách hàng từ nhiều nguồn khác nhau (Web, PDF, Hình ảnh, Email) và xuất trực tiếp ra các biểu mẫu văn bản Word (.docx) chuẩn chỉnh.

[![Version](https://img.shields.io/badge/version-1.7.0-blue.svg)](https://github.com/tranchien2000/vnpt-tampermonkey-vite)
[![Built with Vite](https://img.shields.security/badge/Built%20with-Vite-646CFF.svg)](https://vitejs.dev/)
[![AI Powered](https://img.shields.io/badge/AI-Powered-purple.svg)](https://ai.google.dev/)

---

## ✨ Tính năng nổi bật

### 🧠 1. Hệ thống AI Scanner (Sử dụng Google Gemini)
*   **Trích xuất đa phương thức**: Quét dữ liệu từ file PDF, ảnh chụp Hợp đồng, hoặc CCCD gắn chip với độ chính xác cực cao.
*   **Xử lý hình ảnh thông minh**: Tự động nén và resize ảnh trước khi gửi để tiết kiệm Token AI.
*   **QR Text**: Chế độ bóc tách nhanh offline sử dụng thuật toán Regex và tra cứu Tỉnh/Thành cho các văn bản thô.

### 🔄 2. Đồng bộ hóa Cloud (Firebase)
*   **Tài khoản cá nhân**: Đăng nhập để đồng bộ toàn bộ Profile, API Key, Hotkeys và Mẫu văn bản giữa các máy tính khác nhau.
*   **Real-time Sync**: Dữ liệu luôn được cập nhật tức thì qua nền tảng Firebase Firestore.

### 📝 3. Quản lý biểu mẫu & Xuất Word
*   **Templating engine**: Sử dụng `docxtemplater` để đổ dữ liệu vào các file `.docx` mẫu.
*   **Đồng bộ 2 chiều**: Tự động điền dữ liệu từ bảng vào trang web và ngược lại.
*   **Quản lý mẫu cục bộ**: Lưu trữ và quản lý nhiều mẫu hợp đồng khác nhau ngay trong trình duyệt.

### ⌨️ 4. Công cụ hỗ trợ tối ưu
*   **Hệ thống Hotkeys**: Tùy biến phím tắt cho mọi hành động (Quét, Điền, Xuất, Reset...).
*   **Bộ tính toán tài chính**: Tự động tính tiền trước thuế, VAT, sau thuế và chuyển đổi số tiền thành chữ.
*   **History**: Lưu trữ 20 bản sao lưu gần nhất để khôi phục nhanh khi xảy ra lỗi.

---

## 🛠️ Công nghệ sử dụng

*   **Build Tool**: [Vite](https://vitejs.dev/) - Cho tốc độ phát triển và build cực nhanh.
*   **Language**: Modern Javascript (ES6+).
*   **Backend**: [Firebase](https://firebase.google.com/) (Auth & Firestore).
*   **AI Engine**: [Google Gemini Pro Vision](https://ai.google.dev/).
*   **Libaries**: 
    *   `docxtemplater`: Xử lý logic Word.
    *   `pizzip`: Nén và giải nén file docx.
    *   `jsqr`: Nhận diện mã QR.

---

## 📦 Cấu trúc dự án

```text
vnpt-tampermonkey-vite/
├── src/
│   ├── api/            # Kết nối Firebase, Gemini, MST Service
│   ├── core/           # Hằng số, cấu hình mặc định, State quản lý
│   ├── features/       # Các module tính năng (Calc, AI Scanner, Fields...)
│   ├── ui/             # Giao diện chính và các thành phần CSS
│   └── utils/          # Tiện ích xử lý chuỗi, ngày tháng, DOM, Storage
├── scripts/            # Script hỗ trợ Release và Build tự động
├── releases/           # Kho lưu trữ các bản build chính thức (v1.x.x)
└── dist/               # Sản phẩm build cuối cùng (myscript.user.js)
```

---

## 🚀 Hướng dẫn cài đặt

### Dành cho người dùng (Sử dụng ngay)
1. Cài đặt extension [Tampermonkey](https://www.tampermonkey.net/) trên trình duyệt (Chrome/Edge).
2. Tải và cài đặt bản script mới nhất tại đây: [myscript.user.js](./dist/myscript.user.js).
3. Truy cập vào Portal VNPT, Widget sẽ tự động hiển thị bên góc phải.

### Dành cho lập trình viên (Phát triển tiếp)
```bash
# 1. Clone dự án
git clone https://github.com/tranchien2000/vnpt-tampermonkey-vite.git

# 2. Cài đặt thư viện
npm install

# 3. Chạy môi trường Development (Watch mode)
npm run dev

# 4. Build sản phẩm cuối
npm run build
```

---

## 🚢 Quy trình Release
Để thực hiện release một phiên bản mới, chỉ cần chạy lệnh:
```bash
node scripts/release.cjs "Nội dung cập nhật"
```
Hệ thống sẽ tự động:
1. Tăng số phiên bản.
2. Build code mới nhất.
3. Đóng gói Extension Zip.
4. Ghi nhận lịch sử thay đổi từ Git commit.
5. Tạo Tag và Push lên GitHub.

---

## 📄 Giấy phép
Dự án được phát triển nội bộ cho mục đích hỗ trợ công việc tại VNPT. 

---
**Author:** *Trần Chiến* 
**Contact:** *chien.vnpt@email.com*
