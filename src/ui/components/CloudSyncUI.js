import { FirebaseService } from '../../api/firebaseService.js';
import { showToast } from '../toast.js';
import { AppState } from '../../core/state.js';

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
        <div class="util-submenu-title">Đồng bộ cá nhân</div>
        <div class="cloud-action-grid">
          <div class="cloud-action-item" id="vnpt-btn-cloud-push">
            <div class="cloud-action-icon">📤</div>
            <div class="cloud-action-content">
              <div class="cloud-action-label">Đẩy dữ liệu</div>
              <div class="cloud-action-desc">Lên Cloud</div>
            </div>
          </div>
          <div class="cloud-action-item" id="vnpt-btn-cloud-pull">
            <div class="cloud-action-icon">📥</div>
            <div class="cloud-action-content">
              <div class="cloud-action-label">Kéo dữ liệu</div>
              <div class="cloud-action-desc">Về máy này</div>
            </div>
          </div>
        </div>

        <style>
          .cloud-action-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            padding: 8px 12px;
          }
          .cloud-action-item {
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            padding: 6px 4px;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            text-align: left;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
            gap: 8px;
          }
          .cloud-action-item:hover {
            border-color: var(--vnpt-primary);
            background: var(--vnpt-primary-light);
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(26, 115, 232, 0.1);
          }
          .cloud-action-item:active {
            transform: translateY(0);
          }
          .cloud-action-icon {
            font-size: 14px;
            margin-bottom: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8f9fa;
            border-radius: 6px;
            flex-shrink: 0;
          }
          .cloud-action-content {
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          .cloud-action-label {
            font-size: 10px;
            font-weight: 700;
            color: #3c4043;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .cloud-action-desc {
            font-size: 8px;
            color: #70757a;
            margin-top: 0px;
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
              addressLearning: Storage.get(SK_ADDRESS_LEARNING)
          };
          await FirebaseService.pushGlobalConfig(globalConfig);

          // 3. Đẩy Keys
          const geminiKey = Storage.get(SK_GEMINI_KEY);
          if (geminiKey) {
            await FirebaseService.backupKeys({ gemini_key: geminiKey });
          }

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

                 // Khôi phục Keys nếu có
                 const keys = await FirebaseService.restoreKeys();
                 if (keys && keys.gemini_key) {
                   Storage.set(SK_GEMINI_KEY, keys.gemini_key);
                 }
             }

             showToast("✅ Đã khôi phục toàn bộ cấu hình!");
             setTimeout(() => {
                if (typeof window.__vnptCleanup === 'function' && typeof window.__vnptInit === 'function') {
                    window.__vnptCleanup();
                    setTimeout(window.__vnptInit, 50);
                } else {
                    location.reload();
                }
             }, 500);
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
