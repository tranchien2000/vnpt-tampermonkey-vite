import { FirebaseService } from '../../api/firebaseService.js';
import { showToast } from '../toast.js';
import { AppState } from '../../core/state.js';
import { loadSavedData } from '../../features/fieldsManager.js';

export function initCloudSyncUI(container) {
  const cloudSection = document.createElement('div');
  cloudSection.className = 'vnpt-cloud-sync-section';
  
  const updateUI = (user) => {
    if (user) {
      cloudSection.innerHTML = `
        <div class="util-submenu-title">☁️ Tài khoản Cloud</div>
        <div class="cloud-user-info" style="padding: 6px 12px; font-size: 11px; display: flex; align-items: center; justify-content: space-between; background: rgba(26, 115, 232, 0.02);">
          <div style="display: flex; align-items: center; gap: 6px;">
            <div style="width: 8px; height: 8px; background: #34a853; border-radius: 50%; box-shadow: 0 0 8px #34a853;"></div>
            <span style="font-weight: 700; color: #3c4043; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${user.email}</span>
          </div>
          <button class="util-btn-logout-mini" id="vnpt-btn-cloud-logout" title="Đăng xuất">Đăng xuất</button>
        </div>

        <div class="util-separator"></div>
        <div class="util-submenu-title">Đồng bộ cá nhân (Firebase)</div>
        <div class="cloud-action-grid">
          <div class="cloud-action-item push" id="vnpt-btn-cloud-push">
            <span class="cloud-action-icon">📤</span>
            <span class="cloud-action-label">Đẩy lên Cloud</span>
          </div>
          <div class="cloud-action-item pull" id="vnpt-btn-cloud-pull">
            <span class="cloud-action-icon">📥</span>
            <span class="cloud-action-label">Kéo về máy</span>
          </div>
        </div>

        <style>
          .cloud-action-grid {
            display: flex;
            gap: 6px;
            padding: 8px 12px;
          }
          .cloud-action-item {
            flex: 1;
            background: #f8f9fa;
            border: 1px solid #dadce0;
            border-radius: 8px;
            padding: 6px 4px;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.04);
            min-height: 32px;
          }
          
          .cloud-action-item:hover {
            background: #fff;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.08);
          }
          
          .cloud-action-item.push:hover { border-color: var(--vnpt-primary); color: var(--vnpt-primary); }
          .cloud-action-item.pull:hover { border-color: var(--vnpt-success); color: var(--vnpt-success); }

          .cloud-action-item:active {
            transform: translateY(0) scale(0.97);
          }
          
          .cloud-action-icon {
            font-size: 14px;
          }

          .cloud-action-label {
            font-size: 10px;
            font-weight: 700;
            white-space: nowrap;
          }

          .util-btn-logout-mini {
            background: #f8f9fa;
            border: 1px solid #dadce0;
            border-radius: 6px;
            padding: 2px 8px;
            font-size: 9px;
            font-weight: 700;
            color: #d93025;
            cursor: pointer;
            transition: all 0.2s;
          }
          .util-btn-logout-mini:hover {
            background: #fdf2f2;
            border-color: #d93025;
          }
        </style>
      `;
      
      
      document.getElementById('vnpt-btn-cloud-logout').onclick = async () => {
        await FirebaseService.logout();
        showToast("👋 Đã đăng xuất!");
      };
      
      document.getElementById('vnpt-btn-cloud-push').onclick = async () => {
        try {
          showToast("⏳ Đang đẩy dữ liệu...");
          
          // 1. Đẩy Profiles
          const { getProfiles } = await import('../../features/profileManager.js');
          const profiles = getProfiles();
          for (const p of profiles) {
            await FirebaseService.pushProfile(p);
          }

          // 2. Đẩy Cấu hình (Mapping, Hotkeys, Text Template, Data mặc định...)
          const { 
              SK_CALC_MAP, SK_HOTKEYS, 
              LOCAL_KEY_FIELDS, SK_TEMPLATES, SK_TAX, 
              SK_DATA_DEF, LOCAL_KEY_DEFAULT_FIELDS,
              SK_ADDRESS_LEARNING, SK_GEMINI_KEY
          } = await import('../../core/constants.js');
          const { Storage } = await import('../../utils/storage.js');
          const { DEFAULT_CALC_MAP } = await import('../../core/defaults.js');
          
          // Dùng DEFAULT_CALC_MAP làm fallback nếu user chưa lưu mapping thủ công
          const globalConfig = {
              calcMap: Storage.get(SK_CALC_MAP) ?? DEFAULT_CALC_MAP,
              hotkeys: Storage.get(SK_HOTKEYS),
              fields: Storage.get(LOCAL_KEY_FIELDS),
              taxRate: Storage.get(SK_TAX),
              templates: Storage.get(SK_TEMPLATES),
              defaultFields: Storage.get(LOCAL_KEY_DEFAULT_FIELDS),
              dataDefault: Storage.get(SK_DATA_DEF),
              addressLearning: Storage.get(SK_ADDRESS_LEARNING),
              geminiKey: Storage.get(SK_GEMINI_KEY) // Đã gộp API Keys vào đây
          };
          await FirebaseService.pushGlobalConfig(globalConfig);

          showToast("✅ Đã đồng bộ lên Cloud!");
        } catch (err) {
          showToast("❌ Lỗi: " + err.message, "#ea4335");
        }
      };
      
      document.getElementById('vnpt-btn-cloud-pull').onclick = async () => {
        try {
          showToast("⏳ Đang kéo dữ liệu...");
          const cloudProfiles = await FirebaseService.pullProfiles();
          const cloudConfig = await FirebaseService.pullGlobalConfig();

          if (cloudProfiles.length === 0 && !cloudConfig) {
            showToast("ℹ️ Không tìm thấy dữ liệu trên Cloud");
            return;
          }
          
          if (confirm(`Tìm thấy ${cloudProfiles.length} bản ghi dữ liệu. Bạn có muốn ghi đè bộ cài đặt Local không?`)) {
             // 1. Áp dụng Profiles
             const { importProfiles } = await import('../../features/profileManager.js');
             importProfiles(cloudProfiles);

             // 2. Áp dụng Cấu hình (Nếu có)
             if (cloudConfig) {
                 const { 
                     SK_CALC_MAP, SK_HOTKEYS, 
                     LOCAL_KEY_FIELDS, SK_TEMPLATES, SK_TAX, 
                     SK_DATA_DEF, LOCAL_KEY_DEFAULT_FIELDS,
                     SK_ADDRESS_LEARNING, SK_GEMINI_KEY
                 } = await import('../../core/constants.js');
                 const { Storage } = await import('../../utils/storage.js');
                 const { DEFAULT_CALC_MAP } = await import('../../core/defaults.js');
                 
                 // Lưu config vào Storage (dùng DEFAULT nếu cloud không có)
                 Storage.set(SK_CALC_MAP, cloudConfig.calcMap ?? DEFAULT_CALC_MAP);
                 if (cloudConfig.hotkeys) Storage.set(SK_HOTKEYS, cloudConfig.hotkeys);
                 if (cloudConfig.fields) Storage.set(LOCAL_KEY_FIELDS, cloudConfig.fields);
                 if (cloudConfig.taxRate !== undefined) Storage.set(SK_TAX, cloudConfig.taxRate);
                 if (cloudConfig.templates) Storage.set(SK_TEMPLATES, cloudConfig.templates);
                 if (cloudConfig.defaultFields) Storage.set(LOCAL_KEY_DEFAULT_FIELDS, cloudConfig.defaultFields);
                 if (cloudConfig.dataDefault) Storage.set(SK_DATA_DEF, cloudConfig.dataDefault);
                 if (cloudConfig.addressLearning) Storage.set(SK_ADDRESS_LEARNING, cloudConfig.addressLearning);
                 
                 // Khôi phục Gemini Key
                 if (cloudConfig.geminiKey) {
                    Storage.set(SK_GEMINI_KEY, cloudConfig.geminiKey);
                    const keyInput = document.getElementById('vnpt-gemini-key');
                    if (keyInput) keyInput.value = cloudConfig.geminiKey;
                 }
             }

             showToast("✅ Đã khôi phục toàn bộ cấu hình!");
             
             // Nạp lại dữ liệu bảng mà không cần refresh trang
             loadSavedData();
          }
        } catch (err) {
          showToast("❌ Lỗi: " + err.message, "#ea4335");
        }
      };

    } else {
      cloudSection.innerHTML = `
        <div class="util-submenu-title">☁️ Tài khoản Cloud</div>
        <div style="padding: 8px; text-align: center;">
          <p style="font-size: 10px; color: #666; margin-bottom: 8px;">Đăng nhập để đồng bộ Profile & API Key giữa các máy tính.</p>
          <button class="vnpt-btn-confirm" id="vnpt-btn-cloud-login-trigger" style="width: 100%; font-size: 12px;">Đăng nhập / Đăng ký</button>
        </div>
      `;
      
      document.getElementById('vnpt-btn-cloud-login-trigger').onclick = () => {
        showLoginModal();
      };
    }
  };

  FirebaseService.onAuthChange(updateUI);
  container.appendChild(cloudSection);
}

function showLoginModal() {
  const overlay = document.createElement('div');
  overlay.className = 'vnpt-pdf-overlay'; // Reusing modal styles
  overlay.innerHTML = `
    <div class="vnpt-pdf-dialog-box" style="width: 320px;">
      <div class="pdf-dlg-header">
        <h3 style="text-align: center;">🔥 Firebase Sync</h3>
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
        <input type="email" id="cloud-email" placeholder="Email" class="cw-map-input" style="height: 36px; font-size: 13px;" autocomplete="new-password">
        <input type="text" id="cloud-password" placeholder="Mật khẩu" class="cw-map-input sensitive-mask" style="height: 36px; font-size: 13px;" autocomplete="new-password">
      </div>
      <div class="vnpt-pdf-actions" style="flex-direction: column; gap: 8px;">
        <button id="btn-do-login" class="vnpt-btn-confirm" style="width: 100%;">Đăng nhập</button>
        <button id="btn-do-signup" class="util-item-small" style="width: 100%; border: none; font-size: 11px;">Chưa có tài khoản? Đăng ký ngay</button>
        <button id="btn-close-cloud" class="pdf-btn-cancel" style="width: 100%;">Đóng</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const emailInp = overlay.querySelector('#cloud-email');
  const passInp = overlay.querySelector('#cloud-password');

  overlay.querySelector('#btn-do-login').onclick = async () => {
    try {
      await FirebaseService.signIn(emailInp.value, passInp.value);
      showToast("✅ Đăng nhập thành công!");
      overlay.remove();
    } catch (err) {
      console.error("[CloudSync] Login Error:", err);
      const msg = err.code === 'auth/operation-not-allowed' 
        ? "Lỗi: Bạn chưa bật Email/Password trong Firebase Console!" 
        : err.message;
      showToast("❌ " + msg, "#ea4335");
    }
  };

  overlay.querySelector('#btn-do-signup').onclick = async () => {
    try {
      if (!emailInp.value || !passInp.value) {
        showToast("⚠️ Vui lòng nhập đầy đủ Email và Mật khẩu", "#ffc107");
        return;
      }
      if (confirm("Đăng ký tài khoản mới với Email này?")) {
        await FirebaseService.signUp(emailInp.value, passInp.value);
        showToast("✅ Đăng ký thành công!");
        overlay.remove();
      }
    } catch (err) {
      console.error("[CloudSync] Signup Error:", err);
      const msg = err.code === 'auth/operation-not-allowed' 
        ? "Lỗi: Bạn chưa bật Email/Password trong Firebase Console!" 
        : err.message;
      showToast("❌ " + msg, "#ea4335");
    }
  };

  overlay.querySelector('#btn-close-cloud').onclick = () => overlay.remove();
}
