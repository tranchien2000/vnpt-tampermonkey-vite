# Project Architecture (Graphify Optimized)
*Cập nhật: 18:44:19 17/4/2026*

## graphify-out/GRAPH_REPORT.md



---

## docs/ARCHITECTURE.md

# Архіtecture Dự án VNPT

Cấu trúc luồng dữ liệu chính của dự án VNPT Tampermonkey Script:

```mermaid
graph TD;
  Core[Core (constants, state, defaults)] --> UI[UI (widget, styles)];
  UI --> Features[Features];
  Features --> Utils[Utils];
  Features -->|điền dữ liệu| DataFill[dataFill];
  Features -->|tạo file| DocExport[docExport];
```

## Các Module Chính
- **Core**: Xử lý trạng thái và hằng số toàn cục.
- **UI**: Thành phần Widget dạng Shadow DOM.
- **Features**: Các logic xử lý tự động điền form, và trích xuất PDF/DOC.
- **API/Storage**: Tính toán proxy và bộ lưu trữ Local/GM_getValue.

*(Tài liệu này sẽ được tự động đồng bộ bởi công cụ Graphify trong tương lai, nhưng cấu trúc gốc là Single Source of Truth cho các AI).*


---

