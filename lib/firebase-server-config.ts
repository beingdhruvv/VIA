import type { FirebaseWebPublicConfig } from "@/lib/firebase";

/**
 * Read env at runtime on the server. Uses bracket access so values are not
 * build-inlined to empty (Next replaces literal `process.env.NEXT_PUBLIC_*` at compile time).
 *
 * Prefer `FIREBASE_WEB_*` in `.env.production` so Google Sign-In works without rebuilding
 * after you add keys. Falls back to `NEXT_PUBLIC_FIREBASE_*` when present at runtime.
 */
function readEnv(key: string): string {
  const v = process.env[key];
  return typeof v === "string" ? v.trim() : "";
}

export function getFirebasePublicConfigFromServerEnv(): FirebaseWebPublicConfig {
  return {
    apiKey: readEnv("FIREBASE_WEB_API_KEY") || readEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: readEnv("FIREBASE_WEB_AUTH_DOMAIN") || readEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: readEnv("FIREBASE_WEB_PROJECT_ID") || readEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: readEnv("FIREBASE_WEB_STORAGE_BUCKET") || readEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId:
      readEnv("FIREBASE_WEB_MESSAGING_SENDER_ID") || readEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: readEnv("FIREBASE_WEB_APP_ID") || readEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
    measurementId:
      readEnv("FIREBASE_WEB_MEASUREMENT_ID") || readEnv("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID") || undefined,
  };
}

export function isCompleteFirebasePublicConfig(c: FirebaseWebPublicConfig): boolean {
  return Boolean(c.apiKey && c.authDomain && c.projectId && c.appId);
}

/** For auth pages: non-null only when Google can be enabled from server env. */
export function getFirebaseBootstrapForAuthPages(): FirebaseWebPublicConfig | null {
  const c = getFirebasePublicConfigFromServerEnv();
  return isCompleteFirebasePublicConfig(c) ? c : null;
}
