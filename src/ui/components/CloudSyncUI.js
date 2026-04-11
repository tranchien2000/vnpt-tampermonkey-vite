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
        <div class="cloud-user-info" style="padding: 4px 12px; font-size: 11px; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 700; color: var(--vnpt-success);">● ${user.email}</span>
          <button class="util-item-small danger" id="vnpt-btn-cloud-logout" style="width: auto; padding: 2px 8px;">Đăng xuất</button>
        </div>
        
        <div class="workspace-area" style="padding: 4px 8px; border-top: 1px solid var(--vnpt-border); margin-top: 4px;">
          <div style="font-size: 9px; font-weight: 800; color: #1a73e8; margin-bottom: 2px; text-transform: uppercase;">Workspace / Cơ quan</div>
          <div style="display: flex; gap: 4px;">
            <input type="text" id="vnpt-workspace-id" placeholder="Mã Workspace (VD: HaNoi_CA)" class="cw-map-input" style="height: 24px; font-size: 10px;">
            <button class="util-item-small" id="vnpt-btn-save-workspace" style="width: auto; padding: 0 8px; height: 24px;">Lưu</button>
          </div>
        </div>

        <div class="util-separator"></div>
        <div class="util-submenu-title">Đồng bộ cá nhân</div>
        <div class="util-action-row">
          <button class="util-item-small" id="vnpt-btn-cloud-push">📤 Đẩy dữ liệu</button>
          <button class="util-item-small" id="vnpt-btn-cloud-pull">📥 Kéo dữ liệu</button>
        </div>
        <div class="util-action-row" style="margin-top: 2px;">
          <button class="util-item-small" id="vnpt-btn-cloud-keys-push" style="background: var(--vnpt-primary-light); color: var(--vnpt-primary);">💾 Sao lưu Keys</button>
          <button class="util-item-small" id="vnpt-btn-cloud-keys-pull" style="background: var(--vnpt-primary-light); color: var(--vnpt-primary);">🔄 Khôi phục Keys</button>
        </div>
      `;
      
      // Load current workspace
      FirebaseService.getUserSettings().then(settings => {
        if (settings && settings.workspace) {
          document.getElementById('vnpt-workspace-id').value = settings.workspace;
        }
      });

      document.getElementById('vnpt-btn-save-workspace').onclick = async () => {
        const id = document.getElementById('vnpt-workspace-id').value.trim();
        try {
          await FirebaseService.updateUserSettings({ workspace: id || 'global' });
          showToast("✅ Đã cập nhật Workspace: " + (id || 'global'));
          // Refresh templates if open
          const tmplContainer = document.getElementById('vnpt-template-manager');
          if (tmplContainer && tmplContainer.dataset.activeTab === 'cloud') {
              const { renderTemplateManager } = await import('../../features/templateManager.js');
              renderTemplateManager(tmplContainer, AppState.onSelectTemplate, AppState.templateName);
          }
        } catch (err) {
          showToast("❌ Lỗi: " + err.message, "#ea4335");
        }
      };
      
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

          // 2. Đẩy Cấu hình (Mapping, Hotkeys, Text Template)
          const { SK_CALC_MAP, SK_HOTKEYS, SK_TXT_TEMPLATE } = await import('../../core/constants.js');
          const { Storage } = await import('../../utils/storage.js');
          const { DEFAULT_CALC_MAP } = await import('../../core/defaults.js');
          // Dùng DEFAULT_CALC_MAP làm fallback nếu user chưa lưu mapping thủ công
          const globalConfig = {
              calcMap: Storage.get(SK_CALC_MAP) ?? DEFAULT_CALC_MAP,
              hotkeys: Storage.get(SK_HOTKEYS),
              textTemplate: Storage.get(SK_TXT_TEMPLATE)
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
                 const { SK_CALC_MAP, SK_HOTKEYS, SK_TXT_TEMPLATE } = await import('../../core/constants.js');
                 const { Storage } = await import('../../utils/storage.js');
                 const { DEFAULT_CALC_MAP } = await import('../../core/defaults.js');
                 // Lưu calcMap vào Storage (dùng DEFAULT nếu cloud không có)
                 Storage.set(SK_CALC_MAP, cloudConfig.calcMap ?? DEFAULT_CALC_MAP);
                 if (cloudConfig.hotkeys) Storage.set(SK_HOTKEYS, cloudConfig.hotkeys);
                 if (cloudConfig.textTemplate) Storage.set(SK_TXT_TEMPLATE, cloudConfig.textTemplate);
             }

             showToast("✅ Đã khôi phục toàn bộ cấu hình!");
             setTimeout(() => location.reload(), 1000);
          }
        } catch (err) {
          showToast("❌ Lỗi: " + err.message, "#ea4335");
        }
      };

      document.getElementById('vnpt-btn-cloud-keys-push').onclick = async () => {
        try {
          const { SK_GEMINI_KEY } = await import('../../core/constants.js');
          const { Storage } = await import('../../utils/storage.js');
          const geminiKey = Storage.get(SK_GEMINI_KEY);
          
          if (!geminiKey) {
            showToast("ℹ️ Không tìm thấy Gemini Key để sao lưu");
            return;
          }
          
          showToast("⏳ Đang sao lưu Keys...");
          await FirebaseService.backupKeys({ gemini_key: geminiKey });
          showToast("✅ Đã sao lưu API Keys lên Cloud!");
        } catch (err) {
          showToast("❌ Lỗ: " + err.message, "#ea4335");
        }
      };
      
      document.getElementById('vnpt-btn-cloud-keys-pull').onclick = async () => {
        try {
          showToast("⏳ Đang khôi phục Keys...");
          const keys = await FirebaseService.restoreKeys();
          if (!keys || !keys.gemini_key) {
            showToast("ℹ️ Không tìm thấy Keys trên Cloud");
            return;
          }
          
          const { SK_GEMINI_KEY } = await import('../../core/constants.js');
          const { Storage } = await import('../../utils/storage.js');
          Storage.set(SK_GEMINI_KEY, keys.gemini_key);
          showToast("✅ Đã khôi phục API Keys từ Cloud!");
          setTimeout(() => location.reload(), 1000);
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
        <input type="email" id="cloud-email" placeholder="Email" class="cw-map-input" style="height: 36px; font-size: 13px;">
        <input type="password" id="cloud-password" placeholder="Mật khẩu" class="cw-map-input" style="height: 36px; font-size: 13px;">
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
