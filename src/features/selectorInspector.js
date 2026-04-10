/**
 * @file selectorInspector.js
 * @desc Công cụ "Soi" trường dữ liệu (Selector Inspector).
 *       Giúp người dùng bắt ID/Name/FormControlName bằng cách di chuột và click trực tiếp trên web.
 */
import { AppState } from '../core/state.js';
import { addOrUpdateFieldRow, saveFieldsToLocal } from './fieldsManager.js';
import { showToast } from '../ui/toast.js';

let lastElement = null;

export function toggleInspector() {
    AppState.isInspecting = !AppState.isInspecting;

    if (AppState.isInspecting) {
        startInspecting();
        showToast("🔍 Chế độ Soi: Đang bật. Hãy di chuột và Click vào ô nhập liệu.", "#1a73e8");
    } else {
        stopInspecting();
        showToast("🔍 Chế độ Soi: Đã tắt.");
    }
}

function startInspecting() {
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('click', handleClick, true);
    document.body.classList.add('vnpt-inspecting-mode');
}

function stopInspecting() {
    document.removeEventListener('mouseover', handleMouseOver, true);
    document.removeEventListener('click', handleClick, true);
    document.body.classList.remove('vnpt-inspecting-mode');
    
    if (lastElement) {
        lastElement.classList.remove('vnpt-inspect-highlight');
        lastElement = null;
    }
}

function handleMouseOver(e) {
    if (!AppState.isInspecting) return;
    
    // Chỉ highlight các phần tử có khả năng là input hoặc container của input
    const target = e.target.closest('input, select, textarea, ng-select2, label');
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

    // Bỏ qua nếu click vào chính Widget
    if (e.target.closest('#vnpt-docx-widget') || e.target.closest('#vnpt-inline-calc')) return;

    e.preventDefault();
    e.stopPropagation();

    const target = e.target.closest('input, select, textarea, ng-select2, label');
    if (!target) return;

    // Phân tích thông tin phần tử
    const info = extractElementInfo(target);
    const value = target.getAttribute('title') || target.value || '';
    
    if (info.key) {
        addOrUpdateFieldRow(info.key, value, info.label || '');
        saveFieldsToLocal();
        showToast(`✅ Đã bắt được: ${info.label || info.key}${value ? ' (' + value + ')' : ''}`, "#1e8e3e");
    } else {
        showToast("⚠️ Không tìm thấy ID hoặc tên cố định cho trường này.", "#ffc107");
    }

    // Tự động tắt sau khi bắt (tùy chọn: có thể để bật liên tục nếu muốn)
    // toggleInspector(); 
}

function extractElementInfo(el) {
    let key = '';
    let label = '';

    // 1. Thử lấy từ FormControlName (Angular - chuẩn nhất VNPT)
    key = el.getAttribute('formcontrolname') || '';
    
    // 2. Thử lấy từ Id hoặc Name
    if (!key) key = el.id || el.getAttribute('name') || '';

    // 3. Tìm Label đi kèm
    label = findLabelText(el);

    // Nếu el là label, tìm input tương ứng
    if (el.tagName.toLowerCase() === 'label') {
        const inputId = el.getAttribute('for');
        const input = inputId ? document.getElementById(inputId) : el.querySelector('input, select, textarea');
        if (input) {
            key = input.getAttribute('formcontrolname') || input.id || input.getAttribute('name') || '';
        }
        if (!label) label = el.innerText.trim();
    }

    return { key, label: label.replace(/[:*]/g, '').trim() };
}

function findLabelText(el) {
    // Tìm label qua id (htmlFor)
    if (el.id) {
        const lbl = document.querySelector(`label[for="${el.id}"]`);
        if (lbl) return lbl.innerText.trim();
    }

    // Tìm trong cha gần nhất
    const parentLabel = el.closest('label');
    if (parentLabel) return parentLabel.innerText.trim();

    // Tìm thẻ span/div chứa text ngay trước đó
    const prev = el.previousElementSibling;
    if (prev && (prev.tagName === 'LABEL' || prev.classList.contains('label'))) {
        return prev.innerText.trim();
    }

    // fallback: dùng placeholder
    return el.getAttribute('placeholder') || '';
}
