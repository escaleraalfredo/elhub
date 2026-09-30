// app/utilidades/trafico/page.tsx
"use client";

import { useMemo } from "react";
import { Navigation } from "lucide-react";
import { Card, Notice, PageContent, PageHeader, PageShell, SectionTitle } from "@/components/ui/Page";
import { HIGHWAYS, sampleTraffic, type TrafficKind } from "@/lib/utilities/local";
import { cn } from "@/lib/utils";

const KIND_STYLE: Record<TrafficKind, string> = {
  Accidente: "bg-red-500/15 text-red-500",
  Cierre: "bg-zinc-800 text-zinc-300",
  Construcción: "bg-amber-500/15 text-amber-500",
  "Tráfico lento": "bg-orange-500/15 text-orange-400",
};

export default function TraficoPage() {
  const day = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const incidents = sampleTraffic(day);

  return (
    <PageShell>
      <PageHeader title="Tráfico y carreteras" subtitle="Expresos y autopistas principales" back />
      <PageContent className="space-y-5">
        <Notice>
          Incidentes de ejemplo. Todavía no hay un feed público de incidentes para PR; para tráfico en vivo usa los botones
          de Waze o Google Maps en cada carretera.
        </Notice>

        <section className="space-y-2">
          <SectionTitle>Ahora mismo (ejemplo)</SectionTitle>
          <Card className="divide-y divide-zinc-800">
            {incidents.map((i) => {
              const road = HIGHWAYS.find((h) => h.id === i.road)!;
              return (
                <div key={i.id} className="p-4">
                  <div className="flex items-center gap-2">
                    <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-bold", KIND_STYLE[i.kind])}>{i.kind}</span>
                    <span className="text-sm font-semibold">{road.name.split(" · ")[0]}</span>
                    {i.minutes > 0 && <span className="ml-auto text-xs text-zinc-500">+{i.minutes} min</span>}
                  </div>
                  <p className="mt-1.5 text-sm text-zinc-300">{i.where}</p>
                </div>
              );
            })}
          </Card>
        </section>

        <section className="space-y-2">
          <SectionTitle>Tráfico en vivo por carretera</SectionTitle>
          <Card className="divide-y divide-zinc-800">
            {HIGHWAYS.map((h) => (
              <div key={h.id} className="flex items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{h.name}</p>
                  <p className="text-xs text-zinc-500">{h.span}</p>
                </div>
                <a
                  href={`https://waze.com/ul?ll=${h.lat},${h.lon}&z=12`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full bg-[#33ccff]/15 text-[#0a8fbf] dark:text-[#5fd8ff] text-xs font-semibold"
                >
                  Waze
                </a>
                <a
                  href={`https://www.google.com/maps/@${h.lat},${h.lon},12z/data=!5m1!1e1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Google Maps con tráfico"
                  className="p-2 rounded-full bg-zinc-800 text-zinc-300"
                >
                  <Navigation className="w-4 h-4" />
                </a>
              </div>
            ))}
          </Card>
        </section>
      </PageContent>
    </PageShell>
  );
}
