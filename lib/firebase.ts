import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

export type FirebaseWebPublicConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

/** Build-time env (inlined on client) or runtime override from `/api/config/firebase`. */
function firebaseWebConfigFromEnv(): FirebaseWebPublicConfig {
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

let runtimeOverride: Partial<FirebaseWebPublicConfig> | null = null;
let app: FirebaseApp | undefined;
let googleProviderSingleton: GoogleAuthProvider | undefined;
let analyticsStarted = false;

function effectiveConfig(): FirebaseWebPublicConfig {
  const env = firebaseWebConfigFromEnv();
  if (!runtimeOverride) return env;
  return {
    apiKey: runtimeOverride.apiKey || env.apiKey,
    authDomain: runtimeOverride.authDomain || env.authDomain,
    projectId: runtimeOverride.projectId || env.projectId,
    storageBucket: runtimeOverride.storageBucket || env.storageBucket,
    messagingSenderId: runtimeOverride.messagingSenderId || env.messagingSenderId,
    appId: runtimeOverride.appId || env.appId,
    measurementId: runtimeOverride.measurementId || env.measurementId,
  };
}

/** True when enough fields exist to initialize the web SDK (build-time or after runtime hydrate). */
export function isFirebaseConfigured(): boolean {
  const c = effectiveConfig();
  return Boolean(c.apiKey && c.authDomain && c.projectId && c.appId);
}

/** Merge server-provided config (same keys as NEXT_PUBLIC_* on the host). Resets Firebase singletons. */
export function initFirebaseFromJson(json: Record<string, string | undefined>) {
  runtimeOverride = {
    apiKey: json.apiKey ?? "",
    authDomain: json.authDomain ?? "",
    projectId: json.projectId ?? "",
    storageBucket: json.storageBucket ?? "",
    messagingSenderId: json.messagingSenderId ?? "",
    appId: json.appId ?? "",
    measurementId: json.measurementId,
  };
  app = undefined;
  googleProviderSingleton = undefined;
  analyticsStarted = false;
}

function startAnalyticsOnce() {
  if (typeof window === "undefined" || analyticsStarted || !isFirebaseConfigured()) return;
  analyticsStarted = true;
  isSupported().then((supported) => {
    if (supported) {
      try {
        getAnalytics(getAppSingleton());
      } catch {
        /* analytics optional */
      }
    }
  });
}

function getAppSingleton(): FirebaseApp {
  const config = effectiveConfig();
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Set FIREBASE_WEB_* or NEXT_PUBLIC_FIREBASE_* (see .env.example).",
    );
  }
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(config);
    startAnalyticsOnce();
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
