// lib/newsContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  image?: string;
  source: string;
  time: string;
  url?: string;
  likes: number;
  dislikes: number;
  userVote: "up" | "down" | null;
  reactions: Record<string, number>;
  comments: number;
}

interface NewsContextType {
  news: NewsItem[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  updateNews: (id: string, updater: (item: NewsItem) => NewsItem) => void;
  refreshNews: () => Promise<void>;
  loadMoreNews: () => Promise<void>;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export function NewsProvider({ children }: { children: ReactNode }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const API_KEY = process.env.NEXT_PUBLIC_NEWSDATA_API_KEY;

  // Strong Puerto Rico focus — no international sources like CNN
  const BASE_URL = `https://newsdata.io/api/1/news?apikey=${API_KEY}&country=pr&language=es&size=10`;

  const getFallbackNews = (): NewsItem[] => [
    {
      id: "fallback-1",
      title: "Lluvias intensas continúan afectando varias zonas de Puerto Rico",
      excerpt: "El Servicio Nacional de Meteorología mantiene vigilancia por condiciones inestables esta semana.",
      image: "https://picsum.photos/id/1015/600/400",
      source: "El Nuevo Día",
      time: "hace 1h",
      likes: 124,
      dislikes: 12,
      userVote: null,
      reactions: { "🌧️": 34 },
      comments: 42,
    },
    {
      id: "fallback-2",
      title: "Bad Bunny anuncia nueva gira que incluye varias fechas en Puerto Rico",
      excerpt: "El conejo malo regresa a la isla con shows especiales este verano.",
      image: "https://picsum.photos/id/870/600/400",
      source: "Primera Hora",
      time: "hace 3h",
      likes: 289,
      dislikes: 18,
      userVote: null,
      reactions: { "🔥": 67 },
      comments: 81,
    },
  ];

  const fetchNews = async (url: string, isLoadMore = false) => {
    try {
      const res = await fetch(url, { next: { revalidate: 1800 } });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        console.warn(`NewsData.io ${res.status}:`, errorText);
        if (!isLoadMore) setNews(getFallbackNews());
        setHasMore(false);
        return;
      }

      const data = await res.json();

      let formatted: NewsItem[] = (data.results || []).map((article: any, index: number) => ({
        id: article.article_id || `news-${Date.now()}-${index}`,
        title: article.title || "Noticia de Puerto Rico",
        excerpt: article.description || (article.content ? article.content.slice(0, 160) + "..." : "Lee más en la fuente..."),
        image: article.image_url || undefined,
        source: article.source_name || "Noticias PR",
        time: article.pubDate 
          ? new Intl.DateTimeFormat("es-PR", { month: "short", day: "numeric", hour: "numeric" }).format(new Date(article.pubDate))
          : "Reciente",
        url: article.link,
        likes: Math.floor(Math.random() * 140) + 25,
        dislikes: Math.floor(Math.random() * 25),
        userVote: null,
        reactions: {},
        comments: Math.floor(Math.random() * 45) + 6,
      }));

      // Extra filter: Remove obvious international sources like CNN, BBC, etc.
      const internationalBlocklist = ["cnn", "bbc", "reuters", "ap news", "nytimes", "washington post", "fox news"];
      
      formatted = formatted.filter(item => {
        const sourceLower = item.source.toLowerCase();
        return !internationalBlocklist.some(block => sourceLower.includes(block));
      });

      if (isLoadMore) {
        setNews((prev) => [...prev, ...formatted]);
      } else {
        setNews(formatted.length > 0 ? formatted : getFallbackNews());
      }

      setNextPage(data.nextPage || null);
      setHasMore(!!data.nextPage && formatted.length > 0);
      setError(null);
    } catch (err: any) {
      console.error("News fetch error:", err);
      setError("No se pudieron cargar noticias de Puerto Rico. Mostrando ejemplos.");
      if (!isLoadMore) setNews(getFallbackNews());
      setHasMore(false);
    }
  };

  const refreshNews = async () => {
    setLoading(true);
    setNextPage(null);
    setHasMore(true);
    await fetchNews(BASE_URL);
    setLoading(false);
  };

  const loadMoreNews = async () => {
    if (!nextPage || loadingMore) return;
    setLoadingMore(true);
    const nextUrl = `${BASE_URL}&page=${nextPage}`;
    await fetchNews(nextUrl, true);
    setLoadingMore(false);
  };

  useEffect(() => {
    refreshNews();
  }, []);

  const updateNews = (id: string, updater: (item: NewsItem) => NewsItem) => {
    setNews((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
  };

  return (
    <NewsContext.Provider value={{
      news,
      loading,
      loadingMore,
      error,
      hasMore,
      updateNews,
      refreshNews,
      loadMoreNews,
    }}>
      {children}
    </NewsContext.Provider>
  );
}

export const useNews = () => {
  const context = useContext(NewsContext);
  if (!context) throw new Error("useNews must be used within NewsProvider");
  return context;
};