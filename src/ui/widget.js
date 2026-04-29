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
import { LOCAL_KEY_SIZE, LOCAL_KEY_OPENED, LOCAL_KEY_POS, SK_CALC_MAP, SK_HOTKEYS, APP_VERSION, LOCAL_KEY_PINNED } from '../core/constants.js';
import { DEFAULT_CALC_MAP, DEFAULT_HOTKEYS } from '../core/defaults.js';
import { exportConfig } from '../features/configManager.js';
import { Storage } from '../utils/storage.js';
import { exportFullBackup, importFullBackup, getInternalBackups, restoreInternalBackup } from '../utils/backupHelper.js';
import { startRecording, getHotkeyString } from '../features/hotkeys.js';
import { showToast } from './toast.js';
import { testGeminiConnection } from '../api/gemini.js';
import { initCloudSyncUI } from './components/CloudSyncUI.js';
import { RemoteConfig } from '../api/remoteConfig.js';
import { generateVNPTMockData } from '../features/mockDataGenerator.js';


export function initWidget() {
    const widget = document.getElementById('vnpt-docx-widget') || document.createElement('div');
    widget.id = 'vnpt-docx-widget'; // Widget bọc ngoài cùng
    // Khôi phục trạng thái mở/đóng và ghim
    const isOpened = Storage.get(LOCAL_KEY_OPENED) === true;
    const isPinned = Storage.get(LOCAL_KEY_PINNED) === true;

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
                    <button class="vnpt-btn-icon" id="vnpt-btn-pin" title="Ghim thu gọn UI (Tự mở khi di chuột)" style="margin-right:4px; font-size:12px; width:24px; height:24px; border:none; background:transparent;">${isPinned ? '📌' : '📎'}</button>
                    <span id="vnpt-panel-title">VNPT PRO</span>
                    <span class="vnpt-version">v${APP_VERSION}</span>
                    <span id="vnpt-update-badge-container"></span>
                </div>
                <div class="header-center">
                    <button class="vnpt-btn-action btn-ai" id="vnpt-btn-ai-mode" title="Mở bảng điều khiển AI Scanner">🤖 AI</button>
                    <button class="vnpt-btn-action btn-scan" id="vnpt-btn-scan" title="Lấy data theo biểu mẫu web">📊 Quét</button>
                    <button class="vnpt-btn-action btn-fill-back" id="vnpt-btn-fill-back" title="Điền dữ liệu ngược lên web">📝 Điền</button>
                    <input type="file" id="vnpt-pdf-input" accept=".pdf,image/*" style="display:none;" />
                </div>
                <div class="header-right">
                    <button class="vnpt-btn-icon btn-clean" id="vnpt-btn-batch-del" title="Dọn dẹp & Lưu vào History (Shift+Click để Xóa hàng)">🗑</button>
                    <div class="vnpt-restore-dropdown" style="position: relative; display: flex;">
                        <button class="vnpt-btn-icon btn-restore" id="vnpt-btn-restore-last" title="Khôi phục bản gần nhất">⏪</button>
                        <div id="vnpt-backup-history" class="vnpt-backup-history"></div>
                    </div>

                    <div class="vnpt-util-dropdown">
                        <button class="vnpt-btn-icon btn-more" id="vnpt-btn-more" title="Thêm công cụ">⚙️</button>
                        <div class="vnpt-util-menu" id="vnpt-util-menu">
                            <div class="util-config-container">
                                <!-- Nhóm 1: Hệ thống -->
                                <div class="util-section-mini">
                                    <div class="util-action-row">
                                        <button class="util-item-mini" id="vnpt-btn-default" title="Dữ liệu mặc định VNPT" style="flex: 1.2;">🏢 VNPT</button>
                                        <button class="util-item-mini danger" id="vnpt-btn-clean-data" title="Reset All" style="flex: 1;">🧹 Reset</button>
                                        <button class="vnpt-btn-icon btn-add" id="vnpt-btn-add" title="Chèn thêm trường trống" style="width:26px; height:26px; font-size:13px; border-radius:6px; background:#fff; border:1px solid #e0e0e0; flex-shrink: 0;">✚</button>
                                        <button class="vnpt-btn-icon" id="vnpt-btn-import-json" title="Nhập JSON" style="width:26px; height:26px; font-size:13px; border-radius:6px; background:#fff; border:1px solid #e0e0e0; flex-shrink: 0;">📥</button>
                                        <button class="vnpt-btn-icon" id="vnpt-btn-export-json" title="Xuất JSON" style="width:26px; height:26px; font-size:13px; border-radius:6px; background:#fff; border:1px solid #e0e0e0; flex-shrink: 0;">📤</button>
                                        <input type="file" id="vnpt-file-import-json" name="vnpt-file-import-json" accept=".json" style="display: none;">
                                    </div>
                                </div>

                                <!-- Nhóm 2: Giao diện -->
                                <div class="util-section-mini">
                                    <div class="util-row-compact">
                                        <span class="util-label-tiny">Cỡ:</span>
                                        <div class="size-options-tiny">
                                            <button data-size="S">S</button>
                                            <button data-size="M">M</button>
                                            <button data-size="L">L</button>
                                            <button data-size="Full">MAX</button>
                                        </div>
                                    </div>
                                    <div class="util-row-compact" style="margin-top: 6px;">
                                        <button id="vnpt-btn-toggle-advanced" class="util-btn-tiny" style="flex: 1; font-size: 10px; padding: 4px 8px;">
                                            🔧 Chế độ nâng cao
                                        </button>
                                    </div>
                                </div>

                                <!-- Nhóm 3: Cloud & AI -->
                                <div class="util-section-mini">
                                    <div id="vnpt-cloud-sync-container"></div>
                                    <div class="gemini-config-mini cw-row-mini" style="margin-top: 8px;">
                                        <input id="vnpt-gemini-key" type="text" placeholder="Gemini Key..." class="cw-input-mini sensitive-mask" style="flex: 1;">
                                        <select id="vnpt-gemini-model" class="cw-input-mini" style="width: 75px; flex-shrink: 0;">
                                            <option value="gemini-2.5-flash">2.5 Flash</option>
                                            <option value="gemini-2.5-flash-lite">2.5 Lite</option>
                                            <option value="gemini-3.1-flash-lite-preview">3.1 Lite</option>
                                        </select>
                                        <button class="util-btn-test-tiny" id="vnpt-btn-test-gemini" style="flex-shrink: 0; padding: 0 4px;">⚡</button>
                                    </div>
                                </div>

                                <!-- Nhóm 4: Phím tắt -->
                                <div class="util-section-mini">
                                    <div class="util-label-tiny" style="margin-bottom:4px;">PHÍM TẮT:</div>
                                    <div id="vnpt-hotkey-list" class="vnpt-hotkey-list-mini">
                                        <!-- Replaced by renderHotkeys -->
                                    </div>
                                </div>

                                <!-- Nhóm 5: Trợ giúp -->
                                <div class="util-section-mini">
                                    <button id="vnpt-btn-tips" class="util-btn-tiny" style="width: 100%; font-size: 11px; padding: 8px; background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%); color: white; font-weight: 700;">
                                        💡 Hướng Dẫn Sử Dụng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Inline Calculator Container -->
            <div id="vnpt-inline-calc"></div>

            <div id="vnpt-panel-body">
                <div id="vnpt-fields-container">
                    <!-- AI Scanner Section (Hidden by default) -->
                    <div id="vnpt-ai-scanner-section" class="vnpt-ai-scanner-section" style="display: none;">
                        <div class="ai-scanner-header" style="margin-bottom: -2px;">
                            <span class="ai-title">Xử lý tệp & Nhập văn bản:</span>
                        </div>
                        
                        <div class="ai-scan-row">
                            <div class="ai-queue-container" id="vnpt-ai-queue-container" title="Bấm để chọn file hoặc dán (Ctrl+V) file/ảnh vào đây">
                                <div class="ai-queue-placeholder" id="vnpt-ai-queue-placeholder">
                                    <span>📁</span>
                                    <span>Kéo thả / Ctrl+V</span>
                                </div>
                                <div class="ai-queue-list" id="vnpt-ai-queue-list"></div>
                            </div>

                            <textarea id="vnpt-raw-scan-input" placeholder="Nhập rác để quét tự động, HOẶC dùng @key để Copy thành Text Template..."></textarea>
                        </div>
                        
                        <div class="raw-scan-actions" style="display: flex; align-items: center; gap: 6px; padding: 4px; background: rgba(255,255,255,0.4); border-radius: 8px; margin-top: 4px; border: 1px solid rgba(0,0,0,0.03);">
                            <div style="display: flex; gap: 4px;">
                                <button class="vnpt-btn-icon" id="vnpt-btn-show-pdf" title="Xem lại Kết quả cũ" style="width:26px; height:26px; font-size:13px; border-radius:6px; background:#fff; border:1px solid #e0e0e0;">📝</button>
                                <button class="vnpt-btn-icon" id="vnpt-btn-export-txt" title="Copy chuỗi thành Text Template" style="width:26px; height:26px; font-size:13px; border-radius:6px; background:#fff; border:1px solid #e0e0e0;">📋</button>
                            </div>
                            
                            <div style="display: flex; gap: 6px; flex: 1;">
                                <button id="vnpt-btn-raw-process-local" class="vnpt-btn-confirm btn-local-process" title="Phân loại nhanh văn bản bằng offline Regex" style="height: 26px; padding: 0; font-size: 10px; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin: 0;">QR TEXT</button>
                                <button id="vnpt-btn-ai-process" class="vnpt-btn-confirm btn-ai-process" style="height: 26px; padding: 0; font-size: 10px; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin: 0;">QUÉT AI</button>
                            </div>
                            
                            <span id="vnpt-token-usage" title="Dung lượng AI đã dùng hôm nay (Reset lúc 0h)" style="font-size: 10px; color: #5f6368; font-weight: 700; white-space: nowrap; background: #f1f3f4; padding: 4px 8px; border-radius: 12px; border: 1px solid #e8eaed;">📊 0 tok</span>
                        </div>
                    </div>

                    <div id="vnpt-banner-area"></div>
                    
                    <div id="vnpt-fields-list">
                        <div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>
                    </div>
                </div>



                <div class="bottom-export-area">
                    <div id="vnpt-template-section">
                        <div id="vnpt-template-manager"></div>
                    </div>

                    <div class="bottom-export-row">
                        <input type="file" id="vnpt-template-file" name="vnpt-template-file" accept=".docx" style="display:none;" />
                        <div class="vnpt-control-group">
                            <label for="vnpt-template-file" class="btn-upload-local" title="Chọn file DOCX từ máy tính">📁</label>
                            <input type="text" id="vnpt-export-filename" name="vnpt-export-filename" value="Export_Auto.docx" title="Tên file DOCX khi xuất" />
                            <button class="vnpt-btn-action btn-export" id="vnpt-btn-export" title="Xuất ra file DOCX">🖨️ XUẤT</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tips Modal -->
        <div id="vnpt-tips-modal" class="vnpt-tips-modal" style="display: none;">
            <div class="vnpt-tips-content">
                <div class="vnpt-tips-header">
                    <h2>💡 Hướng Dẫn Sử Dụng VNPT PRO v${APP_VERSION}</h2>
                    <button class="vnpt-tips-close" id="vnpt-tips-close">✕</button>
                </div>
                <div class="vnpt-tips-body">
                    <div class="tips-section">
                        <h3>🎓 Tutorial Tương Tác</h3>
                        <ul>
                            <li><strong>Lần đầu sử dụng:</strong> Tutorial tự động hiện với hướng dẫn từng bước</li>
                            <li><strong>Highlight nhẹ:</strong> Vòng sáng xung quanh nút, không che khuất UI</li>
                            <li><strong>Arrow pointer:</strong> Mũi tên chỉ rõ vị trí cần click</li>
                            <li><strong>Xem lại:</strong> Click nút "🎓 Xem lại Tutorial" bên dưới</li>
                            <li><strong>Bỏ qua:</strong> Click nút ✕ hoặc click ra ngoài</li>
                        </ul>
                    </div>

                    <div class="tips-section">
                        <h3>🚀 Bắt Đầu Nhanh</h3>
                        <ul>
                            <li><strong>📊 Quét (Ctrl+Shift+S):</strong> Lấy dữ liệu từ form web vào bảng</li>
                            <li><strong>📝 Điền (Ctrl+Shift+F):</strong> Điền dữ liệu từ bảng lên form web</li>
                            <li><strong>📄 Export:</strong> Xuất file DOCX theo template</li>
                            <li><strong>🤖 AI:</strong> Quét PDF/Ảnh/Email bằng Gemini AI</li>
                        </ul>
                    </div>

                    <div class="tips-section">
                        <h3>🔐 Tài Khoản Cloud</h3>
                        <ul>
                            <li><strong>Đăng nhập:</strong> Click ☁️ → Nhập email/password</li>
                            <li><strong>Quên mật khẩu:</strong> Click "Quên mật khẩu?" → Nhận email reset</li>
                            <li><strong>Đổi avatar:</strong> Click vào avatar → Chọn ảnh (auto resize 200x200)</li>
                            <li><strong>📤 Push:</strong> Đẩy data lên cloud</li>
                            <li><strong>📥 Pull:</strong> Kéo data từ cloud về</li>
                        </ul>
                    </div>

                    <div class="tips-section">
                        <h3>🧮 Calc Widget (Tính Thuế)</h3>
                        <ul>
                            <li>Nhập <strong>Trước thuế</strong> hoặc <strong>Sau thuế</strong></li>
                            <li>Điều chỉnh thuế suất (%) nếu cần</li>
                            <li>Kết quả tự động: Trước thuế, Tiền thuế, Sau thuế, Bằng chữ</li>
                            <li>Click <strong>🔄</strong> để đồng bộ lên form</li>
                            <li><em>Lưu ý: Đã bỏ click-to-copy, giờ click để edit</em></li>
                        </ul>
                    </div>

                    <div class="tips-section">
                        <h3>⏪ Khôi Phục & Backup</h3>
                        <ul>
                            <li><strong>⏪:</strong> Khôi phục bản gần nhất</li>
                            <li><strong>Dropdown:</strong> Chọn từ 20 bản lưu gần nhất</li>
                            <li><strong>📤 Export JSON:</strong> Backup toàn bộ ra file</li>
                            <li><strong>📥 Import JSON:</strong> Khôi phục từ file backup</li>
                            <li>Tự động lưu khi click 🗑 Dọn dẹp</li>
                        </ul>
                    </div>

                    <div class="tips-section">
                        <h3>✅ Chế Độ Nâng Cao</h3>
                        <ul>
                            <li><strong>Checkbox:</strong> Chọn nhiều trường để xử lý hàng loạt</li>
                            <li><strong>↔ ↓ ↑:</strong> Điều khiển chiều đồng bộ (2-way, Widget→Form, Form→Widget)</li>
                            <li><strong>🔗 Linking Mode:</strong> Highlight các field đang sync</li>
                            <li><strong>Cột Key:</strong> Hiển thị biến DOCX (@key) và ID element</li>
                        </ul>
                    </div>

                    <div class="tips-section">
                        <h3>🔍 Tra Cứu MST</h3>
                        <ul>
                            <li>Nhập mã số thuế vào trường <strong>Mã số thuế | GPKD</strong></li>
                            <li>Click nút <strong>🔍</strong> bên phải</li>
                            <li>Thông tin doanh nghiệp tự động điền (Tên, Địa chỉ, Người đại diện)</li>
                            <li>Nguồn: Xinvoice API</li>
                        </ul>
                    </div>

                    <div class="tips-section">
                        <h3>🧹 Dọn Dẹp</h3>
                        <ul>
                            <li><strong>Click thường:</strong> Xóa giá trị (giữ hàng)</li>
                            <li><strong>Shift + Click:</strong> Xóa hẳn các hàng đã chọn</li>
                            <li>Tự động tạo bản backup trước khi xóa</li>
                        </ul>
                    </div>

                    <div class="tips-section">
                        <h3>📌 Widget Controls</h3>
                        <ul>
                            <li><strong>📌 Ghim:</strong> Thu gọn widget, tự động mở khi hover</li>
                            <li><strong>Resize:</strong> Kéo 4 góc để thay đổi kích thước</li>
                            <li><strong>Drag:</strong> Kéo header để di chuyển</li>
                            <li><strong>Size presets:</strong> S / M / L / MAX</li>
                            <li><em>Fix: Ghim widget không bị đóng khi chọn datalist</em></li>
                        </ul>
                    </div>

                    <div class="tips-section">
                        <h3>⌨️ Phím Tắt</h3>
                        <ul>
                            <li><strong>Ctrl+Shift+S:</strong> Quét dữ liệu</li>
                            <li><strong>Ctrl+Shift+F:</strong> Điền dữ liệu</li>
                            <li><strong>Ctrl+Shift+E:</strong> Export DOCX</li>
                            <li><strong>Ctrl+Shift+C:</strong> Dọn dẹp & backup</li>
                            <li><em>Có thể tùy chỉnh trong ⚙️ Settings</em></li>
                        </ul>
                    </div>

                    <div class="tips-section">
                        <h3>💡 Tips & Tricks</h3>
                        <ul>
                            <li><strong>Profiles:</strong> Tạo profile riêng cho từng chi nhánh</li>
                            <li><strong>Template:</strong> Upload template DOCX với placeholder @key</li>
                            <li><strong>AI Scanner:</strong> Hỗ trợ PDF, ảnh, Gmail, Outlook</li>
                            <li><strong>Cloud Sync:</strong> Đồng bộ cross-device qua Firebase</li>
                            <li><strong>History:</strong> Datalist tự động lưu giá trị đã nhập</li>
                            <li><strong>Validation:</strong> Tự động kiểm tra trường bắt buộc</li>
                        </ul>
                    </div>

                    <div class="tips-section">
                        <h3>🆕 Tính Năng Mới (v1.8.18)</h3>
                        <ul>
                            <li>✅ Reset password qua email</li>
                            <li>✅ Upload avatar (auto resize 200x200px)</li>
                            <li>✅ Data sync localStorage (userscript ↔ extension)</li>
                            <li>✅ Mutual exclusion (chỉ 1 bản chạy)</li>
                            <li>✅ Fix pinned panel datalist issue</li>
                            <li>✅ Bỏ click-to-copy ở calculator</li>
                        </ul>
                    </div>

                    <div class="tips-section">
                        <h3>📚 Tài Liệu & Hỗ Trợ</h3>
                        <ul>
                            <li><strong>README:</strong> <a href="https://github.com/tranchien2000/vnpt-tampermonkey-vite#readme" target="_blank">Hướng dẫn chi tiết</a></li>
                            <li><strong>Issues:</strong> <a href="https://github.com/tranchien2000/vnpt-tampermonkey-vite/issues" target="_blank">Báo lỗi</a></li>
                            <li><strong>Update:</strong> Script tự động kiểm tra phiên bản mới</li>
                        </ul>
                    </div>
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
    AppState.fieldsWrapper = document.getElementById('vnpt-fields-container');

    // Khôi phục kích thước bảng
    try {
        const savedSize = Storage.get(LOCAL_KEY_SIZE);
        if (savedSize && savedSize.width && savedSize.height) {
            AppState.panel.style.width = savedSize.width + 'px';
            AppState.panel.style.height = savedSize.height + 'px';
            if (savedSize.zoom) {
                AppState.panel.style.zoom = savedSize.zoom;
            }
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
                    height: Math.round(height + 20),
                    zoom: parseFloat(AppState.panel.style.zoom) || 1
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

    // Pin/Unpin Logic with focus-aware expansion
    const pinBtn = document.getElementById('vnpt-btn-pin');
    if (isPinned) AppState.panel.classList.add('vnpt-pinned');

    // Giữ panel mở khi đang focus vào input (để chọn datalist không bị đóng)
    let isPanelFocused = false;

    AppState.panel.addEventListener('focusin', () => {
        isPanelFocused = true;
        if (AppState.panel.classList.contains('vnpt-pinned')) {
            AppState.panel.classList.add('vnpt-pinned-expanded');
        }
    });

    AppState.panel.addEventListener('focusout', (e) => {
        // Delay để cho phép click vào datalist option
        setTimeout(() => {
            // Kiểm tra xem focus có còn trong panel không
            if (!AppState.panel.contains(document.activeElement)) {
                isPanelFocused = false;
                AppState.panel.classList.remove('vnpt-pinned-expanded');
            }
        }, 200);
    });

    pinBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentlyPinned = AppState.panel.classList.contains('vnpt-pinned');
        if (currentlyPinned) {
            AppState.panel.classList.remove('vnpt-pinned');
            AppState.panel.classList.remove('vnpt-pinned-expanded');
            Storage.set(LOCAL_KEY_PINNED, false);
            pinBtn.innerHTML = '📎';
            pinBtn.title = 'Ghim thu gọn UI (Tự mở khi di chuột)';
        } else {
            AppState.panel.classList.add('vnpt-pinned');
            Storage.set(LOCAL_KEY_PINNED, true);
            pinBtn.innerHTML = '📌';
            pinBtn.title = 'Bỏ ghim UI';
        }
    });

    const moreBtn = document.getElementById('vnpt-btn-more');
    const utilMenu = document.getElementById('vnpt-util-menu');
    const SIZE_PRESETS = {
        'S': { width: '380px', height: '420px', zoom: 0.9 },
        'M': { width: '460px', height: '600px', zoom: 1 },
        'L': { width: '620px', height: '800px', zoom: 1.15 },
        'Full': { width: '98vw', height: '92vh', zoom: 1.25 }
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
                    showToast("⏳ Đang thử kết nối...", "#1a73e8");

                    try {
                        await testGeminiConnection(key, model);
                        showToast("✅ Kết nối tới Gemini thành công!", "#1e8e3e");
                    } catch (err) {
                        showToast("❌ Kết nối thất bại: " + err, "#ea4335");
                    } finally {
                        btnTest.disabled = false;
                    }
                };
            }
        });
    }

    document.getElementById('vnpt-btn-export-json').onclick = () => exportFullBackup();

    const btnMockData = document.getElementById('vnpt-btn-mock-data');
    if (btnMockData) {
        btnMockData.onclick = () => {
            generateVNPTMockData();
            showToast("🎲 Đã sinh dữ liệu ảo (Mock Data) thành công!", "#9c27b0");
        };
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

    // Tips Modal
    const btnTips = document.getElementById('vnpt-btn-tips');
    const tipsModal = document.getElementById('vnpt-tips-modal');
    const tipsClose = document.getElementById('vnpt-tips-close');

    if (btnTips && tipsModal && tipsClose) {
        btnTips.onclick = (e) => {
            e.stopPropagation();
            tipsModal.style.display = 'flex';
            // Đóng menu Settings khi mở Tips
            if (utilMenu) {
                utilMenu.classList.remove('show');
                moreBtn.classList.remove('active');
            }
        };

        tipsClose.onclick = () => {
            tipsModal.style.display = 'none';
        };

        tipsModal.onclick = (e) => {
            if (e.target === tipsModal) {
                tipsModal.style.display = 'none';
            }
        };

        // Add "Show Tutorial Again" button
        const tipsBody = tipsModal.querySelector('.vnpt-tips-body');
        if (tipsBody) {
            const tutorialBtn = document.createElement('div');
            tutorialBtn.style.cssText = 'text-align: center; padding: 16px; border-top: 1px solid #e0e0e0; margin-top: 16px;';
            tutorialBtn.innerHTML = '<button id="vnpt-btn-restart-tutorial" style="padding: 10px 24px; background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600;">🎓 Xem lại Tutorial</button>';
            tipsBody.appendChild(tutorialBtn);

            const restartBtn = document.getElementById('vnpt-btn-restart-tutorial');
            if (restartBtn) {
                restartBtn.onclick = async () => {
                    tipsModal.style.display = 'none';
                    const { Tutorial } = await import('../features/tutorial.js');
                    const tutorial = new Tutorial();
                    tutorial.start();
                };
            }
        }

        // Close on Esc key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && tipsModal.style.display === 'flex') {
                tipsModal.style.display = 'none';
            }
        });
    }

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

    const closeUtilBtn = document.getElementById('vnpt-btn-close-util');
    if (closeUtilBtn) {
        closeUtilBtn.onclick = (e) => {
            e.stopPropagation();
            utilMenu.classList.remove('show');
            moreBtn.classList.remove('active');
        };
    }

    utilMenu.querySelectorAll('.size-options-tiny button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const sizeKey = e.target.getAttribute('data-size');
            const preset = SIZE_PRESETS[sizeKey];
            if (preset) {
                AppState.panel.style.width = preset.width;
                AppState.panel.style.height = preset.height;
                AppState.panel.style.zoom = preset.zoom;
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
                    height: AppState.panel.offsetHeight,
                    zoom: parseFloat(AppState.panel.style.zoom) || 1
                }, 500);
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });
    });


    // --- Cloud Sync UI ---
    const cloudContainer = document.getElementById('vnpt-cloud-sync-container');
    if (cloudContainer) {
        initCloudSyncUI(cloudContainer);
    }

    // --- Update Notification Logic ---
    function checkUpdateUI() {
        const container = document.getElementById('vnpt-update-badge-container');
        if (!container) return;

        if (RemoteConfig.hasUpdate()) {
            const badge = document.createElement('span');
            badge.className = 'vnpt-update-badge';
            badge.textContent = 'NEW';
            badge.title = `Có bản cập nhật mới v${RemoteConfig.info.latestVersion}. Click để xem!`;

            badge.onclick = (e) => {
                e.stopPropagation();
                if (RemoteConfig.info.updateUrl) {
                    window.open(RemoteConfig.info.updateUrl, '_blank');
                } else {
                    showToast(`Bản cập nhật v${RemoteConfig.info.latestVersion} đã sẵn sàng!`, "#1a73e8");
                }
            };

            container.innerHTML = '';
            container.appendChild(badge);
        }
    }

    // Kiểm tra ngay khi init và sau khi RemoteConfig refresh
    setTimeout(checkUpdateUI, 1000);
    // Lắng nghe RemoteConfig nếu có trigger (hiện tại RemoteConfig chưa có event emitter, nhưng setTimeout là đủ)

    // --- Token Tracker UI ---
    import('../utils/tokenTracker.js').then(({ TokenTracker }) => {
        const usageEl = document.getElementById('vnpt-token-usage');
        if (usageEl) {
            const updateUI = (tokens) => {
                const tokStr = tokens >= 1000 ? (tokens/1000).toFixed(1) + 'k' : tokens;
                usageEl.textContent = `📊 ${tokStr}`;
            };
            const usage = TokenTracker.getUsage();
            updateUI(usage.tokens);
            
            document.addEventListener('vnpt_usage_updated', (e) => {
                updateUI(e.detail.tokens);
            });
        }
    });
}
