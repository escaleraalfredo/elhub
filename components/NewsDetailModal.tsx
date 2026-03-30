"use client";
import { useState, useEffect } from "react";
import { X, Send } from "lucide-react";
import { motion } from "framer-motion";

interface Article {
  id: string;
  title: string;
  source: string;
  time: string;
  image: string;
}

interface Props {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NewsDetailModal({ article, isOpen, onClose }: Props) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [reactions, setReactions] = useState<Record<string, number>>({ "🔥": 42, "😡": 18, "🇵🇷": 31, "🌴": 12 });

  useEffect(() => {
    if (article) {
      const savedReactions = localStorage.getItem(`reactions-${article.id}`);
      if (savedReactions) setReactions(JSON.parse(savedReactions));
    }
  }, [article]);

  const addReaction = (emoji: string) => {
    const newReactions = { ...reactions, [emoji]: (reactions[emoji] || 0) + 1 };
    setReactions(newReactions);
    if (article) localStorage.setItem(`reactions-${article.id}`, JSON.stringify(newReactions));
  };

  const addComment = () => {
    if (!newComment) return;
    setComments([...comments, { user: "Tú", text: newComment, emoji: "👍" }]);
    setNewComment("");
  };

  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-800 w-full max-w-2xl rounded-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b flex justify-between items-start">
          <div>
            <div className="text-emerald-500 text-sm">{article.source} • {article.time}</div>
            <h2 className="text-3xl font-bold leading-tight mt-2">{article.title}</h2>
          </div>
          <button onClick={onClose} className="text-4xl leading-none">✕</button>
        </div>

        <img src={article.image} className="w-full h-80 object-cover" />

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

          <a href="#" target="_blank" className="block w-full py-5 text-center bg-black text-white rounded-3xl font-semibold">
            Leer artículo completo en {article.source} →
          </a>

          <h3 className="font-semibold text-xl">Comentarios</h3>
          <div className="space-y-6">
            {comments.map((c: any, i: number) => (
              <div key={i} className="flex gap-4">
                <div className="text-4xl">{c.emoji}</div>
                <div>
                  <span className="font-semibold">{c.user}</span>
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
            placeholder="Comenta o usa emojis..."
            className="flex-1 bg-zinc-100 dark:bg-zinc-700 rounded-3xl px-6 py-5 outline-none"
          />
          <button onClick={addComment} className="bg-emerald-400 text-black px-8 rounded-3xl">Enviar</button>
          <button className="text-4xl">🎁</button>
          <button className="text-4xl">😀</button>
        </div>
      </div>
    </div>
  );
}