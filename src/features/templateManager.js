/**
 * @file templateManager.js
 * @desc Quan ly danh sach template DOCX local luu trong IndexedDB.
 * @exports loadTemplates         - doc danh sach template tu localStorage
 * @exports saveLocalTemplate     - luu file local vao IDB + cap nhat metadata
 * @exports renderTemplateManager - render/refresh UI danh sach template vao container
 * @seeAlso api/storage/idb.js, widget.js, docExport.js
 */

import { SK_TEMPLATES } from '../core/constants.js';
import { showToast } from '../ui/toast.js';
import { idbSave, idbLoad, idbDelete } from '../api/storage/idb.js';
import { Storage } from '../utils/storage.js';

const LOCAL_TEMPLATE_TYPES = new Set(['local', 'local_base64', 'local_idb', 'firebase']);

export function loadTemplates() {
    try {
        const list = Storage.get(SK_TEMPLATES) || [];
        const validList = list.filter(t => t && (LOCAL_TEMPLATE_TYPES.has(t.type) || t.type === 'firebase'));
        if (validList.length !== list.length) saveTemplates(validList);
        return validList;
    } catch {
        return [];
    }
}

function saveTemplates(list) {
    Storage.set(SK_TEMPLATES, list.filter(t => t && LOCAL_TEMPLATE_TYPES.has(t.type)));
}

/**
 * Doc file local, luu vao IndexedDB va localStorage (metadata)
 */
export async function saveLocalTemplate(file, container, onSelectTemplate) {
    const defaultName = file.name.replace(/\.docx$/i, '');
    const name = prompt('Dat ten bien nho cho file nay:', defaultName);
    if (!name || !name.trim()) return;

    try {
        // Ưu tiên dùng file.arrayBuffer() thay vì adapter để tránh lỗi chuyển đổi trong môi trường build
        const arrayBuffer = await file.arrayBuffer();
        
        // Chèn đoạn kiểm tra Magic Number ngay khi lưu để phát hiện file hỏng sớm
        const bytes = new Uint8Array(arrayBuffer, 0, 2);
        if (bytes[0] !== 0x50 || bytes[1] !== 0x4B) {
            throw new Error("File chon khong phai dinh dang Word (.docx) hop le hoặc bi khoa/hong.");
        }

        await idbSave(name.trim(), arrayBuffer);

        const list = loadTemplates();
        const filtered = list.filter(t => t.name !== name.trim() && t.fileName !== file.name);
        filtered.unshift({
            name: name.trim(),
            type: 'local_idb',
            fileName: file.name,
            lastUsed: Date.now()
        });
        saveTemplates(filtered);

        renderTemplateManager(container, onSelectTemplate, name.trim());

        if (onSelectTemplate) onSelectTemplate(arrayBuffer, name.trim());
    } catch (err) {
        showToast(`Loi luu file: ${err.message}`, '#dc3545');
    }
}

import { storage as storageManager } from '../api/storage/index.js';

export function renderTemplateManager(container, onSelectTemplate, currentActiveName = null) {
    let mainWrap = container.querySelector('.vnpt-template-manager-inner');
    let localListWrapper;
    let sharedListWrapper;
    let btnWrap;

    if (!mainWrap) {
        container.innerHTML = '';
        mainWrap = document.createElement('div');
        mainWrap.className = 'vnpt-template-manager-inner';

        // --- Shared / Cloud Section ---
        const sharedHeader = document.createElement('div');
        sharedHeader.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;';
        sharedHeader.innerHTML = '<span style="font-size:11px;font-weight:700;color:#444;">Templates hệ thống</span>';
        mainWrap.appendChild(sharedHeader);

        sharedListWrapper = document.createElement('div');
        sharedListWrapper.className = 'vnpt-shared-list-container';
        sharedListWrapper.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;';
        mainWrap.appendChild(sharedListWrapper);

        const headerRow = document.createElement('div');
        headerRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:5px; border-top: 1px solid #eee; padding-top: 5px;';

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
        localListWrapper.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;';
        mainWrap.appendChild(localListWrapper);

        container.appendChild(mainWrap);
    } else {
        sharedListWrapper = mainWrap.querySelector('.vnpt-shared-list-container');
        localListWrapper = mainWrap.querySelector('.vnpt-local-list-container');
        btnWrap = mainWrap.querySelector('.vnpt-btn-wrap');
    }

    if (btnWrap) btnWrap.innerHTML = '';

    const titleEl = mainWrap.querySelector('.vnpt-title-main');
    renderLocalTemplates(localListWrapper, titleEl, onSelectTemplate, currentActiveName, container);
    renderSharedTemplates(sharedListWrapper, onSelectTemplate, currentActiveName);
}

async function renderSharedTemplates(wrapper, onSelectTemplate, currentActiveName) {
    const { FirebaseService } = await import('../api/firebaseService.js');
    const shared = await FirebaseService.getSharedTemplates();

    if (!shared || shared.length === 0) {
        wrapper.innerHTML = '<div style="font-size:10px;color:#999;font-style:italic;padding:4px 12px;">Không có mẫu dùng chung.</div>';
        return;
    }

    wrapper.innerHTML = '';
    shared.forEach(tpl => {
        const row = createSharedTemplateRow(tpl, onSelectTemplate, currentActiveName);
        wrapper.appendChild(row);
    });
}

function createSharedTemplateRow(tpl, onSelectTemplate, currentActiveName) {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:4px;padding:3px 8px;background:#e3f2fd;border:1px solid #bbdefb;border-radius:15px;cursor:pointer;outline:none;transition:all 0.2s;';
    if (tpl.name === currentActiveName) {
        row.style.borderColor = 'var(--vnpt-primary)';
        row.style.background = 'var(--vnpt-primary-light)';
    }

    row.title = tpl.description || tpl.name;
    row.onclick = async () => {
        try {
            showToast(`⏳ Đang tải ${tpl.name}...`);
            const arrayBuffer = await storageManager.download('firebase', tpl.path, { type: 'arraybuffer' });
            if (onSelectTemplate) onSelectTemplate(arrayBuffer, tpl.name);
            showToast(`✅ Đã tải xong: ${tpl.name}`);
            // Force re-render to update active state
            const container = document.getElementById('vnpt-template-manager');
            renderTemplateManager(container, onSelectTemplate, tpl.name);
        } catch (err) {
            showToast(`Lỗi tải template: ${err.message}`, '#dc3545');
        }
    };

    const badge = document.createElement('span');
    badge.textContent = 'CLOUD';
    badge.style.cssText = 'font-size:8px;padding:1px 5px;border-radius:10px;flex-shrink:0;font-weight:bold;background:#1976d2;color:#fff;';

    const nameEl = document.createElement('span');
    nameEl.textContent = tpl.name;
    nameEl.style.cssText = 'font-size:11px;font-weight:600;color:#0d47a1;white-space:nowrap;';

    row.appendChild(badge);
    row.appendChild(nameEl);
    return row;
}

function renderLocalTemplates(wrapper, titleEl, onSelectTemplate, currentActiveName, container) {
    const templates = loadTemplates();
    titleEl.innerHTML = 'Templates local' + (currentActiveName ? ` <span style="color:#2e7d32;">(Dang dung: ${currentActiveName})</span>` : '');

    if (templates.length === 0) {
        wrapper.innerHTML = '<div style="font-size:10px;color:#999;font-style:italic;padding:12px;text-align:center;width:100%;">Chua co mau nao. Hay chon file .docx tu may tinh de luu vao day.</div>';
        return;
    }

    wrapper.innerHTML = '';
    templates.forEach((tpl, idx) => {
        const row = createTemplateRow(tpl, idx, onSelectTemplate, currentActiveName, container);
        wrapper.appendChild(row);
    });
}

function createTemplateRow(tpl, idx, onSelectTemplate, currentActiveName, container) {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:4px;padding:3px 8px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:15px;cursor:pointer;outline:none;transition:all 0.2s;';
    if (tpl.name === currentActiveName) {
        row.style.borderColor = 'var(--vnpt-primary)';
        row.style.background = 'var(--vnpt-primary-light)';
    }

    row.title = tpl.fileName || tpl.name;
    row.tabIndex = 0;
    row.onfocus = () => { row.style.boxShadow = '0 0 0 2px var(--vnpt-primary)'; };
    row.onblur = () => { row.style.boxShadow = 'none'; };
    row.onclick = () => {
        row.focus();
        selectTemplate(tpl, onSelectTemplate, container);
    };

    const badge = document.createElement('span');
    badge.textContent = 'LOCAL';
    badge.style.cssText = 'font-size:8px;padding:1px 5px;border-radius:10px;flex-shrink:0;font-weight:bold;background:#6c757d;color:#fff;';

    const nameEl = document.createElement('span');
    nameEl.textContent = tpl.name;
    nameEl.style.cssText = 'font-size:11px;font-weight:600;color:#212529;white-space:nowrap;';

    row.appendChild(badge);
    row.appendChild(nameEl);

    const renameBtn = document.createElement('button');
    renameBtn.innerHTML = '✎';
    renameBtn.style.cssText = 'font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;';
    renameBtn.onclick = e => {
        e.stopPropagation();
        const newName = prompt('Doi ten template:', tpl.name);
        if (!newName || !newName.trim() || newName.trim() === tpl.name) return;

        const list = loadTemplates();
        const itemIdx = list.findIndex(t => t.name === tpl.name);
        if (itemIdx >= 0) {
            list[itemIdx].name = newName.trim();
            saveTemplates(list);
            renderTemplateManager(container, onSelectTemplate, currentActiveName === tpl.name ? newName.trim() : currentActiveName);
        }
    };
    row.appendChild(renameBtn);

    const delBtn = document.createElement('button');
    delBtn.innerHTML = '✕';
    delBtn.style.cssText = 'font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;';
    delBtn.onclick = async e => {
        e.stopPropagation();
        if (!confirm(`Xoa bieu mau "${tpl.name}"?`)) return;

        const list = loadTemplates();
        const itemIdx = list.findIndex(t => t.name === tpl.name);
        if (itemIdx >= 0) {
            const item = list[itemIdx];
            list.splice(itemIdx, 1);
            saveTemplates(list);
            if (item.type === 'local_idb') await idbDelete(item.name).catch(() => null);
            renderTemplateManager(container, onSelectTemplate, currentActiveName === item.name ? null : currentActiveName);
        }
    };
    row.appendChild(delBtn);

    return row;
}

function selectTemplate(tpl, onSelectTemplate, container) {
    const list = loadTemplates();
    const found = list.find(t => t.name === tpl.name && t.type === tpl.type);
    if (found) {
        found.lastUsed = Date.now();
        saveTemplates(list);
    }

    if (tpl.type === 'local_idb') {
        idbLoad(tpl.name).then(arrayBuffer => {
            if (!arrayBuffer) throw new Error('Khong tim thay du lieu template da luu');
            if (onSelectTemplate) onSelectTemplate(arrayBuffer, tpl.name);
            renderTemplateManager(container, onSelectTemplate, tpl.name);
        }).catch(err => {
            showToast(`Loi nap template local: ${err.message}`, '#dc3545');
        });
        return;
    }

    if (tpl.type === 'local_base64' && tpl.data) {
        try {
            const binaryString = window.atob(tpl.data.split(',')[1]);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            if (onSelectTemplate) onSelectTemplate(bytes.buffer, tpl.name);
            renderTemplateManager(container, onSelectTemplate, tpl.name);
        } catch (err) {
            showToast(`Loi nap Base64: ${err.message}`, '#dc3545');
        }
        return;
    }

    showToast('Template nay khong con duoc ho tro. Hay chon lai file local.', '#dc3545');
}
