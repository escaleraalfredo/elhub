"use client";
import { useState, useEffect, useRef } from "react";
import { Send, ThumbsUp, ThumbsDown, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  getNewsReactions,
  incrementNewsReaction,
  decrementNewsReaction,
  getNewsComments,
  addNewsComment,
} from "@/lib/db";
import type { NewsArticle, NewsComment } from "@/lib/types";

interface Props {
  article: NewsArticle | null;
  isOpen: boolean;
  onClose: () => void;
  votes: { up: number; down: number };
  userVote: "up" | "down" | null;
  onVote: (type: "up" | "down") => void;
}

const EMOJI_OPTIONS = [
  "🔥", "❤️", "😂", "😮", "😢", "😡",
  "👏", "🙌", "💯", "🤔", "😍", "👀",
  "⚡", "🎉", "🤦", "💪", "🌟", "🇵🇷",
  "🌴", "🍹",
];

const DEFAULT_REACTIONS: Record<string, number> = {
  "🔥": 42,
  "😡": 18,
  "🇵🇷": 31,
  "🌴": 12,
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

function loadUserReactions(articleId: string): Set<string> {
  try {
    const data = JSON.parse(
      localStorage.getItem(`reactions-user-${articleId}`) || "[]"
    );
    return new Set<string>(data);
  } catch {
    return new Set();
  }
}

function saveUserReactions(articleId: string, set: Set<string>) {
  localStorage.setItem(
    `reactions-user-${articleId}`,
    JSON.stringify([...set])
  );
}

export default function NewsDetailModal({
  article,
  isOpen,
  onClose,
  votes,
  userVote,
  onVote,
}: Props) {
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [reactions, setReactions] =
    useState<Record<string, number>>(DEFAULT_REACTIONS);
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!article || !isOpen) return;
    setUserReactions(loadUserReactions(article.id));

    getNewsReactions(article.id).then((dbReactions) => {
      if (Object.keys(dbReactions).length > 0) {
        setReactions(dbReactions);
      } else {
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

    getNewsComments(article.id).then(setComments);
  }, [article, isOpen]);

  // Close picker on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node)
      ) {
        setShowPicker(false);
      }
    }
    if (showPicker) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPicker]);

  const toggleReaction = async (emoji: string) => {
    if (!article) return;
    const hasReacted = userReactions.has(emoji);
    const updated = { ...reactions };
    const newUserReactions = new Set(userReactions);

    if (hasReacted) {
      updated[emoji] = Math.max(0, (updated[emoji] ?? 1) - 1);
      if (updated[emoji] === 0) delete updated[emoji];
      newUserReactions.delete(emoji);
      await decrementNewsReaction(article.id, emoji);
    } else {
      updated[emoji] = (updated[emoji] ?? 0) + 1;
      newUserReactions.add(emoji);
      await incrementNewsReaction(article.id, emoji);
    }

    setReactions(updated);
    setUserReactions(newUserReactions);
    saveUserReactions(article.id, newUserReactions);
    localStorage.setItem(`reactions-${article.id}`, JSON.stringify(updated));
    setShowPicker(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !article) return;
    setLoading(true);
    const saved = await addNewsComment(article.id, newComment.trim());
    if (saved) {
      setComments((prev) => [...prev, saved]);
    } else {
      setComments((prev) => [
        ...prev,
        {
          news_id: article.id,
          user_name: "Tú",
          text: newComment.trim(),
          emoji: "👍",
        },
      ]);
      toast("Comentario guardado localmente (sin conexión a BD)", {
        icon: "💾",
      });
    }
    setNewComment("");
    setLoading(false);
  };

  if (!isOpen || !article) return null;

  const net = votes.up - votes.down;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-zinc-800 w-full max-w-2xl rounded-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-start flex-shrink-0">
          <div className="flex-1 mr-4">
            <div className="text-emerald-500 text-sm font-medium">
              {article.source}
              {article.created_at
                ? ` • ${relativeTime(article.created_at)}`
                : ""}
            </div>
            <h2 className="text-2xl font-bold leading-tight mt-1">
              {article.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <img
          src={article.image}
          className="w-full h-56 object-cover flex-shrink-0"
          alt={article.title}
        />

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Vote bar + read link */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-700 rounded-2xl px-1 py-1">
              <button
                onClick={() => onVote("up")}
                className={`p-2 rounded-xl transition-all ${
                  userVote === "up"
                    ? "text-emerald-400"
                    : "text-zinc-400 hover:text-emerald-400"
                }`}
                aria-label="Upvote"
              >
                <ThumbsUp className="w-5 h-5" />
              </button>
              <span
                className={`font-bold text-sm min-w-[28px] text-center ${
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
                onClick={() => onVote("down")}
                className={`p-2 rounded-xl transition-all ${
                  userVote === "down"
                    ? "text-red-400"
                    : "text-zinc-400 hover:text-red-400"
                }`}
                aria-label="Downvote"
              >
                <ThumbsDown className="w-5 h-5" />
              </button>
            </div>

            {article.url && article.url !== "#" && (
              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 text-center bg-zinc-900 dark:bg-black text-white rounded-2xl font-semibold text-sm hover:bg-zinc-700 transition-all"
              >
                Leer en {article.source} →
              </a>
            )}
          </div>

          {/* Emoji reactions */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-500 mb-3">
              Reacciones
            </h4>
            <div className="flex flex-wrap gap-2 items-center">
              {Object.entries(reactions)
                .filter(([, count]) => count > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([emoji, count]) => (
                  <motion.button
                    key={emoji}
                    whileTap={{ scale: 1.3 }}
                    onClick={() => toggleReaction(emoji)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-sm font-semibold border-2 transition-all select-none ${
                      userReactions.has(emoji)
                        ? "border-emerald-400 bg-emerald-900/30 text-emerald-300"
                        : "border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-700 hover:border-emerald-400"
                    }`}
                  >
                    <span className="text-lg leading-none">{emoji}</span>
                    <span>{count}</span>
                  </motion.button>
                ))}

              {/* + Add reaction button */}
              <div className="relative" ref={pickerRef}>
                <button
                  onClick={() => setShowPicker((s) => !s)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-2xl border-2 border-dashed border-zinc-400 text-zinc-400 hover:border-emerald-400 hover:text-emerald-400 transition-all text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Reaccionar</span>
                </button>

                <AnimatePresence>
                  {showPicker && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 4 }}
                      className="absolute bottom-full mb-2 left-0 bg-zinc-900 border border-zinc-700 rounded-2xl p-3 z-20 shadow-2xl"
                    >
                      <div className="grid grid-cols-5 gap-1">
                        {EMOJI_OPTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => toggleReaction(emoji)}
                            className={`text-2xl p-1.5 rounded-xl hover:bg-zinc-700 transition-all ${
                              userReactions.has(emoji)
                                ? "bg-emerald-900/40 ring-1 ring-emerald-400"
                                : ""
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div>
            <h3 className="font-semibold text-xl mb-4">
              Comentarios{" "}
              <span className="text-zinc-400 text-base font-normal">
                ({comments.length})
              </span>
            </h3>
            <div className="space-y-4">
              {comments.length === 0 && (
                <p className="text-zinc-500 text-sm">
                  Sé el primero en comentar.
                </p>
              )}
              {comments.map((c, i) => (
                <div key={c.id ?? i} className="flex gap-3">
                  <div className="text-3xl leading-none flex-shrink-0">
                    {c.emoji}
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-700 rounded-2xl px-4 py-3 flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-sm">
                        {c.user_name}
                      </span>
                      {c.created_at && (
                        <span className="text-zinc-500 text-xs">
                          {relativeTime(c.created_at)}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm break-words">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comment input */}
        <div className="border-t border-zinc-200 dark:border-zinc-700 p-4 flex gap-3 bg-white dark:bg-zinc-800 flex-shrink-0">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            placeholder="Comenta aquí..."
            className="flex-1 bg-zinc-100 dark:bg-zinc-700 rounded-2xl px-5 py-3 outline-none text-sm"
          />
          <button
            onClick={handleAddComment}
            disabled={loading || !newComment.trim()}
            className="bg-emerald-400 text-black px-5 rounded-2xl disabled:opacity-50 hover:bg-emerald-300 transition-all"
            aria-label="Enviar"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
