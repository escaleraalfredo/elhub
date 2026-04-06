"use client";

import { useState, useEffect, useMemo } from "react";
import { MessageCircle, MapPin, Flame } from "lucide-react";
import { useGamification } from "@/lib/gamificationContext";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import UnifiedCard from "@/components/UnifiedCard";

export default function PueblosPage() {
  const router = useRouter();
  const { addPoints } = useGamification();

  const [userTown, setUserTown] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    "Nearby" | "Engaged" | "Chats" | "Popular"
  >("Nearby");

  const [scrollY, setScrollY] = useState(0);
  const [compactHeader, setCompactHeader] = useState(false);

  const [pueblos, setPueblos] = useState([
    { name: "San Juan", slug: "san-juan", location: "Metro", peopleHere: 142, activeChats: 24, emoji: "🌆" },
    { name: "Bayamón", slug: "bayamon", location: "Metro", peopleHere: 68, activeChats: 12, emoji: "🏙️" },
    { name: "Carolina", slug: "carolina", location: "Metro", peopleHere: 51, activeChats: 9, emoji: "🏖️" },
    { name: "Guaynabo", slug: "guaynabo", location: "Metro", peopleHere: 47, activeChats: 8, emoji: "🌳" },
    { name: "Caguas", slug: "caguas", location: "Metro", peopleHere: 39, activeChats: 11, emoji: "🏞️" },
    { name: "Luquillo", slug: "luquillo", location: "Este", peopleHere: 78, activeChats: 14, emoji: "🏄" },
    { name: "Loíza", slug: "loiza", location: "Este", peopleHere: 64, activeChats: 9, emoji: "🎉" },
    { name: "Aguadilla", slug: "aguadilla", location: "Oeste", peopleHere: 61, activeChats: 10, emoji: "🛫" },
    { name: "Rincón", slug: "rincon", location: "Oeste", peopleHere: 44, activeChats: 15, emoji: "🌊" },
    { name: "Ponce", slug: "ponce", location: "Sur", peopleHere: 71, activeChats: 18, emoji: "🎭" },
  ]);

  // 📍 Detect user town (mock for now)
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      () => setUserTown("San Juan"),
      () => setUserTown(null)
    );
  }, []);

  // 🔥 Scroll behavior
  useEffect(() => {
    let last = window.scrollY;

    const onScroll = () => {
      const current = window.scrollY;
      setScrollY(current);

      if (current > 60 && current > last) setCompactHeader(true);
      else if (current < last - 10) setCompactHeader(false);

      last = current;
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const blur = Math.min(scrollY / 20, 20);
  const opacity = Math.min(0.6 + scrollY / 300, 0.95);

  // 🔥 FILTER LOGIC
  const sortedPueblos = useMemo(() => {
    let list = [...pueblos];

    switch (activeFilter) {
      case "Engaged":
        list.sort((a, b) => (b.peopleHere + b.activeChats) - (a.peopleHere + a.activeChats));
        break;
      case "Chats":
        list.sort((a, b) => b.activeChats - a.activeChats);
        break;
      case "Popular":
        list.sort((a, b) => b.peopleHere - a.peopleHere);
        break;
      case "Nearby":
      default:
        list.sort((a, b) => {
          if (a.name === userTown) return -1;
          if (b.name === userTown) return 1;
          return (b.peopleHere + b.activeChats) - (a.peopleHere + a.activeChats);
        });
    }

    return list;
  }, [pueblos, activeFilter, userTown]);

  const openPueblo = (slug: string) => {
    router.push(`/comunidad/pueblos/${slug}`);
  };

  return (
    <div className="min-h-screen bg-dark-bg pb-20">

      {/* HEADER */}
      <div className="sticky top-[57px] z-50">
        <div
          style={{
            backdropFilter: `blur(${blur}px)`,
            backgroundColor: `rgba(24,24,27,${opacity})`,
          }}
          className={`border-b border-zinc-800 transition-all ${
            compactHeader ? "py-2" : "py-3"
          }`}
        >
          <div className="max-w-md mx-auto px-3">

            <h1 className={`${compactHeader ? "text-lg" : "text-xl"} font-bold`}>
              Comunidad
            </h1>

            {/* FILTERS */}
            {!compactHeader && (
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {["Nearby", "Engaged", "Chats", "Popular"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f as any)}
                    className={`px-3 py-1 text-xs rounded-full border whitespace-nowrap ${
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
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="max-w-md mx-auto px-3 py-3 space-y-3">
        {sortedPueblos.map((p) => {
          const isUserTown = p.name === userTown;

          return (
            <UnifiedCard
              key={p.slug}
              onClick={() => openPueblo(p.slug)}
              className={`cursor-pointer ${
                isUserTown ? "border border-pr-red" : ""
              }`}
            >
              <div className="flex items-center gap-3 p-3">

                <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center text-2xl">
                  {p.emoji}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{p.name}</h3>
                    {isUserTown && (
                      <span className="text-[10px] bg-pr-red px-2 py-0.5 rounded-full">
                        Cerca
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-zinc-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {p.location}
                  </div>

                  <div className="flex gap-3 text-xs mt-2">
                    <span className="text-pr-red flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {p.peopleHere}
                    </span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {p.activeChats}
                    </span>
                  </div>
                </div>
              </div>
            </UnifiedCard>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}