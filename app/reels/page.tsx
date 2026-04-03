"use client";

import { useState } from "react";
import { Heart, MessageCircle, Share2, Music } from "lucide-react";
import { useGamification } from "@/lib/gamificationContext";
import BottomNav from "@/components/BottomNav";

export default function ReelsPage() {
  const { addPoints } = useGamification();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedReels, setLikedReels] = useState<number[]>([]);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

  const reels = [
    { id: 1, username: "@santurcevibes", caption: "La Placita un viernes por la noche 🔥 ¿Quién viene?", music: "Bad Bunny - Tití Me Preguntó", likes: 12400, comments: 342, image: "https://picsum.photos/id/1015/800/1200" },
    { id: 2, username: "@playero_pr", caption: "Atardecer en Luquillo con el perreo sonando 🌅", music: "Residente - Que Hablen", likes: 8900, comments: 156, image: "https://picsum.photos/id/1018/800/1200" },
    { id: 3, username: "@chinchorropr", caption: "Alcapurrias recién salidas del kiosko en Piñones 🍤", music: "Daddy Yankee - Gasolina", likes: 15600, comments: 289, image: "https://picsum.photos/id/106/800/1200" },
    { id: 4, username: "@boricua_vibes", caption: "Cuando el corillo se junta y empieza el perreo sin parar 😂", music: "Anuel AA - China", likes: 9800, comments: 421, image: "https://picsum.photos/id/133/800/1200" },
    { id: 5, username: "@playa_pr", caption: "Domingo en Escambrón con el sonido a todo volumen", music: "Ozuna - El Farsante", likes: 7200, comments: 198, image: "https://picsum.photos/id/201/800/1200" },
    { id: 6, username: "@kiosko_vibes", caption: "Empanadillas de carne y Medalla bien fría en Piñones", music: "Bad Bunny - Yo Perreo Sola", likes: 11300, comments: 267, image: "https://picsum.photos/id/237/800/1200" },
    { id: 7, username: "@rooftop_pr", caption: "Rooftop en Condado con la mejor vista de San Juan", music: "Karol G - Tusa", likes: 6700, comments: 154, image: "https://picsum.photos/id/180/800/1200" },
    { id: 8, username: "@fiestero_pr", caption: "Cuando suena el dembow y todo el mundo se suelta", music: "Rochy RD - El Jefe", likes: 14500, comments: 512, image: "https://picsum.photos/id/251/800/1200" },
  ];

  const currentReel = reels[currentIndex];

  const toggleLike = () => {
    if (likedReels.includes(currentReel.id)) {
      setLikedReels(prev => prev.filter(id => id !== currentReel.id));
    } else {
      setLikedReels(prev => [...prev, currentReel.id]);
      addPoints(5, "Reel like");
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 800);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-20 overflow-hidden">
      <div className="relative h-screen max-w-md mx-auto">
        {reels.map((reel, index) => (
          <div
            key={reel.id}
            className={`absolute inset-0 transition-opacity duration-300 ${index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onDoubleClick={toggleLike}
          >
            <img src={reel.image} alt="reel" className="w-full h-full object-cover" />

            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />

            {showLikeAnimation && index === currentIndex && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Heart className="w-28 h-28 text-red-500 fill-red-500 scale-150 animate-ping" />
              </div>
            )}

            <div className="absolute bottom-28 left-4 right-4 text-white z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-white/30 backdrop-blur rounded-full flex items-center justify-center text-xl">👤</div>
                <div><p className="font-semibold">{reel.username}</p></div>
              </div>
              <p className="text-[15px] leading-tight mb-3">{reel.caption}</p>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <Music className="w-4 h-4" />
                <span>{reel.music}</span>
              </div>
            </div>

            <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-10">
              <button onClick={toggleLike} className="flex flex-col items-center">
                <div className="p-3 rounded-full bg-white/20">
                  <Heart className={`w-8 h-8 transition-all ${likedReels.includes(reel.id) ? "text-red-500 fill-red-500" : "text-white"}`} />
                </div>
                <span className="text-xs text-white mt-1">
                  {(likedReels.includes(reel.id) ? reel.likes + 1 : reel.likes).toLocaleString()}
                </span>
              </button>

              <button className="flex flex-col items-center">
                <div className="p-3 bg-white/20 rounded-full">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <span className="text-xs text-white mt-1">{reel.comments}</span>
              </button>

              <button className="flex flex-col items-center">
                <div className="p-3 bg-white/20 rounded-full">
                  <Share2 className="w-8 h-8 text-white" />
                </div>
                <span className="text-xs text-white mt-1">Share</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}