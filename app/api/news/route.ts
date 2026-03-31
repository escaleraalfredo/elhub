import { NextResponse } from "next/server";
import type { NewsArticle } from "@/lib/types";

const PR_FEEDS: { name: string; url: string; fallback: string }[] = [
  {
    name: "El Nuevo Día",
    url: "https://www.elnuevodia.com/rss.xml",
    fallback: "https://picsum.photos/id/1015/1200/800",
  },
  {
    name: "Primera Hora",
    url: "https://www.primerahora.com/rss/",
    fallback: "https://picsum.photos/id/201/1200/800",
  },
  {
    name: "NotiCel",
    url: "https://noticel.com/api/rss/",
    fallback: "https://picsum.photos/id/870/1200/800",
  },
  {
    name: "Metro PR",
    url: "https://metro.pr/rss.xml",
    fallback: "https://picsum.photos/id/1040/1200/800",
  },
  {
    name: "El Vocero",
    url: "https://www.elvocero.com/arcio/rss/",
    fallback: "https://picsum.photos/id/1060/1200/800",
  },
];

// Simple in-memory cache to avoid hammering RSS feeds on every request
let cache: { articles: NewsArticle[]; ts: number } | null = null;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function extractText(block: string, tag: string): string {
  const re = new RegExp(`<${tag}(?:[^>]*)>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = block.match(re);
  if (!m) return "";
  const raw = m[1].trim();
  const cdata = raw.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return (cdata ? cdata[1] : raw).replace(/<[^>]+>/g, "").trim();
}

function extractImage(block: string): string {
  let m = block.match(/media:content[^>]+url="([^"]+)"/i);
  if (m) return m[1];
  m = block.match(/media:thumbnail[^>]+url="([^"]+)"/i);
  if (m) return m[1];
  m = block.match(/enclosure[^>]+url="([^"]+)"/i);
  if (m) return m[1];
  m = block.match(/<img[^>]+src="([^"]+)"/i);
  if (m) return m[1];
  return "";
}

function stableId(url: string): string {
  let h = 0;
  for (let i = 0; i < url.length; i++) {
    h = ((h << 5) - h + url.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

function parseRSS(xml: string, source: string, fallback: string): NewsArticle[] {
  const items: NewsArticle[] = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const block = m[1];
    const title = extractText(block, "title");
    const link = extractText(block, "link") || extractText(block, "guid");
    const pubDate = extractText(block, "pubDate");
    const image = extractImage(block) || fallback;
    if (!title || !link) continue;
    let created_at = new Date().toISOString();
    try {
      if (pubDate) created_at = new Date(pubDate).toISOString();
    } catch {
      /* keep default */
    }
    items.push({
      id: stableId(link),
      title,
      source,
      image,
      views: 0,
      created_at,
      url: link,
    });
  }
  return items.slice(0, 15);
}

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return NextResponse.json({ articles: cache.articles, cached: true });
  }

  const settled = await Promise.allSettled(
    PR_FEEDS.map(async ({ name, url, fallback }) => {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(5000),
        headers: { "User-Agent": "ElHub/1.0 RSS Reader" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xml = await res.text();
      return parseRSS(xml, name, fallback);
    })
  );

  const articles = settled
    .filter(
      (r): r is PromiseFulfilledResult<NewsArticle[]> => r.status === "fulfilled"
    )
    .flatMap((r) => r.value);

  // Deduplicate by id
  const seen = new Set<string>();
  const unique = articles.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  cache = { articles: unique, ts: Date.now() };

  return NextResponse.json({
    articles: unique,
    sources: settled.filter((r) => r.status === "fulfilled").length,
  });
}
