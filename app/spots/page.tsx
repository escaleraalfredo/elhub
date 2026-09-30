// app/spots/page.tsx
"use client";

import { useState } from "react";
import { Map } from "lucide-react";
import { Chips, PageContent, PageHeader, PageShell } from "@/components/ui/Page";
import Spots from "@/components/spots/Spots";

const CATEGORIES = ["Todos", "Restaurantes", "Comida Rápida", "Bares", "Lounges", "Cigar Lounges", "Cafés", "Lechoneras"] as const;
type Category = (typeof CATEGORIES)[number];

export default function SpotsPage() {
  const [category, setCategory] = useState<Category>("Todos");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  return (
    <PageShell>
      <PageHeader
        title="Spots 🇵🇷"
        subtitle="Dónde comer, beber y janguear"
        back
        right={
          <button
            onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 px-3.5 py-1.5 rounded-full text-sm font-medium border border-zinc-800"
          >
            <Map className="w-4 h-4" />
            {viewMode === "list" ? "Mapa" : "Lista"}
          </button>
        }
      />
      <div className="max-w-md mx-auto">
        <Chips options={CATEGORIES} active={category} onChange={setCategory} className="pb-0" />
      </div>
      <PageContent>
        <Spots activeCategory={category} viewMode={viewMode} setShowRatingModal={() => {}} />
      </PageContent>
    </PageShell>
  );
}
