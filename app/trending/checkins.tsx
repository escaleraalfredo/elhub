"use client";

import { Trophy, Users } from "lucide-react";

export default function Checkins() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <div className="mb-8">
        <div className="w-24 h-24 mx-auto bg-zinc-900 rounded-3xl flex items-center justify-center border border-zinc-700">
          <Users className="w-12 h-12 text-pr-red" />
        </div>
      </div>

      <Trophy className="w-16 h-16 text-amber-400 mb-6" />

      <h2 className="text-3xl font-bold text-white mb-3">
        Check-ins en vivo
      </h2>

      <p className="text-zinc-400 text-lg max-w-[280px] mx-auto leading-relaxed">
        Pronto verás quién está en los mejores spots de Puerto Rico en tiempo real.
      </p>

      <div className="mt-12 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-[320px]">
        <div className="text-sm text-zinc-500 mb-2">Próximamente</div>
        <div className="text-white font-medium">
          • Realtime check-ins via Supabase<br />
          • Mapa con gente activa<br />
          • Notificaciones cuando tus amigos checkean
        </div>
      </div>

      <div className="mt-16 text-xs text-zinc-600">
        Powered by Supabase Realtime
      </div>
    </div>
  );
}