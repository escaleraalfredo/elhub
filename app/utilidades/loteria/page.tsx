// app/utilidades/loteria/page.tsx
"use client";

import { useMemo } from "react";
import { Card, Notice, PageContent, PageHeader, PageShell } from "@/components/ui/Page";
import { sampleLottery } from "@/lib/utilities/local";

function Ball({ n, accent = false }: { n: number; accent?: boolean }) {
  return (
    <span
      className={
        accent
          ? "w-9 h-9 rounded-full bg-coral text-white font-bold flex items-center justify-center tabular-nums"
          : "w-9 h-9 rounded-full bg-zinc-800 font-bold flex items-center justify-center tabular-nums"
      }
    >
      {n}
    </span>
  );
}

export default function LoteriaPage() {
  const day = useMemo(() => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Puerto_Rico" }).format(new Date()), []);
  const r = sampleLottery(day);

  return (
    <PageShell>
      <PageHeader title="Lotería" subtitle="Lotería Electrónica · Pega · Loto Plus" back />
      <PageContent>
        <Notice>
          Resultados de ejemplo, no oficiales. Verifica siempre con la Lotería Electrónica de Puerto Rico antes de cobrar.
        </Notice>
        {r.pega.map((g) => (
          <Card key={g.game} className="p-4">
            <p className="font-bold">{g.game}</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {g.draws.map((d) => (
                <div key={d.when}>
                  <p className="text-xs text-zinc-500 mb-1.5">{d.when}</p>
                  <div className="flex gap-1.5">
                    {d.n.map((x, i) => <Ball key={i} n={x} />)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
        <Card className="p-4 space-y-3">
          <p className="font-bold">{r.loto.game}</p>
          <div className="flex flex-wrap gap-1.5 items-center">
            {r.loto.numbers.map((x) => <Ball key={x} n={x} />)}
            <span className="text-xs text-zinc-500 mx-1">Plus</span>
            <Ball n={r.loto.plus} accent />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1.5">Revancha</p>
            <div className="flex flex-wrap gap-1.5">{r.loto.revancha.map((x) => <Ball key={x} n={x} />)}</div>
          </div>
        </Card>
        <p className="text-[11px] text-zinc-500 px-1">Juega con responsabilidad. Solo mayores de edad.</p>
      </PageContent>
    </PageShell>
  );
}
