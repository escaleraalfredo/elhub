// lib/useLocalSet.ts
// A tiny persisted set of strings (checklists, follows...), per device.
"use client";

import { useCallback, useSyncExternalStore } from "react";

const cache = new Map<string, string[]>();
const listeners = new Map<string, Set<() => void>>();
const EMPTY: string[] = [];

function read(key: string) {
  if (!cache.has(key)) {
    try {
      cache.set(key, JSON.parse(window.localStorage.getItem(key) ?? "[]") as string[]);
    } catch {
      cache.set(key, []);
    }
  }
  return cache.get(key)!;
}

export function useLocalSet(key: string) {
  const items = useSyncExternalStore(
    (l) => {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key)!.add(l);
      return () => {
        listeners.get(key)!.delete(l);
      };
    },
    () => read(key),
    () => EMPTY
  );
  const toggle = useCallback(
    (id: string) => {
      const cur = read(key);
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      cache.set(key, next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // ignore
      }
      listeners.get(key)?.forEach((l) => l());
    },
    [key]
  );
  return { items, has: (id: string) => items.includes(id), toggle };
}
