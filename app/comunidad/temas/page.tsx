// app/comunidad/temas/page.tsx
"use client";
import { useState, useMemo } from "react";
import { ArrowUp, ArrowDown, MessageCircle, ChevronDown } from "lucide-react";
import { useGamification } from "@/lib/gamificationContext";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import UnifiedFAB from "@/components/UnifiedFAB";
import UnifiedCard from "@/components/UnifiedCard";

export default function TemasPage() {
  const router = useRouter();
  const { addPoints } = useGamification();
  
  const [activeFilter, setActiveFilter] = useState<"Todos" | "Política" | "Comida" | "Música" | "Deportes" | "Isla" | "Otros" | "Fiestas" | "Transporte" | "Tecnología" | "Cultura">("Todos");
  const [showFilters, setShowFilters] = useState(false);
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);

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

  const [newTopic, setNewTopic] = useState({
    title: "",
    category: "Otros" as "Política" | "Comida" | "Música" | "Deportes" | "Isla" | "Otros" | "Fiestas" | "Transporte" | "Tecnología" | "Cultura",
  });

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

      return { ...topic, votes: Math.max(0, newVotes), userVote: newUserVote };
    }));
  };

  const openTopic = (topic: any) => {
    router.push(`/comunidad/temas/${topic.id}`);
  };

  const handleCreateTopic = () => {
    if (!newTopic.title.trim()) {
      toast.error("Escribe una pregunta o tema");
      return;
    }

    const newId = Math.max(0, ...topics.map(t => t.id)) + 1;

    const topicToAdd = {
      id: newId,
      title: newTopic.title.trim(),
      username: "@tuusuario",
      votes: 0,
      userVote: null as "up" | "down" | null,
      comments: 0,
      time: "ahora",
      category: newTopic.category,
    };

    setTopics(prev => [topicToAdd, ...prev]);
    setNewTopic({ title: "", category: "Otros" });
    setShowNewTopicModal(false);

    addPoints(10, "Nuevo tema creado");
    toast.success("¡Tema creado! +10 pts");
  };

  const categories = ["Todos", "Política", "Comida", "Música", "Deportes", "Isla", "Otros", "Fiestas", "Transporte", "Tecnología", "Cultura"] as const;

  return (
    <div className="min-h-screen bg-dark-bg pb-20 relative">
      {/* Sticky Filter Bar */}
      <div className="sticky top-[114px] bg-zinc-950 border-b border-zinc-800 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex-1 flex items-center justify-between bg-zinc-900 hover:bg-zinc-800 transition-all rounded-2xl px-4 py-2.5 text-sm border border-zinc-800"
          >
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-400">Filtrar por</span>
              <span className="font-semibold text-pr-red">{activeFilter}</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        {showFilters && (
          <div className="max-w-md mx-auto px-4 pb-3">
            <div className="bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl py-1 overflow-hidden max-h-[320px] overflow-y-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveFilter(cat); setShowFilters(false); }}
                  className={`w-full text-left px-5 py-3 text-sm hover:bg-zinc-800 transition-all flex justify-between items-center ${
                    activeFilter === cat ? "text-pr-red font-medium bg-zinc-800/50" : "text-zinc-300"
                  }`}
                >
                  {cat}
                  {activeFilter === cat && <span className="text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Topics List */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {filteredTopics.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            No hay temas en esta categoría todavía.<br />¡Sé el primero en crear uno!
          </div>
        )}

        {filteredTopics.map((topic) => (
          <UnifiedCard key={topic.id} onClick={() => openTopic(topic)}>
            <div className="flex">
              {/* Voting Column */}
              <div className="w-14 bg-zinc-950 flex flex-col items-center py-4 border-r border-zinc-800">
                <button
                  onClick={(e) => { e.stopPropagation(); handleVote(topic.id, "up"); }}
                  className={`p-1 transition-all ${topic.userVote === "up" ? "text-emerald-400" : "text-zinc-400 hover:text-white"}`}
                >
                  <ArrowUp className={`w-7 h-7 ${topic.userVote === "up" ? "fill-emerald-400" : ""}`} />
                </button>

                <div className={`font-bold text-lg my-1 transition-colors ${topic.userVote === "up" ? "text-emerald-400" : topic.userVote === "down" ? "text-red-500" : "text-white"}`}>
                  {topic.votes}
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); handleVote(topic.id, "down"); }}
                  className={`p-1 transition-all ${topic.userVote === "down" ? "text-red-500" : "text-zinc-400 hover:text-white"}`}
                >
                  <ArrowDown className={`w-7 h-7 ${topic.userVote === "down" ? "fill-red-500" : ""}`} />
                </button>
              </div>

              {/* Content */}
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
          </UnifiedCard>
        ))}
      </div>

      {/* Unified Floating Action Button */}
      <UnifiedFAB onClick={() => setShowNewTopicModal(true)} />

      {/* New Topic Modal */}
      {showNewTopicModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-end md:items-center justify-center">
          <div className="bg-zinc-900 w-full max-w-md mx-auto rounded-t-3xl md:rounded-3xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Nuevo Tema</h2>
                <button
                  onClick={() => setShowNewTopicModal(false)}
                  className="text-zinc-400 hover:text-white text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              <textarea
                placeholder="¿Qué quieres discutir con la comunidad boricua?"
                value={newTopic.title}
                onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                className="w-full h-32 bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-pr-red resize-none"
              />

              <div className="mt-6">
                <p className="text-sm text-zinc-400 mb-3">Categoría</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["Política", "Comida", "Música", "Deportes", "Isla", "Fiestas", "Transporte", "Tecnología", "Cultura", "Otros"] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setNewTopic({ ...newTopic, category: cat })}
                      className={`py-3 text-sm rounded-2xl border transition-all ${
                        newTopic.category === cat
                          ? "bg-pr-red text-white border-pr-red"
                          : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateTopic}
                className="mt-8 w-full bg-pr-red hover:bg-red-600 transition-all py-4 rounded-2xl font-semibold text-lg active:scale-[0.985]"
              >
                Publicar Tema
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}