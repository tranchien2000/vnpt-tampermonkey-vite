# 📖 Hướng Dẫn Sử Dụng - VNPT Tampermonkey

> **Dành cho người mới bắt đầu** - Hướng dẫn từng bước để sử dụng hiệu quả userscript VNPT

---

## 🚀 Bắt Đầu Nhanh

### 1. Cài Đặt

1. Cài đặt **Tampermonkey** extension cho trình duyệt
2. Mở file `dist/myscript.user.js` 
3. Tampermonkey sẽ tự động nhận diện và hỏi cài đặt
4. Click **Install** để hoàn tất

### 2. Mở Widget

- Truy cập trang **hopdong.vnpt.vn**
- Widget sẽ tự động xuất hiện ở góc phải màn hình
- Click nút **📋** để mở/đóng bảng điều khiển

---

## 🎯 Các Tính Năng Chính

### 📊 Quét Dữ Liệu (Scan)

**Cách dùng:**
1. Điền thông tin vào form web của VNPT
2. Click nút **📊 Quét** trên widget
3. Dữ liệu sẽ tự động được lấy từ form và hiển thị trong bảng

**Mẹo:**
- Quét nhiều lần sẽ cập nhật dữ liệu mới nhất
- Dữ liệu được tự động lưu vào localStorage
- Hệ thống tự động tạo bản sao lưu khi quét

### 📝 Điền Dữ Liệu (Fill)

**Cách dùng:**
1. Nhập/chỉnh sửa dữ liệu trong bảng widget
2. Click nút **📝 Điền**
3. Dữ liệu sẽ tự động điền ngược lên form web

**Mẹo:**
- Chỉ điền các trường có giá trị (không điền trường rỗng)
- Hỗ trợ điền nhiều trường cùng lúc
- Tự động scroll đến trường đang điền

### ⏪ Khôi Phục Dữ Liệu

**Cách dùng:**
- **Click trái** nút **⏪ Khôi phục**: Xem danh sách 20 bản sao lưu gần nhất
- **Click phải** nút **⏪ Khôi phục**: Khôi phục nhanh bản gần nhất

**Trong danh sách:**
- **⏪**: Khôi phục bản này
- **🗑️**: Xóa bản này
- **Hover**: Xem preview dữ liệu

### 🤖 AI Scanner (Gemini)

**Cách dùng:**
1. Click nút **🤖 AI** trên widget
2. Chọn loại quét:
   - **📄 PDF**: Upload file PDF hợp đồng
   - **🖼️ Ảnh**: Upload ảnh chụp hợp đồng
   - **📧 Email**: Nhập nội dung email

3. AI sẽ tự động trích xuất thông tin và điền vào bảng

**Mẹo:**
- Chụp ảnh rõ nét, không bị mờ
- PDF nên có chất lượng tốt
- Kiểm tra lại dữ liệu sau khi AI quét

### 📤 Export DOCX

**Cách dùng:**
1. Điền đầy đủ thông tin vào bảng
2. Click nút **📤 Export**
3. File DOCX sẽ tự động tải về

**Mẹo:**
- Kiểm tra các trường bắt buộc trước khi export
- File sử dụng template có sẵn
- Tên file tự động theo tên tổ chức

---

## 🔧 Các Chức Năng Nâng Cao

### ✅ Chế Độ Nâng Cao

**Bật/Tắt:** Click nút **✅ Chế độ nâng cao**

**Khi bật, hiển thị:**
- **Checkbox**: Chọn nhiều trường để xử lý hàng loạt
- **↔ Nút đồng bộ**: Điều khiển chiều đồng bộ
  - **↔**: Đồng bộ 2 chiều (mặc định)
  - **↓**: Chỉ đồng bộ xuống (Bảng → Form)
  - **↑**: Chỉ đồng bộ lên (Form → Bảng)
- **🔗 Nút liên kết**: Liên kết thủ công với element trên trang
- **Cột Key**: Hiển thị biến DOCX và ID đồng bộ

### 🔗 Liên Kết Thủ Công (Field Linker)

**Cách dùng:**
1. Bật **Chế độ nâng cao**
2. Click nút **🔗** ở hàng muốn liên kết
3. Click vào ô input trên form web
4. Hệ thống tự động lưu liên kết

**Hủy:** Nhấn phím **Esc**

### 🔍 Tra Cứu MST

**Cách dùng:**
1. Nhập mã số thuế vào trường **Số ĐKDN**
2. Click nút **🔍** bên phải ô nhập
3. Thông tin doanh nghiệp tự động điền vào các trường:
   - Tên tổ chức
   - Địa chỉ
   - Người đại diện
   - Chức vụ

### 🧹 Dọn Dẹp Dữ Liệu

**Cách dùng:**
- **Click thường** nút **🧹**: Xóa giá trị các trường đã chọn (hoặc toàn bộ nếu không chọn)
- **Shift + Click** nút **🧹**: Xóa hẳn các hàng đã chọn (hoặc toàn bộ)

**Mẹo:**
- Hệ thống tự động tạo bản sao lưu trước khi dọn dẹp
- Có thể khôi phục lại từ History

### 🎨 Chế Độ Mặc Định (Default Mode)

**Cách dùng:**
1. Click nút **🎨 Default** để bật/tắt
2. Khi bật: Làm việc với dữ liệu mặc định VNPT
3. Khi tắt: Làm việc với dữ liệu cá nhân

**Mẹo:**
- Dùng để quản lý template mặc định
- Dữ liệu Default và Personal được lưu riêng biệt
- Có thể reset về dữ liệu gốc bất cứ lúc nào

### ☁️ Cloud Sync (Firebase)

**Cách dùng:**
1. Click nút **☁️** để mở cài đặt
2. Nhập API Keys (nếu chưa có)
3. Chọn chức năng:
   - **📤 Push**: Đẩy dữ liệu lên Cloud
   - **📥 Pull**: Kéo dữ liệu từ Cloud về
   - **🔄 Sync**: Đồng bộ 2 chiều

**Mẹo:**
- Cần có tài khoản Firebase
- Dữ liệu được mã hóa trước khi upload
- Hỗ trợ đồng bộ nhiều thiết bị

---

## ⌨️ Phím Tắt

| Phím | Chức Năng |
|------|-----------|
| **F1** | Quét dữ liệu từ form web |
| **F2** | Điền dữ liệu lên form web |
| **F3** | Export DOCX |
| **F4** | Mở AI Scanner |
| **F5** | Reload trang (giữ nguyên dữ liệu) |
| **Shift + Scroll** | Toggle giữa Default ↔ Personal Data |
| **Esc** | Hủy Field Linker |

---

## 💡 Mẹo & Thủ Thuật

### 1. Tối Ưu Workflow

**Quy trình chuẩn:**
1. Điền form web thủ công (hoặc upload PDF/ảnh vào AI)
2. Quét dữ liệu (F1)
3. Kiểm tra và chỉnh sửa trong bảng
4. Export DOCX (F3)
5. Điền ngược lên form nếu cần (F2)

### 2. Quản Lý Dữ Liệu

- **Sao lưu thường xuyên**: Hệ thống tự động lưu khi Quét/Dọn dẹp
- **Đặt tên có ý nghĩa**: Tên tổ chức sẽ là tên bản sao lưu
- **Xóa bản cũ**: Giữ tối đa 20 bản, xóa bản không cần thiết

### 3. Làm Việc Với Nhiều Hợp Đồng

**Cách 1: Dùng History**
- Quét hợp đồng A → Làm việc → Quét hợp đồng B
- Quay lại A: Khôi phục từ History

**Cách 2: Dùng Default Mode**
- Default: Template mặc định
- Personal: Dữ liệu hợp đồng hiện tại
- Toggle nhanh bằng Shift + Scroll

### 4. Xử Lý Lỗi

**Nếu dữ liệu không đồng bộ:**
1. Kiểm tra chiều đồng bộ (↔ ↓ ↑)
2. Thử liên kết thủ công bằng 🔗
3. Kiểm tra ID trong Chế độ nâng cao

**Nếu AI Scanner lỗi:**
1. Kiểm tra API Key Gemini
2. Thử lại với ảnh/PDF chất lượng tốt hơn
3. Kiểm tra kết nối mạng

**Nếu Export DOCX lỗi:**
1. Kiểm tra các trường bắt buộc
2. Đảm bảo có dữ liệu trong bảng
3. Thử reload trang và quét lại

---

## 🎓 Video Hướng Dẫn

*(Sẽ cập nhật sau)*

---

## 🆘 Hỗ Trợ

- **Issues**: [GitHub Issues](https://github.com/tranchien2000/vnpt-tampermonkey-vite/issues)
- **Email**: tranchien2000@gmail.com
- **Version hiện tại**: 1.8.6

---

## 📝 Ghi Chú

- Userscript chỉ hoạt động trên **hopdong.vnpt.vn**
- Dữ liệu được lưu local, không gửi lên server (trừ Cloud Sync)
- Cần bật JavaScript và cho phép localStorage
- Tương thích Chrome, Edge, Firefox (có Tampermonkey)

---

**Chúc bạn sử dụng hiệu quả!** 🎉
