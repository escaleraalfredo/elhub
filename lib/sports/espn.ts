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
