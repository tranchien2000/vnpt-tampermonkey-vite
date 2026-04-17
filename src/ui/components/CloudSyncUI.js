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
          <div class="cloud-action-item" id="vnpt-btn-cloud-push-all" title="Đẩy Dữ liệu & Keys lên Cloud">
            <span class="cloud-action-icon-small">🚀</span>
            <span class="cloud-action-label-small">Đẩy lên</span>
          </div>
          <div class="cloud-action-item" id="vnpt-btn-cloud-pull-all" title="Kéo Dữ liệu & Keys từ Cloud">
            <span class="cloud-action-icon-small">🛬</span>
            <span class="cloud-action-label-small">Kéo về</span>
          </div>
        </div>

        <style>
          .cloud-action-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            padding: 4px 12px 8px 12px;
          }
          .cloud-action-item {
            background: #fff;
            border: 1px solid #e8eaed;
            border-radius: 8px;
            padding: 4px 0;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }
          .cloud-action-item:hover {
            border-color: var(--vnpt-primary);
            background: #f8fbff;
          }
          .cloud-action-icon-small {
            font-size: 13px;
          }
          .cloud-action-label-small {
            font-size: 10px;
            font-weight: 700;
            color: #3c4043;
          }
          .util-btn-logout-mini {
            background: #fdf2f2;
            border: 1px solid #f8d7da;
            border-radius: 4px;
            padding: 2px 8px;
            font-size: 9px;
            font-weight: 700;
            color: #d93025;
            cursor: pointer;
          }
        </style>
      `;
      
      
      document.getElementById('vnpt-btn-cloud-logout').onclick = async () => {
        await FirebaseService.logout();
        showToast("👋 Đã đăng xuất!");
      };
      
      document.getElementById('vnpt-btn-cloud-push-all').onclick = async () => {
        try {
          showToast("⏳ Đang đồng bộ hóa toàn bộ...");
          
          const { getProfiles } = await import('../../features/profileManager.js');
          const { Storage } = await import('../../utils/storage.js');
          const { 
              SK_CALC_MAP, SK_HOTKEYS, SK_GEMINI_KEY,
              LOCAL_KEY_FIELDS, SK_TEMPLATES, SK_TAX, 
              SK_DATA_DEF, LOCAL_KEY_DEFAULT_FIELDS,
              SK_ADDRESS_LEARNING
          } = await import('../../core/constants.js');
          const { DEFAULT_CALC_MAP } = await import('../../core/defaults.js');

          // 1. Đẩy Profiles
          const profiles = getProfiles();
          for (const p of profiles) {
            await FirebaseService.pushProfile(p);
          }

          // 2. Đẩy Cấu hình toàn cục
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

          // 3. Đẩy API Keys
          const geminiKey = Storage.get(SK_GEMINI_KEY);
          if (geminiKey) {
            await FirebaseService.backupKeys({ gemini_key: geminiKey });
          }

          showToast("🚀 Đã đồng bộ Dữ liệu & Keys lên Cloud!");
        } catch (err) {
          showToast("❌ Lỗi: " + err.message, "#ea4335");
        }
      };
      
      document.getElementById('vnpt-btn-cloud-pull-all').onclick = async () => {
        try {
          showToast("⏳ Đang tải toàn bộ dữ liệu...");
          const cloudProfiles = await FirebaseService.pullProfiles();
          const cloudConfig = await FirebaseService.pullGlobalConfig();
          const cloudKeys = await FirebaseService.restoreKeys();

          if (cloudProfiles.length === 0 && !cloudConfig && !cloudKeys) {
            showToast("ℹ️ Không tìm thấy dữ liệu trên Cloud");
            return;
          }
          
          if (confirm(`Tìm thấy dữ liệu đồng bộ. Bạn có muốn ghi đè bộ cài đặt Local hiện tại không?`)) {
             const { Storage } = await import('../../utils/storage.js');
             const { 
                 SK_CALC_MAP, SK_HOTKEYS, SK_GEMINI_KEY,
                 LOCAL_KEY_FIELDS, SK_TEMPLATES, SK_TAX, 
                 SK_DATA_DEF, LOCAL_KEY_DEFAULT_FIELDS,
                 SK_ADDRESS_LEARNING
             } = await import('../../core/constants.js');

             // 1. Áp dụng Profiles
             if (cloudProfiles.length > 0) {
                const { importProfiles } = await import('../../features/profileManager.js');
                importProfiles(cloudProfiles);
             }

             // 2. Áp dụng Cấu hình
             if (cloudConfig) {
                 const { DEFAULT_CALC_MAP } = await import('../../core/defaults.js');
                 Storage.set(SK_CALC_MAP, cloudConfig.calcMap ?? DEFAULT_CALC_MAP);
                 if (cloudConfig.hotkeys) Storage.set(SK_HOTKEYS, cloudConfig.hotkeys);
                 if (cloudConfig.fields) Storage.set(LOCAL_KEY_FIELDS, cloudConfig.fields);
                 if (cloudConfig.taxRate !== undefined) Storage.set(SK_TAX, cloudConfig.taxRate);
                 if (cloudConfig.templates) Storage.set(SK_TEMPLATES, cloudConfig.templates);
                 if (cloudConfig.defaultFields) Storage.set(LOCAL_KEY_DEFAULT_FIELDS, cloudConfig.defaultFields);
                 if (cloudConfig.dataDefault) Storage.set(SK_DATA_DEF, cloudConfig.dataDefault);
                 if (cloudConfig.addressLearning) Storage.set(SK_ADDRESS_LEARNING, cloudConfig.addressLearning);
             }

             // 3. Áp dụng API Keys
             if (cloudKeys && cloudKeys.gemini_key) {
                Storage.set(SK_GEMINI_KEY, cloudKeys.gemini_key);
             }

             showToast("✅ Đã khôi phục Dữ liệu & Keys thành công!");
             
             // --- TỐI ƯU: CẬP NHẬT NÓNG KHÔNG REFRESH TRANG ---
             try {
                // Xóa cache để ép buộc đọc dữ liệu mới vừa lưu
                Storage.clearCache();
                
                // Nạp lại dữ liệu vào bảng Fields (Giao diện chính)
                const { loadSavedData } = await import('../../features/fieldsManager.js');
                loadSavedData(); 
                
                // Nạp lại các biến mặc định cho Data Fill (Nếu đang mở tab này)
                const { initSyncEngine } = await import('../../features/dataFill/syncEngine.js');
                initSyncEngine(); 

                console.log("[CloudSync] Hot-swapped data successfully without reload.");
             } catch (refreshErr) {
                console.warn("[CloudSync] Could not hot-swap all data, suggesting reload.", refreshErr);
                if (confirm("Dữ liệu đã về máy, bạn có muốn tải lại trang để áp dụng hoàn toàn không?")) {
                    location.reload();
                }
             }
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
