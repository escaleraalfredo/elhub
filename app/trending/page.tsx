"use client";

import { useState } from "react";
import { Flame, Map, ChevronDown } from "lucide-react";

import Spots from "./spots";
import Checkins from "./checkins";
import SportsFeed from "./sportsfeed";

export default function TrendingPage() {
  const [activeSubTab, setActiveSubTab] = useState<"spots" | "checkins" | "sports">("spots");
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("Más altos");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [showRatingModal, setShowRatingModal] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#09090b] pb-20">

      {/* Sticky Header */}
      <div className="sticky top-[57px] bg-zinc-950 border-b border-zinc-800 z-40">
        <div className="max-w-md mx-auto px-4 py-3">

          {/* Tabs: Spots | Check-ins | Sports */}
          <div className="flex border-b border-zinc-800">
            <button
              onClick={() => setActiveSubTab("spots")}
              className={`flex-1 py-3 font-medium transition-colors ${
                activeSubTab === "spots" ? "text-white border-b-2 border-pr-red" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Spots
            </button>
            <button
              onClick={() => setActiveSubTab("checkins")}
              className={`flex-1 py-3 font-medium transition-colors ${
                activeSubTab === "checkins" ? "text-white border-b-2 border-pr-red" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Check-ins
            </button>
            <button
              onClick={() => setActiveSubTab("sports")}
              className={`flex-1 py-3 font-medium transition-colors ${
                activeSubTab === "sports" ? "text-white border-b-2 border-pr-red" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Sports
            </button>
          </div>

          {/* Extra UI only for Spots tab */}
          {activeSubTab === "spots" && (
            <>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-6 h-6 text-pr-red" />
                  <h1 className="text-white text-xl font-bold">Rankings 🇵🇷</h1>
                </div>

                <button
                  onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
                  className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 px-4 py-2 rounded-2xl text-sm font-medium border border-zinc-700"
                >
                  <Map className="w-4 h-4" />
                  {viewMode === "list" ? "Ver Mapa" : "Ver Lista"}
                </button>
              </div>

              <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                {["Todos", "Restaurantes", "Comida Rápida", "Bares", "Lounges", "Cigar Lounges", "Cafés", "Lechoneras"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-3xl text-sm font-medium whitespace-nowrap transition-all ${
                      activeCategory === cat ? "bg-pr-red text-white" : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end mt-3 pr-1">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm"
                >
                  <span className="font-medium">{activeFilter}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-md mx-auto px-4 py-6">
        {activeSubTab === "spots" && (
          <Spots 
            activeCategory={activeCategory} 
            viewMode={viewMode} 
            setShowRatingModal={setShowRatingModal} 
          />
        )}
        {activeSubTab === "checkins" && <Checkins />}
        {activeSubTab === "sports" && <SportsFeed />}
      </div>

    </div>
  );
}