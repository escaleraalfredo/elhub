// lib/useFetchJson.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Fetch JSON on mount, on `refresh()`, and optionally every `intervalMs`. */
export function useFetchJson<T>(url: string | null, intervalMs?: number) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const seq = useRef(0);

  const run = useCallback(async () => {
    if (!url) return;
    const id = ++seq.current;
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as T;
      if (id === seq.current) {
        setData(json);
        setError(null);
      }
    } catch (e) {
      if (id === seq.current) setError(e instanceof Error ? e.message : "Error");
    } finally {
      if (id === seq.current) setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    const first = setTimeout(run, 0);
    if (!intervalMs) return () => clearTimeout(first);
    const timer = setInterval(run, intervalMs);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [run, intervalMs]);

  const refresh = useCallback(() => {
    setLoading(true);
    return run();
  }, [run]);

  return { data, error, loading, refresh };
}
