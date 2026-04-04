"use client";
import { useState } from "react";
import { Users, Clock, Plus, Heart, MessageCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import UnifiedFAB from "@/components/UnifiedFAB";
import UnifiedCard from "@/components/UnifiedCard";

export default function EncuestasPage() {
  const router = useRouter();

  const [polls, setPolls] = useState([
    {
      id: 1,
      question: "¿Cuál es el mejor plato típico boricua?",
      options: [
        { id: 1, text: "Mofongo", votes: 124, percentage: 42 },
        { id: 2, text: "Arroz con gandules y pernil", votes: 98, percentage: 33 },
        { id: 3, text: "Alcapurrias", votes: 45, percentage: 15 },
        { id: 4, text: "Empanadillas", votes: 29, percentage: 10 },
      ],
      totalVotes: 296,
      time: "2h",
      voted: false,
      userVote: null as number | null,
      likes: 34,
      liked: false,
      comments: 12,
    },
    {
      id: 2,
      question: "¿Bad Bunny o Residente? ¿Quién es el rey del trap/reggaetón actual?",
      options: [
        { id: 1, text: "Bad Bunny", votes: 187, percentage: 61 },
        { id: 2, text: "Residente", votes: 89, percentage: 29 },
        { id: 3, text: "Ambos son cracks", votes: 31, percentage: 10 },
      ],
      totalVotes: 307,
      time: "5h",
      voted: true,
      userVote: 1,
      likes: 67,
      liked: true,
      comments: 28,
    },
    {
      id: 3,
      question: "¿Debería haber más chinchorros en la playa de Luquillo?",
      options: [
        { id: 1, text: "Sí, hace falta más ambiente", votes: 156, percentage: 68 },
        { id: 2, text: "No, ya está muy lleno", votes: 52, percentage: 23 },
        { id: 3, text: "Me da igual", votes: 21, percentage: 9 },
      ],
      totalVotes: 229,
      time: "14h",
      voted: false,
      userVote: null as number | null,
      likes: 19,
      liked: false,
      comments: 8,
    },
  ]);

  const [showNewPollModal, setShowNewPollModal] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: "",
    options: ["", "", "", ""],
  });

  const votePoll = (pollId: number, optionId: number) => {
    setPolls(prev => prev.map(poll => {
      if (poll.id !== pollId || poll.voted) return poll;
      const updatedOptions = poll.options.map(opt => 
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      );
      const newTotal = poll.totalVotes + 1;
      const updatedOptionsWithPercent = updatedOptions.map(opt => ({
        ...opt,
        percentage: Math.round((opt.votes / newTotal) * 100)
      }));
      toast.success("¡Voto registrado! +5 pts");
      return {
        ...poll,
        options: updatedOptionsWithPercent,
        totalVotes: newTotal,
        voted: true,
        userVote: optionId
      };
    }));
  };

  const toggleLike = (pollId: number) => {
    setPolls(prev => prev.map(poll => poll.id === pollId ? {
      ...poll,
      liked: !poll.liked,
      likes: poll.liked ? poll.likes - 1 : poll.likes + 1
    } : poll));
    toast.success("❤️ Me gusta");
  };

  const openComments = (pollId: number) => router.push(`/comunidad/encuestas/${pollId}`);

  const createPoll = () => {
    if (!newPoll.question.trim() || newPoll.options.filter(o => o.trim()).length < 2) {
      toast.error("Escribe la pregunta y al menos 2 opciones");
      return;
    }
    const validOptions = newPoll.options.filter(o => o.trim()).map((text, index) => ({
      id: index + 1,
      text: text.trim(),
      votes: 0,
      percentage: 0
    }));
    const newPollItem = {
      id: Date.now(),
      question: newPoll.question.trim(),
      options: validOptions,
      totalVotes: 0,
      time: "ahora",
      voted: false,
      userVote: null as number | null,
      likes: 0,
      liked: false,
      comments: 0,
    };
    setPolls(prev => [newPollItem, ...prev]);
    setNewPoll({ question: "", options: ["", "", "", ""] });
    setShowNewPollModal(false);
    toast.success("¡Encuesta creada! +15 pts");
  };

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="space-y-6">
          {polls.map((poll) => (
            <UnifiedCard key={poll.id}>
              <div className="p-6">
                <div className="flex items-center gap-3 text-xs text-zinc-500 mb-4">
                  <div className="flex items-center gap-1"><Users className="w-4 h-4" /><span>{poll.totalVotes} votos</span></div>
                  <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{poll.time}</span></div>
                </div>
                <h3 className="text-[17px] font-semibold leading-tight mb-6">{poll.question}</h3>
                <div className="space-y-3 mb-6">
                  {poll.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => votePoll(poll.id, option.id)}
                      disabled={poll.voted}
                      className={`w-full relative overflow-hidden rounded-2xl border transition-all text-left p-4 ${poll.voted ? poll.userVote === option.id ? "border-emerald-500 bg-emerald-950/30" : "border-zinc-700" : "border-zinc-700 hover:border-pr-red active:scale-[0.985]"}`}
                    >
                      <div className="flex justify-between items-center relative z-10">
                        <span className="text-sm pr-8">{option.text}</span>
                        {poll.voted && <span className="text-xs font-medium text-zinc-400">{option.percentage}%</span>}
                      </div>
                      <div className="absolute bottom-0 left-0 h-1 bg-zinc-800 w-full">
                        <div className={`h-1 transition-all duration-300 ${poll.userVote === option.id ? "bg-emerald-500" : "bg-zinc-700"}`} style={{ width: `${option.percentage}%` }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-t border-zinc-800 px-6 py-4 flex items-center justify-between text-sm">
                <button onClick={() => toggleLike(poll.id)} className={`flex items-center gap-2 transition-all ${poll.liked ? "text-red-500" : "text-zinc-400 hover:text-red-500"}`}>
                  <Heart className={`w-5 h-5 ${poll.liked ? "fill-current" : ""}`} /> <span>{poll.likes}</span>
                </button>
                <button onClick={() => openComments(poll.id)} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all">
                  <MessageCircle className="w-5 h-5" /> <span>{poll.comments}</span>
                </button>
                <div className="text-xs text-zinc-500">{poll.voted ? "Ya votaste" : "Vota ahora"}</div>
              </div>
            </UnifiedCard>
          ))}
        </div>
      </div>

      <UnifiedFAB onClick={() => setShowNewPollModal(true)} />

      {showNewPollModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-end md:items-center justify-center">
          <div className="bg-zinc-900 w-full max-w-md mx-auto rounded-t-3xl md:rounded-3xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Nueva Encuesta</h2>
                <button onClick={() => setShowNewPollModal(false)} className="text-zinc-400 hover:text-white text-2xl leading-none">✕</button>
              </div>
              <textarea placeholder="¿Qué quieres preguntar a la comunidad?" value={newPoll.question} onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })} className="w-full h-24 bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-pr-red resize-y" />
              <div className="mt-6">
                <p className="text-sm text-zinc-400 mb-3">Opciones (mínimo 2)</p>
                <div className="space-y-2">
                  {newPoll.options.map((opt, index) => (
                    <input key={index} type="text" placeholder={`Opción ${index + 1}`} value={opt} onChange={(e) => {
                      const newOptions = [...newPoll.options];
                      newOptions[index] = e.target.value;
                      setNewPoll({ ...newPoll, options: newOptions });
                    }} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-pr-red" />
                  ))}
                </div>
              </div>
              <button onClick={createPoll} className="mt-8 w-full bg-pr-red hover:bg-red-600 transition-all py-4 rounded-2xl font-semibold text-lg active:scale-[0.985]">Publicar Encuesta</button>
              <p className="text-center text-xs text-zinc-500 mt-4">Recibirás +15 puntos por crear una encuesta</p>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}