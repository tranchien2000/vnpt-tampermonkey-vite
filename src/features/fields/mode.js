import { AppState } from '../../core/state.js';
import { Storage } from '../../utils/storage.js';
import {
    LOCAL_KEY_DEFAULT_FIELDS, DEFAULT_LABELS, SK_CALC_MAP, SK_TAX
} from '../../core/constants.js';
import { DEFAULT_DATA, DEFAULT_CALC_MAP } from '../../core/defaults.js';
import { showToast } from '../../ui/toast.js';
import { addOrUpdateFieldRow, updateSyncDirIcon } from './row.js';
import { startFieldLinker } from './linker.js';
import { loadSavedData } from './store.js';

export function updateUIForDefaultMode(isDefault) {
    const btn = document.getElementById('vnpt-btn-default');
    if (!btn) return;

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
                const dir = (item && typeof item === 'object' && item.syncDir) ? item.syncDir : 'down';
                addOrUpdateFieldRow(key, val, lbl, s, dir);
            });
        } else {
            Object.keys(overrides).forEach(key => {
                const item = overrides[key];
                addOrUpdateFieldRow(key, item.value, item.label, item.sync || '', item.syncDir || 'both');
            });
        }

        renderCalcMappingInBanner();
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '🛠 Dữ liệu mặc định VNPT';
        document.getElementById('vnpt-fields-container').classList.remove('vnpt-mode-default');
        showToast("📋 Đã quay lại Dữ liệu cá nhân");
        loadSavedData();
    }
}

export function renderCalcMappingInBanner() {
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
