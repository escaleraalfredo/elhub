// lib/utilities/weather.ts
// Server-side: National Weather Service (alerts + forecast) and National
// Hurricane Center (active storms). Free public APIs, no key needed.
import { WEATHER_ZONES } from "./municipios";

const UA = { "User-Agent": "ElHubPR/1.0 (contact: hola@elhub.app)", Accept: "application/geo+json, application/json" };

export interface WeatherAlert {
  id: string;
  event: string;
  headline: string;
  severity: string;
  areas: string;
  ends?: string;
  description?: string;
  instruction?: string;
  /** Worth a red banner at the top of the app. */
  urgent: boolean;
}

export interface ForecastPeriod {
  name: string;
  temp: number;
  unit: string;
  short: string;
  icon?: string;
  isDay: boolean;
  rain?: number | null;
}

export interface Storm {
  id: string;
  name: string;
  kind: string;
  windKt: number;
  pressure?: number;
  lat: number;
  lon: number;
  movement?: string;
  distanceKm: number;
  coneImage: string;
  advisoryUrl?: string;
  updated?: string;
}

export interface WeatherResponse {
  zone: string;
  alerts: WeatherAlert[];
  forecast: ForecastPeriod[];
  storms: Storm[];
  outlookImage: string;
  ok: { alerts: boolean; forecast: boolean; storms: boolean };
  updatedAt: string;
}

async function getJson<T>(url: string, revalidate: number): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(8000), next: { revalidate } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const URGENT = /hurricane|huracán|tropical storm|tormenta tropical|tsunami|flash flood warning|extreme wind|storm surge/i;

export async function getAlerts(): Promise<WeatherAlert[] | null> {
  const json = await getJson<{ features?: { properties: Record<string, string> }[] }>(
    "https://api.weather.gov/alerts/active?area=PR",
    300
  );
  if (!json) return null;
  return (json.features ?? []).map(({ properties: p }) => ({
    id: p.id,
    event: p.event,
    headline: p.headline ?? p.event,
    severity: p.severity ?? "Unknown",
    areas: p.areaDesc ?? "",
    ends: p.ends ?? p.expires,
    description: p.description,
    instruction: p.instruction,
    urgent: URGENT.test(p.event ?? "") || p.severity === "Extreme",
  }));
}

export async function getForecast(zone: string): Promise<ForecastPeriod[] | null> {
  const c = WEATHER_ZONES[zone] ?? WEATHER_ZONES["San Juan"];
  const point = await getJson<{ properties?: { forecast?: string } }>(
    `https://api.weather.gov/points/${c.lat.toFixed(4)},${c.lon.toFixed(4)}`,
    86400
  );
  const url = point?.properties?.forecast;
  if (!url) return null;
  const fc = await getJson<{
    properties?: {
      periods?: {
        name: string;
        temperature: number;
        temperatureUnit: string;
        shortForecast: string;
        icon?: string;
        isDaytime: boolean;
        probabilityOfPrecipitation?: { value: number | null };
      }[];
    };
  }>(url, 1800);
  if (!fc?.properties?.periods) return null;
  return fc.properties.periods.slice(0, 8).map((p) => ({
    name: p.name,
    temp: p.temperature,
    unit: p.temperatureUnit,
    short: p.shortForecast,
    icon: p.icon,
    isDay: p.isDaytime,
    rain: p.probabilityOfPrecipitation?.value,
  }));
}

const PR = { lat: 18.22, lon: -66.5 };
function km(lat: number, lon: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat - PR.lat);
  const dLon = toRad(lon - PR.lon);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(PR.lat)) * Math.cos(toRad(lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

const KIND: Record<string, string> = {
  HU: "Huracán",
  MH: "Huracán mayor",
  TS: "Tormenta tropical",
  TD: "Depresión tropical",
  STS: "Tormenta subtropical",
  SD: "Depresión subtropical",
  PTC: "Ciclón potencial",
  PC: "Post-tropical",
};

export async function getStorms(): Promise<Storm[] | null> {
  const json = await getJson<{
    activeStorms?: {
      id: string;
      name: string;
      classification: string;
      intensity?: string;
      pressure?: string;
      latitudeNumeric?: number;
      longitudeNumeric?: number;
      movementDir?: number;
      movementSpeed?: number;
      lastUpdate?: string;
      publicAdvisory?: { url?: string };
    }[];
  }>("https://www.nhc.noaa.gov/CurrentStorms.json", 600);
  if (!json) return null;
  return (json.activeStorms ?? [])
    .filter((s) => s.id?.toLowerCase().startsWith("al"))
    .map((s) => {
      const lat = s.latitudeNumeric ?? 0;
      const lon = s.longitudeNumeric ?? 0;
      const id = s.id.toUpperCase();
      return {
        id,
        name: s.name,
        kind: KIND[s.classification] ?? s.classification,
        windKt: Number(s.intensity ?? 0),
        pressure: s.pressure ? Number(s.pressure) : undefined,
        lat,
        lon,
        movement: s.movementSpeed ? `${s.movementDir ?? "?"}° a ${s.movementSpeed} mph` : undefined,
        distanceKm: km(lat, lon),
        coneImage: `https://www.nhc.noaa.gov/storm_graphics/AT${id.slice(2, 4)}/${id}_5day_cone_with_line_and_wind.png`,
        advisoryUrl: s.publicAdvisory?.url,
        updated: s.lastUpdate,
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export async function getWeather(zone: string): Promise<WeatherResponse> {
  const [alerts, forecast, storms] = await Promise.all([getAlerts(), getForecast(zone), getStorms()]);
  return {
    zone: WEATHER_ZONES[zone] ? zone : "San Juan",
    alerts: alerts ?? [],
    forecast: forecast ?? [],
    storms: storms ?? [],
    outlookImage: "https://www.nhc.noaa.gov/xgtwo/two_atl_7d0.png",
    ok: { alerts: !!alerts, forecast: !!forecast, storms: !!storms },
    updatedAt: new Date().toISOString(),
  };
}
