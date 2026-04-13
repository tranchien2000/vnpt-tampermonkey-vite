/**
 * @file fieldsManager.js
 * @desc Quản lý bảng fields (danh sách key-value-label-sync) trong VNPT Export Widget.
 *       Đã tối ưu: Sử dụng Storage utility, Reactive State (AppState.on), DOM Cache.
 */
import { logger } from '../utils/logger.js';
import { AppState } from '../core/state.js';
import {
    LOCAL_KEY_FIELDS, LOCAL_KEY_DEFAULT_FIELDS, LOCAL_KEY_POS,
    DEFAULT_LABELS, SK_TAX, SK_CALC_MAP, REQUIRED_KEYS,
    VALIDATION_REGEX
} from '../core/constants.js';
import { setPageField, setPageFieldsSequential } from '../utils/domHelper.js';
import { showToast } from '../ui/toast.js';
import { DEFAULT_DATA, DEFAULT_CALC_MAP } from '../core/defaults.js';
import { doFillData } from './dataFill/syncEngine.js';
import { Storage } from '../utils/storage.js';
import { mstService } from '../api/mstService.js';
import { createInternalBackup, restoreInternalBackup, getInternalBackups, exportFullBackup, deleteInternalBackup } from '../utils/backupHelper.js';
import { parseAddressComponents } from '../utils/stringHelper.js';
import { debounce } from '../utils/common.js';

// ─── Field Linker State ───
let _linkerCleanup = null;

/**
 * Kích hoạt chế độ Liên kết trực quan: user click vào element nào trên trang,
 * selector tốt nhất sẽ được điền vào ô f-key của row tương ứng.
 * @param {HTMLElement} row - Hàng field đang chọn
 * @param {HTMLInputElement} fKey - Ô input f-key cần cập nhật
 */
function startFieldLinker(row, fKey) {
    if (_linkerCleanup) _linkerCleanup(); // Hủy linker đang hoạt động nếu có

    const widget = AppState.widget;
    const linkBtn = row.querySelector('.btn-field-link');

    // ── Danh sách elements đã link (xanh lá) ──
    const existingEls = [];
    let lastHoverEl = null;

    /** Tìm element thực tế trên trang từ một selector string */
    const findElBySelector = (sel) => {
        if (!sel) return null;
        return document.getElementById(sel)
            || document.querySelector(`[formcontrolname="${CSS.escape(sel)}"]`)
            || document.querySelector(`[name="${CSS.escape(sel)}"]`)
            || document.querySelector(`[placeholder="${CSS.escape(sel)}"]`);
    };

    /** Highlight các elements đã có trong f-key với màu xanh lá (existing) */
    const showExistingLinks = () => {
        const parts = fKey.value.split(',').map(s => s.trim()).filter(s => s);
        parts.forEach(sel => {
            const el = findElBySelector(sel);
            if (el && !widget.contains(el) && !existingEls.includes(el)) {
                el.classList.add('vnpt-link-existing');
                existingEls.push(el);
            }
        });
    };

    const clearExistingHighlights = () => {
        existingEls.forEach(el => {
            el.classList.remove('vnpt-link-existing');
            el.classList.remove('vnpt-unlink-hover'); // Dọn cả state đỏ nếu đang hover
        });
        existingEls.length = 0;
    };

    // ── Đếm số sync selectors (trừ primary key) ──
    const getSyncCount = () => {
        const parts = fKey.value.split(',').map(s => s.trim()).filter(s => s);
        return Math.max(0, parts.length - 1);
    };

    // ── Banner live ──
    const banner = document.createElement('div');
    banner.className = 'vnpt-linking-banner';
    banner.style.pointerEvents = 'auto'; // Banner cần tương tác (nút Xong)

    const updateBanner = () => {
        const n = getSyncCount();
        const badge = n > 0
            ? `<span class="vnpt-link-count-badge">${n} link</span>`
            : '';
        banner.innerHTML = `
            🔗 <b>Liên kết đa điểm</b> ${badge}
            &nbsp;·&nbsp; <span style="font-size:10px;opacity:0.85;">🔵 Click = link &nbsp; 🔴 Click lại = bỏ link</span>
            &nbsp;·&nbsp; <button class="vnpt-link-done-btn">✅ Xong</button>
            &nbsp; <kbd>Esc</kbd>
        `;
        banner.querySelector('.vnpt-link-done-btn').onclick = (e) => {
            e.stopPropagation();
            cleanup(true);
        };
    };

    // ── Kích hoạt ──
    linkBtn.classList.add('active');
    document.body.classList.add('vnpt-linking-mode');
    widget.style.opacity = '0.15';
    widget.style.pointerEvents = 'none';
    widget.style.transition = 'opacity 0.3s';

    updateBanner();
    document.body.appendChild(banner);
    showExistingLinks(); // Tô màu ngay các links đã có

    // ── Trích xuất selector tốt nhất ──
    /** @param {Element} el */
    const getBestSelector = (el) => {
        // 1. Kiểm tra chính nó (Strong Keys)
        const strongKey = el.id || el.getAttribute('formcontrolname') || el.name || el.getAttribute('placeholder');
        if (strongKey) return strongKey;

        // 2. Nếu là Label (hoặc chứa text giống label), dùng InnerText
        const isLabel = el.tagName === 'LABEL' || el.classList.contains('label') || el.classList.contains('form-label');
        if (isLabel && el.innerText.trim()) return el.innerText.trim();

        // 3. Tìm xung quanh (Siblings / Parent) để lấy Label hoặc Wrapper ID
        let p = el.parentElement;
        let depth = 0;
        while (p && depth < 3) {
            // Thử tìm label anh em hoặc trong cha
            const lbl = p.querySelector('label, .label, .label-text, span.title, .form-label');
            if (lbl && lbl.innerText.trim()) return lbl.innerText.trim();

            // Thử lấy ID của cha nếu cha có vẻ là một wrapper định danh tốt
            if (p.id && !p.id.startsWith('ng-')) return p.id;

            p = p.parentElement;
            depth++;
        }

        // 4. Fallback: Tag + Class
        const cls = el.className && typeof el.className === 'string' ? el.className.trim().split(/\s+/)[0] : '';
        return el.tagName.toLowerCase() + (cls ? '.' + cls : '');
    };

    const LINKABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'SPAN', 'DIV', 'P', 'LABEL', 'BUTTON', 'TD', 'TH', 'SECTION']);

    // ── Hover highlight ──
    const onMouseOver = (e) => {
        const el = e.target;
        if (widget.contains(el) || banner.contains(el)) return;
        if (!LINKABLE_TAGS.has(el.tagName)) return;

        // Dọn state ở element cũ
        if (lastHoverEl && lastHoverEl !== el) {
            lastHoverEl.classList.remove('vnpt-link-highlight');
            lastHoverEl.classList.remove('vnpt-unlink-hover');
        }

        // Nếu là existing → đỏ (báo sẽ unlink), ngược lại → xanh (sẽ link)
        if (el.classList.contains('vnpt-link-existing')) {
            el.classList.add('vnpt-unlink-hover');
        } else {
            el.classList.add('vnpt-link-highlight');
        }
        lastHoverEl = el;
    };

    // ── Click để toggle link/unlink ──
    const onClick = (e) => {
        const el = e.target;
        if (widget.contains(el) || banner.contains(el)) return;

        e.preventDefault();
        e.stopPropagation();

        const selector = getBestSelector(el);
        const currentParts = fKey.value.split(',').map(s => s.trim()).filter(s => s);

        if (currentParts.includes(selector)) {
            // ── UNLINK: bỏ selector khỏi danh sách ──
            const newParts = currentParts.filter(p => p !== selector);
            fKey.value = newParts.join(', ');

            el.classList.remove('vnpt-link-existing');
            el.classList.remove('vnpt-unlink-hover');
            // Sau unlink, khôi phục highlight xanh (vẫn đang hover)
            el.classList.add('vnpt-link-highlight');
            const idx = existingEls.indexOf(el);
            if (idx !== -1) existingEls.splice(idx, 1);

            fKey.dispatchEvent(new Event('input', { bubbles: true }));
            updateBanner();
            showToast(`🔓 Đã bỏ "${selector}"`, '#ea4335');
        } else {
            // ── LINK: thêm selector vào danh sách (giữ TOÀN BỘ các phần hiện có) ──
            fKey.value = [...currentParts, selector].join(', ');

            el.classList.remove('vnpt-link-highlight');
            el.classList.add('vnpt-link-existing');
            if (!existingEls.includes(el)) existingEls.push(el);
            if (lastHoverEl === el) lastHoverEl = null;

            fKey.dispatchEvent(new Event('input', { bubbles: true }));
            updateBanner();
            showToast(`+🔗 "${selector}" — Click lại để bỏ | ✅ Xong`, '#198754');
        }
    };

    // ── Esc để hủy (hoàn tác thay đổi không?) ──
    const onKeydown = (e) => {
        if (e.key === 'Escape') {
            showToast('❌ Đã kết thúc liên kết', '#ffc107');
            cleanup(true); // Vẫn lưu những gì đã chọn được
        }
    };

    // ── Cleanup & finish ──
    const cleanup = (doSync = true) => {
        // Xóa tất cả hover classes ở element đang hover
        if (lastHoverEl) {
            lastHoverEl.classList.remove('vnpt-link-highlight');
            lastHoverEl.classList.remove('vnpt-unlink-hover');
        }
        clearExistingHighlights();

        linkBtn.classList.remove('active');
        document.body.classList.remove('vnpt-linking-mode');
        widget.style.opacity = '';
        widget.style.pointerEvents = '';
        if (banner.parentNode) banner.parentNode.removeChild(banner);

        if (doSync) {
            // Dispatch 'change' một lần duy nhất khi xong → syncThisRow()
            fKey.dispatchEvent(new Event('change', { bubbles: true }));
        }

        document.removeEventListener('mouseover', onMouseOver, true);
        document.removeEventListener('click', onClick, true);
        document.removeEventListener('keydown', onKeydown, true);
        _linkerCleanup = null;
    };

    document.addEventListener('mouseover', onMouseOver, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeydown, true);
    _linkerCleanup = cleanup;

    const initialCount = getSyncCount();
    showToast(
        initialCount > 0
            ? `🔗 Đang có ${initialCount} link — Click thêm hoặc ✅ Xong`
            : '🔗 Click vào elements để liên kết. ✅ Xong hoặc Esc khi hoàn tất.',
        '#f57f17'
    );
}


/**
 * Kiểm tra định dạng dữ liệu (MST, SĐT, Email)
 */
function validateField(key, value, inputEl) {
    let isValid = true;
    let regex = null;

    if (key === 'soDkdn') regex = VALIDATION_REGEX.MST;
    else if (key === 'sdt') regex = VALIDATION_REGEX.PHONE;
    else if (key === 'emailDaiDien') regex = VALIDATION_REGEX.EMAIL;

    if (regex && value.trim() !== "") {
        isValid = regex.test(value.trim());
    }

    if (!isValid) {
        inputEl.classList.add('field-error');
        inputEl.classList.add('vnpt-shake');
        setTimeout(() => inputEl.classList.remove('vnpt-shake'), 400);
    } else {
        inputEl.classList.remove('field-error');
    }
    return isValid;
}

/**
 * Làm mới trạng thái validation cho một hàng (Bắt buộc & Định dạng)
 * @param {HTMLElement} row - Hàng cần kiểm tra
 */
function refreshRowValidation(row) {
    const fKey = row.querySelector('.f-key');
    const fVal = row.querySelector('.f-val');
    if (!fKey || !fVal) return;

    const primaryKey = fKey.value.split(',')[0].trim();
    const value = fVal.value.trim();

    // 1. Kiểm tra Bắt buộc (Required)
    if (REQUIRED_KEYS.includes(primaryKey)) {
        if (!value) {
            fVal.classList.add('field-required-empty');
        } else {
            fVal.classList.remove('field-required-empty');
        }
    } else {
        fVal.classList.remove('field-required-empty');
    }

    // 2. Kiểm tra Định dạng (MST, SĐT, Email...)
    validateField(primaryKey, fVal.value, fVal);
}


function updateSyncDirIcon(btn, dir) {
    if (dir === 'both') {
        btn.textContent = '↔';
        btn.title = 'Đồng bộ 2 chiều (bảng ↔ form)';
        btn.setAttribute('data-dir', 'both');
    } else if (dir === 'down') {
        btn.textContent = '⬇';
        btn.title = 'Chỉ đồng bộ xuống: Bảng ➔ Form';
        btn.setAttribute('data-dir', 'down');
    } else if (dir === 'up') {
        btn.textContent = '⬆';
        btn.title = 'Chỉ đồng bộ lên: Form ➔ Bảng';
        btn.setAttribute('data-dir', 'up');
    }
}

export function addOrUpdateFieldRow(keyText, valueText, labelText = null, syncText = '', syncDir = null, isFromWebForm = false) {
    const hint = AppState.fieldsContainer.querySelector('.text-hint');
    if (hint) hint.remove();

    const existingInputs = AppState.fieldsContainer.querySelectorAll('.f-key');
    let isDuplicate = false;

    const incomingPK = keyText.split(',')[0].trim();

    for (let input of existingInputs) {
        const currentPK = input.value.split(',')[0].trim();
        if (currentPK === incomingPK) {
            const row = input.closest('.vnpt-field-row');
            const valueInput = row.querySelector('.f-val');
            const labelInput = row.querySelector('.f-label');
            const btnSyncDir = row.querySelector('.btn-sync-dir');
            const currentDir = btnSyncDir ? btnSyncDir.getAttribute('data-dir') : 'both';

            // Không cập nhật value nếu đây là cập nhật từ form web mà chiều sync bị chặn 'down'
            if (valueText !== null && valueInput.value !== valueText && document.activeElement !== valueInput) {
                if (!(isFromWebForm && currentDir === 'down')) {
                    valueInput.value = valueText;
                }
            }
            if (labelText !== null && labelText !== '' && labelInput.value !== labelText && document.activeElement !== labelInput) {
                labelInput.value = labelText;
            }
            if (syncText !== '' && input.value !== (keyText + ', ' + syncText) && document.activeElement !== input) {
                input.value = keyText + ', ' + syncText;
            }
            if (syncDir && btnSyncDir && btnSyncDir.getAttribute('data-dir') !== syncDir) {
                updateSyncDirIcon(btnSyncDir, syncDir);
            }

            // QUAN TRỌNG: Re-validate sau khi cập nhật
            refreshRowValidation(row);

            isDuplicate = true;
            break;
        }
    }

    if (!isDuplicate) {
        if (labelText === null || labelText === '') {
            labelText = DEFAULT_LABELS[keyText] || '';
        }

        const row = document.createElement('div');
        row.className = 'vnpt-field-row row-item';
        row.setAttribute('draggable', 'false');

        let displayKey = keyText;
        if (syncText) displayKey += ', ' + syncText;

        const primaryKey = incomingPK;

        row.innerHTML = `
            <input type="checkbox" id="chk-${primaryKey}" name="chk-${primaryKey}" class="row-chk" title="Chọn" style="margin: 0 2px 0 2px;" />
            <input type="text" id="lbl-${primaryKey}" name="lbl-${primaryKey}" class="f-label" value="${labelText}" />
            <input type="text" id="key-${primaryKey}" name="key-${primaryKey}" class="f-key" value="${displayKey}" title="Biến DOCX và IDs đồng bộ" />
            <button tabindex="-1" class="btn-sync-dir" title="Đồng bộ 2 chiều (bảng ↔ form)" data-dir="${syncDir || 'both'}">↔</button>
            <button class="btn-field-link" title="🔗 Click để liên kết với element trên trang (Esc để hủy)">🔗</button>
            ${primaryKey === 'soDkdn' ? `
                <div class="mst-lookup-wrapper">
                    <input type="text" id="val-${primaryKey}" name="val-${primaryKey}" class="f-val" value="${valueText}" placeholder="Mã số thuế..." />
                    <button class="btn-mst-lookup" title="Tra cứu Mã số thuế">
                        <span class="icon">🔍</span>
                        <div class="spinner"></div>
                    </button>
                </div>
            ` : `
                <input type="text" id="val-${primaryKey}" name="val-${primaryKey}" class="f-val" value="${valueText}" />
            `}
        `;
        const fVal = row.querySelector('.f-val');
        const fKey = row.querySelector('.f-key');

        if (keyText === 'tenToChuc') fVal.style.textAlign = 'right';

        const syncThisRow = async () => {
            const btnSync = row.querySelector('.btn-sync-dir');
            const currentDir = btnSync ? btnSync.getAttribute('data-dir') : 'both';
            if (currentDir === 'up') return; // Không đồng bộ từ Bảng xuống Form nếu chiều đồng bộ là 'up'

            const val = fVal.value;
            const targets = fKey.value.split(',').map(s => s.trim()).filter(s => s);
            // Sử dụng cơ chế tuần tự để xử lý địa chỉ
            await setPageFieldsSequential(targets, val);
        };

        const debouncedSyncRow = debounce(syncThisRow, 250);

        fKey.addEventListener('input', function () {
            saveFieldsToLocal();
            const firstKey = this.value.split(',')[0].trim();
            fVal.style.textAlign = firstKey === 'tenToChuc' ? 'right' : '';
        });
        fKey.addEventListener('change', function () {
            syncThisRow();
        });
        row.querySelector('.f-label').addEventListener('input', saveFieldsToLocal);

        fVal.addEventListener('input', function () {
            saveFieldsToLocal();
            refreshRowValidation(row);
            debouncedSyncRow();
        });
        fVal.addEventListener('change', function () {
            syncThisRow();
        });

        // MST Lookup button handler
        if (primaryKey === 'soDkdn') {
            const btnLookup = row.querySelector('.btn-mst-lookup');
            btnLookup.onclick = async () => {
                const mst = fVal.value.trim();
                if (!mst) {
                    showToast("⚠️ Vui lòng nhập mã số thuế", "#ffc107");
                    return;
                }

                btnLookup.classList.add('loading');
                try {
                    const info = await mstService.lookupMST(mst);
                    if (info) {
                        // Update current MST row (might have been normalized or cleaned)
                        fVal.value = mst;

                        // Find and update other linked fields
                        addOrUpdateFieldRow('tenToChuc', info.name);
                        addOrUpdateFieldRow('diaChi', info.address);

                        // Tách địa chỉ cho các trường riêng biệt
                        const parsed = parseAddressComponents(info.address);
                        addOrUpdateFieldRow('tinhIdNew', parsed.province);
                        addOrUpdateFieldRow('xaIdNew', parsed.ward || parsed.district);
                        addOrUpdateFieldRow('duong', parsed.street);

                        saveFieldsToLocal();
                        // Sync targeted fields to page: MST, Tên tổ chức, Địa chỉ, Tỉnh, Huyện, Xã, Đường
                        setTimeout(() => syncAllFields(['soDkdn', 'tenToChuc', 'diaChi', 'xaIdNew', 'xaHuyen', 'duong']), 300);

                        showToast(`✅ Đã tìm thấy: ${info.name}`, "#1a73e8");
                    } else {
                        showToast("❌ Không tìm thấy thông tin MST này", "#ea4335");
                    }
                } catch (err) {
                    showToast("❌ Lỗi khi tra cứu MST", "#ea4335");
                } finally {
                    btnLookup.classList.remove('loading');
                }
            };
        }

        // Initialize sync dir icon
        const initDir = syncDir || 'both';
        const btnSyncDir = row.querySelector('.btn-sync-dir');
        if (btnSyncDir) {
            updateSyncDirIcon(btnSyncDir, initDir);
            btnSyncDir.addEventListener('click', (e) => {
                e.preventDefault();
                let currentDir = btnSyncDir.getAttribute('data-dir');
                if (currentDir === 'both') currentDir = 'down';
                else if (currentDir === 'down') currentDir = 'up';
                else currentDir = 'both';
                updateSyncDirIcon(btnSyncDir, currentDir);
                saveFieldsToLocal();
            });
        }

        // Field Linker Button
        const linkBtn = row.querySelector('.btn-field-link');
        if (linkBtn) {
            linkBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                startFieldLinker(row, fKey);
            });
        }



        AppState.fieldsContainer.appendChild(row);


        AppState.fieldsContainer.scrollTop = AppState.fieldsContainer.scrollHeight;
    }
}

export function saveFieldsToLocal() {
    const key = AppState.isDefaultMode ? LOCAL_KEY_DEFAULT_FIELDS : LOCAL_KEY_FIELDS;
    const data = {};
    const rows = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row');
    rows.forEach(row => {
        const rawKeyInput = row.querySelector('.f-key').value.trim();
        const parts = rawKeyInput.split(',').map(s => s.trim()).filter(s => s);
        const k = parts[0];
        const s = parts.slice(1).join(', ');
        const l = row.querySelector('.f-label').value.trim();
        const v = row.querySelector('.f-val').value;
        const syncDirEl = row.querySelector('.btn-sync-dir');
        const syncDir = syncDirEl ? syncDirEl.getAttribute('data-dir') : 'both';
        if (k) data[k] = { label: l, value: v, sync: s, syncDir: syncDir };
    });
    // Sử dụng setDebounced để tránh ghi đĩa liên tục khi gõ phím
    Storage.setDebounced(key, data, 1000);

    // Nếu là chế độ mặc định, đồng bộ sang cả key của AutoFill Engine
    if (AppState.isDefaultMode) {
        import('../core/constants.js').then(({ SK_DATA_DEF }) => {
            Storage.setDebounced(SK_DATA_DEF, data, 1000);
        });
    }
}

/**
 * Lấy tên cho bản sao lưu: [Tên Đại Diện] - [Số HĐ]
 */
function getBackupName() {
    const data = Storage.get(AppState.isDefaultMode ? LOCAL_KEY_DEFAULT_FIELDS : LOCAL_KEY_FIELDS) || {};
    const org = data['tenToChuc']?.value || '';
    const name = data['tenDaiDienn']?.value || '';
    const contract = data['soHopDong']?.value || '';

    if (!org && !name && !contract) return `Bản sao lưu ${new Date().toLocaleString()}`;

    let label = org || name;
    if (contract) label += ` - ${contract}`;
    return label;
}

/**
 * Lấy tên file export JSON theo yêu cầu của USER: [Số HĐ] - [Tên tổ chức]
 */
function getExportFileName() {
    const data = Storage.get(AppState.isDefaultMode ? LOCAL_KEY_DEFAULT_FIELDS : LOCAL_KEY_FIELDS) || {};
    const contract = data['soHopDong']?.value || '';
    const org = data['tenToChuc']?.value || '';

    if (!contract && !org) return `Backup_VNPT_${new Date().toLocaleDateString().replace(/\//g, '-')}`;

    const parts = [];
    if (contract) parts.push(contract);
    if (org) parts.push(org);

    // Loại bỏ các ký tự không hợp lệ cho tên file (nếu có)
    return parts.join(' - ').replace(/[\\/:"*?<>|]/g, '_');
}

export function loadSavedData() {
    try {
        AppState.fieldsContainer.innerHTML = '';
        const savedFields = Storage.get(LOCAL_KEY_FIELDS) || {};

        // Load Default Labels first
        Object.keys(DEFAULT_LABELS).forEach(key => {
            const label = DEFAULT_LABELS[key];
            const saved = savedFields[key];
            if (saved && typeof saved === 'object') {
                addOrUpdateFieldRow(key, saved.value, saved.label || label, saved.sync || '', saved.syncDir || 'both');
            } else if (saved) {
                addOrUpdateFieldRow(key, saved, label, '', 'both');
            } else {
                addOrUpdateFieldRow(key, '', label, '', 'both');
            }
        });

        // Load other non-default fields
        Object.keys(savedFields).forEach(key => {
            if (!(key in DEFAULT_LABELS)) {
                const saved = savedFields[key];
                if (typeof saved === 'object') {
                    addOrUpdateFieldRow(key, saved.value, saved.label, saved.sync || '', saved.syncDir || 'both');
                } else {
                    addOrUpdateFieldRow(key, saved, '', '', 'both');
                }
            }
        });

        if (Object.keys(DEFAULT_LABELS).length === 0 && Object.keys(savedFields).length === 0) {
            AppState.fieldsContainer.innerHTML = '<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>';
        }

    } catch (e) {
        console.error('Error loading config:', e);
        Object.keys(DEFAULT_LABELS).forEach(key => addOrUpdateFieldRow(key, '', DEFAULT_LABELS[key]));
    }

    // Load Position
    const pos = Storage.get(LOCAL_KEY_POS);
    if (pos && AppState.widget) {
        AppState.widget.style.bottom = 'auto';
        if (pos.right) {
            AppState.widget.style.right = pos.right;
            AppState.widget.style.left = 'auto';
        } else if (pos.left) {
            AppState.widget.style.left = pos.left;
            AppState.widget.style.right = 'auto';
        }
        if (pos.top) AppState.widget.style.top = pos.top;
    }
}

export function initFieldsManager() {
    // Nút Ẩn/Hiện Mã ID
    document.getElementById('vnpt-btn-toggle-id').onclick = () => AppState.fieldsContainer.classList.toggle('show-ids');


    // Nút Clean Data / Reset hệ thống
    const btnCleanData = document.getElementById('vnpt-btn-clean-data');
    if (btnCleanData) {
        btnCleanData.onclick = () => {
            const isDefault = AppState.isDefaultMode;
            const msg = isDefault
                ? "BẠN ĐANG Ở CHẾ ĐỘ MẶC ĐỊNH.\nKhôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?"
                : "Dữ liệu hiện tại sẽ được Xóa. Bạn có muốn SAO LƯU nhanh trước khi làm sạch không?";

            if (confirm(msg)) {
                if (!isDefault) {
                    createInternalBackup(getBackupName()); // Tự động lưu Local History
                    Storage.remove(LOCAL_KEY_FIELDS);
                    showToast("🧹 Đã làm sạch & lưu bản cũ vào History", "#1a73e8");
                } else {
                    Storage.remove(LOCAL_KEY_DEFAULT_FIELDS);
                    showToast("🔄 Đã reset dữ liệu hệ thống VNPT", "#1a73e8");
                }

                Storage.remove(SK_CALC_MAP);
                Storage.remove(SK_TAX);



                if (isDefault) {
                    updateUIForDefaultMode(true);
                } else {
                    loadSavedData();
                }
            }
        };
    }

    // Nút Khôi phục bản gần nhất (Hiện danh sách)
    const btnRestore = document.getElementById('vnpt-btn-restore-last');
    const backupHistory = document.getElementById('vnpt-backup-history');

    if (btnRestore && backupHistory) {
        btnRestore.title = "Click để xem lịch sử sao lưu (Tối đa 10 bản)";

        // Click chuột trái: Hiện danh sách lịch sử (thay vì khôi phục nhanh như cũ)
        btnRestore.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const isShow = backupHistory.classList.toggle('show');
            if (isShow) {
                renderBackupHistory(backupHistory);
            }
        };

        // Click chuột phải: Vẫn giữ tính năng khôi phục bản gần nhất nếu muốn
        btnRestore.oncontextmenu = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const backups = getInternalBackups();
            if (backups.length > 0) {
                const latest = backups[0];
                if (confirm(`Khôi phục nhanh bản gần nhất?\n"${latest.name}"`)) {
                    if (restoreInternalBackup(latest.id)) {
                        if (AppState.isDefaultMode) AppState.isDefaultMode = false;
                        else loadSavedData();
                        backupHistory.classList.remove('show');
                    }
                }
            } else {
                showToast("⚠️ Chưa có bản sao lưu nào", "#ffc107");
            }
        };

        // Đóng danh sách khi click ra ngoài
        document.addEventListener('click', (e) => {
            if (backupHistory.classList.contains('show') && !backupHistory.contains(e.target) && !btnRestore.contains(e.target)) {
                backupHistory.classList.remove('show');
            }
        });
    } else {
        logger.error("❌ Fix UI: Could not find Restore button (#vnpt-btn-restore-last) or History container (#vnpt-backup-history).");
    }

    function renderBackupHistory(container) {
        const backups = getInternalBackups();
        container.innerHTML = `<div class="backup-history-header">📋 Local History (Max 10)</div>`;

        if (backups.length === 0) {
            container.innerHTML += '<div class="backup-history-empty">Chưa có lịch sử. Dữ liệu sẽ tự lưu khi bạn Quét hoặc Dọn dẹp!</div>';
            return;
        }

        backups.forEach((b) => {
            const item = document.createElement('div');
            item.className = 'backup-history-item';
            const timeStr = new Date(b.id * 1).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

            item.innerHTML = `
                <div class="backup-info">
                    <div class="backup-history-name" title="${b.name}">${b.name}</div>
                    <div class="backup-history-time">${timeStr}</div>
                </div>
                <div class="backup-actions">
                    <button class="btn-restore-action" title="Khôi phục">⏪</button>
                    <button class="btn-delete-action" title="Xóa bản này">🗑️</button>
                </div>
            `;

            // Khôi phục
            item.querySelector('.btn-restore-action').onclick = (e) => {
                e.stopPropagation();
                if (confirm(`Khôi phục dữ liệu từ bản: \n${b.name}?`)) {
                    if (restoreInternalBackup(b.id)) {
                        container.classList.remove('show');
                        if (AppState.isDefaultMode) AppState.isDefaultMode = false;
                        else loadSavedData();
                    }
                }
            };

            // Xoá
            item.querySelector('.btn-delete-action').onclick = (e) => {
                e.stopPropagation();
                if (confirm(`Xoá vĩnh viễn bản sao lưu:\n${b.name}?`)) {
                    deleteInternalBackup(b.id);
                    renderBackupHistory(container); // Refresh list
                    showToast("🗑️ Đã xoá bản sao lưu", "#ff5252");
                }
            };

            container.appendChild(item);
        });
    }

    // Nút chuyển chế độ mặc định
    document.getElementById('vnpt-btn-default').onclick = () => { AppState.isDefaultMode = !AppState.isDefaultMode; };

    // Register Listener cho isDefaultMode (Reactivity)
    AppState.on('isDefaultMode', (newVal) => updateUIForDefaultMode(newVal));

    // Reset dữ liệu mặc định (Đã gộp vào Clean Data)


    // Batch Xóa / Dọn dẹp
    document.getElementById('vnpt-btn-batch-del').onclick = (e) => {
        const rows = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row');
        const isDeleteMode = e.shiftKey; // Shift+Click = Xóa hàng, Click thường = Dọn giá trị
        let checkedCount = 0;

        // Xử lý các hàng được chọn qua checkbox
        rows.forEach(row => {
            if (row.querySelector('.row-chk')?.checked) {
                if (isDeleteMode) {
                    row.remove();
                } else {
                    const fVal = row.querySelector('.f-val');
                    if (fVal) fVal.value = "";
                }
                checkedCount++;
            }
        });

        if (checkedCount === 0) {
            // Lấy tên công ty để hiển thị thông báo
            const fields = Storage.get(AppState.isDefaultMode ? LOCAL_KEY_DEFAULT_FIELDS : LOCAL_KEY_FIELDS) || {};
            const orgName = fields['tenToChuc']?.value || "Dữ liệu hiện tại";
            const displayName = orgName.length > 25 ? orgName.substring(0, 25) + "..." : orgName;
            if (isDeleteMode) {
                // Shift+Click: Xóa toàn bộ hàng
                if (confirm(`Xóa TOÀN BỘ hàng dữ liệu của:\n"${orgName}"?\n\n(Hệ thống sẽ tự động lưu một bản vào History).`)) {
                    createInternalBackup(getBackupName());
                    rows.forEach(r => r.remove());
                    showToast(`🗑️ Đã xóa nội dung: ${displayName}`, "#ff5252");
                    saveFieldsToLocal();
                }
            } else {
                // Click thường: Dọn dẹp giá trị
                if (confirm(`Dọn dẹp TOÀN BỘ giá trị bảng của:\n"${orgName}"?\n\n(Hệ thống sẽ tự động lưu vào History).`)) {
                    createInternalBackup(getBackupName());

                    rows.forEach(row => {
                        const fVal = row.querySelector('.f-val');
                        if (fVal) fVal.value = "";
                    });

                    showToast(`🧹 Đã dọn dẹp: ${displayName}`, "#1a73e8");
                    saveFieldsToLocal();
                }
            }
        } else {
            // Thông báo kết quả cho các hàng được chọn
            const actionText = isDeleteMode ? "Xóa" : "Dọn giá trị";
            const icon = isDeleteMode ? "🗑️" : "🧹";
            showToast(`${icon} Đã ${actionText} ${checkedCount} trường`, isDeleteMode ? "#ff5252" : "#1a73e8");
            saveFieldsToLocal();
        }
    };

    // Thêm tay
    document.getElementById('vnpt-btn-add').onclick = () => {
        const uniqueNumber = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row').length + 1;
        addOrUpdateFieldRow('bien_moi_' + uniqueNumber, '', '', '');
        saveFieldsToLocal();
    };

    // Điền ngược (Reverse Fill)
    document.getElementById('vnpt-btn-fill-back').onclick = () => {
        syncAllFields();
    };
}

export async function syncAllFields(targetKeys = null) {
    if (!targetKeys) doFillData(); // Chỉ đồng bộ Tab Calc nếu là full sync

    let count = 0;
    const rows = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row');

    // Sử dụng vòng lặp tuần tự để hỗ trợ các trường phụ thuộc (Ajax)
    for (const row of rows) {
        const btnSync = row.querySelector('.btn-sync-dir');
        const currentDir = btnSync ? btnSync.getAttribute('data-dir') : 'both';
        if (currentDir === 'up') continue; // Bỏ qua nếu là Up (Form -> Table)

        const rawKeyInput = row.querySelector('.f-key').value.trim();
        const primaryKey = rawKeyInput.split(',')[0].trim();

        // Nếu có targetKeys, chỉ sync những hàng có primaryKey tương ứng
        if (targetKeys && !targetKeys.includes(primaryKey)) continue;

        const val = row.querySelector('.f-val').value;

        // Bỏ qua giá trị rỗng khi đồng bộ hàng loạt để tránh ghi đè làm mất Default Data vừa điền
        if (val === '') continue;

        const label = row.querySelector('.f-label').value.trim();
        const targets = rawKeyInput.split(',').map(x => x.trim()).filter(Boolean);

        // Bổ trợ: Nếu là dữ liệu mặc định hoặc ID đơn lẻ, thêm nhãn vào danh sách tìm kiếm
        if (label && !targets.includes(label)) {
            targets.push(label);
        }

        await setPageFieldsSequential(targets, val);
        if (targets.length > 0) count++;
    }

    if (!targetKeys) {
        count > 0 ? showToast(`✅ Đã đồng bộ ${count} hàng dữ liệu`, '#198754') : showToast(`⚠️ Không có trường nào để đồng bộ`, '#ffc107');
    }
}

function updateUIForDefaultMode(isDefault) {
    const btn = document.getElementById('vnpt-btn-default');

    AppState.fieldsContainer.innerHTML = '';
    AppState.bannerArea.innerHTML = '';

    if (isDefault) {
        btn.classList.add('active');
        btn.innerHTML = '✅ Chế độ: Dữ liệu mặc định';
        document.getElementById('vnpt-fields-container').classList.add('vnpt-mode-default');
        showToast("📌 Chế độ Dữ liệu mặc định (Có thể sửa)", "#ea4335");

        const banner = document.createElement('div');
        banner.className = 'vnpt-default-banner';
        banner.innerHTML = `<span style="color: red;"> LƯU Ý: ĐÂY LÀ DỮ LIỆU MẶC ĐỊNH</span>`;
        AppState.bannerArea.appendChild(banner);

        const overrides = Storage.get(LOCAL_KEY_DEFAULT_FIELDS);
        if (overrides === null) {
            Object.keys(DEFAULT_DATA).forEach(key => {
                const item = DEFAULT_DATA[key];
                const val = (item && typeof item === 'object') ? item.value : item;
                const lbl = (item && typeof item === 'object') ? item.label : (DEFAULT_LABELS[key] || '');
                const s = (item && typeof item === 'object' && item.sync) ? item.sync : '';
                const dir = (item && typeof item === 'object' && item.syncDir) ? item.syncDir : 'down'; // Mặc định bảng default ưu tiên đổ xuống form
                addOrUpdateFieldRow(key, val, lbl, s, dir);
            });
        } else {
            Object.keys(overrides).forEach(key => {
                const item = overrides[key];
                addOrUpdateFieldRow(key, item.value, item.label, item.sync || '', item.syncDir || 'both');
            });
        }

        // --- NEW: Hiển thị Mapping Calc trong Banner ---
        renderCalcMappingInBanner();
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '🛠 Dữ liệu mặc định VNPT';
        document.getElementById('vnpt-fields-container').classList.remove('vnpt-mode-default');
        showToast("📋 Đã quay lại Dữ liệu cá nhân");
        loadSavedData();
    }
}

/**
 * Hiển thị phần cấu hình Mapping Calc ngay trong vùng banner của Dữ liệu mặc định.
 */
function renderCalcMappingInBanner() {
    const section = document.createElement('div');
    section.className = 'vnpt-calc-mapping-default-section';
    section.style.cssText = 'border: 1px dashed var(--vnpt-primary); border-radius: 8px; padding: 8px; margin: 8px 0; background: rgba(26, 115, 232, 0.05);';

    section.innerHTML = `
        <div class="vnpt-calc-mapping-header" style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; user-select: none; padding: 2px 0;">
            <div class="util-submenu-title" style="margin: 0; color: #1a73e8; font-weight: 800; font-size: 10px; text-transform: uppercase;">🛠️ LIÊN KẾT Ô (MAPPING CALC)</div>
            <span class="toggle-icon" style="font-size: 10px; color: #1a73e8; transition: transform 0.2s;">▶</span>
        </div>
        <div class="vnpt-calc-mapping-body" style="display: none; margin-top: 8px; border-top: 1px dashed rgba(26, 115, 232, 0.2); padding-top: 8px;">
            <div class="vnpt-field-row" style="background: none; border: none; padding: 0; margin-bottom: 4px; gap: 8px;">
                <span style="min-width: 70px; font-size: 11px; font-weight: bold;">Trước thuế</span>
                <input data-clink="before" class="cw-map-input" style="flex: 1; height: 26px; font-size: 11px;" placeholder="Ví dụ: tong_tien_truoc_thue">
                <button class="btn-sync-dir" title="Đồng bộ 2 chiều (bảng ↔ form)" data-dir="both" style="height: 26px; width: 26px; flex-shrink: 0; padding: 0; line-height: 26px;">↔</button>
                <button class="btn-field-link" title="🔗 Link trực quan" style="height: 26px; width: 26px; flex-shrink: 0;">🔗</button>
            </div>
            <div class="vnpt-field-row" style="background: none; border: none; padding: 0; margin-bottom: 4px; gap: 8px;">
                <span style="min-width: 70px; font-size: 11px; font-weight: bold;">Tiền thuế</span>
                <input data-clink="tax" class="cw-map-input" style="flex: 1; height: 26px; font-size: 11px;" placeholder="Ví dụ: thue_gtgt">
                <button class="btn-sync-dir" title="Đồng bộ 2 chiều (bảng ↔ form)" data-dir="both" style="height: 26px; width: 26px; flex-shrink: 0; padding: 0; line-height: 26px;">↔</button>
                <button class="btn-field-link" title="🔗 Link trực quan" style="height: 26px; width: 26px; flex-shrink: 0;">🔗</button>
            </div>
            <div class="vnpt-field-row" style="background: none; border: none; padding: 0; margin-bottom: 4px; gap: 8px;">
                <span style="min-width: 70px; font-size: 11px; font-weight: bold;">Sau thuế</span>
                <input data-clink="after" class="cw-map-input" style="flex: 1; height: 26px; font-size: 11px;" placeholder="Ví dụ: tong_cong">
                <button class="btn-sync-dir" title="Đồng bộ 2 chiều (bảng ↔ form)" data-dir="both" style="height: 26px; width: 26px; flex-shrink: 0; padding: 0; line-height: 26px;">↔</button>
                <button class="btn-field-link" title="🔗 Link trực quan" style="height: 26px; width: 26px; flex-shrink: 0;">🔗</button>
            </div>
            <div class="vnpt-field-row" style="background: none; border: none; padding: 0; gap: 8px;">
                <span style="min-width: 70px; font-size: 11px; font-weight: bold;">Bằng chữ</span>
                <input data-clink="text" class="cw-map-input" style="flex: 1; height: 26px; font-size: 11px;" placeholder="Ví dụ: doc_tien">
                <button class="btn-sync-dir" title="Đồng bộ 2 chiều (bảng ↔ form)" data-dir="both" style="height: 26px; width: 26px; flex-shrink: 0; padding: 0; line-height: 26px;">↔</button>
                <button class="btn-field-link" title="🔗 Link trực quan" style="height: 26px; width: 26px; flex-shrink: 0;">🔗</button>
            </div>
        </div>
    `;

    const header = section.querySelector('.vnpt-calc-mapping-header');
    const body = section.querySelector('.vnpt-calc-mapping-body');
    const icon = section.querySelector('.toggle-icon');

    header.onclick = () => {
        const isHidden = body.style.display === 'none';
        body.style.display = isHidden ? 'block' : 'none';
        icon.innerText = isHidden ? '▼' : '▶';
    };

    const calcMaps = Storage.get(SK_CALC_MAP) || { ...DEFAULT_CALC_MAP };
    section.querySelectorAll('.vnpt-field-row').forEach(row => {
        const inp = row.querySelector('input[data-clink]');
        const btnSyncDir = row.querySelector('.btn-sync-dir');
        const linkBtn = row.querySelector('.btn-field-link');
        const k = inp.dataset.clink;

        const mapInfo = calcMaps[k] || [];
        const isLegacy = Array.isArray(mapInfo);
        const currentSync = isLegacy ? mapInfo : (mapInfo.sync || []);
        const currentDir = isLegacy ? 'both' : (mapInfo.syncDir || 'both');

        inp.value = currentSync.join(', ');
        if (btnSyncDir) {
            updateSyncDirIcon(btnSyncDir, currentDir);
            btnSyncDir.onclick = (e) => {
                e.preventDefault();
                let dir = btnSyncDir.getAttribute('data-dir');
                if (dir === 'both') dir = 'down';
                else if (dir === 'down') dir = 'up';
                else dir = 'both';
                updateSyncDirIcon(btnSyncDir, dir);
                saveMap();
            };
        }

        const saveMap = () => {
            const currentMaps = Storage.get(SK_CALC_MAP) || { ...DEFAULT_CALC_MAP };
            const syncs = inp.value.split(',').map(s => s.trim()).filter(Boolean);
            const dir = btnSyncDir ? btnSyncDir.getAttribute('data-dir') : 'both';
            currentMaps[k] = { sync: syncs, syncDir: dir };
            Storage.set(SK_CALC_MAP, currentMaps);
            showToast("✅ Đã cập nhật Mapping Calc hệ thống");
        };

        inp.onchange = saveMap;

        linkBtn.onclick = (e) => {
            e.stopPropagation();
            startFieldLinker(row, inp);
        };
    });

    AppState.bannerArea.appendChild(section);
}

