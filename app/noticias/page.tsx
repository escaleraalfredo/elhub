// app/noticias/page.tsx
"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Heart,
  Share2,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { useGamification } from "@/lib/gamificationContext";
import { useNews } from "@/lib/newsContext";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

interface Tweet {
  id: string;
  username: string;
  handle: string;
  avatar: string;
  time: string;
  text: string;
  likes: number;
  comments: number;
  image?: string;
  liked?: boolean;
}

type NewsItem = ReturnType<typeof useNews>["news"][number];
type FeedItem = (NewsItem & { type: "news" }) | (Tweet & { type: "tweet" });

export default function NoticiasPage() {
  const { addPoints } = useGamification();
  const { news, updateNews } = useNews();

  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [tweetOffset, setTweetOffset] = useState(0);

  // Search with smooth iOS-style animation
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Pull-to-refresh
  const [pullY, setPullY] = useState(0);
  const isPulling = useRef(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Full tweets pool - 20 tweets reales para infinite scroll
  const allTweetsPool: Tweet[] = [
    {
      id: "2040233986606162150",
      username: "Moongazer",
      handle: "@joeybeastmarket",
      avatar: "https://pbs.twimg.com/profile_images/1996309187022725120/TuiUS9NL.jpg",
      time: "2h",
      text: "I asked my uber driver in Puerto Rico to put on his favorite bad bunny song and he immediately waived the entire fee for the 65 minute drive 😂🇵🇷",
      likes: 96,
      comments: 2,
      liked: false,
    },
    {
      id: "2040207136588706145",
      username: "WrestlingBizwithAndiz",
      handle: "@WrestleconAndiz",
      avatar: "https://pbs.twimg.com/profile_images/2037357202206498816/X2PthPN1.jpg",
      time: "4h",
      text: "Bad Bunny is the greatest celebrity wrestler no doubt about it. DE PUERTO RICO MF🇵🇷🐐 #badbunny #WrestleMania42",
      likes: 2,
      comments: 0,
      image: "https://pbs.twimg.com/media/HFBFkvxW4AAVB1z.jpg",
      liked: false,
    },
    {
      id: "2040299516306301345",
      username: "AllQuakes - EMSC",
      handle: "@EMSC",
      avatar: "https://pbs.twimg.com/profile_images/669527063951482881/xz1X8uwO.png",
      time: "12m",
      text: "🔔#Earthquake (#sismo) M3.2 strikes 126 km NE of #Fajardo (Puerto Rico) 30 min ago.",
      likes: 12,
      comments: 3,
      liked: false,
    },
    {
      id: "2040296069058150506",
      username: "YBTO",
      handle: "@YolyBTO",
      avatar: "https://picsum.photos/id/1015/128/128",
      time: "45m",
      text: "Esto es Puerto Rico 🇵🇷🙏🏼🌴",
      likes: 45,
      comments: 7,
      image: "https://picsum.photos/id/1015/600/400",
      liked: false,
    },
    {
      id: "2040182345678901234",
      username: "PRDaily",
      handle: "@PRDailyNews",
      avatar: "https://picsum.photos/id/201/128/128",
      time: "7h",
      text: "El gobernador anuncia nueva inversión en infraestructura turística en el Viejo San Juan 🏛️🇵🇷",
      likes: 134,
      comments: 18,
      liked: false,
    },
    {
      id: "2040156789012345678",
      username: "MofongoLover",
      handle: "@ComidaPR",
      avatar: "https://picsum.photos/id/292/128/128",
      time: "11h",
      text: "El mejor mofongo de Puerto Rico está en Ponce. Change my mind 🍌🇵🇷",
      likes: 67,
      comments: 24,
      image: "https://picsum.photos/id/312/600/400",
      liked: false,
    },
    {
      id: "2040123456789012345",
      username: "SurfPR",
      handle: "@RinconSurf",
      avatar: "https://picsum.photos/id/1016/128/128",
      time: "1d",
      text: "Las olas hoy en Rincón están de otro nivel 🌊🔥 #PuertoRico",
      likes: 89,
      comments: 12,
      liked: false,
    },
    {
      id: "2040098765432109876",
      username: "BadBunnyFanClub",
      handle: "@BenitoLovers",
      avatar: "https://picsum.photos/id/64/128/128",
      time: "1d",
      text: "Bad Bunny confirma que su próximo álbum tendrá fuertes influencias de la bomba y plena 🇵🇷🎵",
      likes: 312,
      comments: 45,
      liked: false,
    },
    {
      id: "2040065432109876543",
      username: "ElCoqui",
      handle: "@CoquiPR",
      avatar: "https://picsum.photos/id/133/128/128",
      time: "2d",
      text: "Atardecer en Culebra que te roba el alma 🌅",
      likes: 245,
      comments: 31,
      image: "https://picsum.photos/id/1015/600/400",
      liked: false,
    },
    {
      id: "2040032109876543210",
      username: "ViejoSanJuan",
      handle: "@OldSanJuanPR",
      avatar: "https://picsum.photos/id/160/128/128",
      time: "2d",
      text: "Las calles del Viejo San Juan nunca duermen. Noche perfecta para un paseo 🇵🇷",
      likes: 156,
      comments: 22,
      liked: false,
    },
    {
      id: "2039998765432109876",
      username: "PRMusicScene",
      handle: "@PRMusic",
      avatar: "https://picsum.photos/id/201/128/128",
      time: "3d",
      text: "¿Cuál es tu canción favorita de Bad Bunny este año? La mía sigue siendo Tití Me Preguntó 🔥",
      likes: 78,
      comments: 19,
      liked: false,
    },
    {
      id: "2039954321098765432",
      username: "PlayaLoversPR",
      handle: "@PlayasPR",
      avatar: "https://picsum.photos/id/312/128/128",
      time: "3d",
      text: "Flamenco Beach en Culebra sigue siendo la más hermosa del Caribe 🌊🇵🇷",
      likes: 289,
      comments: 37,
      image: "https://picsum.photos/id/1015/600/400",
      liked: false,
    },
    {
      id: "2039912345678901234",
      username: "PRFoodies",
      handle: "@PRFoodies",
      avatar: "https://picsum.photos/id/292/128/128",
      time: "4d",
      text: "El alcapurria más crujiente de toda la isla está en Luquillo 🌴🍤",
      likes: 112,
      comments: 15,
      liked: false,
    },
    {
      id: "2039876543210987654",
      username: "BadBunnyUpdates",
      handle: "@BBunnyNews",
      avatar: "https://picsum.photos/id/1005/128/128",
      time: "4d",
      text: "Rumores de que Bad Bunny se presentará en el Coliseo de Puerto Rico este verano. ¿Quién va? 🐰",
      likes: 421,
      comments: 68,
      liked: false,
    },
    {
      id: "2039832109876543210",
      username: "PRNature",
      handle: "@PRNatureLovers",
      avatar: "https://picsum.photos/id/133/128/128",
      time: "5d",
      text: "El Bosque Nacional El Yunque después de la lluvia es mágico 🌧️🇵🇷",
      likes: 198,
      comments: 24,
      liked: false,
    },
    {
      id: "2039798765432109876",
      username: "SanJuanVibes",
      handle: "@SanJuanLife",
      avatar: "https://picsum.photos/id/160/128/128",
      time: "5d",
      text: "La vista desde el Morro al atardecer nunca decepciona 🌅",
      likes: 267,
      comments: 41,
      image: "https://picsum.photos/id/1016/600/400",
      liked: false,
    },
    {
      id: "2039754321098765432",
      username: "PRSports",
      handle: "@PRSportsTalk",
      avatar: "https://picsum.photos/id/201/128/128",
      time: "6d",
      text: "Los Cangrejeros de Santurce siguen dominando la liga. ¡Vamos PR! ⚾🇵🇷",
      likes: 89,
      comments: 14,
      liked: false,
    },
    {
      id: "2039712345678901234",
      username: "PuertoRicoNow",
      handle: "@PRNow",
      avatar: "https://picsum.photos/id/64/128/128",
      time: "7d",
      text: "Nuevo récord de turistas en Puerto Rico este mes. El Caribe está en auge 🌴",
      likes: 156,
      comments: 29,
      liked: false,
    },
    {
      id: "2039676543210987654",
      username: "BombaPlenaPR",
      handle: "@BombaPlena",
      avatar: "https://picsum.photos/id/133/128/128",
      time: "8d",
      text: "La tradición de la bomba y plena sigue viva en Loíza. Cultura pura 🇵🇷",
      likes: 203,
      comments: 33,
      liked: false,
    },
    {
      id: "2039632109876543210",
      username: "ElYunqueHiker",
      handle: "@ElYunqueHikes",
      avatar: "https://picsum.photos/id/312/128/128",
      time: "9d",
      text: "La Mina Trail después de la lluvia es espectacular. No se lo pierdan 🇵🇷",
      likes: 134,
      comments: 18,
      liked: false,
    },
  ];

  const TWEETS_PER_LOAD = 6;

  // Load initial tweets
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const initial = allTweetsPool.slice(0, 12);
      setTweets(initial);
      setTweetOffset(12);
      setLoading(false);
    }, 400);
  }, []);

  // Load more tweets (infinite scroll)
  const loadMoreTweets = useCallback(() => {
    if (loadingMore || !hasMore || searchQuery.trim()) return;

    setLoadingMore(true);
    setTimeout(() => {
      const nextBatch = allTweetsPool.slice(tweetOffset, tweetOffset + TWEETS_PER_LOAD);
      if (nextBatch.length > 0) {
        setTweets((prev) => [...prev, ...nextBatch]);
        setTweetOffset((prev) => prev + nextBatch.length);
      }
      if (tweetOffset + nextBatch.length >= allTweetsPool.length) {
        setHasMore(false);
      }
      setLoadingMore(false);
    }, 850);
  }, [tweetOffset, loadingMore, hasMore, searchQuery]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading && !searchQuery.trim()) {
          loadMoreTweets();
        }
      },
      {
        root: containerRef.current,
        rootMargin: "400px 0px",
        threshold: 0.1,
      }
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMoreTweets, hasMore, loadingMore, loading, searchQuery]);

  // Filtered tweets for search
  const filteredTweets = useMemo(() => {
    if (!searchQuery.trim()) return tweets;
    const q = searchQuery.toLowerCase().trim();
    return tweets.filter((tweet) =>
      tweet.text.toLowerCase().includes(q) ||
      tweet.username.toLowerCase().includes(q) ||
      tweet.handle.toLowerCase().includes(q)
    );
  }, [tweets, searchQuery]);

  // Combine News + Tweets and sort
  const combineFeed = useCallback(() => {
    const newsFeed: FeedItem[] = news.map((item) => ({ ...item, type: "news" }));
    const tweetFeed: FeedItem[] = filteredTweets.map((t) => ({ ...t, type: "tweet" }));

    const combined = [...newsFeed, ...tweetFeed].sort((a, b) => {
      const engagement = (item: FeedItem) =>
        item.type === "news"
          ? item.likes + item.dislikes + Object.values(item.reactions).reduce((a, b) => a + b, 0)
          : item.likes + item.comments;

      const timeScore = (item: FeedItem) => {
        if (item.type !== "tweet") return 0;
        let hours = 0;
        const match = item.time.match(/\d+/);
        if (match) hours = parseInt(match[0]);
        if (item.time.includes("d")) hours *= 24;
        return Math.max(0, 72 - hours) * 3;
      };

      return engagement(b) + timeScore(b) - (engagement(a) + timeScore(a));
    });

    setFeed(combined);
  }, [news, filteredTweets]);

  useEffect(() => {
    combineFeed();
  }, [combineFeed]);

  // Smooth Search Animations (iOS feel)
  const openSearch = () => {
    setShowSearch(true);
    setTimeout(() => searchInputRef.current?.focus(), 80);
  };

  const closeSearch = () => {
    setSearchQuery("");
    setShowSearch(false);
  };

  // Close search with Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showSearch) closeSearch();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showSearch]);

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (containerRef.current && containerRef.current.scrollTop <= 10) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isPulling.current) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) setPullY(Math.min(Math.pow(diff, 0.75), 160));
  };

  const handleTouchEnd = () => {
    if (!isPulling.current) return;
    isPulling.current = false;
    if (pullY > 110) {
      const newTweet: Tweet = {
        id: Date.now().toString(),
        username: "ElHub Puerto Rico",
        handle: "@elhubpr",
        avatar: "https://picsum.photos/id/64/128/128",
        time: "ahora",
        text: "¡Nuevo! Bad Bunny anuncia concierto sorpresa en el Coliseo este verano 🇵🇷🔥",
        likes: 0,
        comments: 0,
        liked: false,
      };
      setTweets((prev) => [newTweet, ...prev]);
      toast.success("¡Nuevo contenido de Puerto Rico cargado!");
    }
    setPullY(0);
  };

  // Actions
  const toggleLike = (tweetId: string) => {
    setTweets((prev) =>
      prev.map((t) =>
        t.id === tweetId
          ? {
              ...t,
              likes: t.liked ? Math.max(0, t.likes - 1) : t.likes + 1,
              liked: !t.liked,
            }
          : t
      )
    );
    addPoints(2, "Tweet like");
    toast.success("❤️ Me gusta +2 pts");
  };

  const handleShare = (tweetId: string) => {
    navigator.clipboard.writeText(`https://x.com/i/status/${tweetId}`);
    toast.success("Enlace copiado");
  };

  const handleVote = (id: string, vote: "up" | "down") => {
    updateNews(id, (item) => {
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
      addPoints(2, "News vote");
      return { ...item, likes: newLikes, dislikes: newDislikes, userVote: vote };
    });
  };

  const handleReaction = (id: string, emoji: string) => {
    updateNews(id, (item) => {
      const current = item.reactions[emoji] || 0;
      addPoints(1, "Emoji reaction");
      return { ...item, reactions: { ...item.reactions, [emoji]: current + 1 } };
    });
  };

  return (
    <div className="min-h-screen bg-dark-bg pb-20 ios-safe-area">
      {/* Header - iOS style */}
      <div className="sticky top-0 z-50 bg-dark-bg border-b border-zinc-800 px-5 py-3 flex items-center justify-between">
        <h1 className="text-[21px] font-semibold text-white tracking-tight">Explorar</h1>
        
        <button
          onClick={openSearch}
          className="p-2 -mr-2 text-zinc-400 active:text-white transition-colors"
        >
          <Search className="w-6 h-6" />
        </button>
      </div>

      {/* Animated Search Bar - iOS smooth animation */}
      <div
        className={`overflow-hidden bg-dark-bg border-b border-zinc-800 transition-all duration-300 ease-out ${
          showSearch 
            ? "max-h-20 opacity-100 translate-y-0" 
            : "max-h-0 opacity-0 -translate-y-2"
        }`}
      >
        <div className="px-4 py-3">
          <div className="relative flex items-center gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar tweets..."
                className="w-full bg-zinc-900 text-white pl-11 pr-12 py-[13px] rounded-2xl border border-zinc-700 focus:border-pr-red focus:outline-none text-[17px] placeholder:text-zinc-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-3.5 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <button
              onClick={closeSearch}
              className="text-pr-red font-medium text-[17px] px-4 py-2 active:opacity-70 transition-opacity"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {/* Main Scrollable Feed - Optimized for iOS */}
      <div
        ref={containerRef}
        className="max-w-md mx-auto overflow-y-auto h-[calc(100dvh-57px-80px)] scrollbar-hide pb-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${pullY}px)`,
          transition: isPulling.current ? "none" : "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        {/* Pull-to-refresh indicator */}
        <div className="sticky top-0 flex justify-center pt-6 pb-6 bg-dark-bg z-40">
          <Loader2 
            className="w-7 h-7 animate-spin text-pr-red" 
            style={{ opacity: pullY > 25 ? 1 : 0 }} 
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <Loader2 className="w-10 h-10 text-pr-red animate-spin mb-5" />
            <p className="text-zinc-500 text-[17px]">Cargando feed...</p>
          </div>
        ) : (
          <>
            {feed.length === 0 && searchQuery.trim() ? (
              <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                <Search className="w-16 h-16 text-zinc-600 mb-6" />
                <p className="text-zinc-400 text-[17px]">No se encontraron tweets</p>
                <p className="text-zinc-500 text-sm mt-1">Intenta con otra palabra</p>
              </div>
            ) : (
              feed.map((item) => (
                <div
                  key={item.id}
                  className="mx-3 mb-4 px-4 py-5 bg-zinc-950/70 backdrop-blur-sm rounded-3xl border border-zinc-800 hover:border-zinc-700 transition-all active:scale-[0.985]"
                >
                  {item.type === "news" ? (
                    <>
                      <Link href={`/noticias/${item.id}`} className="block">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-52 object-cover rounded-2xl mb-3"
                          />
                        )}
                        <h3 className="text-white font-semibold text-[17px] leading-tight mb-2">{item.title}</h3>
                        <p className="text-zinc-400 text-[15px] line-clamp-3 leading-relaxed">{item.excerpt}</p>
                      </Link>

                      <div className="flex gap-5 mt-4">
                        <button
                          onClick={() => handleVote(item.id, "up")}
                          className="flex items-center gap-1.5 text-zinc-400 hover:text-white active:scale-95 transition-transform"
                        >
                          <ThumbsUp className="w-5 h-5" /> {item.likes}
                        </button>
                        <button
                          onClick={() => handleVote(item.id, "down")}
                          className="flex items-center gap-1.5 text-zinc-400 hover:text-white active:scale-95 transition-transform"
                        >
                          <ThumbsDown className="w-5 h-5" /> {item.dislikes}
                        </button>
                        <button
                          onClick={() => toast.info("Comentarios pronto")}
                          className="flex items-center gap-1.5 text-zinc-400 hover:text-white active:scale-95 transition-transform"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex gap-2 mt-3 flex-wrap">
                        {Object.entries(item.reactions).map(([emoji, count]) =>
                          count > 0 && (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(item.id, emoji)}
                              className="bg-zinc-900 hover:bg-zinc-800 px-3 py-1 rounded-full text-sm transition-colors"
                            >
                              {emoji} {count}
                            </button>
                          )
                        )}
                      </div>
                    </>
                  ) : (
                    // Tweet
                    <div className="flex gap-3">
                      <img
                        src={item.avatar}
                        alt={item.username}
                        className="w-11 h-11 rounded-full object-cover flex-shrink-0 ring-1 ring-zinc-800"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="font-bold text-[15px] text-white">{item.username}</span>
                          <span className="text-zinc-500 text-[15px]">{item.handle}</span>
                          <span className="text-zinc-500 mx-1">·</span>
                          <span className="text-zinc-500 text-[15px]">{item.time}</span>
                        </div>
                        <p className="text-zinc-200 mt-1 text-[15px] leading-relaxed">{item.text}</p>
                        {item.image && (
                          <img
                            src={item.image}
                            alt="Tweet media"
                            className="w-full h-auto mt-3 rounded-2xl object-cover max-h-[380px] border border-zinc-800"
                          />
                        )}
                        <div className="flex gap-6 mt-4 text-zinc-500">
                          <button onClick={() => toast.info("Responder pronto")} className="flex items-center gap-1 active:opacity-70">
                            <MessageCircle className="w-4 h-4" /> {item.comments}
                          </button>
                          <button
                            onClick={() => toggleLike(item.id)}
                            className={`flex items-center gap-1 active:opacity-70 ${item.liked ? "text-red-500" : "hover:text-red-500"}`}
                          >
                            <Heart className="w-4 h-4" /> {item.likes}
                          </button>
                          <button
                            onClick={() => handleShare(item.id)}
                            className="flex items-center gap-1 hover:text-emerald-500 active:opacity-70"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Infinite Scroll Sentinel */}
            {!searchQuery.trim() && (
              <div ref={sentinelRef} className="py-12 flex justify-center">
                {loadingMore ? (
                  <div className="flex items-center gap-3 text-zinc-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Cargando más tweets...</span>
                  </div>
                ) : hasMore ? (
                  <div className="text-zinc-500 text-sm">Desliza hacia abajo para más contenido</div>
                ) : (
                  <div className="text-zinc-500 text-sm">🎉 Has llegado al final del feed</div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}