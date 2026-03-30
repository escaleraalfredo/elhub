"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import NewsDetailModal from "./NewsDetailModal";

const trendingNews = [
  { id: "1", title: "LUMA anuncia nuevo aumento de tarifas para 2026", source: "El Nuevo Día", time: "hace 12 min", image: "https://picsum.photos/id/1015/1200/800", views: 18400 },
  { id: "2", title: "La Placita registra récord de visitantes este fin de semana", source: "Primera Hora", time: "hace 47 min", image: "https://picsum.photos/id/201/1200/800", views: 12400 },
  { id: "3", title: "Puerto Rico avanza a semifinales en la Serie del Caribe", source: "Metro Puerto Rico", time: "hace 2h", image: "https://picsum.photos/id/870/1200/800", views: 23100 },
];

export default function NewsFeed() {
  const [selectedNews, setSelectedNews] = useState<any>(null);

  const sortedNews = [...trendingNews].sort((a, b) => b.views - a.views);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
        Noticias de Puerto Rico <span className="text-emerald-400 text-xl">🔥 Trending PR</span>
      </h1>

      <div className="space-y-8">
        {sortedNews.map((article) => (
          <motion.div
            key={article.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedNews(article)}
            className="bg-white dark:bg-zinc-800 rounded-3xl overflow-hidden shadow-xl cursor-pointer"
          >
            <img src={article.image} className="w-full h-56 object-cover" alt="" />
            <div className="p-6">
              <div className="flex justify-between text-xs text-emerald-500 mb-3">
                <span>{article.source}</span>
                <span>{article.time}</span>
              </div>
              <h3 className="text-2xl font-semibold leading-tight mb-4">{article.title}</h3>
              <div className="text-xs text-zinc-400">+{article.views.toLocaleString()} viendo ahora</div>
            </div>
          </motion.div>
        ))}
      </div>

      <NewsDetailModal article={selectedNews} isOpen={!!selectedNews} onClose={() => setSelectedNews(null)} />
    </div>
  );
}