"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Flame } from "lucide-react";
import { getTrendingArticles } from "@/lib/db";
import type { NewsArticle } from "@/lib/types";

const TRENDING_EMOJIS = ["🔥", "🌴", "⚾", "🎉", "🇵🇷"];

const SEED_TRENDING: NewsArticle[] = [
  { id: "1", title: "Nuevo aumento de tarifas de LUMA genera fuerte reacción", source: "El Nuevo Día", image: "https://picsum.photos/id/1015/1200/800", views: 18400 },
  { id: "2", title: "La Placita registra récord de visitantes este fin de semana", source: "Primera Hora", image: "https://picsum.photos/id/201/1200/800", views: 12400 },
  { id: "3", title: "Puerto Rico avanza a semifinales en la Serie del Caribe", source: "Metro PR", image: "https://picsum.photos/id/870/1200/800", views: 23100 },
];

export default function TrendingTopics() {
  const [trending, setTrending] = useState<NewsArticle[]>(SEED_TRENDING);

  useEffect(() => {
    getTrendingArticles(3).then((data) => {
      if (data.length > 0) setTrending(data);
    });
  }, []);

  const sorted = [...trending].sort((a, b) => b.views - a.views);

  return (
    <div>
      <div className="flex items-center gap-3 mb-10">
        <TrendingUp className="w-10 h-10 text-orange-500" />
        <h1 className="text-5xl font-bold tracking-tight">Lo que está pegando</h1>
      </div>

      <div className="space-y-6">
        {sorted.map((item, i) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-zinc-800 rounded-3xl p-8 flex gap-8 items-center border border-zinc-200 dark:border-zinc-700 shadow-xl"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-3xl font-bold text-orange-500">
              {i + 1}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{TRENDING_EMOJIS[i % TRENDING_EMOJIS.length]}</span>
                <h3 className="text-2xl font-semibold leading-tight flex-1">{item.title}</h3>
              </div>
              <p className="text-zinc-500 mt-3">
                {item.source} • {item.views.toLocaleString()} vistas
              </p>
            </div>

            <Flame className="w-8 h-8 text-orange-500" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
