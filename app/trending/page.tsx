// app/trending/page.tsx  (or wherever your Trending component is)
"use client";

import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import SportsFeed from "./SportsFeed"; // We'll create this next

export default function TrendingPage() {
  const [activeTab, setActiveTab] = useState<"Spots" | "Check-ins" | "Sports">("Spots");

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      {/* Sub Tab Bar - Consistent with Para Ti / Comunidad */}
      <div className="sticky top-[114px] bg-zinc-950 border-b border-zinc-800 z-40">
        <div className="max-w-md mx-auto px-4">
          <div className="flex">
            <button
              onClick={() => setActiveTab("Spots")}
              className={`flex-1 py-4 text-sm font-medium text-center transition-all relative ${
                activeTab === "Spots" ? "text-white" : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              Spots
              {activeTab === "Spots" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-pr-red rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("Check-ins")}
              className={`flex-1 py-4 text-sm font-medium text-center transition-all relative ${
                activeTab === "Check-ins" ? "text-white" : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              Check-ins
              {activeTab === "Check-ins" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-pr-red rounded-full" />
              )}
            </button>

            {/* New Sports Tab */}
            <button
              onClick={() => setActiveTab("Sports")}
              className={`flex-1 py-4 text-sm font-medium text-center transition-all relative ${
                activeTab === "Sports" ? "text-white" : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              Sports
              {activeTab === "Sports" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-pr-red rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {activeTab === "Spots" && (
          <div className="text-center py-12 text-zinc-500">
            Spots content goes here
          </div>
        )}

        {activeTab === "Check-ins" && (
          <div className="text-center py-12 text-zinc-500">
            Check-ins content goes here
          </div>
        )}

        {activeTab === "Sports" && <SportsFeed />}
      </div>

      <BottomNav />
    </div>
  );
}