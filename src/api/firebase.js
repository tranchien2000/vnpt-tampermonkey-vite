/**
 * firebase.js – Khởi tạo Firebase và export các services
 *
 * Tier 1:
 *  - Auth (Anonymous sign-in)
 *  - Firestore (sync config, cloud templates metadata)
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { getDatabase, ref as rtdbRef, set as rtdbSet, get as rtdbGet, remove as rtdbRemove } from 'firebase/database';
import { firebaseConfig } from '../core/firebaseConfig.js';
import { logger } from '../utils/logger.js';

// ── Init ──────────────────────────────────────────────────
let app = null;
let auth = null;
let db = null;
let rtdb = null;
let currentUser = null;

export function initFirebase() {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    rtdb = getDatabase(app);

    // Auto sign-in anonymously
    signInAnonymously(auth)
      .then(() => logger.info('[Firebase] Anonymous sign-in OK'))
      .catch(err => logger.error('[Firebase] Sign-in error:', err));

    onAuthStateChanged(auth, user => {
      currentUser = user;
      if (user) {
        logger.info(`[Firebase] UID: ${user.uid}`);
        window.__firebaseUID = user.uid;
      }
    });

    logger.info('[Firebase] Initialized');
  } catch (err) {
    logger.error('[Firebase] Init failed:', err);
  }
}

export function getUID() {
  return currentUser?.uid ?? null;
}

// ── Firestore helpers ──────────────────────────────────────

/** Đọc user config từ Firestore */
export async function loadUserConfig() {
  const uid = getUID();
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'config', 'main'));
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    logger.error('[Firebase] loadUserConfig error:', err);
    return null;
  }
}

/** Ghi user config lên Firestore */
export async function saveUserConfig(data) {
  const uid = getUID();
  if (!uid) return;
  try {
    await setDoc(doc(db, 'users', uid, 'config', 'main'), {
      ...data,
      updatedAt: serverTimestamp()
    });
    logger.info('[Firebase] User config saved');
  } catch (err) {
    logger.error('[Firebase] saveUserConfig error:', err);
  }
}

// ── Cloud Templates ────────────────────────────────────────

/** Lấy danh sách template metadata từ Firestore */
export async function listCloudTemplates() {
  try {
    const snap = await getDocs(collection(db, 'templates'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    logger.error('[Firebase] listCloudTemplates error:', err);
    return [];
  }
}

/**
 * Upload template metadata lên Firestore và base64 content lên RTDB
 * @param {string} base64Data – dữ liệu base64 (chỉ phần content, bỏ data:URL header)
 * @param {string} name – Tên hiển thị
 * @param {string} [description] – Mô tả
 */
export async function uploadCloudTemplate(base64Data, name, description = '') {
  const uid = getUID();
  try {
    // 1. Sinh ID metadata trên Firestore
    const newDocRef = doc(collection(db, 'templates'));
    
    // 2. Ghi base64 string lên Realtime Database (không sợ limit size 1MB)
    const fileRef = rtdbRef(rtdb, `template_files/${newDocRef.id}`);
    await rtdbSet(fileRef, base64Data);

    // 3. Lưu thông tin (metadata) vào Firestore để query nhanh
    await setDoc(newDocRef, {
      name,
      description,
      uploadedBy: uid ?? 'unknown',
      createdAt: serverTimestamp()
    });

    logger.info(`[Firebase] Template uploaded to RTDB: ${newDocRef.id}`);
    return newDocRef.id;
  } catch (err) {
    logger.error('[Firebase] uploadCloudTemplate error:', err);
    return null;
  }
}

/**
 * Download metadata mẩu tin từ RTDB và convert nó về ArrayBuffer
 * @param {string} templateId
 */
export async function downloadCloudTemplateArrayBuffer(templateId) {
  try {
    const fileSnap = await rtdbGet(rtdbRef(rtdb, `template_files/${templateId}`));
    if (!fileSnap.exists()) return null;
    
    const base64Data = fileSnap.val();
    const binary = atob(base64Data);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (err) {
    logger.error('[Firebase] downloadCloudTemplateArrayBuffer error:', err);
    return null;
  }
}

/** Xoá template (Xoá cả Firestore DB lẫn RTDB) */
export async function deleteCloudTemplate(templateId) {
  try {
    // Xoá nội dung file bên RTDB
    await rtdbRemove(rtdbRef(rtdb, `template_files/${templateId}`));
    
    // Xoá metadata bên Firestore
    await deleteDoc(doc(db, 'templates', templateId));
    
    logger.info(`[Firebase] Template deleted: ${templateId}`);
  } catch (err) {
    logger.error('[Firebase] deleteCloudTemplate error:', err);
  }
}
