// app/perfil/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Award, Flame, Trophy, Calendar, Settings } from "lucide-react";
import { useGamification } from "@/lib/gamificationContext";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function PerfilPage() {
  const { points, level, streak, addPoints } = useGamification();
  const router = useRouter();
  
  const [hasClaimedDaily, setHasClaimedDaily] = useState(false);

  const [badges] = useState([
    { id: 1, name: "Primer Check-in", icon: "📍", unlocked: true, desc: "Haz tu primer check-in" },
    { id: 2, name: "Noticiero Boricua", icon: "📰", unlocked: true, desc: "10+ reacciones en noticias" },
    { id: 3, name: "Fiestero Oficial", icon: "🎉", unlocked: true, desc: "5+ check-ins en eventos" },
    { id: 4, name: "Rey del Perreo", icon: "💃", unlocked: false, desc: "50+ puntos en Reels" },
    { id: 5, name: "Embajador PR", icon: "🇵🇷", unlocked: true, desc: "30 días de racha" },
    { id: 6, name: "Chinchorro Legend", icon: "🍺", unlocked: false, desc: "10+ check-ins en chinchorros" },
    { id: 7, name: "Playa Addict", icon: "🏖️", unlocked: true, desc: "3+ check-ins en playas" },
    { id: 8, name: "La Placita VIP", icon: "🌃", unlocked: false, desc: "5+ check-ins nocturnos" },
    { id: 9, name: "Votante Activo", icon: "👍", unlocked: true, desc: "50+ votos en artículos" },
    { id: 10, name: "Boricua de Oro", icon: "🏆", unlocked: false, desc: "Alcanza nivel 10" },
    { id: 11, name: "Early Bird", icon: "🌅", unlocked: false, desc: "Login 7 días seguidos" },
    { id: 12, name: "Comentador", icon: "💬", unlocked: false, desc: "20+ comentarios publicados" },
    { id: 13, name: "Trendsetter", icon: "🔥", unlocked: true, desc: "10+ reacciones en Trending" },
    { id: 14, name: "Racha de Hierro", icon: "🔥🔥", unlocked: false, desc: "50 días de racha" },
    { id: 15, name: "ElHub Legend", icon: "👑", unlocked: false, desc: "Alcanza nivel 20" },
  ]);

  const [leaderboard] = useState([
    { rank: 1, username: "@sanjuanero", points: 12450, level: 12, avatar: "https://picsum.photos/id/64/128/128" },
    { rank: 2, username: "@playero_pr", points: 9870, level: 10, avatar: "https://picsum.photos/id/65/128/128" },
    { rank: 3, username: "@bayamonesa", points: 8450, level: 9, avatar: "https://picsum.photos/id/66/128/128" },
    { rank: 4, username: "@tuusuario", points: points, level: level, avatar: "https://picsum.photos/id/67/128/128" },
  ]);

  const progressToNextLevel = ((points % 500) / 500) * 100;

  const claimDailyBonus = () => {
    if (hasClaimedDaily) return;
    const bonus = 25 + streak * 5;
    addPoints(bonus, "Daily login bonus");
    setHasClaimedDaily(true);
    toast.success(`¡+${bonus} puntos por login diario! 🔥`, {
      description: `Racha actual: ${streak + 1} días`,
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasClaimedDaily) claimDailyBonus();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      <div className="max-w-md mx-auto">
        {/* Profile Card */}
        <div className="px-5 pt-6 pb-8 bg-zinc-900 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-gradient-to-br from-pr-red to-orange-500 rounded-3xl flex items-center justify-center text-5xl shadow-xl">👤</div>
              <div>
                <h2 className="text-2xl font-bold text-white">@tuusuario</h2>
                <p className="text-zinc-400">Nivel {level} • Boricua en la diáspora</p>
                <div className="flex items-center gap-2 mt-1">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-orange-500 font-medium">{streak} días de racha</span>
                </div>
              </div>
            </div>

            {/* Settings Icon - ONLY here now */}
            <button
              onClick={() => router.push("/settings")}
              className="p-3 text-zinc-400 hover:text-white transition-colors"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>

          {/* Daily Bonus */}
          <button
            onClick={claimDailyBonus}
            disabled={hasClaimedDaily}
            className={`mt-6 w-full py-3 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all ${
              hasClaimedDaily ? "bg-zinc-800 text-zinc-500" : "bg-gradient-to-r from-orange-500 to-pr-red text-white"
            }`}
          >
            <Calendar className="w-5 h-5" />
            {hasClaimedDaily ? "¡Bono diario reclamado hoy!" : "Reclamar bono diario"}
          </button>

          {/* Points Progress */}
          <div className="mt-8 bg-zinc-800 rounded-3xl p-5">
            <div className="flex justify-between mb-3">
              <div>
                <p className="text-zinc-400 text-sm">Puntos Totales</p>
                <p className="text-4xl font-bold text-white">{points.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-pr-red font-semibold">Nivel {level}</p>
                <p className="text-xs text-zinc-500">Siguiente en {500 - (points % 500)} pts</p>
              </div>
            </div>
            <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-pr-red to-orange-500 transition-all duration-700" 
                style={{ width: `${progressToNextLevel}%` }}
              />
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="px-5 py-6">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Award className="w-5 h-5 text-pr-red" /> Tus Badges
            </h3>
            <span className="text-xs text-zinc-500">{badges.filter(b => b.unlocked).length}/15</span>
          </div>

          {/* First Row */}
          <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide">
            {badges.slice(0, 8).map((badge) => (
              <div 
                key={badge.id} 
                className={`flex-shrink-0 w-28 aspect-square rounded-3xl flex flex-col items-center justify-center border p-3 text-center snap-start transition-all ${
                  badge.unlocked ? 'border-pr-red bg-zinc-900 shadow-sm' : 'border-zinc-800 opacity-60'
                }`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <p className="text-xs font-medium leading-tight text-center">{badge.name}</p>
                <p className="text-[10px] text-zinc-500 mt-1 text-center leading-tight">{badge.desc}</p>
              </div>
            ))}
          </div>

          {/* Second Row */}
          <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide">
            {badges.slice(8).map((badge) => (
              <div 
                key={badge.id} 
                className={`flex-shrink-0 w-28 aspect-square rounded-3xl flex flex-col items-center justify-center border p-3 text-center snap-start transition-all ${
                  badge.unlocked ? 'border-pr-red bg-zinc-900 shadow-sm' : 'border-zinc-800 opacity-60'
                }`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <p className="text-xs font-medium leading-tight text-center">{badge.name}</p>
                <p className="text-[10px] text-zinc-500 mt-1 text-center leading-tight">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="px-5 pb-8">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-pr-red" /> Top Boricuas
            </h3>
            <p className="text-xs text-zinc-500">Esta semana</p>
          </div>

          <div className="space-y-3">
            {leaderboard.map((user, index) => {
              const isUser = user.username === "@tuusuario";
              return (
                <div 
                  key={index}
                  className={`bg-zinc-900 rounded-3xl p-5 flex items-center gap-4 border transition-all ${
                    isUser ? "border-pr-red bg-pr-red/5" : "border-transparent"
                  }`}
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-2xl flex-shrink-0
                    ${index === 0 ? 'bg-yellow-400 text-black' : 
                      index === 1 ? 'bg-zinc-300 text-black' : 
                      index === 2 ? 'bg-amber-600 text-white' : 'bg-zinc-700 text-white'}`}>
                    {user.rank}
                  </div>

                  <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 border border-zinc-700">
                    <img 
                      src={user.avatar} 
                      alt={user.username} 
                      className="w-full h-full object-cover" 
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${isUser ? "text-pr-red" : "text-white"}`}>
                      {user.username}
                    </p>
                    <p className="text-xs text-zinc-500">Nivel {user.level}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{user.points.toLocaleString()}</p>
                    <p className="text-[10px] text-zinc-500 -mt-1">puntos</p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-zinc-500 mt-8">
            ¡Sigue participando para subir en el ranking global!
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}