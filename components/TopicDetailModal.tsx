"use client";
import { useState, useEffect } from "react";
import { Send, X } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getTopicComments, addTopicComment } from "@/lib/db";
import type { CommunityTopic, TopicComment } from "@/lib/types";

interface Props {
  topic: CommunityTopic | null;
  isOpen: boolean;
  onClose: () => void;
}

const SEED_COMMENTS: Omit<TopicComment, "topic_id">[] = [
  { user_name: "María", text: "Totalmente de acuerdo, hay que hablar más de esto 🙌", emoji: "🙌" },
  { user_name: "Carlos", text: "Muy buen tema para la comunidad", emoji: "💡" },
];

export default function TopicDetailModal({ topic, isOpen, onClose }: Props) {
  const [comments, setComments] = useState<TopicComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!topic?.id) return;
    getTopicComments(topic.id).then((dbComments) => {
      setComments(
        dbComments.length > 0
          ? dbComments
          : SEED_COMMENTS.map((c) => ({ ...c, topic_id: topic.id! }))
      );
    });
  }, [topic]);

  if (!isOpen || !topic) return null;

  const handleAddComment = async () => {
    if (!newComment.trim() || !topic.id) return;
    setLoading(true);
    const saved = await addTopicComment(topic.id, newComment.trim());
    if (saved) {
      setComments((prev) => [...prev, saved]);
    } else {
      setComments((prev) => [
        ...prev,
        { topic_id: topic.id!, user_name: "Tú", text: newComment.trim(), emoji: "💬" },
      ]);
      toast("Comentario guardado localmente (sin conexión a BD)", { icon: "💾" });
    }
    setNewComment("");
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-800 max-w-2xl w-full rounded-3xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-start gap-4">
          <h2 className="text-2xl font-bold leading-snug">{topic.text}</h2>
          <button onClick={onClose} className="flex-shrink-0">
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          <h3 className="font-semibold text-lg">Discusión ({comments.length})</h3>
          {comments.map((c, i) => (
            <motion.div
              key={c.id ?? i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="text-3xl">{c.emoji}</div>
              <div>
                <span className="font-semibold">{c.user_name}</span>
                <p className="mt-1 text-zinc-700 dark:text-zinc-300">{c.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comment input */}
        <div className="p-6 border-t bg-white dark:bg-zinc-800 flex gap-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            placeholder="Únete a la discusión..."
            className="flex-1 bg-zinc-100 dark:bg-zinc-700 rounded-3xl px-6 py-4 outline-none"
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
