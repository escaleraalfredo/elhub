// lib/news/types.ts
export interface NewsItem {
  id: string;
  title: string;
  link: string;
  sourceId: string;
  sourceName: string;
  publishedAt: string;
  excerpt?: string;
  image?: string;
  section: import("./classify").Section;
  municipios: string[];
}

export interface NewsResponse {
  items: NewsItem[];
  /** True when every source failed and the feed shows sample headlines. */
  sample: boolean;
  sources: { id: string; ok: boolean; via: "rss" | "google" | "none"; count: number }[];
  updatedAt: string;
}
