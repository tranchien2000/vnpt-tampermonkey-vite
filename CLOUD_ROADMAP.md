# ☁️ VNPT Cloud Integration Roadmap

File này dùng để theo dõi tiến độ nâng cấp hệ thống Cloud cho dự án VNPT Tampermonkey.

---

## 🟢 Giai đoạn 1: Foundation & Personal Sync (Đang chờ - Pending)
*Mục tiêu: Đồng bộ hóa cấu hình cá nhân và bảo mật dữ liệu.*

- [x] **1.1. Cấu hình Hạ tầng Cloud (Firebase)**
  - [x] Khởi tạo Project trên nền tảng Cloud.
  - [x] Thiết lập cấu trúc Firestore (users/{uid}/profiles).
  - [x] Cấu hình chính sách bảo mật (Security Rules) cho dữ liệu cá nhân.
- [x] **1.2. Hệ thống Đăng nhập (Authentication)**
  - [x] Tích hợp Firebase Auth SDK.
  - [x] Tạo UI Modal đăng nhập/đăng ký trên Widget (Glassmorphism).
  - [x] Cơ chế lưu Session an toàn.
- [x] **1.3. Đồng bộ Profile (Profile Syncing)**
  - [x] Liên kết `profileManager.js` với Firebase API.
  - [x] Đẩy (Push) và Kéo (Pull) dữ liệu Profiles giữa Local và Cloud.
- [x] **1.4. Sao lưu Cấu hình API (API Key Backup)**
  - [x] Đồng bộ Gemini keys ẩn danh (Mã hóa XOR + Base64).

---

## 🔵 Giai đoạn 2: Team Collaboration (Thư viện dùng chung)
*Mục tiêu: Chia sẻ tài nguyên trong đội nhóm.*

- [x] **2.1. Cloud Template Library**
  - [x] Xây dựng hệ thống quản lý file DOCX tập trung.
  - [x] Tab "Thư viện mẫu" trên UI để tải nhanh template chuẩn của phòng ban.
- [x] **2.2. Remote Selectors (Bản vá UI nhanh)**
  - [x] Cơ chế fetch selector từ Cloud thay vì hard-code trong script.
  - [x] Cập nhật selector từ xa khi trang VNPT đổi giao diện.
- [x] **2.3. Workspace & Permission**
  - [x] Phân quyền Admin/User cho từng Workspace chi nhánh.

---

## 🟡 Giai đoạn 3: AI Hub & History (Trung tâm thông minh)
*Mục tiêu: Lưu trữ và tái sử dụng kết quả bóc tách.*

- [ ] **3.1. Cloud Scan History**
  - [ ] Lưu mọi kết quả bóc tách AI (Extracted Data) kèm metadata.
  - [ ] Chế độ xem lại lịch sử quét và "Re-fill" vào form.
- [ ] **3.2. Secure AI Proxy**
  - [ ] Layer trung gian gọi AI để bảo mật API Key tuyệt đối.
- [ ] **3.3. Prompt Optimization Cloud**
  - [ ] Cập nhật System Prompt cho AI từ xa để cải thiện độ chính xác mà không cần update script.

---

## 🔴 Giai đoạn 4: Management Platform (Quản trị tập trung)
*Mục tiêu: Theo dõi và điều phối toàn bộ hệ thống.*

- [ ] **4.1. Web Dashboard Admin**
  - [ ] Giao diện web riêng để quản trị viên theo dõi lượt sử dụng.
- [ ] **4.2. Push Notifications**
  - [ ] Gửi thông báo từ Admin xuống thẳng Widget của nhân viên.
- [ ] **4.3. Analytics & Reporting**
  - [ ] Thống kê số lượng hồ sơ đã xử lý và thời gian tiết kiệm được.

---

## 🚦 Trạng thái hiện tại:
- **Tiến độ tổng thể:** 50%
- **Giai đoạn đang thực hiện:** Giai đoạn 3
- **Cập nhật cuối:** 11/04/2026 (Hoàn thành Phase 2 - Team Collaboration)
