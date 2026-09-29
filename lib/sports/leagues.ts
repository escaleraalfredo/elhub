// lib/sports/leagues.ts
import type { LeagueId } from "./types";

export interface LeagueMeta {
  id: LeagueId;
  name: string;
  fullName: string;
  sport: "basketball" | "baseball";
  emoji: string;
  /** ESPN API path, when ESPN covers the league. */
  espn?: string;
}

export const LEAGUES: LeagueMeta[] = [
  { id: "bsn", name: "BSN", fullName: "Baloncesto Superior Nacional", sport: "basketball", emoji: "🏀" },
  { id: "lbprc", name: "LBPRC", fullName: "Liga de Béisbol Profesional Roberto Clemente", sport: "baseball", emoji: "⚾" },
  { id: "doblea", name: "Doble A", fullName: "Béisbol Superior Doble A", sport: "baseball", emoji: "⚾" },
  { id: "nba", name: "NBA", fullName: "NBA", sport: "basketball", emoji: "🏀", espn: "basketball/nba" },
  { id: "mlb", name: "MLB", fullName: "MLB", sport: "baseball", emoji: "⚾", espn: "baseball/mlb" },
];

export function leagueById(id: string): LeagueMeta | undefined {
  return LEAGUES.find((l) => l.id === id);
}

export const PR_TZ = "America/Puerto_Rico";

/** YYYYMMDD for a date in Puerto Rico time. */
export function dateKey(d: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PR_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  return parts.replace(/-/g, "");
}

/** Shift a YYYYMMDD key by N days. */
export function shiftKey(key: string, days: number): string {
  const d = new Date(Date.UTC(+key.slice(0, 4), +key.slice(4, 6) - 1, +key.slice(6, 8) + days, 12));
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

export function keyToDate(key: string): Date {
  // Noon UTC on that day is the same calendar day in PR (UTC-4).
  return new Date(Date.UTC(+key.slice(0, 4), +key.slice(4, 6) - 1, +key.slice(6, 8), 16));
}
