// app/trending/page.tsx
"use client";

import { useState } from "react";
import { Map } from "lucide-react";
import { Chips, PageContent, PageShell, StickyBar, Tabs } from "@/components/ui/Page";
import Spots from "./spots";
import Checkins from "./checkins";

const CATEGORIES = ["Todos", "Restaurantes", "Comida Rápida", "Bares", "Lounges", "Cigar Lounges", "Cafés", "Lechoneras"] as const;
type Category = (typeof CATEGORIES)[number];

export default function TrendingPage() {
  const [tab, setTab] = useState<"spots" | "checkins">("spots");
  const [category, setCategory] = useState<Category>("Todos");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  return (
    <PageShell>
      <StickyBar>
        <Tabs
          active={tab}
          onChange={(v) => setTab(v as "spots" | "checkins")}
          tabs={[
            { label: "Spots", value: "spots" },
            { label: "Check-ins", value: "checkins" },
          ]}
        />
      </StickyBar>

      {tab === "spots" && (
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between px-4 pt-4">
            <h1 className="text-lg font-bold">Rankings 🇵🇷</h1>
            <button
              onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 px-3.5 py-1.5 rounded-full text-sm font-medium border border-zinc-800"
            >
              <Map className="w-4 h-4" />
              {viewMode === "list" ? "Ver mapa" : "Ver lista"}
            </button>
          </div>
          <Chips options={CATEGORIES} active={category} onChange={setCategory} className="pb-0" />
        </div>
      )}

      <PageContent>
        {tab === "spots" ? (
          <Spots activeCategory={category} viewMode={viewMode} setShowRatingModal={() => {}} />
        ) : (
          <Checkins />
        )}
      </PageContent>
    </PageShell>
  );
}
