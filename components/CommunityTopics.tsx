"use client";
import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { getCommunityTopics, addCommunityTopic } from "@/lib/db";
import type { CommunityTopic } from "@/lib/types";

const SEED_TOPICS: CommunityTopic[] = [
  { id: -1, text: "¿Qué opinan del nuevo aumento de LUMA?" },
  { id: -2, text: "Best mofongo in Ponce right now?" },
  { id: -3, text: "Quién va a La Placita este viernes?" },
];

export default function CommunityTopics() {
  const [topics, setTopics] = useState<CommunityTopic[]>(SEED_TOPICS);
  const [modalOpen, setModalOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCommunityTopics().then((data) => {
      if (data.length > 0) setTopics(data);
    });
  }, []);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      toast.error("Escribe un tema antes de continuar");
      return;
    }

    setLoading(true);
    const saved = await addCommunityTopic(trimmed);

    if (saved) {
      setTopics((prev) => [...prev, saved]);
      toast.success("✅ Tema añadido");
    } else {
      const local: CommunityTopic = { id: Date.now(), text: trimmed };
      setTopics((prev) => [...prev, local]);
      toast("Tema añadido localmente (sin conexión a BD)", { icon: "💾" });
    }

    setText("");
    setModalOpen(false);
    setLoading(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-5xl font-bold">Temas de la Comunidad</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-3xl font-semibold"
        >
          <Plus /> Añadir Tema
        </button>
      </div>

      <div className="space-y-4">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="bg-white dark:bg-zinc-800 rounded-3xl p-6 text-xl font-medium cursor-pointer hover:bg-emerald-50 dark:hover:bg-zinc-700"
          >
            {topic.text}
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-3xl w-full max-w-md p-8 space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Nuevo Tema</h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-8 h-8" />
              </button>
            </div>

            <textarea
              placeholder="¿Qué nuevo tema quieres crear en la comunidad?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-3xl px-6 py-4 text-lg outline-none resize-none"
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-emerald-400 text-black py-5 rounded-3xl font-semibold text-xl disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Crear Tema"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
