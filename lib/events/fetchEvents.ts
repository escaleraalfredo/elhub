// lib/events/fetchEvents.ts
// Upcoming Puerto Rico events from the Ticketmaster Discovery API (free key:
// developer.ticketmaster.com → set TICKETMASTER_API_KEY). Falls back to
// sample events when no key is configured or the API fails.
import { sampleEvents } from "./sample";
import type { EventCategory, EventItem, EventsResponse } from "./types";

interface TmEvent {
  id: string;
  name: string;
  url?: string;
  info?: string;
  dates?: { start?: { localDate?: string; localTime?: string; dateTime?: string } };
  classifications?: { segment?: { name?: string }; genre?: { name?: string } }[];
  priceRanges?: { min?: number; max?: number }[];
  images?: { url: string; ratio?: string; width?: number }[];
  _embedded?: { venues?: { name?: string; city?: { name?: string } }[] };
}

function category(e: TmEvent): EventCategory {
  const seg = e.classifications?.[0]?.segment?.name ?? "";
  const genre = (e.classifications?.[0]?.genre?.name ?? "").toLowerCase();
  if (seg === "Music") return genre.includes("festival") ? "festivales" : "conciertos";
  if (seg === "Sports") return "juegos";
  if (seg === "Family" || genre.includes("children")) return "familia";
  if (genre.includes("festival") || genre.includes("fair")) return "festivales";
  return "entretenimiento";
}

function toItem(e: TmEvent): EventItem | null {
  const date = e.dates?.start?.localDate;
  if (!date) return null;
  const time = e.dates?.start?.localTime ?? "20:00:00";
  const start = e.dates?.start?.dateTime ?? new Date(`${date}T${time}-04:00`).toISOString();
  const venue = e._embedded?.venues?.[0];
  const img =
    e.images?.filter((i) => i.ratio === "16_9").sort((a, b) => Math.abs((a.width ?? 0) - 640) - Math.abs((b.width ?? 0) - 640))[0] ??
    e.images?.[0];
  const price = e.priceRanges?.[0];
  return {
    id: `tm-${e.id}`,
    title: e.name,
    category: category(e),
    start,
    day: date,
    venue: venue?.name ?? "Por anunciar",
    city: venue?.city?.name ?? "Puerto Rico",
    image: img?.url,
    url: e.url,
    priceMin: price?.min,
    priceMax: price?.max,
    description: e.info,
  };
}

export async function fetchEvents(): Promise<EventsResponse> {
  const now = Date.now();
  const key = process.env.TICKETMASTER_API_KEY;
  const fallback = { events: sampleEvents(now), sample: true, updatedAt: new Date(now).toISOString() };
  if (!key) return fallback;

  const params = new URLSearchParams({
    apikey: key,
    countryCode: "PR",
    size: "150",
    sort: "date,asc",
    startDateTime: new Date(now).toISOString().replace(/\.\d{3}Z$/, "Z"),
  });
  try {
    const res = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?${params}`, {
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return fallback;
    const json = (await res.json()) as { _embedded?: { events?: TmEvent[] } };
    const events = (json._embedded?.events ?? []).map(toItem).filter((e): e is EventItem => !!e);
    if (!events.length) return fallback;
    return { events, sample: false, updatedAt: new Date(now).toISOString() };
  } catch {
    return fallback;
  }
}
