"use client";
import { useEffect, useState, useCallback } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import NewsDetailModal from "./NewsDetailModal";
import type { NewsArticle } from "@/lib/types";

// ─── Seed fallback ─────────────────────────────────────────────────────────────
const SEED_ARTICLES: NewsArticle[] = [
  { id: "1", title: "LUMA anuncia nuevo aumento de tarifas para 2026", source: "El Nuevo Día", image: "https://picsum.photos/id/1015/800/450", views: 18400, created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString() },
  { id: "2", title: "La Placita registra récord de visitantes este fin de semana", source: "Primera Hora", image: "https://picsum.photos/id/201/800/450", views: 12400, created_at: new Date(Date.now() - 47 * 60 * 1000).toISOString() },
  { id: "3", title: "Puerto Rico avanza a semifinales en la Serie del Caribe", source: "Metro PR", image: "https://picsum.photos/id/870/800/450", views: 23100, created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: "4", title: "Gobernador firma proyecto de ley para reducir el costo de la energía", source: "Noticel", image: "https://picsum.photos/id/1039/800/450", views: 9800, created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  { id: "5", title: "Lluvia de oportunidades de empleo llega a San Juan esta semana", source: "El Vocero", image: "https://picsum.photos/id/180/800/450", views: 7200, created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
];

function relativeTime(iso: string | undefined): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
}

const SOURCE_COLORS: Record<string, string> = {
  "El Nuevo Día": "bg-blue-600",
  "Primera Hora": "bg-red-600",
  "El Vocero": "bg-purple-700",
  "El Calce": "bg-orange-600",
  "Noticel": "bg-teal-600",
  "Metro PR": "bg-zinc-700",
};

function sourceBadge(source: string) {
  const color = SOURCE_COLORS[source] ?? "bg-emerald-700";
  return (
    <span className={`${color} text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded`}>
      {source}
    </span>
  );
}

// ─── Featured (first) card ────────────────────────────────────────────────────
function FeaturedCard({ article, onClick }: { article: NewsArticle; onClick: () => void }) {
  return (
    <div
      className="cursor-pointer group border-b border-zinc-200 dark:border-zinc-700 pb-6 mb-2"
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-xl mb-3 aspect-video">
        <img
          src={article.image}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {article.url && article.url !== "#" && (
          <a
            href={article.url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
      <div className="flex items-center gap-2 mb-2">
        {sourceBadge(article.source)}
        <span className="text-zinc-400 text-xs">{relativeTime(article.created_at)}</span>
      </div>
      <h2 className="text-xl font-bold leading-snug text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
        {article.title}
      </h2>
    </div>
  );
}

// ─── Compact list card ────────────────────────────────────────────────────────
function CompactCard({ article, index, onClick }: { article: NewsArticle; index: number; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="cursor-pointer group border-b border-zinc-100 dark:border-zinc-800 py-4 last:border-0"
      onClick={onClick}
    >
      <div className="flex gap-3 items-start">
        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {sourceBadge(article.source)}
            <span className="text-zinc-400 text-xs">{relativeTime(article.created_at)}</span>
          </div>
          <h3 className="text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-3">
            {article.title}
          </h3>
        </div>
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden">
          <img
            src={article.image}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main feed ────────────────────────────────────────────────────────────────
export default function NewsFeed() {
  const [articles, setArticles] = useState<NewsArticle[]>(SEED_ARTICLES);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    fetch("/api/news")
      .then((r) => r.json())
      .then((data: NewsArticle[]) => {
        if (Array.isArray(data) && data.length > 0) setArticles(data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const [featured, ...rest] = articles;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-zinc-900 dark:border-zinc-100">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Noticias PR
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            El Nuevo Día · Primera Hora · El Vocero · El Calce · Noticel · Metro PR
          </p>
        </div>
        <button
          onClick={load}
          className={`p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${loading ? "animate-spin" : ""}`}
          title="Actualizar"
        >
          <RefreshCw className="w-4 h-4 text-zinc-500" />
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 mb-4">No se pudo conectar a los feeds. Mostrando artículos de ejemplo.</p>
      )}

      {/* Featured */}
      {featured && (
        <FeaturedCard article={featured} onClick={() => setSelectedArticle(featured)} />
      )}

      {/* Compact list */}
      <div>
        {rest.map((article, i) => (
          <CompactCard
            key={article.id}
            article={article}
            index={i}
            onClick={() => setSelectedArticle(article)}
          />
        ))}
      </div>

      {loading && (
        <div className="space-y-4 mt-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex gap-3 py-4 border-b border-zinc-100 dark:border-zinc-800 animate-pulse">
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" />
              </div>
              <div className="w-20 h-16 bg-zinc-200 dark:bg-zinc-700 rounded-md" />
            </div>
          ))}
        </div>
      )}

      <NewsDetailModal
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
}

