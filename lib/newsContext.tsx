"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  source: string;
  time: string;
  image?: string;
  likes: number;
  dislikes: number;
  comments: number;
  saved: boolean;
  userVote: "up" | "down" | null;
  reactions: Record<string, number>;
}

interface NewsContextType {
  news: NewsItem[];
  updateNews: (id: string, updater: (item: NewsItem) => NewsItem) => void;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export function NewsProvider({ children }: { children: ReactNode }) {
  const [news, setNews] = useState<NewsItem[]>([
    {
      id: "1",
      title: "Gobernador anuncia nuevo plan de seguridad para San Juan y Bayamón",
      excerpt: "Se implementarán más cámaras y mayor presencia policial en zonas críticas a partir de la próxima semana.",
      source: "El Nuevo Día",
      time: "hace 47 min",
      image: "https://picsum.photos/id/1015/800/450",
      likes: 142,
      dislikes: 12,
      comments: 38,
      saved: false,
      userVote: null,
      reactions: { "🔥": 45, "🙌": 28, "😢": 8, "🇵🇷": 12 },
    },
    {
      id: "2",
      title: "Tormenta tropical podría afectar el Caribe este fin de semana",
      excerpt: "El NWS advierte que Puerto Rico podría ver fuertes lluvias y vientos a partir del sábado.",
      source: "Primera Hora",
      time: "hace 2h",
      image: "https://picsum.photos/id/1018/800/450",
      likes: 89,
      dislikes: 23,
      comments: 51,
      saved: false,
      userVote: null,
      reactions: { "🌧️": 67, "😨": 19 },
    },
  ]);

  // Use useCallback to prevent unnecessary re-renders and make sure updates are stable
  const updateNews = useCallback((id: string, updater: (item: NewsItem) => NewsItem) => {
    setNews(prev => prev.map(item => item.id === id ? updater(item) : item));
  }, []);

  return (
    <NewsContext.Provider value={{ news, updateNews }}>
      {children}
    </NewsContext.Provider>
  );
}

export const useNews = () => {
  const context = useContext(NewsContext);
  if (!context) throw new Error("useNews must be used within NewsProvider");
  return context;
};