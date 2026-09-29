// app/deportes/page.tsx
"use client";

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { EmptyState, Notice, PageContent, PageShell, Skeleton, StickyBar, Tabs } from "@/components/ui/Page";
import { OddsCard, ScoreCard, StandingsTable } from "@/components/sports/SportsUI";
import { LEAGUES, PR_TZ, dateKey, keyToDate, leagueById, shiftKey } from "@/lib/sports/leagues";
import type { LeagueData, LeagueId } from "@/lib/sports/types";
import { useFetchJson } from "@/lib/useFetchJson";
import { cn } from "@/lib/utils";

type View = "scores" | "standings" | "odds";

function DateStrip({ value, onChange, today }: { value: string; onChange: (k: string) => void; today: string }) {
  const days = useMemo(() => Array.from({ length: 9 }, (_, i) => shiftKey(today, i - 4)), [today]);
  return (
    <div className="flex overflow-x-auto scrollbar-hide px-2 border-t border-zinc-800/70">
      {days.map((k) => {
        const d = keyToDate(k);
        const active = k === value;
        const label =
          k === today
            ? "HOY"
            : d.toLocaleDateString("es-PR", { weekday: "short", timeZone: PR_TZ }).replace(".", "").toUpperCase();
        return (
          <button
            key={k}
            onClick={() => onChange(k)}
            className={cn(
              "relative shrink-0 min-w-[2.75rem] flex-1 py-2 flex flex-col items-center",
              active ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <span className="text-[10px] font-bold tracking-wide">{label}</span>
            <span className="text-base font-bold tabular-nums leading-tight">
              {d.toLocaleDateString("es-PR", { day: "numeric", timeZone: PR_TZ })}
            </span>
            {active && <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-pr-red" />}
          </button>
        );
      })}
    </div>
  );
}

export default function DeportesPage() {
  const today = useMemo(() => dateKey(), []);
  const [league, setLeague] = useState<LeagueId>("bsn");
  const [view, setView] = useState<View>("scores");
  const [date, setDate] = useState(today);
  const [interval, setIntervalMs] = useState(120_000);

  const { data, loading, refresh } = useFetchJson<LeagueData>(`/api/sports?league=${league}&date=${date}`, interval);

  // Poll faster while any game is live.
  const current = data && data.league === league && data.date === date ? data : null;
  const live = !!current?.games.some((g) => g.state === "in");
  if ((live ? 30_000 : 120_000) !== interval) setIntervalMs(live ? 30_000 : 120_000);

  const meta = leagueById(league)!;
  const oddsGames = current?.games.filter((g) => g.odds && g.state !== "post") ?? [];

  return (
    <PageShell>
      <StickyBar>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pt-3 pb-1">
          {LEAGUES.map((l) => (
            <button
              key={l.id}
              onClick={() => setLeague(l.id)}
              className={cn(
                "shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors",
                l.id === league
                  ? "bg-pr-red text-white"
                  : "bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800"
              )}
            >
              <span>{l.emoji}</span>
              {l.name}
            </button>
          ))}
        </div>
        <Tabs
          active={view}
          onChange={(v) => setView(v as View)}
          tabs={[
            { label: "Marcadores", value: "scores" },
            { label: "Posiciones", value: "standings" },
            { label: "Líneas", value: "odds" },
          ]}
        />
        {view !== "standings" && <DateStrip value={date} onChange={setDate} today={today} />}
      </StickyBar>

      <PageContent>
        <div className="flex items-center justify-between px-1">
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">{meta.fullName}</h1>
            <p className="text-xs text-zinc-500">
              {view !== "standings" &&
                `${keyToDate(date).toLocaleDateString("es-PR", { weekday: "long", day: "numeric", month: "long", timeZone: PR_TZ })} · `}
              {current?.source === "espn" ? "Datos: ESPN" : current?.source === "sample" ? "Datos de ejemplo" : " "}
              {live && <span className="text-red-500 font-semibold"> · Actualizando en vivo</span>}
            </p>
          </div>
          <button onClick={refresh} aria-label="Actualizar" className="p-2 text-zinc-400 hover:text-white">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>

        {current?.note && <Notice>{current.note}</Notice>}

        {!current && (
          <div className="space-y-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        )}

        {current && view === "scores" &&
          (current.games.length === 0 ? (
            <EmptyState icon={meta.emoji} title="No hay juegos este día" subtitle="Prueba otra fecha en la barra de arriba." />
          ) : (
            <div className="space-y-3">
              {current.games.map((g) => (
                <ScoreCard key={g.id} game={g} />
              ))}
            </div>
          ))}

        {current && view === "standings" &&
          (current.standings.length === 0 ? (
            <EmptyState icon="📊" title="Posiciones no disponibles" />
          ) : (
            <div className="space-y-3">
              {current.standings.map((g) => (
                <StandingsTable key={g.name} group={g} showHeader={current.standings.length > 1} />
              ))}
            </div>
          ))}

        {current && view === "odds" && (
          <>
            {oddsGames.length === 0 ? (
              <EmptyState icon="🎲" title="No hay líneas para este día" subtitle="Las líneas aparecen para juegos por comenzar o en vivo." />
            ) : (
              <div className="space-y-3">
                {oddsGames.map((g) => (
                  <OddsCard key={g.id} game={g} />
                ))}
              </div>
            )}
            <p className="text-center text-[11px] text-zinc-500 px-6">
              Líneas solo como referencia. ElHub no acepta apuestas. 21+ · Juega responsablemente.
            </p>
          </>
        )}
      </PageContent>
    </PageShell>
  );
}
