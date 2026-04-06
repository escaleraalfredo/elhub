// app/comunidad/pueblos/[slug]/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, MessageCircle, ChevronLeft, Users, Search, X } from "lucide-react";
import { useGamification } from "@/lib/gamificationContext";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import UnifiedCard from "@/components/UnifiedCard";
import UnifiedFAB from "@/components/UnifiedFAB";

export default function PuebloCommunityPage() {
  const params = useParams();
  const router = useRouter();
  const { addPoints } = useGamification();
  const slug = params.slug as string;

  const puebloData = {
    "san-juan": { name: "San Juan", peopleHere: 124 },
    "santurce": { name: "Santurce", peopleHere: 87 },
    "luquillo": { name: "Luquillo", peopleHere: 56 },
    "pinones": { name: "Piñones", peopleHere: 64 },
    "bayamon": { name: "Bayamón", peopleHere: 42 },
    "ponce": { name: "Ponce", peopleHere: 38 },
  }[slug] || { name: "Pueblo", peopleHere: 0 };

  const [topics, setTopics] = useState([
    { id: 1, title: "¿Qué opinan del nuevo mural en la Placita?", username: "@santurcevibes", votes: 67, userVote: null as "up" | "down" | null, comments: 24, time: "1h" },
    { id: 2, title: "Recomienden un buen spot para ver el atardecer", username: "@playero_pr", votes: 45, userVote: "up" as "up" | "down" | null, comments: 18, time: "3h" },
    { id: 3, title: "Tráfico brutal hoy 😩", username: "@local", votes: 92, userVote: null as "up" | "down" | null, comments: 31, time: "6h" },
  ]);

  const [activeFilter, setActiveFilter] = useState<"New" | "Hot" | "Top">("New");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [compactHeader, setCompactHeader] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: "" });

  // 🔥 SCROLL LOGIC (snap + blur)
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const update = () => {
      const currentY = window.scrollY;

      setScrollY(currentY);

      if (currentY > 60 && currentY > lastScrollY) {
        setCompactHeader(true);
      } else if (currentY < lastScrollY - 10) {
        setCompactHeader(false);
      }

      lastScrollY = currentY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔥 Dynamic blur & opacity
  const blur = Math.min(scrollY / 20, 20);
  const opacity = Math.min(0.6 + scrollY / 300, 0.95);

  const filteredTopics = useMemo(() => {
    let result = [...topics];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.username.toLowerCase().includes(q)
      );
    }

    if (activeFilter === "Hot") {
      result.sort((a, b) => (b.comments + b.votes) - (a.comments + a.votes));
    } else if (activeFilter === "Top") {
      result.sort((a, b) => b.votes - a.votes);
    }

    return result;
  }, [topics, searchQuery, activeFilter]);

  const handleVote = (topicId: number, direction: "up" | "down") => {
    setTopics(prev => prev.map(topic => {
      if (topic.id !== topicId) return topic;

      let votes = topic.votes;
      let userVote = topic.userVote;

      if (userVote === direction) {
        votes += direction === "up" ? -1 : 1;
        userVote = null;
      } else {
        if (userVote === "up") votes--;
        if (userVote === "down") votes++;
        votes += direction === "up" ? 1 : -1;
        userVote = direction;

        addPoints(3, "vote");
        toast.success("+3 pts");
      }

      return { ...topic, votes: Math.max(0, votes), userVote };
    }));
  };

  const openTopic = (topic: any) => {
    router.push(`/comunidad/pueblos/${slug}/tema/${topic.id}`);
  };

  return (
    <div className="min-h-screen bg-dark-bg pb-20">

      {/* 🔥 NEXT-LEVEL HEADER */}
      <div className="sticky top-0 z-50">
        <div
          style={{
            backdropFilter: `blur(${blur}px)`,
            backgroundColor: `rgba(24,24,27,${opacity})`,
          }}
          className={`border-b border-zinc-800 transition-all duration-300 ${
            compactHeader ? "py-1" : "py-2"
          }`}
        >
          <div className="max-w-md mx-auto px-3 flex items-center gap-2">

            <button onClick={() => router.back()}>
              <ChevronLeft className={`${compactHeader ? "w-4 h-4" : "w-5 h-5"}`} />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className={`truncate font-semibold ${
                compactHeader ? "text-xs" : "text-sm"
              }`}>
                {puebloData.name}
              </h1>

              {!compactHeader && (
                <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <Users className="w-3 h-3" /> {puebloData.peopleHere}
                </p>
              )}
            </div>

            {/* Filters (HIDE when compact) */}
            {!compactHeader && (
              <div className="flex gap-1">
                {["New", "Hot", "Top"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f as any)}
                    className={`px-2 py-0.5 text-[10px] rounded-full border ${
                      activeFilter === f
                        ? "bg-pr-red text-white border-pr-red"
                        : "bg-zinc-900 border-zinc-700 text-zinc-400"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}

            <button onClick={() => setShowSearch(!showSearch)}>
              <Search className={`${compactHeader ? "w-3 h-3" : "w-4 h-4"}`} />
            </button>
          </div>

          {/* Search */}
          {!compactHeader && showSearch && (
            <div className="px-3 pb-2">
              <div className="relative">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-2 pl-9 pr-9 text-xs text-white"
                />
                <Search className="absolute left-2 top-2 w-4 h-4 text-zinc-500" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-2 top-2">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Topics */}
      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {filteredTopics.map((topic) => (
          <UnifiedCard key={topic.id} onClick={() => openTopic(topic)}>
            <div className="flex">
              <div className="w-12 flex flex-col items-center py-3 border-r border-zinc-800">
                <button onClick={(e) => { e.stopPropagation(); handleVote(topic.id, "up"); }}>
                  <ArrowUp className="w-5 h-5" />
                </button>
                <div className="text-sm font-bold">{topic.votes}</div>
                <button onClick={(e) => { e.stopPropagation(); handleVote(topic.id, "down"); }}>
                  <ArrowDown className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 p-4">
                <div className="text-xs text-zinc-500 mb-1">
                  {topic.username} · {topic.time}
                </div>
                <h3 className="text-sm font-medium mb-2">{topic.title}</h3>
                <div className="text-xs text-zinc-400 flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {topic.comments}
                </div>
              </div>
            </div>
          </UnifiedCard>
        ))}
      </div>

      <UnifiedFAB onClick={() => setShowNewTopicModal(true)} />
      <BottomNav />
    </div>
  );
}