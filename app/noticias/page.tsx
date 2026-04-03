// app/noticias/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageCircle, Bookmark, Smile } from "lucide-react";
import { useGamification } from "@/lib/gamificationContext";
import { useNews } from "@/lib/newsContext";

export default function NoticiasPage() {
  const { addPoints } = useGamification();
  const { news, updateNews } = useNews();

  const [openEmojiPicker, setOpenEmojiPicker] = useState<string | null>(null);

  const emojis = [
    "🔥", "❤️", "🙌", "😂", "😢", "😡", "🤬", "💩", 
    "👏", "🙏", "🌧️", "💸", "😤", "🎉", "👀", "🤦‍♂️",
    "🖕", "👍", "👎", "🥳", "😱", "🤔", "🇵🇷", "🇺🇸", 
    "😍", "🤯", "🙄", "💯", "🚀", "🍆", "🥲", "👑"
  ];

  const handleVote = (id: string, vote: "up" | "down") => {
    updateNews(id, (item) => {
      let newLikes = item.likes;
      let newDislikes = item.dislikes;

      if (item.userVote === vote) {
        if (vote === "up") newLikes--;
        else newDislikes--;
        return { ...item, likes: newLikes, dislikes: newDislikes, userVote: null };
      }

      if (item.userVote === "up") newLikes--;
      if (item.userVote === "down") newDislikes--;

      if (vote === "up") newLikes++;
      else newDislikes++;

      addPoints(2, "News vote");
      return { ...item, likes: newLikes, dislikes: newDislikes, userVote: vote };
    });
  };

  const handleReaction = (id: string, emoji: string) => {
    updateNews(id, (item) => {
      const current = item.reactions[emoji] || 0;
      addPoints(1, "Emoji reaction");
      return {
        ...item,
        reactions: { ...item.reactions, [emoji]: current + 1 }
      };
    });
    setOpenEmojiPicker(null);
  };

  return (
    <div className="min-h-screen bg-[#09090b] pb-20">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-5">
          {news.map((item) => (
            <div key={item.id} className="card overflow-hidden hover:border-pr-red/60 transition-all">
              <Link href={`/noticias/${item.id}`} className="block">
                {item.image && (
                  <div className="relative h-52">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-xl">
                      {item.source}
                    </div>
                    <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-lg">
                      {item.time}
                    </div>
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-[16px] leading-tight font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-zinc-300 text-[14px] leading-relaxed mb-5 line-clamp-3">{item.excerpt}</p>
                </div>
              </Link>

              <div className="px-5 pb-3 flex flex-wrap gap-2">
                {Object.entries(item.reactions).map(([emoji, count]) => 
                  count > 0 && (
                    <div 
                      key={emoji} 
                      onClick={() => handleReaction(item.id, emoji)} 
                      className="bg-zinc-800 px-3 py-1 rounded-full text-sm flex items-center gap-1 cursor-pointer hover:bg-zinc-700"
                    >
                      {emoji} <span className="text-xs text-zinc-400">{count}</span>
                    </div>
                  )
                )}
              </div>

              <div className="px-5 pb-5 flex items-center justify-between text-zinc-400 border-t border-zinc-800 pt-4">
                <div className="flex gap-6">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleVote(item.id, "up"); }}
                    className={`flex items-center gap-1.5 transition-colors ${item.userVote === "up" ? "text-pr-red" : "hover:text-white"}`}
                  >
                    <ThumbsUp className={`w-5 h-5 ${item.userVote === "up" ? "fill-pr-red text-pr-red" : ""}`} />
                    <span className="text-sm">{item.likes}</span>
                  </button>

                  <button 
                    onClick={(e) => { e.stopPropagation(); handleVote(item.id, "down"); }}
                    className={`flex items-center gap-1.5 transition-colors ${item.userVote === "down" ? "text-red-500" : "hover:text-white"}`}
                  >
                    <ThumbsDown className={`w-5 h-5 ${item.userVote === "down" ? "fill-red-500 text-red-500" : ""}`} />
                    <span className="text-sm">{item.dislikes}</span>
                  </button>

                  <Link href={`/noticias/${item.id}?comments=open`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">{item.comments}</span>
                  </Link>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setOpenEmojiPicker(openEmojiPicker === item.id ? null : item.id); }}
                    className="hover:text-white transition-colors"
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); }}
                    className="hover:text-white"
                  >
                    <Bookmark className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {openEmojiPicker === item.id && (
                <div className="px-5 pb-5">
                  <div className="bg-zinc-800 rounded-2xl p-4 flex flex-wrap gap-4 text-3xl justify-center">
                    {emojis.map(emoji => (
                      <button
                        key={emoji}
                        onClick={(e) => { e.stopPropagation(); handleReaction(item.id, emoji); }}
                        className="hover:scale-125 active:scale-90 p-2"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}