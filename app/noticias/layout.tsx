"use client";

import type { ReactNode } from "react";
import { NewsProvider } from "@/lib/newsContext";

export default function NoticiasLayout({ children }: { children: ReactNode }) {
  return <NewsProvider>{children}</NewsProvider>;
}
