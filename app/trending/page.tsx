// app/trending/page.tsx
"use client";

import { useState } from "react";
import { Flame, Map } from "lucide-react";

import Spots from "./spots";
import Checkins from "./checkins";
import SportsFeed from "./sportsfeed";
import Top25 from "./top25";

export default function TrendingPage() {
  const [activeSubTab, setActiveSubTab] = useState<"spots" | "checkins" | "sports">("spots");
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [showRatingModal, setShowRatingModal] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">

      {/* Sub Tabs Header */}
      <div className="sticky top-[57px] bg-zinc-950 border-b border-zinc-800 z-50">
        <div className="max-w-md mx-auto px-4">
          <div className="flex">
            <button
              onClick={() => setActiveSubTab("spots")}
              className={`flex-1 py-4 text-sm font-medium text-center relative ${
                activeSubTab === "spots"
                  ? "text-white"
                  : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              Top 25
              {activeSubTab === "spots" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pr-red" />
              )}
            </button>

            <button
              onClick={() => setActiveSubTab("checkins")}
              className={`flex-1 py-4 text-sm font-medium text-center relative ${
                activeSubTab === "checkins"
                  ? "text-white"
                  : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              Check-ins
              {activeSubTab === "checkins" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pr-red" />
              )}
            </button>

            <button
              onClick={() => setActiveSubTab("sports")}
              className={`flex-1 py-4 text-sm font-medium text-center relative ${
                activeSubTab === "sports"
                  ? "text-white"
                  : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              Sports
              {activeSubTab === "sports" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pr-red" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Top 25 Section - Improved spacing */}
      {activeSubTab === "spots" && (
        <div className="max-w-md mx-auto px-4 pt-3">
          
          {/* Title + Map Button */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-pr-red" />
              <h1 className="text-white text-xl font-bold">Top 25 🇵🇷</h1>
            </div>

            <button
              onClick={() =>
                setViewMode(viewMode === "list" ? "map" : "list")
              }
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 px-4 py-2 rounded-2xl text-sm font-medium border border-zinc-700"
            >
              <Map className="w-4 h-4" />
              {viewMode === "list" ? "Ver Mapa" : "Ver Lista"}
            </button>
          </div>

          {/* Category Filters - Tighter spacing */}
          <div className="flex gap-2 mt-1 overflow-x-auto pb-3 scrollbar-hide">
            {[
              "Todos",
              "Restaurantes",
              "Comida Rápida",
              "Bares",
              "Lounges",
              "Cigar Lounges",
              "Cafés",
              "Lechoneras",
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-3xl text-sm font-medium whitespace-nowrap flex-shrink-0 ${
                  activeCategory === cat
                    ? "bg-pr-red text-white"
                    : "bg-zinc-900 text-zinc-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 pt-2 pb-6">

        {activeSubTab === "spots" && (
          <Top25 activeCategory={activeCategory} />
        )}

        {activeSubTab === "checkins" && <Checkins />}
        {activeSubTab === "sports" && <SportsFeed />}

      </div>

    </div>
  );
}