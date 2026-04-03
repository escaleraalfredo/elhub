"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { useGamification } from "@/lib/gamificationContext";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

export default function PueblosPage() {
  const { addPoints } = useGamification();

  const [pueblos, setPueblos] = useState([
    { 
      id: 1, 
      name: "La Placita", 
      location: "Santurce", 
      peopleHere: 87, 
      vibe: "🔥 Prendida", 
      checkedIn: false 
    },
    { 
      id: 2, 
      name: "Playa Luquillo", 
      location: "Luquillo", 
      peopleHere: 42, 
      vibe: "🌊 Chill", 
      checkedIn: false 
    },
    { 
      id: 3, 
      name: "Parque Lineal", 
      location: "Bayamón", 
      peopleHere: 19, 
      vibe: "🏀 Deportivo", 
      checkedIn: false 
    },
    { 
      id: 4, 
      name: "Chinchorros de Piñones", 
      location: "Loíza", 
      peopleHere: 64, 
      vibe: "🍺 Chinchorreo", 
      checkedIn: false 
    },
  ]);

  const handleCheckIn = (id: number) => {
    setPueblos(prev => prev.map(pueblo => {
      if (pueblo.id === id) {
        const newPeople = pueblo.checkedIn ? pueblo.peopleHere - 1 : pueblo.peopleHere + 1;
        if (!pueblo.checkedIn) {
          addPoints(30, "Pueblo check-in");
          toast.success(`¡Check-in en ${pueblo.name}! +30 pts 🔥`);
        }
        return { ...pueblo, peopleHere: newPeople, checkedIn: !pueblo.checkedIn };
      }
      return pueblo;
    }));
  };

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {pueblos.map((pueblo) => (
          <div key={pueblo.id} className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-xl">{pueblo.name}</h3>
                <p className="text-zinc-400">{pueblo.location}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-pr-red">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">{pueblo.peopleHere}</span>
                </div>
                <p className="text-xs text-zinc-500">aquí ahora</p>
              </div>
            </div>

            <div className="mt-4 text-sm text-zinc-400">{pueblo.vibe}</div>

            <button
              onClick={() => handleCheckIn(pueblo.id)}
              className={`mt-6 w-full py-3 rounded-2xl font-medium transition-all ${
                pueblo.checkedIn 
                  ? "bg-zinc-800 text-zinc-400" 
                  : "bg-pr-red text-white hover:brightness-110"
              }`}
            >
              {pueblo.checkedIn ? "✓ Ya estoy aquí" : "Check-in ahora"}
            </button>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}