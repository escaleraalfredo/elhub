// components/AlertBanner.tsx
// Red banner under the header when the National Weather Service has an
// urgent alert for Puerto Rico (hurricane, tropical storm, flash flood...).
"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, X } from "lucide-react";
import { useFetchJson } from "@/lib/useFetchJson";
import type { WeatherResponse } from "@/lib/utilities/weather";

export default function AlertBanner() {
  const { data } = useFetchJson<WeatherResponse>("/api/weather", 5 * 60_000);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const urgent = data?.alerts.find((a) => a.urgent);
  const nearStorm = data?.storms.find((s) => s.distanceKm < 800);
  const key = urgent?.id ?? (nearStorm ? `storm-${nearStorm.id}` : null);
  if (!key || dismissed === key) return null;

  const text = urgent
    ? urgent.event
    : `${nearStorm!.kind} ${nearStorm!.name} a ${nearStorm!.distanceKm.toLocaleString()} km de Puerto Rico`;

  return (
    <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-40 bg-red-600 text-white">
      <div className="max-w-md mx-auto flex items-center gap-2 px-4 py-2.5">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <Link href="/utilidades/clima" className="flex-1 min-w-0 text-sm font-semibold leading-tight">
          <span className="block truncate">{text}</span>
          <span className="text-xs font-normal opacity-90">Toca para ver detalles y cómo prepararte</span>
        </Link>
        <button onClick={() => setDismissed(key)} aria-label="Cerrar alerta" className="p-1 opacity-80 hover:opacity-100">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
