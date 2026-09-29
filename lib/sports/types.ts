// lib/sports/types.ts
export type LeagueId = "nba" | "mlb" | "bsn" | "lbprc" | "doblea";
export type GameState = "pre" | "in" | "post";

export interface TeamRef {
  id: string;
  name: string;
  /** Nickname for tight spaces ("Vaqueros", "Lakers"). */
  short?: string;
  abbr: string;
  logo?: string;
  /** Hex color without '#'. */
  color?: string;
}

export interface GameSide {
  team: TeamRef;
  score?: number;
  record?: string;
  winner?: boolean;
}

export interface Odds {
  provider?: string;
  details?: string;
  spread?: { home?: string; away?: string };
  total?: string;
  moneyline?: { home?: string; away?: string };
}

export interface Game {
  id: string;
  league: LeagueId;
  startTime: string;
  state: GameState;
  /** "Final", "Q3 4:12", "Alta 6", "7:30 PM" ... */
  status: string;
  home: GameSide;
  away: GameSide;
  venue?: string;
  broadcast?: string;
  odds?: Odds;
}

export interface StandingRow {
  team: TeamRef;
  w: number;
  l: number;
  pct: string;
  gb: string;
  streak?: string;
}

export interface StandingsGroup {
  name: string;
  rows: StandingRow[];
}

export interface LeagueData {
  league: LeagueId;
  date: string;
  games: Game[];
  standings: StandingsGroup[];
  source: "espn" | "sample";
  note?: string;
  updatedAt: string;
}
