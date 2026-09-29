// app/comunidad/temas/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Card, EmptyState, PageContent } from "@/components/ui/Page";
import Avatar from "@/components/ui/Avatar";
import VoteColumn, { applyVote } from "@/components/ui/VoteColumn";
import { CommentSection } from "@/components/comments/Comments";
import { award } from "@/lib/points";
import { TOPICS, loadUserContent, type Topic } from "@/lib/community/data";

export default function TemaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [topic, setTopic] = useState<Topic | null | undefined>(() => TOPICS.find((t) => String(t.id) === id));

  useEffect(() => {
    if (topic) return;
    const t = setTimeout(() => setTopic(loadUserContent().topics.find((x) => String(x.id) === id) ?? null), 0);
    return () => clearTimeout(t);
  }, [id, topic]);

  if (topic === null) {
    return (
      <PageContent>
        <EmptyState icon="🤷" title="Tema no encontrado" subtitle="Puede que se haya borrado." />
      </PageContent>
    );
  }
  if (!topic) return null;

  const vote = (dir: "up" | "down") => {
    const next = applyVote(topic.votes, topic.userVote, dir);
    if (next.userVote) award("vote_topic", { key: String(topic.id) });
    setTopic({ ...topic, ...next });
  };

  return (
    <PageContent className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white -ml-1">
        <ChevronLeft className="w-5 h-5" /> Temas
      </button>

      <Card className="p-5">
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
          <Avatar name={topic.username} size={24} />
          <span className="font-semibold text-zinc-300">{topic.username}</span>
          <span>· {topic.time}</span>
          <span className="ml-auto px-2.5 py-0.5 bg-zinc-800 rounded-full text-[10px] text-zinc-300">{topic.category}</span>
        </div>
        <h1 className="text-xl leading-snug font-bold text-white">{topic.title}</h1>
        {topic.content && <p className="text-zinc-300 leading-relaxed text-[15px] mt-3">{topic.content}</p>}
        <div className="mt-4 pt-3 border-t border-zinc-800">
          <VoteColumn horizontal votes={topic.votes} userVote={topic.userVote} onVote={vote} />
        </div>
      </Card>

      <CommentSection threadId={`tema:${topic.id}`} seed={topic.seed} />
    </PageContent>
  );
}
