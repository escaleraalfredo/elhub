// lib/news/rss.ts
// Tiny dependency-free RSS/Atom parser: good enough for news feeds.

export interface FeedEntry {
  title: string;
  link: string;
  publishedAt?: string;
  excerpt?: string;
  image?: string;
  sourceName?: string;
}

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú", ntilde: "ñ",
  Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú", Ntilde: "Ñ",
  uuml: "ü", iexcl: "¡", iquest: "¿", laquo: "«", raquo: "»", hellip: "…",
  ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’", mdash: "—", ndash: "–",
};

export function decodeEntities(s: string): string {
  return s.replace(/&(#x?[0-9a-fA-F]+|\w+);/g, (m, code: string) => {
    if (code[0] === "#") {
      const n = code[1] === "x" || code[1] === "X" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENTITIES[code] ?? m;
  });
}

function unwrap(s: string): string {
  return s.replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1").trim();
}

function tag(block: string, name: string): string | undefined {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i");
  const m = block.match(re);
  return m ? unwrap(m[1]) : undefined;
}

function attr(block: string, name: string, attribute: string): string | undefined {
  const re = new RegExp(`<${name}\\s[^>]*${attribute}=["']([^"']+)["'][^>]*>`, "i");
  return block.match(re)?.[1];
}

export function stripHtml(html: string): string {
  return decodeEntities(
    decodeEntities(html)
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function findImage(block: string): string | undefined {
  const media =
    attr(block, "media:content", "url") ??
    attr(block, "media:thumbnail", "url") ??
    (/<enclosure[^>]*type=["']image/i.test(block) ? attr(block, "enclosure", "url") : undefined);
  if (media) return decodeEntities(media);
  const html = decodeEntities(tag(block, "content:encoded") ?? tag(block, "description") ?? "");
  const img = html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
  return img ? decodeEntities(img) : undefined;
}

export function parseFeed(xml: string): FeedEntry[] {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) ?? [];
  const entries: FeedEntry[] = [];
  for (const block of blocks) {
    const title = stripHtml(tag(block, "title") ?? "");
    const link = decodeEntities(
      tag(block, "link") || attr(block, "link", "href") || tag(block, "guid") || ""
    ).trim();
    if (!title || !/^https?:\/\//.test(link)) continue;
    const date = tag(block, "pubDate") ?? tag(block, "dc:date") ?? tag(block, "published") ?? tag(block, "updated");
    const desc = tag(block, "description") ?? tag(block, "summary") ?? "";
    const excerpt = stripHtml(desc).slice(0, 220) || undefined;
    entries.push({
      title,
      link,
      publishedAt: date && !Number.isNaN(Date.parse(date)) ? new Date(date).toISOString() : undefined,
      excerpt,
      image: findImage(block),
      sourceName: tag(block, "source") ? stripHtml(tag(block, "source")!) : undefined,
    });
  }
  return entries;
}

/** djb2 hash → short stable id. */
export function hashId(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
