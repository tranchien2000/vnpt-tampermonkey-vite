---
description: Quy trình build và chạy server phát triển song song
---

// turbo-all

Để chạy toàn bộ môi trường development:

1. Dọn dẹp bản build cũ:
```cmd
rmdir /s /q dist
```

2. Chạy lệnh build và serve song song:
```cmd
npm run dev:all
```

Sau khi chạy thành công, script sẽ có tại `http://localhost:8788/myscript.user.js`.
