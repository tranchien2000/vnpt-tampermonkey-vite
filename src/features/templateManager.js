/**
 * @file templateManager.js
 * @desc Quản lý danh sách template DOCX (lưu URL hoặc file local qua IndexedDB).
 *       Bao gồm: load/save danh sách, fetch từ URL (Google Drive), lưu file local vào
 *       IndexedDB (idbSave/idbLoad), render UI danh sách, chọn/xoá/đổi tên template.
 * @exports loadTemplates         — đọc danh sách template từ localStorage
 * @exports fetchTemplateFromUrl  — tải ArrayBuffer từ URL qua GM_xmlhttpRequest
 * @exports saveLocalTemplate     — lưu file local vào IDB + cập nhật danh sách
 * @exports renderTemplateManager — render/refresh UI danh sách template vào container
 * @seeAlso api/storage/idb.js (IndexedDB), widget.js (host container), docExport.js (consumer)
 */
// src/features/templateManager.js
// Quản lý mẫu template docx (lưu URL hoặc chuỗi Base64 local)

import { SK_TEMPLATES } from '../core/constants.js';
import { showToast } from '../ui/toast.js';
import { idbSave, idbLoad, idbDelete } from '../api/storage/idb.js';
import { Storage } from '../utils/storage.js';
import { FirebaseService } from '../api/firebaseService.js';

export function loadTemplates() {
    try {
        const list = Storage.get(SK_TEMPLATES) || [];
        // Remove old 'local' only items that don't have base64 (to prevent the blocking alert)
        const validList = list.filter(t => t.type !== 'local');
        if (validList.length !== list.length) saveTemplates(validList);
        return validList;
    }
    catch { return []; }
}

function saveTemplates(list) {
    Storage.set(SK_TEMPLATES, list);
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
    let cloudListWrapper;
    let btnWrap;
    let currentTab = container.dataset.activeTab || 'local';

    if (!mainWrap) {
        container.innerHTML = '';
        mainWrap = document.createElement('div');
        mainWrap.className = 'vnpt-template-manager-inner';

        // ── Tabs ──
        const tabContainer = document.createElement('div');
        tabContainer.className = 'vnpt-tabs';

        const btnLocal = document.createElement('button');
        btnLocal.className = `vnpt-tab-btn ${currentTab === 'local' ? 'active' : ''}`;
        btnLocal.textContent = 'Cá nhân';
        btnLocal.onclick = () => {
            container.dataset.activeTab = 'local';
            renderTemplateManager(container, onSelectTemplate, currentActiveName);
        };

        const btnCloud = document.createElement('button');
        btnCloud.className = `vnpt-tab-btn ${currentTab === 'cloud' ? 'active' : ''}`;
        btnCloud.textContent = 'Thư viện mẫu';
        btnCloud.onclick = () => {
            container.dataset.activeTab = 'cloud';
            renderTemplateManager(container, onSelectTemplate, currentActiveName);
        };

        tabContainer.appendChild(btnLocal);
        tabContainer.appendChild(btnCloud);
        mainWrap.appendChild(tabContainer);

        // ── Header (Title & Buttons) ──
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
        localListWrapper.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;';
        mainWrap.appendChild(localListWrapper);

        cloudListWrapper = document.createElement('div');
        cloudListWrapper.className = 'vnpt-cloud-list-container';
        cloudListWrapper.style.cssText = 'display:none;flex-direction:column;gap:4px;';
        mainWrap.appendChild(cloudListWrapper);

        container.appendChild(mainWrap);
    } else {
        localListWrapper = mainWrap.querySelector('.vnpt-local-list-container');
        cloudListWrapper = mainWrap.querySelector('.vnpt-cloud-list-container');
        btnWrap = mainWrap.querySelector('.vnpt-btn-wrap');

        const tabs = mainWrap.querySelectorAll('.vnpt-tab-btn');
        tabs[0].className = `vnpt-tab-btn ${currentTab === 'local' ? 'active' : ''}`;
        tabs[1].className = `vnpt-tab-btn ${currentTab === 'cloud' ? 'active' : ''}`;
    }

    const titleEl = mainWrap.querySelector('.vnpt-title-main');

    if (currentTab === 'local') {
        localListWrapper.style.display = 'flex';
        cloudListWrapper.style.display = 'none';
        renderLocalTemplates(localListWrapper, titleEl, onSelectTemplate, currentActiveName, container);
    } else {
        localListWrapper.style.display = 'none';
        cloudListWrapper.style.display = 'flex';
        renderCloudTemplates(cloudListWrapper, titleEl, onSelectTemplate, currentActiveName, container);
    }
}

/**
 * Render danh sách template Local
 */
function renderLocalTemplates(wrapper, titleEl, onSelectTemplate, currentActiveName, container) {
    const templates = loadTemplates();
    titleEl.innerHTML = 'Templates' + (currentActiveName ? ` <span style="color:#2e7d32;">(Đang dùng: ${currentActiveName})</span>` : '');

    if (templates.length === 0) {
        wrapper.innerHTML = `<div style="font-size:10px;color:#999;font-style:italic;padding:12px;text-align:center;width:100%;">Chưa có mẫu nào. Hãy chọn file .docx bên dưới để lưu vào đây.</div>`;
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

    row.title = tpl.fileName || tpl.url || tpl.name;
    row.tabIndex = 0;

    row.onfocus = () => row.style.boxShadow = '0 0 0 2px var(--vnpt-primary)';
    row.onblur = () => row.style.boxShadow = 'none';

    const badgeText = (tpl.type === 'local' || tpl.type === 'local_base64' || tpl.type === 'local_idb') ? 'OFF' : 'ON';
    const badgeColor = badgeText === 'OFF' ? '#6c757d' : '#28a745';

    const badge = document.createElement('span');
    badge.textContent = badgeText;
    badge.style.cssText = `font-size:8px;padding:1px 5px;border-radius:10px;flex-shrink:0;font-weight:bold;background:${badgeColor};color:#fff;`;

    const nameEl = document.createElement('span');
    nameEl.textContent = tpl.name;
    nameEl.style.cssText = 'font-size:11px;font-weight:600;color:#212529;white-space:nowrap;';

    row.onclick = () => {
        row.focus();
        selectTemplate(tpl, onSelectTemplate, currentActiveName, container);
    };

    row.appendChild(badge);
    row.appendChild(nameEl);

    if (tpl.type !== 'cloud_shared') {
        // Nút đổi tên
        const renameBtn = document.createElement('button');
        renameBtn.innerHTML = '✎';
        renameBtn.style.cssText = 'font-size:10px;padding:1px 4px;border:none;background:none;color:#555;cursor:pointer;margin-left:auto;';
        renameBtn.onclick = (e) => {
            e.stopPropagation();
            const newName = prompt('Đổi tên template:', tpl.name);
            if (newName && newName.trim() && newName.trim() !== tpl.name) {
                const list = loadTemplates();
                const itemIdx = list.findIndex(t => t.name === tpl.name);
                if (itemIdx >= 0) {
                    list[itemIdx].name = newName.trim();
                    saveTemplates(list);
                    renderTemplateManager(container, onSelectTemplate, currentActiveName);
                }
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
                const itemIdx = list.findIndex(t => t.name === tpl.name);
                if (itemIdx >= 0) {
                    const item = list[itemIdx];
                    list.splice(itemIdx, 1);
                    saveTemplates(list);
                    if (item.type === 'local_idb') await idbDelete(item.name).catch(() => null);
                    renderTemplateManager(container, onSelectTemplate, currentActiveName === item.name ? null : currentActiveName);
                }
            }
        };
        row.appendChild(delBtn);
    } else {
        // Nút Import cho Cloud Template
        const importBtn = document.createElement('button');
        importBtn.innerHTML = '📥';
        importBtn.title = 'Lưu về danh sách cá nhân';
        importBtn.style.cssText = 'font-size:10px;padding:1px 4px;border:none;background:none;color:var(--vnpt-primary);cursor:pointer;margin-left:auto;';
        importBtn.onclick = (e) => {
            e.stopPropagation();
            importCloudTemplate(tpl);
        }
        row.appendChild(importBtn);
    }

    return row;
}

/**
 * Render danh sách template từ Cloud
 */
async function renderCloudTemplates(wrapper, titleEl, onSelectTemplate, currentActiveName, container) {
    titleEl.textContent = 'Thư viện dùng chung';
    wrapper.innerHTML = `<div style="text-align:center;padding:10px;font-size:10px;color:#666;">⏳ Đang tải từ Cloud...</div>`;

    try {
        const cloudTemplates = await FirebaseService.getSharedTemplates();
        if (cloudTemplates.length === 0) {
            wrapper.innerHTML = `<div style="text-align:center;padding:10px;font-size:10px;color:#999;font-style:italic;">Thư viện trống hoặc chưa được cấu hình.</div>`;
            return;
        }

        wrapper.innerHTML = '';
        cloudTemplates.forEach(tpl => {
            const cloudTpl = { ...tpl, type: 'cloud_shared' };
            const row = createTemplateRow(cloudTpl, 0, onSelectTemplate, currentActiveName, container);
            row.style.width = '100%'; // Trong tab cloud thì dàn hàng dọc cho đẹp
            row.style.borderRadius = '8px';

            // Thêm thông tin phòng ban nếu có
            if (tpl.department) {
                const dept = document.createElement('span');
                dept.textContent = tpl.department;
                dept.style.cssText = 'font-size:9px;background:#e3f2fd;color:#1976d2;padding:1px 4px;border-radius:4px;margin-left:4px;';
                row.insertBefore(dept, row.querySelector('button'));
            }

            wrapper.appendChild(row);
        });
    } catch (err) {
        wrapper.innerHTML = `<div style="text-align:center;padding:10px;font-size:10px;color:#ea4335;">❌ Lỗi: ${err.message}</div>`;
    }
}

async function importCloudTemplate(tpl) {
    const list = loadTemplates();
    const isExist = list.some(t => t.url === tpl.url);
    if (isExist) {
        showToast("Mẫu này đã có trong danh sách cá nhân của bạn.");
        return;
    }

    list.unshift({
        name: tpl.name,
        url: tpl.url,
        type: 'url',
        fileName: tpl.fileName || tpl.name + '.docx',
        lastUsed: Date.now()
    });
    saveTemplates(list);
    showToast(`✅ Đã thêm "${tpl.name}" vào danh sách cá nhân.`);
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
