// lib/sports/prLeagues.ts
// BSN, LBPRC and Doble A don't publish a public scores API. Until an official
// feed is connected, these leagues show SAMPLE data: real team names, but
// generated schedules, scores, standings and lines. Everything is
// deterministic per date so the numbers don't jump around on refresh, and
// "today" games move from scheduled → live → final by the clock.
import { keyToDate } from "./leagues";
import type { Game, GameState, LeagueId, Odds, StandingsGroup, TeamRef } from "./types";

type TeamDef = TeamRef & { group: string };

const t = (id: string, name: string, abbr: string, color: string, group = "Tabla general"): TeamDef => ({
  id, name, short: name.split(" de ")[0], abbr, color, group,
});

export type PrLeague = "bsn" | "lbprc" | "doblea" | "lvsf";

const TEAMS: Record<PrLeague, TeamDef[]> = {
  bsn: [
    t("bay", "Vaqueros de Bayamón", "BAY", "1d4ed8"),
    t("san", "Cangrejeros de Santurce", "SAN", "dc2626"),
    t("pon", "Leones de Ponce", "PON", "b91c1c"),
    t("car", "Gigantes de Carolina", "CAR", "0f766e"),
    t("gua", "Mets de Guaynabo", "GUA", "2563eb"),
    t("are", "Capitanes de Arecibo", "ARE", "ca8a04"),
    t("cag", "Criollos de Caguas", "CAG", "7c3aed"),
    t("may", "Indios de Mayagüez", "MAY", "dc2626"),
    t("man", "Osos de Manatí", "MAN", "0369a1"),
    t("que", "Piratas de Quebradillas", "QUE", "334155"),
    t("sge", "Atléticos de San Germán", "SGE", "16a34a"),
    t("agu", "Santeros de Aguada", "AGU", "ea580c"),
  ],
  lbprc: [
    t("san", "Cangrejeros de Santurce", "SAN", "dc2626"),
    t("cag", "Criollos de Caguas", "CAG", "7c3aed"),
    t("car", "Gigantes de Carolina", "CAR", "0f766e"),
    t("may", "Indios de Mayagüez", "MAY", "dc2626"),
    t("pon", "Leones de Ponce", "PON", "b91c1c"),
    t("ra12", "RA12", "RA12", "1e3a8a"),
  ],
  doblea: [
    t("jun", "Mulos de Juncos", "JUN", "6b7280", "Sección Este"),
    t("hum", "Grises de Humacao", "HUM", "475569", "Sección Este"),
    t("cay", "Toritos de Cayey", "CAY", "b91c1c", "Sección Este"),
    t("gya", "Brujos de Guayama", "GYA", "581c87", "Sección Este"),
    t("coa", "Maratonistas de Coamo", "COA", "0f766e", "Sección Sur"),
    t("yau", "Cafeteros de Yauco", "YAU", "78350f", "Sección Sur"),
    t("ssb", "Patrulleros de San Sebastián", "SSB", "1d4ed8", "Sección Oeste"),
    t("are", "Lobos de Arecibo", "ARE", "ca8a04", "Sección Oeste"),
    t("man", "Atenienses de Manatí", "MAN", "0369a1", "Sección Oeste"),
    t("sis", "Pescadores de Santa Isabel", "SIS", "0891b2", "Sección Sur"),
  ],
  lvsf: [
    t("cag", "Criollas de Caguas", "CAG", "7c3aed"),
    t("nar", "Changas de Naranjito", "NAR", "ea580c"),
    t("cor", "Pinkin de Corozal", "COR", "db2777"),
    t("jun", "Valencianas de Juncos", "JUN", "0f766e"),
    t("sjn", "Sanjuaneras de la Capital", "SJN", "1d4ed8"),
    t("pon", "Leonas de Ponce", "PON", "b91c1c"),
    t("may", "Indias de Mayagüez", "MAY", "dc2626"),
    t("gua", "Mets de Guaynabo", "GUA", "2563eb"),
  ],
};

const SPORT: Record<PrLeague, "basketball" | "baseball" | "volleyball"> = {
  bsn: "basketball",
  lbprc: "baseball",
  doblea: "baseball",
  lvsf: "volleyball",
};

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function rng(seed: string) {
  let a = hash(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable team strength in [-1, 1] for the season. */
function rating(league: string, id: string) {
  return rng(`${league}:${id}:rating`)() * 2 - 1;
}

const signed = (n: number) => (n > 0 ? `+${n}` : n === 0 ? "PK" : `${n}`);
const half = (n: number) => Math.round(n * 2) / 2;

function moneyline(pHome: number) {
  const ml = (p: number) => (p >= 0.5 ? -Math.round((p / (1 - p)) * 100 / 5) * 5 : Math.round(((1 - p) / p) * 100 / 5) * 5);
  // ~4% book margin split across both sides
  return { home: signed(ml(pHome + 0.02)), away: signed(ml(1 - pHome + 0.02)) };
}

function makeOdds(league: PrLeague, home: TeamDef, away: TeamDef, r: () => number): Odds {
  const edge = rating(league, home.id) - rating(league, away.id) + 0.15; // home advantage
  const pHome = Math.min(0.78, Math.max(0.22, 0.5 + edge * 0.3));
  if (SPORT[league] === "basketball") {
    const spread = half(-edge * 6) || -1.5;
    return {
      provider: "Muestra",
      spread: { home: signed(spread), away: signed(-spread) },
      total: String(half(158 + r() * 18)),
      moneyline: moneyline(pHome),
    };
  }
  if (SPORT[league] === "volleyball") return { provider: "Muestra", moneyline: moneyline(pHome) };
  const homeFav = pHome >= 0.5;
  return {
    provider: "Muestra",
    spread: { home: homeFav ? "-1.5" : "+1.5", away: homeFav ? "+1.5" : "-1.5" },
    total: String(half(7 + r() * 3)),
    moneyline: moneyline(pHome),
  };
}

const START_TIMES = ["19:00", "19:30", "20:00", "20:15", "18:30"];

function pairings(league: PrLeague, date: string) {
  const teams = [...TEAMS[league]];
  const r = rng(`${league}:${date}:pairs`);
  for (let i = teams.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [teams[i], teams[j]] = [teams[j], teams[i]];
  }
  const count = league === "doblea" ? 4 : league === "lvsf" ? 2 : 3;
  const out: [TeamDef, TeamDef][] = [];
  for (let i = 0; i + 1 < teams.length && out.length < count; i += 2) out.push([teams[i], teams[i + 1]]);
  return out;
}

function progressStatus(sport: "basketball" | "baseball" | "volleyball", frac: number) {
  if (sport === "volleyball") return `Set ${Math.min(5, Math.floor(frac * 5) + 1)}`;
  if (sport === "basketball") {
    const q = Math.min(4, Math.floor(frac * 4) + 1);
    const left = Math.max(0, Math.round((1 - (frac * 4 - (q - 1))) * 600));
    return `Q${q} ${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
  }
  const halfInning = Math.min(17, Math.floor(frac * 18));
  return `${halfInning % 2 === 0 ? "Alta" : "Baja"} ${Math.floor(halfInning / 2) + 1}`;
}

export function samplePrGames(league: PrLeague, date: string, now = Date.now()): Game[] {
  const sport = SPORT[league];
  const day = keyToDate(date);
  return pairings(league, date).map(([home, away], i) => {
    const r = rng(`${league}:${date}:${i}`);
    const [hh, mm] = START_TIMES[i % START_TIMES.length].split(":").map(Number);
    // PR is UTC-4 all year.
    const start = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), hh + 4, mm);
    const duration = (sport === "baseball" ? 3 : sport === "volleyball" ? 2 : 2.25) * 3600_000;
    const frac = (now - start) / duration;
    const state: GameState = frac < 0 ? "pre" : frac >= 1 ? "post" : "in";

    const edge = rating(league, home.id) - rating(league, away.id) + 0.15;
    const base = sport === "basketball" ? 80 : 4;
    const spread = sport === "basketball" ? 14 : 4;
    let hs = Math.max(0, Math.round(base + edge * spread * 0.6 + (r() - 0.5) * spread * 1.4));
    let as = Math.max(0, Math.round(base - edge * spread * 0.6 + (r() - 0.5) * spread * 1.4));
    if (hs === as) hs += sport === "basketball" ? 2 : 1;
    if (sport === "volleyball") {
      // Sets won: best of five.
      const homeWins = hs > as;
      const loserSets = Math.floor(r() * 3);
      hs = homeWins ? 3 : loserSets;
      as = homeWins ? loserSets : 3;
    }
    if (state === "in") {
      hs = Math.round(hs * frac);
      as = Math.round(as * frac);
    }

    const status =
      state === "pre"
        ? new Date(start).toLocaleTimeString("es-PR", { hour: "numeric", minute: "2-digit", timeZone: "America/Puerto_Rico" })
        : state === "in"
          ? progressStatus(sport, frac)
          : "Final";

    const strip = ({ group, ...team }: TeamDef) => (void group, team);
    return {
      id: `${league}-${date}-${i}`,
      league: league as LeagueId,
      startTime: new Date(start).toISOString(),
      state,
      status,
      home: { team: strip(home), score: state === "pre" ? undefined : hs, winner: state === "post" ? hs > as : undefined },
      away: { team: strip(away), score: state === "pre" ? undefined : as, winner: state === "post" ? as > hs : undefined },
      odds: state === "post" ? undefined : makeOdds(league, home, away, r),
    };
  });
}

export function samplePrStandings(league: PrLeague): StandingsGroup[] {
  const games = league === "bsn" ? 24 : league === "lbprc" ? 30 : league === "lvsf" ? 18 : 20;
  const byGroup = new Map<string, StandingsGroup>();
  for (const team of TEAMS[league]) {
    const r = rng(`${league}:${team.id}:record`);
    const p = 0.5 + rating(league, team.id) * 0.3 + (r() - 0.5) * 0.1;
    const w = Math.max(0, Math.min(games, Math.round(games * p)));
    const l = games - w;
    const streakLen = 1 + Math.floor(r() * 4);
    const { group, ...ref } = team;
    const row = {
      team: ref,
      w,
      l,
      pct: (w / games).toFixed(3).replace(/^0/, ""),
      gb: "-",
      streak: `${r() < p ? "G" : "P"}${streakLen}`,
    };
    if (!byGroup.has(group)) byGroup.set(group, { name: group, rows: [] });
    byGroup.get(group)!.rows.push(row);
  }
  const groups = [...byGroup.values()];
  for (const g of groups) {
    g.rows.sort((a, b) => b.w - a.w || a.l - b.l);
    const lead = g.rows[0];
    g.rows.forEach((row, i) => {
      const gb = ((lead.w - row.w) + (row.l - lead.l)) / 2;
      row.gb = i === 0 || gb === 0 ? "-" : String(gb);
    });
  }
  return groups;
}

// ---------------------------------------------------------------- Boxing

const BOXERS = [
  ["Luis “El Torito” Rivera (ejemplo)", "Carlos Méndez (ejemplo)", "Peso Pluma"],
  ["Javier Ortiz (ejemplo)", "Miguel Santos (ejemplo)", "Peso Ligero"],
  ["Ana “La Fiera” Colón (ejemplo)", "Sofía Díaz (ejemplo)", "Peso Mosca"],
  ["Pedro Vélez (ejemplo)", "Andrés Ruiz (ejemplo)", "Peso Súper Gallo"],
];

/** Next Saturday's sample card in Bayamón, plus the previous one with results. */
export function sampleBoxing(date: string, now = Date.now()): Game[] {
  const day = keyToDate(date);
  const dow = day.getUTCDay();
  const nextSat = new Date(day.getTime() + ((6 - dow + 7) % 7) * 86400000);
  const lastSat = new Date(nextSat.getTime() - 7 * 86400000);
  const card = (sat: Date, label: string) =>
    BOXERS.map(([a, b, weight], i) => {
      const start = Date.UTC(sat.getUTCFullYear(), sat.getUTCMonth(), sat.getUTCDate(), 24 + 4 - i, 0);
      const state: GameState = now < start ? "pre" : now < start + 3600_000 ? "in" : "post";
      const r = rng(`box:${sat.toISOString()}:${i}`);
      const aWins = r() > 0.5;
      const mk = (name: string): TeamRef => ({
        id: name,
        name,
        short: name.replace(/ \(ejemplo\)/, ""),
        abbr: name.split(/\s+/).map((p) => p[0]).join("").replace(/[^A-Z]/g, "").slice(0, 2),
        color: "475569",
      });
      const odds: Odds = { provider: "Muestra", moneyline: aWins ? { away: "-160", home: "+135" } : { away: "+120", home: "-145" } };
      return {
        id: `boxeo-${sat.toISOString().slice(0, 10)}-${i}`,
        league: "boxeo" as LeagueId,
        startTime: new Date(start).toISOString(),
        state,
        status:
          state === "pre"
            ? new Date(start).toLocaleDateString("es-PR", { weekday: "short", day: "numeric", month: "short", timeZone: "America/Puerto_Rico" })
            : state === "in"
              ? `R${1 + Math.floor(r() * 8)}`
              : `Final · ${["KO", "TKO", "Decisión unánime", "Decisión dividida"][Math.floor(r() * 4)]}`,
        away: { team: mk(a), record: `${12 + i}-${i}-0`, winner: state === "post" ? aWins : undefined },
        home: { team: mk(b), record: `${10 + i}-${2 + i}-1`, winner: state === "post" ? !aWins : undefined },
        group: label,
        detail: `${weight}${i === 0 ? " · Estelar" : ""}`,
        odds: state === "post" ? undefined : odds,
      };
    });
  return [
    ...card(nextSat, "Noche de boxeo boricua · Coliseo Rubén Rodríguez (ejemplo)"),
    ...card(lastSat, "Cartelera anterior · Coliseo Pachín Vicéns (ejemplo)"),
  ];
}
