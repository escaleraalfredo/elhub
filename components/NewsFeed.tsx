"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import NewsDetailModal from "./NewsDetailModal";
import { getNewsArticles } from "@/lib/db";
import type { NewsArticle } from "@/lib/types";

type Period = "hoy" | "7dias" | "30dias";

const PERIODS: { key: Period; label: string; days: number }[] = [
  { key: "hoy", label: "🔥 Hoy", days: 1 },
  { key: "7dias", label: "📅 7 días", days: 7 },
  { key: "30dias", label: "📆 30 días", days: 30 },
];

const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

function createSeedArticles(): NewsArticle[] {
  const now = Date.now();
  const h = (hours: number) =>
    new Date(now - hours * 3_600_000).toISOString();
  const d = (days: number) =>
    new Date(now - days * 86_400_000).toISOString();
  return [
    // Today
    { id: "s1", title: "LUMA anuncia nuevo aumento de tarifas para 2026", source: "El Nuevo Día", image: "https://picsum.photos/id/1015/1200/800", views: 18400, created_at: h(0.2), url: "#" },
    { id: "s2", title: "La Placita registra récord de visitantes este fin de semana", source: "Primera Hora", image: "https://picsum.photos/id/201/1200/800", views: 12400, created_at: h(1), url: "#" },
    { id: "s3", title: "Puerto Rico avanza a semifinales en la Serie del Caribe", source: "Metro PR", image: "https://picsum.photos/id/870/1200/800", views: 23100, created_at: h(2), url: "#" },
    { id: "s4", title: "Gobernador firma nueva ley de energía solar para hogares", source: "NotiCel", image: "https://picsum.photos/id/1059/1200/800", views: 9800, created_at: h(3), url: "#" },
    { id: "s5", title: "Récord de turistas en Viejo San Juan en temporada de cruceros", source: "El Vocero", image: "https://picsum.photos/id/1040/1200/800", views: 7600, created_at: h(5), url: "#" },
    { id: "s6", title: "Nueva ruta aérea conectará PR con ciudades del Midwest", source: "Primera Hora", image: "https://picsum.photos/id/1018/1200/800", views: 15200, created_at: h(6), url: "#" },
    { id: "s7", title: "Aumentan los casos de dengue en la zona metro según Salud", source: "El Nuevo Día", image: "https://picsum.photos/id/180/1200/800", views: 21000, created_at: h(8), url: "#" },
    { id: "s8", title: "Festival de Música de Ponce atraerá más de 50,000 personas", source: "Metro PR", image: "https://picsum.photos/id/450/1200/800", views: 5400, created_at: h(10), url: "#" },
    { id: "s9", title: "UPR anuncia beca completa para estudiantes STEM", source: "El Vocero", image: "https://picsum.photos/id/1060/1200/800", views: 8900, created_at: h(14), url: "#" },
    { id: "s10", title: "Inauguran nuevo Centro Comercial en Bayamón con 120 tiendas", source: "NotiCel", image: "https://picsum.photos/id/312/1200/800", views: 11300, created_at: h(20), url: "#" },
    // 7 days
    { id: "s11", title: "Puerto Rico lidera en energía renovable en el Caribe", source: "El Nuevo Día", image: "https://picsum.photos/id/1082/1200/800", views: 31000, created_at: d(2), url: "#" },
    { id: "s12", title: "Equipos de béisbol boricua regresan triunfantes de Venezuela", source: "Metro PR", image: "https://picsum.photos/id/998/1200/800", views: 28500, created_at: d(3), url: "#" },
    { id: "s13", title: "Suben precios del agua en municipios del área este", source: "Primera Hora", image: "https://picsum.photos/id/1006/1200/800", views: 14200, created_at: d(4), url: "#" },
    { id: "s14", title: "Nuevos vuelos directos a Madrid desde el Aeropuerto LMM", source: "El Vocero", image: "https://picsum.photos/id/1074/1200/800", views: 19600, created_at: d(5), url: "#" },
    { id: "s15", title: "Descubren nuevo arrecife de coral en las costas de Vieques", source: "NotiCel", image: "https://picsum.photos/id/133/1200/800", views: 9200, created_at: d(6), url: "#" },
    // 30 days
    { id: "s16", title: "La Legislatura aprueba presupuesto histórico de $13 mil millones", source: "El Nuevo Día", image: "https://picsum.photos/id/190/1200/800", views: 45000, created_at: d(10), url: "#" },
    { id: "s17", title: "Puerto Rico gana Premio Internacional de Turismo Sostenible", source: "Primera Hora", image: "https://picsum.photos/id/258/1200/800", views: 22000, created_at: d(15), url: "#" },
    { id: "s18", title: "Histórico: PR reduce la pobreza al nivel más bajo en 30 años", source: "Metro PR", image: "https://picsum.photos/id/338/1200/800", views: 38000, created_at: d(20), url: "#" },
    { id: "s19", title: "Inauguran hospital de 500 camas en Ponce con tecnología de punta", source: "NotiCel", image: "https://picsum.photos/id/400/1200/800", views: 17000, created_at: d(25), url: "#" },
    { id: "s20", title: "Artistas boricuas arrasan en los Premios Grammy Latino 2026", source: "El Vocero", image: "https://picsum.photos/id/480/1200/800", views: 52000, created_at: d(28), url: "#" },
  ];
}

function filterByPeriod(articles: NewsArticle[], days: number): NewsArticle[] {
  const cutoff = Date.now() - days * 86_400_000;
  return articles.filter((a) => {
    if (!a.created_at) return days >= 30;
    return new Date(a.created_at).getTime() >= cutoff;
  });
}

function scoreArticle(
  a: NewsArticle,
  votes: Record<string, { up: number; down: number }>
): number {
  const v = votes[a.id] ?? { up: 0, down: 0 };
  return v.up * 3 - v.down * 2 + (a.views ?? 0) * 0.01;
}

function relativeTime(iso: string | undefined): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

export default function NewsFeed() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("hoy");
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [votes, setVotes] = useState<Record<string, { up: number; down: number }>>({});
  const [userVotes, setUserVotes] = useState<Record<string, "up" | "down" | null>>({});

  // Hydration-safe: load localStorage after mount
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem("news-vote-counts") || "{}");
      const u = JSON.parse(localStorage.getItem("news-user-votes") || "{}");
      setVotes(v);
      setUserVotes(u);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const seed = createSeedArticles();
      const map = new Map<string, NewsArticle>(seed.map((a) => [a.id, a]));
      try {
        const [rssResult, dbResult] = await Promise.allSettled([
          fetch("/api/news").then((r) => r.json()),
          getNewsArticles(),
        ]);
        if (rssResult.status === "fulfilled") {
          (rssResult.value.articles ?? []).forEach((a: NewsArticle) =>
            map.set(a.id, a)
          );
        }
        if (dbResult.status === "fulfilled") {
          dbResult.value.forEach((a: NewsArticle) => map.set(a.id, a));
        }
      } catch {
        /* fall back to seeds */
      }
      if (!cancelled) {
        setArticles(Array.from(map.values()));
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleVote = (articleId: string, type: "up" | "down") => {
    const currentUserVote = userVotes[articleId];
    const current = votes[articleId] ?? { up: 0, down: 0 };
    const updated = { ...current };
    let newUserVote: "up" | "down" | null;
    if (currentUserVote === type) {
      updated[type] = Math.max(0, updated[type] - 1);
      newUserVote = null;
    } else {
      if (currentUserVote) updated[currentUserVote] = Math.max(0, updated[currentUserVote] - 1);
      updated[type]++;
      newUserVote = type;
    }
    const newVotes = { ...votes, [articleId]: updated };
    const newUserVotes = { ...userVotes, [articleId]: newUserVote };
    setVotes(newVotes);
    setUserVotes(newUserVotes);
    localStorage.setItem("news-vote-counts", JSON.stringify(newVotes));
    localStorage.setItem("news-user-votes", JSON.stringify(newUserVotes));
  };

  const periodDays = PERIODS.find((p) => p.key === period)!.days;
  const filtered = filterByPeriod(articles, periodDays);
  const ranked = [...filtered]
    .sort((a, b) => scoreArticle(b, votes) - scoreArticle(a, votes))
    .slice(0, 10);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 flex items-center gap-3">
        Noticias de PR <span className="text-emerald-400">🇵🇷</span>
      </h1>

      {/* Period tabs */}
      <div className="flex gap-3 mb-8">
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all ${
              period === key
                ? "bg-emerald-400 text-black"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-3xl bg-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : ranked.length === 0 ? (
        <div className="text-center text-zinc-500 py-16 text-lg">
          No hay noticias en este período aún.
        </div>
      ) : (
        <div className="space-y-3">
          {ranked.map((article, idx) => {
            const v = votes[article.id] ?? { up: 0, down: 0 };
            const uv = userVotes[article.id];
            const net = v.up - v.down;
            return (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="bg-white dark:bg-zinc-800 rounded-3xl overflow-hidden shadow-lg flex hover:ring-2 hover:ring-emerald-400 transition-all"
              >
                {/* Rank badge */}
                <div
                  className="w-12 flex-shrink-0 flex items-center justify-center font-bold text-lg"
                  style={{ color: idx < 3 ? RANK_COLORS[idx] : "#6ee7b7" }}
                >
                  #{idx + 1}
                </div>

                {/* Thumbnail */}
                <button
                  className="w-28 h-24 flex-shrink-0 overflow-hidden"
                  onClick={() => setSelectedArticle(article)}
                >
                  <img
                    src={article.image}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </button>

                {/* Content */}
                <button
                  className="flex-1 p-4 min-w-0 text-left"
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <span className="text-emerald-500 font-medium">{article.source}</span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-500">{relativeTime(article.created_at)}</span>
                  </div>
                  <h3 className="font-semibold leading-snug text-sm line-clamp-2">
                    {article.title}
                  </h3>
                  <div className="text-xs text-zinc-400 mt-1">
                    +{(article.views ?? 0).toLocaleString()} viendo
                  </div>
                </button>

                {/* Vote controls */}
                <div className="flex flex-col items-center justify-center px-3 gap-0.5">
                  <button
                    onClick={() => handleVote(article.id, "up")}
                    className={`p-1.5 rounded-xl transition-all ${
                      uv === "up"
                        ? "text-emerald-400 bg-emerald-900/40"
                        : "text-zinc-400 hover:text-emerald-400"
                    }`}
                    aria-label="Upvote"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <span
                    className={`text-xs font-bold leading-none ${
                      net > 0
                        ? "text-emerald-400"
                        : net < 0
                        ? "text-red-400"
                        : "text-zinc-400"
                    }`}
                  >
                    {net > 0 ? `+${net}` : net}
                  </span>
                  <button
                    onClick={() => handleVote(article.id, "down")}
                    className={`p-1.5 rounded-xl transition-all ${
                      uv === "down"
                        ? "text-red-400 bg-red-900/40"
                        : "text-zinc-400 hover:text-red-400"
                    }`}
                    aria-label="Downvote"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <NewsDetailModal
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        votes={selectedArticle ? (votes[selectedArticle.id] ?? { up: 0, down: 0 }) : { up: 0, down: 0 }}
        userVote={selectedArticle ? (userVotes[selectedArticle.id] ?? null) : null}
        onVote={(type) => {
          if (selectedArticle) handleVote(selectedArticle.id, type);
        }}
      />
    </div>
  );
}
