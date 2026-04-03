"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, MessageCircle, Send } from "lucide-react";
import { useGamification } from "@/lib/gamificationContext";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

export default function TemaDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addPoints } = useGamification();

  const [topic, setTopic] = useState<any>(null);
  const [comments, setComments] = useState([
    { id: 1, username: "@chinchorrolover", text: "Excelente tema. Yo estoy totalmente a favor, esto puede generar mucho empleo en la isla.", time: "1h", votes: 12 },
    { id: 2, username: "@conservadorpr", text: "Hay que regularlo bien. No podemos repetir errores de otros países.", time: "45m", votes: 8 },
  ]);
  const [newComment, setNewComment] = useState("");
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    const mockTopics: any = {
      "1": { id: 1, title: "¿Qué opinan de la nueva ley de marihuana en PR?", username: "@bayamonero", votes: 142, time: "2h", category: "Política", body: "La nueva ley permite el consumo recreativo en ciertos municipios. ¿Creen que esto va a ayudar a la economía o va a traer más problemas sociales?" },
      "2": { id: 2, title: "Recomienden chinchorros buenos y baratos en Piñones este fin de semana", username: "@playero_pr", votes: 96, time: "5h", category: "Comida", body: "Busco lugares con buena música, Medalla fría y alcapurrias bien hechas. ¿Alguna recomendación real y actualizada?" },
      "3": { id: 3, title: "Bad Bunny vs Residente: ¿Quién ganó el último round de verdad?", username: "@santurcevibes", votes: 203, time: "11h", category: "Música", body: "Después del último diss track, la gente está muy dividida. ¿Ustedes de qué lado están y por qué?" }
    };

    const foundTopic = mockTopics[id as string];
    if (foundTopic) setTopic(foundTopic);
    else router.push("/comunidad/temas");
  }, [id, router]);

  const handleVote = (direction: "up" | "down") => {
    if (!topic) return;

    let newVotes = topic.votes;
    let newUserVote = userVote;

    if (userVote === direction) {
      newVotes = direction === "up" ? newVotes - 1 : newVotes + 1;
      newUserVote = null;
    } else {
      if (userVote === "up") newVotes -= 1;
      if (userVote === "down") newVotes += 1;
      newVotes = direction === "up" ? newVotes + 1 : newVotes - 1;
      newUserVote = direction;

      addPoints(3, "Topic vote");
      toast.success(direction === "up" ? "↑ Voto positivo +3 pts" : "↓ Voto registrado");
    }

    setTopic({ ...topic, votes: newVotes });
    setUserVote(newUserVote);
  };

  const postComment = () => {
    if (!newComment.trim() || !topic) return;
    addPoints(5, "New comment");
    toast.success("Comentario publicado +5 pts");

    setComments(prev => [{
      id: Date.now(),
      username: "@tuusuario",
      text: newComment,
      time: "ahora",
      votes: 0
    }, ...prev]);

    setNewComment("");
  };

  if (!topic) return <div className="min-h-screen bg-dark-bg flex items-center justify-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      <div className="max-w-md mx-auto pt-6 px-5">
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
          <span>{topic.username}</span>
          <span>·</span>
          <span>{topic.time}</span>
          <span className="ml-auto px-3 py-0.5 bg-zinc-800 rounded-full text-[10px]">{topic.category}</span>
        </div>

        <h1 className="text-2xl font-bold leading-tight mb-8">{topic.title}</h1>

        <p className="text-zinc-300 leading-relaxed text-[17px] mb-10">
          {topic.body}
        </p>

        {/* Voting Section */}
        <div className="flex items-center justify-center gap-12 bg-zinc-900 rounded-2xl p-6 mb-12">
          <button
            onClick={() => handleVote("up")}
            className={`flex flex-col items-center gap-2 transition-all ${userVote === "up" ? "text-green-500" : "text-zinc-400"}`}
          >
            <ArrowUp className={`w-14 h-14 ${userVote === "up" ? "fill-green-500" : ""}`} />
          </button>

          <div className={`font-bold text-4xl transition-colors ${userVote === "up" ? "text-green-500" : userVote === "down" ? "text-red-500" : "text-white"}`}>
            {topic.votes}
          </div>

          <button
            onClick={() => handleVote("down")}
            className={`flex flex-col items-center gap-2 transition-all ${userVote === "down" ? "text-red-500" : "text-zinc-400"}`}
          >
            <ArrowDown className={`w-14 h-14 ${userVote === "down" ? "fill-red-500" : ""}`} />
          </button>
        </div>
      </div>

      <div className="px-5">
        <div className="font-semibold text-lg mb-5 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comentarios ({comments.length})
        </div>

        <div className="space-y-6 mb-32">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-zinc-900 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
                <span className="font-medium">{comment.username}</span>
                <span>·</span>
                <span>{comment.time}</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">{comment.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 p-4 z-50">
        <div className="max-w-md mx-auto flex gap-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe un comentario..."
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-pr-red"
            onKeyDown={(e) => e.key === "Enter" && postComment()}
          />
          <button
            onClick={postComment}
            disabled={!newComment.trim()}
            className="bg-pr-red text-white px-6 rounded-2xl disabled:opacity-50 flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}