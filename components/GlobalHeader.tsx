// components/GlobalHeader.tsx
"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGamification } from "@/lib/gamificationContext";

export default function GlobalHeader() {
  const router = useRouter();
  const { points, level } = useGamification();

  // Progress calculation (1000 pts per level)
  const progress = Math.min(((points % 1000) / 1000) * 100, 100);

  return (
    <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 z-50">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-pr-red rounded-full flex items-center justify-center text-sm">
            🇵🇷
          </div>
          <span className="font-bold text-xl text-white">ElHub</span>
        </div>

        {/* Points, Level & Progress Bar - Centered */}
        <div className="flex flex-col items-center flex-1 px-4">
          <div className="bg-zinc-900 px-4 py-1.5 rounded-full flex items-center gap-2 text-sm">
            <span className="text-yellow-400">★</span>
            <span className="font-semibold">{points} pts</span>
            <span className="text-zinc-500">•</span>
            <span className="text-emerald-400 font-medium">Nivel {level}</span>
          </div>

          {/* Progress Bar - Perfectly centered */}
          <div className="w-full max-w-[140px] h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-pr-red transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Notifications Icon */}
        <button
          onClick={() => router.push("/notifications")}
          className="p-2 text-zinc-400 hover:text-white transition-colors relative"
        >
          <Bell className="w-6 h-6" />
          {/* Red dot for unread notifications */}
          <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
        </button>
      </div>
    </div>
  );
}