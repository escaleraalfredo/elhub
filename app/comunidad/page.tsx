"use client";

import { useState, useMemo } from "react";
import { ArrowUp, ArrowDown, MessageCircle, ChevronDown, Plus } from "lucide-react";
import { useGamification } from "@/lib/gamificationContext";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function TemasPage() {
  const router = useRouter();
  const { addPoints } = useGamification();

  const [activeFilter, setActiveFilter] = useState<"Todos" | "Política" | "Comida" | "Música" | "Deportes" | "Isla" | "Otros">("Todos");
  const [showFilters, setShowFilters] = useState(false);

  const [topics, setTopics] = useState([
    {
      id: 1,
      title: "¿Qué opinan de la nueva ley de marihuana en PR?",
      username: "@bayamonero",
      votes: 142,
      userVote: null as "up" | "down" | null,
      comments: 47,
      time: "2h",
      category: "Política",
    },
    {
      id: 2,
      title: "Recomienden chinchorros buenos y baratos en Piñones este fin de semana",
      username: "@playero_pr",
      votes: 96,
      userVote: null as "up" | "down" | null,
      comments: 62,
      time: "5h",
      category: "Comida",
    },
    {
      id: 3,
      title: "Bad Bunny vs Residente: ¿Quién ganó el último round de verdad?",
      username: "@santurcevibes",
      votes: 203,
      userVote: "up" as "up" | "down" | null,
      comments: 81,
      time: "11h",
      category: "Música",
    },
    {
      id: 4,
      title: "Cuál es el mejor kiosko de alcapurrias en toda la isla? (serio)",
      username: "@luquillense",
      votes: 78,
      userVote: null as "up" | "down" | null,
      comments: 39,
      time: "1d",
      category: "Comida",
    },
  ]);

  const filteredTopics = useMemo(() => {
    if (activeFilter === "Todos") return topics;
    return topics.filter(t => t.category === activeFilter);
  }, [topics, activeFilter]);

  const handleVote = (topicId: number, direction: "up" | "down") => {
    setTopics(prev => prev.map(topic => {
      if (topic.id !== topicId) return topic;

      let newVotes = topic.votes;
      let newUserVote = topic.userVote;

      if (topic.userVote === direction) {
        newVotes = direction === "up" ? newVotes - 1 : newVotes + 1;
        newUserVote = null;
      } else {
        if (topic.userVote === "up") newVotes -= 1;
        if (topic.userVote === "down") newVotes += 1;
        newVotes = direction === "up" ? newVotes + 1 : newVotes - 1;
        newUserVote = direction;

        addPoints(3, "Topic vote");
        toast.success(direction === "up" ? "↑ Voto positivo +3 pts" : "↓ Voto registrado");
      }

      return { ...topic, votes: newVotes, userVote: newUserVote };
    }));
  };

  const openTopic = (topic: any) => {
    router.push(`/comunidad/temas/${topic.id}`);
  };

  const categories = ["Todos", "Política", "Comida", "Música", "Deportes", "Isla", "Otros"];

  const selectFilter = (cat: typeof activeFilter) => {
    setActiveFilter(cat);
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      {/* Sticky Filter Bar */}
      <div className="sticky top-[114px] bg-zinc-950 border-b border-zinc-800 z-40">
        <div className="max-w-md mx-auto px-4 py-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between bg-zinc-900 hover:bg-zinc-800 transition-all rounded-2xl px-4 py-2.5 text-sm border border-zinc-800"
          >
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-400">Filtrar por</span>
              <span className="font-semibold text-pr-red">{activeFilter}</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          {showFilters && (
            <div className="absolute left-4 right-4 mt-2 bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl py-1 z-50 overflow-hidden">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => selectFilter(cat as any)}
                  className={`w-full text-left px-5 py-3 text-sm hover:bg-zinc-800 transition-all flex justify-between items-center ${
                    activeFilter === cat ? "text-pr-red font-medium bg-zinc-800/50" : "text-zinc-300"
                  }`}
                >
                  {cat}
                  {activeFilter === cat && <span className="text-xs">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Topics List */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {filteredTopics.map((topic) => (
          <div 
            key={topic.id}
            onClick={() => openTopic(topic)}
            className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer active:scale-[0.985]"
          >
            <div className="flex">
              <div className="w-14 bg-zinc-950 flex flex-col items-center py-4 border-r border-zinc-800">
                <button
                  onClick={(e) => { e.stopPropagation(); handleVote(topic.id, "up"); }}
                  className={`p-1 transition-all ${topic.userVote === "up" ? "text-pr-red" : "text-zinc-400 hover:text-white"}`}
                >
                  <ArrowUp className={`w-7 h-7 ${topic.userVote === "up" ? "fill-pr-red" : ""}`} />
                </button>

                <div className={`font-bold text-lg my-1 transition-colors ${topic.userVote === "up" ? "text-pr-red" : topic.userVote === "down" ? "text-red-500" : "text-white"}`}>
                  {topic.votes}
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); handleVote(topic.id, "down"); }}
                  className={`p-1 transition-all ${topic.userVote === "down" ? "text-red-500" : "text-zinc-400 hover:text-white"}`}
                >
                  <ArrowDown className={`w-7 h-7 ${topic.userVote === "down" ? "fill-red-500" : ""}`} />
                </button>
              </div>

              <div className="flex-1 p-5">
                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
                  <span>{topic.username}</span>
                  <span>·</span>
                  <span>{topic.time}</span>
                  <span className="ml-auto px-3 py-0.5 bg-zinc-800 rounded-full text-[10px]">
                    {topic.category}
                  </span>
                </div>
                <h3 className="font-semibold text-[17px] leading-tight mb-4">
                  {topic.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <MessageCircle className="w-5 h-5" />
                  <span>{topic.comments} comentarios</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}