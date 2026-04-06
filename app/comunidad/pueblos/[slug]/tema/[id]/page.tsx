// app/comunidad/pueblos/[slug]/tema/[id]/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, MessageCircle, ChevronLeft, Send } from "lucide-react";
import { useGamification } from "@/lib/gamificationContext";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addPoints } = useGamification();

  const slug = params.slug as string;
  const topicId = parseInt(params.id as string);

  const puebloData = {
    "san-juan": "San Juan",
    "santurce": "Santurce",
    "luquillo": "Luquillo",
    "pinones": "Piñones",
    "bayamon": "Bayamón",
    "ponce": "Ponce",
    "mayaguez": "Mayagüez",
    "arecibo": "Arecibo",
  }[slug] || "Pueblo";

  const [topic, setTopic] = useState({
    id: topicId,
    title: "¿Qué opinan del nuevo mural en la Placita?",
    username: "@santurcevibes",
    votes: 67,
    userVote: null as "up" | "down" | null,
    time: "1h",
    content: "Vi el nuevo mural en la Placita de Santurce y me pareció brutal. ¿Qué opinan ustedes? ¿Deberían hacer más arte urbano por la zona o ya está saturado?",
  });

  const [comments, setComments] = useState([
    {
      id: 1,
      username: "@playero_pr",
      text: "Está bien brutal, le da vida al área. Necesitamos más de eso en otros pueblos también.",
      time: "42m",
      votes: 12,
      userVote: null as "up" | "down" | null,
    },
    {
      id: 2,
      username: "@luquillense",
      text: "A mí me gustó, pero el de al lado del kiosko está mejor todavía.",
      time: "28m",
      votes: 8,
      userVote: "up" as "up" | "down" | null,
    },
    {
      id: 3,
      username: "@bayamonero",
      text: "En Bayamón también deberíamos tener algo así. Santurce siempre se lleva lo mejor 😂",
      time: "15m",
      votes: 5,
      userVote: null as "up" | "down" | null,
    },
  ]);

  const [newComment, setNewComment] = useState("");

  const handleTopicVote = (direction: "up" | "down") => {
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

    setTopic({ ...topic, votes: Math.max(0, newVotes), userVote: newUserVote });
  };

  const handleCommentVote = (commentId: number, direction: "up" | "down") => {
    setComments(prev => prev.map(comment => {
      if (comment.id !== commentId) return comment;

      let newVotes = comment.votes;
      let newUserVote = comment.userVote;

      if (comment.userVote === direction) {
        newVotes = direction === "up" ? newVotes - 1 : newVotes + 1;
        newUserVote = null;
      } else {
        if (comment.userVote === "up") newVotes -= 1;
        if (comment.userVote === "down") newVotes += 1;
        newVotes = direction === "up" ? newVotes + 1 : newVotes - 1;
        newUserVote = direction;
        addPoints(2, "Comment vote");
      }

      return { ...comment, votes: Math.max(0, newVotes), userVote: newUserVote };
    }));
  };

  const handleSendComment = () => {
    if (!newComment.trim()) return;

    const newCommentObj = {
      id: Date.now(),
      username: "@tuusuario",
      text: newComment.trim(),
      time: "ahora",
      votes: 0,
      userVote: null as "up" | "down" | null,
    };

    setComments(prev => [newCommentObj, ...prev]);
    setNewComment("");

    addPoints(5, "Nuevo comentario");
    toast.success("Comentario publicado +5 pts");
  };

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 z-50">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="text-zinc-400 hover:text-white"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <div className="font-semibold text-lg truncate">{puebloData}</div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Main Topic Card */}
        <div className="bg-zinc-900 rounded-3xl p-6 mb-6 border border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
            <span>{topic.username}</span>
            <span>·</span>
            <span>{topic.time}</span>
          </div>

          <h1 className="text-2xl font-semibold leading-tight mb-6">
            {topic.title}
          </h1>

          <p className="text-zinc-300 leading-relaxed mb-8">
            {topic.content}
          </p>

          {/* Topic Voting */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => handleTopicVote("up")}
              className={`flex items-center gap-2 transition-all ${topic.userVote === "up" ? "text-emerald-400" : "text-zinc-400 hover:text-white"}`}
            >
              <ArrowUp className={`w-8 h-8 ${topic.userVote === "up" ? "fill-emerald-400" : ""}`} />
              <span className="font-bold text-2xl">{topic.votes}</span>
            </button>

            <button
              onClick={() => handleTopicVote("down")}
              className={`flex items-center gap-1 transition-all ${topic.userVote === "down" ? "text-red-500" : "text-zinc-400 hover:text-white"}`}
            >
              <ArrowDown className={`w-8 h-8 ${topic.userVote === "down" ? "fill-red-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Comentarios ({comments.length})
          </h2>
        </div>

        <div className="space-y-4 mb-24">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800">
              <div className="flex justify-between items-start mb-3">
                <div className="text-sm text-zinc-400">{comment.username}</div>
                <div className="text-xs text-zinc-500">{comment.time}</div>
              </div>

              <p className="text-zinc-300 mb-4 leading-relaxed">{comment.text}</p>

              <div className="flex items-center gap-4 text-sm">
                <button
                  onClick={() => handleCommentVote(comment.id, "up")}
                  className={`flex items-center gap-1 transition-all ${comment.userVote === "up" ? "text-emerald-400" : "text-zinc-400 hover:text-white"}`}
                >
                  <ArrowUp className="w-5 h-5" />
                  <span>{comment.votes}</span>
                </button>

                <button
                  onClick={() => handleCommentVote(comment.id, "down")}
                  className={`flex items-center gap-1 transition-all ${comment.userVote === "down" ? "text-red-500" : "text-zinc-400 hover:text-white"}`}
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Comment Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-zinc-950 border-t border-zinc-800 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex gap-3 bg-zinc-900 rounded-3xl p-2 border border-zinc-700">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe un comentario..."
              className="flex-1 bg-transparent px-4 py-3 text-white placeholder-zinc-500 focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
            />
            <button
              onClick={handleSendComment}
              disabled={!newComment.trim()}
              className="bg-pr-red hover:bg-red-600 disabled:bg-zinc-700 disabled:text-zinc-500 w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}