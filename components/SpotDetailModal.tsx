"use client";
import { useState } from "react";
import { X, Heart, MessageCircle, Camera, Send, Smile } from "lucide-react";
import { motion } from "framer-motion";

export default function SpotDetailModal({ spot, isOpen, onClose }: any) {
  const [comments, setComments] = useState([
    { user: "María", text: "El mojito está brutal 🔥", emoji: "🍹" },
    { user: "José", text: "La música en vivo es lo máximo", emoji: "🎤" },
  ]);
  const [newComment, setNewComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  if (!isOpen || !spot) return null;

  const addComment = () => {
    if (!newComment) return;
    setComments([...comments, { user: "Tú", text: newComment, emoji: "👍" }]);
    setNewComment("");
  };

  const addPhoto = () => {
    // Simulation - in real app this would upload to Supabase
    setPhotos([...photos, "https://picsum.photos/id/1" + photos.length + "/600/400"]);
    alert("📸 Foto subida (simulada)");
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-800 max-w-2xl w-full rounded-3xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">{spot.name}</h2>
            <p className="text-emerald-500">{spot.category}</p>
          </div>
          <button onClick={onClose} className="text-4xl">✕</button>
        </div>

        {/* Photos */}
        <div className="p-6 flex gap-3 overflow-x-auto">
          {photos.map((photo, i) => (
            <img key={i} src={photo} className="h-40 rounded-2xl object-cover" />
          ))}
          <button
            onClick={addPhoto}
            className="h-40 w-40 bg-zinc-100 dark:bg-zinc-700 rounded-2xl flex flex-col items-center justify-center text-emerald-500"
          >
            <Camera className="w-8 h-8" />
            <span className="text-xs mt-2">Subir foto</span>
          </button>
        </div>

        {/* Check-in */}
        <div className="px-6 py-4 bg-emerald-100 dark:bg-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="bg-white px-6 py-3 rounded-3xl font-semibold flex items-center gap-2">
              <Heart className="w-5 h-5" /> He estado aquí
            </button>
            <span className="text-emerald-600 font-medium">+12 personas ahora mismo</span>
          </div>
        </div>

        {/* Comments */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {comments.map((c, i) => (
            <motion.div key={i} className="flex gap-4">
              <div className="text-3xl">{c.emoji}</div>
              <div>
                <span className="font-semibold">{c.user}</span>
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
            placeholder="Escribe un comentario o usa emojis..."
            className="flex-1 bg-zinc-100 dark:bg-zinc-700 rounded-3xl px-6 py-4 outline-none"
          />
          <button onClick={addComment} className="bg-black text-white px-8 rounded-3xl">
            <Send />
          </button>
          <button className="text-4xl">😀</button>
        </div>
      </div>
    </div>
  );
}