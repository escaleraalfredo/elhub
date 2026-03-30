"use client";
import { useState } from "react";
import { Plus } from "lucide-react";

export default function CommunityTopics() {
  const [topics, setTopics] = useState([
    "¿Qué opinan del nuevo aumento de LUMA?",
    "Best mofongo in Ponce right now?",
    "Quién va a La Placita este viernes?",
  ]);

  const addTopic = () => {
    const newTopic = prompt("¿Qué nuevo tema quieres crear en la comunidad?");
    if (newTopic && newTopic.trim() !== "") {
      setTopics([...topics, newTopic]);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-5xl font-bold">Temas de la Comunidad</h1>
        <button
          onClick={addTopic}
          className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-3xl font-semibold"
        >
          <Plus /> Añadir Tema
        </button>
      </div>
      <div className="space-y-4">
        {topics.map((topic, i) => (
          <div key={i} className="bg-white dark:bg-zinc-800 rounded-3xl p-6 text-xl font-medium cursor-pointer hover:bg-emerald-50 dark:hover:bg-zinc-700">
            {topic}
          </div>
        ))}
      </div>
    </div>
  );
}