// app/trending/checkins.tsx
"use client";

import { useState, useEffect } from "react";
import { Heart, Star, Smile, MessageCircle, Clock } from "lucide-react";
import { useGamification } from "@/lib/gamificationContext";

interface CheckinItem {
  id: number;
  spotName: string;
  location: string;
  username: string;
  timeAgo: string;
  votes: number;
  image?: string;
  isVerified?: boolean;
}

export default function Checkins() {
  const { addPoints } = useGamification();

  const [items, setItems] = useState<CheckinItem[]>([]);
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
    // Mock recent check-ins (in real app this comes from Supabase realtime)
    const mockData: CheckinItem[] = [
      {
        id: 101,
        spotName: "La Placita de Santurce",
        location: "Santurce",
        username: "@boricua_king",
        timeAgo: "hace 12 min",
        votes: 342,
        isVerified: true,
      },
      {
        id: 102,
        spotName: "Playa Crash Boat",
        location: "Aguadilla",
        username: "@playero_pr",
        timeAgo: "hace 34 min",
        votes: 289,
      },
      {
        id: 103,
        spotName: "Lechonera Los Pinos",
        location: "Cayey",
        username: "@lechona_lover",
        timeAgo: "hace 1h",
        votes: 421,
      },
      {
        id: 104,
        spotName: "El Cielo Rooftop",
        location: "Condado",
        username: "@nightlife_pr",
        timeAgo: "hace 2h",
        votes: 198,
        isVerified: true,
      },
      {
        id: 105,
        spotName: "Piñones Food Kiosks",
        location: "Piñones",
        username: "@foodie_boricua",
        timeAgo: "hace 3h",
        votes: 567,
      },
    ];

    setItems(mockData);
    setLoading(false);
  }, []);

  const handleVote = (id: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, votes: item.votes + 50 } : item
      )
    );
    setUserVotes(prev => ({ ...prev, [id]: true }));
    addPoints(10, "Check-in like");
  };

  const handleReaction = (id: number, emoji: string) => {
    setEmojiReactions(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [emoji]: (prev[id]?.[emoji] || 0) + 1
      }
    }));
    addPoints(3, "Emoji reaction");
    setOpenEmojiPicker(null);
  };

  if (loading) {
    return <div className="text-center py-12 text-zinc-400">Cargando check-ins recientes 🔥...</div>;
  }

  return (
    <div className="space-y-4 px-4 pt-4">
      {items.map((item) => {
        const reactions = emojiReactions[item.id] || {};
        const hasReactions = Object.keys(reactions).length > 0;

        return (
          <div
            key={item.id}
            className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-pr-red/50 transition-all relative"
          >
            <div className="flex h-28">
              {/* Photo / Spot Image */}
              <div className="w-28 h-full flex-shrink-0 bg-zinc-800 relative overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.spotName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
                    <Star className="w-10 h-10 text-zinc-600" />
                  </div>
                )}
              </div>

              {/* Main Info */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-white text-[17px] leading-tight line-clamp-2">
                    {item.spotName}
                  </h3>
                  <p className="text-zinc-400 text-sm mt-0.5">{item.location}</p>
                  <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.username} • {item.timeAgo}
                  </p>
                </div>
              </div>
            </div>

            {/* Reactions Pills */}
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

            {/* Tight Action Bar */}
            <div className="px-5 pb-3 pt-1 flex justify-between border-t border-zinc-800 text-zinc-400">
              <div className="flex gap-6">
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

                <button className="flex items-center gap-1.5">
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setOpenEmojiPicker(item.id)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <Smile className="w-6 h-6" />
              </button>
            </div>

            {/* Emoji Picker (opens downward) */}
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

      <div className="text-center py-6 text-zinc-500 text-xs">
        Últimos check-ins de la comunidad • ¡Haz el tuyo y aparece aquí! 🇵🇷
      </div>
    </div>
  );
}