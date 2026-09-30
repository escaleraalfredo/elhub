// app/deportes/page.tsx
"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { EmptyState, Notice, PageContent, PageShell, Skeleton, StickyBar, Tabs } from "@/components/ui/Page";
import { BracketView, OddsCard, ScoreCard, StandingsTable } from "@/components/sports/SportsUI";
import { GameHeader } from "@/components/sports/GameInteractions";
import { CommentsSheet } from "@/components/comments/Comments";
import Sponsored from "@/components/ui/Sponsored";
import { useGameInteractions } from "@/lib/sports/interactions";
import { isFavoriteGame, useFavoriteResults } from "@/lib/sports/favorites";
import { useProfile } from "@/lib/profile";
import { Star } from "lucide-react";
import { award } from "@/lib/points";
import { LEAGUES, PR_TZ, dateKey, keyToDate, leagueById, shiftKey } from "@/lib/sports/leagues";
import type { Game, LeagueData, LeagueId } from "@/lib/sports/types";
import { useFetchJson } from "@/lib/useFetchJson";
import { cn } from "@/lib/utils";

type View = "scores" | "standings" | "playoffs" | "odds";

function viewsFor(league: LeagueId): { label: string; value: View }[] {
  if (league === "ufc" || league === "boxeo") return [{ label: "Peleas", value: "scores" }, { label: "Líneas", value: "odds" }];
  const base: { label: string; value: View }[] = [
    { label: "Marcadores", value: "scores" },
    { label: "Posiciones", value: "standings" },
  ];
  if (league === "mlb") base.push({ label: "Playoffs", value: "playoffs" });
  base.push({ label: "Líneas", value: "odds" });
  return base;
}

/** UFC: group fights under their event. */
function byGroup(games: Game[]) {
  const m = new Map<string, Game[]>();
  games.forEach((g) => m.set(g.group ?? "", [...(m.get(g.group ?? "") ?? []), g]));
  return [...m.entries()];
}

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
              active ? "text-ink" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <span className="text-[10px] font-bold tracking-wide">{label}</span>
            <span className="text-base font-bold tabular-nums leading-tight">
              {d.toLocaleDateString("es-PR", { day: "numeric", timeZone: PR_TZ })}
            </span>
            {active && <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-accent-gradient" />}
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
  const views = viewsFor(league);
  const activeView: View = views.some((v) => v.value === view) ? view : "scores";
  const fights = league === "ufc" || league === "boxeo";
  const showDates = !fights && (activeView === "scores" || activeView === "odds");
  const { teams } = useProfile();
  const [favOnly, setFavOnly] = useState(false);
  useFavoriteResults(current?.games);
  const oddsGames = current?.games.filter((g) => g.odds && g.state !== "post") ?? [];
  const [openGame, setOpenGame] = useState<Game | null>(null);

  // Pay out correct predictions once games are final.
  const { picks } = useGameInteractions();
  useEffect(() => {
    current?.games.forEach((g) => {
      const pick = picks[g.id];
      if (!pick || g.state !== "post") return;
      const won = pick === "home" ? g.home.winner : g.away.winner;
      if (won) award("correct_pick", { key: g.id });
    });
  }, [current, picks]);

  const scoreList = (all: Game[]) =>
    (favOnly ? all.filter((g) => isFavoriteGame(g, teams)) : [...all].sort((a, b) => Number(isFavoriteGame(b, teams)) - Number(isFavoriteGame(a, teams)))).map((g, i) => (
      <Fragment key={g.id}>
        <ScoreCard game={g} onOpen={() => setOpenGame(g)} />
        {i === 2 && <Sponsored placement="deportes" />}
      </Fragment>
    ));

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
                  ? "bg-ink text-zinc-950"
                  : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
              )}
            >
              <span>{l.emoji}</span>
              {l.name}
            </button>
          ))}
        </div>
        <Tabs active={activeView} onChange={(v) => setView(v as View)} tabs={views} />
        {showDates && <DateStrip value={date} onChange={setDate} today={today} />}
      </StickyBar>

      <PageContent>
        <div className="flex items-center justify-between px-1">
          <div>
            <h1 className="text-lg font-bold text-ink leading-tight">{meta.fullName}</h1>
            <p className="text-xs text-zinc-500">
              {showDates &&
                `${keyToDate(date).toLocaleDateString("es-PR", { weekday: "long", day: "numeric", month: "long", timeZone: PR_TZ })} · `}
              {current?.source === "espn" ? "Datos: ESPN" : current?.source === "sample" ? "Datos de ejemplo" : " "}
              {live && <span className="text-coral font-semibold"> · Actualizando en vivo</span>}
            </p>
          </div>
          <button onClick={refresh} aria-label="Actualizar" className="p-2 text-zinc-400 hover:text-ink">
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

        {current && activeView === "scores" &&
          (current.games.length === 0 ? (
            <EmptyState
              icon={meta.emoji}
              title={fights ? "No hay carteleras cercanas" : "No hay juegos este día"}
              subtitle={fights ? undefined : "Prueba otra fecha en la barra de arriba."}
            />
          ) : fights ? (
            byGroup(current.games).map(([group, games]) => (
              <section key={group} className="space-y-3">
                <h2 className="px-1 text-sm font-bold text-zinc-300">
                  {group}
                  <span className="block text-xs font-normal text-zinc-500">
                    {new Date(games[0].startTime).toLocaleDateString("es-PR", { weekday: "long", day: "numeric", month: "long", timeZone: PR_TZ })}
                  </span>
                </h2>
                {scoreList(games)}
              </section>
            ))
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 px-1">
                <p className="text-xs text-zinc-500">Toca un juego para pronosticar, reaccionar, comentar o seguir un equipo.</p>
                {teams.length > 0 && (
                  <button
                    onClick={() => setFavOnly(!favOnly)}
                    className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${favOnly ? "border-yellow-400 text-yellow-400" : "border-zinc-700 text-zinc-400"}`}
                  >
                    <Star className="w-3 h-3" /> Mis equipos
                  </button>
                )}
              </div>
              {scoreList(current.games)}
            </div>
          ))}

        {current && activeView === "playoffs" &&
          (current.bracket ? (
            <>
              {current.bracket.mode === "projected" && (
                <Notice>
                  Proyección según las posiciones actuales (simplificada: los 6 mejores récords de cada liga). Se actualiza sola cuando empiecen los playoffs.
                </Notice>
              )}
              <BracketView bracket={current.bracket} />
            </>
          ) : (
            <EmptyState icon="🏆" title="Bracket no disponible" subtitle="Vuelve cuando se acerquen los playoffs." />
          ))}

        {current && activeView === "standings" &&
          (current.standings.length === 0 ? (
            <EmptyState icon="📊" title="Posiciones no disponibles" />
          ) : (
            <div className="space-y-3">
              {current.standings.map((g) => (
                <StandingsTable key={g.name} group={g} showHeader={current.standings.length > 1} />
              ))}
            </div>
          ))}

        {current && activeView === "odds" && (
          <>
            {oddsGames.length === 0 ? (
              <EmptyState icon="🎲" title="No hay líneas para este día" subtitle="Las líneas aparecen para juegos por comenzar o en vivo." />
            ) : (
              <div className="space-y-3">
                {oddsGames.map((g) => (
                  <OddsCard key={g.id} game={g} onOpen={() => setOpenGame(g)} />
                ))}
              </div>
            )}
            <p className="text-center text-[11px] text-zinc-500 px-6">
              Líneas solo como referencia. ElHub no acepta apuestas. Solo para mayores de edad · Juega responsablemente.
            </p>
          </>
        )}
      </PageContent>

      <CommentsSheet
        open={openGame !== null}
        onClose={() => setOpenGame(null)}
        threadId={`game:${openGame?.id ?? ""}`}
        title={meta.name}
        header={openGame && <GameHeader game={current?.games.find((g) => g.id === openGame.id) ?? openGame} />}
      />
    </PageShell>
  );
}
