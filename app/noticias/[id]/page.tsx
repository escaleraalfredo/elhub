"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageCircle, Smile, ArrowLeft, X, Heart, Share2 } from "lucide-react";
import { useGamification } from "@/lib/gamificationContext";
import { useNews } from "@/lib/newsContext";

interface Comment {
  id: number;
  username: string;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
}

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = params.id as string;
  const shouldOpenComments = searchParams.get("comments") === "open";

  const { addPoints } = useGamification();
  const { news, updateNews } = useNews();

  const article = news.find(item => item.id === articleId);

  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [showComments, setShowComments] = useState(shouldOpenComments);
  const [newComment, setNewComment] = useState("");

  const [comments, setComments] = useState<Comment[]>([
    { id: 1, username: "@boricua87", text: "Esto es una vergüenza, ya es hora de que tomen medidas reales.", time: "hace 12 min", likes: 24, liked: false },
    { id: 2, username: "@playero_pr", text: "Totalmente de acuerdo. La inseguridad está fuera de control.", time: "hace 35 min", likes: 18, liked: true },
  ]);

  const emojis = [
    "🔥", "❤️", "🙌", "😂", "😢", "😡", "🤬", "💩", 
    "👏", "🙏", "🌧️", "💸", "😤", "🎉", "👀", "🤦‍♂️",
    "🖕", "👍", "👎", "🥳", "😱", "🤔", "🇵🇷", "🇺🇸", 
    "😍", "🤯", "🙄", "💯", "🚀", "🍆", "🥲", "👑"
  ];

  const handleVote = (vote: "up" | "down") => {
    if (!article) return;
    addPoints(2, "Article vote");

    updateNews(article.id, (item) => {
      let newLikes = item.likes;
      let newDislikes = item.dislikes;

      if (item.userVote === vote) {
        if (vote === "up") newLikes--;
        else newDislikes--;
        return { ...item, likes: newLikes, dislikes: newDislikes, userVote: null };
      }

      if (item.userVote === "up") newLikes--;
      if (item.userVote === "down") newDislikes--;

      if (vote === "up") newLikes++;
      else newDislikes++;

      return { ...item, likes: newLikes, dislikes: newDislikes, userVote: vote };
    });
  };

  const addReaction = (emoji: string) => {
    if (!article) return;

    updateNews(article.id, (item) => {
      const current = item.reactions[emoji] || 0;
      addPoints(1, "Article emoji");
      return {
        ...item,
        reactions: { ...item.reactions, [emoji]: current + 1 }
      };
    });

    setOpenEmojiPicker(false);
  };

  const postComment = () => {
    if (!newComment.trim()) return;
    addPoints(10, "Comment");

    const newCommentObj: Comment = {
      id: Date.now(),
      username: "@tuusuario",
      text: newComment.trim(),
      time: "ahora",
      likes: 0,
      liked: false,
    };
    setComments([newCommentObj, ...comments]);
    setNewComment("");
  };

  const toggleCommentLike = (id: number) => {
    setComments(prev => prev.map(comment => 
      comment.id === id 
        ? { ...comment, likes: comment.liked ? comment.likes - 1 : comment.likes + 1, liked: !comment.liked }
        : comment
    ));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Enlace copiado al portapapeles");
    }
  };

  if (!article) {
    return <div className="min-h-screen flex items-center justify-center text-white">Cargando artículo...</div>;
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 z-50">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-zinc-400 hover:text-white">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="font-semibold text-lg">Artículo</h1>
          </div>
          <button onClick={handleShare} className="text-zinc-400 hover:text-white">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {article.image && (
          <div className="relative h-72">
            <img 
              src={article.image} 
              alt={article.title} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent h-24" />
          </div>
        )}

        <div className="p-5">
          <div className="flex items-center gap-3 text-sm mb-4">
            <span className="font-bold text-pr-red">{article.source}</span>
            <span className="text-zinc-500">• {article.time}</span>
            <span className="text-zinc-500">• 5 min lectura</span>
          </div>

          <h1 className="text-2xl font-bold leading-tight text-white mb-6">
            {article.title}
          </h1>

          {/* Long article content */}
          <div className="text-zinc-200 leading-relaxed mb-10 text-[15px] space-y-6">
            <p>El gobernador de Puerto Rico, junto a su equipo de seguridad, anunció esta mañana un ambicioso plan integral para combatir la ola de criminalidad que afecta principalmente a las áreas metropolitanas de San Juan, Bayamón y Carolina.</p>
            
            <p>El plan incluye la instalación inmediata de más de 500 nuevas cámaras de vigilancia de alta definición con reconocimiento facial, el aumento de 300 agentes en patrullaje nocturno y la creación de una unidad especial contra el crimen organizado.</p>
            
            <p>“No podemos seguir permitiendo que nuestras familias vivan con miedo. Hoy comenzamos una nueva etapa donde la seguridad será prioridad número uno”, declaró el gobernador durante la rueda de prensa celebrada en La Fortaleza.</p>
            
            <p>Según datos preliminares del Negociado de la Policía, los delitos violentos han aumentado un 18% en los últimos 12 meses. Las comunidades más afectadas han sido residenciales como Monte Hatillo, Villa Palmeras y sectores de Cataño.</p>
            
            <p>El plan también contempla mayor colaboración con agencias federales, incluyendo la DEA y el FBI, para desmantelar redes de narcotráfico que operan en la isla. Se espera que los primeros resultados visibles se vean dentro de los próximos 90 días.</p>
            
            <p>Por su parte, líderes comunitarios han recibido la noticia con cautela. “Esperamos que no sea solo otro anuncio. Queremos ver acción real en las calles”, comentó doña Carmen López, residente de Bayamón desde hace 45 años.</p>
            
            <p>El costo estimado del plan asciende a $45 millones, fondos que provendrán de una combinación de presupuesto estatal y asignaciones federales. La oposición ha criticado la medida por considerarla “insuficiente” y ha pedido un debate más amplio en la Asamblea Legislativa.</p>
            
            <p>Este anuncio ocurre justo una semana después del trágico asesinato de un joven de 19 años en una gasolinera de Río Piedras, caso que generó gran indignación en las redes sociales y motivó múltiples protestas pacíficas en diferentes pueblos.</p>
            
            <p>¿Qué opinas tú? ¿Crees que este plan será suficiente para mejorar la seguridad en Puerto Rico?</p>
          </div>

          {/* Reaction Pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {Object.entries(article.reactions).map(([emoji, count]) => 
              count > 0 && (
                <div 
                  key={emoji} 
                  onClick={() => addReaction(emoji)}
                  className="bg-zinc-800 hover:bg-zinc-700 px-4 py-1.5 rounded-full text-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {emoji} <span className="text-sm text-zinc-400">{count}</span>
                </div>
              )
            )}
          </div>

          {/* Action Bar - Clean & Small Icons */}
          <div className="flex items-center justify-between text-zinc-400 border-t border-zinc-800 pt-6">
            <div className="flex gap-8">
              <button 
                onClick={() => handleVote("up")} 
                className={`flex items-center gap-1.5 hover:text-white transition-colors ${article.userVote === "up" ? "text-pr-red" : ""}`}
              >
                <ThumbsUp className={`w-5 h-5 ${article.userVote === "up" ? "fill-pr-red text-pr-red" : ""}`} />
                <span className="text-sm">{article.likes}</span>
              </button>

              <button 
                onClick={() => handleVote("down")} 
                className={`flex items-center gap-1.5 hover:text-white transition-colors ${article.userVote === "down" ? "text-red-500" : ""}`}
              >
                <ThumbsDown className={`w-5 h-5 ${article.userVote === "down" ? "fill-red-500 text-red-500" : ""}`} />
                <span className="text-sm">{article.dislikes}</span>
              </button>

              <button 
                onClick={() => setShowComments(true)} 
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{article.comments}</span>
              </button>
            </div>

            <button 
              onClick={() => setOpenEmojiPicker(!openEmojiPicker)} 
              className="hover:text-white transition-colors p-1"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Emoji Picker */}
      {openEmojiPicker && (
        <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-4 z-50">
          <div className="bg-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-wrap gap-5 text-4xl justify-center">
            {emojis.map(emoji => (
              <button
                key={emoji}
                onClick={() => addReaction(emoji)}
                className="hover:scale-125 active:scale-90 transition-transform p-2"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comments Bottom Sheet */}
      {showComments && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="bg-zinc-900 w-full max-w-md mx-auto rounded-t-3xl max-h-[85vh] flex flex-col">
            <div className="p-4 border-b border-zinc-700 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Comentarios ({comments.length})</h3>
              <button onClick={() => setShowComments(false)} className="text-zinc-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-9 h-9 bg-zinc-700 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{comment.username}</span>
                      <span className="text-xs text-zinc-500">{comment.time}</span>
                    </div>
                    <p className="text-zinc-200 mt-1 text-[15px]">{comment.text}</p>
                    <div className="flex items-center gap-5 mt-2 text-xs">
                      <button 
                        onClick={() => toggleCommentLike(comment.id)}
                        className={`flex items-center gap-1 ${comment.liked ? "text-red-500" : "hover:text-white"}`}
                      >
                        <Heart className={`w-4 h-4 ${comment.liked ? "fill-current" : ""}`} />
                        <span>{comment.likes}</span>
                      </button>
                      <button className="hover:text-white">Responder</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-zinc-700 bg-zinc-900 absolute bottom-0 left-0 right-0 max-w-md mx-auto">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe un comentario..."
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-5 py-3 text-sm placeholder-zinc-500 focus:outline-none"
                  onKeyDown={(e) => e.key === "Enter" && postComment()}
                />
                <button 
                  onClick={postComment}
                  disabled={!newComment.trim()}
                  className="text-pr-red font-medium disabled:opacity-50 px-2"
                >
                  Publicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}