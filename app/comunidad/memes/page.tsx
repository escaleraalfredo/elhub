// app/comunidad/memes/page.tsx
"use client";

import { useState } from "react";
import { Bookmark, Heart, Send } from "lucide-react";
import { toast } from "sonner";
import { Card, PageContent } from "@/components/ui/Page";
import Avatar from "@/components/ui/Avatar";
import SafeImg from "@/components/ui/SafeImg";
import UnifiedFAB from "@/components/UnifiedFAB";
import { CommentButton, CommentsSheet, ViewAllComments } from "@/components/comments/Comments";
import { useGamification } from "@/lib/gamificationContext";
import { MEMES, type Meme } from "@/lib/community/data";
import { formatCount } from "@/lib/time";
import { cn } from "@/lib/utils";

export default function MemesPage() {
  const { addPoints } = useGamification();
  const [memes, setMemes] = useState<Meme[]>(MEMES);
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [openFor, setOpenFor] = useState<Meme | null>(null);

  const like = (id: number, only = false) =>
    setMemes((prev) =>
      prev.map((m) => {
        if (m.id !== id || (only && m.liked)) return m;
        if (!m.liked) addPoints(2, "Like meme");
        return { ...m, liked: !m.liked, likes: m.likes + (m.liked ? -1 : 1) };
      })
    );

  return (
    <>
      <PageContent>
        {memes.map((meme) => (
          <Card key={meme.id}>
            <div className="flex items-center gap-3 px-4 py-3">
              <Avatar name={meme.username} size={32} />
              <span className="font-semibold text-sm">{meme.username}</span>
              <span className="text-xs text-zinc-500">· {meme.time}</span>
            </div>
            <div onDoubleClick={() => like(meme.id, true)} className="bg-zinc-950">
              <SafeImg src={meme.image} alt={meme.caption} className="w-full aspect-square object-cover" />
            </div>
            <div className="px-4 pt-3 pb-4">
              <div className="flex items-center gap-5">
                <button
                  onClick={() => like(meme.id)}
                  aria-label="Me gusta"
                  className={cn(meme.liked ? "text-red-500" : "text-zinc-300 hover:text-white")}
                >
                  <Heart className={cn("w-6 h-6", meme.liked && "fill-current")} />
                </button>
                <CommentButton threadId={`meme:${meme.id}`} seed={meme.seed} onClick={() => setOpenFor(meme)} />
                <button onClick={() => toast.success("Enlace copiado")} aria-label="Compartir" className="text-zinc-300 hover:text-white">
                  <Send className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSaved((s) => ({ ...s, [meme.id]: !s[meme.id] }))}
                  aria-label="Guardar"
                  className="ml-auto text-zinc-300 hover:text-white"
                >
                  <Bookmark className={cn("w-6 h-6", saved[meme.id] && "fill-current")} />
                </button>
              </div>
              <p className="mt-2 text-sm font-semibold">{formatCount(meme.likes)} Me gusta</p>
              <p className="mt-1 text-sm text-zinc-100">
                <span className="font-semibold mr-1.5">{meme.username}</span>
                {meme.caption}
              </p>
              <div className="mt-1">
                <ViewAllComments threadId={`meme:${meme.id}`} seed={meme.seed} onClick={() => setOpenFor(meme)} />
              </div>
            </div>
          </Card>
        ))}
      </PageContent>

      <UnifiedFAB onClick={() => toast.info("Subir memes llega pronto")} label="Nuevo meme" />

      <CommentsSheet
        open={openFor !== null}
        onClose={() => setOpenFor(null)}
        threadId={`meme:${openFor?.id ?? ""}`}
        seed={openFor?.seed}
      />
    </>
  );
}
