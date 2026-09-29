// lib/sports/getLeague.ts
import { espnScoreboard, espnStandings } from "./espn";
import { leagueById } from "./leagues";
import { samplePrGames, samplePrStandings } from "./prLeagues";
import type { LeagueData, LeagueId } from "./types";

const PR_NOTE =
  "Datos de ejemplo: esta liga no publica un feed de marcadores. Los equipos son reales; los juegos, posiciones y líneas son de muestra hasta conectar la fuente oficial.";

export async function getLeague(id: LeagueId, date: string): Promise<LeagueData> {
  const meta = leagueById(id)!;
  const updatedAt = new Date().toISOString();

  if (meta.espn) {
    const [games, standings] = await Promise.all([espnScoreboard(id, meta.espn, date), espnStandings(meta.espn)]);
    if (games && standings) {
      return { league: id, date, games, standings, source: "espn", updatedAt };
    }
    return {
      league: id,
      date,
      games: games ?? [],
      standings: standings ?? [],
      source: "espn",
      note: "ESPN no respondió. Intenta de nuevo en unos minutos.",
      updatedAt,
    };
  }

  const pr = id as "bsn" | "lbprc" | "doblea";
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
