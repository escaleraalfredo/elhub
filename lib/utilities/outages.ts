// lib/utilities/outages.ts
// Power (LUMA) and water (AAA) service status by region.
// LUMA: reads the public feed behind LUMA's outage map (set
// LUMA_OUTAGES_URL to override). AAA has no public feed, so water shows
// sample data until one is connected.
import { REGION_NAMES, type Region } from "./municipios";

export interface RegionStatus {
  region: Region;
  clients: number;
  without: number;
}

export interface OutagesResponse {
  power: RegionStatus[];
  water: RegionStatus[];
  powerSample: boolean;
  waterSample: boolean;
  updatedAt: string;
}

const DEFAULT_LUMA = "https://api.miluma.lumapr.com/miluma-outage-api/outage/regionsWithoutService";

// Approximate customers per region (used for sample data and percentages).
const CLIENTS: Record<Region, number> = {
  "San Juan": 240000,
  Bayamón: 250000,
  Carolina: 190000,
  Caguas: 230000,
  Ponce: 230000,
  Mayagüez: 200000,
  Arecibo: 150000,
};

function norm(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Find region rows in an unknown JSON shape. */
function parseLuma(json: unknown): RegionStatus[] | null {
  const rows: RegionStatus[] = [];
  const visit = (v: unknown) => {
    if (Array.isArray(v)) return v.forEach(visit);
    if (!v || typeof v !== "object") return;
    const o = v as Record<string, unknown>;
    const name = [o.name, o.regionName, o.region, o.nombre].find((x) => typeof x === "string") as string | undefined;
    const region = name ? REGION_NAMES.find((r) => norm(r) === norm(name)) : undefined;
    const nums = Object.entries(o).filter(([, x]) => typeof x === "number") as [string, number][];
    const without = nums.find(([k]) => /without|sinservicio|affected|out/i.test(k))?.[1];
    const clients = nums.find(([k]) => /^total(clients)?$|clients$|customers$/i.test(k))?.[1];
    if (region && without !== undefined) {
      rows.push({ region, without, clients: clients && clients >= without ? clients : CLIENTS[region] });
      return;
    }
    Object.values(o).forEach(visit);
  };
  visit(json);
  return rows.length ? REGION_NAMES.map((r) => rows.find((x) => x.region === r) ?? { region: r, clients: CLIENTS[r], without: 0 }) : null;
}

function sample(seed: string, rate: number): RegionStatus[] {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return REGION_NAMES.map((region, i) => {
    const x = Math.abs(Math.sin(h + i * 7.3));
    return { region, clients: CLIENTS[region], without: Math.round(CLIENTS[region] * rate * x * x) };
  });
}

export async function getOutages(): Promise<OutagesResponse> {
  const hour = new Date().toISOString().slice(0, 13);
  let power: RegionStatus[] | null = null;
  try {
    const res = await fetch(process.env.LUMA_OUTAGES_URL ?? DEFAULT_LUMA, {
      headers: { Accept: "application/json", "User-Agent": "ElHubPR/1.0" },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 300 },
    });
    if (res.ok) power = parseLuma(await res.json());
  } catch {
    power = null;
  }
  return {
    power: power ?? sample(`p${hour}`, 0.04),
    water: sample(`w${hour.slice(0, 10)}`, 0.03),
    powerSample: !power,
    waterSample: true,
    updatedAt: new Date().toISOString(),
  };
}
