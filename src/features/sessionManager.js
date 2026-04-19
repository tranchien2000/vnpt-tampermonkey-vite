/**
 * @file sessionManager.js
 * @desc Session Manager 2.0 - Hệ thống quản lý hồ sơ khách hàng tập trung.
 *       Thay thế hoàn toàn cho hệ thống Backup History cũ.
 */
import { Storage } from '../utils/storage.js';
import { LOCAL_KEY_FIELDS, SK_RAW_SCAN, SK_CALC_MAP, LOCAL_KEY_SESSION_BAR_PINNED, LOCAL_KEY_DEFAULT_FIELDS } from '../core/constants.js';
import { loadSavedData } from './fieldsManager.js';
import { showToast } from '../ui/toast.js';
import { AppState } from '../core/state.js';

const SK_SESSIONS = 'VNPT_PRO_SESSIONS_V2';
const SK_ACTIVE_ID = 'VNPT_PRO_ACTIVE_ID';

export const SessionManager = {
    /**
     * Khởi tạo hệ thống hồ sơ
     */
    init() {
        const sessions = this.getAll();
        if (sessions.length === 0) {
            this.createNew("Hồ sơ trống");
        }
        this.renderTabs();
    },

    getAll() {
        return Storage.get(SK_SESSIONS, []);
    },

    getActiveId() {
        return Storage.get(SK_ACTIVE_ID, null);
    },

    isPinned() {
        return Storage.get(LOCAL_KEY_SESSION_BAR_PINNED, true);
    },

    /**
     * Tạo hồ sơ mới hoàn toàn trắng
     */
    createNew(name = "Hồ sơ mới") {
        const sessions = this.getAll();
        const newId = 'sess_' + Date.now();
        const newSession = {
            id: newId,
            name: name,
            data: { fields: {}, rawScan: '', calcMap: null },
            updatedAt: Date.now()
        };
        
        sessions.push(newSession);
        // Giới hạn tối đa 15 hồ sơ
        const limited = sessions.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 15);
        Storage.set(SK_SESSIONS, limited);
        this.switchTo(newId);
    },

    /**
     * Chuyển đổi và Nạp dữ liệu (KHÔNG đổi thứ tự Tab)
     */
    switchTo(id) {
        const currentActiveId = this.getActiveId();
        if (currentActiveId === id) return;

        // Lưu hồ sơ hiện tại trước khi nhảy (giữ nguyên updatedAt cũ của nó)
        this.saveCurrent(false); 

        const sessions = this.getAll();
        const target = sessions.find(s => s.id === id);
        if (!target) return;

        Storage.set(SK_ACTIVE_ID, id);

        // Nạp dữ liệu vào các kho lưu trữ thực thi
        Storage.set(LOCAL_KEY_FIELDS, target.data.fields || {});
        Storage.set(SK_RAW_SCAN, target.data.rawScan || '');
        if (target.data.calcMap) Storage.set(SK_CALC_MAP, target.data.calcMap);

        // Làm mới UI
        loadSavedData();
        const rawInput = document.getElementById('vnpt-raw-scan-input');
        if (rawInput) rawInput.value = target.data.rawScan || '';

        this.renderTabs();
    },

    /**
     * Lưu dữ liệu hiện hành vào bộ nhớ Session
     * @param {boolean} updateTime - Có cập nhật thời gian sửa đổi hay không
     */
    saveCurrent(updateTime = true) {
        if (AppState.isDefaultMode) return;

        const activeId = this.getActiveId();
        if (!activeId) return;

        const sessions = this.getAll();
        const idx = sessions.findIndex(s => s.id === activeId);
        if (idx === -1) return;

        const fields = Storage.get(LOCAL_KEY_FIELDS) || {};
        const mst = fields.soDkdn?.value || '';
        const org = fields.tenToChuc?.value || '';
        const rep = fields.tenDaiDienn?.value || '';

        sessions[idx].name = mst || org || rep || sessions[idx].name || 'Hồ sơ mới';
        sessions[idx].data = {
            fields: fields,
            rawScan: Storage.get(SK_RAW_SCAN, ''),
            calcMap: Storage.get(SK_CALC_MAP)
        };
        
        if (updateTime) {
            sessions[idx].updatedAt = Date.now();
        }

        Storage.set(SK_SESSIONS, sessions);
    },

    /**
     * Cập nhật tên Tab tức thì khi gõ
     */
    updateActiveName() {
        this.saveCurrent();
        this.renderTabs();
    },

    /**
     * Xử lý khi có MST mới
     */
    checkAndCreateForNewMST(mst) {
        if (!mst || mst.length < 5) return;
        const sessions = this.getAll();
        const activeId = this.getActiveId();
        
        const existing = sessions.find(s => s.name === mst);
        if (existing) {
            if (existing.id !== activeId) {
                if (confirm(`Hồ sơ MST ${mst} đã tồn tại. Chuyển sang đó?`)) this.switchTo(existing.id);
            }
            return;
        }

        if (confirm(`Tạo hồ sơ mới cho khách hàng MST: ${mst}?`)) {
            // 1. Lưu lại hồ sơ hiện tại trước khi đi
            this.saveCurrent();

            // 2. Chuẩn bị dữ liệu sạch cho hồ sơ mới (Chỉ giữ lại MST mới)
            const cleanedFields = {
                soDkdn: { value: mst, label: 'Mã số thuế | GPKD' }
            };
            
            const newId = 'sess_' + Date.now();
            const newSession = {
                id: newId,
                name: mst,
                data: { 
                    fields: cleanedFields, 
                    rawScan: '', 
                    calcMap: Storage.get(SK_CALC_MAP) 
                },
                createdAt: Date.now(),
                lastUpdate: Date.now()
            };

            sessions.push(newSession);
            Storage.set(SK_SESSIONS, sessions);
            this.switchTo(newId);
            
            showToast(`✨ Đã tạo hồ sơ khách hàng mới: ${mst}`, "#1e8e3e");
        }
    },

    remove(id) {
        let sessions = this.getAll();
        if (sessions.length <= 1) return;
        sessions = sessions.filter(s => s.id !== id);
        Storage.set(SK_SESSIONS, sessions);
        if (this.getActiveId() === id) this.switchTo(sessions[0].id);
        else this.renderTabs();
    },

    togglePin() {
        const newVal = !this.isPinned();
        Storage.set(LOCAL_KEY_SESSION_BAR_PINNED, newVal);
        this.renderTabs();
        const panel = document.getElementById('vnpt-export-panel');
        if (panel) panel.classList.toggle('session-unpinned', !newVal);
    },

    renderTabs() {
        const container = document.getElementById('vnpt-session-bar');
        if (!container) return;

        // Sắp xếp hồ sơ: Mới cập nhật nhất lên đầu
        const sessions = this.getAll().sort((a, b) => b.updatedAt - a.updatedAt);
        const activeId = this.getActiveId();
        const isPinned = this.isPinned();

        container.innerHTML = '';

        // Pin Button
        const pinBtn = document.createElement('button');
        pinBtn.className = `btn-session-pin ${isPinned ? 'active' : ''}`;
        pinBtn.innerHTML = isPinned ? '📌' : '📎';
        pinBtn.onclick = () => this.togglePin();
        container.appendChild(pinBtn);

        // List Tabs
        const listWrapper = document.createElement('div');
        listWrapper.className = 'session-tabs-list';
        
        // --- Tính năng: Lăn chuột để cuộn ngang mượt mà ---
        listWrapper.addEventListener('wheel', (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                listWrapper.scrollBy({
                    left: e.deltaY * 1.5, // Tăng tốc độ cuộn một chút cho cảm giác lướt
                    behavior: 'smooth'
                });
            }
        }, { passive: false });

        sessions.forEach(s => {
            const tab = document.createElement('div');
            tab.className = `vnpt-session-tab ${s.id === activeId ? 'active' : ''}`;
            const shortName = s.name.length > 15 ? s.name.substring(0, 13) + '..' : s.name;
            tab.innerHTML = `
                <span class="session-name" title="${s.name}">${shortName}</span>
                <span class="session-close">×</span>
            `;
            tab.onclick = () => this.switchTo(s.id);
            tab.querySelector('.session-close').onclick = (e) => {
                e.stopPropagation();
                if (confirm(`Xóa hồ sơ ${s.name}?`)) this.remove(s.id);
            };
            listWrapper.appendChild(tab);
        });
        container.appendChild(listWrapper);

        // Add Button
        const addBtn = document.createElement('button');
        addBtn.className = 'btn-add-session';
        addBtn.innerHTML = '＋';
        addBtn.onclick = () => this.createNew();
        container.appendChild(addBtn);

        const panel = document.getElementById('vnpt-export-panel');
        if (panel) panel.classList.toggle('session-unpinned', !isPinned);
    }
};
