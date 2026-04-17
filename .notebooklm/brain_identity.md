# Project Identity & Memory
*Cập nhật: 18:44:19 17/4/2026*

## PROJECT_MEMORY.md

# VNPT Project Memory

File này lưu trữ các quyết định quan trọng, lỗi đặc thù và trạng thái dự án để AI luôn duy trì được bối cảnh giữa các phiên làm việc.

## 1. Mục tiêu hiện tại (Current Objective)

- [x] Tối ưu hóa hệ thống bộ nhớ dự án (Project Memory) để tiết kiệm token.
- [x] Triển khai logic "Học máy" (Address Learning) cho trường Đường.
- [x] Tích hợp bộ đọc mã QR CCCD nội bộ siêu tốc.
- [x] Tự động hóa và chuẩn hóa các trường dữ liệu Ngày/CCCD.
- [x] Tối ưu hóa dung lượng file build (Externalize libraries, Firestore Lite).
- [x] Hệ thống đo đếm Token Gemini tại Client.

## 2. Nhật ký Quyết định (Decision Log)

### 2026-04-15 (Latest)
- **Memory Optimization**: Nén Decision Log cũ, loại bỏ các mục trùng lặp để giảm context window cho AI.
- **Build Optimization**: Chuyển `pizzip`, `docxtemplater`, `jsqr` sang CDN. Chuyển sang Firestore Lite. Tắt minify nhưng giữ `keepNames: true` để ổn định logic.
- **CCCD QR & Mock Data**: Tích hợp quét QR CCCD offline (jsqr) và generator dữ liệu mẫu.
- **Address Learning**: Lưu trữ cặp `Địa chỉ gốc` -> `Đường đã sửa` giúp tự động hóa việc điền địa chỉ phức tạp.
- **UI Improvements**: Thêm chế độ Pinned (Ghim), tối ưu mượt Drag & Drop (60fps), refactor modular Styles và Fields Manager.
- **Token Tracker**: Theo dõi mức tiêu thụ token Gemini ngay tại client.

### Legacy Summary (v1.6.0 - v1.6.24)
- **Sync System**: Triển khai Reverse Sync (Page -> Widget), Real-time 2-way sync, và Sync Direction UI (icon SVG).
- **Automation**: Chuẩn hóa ngày tháng thông minh (`normalizeDate`) và validation CMND/CCCD.
- **Performance**: Tối ưu AJAX địa chỉ bằng Group-by-Rank. Tách file monolithic thành các module nhỏ (Styles, Fields).
- **Security**: Chuyển đổi storage API Key sang cơ chế text-security để tránh browser save password.

## 3. Lỗi đặc thù & Giải pháp (Technical Gotchas)

- **VNPT Selectors**: Các input trên trang VNPT thường không có ID cố định. Luôn ưu tiên dùng `placeholder` hoặc `label` text.
- **Address Learning Context**: Việc "học" địa chỉ phụ thuộc vào `sourceContext` (địa chỉ đầy đủ). Nếu mất context này, logic học sẽ không kích hoạt.
- **Build vs Dev Discrepancy**: Bản build nén có thể làm hỏng logic phụ thuộc vào `function.name`. Giải pháp: tắt `minify`.
- **Browser Password Manager**: Dùng `type="text"` + `-webkit-text-security: disc` để bypass thông báo "Save password".

## 4. Trạng thái các tính năng (Status Map)

- **AI Scanner**: Ổn định (PDF/Ảnh/Mail/Screen).
- **CCCD QR**: Ổn định (Offline).
- **Local History**: Ổn định (20 bản ghi).
- **Cloud Sync**: Ổn định (Firebase Lite).
- **Real-time Sync**: Hỗ trợ 2 chiều, hướng tùy chỉnh.

---
_Cập nhật lần cuối: 2026-04-15. AI cần đọc file này đầu tiên khi bắt đầu session._


---

## README.md

# VNPT Automation Tool — Tampermonkey Userscript (Vite)

> **Phiên bản:** 1.6.17 &nbsp;|&nbsp; **Build Tool:** Vite 5 &nbsp;|&nbsp; **Môi trường:** Tampermonkey / hopdong.vnpt.vn

Userscript tối ưu hóa và tự động hóa toàn bộ luồng quy trình nghiệp vụ trên hệ thống VNPT:
- **AI Multi-source Scanner**: Bóc tách dữ liệu thông minh từ PDF, Ảnh, Gmail, Outlook và Screen Capture thông qua Gemini AI.
- **Real-time 2-way Sync**: Động bộ dữ liệu hai chiều giữa Widget và Form web với quyền kiểm soát hướng (Sync Direction).
- **Xuất file DOCX**: Render tài liệu theo template chuyên nghiệp hỗ trợ cả Cloud (Google Drive) và Local.
- **Tính thuế & Phí**: Bộ công cụ Calc Widget thông minh, tự động điền kết quả vào các trường tương ứng trên trang.
- **Quản lý Lịch sử & Cloud Sync**: Lưu trữ an toàn 20 phiên làm việc gần nhất và đồng bộ dữ liệu qua Firebase.

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

... (lược bỏ) ...

---

