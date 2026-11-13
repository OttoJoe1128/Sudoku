import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAujJkjhPlSUPkBUbZ-XTMw6fKmCUFhLuQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sudokumap.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sudokumap",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sudokumap.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "725064430422",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:725064430422:web:8b73102facc0f368a4dcf7",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-HTDJ1GLMN9"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
