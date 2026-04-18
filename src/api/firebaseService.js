import { auth, db } from './firebaseConfig.js';
import { encrypt, decrypt } from '../utils/crypto.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  where,
  serverTimestamp 
} from "firebase/firestore/lite";

export const FirebaseService = {
  /**
   * Đăng ký tài khoản mới
   */
  async signUp(email, password) {
    return await createUserWithEmailAndPassword(auth, email, password);
  },

  /**
   * Đăng nhập
   */
  async signIn(email, password) {
    return await signInWithEmailAndPassword(auth, email, password);
  },

  /**
   * Đăng xuất
   */
  async logout() {
    await signOut(auth);
  },

  /**
   * Theo dõi trạng thái đăng nhập
   */
  onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Đẩy 1 profile lên Cloud
   */
  async pushProfile(profile) {
    const user = auth.currentUser;
    if (!user) throw new Error("Chưa đăng nhập Firebase");

    const profileRef = doc(db, `users/${user.uid}/profiles`, profile.id);
    await setDoc(profileRef, {
      ...profile,
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  /**
   * Lấy tất cả profiles từ Cloud
   */
  async pullProfiles() {
    const user = auth.currentUser;
    if (!user) return [];

    const profilesCol = collection(db, `users/${user.uid}/profiles`);
    const q = query(profilesCol);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => doc.data());
  },

  /**
   * Sao lưu API Keys
   */
  async backupKeys(keys) {
    const user = auth.currentUser;
    if (!user) return;

    const encryptedKeys = {};
    for (const [key, val] of Object.entries(keys)) {
      encryptedKeys[key] = encrypt(val);
    }

    const secretRef = doc(db, `users/${user.uid}/secrets`, "api_keys");
    await setDoc(secretRef, {
      ...encryptedKeys,
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  /**
   * Khôi phục API Keys
   */
  async restoreKeys() {
    const user = auth.currentUser;
    if (!user) return null;

    const secretRef = doc(db, `users/${user.uid}/secrets`, "api_keys");
    const snap = await getDoc(secretRef);
    if (!snap.exists()) return null;

    const cloudKeys = snap.data();
    const decryptedKeys = {};
    for (const [key, val] of Object.entries(cloudKeys)) {
      if (key === 'updatedAt') continue;
      decryptedKeys[key] = decrypt(val);
    }
    return decryptedKeys;
  },

  /**
   * Cập nhật cài đặt người dùng (ví dụ: workspace)
   */
  async updateUserSettings(settings) {
    const user = auth.currentUser;
    if (!user) return;

    const settingsRef = doc(db, `users/${user.uid}/settings`, "general");
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  /**
   * Lấy cài đặt người dùng
   */
  async getUserSettings() {
    const user = auth.currentUser;
    if (!user) return null;

    const settingsRef = doc(db, `users/${user.uid}/settings`, "general");
    const snap = await getDoc(settingsRef);
    return snap.exists() ? snap.data() : null;
  },

  /**
   * Đẩy cấu hình tổng quát lên Cloud (Mapping, Hotkeys, Text Template)
   */
  async pushGlobalConfig(config) {
      const user = auth.currentUser;
      if (!user) return;

      const configRef = doc(db, `users/${user.uid}/settings`, "config");
      await setDoc(configRef, {
          ...config,
          updatedAt: serverTimestamp()
      }, { merge: true });
  },

  /**
   * Khôi phục cấu hình tổng quát từ Cloud
   */
  async pullGlobalConfig() {
      const user = auth.currentUser;
      if (!user) return null;

      const configRef = doc(db, `users/${user.uid}/settings`, "config");
      const snap = await getDoc(configRef);
      return snap.exists() ? snap.data() : null;
  },

  /**
   * Lấy danh sách template dùng chung từ Cloud
   */
  async getSharedTemplates() {
    try {
      const userSettings = await this.getUserSettings();
      const workspaceId = userSettings?.workspace || 'global';

      const templatesCol = collection(db, "shared_templates");
      const q = query(
        templatesCol, 
        where("active", "==", true),
        where("workspace", "==", workspaceId)
      );
      const snapshot = await getDocs(q);
      let list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Nếu không phải global, thì lẫy thêm cả global
      if (workspaceId !== 'global') {
          const qGlobal = query(templatesCol, where("active", "==", true), where("workspace", "==", "global"));
          const snapGlobal = await getDocs(qGlobal);
          const globalList = snapGlobal.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          list = [...list, ...globalList];
      }

      return list;
    } catch (err) {
      console.error("FirebaseService.getSharedTemplates error:", err);
      return [];
    }
  },

  /**
   * Lấy các cấu hình từ xa (Selectors, App Config)
   */
  async getRemoteConfigs() {
    try {
      // Khi chạy trong môi trường Extension, đôi khi Firebase bị chặn bởi CSP của trang web
      // Chúng ta sẽ kiểm tra xem db có tồn tại không trước khi gọi
      if (!db) return null;

      const configRef = doc(db, "settings", "remote_configs");
      const snap = await getDoc(configRef);
      if (snap.exists()) return snap.data();
      return null;
    } catch (err) {
      // Không in error ra console.error để tránh làm đỏ console của user nếu chỉ là lỗi permission
      console.warn("[FirebaseService] Remote config not available (likely permissions or CSP):", err.message);
      return null;
    }
  }
};
