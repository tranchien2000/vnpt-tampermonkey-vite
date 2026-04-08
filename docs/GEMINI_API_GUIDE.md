# Hướng Dẫn Lấy API Key Gemini (Google AI Studio)

Tính năng **Scan PDF Bằng AI** của tiện ích nâng cao sử dụng mô hình Google Gemini 1.5 Flash để đọc tài liệu tự động. Để đảm bảo tính riêng tư của dữ liệu khách hàng cũng như độ ổn định, ứng dụng cần bạn có một đường dẫn kết nối riêng (API Key) hoàn toàn Miễn Phí do chính Google cấp phát.

Dưới đây là các bước để tự tạo API Key trong vài giây:

## Bước 1: Truy Cập Google AI Studio

Truy cập địa chỉ sau (đăng nhập bằng tài khoản Google - Gmail của bạn):
👉 **[Google AI Studio - Get API Key](https://aistudio.google.com/app/apikey)**

## Bước 2: Tạo Key Mới 

1. Tại màn hình AI Studio, bạn sẽ thấy mục **"Get API key"** hoặc trang chứa danh sách Key.
2. Click vào nút **"Create API Key"**.
3. (Nếu có popup hiện lên) Chọn **Create API key in a new project** (Tạo khóa trên một dự án mới).
4. Đợi khoảng 5 đến 10 giây để Google khởi tạo dự án.
5. Khi Google báo thành công, chuỗi Key của bạn sẽ xuất hiện (có dạng bắt đầu bằng chữ `AIzaSy...`).

## Bước 3: Dán Key vào Cài đặt của VNPT Widget

1. Trở lại tab có màn hình hệ thống VNPT Export Widget của chúng ta.
2. Tại Header của Widget, click vào biểu tượng ⚙️ (**Thêm công cụ/Cài đặt**).
3. Mục "Cấu hình AI OCR (Gemini)" sẽ hiện ra.
4. Bạn dán toàn bộ chuỗi **API Key** ở bước 2 vào ô trống nhập liệu. Hệ thống sẽ tự động lưu lại vào trình duyệt.

🎉 **Xong!** Bạn đã có thể trở lại màn hình chính của Widget và bấm **"📄 Scan PDF"** để thử nghiệm ngay.

--- 

### 💡 Lưu ý Bảo mật:
- Toàn bộ quá trình đọc Hợp đồng PDF của bạn sẽ diễn ra giữa trình duyệt của bạn và Google Gemini. 
- API Key được lưu trên máy của bạn (Local Storage) chứ không gửi đến bất kì máy chủ của bên thứ ba nào khác.
- Mỗi khóa API được cấp Miễn Phí tới **1500 lần Request mỗi ngày**, quá dư dả cho quy trình nhập liệu thông thường.
