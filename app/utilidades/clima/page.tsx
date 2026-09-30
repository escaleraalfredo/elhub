// app/utilidades/clima/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronRight, CloudRain, Wind } from "lucide-react";
import { Card, EmptyState, Notice, PageContent, PageHeader, PageShell, SectionTitle, Skeleton } from "@/components/ui/Page";
import SafeImg from "@/components/ui/SafeImg";
import { useFetchJson } from "@/lib/useFetchJson";
import { useProfile } from "@/lib/profile";
import { WEATHER_ZONES, weatherZoneFor } from "@/lib/utilities/municipios";
import type { WeatherResponse } from "@/lib/utilities/weather";
import { cn } from "@/lib/utils";

const ES_DAYS: Record<string, string> = {
  Today: "Hoy", Tonight: "Esta noche", "This Afternoon": "Esta tarde", Monday: "Lunes", Tuesday: "Martes",
  Wednesday: "Miércoles", Thursday: "Jueves", Friday: "Viernes", Saturday: "Sábado", Sunday: "Domingo",
};
const periodName = (n: string) =>
  ES_DAYS[n] ?? n.replace(/ Night$/, " noche").replace(/^(\w+)/, (d) => ES_DAYS[d] ?? d);

function inSeason(d = new Date()) {
  const m = d.getMonth() + 1;
  return m >= 6 && m <= 11;
}

export default function ClimaPage() {
  const { pueblo } = useProfile();
  const [zone, setZone] = useState<string | null>(null);
  const activeZone = zone ?? (pueblo ? weatherZoneFor(pueblo) : "San Juan");
  const { data } = useFetchJson<WeatherResponse>(`/api/weather?zone=${encodeURIComponent(activeZone)}`, 15 * 60_000);
  const now = data?.forecast[0];

  return (
    <PageShell>
      <PageHeader title="Clima y huracanes" subtitle="Servicio Nacional de Meteorología · NHC" back />
      <PageContent className="space-y-5">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-zinc-400">Zona</span>
          <select
            value={activeZone}
            onChange={(e) => setZone(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5 focus:outline-none"
          >
            {Object.keys(WEATHER_ZONES).map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </label>

        {!data && <Skeleton className="h-40" />}

        {data?.alerts.map((a) => (
          <Card key={a.id} className={cn("p-4", a.urgent ? "border-red-500" : "border-amber-400")}>
            <p className={cn("flex items-center gap-2 font-bold", a.urgent ? "text-red-500" : "text-amber-500")}>
              <AlertTriangle className="w-5 h-5" /> {a.event}
            </p>
            <p className="mt-1 text-sm">{a.headline}</p>
            {a.instruction && <p className="mt-2 text-xs text-zinc-400 line-clamp-4">{a.instruction}</p>}
            <p className="mt-2 text-[11px] text-zinc-500 line-clamp-2">{a.areas}</p>
          </Card>
        ))}

        {now && (
          <Card className="p-5 bg-gradient-to-br from-brand to-sky-700 border-0 text-white">
            <p className="text-sm opacity-90">{activeZone} · {periodName(now.name)}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-5xl font-display font-extrabold">{now.temp}°{now.unit}</p>
              <SafeImg src={now.icon} alt="" className="w-16 h-16 rounded-2xl" />
            </div>
            <p className="mt-1 font-medium">{now.short}</p>
            {now.rain != null && (
              <p className="mt-2 text-sm flex items-center gap-1 opacity-90">
                <CloudRain className="w-4 h-4" /> {now.rain}% probabilidad de lluvia
              </p>
            )}
          </Card>
        )}

        {data && !data.ok.forecast && <Notice>No pudimos cargar el pronóstico del NWS. Intenta en unos minutos.</Notice>}

        {data && data.forecast.length > 1 && (
          <Card className="divide-y divide-zinc-800">
            {data.forecast.slice(1).map((p) => (
              <div key={p.name} className="flex items-center gap-3 px-4 py-3">
                <SafeImg src={p.icon} alt="" className="w-9 h-9 rounded-xl" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{periodName(p.name)}</p>
                  <p className="text-xs text-zinc-500 truncate">{p.short}</p>
                </div>
                {p.rain != null && <span className="text-xs text-sky-400 tabular-nums">{p.rain}%</span>}
                <span className="w-12 text-right font-bold tabular-nums">{p.temp}°</span>
              </div>
            ))}
          </Card>
        )}

        <section className="space-y-3">
          <SectionTitle right={inSeason() && <span className="text-xs text-coral font-semibold">Temporada activa</span>}>
            Huracanes
          </SectionTitle>
          {data && !data.ok.storms && (
            <Notice>No pudimos conectar con el Centro Nacional de Huracanes. Intenta en unos minutos.</Notice>
          )}
          {data && data.ok.storms && data.storms.length === 0 && (
            <EmptyState icon="🌀" title="No hay sistemas activos en el Atlántico" subtitle="La temporada va del 1 de junio al 30 de noviembre." />
          )}
          {data?.storms.map((s) => (
            <Card key={s.id}>
              <div className="p-4">
                <p className="font-bold text-lg">{s.kind} {s.name}</p>
                <p className="text-sm text-zinc-400 flex flex-wrap gap-x-3">
                  <span className="flex items-center gap-1"><Wind className="w-4 h-4" /> {Math.round(s.windKt * 1.15)} mph</span>
                  <span>{s.distanceKm.toLocaleString()} km de PR</span>
                  {s.movement && <span>Moviéndose {s.movement}</span>}
                </p>
              </div>
              <SafeImg src={s.coneImage} alt={`Cono de pronóstico de ${s.name}`} className="w-full bg-white" />
              {s.advisoryUrl && (
                <a href={s.advisoryUrl} target="_blank" rel="noopener noreferrer" className="block px-4 py-3 text-sm font-semibold text-brand">
                  Boletín oficial del NHC →
                </a>
              )}
            </Card>
          ))}
          <Card>
            <p className="px-4 pt-3 text-sm font-semibold">Perspectiva tropical (7 días)</p>
            <SafeImg src={data?.outlookImage ?? "https://www.nhc.noaa.gov/xgtwo/two_atl_7d0.png"} alt="Perspectiva tropical del Atlántico" className="w-full mt-2 bg-white" />
          </Card>
        </section>

        <Link href="/utilidades/emergencia" className="block">
          <Card className="p-4 flex items-center gap-3">
            <span className="text-2xl">🧰</span>
            <div className="flex-1">
              <p className="font-semibold">Prepárate</p>
              <p className="text-xs text-zinc-500">Lista de suministros y números de emergencia (funciona sin internet)</p>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-500" />
          </Card>
        </Link>
      </PageContent>
    </PageShell>
  );
}
