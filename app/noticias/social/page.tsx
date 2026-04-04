"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Heart, MessageCircle, Repeat2, Bookmark, Smile, ChevronDown 
} from "lucide-react";
import { useGamification } from "@/lib/gamificationContext";

export default function NoticiasSocialPage() {
  const { addPoints } = useGamification();

  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("Todos");

  // Real X posts about Puerto Rico (boricua vibe)
  const [socialPosts, setSocialPosts] = useState([
    {
      id: "x2040148930973810902",
      user: "Elfandel3023",
      avatar: "https://pbs.twimg.com/profile_images/1945150323401605120/jozW2NdC.jpg",
      username: "@Elfandel3023",
      content: "Usted sabra más que yo porque usted es bori. Pero yo vi una vez un juego de Puerto Rico en YouTube por la pagina oficial de la liga y el directo llegó apenas a 1k espectadores y era como de round robin el juego. En cambio el BSN es una liga que tiene numeros de audiencias altos",
      image: null,
      likes: 12,
      comments: 3,
      reposts: 1,
      timestamp: "hace 1m",
      userLiked: false,
    },
    {
      id: "x2040148848815865968",
      user: "SDrizin",
      avatar: "https://pbs.twimg.com/profile_images/1112660072591773696/MO5iGYT1.png",
      username: "@SDrizin",
      content: "Puerto Rico steps up to protect youthful suspects by requiring that their interrogations be recorded. Governor signs law requiring recorded interrogations of minors.",
      image: null,
      likes: 45,
      comments: 8,
      reposts: 12,
      timestamp: "hace 2m",
      userLiked: false,
    },
    {
      id: "x2040148836920828128",
      user: "dps6189",
      avatar: "https://pbs.twimg.com/profile_images/1985774622915149824/MiRFSVJ-.jpg",
      username: "@dps6189",
      content: "Someone tell him that i hope at some point soon we give Puerto Rico independence, i have Puertorican blood and i grew up there, but it’s totally corrupt. The fraud is massive, and most people vote democrat. I say cut the island loose.",
      image: null,
      likes: 19,
      comments: 14,
      reposts: 5,
      timestamp: "hace 3m",
      userLiked: false,
    },
    {
      id: "x2040148592019554797",
      user: "CBS12",
      avatar: "https://pbs.twimg.com/profile_images/963903623322247169/zuS5gTwx.jpg",
      username: "@CBS12",
      content: "WATER RESCUE | A rescue operation was launched after a vessel carrying federal agents capsized off the Puerto Rico coast.",
      image: null,
      likes: 67,
      comments: 11,
      reposts: 22,
      timestamp: "hace 4m",
      userLiked: false,
    },
  ]);

  const filters = ["Todos", "Cerca de ti", "Siguiendo", "Trending"];

  const handleLike = (id: string) => {
    setSocialPosts(prev =>
      prev.map(post => {
        if (post.id === id) {
          const newLiked = !post.userLiked;
          if (newLiked) addPoints(3, "Social like");
          return {
            ...post,
            likes: newLiked ? post.likes + 1 : Math.max(0, post.likes - 1),
            userLiked: newLiked
          };
        }
        return post;
      })
    );
  };

  const handleComment = (id: string) => {
    addPoints(2, "Social comment");
    alert("💬 Abre hilo de comentarios (X style) – coming soon");
  };

  const handleRepost = (id: string) => {
    addPoints(5, "Social repost");
    alert("🔁 Reposteado +5 puntos 🔥");
  };

  return (
    <div className="min-h-screen bg-[#09090b] pb-20">

      {/* Sticky Header - Minimal & Subliminal Filter */}
      <div className="sticky top-[57px] bg-zinc-950 border-b border-zinc-800 z-40">
        <div className="max-w-md mx-auto px-4 py-3">

          {/* Tab Bar */}
          <div className="flex border-b border-zinc-800">
            <Link 
              href="/noticias" 
              className="flex-1 text-center py-3 font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Noticias
            </Link>
            <Link 
              href="/noticias/social" 
              className="flex-1 text-center py-3 font-medium text-white border-b-2 border-pr-red"
            >
              Social
            </Link>
          </div>

          {/* Minimal Filter Row - Subliminal */}
          <div className="flex items-center justify-end mt-3 pr-1">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm"
            >
              <span className="font-medium">{activeFilter}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Dropdown */}
        {showFilters && (
          <div className="max-w-md mx-auto px-4 pb-3">
            <div className="bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl py-1 max-h-[300px] overflow-y-auto">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setActiveFilter(f);
                    setShowFilters(false);
                  }}
                  className={`w-full text-left px-5 py-3 text-sm hover:bg-zinc-800 transition-all flex justify-between items-center ${
                    activeFilter === f
                      ? "text-pr-red font-medium bg-zinc-800/50"
                      : "text-zinc-300"
                  }`}
                >
                  {f}
                  {activeFilter === f && <span className="text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {socialPosts.map((post) => (
          <div 
            key={post.id} 
            className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-zinc-700 transition-colors"
          >
            {/* User Header */}
            <div className="flex items-center gap-3 p-4">
              <img 
                src={post.avatar} 
                alt={post.user} 
                className="w-11 h-11 rounded-full object-cover border-2 border-zinc-700" 
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-[15px]">{post.user}</div>
                <div className="text-zinc-500 text-sm">{post.username} · {post.timestamp}</div>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-4">
              <p className="text-zinc-200 leading-relaxed text-[15px] whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {/* Actions */}
            <div className="border-t border-zinc-800 px-5 py-3 flex justify-between text-zinc-400">
              <button 
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-1.5 transition-all ${post.userLiked ? "text-pr-red scale-105" : "hover:text-zinc-200"}`}
              >
                <Heart className={`w-5 h-5 ${post.userLiked ? "fill-current" : ""}`} />
                <span className="text-sm tabular-nums">{post.likes}</span>
              </button>

              <button 
                onClick={() => handleComment(post.id)}
                className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm tabular-nums">{post.comments}</span>
              </button>

              <button 
                onClick={() => handleRepost(post.id)}
                className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors"
              >
                <Repeat2 className="w-5 h-5" />
                <span className="text-sm tabular-nums">{post.reposts}</span>
              </button>

              <button className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors">
                <Bookmark className="w-5 h-5" />
              </button>

              <button className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors">
                <Smile className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}