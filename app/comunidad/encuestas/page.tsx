"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { useGamification } from "@/lib/gamificationContext";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

export default function EncuestasPage() {
  const { addPoints } = useGamification();

  const [polls, setPolls] = useState([
    { 
      id: 1, 
      question: "¿Qué debería ser el próximo feriado en PR?", 
      options: [
        { text: "Día del Perreo Intenso", votes: 1243 },
        { text: "Día del Chinchorro Libre", votes: 987 },
        { text: "Día de la Medalla", votes: 654 }
      ],
      totalVotes: 2884,
      userVoted: null as number | null
    },
    { 
      id: 2, 
      question: "¿Cuál es el mejor equipo de la BSN este año?", 
      options: [
        { text: "Bayamón", votes: 876 },
        { text: "Santurce", votes: 654 },
        { text: "Arecibo", votes: 432 }
      ],
      totalVotes: 1962,
      userVoted: null as number | null
    },
  ]);

  const handlePollVote = (pollId: number, optionIndex: number) => {
    setPolls(prev => prev.map(poll => {
      if (poll.id === pollId && poll.userVoted === null) {
        const newOptions = [...poll.options];
        newOptions[optionIndex].votes += 1;
        addPoints(5, "Poll vote");
        toast.success("¡Voto registrado! +5 pts");
        return { ...poll, options: newOptions, totalVotes: poll.totalVotes + 1, userVoted: optionIndex };
      }
      return poll;
    }));
  };

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      <div className="max-w-md mx-auto px-4 py-6 space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Encuestas</h2>
          <p className="text-zinc-400">Vota y ve qué piensa la gente</p>
        </div>

        {polls.map((poll) => (
          <div key={poll.id} className="bg-zinc-900 rounded-3xl p-6">
            <p className="font-semibold text-lg mb-6">{poll.question}</p>
            
            <div className="space-y-4">
              {poll.options.map((option, index) => {
                const percentage = Math.round((option.votes / poll.totalVotes) * 100);
                return (
                  <button
                    key={index}
                    onClick={() => handlePollVote(poll.id, index)}
                    disabled={poll.userVoted !== null}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${poll.userVoted === index ? "border-pr-red" : "border-zinc-700 hover:border-zinc-600"}`}
                  >
                    <div className="flex justify-between mb-2">
                      <span>{option.text}</span>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-pr-red transition-all" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-center text-xs text-zinc-500 mt-4">{poll.totalVotes} votos</p>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}