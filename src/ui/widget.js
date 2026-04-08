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
import { LOCAL_KEY_SIZE, LOCAL_KEY_OPENED, LOCAL_KEY_POS, SK_CALC_MAP } from '../core/constants.js';
import { DEFAULT_CALC_MAP } from '../core/defaults.js';
import { exportConfig } from '../features/configManager.js';
import { Storage } from '../utils/storage.js';
import { exportFullBackup, importFullBackup } from '../utils/backupHelper.js';

export function initWidget() {
    const widget = document.getElementById('vnpt-docx-widget') || document.createElement('div');
    widget.id = 'vnpt-docx-widget'; // Widget bọc ngoài cùng
    // Khôi phục trạng thái mở/đóng
    const isOpened = Storage.get(LOCAL_KEY_OPENED) === true;

    widget.innerHTML = `
        <button id="vnpt-toggle-btn" title="Mở/Đóng UI Hợp đồng" class="${isOpened ? 'btn-opened' : 'btn-closed'}">${isOpened ? '✖' : '📄'}</button>

        <div id="vnpt-export-panel" style="display: ${isOpened ? 'flex' : 'none'};">
            <!-- 4 Corner Resizers -->
            <div class="vnpt-resizer tl"></div>
            <div class="vnpt-resizer tr"></div>
            <div class="vnpt-resizer bl"></div>
            <div class="vnpt-resizer br"></div>

            <div id="vnpt-panel-header" title="Kẹp chuột vào đây để di chuyển">
                <div class="header-left">
                    <span id="vnpt-panel-title">VNPT PRO</span>
                </div>
                <div class="header-center">
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-scan" title="Lấy data theo biểu mẫu web">Quét dữ liệu</button>
                    <button class="vnpt-btn-action btn-fill-back" id="vnpt-btn-fill-back" title="Điền dữ liệu ngược lên web">Điền web</button>
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-toggle-id" title="Ẩn hiện key">Hiện/Ẩn Mã ID</button>
                </div>
                <div class="header-right">
                    <button class="vnpt-btn-icon btn-add" id="vnpt-btn-add" title="Chèn thêm trường trống">✚</button>
                    <button class="vnpt-btn-icon btn-clean" id="vnpt-btn-batch-del" title="Xóa chọn / Xóa tất cả">🗑</button>
                    
                    <div class="vnpt-util-dropdown">
                        <button class="vnpt-btn-icon btn-more" id="vnpt-btn-more" title="Thêm công cụ">⚙️</button>
                        <div class="vnpt-util-menu" id="vnpt-util-menu">
                            <div class="util-submenu-title">Cấu hình hệ thống</div>
                            <button class="util-item" id="vnpt-btn-default">🛠 Dữ liệu mặc định VNPT</button>
                            <button class="util-item danger" id="vnpt-btn-reset-default" >🔄 Khôi phục dữ liệu gốc</button>
                            
                            
                            <div class="util-separator"></div>
                            <div class="util-submenu-title">Liên kết ô (Mapping Calc)</div>
                            <div class="cw-row-map"><span>Trước thuế</span><input id="vnpt-map-before" name="vnpt-map-before" data-clink="before" class="cw-map-input"></div>
                            <div class="cw-row-map"><span>Tiền thuế</span><input id="vnpt-map-tax" name="vnpt-map-tax" data-clink="tax" class="cw-map-input"></div>
                            <div class="cw-row-map"><span>Sau thuế</span><input id="vnpt-map-after" name="vnpt-map-after" data-clink="after" class="cw-map-input"></div>
                            <div class="cw-row-map"><span>Bằng chữ</span><input id="vnpt-map-text" name="vnpt-map-text" data-clink="text" class="cw-map-input"></div>
                            
                            <div class="util-separator"></div>
                            <div class="util-submenu-title">Dữ liệu hệ thống</div>
                            <div class="util-action-row">
                                <button class="util-item-small" id="vnpt-btn-import-json">📥 Nhập JSON</button>
                                <button class="util-item-small" id="vnpt-btn-export-json">📤 Xuất JSON</button>
                                <input type="file" id="vnpt-file-import-json" name="vnpt-file-import-json" accept=".json" style="display: none;">
                            </div>

                            <div class="util-separator"></div>
                            <div class="util-submenu-title">Kích thước bảng:</div>
                            <div class="size-options">
                                <button data-size="S">S</button>
                                <button data-size="M">M</button>
                                <button data-size="L">L</button>
                                <button data-size="Full">Full</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Inline Calculator Container -->
            <div id="vnpt-inline-calc"></div>

            <div id="vnpt-panel-body">

                <div id="vnpt-banner-area"></div>
                <div id="vnpt-fields-container">
                    <div class="vnpt-fields-header">
                        <span class="h-chk"></span>
                        <span class="h-label">Tên Nhãn</span>
                        <span class="h-key">Biến / ID Web</span>
                        <span class="h-drag"></span>
                        <span class="h-val">Giá trị</span>
                    </div>
                    <div id="vnpt-fields-list">
                        <div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>
                    </div>
                </div>

                <!-- Template Manager -->
                <div id="vnpt-template-section">
                    <div id="vnpt-template-manager"></div>
                </div>

                <div class="bottom-export-row">
                    <div class="vnpt-control-group" id="vnpt-local-file-group">
                        <input type="file" id="vnpt-template-file" name="vnpt-template-file" accept=".docx" title="Hoặc sử dụng File nội bộ từ máy" />
                    </div>
                    <div class="vnpt-control-group">
                        <input type="text" id="vnpt-export-filename" name="vnpt-export-filename" value="Export_Auto.docx" title="Tên file DOCX khi xuất" />
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
    AppState.fieldsContainer = document.getElementById('vnpt-fields-list');

    // Khôi phục kích thước bảng
    try {
        const savedSize = Storage.get(LOCAL_KEY_SIZE);
        if (savedSize && savedSize.width && savedSize.height) {
            AppState.panel.style.width = savedSize.width + 'px';
            AppState.panel.style.height = savedSize.height + 'px';
        }
    } catch (e) { console.error('Lỗi load size panel:', e); }

    // Theo dõi và lưu kích thước bảng
    const resizeObserver = new ResizeObserver(entries => {
        if (AppState.panel.style.display === 'none') return;
        for (let entry of entries) {
            const { width, height } = entry.contentRect;
            if (width > 0 && height > 0) {
                Storage.setDebounced(LOCAL_KEY_SIZE, {
                    width: Math.round(width + 20),
                    height: Math.round(height + 20)
                }, 1000);
            }
        }
    });
    resizeObserver.observe(AppState.panel);

    AppState.panelBody = document.getElementById('vnpt-panel-body');

    renderTemplateManager(
        document.getElementById('vnpt-template-manager'),
        (arrayBuffer, name) => {
            AppState.templateBuffer = arrayBuffer;
            AppState.templateName = name;
        }
    );

    document.getElementById('vnpt-template-file').addEventListener('change', function () {
        const file = this.files && this.files[0];
        if (!file) return;
        const tmplContainer = document.getElementById('vnpt-template-manager');

        saveLocalTemplate(file, tmplContainer, (arrayBuffer, name) => {
            AppState.templateBuffer = arrayBuffer;
            AppState.templateName = name;
        });
        this.value = '';
    });

    // Đóng/Mở Panel 
    AppState.toggleBtn.addEventListener('click', (e) => {
        if (AppState.hasDragged) return;

        if (AppState.panel.style.display === 'none') {
            AppState.panel.style.display = 'flex';
            AppState.toggleBtn.className = 'btn-opened';
            AppState.toggleBtn.innerHTML = '✖';
            Storage.set(LOCAL_KEY_OPENED, true);
        } else {
            AppState.panel.style.display = 'none';
            AppState.toggleBtn.className = 'btn-closed';
            AppState.toggleBtn.innerHTML = '📄';
            Storage.set(LOCAL_KEY_OPENED, false);
        }
    });

    const moreBtn = document.getElementById('vnpt-btn-more');
    const utilMenu = document.getElementById('vnpt-util-menu');
    const SIZE_PRESETS = {
        'S': { width: '320px', height: '380px' },
        'M': { width: '440px', height: '600px' },
        'L': { width: '600px', height: '800px' },
        'Full': { width: '98vw', height: '92vh' }
    };

    const calcMaps = Storage.get(SK_CALC_MAP) || {};
    utilMenu.querySelectorAll('input[data-clink]').forEach(inp => {
        const k = inp.dataset.clink;
        const val = calcMaps[k] || DEFAULT_CALC_MAP[k] || [];
        inp.value = val.join(', ');

        inp.oninput = () => {
            const currentMaps = Storage.get(SK_CALC_MAP) || {};
            currentMaps[k] = inp.value.split(',').map(s => s.trim()).filter(s => s);
            Storage.set(SK_CALC_MAP, currentMaps);
        };
    });

    document.getElementById('vnpt-btn-export-json').onclick = () => exportFullBackup();
    const btnImport = document.getElementById('vnpt-btn-import-json');
    const fileImport = document.getElementById('vnpt-file-import-json');

    btnImport.onclick = () => fileImport.click();
    fileImport.onchange = async (e) => {
        if (e.target.files.length > 0) {
            const success = await importFullBackup(e.target.files[0]);
            if (success) setTimeout(() => location.reload(), 1500);
        }
    };

    moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isShow = utilMenu.classList.toggle('show');
        moreBtn.classList.toggle('active', isShow);
    });

    utilMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    document.addEventListener('click', (e) => {
        if (utilMenu.classList.contains('show')) {
            utilMenu.classList.remove('show');
            moreBtn.classList.remove('active');
        }
    });

    utilMenu.querySelectorAll('.size-options button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const sizeKey = e.target.getAttribute('data-size');
            const preset = SIZE_PRESETS[sizeKey];
            if (preset) {
                AppState.panel.style.width = preset.width;
                AppState.panel.style.height = preset.height;
            }
            utilMenu.classList.remove('show');
            moreBtn.classList.remove('active');
        });
    });

    // Custom Resizing 4 Corners
    const resizers = AppState.panel.querySelectorAll('.vnpt-resizer');
    resizers.forEach(resizer => {
        resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = AppState.panel.offsetWidth;
            const startHeight = AppState.panel.offsetHeight;
            const widgetRect = AppState.widget.getBoundingClientRect();
            const startTop = widgetRect.top;
            const startRight = window.innerWidth - widgetRect.right;

            AppState.panel.classList.add('vnpt-resizing');
            document.body.classList.add('vnpt-resizing-global');
            const cursor = window.getComputedStyle(resizer).cursor;
            document.body.style.cursor = cursor;

            const onMouseMove = (moveEvt) => {
                const dx = moveEvt.clientX - startX;
                const dy = moveEvt.clientY - startY;

                if (resizer.classList.contains('br')) {
                    AppState.panel.style.width = Math.max(360, startWidth + dx) + 'px';
                    AppState.panel.style.height = Math.max(250, startHeight + dy) + 'px';
                } else if (resizer.classList.contains('bl')) {
                    const newWidth = startWidth - dx;
                    if (newWidth > 360) {
                        AppState.panel.style.width = newWidth + 'px';
                    }
                    AppState.panel.style.height = Math.max(250, startHeight + dy) + 'px';
                } else if (resizer.classList.contains('tr')) {
                    AppState.panel.style.width = Math.max(360, startWidth + dx) + 'px';
                    const newHeight = startHeight - dy;
                    if (newHeight > 250) {
                        AppState.panel.style.height = newHeight + 'px';
                        AppState.widget.style.top = (startTop + dy) + 'px';
                    }
                } else if (resizer.classList.contains('tl')) {
                    const newWidth = startWidth - dx;
                    const newHeight = startHeight - dy;
                    if (newWidth > 360) {
                        AppState.panel.style.width = newWidth + 'px';
                    }
                    if (newHeight > 250) {
                        AppState.panel.style.height = newHeight + 'px';
                        AppState.widget.style.top = (startTop + dy) + 'px';
                    }
                }
            };

            const onMouseUp = () => {
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);

                AppState.panel.classList.remove('vnpt-resizing');
                document.body.classList.remove('vnpt-resizing-global');
                document.body.style.cursor = '';

                // Lưu vị trí và kích thước
                const isRightAnchor = AppState.widget.id === 'vnpt-docx-widget';
                Storage.setDebounced(LOCAL_KEY_POS, {
                    right: isRightAnchor ? AppState.widget.style.right : undefined,
                    top: AppState.widget.style.top,
                    x: isRightAnchor ? undefined : parseFloat(AppState.widget.style.left),
                    y: parseFloat(AppState.widget.style.top),
                }, 500);

                Storage.setDebounced(LOCAL_KEY_SIZE, {
                    width: AppState.panel.offsetWidth,
                    height: AppState.panel.offsetHeight
                }, 500);
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });
    });
}
