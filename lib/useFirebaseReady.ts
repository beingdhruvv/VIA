"use client";

import { useEffect, useState } from "react";
import type { FirebaseWebPublicConfig } from "@/lib/firebase";
import { initFirebaseFromJson, isFirebaseConfigured } from "@/lib/firebase";

/**
 * Resolves Firebase for the client:
 * 1) Optional `bootstrap` from the auth Server Component (reads `FIREBASE_WEB_*` at request time).
 * 2) Build-inlined `NEXT_PUBLIC_*` if present.
 * 3) `GET /api/config/firebase` as fallback.
 */
export function useFirebaseReady(bootstrap: FirebaseWebPublicConfig | null = null) {
  const [ready, setReady] = useState(() => {
    if (
      bootstrap?.apiKey &&
      bootstrap.authDomain &&
      bootstrap.projectId &&
      bootstrap.appId
    ) {
      initFirebaseFromJson(bootstrap);
      return true;
    }
    return isFirebaseConfigured();
  });

  const [configured, setConfigured] = useState(() => isFirebaseConfigured());

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
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [configured]);

  return { ready, configured: ready && configured };
}
