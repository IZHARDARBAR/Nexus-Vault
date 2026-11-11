
// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 👉 Yahan apni wahi keys rehne dein jo aapne Firebase se copy ki theen:
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDoF27Xtk_mYw51ugM8Lv_ltBzMr3umk2Q",
  authDomain: "nexus-vault-85293.firebaseapp.com",
  projectId: "nexus-vault-85293",
  storageBucket: "nexus-vault-85293.firebasestorage.app",
  messagingSenderId: "1075471099392",
  appId: "1:1075471099392:web:eaa131b5f6c920c7e4dae5",
  measurementId: "G-KCK8446N7M"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 👉 YEH 3 LINES LAZMI HONI CHAHIYE (Exports):
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;