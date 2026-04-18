import { AppState } from '../../core/state.js';
import { Storage } from '../../utils/storage.js';
import {
    LOCAL_KEY_DEFAULT_FIELDS, DEFAULT_LABELS, SK_CALC_MAP, SK_TAX
} from '../../core/constants.js';
import { DEFAULT_DATA, DEFAULT_CALC_MAP } from '../../core/defaults.js';
import { showToast } from '../../ui/toast.js';
import { createRowDOM, updateSyncDirIcon } from './row.js';
import { startFieldLinker } from './linker.js';
import { loadSavedData } from './store.js';

/**
 * Cập nhật giao diện khi chuyển đổi giữa chế độ Mặc định (VNPT) và Cá nhân.
 */
export function updateUIForDefaultMode(isDefault) {
    const btn = document.getElementById('vnpt-btn-default');
    if (!btn) return;

    const container = document.getElementById('vnpt-fields-list');
    const fieldsWrapper = document.getElementById('vnpt-fields-container');
    if (!container) return;

    // 1. Dọn dẹp tuyệt đối
    container.innerHTML = '';
    if (AppState.bannerArea) AppState.bannerArea.innerHTML = '';
    container.scrollTop = 0;

    if (isDefault) {
        btn.classList.add('active');
        btn.innerHTML = '✅ Dữ liệu VNPT';
        if (fieldsWrapper) fieldsWrapper.classList.add('vnpt-mode-default');
        
        showToast("🏢 Chế độ Dữ liệu VNPT (Bên B)", "#ea4335");

        // 2. Tạo một Fragment tổng hợp để tránh Reflow
        const mainFragment = document.createDocumentFragment();

        // 2.1. Nạp bộ Mapping Calculator vào Fragment đầu tiên
        const calcMappingSection = createCalcMappingUI();
        mainFragment.appendChild(calcMappingSection);

        // 2.2. Nạp các trường dữ liệu mặc định tiếp theo
        const overrides = Storage.get(LOCAL_KEY_DEFAULT_FIELDS) || {};
        
        if (Object.keys(overrides).length === 0) {
            // Nạp từ DEFAULT_DATA gốc
            Object.keys(DEFAULT_DATA).forEach(key => {
                const item = DEFAULT_DATA[key];
                const val = (item && typeof item === 'object') ? item.value : item;
                const lbl = (item && typeof item === 'object') ? item.label : (DEFAULT_LABELS[key] || '');
                if (lbl.includes('Calc:') || lbl.includes('🛠️')) return;

                const s = (item && typeof item === 'object' && item.sync) ? item.sync : '';
                const dir = (item && typeof item === 'object' && item.syncDir) ? item.syncDir : 'both';
                
                const row = createRowDOM(key, val, lbl, s, dir);
                if (row) mainFragment.appendChild(row);
            });
        } else {
            // Nạp từ bản ghi đè người dùng đã sửa trong Mode Default
            Object.keys(overrides).forEach(key => {
                const item = overrides[key];
                const lbl = (item && typeof item === 'object') ? (item.label || '') : '';
                const val = (item && typeof item === 'object') ? (item.value || '') : (item || '');
                
                if (lbl.includes('Calc:') || lbl.includes('🛠️')) return;
                
                const row = createRowDOM(key, val, lbl, item.sync || '', item.syncDir || 'both');
                if (row) mainFragment.appendChild(row);
            });
        }

        // 3. Đẩy toàn bộ Fragment vào container một lần duy nhất
        container.appendChild(mainFragment);
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '🛠 Dữ liệu cá nhân';
        if (fieldsWrapper) fieldsWrapper.classList.remove('vnpt-mode-default');
        
        showToast("📝 Chế độ Dữ liệu Cá nhân (Bên A)");
        loadSavedData();
    }
}

/**
 * Tạo Element chứa bảng Mapping Calc (Dùng class riêng để tránh lỗi lưu dữ liệu)
 */
function createCalcMappingUI() {
    const section = document.createElement('div');
    section.className = 'vnpt-calc-mapping-default-section';
    section.style.cssText = 'border: 1px dashed var(--vnpt-primary); border-radius: 8px; padding: 6px; margin-bottom: 8px; background: rgba(26, 115, 232, 0.03);';

    section.innerHTML = `
        <div style="color: #ea4335; font-size: 11px; font-weight: 800; text-align: center; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid rgba(234, 67, 53, 0.2); padding-bottom: 4px;">⚠️ Data Default</div>
        <div class="vnpt-calc-mapping-body" style="display: block; margin-top: 0; padding-top: 0;">
            <div class="vnpt-calc-map-row" style="display: flex; align-items: center; background: none; border: none; padding: 0; margin-bottom: 4px; gap: 8px;">
                <span style="min-width: 70px; font-size: 11px; font-weight: bold;">Trước thuế</span>
                <input data-clink="before" class="cw-map-input" style="flex: 1; height: 26px; font-size: 11px; border: 1px solid #dadce0; border-radius: 4px; padding: 0 6px;" placeholder="Ví dụ: tong_tien_truoc_thue">
                <button class="btn-sync-dir" title="Đồng bộ" data-dir="both" style="height: 22px; width: 22px; flex-shrink: 0; cursor: pointer; border: none; background: transparent;">↔</button>
                <button class="btn-field-link" title="🔗 Link" style="height: 22px; width: 22px; flex-shrink: 0; cursor: pointer; border: none; background: transparent;">🔗</button>
            </div>
            <div class="vnpt-calc-map-row" style="display: flex; align-items: center; background: none; border: none; padding: 0; margin-bottom: 4px; gap: 8px;">
                <span style="min-width: 70px; font-size: 11px; font-weight: bold;">Tiền thuế</span>
                <input data-clink="tax" class="cw-map-input" style="flex: 1; height: 26px; font-size: 11px; border: 1px solid #dadce0; border-radius: 4px; padding: 0 6px;" placeholder="Ví dụ: thue_gtgt">
                <button class="btn-sync-dir" title="Đồng bộ" data-dir="both" style="height: 22px; width: 22px; flex-shrink: 0; cursor: pointer; border: none; background: transparent;">↔</button>
                <button class="btn-field-link" title="🔗 Link" style="height: 22px; width: 22px; flex-shrink: 0; cursor: pointer; border: none; background: transparent;">🔗</button>
            </div>
            <div class="vnpt-calc-map-row" style="display: flex; align-items: center; background: none; border: none; padding: 0; margin-bottom: 4px; gap: 8px;">
                <span style="min-width: 70px; font-size: 11px; font-weight: bold;">Sau thuế</span>
                <input data-clink="after" class="cw-map-input" style="flex: 1; height: 26px; font-size: 11px; border: 1px solid #dadce0; border-radius: 4px; padding: 0 6px;" placeholder="Ví dụ: tong_cong">
                <button class="btn-sync-dir" title="Đồng bộ" data-dir="both" style="height: 22px; width: 22px; flex-shrink: 0; cursor: pointer; border: none; background: transparent;">↔</button>
                <button class="btn-field-link" title="🔗 Link" style="height: 22px; width: 22px; flex-shrink: 0; cursor: pointer; border: none; background: transparent;">🔗</button>
            </div>
            <div class="vnpt-calc-map-row" style="display: flex; align-items: center; background: none; border: none; padding: 0; gap: 8px;">
                <span style="min-width: 70px; font-size: 11px; font-weight: bold;">Bằng chữ</span>
                <input data-clink="text" class="cw-map-input" style="flex: 1; height: 26px; font-size: 11px; border: 1px solid #dadce0; border-radius: 4px; padding: 0 6px;" placeholder="Ví dụ: doc_tien">
                <button class="btn-sync-dir" title="Đồng bộ" data-dir="both" style="height: 22px; width: 22px; flex-shrink: 0; cursor: pointer; border: none; background: transparent;">↔</button>
                <button class="btn-field-link" title="🔗 Link" style="height: 22px; width: 22px; flex-shrink: 0; cursor: pointer; border: none; background: transparent;">🔗</button>
            </div>
        </div>
    `;

    const calcMaps = Storage.get(SK_CALC_MAP) || { ...DEFAULT_CALC_MAP };
    section.querySelectorAll('.vnpt-calc-map-row').forEach(row => {
        const inp = row.querySelector('input[data-clink]');
        const btnSyncDir = row.querySelector('.btn-sync-dir');
        const linkBtn = row.querySelector('.btn-field-link');
        const k = inp.dataset.clink;

        const mapInfo = calcMaps[k] || [];
        const currentSync = Array.isArray(mapInfo) ? mapInfo : (mapInfo.sync || []);
        const currentDir = Array.isArray(mapInfo) ? 'both' : (mapInfo.syncDir || 'both');

        inp.value = currentSync.join(', ');
        if (btnSyncDir) {
            updateSyncDirIcon(btnSyncDir, currentDir);
            btnSyncDir.onclick = (e) => {
                e.preventDefault();
                let dir = btnSyncDir.getAttribute('data-dir');
                dir = dir === 'both' ? 'down' : (dir === 'down' ? 'up' : 'both');
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
            showToast(`✅ Cập nhật mapping: ${k}`);
        };

        inp.addEventListener('change', saveMap);
        linkBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            startFieldLinker(row, inp);
        };
    });

    return section;
}

/**
 * Hàm hỗ trợ nạp mapping độc lập nếu cần
 */
export function renderCalcMappingInBanner() {
    const container = document.getElementById('vnpt-fields-list');
    if (container) {
        // Kiểm tra xem đã có mapping chưa để tránh nạp trùng
        if (!container.querySelector('.vnpt-calc-mapping-default-section')) {
            container.prepend(createCalcMappingUI());
        }
    }
}
