// components/GlobalHeader.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { registerVisit, usePoints } from "@/lib/points";
import { useProfile } from "@/lib/profile";
import { useFetchJson } from "@/lib/useFetchJson";
import type { WeatherResponse } from "@/lib/utilities/weather";

export default function GlobalHeader() {
  const { level } = usePoints();
  const { username } = useProfile();
  const { data } = useFetchJson<WeatherResponse>("/api/weather", 5 * 60_000);
  const alerts = data?.alerts.length ?? 0;

  useEffect(() => {
    registerVisit();
  }, []);

  const ring = Math.round(level.progress * 100);

  return (
    <header className="sticky top-0 z-50 glass pt-[env(safe-area-inset-top)]">
      <div className="max-w-md mx-auto h-14 px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 pressable" aria-label="ElHub inicio">
          <span className="relative w-8 h-8 rounded-[10px] bg-accent-gradient overflow-hidden flex items-center justify-center font-display font-extrabold text-white text-lg shadow-lg shadow-brand/30">
            E
            <span className="absolute bottom-0 inset-x-0 h-[3px] flag-stripe" />
          </span>
          <span className="font-display font-extrabold text-xl tracking-tight">ElHub</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link href="/utilidades/clima" aria-label="Alertas" className="relative p-2 text-zinc-300 pressable">
            <Bell className="w-6 h-6" />
            {alerts > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-brand text-[10px] font-bold text-white flex items-center justify-center">
                {alerts}
              </span>
            )}
          </Link>
          <Link href="/perfil" aria-label={`Tu perfil · nivel ${level.level}`} className="relative pressable ml-1">
            <span
              className="block rounded-full p-[2px]"
              style={{ background: `conic-gradient(var(--brand) ${ring}%, var(--color-zinc-700) ${ring}% 100%)` }}
            >
              <span className="block rounded-full p-[2px] bg-zinc-950">
                <Avatar name={username} size={30} />
              </span>
            </span>
            <span className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-zinc-950 border border-zinc-700 text-[10px] font-bold flex items-center justify-center">
              {level.level}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
