// components/sports/SportsUI.tsx
// ESPN-style building blocks: team logos, score cards, standings tables and
// sportsbook-style line cards.
"use client";

import TeamLogo from "./TeamLogo";
import { Card } from "@/components/ui/Page";
import type { Game, GameSide, StandingsGroup } from "@/lib/sports/types";
import { cn } from "@/lib/utils";

export { TeamLogo };

function StatusPill({ game }: { game: Game }) {
  if (game.state === "in") {
    return (
      <span className="flex items-center gap-1.5 font-bold text-red-500">
        <span className="relative flex w-2 h-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
          <span className="relative inline-flex w-2 h-2 rounded-full bg-red-500" />
        </span>
        EN VIVO <span className="text-zinc-300 font-semibold">· {game.status}</span>
      </span>
    );
  }
  if (game.state === "post") return <span className="font-bold text-zinc-300">{game.status || "Final"}</span>;
  return <span className="font-semibold text-zinc-300">{game.status}</span>;
}

function TeamLine({ side, game }: { side: GameSide; game: Game }) {
  const lost = game.state === "post" && side.winner === false;
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <TeamLogo team={side.team} size={28} />
      <div className="flex-1 min-w-0">
        <p className={cn("font-semibold text-[15px] truncate", lost ? "text-zinc-500" : "text-white")}>{side.team.name}</p>
        {side.record && <p className="text-[11px] text-zinc-500">{side.record}</p>}
      </div>
      {side.score !== undefined && (
        <span className={cn("text-2xl font-bold tabular-nums", lost ? "text-zinc-500" : "text-white")}>{side.score}</span>
      )}
      <span className={cn("w-2 text-xs", side.winner ? "text-white" : "text-transparent")}>◀</span>
    </div>
  );
}

export function ScoreCard({ game }: { game: Game }) {
  const o = game.odds;
  return (
    <Card className={cn(game.state === "in" && "border-red-500/40")}>
      <div className="flex items-center justify-between px-4 pt-3 pb-1 text-xs">
        <StatusPill game={game} />
        {game.broadcast && <span className="text-zinc-500 truncate ml-3">{game.broadcast}</span>}
      </div>
      <TeamLine side={game.away} game={game} />
      <TeamLine side={game.home} game={game} />
      {(o || game.venue) && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-zinc-800 text-xs text-zinc-400">
          <span className="truncate">
            {o?.spread?.home ? `Línea: ${game.home.team.abbr} ${o.spread.home}` : o?.details ?? game.venue}
          </span>
          {o?.total && <span className="shrink-0">O/U {o.total}</span>}
        </div>
      )}
    </Card>
  );
}

export function StandingsTable({ group, showHeader = true }: { group: StandingsGroup; showHeader?: boolean }) {
  const cols = "grid grid-cols-[1.25rem_1fr_1.75rem_1.75rem_2.75rem_2.25rem_2.25rem] items-center gap-x-1";
  return (
    <Card>
      {showHeader && group.name && (
        <div className="px-4 pt-3 pb-2 text-sm font-bold text-white">{group.name}</div>
      )}
      <div className={cn(cols, "px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-zinc-500 border-b border-zinc-800")}>
        <span>#</span>
        <span>Equipo</span>
        <span className="text-right">G</span>
        <span className="text-right">P</span>
        <span className="text-right">PCT</span>
        <span className="text-right">JD</span>
        <span className="text-right">Racha</span>
      </div>
      <div className="divide-y divide-zinc-800/70">
        {group.rows.map((row, i) => (
          <div key={row.team.id + i} className={cn(cols, "px-4 py-2.5 text-[13px] tabular-nums")}>
            <span className="text-zinc-500 text-xs">{i + 1}</span>
            <span className="flex items-center gap-2 min-w-0">
              <TeamLogo team={row.team} size={20} />
              <span className="font-semibold text-white truncate">{row.team.short ?? row.team.name}</span>
            </span>
            <span className="text-right text-zinc-200">{row.w}</span>
            <span className="text-right text-zinc-200">{row.l}</span>
            <span className="text-right text-zinc-300">{row.pct}</span>
            <span className="text-right text-zinc-400">{row.gb}</span>
            <span
              className={cn(
                "text-right text-xs font-semibold",
                /^[WG]/.test(row.streak ?? "") ? "text-emerald-400" : "text-red-400"
              )}
            >
              {row.streak?.replace(/^W/, "G").replace(/^L/, "P") ?? "—"}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function LineBox({ top, bottom }: { top?: string; bottom?: string }) {
  return (
    <div className="rounded-xl bg-zinc-800 py-1.5 text-center min-h-[2.5rem] flex flex-col justify-center">
      <span className="text-sm font-bold text-white tabular-nums">{top ?? "—"}</span>
      {bottom && <span className="text-[10px] text-zinc-400 tabular-nums">{bottom}</span>}
    </div>
  );
}

export function OddsCard({ game }: { game: Game }) {
  const o = game.odds;
  const cols = "grid grid-cols-[1fr_4rem_4.5rem_4rem] gap-2 items-center";
  const row = (side: GameSide, which: "home" | "away") => (
    <div className={cn(cols, "px-4 py-1.5")}>
      <div className="flex items-center gap-2 min-w-0">
        <TeamLogo team={side.team} size={22} />
        <span className="font-semibold text-sm truncate">{side.team.short ?? side.team.name}</span>
      </div>
      <LineBox top={o?.spread?.[which]} />
      <LineBox top={o?.total ? `${which === "away" ? "O" : "U"} ${o.total}` : undefined} />
      <LineBox top={o?.moneyline?.[which]} />
    </div>
  );
  return (
    <Card>
      <div className="px-4 pt-3 text-xs">
        <StatusPill game={game} />
      </div>
      <div className={cn(cols, "px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wide text-zinc-500")}>
        <span />
        <span className="text-center">Hándicap</span>
        <span className="text-center">Total</span>
        <span className="text-center">Dinero</span>
      </div>
      {row(game.away, "away")}
      {row(game.home, "home")}
      <div className="px-4 pt-1 pb-3 text-[11px] text-zinc-500">{o?.provider ? `Fuente: ${o.provider}` : " "}</div>
    </Card>
  );
}
