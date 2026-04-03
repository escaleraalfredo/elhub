"use client";
import { useState } from "react";
import { Heart, MessageCircle, Share2, Plus, Smile } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import { useGamification } from "@/lib/gamificationContext";

export default function MemesPage() {
  const { addPoints } = useGamification();

  const [memes, setMemes] = useState([
    {
      id: 1,
      username: "@bayamonero",
      image: "https://picsum.photos/id/1015/600/800",
      caption: "Cuando el pernil se acaba antes de las 12 🥲",
      likes: 342,
      liked: false,
      comments: 28,
      time: "15m",
      reactions: {
        "😂": 45,
        "🔥": 32,
        "🥲": 18,
      },
    },
    {
      id: 2,
      username: "@santurcevibes",
      image: "https://picsum.photos/id/870/600/800",
      caption: "Bad Bunny dijo: \"Yo no soy de aquí pero soy de allá\" 😂",
      likes: 1240,
      liked: true,
      comments: 67,
      time: "2h",
      reactions: {
        "😂": 89,
        "🔥": 67,
        "👑": 45,
      },
    },
    {
      id: 3,
      username: "@playero_pr",
      image: "https://picsum.photos/id/1016/600/800",
      caption: "Yo tratando de explicar a mi jefe por qué llegué tarde por el tapón",
      likes: 892,
      liked: false,
      comments: 45,
      time: "5h",
      reactions: {
        "😂": 67,
        "🥲": 23,
      },
    },
  ]);

  const toggleLike = (memeId: number) => {
    setMemes(prev => prev.map(meme => {
      if (meme.id === memeId) {
        return {
          ...meme,
          liked: !meme.liked,
          likes: meme.liked ? meme.likes - 1 : meme.likes + 1
        };
      }
      return meme;
    }));
    toast.success("❤️ Me gusta");
    addPoints(2, "Meme like");
  };

  const addReaction = (memeId: number, emoji: string) => {
    setMemes(prev => prev.map(meme => {
      if (meme.id === memeId) {
        const currentCount = meme.reactions[emoji] || 0;
        return {
          ...meme,
          reactions: {
            ...meme.reactions,
            [emoji]: currentCount + 1
          }
        };
      }
      return meme;
    }));
    toast.success(`Reaccionaste con ${emoji}`);
    addPoints(1, "Meme reaction");
  };

  return (
    <div className="min-h-screen bg-dark-bg pb-20 relative">
      <div className="max-w-md mx-auto px-4 py-4 space-y-6">
        {memes.map((meme) => (
          <div
            key={meme.id}
            className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800"
          >
            {/* Meme Image */}
            <div className="relative">
              <img 
                src={meme.image} 
                alt="meme" 
                className="w-full aspect-square object-cover"
              />
            </div>

            {/* Caption + Timestamp */}
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-zinc-700 rounded-full" />
                <div>
                  <p className="font-semibold text-sm">{meme.username}</p>
                  <p className="text-xs text-zinc-500">{meme.time}</p>
                </div>
              </div>

              <p className="text-[14.5px] leading-relaxed text-zinc-200 mb-6">
                {meme.caption}
              </p>

              {/* Discord-style Reactions */}
              <div className="flex flex-wrap gap-2 mb-6">
                {Object.entries(meme.reactions).map(([emoji, count]) => (
                  <button
                    key={emoji}
                    onClick={() => addReaction(meme.id, emoji)}
                    className="bg-zinc-800 hover:bg-zinc-700 transition-all px-4 py-1.5 rounded-full text-sm flex items-center gap-1.5 active:scale-95"
                  >
                    {emoji} <span className="text-zinc-400 text-xs">{count}</span>
                  </button>
                ))}
              </div>

              {/* Action Bar - Only ONE emoji icon next to Like */}
              <div className="flex items-center justify-between text-sm border-t border-zinc-800 pt-4">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => toggleLike(meme.id)}
                    className={`flex items-center gap-2 transition-all ${meme.liked ? "text-red-500" : "text-zinc-400 hover:text-red-500"}`}
                  >
                    <Heart className={`w-5 h-5 ${meme.liked ? "fill-current" : ""}`} />
                    <span>{meme.likes}</span>
                  </button>

                  {/* Single Emoji Icon - Right next to Like */}
                  <button 
                    onClick={() => toast.info("Selector de emojis pronto disponible")}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>

                <button className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all">
                  <MessageCircle className="w-5 h-5" />
                  <span>{meme.comments}</span>
                </button>

                <button 
                  onClick={() => toast.success("Compartido")}
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating + Button */}
      <button
        onClick={() => toast.info("Crear meme pronto disponible")}
        className="fixed bottom-24 left-1/2 translate-x-[200%] z-50 w-16 h-16 bg-pr-red hover:bg-red-600 active:bg-red-700 transition-all rounded-full flex items-center justify-center shadow-2xl shadow-pr-red/40 active:scale-95 border-4 border-zinc-950"
      >
        <Plus className="w-8 h-8 text-white" />
      </button>

      <BottomNav />
    </div>
  );
}