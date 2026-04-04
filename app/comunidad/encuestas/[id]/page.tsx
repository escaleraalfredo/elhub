"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, Heart } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function EncuestaCommentsPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [poll] = useState({
    id: 1,
    question: "¿Cuál es el mejor plato típico boricua?",
  });

  const [comments, setComments] = useState([
    {
      id: 101,
      username: "@playero_pr",
      time: "1h",
      text: "Mofongo sin duda. Con un buen chicharrón y ajo está brutal.",
      likes: 14,
      liked: false,
      replies: [
        {
          id: 201,
          username: "@bayamonero",
          time: "42m",
          text: "Con yuca frita y todo 🔥",
          likes: 5,
          liked: false,
        }
      ]
    },
    {
      id: 102,
      username: "@luquillense",
      time: "3h",
      text: "Arroz con gandules y pernil los domingos en casa de la abuela es insuperable.",
      likes: 23,
      liked: true,
      replies: []
    },
  ]);

  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const toggleLike = (commentId: number, isReply = false, replyId?: number) => {
    setComments(prev => prev.map(comment => {
      if (isReply && replyId && comment.id === commentId) {
        return {
          ...comment,
          replies: comment.replies.map(reply =>
            reply.id === replyId 
              ? { ...reply, liked: !reply.liked, likes: reply.liked ? reply.likes - 1 : reply.likes + 1 } 
              : reply
          )
        };
      }
      if (!isReply && comment.id === commentId) {
        return { 
          ...comment, 
          liked: !comment.liked, 
          likes: comment.liked ? comment.likes - 1 : comment.likes + 1 
        };
      }
      return comment;
    }));

    toast.success("❤️ Me gusta");
  };

  const postComment = () => {
    if (!newComment.trim()) return;

    const newEntry = {
      id: Date.now(),
      username: "@tuusuario",
      time: "ahora",
      text: newComment.trim(),
      likes: 0,
      liked: false,
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
    }

    setNewComment("");
    setReplyingTo(null);
  };

  const startReply = (commentId: number) => {
    setReplyingTo(commentId);
    setNewComment("");
  };

  // Auto-focus input when replyingTo changes
  useEffect(() => {
    if (replyingTo !== null) {
      inputRef.current?.focus();
    }
  }, [replyingTo]);

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      {/* Sticky Poll Header - aligned under sub-tabs */}
      <div className="sticky top-[57px] bg-zinc-950 border-b border-zinc-800 z-50 shrink-0">
        <div className="max-w-md mx-auto px-3 py-3 flex items-center gap-3 sm:gap-4">
          <button 
            onClick={() => router.back()} 
            className="text-zinc-400 hover:text-white -ml-1"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <div className="font-semibold text-white text-[14px] sm:text-[15px] leading-tight line-clamp-2 flex-1">
            {poll.question}
          </div>
        </div>
      </div>

      {/* Scrollable Comments */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-md mx-auto px-3 pt-6">
          <div className="space-y-6 sm:space-y-7">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-8 sm:h-8 bg-zinc-700 rounded-full flex-shrink-0 mt-1" />

                <div className="flex-1">
                  <div className="text-[14px] sm:text-[15px] break-words">
                    <span className="font-semibold text-white">{comment.username}</span>{" "}
                    <span className="text-zinc-200">{comment.text}</span>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-5 text-xs text-zinc-500 mt-1">
                    <span>{comment.time}</span>

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
                      <Heart className={`w-4 h-4 ${comment.liked ? "fill-current" : ""}`} />
                      <span className="text-[11px]">{comment.likes}</span>
                    </button>
                  </div>

                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="mt-4 space-y-4 sm:space-y-5 ml-2">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-6 sm:h-6 bg-zinc-700 rounded-full flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-[14px] sm:text-[15px] break-words">
                              <span className="font-semibold">{reply.username}</span>{" "}
                              <span className="text-zinc-200">{reply.text}</span>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4 text-xs text-zinc-500 mt-1">
                              <span>{reply.time}</span>
                              <button
                                onClick={() => toggleLike(comment.id, true, reply.id)}
                                className={`ml-3 flex items-center gap-1 ${reply.liked ? "text-red-500" : "text-zinc-400 hover:text-red-500"}`}
                              >
                                <Heart className={`w-4 h-4 ${reply.liked ? "fill-current" : ""}`} />
                                <span className="text-[11px]">{reply.likes}</span>
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

      {/* Sticky Comment Input */}
      <div className="sticky bottom-16 bg-zinc-950 border-t border-zinc-800 z-40 shrink-0 px-3 sm:px-4 py-3">
        <div className="max-w-md mx-auto">
          <div className="bg-zinc-900 rounded-3xl p-4 flex gap-2 sm:gap-3 items-center border border-zinc-800">
            <div className="w-8 h-8 bg-zinc-700 rounded-full flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyingTo ? "Responder comentario..." : "Añade un comentario..."}
              className="flex-1 min-w-0 bg-transparent text-[14px] sm:text-[15px] placeholder-zinc-500 focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && postComment()}
            />
            <button
              onClick={postComment}
              disabled={!newComment.trim()}
              className="text-pr-red font-semibold disabled:text-zinc-600 px-2"
            >
              Publicar
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}