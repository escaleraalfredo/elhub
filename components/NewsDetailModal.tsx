"use client";
import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  getNewsReactions,
  incrementNewsReaction,
  getNewsComments,
  addNewsComment,
} from "@/lib/db";
import type { NewsArticle, NewsComment } from "@/lib/types";

interface Props {
  article: NewsArticle | null;
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_REACTIONS: Record<string, number> = {
  "🔥": 42,
  "😡": 18,
  "🇵🇷": 31,
  "🌴": 12,
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
}

export default function NewsDetailModal({ article, isOpen, onClose }: Props) {
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [reactions, setReactions] =
    useState<Record<string, number>>(DEFAULT_REACTIONS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!article) return;

    // Load reactions
    getNewsReactions(article.id).then((dbReactions) => {
      if (Object.keys(dbReactions).length > 0) {
        setReactions(dbReactions);
      } else {
        // Fall back to localStorage
        const saved = localStorage.getItem(`reactions-${article.id}`);
        if (saved) {
          try {
            setReactions(JSON.parse(saved));
          } catch {
            setReactions(DEFAULT_REACTIONS);
          }
        } else {
          setReactions(DEFAULT_REACTIONS);
        }
      }
    });

    // Load comments
    getNewsComments(article.id).then((dbComments) => {
      setComments(dbComments);
    });
  }, [article]);

  const addReaction = async (emoji: string) => {
    const updated = { ...reactions, [emoji]: (reactions[emoji] || 0) + 1 };
    setReactions(updated);
    if (!article) return;
    // Persist to Supabase; also keep localStorage as fallback
    await incrementNewsReaction(article.id, emoji);
    localStorage.setItem(`reactions-${article.id}`, JSON.stringify(updated));
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !article) return;
    setLoading(true);
    const saved = await addNewsComment(article.id, newComment.trim());
    if (saved) {
      setComments((prev) => [...prev, saved]);
    } else {
      // Offline fallback
      setComments((prev) => [
        ...prev,
        { news_id: article.id, user_name: "Tú", text: newComment.trim(), emoji: "👍" },
      ]);
      toast("Comentario guardado localmente (sin conexión a BD)", { icon: "💾" });
    }
    setNewComment("");
    setLoading(false);
  };

  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-800 w-full max-w-2xl rounded-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b flex justify-between items-start">
          <div>
            <div className="text-emerald-500 text-sm">{article.source}{article.created_at ? ` • ${relativeTime(article.created_at)}` : ""}</div>
            <h2 className="text-3xl font-bold leading-tight mt-2">{article.title}</h2>
          </div>
          <button onClick={onClose} className="text-4xl leading-none">✕</button>
        </div>

        <Image src={article.image} className="w-full h-80 object-cover" alt={article.title} width={1200} height={320} style={{ width: "100%", height: "20rem" }} />

        <div className="flex-1 overflow-auto p-6 space-y-8">
          <div className="flex flex-wrap gap-4">
            {Object.entries(reactions).map(([emoji, count]) => (
              <motion.button
                key={emoji}
                whileTap={{ scale: 1.4 }}
                onClick={() => addReaction(emoji)}
                className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-700 px-6 py-3 rounded-3xl text-3xl"
              >
                {emoji} <span className="text-base font-semibold">{count}</span>
              </motion.button>
            ))}
          </div>

          <a href="#" target="_blank" rel="noreferrer" className="block w-full py-5 text-center bg-black text-white rounded-3xl font-semibold">
            Leer artículo completo en {article.source} →
          </a>

          <h3 className="font-semibold text-xl">Comentarios ({comments.length})</h3>
          <div className="space-y-6">
            {comments.map((c, i) => (
              <div key={c.id ?? i} className="flex gap-4">
                <div className="text-4xl">{c.emoji}</div>
                <div>
                  <span className="font-semibold">{c.user_name}</span>
                  <p className="mt-1">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t p-6 flex gap-3 bg-white dark:bg-zinc-800">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            placeholder="Comenta o usa emojis..."
            className="flex-1 bg-zinc-100 dark:bg-zinc-700 rounded-3xl px-6 py-5 outline-none"
          />
          <button
            onClick={handleAddComment}
            disabled={loading || !newComment.trim()}
            className="bg-emerald-400 text-black px-8 rounded-3xl disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}