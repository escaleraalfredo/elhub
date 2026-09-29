// app/comunidad/encuestas/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Card, EmptyState, PageContent } from "@/components/ui/Page";
import PollOptions, { pollTotal } from "@/components/community/PollOptions";
import { CommentSection } from "@/components/comments/Comments";
import { award } from "@/lib/points";
import { POLLS, loadUserContent, type Poll } from "@/lib/community/data";

export default function EncuestaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [poll, setPoll] = useState<Poll | null | undefined>(() => POLLS.find((p) => String(p.id) === id));

  useEffect(() => {
    if (poll) return;
    const t = setTimeout(() => setPoll(loadUserContent().polls.find((p) => String(p.id) === id) ?? null), 0);
    return () => clearTimeout(t);
  }, [id, poll]);

  if (poll === null) {
    return (
      <PageContent>
        <EmptyState icon="🤷" title="Encuesta no encontrada" />
      </PageContent>
    );
  }
  if (!poll) return null;

  const vote = (optionId: number) => {
    if (poll.userVote !== null) return;
    award("vote_poll", { key: String(poll.id) });
    setPoll({ ...poll, userVote: optionId, options: poll.options.map((o) => (o.id === optionId ? { ...o, votes: o.votes + 1 } : o)) });
  };

  return (
    <PageContent className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white -ml-1">
        <ChevronLeft className="w-5 h-5" /> Encuestas
      </button>

      <Card className="p-5">
        <p className="text-xs text-zinc-500 mb-2">
          {pollTotal(poll)} votos · {poll.time}
        </p>
        <h1 className="text-xl font-bold leading-snug mb-4">{poll.question}</h1>
        <PollOptions poll={poll} onVote={vote} />
      </Card>

      <CommentSection threadId={`encuesta:${poll.id}`} seed={poll.seed} />
    </PageContent>
  );
}
