// components/sports/GameInteractions.tsx
// Game detail header shown above the comments: matchup, "¿Quién gana?"
// prediction with community split, and fan reactions.
"use client";

import { MessageCircle } from "lucide-react";
import TeamLogo from "./TeamLogo";
import { useCommentCount } from "@/lib/comments/store";
import {
  communityPicks, reactionCounts, setPick, toggleReaction, useGameInteractions, type Side,
} from "@/lib/sports/interactions";
import { award } from "@/lib/points";
import type { Game, GameSide } from "@/lib/sports/types";
import { cn } from "@/lib/utils";

export function pickResult(game: Game, pick?: Side): "won" | "lost" | null {
  if (!pick || game.state !== "post") return null;
  const winner: Side | null = game.home.winner ? "home" : game.away.winner ? "away" : null;
  if (!winner) return null;
  return winner === pick ? "won" : "lost";
}

function Big({ side, game }: { side: GameSide; game: Game }) {
  const lost = game.state === "post" && side.winner === false;
  return (
    <div className={cn("flex-1 flex flex-col items-center text-center gap-1.5 min-w-0", lost && "opacity-50")}>
      <TeamLogo team={side.team} size={44} />
      <p className="font-semibold text-sm leading-tight line-clamp-2">{side.team.name}</p>
      {side.record && <p className="text-[11px] text-zinc-500">{side.record}</p>}
    </div>
  );
}

export function GameHeader({ game }: { game: Game }) {
  const { picks, reactions } = useGameInteractions();
  const pick = picks[game.id];
  const split = communityPicks(game.id, pick);
  const result = pickResult(game, pick);
  const canPick = game.state === "pre";

  const choose = (side: Side) => {
    if (!canPick) return;
    setPick(game.id, side);
    award("predict", { key: game.id });
  };

  const bar = (side: Side, pct: number) => (
    <button
      disabled={!canPick}
      onClick={() => choose(side)}
      className={cn(
        "relative flex-1 overflow-hidden rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors",
        pick === side ? "border-pr-red" : "border-zinc-700",
        canPick && "hover:border-pr-red"
      )}
    >
      {(pick || !canPick) && (
        <span
          className={cn("absolute inset-y-0 left-0", pick === side ? "bg-pr-red/25" : "bg-zinc-800")}
          style={{ width: `${pct}%` }}
        />
      )}
      <span className="relative flex items-center justify-between gap-2">
        <span className="truncate">{(side === "home" ? game.home : game.away).team.short ?? (side === "home" ? game.home : game.away).team.abbr}</span>
        {(pick || !canPick) && <span className="tabular-nums">{pct}%</span>}
      </span>
    </button>
  );

  return (
    <div className="p-4 space-y-5">
      <div>
        {game.group && <p className="text-center text-xs text-zinc-500 mb-2">{game.group}{game.detail ? ` · ${game.detail}` : ""}</p>}
        <div className="flex items-center gap-3">
          <Big side={game.away} game={game} />
          <div className="text-center shrink-0">
            {game.away.score !== undefined ? (
              <p className="text-3xl font-bold tabular-nums">
                {game.away.score}<span className="text-zinc-600 mx-1.5">-</span>{game.home.score}
              </p>
            ) : (
              <p className="text-lg font-bold text-zinc-500">VS</p>
            )}
            <p className={cn("text-xs font-semibold mt-1", game.state === "in" ? "text-red-500" : "text-zinc-400")}>
              {game.state === "in" ? `EN VIVO · ${game.status}` : game.status}
            </p>
          </div>
          <Big side={game.home} game={game} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold">¿Quién gana?</h4>
          <span className="text-xs text-zinc-500">
            {result === "won"
              ? "✅ ¡Acertaste! +10 pts"
              : result === "lost"
                ? "❌ Fallaste esta"
                : canPick
                  ? pick
                    ? "Puedes cambiar tu pick hasta que empiece"
                    : "+2 pts por pronosticar · +10 si aciertas"
                  : pick
                    ? "Pronósticos cerrados"
                    : "Pronósticos cerrados"}
          </span>
        </div>
        <div className="flex gap-2">
          {bar("away", split.awayPct)}
          {bar("home", split.homePct)}
        </div>
        <p className="text-[11px] text-zinc-500 mt-1.5">{split.total} pronósticos de la comunidad</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">Reacciones</h4>
        <div className="flex flex-wrap gap-2">
          {reactionCounts(game.id, reactions[game.id]).map(({ r, count, mine }) => (
            <button
              key={r}
              onClick={() => {
                if (toggleReaction(game.id, r)) award("react_game", { key: game.id });
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors",
                mine ? "border-pr-red bg-pr-red/15" : "border-zinc-800 bg-zinc-800/60 hover:bg-zinc-800"
              )}
            >
              <span className="text-base">{r}</span>
              <span className="text-xs tabular-nums text-zinc-300">{count}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Compact row under each score card: your pick, top reactions, comments. */
export function GameFooter({ game }: { game: Game }) {
  const { picks, reactions } = useGameInteractions();
  const comments = useCommentCount(`game:${game.id}`);
  const pick = picks[game.id];
  const result = pickResult(game, pick);
  const top = reactionCounts(game.id, reactions[game.id])
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  const pickedTeam = pick ? (pick === "home" ? game.home : game.away).team : null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-t border-zinc-800 text-xs">
      {pickedTeam ? (
        <span
          className={cn(
            "px-2.5 py-1 rounded-full font-semibold",
            result === "won" ? "bg-emerald-500/15 text-emerald-400" : result === "lost" ? "bg-zinc-800 text-zinc-500" : "bg-pr-red/15 text-pr-red"
          )}
        >
          {result === "won" ? "✅ " : result === "lost" ? "❌ " : ""}Tu pick: {pickedTeam.abbr}
        </span>
      ) : game.state === "pre" ? (
        <span className="px-2.5 py-1 rounded-full font-semibold bg-zinc-800 text-zinc-200">🎯 Pronostica</span>
      ) : null}
      <span className="flex items-center gap-0.5">
        {top.map((x) => (
          <span key={x.r}>{x.r}</span>
        ))}
        {top.length > 0 && <span className="ml-1 text-zinc-500 tabular-nums">{top.reduce((s, x) => s + x.count, 0)}</span>}
      </span>
      <span className="ml-auto flex items-center gap-1 text-zinc-400">
        <MessageCircle className="w-4 h-4" /> {comments}
      </span>
    </div>
  );
}
