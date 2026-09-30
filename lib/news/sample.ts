// lib/news/sample.ts
// Shown only when no news source can be reached (offline dev, outages).
import type { NewsItem } from "./types";
import { classify, municipiosIn } from "./classify";

const SAMPLE: Array<Omit<NewsItem, "id" | "publishedAt" | "section" | "municipios"> & { minutesAgo: number }> = [
  { title: "Titular de ejemplo: NotiCel", sourceId: "noticel", sourceName: "NotiCel", link: "https://www.noticel.com", minutesAgo: 12, excerpt: "Este es un titular de muestra. Cuando el servidor pueda conectarse a las fuentes, aquí verás las noticias reales." },
  { title: "Titular de ejemplo: El Vocero", sourceId: "elvocero", sourceName: "El Vocero", link: "https://www.elvocero.com", minutesAgo: 35 },
  { title: "Titular de ejemplo: El Nuevo Día", sourceId: "endi", sourceName: "El Nuevo Día", link: "https://www.elnuevodia.com", minutesAgo: 58 },
  { title: "Titular de ejemplo: Primera Hora", sourceId: "primerahora", sourceName: "Primera Hora", link: "https://www.primerahora.com", minutesAgo: 90 },
  { title: "Titular de ejemplo: Metro PR", sourceId: "metro", sourceName: "Metro PR", link: "https://www.metro.pr", minutesAgo: 140 },
  { title: "Titular de ejemplo: Telemundo PR", sourceId: "telemundo", sourceName: "Telemundo PR", link: "https://www.telemundopr.com", minutesAgo: 200 },
  { title: "Ejemplo: alcaldesa de Bayamón anuncia mejoras en parques", sourceId: "primerahora", sourceName: "Primera Hora", link: "https://www.primerahora.com", minutesAgo: 230 },
  { title: "Ejemplo: boricuas en Orlando celebran festival cultural", sourceId: "diaspora", sourceName: "Diáspora", link: "https://news.google.com", minutesAgo: 260 },
  { title: "Ejemplo: Departamento de Salud advierte sobre casos de dengue en Ponce", sourceId: "endi", sourceName: "El Nuevo Día", link: "https://www.elnuevodia.com", minutesAgo: 300 },
];

export function sampleNews(now = Date.now()): NewsItem[] {
  return SAMPLE.map(({ minutesAgo, ...n }, i) => ({
    ...n,
    section: n.sourceId === "diaspora" ? "Diáspora" : classify(n.title, n.excerpt),
    municipios: municipiosIn(n.title, n.excerpt),
    id: `sample-${i}`,
    publishedAt: new Date(now - minutesAgo * 60_000).toISOString(),
  }));
}
