// app/comunidad/temas/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, Chips, EmptyState, PageContent } from "@/components/ui/Page";
import UnifiedFAB from "@/components/UnifiedFAB";
import VoteColumn, { applyVote } from "@/components/ui/VoteColumn";
import CreateSheet, { inputClass } from "@/components/ui/CreateSheet";
import { CommentButton } from "@/components/comments/Comments";
import { useGamification } from "@/lib/gamificationContext";
import {
  TOPICS,
  TOPIC_CATEGORIES,
  loadUserContent,
  saveUserContent,
  type Topic,
  type TopicCategory,
} from "@/lib/community/data";
import { cn } from "@/lib/utils";

const FILTERS = ["Todos", ...TOPIC_CATEGORIES] as const;
type Filter = (typeof FILTERS)[number];

export default function TemasPage() {
  const router = useRouter();
  const { addPoints } = useGamification();
  const [filter, setFilter] = useState<Filter>("Todos");
  const [topics, setTopics] = useState<Topic[]>(TOPICS);
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState<{ title: string; category: TopicCategory }>({ title: "", category: "Otros" });

  useEffect(() => {
    const mine = loadUserContent().topics;
    if (mine.length) {
      const t = setTimeout(() => setTopics([...mine, ...TOPICS]), 0);
      return () => clearTimeout(t);
    }
  }, []);

  const visible = useMemo(
    () => (filter === "Todos" ? topics : topics.filter((t) => t.category === filter)),
    [topics, filter]
  );

  const vote = (id: number, dir: "up" | "down") => {
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = applyVote(t.votes, t.userVote, dir);
        if (next.userVote) addPoints(3, "Voto tema");
        return { ...t, ...next };
      })
    );
  };

  const create = () => {
    if (!draft.title.trim()) {
      toast.error("Escribe una pregunta o tema");
      return;
    }
    const topic: Topic = {
      id: Date.now(),
      title: draft.title.trim(),
      username: "tuusuario",
      votes: 0,
      userVote: null,
      time: "ahora",
      category: draft.category,
    };
    saveUserContent({ topics: [topic, ...loadUserContent().topics] });
    setTopics((prev) => [topic, ...prev]);
    setDraft({ title: "", category: "Otros" });
    setShowNew(false);
    addPoints(10, "Nuevo tema");
    toast.success("¡Tema creado! +10 pts");
  };

  return (
    <>
      <div className="max-w-md mx-auto">
        <Chips options={FILTERS} active={filter} onChange={setFilter} className="pb-0" />
      </div>

      <PageContent>
        {visible.length === 0 && (
          <EmptyState icon="💬" title="No hay temas aquí todavía" subtitle="¡Sé el primero en crear uno!" />
        )}

        {visible.map((topic) => (
          <Card key={topic.id} onClick={() => router.push(`/comunidad/temas/${topic.id}`)}>
            <div className="flex">
              <div className="w-14 shrink-0 flex justify-center py-3 bg-zinc-950/60 border-r border-zinc-800">
                <VoteColumn votes={topic.votes} userVote={topic.userVote} onVote={(d) => vote(topic.id, d)} />
              </div>
              <div className="flex-1 min-w-0 p-4">
                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1.5">
                  <span className="font-semibold text-zinc-300">{topic.username}</span>
                  <span>· {topic.time}</span>
                  <span className="ml-auto px-2.5 py-0.5 bg-zinc-800 rounded-full text-[10px] text-zinc-300">
                    {topic.category}
                  </span>
                </div>
                <h3 className="font-semibold text-[16px] leading-snug text-white">{topic.title}</h3>
                <div className="mt-3">
                  <CommentButton
                    threadId={`tema:${topic.id}`}
                    seed={topic.seed}
                    onClick={() => router.push(`/comunidad/temas/${topic.id}`)}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </PageContent>

      <UnifiedFAB onClick={() => setShowNew(true)} label="Nuevo tema" />

      <CreateSheet
        open={showNew}
        onClose={() => setShowNew(false)}
        title="Nuevo tema"
        actionLabel="Publicar tema"
        onAction={create}
        hint="+10 puntos por crear un tema"
      >
        <textarea
          placeholder="¿Qué quieres discutir con la comunidad boricua?"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          className={cn(inputClass, "h-28 resize-none")}
        />
        <div>
          <p className="text-sm text-zinc-400 mb-2">Categoría</p>
          <div className="flex flex-wrap gap-2">
            {TOPIC_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setDraft({ ...draft, category: cat })}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm border transition-colors",
                  draft.category === cat
                    ? "bg-pr-red border-pr-red text-white"
                    : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </CreateSheet>
    </>
  );
}
