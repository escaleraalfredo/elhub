"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { useGamification } from "@/lib/gamificationContext";

export default function GlobalHeader() {
  const { points, level } = useGamification();

  // Calculate progress to next level (every 500 points)
  const pointsInCurrentLevel = points % 500;
  const progressPercentage = (pointsInCurrentLevel / 500) * 100;

  return (
    <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 z-50">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo - Left */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-pr-red rounded-2xl flex items-center justify-center text-white font-bold text-xl">
            🇵🇷
          </div>
          <span className="font-bold text-xl tracking-tighter">ElHub</span>
        </Link>

        {/* Center Section - Points, Level & Progress Bar */}
        <div className="flex flex-col items-center flex-1 px-4">
          <div className="flex items-center gap-3 bg-zinc-900 rounded-2xl px-5 py-1.5">
            <div className="text-sm font-medium text-white">
              {points.toLocaleString()} pts
            </div>
            <div className="text-xs text-zinc-400">•</div>
            <div className="text-sm font-semibold text-pr-red">
              Nivel {level}
            </div>
          </div>

          {/* Tiny Centered Progress Bar */}
          <div className="w-40 h-0.5 bg-zinc-800 rounded-full overflow-hidden mt-1.5">
            <div 
              className="h-full bg-gradient-to-r from-pr-red to-orange-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Settings - Right */}
        <Link href="/settings" className="text-zinc-400 hover:text-white p-2 flex-shrink-0">
          <Settings className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}