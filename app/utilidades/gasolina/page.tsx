// app/utilidades/gasolina/page.tsx
"use client";

import { useMemo, useState } from "react";
import { Card, Notice, PageContent, PageHeader, PageShell } from "@/components/ui/Page";
import { useProfile } from "@/lib/profile";
import { regionOf } from "@/lib/utilities/municipios";
import { LITERS_PER_GALLON, sampleGas } from "@/lib/utilities/local";
import { cn } from "@/lib/utils";

export default function GasolinaPage() {
  const day = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const rows = sampleGas(day);
  const [unit, setUnit] = useState<"litro" | "galón">("litro");
  const { pueblo } = useProfile();
  const mine = pueblo ? regionOf(pueblo) : null;
  const fmt = (perLiter: number) => `$${(unit === "litro" ? perLiter : perLiter * LITERS_PER_GALLON).toFixed(unit === "litro" ? 3 : 2)}`;
  const cheapest = [...rows].sort((a, b) => a.regular - b.regular)[0];

  return (
    <PageShell>
      <PageHeader
        title="Gasolina"
        subtitle="Precio promedio por región"
        back
        right={
          <div className="flex rounded-full bg-zinc-800 p-0.5 text-xs font-semibold">
            {(["litro", "galón"] as const).map((u) => (
              <button key={u} onClick={() => setUnit(u)} className={cn("px-3 py-1 rounded-full", unit === u ? "bg-ink text-zinc-950" : "text-zinc-400")}>
                {u}
              </button>
            ))}
          </div>
        }
      />
      <PageContent>
        <Notice>Precios de ejemplo. Conectaremos datos reales de estaciones o de DACO cuando estén disponibles.</Notice>
        <Card className="p-4">
          <p className="text-xs text-zinc-500">Regular más barata (ejemplo)</p>
          <p className="text-2xl font-bold">{fmt(cheapest.regular)} <span className="text-sm font-medium text-zinc-400">/{unit} · {cheapest.region}</span></p>
        </Card>
        <Card>
          <div className="grid grid-cols-[1fr_4.5rem_4.5rem_4.5rem] gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-zinc-500 border-b border-zinc-800">
            <span>Región</span><span className="text-right">Regular</span><span className="text-right">Premium</span><span className="text-right">Diésel</span>
          </div>
          <div className="divide-y divide-zinc-800">
            {rows.map((r) => (
              <div key={r.region} className={cn("grid grid-cols-[1fr_4.5rem_4.5rem_4.5rem] gap-2 px-4 py-3 text-sm tabular-nums", r.region === mine && "bg-brand/5")}>
                <span className="font-semibold">{r.region}{r.region === mine && <span className="text-brand text-xs"> · tú</span>}</span>
                <span className="text-right">{fmt(r.regular)}</span>
                <span className="text-right text-zinc-300">{fmt(r.premium)}</span>
                <span className="text-right text-zinc-300">{fmt(r.diesel)}</span>
              </div>
            ))}
          </div>
        </Card>
        <p className="text-[11px] text-zinc-500 px-1">En Puerto Rico la gasolina se vende por litro (1 galón ≈ 3.785 litros).</p>
      </PageContent>
    </PageShell>
  );
}
