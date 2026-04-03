"use client";
import { useState, useRef } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

export default function ReelsPage() {
  const [reels, setReels] = useState([
    {
      id: 1,
      username: "@bayamonero",
      caption: "Un chinchorro en Piñones al atardecer 🔥 ¿Quién viene?",
      likes: 1240,
      liked: false,
      comments: 89,
      image: "https://picsum.photos/id/1015/1080/1920",
    },
    {
      id: 2,
      username: "@santurcevibes",
      caption: "Bad Bunny en el Coliseo - la energía estaba brutal",
      likes: 3420,
      liked: true,
      comments: 156,
      image: "https://picsum.photos/id/870/1080/1920",
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentReel = reels[currentIndex];

  const toggleLikeReel = () => {
    setReels(prev =>
      prev.map((r, i) =>
        i === currentIndex
          ? {
              ...r,
              liked: !r.liked,
              likes: r.liked ? r.likes - 1 : r.likes + 1,
            }
          : r
      )
    );
    toast.success(currentReel.liked ? "Like removido" : "❤️ Like");
  };

  return (
    <div className="h-[100dvh] bg-black flex flex-col overflow-hidden">
      
      {/* Reels Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto snap-y snap-mandatory scrollbar-hide"
        onScroll={(e) => {
          const containerHeight = e.currentTarget.clientHeight;
          const scrollTop = e.currentTarget.scrollTop;
          const newIndex = Math.round(scrollTop / containerHeight);

          if (newIndex !== currentIndex && newIndex >= 0 && newIndex < reels.length) {
            setCurrentIndex(newIndex);
          }
        }}
      >
        {reels.map((reel) => (
          <div
            key={reel.id}
            className="h-[100dvh] w-full snap-start relative flex-shrink-0"
          >
            {/* Image */}
            <img
              src={reel.image}
              alt="reel"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />

            {/* Bottom Content */}
            <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+90px)] left-4 right-4 text-white z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-zinc-700 rounded-full" />
                <div className="font-semibold text-base">{reel.username}</div>
              </div>
              <p className="text-[15px] leading-snug pr-14">
                {reel.caption}
              </p>
            </div>

            {/* Right Actions */}
            <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+90px)] right-4 flex flex-col items-center gap-6 z-20">
              <button onClick={toggleLikeReel} className="flex flex-col items-center">
                <Heart
                  className={`w-10 h-10 ${
                    reel.liked ? "fill-red-500 text-red-500" : "text-white"
                  }`}
                />
                <span className="text-xs mt-1">{reel.likes}</span>
              </button>

              <button className="flex flex-col items-center">
                <MessageCircle className="w-10 h-10 text-white" />
                <span className="text-xs mt-1">{reel.comments}</span>
              </button>

              <button className="flex flex-col items-center">
                <Share2 className="w-10 h-10 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}