import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAxe0KtnX-T0CwwypP7-w1YK34GInLy0w0",
  authDomain: "via-travel-f699a.firebaseapp.com",
  projectId: "via-travel-f699a",
  storageBucket: "via-travel-f699a.firebasestorage.app",
  messagingSenderId: "153689583474",
  appId: "1:153689583474:web:48f500a2baf8187adbf7eb",
  measurementId: "G-02LD2D9VVK"
};

// Initialize Firebase (Singleton pattern to prevent re-initialization in Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth and Provider
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Analytics safely (only runs in browser)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, googleProvider, analytics };
