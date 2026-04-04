"use client";
import BottomNav from "@/components/BottomNav";

export default function DealsPage() {
  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold tracking-tight">Deals</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-8 text-center">
          <p className="text-4xl mb-4">🏷️</p>
          <h3 className="text-xl font-semibold mb-2">Deals & Ofertas</h3>
          <p className="text-zinc-400">Las mejores ofertas del día en Puerto Rico</p>
          <p className="text-sm text-zinc-500 mt-8">Próximamente...</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}