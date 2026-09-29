// lib/news/sources.ts
// Puerto Rico outlets pulled into the Noticias feed. Each source lists its
// own RSS feed(s); if those fail or come back empty, the server falls back to
// a Google News RSS search restricted to the outlet's domain.
export interface NewsSource {
  id: string;
  name: string;
  domain: string;
  /** Tailwind background class for the source badge. */
  color: string;
  feeds: string[];
}

export const NEWS_SOURCES: NewsSource[] = [
  {
    id: "noticel",
    name: "NotiCel",
    domain: "noticel.com",
    color: "bg-rose-600",
    feeds: ["https://www.noticel.com/arc/outboundfeeds/rss/?outputType=xml"],
  },
  {
    id: "elvocero",
    name: "El Vocero",
    domain: "elvocero.com",
    color: "bg-blue-600",
    feeds: ["https://www.elvocero.com/search/?f=rss&t=article&l=50&s=start_time&sd=desc"],
  },
  {
    id: "endi",
    name: "El Nuevo Día",
    domain: "elnuevodia.com",
    color: "bg-sky-600",
    feeds: ["https://www.elnuevodia.com/arc/outboundfeeds/rss/?outputType=xml"],
  },
  {
    id: "primerahora",
    name: "Primera Hora",
    domain: "primerahora.com",
    color: "bg-amber-500",
    feeds: ["https://www.primerahora.com/arc/outboundfeeds/rss/?outputType=xml"],
  },
  {
    id: "metro",
    name: "Metro PR",
    domain: "metro.pr",
    color: "bg-emerald-600",
    feeds: ["https://www.metro.pr/arc/outboundfeeds/rss/?outputType=xml"],
  },
  {
    id: "telemundo",
    name: "Telemundo PR",
    domain: "telemundopr.com",
    color: "bg-violet-600",
    feeds: ["https://www.telemundopr.com/feed/"],
  },
  {
    id: "notiuno",
    name: "NotiUno",
    domain: "notiuno.com",
    color: "bg-red-700",
    feeds: [],
  },
  {
    id: "wapa",
    name: "WAPA",
    domain: "wapa.tv",
    color: "bg-orange-600",
    feeds: [],
  },
  {
    id: "cpi",
    name: "Periodismo Investigativo",
    domain: "periodismoinvestigativo.com",
    color: "bg-teal-600",
    feeds: ["https://periodismoinvestigativo.com/feed/"],
  },
];

export function googleNewsFeed(domain: string) {
  const q = encodeURIComponent(`site:${domain} when:3d`);
  return `https://news.google.com/rss/search?q=${q}&hl=es-419&gl=US&ceid=US:es-419`;
}

export function sourceById(id: string) {
  return NEWS_SOURCES.find((s) => s.id === id);
}
