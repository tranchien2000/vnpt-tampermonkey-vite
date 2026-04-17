import { initializeApp } from "/vendor/.vite-deps-firebase_app.js__v--2dbe45b8.js";
import { getAuth } from "/vendor/.vite-deps-firebase_auth.js__v--2dbe45b8.js";
import { getFirestore } from "/vendor/.vite-deps-firebase_firestore_lite.js__v--2dbe45b8.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "vnpt-cloud-sync.firebaseapp.com",
  projectId: "vnpt-cloud-sync",
  storageBucket: "vnpt-cloud-sync.firebasestorage.app",
  messagingSenderId: "1034099532877",
  appId: "1:1034099532877:web:3bcbe2ab0ea8fae524e804",
  measurementId: "G-650CYB84PL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
