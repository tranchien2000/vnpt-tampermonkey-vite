import { FirebaseService } from './firebaseService.js';
import { DEFAULT_LABELS, APP_VERSION } from '../core/constants.js';
import { Storage } from '../utils/storage.js';

const KEY_REMOTE_LABELS = 'vnpt_remote_labels';
const KEY_LAST_FETCH = 'vnpt_remote_last_fetch';
const KEY_REMOTE_INFO = 'vnpt_remote_info';
const FETCH_INTERVAL = 3600000; // 1 hour

// URL trỏ tới file version.config.json trên repo của bạn
const UPDATE_METADATA_URL = 'https://raw.githubusercontent.com/tranchien2000/vnpt-tampermonkey-vite/main/version.json';

export const RemoteConfig = {
  activeLabels: { ...DEFAULT_LABELS },
  info: {
    latestVersion: APP_VERSION,
    updateUrl: '',
    message: ''
  },

  /**
   * Khởi tạo và đồng bộ labels từ Cloud & GitHub
   */
  async init() {
    // 1. Load từ cache trước
    const cached = Storage.get(KEY_REMOTE_LABELS);
    if (cached) {
      this.activeLabels = { ...DEFAULT_LABELS, ...cached };
    }

    const cachedInfo = Storage.get(KEY_REMOTE_INFO);
    if (cachedInfo) {
      this.info = { ...this.info, ...cachedInfo };
    }

    // 2. Kiểm tra xem có cần fetch mới không
    const lastFetch = Storage.get(KEY_LAST_FETCH) || 0;
    if (Date.now() - lastFetch > FETCH_INTERVAL) {
      await this.refresh();
    }
  },

  /**
   * Fetch bản mới nhất từ Firebase (Selectors) & GitHub (Version)
   */
  async refresh() {
    try {
      // 1. Lấy Selectors từ Firebase (đã có sẵn)
      // Bọc trong try-catch riêng để nếu Firebase lỗi thì vẫn fetch được GitHub
      try {
        const config = await FirebaseService.getRemoteConfigs();
        if (config && config.selectors) {
          this.activeLabels = { ...DEFAULT_LABELS, ...config.selectors };
          Storage.set(KEY_REMOTE_LABELS, config.selectors);
        }
      } catch (fError) {
        console.warn("[RemoteConfig] Firebase fetch skipped.");
      }

      // 2. Lấy Thông tin Update từ GitHub
      // Dùng GM_xmlhttpRequest nếu có, hoặc fetch thông thường
      const response = await fetch(`${UPDATE_METADATA_URL}?t=${Date.now()}`);
      if (response.ok) {
        const githubInfo = await response.json();
        if (githubInfo) {
          this.info = {
            latestVersion: githubInfo.version || APP_VERSION,
            updateUrl: githubInfo.updateUrl || '',
            message: githubInfo.message || ''
          };
          Storage.set(KEY_REMOTE_INFO, this.info);
          console.log("[RemoteConfig] Update info fetched from GitHub:", this.info.latestVersion);
        }
      }

      Storage.set(KEY_LAST_FETCH, Date.now());
    } catch (err) {
      console.error("[RemoteConfig] Failed to fetch remote config:", err);
    }
  },

  /**
   * Lấy danh sách labels hiện hành (Gộp Local + Cloud)
   */
  getLabels() {
    return this.activeLabels;
  },

  /**
   * Kiểm tra xem có bản cập nhật mới không
   */
  hasUpdate() {
    try {
        const v1 = APP_VERSION.split('.').map(Number);
        const v2 = this.info.latestVersion.split('.').map(Number);
        
        for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
            const num1 = v1[i] || 0;
            const num2 = v2[i] || 0;
            if (num2 > num1) return true;
            if (num2 < num1) return false;
        }
    } catch (e) {}
    return false;
  }
};
