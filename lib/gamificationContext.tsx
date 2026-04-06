// lib/gamificationContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface Badge {
  id: number;
  name: string;
  icon: string;
  unlocked: boolean;
  desc: string;
}

interface GamificationContextType {
  points: number;
  level: number;
  streak: number;
  badges: Badge[];
  addPoints: (amount: number, reason: string) => void;
  unlockBadge: (badgeId: number) => void;
  checkIn: () => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [points, setPoints] = useState(1250);
  const [streak, setStreak] = useState(7);
  const [badges, setBadges] = useState<Badge[]>([
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

  const level = Math.floor(points / 1000) + 1;

  const addPoints = (amount: number, reason: string) => {
    setPoints(prev => prev + amount);
    toast.success(`+${amount} puntos`, { description: reason });
  };

  const unlockBadge = (badgeId: number) => {
    setBadges(prev => prev.map(b => 
      b.id === badgeId ? { ...b, unlocked: true } : b
    ));
    addPoints(100, `Badge desbloqueado: ${badges.find(b => b.id === badgeId)?.name}`);
    toast.success("¡Nuevo badge desbloqueado! 🎉");
  };

  const checkIn = () => {
    addPoints(25, "Check-in diario");
    // You can add streak logic here later
  };

  return (
    <GamificationContext.Provider value={{
      points,
      level,
      streak,
      badges,
      addPoints,
      unlockBadge,
      checkIn,
    }}>
      {children}
    </GamificationContext.Provider>
  );
}

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error("useGamification must be used inside GamificationProvider");
  }
  return context;
};