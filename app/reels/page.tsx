// app/reels/page.tsx
"use client";

import { useState } from "react";
import { Heart, Share2 } from "lucide-react";
import { toast } from "sonner";
import Avatar from "@/components/ui/Avatar";
import { CommentButton, CommentsSheet } from "@/components/comments/Comments";
import { useGamification } from "@/lib/gamificationContext";
import { REELS, type Reel } from "@/lib/community/data";
import { formatCount } from "@/lib/time";
import { cn } from "@/lib/utils";

export default function ReelsPage() {
  const { addPoints } = useGamification();
  const [reels, setReels] = useState<Reel[]>(REELS);
  const [openFor, setOpenFor] = useState<Reel | null>(null);

  const like = (id: number, only = false) =>
    setReels((prev) =>
      prev.map((r) => {
        if (r.id !== id || (only && r.liked)) return r;
        if (!r.liked) addPoints(2, "Like reel");
        return { ...r, liked: !r.liked, likes: r.likes + (r.liked ? -1 : 1) };
      })
    );

  return (
    <div className="bg-black h-[calc(100dvh-3.5rem)] overflow-y-auto snap-y snap-mandatory scrollbar-hide">
      {reels.map((reel) => (
        <section
          key={reel.id}
          onDoubleClick={() => like(reel.id, true)}
          className="relative h-[calc(100dvh-3.5rem)] w-full max-w-md mx-auto snap-start overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={reel.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />

          <div className="absolute left-4 right-20 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] text-white">
            <div className="flex items-center gap-3 mb-2">
              <Avatar name={reel.username} size={36} className="ring-2 ring-white/80" />
              <span className="font-semibold">{reel.username}</span>
            </div>
            <p className="text-[15px] leading-snug">{reel.caption}</p>
          </div>

          <div className="absolute right-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] flex flex-col items-center gap-6 text-white">
            <button onClick={() => like(reel.id)} className="flex flex-col items-center" aria-label="Me gusta">
              <Heart className={cn("w-8 h-8 drop-shadow", reel.liked && "fill-red-500 text-red-500")} />
              <span className="text-xs mt-1 font-semibold">{formatCount(reel.likes)}</span>
            </button>
            <CommentButton
              threadId={`reel:${reel.id}`}
              seed={reel.seed}
              onClick={() => setOpenFor(reel)}
              className="flex-col gap-1 text-white [&_svg]:w-8 [&_svg]:h-8 [&_span]:text-xs [&_span]:font-semibold"
            />
            <button onClick={() => toast.success("Enlace copiado")} aria-label="Compartir">
              <Share2 className="w-8 h-8 drop-shadow" />
            </button>
          </div>
        </section>
      ))}

      <CommentsSheet
        open={openFor !== null}
        onClose={() => setOpenFor(null)}
        threadId={`reel:${openFor?.id ?? ""}`}
        seed={openFor?.seed}
      />
    </div>
  );
}
