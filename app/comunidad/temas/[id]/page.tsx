"use client";
import { useState } from "react";
import { ArrowUp, ArrowDown, MessageCircle, Send, ChevronLeft, Heart } from "lucide-react";
import { useGamification } from "@/lib/gamificationContext";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function TemaDetailPage() {
  const router = useRouter();
  const { addPoints } = useGamification();

  const [topic, setTopic] = useState({
    id: 1,
    title: "¿Qué opinan de la nueva ley de marihuana en PR?",
    username: "@bayamonero",
    votes: 142,
    userVote: "up" as "up" | "down" | null,
    time: "2h",
    category: "Política",
    content: "La nueva ley que se aprobó la semana pasada está dando mucho de qué hablar. ¿Creen que va a ayudar a la economía o solo va a traer más problemas? Quiero leer opiniones serias de la gente de la isla.",
  });

  const [comments, setComments] = useState([
    {
      id: 101,
      username: "@playero_pr",
      time: "1h",
      text: "Yo estoy a favor, pero tiene que haber regulación fuerte. En Piñones ya hay muchos kioskos vendiendo sin control.",
      votes: 28,
      userVote: null as "up" | "down" | null,
      liked: false,
      likeCount: 7,
      replies: [
        {
          id: 201,
          username: "@santurcevibes",
          time: "45m",
          text: "Totalmente de acuerdo. Sin regulación vamos a tener el mismo problema que con el alcohol.",
          votes: 12,
          userVote: null as "up" | "down" | null,
          liked: false,
          likeCount: 3,
        },
      ],
    },
    {
      id: 102,
      username: "@luquillense",
      time: "3h",
      text: "En Loíza la gente la usa hace años y nunca ha sido un problema grande. Lo que hace falta es educación, no prohibir.",
      votes: 19,
      userVote: null as "up" | "down" | null,
      liked: false,
      likeCount: 11,
      replies: [],
    },
  ]);

  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const handleVoteTopic = (direction: "up" | "down") => {
    setTopic(prev => {
      let newVotes = prev.votes;
      let newUserVote = prev.userVote;

      if (prev.userVote === direction) {
        newVotes = direction === "up" ? newVotes - 1 : newVotes + 1;
        newUserVote = null;
      } else {
        if (prev.userVote === "up") newVotes -= 1;
        if (prev.userVote === "down") newVotes += 1;
        newVotes = direction === "up" ? newVotes + 1 : newVotes - 1;
        newUserVote = direction;
      }

      return { ...prev, votes: Math.max(0, newVotes), userVote: newUserVote };
    });

    toast.success(direction === "up" ? "↑ Voto positivo +3 pts" : "↓ Voto registrado");
    addPoints(3, "Topic vote");
  };

  const handleVoteComment = (commentId: number, direction: "up" | "down", isReply = false, replyId?: number) => {
    setComments(prev => prev.map(comment => {
      if (isReply && replyId && comment.id === commentId) {
        return {
          ...comment,
          replies: comment.replies.map(reply => {
            if (reply.id === replyId) {
              let newVotes = reply.votes;
              let newUserVote = reply.userVote;

              if (reply.userVote === direction) {
                newVotes = direction === "up" ? newVotes - 1 : newVotes + 1;
                newUserVote = null;
              } else {
                if (reply.userVote === "up") newVotes -= 1;
                if (reply.userVote === "down") newVotes += 1;
                newVotes = direction === "up" ? newVotes + 1 : newVotes - 1;
                newUserVote = direction;
              }
              return { ...reply, votes: Math.max(0, newVotes), userVote: newUserVote };
            }
            return reply;
          })
        };
      }

      if (!isReply && comment.id === commentId) {
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
        }
        return { ...comment, votes: Math.max(0, newVotes), userVote: newUserVote };
      }

      return comment;
    }));

    toast.success("↑ Voto registrado");
    addPoints(2, "Comment vote");
  };

  const toggleLike = (commentId: number, isReply = false, replyId?: number) => {
    setComments(prev => prev.map(comment => {
      if (isReply && replyId && comment.id === commentId) {
        return {
          ...comment,
          replies: comment.replies.map(reply =>
            reply.id === replyId 
              ? { ...reply, liked: !reply.liked, likeCount: reply.liked ? reply.likeCount - 1 : reply.likeCount + 1 } 
              : reply
          )
        };
      }
      if (!isReply && comment.id === commentId) {
        return { 
          ...comment, 
          liked: !comment.liked, 
          likeCount: comment.liked ? comment.likeCount - 1 : comment.likeCount + 1 
        };
      }
      return comment;
    }));

    toast.success("❤️ Me gusta");
    addPoints(1, "Comment like");
  };

  const startReply = (commentId: number) => {
    setReplyingTo(commentId);
    setNewComment("");
    setTimeout(() => {
      const input = document.querySelector('input[placeholder*="Responder"]') as HTMLInputElement;
      input?.focus();
    }, 50);
  };

  const postComment = () => {
    if (!newComment.trim()) return;

    const newEntry = {
      id: Date.now(),
      username: "@tuusuario",
      time: "ahora",
      text: newComment.trim(),
      votes: 0,
      userVote: null as "up" | "down" | null,
      liked: false,
      likeCount: 0,
      replies: [],
    };

    if (replyingTo) {
      setComments(prev => prev.map(c =>
        c.id === replyingTo ? { ...c, replies: [...c.replies, newEntry] } : c
      ));
      toast.success("Respuesta publicada");
    } else {
      setComments(prev => [newEntry, ...prev]);
      toast.success("Comentario publicado +5 pts");
      addPoints(5, "New comment");
    }

    setNewComment("");
    setReplyingTo(null);
  };

  const totalComments = comments.length + comments.reduce((acc, c) => acc + c.replies.length, 0);

  return (
    <div className="min-h-screen bg-dark-bg pb-12">
      {/* No header - clean swipe back */}

      <div className="max-w-md mx-auto px-4 pt-6">
        {/* Topic Card */}
        <div className="bg-zinc-900 rounded-3xl p-6 mb-8 border border-zinc-800">
          <div className="flex items-center gap-3 text-xs text-zinc-500 mb-4">
            <span>{topic.username}</span>
            <span>·</span>
            <span>{topic.time}</span>
            <span className="ml-auto px-3 py-1 bg-zinc-800 rounded-full text-[10px]">{topic.category}</span>
          </div>

          <h1 className="text-[21px] leading-tight font-semibold mb-5">{topic.title}</h1>
          <p className="text-zinc-300 leading-relaxed text-[15.5px] mb-6">{topic.content}</p>

          <div className="flex items-center justify-center gap-8 border-t border-zinc-800 pt-5">
            <button
              onClick={() => handleVoteTopic("up")}
              className={`flex flex-col items-center transition-all ${topic.userVote === "up" ? "text-emerald-400" : "text-zinc-400 hover:text-white"}`}
            >
              <ArrowUp className={`w-7 h-7 ${topic.userVote === "up" ? "fill-emerald-400" : ""}`} />
            </button>

            <div className={`font-bold text-2xl transition-colors ${topic.userVote === "up" ? "text-emerald-400" : topic.userVote === "down" ? "text-red-500" : "text-white"}`}>
              {topic.votes}
            </div>

            <button
              onClick={() => handleVoteTopic("down")}
              className={`flex flex-col items-center transition-all ${topic.userVote === "down" ? "text-red-500" : "text-zinc-400 hover:text-white"}`}
            >
              <ArrowDown className={`w-7 h-7 ${topic.userVote === "down" ? "fill-red-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* Comments Section - Tiny bit more space above "Comentarios" */}
        <div className="-mt-5">
          {/* Comentarios title */}
          <div className="flex items-center justify-between px-1 py-1 mb-2">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              Comentarios
              <span className="text-zinc-500 text-base font-normal">({totalComments})</span>
            </h2>
          </div>

          {/* IG-style input */}
          <div className="bg-zinc-900 rounded-3xl p-4 border border-zinc-800 flex gap-3 items-center mb-6">
            <div className="w-8 h-8 bg-zinc-700 rounded-full flex-shrink-0" />
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyingTo ? "Responder comentario..." : "Añade un comentario..."}
              className="flex-1 bg-transparent text-[15px] placeholder-zinc-500 focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && postComment()}
            />
            <button
              onClick={postComment}
              disabled={!newComment.trim()}
              className="text-pr-red font-semibold disabled:text-zinc-600"
            >
              Publicar
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-7">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 bg-zinc-700 rounded-full flex-shrink-0 mt-1" />

                <div className="flex-1">
                  <div className="text-[15px]">
                    <span className="font-semibold text-white">{comment.username}</span>{" "}
                    <span className="text-zinc-200">{comment.text}</span>
                  </div>

                  <div className="flex items-center gap-5 text-xs text-zinc-500 mt-1">
                    <span>{comment.time}</span>

                    <button
                      onClick={() => handleVoteComment(comment.id, "up")}
                      className={`flex items-center gap-1 ${comment.userVote === "up" ? "text-pr-red" : "text-zinc-400 hover:text-white"}`}
                    >
                      <ArrowUp className="w-4 h-4" />
                      <span>{comment.votes}</span>
                    </button>

                    <button
                      onClick={() => startReply(comment.id)}
                      className="hover:text-white transition-colors"
                    >
                      Responder
                    </button>

                    <button
                      onClick={() => toggleLike(comment.id)}
                      className={`ml-auto flex items-center gap-1 ${comment.liked ? "text-red-500" : "text-zinc-400 hover:text-red-500"}`}
                    >
                      <Heart className={`w-4 h-4 transition-all ${comment.liked ? "fill-current" : ""}`} />
                      <span className="text-[11px]">{comment.likeCount}</span>
                    </button>
                  </div>

                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="mt-4 space-y-5 ml-2">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-3">
                          <div className="w-6 h-6 bg-zinc-700 rounded-full flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-[15px]">
                              <span className="font-semibold">{reply.username}</span>{" "}
                              <span className="text-zinc-200">{reply.text}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-zinc-500 mt-1">
                              <span>{reply.time}</span>
                              <button
                                onClick={() => handleVoteComment(comment.id, "up", true, reply.id)}
                                className={`flex items-center gap-1 ${reply.userVote === "up" ? "text-pr-red" : "text-zinc-400 hover:text-white"}`}
                              >
                                <ArrowUp className="w-4 h-4" />
                                <span>{reply.votes}</span>
                              </button>

                              <button
                                onClick={() => toggleLike(comment.id, true, reply.id)}
                                className={`ml-3 flex items-center gap-1 ${reply.liked ? "text-red-500" : "text-zinc-400 hover:text-red-500"}`}
                              >
                                <Heart className={`w-4 h-4 ${reply.liked ? "fill-current" : ""}`} />
                                <span className="text-[11px]">{reply.likeCount}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}