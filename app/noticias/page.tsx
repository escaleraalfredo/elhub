"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { 
  ThumbsUp, ThumbsDown, MessageCircle, Bookmark, Smile, ChevronDown 
} from "lucide-react";
import { useGamification } from "@/lib/gamificationContext";
import { useNews } from "@/lib/newsContext";

export default function NoticiasPage() {
  const { addPoints } = useGamification();
  const { news, updateNews } = useNews();

  const [openEmojiPicker, setOpenEmojiPicker] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("Todas");

  const emojis = [
    "🔥","❤️","🙌","😂","😢","😡","🤬","💩",
    "👏","🙏","🌧️","💸","😤","🎉","👀","🤦‍♂️",
    "🖕","👍","👎","🥳","😱","🤔","🇵🇷","🇺🇸",
    "😍","🤯","🙄","💯","🚀","🥲","👑"
  ];

  const sources = [
    "Todas",
    "El Nuevo Día",
    "Primera Hora",
    "Metro PR",
    "Telemundo PR",
    "NotiCel"
  ];

  const filteredNews = useMemo(() => {
    if (activeFilter === "Todas") return news;
    return news.filter(n => n.source === activeFilter);
  }, [news, activeFilter]);

  const selectFilter = (src: string) => {
    setActiveFilter(src);
    setShowFilters(false);
  };

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

      {/* Sticky Header - Minimal & Subliminal Filter (matching Social page) */}
      <div className="sticky top-[57px] bg-zinc-950 border-b border-zinc-800 z-40">
        <div className="max-w-md mx-auto px-4 py-3">

          {/* Tab Bar */}
          <div className="flex border-b border-zinc-800">
            <Link 
              href="/noticias" 
              className="flex-1 text-center py-3 font-medium text-white border-b-2 border-pr-red"
            >
              Noticias
            </Link>
            <Link 
              href="/noticias/social" 
              className="flex-1 text-center py-3 font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Social
            </Link>
          </div>

          {/* Minimal Filter Row - Subliminal (same as Social) */}
          <div className="flex items-center justify-end mt-3 pr-1">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm"
            >
              <span className="font-medium">{activeFilter}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Dropdown */}
        {showFilters && (
          <div className="max-w-md mx-auto px-4 pb-3">
            <div className="bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl py-1 max-h-[300px] overflow-y-auto">
              {sources.map((src) => (
                <button
                  key={src}
                  onClick={() => selectFilter(src)}
                  className={`w-full text-left px-5 py-3 text-sm hover:bg-zinc-800 transition-all flex justify-between items-center ${
                    activeFilter === src
                      ? "text-pr-red font-medium bg-zinc-800/50"
                      : "text-zinc-300"
                  }`}
                >
                  {src}
                  {activeFilter === src && <span className="text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-5">
        {filteredNews.map((item) => (
          <div key={item.id} className="card overflow-hidden border border-zinc-800">

            <Link href={`/noticias/${item.id}`} className="block">
              {item.image && (
                <div className="relative h-52">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-3 py-1 rounded-xl">
                    {item.source}
                  </div>
                </div>
              )}

              <div className="p-5">
                <h3 className="text-white font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-zinc-400 text-sm">
                  {item.excerpt}
                </p>
              </div>
            </Link>

            {/* Reactions */}
            <div className="px-5 pb-3 flex flex-wrap gap-2">
              {Object.entries(item.reactions).map(([emoji, count]) =>
                count > 0 && (
                  <div
                    key={emoji}
                    onClick={() => handleReaction(item.id, emoji)}
                    className="bg-zinc-800 px-3 py-1 rounded-full text-sm flex gap-1 cursor-pointer"
                  >
                    {emoji} <span className="text-xs text-zinc-400">{count}</span>
                  </div>
                )
              )}
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 flex justify-between border-t border-zinc-800 pt-4 text-zinc-400">
              <div className="flex gap-6">
                <button onClick={(e) => { e.stopPropagation(); handleVote(item.id, "up"); }}>
                  <ThumbsUp className="w-5 h-5" />
                </button>

                <button onClick={(e) => { e.stopPropagation(); handleVote(item.id, "down"); }}>
                  <ThumbsDown className="w-5 h-5" />
                </button>

                <MessageCircle className="w-5 h-5" />
              </div>

              <div className="flex gap-4">
                <button onClick={(e) => { e.stopPropagation(); setOpenEmojiPicker(item.id); }}>
                  <Smile className="w-5 h-5" />
                </button>

                <Bookmark className="w-5 h-5" />
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}