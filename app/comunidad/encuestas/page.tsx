// app/comunidad/encuestas/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Card, PageContent } from "@/components/ui/Page";
import UnifiedFAB from "@/components/UnifiedFAB";
import CreateSheet, { inputClass } from "@/components/ui/CreateSheet";
import PollOptions, { pollTotal } from "@/components/community/PollOptions";
import { CommentButton } from "@/components/comments/Comments";
import { useGamification } from "@/lib/gamificationContext";
import { POLLS, loadUserContent, saveUserContent, type Poll } from "@/lib/community/data";
import { cn } from "@/lib/utils";

export default function EncuestasPage() {
  const router = useRouter();
  const { addPoints } = useGamification();
  const [polls, setPolls] = useState<Poll[]>(POLLS);
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState({ question: "", options: ["", "", "", ""] });

  useEffect(() => {
    const mine = loadUserContent().polls;
    if (mine.length) {
      const t = setTimeout(() => setPolls([...mine, ...POLLS]), 0);
      return () => clearTimeout(t);
    }
  }, []);

  const vote = (pollId: number, optionId: number) => {
    setPolls((prev) =>
      prev.map((p) =>
        p.id !== pollId || p.userVote !== null
          ? p
          : { ...p, userVote: optionId, options: p.options.map((o) => (o.id === optionId ? { ...o, votes: o.votes + 1 } : o)) }
      )
    );
    addPoints(5, "Voto encuesta");
    toast.success("¡Voto registrado! +5 pts");
  };

  const like = (pollId: number) =>
    setPolls((prev) => prev.map((p) => (p.id === pollId ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p)));

  const create = () => {
    const options = draft.options.map((o) => o.trim()).filter(Boolean);
    if (!draft.question.trim() || options.length < 2) {
      toast.error("Escribe la pregunta y al menos 2 opciones");
      return;
    }
    const poll: Poll = {
      id: Date.now(),
      question: draft.question.trim(),
      options: options.map((text, i) => ({ id: i + 1, text, votes: 0 })),
      time: "ahora",
      userVote: null,
      likes: 0,
      liked: false,
    };
    saveUserContent({ polls: [poll, ...loadUserContent().polls] });
    setPolls((prev) => [poll, ...prev]);
    setDraft({ question: "", options: ["", "", "", ""] });
    setShowNew(false);
    addPoints(15, "Nueva encuesta");
    toast.success("¡Encuesta creada! +15 pts");
  };

  return (
    <>
      <PageContent>
        {polls.map((poll) => (
          <Card key={poll.id}>
            <div className="p-5">
              <p className="text-xs text-zinc-500 mb-2">
                {pollTotal(poll)} votos · {poll.time}
              </p>
              <h3 className="text-[16px] font-semibold leading-snug mb-4">{poll.question}</h3>
              <PollOptions poll={poll} onVote={(o) => vote(poll.id, o)} />
            </div>
            <div className="border-t border-zinc-800 px-5 py-3 flex items-center gap-6 text-sm">
              <button
                onClick={() => like(poll.id)}
                className={cn("flex items-center gap-1.5", poll.liked ? "text-red-500" : "text-zinc-400 hover:text-white")}
              >
                <Heart className={cn("w-5 h-5", poll.liked && "fill-current")} />
                <span className="tabular-nums">{poll.likes}</span>
              </button>
              <CommentButton
                threadId={`encuesta:${poll.id}`}
                seed={poll.seed}
                onClick={() => router.push(`/comunidad/encuestas/${poll.id}`)}
              />
              <span className="ml-auto text-xs text-zinc-500">{poll.userVote !== null ? "Ya votaste" : "Vota ahora"}</span>
            </div>
          </Card>
        ))}
      </PageContent>

      <UnifiedFAB onClick={() => setShowNew(true)} label="Nueva encuesta" />

      <CreateSheet
        open={showNew}
        onClose={() => setShowNew(false)}
        title="Nueva encuesta"
        actionLabel="Publicar encuesta"
        onAction={create}
        hint="+15 puntos por crear una encuesta"
      >
        <textarea
          placeholder="¿Qué quieres preguntar a la comunidad?"
          value={draft.question}
          onChange={(e) => setDraft({ ...draft, question: e.target.value })}
          className={cn(inputClass, "h-24 resize-none")}
        />
        <div className="space-y-2">
          <p className="text-sm text-zinc-400">Opciones (mínimo 2)</p>
          {draft.options.map((opt, i) => (
            <input
              key={i}
              value={opt}
              placeholder={`Opción ${i + 1}`}
              onChange={(e) => {
                const options = [...draft.options];
                options[i] = e.target.value;
                setDraft({ ...draft, options });
              }}
              className={inputClass}
            />
          ))}
        </div>
      </CreateSheet>
    </>
  );
}
