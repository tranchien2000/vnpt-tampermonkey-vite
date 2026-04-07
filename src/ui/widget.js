/**
 * @file widget.js
 * @desc Khởi tạo giao diện chính của VNPT Export Widget (panel bên phải).
 *       Thiết lập layout HTML, quản lý trạng thái đóng/mở, lưu kích thước (ResizeObserver),
 *       và kết nối với các module: FieldsManager, TemplateManager.
 * @exports initWidget  — Tạo DOM, khôi phục state, và gán sự kiện đóng/mở panel
 * @seeAlso features/fieldsManager.js (bảng dữ liệu), features/templateManager.js (mẫu DOCX)
 */
import { AppState } from '../core/state.js';
import { renderTemplateManager, saveLocalTemplate } from '../features/templateManager.js';
import { initFieldsManager, loadSavedData } from '../features/fieldsManager.js';
import { LOCAL_KEY_SIZE, LOCAL_KEY_OPENED } from '../core/constants.js';
import { importConfig, exportConfig } from '../features/configManager.js';

export function initWidget() {
    const widget = document.createElement('div');
    widget.id = 'vnpt-docx-widget'; // Widget bọc ngoài cùng
    // Khôi phục trạng thái mở/đóng
    const isOpened = localStorage.getItem(LOCAL_KEY_OPENED) === 'true';

    widget.innerHTML = `
        <button id="vnpt-toggle-btn" title="Mở/Đóng UI Hợp đồng" class="${isOpened ? 'btn-opened' : 'btn-closed'}">${isOpened ? '✖' : '📄'}</button>

        <div id="vnpt-export-panel" style="display: ${isOpened ? 'flex' : 'none'};">
            <div id="vnpt-panel-header" title="Kẹp chuột vào đây để di chuyển">
                <span id="vnpt-panel-title">VNPT PRO</span>
                <div class="btn-row" style="margin-bottom: 0; padding-right: 35px; gap: 4px; position: relative;">
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-scan" title="Lấy data theo biểu mẫu web">Scan</button>
                    <button class="vnpt-btn-action btn-fill-back" id="vnpt-btn-fill-back" title="Điền dữ liệu ngược lên web">Điền thông tin</button>
                    
                    <button class="vnpt-btn-action btn-default-toggle" id="vnpt-btn-default" title="Dữ liệu mặc định VNPT">Mặc định</button>
                    <button class="vnpt-btn-action btn-toggle-id" id="vnpt-btn-toggle-id" title="Ẩn/Hiện Mã ID">Nhập key</button>
                    <button class="vnpt-btn-action btn-add" id="vnpt-btn-add" title="Chèn thêm trường trống">➕</button>
                    <button class="vnpt-btn-action btn-clean" id="vnpt-btn-batch-del" title="Xóa chọn / Xóa tất cả">🗑️</button>
                    <!-- Nút Xem thêm và Menu ẩn -->
                    <div style="position: relative; display: flex;">
                        <button class="vnpt-btn-action btn-more" id="vnpt-btn-more" title="Cấu hình & Tiện ích khác">⚙️</button>
                        <div id="vnpt-more-menu" class="vnpt-more-menu" style="display: none;">
                            <button class="vnpt-btn-action btn-reset-default" id="vnpt-btn-reset-default" title="Khôi phục dữ liệu gốc">Reset Default</button>
                            <button class="vnpt-btn-action btn-import" id="vnpt-btn-import" title="Nhập cấu hình JSON">📥 Nhập JSON</button>
                            <button class="vnpt-btn-action btn-export-json" id="vnpt-btn-export-json" title="Xuất cấu hình JSON">📤 Xuất JSON</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Inline Calculator Container -->
            <div id="vnpt-inline-calc"></div>

            <div id="vnpt-panel-body">

                <div id="vnpt-banner-area"></div>
                <div id="vnpt-fields-container">
                    <div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>
                </div>

                <!-- Template Manager -->
                <div id="vnpt-template-section">
                    <div id="vnpt-template-manager"></div>
                </div>

                <div class="bottom-export-row">
                    <div class="vnpt-control-group" id="vnpt-local-file-group">
                        <input type="file" id="vnpt-template-file" accept=".docx" title="Hoặc sử dụng File nội bộ từ máy" />
                    </div>
                    <div class="vnpt-control-group">
                        <input type="text" id="vnpt-export-filename" value="Export_Auto.docx" placeholder="Tên file HD xuất..." title="Tên file HD xuất" />
                    </div>
                    <button class="vnpt-btn-action btn-export" id="vnpt-btn-export" title="Xuất ra file DOCX">🖨️ XUẤT FILE</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(widget);

    AppState.widget = widget;
    AppState.panel = document.getElementById('vnpt-export-panel');
    AppState.toggleBtn = document.getElementById('vnpt-toggle-btn');
    AppState.header = document.getElementById('vnpt-panel-header');
    AppState.bannerArea = document.getElementById('vnpt-banner-area');
    AppState.fieldsContainer = document.getElementById('vnpt-fields-container');

    // Khôi phục kích thước bảng
    try {
        const savedSize = JSON.parse(localStorage.getItem(LOCAL_KEY_SIZE));
        if (savedSize && savedSize.width && savedSize.height) {
            AppState.panel.style.width = savedSize.width + 'px';
            AppState.panel.style.height = savedSize.height + 'px';
        }
    } catch (e) {
        console.error('Lỗi load size panel:', e);
    }

    // Theo dõi và lưu kích thước bảng
    const resizeObserver = new ResizeObserver(entries => {
        if (AppState.panel.style.display === 'none') return;
        for (let entry of entries) {
            const { width, height } = entry.contentRect;
            // Chỉ lưu nếu thực sự có kích thước (tránh lúc display:none)
            if (width > 0 && height > 0) {
                // Debounce nhẹ bằng cách dùng timeout hoặc cứ lưu vì resize native không nhạy quá mức
                localStorage.setItem(LOCAL_KEY_SIZE, JSON.stringify({
                    width: Math.round(width + 20), // + padding
                    height: Math.round(height + 20) // + padding
                }));
            }
        }
    });
    resizeObserver.observe(AppState.panel);

    AppState.panelBody = document.getElementById('vnpt-panel-body');

    // Render template manager — khi user chọn template từ URL, lưu buffer vào AppState
    renderTemplateManager(
        document.getElementById('vnpt-template-manager'),
        (arrayBuffer, name) => {
            AppState.templateBuffer = arrayBuffer;
            AppState.templateName = name;
        }
    );

    // Khi chọn file local → lưu dạng base64 vào localStorage
    document.getElementById('vnpt-template-file').addEventListener('change', function () {
        const file = this.files && this.files[0];
        if (!file) return;
        const tmplContainer = document.getElementById('vnpt-template-manager');

        saveLocalTemplate(file, tmplContainer, (arrayBuffer, name) => {
            AppState.templateBuffer = arrayBuffer;
            AppState.templateName = name;
        });
        this.value = ''; // Reset để có thể chọn lại cùng file
    });

    // Đóng/Mở Panel 
    AppState.toggleBtn.addEventListener('click', (e) => {
        if (AppState.hasDragged) {
            // Bỏ qua click nếu vừa kéo thả xong
            return;
        }

        if (AppState.panel.style.display === 'none') {
            // Mở panel
            AppState.panel.style.display = 'flex';
            AppState.toggleBtn.className = 'btn-opened';
            AppState.toggleBtn.innerHTML = '✖';
            localStorage.setItem(LOCAL_KEY_OPENED, 'true');
        } else {
            // Đóng panel
            AppState.panel.style.display = 'none';
            AppState.toggleBtn.className = 'btn-closed';
            AppState.toggleBtn.innerHTML = '📄';
            localStorage.setItem(LOCAL_KEY_OPENED, 'false');
        }
    });

    // Sự kiện Import / Export
    document.getElementById('vnpt-btn-import').onclick = (e) => {
        importConfig(e);
        document.getElementById('vnpt-more-menu').style.display = 'none';
    };
    document.getElementById('vnpt-btn-export-json').onclick = (e) => {
        exportConfig(e);
        document.getElementById('vnpt-more-menu').style.display = 'none';
    };

    // Toggle menu "Xem thêm"
    const btnMore = document.getElementById('vnpt-btn-more');
    const moreMenu = document.getElementById('vnpt-more-menu');
    btnMore.onclick = (e) => {
        e.stopPropagation();
        const isHidden = moreMenu.style.display === 'none';
        moreMenu.style.display = isHidden ? 'flex' : 'none';
        btnMore.classList.toggle('active', isHidden);
    };

    // Click ra ngoài để đóng menu
    document.addEventListener('click', () => {
        moreMenu.style.display = 'none';
        btnMore.classList.remove('active');
    });
}
