// lib/news/fetchNews.ts
// Server-side: pull every source, merge, dedupe and sort newest first.
import { NEWS_SOURCES, googleNewsFeed, type NewsSource } from "./sources";
import { hashId, parseFeed, type FeedEntry } from "./rss";
import { sampleNews } from "./sample";
import type { NewsItem, NewsResponse } from "./types";

const REVALIDATE_SECONDS = 300;
const MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;

async function getXml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ElHubPR/1.0; +https://elhub.app)",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(7000),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fromSource(source: NewsSource) {
  for (const url of source.feeds) {
    const xml = await getXml(url);
    const entries = xml ? parseFeed(xml) : [];
    if (entries.length) return { via: "rss" as const, entries };
  }
  const xml = await getXml(googleNewsFeed(source.domain));
  const entries = (xml ? parseFeed(xml) : []).map((e) => ({
    ...e,
    // Google News appends " - Outlet" to titles.
    title: e.title.replace(/\s+-\s+[^-]+$/, ""),
  }));
  return { via: entries.length ? ("google" as const) : ("none" as const), entries };
}

function toItem(source: NewsSource, e: FeedEntry, now: number): NewsItem {
  return {
    id: hashId(e.link),
    title: e.title,
    link: e.link,
    sourceId: source.id,
    sourceName: source.name,
    publishedAt: e.publishedAt ?? new Date(now).toISOString(),
    excerpt: e.excerpt && e.excerpt !== e.title ? e.excerpt : undefined,
    image: e.image,
  };
}

export async function fetchNews(): Promise<NewsResponse> {
  const now = Date.now();
  const results = await Promise.all(
    NEWS_SOURCES.map(async (source) => ({ source, ...(await fromSource(source)) }))
  );

  const seen = new Set<string>();
  const items: NewsItem[] = [];
  for (const { source, entries } of results) {
    for (const e of entries.slice(0, 25)) {
      const item = toItem(source, e, now);
      const key = item.title.toLowerCase().replace(/[^a-z0-9áéíóúñü]+/g, "");
      if (seen.has(key) || seen.has(item.id)) continue;
      if (now - Date.parse(item.publishedAt) > MAX_AGE_MS) continue;
      seen.add(key);
      seen.add(item.id);
      items.push(item);
    }
  }
  items.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

  const sources = results.map((r) => ({
    id: r.source.id,
    ok: r.entries.length > 0,
    via: r.via,
    count: r.entries.length,
  }));

  if (items.length === 0) {
    return { items: sampleNews(now), sample: true, sources, updatedAt: new Date(now).toISOString() };
  }
  return { items: items.slice(0, 150), sample: false, sources, updatedAt: new Date(now).toISOString() };
}
