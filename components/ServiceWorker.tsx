// components/ServiceWorker.tsx
"use client";

import { useEffect } from "react";

/** Registers /sw.js so pages, emergency info and recent data work offline. */
export default function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
