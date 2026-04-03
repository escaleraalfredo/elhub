"use client";

import { useState } from "react";
import { Laugh } from "lucide-react";
import { useGamification } from "@/lib/gamificationContext";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

export default function MemesPage() {
  const { addPoints } = useGamification();

  const [memes, setMemes] = useState([
    { 
      id: 1, 
      image: "https://picsum.photos/id/1015/600/400", 
      caption: "Cuando el traffic en la 52 te obliga a escuchar perreo a todo volumen", 
      likes: 342, 
      userLiked: false 
    },
    { 
      id: 2, 
      image: "https://picsum.photos/id/237/600/400", 
      caption: "Yo diciendo que solo voy a tomar una Medalla... 3 horas después", 
      likes: 278, 
      userLiked: true 
    },
    { 
      id: 3, 
      image: "https://picsum.photos/id/201/600/400", 
      caption: "El boricua cuando ve que hay perreo en la guagua", 
      likes: 195, 
      userLiked: false 
    },
  ]);

  const handleLike = (id: number) => {
    setMemes(prev => prev.map(meme => {
      if (meme.id === id) {
        const newLikes = meme.userLiked ? meme.likes - 1 : meme.likes + 1;
        if (!meme.userLiked) addPoints(2, "Meme like");
        toast.success(meme.userLiked ? "Like removido" : "¡Meme likeado! +2 pts");
        return { ...meme, likes: newLikes, userLiked: !meme.userLiked };
      }
      return meme;
    }));
  };

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {memes.map((meme) => (
          <div key={meme.id} className="bg-zinc-900 rounded-3xl overflow-hidden">
            <img 
              src={meme.image} 
              alt="meme" 
              className="w-full aspect-video object-cover" 
            />
            <div className="p-5">
              <p className="text-white leading-relaxed mb-5">{meme.caption}</p>
              <button 
                onClick={() => handleLike(meme.id)}
                className={`flex items-center gap-3 text-lg ${meme.userLiked ? "text-pr-red" : "text-zinc-400 hover:text-white"}`}
              >
                <Laugh className="w-6 h-6" />
                <span>{meme.likes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}