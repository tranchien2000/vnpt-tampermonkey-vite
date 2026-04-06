/**
 * @file state.js
 * @desc Singleton AppState — lưu tham chiếu các DOM elements và trạng thái toàn cục.
 *       KHÔNG chứa logic — chỉ dùng để chia sẻ state giữa các module.
 * @exports AppState  — object singleton với các DOM refs và flags trạng thái
 * @seeAlso widget.js (khởi tạo DOM refs), dragDrop.js (dùng AppState.hasDragged)
 */
export const AppState = {
    // VNPT Docx Widget
    widget: null,
    panel: null,
    header: null,
    toggleBtn: null,
    fieldsContainer: null,

    // VNPT Calc Widget
    calcWidget: null,

    // Row reordering tracking
    draggedRowForVNPT: null,

    // VNPT Data display status
    isDefaultMode: false
};
