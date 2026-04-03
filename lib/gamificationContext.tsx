// lib/gamificationContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface GamificationContextType {
  points: number;
  streak: number;
  level: number;
  addPoints: (amount: number, reason?: string) => void;
  checkIn: () => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [points, setPoints] = useState(1250);   // starting points so you can see progress
  const [streak, setStreak] = useState(7);
  const [level, setLevel] = useState(3);

  const calculateLevel = (totalPoints: number) => Math.floor(totalPoints / 500) + 1;

  const addPoints = (amount: number, reason = "Action") => {
    setPoints(prev => {
      const newPoints = Math.floor(prev + amount); // avoid decimals
      const newLevel = calculateLevel(newPoints);

      if (newLevel > level) {
        console.log(`🎉 Level Up! You reached Level ${newLevel}`);
        // You can add toast notification later
      }
      return newPoints;
    });
  };

  const checkIn = () => addPoints(50, "Check-in");

  return (
    <GamificationContext.Provider value={{ points, streak, level, addPoints, checkIn }}>
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