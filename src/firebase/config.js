import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFunctions } from "firebase/functions";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const isConfigured = !!import.meta.env.VITE_FIREBASE_PROJECT_ID;

export const db = isConfigured ? getFirestore(app) : null;
export const storage = isConfigured ? getStorage(app) : null;
export const auth = isConfigured ? getAuth(app) : null;
export const functions = isConfigured ? getFunctions(app, "europe-west8") : null;
export const messaging = (isConfigured && typeof window !== "undefined") ? getMessaging(app) : null;

// Initialize analytics only if configured and in a browser context
export const analytics = (isConfigured && typeof window !== "undefined" && firebaseConfig.measurementId) 
  ? getAnalytics(app) 
  : null;

// Export config for secondary app instances (e.g., user creation without signing out)
export { firebaseConfig };
export default app;
