// src/api/storage/idb.js
const DB_NAME = 'vnpt_templates_db';
const STORE_NAME = 'buffers';

let dbInstance = null;

function getDB() {
    if (dbInstance) return Promise.resolve(dbInstance);
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = e => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = e => {
            dbInstance = e.target.result;
            resolve(dbInstance);
        };
        request.onerror = () => reject(request.error);
    });
}

export async function idbSave(key, arrayBuffer) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(arrayBuffer, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

export async function idbLoad(key) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result); // result is arrayBuffer
        req.onerror = () => reject(req.error);
    });
}

export async function idbDelete(key) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}
