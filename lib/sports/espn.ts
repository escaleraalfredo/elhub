// lib/sports/espn.ts
// NBA and MLB scores, odds and standings from ESPN's public site API.
import type { Game, GameState, LeagueId, Odds, StandingsGroup, TeamRef } from "./types";

const SITE = "https://site.api.espn.com/apis/site/v2/sports";
const CORE = "https://site.api.espn.com/apis/v2/sports";

interface EspnTeam {
  id?: string;
  displayName?: string;
  shortDisplayName?: string;
  abbreviation?: string;
  logo?: string;
  logos?: { href?: string }[];
  color?: string;
}
interface EspnCompetitor {
  homeAway?: "home" | "away";
  score?: string;
  winner?: boolean;
  team?: EspnTeam;
  records?: { summary?: string }[];
}
interface EspnLine { close?: { odds?: string; line?: string }; open?: { odds?: string; line?: string } }
interface EspnOdds {
  provider?: { name?: string };
  details?: string;
  overUnder?: number;
  spread?: number;
  homeTeamOdds?: { moneyLine?: number; favorite?: boolean };
  awayTeamOdds?: { moneyLine?: number; favorite?: boolean };
  moneyline?: { home?: EspnLine; away?: EspnLine };
  pointSpread?: { home?: EspnLine; away?: EspnLine };
  total?: { over?: EspnLine; under?: EspnLine };
}
interface EspnEvent {
  id: string;
  date: string;
  competitions?: {
    competitors?: EspnCompetitor[];
    status?: { type?: { state?: string; shortDetail?: string; detail?: string } };
    venue?: { fullName?: string };
    broadcasts?: { names?: string[] }[];
    odds?: EspnOdds[];
  }[];
  status?: { type?: { state?: string; shortDetail?: string } };
}
interface EspnStat { name?: string; abbreviation?: string; displayValue?: string; value?: number }
interface EspnStandingsNode {
  name?: string;
  abbreviation?: string;
  standings?: { entries?: { team?: EspnTeam; stats?: EspnStat[] }[] };
  children?: EspnStandingsNode[];
}

async function getJson<T>(url: string, revalidate: number): Promise<T | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000), next: { revalidate } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function team(t: EspnTeam | undefined): TeamRef {
  return {
    id: t?.id ?? t?.abbreviation ?? "?",
    name: t?.shortDisplayName ?? t?.displayName ?? t?.abbreviation ?? "—",
    abbr: t?.abbreviation ?? "—",
    logo: t?.logo ?? t?.logos?.[0]?.href,
    color: t?.color,
  };
}

const signed = (n: number) => (n > 0 ? `+${n}` : n === 0 ? "PK" : `${n}`);

function parseOdds(o: EspnOdds | undefined, homeAbbr: string, awayAbbr: string): Odds | undefined {
  if (!o) return undefined;
  const odds: Odds = { provider: o.provider?.name, details: o.details };

  // Spread: prefer the explicit per-team lines, else derive from "ABBR -4.5".
  const hs = o.pointSpread?.home?.close?.line ?? o.pointSpread?.home?.open?.line;
  const as = o.pointSpread?.away?.close?.line ?? o.pointSpread?.away?.open?.line;
  if (hs || as) {
    odds.spread = { home: hs, away: as };
  } else if (o.details && /-?\d/.test(o.details)) {
    const m = o.details.match(/^(\S+)\s+([+-]?\d+(?:\.\d+)?)/);
    if (m) {
      const n = parseFloat(m[2]);
      const favIsHome = m[1] === homeAbbr || (m[1] !== awayAbbr && !!o.homeTeamOdds?.favorite);
      odds.spread = favIsHome ? { home: signed(n), away: signed(-n) } : { home: signed(-n), away: signed(n) };
    }
  } else if (typeof o.spread === "number") {
    odds.spread = { home: signed(o.spread), away: signed(-o.spread) };
  }

  const total = o.overUnder ?? parseFloat((o.total?.over?.close?.line ?? "").replace(/^[ou]/i, ""));
  if (Number.isFinite(total)) odds.total = String(total);

  const hml = o.homeTeamOdds?.moneyLine ?? o.moneyline?.home?.close?.odds;
  const aml = o.awayTeamOdds?.moneyLine ?? o.moneyline?.away?.close?.odds;
  if (hml !== undefined || aml !== undefined) {
    const f = (v: number | string | undefined) =>
      v === undefined ? undefined : typeof v === "number" ? signed(v) : v;
    odds.moneyline = { home: f(hml), away: f(aml) };
  }

  return odds.spread || odds.total || odds.moneyline || odds.details ? odds : undefined;
}

export async function espnScoreboard(league: LeagueId, path: string, date: string): Promise<Game[] | null> {
  const json = await getJson<{ events?: EspnEvent[] }>(`${SITE}/${path}/scoreboard?dates=${date}`, 30);
  if (!json) return null;
  return (json.events ?? []).map((e) => {
    const comp = e.competitions?.[0];
    const home = comp?.competitors?.find((c) => c.homeAway === "home");
    const away = comp?.competitors?.find((c) => c.homeAway === "away");
    const st = comp?.status?.type ?? e.status?.type;
    const state = (["pre", "in", "post"].includes(st?.state ?? "") ? st!.state : "pre") as GameState;
    const side = (c: EspnCompetitor | undefined) => ({
      team: team(c?.team),
      score: state === "pre" || c?.score === undefined ? undefined : Number(c.score),
      record: c?.records?.[0]?.summary,
      winner: c?.winner,
    });
    const h = side(home);
    const a = side(away);
    return {
      id: e.id,
      league,
      startTime: e.date,
      state,
      status:
        state === "pre"
          ? new Date(e.date).toLocaleTimeString("es-PR", { hour: "numeric", minute: "2-digit", timeZone: "America/Puerto_Rico" })
          : st?.shortDetail ?? "",
      home: h,
      away: a,
      venue: comp?.venue?.fullName,
      broadcast: comp?.broadcasts?.flatMap((b) => b.names ?? []).join(", ") || undefined,
      odds: parseOdds(comp?.odds?.[0], h.team.abbr, a.team.abbr),
    };
  });
}

export async function espnStandings(path: string): Promise<StandingsGroup[] | null> {
  const json = await getJson<EspnStandingsNode>(`${CORE}/${path}/standings`, 3600);
  if (!json) return null;
  const groups: StandingsGroup[] = [];
  const stat = (stats: EspnStat[] | undefined, ...names: string[]) =>
    stats?.find((s) => names.includes(s.name ?? "") || names.includes(s.abbreviation ?? ""));

  const walk = (node: EspnStandingsNode) => {
    const entries = node.standings?.entries ?? [];
    if (entries.length) {
      const rows = entries.map((en) => {
        const w = stat(en.stats, "wins", "W")?.value ?? 0;
        const l = stat(en.stats, "losses", "L")?.value ?? 0;
        const pct = stat(en.stats, "winPercent", "PCT");
        const gb = stat(en.stats, "gamesBehind", "GB")?.displayValue ?? "-";
        return {
          team: team(en.team),
          w,
          l,
          pct: pct?.displayValue ?? (w + l ? (w / (w + l)).toFixed(3).replace(/^0/, "") : ".000"),
          gb: gb === "0" ? "-" : gb,
          streak: stat(en.stats, "streak", "STRK")?.displayValue,
          _pct: pct?.value ?? (w + l ? w / (w + l) : 0),
        };
      });
      rows.sort((a, b) => b._pct - a._pct);
      groups.push({
        name: node.name ?? node.abbreviation ?? "",
        rows: rows.map(({ _pct, ...r }) => (void _pct, r)),
      });
    }
    node.children?.forEach(walk);
  };
  walk(json);
  return groups;
}

// ---------------------------------------------------------------- UFC

interface EspnAthlete {
  id?: string;
  displayName?: string;
  shortName?: string;
  flag?: { href?: string };
}
interface EspnFight {
  id: string;
  date?: string;
  type?: { abbreviation?: string; text?: string };
  cardSegment?: { description?: string };
  status?: {
    type?: { state?: string; shortDetail?: string; detail?: string };
    result?: { displayName?: string; name?: string };
    period?: number;
    displayClock?: string;
  };
  competitors?: { order?: number; winner?: boolean; athlete?: EspnAthlete; records?: { summary?: string }[] }[];
  odds?: EspnOdds[];
}
interface EspnCardEvent {
  id: string;
  name?: string;
  shortName?: string;
  date: string;
  competitions?: EspnFight[];
}

function fighter(a: EspnAthlete | undefined): TeamRef {
  const name = a?.displayName ?? "Por anunciar";
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
  return { id: a?.id ?? name, name, short: a?.shortName ?? name, abbr: initials, logo: a?.flag?.href };
}

/** UFC fight cards from ~2 weeks ago to ~6 weeks ahead, main event first. */
export async function espnUfc(date: string, shift: (k: string, d: number) => string): Promise<Game[] | null> {
  const range = `${shift(date, -14)}-${shift(date, 45)}`;
  const json = await getJson<{ events?: EspnCardEvent[] }>(`${SITE}/mma/ufc/scoreboard?dates=${range}`, 300);
  if (!json) return null;
  const games: Game[] = [];
  for (const ev of json.events ?? []) {
    const fights = [...(ev.competitions ?? [])].reverse();
    for (const f of fights) {
      const [c1, c2] = [...(f.competitors ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const st = f.status?.type;
      const state = (["pre", "in", "post"].includes(st?.state ?? "") ? st!.state : "pre") as GameState;
      const start = f.date ?? ev.date;
      const result = f.status?.result?.displayName;
      games.push({
        id: `${ev.id}-${f.id}`,
        league: "ufc",
        startTime: start,
        state,
        status:
          state === "pre"
            ? new Date(start).toLocaleDateString("es-PR", { weekday: "short", day: "numeric", month: "short", timeZone: "America/Puerto_Rico" })
            : state === "post"
              ? result
                ? `Final · ${result}`
                : "Final"
              : `R${f.status?.period ?? 1} ${f.status?.displayClock ?? ""}`.trim(),
        away: { team: fighter(c1?.athlete), record: c1?.records?.[0]?.summary, winner: c1?.winner },
        home: { team: fighter(c2?.athlete), record: c2?.records?.[0]?.summary, winner: c2?.winner },
        group: ev.name ?? ev.shortName ?? "UFC",
        detail: [f.type?.abbreviation ?? f.type?.text, f.cardSegment?.description].filter(Boolean).join(" · ") || undefined,
        odds: parseOdds(f.odds?.[0], "", ""),
      });
    }
  }
  return games;
}

// ---------------------------------------------------------------- MLB postseason

interface EspnPostEvent extends EspnEvent {
  notes?: { headline?: string }[];
  competitions?: (NonNullable<EspnEvent["competitions"]>[number] & {
    notes?: { headline?: string }[];
    series?: { summary?: string; competitors?: { id?: string; wins?: number }[] };
  })[];
}

const ROUND_NAMES: Record<"wc" | "ds" | "cs" | "ws", string> = {
  wc: "Serie del Comodín",
  ds: "Serie Divisional",
  cs: "Serie de Campeonato",
  ws: "Serie Mundial",
};
const WINS_NEEDED = { wc: 2, ds: 3, cs: 4, ws: 4 } as const;

/** Real MLB postseason series for the season of `date`, or null if none yet. */
export async function espnMlbPostseason(date: string): Promise<import("./types").Bracket | null> {
  const year = date.slice(0, 4);
  const json = await getJson<{ events?: EspnPostEvent[] }>(
    `${SITE}/baseball/mlb/scoreboard?seasontype=3&dates=${year}0925-${year}1110&limit=300`,
    300
  );
  const events = json?.events ?? [];
  if (!events.length) return null;

  type Acc = import("./types").BracketSeries & { round: keyof typeof ROUND_NAMES };
  const series = new Map<string, Acc>();
  for (const e of events) {
    const comp = e.competitions?.[0];
    const headline = comp?.notes?.[0]?.headline ?? e.notes?.[0]?.headline ?? "";
    const round: keyof typeof ROUND_NAMES | null = /world series/i.test(headline)
      ? "ws"
      : /championship|alcs|nlcs/i.test(headline)
        ? "cs"
        : /division|alds|nlds/i.test(headline)
          ? "ds"
          : /wild ?card/i.test(headline)
            ? "wc"
            : null;
    if (!round) continue;
    const league = round === "ws" ? undefined : /\b(AL|American)/.test(headline) ? "AL" : /\b(NL|National)/.test(headline) ? "NL" : undefined;
    const home = comp?.competitors?.find((c) => c.homeAway === "home");
    const away = comp?.competitors?.find((c) => c.homeAway === "away");
    if (!home?.team || !away?.team) continue;
    const ids = [home.team.id ?? "", away.team.id ?? ""].sort();
    const key = `${round}:${ids.join("-")}`;
    const winsFor = (id?: string) => comp?.series?.competitors?.find((c) => c.id === id)?.wins;
    const prev = series.get(key);
    const top = prev?.top.team ? prev.top : { team: team(away.team) };
    const bottom = prev?.bottom.team ? prev.bottom : { team: team(home.team) };
    const tw = winsFor(top.team?.id);
    const bw = winsFor(bottom.team?.id);
    series.set(key, {
      id: key,
      round,
      league,
      top: { ...top, wins: Math.max(tw ?? 0, top.wins ?? 0) },
      bottom: { ...bottom, wins: Math.max(bw ?? 0, bottom.wins ?? 0) },
      summary: comp?.series?.summary ?? prev?.summary,
    });
  }
  if (!series.size) return null;

  const rounds = (["wc", "ds", "cs", "ws"] as const).map((id) => ({
    id,
    name: ROUND_NAMES[id],
    series: [...series.values()]
      .filter((s) => s.round === id)
      .map(({ round, ...s }) => {
        void round;
        const need = WINS_NEEDED[id];
        return {
          ...s,
          top: { ...s.top, winner: (s.top.wins ?? 0) >= need },
          bottom: { ...s.bottom, winner: (s.bottom.wins ?? 0) >= need },
        };
      })
      .sort((a, b) => (a.league ?? "").localeCompare(b.league ?? "")),
  }));
  return { mode: "live", rounds };
}
