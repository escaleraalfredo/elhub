"use client";

import { useState } from "react";
import { MapPin, Star, Map } from "lucide-react";

type Spot = {
  id: string;
  name: string;
  category: string;
  location: string;
  image: string;
  score: number;
  reviews: number;
  description: string;
  type: string;
};

interface SpotsProps {
  activeCategory: string;
  viewMode: "list" | "map";
  setShowRatingModal: (id: string | null) => void;
}

export default function Spots({ activeCategory, viewMode, setShowRatingModal }: SpotsProps) {
  const [rankedSpots] = useState<Spot[]>([
    {
      id: "r1",
      name: "El Jibarito",
      category: "Restaurantes",
      location: "San Juan, PR",
      image: "https://picsum.photos/id/1015/600/400",
      score: 9.4,
      reviews: 1247,
      description: "El mejor mofongo del país. Dave Portnoy would give this a solid 9.2 One Bite.",
      type: "Puerto Rican"
    },
    {
      id: "r2",
      name: "La Placita Burger",
      category: "Comida Rápida",
      location: "Santurce, PR",
      image: "https://picsum.photos/id/870/600/400",
      score: 8.9,
      reviews: 892,
      description: "La mejor smash burger de la isla.",
      type: "Burger"
    },
    {
      id: "r3",
      name: "El Cielo Bar",
      category: "Bares",
      location: "Old San Juan, PR",
      image: "https://picsum.photos/id/201/600/400",
      score: 9.7,
      reviews: 634,
      description: "Piña coladas que te llevan al cielo.",
      type: "Cocktails"
    },
    {
      id: "r4",
      name: "Cigar Lounge 787",
      category: "Cigar Lounges",
      location: "Condado, PR",
      image: "https://picsum.photos/id/133/600/400",
      score: 9.1,
      reviews: 312,
      description: "Puros cubanos + ron viejo.",
      type: "Cigars"
    },
    {
      id: "r5",
      name: "Lechonera Los Pinos",
      category: "Lechoneras",
      location: "Guavate, PR",
      image: "https://picsum.photos/id/64/600/400",
      score: 9.8,
      reviews: 2156,
      description: "Lechón asado que te hace llorar de felicidad.",
      type: "Lechonera"
    }
  ]);

  const filteredSpots = rankedSpots.filter(spot => 
    activeCategory === "Todos" || spot.category === activeCategory
  );

  if (viewMode === "map") {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl h-[560px] flex flex-col items-center justify-center text-center p-8">
        <Map className="w-16 h-16 text-zinc-500 mb-6" />
        <h3 className="text-white text-2xl font-bold">Mapa de Rankings 🇵🇷</h3>
        <p className="text-zinc-400 mt-2">Próximamente: mapa interactivo con pines</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filteredSpots.map((spot) => (
        <div 
          key={spot.id} 
          className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-zinc-700 transition-colors"
        >
          <div className="relative">
            <img 
              src={spot.image} 
              alt={spot.name} 
              className="w-full h-56 object-cover" 
            />
            <div className="absolute top-4 right-4 bg-black/80 text-white px-4 py-2 rounded-2xl font-bold text-3xl flex items-baseline gap-1">
              {spot.score}
              <span className="text-xs font-normal opacity-70">/10</span>
            </div>
          </div>

          <div className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white font-bold text-2xl">{spot.name}</h3>
                <div className="flex items-center gap-1 text-zinc-400 text-sm mt-1">
                  <MapPin className="w-4 h-4" />
                  {spot.location}
                </div>
                <div className="text-pr-red text-xs font-medium mt-3">{spot.type}</div>
              </div>

              <button
                onClick={() => setShowRatingModal(spot.id)}
                className="bg-pr-red hover:bg-red-600 text-white text-sm font-semibold px-6 py-3 rounded-2xl transition-all active:scale-95"
              >
                Rate it
              </button>
            </div>

            <p className="text-zinc-400 text-sm leading-relaxed mt-4">
              {spot.description}
            </p>

            <div className="text-xs text-zinc-500 flex items-center gap-2 mt-6">
              <Star className="w-4 h-4 fill-current text-amber-400" />
              {spot.reviews} ratings • Boricua approved
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}