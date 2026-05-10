"use client";

import { useEffect, useState } from "react";
import { initFirebaseFromJson, isFirebaseConfigured } from "@/lib/firebase";

/**
 * Resolves Firebase for the client: uses inlined NEXT_PUBLIC_* if present,
 * otherwise fetches `/api/config/firebase` (server reads `.env.production` at runtime).
 */
export function useFirebaseReady() {
  const [ready, setReady] = useState(() => isFirebaseConfigured());
  const [configured, setConfigured] = useState(() => isFirebaseConfigured());

  useEffect(() => {
    if (isFirebaseConfigured()) {
      setReady(true);
      setConfigured(true);
      return;
    }

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
  }, []);

  return { ready, configured: ready && configured };
}
