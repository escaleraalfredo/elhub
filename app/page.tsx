// app/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"para-ti" | "noticias">("para-ti");

  return (
    <div className="min-h-screen bg-[#09090b] pb-20">
      {/* Sub Tabs - Para Ti | Noticias */}
      <div className="sticky top-[57px] bg-zinc-950 border-b border-zinc-800 z-40">
        <div className="max-w-md mx-auto flex">
          <button
            onClick={() => setActiveTab("para-ti")}
            className={`flex-1 py-4 text-sm font-medium transition-all ${
              activeTab === "para-ti" 
                ? "text-pr-red border-b-2 border-pr-red" 
                : "text-zinc-400"
            }`}
          >
            Para Ti
          </button>
          <Link
            href="/noticias"
            onClick={() => setActiveTab("noticias")}
            className={`flex-1 py-4 text-sm font-medium transition-all text-center ${
              activeTab === "noticias" 
                ? "text-pr-red border-b-2 border-pr-red" 
                : "text-zinc-400"
            }`}
          >
            Noticias
          </Link>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6">
        {activeTab === "para-ti" && (
          <div className="space-y-6">
            <div className="card p-6">
              <p className="text-sm text-zinc-400">Lo que pasa hoy en PR</p>
              <h2 className="text-2xl font-bold mt-2">Buenas tardes, Boricua 🔥</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Link 
                href="/trending" 
                className="card p-5 hover:bg-zinc-800/80 transition-all active:scale-[0.985]"
              >
                <div className="text-3xl mb-3">🔥</div>
                <h3 className="font-semibold">Trending Spots</h3>
                <p className="text-xs text-zinc-500 mt-1">Ver qué está prendido ahora</p>
              </Link>

              <Link 
                href="/reels" 
                className="card p-5 hover:bg-zinc-800/80 transition-all active:scale-[0.985]"
              >
                <div className="text-3xl mb-3">🎥</div>
                <h3 className="font-semibold">Reels</h3>
                <p className="text-xs text-zinc-500 mt-1">Videos cortos del momento</p>
              </Link>
            </div>
          </div>
        )}

        {activeTab === "noticias" && (
          <div className="py-8 text-center">
            <Link 
              href="/noticias" 
              className="block card p-8 text-center hover:bg-zinc-800/80 transition-all active:scale-[0.985]"
            >
              <p className="text-xl font-semibold">Ver todas las noticias →</p>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}