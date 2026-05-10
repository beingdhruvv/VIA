import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

/** All Firebase web config must come from env — never commit keys in source. */
function firebaseWebConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}

export const isFirebaseConfigured = (() => {
  const c = firebaseWebConfig();
  return Boolean(c.apiKey && c.authDomain && c.projectId && c.appId);
})();

let app: FirebaseApp | undefined;
let googleProviderSingleton: GoogleAuthProvider | undefined;

function getAppSingleton(): FirebaseApp {
  const config = firebaseWebConfig();
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* in .env.local (see .env.example).",
    );
  }
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(config);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  return getAuth(getAppSingleton());
}

export function getGoogleProvider(): GoogleAuthProvider {
  if (!googleProviderSingleton) {
    googleProviderSingleton = new GoogleAuthProvider();
  }
  return googleProviderSingleton;
}

if (typeof window !== "undefined" && isFirebaseConfigured) {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(getAppSingleton());
    }
  });
}
