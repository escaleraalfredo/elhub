// app/utilidades/lanchas/page.tsx
"use client";

import { Ship } from "lucide-react";
import { Card, Notice, PageContent, PageHeader, PageShell } from "@/components/ui/Page";
import { FERRY_ROUTES } from "@/lib/utilities/local";

export default function LanchasPage() {
  return (
    <PageShell>
      <PageHeader title="Lanchas" subtitle="Vieques y Culebra desde Ceiba" back />
      <PageContent>
        <Notice>
          Horarios de ejemplo: cambian con frecuencia. Confirma siempre con la Autoridad de Transporte Marítimo antes de viajar y reserva con tiempo.
        </Notice>
        {FERRY_ROUTES.map((r) => (
          <Card key={r.id} className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Ship className="w-5 h-5 text-brand" />
              <p className="font-bold">{r.name}</p>
              <span className="ml-auto text-xs text-zinc-500">{r.duration}</span>
            </div>
            {[
              { label: `Sale de Ceiba`, times: r.toIsland },
              { label: `Sale de ${r.name.split("↔ ")[1]}`, times: r.fromIsland },
            ].map((leg) => (
              <div key={leg.label}>
                <p className="text-xs text-zinc-500 mb-1.5">{leg.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {leg.times.map((t) => (
                    <span key={t} className="px-3 py-1 rounded-full bg-zinc-800 text-sm font-semibold tabular-nums">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </Card>
        ))}
      </PageContent>
    </PageShell>
  );
}
