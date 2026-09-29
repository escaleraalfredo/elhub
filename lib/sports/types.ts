// lib/sports/types.ts
export type LeagueId = "nba" | "mlb" | "ufc" | "bsn" | "lbprc" | "doblea";
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
  /** UFC: event name the fight belongs to. */
  group?: string;
  /** UFC: weight class / card segment. */
  detail?: string;
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

export interface BracketSide {
  team?: TeamRef;
  seed?: number;
  wins?: number;
  winner?: boolean;
}

export interface BracketSeries {
  id: string;
  league?: "AL" | "NL";
  top: BracketSide;
  bottom: BracketSide;
  summary?: string;
}

export interface BracketRound {
  id: "wc" | "ds" | "cs" | "ws";
  name: string;
  series: BracketSeries[];
}

export interface Bracket {
  /** "live" = built from real postseason games; "projected" = from standings. */
  mode: "live" | "projected";
  rounds: BracketRound[];
}

export interface LeagueData {
  league: LeagueId;
  date: string;
  games: Game[];
  standings: StandingsGroup[];
  bracket?: Bracket;
  source: "espn" | "sample";
  note?: string;
  updatedAt: string;
}
