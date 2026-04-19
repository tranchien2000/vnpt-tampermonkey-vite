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

        const headerRow = document.createElement('div');
        headerRow.className = 'tmpl-header-row';

        const title = document.createElement('span');
        title.className = 'vnpt-title-main';

        btnWrap = document.createElement('div');
        btnWrap.className = 'vnpt-btn-wrap';

        headerRow.appendChild(title);
        headerRow.appendChild(btnWrap);
        mainWrap.appendChild(headerRow);

        localListWrapper = document.createElement('div');
        localListWrapper.className = 'vnpt-local-list-container';
        mainWrap.appendChild(localListWrapper);

        container.appendChild(mainWrap);
    } else {
        localListWrapper = mainWrap.querySelector('.vnpt-local-list-container');
        btnWrap = mainWrap.querySelector('.vnpt-btn-wrap');
    }

    if (btnWrap) btnWrap.innerHTML = '';

    const titleEl = mainWrap.querySelector('.vnpt-title-main');
    renderLocalTemplates(localListWrapper, titleEl, onSelectTemplate, currentActiveName, container);
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
    row.className = 'tmpl-row-item';
    if (tpl.name === currentActiveName) {
        row.classList.add('active');
    }

    row.title = tpl.description || tpl.name;
    row.onclick = async () => {
        try {
            showToast(`⏳ Đang tải ${tpl.name}...`);
            const arrayBuffer = await storageManager.download('firebase', tpl.path, { type: 'arraybuffer' });
            if (onSelectTemplate) onSelectTemplate(arrayBuffer, tpl.name);
            showToast(`✅ Đã tải xong: ${tpl.name}`);
            const container = document.getElementById('vnpt-template-manager');
            renderTemplateManager(container, onSelectTemplate, tpl.name);
        } catch (err) {
            showToast(`Lỗi tải template: ${err.message}`, '#dc3545');
        }
    };

    const badge = document.createElement('span');
    badge.textContent = 'CLOUD';
    badge.className = 'tmpl-badge-cloud';

    const nameEl = document.createElement('span');
    nameEl.textContent = tpl.name;
    nameEl.className = 'tmpl-name-text';

    row.appendChild(badge);
    row.appendChild(nameEl);
    return row;
}

function renderLocalTemplates(wrapper, titleEl, onSelectTemplate, currentActiveName, container) {
    const templates = loadTemplates();
    titleEl.innerHTML = 'Mẫu văn bản' + (currentActiveName ? ` <span style="color:#2e7d32;">(Đang dùng: ${currentActiveName})</span>` : '');

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
    row.className = 'tmpl-row-item';
    if (tpl.name === currentActiveName) {
        row.classList.add('active');
    }

    row.title = tpl.fileName || tpl.name;
    row.tabIndex = 0;
    row.onclick = () => {
        row.focus();
        selectTemplate(tpl, onSelectTemplate, container);
    };

    const nameEl = document.createElement('span');
    nameEl.textContent = tpl.name;
    nameEl.className = 'tmpl-name-text';

    row.appendChild(nameEl);

    const renameBtn = document.createElement('button');
    renameBtn.innerHTML = '✎';
    renameBtn.className = 'tmpl-btn-rename';
    renameBtn.onclick = async e => {
        e.stopPropagation();
        const oldName = tpl.name;
        const newName = prompt('Doi ten template:', oldName);
        if (!newName || !newName.trim() || newName.trim() === oldName) return;

        const cleanNewName = newName.trim();
        
        try {
            // Nếu là type local_idb, ta phải đổi tên khóa trong IndexedDB
            if (tpl.type === 'local_idb') {
                const buffer = await idbLoad(oldName);
                if (buffer) {
                    await idbSave(cleanNewName, buffer);
                    await idbDelete(oldName);
                }
            }

            const list = loadTemplates();
            const itemIdx = list.findIndex(t => t.name === oldName);
            if (itemIdx >= 0) {
                list[itemIdx].name = cleanNewName;
                saveTemplates(list);
                renderTemplateManager(container, onSelectTemplate, currentActiveName === oldName ? cleanNewName : currentActiveName);
                showToast(`✅ Đã đổi tên thành: ${cleanNewName}`);
            }
        } catch (err) {
            showToast(`❌ Lỗi đổi tên: ${err.message}`, '#dc3545');
        }
    };
    row.appendChild(renameBtn);

    const delBtn = document.createElement('button');
    delBtn.innerHTML = '✕';
    delBtn.className = 'tmpl-btn-del';
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
