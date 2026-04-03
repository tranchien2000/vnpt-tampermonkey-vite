// src/features/templateManager.js
// Quản lý mẫu template docx (lưu URL hoặc chuỗi Base64 local)

import { SK_TEMPLATES } from '../core/constants.js';
import { showToast } from '../ui/toast.js';

let isEditMode = false;

function loadTemplates() {
    try { 
        const list = JSON.parse(localStorage.getItem(SK_TEMPLATES)) || []; 
        // Remove old 'local' only items that don't have base64 (to prevent the blocking alert)
        const validList = list.filter(t => t.type !== 'local');
        if (validList.length !== list.length) saveTemplates(validList);
        return validList;
    }
    catch { return []; }
}

function saveTemplates(list) {
    localStorage.setItem(SK_TEMPLATES, JSON.stringify(list));
}

function normalizeUrl(url) {
    const gdMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (gdMatch) return `https://drive.google.com/uc?export=download&id=${gdMatch[1]}`;
    return url;
}

export function fetchTemplateFromUrl(url) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: 'GET',
            url: normalizeUrl(url),
            responseType: 'arraybuffer',
            onload: (res) => {
                if (res.status >= 200 && res.status < 300) resolve(res.response);
                else reject(new Error(`HTTP ${res.status}: Không lấy được file`));
            },
            onerror: () => reject(new Error('Không thể tải URL.')),
            ontimeout: () => reject(new Error('Timeout khi tải URL.')),
        });
    });
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64.split(',')[1]);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Đọc file local, tạo Base64 và lưu vào localStorage
 */
export async function saveLocalTemplate(file, container, onSelectTemplate) {
    const defaultName = file.name.replace(/\.docx$/i, '');
    const name = prompt(`Đặt tên biến nhớ cho file này:`, defaultName);
    if (!name || !name.trim()) return;

    try {
        const base64Data = await fileToBase64(file);
        const list = loadTemplates();
        
        // Xoá trùng tên
        const filtered = list.filter(t => t.name !== name.trim() && t.fileName !== file.name);
        filtered.unshift({ name: name.trim(), type: 'local_base64', data: base64Data, fileName: file.name, lastUsed: Date.now() });
        saveTemplates(filtered);
        
        renderTemplateManager(container, onSelectTemplate);
        
        // Auto Select sau khi thêm:
        const arrayBuffer = base64ToArrayBuffer(base64Data);
        if (onSelectTemplate) onSelectTemplate(arrayBuffer, name.trim());
    } catch (err) {
        showToast(`❌ Lỗi lưu file: ${err.message}`, '#dc3545');
    }
}

export function renderTemplateManager(container, onSelectTemplate, currentActiveName = null) {
    container.innerHTML = '';
    const templates = loadTemplates();

    // ── Header ──
    const headerRow = document.createElement('div');
    headerRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;';

    const title = document.createElement('span');
    title.style.cssText = 'font-size:11px;font-weight:700;color:#444;';
    title.innerHTML = '📁 Bộ nhớ Templates' + (currentActiveName ? ` <span style="color:#2e7d32;">(Đang dùng: ${currentActiveName})</span>` : '');

    const btnWrap = document.createElement('div');
    btnWrap.style.cssText = 'display:flex;gap:4px;';

    const addUrlBtn = document.createElement('button');
    addUrlBtn.textContent = '+ URL';
    addUrlBtn.style.cssText = 'font-size:10px;padding:2px 7px;border:1px solid #1a73e8;background:#e8f0fe;color:#1a73e8;border-radius:4px;cursor:pointer;font-weight:600;display:' + (isEditMode ? 'block' : 'none');
    addUrlBtn.onclick = () => showAddUrlForm(container, onSelectTemplate);

    const toggleEditBtn = document.createElement('button');
    toggleEditBtn.textContent = isEditMode ? 'Xong' : '⚙ Quản lý';
    toggleEditBtn.style.cssText = 'font-size:10px;padding:2px 7px;border:1px solid #6c757d;background:#f8f9fa;color:#495057;border-radius:4px;cursor:pointer;font-weight:600;';
    toggleEditBtn.onclick = () => {
        isEditMode = !isEditMode;
        renderTemplateManager(container, onSelectTemplate);
    };

    btnWrap.appendChild(addUrlBtn);
    btnWrap.appendChild(toggleEditBtn);
    headerRow.appendChild(title);
    headerRow.appendChild(btnWrap);
    container.appendChild(headerRow);

    if (templates.length === 0) {
        const hint = document.createElement('div');
        hint.style.cssText = 'font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;';
        hint.textContent = 'Chọn file bên dưới để tự ghi nhớ mẫu';
        container.appendChild(hint);
        return;
    }

    // ── Danh sách ──
    const listWrapper = document.createElement('div');
    listWrapper.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
    
    templates.forEach((tpl, idx) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;';
        row.title = tpl.fileName || tpl.url || tpl.name;

        const badgeText = (tpl.type === 'local' || tpl.type === 'local_base64') ? 'OFF' : 'ON';
        const badgeColor = badgeText === 'OFF' ? '#6c757d' : '#28a745';
        
        const badge = document.createElement('span');
        badge.textContent = badgeText;
        badge.style.cssText = `font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${badgeColor};color:#fff;`;

        const nameEl = document.createElement('span');
        nameEl.textContent = tpl.name;
        nameEl.style.cssText = 'font-size:11px;font-weight:600;color:#212529;white-space:nowrap;';
        
        row.onclick = () => {
            if (isEditMode) {
                const newName = prompt('Đổi tên template:', tpl.name);
                if (newName && newName.trim() && newName.trim() !== tpl.name) {
                    const list = loadTemplates();
                    list[idx].name = newName.trim();
                    saveTemplates(list);
                    renderTemplateManager(container, onSelectTemplate, currentActiveName);
                }
            } else {
                selectTemplate(tpl, onSelectTemplate, currentActiveName, container);
            }
        };

        row.appendChild(badge);
        row.appendChild(nameEl);

        if (isEditMode) {
            const delBtn = document.createElement('button');
            delBtn.innerHTML = '✕';
            delBtn.style.cssText = 'font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:4px;';
            delBtn.onclick = (e) => {
                e.stopPropagation();
                if (confirm(`Xoá biểu mẫu "${tpl.name}"?`)) {
                    const list = loadTemplates();
                    list.splice(idx, 1);
                    saveTemplates(list);
                    renderTemplateManager(container, onSelectTemplate, currentActiveName === tpl.name ? null : currentActiveName);
                }
            };
            row.appendChild(delBtn);
        }

        listWrapper.appendChild(row);
    });
    container.appendChild(listWrapper);
}

function selectTemplate(tpl, onSelectTemplate, currentActiveName, container) {
    const list = loadTemplates();
    const found = list.find(t => (t.url === tpl.url && t.name === tpl.name) || (t.data === tpl.data && t.name === tpl.name));
    if (found) { found.lastUsed = Date.now(); saveTemplates(list); }

    if (tpl.type === 'local_base64' && tpl.data) {
        try {
            const arrayBuffer = base64ToArrayBuffer(tpl.data);
            if (onSelectTemplate) onSelectTemplate(arrayBuffer, tpl.name);
            renderTemplateManager(container, onSelectTemplate, tpl.name);
        } catch (err) {
            showToast(`❌ Lỗi nạp Base64: ${err.message}`, '#dc3545');
        }
        return;
    }

    // Is URL
    fetchTemplateFromUrl(tpl.url).then(buf => {
        if (onSelectTemplate) onSelectTemplate(buf, tpl.name);
        renderTemplateManager(container, onSelectTemplate, tpl.name);
    }).catch(err => {
        showToast(`❌ ${err.message}`, '#dc3545');
    });
}

function showAddUrlForm(container, onSelectTemplate) {
    const existing = container.querySelector('.tpl-add-form');
    if (existing) { existing.remove(); return; }

    const form = document.createElement('div');
    form.className = 'tpl-add-form';
    form.style.cssText = 'background:#fff;border:1px dashed #1a73e8;border-radius:4px;padding:6px;margin-bottom:6px;';

    const nameInp = document.createElement('input');
    nameInp.placeholder = 'Tên mẫu';
    nameInp.style.cssText = 'width:100%;box-sizing:border-box;padding:3px 5px;font-size:11px;border:1px solid #ccc;border-radius:3px;margin-bottom:4px;';

    const urlInp = document.createElement('input');
    urlInp.placeholder = 'URL (.docx)';
    urlInp.style.cssText = 'width:100%;box-sizing:border-box;padding:3px 5px;font-size:11px;border:1px solid #ccc;border-radius:3px;margin-bottom:4px;';

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:4px;';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = '💾 Lưu';
    saveBtn.style.cssText = 'flex:1;padding:3px;font-size:10px;font-weight:700;background:#1a73e8;color:#fff;border:none;border-radius:3px;cursor:pointer;';
    saveBtn.onclick = () => {
        const name = nameInp.value.trim();
        const url = urlInp.value.trim();
        if (!name || !url) return;
        const list = loadTemplates();
        list.unshift({ name, url, type: 'url', lastUsed: Date.now() });
        saveTemplates(list);
        form.remove();
        renderTemplateManager(container, onSelectTemplate);
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Hủy';
    cancelBtn.style.cssText = 'padding:3px 8px;font-size:10px;background:#f0f0f0;border:1px solid #ccc;border-radius:3px;cursor:pointer;';
    cancelBtn.onclick = () => form.remove();

    btnRow.appendChild(saveBtn);
    btnRow.appendChild(cancelBtn);
    form.appendChild(nameInp);
    form.appendChild(urlInp);
    form.appendChild(btnRow);
    container.insertBefore(form, container.firstChild.nextSibling);
}
