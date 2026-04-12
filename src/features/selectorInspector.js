/**
 * @file selectorInspector.js
 * @desc Công cụ "Soi" trường dữ liệu (Selector Inspector).
 *       Giúp người dùng bắt ID/Name/FormControlName bằng cách di chuột và click trực tiếp trên web.
 */
import { AppState } from '../core/state.js';
import { addOrUpdateFieldRow, saveFieldsToLocal } from './fieldsManager.js';
import { showToast } from '../ui/toast.js';

let lastElement = null;
let _captureCount = 0;

export function toggleInspector() {
    AppState.isInspecting = !AppState.isInspecting;

    if (AppState.isInspecting) {
        _captureCount = 0;
        startInspecting();
    } else {
        stopInspecting();
    }
}

function startInspecting() {
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown, true);
    document.body.classList.add('vnpt-inspecting-mode');

    // Giảm độ mờ widget để dễ soi
    if (AppState.widget) {
        AppState.widget.style.opacity = '0.15';
        AppState.widget.style.pointerEvents = 'none';
        AppState.widget.style.transition = 'opacity 0.3s';
    }

    renderInspectorBanner();
    showToast("🔍 Chế độ Soi: Đang bật. Hãy Click vào các ô nhập liệu trên trang.", "#1a73e8");
}

function stopInspecting() {
    document.removeEventListener('mouseover', handleMouseOver, true);
    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('keydown', handleKeyDown, true);
    document.body.classList.remove('vnpt-inspecting-mode');
    
    if (AppState.widget) {
        AppState.widget.style.opacity = '';
        AppState.widget.style.pointerEvents = '';
    }

    const banner = document.getElementById('vnpt-inspector-banner');
    if (banner) banner.remove();

    if (lastElement) {
        lastElement.classList.remove('vnpt-inspect-highlight');
        lastElement = null;
    }
    
    AppState.isInspecting = false;
    // Trigger reset trạng thái nút bấm ở UI
    AppState.trigger('isInspecting', false);
}

function renderInspectorBanner() {
    let banner = document.getElementById('vnpt-inspector-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'vnpt-inspector-banner';
        banner.className = 'vnpt-linking-banner'; // Dùng chung style với Linker
        banner.style.background = 'linear-gradient(135deg, #f57f17 0%, #e65100 100%)';
        banner.style.boxShadow = '0 8px 28px rgba(245, 127, 23, 0.5)';
        document.body.appendChild(banner);
    }

    banner.innerHTML = `
        🔍 <b>Chế độ Soi (Capture)</b> &nbsp; [${_captureCount} trường]
        &nbsp;·&nbsp; <span style="font-size:10px;opacity:0.9;">Bấm vào ô web để thêm vào bảng</span>
        &nbsp;·&nbsp; <button class="vnpt-link-done-btn" id="vnpt-btn-inspect-done">✅ Xong</button>
        &nbsp; <kbd>Esc</kbd>
    `;

    document.getElementById('vnpt-btn-inspect-done').onclick = (e) => {
        e.stopPropagation();
        stopInspecting();
        showToast(`✅ Đã bắt xong ${_captureCount} trường!`);
    };
}

function handleKeyDown(e) {
    if (e.key === 'Escape') {
        stopInspecting();
        showToast("🔍 Đã tắt chế độ Soi.");
    }
}

function handleMouseOver(e) {
    if (!AppState.isInspecting) return;
    
    // Tìm các phần tử có khả năng là target
    const target = e.target.closest('input, select, textarea, [role="textbox"], .form-control, ng-select2, label');
    if (!target) {
        if (lastElement) {
            lastElement.classList.remove('vnpt-inspect-highlight');
            lastElement = null;
        }
        return;
    }

    if (lastElement && lastElement !== target) {
        lastElement.classList.remove('vnpt-inspect-highlight');
    }

    target.classList.add('vnpt-inspect-highlight');
    lastElement = target;
}

function handleClick(e) {
    if (!AppState.isInspecting) return;

    // Bỏ qua nếu click vào chính Widget hoặc Banner
    if (e.target.closest('#vnpt-docx-widget') || e.target.closest('#vnpt-inspector-banner')) return;

    e.preventDefault();
    e.stopPropagation();

    const target = e.target.closest('input, select, textarea, [role="textbox"], .form-control, ng-select2, label');
    if (!target) return;

    // Phân tích thông tin phần tử
    const info = extractElementInfo(target);
    const value = target.value || target.innerText || '';
    
    if (info.key) {
        addOrUpdateFieldRow(info.key, value, info.label || info.key);
        saveFieldsToLocal();
        _captureCount++;
        renderInspectorBanner();
        showToast(`+ capture: ${info.label || info.key}`, "#f57f17");
    } else {
        showToast("⚠️ Không tìm thấy ID/FormControlName cố định.", "#ffc107");
    }
}

/**
 * Logic chiết xuất thông tin thông minh hơn
 */
function extractElementInfo(el) {
    let key = '';
    let label = '';

    // Ưu tiên 1: Strong identifiers
    const strongKey = el.getAttribute('formcontrolname') || el.id || el.getAttribute('name') || el.getAttribute('placeholder');
    if (strongKey && !strongKey.includes('ng-')) {
        key = strongKey;
    }

    // Ưu tiên 2: Nếu là Label, tìm input nó trỏ tới
    if (el.tagName === 'LABEL') {
        label = el.innerText.trim();
        const inputId = el.getAttribute('for');
        const input = inputId ? document.getElementById(inputId) : el.querySelector('input, select, textarea');
        if (input) {
            key = input.getAttribute('formcontrolname') || input.id || input.getAttribute('name') || '';
        }
    } else {
        // Tìm label xung quanh
        label = findLabelText(el);
    }

    // Fallback key: Dùng chính label nếu không tìm thấy key kỹ thuật
    if (!key && label) {
        key = label.replace(/[:*]/g, '').trim();
    }

    return { 
        key: key.replace(/[:*]/g, '').trim(), 
        label: label.replace(/[:*]/g, '').trim() 
    };
}

function findLabelText(el) {
    // 1. Kiểm tra thuộc tính aria-label hoặc placeholder
    const hint = el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.title;
    if (hint) return hint;

    // 2. Tìm label trỏ tới ID của input này
    if (el.id) {
        const lbl = document.querySelector(`label[for="${el.id}"]`);
        if (lbl) return lbl.innerText.trim();
    }

    // 3. Tìm trong cha gần nhất có chứa text (vd: form-group)
    const container = el.closest('.form-group, .row, .col, .field-wrapper, td');
    if (container) {
        const lbl = container.querySelector('label, .control-label, span.title');
        if (lbl) return lbl.innerText.trim();
    }

    // 4. Tìm thẻ label bọc ngoài
    const parentLabel = el.closest('label');
    if (parentLabel) return parentLabel.innerText.trim();

    return '';
}
