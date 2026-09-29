// app/trending/page.tsx
"use client";

import { useState } from "react";
import { Map } from "lucide-react";
import { Chips, PageContent, PageShell, StickyBar, Tabs } from "@/components/ui/Page";
import Spots from "./spots";
import Eventos from "./eventos";

const CATEGORIES = ["Todos", "Restaurantes", "Comida Rápida", "Bares", "Lounges", "Cigar Lounges", "Cafés", "Lechoneras"] as const;
type Category = (typeof CATEGORIES)[number];

export default function TrendingPage() {
  const [tab, setTab] = useState<"eventos" | "spots">("eventos");
  const [category, setCategory] = useState<Category>("Todos");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  return (
    <PageShell>
      <StickyBar>
        <Tabs
          active={tab}
          onChange={(v) => setTab(v as "eventos" | "spots")}
          tabs={[
            { label: "Eventos", value: "eventos" },
            { label: "Spots", value: "spots" },
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
        {tab === "eventos" ? (
          <Eventos />
        ) : (
          <Spots activeCategory={category} viewMode={viewMode} setShowRatingModal={() => {}} />
        )}
      </PageContent>
    </PageShell>
  );
}
