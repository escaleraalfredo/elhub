// lib/sports/favorites.ts
"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useProfile } from "@/lib/profile";
import type { Game } from "./types";

const SEEN = "elhub:wepa:v1";

export const teamKey = (g: Game, side: "home" | "away") => `${g.league}:${g[side].team.id}`;

export function isFavoriteGame(g: Game, teams: string[]) {
  return teams.includes(teamKey(g, "home")) || teams.includes(teamKey(g, "away"));
}

/** "¡Wepa! Ganó tu equipo" once per finished game of a followed team. */
export function useFavoriteResults(games: Game[] | undefined) {
  const { teams } = useProfile();
  useEffect(() => {
    if (!games?.length || !teams.length) return;
    let seen: string[] = [];
    try {
      seen = JSON.parse(window.localStorage.getItem(SEEN) ?? "[]");
    } catch {
      seen = [];
    }
    const fresh = games.filter((g) => g.state === "post" && isFavoriteGame(g, teams) && !seen.includes(g.id));
    fresh.forEach((g) => {
      const side = teams.includes(teamKey(g, "home")) ? "home" : "away";
      const mine = g[side];
      const other = g[side === "home" ? "away" : "home"];
      if (mine.winner) toast.success(`¡Wepa! Ganó ${mine.team.short ?? mine.team.name}`, { description: `${mine.score ?? ""}–${other.score ?? ""} vs ${other.team.short ?? other.team.name}` });
      else if (other.winner) toast(`Perdió ${mine.team.short ?? mine.team.name}`, { description: "La próxima es nuestra 💪" });
    });
    if (fresh.length) {
      try {
        window.localStorage.setItem(SEEN, JSON.stringify([...seen, ...fresh.map((g) => g.id)].slice(-500)));
      } catch {
        // ignore
      }
    }
  }, [games, teams]);
}
