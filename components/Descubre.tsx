"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Clock, Plus } from "lucide-react";
import SpotDetailModal from "./SpotDetailModal";
import AddSpotModal from "./AddSpotModal";

const initialSpots = [
  { id: 1, name: "La Factoría", category: "Bar • La Placita", rating: 4.9, reviews: 1243, price: "$$$", open: true, vibe: "🔥" },
  { id: 2, name: "El Patio de Choco", category: "Restaurante • Santurce", rating: 4.8, reviews: 892, price: "$$", open: true, vibe: "🌶️" },
  { id: 3, name: "Jungle Bird", category: "Cocktail Bar • Condado", rating: 4.9, reviews: 674, price: "$$$", open: false, vibe: "🍹" },
];

export default function Descubre() {
  const [spots, setSpots] = useState(initialSpots);
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-5xl font-bold">Descubre lugares</h1>
        <button onClick={() => setAddModalOpen(true)} className="flex items-center gap-2 bg-emerald-400 text-black px-6 py-3 rounded-3xl font-semibold">
          <Plus /> Añadir Spot
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {spots.map((spot) => (
          <motion.div
            key={spot.id}
            whileHover={{ y: -10 }}
            onClick={() => setSelectedSpot(spot)}
            className="bg-white dark:bg-zinc-800 rounded-3xl overflow-hidden shadow-2xl cursor-pointer"
          >
            {/* Same card as before - keep your previous card code here */}
            <div className="relative">
              <div className="h-52 bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center text-7xl">
                {spot.vibe}
              </div>
              <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} className="absolute top-4 right-4 text-6xl">
                {spot.vibe}
              </motion.div>
              {spot.open && <div className="absolute top-4 left-4 bg-emerald-500 text-white text-xs px-4 py-1 rounded-3xl">Abierto ahora</div>}
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold">{spot.name}</h3>
              <p className="text-zinc-500">{spot.category}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <SpotDetailModal spot={selectedSpot} isOpen={!!selectedSpot} onClose={() => setSelectedSpot(null)} />
      <AddSpotModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}