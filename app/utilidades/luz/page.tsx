// app/utilidades/luz/page.tsx
"use client";

import { useState } from "react";
import { Droplets, RefreshCw, Zap } from "lucide-react";
import { Card, Notice, PageContent, PageHeader, PageShell, Skeleton, Tabs } from "@/components/ui/Page";
import { useFetchJson } from "@/lib/useFetchJson";
import { useProfile } from "@/lib/profile";
import { REGIONS, regionOf } from "@/lib/utilities/municipios";
import type { OutagesResponse, RegionStatus } from "@/lib/utilities/outages";
import { timeAgo } from "@/lib/time";
import { cn } from "@/lib/utils";

function level(pct: number) {
  if (pct >= 10) return { label: "Afectación alta", color: "bg-red-500", text: "text-red-500" };
  if (pct >= 2) return { label: "Afectación parcial", color: "bg-amber-500", text: "text-amber-500" };
  return { label: "Normal", color: "bg-palm", text: "text-palm" };
}

function RegionRow({ r, mine }: { r: RegionStatus; mine: boolean }) {
  const pct = r.clients ? (r.without / r.clients) * 100 : 0;
  const lv = level(pct);
  return (
    <div className={cn("p-4", mine && "bg-brand/5")}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">
            Región {r.region} {mine && <span className="text-xs font-semibold text-brand">· tu área</span>}
          </p>
          <p className="text-xs text-zinc-500 truncate">{REGIONS[r.region].slice(0, 6).join(", ")}…</p>
        </div>
        <div className="text-right shrink-0">
          <p className={cn("text-sm font-bold tabular-nums", lv.text)}>{pct.toFixed(1)}%</p>
          <p className="text-[11px] text-zinc-500 tabular-nums">{r.without.toLocaleString()} sin servicio</p>
        </div>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div className={cn("h-full", lv.color)} style={{ width: `${Math.min(100, Math.max(pct, 1))}%` }} />
      </div>
    </div>
  );
}

export default function LuzPage() {
  const { data, loading, refresh } = useFetchJson<OutagesResponse>("/api/outages", 5 * 60_000);
  const { pueblo } = useProfile();
  const [tab, setTab] = useState<"power" | "water">("power");
  const myRegion = pueblo ? regionOf(pueblo) : null;
  const rows = data ? (tab === "power" ? data.power : data.water) : [];
  const sample = data ? (tab === "power" ? data.powerSample : data.waterSample) : false;
  const mine = rows.find((r) => r.region === myRegion);
  const totalWithout = rows.reduce((s, r) => s + r.without, 0);
  const totalClients = rows.reduce((s, r) => s + r.clients, 0);
  const minePct = mine ? (mine.without / mine.clients) * 100 : 0;

  return (
    <PageShell>
      <PageHeader
        title="Luz y agua"
        subtitle="Estado del servicio por región"
        back
        right={
          <button onClick={refresh} aria-label="Actualizar" className="p-2 text-zinc-400 hover:text-ink">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        }
      />
      <div className="max-w-md mx-auto border-b border-zinc-800">
        <Tabs
          active={tab}
          onChange={(v) => setTab(v as "power" | "water")}
          tabs={[
            { label: "⚡ Luz (LUMA)", value: "power" },
            { label: "💧 Agua (AAA)", value: "water" },
          ]}
        />
      </div>
      <PageContent>
        {sample && (
          <Notice>
            {tab === "power"
              ? "Datos de ejemplo: no pudimos leer el mapa de averías de LUMA ahora mismo."
              : "Datos de ejemplo: la AAA no publica un feed abierto de interrupciones todavía."}
          </Notice>
        )}

        {!data && <Skeleton className="h-40" />}

        {data && (
          <Card className="p-5">
            {mine ? (
              <>
                <p className="text-xs text-zinc-500">{pueblo} · Región {mine.region}</p>
                <p className="mt-1 text-xl font-bold">
                  {minePct >= 2
                    ? tab === "power"
                      ? "Se fue la luz en partes de tu área"
                      : "Hay interrupciones de agua en tu área"
                    : tab === "power"
                      ? "Tu área tiene luz ✅"
                      : "Tu área tiene agua ✅"}
                </p>
                <p className="text-sm text-zinc-400 mt-1">
                  {mine.without.toLocaleString()} clientes sin servicio ({minePct.toFixed(1)}%)
                </p>
              </>
            ) : (
              <>
                <p className="text-xs text-zinc-500">Todo Puerto Rico</p>
                <p className="mt-1 text-xl font-bold">
                  {totalWithout.toLocaleString()} clientes sin {tab === "power" ? "luz" : "agua"}
                </p>
                <p className="text-sm text-zinc-400 mt-1">
                  Elige tu pueblo en tu perfil para ver tu área primero.
                </p>
              </>
            )}
            <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
              {tab === "power" ? <Zap className="w-4 h-4" /> : <Droplets className="w-4 h-4" />}
              Isla: {((totalWithout / Math.max(totalClients, 1)) * 100).toFixed(1)}% sin servicio · actualizado{" "}
              {timeAgo(data.updatedAt)}
            </div>
          </Card>
        )}

        {data && (
          <Card className="divide-y divide-zinc-800">
            {[...rows]
              .sort((a, b) => (a.region === myRegion ? -1 : b.region === myRegion ? 1 : b.without / b.clients - a.without / a.clients))
              .map((r) => (
                <RegionRow key={r.region} r={r} mine={r.region === myRegion} />
              ))}
          </Card>
        )}

        <p className="text-[11px] text-zinc-500 px-1">
          Las regiones son aproximadas. Para reportar una avería de luz usa la app Mi LUMA o lumapr.com; para agua, comunícate con la AAA.
        </p>
      </PageContent>
    </PageShell>
  );
}
