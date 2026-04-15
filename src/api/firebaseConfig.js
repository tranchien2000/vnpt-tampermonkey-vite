import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCe6R5U0MsHw9aBNl25AZP3ZemFXDKEK9w",
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
