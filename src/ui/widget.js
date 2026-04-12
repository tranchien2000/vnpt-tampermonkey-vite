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
import { exportFullBackup, importFullBackup, getInternalBackups, restoreInternalBackup } from '../utils/backupHelper.js';
import { startRecording, getHotkeyString } from '../features/hotkeys.js';
import { SK_HOTKEYS } from '../core/constants.js';
import { DEFAULT_HOTKEYS } from '../core/defaults.js';
import { showToast } from './toast.js';
import { testGeminiConnection } from '../api/gemini.js';
import { toggleInspector } from '../features/selectorInspector.js';
import { initCloudSyncUI } from './components/CloudSyncUI.js';


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
                    <button class="vnpt-btn-action" id="vnpt-btn-ai-mode" title="Mở bảng điều khiển AI Scanner">AI Scanner</button>
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-scan" title="Lấy data theo biểu mẫu web">Quét dữ liệu</button>
                    <button class="vnpt-btn-action btn-fill-back" id="vnpt-btn-fill-back" title="Điền dữ liệu ngược lên web">Điền web</button>
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-toggle-id" title="Ẩn hiện key">ID</button>
                    <input type="file" id="vnpt-pdf-input" accept=".pdf,image/*" style="display:none;" />
                </div>
                <div class="header-right">
                    <button class="vnpt-btn-icon btn-add" id="vnpt-btn-add" title="Chèn thêm trường trống">✚</button>
                    <button class="vnpt-btn-icon btn-clean" id="vnpt-btn-batch-del" title="Dọn giá trị & Lưu JSON (Shift+Click để Xóa hàng)">🗑</button>
                    <div class="vnpt-restore-dropdown" style="position: relative; display: flex;">
                        <button class="vnpt-btn-icon btn-restore" id="vnpt-btn-restore-last" title="Khôi phục bản gần nhất">⏪</button>
                        <div id="vnpt-backup-history" class="vnpt-backup-history"></div>
                    </div>
                    
                    <button class="vnpt-btn-icon btn-inspect" id="vnpt-btn-inspect" title="Bật chế độ 'Soi' để bắt selector trường web">🔍</button>

                    <div class="vnpt-util-dropdown">
                        <button class="vnpt-btn-icon btn-more" id="vnpt-btn-more" title="Thêm công cụ">⚙️</button>
                        <div class="vnpt-util-menu" id="vnpt-util-menu">
                            <div class="util-config-grid">
                                <div class="util-column">
                                    <div class="util-submenu-title">Cấu hình hệ thống</div>
                                    <button class="util-item" id="vnpt-btn-default">Dữ liệu mặc định VNPT</button>
                                    <button class="util-item danger" id="vnpt-btn-clean-data" title="Xóa dữ liệu hoặc Reset cài đặt hệ thống">Dọn dẹp & Reset hệ thống</button>

                                    <div class="util-separator"></div>
                                    <div class="util-submenu-title">Dữ liệu hệ thống</div>
                                    <div class="util-action-row">
                                        <button class="util-item-small" id="vnpt-btn-import-json">Nhập JSON</button>
                                        <button class="util-item-small" id="vnpt-btn-export-json">Xuất JSON</button>
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
                                <div class="util-column vertical-separator">
                                    <div class="util-submenu-title">Cấu hình phím tắt</div>
                                    <div id="vnpt-hotkey-list" class="vnpt-hotkey-list">
                                        <!-- Replaced by renderHotkeys -->
                                    </div>
                                </div>
                            </div>
                                                        
                            <div class="util-separator"></div>
                            <div id="vnpt-cloud-sync-container"></div>

                            <div class="util-separator"></div>
                            <div class="util-submenu-title">Cấu hình AI OCR (Gemini)</div>
                            <div class="cw-row-map">
                                <span>API Key</span>
                                <input id="vnpt-gemini-key" type="password" placeholder="AIzaSy..." title="Lấy mã Key từ Google AI Studio" class="cw-map-input" autocomplete="off">
                            </div>
                            <div class="cw-row-map">
                                <span>Mô hình</span>
                                <select id="vnpt-gemini-model" class="cw-map-input">
                                    <optgroup label="Thế hệ 2.5 (Ổn định nhất)">
                                        <option value="gemini-2.5-flash" selected>Gemini 2.5 Flash (Cân bằng / Khuyên dùng)</option>
                                        <option value="gemini-2.5-pro">Gemini 2.5 Pro (Suy luận sâu / Thông minh)</option>
                                        <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash-Lite (Tốc độ cao / Tiết kiệm)</option>
                                    </optgroup>
                                    <optgroup label="Thế hệ 3.1 (Thử nghiệm)">
                                        <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview (Mới nhất)</option>
                                        <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash-Lite Preview</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div class="cw-row-map" style="margin-top: 4px; justify-content: flex-end;">
                                <button class="util-item-small" id="vnpt-btn-test-gemini" style="width: auto; padding: 4px 12px; background: var(--vnpt-primary-light); color: var(--vnpt-primary); border-color: var(--vnpt-primary);">⚡ Kiểm tra kết nối</button>
                            </div>


                        </div>
                    </div>
                </div>
            </div>

            <!-- Inline Calculator Container -->
            <div id="vnpt-inline-calc"></div>

            <div id="vnpt-panel-body">
                <!-- AI Scanner Section (Hidden by default) -->
                <div id="vnpt-ai-scanner-section" class="vnpt-ai-scanner-section" style="display: none;">
                    <div class="ai-scanner-header" style="margin-bottom: -2px;">
                        <span class="ai-title">Sử lý tệp & Nhập văn bản:</span>
                    </div>
                    
                    <div class="ai-scan-row">
                        <div class="ai-queue-container" id="vnpt-ai-queue-container" title="Bấm để chọn file hoặc dán (Ctrl+V) file/ảnh vào đây">
                            <div class="ai-queue-placeholder" id="vnpt-ai-queue-placeholder">
                                <span>📁</span>
                                <span>Kéo thả / Ctrl+V</span>
                            </div>
                            <div class="ai-queue-list" id="vnpt-ai-queue-list"></div>
                        </div>

                        <textarea id="vnpt-raw-scan-input" placeholder="Nội dung file sau khi quét sẽ xuất hiện ở đây để bạn kiểm tra, HOẶC bạn có thể dán trực tiếp Text vào đây để phân loại..."></textarea>
                    </div>
                    
                    <div class="raw-scan-actions">
                        <button class="vnpt-btn-icon" id="vnpt-btn-show-pdf" title="Xem lại Kết quả cũ">📝</button>
                        <button class="vnpt-btn-icon" id="vnpt-btn-clear-queue" title="Xóa hàng đợi & nội dung">🗑️</button>
                        <button class="vnpt-btn-icon" id="vnpt-btn-scan-mail" title="Trích xuất nội dụng Mail (Gmail/Outlook)">📧</button>
                        <button class="vnpt-btn-icon" id="vnpt-btn-scan-screen" title="Quét toàn bộ văn bản màn hình">🖥️</button>
                        <button id="vnpt-btn-raw-process-local" class="vnpt-btn-confirm btn-local-process" title="Phân loại nhanh văn bản bằng offline Regex">QR Text</button>
                        <button id="vnpt-btn-ai-process" class="vnpt-btn-confirm btn-ai-process">QUÉT AI</button>
                    </div>
                </div>

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

                <!-- Text Template Section -->
                <div id="vnpt-txt-section">
                    <div id="vnpt-txt-body" style="display:none;">
                        <textarea
                            id="vnpt-txt-template"
                            name="vnpt-txt-template"
                            placeholder="Nhập nội dung, dùng @key làm placeholder&#10;Ví dụ: Tôi là @tenDaiDienn chào bạn"
                            rows="4"
                        ></textarea>
                    </div>
                    <div class="vnpt-txt-header">
                        <span>📝 Text Template</span>
                        <button id="vnpt-txt-toggle" title="Ẩn/Hiện">▶</button>
                    </div>
                </div>

                <!-- Template Manager -->
                <div id="vnpt-template-section">
                    <div id="vnpt-template-manager"></div>
                </div>



                <div class="bottom-export-row">
                    <div class="vnpt-control-group" id="vnpt-local-file-group">
                        <input type="file" id="vnpt-template-file" name="vnpt-template-file" accept=".docx" style="display:none;" />
                        <label for="vnpt-template-file" class="btn-upload-local" title="Chọn file DOCX từ máy tính">📁</label>
                    </div>
                    <div class="vnpt-control-group">
                        <input type="text" id="vnpt-export-filename" name="vnpt-export-filename" value="Export_Auto.docx" title="Tên file DOCX khi xuất" />
                    </div>
                    <button class="vnpt-btn-action btn-export-txt" id="vnpt-btn-export-txt" title="Sao chép nội dung dựa trên Text Template">📋 COPY</button>
                    <button class="vnpt-btn-action btn-export" id="vnpt-btn-export" title="Xuất ra file DOCX">🖨️ XUẤT</button>
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
        'S': { width: '380px', height: '420px' },
        'M': { width: '460px', height: '600px' },
        'L': { width: '620px', height: '800px' },
        'Full': { width: '98vw', height: '92vh' }
    };



    const geminiKeyInput = document.getElementById('vnpt-gemini-key');
    const geminiModelSelect = document.getElementById('vnpt-gemini-model');


    if (geminiKeyInput && geminiModelSelect) {
        import('../core/constants.js').then(({ SK_GEMINI_KEY, SK_GEMINI_MODEL }) => {
            geminiKeyInput.value = Storage.get(SK_GEMINI_KEY) || '';
            const savedModel = Storage.get(SK_GEMINI_MODEL) || 'gemini-2.5-flash';
            // Cập nhật giá trị hiển thị để khớp với bộ nhớ mới
            let isModelExist = Array.from(geminiModelSelect.options).some(opt => opt.value === savedModel);
            geminiModelSelect.value = isModelExist ? savedModel : 'gemini-2.5-flash';

            geminiKeyInput.onchange = () => {
                Storage.set(SK_GEMINI_KEY, geminiKeyInput.value.trim());
            };
            geminiModelSelect.onchange = () => {
                Storage.set(SK_GEMINI_MODEL, geminiModelSelect.value);
            };

            // Nút kiểm tra kết nối
            const btnTest = document.getElementById('vnpt-btn-test-gemini');
            if (btnTest) {
                btnTest.onclick = async () => {
                    const key = geminiKeyInput.value.trim();
                    const model = geminiModelSelect.value;

                    if (!key) {
                        showToast("⚠️ Vui lòng nhập API Key trước khi thử", "#ffc107");
                        return;
                    }

                    btnTest.disabled = true;
                    btnTest.textContent = "⏳ Đang thử...";

                    try {
                        await testGeminiConnection(key, model);
                        showToast("✅ Kết nối tới Gemini thành công!", "#1e8e3e");
                    } catch (err) {
                        showToast("❌ Kết nối thất bại: " + err, "#ea4335");
                    } finally {
                        btnTest.disabled = false;
                        btnTest.textContent = "⚡ Kiểm tra kết nối";
                    }
                };
            }
        });
    }

    document.getElementById('vnpt-btn-export-json').onclick = () => exportFullBackup();

    // Toggle collapse Text Template section
    const txtToggleBtn = document.getElementById('vnpt-txt-toggle');
    const txtBody = document.getElementById('vnpt-txt-body');
    if (txtToggleBtn && txtBody) {
        txtToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isCollapsed = txtBody.style.display === 'none';
            txtBody.style.display = isCollapsed ? '' : 'none';
            txtToggleBtn.textContent = isCollapsed ? '▲' : '▶';
        });
    }

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

    // --- Hotkey Manager Logic ---
    function renderHotkeys() {
        const hotkeyList = document.getElementById('vnpt-hotkey-list');
        if (!hotkeyList) return;

        const hotkeys = Storage.get(SK_HOTKEYS, DEFAULT_HOTKEYS);
        hotkeyList.innerHTML = '';

        Object.entries(hotkeys).forEach(([action, config]) => {
            const row = document.createElement('div');
            row.className = 'vnpt-hotkey-row';
            row.innerHTML = `
                <span class="vnpt-hotkey-label">${config.label || action}</span>
                <button class="vnpt-hotkey-btn" data-action="${action}">${getHotkeyString(config)}</button>
            `;

            const btn = row.querySelector('.vnpt-hotkey-btn');
            btn.onclick = (e) => {
                e.stopPropagation();
                if (btn.classList.contains('recording')) return;

                btn.classList.add('recording');
                btn.textContent = 'Bấm phím...';

                startRecording(action, (newConfig) => {
                    btn.classList.remove('recording');
                    btn.textContent = getHotkeyString(newConfig);
                });
            };

            hotkeyList.appendChild(row);
        });
    }
    renderHotkeys();

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

    // --- Selector Inspector Logic ---
    const btnInspect = document.getElementById('vnpt-btn-inspect');
    if (btnInspect) {
        btnInspect.onclick = () => toggleInspector();

        // Cập nhật trạng thái nút bấm khi state thay đổi
        AppState.on('isInspecting', (val) => {
            btnInspect.classList.toggle('active', val);
        });
    }

    // --- Cloud Sync UI ---
    const cloudContainer = document.getElementById('vnpt-cloud-sync-container');
    if (cloudContainer) {
        initCloudSyncUI(cloudContainer);
    }
}
