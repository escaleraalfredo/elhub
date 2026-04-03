"use client";

import BottomNav from "@/components/BottomNav";

export default function EventosPage() {
  return (
    <div className="min-h-screen pb-20 bg-dark-bg">
      <div className="sticky top-0 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 z-40">
        <div className="max-w-md mx-auto px-4 py-5">
          <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
          <p className="text-pr-red">Fiestas, happy hours y festivales</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-2xl font-semibold mb-3">Eventos Boricuas</h2>
        <p className="text-zinc-400 max-w-xs mx-auto">
          Calendario de fiestas, actividades y eventos en la isla y la diáspora.
        </p>
        <p className="text-sm text-zinc-500 mt-8">Próximamente...</p>
      </div>

      <BottomNav />
    </div>
  );
}