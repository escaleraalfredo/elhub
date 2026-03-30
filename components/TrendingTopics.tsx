"use client";
import { motion } from "framer-motion";
import { TrendingUp, Flame } from "lucide-react";

const trending = [
  {
    rank: 1,
    title: "Nuevo aumento de tarifas de LUMA genera fuerte reacción",
    source: "El Nuevo Día",
    comments: 1240,
    emoji: "🔥"
  },
  {
    rank: 2,
    title: "La Placita está en fuego este fin de semana",
    source: "Primera Hora",
    comments: 892,
    emoji: "🌴"
  },
  {
    rank: 3,
    title: "Puerto Rico gana clave partido en Serie del Caribe",
    source: "Metro PR",
    comments: 674,
    emoji: "⚾"
  },
];

export default function TrendingTopics() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-10">
        <TrendingUp className="w-10 h-10 text-orange-500" />
        <h1 className="text-5xl font-bold tracking-tight">Lo que está pegando</h1>
      </div>

      <div className="space-y-6">
        {trending.map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-zinc-800 rounded-3xl p-8 flex gap-8 items-center border border-zinc-200 dark:border-zinc-700 shadow-xl"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-3xl font-bold text-orange-500">
              {item.rank}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{item.emoji}</span>
                <h3 className="text-2xl font-semibold leading-tight flex-1">{item.title}</h3>
              </div>
              <p className="text-zinc-500 mt-3">
                {item.source} • {item.comments.toLocaleString()} comentarios
              </p>
            </div>

            <Flame className="w-8 h-8 text-orange-500" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}