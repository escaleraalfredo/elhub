"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, Star, MapPin, Loader2 } from "lucide-react";
import { getUserProfile, upsertUserProfile, getLeaderboard } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import type { LeaderboardEntry, UserProfile } from "@/lib/types";
import toast from "react-hot-toast";

const AVATAR_OPTIONS = ["🇵🇷", "🦅", "🌴", "🎺", "🍹", "☀️", "🔥", "🎉"];
const BADGE_CATALOG = [
  { id: "explorer", label: "Explorador", emoji: "🗺️", desc: "Visita 5 spots" },
  { id: "social", label: "Social", emoji: "💬", desc: "Comenta 10 veces" },
  { id: "streak7", label: "Racha 7d", emoji: "🔥", desc: "7 días seguidos" },
  { id: "trendy", label: "Trendy", emoji: "📈", desc: "Vota 5 noticias" },
  { id: "boricua", label: "Boricua", emoji: "🇵🇷", desc: "Completa tu perfil" },
];

const SEED_LEADERBOARD: LeaderboardEntry[] = [
  { user_name: "María S.", avatar_emoji: "🌴", points: 4200, badges: ["explorer", "social", "boricua"] },
  { user_name: "Carlos R.", avatar_emoji: "🦅", points: 3800, badges: ["streak7", "trendy"] },
  { user_name: "Aida G.", avatar_emoji: "🇵🇷", points: 3200, badges: ["boricua", "explorer"] },
  { user_name: "José L.", avatar_emoji: "🍹", points: 2900, badges: ["social"] },
  { user_name: "Tú", avatar_emoji: "🔥", points: 1500, badges: ["boricua"] },
];

const POINTS_PER_LEVEL = 500;

const DEMO_PROFILE: UserProfile = {
  id: "demo",
  user_name: "Alfredo Escalera",
  avatar_emoji: "🇵🇷",
  points: 1500,
  streak: 5,
  badges: ["boricua", "explorer"],
  check_ins: 24,
};

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>(DEMO_PROFILE);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(SEED_LEADERBOARD);
  const [editName, setEditName] = useState(false);
  const [nameInput, setNameInput] = useState(DEMO_PROFILE.user_name);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "leaderboard">("profile");

  useEffect(() => {
    (async () => {
      // Try to get logged-in user
      const userId = supabase
        ? (await supabase.auth.getUser()).data.user?.id
        : null;

      if (userId) {
        const saved = await getUserProfile(userId);
        if (saved) setProfile(saved);
      }

      const lb = await getLeaderboard(10);
      if (lb.length > 0) setLeaderboard(lb);

      setLoading(false);
    })();
  }, []);

  const saveProfile = async () => {
    const updated = { ...profile, user_name: nameInput.trim() || profile.user_name };
    setProfile(updated);
    setEditName(false);
    if (profile.id !== "demo") {
      await upsertUserProfile(updated);
    }
    toast.success("✅ Perfil actualizado");
  };

  const earnedBadges = BADGE_CATALOG.filter((b) => profile.badges.includes(b.id));
  const lockedBadges = BADGE_CATALOG.filter((b) => !profile.badges.includes(b.id));

  const nextLevelPoints = Math.ceil(profile.points / POINTS_PER_LEVEL) * POINTS_PER_LEVEL;
  const progress = ((profile.points % POINTS_PER_LEVEL) / POINTS_PER_LEVEL) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Tab switcher */}
      <div className="flex gap-3">
        {(["profile", "leaderboard"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-3xl font-semibold capitalize transition-all ${activeTab === tab ? "bg-emerald-400 text-black" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
          >
            {tab === "profile" ? "Mi Perfil" : "Leaderboard"}
          </button>
        ))}
      </div>

      {activeTab === "profile" ? (
        <>
          {/* Avatar + name */}
          <div className="text-center space-y-3">
            <div className="flex justify-center gap-3 mb-4 flex-wrap">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setProfile((p) => ({ ...p, avatar_emoji: emoji }))}
                  className={`text-4xl p-2 rounded-2xl border-2 transition-all ${profile.avatar_emoji === emoji ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900" : "border-transparent"}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-6xl">
              {profile.avatar_emoji}
            </div>

            {editName ? (
              <div className="flex items-center gap-3 justify-center">
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveProfile()}
                  className="bg-zinc-100 dark:bg-zinc-800 rounded-3xl px-5 py-2 text-xl outline-none border border-emerald-400"
                  autoFocus
                />
                <button onClick={saveProfile} className="bg-emerald-400 text-black px-4 py-2 rounded-3xl font-semibold">
                  Guardar
                </button>
              </div>
            ) : (
              <button onClick={() => setEditName(true)} className="hover:underline">
                <h1 className="text-4xl font-bold">{profile.user_name}</h1>
              </button>
            )}
            <p className="text-emerald-500 flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4" /> Puerto Rico • {profile.check_ins} spots visitados
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Puntos", value: profile.points.toLocaleString(), icon: <Star className="w-5 h-5 text-yellow-400" /> },
              { label: "Racha", value: `${profile.streak}d 🔥`, icon: <Flame className="w-5 h-5 text-orange-400" /> },
              { label: "Badges", value: earnedBadges.length, icon: <Trophy className="w-5 h-5 text-emerald-400" /> },
            ].map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-zinc-800 rounded-3xl p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-zinc-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* XP progress bar */}
          <div className="bg-white dark:bg-zinc-800 rounded-3xl p-6 space-y-3">
            <div className="flex justify-between text-sm text-zinc-500">
              <span>Nivel {Math.floor(profile.points / POINTS_PER_LEVEL) + 1}</span>
              <span>{profile.points} / {nextLevelPoints} XP</span>
            </div>
            <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-emerald-400 rounded-full"
              />
            </div>
          </div>

          {/* Earned badges */}
          <div className="bg-white dark:bg-zinc-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-semibold text-lg">Mis Badges</h3>
            <div className="flex flex-wrap gap-4">
              {earnedBadges.map((b) => (
                <div key={b.id} className="flex flex-col items-center gap-1 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-3 rounded-2xl">
                  <span className="text-3xl">{b.emoji}</span>
                  <span className="text-xs font-semibold">{b.label}</span>
                </div>
              ))}
              {lockedBadges.map((b) => (
                <div key={b.id} title={b.desc} className="flex flex-col items-center gap-1 bg-zinc-100 dark:bg-zinc-700/40 px-4 py-3 rounded-2xl opacity-40 grayscale">
                  <span className="text-3xl">{b.emoji}</span>
                  <span className="text-xs font-semibold">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Leaderboard tab */
        <div className="bg-white dark:bg-zinc-800 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 flex items-center gap-3">
            <Trophy className="w-7 h-7 text-yellow-400" />
            <h2 className="text-2xl font-bold">Top Boricuas</h2>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-700">
            {leaderboard.map((entry, i) => (
              <motion.div
                key={entry.user_name + i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-5 px-6 py-4"
              >
                <span className={`text-2xl font-bold w-8 text-center ${i === 0 ? "text-yellow-400" : i === 1 ? "text-zinc-400" : i === 2 ? "text-orange-400" : "text-zinc-500"}`}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </span>
                <span className="text-3xl">{entry.avatar_emoji}</span>
                <div className="flex-1">
                  <div className="font-semibold">{entry.user_name}</div>
                  <div className="flex gap-1 mt-1">
                    {BADGE_CATALOG.filter((b) => entry.badges.includes(b.id)).map((b) => (
                      <span key={b.id} title={b.label}>{b.emoji}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-500">{entry.points.toLocaleString()}</div>
                  <div className="text-xs text-zinc-400">pts</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
