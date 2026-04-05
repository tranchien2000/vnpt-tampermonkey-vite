// src/features/templateManager.js
// Quản lý mẫu template docx (lưu URL hoặc chuỗi Base64 local)

import { SK_TEMPLATES } from '../core/constants.js';
import { showToast } from '../ui/toast.js';
import { storage } from '../api/storage/index.js';
import { idbSave, idbLoad, idbDelete } from '../api/storage/idb.js';

export function loadTemplates() {
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
                if (res.status >= 200 && res.status < 300) {
                    if (res.response && res.response.byteLength > 4) {
                        const bytes = new Uint8Array(res.response.slice(0, 4));
                        if (bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04) {
                            resolve(res.response);
                            return;
                        } else {
                            reject(new Error('Link tải không trả về định dạng DOCX/ZIP hợp lệ (có thể do lỗi quyền truy cập Google Drive hoặc link sai).'));
                            return;
                        }
                    }
                    resolve(res.response);
                }
                else reject(new Error(`HTTP ${res.status}: Không lấy được file`));
            },
            onerror: () => reject(new Error('Không thể tải URL.')),
            ontimeout: () => reject(new Error('Timeout khi tải URL.')),
        });
    });
}




/**
 * Đọc file local, lưu vào IndexedDB và localStorage (metadata)
 */
export async function saveLocalTemplate(file, container, onSelectTemplate) {
    const defaultName = file.name.replace(/\.docx$/i, '');
    const name = prompt(`Đặt tên biến nhớ cho file này:`, defaultName);
    if (!name || !name.trim()) return;

    try {
        const arrayBuffer = await file.arrayBuffer();
        await idbSave(name.trim(), arrayBuffer);
        const list = loadTemplates();
        
        // Xoá trùng tên
        const filtered = list.filter(t => t.name !== name.trim() && t.fileName !== file.name);
        filtered.unshift({ name: name.trim(), type: 'local_idb', fileName: file.name, lastUsed: Date.now() });
        saveTemplates(filtered);
        
        renderTemplateManager(container, onSelectTemplate);
        
        // Auto Select sau khi thêm:
        if (onSelectTemplate) onSelectTemplate(arrayBuffer, name.trim());
    } catch (err) {
        showToast(`❌ Lỗi lưu file: ${err.message}`, '#dc3545');
    }
}

export function renderTemplateManager(container, onSelectTemplate, currentActiveName = null) {
    let mainWrap = container.querySelector('.vnpt-template-manager-inner');
    let localListWrapper;
    let btnWrap;

    if (!mainWrap) {
        container.innerHTML = '';
        mainWrap = document.createElement('div');
        mainWrap.className = 'vnpt-template-manager-inner';
        
        // ── Header ──
        const headerRow = document.createElement('div');
        headerRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;';

        const title = document.createElement('span');
        title.className = 'vnpt-title-main';
        title.style.cssText = 'font-size:11px;font-weight:700;color:#444;';
        
        btnWrap = document.createElement('div');
        btnWrap.className = 'vnpt-btn-wrap';
        btnWrap.style.cssText = 'display:flex;gap:4px;';

        headerRow.appendChild(title);
        headerRow.appendChild(btnWrap);
        mainWrap.appendChild(headerRow);

        localListWrapper = document.createElement('div');
        localListWrapper.className = 'vnpt-local-list-container';
        localListWrapper.style.cssText = 'display:flex;flex-wrap:wrap;gap:2px;';
        mainWrap.appendChild(localListWrapper);
        
        container.appendChild(mainWrap);
    } else {
        localListWrapper = mainWrap.querySelector('.vnpt-local-list-container');
        btnWrap = mainWrap.querySelector('.vnpt-btn-wrap');
    }

    const templates = loadTemplates();
    const titleEl = mainWrap.querySelector('.vnpt-title-main');
    titleEl.innerHTML = '📁 Bộ nhớ Templates' + (currentActiveName ? ` <span style="color:#2e7d32;">(Đang dùng: ${currentActiveName})</span>` : '');

    if (templates.length === 0) {
        localListWrapper.innerHTML = `<div style="font-size:10px;color:#999;font-style:italic;padding:2px 0 6px;text-align:center;width:100%;">Chọn file bên dưới để tự ghi nhớ mẫu</div>`;
    } else {
        localListWrapper.innerHTML = '';
    }
    
    templates.forEach((tpl, idx) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:4px;padding:3px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;';
        row.title = tpl.fileName || tpl.url || tpl.name;
        row.tabIndex = 0;

        row.onfocus = () => row.style.boxShadow = '0 0 0 2px #28a745';
        row.onblur = () => row.style.boxShadow = 'none';

        const badgeText = (tpl.type === 'local' || tpl.type === 'local_base64' || tpl.type === 'local_idb') ? 'OFF' : 'ON';
        const badgeColor = badgeText === 'OFF' ? '#6c757d' : '#28a745';
        
        const badge = document.createElement('span');
        badge.textContent = badgeText;
        badge.style.cssText = `font-size:9px;padding:2px 6px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${badgeColor};color:#fff;`;

        const nameEl = document.createElement('span');
        nameEl.textContent = tpl.name;
        nameEl.style.cssText = 'font-size:11px;font-weight:600;color:#212529;white-space:nowrap;';
        
        row.onclick = () => {
            row.focus();
            selectTemplate(tpl, onSelectTemplate, currentActiveName, container);
        };

        row.appendChild(badge);
        row.appendChild(nameEl);

        // Nút đổi tên
        const renameBtn = document.createElement('button');
        renameBtn.innerHTML = '✎';
        renameBtn.title = 'Đổi tên template';
        renameBtn.style.cssText = 'font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;';
        renameBtn.onclick = (e) => {
            e.stopPropagation();
            const newName = prompt('Đổi tên template:', tpl.name);
            if (newName && newName.trim() && newName.trim() !== tpl.name) {
                const list = loadTemplates();
                list[idx].name = newName.trim();
                saveTemplates(list);
                renderTemplateManager(container, onSelectTemplate, currentActiveName);
            }
        };
        row.appendChild(renameBtn);


        const delBtn = document.createElement('button');
        delBtn.innerHTML = '✕';
        delBtn.style.cssText = 'font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;';
        delBtn.onclick = async (e) => {
            e.stopPropagation();
            if (confirm(`Xoá biểu mẫu "${tpl.name}"?`)) {
                const list = loadTemplates();
                list.splice(idx, 1);
                saveTemplates(list);
                if (tpl.type === 'local_idb') await idbDelete(tpl.name).catch(()=>null);
                renderTemplateManager(container, onSelectTemplate, currentActiveName === tpl.name ? null : currentActiveName);
            }
        };
        row.appendChild(delBtn);

        localListWrapper.appendChild(row);
    });

}

function selectTemplate(tpl, onSelectTemplate, currentActiveName, container) {
    const list = loadTemplates();
    const found = list.find(t => (t.name === tpl.name) && (t.url === tpl.url || t.type === tpl.type));
    if (found) { found.lastUsed = Date.now(); saveTemplates(list); }

    if (tpl.type === 'local_idb') {
        idbLoad(tpl.name).then(arrayBuffer => {
            if (!arrayBuffer) throw new Error("Không tìm thấy dữ liệu trong IndexedDB");
            if (onSelectTemplate) onSelectTemplate(arrayBuffer, tpl.name);
            renderTemplateManager(container, onSelectTemplate, tpl.name);
        }).catch(err => {
            showToast(`❌ Lỗi nạp File IDB: ${err.message}`, '#dc3545');
        });
        return;
    }

    if (tpl.type === 'local_base64' && tpl.data) {
        try {
            const binary_string = window.atob(tpl.data.split(',')[1]);
            const len = binary_string.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) bytes[i] = binary_string.charCodeAt(i);
            
            if (onSelectTemplate) onSelectTemplate(bytes.buffer, tpl.name);
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
