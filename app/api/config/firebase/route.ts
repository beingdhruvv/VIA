import { NextResponse } from "next/server";
import { getFirebasePublicConfigFromServerEnv } from "@/lib/firebase-server-config";

/**
 * Public Firebase web SDK fields. Prefer `FIREBASE_WEB_*` in `.env.production` so values
 * are read at runtime (Next may inline empty `NEXT_PUBLIC_*` at build if keys were missing then).
 */
export async function GET() {
  const c = getFirebasePublicConfigFromServerEnv();
  return NextResponse.json(c, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
