// components/GlobalHeader.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Bell, Search } from "lucide-react";
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

  return (
    <header className="sticky top-0 z-50 bg-[var(--bar)] pt-[env(safe-area-inset-top)] border-b border-zinc-800">
      <div className="max-w-md mx-auto h-12 px-4 flex items-center justify-between">
        <Link href="/" className="pressable" aria-label="ElHub inicio">
          <span className="font-display italic font-extrabold text-[26px] leading-none tracking-wide">
            EL<span className="text-brand">HUB</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 text-zinc-400">
          <Link href="/noticias" aria-label="Buscar noticias" className="p-2 pressable">
            <Search className="w-5 h-5" />
          </Link>
          <Link href="/utilidades/clima" aria-label="Alertas" className="relative p-2 pressable">
            <Bell className="w-5 h-5" />
            {alerts > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-brand text-[10px] font-bold text-white flex items-center justify-center">
                {alerts}
              </span>
            )}
          </Link>
          <Link href="/perfil" aria-label={`Tu perfil · nivel ${level.level}`} className="relative pressable ml-1">
            <Avatar name={username} size={28} />
            <span className="absolute -bottom-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-sm bg-brand text-[9px] font-bold text-white flex items-center justify-center">
              {level.level}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
