import { FirebaseService } from './firebaseService.js';
import { DEFAULT_LABELS } from '../core/constants.js';
import { Storage } from '../utils/storage.js';

const KEY_REMOTE_LABELS = 'vnpt_remote_labels';
const KEY_LAST_FETCH = 'vnpt_remote_last_fetch';
const FETCH_INTERVAL = 3600000; // 1 hour

export const RemoteConfig = {
  activeLabels: { ...DEFAULT_LABELS },

  /**
   * Khởi tạo và đồng bộ labels từ Cloud
   */
  async init() {
    // 1. Load từ cache trước
    const cached = Storage.get(KEY_REMOTE_LABELS);
    if (cached) {
      this.activeLabels = { ...DEFAULT_LABELS, ...cached };
    }

    // 2. Kiểm tra xem có cần fetch mới không
    const lastFetch = Storage.get(KEY_LAST_FETCH) || 0;
    if (Date.now() - lastFetch > FETCH_INTERVAL) {
      await this.refresh();
    }
  },

  /**
   * Fetch bản mới nhất từ Firebase
   */
  async refresh() {
    try {
      const config = await FirebaseService.getRemoteConfigs();
      if (config && config.selectors) {
        this.activeLabels = { ...DEFAULT_LABELS, ...config.selectors };
        Storage.set(KEY_REMOTE_LABELS, config.selectors);
        Storage.set(KEY_LAST_FETCH, Date.now());
        console.log("[RemoteConfig] Selectors updated from Cloud");
      }
    } catch (err) {
      console.error("[RemoteConfig] Failed to fetch remote selectors:", err);
    }
  },

  /**
   * Lấy danh sách labels hiện hành (Gộp Local + Cloud)
   */
  getLabels() {
    return this.activeLabels;
  }
};
