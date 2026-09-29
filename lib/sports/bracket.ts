// lib/sports/bracket.ts
// Projected MLB bracket from standings, used before the postseason starts.
// Simplified: the top 6 teams by winning percentage in each league are
// seeded 1–6 (MLB actually seeds the 3 division winners 1–3).
import type { Bracket, BracketSeries, StandingRow, StandingsGroup } from "./types";

function leagueOf(name: string): "AL" | "NL" | null {
  if (/american|^AL\b/i.test(name)) return "AL";
  if (/national|^NL\b/i.test(name)) return "NL";
  return null;
}

const pct = (r: StandingRow) => (r.w + r.l ? r.w / (r.w + r.l) : 0);

export function projectedMlbBracket(standings: StandingsGroup[]): Bracket | null {
  const byLeague: Record<"AL" | "NL", StandingRow[]> = { AL: [], NL: [] };
  for (const g of standings) {
    const lg = leagueOf(g.name);
    if (lg) byLeague[lg].push(...g.rows);
  }
  if (byLeague.AL.length < 6 || byLeague.NL.length < 6) return null;

  const seeds = (lg: "AL" | "NL") => {
    const seen = new Set<string>();
    return byLeague[lg]
      .filter((r) => !seen.has(r.team.id) && seen.add(r.team.id))
      .sort((a, b) => pct(b) - pct(a))
      .slice(0, 6)
      .map((r, i) => ({ team: r.team, seed: i + 1 }));
  };
  const al = seeds("AL");
  const nl = seeds("NL");

  const wc = (lg: "AL" | "NL", s: typeof al): BracketSeries[] => [
    { id: `${lg}-wc1`, league: lg, top: s[5], bottom: s[2] },
    { id: `${lg}-wc2`, league: lg, top: s[4], bottom: s[3] },
  ];
  const ds = (lg: "AL" | "NL", s: typeof al): BracketSeries[] => [
    { id: `${lg}-ds1`, league: lg, top: { seed: undefined }, bottom: s[0], summary: "vs. ganador 4/5" },
    { id: `${lg}-ds2`, league: lg, top: { seed: undefined }, bottom: s[1], summary: "vs. ganador 3/6" },
  ];

  return {
    mode: "projected",
    rounds: [
      { id: "wc", name: "Serie del Comodín", series: [...wc("AL", al), ...wc("NL", nl)] },
      { id: "ds", name: "Serie Divisional", series: [...ds("AL", al), ...ds("NL", nl)] },
      {
        id: "cs",
        name: "Serie de Campeonato",
        series: [
          { id: "AL-cs", league: "AL", top: {}, bottom: {} },
          { id: "NL-cs", league: "NL", top: {}, bottom: {} },
        ],
      },
      { id: "ws", name: "Serie Mundial", series: [{ id: "ws", top: {}, bottom: {} }] },
    ],
  };
}
