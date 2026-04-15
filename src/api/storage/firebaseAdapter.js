import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import app from "../firebaseConfig.js";

const storage = getStorage(app);

export const firebaseAdapter = {
  /**
   * Upload data to Firebase Storage
   * @param {File|Blob|ArrayBuffer} data 
   * @param {object} options 
   * @param {string} options.path - Destination path in storage
   * @param {string} options.contentType - Optional content type
   * @returns {Promise<string>} Download URL
   */
  async upload(data, options = {}) {
    if (!options.path) throw new Error("Path is required for Firebase Storage upload");
    
    const storageRef = ref(storage, options.path);
    const metadata = options.contentType ? { contentType: options.contentType } : {};
    
    await uploadBytes(storageRef, data, metadata);
    return await getDownloadURL(storageRef);
  },

  /**
   * Download data from Firebase Storage
   * @param {string} source - The path or URL of the file
   * @param {string} type - 'blob', 'arraybuffer', etc (handled via fetch)
   * @returns {Promise<any>}
   */
  async download(source, type = 'blob') {
    let url = source;
    if (!source.startsWith('http')) {
      const storageRef = ref(storage, source);
      url = await getDownloadURL(storageRef);
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download from ${url}`);

    switch (type.toLowerCase()) {
      case 'blob': return await response.blob();
      case 'arraybuffer': return await response.arrayBuffer();
      case 'text': return await response.text();
      case 'json': return await response.json();
      default: return await response.blob();
    }
  }
};
