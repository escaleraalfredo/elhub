"use client";
import { useState, useEffect } from "react";
import { Heart, Camera, Send } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getSpotComments, addSpotComment } from "@/lib/db";
import type { Spot, SpotComment } from "@/lib/types";

interface Props {
  spot: Spot | null;
  isOpen: boolean;
  onClose: () => void;
}

const SEED_COMMENTS: SpotComment[] = [
  { spot_id: 0, user_name: "María", text: "El mojito está brutal 🔥", emoji: "🍹" },
  { spot_id: 0, user_name: "José", text: "La música en vivo es lo máximo", emoji: "🎤" },
];

export default function SpotDetailModal({ spot, isOpen, onClose }: Props) {
  const [comments, setComments] = useState<SpotComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!spot) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhotos([]);
    getSpotComments(spot.id).then((dbComments) => {
      // Show seed comments as a placeholder only when the DB has none yet
      setComments(
        dbComments.length > 0
          ? dbComments
          : SEED_COMMENTS.map((c) => ({ ...c, spot_id: spot.id }))
      );
    });
  }, [spot]);

  if (!isOpen || !spot) return null;

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    const saved = await addSpotComment(spot.id, newComment.trim());
    if (saved) {
      setComments((prev) => [...prev, saved]);
    } else {
      setComments((prev) => [
        ...prev,
        { spot_id: spot.id, user_name: "Tú", text: newComment.trim(), emoji: "👍" },
      ]);
      toast("Comentario guardado localmente (sin conexión a BD)", { icon: "💾" });
    }
    setNewComment("");
    setLoading(false);
  };

  const addPhoto = () => {
    setPhotos((prev) => [...prev, `https://picsum.photos/id/${10 + prev.length}/600/400`]);
    toast.success("📸 Foto subida");
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-800 max-w-2xl w-full rounded-3xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">{spot.name}</h2>
            <p className="text-emerald-500">{spot.category}</p>
            <p className="text-sm text-zinc-400 mt-1">
              ⭐ {spot.rating} · {spot.reviews.toLocaleString()} reseñas · {spot.price}
            </p>
          </div>
          <button onClick={onClose} className="text-4xl">✕</button>
        </div>

        {/* Photos */}
        <div className="p-6 flex gap-3 overflow-x-auto">
          {photos.map((photo, i) => (
            <Image key={i} src={photo} className="h-40 rounded-2xl object-cover" alt={`Spot photo ${i + 1}`} width={600} height={160} style={{ height: "10rem" }} />
          ))}
          <button
            onClick={addPhoto}
            className="h-40 w-40 flex-shrink-0 bg-zinc-100 dark:bg-zinc-700 rounded-2xl flex flex-col items-center justify-center text-emerald-500"
          >
            <Camera className="w-8 h-8" />
            {/* Placeholder — real upload to Supabase Storage comes in a future step */}
            <span className="text-xs mt-2">Subir foto</span>
          </button>
        </div>

        {/* Check-in */}
        <div className="px-6 py-4 bg-emerald-100 dark:bg-emerald-900 flex items-center gap-3">
          <button className="bg-white px-6 py-3 rounded-3xl font-semibold flex items-center gap-2">
            <Heart className="w-5 h-5" /> He estado aquí
          </button>
          <span className="text-emerald-600 font-medium">+12 personas ahora mismo</span>
        </div>

        {/* Comments */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          <h3 className="font-semibold text-lg">Comentarios ({comments.length})</h3>
          {comments.map((c, i) => (
            <motion.div key={c.id ?? i} className="flex gap-4">
              <div className="text-3xl">{c.emoji}</div>
              <div>
                <span className="font-semibold">{c.user_name}</span>
                <p>{c.text}</p>
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
            placeholder="Escribe un comentario o usa emojis..."
            className="flex-1 bg-zinc-100 dark:bg-zinc-700 rounded-3xl px-6 py-4 outline-none"
          />
          <button
            onClick={handleAddComment}
            disabled={loading || !newComment.trim()}
            className="bg-black text-white px-8 rounded-3xl disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}