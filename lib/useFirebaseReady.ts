"use client";

import { useEffect, useState } from "react";
import type { FirebaseWebPublicConfig } from "@/lib/firebase";
import { initFirebaseFromJson, isFirebaseConfigured } from "@/lib/firebase";

/**
 * Resolves Firebase for the client:
 * 1) Optional `bootstrap` from the auth Server Component (reads env + `.env.production` on server).
 * 2) Build-inlined `NEXT_PUBLIC_*` if present.
 * 3) `GET /api/config/firebase` as fallback.
 */
export function useFirebaseReady(bootstrap: FirebaseWebPublicConfig | null = null) {
  const [configured, setConfigured] = useState(() => {
    if (
      bootstrap?.apiKey &&
      bootstrap.authDomain &&
      bootstrap.projectId &&
      bootstrap.appId
    ) {
      initFirebaseFromJson(bootstrap);
    }
    return isFirebaseConfigured();
  });

  useEffect(() => {
    if (configured) return;

    let cancelled = false;
    fetch("/api/config/firebase")
      .then((r) => r.json())
      .then((json: Record<string, string | undefined>) => {
        if (cancelled) return;
        initFirebaseFromJson(json);
        setConfigured(isFirebaseConfigured());
      })
      .catch(() => {
        if (!cancelled) setConfigured(false);
      });

    return () => {
      cancelled = true;
    };
  }, [configured]);

  return { configured };
}
