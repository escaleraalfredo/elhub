"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import NewsDetailModal from "./NewsDetailModal";
import { getNewsArticles } from "@/lib/db";
import type { NewsArticle } from "@/lib/types";

const SEED_ARTICLES: NewsArticle[] = [
  { id: "1", title: "LUMA anuncia nuevo aumento de tarifas para 2026", source: "El Nuevo Día", image: "https://picsum.photos/id/1015/1200/800", views: 18400, created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString() },
  { id: "2", title: "La Placita registra récord de visitantes este fin de semana", source: "Primera Hora", image: "https://picsum.photos/id/201/1200/800", views: 12400, created_at: new Date(Date.now() - 47 * 60 * 1000).toISOString() },
  { id: "3", title: "Puerto Rico avanza a semifinales en la Serie del Caribe", source: "Metro Puerto Rico", image: "https://picsum.photos/id/870/1200/800", views: 23100, created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
];

function relativeTime(iso: string | undefined): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
}

export default function NewsFeed() {
  const [articles, setArticles] = useState<NewsArticle[]>(SEED_ARTICLES);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    getNewsArticles().then((data) => {
      if (data.length > 0) setArticles(data);
    });
  }, []);

  const sorted = [...articles].sort((a, b) => b.views - a.views);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
        Noticias de Puerto Rico <span className="text-emerald-400 text-xl">🔥 Trending PR</span>
      </h1>

      <div className="space-y-8">
        {sorted.map((article) => (
          <motion.div
            key={article.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedArticle(article)}
            className="bg-white dark:bg-zinc-800 rounded-3xl overflow-hidden shadow-xl cursor-pointer"
          >
            <Image src={article.image} className="w-full h-56 object-cover" alt={article.title} width={1200} height={224} style={{ width: "100%", height: "14rem" }} />
            <div className="p-6">
              <div className="flex justify-between text-xs text-emerald-500 mb-3">
                <span>{article.source}</span>
                <span>{relativeTime(article.created_at)}</span>
              </div>
              <h3 className="text-2xl font-semibold leading-tight mb-4">{article.title}</h3>
              <div className="text-xs text-zinc-400">+{article.views.toLocaleString()} viendo ahora</div>
            </div>
          </motion.div>
        ))}
      </div>

      <NewsDetailModal
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
}
