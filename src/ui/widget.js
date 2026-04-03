// src/ui/widget.js
import { AppState } from '../core/state.js';

export function initWidget() {
    const widget = document.createElement('div');
    widget.id = 'vnpt-docx-widget'; // Widget bọc ngoài cùng
    widget.innerHTML = `
        <div id="vnpt-export-panel">
            <div id="vnpt-panel-header" title="Kẹp chuột vào đây để di chuyển">
                <span>Trợ Lý Hợp Đồng VNPT</span>
                <span class="drag-icon"></span>
            </div>

            <div class="btn-row">
                <button class="vnpt-btn-action btn-scan" id="vnpt-btn-scan" title="Lấy data theo biểu mẫu web">🔍 Quét</button>
                <button class="vnpt-btn-action btn-toggle-id" id="vnpt-btn-toggle-id" title="Ẩn/Hiện Mã ID">👁 ID</button>
                <button class="vnpt-btn-action btn-add" id="vnpt-btn-add" title="Chèn thêm trường trống">➕ Thêm</button>
                <button class="vnpt-btn-action btn-clean" id="vnpt-btn-clean" title="Xóa dữ liệu các trường">🗑️ Clean</button>
            </div>

            <div id="vnpt-fields-container">
                <div class="text-hint">Bảng dữ liệu đang trống...</div>
            </div>

            <div class="bottom-export-row">
                <div class="vnpt-control-group">
                    <label title="2. Template Word mẫu">2. Template Word</label>
                    <input type="file" id="vnpt-template-file" accept=".docx" title="Chọn file mẫu DOCX" />
                </div>
                <div class="vnpt-control-group">
                    <label title="3. Tên file lưu lại">3. Tên file lưu lại</label>
                    <input type="text" id="vnpt-export-filename" value="HopDong_Auto.docx" />
                </div>
                <button class="vnpt-btn-action btn-export" id="vnpt-btn-export" title="Xuất ra file DOCX">🖨️</button>
            </div>
        </div>

        <button id="vnpt-toggle-btn" title="Mở UI Hợp đồng (Co/Kéo UI vào đây)">📄</button>
    `;
    document.body.appendChild(widget);

    AppState.widget = widget;
    AppState.panel = document.getElementById('vnpt-export-panel');
    AppState.toggleBtn = document.getElementById('vnpt-toggle-btn');
    AppState.header = document.getElementById('vnpt-panel-header');
    AppState.fieldsContainer = document.getElementById('vnpt-fields-container');

    // Đóng/Mở Panel kết hợp chống kích nhầm khi kéo thả
    AppState.toggleBtn.addEventListener('click', (e) => {
        if (AppState.hasDragged) { 
            e.preventDefault(); 
            return; 
        } // Nếu vừa kéo thả xong thì không Đóng/Mở

        if (AppState.panel.style.display === 'none' || AppState.panel.style.display === '') {
            AppState.panel.style.display = 'block';
            AppState.toggleBtn.innerHTML = '✖'; 
        } else {
            AppState.panel.style.display = 'none';
            AppState.toggleBtn.innerHTML = '📄';
        }
    });
}
