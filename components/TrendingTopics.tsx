"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Flame, ThumbsUp, ThumbsDown, Star, X } from "lucide-react";
import { getTrendingArticles, castTrendingVote, getTrendingVotes, getTrendingReactions, incrementTrendingReaction } from "@/lib/db";
import type { NewsArticle } from "@/lib/types";
import toast from "react-hot-toast";

const TRENDING_EMOJIS = ["🔥", "🌴", "⚾", "🎉", "🇵🇷"];
const REACTION_EMOJIS = ["🔥", "😮", "🇵🇷", "🌴", "😡", "❤️"];

const SEED_TRENDING: NewsArticle[] = [
  { id: "1", title: "Nuevo aumento de tarifas de LUMA genera fuerte reacción", source: "El Nuevo Día", image: "https://picsum.photos/id/1015/1200/800", views: 18400 },
  { id: "2", title: "La Placita registra récord de visitantes este fin de semana", source: "Primera Hora", image: "https://picsum.photos/id/201/1200/800", views: 12400 },
  { id: "3", title: "Puerto Rico avanza a semifinales en la Serie del Caribe", source: "Metro PR", image: "https://picsum.photos/id/870/1200/800", views: 23100 },
];

interface VoteState {
  upvotes: number;
  downvotes: number;
  voted?: "up" | "down";
}

interface RatingModalProps {
  article: NewsArticle;
  onClose: () => void;
}

function RatingModal({ article, onClose }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  const submit = () => {
    toast.success(`⭐ Calificaste con ${rating} estrella${rating !== 1 ? "s" : ""}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-zinc-800 rounded-3xl w-full max-w-sm p-8 space-y-6"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold">Califica esta noticia</h3>
          <button onClick={onClose}><X className="w-6 h-6" /></button>
        </div>
        <p className="text-zinc-500 text-sm leading-snug">{article.title}</p>
        <div className="flex gap-2 justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
              className="text-4xl transition-transform hover:scale-125"
            >
              <Star
                className={`w-10 h-10 transition-colors ${star <= (hover || rating) ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"}`}
              />
            </button>
          ))}
        </div>
        <button
          onClick={submit}
          disabled={rating === 0}
          className="w-full bg-emerald-400 text-black py-4 rounded-3xl font-semibold disabled:opacity-40"
        >
          Enviar calificación
        </button>
      </motion.div>
    </div>
  );
}

export default function TrendingTopics() {
  const [trending, setTrending] = useState<NewsArticle[]>(SEED_TRENDING);
  const [votes, setVotes] = useState<Record<string, VoteState>>({});
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({});
  const [ratingArticle, setRatingArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    getTrendingArticles(3).then((data) => {
      if (data.length > 0) setTrending(data);
    });
  }, []);

  // Load votes + reactions for visible articles
  useEffect(() => {
    trending.forEach((article) => {
      getTrendingVotes(article.id).then((v) =>
        setVotes((prev) => ({ ...prev, [article.id]: { ...v, voted: prev[article.id]?.voted } }))
      );
      getTrendingReactions(article.id).then((r) => {
        if (Object.keys(r).length > 0)
          setReactions((prev) => ({ ...prev, [article.id]: r }));
      });
    });
  }, [trending]);

  const handleVote = async (article: NewsArticle, direction: "up" | "down") => {
    const current = votes[article.id] ?? { upvotes: 0, downvotes: 0 };
    if (current.voted) {
      toast("Ya votaste en esta noticia", { icon: "🗳️" });
      return;
    }
    setVotes((prev) => ({
      ...prev,
      [article.id]: {
        upvotes: current.upvotes + (direction === "up" ? 1 : 0),
        downvotes: current.downvotes + (direction === "down" ? 1 : 0),
        voted: direction,
      },
    }));
    await castTrendingVote(article.id, direction);
    toast.success(direction === "up" ? "👍 Upvote registrado" : "👎 Downvote registrado");
  };

  const handleReaction = async (article: NewsArticle, emoji: string) => {
    setReactions((prev) => {
      const curr = prev[article.id] ?? {};
      return { ...prev, [article.id]: { ...curr, [emoji]: (curr[emoji] ?? 0) + 1 } };
    });
    await incrementTrendingReaction(article.id, emoji);
  };

  const sorted = [...trending].sort((a, b) => b.views - a.views);

  return (
    <div>
      <div className="flex items-center gap-3 mb-10">
        <TrendingUp className="w-10 h-10 text-orange-500" />
        <h1 className="text-5xl font-bold tracking-tight">Lo que está pegando</h1>
      </div>

      <div className="space-y-8">
        {sorted.map((item, i) => {
          const v = votes[item.id] ?? { upvotes: item.upvotes ?? 0, downvotes: item.downvotes ?? 0 };
          const r = reactions[item.id] ?? {};

          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.01 }}
              className="bg-white dark:bg-zinc-800 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-700 shadow-xl space-y-5"
            >
              {/* Title row */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-3xl font-bold text-orange-500">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{TRENDING_EMOJIS[i % TRENDING_EMOJIS.length]}</span>
                    <h3 className="text-2xl font-semibold leading-tight flex-1">{item.title}</h3>
                  </div>
                  <p className="text-zinc-500 mt-2">
                    {item.source} • {item.views.toLocaleString()} vistas
                  </p>
                </div>
                <Flame className="w-8 h-8 text-orange-500 flex-shrink-0" />
              </div>

              {/* Vote row */}
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  onClick={() => handleVote(item, "up")}
                  className={`flex items-center gap-2 px-5 py-2 rounded-3xl font-semibold transition-all ${v.voted === "up" ? "bg-emerald-400 text-black" : "bg-zinc-100 dark:bg-zinc-700 hover:bg-emerald-100"}`}
                >
                  <ThumbsUp className="w-5 h-5" /> {v.upvotes}
                </button>
                <button
                  onClick={() => handleVote(item, "down")}
                  className={`flex items-center gap-2 px-5 py-2 rounded-3xl font-semibold transition-all ${v.voted === "down" ? "bg-red-400 text-white" : "bg-zinc-100 dark:bg-zinc-700 hover:bg-red-100"}`}
                >
                  <ThumbsDown className="w-5 h-5" /> {v.downvotes}
                </button>
                <button
                  onClick={() => setRatingArticle(item)}
                  className="flex items-center gap-2 px-5 py-2 rounded-3xl bg-zinc-100 dark:bg-zinc-700 hover:bg-yellow-100 font-semibold"
                >
                  <Star className="w-5 h-5 text-yellow-500" /> Calificar
                </button>
              </div>

              {/* Emoji reaction row */}
              <div className="flex flex-wrap gap-3">
                {REACTION_EMOJIS.map((emoji) => (
                  <motion.button
                    key={emoji}
                    whileTap={{ scale: 1.4 }}
                    onClick={() => handleReaction(item, emoji)}
                    className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 px-4 py-2 rounded-3xl text-xl transition-all"
                  >
                    {emoji}
                    {r[emoji] ? <span className="text-sm font-semibold">{r[emoji]}</span> : null}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {ratingArticle && (
          <RatingModal article={ratingArticle} onClose={() => setRatingArticle(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
