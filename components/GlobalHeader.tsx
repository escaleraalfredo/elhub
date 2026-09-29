// components/GlobalHeader.tsx
"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { useGamification } from "@/lib/gamificationContext";

export default function GlobalHeader() {
  const { points, level } = useGamification();
  const progress = Math.min(((points % 500) / 500) * 100, 100);

  return (
    <header className="sticky top-0 z-50 h-14 bg-zinc-950 border-b border-zinc-800">
      <div className="max-w-md mx-auto h-full px-4 flex items-center justify-between">
        <Link href="/noticias" className="flex items-center gap-2">
          <span className="w-8 h-8 bg-pr-red rounded-full flex items-center justify-center text-sm">🇵🇷</span>
          <span className="font-bold text-xl text-white">ElHub</span>
        </Link>

        <Link href="/perfil" className="flex flex-col items-end">
          <span className="bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full flex items-center gap-2 text-xs">
            <span className="text-yellow-400">★</span>
            <span className="font-semibold tabular-nums">{points.toLocaleString()} pts</span>
            <span className="text-zinc-600">•</span>
            <span className="text-emerald-400">Nivel {level}</span>
          </span>
          <span className="w-24 h-1 bg-zinc-800 rounded-full mt-1 overflow-hidden">
            <span
              className="block h-full bg-gradient-to-r from-emerald-400 to-pr-red transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </span>
        </Link>

        <Link href="/settings" className="p-2 -mr-2 text-zinc-400 hover:text-white" aria-label="Configuración">
          <Settings className="w-6 h-6" />
        </Link>
      </div>
    </header>
  );
}
