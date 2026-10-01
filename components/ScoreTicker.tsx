// components/ScoreTicker.tsx
// Network-style live score strip under the header (Inicio, Noticias, Eventos).
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFetchJson } from "@/lib/useFetchJson";
import { useProfile } from "@/lib/profile";
import type { Game, LeagueData } from "@/lib/sports/types";
import { cn } from "@/lib/utils";

const SHOW_ON = ["/", "/noticias", "/eventos"];

function todayKey() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Puerto_Rico" }).format(new Date()).replace(/-/g, "");
}

export default function ScoreTicker() {
  const pathname = usePathname();
  const visible = SHOW_ON.includes(pathname);
  const key = useMemo(() => todayKey(), []);
  const mlb = useFetchJson<LeagueData>(visible ? `/api/sports?league=mlb&date=${key}` : null, 60_000);
  const bsn = useFetchJson<LeagueData>(visible ? `/api/sports?league=bsn&date=${key}` : null, 60_000);
  const { teams } = useProfile();

  const games = useMemo(() => {
    const all = [...(bsn.data?.games ?? []), ...(mlb.data?.games ?? [])];
    const fav = (g: Game) => teams.includes(`${g.league}:${g.home.team.id}`) || teams.includes(`${g.league}:${g.away.team.id}`);
    const rank = (g: Game) => (fav(g) ? 0 : g.state === "in" ? 1 : g.state === "pre" ? 2 : 3);
    return all.sort((a, b) => rank(a) - rank(b)).slice(0, 12);
  }, [mlb.data, bsn.data, teams]);

  if (!visible || games.length === 0) return null;

  return (
    <div className="bg-[var(--bar)] border-b-2 border-brand">
      <div className="max-w-md mx-auto flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2">
        {games.map((g) => {
          const live = g.state === "in";
          return (
            <Link
              key={g.id}
              href="/deportes"
              className="shrink-0 min-w-[96px] rounded-md bg-zinc-800 px-2 py-1.5 font-display leading-tight pressable"
            >
              <p className={cn("text-[10px] font-bold tracking-wider uppercase truncate", live ? "text-brand" : "text-zinc-400")}>
                {live ? `● ${g.status}` : g.state === "post" ? "Final" : g.status}
                <span className="text-zinc-500"> · {g.league.toUpperCase()}</span>
              </p>
              {[g.away, g.home].map((s) => (
                <p key={s.team.id} className={cn("flex justify-between gap-3 text-[14px] font-bold", g.state === "post" && s.winner === false && "text-zinc-500")}>
                  <span>{s.team.abbr}</span>
                  <span className="tabular-nums">{s.score ?? "–"}</span>
                </p>
              ))}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
