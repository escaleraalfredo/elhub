// lib/sports/getLeague.ts
import { espnMlbPostseason, espnScoreboard, espnStandings, espnUfc } from "./espn";
import { projectedMlbBracket } from "./bracket";
import { leagueById, shiftKey } from "./leagues";
import { sampleBoxing, samplePrGames, samplePrStandings, type PrLeague } from "./prLeagues";
import type { LeagueData, LeagueId } from "./types";

const PR_NOTE =
  "Datos de ejemplo: esta liga no publica un feed de marcadores. Los equipos son reales; los juegos, posiciones y líneas son de muestra hasta conectar la fuente oficial.";

export async function getLeague(id: LeagueId, date: string): Promise<LeagueData> {
  const meta = leagueById(id)!;
  const updatedAt = new Date().toISOString();

  if (id === "ufc") {
    const games = await espnUfc(date, shiftKey);
    return {
      league: id,
      date,
      games: games ?? [],
      standings: [],
      source: "espn",
      note: games ? undefined : "ESPN no respondió. Intenta de nuevo en unos minutos.",
      updatedAt,
    };
  }

  if (meta.espn) {
    const [games, standings, post] = await Promise.all([
      espnScoreboard(id, meta.espn, date),
      espnStandings(meta.espn),
      id === "mlb" ? espnMlbPostseason(date) : Promise.resolve(null),
    ]);
    const bracket = id === "mlb" ? post ?? (standings ? projectedMlbBracket(standings) : null) ?? undefined : undefined;
    if (games && standings) {
      return { league: id, date, games, standings, bracket, source: "espn", updatedAt };
    }
    return {
      league: id,
      date,
      games: games ?? [],
      standings: standings ?? [],
      bracket,
      source: "espn",
      note: "ESPN no respondió. Intenta de nuevo en unos minutos.",
      updatedAt,
    };
  }

  if (id === "boxeo") {
    return {
      league: id,
      date,
      games: sampleBoxing(date),
      standings: [],
      source: "sample",
      note: "Datos de ejemplo: todavía no hay un feed público de carteleras de boxeo en PR. Los nombres son ficticios.",
      updatedAt,
    };
  }

  const pr = id as PrLeague;
  return {
    league: id,
    date,
    games: samplePrGames(pr, date),
    standings: samplePrStandings(pr),
    source: "sample",
    note: PR_NOTE,
    updatedAt,
  };
}
