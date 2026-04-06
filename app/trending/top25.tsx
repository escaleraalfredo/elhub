// app/trending/top25.tsx
"use client";

import { useState, useEffect } from "react";
import { Trophy, Heart, Star, Zap, ArrowUp, ArrowDown, Smile, MessageCircle } from "lucide-react";
import { useGamification } from "@/lib/gamificationContext";

interface TopItem {
  id: number;
  rank: number;
  name: string;
  location?: string;
  votes: number;
  image?: string;
  category: string;
  isBoosted?: boolean;
  isVerified?: boolean;
  change?: number;
}

export default function Top25({ activeCategory }: { activeCategory: string }) {
  const { addPoints } = useGamification();

  const [items, setItems] = useState<TopItem[]>([]);
  const [userVotes, setUserVotes] = useState<Record<number, boolean>>({});
  const [openEmojiPicker, setOpenEmojiPicker] = useState<number | null>(null);
  const [emojiReactions, setEmojiReactions] = useState<Record<number, Record<string, number>>>({});
  const [loading, setLoading] = useState(true);

  const emojis = [
    "🔥","❤️","🙌","😂","😢","😡","🤬","💩",
    "👏","🙏","🌴","🍍","🍺","🎉","👀","🤦‍♂️",
    "👍","👎","🥳","😱","🤔","🇵🇷","😍","💯"
  ];

  useEffect(() => {
    const mockData: TopItem[] = [
      { id: 1, rank: 1, name: "La Placita de Santurce", location: "Santurce", votes: 12480, category: "Bares", isBoosted: true, change: 0 },
      { id: 2, rank: 2, name: "El Cielo Rooftop", location: "Condado", votes: 9870, category: "Lounges", isVerified: true, change: 1 },
      { id: 3, rank: 3, name: "Piñones Food Kiosks", location: "Piñones", votes: 8740, category: "Lechoneras", change: -1 },
      { id: 4, rank: 4, name: "Bad Bunny - Tití Me Preguntó", votes: 15620, category: "Canciones", change: 2 },
      { id: 5, rank: 5, name: "Playa Flamenco", location: "Culebra", votes: 13200, category: "Playas", isBoosted: true, change: 0 },
      { id: 6, rank: 6, name: "Oasis Beach Club", location: "Isabela", votes: 7650, category: "Playas", change: -2 },
      { id: 7, rank: 7, name: "Lechonera Los Pinos", location: "Cayey", votes: 6890, category: "Lechoneras", isVerified: true, change: 1 },
      { id: 8, rank: 8, name: "Los Kioskos de Luquillo", location: "Luquillo", votes: 6420, category: "Lechoneras", change: 0 },
      { id: 9, rank: 9, name: "La Factoría", location: "Old San Juan", votes: 5980, category: "Bares", change: -1 },
      { id: 10, rank: 10, name: "Playa Crash Boat", location: "Aguadilla", votes: 5210, category: "Playas", change: 3 },
    ];

    let filtered = mockData;
    if (activeCategory !== "Todos") {
      filtered = mockData.filter(item => item.category === activeCategory);
    }

    const sorted = filtered
      .sort((a, b) => b.votes - a.votes)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));

    setItems(sorted);
    setLoading(false);
  }, [activeCategory]);

  const handleVote = (id: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, votes: item.votes + 50 } : item
      )
    );
    setUserVotes(prev => ({ ...prev, [id]: true }));

    addPoints(10, "Top 25 vote");
  };

  const handleReaction = (id: number, emoji: string) => {
    setEmojiReactions(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [emoji]: (prev[id]?.[emoji] || 0) + 1
      }
    }));

    addPoints(3, "Emoji reaction on Top 25");
    setOpenEmojiPicker(null);
  };

  if (loading) {
    return <div className="text-center py-12 text-zinc-400">Cargando Top 25 🔥...</div>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const reactions = emojiReactions[item.id] || {};
        const hasReactions = Object.keys(reactions).length > 0;

        return (
          <div
            key={item.id}
            className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-pr-red/50 transition-all relative"
          >
            {/* Boosted Banner */}
            {item.isBoosted && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-[10px] font-bold px-3 py-0.5 rounded-full flex items-center gap-1 z-10">
                <Zap className="w-3 h-3" /> BOOSTED
              </div>
            )}

            <div className="flex h-28">
              {/* Rank Column */}
              <div className="w-20 flex-shrink-0 bg-zinc-950 flex flex-col items-center justify-center border-r border-zinc-800">
                <div className="text-5xl font-black text-pr-red leading-none tracking-tighter">
                  {item.rank}
                </div>
                {item.change !== undefined && item.change !== 0 && (
                  <div className={`flex items-center gap-0.5 text-xs mt-1 font-medium ${item.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {item.change > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(item.change)}
                  </div>
                )}
              </div>

              {/* Main Content */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white text-[16px] leading-tight line-clamp-2 pr-2">
                        {item.name}
                      </h3>
                      {item.isVerified && <Star className="w-5 h-5 text-yellow-400 fill-current flex-shrink-0 mt-0.5" />}
                    </div>
                    {item.location && (
                      <p className="text-zinc-400 text-sm mt-0.5">{item.location}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Image - Original small size */}
              <div className="w-28 h-full flex-shrink-0 bg-zinc-800 relative overflow-hidden">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
                    <Trophy className="w-9 h-9 text-zinc-600" />
                  </div>
                )}
              </div>
            </div>

            {/* Reactions Pills - Minimal spacing */}
            {hasReactions && (
              <div className="px-5 pt-1 pb-2 flex flex-wrap gap-2">
                {Object.entries(reactions).map(([emoji, count]) =>
                  count > 0 && (
                    <div
                      key={emoji}
                      onClick={() => handleReaction(item.id, emoji)}
                      className="bg-zinc-800 px-3 py-1 rounded-full text-sm flex items-center gap-1 cursor-pointer hover:bg-zinc-700 transition-colors"
                    >
                      {emoji} <span className="text-xs text-zinc-400">{count}</span>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Icons Section - Very tight spacing (minimum top & bottom) */}
            <div className="px-5 pb-3 pt-1 flex justify-between border-t border-zinc-800 text-zinc-400">
              <div className="flex gap-6">
                {/* Like Button */}
                <button 
                  onClick={() => handleVote(item.id)}
                  disabled={!!userVotes[item.id]}
                  className={`flex items-center gap-1.5 transition-all ${userVotes[item.id] ? "text-red-500" : ""}`}
                >
                  <Heart 
                    className={`w-5 h-5 transition-all ${userVotes[item.id] ? "fill-current scale-110" : ""}`} 
                  />
                  <span className="font-mono text-sm tabular-nums">{item.votes.toLocaleString()}</span>
                </button>

                {/* Comment Icon */}
                <button className="flex items-center gap-1.5">
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Emoji Button */}
              <button 
                onClick={() => setOpenEmojiPicker(item.id)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <Smile className="w-6 h-6" />
              </button>
            </div>

            {/* Emoji Picker - Opens downward */}
            {openEmojiPicker === item.id && (
              <div className="absolute bottom-[-12px] left-4 bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-2xl z-30 flex flex-wrap gap-3 max-w-[260px]">
                {emojis.slice(0, 12).map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(item.id, emoji)}
                    className="text-3xl hover:scale-125 active:scale-110 transition-transform p-2 rounded-xl hover:bg-zinc-800"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Footer */}
      <div className="text-center pt-6 pb-8">
        <p className="text-zinc-500 text-xs">
          Rankings se actualizan cada hora • ¡Vota y reacciona como en Noticias! 🇵🇷
        </p>
      </div>
    </div>
  );
}