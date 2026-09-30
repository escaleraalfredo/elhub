// components/GlobalHeader.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Flame, Settings } from "lucide-react";
import { registerVisit, usePoints } from "@/lib/points";

export default function GlobalHeader() {
  const { total, level, streak } = usePoints();

  useEffect(() => {
    registerVisit();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur">
      <div className="max-w-md mx-auto h-14 px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="ElHub inicio">
          <span className="relative w-8 h-8 rounded-[10px] bg-brand overflow-hidden flex items-center justify-center font-display font-extrabold text-white text-lg">
            E
            <span className="absolute bottom-0 inset-x-0 h-1 flag-stripe" />
          </span>
          <span className="font-display font-extrabold text-xl tracking-tight">ElHub</span>
        </Link>

        <Link href="/perfil" className="flex flex-col items-end" aria-label="Tu perfil y puntos">
          <span className="bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full flex items-center gap-2 text-xs">
            <span className="text-yellow-400">★</span>
            <span className="font-semibold tabular-nums">{total.toLocaleString()} pts</span>
            <span className="text-zinc-600">•</span>
            <span className="text-palm font-semibold">Nv. {level.level}</span>
            {streak > 1 && (
              <span className="flex items-center text-orange-400 font-semibold">
                <Flame className="w-3.5 h-3.5" />
                {streak}
              </span>
            )}
          </span>
          <span className="w-24 h-1 bg-zinc-800 rounded-full mt-1 overflow-hidden">
            <span
              className="block h-full bg-gradient-to-r from-palm to-brand transition-all duration-300"
              style={{ width: `${Math.round(level.progress * 100)}%` }}
            />
          </span>
        </Link>

        <Link href="/settings" className="p-2 -mr-2 text-zinc-400 hover:text-ink" aria-label="Configuración">
          <Settings className="w-6 h-6" />
        </Link>
      </div>
      <div className="h-0.5 flag-stripe opacity-80" />
    </header>
  );
}
