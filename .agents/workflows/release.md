---
description: Quy trình tự động hóa phát hành bản cập nhật (Bump version, Build, Commit, Pull Rebase, Push)
---

# Workflow: Fast Release (/release)

Sử dụng workflow này khi bạn muốn đẩy nhanh một bản cập nhật lên GitHub và thông báo cho người dùng.

## Luồng tự động (scripts/release.cjs)

```
Bump version → npm run build → git add . → git commit → git pull --rebase → git push
```

> [!IMPORTANT]
> Bước `git pull --rebase` được thực hiện **trước** khi push để tránh lỗi `non-fast-forward`.
> Nguyên nhân: GitHub Action `update-version.yml` tự tạo commit trên remote sau mỗi push,
> khiến local luôn bị tụt sau 1 commit nếu không rebase trước.

---

## Các bước thực hiện

### 1. Chuẩn bị
- Đảm bảo toàn bộ thay đổi code đã được **lưu**.
- Không cần chạy build thủ công — script sẽ tự build.

### 2. Chạy lệnh Release

```powershell
npm run release "Mô tả ngắn gọn thay đổi"
```

**Ví dụ:**
```powershell
npm run release "Sửa lỗi Field Linker trên trang VNPT"
npm run release "Thêm tính năng thông báo cập nhật"
```

> Nếu không truyền tham số, mặc định sẽ là `"Cập nhật tính năng mới"`.

### 3. Hệ thống tự động thực hiện

| Bước | Lệnh | Mô tả |
|------|------|-------|
| 1 | *(internal)* | Tăng patch version trong `package.json` (1.x.y → 1.x.y+1) |
| 2 | `npm run build` | Build lại `dist/myscript.user.js` bằng Vite |
| 3 | `git add .` | Stage toàn bộ thay đổi |
| 4 | `git commit` | Commit với format: `release: vX.Y.Z - <lời nhắn>` |
| 5 | `git pull --rebase origin main` | Đồng bộ commit từ GitHub Action trên remote |
| 6 | `git push` | Đẩy lên GitHub `main` |

### 4. Sau khi push

- **GitHub Action** (`update-version.yml`) sẽ chạy tự động trong ~30 giây.
- Action này đồng bộ `version.json` với version mới nhất từ `package.json`.
- `version.json` là nguồn mà script Tampermonkey dùng để kiểm tra cập nhật.

### 5. Kiểm tra kết quả

1. Vào **GitHub → Actions** để xác nhận Action chạy thành công (✅).
2. Truy cập `https://raw.githubusercontent.com/tranchien2000/vnpt-tampermonkey-vite/main/version.json` để xem version mới nhất.
3. Mở trang web đích (VNPT), F5 để thấy:
   - **Toast "🎉 Đã cập nhật"** nếu script vừa được cài bản mới.
   - **Badge "NEW"** trên tiêu đề widget nếu có bản mới hơn script đang chạy.

---

## Xử lý lỗi thường gặp

### ❌ `non-fast-forward` khi push
Script đã tự xử lý bằng `git pull --rebase`. Nếu vẫn xảy ra (do conflict):
```powershell
git pull --rebase origin main
git push
```

### ❌ Build lỗi (Vite error)
Kiểm tra lỗi syntax trong code, sửa xong chạy lại:
```powershell
npm run build
```

### ❌ `git commit` báo "nothing to commit"
Chưa có thay đổi nào hoặc đã commit thủ công. Bỏ qua và push:
```powershell
git push
```

---

## Lưu ý

- **`package.json` là "Source of Truth"** duy nhất cho version. Không sửa `version.json` thủ công.
- Mỗi lần release là **1 patch increment**. Nếu cần tăng minor/major, sửa `package.json` tay trước.
- Lời nhắn trong ngoặc kép sẽ xuất hiện trong commit message. Nên viết ngắn gọn, tiếng Việt.
