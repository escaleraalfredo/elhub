import { NextResponse } from "next/server";
import type { NewsArticle } from "@/lib/types";

// Revalidate every 15 minutes
export const revalidate = 900;

interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  image: string;
}

// Deterministic hash for generating article IDs from URLs
function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0; // keep unsigned 32-bit
  }
  return hash.toString(36).padStart(7, "0");
}

// Pseudo-random but stable view count per article (avoids random() on every request)
const VIEWS_BASE = 1000;
const VIEWS_SPREAD = 19000;
const VIEWS_MULTIPLIER = 3713;
const PLACEHOLDER_IMAGES = [
  "https://picsum.photos/id/1015/1200/800",
  "https://picsum.photos/id/201/1200/800",
  "https://picsum.photos/id/870/1200/800",
  "https://picsum.photos/id/1039/1200/800",
  "https://picsum.photos/id/180/1200/800",
  "https://picsum.photos/id/250/1200/800",
  "https://picsum.photos/id/430/1200/800",
  "https://picsum.photos/id/326/1200/800",
];

function extractTag(xml: string, tag: string): string {
  // Try CDATA first
  const cdataRe = new RegExp(
    `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`,
    "i"
  );
  const cdata = cdataRe.exec(xml);
  if (cdata) return cdata[1].trim();

  // Plain text
  const plainRe = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const plain = plainRe.exec(xml);
  return plain ? plain[1].trim() : "";
}

function extractImage(itemXml: string): string {
  // <media:content url="..." />
  const mediaRe = /media:content[^>]+url="([^"]+)"/i;
  const media = mediaRe.exec(itemXml);
  if (media) return media[1];

  // <enclosure url="..." type="image/..." />
  const encRe = /enclosure[^>]+url="([^"]+)"[^>]+type="image/i;
  const enc = encRe.exec(itemXml);
  if (enc) return enc[1];

  // img src inside description
  const ogRe = /src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i;
  const og = ogRe.exec(itemXml);
  if (og) return og[1];

  return "";
}

function parseRss(xml: string, sourceName: string): RssItem[] {
  const items: RssItem[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRe.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = extractTag(itemXml, "title");
    const link = extractTag(itemXml, "link") || extractTag(itemXml, "guid");
    const pubDate = extractTag(itemXml, "pubDate");
    const image = extractImage(itemXml);
    if (title && link) {
      items.push({ title, link, pubDate, source: sourceName, image });
    }
  }
  return items;
}

async function fetchFeed(url: string, sourceName: string): Promise<RssItem[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "ElHub/1.0 (+https://elhub.pr)" },
      next: { revalidate: 900 },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRss(xml, sourceName);
  } catch {
    return [];
  }
}

export async function GET() {
  const feeds = await Promise.allSettled([
    fetchFeed(
      "https://news.google.com/rss/search?q=puerto+rico&hl=es-419&gl=PR&ceid=PR:es-419",
      "Google News PR"
    ),
    fetchFeed("https://www.elnuevodia.com/rss/", "El Nuevo Día"),
    fetchFeed("https://www.primerahora.com/rss/", "Primera Hora"),
  ]);

  const allItems: RssItem[] = [];
  for (const result of feeds) {
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    }
  }

  // Deduplicate by title prefix
  const seen = new Set<string>();
  const deduped: RssItem[] = [];
  for (const item of allItems) {
    const key = item.title.toLowerCase().slice(0, 60);
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }

  // Sort most recent first, take up to 20
  const sorted = deduped
    .sort(
      (a, b) =>
        new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime()
    )
    .slice(0, 20);

  const articles: NewsArticle[] = sorted.map((item, i) => ({
    id: simpleHash(item.link),
    title: item.title,
    source: item.source,
    url: item.link,
    image: item.image || PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length],
    views: VIEWS_BASE + ((i * VIEWS_MULTIPLIER) % VIEWS_SPREAD),
    created_at: item.pubDate
      ? new Date(item.pubDate).toISOString()
      : new Date().toISOString(),
  }));

  // Fallback if all feeds failed
  if (articles.length === 0) {
    const fallback: NewsArticle[] = [
      {
        id: "fallback-1",
        title: "LUMA anuncia nuevo aumento de tarifas para 2026",
        source: "El Nuevo Día",
        url: "#",
        image: PLACEHOLDER_IMAGES[0],
        views: 18400,
        created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      },
      {
        id: "fallback-2",
        title: "La Placita registra récord de visitantes este fin de semana",
        source: "Primera Hora",
        url: "#",
        image: PLACEHOLDER_IMAGES[1],
        views: 12400,
        created_at: new Date(Date.now() - 47 * 60 * 1000).toISOString(),
      },
      {
        id: "fallback-3",
        title: "Puerto Rico avanza a semifinales en la Serie del Caribe",
        source: "Metro PR",
        url: "#",
        image: PLACEHOLDER_IMAGES[2],
        views: 23100,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ];
    return NextResponse.json(fallback);
  }

  return NextResponse.json(articles);
}
