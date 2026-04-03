"use client";

import { useState } from "react";
import { Users, Camera, Heart } from "lucide-react";
import { useGamification } from "@/lib/gamificationContext";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

export default function TrendingPage() {
  const { addPoints } = useGamification();
  const [activeSubTab, setActiveSubTab] = useState<"spots" | "eventos">("spots");

  const [spots] = useState([
    {
      id: 1,
      name: "La Placita",
      location: "Santurce",
      peopleHere: 87,
      vibe: "🔥 Prendida",
      checkedIn: false,
      likes: 234,
    },
    {
      id: 2,
      name: "Playa Luquillo",
      location: "Luquillo",
      peopleHere: 42,
      vibe: "🌊 Chill",
      checkedIn: false,
      likes: 189,
    },
  ]);

  const handleCheckIn = (id: number) => {
    addPoints(50, "Check-in");
    toast.success("¡Check-in exitoso! +50 pts");
  };

  const handleLike = (id: number) => {
    addPoints(2, "Spot like");
  };

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      {/* Small Sub Tabs - Stuck right under Global Header */}
      <div className="sticky top-[57px] bg-zinc-950 border-b border-zinc-800 z-40">
        <div className="max-w-md mx-auto flex">
          <button
            onClick={() => setActiveSubTab("spots")}
            className={`flex-1 py-4 text-sm font-medium transition-all ${
              activeSubTab === "spots" 
                ? "text-pr-red border-b-2 border-pr-red" 
                : "text-zinc-400"
            }`}
          >
            Spots
          </button>
          <button
            onClick={() => setActiveSubTab("eventos")}
            className={`flex-1 py-4 text-sm font-medium transition-all ${
              activeSubTab === "eventos" 
                ? "text-pr-red border-b-2 border-pr-red" 
                : "text-zinc-400"
            }`}
          >
            Eventos
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 pt-6 space-y-4">
        {activeSubTab === "spots" && (
          <div className="space-y-4">
            {spots.map((spot) => (
              <div key={spot.id} className="bg-zinc-900 rounded-3xl p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-xl">{spot.name}</h3>
                    <p className="text-zinc-400">{spot.location}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-pr-red">
                      <Users className="w-5 h-5" />
                      <span className="font-medium">{spot.peopleHere}</span>
                    </div>
                    <p className="text-xs text-zinc-500">aquí ahora</p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-zinc-400">{spot.vibe}</p>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => handleCheckIn(spot.id)}
                    className="flex-1 py-3 bg-pr-red rounded-2xl font-medium flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                  >
                    <Camera className="w-5 h-5" />
                    Check-in
                  </button>

                  <button
                    onClick={() => handleLike(spot.id)}
                    className="flex-1 py-3 bg-zinc-800 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-zinc-700 transition-all"
                  >
                    <Heart className="w-5 h-5" />
                    {spot.likes}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSubTab === "eventos" && (
          <div className="bg-zinc-900 rounded-3xl p-12 text-center">
            <p className="text-zinc-400">Próximos eventos aparecerán aquí pronto</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}